#!/usr/bin/env python3
# ============================================================
# Genera el SQL de importación de Opiniones a partir de los 6
# archivos consolidado_*.json. Pensado para volver a correrse cada
# vez que actualices el contenido de los JSON — solo reemplaza los
# 6 archivos en la misma carpeta y vuelve a ejecutar este script.
#
# Uso:
#   python3 generar_sql_opiniones.py
#   (genera migracion_opiniones_datos.sql en la misma carpeta)
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
SALIDA = os.path.join(CARPETA, 'migracion_opiniones_datos.sql')


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


def main():
    datasets = []
    for nombre_archivo in ARCHIVOS:
        ruta = os.path.join(CARPETA, nombre_archivo)
        with open(ruta, encoding='utf-8') as f:
            datasets.append(json.load(f))

    lineas = []
    lineas.append('-- ============================================================')
    lineas.append('-- IMPORTACIÓN DE DATOS DE OPINIONES (generado automáticamente)')
    lineas.append('-- Fuente: ' + ', '.join(ARCHIVOS))
    lineas.append('-- Correr DESPUÉS de migracion_opiniones_schema.sql')
    lineas.append('-- ============================================================')
    lineas.append('')

    # ---------- 1) PROFESORES (deduplicados entre los 6 archivos) ----------
    todos_profesores = set()
    for data in datasets:
        todos_profesores.update(data['profesores'])
        # por si algún perfil menciona un profesor que no está en la lista plana
        for curso in data['cursos']:
            for perfil in curso['perfiles']:
                todos_profesores.add(perfil['profesor'])

    lineas.append('-- ---------- PROFESORES ----------')
    lineas.append('insert into public.profesores (nombre) values')
    filas = [f"  ({sql_str(nombre)})" for nombre in sorted(todos_profesores)]
    lineas.append(',\n'.join(filas))
    lineas.append('on conflict (nombre) do nothing;')
    lineas.append('')

    # ---------- 2) CURSOS + PROFESOR_CURSO + PERFILES_PROFESOR, por archivo ----------
    for data in datasets:
        malla = data['malla']
        carrera = data['carrera']
        lineas.append(f'-- ============================================================')
        lineas.append(f'-- {carrera.upper()} · MALLA {malla}')
        lineas.append(f'-- ============================================================')

        # Cursos de este archivo
        lineas.append(f'-- Cursos: {carrera} {malla}')
        lineas.append('insert into public.cursos (nombre, codigo, carrera, malla, ciclo_ref, electivo) values')
        filas = []
        for curso in data['cursos']:
            filas.append(
                '  (' +
                sql_str(curso['nombre']) + ', ' +
                sql_str(curso.get('codigo')) + ', ' +
                sql_str(carrera) + ', ' +
                sql_str(malla) + ', ' +
                sql_num(curso.get('ciclo_ref')) + ', ' +
                sql_bool(curso.get('electivo', False)) +
                ')'
            )
        lineas.append(',\n'.join(filas))
        lineas.append('on conflict (nombre, carrera, malla) do update set')
        lineas.append('  codigo = excluded.codigo, ciclo_ref = excluded.ciclo_ref, electivo = excluded.electivo;')
        lineas.append('')

        # profesor_curso + perfiles_profesor, uno por perfil
        lineas.append(f'-- Vínculos profesor↔curso y perfiles: {carrera} {malla}')
        for curso in data['cursos']:
            for perfil in curso['perfiles']:
                cond = (
                    f"p.nombre = {sql_str(perfil['profesor'])} "
                    f"and c.nombre = {sql_str(curso['nombre'])} "
                    f"and c.carrera = {sql_str(carrera)} "
                    f"and c.malla = {sql_str(malla)}"
                )
                lineas.append(
                    'insert into public.profesor_curso (profesor_id, curso_id)\n'
                    '  select p.id, c.id from public.profesores p, public.cursos c\n'
                    f'  where {cond}\n'
                    'on conflict (profesor_id, curso_id) do nothing;'
                )
                lineas.append(
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
        lineas.append('')

    with open(SALIDA, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lineas))

    print(f'Listo: {SALIDA}')
    print(f'{len(todos_profesores)} profesores, '
          f'{sum(len(d["cursos"]) for d in datasets)} cursos, '
          f'{sum(len(c["perfiles"]) for d in datasets for c in d["cursos"])} perfiles.')


if __name__ == '__main__':
    main()