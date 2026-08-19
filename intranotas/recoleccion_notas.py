import datetime
import logging
import re
import threading
import time
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from playwright.sync_api import sync_playwright
from pydantic import BaseModel

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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENES_PERMITIDOS,
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# --------------------------------------------------------------
# Ahora que volvemos a visitar el detalle de cada curso, cada sync es
# pesada otra vez — bajamos el límite de simultáneas para proteger el
# servidor (sobre todo en un plan gratuito de hosting).
# --------------------------------------------------------------
MAX_SYNCS_SIMULTANEOS = 2
_semaforo_sync = threading.Semaphore(MAX_SYNCS_SIMULTANEOS)


class LoginRequest(BaseModel):
    codigo: str
    password: str


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


def determinar_periodo_actual():
    """Replica la lógica de generarPeriodosDisponibles() en intranotas.js:
    calcula el periodo (año, tipo) más reciente que YA debería existir
    según la fecha de HOY, para no intentar revisar un ciclo que ni
    siquiera ha empezado (ej. no buscar '26-3' antes de enero 2027)."""
    hoy = datetime.date.today()
    anio = hoy.year
    if hoy.month <= 2:
        return anio - 1, 3  # enero-febrero: verano, cierra el año académico anterior
    if hoy.month <= 7:
        return anio, 1  # marzo-julio
    return anio, 2  # agosto-diciembre


def extraer_anio_ingreso(codigo):
    """El código UNI empieza con el año de ingreso (ej. '20231059E' -> 2023).
    Si el código no calza con ese formato, usamos un rango conservador de
    7 años hacia atrás en vez de fallar."""
    try:
        anio = int(str(codigo).strip()[:4])
        anio_actual = datetime.date.today().year
        if 2000 <= anio <= anio_actual:
            return anio
    except (ValueError, TypeError):
        pass
    return datetime.date.today().year - 7


def construir_rango_periodos(anio_ingreso, cantidad_maxima=40):
    """Genera los códigos de periodo desde el más reciente hacia atrás,
    deteniéndose apenas se cruza el año de ingreso — así un alumno que
    entró en 2023 ya no hace perder tiempo revisando 2019 o 2020."""
    anio, tipo = determinar_periodo_actual()
    periodos = []
    for _ in range(cantidad_maxima):
        if anio < anio_ingreso:
            break
        periodos.append(f"{anio}{tipo}")
        if tipo > 1:
            tipo -= 1
        else:
            tipo = 3
            anio -= 1
    return periodos


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


def simplificar_etiqueta(texto):
    """Normaliza el nombre de una evaluación de Intralú a la MISMA
    clave exacta (mayúsculas/minúsculas incluidas) que usan los
    `components` de cursos_db_2018.js: 'PC1', 'Monografia1', 'Lab1',
    'EP', 'EF', 'ES'."""
    t = texto.upper().strip()

    m = re.search(r"PRACTICA CALIFICADA\s*(\d+)", t) or re.search(r"P\.?C\.?\s*(\d+)", t)
    if m:
        return f"PC{m.group(1)}"

    m = re.search(r"MONOGRAF[IÍ]A\s*(\d+)", t)
    if m:
        return f"Monografia{m.group(1)}"

    # OJO Harry: no tengo el texto real de Intralú para un curso con labs
    # (Química/Física) todavía — este patrón cubre "LABORATORIO 1" y
    # "LAB 1". Si al probar un curso real sale distinto, mándame el texto
    # exacto y ajusto el regex.
    m = re.search(r"LABORATORIO\s*(\d+)", t) or re.search(r"\bLAB\s*(\d+)", t)
    if m:
        return f"Lab{m.group(1)}"

    if "EXAMEN PARCIAL" in t:
        return "EP"
    if "EXAMEN FINAL" in t:
        return "EF"
    if "EXAMEN SUSTITUTORIO" in t:
        return "ES"
    return t


def _ejecutar_sync(job_id, codigo, password):
    """Corre en un hilo aparte (no bloquea ningún request HTTP). Guarda
    el progreso y el resultado final en _jobs[job_id] para que el
    frontend los recoja haciendo polling contra GET /api/sync-intralu/{job_id}."""
    adquirido = _semaforo_sync.acquire(blocking=False)
    if not adquirido:
        with _jobs_lock:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["status_code"] = 429
            _jobs[job_id]["detail"] = "Hay muchas sincronizaciones en curso ahora mismo. Intenta de nuevo en un minuto."
        return

    data_por_periodo = {}
    browser = None

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # 1. Login dinámico
            page.goto("https://alumnos.uni.edu.pe/login", wait_until="domcontentloaded")
            page.fill("#txt-codigo", codigo)
            page.fill("#txt-password", password)
            page.click("#btn-login")

            try:
                page.wait_for_url("**/home**", timeout=12000)
            except Exception:
                with _jobs_lock:
                    _jobs[job_id]["status"] = "error"
                    _jobs[job_id]["status_code"] = 401
                    _jobs[job_id]["detail"] = "Código o contraseña incorrectos en Intralú."
                return

            # 2. Rango de periodos acotado por el año de ingreso (del código)
            # y por el periodo real más reciente según la fecha de hoy.
            anio_ingreso = extraer_anio_ingreso(codigo)
            periodos = construir_rango_periodos(anio_ingreso)
            logger.info(
                "Job %s: revisando %d periodos (desde el ingreso %d)",
                job_id, len(periodos), anio_ingreso,
            )

            # 3. Recorrer cada periodo del rango
            for periodo in periodos:
                with _jobs_lock:
                    _jobs[job_id]["periodo_actual"] = periodo
                logger.info("Job %s: revisando periodo %s...", job_id, periodo)

                url_periodo = f"https://alumnos.uni.edu.pe/informacion-academica/cursos/{periodo}"
                page.goto(url_periodo, wait_until="domcontentloaded")

                try:
                    page.wait_for_selector("table", timeout=3000)
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

                # Ahora sí, visitamos el detalle de cada curso para sacar sus notas.
                cursos_lista = []
                for c_info in cursos_temp:
                    url_det = f"https://alumnos.uni.edu.pe/informacion-academica/cursos/{periodo}/{c_info['cod_curso']}/{c_info['seccion']}"

                    # networkidle (no domcontentloaded): la tabla de notas de
                    # esta página en particular parece cargar vía JS después
                    # del render inicial — con domcontentloaded llegábamos
                    # antes de que existieran las filas, por eso siempre
                    # salía vacío. Esperamos a que la red se calme.
                    try:
                        page.goto(url_det, wait_until="networkidle", timeout=15000)
                    except Exception:
                        page.goto(url_det, wait_until="domcontentloaded")

                    evaluaciones = []
                    try:
                        # Esperamos FILAS reales, no solo el tag <table> vacío.
                        page.wait_for_selector("table tbody tr", timeout=8000)
                        for t in page.locator("table").all():
                            for f in t.locator("tbody tr").all():
                                c = f.locator("td").all()
                                if len(c) >= 2:
                                    nom_e = c[0].inner_text().strip()
                                    not_e = c[1].inner_text().strip()
                                    if nom_e and not nom_e.isdigit():
                                        try:
                                            val_n = float(not_e)
                                        except ValueError:
                                            val_n = None
                                        evaluaciones.append(
                                            {
                                                "etiqueta": simplificar_etiqueta(nom_e),
                                                "nota": val_n,
                                            }
                                        )
                    except Exception:
                        logger.info(
                            "Job %s: sin tabla de notas en %s (%s)",
                            job_id, c_info["cod_curso"], periodo,
                        )

                    creditos_val = c_info["creditos"]
                    cursos_lista.append(
                        {
                            "codigo": c_info["cod_curso"],
                            "nombre": c_info["nombre"],
                            "creditos": int(creditos_val)
                            if creditos_val.isdigit()
                            else creditos_val,
                            "evaluaciones": evaluaciones,
                        }
                    )

                if cursos_lista:
                    data_por_periodo[periodo] = {
                        "etiqueta_periodo": etiquetar_periodo(periodo),
                        "cursos": cursos_lista,
                    }

            with _jobs_lock:
                _jobs[job_id]["status"] = "listo"
                _jobs[job_id]["periodos"] = data_por_periodo

    except Exception:
        logger.exception("Job %s: error durante la sincronización con Intralú", job_id)
        with _jobs_lock:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["status_code"] = 500
            _jobs[job_id]["detail"] = "No se pudo completar la sincronización con Intralú. Intenta de nuevo más tarde."
    finally:
        if browser:
            try:
                browser.close()
            except Exception:
                pass
        _semaforo_sync.release()


@app.post("/api/sync-intralu")
def iniciar_sync(credentials: LoginRequest):
    """Responde AL INSTANTE con un job_id — no espera a que termine el
    scraping. La sincronización real corre en un hilo aparte."""
    _limpiar_jobs_viejos()

    job_id = str(uuid.uuid4())
    with _jobs_lock:
        _jobs[job_id] = {
            "status": "en_progreso",
            "creado_en": time.time(),
            "periodo_actual": None,
        }

    hilo = threading.Thread(
        target=_ejecutar_sync,
        args=(job_id, credentials.codigo, credentials.password),
        daemon=True,
    )
    hilo.start()

    return {"job_id": job_id}


@app.get("/api/sync-intralu/{job_id}")
def consultar_sync(job_id: str):
    """El frontend llama esto cada pocos segundos hasta que status
    sea 'listo' (o falle con un error)."""
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
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)