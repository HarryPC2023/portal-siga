// js/admin-asesorias.js — Admin de Asesorías (se carga desde admin.js).
//
// Hace dos cosas, sin tocar el resto de Admin:
//  1) Agrega la pestaña "Demanda de Asesorías": qué piden más los alumnos
//     ("Lo necesito", con quién lo pidió), los pedidos de curso y los reportes
//     de error. En cada fila de "Lo que más piden" puedes AVISAR a quienes lo
//     pidieron cuando ya esté publicado, o ELIMINAR esos pedidos.
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
//  4) Pestaña propia "Actividad de Asesorías": quién abrió, imprimió o descargó el Excel
//     de cada asesoría web (tabla asesorias_eventos, que llena js/asesorias-registro.js).
//
// Tablas: asesorias_demanda (lo_necesito | pedido | reporte), asesorias_eventos (uso),
// asesorias_demanda_conteo (vista, ya no la usa este panel: el conteo se calcula
// con las filas de asesorias_demanda para poder mostrar quién pidió cada cosa),
// asesorias_propuestas y notificaciones (avisos personales).
// El SQL está en asesorias-admin.sql y notificaciones-personales.sql.
import { supabase } from './auth-siga.js?v=9';
import { CURSOS, EVALUACIONES, estadoEvaluacion, rutaRecurso } from './asesorias-cursos.js?v=1';

const LS_VISTO = 'siga_admin_visto_demanda';
const $ = (id) => document.getElementById(id);

let ayuda = { escapeHtml: null, formatearFecha: null, confirmarAccion: null };
let panel = null;
let tabBtn = null;
let cargado = false;
let estadoTimer = null;

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
    // En tandas de 80 para que la dirección de la consulta no se haga demasiado larga cuando haya muchos usuarios.
    const tandas = [];
    for (let i = 0; i < ids.length; i += 80) tandas.push(ids.slice(i, i + 80));
    const respuestas = await Promise.all(tandas.map((t) => supabase.from('perfiles_usuario').select('user_id, nombre, codigo_estudiante').in('user_id', t)));
    respuestas.forEach(({ data, error }) => { if (!error && data) data.forEach((p) => mapa.set(p.user_id, p)); });
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

// Id del usuario logueado (para no contar ni marcar como ajenos tus propios votos).
async function miId() {
    try {
        const { data } = await supabase.auth.getSession();
        return data?.session?.user?.id || null;
    } catch (e) {
        return null;
    }
}

async function refrescarGlobito() {
    const [{ data, error }, yo] = await Promise.all([
        supabase.from('asesorias_demanda').select('creado_en, user_id').in('tipo', ['pedido', 'reporte', 'lo_necesito']),
        miId(),
    ]);
    if (error || !data) return;
    const visto = Date.parse(localStorage.getItem(LS_VISTO) || '') || 0;
    pintarGlobito(data.filter((r) => r.user_id !== yo && (Date.parse(r.creado_en) || 0) > visto).length);
}

function marcarVista() {
    localStorage.setItem(LS_VISTO, new Date().toISOString());
    pintarGlobito(0);
}

// ───────────── Bloque 1: lo que más piden (quién, avisar y eliminar) ─────────────
const ETQ_SIN_EV = 'Sin evaluación específica';

// Mensajito de resultado debajo de la ayuda del bloque (se borra solo).
function estado(texto) {
    const el = $('daEstado');
    if (!el) return;
    el.textContent = texto || '';
    clearTimeout(estadoTimer);
    if (texto) estadoTimer = setTimeout(() => { el.textContent = ''; }, 7000);
}

// Claves de las filas que están desplegadas (para reabrirlas después de avisar o eliminar).
function filasAbiertas() {
    return new Set([...$('daConteo').querySelectorAll('.da-fila.abierta')].map((x) => x.dataset.clave));
}

// ¿Ya está publicado lo que pidieron? Si sí, arma el aviso que se les manda.
//  - Con evaluación: avisa de esa evaluación (un solo aviso por persona).
//  - Sin evaluación (votos de cuando no se podía elegir): avisa por curso, con la
//    lista de lo que ya hay. Si después publicas algo más, la lista cambia y se
//    puede volver a avisar (el origen del aviso incluye la lista).
function infoAviso(codigo, evaluacion) {
    const curso = CURSOS.find((c) => c.codigo === codigo);
    if (!curso) return { publicada: false };
    if (evaluacion) {
        if (estadoEvaluacion(curso, evaluacion) !== 'disponible') return { publicada: false };
        return {
            publicada: true,
            origen: `demanda:${codigo}:${evaluacion}`,
            titulo: 'Ya está la asesoría que pediste',
            mensaje: `«${evaluacion} · ${recorte(curso.nombre, 70)}» ya está en Asesorías.`,
            enlace: `asesorias-curso.html?c=${curso.slug}&ev=${evaluacion}`,
        };
    }
    const lista = EVALUACIONES.filter((e) => estadoEvaluacion(curso, e) === 'disponible');
    if (!lista.length) return { publicada: false };
    return {
        publicada: true,
        origen: `demanda:${codigo}:general:${lista.join('-')}`,
        titulo: 'Ya hay asesorías de un curso que pediste',
        mensaje: `Ya hay asesorías de ${recorte(curso.nombre, 70)}: ${lista.join(', ')}.`,
        enlace: `asesorias-curso.html?c=${curso.slug}`,
    };
}

async function pintarConteo(abrir = new Set()) {
    const cont = $('daConteo');
    const { data, error } = await supabase
        .from('asesorias_demanda')
        .select('user_id, codigo_curso, evaluacion, creado_en')
        .eq('tipo', 'lo_necesito')
        .limit(2000);
    if (error) { cont.innerHTML = `<p class="da-vacio">No se pudo cargar: ${esc(error.message)}</p>`; return 0; }
    if (!data.length) { cont.innerHTML = '<p class="da-vacio">Todavía nadie tocó "Lo necesito".</p>'; return 0; }

    // Agrupa por curso + evaluación (evaluacion null = voto de cuando no se podía elegir).
    const grupos = new Map();
    data.forEach((r) => {
        const clave = `${r.codigo_curso}|${r.evaluacion || ''}`;
        if (!grupos.has(clave)) grupos.set(clave, { clave, codigo_curso: r.codigo_curso, evaluacion: r.evaluacion, filas: [] });
        grupos.get(clave).filas.push(r);
    });
    const filas = [...grupos.values()]
        .map((g) => ({
            ...g,
            ids: [...new Set(g.filas.map((f) => f.user_id))],
            aviso: infoAviso(g.codigo_curso, g.evaluacion),
        }))
        // Orden alfabético por curso y, dentro del curso, por el orden de las evaluaciones (PC1, PC2, EP, PC3…).
        // La barra de cada fila sigue mostrando cuánta demanda tiene, comparada con la más pedida.
        .sort((a, b) => nombreCurso(a.codigo_curso).localeCompare(nombreCurso(b.codigo_curso), 'es', { sensitivity: 'base' })
            || EVALUACIONES.indexOf(String(a.evaluacion || '').toUpperCase()) - EVALUACIONES.indexOf(String(b.evaluacion || '').toUpperCase()));

    // Quiénes ya recibieron cada aviso (para "Avisados X de Y"). Tú puedes leer
    // todas las notificaciones (política notif_select); si no se pudiera, se oculta ese dato.
    const origenes = [...new Set(filas.map((f) => f.aviso.origen).filter(Boolean))];
    const avisados = new Map();
    let leyoAvisos = true;
    if (origenes.length) {
        const { data: ns, error: errN } = await supabase.from('notificaciones').select('destinatario, origen_id').in('origen_id', origenes);
        if (errN || !ns) leyoAvisos = false;
        else ns.forEach((n) => {
            if (!avisados.has(n.origen_id)) avisados.set(n.origen_id, new Set());
            avisados.get(n.origen_id).add(n.destinatario);
        });
    }
    filas.forEach((f) => {
        const ya = avisados.get(f.aviso.origen) || new Set();
        f.yaAvisados = f.ids.filter((id) => ya.has(id));
        f.pendientes = f.ids.filter((id) => !ya.has(id));
    });

    const [mapa, yo] = await Promise.all([cargarQuien(data.map((r) => r.user_id)), miId()]);
    const max = Math.max(...filas.map((f) => f.ids.length));
    cont.innerHTML = filas.map((f, i) => {
        const etiqueta = f.evaluacion
            ? esc(f.evaluacion)
            : `<span title="Votos de cuando no se podía elegir una evaluación">${ETQ_SIN_EV}</span>`;
        const quienes = [...f.filas]
            .sort((a, b) => (Date.parse(b.creado_en) || 0) - (Date.parse(a.creado_en) || 0))
            .map((r) => {
                const av = leyoAvisos && f.aviso.origen && f.yaAvisados.includes(r.user_id) ? ' <span class="da-av">· avisado ✓</span>' : '';
                return `<li><b>${esc(quien(mapa, r.user_id))}</b>${r.user_id === yo ? ' <em>(tú)</em>' : ''} <span>· ${esc(fecha(r.creado_en))}</span>${av}</li>`;
            })
            .join('');

        let nota = '';
        let botonAvisar = '';
        if (!f.aviso.publicada) {
            nota = '<span class="da-nota">Aún no está publicada: cuando la publiques podrás avisar aquí.</span>';
        } else {
            if (leyoAvisos) nota = `<span class="da-nota">Avisados ${f.yaAvisados.length} de ${f.ids.length}</span>`;
            if (f.pendientes.length) {
                botonAvisar = `<button type="button" class="da-ok" data-avisar="${i}">Avisar que ya está${leyoAvisos ? ` (${f.pendientes.length})` : ''}</button>`;
            }
        }
        const acciones = `<li class="da-acc">${nota}<span class="da-acc-btns">${botonAvisar}<button type="button" class="da-del" data-eliminar="${i}">Eliminar</button></span></li>`;

        return `
        <div class="da-fila" role="button" tabindex="0" aria-expanded="false" data-clave="${esc(f.clave)}" data-quienes="daQ${i}">
            <div class="da-nombre">${esc(nombreCurso(f.codigo_curso))} <small>· ${etiqueta}</small></div>
            <div class="da-num">${f.ids.length} ${f.ids.length === 1 ? 'persona' : 'personas'} <span class="da-flecha">▾</span></div>
            <div class="da-barra"><i style="width:${Math.max(6, Math.round((100 * f.ids.length) / max))}%"></i></div>
        </div>
        <ul class="da-quienes" id="daQ${i}" hidden>${quienes}${acciones}</ul>`;
    }).join('');

    // Al tocar una fila se despliega la lista de quiénes lo pidieron.
    cont.querySelectorAll('.da-fila').forEach((fila) => {
        const alternar = () => {
            const lista = $(fila.dataset.quienes);
            const abrirla = lista.hidden;
            lista.hidden = !abrirla;
            fila.setAttribute('aria-expanded', String(abrirla));
            fila.classList.toggle('abierta', abrirla);
        };
        fila.addEventListener('click', alternar);
        fila.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); }
        });
        if (abrir.has(fila.dataset.clave)) alternar();
    });
    cont.querySelectorAll('[data-avisar]').forEach((b) => b.addEventListener('click', () => avisarGrupo(filas[Number(b.dataset.avisar)], b)));
    cont.querySelectorAll('[data-eliminar]').forEach((b) => b.addEventListener('click', () => eliminarGrupo(filas[Number(b.dataset.eliminar)], b)));
    return filas.reduce((s, f) => s + f.ids.length, 0);
}

// Avisa (notificación personal) a quienes pidieron esto y aún no recibieron el aviso.
async function avisarGrupo(f, btn) {
    const a = f.aviso;
    const n = f.pendientes.length;
    const ok = await confirmar(
        `${a.mensaje} Se enviará a ${n} ${n === 1 ? 'persona' : 'personas'}.`,
        { titulo: '¿Avisar que ya está?', textoBoton: 'Sí, avisar' },
    );
    if (!ok) return;
    btn.disabled = true;
    let enviados = 0;
    let fallidos = 0;
    for (const id of f.pendientes) {
        const r = await crearAvisoPersonal({
            destinatario: id, tipo: 'asesorias', titulo: a.titulo, mensaje: a.mensaje, enlace: a.enlace, origen: a.origen,
        });
        if (r.ok) enviados += 1; else fallidos += 1;
    }
    estado(fallidos
        ? `Avisé a ${enviados}; ${fallidos} no se pudo (mira la consola con F12).`
        : `Aviso enviado a ${enviados} ${enviados === 1 ? 'persona' : 'personas'}.`);
    await pintarConteo(filasAbiertas());
}

// Borra TODOS los pedidos de esa fila. No se puede deshacer.
async function eliminarGrupo(f, btn) {
    const n = f.filas.length;
    const que = f.evaluacion ? `${f.evaluacion} · ${nombreCurso(f.codigo_curso)}` : `${nombreCurso(f.codigo_curso)} (${ETQ_SIN_EV.toLowerCase()})`;
    const ok = await confirmar(
        `Se borrarán ${n} ${n === 1 ? 'pedido' : 'pedidos'} de «${que}». No se puede deshacer.`,
        { titulo: '¿Eliminar estos pedidos?', textoBoton: 'Sí, eliminar' },
    );
    if (!ok) return;
    btn.disabled = true;
    let consulta = supabase.from('asesorias_demanda').delete()
        .eq('tipo', 'lo_necesito').eq('codigo_curso', f.codigo_curso);
    consulta = f.evaluacion ? consulta.eq('evaluacion', f.evaluacion) : consulta.is('evaluacion', null);
    const { data, error } = await consulta.select('id');
    if (error || !data || !data.length) {
        btn.disabled = false;
        alert('No se pudo eliminar: ' + (error ? error.message : 'no se borró ninguna fila'));
        return;
    }
    estado(`Se eliminaron ${data.length} ${data.length === 1 ? 'pedido' : 'pedidos'}.`);
    await pintarConteo(filasAbiertas());
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

// ───────────── Uso de las asesorías (tabla asesorias_eventos) ─────────────
// Quién abrió, imprimió o descargó el Excel de cada asesoría web. Solo lo lees tú
// (la política RLS de la tabla). Tus propias pruebas se ocultan por defecto.
let usoIncluirYo = false;
let usoTimer = null;
let usoRango = 'todo';      // periodo que se muestra: 'todo' | 'hoy' | '7' | '30'
let usoBusqueda = '';       // texto para buscar a una persona (nombre o código)
let usoCache = null;        // { data, mapa } de la última carga: filtrar o escribir en el buscador no vuelve a pedir nada a Supabase
let usoBuscarTimer = null;
const RANGOS_USO = { todo: 'Todo el tiempo', hoy: 'Hoy', '7': 'Últimos 7 días', '30': 'Últimos 30 días' };

// Nombre de la pestaña. Si algún día prefieres otro, cámbialo solo aquí.
const TITULO_ACTIVIDAD = 'Actividad de Asesorías';
let tabAct = null;
let panelAct = null;
let cargadoAct = false;

function nombreCursoPorSlug(slug) {
    const c = CURSOS.find((x) => x.slug === slug);
    return c ? c.nombre : slug;
}

function estadoUso(texto) {
    const el = $('daUsoEstado');
    if (!el) return;
    el.textContent = texto || '';
    clearTimeout(usoTimer);
    if (texto) usoTimer = setTimeout(() => { el.textContent = ''; }, 7000);
}

function usoAbiertas() {
    return new Set([...$('daUso').querySelectorAll('.da-fila.abierta')].map((x) => x.dataset.clave));
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Revisa cada asesoría web publicada en el catálogo y comprueba que su index.html lleve la línea
// de js/asesorias-registro.js. Sin esa línea la asesoría funciona, pero no aparece en esta pestaña
// (nadie sabría que se abrió o se imprimió). Lee el HTML publicado, así que refleja lo que ven los alumnos.
async function pintarSinRegistro() {
    const cont = $('daSinReg');
    if (!cont) return;

    const web = [];
    CURSOS.forEach((c) => (c.recursos || []).forEach((r) => {
        if (r.tipo === 'web' && (r.estado || 'disponible') === 'disponible') web.push({ curso: c, r });
    }));
    if (!web.length) { cont.innerHTML = '<p class="da-vacio">No hay asesorías web publicadas en el catálogo.</p>'; return; }

    cont.innerHTML = '<p class="da-vacio">Revisando las asesorías publicadas…</p>';
    const resultados = await Promise.all(web.map(async ({ curso, r }) => {
        const etiqueta = `${curso.nombre} · ${String(r.evaluacion || '').toUpperCase()} · ${r.periodo || ''}`;
        try {
            const resp = await fetch(rutaRecurso(curso, r), { cache: 'no-store' });
            if (!resp.ok) return { etiqueta, estado: 'error', detalle: `no se pudo leer (error ${resp.status})` };
            const html = await resp.text();
            return { etiqueta, estado: html.includes('asesorias-registro.js') ? 'ok' : 'falta' };
        } catch (e) {
            return { etiqueta, estado: 'error', detalle: 'no se pudo leer (sin conexión)' };
        }
    }));

    const faltan = resultados.filter((x) => x.estado === 'falta');
    const errores = resultados.filter((x) => x.estado === 'error');
    const ok = resultados.length - faltan.length - errores.length;
    const lineas = [];
    if (faltan.length) {
        lineas.push(`<p class="da-estado" style="color:#B3261E">⚠️ ${plural(faltan.length, 'asesoría publicada NO tiene', 'asesorías publicadas NO tienen')} la línea del registro de uso:</p>`);
        lineas.push(`<ul class="da-quienes">${faltan.map((x) => `<li><b>${esc(x.etiqueta)}</b> <span>· agrega <code>&lt;script type="module" src="../../../../../js/asesorias-registro.js"&gt;</code> debajo de scripts.js en su index.html</span></li>`).join('')}</ul>`);
    }
    if (errores.length) {
        lineas.push(`<ul class="da-quienes">${errores.map((x) => `<li><b>${esc(x.etiqueta)}</b> <span>· ${esc(x.detalle)}</span></li>`).join('')}</ul>`);
    }
    if (!faltan.length && !errores.length) {
        lineas.push(`<p class="da-estado">✅ Las ${resultados.length} asesorías web publicadas registran su uso.</p>`);
    } else if (ok) {
        lineas.push(`<p class="da-sub">${ok === 1 ? 'La otra asesoría sí registra' : `Las otras ${ok} asesorías sí registran`} su uso.</p>`);
    }
    cont.innerHTML = lineas.join('');
}

// Minúsculas y sin tildes, para que «alvaro» encuentre a «Álvaro».
const sinTildes = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Desde cuándo (en milisegundos) se muestran los registros según el periodo elegido. 0 = sin límite.
function inicioDeRango(rango) {
    const ahora = new Date();
    if (rango === 'hoy') return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    if (rango === '7') return ahora.getTime() - 7 * 86400000;
    if (rango === '30') return ahora.getTime() - 30 * 86400000;
    return 0;
}

// Las 4 tarjetas de resumen de arriba. Se calculan con los registros YA filtrados (periodo, búsqueda, tus pruebas).
function pintarTarjetasUso(eventos, filas) {
    const cont = $('daUsoTarjetas');
    if (!cont) return;
    const de = (a) => eventos.filter((e) => e.accion === a);
    const personas = new Set(eventos.map((e) => e.user_id));
    const abrieron = new Set(de('abrio').map((e) => e.user_id));
    const imprimieron = new Set(de('imprimio').map((e) => e.user_id));
    // «Volvieron»: personas con 2 o más aperturas de la MISMA asesoría.
    const aperturas = new Map();
    de('abrio').forEach((e) => {
        const k = `${e.user_id}|${e.curso}|${e.periodo}|${e.evaluacion}`;
        aperturas.set(k, (aperturas.get(k) || 0) + 1);
    });
    const volvieron = new Set([...aperturas.entries()].filter(([, n]) => n > 1).map(([k]) => k.split('|')[0]));
    const masUsada = [...filas].sort((a, b) => b.personas - a.personas || b.abrioVeces - a.abrioVeces
        || nombreCursoPorSlug(a.curso).localeCompare(nombreCursoPorSlug(b.curso), 'es', { sensitivity: 'base' }))[0];

    const tarjeta = (clase, icono, titulo, valor, sub, esTexto) => `
        <div class="da-tarjeta ${clase}">
            <div class="da-t-top"><span class="da-t-ico" aria-hidden="true">${icono}</span><span class="da-t-tit">${titulo}</span></div>
            <div class="${esTexto ? 'da-t-txt' : 'da-t-num'}">${valor}</div>
            <div class="da-t-sub">${sub}</div>
        </div>`;
    cont.innerHTML = [
        tarjeta('da-t-morado', '👥', 'Personas con actividad', personas.size, plural(eventos.length, 'acción', 'acciones')),
        tarjeta('da-t-azul', '🏆', 'Asesoría más usada',
            masUsada ? esc(`${nombreCursoPorSlug(masUsada.curso)} · ${String(masUsada.evaluacion).toUpperCase()}`) : '—',
            masUsada ? plural(masUsada.personas, 'persona', 'personas') : 'sin datos', true),
        tarjeta('da-t-naranja', '🔁', 'Volvieron a abrirla', volvieron.size,
            abrieron.size ? `de ${plural(abrieron.size, 'persona que abrió', 'personas que abrieron')}` : 'nadie abrió todavía'),
        tarjeta('da-t-verde', '🖨️', 'Imprimieron / PDF', imprimieron.size, plural(de('imprimio').length, 'impresión', 'impresiones')),
    ].join('');
}

async function pintarUso(abrir = new Set(), { recargar = true } = {}) {
    const cont = $('daUso');
    if (recargar || !usoCache) {
        const { data, error } = await supabase
            .from('asesorias_eventos')
            .select('user_id, curso, periodo, evaluacion, accion, detalle, creado_en')
            .order('creado_en', { ascending: false })
            .limit(5000);
        if (error) { cont.innerHTML = `<p class="da-vacio">No se pudo cargar: ${esc(error.message)}</p>`; return; }
        usoCache = { data, mapa: await cargarQuien(data.map((r) => r.user_id)) };
    }
    const { data, mapa } = usoCache;
    const yo = await miId();

    // Filtros: tus pruebas, periodo y búsqueda por persona (nombre o código, sin importar tildes ni mayúsculas).
    const desde = inicioDeRango(usoRango);
    const q = sinTildes(usoBusqueda);
    const eventos = data.filter((r) => (usoIncluirYo || r.user_id !== yo)
        && (!desde || (Date.parse(r.creado_en) || 0) >= desde)
        && (!q || sinTildes(quien(mapa, r.user_id)).includes(q)));

    const resumenEl = $('daUsoResumen');
    if (resumenEl) {
        resumenEl.textContent = `Mostrando: ${RANGOS_USO[usoRango]}${q ? ` · «${usoBusqueda.trim()}»` : ''}${usoIncluirYo ? ' · con tus pruebas' : ''}`;
    }
    if (!eventos.length) {
        pintarTarjetasUso([], []);
        const hayFiltros = !!q || usoRango !== 'todo';
        cont.innerHTML = `<p class="da-vacio">${!data.length ? 'Todavía nadie abrió, imprimió ni descargó nada.' : (hayFiltros ? 'Nadie coincide con estos filtros.' : 'Solo hay registros tuyos (activa «Incluir mis propias pruebas» para verlos).')}</p>`;
        return;
    }

    // Agrupa por asesoría: curso + periodo + evaluación.
    const grupos = new Map();
    eventos.forEach((r) => {
        const clave = `${r.curso}|${r.periodo}|${r.evaluacion}`;
        if (!grupos.has(clave)) grupos.set(clave, { clave, curso: r.curso, periodo: r.periodo, evaluacion: r.evaluacion, eventos: [] });
        grupos.get(clave).eventos.push(r);
    });
    const filas = [...grupos.values()].map((g) => {
        const de = (a) => g.eventos.filter((e) => e.accion === a);
        const personas = (lista) => new Set(lista.map((e) => e.user_id)).size;
        const abrio = de('abrio'); const imprimio = de('imprimio'); const excel = de('excel');
        const porEjemplo = new Map();
        excel.forEach((e) => { const k = e.detalle || '(sin detalle)'; porEjemplo.set(k, (porEjemplo.get(k) || 0) + 1); });
        return {
            ...g,
            personas: personas(g.eventos),
            abrieron: personas(abrio), abrioVeces: abrio.length,
            imprimieron: personas(imprimio), imprimioVeces: imprimio.length,
            excelPersonas: personas(excel), excelVeces: excel.length,
            porEjemplo: [...porEjemplo.entries()].sort((a, b) => b[1] - a[1]),
        };
    // Orden alfabético por curso; dentro del curso, por evaluación (PC1, PC2, EP, PC3…) y luego periodo (el más reciente primero).
    // La barra de cada fila sigue mostrando cuánta gente tuvo, comparada con la asesoría más usada.
    }).sort((a, b) => nombreCursoPorSlug(a.curso).localeCompare(nombreCursoPorSlug(b.curso), 'es', { sensitivity: 'base' })
        || EVALUACIONES.indexOf(String(a.evaluacion).toUpperCase()) - EVALUACIONES.indexOf(String(b.evaluacion).toUpperCase())
        || String(b.periodo).localeCompare(String(a.periodo)));

    pintarTarjetasUso(eventos, filas);
    const max = Math.max(...filas.map((f) => f.personas));

    // Una sección por acción, con una línea por persona: cuántas veces lo hizo, la primera y la última vez.
    // Las personas van en ORDEN ALFABÉTICO: primero las que tienen nombre, luego las que solo tienen
    // código y al final las cuentas sin perfil («usuario 3ca3deb3…»).
    const rangoPersona = (id) => {
        const p = mapa.get(id);
        return p && p.nombre ? 0 : (p && p.codigo_estudiante ? 1 : 2);
    };
    const seccionUso = (titulo, evs, conEjemplos, repite) => {
        const porPersona = new Map();
        evs.forEach((e) => {
            if (!porPersona.has(e.user_id)) porPersona.set(e.user_id, { id: e.user_id, veces: 0, ejemplos: [], fechas: [] });
            const p = porPersona.get(e.user_id);
            p.veces += 1;
            p.fechas.push(e.creado_en);
            if (e.detalle && !p.ejemplos.includes(e.detalle)) p.ejemplos.push(e.detalle);
        });
        const personas = [...porPersona.values()].map((p) => {
            // Las fechas se ordenan de la más antigua a la más nueva (no se depende del orden en que lleguen).
            p.fechas.sort((a, b) => (Date.parse(a) || 0) - (Date.parse(b) || 0));
            p.primera = p.fechas[0];
            p.ultima = p.fechas[p.fechas.length - 1];
            return p;
        }).sort((a, b) => rangoPersona(a.id) - rangoPersona(b.id)
            || quien(mapa, a.id).localeCompare(quien(mapa, b.id), 'es', { sensitivity: 'base' }));
        const repiten = personas.filter((p) => p.veces > 1).length;
        const cab = `<li style="margin-top:8px;font-weight:700;color:#4B2390">${titulo} — ${plural(personas.length, 'persona', 'personas')} <span style="font-weight:400">(${plural(evs.length, 'vez', 'veces')}${repiten ? ` · ${repiten} ${repite}` : ''})</span></li>`;
        if (!personas.length) return `${cab}<li><span>Nadie todavía.</span></li>`;

        // Una tabla por sección: persona, veces, (ejemplos), primera y última vez. Quien repitió tiene un
        // botón con su número de veces que despliega la fecha de CADA visita, de la más antigua a la más nueva.
        const columnas = conEjemplos ? 5 : 4;
        const filasTabla = personas.map((p, i) => {
            const nombre = `<b>${esc(quien(mapa, p.id))}</b>${p.id === yo ? ' <em>(tú)</em>' : ''}`;
            const veces = p.veces > 1
                ? `<button type="button" class="da-ver-visitas" aria-expanded="false" title="Ver la fecha de cada vez">${p.veces} <span class="da-flecha">▾</span></button>`
                : '1';
            const celdaEjemplos = conEjemplos ? `<td>${esc(p.ejemplos.join(', ') || '—')}</td>` : '';
            const fila = `<tr class="${i % 2 ? 'da-alt' : ''}"><td>${nombre}</td><td class="da-col-num">${veces}</td>${celdaEjemplos}<td>${esc(fecha(p.primera))}</td><td>${esc(fecha(p.ultima))}</td></tr>`;
            if (p.veces < 2) return fila;
            const visitas = p.fechas.map((f, n) => `<span class="da-visita"><b>${n + 1}.ª</b> ${esc(fecha(f))}</span>`).join('');
            return `${fila}<tr class="da-visitas" hidden><td colspan="${columnas}"><span class="da-visitas-t">Fechas:</span>${visitas}</td></tr>`;
        }).join('');
        const encabezado = `<tr><th>Persona</th><th class="da-col-num">Veces</th>${conEjemplos ? '<th>Ejemplos</th>' : ''}<th>Primera vez</th><th>Última vez</th></tr>`;
        return `${cab}<li class="da-tabla-li"><div class="da-tabla-caja"><table class="da-tabla"><thead>${encabezado}</thead><tbody>${filasTabla}</tbody></table></div></li>`;
    };

    cont.innerHTML = filas.map((f, i) => {
        const de = (a) => f.eventos.filter((e) => e.accion === a);
        // Mini-contadores de la fila (personas distintas): 👁 abrieron · 🖨 imprimieron · 📊 descargaron Excel. En gris si es 0.
        const chips = [
            ['ojo', '👁', f.abrieron, 'abrió', 'abrieron'],
            ['imp', '🖨️', f.imprimieron, 'imprimió', 'imprimieron'],
            ['xls', '📊', f.excelPersonas, 'descargó Excel', 'descargaron Excel'],
        ].map(([clase, icono, n, uno, varios]) => `<span class="da-chip da-chip-${clase}${n ? '' : ' cero'}" title="${plural(n, 'persona', 'personas')} ${n === 1 ? uno : varios}">${icono} ${n}</span>`).join('');
        const detalle = [
            seccionUso('👁 Abrieron', de('abrio'), false, 'volvieron a abrirla'),
            seccionUso('🖨️ Imprimieron / PDF', de('imprimio'), false, 'imprimieron más de una vez'),
            seccionUso('📊 Descargaron Excel', de('excel'), true, 'descargaron más de una vez'),
        ].join('');
        return `
        <div class="da-fila" role="button" tabindex="0" aria-expanded="false" data-clave="${esc(f.clave)}" data-quienes="daU${i}">
            <div class="da-nombre">${esc(nombreCursoPorSlug(f.curso))} <small>· ${esc(String(f.evaluacion).toUpperCase())} · ${esc(f.periodo)}</small> <span class="da-chips">${chips}</span></div>
            <div class="da-num">${plural(f.personas, 'persona', 'personas')} <span class="da-flecha">▾</span></div>
            <div class="da-barra"><i style="width:${Math.max(6, Math.round((100 * f.personas) / max))}%"></i></div>
        </div>
        <ul class="da-quienes" id="daU${i}" hidden>${detalle}</ul>`;
    }).join('');

    // Al tocar una fila se despliega el detalle de quién hizo qué.
    cont.querySelectorAll('.da-fila').forEach((fila) => {
        const alternar = () => {
            const lista = $(fila.dataset.quienes);
            const abrirla = lista.hidden;
            lista.hidden = !abrirla;
            fila.setAttribute('aria-expanded', String(abrirla));
            fila.classList.toggle('abierta', abrirla);
        };
        fila.addEventListener('click', alternar);
        fila.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); }
        });
        if (q || abrir.has(fila.dataset.clave)) alternar(); // con una búsqueda activa se abren todas, para ver a la persona
    });
}

// Borra SOLO los registros hechos con tu cuenta (tus pruebas). Los de los alumnos no se tocan.
async function borrarMisPruebasUso() {
    const yo = await miId();
    if (!yo) { estadoUso('No encontré tu sesión. Vuelve a iniciar sesión.'); return; }
    const ok = await confirmar(
        'Se borrarán TODOS los registros de uso (abrió, imprimió, Excel) hechos con tu cuenta. Los de los alumnos no se tocan. No se puede deshacer.',
        { titulo: '¿Borrar tus pruebas?', textoBoton: 'Sí, borrar' },
    );
    if (!ok) return;
    const { error } = await supabase.from('asesorias_eventos').delete().eq('user_id', yo);
    if (error) { estadoUso(`No se pudo borrar: ${error.message}`); return; }
    estadoUso('Listo: borré tus pruebas.');
    await pintarUso(usoAbiertas());
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
            <p class="da-sub">Personas que tocaron "Lo necesito", por curso y evaluación. Toca una fila para ver quiénes son, avisarles cuando ya esté publicada o eliminar sus pedidos.</p>
            <p class="da-estado" id="daEstado" role="status"></p>
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

    // ── Segunda pestaña: Actividad de Asesorías (quién abre, imprime o descarga) ──
    tabAct = document.createElement('button');
    tabAct.type = 'button';
    tabAct.className = 'admin-tab';
    tabAct.dataset.tab = 'actividad';
    tabAct.textContent = TITULO_ACTIVIDAD;
    primera.parentElement.appendChild(tabAct);

    panelAct = document.createElement('div');
    panelAct.id = 'panelActividad';
    panelAct.className = 'admin-panel';
    panelAct.style.display = 'none';
    panelAct.innerHTML = `
        <div class="da-cab">
            <div><h3>${TITULO_ACTIVIDAD}</h3><p class="da-resumen" id="daUsoResumen"></p></div>
            <button type="button" class="da-btn" id="daUsoActualizar">Actualizar</button>
        </div>
        <div class="da-filtros">
            <label class="da-buscar"><span aria-hidden="true">🔎</span><input type="search" id="daUsoBuscar" placeholder="Buscar persona (nombre o código)" autocomplete="off"></label>
            <select id="daUsoRango" aria-label="Periodo">
                ${Object.entries(RANGOS_USO).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}
            </select>
            <label class="da-yo"><input type="checkbox" id="daUsoYo"> Incluir mis propias pruebas</label>
            <button type="button" class="da-del" id="daUsoBorrar">Borrar mis pruebas</button>
        </div>
        <p class="da-estado" id="daUsoEstado" role="status"></p>
        <div class="da-tarjetas" id="daUsoTarjetas"></div>
        <div class="da-bloque"><h3>Asesorías publicadas y registro de uso</h3>
            <p class="da-sub">Comprueba que cada asesoría web del catálogo lleve la línea que registra quién la abre, imprime o descarga. Si alguna no la tiene, aquí te avisa.</p>
            <div id="daSinReg"></div></div>
        <div class="da-bloque"><h3>Por asesoría</h3>
            <p class="da-sub">Quién abrió, imprimió o descargó el Excel de cada asesoría web, desde que se activó el registro. Los números de colores de cada fila son personas distintas: 👁 abrieron, 🖨️ imprimieron, 📊 descargaron Excel. Toca una fila para ver los nombres, códigos y fechas. «Imprimió» significa que se abrió el diálogo de impresión o PDF (el navegador no avisa si al final se imprimió). Si alguien volvió varias veces, toca su número para ver la fecha de cada vez. Si buscas a una persona, las filas se abren solas.</p>
            <div id="daUso"></div></div>`;
    ultimoPanel.parentElement.appendChild(panelAct);

    tabAct.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((b) => b.classList.toggle('activo', b === tabAct));
        document.querySelectorAll('.admin-panel').forEach((p) => { p.style.display = p === panelAct ? 'flex' : 'none'; });
        if (!cargadoAct) { cargadoAct = true; pintarUso(); pintarSinRegistro(); }
    });
    // Ocultarla cuando se elige cualquier otra pestaña (delegado, sirve también para las que se crean después)
    const barraTabs = primera.parentElement;
    barraTabs.addEventListener('click', (e) => {
        const b = e.target.closest('.admin-tab');
        if (b && b !== tabAct) panelAct.style.display = 'none';
    });
    $('daUsoActualizar').addEventListener('click', () => { pintarUso(usoAbiertas()); pintarSinRegistro(); });
    // Despliega / oculta las fechas de cada visita de una persona (un solo listener, aunque se vuelva a pintar).
    $('daUso').addEventListener('click', (e) => {
        const boton = e.target.closest('.da-ver-visitas');
        if (!boton) return;
        const detalle = boton.closest('tr')?.nextElementSibling;
        if (!detalle || !detalle.classList.contains('da-visitas')) return;
        const abrir = detalle.hidden;
        detalle.hidden = !abrir;
        boton.setAttribute('aria-expanded', String(abrir));
    });
    // Filtros: se vuelven a pintar con lo que ya está cargado (sin pedir nada otra vez a Supabase).
    $('daUsoYo').addEventListener('change', (e) => { usoIncluirYo = e.target.checked; pintarUso(usoAbiertas(), { recargar: false }); });
    $('daUsoRango').addEventListener('change', (e) => { usoRango = e.target.value; pintarUso(usoAbiertas(), { recargar: false }); });
    $('daUsoBuscar').addEventListener('input', (e) => {
        clearTimeout(usoBuscarTimer);
        const texto = e.target.value;
        usoBuscarTimer = setTimeout(() => { usoBusqueda = texto; pintarUso(usoAbiertas(), { recargar: false }); }, 200);
    });
    $('daUsoBorrar').addEventListener('click', borrarMisPruebasUso);
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
    css.href = 'css/admin-asesorias.css?v=3';
    document.head.appendChild(css);
    if (construirPestana()) refrescarGlobito();
    observarPropuestas();
}