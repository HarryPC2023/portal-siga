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
# allow_credentials=False porque no dependemos de cookies de
# navegador entre SIGA y este backend (mandamos JSON puro por
# fetch), así que no hace falta la combinación peligrosa de
# origin comodín + credenciales.
# --------------------------------------------------------------
ORIGENES_PERMITIDOS = [
    "http://localhost:4000",   # Jekyll en local — ajusta el puerto si usas otro
    "http://127.0.0.1:4000",
    "https://harrypc2023.github.io",  # TODO Harry: confirma que este es tu dominio real de producción
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENES_PERMITIDOS,
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# --------------------------------------------------------------
# Límite de sincronizaciones simultáneas: cada una abre un
# Chromium headless completo, así que no queremos que 20 alumnos
# lo disparen a la vez y tumben el servidor.
# --------------------------------------------------------------
MAX_SYNCS_SIMULTANEOS = 3
_semaforo_sync = threading.Semaphore(MAX_SYNCS_SIMULTANEOS)


class LoginRequest(BaseModel):
    codigo: str
    password: str


def etiquetar_periodo(cod):
    """Convierte el código crudo de Intralú (ej. '20261') a la misma
    clave que usa Intranotas en localStorage (ej. '2026-1').

    El verano (tipo '3') se etiqueta con el año académico que CIERRA,
    no con el año calendario en el que cae dentro de Intralú:
    '20263' (verano de enero-febrero 2026) se guarda como '2025-3',
    igual que lo hace generarPeriodosDisponibles() en intranotas.js.
    """
    cod = str(cod).strip()
    if len(cod) == 5:
        anio, tipo = int(cod[:4]), cod[4]
        if tipo == "1":
            return f"{anio}-1"
        if tipo == "2":
            return f"{anio}-2"
        if tipo == "3":
            return f"{anio - 1}-3"
    return cod


def simplificar_etiqueta(texto):
    t = texto.upper().strip()
    t = re.sub(r"PRACTICA CALIFICADA\s*(\d+)", r"PC\1", t)
    t = re.sub(r"P\.C\.\s*(\d+)", r"PC\1", t)
    t = re.sub(r"MONOGRAFIA\s*(\d+)", r"MONOGRAFIA\1", t)
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

            # 2. Rango de periodos optimizado (Desde 2026 hasta 2019)
            periodos = []
            for anio in range(2026, 2018, -1):
                for tipo in ["2", "1", "3"]:
                    periodos.append(f"{anio}{tipo}")

            # 3. Recorrer cada periodo del rango
            for periodo in periodos:
                url_periodo = f"https://alumnos.uni.edu.pe/informacion-academica/cursos/{periodo}"
                page.goto(url_periodo, wait_until="domcontentloaded")

                try:
                    page.wait_for_selector("table", timeout=3000)
                except Exception:
                    continue  # Si no hay cursos en este periodo, salta al siguiente de forma rápida

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

                # Ahora sí, visitamos el detalle de cada curso recolectado sin perdernos ninguno
                cursos_lista = []
                for c_info in cursos_temp:
                    url_det = f"https://alumnos.uni.edu.pe/informacion-academica/cursos/{periodo}/{c_info['cod_curso']}/{c_info['seccion']}"
                    page.goto(url_det, wait_until="domcontentloaded")

                    evaluaciones = []
                    try:
                        page.wait_for_selector("table", timeout=3000)
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
                        pass

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
        # El detalle completo del error queda SOLO en tu log de servidor
        # (nunca incluye las credenciales, que no se tocan en este bloque).
        # Al cliente le devolvemos un mensaje genérico para no filtrar
        # detalles internos (rutas, selectores, stack trace, etc.).
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
