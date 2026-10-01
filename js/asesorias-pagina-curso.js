// js/asesorias-pagina-curso.js — Página de UN curso de Asesorías (lógica de la página).
// ⚠️ No confundir con asesorias-cursos.js (con "s"), que es el CATÁLOGO de cursos.
// Aquí va:  cabecera, material
// general, ruta de evaluaciones (PC1, PC2, EP, PC3, PC4, EF, ES), visor de
// PDF y web, "Lo necesito" por evaluación y reporte de errores.
// Se abre con asesorias-curso.html?c=<slug>  (y &abrir=<id> para abrir un recurso).
import { abrirVisorPDF, abrirVisorWeb } from './asesorias-visor.js?v=2';
import {
    CURSOS, EVALUACIONES, NOMBRE_EVALUACION, cursoPorSlug, estadoEvaluacion,
    recursosGenerales, tieneContenido, planDelCurso,
} from './asesorias-cursos.js?v=1';
import {
    PORTADA, esc, estiloAttr, estiloCurso, cargarMisVotos, alternarVoto, claveVoto,
    recordarUltimo, abrirReporte, aviso,
} from './asesorias-comun.js?v=1';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const curso = cursoPorSlug(params.get('c'));
const abrirId = params.get('abrir');
const evParam = params.get('ev');
const raiz = $('anCurso');
let votos = new Set();

const disponible = (r) => (r.estado || 'disponible') === 'disponible';

function recursoHTML(r) {
    const accion = r.tipo === 'pdf' ? 'Ver PDF' : 'Abrir web interactiva';
    return `
        <div class="an-rec">
            <div class="an-rec-tx"><b>${esc(r.titulo)}</b>${r.descripcion ? `<p>${esc(r.descripcion)}</p>` : ''}
                <span class="an-por">Hecha por ${esc(r.por || 'Harry')}</span></div>
            <div class="an-rec-ac">
                <button type="button" class="an-btn" data-abrir="${esc(r.id)}">${accion}</button>
                <button type="button" class="an-link" data-reportar="${esc(r.id)}">Reportar un error</button>
            </div>
        </div>`;
}

function filaGeneral(r) {
    return `
        <div class="an-ev" data-fila="mono">
            <div class="an-dot an-dot-ok">✓</div>
            <div class="an-ev-card">
                <button type="button" class="an-ev-top" data-estado="ok" aria-expanded="true"><b>Mono</b><span class="an-t">${esc(r.titulo)}</span><span class="an-est an-est-ok">Disponible</span></button>
                <div class="an-det">${recursoHTML(r)}</div>
            </div>
        </div>`;
}

function filaEvaluacion(ev) {
    const estado = estadoEvaluacion(curso, ev);
    const recs = curso.recursos.filter((r) => r.evaluacion === ev && disponible(r));
    if (estado === 'disponible') {
        return `
        <div class="an-ev" data-fila="${ev}">
            <div class="an-dot an-dot-ok">✓</div>
            <div class="an-ev-card">
                <button type="button" class="an-ev-top" data-estado="ok" aria-expanded="false"><b>${ev}</b><span class="an-t">${NOMBRE_EVALUACION[ev]}</span><span class="an-est an-est-ok">Disponible</span></button>
                <div class="an-det" hidden>${recs.map(recursoHTML).join('')}</div>
            </div>
        </div>`;
    }
    if (estado === 'preparacion') {
        return `
        <div class="an-ev" data-fila="${ev}">
            <div class="an-dot an-dot-prep">◷</div>
            <div class="an-ev-card"><div class="an-ev-top" style="cursor:default"><b>${ev}</b><span class="an-t">${NOMBRE_EVALUACION[ev]}</span><span class="an-est an-est-prep">En preparación</span></div></div>
        </div>`;
    }
    return `
        <div class="an-ev" data-fila="${ev}">
            <div class="an-dot an-dot-falta">+</div>
            <div class="an-ev-card">
                <button type="button" class="an-ev-top" data-estado="falta" data-ev="${ev}"><b>${ev}</b><span class="an-t">${NOMBRE_EVALUACION[ev]}</span><span class="an-est an-est-falta" data-etq>Lo necesito</span></button>
            </div>
        </div>`;
}

function cabecera() {
    const e = estiloCurso(curso);
    const n = curso.recursos.filter(disponible).length;
    const pct = Math.round((100 * n) / (1 + EVALUACIONES.length));
    const plan = planDelCurso(curso);
    return `
        <div class="an-migas"><a href="${PORTADA}">← Asesorías</a> / ${esc(curso.nombre)}</div>
        <section class="an-cab" style="${estiloAttr(curso)}">
            <div class="an-g">${esc(e.glifo)}</div>
            <div>
                <h1>${esc(curso.nombre)}</h1>
                <div class="an-chips"><span>Ciclo ${curso.ciclo}</span><span>${curso.creditos} créditos</span><span>${esc(plan)}</span></div>
            </div>
            <div class="an-prog"><b>${n} ${n === 1 ? 'recurso listo' : 'recursos listos'}</b>
                <div class="an-barra"><i style="width:${pct}%"></i></div></div>
        </section>`;
}

function pintar() {
    document.title = `${curso.nombre} - Asesorías - SIGA`;
    if (!tieneContenido(curso)) {
        raiz.innerHTML = `${cabecera()}
            <section class="an-card an-vacio-curso">
                <h2 style="font-size:16px">Este curso aún no tiene material</h2>
                <p>Todavía no hay asesorías publicadas para ${esc(curso.nombre)}. Si lo necesitas, avísanos: así sabemos cuál preparar primero.</p>
                <button type="button" class="an-btn an-btn-ghost" data-lo-curso>Lo necesito</button>
            </section>`;
        return;
    }
    const generales = recursosGenerales(curso).filter(disponible);
    raiz.innerHTML = `${cabecera()}
        <section class="an-ruta">
            <h2>Ruta de evaluaciones</h2>
            ${generales.length ? `<div class="an-grp">Material del curso</div>${generales.map(filaGeneral).join('')}` : ''}
            <div class="an-grp">Evaluaciones</div>
            ${EVALUACIONES.map(filaEvaluacion).join('')}
        </section>`;
}

function marcarEtiqueta(btn, activo) {
    const etq = btn.querySelector('[data-etq]');
    if (!etq) return;
    etq.textContent = activo ? 'Anotado ✓' : 'Lo necesito';
    etq.classList.toggle('an-on', activo);
}

function aplicarVotos() {
    raiz.querySelectorAll('[data-estado="falta"]').forEach((b) => marcarEtiqueta(b, votos.has(claveVoto(curso.codigo, b.dataset.ev))));
    const lc = raiz.querySelector('[data-lo-curso]');
    if (lc) { const on = votos.has(claveVoto(curso.codigo, null)); lc.textContent = on ? 'Anotado ✓' : 'Lo necesito'; lc.classList.toggle('an-on', on); }
}

async function alternarVotoUI(evaluacion, pintarEstado, boton) {
    const k = claveVoto(curso.codigo, evaluacion);
    const activar = !votos.has(k);
    pintarEstado(activar);
    boton.disabled = true;
    const ok = await alternarVoto(curso.codigo, evaluacion, activar);
    boton.disabled = false;
    if (ok) { if (activar) votos.add(k); else votos.delete(k); }
    else { pintarEstado(!activar); aviso('No se pudo guardar. Intenta de nuevo en un momento.', 'error'); }
}

function abrirRecurso(id) {
    const r = curso.recursos.find((x) => x.id === id);
    if (!r) return;
    recordarUltimo(curso.slug, r.id);
    if (r.tipo === 'pdf') abrirVisorPDF(r.src, r.titulo);
    else abrirVisorWeb(r.src, r.titulo);
}

function conectar() {
    raiz.addEventListener('click', (e) => {
        const abrir = e.target.closest('[data-abrir]');
        if (abrir) { abrirRecurso(abrir.dataset.abrir); return; }

        const rep = e.target.closest('[data-reportar]');
        if (rep) {
            const r = curso.recursos.find((x) => x.id === rep.dataset.reportar);
            if (r) abrirReporte({ codigo_curso: curso.codigo, recurso_id: r.id, titulo: r.titulo });
            return;
        }

        const lc = e.target.closest('[data-lo-curso]');
        if (lc) {
            alternarVotoUI(null, (on) => { lc.textContent = on ? 'Anotado ✓' : 'Lo necesito'; lc.classList.toggle('an-on', on); }, lc);
            return;
        }

        const top = e.target.closest('.an-ev-top');
        if (!top) return;
        if (top.dataset.estado === 'ok') {
            const det = top.parentElement.querySelector('.an-det');
            const abierto = !det.hidden;
            det.hidden = abierto;
            top.setAttribute('aria-expanded', String(!abierto));
        } else if (top.dataset.estado === 'falta') {
            alternarVotoUI(top.dataset.ev, (on) => marcarEtiqueta(top, on), top);
        }
    });
}

// Abre y resalta la evaluación (o el material general) que pidió el enlace: ?ev=PC1, ?ev=mono…
function enfocarFila(ev) {
    if (!tieneContenido(curso) || !['mono', ...EVALUACIONES].includes(ev)) return;
    const fila = raiz.querySelector(`.an-ev[data-fila="${ev}"]`);
    if (!fila) return;
    const top = fila.querySelector('.an-ev-top');
    const det = fila.querySelector('.an-det');
    if (top && top.dataset.estado === 'ok' && det && det.hidden) { det.hidden = false; top.setAttribute('aria-expanded', 'true'); }
    const tarjeta = fila.querySelector('.an-ev-card');
    fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
    tarjeta.classList.add('an-resalta');
    setTimeout(() => tarjeta.classList.remove('an-resalta'), 2400);
}

function pintarOtros() {
    const otros = CURSOS.filter((c) => c.slug !== curso.slug && tieneContenido(c));
    if (!otros.length) return;
    $('anOtros').innerHTML = otros.map((c) => `
        <a class="an-mini" style="${estiloAttr(c)}" href="asesorias-curso.html?c=${encodeURIComponent(c.slug)}">
            <span class="an-mg">${esc(estiloCurso(c).glifo)}</span>
            <span><b>${esc(c.nombre)}</b><small>Ciclo ${c.ciclo} · con material</small></span>
        </a>`).join('') + `<a class="an-ver-todos" href="${PORTADA}">Ver todos los cursos →</a>`;
    $('anOtrosBox').hidden = false;
}

if (!curso) {
    document.title = 'Curso no encontrado - Asesorías - SIGA';
    raiz.innerHTML = `<div class="an-migas"><a href="${PORTADA}">← Asesorías</a></div>
        <section class="an-card an-vacio-curso"><h2 style="font-size:16px">No encontramos ese curso</h2>
        <p>Puede que el enlace esté incompleto. Vuelve a Asesorías y elígelo desde ahí.</p>
        <a class="an-btn" href="${PORTADA}">Ir a Asesorías</a></section>`;
} else {
    pintar();
    conectar();
    pintarOtros();
    cargarMisVotos().then((set) => { votos = set; aplicarVotos(); });
    if (evParam) setTimeout(() => enfocarFila(evParam), 200);
    if (abrirId && curso.recursos.some((r) => r.id === abrirId && disponible(r))) setTimeout(() => abrirRecurso(abrirId), 250);
}