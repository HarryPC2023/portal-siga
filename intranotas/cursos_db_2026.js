/* ============================================================
   BASE DE DATOS DE CURSOS — MALLA 2026 (por carrera y ciclo)

   Este archivo tiene la MISMA forma que cursos_db_2018.js, pero para la
   malla 2026. Se carga DESPUÉS de cursos_db_2018.js (necesita
   buscarCurso, CURSOS_SISTEMAS, CURSOS_SOFTWARE, etc. ya
   definidos) y ANTES de intranotas.js.

   Orden de <script> en la página de Intranotas:
     1. cursos_db_2018.js       (malla 2018 — no se toca)
     2. cursos_db_2026.js  (este archivo)
     3. intranotas.js

   No lleva sufijo de carrera en el nombre (cursos_db_2026, no
   cursos_db_2026_sistemas) a propósito: sigue el mismo patrón que
   cursos_db_2018.js, que agrupa las 4 carreras de malla 2018 en un solo
   archivo. Cuando Industrial, Software o IA publiquen su malla
   2026 oficial, se agregan como bloques nuevos acá mismo — no hay
   que crear archivos adicionales ni reestructurar nada.

   Cómo se arma cada carrera acá:
   - Curso que ya existe en 2018 con el MISMO código y sigue siendo
     el mismo curso (solo cambió de ciclo, o ni eso): se reutiliza
     con buscarCurso(), igual que ya haces en CURSOS_IA. Si corriges
     la fórmula del curso en 2018, se refleja acá automáticamente.
   - Curso nuevo en esta malla pero cuyo código YA existe en otra
     carrera de 2018 con metodología confirmada (pasó con TE205,
     que ya estaba en Software): también se reutiliza con
     buscarCurso(), apuntando a esa otra carrera.
   - Curso genuinamente nuevo, sin código equivalente en ningún
     lado: formula_type: 'PENDIENTE', components: [],
     disponible: false — aparece en la lista pero no se puede
     marcar hasta confirmar cómo se evalúa. (Recordatorio: falta
     que intranotas.js respete ese flag — pendiente, no se toca
     todavía.)
   ============================================================ */

const CURSOS_SISTEMAS_2026 = {
    1: [
        buscarCurso(CURSOS_SISTEMAS, 'FB101'), // Geometría analítica
        buscarCurso(CURSOS_SISTEMAS, 'BMA01'), // Cálculo diferencial
        buscarCurso(CURSOS_SISTEMAS, 'BQU01'), // Química I
        buscarCurso(CURSOS_SISTEMAS, 'BIC01'), // Introducción a la computación
        buscarCurso(CURSOS_SISTEMAS, 'BRC01'), // Redacción y comunicación
        buscarCurso(CURSOS_SISTEMAS, 'SI101'), // Introducción a la Ingeniería de Sistemas
        buscarCurso(CURSOS_SOFTWARE, 'TE-205'), // Dibujo y geometría descriptiva (ya existía en Software 2018)
    ],
    2: [
        buscarCurso(CURSOS_SISTEMAS, 'BMA03'), // Álgebra lineal
        buscarCurso(CURSOS_SISTEMAS, 'BMA02'), // Cálculo integral
        buscarCurso(CURSOS_SISTEMAS, 'SI205'), // Algoritmia y estructura de datos
        buscarCurso(CURSOS_SISTEMAS, 'BRN01'), // Realidad nacional... (se mueve de 5° a 2°)
        buscarCurso(CURSOS_SISTEMAS, 'BFI01'), // Física I (se mueve de 3° a 2°)
        { id: 'sis26_arcso', code: 'SI222', name: 'Arquitectura de computador y sistemas operativos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
    ],
    3: [
        buscarCurso(CURSOS_SISTEMAS, 'FB301'), // Matemática discreta
        buscarCurso(CURSOS_SISTEMAS, 'FB303'), // Cálculo multivariable
        buscarCurso(CURSOS_SISTEMAS, 'FB305'), // Estadística y probabilidades
        buscarCurso(CURSOS_SISTEMAS, 'SI302'), // Programación orientada a objetos
        buscarCurso(CURSOS_SISTEMAS, 'FB401'), // Física II (se mueve de 4° a 3°)
        { id: 'sis26_ireq', code: 'SI322', name: 'Ingeniería de requisitos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
    ],
    4: [
        buscarCurso(CURSOS_SISTEMAS, 'FB403'), // Ecuaciones diferenciales
        buscarCurso(CURSOS_SISTEMAS, 'FB405'), // Estadística aplicada
        buscarCurso(CURSOS_SISTEMAS, 'SI405'), // Modelado Conceptual de Datos → Modelamiento de datos
        buscarCurso(CURSOS_SISTEMAS, 'BEF01'), // Ética y filosofía política (se mueve de 2° a 4°)
        buscarCurso(CURSOS_SISTEMAS, 'BEG01'), // Economía general (se mueve de 5° a 4°)
        { id: 'sis26_cis', code: 'SI422', name: 'Ciencia Integrativa de Sistemas', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'sis26_td', code: 'SI425', name: 'Transformación digital', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
    ],
    // 5-10 y electivos: se agregan cuando esos ciclos empiecen a
    // tener alumnos reales en malla 2026 (recién en 2027 en
    // adelante). El plan oficial completo ya está guardado en el
    // documento del proyecto "malla-2026-sistemas-plan.md" para
    // cuando toque construir esa parte.
};

/* ============================================================
   INGENIERÍA INDUSTRIAL — MALLA 2026
   Plan oficial 2026 subido por Harry (plan_de_estudios_industrial_2026.pdf)
   + criterios_de_evaluación_UNI.pdf (tabla de Sistema de Evaluación
   A-N). Las 60 letras de evaluación de esta malla caen todas en D, F
   o G — que ya existen en el motor como SOLO_PC, COMPUTACION_1_1_2 y
   ESTANDAR_1_1_1 respectivamente, así que no hizo falta crear tipos
   de fórmula nuevos.

   - Código igual en 2018 y 2026: buscarCurso() (hereda formula_type
     ya curado).
   - Código renombrado pero mismo curso, según el cuadro de
     equivalencias oficial del PDF: objeto nuevo, pero heredando el
     formula_type del curso 2018 equivalente (comentado cuál).
     EXCEPCIÓN: si la letra 2026 no coincide con la del curso 2018
     (p.ej. TE703 y TE001 ahora son G, no F), se respeta la letra
     2026 nueva en vez de heredar la fórmula vieja.
   - Curso genuinamente nuevo (confirmado "Nuevo" en el cuadro de
     equivalencias): PENDIENTE.
   Electivos: el PDF no trae letra de evaluación para ellos, quedan
   fuera por ahora (pendiente).
   ============================================================ */
const CURSOS_INDUSTRIAL_2026 = {
    1: [
        buscarCurso(CURSOS_INDUSTRIAL, 'BFI01'), // Física I — F
        buscarCurso(CURSOS_INDUSTRIAL, 'BIC01'), // Introducción a la computación — F
        buscarCurso(CURSOS_INDUSTRIAL, 'BMA01'), // Cálculo diferencial — G
        buscarCurso(CURSOS_INDUSTRIAL, 'BQU01'), // Química I — F
        buscarCurso(CURSOS_INDUSTRIAL, 'FB101'), // Geometría analítica — G
        buscarCurso(CURSOS_INDUSTRIAL, 'GE101'), // Introducción a la Ing. Industrial — F
    ],
    2: [
        buscarCurso(CURSOS_INDUSTRIAL, 'BMA02'), // Cálculo integral — G
        buscarCurso(CURSOS_INDUSTRIAL, 'BMA03'), // Álgebra lineal — G
        buscarCurso(CURSOS_INDUSTRIAL, 'BRC01'), // Redacción y comunicación — D
        buscarCurso(CURSOS_INDUSTRIAL, 'FB202'), // Química II — F
        buscarCurso(CURSOS_INDUSTRIAL, 'FB401'), // Física II — F
        buscarCurso(CURSOS_SOFTWARE, 'TE-205'), // Dibujo y geometría descriptiva — D (mismo curso que en Sistemas 2026, ya cargado desde Software)
    ],
    3: [
        buscarCurso(CURSOS_INDUSTRIAL, 'FB301'), // Matemática discreta — F
        buscarCurso(CURSOS_INDUSTRIAL, 'FB303'), // Cálculo multivariable — F
        buscarCurso(CURSOS_INDUSTRIAL, 'FB305'), // Estadística y probabilidades — F
        buscarCurso(CURSOS_INDUSTRIAL, 'HU102'), // Desarrollo personal — D
        buscarCurso(CURSOS_INDUSTRIAL, 'TE302'), // Diseño asistido por computador — D
        buscarCurso(CURSOS_INDUSTRIAL, 'TE401'), // Termodinámica — F
        { id: 'ind26_algo', code: 'SI205', name: 'Algoritmia y Estructura de Datos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Nuevo — F
    ],
    4: [
        buscarCurso(CURSOS_INDUSTRIAL, 'BEF01'), // Ética y Filosofía Política — D
        buscarCurso(CURSOS_INDUSTRIAL, 'BEG01'), // Economía general — F
        buscarCurso(CURSOS_INDUSTRIAL, 'FB403'), // Ecuaciones diferenciales — F
        buscarCurso(CURSOS_INDUSTRIAL, 'FB405'), // Estadística aplicada — F
        buscarCurso(CURSOS_INDUSTRIAL, 'TE301'), // Fisicoquímica y Operaciones Unitarias — F
        buscarCurso(CURSOS_INDUSTRIAL, 'TE501'), // Electricidad y Electrónica Industrial — F
        { id: 'ind26_ad', code: 'SI150', name: 'Analítica de Datos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Nuevo — F
    ],
    5: [
        buscarCurso(CURSOS_INDUSTRIAL, 'BRN01'), // Realidad Nacional, Constitución y DDHH — D
        buscarCurso(CURSOS_INDUSTRIAL, 'GE502'), // Ingeniería del trabajo I — G
        buscarCurso(CURSOS_INDUSTRIAL, 'GE602'), // Contabilidad financiera — F
        buscarCurso(CURSOS_INDUSTRIAL, 'GE604'), // Administración y Organización — F
        buscarCurso(CURSOS_INDUSTRIAL, 'SI501'), // Investigación de Operaciones I — F
        buscarCurso(CURSOS_INDUSTRIAL, 'TE503'), // Procesos industriales I — F
        buscarCurso(CURSOS_INDUSTRIAL, 'TE601'), // Ingeniería de materiales — F
    ],
    6: [
        buscarCurso(CURSOS_INDUSTRIAL, 'GE603'), // Ingeniería del trabajo II — F
        buscarCurso(CURSOS_INDUSTRIAL, 'SI601'), // Investigación de Operaciones II — F
        buscarCurso(CURSOS_INDUSTRIAL, 'TE602'), // Procesos industriales II — F
        { id: 'ind26_costos', code: 'GE606', name: 'Costos y Presupuestos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'], disponible: true }, // Renombrado de GE704 (cuadro de equivalencias), F
        { id: 'ind26_cep', code: 'TE603', name: 'Control Estadístico de Procesos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Nuevo — F
        { id: 'ind26_mii', code: 'TE604', name: 'Maquinaria e Instrumentación Industrial', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Nuevo — F
    ],
    7: [
        buscarCurso(CURSOS_INDUSTRIAL, 'GE701'), // Logística empresarial — F
        buscarCurso(CURSOS_INDUSTRIAL, 'GE702'), // Ingeniería económica — F
        buscarCurso(CURSOS_INDUSTRIAL, 'HU301'), // Metodología de la Investigación — D
        buscarCurso(CURSOS_INDUSTRIAL, 'SI701'), // Modelado sistémico y simulación — F
        { id: 'ind26_mi', code: 'TE702', name: 'Manufactura Inteligente', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Nuevo — G
        { id: 'ind26_ip', code: 'TE703', name: 'Ingeniería de Procesos', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'], disponible: true }, // Renombrado de SI503, pero pasa de F a G — se respeta la letra 2026
    ],
    8: [
        buscarCurso(CURSOS_INDUSTRIAL, 'GE805'), // Mercadotecnia — F
        buscarCurso(CURSOS_INDUSTRIAL, 'GE905'), // Planeamiento y control de operaciones — F
        buscarCurso(CURSOS_INDUSTRIAL, 'TE802'), // Ingeniería del producto — F
        { id: 'ind26_gf', code: 'GE906', name: 'Gestión Financiera', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Nuevo — F
        { id: 'ind26_sic', code: 'TE803', name: 'Sistemas Integrados de Calidad', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Sin equivalencia confirmada con GE709 — F
    ],
    9: [
        buscarCurso(CURSOS_INDUSTRIAL, 'GE802'), // Gestión de la cadena de suministro — F
        buscarCurso(CURSOS_INDUSTRIAL, 'GE904'), // Taller de proyecto de investigación — D
        buscarCurso(CURSOS_INDUSTRIAL, 'TE901'), // Seguridad y salud ocupacional — F
        { id: 'ind26_ia', code: 'SI077', name: 'Inteligencia Artificial', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false }, // Nuevo — F
        { id: 'ind26_auto', code: 'TE903', name: 'Automatización', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'], disponible: true }, // Renombrado de TE801 (cuadro de equivalencias), F
    ],
    10: [
        buscarCurso(CURSOS_INDUSTRIAL, 'GE801'), // Planeamiento y gestión estratégica — F
        buscarCurso(CURSOS_INDUSTRIAL, 'GE902'), // Diseño y evaluación de proyectos — F
        buscarCurso(CURSOS_INDUSTRIAL, 'GE903'), // Gestión del talento humano — F
        { id: 'ind26_taller', code: 'GE004', name: 'Taller de Investigación', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false }, // Sin equivalencia confirmada con GE001/GE002 — D
        { id: 'ind26_sost', code: 'TE001', name: 'Sostenibilidad Industrial', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'], disponible: true }, // Renombrado de TE123, pero pasa de F a G — se respeta la letra 2026
    ],
    // Electivos: el PDF no especifica letra de evaluación para ellos.
    // Pendiente hasta que confirmemos el sistema de cada uno.
};

/* ============================================================
   INGENIERÍA DE SOFTWARE — MALLA 2026
   Pendiente: falta confirmar si existe plan oficial publicado.
   ============================================================ */
// const CURSOS_SOFTWARE_2026 = { 1: [...], 2: [...], 3: [...], 4: [...] };

/* ============================================================
   INGENIERÍA DE INTELIGENCIA ARTIFICIAL — MALLA 2026
   Movido acá desde cursos_db_2018.js: es carrera nueva de la UNI
   (ciclo 26-1 en adelante), su malla ES la 2026 desde el ciclo 1
   hasta el 10 — nunca tuvo malla 2018, así que no tenía sentido que
   viviera en ese archivo. Contenido sin cambios.
   ============================================================ */
const CURSOS_IA = {
    1: [
        buscarCurso(CURSOS_SISTEMAS, 'BIC01'),
        buscarCurso(CURSOS_SISTEMAS, 'BMA01'),
        buscarCurso(CURSOS_SISTEMAS, 'BQU01'),
        buscarCurso(CURSOS_SISTEMAS, 'BRC01'),
        buscarCurso(CURSOS_SISTEMAS, 'FB101'),
        buscarCurso(CURSOS_SOFTWARE, 'HU102'),
        // Nuevo, exclusivo de IA. Metodología: misma que "Intro al
        // Pensamiento y a la Ing. de Sistemas" (Sistemas, ciclo 1),
        // por indicación de Harry.
        { id: 'ia_intro', code: 'IA001', name: 'Introducción a la Ingeniería de Inteligencia Artificial', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'], disponible: true },
    ],
    2: [
        buscarCurso(CURSOS_SISTEMAS, 'BMA02'),
        buscarCurso(CURSOS_SISTEMAS, 'BMA03'),
        buscarCurso(CURSOS_SISTEMAS, 'BRN01'),
        buscarCurso(CURSOS_SISTEMAS, 'FB301'),
        buscarCurso(CURSOS_SISTEMAS, 'FB305'),
        buscarCurso(CURSOS_SISTEMAS, 'SI205'),
    ],
    3: [
        buscarCurso(CURSOS_SISTEMAS, 'BEG01'),
        buscarCurso(CURSOS_SISTEMAS, 'BFI01'),
        buscarCurso(CURSOS_SISTEMAS, 'FB303'),
        { id: 'ia_ads', code: 'IA002', name: 'Análisis de Datos Estadísticos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SOFTWARE, 'SW301'),
        buscarCurso(CURSOS_SOFTWARE, 'SW303'),
        buscarCurso(CURSOS_SOFTWARE, 'SW305'),
    ],
    4: [
        buscarCurso(CURSOS_SISTEMAS, 'BEF01'),
        buscarCurso(CURSOS_SISTEMAS, 'FB401'),
        buscarCurso(CURSOS_SISTEMAS, 'FB403'),
        { id: 'ia_aa1', code: 'IA005', name: 'Aprendizaje Automático I', credits: 4, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SISTEMAS, 'SI405'), // Modelado Conceptual de Datos — 3 créditos, confirmado contra la malla oficial de IA (código SI405, ciclo 4)
        buscarCurso(CURSOS_SOFTWARE, 'SW403'),
        buscarCurso(CURSOS_SOFTWARE, 'SW405'),
    ],
    5: [
        buscarCurso(CURSOS_SISTEMAS, 'FB402'),
        buscarCurso(CURSOS_SOFTWARE, 'HU501'),
        { id: 'ia_aa2', code: 'IA007', name: 'Aprendizaje Automático II', credits: 4, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_sma', code: 'IA008', name: 'Sistemas Multiagentes', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SISTEMAS, 'SI505'),
        buscarCurso(CURSOS_SOFTWARE, 'SW407'),
        buscarCurso(CURSOS_SOFTWARE, 'SW603'),
    ],
    6: [
        { id: 'ia_apd', code: 'IA004', name: 'Adquisición y Preprocesamiento de Datos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_vds', code: 'IA009', name: 'Visualización de Datos y Storytelling', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_rndl', code: 'IA010', name: 'Redes Neuronales y Deep Learning', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_tao', code: 'IA011', name: 'Técnicas Avanzadas de Optimización', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_mgp', code: 'IA012', name: 'Modelos Gráficos Probabilísticos', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_fm', code: 'IA018', name: 'Fundamentos de Mecatrónica', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SOFTWARE, 'SW505'),
    ],
    7: [
        // Mismo curso que GS804 en Software ("Administración de Empresas
        // de Software"), solo que en IA lleva otro código institucional
        // — confirmado por Harry, no es un error.
        { id: 'ia_aesw', code: 'GE804', name: 'Administración de Empresas de Software', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'], disponible: true },
        { id: 'ia_tml', code: 'IA013', name: 'Taller de Machine Learning', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_va', code: 'IA014', name: 'Visión Artificial', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_ps', code: 'IA019', name: 'Procesamiento de Señales', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_edia', code: 'IA021', name: 'Ética de Datos e Inteligencia Artificial', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_fd', code: 'IA027', name: 'Fabricación Digital', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SOFTWARE, 'SW115'),
    ],
    8: [
        { id: 'ia_apr', code: 'IA016', name: 'Aprendizaje por Refuerzo', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_pln', code: 'IA017', name: 'Procesamiento del Lenguaje Natural', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_adm', code: 'IA020', name: 'Análisis de Datos Masivos (Big Data)', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_tii', code: 'IA023', name: 'Taller de Investigación de Ing. Inteligencia Artificial', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SOFTWARE, 'SW004'),
        buscarCurso(CURSOS_SOFTWARE, 'SW703'),
    ],
    9: [
        { id: 'ia_ce', code: 'IA015', name: 'Computación Evolutiva', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_tdl', code: 'IA022', name: 'Taller de Deep Learning', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_tpi', code: 'IA024', name: 'Taller de Proyectos de Investigación', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SOFTWARE, 'SW122'),
    ],
    10: [
        { id: 'ia_ti', code: 'IA025', name: 'Taller de Investigación', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_tavia', code: 'IA026', name: 'Tópicos Avanzados de Inteligencia Artificial', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
    ],
    electivos: [
        buscarCurso(CURSOS_SISTEMAS, 'FB501'),
        buscarCurso(CURSOS_INDUSTRIAL, 'GE704'),
        { id: 'ia_el_bia', code: 'IA110', name: 'Bioinformática e Inteligencia Artificial', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_pc', code: 'IA112', name: 'Psicología Cognitiva', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_iag', code: 'IA114', name: 'Inteligencia Artificial Generativa', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_jia', code: 'IA116', name: 'Diseño y Desarrollo de Juegos con IA', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_iam', code: 'IA118', name: 'Inteligencia Artificial en Medicina', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_iaa', code: 'IA120', name: 'Inteligencia Artificial en Agricultura', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_sr', code: 'IA122', name: 'Sistemas de Recomendación', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_ra', code: 'IA124', name: 'Robótica Avanzada', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        // Mismo curso que SW128 en Software ("Desarrollo de Aplicaciones
        // Biométricas"), solo que en IA lleva otro código institucional
        // — confirmado por Harry, mismo caso que GE804/GS804.
        { id: 'ia_el_dab', code: 'IA126', name: 'Desarrollo de Aplicaciones Biométricas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'], disponible: true },
        { id: 'ia_el_iae', code: 'IA128', name: 'Inteligencia Artificial Explicada', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_rarv', code: 'IA130', name: 'Realidad Aumentada y Realidad Virtual', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        { id: 'ia_el_pcomp', code: 'IA132', name: 'Programación Competitiva', credits: 3, formula_type: 'PENDIENTE', components: [], disponible: false },
        buscarCurso(CURSOS_SOFTWARE, 'SW005'),
        buscarCurso(CURSOS_SOFTWARE, 'SW110'),
        buscarCurso(CURSOS_SOFTWARE, 'SW113'),
        buscarCurso(CURSOS_SOFTWARE, 'SW116'),
        buscarCurso(CURSOS_SOFTWARE, 'SW120'),
        buscarCurso(CURSOS_SOFTWARE, 'SW124'),
        buscarCurso(CURSOS_SOFTWARE, 'SW125'),
        // Sin coincidencia en ninguna otra carrera — exclusivo de IA.
        { id: 'ia_el_qi', code: 'SW140', name: 'Quality Insurance', credits: 2, formula_type: 'PENDIENTE', components: [], disponible: false },
    ],
};

/* ============================================================
   ENSAMBLADO FINAL — reemplaza al CURSOS_POR_CICLO que estaba al
   final de cursos_db_2018.js (ya se quitó de ahí, para no dejar dos
   definiciones de la misma variable). A partir de acá,
   intranotas.js consulta CURSOS_POR_CICLO[malla][carrera][ciclo].

   Cada carrera de 2026 se agrega a la llave '2026' solo cuando
   exista su objeto CURSOS_<CARRERA>_2026 — así, mientras Industrial
   no tenga malla publicada, simplemente no aparece esa llave y la
   pantalla de selección de carrera para malla 2026 debe filtrar
   contra eso (mostrar solo las carreras presentes en
   CURSOS_POR_CICLO['2026']).
   ============================================================ */
const CURSOS_POR_CICLO = {
    '2018': {
        sistemas: CURSOS_SISTEMAS,
        industrial: CURSOS_INDUSTRIAL,
        software: CURSOS_SOFTWARE,
        // ia: NO va acá — Ing. de Inteligencia Artificial es una carrera
        // nueva de la UNI (ciclo 26-1 en adelante), nunca tuvo alumnos
        // en malla 2018, así que no le corresponde esa versión.
    },
    '2026': {
        sistemas: CURSOS_SISTEMAS_2026,
        industrial: CURSOS_INDUSTRIAL_2026,
        // software: CURSOS_SOFTWARE_2026,       // agregar cuando exista
        ia: CURSOS_IA, // única malla que existe para esta carrera; se reutiliza tal cual (no hay "IA 2018" de la que migrar)
    },
};