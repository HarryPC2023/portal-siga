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

export function codigoValido(codigo) {
    return /^\d{8}[A-Z]$/.test(codigo);
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
        if (!codigoValido(codigo)) return { ok: false, mensaje: 'Son 8 números y una letra, como 20231059E.' };
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
    const ingreso = periodoIngreso(codigo);
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

/* ---------- Tarjeta de pieza (pregunta / edición) ---------- */

function campoPara(pieza, valorActual) {
    if (pieza === 'carrera') {
        const select = el('select', 'tarjeta-pieza-campo');
        select.append(new Option('Elige tu carrera', ''));
        for (const facultad of FACULTADES) {
            const grupo = document.createElement('optgroup');
            grupo.label = facultad.sigla;
            for (const carrera of facultad.carreras) {
                grupo.append(new Option(carrera.nombre, carrera.id, false, carrera.id === valorActual));
            }
            select.append(grupo);
        }
        return select;
    }
    const input = el('input', 'tarjeta-pieza-campo');
    input.type = 'text';
    input.value = valorActual || '';
    input.placeholder = PREGUNTAS[pieza].ejemplo;
    input.autocomplete = 'off';
    if (pieza === 'codigo') {
        input.maxLength = 9;
        input.inputMode = 'text';
        input.style.textTransform = 'uppercase';
    } else {
        input.maxLength = 40;
    }
    return input;
}

/**
 * Crea la tarjeta que pregunta (o edita) UNA pieza.
 * opciones:
 *   valorActual  – valor ya guardado (modo edición)
 *   textoCancelar – "Ahora no" (dashboard) o "Cancelar" (Mi cuenta)
 *   guardar(pieza, valor) – async, devuelve { ok, mensaje?, cambios? }
 *   alGuardar(cambios)    – tras guardar bien
 *   alCancelar()          – al tocar el botón secundario
 */
export function crearTarjetaPregunta(pieza, opciones = {}) {
    const def = PREGUNTAS[pieza];
    const tarjeta = el('form', 'tarjeta-pieza tarjeta-pieza-editando');
    tarjeta.noValidate = true;

    const cabeza = el('div', 'tarjeta-pieza-etiqueta', def.etiqueta);
    const titulo = el('label', 'tarjeta-pieza-pregunta', def.pregunta);
    const campo = campoPara(pieza, opciones.valorActual);
    const idCampo = `pieza-${pieza}-${Math.random().toString(36).slice(2, 7)}`;
    campo.id = idCampo;
    titulo.htmlFor = idCampo;

    const nota = el('div', 'tarjeta-pieza-nota');
    const error = el('div', 'tarjeta-pieza-error');
    error.setAttribute('role', 'alert');

    if (pieza === 'carrera') {
        campo.addEventListener('change', () => {
            const info = buscarCarrera(campo.value);
            nota.textContent = info ? `Facultad: ${info.facultad.sigla}` : '';
        });
        campo.dispatchEvent(new Event('change'));
    }
    campo.addEventListener('input', () => { error.textContent = ''; });

    const acciones = el('div', 'tarjeta-pieza-acciones');
    const btnCancelar = el('button', 'tarjeta-pieza-btn secundario', opciones.textoCancelar || 'Cancelar');
    btnCancelar.type = 'button';
    const btnGuardar = el('button', 'tarjeta-pieza-btn principal', 'Guardar');
    btnGuardar.type = 'submit';
    acciones.append(btnCancelar, btnGuardar);

    btnCancelar.addEventListener('click', () => opciones.alCancelar?.());

    tarjeta.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!opciones.guardar) return;
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando…';
        const resultado = await opciones.guardar(pieza, campo.value);
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
        if (!resultado?.ok) {
            error.textContent = resultado?.mensaje || 'No se pudo guardar.';
            campo.focus();
            return;
        }
        opciones.alGuardar?.(resultado.cambios);
    });

    tarjeta.append(cabeza, titulo, campo, nota, error, acciones);
    setTimeout(() => campo.focus(), 0);
    return tarjeta;
}