// js/auth-siga.js — Módulo de autenticación compartido para SIGA
// Reemplaza estos dos valores por los de tu proyecto real (Supabase > Settings > API):
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://pinoriectlepnihjbxmt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2h0qDr857y1KfUfIP2x6DQ_eHz5S40q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

/** Devuelve la sesión actual (o null si no hay nadie logueado). */
export async function obtenerSesion() {
  const { data, error } = await supabase.auth.getSession();
  if (error) { console.error('Error al obtener sesión SIGA:', error); return null; }
  return data.session;
}

/** Crea una cuenta nueva con correo + contraseña. */
export async function registrarConCorreo(correo, contrasena) {
  const { data, error } = await supabase.auth.signUp({ email: correo, password: contrasena });
  return {
    ok: !error,
    error,
    // Si Supabase exige confirmar el correo, signUp devuelve usuario pero SIN sesión activa todavía.
    requiereConfirmacion: !error && data && !data.session,
  };
}

/** Inicia sesión con correo + contraseña ya existentes. */
export async function iniciarSesionConCorreo(correo, contrasena) {
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  return { ok: !error, error };
}

/** Inicia sesión con Google. Redirige fuera de la página y vuelve ya logueado. */
export async function iniciarSesionConGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/portal-siga/index.html?login=1' },
  });
  return { ok: !error, error };
}

/** Envía un correo con enlace para restablecer la contraseña. */
export async function recuperarContrasena(correo) {
  const { error } = await supabase.auth.resetPasswordForEmail(correo, {
    redirectTo: window.location.origin + '/portal-siga/index.html?recuperar=1',
  });
  return { ok: !error, error };
}

/** Establece una nueva contraseña (se usa durante el flujo de recuperación). */
export async function establecerNuevaContrasena(nuevaContrasena) {
  const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
  return { ok: !error, error };
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
}

const BUCKET_AVATARS = 'avatars';

/**
 * Convierte lo que haya guardado en `foto_url` en una URL que el navegador
 * pueda cargar de verdad. El bucket "avatars" es privado, así que no existe
 * una URL pública fija — hay que pedirle a Supabase una URL firmada (con
 * vencimiento) cada vez que se necesita mostrar la foto.
 *
 * Soporta 3 formatos posibles de `foto_url`, para no romper fotos ya
 * guardadas antes de este cambio:
 *  - Foto de Google (URL externa completa) -> se usa tal cual.
 *  - URL pública vieja de Supabase (de antes de hacer el bucket privado)
 *    -> se le extrae solo la ruta y se firma esa ruta.
 *  - Ruta nueva guardada directamente (formato actual) -> se firma tal cual.
 */
export async function resolverUrlFoto(fotoUrl) {
  if (!fotoUrl) return null;

  if (fotoUrl.includes('/storage/v1/object/public/avatars/')) {
    const ruta = fotoUrl.split('/avatars/')[1]?.split('?')[0];
    if (!ruta) return null;
    const { data, error } = await supabase.storage.from(BUCKET_AVATARS).createSignedUrl(ruta, 3600);
    return error ? null : data.signedUrl;
  }

  if (fotoUrl.startsWith('http')) {
    return fotoUrl; // foto externa (Google), no vive en nuestro Storage
  }

  const { data, error } = await supabase.storage.from(BUCKET_AVATARS).createSignedUrl(fotoUrl, 3600);
  return error ? null : data.signedUrl;
}

/**
 * Se resuelve con la sesión real (o null) en cuanto el cliente de
 * Supabase determina el estado de sesión por PRIMERA vez — a diferencia
 * de llamar a getSession() a ciegas justo tras crear el cliente (que
 * puede devolver null todavía sin haber restaurado la sesión guardada),
 * esto escucha el evento real de auth y espera lo que haga falta, sin
 * inventar un tiempo de espera fijo. Se usa en pantallas como Horarios,
 * que recargan la página completa en cada navegación y por lo tanto
 * tienen que volver a levantar el cliente de Supabase desde cero cada
 * vez (puede tardar más de lo esperado según la red).
 * Trae un tope de seguridad de 8s por si el evento nunca llegara a
 * disparar, para no dejar la espera colgada para siempre.
 */
export function esperarSesionLista() {
  const esperaEvento = new Promise(resolve => {
    const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
      data.subscription.unsubscribe();
      resolve(sesion);
    });
  });
  const tope = new Promise(resolve => setTimeout(() => resolve(null), 8000));
  return Promise.race([esperaEvento, tope]);
}

/** Eventos que NO representan un cambio real de sesión — se ignoran para
 * evitar que la interfaz "parpadee"/recargue solo por volver a la pestaña. */
const EVENTOS_SESION_IGNORADOS = new Set(['TOKEN_REFRESHED', 'INITIAL_SESSION']);

/** Suscribe una función a cambios de sesión (login/logout/recuperación). */
export function alCambiarSesion(callback) {
  const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
    if (EVENTOS_SESION_IGNORADOS.has(evento)) return;
    callback(sesion, evento)
  });
  return () => data.subscription.unsubscribe();
}

/**
 * Pinta el estado de sesión dentro de `.app-nav-user` (el mismo hueco que
 * ya existe en dashboard.css). Reutilizable en cualquier página.
 */
export function montarNavUsuario() {
  const cont = document.querySelector('.app-nav-account');
  if (!cont) return;

  async function pintar(sesion) {
    const raiz = window.location.pathname.includes('/intranotas/') || window.location.pathname.includes('/horarios/')
      ? '../' : '';
    if (sesion) {
      // Menú rediseñado (sep 2026): mini carnet, accesos, tema y seguridad.
      // Vive en js/menu-usuario.js; se carga solo cuando hay sesión.
      const { montarMenuUsuario } = await import('./menu-usuario.js');
      await montarMenuUsuario(cont, sesion, raiz);
    } else {
      cont.closest('.app-nav-user')?.classList.remove('con-sesion');
      cont.innerHTML = `<button type="button" class="btn-login-siga" id="btnAbrirLoginSiga">Iniciar sesión</button>`;
      document.getElementById('btnAbrirLoginSiga').addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('siga:abrir-login'));
      });
    }
  }

  obtenerSesion().then(pintar);
  alCambiarSesion(pintar);
}

/**
 * Protege una página interna: si no hay sesión, redirige a index.html con
 * el login listo para abrirse (?login=1). Llamar al inicio de cada página
 * que requiera cuenta (dashboard, asesorias, materiales, intranotas, horarios).
 *
 * @param {string} raiz - ruta relativa hacia la raíz del portal.
 *   '' si la página ya está en la raíz (dashboard.html, asesorias.html...).
 *   '../' si la página está en una subcarpeta (intranotas/, horarios/).
 */
export async function requerirSesion(raiz = '') {
  const sesion = await obtenerSesion();
  if (!sesion) {
    // Guarda a dónde se iba (ruta completa, con query si tenía) para que
    // login-siga.js pueda devolver ahí después de iniciar sesión, en vez
    // de dejar siempre al usuario en dashboard.html.
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `${raiz}index.html?login=1&next=${next}`;
    return null;
  }
  return sesion;
}