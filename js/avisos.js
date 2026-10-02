// js/avisos.js — Pestaña "Avisos" de Mi cuenta (antes "Preferencias").
// ------------------------------------------------------------
// - Tarjeta general: interruptor maestro con campanita. Apagado, las
//   demás tarjetas se atenúan y se bloquean.
// - Una tarjeta por tipo de aviso, con una mini vista previa.
// - Sin botón "guardar": cada cambio se guarda solo ("Guardado ✓").
//   Si falla, el interruptor vuelve a su estado anterior.
//
// Tabla: preferencias_notificacion
//   notificaciones_activas  → interruptor general
//   avisos_asesorias        → "Nuevas asesorías"  (antes se llamaba
//                             avisos_materiales; la columna vieja se puede
//                             borrar cuando todo esto esté publicado)
//   avisos_respuestas       → "Respuestas a lo que envías" (respuestas a tus
//                             ideas y aviso de que tu asesoría se publicó)
//   recordatorios           → "Recordatorios"
//   actualizaciones_modulos → "Novedades de SIGA"
//
// Cada notificación tiene un tipo que corresponde a uno de estos interruptores
// (ver js/notificaciones-siga.js y js/notificaciones-punto.js): si el alumno
// apaga un tipo, esas notificaciones dejan de mostrársele.
// ------------------------------------------------------------

import { supabase } from './auth-siga.js?v=9';

const TIPOS = [
    {
        columna: 'avisos_asesorias',
        titulo: 'Nuevas asesorías',
        texto: 'Cuando se publique una asesoría nueva para tus cursos.',
        ejemplo: 'Nueva asesoría en Diseño de Base de Datos',
        color: '#1E9E5A',
        fondo: '#E6F2E9',
        icono: '<path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/>',
    },
    {
        columna: 'avisos_respuestas',
        titulo: 'Respuestas a lo que envías',
        texto: 'Cuando respondemos una idea tuya o publicamos una asesoría que compartiste.',
        ejemplo: 'Respondieron tu idea: «Deberían agregar…»',
        color: '#C13F94',
        fondo: '#FBEAF4',
        icono: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    },
    {
        columna: 'recordatorios',
        titulo: 'Recordatorios',
        texto: 'Avisos sobre asesorías o fechas que guardaste.',
        ejemplo: 'Recordatorio: tu asesoría guardada es mañana',
        color: '#0FA89E',
        fondo: '#E6F7F4',
        icono: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 3h6"/>',
    },
    {
        columna: 'actualizaciones_modulos',
        titulo: 'Novedades de SIGA',
        texto: 'Cuando SIGA lanza mejoras o funciones nuevas.',
        ejemplo: 'Novedad: ya puedes completar tu carnet SIGA',
        color: '#6600CC',
        fondo: '#F3EAFB',
        icono: '<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/>',
    },
];

const ICONO_CAMPANA = '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>';

function el(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
}

function svg(cuerpo, tam) {
    return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cuerpo}</svg>`;
}

function interruptor(etiqueta, activo) {
    const b = el('button', 'avisos-switch');
    b.type = 'button';
    b.setAttribute('role', 'switch');
    b.setAttribute('aria-checked', String(activo));
    b.setAttribute('aria-label', etiqueta);
    return b;
}

export async function montarAvisos(sesion) {
    const raiz = document.getElementById('avisos');
    if (!raiz) return;

    const userId = sesion.user.id;
    // Si el alumno nunca tocó nada, todo está activado (igual que antes).
    const prefs = {
        notificaciones_activas: true,
        avisos_asesorias: true,
        avisos_respuestas: true,
        recordatorios: true,
        actualizaciones_modulos: true,
    };

    const { data, error } = await supabase
        .from('preferencias_notificacion')
        .select('notificaciones_activas, avisos_asesorias, avisos_respuestas, recordatorios, actualizaciones_modulos')
        .eq('user_id', userId)
        .maybeSingle();
    if (error) console.error('Error cargando avisos:', error);
    if (data) Object.assign(prefs, data);

    /* ---------- Tarjeta general ---------- */
    const general = el('div', 'avisos-general');
    const campana = el('div', 'avisos-campana');
    campana.innerHTML = svg(ICONO_CAMPANA, 24);
    const textos = el('div', 'avisos-general-texto');
    const tituloGen = el('b');
    const subGen = el('span');
    textos.append(tituloGen, subGen);
    const swGeneral = interruptor('Activar avisos', prefs.notificaciones_activas);
    general.append(campana, textos, swGeneral);

    /* ---------- Tarjetas por tipo ---------- */
    const rejilla = el('div', 'avisos-rejilla');
    const switches = {};
    TIPOS.forEach((t) => {
        const tarjeta = el('div', 'avisos-tarjeta');
        tarjeta.style.setProperty('--aviso-color', t.color);
        tarjeta.style.setProperty('--aviso-fondo', t.fondo);

        const cab = el('div', 'avisos-tarjeta-cab');
        const icono = el('span', 'avisos-icono');
        icono.innerHTML = svg(t.icono, 19);
        const sw = interruptor(t.titulo, prefs[t.columna]);
        switches[t.columna] = sw;
        cab.append(icono, el('b', null, t.titulo), sw);

        const vista = el('div', 'avisos-vista');
        vista.append(el('i', null, 'Así se vería'), t.ejemplo);

        tarjeta.append(cab, el('p', null, t.texto), vista);
        rejilla.append(tarjeta);
    });

    const estado = el('div', 'avisos-estado');
    estado.setAttribute('role', 'status');

    const cabecera = el('div', 'avisos-cabecera');
    cabecera.append(el('h2', 'avisos-titulo', 'Avisos'), el('p', 'avisos-sub', 'Elige qué quieres que SIGA te avise.'));

    raiz.replaceChildren(cabecera, general, rejilla, estado);

    /* ---------- Comportamiento ---------- */
    let temporizador;
    function decir(texto, error = false) {
        estado.textContent = texto;
        estado.classList.toggle('error', error);
        estado.classList.add('visible');
        clearTimeout(temporizador);
        temporizador = setTimeout(() => estado.classList.remove('visible'), 2200);
    }

    function pintarGeneral(conAnimacion) {
        const activo = prefs.notificaciones_activas;
        general.classList.toggle('apagado', !activo);
        rejilla.classList.toggle('apagado', !activo);
        tituloGen.textContent = activo ? 'Tus avisos están activados' : 'Tus avisos están en pausa';
        subGen.textContent = activo
            ? 'Elige abajo cuáles quieres recibir.'
            : 'No recibirás ningún aviso hasta que los actives.';
        swGeneral.setAttribute('aria-checked', String(activo));
        Object.values(switches).forEach((s) => { s.disabled = !activo; });
        if (activo && conAnimacion) {
            campana.classList.remove('suena');
            void campana.offsetWidth; // reinicia la animación
            campana.classList.add('suena');
        }
    }

    async function cambiar(columna, valor) {
        const anterior = prefs[columna];
        prefs[columna] = valor;
        if (columna === 'notificaciones_activas') pintarGeneral(true);
        else switches[columna].setAttribute('aria-checked', String(valor));

        const { error: errGuardar } = await supabase
            .from('preferencias_notificacion')
            .upsert({
                user_id: userId,
                ...prefs,
                actualizado_en: new Date().toISOString(),
            });

        if (errGuardar) {
            console.error('Error guardando avisos:', errGuardar);
            prefs[columna] = anterior; // se deshace el cambio para no mentir
            if (columna === 'notificaciones_activas') pintarGeneral(false);
            else switches[columna].setAttribute('aria-checked', String(anterior));
            decir('No se pudo guardar. Intenta de nuevo.', true);
            return;
        }
        decir('Guardado ✓');
    }

    swGeneral.addEventListener('click', () => cambiar('notificaciones_activas', !prefs.notificaciones_activas));
    Object.entries(switches).forEach(([columna, sw]) => {
        sw.addEventListener('click', () => cambiar(columna, !prefs[columna]));
    });

    pintarGeneral(false);
}