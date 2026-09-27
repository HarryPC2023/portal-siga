// js/carnet-siga.js
// ------------------------------------------------------------
// Componente compartido del CARNET SIGA y de las TARJETAS DE PIEZA.
// Lo usan Mi cuenta (perfil.html) y el dashboard: una sola pieza
// de código para que ambos se vean y se comporten igual.
//
// Piezas del carnet (en este orden se preguntan):
//   codigo  -> perfiles_usuario.codigo_estudiante
//   nombre  -> perfiles_usuario.nombre   ("¿Cómo prefieres que te llamemos?")
//   carrera -> perfiles_usuario.carrera (id, ej. "sistemas") + facultad (sigla)
//
// El periodo de ingreso NO es pieza: sale del código (5.º dígito
// 0 = semestre -1, 1 = semestre -2; otras modalidades = solo el año).
// La foto tampoco cuenta para completar el carnet.
// ------------------------------------------------------------

import { supabase } from './auth-siga.js?v=9';
import { FACULTADES } from '../intranotas/facultades-datos.js';

export const PIEZAS = ['codigo', 'nombre', 'carrera'];
export const DIAS_ENTRE_PREGUNTAS = 2;

const COLUMNA_DE = { codigo: 'codigo_estudiante', nombre: 'nombre', carrera: 'carrera' };

const PREGUNTAS = {
    codigo: { etiqueta: 'Código UNI', pregunta: '¿Cuál es tu código UNI?', ejemplo: '20231059E' },
    nombre: { etiqueta: 'Cómo te llamamos', pregunta: '¿Cómo prefieres que te llamemos?', ejemplo: 'Harry' },
    carrera: { etiqueta: 'Carrera', pregunta: '¿Qué carrera estudias?' },
};

/* ---------- Datos y reglas (sin tocar el DOM) ---------- */

/** Busca una carrera por su id: { facultad, carrera } o null. */
export function buscarCarrera(idCarrera) {
    if (!idCarrera) return null;
    for (const facultad of FACULTADES) {
        const carrera = facultad.carreras.find((c) => c.id === idCarrera);
        if (carrera) return { facultad, carrera };
    }
    return null;
}

export function normalizarCodigo(texto) {
    return (texto || '').trim().toUpperCase();
}

export const ANIO_MINIMO_CODIGO = 2000; // igual que Intranotas

/** 8 números + 1 letra, y los 4 primeros = un año de ingreso posible. */
export function codigoValido(codigo) {
    if (!/^\d{8}[A-Z]$/.test(codigo)) return false;
    const anio = Number(codigo.slice(0, 4));
    return anio >= ANIO_MINIMO_CODIGO && anio <= new Date().getFullYear();
}

/** "20231059E" -> "2023-2" · "20230..." -> "2023-1" · otras modalidades -> "2023". */
export function periodoIngreso(codigo) {
    if (!codigo || !/^\d{5}/.test(codigo)) return null;
    const anio = codigo.slice(0, 4);
    const modalidad = codigo[4];
    if (modalidad === '0') return `${anio}-1`;
    if (modalidad === '1') return `${anio}-2`;
    return anio;
}

/** "20262" -> "2026-2" (formato en que Intranotas guarda periodo_actual). */
export function periodoLegible(periodo) {
    const p = String(periodo || '');
    return /^\d{5}$/.test(p) ? `${p.slice(0, 4)}-${p[4]}` : p || null;
}

/* ---------- Datos opcionales (no son piezas del carnet) ---------- */

/* Modalidades de ingreso UNI (lista inicial investigada por Harry, sep 2026).
   Se irá validando con lo que declaren los alumnos. */
export const MODALIDADES = [
    { id: 'ordinario', nombre: 'Ordinario' },
    { id: 'cepre', nombre: 'CEPRE-UNI' },
    { id: 'ien', nombre: 'Ingreso Escolar Nacional' },
    { id: 'dos-primeros', nombre: 'Dos Primeros Puestos' },
    { id: 'deportistas', nombre: 'Deportistas Calificados' },
    { id: 'traslado-externo', nombre: 'Traslado Externo' },
    { id: 'titulados', nombre: 'Titulados o Graduados' },
    { id: 'bachillerato', nombre: 'Bachillerato Internacional' },
    { id: 'convenios', nombre: 'Convenios y Programas Sociales (Beca 18)' },
    { id: 'otra', nombre: 'Otra' },
];

export function buscarModalidad(id) {
    return MODALIDADES.find((m) => m.id === id) || null;
}

/* Hipótesis del 5.º dígito del código, comprobadas por Harry:
   0 = Ordinario de febrero, 1 = Ordinario de agosto, 4 = CEPRE.
   Los demás dígitos aún no se conocen: no se sugiere nada. */
export function sugerirModalidad(codigo) {
    const d = (codigo || '')[4];
    if (d === '0' || d === '1') return 'ordinario';
    if (d === '4') return 'cepre';
    return null;
}

export function sugerirSemestre(codigo) {
    const d = (codigo || '')[4];
    if (d === '0') return 1;
    if (d === '1') return 2;
    return null;
}

/** Lo declarado por el alumno manda, si su año coincide con el del código. */
export function periodoMostrado(perfil) {
    const codigo = perfil?.codigo_estudiante;
    const declarado = perfil?.periodo_ingreso_declarado;
    if (declarado && codigo && declarado.slice(0, 4) === codigo.slice(0, 4)) return declarado;
    return periodoIngreso(codigo);
}

function valorDePieza(perfil, pieza) {
    return perfil ? perfil[COLUMNA_DE[pieza]] : null;
}

/** Piezas que faltan, en el orden en que se preguntan. */
export function piezasFaltantes(perfil) {
    return PIEZAS.filter((p) => !valorDePieza(perfil, p));
}

/** ¿Ya pasaron los días de espera desde la última pieza respondida? */
export function puedePreguntarHoy(perfil) {
    const ultima = perfil?.ultima_pieza_at;
    if (!ultima) return true;
    const dias = (Date.now() - new Date(ultima).getTime()) / 86400000;
    return dias >= DIAS_ENTRE_PREGUNTAS;
}

function iniciales(nombre) {
    return (nombre || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
}

/* Brillo relativo (WCAG) para decidir texto claro u oscuro sobre el degradado. */
function luminancia(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    const canal = (v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

/* ---------- Guardado ---------- */

/**
 * Guarda UNA pieza del carnet y marca ultima_pieza_at (ritmo de 2 días).
 * Devuelve { ok: true, cambios } o { ok: false, mensaje }.
 */
export async function guardarPieza(userId, pieza, valorCrudo) {
    const cambios = { user_id: userId, ultima_pieza_at: new Date().toISOString() };

    if (pieza === 'codigo') {
        const codigo = normalizarCodigo(valorCrudo);
        if (!codigoValido(codigo)) return { ok: false, mensaje: 'Revisa tu código: 8 números y una letra, empezando por tu año de ingreso (ej. 20231059E).' };
        cambios.codigo_estudiante = codigo;
    } else if (pieza === 'nombre') {
        const nombre = (valorCrudo || '').trim().replace(/\s+/g, ' ');
        if (nombre.length < 2) return { ok: false, mensaje: 'Escribe al menos 2 letras.' };
        if (nombre.length > 40) return { ok: false, mensaje: 'Máximo 40 caracteres.' };
        cambios.nombre = nombre;
    } else if (pieza === 'carrera') {
        const info = buscarCarrera(valorCrudo);
        if (!info) return { ok: false, mensaje: 'Elige tu carrera de la lista.' };
        cambios.carrera = info.carrera.id;
        cambios.facultad = info.facultad.sigla;
    } else {
        return { ok: false, mensaje: 'Pieza desconocida.' };
    }

    const { error } = await supabase.from('perfiles_usuario').upsert(cambios, { onConflict: 'user_id' });
    if (error) {
        console.error('Error guardando pieza del carnet:', error);
        const duplicado = error.code === '23505' || /duplicate/i.test(error.message || '');
        return {
            ok: false,
            mensaje: duplicado && pieza === 'codigo'
                ? 'Ese código ya está registrado con otra cuenta.'
                : 'No se pudo guardar. Intenta de nuevo.',
        };
    }
    return { ok: true, cambios };
}

/** Guarda un dato opcional (periodo declarado, modalidad, foto…) SIN
    tocar ultima_pieza_at: no son piezas del carnet ni marcan el ritmo. */
export async function guardarDato(userId, columna, valor) {
    const { error } = await supabase
        .from('perfiles_usuario')
        .upsert({ user_id: userId, [columna]: valor }, { onConflict: 'user_id' });
    if (error) {
        console.error(`Error guardando ${columna}:`, error);
        return { ok: false, mensaje: 'No se pudo guardar. Intenta de nuevo.' };
    }
    return { ok: true, cambios: { [columna]: valor } };
}

/* ---------- Carnet ---------- */

function el(tag, clase, texto) {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto != null) nodo.textContent = texto; // textContent: nunca HTML del usuario
    return nodo;
}

function hueco(ancho) {
    const h = el('span', 'carnet-hueco');
    h.style.width = ancho;
    return h;
}

/**
 * Pinta (o repinta) el carnet dentro de `contenedor`.
 * opciones.fotoUrl: URL ya resuelta de la foto (opcional).
 */
export function pintarCarnet(contenedor, perfil, opciones = {}) {
    const codigo = valorDePieza(perfil, 'codigo');
    const nombre = valorDePieza(perfil, 'nombre');
    const info = buscarCarrera(valorDePieza(perfil, 'carrera'));
    const faltan = piezasFaltantes(perfil).length;

    const carnet = el('div', 'carnet-siga');
    if (faltan === PIEZAS.length) {
        carnet.classList.add('fase-inicial');
    } else if (info) {
        const [g1, g2] = info.facultad.degradado || [info.facultad.color, info.facultad.color];
        carnet.classList.add(faltan === 0 ? 'fase-completa' : 'fase-intermedia');
        carnet.style.setProperty('--carnet-g1', g1);
        carnet.style.setProperty('--carnet-g2', g2);
        if ((luminancia(g1) + luminancia(g2)) / 2 > 0.45) carnet.classList.add('texto-oscuro');
    } else {
        carnet.classList.add('fase-intermedia');
    }

    carnet.setAttribute('role', 'img');
    carnet.setAttribute('aria-label', [
        'Carnet SIGA',
        nombre, codigo, info?.carrera.nombre,
        `${PIEZAS.length - faltan} de ${PIEZAS.length} piezas`,
    ].filter(Boolean).join(', '));

    carnet.append(el('span', 'carnet-marca', info ? info.facultad.sigla : 'SIGA'));

    const cabecera = el('div', 'carnet-cabecera');
    const logo = el('span', 'carnet-logo');
    logo.append(el('span', 'carnet-logo-siga', 'SIGA'), el('span', 'carnet-logo-uni', 'UNI'));
    cabecera.append(logo, info ? el('span', 'carnet-sigla', info.facultad.sigla) : hueco('44px'));

    const centro = el('div', 'carnet-centro');
    const foto = el('div', 'carnet-foto');
    if (opciones.fotoUrl) {
        const img = el('img');
        img.src = opciones.fotoUrl;
        img.alt = '';
        foto.append(img);
    } else {
        foto.textContent = iniciales(nombre) || '?';
    }
    const datos = el('div', 'carnet-datos');
    datos.append(nombre ? el('div', 'carnet-nombre', nombre) : hueco('120px'));
    const ingreso = periodoMostrado(perfil);
    if (ingreso) datos.append(el('div', 'carnet-ingreso', `Ingreso ${ingreso}`));
    centro.append(foto, datos);

    const pie = el('div', 'carnet-pie');
    pie.append(
        codigo ? el('span', 'carnet-codigo', codigo) : hueco('96px'),
        info ? el('span', 'carnet-carrera', info.carrera.corto || info.carrera.nombre) : hueco('70px'),
    );

    carnet.append(cabecera, centro, pie);
    contenedor.replaceChildren(carnet);
    return carnet;
}

/* ---------- Controles de edición ---------- */
/* Todo control devuelve { el, valor(), foco() } para que la tarjeta
   de edición no tenga que saber de qué tipo es. */

function normalizarBusqueda(texto) {
    return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function crearCampoTexto(pieza, valorActual) {
    const input = el('input', 'tarjeta-pieza-campo');
    input.type = 'text';
    input.value = valorActual || '';
    input.placeholder = PREGUNTAS[pieza].ejemplo;
    input.autocomplete = 'off';
    input.spellcheck = false;
    if (pieza === 'codigo') {
        input.maxLength = 9;
        input.classList.add('es-codigo');
    } else {
        input.maxLength = 40;
    }
    return { el: input, valor: () => input.value, foco: () => input.focus() };
}

/**
 * Lista de opciones propia (no <select>): filas alternadas lila/blanco,
 * cabeceras de grupo opcionales con su degradado y buscador opcional.
 *   opciones: [{ valor, texto, grupo? }]
 *   grupos:   [{ id, titulo, sub, degradado }]  (opcional)
 *   sugerido: valor a marcar como "Sugerido por tu código"
 */
function crearSelectorLista({ opciones, grupos = null, valorActual = null, buscador = false, placeholder = 'Buscar', sugerido = null, alCambiar }) {
    let seleccionado = valorActual || null;

    const caja = el('div', 'selector-lista');
    let inputBusqueda = null;
    if (buscador) {
        const barra = el('label', 'selector-lista-buscar');
        barra.insertAdjacentHTML('beforeend', '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>');
        inputBusqueda = el('input');
        inputBusqueda.type = 'search';
        inputBusqueda.placeholder = placeholder;
        inputBusqueda.autocomplete = 'off';
        inputBusqueda.setAttribute('aria-label', placeholder);
        barra.append(inputBusqueda);
        caja.append(barra);
    }

    const lista = el('div', 'selector-lista-opciones');
    lista.setAttribute('role', 'listbox');
    caja.append(lista);

    function pintar() {
        const filtro = normalizarBusqueda(inputBusqueda?.value);
        const nodos = [];
        const bloques = grupos
            ? grupos.map((g) => ({ g, items: opciones.filter((o) => o.grupo === g.id) }))
            : [{ g: null, items: opciones }];

        for (const { g, items } of bloques) {
            const visibles = items.filter((o) => !filtro
                || normalizarBusqueda(`${o.texto} ${g ? `${g.id} ${g.titulo} ${g.sub || ''}` : ''}`).includes(filtro));
            if (!visibles.length) continue;

            if (g) {
                const cab = el('div', 'selector-lista-grupo');
                const pill = el('span', 'selector-lista-grupo-sigla', g.titulo);
                if (g.degradado) pill.style.background = `linear-gradient(135deg, ${g.degradado[0]}, ${g.degradado[1]})`;
                if (g.textoOscuro) pill.style.color = '#2A1600';
                cab.append(pill, el('span', 'selector-lista-grupo-nombre', g.sub || ''));
                nodos.push(cab);
            }

            visibles.forEach((o) => {
                const fila = el('button', 'selector-lista-opcion');
                fila.type = 'button';
                fila.setAttribute('role', 'option');
                fila.dataset.valor = o.valor;
                const activo = o.valor === seleccionado;
                fila.setAttribute('aria-selected', activo ? 'true' : 'false');
                if (activo) fila.classList.add('activa');
                fila.append(el('span', 'selector-lista-texto', o.texto));
                if (o.valor === sugerido) fila.append(el('span', 'insignia-sugerido', 'Sugerido'));
                if (activo) fila.insertAdjacentHTML('beforeend', '<svg class="selector-lista-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>');
                fila.addEventListener('click', () => {
                    seleccionado = o.valor;
                    pintar();
                    alCambiar?.(seleccionado);
                    lista.querySelector(`[data-valor="${CSS.escape(o.valor)}"]`)?.focus();
                });
                nodos.push(fila);
            });
        }

        if (!nodos.length) nodos.push(el('div', 'selector-lista-vacio', 'No encontramos esa opción'));
        lista.replaceChildren(...nodos);
    }

    // Flechas arriba/abajo para moverse entre opciones.
    caja.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        const filas = [...lista.querySelectorAll('.selector-lista-opcion')];
        if (!filas.length) return;
        e.preventDefault();
        const i = filas.indexOf(document.activeElement);
        const siguiente = e.key === 'ArrowDown'
            ? filas[Math.min(i + 1, filas.length - 1)]
            : (i <= 0 ? (inputBusqueda || filas[0]) : filas[i - 1]);
        siguiente.focus();
    });

    inputBusqueda?.addEventListener('input', pintar);
    pintar();

    // Deja visible la opción ya elegida (solo dentro de la lista,
    // sin mover la página). La lista es position:relative en el CSS.
    setTimeout(() => {
        const activa = lista.querySelector('.activa');
        if (activa) lista.scrollTop = Math.max(0, activa.offsetTop - 44);
    }, 0);

    return {
        el: caja,
        valor: () => seleccionado || '',
        foco: () => (inputBusqueda || lista.querySelector('.activa') || lista.querySelector('.selector-lista-opcion'))?.focus(),
    };
}

/** Selector de carrera: agrupado por facultad (con su degradado) y con buscador. */
export function crearSelectorCarrera(valorActual, alCambiar) {
    const grupos = FACULTADES.map((f) => ({
        id: f.sigla,
        titulo: f.sigla,
        sub: f.nombre,
        degradado: f.degradado,
        textoOscuro: f.degradado && (luminancia(f.degradado[0]) + luminancia(f.degradado[1])) / 2 > 0.45,
    }));
    const opciones = FACULTADES.flatMap((f) => f.carreras.map((c) => ({ valor: c.id, texto: c.nombre, grupo: f.sigla })));
    return crearSelectorLista({ opciones, grupos, valorActual, buscador: true, placeholder: 'Busca tu carrera', alCambiar });
}

/** Selector de modalidad de ingreso (lista simple, con sugerencia). */
export function crearSelectorModalidad(valorActual, codigo) {
    return crearSelectorLista({
        opciones: MODALIDADES.map((m) => ({ valor: m.id, texto: m.nombre })),
        valorActual,
        sugerido: sugerirModalidad(codigo),
    });
}

/** Dos chips para el semestre de ingreso; el año sale del código. */
export function crearChipsSemestre(codigo, valorActual) {
    const anio = codigo.slice(0, 4);
    const sugerido = sugerirSemestre(codigo);
    let seleccionado = valorActual && valorActual.startsWith(anio) ? valorActual : null;

    const caja = el('div', 'chips-semestre');
    caja.setAttribute('role', 'radiogroup');
    const opciones = [
        { valor: `${anio}-1`, texto: `${anio}-1`, sub: 'Febrero', n: 1 },
        { valor: `${anio}-2`, texto: `${anio}-2`, sub: 'Agosto', n: 2 },
    ];

    function pintar() {
        caja.replaceChildren(...opciones.map((o) => {
            const chip = el('button', 'chip-semestre');
            chip.type = 'button';
            chip.setAttribute('role', 'radio');
            const activo = o.valor === seleccionado;
            chip.setAttribute('aria-checked', activo ? 'true' : 'false');
            if (activo) chip.classList.add('activa');
            chip.append(el('span', 'chip-semestre-valor', o.texto), el('span', 'chip-semestre-sub', o.sub));
            if (o.n === sugerido) chip.append(el('span', 'insignia-sugerido', 'Sugerido'));
            chip.addEventListener('click', () => { seleccionado = o.valor; pintar(); caja.querySelector('.activa')?.focus(); });
            return chip;
        }));
    }
    pintar();

    return { el: caja, valor: () => seleccionado || '', foco: () => caja.querySelector('button')?.focus() };
}

/* ---------- Tarjeta de edición (genérica) ---------- */

/**
 * opciones:
 *   etiqueta, pregunta, control ({ el, valor(), foco() }), nota?
 *   textoCancelar – "Ahora no" (dashboard) o "Cancelar" (Mi cuenta)
 *   guardar(valor) – async → { ok, mensaje?, cambios? }
 *   alGuardar(cambios), alCancelar()
 */
export function crearTarjetaEdicion(opciones) {
    const tarjeta = el('form', 'tarjeta-pieza tarjeta-pieza-editando');
    tarjeta.noValidate = true;

    const cabeza = el('div', 'tarjeta-pieza-etiqueta', opciones.etiqueta);
    const titulo = el('div', 'tarjeta-pieza-pregunta', opciones.pregunta);
    const nota = el('div', 'tarjeta-pieza-nota', opciones.nota || '');
    const error = el('div', 'tarjeta-pieza-error');
    error.setAttribute('role', 'alert');

    const acciones = el('div', 'tarjeta-pieza-acciones');
    const btnCancelar = el('button', 'tarjeta-pieza-btn secundario', opciones.textoCancelar || 'Cancelar');
    btnCancelar.type = 'button';
    const btnGuardar = el('button', 'tarjeta-pieza-btn principal', 'Guardar');
    btnGuardar.type = 'submit';
    acciones.append(btnCancelar, btnGuardar);

    btnCancelar.addEventListener('click', () => opciones.alCancelar?.());
    tarjeta.addEventListener('input', () => { error.textContent = ''; });
    tarjeta.addEventListener('click', () => { error.textContent = ''; });

    tarjeta.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando…';
        const resultado = await opciones.guardar(opciones.control.valor());
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
        if (!resultado?.ok) {
            error.textContent = resultado?.mensaje || 'No se pudo guardar.';
            opciones.control.foco();
            return;
        }
        opciones.alGuardar?.(resultado.cambios);
    });

    tarjeta.append(cabeza, titulo, opciones.control.el, nota, error, acciones);
    setTimeout(() => opciones.control.foco(), 0);
    return tarjeta;
}

/**
 * Tarjeta que pregunta (o edita) UNA pieza del carnet.
 * opciones: valorActual, textoCancelar, guardar(pieza, valor), alGuardar, alCancelar
 */
export function crearTarjetaPregunta(pieza, opciones = {}) {
    const def = PREGUNTAS[pieza];
    let nota = '';
    let control;
    if (pieza === 'carrera') {
        const notaEl = { actualizar: null };
        control = crearSelectorCarrera(opciones.valorActual, (id) => notaEl.actualizar?.(id));
        const tarjeta = crearTarjetaEdicion({
            etiqueta: def.etiqueta,
            pregunta: def.pregunta,
            control,
            nota: facultadDe(opciones.valorActual),
            textoCancelar: opciones.textoCancelar,
            guardar: (valor) => opciones.guardar(pieza, valor),
            alGuardar: opciones.alGuardar,
            alCancelar: opciones.alCancelar,
        });
        const notaNodo = tarjeta.querySelector('.tarjeta-pieza-nota');
        notaEl.actualizar = (id) => { notaNodo.textContent = facultadDe(id); };
        return tarjeta;
    }

    control = crearCampoTexto(pieza, opciones.valorActual);
    if (pieza === 'codigo') nota = 'Lo encuentras en tu carnet universitario o en INTRALU.';
    return crearTarjetaEdicion({
        etiqueta: def.etiqueta,
        pregunta: def.pregunta,
        control,
        nota,
        textoCancelar: opciones.textoCancelar,
        guardar: (valor) => opciones.guardar(pieza, valor),
        alGuardar: opciones.alGuardar,
        alCancelar: opciones.alCancelar,
    });
}

function facultadDe(idCarrera) {
    const info = buscarCarrera(idCarrera);
    return info ? `Facultad: ${info.facultad.nombre}` : '';
}