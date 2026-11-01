// cursos-electivos-ui.js — Ventana "Cursos electivos" (beta). Se abre al centro de la pantalla,
// igual que "Progreso de tu carrera" y "Ruta académica".
//
// Muestra los electivos de la malla del alumno en COLUMNAS POR CICLO (el ciclo desde el que se
// habilita cada uno, incluidos los de ciclos anteriores que todavía puede llevar), con filtros con
// contador, búsqueda y, al tocar un electivo, el detalle de sus prerrequisitos. Si hay carga
// horaria (FIIS), dice si el electivo se dicta en ese ciclo. Estilos en css/cursos-electivos.css.
//
//   montarCursosElectivos({ cargarFilas, obtenerEnCurso, obtenerPerfil })
//     cargarFilas():   async → filas de avance_curricular
//     obtenerEnCurso():→ códigos que el alumno lleva ahora (opcional)
//     obtenerPerfil(): → { facultad: 'FIIS', carrera: 'sistemas' } (opcional)
import { construirProgresoCarrera } from './progreso-carrera.js';
import { escaparHtml, nombreLindo, soltarFocoDe } from './progreso-carrera-ui.js';
import { ETIQUETA_TIPO } from './clasificacion-cursos.js';
import {
    construirElectivos, filtrarElectivos, contarElectivos, agruparPorCiclo,
    creditosRequeridos, cargaDeFacultad, indexarCarga,
} from './cursos-electivos.js';

/* ---------- Ícono animado: un reloj cuyas manecillas giran (el tiempo pasa y hay que elegir) ---------- */
export function svgIconoElectivos(px = 30) {
    return `<svg class="ce-ico" width="${px}" height="${px}" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="20.5" fill="#fff" stroke="#FF7A00" stroke-width="4"/>
        <path d="M24 7.5v3M24 37.5v3M7.5 24h3M37.5 24h3" stroke="#14102a" stroke-width="2" stroke-linecap="round"/>
        <g class="ce-ico-hora"><path d="M24 24V14" stroke="#14102a" stroke-width="3" stroke-linecap="round"/></g>
        <g class="ce-ico-minuto"><path d="M24 24V9.5" stroke="#12A07A" stroke-width="2.4" stroke-linecap="round"/></g>
        <circle cx="24" cy="24" r="2.6" fill="#14102a"/></svg>`;
}

/* ---------- HTML (funciones puras, fáciles de probar) ---------- */

const plural = (n, uno, varios) => (n === 1 ? uno : varios);

const FILTROS = [
    ['todos', 'Todos', 'todos'],
    ['disp', 'Disponibles ahora', 'disp'],
    ['prox', 'Próximo ciclo', 'prox'],
    ['bloq', 'Bloqueados', 'bloq'],
    ['dict', 'Se dictan este ciclo', 'dict'],
];

export function htmlFiltros(contadores, filtro, hayCarga) {
    return FILTROS.filter(([clave]) => clave !== 'dict' || hayCarga).map(([clave, texto, campo]) => `
        <button type="button" class="ce-filtro${clave === filtro ? ' ce-filtro--activo' : ''}" data-filtro="${clave}" aria-pressed="${clave === filtro}">${texto} (${contadores[campo]})</button>`).join('');
}

function etiquetaEstado(e) {
    return {
        aprobado: 'Aprobado', en_curso: 'Lo llevas ahora', disponible: 'Disponible ahora',
        proximo: 'Próximo ciclo', bloqueado: 'Bloqueado', definir: 'Prerrequisitos por definir',
    }[e.estado] || '';
}

function lineaDictado(e, cicloCarga) {
    // Sin código (electivos "S/C" de la malla 2026) no se puede buscar en la carga horaria: no se afirma nada.
    if (!e.dictado || !cicloCarga || e.estado === 'definir') return '';
    return e.dictado.secciones > 0
        ? `<span class="ce-nodo-dicta ce-nodo-dicta--si">Se dicta en ${escaparHtml(cicloCarga)}</span>`
        : `<span class="ce-nodo-dicta">No se dicta en ${escaparHtml(cicloCarga)}</span>`;
}

function htmlNodo(e, seleccionado, cicloCarga) {
    const extra = e.estado === 'aprobado' ? '<span class="ce-nodo-estado ce-nodo-estado--ok">✓ Aprobado</span>'
        : e.estado === 'en_curso' ? '<span class="ce-nodo-estado ce-nodo-estado--curso">Lo llevas ahora</span>' : '';
    return `
        <button type="button" class="ce-nodo ce-nodo--${e.estado}${e.codigo === seleccionado ? ' ce-nodo--sel' : ''}" data-code="${escaparHtml(e.codigo)}" aria-pressed="${e.codigo === seleccionado}">
            <span class="ce-nodo-nombre">${escaparHtml(nombreLindo(e.nombre))}</span>
            <span class="ce-nodo-meta">${escaparHtml(e.codigo)} · ${e.creditos} ${plural(e.creditos, 'crédito', 'créditos')}</span>
            ${extra}${lineaDictado(e, cicloCarga)}
        </button>`;
}

export function htmlColumnas(electivos, seleccionado, cicloActual, cicloCarga) {
    if (!electivos.length) return '<p class="ce-vacio">No hay electivos con ese filtro. Prueba con otro o borra la búsqueda.</p>';
    const grupos = agruparPorCiclo(electivos);
    return `<div class="ce-columnas">${grupos.map((g) => `
        <div class="ce-columna${g.ciclo !== null && g.ciclo === cicloActual ? ' ce-columna--actual' : ''}">
            <div class="ce-columna-titulo">${g.ciclo === null ? 'Prerrequisitos por definir' : `Ciclo ${g.ciclo}${g.ciclo === cicloActual ? ' · actual' : ''}`}</div>
            ${g.cursos.map((e) => htmlNodo(e, seleccionado, cicloCarga)).join('')}
        </div>`).join('')}</div>`;
}

function listaConY(nombres) {
    if (nombres.length <= 1) return nombres.join('');
    return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

export function htmlDetalle(e, cicloCarga) {
    const chips = [`<span class="ce-chip ce-chip--${e.estado}">${etiquetaEstado(e)}</span>`];
    if (e.tipo === 'complementario') chips.push(`<span class="ce-chip ce-chip--tipo">${ETIQUETA_TIPO.complementario}</span>`);
    if (e.dictado && cicloCarga && e.estado !== 'definir') {
        chips.push(e.dictado.secciones > 0
            ? `<span class="ce-chip ce-chip--dicta">Se dicta en ${escaparHtml(cicloCarga)} · ${e.dictado.secciones} ${plural(e.dictado.secciones, 'sección', 'secciones')}</span>`
            : `<span class="ce-chip ce-chip--nodicta">No se dicta en ${escaparHtml(cicloCarga)}</span>`);
    }

    let cuerpo;
    if (e.estado === 'definir') {
        cuerpo = '<p class="ce-detalle-texto">Este electivo todavía no tiene prerrequisitos definidos en la malla, así que no podemos decir qué necesitas ni desde qué ciclo se habilita.</p>';
    } else {
        const marca = { aprobado: ['ok', '✓', 'aprobado'], en_curso: ['curso', '…', 'lo llevas ahora'], falta: ['falta', '○', 'te falta'] };
        const prereqs = e.prereqs.length ? `
            <h4 class="ce-detalle-sub">Necesitas</h4>
            ${e.prereqs.map((p) => `<div class="ce-pre"><span class="ce-pre-marca ce-pre-marca--${marca[p.estado][0]}">${marca[p.estado][1]}</span><span>${escaparHtml(nombreLindo(p.nombre))} <small>(${escaparHtml(p.codigo)}) · ${marca[p.estado][2]}</small></span></div>`).join('')}` : '';
        const desde = e.ciclo !== null ? ` desde el ciclo ${e.ciclo}` : '';
        let frase;
        if (e.estado === 'aprobado') frase = 'Ya aprobaste este electivo.';
        else if (e.estado === 'en_curso') frase = 'Lo estás llevando ahora.';
        else if (e.estado === 'proximo') {
            const llevando = e.prereqs.filter((p) => p.estado === 'en_curso').map((p) => escaparHtml(nombreLindo(p.nombre)));
            frase = `Si apruebas ${listaConY(llevando)} este ciclo, se habilita${desde}.`;
        } else if (e.estado === 'bloqueado') frase = `Se habilitaría${desde}, cuando apruebes lo que te falta.`;
        else frase = e.prereqs.length ? `Ya cumples los prerrequisitos: está disponible${desde}.` : 'Este electivo no tiene prerrequisitos en tu malla.';
        cuerpo = `${prereqs}<p class="ce-detalle-texto">${frase}</p>`;
    }

    return `
        <div class="ce-detalle-nombre">${escaparHtml(nombreLindo(e.nombre))}</div>
        <div class="ce-detalle-meta">${escaparHtml(e.codigo)} · ${e.creditos} ${plural(e.creditos, 'crédito', 'créditos')}</div>
        <div class="ce-chips">${chips.join('')}</div>
        ${cuerpo}`;
}

const MENSAJE_SIN_AVANCE = `
    <p class="ce-mensaje">Todavía no tenemos tu Avance Curricular.<br>
    Vuelve a sincronizar con INTRALU (<strong>← Sincronizar otro periodo</strong>) y tus electivos aparecerán acá.</p>`;
const MENSAJE_ERROR = `
    <p class="ce-mensaje">No pudimos leer tu Avance Curricular en este momento.<br>
    Revisa tu conexión y vuelve a intentarlo.</p>`;
const MENSAJE_SIN_ELECTIVOS = `
    <p class="ce-mensaje">Tu Avance Curricular no trae cursos electivos.<br>
    Si crees que es un error, sincroniza de nuevo con INTRALU.</p>`;

/* ---------- Montaje en la página ---------- */
export function montarCursosElectivos({ cargarFilas, obtenerEnCurso = () => [], obtenerPerfil = () => null }) {
    let electivos = [];
    let cicloActual = null;
    let cicloCarga = null;      // p. ej. "2026-2"; null si no hay carga horaria para su facultad
    let creditos = null;
    let filtro = 'todos';
    let busqueda = '';
    let seleccionado = null;
    let montado = false;
    let disparador = null;
    let cargaYaPedida = false;
    let cargaIndexada = null;

    const $ = (id) => document.getElementById(id);

    function insertarBoton() {
        const fila = document.querySelector('.fila-herramientas');
        if (!fila || fila.querySelector('[data-aa="electivos"]')) return;
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'chip-herramienta chip-herramienta--electivos';
        boton.dataset.aa = 'electivos';
        boton.innerHTML = `${svgIconoElectivos(26)}<span>Cursos electivos</span>`;
        boton.addEventListener('click', abrir);
        fila.appendChild(boton);
    }

    function montar() {
        if (montado) return;
        document.body.insertAdjacentHTML('beforeend', `
            <div id="ce-overlay" class="ce-overlay"></div>
            <div id="ce-modal" class="ce-modal" role="dialog" aria-label="Cursos electivos" aria-hidden="true" inert>
                <div class="ce-header">
                    <div class="ce-titulo-bloque">
                        ${svgIconoElectivos(46)}
                        <div>
                            <div class="ce-titulo">Cursos electivos</div>
                            <div class="ce-creditos" id="ce-creditos" hidden><i></i><span></span></div>
                        </div>
                    </div>
                    <button type="button" class="ce-cerrar" id="ce-cerrar" aria-label="Cerrar">✕</button>
                </div>
                <div class="ce-body" id="ce-body"></div>
            </div>`);
        $('ce-overlay').addEventListener('click', cerrar);
        $('ce-cerrar').addEventListener('click', cerrar);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
        montado = true;
    }

    async function pedirCarga(perfil) {
        if (cargaYaPedida) return;
        cargaYaPedida = true;
        const cfg = cargaDeFacultad(perfil?.facultad);
        if (!cfg) return;
        try {
            const respuesta = await fetch(cfg.url);
            if (!respuesta.ok) return;
            cargaIndexada = indexarCarga(await respuesta.json());
            cicloCarga = cfg.ciclo;
        } catch (error) {
            console.error('Cursos electivos: no se pudo leer la carga horaria:', error);
        }
    }

    async function abrir() {
        disparador = document.activeElement;
        montar();
        $('ce-overlay').classList.add('ce-visible');
        $('ce-modal').classList.add('ce-visible');
        $('ce-modal').removeAttribute('inert');
        $('ce-modal').setAttribute('aria-hidden', 'false');

        const cuerpo = $('ce-body');
        cuerpo.innerHTML = '<p class="ce-mensaje">Armando tus electivos…</p>';
        try {
            const perfil = obtenerPerfil();
            const [filas] = await Promise.all([cargarFilas(), pedirCarga(perfil)]);
            if (!filas || !filas.length) { cuerpo.innerHTML = MENSAJE_SIN_AVANCE; return; }
            const progreso = construirProgresoCarrera(filas, { enCurso: obtenerEnCurso() });
            const resultado = construirElectivos(progreso, cargaIndexada);
            electivos = resultado.electivos;
            cicloActual = resultado.cicloActual;
            creditos = creditosRequeridos(perfil?.facultad, perfil?.carrera);
            const lineaCreditos = $('ce-creditos');
            lineaCreditos.hidden = creditos === null;
            if (creditos !== null) lineaCreditos.querySelector('span').textContent = `${creditos} créditos`;
            if (!electivos.length) { cuerpo.innerHTML = MENSAJE_SIN_ELECTIVOS; return; }
            filtro = 'todos';
            busqueda = '';
            seleccionado = null;
            armarCuerpo();
        } catch (error) {
            console.error('Cursos electivos:', error);
            cuerpo.innerHTML = MENSAJE_ERROR;
        }
    }

    function cerrar() {
        if (!montado) return;
        $('ce-overlay').classList.remove('ce-visible');
        $('ce-modal').classList.remove('ce-visible');
        soltarFocoDe($('ce-modal'), disparador);
        $('ce-modal').setAttribute('inert', '');
        $('ce-modal').setAttribute('aria-hidden', 'true');
    }

    /* El cuerpo se arma una vez; después solo se repintan las partes que cambian (así la casilla
       de búsqueda no pierde el foco mientras se escribe). */
    function armarCuerpo() {
        $('ce-body').innerHTML = `
            <div class="ce-filtros" id="ce-filtros"></div>
            <input type="search" class="ce-buscar" id="ce-buscar" placeholder="🔍 Buscar por nombre o código" aria-label="Buscar electivo por nombre o código" autocomplete="off">
            <div id="ce-lista"></div>
            <p class="ce-ayuda">Toca un electivo para ver sus prerrequisitos.</p>
            <div class="ce-detalle" id="ce-detalle" hidden></div>
            <p class="ce-nota">Los estados salen de tu Avance Curricular. «Desde el ciclo» es una estimación según tus prerrequisitos.${cicloCarga ? ` «Se dicta» se basa en la carga horaria de ${escaparHtml(cicloCarga)}.` : ''}</p>`;
        $('ce-filtros').addEventListener('click', (e) => {
            const b = e.target.closest('[data-filtro]');
            if (b) { filtro = b.dataset.filtro; pintarFiltros(); pintarLista(); }
        });
        $('ce-buscar').addEventListener('input', (e) => { busqueda = e.target.value; pintarLista(); });
        $('ce-lista').addEventListener('click', (e) => {
            const n = e.target.closest('[data-code]');
            if (n) { seleccionado = n.dataset.code; pintarLista(); pintarDetalle(); }
        });
        pintarFiltros();
        pintarLista();
    }

    function pintarFiltros() {
        $('ce-filtros').innerHTML = htmlFiltros(contarElectivos(electivos), filtro, !!cicloCarga);
    }

    function pintarLista() {
        // Al repintar se conserva el desplazamiento lateral: tocar un electivo del final no debe volver al inicio.
        const desplazamiento = $('ce-lista').querySelector('.ce-columnas')?.scrollLeft || 0;
        $('ce-lista').innerHTML = htmlColumnas(filtrarElectivos(electivos, filtro, busqueda), seleccionado, cicloActual, cicloCarga);
        const columnas = $('ce-lista').querySelector('.ce-columnas');
        if (columnas) columnas.scrollLeft = desplazamiento;
    }

    function pintarDetalle() {
        const e = electivos.find((x) => x.codigo === seleccionado);
        const caja = $('ce-detalle');
        caja.hidden = !e;
        if (e) caja.innerHTML = htmlDetalle(e, cicloCarga);
    }

    return { abrir, cerrar, insertarBoton };
}
