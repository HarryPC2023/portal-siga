// termometro-ui.js — Dibuja la franja "Cómo van tus cursos" (Termómetro de
// tendencia). Solo pinta lo que le dan; no calcula nada.
//   pintarTermometro(contenedor, items, alElegir)
//     items:     [{ id, nombre, tendencia }]  (tendencia viene de analisis-academico.js)
//     alElegir:  función(id) que se llama al tocar un curso
// Estilos en css/termometro.css.
import { escaparHtml } from './progreso-carrera-ui.js';

const SVG = {
    sube: '<path d="M3 17l6 -6l4 4l8 -8"/><path d="M14 7l7 0l0 7"/>',
    baja: '<path d="M3 7l6 6l4 -4l8 8"/><path d="M21 10l0 7l-7 0"/>',
    estable: '<path d="M5 12l14 0"/>',
};

function flecha(clave) {
    if (!SVG[clave]) return '';
    return `<svg class="termo__flecha" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[clave]}</svg>`;
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
        // Todavía ningún curso llega a 3 prácticas con nota: se avisa cuándo aparecerá.
        contenedor.hidden = false;
        contenedor.onclick = null;
        contenedor.innerHTML = '<p class="termo__titulo">Cómo van tus cursos</p><p class="termo__vacio">Aquí aparecerá cómo van tus cursos cuando alguno tenga 3 evaluaciones con nota.</p>';
        return;
    }

    const chips = items.map((it) => {
        const t = it.tendencia;
        const simulada = t.simulada ? '<span class="termo__sim">Simulado</span>' : '';
        const etiqueta = `${it.nombre}: ${t.texto}${t.simulada ? ' (con notas simuladas)' : ''}`;
        return `<button type="button" class="termo__chip termo__chip--${t.clave}${t.simulada ? ' termo__chip--sim' : ''}"
                data-id="${escaparHtml(String(it.id))}" title="${escaparHtml(t.detalle)}" aria-label="${escaparHtml(etiqueta)}">
                <span class="termo__nombre">${escaparHtml(it.nombre)}</span>
                <span class="termo__estado">${flecha(t.clave)}<span>${escaparHtml(t.texto)}</span>${simulada}</span>
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
