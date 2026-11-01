// clasificacion-cursos.js — ¿Un curso es "base" o "de especialidad"?
// Módulo PURO (sin DOM). Lo usa la Ruta académica, y mañana el ADN académico.
//
// Regla: los códigos de la UNI que empiezan con B (ciencias básicas: BMA, BFI, BQU...),
// FB (ciencias básicas de facultad: FB101, FB403...) o HU (humanidades) son cursos BASE.
// Todo lo demás (SI, GE, TE, SW...) es de ESPECIALIDAD. Los electivos van aparte.
//
// Si una facultad usa otros códigos para sus cursos básicos, se agregan aquí:
//   - PREFIJOS_BASE: prefijos que cuentan como base.
//   - EXCEPCIONES_BASE / EXCEPCIONES_ESPECIALIDAD: códigos sueltos que la regla clasificaría mal.
const PREFIJOS_BASE = ['B', 'FB', 'HU'];
const EXCEPCIONES_BASE = new Set([]);
const EXCEPCIONES_ESPECIALIDAD = new Set([]);

export function esCursoBase(codigo) {
    const c = String(codigo || '').trim().toUpperCase();
    if (!c) return false;
    if (EXCEPCIONES_BASE.has(c)) return true;
    if (EXCEPCIONES_ESPECIALIDAD.has(c)) return false;
    return PREFIJOS_BASE.some((p) => c.startsWith(p));
}

/* 'base' | 'especialidad' | 'electivo' */
export function tipoDeCurso(curso) {
    if (!curso) return 'especialidad';
    // Los electivos complementarios ya no se manejan aparte: cuentan como electivos comunes.
    if (curso.categoria === 'electivo' || curso.categoria === 'electivo_complementario') return 'electivo';
    return esCursoBase(curso.codigo) ? 'base' : 'especialidad';
}

export const ETIQUETA_TIPO = {
    base: 'Curso base',
    especialidad: 'Curso de especialidad',
    electivo: 'Electivo',
};
