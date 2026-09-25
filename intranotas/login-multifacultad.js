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

// Cada cuántos ms se pregunta al backend si ya terminó, y cuánto se
// espera como máximo antes de rendirse (Render free tier + Playwright
// + varios cursos puede tardar 1-2 minutos reales).
const INTERVALO_POLLING_MS = 3000;
const TIMEOUT_POLLING_MS = 240000;

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

/* Da el (anio, tipo) cronológicamente ANTERIOR a un (anio, tipo) dado.
   Orden real dentro de un año: tipo 1 (mar-jul) -> tipo 2 (ago-dic) ->
   tipo 3 = verano (ene-feb del año SIGUIENTE, pero etiquetado con el
   año que ya venía corriendo, ej. "24V" de Intralú = "20233", no
   "20243" -- confirmado en decisions-and-learnings). Por eso el paso
   anterior a un tipo 1 es el tipo 3 del año ANTERIOR, no el tipo 2. */
function pasoAnterior(anio, tipo) {
    if (tipo === 1) return { anio: anio - 1, tipo: 3 };
    if (tipo === 2) return { anio, tipo: 1 };
    return { anio, tipo: 2 }; // tipo === 3
}

/* Punto de partida del selector: el periodo "actual" aproximado según
   la fecha de hoy. Enero/febrero cae en verano (tipo 3, año anterior);
   marzo-julio es tipo 1; agosto-diciembre es tipo 2. */
function periodoActualAproximado() {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    if (mes <= 2) return { anio: anio - 1, tipo: 3 };
    if (mes <= 7) return { anio, tipo: 1 };
    return { anio, tipo: 2 };
}

/* Genera el dropdown de periodos (incluyendo verano) acotado por el
   año del periodo de ingreso guardado en el perfil. */
function prepararPeriodosSync(periodoIngreso) {
    const anioIngreso = parseInt((periodoIngreso || '').slice(0, 4), 10);
    const anioValido = !Number.isNaN(anioIngreso) && anioIngreso >= 2000 && anioIngreso <= new Date().getFullYear();
    const limiteInferior = anioValido ? anioIngreso : new Date().getFullYear() - 8;

    let actual = periodoActualAproximado();
    const opciones = [];
    while (actual.anio > limiteInferior || (actual.anio === limiteInferior && actual.tipo >= 1)) {
        opciones.push({ value: `${actual.anio}${actual.tipo}`, label: `${actual.anio}-${actual.tipo}` });
        actual = pasoAnterior(actual.anio, actual.tipo);
        if (opciones.length >= 60) break; // tope de seguridad (3 tipos por año, no 2 como antes)
    }

    inicializarSelectPersonalizado({
        triggerId: 'syncPeriodoTrigger', textoId: 'syncPeriodoTriggerTexto',
        listaId: 'syncPeriodoLista', valorId: 'syncPeriodoValor',
        opciones,
    });
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
      bloque "if (resultadoNotas.ok && recordar) {...}" después del
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
    prepararPeriodosSync(periodoIngreso);
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
    prepararPeriodosSync(periodoIngreso);
    document.getElementById('formSync').addEventListener('submit', (e) => manejarSync(e, userId));
    document.getElementById('btnCancelarSync').addEventListener('click', cancelarSyncEnCurso);
}

/* Espera a que pasen `ms` milisegundos, sin bloquear el hilo — usado
   entre cada intento de polling. */
function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/* Arranca el job en el backend (POST) y hace polling (GET) hasta que
   quede "listo", "cancelado", o el backend responda un error real
   (credenciales incorrectas, servidor ocupado, etc.). Nunca lanza: 
   siempre resuelve con { ok, motivo?, detalle?, ...datos }, para que
   manejarSync() decida qué mostrar sin try/catch anidados. */
async function sincronizarConBackend(codigo, password, periodo, userId) {
    let jobId;
    try {
        const body = { codigo, periodo, user_id: userId };
        if (password) body.password = password;
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
        if (syncCancelada) {
            return { ok: false, motivo: 'cancelado' };
        }

        await esperar(INTERVALO_POLLING_MS);

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
            mostrarProgreso('Conectando con INTRALU...');
            continue;
        }

        if (data.status === 'cancelado') {
            return { ok: false, motivo: 'cancelado' };
        }

        if (data.status === 'listo') {
            const datosPeriodo = (data.periodos || {})[periodo];
            if (!datosPeriodo || !datosPeriodo.cursos.length) {
                return { ok: false, motivo: 'sin_cursos', detalle: 'No se encontró ningún curso matriculado en INTRALU para ese periodo.' };
            }
            return {
                ok: true,
                periodo,
                cursos: datosPeriodo.cursos,
                errores: datosPeriodo.errores || [],
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
        sin_periodo: 'Elige un periodo para sincronizar.',
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
async function guardarResultadoSync(userId, resultado) {
    if (!resultado.cursos.length) return;

    const filasFormulas = resultado.cursos.map((c) => ({
        codigo_curso: c.codigo,
        seccion: c.seccion,
        periodo: resultado.periodo,
        formula_practicas: c.formula_practicas,
        formula_nota_final: c.formula_nota_final,
        creditos: c.creditos,
    }));
    const { error: errorFormulas } = await supabase
        .from('formulas_curso')
        .upsert(filasFormulas, { onConflict: 'codigo_curso,seccion,periodo' });
    if (errorFormulas) throw errorFormulas;

    const filasNotas = resultado.cursos.map((c) => ({
        user_id: userId,
        periodo: resultado.periodo,
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

    await supabase.from('perfiles_usuario').upsert({
        user_id: userId,
        periodo_actual: resultado.periodo,
    }, { onConflict: 'user_id' });
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

    // Paso 1: código, contraseña (opcional si ya hay una guardada) y periodo.
    const codigo = document.getElementById('syncCodigo').value.trim().toUpperCase();
    const password = document.getElementById('syncPassword').value;
    const periodoElegido = document.getElementById('syncPeriodoValor').value;

    if (!codigo) {
        mostrarBanner('error', 'Ingresa tu código de estudiante.');
        return;
    }
    if (!password) {
        mostrarBanner('error', 'Ingresa tu contraseña de INTRALU.');
        return;
    }
    if (!periodoElegido) {
        mostrarBanner('error', 'Elige un periodo para sincronizar.');
        return;
    }

    // Paso 2: mandar credenciales al backend y esperar a que termine,
    // con polling. La contraseña nunca se guarda en SIGA — se usa una
    // sola vez para esta sincronización y se descarta.
    btnSync.disabled = true;
    btnSync.textContent = 'Conectando...';
    btnCancelar.style.display = 'block';
    mostrarProgreso('Conectando con INTRALU...');

    const resultadoNotas = await sincronizarConBackend(codigo, password, periodoElegido, userId);
    document.getElementById('syncPassword').value = '';
    ocultarProgreso();
    btnCancelar.style.display = 'none';

    if (syncCancelada) return; // ya canceló y reseteó la UI, ignoramos esta respuesta tardía

    if (!resultadoNotas.ok) {
        mostrarBanner('error', mensajeError(resultadoNotas));
        btnSync.disabled = false;
        btnSync.textContent = 'Sincronizar';
        return;
    }

    // Paso 3: guardar notas + fórmulas, y — si el backend trajo el PDF en
    // esta misma sincronización — también el Avance Curricular. Si eso
    // sale bien, ESA es la única fuente de verdad para facultad/carrera:
    // se guardan en el perfil y se pintan en la insignia, nunca elegidas
    // a mano.
    try {
        mostrarProgreso('Cargando notas...');
        await guardarResultadoSync(userId, resultadoNotas);

        if (resultadoNotas.avancePdfBase64) {
            try {
                const resultadoAvance = await guardarAvanceCurricularDesdeBase64(userId, resultadoNotas.avancePdfBase64);
                if (resultadoAvance.ok) {
                    await guardarPerfilAcademicoDesdeAvance(userId, resultadoAvance);
                    pintarInsigniaFacultad(resultadoAvance.facultad, resultadoAvance.carrera);
                    // Dato interno, no le sirve al alumno saberlo — solo queda
                    // en consola por si algún día hay que revisar cuántos
                    // cursos trajo el Avance Curricular esta vez.
                    console.log(`Avance Curricular actualizado: ${resultadoAvance.cursosGuardados} curso(s).`);
                } else {
                    console.warn('No se pudo guardar el Avance Curricular esta vez:', resultadoAvance.motivo, resultadoAvance.detalle);
                }
            } catch (errAvance) {
                console.error('Error guardando Avance Curricular:', errAvance);
            }
        }

        ocultarProgreso();

        const periodoLindo = `${resultadoNotas.periodo.slice(0, 4)}-${resultadoNotas.periodo.slice(4)}`;
        let texto = `Periodo ${periodoLindo} cargado.`;
        if (resultadoNotas.errores.length) {
            texto += ` (${resultadoNotas.errores.length} curso(s) no se pudieron traer, intenta de nuevo más tarde.)`;
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