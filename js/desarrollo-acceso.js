// js/desarrollo-acceso.js — Acceso temporal «solo el dueño» mientras Desarrollo profesional está en construcción.
// Cuando la sección esté lista: borra este archivo, quita sus 2 usos (cv-profesional.js y desarrollo-hub.js)
// y el atributo hidden de <main id="dpMain"> en las dos páginas.
import { supabase } from './auth-siga.js?v=9';

// ⚠️ Cambia esto por el correo con el que inicias sesión en SIGA (puedes poner más de uno).
const CORREOS_PERMITIDOS = ['harrypc2021@hotmail.com'];

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
