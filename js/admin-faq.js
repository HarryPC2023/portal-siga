// js/admin-faq.js — Pestaña "Preguntas frecuentes" del Admin (botcito de Asesorías).
//
// Aquí Harry crea, edita, publica (o pasa a borrador) y elimina las preguntas
// frecuentes que el botcito busca dentro de la página de cada curso.
//
// Tabla: asesorias_faq (SQL en asesorias-faq.sql + asesorias-faq-etiqueta-opcional.sql). Solo el UID de Harry puede
// escribir; los alumnos leen únicamente lo publicado.
//
// Se carga desde admin.js, igual que admin-asesorias.js:
//     import { iniciarFaqAsesorias } from './admin-faq.js?v=1';
//     iniciarFaqAsesorias({ confirmarAccion, escapeHtml });
//
// ⚠️ Archivo NUEVO. No reemplaza ni renombra ningún otro.
import { supabase } from './auth-siga.js?v=9';
import { CURSOS, EVALUACIONES } from './asesorias-cursos.js?v=1';

const $ = (id) => document.getElementById(id);

export const ETIQUETAS_FAQ = {
    concepto: 'Concepto',
    caso: 'Caso de ejemplo',
    metodo: 'Método',
};

let ayuda = { confirmarAccion: null };
let tabBtn = null;
let panel = null;
let filas = [];
let cargado = false;
let editandoId = null;
let selectorCurso = null;

// ───────────── Utilidades ─────────────
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const recorte = (texto, max) => {
    const t = String(texto || '').trim();
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

function nombreCurso(codigo) {
    const c = CURSOS.find((x) => x.codigo === codigo);
    return c ? c.nombre : `${codigo} (fuera del catálogo)`;
}

async function confirmar(mensaje, opciones) {
    if (typeof ayuda.confirmarAccion === 'function') return ayuda.confirmarAccion(mensaje, opciones);
    return window.confirm(mensaje);
}

function mostrarMsg(texto, tipo = 'exito') {
    const m = $('fqMsg');
    if (!m) return;
    m.textContent = texto;
    m.className = texto ? `admin-msg ${tipo}` : 'admin-msg';
}

function radios(nombre, opciones, marcado) {
    return `<div class="da-tipos" role="radiogroup">${opciones.map((o) => `
        <label><input type="radio" name="${nombre}" value="${esc(o.value)}"${o.value === marcado ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}
    </div>`;
}

const valorRadio = (nombre) => {
    const r = panel.querySelector(`input[name="${nombre}"]:checked`);
    return r ? r.value : '';
};

function marcarRadio(nombre, valor) {
    panel.querySelectorAll(`input[name="${nombre}"]`).forEach((r) => { r.checked = r.value === valor; });
}

// ───────────── Datos ─────────────
async function cargar() {
    const lista = $('fqLista');
    const { data, error } = await supabase
        .from('asesorias_faq')
        .select('*')
        .order('creada_en', { ascending: false });
    if (error) {
        console.error('Preguntas frecuentes:', error);
        lista.innerHTML = '<p class="da-vacio">No se pudieron cargar. ¿Ya corriste asesorias-faq.sql en Supabase?</p>';
        return;
    }
    filas = data || [];
    cargado = true;
    pintarLista();
}

function pintarResumen() {
    const pub = filas.filter((f) => f.publicada).length;
    const bor = filas.length - pub;
    $('fqResumen').textContent = filas.length
        ? `${pub} ${pub === 1 ? 'publicada' : 'publicadas'} · ${bor} ${bor === 1 ? 'borrador' : 'borradores'}`
        : 'Todavía no hay preguntas.';
}

function itemHTML(f) {
    return `
        <div class="admin-item fq-item" data-id="${esc(f.id)}">
            <div class="fq-chips">
                ${f.etiqueta ? `<span class="fq-chip fq-etq-${esc(f.etiqueta)}">${esc(ETIQUETAS_FAQ[f.etiqueta] || f.etiqueta)}</span>` : ''}
                ${f.evaluacion ? `<span class="fq-chip">${esc(f.evaluacion)}</span>` : ''}
                <span class="fq-chip ${f.publicada ? 'fq-est-pub' : 'fq-est-bor'}">${f.publicada ? 'Publicada' : 'Borrador'}</span>
            </div>
            <p class="fq-preg">${esc(f.pregunta)}</p>
            <p class="fq-resp">${esc(recorte(f.respuesta, 240))}</p>
            ${f.palabras_clave ? `<p class="fq-claves">Palabras clave: ${esc(f.palabras_clave)}</p>` : ''}
            <div class="fq-acc">
                <button type="button" class="da-btn" data-fq="editar">Editar</button>
                <button type="button" class="da-ok" data-fq="publicar">${f.publicada ? 'Pasar a borrador' : 'Publicar'}</button>
                <button type="button" class="admin-btn-eliminar" data-fq="eliminar">Eliminar</button>
            </div>
        </div>`;
}

function pintarLista() {
    pintarResumen();
    const cont = $('fqLista');
    if (!filas.length) {
        cont.innerHTML = '<p class="da-vacio">Aún no hay preguntas frecuentes. Toca "Nueva pregunta" para crear la primera.</p>';
        return;
    }
    // Orden del catálogo primero; si hay códigos fuera del catálogo, al final.
    const codigos = [...new Set(filas.map((f) => f.codigo_curso))];
    const orden = (c) => { const i = CURSOS.findIndex((x) => x.codigo === c); return i === -1 ? 999 : i; };
    codigos.sort((a, b) => orden(a) - orden(b));

    cont.innerHTML = codigos.map((cod) => {
        const delCurso = filas.filter((f) => f.codigo_curso === cod);
        const pub = delCurso.filter((f) => f.publicada).length;
        return `
            <section class="fq-grupo">
                <h4>${esc(nombreCurso(cod))} <small>${pub} publicadas · ${delCurso.length - pub} borradores</small></h4>
                ${delCurso.map(itemHTML).join('')}
            </section>`;
    }).join('');
}

// ───────────── Formulario ─────────────
function abrirForm(fila = null) {
    editandoId = fila ? fila.id : null;
    $('fqFormTitulo').textContent = fila ? 'Editar pregunta frecuente' : 'Nueva pregunta frecuente';
    $('fqGuardar').textContent = fila ? 'Guardar cambios' : 'Guardar pregunta';
    mostrarMsg('');

    if (fila) {
        selectorCurso.establecer(fila.codigo_curso, nombreCurso(fila.codigo_curso));
        marcarRadio('fqEtq', fila.etiqueta || '');
        marcarRadio('fqEv', fila.evaluacion || '');
        marcarRadio('fqEst', fila.publicada ? 'publicada' : 'borrador');
        $('fqPregunta').value = fila.pregunta;
        $('fqRespuesta').value = fila.respuesta;
        $('fqClaves').value = fila.palabras_clave || '';
    } else {
        selectorCurso.establecer('', 'Elige el curso');
        marcarRadio('fqEtq', '');
        marcarRadio('fqEv', '');
        marcarRadio('fqEst', 'borrador');
        $('fqPregunta').value = '';
        $('fqRespuesta').value = '';
        $('fqClaves').value = '';
    }
    $('fqCaja').hidden = false;
    $('fqCaja').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('fqPregunta').focus({ preventScroll: true });
}

function cerrarForm() {
    $('fqCaja').hidden = true;
    editandoId = null;
    mostrarMsg('');
}

async function guardar(e) {
    e.preventDefault();
    const codigo = $('fqValor').value;
    const etiqueta = valorRadio('fqEtq');
    const evaluacion = valorRadio('fqEv') || null;
    const pregunta = $('fqPregunta').value.trim();
    const respuesta = $('fqRespuesta').value.trim();
    const claves = $('fqClaves').value.trim();
    const publicada = valorRadio('fqEst') === 'publicada';

    if (!codigo) return mostrarMsg('Elige el curso.', 'error');
    if (pregunta.length < 3) return mostrarMsg('Escribe la pregunta (mínimo 3 caracteres).', 'error');
    if (!respuesta) return mostrarMsg('Escribe la respuesta.', 'error');

    const payload = {
        codigo_curso: codigo, evaluacion, etiqueta: etiqueta || null, pregunta, respuesta,
        palabras_clave: claves || null, publicada,
    };

    const btn = $('fqGuardar');
    btn.disabled = true;
    // Con .select() sabemos si Supabase realmente guardó (una política RLS que
    // rechaza un UPDATE no da error: simplemente no toca ninguna fila).
    const consulta = editandoId
        ? supabase.from('asesorias_faq').update(payload).eq('id', editandoId).select('id')
        : supabase.from('asesorias_faq').insert(payload).select('id');
    const { data, error } = await consulta;
    btn.disabled = false;

    if (error || !data || !data.length) {
        console.error('Guardar pregunta frecuente:', error);
        return mostrarMsg('No se pudo guardar. Revisa tu conexión y que seas el administrador.', 'error');
    }
    cerrarForm();
    await cargar();
}

// ───────────── Acciones sobre una pregunta ─────────────
async function alternarPublicada(fila, btn) {
    btn.disabled = true;
    const { data, error } = await supabase
        .from('asesorias_faq').update({ publicada: !fila.publicada }).eq('id', fila.id).select('id');
    if (error || !data || !data.length) {
        btn.disabled = false;
        console.error('Cambiar estado:', error);
        alert('No se pudo cambiar el estado. Inténtalo de nuevo.');
        return;
    }
    await cargar();
}

async function eliminar(fila, btn) {
    const ok = await confirmar(`Se eliminará para siempre: "${recorte(fila.pregunta, 90)}"`, {
        titulo: '¿Eliminar esta pregunta?', textoBoton: 'Sí, eliminar',
    });
    if (!ok) return;
    btn.disabled = true;
    const { data, error } = await supabase.from('asesorias_faq').delete().eq('id', fila.id).select('id');
    if (error || !data || !data.length) {
        btn.disabled = false;
        console.error('Eliminar pregunta:', error);
        alert('No se pudo eliminar. Inténtalo de nuevo.');
        return;
    }
    await cargar();
}

// ───────────── Pestaña y panel ─────────────
function construirPestana() {
    const primera = document.querySelector('.admin-tab');
    const ultimoPanel = $('panelVistaIntranotas') || document.querySelector('.admin-panel:last-of-type');
    if (!primera || !ultimoPanel) return false;

    tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'admin-tab';
    tabBtn.dataset.tab = 'faq';
    tabBtn.textContent = 'Preguntas frecuentes';
    primera.parentElement.appendChild(tabBtn);

    panel = document.createElement('div');
    panel.id = 'panelFaq';
    panel.className = 'admin-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="da-cab">
            <div><h3>Preguntas frecuentes del botcito</h3><p class="da-resumen" id="fqResumen"></p></div>
            <button type="button" class="da-btn" id="fqNueva">+ Nueva pregunta</button>
        </div>

        <div class="admin-form-caja" id="fqCaja" hidden>
            <h2 class="admin-form-titulo" id="fqFormTitulo">Nueva pregunta frecuente</h2>
            <form id="fqFormEl" novalidate>
                <div class="admin-form-campo">
                    <span>Curso</span>
                    <div class="campo-select-custom">
                        <button type="button" class="select-custom-trigger" id="fqTrigger" aria-haspopup="listbox" aria-expanded="false">
                            <span id="fqTexto">Elige el curso</span>
                            <svg class="select-custom-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        <ul class="select-custom-lista" id="fqLista2" role="listbox" hidden></ul>
                        <input type="hidden" id="fqValor" value="">
                    </div>
                </div>

                <div class="admin-form-campo">
                    <span>Etiqueta (opcional)</span>
                    ${radios('fqEtq', [{ value: '', label: 'Sin etiqueta' }, ...Object.entries(ETIQUETAS_FAQ).map(([value, label]) => ({ value, label }))], '')}
                    <small class="da-tipos-ayuda">Concepto: qué es algo. Caso de ejemplo: un ejercicio resuelto. Método: pasos para resolver un tipo de problema. Si no encaja claro, déjala sin etiqueta: el alumno simplemente no verá chip.</small>
                </div>

                <div class="admin-form-campo">
                    <span>Evaluación (opcional)</span>
                    ${radios('fqEv', [{ value: '', label: 'General' }, ...EVALUACIONES.map((v) => ({ value: v, label: v }))], '')}
                </div>

                <label class="admin-form-campo">
                    <span>Pregunta</span>
                    <input type="text" id="fqPregunta" maxlength="200" placeholder="Ej. ¿Cuál es la diferencia entre entidad fuerte y débil?">
                </label>

                <label class="admin-form-campo">
                    <span>Respuesta (texto sencillo; los saltos de línea se respetan)</span>
                    <textarea id="fqRespuesta" rows="7" maxlength="4000" placeholder="Escribe la respuesta tal como la verá el alumno…"></textarea>
                </label>

                <label class="admin-form-campo">
                    <span>Palabras clave (opcional)</span>
                    <input type="text" id="fqClaves" maxlength="300" placeholder="Ej. entidad debil, dependencia de existencia, identificador">
                    <small class="da-tipos-ayuda">Sinónimos y formas en que la gente lo escribe, separados por comas. La búsqueda ignora tildes y mayúsculas.</small>
                </label>

                <div class="admin-form-campo">
                    <span>Estado</span>
                    ${radios('fqEst', [{ value: 'borrador', label: 'Borrador (nadie la ve)' }, { value: 'publicada', label: 'Publicada' }], 'borrador')}
                </div>

                <div class="fq-botones">
                    <button type="submit" class="admin-form-submit" id="fqGuardar">Guardar pregunta</button>
                    <button type="button" class="da-btn" id="fqCancelar">Cancelar</button>
                </div>
                <p class="admin-msg" id="fqMsg"></p>
            </form>
        </div>

        <div id="fqLista"><p class="admin-vacio">Cargando…</p></div>`;
    ultimoPanel.parentElement.appendChild(panel);

    // Mostrar este panel al tocar la pestaña (mismo patrón que Demanda de Asesorías)
    tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((b) => b.classList.toggle('activo', b === tabBtn));
        document.querySelectorAll('.admin-panel').forEach((p) => { p.style.display = p === panel ? 'flex' : 'none'; });
        if (!cargado) cargar();
    });
    // Ocultarlo al elegir cualquier otra pestaña
    document.querySelectorAll('.admin-tab').forEach((b) => {
        if (b !== tabBtn) b.addEventListener('click', () => { panel.style.display = 'none'; });
    });
    return true;
}

function conectar() {
    selectorCurso = window.inicializarSelectPersonalizado({
        triggerId: 'fqTrigger', textoId: 'fqTexto', listaId: 'fqLista2', valorId: 'fqValor',
        opciones: CURSOS.map((c) => ({ value: c.codigo, label: c.nombre })),
    });

    $('fqNueva').addEventListener('click', () => abrirForm());
    $('fqCancelar').addEventListener('click', cerrarForm);
    $('fqFormEl').addEventListener('submit', guardar);

    $('fqLista').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-fq]');
        if (!btn) return;
        const fila = filas.find((f) => String(f.id) === btn.closest('.fq-item').dataset.id);
        if (!fila) return;
        if (btn.dataset.fq === 'editar') abrirForm(fila);
        else if (btn.dataset.fq === 'publicar') alternarPublicada(fila, btn);
        else if (btn.dataset.fq === 'eliminar') eliminar(fila, btn);
    });
}

// ───────────── Punto de entrada ─────────────
export function iniciarFaqAsesorias(ayudantes = {}) {
    ayuda = { ...ayuda, ...ayudantes };
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/admin-faq.css?v=1';
    document.head.appendChild(css);
    if (construirPestana()) conectar();
}