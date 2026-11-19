// js/cv-profesional.js — Constructor del CV Profesional (siete pasos, semáforo, vista previa A4 e impresión).
//
// Principios:
//  • Los datos viven en SigaEstado (módulo «desarrollo»), vía js/desarrollo-estado.js. Aquí no hay tablas ni mecanismos propios.
//  • Autoguardado silencioso: se guarda mientras escribe; solo se avisa si algo falla o si hay un conflicto real.
//  • NUNCA se reconstruye el formulario cuando llega un cambio de otro dispositivo: solo se actualizan los campos
//    que el alumno no está escribiendo (ni tiene cambios sin guardar). Las listas se concilian elemento por elemento.
//  • El CV es una copia propia: el paso «Formación» copia datos de SIGA pero jamás escribe en el perfil académico.
import { SigaEstado } from './sync-estado.js?v=1';
import { accesoPermitido } from './desarrollo-acceso.js?v=1';
import { supabase } from './auth-siga.js?v=9';
import { crearDesarrollo, CLAVE_DATOS, CLAVE_FORMACION, CLAVE_AJUSTES } from './desarrollo-estado.js?v=1';
import { evaluarCV } from './desarrollo-reglas.js?v=1';
import * as C from './desarrollo-contenido.js?v=1';
import { htmlCV } from './cv-documento.js?v=1';
import { armarBorrador, gruposDesde, aplanarHerramientas, todasLasHerramientas, tipoCarrera, textoPeriodo, detalleIdioma } from './desarrollo-redaccion.js?v=1';
import { leerDatosSiga } from './desarrollo-siga.js?v=1';

const D = crearDesarrollo(SigaEstado);

// ───────────── utilidades de DOM ─────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function el(tag, props = {}, ...hijos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
    }
    hijos.flat().forEach((h) => { if (h != null && h !== false) n.append(h.nodeType ? h : document.createTextNode(String(h))); });
    return n;
}

// ───────────── estado de la pantalla ─────────────
let cv = null;                       // copia en memoria de lo guardado (se relee tras cada cambio)
let paso = 0;                        // índice en C.PASOS
let modo = 'constructor';            // 'constructor' | 'previa'
const sucios = new Set();            // «clave|campo» con texto escrito que aún no se manda a guardar
const temporizadores = new Map();    // clave → temporizador del autoguardado
const SECCION_DE_PASO = { datos: 'datos', formacion: 'formacion', proyectos: 'proyectos', habilidades: 'habilidades', logros: 'logros', experiencia: 'experiencia' };
const TIPO_DE_PASO = { proyectos: 'proyecto', logros: 'logro', experiencia: 'experiencia' };
const COLECCION = { proyecto: 'proyectos', logro: 'logros', experiencia: 'experiencias', habilidad: 'habilidades' };

// ───────────── autoguardado ─────────────
const esVacio = (o) => Object.entries(o || {}).every(([k, v]) => k === 'orden' || k === 'origen' || k === 'desdeSiga' || v === '' || v === false || v == null || (Array.isArray(v) && !v.length));

function recolectar(clave) {
    const inputs = $$('[data-clave]').filter((i) => i.dataset.clave === clave);
    if (!inputs.length) return null;
    const nuevo = {};
    for (const i of inputs) {
        if (i.type === 'checkbox') { nuevo[i.dataset.campo] = i.checked; continue; }
        nuevo[i.dataset.campo] = i.dataset.campo === 'cursos'
            ? i.value.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 5)
            : i.value;
    }
    return { ...(D.leerClave(clave) || {}), ...nuevo };
}

function limpiarSucios(clave) {
    for (const k of [...sucios]) if (k.startsWith(clave + '|')) sucios.delete(k);
}

function flush(clave) {
    clearTimeout(temporizadores.get(clave)); temporizadores.delete(clave);
    const obj = recolectar(clave);
    limpiarSucios(clave);
    if (!obj) return;
    const actual = D.leerClave(clave);
    if (actual === undefined && esVacio(obj)) return;                       // no guardar filas vacías por solo pasar el cursor
    if (JSON.stringify(actual ?? null) === JSON.stringify(obj)) return;     // nada nuevo
    D.guardarClave(clave, obj);
    refrescarMemoria();
}

function programar(clave) {
    clearTimeout(temporizadores.get(clave));
    temporizadores.set(clave, setTimeout(() => flush(clave), 400));
}

function flushTodo() { [...temporizadores.keys()].forEach(flush); }

// ───────────── campos de formulario ─────────────
function campo({ clave, nombre, etiqueta, placeholder = '', tipo = 'text', opcional = false, area = false, ayuda = '', extra = {} }) {
    const id = `f-${clave.replace(/\W/g, '_')}-${nombre}`;
    const valor = (D.leerClave(clave) || {})[nombre];
    const input = area ? el('textarea', { id, rows: 3, placeholder }) : el('input', { id, type: tipo, placeholder, autocomplete: 'off', ...extra });
    input.value = Array.isArray(valor) ? valor.join(', ') : (valor ?? '');
    input.dataset.clave = clave;
    input.dataset.campo = nombre;
    input.addEventListener('input', () => { sucios.add(`${clave}|${nombre}`); programar(clave); });
    input.addEventListener('blur', () => flush(clave));
    return el('div', { class: 'dp-campo' },
        el('label', { for: id }, etiqueta, opcional ? el('span', { class: 'dp-opc', text: ' (opcional)' }) : null),
        input,
        ayuda ? el('small', { class: 'dp-ayuda', text: ayuda }) : null);
}

function valorDe(clave, nombre) {
    const v = (D.leerClave(clave) || {})[nombre];
    return Array.isArray(v) ? v.join(', ') : (v ?? '');
}

// Actualiza SOLO los campos que el alumno no está escribiendo ni tiene pendientes.
function sincronizarCampos(raiz) {
    for (const input of $$('[data-clave]', raiz)) {
        if (input.type === 'checkbox') { input.checked = !!(D.leerClave(input.dataset.clave) || {})[input.dataset.campo]; continue; }
        if (document.activeElement === input || sucios.has(`${input.dataset.clave}|${input.dataset.campo}`)) continue;
        const v = valorDe(input.dataset.clave, input.dataset.campo);
        if (input.value !== v) input.value = v;
    }
    // Lo que no es un campo de texto (opciones, periodo, herramientas) se repinta desde lo guardado.
    for (const n of $$('[data-pinta]', raiz)) if (n._pintar) n._pintar();
}

// ───────────── modal propio (no el confirm del navegador) ─────────────
function confirmarModal({ titulo, texto, ok = 'Aceptar', cancelar = 'Cancelar' }) {
    return new Promise((resolver) => {
        const previo = document.activeElement;
        const cerrar = (r) => { fondo.remove(); document.removeEventListener('keydown', tecla); if (previo && previo.focus) previo.focus(); resolver(r); };
        const tecla = (e) => { if (e.key === 'Escape') cerrar(false); };
        const bCancel = el('button', { type: 'button', class: 'dp-btn', text: cancelar, onclick: () => cerrar(false) });
        const bOk = el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: ok, onclick: () => cerrar(true) });
        const fondo = el('div', { class: 'dp-modal-fondo', onclick: (e) => { if (e.target === fondo) cerrar(false); } },
            el('div', { class: 'dp-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo },
                el('h3', { text: titulo }), el('p', { text: texto }), el('div', { class: 'dp-modal-acciones' }, bCancel, bOk)));
        document.body.append(fondo);
        document.addEventListener('keydown', tecla);
        bCancel.focus();
    });
}

// ───────────── avisos (toasts) ─────────────
function toast({ id, texto, boton, alBoton, persistente = false }) {
    let caja = $('#dpToasts');
    if (!caja) { caja = el('div', { id: 'dpToasts', class: 'dp-toasts', role: 'status', 'aria-live': 'polite' }); document.body.append(caja); }
    if (id) { const viejo = $(`[data-toast="${id}"]`, caja); if (viejo) viejo.remove(); }
    const n = el('div', { class: 'dp-toast', 'data-toast': id || '' }, el('span', { text: texto }));
    const quitar = () => n.remove();
    if (boton) n.append(el('button', { type: 'button', class: 'dp-toast-btn', text: boton, onclick: () => { try { alBoton && alBoton(); } finally { quitar(); } } }));
    n.append(el('button', { type: 'button', class: 'dp-toast-x', 'aria-label': 'Cerrar aviso', text: '×', onclick: quitar }));
    caja.append(n);
    if (!persistente) setTimeout(quitar, 14000);
}
const quitarToast = (id) => { const n = $(`[data-toast="${id}"]`); if (n) n.remove(); };

// ───────────── tarjetas de las colecciones (proyectos, logros, experiencia) ─────────────
// ───────────── proyecto: categoría, equipo, periodo, descripción guiada y herramientas ─────────────
const leerItem = (clave) => D.leerClave(clave) || {};

function pintarSel(caja) {
    const v = leerItem(caja.dataset.claveSel)[caja.dataset.sel] || '';
    $$('[data-valor]', caja).forEach((b) => { const on = b.dataset.valor === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    const hint = $('[data-hint]', caja.parentElement);
    if (hint) { const c = C.CATEGORIAS_PROYECTO.find((x) => x.id === v); hint.textContent = c ? c.texto : hint.dataset.vacio; }
}

function pintarPeriodo(det) {
    const chk = $('[data-campo="sigue"]', det), desde = $('[data-campo="desde"]', det), hasta = $('[data-campo="hasta"]', det);
    hasta.disabled = chk.checked;
    $('[data-resumen]', det).textContent = textoPeriodo({ desde: desde.value, hasta: hasta.value, sigue: chk.checked });
}

function camposProyecto(clave) {
    const ej = C.EJEMPLOS_CARRERA[tipoCarrera((cv.formacion || {}).carrera)] || C.EJEMPLOS_CARRERA.gen;
    const base = 'g-' + clave.replace(/\W/g, '_');
    let pintarBorrador = () => '';

    // Guarda lo que NO es un campo de texto sin pisar lo que el alumno está escribiendo.
    const guardarCampo = (cambios) => {
        flush(clave);
        D.guardarClave(clave, { ...leerItem(clave), ...cambios });
        refrescarMemoria();
    };

    // 1. Opciones de una sola respuesta (categoría y modalidad)
    const opciones = (campoNombre, lista, etiqueta, hint) => {
        const caja = el('div', { class: 'dpc-opciones', role: 'group', 'aria-label': etiqueta, 'data-pinta': '', 'data-sel': campoNombre, 'data-clave-sel': clave },
            ...lista.map((o) => el('button', {
                type: 'button', class: 'dpc-op', 'data-valor': o.id, 'aria-pressed': 'false', text: o.nombre,
                onclick: () => { guardarCampo({ [campoNombre]: leerItem(clave)[campoNombre] === o.id ? '' : o.id }); pintarSel(caja); pintarBorrador(); },
            })));
        caja._pintar = () => { pintarSel(caja); pintarBorrador(); };
        const bloque = el('div', { class: 'dp-campo' }, el('span', { class: 'dpc-lab', text: etiqueta }), caja, hint);
        pintarSel(caja);
        return bloque;
    };
    const hintCategoria = el('small', { class: 'dp-ayuda', 'data-hint': '', 'data-vacio': 'Elige donde empezó. Si dudas entre dos, quédate con la primera en la que lo trabajaste.', text: 'Elige donde empezó. Si dudas entre dos, quédate con la primera en la que lo trabajaste.' });
    const bloqueCategoria = opciones('categoria', C.CATEGORIAS_PROYECTO, '¿Dónde nació este proyecto?', hintCategoria);
    const bloqueModalidad = opciones('modalidad', C.MODALIDADES_PROYECTO, '¿Lo hiciste solo o en equipo?', null);
    pintarSel($('.dpc-opciones', bloqueCategoria));

    // 2. Periodo (opcional): una casilla «Sigue en desarrollo» desactiva «Hasta»
    const chkSigue = el('input', { type: 'checkbox', id: `${base}-sigue` });
    chkSigue.dataset.clave = clave; chkSigue.dataset.campo = 'sigue';
    chkSigue.checked = !!leerItem(clave).sigue;
    const desde = campo({ clave, nombre: 'desde', etiqueta: 'Desde', placeholder: 'Ej.: 2024 o marzo de 2024' });
    const hasta = campo({ clave, nombre: 'hasta', etiqueta: 'Hasta', placeholder: 'Ej.: 2025 o noviembre de 2025' });
    const resumen = el('span', { class: 'dpc-resumen', 'data-resumen': '' });
    const it0 = leerItem(clave);
    const detPeriodo = el('details', { class: 'dpc-det dpc-periodo', 'data-pinta': '', open: (it0.desde || it0.hasta || it0.sigue) ? true : null },
        el('summary', {}, 'Periodo ', el('span', { class: 'dp-opc', text: '(opcional)' }), resumen),
        el('div', { class: 'dpc-fechas' }, desde, hasta),
        el('label', { class: 'dp-casilla', for: chkSigue.id }, chkSigue, ' Sigue en desarrollo'),
        el('small', { class: 'dp-ayuda', text: 'Sin fechas, tu CV no muestra periodo. Basta con el año si no recuerdas el mes.' }));
    detPeriodo._pintar = () => { pintarPeriodo(detPeriodo); pintarBorrador(); };
    chkSigue.addEventListener('change', () => {
        if (chkSigue.checked) $('input[data-campo="hasta"]', detPeriodo).value = '';
        flush(clave); pintarPeriodo(detPeriodo); pintarBorrador();
    });
    detPeriodo.addEventListener('input', () => pintarPeriodo(detPeriodo));
    pintarPeriodo(detPeriodo);

    // 3. Descripción: escribir directo o recibir orientación (sin IA: una plantilla que se puede editar)
    const areaCampo = campo({ clave, nombre: 'queHiciste', etiqueta: 'Describe tu proyecto', area: true, placeholder: ej.desc,
        ayuda: 'Basta con 2 o 3 líneas: qué es, qué hiciste y con qué. El detalle largo va en tu portafolio o LinkedIn.' });
    const area = $('textarea', areaCampo);
    const verbo = el('select', { id: `${base}-v` }, C.VERBOS_TRABAJO.map((v, i) => el('option', { value: String(i), text: v[0] })));
    const gObj = el('input', { type: 'text', id: `${base}-o`, autocomplete: 'off', placeholder: `Ej.: ${ej.objeto}` });
    const gHizo = el('input', { type: 'text', id: `${base}-h`, autocomplete: 'off', placeholder: `Ej.: ${ej.hizo}` });
    const gMeta = el('input', { type: 'text', id: `${base}-m`, autocomplete: 'off', placeholder: `Ej.: ${ej.meta}` });
    const gRes = el('input', { type: 'text', id: `${base}-r`, autocomplete: 'off', placeholder: `Ej.: ${ej.resultado}` });
    const borrador = el('div', { class: 'dpc-borrador', 'aria-live': 'polite' });
    const errGuia = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const pregunta = (id, etiqueta, entrada, ayuda, opc) => el('div', { class: 'dpc-pregunta' },
        el('label', { for: id }, etiqueta, opc ? el('span', { class: 'dp-opc', text: ' (opcional)' }) : null), entrada,
        ayuda ? el('small', { class: 'dp-ayuda', text: ayuda }) : null);
    pintarBorrador = () => {
        const it = leerItem(clave);
        const t = armarBorrador({ verbo: Number(verbo.value), objeto: gObj.value, hizo: gHizo.value, meta: gMeta.value, resultado: gRes.value,
            equipo: it.modalidad === 'equipo', sigue: chkSigue.checked, herramientas: todasLasHerramientas(gruposDesde(it)) });
        borrador.textContent = t || 'Completa «qué creaste» y «qué hiciste» y verás tu borrador aquí.';
        borrador.classList.toggle('vacio', !t);
        return t;
    };
    const guia = el('div', { class: 'dpc-guia', hidden: true },
        pregunta(`${base}-v`, '¿Qué tipo de trabajo realizaste?', verbo, 'Elige el verbo que mejor describe tu participación.'),
        pregunta(`${base}-o`, '¿Qué creaste o realizaste?', gObj, 'Una aplicación, investigación, diseño, prototipo, análisis, propuesta, estudio…'),
        pregunta(`${base}-h`, '¿Qué hiciste concretamente?', gHizo, 'Tus tareas, responsabilidades y aportes principales.'),
        pregunta(`${base}-m`, '¿Qué problema, necesidad u objetivo tenía?', gMeta, 'Qué buscabas solucionar, mejorar, investigar o conseguir.', true),
        pregunta(`${base}-r`, '¿Qué resultado obtuviste?', gRes, 'Escríbelo como frase, sin inventar cifras: «la usan compañeros de varios ciclos».', true),
        el('span', { class: 'dpc-lab', text: 'Así va quedando' }), borrador, errGuia,
        el('div', { class: 'dpc-acciones-guia' },
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: 'Usar este borrador y editarlo', onclick: async () => {
                const t = pintarBorrador();
                if (!t) { errGuia.textContent = 'Falta lo principal: qué creaste y qué hiciste.'; errGuia.hidden = false; return; }
                if (area.value.trim() && !(await confirmarModal({ titulo: 'Reemplazar tu descripción', texto: 'Ya escribiste una descripción. Si usas el borrador, se reemplazará. Después podrás editarlo como quieras.', ok: 'Usar borrador' }))) return;
                area.value = t; area.dispatchEvent(new Event('input', { bubbles: true })); flush(clave);
                guia.hidden = true; botonGuia.setAttribute('aria-expanded', 'false'); area.focus();
            } }),
            el('span', { class: 'dp-ayuda', text: 'Después podrás cambiar lo que quieras: la última palabra es tuya.' })));
    [verbo, gObj, gHizo, gMeta, gRes].forEach((n) => n.addEventListener('input', () => { errGuia.hidden = true; pintarBorrador(); }));
    const botonGuia = el('button', { type: 'button', class: 'dpc-camino', 'aria-expanded': 'false', onclick: () => {
        guia.hidden = !guia.hidden; botonGuia.setAttribute('aria-expanded', guia.hidden ? 'false' : 'true'); if (!guia.hidden) { pintarBorrador(); gObj.focus(); }
    } }, el('strong', { text: 'Necesito orientación' }), el('span', { text: 'Responde unas preguntas y arma un borrador que puedes editar' }));
    const bloqueDescripcion = el('div', {}, areaCampo, el('div', { class: 'dpc-caminos' }, botonGuia), guia);

    // 4. Herramientas y recursos, en tres grupos con escritura libre
    const bloqueHerr = el('div', { class: 'dp-campo', 'data-pinta': '' },
        el('span', { class: 'dpc-lab', text: 'Herramientas y recursos utilizados' }),
        el('small', { class: 'dp-ayuda', text: 'No necesitas completar todos los grupos. Puedes escribir lo que quieras: lo sugerido es solo una guía.' }));
    const pintores = [];
    const cambiarHerr = (id, fn) => {
        const g = gruposDesde(leerItem(clave));
        g[id] = fn([...g[id]]);
        guardarCampo({ herr: g, herramientas: aplanarHerramientas(g) });
        pintores.forEach((p) => p()); pintarBorrador();
    };
    for (const grupo of C.GRUPOS_HERRAMIENTAS) {
        const etiquetas = el('div', { class: 'dp-chips' });
        const sugerencias = el('div', { class: 'dp-chips dpc-sugerencias' });
        const cuenta = el('span', { class: 'dpc-resumen' });
        const entrada = el('input', { type: 'text', autocomplete: 'off', placeholder: 'Escribe y pulsa Enter', 'aria-label': `Añadir a ${grupo.nombre}` });
        const error = el('small', { class: 'dp-error', role: 'alert', hidden: true });
        const anadir = (valor) => {
            const v = (valor || '').trim();
            if (!v) { error.textContent = 'Escribe algo antes de añadirlo.'; error.hidden = false; return; }
            if (gruposDesde(leerItem(clave))[grupo.id].some((x) => x.toLowerCase() === v.toLowerCase())) { error.textContent = 'Ya lo añadiste.'; error.hidden = false; return; }
            error.hidden = true; entrada.value = '';
            cambiarHerr(grupo.id, (l) => [...l, v]);
        };
        entrada.addEventListener('input', () => { error.hidden = true; });
        entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); anadir(entrada.value); } });
        const pintar = () => {
            const actuales = gruposDesde(leerItem(clave))[grupo.id];
            cuenta.textContent = actuales.length ? ` · ${actuales.length}` : '';
            etiquetas.replaceChildren(...actuales.map((x, i) => el('span', { class: 'dp-chip dp-chip-hab' }, x,
                el('button', { type: 'button', class: 'dp-chip-x', 'aria-label': `Quitar ${x}`, text: '×', onclick: () => cambiarHerr(grupo.id, (l) => { l.splice(i, 1); return l; }) }))));
            sugerencias.replaceChildren(...(ej.herr[grupo.id] || []).filter((x) => !actuales.some((a) => a.toLowerCase() === x.toLowerCase()))
                .map((x) => el('button', { type: 'button', class: 'dp-chip dpc-sug', text: `+ ${x}`, onclick: () => anadir(x) })));
        };
        pintores.push(pintar);
        bloqueHerr.append(el('details', { class: 'dpc-det', open: (grupo.id === 'sw' || gruposDesde(leerItem(clave))[grupo.id].length) ? true : null },
            el('summary', {}, grupo.nombre, cuenta),
            el('small', { class: 'dp-ayuda', text: grupo.texto }), etiquetas,
            el('div', { class: 'dp-agregar' }, entrada, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Añadir', onclick: () => anadir(entrada.value) })), error,
            el('p', { class: 'dpc-sug-tit', text: 'Ideas para tu carrera:' }), sugerencias));
    }
    bloqueHerr._pintar = () => { pintores.forEach((p) => p()); pintarBorrador(); };
    pintores.forEach((p) => p());

    return [
        campo({ clave, nombre: 'nombre', etiqueta: 'Nombre del proyecto', placeholder: ej.nombre }),
        bloqueCategoria, bloqueModalidad, detPeriodo, bloqueDescripcion, bloqueHerr,
        campo({ clave, nombre: 'evidencia', etiqueta: 'Resultado o evidencia', opcional: true, placeholder: 'Un repositorio, una presentación, una demostración, un documento o un resultado', area: true }),
    ];
}

const CAMPOS_TARJETA = {
    proyecto: (clave) => camposProyecto(clave),
    logro: (clave) => [
        campo({ clave, nombre: 'texto', etiqueta: 'Logro', placeholder: C.EJEMPLOS_LOGRO[1], area: true }),
        campo({ clave, nombre: 'respaldo', etiqueta: 'Con qué lo respaldas', placeholder: 'Un número, un reconocimiento o un enlace', ayuda: 'Puede ser una cantidad, un puesto obtenido, el nombre del evento o un enlace.' }),
    ],
    experiencia: (clave) => [
        campo({ clave, nombre: 'puesto', etiqueta: 'Puesto o actividad', placeholder: 'Voluntariado, negocio familiar, trabajo temporal…' }),
        campo({ clave, nombre: 'queHiciste', etiqueta: '¿Qué hiciste?', placeholder: 'Empieza con un verbo y di el resultado', area: true }),
    ],
};
const ROTULO = { proyecto: 'Proyecto', logro: 'Logro', experiencia: 'Experiencia' };

function crearTarjeta(tipo, item) {
    const clave = D.claveDe(tipo, item.id);
    const titulo = el('strong', { class: 'dp-tarjeta-num' });
    const accion = el('span', { class: 'dp-quitar' });
    const mostrarQuitar = () => {
        accion.replaceChildren(el('button', { type: 'button', class: 'dp-btn-texto', text: 'Quitar', onclick: preguntar }));
    };
    const preguntar = () => {
        accion.replaceChildren(
            el('span', { class: 'dp-quitar-q', text: '¿Quitar? ' }),
            el('button', { type: 'button', class: 'dp-btn-texto dp-peligro', text: 'Sí', onclick: () => quitar(tipo, item.id, clave) }),
            el('button', { type: 'button', class: 'dp-btn-texto', text: 'No', onclick: mostrarQuitar }));
    };
    mostrarQuitar();
    return el('div', { class: 'dp-tarjeta', 'data-id': item.id }, el('div', { class: 'dp-tarjeta-cab' }, titulo, accion), ...CAMPOS_TARJETA[tipo](clave));
}

function quitar(tipo, id, clave) {
    clearTimeout(temporizadores.get(clave)); temporizadores.delete(clave); limpiarSucios(clave);
    D.quitarElemento(tipo, id);
    const tarjeta = $(`.dp-tarjeta[data-id="${id}"]`);
    if (tarjeta) tarjeta.remove();                  // el alumno acaba de pedirlo: se quita aunque el foco esté dentro
    cv = D.leerCV();
    conciliar();
    refrescarMemoria();
}

// Concilia una lista: crea las tarjetas que faltan, quita las que ya no existen y NO toca las que se están escribiendo.
function reconciliarLista(tipo) {
    const cont = $(`[data-lista="${tipo}"]`);
    if (!cont) return;
    const items = cv[COLECCION[tipo]];
    const existentes = new Map($$('.dp-tarjeta', cont).map((t) => [t.dataset.id, t]));
    const ids = new Set(items.map((i) => i.id));
    for (const [id, tarjeta] of existentes) if (!ids.has(id) && !tarjeta.contains(document.activeElement)) { tarjeta.remove(); existentes.delete(id); }
    items.forEach((item, i) => {
        if (!existentes.has(item.id)) {
            const t = crearTarjeta(tipo, item);
            cont.insertBefore(t, cont.querySelectorAll('.dp-tarjeta')[i] || null);
            existentes.set(item.id, t);
        }
    });
    $$('.dp-tarjeta', cont).forEach((t, i) => { $('.dp-tarjeta-num', t).textContent = `${ROTULO[tipo]} ${i + 1}`; });
    const vacio = $(`[data-vacio="${tipo}"]`);
    if (vacio) vacio.hidden = cont.querySelectorAll('.dp-tarjeta').length > 0;
    sincronizarCampos(cont);
}

function bloqueLista(tipo, { vacio, botonTexto, base }) {
    const cont = el('div', { class: 'dp-lista', 'data-lista': tipo });
    const aviso = el('p', { class: 'dp-vacio', 'data-vacio': tipo, text: vacio });
    const boton = el('button', {
        type: 'button', class: 'dp-btn dp-btn-agregar', text: botonTexto,
        onclick: () => {
            const nuevo = D.nuevoElemento(tipo, base);
            refrescarMemoria();
            reconciliarLista(tipo);
            const t = $(`.dp-tarjeta[data-id="${nuevo.id}"]`, cont);
            const primero = t && $('input, textarea', t);
            if (primero) primero.focus();
        },
    });
    const bloque = el('div', {}, aviso, cont, boton);
    queueMicrotask(() => reconciliarLista(tipo));
    return bloque;
}

// ───────────── contenido de cada paso ─────────────
function pasoDatos() {
    const c = CLAVE_DATOS;
    return el('div', {},
        campo({ clave: c, nombre: 'nombre', etiqueta: 'Nombre completo', placeholder: 'Nombre y apellidos', extra: { autocomplete: 'name' } }),
        campo({ clave: c, nombre: 'correo', etiqueta: 'Correo electrónico', placeholder: 'nombre@correo.com', tipo: 'email', extra: { autocomplete: 'email' } }),
        campo({ clave: c, nombre: 'telefono', etiqueta: 'Teléfono', placeholder: '987 654 321', tipo: 'tel', extra: { autocomplete: 'tel' } }),
        campo({ clave: c, nombre: 'linkedin', etiqueta: 'LinkedIn', opcional: true, placeholder: 'linkedin.com/in/tu-usuario', ayuda: 'Si no tienes, déjalo vacío.' }),
        campo({ clave: c, nombre: 'github', etiqueta: 'GitHub', opcional: true, placeholder: 'github.com/tu-usuario', ayuda: 'Si no tienes, déjalo vacío.' }),
        campo({ clave: c, nombre: 'distrito', etiqueta: 'Distrito', opcional: true, placeholder: 'Por ejemplo: Rímac' }));
}

function pasoFormacion() {
    const c = CLAVE_FORMACION;
    const marca = el('span', { class: 'dp-etiqueta-siga', 'data-marca-siga': '' });
    const actualizarMarca = () => { marca.hidden = !(D.leerClave(c) || {}).desdeSiga; marca.textContent = 'Prellenado desde SIGA · editable'; };
    actualizarMarca();
    const restablecer = el('button', {
        type: 'button', class: 'dp-btn dp-btn-chico', text: 'Restablecer datos de SIGA',
        onclick: async () => {
            const s = await leerDatosSiga(supabase);
            const nombres = [s.universidad && 'universidad', s.carrera && 'carrera', s.ingreso && 'año de ingreso'].filter(Boolean);
            const lista = nombres.length > 1 ? nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1] : nombres[0];
            const si = await confirmarModal({
                titulo: 'Restablecer datos de SIGA',
                texto: `Volveremos a copiar de tu perfil de SIGA: ${lista}. Lo que hayas editado en esos campos se reemplazará. Tus cursos y tu promedio no cambian, y tu perfil de SIGA tampoco.`,
                ok: 'Restablecer',
            });
            if (!si) return;
            flush(c);
            const actual = D.leerClave(c) || {};
            const nuevo = { ...actual, universidad: s.universidad || actual.universidad || '', carrera: s.carrera || actual.carrera || '', ingreso: s.ingreso || actual.ingreso || '', desdeSiga: true };
            limpiarSucios(c);
            D.guardarClave(c, nuevo);
            refrescarMemoria();
            sincronizarCampos($('#dpPanel'));
            actualizarMarca();
        },
    });
    // Primera vez: copiar lo que SIGA ya sabe. No pisa nada que el alumno haya escrito mientras tanto.
    if (D.leerClave(c) === undefined) {
        leerDatosSiga(supabase).then((s) => {
            const actual = D.leerClave(c);
            if (actual === undefined) {
                D.guardarClave(c, { universidad: s.universidad, carrera: s.carrera, ingreso: s.ingreso, cursos: [], promedio: '', desdeSiga: true });
            } else {
                const mezcla = { ...actual };
                for (const k of ['universidad', 'carrera', 'ingreso']) if (!mezcla[k] && s[k]) mezcla[k] = s[k];
                D.guardarClave(c, mezcla);
            }
            refrescarMemoria();
            if ($('#dpPanel') && $('[data-clave="cv:formacion"]')) { sincronizarCampos($('#dpPanel')); actualizarMarca(); }
        });
    }
    return el('div', {},
        el('div', { class: 'dp-fila-siga' }, marca, restablecer),
        campo({ clave: c, nombre: 'universidad', etiqueta: 'Universidad', placeholder: 'Universidad Nacional de Ingeniería' }),
        campo({ clave: c, nombre: 'carrera', etiqueta: 'Carrera', placeholder: 'Ingeniería de Sistemas' }),
        campo({ clave: c, nombre: 'ingreso', etiqueta: 'Año de ingreso', placeholder: '2023', opcional: true, extra: { inputmode: 'numeric', maxlength: '4' } }),
        campo({ clave: c, nombre: 'cursos', etiqueta: 'Cursos relevantes', opcional: true, placeholder: 'Bases de Datos, Programación, Estadística', ayuda: 'Separa con comas. Hasta 5, relacionados con el puesto al que postulas.' }),
        campo({ clave: c, nombre: 'promedio', etiqueta: 'Promedio académico', opcional: true, placeholder: 'Déjalo vacío si no deseas incluirlo' }));
}

function pasoProyectos() {
    const ideas = el('div', { class: 'dp-ideas' },
        el('p', { class: 'dp-suave', text: 'Un proyecto no tiene que ser un sistema informático. Según dónde nació, puede ser:' }),
        el('ul', { class: 'dp-lista-ejemplos' }, C.CATEGORIAS_PROYECTO.map((c) => el('li', {}, el('strong', { text: c.nombre + ': ' }), c.texto))));
    return el('div', {}, bloqueLista('proyecto', {
        vacio: 'Todavía no agregaste ningún proyecto. Un trabajo final de un curso es un buen comienzo.',
        botonTexto: '+ Añadir proyecto',
        base: { nombre: '', queHiciste: '', herramientas: '', evidencia: '', categoria: '', modalidad: '', desde: '', hasta: '', sigue: false, origen: 'manual' },
    }), ideas);
}

function pasoLogros() {
    return el('div', {}, bloqueLista('logro', {
        vacio: 'Todavía no agregaste ningún logro.', botonTexto: '+ Añadir logro', base: { texto: '', respaldo: '' },
    }), el('div', { class: 'dp-ideas' },
        el('p', { class: 'dp-suave', text: 'Ejemplos de logros con respaldo:' }),
        el('ul', { class: 'dp-lista-ejemplos' }, C.EJEMPLOS_LOGRO.map((t) => el('li', { text: t })))));
}

function pasoExperiencia() {
    const casilla = el('input', { type: 'checkbox', id: 'dpSinExp' });
    casilla.dataset.clave = CLAVE_AJUSTES; casilla.dataset.campo = 'sinExperiencia';
    casilla.checked = !!(D.leerClave(CLAVE_AJUSTES) || {}).sinExperiencia;
    const cuerpo = el('div', { class: 'dp-exp-cuerpo' }, bloqueLista('experiencia', {
        vacio: 'Sin experiencias registradas.', botonTexto: '+ Añadir experiencia', base: { puesto: '', queHiciste: '' },
    }), el('div', { class: 'dp-ideas' },
        el('p', { class: 'dp-suave', text: 'También puedes incluir:' }),
        el('div', {}, C.TIPOS_EXPERIENCIA.map((t) => el('span', { class: 'dp-chip dp-chip-lila', text: t })))));
    const pintar = () => { cuerpo.classList.toggle('dp-atenuado', casilla.checked); };
    casilla.addEventListener('change', () => { D.guardarClave(CLAVE_AJUSTES, { ...(D.leerClave(CLAVE_AJUSTES) || {}), sinExperiencia: casilla.checked }); pintar(); refrescarMemoria(); });
    pintar();
    return el('div', {}, el('label', { class: 'dp-casilla', for: 'dpSinExp' }, casilla, ' Aún no he trabajado (puedes saltar este paso)'), cuerpo);
}

// Habilidades: cada una es un elemento independiente (chip). Cuatro categorías:
//   tecnica / herramienta → nombre + nivel OPCIONAL (sin nivel se ve y se guarda igual que siempre)
//   idioma               → nombre + nivel general + detalle opcional (au, le, or, es)
//   personal             → solo el nombre, hasta C.MAX_PERSONALES, sin nivel
// Lo ya guardado nunca se reescribe al abrir el paso: solo cambia lo que el alumno edita, y se conservan los campos que no conoce.
const CICLO_NIVEL = ['', ...C.NIVELES];

function ejemplosHabilidades() {
    return C.EJEMPLOS_HABILIDADES[tipoCarrera((cv.formacion || {}).carrera)] || C.EJEMPLOS_HABILIDADES.gen;
}

// Actualiza UN elemento sin tocar los demás y conservando todos sus campos.
function guardarHabilidad(id, cambios, quitar = []) {
    const actual = D.leerCV().habilidades.find((x) => x.id === id);
    if (!actual) return;
    const nuevo = { ...actual, ...cambios };
    quitar.forEach((k) => { delete nuevo[k]; });                   // un nivel vacío se quita del todo: el elemento vuelve a ser como era
    D.guardarElemento('habilidad', nuevo);
    refrescarMemoria(); pintarChips();
}

const yaExiste = (cat, nombre) => cv.habilidades.some((h) => h.categoria === cat && String(h.nombre || '').trim().toLowerCase() === nombre.toLowerCase());

function filaAgregar({ cat, info, conNivel }) {
    const chips = el('div', { class: 'dp-chips', 'data-chips': cat });
    const sugerencias = el('div', { class: 'dp-chips dpc-sugerencias', 'data-sugerencias': cat });
    const entrada = el('input', { type: 'text', placeholder: 'Escribe y pulsa Enter', 'aria-label': `Agregar a ${info.titulo}`, autocomplete: 'off', class: 'dp-entrada-chip' });
    const nivel = el('select', { 'aria-label': 'Nivel de dominio (opcional)' }, el('option', { value: '', text: 'Sin nivel' }), C.NIVELES.map((n) => el('option', { value: n, text: n })));
    const error = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const agregar = (texto, niv = '') => {
        const nombre = String(texto || '').trim();
        if (!nombre) { error.textContent = 'Escribe algo antes de agregarlo.'; error.hidden = false; return; }
        if (yaExiste(cat, nombre)) { error.textContent = 'Ya lo agregaste.'; error.hidden = false; return; }
        error.hidden = true;
        D.nuevoElemento('habilidad', { categoria: cat, nombre, ...(niv ? { nivel: niv } : {}) });
        entrada.value = ''; nivel.value = '';
        refrescarMemoria(); pintarChips();
    };
    sugerencias._agregar = (t) => agregar(t);
    entrada.addEventListener('input', () => { error.hidden = true; });
    entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(entrada.value, nivel.value); } });
    return el('div', { class: 'dp-grupo' },
        el('h3', { text: info.titulo }), el('small', { class: 'dp-ayuda', text: info.ayuda }), chips,
        el('div', { class: 'dp-agregar' }, entrada, conNivel ? nivel : null, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Agregar', onclick: () => agregar(entrada.value, nivel.value) })), error,
        conNivel ? el('p', { class: 'dpc-sug-tit', text: 'Ideas para tu carrera:' }) : null, conNivel ? sugerencias : null);
}

function grupoIdiomas() {
    const cat = 'idioma', info = C.HABILIDADES.idioma;
    const chips = el('div', { class: 'dp-chips', 'data-chips': cat });
    const editor = el('div', { class: 'dpc-editor', 'data-editor-idioma': '', hidden: true });
    const entrada = el('input', { type: 'text', placeholder: 'Ejemplo: Inglés', 'aria-label': 'Agregar idioma', autocomplete: 'off', class: 'dp-entrada-chip' });
    const nivel = el('select', { 'aria-label': 'Nivel general' }, C.NIVELES.map((n) => el('option', { value: n, text: n, selected: n === 'Intermedio' })));
    const detalle = C.DETALLE_IDIOMA.map(([k, etiqueta]) => ({ k, sel: el('select', { id: `dpc-det-${k}`, 'aria-label': etiqueta }, el('option', { value: '', text: 'Igual que el general' }), C.NIVELES.map((n) => el('option', { value: n, text: n }))), etiqueta }));
    const error = el('small', { class: 'dp-error', role: 'alert', hidden: true });
    const agregar = () => {
        const nombre = entrada.value.trim();
        if (!nombre) { error.textContent = 'Escribe un idioma antes de agregarlo.'; error.hidden = false; return; }
        if (yaExiste(cat, nombre)) { error.textContent = 'Ya lo agregaste.'; error.hidden = false; return; }
        error.hidden = true;
        const det = {}; detalle.forEach(({ k, sel }) => { if (sel.value) det[k] = sel.value; });
        D.nuevoElemento('habilidad', { categoria: cat, nombre, nivel: nivel.value, ...(Object.keys(det).length ? { detalle: det } : {}) });
        entrada.value = ''; detalle.forEach(({ sel }) => { sel.value = ''; });
        const d = $('.dpc-det-nuevo'); if (d) d.open = false;
        refrescarMemoria(); pintarChips();
    };
    entrada.addEventListener('input', () => { error.hidden = true; });
    entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } });
    return el('div', { class: 'dp-grupo' },
        el('h3', { text: info.titulo }), el('small', { class: 'dp-ayuda', text: info.ayuda }), chips, editor,
        el('div', { class: 'dp-agregar' }, entrada, nivel, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Agregar', onclick: agregar })),
        el('details', { class: 'dpc-det dpc-det-nuevo' }, el('summary', { text: 'Detallar por habilidad (opcional)' }),
            el('div', { class: 'dpc-det4' }, detalle.map(({ etiqueta, sel }) => el('div', {}, el('label', { for: sel.id, text: etiqueta }), sel)))),
        error, el('small', { class: 'dp-ayuda', text: C.AVISO_IDIOMAS }));
}

function grupoPersonales() {
    const info = C.HABILIDADES.personal;
    const entrada = el('input', { type: 'text', placeholder: 'Otra habilidad', 'aria-label': 'Otra habilidad personal', autocomplete: 'off', class: 'dp-entrada-chip' });
    const error = el('small', { class: 'dp-error', role: 'alert', hidden: true, 'data-err-personal': '' });
    entrada.addEventListener('input', () => { error.hidden = true; });
    entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregarPersonal(entrada.value, entrada, error); } });
    return el('div', { class: 'dp-grupo' },
        el('h3', {}, info.titulo, el('span', { class: 'dp-opc', text: ' (opcional, sin niveles)' })), el('small', { class: 'dp-ayuda', text: info.ayuda }),
        el('div', { class: 'dpc-opciones', 'data-personales': '' }),
        el('div', { class: 'dp-agregar' }, entrada, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Agregar', onclick: () => agregarPersonal(entrada.value, entrada, error) }),
            el('span', { class: 'dp-ayuda', 'data-cuenta-personales': '' })), error);
}

function agregarPersonal(texto, entrada, error) {
    const nombre = String(texto || '').trim();
    const e = error || $('[data-err-personal]');
    const fallo = (t) => { if (e) { e.textContent = t; e.hidden = false; } };
    if (!nombre) return fallo('Escribe algo antes de agregarla.');
    if (yaExiste('personal', nombre)) return fallo('Ya la agregaste.');
    if (cv.habilidades.filter((h) => h.categoria === 'personal').length >= C.MAX_PERSONALES) return fallo(`Puedes elegir hasta ${C.MAX_PERSONALES}. Quita una para elegir otra.`);
    if (e) e.hidden = true;
    D.nuevoElemento('habilidad', { categoria: 'personal', nombre });
    if (entrada) entrada.value = '';
    refrescarMemoria(); pintarChips();
}

function pasoHabilidades() {
    const ayudas = el('div', { class: 'dpc-ayudas' },
        el('details', { class: 'dpc-det' }, el('summary', { text: '¿No sabes qué habilidades incluir?' }), el('p', { class: 'dp-suave', text: C.AYUDA_QUE_INCLUIR })),
        el('details', { class: 'dpc-det' }, el('summary', { text: '¿Qué significa cada nivel?' }), el('p', { class: 'dp-suave', text: C.AYUDA_NIVELES })));
    queueMicrotask(pintarChips);
    return el('div', {}, ayudas,
        filaAgregar({ cat: 'tecnica', info: C.HABILIDADES.tecnica, conNivel: true }),
        filaAgregar({ cat: 'herramienta', info: C.HABILIDADES.herramienta, conNivel: true }),
        grupoIdiomas(), grupoPersonales());
}

function chipNivel(h) {
    return el('span', { class: 'dp-chip dp-chip-hab' }, h.nombre,
        el('button', { type: 'button', class: 'dpc-nivel', title: 'Pulsa para cambiar el nivel (opcional)', text: h.nivel || 'sin nivel',
            onclick: () => { const sig = CICLO_NIVEL[(CICLO_NIVEL.indexOf(h.nivel || '') + 1) % CICLO_NIVEL.length]; guardarHabilidad(h.id, sig ? { nivel: sig } : {}, sig ? [] : ['nivel']); } }),
        botonQuitar(h));
}
const botonQuitar = (h) => el('button', { type: 'button', class: 'dp-chip-x', 'aria-label': `Quitar ${h.nombre}`, text: '×', onclick: () => { D.quitarElemento('habilidad', h.id); refrescarMemoria(); pintarChips(); } });

function chipIdioma(h) {
    const det = detalleIdioma(h);
    return el('span', { class: 'dp-chip dp-chip-hab' }, h.nombre + (h.nivel ? ` · ${h.nivel}` : '') + (det ? ` (${det})` : ''),
        el('button', { type: 'button', class: 'dpc-nivel', text: 'editar', title: 'Cambiar el nivel o el detalle', onclick: () => abrirEditorIdioma(h.id) }),
        botonQuitar(h));
}

// Editor de un idioma ya guardado: cada cambio actualiza ese idioma al instante.
function abrirEditorIdioma(id) {
    const caja = $('[data-editor-idioma]'); if (!caja) return;
    const h = D.leerCV().habilidades.find((x) => x.id === id); if (!h) return;
    const det = (h.detalle && typeof h.detalle === 'object') ? h.detalle : {};
    const general = el('select', { id: 'dpc-ed-nivel', 'aria-label': 'Nivel general' }, C.NIVELES.map((n) => el('option', { value: n, text: n, selected: n === h.nivel })));
    general.addEventListener('change', () => guardarHabilidad(id, { nivel: general.value }));
    const campos = C.DETALLE_IDIOMA.map(([k, etiqueta]) => {
        const sel = el('select', { id: `dpc-ed-${k}` }, el('option', { value: '', text: 'Igual que el general' }), C.NIVELES.map((n) => el('option', { value: n, text: n, selected: n === det[k] })));
        sel.addEventListener('change', () => {
            const actual = D.leerCV().habilidades.find((x) => x.id === id); if (!actual) return;
            const nuevo = { ...((actual.detalle && typeof actual.detalle === 'object') ? actual.detalle : {}) };
            if (sel.value) nuevo[k] = sel.value; else delete nuevo[k];
            guardarHabilidad(id, Object.keys(nuevo).length ? { detalle: nuevo } : {}, Object.keys(nuevo).length ? [] : ['detalle']);
        });
        return el('div', {}, el('label', { for: sel.id, text: etiqueta }), sel);
    });
    caja.hidden = false;
    caja.dataset.id = id;
    caja.replaceChildren(el('strong', { text: `Editar ${h.nombre}` }),
        el('div', { class: 'dpc-det4' }, el('div', {}, el('label', { for: general.id, text: 'Nivel general' }), general), campos),
        el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Listo', onclick: () => { caja.hidden = true; caja.replaceChildren(); } }));
    general.focus();
}

function pintarPersonales() {
    const cont = $('[data-personales]'); if (!cont) return;
    const sel = cv.habilidades.filter((h) => h.categoria === 'personal' && String(h.nombre || '').trim());
    const firma = sel.map((h) => `${h.id}|${h.nombre}`).join('~');
    const cuenta = $('[data-cuenta-personales]');
    if (cuenta) cuenta.textContent = `${sel.length} de ${C.MAX_PERSONALES} seleccionadas`;
    if (cont.dataset.firma === firma) return;
    cont.dataset.firma = firma;
    const enLista = (p) => sel.find((h) => h.nombre.trim().toLowerCase() === p.toLowerCase());
    const pastilla = (texto, h, nombre) => el('button', { type: 'button', class: `dpc-op${h ? ' on' : ''}`, 'aria-pressed': h ? 'true' : 'false', text: texto,
        onclick: () => { if (h) { D.quitarElemento('habilidad', h.id); refrescarMemoria(); pintarChips(); const e = $('[data-err-personal]'); if (e) e.hidden = true; } else agregarPersonal(nombre); } });
    cont.replaceChildren(
        ...C.HABILIDADES_PERSONALES.map((p) => pastilla(p, enLista(p), p)),
        ...sel.filter((h) => !C.HABILIDADES_PERSONALES.some((p) => p.toLowerCase() === h.nombre.trim().toLowerCase())).map((h) => pastilla(`${h.nombre} ×`, h, h.nombre)));
}

function pintarChips() {
    for (const cont of $$('[data-chips]')) {
        const cat = cont.dataset.chips;
        const lista = cv.habilidades.filter((h) => h.categoria === cat);
        const firma = lista.map((h) => `${h.id}|${h.nombre}|${h.nivel || ''}|${JSON.stringify(h.detalle || '')}`).join('~');
        if (cont.dataset.firma === firma) continue;
        cont.dataset.firma = firma;
        cont.replaceChildren(...lista.map((h) => (cat === 'idioma' ? chipIdioma(h) : chipNivel(h))));
    }
    for (const caja of $$('[data-sugerencias]')) {
        const cat = caja.dataset.sugerencias;
        const ej = ejemplosHabilidades()[cat === 'tecnica' ? 'tec' : 'her'] || [];
        const quedan = ej.filter((x) => !yaExiste(cat, x));
        const firma = quedan.join('|');
        if (caja.dataset.firma === firma) continue;
        caja.dataset.firma = firma;
        caja.replaceChildren(...quedan.map((x) => el('button', { type: 'button', class: 'dp-chip dpc-sug', text: `+ ${x}`, onclick: () => caja._agregar(x) })));
    }
    pintarPersonales();
}

// ───────────── revisión con semáforo ─────────────
const ROTULO_ESTADO = { rojo: 'Rojo', ambar: 'Ámbar', verde: 'Verde', gris: 'Gris' };
const PASO_DE_SECCION = { datos: 0, formacion: 1, proyectos: 2, habilidades: 3, logros: 4, experiencia: 5 };

function pasoRevision() {
    const cont = el('div', { class: 'dp-revision', 'data-revision': '' });
    pintarRevision(cont);
    return cont;
}

function pintarRevision(cont) {
    const r = evaluarCV(cv);
    cont.replaceChildren(
        el('div', { class: 'dp-leyenda' }, C.LEYENDA.map((l) => el('span', { class: 'dp-leyenda-item' }, el('span', { class: `dp-punto dp-${l.estado}` }), el('b', { text: l.nombre + ': ' }), l.texto))),
        ...r.secciones.map((s) => el('div', { class: `dp-fila dp-fila-${s.estado}` },
            el('span', { class: `dp-punto dp-${s.estado}`, 'aria-hidden': 'true' }),
            el('div', { class: 'dp-fila-texto' }, el('strong', {}, s.nombre, el('span', { class: 'dp-solo-lector', text: ` (${ROTULO_ESTADO[s.estado]})` })), el('span', { text: s.mensaje })),
            el('button', { type: 'button', class: 'dp-btn-texto', text: 'Ir al paso', onclick: () => irAPaso(PASO_DE_SECCION[s.id]) }))),
        el('div', { class: 'dp-aviso' }, el('strong', { text: C.AVISO_SEMAFORO_TITULO + '. ' }), C.AVISO_SEMAFORO),
        el('p', { class: 'dp-suave', text: C.NOTA_DESCARGA }),
        el('div', { class: 'dp-acciones' },
            el('button', { type: 'button', class: 'dp-btn', text: 'Ver mi CV', onclick: () => abrirPrevia() }),
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: 'Imprimir o guardar PDF', onclick: imprimir })),
        el('div', { class: 'dpc-tip' }, el('b', { text: '💡 Consejo profesional:' }), ' ' + C.CONSEJO_PROFESIONAL));
}

// ───────────── hoja A4: vista previa lateral, vista previa grande, medición e impresión ─────────────
function pintarHojas() {
    const html = htmlCV(cv);
    $$('.dp-a4-in').forEach((n) => { if (!n.closest('#dpHojaImpresion')) n.innerHTML = html; });
    escalar();
    medirAjuste();
}

function escalar() {
    for (const wrap of $$('.dp-a4-wrap')) {
        const a4 = $('.dp-a4', wrap);
        if (!a4 || !wrap.clientWidth) continue;
        const s = wrap.clientWidth / a4.offsetWidth;
        a4.style.transform = `scale(${s})`;
        wrap.style.height = `${Math.ceil(a4.offsetHeight * s)}px`;
    }
}

let ajusteActual = { pct: 0, cabe: true };
function medirAjuste() {
    const medida = $('#dpMedida'); const sonda = $('#dpSonda');
    if (!medida || !sonda) return;
    $('.dp-a4-in', medida).innerHTML = htmlCV(cv);
    const disponible = sonda.offsetHeight;                      // 261 mm de alto útil (A4 menos márgenes) en píxeles
    const usado = $('.dp-a4-in', medida).offsetHeight;
    const pct = disponible ? Math.round((usado / disponible) * 100) : 0;
    ajusteActual = { pct, cabe: pct <= 100 };
    // Mientras cabe en una hoja no se muestra nada (un % bajo desanima a quien recién empieza); solo se avisa si se pasa.
    $$('[data-ajuste]').forEach((n) => {
        n.className = ajusteActual.cabe ? '' : 'dp-ajuste dp-ajuste-largo';
        n.replaceChildren(...(ajusteActual.cabe ? [] : [el('strong', { text: '💡 Revisa la extensión: ' }),
            'Tu CV supera una página. Revisa si puedes resumir algunas descripciones o eliminar información secundaria. Recuerda que dos páginas también son aceptables si el contenido lo justifica.']));
    });
}

function imprimir() {
    flushTodo();
    cv = D.leerCV();
    $('#dpHojaImpresion').innerHTML = `<div class="dp-a4 dp-impresion"><div class="dp-a4-in">${htmlCV(cv)}</div></div>`;
    window.print();
}
window.addEventListener('afterprint', () => { const h = $('#dpHojaImpresion'); if (h) h.innerHTML = ''; });

// ───────────── pasos, estructura y navegación ─────────────
function dibujarPasos() {
    const r = evaluarCV(cv);
    const estado = Object.fromEntries(r.secciones.map((s) => [s.id, s.estado]));
    $('#dpPasos').replaceChildren(...C.PASOS.map((p, i) => el('button', {
        type: 'button', class: `dp-paso${i === paso ? ' dp-paso-activo' : ''}`, 'aria-current': i === paso ? 'step' : null, onclick: () => irAPaso(i),
    }, el('span', { class: `dp-punto dp-${SECCION_DE_PASO[p.id] ? estado[SECCION_DE_PASO[p.id]] : 'rev'}` }), el('span', { class: 'dp-paso-n', text: String(i + 1) }), el('span', { class: 'dp-paso-t', text: p.titulo }))));
    pintarAvance(estado);
}

// Barra de avance del panel: un segmento por paso (verde = listo, naranja = el paso actual) y el mensaje de "completado" solo si es verdad.
function pintarAvance(estado) {
    const idActual = C.PASOS[paso].id;
    $$('.dpc-seg i').forEach((seg, i) => {
        const sec = SECCION_DE_PASO[C.PASOS[i].id];
        seg.className = `${i === paso ? 'act' : ''} ${sec && estado[sec] === 'verde' ? 'ok' : ''}`.trim();
    });
    const listo = $('[data-listo]');
    if (!listo) return;
    const msg = SECCION_DE_PASO[idActual] && estado[SECCION_DE_PASO[idActual]] === 'verde' ? C.COMPLETADO[idActual] : '';
    listo.hidden = !msg;
    listo.textContent = msg ? `✓ ${msg}` : '';
}

function dibujarPaso() {
    const p = C.PASOS[paso];
    const cuerpo = { datos: pasoDatos, formacion: pasoFormacion, proyectos: pasoProyectos, habilidades: pasoHabilidades, logros: pasoLogros, experiencia: pasoExperiencia, revision: pasoRevision }[p.id]();
    const nav = el('div', { class: 'dp-nav' },
        paso > 0 ? el('button', { type: 'button', class: 'dp-btn', text: 'Anterior', onclick: () => irAPaso(paso - 1) }) : null,
        paso < C.PASOS.length - 1 ? el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: paso === C.PASOS.length - 2 ? 'Revisar con el semáforo' : 'Siguiente', onclick: () => irAPaso(paso + 1) }) : null,
        el('button', { type: 'button', class: 'dp-btn dp-solo-cel', text: 'Ver vista previa', onclick: () => abrirPrevia() }));
    $('#dpPanel').replaceChildren(
        el('div', { class: 'dpc-avance' },
            el('div', { class: 'dpc-seg', 'aria-hidden': 'true' }, ...C.PASOS.map(() => el('i'))),
            el('span', { text: `Paso ${paso + 1} de ${C.PASOS.length} · ${C.ETAPAS[p.id] || ''}` })),
        el('h2', { class: 'dp-paso-titulo' }, `${paso + 1}. ${p.titulo}`),
        el('p', { class: 'dp-suave', text: p.porQue }),
        el('div', { class: 'dpc-listo', 'data-listo': '', hidden: true, role: 'status' }),
        cuerpo,
        ...(p.consejo ? [el('div', { class: 'dp-consejo' }, el('strong', { text: 'Consejo: ' }), p.consejo)] : []),
        nav);
    dibujarPasos();
    pintarHojas();
}

function irAPaso(i) {
    flushTodo();
    paso = Math.max(0, Math.min(C.PASOS.length - 1, i));
    modo = 'constructor';
    history.replaceState(null, '', '#' + C.PASOS[paso].id);
    mostrarModo();
    dibujarPaso();
    const h = $('#dpPanel .dp-paso-titulo'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    window.scrollTo({ top: $('#dpApp').offsetTop - 80, behavior: 'smooth' });
}

function abrirPrevia() {
    flushTodo(); cv = D.leerCV();
    modo = 'previa'; history.replaceState(null, '', '#previa');
    mostrarModo(); pintarHojas();
    window.scrollTo({ top: $('#dpApp').offsetTop - 80, behavior: 'smooth' });
}

function mostrarModo() {
    $('#dpConstructor').hidden = modo !== 'constructor';
    $('#dpPrevia').hidden = modo !== 'previa';
    escalar();
}

// ───────────── cambios de datos: propios y de otros dispositivos ─────────────
function refrescarMemoria() {
    cv = D.leerCV();
    clearTimeout(refrescarMemoria.t);
    refrescarMemoria.t = setTimeout(() => { dibujarPasos(); pintarHojas(); const r = $('[data-revision]'); if (r) pintarRevision(r); }, 120);
}

// Llega algo de otro dispositivo: se actualiza lo que se ve SIN reconstruir el formulario.
function conciliar() {
    const id = C.PASOS[paso].id;
    if (id === 'datos' || id === 'formacion') sincronizarCampos($('#dpPanel'));
    else if (TIPO_DE_PASO[id]) { reconciliarLista(TIPO_DE_PASO[id]); if (id === 'experiencia') sincronizarCampos($('#dpPanel')); }
    else if (id === 'habilidades') pintarChips();
    else if (id === 'revision') { const r = $('[data-revision]'); if (r) pintarRevision(r); }
}

// ───────────── arranque ─────────────
function armar() {
    $('#dpApp').replaceChildren(
        el('nav', { id: 'dpPasos', class: 'dp-pasos', 'aria-label': 'Pasos del CV' }),
        el('div', { id: 'dpConstructor', class: 'dp-constructor' },
            el('section', { id: 'dpPanel', class: 'dp-panel' }),
            el('aside', { class: 'dp-lateral', 'aria-label': 'Vista previa de tu CV' },
                el('div', { class: 'dpc-pega', 'aria-hidden': 'true', text: 'TU PERFIL, LISTO PARA MOSTRAR' }),
                el('div', { class: 'dp-lateral-cab' }, el('strong', { text: 'Vista previa' }), el('span', { class: 'dp-suave', text: ' · hoja A4' })),
                el('div', { class: 'dp-a4-wrap' }, el('div', { class: 'dp-a4' }, el('div', { class: 'dp-a4-in' }))),
                el('p', { 'data-ajuste': '' }),
                el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Ver más grande', onclick: () => abrirPrevia() }))),
        el('div', { id: 'dpPrevia', class: 'dp-previa', hidden: true },
            el('div', { class: 'dp-previa-barra' },
                el('button', { type: 'button', class: 'dp-btn', text: '← Volver al constructor', onclick: () => irAPaso(paso) }),
                el('span', { 'data-ajuste': '' }),
                el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: 'Imprimir o guardar PDF', onclick: imprimir })),
            el('div', { class: 'dp-a4-wrap dp-a4-grande' }, el('div', { class: 'dp-a4' }, el('div', { class: 'dp-a4-in' }))),
            el('p', { class: 'dp-suave', text: C.AYUDA_IMPRESION }),
            el('p', { class: 'dp-suave', text: C.NOTA_ATS })),
        // Medición de la página (fuera de pantalla): cuánto ocupa el CV frente al alto útil de un A4.
        el('div', { id: 'dpMedida', class: 'dp-medida', 'aria-hidden': 'true' }, el('div', { class: 'dp-a4' }, el('div', { class: 'dp-a4-in' })), el('div', { id: 'dpSonda', class: 'dp-sonda' })));
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => escalar()); $$('.dp-a4-wrap').forEach((w) => ro.observe(w)); }
    window.addEventListener('resize', escalar);
}

function leerHash() {
    const h = location.hash.replace('#', '');
    if (h === 'previa') { modo = 'previa'; return; }
    const i = C.PASOS.findIndex((p) => p.id === h);
    if (i >= 0) paso = i;
}

async function iniciar() {
    if (!(await accesoPermitido())) return;
    const app = $('#dpApp');
    app.replaceChildren(el('p', { class: 'dp-cargando', text: 'Cargando tu CV…' }));
    const listo = await Promise.race([SigaEstado.listo.then(() => true), new Promise((r) => setTimeout(() => r(false), 10000))]);
    if (!listo) {
        app.replaceChildren(el('div', { class: 'dp-panel' }, el('p', { text: 'No pudimos cargar tu cuenta. Revisa tu conexión e inténtalo de nuevo.' }),
            el('button', { type: 'button', class: 'dp-btn dp-btn-primario', text: 'Reintentar', onclick: () => location.reload() })));
        return;
    }
    cv = D.leerCV();
    armar(); leerHash(); mostrarModo(); dibujarPaso();
    if (modo === 'previa') abrirPrevia();

    D.alCambiar(() => { cv = D.leerCV(); conciliar(); dibujarPasos(); pintarHojas(); });
    D.alConflicto((ev) => {
        toast({
            id: 'conflicto', texto: C.AVISO_CONFLICTO,
            boton: ev.tieneMia ? 'Recuperar la mía' : null,
            alBoton: () => { D.recuperarMia(ev.clave); refrescarMemoria(); conciliar(); },
        });
    });

    // Si guardar falla de forma sostenida, se avisa; si todo va bien, nunca se muestra nada.
    let fallos = 0;
    setInterval(() => {
        if (D.estadoSync() === 'error') { fallos += 1; if (fallos >= 2) toast({ id: 'error', texto: C.AVISO_ERROR_GUARDADO, persistente: true }); }
        else { fallos = 0; quitarToast('error'); }
    }, 5000);

    const subir = () => { flushTodo(); D.sincronizar(); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') subir(); });
    window.addEventListener('pagehide', subir);
}

iniciar();
