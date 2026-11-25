// js/proyectos-datos.js — Contenido de «Proyectos Prácticos»: las 12 áreas, las intenciones, las fuentes de datos y las destacadas.
//
// LAS IDEAS YA NO VIVEN AQUÍ. Cada área tiene su archivo con las fichas completas: js/proyectos/areas/<id del área>.json.
// Para AGREGAR o CAMBIAR una idea:
//   1) Edita (o agrega un bloque en) el archivo de su área, por ejemplo js/proyectos/areas/tecnologia.json.
//   2) Desde la carpeta del proyecto ejecuta:  python tools/generar_indice.py
//      (genera js/proyectos/indice.json, la versión liviana que usan las tarjetas, los filtros y la búsqueda; avisa si algo está mal).
//   3) Sube los cambios con git. No hay que tocar proyectos-practicos.js ni el HTML.
// Campos de una idea: id (único, minúsculas y guiones; NO lo cambies si la idea ya pudo guardarse), area (id de AREAS = donde vive el problema),
// areas2 (hasta 2 áreas con las que se cruza), titulo, resumen, tipo, tiempo (texto que ve la persona), horas (número, oculto: ordena y alimenta el cuestionario),
// etiquetas, intencion, datos (ficticios | publicos | propios) y datosTexto (el texto largo), prog (sin | opcional | incluida) con progTexto y abordar,
// carreras («Puede interesar a»: ejemplos que ayudan a encontrar la idea; NO restringen quién puede hacerla),
// problema y desarrollar (listas de párrafos; un párrafo puede ser { lista: [...] }), ampliaciones (máx. 3: { titulo, aporta }),
// objetivos, habilidades, herramientas, lineamientos y otroSector.
// El alcance inicial (`desarrollar`) debe bastarse solo y poder hacerse sin permiso de terceros; las ampliaciones nunca lo corrigen.

export const AREAS = [
    { id: 'tecnologia', corto: 'Sistemas digitales', nombre: 'Sistemas digitales y automatización', frase: 'Crear sistemas digitales, desarrollar software, automatizar procesos y trabajar con datos.', c: '#2455C4', f: '#E4EEFF', n: '#2F6BFF' },
    { id: 'salud', corto: 'Salud', nombre: 'Salud y bienestar', frase: 'Comprender los desafíos de la salud y el bienestar: atención, prevención y calidad de vida.', c: '#C21F5B', f: '#FFE3EC', n: '#FF2E7E' },
    { id: 'ambiente', corto: 'Ambiente', nombre: 'Medio ambiente y sostenibilidad', frase: 'Proteger el ambiente y promover el uso responsable de los recursos.', c: '#0B7A5A', f: '#DDF5E9', n: '#00A86B' },
    { id: 'negocios', corto: 'Negocios', nombre: 'Negocios y economía', frase: 'Analizar mercados, gestionar recursos y desarrollar iniciativas económicas.', c: '#8A5200', f: '#FFF1CC', n: '#D97800' },
    { id: 'ciudades', corto: 'Ciudades', nombre: 'Ciudades e infraestructura', frase: 'Mejorar los espacios urbanos, la movilidad y los servicios públicos.', c: '#006C9C', f: '#DDF3FC', n: '#0096D6' },
    { id: 'educacion', corto: 'Educación', nombre: 'Educación y aprendizaje', frase: 'Descubrir cómo aprendemos y crear mejores experiencias educativas.', c: '#5B00B8', f: '#EEE6FD', n: '#7A1CFF' },
    { id: 'sociedad', corto: 'Sociedad', nombre: 'Sociedad y desarrollo', frase: 'Reconocer los problemas sociales y proponer soluciones para la vida en comunidad.', c: '#B34700', f: '#FFE9D6', n: '#FF6A00' },
    { id: 'derecho', corto: 'Derecho', nombre: 'Derecho, gobierno y ciudadanía', frase: 'Conocer las normas, las instituciones y los desafíos de la vida ciudadana.', c: '#A01C42', f: '#FBE1E8', n: '#E8174B' },
    { id: 'ciencias', corto: 'Ciencias', nombre: 'Ciencias básicas', frase: 'Explorar los fenómenos naturales mediante la matemática y las ciencias.', c: '#007A70', f: '#D9F5F1', n: '#00A99D' },
    { id: 'arte', corto: 'Arte', nombre: 'Arte, diseño y comunicación', frase: 'Expresar ideas, comunicar mensajes y crear experiencias visuales y audiovisuales.', c: '#9B1FB0', f: '#FAE3FD', n: '#C81EE6' },
    { id: 'agricultura', corto: 'Agricultura', nombre: 'Agricultura y alimentación', frase: 'Mejorar la producción agrícola, reducir el desperdicio de alimentos y fortalecer el abastecimiento.', c: '#3F6B0A', f: '#EBF8D3', n: '#4FA800' },
    { id: 'industria', corto: 'Industria', nombre: 'Industria y producción', frase: 'Optimizar la producción, mejorar la calidad y gestionar operaciones.', c: '#3D4B66', f: '#E4E9F2', n: '#5B6B8A' },
];

// Las cuatro «puertas» para descubrir según lo que la persona quiere hacer. Una idea puede estar en varias.
export const INTENCIONES = [
    { id: 'crear', nombre: 'Crear algo nuevo', c: '#2F63D6', n: '#2F6BFF' },
    { id: 'resolver', nombre: 'Resolver un problema', c: '#C21F5B', n: '#FF2E7E' },
    { id: 'investigar', nombre: 'Investigar un tema', c: '#0B7A5A', n: '#00A86B' },
    { id: 'otro-sector', nombre: 'Aplicar lo que sé en otra área', c: '#9A5B00', n: '#D97800' },
];

// De dónde salen los datos de una idea. Sirve para que nadie dependa de un permiso ajeno para empezar.
export const FUENTES = {
    ficticios: { corto: 'ficticios', largo: 'ficticios: puedes hacerlo sin pedir permiso a nadie' },
    publicos: { corto: 'públicos', largo: 'públicos: salen de fuentes abiertas' },
    propios: { corto: 'mediciones propias', largo: 'mediciones propias: las que tú mismo tomes u observes' },
};

// Ideas que pueden salir en «Destacadas». Las elige una persona (calidad y diversidad, no popularidad); cada semana se muestran 4 seguidas
// del orden de esta lista, empezando en un punto distinto. Para cambiar la selección, edita esta lista (usa `id` de IDEAS).
export const DESTACADAS = ['derechos-consumidor', 'dureza-agua', 'senaletica-espacio', 'citas-consultorio', 'calendario-huerto', 'papel-facultad', 'servicios-gratuitos', 'tiempos-proceso'];
