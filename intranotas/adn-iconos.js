// adn-iconos.js — Íconos del ADN académico: los 8 perfiles, los estados sin perfil, los íconos de las tarjetas
// (foquito, gráfico, brújula) y la HÉLICE inclinada de dos colores que gira suave (botón del lateral y cabecera).
// Cada ícono es un dibujo SVG de 48×48 con sus colores tradicionales. Módulo sin dependencias.

const CUERPOS = {
    // ---- Perfiles ----
    rem: '<path d="M5 41h38" stroke="#C4B5E8" stroke-width="2.5" stroke-linecap="round"/><path d="M7 36L17 30L25 33L35 19L41 12V41H7Z" fill="#FDE3E2"/><path d="M7 36L17 30L25 33L35 19L41 12" fill="none" stroke="#E53935" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 10H42V20" fill="none" stroke="#FF8A00" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17" cy="30" r="2.4" fill="#E53935"/><circle cx="25" cy="33" r="2.4" fill="#E53935"/>',
    mad: '<circle cx="24" cy="26" r="15" fill="#fff" stroke="#FB8C00" stroke-width="4"/><path d="M24 17v9l6 4" fill="none" stroke="#14102a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13a7 7 0 0 1 9-6M40 13a7 7 0 0 0-9-6" fill="none" stroke="#E53935" stroke-width="4" stroke-linecap="round"/><path d="M10 42l4-5M38 42l-4-5" stroke="#FB8C00" stroke-width="3.2" stroke-linecap="round"/>',
    esp: '<path d="M15 3h8l5 15h-8Z" fill="#E53935"/><path d="M33 3h-8l-5 15h8Z" fill="#B71C1C"/><circle cx="24" cy="31" r="13" fill="#FFB400" stroke="#E69100" stroke-width="2"/><circle cx="24" cy="31" r="8.5" fill="#FFD966"/><path d="M24 25l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6Z" fill="#E67E00"/>',
    cim: '<rect x="6" y="13" width="36" height="28" rx="2" fill="#F1D9C4"/><rect x="8" y="15" width="15" height="7" rx="1" fill="#E5703A"/><rect x="25" y="15" width="15" height="7" rx="1" fill="#D9582B"/><rect x="8" y="24" width="7" height="7" rx="1" fill="#D9582B"/><rect x="17" y="24" width="15" height="7" rx="1" fill="#E5703A"/><rect x="34" y="24" width="6" height="7" rx="1" fill="#D9582B"/><rect x="8" y="33" width="15" height="6" rx="1" fill="#E5703A"/><rect x="25" y="33" width="15" height="6" rx="1" fill="#D9582B"/><rect x="4" y="41" width="40" height="4" rx="2" fill="#6B7280"/>',
    fin: '<path d="M14 6h20v12a10 10 0 0 1-20 0Z" fill="#FFC107" stroke="#E69100" stroke-width="2"/><path d="M14 10H8a5 5 0 0 0 7 9M34 10h6a5 5 0 0 1-7 9" fill="none" stroke="#E69100" stroke-width="3" stroke-linecap="round"/><rect x="21" y="28" width="6" height="8" fill="#E69100"/><rect x="14" y="36" width="20" height="6" rx="2" fill="#D81B60"/><path d="M24 11l1.7 3.5 3.8.5-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.5Z" fill="#fff"/>',
    met: '<rect x="6" y="9" width="36" height="33" rx="5" fill="#fff" stroke="#5C6BC0" stroke-width="3"/><rect x="6" y="9" width="36" height="10" rx="5" fill="#5C6BC0"/><path d="M15 5v8M33 5v8" stroke="#FF7043" stroke-width="4" stroke-linecap="round"/><path d="M12 27l3 3 5-6M26 27l3 3 5-6M12 36l3 3 5-6M26 36l3 3 5-6" fill="none" stroke="#22A06B" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
    con: '<path d="M5 24h38" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="3 3"/><path d="M5 24q6-12 12 0t12 0t12 0" fill="none" stroke="#22A06B" stroke-width="3.4" stroke-linecap="round"/><circle cx="17" cy="24" r="2.8" fill="#0EA5E9"/><circle cx="41" cy="24" r="2.8" fill="#0EA5E9"/>',
    equ: '<path d="M24 9v29" stroke="#14102a" stroke-width="3" stroke-linecap="round"/><rect x="15" y="38" width="18" height="5" rx="2" fill="#14102a"/><path d="M8 14h32" stroke="#FFB400" stroke-width="3.2" stroke-linecap="round"/><circle cx="24" cy="8" r="3.2" fill="#FFB400"/><path d="M10 14l-5 12M10 14l5 12M38 14l-5 12M38 14l5 12" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/><path d="M3 26h14a7 5 0 0 1-14 0Z" fill="#3B82F6"/><path d="M31 26h14a7 5 0 0 1-14 0Z" fill="#FF7A00"/>',
    // ---- Estados sin perfil ----
    form: '<path d="M24 40V22" stroke="#22A06B" stroke-width="3.2" stroke-linecap="round"/><path d="M24 26C24 17 17 12 9 13c0 9 6 14 15 13Z" fill="#6EC27B"/><path d="M24 22c0-9 7-14 15-13 0 9-6 14-15 13Z" fill="#9BDB86"/><path d="M14 41h20" stroke="#8B6B4A" stroke-width="3" stroke-linecap="round"/>',
    sun: '<path d="M10 33a14 14 0 0 1 28 0Z" fill="#FFB400"/><path d="M24 6v6M8 15l4 4M40 15l-4 4M3 31h5M40 31h5" stroke="#FF8A00" stroke-width="3" stroke-linecap="round"/><path d="M5 37h38" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/><path d="M13 43h22" stroke="#93C5FD" stroke-width="3" stroke-linecap="round"/>',
    pocos: '<rect x="12" y="26" width="9" height="16" rx="2" fill="#90A4AE"/><rect x="27" y="16" width="9" height="26" rx="2" fill="#B0BEC5"/><path d="M6 43h36" stroke="#78909C" stroke-width="3" stroke-linecap="round"/>',
    mix: '<circle cx="12" cy="14" r="5" fill="#E53935"/><circle cx="30" cy="10" r="4" fill="#FFB400"/><circle cx="38" cy="26" r="5.5" fill="#2563EB"/><circle cx="18" cy="30" r="4.5" fill="#22A06B"/><circle cx="30" cy="40" r="4" fill="#D81B60"/><circle cx="9" cy="42" r="3.5" fill="#00ACC1"/>',
    // ---- Tarjetas ----
    bulb: '<path d="M24 5a13 13 0 0 0-7 24c1.5 1.3 2 2.6 2 4h10c0-1.4.5-2.7 2-4A13 13 0 0 0 24 5Z" fill="#FFD43B" stroke="#F59F00" stroke-width="2"/><path d="M20 19q4 4 8 0" stroke="#F59F00" fill="none" stroke-width="1.8" stroke-linecap="round"/><rect x="19" y="35" width="10" height="3.5" rx="1.5" fill="#9CA3AF"/><rect x="20.5" y="39.5" width="7" height="3.5" rx="1.7" fill="#6B7280"/><path d="M24 0.5v2.5M5 10l2 2M43 10l-2 2M1.5 22h3M43.5 22h3" stroke="#F59F00" stroke-width="2" stroke-linecap="round"/>',
    chart: '<rect x="3" y="28" width="9" height="18" fill="#5B9BFF"/><rect x="14" y="16" width="9" height="30" fill="#F25F6B"/><rect x="25" y="28" width="9" height="18" fill="#FFC24D"/><rect x="36" y="15" width="9" height="31" fill="#9189FF"/><path d="M4 24L17 11L27 22L41 8" fill="none" stroke="#9ED36A" stroke-width="4.5" stroke-linejoin="miter"/><path d="M32 4H45V17Z" fill="#9ED36A"/>',
    comp: '<circle cx="24" cy="24" r="22" fill="#7DB9EC"/><circle cx="24" cy="24" r="19.5" fill="#FFF6F8" stroke="#8A3B3B" stroke-width="0.8"/><path d="M24 6l3 15-3 3-3-3Z" fill="#F6C945" stroke="#8A3B3B" stroke-width="0.6"/><path d="M24 42l3-15-3-3-3 3Z" fill="#F6C945" stroke="#8A3B3B" stroke-width="0.6"/><path d="M6 24l15-3 3 3-3 3Z" fill="#F6C945" stroke="#8A3B3B" stroke-width="0.6"/><path d="M42 24l-15-3-3 3 3 3Z" fill="#F6C945" stroke="#8A3B3B" stroke-width="0.6"/><circle cx="24" cy="24" r="8" fill="#F9A8D4" stroke="#8A3B3B" stroke-width="0.7"/><circle cx="24" cy="24" r="5.6" fill="#7DB9EC"/><path d="M35 9L26.5 23 24 24 22.5 22.5 33 7Z" fill="#E02D2D"/><path d="M13 39L21.5 25 24 24 25.5 25.5 15 41Z" fill="#E02D2D"/><circle cx="24" cy="24" r="2.4" fill="#7B1E3A"/>',
};

/* Ícono estático como texto HTML (para usar dentro de plantillas). */
export function svgIcono(clave, px = 24) {
    const cuerpo = CUERPOS[clave];
    if (!cuerpo) return '';
    return `<svg class="adn-ico" viewBox="0 0 48 48" width="${px}" height="${px}" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
}

/* ---------- Hélice inclinada de dos colores (roja y amarilla), con peldaños grises ---------- */
const NS = 'http://www.w3.org/2000/svg';
const COLOR_A = '#E53935', COLOR_B = '#FFB400', COLOR_PELDANO = '#64748B';
const PUNTOS = 9, INCLINACION = (-38 * Math.PI) / 180;
const EJE = [Math.cos(INCLINACION), Math.sin(INCLINACION)];
const PERP = [-EJE[1], EJE[0]];

const helices = new Set();
let animando = false;
const sinMovimiento = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function dibujar(h, t) {
    const fase = t * 1.8;
    for (let i = 0; i < PUNTOS; i++) {
        const d = -21 + i * 5.25, f = i * 0.85 + fase, o = 8.5 * Math.sin(f), prof = Math.cos(f);
        const xa = 24 + EJE[0] * d + PERP[0] * o, ya = 24 + EJE[1] * d + PERP[1] * o;
        const xb = 24 + EJE[0] * d - PERP[0] * o, yb = 24 + EJE[1] * d - PERP[1] * o;
        h.peldanos[i].setAttribute('x1', xa.toFixed(1)); h.peldanos[i].setAttribute('y1', ya.toFixed(1));
        h.peldanos[i].setAttribute('x2', xb.toFixed(1)); h.peldanos[i].setAttribute('y2', yb.toFixed(1));
        h.a[i].setAttribute('cx', xa.toFixed(1)); h.a[i].setAttribute('cy', ya.toFixed(1)); h.a[i].setAttribute('r', (2.9 + 1.1 * prof).toFixed(2));
        h.b[i].setAttribute('cx', xb.toFixed(1)); h.b[i].setAttribute('cy', yb.toFixed(1)); h.b[i].setAttribute('r', (2.9 - 1.1 * prof).toFixed(2));
    }
}

function bucle(ahora) {
    for (const h of helices) {
        if (!h.svg.isConnected) { if (h.visto) helices.delete(h); continue; }   // ya no está en la página: se deja de animar
        h.visto = true;
        dibujar(h, ahora / 1000);
    }
    if (helices.size) requestAnimationFrame(bucle); else animando = false;
}

export function crearHelice(px = 26) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 48 48'); svg.setAttribute('width', px); svg.setAttribute('height', px);
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); svg.setAttribute('class', 'adn-ico adn-helice');
    const nuevo = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); svg.appendChild(e); return e; };
    const peldanos = Array.from({ length: PUNTOS }, () => nuevo('line', { stroke: COLOR_PELDANO, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
    const a = Array.from({ length: PUNTOS }, () => nuevo('circle', { fill: COLOR_A }));
    const b = Array.from({ length: PUNTOS }, () => nuevo('circle', { fill: COLOR_B }));
    const h = { svg, peldanos, a, b, visto: false };
    dibujar(h, 0.5);
    if (!sinMovimiento()) {
        helices.add(h);
        if (!animando) { animando = true; requestAnimationFrame(bucle); }
    }
    return svg;
}
