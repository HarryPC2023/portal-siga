// js/gate.js — Protege una página: si no hay sesión, redirige a index.html
// con el login listo para abrirse. Reutilizable en cualquier página de la
// raíz que requiera cuenta (asesorias.html, materiales.html, etc.).
import { requerirSesion, montarNavUsuario } from './auth-siga.js?v=8';

document.addEventListener('DOMContentLoaded', async () => {
    montarNavUsuario();
    await requerirSesion('');
});