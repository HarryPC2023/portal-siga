// radar-ui.js — Panel del "Radar académico" (beta). Elige un curso y te dice
// en qué situación está, por qué, qué hacer y qué está en juego.
//
// Es autocontenido (igual que Ruta del curso): crea su propio DOM al abrirse
// por primera vez y el botón del lateral. Estilos en css/radar.css. Los datos se
// los da quien lo monta:
//   montarRadar({ obtenerCursos, cargarFilas, obtenerEnCurso })
//     obtenerCursos():  → [{ id, codigo, nombre, creditos, evaluaciones, valores, simulados,
//                            formulaPP, formulaFinal, avisoFormula, haySimulacion }]
//     cargarFilas():    async → filas de avance_curricular (para "cursos que abre")
//     obtenerEnCurso(): → códigos de curso que el alumno lleva ahora (opcional)
//   devuelve { insertarBoton, abrir, cerrar }
import { construirProgresoCarrera } from './progreso-carrera.js';
import { escaparHtml, soltarFocoDe } from './progreso-carrera-ui.js';
import { analizarCurso, textoAnalisis, cursosQueAbre, ordenarPorPrioridad, categoriaTermometro } from './radar-calculo.js';
import { svgTrianguloAlerta, svgInsignia } from './termometro-ui.js';

// Flechas de la tendencia (las mismas del Termómetro).
const FLECHA = {
    sube: '<path d="M5 19c1 -7 6 -9 12 -11"/><path d="M17 8l-5.5 4.5"/><path d="M17 8l-1.5 6.5"/>',
    baja: '<path d="M5 5c1 7 6 9 12 11"/><path d="M17 16l-5.5 -4.5"/><path d="M17 16l-1.5 -6.5"/>',
    estable: '<path d="M4 12h15"/><path d="M13 6l6 6l-6 6"/>',
};
const svgFlecha = (clave, px = 22) => (FLECHA[clave]
    ? `<svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FLECHA[clave]}</svg>` : '');

const ICONO_OBJETIVO = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8"/></svg>';

const MENSAJE_SIN_CURSOS = '<p class="rd-mensaje">No hay cursos de este periodo para analizar.<br>Sincroniza tus notas y el Radar aparecerá acá.</p>';

/* ---------- HTML (funciones puras, fáciles de probar) ---------- */
function tarjetaEstado(item) {
    const a = item.analisis;
    return `<span class="rd-estado rd-e-${a.estado.clave}">${escaparHtml(a.estado.texto)}</span>`;
}

export function htmlSelector(items, seleccionado, orden) {
    return items.map((it, i) => {
        const a = it.analisis;
        // La misma flecha (que gira según qué tan firme está la situación) que en la franja del Termómetro.
        const cat = categoriaTermometro(a);
        const flecha = (cat === 'espera' || cat === 'sinnota') ? '' : `<span class="rd-mini-flecha">${svgInsignia(cat, 16)}</span>`;
        return `<button type="button" class="rd-chip rd-e-${a.estado.clave}${it.id === seleccionado ? ' rd-chip--activo' : ''}" data-id="${escaparHtml(String(it.id))}" aria-pressed="${it.id === seleccionado}">
            <span class="rd-chip__nombre">${orden === 'prioridad' ? `<span class="rd-chip__num">${i + 1}</span>` : ''}${escaparHtml(it.nombre)}</span>
            <span class="rd-chip__estado">${escaparHtml(a.estado.texto)}${flecha}</span>
        </button>`;
    }).join('');
}

function tile(etiqueta, valor, sub, extra = '', claseValor = '') {
    return `<div class="rd-tile"><div class="rd-tile__et">${etiqueta}</div><div class="rd-tile__valor${claseValor}">${valor}</div><div class="rd-tile__sub">${sub}</div>${extra}</div>`;
}

export function htmlDetalle(item) {
    const a = item.analisis;
    const t = textoAnalisis(a);
    const descartes = (t.descartes || []).map((d) => `<p class="rd-descarte">${escaparHtml(d)}</p>`).join('');
    const estimado = item.fuentePP === 'estimada' && ['esfuerzo', 'fuera'].includes(a.estado.clave)
        ? '<p class="rd-estimado">Ojo: esta situación usa una fórmula de prácticas estimada con las reglas generales de la UNI. Puede cambiar cuando INTRALU publique la real al cerrar el ciclo.</p>'
        : '';
    const tend = a.tendencia;
    // En un curso en riesgo, "Subiendo" o "Estable" engañarían: se muestran solo las notas, sin veredicto.
    // Y en un curso casi aprobado, "Bajando" asustaría sin motivo: el nivel manda.
    const enRiesgo = ['esfuerzo', 'limite', 'fuera'].includes(a.estado.clave);
    const sinVeredicto = (enRiesgo && tend.clave !== 'baja') || (a.estado.clave === 'muyfav' && tend.clave === 'baja');
    const tendValor = tend.clave === 'sin'
        ? '<span class="rd-sin">Aún sin tendencia</span>'
        : sinVeredicto
            ? '<span class="rd-sin">Tus notas</span>'
            : `<span class="rd-t-${tend.clave} rd-tend">${svgFlecha(tend.clave)}<span>${escaparHtml(tend.texto)}</span></span>`;
    const tendSub = a.serie.length >= 3 ? escaparHtml(a.serie.slice(0, 6).join(' → ')) : 'Se necesitan 3 evaluaciones con nota.';

    let abre;
    if (item.abre === undefined || item.abre === null) abre = tile('Cursos que abre', '—', 'Sin tu Avance Curricular');
    else if (item.abre.cantidad === 0) abre = tile('Cursos que abre', '0', 'No bloquea otros cursos');
    else abre = tile('Cursos que abre', String(item.abre.cantidad), `${item.abre.creditos} créditos de tu carrera`);

    const creditos = item.creditos ? tile('Créditos', String(item.creditos), 'de este curso') : tile('Créditos', '—', 'sin dato');
    const simulado = item.haySimulacion ? '<span class="rd-simulado">Incluye notas simuladas</span>' : '';
    const categoria = item.categoria === 'electivo' ? '<span class="rd-etiqueta">Electivo</span>' : '';

    return `
    <article class="rd-detalle rd-e-${a.estado.clave}" aria-live="polite">
        <div class="rd-detalle__barra"></div>
        <header class="rd-detalle__cab">
            <h3 class="rd-detalle__nombre">${escaparHtml(item.nombre)}</h3>
            <div class="rd-detalle__meta">
                ${item.creditos ? `<span>${item.creditos} créditos</span>` : ''}${categoria}${simulado}
                <span class="rd-estado-grande rd-e-${a.estado.clave}">${a.estado.clave === 'fuera' ? `${svgTrianguloAlerta(20)} ` : ''}${escaparHtml(a.estado.texto)}</span>
            </div>
        </header>

        <section class="rd-seccion">
            <h4 class="rd-seccion__t">Qué está pasando</h4>
            <div class="rd-tiles">
                ${tile('Nota que necesitas', escaparHtml(t.tile.valor), escaparHtml(t.tile.sub))}
                ${tile('Tendencia', tendValor, tendSub)}
                ${tile('Tu objetivo', 'Aprobar', 'con 10 o más', '', ' rd-tile__valor--texto')}
            </div>
        </section>

        <section class="rd-seccion">
            <h4 class="rd-seccion__t">Por qué aparece aquí</h4>
            <ul class="rd-razones">${t.razones.map((r) => `<li>${escaparHtml(r)}</li>`).join('')}</ul>
            ${descartes}${estimado}
        </section>

        <section class="rd-seccion">
            <h4 class="rd-seccion__t">Qué hacer</h4>
            <div class="rd-accion">${ICONO_OBJETIVO}<span>${escaparHtml(t.queHacer)}</span></div>
        </section>

        <section class="rd-seccion">
            <h4 class="rd-seccion__t">Qué está en juego</h4>
            <div class="rd-tiles rd-tiles--dos">${creditos}${abre}</div>
        </section>

        ${item.avisoFormula || ''}
    </article>`;
}

/* ---------- Montaje en la página ---------- */
export function montarRadar({ obtenerCursos, cargarFilas, obtenerEnCurso = () => [] }) {
    let montado = false;
    let disparador = null;
    let items = [];
    let hayAvance = false;
    let seleccionado = null;
    let orden = 'prioridad';       // 'prioridad' | 'mis-cursos'

    const $ = (id) => document.getElementById(id);

    function montar() {
        if (montado) return;
        document.body.insertAdjacentHTML('beforeend', `
            <div id="rd-overlay" class="rd-overlay"></div>
            <aside id="rd-panel" class="rd-panel" aria-hidden="true" aria-label="Radar académico" inert>
                <div class="rd-cabecera">
                    <div class="rd-titulo-grupo">
                        <span class="rd-icono">📡</span>
                        <div class="rd-titulo">Radar académico</div>
                        <span class="rd-beta">Beta</span>
                    </div>
                    <button type="button" class="rd-cerrar" id="rd-cerrar" aria-label="Cerrar">✕</button>
                </div>
                <div class="rd-cuerpo" id="rd-cuerpo"></div>
            </aside>`);
        $('rd-overlay').addEventListener('click', cerrar);
        $('rd-cerrar').addEventListener('click', cerrar);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
        $('rd-cuerpo').addEventListener('click', (e) => {
            const chip = e.target.closest('.rd-chip');
            if (chip) { seleccionado = chip.dataset.id; pintar(); return; }
            const modo = e.target.closest('[data-orden]');
            if (modo) { orden = modo.dataset.orden; pintar(); }
        });
        montado = true;
    }

    function insertarBoton() {
        const fila = document.querySelector('.fila-herramientas');
        if (!fila || fila.querySelector('[data-aa="radar"]')) return;
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'chip-herramienta chip-herramienta--radar';
        boton.dataset.aa = 'radar';
        boton.textContent = '📡 Radar académico';
        boton.addEventListener('click', abrir);
        fila.appendChild(boton);
    }

    async function prepararDatos() {
        const cursos = obtenerCursos();
        let progreso = null;
        try {
            const filas = await cargarFilas();
            if (filas && filas.length) progreso = construirProgresoCarrera(filas, { enCurso: obtenerEnCurso() });
        } catch (error) {
            console.error('Radar: no se pudo leer el Avance Curricular:', error);
        }
        hayAvance = !!progreso;
        items = cursos.map((c) => {
            const enPlan = progreso?.porCodigo[c.codigo];
            return {
                ...c,
                creditos: enPlan?.creditos || c.creditos || null,
                categoria: enPlan?.categoria || null,
                abre: progreso ? cursosQueAbre(progreso.cursos, c.codigo) : null,
                analisis: analizarCurso(c),
            };
        });
    }

    function ordenados() {
        return orden === 'prioridad' ? ordenarPorPrioridad(items) : items;
    }

    function pintar() {
        const cuerpo = $('rd-cuerpo');
        if (!items.length) { cuerpo.innerHTML = MENSAJE_SIN_CURSOS; return; }
        const lista = ordenados();
        if (!lista.some((it) => String(it.id) === String(seleccionado))) seleccionado = lista[0].id;
        const actual = lista.find((it) => String(it.id) === String(seleccionado));
        cuerpo.innerHTML = `
            <div class="rd-orden">Ordenar por
                <button type="button" data-orden="prioridad" class="${orden === 'prioridad' ? 'rd-orden--activo' : ''}">Prioridad</button>
                <button type="button" data-orden="mis-cursos" class="${orden === 'mis-cursos' ? 'rd-orden--activo' : ''}">Mis cursos</button>
            </div>
            <div class="rd-chips">${htmlSelector(lista, String(seleccionado), orden)}</div>
            ${htmlDetalle(actual)}
            <p class="rd-pie">Calculado con las notas que sincronizaste en SIGA${hayAvance ? '' : '. Sincroniza tu Avance Curricular para ver también los cursos que se abren'}.</p>`;
    }

    async function abrir() {
        disparador = document.activeElement;
        montar();
        $('rd-overlay').classList.add('rd-visible');
        $('rd-panel').classList.add('rd-abierto');
        $('rd-panel').removeAttribute('inert');
        $('rd-panel').setAttribute('aria-hidden', 'false');
        const cuerpo = $('rd-cuerpo');
        cuerpo.innerHTML = '<p class="rd-mensaje">Armando tu radar…</p>';
        try {
            await prepararDatos();
            pintar();
        } catch (error) {
            console.error('Radar académico:', error);
            cuerpo.innerHTML = '<p class="rd-mensaje">No pudimos armar el radar en este momento.<br>Vuelve a intentarlo en un momento.</p>';
        }
    }

    function cerrar() {
        if (!montado) return;
        $('rd-overlay').classList.remove('rd-visible');
        $('rd-panel').classList.remove('rd-abierto');
        soltarFocoDe($('rd-panel'), disparador);
        $('rd-panel').setAttribute('inert', '');
        $('rd-panel').setAttribute('aria-hidden', 'true');
    }

    return { insertarBoton, abrir, cerrar };
}
