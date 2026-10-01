// js/asesorias-portada.js — Portada de Asesorías: saludo, buscador de cursos,
// "Continúa donde quedaste", "Comparte tu asesoría", filtros por ciclo y la
// cuadrícula de cursos (con "Lo necesito" en los que aún no tienen material).
import { supabase, obtenerSesion } from './auth-siga.js?v=9';
import {
    CURSOS, EVALUACIONES, tieneContenido, ciclosDisponibles, planDelCurso,
    estadoEvaluacion, recursosGenerales,
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
function tira(curso) {
    const pills = EVALUACIONES.map((e) => `<span class="an-p${estadoEvaluacion(curso, e) === 'disponible' ? ' on' : ''}">${e}</span>`).join('');
    const mono = recursosGenerales(curso).some((r) => (r.estado || 'disponible') === 'disponible') ? '<span class="an-p on">Mono</span>' : '';
    return pills + mono;
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
            <div class="an-c-top"><span class="an-glifo">${esc(estiloCurso(curso).glifo)}</span><span class="an-c-ciclo">Ciclo ${curso.ciclo}</span></div>
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

// ───────────── Arranque ─────────────
$('anBotHero').innerHTML = botcitoSVG('an-bot');
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
