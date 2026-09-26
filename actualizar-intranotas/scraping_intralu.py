import base64
import logging
import os
import queue
import random
import threading
import time
import uuid
from collections import deque
from concurrent.futures import Future, ThreadPoolExecutor
from html.parser import HTMLParser
# datetime/timezone y Optional hoy solo los usa el código DESACTIVADO de
# "Recordar mi contraseña" — se dejan importados para reactivarlo fácil.
from datetime import datetime, timezone  # noqa: F401
from typing import List, Optional  # noqa: F401
from urllib.parse import unquote

import requests
# DESACTIVADO (sep 2026) — solo lo usaba "Recordar mi contraseña" (ver bloque de
# credenciales más abajo). Descomentar junto con ese bloque.
# from cryptography.fernet import Fernet, InvalidToken
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from pydantic import BaseModel, Field

app = FastAPI()

logger = logging.getLogger("recoleccion_notas")
logging.basicConfig(level=logging.INFO)

# --------------------------------------------------------------
# CORS: solo tu propio frontend puede llamar a este endpoint.
# --------------------------------------------------------------
ORIGENES_PERMITIDOS = [
    "http://localhost:4000",   # Jekyll en local
    "http://127.0.0.1:4000",
    "https://harrypc2023.github.io",  # tu dominio real de producción (confirmado: sin CNAME propio)
    # ⚠️ NO hace falta agregar una entrada aparte para /siga-multifacultad/:
    # el header Origin del navegador solo incluye esquema+host+puerto, sin
    # el path — "https://harrypc2023.github.io" ya cubre cualquier subcarpeta
    # (portal-siga, siga-multifacultad, la que sea).
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENES_PERMITIDOS,
    allow_credentials=False,
    # DESACTIVADO (sep 2026): DELETE solo lo usaba "Olvidar contraseña guardada".
    # Si se reactiva "Recordar mi contraseña", volver a agregarlo.
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# --------------------------------------------------------------
# FILA DE ESPERA PARA CHROMIUM (reemplaza al viejo "1 a la vez o
# rechazo"). Render (plan gratuito) da 512 MB de RAM y un Chromium usa
# varios cientos, así que sigue abriéndose UNO a la vez — pero desde sep
# 2026 Chromium se usa SOLO para el login (INTRALU y Matrícula), unos
# 10-15 s, y se cierra. Todo lo demás (cursos, notas, PDF, horarios) va
# por `requests`, sin navegador y en paralelo para todos. Quien llega
# mientras Chromium está ocupado ya no recibe un error: espera su turno
# en orden de llegada, y el frontend le muestra cuántos hay antes.
# --------------------------------------------------------------
_fila_chromium = []                 # tickets esperando, en orden de llegada
_fila_cond = threading.Condition()
_chromium_ocupado = False
ESPERA_MAXIMA_FILA_SEGUNDOS = 5 * 60


class _SyncCancelada(Exception):
    """El alumno presionó 'Cancelar' desde el frontend. Se revisa en la
    fila de espera y entre cada curso, para que cancelar corte rápido."""
    pass


class _FilaDemasiadoLarga(Exception):
    """Se esperó más de ESPERA_MAXIMA_FILA_SEGUNDOS sin llegar el turno."""
    pass


def _tomar_turno_chromium(ticket, al_cambiar_posicion=None, esta_cancelado=None,
                          espera_maxima=ESPERA_MAXIMA_FILA_SEGUNDOS):
    """Bloquea hasta que sea el turno de `ticket` de usar Chromium.
    `al_cambiar_posicion(n)` recibe cuántas personas hay antes (incluida
    la que está usando Chromium ahora). Siempre hay que llamar después a
    _soltar_turno_chromium() en un finally."""
    global _chromium_ocupado
    limite = time.time() + espera_maxima
    with _fila_cond:
        _fila_chromium.append(ticket)
        try:
            while True:
                if esta_cancelado and esta_cancelado():
                    raise _SyncCancelada()
                if _fila_chromium[0] == ticket and not _chromium_ocupado:
                    _fila_chromium.pop(0)
                    _chromium_ocupado = True
                    _fila_cond.notify_all()
                    return
                if al_cambiar_posicion:
                    delante = _fila_chromium.index(ticket) + (1 if _chromium_ocupado else 0)
                    al_cambiar_posicion(delante)
                restante = limite - time.time()
                if restante <= 0:
                    raise _FilaDemasiadoLarga()
                _fila_cond.wait(timeout=min(1.0, restante))
        except BaseException:
            if ticket in _fila_chromium:
                _fila_chromium.remove(ticket)
                _fila_cond.notify_all()
            raise


def _soltar_turno_chromium():
    global _chromium_ocupado
    with _fila_cond:
        _chromium_ocupado = False
        _fila_cond.notify_all()


# --------------------------------------------------------------
# TOPE PROPIO DE LOGINS A MATRÍCULA: su /api/login acepta 5 por minuto y
# todo apunta a que los cuenta por IP (confirmado con DevTools, sep 2026:
# también cuentan los logins correctos). Todos los alumnos de SIGA salen
# por la misma IP de Render, así que SIGA se pone su propio tope de 4 por
# minuto (1 de margen): nadie ve nunca el "Demasiados intentos" de la UNI.
# Se respeta el límite de la UNI; no se intenta esquivarlo.
# --------------------------------------------------------------
MAX_LOGINS_MATRICULA_POR_MINUTO = 4
_logins_matricula = deque()
_logins_matricula_lock = threading.Lock()


def _tomar_cupo_login_matricula():
    """Se llama YA con el turno de Chromium tomado, justo antes del login.
    NO espera (sep 2026): si hay cupo lo registra y devuelve 0; si ya hubo
    4 logins en el último minuto devuelve cuántos segundos faltan. Quien
    llama suelta el Chromium mientras espera, para no frenar a Intranotas
    (antes se dormía sosteniendo el turno y bloqueaba también a INTRALU).
    El registro se hace justo antes del login real, así el conteo de
    "4 por minuto" coincide con lo que ve Matrícula."""
    with _logins_matricula_lock:
        ahora = time.time()
        while _logins_matricula and ahora - _logins_matricula[0] >= 60:
            _logins_matricula.popleft()
        if len(_logins_matricula) < MAX_LOGINS_MATRICULA_POR_MINUTO:
            _logins_matricula.append(ahora)
            return 0
        return 60 - (ahora - _logins_matricula[0]) + 0.5


class LoginIntraluRequest(BaseModel):
    """Login de INTRALU: código+contraseña con automatización sigilosa
    (stealth) que sí logra pasar el reCAPTCHA — confirmado 20/20 en
    pruebas. El Avance Curricular se trae con este mismo login, sin un
    segundo reCAPTCHA.

    DESACTIVADO (sep 2026) — "Recordar mi contraseña": `password` vuelve
    a ser OBLIGATORIO (antes era opcional para poder usar la contraseña
    cifrada guardada) y el campo `recordar` se quitó. Para reactivar:
    devolver `password` a Optional[str] = Field(None, ...), restaurar
    `recordar: bool = Field(False, ...)` y descomentar los bloques
    DESACTIVADO de este archivo (credenciales, iniciar_sync,
    _ejecutar_sync y los 2 endpoints de credencial)."""
    codigo: str = Field(..., examples=["20231059E"], description="Tu código de estudiante UNI (el mismo de INTRALU).")
    password: str = Field(..., examples=["tu_contraseña_de_intralu"], description="Tu contraseña de INTRALU. Nunca se guarda.")
    user_id: str = Field(..., description="UUID del alumno en Supabase (auth.users.id).")
    # Desde sep 2026 se sincroniza TODO el historial de una vez (desde el
    # año de ingreso, que sale del código, hasta el periodo actual).
    # `omitir` son los periodos que SIGA ya tiene completos (cerrados y con
    # nota final): no se vuelven a pedir, así las siguientes
    # sincronizaciones solo traen lo nuevo. `periodo` queda por
    # compatibilidad: si viene, se sincroniza solo ese.
    periodo: Optional[str] = Field(None, examples=["20262"], description="(Opcional) Un solo periodo, formato '20262' o '2026-2'.")
    omitir: List[str] = Field(default_factory=list, description="Periodos crudos ('20241') que no hace falta volver a pedir.")


class LoginRequest(BaseModel):
    """Se usa SOLO para /api/sync-horarios (Matrícula UNI), que es un
    sistema de login totalmente distinto a INTRALU. Desde sep 2026 su
    login también exige reCAPTCHA — ver _obtener_token_matricula."""
    codigo: str = Field(..., examples=["20231059E"], description="Tu código de estudiante UNI.")
    password: str = Field(..., examples=["tu_contraseña"], description="Tu contraseña. Nunca se guarda.")


# ================================================================
# DESACTIVADO (sep 2026) — "Recordar mi contraseña" (tabla credenciales_intralu).
# Harry decidió no guardar contraseñas reales de INTRALU en el
# servidor: el riesgo no compensaba el ahorro de tipeo. Se deja
# comentado (no borrado) para poder reactivarlo si cambia de idea.
# ================================================================
# # ================================================================
# # CONTRASEÑA GUARDADA (opt-in, cifrada) — tabla credenciales_intralu
# # ================================================================
# # Se accede a Supabase por su API REST directa (PostgREST) con la
# # service role key, en vez de agregar el paquete supabase-py: es una
# # sola tabla con 3 operaciones simples (leer/upsert/borrar una fila
# # por user_id), y `requests` ya es una dependencia del proyecto.
# # La service role key vive SOLO en esta variable de entorno de Render
# # — nunca en Supabase, nunca en el frontend.
#
# def _fernet():
#     clave = os.environ.get("CRYPTO_KEY_CREDENCIALES")
#     if not clave:
#         raise HTTPException(status_code=500, detail="El servidor no tiene configurada la clave de cifrado (CRYPTO_KEY_CREDENCIALES).")
#     try:
#         return Fernet(clave.encode())
#     except Exception:
#         raise HTTPException(status_code=500, detail="La clave de cifrado configurada en el servidor no es válida.")
#
#
# def _cifrar_password(password):
#     return _fernet().encrypt(password.encode()).decode()
#
#
# def _descifrar_password(password_cifrada):
#     try:
#         return _fernet().decrypt(password_cifrada.encode()).decode()
#     except InvalidToken:
#         # Pasa si la clave de cifrado cambió después de guardar esta
#         # contraseña (ej. se regeneró CRYPTO_KEY_CREDENCIALES) — no hay
#         # forma de recuperarla, hay que pedirla de nuevo.
#         raise HTTPException(status_code=409, detail="Tu contraseña guardada ya no se puede leer. Ingrésala de nuevo.")
#
#
# def _supabase_config():
#     url = os.environ.get("SUPABASE_URL")
#     key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
#     if not url or not key:
#         raise HTTPException(status_code=500, detail="El servidor no tiene configurado el acceso a Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).")
#     return url.rstrip("/"), key
#
#
# def _supabase_headers(key, extra=None):
#     headers = {
#         "apikey": key,
#         "Authorization": f"Bearer {key}",
#         "Content-Type": "application/json",
#     }
#     if extra:
#         headers.update(extra)
#     return headers
#
#
# def _leer_credencial_cifrada(user_id):
#     """Devuelve la contraseña cifrada guardada para este alumno, o None
#     si nunca guardó una (o la borró)."""
#     url, key = _supabase_config()
#     resp = requests.get(
#         f"{url}/rest/v1/credenciales_intralu",
#         headers=_supabase_headers(key),
#         params={"user_id": f"eq.{user_id}", "select": "password_cifrada"},
#         timeout=10,
#     )
#     resp.raise_for_status()
#     filas = resp.json()
#     return filas[0]["password_cifrada"] if filas else None
#
#
# def _guardar_credencial(user_id, password):
#     """Cifra y guarda (o reemplaza) la contraseña de este alumno. No es
#     crítico si falla — quien llama a esto lo hace best-effort, sin
#     abortar una sincronización que ya salió bien."""
#     url, key = _supabase_config()
#     payload = {
#         "user_id": user_id,
#         "password_cifrada": _cifrar_password(password),
#         "actualizado_en": datetime.now(timezone.utc).isoformat(),
#     }
#     resp = requests.post(
#         f"{url}/rest/v1/credenciales_intralu?on_conflict=user_id",
#         headers=_supabase_headers(key, {"Prefer": "resolution=merge-duplicates"}),
#         json=payload,
#         timeout=10,
#     )
#     resp.raise_for_status()
#
#
# def _borrar_credencial(user_id):
#     url, key = _supabase_config()
#     resp = requests.delete(
#         f"{url}/rest/v1/credenciales_intralu",
#         headers=_supabase_headers(key),
#         params={"user_id": f"eq.{user_id}"},
#         timeout=10,
#     )
#     resp.raise_for_status()


def normalizar_periodo(periodo):
    """Acepta tanto el formato crudo ('20262') como el formato con guion
    ('2026-2', el que usa Intranotas) y devuelve siempre el crudo, que es
    el que necesitan las URLs de Intralú."""
    if not periodo:
        return None
    p = str(periodo).strip()
    if "-" in p:
        anio, tipo = p.split("-", 1)
        anio, tipo = anio.strip(), tipo.strip()
        if len(anio) == 2:  # por si alguien escribe "23-2" en vez de "2023-2"
            anio = f"20{anio}"
        return f"{anio}{tipo}"
    return p


def etiquetar_periodo(cod):
    """Convierte el código crudo de Intralú (ej. '20261') a la misma
    clave que usa Intranotas en localStorage (ej. '2026-1').

    El verano (tipo '3') se etiqueta con el MISMO año que el segundo
    semestre al que sigue cronológicamente (igual que hace tu propia
    generarPeriodosDisponibles() en intranotas.js): '20233' es el
    verano justo después de '2023-2', así que se guarda como '2023-3'
    — NO se resta un año. (Confirmado con tu propio historial: química
    y geometría analítica, jaladas en 2023-2, retomadas y aprobadas en
    ese verano.)
    """
    cod = str(cod).strip()
    if len(cod) == 5:
        anio, tipo = cod[:4], cod[4]
        if tipo == "1":
            return f"{anio}-1"
        if tipo == "2":
            return f"{anio}-2"
        if tipo == "3":
            return f"{anio}-3"
    return cod


def _limpiar_jobs_viejos():
    ahora = time.time()
    with _jobs_lock:
        vencidos = [
            jid for jid, job in _jobs.items()
            if ahora - job["creado_en"] > DURACION_MAXIMA_JOB_SEGUNDOS
        ]
        for jid in vencidos:
            del _jobs[jid]


# --------------------------------------------------------------
# Trabajos en segundo plano: el POST inicial responde AL INSTANTE con
# un job_id y la sincronización real corre en un hilo aparte. El
# frontend pregunta cada pocos segundos "¿ya terminó?" (polling). Esto
# es necesario porque el proxy público de Railway corta cualquier
# request que dure más de 5 minutos, y una sync completa (notas de
# TODOS los cursos) puede tardar más que eso — con este patrón cada
# request individual (iniciar / consultar) es casi instantáneo, así
# que el límite de 5 minutos deja de aplicar.
# --------------------------------------------------------------
_jobs = {}
_jobs_lock = threading.Lock()
DURACION_MAXIMA_JOB_SEGUNDOS = 30 * 60  # limpiar jobs viejos tras 30 min

DOMINIO_INTRALU = "alumnos.uni.edu.pe"
URL_AVANCE_CURRICULAR_PDF = f"https://{DOMINIO_INTRALU}/informacion-academica/avance-curricular-pdf"


UA_NAVEGADOR = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
URL_BASE_INTRALU = f"https://{DOMINIO_INTRALU}"
PETICIONES_PARALELAS = 4  # cursos/notas de TODOS los periodos a la vez. Con 6 INTRALU se ahogó y rechazó un curso (sep 2026)
REINTENTOS_NOTAS = 2      # si un curso falla, se vuelve a pedir hasta 2 veces más, con pausa creciente


# ================================================================
# CHROMIUM SIEMPRE ENCENDIDO (sep 2026)
# Antes cada login abría y cerraba su propio Chromium: en el plan
# gratuito de Render (muy poca CPU) solo arrancarlo se comía buena
# parte de los ~49 s del login. Ahora UN hilo dedicado es dueño de un
# único Chromium que queda abierto entre logins; cada login usa un
# "contexto" nuevo (como una ventana de incógnito: cookies aisladas por
# alumno) y lo cierra al terminar.
#   - Playwright "sync" solo puede usarse desde el hilo que lo creó, por
#     eso todo pasa por este hilo (los logins ya iban de uno en uno por
#     la fila, así que no se pierde nada).
#   - Se reinicia solo si se cae, si algo falla raro, o cada
#     MAX_LOGINS_POR_CHROMIUM logins (para que no acumule memoria).
#   - Arranca "en frío" al levantar el servidor, así el primer alumno
#     tras el despertar de Render ya lo encuentra calentándose.
# ================================================================
MAX_LOGINS_POR_CHROMIUM = 30
ESPERA_MAXIMA_LOGIN_SEGUNDOS = 150


class _TrabajadorChromium:
    def __init__(self):
        self._tareas = queue.Queue()
        self._hilo = threading.Thread(target=self._bucle, name="chromium", daemon=True)
        self._hilo.start()

    def ejecutar(self, funcion, espera_maxima=ESPERA_MAXIMA_LOGIN_SEGUNDOS):
        """Corre `funcion(browser)` en el hilo de Chromium y devuelve su
        resultado (o relanza su excepción) en el hilo que llama."""
        futuro = Future()
        self._tareas.put((funcion, futuro))
        return futuro.result(timeout=espera_maxima)

    def precalentar(self):
        """Pide arrancar Chromium sin esperar la respuesta."""
        self._tareas.put((None, None))

    def _bucle(self):
        administrador = playwright = browser = None
        usos = 0

        def cerrar():
            nonlocal administrador, playwright, browser, usos
            for accion in (
                lambda: browser and browser.close(),
                lambda: administrador and administrador.__exit__(None, None, None),
            ):
                try:
                    accion()
                except Exception:
                    pass
            administrador = playwright = browser = None
            usos = 0

        def asegurar_browser():
            nonlocal administrador, playwright, browser, usos
            if browser is not None and browser.is_connected() and usos < MAX_LOGINS_POR_CHROMIUM:
                return
            if browser is not None:
                logger.info("Chromium: reiniciando (usos=%d, conectado=%s)", usos, browser.is_connected())
            cerrar()
            t0 = time.time()
            administrador = Stealth().use_sync(sync_playwright())
            playwright = administrador.__enter__()
            browser = playwright.chromium.launch(headless=True)
            logger.info("Chromium: encendido en %.1fs (queda abierto para los siguientes logins)", time.time() - t0)

        while True:
            funcion, futuro = self._tareas.get()
            try:
                asegurar_browser()
                if funcion is None:
                    continue  # solo era precalentar
                usos += 1
                resultado = funcion(browser)
                futuro.set_result(resultado)
            except HTTPException as e:
                # Error "de negocio" (contraseña incorrecta, etc.): Chromium está bien.
                if futuro and not futuro.done():
                    futuro.set_exception(e)
            except BaseException as e:
                logger.exception("Chromium: falló una tarea; se reiniciará para la siguiente")
                cerrar()
                if futuro and not futuro.done():
                    futuro.set_exception(e)


_trabajador_chromium = _TrabajadorChromium()
_trabajador_chromium.precalentar()


def _nuevo_contexto(browser):
    return browser.new_context(
        user_agent=UA_NAVEGADOR,
        viewport={"width": 1366, "height": 768},
        locale="es-PE",
    )


# Dónde suele aparecer el aviso de error en un login web (SweetAlert,
# Bootstrap, toasts, validación de Laravel). Se exige texto de al menos
# 6 letras para no confundir un asterisco rojo de "campo obligatorio"
# con un error real. El texto encontrado queda en el log para poder
# confirmar con una contraseña equivocada a propósito.
SELECTORES_ERROR_LOGIN = (
    ".swal2-popup",
    ".alert-danger",
    ".alert",
    ".invalid-feedback",
    ".toast-error",
    ".toast",
    "[role='alert']",
    ".text-danger",
)


def _avisos_visibles(page):
    """Textos de los avisos visibles AHORA en la página (ver SELECTORES_ERROR_LOGIN)."""
    textos = set()
    for selector in SELECTORES_ERROR_LOGIN:
        try:
            elementos = page.locator(selector)
            for i in range(min(elementos.count(), 5)):
                elemento = elementos.nth(i)
                if elemento.is_visible():
                    texto = " ".join((elemento.inner_text() or "").split())
                    if len(texto) >= 6:
                        textos.add(texto)
        except Exception:
            pass
    return textos


def _esperar_resultado_login(page, avisos_previos, limite_segundos=20):
    """Devuelve True si entró (llegó a /home), o el texto del error si
    INTRALU mostró un aviso NUEVO (que no estaba antes de apretar el
    botón), o None si no pasó nada en `limite_segundos`. Revisa cada
    0.3 s: quien se equivoca de contraseña lo sabe en segundos."""
    fin = time.time() + limite_segundos
    while time.time() < fin:
        if "/home" in page.url:
            return True
        nuevos = _avisos_visibles(page) - avisos_previos
        if nuevos:
            return sorted(nuevos, key=len)[-1]
        page.wait_for_timeout(300)
    return None


# Dos formas de escribir en el formulario de INTRALU:
#   - "rápido": el código se pega de golpe y la contraseña se teclea con
#     pausas cortas. En el plan gratis de Render cada tecla simulada es
#     lenta, y el modo humano se comía ~15 s del login (medido, sep 2026).
#   - "humano": el tecleo de siempre, validado 20/20 contra el reCAPTCHA.
# Se intenta primero el rápido; si INTRALU no responde o rechaza la
# verificación de seguridad, se repite solo en modo humano (red de
# seguridad). Una contraseña incorrecta de verdad NO se repite.
MODOS_TIPEO = {
    "rapido": {"tecla": (35, 75), "entre_campos": (150, 350), "antes_de_enviar": (200, 450)},
    "humano": {"tecla": (90, 190), "entre_campos": (300, 800), "antes_de_enviar": (400, 900)},
}


def _es_contrasena_incorrecta(texto):
    t = (texto or "").lower()
    return "contrase" in t or "incorrect" in t or "no coincid" in t or "credencial" in t


def _intento_login_intralu(browser, codigo, password, modo):
    """UN intento de login en un contexto nuevo. Devuelve (resultado,
    cookies, tiempos): resultado es True, el texto del aviso de error, o
    None si INTRALU no respondió."""
    cfg = MODOS_TIPEO[modo]
    tiempos = {}
    t = time.time()
    context = _nuevo_contexto(browser)
    try:
        page = context.new_page()
        tiempos["contexto"] = time.time() - t

        t = time.time()
        page.goto(f"{URL_BASE_INTRALU}/login", wait_until="domcontentloaded")
        page.wait_for_timeout(random.randint(600, 1400))
        tiempos["pagina"] = time.time() - t

        t = time.time()
        page.click("#txt-codigo")
        if modo == "rapido":
            page.fill("#txt-codigo", codigo)
        else:
            page.type("#txt-codigo", codigo, delay=random.randint(*cfg["tecla"]))
        page.wait_for_timeout(random.randint(*cfg["entre_campos"]))
        page.click("#txt-password")
        page.type("#txt-password", password, delay=random.randint(*cfg["tecla"]))
        page.wait_for_timeout(random.randint(*cfg["antes_de_enviar"]))
        tiempos["tipeo"] = time.time() - t

        t = time.time()
        avisos_previos = _avisos_visibles(page)
        page.click("#btn-login")
        resultado = _esperar_resultado_login(page, avisos_previos)
        tiempos["respuesta"] = time.time() - t

        cookies = context.cookies() if resultado is True else None
        return resultado, cookies, tiempos
    finally:
        try:
            context.close()
        except Exception:
            pass


def _login_intralu_en(browser, codigo, password):
    """Corre DENTRO del hilo de Chromium: intenta en modo rápido y, solo si
    INTRALU no respondió o rechazó la verificación, repite en modo humano.
    Deja en el log cuánto tomó cada paso y qué modo funcionó."""
    for modo in ("rapido", "humano"):
        resultado, cookies, tiempos = _intento_login_intralu(browser, codigo, password, modo)
        logger.info(
            "Login INTRALU [%s]: contexto %.1fs, página %.1fs, tipeo %.1fs, respuesta %.1fs -> %s",
            modo, tiempos["contexto"], tiempos["pagina"], tiempos["tipeo"], tiempos["respuesta"],
            "OK" if resultado is True else f"ERROR ({resultado or 'sin respuesta en 20s'})",
        )
        if resultado is True:
            return cookies
        if resultado and _es_contrasena_incorrecta(resultado):
            raise HTTPException(status_code=401, detail="Código o contraseña incorrectos en Intralú.")
        # Sin respuesta, captcha u otro aviso raro: se reintenta en modo humano.

    if resultado and "captcha" in resultado.lower():
        raise HTTPException(status_code=503, detail="INTRALU no aceptó la verificación de seguridad. Intenta de nuevo en unos minutos.")
    raise HTTPException(status_code=401, detail="Código o contraseña incorrectos en Intralú.")


def _cookies_de_login_intralu(codigo, password):
    """Hace el login en el Chromium siempre encendido y devuelve SOLO las
    cookies de la sesión (lo demás va por `requests`)."""
    return _trabajador_chromium.ejecutar(lambda browser: _login_intralu_en(browser, codigo, password))


def _sesion_http_intralu(cookies):
    """Sesión liviana de `requests` con las cookies del login. Se envían
    Origin/Referer del propio INTRALU (lo valida) y el mismo user-agent
    del navegador que hizo el login."""
    sesion = requests.Session()
    for c in cookies:
        sesion.cookies.set(c["name"], c["value"], domain=c.get("domain"), path=c.get("path", "/"))
    sesion.headers.update({
        "User-Agent": UA_NAVEGADOR,
        "Accept-Language": "es-PE,es;q=0.9",
        "Origin": URL_BASE_INTRALU,
        "Referer": f"{URL_BASE_INTRALU}/home",
    })
    return sesion


def _xsrf_de_sesion(sesion):
    """Laravel pide en X-XSRF-TOKEN el valor DECODIFICADO de la cookie
    XSRF-TOKEN. Se lee en cada petición porque Laravel puede renovarla."""
    for cookie in sesion.cookies:
        if cookie.name == "XSRF-TOKEN":
            return unquote(cookie.value)
    return ""


class _TablaCursosParser(HTMLParser):
    """Lee la PRIMERA tabla de /informacion-academica/cursos/{periodo}
    (HTML del servidor, sin JavaScript). Por fila guarda el texto de cada
    celda y los atributos data-codcur / data-seccion del botón 'Ver curso'."""

    def __init__(self):
        super().__init__()
        self.filas = []
        self._tablas_vistas = 0
        self._en_primera_tabla = False
        self._en_tbody = False
        self._fila = None
        self._celda = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "table":
            self._tablas_vistas += 1
            self._en_primera_tabla = self._tablas_vistas == 1
        elif tag == "tbody" and self._en_primera_tabla:
            self._en_tbody = True
        elif tag == "tr" and self._en_tbody:
            self._fila = {"celdas": [], "codcur": None, "seccion": None}
        elif tag == "td" and self._fila is not None:
            self._celda = []
        if self._fila is not None:
            if a.get("data-codcur"):
                self._fila["codcur"] = a["data-codcur"].strip()
            if a.get("data-seccion") is not None and self._fila.get("seccion") is None:
                self._fila["seccion"] = (a.get("data-seccion") or "").strip()

    def handle_endtag(self, tag):
        if tag == "td" and self._celda is not None and self._fila is not None:
            self._fila["celdas"].append(" ".join("".join(self._celda).split()))
            self._celda = None
        elif tag == "tr" and self._fila is not None:
            self.filas.append(self._fila)
            self._fila = None
        elif tag == "tbody":
            self._en_tbody = False
        elif tag == "table":
            self._en_primera_tabla = False

    def handle_data(self, data):
        if self._celda is not None:
            self._celda.append(data)


class _SesionIntraluVencida(Exception):
    pass


def _listar_cursos_periodo(sesion, periodo):
    """Cursos matriculados en un periodo: [{cod_curso, seccion, nombre,
    creditos}]. Periodo sin cursos -> lista vacía."""
    resp = sesion.get(
        f"{URL_BASE_INTRALU}/informacion-academica/cursos/{periodo}",
        headers={"Accept": "text/html,application/xhtml+xml"},
        timeout=20,
    )
    if "/login" in resp.url:
        raise _SesionIntraluVencida()
    if resp.status_code != 200:
        logger.warning("Lista de cursos %s respondió HTTP %d", periodo, resp.status_code)
        return []

    parser = _TablaCursosParser()
    parser.feed(resp.text)

    cursos = []
    for fila in parser.filas:
        celdas = fila["celdas"]
        if len(celdas) < 3:
            continue
        cod_raw, nombre, creditos = celdas[0], celdas[1], celdas[2]
        cod_curso, seccion = fila["codcur"], fila["seccion"]
        if not cod_curso:
            # Respaldo: el texto de la 1ra celda es tipo "GE709 -V"
            if not cod_raw or "-" not in cod_raw or cod_raw[0].isdigit():
                continue
            partes = [x.strip() for x in cod_raw.split("-")]
            cod_curso, seccion = partes[0], (partes[1] if len(partes) > 1 else "")
        cursos.append({
            "cod_curso": cod_curso,
            "seccion": seccion or "",
            "nombre": nombre,
            "creditos": creditos,
        })
    return cursos


def _traer_notas_curso(sesion, periodo, c_info):
    """Notas de un curso con reintentos. Devuelve (curso_armado, error_o_None).
    Si al final sigue fallando, el curso NO debe guardarse (ver _ejecutar_sync):
    guardarlo vacío pisaría las notas buenas que el alumno ya tenía en SIGA."""
    curso, error = None, None
    for intento in range(REINTENTOS_NOTAS + 1):
        curso, error = _traer_notas_curso_una_vez(sesion, periodo, c_info)
        if not error:
            if intento:
                logger.info("Notas %s-%s (%s): OK en el reintento %d", c_info["cod_curso"], c_info["seccion"], periodo, intento)
            return curso, None
        logger.warning("Notas %s-%s (%s): intento %d falló (%s)",
                       c_info["cod_curso"], c_info["seccion"], periodo, intento + 1, error)
        time.sleep(1.5 * (intento + 1))
    return curso, error


def _traer_notas_curso_una_vez(sesion, periodo, c_info):
    """UNA petición por curso: evaluaciones + fórmulas + promedios.
    Devuelve (curso_armado, error_o_None)."""
    evaluaciones = []
    formula_practicas = formula_nota_final = None
    promedio_practicas = promedio_final = nota_asistencia = None
    error = None

    try:
        resp = sesion.post(
            f"{URL_BASE_INTRALU}/informacion-academica/cursos/notas",
            data={"codper": periodo, "codcur": c_info["cod_curso"], "seccion": c_info["seccion"]},
            headers={
                "X-XSRF-TOKEN": _xsrf_de_sesion(sesion),
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "application/json, text/plain, */*",
                "Referer": f"{URL_BASE_INTRALU}/informacion-academica/cursos/{periodo}/{c_info['cod_curso']}/{c_info['seccion']}",
            },
            timeout=20,
        )
        if resp.status_code == 200:
            datos_curso = resp.json()
            # Crudas, sin re-etiquetar (camnot/descripcion/nota/fecha_registro_acta):
            # formula-mapper.js arma N1/N2/EP/EF/ES al vuelo en el frontend.
            for ev in datos_curso.get("data", []):
                try:
                    val_n = float(ev.get("nota"))
                except (TypeError, ValueError):
                    val_n = None
                evaluaciones.append({
                    "camnot": ev.get("camnot"),
                    "descripcion": (ev.get("descripcion") or "").strip() or None,
                    "nota": val_n,
                    "fecha_registro_acta": ev.get("fecha_registro_acta"),
                })
            formulas = datos_curso.get("formulas") or {}
            formula_practicas = formulas.get("practicas")
            formula_nota_final = formulas.get("teoria")
            promedios = datos_curso.get("promedios") or {}
            promedio_practicas = promedios.get("promedio_practicas")
            promedio_final = promedios.get("promedio_final")
            nota_asistencia = promedios.get("nota_asistencia")
        else:
            error = f"HTTP {resp.status_code} al pedir notas"
    except Exception as e:
        error = f"error de red pidiendo notas: {e}"

    creditos_val = str(c_info["creditos"] or "")
    curso = {
        "codigo": c_info["cod_curso"],
        "nombre": c_info["nombre"],
        "creditos": int(creditos_val) if creditos_val.isdigit() else creditos_val,
        "evaluaciones": evaluaciones,
        "seccion": c_info["seccion"],
        "formula_practicas": formula_practicas,
        "formula_nota_final": formula_nota_final,
        "promedio_practicas": promedio_practicas,
        "promedio_final": promedio_final,
        "nota_asistencia": nota_asistencia,
    }
    return curso, error


def _periodo_actual_aproximado():
    """Mismo criterio que el frontend, con la hora de Lima (UTC-5):
    ene-feb = verano (tipo 3 del año anterior), mar-jul = 1, ago-dic = 2."""
    ahora = time.gmtime(time.time() - 5 * 3600)
    anio, mes = ahora.tm_year, ahora.tm_mon
    if mes <= 2:
        return anio - 1, 3
    if mes <= 7:
        return anio, 1
    return anio, 2


def _siguiente_periodo(anio, tipo):
    if tipo == 1:
        return anio, 2
    if tipo == 2:
        return anio, 3
    return anio + 1, 1  # después del verano (tipo 3) viene el 1 del año siguiente


def _periodos_del_historial(codigo):
    """Todos los periodos desde el año de ingreso (primeros 4 dígitos del
    código UNI) hasta el actual + 1 de adelanto (por si INTRALU ya abrió
    el siguiente). Orden cronológico, veranos incluidos."""
    anio_actual, tipo_actual = _periodo_actual_aproximado()
    try:
        anio_ingreso = int(str(codigo)[:4])
        if not (2000 <= anio_ingreso <= anio_actual):
            raise ValueError
    except ValueError:
        anio_ingreso = anio_actual - 8

    periodos = []
    anio, tipo = anio_ingreso, 1
    limite = _siguiente_periodo(anio_actual, tipo_actual)
    while (anio, tipo) != _siguiente_periodo(*limite) and len(periodos) < 60:
        periodos.append(f"{anio}{tipo}")
        anio, tipo = _siguiente_periodo(anio, tipo)
    return periodos


def _actualizar_job(job_id, **campos):
    with _jobs_lock:
        if job_id in _jobs:
            _jobs[job_id].update(campos)


def _job_cancelado(job_id):
    with _jobs_lock:
        return bool(_jobs.get(job_id, {}).get("cancelado"))


def _ejecutar_sync(job_id, codigo, password, periodo_especifico, omitir):
    """Corre en un hilo aparte. Guarda progreso y resultado en _jobs[job_id]
    para que el frontend los recoja con GET /api/sync-intralu/{job_id}.

    Flujo (sep 2026):
      1. Fila de espera para Chromium (posición visible en el frontend).
      2. Login con Chromium -> cookies -> se cierra Chromium y se suelta el
         turno (el siguiente alumno ya puede entrar).
      3. Con `requests`: lista de cursos de cada periodo del historial y
         notas de cada curso (3 en paralelo), + PDF del Avance Curricular.
    """
    inicio = time.time()
    data_por_periodo = {}

    try:
        # 1-2. Solo esta parte usa Chromium (y la fila).
        _actualizar_job(job_id, etapa="en_fila", personas_delante=0)
        _tomar_turno_chromium(
            job_id,
            al_cambiar_posicion=lambda n: _actualizar_job(job_id, personas_delante=n),
            esta_cancelado=lambda: _job_cancelado(job_id),
        )
        try:
            _actualizar_job(job_id, etapa="iniciando_sesion", personas_delante=0)
            espera_fila = time.time() - inicio
            cookies = _cookies_de_login_intralu(codigo, password)
        finally:
            _soltar_turno_chromium()
        logger.info("Job %s: login OK (fila %.1fs, total %.1fs)",
                    job_id, espera_fila, time.time() - inicio)

        sesion = _sesion_http_intralu(cookies)
        inicio_descarga = time.time()

        # 3. Qué periodos revisar.
        if periodo_especifico:
            periodos = [normalizar_periodo(periodo_especifico)]
        else:
            omitidos = {normalizar_periodo(p) for p in (omitir or [])}
            periodos = [p for p in _periodos_del_historial(codigo) if p not in omitidos]
        _actualizar_job(job_id, etapa="descargando", periodos_total=len(periodos), periodos_hechos=0)
        logger.info("Job %s: %d periodo(s) a revisar: %s", job_id, len(periodos), ", ".join(periodos))

        # Todo en paralelo: primero las listas de cursos de TODOS los
        # periodos a la vez, y apenas llega cada lista se encolan sus
        # cursos. Se espera en orden cronológico solo para mostrar un
        # avance ordenado ("Cargando 2024-1 (3 de 8)"), pero por detrás
        # ya se está descargando todo junto.
        pool = ThreadPoolExecutor(max_workers=PETICIONES_PARALELAS)
        try:
            futuros_lista = {p: pool.submit(_listar_cursos_periodo, sesion, p) for p in periodos}
            futuros_notas = {}
            for periodo in periodos:
                cursos_temp = futuros_lista[periodo].result()
                futuros_notas[periodo] = [pool.submit(_traer_notas_curso, sesion, periodo, c) for c in cursos_temp]

            for i, periodo in enumerate(periodos):
                if _job_cancelado(job_id):
                    raise _SyncCancelada()
                _actualizar_job(job_id, periodo_actual=periodo, periodos_hechos=i)

                if not futuros_notas[periodo]:
                    continue
                cursos_lista, errores_curso = [], []
                for futuro in futuros_notas[periodo]:
                    if _job_cancelado(job_id):
                        raise _SyncCancelada()
                    curso, error = futuro.result()
                    if error:
                        # NO se manda a guardar: un curso vacío pisaría en SIGA las
                        # notas y la fórmula buenas que ya existían. Solo se reporta.
                        errores_curso.append({"codigo": curso["codigo"], "seccion": curso["seccion"], "motivo": error})
                    else:
                        cursos_lista.append(curso)

                if not cursos_lista:
                    # Todos sus cursos fallaron: se reporta el error, pero el
                    # periodo no se toca en SIGA.
                    data_por_periodo[periodo] = {"etiqueta_periodo": etiquetar_periodo(periodo), "cursos": [], "errores": errores_curso}
                    continue
                data_por_periodo[periodo] = {
                    "etiqueta_periodo": etiquetar_periodo(periodo),
                    "cursos": cursos_lista,
                    "errores": errores_curso,
                }
                logger.info("Job %s:   %s -> %d curso(s), %d error(es)",
                            job_id, periodo, len(cursos_lista), len(errores_curso))
        finally:
            pool.shutdown(wait=False, cancel_futures=True)

        logger.info("Job %s: descarga de %d periodo(s) en %.1fs", job_id, len(periodos), time.time() - inicio_descarga)
        _actualizar_job(job_id, periodos_hechos=len(periodos), periodo_actual=None)

        # Avance Curricular (best-effort, con la misma sesión, sin 2do login).
        avance_pdf_base64 = None
        try:
            resp_avance = sesion.get(URL_AVANCE_CURRICULAR_PDF, timeout=30)
            if resp_avance.status_code == 200 and resp_avance.content[:4] == b"%PDF":
                avance_pdf_base64 = base64.b64encode(resp_avance.content).decode()
            else:
                logger.warning("Job %s: Avance Curricular respondió HTTP %d, se omite esta vez",
                               job_id, resp_avance.status_code)
        except Exception:
            logger.exception("Job %s: no se pudo descargar el Avance Curricular (no crítico)", job_id)

        _actualizar_job(
            job_id,
            status="listo",
            periodos=data_por_periodo,
            periodos_revisados=periodos,
            avance_pdf_base64=avance_pdf_base64,
        )
        logger.info("Job %s: ✅ SINCRONIZACIÓN COMPLETA en %.1fs — %d periodo(s) con cursos de %d revisado(s)",
                    job_id, time.time() - inicio, len(data_por_periodo), len(periodos))

    except HTTPException as e:
        _actualizar_job(job_id, status="error", status_code=e.status_code, detail=e.detail)
        logger.info("Job %s: ❌ LOGIN FALLIDO tras %.1fs", job_id, time.time() - inicio)
    except _SyncCancelada:
        _actualizar_job(job_id, status="cancelado")
        logger.info("Job %s: 🛑 CANCELADO por el usuario tras %.1fs", job_id, time.time() - inicio)
    except _FilaDemasiadoLarga:
        _actualizar_job(job_id, status="error", status_code=503,
                        detail="SIGA está atendiendo a muchos alumnos ahora mismo. Intenta de nuevo en unos minutos.")
        logger.info("Job %s: ❌ fila demasiado larga tras %.1fs", job_id, time.time() - inicio)
    except _SesionIntraluVencida:
        _actualizar_job(job_id, status="error", status_code=502,
                        detail="INTRALU cerró la sesión a mitad de la sincronización. Intenta de nuevo.")
        logger.info("Job %s: ❌ sesión de INTRALU vencida tras %.1fs", job_id, time.time() - inicio)
    except Exception:
        logger.exception("Job %s: error durante la sincronización con Intralú", job_id)
        _actualizar_job(job_id, status="error", status_code=500,
                        detail="No se pudo completar la sincronización con Intralú. Intenta de nuevo más tarde.")
        logger.info("Job %s: ❌ TERMINÓ CON ERROR tras %.1fs", job_id, time.time() - inicio)


@app.post("/api/sync-intralu")
def iniciar_sync(credentials: LoginIntraluRequest):
    """Responde AL INSTANTE con un job_id — no espera a que termine el
    scraping. La sincronización real corre en un hilo aparte."""
    _limpiar_jobs_viejos()

    # DESACTIVADO (sep 2026) — usar la contraseña cifrada guardada
    # cuando el pedido llega sin contraseña. Hoy `password` es
    # obligatorio en LoginIntraluRequest, así que esto ya no aplica.
    # Para reactivar, descomentar:
    # password = credentials.password
    # if not password:
    #     cifrada = _leer_credencial_cifrada(credentials.user_id)
    #     if not cifrada:
    #         raise HTTPException(status_code=400, detail="No tienes una contraseña guardada. Ingrésala para sincronizar.")
    #     password = _descifrar_password(cifrada)

    job_id = str(uuid.uuid4())
    with _jobs_lock:
        _jobs[job_id] = {
            "status": "en_progreso",
            "creado_en": time.time(),
            "periodo_actual": None,
            "cancelado": False,
            "etapa": "en_fila",
            "personas_delante": 0,
        }

    hilo = threading.Thread(
        target=_ejecutar_sync,
        args=(job_id, credentials.codigo, credentials.password, credentials.periodo, credentials.omitir),
        daemon=True,
    )
    hilo.start()

    return {"job_id": job_id}


# DESACTIVADO (sep 2026) — endpoints de "Recordar mi contraseña". Para reactivar,
# descomentar (y volver a permitir DELETE en el CORS de arriba).
# @app.get("/api/tiene-credencial/{user_id}")
# def tiene_credencial(user_id: str):
#     """El frontend llama esto al cargar la pantalla de sync, para saber
#     si puede saltarse el campo de contraseña. Nunca devuelve la
#     contraseña en sí, solo si existe una guardada."""
#     return {"tiene": _leer_credencial_cifrada(user_id) is not None}
#
#
# @app.delete("/api/credencial/{user_id}")
# def borrar_credencial(user_id: str):
#     """El alumno pidió 'Olvidar mi contraseña guardada' desde el
#     frontend — borra la fila sin dejar rastro cifrado tampoco."""
#     _borrar_credencial(user_id)
#     return {"status": "borrada"}


@app.post("/api/sync-intralu/{job_id}/cancelar")
def cancelar_sync(job_id: str):
    """El frontend llama esto cuando el alumno presiona 'Cancelar'. Solo
    levanta la bandera — el hilo de _ejecutar_sync la revisa en la fila de
    espera y entre cada curso, y se detiene solo. Si justo está en el
    login (unos segundos), termina el login y se detiene después."""
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="No se encontró esa sincronización (puede haber expirado).")
        job["cancelado"] = True
    logger.info("Job %s: solicitud de cancelación recibida", job_id)
    return {"status": "cancelando"}


@app.get("/api/sync-intralu/{job_id}")
def consultar_sync(job_id: str):
    """El frontend llama esto cada pocos segundos hasta que status
    sea 'listo', 'cancelado' (no es error) o falle con un error real."""
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail="No se encontró esa sincronización (puede haber expirado).",
            )
        if job["status"] == "error":
            raise HTTPException(
                status_code=job.get("status_code", 500),
                detail=job["detail"],
            )
        return {
            "status": job["status"],
            "etapa": job.get("etapa"),
            "personas_delante": job.get("personas_delante", 0),
            "periodo_actual": job.get("periodo_actual"),
            "periodos_total": job.get("periodos_total"),
            "periodos_hechos": job.get("periodos_hechos"),
            "periodos": job.get("periodos"),
            "periodos_revisados": job.get("periodos_revisados"),
            "avance_pdf_base64": job.get("avance_pdf_base64"),
        }


# ================================================================
# SINCRONIZACIÓN CON MATRÍCULA UNI (Generador de Horarios)
# A diferencia de /api/sync-intralu, esta sí es síncrona: Playwright
# solo se usa para el login (obtener el accessToken de la cookie), y
# el resto es puro `requests` contra la API de Matrícula — toma
# segundos, no minutos, así que no necesita el patrón de job/polling.
# Comparte la fila de Chromium con Intralú (mismo límite de RAM del plan
# gratuito): si otro alumno está haciendo login, esta espera su turno en
# vez de arrancar un segundo Chromium en paralelo, y además respeta el
# tope propio de 4 logins de Matrícula por minuto.
# ================================================================
MATRICULA_BASE = "https://matricula-alumno.uni.edu.pe"

DIAS_MAP_MATRICULA = {
    "LUNES": "LUNES",
    "MARTES": "MARTES",
    "MIERCOLES": "MIERCOLES",
    "JUEVES": "JUEVES",
    "VIERNES": "VIERNES",
    "SABADO": "SABADO",
    "DOMINGO": "DOMINGO",
}


def _normalizar_dia_matricula(dia):
    if not dia:
        return ""
    s = dia.strip().upper()
    s = (s.replace("Á", "A").replace("É", "E")
           .replace("Í", "I").replace("Ó", "O").replace("Ú", "U"))
    return DIAS_MAP_MATRICULA.get(s, s)


def _hora_a_entero_matricula(hora_str):
    if not hora_str:
        return None
    try:
        partes = hora_str.strip().split(":")
        h = int(partes[0])
        m = int(partes[1]) if len(partes) > 1 else 0
        return h * 100 + m
    except (ValueError, IndexError):
        return None


def _obtener_token_matricula(codigo, password):
    """Login a Matrícula UNI y devuelve el accessToken (texto plano, listo
    para usarse como `Authorization: Bearer <token>`).

    Cambios de Matrícula confirmados en vivo por DevTools (sep 2026):
      1. `POST /api/login` ahora exige un `recaptcha_token` (reCAPTCHA v3)
         que solo genera un navegador real al hacer clic en "Iniciar
         Sesión" — por eso se usa Chromium con stealth y tipeo humano,
         la misma técnica que ya pasa el reCAPTCHA de INTRALU.
      2. El `accessToken` ya NO llega como cookie: viene en el cuerpo JSON
         de la respuesta de /api/login (`{"accessToken": ..., "userData":
         {...}}`). Por eso se escucha esa respuesta directamente en vez de
         buscar la cookie — era la causa de fondo del error genérico
         "Código o contraseña incorrectos... o la página no está habilitada".
      3. /api/login tiene un límite de 5 intentos por ventana de tiempo
         (header X-Ratelimit-Limit: 5) — se avisa con un 429 claro.

    El login usa el Chromium siempre encendido (un contexto nuevo que se
    cierra al terminar); todo lo demás (ficha y horarios) va por `requests`.
    """
    estado, cuerpo, url_final = _trabajador_chromium.ejecutar(
        lambda browser: _login_matricula_en(browser, codigo, password)
    )

    if estado is None:
        # Nunca salió el POST a /api/login: la página no cargó bien, cambió
        # el formulario, o el propio reCAPTCHA no dejó enviar.
        logger.warning("Matrícula: no se detectó respuesta de /api/login (url final: %s)", url_final)
        raise HTTPException(
            status_code=504,
            detail="Matrícula no respondió al iniciar sesión. Intenta de nuevo en unos minutos.",
        )

    mensaje = str(cuerpo.get("message") or cuerpo.get("error") or "") if isinstance(cuerpo, dict) else ""
    logger.info("Matrícula: /api/login respondió HTTP %s %s", estado, f"({mensaje})" if mensaje else "")

    if estado == 429:
        raise HTTPException(
            status_code=429,
            detail="Demasiados intentos de inicio de sesión en Matrícula. Espera un minuto y vuelve a intentar.",
        )

    if "captcha" in mensaje.lower():
        raise HTTPException(
            status_code=503,
            detail="Matrícula no aceptó la verificación de seguridad (reCAPTCHA). Intenta de nuevo en unos minutos.",
        )

    token = cuerpo.get("accessToken") if isinstance(cuerpo, dict) else None
    if estado == 200 and token:
        return token

    if estado in (400, 401, 403, 422):
        raise HTTPException(status_code=401, detail="Código o contraseña incorrectos en Matrícula.")

    raise HTTPException(
        status_code=502,
        detail=f"Matrícula respondió de forma inesperada (HTTP {estado}). Intenta de nuevo más tarde.",
    )


ESPERA_MAXIMA_FILA_MATRICULA_SEGUNDOS = 120  # solo la ruta vieja síncrona (TEMPORAL)


def _login_matricula_en(browser, codigo, password):
    """Corre DENTRO del hilo de Chromium (siempre encendido): contexto
    nuevo, login con tecleo humano, escucha la respuesta de /api/login y
    devuelve (estado_http, cuerpo_json, url_final)."""
    estado, cuerpo, url_final = None, {}, None
    context = _nuevo_contexto(browser)
    try:
        page = context.new_page()
        page.goto(f"{MATRICULA_BASE}/login", wait_until="domcontentloaded")
        # Tiempo para que cargue el script de reCAPTCHA antes de
        # interactuar (si se hace clic antes, no hay token que mandar).
        page.wait_for_timeout(random.randint(1500, 2500))

        campo_codigo = page.locator("input[type='text']").first
        campo_password = page.locator("input[type='password']").first

        campo_codigo.click()
        campo_codigo.type(codigo, delay=random.randint(90, 190))
        page.wait_for_timeout(random.randint(300, 800))

        campo_password.click()
        campo_password.type(password, delay=random.randint(90, 190))
        page.wait_for_timeout(random.randint(400, 900))

        try:
            with page.expect_response(
                lambda r: r.url.rstrip("/").endswith("/api/login") and r.request.method == "POST",
                timeout=25000,
            ) as info_respuesta:
                page.click("button:has-text('Iniciar Sesión')")
            respuesta = info_respuesta.value
            estado = respuesta.status
            try:
                cuerpo = respuesta.json() or {}
            except Exception:
                cuerpo = {}
        except PlaywrightTimeoutError:
            url_final = page.url
    finally:
        try:
            context.close()
        except Exception:
            pass
    return estado, cuerpo, url_final


def _token_matricula_con_fila(codigo, password, ticket, espera_maxima,
                              al_cambiar_posicion=None, esta_cancelado=None,
                              al_esperar_cupo=None, al_iniciar_login=None):
    """Fila de Chromium (compartida con INTRALU) + tope propio de 4 logins
    de Matrícula por minuto. Si al llegar el turno no hay cupo, SUELTA el
    Chromium, espera fuera de la fila (Intranotas sigue fluyendo) y vuelve
    a formarse. Devuelve el accessToken."""
    limite = time.time() + espera_maxima
    while True:
        restante = limite - time.time()
        if restante <= 0:
            raise _FilaDemasiadoLarga()
        _tomar_turno_chromium(ticket, al_cambiar_posicion=al_cambiar_posicion,
                              esta_cancelado=esta_cancelado, espera_maxima=restante)
        try:
            # Si canceló justo al llegar su turno, no se gasta un cupo de login.
            if esta_cancelado and esta_cancelado():
                raise _SyncCancelada()
            espera = _tomar_cupo_login_matricula()
            if espera == 0:
                if al_iniciar_login:
                    al_iniciar_login()
                return _obtener_token_matricula(codigo, password)
        finally:
            _soltar_turno_chromium()

        logger.info("Matrícula: tope propio de %d logins/min alcanzado, esperando %.1fs (sin ocupar Chromium)",
                    MAX_LOGINS_MATRICULA_POR_MINUTO, espera)
        if al_esperar_cupo:
            al_esperar_cupo(espera)
        fin = min(time.time() + espera, limite)
        while time.time() < fin:
            if esta_cancelado and esta_cancelado():
                raise _SyncCancelada()
            time.sleep(min(1.0, max(0.0, fin - time.time())))


def _descargar_horarios_matricula(token):
    """Ya con el accessToken: ficha + horarios de cada curso, puro
    `requests` (sin Chromium). Devuelve el mismo JSON de siempre."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        # Mismo origen que usa la propia web de Matrícula (visto en
        # DevTools) — no es obligatorio hoy, pero evita sorpresas si
        # algún día empiezan a validarlo como hace INTRALU.
        "Origin": MATRICULA_BASE,
        "Referer": f"{MATRICULA_BASE}/",
    }

    resp_ficha = requests.get(f"{MATRICULA_BASE}/api/matricula/ficha", headers=headers, timeout=15)
    if resp_ficha.status_code != 200:
        raise HTTPException(status_code=502, detail="No se pudo obtener la ficha de matrícula.")

    ficha = resp_ficha.json()
    cursos_disponibles = ficha.get("cursos", [])

    carga = {}
    cursos_sin_horario = []

    for curso in cursos_disponibles:
        codigo_curso = curso.get("codigo")
        nombre_curso = (curso.get("nombre") or "").rstrip("-").strip()

        if not curso.get("tieneHorario"):
            cursos_sin_horario.append({"codigo": codigo_curso, "nombre": nombre_curso})
            continue

        resp_horario = requests.get(
            f"{MATRICULA_BASE}/api/matricula/cursos/{codigo_curso}/horarios",
            headers=headers, timeout=15,
        )
        if resp_horario.status_code != 200:
            cursos_sin_horario.append({
                "codigo": codigo_curso, "nombre": nombre_curso,
                "error": f"HTTP {resp_horario.status_code}",
            })
            continue

        secciones = resp_horario.json().get("secciones", [])
        if not secciones:
            continue

        carga[nombre_curso] = {}
        for seccion in secciones:
            letra_seccion = seccion.get("seccion")
            docente = "POR ASIGNAR"
            clases = []
            for h in seccion.get("horario", []):
                dia = _normalizar_dia_matricula(h.get("dia"))
                ini = _hora_a_entero_matricula(h.get("horaInicio"))
                fin = _hora_a_entero_matricula(h.get("horaFin"))
                if ini is None or fin is None or ini >= fin:
                    continue
                if h.get("docente"):
                    docente = h["docente"]
                clases.append({
                    "dia": dia, "ini": ini, "fin": fin,
                    "tipo": (h.get("concepto") or "P").upper(),
                    "aula": h.get("aula") or "S/A",
                })

            carga[nombre_curso][letra_seccion] = {
                "docente": docente,
                "codigo": codigo_curso,
                "vacantesMaximas": seccion.get("vacantesMaximas"),
                "vacantesOcupadas": seccion.get("vacantesOcupadas"),
                "vacantesDisponibles": seccion.get("vacantesDisponibles"),
                "clases": clases,
            }

    logger.info("Sync Matrícula: %d cursos con horario, %d sin horario", len(carga), len(cursos_sin_horario))
    return {
        "status": "success",
        "periodo": ficha.get("periodo"),
        "total_cursos": len(cursos_disponibles),
        "cursos_con_horario": len(carga),
        "cursos_sin_horario": cursos_sin_horario,
        "cursos": cursos_disponibles,
        "carga": carga,
    }


def _ejecutar_sync_matricula(job_id, codigo, password):
    """Corre en un hilo aparte, igual que la sync de INTRALU (sep 2026):
    el frontend consulta el avance con GET /api/sync-horarios/{job_id}.
    Etapas: en_fila -> esperando_cupo (solo si se llegó al tope de 4
    logins/min) -> iniciando_sesion -> descargando -> listo."""
    inicio = time.time()
    try:
        token = _token_matricula_con_fila(
            codigo, password,
            ticket=f"matricula-{job_id}",
            espera_maxima=ESPERA_MAXIMA_FILA_SEGUNDOS,
            al_cambiar_posicion=lambda n: _actualizar_job(job_id, etapa="en_fila", personas_delante=n),
            esta_cancelado=lambda: _job_cancelado(job_id),
            al_esperar_cupo=lambda seg: _actualizar_job(job_id, etapa="esperando_cupo", personas_delante=0,
                                                        segundos_espera=int(seg) + 1),
            al_iniciar_login=lambda: _actualizar_job(job_id, etapa="iniciando_sesion", personas_delante=0),
        )
        if _job_cancelado(job_id):
            raise _SyncCancelada()

        _actualizar_job(job_id, etapa="descargando")
        resultado = _descargar_horarios_matricula(token)
        _actualizar_job(job_id, status="listo", resultado=resultado)
        logger.info("Job Matrícula %s: ✅ COMPLETA en %.1fs", job_id, time.time() - inicio)

    except HTTPException as e:
        _actualizar_job(job_id, status="error", status_code=e.status_code, detail=e.detail)
        logger.info("Job Matrícula %s: ❌ ERROR (%s) tras %.1fs", job_id, e.status_code, time.time() - inicio)
    except _SyncCancelada:
        _actualizar_job(job_id, status="cancelado")
        logger.info("Job Matrícula %s: 🛑 CANCELADO por el usuario tras %.1fs", job_id, time.time() - inicio)
    except _FilaDemasiadoLarga:
        _actualizar_job(job_id, status="error", status_code=503,
                        detail="SIGA está atendiendo a muchos alumnos ahora mismo. Intenta de nuevo en unos minutos.")
        logger.info("Job Matrícula %s: ❌ fila demasiado larga tras %.1fs", job_id, time.time() - inicio)
    except Exception:
        logger.exception("Job Matrícula %s: error durante la sincronización con Matrícula UNI", job_id)
        _actualizar_job(job_id, status="error", status_code=500,
                        detail="No se pudo completar la conexión con Matrícula. Intenta de nuevo más tarde.")


@app.post("/api/sync-horarios/iniciar")
def iniciar_sync_horarios(credentials: LoginRequest):
    """Responde AL INSTANTE con un job_id (mismo patrón que Intranotas)."""
    _limpiar_jobs_viejos()
    job_id = str(uuid.uuid4())
    with _jobs_lock:
        _jobs[job_id] = {
            "tipo": "matricula",
            "status": "en_progreso",
            "creado_en": time.time(),
            "cancelado": False,
            "etapa": "en_fila",
            "personas_delante": 0,
        }
    threading.Thread(
        target=_ejecutar_sync_matricula,
        args=(job_id, credentials.codigo, credentials.password),
        daemon=True,
    ).start()
    return {"job_id": job_id}


@app.post("/api/sync-horarios/{job_id}/cancelar")
def cancelar_sync_horarios(job_id: str):
    """Levanta la bandera: si aún está en la fila o esperando cupo, sale
    sin gastar un login de Matrícula."""
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job or job.get("tipo") != "matricula":
            raise HTTPException(status_code=404, detail="No se encontró esa conexión (puede haber expirado).")
        job["cancelado"] = True
    logger.info("Job Matrícula %s: solicitud de cancelación recibida", job_id)
    return {"status": "cancelando"}


@app.get("/api/sync-horarios/{job_id}")
def consultar_sync_horarios(job_id: str):
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job or job.get("tipo") != "matricula":
            raise HTTPException(status_code=404, detail="No se encontró esa conexión (puede haber expirado).")
        if job["status"] == "error":
            raise HTTPException(status_code=job.get("status_code", 500), detail=job["detail"])
        return {
            "status": job["status"],
            "etapa": job.get("etapa"),
            "personas_delante": job.get("personas_delante", 0),
            "segundos_espera": job.get("segundos_espera"),
            "resultado": job.get("resultado"),
        }


# TEMPORAL (sep 2026): ruta vieja síncrona, para que nadie vea un error
# mientras GitHub Pages aún no publica el frontend nuevo. Se retira en el
# chat de Horarios, cuando ya nadie la llame.
@app.post("/api/sync-horarios")
def sync_horarios(credentials: LoginRequest):
    inicio = time.time()
    try:
        token = _token_matricula_con_fila(
            credentials.codigo, credentials.password,
            ticket=f"matricula-{uuid.uuid4()}",
            espera_maxima=ESPERA_MAXIMA_FILA_MATRICULA_SEGUNDOS,
        )
    except _FilaDemasiadoLarga:
        raise HTTPException(
            status_code=503,
            detail="SIGA está atendiendo a muchos alumnos ahora mismo. Intenta de nuevo en un minuto.",
        )
    try:
        resultado = _descargar_horarios_matricula(token)
        logger.info("Sync Matrícula (ruta vieja): ✅ COMPLETA en %.1fs", time.time() - inicio)
        return resultado
    except HTTPException:
        logger.info("Sync Matrícula (ruta vieja): ❌ TERMINÓ CON ERROR tras %.1fs", time.time() - inicio)
        raise
    except Exception as e:
        logger.exception("Error durante la sincronización con Matrícula UNI")
        raise HTTPException(status_code=500, detail=f"Error en servidor: {str(e)}")


if __name__ == "__main__":
    import os
    import uvicorn

    # Railway asigna el puerto dinámicamente vía la variable de entorno
    # PORT. En tu máquina (sin esa variable) sigue usando 8000, como
    # hasta ahora. host="0.0.0.0" (no 127.0.0.1) porque Railway necesita
    # que el servidor escuche en todas las interfaces, no solo localhost.
    puerto = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=puerto)