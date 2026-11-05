// adn-estilos.js — Estilos del ADN académico. Se inyectan solos al abrir la sección (no hace falta enlazar ningún .css).
// Ventana central amplia, igual de integrada que Cursos electivos y Progreso de tu carrera.
// Colores: contenedores con borde azul (--adn-azul), tarjetas de cada periodo con el color de su perfil.

const ID_ESTILOS = 'adn-estilos';

const CSS = `
.chip-herramienta--adn { --chip-neon: #2979FF; color: #1A4FBF; }
.chip-herramienta--adn .adn-ico { flex: 0 0 auto; }

.adn-modal {
    --adn-azul: #2540F0;
    --adn-tinta: #1f1e1d;
    --adn-suave: #4b5563;
}
.adn-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); opacity: 0; pointer-events: none; transition: opacity 0.2s ease; z-index: 1000; }
.adn-overlay.adn-visible { opacity: 1; pointer-events: auto; }

.adn-modal {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -48%);
    width: min(1040px, 94vw); max-height: 90vh;
    background: #fff;
    border: 2px solid rgba(41, 121, 255, 0.55);
    border-radius: 20px;
    box-shadow: 0 0 0 4px rgba(41, 121, 255, 0.18), 0 16px 44px rgba(41, 121, 255, 0.4);
    opacity: 0; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 1001; display: flex; flex-direction: column; overflow: hidden;
    font-family: var(--font-datos, 'Poppins', 'Segoe UI', Arial, sans-serif);
    color: var(--adn-tinta);
}
.adn-modal.adn-visible { opacity: 1; transform: translate(-50%, -50%); pointer-events: auto; }

.adn-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 22px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
.adn-titulo-bloque { display: flex; align-items: center; gap: 12px; }
.adn-titulo { font-size: 1.25rem; font-weight: 600; color: var(--adn-tinta); }
.adn-subtitulo { font-size: 0.78rem; color: var(--adn-suave); margin-top: 1px; }
.adn-cerrar { width: 36px; height: 36px; border: 0; border-radius: 50%; background: transparent; color: var(--adn-suave); font-size: 1.1rem; cursor: pointer; }
.adn-cerrar:hover, .adn-cerrar:focus-visible { background: #f1f5f9; color: var(--adn-tinta); }
.adn-body { overflow-y: auto; padding: 14px 18px 18px; }
.adn-cargando, .adn-vacio { padding: 36px 12px; text-align: center; color: var(--adn-suave); font-size: 0.95rem; line-height: 1.5; }

.adn-marco { background: #F8FAFC; border: 1px solid #94A3B8; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.adn-caja { background: #fff; border: 2px solid var(--adn-azul); border-radius: 12px; }
.adn-ico { flex: 0 0 auto; display: block; }

/* ---- Perfil / estado del periodo ---- */
.adn-hero { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.adn-hero__fila { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
.adn-hero__icono { width: 56px; height: 56px; border-radius: 12px; background: var(--cbg, #EEF1F5); display: flex; align-items: center; justify-content: center; flex: none; animation: adn-flota 2.6s ease-in-out infinite; }
.adn-hero__texto { flex: 1; min-width: 230px; display: flex; flex-direction: column; gap: 3px; }
.adn-chico { font-size: 0.75rem; color: var(--adn-suave); }
.adn-hero__nombre { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.adn-hero__nombre b { font-size: 1.3rem; font-weight: 600; }
.adn-hero__nombre span { font-size: 0.82rem; color: var(--adn-suave); }
.adn-parrafo { font-size: 0.9rem; line-height: 1.5; margin-top: 3px; }
.adn-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.adn-chip { background: #F1F5F9; border-radius: 8px; padding: 7px 12px; display: flex; flex-direction: column; }
.adn-chip b { font-size: 1.1rem; font-weight: 600; color: var(--ctxt, var(--adn-azul)); }
.adn-chip span { font-size: 0.75rem; color: var(--adn-suave); }
.adn-mini { font: inherit; font-size: 0.75rem; padding: 4px 11px; border: 1px solid #cbd5e1; border-radius: 999px; background: #fff; color: var(--adn-tinta); cursor: pointer; }
.adn-mini:hover, .adn-mini:focus-visible { background: #f1f5f9; }
.adn-nota { font-size: 0.82rem; line-height: 1.5; color: var(--adn-suave); margin-top: 6px; }
.adn-vivo { border-style: dashed; border-color: #8E24AA; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
.adn-vivo b { font-size: 1.05rem; font-weight: 600; }

/* ---- Cadena ---- */
.adn-cadena { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.adn-cadena h3, .adn-destaco h3, .adn-dato h3 { margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--adn-tinta); }
.adn-tarjetas { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px; }
.adn-ciclo {
    flex: 0 0 auto; width: 104px; display: flex; flex-direction: column; gap: 6px; align-items: stretch;
    background: #fff; border: 2px solid var(--c); border-radius: 12px; padding: 7px 7px 8px; cursor: pointer; font-family: inherit; color: inherit;
}
.adn-ciclo:hover { background: color-mix(in srgb, var(--c) 6%, #fff); }
.adn-ciclo:focus-visible { outline: 3px solid color-mix(in srgb, var(--c) 45%, transparent); outline-offset: 2px; }
.adn-ciclo[aria-pressed="true"] { background: var(--cbg); box-shadow: 0 0 0 1px var(--c); }
.adn-ciclo--vivo { border-style: dashed; }
.adn-barras { display: flex; align-items: flex-end; gap: 3px; height: 80px; }
.adn-barras--muchas { gap: 2px; }
.adn-barras span { flex: 1; min-width: 3px; border-radius: 3px 3px 0 0; background: var(--c); }
.adn-barras span.adn-base { background: color-mix(in srgb, var(--c) 38%, #fff); }
.adn-barras span.adn-sin { height: 10px; background: transparent; border: 1px dashed #94A3B8; border-bottom: 0; }
.adn-ciclo__periodo { font-size: 0.75rem; font-weight: 600; text-align: center; }
.adn-ciclo__perfil { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 0.68rem; color: var(--adn-suave); white-space: nowrap; min-height: 20px; }

/* ---- Dato curioso y Lo que más destacó ---- */
.adn-par { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; align-items: start; }
.adn-dato, .adn-destaco { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.adn-card-titulo { display: flex; align-items: center; gap: 8px; }
.adn-dato__cuerpo { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.adn-dato__cifra { font-size: 1.65rem; font-weight: 600; color: var(--adn-azul); }
.adn-dato__texto { font-size: 0.9rem; line-height: 1.45; flex: 1; min-width: 150px; }
.adn-destaco__texto { font-size: 0.9rem; line-height: 1.5; }
.adn-porque { font-size: 0.82rem; line-height: 1.5; color: var(--adn-suave); border-top: 1px solid #E2E8F0; padding-top: 8px; }

/* ---- Qué hacer ---- */
.adn-quehacer { background: #EAF4FF; border: 2px solid var(--adn-azul); border-radius: 14px; padding: 12px 16px; display: flex; flex-direction: column; gap: 9px; }
.adn-quehacer__cab { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.adn-quehacer__cab b { font-size: 0.95rem; font-weight: 600; }
.adn-linea { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 0.9rem; line-height: 1.4; }
.adn-flecha { color: #1EB5E8; font-size: 1.05rem; line-height: 1; flex: none; }
.adn-herramienta { display: inline-block; background: #fff; border: 1.5px solid var(--adn-azul); border-radius: 10px; padding: 3px 12px; font-size: 0.82rem; font-weight: 600; }

@keyframes adn-flota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .adn-hero__icono { animation: none; } .adn-modal, .adn-overlay { transition: none; } }
@media (max-width: 560px) {
    .adn-header { padding: 10px 14px; }
    .adn-body { padding: 10px 10px 14px; }
}
`;

export function inyectarEstilos() {
    if (document.getElementById(ID_ESTILOS)) return;
    const estilo = document.createElement('style');
    estilo.id = ID_ESTILOS;
    estilo.textContent = CSS;
    document.head.appendChild(estilo);
}
