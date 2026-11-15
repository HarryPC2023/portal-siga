// js/asesorias-estado.js — Lo que la portada de Asesorías recuerda de cada alumno,
// ahora en su cuenta (SigaEstado) para que se vea igual en PC y celular:
//   - "Continúa donde quedaste"   (último recurso abierto)
//   - bienvenida ya vista         (la burbuja de "¡Hola!")
//   - novedades ya anunciadas     (ids de recursos)
//
// Si no hay sesión o la cuenta no responde, se usa el navegador como antes
// (mismas claves de siempre), sin romper nada.
// Lo que ya había en este navegador se sube solo la primera vez (sin pisar la cuenta).

const MODULO = 'asesorias';
const LOCAL = {
    ultimo: 'siga_asesorias_ultimo',
    burbuja_vista: 'siga_asesorias_burbuja',
    novedades_vistas: 'siga_asesorias_novedades_vistas',
};

export function crearEstadoAsesorias({ cargarEstado, local }) {
    let estado = null;                       // SigaEstado cuando hay cuenta; null = navegador
    let ultimo = null;
    let burbuja = false;
    let vistas = [];
    const tocado = { ultimo: false, burbuja: false, vistas: false }; // lo que el alumno hizo antes de que cargue la cuenta

    const leerLocal = (clave) => { try { return local.getItem(LOCAL[clave]); } catch { return null; } };
    const escribirLocal = (clave, texto) => { try { local.setItem(LOCAL[clave], texto); } catch { /* sin almacenamiento */ } };
    const quitarLocal = (clave) => { try { local.removeItem(LOCAL[clave]); } catch { /* nada */ } };
    const json = (t, porDefecto) => { try { const v = JSON.parse(t); return v ?? porDefecto; } catch { return porDefecto; } };

    function cargarDesdeNavegador() {
        if (!tocado.ultimo) ultimo = json(leerLocal('ultimo'), null);
        if (!tocado.burbuja) burbuja = leerLocal('burbuja_vista') === '1';
        if (!tocado.vistas) { const v = json(leerLocal('novedades_vistas'), []); vistas = Array.isArray(v) ? v : []; }
    }

    function cargarDesdeCuenta() {
        if (!tocado.ultimo) ultimo = estado.leer(MODULO, 'ultimo') ?? null;
        if (!tocado.burbuja) burbuja = estado.leer(MODULO, 'burbuja_vista') === true;
        if (!tocado.vistas) { const v = estado.leer(MODULO, 'novedades_vistas'); vistas = Array.isArray(v) ? v : []; }
    }

    async function migrarDelNavegador() {
        const lUltimo = json(leerLocal('ultimo'), null);
        if (lUltimo && estado.leer(MODULO, 'ultimo') === undefined) await estado.guardar(MODULO, 'ultimo', lUltimo);
        if (leerLocal('burbuja_vista') === '1' && estado.leer(MODULO, 'burbuja_vista') === undefined) {
            await estado.guardar(MODULO, 'burbuja_vista', true);
        }
        const lVistas = json(leerLocal('novedades_vistas'), []);
        if (Array.isArray(lVistas) && lVistas.length) {
            const enCuenta = estado.leer(MODULO, 'novedades_vistas');
            const union = [...new Set([...(Array.isArray(enCuenta) ? enCuenta : []), ...lVistas])];
            if (union.length !== (Array.isArray(enCuenta) ? enCuenta.length : -1)) {
                await estado.guardar(MODULO, 'novedades_vistas', union);
            }
        }
        ['ultimo', 'burbuja_vista', 'novedades_vistas'].forEach(quitarLocal);
    }

    const listo = (async () => {
        try {
            const e = await cargarEstado();
            await e.listo;
            const r = await e.sincronizar();
            const hayViejo = ['ultimo', 'burbuja_vista', 'novedades_vistas'].some((k) => leerLocal(k) !== null);
            // Sin conexión y con datos viejos por subir: se sigue con el navegador esta vez.
            if (!r.ok && hayViejo) { cargarDesdeNavegador(); return; }
            estado = e;
            if (hayViejo) await migrarDelNavegador();
            cargarDesdeCuenta();
            estado.alCambiar(MODULO, null, (ev) => { if (ev.origen !== 'local') cargarDesdeCuenta(); });
        } catch {
            estado = null;
            cargarDesdeNavegador();
        }
    })();

    function guardar(clave, valor, comoTexto) {
        listo.then(() => {
            if (estado) Promise.resolve(estado.guardar(MODULO, clave, valor)).catch(() => { });
            else escribirLocal(clave, comoTexto);
        });
    }

    return {
        listo,
        leerUltimo: () => ultimo,
        recordarUltimo(slug, id) {
            ultimo = { slug, id, t: Date.now() }; tocado.ultimo = true;
            guardar('ultimo', ultimo, JSON.stringify(ultimo));
        },
        burbujaVista: () => burbuja,
        marcarBurbuja() { burbuja = true; tocado.burbuja = true; guardar('burbuja_vista', true, '1'); },
        leerVistas: () => [...vistas],
        guardarVistas(lista) {
            vistas = [...new Set([...vistas, ...lista])]; tocado.vistas = true;
            guardar('novedades_vistas', vistas, JSON.stringify(vistas));
        },
    };
}

// Instancia real (solo en el navegador; en pruebas se usa crearEstadoAsesorias con piezas falsas).
const real = typeof window === 'undefined' ? null : crearEstadoAsesorias({
    cargarEstado: async () => (await import('./sync-estado.js?v=1')).SigaEstado,
    local: window.localStorage,
});
const vacio = { listo: Promise.resolve(), leerUltimo: () => null, recordarUltimo() { }, burbujaVista: () => false, marcarBurbuja() { }, leerVistas: () => [], guardarVistas() { } };
const inst = real || vacio;

export const listoAsesorias = inst.listo;
export const leerUltimo = inst.leerUltimo;
export const recordarUltimo = inst.recordarUltimo;
export const burbujaVista = inst.burbujaVista;
export const marcarBurbuja = inst.marcarBurbuja;
export const leerVistas = inst.leerVistas;
export const guardarVistas = inst.guardarVistas;