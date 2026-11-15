// js/sync-aviso-salida.js — Aviso de SIGA al cerrar sesión.
//
// Uso (en el botón "Cerrar sesión"):
//   const seguir = await salidaSegura(SigaEstado);
//   if (!seguir) return;            // el usuario decidió volver a SIGA
//   await cerrarSesion();
//
// Qué hace:
//  1. Sube lo pendiente. Si tarda más de un instante, muestra "Guardando tus cambios…".
//  2. Si todo llegó a la cuenta: limpia este navegador y deja cerrar sesión (sin preguntar nada).
//  3. Si quedan cambios sin subir: avisa y deja elegir "Reintentar subida", "Cerrar sesión igual"
//     o volver a SIGA (× / Escape).

const DEMORA_MOSTRAR_MS = 700;      // el cierre normal no parpadea: el aviso solo sale si la subida tarda

const ICONOS = {
    subir: '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    alerta: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    ok: '<polyline points="20 6 9 17 4 12"/>',
};

function cargarEstilos() {
    if (document.getElementById('siga-aviso-estilos')) return;
    const link = document.createElement('link');
    link.id = 'siga-aviso-estilos';
    link.rel = 'stylesheet';
    link.href = new URL('../css/sync-aviso.css', import.meta.url).href;
    document.head.append(link);
}

function el(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
}

function icono(nombre, ok = false) {
    const c = el('div', 'siga-aviso-icono' + (ok ? ' ok' : ''));
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre]}</svg>`;
    return c;
}

const textoPendientes = (n) => (n === 1
    ? '1 cambio todavía no llegó a tu cuenta. Si cierras sesión ahora, se perderá. Conéctate a internet y reintenta para no perderlo.'
    : `${n} cambios todavía no llegaron a tu cuenta. Si cierras sesión ahora, se perderán. Conéctate a internet y reintenta para no perderlos.`);

export async function salidaSegura(SigaEstado) {
    cargarEstilos();
    const previoFoco = document.activeElement;
    let capa = null;
    let alCerrarPorTeclado = null;

    function abrir() {
        if (capa) return;
        capa = el('div', 'siga-aviso');
        document.body.append(capa);
    }
    function pintar(contenido, { cerrable, foco } = {}) {
        abrir();
        const caja = el('div', 'siga-aviso-caja');
        caja.setAttribute('role', 'dialog');
        caja.setAttribute('aria-modal', 'true');
        const titulo = contenido.querySelector('.siga-aviso-titulo');
        if (titulo) { titulo.id = 'siga-aviso-titulo'; caja.setAttribute('aria-labelledby', 'siga-aviso-titulo'); }
        caja.append(...contenido.childNodes);
        if (cerrable) {
            const x = el('button', 'siga-aviso-x', '×');
            x.type = 'button'; x.setAttribute('aria-label', 'Volver a SIGA'); x.dataset.accion = 'volver';
            caja.prepend(x);
        }
        capa.replaceChildren(caja);
        const destino = foco ? caja.querySelector(foco) : null;
        if (destino) destino.focus();
    }
    function cerrar() {
        if (capa) { capa.remove(); capa = null; }
        document.removeEventListener('keydown', alCerrarPorTeclado, true);
        alCerrarPorTeclado = null;
        if (previoFoco && previoFoco.focus) { try { previoFoco.focus(); } catch { /* el botón pudo desaparecer */ } }
    }

    const vistaGuardando = () => {
        const c = el('div');
        c.append(icono('subir'), el('h3', 'siga-aviso-titulo', 'Guardando tus cambios…'),
            el('p', 'siga-aviso-texto', 'Estamos subiendo lo último a tu cuenta antes de cerrar sesión.'));
        const barra = el('div', 'siga-aviso-barra'); barra.append(el('i')); c.append(barra);
        return c;
    };
    const vistaTodoGuardado = () => {
        const c = el('div');
        c.append(icono('ok', true), el('h3', 'siga-aviso-titulo', 'Todo está guardado'),
            el('p', 'siga-aviso-texto', 'Tus datos están a salvo en tu cuenta. Limpiamos este navegador y cerramos tu sesión.'));
        return c;
    };
    const vistaPendientes = (n) => {
        const c = el('div');
        const reintentar = el('button', 'siga-aviso-btn principal', 'Reintentar subida'); reintentar.type = 'button'; reintentar.dataset.accion = 'reintentar';
        const igual = el('button', 'siga-aviso-btn peligro', 'Cerrar sesión igual'); igual.type = 'button'; igual.dataset.accion = 'igual';
        c.append(icono('alerta'), el('h3', 'siga-aviso-titulo', 'Tienes cambios sin guardar'), el('p', 'siga-aviso-texto', textoPendientes(n)), reintentar, igual);
        return c;
    };

    // Intento de subir: el aviso "Guardando…" solo aparece si tarda.
    async function intentar() {
        const reloj = setTimeout(() => pintar(vistaGuardando()), DEMORA_MOSTRAR_MS);
        try { return await SigaEstado.prepararSalida(); }
        finally { clearTimeout(reloj); }
    }

    let r = await intentar();
    if (r.ok) {
        if (capa) { pintar(vistaTodoGuardado()); await new Promise((f) => setTimeout(f, 800)); cerrar(); }
        return true;
    }

    // Quedan cambios sin subir: se pregunta.
    return new Promise((resolver) => {
        const decidir = (seguir) => { cerrar(); resolver(seguir); };
        function mostrarPendientes() {
            pintar(vistaPendientes(r.pendientes), { cerrable: true, foco: '[data-accion="reintentar"]' });
        }
        alCerrarPorTeclado = (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); decidir(false); return; }
            if (e.key === 'Tab' && capa) {                               // el foco se queda dentro del aviso
                const f = [...capa.querySelectorAll('button')];
                if (!f.length) return;
                const primero = f[0], ultimo = f[f.length - 1];
                if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
                else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
            }
        };
        document.addEventListener('keydown', alCerrarPorTeclado, true);
        abrir();
        capa.addEventListener('click', async (e) => {
            const b = e.target.closest('[data-accion]'); if (!b) return;
            const accion = b.dataset.accion;
            if (accion === 'volver') return decidir(false);
            if (accion === 'igual') { SigaEstado.vaciarLocal(); return decidir(true); }
            if (accion === 'reintentar') {
                pintar(vistaGuardando());
                r = await intentar();
                if (r.ok) { pintar(vistaTodoGuardado()); await new Promise((f) => setTimeout(f, 800)); return decidir(true); }
                mostrarPendientes();
            }
        });
        mostrarPendientes();
    });
}