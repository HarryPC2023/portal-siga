/* ============================================================
   NOMBRES DE CARRERAS Y CICLOS
   ============================================================ */
const NOMBRES_CARRERAS = {
    sistemas: 'Ingeniería de Sistemas',
    industrial: 'Ingeniería Industrial',
    software: 'Ingeniería de Software'
};

const NOMBRES_CICLOS = {
    1: 'PRIMER CICLO', 2: 'SEGUNDO CICLO', 3: 'TERCER CICLO',
    4: 'CUARTO CICLO', 5: 'QUINTO CICLO', 6: 'SEXTO CICLO',
    7: 'SÉPTIMO CICLO', 8: 'OCTAVO CICLO', 9: 'NOVENO CICLO',
    10: 'DÉCIMO CICLO'
};

/* Ciclos verificados — todos los ciclos de todas las carreras (sin badge) */
const CICLOS_VERIFICADOS = {
    sistemas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    industrial: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    software: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};

/* ============================================================
   LAYOUT DE COMPONENTES POR TIPO DE FÓRMULA
   ============================================================ */
const COMPONENT_LAYOUT = {
    'ESTANDAR_1_1_1': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'COMPUTACION_1_1_2': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'ALGEBRA': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'ALGORITMIA': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'REDACCION_BASE': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1', 'Monografia2'], grid: 'grid-2-cols' }
    ],
    'REALIDAD_NACIONAL': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1', 'Monografia2'], grid: 'grid-2-cols' }
    ],
    'REALIDAD_NACIONAL_4PC': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' }
    ],
    'SOLO_PC': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' }
    ],
    'SOLO_PC_6': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['PC5', 'PC6'], grid: 'grid-2-cols' }
    ],
    'SOLO_EXAMENES': [
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'ETICA': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1'], grid: 'grid-2-cols' }
    ],
    'METODOLOGIA_INV': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1'], grid: 'grid-2-cols' }
    ],
    'PSICOLOGIA': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'TCS': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1', 'Monografia2'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'ARQ_EMPRESARIAL': [
        { comps: ['PC1', 'PC2', 'PC3'], grid: 'grid-4-cols' },
        { comps: ['Monografia1'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'TCS_APLICADA': [
        { comps: ['PC1', 'PC2'], grid: 'grid-4-cols' },
        { comps: ['Monografia1', 'Monografia2'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'BIOLOGICO': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5'], grid: 'grid-5-cols' },
        { comps: ['Monografia1'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'SISTEMAS_BLANDOS': [
        { comps: ['PC1'], grid: 'grid-2-cols' },
        { comps: ['Monografia1', 'Monografia2'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'MODELADO_DATOS': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'INGENIERIA_DATOS': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'TEORIA_ORGANIZACIONAL': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Monografia1', 'Monografia2'], grid: 'grid-2-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'QUIMICA': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4'], grid: 'grid-4-cols' },
        { comps: ['Lab1', 'Lab2', 'Lab3', 'Lab4'], grid: 'grid-4-cols' },
        { comps: ['Lab5', 'Lab6', 'Lab7', 'Lab8'], grid: 'grid-4-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'FISICA_I': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5'], grid: 'grid-5-cols' },
        { comps: ['Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5'], grid: 'grid-5-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ],
    'FISICA_II': [
        { comps: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5'], grid: 'grid-5-cols' },
        { comps: ['Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5'], grid: 'grid-5-cols' },
        { comps: ['EP', 'EF', 'ES'], grid: 'grid-4-cols' }
    ]
};

/* ============================================================
   ARQUETIPOS DE FÓRMULA (compartidos entre simuladores)
   ============================================================ */
const FORMULAS_DOBLE_EF = ['COMPUTACION_1_1_2', 'ALGORITMIA', 'FISICA_I', 'QUIMICA',
    'MODELADO_DATOS', 'INGENIERIA_DATOS', 'TEORIA_ORGANIZACIONAL', 'TCS', 'ARQ_EMPRESARIAL'];
const FORMULAS_SOLO_PC = ['REDACCION_BASE', 'REALIDAD_NACIONAL', 'ETICA', 'METODOLOGIA_INV',
    'REALIDAD_NACIONAL_4PC', 'SOLO_PC', 'SOLO_PC_6'];
const FORMULAS_SOLO_EXAMENES = ['SOLO_EXAMENES'];

/* ============================================================
   VARIABLES GLOBALES DE ESTADO
   ============================================================ */
let mallaSeleccionada = null; // '2018' | '2026'
let carreraSeleccionada = null;
let cursosSeleccionados = [];
let periodoSeleccionado = null;
let selectorPeriodoInstancia = null; // instancia del select-custom de Pantalla 3 (se crea una sola vez)

/* ============================================================
   NAVEGACIÓN ENTRE PANTALLAS
   ============================================================ */
function irAPantalla(num) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    const pantalla = document.getElementById('pantalla-' + num);
    if (pantalla) pantalla.classList.add('activa');
    window.scrollTo(0, 0);
    const botones = document.getElementById('botones-flotantes');
    if (botones) botones.style.display = num === 4 ? 'flex' : 'none';
}

/* ============================================================
   SELECCIÓN DE MALLA (PANTALLA 0)
   Se pregunta una sola vez, igual que la carrera: se guarda en
   localStorage (LS_KEY_ULTIMA_MALLA) y de ahí en adelante el flujo
   entra directo a Pantalla 3 con esa malla fija. Solo se vuelve a
   preguntar si el alumno toca "Cambiar malla".
   ============================================================ */
const LS_KEY_ULTIMA_MALLA = 'intranotas_ultima_malla';

function seleccionarMalla(malla) {
    mallaSeleccionada = malla;
    localStorage.setItem(LS_KEY_ULTIMA_MALLA, malla);

    // Cambiar de malla implica que la carrera/periodo/cursos de la
    // malla anterior ya no aplican en pantalla — cada malla guarda sus
    // propios periodos por separado, así que esto no borra nada.
    carreraSeleccionada = null;
    periodoSeleccionado = null;
    cursosSeleccionados = [];

    actualizarResumenMalla();
    filtrarCarrerasPorMalla();
    actualizarResumenCarrera();
    mostrarSelectorCarrera(true);
    mostrarBloquePeriodoCursos(false);

    irAPantalla(3);
}

/* Botón "📚 Cambiar malla" (Pantalla 3) — pensado sobre todo para
   alumnos de 5°-6° ciclo, a quienes la UNI les da la opción de elegir
   con qué malla llevar sus cursos. Vuelve a Pantalla 0 sin tocar
   ningún dato guardado. */
function cambiarMalla() {
    document.querySelectorAll('.opcion-malla').forEach(btn => {
        btn.classList.toggle('actual', btn.dataset.malla === mallaSeleccionada);
    });
    irAPantalla(0);
}

/* Devuelve true si la malla activa ya tiene catálogo de cursos
   cargado para esa carrera (hoy: solo Sistemas tiene malla 2026). */
function estaDisponibleCarrera(carrera) {
    return !!(CURSOS_POR_CICLO[mallaSeleccionada] && CURSOS_POR_CICLO[mallaSeleccionada][carrera]);
}

/* Recorre las tarjetas de carrera y oculta por completo las que no
   tengan catálogo de cursos cargado para la malla activa (ver
   estaDisponibleCarrera arriba). Antes esto solo ocultaba bajo malla
   2018 y mostraba "Próximamente" bajo malla 2026 — pero Software
   recién se implementó en 2023 y no se espera que cambie de malla en
   el corto plazo, así que ya no tiene sentido mostrarlo como "por
   llegar": se oculta igual que cualquier combinación sin datos. */
function filtrarCarrerasPorMalla() {
    document.querySelectorAll('.btn-carrera').forEach(btn => {
        const carrera = btn.dataset.carrera;
        const disponible = estaDisponibleCarrera(carrera);
        btn.style.display = disponible ? '' : 'none';
    });
}

/* ============================================================
   SELECCIÓN DE CARRERA (PANTALLA 2)
   ============================================================ */
function seleccionarCarrera(carrera) {
    if (!estaDisponibleCarrera(carrera)) return; // seguro extra, aunque el botón ya está deshabilitado

    carreraSeleccionada = carrera;
    periodoSeleccionado = null;
    cursosSeleccionados = [];

    actualizarResumenCarrera();
    mostrarSelectorCarrera(false);
    mostrarBloquePeriodoCursos(true);

    setTimeout(() => {
        generarAcordeones();
        generarOpcionesPeriodo();
        marcarCursosSeleccionadosEnUI();
        inicializarModoTransicion();
        renderCursosOtraMallaResumen();
    }, 50);
}

/* ============================================================
   BLOQUE DE CARRERA COLAPSABLE (PANTALLA 3)
   Reemplaza a la vieja pantalla-2 — la carrera casi nunca cambia,
   así que vive plegada arriba en vez de ocupar una pantalla propia.
   ============================================================ */
function actualizarResumenCarrera() {
    const texto = document.getElementById('carrera-resumen-texto');
    if (texto) texto.textContent = carreraSeleccionada ? NOMBRES_CARRERAS[carreraSeleccionada] : 'Selecciona tu carrera';
}

/* Texto pequeño arriba de "INTRANOTAS" en Pantalla 3, ej. "Malla 2026"
   — solo contexto, no es clickeable (para eso está el botón "Cambiar
   malla"). Antes incluía el rango de ciclos ("· 1° a 4° ciclo"); se
   quitó a pedido de Harry para que quede más limpio. */
function actualizarResumenMalla() {
    const texto = document.getElementById('malla-resumen-texto');
    if (!texto) return;
    texto.textContent = mallaSeleccionada ? `Malla ${mallaSeleccionada}` : '';
}

function mostrarSelectorCarrera(expandido) {
    const grid = document.getElementById('grid-carreras-colapsable');
    const flecha = document.getElementById('carrera-resumen-flecha');
    if (grid) {
        grid.style.maxHeight = expandido ? '2000px' : '0px';
        grid.style.opacity = expandido ? '1' : '0';
        grid.style.marginTop = expandido ? '12px' : '0px';
    }
    if (flecha) flecha.textContent = expandido ? '▴' : '▾';
}

function toggleSelectorCarrera() {
    const grid = document.getElementById('grid-carreras-colapsable');
    if (!grid) return;
    const expandido = grid.style.maxHeight !== '0px';
    mostrarSelectorCarrera(!expandido);
}

/* Igual que mostrarSelectorCarrera(), pero para el bloque de periodo
   académico + cursos — misma animación de max-height/opacity, para que
   ambos bloques se sientan como el mismo acordeón y no como una
   pantalla que se corta y otra que aparece de golpe. */
function mostrarBloquePeriodoCursos(expandido) {
    const bloque = document.getElementById('bloque-periodo-cursos');
    if (!bloque) return;
    bloque.style.maxHeight = expandido ? '4000px' : '0px';
    bloque.style.opacity = expandido ? '1' : '0';
}

/* Botón "← Cambiar carrera": despliega el selector arriba y sube el
   scroll — sin borrar ni ocultar nada de lo que ya tenías abajo
   (periodo, cursos marcados). Solo se reemplaza todo si de verdad
   eliges una carrera nueva en seleccionarCarrera(); si vuelves a
   tocar la misma carrera o cierras el selector, no perdiste nada. */
function cambiarCarrera() {
    mostrarSelectorCarrera(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Desmarca todas las casillas de curso en la UI — usado al empezar un
   nuevo periodo o cambiar a un periodo guardado, para que no queden
   casillas de una selección anterior marcadas por error. */
function desmarcarTodosLosCursos() {
    document.querySelectorAll('.curso-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.curso-item.seleccionado').forEach(item => item.classList.remove('seleccionado'));
    actualizarContadores();
}

/* ============================================================
   GENERACIÓN DE ACORDEONES (PANTALLA 3)
   ============================================================ */
function generarAcordeones() {
    const contenedor = document.getElementById('contenedor-acordeones');
    const cursosCarrera = CURSOS_POR_CICLO[mallaSeleccionada][carreraSeleccionada];
    let html = '';

    for (let ciclo = 1; ciclo <= 10; ciclo++) {
        const cursos = cursosCarrera[ciclo] || [];
        const nombreCiclo = NOMBRES_CICLOS[ciclo];
        const esVerificado = (CICLOS_VERIFICADOS[carreraSeleccionada] || []).includes(ciclo);
        const badgeHTML = !esVerificado
            ? `<span class="badge-criterio-oficial">CRITERIO DE EVALUACIÓN OFICIAL</span>`
            : '';

        html += `
            <div class="acordeon" id="acordeon-ciclo-${ciclo}">
                <div class="acordeon-header" onclick="toggleAcordeon(${ciclo})">
                    <span class="acordeon-icono">▶</span>
                    <span class="acordeon-titulo">${nombreCiclo}${badgeHTML}</span>
                    <span class="acordeon-contador" id="contador-ciclo-${ciclo}">0</span>
                </div>
                <div class="acordeon-contenido">
                    <div class="acordeon-lista">
                        ${generarListaCursos(cursos, ciclo)}
                    </div>
                </div>
            </div>
        `;
    }

    // Sección de cursos electivos
    const electivos = cursosCarrera['electivos'] || [];
    if (electivos.length > 0) {
        html += `
            <div class="acordeon acordeon-electivos" id="acordeon-electivos">
                <div class="acordeon-header acordeon-header-electivos" onclick="toggleAcordeonElectivos()">
                    <span class="acordeon-icono">▶</span>
                    <span class="acordeon-titulo">CURSOS ELECTIVOS</span>
                    <span class="acordeon-contador" id="contador-electivos">0</span>
                </div>
                <div class="acordeon-contenido">
                    <div class="acordeon-lista">
                        ${generarListaCursos(electivos, 'electivos')}
                    </div>
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

function generarListaCursos(cursos, ciclo) {
    if (!cursos || cursos.length === 0) {
        return `<p style="font-size:0.8rem; color:#9ca3af; padding: 8px 0;">No hay cursos registrados para este ciclo.</p>`;
    }
    return [...cursos].sort((a, b) => a.name.localeCompare(b.name)).map(curso => `
        <label class="curso-item" id="item-${curso.id}" onclick="event.stopPropagation()">
            <input
                type="checkbox"
                class="curso-checkbox"
                data-curso-id="${curso.id}"
                data-ciclo="${ciclo}"
                onchange="toggleCurso('${curso.id}', '${ciclo}')"
            >
            <div class="curso-info">
                <div class="curso-nombre">${curso.name}</div>
                <div class="curso-detalles">
                    <span class="curso-codigo">${curso.code}</span>
                    <span class="curso-creditos">${curso.credits} créditos</span>
                </div>
            </div>
        </label>
    `).join('');
}

function toggleAcordeon(ciclo) {
    const acordeon = document.getElementById(`acordeon-ciclo-${ciclo}`);
    const estabAbierto = acordeon.classList.contains('abierto');
    document.querySelectorAll('.acordeon').forEach(a => a.classList.remove('abierto'));
    if (!estabAbierto) acordeon.classList.add('abierto');
}

function toggleAcordeonElectivos() {
    const acordeon = document.getElementById('acordeon-electivos');
    if (!acordeon) return;
    const estabAbierto = acordeon.classList.contains('abierto');
    document.querySelectorAll('.acordeon').forEach(a => a.classList.remove('abierto'));
    if (!estabAbierto) acordeon.classList.add('abierto');
}

/* ============================================================
   SELECCIÓN DE CURSOS Y CICLO (PANTALLA 3)
   ============================================================ */
function toggleCurso(cursoId, ciclo) {
    const checkbox = document.querySelector(`input[data-curso-id="${cursoId}"]`);
    const item = document.getElementById(`item-${cursoId}`);

    /* Buscar el curso tanto en ciclos numéricos como en electivos */
    const cursosList = CURSOS_POR_CICLO[mallaSeleccionada][carreraSeleccionada][parseInt(ciclo)] || CURSOS_POR_CICLO[mallaSeleccionada][carreraSeleccionada][ciclo] || [];
    let curso = cursosList.find(c => c.id === cursoId);
    if (!curso) {
        const electivos = CURSOS_POR_CICLO[mallaSeleccionada][carreraSeleccionada]['electivos'] || [];
        curso = electivos.find(c => c.id === cursoId);
    }

    if (checkbox.checked) {
        if (!cursosSeleccionados.find(c => c.id === cursoId)) {
            // malla_origen: de qué plan es ESTE curso en concreto — se fija
            // aquí y ya no cambia, aunque el estudiante después cambie su
            // malla_principal. Es la fuente de verdad por curso, separada
            // de qué malla tenga activa la sesión.
            cursosSeleccionados.push({ ...curso, cicloOrigen: ciclo, malla_origen: mallaSeleccionada });
        }
        item.classList.add('seleccionado');
    } else {
        cursosSeleccionados = cursosSeleccionados.filter(c => c.id !== cursoId);
        item.classList.remove('seleccionado');
    }

    actualizarContadores();
    ocultarMensajeValidacion();
}

function actualizarContadores() {
    for (let ciclo = 1; ciclo <= 10; ciclo++) {
        const contador = document.getElementById(`contador-ciclo-${ciclo}`);
        if (!contador) continue;
        const cantidad = cursosSeleccionados.filter(c => String(c.cicloOrigen) === String(ciclo)).length;
        contador.textContent = cantidad;
        contador.style.backgroundColor = cantidad > 0 ? '#10b981' : '#00bcd4';
    }
    const contadorEl = document.getElementById('contador-electivos');
    if (contadorEl) {
        const cantEl = cursosSeleccionados.filter(c => c.cicloOrigen === 'electivos').length;
        contadorEl.textContent = cantEl;
        contadorEl.style.backgroundColor = cantEl > 0 ? '#10b981' : '#00bcd4';
    }
}

/* ============================================================
   SELECTOR DE PERIODO ACADÉMICO (PANTALLA 3)
   Mismo formato que usa INTRALU internamente ("2026-1"), en vez
   de preguntar el ciclo — así no hay autoidentificación incómoda,
   y este dato queda listo para cuando se conecte la importación
   automática desde INTRALU más adelante.

   Tres periodos por año: 1 (marzo-julio), 2 (agosto-diciembre) y
   3 (verano, enero-febrero). El de verano se etiqueta con el año
   académico al que pertenece, no con el año calendario en que cae:
   el verano de enero-febrero 2026 es "2025-3" (cierra el año
   académico 2025, no abre el 2026). Ajusta los meses de corte si
   tu universidad usa otro calendario.
   ============================================================ */
function generarPeriodosDisponibles(cantidad = 36) {
    const hoy = new Date();
    const mes = hoy.getMonth(); // enero = 0

    let anio = hoy.getFullYear();
    let periodo;

    if (mes <= 1) {
        // Enero-febrero: verano, cierra el año académico anterior.
        periodo = 3;
        anio -= 1;
    } else if (mes <= 6) {
        // Marzo-julio
        periodo = 1;
    } else {
        // Agosto-diciembre
        periodo = 2;
    }

    const periodos = [];
    for (let i = 0; i < cantidad; i++) {
        periodos.push(`${anio}-${periodo}`);
        if (periodo > 1) {
            periodo -= 1;
        } else {
            periodo = 3;
            anio -= 1;
        }
    }
    return periodos;
}

/* "2026-2" -> "26-2" — formato corto y familiar para mostrar en pantalla. */
function formatoPeriodoCorto(periodo) {
    if (!periodo) return '';
    const [anio, num] = periodo.split('-');
    return `${anio.slice(-2)}-${num}`;
}

/* "2026-2" -> "20262" — formato crudo que espera recoleccion_notas.py
   (el mismo que usa Intralú en sus URLs de periodo). */
function periodoIntranotasARaw(periodo) {
    const [anio, tipo] = periodo.split('-');
    return `${anio}${tipo}`;
}

/* Marca en la UI (checkboxes + contadores) los cursos que YA están en
   cursosSeleccionados en memoria — nunca lee de localStorage acá, para
   no reintroducir selecciones de sesiones anteriores por error. */
function marcarCursosSeleccionadosEnUI() {
    cursosSeleccionados.forEach(curso => {
        const cb = document.querySelector(`input[data-curso-id="${curso.id}"]`);
        const item = document.getElementById(`item-${curso.id}`);
        if (cb && item) {
            cb.checked = true;
            item.classList.add('seleccionado');
        }
    });
    actualizarContadores();
}

/* ============================================================
   MODO TRANSICIÓN (alumnos con cursos de ambas mallas)
   Flag GLOBAL por estudiante (no por malla) — se activa manualmente,
   NUNCA se infiere solo del ciclo. El ciclo (5°-6° Sistemas, 4°
   Industrial) es apenas una sugerencia visual de cuándo podría hacer
   falta; la confirmación real es que el alumno de verdad tenga
   cursos de los dos planes.
   ============================================================ */
/* En vez de mezclar los cursos de la otra malla dentro del acordeón
   de su ciclo (con 14 cursos ahí se vuelve ilegible, mezclando "lo
   que exploro" con "lo que ya agregué"), viven en su propio resumen
   compacto, siempre visible mientras el modo transición esté activo. */
function renderCursosOtraMallaResumen() {
    const contenedor = document.getElementById('resumen-cursos-otra-malla');
    if (!contenedor) return;

    const extras = cursosSeleccionados.filter(c => c.malla_origen && c.malla_origen !== mallaSeleccionada);
    if (!extras.length) {
        contenedor.innerHTML = '';
        return;
    }

    contenedor.innerHTML = `
        <div style="background:#EAF2FF; border:1px solid #3C7CF8; border-radius:10px; padding:12px 16px;">
            <p style="font-family:'Poppins', sans-serif; font-size:0.78rem; font-weight:700; color:#374151; margin:0 0 8px;">
                Cursos agregados de tu otra malla (${extras.length})
            </p>
            <div style="display:flex; flex-direction:column; gap:6px;">
                ${extras.map(c => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border-radius:8px; padding:8px 10px;">
                        <div style="font-size:0.78rem; color:#1f2937;">
                            <strong>${c.name}</strong>
                            <span style="color:#9ca3af;"> · ${c.code} · Ciclo ${c.cicloOrigen}
                                <span style="font-weight:700; color:#3C7CF8;">· Malla ${c.malla_origen}</span>
                            </span>
                        </div>
                        <button type="button" onclick="removerCursoOtraMalla('${c.id}')" aria-label="Quitar"
                            style="background:none; border:none; color:#9ca3af; font-size:1rem; cursor:pointer; padding:2px 6px; flex-shrink:0;">✕</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function removerCursoOtraMalla(cursoId) {
    cursosSeleccionados = cursosSeleccionados.filter(c => c.id !== cursoId);
    actualizarContadores();
    renderCursosOtraMallaResumen();
}

function modoTransicionActivo() {
    return localStorage.getItem('intranotas_modo_transicion') === '1';
}

function toggleModoTransicion() {
    const checkbox = document.getElementById('checkbox-modo-transicion');
    const activo = checkbox.checked;
    localStorage.setItem('intranotas_modo_transicion', activo ? '1' : '0');
    const aviso = document.getElementById('aviso-modo-transicion');
    if (aviso) aviso.style.display = activo ? 'block' : 'none';
    renderBotonOtraMalla();
}

function inicializarModoTransicion() {
    const activo = modoTransicionActivo();
    const checkbox = document.getElementById('checkbox-modo-transicion');
    if (checkbox) checkbox.checked = activo;
    const aviso = document.getElementById('aviso-modo-transicion');
    if (aviso) aviso.style.display = activo ? 'block' : 'none';
    renderBotonOtraMalla();
}

function renderBotonOtraMalla() {
    const contenedor = document.getElementById('contenedor-btn-otra-malla');
    if (!contenedor) return;
    if (!modoTransicionActivo()) {
        contenedor.innerHTML = '';
        return;
    }
    const otraMalla = mallaSeleccionada === '2018' ? '2026' : '2018';
    contenedor.innerHTML = `
        <div style="text-align:center;">
            <button type="button" class="btn-volver-carrera" onclick="abrirModalAgregarOtraMalla()">
                + Agregar curso de Malla ${otraMalla}
            </button>
        </div>
    `;
}

/* Lista los cursos del catálogo de la OTRA malla (misma carrera),
   agrupados por ciclo, con checkboxes — el alumno marca varios de
   una sola vez (normalmente agrega el ciclo completo) y confirma con
   un solo botón al final, sin tener que reabrir el modal por cada
   curso. Header y footer quedan fijos (no hace falta bajar hasta el
   fondo para cancelar o confirmar). */
function abrirModalAgregarOtraMalla() {
    const otraMalla = mallaSeleccionada === '2018' ? '2026' : '2018';
    const catalogoCarrera = CURSOS_POR_CICLO[otraMalla]?.[carreraSeleccionada];
    if (!catalogoCarrera) {
        mostrarToast(`⚠️ Malla ${otraMalla} todavía no tiene catálogo para esta carrera`);
        return;
    }

    const grupos = [];
    for (let ciclo = 1; ciclo <= 10; ciclo++) {
        const lista = catalogoCarrera[ciclo] || catalogoCarrera[String(ciclo)] || [];
        if (lista.length) grupos.push({ etiqueta: `Ciclo ${ciclo}`, cursos: lista });
    }
    const electivos = catalogoCarrera['electivos'] || [];
    if (electivos.length) grupos.push({ etiqueta: 'Electivos', cursos: electivos });

    document.getElementById('modal-otra-malla-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay visible';
    overlay.id = 'modal-otra-malla-overlay';
    overlay.innerHTML = `
        <div class="modal-caja" style="max-width:400px; max-height:80vh; padding:0; text-align:left; display:flex; flex-direction:column;">
            <div style="padding:18px 22px 12px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                <h3 style="margin:0; font-size:1rem; color:var(--color-verde-oscuro);">Agregar cursos de Malla ${otraMalla}</h3>
                <button type="button" onclick="document.getElementById('modal-otra-malla-overlay').remove()"
                    aria-label="Cerrar"
                    style="background:none; border:none; font-size:1.2rem; line-height:1; cursor:pointer; color:#9ca3af; padding:4px;">✕</button>
            </div>
            <div id="lista-otra-malla-body" style="overflow-y:auto; padding:12px 22px; flex:1;">
                ${grupos.map(grupo => `
                    <p style="font-family:'Poppins', sans-serif; font-size:0.7rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.4px; margin:14px 0 8px;">
                        ${grupo.etiqueta}
                    </p>
                    ${grupo.cursos.map(c => {
        const yaSeleccionado = cursosSeleccionados.some(sel => sel.id === c.id);
        return `
                        <label class="curso-item" style="cursor:pointer;">
                            <input type="checkbox" class="curso-checkbox" data-otra-malla-curso-id="${c.id}"${yaSeleccionado ? ' checked' : ''}>
                            <div class="curso-info">
                                <div class="curso-nombre">${c.name}</div>
                                <div class="curso-detalles"><span class="curso-codigo">${c.code}</span>
                                    <span class="curso-creditos">${c.credits} créditos</span></div>
                            </div>
                        </label>
                    `;
    }).join('')}
                `).join('')}
            </div>
            <div style="padding:14px 22px; border-top:1px solid #e5e7eb; display:flex; gap:8px; flex-shrink:0;">
                <button type="button" class="btn-volver" style="flex:1;"
                    onclick="document.getElementById('modal-otra-malla-overlay').remove()">Cancelar</button>
                <button type="button" class="btn-ingresar-principal" style="flex:1; padding:10px 16px; font-size:0.8rem;"
                    onclick="confirmarAgregarCursosOtraMalla('${otraMalla}')">Añadir cursos</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function confirmarAgregarCursosOtraMalla(otraMalla) {
    const catalogoCarrera = CURSOS_POR_CICLO[otraMalla]?.[carreraSeleccionada];
    if (!catalogoCarrera) return;

    const marcados = document.querySelectorAll('#lista-otra-malla-body input[data-otra-malla-curso-id]:checked');
    if (!marcados.length) {
        mostrarToast('Selecciona al menos un curso');
        return;
    }

    let agregados = 0;
    let yaExistian = 0;

    marcados.forEach(chk => {
        const cursoId = chk.dataset.otraMallaCursoId;
        let curso = null;
        let cicloEncontrado = null;
        for (let ciclo = 1; ciclo <= 10; ciclo++) {
            const lista = catalogoCarrera[ciclo] || catalogoCarrera[String(ciclo)] || [];
            const hit = lista.find(c => c.id === cursoId);
            if (hit) { curso = hit; cicloEncontrado = ciclo; break; }
        }
        if (!curso) {
            const hit = (catalogoCarrera['electivos'] || []).find(c => c.id === cursoId);
            if (hit) { curso = hit; cicloEncontrado = 'electivos'; }
        }
        if (!curso) return;

        if (cursosSeleccionados.find(c => c.id === curso.id)) {
            yaExistian++;
        } else {
            // malla_origen queda fijo en el curso desde este momento — no
            // se vuelve a recalcular después aunque cambie la malla_principal.
            cursosSeleccionados.push({ ...curso, cicloOrigen: cicloEncontrado, malla_origen: otraMalla });
            agregados++;
        }
    });

    actualizarContadores();
    renderCursosOtraMallaResumen();
    document.getElementById('modal-otra-malla-overlay')?.remove();

    const partes = [];
    if (agregados) partes.push(`✅ ${agregados} curso${agregados === 1 ? '' : 's'} agregado${agregados === 1 ? '' : 's'} (Malla ${otraMalla})`);
    if (yaExistian) partes.push(`${yaExistian} ya estaba${yaExistian === 1 ? '' : 'n'} agregado${yaExistian === 1 ? '' : 's'}`);
    mostrarToast(partes.join(' — ') || 'No se agregó nada nuevo');
}

/* Modal de última instancia: solo aparece cuando un código de curso
   existe en AMBAS mallas con nombres distintos (colisión real) y no
   se pudo resolver comparando nombre/créditos. Devuelve una Promise
   para poder usarse con await dentro del loop de sincronización. */
function resolverColisionMallaCurso(cursoIntralu, opcionA, opcionB) {
    return new Promise(resolve => {
        document.getElementById('modal-colision-overlay')?.remove();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay visible';
        overlay.id = 'modal-colision-overlay';
        overlay.innerHTML = `
            <div class="modal-caja">
                <div class="modal-icono">🤔</div>
                <h2 class="modal-titulo">¿A qué plan pertenece este curso?</h2>
                <p class="modal-mensaje">
                    El código <strong>${cursoIntralu.codigo}</strong> existe en tus dos mallas y no pudimos
                    distinguir cuál es. Elige el plan correcto:
                </p>
                <div class="modal-botones" style="flex-direction:column;">
                    <button class="modal-btn modal-btn-cancelar" id="btn-colision-a" style="margin-bottom:8px;">
                        Malla ${opcionA.malla_origen}: ${opcionA.name}
                    </button>
                    <button class="modal-btn modal-btn-confirmar" id="btn-colision-b" style="margin-bottom:8px;">
                        Malla ${opcionB.malla_origen}: ${opcionB.name}
                    </button>
                    <button class="modal-btn modal-btn-cancelar" id="btn-colision-omitir"
                        style="background:none; color:#9ca3af; font-weight:500;">
                        Omitir este curso
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        // Siempre resuelve (nunca queda colgada la Promise, aunque el
        // alumno cierre la pestaña a mitad de camino): omitir devuelve
        // null, que procesarRespuestaSyncIntralu ya trata igual que un
        // curso "no reconocido".
        overlay.querySelector('#btn-colision-a').onclick = () => { overlay.remove(); resolve(opcionA); };
        overlay.querySelector('#btn-colision-b').onclick = () => { overlay.remove(); resolve(opcionB); };
        overlay.querySelector('#btn-colision-omitir').onclick = () => { overlay.remove(); resolve(null); };
    });
}

/* ============================================================
   SINCRONIZACIÓN AUTOMÁTICA CON INTRALÚ
   Arma automáticamente tus periodos y cursos leyendo la lista de
   cursos matriculados de cada ciclo desde la intranet de la UNI, vía
   el backend recoleccion_notas.py (FastAPI + Playwright). Las notas
   las sigues ingresando tú a mano, como siempre — el backend YA NO
   trae notas ni visita el detalle de cada curso, solo la tabla
   resumen de cada periodo (mucho más rápido y liviano).

   Las credenciales de Intralú viajan directo a ese backend por HTTPS
   y nunca se guardan aquí ni ahí: se usan solo para el login puntual
   y se descartan al terminar.

   El backend entrega cada periodo con la clave ya en el mismo formato
   que usa Intranotas ("2026-1", "2025-3" para verano, etc. vía
   etiquetar_periodo()), así que aquí solo hace falta mapear cada
   curso por CÓDIGO contra el catálogo de la malla/carrera activas.
   ============================================================ */
/* Oculto por defecto para todos los usuarios mientras terminas de
   probarlo — solo se muestra si el correo de la sesión activa coincide
   con el tuyo. _intraluBetaHabilitado se resuelve UNA vez al cargar la
   página (inicializarFlagIntralu(), llamado desde el DOMContentLoaded
   de más abajo) porque generarSimulador() es síncrono y no puede
   esperar la respuesta de Supabase en cada render. */
const CORREO_BETA_INTRALU = 'harrypc2021@hotmail.com'; // correo de sesión confirmado por Harry

let _intraluBetaHabilitado = false;

async function inicializarFlagIntralu() {
    try {
        if (!window.sigaObtenerSesion) {
            _intraluBetaHabilitado = false;
            return;
        }
        const sesion = await window.sigaObtenerSesion();
        const correoSesion = (sesion?.user?.email || '').toLowerCase();
        _intraluBetaHabilitado = correoSesion === CORREO_BETA_INTRALU.toLowerCase();
    } catch (e) {
        _intraluBetaHabilitado = false;
    }
}

function syncIntraluHabilitado() {
    return _intraluBetaHabilitado;
}

// Detecta solo si estás corriendo tu Jekyll local (localhost/127.0.0.1) para
// usar tu backend local automáticamente — en cualquier otro caso (producción,
// GitHub Pages) usa la URL real de Render. Así no hay que ir cambiando esta
// línea a mano cada vez que alternas entre probar local y producción.
const INTRALU_SYNC_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:8000/api/sync-intralu'
    : 'https://siga-conexion-intralu.onrender.com/api/sync-intralu';

function abrirModalSyncIntralu() {
    const existente = document.getElementById('modal-sync-intralu-overlay');
    if (existente) {
        // Limpiar los campos SIEMPRE al reabrir — antes el modal se
        // reutilizaba tal cual y por eso el código (y la contraseña)
        // de la vez anterior se quedaba pegado en pantalla.
        document.getElementById('sync-intralu-codigo').value = '';
        document.getElementById('sync-intralu-password').value = '';
        document.getElementById('sync-intralu-error').style.display = 'none';
        existente.classList.add('visible');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-sync-intralu-overlay';
    overlay.innerHTML = `
        <div class="modal-caja" style="max-width:380px; text-align:left;">
            <h3 style="margin:0 0 8px; font-size:1.05rem; color:var(--color-cian);">🔄 Cargar notas de Intralú</h3>
            <p style="font-size:0.82rem; color:var(--color-gris-texto); line-height:1.6; margin-bottom:16px;">
                Ingresa tu código y contraseña de Intralú. Se usa una sola vez para iniciar sesión y leer tus cursos
                y notas de todos tus periodos — puede tardar diez minutos o más si decides cargar todos los ciclos
                que has cursado, dependiendo de la cantidad de cursos que llevaste por ciclo (elegir un solo periodo
                es más rápido). Tus credenciales nunca se guardan en nuestros servidores: se descartan al terminar.
                Además, no necesitas tener abierta Intralú para hacerlo.
            </p>
            <label style="display:block; font-size:0.78rem; font-weight:600; margin-bottom:4px;">¿Qué quieres cargar?</label>
            <select id="sync-intralu-alcance"
                style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--color-borde, #e5e7eb); margin-bottom:12px; font-size:0.9rem; box-sizing:border-box;">
                <option value="todos">Todos mis periodos (tarda varios minutos)</option>
                ${generarPeriodosDisponibles(12).map(p => `<option value="${p}">Solo ${formatoPeriodoCorto(p)}</option>`).join('')}
            </select>
            <label style="display:block; font-size:0.78rem; font-weight:600; margin-bottom:4px;">Código UNI</label>
            <input id="sync-intralu-codigo" type="text" placeholder="2023XXXXX" autocomplete="off"
                oninput="this.value = this.value.toUpperCase()"
                style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--color-borde, #e5e7eb); margin-bottom:12px; font-size:0.9rem; box-sizing:border-box;">
            <label style="display:block; font-size:0.78rem; font-weight:600; margin-bottom:4px;">Contraseña de Intralú</label>
            <div style="position:relative;">
                <input id="sync-intralu-password" type="password" placeholder="Contraseña" autocomplete="off"
                    style="width:100%; padding:10px 40px 10px 12px; border-radius:8px; border:1px solid var(--color-borde, #e5e7eb); margin-bottom:6px; font-size:0.9rem; box-sizing:border-box;">
                <button type="button" onclick="alternarVisibilidadPasswordIntralu()" aria-label="Mostrar u ocultar contraseña"
                    style="position:absolute; right:10px; top:9px; background:none; border:none; cursor:pointer; font-size:1rem; padding:2px 4px; line-height:1;">
                    <span id="sync-intralu-password-icono">👁️</span>
                </button>
            </div>
            <p id="sync-intralu-error" style="display:none; color:#dc2626; font-size:0.78rem; margin:4px 0 0;"></p>
            <p id="sync-intralu-progreso" style="display:none; color:var(--color-cian); font-size:0.8rem; margin:12px 0 0; text-align:center; line-height:1.5;">
                ⏳ Conectando con Intralú... esto puede tardar varios minutos, no cierres esta ventana.
            </p>
            <div style="display:flex; gap:8px; margin-top:18px;">
                <button type="button" class="btn-volver" style="flex:1;" id="sync-intralu-btn-cancelar" onclick="cerrarModalSyncIntralu()">Cancelar</button>
                <button type="button" class="btn-primary" style="flex:1;" id="sync-intralu-btn-confirmar" onclick="ejecutarSyncIntralu()">Ingresar y sincronizar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
}

function alternarVisibilidadPasswordIntralu() {
    const input = document.getElementById('sync-intralu-password');
    const icono = document.getElementById('sync-intralu-password-icono');
    const oculto = input.type === 'password';
    input.type = oculto ? 'text' : 'password';
    icono.textContent = oculto ? '🙈' : '👁️';
}

function cerrarModalSyncIntralu() {
    const overlay = document.getElementById('modal-sync-intralu-overlay');
    if (overlay) overlay.classList.remove('visible');
}

async function ejecutarSyncIntralu() {
    const codigoEl = document.getElementById('sync-intralu-codigo');
    const passwordEl = document.getElementById('sync-intralu-password');
    const errorEl = document.getElementById('sync-intralu-error');
    const progresoEl = document.getElementById('sync-intralu-progreso');
    const btnConfirmar = document.getElementById('sync-intralu-btn-confirmar');
    const btnCancelar = document.getElementById('sync-intralu-btn-cancelar');

    const codigo = codigoEl.value.trim();
    const password = passwordEl.value;
    const alcance = document.getElementById('sync-intralu-alcance').value;
    const periodo = alcance === 'todos' ? null : periodoIntranotasARaw(alcance);

    errorEl.style.display = 'none';

    if (!codigo || !password) {
        errorEl.textContent = 'Ingresa tu código y tu contraseña.';
        errorEl.style.display = 'block';
        return;
    }

    btnConfirmar.disabled = true;
    btnCancelar.disabled = true;
    btnConfirmar.textContent = 'Sincronizando...';
    progresoEl.style.display = 'block';
    progresoEl.textContent = '⏳ Conectando con Intralú...';

    try {
        // Paso 1: iniciar el job — responde al instante con un job_id,
        // el scraping real corre en segundo plano en el backend.
        const respInicio = await fetch(INTRALU_SYNC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, password, periodo }),
        });
        const dataInicio = await respInicio.json();
        if (!respInicio.ok) {
            throw new Error(dataInicio.detail || 'No se pudo conectar con Intralú.');
        }

        // Limpiamos la contraseña del DOM apenas se envió, por si acaso.
        passwordEl.value = '';

        // Paso 2: preguntar cada pocos segundos si ya terminó.
        const resultado = await esperarResultadoSyncIntralu(dataInicio.job_id, progresoEl);

        cerrarModalSyncIntralu();
        await procesarRespuestaSyncIntralu(resultado.periodos || {});
    } catch (err) {
        errorEl.textContent = err.message || 'Ocurrió un error al sincronizar. Intenta de nuevo.';
        errorEl.style.display = 'block';
    } finally {
        btnConfirmar.disabled = false;
        btnCancelar.disabled = false;
        btnConfirmar.textContent = 'Ingresar y sincronizar';
        progresoEl.style.display = 'none';
    }
}

/* Pregunta cada 3 segundos al backend si el job ya terminó, mostrando
   en vivo qué periodo está revisando ahora mismo. Corta con error si
   pasan más de 15 minutos (red de seguridad, no debería llegar ahí). */
async function esperarResultadoSyncIntralu(jobId, progresoEl) {
    const inicio = Date.now();
    const LIMITE_MS = 15 * 60 * 1000;

    while (true) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (Date.now() - inicio > LIMITE_MS) {
            throw new Error('La sincronización está tardando demasiado. Intenta de nuevo más tarde.');
        }

        const resp = await fetch(`${INTRALU_SYNC_URL}/${jobId}`);
        const data = await resp.json();

        if (!resp.ok) {
            throw new Error(data.detail || 'Ocurrió un error al sincronizar.');
        }

        if (data.status === 'listo') return data;

        if (progresoEl) {
            const segundos = Math.floor((Date.now() - inicio) / 1000);
            progresoEl.textContent = data.periodo_actual
                ? `⏳ Revisando periodo ${data.periodo_actual}... (${segundos}s)`
                : `⏳ Conectando con Intralú... (${segundos}s)`;
        }
    }
}

/* Busca un curso del catálogo de la MALLA + CARRERA activas por su
   código (recorre ciclos 1-10 + electivos). Devuelve el curso del
   catálogo ya con su cicloOrigen, o null si el código no está
   mapeado en esa malla/carrera. */
/* Busca un curso por código, primero en la malla ACTIVA y, si no
   aparece ahí, en la OTRA malla — sin fusionar catálogos (evita el
   riesgo de que un mismo código signifique cursos distintos en cada
   malla y se pise uno con otro). El resultado trae `_mallaOrigen`
   para que quien llama sepa en qué cajón de localStorage/nube debe
   guardarse esta nota, sin importar cuál malla esté activa ahora
   mismo en pantalla. */
/* Busca un curso por código, siempre primero en la malla ACTIVA. Solo
   prueba también la OTRA malla si el modo transición está encendido
   (nunca por defecto — evita falsos positivos para el resto de
   usuarios). Si el código existe en ambas, intenta resolverlo por
   nombre y luego por créditos antes de darlo por ambiguo; si sigue
   empatado pero es el MISMO nombre en las dos (curso que no cambió de
   código entre mallas), usa la malla activa sin preguntar. Solo en una
   colisión real (nombres distintos) devuelve _colision para que quien
   llama le pregunte al usuario. */
function buscarCursoEnCatalogoPorCodigo(codigo, nombreIntralu, creditosIntralu) {
    const codigoNorm = String(codigo).trim().toUpperCase();

    function buscarEnMalla(malla) {
        const catalogoCarrera = CURSOS_POR_CICLO[malla]?.[carreraSeleccionada];
        if (!catalogoCarrera) return null;
        for (let ciclo = 1; ciclo <= 10; ciclo++) {
            const lista = catalogoCarrera[ciclo] || catalogoCarrera[String(ciclo)] || [];
            const encontrado = lista.find(c => String(c.code).trim().toUpperCase() === codigoNorm);
            if (encontrado) return { ...encontrado, cicloOrigen: ciclo, malla_origen: malla };
        }
        const electivos = catalogoCarrera['electivos'] || [];
        const encontradoElectivo = electivos.find(c => String(c.code).trim().toUpperCase() === codigoNorm);
        if (encontradoElectivo) return { ...encontradoElectivo, cicloOrigen: 'electivos', malla_origen: malla };
        return null;
    }

    const enPrincipal = buscarEnMalla(mallaSeleccionada);
    if (!modoTransicionActivo()) return enPrincipal;

    const otraMalla = mallaSeleccionada === '2018' ? '2026' : '2018';
    const enOtra = buscarEnMalla(otraMalla);

    if (enPrincipal && !enOtra) return enPrincipal;
    if (enOtra && !enPrincipal) return enOtra;
    if (!enPrincipal && !enOtra) return null;

    // Encontrado en AMBAS mallas — desambiguar antes de preguntar.
    const nombreNorm = (nombreIntralu || '').trim().toUpperCase();
    const nomA = enPrincipal.name.trim().toUpperCase();
    const nomB = enOtra.name.trim().toUpperCase();

    if (nombreNorm) {
        if (nomA === nombreNorm && nomB !== nombreNorm) return enPrincipal;
        if (nomB === nombreNorm && nomA !== nombreNorm) return enOtra;
    }
    if (creditosIntralu != null) {
        const credA = Number(enPrincipal.credits) === Number(creditosIntralu);
        const credB = Number(enOtra.credits) === Number(creditosIntralu);
        if (credA && !credB) return enPrincipal;
        if (credB && !credA) return enOtra;
    }
    if (nomA === nomB) return enPrincipal; // mismo curso, no cambió de código: default silencioso

    // Colisión real: mismo código, cursos distintos. Que decida el usuario.
    return { ...enPrincipal, _colision: enOtra };
}

/* Toma la respuesta del backend (agrupada por periodo, con la clave ya
   en formato "2026-1" gracias a etiquetar_periodo en el backend) y
   arma/reemplaza cada periodo dentro del cajón de la malla ACTIVA
   (igual que siempre) — cada curso individual lleva su propio
   malla_origen, así que un periodo puede tener cursos de ambas mallas
   sin ambigüedad, sin necesidad de un cajón especial para eso. */
async function procesarRespuestaSyncIntralu(periodosIntralu) {
    const datos = leerDatosPeriodos();
    const noReconocidos = [];
    let periodosActualizados = 0;

    for (const entradaPeriodo of Object.values(periodosIntralu)) {
        const claveIntranotas = entradaPeriodo.etiqueta_periodo;
        const cursosMapeados = [];
        const notasPeriodo = {};

        for (const cursoIntralu of entradaPeriodo.cursos) {
            let cursoCatalogo = buscarCursoEnCatalogoPorCodigo(
                cursoIntralu.codigo, cursoIntralu.nombre, cursoIntralu.creditos
            );

            if (cursoCatalogo && cursoCatalogo._colision) {
                cursoCatalogo = await resolverColisionMallaCurso(
                    cursoIntralu, cursoCatalogo, cursoCatalogo._colision
                );
            }

            if (!cursoCatalogo) {
                noReconocidos.push(`${cursoIntralu.codigo} - ${cursoIntralu.nombre} (${claveIntranotas})`);
                continue;
            }

            cursosMapeados.push(cursoCatalogo);

            // Comparación insensible a mayúsculas como red de seguridad
            // extra (el backend ya normaliza a la casing exacta del
            // catálogo, pero por si algún texto de Intralú se cuela distinto).
            const notasCurso = {};
            (cursoIntralu.evaluaciones || []).forEach(ev => {
                if (ev.nota === null || ev.nota === undefined) return;
                const compReal = cursoCatalogo.components.find(
                    c => c.toUpperCase() === String(ev.etiqueta).toUpperCase()
                );
                if (!compReal) return;
                notasCurso[compReal] = ev.nota;
            });
            if (Object.keys(notasCurso).length) notasPeriodo[cursoCatalogo.id] = notasCurso;
        }

        if (!cursosMapeados.length) continue; // Nada reconocido en este periodo: no se crea/toca entrada

        datos[claveIntranotas] = {
            carrera: carreraSeleccionada,
            cursos: cursosMapeados,
            notas: notasPeriodo,
        };
        periodosActualizados++;
    }

    guardarDatosPeriodos(datos); // esto ya sube a la nube automáticamente (sincronizarNube)

    if (noReconocidos.length) {
        reportarCursosNoReconocidos(noReconocidos);
    }

    mostrarToast(
        periodosActualizados
            ? `✅ Se sincronizaron ${periodosActualizados} periodo${periodosActualizados === 1 ? '' : 's'} desde Intralú`
            : '⚠️ Intralú no trajo cursos que tu catálogo reconozca'
    );

    // Si el periodo que se está viendo ahora mismo fue actualizado, refresca la pantalla.
    if (periodoSeleccionado && datos[periodoSeleccionado] && document.getElementById('pantalla-4')?.classList.contains('activa')) {
        cursosSeleccionados = datos[periodoSeleccionado].cursos;
        generarSimulador();
        desmarcarTodosLosCursos();
        marcarCursosSeleccionadosEnUI();
    }
}

/* Envía a Supabase (tabla sugerencias) la lista de cursos que Intralú
   trajo pero que el catálogo de Intranotas no reconoce, para que
   Harry los revise y los mapee manualmente. Usa el cliente ya
   expuesto en window.sigaSupabase/window.sigaObtenerSesion por el
   <script type="module"> de intranotas/index.html (mismo patrón que
   usa obtenerSesionNube() más abajo). */
async function reportarCursosNoReconocidos(lista) {
    try {
        if (!window.sigaObtenerSesion || !window.sigaSupabase) return;
        const sesion = await window.sigaObtenerSesion();
        if (!sesion?.user) return;

        await window.sigaSupabase.from('sugerencias').insert({
            user_id: sesion.user.id,
            categoria: 'intranotas',
            titulo: 'Cursos no reconocidos al sincronizar con Intralú',
            descripcion: lista.join('\n'),
        });
    } catch (e) {
        console.log('No se pudo reportar cursos no reconocidos:', e);
    }
}

/* ============================================================
   PERSISTENCIA MULTI-PERIODO EN LOCALSTORAGE
   Cada periodo académico guarda su propia carrera, cursos y notas,
   bajo una sola clave: { "2025-1": {carrera, cursos, notas}, ... }
   Así, cambiar de periodo (o volver a uno anterior) nunca borra los
   datos de los demás.
   ============================================================ */
/* Namespaceadas por malla: intranotas_datos_periodos_2018 /
   _2026, intranotas_ultimo_periodo_2018 / _2026. Así un "2026-1" de
   un ingresante nunca choca con nada de la malla vieja, y cambiar de
   malla es seguro para los datos — cada una vive en su propia clave. */
function claveDatosPeriodos() {
    return `intranotas_datos_periodos_${mallaSeleccionada}`;
}
function claveUltimoPeriodo() {
    return `intranotas_ultimo_periodo_${mallaSeleccionada}`;
}

function leerDatosPeriodos() {
    const raw = localStorage.getItem(claveDatosPeriodos());
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
}

function guardarDatosPeriodos(datos) {
    localStorage.setItem(claveDatosPeriodos(), JSON.stringify(datos));
    sincronizarNube(datos);
}

/* ============================================================
   SINCRONIZACIÓN EN LA NUBE (multi-dispositivo)
   localStorage sigue siendo la fuente rápida de lectura/escritura —
   nada de esto la reemplaza. La nube solo entra en dos momentos:
     1) Al abrir la app (hidratarDesdeNube): trae lo último guardado
        en Supabase y pisa el caché local, por si otro dispositivo
        guardó algo más reciente.
     2) Cada vez que se guarda algo local (sincronizarNube): sube una
        copia en segundo plano, sin bloquear la UI ni el toast.
   Desde que Intranotas usa gate.js (index.html) siempre hay una
   sesión válida al llegar acá, así que en el uso normal esto SIEMPRE
   sincroniza. Aun así se deja el chequeo de sesión como red de
   seguridad por si gate.js algún día se quita o falla su redirect.
   Los datos viven en la tabla intranotas_datos_nube, una fila por
   (user_id, malla) — ver SQL de creación en el mensaje del chat.
   ============================================================ */
const TABLA_NUBE = 'intranotas_datos_nube';
let sesionNubePromesa = null;

function obtenerSesionNube() {
    if (!window.sigaObtenerSesion) return Promise.resolve(null);
    if (!sesionNubePromesa) {
        sesionNubePromesa = window.sigaObtenerSesion().catch(() => null);
    }
    return sesionNubePromesa;
}

async function hidratarDesdeNube() {
    const sesion = await obtenerSesionNube();
    if (!sesion || !window.sigaSupabase) return;

    const { data, error } = await window.sigaSupabase
        .from(TABLA_NUBE)
        .select('datos_periodos, ultimo_periodo')
        .eq('user_id', sesion.user.id)
        .eq('malla', mallaSeleccionada)
        .maybeSingle();

    if (error) { console.warn('No se pudo traer Intranotas de la nube:', error); return; }
    if (!data) return; // este dispositivo es el primero en tener datos de esta malla

    if (data.datos_periodos) localStorage.setItem(claveDatosPeriodos(), JSON.stringify(data.datos_periodos));
    if (data.ultimo_periodo) localStorage.setItem(claveUltimoPeriodo(), data.ultimo_periodo);
}

async function sincronizarNube(datos) {
    const sesion = await obtenerSesionNube();
    if (!sesion || !window.sigaSupabase) return;

    const { error } = await window.sigaSupabase
        .from(TABLA_NUBE)
        .upsert({
            user_id: sesion.user.id,
            malla: mallaSeleccionada,
            datos_periodos: datos,
            ultimo_periodo: localStorage.getItem(claveUltimoPeriodo()),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,malla' });

    if (error) console.warn('No se pudo sincronizar Intranotas con la nube:', error);
}

/* Se inicializa una sola vez (guardián selectorPeriodoInstancia): el
   trigger y la lista viven fijos en el DOM de Pantalla 3, así que
   volver a llamar inicializarSelectPersonalizado() en cada refresco
   duplicaría los listeners de clic. Las llamadas posteriores solo
   actualizan el valor mostrado con .establecer(). */
function generarOpcionesPeriodo() {
    const periodos = generarPeriodosDisponibles();
    const actual = periodos[0];
    const valorInicial = periodoSeleccionado || actual;

    if (!selectorPeriodoInstancia) {
        selectorPeriodoInstancia = inicializarSelectPersonalizado({
            triggerId: 'periodoTrigger', textoId: 'periodoTriggerTexto',
            listaId: 'periodoLista', valorId: 'periodoValor',
            opciones: periodos.map(p => ({ value: p, label: p })),
            alElegir: (valor) => seleccionarPeriodo(valor),
        });
    }

    if (selectorPeriodoInstancia) selectorPeriodoInstancia.establecer(valorInicial, valorInicial);
    periodoSeleccionado = valorInicial;
}

function seleccionarPeriodo(valor) {
    periodoSeleccionado = valor;
}

/* ============================================================
   VALIDACIÓN Y NAVEGACIÓN AL SIMULADOR
   ============================================================ */
function irAlSimulador() {
    if (!periodoSeleccionado) {
        mostrarMensajeValidacion('⚠️ Debes seleccionar tu periodo académico');
        return;
    }
    if (cursosSeleccionados.length === 0) {
        mostrarMensajeValidacion('⚠️ Debes seleccionar al menos un curso');
        return;
    }
    guardarConfiguracion();
    irAPantalla(4);
    generarSimulador();
}

function mostrarMensajeValidacion(msg) {
    const el = document.getElementById('mensaje-validacion');
    el.textContent = msg;
    el.classList.add('visible');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function ocultarMensajeValidacion() {
    document.getElementById('mensaje-validacion').classList.remove('visible');
}

/* ============================================================
   MODAL DE INFORMACIÓN (PANTALLA 3)
   ============================================================ */
function abrirModalInfo() {
    document.getElementById('modal-info-overlay').classList.add('visible');
}

function cerrarModalInfo() {
    document.getElementById('modal-info-overlay').classList.remove('visible');
}

/* ============================================================
   GENERACIÓN DEL SIMULADOR (PANTALLA 4)
   ============================================================ */
function generarSimulador() {
    const contenedor = document.getElementById('contenedor-simulador');
    const cursosOrdenados = [...cursosSeleccionados].sort((a, b) => a.name.localeCompare(b.name));

    let html = `
        <div class="cabecera-simulador">
            <div class="titulo-ciclo-simulador">
                <span class="carrera-label">${NOMBRES_CARRERAS[carreraSeleccionada]}</span>
                <div style="display:flex; align-items:center;">
                    <div class="campo-select-custom" style="flex:1; max-width:220px;">
                        <button type="button" class="select-custom-trigger" id="periodoGuardadoTrigger"
                            aria-haspopup="listbox" aria-expanded="false">
                            <span id="periodoGuardadoTriggerTexto">${formatoPeriodoCorto(periodoSeleccionado)}</span>
                            <span class="select-custom-chevron" aria-hidden="true">▾</span>
                        </button>
                        <ul class="select-custom-lista" id="periodoGuardadoLista" role="listbox" hidden></ul>
                        <input type="hidden" id="periodoGuardadoValor">
                    </div>
                    <button type="button" class="btn-volver" onclick="iniciarEliminarPeriodo()"
                        aria-label="Eliminar este periodo"
                        style="flex-shrink:0; padding:8px 10px; margin-left:6px;">🗑️</button>
                </div>
            </div>
            ${syncIntraluHabilitado() ? `
            <button type="button" class="btn-volver"
                style="flex-shrink:0; display:inline-flex; align-items:center; gap:6px; padding:8px 16px; white-space:nowrap; align-self:center;"
                onclick="abrirModalSyncIntralu()">
                🔄 Cargar notas de Intralú
            </button>
            ` : ''}
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin:10px 0;">
            <button class="btn-volver" onclick="irAPantalla(3)" style="flex:1; min-width:140px;">← Cambiar cursos</button>
            <button class="btn-volver" onclick="iniciarNuevoPeriodo()" style="flex:1; min-width:140px;">🔄 Nuevo periodo</button>
        </div>

        <details style="margin:12px 0; background:var(--color-fondo-input); border-radius:10px; padding:10px 14px;">
            <summary style="cursor:pointer; font-weight:600; font-size:0.85rem; color:var(--color-cian);">💾 ¿Sabías que puedes guardar varios periodos?</summary>
            <p style="font-size:0.82rem; color:var(--color-gris-texto); margin:8px 0 0; line-height:1.6;">
                Cada periodo que armes se guarda por separado. Para guardar otro: toca "🔄 Nuevo periodo" (arriba),
                elige tus cursos, ingresa tus notas y presiona "💾 Guardar". Puedes volver a cualquier periodo
                guardado desde el selector de arriba en cualquier momento.
            </p>
        </details>

        <div class="banner-ponderado">
            <span class="banner-ponderado-label">PROMEDIO PONDERADO</span>
            <span class="banner-ponderado-valor" id="ponderado-ciclo">--</span>
        </div>

        <div class="banner-alertas" id="banner-alertas">
            <div class="banner-alertas-titulo">⚠️ CURSOS EN RIESGO</div>
            <div class="banner-alertas-lista" id="lista-alertas"></div>
        </div>

        <div id="lista-cursos-simulador">
    `;

    cursosOrdenados.forEach(curso => { html += generarTarjetaCurso(curso); });
    html += `</div>`;
    contenedor.innerHTML = html;
    cargarNotasGuardadas();
    cargarMetasGuardadas();
    cargarSelectorPeriodosGuardados();
    cursosSeleccionados.forEach(c => calcularMetaCurso(c.id));
    generarBannerReferencias();
}

/* ============================================================
   BANNER "DEJAR MI REFERENCIA" (Pantalla 4, debajo de Guardar /
   Limpiar todo). Intranotas no sabe qué profesor dicta cada curso
   (cursos_db.js no trae esa info, a diferencia de Horarios que sí
   elige por sección con profesor incluido), así que el paso
   intermedio ofrece CURSOS, no profesores. Al elegir uno, se abre
   Opiniones con ese curso ya buscado, y ahí la persona elige el
   profesor exacto para dejar su referencia.
   ============================================================ */
function generarBannerReferencias() {
    const cont = document.getElementById('banner-referencias');
    if (!cont || !cursosSeleccionados.length) { if (cont) cont.innerHTML = ''; return; }

    cont.innerHTML = `
        <div style="background:#fff; border-radius:14px; padding:22px 24px; text-align:center; margin:24px 0 8px; box-shadow:0 8px 20px rgba(0,0,0,0.06);">
            <p style="font-size:1rem; font-weight:700; color:var(--ink); margin-bottom:6px;">¿Cómo te fue con tus profesores este ciclo?</p>
            <p style="font-size:0.85rem; color:var(--ink-soft); max-width:480px; margin:0 auto 16px; line-height:1.6;">
                Ya los conoces de primera mano — cuéntale a otros estudiantes cómo enseñan y ayúdales a elegir mejor.
            </p>
            <button type="button" class="btn-primary" id="btnReferencia"
                style="display:inline-flex; align-items:center; gap:6px;"
                onclick="toggleSelectorReferencia()">
                <span>Dejar mi referencia</span>
                <span id="flechaReferencia" aria-hidden="true">▾</span>
            </button>
            <div id="selectorReferenciaLista"
                style="margin-top:16px; display:none; flex-direction:column; gap:6px; max-width:420px; margin-left:auto; margin-right:auto; text-align:left;"></div>
        </div>
    `;
}

function toggleSelectorReferencia() {
    const lista = document.getElementById('selectorReferenciaLista');
    const flecha = document.getElementById('flechaReferencia');
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
        <p style="font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:2px;">¿De qué curso quieres opinar sobre el profesor?</p>
        ${[...cursosSeleccionados].sort((a, b) => a.name.localeCompare(b.name)).map((c, i) => {
        const color = i % 2 === 0 ? COLOR_MORADO : COLOR_AZUL;
        return `
            <a href="../opiniones.html?buscar=${encodeURIComponent(c.name)}"
                style="display:block; padding:10px 14px; background:${color}; border-radius:8px; font-size:0.85rem; font-weight:500; color:var(--ink); text-decoration:none; transition:filter 0.15s ease;"
                onmouseover="this.style.filter='brightness(0.96)';"
                onmouseout="this.style.filter='none';">
                ${c.name}
            </a>`;
    }).join('')}
    `;
    lista.style.display = 'flex';
    if (flecha) flecha.textContent = '▴';
}

function generarTarjetaCurso(curso) {
    const layout = COMPONENT_LAYOUT[curso.formula_type] || COMPONENT_LAYOUT['ESTANDAR_1_1_1'];
    return `
        <div class="tarjeta-curso" id="tarjeta-${curso.id}">
            <div class="tarjeta-header" onclick="togglePanelNotas('${curso.id}')">
                <div class="tarjeta-curso-info">
                    <div class="tarjeta-curso-nombre">
                        ${curso.name}
                        <span class="badge-estado" id="badge-${curso.id}" style="display:none;"></span>
                    </div>
                    <div class="tarjeta-curso-meta">
                        <span class="tarjeta-curso-codigo">${curso.code}</span>
                        <span class="tarjeta-curso-creditos">${curso.credits} créditos</span>
                    </div>
                    <button class="btn-ingresar-notas" onclick="event.stopPropagation(); togglePanelNotas('${curso.id}')">
                        Ingresar Notas
                    </button>
                </div>
                <div class="caja-promedio">
                    <span class="caja-promedio-label">Promedio<br>Curso</span>
                    <span class="caja-promedio-valor" id="promedio-${curso.id}">--</span>
                </div>
            </div>
            <div class="panel-notas" id="panel-${curso.id}" onclick="event.stopPropagation()">
                ${generarInputsNotas(curso, layout)}
            </div>
        </div>
    `;
}

function generarInputsNotas(curso, layout) {
    let html = `
        <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
            <button onclick="event.stopPropagation(); limpiarNotasCurso('${curso.id}')"
                style="font-size:0.7rem; padding:4px 10px; background:#fee2e2; color:#dc2626;
                       border:1px solid #fca5a5; border-radius:4px; cursor:pointer; font-weight:600;">
                🗑️ Limpiar notas
            </button>
        </div>
    `;

    html += layout.map(row => `
        <div class="${row.grid}">
            ${row.comps.map(comp => `
                <div class="input-group">
                    <label class="input-label">${comp}</label>
                    <input type="number" class="input-nota"
                        id="input-${curso.id}-${comp}"
                        placeholder="--" min="0" max="20" step="1"
                        oninput="validarNota(this); calcularTodo()"
                        onkeydown="moverFoco(event, '${curso.id}', '${comp}')">
                </div>
            `).join('')}
        </div>
    `).join('');

    html += `
        <div class="fila-promedios-panel">
            <div class="promedio-item">
                <span class="promedio-item-label">Prom. PC:</span>
                <span class="promedio-item-valor" id="prom-pc-${curso.id}">--</span>
            </div>
        </div>
        <div class="seccion-simulador-nota" id="simulador-${curso.id}" style="display:none;">
            <div class="simulador-titulo">🎯 ¿QUÉ NOTA NECESITO PARA APROBAR?</div>
            <div class="simulador-contenido" id="simulador-contenido-${curso.id}"></div>
        </div>
        ${generarSeccionMetaCurso(curso)}
    `;
    return html;
}

/* ============================================================
   META DEL CURSO — Calculadora independiente del registro real
   ============================================================ */
function generarSeccionMetaCurso(curso) {
    const soloPC = FORMULAS_SOLO_PC.includes(curso.formula_type);

    let contenidoHTML = `
        <div class="meta-input-group">
            <label>Promedio final que quiero</label>
            <input type="number" class="meta-input-final" id="meta-final-${curso.id}"
                min="0" max="20" step="0.1" value="14"
                oninput="calcularMetaCurso('${curso.id}')">
        </div>
    `;

    if (soloPC) {
        contenidoHTML += `
            <div class="meta-nota-ayuda" style="margin-left:0;">
                Este curso se evalúa solo con prácticas, así que tu meta ES directamente
                el Prom. PC que necesitas alcanzar (no hay examen parcial ni final que calcular).
            </div>
        `;
    } else {
        contenidoHTML += `
            <div class="meta-modo-toggle" id="meta-toggle-${curso.id}" data-modo="EP">
                <button type="button" class="meta-modo-btn activo" id="meta-modo-ep-${curso.id}"
                    onclick="cambiarModoMeta('${curso.id}', 'EP')">Calcular EP</button>
                <button type="button" class="meta-modo-btn" id="meta-modo-ef-${curso.id}"
                    onclick="cambiarModoMeta('${curso.id}', 'EF')">Calcular EF</button>
            </div>
            <div id="meta-sliders-${curso.id}">
                ${generarSlidersMeta(curso, 'EP')}
            </div>
        `;
    }

    return `
        <div class="meta-curso-toggle" onclick="toggleMetaCurso('${curso.id}')">
            <span>🎯 META DEL CURSO</span>
            <span class="meta-curso-flecha" id="meta-flecha-${curso.id}">▼</span>
        </div>
        <div class="meta-curso-contenido" id="meta-curso-${curso.id}" style="display:none;">
            ${contenidoHTML}
        </div>
    `;
}

function generarSlidersMeta(curso, modo) {
    const soloExam = FORMULAS_SOLO_EXAMENES.includes(curso.formula_type);
    // Si modo='EP', el EF es el valor conocido/supuesto y se calcula el EP (y viceversa).
    const varConocida = modo === 'EP' ? 'EF' : 'EP';
    const nombreCalcular = modo === 'EP' ? 'examen parcial (EP)' : 'examen final (EF)';

    let html = '';

    if (!soloExam) {
        html += `
            <div class="meta-slider-group">
                <span class="meta-slider-label">Si en Prom. PC saco</span>
                <input type="range" class="meta-slider" id="meta-pp-${curso.id}"
                    min="0" max="20" step="0.1" value="14"
                    oninput="calcularMetaCurso('${curso.id}')">
                <span class="meta-slider-valor" id="meta-pp-valor-${curso.id}">14.0</span>
            </div>
            <div class="meta-nota-ayuda">
                Representa tu Promedio de Prácticas (PP) ya calculado —el promedio de tus
                3 mejores notas de 4— tal como entra en la fórmula del curso.
            </div>
        `;
    }

    html += `
        <div class="meta-slider-group">
            <span class="meta-slider-label">Y en ${varConocida} saco</span>
            <input type="range" class="meta-slider" id="meta-conocida-${curso.id}"
                min="0" max="20" step="0.1" value="14"
                oninput="calcularMetaCurso('${curso.id}')">
            <span class="meta-slider-valor" id="meta-conocida-valor-${curso.id}">14.0</span>
        </div>
        <div class="meta-resultado">
            <div class="meta-resultado-label">Necesitas al menos esto en tu ${nombreCalcular}</div>
            <div class="meta-resultado-valor" id="meta-resultado-${curso.id}">--</div>
        </div>
    `;

    return html;
}

function cambiarModoMeta(cursoId, modo) {
    const curso = cursosSeleccionados.find(c => c.id === cursoId);
    if (!curso) return;

    const toggle = document.getElementById(`meta-toggle-${cursoId}`);
    if (toggle) toggle.dataset.modo = modo;

    const btnEP = document.getElementById(`meta-modo-ep-${cursoId}`);
    const btnEF = document.getElementById(`meta-modo-ef-${cursoId}`);
    if (btnEP) btnEP.classList.toggle('activo', modo === 'EP');
    if (btnEF) btnEF.classList.toggle('activo', modo === 'EF');

    const contenedor = document.getElementById(`meta-sliders-${cursoId}`);
    if (contenedor) contenedor.innerHTML = generarSlidersMeta(curso, modo);

    calcularMetaCurso(cursoId);
}

function toggleMetaCurso(cursoId) {
    const contenido = document.getElementById(`meta-curso-${cursoId}`);
    const flecha = document.getElementById(`meta-flecha-${cursoId}`);
    if (!contenido) return;
    const abrir = contenido.style.display !== 'block';
    contenido.style.display = abrir ? 'block' : 'none';
    if (flecha) flecha.textContent = abrir ? '▲' : '▼';
}

function calcularMetaCurso(cursoId) {
    const curso = cursosSeleccionados.find(c => c.id === cursoId);
    if (!curso) return;

    const metaEl = document.getElementById(`meta-final-${cursoId}`);
    if (!metaEl) return;
    const metaFinal = parseFloat(metaEl.value);

    const soloPC = FORMULAS_SOLO_PC.includes(curso.formula_type);
    if (soloPC) {
        guardarMetaCurso(cursoId, { metaFinal });
        return;
    }

    const resultadoEl = document.getElementById(`meta-resultado-${cursoId}`);
    if (isNaN(metaFinal) || !resultadoEl) return;

    const esDobleEF = FORMULAS_DOBLE_EF.includes(curso.formula_type);
    const soloExam = FORMULAS_SOLO_EXAMENES.includes(curso.formula_type);

    const toggle = document.getElementById(`meta-toggle-${cursoId}`);
    const modo = toggle ? toggle.dataset.modo : 'EP';

    const conocidaSlider = document.getElementById(`meta-conocida-${cursoId}`);
    const conocidaValorEl = document.getElementById(`meta-conocida-valor-${cursoId}`);
    if (!conocidaSlider) return;
    const valorConocida = parseFloat(conocidaSlider.value);
    if (conocidaValorEl) conocidaValorEl.textContent = valorConocida.toFixed(1);

    let pp = null;
    if (!soloExam) {
        const ppSlider = document.getElementById(`meta-pp-${cursoId}`);
        const ppValorEl = document.getElementById(`meta-pp-valor-${cursoId}`);
        pp = parseFloat(ppSlider.value);
        if (ppValorEl) ppValorEl.textContent = pp.toFixed(1);
    }

    let necesario;
    if (soloExam) {
        // NF = (EP + 2·EF) / 3
        necesario = modo === 'EP'
            ? (3 * metaFinal) - (2 * valorConocida)      // EF conocido -> calcular EP
            : ((3 * metaFinal) - valorConocida) / 2;     // EP conocido -> calcular EF
    } else if (esDobleEF) {
        // NF = (PP + EP + 2·EF) / 4
        necesario = modo === 'EP'
            ? (4 * metaFinal) - pp - (2 * valorConocida)     // EF conocido -> calcular EP
            : ((4 * metaFinal) - pp - valorConocida) / 2;    // EP conocido -> calcular EF
    } else {
        // NF = (PP + EP + EF) / 3 (simétrico, misma fórmula para ambos modos)
        necesario = (3 * metaFinal) - pp - valorConocida;
    }

    if (necesario > 20) {
        resultadoEl.textContent = '⚠️ Meta no alcanzable con estos supuestos';
        resultadoEl.classList.add('meta-no-alcanzable');
    } else {
        resultadoEl.textContent = Math.max(0, necesario).toFixed(1);
        resultadoEl.classList.remove('meta-no-alcanzable');
    }

    guardarMetaCurso(cursoId, { metaFinal, modo, pp, conocida: valorConocida });
}

function guardarMetaCurso(cursoId, datos) {
    const guardadas = localStorage.getItem('intranotas_metas');
    const metas = guardadas ? JSON.parse(guardadas) : {};
    metas[cursoId] = datos;
    localStorage.setItem('intranotas_metas', JSON.stringify(metas));
}

function cargarMetasGuardadas() {
    const guardadas = localStorage.getItem('intranotas_metas');
    if (!guardadas) return;
    const metas = JSON.parse(guardadas);
    cursosSeleccionados.forEach(curso => {
        const datos = metas[curso.id];
        if (!datos) return;

        const metaEl = document.getElementById(`meta-final-${curso.id}`);
        if (metaEl && datos.metaFinal != null) metaEl.value = datos.metaFinal;

        if (datos.modo === 'EF') {
            cambiarModoMeta(curso.id, 'EF'); // regenera los sliders en modo EF antes de restaurar valores
        }

        const ppEl = document.getElementById(`meta-pp-${curso.id}`);
        if (ppEl && datos.pp != null) ppEl.value = datos.pp;

        const conocidaEl = document.getElementById(`meta-conocida-${curso.id}`);
        if (conocidaEl && datos.conocida != null) conocidaEl.value = datos.conocida;
    });
}

function limpiarMetasCursosNoSeleccionados() {
    const guardadas = localStorage.getItem('intranotas_metas');
    if (!guardadas) return;
    const metas = JSON.parse(guardadas);
    const ids = cursosSeleccionados.map(c => c.id);
    const filtradas = {};
    Object.keys(metas).forEach(id => { if (ids.includes(id)) filtradas[id] = metas[id]; });
    localStorage.setItem('intranotas_metas', JSON.stringify(filtradas));
}

function togglePanelNotas(cursoId) {
    const panel = document.getElementById(`panel-${cursoId}`);
    const estabAbierto = panel.classList.contains('abierto');
    document.querySelectorAll('.panel-notas').forEach(p => p.classList.remove('abierto'));
    if (!estabAbierto) panel.classList.add('abierto');
}

function moverFoco(event, cursoId, compActual) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const curso = cursosSeleccionados.find(c => c.id === cursoId);
    const index = curso.components.indexOf(compActual);
    if (index < curso.components.length - 1) {
        const sig = document.getElementById(`input-${cursoId}-${curso.components[index + 1]}`);
        if (sig) sig.focus();
    }
}

/* ============================================================
   VALIDACIÓN DE NOTAS (0–20)
   ============================================================ */
function validarNota(input) {
    let val = parseFloat(input.value);
    if (input.value === '' || input.value === '-') return;
    if (isNaN(val) || val < 0) { input.value = 0; return; }
    if (val > 20) { input.value = 20; return; }
    // Truncar a máximo 2 decimales para evitar valores raros
    input.value = Math.round(val * 100) / 100;
}

/* ============================================================
   FUNCIONES MATEMÁTICAS BASE
   ============================================================ */
function truncar(valor, decimales) {
    if (valor === null || isNaN(valor)) return null;
    const f = Math.pow(10, decimales);
    return Math.trunc(valor * f) / f;
}

function manejarVacio(v) {
    return (v === null || isNaN(v) || v === '') ? 0 : parseFloat(v);
}

/* ============================================================
   CÁLCULO DE PROMEDIOS DE PC
   ============================================================ */
function calcularPromPCComun(pc1, pc2, pc3, pc4) {
    const notas = [pc1, pc2, pc3, pc4].map(manejarVacio);
    return truncar((notas.reduce((a, b) => a + b, 0) - Math.min(...notas)) / 3, 3);
}

function calcularPromPCSolo6(pc1, pc2, pc3, pc4, pc5, pc6) {
    const notas = [pc1, pc2, pc3, pc4, pc5, pc6].map(manejarVacio);
    return truncar((notas.reduce((a, b) => a + b, 0) - Math.min(...notas)) / 5, 3);
}

function calcularPromPCRedaccion(pc1, pc2, pc3, pc4, mon1, mon2) {
    const pcs = [pc1, pc2, pc3, pc4].map(manejarVacio);
    const mons = [mon1, mon2].map(manejarVacio);
    return truncar((pcs.reduce((a, b) => a + b, 0) - Math.min(...pcs) + mons.reduce((a, b) => a + b, 0)) / 5, 3);
}

function calcularPromPC4PC1Mon(pc1, pc2, pc3, pc4, mon1) {
    const pcs = [pc1, pc2, pc3, pc4].map(manejarVacio);
    return truncar((pcs.reduce((a, b) => a + b, 0) - Math.min(...pcs) + manejarVacio(mon1)) / 4, 3);
}

function calcularPromPCSistemasBlandos(pc1, mon1, mon2) {
    return truncar((manejarVacio(pc1) + manejarVacio(mon1) + manejarVacio(mon2)) / 3, 3);
}

function calcularPromPCTCSEspecial(pc1, pc2, mon1, mon2) {
    return truncar([pc1, pc2, mon1, mon2].map(manejarVacio).reduce((a, b) => a + b, 0) / 4, 3);
}
function calcularPromPCArqEmpresarial(pc1, pc2, pc3, mon1) {
    const pcs = [pc1, pc2, pc3].map(manejarVacio);
    const tienePCs = [pc1, pc2, pc3].some(p => p !== null && p !== '' && !isNaN(p));
    const tieneMon = mon1 !== null && mon1 !== '' && !isNaN(mon1);
    if (!tienePCs && !tieneMon) return null;
    return truncar((pcs.reduce((a, b) => a + b, 0) + manejarVacio(mon1)) / 4, 3);
}
function calcularPromPCBiologico(pc_raw, mon1) {
    const pcs = pc_raw.map(manejarVacio);
    return truncar((pcs.reduce((a, b) => a + b, 0) - Math.min(...pcs) + manejarVacio(mon1)) / 5, 3);
}

function calcularPromPCQuimica(pc_raw, lab_raw) {
    const pcs = pc_raw.map(manejarVacio);
    const labs = [...lab_raw.map(manejarVacio)].sort((a, b) => a - b);
    return truncar((pcs.reduce((a, b) => a + b, 0) - Math.min(...pcs) + labs.slice(2).reduce((a, b) => a + b, 0)) / 9, 3);
}

function calcularPromPCFisica(pc_raw, lab_raw) {
    const pcs = pc_raw.map(manejarVacio);
    const labs = lab_raw.map(manejarVacio);
    return truncar((pcs.reduce((a, b) => a + b, 0) - Math.min(...pcs) + labs.reduce((a, b) => a + b, 0) - Math.min(...labs)) / 8, 3);
}

function calcularPromPCPsicologia(pc1, pc2, pc3, pc4, mon1) {
    const pcsRaw = [pc1, pc2, pc3, pc4];
    const validas = pcsRaw.filter(p => p !== null && p !== '' && !isNaN(p));
    const tieneMon = mon1 !== null && mon1 !== '' && !isNaN(mon1);
    if (!validas.length && !tieneMon) return null;
    const pcsNum = validas.map(p => parseFloat(p));
    const mon = manejarVacio(mon1);
    if (tieneMon) {
        const sumPC = validas.length === 4
            ? pcsNum.reduce((a, b) => a + b, 0) - Math.min(...pcsNum)
            : pcsNum.reduce((a, b) => a + b, 0);
        return truncar((sumPC + mon) / 4, 3);
    } else {
        if (!validas.length) return null;
        const sumPC = validas.length === 4
            ? pcsNum.reduce((a, b) => a + b, 0) - Math.min(...pcsNum)
            : pcsNum.reduce((a, b) => a + b, 0);
        return truncar(sumPC / 3, 3);
    }
}

function calcularPromPCTeoriaOrganizacional(pc1, pc2, pc3, pc4, mon1, mon2) {
    const pcsRaw = [pc1, pc2, pc3, pc4];
    const validas = pcsRaw.filter(p => p !== null && p !== '' && !isNaN(p));
    const m1ok = mon1 !== null && mon1 !== '' && !isNaN(mon1);
    const m2ok = mon2 !== null && mon2 !== '' && !isNaN(mon2);
    if (!validas.length && !m1ok && !m2ok) return null;
    const pcsNum = validas.map(p => parseFloat(p));
    const sumMon = manejarVacio(mon1) + manejarVacio(mon2);
    const sumPC = validas.length === 4
        ? pcsNum.reduce((a, b) => a + b, 0) - Math.min(...pcsNum)
        : pcsNum.reduce((a, b) => a + b, 0);
    return truncar((sumPC + sumMon) / 5, 3);
}

/* ============================================================
   SUSTITUTORIO Y NOTAS FINALES
   ============================================================ */
function aplicarSustitutorio(ep_raw, ef_raw, es_raw) {
    let EP = manejarVacio(ep_raw), EF = manejarVacio(ef_raw);
    if (es_raw === null || es_raw === '' || es_raw === undefined) return { ep_final: EP, ef_final: EF };
    const ES = manejarVacio(es_raw);
    if (EP <= EF) EP = ES; else EF = ES;
    return { ep_final: EP, ef_final: EF };
}

function calcularNotaFinalEstandar(prom_pc, ep, ef, es) {
    if (prom_pc === null) return null;
    const { ep_final, ef_final } = aplicarSustitutorio(ep, ef, es);
    return truncar((manejarVacio(prom_pc) + ep_final + ef_final) / 3, 1);
}

function calcularNotaFinalDobleEF(prom_pc, ep, ef, es) {
    if (prom_pc === null) return null;
    const { ep_final, ef_final } = aplicarSustitutorio(ep, ef, es);
    return truncar((manejarVacio(prom_pc) + ep_final + 2 * ef_final) / 4, 1);
}

function calcularNotaFinalSoloPC(prom_pc) {
    return prom_pc === null ? null : truncar(prom_pc, 1);
}

function calcularNotaFinalSoloExamenes(ep, ef, es) {
    const { ep_final, ef_final } = aplicarSustitutorio(ep, ef, es);
    return truncar((ep_final + 2 * ef_final) / 3, 1);
}/* ============================================================
   SIMULADOR "¿QUÉ NOTA NECESITO?"
   ============================================================ */
function calcularNotaNecesaria(curso, prom_pc, ep, ef, es, notaFinalReal) {
    const meta = 10;
    const simulador = document.getElementById(`simulador-${curso.id}`);
    const contenido = document.getElementById(`simulador-contenido-${curso.id}`);
    if (!simulador || !contenido) return;

    const esDobleEF = FORMULAS_DOBLE_EF.includes(curso.formula_type);
    const soloPC = FORMULAS_SOLO_PC.includes(curso.formula_type);
    const soloExam = FORMULAS_SOLO_EXAMENES.includes(curso.formula_type);

    let html = '';

    // Cursos solo PC
    if (soloPC) {
        if (prom_pc === null) { simulador.style.display = 'none'; return; }
        html = prom_pc >= meta
            ? `<div class="simulador-mensaje-ok">✅ ¡Ya aprobaste! Tu promedio es ${prom_pc.toFixed(1)}</div>`
            : `<div class="simulador-fila"><span class="simulador-label">Necesitas subir tu Prom. PC a:</span><span class="simulador-valor">${meta.toFixed(1)}</span></div>`;
        simulador.style.display = 'block';
        contenido.innerHTML = html;
        return;
    }

    // Cursos solo exámenes (criterio B)
    if (soloExam) {
        const tieneEP = ep !== null && ep !== '' && !isNaN(ep);
        const tieneEF = ef !== null && ef !== '' && !isNaN(ef);
        const tieneES = es !== null && es !== '' && !isNaN(es);
        const epVal = manejarVacio(ep), efVal = manejarVacio(ef);

        if (tieneES) {
            html = notaFinalReal >= meta
                ? `<div class="simulador-mensaje-ok">✅ ¡Aprobaste con ${notaFinalReal.toFixed(1)}!</div>`
                : `<div class="simulador-fila" style="background:#7f1d1d;border-radius:6px;padding:10px;text-align:center;"><span class="simulador-label" style="color:#fff;font-weight:700;">❌ Curso desaprobado con ${notaFinalReal.toFixed(1)}</span></div>`;
        } else if (tieneEP && tieneEF) {
            const nota = truncar((epVal + 2 * efVal) / 3, 1);
            if (nota >= meta) {
                html = `<div class="simulador-mensaje-ok">✅ ¡Ya aprobaste con ${nota.toFixed(1)}!</div>`;
            } else {
                const esNec = Math.ceil(((meta * 3) - Math.max(epVal, efVal)) * 10) / 10;
                html = `<div class="simulador-fila" style="background:#fef3c7;border-radius:6px;padding:8px;margin-bottom:8px;"><span class="simulador-label" style="color:#d97706;">⚠️ Nota actual: ${nota.toFixed(1)} (desaprobado)</span></div>`;
                html += esNec <= 20
                    ? `<div class="simulador-fila"><span class="simulador-label">Con ES necesitas mínimo:</span><span class="simulador-valor">${esNec.toFixed(1)}</span></div>`
                    : `<div class="simulador-fila" style="background:#fee2e2;border-radius:6px;padding:8px;"><span class="simulador-label" style="color:#dc2626;">No es posible aprobar con sustitutorio</span></div>`;
            }
        } else if (tieneEP) {
            const efNec = Math.ceil(((meta * 3) - epVal) / 2 * 10) / 10;
            html = efNec <= 20
                ? `<div class="simulador-fila"><span class="simulador-label">Para aprobar necesitas en EF mínimo:</span><span class="simulador-valor">${efNec.toFixed(1)}</span></div>`
                : `<div class="simulador-fila" style="background:#fee2e2;border-radius:6px;padding:8px;"><span class="simulador-label" style="color:#dc2626;">Necesitarás el sustitutorio para aprobar</span></div>`;
        } else {
            html = `<div class="simulador-fila"><span class="simulador-label">Si sacas EP = 10:</span><span class="simulador-valor">EF mínimo = 10.0</span></div>`;
        }
        simulador.style.display = 'block';
        contenido.innerHTML = html;
        return;
    }

    // Cursos con PC + exámenes
    if (prom_pc === null) { simulador.style.display = 'none'; return; }

    const tieneEP = ep !== null && ep !== '' && !isNaN(ep);
    const tieneEF = ef !== null && ef !== '' && !isNaN(ef);
    const tieneES = es !== null && es !== '' && !isNaN(es);
    const epVal = manejarVacio(ep), efVal = manejarVacio(ef);

    if (tieneES) {
        html = notaFinalReal !== null && notaFinalReal >= meta
            ? `<div class="simulador-mensaje-ok">✅ ¡Aprobaste con ${notaFinalReal.toFixed(1)}!</div>`
            : `<div class="simulador-fila" style="background:#7f1d1d;border-radius:6px;padding:10px;text-align:center;"><span class="simulador-label" style="color:#fff;font-weight:700;">❌ Curso desaprobado con ${notaFinalReal.toFixed(1)}</span></div>`;
    } else if (tieneEP && tieneEF) {
        const nota = esDobleEF
            ? truncar((prom_pc + epVal + 2 * efVal) / 4, 1)
            : truncar((prom_pc + epVal + efVal) / 3, 1);
        if (nota >= meta) {
            html = `<div class="simulador-mensaje-ok">✅ ¡Ya aprobaste con ${nota.toFixed(1)}!</div>`;
        } else {
            let esNec = esDobleEF
                ? (epVal <= efVal ? (meta * 4) - prom_pc - 2 * efVal : ((meta * 4) - prom_pc - epVal) / 2)
                : (meta * 3) - prom_pc - Math.max(epVal, efVal);
            esNec = Math.ceil(esNec * 10) / 10;
            html = `<div class="simulador-fila" style="background:#fef3c7;border-radius:6px;padding:8px;margin-bottom:8px;"><span class="simulador-label" style="color:#d97706;">⚠️ Nota actual: ${nota.toFixed(1)} (desaprobado)</span></div>`;
            html += esNec <= 0
                ? `<div class="simulador-fila"><span class="simulador-label">¡Con cualquier nota en ES apruebas!</span><span class="simulador-valor">0+</span></div>`
                : esNec <= 20
                    ? `<div class="simulador-fila"><span class="simulador-label">Con ES necesitas mínimo:</span><span class="simulador-valor">${esNec.toFixed(1)}</span></div>`
                    : `<div class="simulador-fila" style="background:#fee2e2;border-radius:6px;padding:8px;"><span class="simulador-label" style="color:#dc2626;">No es posible aprobar con sustitutorio</span></div>`;
        }
    } else if (tieneEP) {
        let efNec = esDobleEF
            ? ((meta * 4) - prom_pc - epVal) / 2
            : (meta * 3) - prom_pc - epVal;
        efNec = Math.ceil(efNec * 10) / 10;
        html = efNec <= 0
            ? `<div class="simulador-fila"><span class="simulador-label">¡Con cualquier nota en EF apruebas!</span><span class="simulador-valor">0+</span></div>`
            : efNec <= 20
                ? `<div class="simulador-fila"><span class="simulador-label">Para aprobar necesitas en EF mínimo:</span><span class="simulador-valor">${efNec.toFixed(1)}</span></div>`
                : `<div class="simulador-fila" style="background:#fee2e2;border-radius:6px;padding:8px;"><span class="simulador-label" style="color:#dc2626;">Necesitarás el sustitutorio para aprobar</span></div>`;
    } else {
        const sugerencias = [8, 10, 12, 14, 16, 18, 20].reduce((acc, epS) => {
            if (acc.length >= 3) return acc;
            const efN = esDobleEF ? ((meta * 4) - prom_pc - epS) / 2 : (meta * 3) - prom_pc - epS;
            const efC = Math.ceil(efN * 10) / 10;
            if (efC >= 0 && efC <= 20) acc.push({ ep: epS, ef: efC });
            return acc;
        }, []);
        html = sugerencias.length === 0
            ? `<div class="simulador-fila" style="background:#fee2e2;border-radius:6px;padding:10px;text-align:center;"><span class="simulador-label" style="color:#dc2626;">Necesitas mejorar tu Prom. PC para poder aprobar</span></div>`
            : sugerencias.map(s => `<div class="simulador-fila"><span class="simulador-label">Si sacas EP = ${String(s.ep).padStart(2, '0')}:</span><span class="simulador-valor">EF mínimo = ${s.ef.toFixed(1)}</span></div>`).join('');
    }

    simulador.style.display = 'block';
    contenido.innerHTML = html;
}

/* ============================================================
   ACTUALIZACIÓN DE ESTADOS DE TARJETAS
   ============================================================ */
function actualizarEstadoCurso(cursoId, notaFinal, tieneNotas, evaluacionesCompletas) {
    const tarjeta = document.getElementById(`tarjeta-${cursoId}`);
    const badge = document.getElementById(`badge-${cursoId}`);
    if (!tarjeta || !badge) return;

    tarjeta.classList.remove('aprobado', 'en-riesgo', 'critico', 'pendiente', 'desaprobado');
    badge.className = 'badge-estado';
    badge.style.display = 'none';

    if (!tieneNotas || notaFinal === null) {
        tarjeta.classList.add('pendiente');
        badge.classList.add('badge-pendiente');
        badge.textContent = '📝 Pendiente';
        badge.style.display = 'inline';
        return;
    }

    if (notaFinal >= 10) {
        tarjeta.classList.add('aprobado');
        badge.classList.add('badge-aprobado');
        badge.textContent = '✓ Aprobado';
    } else if (evaluacionesCompletas) {
        tarjeta.classList.add('desaprobado');
        badge.classList.add('badge-desaprobado');
        badge.textContent = '❌ Desaprobado';
    } else if (notaFinal >= 7) {
        tarjeta.classList.add('en-riesgo');
        badge.classList.add('badge-riesgo');
        badge.textContent = '⚠️ En riesgo';
    } else {
        tarjeta.classList.add('critico');
        badge.classList.add('badge-critico');
        badge.textContent = '🚨 Crítico';
    }
    badge.style.display = 'inline';
}

function actualizarBannerAlertas(enRiesgo, desaprobados) {
    const banner = document.getElementById('banner-alertas');
    const lista = document.getElementById('lista-alertas');
    if (!banner || !lista) return;

    if (!enRiesgo.length && !desaprobados.length) { banner.classList.remove('visible'); return; }

    let html = '';
    if (desaprobados.length) {
        html += `<div style="font-weight:700;color:#dc2626;margin-bottom:4px;">❌ Desaprobados:</div>`;
        html += desaprobados.map(c => `<div class="banner-alertas-item" style="color:#dc2626;">• ${c.name} - Nota final: ${c.nota.toFixed(1)}</div>`).join('');
    }
    if (enRiesgo.length) {
        if (desaprobados.length) html += `<div style="margin-top:8px;"></div>`;
        html += `<div style="font-weight:700;color:#d97706;margin-bottom:4px;">⚠️ En riesgo:</div>`;
        html += enRiesgo.map(c => `<div class="banner-alertas-item">• ${c.name} - Promedio: ${c.nota.toFixed(1)}</div>`).join('');
    }
    lista.innerHTML = html;
    banner.classList.add('visible');
}

/* ============================================================
   MOTOR DE CÁLCULOS PRINCIPAL
   ============================================================ */
function calcularTodo() {
    let sumaPonderada = 0, sumaCreditos = 0;
    let cursosEnRiesgo = [], cursosDesaprobados = [];

    cursosSeleccionados.forEach(curso => {
        const gn = comp => {
            const el = document.getElementById(`input-${curso.id}-${comp}`);
            if (!el) return null;
            const v = el.value.trim();
            return v === '' ? null : parseFloat(v);
        };

        const pc = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6'].map(gn);
        const lab = ['Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'Lab6', 'Lab7', 'Lab8'].map(gn);
        const mon = ['Monografia1', 'Monografia2'].map(gn);
        const ep = gn('EP'), ef = gn('EF'), es = gn('ES');

        const tieneNotas = [...pc, ...lab, ...mon, ep, ef, es].some(n => n !== null);
        const tieneES = es !== null && es !== '' && !isNaN(es);

        const soloPC = FORMULAS_SOLO_PC.includes(curso.formula_type);
        const soloExam = FORMULAS_SOLO_EXAMENES.includes(curso.formula_type);
        const evaluacionesCompletas = tieneES || (soloPC && tieneNotas) || (soloExam && tieneES);

        let prom_pc = null, nota_final = null;

        switch (curso.formula_type) {
            case 'REDACCION_BASE':
            case 'REALIDAD_NACIONAL':
                prom_pc = calcularPromPCRedaccion(pc[0], pc[1], pc[2], pc[3], mon[0], mon[1]);
                nota_final = calcularNotaFinalSoloPC(prom_pc); break;

            case 'ETICA':
            case 'METODOLOGIA_INV':
                prom_pc = calcularPromPC4PC1Mon(pc[0], pc[1], pc[2], pc[3], mon[0]);
                nota_final = calcularNotaFinalSoloPC(prom_pc); break;

            case 'SOLO_PC':
            case 'REALIDAD_NACIONAL_4PC':
                prom_pc = calcularPromPCComun(pc[0], pc[1], pc[2], pc[3]);
                nota_final = calcularNotaFinalSoloPC(prom_pc); break;

            case 'SOLO_PC_6':
                prom_pc = calcularPromPCSolo6(pc[0], pc[1], pc[2], pc[3], pc[4], pc[5]);
                nota_final = calcularNotaFinalSoloPC(prom_pc); break;

            case 'SOLO_EXAMENES':
                prom_pc = null;
                nota_final = calcularNotaFinalSoloExamenes(ep, ef, es); break;

            case 'QUIMICA':
                prom_pc = calcularPromPCQuimica(pc.slice(0, 4), lab);
                nota_final = calcularNotaFinalDobleEF(prom_pc, ep, ef, es); break;

            case 'COMPUTACION_1_1_2':
            case 'ALGORITMIA':
                prom_pc = calcularPromPCComun(pc[0], pc[1], pc[2], pc[3]);
                nota_final = calcularNotaFinalDobleEF(prom_pc, ep, ef, es); break;

            case 'FISICA_I':
                prom_pc = calcularPromPCFisica(pc.slice(0, 5), lab.slice(0, 5));
                nota_final = calcularNotaFinalDobleEF(prom_pc, ep, ef, es); break;

            case 'FISICA_II':
                prom_pc = calcularPromPCFisica(pc.slice(0, 5), lab.slice(0, 5));
                nota_final = calcularNotaFinalEstandar(prom_pc, ep, ef, es); break;

            case 'ESTANDAR_1_1_1':
            case 'ALGEBRA':
                prom_pc = calcularPromPCComun(pc[0], pc[1], pc[2], pc[3]);
                nota_final = calcularNotaFinalEstandar(prom_pc, ep, ef, es);
                break;

            case 'PSICOLOGIA':
                prom_pc = calcularPromPCPsicologia(pc[0], pc[1], pc[2], pc[3], mon[0]);
                nota_final = calcularNotaFinalEstandar(prom_pc, ep, ef, es); break;

            case 'BIOLOGICO':
                prom_pc = calcularPromPCBiologico(pc.slice(0, 5), mon[0]);
                nota_final = calcularNotaFinalEstandar(prom_pc, ep, ef, es); break;

            case 'MODELADO_DATOS':
            case 'INGENIERIA_DATOS':
                prom_pc = calcularPromPC4PC1Mon(pc[0], pc[1], pc[2], pc[3], mon[0]);
                nota_final = calcularNotaFinalDobleEF(prom_pc, ep, ef, es); break;

            case 'TEORIA_ORGANIZACIONAL':
                prom_pc = calcularPromPCTeoriaOrganizacional(pc[0], pc[1], pc[2], pc[3], mon[0], mon[1]);
                nota_final = calcularNotaFinalDobleEF(prom_pc, ep, ef, es); break;

            case 'TCS':
                prom_pc = calcularPromPCRedaccion(pc[0], pc[1], pc[2], pc[3], mon[0], mon[1]);
                nota_final = calcularNotaFinalDobleEF(prom_pc, ep, ef, es); break;

            case 'TCS_APLICADA':
                prom_pc = calcularPromPCTCSEspecial(pc[0], pc[1], mon[0], mon[1]);
                nota_final = calcularNotaFinalEstandar(prom_pc, ep, ef, es); break;

            case 'SISTEMAS_BLANDOS':
                prom_pc = calcularPromPCSistemasBlandos(pc[0], mon[0], mon[1]);
                nota_final = calcularNotaFinalEstandar(prom_pc, ep, ef, es); break;

            case 'ARQ_EMPRESARIAL':
                prom_pc = calcularPromPCArqEmpresarial(pc[0], pc[1], pc[2], mon[0]);
                nota_final = calcularNotaFinalDobleEF(prom_pc, ep, ef, es); break;

            default:
                prom_pc = calcularPromPCComun(pc[0], pc[1], pc[2], pc[3]);
                nota_final = calcularNotaFinalEstandar(prom_pc, ep, ef, es);
        }

        // Prom PC display
        const promPCEl = document.getElementById(`prom-pc-${curso.id}`);
        if (promPCEl) {
            if (prom_pc !== null) {
                promPCEl.textContent = prom_pc.toFixed(3);
                promPCEl.classList.add('tiene-valor');
                promPCEl.style.color = prom_pc >= 10 ? '#2196f3' : '#ef4444';
                promPCEl.style.backgroundColor = prom_pc >= 10 ? '#dbeafe' : '#fee2e2';
            } else {
                promPCEl.textContent = '--';
                promPCEl.classList.remove('tiene-valor');
                promPCEl.style.color = '#1f2937';
                promPCEl.style.backgroundColor = '#e2e8f0';
            }
        }

        // Nota final display
        const notaEl = document.getElementById(`promedio-${curso.id}`);
        if (notaEl) {
            if (nota_final !== null) {
                notaEl.textContent = nota_final.toFixed(1);
                notaEl.classList.add('tiene-valor');
                notaEl.style.color = nota_final >= 10 ? '#2196f3' : '#ef4444';
            } else {
                notaEl.textContent = '--';
                notaEl.classList.remove('tiene-valor');
                notaEl.style.color = '#d1d5db';
            }
        }

        actualizarEstadoCurso(curso.id, nota_final, tieneNotas, evaluacionesCompletas);
        calcularNotaNecesaria(curso, prom_pc, ep, ef, es, nota_final);

        if (tieneNotas && nota_final !== null && nota_final < 10) {
            if (evaluacionesCompletas) cursosDesaprobados.push({ name: curso.name, nota: nota_final });
            else cursosEnRiesgo.push({ name: curso.name, nota: nota_final });
        }

        if (nota_final !== null) {
            sumaPonderada += nota_final * curso.credits;
            sumaCreditos += curso.credits;
        }
    });

    actualizarBannerAlertas(cursosEnRiesgo, cursosDesaprobados);

    const ponderadoEl = document.getElementById('ponderado-ciclo');
    if (ponderadoEl) {
        if (sumaCreditos > 0) {
            const p = truncar(sumaPonderada / sumaCreditos, 3);
            ponderadoEl.textContent = p.toFixed(3);
            ponderadoEl.style.color = p >= 10 ? '#2196f3' : '#ef4444';
        } else {
            ponderadoEl.textContent = '--';
            ponderadoEl.style.color = '#2196f3';
        }
    }
}

/* ============================================================
   PERSISTENCIA EN LOCALSTORAGE (por periodo — ver leerDatosPeriodos)
   ============================================================ */
function guardarConfiguracion() {
    const datos = leerDatosPeriodos();
    const notasPrevias = (datos[periodoSeleccionado] && datos[periodoSeleccionado].notas) || {};
    const ids = cursosSeleccionados.map(c => c.id);
    const notasFiltradas = {};
    Object.keys(notasPrevias).forEach(id => { if (ids.includes(id)) notasFiltradas[id] = notasPrevias[id]; });

    datos[periodoSeleccionado] = {
        carrera: carreraSeleccionada,
        cursos: cursosSeleccionados,
        notas: notasFiltradas,
    };
    localStorage.setItem(claveUltimoPeriodo(), periodoSeleccionado);
    guardarDatosPeriodos(datos);
    limpiarMetasCursosNoSeleccionados();
}

function guardarNotas() {
    const datos = leerDatosPeriodos();
    if (!datos[periodoSeleccionado]) {
        datos[periodoSeleccionado] = { carrera: carreraSeleccionada, cursos: cursosSeleccionados, notas: {} };
    }
    const notas = {};
    cursosSeleccionados.forEach(curso => {
        notas[curso.id] = {};
        curso.components.forEach(comp => {
            const el = document.getElementById(`input-${curso.id}-${comp}`);
            if (el) notas[curso.id][comp] = el.value.trim();
        });
    });
    datos[periodoSeleccionado].notas = notas;
    datos[periodoSeleccionado].cursos = cursosSeleccionados;
    localStorage.setItem(claveUltimoPeriodo(), periodoSeleccionado);
    guardarDatosPeriodos(datos);
    mostrarToast('✅ Notas guardadas correctamente');
}

function cargarNotasGuardadas() {
    const datos = leerDatosPeriodos();
    const entrada = datos[periodoSeleccionado];
    if (!entrada || !entrada.notas) return;
    const ids = cursosSeleccionados.map(c => c.id);
    Object.keys(entrada.notas).forEach(cursoId => {
        if (!ids.includes(cursoId)) return;
        Object.keys(entrada.notas[cursoId]).forEach(comp => {
            const el = document.getElementById(`input-${cursoId}-${comp}`);
            if (el) el.value = entrada.notas[cursoId][comp];
        });
    });
    calcularTodo();
}

/* ============================================================
   SELECTOR DE PERIODOS GUARDADOS (Pantalla 4)
   Deja saltar entre cualquier periodo que ya tenga datos guardados,
   sin perder lo que había en cada uno. Se reinicializa en cada
   render (a diferencia del de Pantalla 3) porque generarSimulador()
   reconstruye #contenedor-simulador entero cada vez — el trigger y
   la lista son nodos nuevos, así que no hay listeners duplicados.
   ============================================================ */
function cargarSelectorPeriodosGuardados() {
    const datos = leerDatosPeriodos();
    const periodosConDatos = Object.keys(datos).sort().reverse();
    if (periodoSeleccionado && !periodosConDatos.includes(periodoSeleccionado)) periodosConDatos.unshift(periodoSeleccionado);

    const instancia = inicializarSelectPersonalizado({
        triggerId: 'periodoGuardadoTrigger', textoId: 'periodoGuardadoTriggerTexto',
        listaId: 'periodoGuardadoLista', valorId: 'periodoGuardadoValor',
        opciones: periodosConDatos.map(p => ({ value: p, label: formatoPeriodoCorto(p) })),
        alElegir: (valor) => cambiarPeriodoGuardado(valor),
    });
    if (instancia) instancia.establecer(periodoSeleccionado, formatoPeriodoCorto(periodoSeleccionado));
}

function cambiarPeriodoGuardado(periodo) {
    if (periodo === periodoSeleccionado) return;
    const datos = leerDatosPeriodos();
    const entrada = datos[periodo];
    if (!entrada || !entrada.cursos || !entrada.cursos.length) {
        mostrarToast('⚠️ No hay cursos guardados en ese periodo');
        return;
    }
    carreraSeleccionada = entrada.carrera;
    cursosSeleccionados = entrada.cursos;
    periodoSeleccionado = periodo;
    generarSimulador();

    desmarcarTodosLosCursos();
    marcarCursosSeleccionadosEnUI();
}

function limpiarTodo() {
    document.getElementById('modal-overlay').classList.add('visible');
}

function cerrarModal() {
    document.getElementById('modal-overlay').classList.remove('visible');
}

function confirmarLimpiarTodo() {
    cerrarModal();
    cursosSeleccionados.forEach(curso => {
        curso.components.forEach(comp => {
            const el = document.getElementById(`input-${curso.id}-${comp}`);
            if (el) el.value = '';
        });
    });
    const datos = leerDatosPeriodos();
    if (datos[periodoSeleccionado]) {
        datos[periodoSeleccionado].notas = {};
        guardarDatosPeriodos(datos);
    }
    calcularTodo();
    mostrarToast('🗑️ Todas las notas han sido borradas');
}

function limpiarNotasCurso(cursoId) {
    const curso = cursosSeleccionados.find(c => c.id === cursoId);
    if (!curso) return;
    curso.components.forEach(comp => {
        const el = document.getElementById(`input-${cursoId}-${comp}`);
        if (el) el.value = '';
    });
    const datos = leerDatosPeriodos();
    if (datos[periodoSeleccionado] && datos[periodoSeleccionado].notas) {
        delete datos[periodoSeleccionado].notas[cursoId];
        guardarDatosPeriodos(datos);
    }
    calcularTodo();
    mostrarToast('🗑️ Notas del curso borradas');
}

/* ============================================================
   NUEVO PERIODO (botón pantalla 3 y pantalla 4)
   Ya NO borra ningún dato guardado — cada periodo vive aparte en
   intranotas_datos_periodos. Esto solo limpia la pantalla (cursos
   marcados, periodo elegido) para que armes el siguiente periodo
   desde cero. La carrera se mantiene; si alguna vez sí necesitas
   cambiar de carrera, para eso está "← Cambiar carrera".
   ============================================================ */
function iniciarNuevoPeriodo() {
    document.getElementById('modal-reset-overlay').classList.add('visible');
}

function cerrarModalReset() {
    document.getElementById('modal-reset-overlay').classList.remove('visible');
}

function confirmarNuevoPeriodo() {
    cerrarModalReset();
    cursosSeleccionados = [];
    periodoSeleccionado = null;

    irAPantalla(3);
    mostrarBloquePeriodoCursos(true);
    mostrarSelectorCarrera(false);
    desmarcarTodosLosCursos();
    generarOpcionesPeriodo();

    mostrarToast('🔄 Elige el periodo y los cursos que quieres guardar');
}

/* ============================================================
   ELIMINAR UN PERIODO GUARDADO ESPECÍFICO
   Distinto de "Nuevo periodo" (solo limpia la pantalla actual, sin
   tocar lo guardado) y de "Limpiar todo" (solo borra notas dentro
   del periodo activo, pero el periodo y los cursos se quedan). Esto
   sí saca el periodo entero — cursos y notas — de
   intranotas_datos_periodos.
   ============================================================ */
function iniciarEliminarPeriodo() {
    if (!periodoSeleccionado) return;
    document.getElementById('modal-eliminar-periodo-texto').textContent =
        `Se eliminará por completo el periodo ${formatoPeriodoCorto(periodoSeleccionado)}, con todos sus cursos y notas. No se puede deshacer.`;
    document.getElementById('modal-eliminar-periodo-overlay').classList.add('visible');
}

function cerrarModalEliminarPeriodo() {
    document.getElementById('modal-eliminar-periodo-overlay').classList.remove('visible');
}

function confirmarEliminarPeriodo() {
    cerrarModalEliminarPeriodo();
    if (!periodoSeleccionado) return;

    const datos = leerDatosPeriodos();
    const periodoEliminado = periodoSeleccionado;
    delete datos[periodoEliminado];
    guardarDatosPeriodos(datos);

    const periodosRestantes = Object.keys(datos).sort().reverse();

    if (periodosRestantes.length) {
        // Cambia al periodo más reciente que quede.
        cambiarPeriodoGuardado(periodosRestantes[0]);
    } else {
        // No queda ningún periodo guardado: vuelve a Pantalla 3 desde cero.
        cursosSeleccionados = [];
        periodoSeleccionado = null;
        irAPantalla(3);
        mostrarBloquePeriodoCursos(true);
        mostrarSelectorCarrera(false);
        desmarcarTodosLosCursos();
        generarOpcionesPeriodo();
    }

    mostrarToast(`🗑️ Periodo ${formatoPeriodoCorto(periodoEliminado)} eliminado`);
}

/* ============================================================
   UTILIDADES
   ============================================================ */
function mostrarToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
    /* El tema (Claro/Oscuro/Ocean/Forest) ya no lo maneja este archivo:
       tema-siga.js (compartido con el resto de SIGA) lee data-tema del
       <html> y pinta el widget del nav — Intranotas solo necesita que
       siga-theme-intranotas.css tenga los colores por data-tema, que
       ya los tiene. */
    /* Ya no se registra Service Worker: Intranotas se actualiza igual
       que el resto de SIGA (recarga normal, sin caché propio ni aviso
       de "nueva versión disponible"). Se pierde la función offline a
       cambio de un comportamiento consistente con el resto del portal.
       Esta línea limpia el Service Worker viejo que haya quedado
       instalado de antes (si no se desregistra activamente, se queda
       corriendo indefinidamente aunque el código ya no lo registre). */
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(reg => reg.unregister());
        });
    }
    await inicializarFlagIntralu();
    await intentarRestaurarSesion();
});

/* ============================================================
   RESTAURAR SESIÓN GUARDADA (saltar directo al simulador)
   ============================================================ */
async function intentarRestaurarSesion() {
    try {
        const ultimaMalla = localStorage.getItem(LS_KEY_ULTIMA_MALLA);
        if (!ultimaMalla) return; // Sin malla guardada: se queda en Pantalla 0 (elegir malla)
        mallaSeleccionada = ultimaMalla;
        actualizarResumenMalla();
        filtrarCarrerasPorMalla();

        // Antes de leer localStorage: si hay sesión, trae lo último
        // guardado en la nube (por si otro dispositivo tiene algo más
        // reciente) y pisa el caché local con eso.
        await hidratarDesdeNube();

        const datos = leerDatosPeriodos();
        const ultimoPeriodo = localStorage.getItem(claveUltimoPeriodo());
        if (!ultimoPeriodo || !datos[ultimoPeriodo]) {
            // Ya eligió malla antes pero no tiene periodo guardado en ESA
            // malla: lo llevamos a Pantalla 3 a elegir carrera, no a la 0.
            irAPantalla(3);
            mostrarSelectorCarrera(true);
            return;
        }

        const entrada = datos[ultimoPeriodo];
        if (!entrada.cursos || !Array.isArray(entrada.cursos) || !entrada.cursos.length) return;

        carreraSeleccionada = entrada.carrera;
        periodoSeleccionado = ultimoPeriodo;
        cursosSeleccionados = entrada.cursos;

        // Prepara la Pantalla 3 en segundo plano por si el usuario pulsa "Cambiar cursos"
        actualizarResumenCarrera();
        mostrarSelectorCarrera(false);
        mostrarBloquePeriodoCursos(true);
        generarAcordeones();
        generarOpcionesPeriodo();
        marcarCursosSeleccionadosEnUI();

        // Va directo al simulador con las notas ya cargadas
        irAPantalla(4);
        generarSimulador();
    } catch (e) {
        console.log('No se pudo restaurar la sesión:', e);
    }
}