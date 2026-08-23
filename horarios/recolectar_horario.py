from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from playwright.sync_api import sync_playwright
from urllib.parse import unquote
import requests

app = FastAPI()

MATRICULA_BASE = "https://matricula-alumno.uni.edu.pe"

DIAS_MAP = {
    "LUNES": "LUNES",
    "MARTES": "MARTES",
    "MIERCOLES": "MIERCOLES",
    "JUEVES": "JUEVES",
    "VIERNES": "VIERNES",
    "SABADO": "SABADO",
    "DOMINGO": "DOMINGO",
}


class LoginRequest(BaseModel):
    codigo: str
    password: str


# ------------------------------------------------------------
# Helpers de normalización (mismo criterio que parser.js)
# ------------------------------------------------------------
def normalizar_dia(dia: str) -> str:
    if not dia:
        return ""
    s = dia.strip().upper()
    s = (s.replace("Á", "A").replace("É", "E")
           .replace("Í", "I").replace("Ó", "O").replace("Ú", "U"))
    return DIAS_MAP.get(s, s)


def hora_a_entero(hora_str: str):
    """Convierte 'HH:MM' a entero HHMM. Ej: '16:00' -> 1600"""
    if not hora_str:
        return None
    try:
        partes = hora_str.strip().split(":")
        h = int(partes[0])
        m = int(partes[1]) if len(partes) > 1 else 0
        return h * 100 + m
    except (ValueError, IndexError):
        return None


# ------------------------------------------------------------
# Login vía Playwright: solo se usa para obtener el accessToken.
# Una vez logueado, cerramos el navegador y seguimos con requests puro.
# ------------------------------------------------------------
def obtener_token_matricula(codigo: str, password: str) -> str:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Login INTRALU
        page.goto("https://alumnos.uni.edu.pe/login", wait_until="domcontentloaded")
        page.fill("input[type='text'], #txt-codigo", codigo)
        page.fill("input[type='password'], #txt-password", password)
        page.click("button:has-text('Ingresar'), #btn-login")

        try:
            page.wait_for_url("**/home**", timeout=12000)
        except Exception:
            browser.close()
            raise HTTPException(status_code=401, detail="Código o contraseña incorrectos en Intralu.")

        # 2. Login MATRÍCULA
        page.goto(f"{MATRICULA_BASE}/login", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)

        page.fill("input[type='text']", codigo)
        page.fill("input[type='password']", password)
        page.click("button:has-text('Iniciar Sesión')")

        # Esperamos a que la cookie accessToken aparezca en el contexto del navegador
        token = None
        for _ in range(20):  # hasta ~10s en total
            for c in context.cookies():
                if c["name"] == "accessToken":
                    token = c["value"]
                    break
            if token:
                break
            page.wait_for_timeout(500)

        browser.close()

        if not token:
            raise HTTPException(
                status_code=401,
                detail="Código o contraseña incorrectos en Matrícula, o no se pudo obtener el token de acceso."
            )

        # La cookie viene URL-encodeada (%7C representa el caracter '|')
        return unquote(token)


def construir_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }


# ------------------------------------------------------------
# Endpoint principal
# ------------------------------------------------------------
@app.post("/api/sync-horarios")
def sync_horarios(credentials: LoginRequest):
    try:
        token = obtener_token_matricula(credentials.codigo, credentials.password)
        headers = construir_headers(token)

        # 1. Ficha con todos los cursos disponibles del periodo
        resp_ficha = requests.get(f"{MATRICULA_BASE}/api/matricula/ficha", headers=headers, timeout=15)
        if resp_ficha.status_code != 200:
            raise HTTPException(status_code=502, detail="No se pudo obtener la ficha de matrícula.")

        ficha = resp_ficha.json()
        cursos_disponibles = ficha.get("cursos", [])

        carga = {}            # Compatible con parser.js -> para el Generador de Horarios
        cursos_sin_horario = []  # Cursos "No aperturado" o que fallaron al consultar

        for curso in cursos_disponibles:
            codigo_curso = curso.get("codigo")
            nombre_curso = (curso.get("nombre") or "").rstrip("-").strip()

            if not curso.get("tieneHorario"):
                cursos_sin_horario.append({"codigo": codigo_curso, "nombre": nombre_curso})
                continue

            resp_horario = requests.get(
                f"{MATRICULA_BASE}/api/matricula/cursos/{codigo_curso}/horarios",
                headers=headers,
                timeout=15,
            )

            if resp_horario.status_code != 200:
                cursos_sin_horario.append({
                    "codigo": codigo_curso,
                    "nombre": nombre_curso,
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
                    dia = normalizar_dia(h.get("dia"))
                    ini = hora_a_entero(h.get("horaInicio"))
                    fin = hora_a_entero(h.get("horaFin"))

                    if ini is None or fin is None or ini >= fin:
                        continue

                    if h.get("docente"):
                        docente = h["docente"]

                    clases.append({
                        "dia": dia,
                        "ini": ini,
                        "fin": fin,
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

        return {
            "status": "success",
            "periodo": ficha.get("periodo"),
            "total_cursos": len(cursos_disponibles),
            "cursos_con_horario": len(carga),
            "cursos_sin_horario": cursos_sin_horario,
            "cursos": cursos_disponibles,  # data cruda: útil para créditos, ciclo, prerequisitos, etc.
            "carga": carga,                # listo para el Generador de Horarios (mismo formato que parser.js)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en servidor: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("recolectar_horario:app", host="127.0.0.1", port=8000, reload=True)
