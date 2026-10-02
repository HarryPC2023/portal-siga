// js/asesorias-comun.js — Piezas compartidas de la sección Asesorías
// (portada y página de curso): estilo de cada curso, "Lo necesito",
// pedidos, reportes de error, último recurso abierto y el formulario
// "Comparte con SIGA".
//
// Tablas de Supabase que usa:
//   - asesorias_propuestas  (ya existía: lo que la gente comparte)
//   - asesorias_demanda     (nueva: "Lo necesito", pedidos de curso y
//                            reportes de error; ver SQL de instalación)
import { supabase, obtenerSesion } from './auth-siga.js?v=9';
import { CURSOS } from './asesorias-cursos.js?v=1';

// Página de la portada de Asesorías (desde el corte del 1 oct 2026 es asesorias.html).
export const PORTADA = 'asesorias.html';

const BUCKET_ASESORIAS = 'asesorias-adjuntos';
const TAMANO_MAXIMO_MB = 20;
const LS_ULTIMO = 'siga_asesorias_ultimo';

// ───────────── Utilidades ─────────────
export function normalizar(texto) {
    return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function esc(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

const $ = (id) => document.getElementById(id);

// ───────────── Estilo visual de cada curso ─────────────
const GRUPOS = {
    mat: ['#C9F4F7', '#CFF5E3', '#0B5C64'],
    est: ['#E4CAF6', '#F5C7E6', '#5E2A8C'],
    fis: ['#F9EEB8', '#FBD9C4', '#7A5200'],
    qui: ['#C9F4F7', '#CFE0FF', '#1F4FA0'],
    comp: ['#CFE0FF', '#E4CAF6', '#2B3A8C'],
    mcd: ['#F5C7E6', '#E4CAF6', '#7A1F5C'],
    dbd: ['#E4CAF6', '#C9F4F7', '#4B2390'],
};

const ESTILOS = {
    FB101: ['∠', 'mat'], BMA01: ['dx', 'mat'], BQU01: ['Q', 'qui'],
    BMA02: ['∫', 'mat'], BMA03: ['[ ]', 'mat'], SI205: ['{ }', 'comp'], FB202: ['Q²', 'qui'],
    BFI01: ['F', 'fis'], FB305: ['σ', 'est'],
    FB401: ['Φ', 'fis'], FB402: ['Δ', 'mat'], FB403: ['y′', 'mat'], FB405: ['μ', 'est'], SI405: ['ER', 'mcd'],
    SI501: ['IO', 'comp'], SI505: ['DB', 'dbd'], SI601: ['IO²', 'comp'],
};

export function estiloCurso(curso) {
    const [glifo, grupo] = ESTILOS[curso.codigo] || [curso.nombre.slice(0, 2), 'est'];
    const [g1, g2, ink] = GRUPOS[grupo];
    return { glifo, g1, g2, ink };
}

export function estiloAttr(curso) {
    const e = estiloCurso(curso);
    return `--g1:${e.g1};--g2:${e.g2};--ink2:${e.ink}`;
}

// ───────────── Botcito (dibujo vectorial, sin imagen) ─────────────
export function botcitoSVG(clase = '') {
    return `<svg class="${clase}" viewBox="0 0 120 130" role="img" aria-label="Botcito de SIGA">
        <line x1="60" y1="6" x2="60" y2="24" stroke="#7B3FC4" stroke-width="3" stroke-linecap="round"/>
        <circle cx="60" cy="6" r="5" fill="#F5C7E6" stroke="#C13F94" stroke-width="2"/>
        <rect x="20" y="34" width="80" height="60" rx="26" fill="#fff" stroke="#7B3FC4" stroke-width="3"/>
        <rect x="31" y="45" width="58" height="38" rx="18" fill="#2B2260"/>
        <ellipse class="an-ojo" cx="47" cy="63" rx="5.5" ry="6.5" fill="#7FF0F5"/>
        <ellipse class="an-ojo" cx="73" cy="63" rx="5.5" ry="6.5" fill="#7FF0F5"/>
        <path d="M52 74 Q60 80 68 74" fill="none" stroke="#7FF0F5" stroke-width="2.5" stroke-linecap="round"/>
        <polygon points="22,32 60,16 98,32 60,47" fill="#3B2F8A"/>
        <path d="M40 38 v10 q20 8 40 0 v-10" fill="#2B2260"/>
        <line x1="98" y1="32" x2="104" y2="48" stroke="#F9C74F" stroke-width="2.5"/>
        <circle cx="104" cy="50" r="3.5" fill="#F9C74F"/>
        <rect x="34" y="96" width="52" height="26" rx="13" fill="#E4CAF6" stroke="#7B3FC4" stroke-width="3"/>
        <circle cx="24" cy="106" r="7" fill="#C9F4F7" stroke="#0E7C86" stroke-width="2.5"/>
        <circle cx="96" cy="106" r="7" fill="#C9F4F7" stroke="#0E7C86" stroke-width="2.5"/>
        <circle cx="60" cy="109" r="4.5" fill="#F5C7E6"/>
    </svg>`;
}

// ───────────── Aviso flotante breve ─────────────
export function aviso(texto, tipo = 'ok') {
    let el = $('anToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'anToast';
        el.className = 'an-toast';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = texto;
    el.dataset.tipo = tipo;
    el.classList.add('visible');
    clearTimeout(aviso._t);
    aviso._t = setTimeout(() => el.classList.remove('visible'), 3600);
}

// ───────────── Último recurso abierto ("Continúa donde quedaste") ─────────────
export function recordarUltimo(slug, id) {
    try { localStorage.setItem(LS_ULTIMO, JSON.stringify({ slug, id, t: Date.now() })); } catch (e) { /* sin almacenamiento */ }
}

export function leerUltimo() {
    try { return JSON.parse(localStorage.getItem(LS_ULTIMO) || 'null'); } catch (e) { return null; }
}

// ───────────── "Lo necesito", pedidos y reportes (tabla asesorias_demanda) ─────────────
const clave = (codigo, evaluacion) => `${codigo}|${evaluacion || ''}`;
export { clave as claveVoto };

export async function cargarMisVotos() {
    try {
        const sesion = await obtenerSesion();
        if (!sesion) return new Set();
        const { data, error } = await supabase
            .from('asesorias_demanda')
            .select('codigo_curso, evaluacion')
            .eq('tipo', 'lo_necesito');
        if (error) { console.warn('No se pudieron leer tus "Lo necesito":', error); return new Set(); }
        return new Set((data || []).map((r) => clave(r.codigo_curso, r.evaluacion)));
    } catch (e) {
        console.warn('Lectura de "Lo necesito" falló:', e);
        return new Set();
    }
}

/** Marca (activar=true) o quita (false) el "Lo necesito". Devuelve true si quedó guardado. */
export async function alternarVoto(codigo, evaluacion, activar) {
    const sesion = await obtenerSesion();
    if (!sesion) { aviso('Tu sesión expiró. Vuelve a iniciar sesión.', 'error'); return false; }
    if (activar) {
        const { error } = await supabase.from('asesorias_demanda').insert({
            user_id: sesion.user.id, tipo: 'lo_necesito', codigo_curso: codigo, evaluacion: evaluacion || null,
        });
        if (error && error.code !== '23505') { console.error('Lo necesito:', error); return false; }
        return true;
    }
    let consulta = supabase.from('asesorias_demanda').delete()
        .eq('tipo', 'lo_necesito').eq('codigo_curso', codigo);
    consulta = evaluacion ? consulta.eq('evaluacion', evaluacion) : consulta.is('evaluacion', null);
    const { error } = await consulta;
    if (error) { console.error('Quitar Lo necesito:', error); return false; }
    return true;
}

async function insertarDemanda(fila) {
    const sesion = await obtenerSesion();
    if (!sesion) return { ok: false, motivo: 'sesion' };
    const { error } = await supabase.from('asesorias_demanda').insert({ user_id: sesion.user.id, ...fila });
    if (error) { console.error('asesorias_demanda:', error); return { ok: false, motivo: 'error' }; }
    return { ok: true };
}

export function enviarPedido(texto) {
    return insertarDemanda({ tipo: 'pedido', texto });
}

export function enviarReporte({ codigo_curso, recurso_id, texto }) {
    return insertarDemanda({ tipo: 'reporte', codigo_curso, recurso_id, texto });
}

// ───────────── Ventana: reportar un error de un recurso ─────────────
export function abrirReporte({ codigo_curso, recurso_id, titulo }) {
    cerrarVentana();
    const ov = crearVentana(`
        <div class="an-mdl-h"><h2>Reportar un error</h2><button type="button" class="an-x" data-cerrar aria-label="Cerrar">✕</button></div>
        <p class="an-mdl-sub">${esc(titulo)}</p>
        <div class="an-fld"><label for="anRepTxt">¿Qué encontraste? Por ejemplo, un signo mal puesto o un paso que no se entiende.</label>
            <textarea id="anRepTxt" rows="3" maxlength="300" placeholder="Cuéntalo en pocas líneas"></textarea></div>
        <div class="an-er" id="anRepEr"></div>
        <button type="button" class="an-btn" id="anRepEnv" style="width:100%">Enviar reporte</button>
    `);
    const txt = $('anRepTxt');
    txt.focus();
    $('anRepEnv').addEventListener('click', async () => {
        const t = txt.value.trim();
        if (t.length < 3) { $('anRepEr').textContent = 'Escribe qué encontraste antes de enviarlo.'; return; }
        $('anRepEnv').disabled = true;
        const r = await enviarReporte({ codigo_curso, recurso_id, texto: t });
        if (r.ok) { cerrarVentana(); aviso('Gracias, lo reviso. Tu reporte quedó registrado.'); }
        else { $('anRepEnv').disabled = false; $('anRepEr').textContent = 'No se pudo enviar. Intenta de nuevo en un momento.'; }
    });
}

// ───────────── Ventanas (base común) ─────────────
let ventana = null;

function crearVentana(html) {
    ventana = document.createElement('div');
    ventana.className = 'an-ov';
    ventana.innerHTML = `<div class="an-mdl" role="dialog" aria-modal="true">${html}</div>`;
    ventana.addEventListener('click', (e) => {
        if (e.target === ventana || e.target.closest('[data-cerrar]')) cerrarVentana();
    });
    document.body.appendChild(ventana);
    document.body.classList.add('an-sin-scroll');
    return ventana;
}

export function cerrarVentana() {
    if (ventana) { ventana.remove(); ventana = null; }
    document.body.classList.remove('an-sin-scroll');
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarVentana(); });

// ───────────── Formulario "Comparte con SIGA" ─────────────
const TIPOS_APORTE = ['Presentación', 'PDF', 'Página web', 'Resumen o guía', 'Plancha resuelta'];

export function abrirFormCompartir({ tab = 'compartir', texto = '' } = {}) {
    cerrarVentana();
    const opcionesCurso = [...CURSOS.map((c) => ({ value: c.codigo, label: c.nombre })), { value: 'otro', label: 'Otro curso…' }];

    crearVentana(`
        <div class="an-mdl-h"><h2>Comparte con SIGA</h2><button type="button" class="an-x" data-cerrar aria-label="Cerrar">✕</button></div>
        <div class="an-tabs">
            <button type="button" class="an-tab" data-tab="compartir">Compartir una asesoría</button>
            <button type="button" class="an-tab" data-tab="pedir">Pedir un curso</button>
        </div>

        <div id="anPanCompartir">
            <div class="an-fld"><span class="an-lb">¿Qué compartes? (opcional)</span>
                <div class="an-chs" id="anTipos">${TIPOS_APORTE.map((t) => `<button type="button" class="an-chip" data-tipo="${esc(t)}">${esc(t)}</button>`).join('')}</div>
            </div>
            <div class="an-fld"><span class="an-lb">Curso</span>
                <div class="campo-select-custom">
                    <button type="button" class="select-custom-trigger" id="anFcTrigger" aria-haspopup="listbox" aria-expanded="false">
                        <span id="anFcTexto">Elige el curso</span>
                        <svg class="select-custom-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <ul class="select-custom-lista" id="anFcLista" role="listbox" hidden></ul>
                    <input type="hidden" id="anFcValor" value="">
                </div>
            </div>
            <div id="anOtroBox" hidden>
                <div class="an-fld"><label for="anFcOtro">Nombre del curso</label><input id="anFcOtro" type="text" maxlength="80" placeholder="Ej. Física III"></div>
                <div class="an-fld"><span class="an-lb">Ciclo (opcional)</span><div class="an-chs" id="anCiclos">${Array.from({ length: 10 }, (_, i) => `<button type="button" class="an-chip" data-ciclo="${i + 1}">${i + 1}</button>`).join('')}</div></div>
            </div>
            <div class="an-fld"><label for="anFcTit">Título</label><input id="anFcTit" type="text" maxlength="120" placeholder="Ej. PC2 resuelta paso a paso"></div>
            <div class="an-fld"><span class="an-lb">Tu archivo o enlace</span>
                <label class="an-drop" id="anDrop" for="anFcArch"><b>Arrastra tu archivo aquí o toca para elegirlo</b><small>PDF, PowerPoint, Word o Excel · máx. ${TAMANO_MAXIMO_MB} MB</small><span id="anFcNom"></span></label>
                <input type="file" id="anFcArch" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" hidden>
                <div class="an-o">o pega un enlace</div>
                <input id="anFcLink" type="url" maxlength="300" placeholder="Drive, Canva, Notion, YouTube…">
            </div>
            <div class="an-fld"><label for="anFcDesc">¿Qué encontrará quien la abra? (opcional)</label><textarea id="anFcDesc" rows="2" maxlength="300" placeholder="Ej. Explico el paso a paso de cada ejercicio"></textarea></div>
            <div class="an-fld"><span class="an-lb">¿Cómo quieres aparecer?</span>
                <div class="an-chs" id="anAparece"><button type="button" class="an-chip on" data-nombre="1">Con mi nombre</button><button type="button" class="an-chip" data-nombre="0">Sin nombre</button></div>
            </div>
            <label class="an-chk"><input type="checkbox" id="anFcOk"><span>Es un trabajo mío, o tengo permiso de su autor para compartirlo.</span></label>
            <div class="an-er" id="anFcEr"></div>
            <button type="button" class="an-btn" id="anFcEnv" style="width:100%">Enviar para revisión</button>
            <p class="an-nota">Harry la revisa antes de publicarla. Te avisaremos cuando esté en SIGA.</p>
        </div>

        <div id="anPanPedir" hidden>
            <div class="an-fld"><label for="anPedCurso">Curso que quieres ver en Asesorías</label><input id="anPedCurso" type="text" maxlength="80" placeholder="Ej. Física III"></div>
            <div class="an-fld"><label for="anPedNota">¿Algo más? (opcional)</label><input id="anPedNota" type="text" maxlength="120" placeholder="Ej. Me toca el próximo ciclo"></div>
            <div class="an-er" id="anPedEr"></div>
            <button type="button" class="an-btn" id="anPedEnv" style="width:100%">Pedir curso</button>
            <p class="an-nota">Cada pedido ayuda a decidir qué curso preparar primero.</p>
        </div>

        <div id="anFinal" hidden>
            <div class="an-aviso-ok" id="anFinalTxt"></div>
            <button type="button" class="an-btn an-btn-ghost" data-cerrar style="width:100%;margin-top:14px">Listo</button>
        </div>
    `);

    // Pestañas
    const pestanas = ventana.querySelectorAll('.an-tab');
    const cambiarTab = (t) => {
        pestanas.forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
        $('anPanCompartir').hidden = t !== 'compartir';
        $('anPanPedir').hidden = t !== 'pedir';
    };
    pestanas.forEach((b) => b.addEventListener('click', () => cambiarTab(b.dataset.tab)));
    cambiarTab(tab);
    if (texto) $('anPedCurso').value = texto;

    // Chips de selección única
    const unico = (idContenedor, claseMarca = 'on', permitirQuitar = true) => {
        const cont = $(idContenedor);
        cont.querySelectorAll('.an-chip').forEach((b) => b.addEventListener('click', () => {
            const ya = b.classList.contains(claseMarca);
            cont.querySelectorAll('.an-chip').forEach((x) => x.classList.remove(claseMarca));
            if (!(ya && permitirQuitar)) b.classList.add(claseMarca);
        }));
    };
    unico('anTipos'); unico('anCiclos'); unico('anAparece', 'on', false);

    // Selector de curso (componente compartido de SIGA, nunca un <select> nativo)
    if (typeof window.inicializarSelectPersonalizado === 'function') {
        window.inicializarSelectPersonalizado({
            triggerId: 'anFcTrigger', textoId: 'anFcTexto', listaId: 'anFcLista', valorId: 'anFcValor',
            opciones: opcionesCurso,
            alElegir: () => { $('anOtroBox').hidden = $('anFcValor').value !== 'otro'; },
        });
    }

    // Zona de archivo
    const arch = $('anFcArch'); const drop = $('anDrop');
    arch.addEventListener('change', () => { $('anFcNom').textContent = arch.files[0] ? arch.files[0].name : ''; });
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('sobre'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('sobre'));
    drop.addEventListener('drop', (e) => {
        e.preventDefault(); drop.classList.remove('sobre');
        if (e.dataTransfer.files[0]) { arch.files = e.dataTransfer.files; $('anFcNom').textContent = e.dataTransfer.files[0].name; }
    });

    $('anFcEnv').addEventListener('click', enviarCompartir);
    $('anPedEnv').addEventListener('click', enviarPedidoCurso);
}

function mostrarFinal(texto) {
    $('anPanCompartir').hidden = true; $('anPanPedir').hidden = true;
    ventana.querySelector('.an-tabs').hidden = true;
    $('anFinalTxt').textContent = texto; $('anFinal').hidden = false;
}

async function enviarPedidoCurso() {
    const er = $('anPedEr'); er.textContent = '';
    const curso = $('anPedCurso').value.trim(); const nota = $('anPedNota').value.trim();
    if (curso.length < 2) { er.textContent = 'Escribe el nombre del curso.'; return; }
    $('anPedEnv').disabled = true;
    const r = await enviarPedido(nota ? `${curso} — ${nota}` : curso);
    if (r.ok) mostrarFinal('Anotado. Cada pedido ayuda a decidir qué curso preparar primero.');
    else { $('anPedEnv').disabled = false; er.textContent = r.motivo === 'sesion' ? 'Tu sesión expiró. Vuelve a iniciar sesión.' : 'No se pudo enviar. Intenta de nuevo en un momento.'; }
}

async function subirArchivo(file, userId) {
    const limpio = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const ruta = `${userId}/${Date.now()}-${limpio}`;
    const { error } = await supabase.storage.from(BUCKET_ASESORIAS).upload(ruta, file);
    if (error) throw error;
    return ruta;
}

async function enviarCompartir() {
    const er = $('anFcEr'); er.textContent = '';
    const codigo = $('anFcValor').value;
    const otro = codigo === 'otro';
    const cat = CURSOS.find((c) => c.codigo === codigo);
    const nombreCurso = otro ? $('anFcOtro').value.trim() : (cat ? cat.nombre : '');
    const titulo = $('anFcTit').value.trim();
    const link = $('anFcLink').value.trim();
    const archivo = $('anFcArch').files[0];

    if (!nombreCurso) { er.textContent = 'Indica a qué curso pertenece.'; return; }
    if (!titulo) { er.textContent = 'Ponle un título a tu asesoría.'; return; }
    if (!archivo && !link) { er.textContent = 'Sube un archivo o pega un enlace.'; return; }
    if (archivo && archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) { er.textContent = `El archivo pesa más de ${TAMANO_MAXIMO_MB} MB. Sube algo más liviano o pega un enlace.`; return; }
    if (!$('anFcOk').checked) { er.textContent = 'Confirma que es tu trabajo o que tienes permiso para compartirlo.'; return; }

    const sesion = await obtenerSesion();
    if (!sesion) { er.textContent = 'Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo.'; return; }

    const btn = $('anFcEnv'); btn.disabled = true;
    let urlFinal = link;
    if (archivo) {
        btn.textContent = 'Subiendo archivo…';
        try { urlFinal = await subirArchivo(archivo, sesion.user.id); }
        catch (err) {
            console.error('Error al subir archivo:', err);
            btn.disabled = false; btn.textContent = 'Enviar para revisión';
            er.textContent = 'No se pudo subir el archivo. Intenta de nuevo.'; return;
        }
    }

    const chipTipo = ventana.querySelector('#anTipos .an-chip.on');
    const chipCiclo = ventana.querySelector('#anCiclos .an-chip.on');
    const mostrarNombre = ventana.querySelector('#anAparece .an-chip.on').dataset.nombre === '1';
    const tipoAporte = chipTipo ? chipTipo.dataset.tipo : null;
    const descripcion = $('anFcDesc').value.trim() || null;

    const base = {
        titulo, curso: nombreCurso,
        ciclo: cat ? cat.ciclo : (chipCiclo ? Number(chipCiclo.dataset.ciclo) : null),
        tipo_recurso: archivo ? 'pdf' : 'web',
        url_recurso: urlFinal, descripcion,
        autor_id: sesion.user.id, autor_email: sesion.user.email,
    };

    btn.textContent = 'Enviando…';
    let { error } = await supabase.from('asesorias_propuestas').insert({
        ...base, tipo_aporte: tipoAporte, mostrar_nombre: mostrarNombre, autoriza_publicar: true,
    });
    if (error && /column|PGRST204|schema cache/i.test(`${error.code} ${error.message}`)) {
        // Aún no se agregaron las columnas nuevas: se guarda igual, con los datos extra dentro de la descripción.
        const extra = `[${tipoAporte || 'Sin tipo'} · ${mostrarNombre ? 'con nombre' : 'sin nombre'} · autoriza publicar]`;
        ({ error } = await supabase.from('asesorias_propuestas').insert({ ...base, descripcion: descripcion ? `${descripcion} ${extra}` : extra }));
    }
    btn.disabled = false; btn.textContent = 'Enviar para revisión';
    if (error) { console.error('Error al compartir asesoría:', error); er.textContent = 'No se pudo enviar. Intenta de nuevo en un momento.'; return; }
    mostrarFinal('¡Gracias! Tu asesoría quedó registrada para revisión. Te avisaremos cuando esté publicada.');
}