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
        porQue: 'Lo que te distingue de otra persona con tus mismos cursos.',
        consejo: 'Describe qué hiciste y qué resultado tuvo. No inventes cifras: un hecho real y verificable pesa más que un número dudoso.',
    },
    {
        id: 'experiencia', titulo: 'Experiencia',
        porQue: 'No se limita a empleos formales. También cuenta cualquier experiencia donde hayas asumido responsabilidades, colaborado con otras personas o aportado valor.',
        consejo: 'También cuentan voluntariados, trabajos independientes, participación en organizaciones, apoyo en negocios familiares o trabajos temporales. No todo tiene que ser un contrato formal.',
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
        nombre: 'Plataforma web para estudiantes de mi facultad',
        desc: 'Describe qué es tu proyecto, qué hiciste tú y con qué lo construiste.',
        objeto: 'una plataforma web para estudiantes de mi facultad', meta: 'reunir en un solo lugar herramientas académicas',
        hizo: 'programar el simulador de notas y diseñar la base de datos', resultado: 'la usan compañeros de varios ciclos',
        herr: { sw: ['Python', 'JavaScript', 'SQL', 'Git'], eq: ['Arduino', 'Raspberry Pi'], me: ['Scrum', 'Pruebas con usuarios'] },
    },
    arq: {
        nombre: 'Propuesta de centro cultural',
        desc: 'Describe qué diseñaste o realizaste, tu aporte y los recursos que usaste.',
        objeto: 'la propuesta de un centro cultural', meta: 'dar un espacio público a un barrio sin equipamiento',
        hizo: 'elaborar los planos, cortes y la maqueta final', resultado: 'la propuesta fue presentada ante el jurado del curso',
        herr: { sw: ['AutoCAD', 'Revit', 'SketchUp'], eq: ['Maqueta en cartón pluma', 'Cortadora láser'], me: ['Análisis de sitio', 'Diseño participativo'] },
    },
    civ: {
        nombre: 'Análisis estructural de un puente peatonal',
        desc: 'Describe qué analizaste o construiste, tu aporte y los recursos que usaste.',
        objeto: 'el análisis estructural de un puente peatonal', meta: 'verificar que soporte las cargas de uso',
        hizo: 'calcular las cargas y modelar la estructura', resultado: 'un informe con las verificaciones de resistencia',
        herr: { sw: ['SAP2000', 'AutoCAD', 'Excel'], eq: ['Estación total', 'Nivel óptico'], me: ['Método de rigidez', 'Ensayos de laboratorio'] },
    },
    gen: {
        nombre: 'Nombre de tu proyecto',
        desc: 'Describe qué hiciste, cuál fue tu aporte y qué recursos usaste.',
        objeto: 'un estudio sobre un tema que me interesaba', meta: 'entender mejor un problema',
        hizo: 'recopilar datos y organizar los resultados', resultado: 'un informe presentado a mi grupo',
        herr: { sw: ['Excel', 'Word', 'PowerPoint'], eq: ['Instrumentos de medición'], me: ['Encuestas', 'Revisión bibliográfica'] },
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

// ───────────── Logros y reconocimientos (paso propio) ─────────────
export const LOGROS = {
    intro: 'Lo que te distingue de otra persona con tus mismos cursos. Si todavía no sabes qué poner, empieza por las ayudas de abajo.',
    vacio: 'Todavía no agregaste ningún logro. Si algo de las ayudas de arriba te suena, empieza por ahí.',
    placeholder: 'Ejemplo: Brindé asesorías a estudiantes de ciclos anteriores',
    categorias: {
        resumen: '¿Qué puede ser un logro?',
        items: [
            ['Académico', 'una beca, un reconocimiento por tu rendimiento o la participación en un programa selectivo.'],
            ['Competencias y concursos', 'hackatones, olimpiadas, concursos de tu facultad.'],
            ['Liderazgo', 'haber coordinado un equipo, un evento o un centro estudiantil.'],
            ['Impacto', 'algo que hiciste y tuvo un resultado que se pueda contar.'],
            ['Apoyo a otros', 'asesorías, tutorías, voluntariado.'],
        ],
        cierre: 'Un proyecto cuenta lo que hiciste. Un logro cuenta lo que conseguiste o por lo que te reconocieron. Si es lo primero, va en Proyectos.',
    },
    preguntas: {
        resumen: 'Preguntas para recordar',
        items: [
            '¿Alguna vez te eligieron, te premiaron o te felicitaron por algo?',
            '¿Ayudaste a otros a aprobar o a entender un curso?',
            '¿Algo que hiciste ahorró tiempo, resolvió un problema o lo usaron otras personas?',
            '¿Te tocó liderar o coordinar a otros?',
        ],
    },
    describir: {
        resumen: '¿Cómo lo describo?',
        texto: 'Di qué hiciste y qué resultado tuvo, sin inventar cifras.',
        antes: 'Fui buen asesor.',
        mejor: 'Brindé asesorías de bases de datos a estudiantes de ciclos anteriores.',
        cierre: 'Si no tienes un número exacto, describe el hecho. Un dato inventado le quita credibilidad a todo el CV.',
    },
    respaldo: {
        etiqueta: 'Con qué lo respaldas',
        pista: 'Puedes añadir un dato o referencia para dar más contexto y credibilidad a tu logro.',
        placeholder: 'Un enlace, un dato o una referencia',
        ayudaResumen: '¿Qué puede servir como respaldo?',
        ayuda: 'Un enlace público, el nombre de quien puede confirmarlo, una cifra real o una constancia que tú conservas. SIGA no guarda documentos.',
        privacidad: 'Si pones un enlace, que sea http o https y que no muestre tu DNI, dirección o teléfono.',
    },
};

export const EJEMPLOS_LOGRO = [
    'Brindé asesorías a 12 estudiantes durante un periodo académico',
    'Obtuve el primer puesto en un concurso universitario de programación',
    'Proyecto seleccionado para su presentación en una feria académica',
];

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
