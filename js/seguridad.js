// js/seguridad.js — Pestaña "Seguridad" de Mi cuenta (antes "Cuenta").
// ------------------------------------------------------------
// - "Tu sesión": correo, cómo ingresa el alumno y desde cuándo.
// - Contraseña según cómo entró:
//     solo Google  → tarjeta explicando que Google la maneja (sin formulario)
//     con correo   → formulario con medidor de fuerza y coincidencia en vivo
// - Zona de riesgo: eliminar la cuenta con confirmación "ELIMINAR" en la
//   misma tarjeta (ya no hay ventana emergente aparte). Se sigue usando la
//   función de Supabase `eliminar-cuenta`, sin cambios.
// ------------------------------------------------------------

import { supabase, establecerNuevaContrasena } from './auth-siga.js?v=9';

const MIN_CONTRASENA = 6;

const ICONOS = {
    candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    ojoTachado: '<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
};

function el(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
}

function svg(cuerpo, tam = 18) {
    return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cuerpo}</svg>`;
}

/** 0 = vacía … 4 = muy segura. */
function fuerza(p) {
    if (!p) return 0;
    let n = 0;
    if (p.length >= MIN_CONTRASENA) n++;
    if (p.length >= 10) n++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) n++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) n++;
    return Math.max(1, n);
}
const COLORES_FUERZA = ['#E24B4A', '#EF9F27', '#639922', '#1E9E5A'];
const TEXTOS_FUERZA = ['', 'Muy débil', 'Se puede mejorar', 'Buena', 'Muy segura'];

function proveedores(usuario) {
    const ids = (usuario.identities || []).map((i) => i.provider);
    const lista = ids.length ? ids : [usuario.app_metadata?.provider].filter(Boolean);
    return { google: lista.includes('google'), correo: lista.includes('email') };
}

function mesYAnio(iso) {
    try {
        return new Date(iso).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    } catch {
        return '';
    }
}

export function montarSeguridad(sesion) {
    const raiz = document.getElementById('seguridad');
    if (!raiz) return;

    const usuario = sesion.user;
    const { google, correo } = proveedores(usuario);
    // Si por algún motivo no sabemos el proveedor, mostramos el formulario:
    // es lo que hacía la sección antes.
    const puedeCambiarContrasena = correo || !google;

    const cabecera = el('div', 'seg-cabecera');
    cabecera.append(el('h2', 'seg-titulo', 'Seguridad'), el('p', 'seg-sub', 'Tu sesión, tu contraseña y tu cuenta.'));

    /* ---------- Tu sesión ---------- */
    const tarjetaSesion = el('div', 'seg-tarjeta');
    tarjetaSesion.append(el('h3', null, 'Tu sesión'));
    const lista = el('dl', 'seg-datos');
    const metodo = google && correo ? 'Google y correo' : google ? 'Google' : 'Correo y contraseña';
    [
        ['Correo', usuario.email ?? '—'],
        ['Ingresas con', metodo],
        ['Miembro desde', mesYAnio(usuario.created_at) || '—'],
    ].forEach(([k, v]) => {
        lista.append(el('dt', null, k), el('dd', null, v));
    });
    tarjetaSesion.append(lista);

    /* ---------- Contraseña ---------- */
    const zonaPass = el('div', 'seg-zona-pass');
    if (puedeCambiarContrasena) {
        zonaPass.append(formularioContrasena());
    } else {
        const t = el('div', 'seg-tarjeta seg-google');
        const icono = el('span', 'seg-google-icono');
        icono.innerHTML = svg(ICONOS.candado, 26);
        const texto = el('div');
        texto.append(
            el('h3', null, 'Tu contraseña la maneja Google'),
            el('p', null, 'Entraste con tu cuenta de Google, así que no necesitas una contraseña en SIGA. Si quieres cambiarla, hazlo desde tu cuenta de Google.'),
        );
        t.append(icono, texto);
        zonaPass.append(t);
    }

    const fila = el('div', 'seg-fila');
    fila.append(tarjetaSesion, zonaPass);

    raiz.replaceChildren(cabecera, fila, zonaRiesgo());

    /* ---------- Formulario de contraseña ---------- */
    function formularioContrasena() {
        const t = el('form', 'seg-tarjeta');
        t.noValidate = true;
        t.append(
            el('h3', null, 'Cambiar contraseña'),
            el('p', 'seg-ayuda', `Usa al menos ${MIN_CONTRASENA} caracteres. Mientras más larga, más segura.`),
        );

        function campo(etiqueta, autocompletar) {
            const cont = el('label', 'seg-campo');
            cont.append(el('span', null, etiqueta));
            const caja = el('div', 'seg-campo-caja');
            const input = el('input');
            input.type = 'password';
            input.autocomplete = autocompletar;
            const ojo = el('button', 'seg-ojo');
            ojo.type = 'button';
            ojo.setAttribute('aria-label', 'Mostrar contraseña');
            ojo.innerHTML = svg(ICONOS.ojo);
            ojo.addEventListener('click', () => {
                const ver = input.type === 'password';
                input.type = ver ? 'text' : 'password';
                ojo.innerHTML = svg(ver ? ICONOS.ojoTachado : ICONOS.ojo);
                ojo.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
            });
            caja.append(input, ojo);
            cont.append(caja);
            return { cont, input };
        }

        const nueva = campo('Nueva contraseña', 'new-password');
        const medidor = el('div', 'seg-medidor');
        for (let i = 0; i < 4; i++) medidor.append(el('i'));
        const textoFuerza = el('div', 'seg-mini');
        const repite = campo('Repite la nueva contraseña', 'new-password');
        const coincide = el('div', 'seg-mini');
        const mensaje = el('div', 'seg-mensaje');
        mensaje.setAttribute('role', 'status');
        const boton = el('button', 'seg-boton', 'Actualizar contraseña');
        boton.type = 'submit';
        boton.disabled = true;

        function revisar() {
            const p = nueva.input.value;
            const f = fuerza(p);
            [...medidor.children].forEach((barra, i) => {
                barra.style.background = i < f ? COLORES_FUERZA[f - 1] : '';
            });
            textoFuerza.textContent = TEXTOS_FUERZA[f];

            const r = repite.input.value;
            coincide.textContent = r ? (p === r ? '✓ Coinciden' : 'Todavía no coinciden') : '';
            coincide.classList.toggle('bien', Boolean(r) && p === r);
            boton.disabled = !(p.length >= MIN_CONTRASENA && p === r);
            mensaje.textContent = '';
        }
        nueva.input.addEventListener('input', revisar);
        repite.input.addEventListener('input', revisar);

        t.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (boton.disabled) return;
            boton.disabled = true;
            boton.textContent = 'Actualizando…';
            const { ok, error } = await establecerNuevaContrasena(nueva.input.value);
            boton.textContent = 'Actualizar contraseña';
            if (!ok) {
                console.error('Error al cambiar contraseña:', error);
                mensaje.textContent = 'No se pudo actualizar. Intenta de nuevo.';
                mensaje.classList.add('error');
                boton.disabled = false;
                return;
            }
            nueva.input.value = '';
            repite.input.value = '';
            revisar();
            mensaje.classList.remove('error');
            mensaje.textContent = '¡Contraseña actualizada!';
        });

        t.append(nueva.cont, medidor, textoFuerza, repite.cont, coincide, mensaje, boton);
        return t;
    }

    /* ---------- Zona de riesgo ---------- */
    function zonaRiesgo() {
        const caja = el('div', 'seg-riesgo');
        caja.append(
            el('h3', null, 'Zona de riesgo'),
            el('p', 'seg-ayuda', 'Eliminar tu cuenta borra tu carnet, tus preferencias y tus ideas de forma permanente. No se puede deshacer.'),
        );
        const abrir = el('button', 'seg-boton-peligro', 'Eliminar mi cuenta');
        abrir.type = 'button';

        const confirmar = el('div', 'seg-confirmar');
        confirmar.hidden = true;
        const etiqueta = el('label', 'seg-campo');
        const rotulo = el('span');
        rotulo.append('Escribe ', el('b', null, 'ELIMINAR'), ' para confirmar');
        const input = el('input');
        input.type = 'text';
        input.placeholder = 'ELIMINAR';
        input.autocomplete = 'off';
        etiqueta.append(rotulo, input);

        const mensaje = el('div', 'seg-mensaje error');
        mensaje.setAttribute('role', 'alert');
        const acciones = el('div', 'seg-acciones');
        const cancelar = el('button', 'seg-boton-suave', 'Cancelar');
        cancelar.type = 'button';
        const eliminar = el('button', 'seg-boton-eliminar', 'Sí, eliminar mi cuenta');
        eliminar.type = 'button';
        eliminar.disabled = true;
        acciones.append(cancelar, eliminar);
        confirmar.append(etiqueta, mensaje, acciones);

        abrir.addEventListener('click', () => {
            confirmar.hidden = false;
            abrir.hidden = true;
            input.focus();
        });
        function cerrar() {
            confirmar.hidden = true;
            abrir.hidden = false;
            input.value = '';
            eliminar.disabled = true;
            mensaje.textContent = '';
        }
        cancelar.addEventListener('click', cerrar);
        input.addEventListener('input', () => { eliminar.disabled = input.value.trim() !== 'ELIMINAR'; });

        eliminar.addEventListener('click', async () => {
            eliminar.disabled = true;
            mensaje.classList.remove('error');
            mensaje.textContent = 'Eliminando tu cuenta…';

            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke('eliminar-cuenta', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (error || data?.error) {
                console.error('Error eliminando cuenta:', error || data.error);
                mensaje.classList.add('error');
                mensaje.textContent = 'No se pudo eliminar la cuenta. Intenta de nuevo.';
                eliminar.disabled = false;
                return;
            }
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        });

        caja.append(abrir, confirmar);
        return caja;
    }
}
