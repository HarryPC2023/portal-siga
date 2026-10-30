// analisis-academico.js — Cálculos del análisis académico (Termómetro hoy;
// Radar, Ruta y ADN después). Módulo PURO: no toca el DOM ni Supabase.
import { notaComoNumero, clasificarExamen } from './formula-mapper.js';
import { claseEvaluacion } from './formula-practicas.js';

/* Mínimo de prácticas con nota para opinar, y diferencia (en puntos) entre el
   promedio de las últimas 2 y el de las primeras 2 para decir "sube" o "baja".
   Son los dos números que se pueden ajustar. */
export const MIN_PRACTICAS = 3;
export const UMBRAL_TENDENCIA = 2;

const promedio = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const un = (n) => (Math.round(n * 10) / 10).toFixed(1);

/* Prácticas (solo PC1, PC2…; NO laboratorios, monografías ni exámenes), en el
   orden del curso. `simulados` es lo que el alumno escribió en pantalla
   ({ N1: 14, ... }). Una nota cuenta como simulada si el alumno escribió un
   valor distinto de lo que trajo INTRALU. */
export function practicasEnOrden(evaluaciones, simulados = {}) {
    const filas = [];
    for (const ev of evaluaciones || []) {
        if (clasificarExamen(ev.descripcion)) continue;                 // exámenes fuera
        if (claseEvaluacion(ev.descripcion) !== 'PC') continue;         // LAB y MONOGRAFÍA fuera
        if (ev.camnot === null || ev.camnot === undefined) continue;
        const variable = `N${ev.camnot}`;
        const oficial = notaComoNumero(ev.nota);
        const escrita = Object.prototype.hasOwnProperty.call(simulados, variable)
            ? notaComoNumero(simulados[variable]) : null;
        const simulada = escrita !== null && escrita !== oficial;
        filas.push({ variable, camnot: ev.camnot, nota: simulada ? escrita : oficial, simulada });
    }
    return filas.sort((a, b) => a.camnot - b.camnot);
}

/* Tendencia de un curso: promedio de las últimas 2 prácticas contra el de las
   primeras 2. Con 3 prácticas, la del medio cuenta en los dos grupos.
   Devuelve { clave: 'sube'|'baja'|'estable'|'sin', texto, detalle, simulada }. */
export function tendenciaDeCurso(evaluaciones, simulados = {}) {
    const con = practicasEnOrden(evaluaciones, simulados).filter((p) => p.nota !== null);
    if (con.length < MIN_PRACTICAS) {
        return {
            clave: 'sin',
            texto: 'Aún sin tendencia',
            detalle: `Se necesitan al menos ${MIN_PRACTICAS} prácticas con nota.`,
            simulada: false,
        };
    }
    const primeras = con.slice(0, 2);
    const ultimas = con.slice(-2);
    const a = promedio(primeras.map((p) => p.nota));
    const b = promedio(ultimas.map((p) => p.nota));
    const dif = b - a;
    const simulada = [...primeras, ...ultimas].some((p) => p.simulada);
    const detalle = `Primeras 2 prácticas: ${un(a)} · Últimas 2: ${un(b)} · Diferencia: ${dif > 0 ? '+' : ''}${un(dif)}`;

    if (dif >= UMBRAL_TENDENCIA) return { clave: 'sube', texto: 'Subiendo', detalle, simulada };
    if (dif <= -UMBRAL_TENDENCIA) return { clave: 'baja', texto: 'Bajando', detalle, simulada };
    return { clave: 'estable', texto: 'Estable', detalle: `${detalle} (cambio menor a ${UMBRAL_TENDENCIA} puntos)`, simulada };
}

/* ¿Vale la pena mostrar la franja? Solo si algún curso ya tiene tendencia. */
export function hayAlgunaTendencia(tendencias) {
    return tendencias.some((t) => t && t.clave !== 'sin');
}
