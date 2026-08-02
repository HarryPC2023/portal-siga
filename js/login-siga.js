// js/login-siga.js — Conecta el modal de login/registro de index.html con auth-siga.js
import {
  obtenerSesion, alCambiarSesion,
  registrarConCorreo, iniciarSesionConCorreo, iniciarSesionConGoogle,
  recuperarContrasena, establecerNuevaContrasena,
} from './auth-siga.js';

const FORMULARIOS = {
  entrar: 'formEntrar',
  crear: 'formCrear',
  recuperar: 'formRecuperar',
  nuevaContrasena: 'formNuevaContrasena',
};

let modal, msg;

document.addEventListener('DOMContentLoaded', () => {
  modal = document.getElementById('modalLogin');
  msg = document.getElementById('loginMsg');

  document.getElementById('btnCerrarLogin').addEventListener('click', cerrarModal);
  document.getElementById('btnOlvide').addEventListener('click', () => mostrarFormulario('recuperar'));

  document.querySelectorAll('.login-tab').forEach((btn) => {
    btn.addEventListener('click', () => mostrarFormulario(btn.dataset.tab));
  });

  document.getElementById('btnGoogle').addEventListener('click', async () => {
    const { error } = await iniciarSesionConGoogle();
    if (error) mostrarMsg('No se pudo iniciar con Google. Intenta de nuevo.');
  });

  document.getElementById('formEntrar').addEventListener('submit', manejarEntrar);
  document.getElementById('formCrear').addEventListener('submit', manejarCrear);
  document.getElementById('formRecuperar').addEventListener('submit', manejarRecuperar);
  document.getElementById('formNuevaContrasena').addEventListener('submit', manejarNuevaContrasena);

  document.querySelectorAll('.btn-ojo').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const mostrar = input.type === 'password';
      input.type = mostrar ? 'text' : 'password';
      btn.textContent = mostrar ? '🙈' : '👁';
      btn.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
  });

  // Si venimos redirigidos desde una página protegida (o de vuelta de Google), abrir directo.
  const params = new URLSearchParams(window.location.search);
  if (params.get('login') === '1') abrirModal();

  // Cambios de sesión: recuperación de contraseña, o login/registro exitoso.
  alCambiarSesion((sesion, evento) => {
    if (evento === 'PASSWORD_RECOVERY') {
      abrirModal();
      mostrarFormulario('nuevaContrasena');
      return;
    }
    if (!sesion) return;

    const veniaDeFlujoLogin = new URLSearchParams(window.location.search).get('login') === '1'
      || modal.classList.contains('visible');
    if (veniaDeFlujoLogin) {
      window.location.href = 'dashboard.html';
    }
  });
});

// Disparadores de "Inicio", "Registrarse" y "Comenzar" en el HTML.
window.manejarClicInicio = (e) => { e.preventDefault(); irADashboardOAbrirModal('entrar'); return false; };
window.manejarClicRegistrar = (e) => { e.preventDefault(); irADashboardOAbrirModal('crear'); return false; };
window.manejarClicComenzar = (e) => { e.preventDefault(); irADashboardOAbrirModal('entrar'); return false; };

async function irADashboardOAbrirModal(tab) {
  const sesion = await obtenerSesion();
  if (sesion) {
    window.location.href = 'dashboard.html';
  } else {
    mostrarFormulario(tab);
    abrirModal();
  }
}

function abrirModal() { modal.classList.add('visible'); }
function cerrarModal() { modal.classList.remove('visible'); limpiarMsg(); }

function mostrarFormulario(cual) {
  Object.values(FORMULARIOS).forEach((id) => { document.getElementById(id).hidden = true; });
  document.getElementById(FORMULARIOS[cual]).hidden = false;

  document.querySelectorAll('.login-tab').forEach((btn) => {
    btn.classList.toggle('activo', btn.dataset.tab === cual);
  });

  // Las pestañas de arriba y "Continuar con Google" solo aplican al flujo
  // normal de entrar/crear cuenta, no a recuperar/nueva contraseña.
  const mostrarExtras = cual === 'entrar' || cual === 'crear';
  document.getElementById('loginTabs').style.display = mostrarExtras ? 'flex' : 'none';
  document.getElementById('btnGoogle').style.display = mostrarExtras ? 'flex' : 'none';
  document.querySelector('.login-separador').style.display = mostrarExtras ? 'flex' : 'none';

  limpiarMsg();
}

async function manejarEntrar(e) {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target).entries());
  const { ok, error } = await iniciarSesionConCorreo(datos.correo, datos.contrasena);
  mostrarMsg(ok
    ? '¡Listo! Entrando...'
    : (error?.message?.includes('Invalid') ? 'Correo o contraseña incorrectos.' : 'No se pudo iniciar sesión. Intenta de nuevo.'));
}

async function manejarCrear(e) {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target).entries());
  if (datos.contrasena !== datos.confirmar) {
    mostrarMsg('Las contraseñas no coinciden.');
    return;
  }
  const { ok, error, requiereConfirmacion } = await registrarConCorreo(datos.correo, datos.contrasena);
  if (!ok) {
    mostrarMsg(error?.message?.toLowerCase().includes('already registered')
      ? 'Ese correo ya tiene una cuenta. Prueba iniciar sesión.'
      : 'No se pudo crear la cuenta. Intenta de nuevo.');
    return;
  }
  mostrarMsg(requiereConfirmacion
    ? 'Cuenta creada. Revisa tu correo para confirmarla antes de entrar.'
    : '¡Cuenta creada! Entrando...');
}

async function manejarRecuperar(e) {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target).entries());
  const { ok } = await recuperarContrasena(datos.correo);
  mostrarMsg(ok
    ? 'Listo. Revisa tu correo y sigue el enlace para crear una nueva contraseña.'
    : 'No se pudo enviar el enlace. Verifica el correo e intenta de nuevo.');
}

async function manejarNuevaContrasena(e) {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target).entries());
  const { ok } = await establecerNuevaContrasena(datos.nueva);
  if (ok) {
    mostrarMsg('¡Contraseña actualizada! Entrando...');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  } else {
    mostrarMsg('No se pudo actualizar. Intenta de nuevo.');
  }
}

function mostrarMsg(texto) { msg.textContent = texto; }
function limpiarMsg() { msg.textContent = ''; }