// js/mis-propuestas.js — Pestaña "Mis propuestas" de Mi cuenta (Perfil).
// ------------------------------------------------------------
// Aquí la persona ve las ideas que propuso en «Proyectos Prácticos» (Desarrollo profesional), con su estado:
//   pendiente  → "En revisión"
//   publicada  → "Publicada"          (ya está en el catálogo)
//   rechazada  → "No se publicó por ahora"   (y el motivo, si Harry lo escribió)
// Puede RETIRAR una propuesta que siga en revisión (se borra y libera un lugar de las 3 permitidas) y
// ELIMINAR de su lista una rechazada. Eliminar solo la oculta de SU lista: Harry la sigue viendo en Admin.
// Una propuesta publicada no se puede quitar desde aquí.
//
// Tabla: proyectos_ideas (cada persona solo lee las suyas). Retirar y eliminar pasan por funciones de la base de
// datos (supabase/migrations/20261125240000_proyectos_ideas_mis_propuestas.sql).
// La pestaña NACE OCULTA y solo aparece si la persona tiene propuestas. Lo monta js/perfil-hub.js:
//     montarMisPropuestas(sesion)
//
// ⚠️ Archivo NUEVO.
import { supabase } from './auth-siga.js?v=9';
import { AREAS } from './proyectos-datos.js?v=5';

const MAX_PENDIENTES = 3;

const ESTADOS = {
    pendiente: { texto: 'En revisión', clase: 'revision', nota: 'Tu idea está en revisión. Cuando haya novedades, las verás aquí.' },
    publicada: { texto: 'Publicada', clase: 'publicada', nota: 'Tu idea ya forma parte del catálogo de Proyectos Prácticos. ¡Gracias por compartirla!' },
    rechazada: { texto: 'No se publicó por ahora', clase: 'rechazada', nota: 'No se publicó por ahora.' },
};

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const area = (id) => AREAS.find((a) => a.id === id);

function fechaCorta(iso) {
    try {
        return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Lima' }).replace(/\./g, '');
    } catch (e) {
        return '';
    }
}

export async function montarMisPropuestas(sesion) {
    const cont = document.getElementById('misPropuestas');
    const boton = document.querySelector('.perfil-hub-tab[data-tab="propuestas"]');
    if (!cont) return;

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/mis-propuestas.css?v=1';
    document.head.appendChild(css);

    let filas = [];
    let cargado = false;
    let confirmando = null;           // id de la propuesta que se está por retirar o eliminar
    const errores = new Map();        // id -> mensaje en esa tarjeta
    const resaltar = new Set();       // ids con novedad que se acaban de ver: llevan la etiqueta «Novedad» mientras la página siga abierta

    // ── Novedades: una propuesta que ya salió de «en revisión» (se publicó o no) y que la persona todavía no vio en
    //    ese estado. Lo último que vio se guarda en ESTE navegador (no viaja entre dispositivos). ──
    const LS_VISTO = `siga_mpr_visto_${sesion.user.id}`;
    const leerVisto = () => {
        try { return JSON.parse(localStorage.getItem(LS_VISTO) || '{}') || {}; } catch (e) { return {}; }
    };
    const guardarVisto = () => {
        try {
            const m = {};
            filas.forEach((f) => { m[f.id] = f.estado; });
            localStorage.setItem(LS_VISTO, JSON.stringify(m));
        } catch (e) { /* sin almacenamiento: simplemente no se recuerda */ }
    };
    const sinVer = () => {
        const visto = leerVisto();
        return filas.filter((f) => f.estado !== 'pendiente' && visto[f.id] !== f.estado);
    };
    const pestanaAbierta = () => {
        const panel = document.querySelector('.perfil-panel[data-panel="propuestas"]');
        return !!panel && !panel.hidden;
    };

    function pintarGlobito() {
        if (!boton) return;
        let g = boton.querySelector('.mpr-globito');
        const n = sinVer().length;
        if (!n) { if (g) g.remove(); return; }
        if (!g) {
            g = document.createElement('span');
            g.className = 'mpr-globito';
            boton.appendChild(g);
        }
        g.textContent = String(n);
        g.title = n === 1 ? 'Una propuesta tiene novedades' : `${n} propuestas tienen novedades`;
    }

    // Al abrir la pestaña: lo nuevo se resalta y se da por visto (el globito se va).
    function marcarVistas() {
        sinVer().forEach((f) => resaltar.add(f.id));
        guardarVisto();
        pintarGlobito();
    }

    function chips(f) {
        const a = area(f.area);
        const principal = `<span class="mpr-chip" style="background:${a ? a.f : '#eee'};color:${a ? a.c : '#333'}">${esc(a ? a.corto : f.area)}</span>`;
        const cruces = (f.areas2 || []).map((id) => {
            const x = area(id);
            return `<span class="mpr-chip mpr-chip-cruce">↔ ${esc(x ? x.corto : id)}</span>`;
        }).join('');
        return principal + cruces;
    }

    function tarjeta(f) {
        const est = ESTADOS[f.estado] || ESTADOS.pendiente;

        let cuerpo = `<p class="mpr-nota">${esc(est.nota)}</p>`;
        if (f.estado === 'rechazada' && f.motivo_rechazo) {
            cuerpo += `<div class="mpr-motivo"><b>Motivo:</b> ${esc(f.motivo_rechazo)}</div>`;
        }
        if (f.estado === 'publicada') {
            cuerpo += `<a class="mpr-btn mpr-btn-primario" href="proyectos-practicos.html?idea=${encodeURIComponent(f.id)}">Ver mi idea en el catálogo</a>`;
        }

        let acciones = '';
        if (f.estado === 'pendiente') {
            acciones = confirmando === f.id
                ? `<div class="mpr-conf">¿Retirar esta propuesta? Se borrará y liberarás un lugar de tus ${MAX_PENDIENTES}.
                        <button type="button" class="mpr-btn mpr-btn-peligro" data-mpr="si-retirar">Sí, retirar</button>
                        <button type="button" class="mpr-btn" data-mpr="no">Cancelar</button>
                   </div>`
                : '<button type="button" class="mpr-btn" data-mpr="retirar">Retirar propuesta</button>';
        } else if (f.estado === 'rechazada') {
            acciones = confirmando === f.id
                ? `<div class="mpr-conf">¿Eliminar esta propuesta de tu lista?
                        <button type="button" class="mpr-btn mpr-btn-peligro" data-mpr="si-quitar">Sí, eliminar</button>
                        <button type="button" class="mpr-btn" data-mpr="no">Cancelar</button>
                   </div>`
                : '<button type="button" class="mpr-btn mpr-btn-suave" data-mpr="quitar">Eliminar de mi lista</button>';
        }
        const err = errores.get(f.id);

        return `
            <article class="mpr-item" data-id="${esc(f.id)}">
                <div class="mpr-cab"><div class="mpr-chips">${chips(f)}</div><span class="mpr-lado">${resaltar.has(f.id) ? '<span class="mpr-nuevo">Novedad</span>' : ''}<span class="mpr-estado mpr-estado-${est.clase}">${esc(est.texto)}</span></span></div>
                <p class="mpr-titulo-idea">${esc(f.titulo)}</p>
                <p class="mpr-meta">Enviada el ${esc(fechaCorta(f.creado_en))}</p>
                ${cuerpo}
                ${acciones ? `<div class="mpr-acc">${acciones}</div>` : ''}
                ${err ? `<p class="mpr-err" role="alert">${esc(err)}</p>` : ''}
            </article>`;
    }

    function pintar() {
        let html = `
            <h2 class="mpr-titulo">Mis propuestas</h2>
            <p class="mpr-intro">Las ideas que propusiste en <b>Proyectos Prácticos</b>, con su estado. Cada idea se revisa antes de publicarse.</p>`;
        if (!cargado) {
            html += '<p class="mpr-vacio">Cargando…</p>';
        } else if (!filas.length) {
            html += `
                <div class="mpr-vacio">
                    <p>Todavía no has propuesto ninguna idea.</p>
                    <a class="mpr-btn mpr-btn-primario" href="proyectos-practicos.html">Ir a Proyectos Prácticos</a>
                </div>`;
        } else {
            const enRevision = filas.filter((f) => f.estado === 'pendiente').length;
            html += `<p class="mpr-cupo">Tienes <b>${enRevision}</b> de ${MAX_PENDIENTES} propuestas en revisión.</p>`;
            html += `<div class="mpr-lista">${filas.map(tarjeta).join('')}</div>`;
        }
        cont.innerHTML = html;
    }

    function mostrarPestana() {
        if (!boton) return;
        // Solo se muestra (nace oculta). Si borras la última, se queda hasta recargar: así no desaparece bajo tus pies.
        if (!filas.length || !boton.hidden) return;
        boton.hidden = false;
        // Si entró directo con #propuestas y la pestaña recién apareció, que se active.
        if (window.location.hash === '#propuestas') {
            window.dispatchEvent(new Event('hashchange'));
        }
    }

    async function cargar() {
        const { data, error } = await supabase
            .from('proyectos_ideas')
            .select('id, area, areas2, titulo, estado, motivo_rechazo, creado_en')
            .eq('autor_id', sesion.user.id)
            .eq('origen', 'usuario')
            .eq('oculta_autor', false)
            .order('creado_en', { ascending: false });
        if (error) {
            console.error('Mis propuestas:', error);
            if (!cargado) cont.innerHTML = '<h2 class="mpr-titulo">Mis propuestas</h2><p class="mpr-vacio">No pude cargar tus propuestas ahora. Vuelve a intentarlo en un momento.</p>';
            return;
        }
        filas = data || [];
        cargado = true;
        mostrarPestana();
        if (pestanaAbierta()) marcarVistas(); else pintarGlobito();
        pintar();
    }

    async function llamar(funcion, id, errorTexto, alExito) {
        const { data, error } = await supabase.rpc(funcion, { p_id: id });
        confirmando = null;
        if (error || data !== true) {
            if (error) console.error(funcion, error);
            errores.set(id, errorTexto);
            await cargar();
            return;
        }
        errores.delete(id);
        alExito(id);
        mostrarPestana();
        pintar();
    }

    cont.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-mpr]');
        if (!btn) return;
        const item = btn.closest('.mpr-item');
        if (!item) return;
        const id = item.dataset.id;
        const accion = btn.dataset.mpr;
        if (accion === 'retirar' || accion === 'quitar') { confirmando = id; pintar(); }
        else if (accion === 'no') { confirmando = null; pintar(); }
        else if (accion === 'si-retirar') {
            btn.disabled = true;
            llamar('proyectos_retirar_propuesta', id, 'No se pudo retirar: quizá ya la revisaron. Actualicé la lista.',
                (x) => { filas = filas.filter((f) => f.id !== x); });
        } else if (accion === 'si-quitar') {
            btn.disabled = true;
            llamar('proyectos_ocultar_propuesta', id, 'No se pudo eliminar. Actualicé la lista.',
                (x) => { filas = filas.filter((f) => f.id !== x); });
        }
    });

    // Al abrir la pestaña se trae lo más reciente (por si Harry la revisó mientras tanto).
    window.addEventListener('hashchange', () => { if (window.location.hash === '#propuestas') cargar(); });
    document.addEventListener('click', (e) => {
        if (e.target.closest('.perfil-hub-tab[data-tab="propuestas"]')) cargar();
    });

    pintar();
    await cargar();
}
