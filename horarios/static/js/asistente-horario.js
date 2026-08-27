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
const ASISTENTE_HABILITADO_PARA_TODOS = true;

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
    { id: 'mejor-horario', icono: '🧠', nombre: 'Mejor horario', activa: true },
    { id: 'alertas', icono: '🚨', nombre: 'Alertas inteligentes', activa: true },
    { id: 'comparador', icono: '⚖️', nombre: 'Comparador', activa: true },
    { id: 'exportar-calendario', icono: '📅', nombre: 'Exportar a calendario', activa: true },
];

// Recuerda qué vista está abierta ('grid' o el id de una herramienta)
// para poder refrescarla sola cuando el usuario cambia de combinación
// con las flechitas ◀▶ sin cerrar el panel.
let ah_vistaActual = 'grid';

// Recuerda si el usuario apagó el sombreado de huecos sobre el
// calendario (el panel de "Huecos entre clases" en sí NUNCA se apaga,
// solo el overlay visual sobre las celdas). Por defecto está visible.
const LS_AH_HUECOS_VISIBLES = 'horarioGen_huecosVisiblesCalendario';

function obtenerHuecosVisibles() {
    const guardado = localStorage.getItem(LS_AH_HUECOS_VISIBLES);
    return guardado === null ? true : guardado === 'true';
}

function guardarHuecosVisibles(v) {
    try {
        localStorage.setItem(LS_AH_HUECOS_VISIBLES, String(v));
    } catch (e) {
        console.warn('No se pudo guardar la preferencia de huecos visibles:', e);
    }
}

// Enganchado al interruptor de la vista de Huecos.
function toggleHuecosVisiblesCalendario(visible) {
    guardarHuecosVisibles(visible);
    if (visible) {
        const combo = typeof window.obtenerComboActual === 'function' ? window.obtenerComboActual() : null;
        if (combo) pintarHuecosEnCalendario(combo);
    } else {
        document.querySelectorAll('.hueco-block').forEach(el => el.remove());
    }
}

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
                <span class="ah-panel-header-textos">
                    <span class="ah-panel-header-titulo-texto">Asistente de Horario</span>
                    <span class="ah-panel-header-subtitulo" id="ah-panel-subtitulo">Elige una herramienta</span>
                </span>
            </span>
            <button type="button" class="ah-cerrar" aria-label="Cerrar" onclick="toggleAsistenteHorario(false)">✕</button>
        </div>
        <div class="ah-panel-body" id="ah-panel-body"></div>
    `;
    document.body.appendChild(panel);

    renderGridAsistente();
}

// Actualiza el subtítulo del header con el nombre de la herramienta
// activa — así siempre se sabe qué vista está abierta dentro del panel.
function actualizarSubtituloAsistente(texto) {
    const sub = document.getElementById('ah-panel-subtitulo');
    if (sub) sub.textContent = texto;
}

function renderGridAsistente() {
    ah_vistaActual = 'grid';
    actualizarSubtituloAsistente('Elige una herramienta');
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
    if (id === 'exportar-calendario') { exportarComboICS(); return; }
    if (id === 'mejor-horario') { aplicarMejorHorario(); return; }
    if (id === 'comparador') { renderVistaComparador(); return; }
    if (id === 'alertas') { ah_vistaActual = 'alertas'; renderVistaAlertas(); return; }
}

function volverAGridAsistente() {
    renderGridAsistente();
}

/* ============================================================
   HERRAMIENTA: 🧠 Mejor horario
   Acción instantánea (no abre una vista) — puntúa las
   combinaciones ya generadas según cuántos profesores
   prioritarios (⭐ del sidebar) logra mantener cada una, salta a
   la que mejor puntúa y lo explica en un aviso sobre el calendario.
   ============================================================ */

// 3 puntos por 1.ª opción, 2 por 2.ª, 1 por 3.ª — así una combinación
// con el profesor fija de un curso siempre gana a una que solo tiene
// alternativas, sin importar cuántas alternativas junte.
const AH_PUNTOS_PRIORIDAD = { '1': 3, '2': 2, '3': 1 };

function puntuarComboPorPrioridad(combo, prioridades) {
    let puntaje = 0;
    const fijaLogrados = [];
    combo.forEach(sec => {
        const p = prioridades[sec.nombre] && prioridades[sec.nombre][sec.docente];
        if (!p) return;
        puntaje += AH_PUNTOS_PRIORIDAD[p] || 0;
        if (p === '1') fijaLogrados.push(sec.nombre);
    });
    return { puntaje, fijaLogrados };
}

function aplicarMejorHorario() {
    const combos = typeof window.obtenerTodosLosCombos === 'function' ? window.obtenerTodosLosCombos() : [];
    if (!combos.length) {
        if (typeof window.showToast === 'function') window.showToast('Genera un horario primero', 'error');
        return;
    }

    const prioridades = typeof window.obtenerPrioridadesProfesor === 'function' ? window.obtenerPrioridadesProfesor() : {};
    if (!Object.keys(prioridades).length) {
        if (typeof window.showToast === 'function') {
            window.showToast('Marca a tu profesor fija en el sidebar primero (1.ª opción)', 'info');
        }
        return;
    }

    // Desempate: si dos combinaciones puntúan igual, gana la que
    // tiene menos huecos entre clases — reusa el motor de la
    // herramienta "Huecos entre clases", nada nuevo que calcular.
    let mejorIdx = 0, mejorPuntaje = -1, mejorFijaLogrados = [], mejorHuecos = Infinity;
    combos.forEach((combo, idx) => {
        const { puntaje, fijaLogrados } = puntuarComboPorPrioridad(combo, prioridades);
        const huecos = calcularMetricasHorario(combo).huecosTotalMin;
        const esMejor = puntaje > mejorPuntaje || (puntaje === mejorPuntaje && huecos < mejorHuecos);
        if (esMejor) {
            mejorPuntaje = puntaje;
            mejorIdx = idx;
            mejorFijaLogrados = fijaLogrados;
            mejorHuecos = huecos;
        }
    });

    if (typeof window.irACombo === 'function') window.irACombo(mejorIdx);
    mostrarBannerMejorHorario(mejorIdx, combos.length, mejorFijaLogrados);
    toggleAsistenteHorario(false);
}

function mostrarBannerMejorHorario(idx, total, fijaLogrados) {
    const banner = document.getElementById('ah-banner-mejor-horario');
    if (!banner) return;

    const detalle = fijaLogrados.length
        ? `Incluye a tu${fijaLogrados.length > 1 ? 's' : ''} profesor${fijaLogrados.length > 1 ? 'es' : ''} fija: ${fijaLogrados.join(', ')}`
        : 'Ninguna combinación logró mantener a tu profesor fija con la selección actual';

    banner.innerHTML = `
        <span class="ah-banner-icono">🎯</span>
        <div class="ah-banner-texto">
            <p class="ah-banner-titulo">Opción ${idx + 1} de ${total} — la que mejor respeta tu estrategia de matrícula</p>
            <p class="ah-banner-detalle">${detalle}</p>
        </div>
        <button type="button" class="ah-banner-cerrar" aria-label="Cerrar" onclick="ocultarBannerMejorHorario()">✕</button>
    `;
    banner.style.display = 'flex';
}

function ocultarBannerMejorHorario() {
    const banner = document.getElementById('ah-banner-mejor-horario');
    if (banner) banner.style.display = 'none';
}

/* ============================================================
   HERRAMIENTA: ⚖️ Comparador
   Compara 2-3 horarios que ya guardaste como ★ Favoritos (no
   compara combinaciones nuevas — para eso está "Mejor horario").
   Reusa el mismo motor de métricas y de puntuación por profesor
   prioritario que ya construimos, así que no hay nada nuevo que
   calcular acá, solo una vista que junta lo que ya existe.
   ============================================================ */
let ah_comparadorSeleccion = new Set();

function renderVistaComparador() {
    ah_vistaActual = 'comparador';
    actualizarSubtituloAsistente('⚖️ Comparador');
    const favoritos = typeof window.obtenerFavoritos === 'function' ? window.obtenerFavoritos() : [];

    if (favoritos.length < 2) {
        const cont = document.getElementById('ah-panel-body');
        if (!cont) return;
        cont.innerHTML = `
            <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>
            <div class="ah-vacio">
                Guarda al menos 2 horarios con "★ Guardar" para poder compararlos.
            </div>
        `;
        return;
    }

    // Conserva la selección anterior si sigue siendo válida; si no hay
    // ninguna (primera vez que se abre), arranca comparando las dos
    // primeras.
    ah_comparadorSeleccion = new Set(
        [...ah_comparadorSeleccion].filter(i => i < favoritos.length)
    );
    if (ah_comparadorSeleccion.size === 0) {
        ah_comparadorSeleccion.add(0);
        ah_comparadorSeleccion.add(1);
    }

    renderComparadorCompleto(favoritos);
}

function renderComparadorCompleto(favoritos) {
    const cont = document.getElementById('ah-panel-body');
    if (!cont) return;

    const listaHtml = favoritos.map((fav, i) => `
        <label class="ah-comparador-check">
            <input type="checkbox" value="${i}" ${ah_comparadorSeleccion.has(i) ? 'checked' : ''}
                onchange="toggleComparadorSeleccion(${i}, this.checked)">
            <span>★ ${fav.nombre}</span>
        </label>
    `).join('');

    const seleccionados = [...ah_comparadorSeleccion].sort((a, b) => a - b);
    const tarjetasHtml = seleccionados.length >= 2
        ? seleccionados.map(i => renderTarjetaComparador(favoritos[i], i)).join('')
        : '<div class="ah-vacio">Elige al menos 2 para ver la comparación.</div>';

    cont.innerHTML = `
        <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>
        <p class="ah-comparador-intro">Elige hasta 3 horarios guardados para comparar</p>
        <div class="ah-comparador-lista">${listaHtml}</div>
        <div class="ah-comparador-tarjetas">${tarjetasHtml}</div>
    `;
}

function toggleComparadorSeleccion(idx, marcado) {
    if (marcado && ah_comparadorSeleccion.size >= 3) {
        if (typeof window.showToast === 'function') window.showToast('Máximo 3 horarios a la vez', 'info');
        renderVistaComparador();
        return;
    }
    if (marcado) ah_comparadorSeleccion.add(idx);
    else ah_comparadorSeleccion.delete(idx);

    const favoritos = typeof window.obtenerFavoritos === 'function' ? window.obtenerFavoritos() : [];
    renderComparadorCompleto(favoritos);
}

function renderTarjetaComparador(fav, idx) {
    const combo = fav.combo;
    const m = calcularMetricasHorario(combo);
    const prioridades = typeof window.obtenerPrioridadesProfesor === 'function' ? window.obtenerPrioridadesProfesor() : {};
    const { fijaLogrados } = puntuarComboPorPrioridad(combo, prioridades);

    return `
        <div class="ah-comp-tarjeta">
            <div class="ah-comp-nombre">★ ${fav.nombre}</div>
            <div class="ah-comp-fila"><span>Huecos entre clases</span><strong>${formatearMinutos(m.huecosTotalMin)}</strong></div>
            <div class="ah-comp-fila"><span>Profesores fija</span><strong>${fijaLogrados.length || '—'}</strong></div>
            <div class="ah-comp-fila"><span>Día más cargado</span><strong>${m.diaMasCargado ? AH_DIAS_LABEL[m.diaMasCargado] : '—'}</strong></div>
            <div class="ah-comp-fila"><span>Día con menos carga</span><strong>${m.diaMasLibre ? AH_DIAS_LABEL[m.diaMasLibre] : '—'}</strong></div>
            <button type="button" class="ah-comp-ver-btn" onclick="irAVerFavorito(${idx})">Ver este horario →</button>
        </div>
    `;
}

function irAVerFavorito(idx) {
    if (typeof window.verFavorito === 'function') window.verFavorito(idx);
    toggleAsistenteHorario(false);
}

/* ============================================================
   HERRAMIENTA: 🚨 Alertas inteligentes
   Solo detecta y explica — nada de auto-arreglo (eso queda para
   más adelante si de verdad hace falta). Reusa el mismo motor de
   métricas de "Huecos entre clases" y la misma puntuación por
   profesor prioritario de "Mejor horario" — nada nuevo que
   calcular acá.
   ============================================================ */
const AH_HUECO_LARGO_MIN = 120;               // 2h
const AH_DIA_LARGO_MIN = 600;                 // 10h
const AH_ENTRADA_TEMPRANA_MIN = 480;          // 8:00
const AH_ALMUERZO_INICIO = 12 * 60;           // 12:00
const AH_ALMUERZO_FIN = 14 * 60 + 30;         // 14:30
const AH_ALMUERZO_MIN_NECESARIO = 30;         // mínimo para contar como "sí alcanza"
const AH_LIBRE_ANTES_INICIO_DIA = 7 * 60;     // 7:00 — mismo criterio que el calendario
const AH_LIBRE_ANTES_UMBRAL = 120;            // solo se muestra si son 2h o más

// Cuánto se solapan dos intervalos de tiempo (en minutos). 0 si no
// se tocan — usado para saber si un tramo libre realmente cae
// dentro de la ventana de almuerzo, no solo "hay un hueco por ahí".
function solapeMin(iniA, finA, iniB, finB) {
    return Math.max(0, Math.min(finA, finB) - Math.max(iniA, iniB));
}

// ¿Alcanza el tiempo para almorzar? Revisa las TRES fuentes de tiempo
// libre del día — antes de la primera clase, los huecos entre clases,
// y después de la última — no solo los huecos internos (ese era el
// bug: un alumno con su primera clase a la 1pm sí tiene tiempo antes,
// aunque no tenga ningún "hueco" registrado ese día).
function alcanzaParaAlmorzar(info) {
    const intervalosLibres = [
        { ini: 0, fin: info.horaEntrada },
        ...info.huecos.map(h => ({ ini: h.inicio, fin: h.fin })),
        { ini: info.horaSalida, fin: 24 * 60 },
    ];
    return intervalosLibres.some(iv =>
        solapeMin(iv.ini, iv.fin, AH_ALMUERZO_INICIO, AH_ALMUERZO_FIN) >= AH_ALMUERZO_MIN_NECESARIO
    );
}

function contarPracticasPorDia(combo) {
    const porDia = {};
    combo.forEach(sec => {
        sec.clases.forEach(cl => {
            const esTeoria = cl.tipo === 'T' || /TEOR/i.test(cl.tipo);
            if (esTeoria) return;
            if (!porDia[cl.dia]) porDia[cl.dia] = [];
            porDia[cl.dia].push(sec.nombre);
        });
    });
    return porDia;
}

function detectarAlertas(combo) {
    const m = calcularMetricasHorario(combo);
    const alertas = [];

    Object.entries(m.dias).forEach(([dia, info]) => {
        info.huecos.forEach(h => {
            if (h.minutos >= AH_HUECO_LARGO_MIN) {
                alertas.push({
                    icono: '🕳️',
                    titulo: `Hueco largo el ${AH_DIAS_LABEL[dia]}`,
                    detalle: `${formatearMinutos(h.minutos)} libres entre ${formatearHora(h.inicio)} y ${formatearHora(h.fin)} — revisa si te conviene otra sección con menos espera.`,
                });
            }
        });

        if (!alcanzaParaAlmorzar(info)) {
            alertas.push({
                icono: '🍽️',
                titulo: `Sin tiempo para almorzar el ${AH_DIAS_LABEL[dia]}`,
                detalle: `No hay ningún tramo de al menos 30 min libre entre ${formatearHora(AH_ALMUERZO_INICIO)} y ${formatearHora(AH_ALMUERZO_FIN)} — ni antes, ni entre, ni después de tus clases.`,
            });
        }

        const duracionDia = info.horaSalida - info.horaEntrada;
        if (duracionDia >= AH_DIA_LARGO_MIN) {
            alertas.push({
                icono: '⏳',
                titulo: `${AH_DIAS_LABEL[dia]} muy largo`,
                detalle: `De ${formatearHora(info.horaEntrada)} a ${formatearHora(info.horaSalida)} — ${formatearMinutos(duracionDia)} de corrido con la universidad, contando huecos.`,
            });
        }

        if (info.horaEntrada < AH_ENTRADA_TEMPRANA_MIN) {
            alertas.push({
                icono: '🌅',
                titulo: `Entrada temprana el ${AH_DIAS_LABEL[dia]}`,
                detalle: `Tu primera clase empieza a las ${formatearHora(info.horaEntrada)}.`,
            });
        }
    });

    Object.entries(contarPracticasPorDia(combo)).forEach(([dia, cursos]) => {
        if (cursos.length >= 2) {
            alertas.push({
                tipo: 'roja',
                icono: '📝',
                titulo: `${cursos.length} prácticas el ${AH_DIAS_LABEL[dia]}`,
                detalle: `${cursos.join(', ')} — las prácticas suelen ser también evaluaciones. Organiza bien tu semana de estudio para no llegar justo a ese día.`,
            });
        }
    });

    const prioridades = typeof window.obtenerPrioridadesProfesor === 'function' ? window.obtenerPrioridadesProfesor() : {};
    Object.entries(prioridades).forEach(([curso, porDocente]) => {
        const docenteFija = Object.keys(porDocente).find(d => porDocente[d] === '1');
        if (!docenteFija) return;
        const seccionDelCurso = combo.find(sec => sec.nombre === curso);
        if (seccionDelCurso && seccionDelCurso.docente !== docenteFija) {
            alertas.push({
                icono: '⭐',
                titulo: `Sin tu profesor fija en ${curso}`,
                detalle: `Esta opción tiene a ${seccionDelCurso.docente}, no a ${docenteFija} (tu 1.ª opción).`,
                accionTexto: 'Buscar mejor opción →',
                accion: 'aplicarMejorHorario()',
            });
        }
    });

    return alertas;
}

// Dato positivo (no es un problema) — tiempo libre antes de la
// primera clase del día, cuando es lo bastante largo para servir de
// algo real (estudiar, descansar, hacer otras cosas).
function detectarTiempoLibrePositivo(combo) {
    const m = calcularMetricasHorario(combo);
    const positivos = [];

    m.diasOcupados.forEach(dia => {
        const info = m.dias[dia];
        const libreAntes = Math.max(0, info.horaEntrada - AH_LIBRE_ANTES_INICIO_DIA);
        if (libreAntes >= AH_LIBRE_ANTES_UMBRAL) {
            positivos.push({
                dia,
                minutos: libreAntes,
                detalle: `De ${formatearHora(AH_LIBRE_ANTES_INICIO_DIA)} a ${formatearHora(info.horaEntrada)}, antes de tu primera clase — para estudiar u otras actividades.`,
            });
        }
    });

    return positivos;
}

function renderVistaAlertas() {
    actualizarSubtituloAsistente('🚨 Alertas inteligentes');
    const cont = document.getElementById('ah-panel-body');
    if (!cont) return;

    const combo = typeof window.obtenerComboActual === 'function' ? window.obtenerComboActual() : null;
    if (!combo) {
        cont.innerHTML = `
            <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>
            <div class="ah-vacio">Genera un horario primero para revisar sus alertas.</div>
        `;
        return;
    }

    const alertas = detectarAlertas(combo);
    const alertasHtml = alertas.length
        ? alertas.map(a => `
            <div class="ah-alerta-card ${a.tipo === 'roja' ? 'ah-alerta-card-roja' : ''}">
                <span class="ah-alerta-icono">${a.icono}</span>
                <div class="ah-alerta-texto">
                    <p class="ah-alerta-titulo">${a.titulo}</p>
                    <p class="ah-alerta-detalle">${a.detalle}</p>
                    ${a.accion ? `<button type="button" class="ah-alerta-accion" onclick="${a.accion}">${a.accionTexto}</button>` : ''}
                </div>
            </div>
        `).join('')
        : `<div class="ah-alerta-ok">✅ Sin problemas detectados en esta combinación.</div>`;

    const positivos = detectarTiempoLibrePositivo(combo);
    const positivosHtml = positivos.length
        ? `
            <p class="ah-seccion-titulo">Tiempo libre</p>
            <div class="ah-positivos-lista">
                ${positivos.map(p => `
                    <div class="ah-positivo-card">
                        <span class="ah-positivo-icono">🕐</span>
                        <div class="ah-positivo-texto">
                            <p class="ah-positivo-titulo">${formatearMinutos(p.minutos)} libres el ${AH_DIAS_LABEL[p.dia]}</p>
                            <p class="ah-positivo-detalle">${p.detalle}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `
        : '';

    cont.innerHTML = `
        <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>
        <div class="ah-alertas-lista">${alertasHtml}</div>
        ${positivosHtml}
    `;
}

/* ============================================================
   HERRAMIENTA: 📘 Huecos entre clases
   ============================================================ */
function renderVistaHuecos() {
    actualizarSubtituloAsistente('📘 Huecos entre clases');
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

    const huecosVisibles = obtenerHuecosVisibles();

    cont.innerHTML = `
        <button type="button" class="ah-volver" onclick="volverAGridAsistente()">← Volver</button>

        <div class="ah-huecos-toggle-row">
            <label class="ah-toggle">
                <input type="checkbox" id="ah-huecos-toggle" ${huecosVisibles ? 'checked' : ''}
                    onchange="toggleHuecosVisiblesCalendario(this.checked)">
                <span class="ah-toggle-slider"></span>
            </label>
            <span class="ah-huecos-toggle-label">Mostrar huecos sombreados en el calendario</span>
        </div>

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
    actualizarSubtituloAsistente('📅 Exportar a calendario');
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

    // El usuario apagó el interruptor "Mostrar en el calendario" — se
    // limpia el overlay (arriba) y no se vuelve a dibujar nada, pero
    // el panel de Huecos sigue funcionando normal si lo vuelve a abrir.
    if (!obtenerHuecosVisibles()) return;

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
    if (ah_vistaActual === 'alertas') renderVistaAlertas();
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
    window.ocultarBannerMejorHorario = ocultarBannerMejorHorario;
    window.aplicarMejorHorario = aplicarMejorHorario;
    window.toggleComparadorSeleccion = toggleComparadorSeleccion;
    window.irAVerFavorito = irAVerFavorito;
    window.onDibujarHorarioAsistente = onDibujarHorarioAsistente;
    window.toggleHuecosVisiblesCalendario = toggleHuecosVisiblesCalendario;

    wrap.style.display = '';
    inicializarAsistenteHorario();

    // Si ya había una combinación dibujada (por ejemplo, si el
    // usuario reabre el panel), pinta sus huecos de una vez.
    const comboActual = typeof window.obtenerComboActual === 'function' ? window.obtenerComboActual() : null;
    if (comboActual) pintarHuecosEnCalendario(comboActual);
})();