// js/notificaciones-punto.js — Puntos de aviso en el menú de SIGA.
// Se carga desde _includes/nav.html, así que funciona en TODAS las páginas.
//
//   · Punto en "Asesorías": hay notificaciones SIN LEER de tipo "asesorias"
//     (asesoría nueva, o "tu asesoría quedó publicada").
//   · Punto en el avatar: hay notificaciones SIN LEER de tipo "respuestas"
//     (por ejemplo, "respondieron tu idea" o "respondieron tu pregunta"), y el punto en
//     la tarjeta del menú de cuenta a la que hay que ir: "Ideas" o "Mis preguntas".
//
// Respeta Perfil → Avisos: si el alumno apagó los avisos o ese tipo, no
// aparece el punto. El punto se va al visitar el lugar al que apunta:
//     asesorias.html        → se marcan leídas las de tipo "asesorias"
//     perfil.html#sugerencias (pestaña "Ideas") → se marcan leídas las respuestas a ideas
//     perfil.html#preguntas (pestaña "Mis preguntas") → se marcan leídas las respuestas a preguntas
// (es el mismo estado de "leída" que usa la campanita).
import { supabase, obtenerSesion } from './auth-siga.js?v=9';

const COLUMNA_POR_TIPO = {
    asesorias: 'avisos_asesorias',
    respuestas: 'avisos_respuestas',
};

let sesion = null;
let noLeidas = []; // [{ id, tipo, enlace }]

// Las respuestas a preguntas del botcito llevan al Perfil → Mis preguntas; el resto (ideas) a Ideas.
const esPregunta = (n) => /#preguntas$/.test(n.enlace || '');

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
    const respuestas = noLeidas.filter((n) => n.tipo === 'respuestas');
    poner(document.getElementById('avatarBtn'), 'np-avatar', respuestas.length > 0, 'Tienes respuestas nuevas');
    // Las tarjetas del menú de cuenta (las arma menu-usuario.js al abrirse)
    document.querySelectorAll('#avatarMenu a[href$="perfil.html#sugerencias"]').forEach((a) => {
        poner(a, 'np-tarjeta', respuestas.some((n) => !esPregunta(n)), 'Tienes respuestas nuevas en Ideas');
    });
    document.querySelectorAll('#avatarMenu a[href$="perfil.html#preguntas"]').forEach((a) => {
        poner(a, 'np-tarjeta', respuestas.some(esPregunta), 'Tienes respuestas nuevas en Mis preguntas');
    });
}

async function marcarLeidas(coincide) {
    const ids = noLeidas.filter(coincide).map((n) => n.id);
    if (!ids.length) return;
    noLeidas = noLeidas.filter((n) => !coincide(n));
    pintar();
    const filas = ids.map((id) => ({ user_id: sesion.user.id, notificacion_id: id }));
    const { error } = await supabase
        .from('notificaciones_leidas')
        .upsert(filas, { onConflict: 'user_id,notificacion_id', ignoreDuplicates: true });
    if (error) console.warn('No se pudieron marcar como leídas:', error);
}

function visitaMarcaLeidas() {
    const ruta = window.location.pathname;
    if (/\/asesorias(-curso)?\.html$/.test(ruta)) setTimeout(() => marcarLeidas((n) => n.tipo === 'asesorias'), 1500);
    if (/\/perfil\.html$/.test(ruta)) {
        const revisar = () => {
            const hash = window.location.hash;
            if (hash === '#sugerencias') setTimeout(() => marcarLeidas((n) => n.tipo === 'respuestas' && !esPregunta(n)), 1200);
            if (hash === '#preguntas') setTimeout(() => marcarLeidas((n) => n.tipo === 'respuestas' && esPregunta(n)), 1200);
        };
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
            supabase.from('notificaciones').select('id, tipo, destinatario, enlace').in('tipo', ['asesorias', 'respuestas']).order('creado_en', { ascending: false }).limit(50),
            supabase.from('notificaciones_leidas').select('notificacion_id').eq('user_id', uid),
            supabase.from('notificaciones_ocultas').select('notificacion_id').eq('user_id', uid),
        ]);
        if (e1 || !notifs) return;

        const vistas = new Set([...(leidas || []), ...(ocultas || [])].map((r) => r.notificacion_id));
        noLeidas = notifs.filter((n) => !vistas.has(n.id)
            && (!n.destinatario || n.destinatario === uid)
            && !(prefs && prefs[COLUMNA_POR_TIPO[n.tipo]] === false))
            .map((n) => ({ id: n.id, tipo: n.tipo, enlace: n.enlace || '' }));

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