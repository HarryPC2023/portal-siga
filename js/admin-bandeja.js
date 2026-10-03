// js/admin-bandeja.js — Pestaña "Preguntas de alumnos" del Admin (bandeja del botcito).
//
// Aquí Harry ve las preguntas que envían los alumnos desde el botcito y decide:
//   en espera  → Aceptar (la responderá) o Rechazar ("Tu consulta no ha sido admitida en esta ocasión.")
//   aceptada   → Responder (y, si el alumno marcó "pública", publicarla como pregunta frecuente)
//   respondida → Editar la respuesta (si no está publicada) o dejarla como está
// Además: interruptor para PAUSAR las preguntas nuevas, y un globito sobre la pestaña con
// cuántas siguen en espera.
//
// Tablas y funciones: asesorias-preguntas.sql (asesorias_preguntas, asesorias_ajustes y
// asesorias_responder_pregunta, que responde y publica en un solo paso).
//
// Se carga desde admin.js, igual que admin-faq.js:
//     import { iniciarBandejaPreguntas } from './admin-bandeja.js?v=1';
//     iniciarBandejaPreguntas({ confirmarAccion, escapeHtml, formatearFecha });
//
// ⚠️ Archivo NUEVO.
import { supabase } from './auth-siga.js?v=9';
import { CURSOS } from './asesorias-cursos.js?v=1';

const $ = (id) => document.getElementById(id);

const ETIQUETAS = { concepto: 'Concepto', caso: 'Caso de ejemplo', metodo: 'Método' };
const ESTADOS = {
    en_espera: 'En espera', aceptada: 'Aceptada', respondida: 'Respondida',
    rechazada: 'Rechazada', retirada: 'Retirada',
};
const FILTROS = [
    ['en_espera', 'En espera'], ['aceptada', 'Aceptadas'], ['respondida', 'Respondidas'],
    ['rechazada', 'Rechazadas'], ['todas', 'Todas'],
];
const VACIOS = {
    en_espera: 'No hay preguntas en espera.',
    aceptada: 'No hay preguntas aceptadas por responder.',
    respondida: 'Todavía no has respondido ninguna.',
    rechazada: 'No has rechazado ninguna.',
    todas: 'Todavía no ha llegado ninguna pregunta.',
};
const MSG_RECHAZO = 'Tu consulta no ha sido admitida en esta ocasión.';

const MOTIVOS = {
    permiso: 'Solo el administrador puede responder.',
    no_existe: 'Esa pregunta ya no existe.',
    estado: 'La pregunta cambió de estado (quizá el alumno la retiró). Recargué la lista.',
    respuesta: 'Escribe la respuesta (máximo 4000 caracteres).',
    etiqueta: 'La etiqueta no es válida.',
    ya_publicada: 'Esa pregunta ya está publicada: su texto público se edita en la pestaña Preguntas frecuentes.',
    privada: 'El alumno pidió que sea privada: no se puede publicar.',
    pregunta_publica: 'La pregunta pública debe tener entre 3 y 200 caracteres.',
    claves: 'Las palabras clave pasan de 300 caracteres.',
};

let ayuda = { escapeHtml: null, formatearFecha: null, confirmarAccion: null };
let tabBtn = null;
let panel = null;
let filas = [];
let perfiles = new Map();
let ajustes = { preguntas_pausadas: false, limite_semanal: 3 };
let filtro = 'en_espera';
let editandoId = null;
let cargado = false;
let semana = new Map();   // user_id -> cuántas preguntas envió esta semana (todas cuentan)

// ───────────── Utilidades ─────────────
const esc = (v) => (ayuda.escapeHtml
    ? ayuda.escapeHtml(v)
    : String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

const fecha = (iso) => {
    if (!iso) return '';
    if (ayuda.formatearFecha) return ayuda.formatearFecha(iso);
    return new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima' });
};

const recorte = (texto, max) => {
    const t = String(texto || '').replace(/\s+/g, ' ').trim();
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

const cursoDe = (codigo) => CURSOS.find((c) => c.codigo === codigo);
const nombreCurso = (codigo) => { const c = cursoDe(codigo); return c ? c.nombre : `${codigo} (fuera del catálogo)`; };

async function confirmar(mensaje, opciones) {
    if (typeof ayuda.confirmarAccion === 'function') return ayuda.confirmarAccion(mensaje, opciones);
    return window.confirm(mensaje);
}

function quien(userId) {
    const p = perfiles.get(userId);
    if (p && (p.nombre || p.codigo_estudiante)) return [p.nombre, p.codigo_estudiante].filter(Boolean).join(' · ');
    return `usuario ${String(userId || '').slice(0, 8)}…`;
}

function mostrarMsg(id, texto, tipo = 'exito') {
    const m = $(id);
    if (!m) return;
    m.textContent = texto;
    m.className = texto ? `admin-msg ${tipo}` : 'admin-msg';
}

// ───────────── Semana de Lima (igual que la regla de la base de datos) ─────────────
// La semana va de lunes 00:00 a domingo, hora de Lima (UTC-5, sin horario de verano).
const OFFSET_LIMA_MS = 5 * 3600 * 1000;
export function inicioSemanaLima(ahora = Date.now()) {
    const lima = new Date(ahora - OFFSET_LIMA_MS);            // reloj de Lima leído como UTC
    const dia = (lima.getUTCDay() + 6) % 7;                    // lunes = 0
    const lunes = Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth(), lima.getUTCDate() - dia);
    return lunes + OFFSET_LIMA_MS;                             // de vuelta al instante real
}

// ───────────── Avisos personales al alumno (misma tabla y formato que admin-asesorias.js) ─────────────
async function crearAviso({ destinatario, titulo, mensaje, curso, origen }) {
    if (!destinatario) return { ok: false };
    const { error } = await supabase.from('notificaciones').insert({
        destinatario,
        tipo: 'asesorias',
        titulo,
        mensaje,
        enlace: curso ? `asesorias-curso.html?c=${curso.slug}` : 'asesorias.html',
        origen_id: origen,
        canal: 'solo_web',
    });
    if (error && error.code === '23505') return { ok: true, repetido: true };   // ya se había avisado
    if (error) { console.error('No se pudo avisar al alumno:', error); return { ok: false }; }
    return { ok: true };
}

function avisarAlumno(f, estado, respuesta) {
    const curso = cursoDe(f.codigo_curso);
    const base = { destinatario: f.user_id, curso, origen: `pregunta:${f.id}:${estado}` };
    if (estado === 'aceptada') {
        return crearAviso({ ...base, titulo: 'Aceptaron tu pregunta', mensaje: `«${recorte(f.pregunta, 90)}»: ya la vi y la voy a responder.` });
    }
    if (estado === 'respondida') {
        return crearAviso({ ...base, titulo: 'Respondieron tu pregunta', mensaje: `«${recorte(f.pregunta, 60)}»: ${recorte(respuesta, 140)}` });
    }
    return crearAviso({ ...base, titulo: 'Sobre tu consulta', mensaje: MSG_RECHAZO });
}

// ───────────── Globito: preguntas en espera ─────────────
function pintarGlobito(n) {
    if (!tabBtn) return;
    let g = tabBtn.querySelector('.admin-tab-globito');
    if (!n) { if (g) g.remove(); return; }
    if (!g) { g = document.createElement('span'); g.className = 'admin-tab-globito'; tabBtn.appendChild(g); }
    g.textContent = n > 99 ? '99+' : String(n);
}

async function refrescarGlobito() {
    const { count, error } = await supabase
        .from('asesorias_preguntas').select('id', { count: 'exact', head: true }).eq('estado', 'en_espera');
    if (!error && typeof count === 'number') pintarGlobito(count);
}

// ───────────── Datos ─────────────
async function cargar() {
    const cont = $('pbLista');
    const [rq, ra] = await Promise.all([
        supabase.from('asesorias_preguntas').select('*').order('creada_en', { ascending: true }),
        supabase.from('asesorias_ajustes').select('preguntas_pausadas, limite_semanal').eq('id', 1),
    ]);
    if (rq.error) {
        console.error('Preguntas de alumnos:', rq.error);
        cont.innerHTML = '<p class="da-vacio">No se pudieron cargar. ¿Ya corriste asesorias-preguntas.sql en Supabase?</p>';
        return;
    }
    filas = rq.data || [];
    if (!ra.error && ra.data && ra.data[0]) ajustes = ra.data[0];

    const ids = [...new Set(filas.map((f) => f.user_id).filter(Boolean))];
    perfiles = new Map();
    if (ids.length) {
        const { data } = await supabase.from('perfiles_usuario').select('user_id, nombre, codigo_estudiante').in('user_id', ids);
        (data || []).forEach((p) => perfiles.set(p.user_id, p));
    }
    cargado = true;
    pintarGlobito(filas.filter((f) => f.estado === 'en_espera').length);
    pintar();
}

// ───────────── Pantalla ─────────────
const cuenta = (estado) => filas.filter((f) => f.estado === estado).length;

function pintarCabecera() {
    const espera = cuenta('en_espera');
    const acep = cuenta('aceptada');
    $('pbResumen').textContent = filas.length
        ? `${espera} en espera · ${acep} ${acep === 1 ? 'aceptada por responder' : 'aceptadas por responder'} · límite: ${ajustes.limite_semanal} por alumno cada semana`
        : 'Todavía no ha llegado ninguna pregunta.';

    const pausa = !!ajustes.preguntas_pausadas;
    $('pbPausa').textContent = pausa ? 'Reanudar para todos' : 'Pausar para todos';
    $('pbBanner').textContent = `Pausa general activada: ningún alumno puede enviar preguntas nuevas (tú sí, para probar). El límite de ${ajustes.limite_semanal} por semana es aparte y se aplica a cada alumno por separado.`;
    $('pbBanner').hidden = !pausa;

    $('pbFiltros').innerHTML = `<div class="da-tipos" role="radiogroup" aria-label="Filtrar por estado">${FILTROS.map(([v, nombre]) => {
        const n = v === 'todas' ? filas.length : cuenta(v);
        return `<label><input type="radio" name="pbFiltro" value="${v}"${v === filtro ? ' checked' : ''}><span>${nombre} (${n})</span></label>`;
    }).join('')}</div>`;
}

function acciones(f) {
    if (f.estado === 'en_espera') {
        return `<button type="button" class="da-ok" data-pb="aceptar">Aceptar</button>
                <button type="button" class="da-btn pb-rechazar" data-pb="rechazar">Rechazar</button>`;
    }
    if (f.estado === 'aceptada') {
        return '<button type="button" class="da-ok" data-pb="responder">Responder</button>';
    }
    if (f.estado === 'respondida') {
        return f.faq_id
            ? '<span class="pb-nota-pub">Publicada como pregunta frecuente: su texto se edita en la pestaña Preguntas frecuentes.</span>'
            : '<button type="button" class="da-btn" data-pb="responder">Editar respuesta</button>';
    }
    return '';
}

function editorHTML(f) {
    const etq = f.etiqueta || '';
    const radios = [['', 'Sin etiqueta'], ...Object.entries(ETIQUETAS)].map(([v, n]) => `
        <label><input type="radio" name="pbEtq" value="${v}"${v === etq ? ' checked' : ''}><span>${n}</span></label>`).join('');
    const puedePublicar = f.publica && !f.faq_id;
    const larga = f.pregunta.length > 200;
    return `
        <div class="pb-editor">
            <label class="pb-lb" for="pbRespTxt">Tu respuesta (texto sencillo; los saltos de línea se respetan)</label>
            <textarea id="pbRespTxt" rows="7" maxlength="4000" placeholder="Escribe la respuesta tal como la verá el alumno…">${esc(f.respuesta || '')}</textarea>
            <div class="pb-lb">Etiqueta (opcional)</div>
            <div class="da-tipos" role="radiogroup">${radios}</div>
            ${puedePublicar ? `
                <label class="pb-chk"><input type="checkbox" id="pbPublicar" checked><span>Publicar también como pregunta frecuente (el alumno aceptó compartirla)</span></label>
                <div id="pbPubCampos" class="pb-pub">
                    <label class="pb-lb" for="pbPubPreg">Pregunta pública (sin datos personales; no sale el nombre del alumno)</label>
                    <input type="text" id="pbPubPreg" maxlength="200" value="${esc(f.pregunta.slice(0, 200))}">
                    ${larga ? `<small class="pb-pista">El alumno escribió ${f.pregunta.length} caracteres: la pública admite 200, acórtala a tu criterio.</small>` : ''}
                    <label class="pb-lb" for="pbPubClaves">Palabras clave (opcional): cómo lo escribiría un alumno apurado</label>
                    <input type="text" id="pbPubClaves" maxlength="300" placeholder="Ej. protocolo, transacciones, ticket">
                </div>`
            : `<p class="pb-nota">${f.faq_id ? 'Ya está publicada.' : 'El alumno pidió que sea privada: solo él verá la respuesta.'}</p>`}
            <div class="pb-botones">
                <button type="button" class="da-ok" data-pb="guardar">Guardar respuesta</button>
                <button type="button" class="da-btn" data-pb="cancelar">Cancelar</button>
            </div>
            <p class="admin-msg" id="pbMsg"></p>
        </div>`;
}

function chipSemana(f) {
    if (f.estado !== 'en_espera' && f.estado !== 'aceptada') return '';
    const n = semana.get(f.user_id) || 0;
    const lim = ajustes.limite_semanal;
    if (n < lim) return '';
    const texto = n === lim ? `Usó sus ${lim} de la semana` : `Pasó el límite: ${n} esta semana`;
    return `<span class="pb-chip pb-sem">${texto}</span>`;
}

function itemHTML(f) {
    const priv = f.publica ? '<span class="pb-chip pb-pub-si">Quiere compartirla</span>' : '<span class="pb-chip pb-pub-no">Privada</span>';
    const etq = f.etiqueta ? `<span class="pb-chip pb-etq-${esc(f.etiqueta)}">${esc(ETIQUETAS[f.etiqueta] || f.etiqueta)}</span>` : '';
    const resp = f.respuesta ? `<p class="pb-resp">${esc(f.respuesta)}</p>` : '';
    return `
        <div class="admin-item pb-item" data-id="${esc(f.id)}">
            <div class="pb-chips">
                <span class="pb-chip pb-curso">${esc(nombreCurso(f.codigo_curso))}</span>
                <span class="pb-chip pb-est-${esc(f.estado)}">${esc(ESTADOS[f.estado] || f.estado)}</span>
                ${priv}${etq}${chipSemana(f)}
            </div>
            <p class="pb-preg">${esc(f.pregunta)}</p>
            <p class="pb-meta">${esc(quien(f.user_id))} · ${esc(fecha(f.creada_en))}</p>
            ${resp}
            ${editandoId === f.id ? editorHTML(f) : `<div class="pb-acc">${acciones(f)}</div>`}
        </div>`;
}

function pintar() {
    const ini = inicioSemanaLima();
    semana = new Map();
    filas.forEach((x) => { if (Date.parse(x.creada_en) >= ini) semana.set(x.user_id, (semana.get(x.user_id) || 0) + 1); });
    pintarCabecera();
    let lista = filtro === 'todas' ? [...filas] : filas.filter((f) => f.estado === filtro);
    // Las que esperan: la más antigua primero (se atienden en orden). El resto: lo más reciente arriba.
    lista = filtro === 'en_espera'
        ? lista.sort((a, b) => Date.parse(a.creada_en) - Date.parse(b.creada_en))
        : lista.sort((a, b) => Date.parse(b.respondida_en || b.revisada_en || b.creada_en) - Date.parse(a.respondida_en || a.revisada_en || a.creada_en));
    $('pbLista').innerHTML = lista.length
        ? lista.map(itemHTML).join('')
        : `<p class="da-vacio">${VACIOS[filtro]}</p>`;
}

// ───────────── Acciones ─────────────
async function cambiarEstado(f, nuevo, extra = {}) {
    // Solo si sigue en espera: si el alumno la retiró mientras tanto, no pisamos su decisión.
    const { data, error } = await supabase
        .from('asesorias_preguntas')
        .update({ estado: nuevo, revisada_en: new Date().toISOString(), ...extra })
        .eq('id', f.id).eq('estado', 'en_espera')
        .select('id');
    if (error || !data || !data.length) {
        if (error) console.error('Cambiar estado:', error);
        alert(error
            ? 'No se pudo guardar. Inténtalo de nuevo.'
            : 'Esa pregunta ya no está en espera (quizá el alumno la retiró). Actualicé la lista.');
        await cargar();
        return false;
    }
    return true;
}

async function aceptar(f, btn) {
    btn.disabled = true;
    if (!(await cambiarEstado(f, 'aceptada'))) return;
    const av = await avisarAlumno(f, 'aceptada');
    await cargar();
    if (!av.ok) alert('La pregunta quedó aceptada, pero no pude enviarle el aviso al alumno.');
}

async function rechazar(f, btn) {
    const ok = await confirmar(
        `El alumno recibirá: «${MSG_RECHAZO}» Esta consulta seguirá contando para su límite semanal.`,
        { titulo: '¿Rechazar esta consulta?', textoBoton: 'Sí, rechazar' },
    );
    if (!ok) return;
    btn.disabled = true;
    if (!(await cambiarEstado(f, 'rechazada'))) return;
    const av = await avisarAlumno(f, 'rechazada');
    await cargar();
    if (!av.ok) alert('La pregunta quedó rechazada, pero no pude enviarle el aviso al alumno.');
}

function abrirEditor(f) {
    editandoId = f.id;
    pintar();
    const chk = $('pbPublicar');
    if (chk) chk.addEventListener('change', () => { $('pbPubCampos').hidden = !chk.checked; });
    $('pbRespTxt').focus({ preventScroll: true });
}

function cerrarEditor() {
    editandoId = null;
    pintar();
}

async function guardarRespuesta(f, btn) {
    const resp = $('pbRespTxt').value.trim();
    const radio = panel.querySelector('input[name="pbEtq"]:checked');
    const etiqueta = radio && radio.value ? radio.value : null;
    const chk = $('pbPublicar');
    const publicar = !!(chk && chk.checked);
    const pregPub = publicar ? $('pbPubPreg').value.trim() : '';
    const claves = publicar ? $('pbPubClaves').value.trim() : '';

    if (!resp) return mostrarMsg('pbMsg', MOTIVOS.respuesta, 'error');
    if (publicar && (pregPub.length < 3 || pregPub.length > 200)) return mostrarMsg('pbMsg', MOTIVOS.pregunta_publica, 'error');

    btn.disabled = true;
    const primera = f.estado === 'aceptada';
    const { data, error } = await supabase.rpc('asesorias_responder_pregunta', {
        p_id: f.id,
        p_respuesta: resp,
        p_etiqueta: etiqueta,
        p_publicar: publicar,
        p_pregunta_publica: publicar ? pregPub : null,
        p_palabras_clave: publicar && claves ? claves : null,
    });
    btn.disabled = false;

    if (error || !data || !data.ok) {
        if (error) console.error('Responder pregunta:', error);
        mostrarMsg('pbMsg', (data && MOTIVOS[data.motivo]) || 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.', 'error');
        if (data && (data.motivo === 'estado' || data.motivo === 'no_existe')) { editandoId = null; await cargar(); }
        return;
    }
    editandoId = null;
    let av = { ok: true };
    if (primera) av = await avisarAlumno(f, 'respondida', resp);
    await cargar();
    if (!av.ok) alert('La respuesta quedó guardada, pero no pude enviarle el aviso al alumno.');
}

async function alternarPausa(btn) {
    btn.disabled = true;
    const nuevo = !ajustes.preguntas_pausadas;
    const { data, error } = await supabase
        .from('asesorias_ajustes')
        .update({ preguntas_pausadas: nuevo, actualizada_en: new Date().toISOString() })
        .eq('id', 1).select('id');
    btn.disabled = false;
    if (error || !data || !data.length) {
        if (error) console.error('Pausa:', error);
        alert('No se pudo cambiar la pausa. Inténtalo de nuevo.');
        return;
    }
    ajustes.preguntas_pausadas = nuevo;
    pintarCabecera();
}

// ───────────── Pestaña y panel ─────────────
function construirPestana() {
    const primera = document.querySelector('.admin-tab');
    const ultimoPanel = $('panelVistaIntranotas') || document.querySelector('.admin-panel:last-of-type');
    if (!primera || !ultimoPanel) return false;

    tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'admin-tab';
    tabBtn.dataset.tab = 'bandeja';
    tabBtn.textContent = 'Preguntas de alumnos';
    primera.parentElement.appendChild(tabBtn);

    panel = document.createElement('div');
    panel.id = 'panelBandeja';
    panel.className = 'admin-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="da-cab">
            <div><h3>Preguntas de alumnos</h3><p class="da-resumen" id="pbResumen"></p></div>
            <button type="button" class="da-btn" id="pbPausa" title="Pausa general: afecta a todos los alumnos. El límite semanal es por alumno y no depende de este botón.">Pausar para todos</button>
        </div>
        <p class="pb-banner" id="pbBanner" hidden></p>
        <div id="pbFiltros"></div>
        <div id="pbLista"><p class="admin-vacio">Cargando…</p></div>`;
    ultimoPanel.parentElement.appendChild(panel);

    tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((b) => b.classList.toggle('activo', b === tabBtn));
        document.querySelectorAll('.admin-panel').forEach((p) => { p.style.display = p === panel ? 'flex' : 'none'; });
        cargar();   // siempre trae lo más reciente al abrir
    });
    document.querySelectorAll('.admin-tab').forEach((b) => {
        if (b !== tabBtn) b.addEventListener('click', () => { panel.style.display = 'none'; });
    });
    return true;
}

function conectar() {
    $('pbPausa').addEventListener('click', (e) => alternarPausa(e.currentTarget));

    $('pbFiltros').addEventListener('change', (e) => {
        if (e.target.name !== 'pbFiltro') return;
        filtro = e.target.value;
        editandoId = null;
        pintar();
    });

    $('pbLista').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-pb]');
        if (!btn) return;
        if (btn.dataset.pb === 'cancelar') return cerrarEditor();
        const item = btn.closest('.pb-item');
        const f = item && filas.find((x) => String(x.id) === item.dataset.id);
        if (!f) return;
        if (btn.dataset.pb === 'aceptar') aceptar(f, btn);
        else if (btn.dataset.pb === 'rechazar') rechazar(f, btn);
        else if (btn.dataset.pb === 'responder') abrirEditor(f);
        else if (btn.dataset.pb === 'guardar') guardarRespuesta(f, btn);
    });

    // El globito se actualiza cuando vuelves a la pestaña del navegador (y la lista, si la estás viendo).
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') return;
        if (panel.style.display !== 'none' && editandoId === null) cargar();
        else refrescarGlobito();
    });
}

// ───────────── Punto de entrada ─────────────
export function iniciarBandejaPreguntas(ayudantes = {}) {
    ayuda = { ...ayuda, ...ayudantes };
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/admin-bandeja.css?v=1';
    document.head.appendChild(css);
    if (construirPestana()) {
        conectar();
        refrescarGlobito();   // el globito se ve desde que entras a Admin, sin abrir la pestaña
    }
}