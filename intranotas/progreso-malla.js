// intranotas/progreso-malla.js
// ============================================================
// 🗺️ PROGRESO DE TU CARRERA — mapa de malla interactivo
//
// A diferencia de Meta del curso (que vive en el panel angosto de
// 380px), esta herramienta se abre como una VENTANA EMERGENTE
// grande centrada sobre toda la web — el panel lateral se queda
// corto para mostrar 10 ciclos completos con legibilidad. En
// celular, esa ventana se vuelve pantalla completa.
//
// GATE DE VISIBILIDAD (temporal): mismo criterio que Asistente de
// Horario — mientras se prueba, el botón de entrada SOLO aparece
// para Harry. Cambiar PROGRESO_MALLA_HABILITADO_PARA_TODOS a `true`
// cuando esté 100% probado, sin tocar nada más de este archivo.
//
// Es un módulo aparte (import propio de auth-siga.js) para no
// depender del orden de carga. Por ser módulo, no comparte el
// scope de intranotas.js — por eso lee sus datos a través de
// funciones expuestas en window (leerDatosPeriodos, cursosSeleccionados,
// periodoSeleccionado, calcularPFCompleto, obtenerComponentesCurso,
// leerValoresActualesCurso), igual patrón que usa asistente-horario.js
// con generador.js.
//
// Requiere que malla-sistemas-2018.js se cargue ANTES que este
// archivo (define window.MALLA_SISTEMAS_2018).
// ============================================================
import { obtenerSesion } from '../js/auth-siga.js?v=9';

const ADMIN_UID_SIGA = 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1';

// 🔒 Flag maestro.
const PROGRESO_MALLA_HABILITADO_PARA_TODOS = false;

async function progresoMallaHabilitado() {
    if (PROGRESO_MALLA_HABILITADO_PARA_TODOS) return true;
    try {
        const sesion = await obtenerSesion();
        return !!(sesion && sesion.user && sesion.user.id === ADMIN_UID_SIGA);
    } catch (e) {
        console.warn('No se pudo verificar sesión para Progreso de tu carrera:', e);
        return false;
    }
}

const PM_ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

let pm_codigoSeleccionado = null;

/* Respaldo por si un periodo guardado (de una versión vieja) no
   trae `.code` en sus cursos — cruza por `.id` contra la base de
   cursos real para no perder ese registro. */
function pm_mapaIdACode() {
    const mapa = {};
    const fuentes = [window.CURSOS_SISTEMAS, window.CURSOS_SISTEMAS_2026];
    fuentes.forEach(fuente => {
        Object.values(fuente || {}).forEach(lista => (lista || []).forEach(c => {
            if (c && c.id && c.code) mapa[c.id] = c.code;
        }));
    });
    return mapa;
}

/* ---------- Cálculo de estados: cruza la malla fija contra el
   historial real del usuario (leerDatosPeriodos), priorizando el
   DOM en vivo para el ciclo que está abierto ahora mismo — mismo
   criterio que ya se usaba en Rendimiento por curso. ---------- */
function pm_construirProgreso() {
    const progreso = {}; // code -> { estado: 'aprobado'|'jalado'|'en_curso', notaFinal, credits }
    const rank = { jalado: 1, en_curso: 2, aprobado: 3 };
    const idACode = pm_mapaIdACode();
    const codigosMalla = new Set(pm_todosLosCursos().map(c => c.code));

    const datos = typeof window.leerDatosPeriodos === 'function' ? window.leerDatosPeriodos() : {};
    Object.keys(datos || {}).forEach(periodo => {
        const entrada = datos[periodo];
        if (!entrada || !Array.isArray(entrada.cursos)) return;
        const esActual = periodo === window.periodoSeleccionado;

        entrada.cursos.forEach(curso => {
            if (!curso) return;
            const code = curso.code || idACode[curso.id];
            // Solo cursos OBLIGATORIOS de la malla — un electivo aprobado
            // no debe inflar "créditos obligatorios" ni el PA acumulado.
            // (Los electivos en sí quedan fuera del mapa por ahora, como
            // ya habíamos acordado.)
            if (!code || !codigosMalla.has(code)) return;

            let valores;
            const enPantalla = esActual && Array.isArray(window.cursosSeleccionados) &&
                window.cursosSeleccionados.some(c => c.id === curso.id);
            if (enPantalla && typeof window.leerValoresActualesCurso === 'function') {
                valores = window.leerValoresActualesCurso(curso);
            } else {
                valores = (entrada.notas && entrada.notas[curso.id]) || {};
            }

            let notaFinal = null, completo = false;
            if (typeof window.calcularPFCompleto === 'function') {
                notaFinal = window.calcularPFCompleto(curso, valores).nota_final;
            }
            if (typeof window.obtenerComponentesCurso === 'function') {
                const { todos } = window.obtenerComponentesCurso(curso);
                completo = todos.length > 0 && todos.every(c => valores[c] !== null && valores[c] !== undefined && valores[c] !== '');
            }

            let estado;
            if (esActual && !completo) estado = 'en_curso';
            else if (notaFinal !== null && notaFinal >= 10) estado = 'aprobado';
            else if (notaFinal !== null && completo) estado = 'jalado';
            else estado = 'en_curso';

            const previo = progreso[code];
            if (!previo || rank[estado] > rank[previo.estado]) {
                progreso[code] = { estado, notaFinal, credits: curso.credits };
            }
        });
    });

    return progreso;
}

/* Si un curso está aprobado o en curso, sus prerrequisitos TUVIERON
   que estar aprobados — la universidad no deja matricular sin
   cumplirlos. Esto rellena los huecos de cuando el usuario solo
   cargó su ciclo más reciente sin backfillear el historial completo:
   recorre hacia atrás desde todo lo aprobado/en curso y marca como
   aprobado (inferido, sin nota) a cualquier prerrequisito que no
   tuviera ya un registro explícito. */
function pm_inferirPorPrerequisitos(progreso) {
    const porCodigo = {};
    pm_todosLosCursos().forEach(c => { porCodigo[c.code] = c; });

    const pila = Object.keys(progreso).filter(code => progreso[code].estado === 'aprobado' || progreso[code].estado === 'en_curso');
    const visitados = new Set(pila);

    while (pila.length) {
        const curso = porCodigo[pila.pop()];
        if (!curso) continue;
        curso.prereq.forEach(p => {
            if (p.tipo !== 'curso' || visitados.has(p.code)) return;
            visitados.add(p.code);
            const existente = progreso[p.code];
            // Un registro aislado "jalado" no pesa más que la prueba de
            // que ahora llevas/aprobaste algo que lo exige — se sube a
            // aprobado (inferido). Lo que SÍ se respeta tal cual es un
            // aprobado o en_curso explícito, que ya es información buena.
            if (!existente || existente.estado === 'jalado') {
                const req = porCodigo[p.code];
                progreso[p.code] = { estado: 'aprobado', notaFinal: null, credits: req ? req.credits : 0, inferido: true };
            }
            pila.push(p.code);
        });
    }
    return progreso;
}

function pm_progresoCompleto() {
    return pm_inferirPorPrerequisitos(pm_construirProgreso());
}

function pm_todosLosCursos() {
    return (window.MALLA_SISTEMAS_2018 || []).flatMap(c => c.cursos);
}

function pm_creditosAprobadosTotal(progreso) {
    return Object.values(progreso).filter(p => p.estado === 'aprobado').reduce((s, p) => s + (p.credits || 0), 0);
}

function pm_prerequisitosCumplidos(curso, progreso) {
    if (!curso.prereq.length) return true;
    return curso.prereq.every(p => {
        if (p.tipo === 'creditos') return pm_creditosAprobadosTotal(progreso) >= p.valor;
        const st = progreso[p.code];
        return !!(st && st.estado === 'aprobado');
    });
}

function pm_seAbreProntoSiApruebas(curso, progreso) {
    return curso.prereq.every(p => {
        if (p.tipo === 'creditos') return true; // no aplica al caso "próximo", se ignora aquí
        const st = progreso[p.code];
        return !!(st && (st.estado === 'aprobado' || st.estado === 'en_curso'));
    });
}

/* estado final por curso: aprobado | en_curso | jalado (tratado como
   "disponible" visualmente — jalar no bloquea reintentar) | proximo |
   disponible | bloqueado */
function pm_estadoCurso(curso, progreso) {
    const propio = progreso[curso.code];
    if (propio && (propio.estado === 'aprobado' || propio.estado === 'en_curso')) return propio.estado;
    if (pm_prerequisitosCumplidos(curso, progreso)) return 'disponible';
    if (pm_seAbreProntoSiApruebas(curso, progreso)) return 'proximo';
    return 'bloqueado';
}

const PM_ESTADO_LABEL = {
    aprobado: 'Aprobado', en_curso: 'En curso', disponible: 'Disponible',
    proximo: 'Se abre pronto', bloqueado: 'Bloqueado',
};

/* ---------- Render del mapa ---------- */
function pm_renderMapa() {
    const progreso = pm_progresoCompleto();
    const malla = window.MALLA_SISTEMAS_2018 || [];

    const creditosAprobados = pm_creditosAprobadosTotal(progreso);
    const totalCreditos = pm_todosLosCursos().reduce((s, c) => s + c.credits, 0);

    let sumaPonderada = 0, sumaCreditos = 0;
    Object.values(progreso).forEach(p => {
        if (p.notaFinal !== null && p.notaFinal !== undefined) { sumaPonderada += p.notaFinal * (p.credits || 0); sumaCreditos += (p.credits || 0); }
    });
    const pa = sumaCreditos > 0 ? Math.trunc((sumaPonderada / sumaCreditos) * 1000) / 1000 : null;

    const ciclosHtml = malla.map(({ ciclo, cursos }) => `
        <div class="pm-ciclo">
            <div class="pm-ciclo-label">Ciclo ${PM_ROMANOS[ciclo - 1]}</div>
            <div class="pm-ciclo-cursos">
                ${cursos.map(c => {
        const estado = pm_estadoCurso(c, progreso);
        const inferido = progreso[c.code] && progreso[c.code].inferido;
        return `
                    <button type="button" class="pm-chip pm-estado-${estado}" data-code="${c.code}" onclick="window.pmSeleccionarCurso('${c.code}')">
                        ${estado === 'bloqueado' ? '<span class="pm-chip-candado" aria-hidden="true">🔒</span>' : ''}
                        ${inferido ? '~' : ''}${c.code}
                    </button>
                `;
    }).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('pm-body').innerHTML = `
        <div class="pm-stats">
            <div class="pm-stat">
                <p class="pm-stat-label">PA acumulado ${sumaCreditos ? '(de tus ciclos cargados en SIGA)' : ''}</p>
                <p class="pm-stat-valor">${pa !== null ? pa.toFixed(3) : '—'}</p>
            </div>
            <div class="pm-stat">
                <p class="pm-stat-label">Créditos obligatorios</p>
                <p class="pm-stat-valor">${creditosAprobados} <span class="pm-stat-de">/ ${totalCreditos}</span></p>
            </div>
        </div>
        <div class="pm-leyenda">
            <span><i class="pm-dot pm-estado-aprobado"></i> Aprobado</span>
            <span><i class="pm-dot pm-estado-en_curso"></i> En curso</span>
            <span><i class="pm-dot pm-estado-proximo"></i> Se abre pronto</span>
            <span><i class="pm-dot pm-estado-disponible"></i> Disponible</span>
            <span>🔒 Bloqueado</span>
        </div>
        <p class="pm-toque-aviso">👆 Toca cualquier curso del mapa para ver sus prerrequisitos y lo que desbloquea. Tócalo de nuevo para cerrar.</p>
        <div class="pm-mapa-wrap" id="pm-mapa-wrap">
            <svg id="pm-svg-conexiones" class="pm-svg-conexiones"></svg>
            <div class="pm-mapa" id="pm-mapa">${ciclosHtml}</div>
        </div>
        <div class="pm-detalle" id="pm-detalle">
            <p class="pm-detalle-vacio">Toca cualquier curso del mapa para ver su detalle.</p>
        </div>
    `;
}

/* ---------- Selección de curso: modo enfoque + conexiones + detalle ---------- */
function pm_obtenerCurso(code) {
    return pm_todosLosCursos().find(c => c.code === code) || null;
}

function pm_obtenerDesbloquea(code) {
    return pm_todosLosCursos().filter(c => c.prereq.some(p => p.tipo === 'curso' && p.code === code));
}

function pm_otrosFaltantes(curso, excluirCode, progreso) {
    return curso.prereq.filter(p => {
        if (p.tipo === 'curso' && p.code === excluirCode) return false;
        if (p.tipo === 'curso') { const st = progreso[p.code]; return !(st && st.estado === 'aprobado'); }
        if (p.tipo === 'creditos') return pm_creditosAprobadosTotal(progreso) < p.valor;
        return false;
    });
}

function pm_deseleccionar() {
    pm_codigoSeleccionado = null;
    document.querySelectorAll('#pm-mapa .pm-chip').forEach(chip => {
        chip.classList.remove('pm-atenuado', 'pm-seleccionado');
    });
    const svg = document.getElementById('pm-svg-conexiones');
    if (svg) svg.innerHTML = '';
    const detalle = document.getElementById('pm-detalle');
    if (detalle) detalle.innerHTML = '<p class="pm-detalle-vacio">Toca cualquier curso del mapa para ver su detalle.</p>';
}

window.pmSeleccionarCurso = function (code) {
    if (pm_codigoSeleccionado === code) {
        pm_deseleccionar();
        return;
    }
    pm_codigoSeleccionado = code;
    const curso = pm_obtenerCurso(code);
    if (!curso) return;
    const progreso = pm_progresoCompleto();
    const estado = pm_estadoCurso(curso, progreso);

    // Modo enfoque: atenúa todo salvo el seleccionado y sus relacionados.
    const desbloquea = pm_obtenerDesbloquea(code);
    const relacionadosCodes = new Set([code, ...curso.prereq.filter(p => p.tipo === 'curso').map(p => p.code), ...desbloquea.map(c => c.code)]);
    document.querySelectorAll('#pm-mapa .pm-chip').forEach(chip => {
        chip.classList.toggle('pm-atenuado', !relacionadosCodes.has(chip.dataset.code));
        chip.classList.toggle('pm-seleccionado', chip.dataset.code === code);
    });

    pm_dibujarConexiones(code, [...relacionadosCodes].filter(c => c !== code));

    // "Necesitas" solo aporta algo si el curso todavía no está en
    // curso ni aprobado (si ya lo llevas, sí o sí ya lo cumpliste).
    const mostrarNecesitas = estado !== 'aprobado' && estado !== 'en_curso';
    const necesitaHtml = mostrarNecesitas && curso.prereq.length ? `
        <div class="pm-detalle-seccion">
            <p class="pm-detalle-seccion-titulo">Necesitas</p>
            ${curso.prereq.map(p => {
        if (p.tipo === 'creditos') {
            const ok = pm_creditosAprobadosTotal(progreso) >= p.valor;
            return `<div class="pm-req-item">${ok ? '✓' : '○'} ${p.valor} créditos acumulados</div>`;
        }
        const req = pm_obtenerCurso(p.code);
        const ok = progreso[p.code] && progreso[p.code].estado === 'aprobado';
        return `<div class="pm-req-item">${ok ? '✓' : '○'} ${p.code}${req ? ' · ' + req.name : ''}</div>`;
    }).join('')}
        </div>
    ` : '';

    // Se abre al aprobar — con nivel extra si una rama en particular
    // se queda con muy poco contenido, para que no se vea vacía.
    function listaDesbloquea(lista, nivel) {
        if (!lista.length) return nivel === 0 ? '<p class="pm-req-item">Es el último de su línea por ahora.</p>' : '';
        return lista.map(c => {
            const faltan = pm_otrosFaltantes(c, nivel === 0 ? code : null, progreso);
            const notaFalta = faltan.length ? ` · te falta también ${faltan.map(f => f.tipo === 'creditos' ? `${f.valor} créditos` : f.code).join(', ')}` : '';
            const nietos = pm_obtenerDesbloquea(c.code);
            const expandir = nivel === 0 && lista.length <= 1 && nietos.length;
            return `
                <div class="pm-desbloquea-item">
                    <div><strong>${c.code}</strong> · ${c.name} · ${c.credits} créditos${notaFalta}</div>
                    ${expandir ? `<div class="pm-desbloquea-nivel2">${listaDesbloquea(nietos, 1)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    const inferido = progreso[code] && progreso[code].inferido;
    document.getElementById('pm-detalle').innerHTML = `
        <div class="pm-detalle-header">
            <span class="pm-detalle-codigo">${curso.code}</span> · ${curso.name}
            <span class="pm-detalle-estado pm-estado-${estado}">${PM_ESTADO_LABEL[estado]}</span>
        </div>
        <p class="pm-detalle-creditos">${curso.credits} créditos</p>
        ${inferido ? '<p class="pm-detalle-inferido">Sin nota registrada en SIGA — se infiere aprobado porque es prerrequisito de algo que sí llevas.</p>' : ''}
        ${necesitaHtml}
        <div class="pm-detalle-seccion">
            <p class="pm-detalle-seccion-titulo">Se abre al aprobarlo</p>
            ${listaDesbloquea(desbloquea, 0)}
        </div>
    `;
    document.getElementById('pm-detalle').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

function pm_dibujarConexiones(codigoSeleccionado, relacionados) {
    const svg = document.getElementById('pm-svg-conexiones');
    const cont = document.getElementById('pm-mapa');
    if (!svg || !cont) return;

    svg.setAttribute('width', cont.scrollWidth);
    svg.setAttribute('height', cont.scrollHeight);
    svg.innerHTML = '';

    const contRect = cont.getBoundingClientRect();
    const centro = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - contRect.left + cont.scrollLeft + r.width / 2, y: r.top - contRect.top + cont.scrollTop + r.height / 2 };
    };

    const chipSel = cont.querySelector(`[data-code="${codigoSeleccionado}"]`);
    if (!chipSel) return;
    const p0 = centro(chipSel);

    relacionados.forEach(code => {
        const chip = cont.querySelector(`[data-code="${code}"]`);
        if (!chip) return;
        const p1 = centro(chip);
        const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linea.setAttribute('x1', p0.x); linea.setAttribute('y1', p0.y);
        linea.setAttribute('x2', p1.x); linea.setAttribute('y2', p1.y);
        linea.setAttribute('class', 'pm-linea');
        svg.appendChild(linea);
    });
}

/* ---------- Apertura / cierre del modal ---------- */
function pm_abrir() {
    document.getElementById('pm-overlay').classList.add('pm-visible');
    document.getElementById('pm-modal').classList.add('pm-visible');
    pm_codigoSeleccionado = null;
    pm_renderMapa();
}

function pm_cerrar() {
    document.getElementById('pm-overlay').classList.remove('pm-visible');
    document.getElementById('pm-modal').classList.remove('pm-visible');
}

window.addEventListener('resize', () => {
    if (pm_codigoSeleccionado && document.getElementById('pm-modal')?.classList.contains('pm-visible')) {
        window.pmSeleccionarCurso(pm_codigoSeleccionado);
    }
});

/* ---------- Arranque: revisa el gate y, si corresponde, arma el
   modal (oculto hasta que se abra) y expone window.__pmHabilitado
   para que generarGridHerramientas() (en intranotas.js) sepa si debe
   mostrar la tarjeta "Progreso de tu carrera" dentro del grid. ---------- */
(async function iniciarGateProgresoMalla() {
    const habilitado = await progresoMallaHabilitado();
    if (!habilitado) return;

    if (!window.MALLA_SISTEMAS_2018) {
        console.warn('Progreso de tu carrera: falta cargar malla-sistemas-2018.js antes que este archivo.');
        return;
    }

    document.body.insertAdjacentHTML('beforeend', `
        <div id="pm-overlay" class="pm-overlay" onclick="window.__pmCerrar()"></div>
        <div id="pm-modal" class="pm-modal" role="dialog" aria-label="Progreso de tu carrera">
            <div class="pm-modal-header">
                <span class="pm-modal-titulo">🗺️ Progreso de tu carrera</span>
                <button type="button" class="pm-cerrar" aria-label="Cerrar" onclick="window.__pmCerrar()">✕</button>
            </div>
            <div class="pm-modal-body" id="pm-body"></div>
        </div>
    `);

    window.__pmAbrir = pm_abrir;
    window.__pmCerrar = pm_cerrar;
    window.__pmHabilitado = true;
    // 🔍 Temporal, para diagnóstico — quitar cuando ya no haga falta.
    window.__pmDebug = pm_progresoCompleto;
})();