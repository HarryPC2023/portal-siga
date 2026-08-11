// js/asesorias-lista.js — Búsqueda, filtros (curso/ciclo) y toggle
// grid/lista para Asesorías. Mismo patrón que opiniones.js, reutilizando
// el componente compartido selector-personalizado.js.
import { ASESORIAS } from './asesorias-datos.js?v=1';
import { abrirVisorPDF, abrirVisorWeb } from './asesorias-visor.js?v=2';
// ⚠️ asesorias-visor.js se carga SOLO desde este import — no debe haber
// además un <script type="module" src="js/asesorias-visor.js"> en el
// HTML, o el navegador lo instanciaría dos veces (dos modales
// independientes peleando por el mismo overlay).

const LS_VISTA = 'asesorias_vista';

let vistaActual = localStorage.getItem(LS_VISTA) || 'grid';
let selectCurso = null;
let selectCiclo = null;

const grid = document.getElementById('asesoriasGrid');
const buscador = document.getElementById('buscadorAsesorias');

document.addEventListener('DOMContentLoaded', () => {
    configurarFiltros();
    configurarVista();
    renderGrid();
});

/** Quita tildes/diacríticos y pasa a minúsculas, para comparar sin exigir tildes exactas. */
function normalizar(texto) {
    return (texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/** Orden: curso A-Z, luego título A-Z dentro del mismo curso. */
function compararAsesorias(a, b) {
    const cmpCurso = a.curso.localeCompare(b.curso, 'es', { sensitivity: 'base' });
    if (cmpCurso !== 0) return cmpCurso;
    return a.titulo.localeCompare(b.titulo, 'es', { sensitivity: 'base' });
}

function renderGrid() {
    const curso = selectCurso ? selectCurso.valor.value : '';
    const ciclo = selectCiclo ? selectCiclo.valor.value : '';
    const busqueda = normalizar(buscador ? buscador.value : '');

    const visibles = ASESORIAS.filter((a) => {
        if (curso && a.curso !== curso) return false;
        if (ciclo && String(a.ciclo) !== ciclo) return false;
        if (busqueda) {
            const coincide = normalizar(a.titulo).includes(busqueda)
                || normalizar(a.curso).includes(busqueda)
                || normalizar(a.descripcion).includes(busqueda);
            if (!coincide) return false;
        }
        return true;
    });

    if (!visibles.length) {
        const hayFiltroActivo = Boolean(busqueda || curso || ciclo);
        grid.innerHTML = `<p class="asesorias-vacio">${hayFiltroActivo ? 'No encontramos asesorías con ese filtro.' : 'Más asesorías en camino, por evaluación y curso.'}</p>`;
        return;
    }

    visibles.sort(compararAsesorias);

    let html = '';
    let cursoAnterior;
    let esPrimero = true;

    visibles.forEach((a) => {
        if (esPrimero || a.curso !== cursoAnterior) {
            html += `<h2 class="asesorias-curso-header">${a.curso}</h2>`;
            cursoAnterior = a.curso;
            esPrimero = false;
        }

        const formato = a.tipo === 'pdf' ? 'PDF' : 'Web interactiva';
        const etiquetaCiclo = a.ciclo ? ` · Ciclo ${a.ciclo}` : '';
        const accion = a.tipo === 'pdf' ? 'Ver PDF' : 'Abrir';

        html += `
      <div class="asesoria-card">
        <div class="asesoria-card-texto">
          <span class="asesoria-card-formato">${formato}${etiquetaCiclo}</span>
          <h3>${a.titulo}</h3>
          <p>${a.descripcion}</p>
        </div>
        <button type="button" class="asesoria-card-accion" data-id="${a.id}">${accion} →</button>
      </div>`;
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.asesoria-card-accion').forEach((btn) => {
        btn.addEventListener('click', () => {
            const item = ASESORIAS.find((a) => a.id === btn.dataset.id);
            if (!item) return;
            if (item.tipo === 'pdf') abrirVisorPDF(item.src, item.titulo);
            else abrirVisorWeb(item.src, item.titulo);
        });
    });
}

function configurarFiltros() {
    const cursosUnicos = [...new Set(ASESORIAS.map((a) => a.curso))].sort((a, b) => a.localeCompare(b, 'es'));
    const ciclosUnicos = [...new Set(ASESORIAS.map((a) => a.ciclo))].filter(Boolean).sort((a, b) => a - b);

    // inicializarSelectPersonalizado viene de selector-personalizado.js,
    // un <script> clásico (no module) cargado antes que este archivo —
    // por eso queda disponible como global sin necesidad de import.
    selectCurso = inicializarSelectPersonalizado({
        triggerId: 'cursoTrigger', textoId: 'cursoTriggerTexto',
        listaId: 'cursoLista', valorId: 'cursoValor',
        opciones: [{ value: '', label: 'Todos los cursos' }, ...cursosUnicos.map((c) => ({ value: c, label: c }))],
        alElegir: renderGrid,
    });

    selectCiclo = inicializarSelectPersonalizado({
        triggerId: 'cicloTrigger', textoId: 'cicloTriggerTexto',
        listaId: 'cicloLista', valorId: 'cicloValor',
        opciones: [{ value: '', label: 'Todos los ciclos' }, ...ciclosUnicos.map((c) => ({ value: String(c), label: `Ciclo ${c}` }))],
        alElegir: renderGrid,
    });

    if (buscador) buscador.addEventListener('input', renderGrid);
}

function aplicarVista() {
    grid.classList.toggle('vista-lista', vistaActual === 'lista');
    document.querySelectorAll('.vista-btn').forEach((btn) => {
        btn.classList.toggle('activo', btn.dataset.vista === vistaActual);
    });
}

function configurarVista() {
    document.querySelectorAll('.vista-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            vistaActual = btn.dataset.vista;
            localStorage.setItem(LS_VISTA, vistaActual);
            aplicarVista();
        });
    });
    aplicarVista();
}