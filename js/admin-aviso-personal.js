// js/admin-aviso-personal.js — Avisos PERSONALES desde Admin → Notificaciones.
//
// Qué hace:
//   1) En el formulario de "Nueva notificación" añade "¿A quién?": todos los
//      alumnos (como siempre) o UNA persona, elegida con un buscador por
//      nombre o código UNI (tabla perfiles_usuario, que el admin ya puede leer).
//   2) Para una persona: se guarda en `notificaciones` con `destinatario`,
//      tipo 'respuestas' (el canal personal que cada alumno ya controla en
//      Perfil → Avisos), canal 'solo_web' y un enlace interno opcional.
//   3) Lista abajo los avisos personales enviados a mano (los automáticos —
//      respuestas a ideas, asesoría publicada, preguntas — llevan origen_id y
//      no aparecen aquí) con opción de borrarlos.
//
// El correo NO se usa en avisos personales: el correo masivo lo dispara un
// proceso aparte que envía a todos los alumnos activos. El envío de admin.js
// para "Todos" queda tal cual; este módulo solo intercepta el envío cuando
// está elegida "Una persona".
import { supabase } from './auth-siga.js?v=9';

const TIPO_PERSONAL = 'respuestas';
// Solo rutas internas de SIGA (ej. perfil.html#sugerencias): sin "http:", sin "//" ni "javascript:".
const ENLACE_VALIDO = /^(?![a-z][a-z0-9+.-]*:)(?!\/\/)[\w\-./?=&#%]+$/i;

export function iniciarAvisoPersonal({ confirmarAccion, escapeHtml, formatearFecha }) {
    const panel = document.getElementById('panelNotificaciones');
    const form = document.getElementById('formNotificacion');
    if (!panel || !form) return;

    const radios = form.querySelectorAll('input[name="notifDest"]');
    const bloque = document.getElementById('notifPersonaBloque');
    const tipoBloque = document.getElementById('notifTipoBloque');
    const inputBuscar = document.getElementById('notifPersonaBuscar');
    const cajaResultados = document.getElementById('notifPersonaResultados');
    const cajaElegida = document.getElementById('notifPersonaElegida');
    const inputEnlace = document.getElementById('notifEnlace');
    const inputTitulo = document.getElementById('notifTitulo');
    const inputMensaje = document.getElementById('notifMensaje');
    const inputCorreo = document.getElementById('notifPorCorreo');
    const toggleCorreo = form.querySelector('.admin-form-toggle');
    const btnPublicar = document.getElementById('btnPublicarNotif');
    const msg = document.getElementById('notifMsg');
    const lista = document.getElementById('listaNotifPersonales');

    let elegido = null;       // { user_id, nombre, codigo_estudiante, carrera }
    let encontrados = new Map();
    let temporizador = null;
    let ultimaBusqueda = 0;

    const modoPersona = () => form.querySelector('input[name="notifDest"]:checked')?.value === 'persona';
    const etiqueta = (p) => (p.nombre && p.nombre.trim()) || `Alumno ${String(p.user_id).slice(0, 8)}`;

    /* ───────── Modo del formulario ───────── */
    function aplicarModo() {
        const persona = modoPersona();
        bloque.hidden = !persona;
        tipoBloque.hidden = persona;
        inputCorreo.disabled = persona;
        if (persona) inputCorreo.checked = false;
        if (toggleCorreo) toggleCorreo.classList.toggle('anp-desactivado', persona);
        btnPublicar.textContent = persona ? 'Enviar aviso personal' : 'Publicar notificación';
    }
    radios.forEach((r) => r.addEventListener('change', aplicarModo));

    /* ───────── Buscador de alumno ───────── */
    function pintarElegida() {
        if (!elegido) {
            cajaElegida.hidden = true;
            cajaElegida.innerHTML = '';
            inputBuscar.hidden = false;
            return;
        }
        const detalle = [elegido.codigo_estudiante, elegido.carrera].filter(Boolean).join(' · ');
        cajaElegida.innerHTML = `
            <div class="anp-chip">
                <div><strong>${escapeHtml(etiqueta(elegido))}</strong>${detalle ? `<small>${escapeHtml(detalle)}</small>` : ''}</div>
                <button type="button" class="anp-quitar" aria-label="Quitar destinatario" title="Quitar">✕</button>
            </div>`;
        cajaElegida.hidden = false;
        inputBuscar.hidden = true;
        cajaResultados.hidden = true;
        cajaElegida.querySelector('.anp-quitar').addEventListener('click', () => {
            elegido = null;
            inputBuscar.value = '';
            pintarElegida();
            inputBuscar.focus();
        });
    }

    async function buscar(texto) {
        const q = texto.replace(/[,()%*\\]/g, ' ').replace(/\s+/g, ' ').trim();
        if (q.length < 2) { cajaResultados.hidden = true; return; }
        const turno = ++ultimaBusqueda;
        const columnas = 'user_id, nombre, codigo_estudiante, carrera';
        let { data, error } = await supabase.from('perfiles_usuario').select(columnas)
            .or(`nombre.ilike.%${q}%,codigo_estudiante.ilike.%${q}%`).limit(8);
        if (error) {
            // Plan B: solo por nombre (por si el código no admite búsqueda de texto).
            ({ data, error } = await supabase.from('perfiles_usuario').select(columnas).ilike('nombre', `%${q}%`).limit(8));
        }
        if (turno !== ultimaBusqueda) return; // llegó una búsqueda más nueva
        cajaResultados.hidden = false;
        if (error) {
            cajaResultados.innerHTML = `<p class="anp-vacio">No se pudo buscar: ${escapeHtml(error.message)}</p>`;
            return;
        }
        if (!data || !data.length) {
            cajaResultados.innerHTML = '<p class="anp-vacio">Nadie coincide con esa búsqueda.</p>';
            return;
        }
        encontrados = new Map(data.map((p) => [p.user_id, p]));
        cajaResultados.innerHTML = data.map((p) => {
            const detalle = [p.codigo_estudiante, p.carrera].filter(Boolean).join(' · ');
            return `<button type="button" class="anp-opcion" data-id="${escapeHtml(p.user_id)}">
                <strong>${escapeHtml(etiqueta(p))}</strong>${detalle ? `<small>${escapeHtml(detalle)}</small>` : ''}
            </button>`;
        }).join('');
        cajaResultados.querySelectorAll('.anp-opcion').forEach((btn) => {
            btn.addEventListener('click', () => {
                elegido = encontrados.get(btn.dataset.id) || null;
                pintarElegida();
            });
        });
    }

    inputBuscar.addEventListener('input', () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => buscar(inputBuscar.value), 250);
    });

    /* ───────── Envío (solo cuando está elegida "Una persona") ─────────
       Escucha en fase de captura sobre el panel para adelantarse al envío
       de "Todos" de admin.js y cortarlo solo en este modo. */
    panel.addEventListener('submit', async (e) => {
        if (e.target !== form || !modoPersona()) return;
        e.preventDefault();
        e.stopPropagation();

        const titulo = inputTitulo.value.trim();
        const mensaje = inputMensaje.value.trim();
        const enlace = inputEnlace.value.trim();
        const falla = (texto) => { msg.textContent = texto; msg.className = 'admin-msg error'; };

        if (!elegido) return falla('Elige primero a quién se lo envías.');
        if (!titulo || !mensaje) return falla('Escribe el título y el mensaje.');
        if (enlace && !ENLACE_VALIDO.test(enlace)) {
            return falla('El enlace debe ser una página de SIGA, por ejemplo: perfil.html#sugerencias (sin http ni //).');
        }

        btnPublicar.disabled = true;
        btnPublicar.textContent = 'Enviando…';
        msg.textContent = '';
        msg.className = 'admin-msg';

        const { error } = await supabase.from('notificaciones').insert({
            destinatario: elegido.user_id,
            tipo: TIPO_PERSONAL,
            titulo,
            mensaje,
            enlace: enlace || null,
            canal: 'solo_web',
        });

        btnPublicar.disabled = false;
        btnPublicar.textContent = 'Enviar aviso personal';

        if (error) return falla('No se pudo enviar: ' + error.message);

        msg.textContent = `✅ Enviado a ${etiqueta(elegido)} — le aparece en su campanita.`;
        msg.className = 'admin-msg exito';

        form.reset();
        elegido = null;
        inputBuscar.value = '';
        pintarElegida();
        aplicarModo();
        cargarLista();
    }, true);

    /* ───────── Lista de avisos personales enviados a mano ───────── */
    async function cargarLista() {
        const { data, error } = await supabase
            .from('notificaciones')
            .select('id, titulo, mensaje, enlace, creado_en, destinatario')
            .not('destinatario', 'is', null)
            .is('origen_id', null)            // los automáticos llevan origen_id
            .order('creado_en', { ascending: false })
            .limit(20);

        if (error) {
            lista.innerHTML = `<p class="admin-vacio">No se pudo cargar: ${escapeHtml(error.message)}</p>`;
            return;
        }
        if (!data || !data.length) {
            lista.innerHTML = '<p class="admin-vacio">Todavía no has enviado avisos personales.</p>';
            return;
        }

        const ids = [...new Set(data.map((n) => n.destinatario))];
        const { data: perfiles } = await supabase.from('perfiles_usuario').select('user_id, nombre').in('user_id', ids);
        const nombres = new Map((perfiles || []).map((p) => [p.user_id, etiqueta(p)]));
        const nombreDe = (id) => nombres.get(id) || `Alumno ${String(id).slice(0, 8)}`;

        lista.innerHTML = data.map((n) => `
            <div class="admin-item" data-id="${n.id}" data-nombre="${escapeHtml(nombreDe(n.destinatario))}">
                <div class="admin-item-cabecera">
                    <span class="admin-item-titulo">${escapeHtml(n.titulo)}</span>
                    <span class="admin-badge admin-badge-personal">👤 ${escapeHtml(nombreDe(n.destinatario))}</span>
                </div>
                <p class="admin-item-meta">${formatearFecha(n.creado_en)}${n.enlace ? ` · enlace: ${escapeHtml(n.enlace)}` : ''}</p>
                <p class="admin-item-texto">${escapeHtml(n.mensaje)}</p>
                <button type="button" class="admin-btn-eliminar" data-id="${n.id}" aria-label="Eliminar aviso personal" title="Eliminar de su campanita">🗑</button>
            </div>`).join('');

        lista.querySelectorAll('.admin-btn-eliminar').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const item = btn.closest('.admin-item');
                const ok = await confirmarAccion(
                    `Este aviso se borrará de la campanita de ${item.dataset.nombre}, aunque ya lo haya visto, y no podrás recuperarlo.`,
                    { titulo: '¿Eliminar este aviso personal?' },
                );
                if (!ok) return;
                btn.disabled = true;
                // .select() para notar si una política RLS bloqueó el borrado sin dar error.
                const { data: borradas, error: errBorrar } = await supabase.from('notificaciones').delete().eq('id', btn.dataset.id).select();
                if (errBorrar || !borradas || !borradas.length) {
                    btn.disabled = false;
                    alert('No se pudo eliminar: ' + (errBorrar ? errBorrar.message : 'revisa la política RLS de DELETE en "notificaciones".'));
                    return;
                }
                item.remove();
                if (!lista.querySelector('.admin-item')) cargarLista();
            });
        });
    }

    aplicarModo();
    cargarLista();
}
