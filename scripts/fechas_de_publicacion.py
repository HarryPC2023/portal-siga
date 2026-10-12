#!/usr/bin/env python3
"""
Calcula la fecha de publicación de cada asesoría web a partir del historial
de Git y la deja en <carpeta_site>/js/asesorias-fechas.js, que el catálogo
(js/asesorias-cursos.js) lee para marcar "Nuevo" durante 14 días.

La fecha de una asesoría es el día en que su carpeta entró al repositorio:

    assets/asesorias/<curso>/<periodo>/<evaluacion>/index.html

Uso (lo ejecuta el despliegue de GitHub Actions, después de compilar con
Jekyll y antes de inyectar la versión):

    python3 scripts/fechas_de_publicacion.py ./_site

Nunca hace fallar el despliegue: si algo sale mal deja el archivo vacío y
avisa en el log de Actions (aviso amarillo). Con el archivo vacío el sitio
funciona igual, solo que sin etiquetas "Nuevo" automáticas.
"""
import json
import os
import subprocess
import sys

BASE = "assets/asesorias"


def git(*args):
    return subprocess.run(
        ["git", *args], capture_output=True, text=True, check=True
    ).stdout


def aviso(mensaje):
    # En GitHub Actions esta línea se ve como un aviso amarillo.
    print(f"::warning::{mensaje}")


def carpetas_de_asesorias():
    """Devuelve claves 'curso/periodo/evaluacion' que tienen un index.html."""
    claves = []
    if not os.path.isdir(BASE):
        return claves
    for curso in sorted(os.listdir(BASE)):
        ruta_curso = os.path.join(BASE, curso)
        if curso.startswith(".") or not os.path.isdir(ruta_curso):
            continue
        for periodo in sorted(os.listdir(ruta_curso)):
            ruta_periodo = os.path.join(ruta_curso, periodo)
            if periodo.startswith(".") or not os.path.isdir(ruta_periodo):
                continue
            for evaluacion in sorted(os.listdir(ruta_periodo)):
                ruta_eval = os.path.join(ruta_periodo, evaluacion)
                if os.path.isfile(os.path.join(ruta_eval, "index.html")):
                    claves.append(f"{curso}/{periodo}/{evaluacion}")
    return claves


def fecha_de_alta(clave):
    """Fecha (AAAA-MM-DD) del primer commit que agregó archivos a la carpeta."""
    salida = git(
        "log", "--diff-filter=A", "--no-renames", "--format=%cs",
        "--", f"{BASE}/{clave}",
    )
    fechas = salida.split()
    return fechas[-1] if fechas else None  # git lista del más nuevo al más viejo


def main():
    if len(sys.argv) < 2:
        print("Uso: fechas_de_publicacion.py <carpeta_site>")
        sys.exit(1)
    site_dir = sys.argv[1]

    fechas = {}
    try:
        if git("rev-parse", "--is-shallow-repository").strip() == "true":
            # Con un clon superficial TODO parecería agregado en el último
            # commit y todas las asesorías saldrían como "Nuevo": mejor no
            # inventar fechas.
            aviso("El repositorio se descargó incompleto; no se calculan las fechas "
                  "de las asesorias. Revisa que actions/checkout use fetch-depth: 0.")
        else:
            for clave in carpetas_de_asesorias():
                fecha = fecha_de_alta(clave)
                if fecha:
                    fechas[clave] = fecha
                else:
                    aviso(f"Sin fecha en Git para {clave} (carpeta sin commit todavia).")
    except Exception as error:  # noqa: BLE001 - jamas romper el despliegue
        aviso(f"No se pudieron calcular las fechas de las asesorias: {error}")
        fechas = {}

    destino = os.path.join(site_dir, "js", "asesorias-fechas.js")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    cuerpo = json.dumps(fechas, indent=2, sort_keys=True, ensure_ascii=False)
    with open(destino, "w", encoding="utf-8") as f:
        f.write(
            "// GENERADO en el despliegue por scripts/fechas_de_publicacion.py. No editar.\n"
            f"export const FECHAS = {cuerpo};\n"
        )
    print(f"Listo: {len(fechas)} fechas de asesorias escritas en {destino}.")


if __name__ == "__main__":
    main()
