// js/asesorias-cursos.js
//
// Catálogo de cursos de la sección Asesorías. Es la ÚNICA fuente de verdad
// de qué cursos aparecen y qué material tiene cada uno: la portada, la
// página de cada curso y (más adelante) el botcito leen de aquí.
//
// QUÉ CURSOS ENTRAN: solo los que Harry puede ofrecer con asesoría real
// (con su propio dominio o preparados junto con Claude en otro chat). No
// se listan todos los cursos de un ciclo: quien entra a un curso debe
// poder esperar que haya material, no que "algún día" lo haya.
//
// DE DÓNDE SALEN LOS DATOS: código, nombre, créditos y ciclo se verificaron
// contra el Avance Curricular de INTRALU de Harry (Ingeniería de Sistemas,
// malla 2018). Química II no está en ese plan; sus datos salen del plan de
// estudios oficial de Ingeniería Industrial (FB202, ciclo 2, 4 créditos) y
// por eso lleva su propia etiqueta de plan.
//
// Regla de crecimiento: un curso nuevo se agrega cuando Harry decide que
// puede ofrecerlo, y una carrera nueva solo cuando alguien la confirma
// (un alumno de esa carrera sincroniza su Avance Curricular, o se
// verifica con el plan de estudios oficial).
//
// ─── Cómo agregar material a un curso ───────────────────────────────
// 1) Busca el curso por su `codigo` y agrega un objeto en `recursos`.
// 2) `evaluacion`: una de EVALUACIONES ('PC1', 'PC2', 'EP', 'PC3', 'PC4',
//    'EF', 'ES') si el material es de esa evaluación; `null` si es un
//    material general del curso (monografía, teoría, guía).
// 3) `tipo`: 'web' (asesoría interactiva: carpeta con index.html). Las asesorías
//    nuevas SIEMPRE son web; 'pdf' sigue soportado por el visor pero ya no se usa.
// 4) `periodo`: ciclo en que se basa la asesoría ('2026-1'). Con él y la
//    `evaluacion` (o `carpeta`, si es material general) el catálogo calcula solo
//    la ruta:  assets/asesorias/<slug>/<periodo>/<evaluacion>/index.html
//    (minúsculas, sin tildes ni espacios; ej. assets/asesorias/dbd/2026-1/pc1/).
//    No escribas `src` salvo que el material viva en otra ruta.
//    Varias asesorías de una misma evaluación (PC1 de 2026-1 y de 2026-2) se
//    listan juntas, la más reciente primero. Crea un periodo nuevo solo cuando
//    el contenido cambia de verdad; la carpeta se crea al hacer la asesoría.
//    `id` debe ser único: '<evaluacion>-<curso>-<periodo>' (ej. 'pc1-dbd-2026-2').
// 5) `estado`: 'disponible' (por defecto) o 'preparacion' (ya se está
//    trabajando, aún no se publica).
// 6) `fecha`: NO la escribas, se calcula sola al desplegar: es el día en que
//    la carpeta de la asesoría entró al repositorio (ver scripts/fechas_de_
//    publicacion.py). Durante 14 días el curso y el recurso llevan la
//    etiqueta "Nuevo" y el botcito avisa una vez en cada navegador.
//    Solo si quieres forzarla: `fecha: null` (nunca "Nuevo") o
//    `fecha: 'AAAA-MM-DD'` (esa manda sobre la automática). Al probar en
//    local no hay fecha automática, porque solo se calcula en el despliegue.
// Con eso la tira de evaluaciones del curso se enciende sola; no hay
// que tocar HTML.

import { FECHAS } from './asesorias-fechas.js?v=1';

export const PLAN_DEFECTO = 'Sistemas · malla 2018';

// Orden oficial en que se muestran las evaluaciones de un curso.
export const EVALUACIONES = ['PC1', 'PC2', 'EP', 'PC3', 'PC4', 'EF', 'ES'];

export const NOMBRE_EVALUACION = {
    PC1: 'Práctica calificada 1',
    PC2: 'Práctica calificada 2',
    EP: 'Examen parcial',
    PC3: 'Práctica calificada 3',
    PC4: 'Práctica calificada 4',
    EF: 'Examen final',
    ES: 'Examen sustitutorio',
};

export const CURSOS = [
    // ───────────── Ciclo 1 ─────────────
    {
        codigo: 'FB101', slug: 'geometria-analitica', nombre: 'Geometría Analítica', ciclo: 1, creditos: 3,
        recursos: [
            {
                id: 'pc1-geometria-2026-1',
                tipo: 'web',
                evaluacion: 'PC1',
                titulo: 'PC1 — Geometría Analítica',
                descripcion: 'Resolución paso a paso de las 3 preguntas, tips y práctica con ejercicios nuevos.',
                periodo: '2026-1',
            },
        ],
    },
    { codigo: 'BMA01', slug: 'calculo-diferencial', nombre: 'Cálculo Diferencial', ciclo: 1, creditos: 5, recursos: [] },
    { codigo: 'BQU01', slug: 'quimica-i', nombre: 'Química I', ciclo: 1, creditos: 5, recursos: [] },

    // ───────────── Ciclo 2 ─────────────
    { codigo: 'BMA02', slug: 'calculo-integral', nombre: 'Cálculo Integral', ciclo: 2, creditos: 5, recursos: [] },
    { codigo: 'BMA03', slug: 'algebra-lineal', nombre: 'Álgebra Lineal', ciclo: 2, creditos: 4, recursos: [] },
    { codigo: 'SI205', slug: 'algoritmia-estructura-datos', nombre: 'Algoritmia y Estructura de Datos', ciclo: 2, creditos: 3, recursos: [] },
    // Química II no es del plan de Sistemas: viene del plan de Ing. Industrial.
    { codigo: 'FB202', slug: 'quimica-ii', nombre: 'Química II', ciclo: 2, creditos: 4, plan: 'Ingeniería Industrial', recursos: [] },

    // ───────────── Ciclo 3 ─────────────
    { codigo: 'BFI01', slug: 'fisica-i', nombre: 'Física I', ciclo: 3, creditos: 5, recursos: [] },
    { codigo: 'FB305', slug: 'estadistica-probabilidades', nombre: 'Estadística y Probabilidades', ciclo: 3, creditos: 3, recursos: [] },

    // ───────────── Ciclo 4 ─────────────
    { codigo: 'FB401', slug: 'fisica-ii', nombre: 'Física II', ciclo: 4, creditos: 5, recursos: [] },
    { codigo: 'FB402', slug: 'calculo-numerico', nombre: 'Cálculo Numérico', ciclo: 4, creditos: 3, recursos: [] },
    { codigo: 'FB403', slug: 'ecuaciones-diferenciales', nombre: 'Ecuaciones Diferenciales', ciclo: 4, creditos: 5, recursos: [] },
    { codigo: 'FB405', slug: 'estadistica-aplicada', nombre: 'Estadística Aplicada', ciclo: 4, creditos: 3, recursos: [] },
    {
        codigo: 'SI405', slug: 'mcd', nombre: 'Modelado Conceptual de Datos', ciclo: 4, creditos: 3,
        recursos: [
            {
                id: 'pc3-mcd-2026-2',
                tipo: 'web',
                evaluacion: 'PC3',
                titulo: 'PC3 — Modelado Conceptual de Datos',
                descripcion: 'Escribe aquí en una frase qué trae esta PC3.',
                periodo: '2026-2',
            },
        ],
    },

    // ───────────── Ciclo 5 ─────────────
    { codigo: 'SI501', slug: 'investigacion-operaciones-i', nombre: 'Investigación de Operaciones I', ciclo: 5, creditos: 3, recursos: [] },
    {
        codigo: 'SI505', slug: 'dbd', nombre: 'Diseño de Base de Datos', ciclo: 5, creditos: 3,
        recursos: [
            {
                id: 'pc1-dbd',
                tipo: 'web',
                evaluacion: 'PC1',
                titulo: 'PC1 — Diseño de Base de Datos',
                descripcion: 'Herramientas, arquitectura, componentes y checklist antes de exponer.',
                periodo: '2026-1',
            },
        ],
    },

    // ───────────── Ciclo 6 ─────────────
    { codigo: 'SI601', slug: 'investigacion-operaciones-ii', nombre: 'Investigación de Operaciones II', ciclo: 6, creditos: 3, recursos: [] },
];

// ───────────── Utilidades (solo lectura del catálogo) ─────────────

export function cursoPorSlug(slug) {
    return CURSOS.find((c) => c.slug === slug) || null;
}

export function cursoPorCodigo(codigo) {
    const k = String(codigo || '').toUpperCase().replace(/[-\s]/g, '');
    return CURSOS.find((c) => c.codigo === k) || null;
}

// 'disponible' | 'preparacion' | 'falta' para una evaluación de un curso.
export function estadoEvaluacion(curso, evaluacion) {
    const rs = curso.recursos.filter((r) => r.evaluacion === evaluacion);
    if (rs.some((r) => (r.estado || 'disponible') === 'disponible')) return 'disponible';
    if (rs.some((r) => r.estado === 'preparacion')) return 'preparacion';
    return 'falta';
}

// Materiales generales del curso (monografías, teoría, guías).
export function recursosGenerales(curso) {
    return curso.recursos.filter((r) => r.evaluacion === null);
}

// Ruta de la asesoría web: se calcula con curso + periodo + evaluación (o
// `carpeta` en el material general). Un `src` explícito tiene prioridad.
export function rutaRecurso(curso, recurso) {
    if (recurso.src) return recurso.src;
    const sub = String(recurso.evaluacion || recurso.carpeta || '').toLowerCase();
    return `assets/asesorias/${curso.slug}/${recurso.periodo}/${sub}/index.html`;
}

// Recursos disponibles de una evaluación (o del material general si `evaluacion`
// es null), con el periodo más reciente primero. Sin periodo van al final.
export function recursosOrdenados(curso, evaluacion) {
    return curso.recursos
        .filter((r) => r.evaluacion === evaluacion && (r.estado || 'disponible') === 'disponible')
        .sort((a, b) => String(b.periodo || '').localeCompare(String(a.periodo || '')));
}

// ¿El curso ya tiene algo publicado?
export function tieneContenido(curso) {
    return curso.recursos.some((r) => (r.estado || 'disponible') === 'disponible');
}

// "Ciclo 4" — un solo ciclo por curso, el del plan indicado.
export function etiquetaCiclo(curso) {
    return `Ciclo ${curso.ciclo}`;
}

// Plan al que corresponden el ciclo y los créditos del curso.
export function planDelCurso(curso) {
    return curso.plan || PLAN_DEFECTO;
}

// Ciclos que realmente tienen cursos (para armar los filtros de la portada).
export function ciclosDisponibles() {
    return [...new Set(CURSOS.map((c) => c.ciclo))].sort((a, b) => a - b);
}

// ───────────── Novedades ("Nuevo") ─────────────

// Cuántos días un recurso publicado se considera nuevo.
export const NOVEDAD_DIAS = 5;

const MS_DIA = 24 * 60 * 60 * 1000;

// ¿Este recurso se publicó hace poco (y ya está disponible)?
export function esNuevo(recurso, hoy = new Date()) {
    if (!recurso || !recurso.fecha || (recurso.estado || 'disponible') !== 'disponible') return false;
    const publicado = new Date(`${recurso.fecha}T00:00:00`);
    if (Number.isNaN(publicado.getTime())) return false;
    const dias = Math.floor((hoy.getTime() - publicado.getTime()) / MS_DIA);
    return dias >= 0 && dias < NOVEDAD_DIAS;
}

export function cursoTieneNovedad(curso, hoy = new Date()) {
    return curso.recursos.some((r) => esNuevo(r, hoy));
}

// Todos los recursos nuevos, con su curso: [{ curso, recurso }].
export function recursosNuevos(hoy = new Date()) {
    const lista = [];
    CURSOS.forEach((curso) => curso.recursos.forEach((recurso) => { if (esNuevo(recurso, hoy)) lista.push({ curso, recurso }); }));
    return lista;
}

// ───────────── Fecha de publicación automática ─────────────
// Un recurso sin `fecha` toma la que calculó el despliegue para su carpeta.
//   sin `fecha`            -> automática
//   `fecha: null`          -> nunca se marca "Nuevo"
//   `fecha: 'AAAA-MM-DD'`  -> manda sobre la automática
function claveCarpeta(curso, recurso) {
    if (recurso.tipo !== 'web' || !recurso.periodo) return null;
    return rutaRecurso(curso, recurso)
        .replace(/^assets\/asesorias\//, '')
        .replace(/\/index\.html$/, '');
}

CURSOS.forEach((curso) => curso.recursos.forEach((r) => {
    if (r.fecha !== undefined) return;
    const clave = claveCarpeta(curso, r);
    r.fecha = (clave && FECHAS[clave]) || null;
}));

// ───────────── Revisión del catálogo ─────────────
// Solo avisa en la consola del navegador (F12); nunca rompe la página.
(function validarCatalogo() {
    const vistos = new Set();
    CURSOS.forEach((c) => c.recursos.forEach((r) => {
        if (vistos.has(r.id)) console.warn(`[Asesorías] id repetido: "${r.id}" (cada recurso necesita un id único)`);
        vistos.add(r.id);
        if (r.tipo === 'web' && !r.src && !(r.periodo && (r.evaluacion || r.carpeta))) {
            console.warn(`[Asesorías] "${r.id}": falta periodo (y evaluacion o carpeta) para calcular su ruta`);
        }
    }));
})();