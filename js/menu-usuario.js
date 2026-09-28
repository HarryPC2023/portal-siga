// js/menu-usuario.js — Menú de usuario (panel del avatar), rediseño sep 2026.
// ------------------------------------------------------------
// Lo llama montarNavUsuario() de auth-siga.js cuando hay sesión.
//
// - Mini carnet SIGA arriba: es la puerta a Mi cuenta (reemplaza a los
//   antiguos "Mi perfil" y "Configuración de la cuenta", que llevaban
//   a la misma página).
// - Si faltan piezas: el mini carnet sale punteado con su avance y el
//   avatar lleva un puntito que late. Sin recompensas, solo invitación.
// - Cuatro accesos: Mi carnet, Avisos, Ayuda, Ideas.
// - Tema como bolitas (sale del botón suelto del nav cuando hay sesión).
// - Seguridad (contraseña / eliminar cuenta) discreto abajo, con el correo
//   y "Cerrar sesión".
// ------------------------------------------------------------

import { supabase, cerrarSesion, resolverUrlFoto } from './auth-siga.js?v=9';
import { PIEZAS, piezasFaltantes, pintarCarnet, asegurarEstilosCarnet } from './carnet-siga.js';

/* Mismos íconos (SVG, no emojis: 🪪 no existe en Windows 10) que las
   pestañas en píldoras de perfil.html. */
const ICONOS = {
    info: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16c.6-1.4 1.5-2 2.5-2s1.9.6 2.5 2M14 10h4M14 13.5h3"/>',
    preferencias: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    faq: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4.8 1c0 1.6-2.4 2-2.4 3.4M12 17h.01"/>',
    sugerencias: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
    cuenta: '<path d="M12 3l7 3v5c0 5-3.4 8.4-7 10-3.6-1.6-7-5-7-10V6z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
};

const ACCESOS = [
    { tab: 'info', titulo: 'Mi carnet', texto: 'Tus datos y tu foto', color: '#EEF3FF', acento: '#3C7CF8' },
    { tab: 'preferencias', titulo: 'Avisos', texto: 'Qué quieres que te avisemos', color: '#FFF6DD', acento: '#E0A100' },
    { tab: 'faq', titulo: 'Ayuda', texto: 'Respuestas rápidas', color: '#E6F7F4', acento: '#0FA89E' },
    { tab: 'sugerencias', titulo: 'Ideas', texto: 'Mejora SIGA con nosotros', color: '#FDEAF3', acento: '#C13F94' },
];

const ICONO_USUARIO = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>';

function el(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
}

export async function montarMenuUsuario(cont, sesion, raiz) {
    asegurarEstilosCarnet();
    const perfilUrl = (tab) => `${raiz}perfil.html#${tab}`;
    const temaDisponible = typeof window.sigaAplicarTema === 'function';

    /* ---------- Avatar ---------- */
    const avatar = el('button', 'app-nav-avatar');
    avatar.type = 'button';
    avatar.id = 'avatarBtn';
    avatar.setAttribute('aria-haspopup', 'true');
    avatar.setAttribute('aria-expanded', 'false');
    avatar.setAttribute('aria-label', 'Tu cuenta');
    avatar.innerHTML = ICONO_USUARIO;
    const punto = el('span', 'menu-usuario-punto');
    punto.hidden = true;
    avatar.append(punto);

    /* ---------- Panel ---------- */
    const panel = el('div', 'app-nav-user-menu menu-usuario');
    panel.id = 'avatarMenu';

    const lugarMini = el('a', 'menu-usuario-mini');
    lugarMini.href = perfilUrl('info');

    const accesos = el('div', 'menu-usuario-accesos');
    ACCESOS.forEach((a) => {
        const enlace = el('a', 'menu-usuario-acceso');
        enlace.href = perfilUrl(a.tab);
        enlace.style.setProperty('--acceso-fondo', a.color);
        enlace.style.setProperty('--acceso-acento', a.acento);
        const icono = el('span', 'menu-usuario-acceso-icono');
        icono.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[a.tab]}</svg>`;
        enlace.append(
            icono,
            el('span', 'menu-usuario-acceso-titulo', a.titulo),
            el('span', 'menu-usuario-acceso-texto', a.texto),
        );
        accesos.append(enlace);
    });

    panel.append(lugarMini, accesos);

    if (temaDisponible) {
        const temas = el('div', 'menu-usuario-temas');
        temas.append(el('span', 'menu-usuario-temas-titulo', 'Tema'));
        (window.sigaTemas || []).forEach((t) => {
            const b = el('button', 'tema-opcion menu-usuario-tema', t.icono);
            b.type = 'button';
            b.dataset.tema = t.id;
            b.title = t.etiqueta;
            b.setAttribute('aria-label', `Tema ${t.etiqueta}`);
            if (document.documentElement.getAttribute('data-tema') === t.id) b.classList.add('activo');
            b.addEventListener('click', () => window.sigaAplicarTema(t.id));
            temas.append(b);
        });
        panel.append(temas);
        // Con sesión, el tema vive aquí: se oculta el botón suelto del nav.
        cont.closest('.app-nav-user')?.classList.add('con-sesion');
    }

    const pie = el('div', 'menu-usuario-pie');
    const seguridad = el('a', 'menu-usuario-seguridad');
    seguridad.href = perfilUrl('cuenta');
    seguridad.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS.cuenta}</svg>`;
    seguridad.append(' Seguridad de la cuenta');
    const fila = el('div', 'menu-usuario-fila');
    const salir = el('button', 'menu-usuario-salir', 'Cerrar sesión');
    salir.type = 'button';
    salir.id = 'btnCerrarSesionSiga';
    fila.append(el('span', 'menu-usuario-correo', sesion.user.email ?? ''), salir);
    pie.append(seguridad, fila);
    panel.append(pie);

    cont.replaceChildren(avatar, panel);

    /* ---------- Comportamiento ---------- */
    function cerrarPanel() {
        panel.classList.remove('abierto');
        avatar.setAttribute('aria-expanded', 'false');
    }
    avatar.addEventListener('click', () => {
        const abierto = panel.classList.toggle('abierto');
        avatar.setAttribute('aria-expanded', String(abierto));
    });
    document.addEventListener('click', (e) => {
        if (!cont.contains(e.target)) cerrarPanel();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('abierto')) {
            cerrarPanel();
            avatar.focus();
        }
    });
    salir.addEventListener('click', async () => {
        await cerrarSesion();
        window.location.href = `${raiz}index.html`;
    });

    /* ---------- Datos: mini carnet, foto y puntito ---------- */
    const { data } = await supabase
        .from('perfiles_usuario')
        .select('nombre, codigo_estudiante, carrera, foto_url, periodo_ingreso_declarado')
        .eq('user_id', sesion.user.id)
        .maybeSingle();
    const perfil = data || {};

    const fotoUrl = (await resolverUrlFoto(perfil.foto_url))
        || sesion.user.user_metadata?.avatar_url
        || sesion.user.user_metadata?.picture
        || null;

    if (fotoUrl) {
        const img = el('img', 'app-nav-avatar-foto');
        img.src = fotoUrl;
        img.alt = '';
        avatar.querySelector('svg')?.remove();
        avatar.prepend(img);
    }

    const faltan = piezasFaltantes(perfil).length;
    punto.hidden = faltan === 0;

    const carnet = pintarCarnet(lugarMini, perfil, { fotoUrl });
    carnet.classList.add('carnet-mini');
    const pista = el('span', 'menu-usuario-mini-pista', faltan
        ? `✨ Completar · ${PIEZAS.length - faltan} de ${PIEZAS.length}`
        : 'Ver mi cuenta →');
    lugarMini.append(pista);
    lugarMini.setAttribute('aria-label', faltan ? 'Completar mi carnet SIGA' : 'Abrir Mi cuenta');
}