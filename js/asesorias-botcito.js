// js/asesorias-botcito.js — Botcito de la página de curso (primera tanda).
//
// Busca EN VIVO entre las preguntas frecuentes PUBLICADAS del curso: sin importar
// tildes ni mayúsculas, y sin tener que escribir la pregunta completa. Cada
// respuesta se muestra en texto sencillo, con su etiqueta (Concepto, Caso de
// ejemplo o Método) si la tiene.
// Las preguntas NO se ven al entrar: salen al tocar "Preguntas frecuentes" (lista
// desplegable con filas lila y blancas) o al empezar a escribir en el buscador.
// Si no encuentra la duda, el alumno puede ENVIAR su pregunta (asesorias-pregunta-form.js).
// Si ya envió alguna, ve el enlace "Ver mis preguntas" (Perfil → Mis preguntas).
//
// Lo llama asesorias-pagina-curso.js:  montarBotcito(<contenedor .an-curso-grid>, curso)
// Si el curso no tiene preguntas publicadas (o falla la carga), NO muestra nada:
// así no aparece un botcito que busca en una lista vacía.
//
// ⚠️ Archivo NUEVO (no confundir con asesorias-cursos.js ni asesorias-comun.js).
import { supabase } from './auth-siga.js?v=9';
import { esc, normalizar, botcitoSVG } from './asesorias-comun.js?v=1';
import { estadoEnvio, abrirFormPregunta } from './asesorias-pregunta-form.js?v=1';

const ETIQUETAS = { concepto: 'Concepto', caso: 'Caso de ejemplo', metodo: 'Método' };

// Palabras que no ayudan a buscar: "¿qué es un ticket?" se busca como "ticket".
const VACIAS = new Set(('que es un una unos unas el la los las de del en y o a al se como cual '
    + 'cuales por para con lo su sus hay son ser me mi entre sobre').split(' '));

const LIMITE_BUSQUEDA = 10;

// ───────────── Búsqueda (función pura: no toca la pantalla) ─────────────
const limpiar = (t) => normalizar(t).replace(/[^a-z0-9]+/g, ' ').trim();

const cache = new WeakMap();
function indice(f) {
    let x = cache.get(f);
    if (!x) {
        x = {
            p: ` ${limpiar(f.pregunta)} `,
            k: ` ${limpiar(f.palabras_clave)} `,
            r: ` ${limpiar(f.respuesta)} `,
        };
        cache.set(f, x);
    }
    return x;
}

/**
 * Devuelve { modo, lista }:
 *   'todas'    → no hay nada que buscar todavía: salen todas, en su orden.
 *   'exacta'   → preguntas que contienen TODAS las palabras buscadas (mejores primero).
 *   'parecida' → ninguna las tiene todas; salen las que coinciden con alguna.
 *   'ninguna'  → no hay coincidencias.
 * Pesos: pregunta y palabras clave valen más que el texto de la respuesta.
 */
export function buscarFaq(faqs, consulta) {
    const tokens = [...new Set(limpiar(consulta).split(' ').filter((t) => t.length >= 2 && !VACIAS.has(t)))];
    if (!tokens.length) return { modo: 'todas', lista: faqs };

    const puntuadas = faqs.map((f, i) => {
        const ix = indice(f);
        let puntos = 0;
        let faltan = 0;
        for (const t of tokens) {
            const enP = ix.p.includes(t);
            const enK = ix.k.includes(t);
            const enR = ix.r.includes(t);
            if (!enP && !enK && !enR) { faltan += 1; continue; }
            puntos += (enP ? 3 : 0) + (enK ? 3 : 0) + (enR ? 1 : 0);
            if (ix.p.includes(` ${t}`) || ix.k.includes(` ${t}`)) puntos += 1; // empieza una palabra
        }
        return { f, i, puntos, faltan };
    });

    const exactas = puntuadas.filter((x) => x.faltan === 0)
        .sort((a, b) => b.puntos - a.puntos || a.i - b.i);
    if (exactas.length) return { modo: 'exacta', lista: exactas.map((x) => x.f) };

    const parecidas = puntuadas.filter((x) => x.faltan < tokens.length)
        .sort((a, b) => a.faltan - b.faltan || b.puntos - a.puntos || a.i - b.i);
    if (parecidas.length) return { modo: 'parecida', lista: parecidas.slice(0, 5).map((x) => x.f) };

    return { modo: 'ninguna', lista: [] };
}

// ───────────── Datos ─────────────
// .eq('publicada', true) es OBLIGATORIO aunque la política de Supabase ya lo limite:
// Harry (admin) también puede leer borradores, y su vista debe ser igual a la de un alumno.
export async function cargarFaq(codigoCurso) {
    const { data, error } = await supabase
        .from('asesorias_faq')
        .select('id, etiqueta, evaluacion, pregunta, respuesta, palabras_clave')
        .eq('codigo_curso', codigoCurso)
        .eq('publicada', true)
        .order('creada_en', { ascending: true })
        .order('pregunta', { ascending: true });
    if (error) {
        console.warn('Botcito: no se pudieron cargar las preguntas frecuentes.', error);
        return [];
    }
    return data || [];
}

// ───────────── Pantalla ─────────────
const LUPA = '<svg class="an-faq-lupa" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>';

function itemHTML(f, abierto) {
    const etq = f.etiqueta
        ? `<span class="an-faq-etq an-faq-etq-${esc(f.etiqueta)}">${esc(ETIQUETAS[f.etiqueta] || f.etiqueta)}</span>`
        : '';
    return `
        <div class="an-faq-it${abierto ? ' an-abierta' : ''}" data-id="${esc(f.id)}">
            <button type="button" class="an-faq-q" aria-expanded="${abierto}" aria-controls="anFaqR-${esc(f.id)}">
                <span class="an-faq-txt">${etq}<span class="an-faq-qt">${esc(f.pregunta)}</span></span>
                <span class="an-faq-chev" aria-hidden="true">▾</span>
            </button>
            <div class="an-faq-r" id="anFaqR-${esc(f.id)}"${abierto ? '' : ' hidden'}>${esc(f.respuesta)}</div>
        </div>`;
}

export async function montarBotcito(grid, curso) {
    if (!grid || !curso) return false;
    const faqs = await cargarFaq(curso.codigo);
    if (!faqs.length) return false;

    const ejemplo = (faqs.find((f) => f.palabras_clave) || {}).palabras_clave;
    const ejemploTxt = ejemplo ? ejemplo.split(',')[0].trim() : '';

    grid.classList.add('an-con-faq');
    grid.insertAdjacentHTML('beforeend', `
        <aside class="an-faq" id="anFaq" aria-labelledby="anFaqT">
            <div class="an-faq-cab">
                ${botcitoSVG('an-bot an-faq-bot')}
                <div>
                    <h2 id="anFaqT">¿Tienes una duda?</h2>
                    <p>Busca en las preguntas frecuentes de este curso.</p>
                </div>
            </div>
            <div class="an-faq-buscar">
                ${LUPA}
                <input type="search" id="anFaqQ" autocomplete="off" spellcheck="false"
                    placeholder="${esc(ejemploTxt ? `Escribe tu duda (ej. ${ejemploTxt})` : 'Escribe tu duda')}"
                    aria-label="Buscar en las preguntas frecuentes de ${esc(curso.nombre)}">
                <button type="button" class="an-faq-x" id="anFaqX" aria-label="Borrar búsqueda" hidden>✕</button>
            </div>
            <button type="button" class="an-faq-toggle" id="anFaqToggle" aria-expanded="false" aria-controls="anFaqPanel">
                <span>Preguntas frecuentes</span>
                <span class="an-faq-chev" aria-hidden="true">▾</span>
            </button>
            <div class="an-faq-panel" id="anFaqPanel" hidden>
                <p class="an-faq-estado" id="anFaqEstado" aria-live="polite"></p>
                <div class="an-faq-lista" id="anFaqLista"></div>
            </div>
            <p class="an-faq-preg" id="anFaqPreg" hidden>¿No está tu duda? <button type="button" class="an-faq-env" id="anFaqEnv">Envía tu pregunta</button></p>
            <p class="an-faq-pausa" id="anFaqPausa" hidden>Por ahora no estoy recibiendo preguntas nuevas, pero el buscador sigue disponible.</p>
            <p class="an-faq-mis" id="anFaqMis" hidden><a class="an-faq-env" href="perfil.html#preguntas">Ver mis preguntas →</a></p>
        </aside>`);

    const $ = (id) => document.getElementById(id);
    const st = { consulta: '', clave: '', abierto: false, abiertas: new Set(), cerradas: new Set() };

    function pintar() {
        const { modo, lista } = buscarFaq(faqs, st.consulta);
        const visibles = lista.slice(0, modo === 'todas' ? lista.length : LIMITE_BUSQUEDA);

        // Con una sola coincidencia exacta, la respuesta sale abierta: un clic menos.
        const auto = modo === 'exacta' && lista.length === 1;
        $('anFaqLista').innerHTML = visibles.map((f) => itemHTML(
            f, st.abiertas.has(f.id) || (auto && !st.cerradas.has(f.id)),
        )).join('');

        // Sin búsqueda no se muestra ningún número: el botón ya dice "Preguntas frecuentes".
        const n = lista.length;
        $('anFaqEstado').textContent = {
            todas: '',
            exacta: n > LIMITE_BUSQUEDA
                ? `Mostrando ${LIMITE_BUSQUEDA} de ${n} resultados. Escribe más palabras para afinar.`
                : `${n} ${n === 1 ? 'resultado' : 'resultados'}`,
            parecida: 'No encontré justo eso, pero quizás te sirva alguna de estas:',
            ninguna: 'No encontré nada con esas palabras. Prueba con otra, o envíame tu pregunta.',
        }[modo];

        $('anFaqToggle').setAttribute('aria-expanded', String(st.abierto));
        $('anFaqPanel').hidden = !st.abierto;
        $('anFaqX').hidden = !st.consulta;
    }

    $('anFaqToggle').addEventListener('click', () => { st.abierto = !st.abierto; pintar(); });

    const q = $('anFaqQ');
    q.addEventListener('input', () => {
        st.consulta = q.value;
        st.abierto = true; // al escribir, las preguntas salen solas
        // Si el alumno cerró una respuesta, no se reabre sola mientras siga con la misma búsqueda
        // (por ejemplo, al agregar un espacio). Solo cuando cambia lo que busca.
        const clave = limpiar(q.value);
        if (clave !== st.clave) { st.clave = clave; st.cerradas.clear(); }
        pintar();
    });
    q.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && q.value) { q.value = ''; q.dispatchEvent(new Event('input')); }
    });
    $('anFaqX').addEventListener('click', () => {
        q.value = '';
        q.dispatchEvent(new Event('input'));
        q.focus();
    });

    $('anFaqLista').addEventListener('click', (e) => {
        const btn = e.target.closest('.an-faq-q');
        if (!btn) return;
        const it = btn.closest('.an-faq-it');
        const abrir = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(abrir));
        it.classList.toggle('an-abierta', abrir);
        it.querySelector('.an-faq-r').hidden = !abrir;
        if (abrir) { st.abiertas.add(it.dataset.id); st.cerradas.delete(it.dataset.id); }
        else { st.abiertas.delete(it.dataset.id); st.cerradas.add(it.dataset.id); }
    });

    // Enviar una pregunta: se rellena con lo que el alumno estaba buscando.
    $('anFaqEnv').addEventListener('click', () => {
        const buscado = st.consulta.trim();
        abrirFormPregunta({
            curso,
            textoInicial: buscado.length >= 3 ? buscado : '',
            alEnviar: () => { $('anFaqMis').hidden = false; },   // ya tiene una: le sale el enlace a Mis preguntas
        });
    });

    // Se muestra la invitación solo si el envío funciona; si hay pausa, un aviso; si falla, nada
    // (así nunca aparece un botón roto).
    estadoEnvio().then((e) => {
        if (!e) return;
        if (e.pausa && !e.puede) $('anFaqPausa').hidden = false;
        else $('anFaqPreg').hidden = false;
    });

    // "Ver mis preguntas" (en Perfil) aparece solo si el alumno ya envió alguna, de cualquier curso.
    supabase.from('asesorias_preguntas').select('id', { count: 'exact', head: true }).then(({ count, error }) => {
        if (!error && count > 0) $('anFaqMis').hidden = false;
    }, () => { });

    pintar();
    return true;
}