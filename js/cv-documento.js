// js/cv-documento.js — Convierte los datos del CV en el HTML de la hoja (vista previa e impresión).
//
// Archivo PURO: recibe datos, devuelve texto HTML. Una sola columna, sin tablas, sin imágenes ni íconos,
// con títulos y listas normales, para que los filtros automáticos de las empresas lo lean bien.
// Todo lo que escribe el alumno pasa por esc() antes de entrar al HTML.

import { detalleIdioma } from './desarrollo-redaccion.js?v=2';
import { esEnlaceWeb } from './desarrollo-reglas.js?v=2';

export function esc(valor) {
    return String(valor == null ? '' : valor).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

const t = (v) => (typeof v === 'string' ? v.trim() : '');
const unir = (partes, sep = ' · ') => partes.filter(Boolean).join(sep);

function seccion(titulo, cuerpo) {
    return `<section class="dp-cv-sec"><h2 class="dp-cv-h2">${esc(titulo)}</h2>${cuerpo}</section>`;
}

function htmlFormacion(f = {}) {
    const linea1 = unir([t(f.universidad), t(f.carrera), t(f.ingreso) ? `${esc(t(f.ingreso))} – actualidad` : ''].map((x, i) => (i < 2 ? esc(x) : x)));
    const cursos = (Array.isArray(f.cursos) ? f.cursos : []).map(t).filter(Boolean).slice(0, 5);
    const partes = [];
    if (linea1) partes.push(`<p class="dp-cv-p">${linea1}</p>`);
    if (cursos.length) partes.push(`<p class="dp-cv-p dp-cv-suave">Cursos relevantes: ${esc(cursos.join(', '))}</p>`);
    if (t(f.promedio)) partes.push(`<p class="dp-cv-p dp-cv-suave">Promedio académico: ${esc(t(f.promedio))}</p>`);
    return partes.join('');
}

// «2024 – actualidad», «2025», «marzo de 2025 – noviembre de 2025» o '' si no puso fechas.
function periodoDe(p, sinFechaSigue = 'En desarrollo') {
    const d = t(p.desde), h = t(p.hasta);
    if (p.sigue) return d ? `${d} – actualidad` : sinFechaSigue;
    if (d && h) return d === h ? d : `${d} – ${h}`;
    return d || h;
}

function htmlProyectos(lista) {
    return lista.map((p) => {
        const titulo = unir([t(p.nombre) ? `<strong>${esc(t(p.nombre))}</strong>` : '', esc(periodoDe(p)), esc(t(p.herramientas))]);
        return '<div class="dp-cv-item">'
            + (titulo ? `<p class="dp-cv-p">${titulo}</p>` : '')
            + (t(p.queHiciste) ? `<p class="dp-cv-p">${esc(t(p.queHiciste))}</p>` : '')
            + (t(p.evidencia) ? `<p class="dp-cv-p dp-cv-suave">Resultado o evidencia: ${esc(t(p.evidencia))}</p>` : '')
            + '</div>';
    }).join('');
}

function htmlExperiencia(lista) {
    return lista.map((e) => {
        const titulo = unir([t(e.puesto) ? `<strong>${esc(t(e.puesto))}</strong>` : '', esc(t(e.organizacion)), esc(periodoDe(e, 'Actualidad'))]);
        return '<div class="dp-cv-item">'
        + (titulo ? `<p class="dp-cv-p">${titulo}</p>` : '')
        + (t(e.queHiciste) ? `<p class="dp-cv-p">${esc(t(e.queHiciste))}</p>` : '')
        + '</div>';
    }).join('');
}

function htmlHabilidades(lista) {
    const de = (cat) => lista.filter((h) => h.categoria === cat && t(h.nombre));
    const conNivel = (h) => t(h.nombre) + (t(h.nivel) ? ` (${t(h.nivel).toLowerCase()})` : '');   // sin nivel: solo el nombre, como siempre
    const filas = [];
    const tec = de('tecnica').map(conNivel);
    const her = de('herramienta').map(conNivel);
    // Idiomas: igual que antes («Inglés (intermedio)»); si completó el detalle: «Inglés (intermedio; lectura avanzada, expresión oral básica)».
    const idi = de('idioma').map((h) => {
        const dentro = [t(h.nivel).toLowerCase(), detalleIdioma(h)].filter(Boolean).join('; ');
        return t(h.nombre) + (dentro ? ` (${dentro})` : '');
    });
    const per = de('personal').map((h) => t(h.nombre));
    if (tec.length) filas.push(`<p class="dp-cv-p"><strong>Conocimientos:</strong> ${esc(tec.join(', '))}</p>`);
    if (her.length) filas.push(`<p class="dp-cv-p"><strong>Herramientas:</strong> ${esc(her.join(', '))}</p>`);
    if (idi.length) filas.push(`<p class="dp-cv-p"><strong>Idiomas:</strong> ${esc(idi.join(', '))}</p>`);
    if (per.length) filas.push(`<p class="dp-cv-p"><strong>Habilidades personales:</strong> ${esc(per.join(', '))}</p>`);
    return filas.join('');
}

// Texto libre del alumno → HTML seguro: todo se escapa y solo las direcciones http/https se vuelven enlaces
// (se muestra la dirección completa, para que también se vea al imprimir).
function conEnlaces(crudo) {
    const s = t(crudo);
    const re = /https?:\/\/[^\s<>"']+/gi;
    let salida = '', desde = 0, m;
    while ((m = re.exec(s))) {
        const url = m[0].replace(/[.,;:)\]]+$/, '');
        salida += esc(s.slice(desde, m.index));
        salida += esEnlaceWeb(url) ? `<a href="${esc(url)}" rel="noopener noreferrer" target="_blank">${esc(url)}</a>` : esc(url);
        desde = m.index + url.length;
        re.lastIndex = desde;
    }
    return salida + esc(s.slice(desde));
}

function htmlLogros(lista) {
    return '<ul class="dp-cv-ul">' + lista.map((l) => `<li>${esc(t(l.texto))}${t(l.respaldo) ? ` — ${conEnlaces(l.respaldo)}` : ''}</li>`).join('') + '</ul>';
}

const TIPO_CERT = { certificacion: 'certificación', curso: 'curso', diplomado: 'diplomado', programa: 'programa' };

function htmlCertificaciones(lista) {
    return '<ul class="dp-cv-ul">' + lista.map((c) => {
        const nombre = esc(t(c.nombre)) + (TIPO_CERT[t(c.tipo)] ? ` (${TIPO_CERT[t(c.tipo)]})` : '');
        const resto = [esc(t(c.institucion)), esc(t(c.anio))].filter(Boolean).join(' · ');
        const enlace = esEnlaceWeb(c.enlace) ? ` — <a href="${esc(t(c.enlace))}" rel="noopener noreferrer" target="_blank">${esc(t(c.enlace))}</a>` : '';
        return `<li>${[nombre, resto].filter(Boolean).join(' · ')}${enlace}</li>`;
    }).join('') + '</ul>';
}

export function htmlCV(cv = {}) {
    const d = cv.datos || {};
    const proyectos = (cv.proyectos || []).filter((p) => t(p.nombre) || t(p.queHiciste) || t(p.herramientas) || t(p.evidencia));
    const experiencias = (cv.experiencias || []).filter((e) => t(e.puesto) || t(e.queHiciste));
    const habilidades = (cv.habilidades || []).filter((h) => t(h.nombre));
    const certificaciones = (cv.certificaciones || []).filter((c) => t(c.nombre) || t(c.institucion));
    const logros = (cv.logros || []).filter((l) => t(l.texto));
    const f = cv.formacion || {};
    const hayFormacion = t(f.universidad) || t(f.carrera) || t(f.ingreso) || t(f.promedio) || (Array.isArray(f.cursos) && f.cursos.some((c) => t(c)));

    const contacto = unir([t(d.correo), t(d.telefono), t(d.linkedin), t(d.github), t(d.distrito)].map(esc));
    const cabecera = `<header class="dp-cv-cab"><h1 class="dp-cv-h1">${esc(t(d.nombre) || 'Tu nombre')}</h1>`
        + (contacto ? `<p class="dp-cv-contacto">${contacto}</p>` : '') + '</header>';

    const partes = [];
    if (hayFormacion) partes.push(seccion('Formación', htmlFormacion(f)));
    if (proyectos.length) partes.push(seccion('Proyectos', htmlProyectos(proyectos)));
    if (experiencias.length) partes.push(seccion('Experiencia', htmlExperiencia(experiencias)));
    if (certificaciones.length) partes.push(seccion('Certificaciones y formación complementaria', htmlCertificaciones(certificaciones)));
    if (habilidades.length) partes.push(seccion('Habilidades', htmlHabilidades(habilidades)));
    if (logros.length) partes.push(seccion('Logros', htmlLogros(logros)));

    if (!partes.length && !t(d.nombre) && !contacto) {
        return cabecera + '<p class="dp-cv-p dp-cv-suave">Tu CV aparecerá aquí a medida que completes los pasos.</p>';
    }
    return cabecera + partes.join('');
}
