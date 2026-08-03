// js/configuracion-siga.js — Página "Configuración" → Cambiar contraseña
import { requerirSesion, establecerNuevaContrasena, montarNavUsuario } from './auth-siga.js?v=3';

document.addEventListener('DOMContentLoaded', async () => {
    montarNavUsuario();

    const sesion = await requerirSesion('');
    if (!sesion) return;

    const form = document.getElementById('formCambiarContrasena');
    const msg = document.getElementById('configMsg');

    document.querySelectorAll('.btn-ojo').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const mostrar = input.type === 'password';
            input.type = mostrar ? 'text' : 'password';
            btn.textContent = mostrar ? '🙈' : '👁';
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(form).entries());

        if (datos.nueva !== datos.confirmar) {
            msg.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        const { ok, error } = await establecerNuevaContrasena(datos.nueva);
        if (!ok) {
            console.error('Error al cambiar contraseña:', error);
            msg.textContent = 'No se pudo actualizar. Intenta de nuevo.';
            return;
        }

        msg.textContent = '¡Contraseña actualizada!';
        form.reset();
    });
});