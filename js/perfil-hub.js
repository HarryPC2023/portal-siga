// js/perfil-hub.js — Página "Mi cuenta": Mi carnet, Avisos, Ayuda, Ideas y
// Seguridad y Mis preguntas, en una sola página con pestañas. Aquí solo viven las pestañas;
// cada sección tiene su módulo (mi-carnet, avisos, ayuda, ideas, seguridad).
import { requerirSesion, montarNavUsuario } from './auth-siga.js?v=9';
import { montarMiCarnet } from './mi-carnet.js';
import { montarAyuda } from './ayuda.js';
import { montarIdeas } from './ideas.js';
import { montarAvisos } from './avisos.js';
import { montarSeguridad } from './seguridad.js';
import { montarMisPreguntas } from './mis-preguntas.js';

const TABS_VALIDAS = ['info', 'cuenta', 'preferencias', 'faq', 'sugerencias', 'preguntas'];

document.addEventListener('DOMContentLoaded', async () => {
    montarNavUsuario();

    const sesion = await requerirSesion('');
    if (!sesion) return;

    // ================= PESTAÑAS (con hash en la URL) =================
    const nav = document.getElementById('perfilHubNav');
    const botones = [...nav.querySelectorAll('.perfil-hub-tab')];
    const paneles = [...document.querySelectorAll('.perfil-panel')];

    function activarTab(nombre) {
        if (!TABS_VALIDAS.includes(nombre)) nombre = 'info';

        botones.forEach((b) => b.classList.toggle('activo', b.dataset.tab === nombre));
        paneles.forEach((p) => { p.hidden = p.dataset.panel !== nombre; });

        if (window.location.hash !== `#${nombre}`) {
            history.replaceState(null, '', `#${nombre}`);
        }
    }

    botones.forEach((b) => {
        b.addEventListener('click', () => activarTab(b.dataset.tab));
    });

    window.addEventListener('hashchange', () => {
        activarTab(window.location.hash.replace('#', ''));
    });

    activarTab(window.location.hash.replace('#', ''));

    // ================= INFORMACIÓN GENERAL: CARNET SIGA =================
    // Toda la lógica vive en js/mi-carnet.js (carnet + tarjetas editables).
    montarMiCarnet(sesion);

    // ================= AVISOS (antes Preferencias) =================
    // Interruptor general, tarjetas por tipo y guardado automático: js/avisos.js.
    montarAvisos(sesion);

    // ================= SEGURIDAD (antes Cuenta) =================
    // Sesión, contraseña según el proveedor y zona de riesgo: js/seguridad.js.
    montarSeguridad(sesion);

    // ================= AYUDA (antes Preguntas Frecuentes) =================
    // Buscador, chips por módulo, acordeón y votos: todo en js/ayuda.js.
    montarAyuda(sesion);

    // ================= IDEAS (antes Sugerencias) =================
    // Flujo de 3 pasos y "Mis ideas" con estados: todo en js/ideas.js.
    montarIdeas(sesion);

    // ================= MIS PREGUNTAS (botcito de Asesorías) =================
    // Las preguntas que envió desde los cursos, su estado y las respuestas: js/mis-preguntas.js.
    montarMisPreguntas(sesion);
});