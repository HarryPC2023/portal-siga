// js/proyectos-practicos.js — Portada de «Proyectos Prácticos»: áreas, buscador, ideas, ficha, guardar y Sorpréndeme.
//
// Por ahora la sección es SOLO para el dueño (mismo candado que Desarrollo profesional: js/desarrollo-acceso.js).
// Los textos de las áreas viven en js/proyectos-datos.js. Las ideas viven en Supabase (tabla proyectos_ideas): al abrir la página se descarga solo el índice
// liviano (alimenta tarjetas, filtros y búsqueda) y la ficha completa de un área se descarga cuando alguien abre una idea de esa área.
// Respaldo: si Supabase no responde, se usan los archivos de js/proyectos/ (indice.json y areas/<id>.json), que son una copia de las mismas ideas.
// Las ideas guardadas viven en la cuenta (SigaEstado, módulo «desarrollo», claves «ideaguardada:<id>») para verse igual en PC y celular;
// si no hay sesión, quedan en este navegador (localStorage).
import { accesoPermitido } from './desarrollo-acceso.js?v=1';
import { supabase } from './auth-siga.js?v=9';
import { SigaEstado } from './sync-estado.js?v=1';
import { AREAS, INTENCIONES, FUENTES, DESTACADAS } from './proyectos-datos.js?v=5';

const $ = (s) => document.querySelector(s);
const CLAVE_GUARDADAS = 'siga_pp_guardadas_v1';
const RUTA_IDEAS = 'js/proyectos/';
const PAGINA = 12;                       // tarjetas por página (los botones «Anterior / Siguiente» cambian de página)
const PROGRAMACION = { sin: 'no hace falta', opcional: 'opcional', incluida: 'incluida' };

/* ───── las ideas: índice liviano al abrir, ficha completa al abrir una idea ───── */
let IDEAS = [];                          // el índice: lo que necesitan las tarjetas, los filtros y la búsqueda
let versionIdeas = '0';
let fuenteSupabase = false;              // true si el índice vino de Supabase
const fichasPorArea = new Map();         // área → promesa con { id → ficha completa }; se descarga una sola vez por área
const COLUMNAS_INDICE = 'id,area,areas2,titulo,resumen,tipo,tiempo,horas,etiquetas,intencion,datos,prog,busca,orden';
const LOTE = 1000;                       // Supabase entrega como máximo 1000 filas por consulta: se pide por lotes
async function indiceDesdeSupabase() {
    const filas = [];
    for (let desde = 0; ; desde += LOTE) {
        const { data, error } = await supabase.from('proyectos_ideas').select(COLUMNAS_INDICE)
            .eq('estado', 'publicada').order('area').order('orden').order('id').range(desde, desde + LOTE - 1);
        if (error) throw error;
        filas.push(...data);
        if (data.length < LOTE) break;
    }
    if (!filas.length) throw new Error('indice vacío');
    const pos = (a) => { const n = AREAS.findIndex((x) => x.id === a); return n < 0 ? 99 : n; };
    filas.sort((x, y) => pos(x.area) - pos(y.area) || x.orden - y.orden);          // el orden de las áreas es el de AREAS, no el alfabético
    return filas.map(({ orden, ...i }) => (i.prog === null ? (delete i.prog, i) : i));
}
async function indiceDesdeArchivo() {
    const r = await fetch(`${RUTA_IDEAS}indice.json`, { cache: 'no-cache' });
    if (!r.ok) throw new Error('indice ' + r.status);
    const d = await r.json();
    versionIdeas = d.version || '0';
    return d.ideas || [];
}
async function cargarIndice() {
    try { IDEAS = await indiceDesdeSupabase(); fuenteSupabase = true; }
    catch (e) { console.warn('Proyectos: se usa la copia en archivos (Supabase no respondió)', e); fuenteSupabase = false; IDEAS = await indiceDesdeArchivo(); }
}
async function fichasDesdeSupabase(area) {
    const { data, error } = await supabase.from('proyectos_ideas').select('id,ficha').eq('area', area).eq('estado', 'publicada');
    if (error) throw error;
    return new Map(data.map((x) => [x.id, x.ficha]));
}
async function fichasDesdeArchivo(area) {
    const r = await fetch(`${RUTA_IDEAS}areas/${area}.json?v=${versionIdeas}`);
    if (!r.ok) throw new Error('area ' + r.status);
    const d = await r.json();
    return new Map((d.ideas || []).map((x) => [x.id, x]));
}
function fichasDeArea(area) {
    if (!fichasPorArea.has(area)) {
        const carga = (fuenteSupabase ? fichasDesdeSupabase(area).catch(() => fichasDesdeArchivo(area)) : fichasDesdeArchivo(area))
            .catch((e) => { fichasPorArea.delete(area); throw e; });                // si falló, se puede reintentar al volver a abrirla
        fichasPorArea.set(area, carga);
    }
    return fichasPorArea.get(area);
}
async function fichaCompleta(i) { return (await fichasDeArea(i.area)).get(i.id) || null; }

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
        SigaEstado.alCambiar(MODULO, null, (e) => { if (e.clave && e.clave.startsWith(PREFIJO)) { estado.guardadas = leerGuardadas(); estado.destacadas = destacadasDeLaSemana(new Date(), 4, estado.guardadas); repintarTodo(); } });
    } catch (e) { enNube = false; }
    estado.guardadas = leerGuardadas();
}

const estado = { area: null, intencion: null, q: '', verTodas: false, guardadas: new Set(), ultimaSorpresa: null, destacadas: [], pagina: 1, paginaCruce: 1 };
const reiniciarPagina = () => { estado.pagina = 1; estado.paginaCruce = 1; };

function alternarGuardada(id) {
    guardarUna(id, !estado.guardadas.has(id));
    estado.guardadas = leerGuardadas();
    estado.destacadas = destacadasDeLaSemana(new Date(), 4, estado.guardadas);   // lo guardado sale de «Ideas para explorar» y entra la siguiente
    repintarTodo();
    actualizarBotonFicha();
}

/* ───── filtros ───── */
const hayFiltros = () => !!(estado.area || estado.intencion || estado.q.trim());
function coincideTexto(i, q) {
    const a = areaDe(i.area);
    // Se busca en el tema, el área y sus cruces, la carrera («Puede interesar a»), lo que se practica y lo que se podría usar.
    // (i.busca ya trae carreras, habilidades y herramientas, normalizadas por tools/generar_indice.py.)
    const texto = norm([i.titulo, i.resumen, i.tipo, (i.etiquetas || []).join(' '), a ? a.nombre : '',
        (i.areas2 || []).map((x) => (areaDe(x) || {}).nombre || '').join(' '), i.busca].join(' '));
    const coincide = (p) => texto.includes(p) || (p.length > 4 && texto.includes(p.replace(/(es|s)$/, '')));   // «guías» ≈ «guía»
    return q.split(/\s+/).every(coincide);
}
function pasaFiltros(i, q) {
    if (estado.intencion && !(i.intencion || []).includes(estado.intencion)) return false;
    return !q || coincideTexto(i, q);
}
// Ideas cuyo problema vive en el área elegida (o todas, si no hay área). Cada idea se cuenta una sola vez: en su área principal.
function ideasFiltradas() {
    const q = norm(estado.q.trim());
    return IDEAS.filter((i) => (!estado.area || i.area === estado.area) && pasaFiltros(i, q));
}
// Ideas de OTRAS áreas que usan conocimientos del área elegida («Se cruza con»). Es un bloque aparte: no se mezclan con las del área.
function ideasCruzadas() {
    if (!estado.area) return [];
    const q = norm(estado.q.trim());
    return IDEAS.filter((i) => i.area !== estado.area && (i.areas2 || []).includes(estado.area) && pasaFiltros(i, q));
}

// «Destacadas»: 4 ideas elegidas a mano (DESTACADAS) que van rotando solas: cada semana empieza en un punto distinto de la lista.
// Las que ya guardaste no entran (tienen su propia sección): se reemplazan por las siguientes de la lista. Se recalculan al abrir la
// página y cada vez que guardas o quitas una idea. Si casi todas están guardadas, se completan con ellas.
export function destacadasDeLaSemana(fecha = new Date(), cuantas = 4, guardadas = new Set()) {
    const pool = DESTACADAS.map((id) => IDEAS.find((i) => i.id === id)).filter(Boolean);
    if (pool.length <= cuantas) return pool;
    const semana = Math.floor(fecha.getTime() / (7 * 24 * 3600 * 1000));
    const ini = (semana * cuantas) % pool.length;
    const girada = pool.map((_, k) => pool[(ini + k) % pool.length]);
    const nuevas = girada.filter((i) => !guardadas.has(i.id));
    return [...nuevas, ...girada.filter((i) => guardadas.has(i.id))].slice(0, cuantas);
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
            reiniciarPagina(); pintarAreas(); pintarIdeas();
            if (estado.area) $('#ideas').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return b;
    }));
}

function pintarIntenciones() {
    $('#ppIntenciones').replaceChildren(...INTENCIONES.map((it) => {
        const b = el('button', { type: 'button', class: 'pp-pastilla', style: `--c:${it.c}; --n:${it.n || it.c}`, 'aria-pressed': String(estado.intencion === it.id), text: it.nombre });
        b.addEventListener('click', () => { estado.intencion = estado.intencion === it.id ? null : it.id; reiniciarPagina(); pintarIntenciones(); pintarIdeas(); });
        return b;
    }));
}

function metaDatos(i) {
    const f = FUENTES[i.datos];
    if (!f) return null;
    return el('p', { class: 'pp-meta' }, el('b', { text: 'Datos: ' }), f.corto,
        i.prog ? [' · ', el('b', { text: 'Programación: ' }), PROGRAMACION[i.prog] || i.prog] : null);
}
// «Se cruza con: Sociedad · Educación»: las áreas cuyos conocimientos usa la idea además de la suya.
function lineaCruce(i) {
    const nombres = (i.areas2 || []).map((x) => (areaDe(x) || {}).corto).filter(Boolean);
    return nombres.length ? el('p', { class: 'pp-cruza' }, el('b', { text: 'Se cruza con: ' }), nombres.join(' · ')) : null;
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
            lineaCruce(i),
            metaDatos(i),
            btnVer));
    card.addEventListener('click', () => abrirFicha(i.id));
    return card;
}

// Paginador: «Mostrando 13–24 de 50 · Página 2 de 5» y botones [‹ Anterior] 1 … 4 [5] 6 … 9 [Siguiente ›].
// Cada página reemplaza a la anterior; la persona puede volver con «Anterior» o con el número.
function pintarPaginador(nav, total, pagina, visible, alCambiar) {
    const paginas = Math.ceil(total / PAGINA);
    nav.hidden = !(visible && paginas > 1);
    if (nav.hidden) { nav.replaceChildren(); return; }
    const desde = (pagina - 1) * PAGINA + 1;
    const hasta = Math.min(total, pagina * PAGINA);
    const boton = (texto, p, { actual = false, apagado = false, etiqueta = `Página ${p}` } = {}) => {
        const b = el('button', { type: 'button', class: `pp-pag-b${actual ? ' pp-pag-actual' : ''}`, 'aria-label': etiqueta, text: texto });
        if (actual) b.setAttribute('aria-current', 'page');
        if (apagado) b.disabled = true;
        else b.addEventListener('click', () => alCambiar(p));
        return b;
    };
    // Números: siempre la primera y la última, y la actual con una vecina a cada lado; lo demás se resume con «…».
    const numeros = [];
    let previo = 0;
    for (let p = 1; p <= paginas; p += 1) {
        if (p !== 1 && p !== paginas && Math.abs(p - pagina) > 1) continue;
        if (p - previo > 1) numeros.push(el('span', { class: 'pp-pag-puntos', 'aria-hidden': 'true', text: '…' }));
        numeros.push(boton(String(p), p, { actual: p === pagina }));
        previo = p;
    }
    nav.replaceChildren(
        el('p', { class: 'pp-pag-info', text: `Mostrando ${desde === hasta ? desde : `${desde}–${hasta}`} de ${total} · Página ${pagina} de ${paginas}` }),
        el('div', { class: 'pp-pag-botones' },
            boton('‹ Anterior', pagina - 1, { apagado: pagina === 1, etiqueta: 'Página anterior' }),
            ...numeros,
            boton('Siguiente ›', pagina + 1, { apagado: pagina === paginas, etiqueta: 'Página siguiente' })));
}

// Al cambiar de página, la vista vuelve al inicio del bloque (si no, la persona se quedaría mirando el final de la página nueva).
function irAlBloque(selector) {
    const reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodo = $(selector);
    if (nodo) nodo.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
}

function pintarIdeas() {
    const filtrando = hayFiltros() || estado.verTodas;
    const ar = estado.area ? areaDe(estado.area) : null;
    const lista = filtrando ? ideasFiltradas() : estado.destacadas;
    const cruce = filtrando ? ideasCruzadas() : [];
    $('#ppSubIdeas').textContent = !filtrando ? 'Destacadas — Ideas seleccionadas para inspirarte.'
        : ar ? `Ideas en ${ar.nombre} (${lista.length})` : hayFiltros() ? `Ideas que coinciden con tu búsqueda (${lista.length})` : `Todas las ideas del catálogo (${IDEAS.length})`;
    // Se muestran por páginas de PAGINA: cada página REEMPLAZA a la anterior (no se alarga la pantalla). Las destacadas (4) siempre completas.
    estado.pagina = Math.min(estado.pagina, Math.max(1, Math.ceil(lista.length / PAGINA)));
    const visibles = filtrando ? lista.slice((estado.pagina - 1) * PAGINA, estado.pagina * PAGINA) : lista;
    $('#ppIdeas').replaceChildren(...visibles.map((i) => tarjeta(i)));
    $('#ppIdeas').classList.toggle('pp-ideas-4', !filtrando && lista.length === 4);
    pintarPaginador($('#ppPag'), lista.length, estado.pagina, filtrando, (p) => { estado.pagina = p; pintarIdeas(); irAlBloque('#ideas'); });
    // Bloque aparte: ideas de otras áreas que se cruzan con el área elegida.
    const wrap = $('#ppCruceWrap');
    wrap.hidden = !(ar && cruce.length);
    if (ar && cruce.length) {
        $('#ppCruceT').textContent = `Ideas de otras áreas que se cruzan con ${ar.corto || ar.nombre}`;
        estado.paginaCruce = Math.min(estado.paginaCruce, Math.max(1, Math.ceil(cruce.length / PAGINA)));
        $('#ppCruce').replaceChildren(...cruce.slice((estado.paginaCruce - 1) * PAGINA, estado.paginaCruce * PAGINA).map((i) => tarjeta(i)));
        pintarPaginador($('#ppPagCruce'), cruce.length, estado.paginaCruce, true, (p) => { estado.paginaCruce = p; pintarIdeas(); irAlBloque('#ppCruceWrap'); });
    }
    $('#ppVacio').hidden = lista.length > 0 || (ar && cruce.length > 0);
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

// Un bloque de la ficha. `lista` = true: cada elemento es un punto de una lista. Si no, cada elemento es un párrafo
// (o { lista: [...] } para una lista dentro del texto); así «El problema» y «Alcance inicial» pueden tener varios párrafos.
function bloque(titulo, contenido, extra = '', lista = false) {
    const items = [].concat(contenido);
    const hijos = lista
        ? [el('ul', {}, items.map((t) => el('li', { text: t })))]
        : items.map((c) => (typeof c === 'string' ? el('p', { text: c }) : el('ul', {}, c.lista.map((t) => el('li', { text: t })))));
    return el('section', { class: `pp-bloque ${extra}`.trim() }, el('h4', { text: titulo }), hijos);
}
// «Sin programación: se puede hacer…» → la parte antes de los dos puntos va en negrita.
function lineaConTitulo(texto) {
    const k = texto.indexOf(': ');
    return el('p', { class: 'pp-meta' }, k > 0 ? [el('b', { text: texto.slice(0, k + 1) }), ' ' + texto.slice(k + 2)] : texto);
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
    const base = IDEAS.find((x) => x.id === id);
    if (!base) return;
    ideaAbierta = base;
    const a = areaDe(base.area) || { nombre: '', c: '#2F63D6', f: '#E4EEFF' };
    const dlg = $('#ppFicha');
    dlg.style.setProperty('--c', a.c); dlg.style.setProperty('--f', a.f); dlg.style.setProperty('--n', a.n || a.c);
    $('#ppFichaArea').textContent = a.nombre;
    pintarFicha(base, null);                                   // se abre ya con lo que tiene el índice; el detalle llega en un instante
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    $('#ppFichaCuerpo').scrollTop = 0;
    fichaCompleta(base).then((completa) => {
        if (ideaAbierta !== base) return;                      // la persona ya cerró o abrió otra
        pintarFicha(base, completa || false);
    }).catch(() => { if (ideaAbierta === base) pintarFicha(base, false); });
}

// completa: null = cargando · false = no se pudo cargar · objeto = la ficha completa
function pintarFicha(i, completa) {
    const f = completa || i;
    const btnG = el('button', { type: 'button', class: 'pp-btn pp-btn-blanco', id: 'ppFichaGuardar' });
    btnG.addEventListener('click', () => alternarGuardada(i.id));
    const cruces = (i.areas2 || []).map((x) => (areaDe(x) || {}).nombre).filter(Boolean);
    $('#ppFichaCuerpo').replaceChildren(
        el('h3', { id: 'ppFichaTitulo', text: i.titulo }),
        el('p', { class: 'pp-ficha-res', text: i.resumen }),
        el('div', { class: 'pp-tags' },
            i.tipo ? el('span', { class: 'pp-tag', text: i.tipo }) : null,
            i.tiempo ? el('span', { class: 'pp-tag', text: `Tiempo orientativo: ${i.tiempo}` }) : null,
            (i.etiquetas || []).map((t) => el('span', { class: 'pp-tag-s', text: t }))),
        cruces.length ? el('p', { class: 'pp-meta' }, el('b', { text: 'Se cruza con: ' }), cruces.join(' · ')) : null,
        completa === null ? el('p', { class: 'pp-aviso', text: 'Cargando el detalle de la idea…' }) : null,
        completa === false ? el('p', { class: 'pp-aviso', text: 'No pudimos cargar el detalle de esta idea. Revisa tu conexión y vuelve a abrirla.' }) : null,
        completa ? [
            f.datosTexto ? el('p', { class: 'pp-meta' }, el('b', { text: 'Datos: ' }), f.datosTexto) : (FUENTES[f.datos] ? el('p', { class: 'pp-meta' }, el('b', { text: 'Datos: ' }), FUENTES[f.datos].largo) : null),
            f.progTexto ? lineaConTitulo(f.progTexto) : null,
            f.abordar ? el('p', { class: 'pp-meta' }, el('b', { text: 'Cómo abordarlo: ' }), f.abordar) : null,
            f.problema && f.problema.length ? bloque('El problema', f.problema) : null,
            f.desarrollar && f.desarrollar.length ? bloque('Alcance inicial', f.desarrollar) : null,
            f.ampliaciones && f.ampliaciones.length ? bloqueAmpliaciones(f.ampliaciones) : null,
            f.objetivos && f.objetivos.length ? bloque('Objetivos', f.objetivos, '', true) : null,
            f.habilidades && f.habilidades.length ? bloque('Conocimientos y habilidades que se practican', f.habilidades, '', true) : null,
            f.herramientas && f.herramientas.length ? bloque('Herramientas que podrían servir', f.herramientas, '', true) : null,
            f.lineamientos && f.lineamientos.length ? bloque('Lineamientos y cuidados', f.lineamientos, '', true) : null,
            f.otroSector ? bloque('Para otra área', f.otroSector, 'pp-bloque-sector') : null,
            f.carreras && f.carreras.length ? el('section', { class: 'pp-bloque' }, el('h4', { text: 'Puede interesar a' }),
                el('div', { class: 'pp-tags' }, f.carreras.map((t) => el('span', { class: 'pp-tag-s', text: t }))),
                el('p', { class: 'pp-aviso', text: 'Son ejemplos, no una lista cerrada: la idea puede hacerla cualquier persona, de cualquier carrera.' })) : null,
        ] : null,
        el('div', { class: 'pp-ficha-pie' }, btnG),
        el('p', { class: 'pp-aviso', text: 'Es una idea para inspirarte: puedes adaptarla, hacerla más pequeña o más grande, o usarla en otra área.' }));
    actualizarBotonFicha();
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
const horasDe = (i) => (typeof i.horas === 'number' ? i.horas : 15);   // campo oculto «horas» del índice (el texto «tiempo» es solo para mostrar)

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
    $('#ppBuscar').addEventListener('input', (e) => { estado.q = e.target.value; reiniciarPagina(); pintarIdeas(); });
    document.querySelectorAll('.pp-ej').forEach((b) => b.addEventListener('click', () => {
        estado.q = b.dataset.q; $('#ppBuscar').value = estado.q; reiniciarPagina(); pintarIdeas();
        $('#ideas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    $('#ppVerTodas').addEventListener('click', () => { estado.verTodas = !estado.verTodas; reiniciarPagina(); pintarIdeas(); });
    $('#ppLimpiar').addEventListener('click', () => {
        estado.area = null; estado.intencion = null; estado.q = ''; $('#ppBuscar').value = '';
        reiniciarPagina(); pintarAreas(); pintarIntenciones(); pintarIdeas();
    });
    // Sorpréndeme: se elige primero un área al azar y luego una idea de esa área, para que las áreas con muchas ideas no se lleven todo
    // (no repite la anterior).
    $('#ppSorprende').addEventListener('click', () => {
        const conIdeas = AREAS.filter((a) => IDEAS.some((i) => i.area === a.id && i.id !== estado.ultimaSorpresa));
        if (!conIdeas.length) return;
        const area = conIdeas[Math.floor(Math.random() * conIdeas.length)];
        const otras = IDEAS.filter((i) => i.area === area.id && i.id !== estado.ultimaSorpresa);
        const elegida = otras[Math.floor(Math.random() * otras.length)];
        if (!elegida) return;
        estado.ultimaSorpresa = elegida.id;
        abrirFicha(elegida.id);
    });
    conectarProponer();
    conectarQuiz();
    $('#ppFichaCerrar').addEventListener('click', cerrarFicha);
    $('#ppFicha').addEventListener('click', (e) => { if (e.target === e.currentTarget) cerrarFicha(); });   // clic en el fondo oscuro
    $('#ppFicha').addEventListener('close', () => { ideaAbierta = null; });
}

/* ───── proponer una idea: formulario en esta misma pantalla; la propuesta queda «pendiente» en Supabase hasta que se revise (tabla proyectos_ideas) ───── */
const MAX_PENDIENTES = 3;                 // debe coincidir con la política de Supabase (archivo 20261125210000)
const PALABRAS_VACIAS = new Set(['como', 'para', 'cual', 'cuales', 'cuanto', 'cuanta', 'que', 'una', 'uno', 'unos', 'unas', 'con', 'sin', 'por', 'del', 'los', 'las', 'mas', 'sus', 'tus', 'mis', 'esta', 'este', 'esto', 'hay', 'hace', 'puede', 'pueden', 'tiene', 'sobre', 'entre', 'desde', 'donde', 'cuando', 'quien']);
const palabrasDe = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !PALABRAS_VACIAS.has(w)).map((w) => w.replace(/(es|s)$/, '')));
// Ideas ya publicadas cuyo título se parece al que se escribe (solo orienta: no bloquea el envío).
function ideasParecidas(titulo) {
    const mias = palabrasDe(titulo);
    if (mias.size < 2) return [];
    return IDEAS.map((i) => {
        const suyas = palabrasDe(i.titulo);
        let comunes = 0; mias.forEach((w) => { if (suyas.has(w)) comunes += 1; });
        return { i, comunes, puntaje: comunes / Math.min(mias.size, suyas.size || 1) };
    }).filter((x) => x.comunes >= 2 && x.puntaje >= 0.5).sort((a, b) => b.puntaje - a.puntaje).slice(0, 3).map((x) => x.i);
}
function pintarSimilares() {
    const caja = $('#ppPropSimilares');
    const lista = ideasParecidas($('#ppPropTitulo').value);
    caja.hidden = !lista.length;
    if (!lista.length) { caja.replaceChildren(); return; }
    caja.replaceChildren(el('b', { text: 'Ya hay ideas parecidas en el catálogo:' }), el('ul', {}, lista.map((i) => el('li', { text: i.titulo }))),
        el('span', { text: '¿La tuya aporta algo distinto? Puedes enviarla igual.' }));
}
function idPropuesta() {
    const a = new Uint8Array(14); crypto.getRandomValues(a);
    return 'usr-' + Array.from(a, (n) => (n % 36).toString(36)).join('');
}
function mostrarErrorProp(msg, campo) {
    const e = $('#ppPropError'); e.textContent = msg; e.hidden = !msg;
    document.querySelectorAll('.pp-prop .pp-invalido').forEach((x) => x.classList.remove('pp-invalido'));
    if (campo) { const c = campo.closest('.pp-campo'); if (c) c.classList.add('pp-invalido'); campo.focus(); }
}
function abrirProponer() {
    const dlg = $('#ppProp');
    $('#ppPropForm').hidden = false; $('#ppPropListo').hidden = true;
    const area = $('#ppPropArea');
    if (!area.options.length) {
        const alfabeticas = [...AREAS].sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'));      // en el formulario, las áreas van en orden alfabético
        area.append(el('option', { value: '', text: 'Elige un área…' }), ...alfabeticas.map((a) => el('option', { value: a.id, text: a.nombre })));
        $('#ppPropCruces').replaceChildren(...alfabeticas.map((a) => el('label', {}, el('input', { type: 'checkbox', value: a.id }), a.corto || a.nombre)));
    }
    if (estado.area) area.value = estado.area;
    mostrarErrorProp(''); $('#ppPropPerfilAviso').hidden = true;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    $('#ppPropTitulo').focus();
}
async function enviarPropuesta(ev) {
    ev.preventDefault();
    const v = (id) => $(id).value.trim();
    const titulo = v('#ppPropTitulo'), problema = v('#ppPropProblema'), primero = v('#ppPropPrimero'), area = $('#ppPropArea').value;
    // Sin mínimos de redacción: cada persona cuenta su idea como pueda. Solo se exige que no estén vacíos (el título debe tener ≥ 5, igual que la tabla).
    if (titulo.length < 5) return mostrarErrorProp('Escribe el título de tu idea.', $('#ppPropTitulo'));
    if (!area) return mostrarErrorProp('Elige el área principal de la idea.', $('#ppPropArea'));
    if (!problema) return mostrarErrorProp('Cuéntanos con tus palabras qué problema quieres entender o resolver.', $('#ppPropProblema'));
    if (!$('#ppPropAcepta').checked) return mostrarErrorProp('Para enviar la idea hay que aceptar que puede publicarse en el catálogo.', $('#ppPropAcepta'));
    const cruces = [...document.querySelectorAll('#ppPropCruces input:checked')].map((c) => c.value).filter((c) => c !== area);
    if (cruces.length > 2) return mostrarErrorProp('Elige como máximo 2 áreas en «Se cruza con».');
    const boton = $('#ppPropEnviar'); boton.disabled = true; boton.textContent = 'Enviando…';
    mostrarErrorProp('');
    try {
        const { data: ses } = await supabase.auth.getSession();
        const uid = ses && ses.session && ses.session.user && ses.session.user.id;
        if (!uid) throw new Error('sin-sesion');
        const { count, error: eCuenta } = await supabase.from('proyectos_ideas').select('id', { count: 'exact', head: true }).eq('autor_id', uid).eq('estado', 'pendiente');
        if (eCuenta) throw eCuenta;
        if ((count || 0) >= MAX_PENDIENTES) throw new Error('limite');
        const horas = Number($('#ppPropTiempo').value) || 15;
        const tiempo = { 8: 'Hasta 8 h', 15: '9 a 20 h', 30: '21 a 40 h', 60: 'Más de 40 h' }[horas] || 'Por definir';
        const fila = {
            id: idPropuesta(), area, areas2: cruces, titulo, resumen: problema,
            tipo: $('#ppPropTipo').value || 'Por definir', tiempo: $('#ppPropTiempo').value ? tiempo : 'Por definir', horas,
            datos: $('#ppPropDatos').value || 'ficticios', prog: $('#ppPropProg').value || null,
            ficha: { problema: [problema], desarrollar: primero ? [primero] : [] },
            estado: 'pendiente', origen: 'usuario', autor_id: uid, acepta_publicar: true, mostrar_autor: $('#ppPropMostrar').checked,
        };
        const { error } = await supabase.from('proyectos_ideas').insert(fila);
        if (error) throw error;
        $('#ppPropForm').reset(); pintarSimilares(); $('#ppPropContador').textContent = '0 / 600';
        $('#ppPropForm').hidden = true; $('#ppPropListo').hidden = false;
        $('#ppPropPerfilAviso').hidden = true;
        nombreEnPerfil().then((tiene) => { $('#ppPropListoPerfil').hidden = tiene; });
    } catch (e) {
        console.warn('Proyectos: no se pudo enviar la propuesta', e);
        const m = String((e && e.message) || '');
        const detalle = e && e.code ? ` (detalle técnico: ${e.code} · ${m.slice(0, 160)})` : '';
        mostrarErrorProp(m === 'limite' ? `Ya tienes ${MAX_PENDIENTES} propuestas en revisión. Cuando se revise alguna, podrás enviar otra.`
            : m === 'sin-sesion' ? 'Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo.'
            : 'No pudimos enviar tu idea. Inténtalo otra vez en un momento.' + detalle);
    } finally { boton.disabled = false; boton.textContent = 'Enviar para revisión'; }
}
// ¿La persona ya puso su nombre en su perfil? Se consulta solo si quiere aparecer como autora.
let tieneNombrePerfil = null;
async function nombreEnPerfil() {
    if (tieneNombrePerfil !== null) return tieneNombrePerfil;
    try {
        const { data: ses } = await supabase.auth.getSession();
        const uid = ses && ses.session && ses.session.user && ses.session.user.id;
        if (!uid) return false;
        const { data, error } = await supabase.from('perfiles_usuario').select('nombre').eq('user_id', uid).maybeSingle();
        if (error) throw error;
        tieneNombrePerfil = !!(data && data.nombre && data.nombre.trim());
    } catch (e) { console.warn('Proyectos: no se pudo leer el perfil', e); return true; }      // si no se puede comprobar, no se molesta con el aviso
    return tieneNombrePerfil;
}
async function avisarPerfil() {
    const caja = $('#ppPropPerfilAviso');
    caja.hidden = !($('#ppPropMostrar').checked && !(await nombreEnPerfil()));
}
function conectarProponer() {
    $('#ppPropMostrar').addEventListener('change', avisarPerfil);
    document.querySelectorAll('[data-proponer]').forEach((b) => b.addEventListener('click', abrirProponer));
    $('#ppPropTitulo').addEventListener('input', pintarSimilares);
    $('#ppPropProblema').addEventListener('input', (e) => { $('#ppPropContador').textContent = `${e.target.value.length} / 600`; });
    $('#ppPropForm').addEventListener('submit', enviarPropuesta);
    const cerrar = () => { const d = $('#ppProp'); if (d.open) d.close(); };
    ['#ppPropCerrar', '#ppPropCancelar', '#ppPropFin'].forEach((id) => $(id).addEventListener('click', cerrar));
    $('#ppPropOtra').addEventListener('click', abrirProponer);
    $('#ppProp').addEventListener('click', (e) => { if (e.target === e.currentTarget) cerrar(); });
}

async function iniciar() {
    if (!(await accesoPermitido())) return;
    let cargado = true;
    try { await cargarIndice(); } catch (e) { cargado = false; }
    estado.guardadas = leerGuardadas();
    estado.destacadas = destacadasDeLaSemana(new Date(), 4, estado.guardadas);
    pintarAreas(); pintarIntenciones(); repintarTodo(); conectar();
    // Enlace directo a una idea (por ejemplo desde Mi cuenta → Mis propuestas): proyectos-practicos.html?idea=<id>
    const idPedida = new URLSearchParams(window.location.search).get('idea');
    if (idPedida) abrirFicha(idPedida);
    if (!cargado) { $('#ppVacio').textContent = 'No pudimos cargar el catálogo de ideas. Revisa tu conexión y vuelve a intentarlo.'; $('#ppVacio').hidden = false; }
    await conectarNube();            // la cuenta puede tardar: la página ya se ve y luego se actualizan las guardadas
    estado.destacadas = destacadasDeLaSemana(new Date(), 4, estado.guardadas);
    repintarTodo();
}

iniciar();
