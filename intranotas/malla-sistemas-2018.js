/* ============================================================
   MALLA CURRICULAR — Ingeniería de Sistemas, plan 2018
   Fuente: "Plan de Estudios Ingeniería de Sistemas - 2018" (FIIS UNI),
   transcrita curso por curso de las 4 páginas del PDF oficial.

   Cada curso: { code, name, credits, prereq }
   - credits: HST + HSP/L÷2 (fórmula real de créditos UNI, verificada
     contra créditos ya conocidos del simulador — coincide exacto).
   - prereq: array de requisitos. Cada uno es:
       { tipo: 'curso', code: 'XXXX' }       — debe estar APROBADO
       { tipo: 'creditos', valor: N }         — mínimo N créditos acumulados
     Cuando el PDF lista dos códigos con "/", según confirmó Harry
     son AMBOS obligatorios (no "cualquiera de los dos") — se
     representan como dos entradas separadas en el array.

   Por ahora solo cubre los cursos OBLIGATORIOS de los 10 ciclos
   (192 créditos) — los electivos (15 créditos) y complementarios
   (5 créditos) quedan para una siguiente vuelta, ya que su
   ubicación no es fija por ciclo y tienen varias inconsistencias
   de código en el PDF que hay que revisar con calma.

   ⚠️ Dos códigos de prerrequisito del PDF (ciclo X) no aparecen
   definidos en ningún otro ciclo de este documento — probablemente
   typos del PDF original: SI085 pide "GE807" y SI095 pide "SI905",
   ninguno de los dos existe en la malla de obligatorios. Se dejan
   comentados con el código tal cual venía, y el motor de
   prerrequisitos simplemente los ignora (no rompe, no bloquea) —
   pendiente de que Harry confirme cuáles eran los códigos reales.
   ============================================================ */

const MALLA_SISTEMAS_2018 = [
    {
        ciclo: 1, cursos: [
            { code: 'FB101', name: 'Geometría Analítica', credits: 3, prereq: [] },
            { code: 'BMA01', name: 'Cálculo Diferencial', credits: 5, prereq: [] },
            { code: 'BQU01', name: 'Química I', credits: 5, prereq: [] },
            { code: 'BIC01', name: 'Introducción a la Computación', credits: 2, prereq: [] },
            { code: 'BRC01', name: 'Redacción y Comunicación', credits: 2, prereq: [] },
            { code: 'SI101', name: 'Introducción al Pensamiento y a la Ing. de Sistemas', credits: 3, prereq: [] },
        ]
    },
    {
        ciclo: 2, cursos: [
            { code: 'BMA03', name: 'Álgebra Lineal', credits: 4, prereq: [{ tipo: 'curso', code: 'FB101' }] },
            { code: 'BMA02', name: 'Cálculo Integral', credits: 5, prereq: [{ tipo: 'curso', code: 'BMA01' }] },
            { code: 'BEF01', name: 'Ética y Filosofía Política', credits: 2, prereq: [] },
            { code: 'SI201', name: 'Psicología Sistémica', credits: 3, prereq: [{ tipo: 'curso', code: 'SI101' }] },
            { code: 'SI203', name: 'Teoría y Ciencia de Sistemas', credits: 3, prereq: [{ tipo: 'curso', code: 'SI101' }] },
            { code: 'SI207', name: 'Sistemas Biológicos y Ecológicos', credits: 2, prereq: [{ tipo: 'curso', code: 'BMA01' }] },
            { code: 'SI205', name: 'Algoritmia y Estructura de Datos', credits: 3, prereq: [{ tipo: 'curso', code: 'BIC01' }] },
        ]
    },
    {
        ciclo: 3, cursos: [
            { code: 'FB301', name: 'Matemática Discreta', credits: 3, prereq: [{ tipo: 'curso', code: 'BMA03' }] },
            { code: 'FB303', name: 'Cálculo Multivariable', credits: 5, prereq: [{ tipo: 'curso', code: 'BMA02' }] },
            { code: 'BFI01', name: 'Física I', credits: 5, prereq: [] },
            { code: 'HU301', name: 'Metodología de la Investigación', credits: 2, prereq: [{ tipo: 'curso', code: 'BRC01' }, { tipo: 'curso', code: 'SI203' }] },
            { code: 'FB305', name: 'Estadística y Probabilidades', credits: 3, prereq: [{ tipo: 'curso', code: 'BMA02' }] },
            { code: 'SI301', name: 'Teoría y Ciencia de Sistemas Aplicados', credits: 2, prereq: [{ tipo: 'curso', code: 'SI201' }] },
            { code: 'SI302', name: 'Programación Orientada a Objetos', credits: 3, prereq: [{ tipo: 'curso', code: 'SI205' }] },
        ]
    },
    {
        ciclo: 4, cursos: [
            { code: 'FB402', name: 'Cálculo Numérico', credits: 3, prereq: [{ tipo: 'curso', code: 'FB301' }] },
            { code: 'FB403', name: 'Ecuaciones Diferenciales', credits: 5, prereq: [{ tipo: 'curso', code: 'FB303' }] },
            { code: 'FB401', name: 'Física II', credits: 5, prereq: [{ tipo: 'curso', code: 'BFI01' }] },
            { code: 'FB405', name: 'Estadística Aplicada', credits: 3, prereq: [{ tipo: 'curso', code: 'FB305' }] },
            { code: 'HU102', name: 'Desarrollo Personal', credits: 2, prereq: [{ tipo: 'curso', code: 'BEF01' }] },
            { code: 'SI403', name: 'Metodología de los Sistemas Blandos', credits: 3, prereq: [{ tipo: 'curso', code: 'SI301' }, { tipo: 'curso', code: 'HU301' }] },
            { code: 'SI405', name: 'Modelado Conceptual de Datos', credits: 3, prereq: [{ tipo: 'curso', code: 'SI302' }] },
        ]
    },
    {
        ciclo: 5, cursos: [
            { code: 'FB501', name: 'Matemática Aplicada', credits: 3, prereq: [{ tipo: 'curso', code: 'FB402' }] },
            { code: 'SI505', name: 'Diseño de Base de Datos', credits: 3, prereq: [{ tipo: 'curso', code: 'SI405' }] },
            { code: 'BRN01', name: 'Realidad Nacional, Constitución y DD.HH.', credits: 3, prereq: [] },
            { code: 'SI501', name: 'Investigación de Operaciones I', credits: 3, prereq: [{ tipo: 'curso', code: 'FB405' }] },
            { code: 'BEG01', name: 'Economía General', credits: 3, prereq: [] },
            { code: 'GE501', name: 'Teoría Organizacional', credits: 3, prereq: [{ tipo: 'curso', code: 'FB405' }] },
            { code: 'SI503', name: 'Ingeniería de Procesos', credits: 3, prereq: [{ tipo: 'curso', code: 'SI301' }] },
        ]
    },
    {
        ciclo: 6, cursos: [
            { code: 'GE605', name: 'Sistema y Gestión Financiera', credits: 3, prereq: [{ tipo: 'curso', code: 'BEG01' }] },
            { code: 'SI603', name: 'Modelado de Procesos de Ciclo de Vida de Sistemas', credits: 3, prereq: [{ tipo: 'curso', code: 'SI503' }] },
            { code: 'SI601', name: 'Investigación de Operaciones II', credits: 3, prereq: [{ tipo: 'curso', code: 'SI501' }] },
            { code: 'SI602', name: 'Dinámica de Sistemas', credits: 3, prereq: [{ tipo: 'curso', code: 'FB403' }] },
            { code: 'SI604', name: 'Análisis y Diseño de Sistemas', credits: 4, prereq: [{ tipo: 'curso', code: 'SI403' }, { tipo: 'curso', code: 'FB501' }] },
            { code: 'SI605', name: 'Arquitectura Empresarial', credits: 3, prereq: [{ tipo: 'curso', code: 'SI503' }, { tipo: 'curso', code: 'GE501' }] },
            { code: 'SI607', name: 'Arquitectura Computacional y Redes', credits: 3, prereq: [{ tipo: 'curso', code: 'SI505' }] },
        ]
    },
    {
        ciclo: 7, cursos: [
            { code: 'GE709', name: 'Sistemas de Calidad', credits: 3, prereq: [{ tipo: 'curso', code: 'SI603' }] },
            { code: 'GE703', name: 'Sistemas Integrados Empresariales', credits: 3, prereq: [{ tipo: 'curso', code: 'GE605' }] },
            { code: 'SI701', name: 'Modelado Sistémico y Simulación', credits: 3, prereq: [{ tipo: 'curso', code: 'SI601' }] },
            { code: 'SI702', name: 'Taller de Dinámica de Sistemas', credits: 2, prereq: [{ tipo: 'curso', code: 'SI602' }] },
            { code: 'SI704', name: 'Gestión de la Ingeniería de Sistemas', credits: 3, prereq: [{ tipo: 'curso', code: 'GE501' }, { tipo: 'curso', code: 'SI503' }] },
            { code: 'SI705', name: 'Estándares de la Ing. de Sistemas', credits: 2, prereq: [{ tipo: 'curso', code: 'SI604' }] },
            { code: 'SI707', name: 'Ingeniería de Software', credits: 3, prereq: [{ tipo: 'curso', code: 'SI607' }] },
        ]
    },
    {
        ciclo: 8, cursos: [
            { code: 'SI801', name: 'Modelo del Sistema Viable', credits: 3, prereq: [{ tipo: 'curso', code: 'GE709' }, { tipo: 'curso', code: 'GE501' }] },
            { code: 'GE801', name: 'Planeamiento y Gestión Estratégica', credits: 3, prereq: [{ tipo: 'curso', code: 'GE709' }] },
            { code: 'GE803', name: 'Sistemas Analíticos', credits: 2, prereq: [{ tipo: 'curso', code: 'GE703' }] },
            { code: 'SI805', name: 'Integración de Sistemas', credits: 2, prereq: [{ tipo: 'curso', code: 'SI705' }, { tipo: 'curso', code: 'SI704' }] },
            { code: 'SI807', name: 'Sistemas de Inteligencia de Negocio', credits: 3, prereq: [{ tipo: 'curso', code: 'SI702' }, { tipo: 'curso', code: 'SI701' }] },
            { code: 'SI806', name: 'Desarrollo Adaptativo e Integrado del SW', credits: 2, prereq: [{ tipo: 'curso', code: 'SI707' }] },
        ]
    },
    {
        ciclo: 9, cursos: [
            { code: 'SI901', name: 'Proyecto de Tesis en Ing. Sistemas I', credits: 2, prereq: [{ tipo: 'curso', code: 'SI807' }, { tipo: 'creditos', valor: 160 }] },
            { code: 'SI902', name: 'Ingeniería de Sistemas de Servicio', credits: 3, prereq: [{ tipo: 'curso', code: 'GE801' }] },
            { code: 'SI903', name: 'Implementación de Sistemas', credits: 2, prereq: [{ tipo: 'curso', code: 'GE803' }, { tipo: 'curso', code: 'SI805' }] },
            { code: 'SI904', name: 'Seguridad de Sistemas', credits: 3, prereq: [{ tipo: 'curso', code: 'SI805' }] },
            { code: 'GE902', name: 'Diseño y Evaluación de Proyectos', credits: 3, prereq: [{ tipo: 'curso', code: 'GE801' }] },
        ]
    },
    {
        ciclo: 10, cursos: [
            { code: 'SI035', name: 'Proyecto de Tesis en Ing. Sistemas II', credits: 2, prereq: [{ tipo: 'curso', code: 'SI901' }] },
            { code: 'SI055', name: 'Gestión de Proyectos', credits: 2, prereq: [{ tipo: 'curso', code: 'GE902' }] },
            { code: 'SI075', name: 'Auditoría de Sistemas', credits: 3, prereq: [{ tipo: 'curso', code: 'SI904' }] },
            // ⚠️ PDF dice "GE807 / SI903" — GE807 no existe en ningún otro ciclo de obligatorios (posible typo). Se deja solo SI903.
            { code: 'SI085', name: 'Aplicación de Negocios Electrónicos', credits: 3, prereq: [{ tipo: 'curso', code: 'SI903' }] },
            // ⚠️ PDF dice "SI902 / SI905" — SI905 no existe en ningún otro ciclo de obligatorios (posible typo). Se deja solo SI902.
            { code: 'SI095', name: 'Ingeniería Empresarial', credits: 3, prereq: [{ tipo: 'curso', code: 'SI902' }] },
        ]
    },
];

if (typeof window !== 'undefined') window.MALLA_SISTEMAS_2018 = MALLA_SISTEMAS_2018;