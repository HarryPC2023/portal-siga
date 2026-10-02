// js/asesorias-portada.js — Portada de Asesorías: saludo, buscador de cursos,
// "Continúa donde quedaste", "Comparte tu asesoría", filtros por ciclo y la
// cuadrícula de cursos (con "Lo necesito" en los que aún no tienen material).
import { supabase, obtenerSesion } from './auth-siga.js?v=9';
import {
    CURSOS, EVALUACIONES, NOMBRE_EVALUACION, tieneContenido, ciclosDisponibles, planDelCurso,
    estadoEvaluacion, recursosGenerales, cursoTieneNovedad, recursosNuevos,
} from './asesorias-cursos.js?v=1';
import {
    esc, normalizar, estiloAttr, estiloCurso, botcitoSVG, cargarMisVotos, alternarVoto,
    claveVoto, leerUltimo, abrirFormCompartir, aviso,
} from './asesorias-comun.js?v=1';

const $ = (id) => document.getElementById(id);

let votos = new Set();
let cicloSel = 0;
let consulta = '';

// ───────────── Saludo ─────────────
async function saludar() {
    try {
        const sesion = await obtenerSesion();
        if (!sesion) return;
        const { data } = await supabase.from('perfiles_usuario').select('nombre').eq('user_id', sesion.user.id).maybeSingle();
        const nombre = data && data.nombre ? String(data.nombre).trim() : '';
        $('anSaludo').textContent = nombre ? `Hola, ${nombre} 👋` : 'Hola 👋';
    } catch (e) { /* se queda el saludo simple */ }
}

// ───────────── Fila superior: Continúa + Comparte ─────────────
function pintarFila() {
    const ultimo = leerUltimo();
    const curso = ultimo ? CURSOS.find((c) => c.slug === ultimo.slug) : null;
    const rec = curso ? curso.recursos.find((r) => r.id === ultimo.id && (r.estado || 'disponible') === 'disponible') : null;

    const continuar = (curso && rec) ? `
        <div class="an-card an-cont" style="${estiloAttr(curso)}">
            <div class="an-ic">${esc(estiloCurso(curso).glifo)}</div>
            <div style="flex:1;min-width:0">
                <small>Continúa donde quedaste</small>
                <h3>${esc(curso.nombre)} · ${esc(rec.titulo.split(' — ')[0])}</h3>
                <small>${rec.tipo === 'pdf' ? 'PDF' : 'Página web'}</small>
            </div>
            <a class="an-btn" href="asesorias-curso.html?c=${encodeURIComponent(curso.slug)}&abrir=${encodeURIComponent(rec.id)}">Continuar</a>
        </div>` : '';

    const compartir = `
        <div class="an-card an-share">
            ${botcitoSVG()}
            <div style="flex:1;min-width:180px"><h3>¿Hiciste una asesoría que ayudó a otros?</h3>
                <p>Compártela en SIGA y llega a más compañeros. Puede salir con tu nombre.</p></div>
            <button type="button" class="an-btn an-btn-blanco" id="anCompartir">Comparte tu asesoría</button>
        </div>`;

    const fila = $('anFila');
    fila.classList.toggle('an-dos', Boolean(continuar));
    fila.innerHTML = continuar + compartir;
    $('anCompartir').addEventListener('click', () => abrirFormCompartir({ tab: 'compartir' }));
}

// ───────────── Filtros por ciclo ─────────────
function pintarFiltros() {
    const cont = $('anFiltros');
    const chips = [{ v: 0, t: 'Todos' }, ...ciclosDisponibles().map((c) => ({ v: c, t: `Ciclo ${c}` }))];
    cont.insertAdjacentHTML('beforeend', chips.map((c) =>
        `<button type="button" class="an-chip${c.v === 0 ? ' on' : ''}" data-ciclo="${c.v}">${c.t}</button>`).join(''));
    cont.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ciclo]');
        if (!b) return;
        cicloSel = Number(b.dataset.ciclo);
        cont.querySelectorAll('.an-chip').forEach((x) => x.classList.toggle('on', x === b));
        pintarCursos();
    });
}

// ───────────── Cuadrícula de cursos ─────────────
// Si el curso tiene material, cada evaluación es un enlace: lleva a la página del
// curso con esa evaluación abierta y resaltada. Si no tiene, son solo una vista previa.
function tira(curso) {
    const con = tieneContenido(curso);
    const base = `asesorias-curso.html?c=${encodeURIComponent(curso.slug)}`;
    const pastilla = (ev, on, etiqueta, nombre) => (con
        ? `<a class="an-p${on ? ' on' : ''}" href="${base}&ev=${ev}" title="${esc(nombre)}" aria-label="${esc(nombre)} de ${esc(curso.nombre)}">${etiqueta}</a>`
        : `<span class="an-p">${etiqueta}</span>`);
    const pills = EVALUACIONES.map((e) => pastilla(e, estadoEvaluacion(curso, e) === 'disponible', e, NOMBRE_EVALUACION[e])).join('');
    const hayMono = recursosGenerales(curso).some((r) => (r.estado || 'disponible') === 'disponible');
    return pills + (hayMono ? pastilla('mono', true, 'Mono', 'Material del curso') : '');
}

function tarjeta(curso) {
    const con = tieneContenido(curso);
    const plan = curso.plan ? ` · ${esc(curso.plan.replace('Ingeniería Industrial', 'Ing. Industrial'))}` : '';
    const meta = `${curso.creditos} créditos${plan}${con ? '' : ' · <span class="an-sinmat">aún sin material</span>'}`;
    const accion = con
        ? `<a class="an-btn" href="asesorias-curso.html?c=${encodeURIComponent(curso.slug)}">Abrir curso →</a>`
        : `<button type="button" class="an-btn an-btn-ghost" data-lo="${esc(curso.codigo)}">Lo necesito</button>`;
    return `
        <article class="an-curso" style="${estiloAttr(curso)}">
            <div class="an-c-top"><span class="an-glifo">${esc(estiloCurso(curso).glifo)}</span><span class="an-c-der">${cursoTieneNovedad(curso) ? '<span class="an-nuevo">Nuevo</span>' : ''}<span class="an-c-ciclo">Ciclo ${curso.ciclo}</span></span></div>
            <div class="an-c-body">
                <h3>${esc(curso.nombre)}</h3>
                <p class="an-c-meta">${meta}</p>
                <div class="an-tira">${tira(curso)}</div>
                ${accion}
            </div>
        </article>`;
}

function marcarLo(btn, activo) {
    btn.textContent = activo ? 'Anotado ✓' : 'Lo necesito';
    btn.classList.toggle('an-on', activo);
}

function pintarCursos() {
    const q = normalizar(consulta);
    const lista = CURSOS.filter((c) => (!cicloSel || c.ciclo === cicloSel)
        && (!q || normalizar(`${c.nombre} ${c.codigo}`).includes(q)));

    let html = lista.map(tarjeta).join('');
    if (!lista.length) {
        html = `<div class="an-sin-resultados">No hay un curso con ese nombre en Asesorías.
            <button type="button" class="an-btn an-btn-ghost" data-pedir="${esc(consulta)}" style="margin-left:8px">Pedirlo</button></div>`;
    } else {
        html += `<article class="an-curso an-vacio"><h3>¿Tu curso no está?</h3>
            <p>Pídelo, o comparte una asesoría y ayuda a que aparezca.</p>
            <button type="button" class="an-btn an-btn-ghost" data-pedir="">Comparte o pide un curso</button></article>`;
    }
    $('anGrid').innerHTML = html;
    $('anGrid').querySelectorAll('[data-lo]').forEach((b) => marcarLo(b, votos.has(claveVoto(b.dataset.lo, null))));
}

async function alternarLo(btn) {
    const codigo = btn.dataset.lo;
    const k = claveVoto(codigo, null);
    const activar = !votos.has(k);
    marcarLo(btn, activar);
    btn.disabled = true;
    const ok = await alternarVoto(codigo, null, activar);
    btn.disabled = false;
    if (ok) { if (activar) votos.add(k); else votos.delete(k); }
    else { marcarLo(btn, !activar); aviso('No se pudo guardar. Intenta de nuevo en un momento.', 'error'); }
}

// ───────────── Botcito: bienvenida, novedades y consejos ─────────────
// - Primera visita: saludo de bienvenida.
// - Visitas siguientes: SOLO si hay material nuevo (publicado hace menos de 14 días
//   y que ese navegador aún no vio anunciado). Si no hay nada que contar, no sale nada.
// - Al tocar al botcito: un consejo distinto cada vez.
// Todos los globitos duran 5 segundos y se pueden cerrar con un toque.
const LS_BURBUJA = 'siga_asesorias_burbuja';          // ya vio la bienvenida
const LS_VISTAS = 'siga_asesorias_novedades_vistas';  // ids de recursos ya anunciados
const DURACION_MS = 5000;

const CONSEJOS = [
    'Toca una evaluación (PC1, PC2…) en una tarjeta para ir directo a ella.',
    '¿No ves tu curso? Pídelo y te avisamos cuando haya material.',
    'Si te falta algo, toca «Lo necesito»: así sé qué preparar primero.',
    '¿Viste un error en una asesoría? Usa «Reportar un error».',
    '¿Tienes una asesoría que ayudó a otros? Compártela, puede salir con tu nombre.',
    'Lo último que abriste queda en «Continúa donde quedaste».',
];

let globito = null;
let temporizador = null;
let retrasoTimer = null;
let ultimoConsejo = -1;

function leerLista(clave) {
    try { const v = JSON.parse(localStorage.getItem(clave) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}

function guardarLista(clave, lista) {
    try { localStorage.setItem(clave, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ }
}

function ocultarGlobito() {
    if (globito) globito.classList.remove('visible');
}

function mostrarGlobito({ texto, href = '', retraso = 0 }) {
    if (!globito) return;
    clearTimeout(retrasoTimer);
    clearTimeout(temporizador);
    retrasoTimer = setTimeout(() => {
        globito.textContent = texto;
        globito.dataset.href = href;
        globito.classList.add('visible');
        temporizador = setTimeout(ocultarGlobito, DURACION_MS);
    }, retraso);
}

function anunciarNovedades() {
    const vistas = new Set(leerLista(LS_VISTAS));
    const nuevas = recursosNuevos().filter(({ recurso }) => !vistas.has(recurso.id));
    if (!nuevas.length) return;
    nuevas.forEach(({ recurso }) => vistas.add(recurso.id));
    guardarLista(LS_VISTAS, [...vistas]);

    const slugs = [...new Set(nuevas.map(({ curso }) => curso.slug))];
    if (slugs.length === 1) {
        const { curso, recurso } = nuevas[0];
        const unico = nuevas.length === 1;
        const destino = `asesorias-curso.html?c=${encodeURIComponent(curso.slug)}${unico ? `&ev=${recurso.evaluacion || 'mono'}` : ''}`;
        mostrarGlobito({
            texto: unico ? `¡Hay material nuevo de ${curso.nombre}!` : `¡Hay ${nuevas.length} materiales nuevos de ${curso.nombre}!`,
            href: destino, retraso: 900,
        });
    } else {
        mostrarGlobito({ texto: `¡Hay ${nuevas.length} materiales nuevos en ${slugs.length} cursos! Busca la etiqueta «Nuevo».`, retraso: 900 });
    }
}

function saludarOAnunciar() {
    let vista = false;
    try { vista = localStorage.getItem(LS_BURBUJA) === '1'; } catch (e) { /* sin almacenamiento: tratar como primera visita */ }
    if (!vista) {
        try { localStorage.setItem(LS_BURBUJA, '1'); } catch (e) { /* nada */ }
        // Quien llega por primera vez ya verá las etiquetas "Nuevo": no se le anuncia lo mismo después.
        guardarLista(LS_VISTAS, recursosNuevos().map(({ recurso }) => recurso.id));
        mostrarGlobito({ texto: '¡Hola! Aquí encuentras asesorías hechas por estudiantes.', retraso: 700 });
    } else {
        anunciarNovedades();
    }
}

function consejoSiguiente() {
    let i;
    do { i = Math.floor(Math.random() * CONSEJOS.length); } while (CONSEJOS.length > 1 && i === ultimoConsejo);
    ultimoConsejo = i;
    mostrarGlobito({ texto: CONSEJOS[i] });
}

function iniciarBotcito() {
    globito = document.querySelector('.an-bubble');
    $('anBotHero').innerHTML = `<button type="button" class="an-botbtn" aria-label="Botcito: toca para un consejo">${botcitoSVG('an-bot')}</button>`;
    if (!globito) return;
    globito.addEventListener('click', () => {
        const destino = globito.dataset.href;
        ocultarGlobito();
        if (destino) location.href = destino;
    });
    document.querySelector('.an-botbtn').addEventListener('click', consejoSiguiente);
    saludarOAnunciar();
}

// ───────────── Arranque ─────────────
iniciarBotcito();
pintarFila();
pintarFiltros();
pintarCursos();
saludar();

$('anBuscar').addEventListener('input', (e) => { consulta = e.target.value; pintarCursos(); });
$('anBuscarBtn').addEventListener('click', () => { pintarCursos(); $('anGrid').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
$('anGrid').addEventListener('click', (e) => {
    const lo = e.target.closest('[data-lo]');
    if (lo) { alternarLo(lo); return; }
    const pedir = e.target.closest('[data-pedir]');
    if (pedir) abrirFormCompartir({ tab: 'pedir', texto: pedir.dataset.pedir || '' });
});

cargarMisVotos().then((set) => {
    votos = set;
    $('anGrid').querySelectorAll('[data-lo]').forEach((b) => marcarLo(b, votos.has(claveVoto(b.dataset.lo, null))));
});