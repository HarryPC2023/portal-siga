import logging
import re
import threading

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


@app.post("/api/sync-intralu")
def sync_intralu(credentials: LoginRequest):
    adquirido = _semaforo_sync.acquire(blocking=False)
    if not adquirido:
        raise HTTPException(
            status_code=429,
            detail="Hay muchas sincronizaciones en curso ahora mismo. Intenta de nuevo en un minuto.",
        )

    data_por_periodo = {}
    browser = None

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # 1. Login dinámico
            page.goto(
                "https://alumnos.uni.edu.pe/login",
                wait_until="domcontentloaded",
            )
            page.fill("#txt-codigo", credentials.codigo)
            page.fill("#txt-password", credentials.password)
            page.click("#btn-login")

            try:
                page.wait_for_url("**/home**", timeout=12000)
            except Exception:
                raise HTTPException(
                    status_code=401,
                    detail="Código o contraseña incorrectos en Intralú.",
                )

            # 2. Rango de periodos (Desde 2026 hasta 2019)
            periodos = []
            for anio in range(2026, 2018, -1):
                for tipo in ["2", "1", "3"]:
                    periodos.append(f"{anio}{tipo}")

            # 3. Recorrer cada periodo del rango
            for periodo in periodos:
                logger.info("Revisando periodo %s...", periodo)
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
                                                "etiqueta": simplificar_etiqueta(
                                                    nom_e
                                                ),
                                                "nota": val_n,
                                            }
                                        )
                    except Exception:
                        logger.info(
                            "Sin tabla de notas en %s (%s)",
                            c_info["cod_curso"],
                            periodo,
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

    except HTTPException:
        raise
    except Exception:
        logger.exception("Error durante la sincronización con Intralú")
        raise HTTPException(
            status_code=500,
            detail="No se pudo completar la sincronización con Intralú. Intenta de nuevo más tarde.",
        )
    finally:
        if browser:
            try:
                browser.close()
            except Exception:
                pass
        _semaforo_sync.release()

    return {"status": "success", "periodos": data_por_periodo}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)