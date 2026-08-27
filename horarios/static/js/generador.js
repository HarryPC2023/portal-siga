// ── CONSTANTES ────────────────────────────────────────────────
const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
const DIAS_LABEL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DIAS_ABREV = { LUNES: 'Lu', MARTES: 'Ma', MIERCOLES: 'Mi', JUEVES: 'Ju', VIERNES: 'Vi', SABADO: 'Sa' };
const ROW_H = 38;
const HOUR_START = 7;
const HOUR_END = 22;

const PALETTE = [
    "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
    "#0891b2", "#16a34a", "#84cc16", "#f97316", "#6366f1"
];

let courseColors = {};
let combosValidos = [];
let currentIndex = 0;
let maxCruces = 0;
let seccionesData = {};

// Estado de "viendo un favorito": cuando no es null, la pantalla está
// mostrando un único horario guardado (no una combinación generada).
// combosValidosAntesDeFavorito guarda la lista completa de vuelta,
// para poder restaurarla con "Salir del favorito" sin tener que
// regenerar de nuevo.
let viendoFavoritoNombre = null;
let combosValidosAntesDeFavorito = null;

if (typeof cargaGlobal === 'undefined') var cargaGlobal = null;

// Expuesto para que el Asistente de Horario (módulo aparte, cargado
// como <script type="module">) pueda leer el combo que se está
// mostrando ahora mismo, sin depender del scope interno de este
// archivo (combosValidos/currentIndex son `let`, no quedan en window).
window.obtenerComboActual = () => combosValidos[currentIndex] || null;
window.obtenerTodosLosCombos = () => combosValidos.slice();

// Salta directo a una combinación ya generada (usado por "🧠 Mejor
// horario" del Asistente). Devuelve false si no hay nada generado.
window.irACombo = (idx) => {
    if (!combosValidos.length) return false;
    currentIndex = Math.max(0, Math.min(idx, combosValidos.length - 1));
    dibujar(currentIndex);
    return true;
};

// Expuesto para que "⚖️ Comparador" (Asistente de Horario) pueda leer
// los horarios guardados como favoritos.
window.obtenerFavoritos = () => Favoritos.obtener();

// ── AUTOGUARDADO (pantalla 2) ────────────────────────────────
// Guarda qué secciones/profesores quedaron marcados y la cantidad
// de cruces elegida, para que no se pierdan al volver a esta pantalla.
// Mismo mecanismo (localStorage) que ya usa index.html para el Excel.
const LS_GEN_SECCIONES = 'horarioGen_seccionesGen';
const LS_GEN_CRUCES = 'horarioGen_cruces';
// Caché de las combinaciones ya generadas: antes esto "sobrevivía" a
// volver a la página solo por casualidad (bfcache del navegador). Se
// guarda explícito para que funcione siempre, en cualquier cuenta o
// navegador — mismo mecanismo (localStorage) que ya usan las líneas
// de arriba para secciones/cruces.
const LS_GEN_COMBOS = 'horarioGen_combosCache';
const LS_GEN_COMBOS_IDX = 'horarioGen_combosIdx';
// Prioridad de profesor por curso (1.ª/2.ª/3.ª opción) — parte de la
// "Estrategia de matrícula" del Asistente de Horario.
const LS_GEN_PRIORIDADES = 'horarioGen_prioridadesProfesor';
// Misma clave que usa index.html (LS_SEL) para la lista de cursos
// marcados en "Elegir cursos" — se actualiza al eliminar un curso acá,
// para que ambas pantallas queden consistentes.
const LS_SEL_INDEX = 'horarioGen_seleccion';

// ── ELIMINAR CURSO: gate de admin (mismo patrón que
//    ASISTENTE_HABILITADO_PARA_TODOS en asistente-horario.js) ────
// Ya probado y funcionando bien — 25/08/2026, Harry dio el OK para
// abrirlo a todos los usuarios. Si algún día hiciera falta volver a
// restringirlo, basta con poner esta bandera en `false` de nuevo.
const ELIMINAR_CURSO_HABILITADO_PARA_TODOS = true;
const ADMIN_UID_SIGA = 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1';

async function iniciarGateEliminarCurso() {
    if (ELIMINAR_CURSO_HABILITADO_PARA_TODOS) {
        document.body.classList.add('eliminar-curso-habilitado');
        return;
    }
    try {
        const userId = await obtenerUserIdActual();
        if (userId === ADMIN_UID_SIGA) {
            document.body.classList.add('eliminar-curso-habilitado');
        }
    } catch (e) {
        console.warn('No se pudo verificar el gate de "Eliminar curso":', e);
    }
}

// ── NOMBRE A MOSTRAR (mismo helper que index.html y scheduler.js) ──
// La llave interna de un curso a veces trae " (CÓDIGO)" pegado al final
// — solo pasa cuando dos cursos de carreras distintas comparten nombre
// oficial pero código distinto (ver generar_carga_horario.py). Hace
// falta por dentro para no mezclarlos; en pantalla se quita, ya que el
// código se ve aparte en su badge.
function nombreVisible(nombre, codigo) {
    if (codigo && nombre.endsWith(` (${codigo})`)) {
        return nombre.slice(0, -(`(${codigo})`.length + 1));
    }
    return nombre;
}

// ── Puente con Supabase (auth-siga.js) ──────────────────────────
function esperarSupabaseListo() {
    if (window.sigaSupabase) return Promise.resolve();
    return new Promise(resolve => window.addEventListener('siga:supabase-listo', resolve, { once: true }));
}

async function obtenerUserIdActual() {
    await esperarSupabaseListo();
    try {
        const sesion = await window.sigaObtenerSesion();
        return sesion?.user?.id || null;
    } catch (e) {
        console.warn('No se pudo obtener la sesión actual:', e);
        return null;
    }
}

// Autoguardado en la nube con debounce (evita un upsert por cada checkbox).
let _debounceNubeGen = null;
function guardarEnNube(campos) {
    clearTimeout(_debounceNubeGen);
    _debounceNubeGen = setTimeout(async () => {
        const userId = await obtenerUserIdActual();
        if (!userId) return;
        try {
            const { error } = await window.sigaSupabase
                .from('horarios_alumno')
                .upsert({ user_id: userId, actualizado_en: new Date().toISOString(), ...campos });
            if (error) console.warn('No se pudo sincronizar con la nube:', error);
        } catch (e) {
            console.warn('Error sincronizando con la nube:', e);
        }
    }, 800);
}

// ── TOOLTIP ───────────────────────────────────────────────────
let tooltipEl = null;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendarWrap')) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';
        document.body.appendChild(tooltipEl);
    }
});

// ── INICIALIZAR ───────────────────────────────────────────────
function inicializar(cursos) {
    if (!cursos || !cursos.length) {
        window.location.href = 'index.html';
        return;
    }

    if (!cargaGlobal) {
        const listaCursos = document.getElementById('listaCursos');
        if (listaCursos) listaCursos.innerHTML =
            '<div style="color:#ef4444;font-size:12px">Sin datos. <a href="index.html">Vuelve al inicio</a> y carga el Excel.</div>';
        return;
    }

    cursos.forEach((c, i) => {
        const color = PALETTE[i % PALETTE.length];
        courseColors[c] = color;
        // También bajo el nombre "limpio" (sin el sufijo interno de
        // código): el calendario, tooltip, Excel exportado y favoritos
        // buscan el color por ese nombre limpio, no por la llave interna.
        const codigo = ((cargaGlobal[c] && Object.values(cargaGlobal[c])[0]) || {}).codigo || '';
        courseColors[nombreVisible(c, codigo)] = color;
    });

    seccionesData = {};
    cursos.forEach(curso => {
        if (curso in cargaGlobal) {
            seccionesData[curso] = cargaGlobal[curso];
        }
    });

    renderSidebar(seccionesData);
    iniciarGateEliminarCurso();

    // Restaura lo que el usuario había marcado/elegido la última vez.
    // Si no hay nada guardado (o pertenece a un archivo distinto ya
    // limpiado desde index.html), simplemente se queda en los valores
    // por defecto (todas las secciones marcadas, 0 cruces).
    restaurarSeleccionSecciones();
    restaurarCruces();
    restaurarCombosCache();

    // Reconciliación con la nube: por si desde otro dispositivo hay una
    // selección/cruces más reciente. Si difiere de lo que ya se restauró
    // localmente arriba, se aplica y se regenera; si es igual, no se toca
    // nada (el caché local de arriba ya dibujó bien).
    sincronizarSeleccionDesdeNube();

    // Trae los favoritos guardados en la nube. No se espera (no
    // bloqueante) — para cuando el usuario abra el panel de
    // Favoritos, en la enorme mayoría de los casos ya habrá terminado;
    // toggleFavoritos() espera de todos modos si aún no acabó.
    Favoritos.cargarDesdeNube();
}

// ── Reconciliación con la nube (no reemplaza el caché local, solo
//    corrige si hay algo distinto guardado desde otro dispositivo) ──
async function sincronizarSeleccionDesdeNube() {
    const userId = await obtenerUserIdActual();
    if (!userId) return;

    try {
        const { data, error } = await window.sigaSupabase
            .from('horarios_alumno')
            .select('secciones_generador, cruces, prioridades_profesor')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) { console.warn('No se pudo sincronizar la selección del generador desde la nube:', error); return; }

        if (!data || (!data.secciones_generador && data.cruces == null && !data.prioridades_profesor)) {
            // No hay nada en la nube todavía: si sí hay algo local (usuario
            // de antes de esta actualización), lo subimos una sola vez.
            const seleccionLocal = localStorage.getItem(LS_GEN_SECCIONES);
            const crucesLocal = localStorage.getItem(LS_GEN_CRUCES);
            const prioridadesLocal = localStorage.getItem(LS_GEN_PRIORIDADES);
            if (seleccionLocal) { try { guardarEnNube({ secciones_generador: JSON.parse(seleccionLocal) }); } catch (e) { } }
            if (crucesLocal !== null) guardarEnNube({ cruces: parseInt(crucesLocal, 10) || 0 });
            if (prioridadesLocal) { try { guardarEnNube({ prioridades_profesor: JSON.parse(prioridadesLocal) }); } catch (e) { } }
            return;
        }

        let cambioAlgo = false;

        if (data.secciones_generador) {
            const nubeStr = JSON.stringify(data.secciones_generador);
            if (localStorage.getItem(LS_GEN_SECCIONES) !== nubeStr) {
                document.querySelectorAll('.p-check').forEach(cb => {
                    const curso = cb.dataset.curso;
                    if (curso in data.secciones_generador) {
                        cb.checked = data.secciones_generador[curso].includes(cb.dataset.seccion);
                    }
                });
                try { localStorage.setItem(LS_GEN_SECCIONES, nubeStr); } catch (e) { /* no crítico */ }
                cambioAlgo = true;
            }
        }

        if (data.cruces != null && String(data.cruces) !== localStorage.getItem(LS_GEN_CRUCES)) {
            setCruces(data.cruces); // ya guarda en LS_GEN_CRUCES vía guardarCruces()
            cambioAlgo = true;
        }

        // Prioridades de profesor (Estrategia de matrícula): no afectan
        // qué combinaciones se generan, así que se aplican directo sobre
        // los selectores ya dibujados sin pasar por generar() de nuevo.
        if (data.prioridades_profesor) {
            const nubeStr = JSON.stringify(data.prioridades_profesor);
            if (localStorage.getItem(LS_GEN_PRIORIDADES) !== nubeStr) {
                aplicarPrioridadesEnSidebar(data.prioridades_profesor);
                try { localStorage.setItem(LS_GEN_PRIORIDADES, nubeStr); } catch (e) { /* no crítico */ }
            }
        }

        // Solo regenera si la nube trajo algo distinto a lo que ya se
        // había dibujado con el caché local — evita un regenerado doble.
        if (cambioAlgo) generar();
    } catch (e) {
        console.warn('Error sincronizando la selección del generador desde la nube:', e);
    }
}

// ── AUTOGUARDADO: secciones/profesores marcados ────────────────
function guardarSeleccionSecciones() {
    const seleccion = {};
    document.querySelectorAll('.p-check').forEach(cb => {
        if (!seleccion[cb.dataset.curso]) seleccion[cb.dataset.curso] = [];
        if (cb.checked) seleccion[cb.dataset.curso].push(cb.dataset.seccion);
    });
    try {
        localStorage.setItem(LS_GEN_SECCIONES, JSON.stringify(seleccion));
    } catch (e) {
        // Guardado silencioso: si falla (ej. modo incógnito sin storage),
        // no interrumpe el uso normal del generador.
        console.warn('No se pudo guardar la selección de secciones:', e);
    }
    guardarEnNube({ secciones_generador: seleccion });
}

function restaurarSeleccionSecciones() {
    let seleccion = null;
    try {
        const guardado = localStorage.getItem(LS_GEN_SECCIONES);
        if (guardado) seleccion = JSON.parse(guardado);
    } catch (e) {
        console.warn('No se pudo restaurar la selección de secciones:', e);
    }
    if (!seleccion) return;

    document.querySelectorAll('.p-check').forEach(cb => {
        const curso = cb.dataset.curso;
        // Si el curso no estaba en lo guardado (ej. es un curso nuevo que
        // no existía la vez anterior), se deja el valor por defecto (marcado).
        if (curso in seleccion) {
            cb.checked = seleccion[curso].includes(cb.dataset.seccion);
        }
    });
}

// ── ELIMINAR CURSO (🔒 solo admin mientras se prueba) ────────────
// Modal de confirmación con la estética de SIGA (mismo patrón
// .modal-overlay/.modal-card que usa "Conectar a Matrícula UNI" en
// index.html) en vez del confirm() nativo del navegador, que se ve
// genérico y no encaja con el resto de la web.
function mostrarModalEliminarCurso(curso, nombreMostrado, blockEl) {
    const existente = document.getElementById('modal-eliminar-curso-overlay');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-eliminar-curso-overlay';
    overlay.innerHTML = `
        <div class="modal-card modal-card-peligro" style="text-align:left; width:320px;">
            <div class="modal-icon">🗑️</div>
            <div class="modal-title" style="text-align:center;">¿Quitar este curso?</div>
            <div class="modal-desc" style="text-align:center;">
                <strong>${nombreMostrado}</strong> se quitará de este horario.
                Podrás volver a añadirlo desde "← Elegir cursos".
            </div>
            <div class="modal-actions">
                <button type="button" class="modal-btn-cancel" onclick="cerrarModalEliminarCurso()">Cancelar</button>
                <button type="button" class="modal-btn-primary" id="modal-eliminar-curso-confirmar">Sí, quitar</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrarModalEliminarCurso(); });
    document.getElementById('modal-eliminar-curso-confirmar').addEventListener('click', () => {
        cerrarModalEliminarCurso();
        eliminarCursoDelGenerador(curso, blockEl);
    });
}

function cerrarModalEliminarCurso() {
    const overlay = document.getElementById('modal-eliminar-curso-overlay');
    if (overlay) overlay.classList.remove('show');
}

// Quita un curso completo de esta pantalla del Generador: de la
// memoria (seccionesData/cargaGlobal), del DOM, de la selección que
// vive en index.html (para que "← Elegir cursos" no lo siga mostrando
// marcado) y de la URL (para que un F5 no lo vuelva a traer). Si ya
// había una combinación generada, la recalcula de una vez.
function eliminarCursoDelGenerador(curso, blockEl) {
    delete seccionesData[curso];
    if (cargaGlobal) delete cargaGlobal[curso];
    if (blockEl) blockEl.remove();

    // Sincroniza con la lista de "Elegir cursos" (index.html) — misma
    // clave que usa esa pantalla (LS_SEL ahí, LS_SEL_INDEX acá).
    try {
        const guardado = localStorage.getItem(LS_SEL_INDEX);
        if (guardado) {
            const lista = JSON.parse(guardado).filter(c => c !== curso);
            localStorage.setItem(LS_SEL_INDEX, JSON.stringify(lista));
        }
    } catch (e) {
        console.warn('No se pudo actualizar la selección de "Elegir cursos":', e);
    }

    // Limpia la selección de secciones guardada (lee de los checkbox
    // que quedan en el DOM, ya sin el curso eliminado) y sube el cambio
    // a la nube igual que cualquier otro cambio de selección.
    guardarSeleccionSecciones();

    // Actualiza la URL sin recargar, para que un F5 no vuelva a traer
    // el curso eliminado (llegó acá como ?curso=... desde index.html).
    try {
        const params = new URLSearchParams(window.location.search);
        const restantes = params.getAll('curso').filter(c => c !== curso);
        params.delete('curso');
        restantes.forEach(c => params.append('curso', c));
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    } catch (e) { /* no crítico */ }

    if (typeof showToast === 'function') showToast('Curso quitado de este horario', 'info');

    // Sin cursos restantes, no tiene sentido seguir en esta pantalla —
    // mismo destino que cuando se entra sin ninguno seleccionado.
    if (!Object.keys(seccionesData).length) {
        window.location.href = 'index.html';
        return;
    }

    // Si ya había una combinación generada, la recalcula de una vez
    // para que el calendario deje de mostrar el curso eliminado.
    if (combosValidos.length) generar();
}

// ── AUTOGUARDADO: cantidad de cruces ────────────────────────────
function guardarCruces(v) {
    try {
        localStorage.setItem(LS_GEN_CRUCES, String(v));
    } catch (e) {
        console.warn('No se pudo guardar la cantidad de cruces:', e);
    }
    guardarEnNube({ cruces: v });
}

function restaurarCruces() {
    const guardado = localStorage.getItem(LS_GEN_CRUCES);
    if (guardado === null) return;
    const v = parseInt(guardado, 10);
    if (!isNaN(v)) setCruces(v);
}

// ── AUTOGUARDADO: combinaciones ya generadas ────────────────────
// Lee del DOM qué secciones están marcadas ahora mismo (mismo criterio
// que usa generar() para armar la selección a partir de los checkbox).
function leerSeleccionActual() {
    const seleccion = {};
    document.querySelectorAll('.p-check').forEach(cb => {
        if (!seleccion[cb.dataset.curso]) seleccion[cb.dataset.curso] = [];
        if (cb.checked) seleccion[cb.dataset.curso].push(cb.dataset.seccion);
    });
    return seleccion;
}

// Firma determinística de una selección + cantidad de cruces: si esto
// coincide con lo que se usó para generar el caché guardado, el caché
// sigue siendo válido. Si el usuario marcó/desmarcó algo distinto o
// cambió los cruces, ya no coincide y se descarta (para no mostrarle
// un horario que no corresponde a su selección actual).
function firmaSeleccion(seleccion) {
    const cursos = Object.keys(seleccion).sort();
    const partes = cursos.map(c => `${c}:${seleccion[c].slice().sort().join(',')}`);
    return `${partes.join('|')}#cruces=${maxCruces}`;
}

function guardarCombosCache(seleccion) {
    try {
        localStorage.setItem(LS_GEN_COMBOS, JSON.stringify({
            firma: firmaSeleccion(seleccion),
            combos: combosValidos,
        }));
        localStorage.setItem(LS_GEN_COMBOS_IDX, '0');
    } catch (e) {
        // Guardado silencioso: si el horario generado es muy grande y no
        // entra en localStorage, simplemente no se cachea — el usuario
        // solo tendrá que volver a presionar "Generar Horarios" al volver.
        console.warn('No se pudo cachear las combinaciones generadas:', e);
    }
}

// Se llama al iniciar la página: si hay un caché válido para la
// selección actual, restaura combosValidos y dibuja directo, sin que
// el usuario tenga que tocar "Generar Horarios" de nuevo.
function restaurarCombosCache() {
    let cache = null;
    try {
        const guardado = localStorage.getItem(LS_GEN_COMBOS);
        if (guardado) cache = JSON.parse(guardado);
    } catch (e) {
        console.warn('No se pudo restaurar las combinaciones cacheadas:', e);
    }
    if (!cache || !Array.isArray(cache.combos) || !cache.combos.length) return false;

    const seleccionActual = leerSeleccionActual();
    if (cache.firma !== firmaSeleccion(seleccionActual)) return false;

    combosValidos = cache.combos;
    const idxGuardado = parseInt(localStorage.getItem(LS_GEN_COMBOS_IDX), 10);
    currentIndex = (!isNaN(idxGuardado) && idxGuardado >= 0 && idxGuardado < combosValidos.length) ? idxGuardado : 0;

    _setBotonesVisibles(true);
    dibujar(currentIndex);
    return true;
}

// ── SIDEBAR ───────────────────────────────────────────────────
// ── FORMATO DE HORARIO CORTO (para el resumen bajo cada sección) ──
function formatoHoraCorta(hhmm) {
    const h = Math.floor(hhmm / 100);
    const m = hhmm % 100;
    return m === 0 ? `${h}:00` : `${h}:${String(m).padStart(2, '0')}`;
}

function resumenHorarioSeccion(clases) {
    if (!clases || !clases.length) return '';
    return clases
        .map(cl => `${DIAS_ABREV[cl.dia] || cl.dia} ${formatoHoraCorta(cl.ini)}`)
        .join(', ');
}

// ── SIDEBAR ───────────────────────────────────────────────────
// Agrupa las secciones de cada curso por profesor — así el alumno ve
// primero A QUIÉN le va a tocar, no una lista suelta de secciones sin
// contexto (que es como realmente decide con quién llevar el curso).
let _prioridadContador = 0;

function renderSidebar(data) {
    const container = document.getElementById('listaCursos');
    if (!container) return;
    container.innerHTML = '';
    _prioridadContador = 0;

    const prioridadesGuardadas = leerPrioridadesGuardadas();
    const pendientesInit = [];

    Object.entries(data).forEach(([curso, secMap]) => {
        const color = courseColors[curso] || '#06b6d4';
        const secciones = Object.keys(secMap).sort();
        const codigo = (Object.values(secMap)[0] || {}).codigo || '';
        const nombreMostrado = nombreVisible(curso, codigo);

        const block = document.createElement('div');
        block.className = 'course-block';
        block.style.borderLeftColor = color;

        const header = document.createElement('div');
        header.className = 'course-header';
        header.innerHTML = `
      <div class="course-dot" style="background:${color}"></div>
      <div class="course-name" title="${nombreMostrado}">${codigo ? `<span class="curso-codigo">${codigo}</span> ` : ''}${nombreMostrado}</div>
      <button type="button" class="course-eliminar-btn" title="Quitar curso de este horario" aria-label="Quitar curso de este horario">🗑</button>
      <div class="course-chevron">▶</div>`;

        // 🔒 Botón "Eliminar curso": SOLO visible si el gate de admin lo
        // habilitó (ver iniciarGateEliminarCurso / body.eliminar-curso-habilitado
        // en style.css). Se engancha aquí por addEventListener (no en el
        // string de arriba) para poder capturar `block` en el closure sin
        // tener que buscarlo de nuevo en el DOM.
        const btnEliminar = header.querySelector('.course-eliminar-btn');
        btnEliminar.addEventListener('click', (e) => {
            e.stopPropagation(); // no abrir/cerrar el acordeón del curso
            mostrarModalEliminarCurso(curso, nombreMostrado, block);
        });

        const profsDiv = document.createElement('div');
        profsDiv.className = 'course-profs';

        const porDocente = {};
        secciones.forEach(sec => {
            const docente = secMap[sec].docente || 'POR ASIGNAR';
            if (!porDocente[docente]) porDocente[docente] = [];
            porDocente[docente].push(sec);
        });

        Object.entries(porDocente).forEach(([docente, secsDelDocente]) => {
            // IDs únicos por grupo docente — inicializarSelectPersonalizado
            // los necesita para engancharse a los elementos correctos.
            const idx = _prioridadContador++;
            const triggerId = `prioridad-trigger-${idx}`;
            const textoId = `prioridad-texto-${idx}`;
            const listaId = `prioridad-lista-${idx}`;
            const valorId = `prioridad-valor-${idx}`;

            const grupo = document.createElement('div');
            grupo.className = 'docente-group';
            grupo.dataset.curso = curso;
            grupo.dataset.docente = docente;

            const grupoHeader = document.createElement('div');
            grupoHeader.className = 'docente-group-header';
            grupoHeader.innerHTML = `
        <span class="docente-fija-icono" style="display:none">⭐</span>
        <span class="docente-nombre" title="${docente}">${docente}</span>
        <div class="campo-select-custom docente-prioridad-custom">
          <button type="button" class="select-custom-trigger" id="${triggerId}" aria-haspopup="listbox" aria-expanded="false">
            <span id="${textoId}">Sin preferencia</span>
            <span class="select-custom-chevron" aria-hidden="true">▾</span>
          </button>
          <ul class="select-custom-lista" id="${listaId}" role="listbox" hidden></ul>
          <input type="hidden" id="${valorId}" class="docente-prioridad-valor" data-curso="${curso}" data-docente="${docente}">
        </div>`;

            const seccionesDiv = document.createElement('div');
            seccionesDiv.className = 'docente-group-secciones';
            secsDelDocente.forEach(sec => {
                const label = document.createElement('label');
                label.className = 'prof-option';
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'p-check';
                cb.dataset.curso = curso;
                cb.dataset.seccion = sec;
                cb.value = sec;
                cb.checked = true;
                const span = document.createElement('span');
                const resumen = resumenHorarioSeccion(secMap[sec].clases);
                span.innerHTML = `<strong>Sección ${sec}</strong>${resumen ? ' — ' + resumen : ''}`;
                cb.addEventListener('change', guardarSeleccionSecciones);
                label.appendChild(cb);
                label.appendChild(span);
                seccionesDiv.appendChild(label);
            });

            grupo.appendChild(grupoHeader);
            grupo.appendChild(seccionesDiv);
            profsDiv.appendChild(grupo);

            // inicializarSelectPersonalizado usa getElementById, así que
            // recién puede correr cuando este grupo ya esté en el DOM
            // real — se guarda para ejecutarse al final de renderSidebar.
            pendientesInit.push(() => {
                const guardado = (prioridadesGuardadas[curso] && prioridadesGuardadas[curso][docente]) || '';
                const etiquetas = { '': 'Sin preferencia', '1': '1.ª opción', '2': '2.ª opción', '3': '3.ª opción' };

                const instancia = inicializarSelectPersonalizado({
                    triggerId, textoId, listaId, valorId,
                    opciones: [
                        { value: '', label: 'Sin preferencia' },
                        { value: '1', label: '1.ª opción' },
                        { value: '2', label: '2.ª opción' },
                        { value: '3', label: '3.ª opción' },
                    ],
                    alElegir: (valor) => {
                        aplicarEstiloPrioridadGrupo(grupo, valor);
                        guardarPrioridadesProfesor();
                    },
                });
                if (!instancia) return;
                instancia.establecer(guardado, etiquetas[guardado] || etiquetas['']);
                aplicarEstiloPrioridadGrupo(grupo, guardado);
            });
        });

        header.addEventListener('click', () => {
            const open = profsDiv.classList.toggle('open');
            header.querySelector('.course-chevron').classList.toggle('open', open);
        });

        block.appendChild(header);
        block.appendChild(profsDiv);
        container.appendChild(block);
    });

    pendientesInit.forEach(fn => fn());
}

// ── AUTOGUARDADO: prioridad de profesor (fija / 2.ª / 3.ª opción) ──
function leerPrioridadesActuales() {
    const prioridades = {};
    document.querySelectorAll('.docente-prioridad-valor').forEach(inp => {
        if (!inp.value) return;
        const curso = inp.dataset.curso;
        const docente = inp.dataset.docente;
        if (!prioridades[curso]) prioridades[curso] = {};
        prioridades[curso][docente] = inp.value;
    });
    return prioridades;
}

function guardarPrioridadesProfesor() {
    const prioridades = leerPrioridadesActuales();
    try {
        localStorage.setItem(LS_GEN_PRIORIDADES, JSON.stringify(prioridades));
    } catch (e) {
        console.warn('No se pudo guardar las prioridades de profesor:', e);
    }
    guardarEnNube({ prioridades_profesor: prioridades });
}

// Aplica prioridades que llegaron de la nube directo sobre los
// selectores ya dibujados (sin volver a llamar a renderSidebar, que
// también reconstruiría los checkboxes de secciones y pisaría la
// reconciliación que ya se hizo de esos). Mismo espíritu que el
// parche de checkboxes de secciones, arriba.
function aplicarPrioridadesEnSidebar(prioridades) {
    const etiquetas = { '': 'Sin preferencia', '1': '1.ª opción', '2': '2.ª opción', '3': '3.ª opción' };
    document.querySelectorAll('.docente-prioridad-valor').forEach(input => {
        const curso = input.dataset.curso;
        const docente = input.dataset.docente;
        const valor = (prioridades[curso] && prioridades[curso][docente]) || '';
        input.value = valor;

        const textoEl = document.getElementById(input.id.replace('prioridad-valor-', 'prioridad-texto-'));
        if (textoEl) textoEl.textContent = etiquetas[valor] || etiquetas[''];

        const grupo = input.closest('.docente-group');
        if (grupo) aplicarEstiloPrioridadGrupo(grupo, valor);
    });
}

function leerPrioridadesGuardadas() {
    try {
        const guardado = localStorage.getItem(LS_GEN_PRIORIDADES);
        if (guardado) return JSON.parse(guardado);
    } catch (e) {
        console.warn('No se pudo restaurar las prioridades de profesor:', e);
    }
    return {};
}

// Resalta el grupo del profesor marcado como 1.ª opción (fija) con
// borde de acento y ⭐ — igual criterio visual en todo el sidebar.
function aplicarEstiloPrioridadGrupo(grupoEl, valor) {
    grupoEl.classList.toggle('docente-group-fija', valor === '1');
    const estrella = grupoEl.querySelector('.docente-fija-icono');
    if (estrella) estrella.style.display = valor === '1' ? '' : 'none';
}

// Expuesto para que "🧠 Mejor horario" (Asistente de Horario) pueda
// leer las prioridades sin depender del scope interno de este archivo.
window.obtenerPrioridadesProfesor = leerPrioridadesActuales;

// ── CRUCES ────────────────────────────────────────────────────
function setCruces(v) {
    v = Math.min(6, Math.max(0, isNaN(v) ? 0 : Math.round(v)));
    maxCruces = v;
    const input = document.getElementById('crucesInput');
    if (input) input.value = v;
    guardarCruces(v);
}

// ── GENERAR ───────────────────────────────────────────────────
function generar() {
    const seleccion = leerSeleccionActual();

    if (!Object.keys(seleccion).length) {
        showToast('Selecciona al menos una sección', 'error');
        return;
    }

    // Una regeneración manual siempre vuelve a la vista normal de
    // combinaciones, aunque se hubiera estado viendo un favorito.
    viendoFavoritoNombre = null;
    combosValidosAntesDeFavorito = null;
    const btnSalir = document.getElementById('btnSalirFavorito');
    if (btnSalir) btnSalir.style.display = 'none';

    const titleEl = document.getElementById('topbarTitle');
    if (titleEl) titleEl.innerHTML = '<span class="spinner"></span> Generando combinaciones...';

    setTimeout(() => {
        try {
            const opciones = prepararOpciones(seleccion, cargaGlobal);
            combosValidos = generarCombos(opciones, maxCruces);

            if (!combosValidos.length) {
                const titleEl = document.getElementById('topbarTitle');
                const calWrapEl = document.getElementById('calendarWrap');
                if (titleEl) titleEl.innerHTML =
                    '<span style="color:#ef4444">0 combinaciones</span> — sube los cruces o selecciona más secciones';
                if (calWrapEl) calWrapEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">😕</div>
            <div class="empty-text">Sin combinaciones posibles</div>
            <div class="empty-sub">Aumenta los cruces o selecciona más secciones</div>
          </div>`;
                _setBotonesVisibles(false);
                return;
            }

            currentIndex = 0;
            _setBotonesVisibles(true);
            dibujar(0);
            guardarCombosCache(seleccion);
            // Nueva tanda de combinaciones — cualquier recomendación
            // anterior de "Mejor horario" ya no aplica.
            if (typeof window.ocultarBannerMejorHorario === 'function') window.ocultarBannerMejorHorario();

            // En móvil, scroll suave hasta el calendario
            if (window.innerWidth < 900) {
                const calWrap = document.getElementById('calendarWrap');
                if (calWrap) calWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

        } catch (e) {
            const errEl = document.getElementById('topbarTitle');
            if (errEl) errEl.innerHTML =
                '<span style="color:#ef4444">Error al generar combinaciones</span>';
        }
    }, 50);
}

// ── BOTONES VISIBLES ─────────────────────────────────────────
function _setBotonesVisibles(visible) {
    const display = visible ? 'flex' : 'none';
    const displayInline = visible ? 'inline-flex' : 'none';

    const navC = document.getElementById('navControls');
    const favB = document.getElementById('btnFav');
    const expI = document.getElementById('btnExportImg');
    const expX = document.getElementById('btnExportXls');
    const imp = document.getElementById('btnImprimir');
    if (navC) navC.style.display = display;
    if (favB) favB.style.display = displayInline;
    if (expI) expI.style.display = displayInline;
    if (expX) expX.style.display = displayInline;
    if (imp) imp.style.display = displayInline;
}

// Salta a la combinación que se escribió en el input del contador
// (o corrige el valor si está fuera de rango / no es un número).
function irACombinacionInput() {
    const input = document.getElementById('comboInput');
    if (!input || !combosValidos.length) return;

    let n = parseInt(input.value, 10);
    if (isNaN(n)) { input.value = currentIndex + 1; return; }
    n = Math.max(1, Math.min(n, combosValidos.length));
    input.value = n;

    if (n - 1 !== currentIndex) {
        currentIndex = n - 1;
        dibujar(currentIndex);
    }
}

// Imprime el horario actual (o lo guarda como PDF: el diálogo de
// impresión del navegador ya trae esa opción, así que no hace falta
// generar un PDF aparte con una librería). El @media print de
// style.css oculta todo menos el calendario.
function imprimirHorario() {
    if (!combosValidos.length) { showToast('Genera un horario primero', 'error'); return; }
    window.print();
}

// ── DIBUJAR CALENDARIO ────────────────────────────────────────
function dibujar(idx) {
    const combo = combosValidos[idx];
    const topbarTitleEl = document.getElementById('topbarTitle');
    const calWrap = document.getElementById('calendarWrap');
    const navC = document.getElementById('navControls');
    const btnSalir = document.getElementById('btnSalirFavorito');
    const comboInput = document.getElementById('comboInput');
    const comboTotal = document.getElementById('comboTotal');
    const printHeading = document.getElementById('printHeading');

    if (viendoFavoritoNombre) {
        // Vista de un favorito: nada de "1 / 1" (se confunde con
        // "combinación número 1") — el título deja clarísimo que esto
        // NO es una combinación recién generada, y aparece la forma
        // de volver a la lista completa.
        if (topbarTitleEl) topbarTitleEl.innerHTML = `★ Viendo favorito: <span>${viendoFavoritoNombre}</span>`;
        if (navC) navC.style.display = 'none';
        if (btnSalir) btnSalir.style.display = 'inline-flex';
        if (printHeading) printHeading.textContent = `Horario — ★ ${viendoFavoritoNombre}`;
    } else {
        if (comboInput) comboInput.value = idx + 1;
        if (comboTotal) comboTotal.textContent = combosValidos.length;
        // Antes decía "Opción X de Y combinaciones" acá — redundante
        // con el contador "X / Y" de al lado, así que se deja vacío.
        if (topbarTitleEl) topbarTitleEl.textContent = '';
        if (btnSalir) btnSalir.style.display = 'none';
        if (printHeading) printHeading.textContent = `Horario — Opción ${idx + 1} de ${combosValidos.length}`;
    }

    try { localStorage.setItem(LS_GEN_COMBOS_IDX, String(idx)); } catch (e) { /* no crítico */ }

    const HOURS = [];
    for (let h = HOUR_START; h <= HOUR_END; h++) HOURS.push(h);

    let html = `<table class="sched-table">
    <thead><tr>
      <th class="hour-th"></th>
      ${DIAS_LABEL.map(d => `<th>${d}</th>`).join('')}
    </tr></thead><tbody>`;
    HOURS.forEach(h => {
        html += `<tr>
      <td class="hour-td">${h}:00</td>
      ${DIAS.map((_, di) => `<td id="c-${h}-${di}"></td>`).join('')}
    </tr>`;
    });
    html += `</tbody></table>`;
    html += construirBannerReferenciasHorario();
    if (calWrap) calWrap.innerHTML = html;

    // ── Construir bloques por día ─────────────────────────────
    const dayBlocks = {};
    combo.forEach((sec, ci) => {
        const color = courseColors[sec.nombre] || PALETTE[ci % PALETTE.length];
        sec.clases.forEach(cl => {
            const dIdx = DIAS.indexOf(cl.dia);
            if (dIdx === -1) return;
            const startH = Math.floor(cl.ini / 100);
            if (startH < HOUR_START || startH >= HOUR_END) return;
            if (!dayBlocks[dIdx]) dayBlocks[dIdx] = [];
            dayBlocks[dIdx].push({ sec, cl, color });
        });
    });

    // ── Detectar columnas con cruces (solo en móvil) ──────────
    const colsConCruces = new Set();
    if (window.innerWidth < 900) {
        Object.entries(dayBlocks).forEach(([dIdx, blocks]) => {
            outer:
            for (let i = 0; i < blocks.length; i++) {
                for (let j = i + 1; j < blocks.length; j++) {
                    const a = blocks[i].cl;
                    const b = blocks[j].cl;
                    const overlap = Math.max(0,
                        Math.min(a.fin, b.fin) - Math.max(a.ini, b.ini));
                    if (overlap > 0) {
                        colsConCruces.add(parseInt(dIdx));
                        break outer;
                    }
                }
            }
        });

        // Aplicar ancho doble a columnas con cruces
        if (colsConCruces.size > 0) {
            const table = calWrap.querySelector('.sched-table');
            if (table) {
                colsConCruces.forEach(dIdx => {
                    const colIndex = dIdx + 2; // +1 por th hora, +1 por nth-child base 1
                    table.querySelectorAll(
                        `tr td:nth-child(${colIndex}), tr th:nth-child(${colIndex})`
                    ).forEach(cell => {
                        cell.style.minWidth = '160px';
                    });
                });
            }
        }
    }

    // ── Posicionar bloques ────────────────────────────────────
    Object.entries(dayBlocks).forEach(([dIdx, blocks]) => {
        blocks.sort((a, b) => a.cl.ini - b.cl.ini);

        const slots = [];
        blocks.forEach(b => {
            let assigned = -1;
            for (let s = 0; s < slots.length; s++) {
                if (slots[s] <= b.cl.ini) { assigned = s; slots[s] = b.cl.fin; break; }
            }
            if (assigned === -1) { assigned = slots.length; slots.push(b.cl.fin); }
            b.slot = assigned;
        });

        blocks.forEach(b => {
            let maxSlot = 0;
            blocks.forEach(other => {
                const overlap = Math.max(0,
                    Math.min(b.cl.fin, other.cl.fin) - Math.max(b.cl.ini, other.cl.ini));
                if (overlap > 0) maxSlot = Math.max(maxSlot, other.slot);
            });
            b.totalSlots = maxSlot + 1;
        });

        blocks.forEach(({ sec, cl, color, slot, totalSlots }) => {
            const startH = Math.floor(cl.ini / 100);
            const startM = cl.ini % 100;
            const endH = Math.floor(cl.fin / 100);
            const endM = cl.fin % 100;

            const anchor = document.getElementById(`c-${startH}-${dIdx}`);
            if (!anchor) return;

            const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
            const topPx = (startM / 60) * ROW_H;
            const heightPx = Math.max((durationMin / 60) * ROW_H - 2, 18);
            const pct = 100 / totalSlots;
            const leftPct = slot * pct;
            const gap = 2;

            const esTeoria = cl.tipo === 'T' || /TEOR/i.test(cl.tipo);
            const tipoLabel = esTeoria ? 'T' : 'P';
            const tipoClass = esTeoria ? 'teoria-badge' : 'practica-badge';

            const block = document.createElement('div');
            block.className = 'class-block';
            block.style.cssText = `
        top: ${topPx}px; height: ${heightPx}px;
        left: calc(${leftPct}% + ${slot > 0 ? gap : 2}px);
        right: auto;
        width: calc(${pct}% - ${slot > 0 ? gap + 1 : 3}px);
        background: ${color}33;
        border-left-color: ${color};`;
            block.innerHTML = `
        <div class="cb-name">${sec.nombre}</div>
        <div class="cb-bottom">
          <div class="cb-meta">${cl.aula || 'Sec. ' + sec.seccion}</div>
          <div class="cb-badge ${tipoClass}">${tipoLabel}</div>
        </div>`;

            block.addEventListener('mouseenter', e => showTip(e, sec, cl, color));
            block.addEventListener('mousemove', moveTooltip);
            block.addEventListener('mouseleave', hideTip);
            anchor.appendChild(block);
        });
    });

    // Avisa al Asistente de Horario (si está habilitado para este
    // usuario) para que sombree los huecos sobre este mismo
    // calendario y refresque su panel si está abierto. Si no está
    // habilitado, esta función nunca existe y no pasa nada.
    if (typeof window.onDibujarHorarioAsistente === 'function') {
        window.onDibujarHorarioAsistente(combo);
    }
}

// ── NAVEGAR ───────────────────────────────────────────────────
function cambiar(n) {
    currentIndex = (currentIndex + n + combosValidos.length) % combosValidos.length;
    dibujar(currentIndex);
    // Si el usuario navega a mano, la recomendación de "Mejor horario"
    // ya no aplica a lo que está viendo — se oculta el aviso.
    if (typeof window.ocultarBannerMejorHorario === 'function') window.ocultarBannerMejorHorario();
}

// ── TOOLTIP ───────────────────────────────────────────────────
function showTip(e, sec, cl, color) {
    if (!tooltipEl) return;
    const fmt = n => `${Math.floor(n / 100)}:${String(n % 100).padStart(2, '0')}`;
    const tipo = cl.tipo === 'T' ? 'Teoría' : cl.tipo === 'P' ? 'Práctica' : cl.tipo;
    tooltipEl.innerHTML = `
    <strong style="color:${color}">${sec.nombre}</strong>
    <span>👤 ${sec.docente}</span>
    <span>📋 ${tipo} · Sección ${sec.seccion}</span>
    <span>🏫 ${cl.aula || '—'}</span>
    <span>🕐 ${fmt(cl.ini)} – ${fmt(cl.fin)}</span>
    <span>📅 ${cl.dia}</span>`;
    tooltipEl.style.display = 'block';
    moveTooltip(e);
}

function moveTooltip(e) {
    if (!tooltipEl) return;
    tooltipEl.style.left = (e.clientX + 14) + 'px';
    tooltipEl.style.top = (e.clientY - 8) + 'px';
}

function hideTip() {
    if (tooltipEl) tooltipEl.style.display = 'none';
}

// ── FAVORITOS ─────────────────────────────────────────────────
// ── MODAL "GUARDAR FAVORITO" ─────────────────────────────────
function pedirNombreHorario(valorInicial = '') {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-icon">★</div>
        <div class="modal-title">Guardar horario</div>
        <div class="modal-desc">Ponle un nombre para encontrarlo después en tus favoritos</div>
        <input type="text" class="modal-input" id="modalNombreInput" value="${valorInicial}">
        <div class="modal-actions">
          <button class="modal-btn-cancel" id="modalCancelar">Cancelar</button>
          <button class="modal-btn-primary" id="modalAceptar">Guardar</button>
        </div>
      </div>`;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#modalNombreInput');
        requestAnimationFrame(() => { overlay.classList.add('show'); input.focus(); input.select(); });

        function cerrar(valor) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 150);
            resolve(valor);
        }

        overlay.querySelector('#modalAceptar').onclick = () => cerrar(input.value.trim() || null);
        overlay.querySelector('#modalCancelar').onclick = () => cerrar(null);
        overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(null); });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') overlay.querySelector('#modalAceptar').click();
            if (e.key === 'Escape') cerrar(null);
        });
    });
}

async function guardarFavorito() {
    if (!combosValidos.length) return;
    const combo = combosValidos[currentIndex];

    // Asegura tener la lista completa de favoritos ya cargada antes de
    // revisar duplicados — si el panel nunca se abrió en esta sesión,
    // _cargado podría seguir en false.
    if (!Favoritos._cargado) await Favoritos.cargarDesdeNube();

    const existente = Favoritos.existeCombo(combo);
    if (existente) {
        showToast(`Ya tienes este horario guardado como "${existente.nombre}"`, 'info');
        return;
    }

    const nombre = await pedirNombreHorario(`Opción ${currentIndex + 1}`);
    if (!nombre) return;

    const resultado = await Favoritos.agregar(combo, nombre);
    if (resultado.duplicado) {
        // Carrera rara: se volvió duplicado entre el chequeo de arriba
        // y este guardado (ej. se guardó desde otro dispositivo justo
        // en el medio) — agregar() ya lo bloqueó por su cuenta.
        showToast(`Ya tienes este horario guardado como "${resultado.item.nombre}"`, 'info');
    } else if (resultado.sincronizado) {
        showToast('Horario guardado en favoritos ★', 'success');
    } else {
        showToast('Guardado solo en este dispositivo — no se sincronizó con la nube (revisa tu conexión e inténtalo de nuevo)', 'error');
    }

    // Si el panel de favoritos está abierto en este momento, refresca
    // la lista para que aparezca el que se acaba de guardar.
    const panel = document.getElementById('favsPanel');
    if (panel && panel.style.display !== 'none') renderFavoritos();
}

async function toggleFavoritos() {
    const panel = document.getElementById('favsPanel');
    const overlay = document.getElementById('favsOverlay');
    if (!panel || !overlay) return;
    const visible = panel.style.display !== 'none';
    if (visible) {
        panel.style.display = 'none';
        overlay.style.display = 'none';
        return;
    }

    panel.style.display = 'flex';
    overlay.style.display = 'block';

    // Red de seguridad: si la carga inicial (disparada en inicializar())
    // todavía no terminó —por ejemplo, red lenta— se espera acá antes
    // de dibujar, para no mostrar "no tienes favoritos" en falso.
    if (!Favoritos._cargado) {
        const lista = document.getElementById('favsList');
        if (lista) lista.innerHTML = '<div class="favs-empty">Cargando tus favoritos…</div>';
        await Favoritos.cargarDesdeNube();
    }
    renderFavoritos();
}

function renderFavoritos() {
    const favs = Favoritos.obtener();
    const lista = document.getElementById('favsList');
    if (!lista) return;

    if (!favs.length) {
        lista.innerHTML = '<div class="favs-empty">No tienes horarios guardados aún.</div>';
        return;
    }

    lista.innerHTML = favs.map((fav, i) => `<div class="fav-item">
      <div class="fav-item-header">
        <div class="fav-name">★ ${fav.nombre}</div>
        <div class="fav-actions">
          <button class="fav-btn ver" onclick="verFavorito(${i})">Ver</button>
          <button class="fav-btn del" onclick="eliminarFavorito(${i})">Eliminar</button>
        </div>
      </div>
    </div>`).join('');
}

function verFavorito(idx) {
    try {
        const favs = Favoritos.obtener();
        const fav = favs[idx];
        if (!fav || !fav.combo) {
            console.warn('[Favoritos-debug] verFavorito: no se encontró el favorito en el índice', idx, 'favs =', favs);
            showToast('No se pudo abrir ese horario', 'error');
            return;
        }

        // Guarda la lista de combinaciones que había antes (solo la
        // primera vez — si ya se estaba viendo otro favorito, no la
        // vuelve a pisar), para poder restaurarla con "Salir".
        if (!viendoFavoritoNombre) combosValidosAntesDeFavorito = combosValidos;

        viendoFavoritoNombre = fav.nombre;
        combosValidos = [fav.combo];
        currentIndex = 0;
        toggleFavoritos();
        _setBotonesVisibles(true);
        dibujar(0);
        if (window.innerWidth < 900) {
            const calWrap = document.getElementById('calendarWrap');
            if (calWrap) calWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (e) {
        console.error('[Favoritos-debug] Error al mostrar el favorito:', e);
        showToast('Ocurrió un error al abrir ese horario', 'error');
    }
}

// Vuelve de la vista de un favorito a la lista completa de
// combinaciones que había antes de entrar a verlo.
function salirDeFavorito() {
    if (!combosValidosAntesDeFavorito) { viendoFavoritoNombre = null; return; }
    combosValidos = combosValidosAntesDeFavorito;
    combosValidosAntesDeFavorito = null;
    viendoFavoritoNombre = null;
    currentIndex = Math.max(0, Math.min(currentIndex, combosValidos.length - 1));
    dibujar(currentIndex);
}

async function eliminarFavorito(idx) {
    await Favoritos.eliminar(idx);
    renderFavoritos();
    showToast('Favorito eliminado', 'error');
}

// ── EXPORTAR IMAGEN ───────────────────────────────────────────
async function exportarImagen() {
    const tabla = document.querySelector('.sched-table');
    if (!tabla) { showToast('Genera un horario primero', 'error'); return; }
    showToast('Generando imagen...', 'info');
    try {
        const canvas = await html2canvas(tabla, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            scrollX: 0, scrollY: 0,
            width: tabla.scrollWidth,
            height: tabla.scrollHeight
        });
        const link = document.createElement('a');
        link.download = `horario_opcion_${currentIndex + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Imagen descargada ✓', 'success');
    } catch (e) {
        showToast('Error al exportar', 'error');
    }
}

// ── EXPORTAR EXCEL ────────────────────────────────────────────
async function exportarExcel() {
    if (!combosValidos.length) {
        showToast('Genera un horario primero', 'error');
        return;
    }

    const combo = combosValidos[currentIndex];
    const DIAS_XLS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const DIAS_LABEL_XLS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fmt = n => `${Math.floor(n / 100)}:${String(n % 100).padStart(2, '0')}`;

    // Paleta usada en el Excel (mismo celeste de acento que el resto de la app)
    const ACCENT = '06B6D4';
    const AZUL_TEORIA = '2563EB';
    const ROJO_PRACTICA = 'DC2626';
    const bordeFino = { style: 'thin', color: { rgb: ACCENT } };
    const bordeCelda = { top: bordeFino, bottom: bordeFino, left: bordeFino, right: bordeFino };

    // NOTA TÉCNICA: se intentó colorear solo la letra T/P dentro de la misma
    // celda usando "rich text" (varios colores en un mismo texto), pero se
    // comprobó (generando y revisando el archivo real) que la librería no
    // conserva ese formato al escribir. Tampoco se usa emoji de color, para
    // que se vea prolijo. En su lugar, T/P queda en texto plano entre
    // paréntesis junto a la sección.

    // ═══════════════════════ HOJA "CALENDARIO" ═══════════════════
    const horasUnicas = new Set();
    combo.forEach(sec => sec.clases.forEach(cl => {
        for (let h = Math.floor(cl.ini / 100); h < Math.floor(cl.fin / 100); h++) {
            horasUnicas.add(h);
        }
    }));
    const horas = [...horasUnicas].sort((a, b) => a - b);

    const calendarioAOA = [['Hora', ...DIAS_LABEL_XLS]];

    horas.forEach((h, hi) => {
        const fila = [`${h}:00`];
        DIAS_XLS.forEach(dia => {
            const bloques = [];
            combo.forEach(sec => sec.clases.forEach(cl => {
                if (cl.dia !== dia) return;
                const startH = Math.floor(cl.ini / 100);
                const endH = Math.floor(cl.fin / 100);
                if (h >= startH && h < endH) bloques.push({ sec, cl });
            }));

            if (bloques.length) {
                fila.push(bloques.map(b => {
                    const esTeoria = b.cl.tipo === 'T' || /TEOR/i.test(b.cl.tipo);
                    const tipoLetra = esTeoria ? 'T' : 'P';
                    return `${b.sec.nombre}\nSección ${b.sec.seccion} (${tipoLetra})`;
                }).join('\n\n'));
            } else {
                fila.push('');
            }
        });
        calendarioAOA.push(fila);
    });

    const wsCalendario = XLSX.utils.aoa_to_sheet(calendarioAOA);
    const rangoCal = XLSX.utils.decode_range(wsCalendario['!ref']);

    for (let r = rangoCal.s.r; r <= rangoCal.e.r; r++) {
        for (let c = rangoCal.s.c; c <= rangoCal.e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!wsCalendario[addr]) wsCalendario[addr] = { t: 's', v: '' };
            const celda = wsCalendario[addr];
            const esHeader = r === 0;
            const esColHora = c === 0;

            celda.s = {
                alignment: {
                    horizontal: (esHeader || esColHora) ? 'center' : 'left',
                    vertical: 'center',
                    wrapText: true
                },
                border: bordeCelda,
                font: esHeader
                    ? { bold: true, color: { rgb: 'FFFFFF' } }
                    : (esColHora ? { bold: true } : {}),
                fill: esHeader ? { fgColor: { rgb: ACCENT } } : undefined
            };
        }
    }

    // Ancho automático por columna: se usa la línea más larga de esa columna
    // (no la palabra ni el bloque completo) para que el nombre del curso y la
    // sección se vean completos sin depender de que el salto de línea manual
    // se renderice igual en todos los programas.
    function anchoPorLineaMasLarga(aoa, colIndex, minWch, maxWch) {
        let max = minWch;
        aoa.forEach(fila => {
            const valor = fila[colIndex];
            if (!valor) return;
            String(valor).split('\n').forEach(linea => {
                max = Math.max(max, Math.min(linea.length + 2, maxWch));
            });
        });
        return max;
    }

    wsCalendario['!cols'] = [
        { wch: 9 },
        ...DIAS_XLS.map((_, i) => ({ wch: anchoPorLineaMasLarga(calendarioAOA, i + 1, 22, 55) }))
    ];

    // Alto de fila variable: según cuántas líneas tenga la celda más "cargada"
    // de esa fila (puede haber más de un curso a la misma hora).
    const alturasCalendario = calendarioAOA.slice(1).map(fila => {
        let maxLineas = 1;
        fila.slice(1).forEach(valor => {
            if (!valor) return;
            maxLineas = Math.max(maxLineas, String(valor).split('\n').length);
        });
        return { hpx: Math.max(32, maxLineas * 15 + 14) };
    });
    wsCalendario['!rows'] = [{ hpx: 26 }, ...alturasCalendario];

    // ═══════════════════════ HOJA "DETALLE" ═══════════════════════
    // Código va primero, según lo pedido
    const detalleData = [
        ['Código', 'Curso', 'Sección', 'Docente', 'Tipo', 'Día', 'Hora inicio', 'Hora fin', 'Aula']
    ];
    const tipoPorFila = []; // 'T' | 'P' | null(separador), alineado 1 a 1 con las filas de datos

    const comboOrdenado = [...combo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    let cursoAnterior = null;
    comboOrdenado.forEach(sec => {
        if (cursoAnterior !== null && cursoAnterior !== sec.nombre) {
            detalleData.push(['', '', '', '', '', '', '', '', '']);
            tipoPorFila.push(null);
        }
        cursoAnterior = sec.nombre;
        [...sec.clases].sort((a, b) => DIAS_XLS.indexOf(a.dia) - DIAS_XLS.indexOf(b.dia)).forEach(cl => {
            const esTeoria = cl.tipo === 'T' || /TEOR/i.test(cl.tipo);
            detalleData.push([
                sec.codigo || '—',
                sec.nombre,
                sec.seccion,
                sec.docente,
                esTeoria ? 'Teoría' : 'Práctica',
                DIAS_LABEL_XLS[DIAS_XLS.indexOf(cl.dia)] || cl.dia,
                fmt(cl.ini),
                fmt(cl.fin),
                cl.aula || '—'
            ]);
            tipoPorFila.push(esTeoria ? 'T' : 'P');
        });
    });

    const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
    const rangoDet = XLSX.utils.decode_range(wsDetalle['!ref']);

    // Columnas centradas: Código(0), Sección(2), Tipo(4), Día(5), Hora inicio(6), Hora fin(7), Aula(8)
    // Curso(1) y Docente(3) quedan a la izquierda por ser texto más largo
    const colsCentradas = new Set([0, 2, 4, 5, 6, 7, 8]);
    const COL_CURSO = 1;

    for (let r = rangoDet.s.r; r <= rangoDet.e.r; r++) {
        for (let c = rangoDet.s.c; c <= rangoDet.e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!wsDetalle[addr]) wsDetalle[addr] = { t: 's', v: '' };
            const celda = wsDetalle[addr];
            const esHeader = r === 0;
            const tipoFila = tipoPorFila[r - 1];

            let font = {};
            if (esHeader) {
                font = { bold: true, color: { rgb: 'FFFFFF' } };
            } else if (c === 4 && tipoFila) {
                // Columna "Tipo": todo el texto de la celda coloreado (aquí sí es la celda completa)
                font = { bold: true, color: { rgb: tipoFila === 'T' ? AZUL_TEORIA : ROJO_PRACTICA } };
            }

            celda.s = {
                alignment: {
                    horizontal: esHeader ? 'center' : (colsCentradas.has(c) ? 'center' : 'left'),
                    vertical: 'center',
                    wrapText: c === COL_CURSO
                },
                border: bordeCelda,
                font,
                fill: esHeader ? { fgColor: { rgb: ACCENT } } : undefined
            };
        }
    }

    const anchoCurso = Math.min(Math.max(20, ...detalleData.map(f => (f[1] || '').length + 2)), 60);
    const anchoDocente = Math.min(Math.max(18, ...detalleData.map(f => (f[3] || '').length + 2)), 40);

    wsDetalle['!cols'] = [
        { wch: 10 },          // Código
        { wch: anchoCurso },  // Curso (ancho automático)
        { wch: 9 },           // Sección
        { wch: anchoDocente },// Docente (ancho automático)
        { wch: 10 },          // Tipo
        { wch: 12 },          // Día
        { wch: 11 },          // Hora inicio
        { wch: 11 },          // Hora fin
        { wch: 12 }           // Aula
    ];
    wsDetalle['!rows'] = [{ hpx: 22 }, ...detalleData.slice(1).map(() => ({ hpx: 24 }))];

    // ═══════════════════ CONFIGURACIÓN DE IMPRESIÓN ═══════════════════
    // xlsx-js-style escribe márgenes (!margins) pero no orientación ni
    // ajuste de página (!pageSetup) — esa parte se inyecta más abajo,
    // directamente en el XML interno del archivo (ver inyectarConfigImpresion).
    const CM_A_IN = cm => cm / 2.54; // el XLSX guarda los márgenes en pulgadas
    const margenesImpresion = {
        left: CM_A_IN(0.5), right: CM_A_IN(0.5),
        top: CM_A_IN(0.5), bottom: CM_A_IN(0.5),
        header: 0, footer: 0
    };
    wsCalendario['!margins'] = margenesImpresion;
    wsDetalle['!margins'] = margenesImpresion;

    // ═══════════════════════ LIBRO FINAL ═══════════════════════════
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsCalendario, 'Calendario');
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    await descargarConConfigImpresion(wb, `horario_opcion_${currentIndex + 1}.xlsx`);
    showToast('Excel descargado ✓', 'success');
}

// Genera el archivo, le inyecta orientación horizontal + "ajustar a 1 página
// de ancho x 1 de alto" (que la librería de estilos no soporta escribir) y
// recién ahí lo descarga. Si algo falla (ej. no cargó JSZip), se descarga
// igual pero sin esa configuración, en vez de romper la exportación entera.
async function descargarConConfigImpresion(wb, nombreArchivo) {
    try {
        if (typeof JSZip === 'undefined') throw new Error('JSZip no disponible');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const zip = await JSZip.loadAsync(wbout);
        const hojasXml = Object.keys(zip.files).filter(f => /^xl\/worksheets\/sheet\d+\.xml$/.test(f));

        for (const ruta of hojasXml) {
            const contenido = await zip.file(ruta).async('string');
            zip.file(ruta, inyectarConfigImpresion(contenido));
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = nombreArchivo;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.warn('No se pudo aplicar la config. de impresión, se descarga sin ella:', e);
        XLSX.writeFile(wb, nombreArchivo);
    }
}

// Agrega <sheetPr fitToPage>, <printOptions centrado> y <pageSetup orientation="landscape" .../>
// al XML de una hoja. Verificado con openpyxl que Excel lo lee correctamente
// como "Horizontal" + "Ajustar a: 1 página" + "Centrar en la página: Horizontal y Verticalmente".
function inyectarConfigImpresion(xml) {
    xml = xml.replace(
        /(<worksheet[^>]*>)/,
        '$1<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'
    );
    // El orden importa (lo exige el schema de OOXML): printOptions va ANTES
    // que pageMargins, y pageSetup va DESPUÉS de pageMargins.
    xml = xml.replace(
        /(<pageMargins[^/]*\/>)/,
        '<printOptions horizontalCentered="1" verticalCentered="1"/>$1<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="1" paperSize="9"/>'
    );
    return xml;
}

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    setTimeout(() => { t.className = 'toast'; }, 3000);
}
/* ============================================================
   BANNER "DEJAR MI REFERENCIA" (debajo del calendario armado)
   Se arma DENTRO del mismo innerHTML de #calendarWrap (después de
   la tabla), no como un contenedor aparte en .main — esta pantalla
   es un app-shell de altura fija (.gen-layout: 100vh, overflow
   hidden) donde SOLO #calendarWrap tiene scroll propio. Un hermano
   fuera de #calendarWrap le roba alto al calendario en vez de
   aparecer al hacer scroll.

   Se arma a partir de las SECCIONES MARCADAS en la barra lateral
   (.p-check:checked + seccionesData), no del combo que se está
   viendo — a propósito: el combo cambia con cada una de las N
   combinaciones, y si el alumno se queda con la primera que le
   gustó, nunca navega las demás. Basarlo en la selección real
   evita que profesores que sí consideró (pero no terminaron en el
   combo elegido) se queden fuera de la invitación.

   A diferencia de Intranotas, acá sí hay profesor real por sección,
   así que el selector es por profesor directamente. Estos cursos
   aún no se cursan — por eso el mensaje apunta a "lo que sabes"
   (propia experiencia previa u oído de otros), no a "cómo te fue"
   como en Intranotas.
   ============================================================ */
let profesoresComboActual = [];

function construirBannerReferenciasHorario() {
    // Profesor único por curso — si un mismo profesor dicta varias
    // secciones marcadas del mismo curso (teoría + práctica), aparece
    // una sola vez en la lista.
    const vistos = new Set();
    profesoresComboActual = [];
    document.querySelectorAll('.p-check:checked').forEach(cb => {
        const curso = cb.dataset.curso;
        const seccion = cb.dataset.seccion;
        const info = seccionesData[curso] && seccionesData[curso][seccion];
        if (!info || !info.docente) return;
        const clave = `${info.docente}|${curso}`;
        if (vistos.has(clave)) return;
        vistos.add(clave);
        profesoresComboActual.push({ docente: info.docente, curso });
    });

    if (!profesoresComboActual.length) return '';

    return `
        <div style="background:#fff; border-radius:14px; padding:20px; text-align:center; margin:24px auto 8px; max-width:420px; box-shadow:0 8px 20px rgba(0,0,0,0.06);">
            <p style="font-size:0.95rem; font-weight:700; color:var(--ink); margin-bottom:6px;">¿Qué sabes de tus profesores de este ciclo?</p>
            <p style="font-size:0.8rem; color:var(--ink-soft); margin:0 auto 14px; line-height:1.5;">
                Por experiencia propia o por lo que escuchaste de ellos — tu aporte ayuda a que otros elijan con más criterio.
            </p>
            <button type="button" class="btn-primary" id="btnReferenciaHorario"
                style="display:inline-flex; align-items:center; gap:6px;"
                onclick="toggleSelectorReferenciaHorario()">
                <span>Dejar mi referencia</span>
                <span id="flechaReferenciaHorario" aria-hidden="true">▾</span>
            </button>
            <div id="selectorReferenciaHorarioLista"
                style="margin-top:14px; display:none; flex-direction:column; gap:6px; text-align:left;"></div>
        </div>
    `;
}

function toggleSelectorReferenciaHorario() {
    const lista = document.getElementById('selectorReferenciaHorarioLista');
    const flecha = document.getElementById('flechaReferenciaHorario');
    if (!lista) return;

    const abierto = lista.style.display !== 'none';
    if (abierto) {
        lista.style.display = 'none';
        if (flecha) flecha.textContent = '▾';
        return;
    }

    const COLOR_MORADO = 'rgba(102, 0, 204, 0.05)';
    const COLOR_AZUL = 'rgba(60, 124, 248, 0.08)';

    lista.innerHTML = `
        <p style="font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:2px; font-family:'Poppins', sans-serif;">¿De qué profesor quieres dejar tu referencia?</p>
        ${profesoresComboActual.map((p, i) => {
        const color = i % 2 === 0 ? COLOR_MORADO : COLOR_AZUL;
        return `
            <a href="../opiniones.html?buscar=${encodeURIComponent(p.docente)}"
                style="display:block; padding:10px 14px; background:${color}; border-radius:8px; font-family:'Poppins', sans-serif; text-decoration:none; color:var(--ink);">
                <div style="font-size:0.85rem; font-weight:600;">${p.docente}</div>
                <div style="font-size:0.78rem; font-weight:400; opacity:0.65; margin-top:2px;">${p.curso}</div>
            </a>`;
    }).join('')}
    `;
    lista.style.display = 'flex';
    if (flecha) flecha.textContent = '▴';

    // La lista queda debajo del pliegue dentro de #calendarWrap (que
    // tiene su propio scroll interno) — sin esto, el usuario no ve nada
    // al primer clic y tiene que buscar la barra deslizante a ciegas.
    setTimeout(() => lista.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 30);
}