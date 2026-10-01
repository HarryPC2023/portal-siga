// js/asesorias-cursos.js
//
// Catálogo de cursos de la sección Asesorías. Es la ÚNICA fuente de verdad
// de qué cursos aparecen y qué material tiene cada uno: la portada, la
// página de cada curso y (más adelante) el botcito leen de aquí.
//
// Alcance actual: Ingeniería de Sistemas · malla 2018, ciclos 1 a 5 —
// lo que Harry cursó y puede afirmar, verificado contra su Avance
// Curricular de INTRALU (código, nombre, créditos y ciclo).
//
// Regla de crecimiento: un curso o una carrera nueva se agrega SOLO
// cuando alguien lo confirma (un alumno de esa carrera sincroniza su
// Avance Curricular, o Harry lo verifica con el plan de estudios).
//
// ─── Cómo agregar material a un curso ───────────────────────────────
// 1) Busca el curso por su `codigo` y agrega un objeto en `recursos`.
// 2) `evaluacion`: una de EVALUACIONES ('PC1', 'PC2', 'EP', 'PC3', 'PC4',
//    'EF', 'ES') si el material es de esa evaluación; `null` si es un
//    material general del curso (monografía, teoría, guía).
// 3) `tipo`: 'pdf' (archivo en assets/asesorias/) o 'web' (página HTML).
// 4) `estado`: 'disponible' (por defecto) o 'preparacion' (ya se está
//    trabajando, aún no se publica).
// Con eso la tira de evaluaciones del curso se enciende sola; no hay
// que tocar HTML.

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
    { codigo: 'FB101', slug: 'geometria-analitica',        nombre: 'Geometría Analítica',            ciclo: 1, creditos: 3, recursos: [] },
    { codigo: 'BMA01', slug: 'calculo-diferencial',        nombre: 'Cálculo Diferencial',            ciclo: 1, creditos: 5, recursos: [] },
    { codigo: 'BQU01', slug: 'quimica-i',                  nombre: 'Química I',                      ciclo: 1, creditos: 5, recursos: [] },
    { codigo: 'BIC01', slug: 'introduccion-computacion',   nombre: 'Introducción a la Computación',  ciclo: 1, creditos: 2, recursos: [] },
    { codigo: 'BRC01', slug: 'redaccion-comunicacion',     nombre: 'Redacción y Comunicación',       ciclo: 1, creditos: 2, recursos: [] },

    // ───────────── Ciclo 2 ─────────────
    { codigo: 'BMA02', slug: 'calculo-integral',           nombre: 'Cálculo Integral',               ciclo: 2, creditos: 5, recursos: [] },
    { codigo: 'BMA03', slug: 'algebra-lineal',             nombre: 'Álgebra Lineal',                 ciclo: 2, creditos: 4, recursos: [] },
    { codigo: 'BEF01', slug: 'etica-filosofia-politica',   nombre: 'Ética y Filosofía Política',     ciclo: 2, creditos: 2, recursos: [] },

    // ───────────── Ciclo 3 ─────────────
    { codigo: 'FB301', slug: 'matematica-discreta',        nombre: 'Matemática Discreta',            ciclo: 3, creditos: 3, recursos: [] },
    { codigo: 'FB303', slug: 'calculo-multivariable',      nombre: 'Cálculo Multivariable',          ciclo: 3, creditos: 5, recursos: [] },
    { codigo: 'BFI01', slug: 'fisica-i',                   nombre: 'Física I',                       ciclo: 3, creditos: 5, recursos: [] },
    { codigo: 'FB305', slug: 'estadistica-probabilidades', nombre: 'Estadística y Probabilidades',   ciclo: 3, creditos: 3, recursos: [] },

    // ───────────── Ciclo 4 ─────────────
    { codigo: 'FB401', slug: 'fisica-ii',                  nombre: 'Física II',                      ciclo: 4, creditos: 5, recursos: [] },
    { codigo: 'FB403', slug: 'ecuaciones-diferenciales',   nombre: 'Ecuaciones Diferenciales',       ciclo: 4, creditos: 5, recursos: [] },
    { codigo: 'FB405', slug: 'estadistica-aplicada',       nombre: 'Estadística Aplicada',           ciclo: 4, creditos: 3, recursos: [] },
    { codigo: 'HU102', slug: 'desarrollo-personal',        nombre: 'Desarrollo Personal',            ciclo: 4, creditos: 2, recursos: [] },
    {
        codigo: 'SI405', slug: 'mcd', nombre: 'Modelado Conceptual de Datos', ciclo: 4, creditos: 3,
        recursos: [
            {
                id: 'mono-mcd',
                tipo: 'pdf',
                evaluacion: null,
                titulo: 'Monografía — Modelado Conceptual de Datos',
                descripcion: 'Fundamentos para encarar el trabajo grupal y qué espera el profesor.',
                src: 'assets/asesorias/monografia-mcd.pdf',
            },
        ],
    },

    // ───────────── Ciclo 5 ─────────────
    { codigo: 'BEG01', slug: 'economia-general',           nombre: 'Economía General',               ciclo: 5, creditos: 3, recursos: [] },
    { codigo: 'BRN01', slug: 'realidad-nacional',          nombre: 'Realidad Nacional, Constitución y Derechos Humanos', ciclo: 5, creditos: 3, recursos: [] },
    {
        codigo: 'SI505', slug: 'dbd', nombre: 'Diseño de Base de Datos', ciclo: 5, creditos: 3,
        recursos: [
            {
                id: 'pc1-dbd',
                tipo: 'web',
                evaluacion: 'PC1',
                titulo: 'PC1 — Diseño de Base de Datos',
                descripcion: 'Herramientas, arquitectura, componentes y checklist antes de exponer.',
                // Hoy vive en un repositorio aparte; se migra dentro de SIGA al final.
                src: 'https://harrypc2023.github.io/asesoria-dbd/',
            },
            {
                id: 'mono-dbd',
                tipo: 'pdf',
                evaluacion: null,
                titulo: 'Monografía — Diseño de Base de Datos',
                descripcion: 'Prototipado de interfaces: coherencia, detalle y datos reales por pantalla.',
                src: 'assets/asesorias/monografia-dbd-avanzado.pdf',
            },
        ],
    },
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

// ¿El curso ya tiene algo publicado?
export function tieneContenido(curso) {
    return curso.recursos.some((r) => (r.estado || 'disponible') === 'disponible');
}

// "Ciclo 4" — un solo ciclo por curso, el de tu plan.
export function etiquetaCiclo(curso) {
    return `Ciclo ${curso.ciclo}`;
}
