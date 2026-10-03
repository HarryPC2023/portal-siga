// js/asesorias-pregunta-form.js — Ventana para ENVIAR una pregunta desde el botcito (segunda tanda).
//
// Las reglas (3 por semana, pausa, texto de 10 a 300 caracteres, curso con preguntas publicadas)
// las hace cumplir la base de datos con asesorias_enviar_pregunta (ver asesorias-preguntas.sql).
// Aquí el límite es INVISIBLE: no hay contadores ni "te quedan N". El alumno solo ve un mensaje
// breve y amable cuando de verdad no puede preguntar (límite semanal o pausa).
// Lo abre asesorias-botcito.js.
//
// ⚠️ Archivo NUEVO.
import { supabase } from './auth-siga.js?v=9';
import { esc, aviso, crearVentana, cerrarVentana } from './asesorias-comun.js?v=1';

const MAX = 300;
const MIN = 10;

/** Estado del alumno: { pausa, limite, usadas, restantes, renueva_en, puede }, o null si no se pudo leer. */
export async function estadoEnvio() {
    try {
        const { data, error } = await supabase.rpc('asesorias_estado_envio');
        if (error || !data || data.ok !== true) return null;
        return data;
    } catch (e) {
        console.warn('Botcito: no se pudo leer el estado de envío.', e);
        return null;
    }
}

// "lunes 5 de octubre" (siempre en hora de Lima)
function diaLima(iso) {
    try {
        return new Date(iso).toLocaleDateString('es-PE', {
            weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Lima',
        }).replace(/,/g, '');
    } catch (e) {
        return 'el próximo lunes';
    }
}

// Sin "vuelve más adelante": la pausa no tiene fecha, y eso daría a entender que basta con esperar un rato.
const MSG_PAUSA = 'Por ahora no estoy recibiendo preguntas nuevas.';
const msgLimite = (iso) => `Podrás volver a realizar una consulta el ${diaLima(iso)}.`;

/** Qué mostrar al abrir: { texto, bloquea }. Con cupo normal NO se muestra nada. */
function avisoInicial(e) {
    if (!e) return { texto: '', bloquea: false };             // no se pudo leer: que decida el servidor
    if (e.pausa && !e.puede) return { texto: MSG_PAUSA, bloquea: true };
    if (!e.puede) return { texto: msgLimite(e.renueva_en), bloquea: true };
    if (e.pausa) return { texto: 'Las preguntas están en pausa, pero tú puedes enviar (administrador).', bloquea: false };
    return { texto: '', bloquea: false };
}

const ERRORES = {
    sesion: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    pausa: MSG_PAUSA,
    texto: `Escribe tu pregunta con entre ${MIN} y ${MAX} caracteres.`,
    curso: 'Este curso todavía no recibe preguntas.',
};

/**
 * Abre la ventana. curso = { codigo, nombre }. textoInicial = lo que el alumno ya había buscado.
 * alEnviar (opcional) se llama cuando la pregunta quedó guardada.
 */
export function abrirFormPregunta({ curso, textoInicial = '', alEnviar = null }) {
    cerrarVentana();
    const ov = crearVentana(`
        <div class="an-mdl-h"><h2>Enviar una pregunta</h2><button type="button" class="an-x" data-cerrar aria-label="Cerrar">✕</button></div>
        <p class="an-mdl-sub">${esc(curso.nombre)}</p>
        <p class="an-pq-cupo" id="anPqCupo" aria-live="polite"></p>
        <div id="anPqCampos">
        <div class="an-fld">
            <label for="anPqTxt">Tu pregunta</label>
            <textarea id="anPqTxt" rows="4" maxlength="${MAX}" placeholder="Escríbela con el mayor detalle posible"></textarea>
            <div class="an-pq-cont" id="anPqCont">0/${MAX}</div>
        </div>
        <label class="an-chk"><input type="checkbox" id="anPqPub"><span>Compartir mi consulta de forma pública</span></label>
        <p class="an-pq-ayuda">Si decides compartir tu consulta de forma pública, tu pregunta y la respuesta podrán ayudar a otros estudiantes que tengan la misma duda o una situación similar. Tu nombre no se muestra y yo la reviso antes de publicarla.</p>
        <div class="an-er" id="anPqEr" role="alert"></div>
        <button type="button" class="an-btn" id="anPqEnv" style="width:100%" disabled>Enviar pregunta</button>
        <p class="an-nota an-pq-nota">Si no marcas la casilla, solo tú verás la respuesta, en tus preguntas.</p>
        </div>
        <button type="button" class="an-btn an-btn-ghost" id="anPqCerrar" data-cerrar style="width:100%" hidden>Entendido</button>
    `);

    const $ = (id) => ov.querySelector(`#${id}`);
    const txt = $('anPqTxt');
    const env = $('anPqEnv');
    let bloqueado = true;   // hasta saber si puede preguntar (es un instante)
    let enviando = false;

    const refrescarBoton = () => { env.disabled = bloqueado || enviando; };
    const contar = () => { $('anPqCont').textContent = `${txt.value.length}/${MAX}`; };

    txt.value = String(textoInicial || '').slice(0, MAX);
    contar();
    txt.focus();
    txt.addEventListener('input', () => { contar(); $('anPqEr').textContent = ''; });

    // Muestra el mensaje y, si de verdad no puede preguntar, esconde el formulario.
    function mostrarAviso(texto, bloquea) {
        $('anPqCupo').textContent = texto;
        $('anPqCupo').classList.toggle('an-pq-cupo-alto', bloquea);
        bloqueado = bloquea;
        $('anPqCampos').hidden = bloquea;
        $('anPqCerrar').hidden = !bloquea;
        refrescarBoton();
    }

    estadoEnvio().then((e) => {
        const a = avisoInicial(e);
        mostrarAviso(a.texto, a.bloquea);
    });

    env.addEventListener('click', async () => {
        const texto = txt.value.trim();
        if (texto.length < MIN) {
            $('anPqEr').textContent = `Escribe tu pregunta con al menos ${MIN} caracteres.`;
            txt.focus();
            return;
        }
        enviando = true;
        refrescarBoton();
        $('anPqEr').textContent = '';

        let r = null;
        try {
            const { data, error } = await supabase.rpc('asesorias_enviar_pregunta', {
                p_codigo_curso: curso.codigo,
                p_pregunta: texto,
                p_publica: $('anPqPub').checked,
            });
            if (!error) r = data;
            else console.error('Enviar pregunta:', error);
        } catch (err) {
            console.error('Enviar pregunta:', err);
        }

        enviando = false;
        if (r && r.ok) {
            cerrarVentana();
            aviso('Tu pregunta quedó registrada y está en espera de revisión.');
            if (typeof alEnviar === 'function') alEnviar(r);
            return;
        }
        refrescarBoton();
        if (r && r.motivo === 'limite') {
            mostrarAviso(msgLimite(r.renueva_en), true);   // p. ej. envió desde otra pestaña
        } else if (r && r.motivo === 'pausa') {
            mostrarAviso(MSG_PAUSA, true);
        } else {
            $('anPqEr').textContent = (r && ERRORES[r.motivo]) || 'No se pudo enviar. Intenta de nuevo en un momento.';
        }
    });
}