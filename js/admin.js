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
        });
    });
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