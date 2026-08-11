// js/asesorias-datos.js
//
// Una fila por cada asesoría disponible. Para agregar una nueva, solo
// se agrega un objeto más a este array — no hay que tocar el HTML.
//
// tipo: 'pdf' | 'web'
// ciclo: número (1-10). Si una asesoría aplica a varios ciclos o no
//        tiene uno fijo, usar null — no aparecerá en el filtro de ciclo
//        pero sí en "Todos los ciclos".
//
// ⚠️ Los "ciclo" de abajo son un ESTIMADO mío, revísalos y corrígelos
// según tu malla real antes de subir esto.
export const ASESORIAS = [
    {
        id: 'pc1-dbd',
        tipo: 'web',
        titulo: 'PC1 — Diseño de Base de Datos',
        curso: 'Diseño de Base de Datos',
        ciclo: 5,
        descripcion: 'Herramientas, arquitectura, componentes y checklist antes de exponer.',
        src: 'https://harrypc2023.github.io/asesoria-dbd/',
    },
    {
        id: 'mono-dbd',
        tipo: 'pdf',
        titulo: 'Monografía — Diseño de Base de Datos',
        curso: 'Diseño de Base de Datos',
        ciclo: 5,
        descripcion: 'Prototipado de interfaces: coherencia, detalle y datos reales por pantalla.',
        src: 'assets/asesorias/monografia-dbd-avanzado.pdf',
    },
    {
        id: 'mono-mcd',
        tipo: 'pdf',
        titulo: 'Monografía — Modelado Conceptual de Datos',
        curso: 'Modelado Conceptual de Datos',
        ciclo: 3,
        descripcion: 'Fundamentos para encarar el trabajo grupal y qué espera el profesor.',
        src: 'assets/asesorias/monografia-mcd.pdf',
    },
];