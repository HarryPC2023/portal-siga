// adn-ui.js — Ventana central del ADN académico (beta). Se abre desde un botón en el lateral (junto a Radar, Ruta
// y Cursos electivos), igual que Cursos electivos y Progreso de tu carrera: una ventana amplia en el centro.
//
// Qué muestra, para el periodo académico que el estudiante toque en la cadena:
//   perfil (o estado: en formación, verano…) · cadena con una barra por curso · Dato curioso ·
//   "Lo que más destacó" (titular + "Ver por qué") · "Qué hacer".
// Los cálculos están en adn-calculo.js y los textos en adn-textos.js; aquí solo se arma la pantalla.
import { construirAdn } from './adn-calculo.js';
import { esCursoBase } from './clasificacion-cursos.js';
import { evaluacionesEnOrden } from './analisis-academico.js';
import { svgIcono, crearHelice } from './adn-iconos.js';
import { inyectarEstilos } from './adn-estilos.js';

/* Colores de cada perfil y de cada estado (el contorno de las tarjetas los usa desde el inicio). */
const COLOR_PERFIL = {
    rem: { c: '#E53935', t: '#B71C1C', bg: '#FDE3E2' },
    mad: { c: '#FB8C00', t: '#B35F00', bg: '#FFE9CC' },
    esp: { c: '#2563EB', t: '#1D4ED8', bg: '#E0EAFF' },
    cim: { c: '#F5B800', t: '#A66F00', bg: '#FFF3C4' },
    fin: { c: '#D81B60', t: '#A3144A', bg: '#FCE0EB' },
    met: { c: '#5C6BC0', t: '#3F4C9E', bg: '#E3E6F7' },
    con: { c: '#22A06B', t: '#157347', bg: '#DDF3E8' },
    equ: { c: '#00897B', t: '#00695C', bg: '#D8F0ED' },
};
const COLOR_ESTADO = {
    formacion:  { c: '#8BC34A', t: '#4E7A1B', bg: '#EAF5DA', icono: 'form' },
    verano:     { c: '#29B6F6', t: '#0B7FB3', bg: '#DDF2FD', icono: 'sun' },
    pocos:      { c: '#90A4AE', t: '#546E7A', bg: '#ECEFF1', icono: 'pocos' },
    sin_patron: { c: '#78909C', t: '#455A64', bg: '#E8EDF0', icono: 'mix' },
    vivo:       { c: '#8E24AA', t: '#6A1B80', bg: '#F3E5F5', icono: null },
};
const colorDe = (r) => (r.estado === 'perfil' ? COLOR_PERFIL[r.perfil] : COLOR_ESTADO[r.estado]) || COLOR_ESTADO.pocos;
const iconoDe = (r) => (r.estado === 'perfil' ? r.perfil : COLOR_ESTADO[r.estado]?.icono || null);

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const estilo = (r) => { const k = colorDe(r); return `--c:${k.c};--cbg:${k.bg};--ctxt:${k.t}`; };

/* Las evaluaciones de INTRALU, en el orden en que se rindieron, en el formato que usa el cálculo. */
function evaluacionesParaAdn(crudas) {
    try {
        return evaluacionesEnOrden(crudas || []).map((e) => ({ esExamen: e.variable === 'EP' || e.variable === 'EF', nota: e.nota }));
    } catch { return []; }
}
const aNota = (n) => { if (n === null || n === undefined || n === '') return null; const x = Number(n); return Number.isFinite(x) ? x : null; };

/**
 * @param cargarFilas     async () => filas del Avance curricular (se usan solo para completar créditos que falten).
 * @param obtenerPeriodos () => [{ periodo:'2024-1', abierto:false, cursos:[{ codigo, nombre, creditos, nota, evaluaciones }] }]
 *                        (lo entrega notas.js: ahí viven las notas y las fórmulas).
 */
export function montarAdn({ cargarFilas = async () => [], obtenerPeriodos }) {
    let montado = false, disparador = null;
    let resultado = null, cursosDe = {};
    let sel = null, verPorQue = false, verComo = false;
    const $ = (id) => document.getElementById(id);

    function insertarBoton() {
        const fila = document.querySelector('.fila-herramientas');
        if (!fila || fila.querySelector('[data-aa="adn"]')) return;
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'chip-herramienta chip-herramienta--adn';
        boton.dataset.aa = 'adn';
        boton.appendChild(crearHelice(26));
        const texto = document.createElement('span');
        texto.textContent = 'ADN académico';
        boton.appendChild(texto);
        boton.addEventListener('click', () => abrir());
        fila.appendChild(boton);
    }

    function montar() {
        if (montado) return;
        inyectarEstilos();
        document.body.insertAdjacentHTML('beforeend', `
            <div id="adn-overlay" class="adn-overlay"></div>
            <div id="adn-modal" class="adn-modal" role="dialog" aria-label="ADN académico" aria-hidden="true" inert>
                <div class="adn-header">
                    <div class="adn-titulo-bloque">
                        <span id="adn-helice-cab" style="display:flex"></span>
                        <div>
                            <div class="adn-titulo">ADN académico</div>
                            <div class="adn-subtitulo">Cómo te fue en cada periodo académico y qué hacer con eso</div>
                        </div>
                    </div>
                    <button type="button" class="adn-cerrar" id="adn-cerrar" aria-label="Cerrar">✕</button>
                </div>
                <div class="adn-body" id="adn-body"></div>
            </div>`);
        $('adn-helice-cab').appendChild(crearHelice(46));
        $('adn-overlay').addEventListener('click', cerrar);
        $('adn-cerrar').addEventListener('click', cerrar);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
        $('adn-body').addEventListener('click', alTocar);
        montado = true;
    }

    /* Junta lo que entrega notas.js con los créditos del Avance y deja todo listo para el cálculo. */
    async function cargarDatos() {
        const periodos = (typeof obtenerPeriodos === 'function' ? obtenerPeriodos() : []) || [];
        const creditos = {};
        try { (await cargarFilas()).forEach((f) => { if (f.creditos > 0) creditos[f.codigo_curso] = f.creditos; }); } catch { /* sin Avance: se usa lo que traiga cada curso */ }
        const entrada = periodos.map((p) => ({
            periodo: p.periodo,
            abierto: !!p.abierto,
            cursos: (p.cursos || []).map((c) => ({
                codigo: c.codigo, nombre: c.nombre,
                creditos: c.creditos > 0 ? c.creditos : (creditos[c.codigo] || 0),
                nota: aNota(c.nota),
                tipo: esCursoBase(c.codigo) ? 'base' : 'especialidad',
                evaluaciones: evaluacionesParaAdn(c.evaluaciones),
            })),
        }));
        cursosDe = Object.fromEntries(entrada.map((p) => [p.periodo, p.cursos]));
        resultado = construirAdn(entrada);
    }

    function periodoPorDefecto() {
        const lista = resultado.periodos;
        for (let i = lista.length - 1; i >= 0; i--) if (!lista[i].abierto) return lista[i].periodo;
        return lista.length ? lista[lista.length - 1].periodo : null;
    }

    /* ---------- Pantalla ---------- */
    const htmlBarras = (r) => {
        const cursos = cursosDe[r.periodo] || [];
        return `<div class="adn-barras${cursos.length > 8 ? ' adn-barras--muchas' : ''}">${cursos.map((c) => {
            if (c.nota === null) return '<span class="adn-sin"></span>';
            const alto = Math.max(6, Math.round((c.nota / 20) * 80));
            return `<span class="${c.tipo === 'base' ? 'adn-base' : ''}" style="height:${alto}px"></span>`;
        }).join('')}</div>`;
    };

    function htmlTarjeta(r) {
        const vivo = r.estado === 'vivo';
        const ico = iconoDe(r);
        const etiqueta = vivo ? 'En vivo' : esc(r.etiqueta);
        return `<button type="button" class="adn-ciclo${vivo ? ' adn-ciclo--vivo' : ''}" data-periodo="${esc(r.periodo)}" style="${estilo(r)}"
                aria-pressed="${r.periodo === sel}" aria-label="${esc(r.periodo)}: ${etiqueta}, ${r.nCursos} cursos">
                ${htmlBarras(r)}
                <div class="adn-ciclo__periodo">${esc(r.periodo)}</div>
                <div class="adn-ciclo__perfil">${ico ? svgIcono(ico, 20) : ''}${etiqueta}</div>
            </button>`;
    }

    function htmlHero(r) {
        const k = colorDe(r);
        if (r.estado === 'vivo') {
            return `<div class="adn-caja adn-vivo"><div class="adn-chico">${esc(r.aviso)}</div><b>${esc(r.titulo)}</b><div class="adn-parrafo">${esc(r.relato)}</div></div>`;
        }
        const ico = iconoDe(r);
        const icono = `<span class="adn-hero__icono" style="${estilo(r)}">${svgIcono(ico, 40)}</span>`;
        if (r.estado !== 'perfil') {
            return `<div class="adn-caja adn-hero" style="${estilo(r)}"><div class="adn-hero__fila">${icono}
                <div class="adn-hero__texto"><div class="adn-chico">${esc(r.periodo)} · ${esc(r.etiqueta)}</div>
                <div class="adn-hero__nombre"><b>${esc(r.titulo)}</b></div><div class="adn-parrafo">${esc(r.relato)}</div></div></div></div>`;
        }
        return `<div class="adn-caja adn-hero" style="${estilo(r)}">
            <div class="adn-hero__fila">${icono}
                <div class="adn-hero__texto"><div class="adn-chico">Tu perfil en ${esc(r.periodo)}</div>
                <div class="adn-hero__nombre"><b>${esc(r.titulo)}</b><span>${esc(r.frase)}</span></div>
                <div class="adn-parrafo">${esc(r.relato)}</div></div></div>
            <div class="adn-chips">${r.chips.map((c) => `<div class="adn-chip"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join('')}</div>
            <div><button type="button" class="adn-mini" data-accion="como" aria-expanded="${verComo}">Ver cómo se calculó</button>
            ${verComo ? `<div class="adn-nota">${esc(r.comoSeCalcula)}</div>` : ''}</div>
        </div>`;
    }

    function htmlDato(r) {
        return `<div class="adn-caja adn-dato"><div class="adn-card-titulo">${svgIcono('bulb', 24)}<h3>Dato curioso</h3></div>
            <div class="adn-dato__cuerpo"><span class="adn-dato__cifra">${esc(r.dato.valor)}</span><span class="adn-dato__texto">${esc(r.dato.texto)}</span></div></div>`;
    }
    function htmlDestaco(r) {
        const titulo = r.abierto ? 'Lo que más destaca hasta ahora' : `Lo que más destacó en ${esc(r.periodo)}`;
        return `<div class="adn-caja adn-destaco"><div class="adn-card-titulo">${svgIcono('chart', 24)}<h3>${titulo}</h3></div>
            <div class="adn-destaco__texto">${esc(r.titular.texto)}</div>
            <div><button type="button" class="adn-mini" data-accion="porque" aria-expanded="${verPorQue}">${verPorQue ? 'Ocultar' : 'Ver por qué'}</button></div>
            ${verPorQue ? `<div class="adn-porque">${esc(r.titular.porQue)}</div>` : ''}</div>`;
    }

    function htmlQueHacer(r) {
        const q = resultado.queHacer;
        if (!q) return '';
        const lineas = r.abierto ? q.vivo : q.paso.map((t) => [t]);
        const cuando = r.abierto ? 'Para este periodo académico' : 'Para tu próximo periodo académico';
        return `<div class="adn-quehacer"><div class="adn-quehacer__cab">${svgIcono('comp', 28)}<b>Qué hacer</b>
            <span class="adn-chico">${cuando} · según tu perfil más reciente: El ${esc(q.nombre)}</span></div>
            ${lineas.map((l) => `<div class="adn-linea"><span class="adn-flecha">→</span><span>${esc(l[0])}</span>${l[1] ? `<span class="adn-herramienta">${esc(l[1])}</span>` : ''}</div>`).join('')}</div>`;
    }

    function pintar() {
        const cuerpo = $('adn-body');
        if (!resultado || !resultado.periodos.length) {
            cuerpo.innerHTML = '<div class="adn-vacio">Todavía no hay periodos académicos con notas para armar tu ADN.<br>Cuando sincronices tus notas, aquí aparecerá tu historia.</div>';
            return;
        }
        const r = resultado.periodos.find((p) => p.periodo === sel) || resultado.periodos[resultado.periodos.length - 1];
        const previo = $('adn-tarjetas');
        const scroll = previo ? previo.scrollLeft : null;
        const par = [r.dato ? htmlDato(r) : '', r.titular ? htmlDestaco(r) : ''].filter(Boolean).join('');
        cuerpo.innerHTML = `<div class="adn-marco">
            ${htmlHero(r)}
            <div class="adn-caja adn-cadena"><h3>Tu cadena de ADN</h3>
                <div class="adn-chico">Una columna por periodo académico, con una barra por curso: la altura es su nota final; el tono fuerte marca los cursos de tu carrera y el suave, los cursos base. Toca un periodo.</div>
                <div class="adn-tarjetas" id="adn-tarjetas">${resultado.periodos.map(htmlTarjeta).join('')}</div></div>
            ${par ? `<div class="adn-par">${par}</div>` : ''}
            ${htmlQueHacer(r)}
        </div>`;
        const tarjetas = $('adn-tarjetas');
        if (scroll !== null) tarjetas.scrollLeft = scroll; else centrarSeleccionada();
    }

    function centrarSeleccionada() {
        const tarjetas = $('adn-tarjetas');
        const activa = tarjetas && tarjetas.querySelector('[aria-pressed="true"]');
        if (activa) tarjetas.scrollLeft = activa.offsetLeft - (tarjetas.clientWidth - activa.offsetWidth) / 2;
    }

    function alTocar(e) {
        const tarjeta = e.target.closest('.adn-ciclo');
        if (tarjeta) { sel = tarjeta.dataset.periodo; verPorQue = false; verComo = false; pintar(); return; }
        const accion = e.target.closest('[data-accion]');
        if (!accion) return;
        if (accion.dataset.accion === 'porque') verPorQue = !verPorQue;
        if (accion.dataset.accion === 'como') verComo = !verComo;
        pintar();
    }

    /* ---------- Abrir y cerrar ---------- */
    async function abrir(opciones = {}) {
        montar();
        disparador = document.activeElement;
        const modal = $('adn-modal');
        $('adn-body').innerHTML = '<div class="adn-cargando">Armando tu ADN académico…</div>';
        $('adn-overlay').classList.add('adn-visible');
        modal.classList.add('adn-visible');
        modal.removeAttribute('inert');
        modal.setAttribute('aria-hidden', 'false');
        $('adn-cerrar').focus();
        try {
            await cargarDatos();
            sel = opciones.periodo || periodoPorDefecto();
        } catch {
            resultado = null;
        }
        verPorQue = false; verComo = false;
        pintar();
    }

    function cerrar() {
        if (!montado) return;
        const modal = $('adn-modal');
        if (!modal.classList.contains('adn-visible')) return;
        $('adn-overlay').classList.remove('adn-visible');
        modal.classList.remove('adn-visible');
        modal.setAttribute('inert', '');
        modal.setAttribute('aria-hidden', 'true');
        if (disparador && typeof disparador.focus === 'function') disparador.focus();
    }

    return { insertarBoton, abrir, cerrar };
}
