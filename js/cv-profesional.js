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
const CAMPOS_TARJETA = {
    proyecto: (clave) => [
        campo({ clave, nombre: 'nombre', etiqueta: 'Nombre del proyecto', placeholder: C.EJEMPLO_PROYECTO.nombre }),
        campo({ clave, nombre: 'queHiciste', etiqueta: '¿Qué hiciste?', placeholder: C.EJEMPLO_PROYECTO.queHiciste, area: true }),
        campo({ clave, nombre: 'herramientas', etiqueta: 'Herramientas utilizadas', placeholder: C.EJEMPLO_PROYECTO.herramientas }),
        campo({ clave, nombre: 'evidencia', etiqueta: 'Resultado o evidencia', opcional: true, placeholder: 'Un repositorio, una presentación, una demostración, un documento o un resultado', area: true }),
    ],
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
        el('p', { class: 'dp-suave', text: 'No todos los proyectos son sistemas informáticos. También cuentan:' }),
        el('div', {}, C.QUE_CUENTA_COMO_PROYECTO.map((t) => el('span', { class: 'dp-chip dp-chip-lila', text: t }))),
        el('p', { class: 'dp-suave', text: 'Empieza describiendo tu participación con verbos como:' }),
        el('div', {}, C.VERBOS.map((t) => el('span', { class: 'dp-chip dp-chip-azul', text: t }))));
    return el('div', {}, bloqueLista('proyecto', {
        vacio: 'Todavía no agregaste ningún proyecto. Un trabajo final de un curso es un buen comienzo.',
        botonTexto: '+ Añadir proyecto', base: { nombre: '', queHiciste: '', herramientas: '', evidencia: '', origen: 'manual' },
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

// Habilidades: cada una es un elemento independiente (chip).
function pasoHabilidades() {
    const grupos = Object.entries(C.HABILIDADES).map(([cat, info]) => {
        const chips = el('div', { class: 'dp-chips', 'data-chips': cat });
        const entrada = el('input', { type: 'text', placeholder: `Ejemplo: ${info.ejemplos.split(',')[0]}`, 'aria-label': `Agregar a ${info.titulo}`, autocomplete: 'off', class: 'dp-entrada-chip' });
        const nivel = cat === 'idioma' ? el('select', { 'aria-label': 'Nivel' }, C.NIVELES.map((n) => el('option', { value: n, text: n, selected: n === 'Intermedio' }))) : null;
        const error = el('small', { class: 'dp-error', role: 'alert', hidden: true });
        const agregar = () => {
            const nombre = entrada.value.trim();
            if (!nombre) { error.textContent = 'Escribe una habilidad antes de agregarla.'; error.hidden = false; return; }
            if (cv.habilidades.some((h) => h.categoria === cat && h.nombre.trim().toLowerCase() === nombre.toLowerCase())) { error.textContent = 'Ya la agregaste.'; error.hidden = false; return; }
            error.hidden = true;
            D.nuevoElemento('habilidad', { categoria: cat, nombre, ...(nivel ? { nivel: nivel.value } : {}) });
            entrada.value = '';
            refrescarMemoria(); pintarChips();
            entrada.focus();
        };
        entrada.addEventListener('input', () => { error.hidden = true; });
        entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } });
        return el('div', { class: 'dp-grupo' },
            el('h3', { text: info.titulo }), el('small', { class: 'dp-ayuda', text: `Por ejemplo: ${info.ejemplos}` }), chips,
            el('div', { class: 'dp-agregar' }, entrada, nivel, el('button', { type: 'button', class: 'dp-btn dp-btn-chico', text: 'Agregar', onclick: agregar })), error);
    });
    queueMicrotask(pintarChips);
    return el('div', {}, grupos);
}

function pintarChips() {
    for (const cont of $$('[data-chips]')) {
        const cat = cont.dataset.chips;
        const lista = cv.habilidades.filter((h) => h.categoria === cat);
        const firma = lista.map((h) => `${h.id}|${h.nombre}|${h.nivel || ''}`).join('~');
        if (cont.dataset.firma === firma) continue;
        cont.dataset.firma = firma;
        cont.replaceChildren(...lista.map((h) => el('span', { class: 'dp-chip dp-chip-hab' },
            h.nombre + (h.nivel ? ` · ${h.nivel}` : ''),
            el('button', { type: 'button', class: 'dp-chip-x', 'aria-label': `Quitar ${h.nombre}`, text: '×', onclick: () => { D.quitarElemento('habilidad', h.id); refrescarMemoria(); pintarChips(); } }))));
    }
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
