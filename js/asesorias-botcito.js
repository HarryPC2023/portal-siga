// js/asesorias-botcito.js — Botcito de la página de curso (primera tanda).
//
// Busca EN VIVO entre las preguntas frecuentes PUBLICADAS del curso: sin importar
// tildes ni mayúsculas, y sin tener que escribir la pregunta completa. Cada
// respuesta se muestra en texto sencillo, con su etiqueta (Concepto, Caso de
// ejemplo o Método) si la tiene.
//
// Lo llama asesorias-pagina-curso.js:  montarBotcito(<contenedor .an-curso-grid>, curso)
// Si el curso no tiene preguntas publicadas (o falla la carga), NO muestra nada:
// así no aparece un botcito que busca en una lista vacía.
//
// ⚠️ Archivo NUEVO (no confundir con asesorias-cursos.js ni asesorias-comun.js).
import { supabase } from './auth-siga.js?v=9';
import { esc, normalizar, botcitoSVG } from './asesorias-comun.js?v=1';

const ETIQUETAS = { concepto: 'Concepto', caso: 'Caso de ejemplo', metodo: 'Método' };

// Palabras que no ayudan a buscar: "¿qué es un ticket?" se busca como "ticket".
const VACIAS = new Set(('que es un una unos unas el la los las de del en y o a al se como cual '
    + 'cuales por para con lo su sus hay son ser me mi entre sobre').split(' '));

const LIMITE_INICIAL = { escritorio: 6, celular: 3 };
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

const esCelular = () => !!(window.matchMedia && window.matchMedia('(max-width: 860px)').matches);

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
            <p class="an-faq-estado" id="anFaqEstado" aria-live="polite"></p>
            <div class="an-faq-lista" id="anFaqLista"></div>
            <button type="button" class="an-link an-faq-mas" id="anFaqMas" hidden></button>
        </aside>`);

    const $ = (id) => document.getElementById(id);
    const st = { consulta: '', clave: '', verTodas: false, abiertas: new Set(), cerradas: new Set() };

    function pintar() {
        const { modo, lista } = buscarFaq(faqs, st.consulta);
        let visibles = lista;
        let hayMas = false;

        if (modo === 'todas') {
            const lim = esCelular() ? LIMITE_INICIAL.celular : LIMITE_INICIAL.escritorio;
            hayMas = lista.length > lim;
            if (!st.verTodas) visibles = lista.slice(0, lim);
        } else if (lista.length > LIMITE_BUSQUEDA) {
            visibles = lista.slice(0, LIMITE_BUSQUEDA);
        }

        // Con una sola coincidencia exacta, la respuesta sale abierta: un clic menos.
        const auto = modo === 'exacta' && lista.length === 1;
        $('anFaqLista').innerHTML = visibles.map((f) => itemHTML(
            f, st.abiertas.has(f.id) || (auto && !st.cerradas.has(f.id)),
        )).join('');

        const n = lista.length;
        $('anFaqEstado').textContent = {
            todas: `${n} ${n === 1 ? 'pregunta frecuente' : 'preguntas frecuentes'}`,
            exacta: lista.length > LIMITE_BUSQUEDA
                ? `Mostrando ${LIMITE_BUSQUEDA} de ${n} resultados. Escribe más palabras para afinar.`
                : `${n} ${n === 1 ? 'resultado' : 'resultados'}`,
            parecida: 'No encontré justo eso, pero quizás te sirva alguna de estas:',
            ninguna: 'No encontré nada con esas palabras. Prueba con otra, por ejemplo el nombre del tema.',
        }[modo];

        const mas = $('anFaqMas');
        mas.hidden = !hayMas;
        mas.textContent = st.verTodas ? 'Ver menos' : `Ver las ${n} preguntas`;
        $('anFaqX').hidden = !st.consulta;
    }

    const q = $('anFaqQ');
    q.addEventListener('input', () => {
        st.consulta = q.value;
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
    $('anFaqMas').addEventListener('click', () => { st.verTodas = !st.verTodas; pintar(); });

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

    pintar();
    return true;
}
