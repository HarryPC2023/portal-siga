#!/usr/bin/env python3
"""
generar_carga_horario.py
─────────────────────────────────────────────────────────────────
Convierte el Excel oficial de carga horaria (el que reparte la
facultad cada ciclo) en el JSON estático que consume el Generador
de Horarios de SIGA directamente en horarios/index.html.

Reemplaza la subida manual de Excel: este script se corre UNA vez
por ciclo (localmente, con Python), y el JSON resultante se sube
al repo junto con el resto de archivos.

USO
────
    python generar_carga_horario.py <archivo.xlsx> <ciclo> [salida.json]

Ejemplos:
    python generar_carga_horario.py carga_horario_oficial_26-2.xlsx 2026-2
    python generar_carga_horario.py carga_26-2_v2.xlsx 2026-2 ../horarios/static/data/carga-2026-2.json

Si no se indica archivo de salida, se guarda como:
    carga-<ciclo>.json   (en el mismo directorio donde se ejecuta)

Requiere: pip install openpyxl
─────────────────────────────────────────────────────────────────
"""

import sys
import json
import re
import unicodedata
from collections import defaultdict
from datetime import date
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit("❌ Falta openpyxl. Instálalo con: pip install openpyxl")


# ── Columnas esperadas en el Excel oficial (mismos nombres que ── #
# ── reconoce parser.js, por si el formato de la facultad cambia) ─#
COL_KEYWORDS = {
    "codigo": [r"C[ÓO]DIGO"],
    "nombre": [r"NOMBRE DEL CURSO", r"ASIGNATURA"],
    "seccion": [r"SECCI[ÓO]N", r"GRUPO"],
    "docente": [r"APELLIDOS.*DOCENTE", r"PROFESOR"],
    "tipo": [r"^TIPO"],
    "aula": [r"AULA"],
    "dia": [r"D[ÍI]A"],
    "inicio": [r"HORA INICIO", r"H\. INICIO", r"^INICIO$"],
    "fin": [r"HORA FINAL", r"HORA FIN", r"H\. FIN", r"^FIN$"],
    "vacantes": [r"VACANTES", r"CUPOS"],
}

DIA_MAP = {
    "LU": "LUNES", "MA": "MARTES", "MI": "MIERCOLES",
    "JU": "JUEVES", "VI": "VIERNES", "SA": "SABADO", "DO": "DOMINGO",
}


def norm_str(v):
    if v is None:
        return ""
    s = str(v).replace("\u00a0", " ").strip()
    return re.sub(r"\s+", " ", s)


def quitar_tildes(s):
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if not unicodedata.combining(c))


def norm_dia(d):
    if not d:
        return ""
    s = quitar_tildes(norm_str(d).upper())
    return DIA_MAP.get(s[:2], s)


def parse_hora(h):
    """Igual que parseHora() en parser.js: acepta fracción de día de
    Excel (0.6666 = 16:00) o número entero de hora (16 = 1600)."""
    if h is None or h == "":
        return None
    if isinstance(h, (int, float)):
        if 0 < h < 1:
            total = round(h * 24 * 60)
            return (total // 60) * 100 + (total % 60)
        if 0 <= h <= 24:
            return int(h) * 100
    return None


def encontrar_fila_encabezado(rows):
    keywords = {"CÓDIGO", "CODIGO", "NOMBRE DEL CURSO", "ASIGNATURA"}
    for i, row in enumerate(rows):
        vals = {norm_str(c).upper() for c in row}
        if vals & keywords:
            return i
    return None


def mapear_columnas(header_row):
    idx = {}
    for i, val in enumerate(header_row):
        if val is None:
            continue
        key = norm_str(val).upper()
        for campo, patrones in COL_KEYWORDS.items():
            if campo in idx:
                continue
            if any(re.search(p, key) for p in patrones):
                idx[campo] = i
    return idx


def convertir(ruta_excel, ciclo):
    wb = openpyxl.load_workbook(ruta_excel, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))

    header_idx = encontrar_fila_encabezado(rows)
    if header_idx is None:
        sys.exit("❌ No se encontró la fila de encabezados (busca CÓDIGO / NOMBRE DEL CURSO).")

    col = mapear_columnas(rows[header_idx])
    requeridas = ["nombre", "seccion", "dia", "inicio", "fin"]
    faltantes = [r for r in requeridas if r not in col]
    if faltantes:
        sys.exit(f"❌ Faltan columnas obligatorias en el Excel: {', '.join(faltantes)}")

    data_rows = rows[header_idx + 1:]

    # ── Paso 1: detectar nombres de curso que repiten código distinto ──
    # (ver hallazgo: 2 casos en la carga 26-2, ej. "TALLER DE PROYECTO DE
    # INVESTIGACIÓN" existe como GE003 y como SI905). Si no se separan,
    # un curso pisa las secciones del otro porque ambos comparten nombre.
    nombre_a_codigos = defaultdict(set)
    for row in data_rows:
        if not row or all(c is None or c == "" for c in row):
            continue
        nombre = norm_str(row[col["nombre"]]) if col.get("nombre") is not None else ""
        codigo = norm_str(row[col["codigo"]]) if "codigo" in col else ""
        if nombre and codigo:
            nombre_a_codigos[nombre].add(codigo)

    nombres_colisionados = {n for n, cods in nombre_a_codigos.items() if len(cods) > 1}

    # ── Paso 2: construir la carga ──
    carga = {}
    filas_saltadas = 0
    filas_validas = 0

    for row in data_rows:
        if not row or all(c is None or c == "" for c in row):
            continue

        nombre = norm_str(row[col["nombre"]])
        seccion = norm_str(row[col["seccion"]])
        codigo = norm_str(row[col["codigo"]]) if "codigo" in col else ""
        docente = norm_str(row[col["docente"]]) if "docente" in col else ""
        docente = docente or "POR ASIGNAR"
        tipo = (norm_str(row[col["tipo"]]).upper() if "tipo" in col else "") or "P"
        aula = (norm_str(row[col["aula"]]) if "aula" in col else "") or "S/A"
        dia_raw = row[col["dia"]]
        inicio = row[col["inicio"]]
        fin = row[col["fin"]]
        vacantes = row[col["vacantes"]] if "vacantes" in col else None

        if not nombre or not seccion or not dia_raw:
            filas_saltadas += 1
            continue

        dia = norm_dia(dia_raw)
        ini = parse_hora(inicio)
        finv = parse_hora(fin)
        if ini is None or finv is None or ini >= finv:
            filas_saltadas += 1
            continue

        # Llave del curso: si el nombre colisiona entre códigos distintos,
        # se desambigua agregando el código. El resto de cursos no cambia.
        llave = f"{nombre} ({codigo})" if nombre in nombres_colisionados and codigo else nombre

        carga.setdefault(llave, {})
        if seccion not in carga[llave]:
            carga[llave][seccion] = {
                "docente": docente,
                "codigo": codigo,
                "clases": [],
            }
            if isinstance(vacantes, (int, float)):
                carga[llave][seccion]["vacantes"] = int(vacantes)

        carga[llave][seccion]["clases"].append({
            "dia": dia, "ini": ini, "fin": finv, "tipo": tipo, "aula": aula,
        })
        filas_validas += 1

    total_secciones = sum(len(v) for v in carga.values())

    salida = {
        "meta": {
            "ciclo": ciclo,
            "generado": date.today().isoformat(),
            "totalCursos": len(carga),
            "totalSecciones": total_secciones,
        },
        "cursos": carga,
    }

    print(f"✅ {len(carga)} cursos, {total_secciones} secciones. "
          f"{filas_validas} filas procesadas, {filas_saltadas} filas saltadas (incompletas).")
    if nombres_colisionados:
        print(f"⚠️  {len(nombres_colisionados)} nombre(s) de curso desambiguados por código: "
              f"{', '.join(sorted(nombres_colisionados))}")

    return salida


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)

    ruta_excel = Path(sys.argv[1])
    ciclo = sys.argv[2]
    ruta_salida = Path(sys.argv[3]) if len(sys.argv) > 3 else Path(f"carga-{ciclo}.json")

    if not ruta_excel.exists():
        sys.exit(f"❌ No se encontró el archivo: {ruta_excel}")

    resultado = convertir(ruta_excel, ciclo)

    ruta_salida.parent.mkdir(parents=True, exist_ok=True)
    with open(ruta_salida, "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, separators=(",", ":"))

    print(f"📁 Guardado en: {ruta_salida}")


if __name__ == "__main__":
    main()
