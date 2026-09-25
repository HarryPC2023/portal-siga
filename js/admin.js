// js/admin.js — Panel privado de administración.
// Muestra sugerencias, propuestas de asesorías y opiniones reportadas.
// La seguridad real vive en las políticas RLS de Supabase (solo el UID
// de Harry puede leer/borrar todo) — esta verificación del lado del
// cliente es solo para no dejar la pantalla mostrando "Cargando..."
// eternamente a alguien más y redirigirlo de vuelta con claridad.
import { supabase, requerirSesion, montarNavUsuario } from './auth-siga.js?v=9';

const ADMIN_UID = 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1';
const BUCKET_ASESORIAS = 'asesorias-adjuntos';

document.addEventListener('DOMContentLoaded', async () => {
    // Pinta el correo/avatar reales en el menú de cuenta del nav (mismo
    // patrón que gate.js usa en el resto de SIGA) — sin esto, el nav se
    // quedaba mostrando el placeholder "Nombre Apellido / correo@ejemplo.com"
    // indefinidamente, porque nada más lo reemplazaba en esta página.
    montarNavUsuario();

    const sesion = await requerirSesion('');
    if (!sesion) return;

    if (sesion.user.id !== ADMIN_UID) {
        window.location.href = 'dashboard.html';
        return;
    }

    document.getElementById('estadoAcceso').style.display = 'none';
    document.getElementById('contenidoAdmin').style.display = 'block';

    cargarSugerencias();
    cargarAsesorias();
    cargarOpiniones();
    cargarNotificaciones();
    inicializarFormNotificacion();

    document.querySelectorAll('.admin-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach((b) => b.classList.remove('activo'));
            btn.classList.add('activo');
            const tab = btn.dataset.tab;
            document.getElementById('panelSugerencias').style.display = tab === 'sugerencias' ? 'flex' : 'none';
            document.getElementById('panelAsesorias').style.display = tab === 'asesorias' ? 'flex' : 'none';
            document.getElementById('panelOpiniones').style.display = tab === 'opiniones' ? 'flex' : 'none';
            document.getElementById('panelNotificaciones').style.display = tab === 'notificaciones' ? 'flex' : 'none';
            document.getElementById('panelVistaIntranotas').style.display = tab === 'vista-intranotas' ? 'flex' : 'none';
            if (tab === 'vista-intranotas' && !viListaCargada) cargarListaVistaIntranotas();
        });
    });

    document.querySelectorAll('.vi-modo').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vi-modo').forEach((b) => b.classList.remove('activo'));
            btn.classList.add('activo');
            viModoRanking = btn.dataset.modo;
            pintarRankingVi();
        });
    });

    document.getElementById('viBuscar').addEventListener('input', (e) => {
        const q = normalizarTexto(e.target.value);
        document.querySelectorAll('#viUsuarioLista li').forEach((li) => {
            li.style.display = normalizarTexto(li.textContent).includes(q) ? '' : 'none';
        });
    });

    document.getElementById('viLimpiar').addEventListener('click', limpiarSeleccionVista);
});

function formatearFecha(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

// Evita que un título/descripción con < o > rompa el HTML de la lista.
function escapeHtml(valor) {
    const div = document.createElement('div');
    div.textContent = valor ?? '';
    return div.innerHTML;
}

/* ============================================================
   MODAL DE CONFIRMACIÓN (reemplaza al confirm() feo del navegador)
   Mismo look que el modal de "Eliminar tu cuenta" en Mi cuenta,
   para que todo el sitio se sienta consistente.
   ============================================================ */
function obtenerModalConfirmacion() {
    let modal = document.getElementById('modalConfirmarAdmin');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'modal-perfil';
    modal.id = 'modalConfirmarAdmin';
    modal.innerHTML = `
        <div class="modal-perfil-caja">
            <h2 id="modalConfirmarTitulo">¿Confirmar?</h2>
            <p class="intro" id="modalConfirmarTexto"></p>
            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button type="button" class="btn-secundario" id="modalConfirmarCancelar">Cancelar</button>
                <button type="button" class="btn-peligro" id="modalConfirmarAceptar">Sí, eliminar</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    return modal;
}

/** Reemplazo con el estilo de SIGA para window.confirm(). Devuelve una
 * Promesa<boolean>: true si el usuario aceptó, false si canceló. */
function confirmarAccion(mensaje, { titulo = '¿Eliminar esto?', textoBoton = 'Sí, eliminar' } = {}) {
    const modal = obtenerModalConfirmacion();
    modal.querySelector('#modalConfirmarTitulo').textContent = titulo;
    modal.querySelector('#modalConfirmarTexto').textContent = mensaje;

    const btnAceptar = modal.querySelector('#modalConfirmarAceptar');
    const btnCancelar = modal.querySelector('#modalConfirmarCancelar');
    btnAceptar.textContent = textoBoton;

    modal.classList.add('visible');

    return new Promise((resolve) => {
        function cerrar(resultado) {
            modal.classList.remove('visible');
            btnAceptar.removeEventListener('click', alAceptar);
            btnCancelar.removeEventListener('click', alCancelar);
            modal.removeEventListener('click', alClicFuera);
            resolve(resultado);
        }
        function alAceptar() { cerrar(true); }
        function alCancelar() { cerrar(false); }
        function alClicFuera(e) { if (e.target === modal) cerrar(false); }

        btnAceptar.addEventListener('click', alAceptar);
        btnCancelar.addEventListener('click', alCancelar);
        modal.addEventListener('click', alClicFuera);
    });
}

/* ============================================================
   SUGERENCIAS
   ============================================================ */
async function cargarSugerencias() {
    const cont = document.getElementById('listaSugerencias');
    const { data, error } = await supabase
        .from('sugerencias')
        .select('id, user_id, categoria, titulo, descripcion, estado, creado_en')
        .order('creado_en', { ascending: false });

    if (error) {
        cont.innerHTML = `<p class="admin-vacio">No se pudo cargar: ${escapeHtml(error.message)}</p>`;
        return;
    }
    if (!data.length) {
        cont.innerHTML = '<p class="admin-vacio">No hay sugerencias todavía.</p>';
        return;
    }

    cont.innerHTML = data.map((s) => `
        <div class="admin-item" data-id="${s.id}">
            <div class="admin-item-cabecera">
                <span class="admin-item-titulo">${escapeHtml(s.titulo)}</span>
                <span class="admin-badge admin-badge-${escapeHtml(s.estado)}">${escapeHtml(s.estado)}</span>
            </div>
            <p class="admin-item-meta">${escapeHtml(s.categoria)} · ${formatearFecha(s.creado_en)} · usuario ${escapeHtml((s.user_id || '').slice(0, 8))}…</p>
            <p class="admin-item-texto">${escapeHtml(s.descripcion)}</p>
            <button type="button" class="admin-btn-eliminar" data-id="${s.id}" aria-label="Eliminar sugerencia" title="Eliminar">🗑</button>
        </div>
    `).join('');

    cont.querySelectorAll('.admin-btn-eliminar').forEach((btn) => {
        btn.addEventListener('click', () => eliminarSugerencia(btn.dataset.id, btn));
    });
}

async function eliminarSugerencia(id, btn) {
    const ok = await confirmarAccion('Esta sugerencia se borrará de forma permanente y no podrás recuperarla.', {
        titulo: '¿Eliminar esta sugerencia?',
    });
    if (!ok) return;

    btn.disabled = true;

    // .select() al final hace que Supabase devuelva las filas realmente
    // borradas. Sin esto, si una política RLS bloquea el DELETE, Supabase
    // no da error — borra 0 filas en silencio y la UI se actualiza como si
    // hubiera funcionado, pero al recargar la fila sigue ahí. Revisando
    // data.length nos enteramos de inmediato si de verdad se borró algo.
    const { data, error } = await supabase.from('sugerencias').delete().eq('id', id).select();

    if (error) {
        btn.disabled = false;
        alert('No se pudo eliminar: ' + error.message);
        return;
    }

    if (!data || data.length === 0) {
        btn.disabled = false;
        alert('No se pudo eliminar: no tienes permiso para esta acción. Revisa las políticas RLS de la tabla "sugerencias" en Supabase.');
        return;
    }

    btn.closest('.admin-item').remove();
}

/* ============================================================
   OPINIONES REPORTADAS
   ============================================================ */
async function cargarOpiniones() {
    const cont = document.getElementById('listaOpiniones');
    const { data, error } = await supabase
        .from('opiniones')
        .select(`
            id, ciclo_estudiante, claridad, exigencia, carga_trabajo, evaluaciones,
            destacado, a_tener_en_cuenta, estado, reportes, creado_en,
            profesor_curso:profesor_curso_id (
                profesores ( nombre ),
                cursos ( nombre )
            )
        `)
        .gt('reportes', 0)
        .order('reportes', { ascending: false });

    if (error) {
        cont.innerHTML = `<p class="admin-vacio">No se pudo cargar: ${escapeHtml(error.message)}</p>`;
        return;
    }
    if (!data.length) {
        cont.innerHTML = '<p class="admin-vacio">No hay opiniones reportadas — todo tranquilo.</p>';
        return;
    }

    cont.innerHTML = data.map((o) => {
        const profesor = o.profesor_curso?.profesores?.nombre || 'Profesor desconocido';
        const curso = o.profesor_curso?.cursos?.nombre || 'Curso desconocido';
        const oculta = o.estado !== 'aprobado';
        return `
        <div class="admin-item" data-id="${o.id}">
            <div class="admin-item-cabecera">
                <span class="admin-item-titulo">${escapeHtml(profesor)} · ${escapeHtml(curso)}</span>
                <span class="admin-badge admin-badge-reportes">${o.reportes} reporte${o.reportes === 1 ? '' : 's'}</span>
            </div>
            <p class="admin-item-meta">Ciclo del alumno: ${escapeHtml(String(o.ciclo_estudiante ?? ''))} · ${formatearFecha(o.creado_en)} · estado actual: <strong>${escapeHtml(o.estado)}</strong></p>
            <p class="admin-item-meta">Claridad ${o.claridad} · Exigencia ${o.exigencia} · Carga ${o.carga_trabajo} · Evaluaciones ${o.evaluaciones}</p>
            ${o.destacado ? `<p class="admin-item-texto"><strong>Destacó:</strong> ${escapeHtml(o.destacado)}</p>` : ''}
            ${o.a_tener_en_cuenta ? `<p class="admin-item-texto"><strong>A tener en cuenta:</strong> ${escapeHtml(o.a_tener_en_cuenta)}</p>` : ''}
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button type="button" class="admin-btn-ocultar" data-op="${o.id}" ${oculta ? 'disabled' : ''}>
                    ${oculta ? 'Ya está oculta' : 'Ocultar esta opinión'}
                </button>
                <button type="button" class="admin-btn-descartar" data-op="${o.id}">
                    Descartar reporte
                </button>
            </div>
        </div>`;
    }).join('');

    cont.querySelectorAll('.admin-btn-ocultar').forEach((btn) => {
        btn.addEventListener('click', () => ocultarOpinion(btn.dataset.op, btn));
    });
    cont.querySelectorAll('.admin-btn-descartar').forEach((btn) => {
        btn.addEventListener('click', () => descartarReporte(btn.dataset.op, btn));
    });
}

// Oculta la opinión de la sección pública de Opiniones Y, de paso, la
// saca de esta lista de "reportadas" (ya la atendiste, no necesita
// seguir apareciendo aquí).
async function ocultarOpinion(opinionId, btn) {
    btn.disabled = true;
    btn.textContent = 'Ocultando…';

    const { error } = await supabase
        .from('opiniones')
        .update({ estado: 'rechazado', reportes: 0 })
        .eq('id', opinionId);

    if (error) {
        btn.disabled = false;
        btn.textContent = 'Ocultar esta opinión';
        alert('No se pudo ocultar: ' + error.message);
        return;
    }

    btn.closest('.admin-item').remove();
}

// La opinión se queda tal cual estaba (publicada) — solo se descarta el
// reporte y desaparece de esta lista. Para cuando revisas y decides que
// el reporte no tenía fundamento.
async function descartarReporte(opinionId, btn) {
    btn.disabled = true;
    btn.textContent = 'Descartando…';

    const { error } = await supabase
        .from('opiniones')
        .update({ reportes: 0 })
        .eq('id', opinionId);

    if (error) {
        btn.disabled = false;
        btn.textContent = 'Descartar reporte';
        alert('No se pudo descartar: ' + error.message);
        return;
    }

    btn.closest('.admin-item').remove();
}

/* ============================================================
   ASESORÍAS PROPUESTAS
   ============================================================ */
async function cargarAsesorias() {
    const cont = document.getElementById('listaAsesorias');
    const { data, error } = await supabase
        .from('asesorias_propuestas')
        .select('id, titulo, curso, ciclo, tipo_recurso, url_recurso, descripcion, autor_email, estado, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        cont.innerHTML = `<p class="admin-vacio">No se pudo cargar: ${escapeHtml(error.message)}</p>`;
        return;
    }
    if (!data.length) {
        cont.innerHTML = '<p class="admin-vacio">No hay propuestas todavía.</p>';
        return;
    }

    cont.innerHTML = data.map((a) => `
        <div class="admin-item" data-id="${a.id}">
            <div class="admin-item-cabecera">
                <span class="admin-item-titulo">${escapeHtml(a.titulo)}</span>
                <span class="admin-badge admin-badge-${escapeHtml(a.estado)}">${escapeHtml(a.estado)}</span>
            </div>
            <p class="admin-item-meta">${escapeHtml(a.curso)} · Ciclo ${escapeHtml(String(a.ciclo ?? ''))} · ${escapeHtml(a.tipo_recurso)} · ${formatearFecha(a.created_at)}</p>
            <p class="admin-item-meta">Enviado por: ${escapeHtml(a.autor_email)}</p>
            ${a.descripcion ? `<p class="admin-item-texto">${escapeHtml(a.descripcion)}</p>` : ''}
            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                ${a.url_recurso ? `<button type="button" class="modulo-accion admin-btn-ver-archivo" data-ruta="${escapeHtml(a.url_recurso)}">Ver archivo →</button>` : ''}
                <button type="button" class="admin-btn-eliminar" data-id="${a.id}" data-ruta="${escapeHtml(a.url_recurso || '')}" aria-label="Eliminar propuesta" title="Eliminar">🗑</button>
            </div>
        </div>
    `).join('');

    cont.querySelectorAll('.admin-btn-ver-archivo').forEach((btn) => {
        btn.addEventListener('click', () => abrirAdjuntoAsesoria(btn.dataset.ruta, btn));
    });
    cont.querySelectorAll('.admin-btn-eliminar').forEach((btn) => {
        btn.addEventListener('click', () => eliminarAsesoria(btn.dataset.id, btn.dataset.ruta, btn));
    });
}

// El bucket "asesorias-adjuntos" es privado: si `urlRecurso` es un link
// externo (Drive, YouTube, etc.) se abre tal cual. Si es un archivo
// propio subido a Storage, se pide una URL firmada temporal (5 min,
// suficiente para revisar/descargar) porque ya no existe una URL pública fija.
async function abrirAdjuntoAsesoria(urlRecurso, btn) {
    if (urlRecurso.startsWith('http')) {
        window.open(urlRecurso, '_blank', 'noopener');
        return;
    }

    const textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Abriendo…';

    const { data, error } = await supabase.storage.from(BUCKET_ASESORIAS).createSignedUrl(urlRecurso, 300);

    btn.disabled = false;
    btn.textContent = textoOriginal;

    if (error || !data) {
        alert('No se pudo abrir el archivo: ' + (error?.message || 'error desconocido'));
        return;
    }

    window.open(data.signedUrl, '_blank', 'noopener');
}

// Si la propuesta tenía un archivo propio (no un link externo), se borra
// también del Storage al eliminar la fila — para no dejar basura ahí.
// Recuerda: usa el botón "Ver archivo" para revisarlo/descargarlo ANTES
// de eliminar, porque esta acción no se puede deshacer.
async function eliminarAsesoria(id, urlRecurso, btn) {
    const tieneArchivoPropio = urlRecurso && !urlRecurso.startsWith('http');
    const mensaje = tieneArchivoPropio
        ? 'Se borrará esta propuesta junto con su archivo adjunto. Si no lo has descargado, ya no podrás recuperarlo.'
        : 'Esta propuesta se borrará de forma permanente y no podrás recuperarla.';

    const ok = await confirmarAccion(mensaje, { titulo: '¿Eliminar esta propuesta?' });
    if (!ok) return;

    btn.disabled = true;

    if (tieneArchivoPropio) {
        const { error: errStorage } = await supabase.storage.from(BUCKET_ASESORIAS).remove([urlRecurso]);
        if (errStorage) {
            // No detenemos el borrado de la fila por esto — solo avisamos
            // en consola. Es mejor que quede un archivo huérfano a que la
            // propuesta rechazada se quede pegada en el panel para siempre.
            console.error('No se pudo borrar el archivo del Storage:', errStorage);
        }
    }

    const { error } = await supabase.from('asesorias_propuestas').delete().eq('id', id);

    if (error) {
        btn.disabled = false;
        alert('No se pudo eliminar: ' + error.message);
        return;
    }

    btn.closest('.admin-item').remove();
}

/* ============================================================
   NOTIFICACIONES
   Reemplaza el flujo manual por Table Editor: se crea y se borra
   directo desde este panel. El canal ('solo_web' / 'web_y_correo')
   nunca se escribe a mano — lo decide el switch de "Enviar también
   por correo" para que no dependa de acordarse del valor exacto.
   ============================================================ */
async function cargarNotificaciones() {
    const cont = document.getElementById('listaNotificaciones');
    const [{ data, error }, { data: ocultas, error: errOcultas }] = await Promise.all([
        supabase
            .from('notificaciones')
            .select('id, titulo, mensaje, canal, creado_en')
            .order('creado_en', { ascending: false })
            .limit(20),
        // Reutiliza la misma tabla que usa la campanita de los alumnos
        // para "ocultar solo para mí" — acá con tu propio UID de admin,
        // en vez de crear una tabla o política nueva para esto.
        supabase.from('notificaciones_ocultas').select('notificacion_id').eq('user_id', ADMIN_UID),
    ]);

    if (error) {
        cont.innerHTML = `<p class="admin-vacio">No se pudo cargar: ${escapeHtml(error.message)}</p>`;
        return;
    }
    if (errOcultas) console.warn('No se pudo cargar tus notificaciones ocultas:', errOcultas);

    const idsOcultasParaMi = new Set((ocultas || []).map((o) => o.notificacion_id));
    const visibles = (data || []).filter((n) => !idsOcultasParaMi.has(n.id));

    if (!visibles.length) {
        cont.innerHTML = '<p class="admin-vacio">Todavía no has publicado ninguna notificación.</p>';
        return;
    }

    cont.innerHTML = visibles.map((n) => {
        const esCorreo = n.canal === 'web_y_correo';
        return `
        <div class="admin-item" data-id="${n.id}">
            <div class="admin-item-cabecera">
                <span class="admin-item-titulo">${escapeHtml(n.titulo)}</span>
                <span class="admin-badge admin-badge-${escapeHtml(n.canal)}">${esCorreo ? '📧 Web + correo' : '🌐 Solo web'}</span>
            </div>
            <p class="admin-item-meta">${formatearFecha(n.creado_en)}</p>
            <p class="admin-item-texto">${escapeHtml(n.mensaje)}</p>
            <button type="button" class="admin-btn-ocultar-notif" data-id="${n.id}" aria-label="Ocultar solo para mí" title="Ocultar solo para mí (sigue visible para los alumnos)">🙈</button>
            <button type="button" class="admin-btn-eliminar" data-id="${n.id}" aria-label="Eliminar para todos" title="Eliminar para todos">🗑</button>
        </div>`;
    }).join('');

    cont.querySelectorAll('.admin-btn-eliminar').forEach((btn) => {
        btn.addEventListener('click', () => eliminarNotificacion(btn.dataset.id, btn));
    });
    cont.querySelectorAll('.admin-btn-ocultar-notif').forEach((btn) => {
        btn.addEventListener('click', () => ocultarNotificacionParaMi(btn.dataset.id, btn));
    });
}

async function eliminarNotificacion(id, btn) {
    const ok = await confirmarAccion('Esta notificación se borrará para TODOS los alumnos — incluso quienes aún no la habían visto — y no podrás recuperarla. Si solo quieres quitarla de tu panel sin afectar a nadie más, usa el botón 🙈 "Ocultar solo para mí" en su lugar.', {
        titulo: '¿Eliminar esta notificación para todos?',
    });
    if (!ok) return;

    btn.disabled = true;

    // .select() al final para detectar en el acto si la política RLS de
    // borrado bloqueó la operación (mismo patrón que en Sugerencias).
    const { data, error } = await supabase.from('notificaciones').delete().eq('id', id).select();

    if (error) {
        btn.disabled = false;
        alert('No se pudo eliminar: ' + error.message);
        return;
    }

    if (!data || data.length === 0) {
        btn.disabled = false;
        alert('No se pudo eliminar: no tienes permiso para esta acción. Revisa la política RLS de DELETE en "notificaciones".');
        return;
    }

    btn.closest('.admin-item').remove();
}

/* No borra nada de la tabla "notificaciones" — solo agrega tu UID a
   notificaciones_ocultas para esa notificación, igual que cuando un
   alumno borra una de su propia campanita. Sigue existiendo para
   todos los demás, tal cual. No hay (todavía) una pantalla para
   "deshacer" esto — si más adelante la necesitas, se puede agregar. */
async function ocultarNotificacionParaMi(id, btn) {
    btn.disabled = true;

    const { error } = await supabase
        .from('notificaciones_ocultas')
        .upsert({ user_id: ADMIN_UID, notificacion_id: id }, { onConflict: 'user_id,notificacion_id', ignoreDuplicates: true });

    if (error) {
        btn.disabled = false;
        alert('No se pudo ocultar: ' + error.message);
        return;
    }

    btn.closest('.admin-item').remove();
}

function inicializarFormNotificacion() {
    const form = document.getElementById('formNotificacion');
    if (!form) return;

    const inputTitulo = document.getElementById('notifTitulo');
    const inputMensaje = document.getElementById('notifMensaje');
    const inputCorreo = document.getElementById('notifPorCorreo');
    const btnPublicar = document.getElementById('btnPublicarNotif');
    const msg = document.getElementById('notifMsg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = inputTitulo.value.trim();
        const mensaje = inputMensaje.value.trim();
        if (!titulo || !mensaje) return;

        const canal = inputCorreo.checked ? 'web_y_correo' : 'solo_web';

        btnPublicar.disabled = true;
        btnPublicar.textContent = 'Publicando…';
        msg.textContent = '';
        msg.className = 'admin-msg';

        const { error } = await supabase.from('notificaciones').insert({ titulo, mensaje, canal });

        btnPublicar.disabled = false;
        btnPublicar.textContent = 'Publicar notificación';

        if (error) {
            msg.textContent = 'No se pudo publicar: ' + error.message;
            msg.className = 'admin-msg error';
            return;
        }

        msg.textContent = canal === 'web_y_correo'
            ? '✅ Publicada — se está enviando el correo a los alumnos activos.'
            : '✅ Publicada — visible en la campanita de SIGA.';
        msg.className = 'admin-msg exito';

        form.reset();
        cargarNotificaciones();
    });
}
/* ============================================================
   VISTA INTRANOTAS (solo lectura) — rehecha en sep 2026 para las
   tablas nuevas (notas_curso, avance_curricular, perfiles_usuario).

   Sirve para dos cosas:
     1) Soporte: elegir un alumno y ver exactamente qué tiene guardado.
     2) Planificar asesorías: ver qué cursos lleva la comunidad y en
        cuáles hay más alumnos en riesgo.

   Seguridad: todo es SELECT. Depende de 3 políticas RLS de solo
   lectura para ADMIN_UID (admin_lee_notas_curso,
   admin_lee_avance_curricular, admin_lee_perfiles_usuario). Nunca
   toca credenciales_intralu. Ya no usa iframe: así notas.js de
   producción no necesita ningún "modo vista previa".
   ============================================================ */
const UMBRAL_APROBACION_VI = 10; // mismo umbral que intranotas/notas.js
const TOP_RANKING_VI = 10;

let viListaCargada = false;
let viPerfiles = {};        // { user_id: perfil }
let viNotasResumen = [];    // filas livianas de notas_curso (sin evaluaciones)
let viAlumnos = [];         // lista del selector, ya ordenada
let viModoRanking = 'actual';
let viPeriodoActual = null; // periodo más reciente presente en notas_curso (ej. "20262")
let viAlumnoActual = null;  // { alumno, notas, avance }

// Quita tildes y pasa a minúsculas para que la búsqueda no dependa
// de que el admin tipee los acentos exactos.
function normalizarTexto(v) {
    return (v ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Nombres y cursos vienen de datos de usuarios: siempre se escapan
// antes de ir a innerHTML.
function escaparHtml(v) {
    return (v ?? '').toString()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function periodoConGuionVi(p) {
    const s = String(p ?? '');
    return s.length === 5 ? `${s.slice(0, 4)}-${s.slice(4)}` : s;
}

function numeroONull(v) {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function formatearNota(v) {
    const n = numeroONull(v);
    return n === null ? '—' : n.toFixed(1);
}

// Nota de referencia para medir riesgo: la final si ya existe; si el
// curso sigue en proceso, el promedio de prácticas.
function notaReferencia(fila) {
    const final = numeroONull(fila.promedio_final);
    return final !== null ? final : numeroONull(fila.promedio_practicas);
}

function haceCuanto(iso) {
    if (!iso) return '—';
    const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return 'justo ahora';
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}

// Supabase devuelve como máximo 1000 filas por consulta: con 350+
// usuarios, notas_curso pasa ese límite rápido. Esto pide por páginas
// hasta traer todo.
async function traerTodo(crearConsulta) {
    const PAGINA = 1000;
    let desde = 0;
    const todas = [];
    for (; ;) {
        const { data, error } = await crearConsulta().range(desde, desde + PAGINA - 1);
        if (error) throw error;
        todas.push(...(data || []));
        if (!data || data.length < PAGINA) break;
        desde += PAGINA;
    }
    return todas;
}

async function cargarListaVistaIntranotas() {
    viListaCargada = true;
    const triggerTexto = document.getElementById('viUsuarioTriggerTexto');

    let perfiles, notas;
    try {
        [perfiles, notas] = await Promise.all([
            traerTodo(() => supabase.from('perfiles_usuario')
                .select('user_id, nombre, codigo_estudiante, facultad, carrera, periodo_ingreso, periodo_actual, foto_url, creado_en')
                .order('user_id')),
            traerTodo(() => supabase.from('notas_curso')
                .select('user_id, periodo, codigo_curso, nombre_curso, seccion, promedio_practicas, promedio_final, actualizado_en')
                .order('id')),
        ]);
    } catch (error) {
        triggerTexto.textContent = 'Error al cargar';
        document.getElementById('viMetricas').innerHTML =
            `<p class="admin-vacio">No se pudo cargar: ${escaparHtml(error.message)}. Revisa las políticas RLS de admin.</p>`;
        return;
    }

    viPerfiles = {};
    perfiles.forEach((p) => { viPerfiles[p.user_id] = p; });
    viNotasResumen = notas;
    viPeriodoActual = notas.reduce((max, f) => (String(f.periodo) > (max || '') ? String(f.periodo) : max), null);

    pintarMetricasVi(perfiles, notas);
    pintarFacultadesVi(perfiles);
    pintarRankingVi();
    construirSelectorAlumnosVi(perfiles, notas);
}

function pintarMetricasVi(perfiles, notas) {
    const alumnosConNotas = new Set(notas.map((f) => f.user_id)).size;
    const periodos = new Set(notas.map((f) => `${f.user_id}|${f.periodo}`)).size;
    const ultima = notas.reduce((max, f) => (f.actualizado_en && f.actualizado_en > (max || '') ? f.actualizado_en : max), null);

    const tarjeta = (etiqueta, valor) =>
        `<div class="vi-metrica"><span>${etiqueta}</span><strong>${valor}</strong></div>`;

    document.getElementById('viMetricas').innerHTML =
        tarjeta('Perfiles completos', perfiles.length) +
        tarjeta('Alumnos con notas', alumnosConNotas) +
        tarjeta('Periodos sincronizados', periodos) +
        tarjeta('Última sincronización', haceCuanto(ultima));
}

function pintarBarras(contenedorId, filas, textoVacio) {
    const cont = document.getElementById(contenedorId);
    if (!filas.length) {
        cont.innerHTML = `<p class="admin-vacio" style="padding:12px 0;">${textoVacio}</p>`;
        return;
    }
    const max = Math.max(...filas.map((f) => f.valor));
    cont.innerHTML = filas.map((f) => `
        <div class="vi-barra-fila">
            <span class="vi-barra-etiqueta" title="${escaparHtml(f.titulo || f.etiqueta)}">${escaparHtml(f.etiqueta)}</span>
            <div class="vi-barra-pista"><div class="vi-barra-relleno" style="width:${Math.max(4, Math.round((f.valor / max) * 100))}%"></div></div>
            <span class="vi-barra-detalle">${f.detalle}</span>
        </div>`).join('');
}

function pintarFacultadesVi(perfiles) {
    const conteo = {};
    perfiles.forEach((p) => {
        const clave = p.facultad || 'Sin facultad aún';
        conteo[clave] = (conteo[clave] || 0) + 1;
    });
    const filas = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .map(([facultad, n]) => ({ etiqueta: facultad, valor: n, detalle: String(n) }));
    pintarBarras('viFacultades', filas, 'Todavía no hay perfiles.');
}

function pintarRankingVi() {
    const esActual = viModoRanking === 'actual';
    const filas = esActual
        ? viNotasResumen.filter((f) => String(f.periodo) === viPeriodoActual)
        : viNotasResumen;

    document.getElementById('viRankingNota').textContent = esActual
        ? `Periodo ${periodoConGuionVi(viPeriodoActual) || '—'} · ordenado por alumnos en riesgo (nota < ${UMBRAL_APROBACION_VI})`
        : 'Todos los periodos · ordenado por cantidad de alumnos';

    const porCurso = {};
    filas.forEach((f) => {
        const c = porCurso[f.codigo_curso] || (porCurso[f.codigo_curso] = {
            codigo: f.codigo_curso, nombre: '', alumnos: new Set(), notas: [], bajo: 0,
        });
        if (!c.nombre && f.nombre_curso) c.nombre = f.nombre_curso;
        c.alumnos.add(f.user_id);
        const ref = notaReferencia(f);
        if (ref !== null) {
            c.notas.push(ref);
            if (ref < UMBRAL_APROBACION_VI) c.bajo += 1;
        }
    });

    const cursos = Object.values(porCurso).map((c) => ({
        ...c,
        nAlumnos: c.alumnos.size,
        promedio: c.notas.length ? c.notas.reduce((a, b) => a + b, 0) / c.notas.length : null,
    }));
    cursos.sort(esActual
        ? (a, b) => (b.bajo - a.bajo) || (b.nAlumnos - a.nAlumnos)
        : (a, b) => (b.nAlumnos - a.nAlumnos) || (b.bajo - a.bajo));

    const etiquetaBajo = esActual ? 'en riesgo' : 'desaprob.';
    pintarBarras('viRanking', cursos.slice(0, TOP_RANKING_VI).map((c) => ({
        etiqueta: `${c.codigo} ${c.nombre}`,
        titulo: `${c.codigo} — ${c.nombre}`,
        valor: c.nAlumnos,
        detalle: `${c.nAlumnos} alum. · prom ${c.promedio === null ? '—' : c.promedio.toFixed(1)}`
            + (c.bajo ? ` · <span class="vi-riesgo">${c.bajo} ${etiquetaBajo}</span>` : ''),
    })), 'Todavía no hay notas en este periodo.');
}

function construirSelectorAlumnosVi(perfiles, notas) {
    const resumen = {};
    notas.forEach((f) => {
        const r = resumen[f.user_id] || (resumen[f.user_id] = { periodos: new Set(), ultima: null });
        r.periodos.add(String(f.periodo));
        if (f.actualizado_en && f.actualizado_en > (r.ultima || '')) r.ultima = f.actualizado_en;
    });

    const ids = new Set([...perfiles.map((p) => p.user_id), ...Object.keys(resumen)]);
    viAlumnos = [...ids].map((userId) => ({
        userId,
        perfil: viPerfiles[userId] || {},
        nPeriodos: resumen[userId]?.periodos.size || 0,
        ultima: resumen[userId]?.ultima || null,
    }));
    // Primero quien sincronizó más recientemente; al final, quien nunca sincronizó.
    viAlumnos.sort((a, b) => (b.ultima || '').localeCompare(a.ultima || ''));

    const opciones = viAlumnos.map((a, i) => {
        const codigo = a.perfil.codigo_estudiante || '(sin código)';
        const nombre = a.perfil.nombre || `Usuario ${a.userId.slice(0, 8)}…`;
        const extra = a.nPeriodos
            ? `${a.nPeriodos} periodo${a.nPeriodos === 1 ? '' : 's'} · ${haceCuanto(a.ultima)}`
            : 'sin notas';
        return { value: String(i), label: escaparHtml(`${codigo} — ${nombre} · ${extra}`) };
    });

    inicializarSelectPersonalizado({
        triggerId: 'viUsuarioTrigger',
        textoId: 'viUsuarioTriggerTexto',
        listaId: 'viUsuarioLista',
        valorId: 'viUsuarioValor',
        opciones,
        alElegir: (indiceStr) => mostrarAlumnoVi(viAlumnos[Number(indiceStr)]),
    });

    document.getElementById('viBuscar').disabled = false;
    document.getElementById('viUsuarioTriggerTexto').textContent =
        viAlumnos.length ? 'Elige un alumno…' : 'Todavía no hay usuarios';
}

async function mostrarAlumnoVi(alumno) {
    const detalle = document.getElementById('viDetalle');
    document.getElementById('viVacio').style.display = 'none';
    detalle.style.display = 'block';

    const p = alumno.perfil;
    const nombre = p.nombre || '(sin nombre)';
    const iniciales = nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
    const avatar = p.foto_url
        ? `<img src="${escaparHtml(p.foto_url)}" alt="" class="vi-avatar">`
        : `<div class="vi-avatar">${escaparHtml(iniciales)}</div>`;
    const datos = [
        p.codigo_estudiante,
        [p.facultad, p.carrera].filter(Boolean).join(' · '),
        p.periodo_ingreso ? `ingreso ${periodoConGuionVi(p.periodo_ingreso)}` : null,
        p.periodo_actual ? `actual ${periodoConGuionVi(p.periodo_actual)}` : null,
    ].filter(Boolean).join(' · ');

    document.getElementById('viFicha').innerHTML = `${avatar}
        <div><p class="vi-ficha-nombre">${escaparHtml(nombre)}</p>
        <p class="vi-ficha-datos">${escaparHtml(datos || 'Sin datos de perfil')}</p></div>`;
    document.getElementById('viPeriodos').innerHTML = '';
    document.getElementById('viAvance').textContent = '';
    document.getElementById('viTabla').innerHTML = '<p class="admin-vacio" style="padding:16px 0;">Cargando…</p>';
    document.getElementById('viJsonSalida').textContent = 'Cargando…';

    const [notasRes, avanceRes] = await Promise.all([
        supabase.from('notas_curso')
            .select('periodo, codigo_curso, nombre_curso, seccion, promedio_practicas, promedio_final, nota_asistencia, evaluaciones, actualizado_en')
            .eq('user_id', alumno.userId),
        supabase.from('avance_curricular')
            .select('facultad, carrera, categoria, ciclo, codigo_curso, nombre_curso, creditos, nota, veces_llevado, situacion, periodo_normalizado, actualizado_en')
            .eq('user_id', alumno.userId),
    ]);

    // Si el admin ya eligió a otro alumno mientras esto cargaba, no pisar su vista.
    if (document.getElementById('viUsuarioValor').value !== String(viAlumnos.indexOf(alumno))) return;

    if (notasRes.error || avanceRes.error) {
        const msg = (notasRes.error || avanceRes.error).message;
        document.getElementById('viTabla').innerHTML = `<p class="admin-vacio">Error: ${escaparHtml(msg)}</p>`;
        document.getElementById('viJsonSalida').textContent = msg;
        return;
    }

    const notas = notasRes.data || [];
    const avance = avanceRes.data || [];
    viAlumnoActual = { alumno, notas, avance };

    if (avance.length) {
        const aprobados = avance.filter((c) => /aprob/i.test(c.situacion || '')
            || (numeroONull(c.nota) !== null && numeroONull(c.nota) >= UMBRAL_APROBACION_VI));
        const creditos = aprobados.reduce((s, c) => s + (Number(c.creditos) || 0), 0);
        document.getElementById('viAvance').textContent =
            `Avance: ${aprobados.length} de ${avance.length} cursos · ${creditos} créditos aprobados`;
    } else {
        document.getElementById('viAvance').textContent = 'Sin avance curricular guardado';
    }

    const periodos = [...new Set(notas.map((f) => String(f.periodo)))].sort().reverse();
    document.getElementById('viPeriodos').innerHTML = periodos.map((per, i) =>
        `<button type="button" class="vi-chip${i === 0 ? ' activo' : ''}" data-periodo="${escaparHtml(per)}">${escaparHtml(periodoConGuionVi(per))}</button>`
    ).join('');
    document.querySelectorAll('#viPeriodos .vi-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#viPeriodos .vi-chip').forEach((c) => c.classList.remove('activo'));
            chip.classList.add('activo');
            pintarTablaPeriodoVi(chip.dataset.periodo);
        });
    });

    if (periodos.length) {
        pintarTablaPeriodoVi(periodos[0]);
    } else {
        document.getElementById('viTabla').innerHTML =
            '<p class="admin-vacio" style="padding:16px 0;">Este alumno todavía no sincronizó ningún periodo.</p>';
    }

    document.getElementById('viJsonSalida').textContent = JSON.stringify({
        perfil: p, notas_curso: notas, avance_curricular: avance,
    }, null, 2);
}

function pintarTablaPeriodoVi(periodo) {
    const filas = (viAlumnoActual?.notas || [])
        .filter((f) => String(f.periodo) === periodo)
        .sort((a, b) => (a.codigo_curso || '').localeCompare(b.codigo_curso || ''));

    const claseNota = (v) => {
        const n = numeroONull(v);
        return n !== null && n < UMBRAL_APROBACION_VI ? ' class="vi-riesgo"' : '';
    };

    document.getElementById('viTabla').innerHTML = `
        <div class="vi-tabla-scroll"><table class="vi-tabla">
            <thead><tr><th>Código</th><th>Curso</th><th>Secc.</th><th>Prácticas</th><th>Final</th><th>Asist.</th></tr></thead>
            <tbody>${filas.map((f) => `<tr>
                <td>${escaparHtml(f.codigo_curso)}</td>
                <td>${escaparHtml(f.nombre_curso)}</td>
                <td>${escaparHtml(f.seccion || '—')}</td>
                <td${claseNota(f.promedio_practicas)}>${formatearNota(f.promedio_practicas)}</td>
                <td${claseNota(f.promedio_final)}>${formatearNota(f.promedio_final)}</td>
                <td>${formatearNota(f.nota_asistencia)}</td>
            </tr>`).join('')}</tbody>
        </table></div>`;
}

function limpiarSeleccionVista() {
    document.getElementById('viUsuarioValor').value = '';
    document.getElementById('viUsuarioTriggerTexto').textContent = viAlumnos.length ? 'Elige un alumno…' : 'Cargando lista…';
    document.getElementById('viBuscar').value = '';
    document.querySelectorAll('#viUsuarioLista li').forEach((li) => { li.style.display = ''; });
    document.getElementById('viDetalle').style.display = 'none';
    document.getElementById('viVacio').style.display = 'block';
    viAlumnoActual = null;
}