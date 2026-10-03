// js/notificaciones-siga.js — Campanita de notificaciones, en el encabezado de TODAS las páginas
// (el HTML está en _includes/nav.html; sus ids empiezan con "campana" para no chocar con los de Admin).
// Las notificaciones pueden ser para todos (destinatario vacío) o personales
// (destinatario = el alumno). Cada una tiene un TIPO que se corresponde con
// un interruptor de Perfil → Avisos:
//     asesorias     → avisos_asesorias        "Nuevas asesorías"
//     respuestas    → avisos_respuestas       "Respuestas a lo que envías"
//     recordatorios → recordatorios
//     novedades     → actualizaciones_modulos "Novedades de SIGA"
// Si el alumno apagó un tipo, esas notificaciones no se le muestran.
// Si la notificación trae `enlace`, al tocarla se marca leída y se abre.
// Cada alumno tiene su propio estado de leído/no-leído en
// notificaciones_leidas. El foquito de Ideas es solo un <a> al hash de
// perfil.html, no necesita JS propio.
import { supabase, requerirSesion } from './auth-siga.js?v=9';

document.addEventListener('DOMContentLoaded', async () => {
    const item = document.querySelector('.acceso-item');
    const btn = document.getElementById('btnCampana');
    const panel = document.getElementById('panelCampana');
    const lista = document.getElementById('listaCampana');
    const badge = document.getElementById('badgeCampana');
    const btnLimpiar = document.getElementById('btnLimpiarCampana');
    if (!item || !btn || !panel || !lista) return;

    const sesion = await requerirSesion('');
    if (!sesion) return;

    // Respeta la preferencia de notificaciones (Perfil → Preferencias).
    // Si el usuario las desactivó, ni se cargan ni se muestra la campanita.
    const { data: prefs } = await supabase
        .from('preferencias_notificacion')
        .select('notificaciones_activas, avisos_asesorias, avisos_respuestas, recordatorios, actualizaciones_modulos')
        .eq('user_id', sesion.user.id)
        .maybeSingle();

    if (prefs && prefs.notificaciones_activas === false) {
        item.style.display = 'none';
        return;
    }

    let notificaciones = [];
    let idsLeidas = new Set();

    // Tipo de notificación → columna de Perfil → Avisos que la controla.
    const COLUMNA_POR_TIPO = {
        asesorias: 'avisos_asesorias',
        respuestas: 'avisos_respuestas',
        recordatorios: 'recordatorios',
        novedades: 'actualizaciones_modulos',
    };
    const tipoPermitido = (tipo) => {
        const columna = COLUMNA_POR_TIPO[tipo];
        return !columna || !prefs || prefs[columna] !== false;
    };

    // Los textos pueden traer lo que escribió un alumno (título de su idea): se escapan.
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    // Raíz del sitio (para enlaces como "perfil.html#ideas" desde cualquier página).
    const raiz = (() => {
        const logo = document.querySelector('.app-nav-logo');
        return (logo && logo.href ? logo.href : window.location.href).replace(/[^/]*$/, '');
    })();

    function formatearFecha(iso) {
        const fecha = new Date(iso);
        const dias = Math.floor((Date.now() - fecha.getTime()) / 86400000);
        if (dias <= 0) return 'Hoy';
        if (dias === 1) return 'Ayer';
        if (dias < 7) return `Hace ${dias} días`;
        return fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    }

    function pintar() {
        const noLeidas = notificaciones.filter((n) => !idsLeidas.has(n.id));

        badge.hidden = noLeidas.length === 0;
        if (noLeidas.length) badge.textContent = noLeidas.length > 9 ? '9+' : String(noLeidas.length);

        if (!notificaciones.length) {
            lista.innerHTML = '<p class="acceso-panel-vacio">No hay notificaciones todavía.</p>';
            if (btnLimpiar) btnLimpiar.hidden = true;
            return;
        }

        lista.innerHTML = notificaciones.map((n) => `
      <div class="notif-item ${idsLeidas.has(n.id) ? '' : 'no-leida'}" data-id="${n.id}"${n.enlace ? ` data-enlace="${esc(n.enlace)}" style="cursor:pointer"` : ''}>
        <button type="button" class="notif-item-borrar" title="Borrar notificación" aria-label="Borrar notificación">✕</button>
        <span class="notif-item-titulo">${esc(n.titulo)}</span>
        <span class="notif-item-mensaje">${esc(n.mensaje)}</span>
        <span class="notif-item-fecha">${formatearFecha(n.creado_en)}${n.destinatario ? ' · Para ti' : ''}</span>
      </div>
    `).join('');

        lista.querySelectorAll('.notif-item-borrar').forEach((btnBorrar) => {
            btnBorrar.addEventListener('click', (e) => {
                e.stopPropagation(); // no abre/cierra el panel al tocar el ✕
                const id = btnBorrar.closest('.notif-item')?.dataset.id;
                if (id !== undefined) ocultarNotificacion(id);
            });
        });

        lista.querySelectorAll('.notif-item[data-enlace]').forEach((fila) => {
            fila.addEventListener('click', async () => {
                const id = fila.dataset.id;
                const destino = fila.dataset.enlace;
                await marcarUnaLeida(id);
                window.location.href = new URL(destino, raiz).href;
            });
        });

        if (btnLimpiar) btnLimpiar.hidden = notificaciones.length === 0;
    }

    async function cargar() {
        const [{ data: notifs, error: errNotifs }, { data: leidas, error: errLeidas }, { data: ocultas, error: errOcultas }] = await Promise.all([
            supabase.from('notificaciones').select('id, titulo, mensaje, creado_en, tipo, destinatario, enlace').order('creado_en', { ascending: false }).limit(30),
            supabase.from('notificaciones_leidas').select('notificacion_id').eq('user_id', sesion.user.id),
            supabase.from('notificaciones_ocultas').select('notificacion_id').eq('user_id', sesion.user.id),
        ]);

        if (errNotifs) {
            console.error('Error cargando notificaciones:', errNotifs);
            lista.innerHTML = '<p class="acceso-panel-vacio">No se pudieron cargar.</p>';
            return;
        }
        if (errLeidas) console.warn('Error cargando estado de lectura:', errLeidas);
        if (errOcultas) console.warn('Error cargando notificaciones ocultadas:', errOcultas);

        // Las que el usuario ya borró de su lista no vuelven a aparecer,
        // aunque sigan existiendo globalmente para los demás alumnos.
        const idsOcultas = new Set((ocultas || []).map((o) => o.notificacion_id));
        // Además de lo que la base ya filtra por permisos, se descartan las
        // personales ajenas y los tipos que el alumno apagó en Avisos.
        notificaciones = (notifs || []).filter((n) => !idsOcultas.has(n.id)
            && (!n.destinatario || n.destinatario === sesion.user.id)
            && tipoPermitido(n.tipo));
        idsLeidas = new Set((leidas || []).map((l) => l.notificacion_id));
        pintar();
    }

    /* Borra UNA notificación solo para este alumno — no la borra para
       nadie más, solo la marca como "oculta" en su propia fila. */
    async function ocultarNotificacion(id) {
        const notif = notificaciones.find((n) => String(n.id) === String(id));
        if (!notif) return;

        notificaciones = notificaciones.filter((n) => n.id !== notif.id);
        idsLeidas.delete(notif.id);
        pintar(); // respuesta visual inmediata, sin esperar la red

        const { error } = await supabase
            .from('notificaciones_ocultas')
            .upsert({ user_id: sesion.user.id, notificacion_id: notif.id }, { onConflict: 'user_id,notificacion_id', ignoreDuplicates: true });

        if (error) console.warn('No se pudo ocultar la notificación:', error);
    }

    /* "Limpiar todas": oculta de una sola vez todo lo que se está
       mostrando ahora mismo (mismo mecanismo, en lote). */
    async function limpiarTodas() {
        if (!notificaciones.length) return;
        const idsAOcultar = notificaciones.map((n) => n.id);

        notificaciones = [];
        idsLeidas.clear();
        pintar();

        const filas = idsAOcultar.map((id) => ({ user_id: sesion.user.id, notificacion_id: id }));
        const { error } = await supabase
            .from('notificaciones_ocultas')
            .upsert(filas, { onConflict: 'user_id,notificacion_id', ignoreDuplicates: true });

        if (error) console.warn('No se pudieron limpiar las notificaciones:', error);
    }

    /* Marca UNA como leída (al tocar una notificación con enlace). */
    async function marcarUnaLeida(id) {
        const notif = notificaciones.find((n) => String(n.id) === String(id));
        if (!notif || idsLeidas.has(notif.id)) return;
        idsLeidas.add(notif.id);
        const { error } = await supabase
            .from('notificaciones_leidas')
            .upsert({ user_id: sesion.user.id, notificacion_id: notif.id }, { onConflict: 'user_id,notificacion_id', ignoreDuplicates: true });
        if (error) console.warn('No se pudo marcar como leída:', error);
    }

    async function marcarTodasLeidas() {
        const pendientes = notificaciones.filter((n) => !idsLeidas.has(n.id));
        if (!pendientes.length) return;

        pendientes.forEach((n) => idsLeidas.add(n.id));
        pintar(); // respuesta visual inmediata, sin esperar la red

        const filas = pendientes.map((n) => ({ user_id: sesion.user.id, notificacion_id: n.id }));
        // ignoreDuplicates: si por alguna carrera de eventos ya existía la
        // fila (ej. dos pestañas abiertas), no truena por violar la
        // llave primaria (user_id, notificacion_id).
        const { error } = await supabase
            .from('notificaciones_leidas')
            .upsert(filas, { onConflict: 'user_id,notificacion_id', ignoreDuplicates: true });

        if (error) console.warn('No se pudo marcar como leídas:', error);
    }

    // En el celular el panel ocupa el ancho de la pantalla (position: fixed): se coloca justo debajo
    // del encabezado, sea cual sea su altura (el encabezado tiene dos filas en pantallas angostas).
    function ubicarPanel() {
        const nav = document.querySelector('.app-nav');
        const celular = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
        panel.style.top = celular && nav ? `${Math.max(8, Math.round(nav.getBoundingClientRect().bottom + 8))}px` : '';
    }
    window.addEventListener('resize', ubicarPanel);

    btn.addEventListener('click', () => {
        const abierto = panel.classList.toggle('abierto');
        btn.setAttribute('aria-expanded', String(abierto));
        if (abierto) { ubicarPanel(); marcarTodasLeidas(); }
    });

    // BUG encontrado: este listener nunca existía — "Limpiar todas" se
    // mostraba y ocultaba correctamente (eso lo maneja pintar()), pero
    // nadie llamaba a limpiarTodas() al hacer clic. Por eso funcionaba
    // borrar una por una (cada .notif-item-borrar sí tiene su propio
    // listener) pero "Limpiar todas" no hacía nada.
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', (e) => {
            e.stopPropagation(); // no debe cerrar el panel al tocarlo
            limpiarTodas();
        });
    }

    document.addEventListener('click', (e) => {
        if (!item.contains(e.target)) {
            panel.classList.remove('abierto');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    await cargar();
});