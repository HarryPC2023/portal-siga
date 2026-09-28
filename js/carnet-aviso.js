// js/carnet-aviso.js — Tarjetita sutil "Completa tu carnet SIGA".
// ------------------------------------------------------------
// Reemplaza al modal obligatorio "Completa tu perfil" (sep 2026).
// Se carga en las secciones "de lectura" (Inicio, Asesorías, Materiales,
// Opiniones) con UNA etiqueta:
//     <script type="module" src="js/carnet-aviso.js"></script>
// NO se carga en Intranotas ni Horarios: ahí el alumno está en plena
// tarea (sincronizando o armando su horario) y no se le interrumpe.
// Inyecta css/carnet-siga.css y Poppins si faltan (asegurarEstilosCarnet).
//
// Reglas (decididas con Harry):
// - Solo aparece si al alumno le falta alguna pieza del carnet
//   (código → nombre → carrera, en ese orden).
// - UNA sola pregunta por visita, y como mínimo 2 días entre respuestas
//   (ultima_pieza_at en perfiles_usuario, vale para todos sus dispositivos).
// - No aparece de golpe: espera unos segundos a que el alumno se ubique.
// - "Ahora no" la esconde hasta la próxima visita (se recuerda solo en
//   esta pestaña/sesión del navegador).
// - Completo el carnet, nunca más vuelve a aparecer.
// - Sin recompensas: la gracia es lo novedoso de la interacción.
// ------------------------------------------------------------

import { supabase } from './auth-siga.js?v=9';
import {
    piezasFaltantes, puedePreguntarHoy, crearTarjetaPregunta, guardarPieza, pintarCarnet,
    asegurarEstilosCarnet,
} from './carnet-siga.js';

const RETRASO_MS = 1500;
const CLAVE_AHORA_NO = 'siga-carnet-ahora-no';
const ICONO_BRILLO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>';
const ICONO_X = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

function dijoAhoraNo() {
    try { return sessionStorage.getItem(CLAVE_AHORA_NO) === '1'; } catch { return false; }
}
function recordarAhoraNo() {
    try { sessionStorage.setItem(CLAVE_AHORA_NO, '1'); } catch { /* sin storage: no pasa nada */ }
}

async function iniciar() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return; // sin cuenta no hay carnet que completar

    const { data, error } = await supabase
        .from('perfiles_usuario')
        .select('nombre, codigo_estudiante, carrera, ultima_pieza_at')
        .eq('user_id', session.user.id)
        .maybeSingle();

    if (error) {
        console.error('Error revisando el carnet:', error);
        return;
    }

    const perfil = data || {};
    const faltan = piezasFaltantes(perfil);
    if (!faltan.length || !puedePreguntarHoy(perfil) || dijoAhoraNo()) return;

    asegurarEstilosCarnet();
    setTimeout(() => mostrarTarjetita(session.user.id, perfil, faltan[0]), RETRASO_MS);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
} else {
    iniciar();
}

function mostrarTarjetita(userId, perfil, pieza) {
    const aviso = document.createElement('aside');
    aviso.className = 'carnet-aviso';
    aviso.setAttribute('role', 'region');
    aviso.setAttribute('aria-label', 'Completa tu carnet SIGA');

    // Brillito en la esquina: despliega el carnet para ver cómo va.
    const brillo = document.createElement('button');
    brillo.type = 'button';
    brillo.className = 'carnet-aviso-brillo';
    brillo.setAttribute('aria-label', 'Ver mi carnet');
    brillo.setAttribute('aria-expanded', 'false');
    brillo.innerHTML = ICONO_BRILLO;

    const cerrarBtn = document.createElement('button');
    cerrarBtn.type = 'button';
    cerrarBtn.className = 'carnet-aviso-cerrar';
    cerrarBtn.setAttribute('aria-label', 'Ahora no');
    cerrarBtn.innerHTML = ICONO_X;

    const lugarCarnet = document.createElement('div');
    lugarCarnet.className = 'carnet-aviso-carnet';
    lugarCarnet.hidden = true;

    const intro = document.createElement('p');
    intro.className = 'carnet-aviso-intro';
    intro.textContent = 'Una pregunta rápida para tu carnet SIGA';

    const cuerpo = document.createElement('div');

    function cerrar() {
        aviso.classList.add('saliendo');
        setTimeout(() => aviso.remove(), 300);
    }
    function ahoraNo() {
        recordarAhoraNo();
        cerrar();
    }

    // El carnet desplegado es también un acceso directo a Mi cuenta.
    function pintarCarnetEnlace() {
        const enlace = document.createElement('a');
        enlace.className = 'carnet-aviso-enlace';
        enlace.href = 'perfil.html#info';
        enlace.setAttribute('aria-label', 'Abrir mi carnet en Mi cuenta');
        const carnet = pintarCarnet(enlace, perfil);
        const pista = document.createElement('span');
        pista.className = 'carnet-aviso-pista';
        pista.textContent = 'Completar en Mi cuenta →';
        lugarCarnet.replaceChildren(enlace, pista);
        return carnet;
    }

    brillo.addEventListener('click', () => {
        const abrir = lugarCarnet.hidden;
        if (abrir) pintarCarnetEnlace();
        lugarCarnet.hidden = !abrir;
        brillo.setAttribute('aria-expanded', String(abrir));
    });
    cerrarBtn.addEventListener('click', ahoraNo);

    cuerpo.append(crearTarjetaPregunta(pieza, {
        textoCancelar: 'Ahora no',
        autoFoco: false, // en celular no abrimos el teclado sin que lo pida
        guardar: (p, v) => guardarPieza(userId, p, v),
        alCancelar: ahoraNo,
        alGuardar: (cambios) => {
            Object.assign(perfil, cambios);
            const faltanAun = piezasFaltantes(perfil).length;

            intro.textContent = faltanAun ? '¡Listo! Tu carnet ya tiene una pieza más' : '¡Tu carnet SIGA está completo!';
            lugarCarnet.hidden = false;
            brillo.setAttribute('aria-expanded', 'true');
            pintarCarnetEnlace().classList.add('carnet-latido');
            lugarCarnet.querySelector('.carnet-aviso-pista')?.remove();

            const ver = document.createElement('a');
            ver.className = 'carnet-aviso-ver';
            ver.href = 'perfil.html#info';
            ver.textContent = 'Ver mi carnet →';
            cuerpo.replaceChildren(ver);

            setTimeout(cerrar, 7000);
        },
    }));

    aviso.append(brillo, cerrarBtn, intro, lugarCarnet, cuerpo);
    document.body.append(aviso);
}