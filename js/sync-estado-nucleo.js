// js/sync-estado-nucleo.js — SigaEstado: el "cerebro" de la sincronización entre dispositivos.
//
// No conoce Supabase ni localStorage: recibe una `nube` y un `almacen` (así se puede probar
// sin internet). El cableado real está en js/sync-estado.js.
//
// Reglas que cumple (acordadas con el diseño del servidor):
//  • Cada elemento es una fila (modulo, clave). Sin mezclas de JSON: valores simples → gana la nube.
//  • Dos campos de tiempo SEPARADOS, ambos tomados del reloj del servidor:
//      ultima_sync_servidor  → se envía al servidor y solo se compara con el horizonte de compactación.
//      cursor_incremental    → ultima_sync − solapamiento (300 s); solo se usa en "actualizado_en > cursor".
//  • La descarga completa se arma en memoria y solo al terminar se cambia UN puntero
//    (localStorage no puede escribir varias claves a la vez). Si algo falla, no queda nada a medias.
//  • Lo que el usuario cambia va a una cola (outbox) con op_id; la vista = copia de la nube + cola.
//  • Nunca se escribe en la nube por sí solo: solo lo que el usuario guardó explícitamente.

const SEP = '\u0000';
const RE_MODULO = /^[a-z0-9_-]{1,40}$/;
const MAX_BYTES = 65536;

const claveFila = (m, c) => m + SEP + c;
const iso = (ms) => new Date(ms).toISOString();
const clonar = (x) => (x === undefined ? undefined : structuredClone(x));
const igual = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const nuevoId = () => globalThis.crypto.randomUUID();

export function crearEstado({ nube, almacen, uid, canal = null, tamPagina = 500, alEncolar = null }) {
    if (!uid) throw new Error('SigaEstado: falta el id de usuario');
    const P = `siga_estado_v1:${uid}:`;
    const K_PTR = P + 'ptr';
    const K_COPIA = (c) => P + 'copia:' + c;
    const K_OUT = P + 'outbox';

    const oyentes = [];            // { modulo, clave|null, fn }
    const oyentesConflicto = [];
    let corriendo = null;          // promesa de la sincronización en curso
    let enEnvio = null;            // op_id que está viajando ahora mismo
    let ultimoError = null;
    let memo = { raw: undefined, obj: null };
    let bloqueado = false;         // tras vaciarLocal(): ninguna tarea que haya quedado a medias puede volver a escribir

    // ───────────── almacenamiento local ─────────────
    function leerJSON(k, def) {
        try { const raw = almacen.getItem(k); return raw == null ? def : JSON.parse(raw); } catch { return def; }
    }
    const puntero = () => leerJSON(K_PTR, null);
    function copiaActual() {
        const ptr = puntero(); if (!ptr) return {};
        let raw; try { raw = almacen.getItem(K_COPIA(ptr.copia)); } catch { return {}; }
        if (raw == null) return {};
        if (memo.raw !== raw) { try { memo = { raw, obj: JSON.parse(raw).filas || {} }; } catch { memo = { raw, obj: {} }; } }
        return memo.obj;
    }
    const outbox = () => leerJSON(K_OUT, []);
    const verificarAbierto = () => { if (bloqueado) throw new Error('SigaEstado: la sesión se cerró'); };
    const guardarOutbox = (ops) => { verificarAbierto(); almacen.setItem(K_OUT, JSON.stringify(ops)); };

    // Cambia la copia visible escribiendo en la otra "ranura" y moviendo el puntero con UNA sola escritura.
    function confirmar(filas, ultimaSync, cursor) {
        verificarAbierto();
        const ptr0 = puntero();
        const nueva = ptr0 && ptr0.copia === 'a' ? 'b' : 'a';
        almacen.setItem(K_COPIA(nueva), JSON.stringify({ filas }));          // si falla (sin espacio), el puntero no se movió
        almacen.setItem(K_PTR, JSON.stringify({ copia: nueva, ultima_sync_servidor: ultimaSync, cursor_incremental: cursor }));
        if (ptr0) { try { almacen.removeItem(K_COPIA(ptr0.copia)); } catch { /* limpieza opcional */ } }
        memo = { raw: undefined, obj: null };
    }
    // Actualiza una fila de la copia visible SIN mover tiempos (cuando el servidor acepta o rechaza un envío).
    function escribirFilaEnCopia(modulo, clave, fila) {
        verificarAbierto();
        const ptr = puntero(); if (!ptr) return;
        const filas = { ...copiaActual() };
        if (fila) filas[claveFila(modulo, clave)] = fila; else delete filas[claveFila(modulo, clave)];
        almacen.setItem(K_COPIA(ptr.copia), JSON.stringify({ filas }));
        memo = { raw: undefined, obj: null };
    }

    // ───────────── vista (copia de la nube + cambios pendientes) ─────────────
    function vista(modulo, clave) {
        const op = outbox().filter((o) => o.modulo === modulo && o.clave === clave).pop();
        if (op) return { valor: op.borrar ? undefined : op.valor, borrado: !!op.borrar, pendiente: true };
        const f = copiaActual()[claveFila(modulo, clave)];
        if (!f) return { valor: undefined, borrado: false, pendiente: false, inexistente: true };
        return { valor: f.borrado ? undefined : f.valor, borrado: !!f.borrado, pendiente: false };
    }
    function leer(modulo, clave) { const v = vista(modulo, clave); return v.borrado ? undefined : clonar(v.valor); }
    function listar(modulo, prefijo = '') {
        const res = new Map();
        for (const [k, f] of Object.entries(copiaActual())) {
            const [m, c] = k.split(SEP);
            if (m === modulo && c.startsWith(prefijo) && !f.borrado) res.set(c, f.valor);
        }
        for (const op of outbox()) {
            if (op.modulo !== modulo || !op.clave.startsWith(prefijo)) continue;
            if (op.borrar) res.delete(op.clave); else res.set(op.clave, op.valor);
        }
        return [...res.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([clave, valor]) => ({ clave, valor: clonar(valor) }));
    }

    // ───────────── avisos ─────────────
    function avisar(modulo, clave, origen) {
        for (const o of oyentes.slice()) {
            if (o.modulo === modulo && (o.clave === null || o.clave === clave)) {
                try { o.fn({ modulo, clave, origen }); } catch (e) { console.error('SigaEstado alCambiar:', e); }
            }
        }
    }
    function alCambiar(modulo, clave, fn) {
        const o = { modulo, clave: clave ?? null, fn }; oyentes.push(o);
        return () => { const i = oyentes.indexOf(o); if (i >= 0) oyentes.splice(i, 1); };
    }
    function alConflicto(fn) { oyentesConflicto.push(fn); return () => { const i = oyentesConflicto.indexOf(fn); if (i >= 0) oyentesConflicto.splice(i, 1); }; }
    if (canal) canal.onmessage = (ev) => {
        memo = { raw: undefined, obj: null };
        const d = ev.data || {}; if (d.modulo != null) avisar(d.modulo, d.clave, 'otra_pestana');
    };
    const decirAOtras = (modulo, clave) => { try { canal && canal.postMessage({ modulo, clave }); } catch { /* ignorar */ } };

    // ───────────── escribir (lo que hace el usuario) ─────────────
    function validar(modulo, clave) {
        if (typeof modulo !== 'string' || !RE_MODULO.test(modulo)) throw new Error('SigaEstado: módulo inválido');
        if (typeof clave !== 'string' || clave.length < 1 || clave.length > 200) throw new Error('SigaEstado: clave inválida (1–200 caracteres)');
    }
    function encolar(modulo, clave, valor, borrar, conservar) {
        const ops = outbox();
        const previo = ops.findIndex((o) => o.modulo === modulo && o.clave === clave && o.opId !== enEnvio);
        const fila = copiaActual()[claveFila(modulo, clave)];
        const enVuelo = ops.find((o) => o.modulo === modulo && o.clave === clave && o.opId === enEnvio);
        const versionBase = previo >= 0 ? ops[previo].versionBase : (fila ? fila.version : 0);
        const op = { opId: nuevoId(), modulo, clave, valor: borrar ? null : valor, borrar: !!borrar, versionBase: enVuelo && previo < 0 ? (fila ? fila.version : 0) : versionBase, conservar: !!conservar };
        if (previo >= 0) ops[previo] = op; else ops.push(op);
        guardarOutbox(ops);
        avisar(modulo, clave, 'local'); decirAOtras(modulo, clave);
        if (alEncolar) alEncolar();
    }
    function guardar(modulo, clave, valor, { conservar = false } = {}) {
        validar(modulo, clave);
        if (valor === undefined) throw new Error('SigaEstado: valor undefined (usa borrar())');
        const texto = JSON.stringify(valor);
        if (texto === undefined || new TextEncoder().encode(texto).length > MAX_BYTES) throw new Error('SigaEstado: valor no serializable o mayor a 64 KB');
        const v = vista(modulo, clave);
        if (!v.borrado && !v.inexistente && igual(v.valor, valor)) return;       // no hay nada nuevo que guardar
        encolar(modulo, clave, JSON.parse(texto), false, conservar);
    }
    function borrar(modulo, clave, { conservar = false } = {}) {
        validar(modulo, clave);
        const v = vista(modulo, clave);
        if (v.inexistente || v.borrado) return;
        const ops = outbox();
        const i = ops.findIndex((o) => o.modulo === modulo && o.clave === clave && o.opId !== enEnvio && o.versionBase === 0);
        if (i >= 0) { ops.splice(i, 1); guardarOutbox(ops); avisar(modulo, clave, 'local'); decirAOtras(modulo, clave); return; }   // nunca llegó a la nube
        encolar(modulo, clave, null, true, conservar);
    }
    const pendientes = () => outbox();
    function estado() {
        if (corriendo) return 'sincronizando';
        if (ultimoError) return 'error';
        if (outbox().length) return 'pendiente';
        return puntero() ? 'sincronizado' : 'sin_sincronizar';
    }

    // ───────────── descargas ─────────────
    async function paginar(cursor, alFila) {
        let despuesDe = null;
        for (; ;) {
            const filas = await nube.leerPagina({ cursor, despuesDe, limite: tamPagina });
            for (const f of filas) alFila(f);
            if (filas.length < tamPagina) return;
            const ult = filas[filas.length - 1];
            despuesDe = { modulo: ult.modulo, clave: ult.clave };
        }
    }
    const filaDe = (f) => ({ valor: f.borrado ? null : (f.valor ?? null), version: Number(f.version), borrado: !!f.borrado });
    const cursorDe = (info) => iso(Date.parse(info.ahora) - Number(info.solapamiento_segundos) * 1000);

    // Descarga "que cubre" (no es una foto exacta): se arma aparte y se cambia el puntero al final.
    async function descargaCompleta(info) {
        const staging = {};
        await paginar(null, (f) => { staging[claveFila(f.modulo, f.clave)] = filaDe(f); });
        const antes = copiaActual();
        confirmar(staging, info.ahora, cursorDe(info));
        const claves = new Set([...Object.keys(antes), ...Object.keys(staging)]);
        const ops = outbox();
        for (const k of claves) {
            const a = antes[k], b = staging[k];
            if (a && b && a.version === b.version && igual(a.valor, b.valor) && a.borrado === b.borrado) continue;
            if (!a && b && b.borrado) continue;
            const [m, c] = k.split(SEP);
            if (ops.some((o) => o.modulo === m && o.clave === c)) continue;        // la vista no cambia: manda lo pendiente
            avisar(m, c, 'nube'); decirAOtras(m, c);
        }
    }

    async function descargaIncremental(infoPrevia) {
        const ptr = puntero();
        const info = infoPrevia || await nube.info();     // el instante se toma ANTES de descargar
        const filas = { ...copiaActual() };
        const cambiadas = [];
        const ops = outbox();
        await paginar(ptr.cursor_incremental, (f) => {
            const k = claveFila(f.modulo, f.clave); const local = filas[k];
            if (local && Number(f.version) <= local.version) return;            // repetida por el solapamiento: no se toca
            const nueva = filaDe(f);
            const cambia = !local || local.borrado !== nueva.borrado || !igual(local.valor, nueva.valor);
            filas[k] = nueva;
            if (cambia && !(local === undefined && nueva.borrado) && !ops.some((o) => o.modulo === f.modulo && o.clave === f.clave)) cambiadas.push([f.modulo, f.clave]);
        });
        confirmar(filas, info.ahora, cursorDe(info));
        for (const [m, c] of cambiadas) { avisar(m, c, 'nube'); decirAOtras(m, c); }
    }

    // ───────────── envío de lo pendiente ─────────────
    async function enviarPendientes() {
        for (const op of outbox()) {
            const ptr = puntero();
            enEnvio = op.opId;
            let res;
            try {
                res = await nube.guardar({
                    modulo: op.modulo, clave: op.clave, valor: op.valor, versionBase: op.versionBase, opId: op.opId,
                    ultimaSync: ptr.ultima_sync_servidor, borrar: op.borrar, conservar: op.conservar
                });
            } finally { enEnvio = null; }
            const quitar = () => guardarOutbox(outbox().filter((o) => o.opId !== op.opId));
            const antes = vista(op.modulo, op.clave);

            if (res.estado === 'aceptado') {
                escribirFilaEnCopia(op.modulo, op.clave, { valor: op.borrar ? null : op.valor, version: Number(res.version), borrado: !!op.borrar });
                guardarOutbox(outbox().filter((o) => o.opId !== op.opId).map((o) => (o.modulo === op.modulo && o.clave === op.clave ? { ...o, versionBase: Number(res.version) } : o)));
            } else if (res.estado === 'conflicto') {
                if (res.motivo === 'version') {
                    escribirFilaEnCopia(op.modulo, op.clave, { valor: res.borrado_nube ? null : (res.valor_nube ?? null), version: Number(res.version_nube), borrado: !!res.borrado_nube });
                } else {
                    const f = await nube.leerUno(op.modulo, op.clave);
                    escribirFilaEnCopia(op.modulo, op.clave, f ? filaDe(f) : null);
                }
                quitar();
                for (const fn of oyentesConflicto.slice()) { try { fn({ modulo: op.modulo, clave: op.clave, motivo: res.motivo, conservar: op.conservar }); } catch (e) { console.error(e); } }
                const despues = vista(op.modulo, op.clave);
                if (antes.borrado !== despues.borrado || !igual(antes.valor, despues.valor)) { avisar(op.modulo, op.clave, 'nube'); decirAOtras(op.modulo, op.clave); }
            } else if (res.estado === 'dispositivo_desactualizado') {
                quitar();                                                     // el servidor ya guardó el rechazado (si pidió conservar)
                await descargaCompleta(await nube.info());
                return;                                                       // lo demás se envía en el siguiente ciclo
            } else {
                throw new Error('SigaEstado: respuesta inesperada del servidor: ' + res.estado);
            }
        }
    }

    // ───────────── ciclo completo ─────────────
    async function ciclo() {
        const info = await nube.info();
        const ptr = puntero();
        const atrasado = !ptr || !ptr.ultima_sync_servidor || Date.parse(ptr.ultima_sync_servidor) < Date.parse(info.purgado_hasta);
        if (atrasado) await descargaCompleta(info); else await descargaIncremental(info);
        await enviarPendientes();
    }
    function sincronizar() {
        if (corriendo) return corriendo;
        corriendo = (async () => {
            try { await ciclo(); ultimoError = null; return { ok: true }; }
            catch (e) { ultimoError = e; return { ok: false, error: e }; }
            finally { corriendo = null; }
        })();
        return corriendo;
    }


    // ───────────── cerrar sesión de forma segura ─────────────
    // Sube lo pendiente; si TODO llegó a la nube, borra lo local de este navegador (privacidad en PCs ajenas).
    // Si no pudo subir, NO borra: devuelve cuántos cambios quedarían sin guardar para que la pantalla pregunte.
    function vaciarLocal() {
        bloqueado = true;
        for (const k of [K_PTR, K_COPIA('a'), K_COPIA('b'), K_OUT]) { try { almacen.removeItem(k); } catch { /* ignorar */ } }
        memo = { raw: undefined, obj: null };
    }
    async function prepararSalida({ esperarMs = 6000 } = {}) {
        let reloj;
        const plazo = new Promise((res) => { reloj = setTimeout(() => res({ ok: false }), esperarMs); });
        const subir = (async () => {
            for (let i = 0; i < 3; i++) {                      // un ciclo normal casi siempre basta; hasta 3 por si el servidor pidió re-descargar
                const r = await sincronizar();
                if (!r.ok) return r;
                if (outbox().length === 0) return r;
            }
            return { ok: false };
        })();
        try {
            const r = await Promise.race([subir, plazo]);
            const n = outbox().length;
            if (n === 0) { vaciarLocal(); return { ok: true, pendientes: 0 }; }   // sin cambios pendientes no se pierde nada (lo local es solo un espejo de la nube)
            return { ok: false, pendientes: n };
        } finally { clearTimeout(reloj); }
    }

    function cerrar() { oyentes.length = 0; oyentesConflicto.length = 0; if (canal) { canal.onmessage = null; try { canal.close && canal.close(); } catch { /* */ } } }
    const copiaCompleta = () => Object.fromEntries(Object.entries(copiaActual()).map(([k, f]) => [k, clonar(f)]));

    return { leer, listar, guardar, borrar, alCambiar, alConflicto, sincronizar, estado, pendientes, puntero, copiaCompleta, prepararSalida, vaciarLocal, cerrar };
}