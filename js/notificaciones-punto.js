// js/notificaciones-punto.js — Puntos de aviso en el menú de SIGA.
// Se carga desde _includes/nav.html, así que funciona en TODAS las páginas.
//
//   · Punto en "Asesorías": hay notificaciones SIN LEER de tipo "asesorias"
//     (asesoría nueva, o "tu asesoría quedó publicada").
//   · Punto en el avatar: hay notificaciones SIN LEER de tipo "respuestas"
//     (por ejemplo, "respondieron tu idea"), y el mismo punto en la tarjeta
//     "Ideas" del menú de cuenta para indicar a dónde tocar.
//
// Respeta Perfil → Avisos: si el alumno apagó los avisos o ese tipo, no
// aparece el punto. El punto se va al visitar el lugar al que apunta:
//     asesorias.html        → se marcan leídas las de tipo "asesorias"
//     perfil.html#sugerencias (pestaña "Ideas") → se marcan leídas las de tipo "respuestas"
// (es el mismo estado de "leída" que usa la campanita de Inicio).
import { supabase, obtenerSesion } from './auth-siga.js?v=9';

const COLUMNA_POR_TIPO = {
    asesorias: 'avisos_asesorias',
    respuestas: 'avisos_respuestas',
};

let sesion = null;
let noLeidas = []; // [{ id, tipo }]

function cargarEstilo() {
    const href = new URL('../css/notificaciones-punto.css?v=1', import.meta.url).href;
    if (document.querySelector(`link[href="${href}"]`)) return;
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = href;
    document.head.appendChild(css);
}

function poner(el, clase, hay, etiqueta) {
    if (!el) return;
    let punto = el.querySelector('.np-punto');
    if (!hay) { if (punto) punto.remove(); return; }
    if (punto) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    punto = document.createElement('i');
    punto.className = `np-punto ${clase}`;
    punto.setAttribute('role', 'img');
    punto.setAttribute('aria-label', etiqueta);
    el.appendChild(punto);
}

function pintar() {
    const enlaceAsesorias = [...document.querySelectorAll('.app-nav-links a')].find((a) => /asesorias\.html$/.test(a.getAttribute('href') || ''));
    poner(enlaceAsesorias, 'np-asesorias', noLeidas.some((n) => n.tipo === 'asesorias'), 'Hay novedades en Asesorías');
    const hayRespuestas = noLeidas.some((n) => n.tipo === 'respuestas');
    poner(document.getElementById('avatarBtn'), 'np-avatar', hayRespuestas, 'Tienes respuestas nuevas');
    // La tarjeta "Ideas" del menú de cuenta (la arma menu-usuario.js al abrirse)
    document.querySelectorAll('#avatarMenu a[href$="perfil.html#sugerencias"]').forEach((a) => {
        poner(a, 'np-tarjeta', hayRespuestas, 'Tienes respuestas nuevas en Ideas');
    });
}

async function marcarLeidas(tipo) {
    const ids = noLeidas.filter((n) => n.tipo === tipo).map((n) => n.id);
    if (!ids.length) return;
    noLeidas = noLeidas.filter((n) => n.tipo !== tipo);
    pintar();
    const filas = ids.map((id) => ({ user_id: sesion.user.id, notificacion_id: id }));
    const { error } = await supabase
        .from('notificaciones_leidas')
        .upsert(filas, { onConflict: 'user_id,notificacion_id', ignoreDuplicates: true });
    if (error) console.warn('No se pudieron marcar como leídas:', error);
}

function visitaMarcaLeidas() {
    const ruta = window.location.pathname;
    if (/\/asesorias(-curso)?\.html$/.test(ruta)) setTimeout(() => marcarLeidas('asesorias'), 1500);
    if (/\/perfil\.html$/.test(ruta)) {
        const revisar = () => { if (window.location.hash === '#sugerencias') setTimeout(() => marcarLeidas('respuestas'), 1200); };
        revisar();
        window.addEventListener('hashchange', revisar);
    }
}

async function iniciar() {
    try {
        sesion = await obtenerSesion();
        if (!sesion) return;
        const uid = sesion.user.id;

        const { data: prefs } = await supabase
            .from('preferencias_notificacion')
            .select('notificaciones_activas, avisos_asesorias, avisos_respuestas')
            .eq('user_id', uid)
            .maybeSingle();
        if (prefs && prefs.notificaciones_activas === false) return;

        const [{ data: notifs, error: e1 }, { data: leidas }, { data: ocultas }] = await Promise.all([
            supabase.from('notificaciones').select('id, tipo, destinatario').in('tipo', ['asesorias', 'respuestas']).order('creado_en', { ascending: false }).limit(50),
            supabase.from('notificaciones_leidas').select('notificacion_id').eq('user_id', uid),
            supabase.from('notificaciones_ocultas').select('notificacion_id').eq('user_id', uid),
        ]);
        if (e1 || !notifs) return;

        const vistas = new Set([...(leidas || []), ...(ocultas || [])].map((r) => r.notificacion_id));
        noLeidas = notifs.filter((n) => !vistas.has(n.id)
            && (!n.destinatario || n.destinatario === uid)
            && !(prefs && prefs[COLUMNA_POR_TIPO[n.tipo]] === false))
            .map((n) => ({ id: n.id, tipo: n.tipo }));

        cargarEstilo();
        pintar();
        // El avatar lo termina de armar auth-siga.js y las tarjetas del menú las arma menu-usuario.js
        // al abrirse: se vuelve a comprobar un instante después y cada vez que el menú cambia.
        setTimeout(pintar, 1500);
        const menu = document.getElementById('avatarMenu');
        if (menu) new MutationObserver(() => pintar()).observe(menu, { childList: true, subtree: true });
        visitaMarcaLeidas();
    } catch (e) {
        console.warn('Puntos de aviso no disponibles:', e);
    }
}

iniciar();