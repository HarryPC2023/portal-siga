// siglas-cursos.js — Siglas que los estudiantes realmente usan para nombrar
// un curso. La franja del Termómetro muestra el nombre completo y, si el
// curso está aquí, su sigla como complemento. Si un curso no está, simplemente
// no lleva sigla (no se inventan).
//
// Para agregar una: código del curso (como sale en la tarjeta) y su sigla.
const SIGLAS = {
    SI405: 'MCD',   // Modelado Conceptual de Datos
    SI505: 'DBD',   // Diseño de Base de Datos
    SI302: 'POO',   // Programación Orientada a Objetos
};

export function siglaDeCurso(codigo) {
    return SIGLAS[String(codigo || '').toUpperCase()] || '';
}
