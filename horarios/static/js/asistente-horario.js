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
// depender del orden de carga de otros scripts de la página. Por
// ser módulo, NO comparte el scope de generador.js (sus `let/const`
// no llegan aquí) — por eso este archivo duplica un puñado de
// constantes del calendario (DIAS/ROW_H/HOUR_START/HOUR_END) y lee
// el combo actual a través de window.obtenerComboActual(), expuesto
// a propósito desde generador.js.
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

/* ---------- Constantes del calendario, duplicadas a propósito de
   generador.js (ver nota de scope arriba) — deben coincidir con las
   de ahí si algún día cambian. ---------- */
const AH_DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
const AH_DIAS_LABEL = { LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles', JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado' };
const AH_ROW_H = 38;
const AH_HOUR_START = 7;
const AH_HOUR_END = 22;

/* ---------- Las 6 herramientas del hub.
   `activa: false` = todavía en construcción (se muestra el tile
   pero no hace nada). Se van pasando a `true` una por una a medida
   que cada una queda lista, sin tocar el resto del archivo. ---------- */
const AH_HERRAMIENTAS = [
    { id: 'huecos', icono: '📘', nombre: 'Huecos entre clases', activa: true },
    { id: 'preferencias', icono: '🎛️', nombre: 'Preferencias', activa: true },
    { id: 'mejor-horario', icono: '🧠', nombre: 'Mejor horario', activa: false },
    { id: 'alertas', icono: '🚨', nombre: 'Alertas inteligentes', activa: false },
    { id: 'comparador', icono: '⚖️', nombre: 'Comparador', activa: false },
    { id: 'exportar-calendario', icono: '📅', nombre: 'Exportar a calendario', activa: true },
];

// Recuerda qué vista está abierta ('grid' o el id de una herramienta)
// para poder refrescarla sola cuando el usuario cambia de combinación
// con las flechitas ◀▶ sin cerrar el panel.
let ah_vistaActual = 'grid';

/* ---------- Helpers de formato ---------- */
function formatearMinutos(min) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function formatearHora(min) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

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
    ah_vistaActual = 'grid';
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
    if (id === 'huecos') { ah_vistaActual = 'huecos'; renderVistaHuecos(); return; }
    if (id === 'preferencias') { ah_vistaActual = 'preferencias'; renderVistaPreferencias(); return; }
    if (id === 'exportar-calendario') { exportarComboICS(); return; }
    // Las demás herramientas todavía no están activas — sus tiles ya
    // están deshabilitados en AH_HERRAMIENTAS, esto es solo por si acaso.
}

function volverAGridAsistente() {
    renderGridAsistente();
}

/* ============================================================
   HERRAMIENTA: 🎛️ Preferencias
   Solo guarda la configuración por ahora (localStorage) — no hay
   nada todavía que la consuma. Se conecta cuando construyamos
   "🧠 Mejor horario", que puntúa cada combinación según esto.
   ============================================================ */
const LS_AH_PREFERENCIAS = 'horarioGen_preferencias';

const AH_PREFERENCIAS_DEFECTO = {
    evitarTemprano: false,
    horaTemprano: 480,   // 8:00 — "evitar clases antes de esta hora"
    evitarTarde: false,
    horaTarde: 1200,     // 20:00 — "evitar clases después de esta hora"
    maxDias: 0,          // 0 = sin límite
    diaLibre: '',        // '' = ninguno
};

function leerPreferencias() {
    try {
        const guardado = localStorage.getItem(LS_AH_PREFERENCIAS);
        if (guardado) return { ...AH_PREFERENCIAS_DEFECTO, ...JSON.parse(guardado) };
    } catch (e) {
        console.warn('No se pudo leer las preferencias del Asistente:', e);
    }
    return { ...AH_PREFERENCIAS_DEFECTO };
}

function guardarPreferencias(prefs) {
    try {
        localStorage.setItem(LS_AH_PREFERENCIAS, JSON.stringify(prefs));
    } catch (e) {
        console.warn('No se pudo guardar las preferencias del Asistente:', e);
    }
}

function renderVistaPreferencias() {
    const cont = document.getElementById('ah-panel-body');
    if (!cont) return;

    const p = leerPreferencias();
    const opcionesTemprano = [420, 480, 540, 600];
    const opcionesTarde = [1080, 1140, 1200, 1260];

    cont.innerHTML = `
        <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>

        <div class="ah-pref-grupo">
            <label class="ah-pref-check">
                <input type="checkbox" id="ah-pref-evitarTemprano" ${p.evitarTemprano ? 'checked' : ''}>
                <span>Evitar clases muy temprano</span>
            </label>
            <select id="ah-pref-horaTemprano" class="ah-pref-select">
                ${opcionesTemprano.map(min =>
        `<option value="${min}" ${p.horaTemprano === min ? 'selected' : ''}>antes de las ${formatearHora(min)}</option>`
    ).join('')}
            </select>
        </div>

        <div class="ah-pref-grupo">
            <label class="ah-pref-check">
                <input type="checkbox" id="ah-pref-evitarTarde" ${p.evitarTarde ? 'checked' : ''}>
                <span>Evitar clases muy tarde</span>
            </label>
            <select id="ah-pref-horaTarde" class="ah-pref-select">
                ${opcionesTarde.map(min =>
        `<option value="${min}" ${p.horaTarde === min ? 'selected' : ''}>después de las ${formatearHora(min)}</option>`
    ).join('')}
            </select>
        </div>

        <div class="ah-pref-grupo">
            <label class="ah-pref-label">Máximo de días de asistencia</label>
            <select id="ah-pref-maxDias" class="ah-pref-select">
                <option value="0" ${p.maxDias === 0 ? 'selected' : ''}>Sin límite</option>
                <option value="3" ${p.maxDias === 3 ? 'selected' : ''}>3 días</option>
                <option value="4" ${p.maxDias === 4 ? 'selected' : ''}>4 días</option>
                <option value="5" ${p.maxDias === 5 ? 'selected' : ''}>5 días</option>
            </select>
        </div>

        <div class="ah-pref-grupo">
            <label class="ah-pref-label">Día libre preferido</label>
            <select id="ah-pref-diaLibre" class="ah-pref-select">
                <option value="" ${!p.diaLibre ? 'selected' : ''}>Ninguno</option>
                ${AH_DIAS.map(d =>
        `<option value="${d}" ${p.diaLibre === d ? 'selected' : ''}>${AH_DIAS_LABEL[d]}</option>`
    ).join('')}
            </select>
        </div>

        <button type="button" class="ah-pref-guardar" onclick="guardarPreferenciasUI()">Guardar preferencias</button>

        <div class="ah-pref-nota">
            Estas preferencias se van a usar en "🧠 Mejor horario" para elegir tu
            combinación ideal automáticamente — esa es la siguiente herramienta
            que construimos.
        </div>
    `;
}

function guardarPreferenciasUI() {
    const prefs = {
        evitarTemprano: document.getElementById('ah-pref-evitarTemprano').checked,
        horaTemprano: parseInt(document.getElementById('ah-pref-horaTemprano').value, 10),
        evitarTarde: document.getElementById('ah-pref-evitarTarde').checked,
        horaTarde: parseInt(document.getElementById('ah-pref-horaTarde').value, 10),
        maxDias: parseInt(document.getElementById('ah-pref-maxDias').value, 10),
        diaLibre: document.getElementById('ah-pref-diaLibre').value,
    };
    guardarPreferencias(prefs);
    if (typeof window.showToast === 'function') window.showToast('Preferencias guardadas', 'success');
}

/* ============================================================
   HERRAMIENTA: 📘 Huecos entre clases
   ============================================================ */
function renderVistaHuecos() {
    const cont = document.getElementById('ah-panel-body');
    if (!cont) return;

    const combo = typeof window.obtenerComboActual === 'function' ? window.obtenerComboActual() : null;
    if (!combo) {
        cont.innerHTML = `
            <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>
            <div class="ah-vacio">Genera un horario primero para ver sus huecos y métricas.</div>
        `;
        return;
    }

    const m = calcularMetricasHorario(combo);

    const diasHtml = m.diasOcupados
        .slice()
        .sort((a, b) => AH_DIAS.indexOf(a) - AH_DIAS.indexOf(b))
        .map(dia => {
            const info = m.dias[dia];
            const huecosHtml = info.huecos.length
                ? info.huecos.map(h =>
                    `<span class="ah-hueco-chip">🕐 ${formatearMinutos(h.minutos)} libres para estudiar · ${formatearHora(h.inicio)}–${formatearHora(h.fin)}</span>`
                ).join('')
                : `<span class="ah-hueco-chip ah-hueco-chip-ok">Sin huecos</span>`;

            const filaAntes = info.horasLibresAntesMin > 0
                ? `<div class="ah-dia-fila"><span>🕐 Libre antes de tu primera clase</span><strong>${formatearMinutos(info.horasLibresAntesMin)}</strong></div>`
                : '';
            const filaDespues = info.horasLibresDespuesMin > 0
                ? `<div class="ah-dia-fila"><span>🕐 Libre después de tu última clase</span><strong>${formatearMinutos(info.horasLibresDespuesMin)}</strong></div>`
                : '';

            return `
                <div class="ah-dia-card">
                    <div class="ah-dia-header">
                        <span class="ah-dia-nombre">${AH_DIAS_LABEL[dia]}</span>
                        <span class="ah-dia-horario">${formatearHora(info.horaEntrada)} – ${formatearHora(info.horaSalida)}</span>
                    </div>
                    <div class="ah-dia-fila"><span>Horas de clase</span><strong>${formatearMinutos(info.horasClaseMin)}</strong></div>
                    <div class="ah-dia-fila"><span>Huecos entre clases</span><strong>${formatearMinutos(info.huecosDiaMin)}</strong></div>
                    ${filaAntes}
                    ${filaDespues}
                    <div class="ah-dia-huecos">${huecosHtml}</div>
                </div>
            `;
        }).join('');

    cont.innerHTML = `
        <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>

        <div class="ah-resumen">
            <div class="ah-resumen-item">
                <span>Huecos entre clases</span>
                <strong>${formatearMinutos(m.huecosTotalMin)}</strong>
            </div>
            <div class="ah-resumen-item">
                <span>🕐 Libres para estudiar</span>
                <strong>${formatearMinutos(m.estudioTotalMin)}</strong>
            </div>
            <div class="ah-resumen-item">
                <span>Día más cargado</span>
                <strong>${m.diaMasCargado ? AH_DIAS_LABEL[m.diaMasCargado] : '—'}</strong>
            </div>
            <div class="ah-resumen-item">
                <span>Día con menos carga</span>
                <strong>${m.diaMasLibre ? AH_DIAS_LABEL[m.diaMasLibre] : '—'}</strong>
            </div>
        </div>

        <div class="ah-dias-lista">${diasHtml || '<div class="ah-vacio">Sin clases en esta combinación.</div>'}</div>
    `;
}

/* ============================================================
   HERRAMIENTA: 📅 Exportar a calendario
   Acción instantánea (no abre una vista) — genera el .ics del
   combo que se está viendo ahora mismo y lo descarga de una.
   ============================================================ */
function exportarComboICS() {
    const combo = typeof window.obtenerComboActual === 'function' ? window.obtenerComboActual() : null;
    if (!combo) {
        if (typeof window.showToast === 'function') window.showToast('Genera un horario primero', 'error');
        return;
    }

    const ics = generarICS(combo);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'horario-siga.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    mostrarAvisoICS();
}

// Aviso fijo (sin temporizador) con los pasos para importar el .ics.
// A propósito NO usa showToast(): el alumno se va a otra pestaña a
// abrir su calendario y vuelve varios segundos después — un toast
// que se autodestruye en unos segundos ya no estaría ahí cuando
// regrese a leer el paso a paso. Se queda visible hasta que el
// usuario mismo lo cierra con la ✕.
function mostrarAvisoICS() {
    const cont = document.getElementById('ah-panel-body');
    if (!cont) return;

    cont.innerHTML = `
        <div class="ah-aviso-ics">
            <button type="button" class="ah-aviso-cerrar" aria-label="Cerrar" onclick="volverAGridAsistente()">✕</button>
            <div class="ah-aviso-titulo">✅ Se descargó <code>horario-siga.ics</code></div>
            <div class="ah-aviso-texto">
                Para verlo en <strong>Google Calendar</strong>: entra a
                <strong>Configuración ⚙️ → Importar y exportar → Importar</strong>,
                y sube este archivo.
            </div>
            <div class="ah-aviso-texto">
                También funciona con <strong>Outlook</strong> y <strong>Apple Calendar</strong> —
                solo ábrelo directamente.
            </div>
        </div>
    `;
}

/* ---------- Sombrea los huecos directamente sobre el calendario ya
   dibujado por generador.js — misma técnica de posicionamiento
   (anclar a la celda de la hora de inicio, top/height en px) que
   usa dibujar() para los bloques de clase, para que calcen pixel a
   pixel. ---------- */
function pintarHuecosEnCalendario(combo) {
    document.querySelectorAll('.hueco-block').forEach(el => el.remove());

    const m = calcularMetricasHorario(combo);
    Object.entries(m.dias).forEach(([dia, info]) => {
        const dIdx = AH_DIAS.indexOf(dia);
        if (dIdx === -1) return;

        info.huecos.forEach(h => {
            if (h.minutos < 15) return; // ignora huecos casi imperceptibles (< 15 min)

            const startH = Math.floor(h.inicio / 60);
            const startM = h.inicio % 60;
            if (startH < AH_HOUR_START || startH >= AH_HOUR_END) return;

            const anchor = document.getElementById(`c-${startH}-${dIdx}`);
            if (!anchor) return;

            const topPx = (startM / 60) * AH_ROW_H;
            const heightPx = Math.max((h.minutos / 60) * AH_ROW_H - 2, 10);

            const bloque = document.createElement('div');
            bloque.className = 'hueco-block';
            bloque.style.cssText = `top:${topPx}px; height:${heightPx}px;`;
            bloque.innerHTML = `<span class="hueco-block-label">🕐 ${formatearMinutos(h.minutos)} para estudiar</span>`;
            anchor.appendChild(bloque);
        });
    });
}

/* ---------- Gancho llamado por generador.js cada vez que se dibuja
   una combinación (al generar o al navegar con ◀▶) ---------- */
function onDibujarHorarioAsistente(combo) {
    pintarHuecosEnCalendario(combo);
    if (ah_vistaActual === 'huecos') renderVistaHuecos();
}

/* ---------- Arranque: revisa el gate y, si corresponde, muestra
   el botón de entrada + arma el panel (queda oculto hasta que el
   usuario lo abra). Las funciones que llaman onclick="" y el gancho
   de generador.js solo se exponen en window si el gate pasa —
   para un usuario sin permiso, ni siquiera existen. ---------- */
(async function iniciarGateAsistenteHorario() {
    const wrap = document.getElementById('asistente-horario-wrap');
    if (!wrap) return;

    const habilitado = await asistenteHorarioHabilitado();
    if (!habilitado) return;

    window.toggleAsistenteHorario = toggleAsistenteHorario;
    window.abrirHerramientaAsistente = abrirHerramientaAsistente;
    window.volverAGridAsistente = volverAGridAsistente;
    window.guardarPreferenciasUI = guardarPreferenciasUI;
    window.onDibujarHorarioAsistente = onDibujarHorarioAsistente;

    wrap.style.display = '';
    inicializarAsistenteHorario();

    // Si ya había una combinación dibujada (por ejemplo, si el
    // usuario reabre el panel), pinta sus huecos de una vez.
    const comboActual = typeof window.obtenerComboActual === 'function' ? window.obtenerComboActual() : null;
    if (comboActual) pintarHuecosEnCalendario(comboActual);
})();