// js/admin-bandeja.js — Pestaña "Preguntas de usuarios" del Admin (bandeja del botcito).
//
// Aquí Harry ve las preguntas que envían los usuarios desde el botcito y decide:
//   en espera  → Aceptar (la responderá) o Rechazar ("Tu consulta no ha sido admitida en esta ocasión.")
//   aceptada   → Responder (y, si el usuario marcó "pública", publicarla como pregunta frecuente)
//   respondida → Editar la respuesta (si no está publicada) o dejarla como está
// Cuando una pregunta ya está cerrada (respondida, rechazada o retirada) la puedes ARCHIVAR para
// que deje de verse en la bandeja ("Limpiar bandeja" archiva todas las cerradas de una vez). No se
// borra: queda en "Archivadas" (se puede restaurar) y sigue contando para el límite semanal.
// Las archivadas se pueden ELIMINAR DE TU BANDEJA para siempre. Eso solo afecta a tu vista: la
// pregunta NO se borra para el usuario, que la sigue viendo en su Mis preguntas con su estado y su
// respuesta, y su límite semanal no cambia. (La fila se borra de verdad solo cuando los dos ya la
// descartaron y es de una semana anterior; lo hace la base de datos.)
// Además: botón "Probar como usuario" (tu cuenta tiene el mismo límite y la misma pausa que un usuario,
// para ver exactamente lo que ellos ven), interruptor para PAUSAR las preguntas nuevas, un globito sobre la pestaña con
// cuántas siguen en espera, y la vista "Pasaron el límite": qué usuarios intentaron preguntar
// de más (esta semana y las 8 anteriores; tabla asesorias_intentos_limite).
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
    ['rechazada', 'Rechazadas'], ['limite', 'Pasaron el límite'], ['archivada', 'Archivadas'], ['todas', 'Todas'],
];
const CERRADAS = ['respondida', 'rechazada', 'retirada'];   // las únicas que se pueden archivar
const VACIOS = {
    en_espera: 'No hay preguntas en espera.',
    aceptada: 'No hay preguntas aceptadas por responder.',
    respondida: 'Todavía no has respondido ninguna.',
    rechazada: 'No has rechazado ninguna.',
    limite: 'Nadie ha intentado pasar el límite esta semana.',
    archivada: 'No hay preguntas archivadas.',
    todas: 'Todavía no ha llegado ninguna pregunta.',
};
const MSG_RECHAZO = 'Tu consulta no ha sido admitida en esta ocasión.';

const MOTIVOS = {
    permiso: 'Solo el administrador puede responder.',
    no_existe: 'Esa pregunta ya no existe.',
    estado: 'La pregunta cambió de estado (quizá el usuario la retiró). Recargué la lista.',
    respuesta: 'Escribe la respuesta (máximo 4000 caracteres).',
    etiqueta: 'La etiqueta no es válida.',
    ya_publicada: 'Esa pregunta ya está publicada: su texto público se edita en la pestaña Preguntas frecuentes.',
    privada: 'El usuario pidió que sea privada: no se puede publicar.',
    pregunta_publica: 'La pregunta pública debe tener entre 3 y 200 caracteres.',
    claves: 'Las palabras clave pasan de 300 caracteres.',
};

let ayuda = { escapeHtml: null, formatearFecha: null, confirmarAccion: null };
let tabBtn = null;
let panel = null;
let filas = [];
let perfiles = new Map();
let ajustes = { preguntas_pausadas: false, limite_semanal: 3, admin_exento: true };
let filtro = 'en_espera';
let editandoId = null;
let cargado = false;
let intentos = [];       // intentos sobre el límite de las últimas 8 semanas (uno por usuario y semana)
let intentosError = false; // la tabla de intentos no se pudo leer (¿falta correr el SQL?)
let todas = [];          // TODAS las filas (también las que Harry eliminó de su bandeja): cuentan para el límite
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

// ───────────── Avisos personales al usuario (misma tabla y formato que admin-asesorias.js) ─────────────
async function crearAviso({ destinatario, titulo, mensaje, origen }) {
    if (!destinatario) return { ok: false };
    const { error } = await supabase.from('notificaciones').insert({
        destinatario,
        tipo: 'respuestas',   // lo controla Perfil → Avisos → "Respuestas a lo que envías"
        titulo,
        mensaje,
        enlace: 'perfil.html#preguntas',   // Perfil → Mis preguntas: ahí lee su respuesta completa
        origen_id: origen,
        canal: 'solo_web',
    });
    if (error && error.code === '23505') return { ok: true, repetido: true };   // ya se había avisado
    if (error) { console.error('No se pudo avisar al usuario:', error); return { ok: false }; }
    return { ok: true };
}

function avisarAlumno(f, estado, respuesta) {
    const base = { destinatario: f.user_id, origen: `pregunta:${f.id}:${estado}` };
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
    const [rq, ra, ri] = await Promise.all([
        supabase.from('asesorias_preguntas').select('*').order('creada_en', { ascending: true }),
        supabase.from('asesorias_ajustes').select('preguntas_pausadas, limite_semanal, admin_exento').eq('id', 1),
        supabase.from('asesorias_intentos_limite')
            .select('user_id, semana_inicio, intentos, primer_intento, ultimo_intento, codigo_curso')
            .gte('semana_inicio', new Date(inicioSemanaLima() - 8 * 7 * 86400000).toISOString()),
    ]);
    if (rq.error) {
        console.error('Preguntas de usuarios:', rq.error);
        cont.innerHTML = '<p class="da-vacio">No se pudieron cargar. ¿Ya corriste asesorias-preguntas.sql en Supabase?</p>';
        return;
    }
    todas = rq.data || [];
    filas = todas.filter((f) => !f.eliminada_admin);   // las que eliminaste de tu bandeja ya no se muestran
    if (!ra.error && ra.data && ra.data[0]) ajustes = ra.data[0];
    // Si la tabla de intentos todavía no existe, simplemente no hay vista de intentos (nada se rompe).
    intentosError = !!ri.error;
    if (ri.error) console.warn('Intentos sobre el límite: no se pudo leer la tabla.', ri.error);
    intentos = !ri.error && ri.data ? [...ri.data].sort((a, b) => Date.parse(b.ultimo_intento) - Date.parse(a.ultimo_intento)) : [];

    const ids = [...new Set([...filas, ...intentos].map((f) => f.user_id).filter(Boolean))];
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
// Las archivadas salen de todas las vistas menos de "Archivadas".
const visibles = () => filas.filter((f) => !f.archivada_admin);
const archivadas = () => filas.filter((f) => f.archivada_admin);
const archivables = () => visibles().filter((f) => CERRADAS.includes(f.estado));
// Eliminar de tu bandeja: cualquier archivada, sin esperar (la fila no se borra: el usuario la sigue viendo).
const cuenta = (estado) => visibles().filter((f) => f.estado === estado).length;

function pintarCabecera() {
    const espera = cuenta('en_espera');
    const acep = cuenta('aceptada');
    $('pbResumen').textContent = filas.length
        ? `${espera} en espera · ${acep} ${acep === 1 ? 'aceptada por responder' : 'aceptadas por responder'} · límite: ${ajustes.limite_semanal} por usuario cada semana`
        : 'Todavía no ha llegado ninguna pregunta.';

    const pausa = !!ajustes.preguntas_pausadas;
    const modoAlumno = ajustes.admin_exento === false;
    $('pbPausa').textContent = pausa ? 'Reanudar para todos' : 'Pausar para todos';
    $('pbLimpiar').hidden = archivables().length === 0;   // solo aparece si hay algo cerrado que limpiar
    $('pbBanner').textContent = modoAlumno
        ? `Pausa general activada: ningún usuario puede enviar preguntas nuevas, y tú tampoco mientras estés en modo usuario. Para ver el mensaje del límite, primero reanuda las preguntas.`
        : `Pausa general activada: ningún usuario puede enviar preguntas nuevas (tú sí, para probar). El límite de ${ajustes.limite_semanal} por semana es aparte y se aplica a cada usuario por separado.`;
    $('pbBanner').hidden = !pausa;

    $('pbExento').textContent = modoAlumno ? 'Volver a modo administrador' : 'Probar como usuario';
    $('pbBannerAlumno').textContent = `Modo usuario: tu cuenta tiene el mismo límite (${ajustes.limite_semanal} por semana) y la misma pausa que un usuario, así ves exactamente lo que ellos ven. Cuando termines, vuelve a modo administrador.`;
    $('pbBannerAlumno').hidden = !modoAlumno;

    $('pbFiltros').innerHTML = `<div class="da-tipos" role="radiogroup" aria-label="Filtrar por estado">${FILTROS.map(([v, nombre]) => {
        const n = v === 'todas' ? visibles().length : (v === 'limite' ? intentosSemana().length : (v === 'archivada' ? archivadas().length : cuenta(v)));
        return `<label><input type="radio" name="pbFiltro" value="${v}"${v === filtro ? ' checked' : ''}><span>${nombre} (${n})</span></label>`;
    }).join('')}</div>`;
}

function botonArchivo(f) {
    if (!CERRADAS.includes(f.estado)) return '';
    return f.archivada_admin
        ? '<button type="button" class="da-btn" data-pb="desarchivar">Desarchivar</button>'
        : '<button type="button" class="da-btn pb-archivar" data-pb="archivar" title="La quita de tu bandeja. No se borra: queda en Archivadas y sigue contando para el límite semanal del usuario.">Archivar</button>';
}

function acciones(f) {
    if (f.estado === 'en_espera') {
        return `<button type="button" class="da-ok" data-pb="aceptar">Aceptar</button>
                <button type="button" class="da-btn pb-rechazar" data-pb="rechazar">Rechazar</button>`;
    }
    if (f.estado === 'aceptada') {
        return '<button type="button" class="da-ok" data-pb="responder">Responder</button>';
    }
    // Una archivada se puede restaurar o, si es de una semana anterior, eliminar para siempre.
    if (f.archivada_admin) {
        return botonArchivo(f) + '<button type="button" class="da-btn pb-eliminar" data-pb="eliminar" title="La quita de TU bandeja para siempre. El usuario la sigue viendo en su lista.">Eliminar de mi bandeja</button>';
    }
    if (f.estado === 'respondida') {
        const base = f.faq_id
            ? '<span class="pb-nota-pub">Publicada como pregunta frecuente: su texto se edita en la pestaña Preguntas frecuentes.</span>'
            : '<button type="button" class="da-btn" data-pb="responder">Editar respuesta</button>';
        return base + botonArchivo(f);
    }
    return botonArchivo(f);
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
            <textarea id="pbRespTxt" rows="7" maxlength="4000" placeholder="Escribe la respuesta tal como la verá el usuario…">${esc(f.respuesta || '')}</textarea>
            <div class="pb-lb">Etiqueta (opcional)</div>
            <div class="da-tipos" role="radiogroup">${radios}</div>
            ${puedePublicar ? `
                <label class="pb-chk"><input type="checkbox" id="pbPublicar" checked><span>Publicar también como pregunta frecuente (el usuario aceptó compartirla)</span></label>
                <div id="pbPubCampos" class="pb-pub">
                    <label class="pb-lb" for="pbPubPreg">Pregunta pública (sin datos personales; no sale el nombre del usuario)</label>
                    <input type="text" id="pbPubPreg" maxlength="200" value="${esc(f.pregunta.slice(0, 200))}">
                    ${larga ? `<small class="pb-pista">El usuario escribió ${f.pregunta.length} caracteres: la pública admite 200, acórtala a tu criterio.</small>` : ''}
                    <label class="pb-lb" for="pbPubClaves">Palabras clave (opcional): cómo lo escribiría un usuario apurado</label>
                    <input type="text" id="pbPubClaves" maxlength="300" placeholder="Ej. protocolo, transacciones, ticket">
                </div>`
            : `<p class="pb-nota">${f.faq_id ? 'Ya está publicada.' : 'El usuario pidió que sea privada: solo él verá la respuesta.'}</p>`}
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
                ${priv}${etq}${chipSemana(f)}${f.oculta_usuario ? '<span class="pb-chip pb-oculta">La quitó de su lista</span>' : ''}
            </div>
            <p class="pb-preg">${esc(f.pregunta)}</p>
            <p class="pb-meta">${esc(quien(f.user_id))} · ${esc(fecha(f.creada_en))}</p>
            ${resp}
            ${editandoId === f.id ? editorHTML(f) : `<div class="pb-acc">${acciones(f)}</div>`}
        </div>`;
}

// ¿Ese registro es de la semana actual? (con un margen de 1 hora por si la base redondea)
const esEstaSemana = (i) => Math.abs(Date.parse(i.semana_inicio) - inicioSemanaLima()) < 3600000;
const intentosSemana = () => intentos.filter(esEstaSemana);

function intentoHTML(i) {
    const actual = esEstaSemana(i);
    const veces = i.intentos === 1 ? 'Lo intentó 1 vez' : `Lo intentó ${i.intentos} veces`;
    const cuando = actual
        ? 'esta semana'
        : `la semana del ${new Date(i.semana_inicio).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', timeZone: 'America/Lima' }).replace(/\./g, '')}`;
    // Cuántas preguntas había enviado: solo se sabe con certeza de esta semana (ya está cargada).
    const enviadas = semana.get(i.user_id) || 0;
    const detalle = actual
        ? `Ya había enviado ${enviadas} ${enviadas === 1 ? 'pregunta' : 'preguntas'} esta semana · `
        : '';
    return `
        <div class="admin-item pb-item pb-intento">
            <div class="pb-chips">
                <span class="pb-chip pb-sem">${veces} ${cuando}</span>
                ${i.codigo_curso ? `<span class="pb-chip pb-curso">${esc(nombreCurso(i.codigo_curso))}</span>` : ''}
            </div>
            <p class="pb-preg">${esc(quien(i.user_id))}</p>
            <p class="pb-meta">${detalle}primera vez: ${esc(fecha(i.primer_intento))} · última vez: ${esc(fecha(i.ultimo_intento))}</p>
        </div>`;
}

function pintar() {
    const ini = inicioSemanaLima();
    semana = new Map();
    todas.forEach((x) => { if (Date.parse(x.creada_en) >= ini) semana.set(x.user_id, (semana.get(x.user_id) || 0) + 1); });
    pintarCabecera();
    if (filtro === 'limite') {
        if (intentosError) {
            $('pbLista').innerHTML = '<p class="da-vacio">No pude leer los intentos: probablemente todavía no corriste asesorias-preguntas.sql en Supabase (la tabla asesorias_intentos_limite no existe). Hasta entonces, aquí siempre verás 0.</p>';
            return;
        }
        const actuales = intentosSemana();
        const anteriores = intentos.filter((i) => !esEstaSemana(i));
        let html = `<p class="pb-aviso-lim">Usuarios que ya habían usado sus ${ajustes.limite_semanal} preguntas de la semana y aun así intentaron enviar otra.</p>`;
        html += '<h4 class="pb-sub">Esta semana</h4>';
        html += actuales.length ? actuales.map(intentoHTML).join('') : `<p class="da-vacio">${VACIOS.limite}</p>`;
        if (anteriores.length) html += `<h4 class="pb-sub">Semanas anteriores</h4>${anteriores.map(intentoHTML).join('')}`;
        $('pbLista').innerHTML = html;
        return;
    }
    let lista;
    if (filtro === 'archivada') {
        $('pbLista').innerHTML = archivadas().length
            ? `<div class="pb-barra">
                    <p class="pb-aviso-lim">Aquí quedan las preguntas que archivaste. Puedes restaurarlas o eliminarlas de tu bandeja para siempre: eso solo afecta a tu vista, así que el usuario no pierde nada y las sigue viendo en su lista.</p>
                    <button type="button" class="da-btn pb-eliminar" data-pb="vaciar">Eliminar de mi bandeja todas las archivadas</button>
               </div>${[...archivadas()].sort((a, b) => Date.parse(b.respondida_en || b.revisada_en || b.creada_en) - Date.parse(a.respondida_en || a.revisada_en || a.creada_en)).map(itemHTML).join('')}`
            : `<p class="da-vacio">${VACIOS.archivada}</p>`;
        return;
    }
    if (filtro === 'todas') lista = visibles();
    else lista = visibles().filter((f) => f.estado === filtro);
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
    // Solo si sigue en espera: si el usuario la retiró mientras tanto, no pisamos su decisión.
    const { data, error } = await supabase
        .from('asesorias_preguntas')
        .update({ estado: nuevo, revisada_en: new Date().toISOString(), ...extra })
        .eq('id', f.id).eq('estado', 'en_espera')
        .select('id');
    if (error || !data || !data.length) {
        if (error) console.error('Cambiar estado:', error);
        alert(error
            ? 'No se pudo guardar. Inténtalo de nuevo.'
            : 'Esa pregunta ya no está en espera (quizá el usuario la retiró). Actualicé la lista.');
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
    if (!av.ok) alert('La pregunta quedó aceptada, pero no pude enviarle el aviso al usuario.');
}

async function rechazar(f, btn) {
    const ok = await confirmar(
        `El usuario recibirá: «${MSG_RECHAZO}» Esta consulta seguirá contando para su límite semanal.`,
        { titulo: '¿Rechazar esta consulta?', textoBoton: 'Sí, rechazar' },
    );
    if (!ok) return;
    btn.disabled = true;
    if (!(await cambiarEstado(f, 'rechazada'))) return;
    const av = await avisarAlumno(f, 'rechazada');
    await cargar();
    if (!av.ok) alert('La pregunta quedó rechazada, pero no pude enviarle el aviso al usuario.');
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
    if (!av.ok) alert('La respuesta quedó guardada, pero no pude enviarle el aviso al usuario.');
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

async function archivar(ids, valor) {
    // Con .in('estado', CERRADAS) y .eq('archivada_admin', ...) solo se toca lo que de verdad corresponde.
    let consulta = supabase.from('asesorias_preguntas').update({ archivada_admin: valor });
    consulta = ids ? consulta.in('id', ids) : consulta;
    const { data, error } = await consulta
        .in('estado', CERRADAS).eq('archivada_admin', !valor).select('id');
    if (error) { console.error('Archivar:', error); return null; }
    const tocadas = new Set((data || []).map((x) => String(x.id)));
    filas.forEach((f) => { if (tocadas.has(String(f.id))) f.archivada_admin = valor; });
    return tocadas.size;
}

async function archivarUna(f, btn, valor) {
    btn.disabled = true;
    const n = await archivar([f.id], valor);
    if (n === null) { btn.disabled = false; alert('No se pudo guardar. Inténtalo de nuevo.'); return; }
    if (n === 0) { alert('Esa pregunta ya no se puede archivar o restaurar. Actualicé la lista.'); await cargar(); return; }
    pintar();
}

// Elimina de TU bandeja (la base de datos marca la fila; el usuario sigue viendo la suya).
async function eliminarDeBandeja(lista, btn) {
    const { data, error } = await supabase.rpc('asesorias_eliminar_de_bandeja', { p_ids: lista.map((f) => f.id) });
    if (btn) btn.disabled = false;
    if (error || !data || !data.ok) {
        if (error) console.error('Eliminar de la bandeja:', error);
        alert('No se pudo eliminar. Inténtalo de nuevo.');
        return;
    }
    await cargar();
}

async function eliminarUna(f, btn) {
    const aviso = [
        `Se quitará para siempre de TU bandeja: «${recorte(f.pregunta, 80)}». No se puede deshacer desde aquí.`,
        'El usuario la seguirá viendo en su Mis preguntas, con su estado y su respuesta, y su límite semanal no cambia.',
        f.faq_id ? 'La pregunta frecuente publicada tampoco se toca.' : '',
    ].filter(Boolean).join(' ');
    if (!(await confirmar(aviso, { titulo: '¿Eliminar de tu bandeja?', textoBoton: 'Sí, eliminar' }))) return;
    btn.disabled = true;
    await eliminarDeBandeja([f], btn);
}

async function vaciarArchivo(btn) {
    const lista = archivadas();
    if (!lista.length) return;
    const aviso = [
        `Se quitarán para siempre de TU bandeja ${lista.length} ${lista.length === 1 ? 'pregunta archivada' : 'preguntas archivadas'}. No se puede deshacer desde aquí.`,
        'Los usuarios las seguirán viendo en su Mis preguntas y su límite semanal no cambia.',
    ].join(' ');
    if (!(await confirmar(aviso, { titulo: '¿Vaciar el archivo?', textoBoton: 'Sí, eliminar' }))) return;
    btn.disabled = true;
    await eliminarDeBandeja(lista, btn);
}

async function limpiarBandeja(btn) {
    const total = archivables().length;
    if (!total) return;
    const ok = await confirmar(
        `Se archivarán ${total} ${total === 1 ? 'pregunta ya cerrada' : 'preguntas ya cerradas'} (respondidas, rechazadas y retiradas). No se borran: las verás en "Archivadas" y siguen contando para el límite semanal de cada usuario.`,
        { titulo: '¿Limpiar la bandeja?', textoBoton: 'Sí, archivar' },
    );
    if (!ok) return;
    btn.disabled = true;
    const n = await archivar(archivables().map((f) => f.id), true);
    btn.disabled = false;
    if (n === null) { alert('No se pudo limpiar la bandeja. Inténtalo de nuevo.'); return; }
    pintar();
}

async function alternarModoAlumno(btn) {
    btn.disabled = true;
    const nuevo = ajustes.admin_exento === false;   // si estaba en modo usuario, vuelve a administrador (exento)
    const { data, error } = await supabase
        .from('asesorias_ajustes')
        .update({ admin_exento: nuevo, actualizada_en: new Date().toISOString() })
        .eq('id', 1).select('id');
    btn.disabled = false;
    if (error || !data || !data.length) {
        if (error) console.error('Modo usuario:', error);
        alert('No se pudo cambiar el modo. Inténtalo de nuevo.');
        return;
    }
    ajustes.admin_exento = nuevo;
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
    tabBtn.textContent = 'Preguntas de usuarios';
    primera.parentElement.appendChild(tabBtn);

    panel = document.createElement('div');
    panel.id = 'panelBandeja';
    panel.className = 'admin-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="da-cab">
            <div><h3>Preguntas de usuarios</h3><p class="da-resumen" id="pbResumen"></p></div>
            <div class="pb-cab-btns">
                <button type="button" class="da-btn" id="pbLimpiar" title="Archiva todas las preguntas ya cerradas (respondidas, rechazadas y retiradas) para dejar la bandeja limpia. No se borran." hidden>Limpiar bandeja</button>
                <button type="button" class="da-btn" id="pbExento" title="Con esto tu cuenta tiene el mismo límite semanal y la misma pausa que un usuario, para que veas lo que ellos ven.">Probar como usuario</button>
                <button type="button" class="da-btn" id="pbPausa" title="Pausa general: afecta a todos los usuarios. El límite semanal es por usuario y no depende de este botón.">Pausar para todos</button>
            </div>
        </div>
        <p class="pb-banner" id="pbBanner" hidden></p>
        <p class="pb-banner pb-banner-alumno" id="pbBannerAlumno" hidden></p>
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
    $('pbExento').addEventListener('click', (e) => alternarModoAlumno(e.currentTarget));
    $('pbLimpiar').addEventListener('click', (e) => limpiarBandeja(e.currentTarget));

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
        if (btn.dataset.pb === 'vaciar') return vaciarArchivo(btn);
        const item = btn.closest('.pb-item');
        const f = item && filas.find((x) => String(x.id) === item.dataset.id);
        if (!f) return;
        if (btn.dataset.pb === 'aceptar') aceptar(f, btn);
        else if (btn.dataset.pb === 'rechazar') rechazar(f, btn);
        else if (btn.dataset.pb === 'responder') abrirEditor(f);
        else if (btn.dataset.pb === 'guardar') guardarRespuesta(f, btn);
        else if (btn.dataset.pb === 'archivar') archivarUna(f, btn, true);
        else if (btn.dataset.pb === 'desarchivar') archivarUna(f, btn, false);
        else if (btn.dataset.pb === 'eliminar') eliminarUna(f, btn);
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