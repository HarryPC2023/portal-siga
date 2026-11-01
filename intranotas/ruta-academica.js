// ruta-academica.js — Lógica de la "Ruta académica" (antes "Ruta del curso").
// Módulo PURO: no toca el DOM ni Supabase. Recibe el progreso ya construido por
// progreso-carrera.js (construirProgresoCarrera) y responde: "si este curso queda
// pendiente, ¿qué cursos de mi carrera se retrasan, cuántos créditos son y desde qué ciclo?".
//
// Reglas:
//  - La cadena baja por TODOS los niveles (prerrequisitos de prerrequisitos) hasta el final.
//  - Solo cuentan los cursos OBLIGATORIOS que todavía no están aprobados. Los electivos se
//    listan aparte y no suman en los números: el alumno elige cuáles llevar (aunque tiene que
//    completar los créditos de electivos que pide su carrera), así que un electivo bloqueado
//    no retrasa la carrera, solo deja menos opciones.
//  - Cada curso aparece UNA sola vez aunque el Avance traiga filas repetidas.
import { tipoDeCurso } from './clasificacion-cursos.js';

export const PESOS = {
    clave: { clave: 'clave', texto: 'Curso clave para tu avance' },
    importante: { clave: 'importante', texto: 'Importante para tu ruta' },
    puntual: { clave: 'puntual', texto: 'Impacto puntual' },
    ninguno: { clave: 'ninguno', texto: 'No bloquea otros cursos' },
};

export function pesoDeRuta(cursosQueSeRetrasan) {
    if (cursosQueSeRetrasan >= 8) return PESOS.clave;
    if (cursosQueSeRetrasan >= 5) return PESOS.importante;
    if (cursosQueSeRetrasan >= 1) return PESOS.puntual;
    return PESOS.ninguno;
}

/* Un curso por código. Si el Avance repite un código, gana la fila obligatoria. */
export function cursosUnicos(progreso) {
    const mapa = new Map();
    (progreso?.cursos || []).forEach((c) => {
        const previo = mapa.get(c.codigo);
        if (!previo || (previo.categoria !== 'obligatorio' && c.categoria === 'obligatorio')) mapa.set(c.codigo, c);
    });
    return mapa;
}

function mapaDeHijos(unicos) {
    const hijos = new Map();
    unicos.forEach((curso) => {
        new Set(curso.prereq.map((p) => p.code)).forEach((codigoPadre) => {
            if (!hijos.has(codigoPadre)) hijos.set(codigoPadre, []);
            hijos.get(codigoPadre).push(curso);
        });
    });
    return hijos;
}

/* Todos los cursos que dependen (directa o indirectamente) de `codigo`. */
function descendientes(hijos, codigo) {
    const vistos = new Set([codigo]);
    const salida = [];
    const pila = [codigo];
    while (pila.length) {
        (hijos.get(pila.pop()) || []).forEach((c) => {
            if (vistos.has(c.codigo)) return;
            vistos.add(c.codigo);
            salida.push(c);
            pila.push(c.codigo);
        });
    }
    return salida;
}

/* Ruta de un curso: qué pasa si queda pendiente. null si el curso no está en el plan. */
export function rutaAcademica(progreso, codigo, unicos = cursosUnicos(progreso), hijos = mapaDeHijos(unicos)) {
    const curso = unicos.get(codigo);
    if (!curso) return null;

    const todos = descendientes(hijos, codigo).filter((c) => c.estado !== 'aprobado');
    const obligatorios = todos.filter((c) => c.categoria === 'obligatorio');
    const electivos = todos.filter((c) => c.categoria !== 'obligatorio')
        .sort((a, b) => a.codigo.localeCompare(b.codigo))
        .map((c) => ({ codigo: c.codigo, nombre: c.nombre, tipo: tipoDeCurso(c) }));

    const enCadena = new Set([codigo, ...obligatorios.map((c) => c.codigo)]);
    // Lo que le falta a un curso de la cadena, aparte de lo que ya está dentro de la cadena.
    const tambienNecesita = (c) => [...new Set(c.prereq.map((p) => p.code))]
        .filter((code) => !enCadena.has(code))
        .filter((code) => { const r = unicos.get(code); return r && r.estado !== 'aprobado'; });

    const ciclosAfectados = [...new Set(obligatorios.map((c) => c.ciclo).filter((n) => n !== null))].sort((a, b) => a - b);
    const primerCiclo = ciclosAfectados.length ? ciclosAfectados[0] : null;
    const ultimoCiclo = ciclosAfectados.length ? ciclosAfectados[ciclosAfectados.length - 1] : null;

    const nodo = (c) => ({
        codigo: c.codigo, nombre: c.nombre, creditos: c.creditos, tipo: tipoDeCurso(c), tambien: tambienNecesita(c),
    });
    const porCodigo = (a, b) => a.codigo.localeCompare(b.codigo);

    const columnas = [];
    if (ciclosAfectados.length) {
        const ciclosColumnas = [...new Set([...(curso.ciclo !== null ? [curso.ciclo] : []), ...ciclosAfectados])].sort((a, b) => a - b);
        if (curso.ciclo === null) columnas.push({ ciclo: null, origen: true, cursos: [] });
        ciclosColumnas.forEach((ciclo) => columnas.push({
            ciclo,
            origen: ciclo === curso.ciclo,
            primero: ciclo === primerCiclo,
            cursos: obligatorios.filter((c) => c.ciclo === ciclo).sort(porCodigo).map(nodo),
        }));
    }

    return {
        codigo: curso.codigo,
        nombre: curso.nombre,
        creditos: curso.creditos,
        ciclo: curso.ciclo,
        estado: curso.estado,
        tipo: tipoDeCurso(curso),
        n: obligatorios.length,
        creditosAfectados: obligatorios.reduce((s, c) => s + c.creditos, 0),
        primerCiclo,
        ultimoCiclo,
        primeros: obligatorios.filter((c) => c.ciclo === primerCiclo).sort(porCodigo).map((c) => ({ codigo: c.codigo, nombre: c.nombre })),
        columnas,
        electivos,
        peso: pesoDeRuta(obligatorios.length),
    };
}

/* Tarjetas de "Mis cursos": los cursos del periodo en pantalla que están en el plan del
   alumno y todavía no están aprobados, del que más cursos abre al que menos. */
export function cursosParaRuta(progreso, cursosDelPeriodo) {
    const unicos = cursosUnicos(progreso);
    const hijos = mapaDeHijos(unicos);
    const vistos = new Set();
    const lista = [];
    (cursosDelPeriodo || []).forEach(({ codigo, nombre }) => {
        if (!codigo || vistos.has(codigo)) return;
        vistos.add(codigo);
        const curso = unicos.get(codigo);
        if (!curso || curso.estado === 'aprobado') return;
        const ruta = rutaAcademica(progreso, codigo, unicos, hijos);
        if (ruta) lista.push({ ...ruta, nombre: nombre || ruta.nombre });
    });
    return lista.sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre, 'es'));
}
