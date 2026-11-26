// js/desarrollo-acceso.js — Acceso temporal «solo el dueño» mientras Desarrollo profesional está en construcción.
// Cuando la sección esté lista: borra este archivo, quita sus usos (cv-profesional.js, desarrollo-hub.js y proyectos-practicos.js: accesoPermitido;
// mis-propuestas.js y menu-usuario.js: tieneAcceso, donde la condición pasa a ser siempre verdadera) y el atributo hidden de <main id="dpMain"> en las páginas.
import { supabase } from './auth-siga.js?v=9';

// ⚠️ Cambia esto por el correo con el que inicias sesión en SIGA (puedes poner más de uno).
const CORREOS_PERMITIDOS = ['harrypc2021@hotmail.com'];

// La misma comprobación, pero SIN redirigir ni tocar la página: sirve para decidir si se muestra algo
// (la pestaña «Mis propuestas» del perfil y su tarjeta en el menú del avatar).
export function tieneAcceso(correo) {
    return !!correo && CORREOS_PERMITIDOS.some((c) => c.toLowerCase() === String(correo).toLowerCase());
}

export async function accesoPermitido() {
    try {
        const { data } = await supabase.auth.getSession();
        const correo = data && data.session && data.session.user && data.session.user.email;
        if (correo && CORREOS_PERMITIDOS.some((c) => c.toLowerCase() === correo.toLowerCase())) {
            const main = document.getElementById('dpMain');
            if (main) main.hidden = false;
            return true;
        }
    } catch (e) { console.warn('desarrollo: no se pudo comprobar el acceso', e); }
    location.replace('dashboard.html');
    return false;
}
