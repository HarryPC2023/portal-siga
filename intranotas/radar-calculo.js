// radar-calculo.js — Cálculos del Radar académico. Módulo PURO: no toca el DOM
// ni Supabase. Recibe la fórmula cruda de INTRALU y los valores del curso, y
// devuelve la situación del curso (estado, nota que necesita, por qué, qué
// hacer). La interfaz (radar-ui.js) solo la pinta.
//
// Principio heredado del resto de SIGA: NUNCA se reescribe el álgebra de un
// curso. Todo se calcula evaluando la fórmula tal cual la publica INTRALU
// (formula-engine.js).
//
// Diferencia con "¿Qué nota necesito?": allá lo que falta cuenta como 0. Acá no:
// al inicio del ciclo eso haría ver todos los cursos como imposibles. El Radar
// pregunta "¿qué promedio necesito en TODO lo que falta?" y, si todavía no hay
// notas suficientes, dice "Esperando notas" en vez de dar un susto.
import { evaluarFormula, aplicarSustitutorio, truncarNota, calcularNotaMinimaNecesaria } from './formula-engine.js';
import { variablesDeFormula } from './escenarios.js';
import { claseEvaluacion } from './formula-practicas.js';
import { tendenciaDeCurso, evaluacionesEnOrden } from './analisis-academico.js';

/* ---- Números ajustables ---- */
export const UMBRAL_APROBAR = 10;      // nota mínima para aprobar
export const MIN_PUBLICADO = 0.25;     // parte de la nota que debe estar publicada para opinar
export const CORTE_MARGEN = 8;         // necesitas 8 o menos       → Con margen
export const CORTE_LIMITE = 14;        // necesitas de 9 a 14       → Cerca del límite (15 o más → Necesita remontar)
export const CORTE_CRITICO = 18;       // necesitar MÁS de 18 (casi la nota máxima) ya es situación crítica: casi no hay salida
export const BRECHA_REMONTAR = 4;      // si con tu ritmo actual no apruebas y te faltan 4 o más puntos de promedio → Necesita remontar

/* ---- Estados (clave, texto, orden de atención: menor = más urgente) ---- */
export const ESTADOS = {
    fuera:       { clave: 'fuera',       texto: 'Situación crítica', orden: 0 },
    remontar:    { clave: 'remontar',    texto: 'Necesita remontar', orden: 1 },
    limite:      { clave: 'limite',      texto: 'Cerca del límite',  orden: 2 },
    margen:      { clave: 'margen',      texto: 'Con margen',        orden: 3 },
    asegurado:   { clave: 'asegurado',   texto: 'Asegurado',         orden: 4 },
    esperando:   { clave: 'esperando',   texto: 'Esperando notas',   orden: 5 },
    sinformula:  { clave: 'sinformula',  texto: 'Sin fórmula aún',   orden: 6 },
};

/* ---------- Categoría del termómetro: SOLO cinco ----------
   El termómetro mide el NIVEL del curso, como uno de fiebre: un curso en riesgo nunca puede
   mostrarse como "Subiendo" o "Estable", aunque sus notas suban. Por eso la situación manda:
     critico → "Situación crítica"   (no hay salida realista: se debe decidir a tiempo)
     baja    → "Bajando"             (notas que bajan, o necesita remontar / está cerca del límite)
     espera  → "Esperando notas"     (aún no hay datos suficientes para opinar)
     sube / estable                  (solo cuando el nivel es bueno: tendencia de notas)
   Si el curso ya está ASEGURADO (aprueba aunque lo que falta valga 0, igual que "¡Ya aprobaste!"
   en "¿Qué nota necesito?"), el nivel manda: nunca dice "Bajando"; muestra Subiendo o Estable. */
export const TEXTO_CATEGORIA = {
    sube: 'Subiendo', estable: 'Estable', baja: 'Bajando', critico: 'Situación crítica', espera: 'Esperando notas',
};

export function categoriaTermometro(analisis) {
    const e = analisis.estado.clave;
    const t = analisis.tendencia.clave;
    if (e === 'fuera') return 'critico';
    if (e === 'remontar' || e === 'limite') return 'baja';
    if (e === 'asegurado') return t === 'sube' ? 'sube' : 'estable';
    if (e === 'esperando' || e === 'sinformula' || t === 'sin') return 'espera';
    return t === 'sube' ? 'sube' : t === 'baja' ? 'baja' : 'estable';
}

const esNula = (v) => v === null || v === undefined || Number.isNaN(v);

/* ---------- Evaluación segura de la fórmula ---------- */
function notaFinalCruda(formulaPP, formulaFinal, valores) {
    try {
        const pp = formulaPP ? evaluarFormula(formulaPP, valores) : (valores.PP ?? null);
        if (formulaPP && pp === null) return null;
        const nf = evaluarFormula(formulaFinal, aplicarSustitutorio({ ...valores, PP: pp }));
        return nf === null || Number.isNaN(nf) ? null : nf;
    } catch {
        return null;
    }
}
const notaFinalTruncada = (a, b, v) => {
    const n = notaFinalCruda(a, b, v);
    return n === null ? null : truncarNota(n);
};

/* Variables que son "una evaluación" del curso: todo lo que mencionan las
   fórmulas, menos PP (se calcula) y ES (el sustitutorio no está en la fórmula). */
function variablesDeEvaluaciones(formulaPP, formulaFinal) {
    const usadas = new Set([...variablesDeFormula(formulaPP), ...variablesDeFormula(formulaFinal)]);
    usadas.delete('PP');
    usadas.delete('ES');
    return [...usadas].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
}

/* ---------- Nombres que ve el alumno ---------- */
export function etiquetaDeVariable(variable, evaluaciones = []) {
    if (variable === 'EP') return 'examen parcial';
    if (variable === 'EF') return 'examen final';
    if (variable === 'ES') return 'examen sustitutorio';
    const m = /^N(\d+)$/.exec(variable);
    if (!m) return variable;
    const ev = (evaluaciones || []).find((e) => String(e.camnot) === m[1]);
    const clase = ev ? claseEvaluacion(ev.descripcion) : 'PC';
    if (clase === 'LAB') return `laboratorio ${m[1]}`;
    if (clase === 'MONOGRAFIA') return (ev.descripcion || 'monografía').trim().toLowerCase();
    return `PC${m[1]}`;
}

/* Igual, pero con su artículo para frases: "el examen final", "la PC4", "la monografía 4". */
export function etiquetaConArticulo(variable, evaluaciones = []) {
    if (variable === 'EP') return 'el examen parcial';
    if (variable === 'EF') return 'el examen final';
    if (variable === 'ES') return 'el examen sustitutorio';
    const m = /^N(\d+)$/.exec(variable);
    if (!m) return `el ${variable}`;
    const ev = (evaluaciones || []).find((e) => String(e.camnot) === m[1]);
    const clase = ev ? claseEvaluacion(ev.descripcion) : 'PC';
    if (clase === 'LAB') return `el laboratorio ${m[1]}`;
    if (clase === 'MONOGRAFIA') {
        const numero = (ev.descripcion || '').match(/\d+/);
        return `la monografía${numero ? ` ${numero[0]}` : ''}`;
    }
    return `la PC${m[1]}`;
}
const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

/* ---------- Descartes: qué nota deja de contar ----------
   Muchas fórmulas de prácticas descartan la(s) más baja(s): MIN(N1, N2, ...) quita 1 y
   K2MIN(...) quita 2. Se leen directo de la fórmula (la oficial, la anterior o la estimada),
   nunca de una regla aparte, y se dicen con palabras: qué nota se descarta HOY y qué
   pendientes solo suman si la superan. */
function gruposDeDescarte(formulaPP) {
    const grupos = [];
    const re = /K(\d+)MIN\(([^)]*)\)|MIN\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(String(formulaPP || ''))) !== null) {
        const cantidad = m[1] ? parseInt(m[1], 10) : 1;
        const variables = (m[2] ?? m[3]).split(',').map((s) => s.trim()).filter(Boolean);
        if (variables.length > cantidad) grupos.push({ cantidad, variables });
    }
    return grupos;
}

const unir = (lista) => (lista.length <= 1 ? lista.join('') : `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}`);

export function describirDescartes(formulaPP, valores, evaluaciones = []) {
    const frases = [];
    for (const g of gruposDeDescarte(formulaPP)) {
        const publicadas = g.variables.filter((v) => !esNula(valores[v]))
            .map((v, i) => ({ v, nota: valores[v], i }))
            .sort((a, b) => (a.nota - b.nota) || (a.i - b.i));
        const pendientes = g.variables.filter((v) => esNula(valores[v]));
        if (!publicadas.length) continue;
        const bajas = publicadas.slice(0, g.cantidad);
        const lab = /^laboratorio/.test(etiquetaDeVariable(g.variables[0], evaluaciones));
        const plural = lab ? 'laboratorios' : 'prácticas';
        const bajo = lab ? 'bajo' : 'baja';      // "el más bajo" (laboratorio) / "la más baja" (práctica)
        const art = lab ? 'el' : 'la';
        const nombre = (x) => `${etiquetaDeVariable(x.v, evaluaciones)} (${x.nota})`;
        if (!pendientes.length) {
            frases.push(g.cantidad === 1
                ? `Se descarta tu ${nombre(bajas[0])}: es ${art} más ${bajo} de tus ${plural}.`
                : `Se descartan tus ${g.cantidad} ${plural} más ${bajo}s: ${unir(bajas.map(nombre))}.`);
        } else {
            const pend = unir(pendientes.map((x) => etiquetaConArticulo(x, evaluaciones)));
            const verbo = pendientes.length > 1 ? 'solo suman si superan' : 'solo suma si supera';
            frases.push(g.cantidad === 1
                ? `Hoy se descartaría tu ${nombre(bajas[0])}, ${art} más ${bajo} de tus ${plural}. ${mayuscula(pend)} ${verbo} ese valor.`
                : `Hoy se descartarían tus ${bajas.length} ${plural} más ${bajo}s: ${unir(bajas.map(nombre))}. ${mayuscula(pend)} ${verbo} esos valores.`);
        }
    }
    return frases;
}

/* ---------- Cursos que se abren al aprobar (cadena completa del plan) ----------
   `cursos`: los del Avance Curricular ya procesado (progreso-carrera.js):
   [{ codigo, creditos, estado, prereq: [{ code }] }]. Cuenta los cursos que
   dependen de éste, directa o indirectamente, y que todavía no están aprobados. */
export function cursosQueAbre(cursos, codigo) {
    if (!Array.isArray(cursos) || !cursos.length) return null;
    if (!cursos.some((c) => c.codigo === codigo)) return null;
    const hijos = {};
    cursos.forEach((c) => (c.prereq || []).forEach((p) => { (hijos[p.code] ||= []).push(c.codigo); }));
    const vistos = new Set();
    const pila = [...(hijos[codigo] || [])];
    while (pila.length) {
        const actual = pila.pop();
        if (vistos.has(actual)) continue;
        vistos.add(actual);
        (hijos[actual] || []).forEach((h) => pila.push(h));
    }
    const porCodigo = Object.fromEntries(cursos.map((c) => [c.codigo, c]));
    const pendientes = [...vistos].map((cod) => porCodigo[cod]).filter((c) => c && c.estado !== 'aprobado');
    return { cantidad: pendientes.length, creditos: pendientes.reduce((s, c) => s + (Number(c.creditos) || 0), 0) };
}

/* ---------- El análisis de un curso ----------
   entrada:
     formulaPP, formulaFinal : fórmulas crudas de INTRALU (formulaPP puede ser null)
     valores                 : { N1: 14, N2: null, EP: 12, EF: null, ES: null } (lo oficial + lo simulado)
     evaluaciones, simulados : para la tendencia y los nombres
   salida: { estado, necesita, ... } (ver abajo) */
export function analizarCurso({ formulaPP = null, formulaFinal = null, valores = {}, evaluaciones = [], simulados = {} } = {}) {
    const tendencia = tendenciaDeCurso(evaluaciones, simulados);
    const serie = evaluacionesEnOrden(evaluaciones, simulados).filter((e) => e.nota !== null).map((e) => e.nota);
    const base = { tendencia, serie, razones: [], pendientes: [], publicado: null, necesita: null, importante: null,
        descartes: formulaPP ? describirDescartes(formulaPP, valores, evaluaciones) : [] };

    if (!formulaFinal) return { ...base, estado: ESTADOS.sinformula, tipo: 'sinformula' };

    const variables = variablesDeEvaluaciones(formulaPP, formulaFinal);
    const pendientes = variables.filter((v) => esNula(valores[v]));
    base.pendientes = pendientes;

    // Si ni poniendo 20 en todo se puede evaluar la fórmula (por ejemplo, falta la
    // fórmula de prácticas), no hay con qué calcular: se dice sin inventar nada.
    // Si no hay fórmula de prácticas pero la PP ya viene dada, esa PP se respeta.
    const ppDada = !formulaPP && !esNula(valores.PP) ? { PP: valores.PP } : {};
    const todoVeinte = { ...ppDada };
    variables.forEach((v) => { todoVeinte[v] = 20; });
    if (notaFinalCruda(formulaPP, formulaFinal, todoVeinte) === null) {
        return { ...base, estado: ESTADOS.sinformula, tipo: 'sinformula' };
    }

    // Todo lo que falta = x. Devuelve la nota final truncada con ese supuesto.
    const conUniforme = (x) => {
        const v = { ...valores };
        pendientes.forEach((p) => { v[p] = x; });
        return notaFinalTruncada(formulaPP, formulaFinal, v);
    };

    /* ----- Caso 1: no falta nada → la nota final ya se conoce ----- */
    if (!pendientes.length) {
        const nf = notaFinalTruncada(formulaPP, formulaFinal, valores);
        if (nf === null) return { ...base, estado: ESTADOS.sinformula, tipo: 'sinformula' };
        if (nf >= UMBRAL_APROBAR) return { ...base, estado: ESTADOS.asegurado, tipo: 'completo', notaFinal: nf, necesita: null };
        if (esNula(valores.ES)) {
            // No llega, pero el sustitutorio siempre es una opción real.
            const r = calcularNotaMinimaNecesaria({ formulaPP, formulaFinal, valoresBase: { ...valores, ES: null }, variableIncognita: 'ES', umbral: UMBRAL_APROBAR });
            if (r.posible) return { ...base, estado: ESTADOS.remontar, tipo: 'sustitutorio', notaFinal: nf, necesita: Math.min(20, Math.ceil(r.notaMinima - 1e-9)), variable: 'ES' };
        }
        return { ...base, estado: ESTADOS.fuera, tipo: 'completo', notaFinal: nf, necesita: null };
    }

    /* ----- Caso 2: falta algo. ¿Cuánto de la nota ya está decidido? -----
       Rango de notas finales posibles = (todo lo que falta en 20) − (todo lo que falta en 0).
       Si nada estuviera publicado ese rango sería la escala completa (0 a 20). */
    const rango = (fijar) => {
        const alto = { ...fijar }, bajo = { ...fijar };
        pendientes.forEach((p) => { alto[p] = 20; bajo[p] = 0; });
        const a = notaFinalCruda(formulaPP, formulaFinal, alto), b = notaFinalCruda(formulaPP, formulaFinal, bajo);
        return a === null || b === null ? null : a - b;
    };
    const rangoActual = rango(valores);
    const rangoTotal = (() => {
        const alto = { ...ppDada }, bajo = { ...ppDada };
        variables.forEach((p) => { alto[p] = 20; bajo[p] = 0; });
        const a = notaFinalCruda(formulaPP, formulaFinal, alto), b = notaFinalCruda(formulaPP, formulaFinal, bajo);
        return a === null || b === null ? null : a - b;
    })();
    const publicado = rangoActual !== null && rangoTotal ? Math.max(0, Math.min(1, 1 - rangoActual / rangoTotal)) : 0;
    base.publicado = publicado;

    // La evaluación pendiente que más pesa (con lo demás en un valor neutro).
    const neutro = { ...valores };
    pendientes.forEach((p) => { neutro[p] = 10; });
    let importante = null;
    pendientes.forEach((p) => {
        const a = notaFinalCruda(formulaPP, formulaFinal, { ...neutro, [p]: 20 });
        const b = notaFinalCruda(formulaPP, formulaFinal, { ...neutro, [p]: 0 });
        if (a === null || b === null) return;
        const peso = (a - b) / 20;
        if (!importante || peso > importante.peso + 1e-9) importante = { variable: p, peso, etiqueta: etiquetaDeVariable(p, evaluaciones), articulado: etiquetaConArticulo(p, evaluaciones) };
    });
    base.importante = importante;

    if (publicado < MIN_PUBLICADO - 1e-9) return { ...base, estado: ESTADOS.esperando, tipo: 'esperando' };

    /* ----- ¿Qué promedio hace falta en TODO lo que falta? (entero, 0 a 20) ----- */
    const conCero = conUniforme(0), conVeinte = conUniforme(20);
    if (conCero === null || conVeinte === null) return { ...base, estado: ESTADOS.sinformula, tipo: 'sinformula' };
    if (conCero >= UMBRAL_APROBAR) return { ...base, estado: ESTADOS.asegurado, tipo: 'asegurado', necesita: 0 };
    if (conVeinte < UMBRAL_APROBAR) return { ...base, estado: ESTADOS.fuera, tipo: 'fuera', maximoPosible: conVeinte };

    let x = 1;
    while (x < 20 && conUniforme(x) < UMBRAL_APROBAR) x += 1;
    let estado = x <= CORTE_MARGEN ? ESTADOS.margen : x <= CORTE_LIMITE ? ESTADOS.limite : ESTADOS.remontar;

    /* Tu ritmo actual: si sigues sacando lo mismo que en lo ya publicado, ¿dónde terminas?
       Un curso donde hoy sacas 5 y necesitas 13 NO está "cerca del límite": está en camino
       a desaprobar. Por eso el ritmo puede subir la urgencia (nunca bajarla). */
    const publicadas = variables.filter((v) => !esNula(valores[v])).map((v) => valores[v]);
    const media = publicadas.length ? Math.round((publicadas.reduce((s, n) => s + n, 0) / publicadas.length) * 10) / 10 : null;
    const ritmoNF = media === null ? null : conUniforme(media);
    if (ritmoNF !== null && ritmoNF < UMBRAL_APROBAR) {
        const minimo = (x - media >= BRECHA_REMONTAR) ? ESTADOS.remontar : ESTADOS.limite;
        if (minimo.orden < estado.orden) estado = minimo;
    }
    // Necesitar 19 o 20 en lo que falta es, en la práctica, no tener salida: se dice sin rodeos.
    const casiImposible = x > CORTE_CRITICO;
    if (casiImposible) estado = ESTADOS.fuera;
    const resultado = { ...base, estado, tipo: casiImposible ? 'casi' : 'normal', necesita: x, media, ritmoNF, sinRendir: conCero };
    if (pendientes.length === 1 && x > 0) {
        const anterior = conUniforme(x - 1);
        resultado.conUnoMenos = { nota: x - 1, notaFinal: anterior };
    }
    return resultado;
}

/* ---------- Frases para el alumno (sin inventar nada: salen de los números) ---------- */
const serieTexto = (serie) => serie.slice(0, 5).join(' → ');
const pct = (peso) => Math.round(peso * 100);

export function textoAnalisis(a) {
    const razones = [];
    const unico = a.pendientes.length === 1 ? a.importante?.articulado : null;
    let queHacer = '';
    let tile = { valor: '—', sub: '' };

    switch (a.tipo) {
        case 'completo':
            tile = { valor: String(a.notaFinal.toFixed(1)), sub: 'tu nota final con lo publicado' };
            razones.push(a.estado.clave === 'asegurado' ? 'Ya tienes todas las notas y llegas a 10.' : 'Ya tienes todas las notas y no llegas a 10.');
            queHacer = a.estado.clave === 'asegurado'
                ? 'Tu curso está aprobado con las notas que ya tienes.'
                : 'Con las notas actuales el curso no llega a 10. Decide a tiempo: conversa con tu profesor y revisa las opciones que te da tu facultad.';
            break;
        case 'sustitutorio':
            tile = { valor: String(a.necesita), sub: 'en el examen sustitutorio, sobre 20' };
            razones.push(`Con tus notas actuales llegas a ${a.notaFinal.toFixed(1)}.`);
            razones.push(`El sustitutorio reemplaza tu nota más baja entre parcial y final: con ${a.necesita} apruebas.`);
            queHacer = `Prepara el sustitutorio: necesitas ${a.necesita} para llegar a 10.`;
            break;
        case 'asegurado':
            tile = { valor: '0', sub: 'en lo que falta: ya apruebas' };
            razones.push('Con lo que ya tienes, apruebas aunque saques 0 en lo que falta.');
            if (a.importante) razones.push(`${mayuscula(a.importante.articulado)} aún pesa ${pct(a.importante.peso)}% de tu nota: sube tu promedio si te va bien.`);
            queHacer = 'Tu curso está asegurado. Puedes dar más tiempo a los cursos con más prioridad.';
            break;
        case 'fuera':
            tile = { valor: '> 20', sub: 'ni con 20 en lo que falta llegas a 10' };
            razones.push(`Aun sacando 20 en todo lo que falta, tu nota final sería ${a.maximoPosible.toFixed(1)}.`);
            queHacer = 'Con las notas actuales el curso no llega a 10. Decide a tiempo: conversa con tu profesor y revisa las opciones que te da tu facultad.';
            break;
        case 'esperando':
            tile = { valor: '—', sub: 'aún no hay notas suficientes' };
            razones.push(`Está publicado ${Math.round((a.publicado || 0) * 100)}% de la nota; hace falta al menos ${Math.round(MIN_PUBLICADO * 100)}% para estimar tu situación.`);
            razones.push('Así evitamos mostrarte un dato alarmante cuando solo falta que se publiquen las notas.');
            queHacer = 'Mientras llegan las notas, puedes escribir notas simuladas en el curso para ver escenarios.';
            break;
        case 'sinformula':
            tile = { valor: '—', sub: 'sin fórmula todavía' };
            razones.push('Todavía no hay una fórmula completa para calcular este curso (INTRALU la publica al cerrar el ciclo).');
            queHacer = 'En cuanto haya una fórmula, el Radar se activa solo.';
            break;
        default: {
            const critico = a.tipo === 'casi';
            const sub = unico ? `en ${unico}, sobre 20` : 'de promedio en lo que falta, sobre 20';
            tile = { valor: String(a.necesita), sub: critico ? `${sub}: casi la nota máxima` : sub };
            razones.push(critico
                ? `Para aprobar necesitarías ${a.necesita} de 20 ${unico ? `en ${unico}` : 'de promedio en lo que falta'}: casi la nota máxima.`
                : (unico
                    ? `Para aprobar necesitas ${a.necesita} en ${unico}.`
                    : `Para aprobar necesitas un promedio de ${a.necesita} en lo que falta.`));
            // Igual que "Nota actual" en tu tarjeta: lo que no se rinde cuenta 0. Solo se dice cuando
            // lo que falta son prácticas, monografías o laboratorios (si falta un examen, no es una nota actual).
            const soloNoExamenes = a.pendientes.every((v) => /^N\d+$/.test(v));
            if (soloNoExamenes && a.sinRendir !== null && a.sinRendir !== undefined && a.sinRendir < UMBRAL_APROBAR) {
                razones.push(`Si no rindes lo que falta, tu nota quedaría en ${a.sinRendir.toFixed(1)}.`);
            }
            if (a.ritmoNF !== null && a.ritmoNF !== undefined && a.ritmoNF < UMBRAL_APROBAR) {
                razones.push(`Con tu ritmo actual (promedio ${a.media} en lo publicado) terminarías en ${a.ritmoNF.toFixed(1)}.`);
            }
            if (a.conUnoMenos) razones.push(`Con ${a.conUnoMenos.nota} te quedas en ${a.conUnoMenos.notaFinal.toFixed(1)}: la universidad no redondea.`);
            if (a.importante) razones.push(`${mayuscula(a.importante.articulado)} pesa ${pct(a.importante.peso)}% de tu nota.`);
            queHacer = critico
                ? 'Aprobar es prácticamente imposible con las notas actuales. Decide a tiempo: conversa con tu profesor y revisa las opciones que te da tu facultad.'
                : (a.importante
                    ? `Prioriza ${a.importante.articulado}: es lo que más pesa de lo que falta. ${unico ? `Con ${a.necesita} apruebas.` : `Necesitas un promedio de ${a.necesita} en lo que falta.`}`
                    : `Necesitas un promedio de ${a.necesita} en lo que falta.`);
        }
    }

    // La tendencia suma una razón cuando hay datos y todavía queda espacio.
    if (a.serie.length >= 3 && a.tendencia.clave !== 'sin' && razones.length < 3) {
        if (a.tendencia.clave === 'baja') razones.push(`Tus evaluaciones vienen bajando: ${serieTexto(a.serie)}.`);
        else if (a.tendencia.clave === 'sube') razones.push(`Tus evaluaciones vienen subiendo: ${serieTexto(a.serie)}.`);
        else razones.push(`Tus evaluaciones se mantienen parejas: ${serieTexto(a.serie)}.`);
    }

    return { razones: razones.slice(0, 3), queHacer, tile, descartes: a.descartes || [] };
}

/* ---------- Orden de atención ----------
   Primero el estado más urgente; a igual estado, el que tiene más créditos y
   el que abre más cursos; por último, por nombre. */
export function ordenarPorPrioridad(items) {
    return [...items].sort((a, b) =>
        (a.analisis.estado.orden - b.analisis.estado.orden)
        || ((b.creditos || 0) - (a.creditos || 0))
        || ((b.abre?.cantidad || 0) - (a.abre?.cantidad || 0))
        || String(a.nombre).localeCompare(String(b.nombre), 'es'));
}
