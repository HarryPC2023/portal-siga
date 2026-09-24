// js/gate.js — Protege una página: si no hay sesión, redirige al login.
// Auto-detecta si está en una subcarpeta (intranotas/, horarios/) para
// usar la raíz correcta. Reutilizable en cualquier página de SIGA.
import { requerirSesion, montarNavUsuario } from './auth-siga.js?v=9';

montarNavUsuario();
// TEMPORAL: '/intranotas-nueva/' se quita en el corte final
const raiz = window.location.pathname.includes('/intranotas/') || window.location.pathname.includes('/horarios/') || window.location.pathname.includes('/intranotas-nueva/')
    ? '../' : '';
await requerirSesion(raiz);