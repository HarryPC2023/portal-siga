// nota-entera.js — Las evaluaciones de INTRALU (PC, labs, monografías, EP, EF, ES) son SIEMPRE enteras:
// si un profesor pone 9.5, lo redondea a favor del alumno antes de publicar. Solo los promedios
// (de prácticas, final, ponderado) llevan decimales. Por eso los casilleros de notas aceptan solo
// enteros de 0 a 20. Módulo puro (sin DOM) para poder probarlo.

export const NOTA_MIN = 0;
export const NOTA_MAX = 20;

/* Teclas que no tienen sentido en una nota entera: punto, coma, signos y la "e" de los números científicos. */
export function esTeclaNoEntera(tecla) {
    return ['.', ',', '-', '+', 'e', 'E'].includes(tecla);
}

/* Lo que el alumno escribió (o pegó) → entero de 0 a 20, o null si está vacío o no es un número.
   Un decimal se redondea hacia arriba desde .5, como hacen los profesores a favor del alumno. */
export function normalizarNotaEntera(valor) {
    if (valor === null || valor === undefined) return null;
    const texto = String(valor).trim().replace(',', '.');
    if (texto === '') return null;
    const n = Number(texto);
    if (!Number.isFinite(n)) return null;
    return Math.min(NOTA_MAX, Math.max(NOTA_MIN, Math.floor(n + 0.5)));
}
