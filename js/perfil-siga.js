// js/perfil-siga.js — Script del dashboard (Inicio).
// Protege la página (sin sesión → index.html), monta el menú de usuario
// y carga la tarjetita sutil del carnet SIGA.
// (Hasta sep 2026 aquí vivía el modal obligatorio "Completa tu perfil";
//  ahora esa lógica es la tarjetita de js/carnet-aviso.js.)
import { requerirSesion, montarNavUsuario } from './auth-siga.js?v=9';
import './carnet-aviso.js';

document.addEventListener('DOMContentLoaded', async () => {
  montarNavUsuario();
  await requerirSesion(''); // redirige a index.html si no hay cuenta
});