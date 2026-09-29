// js/perfil-hub.js — Página "Mi cuenta": Información General, Cuenta,
// Preferencias, Preguntas Frecuentes y Sugerencias, todo en una sola
// página con pestañas (reemplaza a perfil.html + configuracion.html).
import { supabase, requerirSesion, montarNavUsuario, establecerNuevaContrasena } from './auth-siga.js?v=9';
import { montarMiCarnet } from './mi-carnet.js';
import { montarAyuda } from './ayuda.js';
import { montarIdeas } from './ideas.js';

const TABS_VALIDAS = ['info', 'cuenta', 'preferencias', 'faq', 'sugerencias'];

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

    // ================= CUENTA: CAMBIAR CONTRASEÑA =================
    const formPass = document.getElementById('formCambiarContrasena');
    const msgPass = document.getElementById('configMsg');

    document.querySelectorAll('.btn-ojo').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const mostrar = input.type === 'password';
            input.type = mostrar ? 'text' : 'password';
            btn.textContent = mostrar ? '🙈' : '👁';
        });
    });

    formPass.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(formPass).entries());

        if (datos.nueva !== datos.confirmar) {
            msgPass.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        const { ok, error } = await establecerNuevaContrasena(datos.nueva);
        if (!ok) {
            console.error('Error al cambiar contraseña:', error);
            msgPass.textContent = 'No se pudo actualizar. Intenta de nuevo.';
            return;
        }

        msgPass.textContent = '¡Contraseña actualizada!';
        formPass.reset();
    });

    // ================= CUENTA: ELIMINAR CUENTA =================
    const modalEliminar = document.getElementById('modalEliminar');
    const btnAbrirEliminar = document.getElementById('btnAbrirEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    const inputConfirmarEliminar = document.getElementById('inputConfirmarEliminar');
    const eliminarMsg = document.getElementById('eliminarMsg');

    function cerrarModalEliminar() {
        modalEliminar.classList.remove('visible');
        inputConfirmarEliminar.value = '';
        btnConfirmarEliminar.disabled = true;
        eliminarMsg.textContent = '';
    }

    btnAbrirEliminar.addEventListener('click', () => modalEliminar.classList.add('visible'));
    btnCancelarEliminar.addEventListener('click', cerrarModalEliminar);

    inputConfirmarEliminar.addEventListener('input', () => {
        btnConfirmarEliminar.disabled = inputConfirmarEliminar.value.trim() !== 'ELIMINAR';
    });

    btnConfirmarEliminar.addEventListener('click', async () => {
        btnConfirmarEliminar.disabled = true;
        eliminarMsg.textContent = 'Eliminando tu cuenta…';

        const { data: { session } } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('eliminar-cuenta', {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (error || data?.error) {
            console.error('Error eliminando cuenta:', error || data.error);
            eliminarMsg.textContent = 'No se pudo eliminar la cuenta. Intenta de nuevo.';
            btnConfirmarEliminar.disabled = false;
            return;
        }

        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    // ================= PREFERENCIAS =================
    const prefActivas = document.getElementById('prefActivas');
    const prefMateriales = document.getElementById('prefMateriales');
    const prefRecordatorios = document.getElementById('prefRecordatorios');
    const prefActualizaciones = document.getElementById('prefActualizaciones');
    const prefMsg = document.getElementById('prefMsg');

    const { data: preferencias, error: errPref } = await supabase
        .from('preferencias_notificacion')
        .select('notificaciones_activas, avisos_materiales, recordatorios, actualizaciones_modulos')
        .eq('user_id', sesion.user.id)
        .maybeSingle();

    if (errPref) console.error('Error cargando preferencias:', errPref);

    if (preferencias) {
        prefActivas.checked = preferencias.notificaciones_activas;
        prefMateriales.checked = preferencias.avisos_materiales;
        prefRecordatorios.checked = preferencias.recordatorios;
        prefActualizaciones.checked = preferencias.actualizaciones_modulos;
    }

    function aplicarInterruptorGeneral() {
        const activo = prefActivas.checked;
        [prefMateriales, prefRecordatorios, prefActualizaciones].forEach((el) => { el.disabled = !activo; });
    }
    aplicarInterruptorGeneral();

    let guardandoPref = false;
    async function guardarPreferencias() {
        if (guardandoPref) return;
        guardandoPref = true;
        prefMsg.textContent = 'Guardando…';

        const { error } = await supabase
            .from('preferencias_notificacion')
            .upsert({
                user_id: sesion.user.id,
                notificaciones_activas: prefActivas.checked,
                avisos_materiales: prefMateriales.checked,
                recordatorios: prefRecordatorios.checked,
                actualizaciones_modulos: prefActualizaciones.checked,
                actualizado_en: new Date().toISOString(),
            });

        guardandoPref = false;
        prefMsg.textContent = error ? 'No se pudo guardar. Intenta de nuevo.' : 'Preferencias guardadas ✓';
    }

    [prefActivas, prefMateriales, prefRecordatorios, prefActualizaciones].forEach((el) => {
        el.addEventListener('change', () => {
            if (el === prefActivas) aplicarInterruptorGeneral();
            guardarPreferencias();
        });
    });

    // ================= AYUDA (antes Preguntas Frecuentes) =================
    // Buscador, chips por módulo, acordeón y votos: todo en js/ayuda.js.
    montarAyuda(sesion);

    // ================= IDEAS (antes Sugerencias) =================
    // Flujo de 3 pasos y "Mis ideas" con estados: todo en js/ideas.js.
    montarIdeas(sesion);
});