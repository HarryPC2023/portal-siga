#!/usr/bin/env python3
# ============================================================
# Genera el SQL de importación de Opiniones a partir de los 6
# archivos consolidado_*.json. Pensado para volver a correrse cada
# vez que actualices el contenido de los JSON — solo reemplaza los
# 6 archivos en la misma carpeta y vuelve a ejecutar este script.
#
# El editor SQL de Supabase (el de la web) rechaza queries muy
# grandes ("Query is too large to be run via the SQL Editor"), así
# que este script no genera UN sql gigante: lo parte en varios
# archivos chicos (por defecto, bajo ~60 KB cada uno), cortando
# siempre en un ";" completo — nunca a mitad de un INSERT.
#
# Uso:
#   python3 generar_sql_opiniones.py
#   (genera migracion_opiniones_datos_01.sql, _02.sql, ... en la
#   misma carpeta — corre cada uno EN ORDEN, uno por uno, en el
#   editor SQL de Supabase)
# ============================================================
import json
import os

ARCHIVOS = [
    'consolidado_sistemas_2018.json',
    'consolidado_industrial_2018.json',
    'consolidado_software_2018.json',
    'consolidado_sistemas_2026.json',
    'consolidado_industrial_2026.json',
    'consolidado_ia_2026.json',
]

CARPETA = os.path.dirname(os.path.abspath(__file__))
PREFIJO_SALIDA = os.path.join(CARPETA, 'migracion_opiniones_datos')
MAX_BYTES_POR_ARCHIVO = 60_000  # margen cómodo bajo el límite del editor de Supabase


def sql_str(valor):
    """None -> NULL. Cualquier texto -> 'texto' con comillas escapadas."""
    if valor is None:
        return 'NULL'
    return "'" + str(valor).replace("'", "''") + "'"


def sql_num(valor):
    return 'NULL' if valor is None else str(valor)


def sql_bool(valor):
    if valor is None:
        return 'NULL'
    return 'true' if valor else 'false'


def generar_slug_base(nombre):
    """Convierte 'Cálculo Diferencial' -> 'calculo-diferencial'. Quita tildes/ñ,
    pasa a minúsculas, reemplaza todo lo que no sea letra/número por guiones,
    y colapsa guiones repetidos."""
    import unicodedata
    import re
    texto = unicodedata.normalize('NFD', nombre)
    texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn')  # quita tildes
    texto = texto.lower()
    texto = re.sub(r'[^a-z0-9]+', '-', texto)
    texto = re.sub(r'-+', '-', texto).strip('-')
    return texto


def generar_slug(nombre, carrera, malla):
    """cursos.slug es NOT NULL y UNIQUE en toda la tabla. Un mismo nombre de
    curso puede repetirse en varias combinaciones carrera+malla (ej. 'Cálculo
    Diferencial' en sistemas-2018, industrial-2018, sistemas-2026...), así que
    SIEMPRE se le agrega el sufijo -{carrera}-{malla} para garantizar que sea
    único sin chocar con slugs antiguos (que no usan este patrón exacto)."""
    return f"{generar_slug_base(nombre)}-{carrera}-{malla}"


def construir_statements():
    """Devuelve una lista de statements SQL completos (cada uno termina
    en ';'), en el orden en que deben ejecutarse. Nunca se cortan a la
    mitad al repartirlos en archivos."""
    datasets = []
    for nombre_archivo in ARCHIVOS:
        ruta = os.path.join(CARPETA, nombre_archivo)
        with open(ruta, encoding='utf-8') as f:
            datasets.append(json.load(f))

    statements = []

    # ---------- 1) PROFESORES (deduplicados entre los 6 archivos) ----------
    todos_profesores = set()
    for data in datasets:
        todos_profesores.update(data['profesores'])
        for curso in data['cursos']:
            for perfil in curso['perfiles']:
                todos_profesores.add(perfil['profesor'])

    filas = [f"  ({sql_str(nombre)})" for nombre in sorted(todos_profesores)]
    statements.append(
        '-- ---------- PROFESORES ----------\n'
        'insert into public.profesores (nombre) values\n'
        + ',\n'.join(filas) +
        '\non conflict (nombre) do nothing;'
    )

    # ---------- 2) CURSOS + PROFESOR_CURSO + PERFILES_PROFESOR, por archivo ----------
    for data in datasets:
        malla = data['malla']
        carrera = data['carrera']
        encabezado = f'-- ============================================================\n-- {carrera.upper()} · MALLA {malla}\n-- ============================================================'

        for curso in data['cursos']:
            slug = generar_slug(curso['nombre'], carrera, malla)
            statements.append(
                encabezado + f"\n-- Curso: {curso['nombre']} ({carrera} {malla})\n"
                'insert into public.cursos (nombre, codigo, carrera, malla, ciclo_ref, electivo, slug) values\n'
                '  (' +
                sql_str(curso['nombre']) + ', ' +
                sql_str(curso.get('codigo')) + ', ' +
                sql_str(carrera) + ', ' +
                sql_str(malla) + ', ' +
                sql_num(curso.get('ciclo_ref')) + ', ' +
                sql_bool(curso.get('electivo', False)) + ', ' +
                sql_str(slug) +
                ')\n'
                'on conflict (nombre, carrera, malla) do update set\n'
                '  codigo = excluded.codigo, ciclo_ref = excluded.ciclo_ref, electivo = excluded.electivo;'
                # OJO: "slug" a propósito NO se toca en el UPDATE — si el curso ya
                # existía, conserva su slug de siempre; el nuevo slug generado
                # solo se usa si el curso es realmente nuevo (INSERT real).
            )
            encabezado = ''  # el encabezado de sección solo se imprime una vez

        for curso in data['cursos']:
            for perfil in curso['perfiles']:
                cond = (
                    f"p.nombre = {sql_str(perfil['profesor'])} "
                    f"and c.nombre = {sql_str(curso['nombre'])} "
                    f"and c.carrera = {sql_str(carrera)} "
                    f"and c.malla = {sql_str(malla)}"
                )
                statements.append(
                    'insert into public.profesor_curso (profesor_id, curso_id)\n'
                    '  select p.id, c.id from public.profesores p, public.cursos c\n'
                    f'  where {cond}\n'
                    'on conflict (profesor_id, curso_id) do nothing;'
                )
                statements.append(
                    'insert into public.perfiles_profesor\n'
                    '  (profesor_curso_id, resumen, que_esperar, recomendaciones, exigencia, carga_trabajo, ritmo, claridad, activo)\n'
                    '  select pc.id, '
                    + sql_str(perfil.get('resumen')) + ', '
                    + sql_str(perfil.get('que_esperar')) + ', '
                    + sql_str(perfil.get('recomendaciones')) + ', '
                    + sql_num(perfil.get('exigencia')) + ', '
                    + sql_num(perfil.get('carga_trabajo')) + ', '
                    + sql_num(perfil.get('ritmo')) + ', '
                    + sql_num(perfil.get('claridad')) + ', '
                    + sql_bool(perfil.get('activo', True)) + '\n'
                    '  from public.profesor_curso pc\n'
                    '  join public.profesores p on p.id = pc.profesor_id\n'
                    '  join public.cursos c on c.id = pc.curso_id\n'
                    f'  where {cond}\n'
                    'on conflict (profesor_curso_id) do update set\n'
                    '  resumen = excluded.resumen, que_esperar = excluded.que_esperar,\n'
                    '  recomendaciones = excluded.recomendaciones, exigencia = excluded.exigencia,\n'
                    '  carga_trabajo = excluded.carga_trabajo, ritmo = excluded.ritmo,\n'
                    '  claridad = excluded.claridad, activo = excluded.activo;'
                )

    return statements, todos_profesores, datasets


def main():
    statements, todos_profesores, datasets = construir_statements()

    # Empaqueta los statements en archivos de hasta MAX_BYTES_POR_ARCHIVO,
    # sin cortar nunca uno a la mitad.
    archivos_generados = []
    chunk = []
    tam_actual = 0
    numero = 1

    def volcar_chunk():
        nonlocal chunk, tam_actual, numero
        if not chunk:
            return
        ruta = f'{PREFIJO_SALIDA}_{numero:02d}.sql'
        contenido = (
            f'-- Parte {numero} — pega este archivo completo en el editor SQL de Supabase y dale Run.\n'
            f'-- Es seguro correr cada parte más de una vez (usa ON CONFLICT).\n\n'
            + '\n\n'.join(chunk) + '\n'
        )
        with open(ruta, 'w', encoding='utf-8') as f:
            f.write(contenido)
        archivos_generados.append(ruta)
        chunk = []
        tam_actual = 0
        numero += 1

    for st in statements:
        tam_st = len(st.encode('utf-8'))
        if chunk and tam_actual + tam_st > MAX_BYTES_POR_ARCHIVO:
            volcar_chunk()
        chunk.append(st)
        tam_actual += tam_st
    volcar_chunk()

    print(f'Generados {len(archivos_generados)} archivos:')
    for ruta in archivos_generados:
        tam = os.path.getsize(ruta)
        print(f'  {os.path.basename(ruta)}  ({tam/1024:.0f} KB)')
    print()
    print(f'{len(todos_profesores)} profesores, '
          f'{sum(len(d["cursos"]) for d in datasets)} cursos, '
          f'{sum(len(c["perfiles"]) for d in datasets for c in d["cursos"])} perfiles.')


if __name__ == '__main__':
    main()



if __name__ == '__main__':
    main()