// js/gate.js — Protege una página: si no hay sesión, redirige al login.
// Auto-detecta si está en una subcarpeta (intranotas/, horarios/) para
// usar la raíz correcta. Reutilizable en cualquier página de SIGA.
import { requerirSesion, montarNavUsuario } from './auth-siga.js?v=8';

montarNavUsuario();
const raiz = window.location.pathname.includes('/intranotas/') || window.location.pathname.includes('/horarios/')
    ? '../' : '';
await requerirSesion(raiz);