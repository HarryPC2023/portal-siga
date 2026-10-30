// termometro-ui.js — Dibuja la franja "Cómo van tus cursos" (Termómetro de
// tendencia). Solo pinta lo que le dan; no calcula nada.
//   pintarTermometro(contenedor, items, alElegir)
//     items:     [{ id, nombre, sigla?, tendencia }]  (tendencia viene de analisis-academico.js)
//     alElegir:  función(id) que se llama al tocar un curso
// Estilos en css/termometro.css.
import { escaparHtml } from './progreso-carrera-ui.js';

// Subiendo y bajando: flecha curva. Estable: flecha recta hacia la derecha.
const FLECHA = {
    sube: '<path d="M5 19c1 -7 6 -9 12 -11"/><path d="M17 8l-5.5 4.5"/><path d="M17 8l-1.5 6.5"/>',
    baja: '<path d="M5 5c1 7 6 9 12 11"/><path d="M17 16l-5.5 -4.5"/><path d="M17 16l-1.5 -6.5"/>',
    estable: '<path d="M4 12h15"/><path d="M13 6l6 6l-6 6"/>',
};

function flecha(clave) {
    if (!FLECHA[clave]) return '';
    return `<svg class="termo__flecha" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FLECHA[clave]}</svg>`;
}

export function pintarTermometro(contenedor, items, alElegir) {
    if (!contenedor) return;
    const hayAlguna = items.some((it) => it.tendencia && it.tendencia.clave !== 'sin');
    if (!items.length) {
        contenedor.hidden = true;
        contenedor.innerHTML = '';
        return;
    }
    if (!hayAlguna) {
        // Todavía ningún curso llega a 3 evaluaciones con nota: se avisa cuándo aparecerá.
        contenedor.hidden = false;
        contenedor.onclick = null;
        contenedor.innerHTML = '<p class="termo__titulo">Cómo van tus cursos</p><p class="termo__vacio">Aquí aparecerá cómo van tus cursos cuando alguno tenga 3 evaluaciones con nota.</p>';
        return;
    }

    const chips = items.map((it) => {
        const t = it.tendencia;
        const sigla = it.sigla ? `<span class="termo__sigla">${escaparHtml(it.sigla)}</span>` : '';
        const simulado = t.simulada ? '<span class="termo__sim">Simulado</span>' : '';
        const etiqueta = `${it.nombre}: ${t.texto}${t.simulada ? ' (con notas simuladas)' : ''}`;
        return `<button type="button" class="termo__chip termo__chip--${t.clave}${t.simulada ? ' termo__chip--sim' : ''}"
                data-id="${escaparHtml(String(it.id))}" title="${escaparHtml(t.detalle)}" aria-label="${escaparHtml(etiqueta)}">
                <span class="termo__cuerpo"><span class="termo__nombre">${escaparHtml(it.nombre)}</span>${sigla}</span>
                <span class="termo__estado">${flecha(t.clave)}<span>${escaparHtml(t.texto)}</span>${simulado}</span>
            </button>`;
    }).join('');

    contenedor.hidden = false;
    contenedor.innerHTML = `<p class="termo__titulo">Cómo van tus cursos</p><div class="termo__lista">${chips}</div>`;
    contenedor.onclick = (e) => {
        const b = e.target.closest('.termo__chip');
        if (b && alElegir) alElegir(b.dataset.id);
    };
}

/* Lleva la vista a la tarjeta de ese curso y la resalta un momento. */
export function resaltarTarjeta(idTarjeta) {
    const tarjeta = document.getElementById(idTarjeta);
    if (!tarjeta) return;
    tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    tarjeta.classList.add('curso-card--resaltada');
    setTimeout(() => tarjeta.classList.remove('curso-card--resaltada'), 1800);
}
