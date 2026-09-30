// js/nucleo-flotante.js — Botón flotante "Materiales y opiniones" (Núcleo).
// Solo se carga en dashboard.html (Inicio). El HTML vive en ese archivo y
// los estilos en css/nucleo-flotante.css.
//
// Comportamiento:
//  - Al tocar el botón se abre/cierra la tarjeta. También se cierra con
//    Escape (devolviendo el foco al botón) o tocando fuera de ella.
//  - La primera vez de cada sesión, el botón "asoma" con texto unos
//    segundos y se encoge de nuevo. No lo hace si el usuario tiene
//    activado "reducir movimiento".
//  - Va en la esquina inferior izquierda, así que no choca con la
//    tarjetita de pregunta del carnet, "volver arriba" ni la firma.

(function () {
    'use strict';

    const raiz = document.getElementById('nucleoFlotante');
    const fab = document.getElementById('nucleoFab');
    const card = document.getElementById('nucleoCard');
    const cerrar = document.getElementById('nucleoCerrar');
    if (!raiz || !fab || !card) return;

    // ---------- Abrir / cerrar ----------
    function estaAbierta() {
        return !card.hidden;
    }

    function abrir() {
        fab.classList.remove('asoma');
        card.hidden = false;
        fab.setAttribute('aria-expanded', 'true');
    }

    function cerrarTarjeta(devolverFoco) {
        card.hidden = true;
        fab.setAttribute('aria-expanded', 'false');
        if (devolverFoco) fab.focus();
    }

    fab.addEventListener('click', () => {
        if (estaAbierta()) cerrarTarjeta(false);
        else abrir();
    });

    if (cerrar) cerrar.addEventListener('click', () => cerrarTarjeta(true));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && estaAbierta()) cerrarTarjeta(true);
    });

    document.addEventListener('click', (e) => {
        if (estaAbierta() && !raiz.contains(e.target)) cerrarTarjeta(false);
    });

    // ---------- Asoma una vez por sesión ----------
    const CLAVE_ASOMO = 'siga_nucleo_asomo';
    const reducirMovimiento = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let yaAsomo = false;
    try { yaAsomo = sessionStorage.getItem(CLAVE_ASOMO) === '1'; } catch (e) { /* sin sessionStorage: se asoma siempre */ }

    if (!reducirMovimiento && !yaAsomo) {
        setTimeout(() => {
            if (estaAbierta()) return;
            fab.classList.add('asoma');
            try { sessionStorage.setItem(CLAVE_ASOMO, '1'); } catch (e) { /* nada */ }
            setTimeout(() => fab.classList.remove('asoma'), 4500);
        }, 1200);
    }
})();
