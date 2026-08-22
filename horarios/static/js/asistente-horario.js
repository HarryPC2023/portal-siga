// static/js/asistente-horario.js
// ============================================================
// ASISTENTE DE HORARIO — hub de herramientas del Generador
// Mismo patrón que "📊 Análisis académico" de Intranotas: un botón
// de entrada rectangular vive en el flujo normal del sidebar (entre
// "02 — Cruces permitidos" y el pie de autosave), y al tocarlo abre
// un panel LATERAL — docked a la derecha en escritorio, hoja
// inferior en celular. Ver asistente-horario.css.
//
// GATE DE VISIBILIDAD (temporal): igual criterio que se usó con la
// sincronización de Intralú, pero comparando por UID en vez de
// correo (más seguro, mismo estándar que el resto de SIGA). Mientras
// se terminan de construir y probar las 6 herramientas, el botón
// SOLO aparece para Harry. Cuando todo esté 100% probado, cambiar
// ASISTENTE_HABILITADO_PARA_TODOS a `true` acá abajo y se habilita
// para todos los usuarios — sin tocar nada más de este archivo.
//
// Es un módulo aparte (import propio de auth-siga.js) para no
// depender del orden de carga de otros scripts de la página.
// ============================================================
import { obtenerSesion } from '../../../js/auth-siga.js?v=9';

const ADMIN_UID_SIGA = 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1';

// 🔒 Flag maestro — cambiar a `true` cuando el Asistente esté
// terminado y probado al 100% (mismo mecanismo que
// syncIntraluHabilitado() en Intranotas).
const ASISTENTE_HABILITADO_PARA_TODOS = false;

async function asistenteHorarioHabilitado() {
    if (ASISTENTE_HABILITADO_PARA_TODOS) return true;
    try {
        const sesion = await obtenerSesion();
        return !!(sesion && sesion.user && sesion.user.id === ADMIN_UID_SIGA);
    } catch (e) {
        console.warn('No se pudo verificar sesión para el Asistente de Horario:', e);
        return false;
    }
}

/* ---------- Las 6 herramientas del hub.
   `activa: false` = todavía en construcción (se muestra el tile
   pero no hace nada). Se van pasando a `true` una por una a medida
   que cada una queda lista, sin tocar el resto del archivo. ---------- */
const AH_HERRAMIENTAS = [
    { id: 'huecos', icono: '📘', nombre: 'Huecos y métricas', activa: false },
    { id: 'preferencias', icono: '🎛️', nombre: 'Preferencias', activa: false },
    { id: 'mejor-horario', icono: '🧠', nombre: 'Mejor horario', activa: false },
    { id: 'alertas', icono: '🚨', nombre: 'Alertas inteligentes', activa: false },
    { id: 'comparador', icono: '⚖️', nombre: 'Comparador', activa: false },
    { id: 'exportar-calendario', icono: '📅', nombre: 'Exportar a calendario', activa: false },
];

/* ---------- Panel lateral (se crea una sola vez) ---------- */
function inicializarAsistenteHorario() {
    if (document.getElementById('ah-panel')) return;

    const overlay = document.createElement('div');
    overlay.id = 'ah-overlay';
    overlay.className = 'ah-overlay';
    overlay.onclick = () => window.toggleAsistenteHorario(false);
    document.body.appendChild(overlay);

    const panel = document.createElement('div');
    panel.id = 'ah-panel';
    panel.className = 'ah-panel';
    panel.innerHTML = `
        <div class="ah-panel-header">
            <span class="ah-panel-header-titulo">
                <img src="static/img/bot-asistente-siga-header.png" alt="" class="ah-header-icono">
                Asistente de Horario
            </span>
            <button type="button" class="ah-cerrar" aria-label="Cerrar" onclick="toggleAsistenteHorario(false)">✕</button>
        </div>
        <div class="ah-panel-body" id="ah-panel-body"></div>
    `;
    document.body.appendChild(panel);

    renderGridAsistente();
}

function renderGridAsistente() {
    const cont = document.getElementById('ah-panel-body');
    if (!cont) return;

    cont.innerHTML = `<div class="ah-grid">${AH_HERRAMIENTAS.map(h => `
        <button type="button"
            class="ah-tile ${h.activa ? '' : 'ah-tile-construccion'}"
            ${h.activa ? `onclick="abrirHerramientaAsistente('${h.id}')"` : 'onclick="return false;"'}>
            <span class="ah-tile-icono">${h.icono}</span>
            <span class="ah-tile-nombre">${h.nombre}</span>
            ${h.activa ? '' : '<span class="ah-tile-nota">🚧 En construcción</span>'}
        </button>
    `).join('')}</div>`;
}

function toggleAsistenteHorario(forzar) {
    const panel = document.getElementById('ah-panel');
    const overlay = document.getElementById('ah-overlay');
    const btn = document.getElementById('ah-entrada-btn');
    if (!panel) return;

    const abrir = typeof forzar === 'boolean' ? forzar : !panel.classList.contains('abierto');
    panel.classList.toggle('abierto', abrir);
    if (overlay) overlay.classList.toggle('visible', abrir);
    if (btn) btn.classList.toggle('abierto', abrir);
}

function abrirHerramientaAsistente(id) {
    // Placeholder — cada herramienta se conecta acá cuando esté lista.
    console.log('Abrir herramienta del Asistente:', id);
}

// Expuestas en window porque se llaman desde onclick="" en el HTML
window.toggleAsistenteHorario = toggleAsistenteHorario;
window.abrirHerramientaAsistente = abrirHerramientaAsistente;

/* ---------- Arranque: revisa el gate y, si corresponde, muestra
   el botón de entrada + arma el panel (queda oculto hasta que el
   usuario lo abra) ---------- */
(async function iniciarGateAsistenteHorario() {
    const wrap = document.getElementById('asistente-horario-wrap');
    if (!wrap) return;

    const habilitado = await asistenteHorarioHabilitado();
    if (!habilitado) return;

    wrap.style.display = '';
    inicializarAsistenteHorario();
})();