// js/proyectos-practicos.js — Portada de «Proyectos Prácticos»: áreas, buscador, ideas, ficha, guardar y Sorpréndeme.
//
// Por ahora la sección es SOLO para el dueño (mismo candado que Desarrollo profesional: js/desarrollo-acceso.js).
// Los textos y las ideas viven en js/proyectos-datos.js. Las ideas guardadas viven en la cuenta (SigaEstado, módulo «desarrollo»,
// claves «ideaguardada:<id>») para verse igual en PC y celular; si no hay sesión, quedan en este navegador (localStorage).
import { accesoPermitido } from './desarrollo-acceso.js?v=1';
import { SigaEstado } from './sync-estado.js?v=1';
import { AREAS, INTENCIONES, IDEAS, FUENTES, DESTACADAS } from './proyectos-datos.js?v=3';

const $ = (s) => document.querySelector(s);
const CLAVE_GUARDADAS = 'siga_pp_guardadas_v1';

function el(tag, props = {}, ...hijos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k === 'style') n.setAttribute('style', v);
        else n.setAttribute(k, v === true ? '' : v);
    }
    hijos.flat().forEach((h) => { if (h != null && h !== false) n.append(h.nodeType ? h : document.createTextNode(String(h))); });
    return n;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
function iconoMarcador(tam) {
    const s = document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('width', tam); s.setAttribute('height', tam); s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', 'M6 4h12v17l-6-4-6 4z'); s.append(p);
    return s;
}

const areaDe = (id) => AREAS.find((a) => a.id === id);
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ───── ideas guardadas ───── */
const MODULO = 'desarrollo', PREFIJO = 'ideaguardada:';
let enNube = false;
function leerLocal() {
    try { const v = JSON.parse(localStorage.getItem(CLAVE_GUARDADAS) || '[]'); return new Set(Array.isArray(v) ? v : []); }
    catch (e) { return new Set(); }
}
function escribirLocal(set) { try { localStorage.setItem(CLAVE_GUARDADAS, JSON.stringify([...set])); } catch (e) { /* sin almacenamiento */ } }
function leerGuardadas() {
    if (!enNube) return leerLocal();
    return new Set(SigaEstado.listar(MODULO, PREFIJO).map((f) => f.clave.slice(PREFIJO.length)));
}
function guardarUna(id, si) {
    if (enNube) { if (si) SigaEstado.guardar(MODULO, PREFIJO + id, { t: Date.now() }); else SigaEstado.borrar(MODULO, PREFIJO + id); }
    else { const s = leerLocal(); if (si) s.add(id); else s.delete(id); escribirLocal(s); }
}
// Conecta con la cuenta (máx. 4 s de espera) y pasa una sola vez lo que había guardado en este navegador.
async function conectarNube() {
    try {
        await Promise.race([SigaEstado.listo, new Promise((_, rej) => setTimeout(() => rej(new Error('sin sesión')), 4000))]);
        enNube = true;
        const viejas = leerLocal();
        viejas.forEach((id) => { if (IDEAS.some((i) => i.id === id) && SigaEstado.leer(MODULO, PREFIJO + id) === undefined) SigaEstado.guardar(MODULO, PREFIJO + id, { t: Date.now() }); });
        if (viejas.size) { try { localStorage.removeItem(CLAVE_GUARDADAS); } catch (e) { /* nada */ } }
        SigaEstado.alCambiar(MODULO, null, (e) => { if (e.clave && e.clave.startsWith(PREFIJO)) { estado.guardadas = leerGuardadas(); repintarTodo(); } });
    } catch (e) { enNube = false; }
    estado.guardadas = leerGuardadas();
}

const estado = { area: null, intencion: null, q: '', verTodas: false, guardadas: new Set(), ultimaSorpresa: null };

function alternarGuardada(id) {
    guardarUna(id, !estado.guardadas.has(id));
    estado.guardadas = leerGuardadas();
    repintarTodo();
    actualizarBotonFicha();
}

/* ───── filtros ───── */
const hayFiltros = () => !!(estado.area || estado.intencion || estado.q.trim());
function coincideTexto(i, q) {
    const a = areaDe(i.area);
    // Se busca en el tema, la carrera («Puede interesar a»), lo que se practica y lo que se podría desarrollar.
    const texto = norm([i.titulo, i.resumen, i.tipo, (i.etiquetas || []).join(' '), a ? a.nombre : '', (i.carreras || []).join(' '),
        (i.habilidades || []).join(' '), (i.herramientas || []).join(' '), i.problema, i.desarrollar, i.otroSector].join(' '));
    const coincide = (p) => texto.includes(p) || (p.length > 4 && texto.includes(p.replace(/(es|s)$/, '')));   // «guías» ≈ «guía»
    return q.split(/\s+/).every(coincide);
}
function ideasFiltradas() {
    const q = norm(estado.q.trim());
    return IDEAS.filter((i) => {
        if (estado.area && i.area !== estado.area) return false;
        if (estado.intencion && !(i.intencion || []).includes(estado.intencion)) return false;
        return !q || coincideTexto(i, q);
    });
}

// «Destacadas»: 4 ideas elegidas a mano (DESTACADAS) que van rotando solas: cada semana empieza en un punto distinto de la lista.
export function destacadasDeLaSemana(fecha = new Date(), cuantas = 4) {
    const pool = DESTACADAS.map((id) => IDEAS.find((i) => i.id === id)).filter(Boolean);
    if (pool.length <= cuantas) return pool;
    const semana = Math.floor(fecha.getTime() / (7 * 24 * 3600 * 1000));
    const ini = (semana * cuantas) % pool.length;
    return Array.from({ length: cuantas }, (_, k) => pool[(ini + k) % pool.length]);
}

/* ───── pintado ───── */
function pintarAreas() {
    $('#ppAreas').replaceChildren(...AREAS.map((a) => {
        const n = IDEAS.filter((i) => i.area === a.id).length;
        const b = el('button', { type: 'button', class: 'pp-area', style: `--c:${a.c}; --f:${a.f}; --n:${a.n || a.c}`, 'aria-pressed': String(estado.area === a.id) },
            el('span', { class: 'pp-area-ico' }, el('img', { src: `assets/proyectos/icono-${a.id}.png`, alt: '', loading: 'lazy' })),
            el('span', {},
                el('span', { class: 'pp-area-nombre', text: a.nombre }),
                el('span', { class: 'pp-area-frase', text: a.frase }),
                el('span', { class: 'pp-area-n', text: n === 1 ? '1 idea' : `${n} ideas` })));
        b.addEventListener('click', () => {
            estado.area = estado.area === a.id ? null : a.id;
            pintarAreas(); pintarIdeas();
            if (estado.area) $('#ideas').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return b;
    }));
}

function pintarIntenciones() {
    $('#ppIntenciones').replaceChildren(...INTENCIONES.map((it) => {
        const b = el('button', { type: 'button', class: 'pp-pastilla', style: `--c:${it.c}; --n:${it.n || it.c}`, 'aria-pressed': String(estado.intencion === it.id), text: it.nombre });
        b.addEventListener('click', () => { estado.intencion = estado.intencion === it.id ? null : it.id; pintarIntenciones(); pintarIdeas(); });
        return b;
    }));
}

function metaDatos(i) {
    const f = FUENTES[i.datos];
    return f ? el('p', { class: 'pp-meta' }, el('b', { text: 'Datos: ' }), f.corto) : null;
}

function tarjeta(i, extra = {}) {
    const a = areaDe(i.area) || { nombre: '', c: '#2F63D6', f: '#E4EEFF' };
    const guardada = estado.guardadas.has(i.id);
    const btnG = el('button', { type: 'button', class: 'pp-guardar', 'aria-pressed': String(guardada), 'aria-label': guardada ? 'Quitar de mis ideas guardadas' : 'Guardar esta idea', title: guardada ? 'Quitar de guardadas' : 'Guardar idea' }, iconoMarcador(18));
    btnG.addEventListener('click', (e) => { e.stopPropagation(); alternarGuardada(i.id); });
    const btnVer = el('button', { type: 'button', class: 'pp-ver', text: 'Ver idea →' });
    const card = el('article', { class: 'pp-idea', style: `--c:${a.c}; --f:${a.f}; --n:${a.n || a.c}` },
        el('div', { class: 'pp-idea-top' }, el('span', { class: 'pp-etq', text: a.corto || a.nombre }), btnG),
        el('div', { class: 'pp-idea-cuerpo' },
            el('h3', { class: 'pp-idea-t', text: i.titulo }),
            el('p', { class: 'pp-idea-d', text: i.resumen }),
            el('div', { class: 'pp-tags' }, i.tipo ? el('span', { class: 'pp-tag', text: i.tipo }) : null, i.tiempo ? el('span', { class: 'pp-tag', text: i.tiempo }) : null),
            metaDatos(i),
            btnVer));
    card.addEventListener('click', () => abrirFicha(i.id));
    return card;
}

function pintarIdeas() {
    const filtrando = hayFiltros() || estado.verTodas;
    const lista = filtrando ? ideasFiltradas() : destacadasDeLaSemana();
    const ar = estado.area ? areaDe(estado.area) : null;
    $('#ppSubIdeas').textContent = !filtrando ? 'Destacadas — Ideas seleccionadas para inspirarte.'
        : ar ? `Ideas en ${ar.nombre}` : hayFiltros() ? 'Ideas que coinciden con tu búsqueda' : `Todas las ideas del catálogo (${IDEAS.length})`;
    $('#ppIdeas').replaceChildren(...lista.map((i) => tarjeta(i)));
    $('#ppVacio').hidden = lista.length > 0;
    $('#ppLimpiar').hidden = !hayFiltros();
    const vt = $('#ppVerTodas');
    vt.textContent = estado.verTodas ? '← Ver destacadas' : 'Ver todas →';
    vt.setAttribute('aria-pressed', String(estado.verTodas));
    vt.hidden = hayFiltros();
}

function pintarGuardadas() {
    const lista = IDEAS.filter((i) => estado.guardadas.has(i.id));
    $('#ppGuardadas').replaceChildren(...lista.map((i) => tarjeta(i)));
    $('#ppVacioGuardadas').hidden = lista.length > 0;
}

function repintarTodo() { pintarIdeas(); pintarGuardadas(); if (resultadosQuiz) pintarResultadosQuiz(); }

/* ───── ficha de una idea ───── */
let ideaAbierta = null;

function bloque(titulo, contenido, extra = '') {
    return el('section', { class: `pp-bloque ${extra}`.trim() }, el('h4', { text: titulo }),
        Array.isArray(contenido) ? el('ul', {}, contenido.map((t) => el('li', { text: t }))) : el('p', { text: contenido }));
}

function bloqueAmpliaciones(lista) {
    return el('section', { class: 'pp-bloque pp-bloque-mas' }, el('h4', { text: 'Para ir más lejos' }),
        el('p', { class: 'pp-mas-aviso', text: 'Opcional. Explora estas posibilidades si te interesa. Puedes elegir alguna, varias o quedarte con el alcance inicial. No tienen un tiempo definido.' }),
        el('div', { class: 'pp-mas-lista' }, lista.map((x) => el('div', { class: 'pp-mas-fila' }, el('b', { text: x.titulo }), el('span', { text: x.aporta })))));
}

function actualizarBotonFicha() {
    const b = $('#ppFichaGuardar');
    if (!b || !ideaAbierta) return;
    b.textContent = estado.guardadas.has(ideaAbierta.id) ? '✓ Guardada · quitar' : 'Guardar esta idea';
}

function abrirFicha(id) {
    const i = IDEAS.find((x) => x.id === id);
    if (!i) return;
    ideaAbierta = i;
    const a = areaDe(i.area) || { nombre: '', c: '#2F63D6', f: '#E4EEFF' };
    const dlg = $('#ppFicha');
    dlg.style.setProperty('--c', a.c); dlg.style.setProperty('--f', a.f); dlg.style.setProperty('--n', a.n || a.c);
    $('#ppFichaArea').textContent = a.nombre;
    const btnG = el('button', { type: 'button', class: 'pp-btn pp-btn-blanco', id: 'ppFichaGuardar' });
    btnG.addEventListener('click', () => alternarGuardada(i.id));
    $('#ppFichaCuerpo').replaceChildren(
        el('h3', { id: 'ppFichaTitulo', text: i.titulo }),
        el('p', { class: 'pp-ficha-res', text: i.resumen }),
        el('div', { class: 'pp-tags' },
            i.tipo ? el('span', { class: 'pp-tag', text: i.tipo }) : null,
            i.tiempo ? el('span', { class: 'pp-tag', text: `Tiempo orientativo: ${i.tiempo}` }) : null,
            (i.etiquetas || []).map((t) => el('span', { class: 'pp-tag-s', text: t }))),
        FUENTES[i.datos] ? el('p', { class: 'pp-meta' }, el('b', { text: 'Datos: ' }), FUENTES[i.datos].largo) : null,
        i.problema ? bloque('El problema', i.problema) : null,
        i.desarrollar ? bloque('Alcance inicial', i.desarrollar) : null,
        i.ampliaciones && i.ampliaciones.length ? bloqueAmpliaciones(i.ampliaciones) : null,
        i.objetivos && i.objetivos.length ? bloque('Objetivos', i.objetivos) : null,
        i.habilidades && i.habilidades.length ? bloque('Conocimientos y habilidades que se practican', i.habilidades) : null,
        i.herramientas && i.herramientas.length ? bloque('Herramientas que podrían servir', i.herramientas) : null,
        i.lineamientos && i.lineamientos.length ? bloque('Lineamientos y cuidados', i.lineamientos) : null,
        i.otroSector ? bloque('Para otra área', i.otroSector, 'pp-bloque-sector') : null,
        i.carreras && i.carreras.length ? el('section', { class: 'pp-bloque' }, el('h4', { text: 'Puede interesar a' }),
            el('div', { class: 'pp-tags' }, i.carreras.map((t) => el('span', { class: 'pp-tag-s', text: t }))),
            el('p', { class: 'pp-aviso', text: 'Son ejemplos, no una lista cerrada: la idea puede hacerla cualquier persona, de cualquier carrera.' })) : null,
        el('div', { class: 'pp-ficha-pie' }, btnG),
        el('p', { class: 'pp-aviso', text: 'Es una idea para inspirarte: puedes adaptarla, hacerla más pequeña o más grande, o usarla en otra área.' }));
    actualizarBotonFicha();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    $('#ppFichaCuerpo').scrollTop = 0;
}

function cerrarFicha() {
    const dlg = $('#ppFicha');
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    ideaAbierta = null;
}

/* ───── cuestionario «Encuentra una idea para empezar» (opcional) ───── */
const Q = { area: undefined, accion: null, tiempo: null };      // area: undefined = sin responder, null = «Todo me interesa»
let resultadosQuiz = null, vistasQuiz = new Set();
const ACCIONES = [
    { id: 'crear', nombre: 'Crear algo' }, { id: 'resolver', nombre: 'Resolver un problema' },
    { id: 'investigar', nombre: 'Investigar un tema' }, { id: 'diferente', nombre: 'Explorar algo diferente' },
];
const TIEMPOS = [
    { id: 'fin', nombre: 'Un fin de semana', horas: 8 }, { id: 'semanas', nombre: 'Entre 1 y 4 semanas', horas: 20 }, { id: 'mes', nombre: 'Más de un mes', horas: 40 },
];
const horasDe = (i) => { const m = /(\d+)/.exec(i.tiempo || ''); return m ? Number(m[1]) : 15; };

// Elige hasta 3 ideas: puntúa por cercanía y reparte por «tipo» para que no sean tres iguales. Nunca devuelve «sin resultados».
export function elegirIdeas(resp, excluir = new Set(), azar = Math.random) {
    const t = TIEMPOS.find((x) => x.id === resp.tiempo);
    const puntos = IDEAS.filter((i) => !excluir.has(i.id)).map((i) => {
        let p = azar() * 0.9;                                                   // desempate: que «Ver otras ideas» no repita siempre lo mismo
        if (resp.area) p += resp.accion === 'diferente' ? (i.area !== resp.area ? 4 : -4) : (i.area === resp.area ? 4 : 0);
        if (resp.accion && resp.accion !== 'diferente' && (i.intencion || []).includes(resp.accion)) p += 3;
        if (t) p += Math.max(0, 3 - Math.abs(horasDe(i) - t.horas) / 8);
        return { i, p };
    }).sort((x, y) => y.p - x.p);
    const sel = [], tipos = new Set();
    for (const { i } of puntos) { if (sel.length < 3 && !tipos.has(i.tipo)) { sel.push(i); tipos.add(i.tipo); } }
    for (const { i } of puntos) { if (sel.length < 3 && !sel.includes(i)) sel.push(i); }          // si faltan tipos distintos, se completa con las más cercanas
    return sel;
}

function opcion(txt, activa, fn, color) {
    const b = el('button', { type: 'button', class: 'pp-opc', 'aria-pressed': String(activa), text: txt, style: color ? `--c:${color.c}; --f:${color.f}; --n:${color.n || color.c}` : null });
    b.addEventListener('click', fn); return b;
}
function pintarQuiz() {
    const cuerpo = $('#ppQuizCuerpo');
    const listo = Q.area !== undefined && Q.accion && Q.tiempo;
    cuerpo.replaceChildren(
        el('fieldset', { class: 'pp-preg' }, el('span', { class: 'pp-preg-n', text: 'Pregunta 1 de 3' }), el('legend', { text: '¿Qué te llama la atención?' }),
            el('div', { class: 'pp-opciones' },
                AREAS.map((a) => opcion(a.corto || a.nombre, Q.area === a.id, () => { Q.area = a.id; pintarQuiz(); }, a)),
                opcion('Todo me interesa', Q.area === null, () => { Q.area = null; pintarQuiz(); }))),
        el('fieldset', { class: 'pp-preg' }, el('span', { class: 'pp-preg-n', text: 'Pregunta 2 de 3' }), el('legend', { text: '¿Qué te gustaría hacer?' }),
            el('div', { class: 'pp-opciones' }, ACCIONES.map((a) => opcion(a.nombre, Q.accion === a.id, () => { Q.accion = a.id; pintarQuiz(); }))),
            el('p', { class: 'pp-nota-preg', text: '«Explorar algo diferente» te muestra ideas de áreas distintas a la que elegiste arriba.' })),
        el('fieldset', { class: 'pp-preg' }, el('span', { class: 'pp-preg-n', text: 'Pregunta 3 de 3' }), el('legend', { text: '¿De cuánto tiempo dispones?' }),
            el('div', { class: 'pp-opciones' }, TIEMPOS.map((t) => opcion(t.nombre, Q.tiempo === t.id, () => { Q.tiempo = t.id; pintarQuiz(); }))),
            el('p', { class: 'pp-nota-preg', text: 'Es solo una referencia: cada persona avanza a su ritmo.' })),
        el('div', { class: 'pp-quiz-acciones' }, (() => {
            const b = el('button', { type: 'button', class: 'pp-btn pp-btn-azulneon', id: 'ppQuizVer', text: 'Ver ideas' });
            b.disabled = !listo; b.style.opacity = listo ? '' : '.5';
            b.addEventListener('click', () => { vistasQuiz = new Set(); mostrarQuiz(); });
            return b;
        })()),
        el('div', { class: 'pp-quiz-res', id: 'ppQuizRes', 'aria-live': 'polite' }));
    resultadosQuiz = null;
}
function mostrarQuiz(otras = false) {
    let sel = elegirIdeas(Q, otras ? vistasQuiz : new Set());
    if (otras && sel.length < 3) { vistasQuiz = new Set(); sel = elegirIdeas(Q, new Set()); }     // se acabaron las nuevas: se vuelve a empezar
    sel.forEach((i) => vistasQuiz.add(i.id));
    resultadosQuiz = sel;
    pintarResultadosQuiz();
    $('#ppQuizRes').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function pintarResultadosQuiz() {
    const cont = $('#ppQuizRes'); if (!cont || !resultadosQuiz) return;
    const otras = el('button', { type: 'button', class: 'pp-btn pp-btn-azulneon', text: 'Ver otras ideas ↻' });
    const reiniciar = el('button', { type: 'button', class: 'pp-btn pp-btn-blanco', text: 'Empezar de nuevo' });
    otras.addEventListener('click', () => mostrarQuiz(true));
    reiniciar.addEventListener('click', () => { Q.area = undefined; Q.accion = null; Q.tiempo = null; vistasQuiz = new Set(); pintarQuiz(); });
    cont.replaceChildren(
        el('h3', { text: 'Ideas que podrían interesarte' }),
        el('p', { class: 'pp-sub-ideas', text: 'Encontramos estas propuestas según tus respuestas. Son de tipos distintos, para que compares.' }),
        el('div', { class: 'pp-ideas' }, resultadosQuiz.map((i) => tarjeta(i))),
        el('div', { class: 'pp-quiz-acciones' }, otras, reiniciar));
}
function conectarQuiz() {
    const b = $('#ppQuizAbrir'), cuerpo = $('#ppQuizCuerpo');
    b.addEventListener('click', () => {
        const abrir = cuerpo.hidden;
        cuerpo.hidden = !abrir; b.setAttribute('aria-expanded', String(abrir));
        b.textContent = abrir ? 'Cerrar el cuestionario' : 'Responder tres preguntas';
        if (abrir && !cuerpo.children.length) pintarQuiz();
    });
}

/* ───── arranque ───── */
function conectar() {
    $('#ppBuscar').addEventListener('input', (e) => { estado.q = e.target.value; pintarIdeas(); });
    document.querySelectorAll('.pp-ej').forEach((b) => b.addEventListener('click', () => {
        estado.q = b.dataset.q; $('#ppBuscar').value = estado.q; pintarIdeas();
        $('#ideas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    $('#ppVerTodas').addEventListener('click', () => { estado.verTodas = !estado.verTodas; pintarIdeas(); });
    $('#ppLimpiar').addEventListener('click', () => {
        estado.area = null; estado.intencion = null; estado.q = ''; $('#ppBuscar').value = '';
        pintarAreas(); pintarIntenciones(); pintarIdeas();
    });
    // Sorpréndeme: cualquier idea de cualquier área (no repite la anterior).
    $('#ppSorprende').addEventListener('click', () => {
        const otras = IDEAS.filter((i) => i.id !== estado.ultimaSorpresa);
        const elegida = otras[Math.floor(Math.random() * otras.length)];
        if (!elegida) return;
        estado.ultimaSorpresa = elegida.id;
        abrirFicha(elegida.id);
    });
    conectarQuiz();
    $('#ppFichaCerrar').addEventListener('click', cerrarFicha);
    $('#ppFicha').addEventListener('click', (e) => { if (e.target === e.currentTarget) cerrarFicha(); });   // clic en el fondo oscuro
    $('#ppFicha').addEventListener('close', () => { ideaAbierta = null; });
}

async function iniciar() {
    if (!(await accesoPermitido())) return;
    estado.guardadas = leerGuardadas();
    pintarAreas(); pintarIntenciones(); repintarTodo(); conectar();
    await conectarNube();            // la cuenta puede tardar: la página ya se ve y luego se actualizan las guardadas
    repintarTodo();
}

iniciar();
