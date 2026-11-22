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

// Periodo de la carrera y situación del alumno, a partir de los años que puso (basta el año, no hace falta el mes).
//   2023 – 2027 (previsto) · Estudiante      2019 – 2024 · Egresado      2023 – actualidad · Estudiante
// «previsto» sale solo cuando el año de egreso es futuro (o es este año y no marcó «Ya egresé»). Sin año de egreso y sin marcar «Ya egresé»
// se muestra «actualidad». Lo que no es un año de 4 dígitos se muestra tal cual lo escribió: no se adivina.
export function periodoFormacion(f = {}, anio = new Date().getFullYear()) {
    const ing = t(f.ingreso), egr = t(f.egreso);
    const esAnio = (v) => /^\d{4}$/.test(v);
    const nEgr = esAnio(egr) ? Number(egr) : null;
    const previsto = nEgr !== null && (nEgr > anio || (nEgr === anio && f.egresado !== true));
    const egresado = (f.egresado === true && !(nEgr !== null && nEgr > anio)) || (nEgr !== null && nEgr < anio);
    let periodo = '';
    if (ing && egr) periodo = `${ing} – ${egr}${previsto ? ' (previsto)' : ''}`;
    else if (ing) periodo = egresado ? ing : `${ing} – actualidad`;
    else if (egr) periodo = `${egr}${previsto ? ' (previsto)' : ''}`;
    const situacion = egresado ? 'Egresado' : (ing || egr) ? 'Estudiante' : '';
    return { periodo, situacion };
}

// «2024 – actualidad», «2025», «marzo de 2025 – noviembre de 2025» o '' si no puso fechas.
export function periodoDe(p, sinFechaSigue = 'En desarrollo') {
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

// Texto libre del alumno → HTML seguro: todo se escapa y solo las direcciones http/https se vuelven enlaces
// (se muestra la dirección completa, para que también se vea al imprimir).
export function conEnlaces(crudo) {
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

export const TIPO_CERT = { certificacion: 'certificación', curso: 'curso', diplomado: 'diplomado', programa: 'programa' };

// Un solo proyecto o experiencia tal como saldrá en el CV (la usa la tarjeta del constructor). '' si todavía no hay nada que mostrar.
export function htmlItemPrevia(tipo, item = {}) {
    if (tipo === 'proyecto') return (t(item.nombre) || t(item.queHiciste) || t(item.herramientas) || t(item.evidencia)) ? htmlProyectos([item]) : '';
    if (tipo === 'experiencia') return (t(item.puesto) || t(item.queHiciste)) ? htmlExperiencia([item]) : '';
    return '';
}
