// ruta-academica-ui.js — Ventana de "Ruta académica" (la Ruta del curso, mejorada).
// Se abre al centro de la pantalla, igual que "Progreso de tu carrera".
//
// Muestra tus cursos del periodo ("Mis cursos") y, para el que elijas, qué pasa si queda
// pendiente: cuántos cursos de tu carrera se retrasan, cuántos créditos son, cuál se
// bloquea primero y la cadena completa ciclo por ciclo. Si el curso tiene lectura en el
// Radar académico, invita a ir a verlo.
//
// Es autocontenido: crea su propio DOM al abrirse por primera vez. Estilos en
// css/ruta-academica.css. Los datos se los da quien lo monta:
//   montarRutaAcademica({ cargarFilas, obtenerCursosDelPeriodo, obtenerEnCurso,
//                         obtenerLecturas, obtenerPeriodo, abrirRadar })
//     cargarFilas():              async → filas de avance_curricular
//     obtenerCursosDelPeriodo():  → [{ codigo, nombre }] del periodo en pantalla
//     obtenerEnCurso():           → códigos que el alumno lleva ahora (opcional)
//     obtenerLecturas():          → { [codigo]: { clave, texto } } del Radar (opcional)
//     obtenerPeriodo():           → texto del periodo en pantalla, ej. "2026-2" (opcional)
//     abrirRadar(codigo):         abre el Radar en ese curso (opcional)
import { construirProgresoCarrera } from './progreso-carrera.js';
import { escaparHtml, nombreLindo, soltarFocoDe } from './progreso-carrera-ui.js';
import { cursosParaRuta } from './ruta-academica.js';
import { ETIQUETA_TIPO } from './clasificacion-cursos.js';

/* ---------- Ícono animado ----------
   Un nodo violeta (tu curso) del que salen ramas hacia los cursos que se abren. Un flujo
   recorre las líneas y los nodos se encienden en cadena (CSS, igual que el haz del Radar;
   queda quieto si el dispositivo pide reducir movimiento). Cada nodo lleva un color de la
   paleta del Radar. Los tres de la derecha están separados con corrección óptica. */
const NODOS_ICONO = [
    { x: 5, y: 12.2, r: 3.2, color: '#9B00FF', espera: 0 },
    { x: 17, y: 6.6, r: 2.6, color: '#00B8D9', espera: 0.5 },
    { x: 17, y: 17.8, r: 2.6, color: '#F5A700', espera: 0.5 },
    { x: 31, y: 2.4, r: 2.2, color: '#2979FF', espera: 1 },
    { x: 31, y: 12.2, r: 2.2, color: '#FF7A00', espera: 1 },
    { x: 31, y: 21.2, r: 2.2, color: '#12B886', espera: 1 },
];
const LINEAS_ICONO = [
    'M5 12.2 Q11 12.2 17 6.6',
    'M5 12.2 Q11 12.2 17 17.8',
    'M17 6.6 Q24 3.9 31 2.4',
    'M17 6.6 Q24 10.4 31 12.2',
    'M17 17.8 Q24 19.5 31 21.2',
];

export function svgIconoRuta(ancho = 30) {
    const alto = Math.round((ancho * 24) / 34);
    const lineas = LINEAS_ICONO.map((d) => `<path class="ra-ico-flujo" d="${d}"/>`).join('');
    const halos = NODOS_ICONO.map((n) => `<circle class="ra-ico-halo" cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.color}" style="animation-delay:${n.espera}s"/>`).join('');
    const nodos = NODOS_ICONO.map((n) => `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.color}"/>`).join('');
    return `<svg class="ra-ico" width="${ancho}" height="${alto}" viewBox="0 0 34 24" aria-hidden="true">${lineas}${halos}${nodos}</svg>`;
}

/* ---------- HTML (funciones puras, fáciles de probar) ---------- */

const plural = (n, uno, varios) => (n === 1 ? uno : varios);

function chipTipo(tipo) {
    return `<span class="ra-tipo ra-tipo--${tipo}">${ETIQUETA_TIPO[tipo] || ''}</span>`;
}

function chipLectura(lectura) {
    if (!lectura) return '';
    return `<span class="ra-lectura ra-lectura--${escaparHtml(lectura.clave)}">${escaparHtml(lectura.texto)}</span>`;
}

export function htmlTarjetas(lista, seleccionado, lecturas = {}) {
    return lista.map((r) => `
        <button type="button" class="ra-tarjeta${r.codigo === seleccionado ? ' ra-tarjeta--activa' : ''}" data-code="${escaparHtml(r.codigo)}" aria-pressed="${r.codigo === seleccionado}">
            <span class="ra-tarjeta-nombre">${escaparHtml(nombreLindo(r.nombre))}</span>
            <span class="ra-tarjeta-abre">${r.n ? `Abre ${r.n} ${plural(r.n, 'curso', 'cursos')}` : 'No bloquea otros cursos'}</span>
            <span class="ra-tarjeta-chips">${chipTipo(r.tipo)}${chipLectura(lecturas[r.codigo])}</span>
        </button>`).join('');
}

function htmlNodo(c) {
    const falta = c.tambien.length ? `<span class="ra-nodo-falta">También necesita ${c.tambien.map(escaparHtml).join(', ')}</span>` : '';
    const base = c.tipo === 'base' ? '<span class="ra-nodo-base">Curso base</span>' : '';
    return `<div class="ra-nodo"><span class="ra-nodo-nombre">${escaparHtml(nombreLindo(c.nombre))}</span>${base}${falta}</div>`;
}

function htmlColumna(col, ruta) {
    const encabezado = col.ciclo === null
        ? 'Tu curso'
        : `Ciclo ${col.ciclo}${col.origen && ruta.estado === 'en_curso' ? ' · En curso' : ''}`;
    const origen = col.origen ? `<div class="ra-nodo ra-nodo--origen"><span class="ra-nodo-nombre">${escaparHtml(nombreLindo(ruta.nombre))}</span></div>` : '';
    return `
        <div class="ra-col${col.primero ? ' ra-col--primero' : ''}">
            <div class="ra-col-titulo">${encabezado}</div>
            ${origen}${col.cursos.map(htmlNodo).join('')}
        </div>`;
}

function listaConY(nombres) {
    if (nombres.length <= 1) return nombres.join('');
    return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}

function htmlElectivos(electivos, hayConteo = true) {
    if (!electivos.length) return '';
    const mostrados = electivos.slice(0, 6).map((e) => escaparHtml(nombreLindo(e.nombre)));
    const resto = electivos.length - mostrados.length;
    const texto = resto > 0 ? `${mostrados.join(', ')} y ${resto} más` : listaConY(mostrados);
    const k = electivos.length;
    const frase = hayConteo
        ? `También se ${plural(k, 'abre 1 electivo, que no cuenta', `abren ${k} electivos, que no cuentan`)} arriba porque ${plural(k, 'es opcional', 'son opcionales')}`
        : `Sí se ${plural(k, 'abre 1 electivo', `abren ${k} electivos`)}, pero ${plural(k, 'es opcional', 'son opcionales')}`;
    return `<p class="ra-electivos">${frase}: ${texto}.</p>`;
}

const LECTURAS_DE_ALERTA = new Set(['fuera', 'esfuerzo', 'limite']);

export function htmlDetalle(ruta, lectura) {
    const donde = ruta.ciclo !== null ? `Ciclo ${ruta.ciclo} de tu plan` : 'Fuera de la malla obligatoria';
    const cabecera = `
        <div class="ra-det-cabecera">
            <span class="ra-det-nombre">${escaparHtml(nombreLindo(ruta.nombre))}</span>
            <span class="ra-det-meta">${ruta.creditos} créditos · ${donde}</span>
            ${chipTipo(ruta.tipo)}
            <span class="ra-peso ra-peso--${ruta.peso.clave}">${ruta.peso.texto}</span>
        </div>`;

    if (!ruta.n) {
        return `${cabecera}
        <p class="ra-sin-bloqueo">Este curso no bloquea otros cursos. Suma créditos a tu carrera, pero no afecta tu ruta si queda pendiente.</p>${htmlElectivos(ruta.electivos, false)}`;
    }

    const pastillas = ruta.primeros.map((p) => `<span class="ra-pastilla">${escaparHtml(nombreLindo(p.nombre))}</span>`).join('');
    const aviso = lectura && LECTURAS_DE_ALERTA.has(lectura.clave) && ruta.n >= 3 ? `
        <div class="ra-aviso-radar">
            <span>Hoy está <strong>${escaparHtml(lectura.texto)}</strong> y abre ${ruta.n} cursos: aquí vale la pena concentrar tu esfuerzo.</span>
            <button type="button" class="ra-ver-radar" data-radar="${escaparHtml(ruta.codigo)}">Ver en el Radar</button>
        </div>` : '';

    return `${cabecera}
        <section class="ra-seccion">
            <h3 class="ra-seccion-titulo">Si este curso queda pendiente</h3>
            <div class="ra-tiles">
                <div class="ra-tile"><span class="ra-tile-label">${plural(ruta.n, 'Curso que se retrasa', 'Cursos que se retrasan')}</span><span class="ra-tile-valor">${ruta.n}</span><span class="ra-tile-sub">hasta el ciclo ${ruta.ultimoCiclo}</span></div>
                <div class="ra-tile"><span class="ra-tile-label">Créditos afectados</span><span class="ra-tile-valor">${ruta.creditosAfectados}</span><span class="ra-tile-sub">de tu carrera</span></div>
                <div class="ra-tile ra-tile--ancho"><span class="ra-tile-label">Primero en bloquearse</span><span class="ra-tile-valor">Ciclo ${ruta.primerCiclo}</span>${pastillas}</div>
            </div>
            <p class="ra-frase">${plural(ruta.n, 'Se retrasaría', 'Se retrasarían')} ${ruta.n} ${plural(ruta.n, 'curso', 'cursos')} de tu carrera, empezando en el ciclo ${ruta.primerCiclo}. Aprobarlo mantiene toda esta ruta abierta.</p>
        </section>
        ${aviso}
        <section class="ra-seccion">
            <h3 class="ra-seccion-titulo">La cadena, ciclo por ciclo</h3>
            <div class="ra-cadena"><div class="ra-cadena-interior" style="--ra-columnas:${ruta.columnas.length}">${ruta.columnas.map((c) => htmlColumna(c, ruta)).join('')}</div></div>
        </section>
        ${htmlElectivos(ruta.electivos)}
        <p class="ra-nota">Según los prerrequisitos del plan. El retraso real depende de cuándo se dicte cada curso.</p>`;
}

const MENSAJE_SIN_AVANCE = `
    <p class="ra-mensaje">Todavía no tenemos tu Avance Curricular.<br>
    Vuelve a sincronizar con INTRALU (<strong>← Sincronizar otro periodo</strong>) y tu ruta aparecerá acá.</p>`;
const MENSAJE_ERROR = `
    <p class="ra-mensaje">No pudimos leer tu Avance Curricular en este momento.<br>
    Revisa tu conexión y vuelve a intentarlo.</p>`;
const MENSAJE_SIN_CURSOS = `
    <p class="ra-mensaje">No hay cursos en este periodo todavía.<br>
    Sincroniza tus notas para ver la ruta de tus cursos.</p>`;
const MENSAJE_TODO_APROBADO = `
    <p class="ra-mensaje">Todos los cursos de este periodo ya están aprobados.<br>
    No queda nada pendiente que afecte tu ruta.</p>`;

/* ---------- Montaje en la página ---------- */
export function montarRutaAcademica({
    cargarFilas, obtenerCursosDelPeriodo, obtenerEnCurso = () => [],
    obtenerLecturas = () => ({}), obtenerPeriodo = () => '', abrirRadar = null,
}) {
    let lista = [];
    let lecturas = {};
    let seleccionado = null;
    let montado = false;
    let disparador = null;   // botón que abrió la ventana: recupera el foco al cerrarla

    const $ = (id) => document.getElementById(id);

    function montar() {
        if (montado) return;
        document.body.insertAdjacentHTML('beforeend', `
            <div id="ra-overlay" class="ra-overlay"></div>
            <div id="ra-modal" class="ra-modal" role="dialog" aria-label="Ruta académica" aria-hidden="true" inert>
                <div class="ra-modal-header">
                    <span class="ra-modal-titulo">${svgIconoRuta(56)}<span>Ruta académica</span></span>
                    <button type="button" class="ra-cerrar" id="ra-cerrar" aria-label="Cerrar">✕</button>
                </div>
                <div class="ra-modal-body" id="ra-body"></div>
            </div>`);
        $('ra-overlay').addEventListener('click', cerrar);
        $('ra-cerrar').addEventListener('click', cerrar);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
        $('ra-body').addEventListener('click', (e) => {
            const verRadar = e.target.closest('[data-radar]');
            if (verRadar) {
                const codigo = verRadar.dataset.radar;
                cerrar();
                if (abrirRadar) abrirRadar(codigo);
                return;
            }
            const tarjeta = e.target.closest('.ra-tarjeta');
            if (tarjeta) { seleccionado = tarjeta.dataset.code; pintar(); }
        });
        montado = true;
    }

    async function abrir() {
        disparador = document.activeElement;
        montar();
        $('ra-overlay').classList.add('ra-visible');
        $('ra-modal').classList.add('ra-visible');
        $('ra-modal').removeAttribute('inert');
        $('ra-modal').setAttribute('aria-hidden', 'false');

        const cuerpo = $('ra-body');
        cuerpo.innerHTML = '<p class="ra-mensaje">Armando tu ruta…</p>';
        try {
            const filas = await cargarFilas();
            if (!filas || !filas.length) { cuerpo.innerHTML = MENSAJE_SIN_AVANCE; return; }
            const progreso = construirProgresoCarrera(filas, { enCurso: obtenerEnCurso() });
            const delPeriodo = obtenerCursosDelPeriodo();
            lecturas = obtenerLecturas() || {};
            lista = cursosParaRuta(progreso, delPeriodo);
            if (!delPeriodo.length) { cuerpo.innerHTML = MENSAJE_SIN_CURSOS; return; }
            if (!lista.length) { cuerpo.innerHTML = MENSAJE_TODO_APROBADO; return; }
            seleccionado = lista[0].codigo;
            pintar();
        } catch (error) {
            console.error('Ruta académica:', error);
            cuerpo.innerHTML = MENSAJE_ERROR;
        }
    }

    function cerrar() {
        if (!montado) return;
        $('ra-overlay').classList.remove('ra-visible');
        $('ra-modal').classList.remove('ra-visible');
        soltarFocoDe($('ra-modal'), disparador);
        $('ra-modal').setAttribute('inert', '');
        $('ra-modal').setAttribute('aria-hidden', 'true');
    }

    function pintar() {
        const actual = lista.find((r) => r.codigo === seleccionado) || lista[0];
        const periodo = obtenerPeriodo();
        $('ra-body').innerHTML = `
            <span class="ra-etiqueta">Mis cursos${periodo ? ` · ${escaparHtml(periodo)}` : ''}</span>
            <div class="ra-tarjetas">${htmlTarjetas(lista, actual.codigo, lecturas)}</div>
            <div class="ra-detalle">${htmlDetalle(actual, lecturas[actual.codigo])}</div>`;
    }

    /* Cambia el botón del lateral por el nuevo: ícono animado y nombre "Ruta académica". */
    function reemplazarBoton() {
        const chip = document.querySelector('.chip-herramienta--ruta');
        if (chip) chip.innerHTML = `${svgIconoRuta(30)}<span>Ruta académica</span>`;
    }

    return { abrir, cerrar, reemplazarBoton };
}
