// js/selector-personalizado.js — Desplegable con estilo propio de SIGA,
// compartido entre módulos (Perfil, Intranotas, etc.) para no duplicar
// la misma lógica en cada uno. Es un script CLÁSICO a propósito (no
// type="module"), para que tanto código con import como con onclick=""
// puedan usarlo por igual.

function inicializarSelectPersonalizado({ triggerId, textoId, listaId, valorId, opciones, alElegir }) {
    const trigger = document.getElementById(triggerId);
    const texto = document.getElementById(textoId);
    const lista = document.getElementById(listaId);
    const valor = document.getElementById(valorId);

    if (!trigger || !lista || !valor) return null;

    if (opciones) {
        lista.innerHTML = opciones
            .map((o) => `<li role="option" data-value="${o.value}" tabindex="0">${o.label}</li>`)
            .join('');
    }

    // La lista se posiciona con position:fixed calculado en JS (en vez de
    // absolute respecto al padre) para que pueda "escapar" de cualquier
    // contenedor con su propio scroll (ej. el sidebar de Horarios) sin
    // que el navegador la recorte. Se recalcula cada vez que se abre,
    // por si el contenedor se desplazó desde la última vez.
    function posicionar() {
        const r = trigger.getBoundingClientRect();
        lista.style.position = 'fixed';
        lista.style.top = (r.bottom + 4) + 'px';
        lista.style.left = r.left + 'px';
        lista.style.width = r.width + 'px';
        lista.style.right = 'auto';
    }

    function cerrar() {
        lista.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
    }

    function establecer(v, etiqueta) {
        valor.value = v;
        texto.textContent = etiqueta;
    }

    trigger.addEventListener('click', () => {
        if (!lista.hidden) { cerrar(); return; }
        posicionar();
        lista.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
    });

    lista.querySelectorAll('li').forEach((opcion) => {
        const elegir = () => {
            establecer(opcion.dataset.value, opcion.textContent.trim());
            cerrar();
            if (alElegir) alElegir(opcion.dataset.value);
        };
        opcion.addEventListener('click', elegir);
        opcion.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); }
        });
    });

    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !lista.contains(e.target)) cerrar();
    });

    // Scroll fuera de la lista (el sidebar, la página, etc.) mientras está
    // abierta invalida la posición calculada — más simple y confiable
    // cerrarla que perseguir el scroll en tiempo real. Pero el scroll
    // DENTRO de la propia lista (cuando tiene más opciones de las que
    // caben) no debe cerrarla — si no, se cierra sola apenas intentas
    // desplazarte para ver las demás opciones.
    window.addEventListener('scroll', (e) => {
        if (!lista.hidden && !lista.contains(e.target)) cerrar();
    }, true);

    return { trigger, texto, lista, valor, establecer };
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.select-custom-lista').forEach((l) => { l.hidden = true; });
        document.querySelectorAll('.select-custom-trigger').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    }
});