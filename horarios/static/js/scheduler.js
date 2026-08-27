// ============================================================
// scheduler.js — Motor de generación de horarios
// Equivale a las rutas /generar y /favoritos de app.py
// ============================================================
// ------------------------------------------------------------
// calcularCruces: detecta solapamientos entre las clases
// de una combinación parcial de secciones.
// Equivale a calcular_cruces() dentro de /generar en app.py
//
// Reglas (igual que Horext):
//   P vs P → infinito (combinación bloqueada) — JAMÁS permitido,
//            sin importar el número de cruces que elija el usuario
//   T vs T o T vs P → +1 cruce (sí se puede permitir)
//
// "P" no es un único valor literal en la carga horaria: según el
// curso, el Excel oficial trae "P", "PRA", "PC", "LAB" o "PC / LAB"
// para referirse a una práctica. esPractica() usa el mismo criterio
// que ya usan generador.js y asistente-horario.js para pintar los
// badges T/P (esTeoria = tipo T o que empiece con "TEOR"): todo lo
// que NO sea teoría se trata como práctica para efectos del bloqueo.
// ------------------------------------------------------------
function esPractica(tipo) {
    const esTeoria = tipo === 'T' || /TEOR/i.test(tipo);
    return !esTeoria;
}

function calcularCruces(combo) {
    let cruces = 0;

    // Junta todas las clases individuales de todas las secciones del combo
    const clases = combo.flatMap(sec => sec.clases);

    for (let i = 0; i < clases.length; i++) {
        for (let j = i + 1; j < clases.length; j++) {
            const a = clases[i];
            const b = clases[j];

            // Solo compara clases del mismo día
            if (a.dia !== b.dia) continue;

            // Calcula si hay solapamiento
            const overlap = Math.max(0, Math.min(a.fin, b.fin) - Math.max(a.ini, b.ini));
            if (overlap <= 0) continue;

            // P vs P (en cualquiera de sus variantes) → bloqueado,
            // retorna infinito inmediatamente. Como generarCombos()
            // descarta con "<= maxCruces", Infinity nunca pasa ese
            // filtro sin importar el valor de maxCruces (0 a 6).
            if (esPractica(a.tipo) && esPractica(b.tipo)) return Infinity;

            // T vs T o T vs P → +1 cruce, sí puede permitirse
            cruces += 1;
        }
    }

    return cruces;
}


// ------------------------------------------------------------
// generarCombos: backtracking que genera todas las
// combinaciones válidas respetando el máximo de cruces.
// Equivale a solve() + /generar en app.py
//
// Parámetros:
//   opcionesPorCurso → array de arrays de secciones
//   maxCruces        → número máximo de cruces permitidos
// Retorna:
//   array de combinaciones válidas
// ------------------------------------------------------------
function generarCombos(opcionesPorCurso, maxCruces) {
    const combos = [];

    // Función recursiva de backtracking
    // idx  → índice del curso que estamos asignando ahora
    // curr → combinación parcial construida hasta ahora
    function solve(idx, curr) {

        // Caso base: ya asignamos todos los cursos → combinación completa
        if (idx === opcionesPorCurso.length) {
            // Guarda una copia para que no se modifique después
            combos.push(curr.map(s => ({ ...s })));
            return;
        }

        // Prueba cada sección disponible para el curso actual
        for (const sec of opcionesPorCurso[idx]) {

            // Poda: si al agregar esta sección ya supera el máximo, la descarta
            if (calcularCruces([...curr, sec]) <= maxCruces) {
                curr.push(sec);
                solve(idx + 1, curr); // recurse al siguiente curso
                curr.pop();           // deshace para probar la siguiente sección
            }
        }
    }

    solve(0, []);
    return combos;
}


// ------------------------------------------------------------
// prepararOpciones: construye el array opcionesPorCurso
// a partir de la selección del usuario y la carga horaria.
// Equivale a la preparación de opciones_por_curso en /generar
//
// Parámetros:
//   seleccion   → { "Cálculo I": ["A", "B"], "Física": ["C"] }
//   cargaGlobal → el objeto carga devuelto por parsearExcel()
// ------------------------------------------------------------
function prepararOpciones(seleccion, cargaGlobal) {
    const opcionesPorCurso = [];

    for (const [curso, secsElegidas] of Object.entries(seleccion)) {
        if (!(curso in cargaGlobal)) continue;

        // Filtra solo las secciones que el usuario seleccionó
        const opts = Object.entries(cargaGlobal[curso])
            .filter(([sec]) => secsElegidas.includes(sec))
            .map(([sec, info]) => ({
                ...info,        // docente y clases
                // "curso" es la llave interna, que a veces trae " (CÓDIGO)"
                // pegado al final para no mezclar dos cursos de carreras
                // distintas que comparten nombre oficial (ver
                // generar_carga_horario.py). Para calendario/tooltip/Excel/
                // favoritos/ICS se usa el nombre limpio, igual al oficial.
                nombre: (typeof nombreVisible === 'function') ? nombreVisible(curso, info.codigo) : curso,
                seccion: sec    // agrega la sección
            }));

        if (opts.length > 0) opcionesPorCurso.push(opts);
    }

    return opcionesPorCurso;
}


// ============================================================
// calcularMetricasHorario — motor base del módulo "Huecos y
// métricas" del Asistente de Horario. Recibe un combo ya armado
// (mismo formato que arma prepararOpciones/generarCombos: array
// de secciones, cada una con .nombre y .clases) y devuelve
// SOLO números — sin tocar el DOM — para que puedan reusarlo
// después las demás herramientas (preferencias, algoritmo de
// mejor horario, alertas, comparador) sin recalcular nada.
//
// Las horas en `clases` vienen como enteros HHMM (ej. 800, 1430),
// por eso primero se convierten a minutos desde medianoche.
// ------------------------------------------------------------
function horaAMinutos(hhmm) {
    return Math.floor(hhmm / 100) * 60 + (hhmm % 100);
}

// Ventana horaria razonable para contar "tiempo libre para estudiar"
// antes de la primera clase o después de la última del día (mismo
// rango que ve el calendario: HOUR_START/HOUR_END en generador.js).
// Fuera de este rango no tiene sentido reportar horas "libres"
// (nadie va a estudiar a las 3am) — se duplica el valor acá porque
// scheduler.js no comparte scope con generador.js.
const VENTANA_ESTUDIO_INICIO_MIN = 7 * 60;  // 7:00
const VENTANA_ESTUDIO_FIN_MIN = 22 * 60;    // 22:00

function calcularMetricasHorario(combo) {
    // Agrupa todas las clases del combo por día
    const porDia = {};
    combo.forEach(sec => {
        sec.clases.forEach(cl => {
            if (!porDia[cl.dia]) porDia[cl.dia] = [];
            porDia[cl.dia].push({ ini: horaAMinutos(cl.ini), fin: horaAMinutos(cl.fin) });
        });
    });

    const dias = {};
    let huecosTotalMin = 0;
    let horasTotalMin = 0;
    let estudioTotalMin = 0;
    let bloqueMaxContinuoMin = 0;

    Object.entries(porDia).forEach(([dia, clases]) => {
        // Ordena y fusiona clases que se pisan entre sí (cruces
        // permitidos por el usuario) para no contar el mismo tramo
        // dos veces ni generar un "hueco negativo" ahí.
        const ordenadas = clases.slice().sort((a, b) => a.ini - b.ini);
        const bloques = [];
        ordenadas.forEach(cl => {
            const ultimo = bloques[bloques.length - 1];
            if (ultimo && cl.ini <= ultimo.fin) {
                ultimo.fin = Math.max(ultimo.fin, cl.fin);
            } else {
                bloques.push({ ini: cl.ini, fin: cl.fin });
            }
        });

        const huecos = [];
        for (let i = 0; i < bloques.length - 1; i++) {
            const gap = bloques[i + 1].ini - bloques[i].fin;
            if (gap > 0) huecos.push({ inicio: bloques[i].fin, fin: bloques[i + 1].ini, minutos: gap });
        }

        const horaEntrada = bloques[0].ini;
        const horaSalida = bloques[bloques.length - 1].fin;
        const horasClaseMin = bloques.reduce((s, b) => s + (b.fin - b.ini), 0);
        const huecosDiaMin = huecos.reduce((s, h) => s + h.minutos, 0);
        const bloqueMaxDia = bloques.reduce((max, b) => Math.max(max, b.fin - b.ini), 0);

        // "Horas libres para estudiar" — antes de la primera clase y
        // después de la última, acotado a la ventana de estudio.
        const horasLibresAntesMin = Math.max(0, horaEntrada - VENTANA_ESTUDIO_INICIO_MIN);
        const horasLibresDespuesMin = Math.max(0, VENTANA_ESTUDIO_FIN_MIN - horaSalida);

        dias[dia] = {
            horaEntrada, horaSalida, horasClaseMin, huecos, huecosDiaMin, bloqueMaxDia,
            horasLibresAntesMin, horasLibresDespuesMin,
        };

        huecosTotalMin += huecosDiaMin;
        horasTotalMin += horasClaseMin;
        estudioTotalMin += huecosDiaMin + horasLibresAntesMin + horasLibresDespuesMin;
        bloqueMaxContinuoMin = Math.max(bloqueMaxContinuoMin, bloqueMaxDia);
    });

    const diasOcupados = Object.keys(dias);
    let diaMasCargado = null, diaMasLibre = null;
    diasOcupados.forEach(d => {
        if (!diaMasCargado || dias[d].horasClaseMin > dias[diaMasCargado].horasClaseMin) diaMasCargado = d;
        if (!diaMasLibre || dias[d].horasClaseMin < dias[diaMasLibre].horasClaseMin) diaMasLibre = d;
    });

    return { dias, diasOcupados, diaMasCargado, diaMasLibre, huecosTotalMin, horasTotalMin, estudioTotalMin, bloqueMaxContinuoMin };
}


// ============================================================
// generarICS — arma un archivo .ics (formato iCalendar estándar)
// para importar el horario en Google Calendar, Outlook o Apple
// Calendar de una sola vez, sin depender de ninguna API externa.
//
// No tenemos la fecha real de inicio/fin del ciclo en los datos
// del Excel, así que cada clase se repite semanalmente por
// SEMANAS_ICS semanas a partir de la próxima vez que caiga ese
// día — una aproximación razonable de un semestre. El usuario
// puede editar o borrar el rango después desde su propio
// calendario si su ciclo dura menos o más semanas.
// ------------------------------------------------------------
const ICS_DIA_A_INDICE = { LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6 };
const SEMANAS_ICS = 16;

function icsEscapar(texto) {
    return String(texto || '')
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

function icsProximaFecha(diaSemana, desde) {
    const objetivo = ICS_DIA_A_INDICE[diaSemana];
    if (objetivo === undefined) return null;
    const fecha = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
    let diff = objetivo - fecha.getDay();
    if (diff < 0) diff += 7;
    fecha.setDate(fecha.getDate() + diff);
    return fecha;
}

function icsFormatoFecha(fecha, hhmm) {
    const h = Math.floor(hhmm / 100);
    const m = hhmm % 100;
    const pad = n => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}${pad(fecha.getMonth() + 1)}${pad(fecha.getDate())}T${pad(h)}${pad(m)}00`;
}

function generarICS(combo) {
    const ahora = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dtstamp = `${ahora.getUTCFullYear()}${pad(ahora.getUTCMonth() + 1)}${pad(ahora.getUTCDate())}T${pad(ahora.getUTCHours())}${pad(ahora.getUTCMinutes())}${pad(ahora.getUTCSeconds())}Z`;

    const eventos = [];
    combo.forEach(sec => {
        sec.clases.forEach(cl => {
            const fechaInicio = icsProximaFecha(cl.dia, ahora);
            if (!fechaInicio) return;

            const esTeoria = cl.tipo === 'T' || /TEOR/i.test(cl.tipo);
            const tipoLabel = esTeoria ? 'Teoría' : 'Práctica';
            const uid = `${sec.nombre}-${sec.seccion}-${cl.dia}-${cl.ini}-${Date.now()}@siga-horarios`.replace(/\s+/g, '');

            eventos.push([
                'BEGIN:VEVENT',
                `UID:${icsEscapar(uid)}`,
                `DTSTAMP:${dtstamp}`,
                `DTSTART:${icsFormatoFecha(fechaInicio, cl.ini)}`,
                `DTEND:${icsFormatoFecha(fechaInicio, cl.fin)}`,
                `RRULE:FREQ=WEEKLY;COUNT=${SEMANAS_ICS}`,
                `SUMMARY:${icsEscapar(sec.nombre + ' (' + tipoLabel + ')')}`,
                `LOCATION:${icsEscapar(cl.aula || '')}`,
                `DESCRIPTION:${icsEscapar('Sección ' + sec.seccion + (sec.docente ? ' · ' + sec.docente : ''))}`,
                'END:VEVENT',
            ].join('\r\n'));
        });
    });

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SIGA//Generador de Horarios//ES',
        'CALSCALE:GREGORIAN',
        ...eventos,
        'END:VCALENDAR',
    ].join('\r\n');
}


// ============================================================
// FAVORITOS — equivale a /favoritos en app.py
// En vez del servidor, se guardan en memoria del navegador
// mientras la sesión esté abierta (se pierden al recargar,
// igual que la lista favoritos = [] en app.py)
// ============================================================

const Favoritos = {
    _lista: [], // equivale a favoritos = [] en app.py

    // Agrega un combo con nombre → equivale a POST /favoritos
    agregar(combo, nombre) {
        const n = nombre || `Favorito ${this._lista.length + 1}`;
        this._lista.push({ nombre: n, combo });
        return this._lista.length;
    },

    // Devuelve todos los favoritos → equivale a GET /favoritos
    obtener() {
        return this._lista;
    },

    // Elimina por índice → equivale a DELETE /favoritos/<idx>
    eliminar(idx) {
        if (idx >= 0 && idx < this._lista.length) {
            this._lista.splice(idx, 1);
        }
    },

    // Retorna cuántos favoritos hay guardados
    total() {
        return this._lista.length;
    }
};