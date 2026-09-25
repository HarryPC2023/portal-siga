// formula-practicas.js — Decide QUÉ fórmula de prácticas (PP) usar para un
// curso. Módulo PURO: no toca el DOM ni Supabase.
//
// Por qué existe: INTRALU manda la fórmula de nota final desde el inicio
// del ciclo, pero la de prácticas llega como "En proceso..." hasta que el
// ciclo cierra (comprobado con DevTools en sep 2026: la respuesta de
// cursos/notas no la trae en ningún lado). Sin PP el simulador no sirve
// justo cuando más se usa, así que se resuelve en 3 niveles:
//
//   1. 'oficial'  → la que publicó INTRALU para este curso/sección/periodo.
//   2. 'anterior' → la real de un ciclo YA CERRADO del mismo curso, sacada
//                   del banco compartido formulas_curso (se prefiere la
//                   misma sección, que suele ser el mismo profesor).
//   3. 'estimada' → armada con las reglas generales de la UNI (documento
//                   "Reglas y criterios de evaluación" de Harry) a partir de
//                   la lista de evaluaciones que INTRALU sí manda desde el día 1:
//        - PCs: con 4 o más se descarta la más baja; con 3 o menos, ninguna.
//        - Laboratorios: con 7 o más se descartan las 2 más bajas; con 2 a 6,
//          la más baja.
//        - Monografías: nunca se descartan.
//        - Se divide entre lo que queda (fijo, tenga nota o no → avance real).
//      El alumno puede cambiar los descartes con los cuadritos de la tarjeta.
import { evaluarFormula } from './formula-engine.js';
import { clasificarExamen } from './formula-mapper.js';

/* Clasifica una evaluación NO examen por lo que dice su descripción real de
   INTRALU (camnot solo numera, no distingue tipo). */
export function claseEvaluacion(descripcion) {
    const d = (descripcion || '').toUpperCase();
    if (d.includes('LABORATORIO') || /(^|[^A-Z])LAB/.test(d)) return 'LAB';
    if (d.includes('MONOGRAF')) return 'MONOGRAFIA';
    return 'PC';
}

const PALABRAS_RESERVADAS = /^(MIN|K\d+MIN)$/;

function variablesDe(formula) {
    const ids = String(formula).match(/K\d+MIN|[A-Za-z]+\d*/g) || [];
    return [...new Set(ids.filter((id) => !PALABRAS_RESERVADAS.test(id)))];
}

/* ¿El texto es una fórmula de verdad? Descarta null, vacío, "En proceso..." y
   cualquier cosa que el motor no pueda evaluar (se prueba con todo en 10). */
export function formulaPracticasValida(texto) {
    if (!texto || !String(texto).trim()) return false;
    if (/en\s*proceso/i.test(texto)) return false;
    const variables = variablesDe(texto);
    if (!variables.length) return false;
    try {
        const prueba = Object.fromEntries(variables.map((v) => [v, 10]));
        return Number.isFinite(evaluarFormula(texto, prueba));
    } catch {
        return false;
    }
}

/* Separa las evaluaciones NO examen del curso en grupos, en orden de camnot. */
function gruposDelCurso(evaluaciones) {
    const grupos = { PC: [], LAB: [], MONOGRAFIA: [] };
    for (const ev of evaluaciones || []) {
        if (clasificarExamen(ev.descripcion)) continue;
        if (ev.camnot === null || ev.camnot === undefined) continue;
        grupos[claseEvaluacion(ev.descripcion)].push({ variable: `N${ev.camnot}`, camnot: ev.camnot });
    }
    Object.values(grupos).forEach((lista) => lista.sort((a, b) => a.camnot - b.camnot));
    return {
        pcs: grupos.PC.map((x) => x.variable),
        labs: grupos.LAB.map((x) => x.variable),
        monos: grupos.MONOGRAFIA.map((x) => x.variable),
    };
}

/* Cuántas se descartan por defecto según la regla general de la UNI. */
export function descartesPorDefecto(evaluaciones) {
    const { pcs, labs } = gruposDelCurso(evaluaciones);
    return {
        descartePC: pcs.length >= 4 ? 1 : 0,
        descarteLab: labs.length >= 7 ? 2 : (labs.length >= 2 ? 1 : 0),
    };
}

/* Arma la fórmula estimada con los nombres de variable que usa el motor
   (N1, N2...). `opciones` = { eliminarPC, eliminarLab } (booleanos del
   alumno; si no vienen, se usa la regla por defecto). Devuelve null si el
   curso no tiene evaluaciones no-examen (no hay PP que estimar). */
export function armarFormulaEstimada(evaluaciones, opciones = {}) {
    const { pcs, labs, monos } = gruposDelCurso(evaluaciones);
    const total = pcs.length + labs.length + monos.length;
    if (!total) return null;

    const porDefecto = descartesPorDefecto(evaluaciones);
    // El cuadrito de PCs solo tiene sentido con 2 o más; el de labs igual.
    const puedeEliminarPC = pcs.length >= 2;
    const cantidadLab = labs.length >= 7 ? 2 : 1;
    const puedeEliminarLab = labs.length >= 2;

    const eliminarPC = puedeEliminarPC && (opciones.eliminarPC ?? porDefecto.descartePC > 0);
    const eliminarLab = puedeEliminarLab && (opciones.eliminarLab ?? porDefecto.descarteLab > 0);

    let suma = [...pcs, ...labs, ...monos].join(' + ');
    if (eliminarPC) suma += ` - MIN(${pcs.join(', ')})`;
    if (eliminarLab) suma += cantidadLab === 2 ? ` - K2MIN(${labs.join(', ')})` : ` - MIN(${labs.join(', ')})`;

    const divisor = total - (eliminarPC ? 1 : 0) - (eliminarLab ? cantidadLab : 0);
    if (divisor <= 0) return null;

    return {
        formula: `(${suma}) / ${divisor}`,
        eliminarPC,
        eliminarLab,
        puedeEliminarPC,
        puedeEliminarLab,
        cantidadLab,
    };
}

/* Una fórmula del banco solo sirve si todas sus variables existen en el
   curso de ESTE ciclo (si el profesor cambió la estructura, no se usa). */
function calzaConElCurso(formula, evaluaciones) {
    const disponibles = new Set();
    for (const ev of evaluaciones || []) {
        const examen = clasificarExamen(ev.descripcion);
        if (examen) disponibles.add(examen);
        else if (ev.camnot !== null && ev.camnot !== undefined) disponibles.add(`N${ev.camnot}`);
    }
    return variablesDe(formula).every((v) => disponibles.has(v));
}

/* Punto de entrada.
   - oficial: fila de formulas_curso de este curso/sección/periodo (o null).
   - banco: filas de formulas_curso del mismo curso en OTROS periodos.
   - seccion / periodo: los del curso que se está viendo ("20262").
   - evaluaciones: las crudas del alumno (definen la estructura del curso).
   - opciones: { eliminarPC, eliminarLab } elegidas por el alumno.
   Devuelve { formula, fuente, origen, estimacion }:
     fuente 'oficial' | 'anterior' | 'estimada' | null (nada que usar). */
export function resolverFormulaPracticas({ oficial, banco = [], seccion, periodo, evaluaciones, opciones }) {
    if (formulaPracticasValida(oficial?.formula_practicas)) {
        return { formula: oficial.formula_practicas, fuente: 'oficial', origen: null, estimacion: null };
    }

    const candidatos = banco
        .filter((f) => String(f.periodo) !== String(periodo))
        .filter((f) => formulaPracticasValida(f.formula_practicas))
        .filter((f) => calzaConElCurso(f.formula_practicas, evaluaciones))
        .sort((a, b) => {
            const mismaA = (a.seccion || '') === (seccion || '') ? 1 : 0;
            const mismaB = (b.seccion || '') === (seccion || '') ? 1 : 0;
            if (mismaA !== mismaB) return mismaB - mismaA;
            return String(b.periodo).localeCompare(String(a.periodo));
        });
    if (candidatos.length) {
        const elegido = candidatos[0];
        return {
            formula: elegido.formula_practicas,
            fuente: 'anterior',
            origen: { periodo: String(elegido.periodo), mismaSeccion: (elegido.seccion || '') === (seccion || '') },
            estimacion: null,
        };
    }

    const estimacion = armarFormulaEstimada(evaluaciones, opciones);
    if (estimacion) return { formula: estimacion.formula, fuente: 'estimada', origen: null, estimacion };

    return { formula: null, fuente: null, origen: null, estimacion: null };
}
