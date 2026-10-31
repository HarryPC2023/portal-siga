// termometro-ui.js — Dibuja la franja "Cómo van tus cursos" (Termómetro).
// Solo pinta lo que le dan; no calcula nada.
//   pintarTermometro(contenedor, items, alElegir)
//     items:     [{ id, nombre, sigla?, categoria, tendencia, ayuda?, estimado? }]
//       categoria: 'sube' | 'estable' | 'baja' | 'critico' | 'espera'  (ver categoriaTermometro en radar-calculo.js)
//     alElegir:  función(id) que se llama al tocar un curso
// Cada tarjeta usa UN solo color (borde, relleno suave del nombre e insignia).
// Estilos en css/termometro.css.
import { escaparHtml } from './progreso-carrera-ui.js';
import { TEXTO_CATEGORIA } from './radar-calculo.js';

// Flechas curvas (subiendo, bajando), flecha recta (estable) y reloj (esperando notas).
const ICONO = {
    sube: '<path d="M5 19c1 -7 6 -9 12 -11"/><path d="M17 8l-5.5 4.5"/><path d="M17 8l-1.5 6.5"/>',
    baja: '<path d="M5 5c1 7 6 9 12 11"/><path d="M17 16l-5.5 -4.5"/><path d="M17 16l-1.5 -6.5"/>',
    estable: '<path d="M4 12h15"/><path d="M13 6l6 6l-6 6"/>',
    espera: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
};

function svgIcono(clave, px) {
    return `<svg viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONO[clave]}</svg>`;
}

/* Señal de advertencia de siempre: triángulo amarillo, borde fino y la flecha-rayo que cae. */
export function svgTrianguloAlerta(px = 34) {
    return `<svg viewBox="0 0 32 32" width="${px}" height="${px}" aria-hidden="true"><path d="M16 4 L29.2 27 H2.8 Z" fill="#FFE100" stroke="#1b1233" stroke-width="1.5" stroke-linejoin="round"/><path d="M12.2 10.2 L16.6 11.2 L14.9 16.0 L18.7 15.0 L14.6 21.6 L13.2 21.0 L15.3 17.6 L11.6 18.5 L13.5 13.2 Z" fill="#1b1233"/><path d="M12.6 20.0 L16.8 21.0 L13.7 25.4 Z" fill="#1b1233"/></svg>`;
}

function insignia(categoria) {
    if (categoria === 'critico') return `<span class="termo__ins termo__ins--sola">${svgTrianguloAlerta(30)}</span>`;
    if (categoria === 'espera') return `<span class="termo__ins termo__ins--sola">${svgIcono('espera', 18)}</span>`;
    return `<span class="termo__ins">${svgIcono(categoria, 19)}</span>`;
}

export function pintarTermometro(contenedor, items, alElegir) {
    if (!contenedor) return;
    if (!items.length) {
        contenedor.hidden = true;
        contenedor.innerHTML = '';
        return;
    }
    if (items.every((it) => it.categoria === 'espera')) {
        // Ningún curso tiene todavía datos para opinar: se avisa cuándo aparecerá.
        contenedor.hidden = false;
        contenedor.onclick = null;
        contenedor.innerHTML = '<p class="termo__titulo">Cómo van tus cursos</p><p class="termo__vacio">Aquí aparecerá cómo van tus cursos cuando alguno tenga 3 evaluaciones con nota.</p>';
        return;
    }

    const chips = items.map((it) => {
        const t = it.tendencia;
        const cat = it.categoria;
        const sigla = it.sigla ? `<span class="termo__sigla">${escaparHtml(it.sigla)}</span>` : '';
        const simulado = t.simulada ? '<span class="termo__sim">Simulado</span>' : '';
        const alerta = cat === 'baja' || cat === 'critico';
        const estimado = alerta && it.estimado
            ? '<span class="termo__estimado" title="Calculado con una fórmula de prácticas estimada; puede cambiar cuando INTRALU publique la real">fórmula estimada</span>' : '';
        // La ayuda dice lo mismo que la caja "¿Qué nota necesito para aprobar?" de ese curso.
        const motivo = it.ayuda ? ` (${it.ayuda})` : '';
        const etiqueta = `${it.nombre}: ${TEXTO_CATEGORIA[cat]}${motivo}${t.simulada ? ' (con notas simuladas)' : ''}${estimado ? ' (fórmula estimada)' : ''}`;
        const ayuda = it.ayuda || t.detalle;
        return `<button type="button" class="termo__chip termo__chip--${cat}${t.simulada ? ' termo__chip--sim' : ''}"
                data-id="${escaparHtml(String(it.id))}" title="${escaparHtml(ayuda)}" aria-label="${escaparHtml(etiqueta)}">
                <span class="termo__cuerpo"><span class="termo__nombre">${escaparHtml(it.nombre)}</span>${sigla}</span>
                <span class="termo__estado">
                    <span class="termo__linea">${simulado}<span class="termo__principal">${insignia(cat)}<span class="termo__palabra">${TEXTO_CATEGORIA[cat]}</span></span></span>
                    ${estimado}
                </span>
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
