// js/ayuda.js — Pestaña "Ayuda" de Mi cuenta (antes Preguntas Frecuentes).
// ------------------------------------------------------------
// - Buscador que filtra mientras escribes (sin importar tildes).
// - Chips por módulo con su color (los mismos acentos laterales de antes).
// - Acordeón: una respuesta abierta a la vez, con enlace directo al módulo.
// - "¿Te sirvió?" 👍/👎 → tabla ayuda_votos (1 voto por pregunta y alumno).
// - Si no encuentra nada → lo lleva a la pestaña Ideas.
//
// Para agregar o editar preguntas: solo toca el arreglo PREGUNTAS.
// El `id` de cada pregunta NO debe cambiar nunca (los votos lo usan).
// ------------------------------------------------------------

import { supabase } from './auth-siga.js?v=9';

const CATEGORIAS = [
    { id: 'todo', nombre: 'Todo', color: '#6600CC' },
    { id: 'siga', nombre: 'SIGA', color: '#3C7CF8' },
    { id: 'asesorias', nombre: 'Asesorías', color: '#1E9E5A' },
    { id: 'horarios', nombre: 'Horarios', color: '#0FA89E' },
    { id: 'intranotas', nombre: 'Intranotas', color: '#7B3FC4' },
    { id: 'cuenta', nombre: 'Mi cuenta', color: '#C13F94' },
];

const ICONOS = {
    siga: '<path d="M3 10l9-5 9 5-9 5z"/><path d="M7 12.5V17c3 2 7 2 10 0v-4.5"/>',
    asesorias: '<path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/>',
    cuenta: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16c.6-1.4 1.5-2 2.5-2s1.9.6 2.5 2M14 10h4M14 13.5h3"/>',
    intranotas: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    horarios: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};

/* Respuestas en HTML (textos de Harry). enlace: [texto, ruta]. */
const PREGUNTAS = [
    {
        id: 'que-es-siga', cat: 'siga',
        pregunta: '¿Qué es SIGA?',
        respuesta: '<p>SIGA (Sistema Integrado de Gestión Académica) es una plataforma que reúne diferentes herramientas y recursos para ayudarte a organizar, planificar y gestionar tu ciclo universitario desde un solo lugar.</p>',
        enlace: ['Ir al inicio', 'dashboard.html']
    },
    {
        id: 'que-hay-en-asesorias', cat: 'asesorias',
        pregunta: '¿Qué encuentro en Asesorías?',
        respuesta: '<p>Asesorías reúne guías, resúmenes, monografías y material de apoyo preparado por estudiantes que ya llevaron el curso, para reforzar lo que ves en clase con explicaciones detalladas. Puedes filtrar por <strong>ciclo</strong> y por <strong>curso</strong>, y cada recurso se abre como página web o como PDF.</p>',
        enlace: ['Ir a Asesorías', 'asesorias.html'],
    },
    {
        id: 'proponer-asesoria', cat: 'asesorias',
        pregunta: '¿Puedo compartir mi propia asesoría?',
        respuesta: '<p>¡Sí! En Asesorías usa <strong>"Proponer una asesoría"</strong>: indica el título, el curso, el ciclo, un enlace (Drive, Notion, YouTube…) o el archivo (PDF, Word, PowerPoint o Excel, hasta 20 MB) y una descripción breve. Tu propuesta se revisa antes de publicarse, para que todo lo que encuentren tus compañeros sea de calidad.</p>',
        enlace: ['Ir a Asesorías', 'asesorias.html'],
    },
    {
        id: 'generar-horario', cat: 'horarios',
        pregunta: '¿Cómo puedo generar mi horario?',
        respuesta: '<p>Para comenzar, carga el archivo de cursos y horarios proporcionado por la universidad. Luego, busca y selecciona los cursos que deseas llevar por código o nombre y revisa tu selección antes de continuar. En el siguiente paso, elige las secciones o profesores de tu preferencia y establece la cantidad de cruces que estás dispuesto a aceptar. Al generar los horarios, SIGA analizará las combinaciones disponibles respetando las restricciones establecidas y evitando los cruces que no estén permitidos. Podrás comparar las alternativas encontradas, guardarlas en <strong>Favoritos</strong> y exportarlas como <strong>Excel o imagen</strong> listo para imprimirlas o consultarlas posteriormente.</p>',
        enlace: ['Ir a Horarios', 'horarios/index.html']
    },
    {
        id: 'que-es-intranotas', cat: 'intranotas',
        pregunta: '¿Qué puedo hacer en Intranotas?',
        respuesta: '<p>Intranotas te permite consultar y trabajar con tus notas de diferentes maneras. Puedes ingresar tus calificaciones manualmente. También puedes establecer una <strong>"Meta del Curso"</strong> para calcular qué calificaciones necesitas obtener en las evaluaciones restantes para alcanzar el promedio que deseas.</p>',
        enlace: ['Ir a Intranotas', 'intranotas/index.html']
    },
    {
        id: 'planchas-opiniones-nucleo', cat: 'siga',
        pregunta: '¿Dónde encuentro planchas y opiniones de docentes?',
        respuesta: '<p>En <strong>Inicio</strong> verás, abajo a la izquierda, un botón con el logo de Núcleo Centro Cultural. Al abrirlo puedes ir directo a sus <strong>planchas y materiales</strong> o a sus <strong>opiniones de docentes</strong>. Son recursos de Núcleo, no de SIGA, y se abren en otra pestaña.</p>',
        enlace: ['Ir al inicio', 'dashboard.html']
    },
    {
        id: 'carnet-siga', cat: 'cuenta',
        pregunta: '¿Para qué sirve mi carnet SIGA?',
        respuesta: '<p>Tu carnet reúne tu código, cómo quieres que te llamemos y tu carrera. Con esos datos SIGA se adapta a ti: por ejemplo, tu código ya aparece listo en Intranotas y tu carnet toma el color de tu facultad. Puedes completarlo o editarlo cuando quieras, sin apuro.</p><p>El periodo y la modalidad de ingreso son opcionales, y la modalidad nunca se muestra en tu carnet.</p>',
        enlace: ['Ver mi carnet', '#info']
    },
];

function el(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
}

function normalizar(t) {
    return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function textoPlano(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
}

function svg(cuerpo, tam = 18) {
    return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cuerpo}</svg>`;
}

export async function montarAyuda(sesion) {
    const raiz = document.getElementById('ayuda');
    if (!raiz) return;

    const colorDe = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.color]));
    const indice = PREGUNTAS.map((p) => normalizar(`${p.pregunta} ${textoPlano(p.respuesta)}`));
    let categoria = 'todo';
    let abierta = null;
    const votos = {}; // pregunta_id -> true/false (lo que ya votó este alumno)

    /* ---------- Estructura fija ---------- */
    const cabecera = el('div', 'ayuda-cabecera');
    cabecera.append(el('h2', 'ayuda-titulo', 'Ayuda'), el('p', 'ayuda-sub', 'Encuentra tu respuesta en segundos.'));

    const buscar = el('label', 'ayuda-buscar');
    buscar.innerHTML = svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>');
    const input = el('input');
    input.type = 'search';
    input.placeholder = 'Escribe tu duda, ej. anónima, horario, notas…';
    input.setAttribute('aria-label', 'Buscar en Ayuda');
    buscar.append(input);

    const chips = el('div', 'ayuda-chips');
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', 'Filtrar por módulo');
    CATEGORIAS.forEach((c) => {
        const b = el('button', 'ayuda-chip', c.nombre);
        b.type = 'button';
        b.dataset.cat = c.id;
        b.style.setProperty('--chip-color', c.color);
        b.addEventListener('click', () => { categoria = c.id; pintar(); });
        chips.append(b);
    });

    const lista = el('div', 'ayuda-lista');

    const cta = el('div', 'ayuda-cta');
    const irIdeas = el('button', 'ayuda-cta-btn', 'Cuéntanoslo');
    irIdeas.type = 'button';
    irIdeas.insertAdjacentHTML('beforeend', svg('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>', 16));
    irIdeas.addEventListener('click', () => { window.location.hash = 'sugerencias'; });
    cta.append(el('span', null, '¿No encontraste lo que buscabas?'), irIdeas);

    raiz.replaceChildren(cabecera, buscar, chips, lista, cta);
    input.addEventListener('input', pintar);

    /* ---------- Pintado de la lista ---------- */
    function pintar() {
        chips.querySelectorAll('.ayuda-chip').forEach((b) => {
            const activo = b.dataset.cat === categoria;
            b.classList.toggle('activo', activo);
            b.setAttribute('aria-pressed', String(activo));
        });

        const filtro = normalizar(input.value.trim());
        const visibles = PREGUNTAS.filter((p, i) => (categoria === 'todo' || p.cat === categoria)
            && (!filtro || indice[i].includes(filtro)));

        if (!visibles.length) {
            const vacio = el('div', 'ayuda-vacio');
            vacio.append(el('strong', null, 'No encontramos esa pregunta 🤔'),
                el('span', null, 'Cuéntanosla abajo y la agregamos.'));
            lista.replaceChildren(vacio);
            return;
        }

        lista.replaceChildren(...visibles.map(itemPregunta));
    }

    function itemPregunta(p) {
        const color = colorDe[p.cat];
        const item = el('div', 'ayuda-item');
        item.style.setProperty('--item-color', color);
        const estaAbierta = abierta === p.id;
        if (estaAbierta) item.classList.add('abierto');

        const idResp = `ayuda-resp-${p.id}`;
        const boton = el('button', 'ayuda-pregunta');
        boton.type = 'button';
        boton.setAttribute('aria-expanded', String(estaAbierta));
        boton.setAttribute('aria-controls', idResp);
        const icono = el('span', 'ayuda-icono');
        icono.innerHTML = svg(ICONOS[p.cat]);
        const mas = el('span', 'ayuda-mas');
        mas.innerHTML = svg('<path d="M12 5v14M5 12h14"/>', 16);
        boton.append(icono, el('span', 'ayuda-pregunta-texto', p.pregunta), mas);
        boton.addEventListener('click', () => {
            abierta = estaAbierta ? null : p.id;
            pintar();
            if (abierta) lista.querySelector('.ayuda-item.abierto .ayuda-pregunta')?.focus();
        });

        const resp = el('div', 'ayuda-respuesta');
        resp.id = idResp;
        const interior = el('div', 'ayuda-respuesta-interior');
        const cuerpo = el('div', 'ayuda-respuesta-texto');
        cuerpo.innerHTML = p.respuesta; // texto propio de SIGA, no del usuario
        interior.append(cuerpo);

        if (p.enlace) {
            const a = el('a', 'ayuda-enlace', `${p.enlace[0]} →`);
            a.href = p.enlace[1];
            interior.append(a);
        }
        interior.append(bloqueVoto(p.id));
        resp.append(interior);

        item.append(boton, resp);
        return item;
    }

    function bloqueVoto(id) {
        const caja = el('div', 'ayuda-voto');
        if (id in votos) {
            caja.append(el('span', 'ayuda-voto-gracias', votos[id]
                ? '¡Gracias! Nos alegra que te sirviera 💜'
                : 'Gracias por contarnos. La vamos a mejorar.'));
            return caja;
        }
        caja.append(el('span', null, '¿Te sirvió?'));
        [[true, '👍', 'Sí me sirvió'], [false, '👎', 'No me sirvió']].forEach(([util, emoji, etiqueta]) => {
            const b = el('button', 'ayuda-voto-btn', emoji);
            b.type = 'button';
            b.setAttribute('aria-label', etiqueta);
            b.addEventListener('click', () => votar(id, util));
            caja.append(b);
        });
        return caja;
    }

    async function votar(id, util) {
        votos[id] = util;
        pintar(); // respuesta inmediata; se guarda por detrás
        const { error } = await supabase.from('ayuda_votos').upsert(
            { user_id: sesion.user.id, pregunta_id: id, util },
            { onConflict: 'user_id,pregunta_id' },
        );
        if (error) console.error('Error guardando voto de Ayuda:', error);
    }

    pintar();

    /* Votos previos de este alumno (si la tabla aún no existe, no pasa nada). */
    const { data } = await supabase
        .from('ayuda_votos')
        .select('pregunta_id, util')
        .eq('user_id', sesion.user.id);
    (data || []).forEach((v) => { votos[v.pregunta_id] = v.util; });
    if (data?.length) pintar();
}