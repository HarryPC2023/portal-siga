// js/asesorias-avance.js — Lleva a la cuenta el AVANCE de cada asesoría web
// (checklists marcados, pasos vistos, resultados de práctica, avisos de "ya lo leí"),
// para que se vea igual en PC y celular. Las asesorías no se tocan: siguen leyendo y
// escribiendo en el navegador como siempre, y este módulo las espeja con la cuenta.
//
//  · Fuera de una asesoría (portada, página del curso): BAJA el avance de la cuenta al
//    navegador, para que al abrir la asesoría ya esté ahí. También sube lo que este
//    navegador tenía de antes (sin pisar la cuenta).
//  · Dentro de una asesoría: VIGILA los cambios de avance y los sube a la cuenta.
//
// Qué cuenta como avance: las claves 'siga_aw_…' y 'asesoria:…' de las asesorías, salvo las
// que dependen de cada pantalla o impresora (posición, modo color/ahorro, tinta, sistema).
// Si algo falla, no pasa nada: la asesoría sigue funcionando solo con el navegador.

const MODULO = 'avance';
const PREFIJOS = ['siga_aw_', 'asesoria:'];
const SOLO_AQUI = /(_|:)(pos|modo|tinta|system)$/;
const K_DUENO = 'siga_avance_dueno';     // de qué cuenta es el avance guardado en este navegador
const K_CLAVES = 'siga_avance_claves';   // claves que ya se sincronizaron (para notar borrados)
const CADA_MS = 3000;

export const esAvance = (k) => PREFIJOS.some((p) => k.startsWith(p)) && !SOLO_AQUI.test(k);

export function crearAvance({ cargarEstado, obtenerUid, local }) {
    const json = (t, d) => { try { const v = JSON.parse(t); return v ?? d; } catch { return d; } };
    const claveLocal = () => { const r = []; for (let i = 0; i < local.length; i++) { const k = local.key(i); if (k && esAvance(k)) r.push(k); } return r; };
    const foto = () => new Map(claveLocal().map((k) => [k, local.getItem(k)]));
    const guardarClaves = (set) => { try { local.setItem(K_CLAVES, JSON.stringify([...set])); } catch { /* nada */ } };

    async function conectar() {
        const e = await cargarEstado();
        await e.listo;
        const uid = await obtenerUid();
        if (!uid) throw new Error('sin cuenta');
        return { e, uid };
    }

    async function hidratar() {
        try {
            const { e, uid } = await conectar();
            const r = await e.sincronizar();
            if (!r.ok) return;                                   // sin conexión: no se toca nada

            const dueno = local.getItem(K_DUENO);
            if (dueno && dueno !== uid) {                        // avance de OTRA cuenta en este navegador
                claveLocal().forEach((k) => local.removeItem(k));
                local.removeItem(K_CLAVES);
            }

            const nube = new Map(e.listar(MODULO).filter(({ valor }) => typeof valor === 'string').map(({ clave, valor }) => [clave, valor]));
            const sync = new Set(json(local.getItem(K_CLAVES), []));
            const nuevoSync = new Set(nube.keys());

            for (const [k, v] of nube) if (esAvance(k) && local.getItem(k) !== v) local.setItem(k, v);

            for (const k of claveLocal()) {
                if (nube.has(k)) continue;
                if (sync.has(k)) { local.removeItem(k); continue; }       // lo borraron en otro dispositivo
                await e.guardar(MODULO, k, local.getItem(k));              // es nuevo de este navegador
                nuevoSync.add(k);
            }
            guardarClaves(nuevoSync);
            local.setItem(K_DUENO, uid);
        } catch { /* sin cuenta o sin conexión: se sigue con el navegador */ }
    }

    async function vigilar() {
        let conexion = null;
        try { conexion = await conectar(); } catch { return { revisar() { }, detener() { } }; }
        const { e, uid } = conexion;
        const dueno = local.getItem(K_DUENO);
        if (dueno && dueno !== uid) return { revisar() { }, detener() { } };   // la portada limpiará lo ajeno
        if (!dueno) { try { local.setItem(K_DUENO, uid); } catch { /* nada */ } }

        let visto = foto();
        const claves = new Set(json(local.getItem(K_CLAVES), []));

        function revisar() {
            try {
                const ahora = foto();
                for (const [k, v] of ahora) {
                    if (visto.get(k) === v) continue;
                    Promise.resolve(e.guardar(MODULO, k, v)).catch(() => { });
                    claves.add(k);
                }
                for (const k of visto.keys()) {
                    if (ahora.has(k)) continue;
                    Promise.resolve(e.borrar(MODULO, k)).catch(() => { });
                    claves.delete(k);
                }
                visto = ahora;
                guardarClaves(claves);
            } catch { /* nunca rompe la asesoría */ }
        }

        const timer = setInterval(revisar, CADA_MS);
        if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') revisar(); });
        if (typeof window !== 'undefined') window.addEventListener('pagehide', revisar);
        return { revisar, detener: () => clearInterval(timer) };
    }

    return { hidratar, vigilar };
}

// ── Arranque en el navegador ──
if (typeof window !== 'undefined') {
    const avance = crearAvance({
        cargarEstado: async () => (await import('./sync-estado.js?v=1')).SigaEstado,
        obtenerUid: async () => {
            const { obtenerSesion } = await import('./auth-siga.js?v=9');
            const s = await obtenerSesion();
            return s && s.user ? s.user.id : null;
        },
        local: window.localStorage,
    });
    let ocultaParaImprimir = false;   // el visor carga la asesoría en un iframe oculto 0×0 solo para imprimir
    try { ocultaParaImprimir = window.self !== window.top && window.innerWidth === 0 && window.innerHeight === 0; } catch { /* sin acceso */ }
    if (!ocultaParaImprimir) {
        if (window.location.pathname.includes('/assets/asesorias/')) avance.vigilar();
        else avance.hidratar();
    }
}