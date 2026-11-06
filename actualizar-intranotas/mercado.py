"""
Módulo Mercado (SIGA) — recibe las ofertas laborales que captura la extensión del navegador y las entrega a
Supabase para el Mapa de Competencias y la Ruta Profesional.

  GET  /api/mercado/catalogo   Público. Competencias activas (slug, nombre, área, variantes), con caché de 10 min.
  POST /api/mercado/ofertas    Solo con la clave de la extensión. Valida, limpia la URL, calcula la huella y llama a
                               la función registrar_oferta() de Supabase. La base de datos es la autoridad final:
                               aquí se validan los mismos límites solo para dar un error claro y rápido.

SEGURIDAD
  - Variables de entorno en Render: SUPABASE_URL, SUPABASE_ANON_KEY (ya existen), SECRETO_OFERTAS (el secreto que
    vive en la tabla sync_config de Supabase, clave 'secreto_ofertas') y CLAVE_EXTENSION (la clave de la extensión).
    Si falta CLAVE_EXTENSION, el POST queda apagado (503) sin tocar código.
  - Jamás se usa una llave de servicio de Supabase: solo la pública (anon) más el secreto. Si SUPABASE_ANON_KEY
    parece una llave de servicio, no se envía nada.
  - Jamás se escribe en los logs el cuerpo de las solicitudes ni ningún secreto.
  - Las respuestas no incluyen detalles internos de Supabase ni trazas.

AISLAMIENTO
  - Este archivo NO importa nada de scraping_intralu.py (ese archivo corre como programa principal: importarlo de
    vuelta crearía el servidor dos veces). Por eso copia un par de funciones pequeñas.
  - scraping_intralu.py lo carga dentro de un try/except: si este módulo fallara, Intranotas y Horarios siguen
    funcionando y el error (con traceback) queda en los logs.
"""
import base64
import hashlib
import hmac
import json
import logging
import os
import re
import threading
import time
from collections import deque
from datetime import date
from typing import List, Literal, Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import requests
from fastapi import APIRouter, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

logger = logging.getLogger("recoleccion_notas")   # el mismo logger del resto del backend

# --------------------------------------------------------------
# Ajustes (todo se cambia aquí)
# --------------------------------------------------------------
TAMANO_MAXIMO_CUERPO = 60000        # bytes; igual que el tope de la función registrar_oferta
LIMITE_SOLICITUDES = 30             # ofertas por ventana (solo cuentan las solicitudes con clave correcta)
VENTANA_SEGUNDOS = 60
CACHE_CATALOGO_SEGUNDOS = 600       # 10 minutos
TIMEOUT_SUPABASE_SEGUNDOS = 15
LARGO_MINIMO_CLAVE_EXTENSION = 32

# Dominios aceptados por fuente: si la URL no es de esa fuente, algo anda mal en la extensión.
DOMINIOS_POR_FUENTE = {
    "linkedin": ("linkedin.com",),
    "bumeran": ("bumeran.com.pe", "bumeran.com"),
    "computrabajo": ("computrabajo.com",),
    "empleos_peru": ("empleosperu.gob.pe",),
}

# Parámetros de rastreo conocidos. Se quitan SOLO estos (no todos): así dos ofertas distintas nunca se
# confunden por perder un parámetro que sí las identificaba.
PARAMETROS_RASTREO = {
    "fbclid", "gclid", "msclkid", "dclid", "twclid", "yclid", "igshid", "mc_cid", "mc_eid",
    "trk", "trkinfo", "trackingid", "refid", "ref", "referrer", "_hsenc", "_hsmi",
}

router = APIRouter()


# --------------------------------------------------------------
# Configuración y utilidades
# --------------------------------------------------------------
def _es_llave_de_servicio(llave):
    """Copia de la función del mismo nombre de scraping_intralu.py (aquí no se puede importar)."""
    if llave.startswith("sb_secret_"):
        return True
    if llave.count(".") == 2:
        try:
            cuerpo = llave.split(".")[1]
            datos = base64.urlsafe_b64decode(cuerpo + "=" * (-len(cuerpo) % 4)).decode("utf-8", "ignore")
            return "service_role" in datos
        except Exception:
            return False
    return False


def _config():
    return {
        "url": os.environ.get("SUPABASE_URL", "").strip().rstrip("/"),
        "anon": os.environ.get("SUPABASE_ANON_KEY", "").strip(),
        "secreto": os.environ.get("SECRETO_OFERTAS", "").strip(),
        "clave_extension": os.environ.get("CLAVE_EXTENSION", "").strip(),
    }


def _cabeceras_supabase(anon):
    # Las llaves nuevas ("sb_publishable_…") no son JWT y van solo en `apikey`; las antiguas (JWT) también como Bearer.
    cabeceras = {"apikey": anon, "Content-Type": "application/json"}
    if anon.count(".") == 2:
        cabeceras["Authorization"] = f"Bearer {anon}"
    return cabeceras


def _supabase_listo(config, con_secreto):
    """True si se puede hablar con Supabase de forma segura."""
    if not config["url"] or not config["anon"]:
        return False
    if _es_llave_de_servicio(config["anon"]):
        return False
    if con_secreto and not config["secreto"]:
        return False
    return True


def _avisar_estado():
    """Al arrancar deja en el log qué variables están puestas, SIN mostrar ningún valor. Del secreto muestra su
    largo y una huella de 4 caracteres para compararla con la de Supabase."""
    config = _config()
    secreto = config["secreto"]
    partes = [
        "SUPABASE_URL " + ("ok" if config["url"] else "FALTA"),
        "SUPABASE_ANON_KEY " + ("ok" if config["anon"] else "FALTA"),
        ("SECRETO_OFERTAS ok (%d caracteres, huella %s)" % (len(secreto), hashlib.sha256(secreto.encode("utf-8")).hexdigest()[:4]))
        if secreto else "SECRETO_OFERTAS FALTA",
        ("CLAVE_EXTENSION ok (%d caracteres)" % len(config["clave_extension"]))
        if len(config["clave_extension"]) >= LARGO_MINIMO_CLAVE_EXTENSION
        else "CLAVE_EXTENSION FALTA o es muy corta (POST apagado)",
    ]
    if config["anon"] and _es_llave_de_servicio(config["anon"]):
        partes.append("¡ATENCIÓN! SUPABASE_ANON_KEY es una llave de SERVICIO: Mercado no la usará")
    logger.info("Mercado: %s", " · ".join(partes))


def _respuesta(http, contenido):
    return JSONResponse(status_code=http, content=contenido, headers={"Cache-Control": "no-store"})


def _error(http, codigo, **extra):
    return _respuesta(http, {"success": False, "status": "error", "code": codigo, **extra})


# --------------------------------------------------------------
# Límite de frecuencia (en memoria; protege contra bucles de la extensión, NO es la defensa de seguridad:
# la defensa es el secreto de la función registrar_oferta)
# --------------------------------------------------------------
_marcas = deque()
_marcas_lock = threading.Lock()


def _permitir_solicitud():
    ahora = time.monotonic()
    with _marcas_lock:
        while _marcas and ahora - _marcas[0] > VENTANA_SEGUNDOS:
            _marcas.popleft()
        if len(_marcas) >= LIMITE_SOLICITUDES:
            return False
        _marcas.append(ahora)
        return True


# --------------------------------------------------------------
# Validación de la oferta (mismos límites que la función SQL; la base decide al final)
# --------------------------------------------------------------
_ESPACIOS = re.compile(r"\s+")
_TIENE_LETRA_O_NUMERO = re.compile(r"[^\W_]")


def _limpiar_texto(valor):
    return _ESPACIOS.sub(" ", valor.replace("\u00a0", " ")).strip()


class _DatoInvalido(Exception):
    def __init__(self, campos):
        super().__init__("dato inválido")
        self.campos = campos


class Requisito(BaseModel):
    model_config = ConfigDict(extra="forbid")

    competencia: str = Field(min_length=1, max_length=60)
    nivel: Optional[Literal["basico", "intermedio", "avanzado"]] = None
    tipo: Literal["obligatorio", "deseable"] = "obligatorio"
    fragmento: Optional[str] = Field(default=None, max_length=220)

    @field_validator("competencia", "tipo", mode="before")
    @classmethod
    def _minusculas(cls, v):
        return _limpiar_texto(v).lower() if isinstance(v, str) else v

    @field_validator("nivel", mode="before")
    @classmethod
    def _nivel(cls, v):
        if isinstance(v, str):
            return _limpiar_texto(v).lower() or None
        return v

    @field_validator("fragmento", mode="before")
    @classmethod
    def _fragmento_limpio(cls, v):
        if isinstance(v, str):
            return _limpiar_texto(v) or None
        return v

    @field_validator("fragmento")
    @classmethod
    def _fragmento_corto(cls, v):
        # "menos de 20 palabras": cuentan solo los trozos con alguna letra o número (igual que la función SQL)
        if v is not None and sum(1 for t in v.split(" ") if _TIENE_LETRA_O_NUMERO.search(t)) > 19:
            raise ValueError("fragmento demasiado largo")
        return v


class Oferta(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fuente: Literal["linkedin", "bumeran", "computrabajo", "empleos_peru"]
    url: str = Field(min_length=1, max_length=1500)
    puesto: str = Field(min_length=1, max_length=200)
    ubicacion: Optional[str] = Field(default=None, max_length=150)
    fecha_publicacion: Optional[str] = None
    empresa: Optional[str] = Field(default=None, max_length=150)
    carreras_mencionadas: List[str] = Field(default_factory=list, max_length=10)
    requisitos: List[Requisito] = Field(min_length=1, max_length=40)

    @field_validator("fuente", mode="before")
    @classmethod
    def _fuente(cls, v):
        return _limpiar_texto(v).lower() if isinstance(v, str) else v

    @field_validator("puesto", "ubicacion", "empresa", mode="before")
    @classmethod
    def _textos(cls, v):
        if isinstance(v, str):
            return _limpiar_texto(v) or None
        return v

    @field_validator("puesto")
    @classmethod
    def _puesto_obligatorio(cls, v):
        if not v:
            raise ValueError("puesto vacío")
        return v

    @field_validator("fecha_publicacion", mode="before")
    @classmethod
    def _fecha(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return None
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
                raise ValueError("fecha inválida")
            try:
                date.fromisoformat(v)
            except ValueError:
                raise ValueError("fecha inválida")
            return v
        raise ValueError("fecha inválida")

    @field_validator("carreras_mencionadas", mode="before")
    @classmethod
    def _carreras(cls, v):
        if v is None:
            return []
        if not isinstance(v, list):
            raise ValueError("debe ser una lista")
        limpias = []
        for texto in v:
            if not isinstance(texto, str):
                raise ValueError("cada carrera debe ser texto")
            texto = _limpiar_texto(texto)
            if len(texto) > 120:
                raise ValueError("carrera demasiado larga")
            if texto:
                limpias.append(texto)
        return limpias


def _campos_con_error(error):
    """Nombres de los campos con problema (por ejemplo 'requisitos.0.nivel'), NUNCA el valor recibido."""
    campos = []
    for e in error.errors():
        ruta = ".".join(str(parte) for parte in e.get("loc", ())) or "cuerpo"
        if ruta not in campos:
            campos.append(ruta)
    return campos[:10]


# --------------------------------------------------------------
# URL limpia y huella
# --------------------------------------------------------------
def _es_rastreo(nombre):
    nombre = nombre.lower()
    return nombre.startswith("utm_") or nombre in PARAMETROS_RASTREO


def _id_linkedin(partes):
    coincidencia = re.search(r"/jobs/view/(?:[^/?#]*-)?(\d{6,})/?$", partes.path)
    if coincidencia:
        return coincidencia.group(1)
    for nombre, valor in parse_qsl(partes.query):
        if nombre.lower() == "currentjobid" and re.fullmatch(r"\d{6,}", valor):
            return valor
    return None


def limpiar_url(fuente, url_original):
    """Devuelve la URL limpia (solo https, sin rastreadores, sin #fragmento, parámetros en orden). Para LinkedIn
    devuelve siempre la forma corta https://www.linkedin.com/jobs/view/<id>. Si la URL no sirve, lanza _DatoInvalido."""
    try:
        partes = urlsplit(url_original.strip())
        host = (partes.hostname or "").lower()
        puerto = partes.port
    except ValueError:
        raise _DatoInvalido(["url"])
    if partes.scheme.lower() != "https" or not host:
        raise _DatoInvalido(["url"])
    if not any(host == d or host.endswith("." + d) for d in DOMINIOS_POR_FUENTE[fuente]):
        raise _DatoInvalido(["url"])

    if fuente == "linkedin":
        id_oferta = _id_linkedin(partes)
        if not id_oferta:
            raise _DatoInvalido(["url"])
        return f"https://www.linkedin.com/jobs/view/{id_oferta}"

    consulta = sorted((k, v) for k, v in parse_qsl(partes.query, keep_blank_values=True) if not _es_rastreo(k))
    ruta = partes.path.rstrip("/") or "/"
    servidor = host if puerto in (None, 443) else f"{host}:{puerto}"
    return urlunsplit(("https", servidor, ruta, urlencode(consulta), ""))


def calcular_huella(fuente, url_limpia):
    """Determinista: misma fuente y misma URL limpia dan siempre la misma huella (SHA-256 en hexadecimal)."""
    return hashlib.sha256(f"{fuente}|{url_limpia}".encode("utf-8")).hexdigest()


# --------------------------------------------------------------
# Llamadas a Supabase
# --------------------------------------------------------------
_DETALLE_SEGURO = re.compile(r"^[a-záéíóúñ_ ]{1,40}$")


def _procesar_oferta(datos):
    config = _config()
    if not _supabase_listo(config, con_secreto=True):
        logger.error("Mercado: faltan variables de Supabase o la llave pública no es válida; no se puede guardar la oferta")
        return _error(503, "error_interno")

    # 1. Validación
    try:
        if not isinstance(datos, dict):
            raise _DatoInvalido(["cuerpo"])
        oferta = Oferta.model_validate(datos)
        url_limpia = limpiar_url(oferta.fuente, oferta.url)
    except ValidationError as error:
        return _error(422, "datos_invalidos", campos=_campos_con_error(error))
    except _DatoInvalido as error:
        return _error(422, "datos_invalidos", campos=error.campos)

    # 2. Lo que se envía a la función SQL (la extensión nunca conoce ids ni la huella)
    paquete = {
        "fuente": oferta.fuente,
        "url": url_limpia,
        "huella": calcular_huella(oferta.fuente, url_limpia),
        "puesto": oferta.puesto,
        "ubicacion": oferta.ubicacion,
        "fecha_publicacion": oferta.fecha_publicacion,
        "empresa": oferta.empresa,
        "carreras_mencionadas": oferta.carreras_mencionadas,
        "requisitos": [
            {"competencia": r.competencia, "nivel": r.nivel, "tipo": r.tipo, "fragmento": r.fragmento}
            for r in oferta.requisitos
        ],
    }
    huella_corta = paquete["huella"][:8]

    # 3. Llamada a Supabase: llave pública + secreto B (nunca service_role)
    try:
        respuesta = requests.post(
            f"{config['url']}/rest/v1/rpc/registrar_oferta",
            json={"secreto": config["secreto"], "datos": paquete},
            headers=_cabeceras_supabase(config["anon"]),
            timeout=TIMEOUT_SUPABASE_SEGUNDOS,
        )
    except requests.RequestException as error:
        logger.error("Mercado: no se pudo hablar con Supabase (%s)", type(error).__name__)
        return _error(502, "error_interno")

    # 4. Respuesta de la función
    if respuesta.status_code == 200:
        try:
            resultado = respuesta.json()
            estado = resultado.get("resultado")
        except ValueError:
            estado = None
        if estado == "creada":
            logger.info("Mercado: oferta creada (%s, %d requisitos, huella %s)", oferta.fuente, len(oferta.requisitos), huella_corta)
            return _respuesta(201, {
                "success": True, "status": "created",
                "requisitos": resultado.get("requisitos"),
                "carreras_relacionadas": resultado.get("carreras_relacionadas"),
                "carreras_pendientes": resultado.get("carreras_pendientes"),
            })
        if estado == "duplicada":
            logger.info("Mercado: oferta duplicada (%s, huella %s)", oferta.fuente, huella_corta)
            return _respuesta(200, {"success": True, "status": "duplicate"})
        logger.error("Mercado: respuesta inesperada de registrar_oferta")
        return _error(502, "error_interno")

    # La función rechazó la operación (o Supabase falló): el detalle va al log, no al cliente.
    try:
        cuerpo_error = respuesta.json()
        codigo_sql = str(cuerpo_error.get("code", ""))
        mensaje = str(cuerpo_error.get("message", ""))[:120]
    except ValueError:
        codigo_sql, mensaje = "", ""

    if codigo_sql == "22023":
        logger.warning("Mercado: la base rechazó la oferta (%s, huella %s): %s", oferta.fuente, huella_corta, mensaje)
        detalle = mensaje.split(":", 1)[1].strip() if mensaje.startswith("datos_invalidos:") else ""
        extra = {"detalle": detalle} if _DETALLE_SEGURO.match(detalle) else {}
        return _error(422, "datos_invalidos", **extra)
    if codigo_sql == "42501":
        logger.error("Mercado: Supabase rechazó el secreto o el permiso de registrar_oferta (revisa SECRETO_OFERTAS en Render)")
        return _error(502, "error_interno")
    logger.error("Mercado: Supabase respondió HTTP %d (código %s): %s", respuesta.status_code, codigo_sql or "?", mensaje)
    return _error(502, "error_interno")


# --------------------------------------------------------------
# Catálogo de competencias (caché de 10 minutos; si Supabase falla se conserva el último catálogo válido)
# --------------------------------------------------------------
_cache = {"competencias": None, "version": None, "expira": 0.0}
_cache_lock = threading.Lock()


def _pedir_catalogo(config):
    respuesta = requests.get(
        f"{config['url']}/rest/v1/competencias",
        params={"select": "slug,nombre,area,variantes", "estado": "eq.activa", "order": "area.asc,nombre.asc"},
        headers=_cabeceras_supabase(config["anon"]),
        timeout=TIMEOUT_SUPABASE_SEGUNDOS,
    )
    if respuesta.status_code != 200:
        raise RuntimeError(f"HTTP {respuesta.status_code}")
    filas = respuesta.json()
    if not isinstance(filas, list) or not filas:
        raise RuntimeError("catálogo vacío")
    return [
        {"slug": f["slug"], "nombre": f["nombre"], "area": f["area"], "variantes": list(f.get("variantes") or [])}
        for f in filas
    ]


def _obtener_catalogo():
    ahora = time.monotonic()
    with _cache_lock:
        if _cache["competencias"] is not None and ahora < _cache["expira"]:
            return _respuesta(200, {"success": True, "version": _cache["version"], "competencias": _cache["competencias"]})

    config = _config()
    try:
        if not _supabase_listo(config, con_secreto=False):
            raise RuntimeError("faltan variables de Supabase o llave no válida")
        competencias = _pedir_catalogo(config)
    except Exception as error:
        with _cache_lock:
            if _cache["competencias"] is not None:
                logger.warning("Mercado: no se pudo actualizar el catálogo (%s); se entrega el último válido", error)
                return _respuesta(200, {"success": True, "version": _cache["version"], "competencias": _cache["competencias"]})
        logger.error("Mercado: no se pudo leer el catálogo y no hay copia guardada (%s)", error)
        return _error(503, "error_interno")

    version = hashlib.sha256(json.dumps(competencias, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()[:12]
    with _cache_lock:
        _cache.update({"competencias": competencias, "version": version, "expira": time.monotonic() + CACHE_CATALOGO_SEGUNDOS})
    return _respuesta(200, {"success": True, "version": version, "competencias": competencias})


# --------------------------------------------------------------
# Rutas
# --------------------------------------------------------------
@router.get("/api/mercado/catalogo")
async def catalogo_de_competencias():
    return await run_in_threadpool(_obtener_catalogo)


@router.post("/api/mercado/ofertas")
async def recibir_oferta(request: Request):
    clave_correcta = _config()["clave_extension"]
    if len(clave_correcta) < LARGO_MINIMO_CLAVE_EXTENSION:
        return _error(503, "error_interno")          # sin CLAVE_EXTENSION el POST queda apagado

    # 1. Clave (se revisa antes de leer el cuerpo: sin clave no se procesa nada)
    recibida = request.headers.get("x-clave-extension", "")
    if not hmac.compare_digest(recibida.encode("utf-8"), clave_correcta.encode("utf-8")):
        return _error(401, "no_autorizada")

    # 2. Frecuencia
    if not _permitir_solicitud():
        return _error(429, "demasiadas_solicitudes")

    # 3. Tamaño del cuerpo
    declarado = request.headers.get("content-length", "")
    if declarado.isdigit() and int(declarado) > TAMANO_MAXIMO_CUERPO:
        return _error(422, "datos_invalidos", campos=["cuerpo"])
    cuerpo = await request.body()
    if len(cuerpo) > TAMANO_MAXIMO_CUERPO:
        return _error(422, "datos_invalidos", campos=["cuerpo"])
    try:
        datos = json.loads(cuerpo)
    except ValueError:
        return _error(422, "datos_invalidos", campos=["cuerpo"])

    # 4. Todo lo demás (validar y hablar con Supabase) en un hilo, para no frenar al resto del servidor
    return await run_in_threadpool(_procesar_oferta, datos)


def registrar_rutas_mercado(app):
    """Lo llama scraping_intralu.py dentro de un try/except."""
    app.include_router(router)
    _avisar_estado()
