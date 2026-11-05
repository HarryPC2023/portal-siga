// adn-calculo.js — Cerebro del ADN académico. Módulo PURO: no toca el DOM ni Supabase.
// Recibe los periodos académicos del estudiante y devuelve, para cada uno: su perfil, las cifras que
// lo respaldan, "Lo que más destacó" (un titular + "Ver por qué"), el Dato curioso y, al final, "Qué hacer".
// Todos los textos están en adn-textos.js; aquí solo están las REGLAS.
//
// ENTRADA — un arreglo de periodos, en cualquier orden:
//   { periodo: '2024-1', abierto: false,
//     cursos: [ { codigo, nombre, creditos, nota, tipo: 'base' | 'especialidad' | 'electivo',
//                 evaluaciones: [ { esExamen: false, nota: 14 }, ... ] } ] }
//   - nota: la nota final del curso (número 0-20) o null si todavía no tiene.
//   - evaluaciones: en el orden en que se rindieron (PC1, PC2, EP, PC3, EF...). Es opcional: sin ellas no se
//     calculan los perfiles que dependen de prácticas y exámenes (Remontador, Madrugador, Finalista, Metódico).
//   - Un curso con nota null no entra en los promedios; los cursos NO aprobados sí cuentan en las cifras,
//     pero NUNCA se nombran en ningún texto.
import {
    PERFILES, PERFIL_RELATO, PERFIL_COMO_SE_CALCULA, SIN_PERFIL, EN_VIVO,
    PLANTILLAS, DATO_CURIOSO, QUE_HACER, rellenar,
} from './adn-textos.js';

/* ============ Números ajustables (todos en un solo lugar) ============ */
export const CFG = {
    UMBRAL_APROBADO: 10,           // nota mínima para aprobar un curso
    MIN_CURSOS_PERFIL: 4,          // cursos con nota que hacen falta para armar un perfil
    MIN_CURSOS_POR_TIPO: 2,        // cursos base y de carrera mínimos para comparar un tipo con otro
    BRECHA_TIPO: 1.5,              // puntos de diferencia carrera/base para hablar de una "fortaleza"
    PARIDAD: 1.0,                  // diferencia menor a esto = rindes parejo (Equilibrado)
    MIN_PRACTICAS: 3,              // prácticas con nota para opinar de la evolución de un curso
    UMBRAL_TENDENCIA: 2,           // puntos: promedio de las últimas 2 prácticas vs. las primeras 2
    UMBRAL_EXAMEN: 2,              // puntos: examen vs. práctica dentro de un curso
    MIN_CURSOS_EVALUABLES: 3,      // cursos con datos suficientes para hablar de un patrón de evaluaciones
    PROPORCION_CLARA: 0.5,         // parte de esos cursos que debe mostrar el patrón
    ESTABLE_BANDA: 1.5,            // puntos alrededor de la nota central del periodo
    ESTABLE_PROPORCION: 0.8,       // parte de los cursos que debe caer dentro de esa banda
    SUBIDA_MIN: 0.05,              // diferencia mínima de promedio para contar una subida
    RECUPERACION_MIN: 1.0,         // subida mínima de promedio para hablar de recuperación
    CAIDA_MIN: 1.0,                // bajada mínima de promedio para hablar de un periodo más desafiante
    MIN_CURSOS_CARRERA: 4,         // cursos mínimos para decir "primer periodo de carrera"
    PROPORCION_CARRERA: 0.8,       // parte de cursos de carrera para decir "casi únicamente cursos de tu carrera"
    CREDITOS_PESADO: 4,            // créditos desde los cuales un curso "pesa mucho"
    NOTA_BUENA: 13,                // nota que cuenta como "salió bien" en un curso pesado
    CARGA_ALTA_CREDITOS: 24,       // créditos desde los cuales la carga es alta
    CARGA_ALTA_CURSOS: 8,          // o cursos desde los cuales la carga es alta
};

/* ============ Utilidades ============ */
const esNota = (x) => typeof x === 'number' && Number.isFinite(x);
const promedioSimple = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const esVerano = (periodo) => Number(String(periodo).split('-')[1]) === 3;
const claveOrden = (periodo) => { const [a, t] = String(periodo).split('-').map(Number); return a * 10 + t; };
const PALABRAS = { 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez' };
const palabraNumero = (n) => PALABRAS[n] || String(n);
const esCarrera = (curso) => curso.tipo !== 'base';          // electivos y de especialidad cuentan como "tu carrera"

/* 12,7 · 16 · 13,9 (coma decimal; los enteros sin ",0"). */
export function cifra(n, dec = 1) {
    if (!esNota(n)) return '–';
    const r = Math.round(n * 10 ** dec) / 10 ** dec;
    return (Number.isInteger(r) ? String(r) : r.toFixed(dec)).replace('.', ',');
}
function listaY(items) {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}
function promedioPonderado(cursos) {
    let suma = 0, pesos = 0;
    cursos.forEach((c) => { const p = c.creditos > 0 ? c.creditos : 1; suma += c.nota * p; pesos += p; });
    return pesos ? suma / pesos : null;
}
const mediana = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/* ============ Cifras de un periodo ============ */
export function calcularMetricas(periodo) {
    const todos = periodo.cursos || [];
    const cn = todos.filter((c) => esNota(c.nota));
    const m = {
        nTotal: todos.length, n: cn.length, creditos: todos.reduce((s, c) => s + (c.creditos > 0 ? c.creditos : 0), 0),
        promedio: null, aprobados: 0, todosAprobados: false,
        nBase: 0, nCarrera: 0, promBase: null, promCarrera: null, brecha: null, compartCarrera: 0,
        max: null, min: null, dentroBanda: 0, bandaLo: null, bandaHi: null, ordenados: [], cursosConNota: cn,
    };
    if (!cn.length) return m;
    m.promedio = promedioPonderado(cn);
    m.aprobados = cn.filter((c) => c.nota >= CFG.UMBRAL_APROBADO).length;
    m.todosAprobados = todos.length > 0 && cn.length === todos.length && m.aprobados === cn.length;
    const base = cn.filter((c) => !esCarrera(c)), carrera = cn.filter(esCarrera);
    m.nBase = base.length; m.nCarrera = carrera.length;
    m.promBase = base.length ? promedioPonderado(base) : null;
    m.promCarrera = carrera.length ? promedioPonderado(carrera) : null;
    if (base.length >= CFG.MIN_CURSOS_POR_TIPO && carrera.length >= CFG.MIN_CURSOS_POR_TIPO) m.brecha = m.promCarrera - m.promBase;
    m.compartCarrera = carrera.length / cn.length;
    m.ordenados = [...cn].sort((a, b) => b.nota - a.nota);                // de la nota más alta a la más baja
    m.max = m.ordenados[0]; m.min = m.ordenados[m.ordenados.length - 1];
    const centro = mediana(cn.map((c) => c.nota));
    const dentro = cn.filter((c) => Math.abs(c.nota - centro) <= CFG.ESTABLE_BANDA);
    m.dentroBanda = dentro.length;
    if (dentro.length) { m.bandaLo = Math.min(...dentro.map((c) => c.nota)); m.bandaHi = Math.max(...dentro.map((c) => c.nota)); }
    return m;
}

/* ============ Evidencia por evaluaciones (solo si el curso trae sus evaluaciones) ============ */
function practicasDe(curso) { return (curso.evaluaciones || []).filter((e) => !e.esExamen && esNota(e.nota)).map((e) => e.nota); }
function examenesDe(curso) { return (curso.evaluaciones || []).filter((e) => e.esExamen && esNota(e.nota)).map((e) => e.nota); }

function evidenciaEvaluaciones(cursos) {
    const evo = [], exa = [];
    cursos.forEach((c) => {
        const pr = practicasDe(c), ex = examenesDe(c);
        if (pr.length >= CFG.MIN_PRACTICAS) {
            const ini = promedioSimple(pr.slice(0, 2)), fin = promedioSimple(pr.slice(-2));
            evo.push({ ini, fin, delta: fin - ini });
        }
        if (pr.length >= 2 && ex.length >= 1) {
            const p = promedioSimple(pr), e = promedioSimple(ex);
            exa.push({ pr: p, ex: e, delta: e - p });
        }
    });
    return { evo, exa };
}
const proporcion = (lista, cond) => (lista.length ? lista.filter(cond).length / lista.length : 0);

/* ============ Perfil de un periodo cerrado ============
   Prioridad (de la historia más fuerte a la más suave):
   Remontador/Madrugador > Finalista/Metódico > Especialista/Cimentador > Constante > Equilibrado */
export function decidirPerfil(m, cursos) {
    if (m.n < CFG.MIN_CURSOS_PERFIL) return null;
    const { evo, exa } = evidenciaEvaluaciones(cursos);
    const unaSola = (a, b) => (a > b ? 'a' : b > a ? 'b' : null);

    if (evo.length >= CFG.MIN_CURSOS_EVALUABLES) {
        const suben = proporcion(evo, (e) => e.delta >= CFG.UMBRAL_TENDENCIA);
        const bajan = proporcion(evo, (e) => e.delta <= -CFG.UMBRAL_TENDENCIA);
        const gana = unaSola(suben, bajan);
        const ini = promedioSimple(evo.map((e) => e.ini)), fin = promedioSimple(evo.map((e) => e.fin));
        if (gana === 'a' && suben >= CFG.PROPORCION_CLARA) {
            const k = evo.filter((e) => e.delta >= CFG.UMBRAL_TENDENCIA).length;
            return { clave: 'rem', chips: [[`${k} de ${evo.length}`, 'cursos donde tus prácticas fueron subiendo'], [`${cifra(ini)} → ${cifra(fin)}`, 'promedio de tu primera y de tu última práctica']] };
        }
        if (gana === 'b' && bajan >= CFG.PROPORCION_CLARA) {
            const k = evo.filter((e) => e.delta <= -CFG.UMBRAL_TENDENCIA).length;
            return { clave: 'mad', chips: [[`${k} de ${evo.length}`, 'cursos donde tus primeras prácticas fueron más altas que las últimas'], [`${cifra(ini)} → ${cifra(fin)}`, 'promedio de tu primera y de tu última práctica']] };
        }
    }
    if (exa.length >= CFG.MIN_CURSOS_EVALUABLES) {
        const finalista = proporcion(exa, (e) => e.delta >= CFG.UMBRAL_EXAMEN);
        const metodico = proporcion(exa, (e) => e.delta <= -CFG.UMBRAL_EXAMEN);
        const gana = unaSola(finalista, metodico);
        const pr = promedioSimple(exa.map((e) => e.pr)), ex = promedioSimple(exa.map((e) => e.ex));
        if (gana === 'a' && finalista >= CFG.PROPORCION_CLARA) {
            const k = exa.filter((e) => e.delta >= CFG.UMBRAL_EXAMEN).length;
            return { clave: 'fin', chips: [[`${k} de ${exa.length}`, 'cursos donde tus exámenes superaron a tus prácticas'], [`${cifra(ex)} · ${cifra(pr)}`, 'promedio en exámenes y en prácticas']] };
        }
        if (gana === 'b' && metodico >= CFG.PROPORCION_CLARA) {
            const k = exa.filter((e) => e.delta <= -CFG.UMBRAL_EXAMEN).length;
            return { clave: 'met', chips: [[`${k} de ${exa.length}`, 'cursos donde tus prácticas superaron a tus exámenes'], [`${cifra(pr)} · ${cifra(ex)}`, 'promedio en prácticas y en exámenes']] };
        }
    }
    if (m.brecha !== null && m.brecha >= CFG.BRECHA_TIPO)
        return { clave: 'esp', chips: [[cifra(m.promCarrera), 'promedio en tus cursos de especialidad'], [cifra(m.promBase), 'promedio en tus cursos base']] };
    if (m.brecha !== null && m.brecha <= -CFG.BRECHA_TIPO)
        return { clave: 'cim', chips: [[cifra(m.promBase), 'promedio en tus cursos base'], [cifra(m.promCarrera), 'promedio en los cursos de tu carrera']] };
    if (m.n >= CFG.MIN_CURSOS_PERFIL && m.dentroBanda / m.n >= CFG.ESTABLE_PROPORCION)
        return { clave: 'con', chips: [[`${m.dentroBanda} de ${m.n}`, `cursos con notas entre ${cifra(m.bandaLo)} y ${cifra(m.bandaHi)}`], [cifra(m.promedio), 'promedio del periodo académico']] };
    if (m.brecha !== null && Math.abs(m.brecha) < CFG.PARIDAD)
        return { clave: 'equ', chips: [[`${cifra(m.promBase)} · ${cifra(m.promCarrera)}`, 'promedio en cursos base y en los de tu carrera'], [cifra(m.min.nota), 'tu nota más baja del periodo académico']] };
    return null;
}

/* ============ Variantes de texto: rotan y no se repiten en periodos seguidos ============ */
function elegirVariante(lista, indice, textoPrevio) {
    if (!lista || !lista.length) return '';
    for (let k = 0; k < lista.length; k++) {
        const t = lista[(indice + k) % lista.length];
        if (t !== textoPrevio) return t;
    }
    return lista[indice % lista.length];
}

/* ============ Construcción del ADN completo ============ */
export function construirAdn(entrada) {
    const ordenados = [...(entrada || [])].sort((a, b) => claveOrden(a.periodo) - claveOrden(b.periodo));
    const info = ordenados.map((p) => ({ p, m: calcularMetricas(p), verano: esVerano(p.periodo), abierto: !!p.abierto }));

    // --- Primera pasada: perfil, racha de subidas y "periodo anterior regular" de cada periodo cerrado ---
    const regulares = [];                                             // periodos regulares cerrados con promedio, en orden
    info.forEach((it, i) => {
        it.i = i; it.racha = 0; it.prev = null;
        const cerrado = !it.abierto;
        if (cerrado && !it.verano && it.m.promedio !== null) {
            it.prev = regulares.length ? regulares[regulares.length - 1] : null;
            if (it.prev && it.m.promedio > it.prev.m.promedio + CFG.SUBIDA_MIN) it.racha = it.prev.racha + 1;
            it.esMinimoHastaAhora = regulares.every((r) => it.m.promedio <= r.m.promedio);
            it.esMaximoHastaAhora = regulares.length > 0 && regulares.every((r) => it.m.promedio > r.m.promedio);
            regulares.push(it);
        }
        if (cerrado && !it.verano && it.m.n >= CFG.MIN_CURSOS_PERFIL) it.decision = decidirPerfil(it.m, it.p.cursos);
    });
    regulares.forEach((r, k) => { r.siguiente = regulares[k + 1] || null; });

    // --- Segunda pasada: textos ---
    let vioBrecha = false, vioCarrera = false, textoPrevio = '';
    const salida = info.map((it) => {
        const { p, m } = it;
        const res = { periodo: p.periodo, esVerano: it.verano, abierto: it.abierto, nCursos: m.nTotal, conNota: m.n,
            estado: null, perfil: null, etiqueta: null, titulo: null, relato: null, comoSeCalcula: null,
            chips: [], dato: null, titular: null, metricas: summaryMetricas(m), racha: it.racha };

        if (it.abierto) return armarEnVivo(res, it, regulares);

        // Estado / perfil
        if (it.verano) { res.estado = 'verano'; }
        else if (it.decision) {
            const k = it.decision.clave;
            res.estado = 'perfil'; res.perfil = k; res.etiqueta = PERFILES[k].nombre; res.titulo = `El ${PERFILES[k].nombre}`;
            res.frase = PERFILES[k].frase; res.relato = PERFIL_RELATO[k]; res.comoSeCalcula = PERFIL_COMO_SE_CALCULA[k]; res.chips = it.decision.chips;
        } else if (m.n < CFG.MIN_CURSOS_PERFIL && !(it === regulares[0] && m.n > 0)) { res.estado = 'pocos'; }
        else if (it === regulares[0]) { res.estado = 'formacion'; }
        else { res.estado = 'sin_patron'; }
        if (res.estado !== 'perfil') {
            const sp = SIN_PERFIL[res.estado === 'pocos' && m.n === 0 ? 'pocos' : res.estado];
            res.etiqueta = sp.etiqueta; res.titulo = sp.titulo; res.relato = sp.texto;
        }

        // Dato curioso (evidencia: nota más alta; nunca es titular)
        if (m.max) res.dato = { valor: cifra(m.max.nota), texto: rellenar(it.verano ? DATO_CURIOSO.notaMasAltaVerano : DATO_CURIOSO.notaMasAlta, { curso: m.max.nombre }) };

        // Titular de "Lo que más destacó"
        const t = elegirTitular(it, regulares, { vioBrecha, vioCarrera, textoPrevio, perfil: res.perfil });
        if (t) { res.titular = t; textoPrevio = t.texto; }

        // Se actualizan las "primeras veces"
        if (m.brecha !== null && Math.abs(m.brecha) >= CFG.BRECHA_TIPO) vioBrecha = true;
        if (!it.verano && m.n >= CFG.MIN_CURSOS_CARRERA && m.compartCarrera >= CFG.PROPORCION_CARRERA) vioCarrera = true;
        return res;
    });

    // --- Qué hacer: según el perfil más reciente ---
    let reciente = null;
    for (let k = salida.length - 1; k >= 0; k--) if (salida[k].perfil && !salida[k].abierto) { reciente = salida[k].perfil; break; }
    const ultimaRegular = regulares[regulares.length - 1] || null;
    return {
        periodos: salida,
        perfilReciente: reciente,
        queHacer: reciente ? { perfil: reciente, nombre: PERFILES[reciente].nombre, ...QUE_HACER[reciente] } : null,
        rachaAlAlza: ultimaRegular ? ultimaRegular.racha : 0,
    };
}

function summaryMetricas(m) {
    return { promedio: m.promedio, promBase: m.promBase, promCarrera: m.promCarrera, creditos: m.creditos, nCursos: m.nTotal,
        conNota: m.n, aprobados: m.aprobados, notaMax: m.max ? m.max.nota : null, notaMin: m.min ? m.min.nota : null };
}

/* ============ Periodo en curso ============ */
function armarEnVivo(res, it, regulares) {
    const m = it.m;
    res.estado = 'vivo'; res.etiqueta = 'En vivo';
    const racha = regulares.length ? regulares[regulares.length - 1].racha : 0;
    if (m.n === 0) {
        res.titulo = EN_VIVO.sinNotas.titulo; res.relato = EN_VIVO.sinNotas.texto; res.aviso = EN_VIVO.sinNotas.aviso;
        res.titular = {
            id: 'sinNotas', nivel: 0,
            texto: racha >= 2 ? rellenar(EN_VIVO.titularSinNotasConRacha, { n: palabraNumero(racha) }) : EN_VIVO.titularSinNotas,
            porQue: EN_VIVO.porQueSinNotas,
        };
    } else {
        res.titulo = EN_VIVO.conNotas.titulo; res.relato = EN_VIVO.conNotas.texto; res.aviso = EN_VIVO.conNotas.aviso;
        res.dato = { valor: cifra(m.max.nota), texto: rellenar(DATO_CURIOSO.notaMasAlta, { curso: m.max.nombre }) };
    }
    return res;
}

/* ============ Elección del titular (un solo titular por periodo) ============ */
function elegirTitular(it, regulares, est) {
    const { m, prev } = it;
    const idx = it.i;
    const pick = (id, grupo, datos, extra = {}) => {
        const pl = PLANTILLAS[id];
        const texto = rellenar(elegirVariante(pl.titulares[grupo], idx, est.textoPrevio), datos);
        return { id, nivel: pl.nivel, grupo, texto, datos, ...extra };
    };
    const nombres = (lista, n) => lista.slice(0, n).map((c) => c.nombre);
    const c1 = m.ordenados[0]?.nombre || '', c2 = m.ordenados[1]?.nombre || '';
    const esElPrimero = it.i === 0;
    let elegido = null;

    // ---------- Verano ----------
    if (it.verano) {
        if (esElPrimero) elegido = armarComienzo(pick, m, c1, c2);
        else if (m.n > 0 && m.aprobados > 0) {
            elegido = pick('verano', 'normal', { aprobados: m.aprobados === 2 ? 'los dos' : m.aprobados === m.n ? `los ${m.n}` : `${m.aprobados}` });
            elegido.porQue = rellenar(PLANTILLAS.verano.porQue, elegido.datos);
        }
        return elegido;
    }
    if (m.n === 0) return null;

    // ---------- Nivel 1 (en este orden) ----------
    if (esElPrimero) {
        elegido = armarComienzo(pick, m, c1, c2);
    }
    if (!elegido && !est.vioCarrera && m.n >= CFG.MIN_CURSOS_CARRERA && m.compartCarrera >= CFG.PROPORCION_CARRERA) {
        const todos = m.nBase === 0;
        const sube = !prev || m.promedio >= prev.m.promedio;
        const grupo = !todos ? 'casi' : sube ? 'sube' : 'baja';
        elegido = pick('primerCarrera', grupo, { n: m.nCarrera });
        elegido.porQue = rellenar(PLANTILLAS.primerCarrera.porQue, { n: m.nCarrera, prom: cifra(m.promedio), antes: prev ? ` (antes ${cifra(prev.m.promedio)})` : '' });
    }
    if (!elegido && prev && m.promedio - prev.m.promedio >= CFG.RECUPERACION_MIN) {
        const veniaDeCaida = prev.esMinimoHastaAhora || (prev.prev && prev.prev.m.promedio - prev.m.promedio >= CFG.CAIDA_MIN);
        if (veniaDeCaida) {
            const mejoroBase = prev.m.promBase !== null && m.promBase !== null && m.promBase - prev.m.promBase >= 1;
            const confirmada = it.siguiente && it.siguiente.m.promedio > m.promedio;
            const grupo = confirmada ? 'confirmada' : mejoroBase ? 'reciente' : 'sinBase';
            const baseTxt = mejoroBase ? ` El de tus cursos base pasó de ${cifra(prev.m.promBase)} a ${cifra(m.promBase)}.` : '';
            elegido = pick('recuperacion', grupo, {});
            elegido.porQue = rellenar(PLANTILLAS.recuperacion.porQue, { antes: cifra(prev.m.promedio), prom: cifra(m.promedio), base: baseTxt });
        }
    }
    if (!elegido && m.brecha !== null && Math.abs(m.brecha) >= CFG.BRECHA_TIPO && !est.vioBrecha) {
        const carrera = m.brecha > 0;
        const mejores = listaY(nombres(m.ordenados, 3));
        elegido = pick('descubrio', carrera ? 'carrera' : 'base', {});
        elegido.porQue = rellenar(PLANTILLAS.descubrio.porQue, { pc: cifra(m.promCarrera), pb: cifra(m.promBase), mejores });
    }
    if (!elegido && it.racha >= 2) {
        elegido = pick('mejoraConstante', it.racha === 2 ? 'dos' : 'varios', { n: palabraNumero(it.racha) });
        elegido.porQue = rellenar(PLANTILLAS.mejoraConstante.porQue, { serie: serieDeRacha(it, regulares) });
    }
    if (!elegido && prev && prev.m.promedio - m.promedio >= CFG.CAIDA_MIN && m.todosAprobados) {
        const bajos = [...m.ordenados].reverse();
        const ajustados = listaY(nombres(bajos, bajos.slice(0, 3).every((c) => c.nota <= 11) ? 3 : 2));
        elegido = pick('desafiante', 'normal', {});
        elegido.porQue = rellenar(PLANTILLAS.desafiante.porQue, { antes: cifra(prev.m.promedio), prom: cifra(m.promedio), ajustados });
    }

    // ---------- Nivel 2 (solo si no hubo Nivel 1; nunca repite lo que ya dice el perfil) ----------
    const patrones = patronesNivel2(m, est.perfil, c1);
    if (!elegido && patrones.length) elegido = patrones[0].armar(pick);

    // ---------- Nivel 3 ----------
    const pesados = datosPesados(m);
    const carga = datosCarga(m, prev);
    if (!elegido && pesados) elegido = armarPesados(pick, pesados);
    if (!elegido && carga) elegido = armarCarga(pick, carga, m);
    if (!elegido) return null;

    // ---------- Complemento "Además," (de un nivel menor, distinto del titular y del perfil) ----------
    const complementos = [];
    if (elegido.id !== 'mejoraConstante' && it.racha >= 2) {
        const serie = serieDeRacha(it, regulares, true);
        complementos.push(rellenar(PLANTILLAS.mejoraConstante.ademas, { n: palabraNumero(it.racha), a: cifra(serie[0]), b: cifra(serie[serie.length - 1]) }));
    }
    if (it.esMaximoHastaAhora && elegido.id !== 'comienzo')
        complementos.push(rellenar(PLANTILLAS.mejorPromedio.ademas, { prom: cifra(m.promedio) }));
    patrones.filter((x) => x.id !== elegido.id).forEach((x) => complementos.push(rellenar(PLANTILLAS[x.id].ademas, x.datos)));
    if (carga && elegido.id !== 'cargaAlta') complementos.push(rellenar(PLANTILLAS.cargaAlta.ademas, { cred: m.creditos }));
    if (pesados && elegido.id !== 'pesados') complementos.push(rellenar(PLANTILLAS.pesados.ademas, pesados.datos));

    const base = elegido.porQue || '';
    elegido.porQue = complementos.length ? `${base} ${complementos[0]}`.trim() : base;
    return { id: elegido.id, nivel: elegido.nivel, texto: elegido.texto, porQue: elegido.porQue };
}

function armarComienzo(pick, m, c1, c2) {
    const e = pick('comienzo', 'normal', {});
    e.porQue = c2 ? rellenar(PLANTILLAS.comienzo.porQue, { curso1: c1, curso2: c2 }) : rellenar(PLANTILLAS.comienzo.porQueUno, { curso1: c1 });
    return e;
}

function serieDeRacha(it, regulares, comoNumeros = false) {
    const pos = regulares.indexOf(it);
    const serie = regulares.slice(pos - it.racha, pos + 1).map((r) => r.m.promedio);
    return comoNumeros ? serie : serie.map((x) => cifra(x)).join(' → ');
}

function patronesNivel2(m, perfil, c1) {
    const lista = [];
    if (m.brecha !== null && m.brecha >= CFG.BRECHA_TIPO && perfil !== 'esp') {
        const datos = { pc: cifra(m.promCarrera), pb: cifra(m.promBase), curso1: m.ordenados.find(esCarrera)?.nombre || '' };
        lista.push({ id: 'mejorCarrera', datos, peso: Math.abs(m.brecha), armar: (pick) => { const e = pick('mejorCarrera', 'normal', datos); e.porQue = rellenar(PLANTILLAS.mejorCarrera.porQue, datos); return e; } });
    }
    if (m.brecha !== null && m.brecha <= -CFG.BRECHA_TIPO && perfil !== 'cim') {
        const datos = { pc: cifra(m.promCarrera), pb: cifra(m.promBase) };
        lista.push({ id: 'mejorBase', datos, peso: Math.abs(m.brecha), armar: (pick) => { const e = pick('mejorBase', 'normal', datos); e.porQue = rellenar(PLANTILLAS.mejorBase.porQue, datos); return e; } });
    }
    if (m.n >= CFG.MIN_CURSOS_PERFIL && m.dentroBanda / m.n >= CFG.ESTABLE_PROPORCION && perfil !== 'con') {
        const datos = { min: cifra(m.min.nota), max: cifra(m.max.nota) };
        lista.push({ id: 'estable', datos, peso: 0, armar: (pick) => { const e = pick('estable', 'normal', datos); e.porQue = rellenar(PLANTILLAS.estable.porQue, datos); return e; } });
    }
    return lista.sort((a, b) => b.peso - a.peso);
}

function datosPesados(m) {
    const pesados = m.cursosConNota.filter((c) => c.creditos >= CFG.CREDITOS_PESADO).sort((a, b) => b.creditos - a.creditos || b.nota - a.nota);
    if (pesados.length < 2) return null;
    const top = pesados.slice(0, 2);
    if (!top.every((c) => c.nota >= CFG.NOTA_BUENA)) return null;
    return { datos: { curso1: top[0].nombre, curso2: top[1].nombre, cred1: top[0].creditos, cred2: top[1].creditos } };
}
function armarPesados(pick, p) {
    const e = pick('pesados', 'normal', p.datos);
    e.porQue = rellenar(PLANTILLAS.pesados.porQue, p.datos);
    return e;
}
function datosCarga(m, prev) {
    if (m.creditos >= CFG.CARGA_ALTA_CREDITOS || m.nTotal >= CFG.CARGA_ALTA_CURSOS) return { mantuvo: !prev || m.promedio >= prev.m.promedio - 0.5 };
    return null;
}
function armarCarga(pick, c, m) {
    const e = pick('cargaAlta', c.mantuvo ? 'mantuvo' : 'bajo', {});
    e.porQue = rellenar(PLANTILLAS.cargaAlta.porQue, { n: m.nTotal, cred: m.creditos });
    return e;
}
