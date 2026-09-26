// login-multifacultad.js — Pantalla de sync del Intranotas nuevo (SIGA
// producción, carpeta intranotas/). Flujo por CÓDIGO+CONTRASEÑA,
// sin extensión ni bookmarklet: el alumno escribe su código y contraseña
// de INTRALU aquí mismo; SIGA los manda una sola vez al backend propio
// (scraping_intralu.py en Render), que hace login con Playwright +
// stealth (pasa el reCAPTCHA) y trae notas+fórmulas por HTTP directo.
// El backend responde al instante con un job_id y el trabajo real corre
// en un hilo aparte — el frontend hace polling hasta que termina. Ni el
// código ni la contraseña de INTRALU se guardan en ningún lado
// ("Recordar mi contraseña" está DESACTIVADO desde sep 2026).
//
// Adaptado del sandbox siga-multifacultad: usa la sesión REAL compartida
// de SIGA (gate.js ya la garantiza antes de mostrar esta página), no la
// sesión anónima de prueba que tenía el sandbox.
import { supabase, obtenerSesion } from '../js/auth-siga.js?v=9';
import { FACULTADES } from './facultades-datos.js';
import { parsearAvanceCurricular } from './avance-curricular-parser.js';
import { guardarAvanceCurricular } from './avance-curricular-guardar.js';
import * as pdfjsLib from '../vendor-pdfjs/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    new URL('../vendor-pdfjs/pdf.worker.min.mjs', import.meta.url).href;

// URL confirmada en vivo con Harry — servicio Render de produccion
// "actualizar-intranotas" (carpeta actualizar-intranotas/ en portal-siga).
const BACKEND_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:8000'
    : 'https://actualizar-intranotas.onrender.com';
const BACKEND_SYNC_URL = `${BACKEND_BASE_URL}/api/sync-intralu`;

// Cada cuántos ms se pregunta al backend cómo va, y cuánto se espera como
// máximo antes de rendirse. Desde sep 2026 se sincroniza TODO el historial
// de una vez y puede haber fila de espera, así que el tope es más amplio
// (el backend mismo corta la fila a los 5 min con un mensaje claro).
const INTERVALO_POLLING_MS = 2000;
const TIMEOUT_POLLING_MS = 10 * 60 * 1000;

document.addEventListener('DOMContentLoaded', async () => {
    prepararOjoPassword();

    // 1. Sesión real de SIGA — gate.js (cargado en index.html) ya la
    // garantiza antes de mostrar esta página; si por algún motivo no
    // hubiera sesión, gate.js ya habrá redirigido al login general de
    // SIGA antes de que este código llegue a correr.
    const sesion = await obtenerSesion();
    if (!sesion) return;
    const user = sesion.user;

    // 1.5 Si ya tiene al menos una nota sincronizada de antes, lo mandamos
    // directo a "Mis notas" en vez de hacerlo pasar por esta pantalla
    // cada vez — igual que hacía la Intranotas vieja. El link "←
    // Sincronizar otro periodo" de notas.html agrega ?sincronizar=1
    // para saltarse este salto cuando sí quiere volver aquí a propósito.
    const vieneAsincronizarAProposito = new URLSearchParams(window.location.search).has('sincronizar');
    if (!vieneAsincronizarAProposito) {
        const { count } = await supabase
            .from('notas_curso')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);
        if (count && count > 0) {
            window.location.href = 'notas.html';
            return;
        }
    }

    // 2. ¿Ya sabemos su periodo de ingreso? (dato informativo del perfil,
    // no tiene relación con qué periodo se sincroniza ahora). Facultad y
    // carrera YA NO se piden ni se guardan acá — se autodetectan del
    // Avance Curricular apenas termina la primera sincronización (ver
    // guardarPerfilAcademicoDesdeAvance, más abajo).
    const { data: perfil } = await supabase
        .from('perfiles_usuario')
        .select('periodo_ingreso, codigo_estudiante')
        .eq('user_id', user.id)
        .maybeSingle();

    // DESACTIVADO (sep 2026) — precargar el código de estudiante. Se
    // decidió que no valía la pena tener una diferencia de
    // comportamiento entre el código (se recordaba) y la contraseña
    // (nunca se recuerda) — mejor consistente: el alumno siempre
    // escribe los dos, sin ninguna excepción que explicar.

    if (perfil?.periodo_ingreso) {
        mostrarBloqueSync(user.id, perfil.periodo_ingreso);
    } else if (perfil?.codigo_estudiante) {
        const derivado = await derivarYGuardarPeriodoDesdeCodigo(user.id, perfil.codigo_estudiante);
        if (derivado) {
            mostrarBloqueSync(user.id, derivado);
        } else {
            mostrarBloquePeriodoIngreso(user.id);
        }
    } else {
        mostrarBloquePeriodoIngreso(user.id);
    }
});

/* El código UNI empieza con el año de ingreso (ej. "20231059E" -> 2023).
   Si ya está guardado, no hace falta preguntar el periodo de ingreso —
   se deriva y se guarda solo. Si el código no calza, devuelve null. */
async function derivarYGuardarPeriodoDesdeCodigo(userId, codigoEstudiante) {
    const anio = parseInt(String(codigoEstudiante).trim().slice(0, 4), 10);
    const anioValido = !Number.isNaN(anio) && anio >= 2000 && anio <= new Date().getFullYear();
    if (!anioValido) return null;

    const periodoDerivado = `${anio}-1`;
    await supabase.from('perfiles_usuario').upsert({
        user_id: userId,
        periodo_ingreso: periodoDerivado,
    }, { onConflict: 'user_id' });
    return periodoDerivado;
}

/* Guarda facultad/carrera en perfiles_usuario usando el resultado YA
   calculado por guardarAvanceCurricular() (ver avance-curricular-
   guardar.js) — nunca una elección manual. Solo se llama cuando ese
   guardado salió bien (resultadoAvance.ok); si el PDF no calzó con
   ninguna de las 11 facultades conocidas, no hay nada que guardar acá
   y el perfil simplemente se queda sin facultad hasta la próxima sync. */
async function guardarPerfilAcademicoDesdeAvance(userId, resultadoAvance) {
    const { error } = await supabase.from('perfiles_usuario').upsert({
        user_id: userId,
        facultad: resultadoAvance.facultad,
        carrera: resultadoAvance.carrera,
    }, { onConflict: 'user_id' });
    if (error) {
        console.error('Error guardando facultad/carrera en perfiles_usuario:', error);
    }
}

/* Pinta la insignia de facultad/carrera en la pantalla de éxito, con
   el ícono y el color REALES de esa facultad (mismos datos que usa el
   selector de index.html) — nunca un color genérico. */
function pintarInsigniaFacultad(siglaFacultad, nombreCarrera) {
    const cont = document.getElementById('insigniaFacultad');
    const facultad = FACULTADES.find((f) => f.sigla === siglaFacultad);
    if (!cont || !facultad) return;

    cont.style.borderColor = facultad.color;
    cont.innerHTML = `
        <img class="insignia-facultad__icono" src="${facultad.icono}" alt="Ícono de ${facultad.sigla}">
        <div>
            <div class="insignia-facultad__sigla" style="color:${facultad.color};">${facultad.sigla}</div>
            <div class="insignia-facultad__carrera">${nombreCarrera}</div>
        </div>
    `;
    cont.className = 'insignia-facultad';
    cont.style.display = 'inline-flex';
}

/* ============================================================
   BLOQUE — Periodo de ingreso (una sola vez por alumno)
   ============================================================ */
function mostrarBloquePeriodoIngreso(userId) {
    const bloque = document.getElementById('bloquePeriodoIngreso');
    bloque.classList.add('visible');

    const hoy = new Date();
    let anio = hoy.getFullYear();
    let periodo = hoy.getMonth() >= 7 ? 2 : 1;
    const opciones = [];
    for (let i = 0; i < 20; i++) {
        opciones.push({ value: `${anio}-${periodo}`, label: `${anio}-${periodo}` });
        if (periodo === 1) { periodo = 2; anio -= 1; } else { periodo = 1; }
    }

    inicializarSelectPersonalizado({
        triggerId: 'ingresoTrigger', textoId: 'ingresoTriggerTexto',
        listaId: 'ingresoLista', valorId: 'ingresoValor',
        opciones,
    });

    document.getElementById('btnContinuarIngreso').addEventListener('click', async () => {
        const elegido = document.getElementById('ingresoValor').value;
        if (!elegido) return;

        const btn = document.getElementById('btnContinuarIngreso');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const { error } = await supabase.from('perfiles_usuario').upsert({
            user_id: userId,
            periodo_ingreso: elegido,
        }, { onConflict: 'user_id' });

        if (error) {
            btn.disabled = false;
            btn.textContent = 'Continuar';
            mostrarBanner('error', 'No se pudo guardar tu periodo de ingreso. Intenta de nuevo.');
            return;
        }

        bloque.classList.remove('visible');
        mostrarBloqueSync(userId, elegido);
    });
}

/* ============================================================
   BLOQUE — Mostrar/ocultar la contraseña (mismo patrón que
   .btn-ojo en la producción real de SIGA, ver index.html).
   ============================================================ */
function prepararOjoPassword() {
    const boton = document.getElementById('btnOjoSync');
    const input = document.getElementById('syncPassword');
    if (!boton || !input) return;

    // Sin nada escrito no hay nada real que mostrar/ocultar (la
    // contraseña guardada nunca vuelve al navegador) — apagado hasta
    // que el alumno escriba algo, para no dar la impresión de un botón
    // que "no hace nada".
    let temporizadorOcultar = null;
    const ocultarAhora = () => {
        input.type = 'password';
        boton.setAttribute('aria-label', 'Mostrar contraseña');
        clearTimeout(temporizadorOcultar);
        temporizadorOcultar = null;
    };

    const actualizarDisponibilidad = () => {
        boton.disabled = input.value.length === 0;
        if (input.value.length === 0) ocultarAhora();
    };
    actualizarDisponibilidad();
    input.addEventListener('input', actualizarDisponibilidad);

    boton.addEventListener('click', () => {
        const mostrar = input.type === 'password';
        if (mostrar) {
            input.type = 'text';
            boton.setAttribute('aria-label', 'Ocultar contraseña');
            // Se tapa sola a los 4s — así el alumno puede confirmar
            // rápido lo que escribió sin dejarla expuesta todo el
            // tiempo, ni depender de acordarse de ocultarla él mismo.
            clearTimeout(temporizadorOcultar);
            temporizadorOcultar = setTimeout(ocultarAhora, 4000);
        } else {
            ocultarAhora();
        }
    });
}

/* ============================================================
   BLOQUE — Sync con Intralú (vía backend propio, código+contraseña)
   ============================================================ */
let syncCancelada = false;
let jobIdActual = null;

/* Periodo "actual" aproximado según la fecha de hoy (mismo criterio que el
   backend): enero/febrero = verano (tipo 3 del año anterior, porque el
   verano se etiqueta con el año del ciclo 2 que le precede), marzo-julio =
   tipo 1, agosto-diciembre = tipo 2. */
function periodoActualAproximado() {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    if (mes <= 2) return { anio: anio - 1, tipo: 3 };
    if (mes <= 7) return { anio, tipo: 1 };
    return { anio, tipo: 2 };
}

/* Número de orden cronológico de un periodo. Dentro de un año: 1 -> 2 -> 3 (verano). */
function ordenPeriodo(anio, tipo) {
    return anio * 3 + (tipo - 1);
}

/* ¿El periodo ya terminó? Cualquiera ANTERIOR al actual está cerrado. */
function periodoCerrado(periodoRaw) {
    const anio = parseInt(String(periodoRaw).slice(0, 4), 10);
    const tipo = parseInt(String(periodoRaw).slice(4), 10);
    const actual = periodoActualAproximado();
    return ordenPeriodo(anio, tipo) < ordenPeriodo(actual.anio, actual.tipo);
}

/* Periodos cerrados que INTRALU ya dijo que no tienen cursos para este
   alumno (típicamente veranos que no llevó). Se recuerdan en el navegador
   para no volver a preguntarlos en cada sincronización. */
function claveVacios(userId) {
    return `siga_periodos_sin_cursos_${userId}`;
}
function leerPeriodosVacios(userId) {
    try { return JSON.parse(localStorage.getItem(claveVacios(userId))) || []; } catch { return []; }
}
function guardarPeriodosVacios(userId, periodos) {
    try { localStorage.setItem(claveVacios(userId), JSON.stringify([...new Set(periodos)])); } catch { /* sin espacio: no pasa nada */ }
}

/* Qué periodos NO hace falta volver a pedirle a INTRALU:
   - cerrados en los que TODOS sus cursos ya tienen nota final (quedaron
     completos: INTRALU ya no los va a cambiar), y
   - cerrados que ya se revisaron y no tenían cursos.
   Todo lo demás se pide: el periodo actual, los que faltan, y el que
   acaba de cerrar (recién ahí INTRALU publica la fórmula de prácticas y
   las notas finales — por eso se vuelve a traer hasta que queden). */
async function calcularPeriodosAOmitir(userId) {
    const { data } = await supabase
        .from('notas_curso')
        .select('periodo, promedio_final')
        .eq('user_id', userId);

    const porPeriodo = {};
    (data || []).forEach((fila) => {
        const p = String(fila.periodo);
        if (!porPeriodo[p]) porPeriodo[p] = { total: 0, conFinal: 0 };
        porPeriodo[p].total += 1;
        if (fila.promedio_final !== null && fila.promedio_final !== undefined) porPeriodo[p].conFinal += 1;
    });

    const completos = Object.entries(porPeriodo)
        .filter(([p, c]) => periodoCerrado(p) && c.total > 0 && c.conFinal === c.total)
        .map(([p]) => p);
    const vacios = leerPeriodosVacios(userId).filter((p) => periodoCerrado(p) && !porPeriodo[p]);
    return [...new Set([...completos, ...vacios])];
}

/* ============================================================
   DESACTIVADO (sep 2026) — "Recordar mi contraseña" (guardado cifrado
   de la contraseña de INTRALU, opt-in). Se decidió apagarlo: guardarla
   no es necesario para el scraping en sí (eso siempre funciona en
   vivo, con lo que el alumno escriba en el momento) — guardarla era
   solo una comodidad, y el riesgo de tener contraseñas reales de
   INTRALU cifradas en el servidor no se justificaba frente a ese
   ahorro de tipeo.

   Para reactivarlo:
   1. Descomentar este bloque completo.
   2. Reemplazar la función mostrarBloqueSync de abajo por la versión
      DESACTIVADA de aquí (que sí llama a verificarCredencialGuardada
      y engancha btnOlvidarCredencial).
   3. En manejarSync: volver a leer `syncRecordar.checked` en
      `recordar`, pasarlo a sincronizarConBackend, y restaurar el
      bloque "if (resultado.ok && recordar) {...}" después del
      sync.
   4. En sincronizarConBackend: agregar de nuevo el parámetro
      `recordar` y `recordar` en el body.
   5. En index.html: descomentar el checkbox "Recordar mi contraseña"
      y el aviso "Ya tienes una contraseña guardada" (buscar el mismo
      comentario DESACTIVADO ahí).
   6. En el backend (scraping_intralu.py): descomentar los endpoints
      GET /api/tiene-credencial/{user_id} y DELETE /api/credencial/
      {user_id}, y el guardado de _guardar_credencial en _ejecutar_sync
      (buscar el mismo comentario DESACTIVADO allá).

let hayCredencialGuardadaDESACTIVADO = false;

async function mostrarBloqueSyncDESACTIVADO(userId, periodoIngreso) {
    document.getElementById('bloqueSync').classList.add('visible');
    document.getElementById('formSync').addEventListener('submit', (e) => manejarSync(e, userId));
    document.getElementById('btnCancelarSync').addEventListener('click', cancelarSyncEnCurso);
    document.getElementById('btnOlvidarCredencial').addEventListener('click', () => olvidarCredencial(userId));

    hayCredencialGuardadaDESACTIVADO = await verificarCredencialGuardada(userId);
    aplicarEstadoCredencial();
}

function aplicarEstadoCredencial() {
    const passwordInput = document.getElementById('syncPassword');
    const aviso = document.getElementById('avisoCredencialGuardada');
    passwordInput.required = !hayCredencialGuardadaDESACTIVADO;
    passwordInput.placeholder = hayCredencialGuardadaDESACTIVADO
        ? 'Ya guardada — puedes dejarlo así'
        : 'Contraseña de INTRALU';
    aviso.style.display = hayCredencialGuardadaDESACTIVADO ? 'block' : 'none';
}

async function verificarCredencialGuardada(userId) {
    try {
        const resp = await fetch(`${BACKEND_BASE_URL}/api/tiene-credencial/${userId}`);
        if (!resp.ok) return false;
        const data = await resp.json();
        return !!data.tiene;
    } catch {
        return false;
    }
}

async function olvidarCredencial(userId) {
    const confirmado = window.confirm('¿Seguro que quieres que SIGA olvide tu contraseña guardada? La próxima vez que sincronices tendrás que escribirla de nuevo.');
    if (!confirmado) return;

    try {
        await fetch(`${BACKEND_BASE_URL}/api/credencial/${userId}`, { method: 'DELETE' });
    } catch {
    }
    hayCredencialGuardadaDESACTIVADO = false;
    aplicarEstadoCredencial();
    mostrarBanner('exito', 'Listo, ya no tenemos tu contraseña guardada.');
}
   ============================================================ */

async function mostrarBloqueSync(userId, periodoIngreso) {
    document.getElementById('bloqueSync').classList.add('visible');
    document.getElementById('formSync').addEventListener('submit', (e) => manejarSync(e, userId));
    document.getElementById('btnCancelarSync').addEventListener('click', cancelarSyncEnCurso);
}

/* Espera a que pasen `ms` milisegundos, sin bloquear el hilo — usado
   entre cada intento de polling. */
function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/* "20241" -> "2024-1" */
function periodoLindo(periodoRaw) {
    const p = String(periodoRaw);
    return p.length === 5 ? `${p.slice(0, 4)}-${p.slice(4)}` : p;
}

/* Texto de avance según lo que el backend cuenta en cada consulta. */
function textoProgreso(data) {
    if (data.etapa === 'en_fila') {
        const n = data.personas_delante || 0;
        return n > 0
            ? `En fila: ${n === 1 ? 'hay 1 persona' : `hay ${n} personas`} antes que tú. Ya casi...`
            : 'Preparando la conexión con INTRALU...';
    }
    if (data.etapa === 'iniciando_sesion') return 'Iniciando sesión en INTRALU...';
    if (data.etapa === 'descargando' && data.periodos_total) {
        const actual = Math.min((data.periodos_hechos || 0) + 1, data.periodos_total);
        return data.periodo_actual
            ? `Cargando ${periodoLindo(data.periodo_actual)} (${actual} de ${data.periodos_total})...`
            : 'Terminando de cargar...';
    }
    return 'Conectando con INTRALU...';
}

/* Arranca el job en el backend (POST) y hace polling (GET) hasta que
   quede "listo", "cancelado", o el backend responda un error real.
   Nunca lanza: siempre resuelve con { ok, motivo?, detalle?, ...datos }.
   Desde sep 2026 no se elige periodo: el backend recorre TODO el
   historial y se salta los periodos de `omitir` (ya completos en SIGA). */
async function sincronizarConBackend(codigo, password, omitir, userId) {
    let jobId;
    try {
        const body = { codigo, password, user_id: userId, omitir };
        const respInicio = await fetch(BACKEND_SYNC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const dataInicio = await respInicio.json();
        if (!respInicio.ok) {
            return { ok: false, motivo: 'error_inesperado', detalle: dataInicio.detail || 'No se pudo iniciar la sincronización.' };
        }
        jobId = dataInicio.job_id;
    } catch {
        return { ok: false, motivo: 'error_inesperado', detalle: 'No se pudo conectar con el servidor de sincronización. Probablemente está caído o en mantenimiento ahora mismo — no es un error tuyo.' };
    }

    jobIdActual = jobId;
    const inicio = Date.now();

    while (Date.now() - inicio < TIMEOUT_POLLING_MS) {
        if (syncCancelada) return { ok: false, motivo: 'cancelado' };

        await esperar(INTERVALO_POLLING_MS);
        if (syncCancelada) return { ok: false, motivo: 'cancelado' };

        let data;
        try {
            const resp = await fetch(`${BACKEND_SYNC_URL}/${jobId}`);
            data = await resp.json();
            if (!resp.ok) {
                return { ok: false, motivo: 'error_backend', detalle: data.detail };
            }
        } catch {
            // Un fallo de red puntual durante el polling no es motivo
            // para rendirse — se reintenta en la siguiente vuelta.
            continue;
        }

        if (data.status === 'en_progreso') {
            mostrarProgreso(textoProgreso(data));
            continue;
        }

        if (data.status === 'cancelado') return { ok: false, motivo: 'cancelado' };

        if (data.status === 'listo') {
            return {
                ok: true,
                periodos: data.periodos || {},
                revisados: data.periodos_revisados || [],
                avancePdfBase64: data.avance_pdf_base64 || null,
            };
        }
    }

    return { ok: false, motivo: 'timeout', detalle: 'La sincronización está tardando más de lo esperado. Intenta de nuevo en un momento.' };
}

function mensajeError(resultado) {
    const motivos = {
        timeout: resultado.detalle,
        sin_cursos: resultado.detalle || 'No se encontró ningún curso matriculado en INTRALU.',
        cancelado: 'Sincronización cancelada.',
        error_inesperado: resultado.detalle,
        error_backend: resultado.detalle || 'No pudimos conectar con INTRALU. Probablemente está caído o en mantenimiento ahora mismo. No es un error de SIGA.',
    };
    return motivos[resultado.motivo]
        || resultado.detalle
        || 'No pudimos conectar con INTRALU. Probablemente está caído o en mantenimiento ahora mismo. No es un error de SIGA.';
}

function mostrarBanner(tipo, texto) {
    const banner = document.getElementById('bannerSync');
    banner.className = `banner-estado visible ${tipo}`;
    banner.textContent = texto;
}
function ocultarBanner() {
    document.getElementById('bannerSync').className = 'banner-estado';
}
function mostrarProgreso(texto) {
    document.getElementById('progresoSync').classList.add('visible');
    document.getElementById('progresoSyncTexto').textContent = texto;
}
function ocultarProgreso() {
    document.getElementById('progresoSync').classList.remove('visible');
}

function numeroOMulo(valor) {
    if (valor === null || valor === undefined || valor === '') return null;
    const n = parseFloat(valor);
    return Number.isNaN(n) ? null : n;
}

/* Guarda notas + fórmulas en las 2 tablas nuevas: formulas_curso
   (compartida por sección, no por alumno) y notas_curso (con las
   evaluaciones crudas en jsonb, sin mapear a N1/EP/etc. — eso lo hace
   formula-mapper.js al vuelo, cuando se necesita calcular algo, nunca
   al guardar). */
async function guardarResultadoSync(userId, periodo, cursos) {
    if (!cursos.length) return;

    const filasFormulas = cursos.map((c) => ({
        codigo_curso: c.codigo,
        seccion: c.seccion,
        periodo,
        formula_practicas: c.formula_practicas,
        formula_nota_final: c.formula_nota_final,
        creditos: c.creditos,
    }));
    const { error: errorFormulas } = await supabase
        .from('formulas_curso')
        .upsert(filasFormulas, { onConflict: 'codigo_curso,seccion,periodo' });
    if (errorFormulas) throw errorFormulas;

    const filasNotas = cursos.map((c) => ({
        user_id: userId,
        periodo,
        codigo_curso: c.codigo,
        seccion: c.seccion,
        nombre_curso: c.nombre,
        promedio_practicas: numeroOMulo(c.promedio_practicas),
        promedio_final: numeroOMulo(c.promedio_final),
        nota_asistencia: numeroOMulo(c.nota_asistencia),
        evaluaciones: c.evaluaciones,
    }));
    const { error: errorNotas } = await supabase
        .from('notas_curso')
        .upsert(filasNotas, { onConflict: 'user_id,periodo,codigo_curso' });
    if (errorNotas) throw errorNotas;
}

/* Extrae el texto del PDF (pdf.js) y lo pasa por el parser + guardado
   ya validados, dentro del flujo real de sincronización. */
function base64AArrayBuffer(base64) {
    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return bytes;
}

async function extraerTextoPdf(bytes) {
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    let textoCompleto = '';
    for (let numPagina = 1; numPagina <= doc.numPages; numPagina++) {
        const pagina = await doc.getPage(numPagina);
        const contenido = await pagina.getTextContent();
        const lineaPagina = contenido.items.map((item) => item.str).join(' ');
        textoCompleto += `\n\n===== PÁGINA ${numPagina} =====\n\n${lineaPagina}`;
    }
    return textoCompleto;
}

async function guardarAvanceCurricularDesdeBase64(userId, base64) {
    const bytes = base64AArrayBuffer(base64);
    const texto = await extraerTextoPdf(bytes);
    const estructurado = parsearAvanceCurricular(texto);
    return guardarAvanceCurricular(userId, estructurado);
}

function cancelarSyncEnCurso() {
    syncCancelada = true;
    if (jobIdActual) {
        // Best-effort: solo levanta la bandera en el backend, no hace
        // falta esperar la respuesta para reflejar la cancelación acá.
        fetch(`${BACKEND_SYNC_URL}/${jobIdActual}/cancelar`, { method: 'POST' }).catch(() => { });
        jobIdActual = null;
    }
    ocultarProgreso();
    mostrarBanner('advertencia', 'Sincronización cancelada.');
    document.getElementById('btnCancelarSync').style.display = 'none';
    const btnSync = document.getElementById('btnSync');
    btnSync.disabled = false;
    btnSync.textContent = 'Sincronizar';
}

async function manejarSync(e, userId) {
    e.preventDefault();
    ocultarBanner();
    document.getElementById('resumenFinal').classList.remove('visible');
    syncCancelada = false;

    const btnSync = document.getElementById('btnSync');
    const btnCancelar = document.getElementById('btnCancelarSync');

    // Paso 1: código y contraseña. Ya no se elige periodo: se carga todo.
    const codigo = document.getElementById('syncCodigo').value.trim().toUpperCase();
    const password = document.getElementById('syncPassword').value;

    if (!codigo) {
        mostrarBanner('error', 'Ingresa tu código de estudiante.');
        return;
    }
    if (!password) {
        mostrarBanner('error', 'Ingresa tu contraseña de INTRALU.');
        return;
    }

    // Paso 2: mandar credenciales al backend y esperar con polling. La
    // contraseña nunca se guarda en SIGA — se usa una sola vez y se descarta.
    btnSync.disabled = true;
    btnSync.textContent = 'Conectando...';
    btnCancelar.style.display = 'block';
    mostrarProgreso('Conectando con INTRALU...');

    let omitir = [];
    try {
        omitir = await calcularPeriodosAOmitir(userId);
    } catch (err) {
        console.warn('No se pudo calcular qué periodos omitir; se pedirá todo:', err);
    }

    const resultado = await sincronizarConBackend(codigo, password, omitir, userId);
    document.getElementById('syncPassword').value = '';
    ocultarProgreso();
    btnCancelar.style.display = 'none';

    if (syncCancelada) return; // ya canceló y reseteó la UI, ignoramos esta respuesta tardía

    if (!resultado.ok) {
        mostrarBanner('error', mensajeError(resultado));
        btnSync.disabled = false;
        btnSync.textContent = 'Sincronizar';
        return;
    }

    const periodosConCursos = Object.keys(resultado.periodos).sort();
    if (!periodosConCursos.length && !omitir.length) {
        mostrarBanner('error', 'No se encontró ningún curso matriculado en INTRALU.');
        btnSync.disabled = false;
        btnSync.textContent = 'Sincronizar';
        return;
    }

    // Paso 3: guardar periodo por periodo (notas + fórmulas) y, si vino el
    // PDF, el Avance Curricular (única fuente de verdad de facultad/carrera).
    try {
        let totalCursos = 0;
        let totalErrores = 0;
        for (let i = 0; i < periodosConCursos.length; i++) {
            const periodo = periodosConCursos[i];
            const datos = resultado.periodos[periodo];
            mostrarProgreso(`Guardando ${periodoLindo(periodo)} en SIGA (${i + 1} de ${periodosConCursos.length})...`);
            await guardarResultadoSync(userId, periodo, datos.cursos || []);
            totalCursos += (datos.cursos || []).length;
            totalErrores += (datos.errores || []).length;
        }

        // Recordar los periodos cerrados revisados que no tenían cursos.
        const vaciosNuevos = resultado.revisados.filter((p) => !resultado.periodos[p] && periodoCerrado(p));
        if (vaciosNuevos.length) guardarPeriodosVacios(userId, [...leerPeriodosVacios(userId), ...vaciosNuevos]);

        if (periodosConCursos.length) {
            await supabase.from('perfiles_usuario').upsert({
                user_id: userId,
                periodo_actual: periodosConCursos[periodosConCursos.length - 1],
            }, { onConflict: 'user_id' });
        }

        if (resultado.avancePdfBase64) {
            try {
                mostrarProgreso('Actualizando tu avance curricular...');
                const resultadoAvance = await guardarAvanceCurricularDesdeBase64(userId, resultado.avancePdfBase64);
                if (resultadoAvance.ok) {
                    await guardarPerfilAcademicoDesdeAvance(userId, resultadoAvance);
                    pintarInsigniaFacultad(resultadoAvance.facultad, resultadoAvance.carrera);
                    console.log(`Avance Curricular actualizado: ${resultadoAvance.cursosGuardados} curso(s).`);
                } else {
                    console.warn('No se pudo guardar el Avance Curricular esta vez:', resultadoAvance.motivo, resultadoAvance.detalle);
                }
            } catch (errAvance) {
                console.error('Error guardando Avance Curricular:', errAvance);
            }
        }

        ocultarProgreso();

        let texto;
        if (periodosConCursos.length === 0) {
            texto = 'Tus notas ya estaban al día: no había nada nuevo en INTRALU.';
        } else if (periodosConCursos.length === 1) {
            texto = `Periodo ${periodoLindo(periodosConCursos[0])} actualizado (${totalCursos} curso${totalCursos === 1 ? '' : 's'}).`;
        } else {
            texto = `${periodosConCursos.length} periodos cargados (${periodoLindo(periodosConCursos[0])} a ${periodoLindo(periodosConCursos[periodosConCursos.length - 1])}), ${totalCursos} cursos en total.`;
        }
        if (totalErrores) {
            texto += ` (${totalErrores} curso(s) no se pudieron traer; vuelve a sincronizar más tarde.)`;
        }

        document.getElementById('resumenFinalTexto').textContent = texto;
        document.getElementById('resumenFinal').classList.add('visible');
    } catch (err) {
        ocultarProgreso();
        mostrarBanner('error', 'Se sincronizó con INTRALU pero no se pudo guardar en Supabase. Intenta de nuevo.');
        console.error('Error guardando sync en Supabase:', err);
    } finally {
        btnSync.disabled = false;
        btnSync.textContent = 'Sincronizar';
    }
}