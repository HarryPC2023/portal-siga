// js/desarrollo-contenido.js — Textos y guías de «Desarrollo profesional» (CV Profesional).
//
// Contenido estático: se edita aquí, sin tocar el constructor ni la base de datos.
// Para cambiar un consejo, un ejemplo o un mensaje de ayuda basta con editar este archivo.
//
// PRINCIPIO DE DISEÑO (regla de Harry): diseñar desde quien busca sus primeras prácticas preprofesionales.
// El constructor debe ayudar al estudiante a reconocer, organizar y comunicar sus conocimientos, proyectos y
// experiencias reales, incluso cuando inicialmente sienta que no tiene nada que incluir. No debe exigir
// trayectorias que todavía no ha tenido, pero tampoco limitarse a mostrar campos vacíos. Cada sección debe
// ofrecer orientación adecuada para que el estudiante descubra qué puede aportar.

export const LEMA = 'Crea experiencia → impulsa tu perfil → demuestra tu potencial';

export const PASOS = [
    {
        id: 'datos', titulo: 'Datos básicos',
        porQue: 'Solo lo que una empresa necesita para contactarte.',
        consejo: 'Puedes poner LinkedIn, GitHub, ambos o ninguno. No pongas DNI, dirección exacta ni foto: no hacen falta.',
    },
    {
        id: 'formacion', titulo: 'Formación',
        porQue: 'Este CV es tuyo: puedes cambiar lo que SIGA te prellena y tu perfil no se modifica.',
        consejo: 'Elige hasta 5 cursos relacionados con el puesto al que postulas. El promedio es opcional: inclúyelo solo si te favorece.',
    },
    {
        id: 'proyectos', titulo: 'Proyectos', etiquetaPaso: 'Recomendado para tu primer CV',
        porQue: 'Aquí muestras lo que sabes hacer, aunque nunca hayas trabajado.',
        consejo: 'Empieza describiendo tu participación con un verbo. El resultado no tiene que ser un número: un repositorio, una presentación, una demostración o un documento también sirven.',
    },
    {
        id: 'habilidades', titulo: 'Habilidades', etiquetaPaso: 'Recomendado',
        porQue: 'Registra los conocimientos, herramientas, idiomas y habilidades personales que has desarrollado durante tu formación y otras experiencias.',
        consejo: 'Sé honesto al describir tus capacidades. Si lo deseas, indica tu nivel de dominio en conocimientos y herramientas. En idiomas, puedes indicar tu nivel general y detallar tus habilidades. Evita porcentajes como «Python 85 %»: dan una falsa sensación de precisión.',
    },
    {
        id: 'certificaciones', titulo: 'Certificaciones', etiquetaPaso: 'Opcional',
        porQue: 'Lo que has aprendido fuera del aula también cuenta, incluso si fue un solo curso.',
        consejo: 'Prioriza lo que se relaciona con lo que buscas. Copia el nombre tal como aparece en tu constancia y conserva tú el documento: SIGA solo guarda el nombre y, si quieres, un enlace.',
    },
    {
        id: 'logros', titulo: 'Logros', etiquetaPaso: 'Opcional',
        porQue: 'Reconocimientos y resultados que vale la pena destacar.',
        consejo: 'Describe qué hiciste y qué resultado tuvo. No inventes cifras: un hecho real y verificable pesa más que un número dudoso.',
    },
    {
        id: 'experiencia', titulo: 'Experiencia', etiquetaPaso: 'Opcional',
        porQue: 'No se limita a empleos formales. También cuenta cualquier experiencia donde hayas asumido responsabilidades, colaborado con otras personas o aportado valor.',
        consejo: 'Lo que más aporta es lo que hiciste, más que el nombre del lugar. Si formas parte de un grupo o centro, cuenta qué responsabilidades asumiste o cómo colaboraste.',
    },
    {
        id: 'perfil', titulo: 'Perfil profesional', etiquetaPaso: 'Recomendado',
        porQue: 'Una breve presentación para explicar qué estudias, qué conocimientos o intereses quieres destacar y hacia dónde te gustaría orientar tu desarrollo profesional.',
        consejo: 'Escríbelo en primera persona y con tus palabras. Tu perfil se construye con lo que sí tienes hoy: tu formación, lo que estás aprendiendo y lo que te interesa.',
    },
    {
        id: 'revision', titulo: 'Revisión',
        porQue: 'Mira qué le falta a tu CV. El semáforo orienta; tú decides qué hacer.',
        consejo: '',
    },
];

// Verbos para describir el trabajo, de varias disciplinas: [infinitivo, presente (1.ª persona), pasado (1.ª persona)].
// El borrador usa el presente si el proyecto sigue en desarrollo y el pasado si ya terminó.
export const VERBOS_TRABAJO = [
    ['Desarrollar', 'Desarrollo', 'Desarrollé'], ['Diseñar', 'Diseño', 'Diseñé'], ['Analizar', 'Analizo', 'Analicé'],
    ['Investigar', 'Investigo', 'Investigué'], ['Construir', 'Construyo', 'Construí'], ['Implementar', 'Implemento', 'Implementé'],
    ['Modelar', 'Modelo', 'Modelé'], ['Elaborar', 'Elaboro', 'Elaboré'], ['Experimentar', 'Experimento', 'Experimenté'],
    ['Evaluar', 'Evalúo', 'Evalué'], ['Calcular', 'Calculo', 'Calculé'], ['Automatizar', 'Automatizo', 'Automaticé'],
    ['Organizar', 'Organizo', 'Organicé'], ['Coordinar', 'Coordino', 'Coordiné'], ['Gestionar', 'Gestiono', 'Gestioné'],
];

// Cinco categorías según DÓNDE nació el proyecto (no según su tema ni su tecnología): sirven para cualquier facultad.
export const CATEGORIAS_PROYECTO = [
    { id: 'curso', nombre: 'Proyecto de curso', texto: 'Lo hiciste dentro de una asignatura: trabajos finales, laboratorios, diseños, informes o maquetas.' },
    { id: 'inv', nombre: 'Investigación', texto: 'Estudios, experimentos, análisis, semilleros o trabajos de investigación.' },
    { id: 'propia', nombre: 'Iniciativa propia', texto: 'Algo que creaste por tu cuenta, fuera de una actividad académica: una aplicación, un diseño, un prototipo, un estudio.' },
    { id: 'centro', nombre: 'Centro u organización estudiantil', texto: 'Proyectos dentro de centros, capítulos o grupos estudiantiles.' },
    { id: 'ext', nombre: 'Para un negocio, empresa o comunidad', texto: 'Trabajos por encargo, colaboraciones y aportes concretos para otras personas u organizaciones, con o sin pago.' },
];
// Habilidades: ayudas añadidas para quien busca sus primeras prácticas.
export const DESDE_PROYECTOS = {
    titulo: 'Herramientas que anotaste en tus proyectos',
    ayuda: 'Toca una para añadirla a tus herramientas. Puedes ponerle nivel después.',
};
export const AYUDA_CONSERVAR = 'Conserva tú los certificados o constancias de lo que sabes: SIGA no guarda documentos, pero te servirán cuando una empresa los pida.';

export const MODALIDADES_PROYECTO = [{ id: 'solo', nombre: 'Solo' }, { id: 'equipo', nombre: 'En equipo' }];

// Ayuda para descubrir proyectos (paso Proyectos): sirve a quien siente que «no tiene nada que incluir».
export const AYUDA_PROYECTOS = {
    resumen: '¿No sabes qué proyecto incluir?',
    intro: 'Un proyecto no tiene que ser un sistema informático ni estar terminado. Según dónde nació, puede ser:',
    parcial: 'Un trabajo parcial también cuenta: un avance de un curso, un prototipo, un laboratorio o algo que construiste solo en parte. Lo importante es que puedas explicar qué hiciste tú.',
    preguntasTitulo: 'Para recordar, piensa en:',
    preguntas: [
        'Algún trabajo final, laboratorio o informe del que te sientas orgulloso.',
        'Algo que armaste por tu cuenta para resolver un problema tuyo o de alguien más.',
        'Un trabajo en equipo en el que tuviste una parte clara.',
        'Una ayuda concreta que diste a un negocio, familiar, colegio o comunidad.',
    ],
};
// Sugerencia para quien aún no tiene proyectos: Proyectos Prácticos es la parte 1 de la portada de Desarrollo profesional.
export const SUGERENCIA_PROYECTOS_PRACTICOS = {
    textoSin: 'Si todavía no tienes proyectos, en Proyectos Prácticos descubres qué construir con lo que aprendes en tus cursos.',
    textoCon: '¿Quieres tener más proyectos para mostrar? En Proyectos Prácticos descubres qué construir con lo que aprendes en tus cursos.',
    boton: 'Ir a Proyectos Prácticos →',
    // Hoy apunta a la portada (donde está la tarjeta). Cuando la sección exista, cambiar por su página (p. ej. 'proyectos-practicos.html').
    enlace: 'desarrollo.html',
};

// Tres grupos de herramientas, con escritura libre: las sugerencias solo orientan.
export const GRUPOS_HERRAMIENTAS = [
    { id: 'sw', nombre: 'Software y tecnologías', texto: 'Programas, aplicaciones, lenguajes de programación, plataformas y tecnologías especializadas.' },
    { id: 'eq', nombre: 'Equipos y materiales', texto: 'Instrumentos, dispositivos, herramientas físicas y materiales.' },
    { id: 'me', nombre: 'Métodos y técnicas', texto: 'Metodologías de investigación, procedimientos, técnicas de análisis y métodos de trabajo.' },
];

// ═══ REGLAS DE LOS EJEMPLOS (Logros, Certificaciones, Proyectos, Experiencia) ═══
// 1. Enseñan a comunicar, no qué trayectoria tener: ayudan a reconocer posibilidades que el estudiante quizá no había considerado.
// 2. Neutrales y variados: distintas facultades, escalas (pequeños, medianos, elaborados) y tipos de trabajo; no siempre cifras ni resultados espectaculares.
// 3. Son modelos de redacción: el estudiante cambia los datos por los suyos y no inventa resultados (cantidades, puestos, promedios, concursos).
// 4. Rotación determinista: cada tarjeta nueva toma el PRIMER ejemplo de la lista que no esté en uso (si todos lo están, el menos usado). Nunca se guardan en el CV.
// 5. Los ejemplos del campo no repiten los de las ayudas ("¿Cómo puedes redactarlo?"). Revisarlos con estudiantes o docentes de cada facultad.

// Ejemplos orientativos según la carrera del alumno (no limitan: puede escribir cualquier proyecto). «gen» sirve para cualquier carrera.
// Estos ejemplos deberían revisarlos estudiantes o docentes de cada facultad antes de ampliarlos.
export const PATRONES_CARRERA = [
    ['arq', /arquitect|urban/i],
    ['civ', /civil|sanitari|hidr[aá]ulic/i],
    ['qui', /qu[ií]mic/i],
    ['sis', /sistemas|software|inform[aá]tic|computaci|ciencia de datos|inteligencia artificial/i],
];
export const EJEMPLOS_CARRERA = {
    sis: {
        desc: 'Describe qué es tu proyecto, qué hiciste tú y con qué lo construiste.',
        herr: { sw: ['Python', 'JavaScript', 'SQL', 'Git'], eq: ['Arduino', 'Raspberry Pi'], me: ['Scrum', 'Pruebas con usuarios'] },
        variantes: [
            { nombre: 'Control de inventario de una bodega pequeña', objeto: 'un sistema de control de inventario para una bodega pequeña', meta: 'llevar el registro de productos y existencias', hizo: 'diseñar la base de datos y programar el registro de movimientos', hice: 'diseñé la base de datos y programé el registro de movimientos', resultado: 'el encargado dejó de anotar el stock a mano' },
            { nombre: 'Análisis de las notas de un curso con Python', objeto: 'un análisis de las notas de un curso', meta: 'identificar qué temas costaron más al grupo', hizo: 'limpiar los datos y graficar los resultados con Python', hice: 'limpié los datos y grafiqué los resultados con Python', resultado: 'un informe con las conclusiones' },
            { nombre: 'Sitio web de un club estudiantil', objeto: 'el sitio web de un club estudiantil', meta: 'dar a conocer las actividades del club', hizo: 'diseñar las páginas y publicarlas', hice: 'diseñé las páginas y las publiqué', resultado: 'el club lo usa para anunciar sus eventos' },
        ],
    },
    arq: {
        desc: 'Describe qué diseñaste o realizaste, tu aporte y los recursos que usaste.',
        herr: { sw: ['AutoCAD', 'Revit', 'SketchUp'], eq: ['Maqueta en cartón pluma', 'Cortadora láser'], me: ['Análisis de sitio', 'Diseño participativo'] },
        variantes: [
            { nombre: 'Rediseño del aula de un colegio', objeto: 'el rediseño del aula de un colegio', meta: 'mejorar la iluminación y la circulación', hizo: 'levantar medidas y dibujar la propuesta en planos', hice: 'levanté medidas y dibujé la propuesta en planos', resultado: 'la propuesta fue presentada en clase' },
            { nombre: 'Maqueta de una vivienda unifamiliar', objeto: 'una vivienda unifamiliar', meta: 'mostrar su distribución y sus volúmenes', hizo: 'elaborar los planos y construir la maqueta', hice: 'elaboré los planos y construí la maqueta', resultado: 'la maqueta fue evaluada en el curso' },
            { nombre: 'Propuesta de centro cultural', objeto: 'la propuesta de un centro cultural', meta: 'dar un espacio público a un barrio sin equipamiento', hizo: 'elaborar los planos, cortes y la maqueta final', hice: 'elaboré los planos, los cortes y la maqueta final', resultado: 'la propuesta fue presentada ante el jurado del curso' },
        ],
    },
    civ: {
        desc: 'Describe qué analizaste o construiste, tu aporte y los recursos que usaste.',
        herr: { sw: ['SAP2000', 'AutoCAD', 'Excel'], eq: ['Estación total', 'Nivel óptico'], me: ['Método de rigidez', 'Ensayos de laboratorio'] },
        variantes: [
            { nombre: 'Medición topográfica de un terreno', objeto: 'el levantamiento topográfico de un terreno', meta: 'obtener sus medidas y desniveles', hizo: 'tomar los datos en campo y procesarlos', hice: 'tomé los datos en campo y los procesé', resultado: 'un plano con curvas de nivel' },
            { nombre: 'Diseño de un muro de contención', objeto: 'el diseño de un muro de contención', meta: 'verificar su estabilidad', hizo: 'calcular las fuerzas y dimensionar el muro', hice: 'calculé las fuerzas y dimensioné el muro', resultado: 'una memoria de cálculo para el curso' },
            { nombre: 'Análisis académico de la estructura de un puente peatonal', objeto: 'el análisis académico de la estructura de un puente peatonal', meta: 'verificar que soporte las cargas de uso', hizo: 'calcular las cargas y modelar la estructura', hice: 'calculé las cargas y modelé la estructura', resultado: 'un informe con las verificaciones de resistencia' },
        ],
    },
    gen: {
        desc: 'Describe qué hiciste, cuál fue tu aporte y qué recursos usaste.',
        herr: { sw: ['Excel', 'Word', 'PowerPoint'], eq: ['Instrumentos de medición'], me: ['Encuestas', 'Revisión bibliográfica'] },
        variantes: [
            { nombre: 'Organización de un estudio de caso grupal', objeto: 'un estudio de caso en grupo', meta: 'analizar una situación real del curso', hizo: 'repartir tareas y redactar las conclusiones', hice: 'repartí tareas y redacté las conclusiones', resultado: 'el caso se presentó en clase' },
            { nombre: 'Informe técnico de laboratorio', objeto: 'un informe técnico de laboratorio', meta: 'documentar un experimento y sus resultados', hizo: 'tomar las mediciones y redactar el informe', hice: 'tomé las mediciones y redacté el informe', resultado: 'el informe fue evaluado por el docente' },
            { nombre: 'Propuesta de mejora para un taller', objeto: 'una propuesta de mejora para un taller', meta: 'ordenar y hacer más seguro el espacio de trabajo', hizo: 'observar el taller y proponer cambios', hice: 'observé el taller y propuse cambios', resultado: 'la propuesta se presentó al docente a cargo' },
        ],
    },
};

export const EJEMPLO_PROYECTO = {
    nombre: 'Sistema de gestión de inventario',
    queHiciste: 'Desarrollé un sistema para registrar productos, controlar existencias y consultar movimientos de inventario.',
    herramientas: 'Python, SQLite y Git',
    evidencia: 'Permitió centralizar el registro de productos y reducir el trabajo manual de control.',
};

// ───────────── Certificaciones y formación complementaria (paso propio) ─────────────
export const TIPOS_CERTIFICACION = [
    { id: 'certificacion', nombre: 'Certificación', texto: 'Acreditación otorgada por una entidad que reconoce determinados conocimientos o competencias.' },
    { id: 'curso', nombre: 'Curso', texto: 'Actividad formativa sobre un tema específico, que puede entregar una constancia al completarse.' },
    { id: 'diplomado', nombre: 'Diplomado', texto: 'Programa de formación especializado que aborda un área con mayor profundidad.' },
    { id: 'programa', nombre: 'Programa', texto: 'Trayecto formativo estructurado, como un bootcamp, programa intensivo o ruta de aprendizaje.' },
];
export const CERTIFICACIONES = {
    // [nombre, quién lo dio]: un ejemplo distinto por tarjeta; mezclan curso, taller, programa y certificación.
    ejemplos: [
        ['Excel intermedio', 'Centro de capacitación'],
        ['Curso de inglés intermedio', 'Centro de idiomas'],
        ['Curso de primeros auxilios', 'Institución de salud o voluntariado'],
        ['Taller de seguridad en laboratorio', 'Facultad'],
        ['AutoCAD básico', 'Academia o instituto'],
        ['Taller de redacción académica', 'Universidad'],
        ['Programa de liderazgo estudiantil', 'Organización estudiantil'],
        ['Gestión del tiempo y productividad', 'Plataforma en línea'],
    ],
    intro: 'Cursos, talleres y certificaciones que has completado, dentro o fuera de la universidad. Deben ser actividades formativas finalizadas, no cursos de tu carrera que todavía estás llevando. Si todavía no tienes ninguna, puedes saltar este paso.',
    vacio: 'No necesitas acumular certificados. Una formación relacionada con lo que buscas puede aportar valor a tu CV.',
    descubrir: {
        resumen: '¿Has realizado alguna formación que podrías incluir?',
        intro: 'Quizá tienes más de lo que crees. Revisa si alguna de estas situaciones te suena:',
        items: [
            'Un curso o taller que hiciste en tu facultad, en un centro estudiantil o en extensión universitaria.',
            'Un curso de idiomas, aunque haya sido hace un tiempo.',
            'Un curso corto en línea, gratuito o de pago, que terminaste.',
            'Una capacitación en una herramienta que usas (Excel, Python, AutoCAD…).',
            'Un programa formativo de una empresa, una institución o un voluntariado (no cualquier actividad realizada allí).',
            'Una constancia de un curso, taller o capacitación que completaste.',
        ],
        cierre: 'Un buen CV no necesita muchos certificados. Basta con lo que de verdad hiciste y se relaciona con lo que buscas.',
    },
    cuales: {
        resumen: '¿Cuáles incluir?',
        items: [
            'Los que se relacionan con lo que buscas.',
            'No hace falta poner todo lo que hiciste.',
            'Si hiciste varios cursos cortos del mismo tema, agrúpalos en uno: «Excel: básico e intermedio».',
            'Un curso puede incluirse aunque no te hayan dado un certificado formal, siempre que lo hayas completado y puedas decir qué formación fue y quién la dio.',
            'Los cursos de tu malla curricular, incluidos los electivos, van en Formación, no aquí.',
        ],
        cierre: 'Para un primer CV, puedes comenzar con 3 a 5 elementos relevantes. Es preferible incluir pocos y relacionados con tu objetivo que llenar la sección con cursos que aportan poco.',
    },
    donde: {
        resumen: '¿Dónde encuentro los míos?',
        items: [
            'Correos electrónicos y cuentas de plataformas educativas.',
            'Centros de idiomas.',
            'Cursos de extensión universitaria.',
            'Talleres y actividades de centros estudiantiles.',
            'Plataformas de fabricantes de software y tecnología.',
            'Programas de capacitación y formación profesional.',
        ],
        cierre: 'No todo taller o actividad entrega un certificado, y eso no le quita valor. Pero esta sección es para formación que se pueda identificar con claridad.',
    },
    como: {
        resumen: '¿Cómo lo escribo?',
        texto: 'Nombre exacto, quién lo dio y el año. Copia el nombre tal como aparece en el certificado o la constancia: SIGA no lo cambia.',
        ejemplo: 'Fundamentos de bases de datos · Centro de extensión · 2025',
    },
    tipos: {
        resumen: '¿Qué es cada tipo?',
        cierre: 'Si no sabes qué tipo elegir, puedes dejarlo sin especificar. Lo importante es registrar el nombre real de la formación.',
    },
    conservar: 'Conserva tú los certificados y constancias: SIGA no guarda documentos, pero los necesitarás si una empresa los pide.',
    enlaceAyuda: 'Si hay un enlace donde se pueda verificar, añádelo. Es opcional.',
    enlacePrivacidad: 'No pegues enlaces que muestren tu DNI, dirección o teléfono.',
};

// ───────────── Experiencia (paso propio) ─────────────
// Verbos para describir lo hecho: [infinitivo, presente (1.ª persona), pasado (1.ª persona), ejemplo de lo que sigue al verbo].
// Son verbos neutros: no hay «Liderar» ni «Dirigir» a propósito. El borrador nunca convierte un verbo en otro más fuerte.
export const VERBOS_EXPERIENCIA = [
    ['Coordinar', 'Coordino', 'Coordiné', 'las tareas de un equipo de cinco personas'],
    ['Apoyar', 'Apoyo', 'Apoyé', 'a mis compañeros durante las prácticas'],
    ['Organizar', 'Organizo', 'Organicé', 'la lista de asistentes y los materiales'],
    ['Enseñar', 'Enseño', 'Enseñé', 'a compañeros de ciclos anteriores a resolver ejercicios'],
    ['Atender', 'Atiendo', 'Atendí', 'las consultas de los clientes y el registro de pedidos'],
    ['Colaborar', 'Colaboro', 'Colaboré', 'con el equipo en la preparación de los materiales'],
    ['Representar', 'Represento', 'Representé', 'a mi sección ante los docentes'],
    ['Investigar', 'Investigo', 'Investigué', 'el tema y reuní datos para el informe'],
];
export const MAX_VERBOS_EXPERIENCIA = 3;

export const EXPERIENCIA = {
    resumen: '¿Qué puede considerarse experiencia?',
    texto: 'No se limita a empleos formales ni a prácticas. Cuenta cualquier actividad donde hayas asumido responsabilidades, colaborado con otras personas o puesto tus conocimientos en práctica. Por ejemplo:',
    items: [
        'Ser delegado o representante de tu aula o sección.',
        'Dar tutorías o apoyar a compañeros en un curso.',
        'Participar como voluntario en una campaña o iniciativa.',
        'Ayudar en un negocio familiar o en un emprendimiento.',
        'Apoyar en un laboratorio, taller o grupo de investigación.',
        'Organizar o colaborar en un evento académico.',
        'Formar parte de centros de estudios, capítulos o grupos de tu facultad, destacando lo que hiciste allí.',
        'Realizar trabajos independientes o temporales.',
    ],
    cierre: 'Pertenecer a una organización no es experiencia por sí solo: lo valioso es lo que hiciste allí.',
    vacio: 'Todavía no agregaste ninguna experiencia. Si no tienes una que quieras registrar por ahora, puedes continuar con el siguiente paso.',
    // Un ejemplo distinto por tarjeta (ver REGLAS DE LOS EJEMPLOS). Son modelos de redacción: no se guardan.
    ejemplos: [
        { puesto: 'Delegado de aula', hizo: 'Representé a mi sección ante los docentes y organicé la comunicación del grupo.', org: 'Mi sección de la facultad', contexto: 'ser el nexo entre los compañeros y los docentes de la sección', resultado: 'los avisos llegaban a todos a tiempo' },
        { puesto: 'Tutor de un curso de ciclos iniciales', hizo: 'Resolví dudas y preparé ejercicios para compañeros de ciclos anteriores.', org: 'Tutorías de mi facultad', contexto: 'apoyar a compañeros de ciclos iniciales en un curso', resultado: 'varios compañeros resolvieron sus dudas antes de los exámenes' },
        { puesto: 'Voluntario en una campaña de apoyo', hizo: 'Ayudé a clasificar y entregar donaciones durante la campaña.', org: 'Organización de voluntariado', contexto: 'recolectar y repartir donaciones para familias de mi distrito', resultado: 'las donaciones se entregaron en la fecha prevista' },
        { puesto: 'Apoyo en el negocio familiar', hizo: 'Atendí a clientes y llevé el registro de ventas de cada semana.', org: 'Negocio familiar', contexto: 'ayudar en la atención y el control de ventas de un negocio de mi familia', resultado: 'el registro de ventas quedó al día cada semana' },
        { puesto: 'Asistente en un laboratorio o taller', hizo: 'Ordené el material y apoyé a mis compañeros durante las prácticas.', org: 'Laboratorio de mi facultad', contexto: 'mantener ordenado el material y apoyar durante las prácticas', resultado: 'las prácticas empezaban a tiempo y con el material completo' },
        { puesto: 'Organizador de un evento académico', hizo: 'Coordiné la lista de invitados y la logística del auditorio.', org: 'Jornada académica de mi facultad', contexto: 'preparar una jornada académica para estudiantes de la facultad', resultado: 'la jornada se realizó según lo programado' },
        { puesto: 'Actividad independiente', hizo: 'Realicé encargos pequeños para personas de mi entorno y los entregué en el plazo acordado.', org: 'Por cuenta propia', contexto: 'resolver encargos pequeños para personas de mi entorno', resultado: 'los encargos se entregaron en el plazo acordado' },
        { puesto: 'Integrante de un centro o capítulo estudiantil', hizo: 'Preparé materiales y participé en la organización de las reuniones.', org: 'Centro de estudios de mi facultad', contexto: 'colaborar en las actividades de un grupo estudiantil', resultado: 'las reuniones contaron con el material preparado' },
        { puesto: 'Trabajo temporal', hizo: 'Atendí caja y ordené el inventario durante una campaña de verano.', org: 'Tienda de mi distrito', contexto: 'reforzar la atención de una tienda durante una campaña de verano', resultado: 'el inventario quedó ordenado al terminar la campaña' },
        { puesto: 'Asistente de investigación', hizo: 'Recopilé datos y ayudé a organizar los resultados de un estudio.', org: 'Grupo de investigación de mi facultad', contexto: 'apoyar un estudio con la recopilación y el orden de datos', resultado: 'los datos quedaron listos para el análisis del equipo' },
    ],
};

// Oferta de ayuda para redactar (la web la ofrece; el estudiante no tiene que pedirla).
export const OFERTA_AYUDA = {
    describir: 'Te ayudamos a describirlo',
    redactar: 'Te ayudamos a redactarlo',
    sub: 'Responde unas preguntas y revisa un borrador que puedes editar.',
    rehacer: 'Rehacer con ayuda',
    cerrar: 'Cerrar',
    icono: '✍️',
    // El resultado de un asistente es un punto de partida, no un texto terminado: se dice con claridad y sin tono de error.
    borradorTitulo: 'Tu borrador inicial',
    borradorAviso: 'Hemos organizado tus respuestas en un primer texto. Revísalo y ajusta las frases para que se conecten, no repitan ideas y reflejen tu participación real. Puedes editarlo libremente.',
    borradorAvisoPerfil: 'Hemos organizado tus respuestas en un primer texto. Revísalo y ajusta las frases para que se conecten y no repitan ideas. Puedes editarlo libremente.',
    revisar: 'Revisar redacción',
};

// ───────────── Logros y reconocimientos (paso propio) ─────────────
export const LOGROS = {
    vacio: 'Todavía no agregaste ningún logro. Si algo de las ayudas te suena, empieza por ahí.',
    // Un ejemplo distinto por tarjeta (ver REGLAS DE LOS EJEMPLOS). Son modelos de redacción: no se guardan.
    ejemplos: [
        'Coordiné la distribución de tareas de un equipo de cinco estudiantes para completar un trabajo académico dentro del plazo establecido.',
        'Obtuve el primer puesto en un concurso interno de mi facultad.',
        'Participé en una campaña de reciclaje de mi facultad que logró recolectar una cantidad importante de papel.',
        'Completé un curso de verano con la nota más alta de mi grupo.',
        'Redacté el manual de uso de un equipo de laboratorio, que hoy consultan los estudiantes del curso.',
        'Integré un equipo finalista en un concurso de proyectos universitarios.',
        'Mantuve un promedio ponderado superior a 15 durante tres ciclos consecutivos.',
        'Fui elegido para representar a mi sección en una reunión con las autoridades de la facultad.',
    ],
    reconocer: {
        resumen: '¿Qué puede considerarse un logro?',
        texto: 'No necesitas haber ganado un concurso ni recibido un premio. También cuentan lo que organizaste, las responsabilidades que asumiste, las personas a las que ayudaste y los resultados que conseguiste. Piensa si alguna vez has:',
        items: [
            'Obtenido un reconocimiento académico o una distinción.',
            'Asumido un cargo de representación o liderazgo.',
            'Organizado una actividad, evento o iniciativa.',
            'Presentado un proyecto, investigación o ponencia.',
            'Creado algo que otras personas llegaron a utilizar.',
            'Ayudado a otros estudiantes mediante asesorías o tutorías.',
        ],
    },
    descubrir: {
        resumen: '¿No sabes qué resultado destacar?',
        texto: 'Una experiencia se vuelve logro cuando identificas qué conseguiste con ella. Al añadir un logro, debajo de su campo verás pistas cortas para encontrarlo. No necesitas responderlas todas.',
    },
    pistas: {
        titulo: 'Pistas para destacar el resultado',
        items: ['¿Qué conseguiste?', '¿A quiénes ayudaste?', '¿Qué responsabilidad asumiste?', '¿Qué mejoró o llegó a realizarse?', '¿Te reconocieron o te seleccionaron?'],
    },
    // Asistente «Te ayudamos a redactarlo»: tipo (opcional, solo vista) → verbo + complemento → borrador editable.
    // Cada tipo: verbos [forma], ejemplo del complemento, y una segunda parte opcional con conector fijo (sin género ni número).
    asistente: {
        pregTipo: '¿Qué tipo de logro es?',
        ayudaTipo: 'Elige el que más se parezca; si ninguno encaja, sáltate esta pregunta.',
        pregHice: '¿Qué hiciste o conseguiste?',
        ayudaHice: 'Elige el verbo y completa la frase con tus palabras, sin repetirlo.',
        pregAlcance: '¿Quieres añadir un detalle?',
        ayudaAlcance: 'Dónde, con quién, durante cuánto tiempo o a quién benefició. Si no lo tienes claro, déjalo vacío.',
        cierre: 'No todos los logros necesitan cifras. Si no conoces una cantidad exacta, no la inventes. Los ejemplos son modelos de redacción: sustituye los datos por los tuyos.',
        tipos: [
            { nombre: 'Reconocimiento', verbos: ['Obtuve', 'Recibí', 'Gané'], a: 'una beca por rendimiento académico', conector: 'de parte de', b: 'la universidad' },
            { nombre: 'Liderazgo', verbos: ['Asumí', 'Ejercí'], a: 'la coordinación de un grupo de estudio', conector: 'durante', b: 'un ciclo académico' },
            { nombre: 'Organización', verbos: ['Organicé', 'Coordiné', 'Colaboré en la organización de'], a: 'una jornada académica', conector: 'con', b: 'la participación de estudiantes de mi facultad' },
            { nombre: 'Impacto', verbos: ['Elaboré', 'Creé', 'Diseñé', 'Desarrollé'], a: 'una guía de estudio', conector: 'que', b: 'otros compañeros de mi sección utilizaron' },
            { nombre: 'Presentación académica', verbos: ['Presenté', 'Expuse'], a: 'los resultados de un trabajo de laboratorio', conector: 'en', b: 'una exposición del curso' },
        ],
    },
    donde: {
        resumen: '¿No sabes dónde incluir algo?',
        items: [
            ['Proyectos', 'lo que hiciste o desarrollaste.'],
            ['Logros', 'lo que conseguiste o el impacto que generaste.'],
            ['Experiencia', 'las responsabilidades y funciones que desempeñaste, aunque hayan sido temporales.'],
        ],
        cierre: 'Una misma experiencia puede dar información a más de una sección, pero no repitas la misma descripción.',
    },
    respaldo: {
        etiqueta: 'Con qué lo respaldas',
        pista: 'Puedes añadir un dato o referencia para dar más contexto y credibilidad a tu logro.',
        placeholder: 'Una cantidad, un puesto obtenido, el nombre del evento o un enlace',
        privacidad: 'Si pones un enlace, que no muestre tu DNI, dirección ni teléfono.',
    },
};

// ───────────── Perfil profesional (paso propio) ─────────────
// Los ejemplos son modelos de redacción de distintas áreas (ver REGLAS DE LOS EJEMPLOS); no se guardan y no se atribuyen al estudiante.
// Guardado visible: el sistema guarda solo; estos textos se lo hacen saber al alumno y cierran cada tarjeta.
export const GUARDADO = {
    reposo: 'Se guarda automáticamente',
    guardando: 'Guardando…',
    guardado: '✓ Guardado',
    nota: 'Todo lo que escribes se guarda solo. Este botón registra el elemento en tu lista y cierra la tarjeta.',
    proyecto: { boton: 'Registrar proyecto', ok: 'Proyecto registrado en tu lista de proyectos.', falta: 'Escribe el nombre del proyecto para poder registrarlo.' },
    experiencia: { boton: 'Registrar experiencia', ok: 'Experiencia registrada en tu lista de experiencias.', falta: 'Escribe el puesto o la actividad para poder registrarla.' },
    logro: { boton: 'Registrar logro', ok: 'Logro registrado en tu lista de logros.', falta: 'Describe tu logro para poder registrarlo.' },
};

// Vista previa dentro de la tarjeta: el mismo texto que saldrá en el CV, siempre al día.
export const PREVIA = {
    titulo: 'Así se verá en tu CV',
    vivo: 'Se actualiza mientras completas',
    proyecto: { vacio: 'Aquí aparecerá tu proyecto a medida que lo completes.', nota: 'Las herramientas y los métodos salen en la primera línea. No hace falta repetirlos en la descripción.' },
    experiencia: { vacio: 'Aquí aparecerá tu experiencia a medida que la completes.', nota: 'Lo que escribas en «¿Qué hiciste?» aparece debajo del puesto.' },
};

// Campo plegable «Resultado o evidencia» del proyecto (se pliega igual que los grupos de herramientas).
export const EVIDENCIA = {
    resumen: 'Resultado o evidencia',
    cuenta: ' · completado',
    texto: 'Lo que respalda tu proyecto: un repositorio, una presentación, una demostración, un documento o un resultado.',
    placeholder: 'Un repositorio, una presentación, una demostración, un documento o un resultado',
};

export const PERFIL = {
    bienvenida: 'No necesitas experiencia para tener un perfil profesional',
    bienvenidaTexto: 'Tu formación, tus conocimientos y tus intereses también cuentan.',
    etiqueta: 'Tu presentación en pocas líneas',
    placeholder: 'Cuenta qué estudias, qué quieres destacar y qué te interesa. Dos o tres frases bastan.',
    asistente: {
        pregEstudia: '¿Qué estudias?',
        ayudaEstudia: 'Lo tomamos de tu paso Formación. Cámbialo si quieres.',
        placeEstudia: 'Ej. tu carrera y tu universidad',
        pregDestacar: '¿Qué conocimientos, herramientas o experiencias quieres destacar?',
        ayudaDestacar: 'Puedes elegir hasta 3 elementos de tus proyectos y habilidades. Solo utilizaremos sus nombres.',
        ayudaLibre: 'O escribe otros, separados por comas.',
        avisoMax: 'Elige hasta 3: con más, la frase se vuelve una lista.',
        pregBusca: '¿Qué te interesa o qué buscas?',
        ayudaBusca: 'Escribe tu propia frase, con tu verbo: lo que quieres aprender, a qué área te orientas o qué tipo de oportunidad buscas.',
    },
    ejemplosDestacar: ['Excel', 'AutoCAD', 'Python', 'Estadística', 'Gestión de proyectos', 'Diseño estructural', 'Investigación', 'Organización de actividades', 'Trabajo en equipo', 'Participación en laboratorio'],
    ejemplosBusca: [
        'Busco una práctica preprofesional en el área de estructuras',
        'Me interesa el análisis de datos aplicado a la gestión empresarial',
        'Quiero aprender más sobre gestión y supervisión de obras',
        'Me interesa participar en proyectos de investigación ambiental',
    ],
    genericas: ['proactivo', 'proactiva', 'responsable', 'dinámico', 'dinámica', 'apasionado', 'apasionada', 'comprometido', 'comprometida'],
    avisoGenerica: 'Si usas palabras como «proactivo» o «responsable», pregúntate qué hiciste que lo demuestre.',
    maxCaracteres: 450,
    avisoLargo: 'Para un primer CV suelen bastar de tres a cinco líneas. Si puedes, acórtalo un poco.',
};

export const TIPOS_EXPERIENCIA = [
    'Voluntariados', 'Tutorías o asesorías', 'Organizaciones estudiantiles (IEEE, ACIA, LeadUNI…)', 'Delegado de aula o representación',
    'Organización de eventos', 'Freelance o actividades independientes', 'Apoyo en negocios familiares', 'Trabajos temporales',
];

// Cuatro categorías de habilidades. Las dos primeras admiten un nivel OPCIONAL; idiomas lleva nivel general (y detalle opcional); las personales no llevan nivel.
export const HABILIDADES = {
    tecnica: { titulo: 'Conocimientos técnicos', ayuda: 'Lo que sabes hacer y aplicar. Los ejemplos se adaptan a tu carrera. Nivel de dominio opcional.' },
    herramienta: { titulo: 'Herramientas y tecnologías', ayuda: 'Programas, aplicaciones, equipos y recursos que sabes utilizar. Aquí van las que sabes usar, no solo las de un proyecto concreto. Nivel de dominio opcional.' },
    idioma: { titulo: 'Idiomas', ayuda: 'Indica tu nivel general y, si lo deseas, detalla tus niveles de comprensión auditiva, comprensión lectora, expresión oral y expresión escrita.' },
    personal: { titulo: 'Habilidades personales', ayuda: 'Selecciona hasta 5 que realmente te representen. Piensa en situaciones en las que las hayas demostrado: trabajos grupales, proyectos, actividades universitarias, voluntariado u otras experiencias. Por ejemplo, coordinar un equipo puede reflejar liderazgo.' },
};
export const HABILIDADES_PERSONALES = [
    'Comunicación', 'Trabajo en equipo', 'Liderazgo', 'Resolución de problemas', 'Organización',
    'Adaptabilidad', 'Pensamiento crítico', 'Iniciativa', 'Creatividad', 'Gestión del tiempo',
];
export const MAX_PERSONALES = 5;
export const DETALLE_IDIOMA = [   // [clave guardada, etiqueta del formulario, cómo se escribe en el CV]
    ['au', 'Comprensión auditiva', 'comprensión auditiva'], ['le', 'Comprensión lectora', 'lectura'],
    ['or', 'Expresión oral', 'expresión oral'], ['es', 'Expresión escrita', 'expresión escrita'],
];
export const AYUDA_QUE_INCLUIR = 'Piensa en los conocimientos que has adquirido en tus cursos, proyectos, investigaciones, actividades o experiencias. Incluye aquello que sabes aplicar y que puede aportar valor a tu perfil profesional. Cuentan los conocimientos de la universidad, no solo los de cursos externos o certificaciones, siempre que seas honesto con tu nivel.';
export const AYUDA_NIVELES = 'Básico: conozco los fundamentos. Intermedio: lo he aplicado en trabajos o proyectos. Avanzado: lo uso con soltura en situaciones complejas. Es tu propia valoración y puedes dejarlo vacío.';
export const AVISO_IDIOMAS = 'Niveles declarados por ti, no una certificación oficial.';
// Ejemplos de conocimientos y herramientas según la carrera (orientativos: se puede escribir cualquier cosa). Deberían revisarlos estudiantes de cada facultad.
export const EJEMPLOS_HABILIDADES = {
    sis: { tec: ['Programación', 'Análisis de datos', 'Modelado de bases de datos'], her: ['Python', 'SQL', 'Git', 'Power BI'] },
    arq: { tec: ['Diseño arquitectónico', 'Representación gráfica', 'Modelado 3D'], her: ['AutoCAD', 'Revit', 'SketchUp'] },
    civ: { tec: ['Análisis estructural', 'Topografía', 'Presupuestos de obra'], her: ['SAP2000', 'AutoCAD', 'Excel'] },
    qui: { tec: ['Análisis químico', 'Experimentación', 'Investigación'], her: ['MATLAB', 'Excel', 'Instrumentos de laboratorio'] },
    gen: { tec: ['Análisis de datos', 'Investigación', 'Planificación'], her: ['Excel', 'Word', 'PowerPoint'] },
};
export const NIVELES = ['Básico', 'Intermedio', 'Avanzado'];

// ───────────── semáforo ─────────────
export const LEYENDA = [
    { estado: 'rojo', nombre: 'Rojo', texto: 'Falta información importante' },
    { estado: 'ambar', nombre: 'Ámbar', texto: 'Hay información, pero faltan campos de respaldo' },
    { estado: 'verde', nombre: 'Verde', texto: 'Los campos requeridos están completos' },
    { estado: 'gris', nombre: 'Gris', texto: 'Información opcional' },
];

export const AVISO_SEMAFORO_TITULO = 'Sobre la evaluación de tu CV';
export const AVISO_SEMAFORO =
    'El semáforo utiliza reglas automáticas fijas para comprobar que hayas completado los campos y proporcionado información de respaldo. ' +
    'No verifica si tus logros o evidencias son reales, no evalúa la calidad de tu redacción ni determina tu preparación profesional ' +
    'ni garantiza que una empresa te seleccione.';
export const NOTA_DESCARGA = 'Puedes descargar tu CV aunque queden pasos en ámbar o rojo: el semáforo orienta, tú decides.';

// ───────────── impresión ─────────────
export const AYUDA_IMPRESION =
    'En la ventana de impresión elige «Guardar como PDF» y, en «Más ajustes», desactiva «Encabezados y pies de página». ' +
    'Tamaño A4, márgenes «Predeterminado».';
export const NOTA_ATS = 'Una sola columna, sin foto, tablas ni íconos: así lo leen mejor los filtros automáticos de las empresas.';

// ───────────── avisos ─────────────
export const AVISO_CONFLICTO = 'Este dato se cambió desde otro dispositivo al mismo tiempo. Mostramos la versión más reciente.';
export const AVISO_ERROR_GUARDADO = 'No se pudo guardar tu último cambio. Seguimos intentando.';

// ───────────── hub ─────────────
export const PARTES_HUB = [
    {
        id: 'proyectos', etiqueta: 'Crea experiencia', titulo: 'Proyectos Prácticos', subtitulo: 'Aprendizaje aplicado y generación de proyectos',
        texto: 'Descubre qué puedes construir con lo que aprendes en tus cursos, aunque aún no tengas experiencia que mostrar.',
        disponible: false,
    },
    {
        id: 'cv', etiqueta: 'Impulsa tu perfil', titulo: 'CV Profesional', subtitulo: 'Presentación profesional',
        texto: 'Reconoce tus fortalezas, organiza tus experiencias y presenta tus capacidades de forma profesional.',
        disponible: true, enlace: 'cv-profesional.html',
    },
    {
        id: 'entrevista', etiqueta: 'Demuestra tu potencial', titulo: 'Prepárate para tu Entrevista', subtitulo: 'Preparación y comunicación profesional',
        texto: 'Aprende a explicar lo que has hecho, responder preguntas y desenvolverte en una entrevista.',
        disponible: false,
    },
];
export const NOTA_PRIVACIDAD = 'Lo que escribes aquí es privado: solo tú lo ves. Nada se publica.';

// Mensajes de avance de cada paso del constructor del CV (cv-profesional.js). Solo texto: ninguna regla depende de ellos.
export const ETAPAS = {
    datos: 'Empiezas por lo más fácil: tus datos de contacto',
    formacion: 'Ya tienes lo básico: ahora cuenta dónde estudias',
    proyectos: 'Aquí está lo que más pesa: lo que ya has construido',
    habilidades: 'Lo que sabes hacer, con las palabras que buscan las empresas',
    certificaciones: 'Lo que aprendiste fuera del aula también cuenta',
    logros: 'Lo que te distingue: lo que conseguiste',
    experiencia: 'También cuenta lo que no fue un empleo formal',
    perfil: 'Te presentas con tus propias palabras',
    revision: 'Último paso: revisa tu perfil y descárgalo',
};
// Se muestran SOLO cuando el semáforo de ese paso está en verde (así lo que dicen es cierto).
export const COMPLETADO = {
    datos: 'Datos básicos completados · Información suficiente para contactarte',
    formacion: 'Formación registrada · Tu CV ya muestra dónde estudias',
    proyectos: 'Proyectos completos · Tu CV ya muestra lo que sabes hacer',
    habilidades: 'Habilidades registradas · Tu CV ya muestra lo que sabes usar',
    certificaciones: 'Formación complementaria registrada · Tu CV ya muestra lo que estudiaste además de tu carrera',
    logros: 'Logro registrado · Es lo que te distingue',
};

// Consejo sobre la extensión del CV: se muestra solo en el paso de Revisión.
export const CONSEJO_PROFESIONAL = 'Para estudiantes y recién egresados, una página suele ser suficiente para mostrar la formación académica, los proyectos, las habilidades y los logros más importantes. Un CV no destaca por tener más páginas, sino por presentar la información más relevante de forma clara y concisa. Si tienes más experiencia o contenido relevante, puedes pasar de una página, siempre que cada sección aporte valor. Antes que añadir información por llenar espacio, prioriza aquello que mejor represente tu perfil profesional.';
