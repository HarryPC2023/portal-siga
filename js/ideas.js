// js/ideas.js — Pestaña "Ideas" de Mi cuenta (antes Sugerencias).
// ------------------------------------------------------------
// Tres pasos cortos: tipo de idea → módulo → texto. Al enviar, un
// sobrecito vuela 💌 y la idea aparece en "Mis ideas" con su estado:
//   nueva → Recibida · en_revision → En revisión
//   implementada → ¡Hecha! · descartada → Por ahora no
// y, si Harry respondió desde Admin, su respuesta breve.
//
// Tabla: sugerencias (categoria, modulo, titulo, descripcion, estado,
// respuesta, respondido_en). El título se arma solo con el inicio de
// la idea para que el panel Admin siga mostrándolo igual.
// ------------------------------------------------------------

import { supabase } from './auth-siga.js?v=9';

const TIPOS = [
    { id: 'nueva_funcion', emoji: '✨', titulo: 'Nueva función', texto: 'Algo que SIGA aún no hace' },
    { id: 'mejora_funcion', emoji: '🔧', titulo: 'Mejorar algo', texto: 'Algo que existe y podría ser mejor' },
    { id: 'contenido', emoji: '📚', titulo: 'Contenido', texto: 'Materiales, cursos o datos que faltan' },
    { id: 'algo_falla', emoji: '🐞', titulo: 'Algo falla', texto: 'Un error o algo que no funciona' },
];

const MODULOS = [
    { id: 'intranotas', nombre: 'Intranotas' },
    { id: 'horarios', nombre: 'Horarios' },
    { id: 'opiniones', nombre: 'Opiniones' },
    { id: 'materiales', nombre: 'Materiales' },
    { id: 'asesorias', nombre: 'Asesorías' },
    { id: 'mi_cuenta', nombre: 'Mi cuenta' },
    { id: 'otro', nombre: 'Otro' },
];

const PISTAS = {
    nueva_funcion: ['Sería genial poder…', 'Me gustaría que SIGA me avise cuando…', 'Una idea: que se pueda…'],
    mejora_funcion: ['Cuando uso esta parte, me cuesta…', 'Sería más fácil si…', 'Mejoraría mucho si…'],
    contenido: ['Faltan materiales de…', 'No encuentro los datos de…', 'Sería útil agregar…'],
    algo_falla: ['Cuando hago clic en… pasa que…', 'Esperaba que… pero en cambio…', 'Desde el celular, cuando…'],
};

const ESTADOS = {
    nueva: { texto: 'Recibida', clase: 'recibida' },
    en_revision: { texto: 'En revisión', clase: 'revision' },
    implementada: { texto: '¡Hecha!', clase: 'hecha' },
    descartada: { texto: 'Por ahora no', clase: 'no' },
};

const FIRMA_RESPUESTA = 'Harry · creador de SIGA';
const MIN_CARACTERES = 10;
const MAX_CARACTERES = 500;

function el(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
}

function tituloDesde(texto) {
    const limpio = texto.replace(/\s+/g, ' ').trim();
    if (limpio.length <= 60) return limpio;
    const corte = limpio.slice(0, 60);
    return `${corte.slice(0, corte.lastIndexOf(' ') > 30 ? corte.lastIndexOf(' ') : 60)}…`;
}

function fechaCorta(iso) {
    try {
        return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    } catch {
        return '';
    }
}

export async function montarIdeas(sesion) {
    const raiz = document.getElementById('ideas');
    if (!raiz) return;

    let estado = { paso: 1, tipo: null, modulo: null, texto: '' };
    let misIdeas = [];

    const caja = el('div', 'ideas-caja');
    const lugarMis = el('div', 'ideas-mis');
    raiz.replaceChildren(caja, lugarMis);

    /* ---------- Pasos ---------- */

    function barra() {
        const b = el('div', 'ideas-pasos');
        b.setAttribute('aria-label', `Paso ${Math.min(estado.paso, 3)} de 3`);
        [1, 2, 3].forEach((i) => b.append(el('i', i <= estado.paso ? 'on' : '')));
        return b;
    }

    function volver(aPaso) {
        const v = el('button', 'ideas-volver', '← Volver');
        v.type = 'button';
        v.addEventListener('click', () => { estado.paso = aPaso; pintar(); });
        return v;
    }

    function resumen() {
        const r = el('p', 'ideas-resumen');
        r.append(`${estado.tipo.emoji} `, el('b', null, estado.tipo.titulo));
        if (estado.modulo) r.append(' · ', el('b', null, estado.modulo.nombre));
        return r;
    }

    function paso1() {
        const titulo = el('h2', 'ideas-titulo', '¿Qué mejorarías de SIGA?');
        const sub = el('p', 'ideas-sub', 'Tres pasos cortitos. Tu idea llega directo a quien hace SIGA.');
        const tipos = el('div', 'ideas-tipos');
        TIPOS.forEach((t) => {
            const b = el('button', 'ideas-tipo');
            b.type = 'button';
            b.append(el('span', 'ideas-tipo-emoji', t.emoji), el('span', 'ideas-tipo-titulo', t.titulo), el('span', 'ideas-tipo-texto', t.texto));
            b.addEventListener('click', () => { estado.tipo = t; estado.paso = 2; pintar(); });
            tipos.append(b);
        });
        caja.replaceChildren(titulo, sub, barra(), tipos);
    }

    function paso2() {
        const titulo = el('h2', 'ideas-titulo', '¿En qué parte de SIGA?');
        const mods = el('div', 'ideas-modulos');
        MODULOS.forEach((m) => {
            const b = el('button', `ideas-modulo${estado.modulo?.id === m.id ? ' activo' : ''}`, m.nombre);
            b.type = 'button';
            b.addEventListener('click', () => { estado.modulo = m; estado.paso = 3; pintar(); });
            mods.append(b);
        });
        caja.replaceChildren(volver(1), barra(), resumen(), titulo, el('p', 'ideas-sub', 'Elige una.'), mods);
        mods.querySelector('button')?.focus();
    }

    function paso3() {
        const titulo = el('h2', 'ideas-titulo', 'Cuéntanos tu idea');
        const sub = el('p', 'ideas-sub', 'Como se lo contarías a un amigo.');
        const pistas = PISTAS[estado.tipo.id];
        const area = el('textarea', 'ideas-texto');
        area.maxLength = MAX_CARACTERES;
        area.placeholder = pistas[Math.floor(Math.random() * pistas.length)];
        area.value = estado.texto;
        area.setAttribute('aria-label', 'Tu idea');

        const pie = el('div', 'ideas-pie');
        const contador = el('span', 'ideas-contador');
        const error = el('span', 'ideas-error');
        error.setAttribute('role', 'alert');
        const enviar = el('button', 'ideas-enviar', 'Enviar idea 🚀');
        enviar.type = 'button';
        const izq = el('div', 'ideas-pie-izq');
        izq.append(contador, error);
        pie.append(izq, enviar);

        function actualizar() {
            estado.texto = area.value;
            const n = area.value.trim().length;
            contador.textContent = `${area.value.length} / ${MAX_CARACTERES}`;
            enviar.disabled = n < MIN_CARACTERES;
            error.textContent = '';
        }
        area.addEventListener('input', actualizar);
        actualizar();

        enviar.addEventListener('click', async () => {
            const texto = area.value.trim();
            if (texto.length < MIN_CARACTERES) return;
            enviar.disabled = true;
            enviar.textContent = 'Enviando…';

            const { data, error: err } = await supabase
                .from('sugerencias')
                .insert({
                    user_id: sesion.user.id,
                    categoria: estado.tipo.id,
                    modulo: estado.modulo.id,
                    titulo: tituloDesde(texto),
                    descripcion: texto,
                })
                .select('id, categoria, modulo, titulo, estado, respuesta, creado_en')
                .single();

            if (err) {
                console.error('Error enviando idea:', err);
                enviar.disabled = false;
                enviar.textContent = 'Enviar idea 🚀';
                error.textContent = 'No se pudo enviar. Intenta de nuevo.';
                return;
            }

            misIdeas.unshift(data);
            estado = { paso: 4, tipo: null, modulo: null, texto: '' };
            pintar();
        });

        caja.replaceChildren(volver(2), barra(), resumen(), titulo, sub, area, pie);
        area.focus();
    }

    function enviada() {
        const sobre = el('div', 'ideas-sobre', '💌');
        sobre.setAttribute('aria-hidden', 'true');
        const otra = el('button', 'ideas-enviar', 'Enviar otra idea');
        otra.type = 'button';
        otra.addEventListener('click', () => { estado.paso = 1; pintar(); });
        const hecho = el('div', 'ideas-enviada');
        hecho.setAttribute('role', 'status');
        hecho.append(sobre, el('h2', 'ideas-titulo', '¡Idea enviada!'),
            el('p', 'ideas-sub', 'Gracias por ayudar a mejorar SIGA.'), otra);
        caja.replaceChildren(hecho);
    }

    /* ---------- Mis ideas ---------- */

    function pintarMisIdeas() {
        if (!misIdeas.length) { lugarMis.replaceChildren(); return; }
        const titulo = el('h3', 'ideas-mis-titulo', 'Mis ideas');
        const lista = el('div', 'ideas-mis-lista');
        misIdeas.forEach((i) => {
            const tipo = TIPOS.find((t) => t.id === i.categoria);
            const est = ESTADOS[i.estado] || ESTADOS.nueva;
            const fila = el('div', 'ideas-idea');
            const cab = el('div', 'ideas-idea-cab');
            cab.append(
                el('span', 'ideas-idea-emoji', tipo?.emoji || '💡'),
                el('span', 'ideas-idea-titulo', i.titulo),
                el('span', `ideas-estado ${est.clase}`, est.texto),
            );
            const modulo = MODULOS.find((m) => m.id === i.modulo);
            fila.append(cab, el('div', 'ideas-idea-meta', [modulo?.nombre, fechaCorta(i.creado_en)].filter(Boolean).join(' · ')));
            if (i.respuesta) {
                const resp = el('div', 'ideas-respuesta');
                resp.append(el('p', null, i.respuesta), el('span', 'ideas-respuesta-firma', `— ${FIRMA_RESPUESTA}`));
                fila.append(resp);
            }
            lista.append(fila);
        });
        lugarMis.replaceChildren(titulo, lista);
    }

    function pintar() {
        if (estado.paso === 1) paso1();
        else if (estado.paso === 2) paso2();
        else if (estado.paso === 3) paso3();
        else enviada();
        pintarMisIdeas();
    }

    pintar();

    const { data, error } = await supabase
        .from('sugerencias')
        .select('id, categoria, modulo, titulo, estado, respuesta, creado_en')
        .eq('user_id', sesion.user.id)
        .order('creado_en', { ascending: false });
    if (error) {
        console.error('Error cargando mis ideas:', error);
        return;
    }
    misIdeas = data || [];
    pintarMisIdeas();
}
