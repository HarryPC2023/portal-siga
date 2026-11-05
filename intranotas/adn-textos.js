// adn-textos.js — Biblioteca de textos del ADN académico.
// Aquí vive TODO lo que el estudiante lee: perfiles, titulares de "Lo que más destacó", "Ver por qué",
// "Qué hacer" y los avisos cuando todavía no hay perfil. Se cambia un texto aquí y se actualiza en toda la web.
//
// Reglas de redacción (acordadas con Harry):
//  - Siempre "periodo académico" (o "periodo"); NUNCA "ciclo".
//  - Tono de reconocimiento y cercanía, sin falsos triunfos y sin dramatismo.
//  - Nunca se menciona un curso no aprobado ni repetido.
//  - Las cifras van en "Ver por qué" y en el Dato curioso; en el titular solo si la cifra es la historia.
//  - Sirve para todas las carreras: "cursos de tu carrera" y "cursos base".
// Los textos usan {marcas} que el cálculo rellena con datos reales (ver rellenar()).

/* ---------- Perfiles ---------- */
export const PERFILES = {
    rem: { nombre: 'Remontador',  frase: 'Cierras mejor de lo que empiezas.' },
    mad: { nombre: 'Madrugador',  frase: 'Arrancas fuerte desde el inicio.' },
    esp: { nombre: 'Especialista', frase: 'Rindes más en los cursos de tu carrera.' },
    cim: { nombre: 'Cimentador',  frase: 'Tus cursos base son tu punto fuerte.' },
    fin: { nombre: 'Finalista',   frase: 'Brillas en los exámenes.' },
    met: { nombre: 'Metódico',    frase: 'Tu fuerte es el trabajo continuo.' },
    con: { nombre: 'Constante',   frase: 'Tus notas se mantienen parejas.' },
    equ: { nombre: 'Equilibrado', frase: 'Rindes parejo en todo.' },
};

export const PERFIL_RELATO = {
    rem: 'Cuando un curso arranca difícil, lo remontas: tus prácticas van subiendo a medida que avanza el periodo académico.',
    mad: 'Entras con todo desde el inicio: tus primeras prácticas suelen ser de lo mejor que sacas en cada curso.',
    esp: 'Rindes mejor mientras más cerca está el curso de tu carrera: tus mejores notas están en los cursos de especialidad.',
    cim: 'Tus cursos base son tu terreno firme: ahí tus notas son más altas que en el resto. Estás construyendo buenos cimientos para lo que viene.',
    fin: 'Los exámenes son tu momento: rindes más alto en parciales y finales que en tus prácticas.',
    met: 'Tu fuerte es el trabajo continuo: rindes más alto en tus prácticas que en los exámenes.',
    con: 'Tus notas se mueven poco de un curso a otro: sabes sostener un ritmo parejo durante todo el periodo académico.',
    equ: 'Rindes parecido en tus cursos base y en los de tu carrera: no dependes de un solo tipo de curso para sostener tu promedio.',
};

export const PERFIL_COMO_SE_CALCULA = {
    rem: 'Se mira solo la evolución de tus prácticas (PC y laboratorios), de la primera a la última de cada curso. Los exámenes no entran: son otro tipo de evaluación y no se pueden comparar con una práctica.',
    mad: 'Se mira solo la evolución de tus prácticas (PC y laboratorios), de la primera a la última de cada curso, y cuántas veces las primeras fueron más altas que las últimas.',
    esp: 'Se compara el promedio de tus cursos de especialidad con el de tus cursos base.',
    cim: 'Se compara el promedio de tus cursos base con el de tus cursos de especialidad.',
    fin: 'En cada curso se compara el promedio de tus exámenes (parcial y final) con el de tus prácticas.',
    met: 'En cada curso se compara el promedio de tus prácticas con el de tus exámenes (parcial y final).',
    con: 'Se mira cuántos de tus cursos quedaron cerca de la nota central del periodo académico: cuando casi todos están cerca, tus notas son parejas.',
    equ: 'Se compara el promedio de tus cursos base con el de tus cursos de especialidad: aquí la diferencia es mínima.',
};

/* ---------- Periodos sin perfil ---------- */
export const SIN_PERFIL = {
    formacion:  { etiqueta: 'En formación', titulo: 'Tu perfil se está formando',
        texto: 'Con pocos periodos académicos todavía no se arma un perfil: a medida que sumes periodos, tu ADN va tomando forma.' },
    verano:     { etiqueta: 'Verano', titulo: 'Un periodo corto',
        texto: 'En los veranos no se arma un perfil porque son pocos cursos, pero este periodo también cuenta en tu historia.' },
    pocos:      { etiqueta: 'Pocos cursos', titulo: 'Pocos cursos con nota',
        texto: 'Con pocos cursos con nota todavía no se arma un perfil para este periodo académico.' },
    sin_patron: { etiqueta: 'Sin patrón', titulo: 'Un periodo sin un patrón claro',
        texto: 'Tus resultados fueron variados: ningún tipo de curso ni de evaluación marcó una diferencia clara este periodo académico.' },
};

/* ---------- Periodo en curso ---------- */
export const EN_VIVO = {
    sinNotas: {
        titulo: 'Aún no hay notas en este periodo académico',
        texto: 'Cuando se publiquen las primeras, aquí verás cómo vas.',
        aviso: 'Lectura en vivo · tu perfil se confirma cuando el periodo académico cierre',
    },
    conNotas: {
        titulo: 'Así vas en este periodo académico',
        texto: 'Estas son las primeras señales con las notas publicadas hasta hoy.',
        aviso: 'Lectura en vivo · tu perfil se confirma cuando el periodo académico cierre',
    },
    titularSinNotasConRacha: 'Todavía no hay notas publicadas. Vienes de {n} periodos seguidos al alza.',
    titularSinNotas: 'Todavía no hay notas publicadas. Aquí verás lo que vaya destacando en cuanto salgan las primeras notas.',
    porQueSinNotas: 'En cuanto salgan las primeras notas, aquí verás cómo estás arrancando este periodo académico.',
};

/* ---------- Titulares de "Lo que más destacó" ----------
   Cada plantilla: nivel (1 gana a 2, 2 a 3), variantes del titular y texto de "Ver por qué" (porQue) y,
   cuando va como complemento, el texto de "Además," (ademas). */
export const PLANTILLAS = {
    // ===== Nivel 1: hitos de trayectoria =====
    comienzo: {
        nivel: 1,
        titulares: {
            normal: [
                'Así empezó tu camino en la universidad: desde el primer periodo se vio hacia dónde apuntan tus fortalezas.',
                'Fue tu primer paso en la universidad: lo más difícil de todo camino es empezar, y ya lo diste.',
            ],
        },
        porQue: 'Tus mejores notas llegaron en {curso1} y en {curso2}.',
        porQueUno: 'Tu mejor nota llegó en {curso1}.',
    },
    primerCarrera: {
        nivel: 1,
        titulares: {
            sube: [
                'Por primera vez llevaste únicamente cursos de tu carrera, y se nota que es un terreno donde rindes bien.',
                'Entraste de lleno a tu carrera y respondiste: este es un terreno donde rindes bien.',
            ],
            baja: ['Fue un paso importante: tu primer periodo enfocado por completo en tu carrera.'],
            casi: ['Por primera vez llevaste casi únicamente cursos de tu carrera.'],
        },
        porQue: 'Fueron {n} cursos de tu carrera y tu promedio del periodo fue {prom}{antes}.',
    },
    recuperacion: {
        nivel: 1,
        titulares: {
            reciente: [
                'Aquí empezó tu recuperación: mejoraste justo en los cursos donde antes te había costado más.',
                'Después de un periodo más difícil, retomaste el rumbo y se nota.',
            ],
            sinBase: ['Después de un periodo más difícil, retomaste el rumbo y se nota.'],
            confirmada: ['Aquí estuvo tu punto de inflexión: desde este periodo, tus resultados no han dejado de mejorar.'],
        },
        porQue: 'Tu promedio subió de {antes} a {prom}.{base}',
    },
    descubrio: {
        nivel: 1,
        titulares: {
            carrera: ['Aquí empezaste a descubrir dónde rindes mejor: los cursos de tu carrera fueron los que mejor te salieron.'],
            base: ['Aquí empezaste a ver tu punto fuerte: tus cursos base fueron los que mejor te salieron.'],
        },
        porQue: 'Tu promedio en los cursos de tu carrera fue {pc} y en los cursos base, {pb}. Tus mejores cursos: {mejores}.',
    },
    mejoraConstante: {
        nivel: 1,
        titulares: {
            dos: [
                'Tu mejora ya no parece algo puntual: ya van dos periodos seguidos avanzando.',
                'Dos periodos seguidos avanzando: tu mejora empieza a tomar forma.',
            ],
            varios: [
                'Tu mejora se sostiene: llevas {n} periodos seguidos creciendo.',
                'Esto ya no parece casualidad: periodo tras periodo, tus resultados siguen subiendo.',
            ],
        },
        porQue: 'Tus promedios: {serie}.',
        ademas: 'Además, ya van {n} periodos seguidos avanzando: de {a} a {b}.',
    },
    desafiante: {
        nivel: 1,
        titulares: {
            normal: [
                'Fue un periodo más desafiante, pero sacaste adelante todos tus cursos y mantuviste tu avance.',
                'Aunque este periodo exigió más, lo cerraste con todos tus cursos aprobados.',
            ],
        },
        porQue: 'Tu promedio pasó de {antes} a {prom}. Los cursos más ajustados fueron {ajustados}.',
    },
    // ===== Nivel 2: patrones de desempeño =====
    estable: {
        nivel: 2,
        titulares: {
            normal: [
                'La constancia fue lo más destacado: no dependiste de una sola buena nota, mantuviste un rendimiento equilibrado en todo el periodo.',
                'Fue un periodo parejo: tus resultados se mantuvieron firmes en todos tus cursos.',
            ],
        },
        porQue: 'Tu nota más baja fue {min} y la más alta, {max}.',
        ademas: 'Además, rendiste parejo en todos tus cursos: ninguno quedó por debajo de {min}.',
    },
    mejorCarrera: {
        nivel: 2,
        titulares: {
            normal: [
                'Los cursos de tu carrera fueron tu terreno más fuerte este periodo, sobre todo {curso1}.',
                'Tu carrera siguió siendo tu punto fuerte: ahí se reflejaron mejor tus resultados.',
            ],
        },
        porQue: 'Promedio en los cursos de tu carrera: {pc}; en los cursos base: {pb}.',
        ademas: 'Además, los cursos de tu carrera fueron tu terreno más fuerte ({pc} frente a {pb} en los cursos base).',
    },
    mejorBase: {
        nivel: 2,
        titulares: {
            normal: [
                'Tus cursos base fueron tu punto fuerte: estás armando una base sólida para lo que viene.',
                'Tu base se está afianzando: los cursos de formación básica te salieron mejor que el resto.',
            ],
        },
        porQue: 'Promedio en los cursos base: {pb}; en los cursos de tu carrera: {pc}.',
        ademas: 'Además, tus cursos base fueron tu punto fuerte ({pb} frente a {pc} en los cursos de tu carrera).',
    },
    // ===== Nivel 3: logros contextuales =====
    pesados: {
        nivel: 3,
        titulares: {
            normal: [
                'Los cursos más pesados del periodo, como {curso1} y {curso2}, salieron bien: eso suma mucho.',
                'Respondiste en los cursos que más exigen: {curso1} pesa mucho en tu promedio y lo sacaste con solvencia.',
            ],
        },
        porQue: '{curso1} ({cred1} créditos) y {curso2} ({cred2} créditos) son los que más pesan en tu promedio.',
        ademas: 'Además, los cursos más pesados, como {curso1} y {curso2}, salieron bien.',
    },
    cargaAlta: {
        nivel: 3,
        titulares: {
            mantuvo: ['Llevaste una de tus cargas más altas y aun así mantuviste tus resultados.'],
            bajo: ['Fue un periodo con mucha carga: sacarlo adelante ya tiene su mérito.'],
        },
        porQue: 'Llevaste {n} cursos y {cred} créditos en este periodo académico.',
        ademas: 'Además, llevaste una de tus cargas más altas ({cred} créditos).',
    },
    verano: {
        nivel: 3,
        titulares: {
            normal: [
                'Un verano bien aprovechado: sumaste avance a tu carrera en un periodo corto.',
                'El verano también cuenta: lo usaste para seguir avanzando.',
            ],
        },
        porQue: 'Terminaste el verano con {aprobados} cursos aprobados.',
    },
    // ===== Solo como complemento ("Además,") =====
    mejorPromedio: {
        nivel: 3,
        ademas: 'Además, tu promedio del periodo ({prom}) fue el más alto hasta ese momento.',
    },
};

/* ---------- Dato curioso (evidencia: nota sobresaliente; nunca es titular) ---------- */
export const DATO_CURIOSO = {
    notaMasAlta: 'Tu nota más alta fue en {curso}.',
    notaMasAltaVerano: 'Tu nota más alta del verano fue en {curso}.',
};

/* ---------- Qué hacer ----------
   paso  = periodo cerrado: consejo para el próximo periodo, sin herramienta (no tiene sentido "mirar" algo de un periodo ya terminado).
   vivo  = periodo en curso: líneas con la herramienta que sí sirve ahora. [texto] o [texto, 'Nombre de la herramienta']. */
export const QUE_HACER = {
    rem: {
        paso: ['Remontas cuando un curso arranca difícil.', 'En tu próximo periodo académico, no te desanimes si tus primeras prácticas salen bajas: aún hay tiempo de subir.'],
        vivo: [['Tus primeras prácticas no te definen: desde la PC2,'], ['Mira', 'Qué nota necesito'], ['Para ver cuánto te falta y dónde conviene concentrar el esfuerzo.']],
    },
    mad: {
        paso: ['Arrancas fuerte, y eso te da ventaja desde el inicio.', 'En tu próximo periodo académico, cuida que ese ritmo no baje hacia el final: guarda energía para las últimas evaluaciones.'],
        vivo: [['Arrancas fuerte: que no se te pase el ritmo a mitad del periodo,'], ['Mira', 'Qué nota necesito'], ['Para ver cuánto te falta y mantener el ritmo hasta el final.']],
    },
    esp: {
        paso: ['Tu ventaja está en tu carrera, pero tus cursos base pesan muchos créditos.', 'En tu próximo periodo académico, dales tiempo desde la primera práctica.'],
        vivo: [['Tu ventaja está en tu carrera, pero tus cursos base pesan muchos créditos.'], ['Mira', 'Radar académico'], ['Para ver en cuál conviene concentrar tu esfuerzo primero.']],
    },
    cim: {
        paso: ['Los cursos de especialidad que vienen piden práctica constante.', 'En tu próximo periodo académico, empieza a estudiarlos desde la primera semana.'],
        vivo: [['Los cursos de especialidad piden práctica constante.'], ['Desde la primera práctica, mira', 'Qué nota necesito'], ['Para saber cuánto te falta sin esperar al examen.']],
    },
    fin: {
        paso: ['Los exámenes son tu momento fuerte.', 'En tu próximo periodo académico, no descuides las prácticas: son el colchón que te deja llegar tranquilo al examen.'],
        vivo: [['Los exámenes son tu momento fuerte, pero las prácticas pesan.'], ['Mira', 'Meta del curso'], ['Para ver cuánto necesitas en el examen según tus prácticas.']],
    },
    met: {
        paso: ['Tu trabajo continuo es tu fortaleza.', 'En tu próximo periodo académico, no te confíes en los exámenes: prepáralos igual que tus prácticas.'],
        vivo: [['Tu trabajo continuo es tu fortaleza.'], ['Mira', 'Qué nota necesito'], ['Para ver qué nota en el examen te asegura el curso.']],
    },
    con: {
        paso: ['Tu ritmo parejo hace fácil planificar.', 'En tu próximo periodo académico, fija una meta de promedio y cuida que cada práctica la sostenga.'],
        vivo: [['Tu ritmo parejo hace fácil planificar.'], ['Mira', 'Meta del curso'], ['Para ver qué nota necesitas si quieres subir un punto en tu promedio.']],
    },
    equ: {
        paso: ['Rindes parejo, así que ningún curso te da sorpresas.', 'En tu próximo periodo académico, usa esa regularidad para apuntar un poco más alto en los cursos que más créditos pesan.'],
        vivo: [['Rindes parejo en todo: aprovéchalo para subir tu promedio.'], ['Mira', 'Meta del curso'], ['Para ver qué nota necesitas si quieres subir un punto.']],
    },
};

/* Rellena las {marcas} de un texto con los datos. Si falta un dato, la marca se borra. */
export function rellenar(texto, datos = {}) {
    return String(texto).replace(/\{(\w+)\}/g, (_, clave) => (datos[clave] ?? ''));
}
