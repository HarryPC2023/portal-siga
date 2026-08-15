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
            return;
        }

        lista.innerHTML = notificaciones.map((n) => `
      <div class="notif-item ${idsLeidas.has(n.id) ? '' : 'no-leida'}">
        <span class="notif-item-titulo">${n.titulo}</span>
        <span class="notif-item-mensaje">${n.mensaje}</span>
        <span class="notif-item-fecha">${formatearFecha(n.creado_en)}</span>
      </div>
    `).join('');
    }

    async function cargar() {
        const [{ data: notifs, error: errNotifs }, { data: leidas, error: errLeidas }] = await Promise.all([
            supabase.from('notificaciones').select('id, titulo, mensaje, creado_en').order('creado_en', { ascending: false }).limit(20),
            supabase.from('notificaciones_leidas').select('notificacion_id').eq('user_id', sesion.user.id),
        ]);

        if (errNotifs) {
            console.error('Error cargando notificaciones:', errNotifs);
            lista.innerHTML = '<p class="acceso-panel-vacio">No se pudieron cargar.</p>';
            return;
        }
        if (errLeidas) console.warn('Error cargando estado de lectura:', errLeidas);

        notificaciones = notifs || [];
        idsLeidas = new Set((leidas || []).map((l) => l.notificacion_id));
        pintar();
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

    document.addEventListener('click', (e) => {
        if (!item.contains(e.target)) {
            panel.classList.remove('abierto');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    await cargar();
});