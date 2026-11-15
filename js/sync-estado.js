// js/sync-estado.js — SigaEstado: sincronización entre dispositivos para TODAS las secciones de SIGA.
//
// Uso en cualquier página (módulo ES):
//   import { SigaEstado } from './sync-estado.js?v=1';
//   await SigaEstado.listo;                                   // espera a que haya sesión
//   SigaEstado.guardar('intranotas', 'nota:MCD:2026-2', { pc1: 15 });
//   const v = SigaEstado.leer('intranotas', 'nota:MCD:2026-2');
//   SigaEstado.alCambiar('intranotas', null, (e) => repintar(e));   // null = cualquier clave del módulo
//
// Se sincroniza solo: al abrir, al volver a la pestaña, al reconectar, cada pocos minutos
// y poco después de cada cambio. No usa Realtime.
import { supabase } from './auth-siga.js?v=9';
import { crearEstado } from './sync-estado-nucleo.js?v=1';

const CAMPOS = 'modulo,clave,valor,borrado,version,actualizado_en';
const citar = (t) => '"' + String(t).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';   // valores seguros dentro de .or()

function comprobar({ data, error }) { if (error) throw error; return data; }

// Traduce lo que necesita el núcleo a llamadas de Supabase (RPC + lectura propia por RLS).
export function crearNubeSupabase(sb) {
    const aplicarCursor = (q, { cursor, despuesDe }) => {
        if (cursor) q = q.gt('actualizado_en', cursor);
        if (despuesDe) {
            const m = citar(despuesDe.modulo), c = citar(despuesDe.clave);
            q = q.or(`modulo.gt.${m},and(modulo.eq.${m},clave.gt.${c})`);
        }
        return q;
    };
    return {
        async info() { return comprobar(await sb.rpc('estado_info')); },
        async guardar(a) {
            return comprobar(await sb.rpc('estado_guardar', {
                p_modulo: a.modulo, p_clave: a.clave, p_valor: a.borrar ? null : a.valor, p_version_base: a.versionBase,
                p_op_id: a.opId, p_ultima_sync: a.ultimaSync, p_borrar: !!a.borrar, p_conservar_si_conflicto: !!a.conservar,
            }));
        },
        async leerPagina({ cursor, despuesDe, limite }) {
            let q = sb.from('estado_usuario').select(CAMPOS).order('modulo', { ascending: true }).order('clave', { ascending: true }).limit(limite);
            return comprobar(await aplicarCursor(q, { cursor, despuesDe }));
        },
        async leerUno(modulo, clave) {
            const d = comprobar(await sb.from('estado_usuario').select(CAMPOS).eq('modulo', modulo).eq('clave', clave).maybeSingle());
            return d || null;
        },
    };
}

// ───────────── cableado de la página ─────────────
let actual = null;
let uidActual = null;
let temporizadores = [];
let resolverListo;
export const listoPrimeraVez = new Promise((r) => { resolverListo = r; });

function noListo() { throw new Error('SigaEstado: aún no hay sesión. Usa: await SigaEstado.listo'); }
const delegar = (nombre) => (...a) => (actual ? actual[nombre](...a) : noListo());

function detener() {
    temporizadores.forEach((t) => clearInterval(t)); temporizadores = [];
    if (actual) { actual.cerrar(); actual = null; }
    uidActual = null;
}

async function iniciar(uid) {
    if (uid === uidActual && actual) return;
    detener();
    uidActual = uid;
    let debounce = null;
    const canal = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('siga_estado_' + uid) : null;
    actual = crearEstado({
        nube: crearNubeSupabase(supabase), almacen: window.localStorage, uid, canal,
        alEncolar: () => { clearTimeout(debounce); debounce = setTimeout(() => actual && actual.sincronizar(), 1500); },
    });
    const sync = () => { if (actual && navigator.onLine !== false) actual.sincronizar(); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(); });
    window.addEventListener('online', sync);
    temporizadores.push(setInterval(() => { if (document.visibilityState === 'visible') sync(); }, 3 * 60 * 1000));
    await actual.sincronizar();           // la primera vez baja ANTES de subir
    resolverListo(true);
}

supabase.auth.getSession().then(({ data }) => { if (data.session) iniciar(data.session.user.id); });
supabase.auth.onAuthStateChange((evento, sesion) => {
    if (evento === 'SIGNED_OUT') detener();
    else if (sesion && sesion.user) iniciar(sesion.user.id);
});

export const SigaEstado = {
    listo: listoPrimeraVez,
    leer: delegar('leer'), listar: delegar('listar'), guardar: delegar('guardar'), borrar: delegar('borrar'),
    alCambiar: delegar('alCambiar'), alConflicto: delegar('alConflicto'),
    sincronizar: delegar('sincronizar'), estado: delegar('estado'),
    // Para el botón "Cerrar sesión": sube lo pendiente y, si todo llegó a la nube, borra lo local de este navegador.
    // Devuelve { ok:true } o { ok:false, pendientes:N } (en ese caso NO borra: la pantalla debe preguntar).
    async prepararSalida(opciones) { return actual ? actual.prepararSalida(opciones) : { ok: true, pendientes: 0 }; },
    // Borrado forzado (cuando el usuario confirma "Cerrar sesión igual").
    vaciarLocal() { if (actual) actual.vaciarLocal(); },
};
if (typeof window !== 'undefined') window.SigaEstado = SigaEstado;