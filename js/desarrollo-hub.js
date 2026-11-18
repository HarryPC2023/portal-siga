// js/desarrollo-hub.js — Portada «Desarrollo profesional»: las tres partes en ruta vertical y cuánto lleva avanzado el alumno.
//
// Los textos vienen de js/desarrollo-contenido.js. El avance sale de las reglas del semáforo sobre lo que
// el alumno ya guardó (SigaEstado, módulo «desarrollo»); si no carga, la portada se ve igual, sin avance.
import { SigaEstado } from './sync-estado.js?v=1';
import { accesoPermitido } from './desarrollo-acceso.js?v=1';
import { crearDesarrollo } from './desarrollo-estado.js?v=1';
import { evaluarCV } from './desarrollo-reglas.js?v=1';
import { LEMA, PARTES_HUB, NOTA_PRIVACIDAD } from './desarrollo-contenido.js?v=1';

const $ = (s) => document.querySelector(s);

function el(tag, props = {}, ...hijos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v === true ? '' : v);
    }
    hijos.flat().forEach((h) => { if (h != null && h !== false) n.append(h.nodeType ? h : document.createTextNode(String(h))); });
    return n;
}

const hayDatos = (cv) => Object.keys(cv.datos).length || Object.keys(cv.formacion).length || cv.proyectos.length
    || cv.habilidades.length || cv.logros.length || cv.experiencias.length;

function resumenCV(cv) {
    if (!hayDatos(cv)) return { texto: 'Aún no empiezas', listo: false, empezado: false };
    const r = evaluarCV(cv);
    const partes = [];
    if (r.resumen.verde) partes.push(`${r.resumen.verde} en verde`);
    if (r.resumen.ambar) partes.push(`${r.resumen.ambar} por reforzar`);
    if (r.resumen.rojo) partes.push(`${r.resumen.rojo} pendiente${r.resumen.rojo === 1 ? '' : 's'}`);
    return { texto: partes.join(' · '), listo: r.listo, empezado: true };
}

const COLORES = ['', 'o', 'a'];            // verde · naranja · azul, en el orden de las tres partes

function tarjeta(parte, i, resumen) {
    const activa = parte.disponible;
    const pie = activa
        ? el('a', { class: 'dpp-btn', href: parte.enlace, text: resumen && resumen.empezado ? 'Continuar mi CV →' : 'Empezar mi CV →' })
        : el('span', { class: 'dpp-pro', text: 'Próximamente' });
    return el('article', { class: `dpp-card ${COLORES[i] || ''}${activa ? ' act' : ''}`.trim() },
        el('span', { class: 'dpp-nodo', 'aria-hidden': 'true' }),
        el('div', { class: 'dpp-num', text: String(i + 1).padStart(2, '0') }),
        el('span', { class: 'dpp-et', text: parte.etiqueta + (activa ? ' · estás aquí' : '') }),
        el('h3', { text: parte.titulo }),
        el('p', { class: 'dpp-sub', text: parte.subtitulo }),
        el('p', { class: 'dpp-texto', text: parte.texto }),
        activa && resumen && resumen.empezado ? el('p', { class: 'dpp-estado', text: `Tu avance: ${resumen.texto}` }) : null,
        pie);
}

function pintar(resumen) {
    const listas = resumen && resumen.listo ? 1 : 0;
    $('#dpHub').replaceChildren(...PARTES_HUB.map((p, i) => tarjeta(p, i, p.id === 'cv' ? resumen : null)));
    $('#dpProgreso').textContent = `Tu progreso: ${listas} de ${PARTES_HUB.length} partes listas`;
    $('#dpCta').textContent = resumen && resumen.empezado ? 'Continuar mi CV' : 'Empezar mi CV';
}

async function iniciar() {
    if (!(await accesoPermitido())) return;
    $('#dpLema').textContent = LEMA;
    $('#dpPrivacidad').textContent = NOTA_PRIVACIDAD;
    pintar(null);                                            // la portada se ve de inmediato, con o sin cuenta cargada
    try {
        const listo = await Promise.race([SigaEstado.listo.then(() => true), new Promise((r) => setTimeout(() => r(false), 8000))]);
        if (listo) pintar(resumenCV(crearDesarrollo(SigaEstado).leerCV()));
    } catch (e) { console.warn('desarrollo: no se pudo leer el avance', e); }
}

iniciar();
