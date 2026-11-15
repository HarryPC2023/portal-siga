// intranotas/sync-notas.js — Lleva a la cuenta (SigaEstado) lo que Intranotas
// antes guardaba solo en el navegador: las notas probables del botón "Guardar"
// y los cuadritos de descartes ("Eliminar la PC más baja" / "Eliminar LAB").
//
// Qué NO hace: no toca lo oficial de INTRALU (eso ya vive en Supabase) y no
// sube lo que el alumno escribe sin pulsar Guardar.
//
// Cómo se usa desde notas.js: `iniciarSyncNotas({...})` devuelve un objeto con
// funciones SÍNCRONAS (leerNotas, escribirNotas, leerDescartes, guardarDescarte)
// o `null` si no corresponde sincronizar; en ese caso notas.js sigue
// usando el navegador como siempre.
//
// Filas en la nube (módulo 'intranotas'):
//   notas:{periodo}:{curso|sección}   -> { variable: { v, base } }
//   descartes:{curso|sección}|{periodo} -> { campo: true/false }

const MODULO = 'intranotas';
const PREF_NOTAS = 'notas:';
const PREF_DESC = 'descartes:';

// Interruptor: por ahora solo quien esté en la lista usa la sincronización.
// Para abrirlo a todos más adelante: que devuelva siempre !!usuario.
const UIDS_SYNC = [
    'f544dbae-fc6f-4fe6-9b86-fc72aef462a1', // Harry
];
const CORREOS_SYNC = [
    'openmindseduc@gmail.com', // cuenta alternativa de Harry (para probar con otro celular)
];

export function syncNotasActiva(usuario) {
    try {
        if (new URLSearchParams(location.search).get('sinsync') === '1') return false;
    } catch { /* sin location (pruebas) */ }
    return !!usuario;
}

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function leerViejo(clave) {
    try { return JSON.parse(localStorage.getItem(clave)) || {}; } catch { return {}; }
}

/* Convierte las filas de la nube en la forma que notas.js ya conoce. */
function armarNotas(estado) {
    const almacen = {};
    estado.listar(MODULO, PREF_NOTAS).forEach(({ clave, valor }) => {
        const resto = clave.slice(PREF_NOTAS.length);
        const i = resto.indexOf(':');
        if (i < 1) return;
        const periodo = resto.slice(0, i);
        const claveCurso = resto.slice(i + 1);
        if (!valor || typeof valor !== 'object') return;
        (almacen[periodo] ||= {})[claveCurso] = valor;
    });
    return almacen;
}

function armarDescartes(estado) {
    const todo = {};
    estado.listar(MODULO, PREF_DESC).forEach(({ clave, valor }) => {
        todo[clave.slice(PREF_DESC.length)] = valor || {};
    });
    return todo;
}

/**
 * @param {object}   o
 * @param {object}   [o.estado]      SigaEstado (en pruebas se inyecta uno falso)
 * @param {object}   o.usuario       usuario de Supabase (para el interruptor)
 * @param {boolean}  [o.forzar]      salta el interruptor (pruebas)
 * @param {{notas:string, descartes:string}} o.clavesViejas  claves de localStorage de antes
 * @param {Function} o.alRemoto      () => repintar: llegó algo de otro dispositivo
 * @param {Function} o.avisar        (texto) => mostrar mensaje discreto
 */
export async function iniciarSyncNotas({ estado, usuario, forzar = false, clavesViejas, alRemoto, avisar }) {
    if (!forzar && !syncNotasActiva(usuario)) return null;

    try {
        if (!estado) ({ SigaEstado: estado } = await import('../js/sync-estado.js?v=1'));
        await estado.listo;

        const viejoNotas = leerViejo(clavesViejas.notas);
        const viejoDesc = leerViejo(clavesViejas.descartes);
        const hayViejo = Object.keys(viejoNotas).length > 0 || Object.keys(viejoDesc).length > 0;

        // Primero se baja lo que hay en la cuenta; recién después se sube lo viejo.
        const sync = await estado.sincronizar();
        // Sin conexión y con datos viejos pendientes de subir: mejor no activar
        // esta visita (se sigue con el navegador) y subirlos la próxima vez.
        if (!sync.ok && hayViejo) return null;

        let notas = armarNotas(estado);
        let descartes = armarDescartes(estado);
        let sinGuardar = false;

        // ---- Migración de lo que ya tenía este navegador (no pisa la nube) ----
        if (hayViejo) {
            for (const periodo of Object.keys(viejoNotas)) {
                for (const claveCurso of Object.keys(viejoNotas[periodo] || {})) {
                    if (notas[periodo]?.[claveCurso]) continue;
                    await estado.guardar(MODULO, `${PREF_NOTAS}${periodo}:${claveCurso}`,
                        viejoNotas[periodo][claveCurso], { conservar: true });
                }
            }
            for (const clave of Object.keys(viejoDesc)) {
                if (descartes[clave]) continue;
                await estado.guardar(MODULO, PREF_DESC + clave, viejoDesc[clave]);
            }
            try {
                localStorage.removeItem(clavesViejas.notas);
                localStorage.removeItem(clavesViejas.descartes);
            } catch { /* nada */ }
            notas = armarNotas(estado);
            descartes = armarDescartes(estado);
        }

        // Lo escrito en pantalla sin pulsar Guardar: no se pisa si llega algo de afuera.
        try {
            document.getElementById('listaCursos')?.addEventListener('input', () => { sinGuardar = true; });
        } catch { /* sin documento (pruebas) */ }

        estado.alCambiar(MODULO, null, (ev) => {
            if (ev.origen === 'local') return;
            notas = armarNotas(estado);
            descartes = armarDescartes(estado);
            if (!sinGuardar) alRemoto?.();
            else avisar?.('ℹ️ Hay cambios de otro dispositivo. Guarda o limpia para verlos');
        });

        estado.alConflicto((c) => {
            if (c.modulo !== MODULO) return;
            avisar?.('ℹ️ Se conservó la versión de otro dispositivo');
            notas = armarNotas(estado);
            descartes = armarDescartes(estado);
            alRemoto?.();
        });

        return {
            leerNotas() { return JSON.parse(JSON.stringify(notas)); },

            /* Sube solo las filas que cambiaron. Devuelve true (la subida corre
               en segundo plano; si no hay red queda en cola y se reintenta). */
            escribirNotas(nuevo) {
                sinGuardar = false;
                const viejo = notas;
                notas = JSON.parse(JSON.stringify(nuevo));
                for (const periodo of Object.keys(nuevo)) {
                    for (const claveCurso of Object.keys(nuevo[periodo])) {
                        if (igual(viejo[periodo]?.[claveCurso], nuevo[periodo][claveCurso])) continue;
                        Promise.resolve(estado.guardar(MODULO, `${PREF_NOTAS}${periodo}:${claveCurso}`,
                            nuevo[periodo][claveCurso], { conservar: true })).catch(console.error);
                    }
                }
                for (const periodo of Object.keys(viejo)) {
                    for (const claveCurso of Object.keys(viejo[periodo])) {
                        if (nuevo[periodo]?.[claveCurso]) continue;
                        Promise.resolve(estado.borrar(MODULO, `${PREF_NOTAS}${periodo}:${claveCurso}`)).catch(console.error);
                    }
                }
                return true;
            },

            leerDescartes(clave) { return { ...(descartes[clave] || {}) }; },

            guardarDescarte(clave, campo, valor) {
                descartes[clave] = { ...(descartes[clave] || {}), [campo]: valor };
                Promise.resolve(estado.guardar(MODULO, PREF_DESC + clave, descartes[clave])).catch(console.error);
            },
        };
    } catch (e) {
        console.error('Sincronización de Intranotas desactivada en esta visita:', e);
        return null;
    }
}