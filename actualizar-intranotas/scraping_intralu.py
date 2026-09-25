import base64
import logging
import os
import random
import threading
import time
import uuid
# datetime/timezone y Optional hoy solo los usa el código DESACTIVADO de
# "Recordar mi contraseña" — se dejan importados para reactivarlo fácil.
from datetime import datetime, timezone  # noqa: F401
from typing import Optional  # noqa: F401
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
# Ahora que volvemos a visitar el detalle de cada curso, cada sync es
# pesada otra vez — bajamos el límite de simultáneas para proteger el
# servidor (sobre todo en un plan gratuito de hosting).
# --------------------------------------------------------------
# Render (plan gratuito) da solo 512 MB de RAM — un solo Chromium ya usa
# varios cientos de MB, así que con 2 simultáneas correríamos riesgo real
# de quedarnos sin memoria. Si más adelante subes a un plan con más RAM,
# puedes volver a subir este número.
MAX_SYNCS_SIMULTANEOS = 1
_semaforo_sync = threading.Semaphore(MAX_SYNCS_SIMULTANEOS)


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
    periodo: str = Field(
        ...,
        examples=["20262"],
        description=(
            "Periodo específico a sincronizar, formato crudo AÑO+TIPO "
            "('20262' = 2026-2) — también acepta el formato con guion "
            "('2026-2'). Siempre se pide UN periodo, nunca 'todos'."
        ),
    )


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


def _login_intralu_page(context, codigo, password):
    """Login NUEVO (código+contraseña, con tecleo de pausas humanas —
    el 'stealth' real ya lo aplica Stealth().use_sync() al envolver
    sync_playwright() en _ejecutar_sync, no aquí). Mismo patrón que
    _login_por_cookie: recibe un `context` ya abierto por quien llama y
    devuelve una `page` autenticada, sin cerrar el browser — así el resto
    de _ejecutar_sync (que navega curso por curso con esa misma page) no
    necesita cambiar nada más."""
    page = context.new_page()
    page.goto(f"https://{DOMINIO_INTRALU}/login", wait_until="domcontentloaded")
    page.wait_for_timeout(random.randint(600, 1400))

    page.click("#txt-codigo")
    page.type("#txt-codigo", codigo, delay=random.randint(90, 190))
    page.wait_for_timeout(random.randint(300, 800))

    page.click("#txt-password")
    page.type("#txt-password", password, delay=random.randint(90, 190))
    page.wait_for_timeout(random.randint(400, 900))

    page.click("#btn-login")

    try:
        page.wait_for_url("**/home**", timeout=20000)
    except Exception:
        raise HTTPException(status_code=401, detail="Código o contraseña incorrectos en Intralú.")

    return page


class _SyncCancelada(Exception):
    """El alumno presionó 'Cancelar' desde el frontend (ej. eligió mal el
    periodo, o simplemente ya no quiere esperar). Se revisa entre cada
    curso, no solo entre periodos, para que cancelar corte rápido incluso
    a mitad de un ciclo con muchos cursos."""
    pass


def _ejecutar_sync(job_id, codigo, password, periodo_especifico):
    """Corre en un hilo aparte (no bloquea ningún request HTTP). Guarda
    el progreso y el resultado final en _jobs[job_id] para que el
    frontend los recoja haciendo polling contra GET /api/sync-intralu/{job_id}."""
    periodo_especifico = normalizar_periodo(periodo_especifico)
    adquirido = _semaforo_sync.acquire(blocking=False)
    if not adquirido:
        with _jobs_lock:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["status_code"] = 429
            _jobs[job_id]["detail"] = "Hay muchas sincronizaciones en curso ahora mismo. Intenta de nuevo en un minuto."
        logger.info("Job %s: ❌ RECHAZADO (ya hay %d syncs en curso)", job_id, MAX_SYNCS_SIMULTANEOS)
        return

    inicio = time.time()

    data_por_periodo = {}
    browser = None

    try:
        with Stealth().use_sync(sync_playwright()) as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1366, "height": 768},
                locale="es-PE",
            )

            # 1. Login nuevo (código+contraseña, stealth) — reemplaza al
            # login por cookie de la extensión.
            try:
                page = _login_intralu_page(context, codigo, password)
            except HTTPException as e:
                with _jobs_lock:
                    _jobs[job_id]["status"] = "error"
                    _jobs[job_id]["status_code"] = e.status_code
                    _jobs[job_id]["detail"] = e.detail
                logger.info("Job %s: ❌ LOGIN FALLIDO tras %.1fs", job_id, time.time() - inicio)
                return

            # DESACTIVADO (sep 2026) — guardar la contraseña cifrada tras un login
            # exitoso. Para reactivar: devolver user_id y recordar a la firma
            # de esta función y descomentar:
            # # El login ya funcionó — recién aquí, no antes, vale la pena
            # # guardar la contraseña (si el alumno lo pidió). Si esto
            # # falla, no se aborta la sincronización: ya tiene una sesión
            # # válida y sus notas importan más que este guardado opcional.
            # if recordar and user_id:
            #     try:
            #         _guardar_credencial(user_id, password)
            #         logger.info("Job %s: contraseña guardada cifrada para %s", job_id, user_id)
            #     except Exception:
            #         logger.exception("Job %s: no se pudo guardar la contraseña cifrada (no crítico, sync continúa)", job_id)

            # Token CSRF para las peticiones POST directas (cursos/notas):
            # Laravel exige el valor de la cookie XSRF-TOKEN decodificado
            # en el header X-XSRF-TOKEN — confirmado en vivo, es el bug
            # raíz de todo bloqueo CSRF con este endpoint.
            xsrf_token = None
            for c in context.cookies():
                if c["name"] == "XSRF-TOKEN":
                    xsrf_token = unquote(c["value"])
                    break

            # 2. El sandbox multifacultad siempre sincroniza un periodo
            # específico a la vez (no existe la opción de "todos" acá).
            periodos = [periodo_especifico]
            logger.info("Job %s: revisando solo el periodo %s", job_id, periodo_especifico)

            # 3. Recorrer cada periodo del rango
            for periodo in periodos:
                with _jobs_lock:
                    _jobs[job_id]["periodo_actual"] = periodo
                logger.info("Job %s: revisando periodo %s...", job_id, periodo)

                url_periodo = f"https://alumnos.uni.edu.pe/informacion-academica/cursos/{periodo}"
                page.goto(url_periodo, wait_until="domcontentloaded")

                try:
                    page.wait_for_selector("table", timeout=6000)
                except Exception:
                    continue  # Sin cursos en este periodo, salta rápido al siguiente

                filas_cursos = (
                    page.locator("table").first.locator("tbody tr").all()
                )

                # Primero recolectamos los datos básicos de TODOS los cursos de este ciclo
                cursos_temp = []
                for fila in filas_cursos:
                    cols = fila.locator("td").all()
                    if len(cols) >= 3:
                        cod_raw = cols[0].inner_text().strip()
                        nombre = cols[1].inner_text().strip()
                        creditos = cols[2].inner_text().strip()

                        if (
                            cod_raw
                            and "-" in cod_raw
                            and not cod_raw[0].isdigit()
                        ):
                            partes = [p.strip() for p in cod_raw.split("-")]
                            cod_curso = partes[0]
                            seccion = partes[1] if len(partes) > 1 else ""
                            cursos_temp.append(
                                {
                                    "cod_curso": cod_curso,
                                    "seccion": seccion,
                                    "nombre": nombre,
                                    "creditos": creditos,
                                }
                            )

                # Ahora sí, sacamos las notas de cada curso — UNA petición
                # HTTP directa por curso (el mismo endpoint que usa Intralú
                # por dentro), en vez de navegar y esperar con reintentos a
                # que Angular pinte la tabla. Esta sola llamada trae de una:
                # evaluaciones, fórmulas Y promedios ya calculados por Intralú.
                cursos_lista = []
                errores_curso = []
                for c_info in cursos_temp:
                    with _jobs_lock:
                        if _jobs[job_id].get("cancelado"):
                            raise _SyncCancelada()

                    logger.info(
                        "Job %s:   -> %s (%s)", job_id, c_info["cod_curso"], periodo,
                    )

                    evaluaciones = []
                    formula_practicas = None
                    formula_nota_final = None
                    promedio_practicas = None
                    promedio_final = None
                    nota_asistencia = None
                    datos_curso = None

                    try:
                        resp = page.request.post(
                            "https://alumnos.uni.edu.pe/informacion-academica/cursos/notas",
                            form={
                                "codper": periodo,
                                "codcur": c_info["cod_curso"],
                                "seccion": c_info["seccion"],
                            },
                            headers={
                                "X-XSRF-TOKEN": xsrf_token or "",
                                "X-Requested-With": "XMLHttpRequest",
                            },
                        )
                        if resp.ok:
                            datos_curso = resp.json()
                        else:
                            errores_curso.append({
                                "codigo": c_info["cod_curso"],
                                "seccion": c_info["seccion"],
                                "motivo": f"HTTP {resp.status} al pedir notas",
                            })
                    except Exception as e:
                        logger.info(
                            "Job %s:   %s (%s) -> error de red pidiendo notas",
                            job_id, c_info["cod_curso"], periodo,
                        )
                        errores_curso.append({
                            "codigo": c_info["cod_curso"],
                            "seccion": c_info["seccion"],
                            "motivo": str(e),
                        })

                    if datos_curso:
                        # Diagnóstico TEMPORAL: confirmar en los logs de Render
                        # la forma real de la respuesta la primera vez que esto
                        # corre en vivo, por si algún nombre de clave no calza
                        # exactamente con lo documentado. Se puede quitar una
                        # vez confirmado.
                        logger.info(
                            "Job %s:   %s (%s) -> claves recibidas: %s",
                            job_id, c_info["cod_curso"], periodo, list(datos_curso.keys()),
                        )

                        # Crudas, sin re-etiquetar: mismo esquema que ya
                        # mandaba el bookmarklet (camnot/descripcion/nota/
                        # fecha_registro_acta). simplificar_etiqueta() daba
                        # PC1/Lab1/Monografia1 — nomenclatura del catálogo
                        # viejo de producción (cursos_db_2018.js), que no es
                        # la que necesita formula-mapper.js aquí: ese archivo
                        # ya sabe construir las variables N1/N2/EP/EF/ES que
                        # formula-engine.js necesita, a partir de camnot +
                        # descripcion tal cual vienen de Intralú — no hay que
                        # reinventar esa clasificación en el backend.
                        for ev in datos_curso.get("data", []):
                            try:
                                val_n = float(ev.get("nota"))
                            except (TypeError, ValueError):
                                val_n = None
                            evaluaciones.append(
                                {
                                    "camnot": ev.get("camnot"),
                                    "descripcion": (ev.get("descripcion") or "").strip() or None,
                                    "nota": val_n,
                                    "fecha_registro_acta": ev.get("fecha_registro_acta"),
                                }
                            )

                        formulas = datos_curso.get("formulas") or {}
                        formula_practicas = formulas.get("practicas")
                        formula_nota_final = formulas.get("teoria")

                        promedios = datos_curso.get("promedios") or {}
                        promedio_practicas = promedios.get("promedio_practicas")
                        promedio_final = promedios.get("promedio_final")
                        nota_asistencia = promedios.get("nota_asistencia")

                    logger.info(
                        "Job %s:   %s (%s) -> %d evaluaciones, fórmulas: pp=%s final=%s",
                        job_id, c_info["cod_curso"], periodo, len(evaluaciones),
                        "sí" if formula_practicas else "no",
                        "sí" if formula_nota_final else "no",
                    )

                    # Nombres de campo elegidos a propósito para calzar EXACTO
                    # con lo que ya espera guardarResultadoSync() en
                    # login-multifacultad.js (formula_practicas,
                    # formula_nota_final, promedio_practicas, promedio_final,
                    # nota_asistencia) — así conectar el frontend más
                    # adelante no requiere tocar el mapeo de campos.
                    creditos_val = c_info["creditos"]
                    cursos_lista.append(
                        {
                            "codigo": c_info["cod_curso"],
                            "nombre": c_info["nombre"],
                            "creditos": int(creditos_val)
                            if creditos_val.isdigit()
                            else creditos_val,
                            "evaluaciones": evaluaciones,
                            "seccion": c_info["seccion"],
                            "formula_practicas": formula_practicas,
                            "formula_nota_final": formula_nota_final,
                            "promedio_practicas": promedio_practicas,
                            "promedio_final": promedio_final,
                            "nota_asistencia": nota_asistencia,
                        }
                    )

                if cursos_lista:
                    data_por_periodo[periodo] = {
                        "etiqueta_periodo": etiquetar_periodo(periodo),
                        "cursos": cursos_lista,
                        "errores": errores_curso,
                    }

            # 4. Avance Curricular: se aprovecha la MISMA page ya
            # autenticada (page.request comparte cookies con page) — no
            # hace falta un segundo login ni un segundo reCAPTCHA para
            # esto. Best-effort: si falla, no se aborta la sincronización
            # — las notas (lo principal) ya están listas, así que el
            # frontend simplemente no actualiza el Avance Curricular esa
            # vez y lo intenta de nuevo en la próxima sincronización.
            avance_pdf_base64 = None
            try:
                resp_avance = page.request.get(URL_AVANCE_CURRICULAR_PDF)
                if resp_avance.status == 200:
                    avance_pdf_base64 = base64.b64encode(resp_avance.body()).decode()
                else:
                    logger.warning(
                        "Job %s: Avance Curricular respondió HTTP %d, se omite esta vez",
                        job_id, resp_avance.status,
                    )
            except Exception:
                logger.exception(
                    "Job %s: no se pudo descargar el Avance Curricular (no crítico, notas ya están listas)",
                    job_id,
                )

            with _jobs_lock:
                _jobs[job_id]["status"] = "listo"
                _jobs[job_id]["periodos"] = data_por_periodo
                _jobs[job_id]["avance_pdf_base64"] = avance_pdf_base64

            duracion = time.time() - inicio
            logger.info(
                "Job %s: ✅ SINCRONIZACIÓN COMPLETA en %.1fs — %d periodos con cursos encontrados",
                job_id, duracion, len(data_por_periodo),
            )

    except _SyncCancelada:
        with _jobs_lock:
            _jobs[job_id]["status"] = "cancelado"
        logger.info("Job %s: 🛑 CANCELADO por el usuario tras %.1fs", job_id, time.time() - inicio)
    except Exception:
        logger.exception("Job %s: error durante la sincronización con Intralú", job_id)
        with _jobs_lock:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["status_code"] = 500
            _jobs[job_id]["detail"] = "No se pudo completar la sincronización con Intralú. Intenta de nuevo más tarde."
        logger.info("Job %s: ❌ TERMINÓ CON ERROR tras %.1fs", job_id, time.time() - inicio)
    finally:
        if browser:
            try:
                browser.close()
            except Exception:
                pass
        _semaforo_sync.release()


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
        }

    hilo = threading.Thread(
        target=_ejecutar_sync,
        args=(job_id, credentials.codigo, credentials.password, credentials.periodo),
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
    levanta la bandera — el hilo de _ejecutar_sync la revisa entre cada
    curso y se detiene solo, soltando el semáforo. No hay nada que
    "matar" a la fuerza: Playwright sigue corriendo dentro de ese hilo
    hasta el próximo punto de chequeo."""
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
            "periodo_actual": job.get("periodo_actual"),
            "periodos": job.get("periodos"),
            "avance_pdf_base64": job.get("avance_pdf_base64"),
        }


# ================================================================
# SINCRONIZACIÓN CON MATRÍCULA UNI (Generador de Horarios)
# A diferencia de /api/sync-intralu, esta sí es síncrona: Playwright
# solo se usa para el login (obtener el accessToken de la cookie), y
# el resto es puro `requests` contra la API de Matrícula — toma
# segundos, no minutos, así que no necesita el patrón de job/polling.
# Comparte _semaforo_sync con Intralú (mismo límite de RAM del plan
# gratuito): si ya hay una sync pesada en curso, esta espera su turno
# en vez de arrancar un segundo Chromium en paralelo.
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

    Chromium se cierra apenas se obtiene el token: todo lo demás (ficha y
    horarios) se hace con `requests`, así la RAM se libera en segundos.
    """
    estado = None
    cuerpo = {}
    url_final = None

    with Stealth().use_sync(sync_playwright()) as p:
        browser = p.chromium.launch(headless=True)
        try:
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1366, "height": 768},
                locale="es-PE",
            )
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
            browser.close()

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


@app.post("/api/sync-horarios")
def sync_horarios(credentials: LoginRequest):
    adquirido = _semaforo_sync.acquire(blocking=False)
    if not adquirido:
        raise HTTPException(
            status_code=429,
            detail="Hay una sincronización en curso ahora mismo. Intenta de nuevo en un minuto."
        )

    inicio = time.time()

    try:
        token = _obtener_token_matricula(credentials.codigo, credentials.password)
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

        duracion = time.time() - inicio
        logger.info(
            "Sync Matrícula: ✅ COMPLETA en %.1fs — %d cursos con horario, %d sin horario",
            duracion, len(carga), len(cursos_sin_horario),
        )

        return {
            "status": "success",
            "periodo": ficha.get("periodo"),
            "total_cursos": len(cursos_disponibles),
            "cursos_con_horario": len(carga),
            "cursos_sin_horario": cursos_sin_horario,
            "cursos": cursos_disponibles,
            "carga": carga,
        }

    except HTTPException:
        logger.info("Sync Matrícula: ❌ TERMINÓ CON ERROR tras %.1fs", time.time() - inicio)
        raise
    except Exception as e:
        logger.exception("Error durante la sincronización con Matrícula UNI")
        logger.info("Sync Matrícula: ❌ TERMINÓ CON ERROR tras %.1fs", time.time() - inicio)
        raise HTTPException(status_code=500, detail=f"Error en servidor: {str(e)}")
    finally:
        _semaforo_sync.release()


if __name__ == "__main__":
    import os
    import uvicorn

    # Railway asigna el puerto dinámicamente vía la variable de entorno
    # PORT. En tu máquina (sin esa variable) sigue usando 8000, como
    # hasta ahora. host="0.0.0.0" (no 127.0.0.1) porque Railway necesita
    # que el servidor escuche en todas las interfaces, no solo localhost.
    puerto = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=puerto)