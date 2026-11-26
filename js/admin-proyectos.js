// js/admin-proyectos.js — Pestaña «Proyectos» del Admin (propuestas de Proyectos Prácticos).
//
// Flujo (Harry + Claude):
//   1) Una persona propone una idea en «Proyectos Prácticos» → queda como «pendiente» en public.proyectos_ideas.
//   2) Aquí ves la propuesta y tocas «Copiar para Claude»: copia la idea en un texto listo para pegar en el chat.
//   3) Claude devuelve la ficha completa (JSON). La pegas en la caja de abajo, se revisa y se publica.
//   La caja de abajo también sirve para agregar tus propias ideas o corregir una ya publicada (mismo id = se actualiza).
//
// Se carga desde admin.js, igual que admin-faq.js:
//     import { iniciarProyectosAdmin } from './admin-proyectos.js?v=1';
//     iniciarProyectosAdmin({ confirmarAccion });
//
// La seguridad real está en las políticas RLS de Supabase (solo el correo de Harry escribe); esto es solo la pantalla.
import { supabase } from './auth-siga.js?v=9';
import { AREAS, INTENCIONES, FUENTES } from './proyectos-datos.js?v=5';

const $ = (id) => document.getElementById(id);

const IDS_AREA = AREAS.map((a) => a.id);
const IDS_INTENCION = INTENCIONES.map((i) => i.id);
const TIPOS_PROG = ['sin', 'opcional', 'incluida'];
const MAX_FICHA = 12000;   // mismo tope que la tabla para las ideas de usuarios

let ayuda = { confirmarAccion: null };
let panel = null;
let tabBtn = null;
let filas = [];                 // propuestas de usuarios (origen = 'usuario')
let perfiles = new Map();       // user_id → { nombre } | null si no se pudo consultar
let perfilesOk = true;
let filtro = 'pendiente';       // 'pendiente' | 'rechazada' | 'publicada'
let fichaRevisada = null;       // { idea, destino } cuando la ficha pegada pasó la revisión

// ───────────── Utilidades ─────────────
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const norm = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const fecha = (iso) => (iso
    ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '');

const area = (id) => AREAS.find((a) => a.id === id);
const nombreArea = (id) => (area(id) ? area(id).nombre : id);

async function confirmar(mensaje, opciones) {
    if (typeof ayuda.confirmarAccion === 'function') return ayuda.confirmarAccion(mensaje, opciones);
    return window.confirm(mensaje);
}

function msg(id, texto, tipo = 'exito') {
    const m = $(id);
    if (!m) return;
    m.textContent = texto;
    m.className = texto ? `admin-msg ${tipo}` : 'admin-msg';
}

async function copiar(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch (e) {
        const t = document.createElement('textarea');
        t.value = texto;
        t.style.position = 'fixed';
        t.style.opacity = '0';
        document.body.appendChild(t);
        t.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        t.remove();
        return ok;
    }
}

function pintarGlobito(n) {
    if (!tabBtn) return;
    let g = tabBtn.querySelector('.admin-tab-globito');
    if (!n) { if (g) g.remove(); return; }
    if (!g) {
        g = document.createElement('span');
        g.className = 'admin-tab-globito';
        tabBtn.appendChild(g);
    }
    g.textContent = n > 99 ? '99+' : String(n);
}

// ───────────── Datos ─────────────
async function cargar() {
    const lista = $('ppaLista');
    const { data, error } = await supabase
        .from('proyectos_ideas')
        .select('id, area, areas2, titulo, resumen, tipo, tiempo, datos, prog, ficha, estado, autor_id, mostrar_autor, creado_en, motivo_rechazo')
        .eq('origen', 'usuario')
        .order('creado_en', { ascending: false })
        .limit(500);
    if (error) {
        console.error('Propuestas de proyectos:', error);
        const falta = error.code === '42703' || /motivo_rechazo/.test(error.message || '');
        lista.innerHTML = falta
            ? '<p class="da-vacio">Falta correr en Supabase la migración <b>20261125230000_proyectos_ideas_motivo_rechazo.sql</b> (agrega la columna del motivo de rechazo).</p>'
            : '<p class="da-vacio">No se pudieron cargar las propuestas. Revisa tu conexión.</p>';
        return;
    }
    filas = data || [];

    // Nombre del perfil de cada autor (para saber si podemos mostrarlo).
    perfiles = new Map();
    perfilesOk = true;
    const ids = [...new Set(filas.map((f) => f.autor_id).filter(Boolean))];
    if (ids.length) {
        const { data: ps, error: ep } = await supabase.from('perfiles_usuario').select('user_id, nombre').in('user_id', ids);
        if (ep) { perfilesOk = false; console.warn('Perfiles de autores:', ep); }
        (ps || []).forEach((p) => perfiles.set(p.user_id, p));
    }
    pintar();
}

const cuenta = (estado) => filas.filter((f) => f.estado === estado).length;

function textoAutor(f) {
    if (!perfilesOk) return 'no pude consultar su perfil';
    const p = perfiles.get(f.autor_id);
    const nombre = p && String(p.nombre || '').trim();
    return nombre || 'sin nombre en su perfil';
}

function avisos(f) {
    const out = [];
    if (!perfilesOk) return out;
    const p = perfiles.get(f.autor_id);
    const tieneNombre = !!(p && String(p.nombre || '').trim());
    if (f.mostrar_autor && !tieneNombre) out.push('Pidió mostrar su nombre, pero no lo tiene en el perfil: saldría como anónima.');
    const primero = (f.ficha && Array.isArray(f.ficha.desarrollar)) ? f.ficha.desarrollar.filter((x) => typeof x === 'string' && x.trim()) : [];
    if (!primero.length) out.push('No escribió «¿Qué harías primero?»: lo armamos al completar la ficha.');
    return out;
}

// ───────────── Pantalla ─────────────
function pintarCabecera() {
    const p = cuenta('pendiente');
    const r = cuenta('rechazada');
    const pu = cuenta('publicada');
    $('ppaResumen').textContent = filas.length
        ? `${p} ${p === 1 ? 'pendiente' : 'pendientes'} · ${pu} ${pu === 1 ? 'publicada' : 'publicadas'} · ${r} ${r === 1 ? 'rechazada' : 'rechazadas'}`
        : 'Todavía no hay propuestas de usuarios.';
    panel.querySelectorAll('.ppa-filtro').forEach((b) => {
        const e = b.dataset.estado;
        b.classList.toggle('activo', e === filtro);
        const n = cuenta(e);
        b.querySelector('.ppa-n').textContent = String(n);
    });
    pintarGlobito(p);
}

function chipsArea(f) {
    const a = area(f.area);
    const principal = `<span class="ppa-chip" style="background:${a ? a.f : '#eee'};color:${a ? a.c : '#333'}">${esc(a ? a.corto : f.area)}</span>`;
    const cruces = (f.areas2 || []).map((id) => {
        const x = area(id);
        return `<span class="ppa-chip ppa-chip-cruce" title="Se cruza con">↔ ${esc(x ? x.corto : id)}</span>`;
    }).join('');
    return principal + cruces;
}

function itemHTML(f) {
    const ficha = f.ficha || {};
    const primero = Array.isArray(ficha.desarrollar) ? ficha.desarrollar.filter((x) => typeof x === 'string' && x.trim()) : [];
    const elegidos = [
        f.tipo && f.tipo !== 'Por definir' ? `Tipo: ${f.tipo}` : '',
        f.tiempo && f.tiempo !== 'Por definir' ? `Tiempo: ${f.tiempo}` : '',
        f.datos ? `Datos: ${(FUENTES[f.datos] || {}).corto || f.datos}` : '',
        f.prog ? `Programación: ${f.prog}` : '',
    ].filter(Boolean);

    const avisosHTML = f.estado === 'pendiente'
        ? avisos(f).map((a) => `<p class="ppa-aviso">⚠️ ${esc(a)}</p>`).join('')
        : '';

    let acciones = '';
    if (f.estado === 'pendiente') {
        acciones = `
            <button type="button" class="da-ok" data-ppa="copiar">Copiar para Claude</button>
            <button type="button" class="da-btn ppa-rechazar" data-ppa="rechazar">Rechazar</button>`;
    } else if (f.estado === 'rechazada') {
        acciones = `
            <button type="button" class="da-btn" data-ppa="reabrir">Volver a pendientes</button>
            <button type="button" class="da-btn ppa-rechazar" data-ppa="eliminar">Eliminar</button>`;
    } else {
        acciones = '<button type="button" class="da-btn" data-ppa="copiar-ficha">Copiar ficha publicada</button>';
    }

    return `
        <div class="admin-item ppa-item" data-id="${esc(f.id)}">
            <div class="ppa-chips">${chipsArea(f)}</div>
            <p class="ppa-titulo">${esc(f.titulo)}</p>
            <p class="ppa-meta">Enviada el ${esc(fecha(f.creado_en))} · Autor: ${esc(textoAutor(f))} · ${f.mostrar_autor ? 'Aceptó mostrar su nombre' : 'Prefiere quedar anónima'}</p>
            ${avisosHTML}
            ${f.estado === 'publicada' ? '' : `
            <p class="ppa-etiqueta">Problema que describió</p>
            <p class="ppa-texto">${esc(f.resumen)}</p>
            <p class="ppa-etiqueta">¿Qué haría primero?</p>
            <p class="ppa-texto">${primero.length ? esc(primero.join('\n')) : '<i>No lo escribió.</i>'}</p>
            ${elegidos.length ? `<p class="ppa-meta">${esc(elegidos.join(' · '))}</p>` : ''}`}
            ${f.estado === 'rechazada' && f.motivo_rechazo ? `<p class="ppa-meta"><b>Motivo del rechazo:</b> ${esc(f.motivo_rechazo)}</p>` : ''}
            <div class="ppa-acciones">${acciones}</div>
            <div class="ppa-rechazo" hidden>
                <label class="admin-form-campo">
                    <span>Motivo (opcional, máx. 300 caracteres; por ahora solo lo guardas tú)</span>
                    <textarea rows="2" maxlength="300" class="ppa-motivo" placeholder="Ej. Ya existe una idea muy parecida…"></textarea>
                </label>
                <div class="ppa-acciones">
                    <button type="button" class="da-btn ppa-rechazar" data-ppa="rechazar-ok">Confirmar rechazo</button>
                    <button type="button" class="da-btn" data-ppa="rechazar-no">Cancelar</button>
                </div>
            </div>
        </div>`;
}

function pintar() {
    pintarCabecera();
    const lista = $('ppaLista');
    const visibles = filas.filter((f) => f.estado === filtro);
    if (!visibles.length) {
        const vacio = {
            pendiente: 'No hay propuestas pendientes. Cuando alguien envíe una, aparecerá aquí.',
            rechazada: 'No hay propuestas rechazadas.',
            publicada: 'Todavía no se ha publicado ninguna propuesta de usuarios.',
        }[filtro];
        lista.innerHTML = `<p class="da-vacio">${vacio}</p>`;
        return;
    }
    lista.innerHTML = visibles.map(itemHTML).join('');
}

// ───────────── «Copiar para Claude» ─────────────
const CAMPOS_FICHA = 'id, area, areas2, titulo, resumen, tipo, tiempo, horas, etiquetas, intencion, datos, datosTexto, prog, progTexto, carreras, problema, desarrollar, ampliaciones (máx. 3: { titulo, aporta }), objetivos, habilidades, herramientas, lineamientos, otroSector';

function textoParaClaude(f) {
    const ficha = f.ficha || {};
    const primero = Array.isArray(ficha.desarrollar) ? ficha.desarrollar.filter((x) => typeof x === 'string' && x.trim()) : [];
    const cruces = (f.areas2 || []).map(nombreArea).join(', ');
    const base = {
        id: f.id,
        area: f.area,
        areas2: f.areas2 || [],
        titulo: f.titulo,
        resumen: f.resumen,
        tipo: f.tipo || 'Por definir',
        tiempo: f.tiempo || 'Por definir',
        horas: typeof f.horas === 'number' ? f.horas : 15,
        datos: f.datos || 'ficticios',
        prog: f.prog || null,
        problema: Array.isArray(ficha.problema) ? ficha.problema : [f.resumen],
        desarrollar: primero,
    };
    return [
        'Completa esta propuesta de Proyectos Prácticos de SIGA con el mismo nivel y formato que las demás fichas del catálogo.',
        'Devuélveme SOLO el JSON de la ficha completa, con el mismo id, listo para pegar en Admin → Proyectos.',
        '',
        'Reglas: el alcance inicial (`desarrollar`) debe bastarse solo y poder hacerse sin permiso de terceros; las ampliaciones (máx. 3) nunca lo corrigen. Respeta la idea de la persona; mejora la redacción y complétala.',
        `Campos de la ficha: ${CAMPOS_FICHA}.`,
        '',
        `Propuesta de un estudiante (enviada el ${fecha(f.creado_en)}):`,
        `- Título: ${f.titulo}`,
        `- Área principal: ${nombreArea(f.area)} (${f.area})`,
        `- Se cruza con: ${cruces || 'ninguna'}`,
        `- Autor: ${textoAutor(f)} (${f.mostrar_autor ? 'acepta mostrar su nombre' : 'prefiere quedar anónimo'})`,
        `- Problema que describió: ${f.resumen}`,
        `- Qué haría primero: ${primero.length ? primero.join(' ') : '(no lo escribió: propón tú el alcance inicial)'}`,
        '',
        'Datos que dejó la propuesta (JSON de partida):',
        '```json',
        JSON.stringify(base, null, 2),
        '```',
    ].join('\n');
}

// ───────────── Acciones sobre una propuesta ─────────────
async function actualizarEstado(f, cambios, errorTexto) {
    const { data, error } = await supabase
        .from('proyectos_ideas').update(cambios).eq('id', f.id).eq('origen', 'usuario').select('id');
    if (error || !data || !data.length) {
        console.error('Propuesta:', error);
        alert(errorTexto);
        return false;
    }
    return true;
}

async function eliminar(f, btn) {
    const ok = await confirmar(`Se eliminará para siempre: "${f.titulo}"`, {
        titulo: '¿Eliminar esta propuesta?', textoBoton: 'Sí, eliminar',
    });
    if (!ok) return;
    btn.disabled = true;
    const { data, error } = await supabase
        .from('proyectos_ideas').delete().eq('id', f.id).eq('origen', 'usuario').select('id');
    if (error || !data || !data.length) {
        btn.disabled = false;
        console.error('Eliminar propuesta:', error);
        alert('No se pudo eliminar. Inténtalo de nuevo.');
        return;
    }
    await cargar();
}

async function alClicLista(e) {
    const btn = e.target.closest('[data-ppa]');
    if (!btn) return;
    const item = btn.closest('.ppa-item');
    const f = filas.find((x) => x.id === item.dataset.id);
    if (!f) return;
    const accion = btn.dataset.ppa;

    if (accion === 'copiar') {
        const ok = await copiar(textoParaClaude(f));
        const original = btn.textContent;
        btn.textContent = ok ? '¡Copiado! Pégalo en el chat' : 'No se pudo copiar';
        setTimeout(() => { btn.textContent = original; }, 2400);
    } else if (accion === 'copiar-ficha') {
        const ok = await copiar(JSON.stringify(f.ficha || {}, null, 2));
        const original = btn.textContent;
        btn.textContent = ok ? '¡Copiada!' : 'No se pudo copiar';
        setTimeout(() => { btn.textContent = original; }, 2400);
    } else if (accion === 'rechazar') {
        item.querySelector('.ppa-rechazo').hidden = false;
        item.querySelector('.ppa-motivo').focus();
    } else if (accion === 'rechazar-no') {
        item.querySelector('.ppa-rechazo').hidden = true;
    } else if (accion === 'rechazar-ok') {
        const motivo = item.querySelector('.ppa-motivo').value.trim().slice(0, 300);
        btn.disabled = true;
        const ok = await actualizarEstado(f, { estado: 'rechazada', motivo_rechazo: motivo || null }, 'No se pudo rechazar. ¿Ya corriste la migración del motivo de rechazo en Supabase?');
        btn.disabled = false;
        if (ok) await cargar();
    } else if (accion === 'reabrir') {
        btn.disabled = true;
        const ok = await actualizarEstado(f, { estado: 'pendiente', motivo_rechazo: null }, 'No se pudo volver a pendientes.');
        btn.disabled = false;
        if (ok) await cargar();
    } else if (accion === 'eliminar') {
        eliminar(f, btn);
    }
}

// ───────────── Revisar y publicar una ficha pegada ─────────────
function textoLimpio(t) {
    // Acepta el JSON pegado con o sin cercas de código (```json … ```).
    let s = String(t || '').trim();
    s = s.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '');
    return s.trim();
}

const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;
const listaDeTextos = (v) => Array.isArray(v) && v.length > 0 && v.every((x) => esTexto(x));

function validarFicha(i) {
    const errores = [];
    const avisos = [];
    if (!i || typeof i !== 'object' || Array.isArray(i)) return { errores: ['Pega UNA ficha: un objeto JSON que empiece con { y termine con }.'], avisos };

    for (const c of ['id', 'titulo', 'resumen', 'tipo', 'tiempo']) if (!esTexto(i[c])) errores.push(`Falta «${c}».`);
    if (typeof i.horas !== 'number' || !Number.isFinite(i.horas) || i.horas <= 0) errores.push('«horas» debe ser un número (se usa oculto para ordenar y para el cuestionario).');
    if (esTexto(i.id)) {
        if (!/^[a-z0-9-]+$/.test(i.id)) errores.push('El id solo puede tener minúsculas, números y guiones.');
        if (i.id.length > 80) errores.push('El id es demasiado largo (máx. 80).');
    }
    if (esTexto(i.titulo) && (i.titulo.trim().length < 5 || i.titulo.length > 300)) errores.push('El título debe tener entre 5 y 300 caracteres.');
    if (esTexto(i.resumen) && i.resumen.length > 700) errores.push('El resumen pasa de 700 caracteres.');

    if (!IDS_AREA.includes(i.area)) errores.push(`«area» no existe (${i.area ?? 'vacía'}). Opciones: ${IDS_AREA.join(', ')}.`);
    const a2 = i.areas2 === undefined ? [] : i.areas2;
    if (!Array.isArray(a2)) errores.push('«areas2» debe ser una lista.');
    else {
        if (a2.length > 2) errores.push('«areas2»: máximo 2 áreas.');
        a2.forEach((x) => {
            if (!IDS_AREA.includes(x)) errores.push(`«areas2» tiene un área que no existe (${x}).`);
            if (x === i.area) errores.push('«areas2» no debe repetir el área principal.');
        });
    }

    if (!Object.keys(FUENTES).includes(i.datos)) errores.push('«datos» debe ser ficticios, publicos o propios.');
    if (i.prog !== undefined && i.prog !== null && !TIPOS_PROG.includes(i.prog)) errores.push('«prog» debe ser sin, opcional o incluida.');
    const intenciones = i.intencion === undefined ? [] : i.intencion;
    if (!Array.isArray(intenciones)) errores.push('«intencion» debe ser una lista.');
    else {
        if (!intenciones.length) errores.push('Falta «intencion» (crear, resolver, investigar u otro-sector).');
        intenciones.forEach((x) => { if (!IDS_INTENCION.includes(x)) errores.push(`Intención desconocida (${x}).`); });
    }
    if (!Array.isArray(i.etiquetas) || !i.etiquetas.length) errores.push('Faltan las «etiquetas».');

    // Las partes de una ficha completa: sin ellas no está al nivel de las demás.
    if (!esTexto(i.datosTexto)) errores.push('Falta «datosTexto».');
    if (i.prog && !esTexto(i.progTexto)) errores.push('Falta «progTexto».');
    for (const c of ['carreras', 'objetivos', 'habilidades', 'herramientas', 'lineamientos']) {
        if (!listaDeTextos(i[c])) errores.push(`Falta «${c}» (una lista de textos).`);
    }
    for (const c of ['problema', 'desarrollar']) {
        const v = i[c];
        const ok = Array.isArray(v) && v.length > 0 && v.every((p) => esTexto(p) || (p && typeof p === 'object' && listaDeTextos(p.lista)));
        if (!ok) errores.push(`Falta «${c}» (lista de párrafos; un párrafo puede ser { "lista": [...] }).`);
    }
    if (i.ampliaciones !== undefined) {
        if (!Array.isArray(i.ampliaciones)) errores.push('«ampliaciones» debe ser una lista.');
        else {
            if (i.ampliaciones.length > 3) errores.push('Máximo 3 ampliaciones.');
            i.ampliaciones.forEach((x, n) => {
                if (!x || !esTexto(x.titulo) || !esTexto(x.aporta)) errores.push(`La ampliación ${n + 1} necesita «titulo» y «aporta».`);
            });
        }
    }
    if (!Array.isArray(i.ampliaciones) || !i.ampliaciones.length) avisos.push('No tiene ampliaciones (las demás fichas suelen traer de 1 a 3).');
    if (!esTexto(i.otroSector)) avisos.push('No tiene «otroSector» (el párrafo de «aplicar en otra área»).');

    const largo = JSON.stringify(i).length;
    if (largo > MAX_FICHA) errores.push(`La ficha pesa ${largo} caracteres y el máximo es ${MAX_FICHA}.`);
    return { errores, avisos };
}

function filaDesdeIdea(i) {
    const busca = norm([...(i.carreras || []), ...(i.habilidades || []), ...(i.herramientas || [])].join(' '));
    return {
        id: i.id,
        area: i.area,
        areas2: i.areas2 || [],
        titulo: i.titulo.trim(),
        resumen: i.resumen.trim(),
        tipo: i.tipo,
        tiempo: i.tiempo,
        horas: i.horas,
        etiquetas: i.etiquetas || [],
        intencion: i.intencion || [],
        datos: i.datos,
        prog: i.prog || null,
        busca,
        ficha: i,
    };
}

function lista(items, clase) {
    return `<ul class="${clase}">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

async function revisar() {
    fichaRevisada = null;
    $('ppaPublicar').hidden = true;
    msg('ppaMsg', '');
    const cont = $('ppaRevision');
    cont.innerHTML = '';

    const bruto = textoLimpio($('ppaPegar').value);
    if (!bruto) { msg('ppaMsg', 'Pega primero la ficha que te devolvió Claude.', 'error'); return; }

    let idea;
    try { idea = JSON.parse(bruto); } catch (e) {
        cont.innerHTML = `<div class="ppa-revision ppa-malo"><b>El texto no es un JSON válido.</b><p>${esc(e.message)}</p><p>Revisa que hayas copiado la ficha completa, desde la primera llave { hasta la última }.</p></div>`;
        return;
    }

    const { errores, avisos } = validarFicha(idea);
    if (errores.length) {
        cont.innerHTML = `<div class="ppa-revision ppa-malo"><b>La ficha tiene ${errores.length === 1 ? 'un problema' : errores.length + ' problemas'}:</b>${lista(errores, 'ppa-errores')}<p>Pídele a Claude que lo corrija y vuelve a pegarla.</p></div>`;
        return;
    }

    // ¿Qué va a pasar con esta ficha? Depende de si ese id ya existe.
    const { data: existe, error } = await supabase
        .from('proyectos_ideas').select('id, estado, origen, titulo, autor_id').eq('id', idea.id).maybeSingle();
    if (error) {
        console.error('Buscar idea:', error);
        cont.innerHTML = '<div class="ppa-revision ppa-malo"><b>No pude consultar la tabla.</b><p>Revisa tu conexión e inténtalo de nuevo.</p></div>';
        return;
    }

    let destino;
    let frase;
    if (!existe) {
        destino = { tipo: 'nueva' };
        frase = `Es una idea <b>nueva</b>: se agrega al final de «${esc(nombreArea(idea.area))}» como idea del catálogo.`;
    } else if (existe.origen === 'usuario' && existe.estado === 'pendiente') {
        destino = { tipo: 'propuesta', fila: existe };
        frase = `Va a <b>publicar la propuesta</b> «${esc(existe.titulo)}» (autor: ${esc(perfiles.get(existe.autor_id) && String(perfiles.get(existe.autor_id).nombre || '').trim() || 'sin nombre en su perfil')}).`;
    } else if (existe.origen === 'usuario' && existe.estado === 'rechazada') {
        destino = { tipo: 'propuesta', fila: existe };
        frase = `Esa propuesta estaba <b>rechazada</b>. Si continúas, se <b>publicará</b> «${esc(existe.titulo)}».`;
    } else {
        destino = { tipo: 'actualizar', fila: existe };
        frase = `Ya existe una idea <b>publicada</b> con ese id («${esc(existe.titulo)}»): se <b>reemplazará</b> con esta ficha.`;
    }

    fichaRevisada = { idea, destino };
    cont.innerHTML = `
        <div class="ppa-revision ppa-bueno">
            <b>La ficha está completa y es válida.</b>
            <p class="ppa-resumen-ficha"><b>${esc(idea.titulo)}</b><br>${esc(nombreArea(idea.area))}${(idea.areas2 || []).length ? ' · se cruza con ' + esc(idea.areas2.map(nombreArea).join(', ')) : ''} · ${esc(idea.tipo)} · ${esc(idea.tiempo)}</p>
            <p>${frase}</p>
            ${avisos.length ? `<p class="ppa-aviso-tit">Para tener en cuenta:</p>${lista(avisos, 'ppa-avisos')}` : ''}
        </div>`;
    $('ppaPublicar').hidden = false;
    $('ppaPublicar').textContent = destino.tipo === 'actualizar' ? 'Reemplazar y publicar' : 'Publicar en el catálogo';
}

async function publicar() {
    if (!fichaRevisada) return;
    const { idea, destino } = fichaRevisada;
    const ok = await confirmar(
        destino.tipo === 'actualizar'
            ? `Se reemplazará la ficha publicada «${idea.titulo}».`
            : `Se publicará «${idea.titulo}» y la verá cualquier persona en Proyectos Prácticos.`,
        { titulo: '¿Publicar esta idea?', textoBoton: destino.tipo === 'actualizar' ? 'Sí, reemplazar' : 'Sí, publicar' },
    );
    if (!ok) return;

    const btn = $('ppaPublicar');
    btn.disabled = true;
    msg('ppaMsg', '');
    const fila = filaDesdeIdea(idea);
    let error = null;
    let filasAfectadas = [];

    if (destino.tipo === 'nueva') {
        // Va al final de su área: orden = mayor orden actual + 1.
        const { data: ult } = await supabase
            .from('proyectos_ideas').select('orden').eq('area', idea.area).order('orden', { ascending: false }).limit(1);
        const orden = ((ult && ult[0] && Number(ult[0].orden)) || 0) + 1;
        const r = await supabase.from('proyectos_ideas')
            .insert({ ...fila, estado: 'publicada', origen: 'curada', orden }).select('id');
        error = r.error; filasAfectadas = r.data || [];
    } else {
        // Propuesta de un usuario o idea ya publicada: se actualiza la misma fila (se conserva el autor y su elección de nombre).
        const { id, ...cambios } = fila;
        const r = await supabase.from('proyectos_ideas')
            .update({ ...cambios, estado: 'publicada', motivo_rechazo: null }).eq('id', id).select('id');
        error = r.error; filasAfectadas = r.data || [];
    }
    btn.disabled = false;

    if (error || !filasAfectadas.length) {
        console.error('Publicar ficha:', error);
        const detalle = error ? ` (${error.code || ''} ${error.message || ''})`.trim() : '';
        msg('ppaMsg', `No se pudo publicar. ${detalle}`, 'error');
        return;
    }
    fichaRevisada = null;
    $('ppaPublicar').hidden = true;
    $('ppaRevision').innerHTML = '';
    $('ppaPegar').value = '';
    msg('ppaMsg', `Listo: «${idea.titulo}» ya está publicada. Recarga Proyectos Prácticos con Ctrl+F5 para verla.`, 'exito');
    filtro = 'pendiente';
    await cargar();
}

// ───────────── Pestaña y panel ─────────────
function construirPestana() {
    const primera = document.querySelector('.admin-tab');
    const ultimoPanel = $('panelVistaIntranotas') || document.querySelector('.admin-panel:last-of-type');
    if (!primera || !ultimoPanel) return false;

    tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'admin-tab';
    tabBtn.dataset.tab = 'proyectos';
    tabBtn.textContent = 'Proyectos';
    primera.parentElement.appendChild(tabBtn);

    panel = document.createElement('div');
    panel.id = 'panelProyectos';
    panel.className = 'admin-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="da-cab">
            <div><h3>Proyectos Prácticos: propuestas</h3><p class="da-resumen" id="ppaResumen">Cargando…</p></div>
        </div>

        <div class="admin-form-caja">
            <h2 class="admin-form-titulo">Publicar una ficha completa</h2>
            <p class="ppa-ayuda">Pega aquí la ficha (JSON) que te devolvió Claude. Se revisa antes de publicar.
                Sirve para completar una propuesta (mismo id), para agregar una idea tuya (id nuevo) o para corregir una ya publicada (su mismo id).</p>
            <textarea id="ppaPegar" class="ppa-pegar" rows="8" spellcheck="false" placeholder='{ "id": "…", "area": "…", … }'></textarea>
            <div class="ppa-acciones">
                <button type="button" class="da-btn" id="ppaRevisar">Revisar ficha</button>
                <button type="button" class="admin-form-submit ppa-publicar" id="ppaPublicar" hidden>Publicar en el catálogo</button>
            </div>
            <div id="ppaRevision"></div>
            <p class="admin-msg" id="ppaMsg"></p>
        </div>

        <div class="admin-form-caja">
            <h2 class="admin-form-titulo">Respaldo del catálogo</h2>
            <p class="ppa-ayuda">Descarga todas las ideas (curadas y de usuarios, con su estado) en un archivo JSON. Guárdalo en tu computadora: es tu copia por si algo se daña en Supabase.</p>
            <div class="ppa-acciones"><button type="button" class="da-btn" id="ppaRespaldo">Descargar respaldo (JSON)</button></div>
            <p class="admin-msg" id="ppaMsgRespaldo"></p>
        </div>

        <div class="da-filtros ppa-filtros">
            <button type="button" class="da-btn ppa-filtro activo" data-estado="pendiente">Pendientes <span class="ppa-n">0</span></button>
            <button type="button" class="da-btn ppa-filtro" data-estado="publicada">Publicadas <span class="ppa-n">0</span></button>
            <button type="button" class="da-btn ppa-filtro" data-estado="rechazada">Rechazadas <span class="ppa-n">0</span></button>
        </div>

        <div id="ppaLista"><p class="admin-vacio">Cargando…</p></div>`;
    ultimoPanel.parentElement.appendChild(panel);

    // Mostrar este panel al tocar la pestaña (mismo patrón que Preguntas frecuentes).
    tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((b) => b.classList.toggle('activo', b === tabBtn));
        document.querySelectorAll('.admin-panel').forEach((p) => { p.style.display = p === panel ? 'flex' : 'none'; });
    });
    // Ocultarlo al elegir cualquier otra pestaña.
    document.querySelectorAll('.admin-tab').forEach((b) => {
        if (b !== tabBtn) b.addEventListener('click', () => { panel.style.display = 'none'; });
    });
    return true;
}

async function descargarRespaldo() {
    const boton = $('ppaRespaldo');
    boton.disabled = true; msg('ppaMsgRespaldo', 'Preparando el respaldo…');
    try {
        const { data, error } = await supabase.from('proyectos_ideas').select('*').order('orden', { ascending: true }).limit(5000);
        if (error) throw error;
        const hoy = new Date().toISOString().slice(0, 10);
        const archivo = new Blob([JSON.stringify({ tabla: 'proyectos_ideas', fecha: hoy, total: data.length, filas: data }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(archivo);
        const a = document.createElement('a');
        a.href = url; a.download = `proyectos_ideas_respaldo_${hoy}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        msg('ppaMsgRespaldo', `Listo: ${data.length} ideas guardadas en ${a.download}.`);
    } catch (e) {
        console.warn('Proyectos: no se pudo hacer el respaldo', e);
        msg('ppaMsgRespaldo', 'No se pudo descargar el respaldo. Inténtalo otra vez.');
    } finally { boton.disabled = false; }
}

function conectar() {
    $('ppaRespaldo').addEventListener('click', descargarRespaldo);
    $('ppaRevisar').addEventListener('click', revisar);
    $('ppaPublicar').addEventListener('click', publicar);
    // Si cambias el texto pegado, la revisión anterior ya no vale.
    $('ppaPegar').addEventListener('input', () => {
        fichaRevisada = null;
        $('ppaPublicar').hidden = true;
        $('ppaRevision').innerHTML = '';
        msg('ppaMsg', '');
    });
    panel.querySelectorAll('.ppa-filtro').forEach((b) => b.addEventListener('click', () => {
        filtro = b.dataset.estado;
        pintar();
    }));
    $('ppaLista').addEventListener('click', alClicLista);
}

// ───────────── Punto de entrada ─────────────
export function iniciarProyectosAdmin(ayudantes = {}) {
    ayuda = { ...ayuda, ...ayudantes };
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/admin-proyectos.css?v=1';
    document.head.appendChild(css);
    if (!construirPestana()) return;
    conectar();
    cargar();   // al abrir Admin, para que el globito muestre cuántas propuestas esperan
}
