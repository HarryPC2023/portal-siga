// intranotas/facultades-datos.js
// Datos de las 11 facultades de la UNI para el selector de siga-multifacultad.
//
// `color` es el color REAL extraído del círculo de cada ícono PNG (no
// inventado a mano) — así el borde de la tarjeta siempre hace juego con
// su propio ícono, sin desajustes.
//
// `carreras` con un solo elemento = facultad de carrera única (FIC):
// el selector las trata distinto, saltándose el paso del acordeón y yendo
// directo al siguiente paso al tocar la tarjeta.
//
// `corto` (en cada carrera) es el nombre que se muestra en el carnet SIGA.
// Regla: se quita "Ingeniería (de)" salvo cuando choca con otra carrera
// (Ing. Física vs Física, Ing. Química vs Química): ahí queda "Ing.".
//
// `degradado` (en cada facultad) es el fondo del carnet SIGA completo:
// [inicio, fin] a 135°. El color de texto (claro u oscuro) lo calcula el
// carnet según el brillo del degradado, no se guarda aquí.
//
// En perfiles_usuario la carrera se guarda por su `id` (ej. "sistemas")
// y la facultad por su `sigla`; el nombre se busca aquí al mostrarla.

export const FACULTADES = [
  {
    id: "faua",
    sigla: "FAUA",
    nombre: "Facultad de Arquitectura, Urbanismo y Artes",
    color: "#C9762E",
    degradado: ["#6B3413", "#D9893F"],
    icono: "assets/facultades/faua.png",
    carreras: [
      { id: "arquitectura", nombre: "Arquitectura", corto: "Arquitectura" },
      { id: "urbanismo-artes", nombre: "Urbanismo y Artes", corto: "Urbanismo y Artes" },
    ],
  },
  {
    id: "fc",
    sigla: "FC",
    nombre: "Facultad de Ciencias",
    color: "#460194",
    degradado: ["#2A0060", "#7B2FF2"],
    icono: "assets/facultades/fc.png",
    carreras: [
      { id: "ing-fisica", nombre: "Ingeniería Física", corto: "Ing. Física" },
      { id: "fisica", nombre: "Física", corto: "Física" },
      { id: "quimica", nombre: "Química", corto: "Química" },
      { id: "matematicas", nombre: "Matemáticas", corto: "Matemáticas" },
      { id: "ciencias-computacion", nombre: "Ciencias de la Computación", corto: "Cs. de la Computación" },
    ],
  },
  {
    id: "fia",
    sigla: "FIA",
    nombre: "Facultad de Ingeniería Ambiental",
    color: "#036E03",
    degradado: ["#013D01", "#2E9B3A"],
    icono: "assets/facultades/fia.png",
    carreras: [
      { id: "sanitaria", nombre: "Ingeniería Sanitaria", corto: "Sanitaria" },
      { id: "higiene-seguridad", nombre: "Higiene y Seguridad Industrial", corto: "Higiene y Seguridad" },
      { id: "ambiental", nombre: "Ingeniería Ambiental", corto: "Ambiental" },
    ],
  },
  {
    id: "fic",
    sigla: "FIC",
    nombre: "Facultad de Ingeniería Civil",
    color: "#FE3E01",
    degradado: ["#9E1F00", "#FE5A1F"],
    icono: "assets/facultades/fic.png",
    carreras: [{ id: "civil", nombre: "Ingeniería Civil", corto: "Civil" }],
  },
  {
    id: "fiee",
    sigla: "FIEE",
    nombre: "Facultad de Ingeniería Eléctrica y Electrónica",
    color: "#FEB000",
    degradado: ["#FFC933", "#FF8A00"],
    icono: "assets/facultades/fiee.png",
    carreras: [
      { id: "electrica", nombre: "Ingeniería Eléctrica", corto: "Eléctrica" },
      { id: "electronica", nombre: "Ingeniería Electrónica", corto: "Electrónica" },
      { id: "telecomunicaciones", nombre: "Ingeniería de Telecomunicaciones", corto: "Telecomunicaciones" },
    ],
  },
  {
    id: "fieecs",
    sigla: "FIEECS",
    nombre: "Facultad de Ingeniería Económica, Estadística y Ciencias Sociales",
    color: "#F80267",
    degradado: ["#6E0030", "#F80267"],
    icono: "assets/facultades/fieecs.png",
    carreras: [
      { id: "economica", nombre: "Ingeniería Económica", corto: "Económica" },
      { id: "estadistica", nombre: "Ingeniería Estadística", corto: "Estadística" },
    ],
  },
  {
    id: "figmm",
    sigla: "FIGMM",
    nombre: "Facultad de Ingeniería Geológica, Minera y Metalúrgica",
    color: "#782E02",
    degradado: ["#4A1C01", "#B8651E"],
    icono: "assets/facultades/figmm.png",
    carreras: [
      { id: "minas", nombre: "Ingeniería de Minas", corto: "Minas" },
      { id: "geologia", nombre: "Ingeniería Geológica", corto: "Geológica" },
      { id: "metalurgia", nombre: "Ingeniería Metalúrgica", corto: "Metalúrgica" },
    ],
  },
  {
    id: "fiis",
    sigla: "FIIS",
    nombre: "Facultad de Ingeniería Industrial y de Sistemas",
    color: "#09234A",
    degradado: ["#09234A", "#3C7CF8"],
    colorAcento: "#3C7CF8",
    icono: "assets/facultades/fiis.png",
    carreras: [
      { id: "industrial", nombre: "Ingeniería Industrial", corto: "Industrial" },
      { id: "sistemas", nombre: "Ingeniería de Sistemas", corto: "Sistemas" },
      { id: "ia", nombre: "Ingeniería de Inteligencia Artificial", corto: "Inteligencia Artificial" },
      { id: "software", nombre: "Ingeniería de Software", corto: "Software" },
    ],
  },
  {
    id: "fim",
    sigla: "FIM",
    nombre: "Facultad de Ingeniería Mecánica",
    color: "#01A9BA",
    degradado: ["#01505B", "#01A9BA"],
    icono: "assets/facultades/fim.png",
    carreras: [
      { id: "mecanica", nombre: "Ingeniería Mecánica", corto: "Mecánica" },
      { id: "mecanica-electrica", nombre: "Ingeniería Mecánica-Eléctrica", corto: "Mecánica-Eléctrica" },
      { id: "mecatronica", nombre: "Ingeniería Mecatrónica", corto: "Mecatrónica" },
      { id: "naval", nombre: "Ingeniería Naval", corto: "Naval" },
    ],
  },
  {
    id: "fip",
    sigla: "FIP",
    nombre: "Facultad de Ingeniería de Petróleo, Gas Natural y Petroquímica",
    color: "#FD5C03",
    degradado: ["#7A1E00", "#FD6A10"],
    icono: "assets/facultades/fip.png",
    carreras: [
      { id: "petroleo-gas", nombre: "Ingeniería de Petróleo y Gas Natural", corto: "Petróleo y Gas" },
      { id: "petroquimica", nombre: "Ingeniería Petroquímica", corto: "Petroquímica" },
    ],
  },
  {
    id: "fiqt",
    sigla: "FIQT",
    nombre: "Facultad de Ingeniería Química y Textil",
    color: "#017D80",
    degradado: ["#013F42", "#0FA89E"],
    icono: "assets/facultades/fiqt.png",
    carreras: [
      { id: "quimica-ing", nombre: "Ingeniería Química", corto: "Ing. Química" },
      { id: "textil", nombre: "Ingeniería Textil", corto: "Textil" },
    ],
  },
];