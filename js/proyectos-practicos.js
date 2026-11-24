// js/proyectos-practicos.js — Portada de «Proyectos Prácticos»: áreas, buscador, ideas, ficha, guardar y Sorpréndeme.
//
// Por ahora la sección es SOLO para el dueño (mismo candado que Desarrollo profesional: js/desarrollo-acceso.js).
// Los textos y las ideas viven en js/proyectos-datos.js. Las ideas guardadas se quedan en este navegador (localStorage);
// cuando haya tablas en Supabase se cambian solo las funciones leerGuardadas() y escribirGuardadas().
import { accesoPermitido } from './desarrollo-acceso.js?v=1';
import { AREAS, INTENCIONES, IDEAS } from './proyectos-datos.js?v=1';

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
function leerGuardadas() {
    try { const v = JSON.parse(localStorage.getItem(CLAVE_GUARDADAS) || '[]'); return new Set(Array.isArray(v) ? v : []); }
    catch (e) { return new Set(); }
}
function escribirGuardadas(set) {
    try { localStorage.setItem(CLAVE_GUARDADAS, JSON.stringify([...set])); } catch (e) { /* sin almacenamiento: no se guarda */ }
}

const estado = { area: null, intencion: null, q: '', soloGuardadas: false, guardadas: leerGuardadas(), ultimaSorpresa: null };

function alternarGuardada(id) {
    if (estado.guardadas.has(id)) estado.guardadas.delete(id); else estado.guardadas.add(id);
    escribirGuardadas(estado.guardadas);
    pintarIdeas();
    actualizarBotonFicha();
}

/* ───── filtros ───── */
function ideasFiltradas() {
    const q = norm(estado.q.trim());
    return IDEAS.filter((i) => {
        if (estado.area && i.area !== estado.area) return false;
        if (estado.intencion && !(i.intencion || []).includes(estado.intencion)) return false;
        if (estado.soloGuardadas && !estado.guardadas.has(i.id)) return false;
        if (q) {
            const a = areaDe(i.area);
            // Se busca en el tema, la carrera («Puede interesar a»), lo que se practica y lo que se podría desarrollar.
            const texto = norm([i.titulo, i.resumen, i.tipo, (i.etiquetas || []).join(' '), a ? a.nombre : '', (i.carreras || []).join(' '),
                (i.habilidades || []).join(' '), (i.herramientas || []).join(' '), i.problema, i.desarrollar, i.otroSector].join(' '));
            const coincide = (p) => texto.includes(p) || (p.length > 4 && texto.includes(p.replace(/(es|s)$/, '')));   // «guías» ≈ «guía»
            if (!q.split(/\s+/).every(coincide)) return false;
        }
        return true;
    });
}
const hayFiltros = () => !!(estado.area || estado.intencion || estado.q.trim() || estado.soloGuardadas);

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

function tarjeta(i) {
    const a = areaDe(i.area) || { nombre: '', c: '#2F63D6', f: '#E4EEFF' };
    const guardada = estado.guardadas.has(i.id);
    const btnG = el('button', { type: 'button', class: 'pp-guardar', 'aria-pressed': String(guardada), 'aria-label': guardada ? 'Quitar de mis ideas guardadas' : 'Guardar esta idea', title: guardada ? 'Quitar de guardadas' : 'Guardar idea' }, iconoMarcador(18));
    btnG.addEventListener('click', (e) => { e.stopPropagation(); alternarGuardada(i.id); });
    const btnVer = el('button', { type: 'button', class: 'pp-ver', text: 'Ver la idea completa →' });
    const card = el('article', { class: 'pp-idea', style: `--c:${a.c}; --f:${a.f}; --n:${a.n || a.c}` },
        el('div', { class: 'pp-idea-top' }, el('span', { class: 'pp-etq', text: a.nombre }), btnG),
        el('div', { class: 'pp-idea-cuerpo' },
            el('h3', { class: 'pp-idea-t', text: i.titulo }),
            el('p', { class: 'pp-idea-d', text: i.resumen }),
            el('div', { class: 'pp-tags' }, i.tipo ? el('span', { class: 'pp-tag', text: i.tipo }) : null, i.tiempo ? el('span', { class: 'pp-tag', text: i.tiempo }) : null),
            el('div', { class: 'pp-tags' }, (i.etiquetas || []).map((t) => el('span', { class: 'pp-tag-s', text: t }))),
            btnVer));
    card.addEventListener('click', () => abrirFicha(i.id));
    return card;
}

function pintarIdeas() {
    const lista = ideasFiltradas();
    const a = estado.area ? areaDe(estado.area) : null;
    $('#ppTituloIdeas').textContent = estado.soloGuardadas ? 'Mis ideas guardadas' : a ? `Ideas en ${a.nombre}` : hayFiltros() ? 'Ideas que coinciden' : 'Ideas destacadas';
    $('#ppIdeas').replaceChildren(...lista.map(tarjeta));
    $('#ppVacio').hidden = lista.length > 0;
    $('#ppLimpiar').hidden = !hayFiltros();
    $('#ppTxtGuardadas').textContent = `Mis ideas guardadas (${estado.guardadas.size})`;
    $('#ppSoloGuardadas').setAttribute('aria-pressed', String(estado.soloGuardadas));
}

/* ───── ficha de una idea ───── */
let ideaAbierta = null;

function bloque(titulo, contenido, extra = '') {
    return el('section', { class: `pp-bloque ${extra}`.trim() }, el('h4', { text: titulo }),
        Array.isArray(contenido) ? el('ul', {}, contenido.map((t) => el('li', { text: t }))) : el('p', { text: contenido }));
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
            i.tiempo ? el('span', { class: 'pp-tag', text: `Tiempo aproximado: ${i.tiempo}` }) : null,
            (i.etiquetas || []).map((t) => el('span', { class: 'pp-tag-s', text: t }))),
        i.problema ? bloque('El problema', i.problema) : null,
        i.desarrollar ? bloque('Qué se podría desarrollar', i.desarrollar) : null,
        i.objetivos && i.objetivos.length ? bloque('Objetivos', i.objetivos) : null,
        i.habilidades && i.habilidades.length ? bloque('Conocimientos y habilidades que se practican', i.habilidades) : null,
        i.herramientas && i.herramientas.length ? bloque('Herramientas que podrían servir', i.herramientas) : null,
        i.lineamientos && i.lineamientos.length ? bloque('Lineamientos y cuidados', i.lineamientos) : null,
        i.otroSector ? bloque('El mismo concepto en otro sector', i.otroSector, 'pp-bloque-sector') : null,
        i.carreras && i.carreras.length ? el('section', { class: 'pp-bloque' }, el('h4', { text: 'Puede interesar a' }),
            el('div', { class: 'pp-tags' }, i.carreras.map((t) => el('span', { class: 'pp-tag-s', text: t }))),
            el('p', { class: 'pp-aviso', text: 'Son ejemplos, no una lista cerrada: la idea puede hacerla cualquier persona, de cualquier carrera.' })) : null,
        el('div', { class: 'pp-ficha-pie' }, btnG),
        el('p', { class: 'pp-aviso', text: 'Es una idea para inspirarte: puedes adaptarla, hacerla más pequeña o más grande, o usarla en otro sector.' }));
    actualizarBotonFicha();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    $('#ppFichaCuerpo').scrollTop = 0;
}

function cerrarFicha() {
    const dlg = $('#ppFicha');
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    ideaAbierta = null;
}

/* ───── arranque ───── */
function conectar() {
    $('#ppBuscar').addEventListener('input', (e) => { estado.q = e.target.value; pintarIdeas(); });
    document.querySelectorAll('.pp-ej').forEach((b) => b.addEventListener('click', () => {
        estado.q = b.dataset.q; $('#ppBuscar').value = estado.q; pintarIdeas();
        $('#ideas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    $('#ppSoloGuardadas').addEventListener('click', () => { estado.soloGuardadas = !estado.soloGuardadas; pintarIdeas(); });
    $('#ppLimpiar').addEventListener('click', () => {
        estado.area = null; estado.intencion = null; estado.q = ''; estado.soloGuardadas = false;
        $('#ppBuscar').value = '';
        pintarAreas(); pintarIntenciones(); pintarIdeas();
    });
    $('#ppSorprende').addEventListener('click', () => {
        const otras = IDEAS.filter((i) => i.id !== estado.ultimaSorpresa);
        const elegida = otras[Math.floor(Math.random() * otras.length)];
        if (!elegida) return;
        estado.ultimaSorpresa = elegida.id;
        abrirFicha(elegida.id);
    });
    $('#ppFichaCerrar').addEventListener('click', cerrarFicha);
    $('#ppFicha').addEventListener('click', (e) => { if (e.target === e.currentTarget) cerrarFicha(); });   // clic en el fondo oscuro
    $('#ppFicha').addEventListener('close', () => { ideaAbierta = null; });
}

async function iniciar() {
    if (!(await accesoPermitido())) return;
    pintarAreas(); pintarIntenciones(); pintarIdeas(); conectar();
}

iniciar();
