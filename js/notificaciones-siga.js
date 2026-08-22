// js/notificaciones-siga.js — Campanita de notificaciones en Inicio.
// Las notificaciones son globales (las crea Harry directo desde el Table
// Editor de Supabase); cada alumno tiene su propio estado de leído/no-leído
// en notificaciones_leidas. El ícono de Sugerencias es solo un <a> al
// hash de perfil.html, no necesita JS propio.
import { supabase, requerirSesion } from './auth-siga.js?v=9';

document.addEventListener('DOMContentLoaded', async () => {
    const item = document.querySelector('.acceso-item');
    const btn = document.getElementById('btnNotificaciones');
    const panel = document.getElementById('panelNotificaciones');
    const lista = document.getElementById('listaNotificaciones');
    const badge = document.getElementById('notifBadge');
    const btnLimpiar = document.getElementById('btnLimpiarNotifs');
    if (!item || !btn || !panel || !lista) return;

    const sesion = await requerirSesion('');
    if (!sesion) return;

    // Respeta la preferencia de notificaciones (Perfil → Preferencias).
    // Si el usuario las desactivó, ni se cargan ni se muestra la campanita.
    const { data: prefs } = await supabase
        .from('preferencias_notificacion')
        .select('notificaciones_activas')
        .eq('user_id', sesion.user.id)
        .maybeSingle();

    if (prefs && prefs.notificaciones_activas === false) {
        item.style.display = 'none';
        return;
    }

    let notificaciones = [];
    let idsLeidas = new Set();

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
      <div class="notif-item ${idsLeidas.has(n.id) ? '' : 'no-leida'}" data-id="${n.id}">
        <button type="button" class="notif-item-borrar" title="Borrar notificación" aria-label="Borrar notificación">✕</button>
        <span class="notif-item-titulo">${n.titulo}</span>
        <span class="notif-item-mensaje">${n.mensaje}</span>
        <span class="notif-item-fecha">${formatearFecha(n.creado_en)}</span>
      </div>
    `).join('');

        lista.querySelectorAll('.notif-item-borrar').forEach((btnBorrar) => {
            btnBorrar.addEventListener('click', (e) => {
                e.stopPropagation(); // no abre/cierra el panel al tocar el ✕
                const id = btnBorrar.closest('.notif-item')?.dataset.id;
                if (id !== undefined) ocultarNotificacion(id);
            });
        });

        if (btnLimpiar) btnLimpiar.hidden = notificaciones.length === 0;
    }

    async function cargar() {
        const [{ data: notifs, error: errNotifs }, { data: leidas, error: errLeidas }, { data: ocultas, error: errOcultas }] = await Promise.all([
            supabase.from('notificaciones').select('id, titulo, mensaje, creado_en').order('creado_en', { ascending: false }).limit(20),
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
        notificaciones = (notifs || []).filter((n) => !idsOcultas.has(n.id));
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

    btn.addEventListener('click', () => {
        const abierto = panel.classList.toggle('abierto');
        btn.setAttribute('aria-expanded', String(abierto));
        if (abierto) marcarTodasLeidas();
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