// js/asesorias-registro.js — Registro de uso de las asesorías web interactivas.
//
// Se carga DENTRO de cada asesoría (assets/asesorias/<curso>/<periodo>/<evaluacion>/index.html)
// con una sola línea <script type="module">. Anota tres acciones en la tabla
// "asesorias_eventos" de Supabase (solo el admin puede leerla):
//   · abrio     → la persona abrió la asesoría
//   · imprimio  → se abrió el diálogo de impresión / PDF (botón de la asesoría,
//                 botón del visor, Ctrl+P o pestaña nueva: todos disparan "beforeprint")
//   · excel     → descargó un Excel. La asesoría avisa con un evento propio:
//        window.dispatchEvent(new CustomEvent('siga:asesoria-evento',
//            { detail: { accion: 'excel', detalle: 'nombre-del-ejemplo' } }));
//
// El curso, el periodo y la evaluación salen solos de la ruta de la página, así que
// no hay nada que configurar por asesoría.
//
// Reglas de oro:
//   · Nunca rompe la asesoría: todo va en try/catch y si algo falla simplemente no anota.
//   · Sin sesión iniciada no se anota nada (no hay a quién atribuirlo).
//   · Evita repetidos: el mismo evento de la misma persona no se vuelve a anotar
//     dentro de una ventana corta (ver VENTANA_MS).
import { supabase } from './auth-siga.js?v=9';

const RUTA = location.pathname.match(/\/assets\/asesorias\/([a-z0-9-]+)\/(\d{4}-\d)\/([a-z0-9]+)\//);

// Cuánto tiempo se ignoran repeticiones del mismo evento (Safari dispara beforeprint
// varias veces; el visor recarga la asesoría en un iframe oculto para imprimir...).
const VENTANA_MS = {
    abrio: 30 * 60 * 1000,
    imprimio: 30 * 1000,
    excel: 10 * 1000,
};

if (RUTA) {
    const [, curso, periodo, evaluacion] = RUTA;
    // Lee el token de la sesión guardada en el navegador de forma SÍNCRONA. Así, si se imprime
    // desde el botón del visor (que carga la asesoría en un iframe oculto y llama a print()
    // apenas termina de cargar), el token ya está listo aunque getSession() aún no responda.
    function tokenGuardado() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!/^sb-.+-auth-token$/.test(k)) continue;
                const v = JSON.parse(localStorage.getItem(k));
                const ses = v && (v.access_token ? v : v.currentSession);
                if (ses && ses.access_token && (!ses.expires_at || ses.expires_at * 1000 > Date.now() + 10000)) return ses.access_token;
            }
        } catch (e) { /* sin almacenamiento o formato distinto: se usará getSession() */ }
        return null;
    }

    let token = tokenGuardado();

    const guardarSesion = (s) => { token = (s && s.access_token) || null; };

    // Se guarda el token ANTES de que haga falta: al imprimir, el navegador congela la
    // página casi al instante, y ahí ya no da tiempo de pedir la sesión con calma.
    supabase.auth.getSession()
        .then(({ data }) => { guardarSesion(data && data.session); registrar('abrio'); })
        .catch(() => { /* sin sesión: nada que anotar */ });
    supabase.auth.onAuthStateChange((_evento, sesion) => guardarSesion(sesion));

    function registrar(accion, detalle) {
        try {
            if (!token || !VENTANA_MS[accion]) return;

            const clave = `siga_reg_${curso}_${periodo}_${evaluacion}_${accion}_${detalle || ''}`;
            try {
                const ultimo = Number(localStorage.getItem(clave)) || 0;
                if (Date.now() - ultimo < VENTANA_MS[accion]) return;
                localStorage.setItem(clave, String(Date.now()));
            } catch (e) { /* sin almacenamiento: se anota igual */ }

            const base = supabase.supabaseUrl;
            const llave = supabase.supabaseKey;
            if (!base || !llave) return;

            // fetch con keepalive: la petición sigue su camino aunque se abra el diálogo
            // de impresión o la página se cierre enseguida. user_id lo pone la base sola.
            fetch(`${base}/rest/v1/asesorias_eventos`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    apikey: llave,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=minimal',
                },
                body: JSON.stringify({
                    curso,
                    periodo,
                    evaluacion,
                    accion,
                    detalle: detalle ? String(detalle).slice(0, 80) : null,
                }),
            }).catch(() => { /* sin red: se pierde ese registro y ya */ });
        } catch (e) { /* nunca romper la asesoría */ }
    }

    window.addEventListener('beforeprint', () => registrar('imprimio'));

    window.addEventListener('siga:asesoria-evento', (ev) => {
        const d = (ev && ev.detail) || {};
        registrar(d.accion, d.detalle);
    });
}
