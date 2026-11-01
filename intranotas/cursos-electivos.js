// cursos-electivos.js — Lógica de "Cursos electivos" (beta). Módulo PURO: no toca el DOM
// ni Supabase. Recibe el progreso ya construido por progreso-carrera.js
// (construirProgresoCarrera) y arma la lista de electivos del alumno con:
//   - su estado (aprobado, lo lleva ahora, disponible, próximo ciclo, bloqueado, o
//     "prerrequisitos por definir" en los electivos de la malla 2026),
//   - sus prerrequisitos con el estado de cada uno,
//   - el ciclo desde el que se habilita (estimación: el ciclo siguiente al de su
//     prerrequisito más alto),
//   - si se dicta en el ciclo de la carga horaria que tenga Horarios (solo FIIS por ahora).
// Los estados salen de progreso-carrera.js, los mismos de "Progreso de tu carrera".

/* Créditos de electivos que pide el plan del alumno. La fuente principal es el encabezado de su propio
   Avance ("N° Mínimo de Créditos Electivos"), que la sincronización guarda en su perfil
   (perfiles_usuario.creditos_electivos_min). Esta tabla es solo un respaldo para quien todavía no
   volvió a sincronizar desde que existe ese dato: si no hay ninguno de los dos, el encabezado
   simplemente no muestra los créditos. */
export const CREDITOS_ELECTIVOS_RESPALDO = {
    'fiis/sistemas': 15,
};

export function creditosRequeridos(facultadSigla, carreraId) {
    const clave = `${String(facultadSigla || '').toLowerCase()}/${carreraId || ''}`;
    return CREDITOS_ELECTIVOS_RESPALDO[clave] ?? null;
}

/* `requisitos` = { creditos_electivos_min } leído del perfil (o null). Primero lo que dice el PDF del
   alumno; si no está, el respaldo; si tampoco, null. */
export function creditosDelPlan(perfil, requisitos) {
    const delPdf = Number(requisitos?.creditos_electivos_min);
    if (Number.isFinite(delPdf) && delPdf > 0) return delPdf;
    return creditosRequeridos(perfil?.facultad, perfil?.carrera);
}

/* Carga horaria oficial que usa también Horarios. Qué archivo corresponde a cada facultad y a qué ciclo
   lo dice UN solo archivo: horarios/static/data/cargas/ciclos.json, p. ej.
       { "fiis": { "ciclo": "2026-2", "archivo": "fiis-2026-2.json" } }
   Al cambiar de ciclo se sube el JSON nuevo y se cambian esas dos líneas; nada de esto se toca en el código. */
export const RUTA_CICLOS = '../horarios/static/data/cargas/ciclos.json';
export const CARPETA_CARGAS = '../horarios/static/data/cargas/';

/* Elige la carga de la facultad, o null si no hay o si ese ciclo YA TERMINÓ (`estaVigente(ciclo)`):
   mejor no decir nada que decir "se dicta" con un dato vencido. */
export function elegirCarga(catalogo, facultadSigla, estaVigente = () => true) {
    const cfg = catalogo?.[String(facultadSigla || '').toLowerCase()];
    if (!cfg || !cfg.ciclo || !cfg.archivo) return null;
    if (!estaVigente(cfg.ciclo)) return null;
    return { ciclo: cfg.ciclo, url: CARPETA_CARGAS + cfg.archivo };
}

/* El JSON de la carga horaria trae los cursos por nombre y, dentro, cada sección (U, V, W…) con su
   código. Devuelve { CODIGO: ['U', 'V'] }. */
export function indexarCarga(json) {
    const mapa = {};
    Object.values(json?.cursos || {}).forEach((secciones) => {
        Object.entries(secciones || {}).forEach(([seccion, info]) => {
            const codigo = String(info?.codigo || '').trim().toUpperCase();
            if (!codigo) return;
            if (!mapa[codigo]) mapa[codigo] = [];
            mapa[codigo].push(seccion);
        });
    });
    return mapa;
}

/* Ciclo en el que está el alumno ahora: el ciclo del que lleva más cursos obligatorios (si hay
   empate, el más alto). null si no se puede saber. */
export function cicloActualDelAlumno(progreso) {
    const conteo = {};
    (progreso?.cursos || []).forEach((c) => {
        if (c.categoria !== 'obligatorio' || c.estado !== 'en_curso' || c.ciclo === null) return;
        conteo[c.ciclo] = (conteo[c.ciclo] || 0) + 1;
    });
    const ciclos = Object.keys(conteo).map(Number);
    if (!ciclos.length) return null;
    return ciclos.sort((a, b) => conteo[b] - conteo[a] || b - a)[0];
}

const SIN_CODIGO = /^S\/?C\b/i;   // "S/C" = sin código asignado (electivos de la malla 2026)

/* Lista de electivos del alumno. `carga` es el resultado de indexarCarga (o null si no hay). */
export function construirElectivos(progreso, carga = null) {
    const porCodigo = progreso?.porCodigo || {};
    const memo = new Map();

    // Ciclo en el que se puede llevar un curso: el suyo si es obligatorio; si es un electivo, el ciclo
    // siguiente al de su prerrequisito más alto (recursivo, por si un electivo pide otro electivo).
    function cicloDeLlevada(curso, pila = new Set()) {
        if (!curso) return null;
        if (curso.categoria === 'obligatorio' || curso.ciclo !== null) return curso.ciclo;
        if (memo.has(curso.codigo)) return memo.get(curso.codigo);
        if (pila.has(curso.codigo)) return null;
        pila.add(curso.codigo);
        const previos = curso.prereq.map((p) => porCodigo[p.code]).filter(Boolean)
            .map((r) => cicloDeLlevada(r, pila)).filter((n) => n !== null);
        const resultado = previos.length ? Math.max(...previos) + 1 : null;
        memo.set(curso.codigo, resultado);
        return resultado;
    }

    const electivos = (progreso?.cursos || [])
        .filter((c) => c.categoria !== 'obligatorio')
        .map((c) => {
            const prereqs = c.prereq.map((p) => porCodigo[p.code]).filter(Boolean).map((r) => ({
                codigo: r.codigo,
                nombre: r.nombre,
                estado: r.estado === 'aprobado' ? 'aprobado' : r.estado === 'en_curso' ? 'en_curso' : 'falta',
            }));
            const porDefinir = SIN_CODIGO.test(c.codigo || '') && !prereqs.length;
            let estado = c.estado;
            if (porDefinir && estado !== 'aprobado' && estado !== 'en_curso') estado = 'definir';
            const secciones = carga ? (carga[String(c.codigo).toUpperCase()] || []) : null;
            return {
                codigo: c.codigo,
                nombre: c.nombre,
                creditos: c.creditos,
                // Los "complementarios" ya no se manejan aparte: cuentan como electivos comunes.
                tipo: 'electivo',
                estado,
                prereqs,
                porDefinir,
                ciclo: porDefinir ? null : (prereqs.length ? cicloDeLlevada(c) : 1),
                dictado: secciones ? { secciones: secciones.length, lista: secciones } : null,
            };
        });

    return {
        cicloActual: cicloActualDelAlumno(progreso),
        electivos: electivos.sort((a, b) => (a.ciclo ?? 99) - (b.ciclo ?? 99) || a.nombre.localeCompare(b.nombre, 'es')),
    };
}

const quitarTildes = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function filtrarElectivos(electivos, filtro = 'todos', busqueda = '') {
    const q = quitarTildes(busqueda).trim();
    return electivos.filter((e) => {
        if (q && !quitarTildes(`${e.nombre} ${e.codigo}`).includes(q)) return false;
        if (filtro === 'disp') return e.estado === 'disponible';
        if (filtro === 'prox') return e.estado === 'proximo';
        if (filtro === 'bloq') return e.estado === 'bloqueado';
        if (filtro === 'dict') return !!e.dictado && e.dictado.secciones > 0;
        return true;
    });
}

/* Contadores de cada filtro (sin tener en cuenta la búsqueda). */
export function contarElectivos(electivos) {
    return {
        todos: electivos.length,
        disp: electivos.filter((e) => e.estado === 'disponible').length,
        prox: electivos.filter((e) => e.estado === 'proximo').length,
        bloq: electivos.filter((e) => e.estado === 'bloqueado').length,
        dict: electivos.filter((e) => e.dictado && e.dictado.secciones > 0).length,
    };
}

/* [{ ciclo: 5, cursos: [...] }, …], de menor a mayor ciclo; los que no tienen ciclo (prerrequisitos
   por definir) van al final con ciclo null. */
export function agruparPorCiclo(electivos) {
    const grupos = new Map();
    electivos.forEach((e) => {
        const clave = e.ciclo ?? null;
        if (!grupos.has(clave)) grupos.set(clave, []);
        grupos.get(clave).push(e);
    });
    return [...grupos.entries()]
        .sort((a, b) => (a[0] ?? 99) - (b[0] ?? 99))
        .map(([ciclo, cursos]) => ({ ciclo, cursos }));
}
