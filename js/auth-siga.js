// js/auth-siga.js — Módulo de autenticación compartido para SIGA (magic link, Supabase Auth)
// Reemplaza estos dos valores por los de tu proyecto real (Supabase > Settings > API):
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://pinoriectlepnihjbxmt.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_2h0qDr857y1KfUfIP2x6DQ_eHz5S40q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export async function obtenerSesion() {
    const { data, error } = await supabase.auth.getSession();
    if (error) { console.error('Error al obtener sesión SIGA:', error); return null; }
    return data.session;
}

export async function iniciarSesionConCorreo(correo) {
    const { error } = await supabase.auth.signInWithOtp({
        email: correo,
        options: { emailRedirectTo: window.location.href },
    });
    return { ok: !error, error };
}

export async function cerrarSesion() {
    await supabase.auth.signOut();
}

export function alCambiarSesion(callback) {
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => callback(sesion));
    return () => data.subscription.unsubscribe();
}

/** Pinta el estado de sesión dentro de `.app-nav-user` (ya existe en tu markup). */
export function montarNavUsuario() {
    const cont = document.querySelector('.app-nav-user');
    if (!cont) return;

    function pintar(sesion) {
        if (sesion) {
            cont.innerHTML = `
        <button type="button" class="app-nav-avatar" id="avatarBtn" aria-haspopup="true" aria-expanded="false" aria-label="Cuenta">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </button>
        <div class="app-nav-user-menu" id="avatarMenu">
          <div class="app-nav-user-info">
            <span class="app-nav-user-correo">${sesion.user.email}</span>
          </div>
          <button type="button" class="app-nav-user-item app-nav-user-salir" id="btnCerrarSesionSiga">Cerrar sesión</button>
        </div>`;

            const btn = document.getElementById('avatarBtn');
            const menu = document.getElementById('avatarMenu');
            btn.addEventListener('click', () => {
                const abierto = menu.classList.toggle('abierto');
                btn.setAttribute('aria-expanded', String(abierto));
            });
            document.addEventListener('click', (e) => {
                if (!cont.contains(e.target)) {
                    menu.classList.remove('abierto');
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
            document.getElementById('btnCerrarSesionSiga').addEventListener('click', cerrarSesion);
        } else {
            cont.innerHTML = `<button type="button" class="btn-login-siga" id="btnAbrirLoginSiga">Iniciar sesión</button>`;
            document.getElementById('btnAbrirLoginSiga').addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('siga:abrir-login'));
            });
        }
    }

    obtenerSesion().then(pintar);
    alCambiarSesion(pintar);
}