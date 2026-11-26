// js/admin-aviso-personal.js — Avisos PERSONALES desde Admin → Notificaciones.
//
// Qué hace:
//   1) En el formulario de "Nueva notificación" añade "¿A quién?": todos los
//      alumnos (como siempre) o UNA O VARIAS personas, elegidas desde la lista
//      completa de alumnos (tabla perfiles_usuario, que el admin ya puede leer),
//      con buscador por nombre, código UNI o carrera.
//   2) Para las personas elegidas: se guarda una fila por persona en
//      `notificaciones` con `destinatario`, tipo 'respuestas' (el canal personal
//      que cada alumno ya controla en Perfil → Avisos), canal 'solo_web' y un
//      enlace interno opcional.
//   3) Lista abajo los avisos personales enviados a mano (los automáticos —
//      respuestas a ideas, asesoría publicada, preguntas — llevan origen_id y
//      no aparecen aquí) con opción de borrarlos.
//
// Correo: si se activa "Enviar también por correo" en modo personas, cada fila
// nace con canal 'web_y_correo' y el trigger `notificar_por_correo` llama a la
// Edge Function `enviar-notificacion-email`, que manda UN correo a esa persona
// (respetando a quien apagó sus notificaciones) y lo registra en
// `notificaciones_correos`. El envío de admin.js para "Todos" queda tal cual;
// este módulo solo intercepta el envío cuando está elegida la opción de personas.
//
// También exporta decorarCorreos(): añade a cada notificación masiva con correo
// su avance ("250 enviados") y el botón "Enviar a los que faltan".
import { supabase } from './auth-siga.js?v=9';

const TIPO_PERSONAL = 'respuestas';
const TEXTO_CORREO_PERSONAS = 'Además de aparecer en su campanita, le llega un correo a cada persona elegida (no se envía a quien apagó sus notificaciones). Cada correo cuenta para el límite de 300 al día de Brevo.';
// Notificaciones creadas desde esta fecha ya quedan registradas en notificaciones_correos.
const CORREOS_CONTROLADOS_DESDE = new Date('2026-11-27T00:00:00-05:00');
const MAX_FILAS = 250; // filas dibujadas a la vez en la lista (el buscador afina el resto)
// Solo rutas internas de SIGA (ej. perfil.html#sugerencias): sin "http:", sin "//" ni "javascript:".
const ENLACE_VALIDO = /^(?![a-z][a-z0-9+.-]*:)(?!\/\/)[\w\-./?=&#%]+$/i;

const normalizar = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function iniciarAvisoPersonal({ confirmarAccion, escapeHtml, formatearFecha }) {
    const panel = document.getElementById('panelNotificaciones');
    const form = document.getElementById('formNotificacion');
    if (!panel || !form) return;

    const radios = form.querySelectorAll('input[name="notifDest"]');
    const bloque = document.getElementById('notifPersonaBloque');
    const tipoBloque = document.getElementById('notifTipoBloque');
    const inputBuscar = document.getElementById('notifPersonaBuscar');
    const cajaLista = document.getElementById('notifPersonaLista');
    const contador = document.getElementById('notifPersonaContador');
    const cajaChips = document.getElementById('notifPersonaChips');
    const btnVisibles = document.getElementById('notifPersonaVisibles');
    const btnQuitar = document.getElementById('notifPersonaQuitar');
    const inputEnlace = document.getElementById('notifEnlace');
    const inputTitulo = document.getElementById('notifTitulo');
    const inputMensaje = document.getElementById('notifMensaje');
    const inputCorreo = document.getElementById('notifPorCorreo');
    const ayudaCorreo = document.getElementById('notifCorreoAyuda');
    const textoCorreoTodos = ayudaCorreo ? ayudaCorreo.textContent : '';
    const btnPublicar = document.getElementById('btnPublicarNotif');
    const msg = document.getElementById('notifMsg');
    const lista = document.getElementById('listaNotifPersonales');

    let alumnos = [];                 // todos los perfiles, ordenados por nombre
    let cargados = false;
    let cargando = false;
    const elegidos = new Map();       // user_id → perfil (se conserva aunque cambie el filtro)

    const modoPersonas = () => form.querySelector('input[name="notifDest"]:checked')?.value === 'persona';
    const etiqueta = (p) => (p.nombre && p.nombre.trim()) || `Alumno ${String(p.user_id).slice(0, 8)}`;
    const detalleDe = (p) => [p.codigo_estudiante, p.carrera].filter(Boolean).join(' · ');
    const textoBoton = () => {
        const n = elegidos.size;
        return n > 1 ? `Enviar aviso a ${n} personas` : 'Enviar aviso personal';
    };

    /* ───────── Modo del formulario ───────── */
    function aplicarModo() {
        const personas = modoPersonas();
        bloque.hidden = !personas;
        tipoBloque.hidden = personas;
        if (ayudaCorreo) ayudaCorreo.textContent = personas ? TEXTO_CORREO_PERSONAS : textoCorreoTodos;
        btnPublicar.textContent = personas ? textoBoton() : 'Publicar notificación';
        if (personas && !cargados && !cargando) cargarAlumnos();
    }
    radios.forEach((r) => r.addEventListener('change', aplicarModo));

    /* ───────── Lista de alumnos ───────── */
    async function cargarAlumnos() {
        cargando = true;
        cajaLista.innerHTML = '<p class="anp-vacio">Cargando alumnos…</p>';
        const PAGINA = 1000;
        const todos = [];
        for (let desde = 0; ; desde += PAGINA) {
            const { data, error } = await supabase
                .from('perfiles_usuario')
                .select('user_id, nombre, codigo_estudiante, carrera')
                .order('user_id')
                .range(desde, desde + PAGINA - 1);
            if (error) {
                cargando = false;
                cajaLista.innerHTML = `<p class="anp-vacio">No se pudo cargar la lista: ${escapeHtml(error.message)}</p>`;
                return;
            }
            todos.push(...(data || []));
            if (!data || data.length < PAGINA) break;
        }
        alumnos = todos.sort((a, b) => etiqueta(a).localeCompare(etiqueta(b), 'es', { sensitivity: 'base' }));
        cargados = true;
        cargando = false;
        pintarLista();
    }

    function filtrados() {
        const q = normalizar(inputBuscar.value).trim();
        if (!q) return alumnos;
        const trozos = q.split(/\s+/);
        return alumnos.filter((p) => {
            const pajar = normalizar(`${etiqueta(p)} ${p.codigo_estudiante || ''} ${p.carrera || ''}`);
            return trozos.every((t) => pajar.includes(t));
        });
    }

    function pintarLista() {
        if (!cargados) return;
        const visibles = filtrados();
        const mostradas = visibles.slice(0, MAX_FILAS);

        if (!visibles.length) {
            cajaLista.innerHTML = '<p class="anp-vacio">Nadie coincide con esa búsqueda.</p>';
        } else {
            cajaLista.innerHTML = mostradas.map((p) => `
                <label class="anp-fila${elegidos.has(p.user_id) ? ' elegida' : ''}">
                    <input type="checkbox" data-id="${escapeHtml(p.user_id)}"${elegidos.has(p.user_id) ? ' checked' : ''}>
                    <div><strong>${escapeHtml(etiqueta(p))}</strong>${detalleDe(p) ? `<small>${escapeHtml(detalleDe(p))}</small>` : ''}</div>
                </label>`).join('')
                + (visibles.length > mostradas.length
                    ? `<p class="anp-vacio">Se muestran ${mostradas.length} de ${visibles.length}. Escribe en el buscador para afinar.</p>`
                    : '');
        }
        pintarResumen(visibles.length);
    }

    function pintarResumen(totalVisibles) {
        const total = alumnos.length;
        const n = elegidos.size;
        const visibles = totalVisibles ?? filtrados().length;
        contador.textContent = `${visibles} de ${total} alumnos · ${n} ${n === 1 ? 'elegido' : 'elegidos'}`;
        btnPublicar.textContent = modoPersonas() ? textoBoton() : btnPublicar.textContent;

        if (!n) { cajaChips.innerHTML = ''; return; }
        const lista12 = [...elegidos.values()].slice(0, 12);
        cajaChips.innerHTML = lista12.map((p) => `
            <span class="anp-chip">${escapeHtml(etiqueta(p))}
                <button type="button" class="anp-quitar" data-id="${escapeHtml(p.user_id)}" aria-label="Quitar a ${escapeHtml(etiqueta(p))}" title="Quitar">✕</button>
            </span>`).join('')
            + (n > 12 ? `<span class="anp-mas">+${n - 12} más</span>` : '');
    }

    cajaLista.addEventListener('change', (e) => {
        const casilla = e.target.closest('input[type="checkbox"][data-id]');
        if (!casilla) return;
        const perfil = alumnos.find((p) => p.user_id === casilla.dataset.id);
        if (!perfil) return;
        if (casilla.checked) elegidos.set(perfil.user_id, perfil); else elegidos.delete(perfil.user_id);
        casilla.closest('.anp-fila').classList.toggle('elegida', casilla.checked);
        pintarResumen();
    });

    cajaChips.addEventListener('click', (e) => {
        const quitar = e.target.closest('.anp-quitar');
        if (!quitar) return;
        elegidos.delete(quitar.dataset.id);
        pintarLista();
    });

    btnVisibles.addEventListener('click', () => {
        filtrados().forEach((p) => elegidos.set(p.user_id, p));
        pintarLista();
    });
    btnQuitar.addEventListener('click', () => { elegidos.clear(); pintarLista(); });
    inputBuscar.addEventListener('input', pintarLista);

    /* ───────── Envío (solo cuando está elegida la opción de personas) ─────────
       Escucha en fase de captura sobre el panel para adelantarse al envío
       de "Todos" de admin.js y cortarlo solo en este modo. */
    panel.addEventListener('submit', async (e) => {
        if (e.target !== form || !modoPersonas()) return;
        e.preventDefault();
        e.stopPropagation();

        const titulo = inputTitulo.value.trim();
        const mensaje = inputMensaje.value.trim();
        const enlace = inputEnlace.value.trim();
        const falla = (texto) => { msg.textContent = texto; msg.className = 'admin-msg error'; };

        if (!elegidos.size) return falla('Elige al menos una persona de la lista.');
        if (!titulo || !mensaje) return falla('Escribe el título y el mensaje.');
        if (enlace && !ENLACE_VALIDO.test(enlace)) {
            return falla('El enlace debe ser una página de SIGA, por ejemplo: perfil.html#sugerencias (sin http ni //).');
        }

        const destinatarios = [...elegidos.values()];
        const conCorreo = inputCorreo.checked;
        const canal = conCorreo ? 'web_y_correo' : 'solo_web';
        if (destinatarios.length > 1 || conCorreo) {
            const quienes = destinatarios.length === 1 ? etiqueta(destinatarios[0]) : `${destinatarios.length} personas`;
            const ok = await confirmarAccion(
                conCorreo
                    ? `Se enviará «${titulo}» a ${quienes}: les aparece en su campanita y además les llega un correo (${destinatarios.length} ${destinatarios.length === 1 ? 'correo' : 'correos'} del límite de 300 al día). El correo no se puede deshacer.`
                    : `Se enviará «${titulo}» a ${quienes}. Les aparecerá en su campanita; si te equivocas, podrás borrarlo desde la lista «Enviadas a personas».`,
                { titulo: '¿Enviar este aviso?', textoBoton: 'Sí, enviar' },
            );
            if (!ok) return;
        }

        btnPublicar.disabled = true;
        btnPublicar.textContent = 'Enviando…';
        msg.textContent = '';
        msg.className = 'admin-msg';

        const filas = destinatarios.map((p) => ({
            destinatario: p.user_id,
            tipo: TIPO_PERSONAL,
            titulo,
            mensaje,
            enlace: enlace || null,
            canal,
        }));
        const { error } = await supabase.from('notificaciones').insert(filas);

        btnPublicar.disabled = false;
        if (error) {
            btnPublicar.textContent = textoBoton();
            return falla('No se pudo enviar: ' + error.message);
        }

        const extra = conCorreo ? ' El correo sale en unos segundos.' : '';
        msg.textContent = destinatarios.length === 1
            ? `✅ Enviado a ${etiqueta(destinatarios[0])} — le aparece en su campanita.${extra}`
            : `✅ Enviado a ${destinatarios.length} personas — les aparece en su campanita.${extra}`;
        msg.className = 'admin-msg exito';

        form.reset();
        elegidos.clear();
        inputBuscar.value = '';
        pintarLista();
        aplicarModo();
        cargarLista();
    }, true);

    /* ───────── Lista de avisos personales enviados a mano ───────── */
    async function cargarLista() {
        const { data, error } = await supabase
            .from('notificaciones')
            .select('id, titulo, mensaje, enlace, creado_en, destinatario, canal')
            .not('destinatario', 'is', null)
            .is('origen_id', null)            // los automáticos llevan origen_id
            .order('creado_en', { ascending: false })
            .limit(50);

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
        const idsCorreo = data.filter((n) => n.canal === 'web_y_correo').map((n) => String(n.id));
        const estadoCorreo = new Map();
        if (idsCorreo.length) {
            const { data: regs } = await supabase.from('notificaciones_correos').select('notificacion_id, estado').in('notificacion_id', idsCorreo);
            (regs || []).forEach((r) => estadoCorreo.set(r.notificacion_id, r.estado));
        }
        const textoCorreo = (n) => {
            if (n.canal !== 'web_y_correo') return '';
            const e = estadoCorreo.get(String(n.id));
            return ` · ${e === 'enviado' ? '✉️ correo enviado' : e === 'error' ? '✉️ correo con error' : '✉️ correo pendiente o no enviado'}`;
        };
        const nombreDe = (id) => nombres.get(id) || `Alumno ${String(id).slice(0, 8)}`;

        lista.innerHTML = data.map((n) => `
            <div class="admin-item" data-id="${n.id}" data-nombre="${escapeHtml(nombreDe(n.destinatario))}">
                <div class="admin-item-cabecera">
                    <span class="admin-item-titulo">${escapeHtml(n.titulo)}</span>
                    <span class="admin-badge admin-badge-personal">👤 ${escapeHtml(nombreDe(n.destinatario))}</span>
                </div>
                <p class="admin-item-meta">${formatearFecha(n.creado_en)}${textoCorreo(n)}${n.enlace ? ` · enlace: ${escapeHtml(n.enlace)}` : ''}</p>
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

/* ============================================================
   Notificaciones MASIVAS con correo (lista "Todos"): muestra cuántos correos
   salieron y permite completar a los que faltan sin duplicar a nadie.
   Se llama al final de cargarNotificaciones() en admin.js.
   ============================================================ */
export async function decorarCorreos(cont, { confirmarAccion }) {
    const items = [...cont.querySelectorAll('.admin-item')].filter((i) => i.querySelector('.admin-badge-web_y_correo'));
    if (!items.length) return;

    const { data: filas } = await supabase.from('notificaciones').select('id, creado_en').in('id', items.map((i) => i.dataset.id));
    const creado = new Map((filas || []).map((f) => [String(f.id), new Date(f.creado_en)]));

    items.forEach((item) => decorarItem(item, creado.get(String(item.dataset.id))));

    async function decorarItem(item, fecha) {
        const id = String(item.dataset.id);
        const contar = (estado) => supabase.from('notificaciones_correos')
            .select('*', { count: 'exact', head: true }).eq('notificacion_id', id).eq('estado', estado);
        const [{ count: enviados }, { count: errores }] = await Promise.all([contar('enviado'), contar('error')]);

        item.querySelector('.anp-correos')?.remove();
        const fila = document.createElement('div');
        fila.className = 'anp-correos';

        const controlada = (enviados || 0) + (errores || 0) > 0 || (fecha && fecha >= CORREOS_CONTROLADOS_DESDE);
        if (!controlada) {
            fila.innerHTML = '<span class="anp-correos-texto">✉️ Enviada antes del control de correos: no hay registro de quién la recibió.</span>';
        } else {
            fila.innerHTML = `
                <span class="anp-correos-texto">✉️ ${enviados || 0} ${enviados === 1 ? 'correo enviado' : 'correos enviados'}${errores ? ` · ${errores} con error` : ''}</span>
                <button type="button" class="anp-mini anp-reenviar">Enviar a los que faltan</button>
                <span class="anp-correos-msg" aria-live="polite"></span>`;
            const boton = fila.querySelector('.anp-reenviar');
            const aviso = fila.querySelector('.anp-correos-msg');
            boton.addEventListener('click', async () => {
                const ok = await confirmarAccion(
                    'Se enviará el correo solo a quienes aún no lo recibieron (y no hayan apagado sus notificaciones), sin pasarse del límite diario de Brevo. Los correos enviados no se pueden deshacer.',
                    { titulo: '¿Enviar a los que faltan?', textoBoton: 'Sí, enviar' },
                );
                if (!ok) return;
                boton.disabled = true;
                aviso.textContent = 'Enviando…';
                const { data, error } = await supabase.functions.invoke('enviar-notificacion-email', { body: { accion: 'reenviar', id } });
                if (error || !data || data.error) {
                    boton.disabled = false;
                    aviso.textContent = 'No se pudo enviar: ' + ((data && data.error) || (error && error.message) || 'error desconocido');
                    return;
                }
                const partes = [`Enviados ahora: ${data.enviados || 0}`];
                if (data.pendientes) partes.push(`faltan ${data.pendientes}`);
                if (data.errores) partes.push(`${data.errores} con error`);
                if (data.cupoRestante !== undefined) partes.push(`cupo de hoy: ${data.cupoRestante} de ${data.limiteDiario}`);
                if (data.motivo) partes.push(data.motivo);
                const resumen = partes.join(' · ');
                await decorarItem(item, fecha);
                const nuevo = item.querySelector('.anp-correos-msg');
                if (nuevo) nuevo.textContent = resumen;
            });
        }
        const meta = item.querySelector('.admin-item-meta');
        (meta || item.firstElementChild).insertAdjacentElement('afterend', fila);
    }
}
