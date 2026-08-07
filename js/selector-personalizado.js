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

    return { trigger, texto, lista, valor, establecer };
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.select-custom-lista').forEach((l) => { l.hidden = true; });
        document.querySelectorAll('.select-custom-trigger').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    }
});