// js/cv-disenos.js — Los diseños de la hoja del CV: Profesional, Moderno y Creativo.
//
// Archivo PURO: recibe los datos del CV y unas opciones, devuelve texto HTML. No toca la pantalla ni la cuenta.
// Todo lo que escribe el alumno pasa por esc() antes de entrar al HTML. Los estilos viven en css/cv-disenos.css.
//
// Dos cosas a tener presentes:
//   · El orden del HTML es el orden de lectura (lo que leen los filtros automáticos): primero el nombre y el contenido principal,
//     después el lateral. La posición en la hoja la decide el CSS, no el orden del HTML.
//   · La foto es opcional. Sin foto, la vista previa muestra una silueta de ejemplo (opciones.ejemplo) y el PDF no la incluye.

import { esc, periodoFormacion, periodoDe, conEnlaces, TIPO_CERT } from './cv-documento.js?v=4';
import { detalleIdioma } from './desarrollo-redaccion.js?v=2';
import { esEnlaceWeb } from './desarrollo-reglas.js?v=2';

// ───────────── catálogo: diseños y colores ─────────────
export const DISENOS = [
    {
        id: 'profesional', nombre: 'Profesional', colorBase: 'violeta', unaHoja: false,
        descripcion: 'Una columna, encabezado con corte y títulos con línea. Puede ocupar más de una hoja.',
        nota: 'Una sola columna y texto limpio: es el diseño que mejor leen los filtros automáticos de las empresas.',
    },
    {
        id: 'moderno', nombre: 'Moderno', colorBase: 'petroleo', unaHoja: true,
        descripcion: 'Dos columnas: banda de color arriba y un lateral con tus datos, habilidades e idiomas. Ocupa una hoja.',
        nota: 'Usa dos columnas e íconos: se ve mejor en persona o por correo que en portales de postulación automática.',
    },
    {
        id: 'creativo', nombre: 'Creativo', colorBase: 'terracota', unaHoja: true,
        descripcion: 'Tarjetas de distintos tamaños, tu foto en un círculo, cifras y niveles con puntos y anillos. Ocupa una hoja.',
        nota: 'Es el diseño más visual y el que peor leen los filtros automáticos: úsalo para enviar por correo o entregar en persona, no en portales de postulación.',
    },
];

// Textos de la pantalla de Revisión sobre foto y extensión.
export const NOTA_FOTO = 'Tu foto se guarda solo en este dispositivo: no se sube a SIGA. Para verla en otro dispositivo, súbela allí también.';
export const NOTA_FOTO_MONOGRAMA = 'Si no subes una foto, el diseño Creativo muestra tus iniciales dentro del círculo.';
export const NOTA_FOTO_SILUETA = 'La silueta es solo un ejemplo para que veas cómo queda el diseño. Si no subes una foto, tu CV sale sin ella.';
export const AVISO_UNA_HOJA = 'Este diseño está pensado para una sola página y tu contenido supera ese espacio. Puedes elegir el diseño Profesional para continuar con un formato que admite más contenido.';
export const AVISO_FOTO_NO_GUARDADA = 'La foto se verá mientras tengas esta página abierta, pero tu navegador no permitió guardarla en este dispositivo.';
export const AVISO_FOTO_ERROR = 'No pudimos usar esa imagen. Prueba con otra foto (JPG, PNG o WebP).';

// ac/tint/line los usan los tres diseños. c2 y c3 son dos tonos de acompañamiento que usa solo el Creativo
// (c2: herramientas y puntos de nivel; c3: habilidades personales). Cada color los trae elegidos para que no choquen con su acento.
const C2 = { ac: '#E9B44C', bg: '#FBF0D3', tx: '#7A5612' };    // arena
const C3 = { ac: '#5E8C6A', bg: '#E3F0E6', tx: '#2F5A3B' };    // salvia
const C3_CORAL = { ac: '#D9775A', bg: '#FBE6DF', tx: '#8A3A24' };   // para el verde petróleo, donde la salvia quedaría apagada
export const COLORES = {
    violeta:   { nombre: 'Violeta',        ac: '#4C2A85', tint: '#ECE7F5', line: '#CFC4E6', c2: C2, c3: C3 },
    petroleo:  { nombre: 'Verde petróleo', ac: '#0F6B63', tint: '#E3F1EE', line: '#BFDCD6', c2: C2, c3: C3_CORAL },
    vino:      { nombre: 'Vino',           ac: '#8A2342', tint: '#F6E6EB', line: '#E4BFCB', c2: C2, c3: C3 },
    terracota: { nombre: 'Terracota',      ac: '#B4532A', tint: '#FAEBE2', line: '#EBC8B5', c2: C2, c3: C3 },
    azul:      { nombre: 'Azul',           ac: '#23395B', tint: '#E6ECF4', line: '#C5D1E2', c2: C2, c3: C3 },
};

// Mezcla de dos colores #rrggbb: pct = cuánto del segundo color (0–1).
function mezcla(a, b, pct) {
    const n = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [n(a), n(b)];
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * pct).toString(16).padStart(2, '0')).join('');
}

// Diseño elegido (o el primero si no hay nada válido guardado) y color elegido (o el propio del diseño).
export function disenoDe(ajustes) {
    const id = (ajustes && ajustes.diseno) || '';
    return DISENOS.find((d) => d.id === id) || DISENOS[0];
}
export function colorDe(ajustes, diseno = disenoDe(ajustes)) {
    const id = (ajustes && ajustes.color) || '';
    return COLORES[id] ? id : diseno.colorBase;
}

// Variables CSS de la hoja: color de acento y espaciado (el espaciado lo recorta el ajuste automático a una página).
export function variablesHoja(colorId, params = {}) {
    const c = COLORES[colorId] || COLORES.violeta;
    const v = { '--ac': c.ac, '--tint': c.tint, '--line': c.line };
    // Solo los usa el Creativo: acento oscuro (para texto), fondo de las etiquetas y los dos tonos de acompañamiento.
    v['--ac-dk'] = mezcla(c.ac, '#000000', 0.3);
    v['--tint2'] = mezcla('#ffffff', c.ac, 0.2);
    v['--c2'] = c.c2.ac; v['--c2-bg'] = c.c2.bg; v['--c2-tx'] = c.c2.tx;
    v['--c3'] = c.c3.ac; v['--c3-bg'] = c.c3.bg; v['--c3-tx'] = c.c3.tx;
    if (params.fs) v['--cv-fs'] = `${params.fs}pt`;
    if (params.sec) v['--cv-sec'] = String(params.sec);
    if (params.lh) v['--cv-lh'] = String(params.lh);
    if (params.gp) v['--cv-gp'] = String(params.gp);
    return v;
}
export const estiloEnLinea = (vars) => Object.entries(vars).map(([k, x]) => `${k}:${x}`).join(';');

// ───────────── íconos (decorativos, nunca llevan texto) ─────────────
const ICONOS = {
    mail: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pin: '<path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>',
    linkedin: '<path d="M8 11v5"/><path d="M8 8v.01"/><path d="M12 16v-5"/><path d="M16 16v-3a2 2 0 1 0-4 0"/><path d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/>',
    github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    school: '<path d="M22 9L12 5 2 9l10 4 10-4v6"/><path d="M6 10.6V16a6 3 0 0 0 12 0v-5.4"/>',
    folder: '<path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2"/>',
    briefcase: '<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13a20 20 0 0 0 18 0"/>',
    certificate: '<path d="M12 15m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"/><path d="M10 7h4"/><path d="M10 18H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><path d="M9 20l3-1.5 3 1.5"/>',
    user: '<path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>',
    bolt: '<path d="M13 3v7h6l-8 11v-7H5z"/>',
    idioma: '<path d="M4 5h7"/><path d="M9 3v2c0 4.4-2.2 8-5 8"/><path d="M5 9c0 2.1 3 3.9 6.7 4"/><path d="M12 20l4-9 4 9"/><path d="M19.1 18h-6.2"/>',
    award: '<path d="M12 9m-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0"/><path d="M12 15l3.4 5.9 1.6-3.2 3.6.2-3.4-5.9"/><path d="M6.8 12l-3.4 5.9 3.6-.2 1.6 3.2 3.4-5.9"/>',
};
const ico = (nombre) => `<svg class="cv-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONOS[nombre] || ''}</svg>`;

const SILUETA = '<svg class="cv-sil" viewBox="0 0 100 118" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
    + '<rect width="100" height="118" fill="#dfe4ec"/><circle cx="50" cy="46" r="19" fill="#9aa5b4"/><ellipse cx="50" cy="112" rx="38" ry="31" fill="#9aa5b4"/></svg>';

// ───────────── datos de la hoja (los mismos para los dos diseños) ─────────────
const t = (v) => (typeof v === 'string' ? v.trim() : '');
const lineas = (v) => t(v).split(/\n+/).map(t).filter(Boolean);
const esFotoValida = (v) => typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v);

function datosHoja(cv) {
    const d = cv.datos || {}, f = cv.formacion || {};
    const { periodo, situacion } = periodoFormacion(f);
    const carrera = t(f.carrera);
    const cursos = (Array.isArray(f.cursos) ? f.cursos : []).map(t).filter(Boolean).slice(0, 5);
    const hayFormacion = !!(t(f.universidad) || carrera || t(f.ingreso) || t(f.egreso) || f.egresado === true || t(f.promedio) || cursos.length);

    const hab = (cv.habilidades || []).filter((h) => t(h.nombre));
    const de = (cat) => hab.filter((h) => h.categoria === cat);
    const conNivel = (h) => t(h.nombre) + (t(h.nivel) ? ` (${t(h.nivel).toLowerCase()})` : '');

    const contacto = [
        ['mail', t(d.correo)], ['phone', t(d.telefono)], ['linkedin', t(d.linkedin)], ['github', t(d.github)], ['pin', t(d.distrito)],
    ].filter(([, x]) => x).map(([icono, texto]) => ({ icono, texto }));

    return {
        nombre: t(d.nombre) || 'Tu nombre',
        subtitulo: carrera ? (situacion ? `${situacion} de ${carrera}` : carrera) : '',
        contacto,
        perfil: lineas((cv.perfil || {}).texto),
        formacion: hayFormacion ? { universidad: t(f.universidad), carrera, situacion, periodo, cursos, promedio: t(f.promedio) } : null,
        proyectos: (cv.proyectos || []).filter((p) => t(p.nombre) || t(p.queHiciste) || t(p.herramientas) || t(p.evidencia))
            .map((p) => ({ nombre: t(p.nombre), fecha: periodoDe(p), queHiciste: t(p.queHiciste), evidencia: t(p.evidencia), herramientas: t(p.herramientas) })),
        experiencias: (cv.experiencias || []).filter((e) => t(e.puesto) || t(e.queHiciste))
            .map((e) => ({ puesto: t(e.puesto), organizacion: t(e.organizacion), fecha: periodoDe(e, 'Actualidad'), queHiciste: t(e.queHiciste) })),
        certificaciones: (cv.certificaciones || []).filter((c) => t(c.nombre) || t(c.institucion)),
        logros: (cv.logros || []).filter((l) => t(l.texto)),
        habilidades: {
            tecnica: de('tecnica').map(conNivel),
            herramienta: de('herramienta').map(conNivel),
            personal: de('personal').map((h) => t(h.nombre)),
            idioma: de('idioma').map((h) => {
                const dentro = [t(h.nivel).toLowerCase(), detalleIdioma(h)].filter(Boolean).join('; ');
                return t(h.nombre) + (dentro ? ` (${dentro})` : '');
            }),
        },
    };
}

const claseNombre = (n) => (n.length <= 16 ? 'cv-n1' : n.length <= 22 ? 'cv-n2' : n.length <= 30 ? 'cv-n3' : 'cv-n4');

// Texto de una descripción: una línea → párrafo; varias → viñetas.
function queHiciste(texto) {
    const ls = lineas(texto);
    if (!ls.length) return '';
    if (ls.length === 1) return `<p class="cv-p">${esc(ls[0])}</p>`;
    return '<ul class="cv-ul">' + ls.map((l) => `<li>${esc(l)}</li>`).join('') + '</ul>';
}
const parrafos = (ls) => ls.map((l) => `<p class="cv-p">${esc(l)}</p>`).join('');
// Datos de contacto clicables en el PDF. El texto que se ve no cambia; solo se agrega el enlace cuando se puede armar uno seguro.
function hrefContacto(c) {
    const x = (c.texto || '').trim();
    if (!x || /\s/.test(x)) return '';
    if (c.icono === 'mail') return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(x) ? `mailto:${x}` : '';
    if (c.icono === 'linkedin' || c.icono === 'github') {
        if (esEnlaceWeb(x)) return x;
        return /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+\/\S+$/i.test(x) && esEnlaceWeb('https://' + x) ? 'https://' + x : '';
    }
    return '';
}
const textoContacto = (c) => {
    const h = hrefContacto(c);
    return h ? `<a href="${esc(h)}" rel="noopener noreferrer" target="_blank">${esc(c.texto)}</a>` : esc(c.texto);
};
const sub = (txt) => (txt ? `<p class="cv-p cv-suave">${txt}</p>` : '');

function itemsCertificaciones(lista) {
    return '<ul class="cv-ul">' + lista.map((c) => {
        const nombre = esc(t(c.nombre)) + (TIPO_CERT[t(c.tipo)] ? ` (${TIPO_CERT[t(c.tipo)]})` : '');
        const resto = [esc(t(c.institucion)), esc(t(c.anio))].filter(Boolean).join(' · ');
        const enlace = esEnlaceWeb(c.enlace) ? ` — <a href="${esc(t(c.enlace))}" rel="noopener noreferrer" target="_blank">${esc(t(c.enlace))}</a>` : '';
        return `<li>${[nombre, resto].filter(Boolean).join(' · ')}${enlace}</li>`;
    }).join('') + '</ul>';
}
function itemsLogros(lista) {
    return '<ul class="cv-ul">' + lista.map((l) => `<li>${esc(t(l.texto))}${t(l.respaldo) ? ` — ${conEnlaces(l.respaldo)}` : ''}</li>`).join('') + '</ul>';
}

function htmlFoto(op, clase) {
    if (esFotoValida(op.foto)) return `<img class="cv-foto ${clase}" src="${op.foto}" alt="">`;
    if (op.ejemplo) return `<span class="cv-foto cv-foto-ejemplo ${clase}">${SILUETA}</span>`;
    return '';
}
const hayFoto = (op) => esFotoValida(op.foto) || !!op.ejemplo;

const VACIO = '<p class="cv-p cv-suave">Tu CV aparecerá aquí a medida que completes los pasos.</p>';

// ───────────── diseño Profesional: una columna ─────────────
function htmlProfesional(cv, op) {
    const h = datosHoja(cv);
    const conFoto = hayFoto(op);
    const cuerpo = [];
    const sec = (titulo, contenido) => cuerpo.push(`<section class="pf-sec"><h2 class="pf-h2">${esc(titulo)}</h2>${contenido}</section>`);
    const fila = (principal, fecha) => `<div class="pf-item"><div class="pf-fila"><div class="pf-main">${principal}</div>${fecha ? `<p class="pf-fecha">${esc(fecha)}</p>` : ''}</div></div>`;

    if (h.perfil.length) sec('Perfil profesional', parrafos(h.perfil));
    if (h.formacion) {
        const f = h.formacion;
        const l1 = f.universidad ? `<p class="cv-p"><strong>${esc(f.universidad)}</strong></p>` : '';
        const l2 = [f.carrera, f.situacion].filter(Boolean).join(' · ');
        sec('Formación', fila(l1 + sub(esc(l2))
            + (f.cursos.length ? sub(`Cursos relevantes: ${esc(f.cursos.join(', '))}`) : '')
            + (f.promedio ? sub(`Promedio académico: ${esc(f.promedio)}`) : ''), f.periodo));
    }
    if (h.proyectos.length) {
        sec('Proyectos', h.proyectos.map((p) => fila(
            (p.nombre ? `<p class="cv-p"><strong>${esc(p.nombre)}</strong></p>` : '')
            + queHiciste(p.queHiciste)
            + (p.evidencia ? sub(`Resultado o evidencia: ${conEnlaces(p.evidencia)}`) : '')
            + (p.herramientas ? sub(`<strong>Herramientas:</strong> ${esc(p.herramientas)}`) : ''), p.fecha)).join(''));
    }
    if (h.experiencias.length) {
        sec('Experiencia', h.experiencias.map((e) => fila(
            (e.puesto ? `<p class="cv-p"><strong>${esc(e.puesto)}</strong></p>` : '')
            + (e.organizacion ? sub(esc(e.organizacion)) : '')
            + queHiciste(e.queHiciste), e.fecha)).join(''));
    }
    if (h.certificaciones.length) sec('Certificaciones y formación complementaria', itemsCertificaciones(h.certificaciones));
    const g = h.habilidades;
    const grupos = [['Conocimientos', g.tecnica], ['Herramientas', g.herramienta], ['Idiomas', g.idioma], ['Habilidades personales', g.personal]].filter(([, l]) => l.length);
    if (grupos.length) {
        sec('Habilidades', '<div class="pf-hab">' + grupos.map(([titulo, l]) => `<div class="pf-hab-g"><p class="pf-sh">${esc(titulo)}</p><ul class="cv-ul">${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('') + '</div>');
    }
    if (h.logros.length) sec('Logros', itemsLogros(h.logros));
    if (!cuerpo.length) cuerpo.push(VACIO);

    const contacto = h.contacto.map((c) => `<span class="pf-c">${ico(c.icono)}<span>${textoContacto(c)}</span></span>`).join('');
    return `<div class="pf${conFoto ? ' pf-con-foto' : ''}">`
        + '<header class="pf-cab">'
        + '<svg class="pf-banda" viewBox="0 0 210 70" aria-hidden="true" focusable="false">'
        + '<polygon points="0,0 210,0 210,39 0,53.25" style="fill:var(--ac)"/>'
        + (conFoto ? '<circle cx="176.25" cy="42" r="18.75" fill="#fff"/><path d="M 176.25 18.75 A 23.25 23.25 0 1 1 153 42" style="fill:none;stroke:var(--ac);stroke-width:.95;stroke-linecap:round"/>' : '')
        + '</svg>'
        + `<div class="pf-tit"><h1 class="pf-nombre ${claseNombre(h.nombre)}">${esc(h.nombre)}</h1>${h.subtitulo ? `<p class="pf-sub">${esc(h.subtitulo)}</p>` : ''}</div>`
        + htmlFoto(op, 'pf-foto')
        + (contacto ? `<p class="pf-contacto">${contacto}</p>` : '')
        + '</header>'
        + `<div class="pf-cuerpo">${cuerpo.join('')}</div></div>`;
}

// ───────────── diseño Moderno: banda arriba + lateral izquierdo ─────────────
function nombreEnDos(nombre) {
    const p = nombre.split(/\s+/).filter(Boolean);
    if (p.length <= 1) return { a: nombre, b: '' };
    const k = p.length >= 4 ? 2 : 1;
    return { a: p.slice(0, k).join(' '), b: p.slice(k).join(' ') };
}

function htmlModerno(cv, op) {
    const h = datosHoja(cv);
    const conFoto = hayFoto(op);
    const { a, b } = nombreEnDos(h.nombre);
    const g = h.habilidades;

    const principal = [];
    const pastilla = (icono, titulo) => `<h2 class="md-h2"><span class="md-pil">${ico(icono)}<span>${esc(titulo)}</span></span></h2>`;
    const sec = (icono, titulo, contenido) => principal.push(`<section class="md-sec">${pastilla(icono, titulo)}${contenido}</section>`);
    const item = (fecha, cuerpoItem) => `<div class="md-item">${fecha ? `<span class="md-fecha">${esc(fecha)}</span>` : ''}${cuerpoItem}</div>`;

    if (h.perfil.length) principal.push(`<div class="md-perfil">${parrafos(h.perfil)}</div>`);
    if (h.formacion) {
        const f = h.formacion;
        const l1 = f.universidad ? `<p class="cv-p"><strong>${esc(f.universidad)}</strong></p>` : '';
        const l2 = [f.carrera, f.situacion].filter(Boolean).join(' · ');
        sec('school', 'Formación', item(f.periodo, l1 + sub(esc(l2))
            + (f.cursos.length ? sub(`Cursos relevantes: ${esc(f.cursos.join(', '))}`) : '')
            + (f.promedio ? sub(`Promedio académico: ${esc(f.promedio)}`) : '')));
    }
    if (h.proyectos.length) {
        sec('folder', 'Proyectos', h.proyectos.map((p) => item(p.fecha,
            (p.nombre ? `<p class="cv-p"><strong>${esc(p.nombre)}</strong></p>` : '')
            + queHiciste(p.queHiciste)
            + (p.evidencia ? sub(`Resultado o evidencia: ${conEnlaces(p.evidencia)}`) : '')
            + (p.herramientas ? sub(`<strong>Herramientas:</strong> ${esc(p.herramientas)}`) : ''))).join(''));
    }
    if (h.experiencias.length) {
        sec('briefcase', 'Experiencia', h.experiencias.map((e) => item(e.fecha,
            (e.puesto ? `<p class="cv-p"><strong>${esc(e.puesto)}</strong></p>` : '')
            + (e.organizacion ? sub(esc(e.organizacion)) : '')
            + queHiciste(e.queHiciste))).join(''));
    }
    if (h.certificaciones.length) sec('certificate', 'Certificaciones y formación complementaria', itemsCertificaciones(h.certificaciones));
    if (h.logros.length) sec('award', 'Logros', itemsLogros(h.logros));
    if (!principal.length) principal.push(VACIO);

    const chips = (l) => l.map((x) => `<span class="md-chip">${esc(x)}</span>`).join('');
    const grupo = (titulo, l) => (l.length ? `<p class="md-sh">${esc(titulo)}</p><div class="md-chips">${chips(l)}</div>` : '');
    const habil = grupo('Conocimientos', g.tecnica) + grupo('Herramientas', g.herramienta) + grupo('Personales', g.personal);

    const lateral = [];
    if (h.contacto.length) lateral.push(`<section class="md-lsec"><h2 class="md-lt">Contacto</h2>${h.contacto.map((c) => `<p class="md-c">${ico(c.icono)}<span>${textoContacto(c)}</span></p>`).join('')}</section>`);
    if (habil) lateral.push(`<section class="md-lsec"><h2 class="md-lt">Habilidades</h2>${habil}</section>`);
    if (g.idioma.length) lateral.push(`<section class="md-lsec"><h2 class="md-lt">Idiomas</h2>${g.idioma.map((x) => `<p class="cv-p">${esc(x)}</p>`).join('')}</section>`);

    return `<div class="md${conFoto ? ' md-con-foto' : ''}">`
        + '<div class="md-banda" aria-hidden="true"></div>'
        + `<header class="md-cab"><h1 class="md-nombre ${claseNombre(h.nombre)}"><span class="md-a">${esc(a)}</span>${b ? ` <span class="md-b">${esc(b)}</span>` : ''}</h1>${h.subtitulo ? `<p class="md-sub">${esc(h.subtitulo)}</p>` : ''}</header>`
        + htmlFoto(op, 'md-foto')
        + `<main class="md-pri">${principal.join('')}</main>`
        + `<aside class="md-lat">${lateral.join('')}</aside></div>`;
}

// ───────────── diseño Creativo: cabecera con círculo + tarjetas de distintos tamaños ─────────────
const NIVEL_N = { 'básico': 1, 'intermedio': 2, 'avanzado': 3 };
const nivelN = (h) => NIVEL_N[t(h.nivel).toLowerCase()] || 0;
const plural = (n, uno, varios) => (n === 1 ? uno : varios);

function iniciales(nombre) {
    const p = nombre.split(/\s+/).filter(Boolean);
    if (!p.length) return '';
    const k = p.length >= 4 ? 2 : 1;
    const a = p[0][0] || '', b = p.length > 1 ? (p[k][0] || '') : (p[0][1] || '');
    return (a + b).toUpperCase();
}

function htmlCreativo(cv, op) {
    const h = datosHoja(cv);
    const { a, b } = nombreEnDos(h.nombre);
    const hab = (cv.habilidades || []).filter((x) => t(x.nombre));
    const de = (cat) => hab.filter((x) => x.categoria === cat);
    const g = h.habilidades;

    const tarjeta = (clase, icono, titulo, contenido) => `<section class="cr-card ${clase}"><h2 class="cr-ti"><span class="cr-md">${ico(icono)}</span>${esc(titulo)}</h2>${contenido}</section>`;
    const chips = (l, k) => l.map((x) => `<span class="cr-chip ${k}">${esc(x)}</span>`).join('');
    const rotulo = (txt) => `<p class="cr-sh">${esc(txt)}</p>`;
    const lleno = (lista) => lista.length > 0;

    // Cifras: hasta cuatro, solo de lo que de verdad hay. Con menos de dos no se muestran.
    const idiomas = de('idioma');
    const cifras = [
        [h.proyectos.length, plural(h.proyectos.length, 'Proyecto', 'Proyectos')],
        [h.experiencias.length, plural(h.experiencias.length, 'Experiencia', 'Experiencias')],
        [h.certificaciones.length, plural(h.certificaciones.length, 'Certificación', 'Certificaciones')],
        [idiomas.length, plural(idiomas.length, 'Idioma', 'Idiomas')],
        [h.logros.length, plural(h.logros.length, 'Logro', 'Logros')],
    ].filter(([n]) => n > 0).slice(0, 4);
    const franja = cifras.length >= 2
        ? `<div class="cr-cf" style="--n:${cifras.length}">${cifras.map(([n, et]) => `<div><b>${n}</b><span>${esc(et)}</span></div>`).join('')}</div>` : '';

    // Cabecera.
    const foto = esFotoValida(op.foto)
        ? `<img class="cv-foto cr-foto" src="${op.foto}" alt="">`
        : `<span class="cv-foto cr-foto cr-mono" aria-hidden="true">${esc(iniciales(h.nombre))}</span>`;
    const contacto = h.contacto.map((c) => `<span class="cr-c">${ico(c.icono)}<span>${textoContacto(c)}</span></span>`).join('');
    const cabecera = '<header class="cr-cab">'
        + `<div class="cr-tit"><h1 class="cr-nombre ${claseNombre(h.nombre)}"><span class="cr-a">${esc(a)}</span>${b ? ` <span class="cr-b">${esc(b)}</span>` : ''}</h1>${h.subtitulo ? `<p class="cr-sub">${esc(h.subtitulo)}</p>` : ''}</div>`
        + foto
        + (contacto ? `<p class="cr-contacto">${contacto}</p>` : '')
        + '</header>';

    // Fila de arriba: perfil + formación.
    const f = h.formacion;
    const bloqueFormacion = f ? tarjeta('cr-o', 'school', 'Formación',
        (f.universidad ? `<p class="cv-p"><strong>${esc(f.universidad)}</strong></p>` : '')
        + sub(esc([f.carrera, f.situacion].filter(Boolean).join(' · ')))
        + (f.periodo ? `<span class="cr-yr">${esc(f.periodo)}</span>` : '')
        + (f.cursos.length ? sub(`Cursos relevantes: ${esc(f.cursos.join(', '))}`) : '')
        + (f.promedio ? sub(`Promedio académico: ${esc(f.promedio)}`) : '')) : '';
    const bloquePerfil = h.perfil.length ? tarjeta('cr-t', 'user', 'Perfil', parrafos(h.perfil)) : '';
    const filaArriba = (bloquePerfil ? `<div class="${f ? 'cr-s4' : 'cr-s6'}">${bloquePerfil}</div>` : '')
        + (bloqueFormacion ? `<div class="${bloquePerfil ? 'cr-s2' : 'cr-s6'}">${bloqueFormacion}</div>` : '');

    // Proyectos: tarjetas con franja de color arriba, en dos columnas.
    const proyectos = h.proyectos.length
        ? `<div class="cr-s6"><h2 class="cr-ti cr-ti-s"><span class="cr-md">${ico('folder')}</span>Proyectos destacados</h2><div class="cr-proys">`
        + h.proyectos.map((p, i) => '<article class="cr-pj"><div class="cr-bar' + (i % 2 ? ' cr-bar2' : '') + '"></div><div class="cr-in">'
            + `<div class="cr-tt">${p.nombre ? `<strong>${esc(p.nombre)}</strong>` : '<span></span>'}${p.fecha ? `<span class="cr-f">${esc(p.fecha)}</span>` : ''}</div>`
            + queHiciste(p.queHiciste)
            + (p.evidencia ? sub(`Resultado o evidencia: ${conEnlaces(p.evidencia)}`) : '')
            + (p.herramientas ? `<div class="cr-chips"><span class="cr-vh">Herramientas: </span>${chips(p.herramientas.split(/\s*[,;·]\s*/).filter(Boolean), 'cr-k2')}</div>` : '')
            + '</div></article>').join('')
        + '</div></div>' : '';

    // Columna izquierda: experiencia, logros, idiomas. Columna derecha: habilidades, certificaciones.
    const izq = [];
    if (h.experiencias.length) {
        izq.push(tarjeta('cr-o', 'briefcase', 'Experiencia', h.experiencias.map((e) => '<div class="cr-tl"><i></i>'
            + (e.puesto ? `<p class="cv-p"><strong>${esc(e.puesto)}</strong></p>` : '')
            + sub(esc([e.organizacion, e.fecha].filter(Boolean).join(' · ')))
            + queHiciste(e.queHiciste) + '</div>').join('')));
    }
    if (h.logros.length) izq.push(tarjeta('cr-o', 'award', 'Logros y actividades', itemsLogros(h.logros)));
    if (idiomas.length) {
        izq.push(tarjeta('cr-o', 'idioma', 'Idiomas', '<div class="cr-idiomas">' + idiomas.map((x) => {
            const n = nivelN(x);
            const detalle = detalleIdioma(x);
            const anillo = n ? `<svg class="cr-anillo" viewBox="0 0 42 42" aria-hidden="true" focusable="false"><circle cx="21" cy="21" r="16" class="cr-pista"/><circle cx="21" cy="21" r="16" class="cr-arco" stroke-dasharray="${(100.5 * n / 3).toFixed(1)} 100.5" transform="rotate(-90 21 21)"/></svg>` : '';
            return `<div class="cr-idi">${anillo}<span><strong>${esc(t(x.nombre))}</strong>${t(x.nivel) ? `<br><span class="cv-suave">${esc(t(x.nivel))}</span>` : ''}${detalle ? `<br><span class="cv-suave cr-det">${esc(detalle)}</span>` : ''}</span></div>`;
        }).join('') + '</div>'));
    }
    const der = [];
    const herr = de('herramienta');
    if (lleno(g.tecnica) || lleno(herr) || lleno(g.personal)) {
        der.push(tarjeta('cr-t', 'bolt', 'Habilidades',
            (lleno(g.tecnica) ? rotulo('Conocimientos') + `<div class="cr-chips">${chips(g.tecnica, 'cr-k1')}</div>` : '')
            + (lleno(herr) ? rotulo('Herramientas') + herr.map((x) => {
                const n = nivelN(x);
                const pts = n ? `<span class="cr-pts" aria-hidden="true">${[1, 2, 3].map((k) => `<u${k > n ? ' class="of"' : ''}></u>`).join('')}</span><span class="cr-vh"> (${esc(t(x.nivel).toLowerCase())})</span>` : '';
                return `<div class="cr-hr"><span>${esc(t(x.nombre))}</span>${pts}</div>`;
            }).join('') : '')
            + (lleno(g.personal) ? rotulo('Personales') + `<div class="cr-chips">${chips(g.personal, 'cr-k3')}</div>` : '')));
    }
    if (h.certificaciones.length) der.push(tarjeta('cr-o', 'certificate', 'Certificaciones', itemsCertificaciones(h.certificaciones)));
    const abajo = (izq.length ? `<div class="${der.length ? 'cr-s3' : 'cr-s6'} cr-col">${izq.join('')}</div>` : '')
        + (der.length ? `<div class="${izq.length ? 'cr-s3' : 'cr-s6'} cr-col">${der.join('')}</div>` : '');

    const cuerpo = filaArriba + proyectos + abajo;
    return `<div class="cr">${cabecera}${franja}<div class="cr-g">${cuerpo || `<div class="cr-s6">${VACIO}</div>`}</div></div>`;
}

// ───────────── entrada principal ─────────────
// opciones: { diseno: 'profesional' | 'moderno' | 'creativo', foto: 'data:image/jpeg;base64,…' | null, ejemplo: true | false }
export function htmlHoja(cv = {}, opciones = {}) {
    if (opciones.diseno === 'moderno') return htmlModerno(cv, opciones);
    if (opciones.diseno === 'creativo') return htmlCreativo(cv, opciones);
    return htmlProfesional(cv, opciones);
}
