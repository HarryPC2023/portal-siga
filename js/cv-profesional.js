// js/cv-profesional.js — Constructor del CV Profesional (siete pasos, semáforo, vista previa A4 e impresión).
//
// Principios:
//  • Los datos viven en SigaEstado (módulo «desarrollo»), vía js/desarrollo-estado.js. Aquí no hay tablas ni mecanismos propios.
//  • Autoguardado: se guarda mientras escribe. En cada tarjeta se ve «Guardando…» y «✓ Guardado»; los fallos y conflictos se avisan aparte.
//  • NUNCA se reconstruye el formulario cuando llega un cambio de otro dispositivo: solo se actualizan los campos
//    que el alumno no está escribiendo (ni tiene cambios sin guardar). Las listas se concilian elemento por elemento.
//  • El CV es una copia propia: el paso «Formación» copia datos de SIGA pero jamás escribe en el perfil académico.
import { SigaEstado } from './sync-estado.js?v=1';
import { accesoPermitido } from './desarrollo-acceso.js?v=1';
import { supabase } from './auth-siga.js?v=9';
import { crearDesarrollo, CLAVE_DATOS, CLAVE_FORMACION, CLAVE_AJUSTES, CLAVE_PERFIL } from './desarrollo-estado.js?v=2';
import { evaluarCV, analizarEnlaceWeb } from './desarrollo-reglas.js?v=2';
import * as C from './desarrollo-contenido.js?v=5';
import { htmlItemPrevia } from './cv-documento.js?v=3';
import { htmlHoja, DISENOS, COLORES, disenoDe, colorDe, variablesHoja, NOTA_FOTO, NOTA_FOTO_SILUETA, NOTA_FOTO_MONOGRAMA, AVISO_UNA_HOJA, AVISO_FOTO_NO_GUARDADA, AVISO_FOTO_ERROR } from './cv-disenos.js?v=2';
import { ajustarAUnaHoja, PARAMS_BASE } from './cv-ajuste.js?v=1';
import { armarBorrador, armarBorradorExperiencia, armarBorradorLogro, armarBorradorPerfil, verbosConjugados, gruposDesde, aplanarHerramientas, todasLasHerramientas, textoPeriodo, normalizarFecha, detalleIdioma } from './desarrollo-redaccion.js?v=2';
import { leerDatosSiga } from './desarrollo-siga.js?v=1';
import { FACULTADES } from '../intranotas/facultades-datos.js';

// El perfil de SIGA guarda la carrera por su id («sistemas»); aquí se convierte en su nombre completo («Ingeniería de Sistemas»).
// Todas las carreras de la UNI (nombre completo), con su facultad como descripción en la lista.
const CARRERAS = FACULTADES.flatMap((f) => f.carreras.map((c) => ({ nombre: c.nombre, facultad: f.nombre })));
const listaCarreras = { catalogo: CARRERAS.map((c) => c.nombre), descripcion: (n) => (CARRERAS.find((c) => c.nombre === n) || {}).facultad || '' };
const resolverCarrera = (id) => { for (const f of FACULTADES) { const c = f.carreras.find((x) => x.id === id); if (c) return c.nombre; } return ''; };

const D = crearDesarrollo(SigaEstado);

// ───────────── utilidades de DOM ─────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function el(tag, props = {}, ...hijos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
    }
    hijos.flat().forEach((h) => { if (h != null && h !== false) n.append(h.nodeType ? h : document.createTextNode(String(h))); });
    return n;
}

// ───────────── estado de la pantalla ─────────────
let cv = null;                       // copia en memoria de lo guardado (se relee tras cada cambio)
let paso = 0;                        // índice en C.PASOS
let modo = 'constructor';            // 'constructor' | 'previa'
const sucios = new Set();            // «clave|campo» con texto escrito que aún no se manda a guardar
const temporizadores = new Map();    // clave → temporizador del autoguardado
const SECCION_DE_PASO = { datos: 'datos', formacion: 'formacion', proyectos: 'proyectos', habilidades: 'habilidades', certificaciones: 'certificaciones', logros: 'logros', experiencia: 'experiencia', perfil: 'perfil' };
const TIPO_DE_PASO = { proyectos: 'proyecto', certificaciones: 'certificacion', logros: 'logro', experiencia: 'experiencia' };
const COLECCION = { proyecto: 'proyectos', certificacion: 'certificaciones', logro: 'logros', experiencia: 'experiencias', habilidad: 'habilidades' };

// ───────────── autoguardado ─────────────
const esVacio = (o) => Object.entries(o || {}).every(([k, v]) => k === 'orden' || k === 'origen' || k === 'desdeSiga' || v === '' || v === false || v == null || (Array.isArray(v) && !v.length));

function recolectar(clave) {
    const inputs = $$('[data-clave]').filter((i) => i.dataset.clave === clave);
    if (!inputs.length) return null;
    const nuevo = {};
    for (const i of inputs) {
        if (i.type === 'checkbox') { nuevo[i.dataset.campo] = i.checked; continue; }
        nuevo[i.dataset.campo] = i.dataset.campo === 'cursos'
            ? i.value.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 5)
            : i.value;
    }
    return { ...(D.leerClave(clave) || {}), ...nuevo };
}

function limpiarSucios(clave) {
    for (const k of [...sucios]) if (k.startsWith(clave + '|')) sucios.delete(k);
}

// Indicador de la tarjeta («Guardando…» → «✓ Guardado»). Solo existe en las tarjetas de las listas.
function marcarEstado(clave, estado) {
    const n = $(`.dp-tarjeta[data-clave="${clave}"] [data-guardado]`);
    if (!n) return;
    n.dataset.guardado = estado; n.hidden = false;
    n.textContent = C.GUARDADO[estado] || '';
}

function flush(clave) {
    clearTimeout(temporizadores.get(clave)); temporizadores.delete(clave);
    const obj = recolectar(clave);
    limpiarSucios(clave);
    if (!obj) return;
    const actual = D.leerClave(clave);
    if (actual === undefined && esVacio(obj)) return;                       // no guardar filas vacías por solo pasar el cursor
    if (JSON.stringify(actual ?? null) === JSON.stringify(obj)) { if (($(`.dp-tarjeta[data-clave="${clave}"] [data-guardado]`) || {}).dataset?.guardado === 'guardando') marcarEstado(clave, 'guardado'); return; }     // nada nuevo
    D.guardarClave(clave, obj);
    marcarEstado(clave, 'guardado');
    refrescarMemoria();
}

function programar(clave) {
    marcarEstado(clave, 'guardando');
    clearTimeout(temporizadores.get(clave));
    temporizadores.set(clave, setTimeout(() => flush(clave), 400));
}

function flushTodo() { [...temporizadores.keys()].forEach(flush); }

// ───────────── campos de formulario ─────────────
function campo({ clave, nombre, etiqueta, placeholder = '', tipo = 'text', opcional = false, area = false, ayuda = '', extra = {}, validar = null, lista = null }) {
    const id = `f-${clave.replace(/\W/g, '_')}-${nombre}`;
    const valor = (D.leerClave(clave) || {})[nombre];
    // Con `lista`, el campo es un desplegable de opciones que además permite escribir cualquier otro texto.
    const combo = lista ? campoConLista({ aria: etiqueta, catalogo: lista.catalogo, descripcion: lista.descripcion, placeholder, ocupado: () => false,
        enviar: (v) => { combo.entrada.value = String(v || '').trim(); sucios.add(`${clave}|${nombre}`); flush(clave); } }) : null;
    const input = combo ? combo.entrada : area ? el('textarea', { id, rows: 3, placeholder }) : el('input', { id, type: tipo, placeholder, autocomplete: 'off', ...extra });
    if (combo) input.id = id;
    input.value = Array.isArray(valor) ? valor.join(', ') : (valor ?? '');
    input.dataset.clave = clave;
    input.dataset.campo = nombre;
    input.addEventListener('input', () => { sucios.add(`${clave}|${nombre}`); programar(clave); });
    input.addEventListener('blur', () => flush(clave));
    // Validación opcional: solo AVISA junto al campo; nunca impide escribir ni guardar.
    const aviso = validar ? el('small', { role: 'status', hidden: true }) : null;
    const revisar = () => {
        if (!validar) return;
        const r = validar(input.value);
        aviso.hidden = !r;
        if (r) { aviso.textContent = r.mensaje; aviso.className = r.nivel === 'aviso' ? 'dp-ayuda' : 'dp-error'; }
    };
    if (validar) { input.addEventListener('input', revisar); revisar(); }
    return el('div', { class: 'dp-campo' },
        el('label', { for: id }, etiqueta, opcional ? el('span', { class: 'dp-opc', text: ' (opcional)' }) : null),
        combo ? combo.caja : input,
        aviso,
        ayuda ? el('small', { class: 'dp-ayuda', text: ayuda }) : null);
}

function valorDe(clave, nombre) {
    const v = (D.leerClave(clave) || {})[nombre];
    return Array.isArray(v) ? v.join(', ') : (v ?? '');
}

// Actualiza SOLO los campos que el alumno no está escribiendo ni tiene pendientes.
function sincronizarCampos(raiz) {
    for (const input of $$('[data-clave]', raiz)) {
        if (input.type === 'checkbox') { input.checked = !!(D.leerClave(input.dataset.clave) || {})[input.dataset.campo]; continue; }
        if (document.activeElement === input || sucios.has(`${input.dataset.clave}|${input.dataset.campo}`)) continue;
        const v = valorDe(input.dataset.clave, input.dataset.campo);
        if (input.value !== v) input.value = v;
    }
    // Lo que no es un campo de texto (opciones, periodo, herramientas) se repinta desde lo guardado.
    for (const n of $$('[data-pinta]', raiz)) if (n._pintar) n._pintar();
}

// ───────────── modal propio (no el confirm del navegador) ─────────────
function confirmarModal({ titulo, texto, ok = 'Aceptar', cancelar = 'Cancelar' }) {
    return new Promise((resolver) => {
        const previo = document.activeElement;
        const cerrar = (r) => { fondo.remove(); document.removeEventListener('keydown', tecla); if (previo && previo.focus) previo.focus(); resolver(r); };
        const tecla = (e) => { if (e.key === 'Escape') cerrar(false); };
        const bCancel = el('button', { type: 'button', class: 'dp-btn', text: cancelar, onclick: () => cerrar(false) });
        const bOk = el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: ok, onclick: () => cerrar(true) });
        const fondo = el('div', { class: 'dp-modal-fondo', onclick: (e) => { if (e.target === fondo) cerrar(false); } },
            el('div', { class: 'dp-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo },
                el('h3', { text: titulo }), el('p', { text: texto }), el('div', { class: 'dp-modal-acciones' }, bCancel, bOk)));
        document.body.append(fondo);
        document.addEventListener('keydown', tecla);
        bCancel.focus();
    });
}

// ───────────── avisos (toasts) ─────────────
function toast({ id, texto, boton, alBoton, persistente = false }) {
    let caja = $('#dpToasts');
    if (!caja) { caja = el('div', { id: 'dpToasts', class: 'dp-toasts', role: 'status', 'aria-live': 'polite' }); document.body.append(caja); }
    if (id) { const viejo = $(`[data-toast="${id}"]`, caja); if (viejo) viejo.remove(); }
    const n = el('div', { class: 'dp-toast', 'data-toast': id || '' }, el('span', { text: texto }));
    const quitar = () => n.remove();
    if (boton) n.append(el('button', { type: 'button', class: 'dp-toast-btn', text: boton, onclick: () => { try { alBoton && alBoton(); } finally { quitar(); } } }));
    n.append(el('button', { type: 'button', class: 'dp-toast-x', 'aria-label': 'Cerrar aviso', text: '×', onclick: quitar }));
    caja.append(n);
    if (!persistente) setTimeout(quitar, 14000);
}
const quitarToast = (id) => { const n = $(`[data-toast="${id}"]`); if (n) n.remove(); };

// ───────────── tarjetas de las colecciones (proyectos, logros, experiencia) ─────────────
// ───────────── proyecto: categoría, equipo, periodo, descripción guiada y herramientas ─────────────
const leerItem = (clave) => D.leerClave(clave) || {};

function pintarSel(caja) {
    const v = leerItem(caja.dataset.claveSel)[caja.dataset.sel] || '';
    $$('[data-valor]', caja).forEach((b) => { const on = b.dataset.valor === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    const hint = caja.parentElement ? $('[data-hint]', caja.parentElement) : null;
    if (hint) { const c = C.CATEGORIAS_PROYECTO.find((x) => x.id === v); hint.textContent = c ? c.texto : hint.dataset.vacio; }
}

function pintarPeriodo(det) {
    const chk = $('[data-campo="sigue"]', det), desde = $('[data-campo="desde"]', det), hasta = $('[data-campo="hasta"]', det);
    hasta.disabled = chk.checked;
    $('[data-resumen]', det).textContent = textoPeriodo({ desde: desde.value, hasta: hasta.value, sigue: chk.checked });
}

// Periodo opcional (Desde / Hasta / casilla «sigue»), común a Proyectos y Experiencia. La casilla desactiva «Hasta».
function crearPeriodo({ clave, base, textoSigue, alCambiar }) {
    const chk = el('input', { type: 'checkbox', id: `${base}-sigue` });
    chk.dataset.clave = clave; chk.dataset.campo = 'sigue';
    chk.checked = !!leerItem(clave).sigue;
    const desde = campo({ clave, nombre: 'desde', etiqueta: 'Desde', placeholder: 'Ej.: 2024 o marzo de 2024' });
    const hasta = campo({ clave, nombre: 'hasta', etiqueta: 'Hasta', placeholder: 'Ej.: 2025 o noviembre de 2025' });
    const resumen = el('span', { class: 'dpc-resumen', 'data-resumen': '' });
    const it0 = leerItem(clave);
    const det = el('details', { class: 'dpc-det dpc-periodo', 'data-pinta': '', open: (it0.desde || it0.hasta || it0.sigue) ? true : null },
        el('summary', {}, 'Periodo ', el('span', { class: 'dp-opc', text: '(opcional)' }), resumen),
        el('div', { class: 'dpc-fechas' }, desde, hasta),
        el('label', { class: 'dp-casilla', for: chk.id }, chk, ' ' + textoSigue),
        el('small', { class: 'dp-ayuda', text: `${C.PERIODO.ayuda} ${C.PERIODO.sinFechas}` }));
    // Al salir de «Desde» o «Hasta» se ordena la fecha («03/2024» → «marzo de 2024»). Lo que no se reconoce queda como lo escribió.
    // «change» ocurre antes que el blur que guarda, así que se guarda ya corregido.
    for (const input of $$('input[data-campo="desde"], input[data-campo="hasta"]', det)) {
        input.addEventListener('change', () => {
            const arreglado = normalizarFecha(input.value);
            if (arreglado !== input.value.trim() || input.value !== arreglado) { input.value = arreglado; pintarPeriodo(det); alCambiar(); }
        });
    }
    det._pintar = () => { pintarPeriodo(det); alCambiar(); };
    chk.addEventListener('change', () => {
        if (chk.checked) $('input[data-campo="hasta"]', det).value = '';
        flush(clave); pintarPeriodo(det); alCambiar();
    });
    det.addEventListener('input', () => pintarPeriodo(det));
    pintarPeriodo(det);
    return { det, chk };
}

// ───────────── oferta de ayuda para redactar ─────────────
// Oferta de ayuda: botón con ✍️ (borde naranja) y, cuando el campo ya tiene texto, enlace pequeño «Rehacer con ayuda».
function ofertaAyuda(textoBoton, alAbrir) {
    const O = C.OFERTA_AYUDA;
    const boton = el('button', { type: 'button', class: 'dpc-camino', 'aria-expanded': 'false', onclick: alAbrir },
        el('span', { class: 'dpc-ico', 'aria-hidden': 'true', text: O.icono }),
        el('span', { class: 'dpc-camino-txt' }, el('strong', { text: textoBoton }), el('span', { text: O.sub })));
    const enlace = el('button', { type: 'button', class: 'dp-btn-texto dpc-rehacer', text: O.rehacer, hidden: true, onclick: alAbrir });
    return { boton, enlace };
}
// Respuestas del asistente: caja que crece sola mientras se escribe (sin cortar el texto) y sin saltos de línea.
function entradaCrece(attrs = {}) {
    const ta = el('textarea', { rows: 1, class: 'dpc-crece', ...attrs });
    const ajustar = () => { ta.style.height = 'auto'; if (ta.scrollHeight) ta.style.height = (ta.scrollHeight + 2) + 'px'; };
    ta.addEventListener('input', () => { if (/\n/.test(ta.value)) ta.value = ta.value.replace(/\s*\n+\s*/g, ' '); ajustar(); });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
    ta._ajustar = ajustar;
    return ta;
}
// ───────────── campo «escribe o elige» ─────────────
// Un campo de texto con lista desplegable de ideas (catálogo único, igual para todas las carreras) y, debajo, 6 ideas que se renuevan al elegir.
// Escribir libre sigue siendo lo principal: Enter agrega lo que se escribió, esté o no en la lista. Las ideas ya agregadas no se vuelven a ofrecer.
let contadorLista = 0;
const sinTildes = (v) => String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function campoConLista({ aria, catalogo, ocupado, enviar, alIdea, descripcion, bloqueado, placeholder }) {
    const I = C.IDEAS, id = `lista-ideas-${++contadorLista}`;
    const entrada = el('input', { type: 'text', autocomplete: 'off', placeholder: placeholder || I.placeholder, 'aria-label': aria, role: 'combobox', 'aria-expanded': 'false', 'aria-controls': id, 'aria-autocomplete': 'list' });
    const lista = el('div', { id, role: 'listbox', class: 'dpc-lista-ideas', hidden: true, 'aria-label': aria });
    const flecha = el('button', { type: 'button', class: 'dpc-flecha-lista', 'aria-label': I.verTodas, tabindex: '-1', text: '▾' });
    const ideas = el('div', { class: 'dp-chips dpc-sugerencias' });
    let visibles = [], activa = -1;
    const libres = () => catalogo.filter((x) => !ocupado(x));
    const descr = (x) => (descripcion ? descripcion(x) : '') || '';
    const marcar = (i) => {
        activa = i;
        const ops = $$('[role="option"]', lista);
        ops.forEach((o, k) => { o.classList.toggle('activa', k === i); o.setAttribute('aria-selected', String(k === i)); });
        if (i >= 0 && ops[i]) { entrada.setAttribute('aria-activedescendant', ops[i].id); if (ops[i].scrollIntoView) ops[i].scrollIntoView({ block: 'nearest' }); }
        else entrada.removeAttribute('aria-activedescendant');
    };
    function cerrar() { lista.hidden = true; entrada.setAttribute('aria-expanded', 'false'); entrada.removeAttribute('aria-activedescendant'); activa = -1; }
    function elegir(x) { cerrar(); enviar(x); }
    function abrir() {
        const q0 = sinTildes(entrada.value.trim());
        const q = catalogo.some((x) => sinTildes(x) === q0) ? '' : q0;     // si ya eligió una de la lista, al abrir se ve la lista completa para cambiarla
        if (bloqueado && bloqueado()) { cerrar(); return; }
        visibles = libres().filter((x) => !q || sinTildes(x).includes(q) || sinTildes(descr(x)).includes(q)).sort((a, b) => a.localeCompare(b, 'es'));
        if (!visibles.length) { cerrar(); return; }
        lista.replaceChildren(...visibles.map((x, i) => el('div', { id: `${id}-${i}`, role: 'option', class: 'dpc-op-idea', 'aria-selected': 'false',
            onmousedown: (e) => { e.preventDefault(); elegir(x); } }, el('span', { text: x }), descr(x) ? el('small', { class: 'dpc-op-desc', text: descr(x) }) : null)));
        lista.hidden = false; entrada.setAttribute('aria-expanded', 'true'); activa = -1; entrada.removeAttribute('aria-activedescendant');
    }
    entrada.addEventListener('click', abrir);
    entrada.addEventListener('input', abrir);
    entrada.addEventListener('blur', () => setTimeout(cerrar, 120));
    entrada.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); if (lista.hidden) abrir(); if (visibles.length) marcar(Math.min(activa + 1, visibles.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (visibles.length) marcar(Math.max(activa - 1, 0)); }
        else if (e.key === 'Escape') cerrar();
        else if (e.key === 'Enter') { e.preventDefault(); if (!lista.hidden && activa >= 0) elegir(visibles[activa]); else { cerrar(); enviar(entrada.value); } }
    });
    flecha.addEventListener('mousedown', (e) => e.preventDefault());
    flecha.addEventListener('click', () => { if (lista.hidden) { entrada.focus(); abrir(); } else cerrar(); });
    const pintarIdeas = () => ideas.replaceChildren(...((bloqueado && bloqueado()) ? [] : libres().slice(0, 6)).map((x) => el('button', { type: 'button', class: 'dp-chip dpc-sug', text: `+ ${x}`, title: descr(x) || null, onclick: () => (alIdea || enviar)(x) })));
    const caja = el('div', { class: 'dpc-combo', 'data-combo': '' }, entrada, flecha, lista);
    caja._refrescar = () => { pintarIdeas(); if (!lista.hidden) abrir(); };
    pintarIdeas();
    return { entrada, caja, ideas, refrescar: caja._refrescar };
}

const ajustarCrecen = (raiz) => $$('textarea.dpc-crece', raiz).forEach((t) => t._ajustar && t._ajustar());
// Aviso «Tu borrador inicial» (informativo, no de error) y, debajo, «Así va quedando», que se queda a la vista mientras se responde (en pantallas grandes).
const bloqueBorrador = (borrador, err, tipo = 'normal') => [
    el('div', { class: 'dpc-aviso-borrador' },
        el('strong', { text: C.OFERTA_AYUDA.borradorTitulo }),
        el('p', { text: tipo === 'perfil' ? C.OFERTA_AYUDA.borradorAvisoPerfil : C.OFERTA_AYUDA.borradorAviso })),
    el('div', { class: 'dpc-borrador-fijo' }, el('span', { class: 'dpc-lab', text: 'Así va quedando' }), borrador, err)];
const conPrefijo = (pre, input) => el('div', { class: 'dpc-prefijo' }, pre, input);

const botonCerrarGuia = (alCerrar) => el('button', { type: 'button', class: 'dp-btn-texto dpc-cerrar-guia', text: C.OFERTA_AYUDA.cerrar, onclick: alCerrar });

// ───────────── ejemplos rotativos (solo vista: nunca se guardan en el CV) ─────────────
// Cada tarjeta nueva toma el PRIMER ejemplo de la lista que no esté en uso (si todos lo están, el menos usado).
// Al borrar una tarjeta su ejemplo queda libre; las demás tarjetas no cambian. Al recargar se reasignan en orden.
const ejemplosAsignados = { proyecto: new Map(), certificacion: new Map(), logro: new Map(), experiencia: new Map() };
const LISTA_DE_TIPO = { proyecto: 'proyectos', certificacion: 'certificaciones', logro: 'logros', experiencia: 'experiencias' };
function indiceEjemplo(tipo, clave, total) {
    const mapa = ejemplosAsignados[tipo];
    const vivas = new Set(((cv && cv[LISTA_DE_TIPO[tipo]]) || []).map((e) => D.claveDe(tipo, e.id)));
    for (const k of [...mapa.keys()]) if (!vivas.has(k) && k !== clave) mapa.delete(k);
    if (mapa.has(clave)) return mapa.get(clave) % total;
    const usos = new Array(total).fill(0);
    for (const i of mapa.values()) usos[i % total] += 1;
    const minimo = Math.min(...usos);
    const idx = usos.indexOf(minimo);
    mapa.set(clave, idx);
    return idx;
}

function camposProyecto(clave) {
    const grupoEj = C.EJEMPLOS_PROYECTO;                     // una sola lista de ejemplos, igual para todas las carreras
    const ej = { ...grupoEj, ...grupoEj.variantes[indiceEjemplo('proyecto', clave, grupoEj.variantes.length)] };
    const base = 'g-' + clave.replace(/\W/g, '_');
    let pintarBorrador = () => '';

    // Guarda lo que NO es un campo de texto sin pisar lo que el alumno está escribiendo.
    const guardarCampo = (cambios) => {
        flush(clave);
        D.guardarClave(clave, { ...leerItem(clave), ...cambios });
        marcarEstado(clave, 'guardado');
        refrescarMemoria();
    };

    // 1. Opciones de una sola respuesta (categoría y modalidad)
    const opciones = (campoNombre, lista, etiqueta, hint) => {
        const caja = el('div', { class: 'dpc-opciones', role: 'group', 'aria-label': etiqueta, 'data-pinta': '', 'data-sel': campoNombre, 'data-clave-sel': clave },
            ...lista.map((o) => el('button', {
                type: 'button', class: 'dpc-op', 'data-valor': o.id, 'aria-pressed': 'false', text: o.nombre,
                onclick: () => { guardarCampo({ [campoNombre]: leerItem(clave)[campoNombre] === o.id ? '' : o.id }); pintarSel(caja); pintarBorrador(); },
            })));
        caja._pintar = () => { pintarSel(caja); pintarBorrador(); };
        const bloque = el('div', { class: 'dp-campo' }, el('span', { class: 'dpc-lab', text: etiqueta }), caja, hint);
        pintarSel(caja);
        return bloque;
    };
    const hintCategoria = el('small', { class: 'dp-ayuda', 'data-hint': '', 'data-vacio': 'Elige donde empezó. Si dudas entre dos, quédate con la primera en la que lo trabajaste.', text: 'Elige donde empezó. Si dudas entre dos, quédate con la primera en la que lo trabajaste.' });
    const bloqueCategoria = opciones('categoria', C.CATEGORIAS_PROYECTO, '¿Dónde nació este proyecto?', hintCategoria);
    const bloqueModalidad = opciones('modalidad', C.MODALIDADES_PROYECTO, '¿Lo hiciste solo o en equipo?', null);
    pintarSel($('.dpc-opciones', bloqueCategoria));

    // 2. Periodo (opcional): una casilla «Sigue en desarrollo» desactiva «Hasta»
    const { det: detPeriodo, chk: chkSigue } = crearPeriodo({ clave, base, textoSigue: 'Sigue en desarrollo', alCambiar: () => pintarBorrador() });

    // 3. Descripción: escribir directo o recibir orientación (sin IA: una plantilla que se puede editar)
    const areaCampo = campo({ clave, nombre: 'queHiciste', etiqueta: 'Describe tu proyecto', area: true, placeholder: ej.desc,
        ayuda: 'Basta con 2 o 3 líneas: qué es, qué hiciste y con qué. El detalle largo va en tu portafolio o LinkedIn.' });
    const area = $('textarea', areaCampo);
    const verbo = el('select', { id: `${base}-v` }, C.VERBOS_TRABAJO.map((v, i) => el('option', { value: String(i), text: v[0] })));
    const gObj = entradaCrece({ id: `${base}-o`, autocomplete: 'off', placeholder: `Ej. ${ej.objeto}` });
    const gHizo = entradaCrece({ id: `${base}-h`, autocomplete: 'off', placeholder: `Ej. ${ej.hice.charAt(0).toUpperCase()}${ej.hice.slice(1)}` });
    const gMeta = entradaCrece({ id: `${base}-m`, autocomplete: 'off', placeholder: `Ej. ${ej.meta}` });
    const gRes = entradaCrece({ id: `${base}-r`, autocomplete: 'off', placeholder: `Ej. ${ej.resultado}` });
    const preObj = el('span', { class: 'dpc-prefijo-txt' }), preMeta = el('span', { class: 'dpc-prefijo-txt', text: 'Con el objetivo de' }), preRes = el('span', { class: 'dpc-prefijo-txt' });
    const borrador = el('div', { class: 'dpc-borrador', 'aria-live': 'polite' });
    const errGuia = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const pregunta = (id, etiqueta, entrada, ayuda, opc) => el('div', { class: 'dpc-pregunta' },
        el('label', { for: id }, etiqueta, opc ? el('span', { class: 'dp-opc', text: ' (opcional)' }) : null), entrada,
        ayuda ? el('small', { class: 'dp-ayuda', text: ayuda }) : null);
    pintarBorrador = () => {
        const it = leerItem(clave);
        const vb = C.VERBOS_TRABAJO[Number(verbo.value)] || C.VERBOS_TRABAJO[0];
        const abre = chkSigue.checked ? vb[1] : vb[2];
        preObj.textContent = it.modalidad === 'equipo' ? 'En equipo, ' + abre.charAt(0).toLowerCase() + abre.slice(1) : abre;
        preRes.textContent = chkSigue.checked ? 'Hasta ahora,' : 'Como resultado,';
        const t = armarBorrador({ verbo: Number(verbo.value), objeto: gObj.value, hizo: gHizo.value, meta: gMeta.value, resultado: gRes.value,
            equipo: it.modalidad === 'equipo', sigue: chkSigue.checked, herramientas: todasLasHerramientas(gruposDesde(it)) });
        borrador.textContent = t || 'Completa «en qué consistió» y «qué hiciste tú» y verás tu borrador aquí.';
        borrador.classList.toggle('vacio', !t);
        return t;
    };
    const guia = el('div', { class: 'dpc-guia', hidden: true },
        pregunta(`${base}-v`, '¿Qué tipo de trabajo realizaste?', verbo, 'Elige el verbo que mejor describe tu participación. Abrirá la frase del borrador: en tu respuesta, continúa sin repetirlo.'),
        pregunta(`${base}-o`, '¿En qué consistió tu proyecto?', conPrefijo(preObj, gObj), 'Cuéntanos qué desarrollaste, investigaste o analizaste: una aplicación, un estudio, un trabajo académico, una iniciativa propia… Solo qué fue; tus tareas van en la siguiente pregunta.'),
        pregunta(`${base}-h`, '¿Qué hiciste tú para llevarlo a cabo?', gHizo, 'Describe tus tareas, decisiones y aportes concretos. Si fue grupal, céntrate en tu participación. Escríbelo en primera persona: «Diseñé…, programé…».'),
        pregunta(`${base}-m`, '¿Qué necesidad o problema buscaba atender?', conPrefijo(preMeta, gMeta), 'Para qué servía o qué querías conseguir; empieza con un verbo en infinitivo: solucionar, mejorar, investigar… Si ya lo dijiste arriba, déjalo vacío.', true),
        pregunta(`${base}-r`, '¿Qué resultado obtuviste?', conPrefijo(preRes, gRes), 'Escríbelo como frase, sin inventar cifras: «la usan compañeros de varios ciclos».', true),
        bloqueBorrador(borrador, errGuia),
        el('div', { class: 'dpc-acciones-guia' },
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: C.OFERTA_AYUDA.revisar, onclick: async () => {
                const t = pintarBorrador();
                if (!t) { errGuia.textContent = 'Falta lo principal: en qué consistió tu proyecto y qué hiciste tú.'; errGuia.hidden = false; return; }
                if (area.value.trim() && !(await confirmarModal({ titulo: 'Reemplazar tu descripción', texto: 'Ya escribiste una descripción. Si usas el borrador, se reemplazará. Después podrás editarlo como quieras.', ok: 'Usar borrador' }))) return;
                area.value = t; area.dispatchEvent(new Event('input', { bubbles: true })); flush(clave);
                cerrarGuiaP(); area.focus();
            } }),
            el('span', { class: 'dp-ayuda', text: 'Después podrás cambiar lo que quieras: la última palabra es tuya.' })));
    [verbo, gObj, gHizo, gMeta, gRes].forEach((n) => n.addEventListener('input', () => { errGuia.hidden = true; pintarBorrador(); }));
    const { boton: botonGuia, enlace: enlaceP } = ofertaAyuda(C.OFERTA_AYUDA.describir, () => abrirGuiaP());
    const actualizarOfertaP = () => {
        const tiene = area.value.trim().length > 0, abierta = !guia.hidden;
        botonGuia.hidden = tiene || abierta; enlaceP.hidden = !tiene || abierta;
    };
    function abrirGuiaP() { guia.hidden = false; botonGuia.setAttribute('aria-expanded', 'true'); actualizarOfertaP(); pintarBorrador(); ajustarCrecen(guia); gObj.focus(); }
    function cerrarGuiaP() { guia.hidden = true; botonGuia.setAttribute('aria-expanded', 'false'); actualizarOfertaP(); }
    guia.append(botonCerrarGuia(cerrarGuiaP));
    area.addEventListener('input', actualizarOfertaP);
    const bloqueDescripcion = el('div', {}, areaCampo, el('div', { class: 'dpc-caminos' }, botonGuia, enlaceP), guia);
    actualizarOfertaP();

    // 4. Herramientas y recursos, en tres grupos con escritura libre
    const bloqueHerr = el('div', { class: 'dp-campo', 'data-pinta': '' },
        el('span', { class: 'dpc-lab', text: 'Herramientas y recursos utilizados' }),
        el('small', { class: 'dp-ayuda', text: 'No necesitas completar todos los grupos. Puedes escribir lo que quieras: lo sugerido es solo una guía.' }));
    const pintores = [];
    const cambiarHerr = (id, fn) => {
        const g = gruposDesde(leerItem(clave));
        g[id] = fn([...g[id]]);
        guardarCampo({ herr: g, herramientas: aplanarHerramientas(g) });
        pintores.forEach((p) => p()); pintarBorrador();
    };
    for (const grupo of C.GRUPOS_HERRAMIENTAS) {
        const etiquetas = el('div', { class: 'dp-chips' });
        const cuenta = el('span', { class: 'dpc-resumen' });
        const combo = campoConLista({ aria: `Añadir a ${grupo.nombre}`, catalogo: C.CATALOGO[grupo.id],
            ocupado: (x) => gruposDesde(leerItem(clave))[grupo.id].some((a) => a.toLowerCase() === x.toLowerCase()),
            enviar: (v) => anadir(v) });
        const entrada = combo.entrada;
        const error = el('small', { class: 'dp-error', role: 'alert', hidden: true });
        const anadir = (valor) => {
            const v = (valor || '').trim();
            if (!v) { error.textContent = 'Escribe algo antes de añadirlo.'; error.hidden = false; return; }
            if (gruposDesde(leerItem(clave))[grupo.id].some((x) => x.toLowerCase() === v.toLowerCase())) { error.textContent = 'Ya lo añadiste.'; error.hidden = false; return; }
            error.hidden = true; entrada.value = '';
            cambiarHerr(grupo.id, (l) => [...l, v]);
        };
        entrada.addEventListener('input', () => { error.hidden = true; });
        const pintar = () => {
            const actuales = gruposDesde(leerItem(clave))[grupo.id];
            cuenta.textContent = actuales.length ? ` · ${actuales.length}` : '';
            etiquetas.replaceChildren(...actuales.map((x, i) => el('span', { class: 'dp-chip dp-chip-hab' }, x,
                el('button', { type: 'button', class: 'dp-chip-x', 'aria-label': `Quitar ${x}`, text: '×', onclick: () => cambiarHerr(grupo.id, (l) => { l.splice(i, 1); return l; }) }))));
            combo.refrescar();
        };
        pintores.push(pintar);
        bloqueHerr.append(el('details', { class: 'dpc-det', open: (grupo.id === 'sw' || gruposDesde(leerItem(clave))[grupo.id].length) ? true : null },
            el('summary', {}, grupo.nombre, cuenta),
            el('small', { class: 'dp-ayuda', text: grupo.texto }), etiquetas,
            el('div', { class: 'dp-agregar' }, combo.caja, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Añadir', onclick: () => anadir(entrada.value) })), error,
            el('p', { class: 'dpc-sug-tit', text: C.IDEAS.titulo }), combo.ideas));
    }
    bloqueHerr._pintar = () => { pintores.forEach((p) => p()); pintarBorrador(); };
    pintores.forEach((p) => p());

    return [
        campo({ clave, nombre: 'nombre', etiqueta: 'Nombre del proyecto', placeholder: ej.nombre }),
        bloqueCategoria, bloqueModalidad, detPeriodo, bloqueDescripcion, bloqueHerr,
        bloqueEvidencia(clave),
    ];
}

// «Resultado o evidencia»: se pliega igual que los grupos de herramientas; se abre solo si ya tiene texto.
function bloqueEvidencia(clave) {
    const E = C.EVIDENCIA;
    const campoEv = campo({ clave, nombre: 'evidencia', etiqueta: E.resumen, opcional: true, placeholder: E.placeholder, area: true });
    $('label', campoEv).className = 'dp-solo-lector';                 // la etiqueta ya está en el resumen: se deja solo para lectores de pantalla
    const area = $('textarea', campoEv);
    const cuenta = el('span', { class: 'dpc-resumen' });
    const pintar = () => { cuenta.textContent = area.value.trim() ? E.cuenta : ''; };
    area.addEventListener('input', pintar);
    pintar();
    const det = el('details', { class: 'dpc-det dpc-evidencia', 'data-pinta': '', open: area.value.trim() ? true : null },
        el('summary', {}, E.resumen, el('span', { class: 'dp-opc', text: ' (opcional)' }), cuenta),
        el('small', { class: 'dp-ayuda', text: E.texto }), campoEv);
    det._pintar = pintar;
    return det;
}

// Experiencia: puesto, organización (opcional), periodo (opcional) y «¿Qué hiciste?» con ayuda guiada.
// El borrador no se escribe solo: el alumno completa cada frase tras un comienzo fijo (el verbo elegido, «La actividad consistía en»…),
// así la oración siempre concuerda y nunca se añade nada que no haya dicho.
function camposExperiencia(clave) {
    const E = C.EXPERIENCIA, O = C.OFERTA_AYUDA;
    const ej = E.ejemplos[indiceEjemplo('experiencia', clave, E.ejemplos.length)];
    const base = 'x-' + clave.replace(/\W/g, '_');
    let pintarBorrador = () => '';

    const { det: detPeriodo, chk: chkSigue } = crearPeriodo({ clave, base, textoSigue: 'Sigo en esta actividad', alCambiar: () => pintarBorrador() });

    const areaCampo = campo({ clave, nombre: 'queHiciste', etiqueta: '¿Qué hiciste?', area: true, placeholder: 'Ej. ' + ej.hizo,
        ayuda: 'Empieza con un verbo y cuenta tu participación. Con 2 o 3 líneas basta.' });
    const area = $('textarea', areaCampo);

    // Pregunta 1: tipo de trabajo (hasta 3 verbos; solo vista, no se guarda)
    let verbos = [];
    const avisoVerbos = el('small', { class: 'dp-ayuda', text: `Puedes elegir hasta ${C.MAX_VERBOS_EXPERIENCIA}.` });
    const chips = el('div', { class: 'dpc-opciones', role: 'group', 'aria-label': 'Tipo de trabajo' });
    C.VERBOS_EXPERIENCIA.forEach((v, i) => {
        const b = el('button', { type: 'button', class: 'dpc-op', 'aria-pressed': 'false', text: v[0] });
        b.addEventListener('click', () => {
            if (verbos.includes(i)) verbos = verbos.filter((x) => x !== i);
            else if (verbos.length >= C.MAX_VERBOS_EXPERIENCIA) { avisoVerbos.textContent = `Elige hasta ${C.MAX_VERBOS_EXPERIENCIA}: con más, la frase se vuelve una lista.`; return; }
            else verbos = [...verbos, i];
            avisoVerbos.textContent = `Puedes elegir hasta ${C.MAX_VERBOS_EXPERIENCIA}.`;
            $$('.dpc-op', chips).forEach((x, j) => { const on = verbos.includes(j); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
            pintarBorrador();
        });
        chips.append(b);
    });

    // Preguntas 2 a 4: cada respuesta continúa un comienzo fijo, que cambia con el tiempo y los verbos elegidos
    const gCon = entradaCrece({ id: `${base}-c`, autocomplete: 'off', placeholder: 'Ej. ' + ej.contexto });
    const gHizo = entradaCrece({ id: `${base}-h`, autocomplete: 'off' });
    const gRes = entradaCrece({ id: `${base}-r`, autocomplete: 'off', placeholder: 'Ej. ' + ej.resultado });
    const preCon = el('span', { class: 'dpc-prefijo-txt' }), preHizo = el('span', { class: 'dpc-prefijo-txt' }), preRes = el('span', { class: 'dpc-prefijo-txt' });
    const borrador = el('div', { class: 'dpc-borrador', 'aria-live': 'polite' });
    const errGuia = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const pregunta = (id, etiqueta, entrada, ayuda, opc) => el('div', { class: 'dpc-pregunta' },
        el('label', { for: id }, etiqueta, opc ? el('span', { class: 'dp-opc', text: ' (opcional)' }) : null), entrada,
        ayuda ? el('small', { class: 'dp-ayuda', text: ayuda }) : null);
    const datos = () => ({ verbos, contexto: gCon.value, hizo: gHizo.value, resultado: gRes.value, sigue: chkSigue.checked });
    pintarBorrador = () => {
        const d = datos();
        preCon.textContent = d.sigue ? 'La actividad consiste en' : 'La actividad consistía en';
        const vs = verbosConjugados(verbos, d.sigue);
        preHizo.textContent = vs || (d.sigue ? 'Me encargo de' : 'Me encargué de');
        preRes.textContent = d.sigue ? 'Hasta ahora,' : 'Como resultado,';
        const v0 = verbos.length ? C.VERBOS_EXPERIENCIA[verbos[0]][3] : 'ordenar el material y registrar su uso en cada práctica';
        gHizo.placeholder = 'Ej. ' + v0;
        const t = armarBorradorExperiencia(d);
        borrador.textContent = t || 'Responde «en qué consistía» o «qué hiciste» y verás tu borrador aquí.';
        borrador.classList.toggle('vacio', !t);
        return t;
    };
    const guia = el('div', { class: 'dpc-guia', hidden: true },
        pregunta(`${base}-v`, '¿Qué tipo de trabajo hiciste?', el('div', {}, chips, avisoVerbos)),
        pregunta(`${base}-c`, '¿En qué consistía la actividad?', conPrefijo(preCon, gCon),
            'Contexto: qué era y para qué existía. Cuéntalo como si se lo explicaras a alguien que no estuvo ahí.'),
        pregunta(`${base}-h`, '¿Qué hiciste concretamente?', conPrefijo(preHizo, gHizo),
            'Tus acciones: lo que hiciste tú, no el grupo. Completa la frase de modo que encaje con el verbo que elegiste.'),
        pregunta(`${base}-r`, '¿Qué se logró?', conPrefijo(preRes, gRes),
            'Un resultado o aporte, si lo hubo. No hace falta una cifra; si no hubo un resultado claro, déjalo vacío.', true),
        bloqueBorrador(borrador, errGuia),
        el('div', { class: 'dpc-acciones-guia' },
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: C.OFERTA_AYUDA.revisar, onclick: async () => {
                const t = pintarBorrador();
                if (!t) { errGuia.textContent = 'Falta lo principal: en qué consistía la actividad o qué hiciste.'; errGuia.hidden = false; return; }
                if (area.value.trim() && !(await confirmarModal({ titulo: 'Reemplazar tu descripción', texto: 'Ya escribiste una descripción. Si usas el borrador, se reemplazará. Después podrás editarlo como quieras.', ok: 'Usar borrador' }))) return;
                area.value = t; area.dispatchEvent(new Event('input', { bubbles: true })); flush(clave);
                cerrarGuia(); area.focus();
            } }),
            el('span', { class: 'dp-ayuda', text: 'Después podrás cambiar lo que quieras: la última palabra es tuya.' })));
    [gCon, gHizo, gRes].forEach((n) => n.addEventListener('input', () => { errGuia.hidden = true; pintarBorrador(); }));

    // La oferta de ayuda se ve con el campo vacío; con texto queda un enlace pequeño
    const { boton: botonGuia, enlace } = ofertaAyuda(O.describir, () => abrirGuia());
    const actualizarOferta = () => {
        const tiene = area.value.trim().length > 0, abierta = !guia.hidden;
        botonGuia.hidden = tiene || abierta;
        enlace.hidden = !tiene || abierta;
    };
    function abrirGuia() { guia.hidden = false; botonGuia.setAttribute('aria-expanded', 'true'); actualizarOferta(); pintarBorrador(); ajustarCrecen(guia); gCon.focus(); }
    function cerrarGuia() { guia.hidden = true; botonGuia.setAttribute('aria-expanded', 'false'); actualizarOferta(); }
    guia.append(botonCerrarGuia(() => cerrarGuia()));
    area.addEventListener('input', actualizarOferta);
    const bloqueDescripcion = el('div', { 'data-pinta': '' }, areaCampo, el('div', { class: 'dpc-caminos' }, botonGuia, enlace), guia);
    bloqueDescripcion._pintar = actualizarOferta;
    pintarBorrador(); actualizarOferta();

    return [
        campo({ clave, nombre: 'puesto', etiqueta: 'Puesto o actividad', placeholder: 'Ej. ' + ej.puesto }),
        campo({ clave, nombre: 'organizacion', etiqueta: 'Organización o lugar', opcional: true, placeholder: 'Ej. ' + ej.org }),
        detPeriodo, bloqueDescripcion,
    ];
}

// Certificación o formación complementaria: nombre (tal como aparece en la constancia), institución, año, tipo y enlace, estos dos últimos opcionales.
function camposCertificacion(clave) {
    const Cc = C.CERTIFICACIONES;
    const [ejNombre, ejInst] = Cc.ejemplos[indiceEjemplo('certificacion', clave, Cc.ejemplos.length)];
    const caja = el('div', { class: 'dpc-opciones', role: 'group', 'aria-label': 'Tipo (opcional)', 'data-pinta': '', 'data-sel': 'tipo', 'data-clave-sel': clave },
        ...C.TIPOS_CERTIFICACION.map((o) => el('button', {
            type: 'button', class: 'dpc-op', 'data-valor': o.id, 'aria-pressed': 'false', text: o.nombre, title: o.texto,
            onclick: () => {
                flush(clave);
                const actual = leerItem(clave);
                const nuevo = { ...actual }; if (actual.tipo === o.id) delete nuevo.tipo; else nuevo.tipo = o.id;     // sin tipo = no se guarda la clave
                D.guardarClave(clave, nuevo); refrescarMemoria(); pintarSel(caja);
            },
        })));
    caja._pintar = () => pintarSel(caja);
    pintarSel(caja);
    return [
        el('div', { class: 'dpc-fila-cert' },
            campo({ clave, nombre: 'nombre', etiqueta: 'Nombre', placeholder: 'Ej. ' + ejNombre }),
            campo({ clave, nombre: 'anio', etiqueta: 'Año', opcional: true, placeholder: '2025', extra: { inputmode: 'numeric', maxlength: '4' } })),
        campo({ clave, nombre: 'institucion', etiqueta: 'Quién lo dio', placeholder: 'Ej. ' + ejInst }),
        el('div', { class: 'dp-campo' }, el('span', { class: 'dpc-lab' }, 'Tipo', el('span', { class: 'dp-opc', text: ' (opcional)' })), caja,
            el('small', { class: 'dp-ayuda', text: Cc.tipos.cierre })),
        campo({ clave, nombre: 'enlace', etiqueta: 'Enlace de verificación', opcional: true, placeholder: 'https://…', ayuda: Cc.enlaceAyuda, validar: analizarEnlaceWeb, extra: { inputmode: 'url' } }),
        el('p', { class: 'dpc-aviso-priv', text: Cc.enlacePrivacidad }),
    ];
}

// Logro: campo → oferta de ayuda → pistas. El asistente guarda solo lo que se usa del borrador.
function camposLogroTexto(clave) {
    const L = C.LOGROS, A = L.asistente, O = C.OFERTA_AYUDA;
    const base = 'l-' + clave.replace(/\W/g, '_');
    const areaCampo = campo({ clave, nombre: 'texto', etiqueta: 'Describe tu logro', area: true,
        placeholder: 'Ej. ' + L.ejemplos[indiceEjemplo('logro', clave, L.ejemplos.length)] });
    const area = $('textarea', areaCampo);

    let tipo = -1;       // solo vista, no se guarda; sin elegir se usa el primer tipo como base
    const chips = el('div', { class: 'dpc-opciones', role: 'group', 'aria-label': 'Tipo de logro' });
    const verbo = el('select', { id: `${base}-v`, 'aria-label': 'Verbo' });
    const gA = entradaCrece({ id: `${base}-a`, autocomplete: 'off' });
    const gB = entradaCrece({ id: `${base}-b`, autocomplete: 'off' });
    const preB = el('span', { class: 'dpc-prefijo-txt' });
    const borrador = el('div', { class: 'dpc-borrador', 'aria-live': 'polite' });
    const errGuia = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const T = () => A.tipos[tipo >= 0 ? tipo : 0];
    const pregunta = (id, etiqueta, entrada, ayuda, opc) => el('div', { class: 'dpc-pregunta' },
        el('label', { for: id }, etiqueta, opc ? el('span', { class: 'dp-opc', text: ' (opcional)' }) : null), entrada,
        ayuda ? el('small', { class: 'dp-ayuda', text: ayuda }) : null);
    const pintarTipo = () => {
        const t = T();
        verbo.replaceChildren(...t.verbos.map((v) => el('option', { value: v, text: v })));
        gA.placeholder = 'Ej. ' + t.a; gB.placeholder = 'Ej. ' + t.b; preB.textContent = t.conector;
    };
    const pintarBorrador = () => {
        const t = T();
        const x = armarBorradorLogro({ verbo: verbo.value, a: gA.value, conector: t.conector, b: gB.value });
        borrador.textContent = x || 'Completa «qué hiciste o conseguiste» y verás tu borrador aquí.';
        borrador.classList.toggle('vacio', !x);
        return x;
    };
    A.tipos.forEach((t, i) => {
        const b = el('button', { type: 'button', class: 'dpc-op', 'aria-pressed': 'false', text: t.nombre });
        b.addEventListener('click', () => {
            tipo = tipo === i ? -1 : i;
            $$('.dpc-op', chips).forEach((x, j) => { const on = j === tipo; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
            pintarTipo(); pintarBorrador();
        });
        chips.append(b);
    });
    const guia = el('div', { class: 'dpc-guia', hidden: true },
        pregunta(`${base}-t`, A.pregTipo, chips, A.ayudaTipo, true),
        pregunta(`${base}-v`, A.pregHice, el('div', { class: 'dpc-fila-verbo' }, verbo, gA), A.ayudaHice),
        pregunta(`${base}-b`, A.pregAlcance, conPrefijo(preB, gB), A.ayudaAlcance, true),
        bloqueBorrador(borrador, errGuia),
        el('p', { class: 'dp-suave dpc-parcial', text: A.cierre }),
        el('div', { class: 'dpc-acciones-guia' },
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: C.OFERTA_AYUDA.revisar, onclick: async () => {
                const x = pintarBorrador();
                if (!x) { errGuia.textContent = 'Falta lo principal: qué hiciste o conseguiste.'; errGuia.hidden = false; return; }
                if (area.value.trim() && !(await confirmarModal({ titulo: 'Reemplazar tu descripción', texto: 'Ya escribiste una descripción. Si usas el borrador, se reemplazará. Después podrás editarlo como quieras.', ok: 'Usar borrador' }))) return;
                area.value = x; area.dispatchEvent(new Event('input', { bubbles: true })); flush(clave);
                cerrar(); area.focus();
            } }),
            botonCerrarGuia(() => cerrar())));
    [verbo, gA, gB].forEach((n) => n.addEventListener('input', () => { errGuia.hidden = true; pintarBorrador(); }));

    const { boton, enlace } = ofertaAyuda(O.redactar, () => abrir());
    const actualizar = () => {
        const tiene = area.value.trim().length > 0, abierta = !guia.hidden;
        boton.hidden = tiene || abierta; enlace.hidden = !tiene || abierta;
    };
    function abrir() { guia.hidden = false; boton.setAttribute('aria-expanded', 'true'); actualizar(); pintarBorrador(); ajustarCrecen(guia); gA.focus(); }
    function cerrar() { guia.hidden = true; boton.setAttribute('aria-expanded', 'false'); actualizar(); }
    area.addEventListener('input', actualizar);
    pintarTipo(); pintarBorrador(); actualizar();
    const bloque = el('div', { 'data-pinta': '' }, areaCampo, el('div', { class: 'dpc-caminos' }, boton, enlace), guia);
    bloque._pintar = actualizar;
    return [bloque];
}

const CAMPOS_TARJETA = {
    proyecto: (clave) => camposProyecto(clave),
    certificacion: (clave) => camposCertificacion(clave),
    logro: (clave) => [
        ...camposLogroTexto(clave),
        el('div', { class: 'dpc-pistas' }, el('strong', { text: C.LOGROS.pistas.titulo + ':' }),
            el('div', {}, C.LOGROS.pistas.items.map((t) => el('span', { class: 'dpc-pista', text: t })))),
        campo({
            clave, nombre: 'respaldo', etiqueta: C.LOGROS.respaldo.etiqueta, opcional: true, placeholder: C.LOGROS.respaldo.placeholder, ayuda: C.LOGROS.respaldo.pista,
            validar: (v) => (/^\s*[a-z][a-z0-9+.-]*:/i.test(v) ? analizarEnlaceWeb(v) : null),
        }),
        el('p', { class: 'dpc-aviso-priv', text: C.LOGROS.respaldo.privacidad }),
    ],
    experiencia: (clave) => camposExperiencia(clave),
};
const ROTULO = { proyecto: 'Proyecto', certificacion: 'Certificación', logro: 'Logro', experiencia: 'Experiencia' };

const PRIMER_CAMPO = { proyecto: 'nombre', certificacion: 'nombre', logro: 'texto', experiencia: 'puesto' };
const SIN_TITULO = { proyecto: 'sin nombre todavía', certificacion: 'sin nombre todavía', logro: 'sin descripción todavía', experiencia: 'sin puesto todavía' };
const plegadas = new Set();        // ids de tarjetas plegadas (solo vista: no se guarda en la base)
const plegadoInicial = new Set();  // tipos de lista cuyo plegado de arranque ya se aplicó en esta carga de la página

// Aviso suave de «empieza con lo que hiciste». Solo se enciende ante aperturas que claramente NO son un verbo (artículos, preposiciones,
// sustantivos como «Proyecto» o terminados en -ción / -miento / -idad): ante la duda no avisa, porque un aviso equivocado molesta más de lo que ayuda.
const DESC_VERBO = { proyecto: 'queHiciste', experiencia: 'queHiciste' };
const APERTURA_SIN_VERBO = new Set(('el la los las un una unos unas lo mi mis su sus este esta estos estas ese esa para por con sin en de del al a y o que como sobre segun '
    + 'durante mediante cuando donde tambien ademas actualmente parte soy estudiante miembro responsable encargado encargada '
    + 'proyecto informe sistema analisis prototipo encuesta propuesta plataforma aplicacion herramienta actividad curso tarea funcion rol responsabilidad').split(' '));
const avisoVerboCerrado = new Set();        // «clave|campo» donde el alumno ya pulsó «Entendido» (solo esta sesión)
function empiezaSinVerbo(texto) {
    const m = String(texto || '').trim().replace(/^[\s\-–—•*·"«¿¡(\d.)]+/u, '').match(/^\p{L}+/u);
    if (!m) return false;
    const w = sinTildes(m[0]);
    return APERTURA_SIN_VERBO.has(w) || /(cion|sion|miento|idad|ismo)$/.test(w);
}
function pintarPistaVerbo(tipo, area) {
    const cont = area.closest('.dp-campo'), llave = `${area.dataset.clave}|${area.dataset.campo}`;
    if (!cont) return;
    const hay = cont.querySelector('.dpc-pista-verbo');
    const debe = empiezaSinVerbo(area.value) && !avisoVerboCerrado.has(llave);
    if (!debe) { if (hay) hay.remove(); return; }
    if (hay) return;
    cont.append(el('div', { class: 'dpc-pista-verbo', role: 'status' },
        el('span', { text: '💡 ' + C.PISTA_VERBO.texto }),
        el('button', { type: 'button', class: 'dp-btn-texto', text: C.PISTA_VERBO.boton, onclick: () => { avisoVerboCerrado.add(llave); pintarPistaVerbo(tipo, area); } })));
}

function textoResumen(tipo, clave) {
    const v = String((D.leerClave(clave) || {})[PRIMER_CAMPO[tipo]] || '').trim().replace(/\s+/g, ' ');
    return v ? (v.length > 60 ? v.slice(0, 57) + '…' : v) : SIN_TITULO[tipo];
}

function aplicarPliegue(tarjeta, tipo, clave) {
    const plegada = plegadas.has(tarjeta.dataset.id);
    const cuerpo = $('.dp-tarjeta-cuerpo', tarjeta), boton = $('.dp-tarjeta-toggle', tarjeta);
    cuerpo.hidden = plegada;
    boton.setAttribute('aria-expanded', String(!plegada));
    $('.dp-tarjeta-flecha', tarjeta).textContent = plegada ? '▸' : '▾';
    const est = $('[data-guardado]', tarjeta);
    if (est && est.dataset.guardado === 'reposo') est.hidden = plegada;      // plegada y sin cambios: basta con el título
    const res = $('.dp-tarjeta-resumen', tarjeta);
    res.hidden = !plegada;
    if (plegada) res.textContent = '· ' + textoResumen(tipo, clave);
}

function crearTarjeta(tipo, item) {
    const clave = D.claveDe(tipo, item.id);
    const titulo = el('strong', { class: 'dp-tarjeta-num' });
    const accion = el('span', { class: 'dp-quitar' });
    const mostrarQuitar = () => {
        accion.replaceChildren(el('button', { type: 'button', class: 'dp-btn-texto', text: 'Quitar', onclick: preguntar }));
    };
    const preguntar = () => {
        accion.replaceChildren(
            el('span', { class: 'dp-quitar-q', text: '¿Quitar? ' }),
            el('button', { type: 'button', class: 'dp-btn-texto dp-peligro', text: 'Sí', onclick: () => quitar(tipo, item.id, clave) }),
            el('button', { type: 'button', class: 'dp-btn-texto', text: 'No', onclick: mostrarQuitar }));
    };
    mostrarQuitar();
    const G = C.GUARDADO[tipo];
    const estado = el('span', { class: 'dp-guardado', 'data-guardado': 'reposo', role: 'status', text: C.GUARDADO.reposo });
    const cierre = G ? el('div', { class: 'dpc-guardar' },
        el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: G.boton, onclick: () => guardarTarjeta(tipo, item.id, clave) }),
        el('small', { class: 'dp-ayuda', text: C.GUARDADO.nota }),
        el('small', { class: 'dp-error', role: 'alert', hidden: true, 'data-falta': '' })) : null;
    const previa = (tipo === 'proyecto' || tipo === 'experiencia') ? bloquePrevia(tipo, clave) : null;
    const cuerpo = el('div', { class: 'dp-tarjeta-cuerpo', id: `dp-cuerpo-${item.id}` }, ...CAMPOS_TARJETA[tipo](clave), previa, cierre);
    if (previa) { cuerpo.addEventListener('input', previa._pintar); cuerpo.addEventListener('change', previa._pintar); }
    if (DESC_VERBO[tipo]) {      // el aviso se evalúa al salir del campo, no mientras escribe
        cuerpo.addEventListener('focusout', (e) => { if (e.target.matches && e.target.matches(`textarea[data-campo="${DESC_VERBO[tipo]}"]`)) pintarPistaVerbo(tipo, e.target); });
    }
    const boton = el('button', {
        type: 'button', class: 'dp-tarjeta-toggle', 'aria-controls': cuerpo.id, 'aria-expanded': 'true',
        title: 'Plegar o desplegar',
    }, el('span', { class: 'dp-tarjeta-flecha', 'aria-hidden': 'true', text: '▾' }), titulo, el('span', { class: 'dp-tarjeta-resumen', hidden: true }));
    const tarjeta = el('div', { class: 'dp-tarjeta', 'data-id': item.id, 'data-clave': clave }, el('div', { class: 'dp-tarjeta-cab' }, boton, estado, accion), cuerpo);
    boton.addEventListener('click', () => {
        if (plegadas.has(item.id)) plegadas.delete(item.id);
        else { plegadas.add(item.id); if (cuerpo.contains(document.activeElement)) boton.focus(); }
        aplicarPliegue(tarjeta, tipo, clave);
        pintarBarra(tipo);
    });
    aplicarPliegue(tarjeta, tipo, clave);
    return tarjeta;
}

// «Así se verá en tu CV»: el mismo HTML que se imprime, con lo que hay escrito ahora mismo (aunque aún no se haya guardado).
function bloquePrevia(tipo, clave) {
    const P = C.PREVIA, T = P[tipo];
    const cuerpo = el('div', { class: 'dpc-previa-cv' });
    const pintar = () => {
        const html = htmlItemPrevia(tipo, recolectar(clave) || leerItem(clave));
        if (html) cuerpo.innerHTML = html;                          // el HTML sale de htmlItemPrevia, que escapa todo lo escrito
        else cuerpo.replaceChildren(el('p', { class: 'dpc-previa-vacio', text: T.vacio }));
    };
    const caja = el('div', { class: 'dpc-previa', 'data-previa': '', 'data-pinta': '', role: 'group', 'aria-label': P.titulo },
        el('div', { class: 'dpc-previa-cab' }, el('strong', { text: P.titulo }), el('span', { text: P.vivo })),
        cuerpo, el('small', { class: 'dpc-previa-nota', text: T.nota }));
    caja._pintar = pintar;
    pintar();
    return caja;
}

// «Registrar proyecto / experiencia / logro»: los datos ya se guardan solos; este botón los registra, cierra la tarjeta y la deja en la lista.
function guardarTarjeta(tipo, id, clave) {
    const G = C.GUARDADO[tipo];
    const tarjeta = $(`.dp-tarjeta[data-id="${id}"]`);
    if (!tarjeta || !G) return;
    flush(clave);
    const falta = $('[data-falta]', tarjeta);
    if (!String((D.leerClave(clave) || {})[PRIMER_CAMPO[tipo]] || '').trim()) {
        falta.textContent = G.falta; falta.hidden = false;
        const campoPrimero = $(`[data-clave="${clave}"][data-campo="${PRIMER_CAMPO[tipo]}"]`, tarjeta);
        if (campoPrimero) { campoPrimero.focus(); campoPrimero.addEventListener('input', () => { falta.hidden = true; }, { once: true }); }
        return;
    }
    falta.hidden = true;
    marcarEstado(clave, 'guardado');
    plegadas.add(id);
    aplicarPliegue(tarjeta, tipo, clave);
    pintarBarra(tipo);
    tarjeta.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    toast({ id: 'guardado', texto: G.ok });
}

function quitar(tipo, id, clave) {
    clearTimeout(temporizadores.get(clave)); temporizadores.delete(clave); limpiarSucios(clave);
    D.quitarElemento(tipo, id);
    const tarjeta = $(`.dp-tarjeta[data-id="${id}"]`);
    if (tarjeta) tarjeta.remove();                  // el alumno acaba de pedirlo: se quita aunque el foco esté dentro
    cv = D.leerCV();
    conciliar();
    refrescarMemoria();
}

// Concilia una lista: crea las tarjetas que faltan, quita las que ya no existen y NO toca las que se están escribiendo.
function reconciliarLista(tipo) {
    const cont = $(`[data-lista="${tipo}"]`);
    if (!cont) return;
    const items = cv[COLECCION[tipo]];
    const existentes = new Map($$('.dp-tarjeta', cont).map((t) => [t.dataset.id, t]));
    const ids = new Set(items.map((i) => i.id));
    for (const [id, tarjeta] of existentes) if (!ids.has(id) && !tarjeta.contains(document.activeElement)) { tarjeta.remove(); existentes.delete(id); }
    items.forEach((item, i) => {
        if (!existentes.has(item.id)) {
            const t = crearTarjeta(tipo, item);
            cont.insertBefore(t, cont.querySelectorAll('.dp-tarjeta')[i] || null);
            existentes.set(item.id, t);
        }
    });
    $$('.dp-tarjeta', cont).forEach((t, i) => {
        $('.dp-tarjeta-num', t).textContent = `${ROTULO[tipo]} ${i + 1}`;
        if (plegadas.has(t.dataset.id)) aplicarPliegue(t, tipo, D.claveDe(tipo, t.dataset.id));
    });
    if (tipo === 'proyecto') pintarSugerenciaProyectos();
    const vacio = $(`[data-vacio="${tipo}"]`);
    if (vacio) vacio.hidden = cont.querySelectorAll('.dp-tarjeta').length > 0;
    pintarBarra(tipo);
    sincronizarCampos(cont);
}

// «Plegar todo» / «Desplegar todo»: solo se ve con 3 o más tarjetas. El pliegue es solo de vista (no se guarda).
function pintarBarra(tipo) {
    const barra = $(`[data-barra="${tipo}"]`), cont = $(`[data-lista="${tipo}"]`);
    if (!barra || !cont) return;
    const ts = $$('.dp-tarjeta', cont);
    barra.hidden = ts.length < 3;
    const todasPlegadas = ts.length > 0 && ts.every((t) => plegadas.has(t.dataset.id));
    const b = $('button', barra);
    b.textContent = todasPlegadas ? 'Desplegar todo' : 'Plegar todo';
    b.dataset.accion = todasPlegadas ? 'desplegar' : 'plegar';
}

function plegarTodas(tipo, plegar) {
    const cont = $(`[data-lista="${tipo}"]`);
    if (!cont) return;
    $$('.dp-tarjeta', cont).forEach((t) => {
        if (plegar) plegadas.add(t.dataset.id); else plegadas.delete(t.dataset.id);
        aplicarPliegue(t, tipo, D.claveDe(tipo, t.dataset.id));
    });
    pintarBarra(tipo);
}

function bloqueLista(tipo, { vacio, botonTexto, base }) {
    const cont = el('div', { class: 'dp-lista', 'data-lista': tipo });
    const aviso = el('p', { class: 'dp-vacio', 'data-vacio': tipo, text: vacio });
    const boton = el('button', {
        type: 'button', class: 'dp-btn dp-btn-agregar', text: botonTexto,
        onclick: () => {
            const previas = $$('.dp-tarjeta', cont).map((t) => t.dataset.id);
            const nuevo = D.nuevoElemento(tipo, base);
            refrescarMemoria();
            reconciliarLista(tipo);
            previas.forEach((id) => {                       // las anteriores se pliegan: queda abierta solo la nueva
                plegadas.add(id);
                const anterior = $(`.dp-tarjeta[data-id="${id}"]`, cont);
                if (anterior) aplicarPliegue(anterior, tipo, D.claveDe(tipo, id));
            });
            pintarBarra(tipo);
            const t = $(`.dp-tarjeta[data-id="${nuevo.id}"]`, cont);
            const primero = t && $('input, textarea', t);
            if (primero) primero.focus();
        },
    });
    const barra = el('div', { class: 'dp-lista-barra', 'data-barra': tipo, hidden: true },
        el('button', { type: 'button', class: 'dp-btn-texto', text: 'Plegar todo', onclick: (e) => plegarTodas(tipo, e.currentTarget.dataset.accion !== 'desplegar') }));
    const pie = el('div', { class: 'dp-lista-pie' }, boton, barra);      // «+ Añadir» a la izquierda y «Plegar todo» a la derecha, a la vista donde se trabaja
    const bloque = el('div', {}, aviso, cont, pie);
    queueMicrotask(() => {
        // Al abrir la página con 2 o más tarjetas guardadas, arrancan todas plegadas (una lista larga abierta cansa); solo la primera vez por lista.
        if (!plegadoInicial.has(tipo)) {
            plegadoInicial.add(tipo);
            const guardadas = cv[COLECCION[tipo]] || [];
            if (guardadas.length >= 2) guardadas.forEach((i) => plegadas.add(i.id));
        }
        reconciliarLista(tipo);
    });
    return bloque;
}

// ───────────── contenido de cada paso ─────────────
function pasoDatos() {
    const c = CLAVE_DATOS;
    return el('div', {},
        campo({ clave: c, nombre: 'nombre', etiqueta: 'Nombre completo', placeholder: 'Nombre y apellidos', extra: { autocomplete: 'name' } }),
        campo({ clave: c, nombre: 'correo', etiqueta: 'Correo electrónico', placeholder: 'nombre@correo.com', tipo: 'email', extra: { autocomplete: 'email' } }),
        campo({ clave: c, nombre: 'telefono', etiqueta: 'Teléfono', placeholder: '987 654 321', tipo: 'tel', extra: { autocomplete: 'tel' } }),
        campo({ clave: c, nombre: 'linkedin', etiqueta: 'LinkedIn', opcional: true, placeholder: 'linkedin.com/in/tu-usuario', ayuda: 'Si no tienes, déjalo vacío.' }),
        campo({ clave: c, nombre: 'github', etiqueta: 'GitHub', opcional: true, placeholder: 'github.com/tu-usuario', ayuda: 'Si no tienes, déjalo vacío.' }),
        campo({ clave: c, nombre: 'distrito', etiqueta: 'Distrito', opcional: true, placeholder: 'Por ejemplo: Rímac' }));
}

// Avisos junto a los años de Formación: solo orientan, nunca impiden escribir.
const avisoAnio = (v) => (String(v).trim() && !/^\d{4}$/.test(String(v).trim()) ? { nivel: 'aviso', mensaje: 'Escribe el año con 4 dígitos, por ejemplo 2027.' } : null);
const avisoOrden = (entradaIngreso, egreso) => {
    const i = String(entradaIngreso ? entradaIngreso.value : '').trim(), e = String(egreso).trim();
    return /^\d{4}$/.test(i) && /^\d{4}$/.test(e) && Number(e) < Number(i) ? { nivel: 'error', mensaje: 'El año de egreso es anterior al de ingreso.' } : null;
};
function casillaEgresado(c) {
    const chk = el('input', { type: 'checkbox', id: 'f-egresado' });
    chk.dataset.clave = c; chk.dataset.campo = 'egresado';
    chk.checked = !!(D.leerClave(c) || {}).egresado;
    chk.addEventListener('change', () => { sucios.add(`${c}|egresado`); flush(c); });
    return chk;
}

function pasoFormacion() {
    const c = CLAVE_FORMACION;
    const marca = el('span', { class: 'dp-etiqueta-siga', 'data-marca-siga': '' });
    const actualizarMarca = () => { marca.hidden = !(D.leerClave(c) || {}).desdeSiga; marca.textContent = 'Prellenado desde SIGA · editable'; };
    actualizarMarca();
    const restablecer = el('button', {
        type: 'button', class: 'dp-btn dp-btn-chico', text: 'Restablecer datos de SIGA',
        onclick: async () => {
            const s = await leerDatosSiga(supabase, { resolverCarrera });
            const nombres = [s.universidad && 'universidad', s.carrera && 'carrera', s.ingreso && 'año de ingreso'].filter(Boolean);
            const lista = nombres.length > 1 ? nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1] : nombres[0];
            const si = await confirmarModal({
                titulo: 'Restablecer datos de SIGA',
                texto: `Volveremos a copiar de tu perfil de SIGA: ${lista}. Lo que hayas editado en esos campos se reemplazará. Tus cursos y tu promedio no cambian, y tu perfil de SIGA tampoco.`,
                ok: 'Restablecer',
            });
            if (!si) return;
            flush(c);
            const actual = D.leerClave(c) || {};
            const nuevo = { ...actual, universidad: s.universidad || actual.universidad || '', carrera: s.carrera || actual.carrera || '', ingreso: s.ingreso || actual.ingreso || '', desdeSiga: true };
            limpiarSucios(c);
            D.guardarClave(c, nuevo);
            refrescarMemoria();
            sincronizarCampos($('#dpPanel'));
            actualizarMarca();
        },
    });
    // Primera vez: copiar lo que SIGA ya sabe. No pisa nada que el alumno haya escrito mientras tanto.
    // También se completa si la carrera quedó vacía (por ejemplo, un CV iniciado antes de que SIGA la leyera); nunca pisa lo escrito.
    const previo = D.leerClave(c);
    if (previo === undefined || !String(previo.carrera || '').trim()) {
        leerDatosSiga(supabase, { resolverCarrera }).then((s) => {
            const actual = D.leerClave(c);
            if (actual === undefined) {
                D.guardarClave(c, { universidad: s.universidad, carrera: s.carrera, ingreso: s.ingreso, cursos: [], promedio: '', desdeSiga: true });
            } else {
                const mezcla = { ...actual };
                let cambio = false;
                for (const k of ['universidad', 'carrera', 'ingreso']) if (!mezcla[k] && s[k]) { mezcla[k] = s[k]; cambio = true; }
                if (cambio) D.guardarClave(c, mezcla);
            }
            refrescarMemoria();
            if ($('#dpPanel') && $('[data-clave="cv:formacion"]')) { sincronizarCampos($('#dpPanel')); actualizarMarca(); }
        });
    }
    return el('div', {},
        el('div', { class: 'dp-fila-siga' }, marca, restablecer),
        campo({ clave: c, nombre: 'universidad', etiqueta: 'Universidad', placeholder: 'Universidad Nacional de Ingeniería' }),
        campo({ clave: c, nombre: 'carrera', etiqueta: 'Carrera', placeholder: C.FORMACION.carrera, lista: listaCarreras, ayuda: 'Elige de la lista o escribe la tuya.' }),
        el('div', { class: 'dpc-fechas' },
            campo({ clave: c, nombre: 'ingreso', etiqueta: 'Año de ingreso', placeholder: '2023', opcional: true, extra: { inputmode: 'numeric', maxlength: '4' }, validar: (v) => avisoAnio(v) }),
            campo({ clave: c, nombre: 'egreso', etiqueta: 'Año de egreso', placeholder: '2027', opcional: true, extra: { inputmode: 'numeric', maxlength: '4' },
                validar: (v) => avisoAnio(v) || avisoOrden($('input[data-campo="ingreso"]', $('#dpPanel') || document), v) })),
        el('label', { class: 'dp-casilla', for: 'f-egresado' }, casillaEgresado(c), ' Ya egresé'),
        el('small', { class: 'dp-ayuda', text: C.FORMACION.ayudaPeriodo }),
        campo({ clave: c, nombre: 'cursos', etiqueta: 'Cursos relevantes', opcional: true, placeholder: C.FORMACION.cursos[sumaTexto((D.leerClave(c) || {}).carrera) % C.FORMACION.cursos.length], ayuda: 'Separa con comas. Hasta 5, relacionados con el puesto al que postulas.' }),
        campo({ clave: c, nombre: 'promedio', etiqueta: 'Promedio académico', opcional: true, placeholder: 'Déjalo vacío si no deseas incluirlo' }));
}

function pintarSugerenciaProyectos() {
    const caja = $('[data-sug-proy]');
    if (!caja) return;
    const S = C.SUGERENCIA_PROYECTOS_PRACTICOS;
    const hay = $$('.dp-tarjeta', $('[data-lista="proyecto"]') || document).length > 0;
    caja.replaceChildren(el('span', { class: 'dpc-sug-texto', text: hay ? S.textoCon : S.textoSin }), el('a', { class: 'dp-btn dp-btn-primario dpc-sug-boton', href: S.enlace, text: S.boton }));
}

function pasoProyectos() {
    const A = C.AYUDA_PROYECTOS;
    const sinProyectos = D.leerCV().proyectos.length === 0;
    const ideas = el('div', { class: 'dpc-ayudas' },
        el('details', { class: 'dpc-det', open: sinProyectos ? true : null },
            el('summary', { text: A.resumen }),
            el('p', { class: 'dp-suave', text: A.intro }),
            el('ul', { class: 'dp-lista-ejemplos' }, C.CATEGORIAS_PROYECTO.map((c) => el('li', {}, el('strong', { text: c.nombre + ': ' }), c.texto))),
            el('p', { class: 'dp-suave dpc-parcial', text: A.parcial }),
            el('p', { class: 'dp-suave', text: A.preguntasTitulo }),
            el('ul', { class: 'dp-lista-ejemplos' }, A.preguntas.map((q) => el('li', { text: q })))),
        ayudaDonde());
    const sugerencia = el('div', { class: 'dpc-sugerencia', 'data-sug-proy': '' });
    queueMicrotask(pintarSugerenciaProyectos);
    return el('div', {}, ideas, bloqueLista('proyecto', {
        vacio: 'Todavía no agregaste ningún proyecto. Un trabajo final de un curso es un buen comienzo.',
        botonTexto: '+ Añadir proyecto',
        base: { nombre: '', queHiciste: '', herramientas: '', evidencia: '', categoria: '', modalidad: '', desde: '', hasta: '', sigue: false, origen: 'manual' },
    }), sugerencia);
}

function listaAyuda(resumen, ...cuerpo) {
    return el('details', { class: 'dpc-det', open: null }, el('summary', { text: resumen }), ...cuerpo);
}
// «¿No sabes dónde incluir algo?»: plegada, igual en Proyectos y en Logros.
const ayudaDonde = () => listaAyuda(C.DONDE_INCLUIR.resumen,
    el('ul', { class: 'dp-lista-ejemplos' }, C.DONDE_INCLUIR.items.map(([n, t]) => el('li', {}, el('strong', { text: n + ': ' }), t))),
    el('p', { class: 'dp-suave dpc-parcial', text: C.DONDE_INCLUIR.cierre }));
const itemsUl = (items) => el('ul', { class: 'dp-lista-ejemplos' }, items.map((x) => el('li', { text: x })));

function pasoCertificaciones() {
    const Cc = C.CERTIFICACIONES;
    const sinNinguna = D.leerCV().certificaciones.length === 0;
    const descubrir = el('details', { class: 'dpc-det', open: sinNinguna ? true : null },
        el('summary', { text: Cc.descubrir.resumen }),
        el('p', { class: 'dp-suave', text: Cc.descubrir.intro }), itemsUl(Cc.descubrir.items),
        el('p', { class: 'dp-suave dpc-parcial', text: Cc.descubrir.cierre }));
    const ayudas = el('div', { class: 'dpc-ayudas' },
        descubrir,
        listaAyuda(Cc.cuales.resumen, itemsUl(Cc.cuales.items), el('p', { class: 'dp-suave dpc-parcial', text: Cc.cuales.cierre })),
        listaAyuda(Cc.donde.resumen, itemsUl(Cc.donde.items), el('p', { class: 'dp-suave dpc-parcial', text: Cc.donde.cierre })),
        listaAyuda(Cc.como.resumen, el('p', { class: 'dp-suave', text: Cc.como.texto }), el('p', { class: 'dpc-ejemplo', text: Cc.como.ejemplo })),
        listaAyuda(Cc.tipos.resumen, el('ul', { class: 'dp-lista-ejemplos' }, C.TIPOS_CERTIFICACION.map((o) => el('li', {}, el('strong', { text: o.nombre + ': ' }), o.texto)))));
    return el('div', {}, el('p', { class: 'dp-suave', text: Cc.intro }), ayudas,
        bloqueLista('certificacion', { vacio: Cc.vacio, botonTexto: '+ Añadir certificación', base: { nombre: '', institucion: '', anio: '', enlace: '' } }),
        el('p', { class: 'dp-suave dpc-conservar', text: Cc.conservar }));
}

function pasoLogros() {
    const L = C.LOGROS;
    const sinLogros = D.leerCV().logros.length === 0;
    const ayudas = el('div', { class: 'dpc-ayudas' },
        el('details', { class: 'dpc-det', open: sinLogros ? true : null },
            el('summary', { text: L.reconocer.resumen }),
            el('p', { class: 'dp-suave', text: L.reconocer.texto }),
            itemsUl(L.reconocer.items)),
        listaAyuda(L.descubrir.resumen, el('p', { class: 'dp-suave', text: L.descubrir.texto })),
        ayudaDonde());
    return el('div', {}, ayudas,
        bloqueLista('logro', { vacio: L.vacio, botonTexto: '+ Añadir logro', base: { texto: '', respaldo: '' } }));
}

function pasoExperiencia() {
    const E = C.EXPERIENCIA;
    const sinExperiencias = D.leerCV().experiencias.length === 0;
    const ayudas = el('div', { class: 'dpc-ayudas' },
        el('details', { class: 'dpc-det', open: sinExperiencias ? true : null },
            el('summary', { text: E.resumen }),
            el('p', { class: 'dp-suave', text: E.texto }),
            itemsUl(E.items),
            el('p', { class: 'dp-suave dpc-parcial', text: E.cierre })));
    return el('div', {}, ayudas,
        bloqueLista('experiencia', { vacio: E.vacio, botonTexto: '+ Añadir experiencia', base: { puesto: '', organizacion: '', desde: '', hasta: '', sigue: false, queHiciste: '' } }));
}

// ───────────── Perfil profesional ─────────────
// La presentación es UN texto: lo que el alumno deja en el campo es lo que se guarda. El asistente solo propone un borrador.
const sumaTexto = (v) => [...String(v || '')].reduce((a, c) => a + c.charCodeAt(0), 0);
let avisoGenericaVisto = false;    // el aviso de palabras genéricas sale una sola vez por visita

function pasoPerfil() {
    const P = C.PERFIL, A = P.asistente, O = C.OFERTA_AYUDA, clave = CLAVE_PERFIL;
    const base = 'p-perfil';
    const semilla = sumaTexto((cv.formacion || {}).carrera);                  // el ejemplo cambia según la carrera, no se guarda
    const ejB = P.ejemplosBusca[semilla % P.ejemplosBusca.length];
    const nD = P.ejemplosDestacar.length;
    const ejD = [P.ejemplosDestacar[semilla % nD], P.ejemplosDestacar[(semilla + 1) % nD]].join(', ');

    const bienvenida = el('div', { class: 'dpc-bienvenida' }, el('strong', { text: P.bienvenida }), el('p', { text: P.bienvenidaTexto }));
    const areaCampo = campo({ clave, nombre: 'texto', etiqueta: P.etiqueta, area: true, placeholder: P.placeholder });
    const area = $('textarea', areaCampo); area.rows = 5;
    const avisoGen = el('small', { class: 'dp-ayuda', text: P.avisoGenerica, hidden: true });
    const avisoLargo = el('small', { class: 'dp-ayuda', hidden: true });

    // preguntas del asistente (solo vista; no se guardan)
    const gEst = entradaCrece({ id: `${base}-e`, autocomplete: 'off', placeholder: A.placeEstudia });
    let estTocado = false; gEst.addEventListener('input', () => { estTocado = true; });
    let seleccion = [];
    const chips = el('div', { class: 'dpc-opciones', role: 'group', 'aria-label': 'Elementos para destacar' });
    const ayudaDest = el('small', { class: 'dp-ayuda', text: A.ayudaDestacar });
    const avisoMax = el('small', { class: 'dp-ayuda', text: A.avisoMax, hidden: true });
    const gLibre = entradaCrece({ id: `${base}-l`, autocomplete: 'off', placeholder: 'Ej. ' + ejD });
    const gBusca = entradaCrece({ id: `${base}-b`, autocomplete: 'off', placeholder: 'Ej. ' + ejB });
    const borrador = el('div', { class: 'dpc-borrador', 'aria-live': 'polite' });
    const errGuia = el('small', { class: 'dp-error', role: 'alert', hidden: true });

    const pregunta = (id, etiqueta, entrada, ayuda, opc) => el('div', { class: 'dpc-pregunta' },
        el('label', { for: id }, etiqueta, opc ? el('span', { class: 'dp-opc', text: ' (opcional)' }) : null), entrada,
        ayuda ? el('small', { class: 'dp-ayuda', text: ayuda }) : null);

    const nombresPropios = () => {
        const vistos = new Set(), lista = [];
        [...(cv.proyectos || []), ...(cv.habilidades || [])].forEach((x) => {
            const n = String(x.nombre || '').trim(), k = n.toLowerCase();
            if (n && !vistos.has(k)) { vistos.add(k); lista.push(n); }
        });
        return lista.slice(0, 12);
    };
    const elementos = () => {
        const libres = gLibre.value.split(',').map((x) => x.trim()).filter(Boolean);
        const vistos = new Set(), todos = [];
        [...seleccion, ...libres].forEach((n) => { const k = n.toLowerCase(); if (!vistos.has(k)) { vistos.add(k); todos.push(n); } });
        return todos;
    };
    const pintarBorrador = () => {
        const todos = elementos();
        avisoMax.hidden = todos.length <= 3;
        const x = armarBorradorPerfil({ estudia: gEst.value, destacar: todos.slice(0, 3), busca: gBusca.value });
        borrador.textContent = x || 'Responde alguna pregunta y verás tu borrador aquí.';
        borrador.classList.toggle('vacio', !x);
        return x;
    };
    const pintarChips = () => {
        const propios = nombresPropios();
        seleccion = seleccion.filter((n) => propios.includes(n));
        chips.hidden = !propios.length;
        ayudaDest.textContent = propios.length ? A.ayudaDestacar : 'Aún no registraste proyectos ni habilidades. Escribe aquí lo que quieras destacar.';
        chips.replaceChildren(...propios.map((n) => {
            const b = el('button', { type: 'button', class: 'dpc-op' + (seleccion.includes(n) ? ' on' : ''), 'aria-pressed': seleccion.includes(n) ? 'true' : 'false', text: n });
            b.addEventListener('click', () => {
                seleccion = seleccion.includes(n) ? seleccion.filter((x) => x !== n) : [...seleccion, n];
                pintarChips(); pintarBorrador();
            });
            return b;
        }));
    };

    const guia = el('div', { class: 'dpc-guia', hidden: true },
        pregunta(`${base}-e`, A.pregEstudia, gEst, A.ayudaEstudia, true),
        pregunta(`${base}-l`, A.pregDestacar, el('div', {}, chips, ayudaDest, gLibre, avisoMax), A.ayudaLibre, true),
        pregunta(`${base}-b`, A.pregBusca, gBusca, A.ayudaBusca, true),
        bloqueBorrador(borrador, errGuia, 'perfil'),
        el('div', { class: 'dpc-acciones-guia' },
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: C.OFERTA_AYUDA.revisar, onclick: async () => {
                const x = pintarBorrador();
                if (!x) { errGuia.textContent = 'Responde al menos una pregunta para armar un borrador.'; errGuia.hidden = false; return; }
                if (area.value.trim() && !(await confirmarModal({ titulo: 'Reemplazar tu perfil', texto: 'Ya escribiste un perfil. Si usas el borrador, se reemplazará. Después podrás editarlo como quieras.', ok: 'Usar borrador' }))) return;
                area.value = x; area.dispatchEvent(new Event('input', { bubbles: true })); flush(clave);
                cerrar(); area.focus();
            } }),
            botonCerrarGuia(() => cerrar())));
    [gEst, gLibre, gBusca].forEach((n) => n.addEventListener('input', () => { errGuia.hidden = true; pintarBorrador(); }));

    const { boton, enlace } = ofertaAyuda(O.redactar, () => abrir());
    const revisarTexto = () => {
        const v = area.value, tiene = v.trim().length > 0, abierta = !guia.hidden;
        bienvenida.hidden = tiene;
        boton.hidden = tiene || abierta; enlace.hidden = !tiene || abierta;
        const hay = P.genericas.some((w) => new RegExp(`(^|[^a-záéíóúñ])${w}($|[^a-záéíóúñ])`, 'i').test(v));
        if (hay && !avisoGenericaVisto) { avisoGenericaVisto = true; avisoGen.hidden = false; } else if (!hay) avisoGen.hidden = true;
        const largo = v.trim().length > P.maxCaracteres;
        avisoLargo.hidden = !largo;
        if (largo) avisoLargo.textContent = `${v.trim().length} caracteres. ${P.avisoLargo}`;
    };
    function abrir() {
        const f = cv.formacion || {}, car = String(f.carrera || '').trim(), uni = String(f.universidad || '').trim();
        if (!estTocado) gEst.value = car ? (uni ? `${car} en ${uni}` : car) : '';
        pintarChips();
        guia.hidden = false; boton.setAttribute('aria-expanded', 'true'); revisarTexto(); pintarBorrador(); ajustarCrecen(guia); (gEst.value ? gLibre : gEst).focus();
    }
    function cerrar() { guia.hidden = true; boton.setAttribute('aria-expanded', 'false'); revisarTexto(); }
    area.addEventListener('input', revisarTexto);
    pintarChips(); pintarBorrador(); revisarTexto();
    const bloque = el('div', { 'data-pinta': '' }, bienvenida, areaCampo, avisoGen, avisoLargo, el('div', { class: 'dpc-caminos' }, boton, enlace), guia);
    bloque._pintar = revisarTexto;
    return bloque;
}

// Habilidades: cada una es un elemento independiente (chip). Cuatro categorías:
//   tecnica / herramienta → nombre + nivel OPCIONAL (sin nivel se ve y se guarda igual que siempre)
//   idioma               → nombre + nivel general + detalle opcional (au, le, or, es)
//   personal             → solo el nombre, hasta C.MAX_PERSONALES, sin nivel
// Lo ya guardado nunca se reescribe al abrir el paso: solo cambia lo que el alumno edita, y se conservan los campos que no conoce.
const CICLO_NIVEL = ['', ...C.NIVELES];

// Actualiza UN elemento sin tocar los demás y conservando todos sus campos.
function guardarHabilidad(id, cambios, quitar = []) {
    const actual = D.leerCV().habilidades.find((x) => x.id === id);
    if (!actual) return;
    const nuevo = { ...actual, ...cambios };
    quitar.forEach((k) => { delete nuevo[k]; });                   // un nivel vacío se quita del todo: el elemento vuelve a ser como era
    D.guardarElemento('habilidad', nuevo);
    refrescarMemoria(); pintarChips();
}

const yaExiste = (cat, nombre) => cv.habilidades.some((h) => h.categoria === cat && String(h.nombre || '').trim().toLowerCase() === nombre.toLowerCase());

function filaAgregar({ cat, info, conNivel }) {
    const chips = el('div', { class: 'dp-chips', 'data-chips': cat });
    const nivel = el('select', { 'aria-label': 'Nivel de dominio (opcional)' }, el('option', { value: '', text: 'Sin nivel' }), C.NIVELES.map((n) => el('option', { value: n, text: n })));
    const error = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const combo = conNivel ? campoConLista({ aria: `Agregar a ${info.titulo}`, catalogo: C.CATALOGO[cat === 'tecnica' ? 'tec' : 'her'],
        ocupado: (x) => yaExiste(cat, x), enviar: (v) => agregar(v, nivel.value), alIdea: (v) => agregar(v) }) : null;
    const entrada = combo ? combo.entrada : el('input', { type: 'text', placeholder: 'Escribe y pulsa Enter', 'aria-label': `Agregar a ${info.titulo}`, autocomplete: 'off', class: 'dp-entrada-chip' });
    const agregar = (texto, niv = '') => {
        const nombre = String(texto || '').trim();
        if (!nombre) { error.textContent = 'Escribe algo antes de agregarlo.'; error.hidden = false; return; }
        if (yaExiste(cat, nombre)) { error.textContent = 'Ya lo agregaste.'; error.hidden = false; return; }
        error.hidden = true;
        D.nuevoElemento('habilidad', { categoria: cat, nombre, ...(niv ? { nivel: niv } : {}) });
        entrada.value = ''; nivel.value = '';
        refrescarMemoria(); pintarChips();
    };
    entrada.addEventListener('input', () => { error.hidden = true; });
    if (!combo) entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(entrada.value, nivel.value); } });
    return el('div', { class: 'dp-grupo' },
        el('h3', { text: info.titulo }), el('small', { class: 'dp-ayuda', text: info.ayuda }), chips,
        el('div', { class: 'dp-agregar' }, combo ? combo.caja : entrada, conNivel ? nivel : null, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Agregar', onclick: () => agregar(entrada.value, nivel.value) })), error,
        combo ? el('p', { class: 'dpc-sug-tit', text: C.IDEAS.titulo }) : null, combo ? combo.ideas : null);
}

function grupoIdiomas() {
    const cat = 'idioma', info = C.HABILIDADES.idioma;
    const chips = el('div', { class: 'dp-chips', 'data-chips': cat });
    const editor = el('div', { class: 'dpc-editor', 'data-editor-idioma': '', hidden: true });
    const entrada = el('input', { type: 'text', placeholder: 'Ejemplo: Inglés', 'aria-label': 'Agregar idioma', autocomplete: 'off', class: 'dp-entrada-chip' });
    const nivel = el('select', { 'aria-label': 'Nivel general' }, C.NIVELES.map((n) => el('option', { value: n, text: n, selected: n === 'Intermedio' })));
    const detalle = C.DETALLE_IDIOMA.map(([k, etiqueta]) => ({ k, sel: el('select', { id: `dpc-det-${k}`, 'aria-label': etiqueta }, el('option', { value: '', text: 'Igual que el general' }), C.NIVELES.map((n) => el('option', { value: n, text: n }))), etiqueta }));
    const error = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const agregar = () => {
        const nombre = entrada.value.trim();
        if (!nombre) { error.textContent = 'Escribe un idioma antes de agregarlo.'; error.hidden = false; return; }
        if (yaExiste(cat, nombre)) { error.textContent = 'Ya lo agregaste.'; error.hidden = false; return; }
        error.hidden = true;
        const det = {}; detalle.forEach(({ k, sel }) => { if (sel.value) det[k] = sel.value; });
        D.nuevoElemento('habilidad', { categoria: cat, nombre, nivel: nivel.value, ...(Object.keys(det).length ? { detalle: det } : {}) });
        entrada.value = ''; detalle.forEach(({ sel }) => { sel.value = ''; });
        const d = $('.dpc-det-nuevo'); if (d) d.open = false;
        refrescarMemoria(); pintarChips();
    };
    entrada.addEventListener('input', () => { error.hidden = true; });
    entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } });
    return el('div', { class: 'dp-grupo' },
        el('h3', { text: info.titulo }), el('small', { class: 'dp-ayuda', text: info.ayuda }), chips, editor,
        el('div', { class: 'dp-agregar' }, entrada, nivel, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Agregar', onclick: agregar })),
        el('details', { class: 'dpc-det dpc-det-nuevo' }, el('summary', { text: 'Detallar por habilidad (opcional)' }),
            el('div', { class: 'dpc-det4' }, detalle.map(({ etiqueta, sel }) => el('div', {}, el('label', { for: sel.id, text: etiqueta }), sel)))),
        error, el('small', { class: 'dp-ayuda', text: C.AVISO_IDIOMAS }));
}

const personalesElegidas = () => cv.habilidades.filter((h) => h.categoria === 'personal' && String(h.nombre || '').trim());
const personalesLlenas = () => personalesElegidas().length >= C.MAX_PERSONALES;

function grupoPersonales() {
    const info = C.HABILIDADES.personal;
    const error = el('small', { class: 'dp-error', role: 'alert', hidden: true, 'data-err-personal': '' });
    const combo = campoConLista({ aria: 'Agregar una habilidad personal', catalogo: C.CATALOGO.per, descripcion: (x) => C.DESCRIPCION_PERSONAL[x] || '',
        ocupado: (x) => yaExiste('personal', x), bloqueado: personalesLlenas, enviar: (v) => agregarPersonal(v, combo.entrada, error) });
    combo.entrada.addEventListener('input', () => { error.hidden = true; });
    return el('div', { class: 'dp-grupo' },
        el('h3', {}, info.titulo, el('span', { class: 'dp-opc', text: ' (opcional, sin niveles)' })), el('small', { class: 'dp-ayuda', text: info.ayuda }),
        el('div', { class: 'dp-chips', 'data-personales': '' }),
        el('div', { class: 'dp-agregar' }, combo.caja, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Agregar', onclick: () => agregarPersonal(combo.entrada.value, combo.entrada, error) }),
            el('span', { class: 'dp-ayuda', 'data-cuenta-personales': '' })), error,
        el('div', { 'data-ideas-personales': '' }, el('p', { class: 'dpc-sug-tit', text: C.IDEAS.titulo }), combo.ideas));
}

function agregarPersonal(texto, entrada, error) {
    const nombre = String(texto || '').trim();
    const e = error || $('[data-err-personal]');
    const fallo = (t) => { if (e) { e.textContent = t; e.hidden = false; } };
    if (!nombre) return fallo('Escribe algo antes de agregarla.');
    if (yaExiste('personal', nombre)) return fallo('Ya la agregaste.');
    if (cv.habilidades.filter((h) => h.categoria === 'personal').length >= C.MAX_PERSONALES) return fallo(`Puedes elegir hasta ${C.MAX_PERSONALES}. Quita una para elegir otra.`);
    if (e) e.hidden = true;
    D.nuevoElemento('habilidad', { categoria: 'personal', nombre });
    if (entrada) entrada.value = '';
    refrescarMemoria(); pintarChips();
}

function pasoHabilidades() {
    const ayudas = el('div', { class: 'dpc-ayudas' },
        el('details', { class: 'dpc-det' }, el('summary', { text: '¿No sabes qué habilidades incluir?' }), el('p', { class: 'dp-suave', text: C.AYUDA_QUE_INCLUIR })),
        el('details', { class: 'dpc-det' }, el('summary', { text: '¿Qué significa cada nivel?' }), el('p', { class: 'dp-suave', text: C.AYUDA_NIVELES })));
    const desdeProy = el('div', { class: 'dpc-desdeproy', 'data-desde-proyectos': '', hidden: true },
        el('p', { class: 'dpc-sug-tit', text: C.DESDE_PROYECTOS.titulo }),
        el('small', { class: 'dp-ayuda', text: C.DESDE_PROYECTOS.ayuda }),
        el('div', { class: 'dp-chips', 'data-desde-chips': '' }));
    queueMicrotask(pintarChips);
    return el('div', {}, ayudas, desdeProy,
        filaAgregar({ cat: 'tecnica', info: C.HABILIDADES.tecnica, conNivel: true }),
        filaAgregar({ cat: 'herramienta', info: C.HABILIDADES.herramienta, conNivel: true }),
        grupoIdiomas(), grupoPersonales(),
        el('p', { class: 'dp-suave dpc-conservar', text: C.AYUDA_CONSERVAR }));
}

function chipNivel(h) {
    return el('span', { class: 'dp-chip dp-chip-hab' }, h.nombre,
        el('button', { type: 'button', class: 'dpc-nivel', title: 'Pulsa para cambiar el nivel (opcional)', text: h.nivel || 'sin nivel',
            onclick: () => { const sig = CICLO_NIVEL[(CICLO_NIVEL.indexOf(h.nivel || '') + 1) % CICLO_NIVEL.length]; guardarHabilidad(h.id, sig ? { nivel: sig } : {}, sig ? [] : ['nivel']); } }),
        botonQuitar(h));
}
const botonQuitar = (h) => el('button', { type: 'button', class: 'dp-chip-x', 'aria-label': `Quitar ${h.nombre}`, text: '×', onclick: () => { D.quitarElemento('habilidad', h.id); refrescarMemoria(); pintarChips(); } });

function chipIdioma(h) {
    const det = detalleIdioma(h);
    return el('span', { class: 'dp-chip dp-chip-hab' }, h.nombre + (h.nivel ? ` · ${h.nivel}` : '') + (det ? ` (${det})` : ''),
        el('button', { type: 'button', class: 'dpc-nivel', text: 'editar', title: 'Cambiar el nivel o el detalle', onclick: () => abrirEditorIdioma(h.id) }),
        botonQuitar(h));
}

// Editor de un idioma ya guardado: cada cambio actualiza ese idioma al instante.
function abrirEditorIdioma(id) {
    const caja = $('[data-editor-idioma]'); if (!caja) return;
    const h = D.leerCV().habilidades.find((x) => x.id === id); if (!h) return;
    const det = (h.detalle && typeof h.detalle === 'object') ? h.detalle : {};
    const general = el('select', { id: 'dpc-ed-nivel', 'aria-label': 'Nivel general' }, C.NIVELES.map((n) => el('option', { value: n, text: n, selected: n === h.nivel })));
    general.addEventListener('change', () => guardarHabilidad(id, { nivel: general.value }));
    const campos = C.DETALLE_IDIOMA.map(([k, etiqueta]) => {
        const sel = el('select', { id: `dpc-ed-${k}` }, el('option', { value: '', text: 'Igual que el general' }), C.NIVELES.map((n) => el('option', { value: n, text: n, selected: n === det[k] })));
        sel.addEventListener('change', () => {
            const actual = D.leerCV().habilidades.find((x) => x.id === id); if (!actual) return;
            const nuevo = { ...((actual.detalle && typeof actual.detalle === 'object') ? actual.detalle : {}) };
            if (sel.value) nuevo[k] = sel.value; else delete nuevo[k];
            guardarHabilidad(id, Object.keys(nuevo).length ? { detalle: nuevo } : {}, Object.keys(nuevo).length ? [] : ['detalle']);
        });
        return el('div', {}, el('label', { for: sel.id, text: etiqueta }), sel);
    });
    caja.hidden = false;
    caja.dataset.id = id;
    caja.replaceChildren(el('strong', { text: `Editar ${h.nombre}` }),
        el('div', { class: 'dpc-det4' }, el('div', {}, el('label', { for: general.id, text: 'Nivel general' }), general), campos),
        el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Listo', onclick: () => { caja.hidden = true; caja.replaceChildren(); } }));
    general.focus();
}

function pintarPersonales() {
    const cont = $('[data-personales]'); if (!cont) return;
    const sel = personalesElegidas();
    const llena = sel.length >= C.MAX_PERSONALES;
    const cuenta = $('[data-cuenta-personales]');
    if (cuenta) cuenta.textContent = `${sel.length} de ${C.MAX_PERSONALES} seleccionadas`;
    const entrada = $('input[role="combobox"]', cont.parentElement);
    if (entrada) entrada.placeholder = llena ? C.IDEAS.llenas : C.IDEAS.placeholder;
    const ideas = $('[data-ideas-personales]', cont.parentElement);
    if (ideas) ideas.hidden = llena;
    const firma = sel.map((h) => `${h.id}|${h.nombre}`).join('~');
    if (cont.dataset.firma === firma) return;
    cont.dataset.firma = firma;
    cont.replaceChildren(...sel.map((h) => el('span', { class: 'dp-chip dp-chip-hab' }, h.nombre,
        el('button', { type: 'button', class: 'dp-chip-x', 'aria-label': `Quitar ${h.nombre}`, text: '×',
            onclick: () => { D.quitarElemento('habilidad', h.id); refrescarMemoria(); pintarChips(); const e = $('[data-err-personal]'); if (e) e.hidden = true; } }))));
}

function pintarChips() {
    for (const cont of $$('[data-chips]')) {
        const cat = cont.dataset.chips;
        const lista = cv.habilidades.filter((h) => h.categoria === cat);
        const firma = lista.map((h) => `${h.id}|${h.nombre}|${h.nivel || ''}|${JSON.stringify(h.detalle || '')}`).join('~');
        if (cont.dataset.firma === firma) continue;
        cont.dataset.firma = firma;
        cont.replaceChildren(...lista.map((h) => (cat === 'idioma' ? chipIdioma(h) : chipNivel(h))));
    }
    $$('[data-combo]').forEach((n) => n._refrescar && n._refrescar());        // las ideas ofrecidas se renuevan al agregar una
    pintarPersonales();
    pintarDesdeProyectos();
}

// Herramientas que el alumno ya escribió en sus proyectos y todavía no están en Habilidades (solo el nombre, sin nivel).
function herramientasDeProyectos() {
    const vistos = new Set(), salida = [];
    for (const p of cv.proyectos || []) {
        for (const parte of String(p.herramientas || '').split(/[,;\n]+/)) {
            const nombre = parte.trim();
            const clave = nombre.toLowerCase();
            if (nombre.length < 2 || nombre.length > 40 || vistos.has(clave)) continue;
            vistos.add(clave);
            if (yaExiste('herramienta', nombre) || yaExiste('tecnica', nombre)) continue;
            salida.push(nombre);
        }
    }
    return salida.slice(0, 8);
}

function pintarDesdeProyectos() {
    const caja = $('[data-desde-proyectos]');
    if (!caja) return;
    const lista = herramientasDeProyectos();
    const firma = lista.join('|');
    const chips = $('[data-desde-chips]', caja);
    if (caja.dataset.firma !== firma) {
        caja.dataset.firma = firma;
        chips.replaceChildren(...lista.map((x) => el('button', {
            type: 'button', class: 'dp-chip dpc-sug', text: `+ ${x}`,
            onclick: () => { D.nuevoElemento('habilidad', { categoria: 'herramienta', nombre: x }); refrescarMemoria(); pintarChips(); },
        })));
    }
    caja.hidden = lista.length === 0;
}

// ───────────── revisión con semáforo ─────────────
const ROTULO_ESTADO = { rojo: 'Rojo', ambar: 'Ámbar', verde: 'Verde', gris: 'Gris' };
const PASO_DE_SECCION = Object.fromEntries(C.PASOS.map((p, i) => [p.id, i]));   // se calcula: reordenar o añadir pasos no rompe el «Ir al paso»

function pasoRevision() {
    const cont = el('div', { class: 'dp-revision', 'data-revision': '' });
    pintarRevision(cont);
    return cont;
}

function pintarRevision(cont) {
    const r = evaluarCV(cv);
    cont.replaceChildren(
        el('div', { class: 'dp-leyenda' }, C.LEYENDA.map((l) => el('span', { class: 'dp-leyenda-item' }, el('span', { class: `dp-punto dp-${l.estado}` }), el('b', { text: l.nombre + ': ' }), l.texto))),
        ...r.secciones.map((s) => el('div', { class: `dp-fila dp-fila-${s.estado}` },
            el('span', { class: `dp-punto dp-${s.estado}`, 'aria-hidden': 'true' }),
            el('div', { class: 'dp-fila-texto' }, el('strong', {}, s.nombre, el('span', { class: 'dp-solo-lector', text: ` (${ROTULO_ESTADO[s.estado]})` })), el('span', { text: s.mensaje })),
            el('button', { type: 'button', class: 'dp-btn-texto', text: 'Ir al paso', onclick: () => irAPaso(PASO_DE_SECCION[s.id]) }))),
        el('div', { class: 'dp-aviso' }, el('strong', { text: C.AVISO_SEMAFORO_TITULO + '. ' }), C.AVISO_SEMAFORO),
        el('p', { class: 'dp-suave', text: C.NOTA_DESCARGA }),
        panelDiseno(),
        el('div', { class: 'dp-acciones' },
            el('button', { type: 'button', class: 'dp-btn', text: 'Ver mi CV', onclick: () => abrirPrevia() }),
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: 'Imprimir o guardar PDF', onclick: imprimir })),
        el('p', { class: 'dp-suave dpc-impresion', text: C.AYUDA_IMPRESION }),
        el('div', { class: 'dpc-tip' }, el('b', { text: '💡 Consejo profesional:' }), ' ' + C.CONSEJO_PROFESIONAL));
}

// ───────────── foto del CV: solo en este dispositivo ─────────────
// La foto NO se sube a SIGA ni a la cuenta: se guarda en este navegador (localStorage), ya recortada y reducida.
// En otro dispositivo hay que subirla de nuevo. Sin foto, la vista previa muestra una silueta y el PDF sale sin ella.
const CLAVE_FOTO = 'siga:cv:foto';
let fotoMemoria = null;                                  // respaldo por si el navegador no deja guardar (modo privado, sin espacio)
const FOTO_VALIDA = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
function leerFoto() {
    if (fotoMemoria) return fotoMemoria;
    try { const v = localStorage.getItem(CLAVE_FOTO); return FOTO_VALIDA.test(v || '') ? v : null; } catch (e) { return null; }
}
function guardarFoto(url) {
    fotoMemoria = url || null;
    try { if (url) localStorage.setItem(CLAVE_FOTO, url); else localStorage.removeItem(CLAVE_FOTO); return true; } catch (e) { return false; }
}

// Recorta al centro (cuadrada) y reduce a 400 px: se ve nítida en la hoja y pesa pocos KB.
function prepararFoto(archivo) {
    return new Promise((resolve, reject) => {
        if (!archivo || !/^image\//.test(archivo.type || '')) { reject(new Error('tipo')); return; }
        const url = URL.createObjectURL(archivo);
        const img = new Image();
        img.onload = () => {
            try {
                const lado = Math.min(img.naturalWidth, img.naturalHeight);
                if (!lado) throw new Error('vacia');
                const salida = Math.min(400, lado);
                const lienzo = document.createElement('canvas'); lienzo.width = salida; lienzo.height = salida;
                const ctx = lienzo.getContext('2d');
                ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, salida, salida);
                ctx.drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, salida, salida);
                resolve(lienzo.toDataURL('image/jpeg', 0.85));
            } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('lectura')); };
        img.src = url;
    });
}

let entradaFoto = null;
function elegirFoto() {
    if (!entradaFoto) {
        entradaFoto = el('input', { type: 'file', accept: 'image/*', hidden: true, 'aria-hidden': 'true', tabindex: '-1' });
        entradaFoto.addEventListener('change', async () => {
            const f = entradaFoto.files && entradaFoto.files[0];
            entradaFoto.value = '';
            if (!f) return;
            try {
                const url = await prepararFoto(f);
                if (!guardarFoto(url)) toast({ id: 'foto', texto: AVISO_FOTO_NO_GUARDADA });
            } catch (e) { toast({ id: 'foto', texto: AVISO_FOTO_ERROR }); return; }
            refrescarMemoria();
        });
        document.body.append(entradaFoto);
    }
    entradaFoto.click();
}
function quitarFoto() { guardarFoto(null); refrescarMemoria(); }

// ───────────── diseño, color y foto elegidos ─────────────
const ajustesCV = () => (cv && cv.ajustes) || {};
function cambiarAjuste(cambios) { D.guardarClave(CLAVE_AJUSTES, { ...ajustesCV(), ...cambios }); refrescarMemoria(); }

// Opciones de la hoja. En pantalla, sin foto se muestra una silueta (conEjemplo); en el PDF no.
function opcionesHoja(conEjemplo) {
    const dis = disenoDe(ajustesCV());
    const foto = leerFoto();
    return { diseno: dis.id, color: colorDe(ajustesCV(), dis), foto, ejemplo: conEjemplo && !foto };
}
function configurarHoja(a4, op, params) {
    a4.dataset.diseno = op.diseno;
    for (const [k, v] of Object.entries(variablesHoja(op.color, params))) a4.style.setProperty(k, v);
}

function panelDiseno() {
    const dis = disenoDe(ajustesCV());
    const color = colorDe(ajustesCV(), dis);
    const foto = leerFoto();
    const muestra = (id, c) => {
        const b = el('button', { type: 'button', class: 'dpc-color', 'aria-label': c.nombre, 'aria-pressed': id === color ? 'true' : 'false', title: c.nombre, onclick: () => cambiarAjuste({ color: id }) });
        b.style.setProperty('--c', c.ac);
        return b;
    };
    return el('div', { class: 'dpc-diseno' },
        el('h3', { class: 'dpc-diseno-t', text: 'Diseño de tu CV' }),
        el('div', { class: 'dpc-disenos', role: 'group', 'aria-label': 'Diseño del CV' }, DISENOS.map((d) => el('button', {
            type: 'button', class: 'dpc-diseno-op', 'aria-pressed': d.id === dis.id ? 'true' : 'false', onclick: () => cambiarAjuste({ diseno: d.id }),
        }, el('strong', { text: d.nombre }), el('span', { text: d.descripcion })))),
        el('div', { class: 'dpc-fila-op' },
            el('span', { class: 'dpc-fila-et', text: 'Color' }),
            el('div', { class: 'dpc-colores', role: 'group', 'aria-label': 'Color de acento' }, Object.entries(COLORES).map(([id, c]) => muestra(id, c)))),
        el('div', { class: 'dpc-fila-op' },
            el('span', { class: 'dpc-fila-et', text: 'Foto' }),
            el('div', { class: 'dpc-foto-acc' },
                el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: foto ? 'Cambiar foto' : 'Subir foto', onclick: elegirFoto }),
                foto ? el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Quitar foto', onclick: quitarFoto }) : null)),
        el('p', { class: 'dp-suave', text: foto ? NOTA_FOTO : (dis.id === 'creativo' ? NOTA_FOTO_MONOGRAMA : NOTA_FOTO_SILUETA) }),
        el('p', { class: 'dp-suave', text: dis.nota }));
}

// ───────────── hoja A4: vista previa lateral, vista previa grande, medición e impresión ─────────────
function pintarHojas() {
    medirAjuste();                                         // primero se mide: de ahí sale cuánto se compacta
    const op = opcionesHoja(true);
    const html = htmlHoja(cv, op);
    for (const a4 of $$('.dp-a4')) {
        if (a4.closest('#dpHojaImpresion') || a4.closest('#dpMedida')) continue;
        configurarHoja(a4, op, ajusteActual.params);
        $('.dp-a4-in', a4).innerHTML = html;
    }
    $$('[data-nota-diseno]').forEach((n) => { n.textContent = disenoDe(ajustesCV()).nota; });
    escalar();
}

function escalar() {
    for (const wrap of $$('.dp-a4-wrap')) {
        const a4 = $('.dp-a4', wrap);
        if (!a4 || !wrap.clientWidth) continue;
        const s = wrap.clientWidth / a4.offsetWidth;
        a4.style.transform = `scale(${s})`;
        wrap.style.height = `${Math.ceil(a4.offsetHeight * s)}px`;
    }
}

let ajusteActual = { pct: 0, cabe: true, params: { ...PARAMS_BASE }, diseno: 'profesional' };
function medirAjuste() {
    const medida = $('#dpMedida'); const sonda = $('#dpSonda');
    if (!medida || !sonda) return;
    const op = opcionesHoja(true);
    const a4 = $('.dp-a4', medida); const dentro = $('.dp-a4-in', a4);
    configurarHoja(a4, op, PARAMS_BASE);
    dentro.innerHTML = htmlHoja(cv, op);
    // Alto útil: Moderno usa la hoja entera (297 mm); Creativo, un milímetro menos (evita una segunda hoja en blanco); Profesional deja 14 mm de margen abajo.
    sonda.style.height = op.diseno === 'moderno' ? '297mm' : op.diseno === 'creativo' ? '296mm' : 'calc(297mm - 14mm)';
    ajusteActual = { ...ajustarAUnaHoja({ a4, dentro, disponible: sonda.offsetHeight }), diseno: op.diseno };
    // Mientras cabe en una hoja no se muestra nada (un % bajo desanima a quien recién empieza); solo se avisa si se pasa.
    const aviso = disenoDe(ajustesCV()).unaHoja ? AVISO_UNA_HOJA
        : 'Tu CV supera una página. Revisa si puedes resumir algunas descripciones o eliminar información secundaria. Recuerda que dos páginas también son aceptables si el contenido lo justifica.';
    $$('[data-ajuste]').forEach((n) => {
        n.className = ajusteActual.cabe ? '' : 'dp-ajuste dp-ajuste-largo';
        n.replaceChildren(...(ajusteActual.cabe ? [] : [el('strong', { text: '💡 Revisa la extensión: ' }), aviso]));
    });
}

// El navegador usa el título de la página como nombre del PDF. Se cambia solo mientras se imprime y luego se restaura.
let tituloOriginal = null;
function nombreArchivoCV(nombre) {
    const limpio = String(nombre || '')
        .replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ')      // caracteres que los sistemas de archivos no admiten
        .replace(/\s+/g, ' ').trim().slice(0, 60)
        .replace(/[. ]+$/, '');                           // Windows no admite puntos ni espacios al final
    return limpio ? `CV - ${limpio}` : 'CV';
}

function imprimir() {
    flushTodo();
    cv = D.leerCV();
    medirAjuste();                                        // con los datos recién leídos
    if (tituloOriginal === null) tituloOriginal = document.title;
    document.title = nombreArchivoCV((cv.datos || {}).nombre);
    const op = opcionesHoja(false);                       // sin foto, la silueta NO sale en el PDF
    const interior = `<div class="dp-a4-in">${htmlHoja(cv, op)}</div>`;
    // Profesional: una tabla con cabecera y pie vacíos que se repiten en cada hoja = margen arriba y abajo también en la segunda hoja.
    const cuerpo = op.diseno === 'profesional'
        ? `<table class="cv-tabla"><thead><tr><td><div class="cv-esp"></div></td></tr></thead><tbody><tr><td>${interior}</td></tr></tbody><tfoot><tr><td><div class="cv-esp"></div></td></tr></tfoot></table>`
        : interior;
    const hoja = el('div', { class: 'dp-a4 dp-impresion' });
    configurarHoja(hoja, op, ajusteActual.params);
    hoja.innerHTML = cuerpo;
    $('#dpHojaImpresion').replaceChildren(hoja);
    window.print();
}
window.addEventListener('afterprint', () => {
    const h = $('#dpHojaImpresion'); if (h) h.innerHTML = '';
    if (tituloOriginal !== null) { document.title = tituloOriginal; tituloOriginal = null; }
});

// ───────────── pasos, estructura y navegación ─────────────
function dibujarPasos() {
    const r = evaluarCV(cv);
    const estado = Object.fromEntries(r.secciones.map((s) => [s.id, s.estado]));
    $('#dpPasos').replaceChildren(...C.PASOS.map((p, i) => el('button', {
        type: 'button', class: `dp-paso${i === paso ? ' dp-paso-activo' : ''}`, 'aria-current': i === paso ? 'step' : null, onclick: () => irAPaso(i),
    }, el('span', { class: `dp-punto dp-${SECCION_DE_PASO[p.id] ? estado[SECCION_DE_PASO[p.id]] : 'rev'}` }), el('span', { class: 'dp-paso-n', text: String(i + 1) }), el('span', { class: 'dp-paso-t', text: p.titulo }))));
    pintarAvance(estado);
    mostrarPasoActivo();
}

// Barra de pasos con flechas < > (como la de Asesorías): las flechas solo aparecen si hay pasos que no caben.
let ultimoPasoVisto = -1;
function actualizarFlechas() {
    const nav = $('#dpPasos'), izq = $('.dpc-flecha-izq'), der = $('.dpc-flecha-der');
    if (!nav || !izq || !der) return;
    const resto = nav.scrollWidth - nav.clientWidth;
    izq.hidden = resto <= 2 || nav.scrollLeft <= 2;
    der.hidden = resto <= 2 || nav.scrollLeft >= resto - 2;
}
function mostrarPasoActivo() {
    const nav = $('#dpPasos');
    if (!nav) return;
    const act = $('.dp-paso-activo', nav);
    if (act && ultimoPasoVisto !== paso) {                                   // solo al CAMBIAR de paso: no pelea con quien desliza a mano
        const primera = ultimoPasoVisto === -1;
        ultimoPasoVisto = paso;
        nav.scrollTo({ left: Math.max(0, act.offsetLeft - (nav.clientWidth - act.offsetWidth) / 2), behavior: primera ? 'auto' : 'smooth' });
    }
    actualizarFlechas();
}
function enlazarFlechas() {
    const nav = $('#dpPasos');
    const mover = (signo) => nav.scrollBy({ left: signo * Math.max(160, nav.clientWidth * 0.7), behavior: 'smooth' });
    $('.dpc-flecha-izq').addEventListener('click', () => mover(-1));
    $('.dpc-flecha-der').addEventListener('click', () => mover(1));
    nav.addEventListener('scroll', actualizarFlechas, { passive: true });
    window.addEventListener('resize', actualizarFlechas);
}

// Barra de avance del panel: un segmento por paso (verde = listo, naranja = el paso actual) y el mensaje de "completado" solo si es verdad.
function pintarAvance(estado) {
    const idActual = C.PASOS[paso].id;
    $$('.dpc-seg i').forEach((seg, i) => {
        const sec = SECCION_DE_PASO[C.PASOS[i].id];
        seg.className = `${i === paso ? 'act' : ''} ${sec && estado[sec] === 'verde' ? 'ok' : ''}`.trim();
    });
    const listo = $('[data-listo]');
    if (!listo) return;
    const msg = SECCION_DE_PASO[idActual] && estado[SECCION_DE_PASO[idActual]] === 'verde' ? C.COMPLETADO[idActual] : '';
    listo.hidden = !msg;
    listo.textContent = msg ? `✓ ${msg}` : '';
}

function dibujarPaso() {
    const p = C.PASOS[paso];
    const cuerpo = { datos: pasoDatos, formacion: pasoFormacion, proyectos: pasoProyectos, habilidades: pasoHabilidades, certificaciones: pasoCertificaciones, logros: pasoLogros, experiencia: pasoExperiencia, perfil: pasoPerfil, revision: pasoRevision }[p.id]();
    const nav = el('div', { class: 'dp-nav' },
        paso > 0 ? el('button', { type: 'button', class: 'dp-btn', text: 'Anterior', onclick: () => irAPaso(paso - 1) }) : null,
        paso < C.PASOS.length - 1 ? el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: paso === C.PASOS.length - 2 ? 'Revisar con el semáforo' : 'Siguiente', onclick: () => irAPaso(paso + 1) }) : null,
        el('button', { type: 'button', class: 'dp-btn dp-solo-cel', text: 'Ver vista previa', onclick: () => abrirPrevia() }));
    $('#dpPanel').replaceChildren(
        el('div', { class: 'dpc-avance' },
            el('div', { class: 'dpc-seg', 'aria-hidden': 'true' }, ...C.PASOS.map(() => el('i'))),
            el('span', { text: `Paso ${paso + 1} de ${C.PASOS.length} · ${C.ETAPAS[p.id] || ''}` })),
        el('h2', { class: 'dp-paso-titulo' }, `${paso + 1}. ${p.titulo}`),
        // replaceChildren es del navegador (no de el()): un null se escribiría como el texto «null», por eso se usa ...[].
        ...(p.etiquetaPaso ? [el('span', { class: 'dpc-recomendado', text: p.etiquetaPaso })] : []),
        el('p', { class: 'dp-suave', text: p.porQue }),
        el('div', { class: 'dpc-listo', 'data-listo': '', hidden: true, role: 'status' }),
        cuerpo,
        ...(p.consejo ? [el('div', { class: 'dp-consejo' }, el('strong', { text: 'Consejo: ' }), p.consejo)] : []),
        nav);
    dibujarPasos();
    pintarHojas();
}

function irAPaso(i) {
    flushTodo();
    paso = Math.max(0, Math.min(C.PASOS.length - 1, i));
    modo = 'constructor';
    history.replaceState(null, '', '#' + C.PASOS[paso].id);
    mostrarModo();
    dibujarPaso();
    const h = $('#dpPanel .dp-paso-titulo'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    window.scrollTo({ top: $('#dpApp').offsetTop - 80, behavior: 'smooth' });
}

function abrirPrevia() {
    flushTodo(); cv = D.leerCV();
    modo = 'previa'; history.replaceState(null, '', '#previa');
    mostrarModo(); pintarHojas();
    window.scrollTo({ top: $('#dpApp').offsetTop - 80, behavior: 'smooth' });
}

function mostrarModo() {
    $('#dpConstructor').hidden = modo !== 'constructor';
    $('#dpPrevia').hidden = modo !== 'previa';
    escalar();
}

// ───────────── cambios de datos: propios y de otros dispositivos ─────────────
function refrescarMemoria() {
    cv = D.leerCV();
    clearTimeout(refrescarMemoria.t);
    refrescarMemoria.t = setTimeout(() => { $$('[data-previa]').forEach((n) => n._pintar && n._pintar()); dibujarPasos(); pintarHojas(); const r = $('[data-revision]'); if (r) pintarRevision(r); }, 120);
}

// Llega algo de otro dispositivo: se actualiza lo que se ve SIN reconstruir el formulario.
function conciliar() {
    const id = C.PASOS[paso].id;
    if (id === 'datos' || id === 'formacion' || id === 'perfil') sincronizarCampos($('#dpPanel'));
    else if (TIPO_DE_PASO[id]) { reconciliarLista(TIPO_DE_PASO[id]); if (id === 'experiencia') sincronizarCampos($('#dpPanel')); }
    else if (id === 'habilidades') pintarChips();
    else if (id === 'revision') { const r = $('[data-revision]'); if (r) pintarRevision(r); }
}

// ───────────── arranque ─────────────
function armar() {
    $('#dpApp').replaceChildren(
        el('div', { class: 'dpc-pasos-wrap' },
            el('button', { type: 'button', class: 'dpc-flecha dpc-flecha-izq', 'aria-label': 'Ver pasos anteriores', hidden: true, text: '‹' }),
            el('nav', { id: 'dpPasos', class: 'dp-pasos', 'aria-label': 'Pasos del CV' }),
            el('button', { type: 'button', class: 'dpc-flecha dpc-flecha-der', 'aria-label': 'Ver más pasos', hidden: true, text: '›' })),
        el('div', { id: 'dpConstructor', class: 'dp-constructor' },
            el('section', { id: 'dpPanel', class: 'dp-panel' }),
            el('aside', { class: 'dp-lateral', 'aria-label': 'Vista previa de tu CV' },
                el('div', { class: 'dpc-pega', 'aria-hidden': 'true', text: 'TU PERFIL, LISTO PARA MOSTRAR' }),
                el('div', { class: 'dp-lateral-cab' }, el('strong', { text: 'Vista previa' }), el('span', { class: 'dp-suave', text: ' · hoja A4' })),
                el('div', { class: 'dp-a4-wrap' }, el('div', { class: 'dp-a4' }, el('div', { class: 'dp-a4-in' }))),
                el('p', { 'data-ajuste': '' }),
                el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Ver más grande', onclick: () => abrirPrevia() }))),
        el('div', { id: 'dpPrevia', class: 'dp-previa', hidden: true },
            el('div', { class: 'dp-previa-barra' },
                el('button', { type: 'button', class: 'dp-btn', text: '← Volver al constructor', onclick: () => irAPaso(paso) }),
                el('span', { 'data-ajuste': '' }),
                el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: 'Imprimir o guardar PDF', onclick: imprimir })),
            el('div', { class: 'dp-a4-wrap dp-a4-grande' }, el('div', { class: 'dp-a4' }, el('div', { class: 'dp-a4-in' }))),
            el('p', { class: 'dp-suave', text: C.AYUDA_IMPRESION }),
            el('p', { class: 'dp-suave', 'data-nota-diseno': '' })),
        // Medición de la página (fuera de pantalla): cuánto ocupa el CV frente al alto útil de un A4.
        el('div', { id: 'dpMedida', class: 'dp-medida', 'aria-hidden': 'true' }, el('div', { class: 'dp-a4' }, el('div', { class: 'dp-a4-in' })), el('div', { id: 'dpSonda', class: 'dp-sonda' })));
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => escalar()); $$('.dp-a4-wrap').forEach((w) => ro.observe(w)); }
    window.addEventListener('resize', escalar);
    enlazarFlechas();
}

function leerHash() {
    const h = location.hash.replace('#', '');
    if (h === 'previa') { modo = 'previa'; return; }
    const i = C.PASOS.findIndex((p) => p.id === h);
    if (i >= 0) paso = i;
}

async function iniciar() {
    if (!(await accesoPermitido())) return;
    const app = $('#dpApp');
    app.replaceChildren(el('p', { class: 'dp-cargando', text: 'Cargando tu CV…' }));
    const listo = await Promise.race([SigaEstado.listo.then(() => true), new Promise((r) => setTimeout(() => r(false), 10000))]);
    if (!listo) {
        app.replaceChildren(el('div', { class: 'dp-panel' }, el('p', { text: 'No pudimos cargar tu cuenta. Revisa tu conexión e inténtalo de nuevo.' }),
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: 'Reintentar', onclick: () => location.reload() })));
        return;
    }
    cv = D.leerCV();
    armar(); leerHash(); mostrarModo(); dibujarPaso();
    if (modo === 'previa') abrirPrevia();

    D.alCambiar(() => { cv = D.leerCV(); conciliar(); dibujarPasos(); pintarHojas(); });
    D.alConflicto((ev) => {
        toast({
            id: 'conflicto', texto: C.AVISO_CONFLICTO,
            boton: ev.tieneMia ? 'Recuperar la mía' : null,
            alBoton: () => { D.recuperarMia(ev.clave); refrescarMemoria(); conciliar(); },
        });
    });

    // Si guardar falla de forma sostenida, se avisa; si todo va bien, nunca se muestra nada.
    let fallos = 0;
    setInterval(() => {
        if (D.estadoSync() === 'error') { fallos += 1; if (fallos >= 2) toast({ id: 'error', texto: C.AVISO_ERROR_GUARDADO, persistente: true }); }
        else { fallos = 0; quitarToast('error'); }
    }, 5000);

    const subir = () => { flushTodo(); D.sincronizar(); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') subir(); });
    window.addEventListener('pagehide', subir);
}

iniciar();
