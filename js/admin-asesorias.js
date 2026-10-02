// js/admin-asesorias.js — Admin de Asesorías (se carga desde admin.js).
//
// Hace dos cosas, sin tocar el resto de Admin:
//  1) Agrega la pestaña "Demanda de Asesorías": qué piden más los alumnos
//     ("Lo necesito"), los pedidos de curso y los reportes de error.
//  2) Completa la pestaña "Asesorías propuestas" con los datos nuevos del
//     formulario (tipo de aporte, con o sin nombre, autorización) y con un
//     botón "Avisar: ya está publicada" que le manda una notificación
//     personal a quien la compartió.
//  3) Exporta avisarRespuestaIdea(): admin.js la llama al guardar la respuesta
//     a una idea, para que a quien la envió le llegue "Respondieron tu idea".
//
// ⚠️ No confundir con asesorias-cursos.js (el catálogo) ni con
// asesorias-comun.js (piezas de la sección pública). Este archivo es solo
// del Admin.
//
// Tablas: asesorias_demanda (lo_necesito | pedido | reporte),
// asesorias_demanda_conteo (vista con el total por curso y evaluación),
// asesorias_propuestas y notificaciones (avisos personales).
// El SQL está en asesorias-admin.sql y notificaciones-personales.sql.
import { supabase } from './auth-siga.js?v=9';
import { CURSOS } from './asesorias-cursos.js?v=1';

const LS_VISTO = 'siga_admin_visto_demanda';
const $ = (id) => document.getElementById(id);

let ayuda = { escapeHtml: null, formatearFecha: null, confirmarAccion: null };
let panel = null;
let tabBtn = null;
let cargado = false;

// ───────────── Utilidades ─────────────
const esc = (v) => (ayuda.escapeHtml ? ayuda.escapeHtml(v) : String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const fecha = (iso) => (ayuda.formatearFecha ? ayuda.formatearFecha(iso) : new Date(iso).toLocaleString('es-PE'));

function nombreCurso(codigo) {
    if (!codigo) return '(sin curso)';
    const c = CURSOS.find((x) => x.codigo === codigo);
    return c ? c.nombre : codigo;
}

function tituloRecurso(codigo, recursoId) {
    const c = CURSOS.find((x) => x.codigo === codigo);
    const r = c && c.recursos.find((x) => x.id === recursoId);
    return r ? r.titulo : (recursoId || '(recurso desconocido)');
}

async function confirmar(mensaje, opciones) {
    if (typeof ayuda.confirmarAccion === 'function') return ayuda.confirmarAccion(mensaje, opciones);
    return window.confirm(mensaje);
}

// Quién envió cada cosa: nombre y código del perfil (si no hay, un trozo del id).
async function cargarQuien(userIds) {
    const mapa = new Map();
    const ids = [...new Set(userIds.filter(Boolean))];
    if (!ids.length) return mapa;
    const { data, error } = await supabase.from('perfiles_usuario').select('user_id, nombre, codigo_estudiante').in('user_id', ids);
    if (!error && data) data.forEach((p) => mapa.set(p.user_id, p));
    return mapa;
}

function quien(mapa, userId) {
    const p = mapa.get(userId);
    if (p && (p.nombre || p.codigo_estudiante)) return [p.nombre, p.codigo_estudiante].filter(Boolean).join(' · ');
    return `usuario ${String(userId || '').slice(0, 8)}…`;
}

// ───────────── Avisos personales (tabla notificaciones) ─────────────
const recorte = (texto, max) => {
    const t = String(texto || '').replace(/\s+/g, ' ').trim();
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

// Crea UNA notificación para UNA persona. Si ese mismo aviso ya se mandó
// (mismo destinatario y mismo origen_id), no lo repite y lo cuenta como enviado.
// Siempre es solo web: los correos masivos no se tocan.
async function crearAvisoPersonal({ destinatario, tipo, titulo, mensaje, enlace, origen }) {
    if (!destinatario) return { ok: false, motivo: 'sin_destinatario' };
    const { error } = await supabase.from('notificaciones').insert({
        destinatario, tipo, titulo, mensaje, enlace, origen_id: origen, canal: 'solo_web',
    });
    if (error && error.code === '23505') return { ok: true, repetido: true };
    if (error) { console.error('No se pudo crear el aviso personal:', error); return { ok: false, motivo: 'error' }; }
    return { ok: true };
}

/** "Respondieron tu idea": se llama al guardar una respuesta nueva a una idea. */
export function avisarRespuestaIdea({ idea, respuesta, respondidoEn }) {
    return crearAvisoPersonal({
        destinatario: idea && idea.user_id,
        tipo: 'respuestas',
        titulo: 'Respondieron tu idea',
        mensaje: `«${recorte(idea && idea.titulo, 60)}»: ${recorte(respuesta, 140)}`,
        enlace: 'perfil.html#sugerencias', // la pestaña "Ideas" del perfil se llama "sugerencias" en la URL
        origen: `idea:${idea && idea.id}:${respondidoEn || ''}`,
    });
}

/** "Tu asesoría quedó publicada": a quien compartió la propuesta. */
export function avisarAsesoriaPublicada(propuesta) {
    const nombreNormal = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const curso = CURSOS.find((c) => nombreNormal(c.nombre) === nombreNormal(propuesta.curso));
    return crearAvisoPersonal({
        destinatario: propuesta.autor_id,
        tipo: 'asesorias',
        titulo: 'Tu asesoría quedó publicada',
        mensaje: `«${recorte(propuesta.titulo, 70)}» ya está en Asesorías. ¡Gracias por compartir!`,
        enlace: curso ? `asesorias-curso.html?c=${curso.slug}` : 'asesorias.html',
        origen: `propuesta:${propuesta.id}`,
    });
}

// ───────────── Globito de novedades de la pestaña ─────────────
function pintarGlobito(n) {
    if (!tabBtn) return;
    let g = tabBtn.querySelector('.admin-tab-globito');
    if (!n) { if (g) g.remove(); return; }
    if (!g) { g = document.createElement('span'); g.className = 'admin-tab-globito'; tabBtn.appendChild(g); }
    g.textContent = n > 99 ? '99+' : String(n);
}

async function refrescarGlobito() {
    const { data, error } = await supabase.from('asesorias_demanda').select('creado_en').in('tipo', ['pedido', 'reporte']);
    if (error || !data) return;
    const visto = Date.parse(localStorage.getItem(LS_VISTO) || '') || 0;
    pintarGlobito(data.filter((r) => (Date.parse(r.creado_en) || 0) > visto).length);
}

function marcarVista() {
    localStorage.setItem(LS_VISTO, new Date().toISOString());
    pintarGlobito(0);
}

// ───────────── Bloque 1: lo que más piden ─────────────
async function pintarConteo() {
    const cont = $('daConteo');
    const { data, error } = await supabase.from('asesorias_demanda_conteo').select('codigo_curso, evaluacion, personas');
    if (error) { cont.innerHTML = `<p class="da-vacio">No se pudo cargar: ${esc(error.message)}</p>`; return 0; }
    if (!data.length) { cont.innerHTML = '<p class="da-vacio">Todavía nadie tocó "Lo necesito".</p>'; return 0; }
    const filas = [...data].sort((a, b) => b.personas - a.personas || nombreCurso(a.codigo_curso).localeCompare(nombreCurso(b.codigo_curso), 'es'));
    const max = Math.max(...filas.map((f) => f.personas));
    cont.innerHTML = filas.map((f) => `
        <div class="da-fila">
            <div class="da-nombre">${esc(nombreCurso(f.codigo_curso))} <small>· ${f.evaluacion ? esc(f.evaluacion) : 'curso completo'}</small></div>
            <div class="da-num">${f.personas} ${f.personas === 1 ? 'persona' : 'personas'}</div>
            <div class="da-barra"><i style="width:${Math.max(6, Math.round((100 * f.personas) / max))}%"></i></div>
        </div>`).join('');
    return filas.reduce((s, f) => s + f.personas, 0);
}

// ───────────── Bloques 2 y 3: pedidos y reportes ─────────────
async function leerLista(tipo) {
    const { data, error } = await supabase
        .from('asesorias_demanda')
        .select('id, user_id, codigo_curso, evaluacion, recurso_id, texto, creado_en')
        .eq('tipo', tipo)
        .order('creado_en', { ascending: false })
        .limit(200);
    return { data: data || [], error };
}

function itemHTML(tipo, f, mapa) {
    const principal = tipo === 'reporte'
        ? `<p class="da-texto"><b>${esc(nombreCurso(f.codigo_curso))}</b> · ${esc(tituloRecurso(f.codigo_curso, f.recurso_id))}</p><p class="da-texto">“${esc(f.texto)}”</p>`
        : `<p class="da-texto">${esc(f.texto)}</p>`;
    return `
        <div class="da-item" data-id="${esc(f.id)}">
            <div>
                ${principal}
                <p class="da-meta">${esc(quien(mapa, f.user_id))} · ${esc(fecha(f.creado_en))}</p>
            </div>
            <button type="button" class="da-ok" data-atender="${esc(f.id)}">${tipo === 'reporte' ? 'Resuelto' : 'Atendido'}</button>
        </div>`;
}

async function pintarLista(tipo, idCont, vacio) {
    const cont = $(idCont);
    const { data, error } = await leerLista(tipo);
    if (error) { cont.innerHTML = `<p class="da-vacio">No se pudo cargar: ${esc(error.message)}</p>`; return 0; }
    if (!data.length) { cont.innerHTML = `<p class="da-vacio">${vacio}</p>`; return 0; }
    const mapa = await cargarQuien(data.map((f) => f.user_id));
    cont.innerHTML = data.map((f) => itemHTML(tipo, f, mapa)).join('');
    cont.querySelectorAll('[data-atender]').forEach((b) => b.addEventListener('click', () => atender(tipo, b)));
    return data.length;
}

async function atender(tipo, btn) {
    const ok = await confirmar(
        tipo === 'reporte' ? 'El reporte se borrará de la lista.' : 'El pedido se borrará de la lista.',
        { titulo: tipo === 'reporte' ? '¿Marcar como resuelto?' : '¿Marcar como atendido?', textoBoton: 'Sí, listo' },
    );
    if (!ok) return;
    btn.disabled = true;
    const { error } = await supabase.from('asesorias_demanda').delete().eq('id', btn.dataset.atender);
    if (error) { btn.disabled = false; alert('No se pudo actualizar: ' + error.message); return; }
    btn.closest('.da-item').remove();
    const idCont = tipo === 'reporte' ? 'daReportes' : 'daPedidos';
    const cont = $(idCont);
    if (!cont.querySelector('.da-item')) cont.innerHTML = `<p class="da-vacio">${tipo === 'reporte' ? 'No hay reportes pendientes.' : 'No hay pedidos pendientes.'}</p>`;
    actualizarResumen();
}

function actualizarResumen() {
    const p = $('daPedidos').querySelectorAll('.da-item').length;
    const r = $('daReportes').querySelectorAll('.da-item').length;
    $('daResumen').textContent = `${r} ${r === 1 ? 'reporte' : 'reportes'} por resolver · ${p} ${p === 1 ? 'pedido' : 'pedidos'} por atender`;
}

async function cargarTodo() {
    $('daResumen').textContent = 'Cargando…';
    await Promise.all([
        pintarConteo(),
        pintarLista('reporte', 'daReportes', 'No hay reportes pendientes.'),
        pintarLista('pedido', 'daPedidos', 'No hay pedidos pendientes.'),
    ]);
    actualizarResumen();
    cargado = true;
}

// ───────────── Pestaña y panel ─────────────
function construirPestana() {
    const primera = document.querySelector('.admin-tab');
    const ultimoPanel = $('panelVistaIntranotas') || document.querySelector('.admin-panel:last-of-type');
    if (!primera || !ultimoPanel) return false;

    tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'admin-tab';
    tabBtn.dataset.tab = 'demanda';
    tabBtn.textContent = 'Demanda de Asesorías';
    primera.parentElement.appendChild(tabBtn);

    panel = document.createElement('div');
    panel.id = 'panelDemanda';
    panel.className = 'admin-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="da-cab">
            <div><h3>Demanda de Asesorías</h3><p class="da-resumen" id="daResumen"></p></div>
            <button type="button" class="da-btn" id="daActualizar">Actualizar</button>
        </div>
        <div class="da-bloque"><h3>Lo que más piden</h3>
            <p class="da-sub">Personas que tocaron "Lo necesito", por curso y evaluación. Te dice qué preparar primero.</p>
            <div id="daConteo"></div></div>
        <div class="da-bloque"><h3>Reportes de error</h3>
            <p class="da-sub">Lo que los alumnos encontraron mal en una asesoría. Corrige y marca "Resuelto".</p>
            <div id="daReportes"></div></div>
        <div class="da-bloque"><h3>Pedidos de curso</h3>
            <p class="da-sub">Cursos que quieren ver y todavía no están en Asesorías.</p>
            <div id="daPedidos"></div></div>`;
    ultimoPanel.parentElement.appendChild(panel);

    // Mostrar este panel al tocar la pestaña (haciendo todo aquí, sin depender del manejador de Admin)
    tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((b) => b.classList.toggle('activo', b === tabBtn));
        document.querySelectorAll('.admin-panel').forEach((p) => { p.style.display = p === panel ? 'flex' : 'none'; });
        marcarVista();
        if (!cargado) cargarTodo();
    });
    // Ocultarlo cuando se elige cualquier otra pestaña
    document.querySelectorAll('.admin-tab').forEach((b) => {
        if (b !== tabBtn) b.addEventListener('click', () => { panel.style.display = 'none'; });
    });
    $('daActualizar').addEventListener('click', cargarTodo);
    return true;
}

// ───────────── Completar "Asesorías propuestas" con los datos nuevos ─────────────
let decorando = false;

async function decorarPropuestas() {
    const lista = $('listaAsesorias');
    if (!lista || decorando) return;
    const items = [...lista.querySelectorAll('.admin-item[data-id]:not([data-da])')];
    if (!items.length) return;
    decorando = true;
    items.forEach((it) => { it.dataset.da = '1'; });
    const { data, error } = await supabase
        .from('asesorias_propuestas')
        .select('id, titulo, curso, autor_id, tipo_aporte, mostrar_nombre, autoriza_publicar')
        .in('id', items.map((it) => it.dataset.id));
    decorando = false;
    if (error || !data) return;
    const porId = new Map(data.map((r) => [String(r.id), r]));
    items.forEach((it) => {
        const r = porId.get(it.dataset.id);
        if (!r) return;
        const partes = [
            r.tipo_aporte ? `Aporte: ${esc(r.tipo_aporte)}` : null,
            `Aparecer: ${r.mostrar_nombre === false ? 'sin nombre' : 'con nombre'}`,
            r.autoriza_publicar ? '✔ Autoriza publicar' : 'Sin autorización registrada',
        ].filter(Boolean);
        const linea = document.createElement('p');
        linea.className = 'da-extra';
        linea.textContent = '';
        linea.innerHTML = partes.join(' · ');
        const botones = it.querySelector('div[style*="display:flex"]');
        if (botones) it.insertBefore(linea, botones); else it.appendChild(linea);

        // Botón: avisar a quien la compartió que ya se publicó (una sola vez por propuesta)
        if (r.autor_id && botones) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'da-ok';
            btn.textContent = 'Avisar: ya está publicada';
            btn.addEventListener('click', async () => {
                const ok = await confirmar('Se le enviará una notificación personal a quien compartió esta asesoría. Hazlo cuando ya esté publicada en SIGA.', {
                    titulo: '¿Avisar que ya está publicada?', textoBoton: 'Sí, avisar',
                });
                if (!ok) return;
                btn.disabled = true;
                const envio = await avisarAsesoriaPublicada(r);
                if (envio.ok) { btn.textContent = envio.repetido ? 'Ya se le avisó ✓' : 'Aviso enviado ✓'; }
                else { btn.disabled = false; alert('No se pudo enviar el aviso. Inténtalo de nuevo.'); }
            });
            botones.insertBefore(btn, botones.firstChild);
        }
    });
}

function observarPropuestas() {
    const lista = $('listaAsesorias');
    if (!lista) return;
    new MutationObserver(() => decorarPropuestas()).observe(lista, { childList: true });
    decorarPropuestas();
}

// ───────────── Punto de entrada ─────────────
export function iniciarDemandaAsesorias(ayudantes = {}) {
    ayuda = { ...ayuda, ...ayudantes };
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/admin-asesorias.css?v=1';
    document.head.appendChild(css);
    if (construirPestana()) refrescarGlobito();
    observarPropuestas();
}