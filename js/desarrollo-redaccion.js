// js/desarrollo-redaccion.js — Borrador de la descripción de un proyecto a partir de lo que responde el alumno.
//
// Archivo PURO: sin DOM, sin red y SIN IA. Solo ordena las respuestas en frases con una plantilla.
// No inventa nada: lo que el alumno deja vacío no aparece, y nunca se fabrica un resultado.
import { VERBOS_TRABAJO, VERBOS_EXPERIENCIA, PATRONES_CARRERA, DETALLE_IDIOMA } from './desarrollo-contenido.js?v=4';

const t = (v) => (typeof v === 'string' ? v.trim() : '');
const sinPunto = (v) => t(v).replace(/[.\s]+$/, '');
const minuscula = (v) => v.charAt(0).toLowerCase() + v.slice(1);

export function unir(lista) {
    return lista.length <= 1 ? (lista[0] || '') : lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1];
}

// «Ingeniería Civil» → 'civ'. Si no se reconoce la carrera, 'gen' (ejemplos generales).
export function tipoCarrera(texto) {
    const c = t(texto);
    for (const [clave, patron] of PATRONES_CARRERA) if (patron.test(c)) return clave;
    return 'gen';
}

// Herramientas de un proyecto en tres grupos. Los proyectos guardados antes (un solo texto «Python, SQL y Git»)
// se muestran en «Software y tecnologías» hasta que el alumno los reordene.
export function gruposDesde(proyecto = {}) {
    const g = proyecto.herr && typeof proyecto.herr === 'object' ? proyecto.herr : null;
    const lista = (x) => (Array.isArray(x) ? x.map(t).filter(Boolean) : []);
    if (g) return { sw: lista(g.sw), eq: lista(g.eq), me: lista(g.me) };
    const viejo = t(proyecto.herramientas).split(/,|;|\sy\s/).map(t).filter(Boolean);
    return { sw: viejo, eq: [], me: [] };
}
export const todasLasHerramientas = (g) => [...g.sw, ...g.eq, ...g.me];
export const aplanarHerramientas = (g) => todasLasHerramientas(g).join(', ');

// Texto de periodo para mostrar: «2024 – actualidad», «marzo de 2025 – noviembre de 2025», «2025» o '' si no hay fechas.
export function textoPeriodo({ desde, hasta, sigue } = {}) {
    const d = t(desde), h = t(hasta);
    if (sigue) return d ? `${d} – actualidad` : 'En desarrollo';
    if (d && h) return d === h ? d : `${d} – ${h}`;
    return d || h || '';
}

// verbo: posición en VERBOS_TRABAJO. sigue → presente; si no, pasado. El verbo lo elige el alumno: la plantilla se adapta a él.
export function armarBorrador({ verbo = 0, objeto, hizo, meta, resultado, equipo = false, sigue = false, herramientas = [] } = {}) {
    const o = sinPunto(objeto), h = sinPunto(hizo);
    if (!o || !h) return '';                                              // lo mínimo: qué creó y qué hizo
    const v = VERBOS_TRABAJO[verbo] || VERBOS_TRABAJO[0];
    let abre = sigue ? v[1] : v[2];
    if (equipo) abre = 'En equipo, ' + minuscula(abre);
    const m = sinPunto(meta), r = sinPunto(resultado);
    const hs = herramientas.map(t).filter(Boolean);
    let texto = `${abre} ${o}${m ? ' con el objetivo de ' + minuscula(m) : ''}.`;
    texto += ` ${sigue ? 'Me encargo' : 'Me encargué'} de ${h}${hs.length ? ', utilizando ' + unir(hs) : ''}.`;
    if (r) texto += ` ${sigue ? 'Hasta ahora, ' : 'Como resultado, '}${minuscula(r)}.`;
    return texto;
}

// Detalle de un idioma para mostrar: solo las habilidades que el alumno completó y que DIFIEREN de su nivel general.
// «lectura avanzada, expresión oral básica». Si no completó nada (o todo es igual al general) devuelve ''.
const ADJETIVO = { 'básico': 'básica', 'intermedio': 'intermedia', 'avanzado': 'avanzada' };
export function detalleIdioma(h = {}) {
    const d = h.detalle && typeof h.detalle === 'object' ? h.detalle : {};
    const general = t(h.nivel).toLowerCase();
    const partes = [];
    for (const [clave, , enCV] of DETALLE_IDIOMA) {
        const v = t(d[clave]).toLowerCase();
        if (v && v !== general && ADJETIVO[v]) partes.push(`${enCV} ${ADJETIVO[v]}`);
    }
    return partes.join(', ');
}


// ───────────── Experiencia ─────────────
// «Organicé y coordiné», «Apoyé e investigué»: une los verbos con la concordancia correcta (y → e ante «i-» / «hi-»).
export function unirVerbos(lista) {
    const v = lista.map(t).filter(Boolean).map((x, i) => (i ? minuscula(x) : x));   // solo el primero va con mayúscula
    if (v.length <= 1) return v[0] || '';
    const ultimo = v[v.length - 1];
    const y = /^h?i(?![aeou])/i.test(ultimo) ? ' e ' : ' y ';
    return v.slice(0, -1).join(', ') + y + ultimo;
}

// Verbos elegidos (posiciones en VERBOS_EXPERIENCIA) en la persona y el tiempo correctos. sigue → presente; si no, pasado.
export function verbosConjugados(verbos = [], sigue = false) {
    return unirVerbos(verbos.map((i) => (VERBOS_EXPERIENCIA[i] || [])[sigue ? 1 : 2]).filter(Boolean));
}

// Borrador de «¿Qué hiciste?». El alumno completa cada frase tras un comienzo fijo (el verbo, «La actividad consistía en»…),
// así la oración siempre concuerda. NO añade verbos más fuertes, calificativos ni nada que el alumno no haya escrito:
// lo que deja vacío no aparece.
export function armarBorradorExperiencia({ verbos = [], contexto, hizo, resultado, sigue = false } = {}) {
    const c = sinPunto(contexto), h = sinPunto(hizo), r = sinPunto(resultado);
    if (!c && !h) return '';
    const frases = [];
    if (c) frases.push(`${sigue ? 'La actividad consiste en' : 'La actividad consistía en'} ${minuscula(c)}.`);
    if (h) {
        const vs = verbosConjugados(verbos, sigue);
        frases.push(vs ? `${vs} ${minuscula(h)}.` : `${sigue ? 'Me encargo de' : 'Me encargué de'} ${minuscula(h)}.`);
    }
    if (r) frases.push(`${sigue ? 'Hasta ahora, ' : 'Como resultado, '}${minuscula(r)}.`);
    return frases.join(' ');
}

// Borrador de un logro: «verbo + lo que hiciste [+ conector + detalle]». Solo ordena lo escrito; no agrega nada.
export function armarBorradorLogro({ verbo = '', a = '', conector = '', b = '' } = {}) {
    const limpia = (x) => t(x).replace(/[.\s]+$/, '');
    const A = limpia(a), B = limpia(b), V = t(verbo);
    if (!A) return '';
    const parteA = V ? `${V} ${minuscula(A)}` : A.charAt(0).toUpperCase() + A.slice(1);
    return `${parteA}${B && conector ? ' ' + conector + ' ' + minuscula(B) : ''}.`;
}

// Une nombres tal como el alumno los escribió (sin cambiar mayúsculas): «A», «A y B», «A, B y C». «e» ante «i» (y «hi»).
export function unirNombres(lista = []) {
    const v = lista.map(t).filter(Boolean);
    if (v.length <= 1) return v[0] || '';
    const ultimo = v[v.length - 1];
    const y = /^h?i(?![aeou])/i.test(ultimo) ? ' e ' : ' y ';
    return v.slice(0, -1).join(', ') + y + ultimo;
}

// Borrador del perfil: cada frase aparece solo si hay contenido. La última es del alumno, tal cual (solo se cuida el punto final).
// Sin ciclo, sin adjetivos, sin nada que el alumno no haya elegido o escrito.
export function armarBorradorPerfil({ estudia = '', destacar = [], busca = '' } = {}) {
    const limpia = (x) => t(x).replace(/[.\s]+$/, '');
    const frases = [];
    const E = limpia(estudia), B = limpia(busca);
    const D = unirNombres(destacar.map(limpia));
    if (E) frases.push(`Estudiante de ${E}.`);
    if (D) frases.push(`Quiero destacar ${D}.`);
    if (B) frases.push(`${B.charAt(0).toUpperCase()}${B.slice(1)}.`);
    return frases.join(' ');
}
