# -*- coding: utf-8 -*-
"""Genera js/proyectos/indice.json a partir de las fichas de js/proyectos/areas/*.json.

Cómo se usa (desde la carpeta del proyecto, la que tiene `js` y `tools`):

    python tools/generar_indice.py

Cuándo: cada vez que agregues, cambies o quites una idea en js/proyectos/areas/<area>.json.
El índice es la versión liviana de todas las ideas (lo que necesitan las tarjetas, los filtros y la búsqueda);
la ficha completa de cada idea se descarga solo cuando alguien la abre. NO edites indice.json a mano: se vuelve a generar.

Solo usa la biblioteca estándar de Python. Si algo está mal en una ficha, el script lo dice y no escribe nada.
"""
import glob
import hashlib
import json
import os
import re
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARPETA = os.path.join(RAIZ, 'js', 'proyectos')
DATOS_JS = os.path.join(RAIZ, 'js', 'proyectos-datos.js')

TIPOS_PROG = {'sin', 'opcional', 'incluida'}
INTENCIONES = {'crear', 'resolver', 'investigar', 'otro-sector'}
FUENTES = {'ficticios', 'publicos', 'propios'}


def norm(t):
    t = unicodedata.normalize('NFD', str(t).lower())
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn')


def ids_de_areas():
    texto = open(DATOS_JS, encoding='utf-8').read()
    bloque = texto[texto.index('export const AREAS'):texto.index('export const INTENCIONES')]
    return re.findall(r"\{\s*id:\s*'([a-z-]+)'", bloque)


def main():
    areas = ids_de_areas()
    if not areas:
        sys.exit('No encontré las áreas en js/proyectos-datos.js')
    errores, ideas, vistos = [], [], set()
    for ruta in sorted(glob.glob(os.path.join(CARPETA, 'areas', '*.json'))):
        nombre = os.path.basename(ruta)[:-5]
        if nombre not in areas:
            errores.append(f'{nombre}.json: el área «{nombre}» no existe en AREAS de proyectos-datos.js'); continue
        try:
            datos = json.load(open(ruta, encoding='utf-8'))
        except ValueError as e:
            errores.append(f'{nombre}.json: JSON inválido ({e})'); continue
        for i in datos.get('ideas', []):
            ref = f"{nombre}.json · {i.get('id', '?')}"
            for campo in ('id', 'titulo', 'resumen', 'tipo', 'tiempo'):
                if not i.get(campo): errores.append(f'{ref}: falta «{campo}»')
            if not isinstance(i.get('horas'), (int, float)): errores.append(f'{ref}: «horas» debe ser un número (se usa oculto para ordenar y para el cuestionario)')
            if not re.fullmatch(r'[a-z0-9-]+', str(i.get('id', ''))): errores.append(f'{ref}: el id solo puede tener minúsculas, números y guiones')
            if i.get('id') in vistos: errores.append(f'{ref}: id repetido')
            vistos.add(i.get('id'))
            if i.get('area') != nombre: errores.append(f'{ref}: «area» ({i.get("area")}) no coincide con el archivo ({nombre})')
            for a2 in i.get('areas2', []):
                if a2 not in areas: errores.append(f'{ref}: «areas2» tiene un área que no existe ({a2})')
                if a2 == nombre: errores.append(f'{ref}: «areas2» no debe repetir el área principal')
            if len(i.get('areas2', [])) > 2: errores.append(f'{ref}: máximo 2 áreas en «areas2»')
            if len(i.get('ampliaciones', [])) > 3: errores.append(f'{ref}: máximo 3 ampliaciones')
            if i.get('datos') not in FUENTES: errores.append(f'{ref}: «datos» debe ser ficticios, publicos o propios')
            if i.get('prog') and i['prog'] not in TIPOS_PROG: errores.append(f'{ref}: «prog» debe ser sin, opcional o incluida')
            for it in i.get('intencion', []):
                if it not in INTENCIONES: errores.append(f'{ref}: intención desconocida ({it})')
            ideas.append(i)
    if errores:
        print('No se generó el índice. Corrige esto:')
        for e in errores: print('  -', e)
        sys.exit(1)

    orden = {a: n for n, a in enumerate(areas)}
    ideas.sort(key=lambda i: orden[i['area']])      # se conserva el orden del archivo dentro de cada área
    indice = []
    for i in ideas:
        # Solo lo que NO está ya en la fila (carreras, habilidades y herramientas); título, resumen, tipo y etiquetas se buscan desde la propia fila.
        busca = norm(' '.join([' '.join(i.get('carreras', [])), ' '.join(i.get('habilidades', [])), ' '.join(i.get('herramientas', []))]))
        fila = {'id': i['id'], 'area': i['area'], 'areas2': i.get('areas2', []), 'titulo': i['titulo'], 'resumen': i['resumen'], 'tipo': i['tipo'],
                'tiempo': i['tiempo'], 'horas': i['horas'], 'etiquetas': i.get('etiquetas', []), 'intencion': i.get('intencion', []),
                'datos': i['datos'], 'busca': busca}
        if i.get('prog'): fila['prog'] = i['prog']
        indice.append(fila)

    cuerpo = json.dumps(indice, ensure_ascii=False, separators=(',', ':'))
    version = hashlib.sha1(cuerpo.encode('utf-8')).hexdigest()[:8]
    salida = {'version': version, 'total': len(indice), 'ideas': indice}
    destino = os.path.join(CARPETA, 'indice.json')
    with open(destino, 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print(f'Índice generado: {len(indice)} ideas · versión {version} · {os.path.getsize(destino) // 1024} KB')
    for a in areas:
        n = sum(1 for i in indice if i['area'] == a)
        c = sum(1 for i in indice if a in i['areas2'])
        print(f'  {a:12} {n:3} ideas' + (f' (+{c} que se cruzan)' if c else ''))


if __name__ == '__main__':
    main()
