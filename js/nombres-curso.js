// js/nombres-curso.js — Nombres de curso legibles.
//
// INTRALU manda los nombres de curso en MAYÚSCULAS, sin tildes y a veces con un guion al final
// («FISICA II-», «ANALITICA DE DATOS-»). Aquí se les devuelve el formato de frase, las tildes y los
// números romanos: «Física II», «Analítica de datos».
//
// Cómo funciona: no hay una lista de cursos, sino una lista de PALABRAS que llevan tilde
// (aprendidas de los planes de estudios de Sistemas, Industrial y Software, más las más comunes de la
// universidad). Si una palabra no está en la lista, se deja tal cual (nunca inventa una tilde).
// Para agregar una palabra nueva basta con sumar una línea en TILDES: sin_tilde: 'con_tilde'.
export const TILDES = {
    acustica: 'acústica', administracion: 'administración', algebra: 'álgebra', analisis: 'análisis',
    analitica: 'analítica', antropologia: 'antropología', aplicacion: 'aplicación', auditoria: 'auditoría',
    automatica: 'automática', automatico: 'automático', automatizacion: 'automatización', biologia: 'biología',
    biologicos: 'biológicos', biometricas: 'biométricas', calculo: 'cálculo', calorimetria: 'calorimetría',
    ciberfisicos: 'ciberfísicos', cinematica: 'cinemática', computacion: 'computación', comunicacion: 'comunicación',
    configuracion: 'configuración', constitucion: 'constitución', construccion: 'construcción', consultoria: 'consultoría',
    critica: 'crítica', demografia: 'demografía', diagnostico: 'diagnóstico', didactica: 'didáctica',
    dinamica: 'dinámica', direccion: 'dirección', diseno: 'diseño', disposicion: 'disposición',
    ecologia: 'ecología', ecologicos: 'ecológicos', economia: 'economía', economica: 'económica',
    economico: 'económico', educacion: 'educación', electrica: 'eléctrica', electricas: 'eléctricas',
    electrico: 'eléctrico', electronica: 'electrónica', electronico: 'electrónico', electronicos: 'electrónicos',
    energia: 'energía', ensenanza: 'enseñanza', epistemologia: 'epistemología', ergonomia: 'ergonomía',
    espanol: 'español', estadistica: 'estadística', estadistico: 'estadístico', estadisticos: 'estadísticos',
    estandares: 'estándares', estatica: 'estática', estetica: 'estética', estrategica: 'estratégica',
    etica: 'ética', evaluacion: 'evaluación', filosofia: 'filosofía', fisica: 'física',
    fisicas: 'físicas', fisico: 'físico', fisicoquimica: 'fisicoquímica', fisicos: 'físicos',
    formacion: 'formación', frances: 'francés', genetica: 'genética', geografia: 'geografía',
    geologia: 'geología', geometria: 'geometría', gestion: 'gestión', grafica: 'gráfica',
    grafico: 'gráfico', graficos: 'gráficos', hidraulica: 'hidráulica', hidrologia: 'hidrología',
    hipotesis: 'hipótesis', iconografico: 'iconográfico', informacion: 'información', informatica: 'informática',
    ingenieria: 'ingeniería', ingles: 'inglés', innovacion: 'innovación', inorganica: 'inorgánica',
    instrumentacion: 'instrumentación', integracion: 'integración', interaccion: 'interacción', interpretacion: 'interpretación',
    introduccion: 'introducción', investigacion: 'investigación', juridica: 'jurídica', legislacion: 'legislación',
    linguistica: 'lingüística', lingüistica: 'lingüística', logistica: 'logística', macroeconomia: 'macroeconomía',
    maquina: 'máquina', maquinas: 'máquinas', matematica: 'matemática', matematicas: 'matemáticas',
    mecanica: 'mecánica', metodo: 'método', metodologia: 'metodología', metodologias: 'metodologías',
    metodos: 'métodos', metrica: 'métrica', microeconomia: 'microeconomía', minimo: 'mínimo',
    moviles: 'móviles', nanotecnologia: 'nanotecnología', negociacion: 'negociación', numerica: 'numérica',
    numerico: 'numérico', numericos: 'numéricos', operacion: 'operación', optica: 'óptica',
    optimizacion: 'optimización', organica: 'orgánica', organizacion: 'organización', parametrico: 'paramétrico',
    pedagogia: 'pedagogía', politica: 'política', practica: 'práctica', practicas: 'prácticas',
    presentacion: 'presentación', produccion: 'producción', programacion: 'programación', psicologia: 'psicología',
    psicologica: 'psicológica', publica: 'pública', publico: 'público', quimica: 'química',
    quimico: 'químico', quimicos: 'químicos', redaccion: 'redacción', robotica: 'robótica',
    roboticas: 'robóticas', semiotica: 'semiótica', simulacion: 'simulación', sintesis: 'síntesis',
    sistemica: 'sistémica', sistemico: 'sistémico', sistemicos: 'sistémicos', sociologia: 'sociología',
    tecnica: 'técnica', tecnicas: 'técnicas', tecnico: 'técnico', tecnologia: 'tecnología',
    tecnologias: 'tecnologías', tecnologica: 'tecnológica', teoria: 'teoría', termodinamica: 'termodinámica',
    topografia: 'topografía', transformacion: 'transformación', validacion: 'validación', verificacion: 'verificación',
};

const ROMANOS = new Set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii']);

/** «analitica» → «analítica»; si no la conoce, devuelve la misma palabra. */
export function restaurarTilde(palabra) {
    return TILDES[palabra] || palabra;
}

/** Nombre de INTRALU → «Frase con tildes y números romanos». */
export function nombreCursoLegible(texto) {
    // Se quita el guion, punto o coma que INTRALU deja al final.
    const t = String(texto || '').trim().toLowerCase().replace(/[\s\-\u2013\u2014_.:;,]+$/, '');
    if (!t) return '';
    const frase = t.replace(/[a-zñáéíóúü]+/g, (w) => (ROMANOS.has(w) ? w.toUpperCase() : restaurarTilde(w)));
    // Mayúscula en la primera LETRA (por si el nombre empieza con un paréntesis).
    return frase.replace(/[a-zñáéíóúü]/, (c) => c.toUpperCase());
}
