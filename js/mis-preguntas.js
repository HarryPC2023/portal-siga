// js/mis-preguntas.js — Pestaña "Mis preguntas" de Mi cuenta (Perfil).
// ------------------------------------------------------------
// Aquí el alumno ve TODAS las preguntas que envió desde los cursos de Asesorías,
// de cualquier curso, con su estado y, cuando Harry responde, la respuesta completa:
//   en_espera  → "En espera"        (todavía no la revisan)
//   aceptada   → "Aceptada"         (Harry la va a responder)
//   respondida → "Respondida"       (con la respuesta y si quedó pública o solo para él)
//   rechazada  → "No admitida"      ("Tu consulta no ha sido admitida en esta ocasión.")
//   retirada   → "Retirada"
// Puede RETIRAR una pregunta mientras siga en espera, cambiar si la comparte de forma pública
// mientras no esté respondida, y ELIMINAR de su lista las que ya se cerraron (respondidas, no
// admitidas o retiradas) para que no se le acumulen. Eliminar solo la quita de SU lista: la base
// de datos la conserva y sigue contando para el límite semanal.
//
// Tabla: asesorias_preguntas (cada alumno solo ve las suyas). Retirar, cambiar la
// privacidad y eliminar pasan por funciones de la base de datos (asesorias-preguntas.sql).
// Lo monta js/perfil-hub.js:  montarMisPreguntas(sesion)
//
// ⚠️ Archivo NUEVO.
import { supabase } from './auth-siga.js?v=9';
import { CURSOS } from './asesorias-cursos.js?v=1';

const FIRMA = 'Harry · creador de SIGA';

const ESTADOS = {
    en_espera: { texto: 'En espera', clase: 'espera', nota: 'Tu pregunta está en espera de revisión.' },
    aceptada: { texto: 'Aceptada', clase: 'aceptada', nota: 'Tu pregunta fue aceptada: Harry la va a responder.' },
    respondida: { texto: 'Respondida', clase: 'respondida', nota: '' },
    rechazada: { texto: 'No admitida', clase: 'rechazada', nota: 'Tu consulta no ha sido admitida en esta ocasión.' },
    retirada: { texto: 'Retirada', clase: 'retirada', nota: 'Retiraste esta pregunta.' },
};
const ETIQUETAS = { concepto: 'Concepto', caso: 'Caso de ejemplo', metodo: 'Método' };
const CERRADAS = ['respondida', 'rechazada', 'retirada'];   // las que se pueden eliminar de la lista
const SIN_RESPUESTA = ['rechazada', 'retirada'];            // las que se pueden limpiar en bloque

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const cursoDe = (codigo) => CURSOS.find((c) => c.codigo === codigo);

function fechaCorta(iso) {
    try {
        return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' }).replace(/\./g, '');
    } catch (e) {
        return '';
    }
}

// Lo más reciente (por actividad) arriba: si Harry acaba de responder, sale primero.
const actividad = (f) => Date.parse(f.respondida_en || f.revisada_en || f.creada_en) || 0;

export async function montarMisPreguntas(sesion) {
    const cont = document.getElementById('misPreguntas');
    if (!cont) return;

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/mis-preguntas.css?v=1';
    document.head.appendChild(css);

    let filas = [];
    let cargado = false;
    let confirmando = null;           // id de la pregunta que se está por retirar
    let quitando = null;              // id de la pregunta que se está por eliminar de la lista
    let limpiando = false;            // se está por limpiar las no admitidas y retiradas
    const errores = new Map();        // id -> mensaje en esa tarjeta

    function tarjeta(f) {
        const est = ESTADOS[f.estado] || ESTADOS.en_espera;
        const curso = cursoDe(f.codigo_curso);
        const cursoHTML = curso
            ? `<a class="mp-curso" href="asesorias-curso.html?c=${encodeURIComponent(curso.slug)}">${esc(curso.nombre)}</a>`
            : `<span class="mp-curso">${esc(f.codigo_curso)}</span>`;

        let cuerpo = '';
        if (f.estado === 'respondida') {
            const etq = f.etiqueta ? `<span class="mp-etq mp-etq-${esc(f.etiqueta)}">${esc(ETIQUETAS[f.etiqueta] || f.etiqueta)}</span>` : '';
            const alcance = f.faq_id
                ? '<span class="mp-alcance">Publicada: otros estudiantes también la ven, sin tu nombre.</span>'
                : '<span class="mp-alcance">Solo tú ves esta respuesta.</span>';
            cuerpo = `
                <div class="mp-resp">
                    <p>${esc(f.respuesta)}</p>
                    <div class="mp-resp-pie"><span class="mp-firma">— ${esc(FIRMA)}</span>${etq}</div>
                </div>
                ${alcance}`;
        } else if (est.nota) {
            cuerpo = `<p class="mp-nota">${esc(est.nota)}</p>`;
        }

        let acciones = '';
        if (f.estado === 'en_espera' || f.estado === 'aceptada') {
            acciones += `
                <label class="mp-sw">
                    <input type="checkbox" data-mp="privacidad"${f.publica ? ' checked' : ''}>
                    <span>Compartir de forma pública</span>
                </label>
                <p class="mp-ayuda">Si la compartes, tu pregunta y la respuesta podrán ayudar a otros estudiantes. Tu nombre no se muestra.</p>`;
        }
        if (f.estado === 'en_espera') {
            acciones += confirmando === f.id
                ? `<div class="mp-conf">¿Retirar esta pregunta?
                        <button type="button" class="mp-btn mp-btn-peligro" data-mp="si-retirar">Sí, retirar</button>
                        <button type="button" class="mp-btn" data-mp="no-retirar">Cancelar</button>
                   </div>`
                : '<button type="button" class="mp-btn" data-mp="retirar">Retirar pregunta</button>';
        }
        if (CERRADAS.includes(f.estado)) {
            if (quitando === f.id) {
                const aviso = f.estado === 'respondida'
                    ? `¿Eliminar esta pregunta y su respuesta de tu lista?${f.faq_id ? ' La respuesta pública seguirá disponible para otros estudiantes.' : ''}`
                    : '¿Eliminar esta pregunta de tu lista?';
                acciones += `<div class="mp-conf">${aviso}
                        <button type="button" class="mp-btn mp-btn-peligro" data-mp="si-quitar">Sí, eliminar</button>
                        <button type="button" class="mp-btn" data-mp="no-quitar">Cancelar</button>
                   </div>`;
            } else {
                acciones += '<button type="button" class="mp-btn mp-btn-suave" data-mp="quitar">Eliminar de mi lista</button>';
            }
        }
        const err = errores.get(f.id);

        return `
            <article class="mp-item" data-id="${esc(f.id)}">
                <div class="mp-cab">${cursoHTML}<span class="mp-estado mp-estado-${est.clase}">${esc(est.texto)}</span></div>
                <p class="mp-preg">${esc(f.pregunta)}</p>
                <p class="mp-meta">${esc(fechaCorta(f.creada_en))}</p>
                ${cuerpo}
                ${acciones ? `<div class="mp-acc">${acciones}</div>` : ''}
                ${err ? `<p class="mp-err" role="alert">${esc(err)}</p>` : ''}
            </article>`;
    }

    function pintar() {
        let html = `
            <h2 class="mp-titulo">Mis preguntas</h2>
            <p class="mp-intro">Aquí ves las preguntas que enviaste desde los cursos de Asesorías, con su estado y la respuesta cuando Harry la escribe.</p>`;
        if (!cargado) {
            html += '<p class="mp-vacio">Cargando…</p>';
        } else if (!filas.length) {
            html += `
                <div class="mp-vacio">
                    <p>Todavía no has enviado ninguna pregunta.</p>
                    <p>Búscala primero en las preguntas frecuentes del curso; si no está, el botcito te deja enviarla.</p>
                    <a class="mp-btn mp-btn-primario" href="asesorias.html">Ir a Asesorías</a>
                </div>`;
        } else {
            const sinRespuesta = filas.filter((f) => SIN_RESPUESTA.includes(f.estado)).length;
            if (sinRespuesta) {
                html += limpiando
                    ? `<div class="mp-limpiar mp-conf">¿Quitar de tu lista ${sinRespuesta === 1 ? 'la pregunta no admitida o retirada' : `las ${sinRespuesta} preguntas no admitidas o retiradas`}?
                            <button type="button" class="mp-btn mp-btn-peligro" data-mp="si-limpiar">Sí, limpiar</button>
                            <button type="button" class="mp-btn" data-mp="no-limpiar">Cancelar</button>
                       </div>`
                    : '<div class="mp-limpiar"><button type="button" class="mp-btn mp-btn-suave" data-mp="limpiar">Limpiar no admitidas y retiradas</button></div>';
            }
            html += `<div class="mp-lista">${[...filas].sort((a, b) => actividad(b) - actividad(a)).map(tarjeta).join('')}</div>`;
        }
        cont.innerHTML = html;
    }

    async function cargar() {
        const { data, error } = await supabase
            .from('asesorias_preguntas')
            .select('id, codigo_curso, pregunta, publica, estado, respuesta, etiqueta, faq_id, creada_en, revisada_en, respondida_en')
            .eq('user_id', sesion.user.id)
            .eq('oculta_alumno', false)
            .order('creada_en', { ascending: false });
        if (error) {
            console.error('Mis preguntas:', error);
            if (!cargado) cont.innerHTML = '<h2 class="mp-titulo">Mis preguntas</h2><p class="mp-vacio">No pude cargar tus preguntas ahora. Vuelve a intentarlo en un momento.</p>';
            return;
        }
        filas = data || [];
        cargado = true;
        pintar();
    }

    async function retirar(id) {
        const { data, error } = await supabase.rpc('asesorias_retirar_pregunta', { p_id: id });
        confirmando = null;
        if (error || !data || !data.ok) {
            if (error) console.error('Retirar pregunta:', error);
            errores.set(id, 'No se pudo retirar: quizá ya la revisaron. Actualicé la lista.');
            await cargar();
            return;
        }
        errores.delete(id);
        const f = filas.find((x) => x.id === id);
        if (f) f.estado = 'retirada';
        pintar();
    }

    async function quitar(id) {
        const { data, error } = await supabase.rpc('asesorias_ocultar_pregunta', { p_id: id });
        quitando = null;
        if (error || !data || !data.ok) {
            if (error) console.error('Eliminar pregunta:', error);
            errores.set(id, 'No se pudo eliminar. Actualicé la lista.');
            await cargar();
            return;
        }
        errores.delete(id);
        filas = filas.filter((x) => x.id !== id);
        pintar();
    }

    async function limpiar() {
        const { data, error } = await supabase.rpc('asesorias_ocultar_cerradas');
        limpiando = false;
        if (error || !data || !data.ok) {
            if (error) console.error('Limpiar preguntas:', error);
            await cargar();
            return;
        }
        filas = filas.filter((x) => !SIN_RESPUESTA.includes(x.estado));
        pintar();
    }

    async function cambiarPrivacidad(id, publica, check) {
        const { data, error } = await supabase.rpc('asesorias_cambiar_privacidad', { p_id: id, p_publica: publica });
        if (error || !data || !data.ok) {
            if (error) console.error('Cambiar privacidad:', error);
            errores.set(id, 'No se pudo cambiar: quizá ya la respondieron. Actualicé la lista.');
            await cargar();
            return;
        }
        errores.delete(id);
        const f = filas.find((x) => x.id === id);
        if (f) f.publica = publica;
        pintar();
    }

    cont.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-mp]');
        if (!btn || btn.dataset.mp === 'privacidad') return;
        // Limpiar en bloque (no está dentro de una tarjeta)
        if (btn.dataset.mp === 'limpiar') { limpiando = true; pintar(); return; }
        if (btn.dataset.mp === 'no-limpiar') { limpiando = false; pintar(); return; }
        if (btn.dataset.mp === 'si-limpiar') { btn.disabled = true; limpiar(); return; }
        const item = btn.closest('.mp-item');
        if (!item) return;
        const id = item.dataset.id;
        if (btn.dataset.mp === 'retirar') { confirmando = id; pintar(); }
        else if (btn.dataset.mp === 'no-retirar') { confirmando = null; pintar(); }
        else if (btn.dataset.mp === 'si-retirar') { btn.disabled = true; retirar(id); }
        else if (btn.dataset.mp === 'quitar') { quitando = id; pintar(); }
        else if (btn.dataset.mp === 'no-quitar') { quitando = null; pintar(); }
        else if (btn.dataset.mp === 'si-quitar') { btn.disabled = true; quitar(id); }
    });

    cont.addEventListener('change', (e) => {
        if (e.target.dataset.mp !== 'privacidad') return;
        const item = e.target.closest('.mp-item');
        e.target.disabled = true;
        cambiarPrivacidad(item.dataset.id, e.target.checked, e.target);
    });

    // Al abrir la pestaña se trae lo más reciente (por si Harry respondió mientras tanto).
    const alAbrir = () => { if (window.location.hash === '#preguntas') cargar(); };
    window.addEventListener('hashchange', alAbrir);
    document.addEventListener('click', (e) => {
        if (e.target.closest('.perfil-hub-tab[data-tab="preguntas"]')) cargar();
    });

    pintar();
    await cargar();
}