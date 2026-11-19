// js/desarrollo-contenido.js — Textos y guías de «Desarrollo profesional» (CV Profesional).
//
// Contenido estático: se edita aquí, sin tocar el constructor ni la base de datos.
// Para cambiar un consejo, un ejemplo o un mensaje de ayuda basta con editar este archivo.

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
        id: 'proyectos', titulo: 'Proyectos',
        porQue: 'Aquí muestras lo que sabes hacer, aunque nunca hayas trabajado.',
        consejo: 'Empieza describiendo tu participación con un verbo. El resultado no tiene que ser un número: un repositorio, una presentación, una demostración o un documento también sirven.',
    },
    {
        id: 'habilidades', titulo: 'Habilidades',
        porQue: 'Sepáralas en conocimientos, herramientas e idiomas.',
        consejo: 'Usa nivel básico, intermedio o avanzado. Evita porcentajes como «Python 85 %»: dan una falsa sensación de precisión.',
    },
    {
        id: 'logros', titulo: 'Logros',
        porQue: 'Lo que te distingue de otra persona con tus mismos cursos.',
        consejo: 'Un logro puede tener un número, un reconocimiento o un enlace como respaldo. No inventes cifras: una evidencia verificable pesa igual.',
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
export const MODALIDADES_PROYECTO = [{ id: 'solo', nombre: 'Solo' }, { id: 'equipo', nombre: 'En equipo' }];

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

export const EJEMPLOS_LOGRO = [
    'Brindé asesorías a 12 estudiantes durante un periodo académico',
    'Obtuve el primer puesto en un concurso universitario de programación',
    'Proyecto seleccionado para su presentación en una feria académica',
];

export const TIPOS_EXPERIENCIA = [
    'Voluntariados', 'Tutorías o asesorías', 'Organizaciones estudiantiles (IEEE, ACIA, LeadUNI…)', 'Delegado de aula o representación',
    'Organización de eventos', 'Freelance o actividades independientes', 'Apoyo en negocios familiares', 'Trabajos temporales',
];

export const HABILIDADES = {
    tecnica: { titulo: 'Técnicas', ejemplos: 'Programación, análisis de datos, modelado de bases de datos' },
    herramienta: { titulo: 'Herramientas', ejemplos: 'Excel, SQL, Python, Git, Power BI' },
    idioma: { titulo: 'Idiomas', ejemplos: 'Inglés, portugués' },
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
    logros: 'Lo que te distingue: resultados con respaldo',
    experiencia: 'También cuenta lo que no fue un empleo formal',
    revision: 'Último paso: revisa tu perfil y descárgalo',
};
// Se muestran SOLO cuando el semáforo de ese paso está en verde (así lo que dicen es cierto).
export const COMPLETADO = {
    datos: 'Datos básicos completados · Información suficiente para contactarte',
    formacion: 'Formación registrada · Tu CV ya muestra dónde estudias',
    proyectos: 'Proyectos completos · Tu CV ya muestra lo que sabes hacer',
    habilidades: 'Habilidades registradas · Tu CV ya muestra lo que sabes usar',
    logros: 'Logro registrado con su respaldo · Es lo que te distingue',
};

// Consejo sobre la extensión del CV: se muestra solo en el paso de Revisión.
export const CONSEJO_PROFESIONAL = 'Para estudiantes y recién egresados, una página suele ser suficiente para mostrar la formación académica, los proyectos, las habilidades y los logros más importantes. Un CV no destaca por tener más páginas, sino por presentar la información más relevante de forma clara y concisa. Si tienes más experiencia o contenido relevante, puedes pasar de una página, siempre que cada sección aporte valor. Antes que añadir información por llenar espacio, prioriza aquello que mejor represente tu perfil profesional.';
