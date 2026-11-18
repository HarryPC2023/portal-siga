// js/desarrollo-hub.js — Página «Desarrollo profesional»: las tres partes y cuánto lleva avanzado el alumno.
//
// Los textos vienen de js/desarrollo-contenido.js. El avance sale de las reglas del semáforo sobre lo que
// el alumno ya guardó (SigaEstado, módulo «desarrollo»); si no carga, el hub se ve igual, sin avance.
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

// Botcito de SIGA con maletín (versión de esta sección).
const botSVG = () => `<svg class="dp-bot" viewBox="0 0 150 140" role="img" aria-label="Botcito de SIGA con maletín">
    <line x1="60" y1="6" x2="60" y2="24" stroke="#7B3FC4" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="6" r="5" fill="#F5C7E6" stroke="#C13F94" stroke-width="2"/>
    <rect x="20" y="34" width="80" height="60" rx="26" fill="#fff" stroke="#7B3FC4" stroke-width="3"/>
    <rect x="31" y="45" width="58" height="38" rx="18" fill="#2B2260"/>
    <ellipse class="dp-ojo" cx="47" cy="63" rx="5.5" ry="6.5" fill="#7FF0F5"/>
    <ellipse class="dp-ojo" cx="73" cy="63" rx="5.5" ry="6.5" fill="#7FF0F5"/>
    <path d="M52 74 Q60 80 68 74" fill="none" stroke="#7FF0F5" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="34" y="96" width="52" height="26" rx="13" fill="#E4CAF6" stroke="#7B3FC4" stroke-width="3"/>
    <circle cx="24" cy="106" r="7" fill="#C9F4F7" stroke="#0E7C86" stroke-width="2.5"/>
    <circle cx="60" cy="109" r="4.5" fill="#F5C7E6"/>
    <path d="M108 100 v-7 a4 4 0 0 1 4 -4 h16 a4 4 0 0 1 4 4 v7" fill="none" stroke="#7B3FC4" stroke-width="3" stroke-linecap="round"/>
    <rect x="98" y="100" width="46" height="32" rx="7" fill="#F9C74F" stroke="#B7791F" stroke-width="3"/>
    <rect x="98" y="112" width="46" height="4" fill="#B7791F" opacity=".35"/>
    <rect x="117" y="109" width="8" height="9" rx="2" fill="#fff" stroke="#B7791F" stroke-width="2"/>
    <circle cx="96" cy="106" r="7" fill="#C9F4F7" stroke="#0E7C86" stroke-width="2.5"/>
</svg>`;

const ICONOS = {
    proyectos: '<path d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16"/>',
    cv: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6M10 9h2"/>',
    entrevista: '<path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2v3l-4-3h-4"/>',
};
const ETIQUETAS = ['1 · Crea experiencia', '2 · Impulsa tu perfil', '3 · Demuestra tu potencial'];

function icono(id) {
    const n = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    n.setAttribute('viewBox', '0 0 24 24'); n.setAttribute('fill', 'none'); n.setAttribute('stroke', '#fff');
    n.setAttribute('stroke-width', '2'); n.setAttribute('stroke-linecap', 'round'); n.setAttribute('stroke-linejoin', 'round');
    n.setAttribute('aria-hidden', 'true'); n.innerHTML = ICONOS[id] || '';
    return n;
}

function tarjeta(parte, i, resumen) {
    const activa = parte.disponible;
    const pie = activa
        ? el('a', { class: 'dp-btn dp-btn-primario dp-enlace', href: parte.enlace, text: resumen && resumen.empezado ? 'Continuar mi CV' : 'Empezar mi CV' })
        : el('span', { class: 'dp-chip dp-chip-gris', text: 'Próximamente' });
    return el('article', { class: `dp-card-hub${activa ? ' dp-card-activa' : ''}` },
        el('span', { class: 'dp-card-etiqueta', text: ETIQUETAS[i] }),
        el('span', { class: 'dp-card-icono' }, icono(parte.id)),
        el('h3', { text: parte.titulo }),
        el('p', { class: 'dp-card-sub', text: parte.subtitulo }),
        el('p', { class: 'dp-suave', text: parte.texto }),
        activa && resumen ? el('p', { class: 'dp-estado-cv', text: resumen.texto }) : null,
        pie);
}

function pintar(resumen) {
    const listas = resumen && resumen.listo ? 1 : 0;
    $('#dpHub').replaceChildren(...PARTES_HUB.map((p, i) => tarjeta(p, i, p.id === 'cv' ? resumen : null)));
    $('#dpProgreso').textContent = `${listas} de ${PARTES_HUB.length} partes listas`;
    if (resumen && resumen.empezado) {
        $('#dpBannerTitulo').textContent = resumen.listo ? 'Tu CV está listo para revisar' : 'Continúa con tu CV';
        $('#dpBannerTexto').textContent = `Tu avance: ${resumen.texto}. Puedes seguir cuando quieras: se guarda solo.`;
        $('#dpBannerBtn').textContent = 'Continuar mi CV';
    }
}

async function iniciar() {
    if (!(await accesoPermitido())) return;
    $('#dpLema').textContent = LEMA;
    $('#dpBot').innerHTML = botSVG();
    $('#dpPrivacidad').textContent = NOTA_PRIVACIDAD;
    pintar(null);                                            // el hub se ve de inmediato, con o sin cuenta cargada
    try {
        const listo = await Promise.race([SigaEstado.listo.then(() => true), new Promise((r) => setTimeout(() => r(false), 8000))]);
        if (listo) pintar(resumenCV(crearDesarrollo(SigaEstado).leerCV()));
    } catch (e) { console.warn('desarrollo: no se pudo leer el avance', e); }
}

iniciar();
