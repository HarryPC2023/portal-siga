// iconos-animados.js — Íconos animados de "Meta del curso" (diana roja y blanca con la flecha que se clava) y de
// "Progreso de tu carrera" (escalera de ciclos con un birrete arriba).
//
// Son EL MISMO dibujo en el botón del lateral y en la cabecera de su propia ventana (como ya pasa con el Radar,
// la Ruta académica y el reloj de Cursos electivos), y siempre se mueven suave, sin tener que tocarlos. Si la persona
// pidió "reducir movimiento" en su dispositivo, quedan quietos.
//
// Se carga con un <script type="module"> en notas.html. Es independiente: pone los íconos en el lateral y en la
// cabecera de Meta al cargar, y en la cabecera de Progreso cuando esa ventana se crea (la primera vez que se abre).
// También hace que el haz del Radar del lateral gire siempre (antes solo giraba al pasar el mouse).

const ID_ESTILOS = 'ia-estilos';

const CSS = `
.ia-ico { flex: 0 0 auto; display: block; }
.ia-k { animation-iteration-count: infinite; animation-timing-function: linear; transform-box: view-box; }
.ia-fl { animation-name: ia-fl; animation-duration: 3.4s; animation-delay: -1.2s; animation-timing-function: ease-in-out; }
.ia-on { animation-name: ia-on; animation-duration: 3.4s; animation-delay: -1.2s; transform-box: fill-box; transform-origin: center; }
.ia-pu { animation-name: ia-pu; animation-duration: .85s; animation-direction: alternate; animation-timing-function: ease-in-out; transform-box: fill-box; transform-origin: center; }
.ia-en { animation-name: ia-en; animation-duration: 4.4s; animation-delay: calc(var(--d, 0s) - 2.4s); }
.ia-sa { animation-name: ia-sa; animation-duration: 4.4s; animation-delay: -2.4s; animation-timing-function: ease-out; }
@keyframes ia-fl { 0% { transform: translate(-16px, -16px); opacity: 0; } 6% { opacity: 1; } 12% { transform: translate(0, 0); } 15% { transform: translate(1.8px, 1.8px); } 18% { transform: translate(-.9px, -.9px); } 21% { transform: translate(.5px, .5px); } 24% { transform: translate(0, 0); } 78% { transform: translate(0, 0); opacity: 1; } 90%, 100% { transform: translate(0, 0); opacity: 0; } }
@keyframes ia-on { 0%, 11% { opacity: 0; transform: scale(1); } 12% { opacity: .95; transform: scale(1); } 34%, 100% { opacity: 0; transform: scale(3.3); } }
@keyframes ia-pu { from { transform: scale(1); } to { transform: scale(1.28); } }
@keyframes ia-en { 0% { fill: #E9D5FF; } 8%, 72% { fill: #AC33FF; } 84%, 100% { fill: #E9D5FF; } }
@keyframes ia-sa { 0%, 30% { opacity: 0; transform: translateY(3px); } 36% { opacity: 1; transform: translateY(-5px); } 44%, 74% { opacity: 1; transform: translateY(0); } 84%, 100% { opacity: 0; transform: translateY(0); } }
.meta-panel__icono.ia-grande { width: 46px; height: 46px; background: none; font-size: 0; }
.pc-modal-titulo.ia-titulo { display: inline-flex; align-items: center; gap: 12px; }
.chip-herramienta--radar .rd-barrido { animation: rd-giro 7s linear infinite; }
@media (prefers-reduced-motion: reduce) {
    .ia-k { animation: none; }
    .ia-en { fill: #AC33FF; }
    .ia-on { opacity: 0; }
    .chip-herramienta--radar .rd-barrido { animation: none; }
}
`;

function inyectarEstilos() {
    if (document.getElementById(ID_ESTILOS)) return;
    const estilo = document.createElement('style');
    estilo.id = ID_ESTILOS;
    estilo.textContent = CSS;
    document.head.appendChild(estilo);
}

/* Diana tradicional (aros rojos y blancos). La flecha entra volando, se clava en el centro (tiembla un instante), la
   diana late con un anillo, la flecha se queda un momento y se repite; el centro late todo el tiempo para que
   siempre se vea movimiento. */
export function svgIconoMeta(px = 26) {
    return `<svg class="ia-ico" viewBox="0 0 48 48" width="${px}" height="${px}" aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill="#E53935" stroke="#B71C1C" stroke-width="1"/>
        <circle cx="24" cy="24" r="16.5" fill="#fff"/>
        <circle cx="24" cy="24" r="12" fill="#E53935"/>
        <circle cx="24" cy="24" r="7.5" fill="#fff"/>
        <circle class="ia-k ia-pu" cx="24" cy="24" r="3.6" fill="#E53935"/>
        <circle class="ia-k ia-on" cx="24" cy="24" r="5" fill="none" stroke="#00A3B3" stroke-width="2.2"/>
        <g class="ia-k ia-fl"><path d="M24 24L8.5 8.5" stroke="#14102a" stroke-width="2.6" stroke-linecap="round"/><path d="M8.5 8.5L4 9.3M8.5 8.5L9.3 4M12.5 12.5L8 13.3M12.5 12.5L13.3 8" stroke="#00A3B3" stroke-width="2" stroke-linecap="round"/></g>
    </svg>`;
}

/* Escalera de ciclos: los escalones se encienden de izquierda a derecha y, cuando están todos, el birrete aparece con
   un saltito. */
export function svgIconoProgreso(px = 26) {
    return `<svg class="ia-ico" viewBox="0 0 48 48" width="${px}" height="${px}" aria-hidden="true">
        <rect class="ia-k ia-en" style="--d:0s" x="5" y="34" width="8" height="8" rx="1.5" fill="#E9D5FF"/>
        <rect class="ia-k ia-en" style="--d:.35s" x="14.5" y="27" width="8" height="15" rx="1.5" fill="#E9D5FF"/>
        <rect class="ia-k ia-en" style="--d:.7s" x="24" y="20" width="8" height="22" rx="1.5" fill="#E9D5FF"/>
        <rect class="ia-k ia-en" style="--d:1.05s" x="33.5" y="13" width="8" height="29" rx="1.5" fill="#E9D5FF"/>
        <g class="ia-k ia-sa"><path d="M37.5 2.5L45.5 6L37.5 9.5L29.5 6Z" fill="#7A1FCC"/><path d="M33 8V10.5Q37.5 12.5 42 10.5V8" fill="#AC33FF"/><path d="M45 6.5V10" stroke="#FFB400" stroke-width="1.6" stroke-linecap="round"/></g>
    </svg>`;
}

/* Botón del lateral: ícono + nombre. Se reemplaza lo que haya (el emoji de antes o un ícono anterior). */
function ponerEnLateral(selector, svg, nombre) {
    const boton = document.querySelector(selector);
    if (!boton || boton.querySelector('.ia-ico')) return;
    boton.innerHTML = `${svg}<span>${nombre}</span>`;
}

function ponerEnCabeceraMeta() {
    const caja = document.querySelector('.meta-panel__icono');
    if (!caja || caja.querySelector('.ia-ico')) return;
    caja.classList.add('ia-grande');
    caja.innerHTML = svgIconoMeta(46);
}

function ponerEnCabeceraProgreso(raiz) {
    const titulo = raiz.querySelector ? raiz.querySelector('.pc-modal-titulo') : null;
    if (!titulo || titulo.querySelector('.ia-ico')) return;
    titulo.classList.add('ia-titulo');
    titulo.innerHTML = `${svgIconoProgreso(46)}<span>Progreso de tu carrera</span>`;
}

function iniciar() {
    inyectarEstilos();
    ponerEnLateral('.chip-herramienta--meta', svgIconoMeta(26), 'Meta del curso');
    ponerEnLateral('.chip-herramienta--progreso', svgIconoProgreso(26), 'Progreso de tu carrera');
    ponerEnCabeceraMeta();
    ponerEnCabeceraProgreso(document);
    // La ventana de Progreso se crea la primera vez que se abre: se le pone el ícono apenas aparece.
    new MutationObserver((cambios) => {
        for (const cambio of cambios) {
            for (const nodo of cambio.addedNodes) {
                if (nodo.nodeType === 1) ponerEnCabeceraProgreso(nodo);
            }
        }
    }).observe(document.body, { childList: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
