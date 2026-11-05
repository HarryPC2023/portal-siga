// adn-herramientas.js — Hace clicables las herramientas que "Qué hacer" nombra en el periodo en curso
// (la tarjeta blanca junto a "Mira"): al tocarla se cierra la ventana del ADN y se abre esa herramienta.
// Solo se nombran secciones que se pueden abrir de una vez (Radar académico, Meta del curso): nunca algo que viva
// dentro de cada curso. Lo conecta notas.js, que es quien sabe abrir cada herramienta.
const ID_ESTILOS = 'adn-herramientas-estilos';
const CSS = `
button.adn-herramienta { font: inherit; font-size: 0.82rem; font-weight: 600; color: var(--adn-tinta, #1f1e1d); background: #fff; cursor: pointer; transition: box-shadow 0.15s ease; }
button.adn-herramienta:hover, button.adn-herramienta:focus-visible { box-shadow: 0 0 0 3px rgba(37, 64, 240, 0.22); outline: none; }
`;
let conectado = false;

/** herramientas: { 'Radar académico': () => ..., 'Meta del curso': () => ... } — el nombre es el que se lee en la tarjeta. */
export function conectarHerramientas(herramientas) {
    if (conectado) return;
    conectado = true;
    if (!document.getElementById(ID_ESTILOS)) {
        const estilo = document.createElement('style');
        estilo.id = ID_ESTILOS;
        estilo.textContent = CSS;
        document.head.appendChild(estilo);
    }
    document.addEventListener('click', (e) => {
        const tarjeta = e.target.closest && e.target.closest('.adn-herramienta');
        if (!tarjeta) return;
        const abrir = herramientas[tarjeta.textContent.trim()];
        if (typeof abrir !== 'function') return;
        const cerrar = document.getElementById('adn-cerrar');
        if (cerrar) cerrar.click();      // primero se cierra el ADN (y el foco vuelve a su botón)...
        abrir();                          // ...y luego se abre la herramienta
    });
}
