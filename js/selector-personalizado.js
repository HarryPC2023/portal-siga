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

    // Ojo: si algún ancestro tiene `transform` (ej. .aa-panel, que lo
    // usa para deslizarse al abrir/cerrar), ese ancestro se convierte
    // en el "contenedor" real de cualquier position:fixed adentro —
    // ya no es la pantalla completa, aunque getBoundingClientRect()
    // siga devolviendo coordenadas relativas a la pantalla. Por eso se
    // resta la posición de ese ancestro antes de aplicar top/left.
    function ancestroConTransform(el) {
        let nodo = el.parentElement;
        while (nodo) {
            const estilo = getComputedStyle(nodo);
            if (estilo.transform && estilo.transform !== 'none') return nodo;
            nodo = nodo.parentElement;
        }
        return null;
    }

    /* La lista se posiciona con position:fixed calculado en JS (en vez de
       absolute respecto al padre) para que pueda "escapar" de cualquier
       contenedor con su propio scroll (ej. el sidebar de Horarios) sin
       que el navegador la recorte. Se recalcula cada vez que se abre,
       por si el contenedor se desplazó desde la última vez.

       Antes la lista siempre intentaba dibujarse con max-height:260px
       (fijo en el CSS) debajo del trigger, sin revisar si de verdad
       había 260px libres hasta el borde de la ventana. Si el trigger
       quedaba cerca del fondo de la pantalla (modal largo, celular,
       ventana chica), buena parte de la lista se renderizaba fuera
       del viewport — invisible e inalcanzable con scroll, aunque el
       contenido siguiera ahí (este era el bug de "no puedo bajar más
       allá de tal periodo" en el selector de sincronización con
       INTRALU). Ahora se calcula el espacio real disponible hacia
       abajo y hacia arriba, y:
         1) Se usa el lado con más espacio (por defecto abajo, como
            siempre, salvo que abajo quede muy apretado y arriba haya
            claramente más sitio).
         2) El alto máximo de la lista se ajusta a lo que realmente
            cabe en pantalla, hasta un tope cómodo — así, en pantallas
            grandes, alguien con muchos periodos cargados ve más
            opciones de una sola vez sin que el cuadro se salga de la
            ventana. */
    function posicionar() {
        const r = trigger.getBoundingClientRect();
        const margenViewport = 8;    // no pegar la lista al borde de la pantalla
        const gap = 4;               // separación entre el trigger y la lista
        const alturaMaxDeseada = 320; // tope cómodo, más generoso que el fijo de antes
        const alturaMinUtil = 140;   // por debajo de esto, mejor intentar abrir para el otro lado

        const espacioAbajo = window.innerHeight - r.bottom - gap - margenViewport;
        const espacioArriba = r.top - gap - margenViewport;

        const abrirArriba = espacioAbajo < alturaMinUtil && espacioArriba > espacioAbajo;
        const espacioDisponible = abrirArriba ? espacioArriba : espacioAbajo;
        const alturaFinal = Math.max(alturaMinUtil, Math.min(alturaMaxDeseada, espacioDisponible));

        let top = abrirArriba ? (r.top - gap - alturaFinal) : (r.bottom + gap);
        let left = r.left;

        const ancestro = ancestroConTransform(trigger);
        if (ancestro) {
            const ra = ancestro.getBoundingClientRect();
            top -= ra.top;
            left -= ra.left;
        }

        lista.style.position = 'fixed';
        lista.style.top = top + 'px';
        lista.style.left = left + 'px';
        lista.style.width = r.width + 'px';
        lista.style.right = 'auto';
        lista.style.maxHeight = alturaFinal + 'px';
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

    _listasSelectAbiertas.add({ trigger, lista, cerrar });

    return { trigger, texto, lista, valor, establecer };
}

// Registrados UNA SOLA VEZ (a nivel de módulo, no dentro de la función de
// arriba). Antes vivían dentro de inicializarSelectPersonalizado() y se
// volvían a registrar cada vez que se llamaba — inofensivo en páginas
// donde se inicializa una sola vez (Perfil, Horarios), pero en un modal
// que se abre y cierra muchas veces en la misma sesión (ej. el de sync
// con Intralú) se acumulan decenas de listeners sin que ninguno se
// limpie nunca. Con suficientes de scroll acumulados, el navegador se
// satura procesándolos todos en cada scroll y deja de repintar la lista
// a tiempo — el scrollTop cambia por dentro, pero la pantalla no se
// actualiza. Un solo listener global por evento, iterando sobre las
// listas realmente abiertas ahora mismo, no tiene ese problema.
const _listasSelectAbiertas = new Set();

window.addEventListener('scroll', (e) => {
    _listasSelectAbiertas.forEach(({ lista, cerrar }) => {
        if (!lista.hidden && !lista.contains(e.target)) cerrar();
    });
}, true);

document.addEventListener('click', (e) => {
    _listasSelectAbiertas.forEach(({ trigger, lista, cerrar }) => {
        if (!lista.hidden && !trigger.contains(e.target) && !lista.contains(e.target)) cerrar();
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.select-custom-lista').forEach((l) => { l.hidden = true; });
        document.querySelectorAll('.select-custom-trigger').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    }
});