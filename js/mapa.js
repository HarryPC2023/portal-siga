// js/mapa.js — Mapa de competencias (vista general).
// Lee dos funciones de la base (mapa_filtros y mapa_competencias), que ya aplican los mínimos de
// muestra: aquí solo se dibuja lo que llega. Nunca llegan ofertas sueltas, solo totales.
// Se abre filtrada en la carrera del alumno (la lee de su perfil), y recuerda los filtros en la dirección (?f=&c=&s=).
import { supabase, obtenerSesion } from './auth-siga.js?v=9';
import { FACULTADES } from '../intranotas/facultades-datos.js';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';

// ───────────── Utilidades ─────────────
function poner(n, props, hijos) {
    for (const [k, v] of Object.entries(props || {})) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') n.setAttribute('class', v);
        else if (k === 'text') n.textContent = v;
        else if (k === 'on') { for (const [ev, fn] of Object.entries(v)) n.addEventListener(ev, fn); }
        else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const h of hijos.flat()) {
        if (h === null || h === undefined || h === false) continue;
        n.append(h.nodeType ? h : document.createTextNode(String(h)));
    }
}
function el(tag, props, ...hijos) { const n = document.createElement(tag); poner(n, props, hijos); return n; }
function svg(tag, props, ...hijos) { const n = document.createElementNS(NS, tag); poner(n, props, hijos); return n; }

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function fmtFecha(iso) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? `${Number(m[3])} ${MESES[Number(m[2]) - 1]} ${m[1]}` : ''; }
function fmtMes(ym) { const m = /^(\d{4})-(\d{2})/.exec(ym || ''); return m ? `${MESES[Number(m[2]) - 1]} ${m[1].slice(2)}` : String(ym); }
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
function slugify(t) { return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function recortar(t, max) { return t.length > max ? t.slice(0, max - 1) + '…' : t; }

// ───────────── Áreas y tipos de puesto: nombre, color e ícono ─────────────
const AREAS = {
    programacion: { nombre: 'Programación y desarrollo', color: '#3C7CF8', ico: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>' },
    electronica_automatizacion: { nombre: 'Electrónica y automatización', color: '#E08A00', ico: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>' },
    sistemas_electricos: { nombre: 'Sistemas eléctricos', color: '#B58900', ico: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>' },
    ia: { nombre: 'Inteligencia artificial', color: '#6600CC', ico: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>' },
    infraestructura_ti: { nombre: 'Infraestructura y TI', color: '#0E7C86', ico: '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>' },
    calidad_seguridad: { nombre: 'Calidad y seguridad', color: '#1E9E6A', ico: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>' },
    datos_analisis: { nombre: 'Datos y análisis', color: '#C13F94', ico: '<path d="M5 20V11M11 20V5M17 20v-6M3 20h18"/>' },
    telecomunicaciones: { nombre: 'Telecomunicaciones', color: '#0891B2', ico: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>' },
    gestion_proyectos: { nombre: 'Gestión de proyectos', color: '#D9534F', ico: '<rect x="4" y="4" width="4.5" height="16" rx="1"/><rect x="10" y="4" width="4.5" height="10" rx="1"/><rect x="16" y="4" width="4" height="13" rx="1"/>' },
    cad_bim: { nombre: 'Diseño CAD y BIM', color: '#64748B', ico: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>' },
    sistemas_empresariales: { nombre: 'Sistemas empresariales', color: '#8B5CF6', ico: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 21v-4h4v4"/>' },
    operaciones_produccion: { nombre: 'Operaciones y producción', color: '#A0522D', ico: '<path d="M3 20V9l5 3V9l5 3V6h4v14z"/><path d="M3 20h18"/>' },
    calculo_simulacion: { nombre: 'Cálculo y simulación', color: '#4F46E5', ico: '<path d="M18 5H7l6 7-6 7h11"/>' },
    idiomas: { nombre: 'Idiomas', color: '#E5484D', ico: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>' },
};
const AREA_DEF = { nombre: 'Otras', color: '#7A7F94', ico: '<circle cx="12" cy="12" r="8"/>' };
const areaDe = (slug) => AREAS[slug] || AREA_DEF;
const TIPO_COLOR = {
    practicas: '#3C7CF8', trainee: '#0891B2', asistente: '#1E9E6A', junior: '#E0A800', intermedio: '#E08A00',
    'senior-especialista': '#C13F94', 'jefatura-supervision': '#6600CC', otro: '#8A8FA3', 'no-indicado': '#C4C8D6',
};

function iconoArea(slug) {
    const a = areaDe(slug);
    const s = svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: a.color, 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
    s.innerHTML = a.ico; // texto fijo de este archivo, no viene de la base
    return el('span', { class: 'mp-icono', style: `background:${a.color}1F` }, s);
}
const barra = (pct, color) => el('div', { class: 'mp-barra', 'aria-hidden': 'true' }, el('i', { style: `width:${Math.max(0, Math.min(100, pct))}%;background:${color}` }));

// ───────────── Estado ─────────────
const est = { filtros: null, fac: '', car: '', sec: '', datos: null, pedido: 0, mia: null, centro: null, verTodas: false, abierta: null };

// ───────────── Filtros ─────────────
function opcion(valor, texto) { return el('option', { value: valor, text: texto }); }

function pintarFiltros() {
    const f = est.filtros, umb = f.umbrales.conteos;
    const sF = $('mpFacultad');
    sF.replaceChildren(opcion('', 'Toda la UNI'), ...f.facultades.map((x) => opcion(x.codigo, x.nombre + (x.n_ofertas < umb ? ' · Pronto' : ''))));
    sF.value = est.fac; sF.disabled = false;
    const sC = $('mpCarrera'), fac = f.facultades.find((x) => x.codigo === est.fac);
    if (!fac) { sC.replaceChildren(opcion('', 'Elige una facultad primero')); sC.disabled = true; }
    else {
        sC.replaceChildren(opcion('', 'Todas las carreras'), ...fac.carreras.map((c) => opcion(c.slug, c.nombre + (c.n_ofertas < umb ? ' · Pronto' : ''))));
        sC.value = est.car; sC.disabled = false;
    }
    const sS = $('mpSector');
    sS.replaceChildren(opcion('', 'Todos los sectores'), ...f.sectores.map((s) => opcion(s.slug, s.nombre)));
    sS.value = est.sec; sS.disabled = false;
    $('mpLimpiar').hidden = !(est.fac || est.car || est.sec);
}

function guardarURL() {
    try {
        const p = new URLSearchParams();
        if (est.fac) p.set('f', est.fac);
        if (est.car) p.set('c', est.car);
        if (est.sec) p.set('s', est.sec);
        const q = p.toString();
        history.replaceState(null, '', location.pathname + (q ? '?' + q : ''));
    } catch (e) { /* no pasa nada si el navegador no deja */ }
}
function leerURL() { const p = new URLSearchParams(location.search); return { f: p.get('f') || '', c: p.get('c') || '', s: p.get('s') || '' }; }

function validar(sel) {
    const f = est.filtros;
    const fac = f.facultades.find((x) => x.codigo === sel.f);
    const car = fac && fac.carreras.find((c) => c.slug === sel.c);
    const sec = f.sectores.find((s) => s.slug === sel.s);
    return { fac: fac ? fac.codigo : '', car: car ? car.slug : '', sec: sec ? sec.slug : '' };
}

async function miCarrera() {
    try {
        const ses = await obtenerSesion();
        if (!ses) return null;
        const { data } = await supabase.from('perfiles_usuario').select('carrera, facultad').eq('user_id', ses.user.id).maybeSingle();
        if (!data || !data.carrera) return null;
        for (const fa of FACULTADES) {
            const c = fa.carreras.find((x) => x.id === data.carrera);
            if (c) {
                const v = validar({ f: fa.sigla, c: slugify(c.nombre), s: '' });
                return v.car ? { fac: v.fac, car: v.car } : null;
            }
        }
    } catch (e) { /* sin perfil: se ve toda la UNI */ }
    return null;
}

function cambiaron() {
    est.centro = null; est.abierta = null; est.verTodas = false;
    pintarFiltros(); guardarURL(); pedir();
}
function limpiar() { est.fac = est.car = est.sec = ''; cambiaron(); }

// ───────────── Datos ─────────────
async function pedir() {
    const mio = ++est.pedido;
    pintarCargando();
    let r;
    try { r = await supabase.rpc('mapa_competencias', { p_facultad: est.fac || null, p_carrera: est.car || null, p_sector: est.sec || null }); }
    catch (e) { r = { error: e }; }
    if (mio !== est.pedido) return; // llegó tarde: ya se pidió otra selección
    if (r.error || !r.data) { pintarError(() => pedir()); return; }
    est.datos = r.data;
    pintarResumen(r.data);
    pintarCuerpo(r.data);
}

// ───────────── Pintar: resumen y estados ─────────────
function pintarResumen(d) {
    const r = $('mpResumen');
    r.replaceChildren();
    const f = d.filtro;
    const que = f.carrera ? f.carrera.nombre : f.facultad ? f.facultad.nombre : 'Toda la UNI';
    r.append(el('span', {}, 'Mostrando ', el('strong', { text: que }), f.sector ? ` · sector ${f.sector.nombre}` : ''));
    if (est.mia && est.car && est.mia.car === est.car) r.append(el('span', { class: 'mp-tuya', text: 'Tu carrera' }));
    r.append(el('span', {}, 'Basado en ', el('strong', { text: plural(d.muestra, 'oferta', 'ofertas') }), ' publicadas'));
    if (d.actualizado && d.muestra > 0) r.append(el('span', { text: 'Actualizado el ' + fmtFecha(d.actualizado) }));
    const niv = { completo: 'Muestra completa', conteos: 'Muestra inicial: solo cantidades', insuficiente: 'Muestra insuficiente' }[d.nivel];
    r.append(el('span', { class: 'mp-nivel ' + d.nivel, text: niv }));
}

function pintarCargando() {
    const c = $('mpCuerpo');
    c.setAttribute('aria-busy', 'true');
    c.replaceChildren(el('div', { class: 'mp-grid' }, el('div', { class: 'mp-card c7 mp-esq' }), el('div', { class: 'mp-card c5 mp-esq' })));
}

function pintarError(reintentar) {
    const c = $('mpCuerpo');
    c.setAttribute('aria-busy', 'false');
    $('mpResumen').replaceChildren();
    c.replaceChildren(el('div', { class: 'mp-estado-card' },
        el('h2', { text: 'No pudimos cargar el Mapa' }),
        el('p', { text: 'Revisa tu conexión e inténtalo otra vez.' }),
        el('button', { type: 'button', class: 'mp-btn', text: 'Reintentar', on: { click: reintentar } })));
}

function tarjetaVacia(d) {
    const umb = d.umbrales.conteos, n = d.muestra, f = d.filtro;
    const que = f.carrera ? f.carrera.nombre : f.facultad ? f.facultad.nombre : 'esta selección';
    const card = el('div', { class: 'mp-estado-card' }, el('h2', { text: 'Estamos reuniendo ofertas' }));
    card.append(el('p', {
        text: n === 0
            ? `Todavía no hay ofertas publicadas para ${que}. Las vamos sumando poco a poco.`
            : `Hay ${plural(n, 'oferta publicada', 'ofertas publicadas')} para ${que}. Con ${umb} mostramos los primeros resultados (cantidades) y con ${d.umbrales.completo} también los porcentajes.`
    }));
    card.append(el('div', { class: 'mp-progreso' }, barra(Math.round(100 * n / umb), 'linear-gradient(90deg,#3C7CF8,#6600CC)'), el('small', { text: `${n} de ${umb} ofertas para empezar` })));
    const botones = el('div', {});
    if (est.sec && (est.fac || est.car)) botones.append(el('button', { type: 'button', class: 'mp-btn', text: 'Quitar el sector', style: 'margin-right:8px', on: { click: () => { est.sec = ''; cambiaron(); } } }));
    if (est.fac || est.car || est.sec) botones.append(el('button', { type: 'button', class: 'mp-btn', text: 'Ver toda la UNI', on: { click: limpiar } }));
    if (botones.childNodes.length) card.append(botones);
    return card;
}

function pintarCuerpo(d) {
    const c = $('mpCuerpo');
    c.setAttribute('aria-busy', 'false');
    c.replaceChildren();
    if (d.nivel === 'insuficiente') { c.append(tarjetaVacia(d)); return; }
    c.append(el('div', { class: 'mp-grid' }, bloqueCompetencias(d), bloqueAreas(d), bloqueCombinaciones(d), bloqueTipos(d), bloqueTendencias(d)));
}

function cabecera(id, titulo, sub) {
    return [el('h2', { id, text: titulo }), el('p', { class: 'mp-sub', text: sub })];
}

// ───────────── Bloque 1 — Competencias más solicitadas ─────────────
function bloqueCompetencias(d) {
    const card = el('section', { class: 'mp-card c7', id: 'mpBloqueComp', 'aria-labelledby': 'mpT1' },
        ...cabecera('mpT1', 'Competencias más solicitadas', d.nivel === 'completo'
            ? 'Porcentaje de las ofertas de esta selección que piden cada competencia. Toca una para ver más.'
            : `Cantidad de ofertas que piden cada competencia. Los porcentajes aparecen desde ${d.umbrales.completo} ofertas. Toca una para ver más.`));
    const lista = d.competencias;
    if (!lista.length) { card.append(el('p', { class: 'mp-vacio-txt', text: `Todavía ninguna competencia aparece en ${d.umbrales.minimo} ofertas o más.` })); return card; }
    const max = Math.max(...lista.map((x) => x.n));
    const visibles = est.verTodas ? lista : lista.slice(0, 10);
    const caja = el('div', { role: 'list' });
    visibles.forEach((x, i) => {
        const a = areaDe(x.area), abierta = est.abierta === x.slug;
        const ancho = x.pct !== null && x.pct !== undefined ? x.pct : Math.round(100 * x.n / max);
        caja.append(el('div', { role: 'listitem' },
            el('button', { type: 'button', class: 'mp-comp', 'aria-expanded': String(abierta), 'data-slug': x.slug, on: { click: () => alternarCompetencia(x.slug) } },
                el('span', { class: 'mp-rango', text: String(i + 1) }),
                el('span', {}, el('span', { class: 'mp-comp-nom' }, x.nombre, el('span', { class: 'mp-comp-area', text: a.nombre })), barra(ancho, a.color)),
                el('span', { class: 'mp-valor' },
                    el('b', { text: x.pct !== null && x.pct !== undefined ? `${x.pct} %` : String(x.n) }),
                    el('small', { text: x.pct !== null && x.pct !== undefined ? plural(x.n, 'oferta', 'ofertas') : (x.n === 1 ? 'oferta' : 'ofertas') }))),
            abierta ? detalleCompetencia(x, d) : null));
    });
    card.append(caja);
    if (lista.length > 10) card.append(el('div', { class: 'mp-mas' }, el('button', { type: 'button', class: 'mp-btn', text: est.verTodas ? 'Ver solo las 10 primeras' : `Ver las ${lista.length}`, on: { click: () => { est.verTodas = !est.verTodas; refrescar('mpBloqueComp', bloqueCompetencias); } } })));
    return card;
}

function vecinas(slug, d) {
    return d.combinaciones.filter((p) => p.a.slug === slug || p.b.slug === slug)
        .map((p) => ({ o: p.a.slug === slug ? p.b : p.a, n: p.n })).sort((x, y) => y.n - x.n);
}

function detalleCompetencia(x, d) {
    const sin = x.n - x.obligatorio - x.deseable, partes = [];
    if (x.obligatorio) partes.push(`${x.obligatorio} como obligatoria`);
    if (x.deseable) partes.push(`${x.deseable} como deseable`);
    if (sin > 0) partes.push(`${sin} sin indicar`);
    const caja = el('div', { class: 'mp-detalle' });
    caja.append(el('p', {}, el('strong', { text: 'Así la piden: ' }), `de las ${plural(x.n, 'oferta', 'ofertas')}, ${partes.join(', ')}.`));
    const con = vecinas(x.slug, d);
    if (con.length) {
        caja.append(el('p', {}, el('strong', { text: 'Suele pedirse junto con: ' }), con.slice(0, 3).map((v) => `${v.o.nombre} (${v.n})`).join(', ') + '.'));
        caja.append(el('button', { type: 'button', class: 'mp-btn', text: 'Ver sus conexiones', on: { click: () => verConexiones(x.slug) } }));
    } else caja.append(el('p', { text: `Todavía no tiene combinaciones que se repitan en ${d.umbrales.minimo} ofertas o más.` }));
    return caja;
}

function alternarCompetencia(slug) {
    est.abierta = est.abierta === slug ? null : slug;
    refrescar('mpBloqueComp', bloqueCompetencias);
    const b = document.querySelector(`#mpBloqueComp [data-slug="${slug}"]`);
    if (b) b.focus();
}

function verConexiones(slug) {
    est.centro = slug;
    refrescar('mpBloqueCombos', bloqueCombinaciones);
    const n = $('mpBloqueCombos');
    if (n && n.scrollIntoView) n.scrollIntoView({ behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}

const esCelular = () => window.innerWidth <= 860;

function refrescar(id, fabrica) {
    const viejo = $(id);
    if (viejo && est.datos) viejo.replaceWith(fabrica(est.datos));
}

// ───────────── Bloque 2 — Distribución por área ─────────────
function bloqueAreas(d) {
    const card = el('section', { class: 'mp-card c5', 'aria-labelledby': 'mpT2' },
        ...cabecera('mpT2', 'Distribución por área', d.nivel === 'completo'
            ? 'Cómo se reparten, por área, todas las competencias que piden las ofertas.'
            : 'Cuántas veces las ofertas piden una competencia de cada área.'));
    if (!d.areas.length) { card.append(el('p', { class: 'mp-vacio-txt', text: 'Todavía no hay áreas con suficientes menciones.' })); return card; }
    const max = Math.max(...d.areas.map((x) => x.menciones));
    for (const x of d.areas) {
        const a = areaDe(x.area), tiene = x.pct !== null && x.pct !== undefined;
        card.append(el('div', { class: 'mp-area' },
            iconoArea(x.area),
            el('div', {}, el('div', { class: 'mp-area-nom', text: a.nombre }), barra(Math.round(100 * x.menciones / max), a.color)),
            el('span', { class: 'mp-valor' }, el('b', { text: tiene ? `${x.pct} %` : String(x.menciones) }), el('small', { text: tiene ? plural(x.menciones, 'mención', 'menciones') : (x.menciones === 1 ? 'mención' : 'menciones') }))));
    }
    return card;
}

// ───────────── Bloque 3 — Distribución por tipo de puesto (circular) ─────────────
function bloqueTipos(d) {
    const card = el('section', { class: 'mp-card c5', 'aria-labelledby': 'mpT3' },
        ...cabecera('mpT3', 'Distribución por tipo de puesto', 'En qué nivel piden a las personas las ofertas de esta selección.'));
    const items = d.tipos_puesto.items, total = items.reduce((s, x) => s + x.n, 0);
    if (!items.length) { card.append(el('p', { class: 'mp-vacio-txt', text: 'Todavía no clasificamos el tipo de puesto de estas ofertas.' })); return card; }
    const R = 80, C = 2 * Math.PI * R;
    const dona = svg('svg', { viewBox: '0 0 200 200', role: 'img', 'aria-label': 'Gráfico circular: ' + items.map((x) => `${x.nombre} ${x.n}`).join(', ') });
    dona.append(svg('circle', { cx: 100, cy: 100, r: R, fill: 'none', stroke: '#EDEAF5', 'stroke-width': 30 }));
    let acc = 0;
    for (const x of items) {
        const largo = (x.n / total) * C, hueco = items.length > 1 ? Math.min(2.5, largo * 0.3) : 0;
        dona.append(svg('circle', { cx: 100, cy: 100, r: R, fill: 'none', stroke: TIPO_COLOR[x.slug] || '#8A8FA3', 'stroke-width': 30, 'stroke-dasharray': `${Math.max(largo - hueco, 0.5)} ${C - Math.max(largo - hueco, 0.5)}`, 'stroke-dashoffset': -acc }));
        acc += largo;
    }
    const ley = el('ul', { class: 'mp-leyenda' }, items.map((x) => el('li', {},
        el('i', { style: `background:${TIPO_COLOR[x.slug] || '#8A8FA3'}` }), el('span', { text: x.nombre }),
        el('b', { text: x.pct !== null && x.pct !== undefined ? `${x.pct} % · ${x.n}` : String(x.n) }))));
    card.append(el('div', { class: 'mp-dona-caja' },
        el('div', { class: 'mp-dona' }, dona, el('div', { class: 'mp-dona-centro' }, el('b', { text: String(total) }), el('small', { text: total === 1 ? 'oferta con tipo' : 'ofertas con tipo' }))), ley));
    const sin = d.tipos_puesto.sin_clasificar;
    if (sin > 0) card.append(el('p', { class: 'mp-nota', text: `${plural(sin, 'oferta sin tipo de puesto clasificado no entra', 'ofertas sin tipo de puesto clasificado no entran')} en este gráfico.` }));
    return card;
}

// ───────────── Bloque 4 — Combinaciones más solicitadas (red + lista) ─────────────
function bloqueCombinaciones(d) {
    const card = el('section', { class: 'mp-card mp-combos', id: 'mpBloqueCombos', 'aria-labelledby': 'mpT4' },
        ...cabecera('mpT4', 'Combinaciones más solicitadas', `Competencias que las empresas piden juntas en una misma oferta. Cada conexión aparece en ${d.umbrales.minimo} ofertas o más.`));
    const pares = d.combinaciones;
    if (!pares.length) { card.append(el('p', { class: 'mp-vacio-txt', text: `Todavía ninguna combinación se repite en ${d.umbrales.minimo} ofertas o más.` })); return card; }
    const grado = {};
    for (const p of pares) { grado[p.a.slug] = (grado[p.a.slug] || 0) + 1; grado[p.b.slug] = (grado[p.b.slug] || 0) + 1; }
    const candidatas = d.competencias.filter((c) => grado[c.slug]);
    const centro = est.centro && grado[est.centro] ? est.centro : candidatas[0].slug;
    const porSlug = Object.fromEntries(d.competencias.map((c) => [c.slug, c]));
    const nombreDe = (s) => (porSlug[s] ? porSlug[s].nombre : s);

    const chips = candidatas.slice(0, 7);
    if (!chips.some((c) => c.slug === centro)) chips.push(porSlug[centro]);
    card.append(el('div', { class: 'mp-chips', role: 'group', 'aria-label': 'Competencia al centro de la red' },
        chips.map((c) => el('button', { type: 'button', class: 'mp-chip' + (c.slug === centro ? ' on' : ''), 'aria-pressed': String(c.slug === centro), text: c.nombre, on: { click: () => { est.centro = c.slug; refrescar('mpBloqueCombos', bloqueCombinaciones); } } }))));

    // La red: la competencia elegida al centro y, alrededor, las que se piden junto con ella
    const vec = vecinas(centro, d).slice(0, esCelular() ? 6 : 7), maxN = Math.max(...vec.map((v) => v.n));
    const chica = esCelular(), W = chica ? 360 : 520, H = chica ? 360 : 300, cx = W / 2, cy = H / 2, RX = chica ? 112 : 205, RY = chica ? 130 : 108;
    const red = svg('svg', { class: 'mp-red', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Red de combinaciones de ${nombreDe(centro)}: ` + vec.map((v) => `${v.o.nombre} en ${v.n} ofertas`).join(', ') });
    const colorC = areaDe(porSlug[centro] && porSlug[centro].area).color;
    const puntos = vec.map((v, i) => {
        // en el celular las competencias se reparten en diagonal, para que ninguna línea quede tapada por la del centro
        const ang = -Math.PI / 2 + (2 * Math.PI * (i + (chica && vec.length > 1 ? 0.5 : 0))) / vec.length + (vec.length === 1 ? Math.PI / 2 : 0);
        return { ...v, x: cx + RX * Math.cos(ang), y: cy + RY * Math.sin(ang) };
    });
    for (const p of puntos) red.append(svg('line', { x1: cx, y1: cy, x2: p.x, y2: p.y, stroke: colorC, 'stroke-opacity': 0.45, 'stroke-width': (1.5 + 6 * p.n / maxN).toFixed(2), 'stroke-linecap': 'round' }));
    for (const p of puntos) {
        const mx = (cx + p.x) / 2, my = (cy + p.y) / 2;
        red.append(svg('circle', { cx: mx, cy: my, r: 10, fill: '#fff', stroke: colorC, 'stroke-width': 1.5 }), svg('text', { x: mx, y: my + 3.6, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#000' }, String(p.n)));
    }
    for (const p of puntos) {
        const a = areaDe(porSlug[p.o.slug] && porSlug[p.o.slug].area), nom = recortar(p.o.nombre, chica ? 13 : 18), w = Math.min(chica ? 104 : 138, nom.length * (chica ? 7.4 : 6.6) + 24);
        red.append(svg('g', {}, svg('title', {}, `${p.o.nombre}: ${plural(p.n, 'oferta', 'ofertas')} junto con ${nombreDe(centro)}`),
            svg('rect', { x: p.x - w / 2, y: p.y - 14, width: w, height: 28, rx: 14, fill: '#fff', stroke: a.color, 'stroke-width': 2 }),
            svg('text', { x: p.x, y: p.y + 4.2, 'text-anchor': 'middle', 'font-size': chica ? 12.5 : 11.5, 'font-weight': 600, fill: '#000' }, nom)));
    }
    const nomC = recortar(nombreDe(centro), chica ? 16 : 22), wC = Math.max(104, nomC.length * 8.4 + 30);
    red.append(svg('g', {}, svg('title', {}, nombreDe(centro)),
        svg('rect', { x: cx - wC / 2, y: cy - 22, width: wC, height: 44, rx: 22, fill: colorC }),
        svg('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }, nomC)));
    const maxP = Math.max(...pares.map((p) => p.n));
    card.append(el('div', { class: 'mp-combos-cuerpo' },
        el('div', {}, red, el('p', { class: 'mp-nota', style: 'margin:0', text: 'El número sobre cada línea es la cantidad de ofertas que piden las dos competencias.' })),
        el('div', {}, el('h3', { style: 'font-size:13.5px;margin:0 0 4px', text: 'Las duplas que más se repiten' }),
            el('ul', { class: 'mp-duplas' }, pares.slice(0, 8).map((p) => el('li', { class: 'mp-dupla' },
                el('b', { text: `${p.a.nombre} + ${p.b.nombre}` }), el('span', { text: plural(p.n, 'oferta', 'ofertas') }),
                barra(Math.round(100 * p.n / maxP), 'linear-gradient(90deg,#3C7CF8,#6600CC)')))))));
    return card;
}

// ───────────── Bloque 5 — Tendencias de demanda ─────────────
function bloqueTendencias(d) {
    const card = el('section', { class: 'mp-card c7', 'aria-labelledby': 'mpT5' });
    const t = d.tendencia;
    if (!t) {
        const r = Math.min(d.tendencia_meses_seguidos || 0, d.umbrales.meses);
        card.classList.add('mp-bloqueada');
        card.append(el('h2', { id: 'mpT5', text: 'Tendencias de demanda' }));
        card.append(el('div', { class: 'mp-bloqueo' },
            el('div', { class: 'mp-pasos', 'aria-hidden': 'true' }, Array.from({ length: d.umbrales.meses }, (_, i) => el('i', { class: i < r ? 'on' : '' }))),
            el('p', { class: 'mp-vacio-txt', style: 'margin:0;flex:1 1 280px', text: `Se activan cuando hay al menos ${d.umbrales.meses} meses seguidos con ${d.umbrales.completo} ofertas o más cada uno, para no mostrar cambios que sean solo casualidad. Llevamos ${r} de ${d.umbrales.meses}.` })));
        return card;
    }
    card.append(...cabecera('mpT5', 'Tendencias de demanda', 'Cómo cambió mes a mes el porcentaje de ofertas que piden las competencias más solicitadas.'));
    const porSlug = Object.fromEntries(d.competencias.map((c) => [c.slug, c]));
    card.append(el('div', { class: 'mp-minis' }, t.competencias.map((c) => {
        const a = areaDe(porSlug[c.slug] && porSlug[c.slug].area);
        const vals = t.meses.map((m) => (m.pct && m.pct[c.slug] !== undefined ? m.pct[c.slug] : null));
        const ok = vals.filter((v) => v !== null), max = Math.max(...ok, 1);
        const primero = t.meses.find((m, i) => vals[i] !== null), ultimo = [...t.meses].reverse().find((m) => m.pct);
        const dato = ok.length > 1
            ? el('p', { class: 'mp-mini-dato' }, el('b', { text: `${ok[0]} %` }), ` en ${fmtMes(primero.mes)} → `, el('b', { text: `${ok[ok.length - 1]} %` }), ` en ${fmtMes(ultimo.mes)}`)
            : el('p', { class: 'mp-mini-dato', text: ok.length ? `${ok[0]} % en ${fmtMes(primero.mes)}` : 'Sin meses con muestra suficiente' });
        return el('div', { class: 'mp-mini' }, el('h3', { text: c.nombre }), dato,
            el('div', { class: 'mp-mini-barras', role: 'img', 'aria-label': `${c.nombre}: ` + t.meses.map((m, i) => `${fmtMes(m.mes)} ${vals[i] === null ? 'pocas ofertas' : vals[i] + ' %'}`).join(', ') },
                t.meses.map((m, i) => (vals[i] === null
                    ? el('span', { class: 'poco', title: `${fmtMes(m.mes)}: solo ${plural(m.n, 'oferta', 'ofertas')}, muy pocas para dar un porcentaje` })
                    : el('span', { style: `height:${Math.max(4, Math.round(100 * vals[i] / (max * 1.1)))}%;background:${a.color}`, title: `${fmtMes(m.mes)}: ${vals[i]} % de ${plural(m.n, 'oferta', 'ofertas')}` })))),
            el('div', { class: 'mp-mini-meses', 'aria-hidden': 'true' }, t.meses.map((m) => el('span', { text: MESES[Number(m.mes.slice(5, 7)) - 1] }))));
    })));
    card.append(el('p', { class: 'mp-nota', text: `Cada barra es un mes. La raya gris es un mes con menos de ${d.umbrales.completo} ofertas, que no alcanza para dar un porcentaje. Los cambios pequeños pueden ser casualidad.` }));
    return card;
}

// ───────────── Arranque ─────────────
async function traerFiltros() {
    const { data, error } = await supabase.rpc('mapa_filtros');
    if (error || !data || !Array.isArray(data.facultades)) throw new Error('filtros');
    return data;
}

async function iniciar() {
    pintarCargando();
    try { est.filtros = await traerFiltros(); } catch (e) { pintarError(iniciar); return; }
    est.mia = await miCarrera();
    const url = leerURL();
    const sel = (url.f || url.c || url.s) ? validar(url) : (est.mia ? { fac: est.mia.fac, car: est.mia.car, sec: '' } : { fac: '', car: '', sec: '' });
    est.fac = sel.fac; est.car = sel.car; est.sec = sel.sec;
    pintarFiltros();
    guardarURL();
    await pedir();
}

$('mpFacultad').addEventListener('change', (e) => { est.fac = e.target.value; est.car = ''; cambiaron(); });
$('mpCarrera').addEventListener('change', (e) => { est.car = e.target.value; cambiaron(); });
$('mpSector').addEventListener('change', (e) => { est.sec = e.target.value; cambiaron(); });
$('mpLimpiar').addEventListener('click', limpiar);
let eraCelular = esCelular();
window.addEventListener('resize', () => {
    if (esCelular() !== eraCelular) { eraCelular = esCelular(); refrescar('mpBloqueCombos', bloqueCombinaciones); }
});
iniciar();