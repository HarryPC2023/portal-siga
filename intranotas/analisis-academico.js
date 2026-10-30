// analisis-academico.js — Cálculos del análisis académico (Termómetro hoy;
// Radar, Ruta y ADN después). Módulo PURO: no toca el DOM ni Supabase.
import { notaComoNumero, clasificarExamen } from './formula-mapper.js';
import { claseEvaluacion } from './formula-practicas.js';

/* Mínimo de evaluaciones con nota (de cualquier tipo) para opinar, y la
   diferencia en puntos entre el promedio de las últimas 2 y el de las
   primeras 2 para decir "sube" o "baja". Son los dos números ajustables. */
export const MIN_EVALUACIONES = 3;
export const UMBRAL_TENDENCIA = 2;

const promedio = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const un = (n) => (Math.round(n * 10) / 10).toFixed(1);

/* Evaluaciones de un curso en el orden en que se rinden:
       PC1, PC2, EP, PC3, PC4, EF
   (el sustitutorio ES no entra: reemplaza a otra nota, no es una evaluación más).
   INTRALU solo numera (camnot) prácticas, laboratorios y monografías; los
   exámenes no traen número. Por eso: lo que no es examen va por camnot, el
   parcial se coloca justo después de la 2.ª práctica (PC), y el final va al
   cierre. Así una monografía o un laboratorio que se rinde antes del parcial
   queda antes, y una que se rinde después queda después.
   `simulados` es lo que el alumno escribió en pantalla ({ N1: 14, EP: 12 }):
   una nota cuenta como simulada si es distinta de lo que trajo INTRALU. */
export function evaluacionesEnOrden(evaluaciones, simulados = {}) {
    const examenes = {};
    const otras = [];
    for (const ev of evaluaciones || []) {
        const examen = clasificarExamen(ev.descripcion);
        if (examen) { examenes[examen] = ev; continue; }
        if (ev.camnot === null || ev.camnot === undefined) continue;
        otras.push(ev);
    }
    otras.sort((a, b) => a.camnot - b.camnot);

    let posicionParcial = otras.length;      // si hay menos de 2 PC, el parcial va tras todas
    let pcVistas = 0;
    for (let i = 0; i < otras.length; i++) {
        if (claseEvaluacion(otras[i].descripcion) === 'PC') {
            pcVistas += 1;
            if (pcVistas === 2) { posicionParcial = i + 1; break; }
        }
    }

    const orden = [...otras.slice(0, posicionParcial)];
    if (examenes.EP) orden.push(examenes.EP);
    orden.push(...otras.slice(posicionParcial));
    if (examenes.EF) orden.push(examenes.EF);

    return orden.map((ev) => {
        const examen = clasificarExamen(ev.descripcion);
        const variable = examen || `N${ev.camnot}`;
        const oficial = notaComoNumero(ev.nota);
        const escrita = Object.prototype.hasOwnProperty.call(simulados, variable)
            ? notaComoNumero(simulados[variable]) : null;
        const simulada = escrita !== null && escrita !== oficial;
        return { variable, descripcion: ev.descripcion, nota: simulada ? escrita : oficial, simulada };
    });
}

/* Tendencia de un curso: promedio de las últimas 2 evaluaciones con nota
   contra el de las primeras 2. Con 3 notas, la del medio cuenta en los dos
   grupos. Devuelve { clave: 'sube'|'baja'|'estable'|'sin', texto, detalle, simulada }. */
export function tendenciaDeCurso(evaluaciones, simulados = {}) {
    const con = evaluacionesEnOrden(evaluaciones, simulados).filter((e) => e.nota !== null);
    if (con.length < MIN_EVALUACIONES) {
        return {
            clave: 'sin',
            texto: 'Aún sin tendencia',
            detalle: `Se necesitan al menos ${MIN_EVALUACIONES} evaluaciones con nota.`,
            simulada: false,
        };
    }
    const primeras = con.slice(0, 2);
    const ultimas = con.slice(-2);
    const a = promedio(primeras.map((e) => e.nota));
    const b = promedio(ultimas.map((e) => e.nota));
    const dif = b - a;
    const simulada = [...primeras, ...ultimas].some((e) => e.simulada);
    const detalle = `Primeras 2 evaluaciones: ${un(a)} · Últimas 2: ${un(b)} · Diferencia: ${dif > 0 ? '+' : ''}${un(dif)}`;

    if (dif >= UMBRAL_TENDENCIA) return { clave: 'sube', texto: 'Subiendo', detalle, simulada };
    if (dif <= -UMBRAL_TENDENCIA) return { clave: 'baja', texto: 'Bajando', detalle, simulada };
    return { clave: 'estable', texto: 'Estable', detalle: `${detalle} (cambio menor a ${UMBRAL_TENDENCIA} puntos)`, simulada };
}

/* ¿Vale la pena mostrar chips? Solo si algún curso ya tiene tendencia. */
export function hayAlgunaTendencia(tendencias) {
    return tendencias.some((t) => t && t.clave !== 'sin');
}
