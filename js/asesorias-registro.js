// js/asesorias-registro.js — Registro de uso de las asesorías web interactivas.
//
// Se carga DENTRO de cada asesoría (assets/asesorias/<curso>/<periodo>/<evaluacion>/index.html)
// con una sola línea <script type="module">. Anota tres acciones en la tabla
// "asesorias_eventos" de Supabase (solo el admin puede leerla):
//   · abrio     → la persona abrió la asesoría
//   · imprimio  → se abrió el diálogo de impresión / PDF (todas las vías disparan "beforeprint")
//   · excel     → descargó un Excel. La asesoría avisa con un evento propio:
//        window.dispatchEvent(new CustomEvent('siga:asesoria-evento',
//            { detail: { accion: 'excel', detalle: 'nombre-del-ejemplo' } }));
//
// El curso, el periodo y la evaluación salen solos de la ruta de la página.
//
// Diseño liviano a propósito: NO importa ninguna librería ni descarga nada de internet.
// Lee la sesión que SIGA ya dejó guardada en el navegador y manda un solo fetch pequeño.
// Así no retrasa la carga de la asesoría ni el diálogo de impresión del visor (que carga la
// asesoría en un iframe oculto y llama a print() apenas termina de cargar).
//
// Reglas de oro:
//   · Nunca rompe la asesoría: todo va en try/catch y si algo falla simplemente no anota.
//   · Sin sesión iniciada no se anota nada (no hay a quién atribuirlo).
//   · Evita repetidos con una ventana corta (ver VENTANA_MS).
//
// ⚠️ Si algún día cambias de proyecto de Supabase, actualiza estos dos valores
// igual que en js/auth-siga.js (la clave "publishable" es pública por diseño).
const SUPABASE_URL = 'https://pinoriectlepnihjbxmt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2h0qDr857y1KfUfIP2x6DQ_eHz5S40q';

const RUTA = location.pathname.match(/\/assets\/asesorias\/([a-z0-9-]+)\/(\d{4}-\d)\/([a-z0-9]+)\//);

// Cuánto tiempo se ignoran repeticiones del mismo evento (Safari dispara beforeprint
// varias veces; el visor recarga la asesoría en un iframe oculto para imprimir...).
const VENTANA_MS = {
    abrio: 30 * 60 * 1000,
    imprimio: 30 * 1000,
    excel: 10 * 1000,
};

// Token de la sesión guardada por SIGA (lectura síncrona, siempre al día porque se lee
// en cada registro). Si venció o no existe, devuelve null y no se anota nada.
function tokenGuardado() {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!/^sb-.+-auth-token$/.test(k)) continue;
            const v = JSON.parse(localStorage.getItem(k));
            const ses = v && (v.access_token ? v : v.currentSession);
            if (ses && ses.access_token && (!ses.expires_at || ses.expires_at * 1000 > Date.now() + 10000)) return ses.access_token;
        }
    } catch (e) { /* sin almacenamiento o formato distinto */ }
    return null;
}

if (RUTA) {
    const [, curso, periodo, evaluacion] = RUTA;

    function registrar(accion, detalle) {
        try {
            if (!VENTANA_MS[accion]) return;
            const token = tokenGuardado();
            if (!token) return;

            const clave = `siga_reg_${curso}_${periodo}_${evaluacion}_${accion}_${detalle || ''}`;
            try {
                const ultimo = Number(localStorage.getItem(clave)) || 0;
                if (Date.now() - ultimo < VENTANA_MS[accion]) return;
                localStorage.setItem(clave, String(Date.now()));
            } catch (e) { /* sin almacenamiento: se anota igual */ }

            // fetch con keepalive: la petición sigue su camino aunque se abra el diálogo
            // de impresión o la página se cierre enseguida. user_id lo pone la base sola.
            fetch(`${SUPABASE_URL}/rest/v1/asesorias_eventos`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    apikey: SUPABASE_KEY,
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

    registrar('abrio');
}
