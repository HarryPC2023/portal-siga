/* ============================================================
   BASE DE DATOS DE CURSOS POR CARRERA Y CICLO
   Fuente: Plan de Estudios 2018 — FIIS UNI
   Criterios de evaluación: Art. 28 Reglamento UNI
   ============================================================

   MAPA DE formula_type según sistema de evaluación (Art. 28):
   G  → ESTANDAR_1_1_1      (PC×1 + EP×1 + EF×1) / 3
   F  → COMPUTACION_1_1_2   (PC×1 + EP×1 + EF×2) / 4
   D  → SOLO_PC             solo promedio de prácticas/trabajos
   B  → SOLO_EXAMENES       (EP×1 + EF×2) / 3
   I  → INGENIERIA_DATOS    (PC×1 + Mon×1 + EP×1 + EF×2) / 4  [custom]

   Cursos especiales Sistemas ciclos 1-5 (verificados):
   - BRC01 / BRC01_sw → REDACCION_BASE
   - BQU01            → QUIMICA
   - BFI01            → FISICA_I
   - FB401 (Física II)→ FISICA_II
   - BEF01            → ETICA
   - HS101 / HU301    → METODOLOGIA_INV
   - SI201 / S1201    → PSICOLOGIA
   - SI207            → BIOLOGICO
   - SI205 / S1205    → ALGORITMIA
   - SI403            → SISTEMAS_BLANDOS
   - SI405 / SW401    → MODELADO_DATOS
   - SI301 / S1301    → TCS
   - BMA03 (Álgebra)  → ALGEBRA
   ============================================================ */

const CURSOS_SISTEMAS = {
    1: [
        { id: 'sis_geo', code: 'FB101', name: 'Geometría Analítica', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_cal', code: 'BMA01', name: 'Cálculo Diferencial', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_qui', code: 'BQU01', name: 'Química I', credits: 5, formula_type: 'QUIMICA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'Lab6', 'Lab7', 'Lab8', 'EP', 'EF', 'ES'] },
        { id: 'sis_com', code: 'BIC01', name: 'Introducción a la Computación', credits: 2, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_red', code: 'BRC01', name: 'Redacción y Comunicación', credits: 2, formula_type: 'REDACCION_BASE', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2'] },
        { id: 'sis_pensa', code: 'SI101', name: 'Intro al Pensamiento y a la Ing. de Sistemas', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    2: [
        { id: 'sis_alg', code: 'BMA03', name: 'Álgebra Lineal', credits: 4, formula_type: 'ALGEBRA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_cal2', code: 'BMA02', name: 'Cálculo Integral', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_eti', code: 'BEF01', name: 'Ética y Filosofía Política', credits: 2, formula_type: 'ETICA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1'] },
        { id: 'sis_psi', code: 'SI201', name: 'Psicología Sistémica', credits: 3, formula_type: 'PSICOLOGIA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sis_tcs', code: 'SI203', name: 'Teoría y Ciencia de Sistemas', credits: 3, formula_type: 'TCS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2', 'EP', 'EF', 'ES'] },
        { id: 'sis_bio', code: 'SI207', name: 'Sistemas Biológicos y Ecológicos', credits: 2, formula_type: 'BIOLOGICO', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sis_algo', code: 'SI205', name: 'Algoritmia y Estructura de Datos', credits: 3, formula_type: 'ALGORITMIA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    3: [
        { id: 'sis_md', code: 'FB301', name: 'Matemática Discreta', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_calM', code: 'FB303', name: 'Cálculo Multivariable', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_fi1', code: 'BFI01', name: 'Física I', credits: 5, formula_type: 'FISICA_I', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'EP', 'EF', 'ES'] },
        { id: 'sis_met', code: 'HU301', name: 'Metodología de la Investigación', credits: 2, formula_type: 'METODOLOGIA_INV', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1'] },
        { id: 'sis_est', code: 'FB305', name: 'Estadística y Probabilidades', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_tcsa', code: 'SI301', name: 'Teoría y Ciencia de Sistemas Aplicados', credits: 2, formula_type: 'TCS_APLICADA', components: ['PC1', 'PC2', 'Monografia1', 'Monografia2', 'EP', 'EF', 'ES'] },
        { id: 'sis_poo', code: 'SI302', name: 'Programación Orientada a Objetos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    4: [
        { id: 'sis_cn', code: 'FB402', name: 'Cálculo Numérico', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_ed', code: 'FB403', name: 'Ecuaciones Diferenciales', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_fi2', code: 'FB401', name: 'Física II', credits: 5, formula_type: 'FISICA_II', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'EP', 'EF', 'ES'] },
        { id: 'sis_esta', code: 'FB405', name: 'Estadística Aplicada', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_dp', code: 'HU102', name: 'Desarrollo Personal', credits: 2, formula_type: 'REDACCION_BASE', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2'] },
        { id: 'sis_sb', code: 'SI403', name: 'Metodología de los Sistemas Blandos', credits: 3, formula_type: 'SISTEMAS_BLANDOS', components: ['PC1', 'Monografia1', 'Monografia2', 'EP', 'EF', 'ES'] },
        { id: 'sis_mcd', code: 'SI405', name: 'Modelado Conceptual de Datos', credits: 3, formula_type: 'MODELADO_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
    ],
    5: [
        { id: 'sis_ma', code: 'FB501', name: 'Matemática Aplicada', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_dbd', code: 'SI505', name: 'Diseño de Base de Datos', credits: 3, formula_type: 'MODELADO_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sis_rn', code: 'BRN01', name: 'Realidad Nacional. Constitución y DDHH', credits: 3, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_io1', code: 'SI501', name: 'Investigación de Operaciones I', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_eco', code: 'BEG01', name: 'Economía General', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_to', code: 'GP501', name: 'Teoría Organizacional', credits: 3, formula_type: 'TEORIA_ORGANIZACIONAL', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2', 'EP', 'EF', 'ES'] },
        { id: 'sis_ip', code: 'SI503', name: 'Ingeniería de Procesos', credits: 3, formula_type: 'MODELADO_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
    ],
    6: [
        { id: 'sis_sgf', code: 'GE605', name: 'Sistema y Gestión Financiera', credits: 3, formula_type: 'TEORIA_ORGANIZACIONAL', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2', 'EP', 'EF', 'ES'] },
        { id: 'sis_mpcv', code: 'SI603', name: 'Modelado de Procesos del Ciclo de Vida de Sistemas', credits: 3, formula_type: 'MODELADO_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sis_io2', code: 'SI601', name: 'Investigación de Operaciones II', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_din', code: 'SI602', name: 'Dinámica de Sistemas', credits: 3, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_ads', code: 'SI604', name: 'Análisis y Diseño de Sistemas', credits: 4, formula_type: 'MODELADO_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sis_arc', code: 'SI607', name: 'Arquitectura Computacional y Redes', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_arqe6', code: 'SI605', name: 'Arquitectura Empresarial', credits: 3, formula_type: 'ARQ_EMPRESARIAL', components: ['PC1', 'PC2', 'PC3', 'Monografia1', 'EP', 'EF', 'ES'] },
    ],
    7: [
        { id: 'sis_sc', code: 'GP709', name: 'Sistemas de Calidad', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_sie', code: 'SI703', name: 'Sistemas Integrados Empresariales', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_mss', code: 'SI701', name: 'Modelado Sistémico y Simulación', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_tds', code: 'SI702', name: 'Taller de Dinámica de Sistemas', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_gis', code: 'SI704', name: 'Gestión de la Ingeniería de Sistemas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_eis', code: 'SI705', name: 'Estándares de la Ing. de Sistemas', credits: 2, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_isw', code: 'SI707', name: 'Ingeniería de Software', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    8: [
        { id: 'sis_msv', code: 'SI801', name: 'Modelo del Sistema Viable', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_pge', code: 'GP801', name: 'Planeamiento y Gestión Estratégica', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_sa', code: 'GP803', name: 'Sistemas Analíticos', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_ints', code: 'SI805', name: 'Integración de Sistemas', credits: 2, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_sin', code: 'GP807', name: 'Sistemas de Inteligencia de Negocio', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_daisw', code: 'SI806', name: 'Desarrollo Adaptativo e Integrado del SW', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    9: [
        { id: 'sis_tesi1', code: 'SI901', name: 'Proyecto de Tesis en Ing. Sistemas I', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_iss', code: 'SI902', name: 'Ingeniería de Sistemas de Servicio', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_imps', code: 'SI903', name: 'Implementación de Sistemas', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_segs', code: 'SI904', name: 'Seguridad de Sistemas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_arqe', code: 'SI905', name: 'Arquitectura Empresarial', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_dep', code: 'GP902', name: 'Diseño y Evaluación de Proyectos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    10: [
        { id: 'sis_tesi2', code: 'SI035', name: 'Proyecto de Tesis en Ing. Sistemas II', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_gpr', code: 'SI055', name: 'Gestión de Proyectos', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_auds', code: 'SI075', name: 'Auditoría de Sistemas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_ane', code: 'SI085', name: 'Aplicación de Negocios Electrónicos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_iem', code: 'SI095', name: 'Ingeniería Empresarial', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    electivos: [
        { id: 'sis_el_ie', code: 'GP702', name: 'Ingeniería Económica', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_td', code: 'SI111', name: 'Teoría de Decisiones', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_cc', code: 'GE704', name: 'Contabilidad de Costos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_ci', code: 'GP124', name: 'Comercio Internacional', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_dib', code: 'TP101', name: 'Dibujo en Ingeniería', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_el_soc', code: 'HS115', name: 'Sociología', credits: 2, formula_type: 'SOLO_EXAMENES', components: ['EP', 'EF', 'ES'] },
        { id: 'sis_el_fm', code: 'FB111', name: 'Física Moderna', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_let', code: 'HS111', name: 'Legislación Empresarial y Tributaria', credits: 2, formula_type: 'SOLO_EXAMENES', components: ['EP', 'EF', 'ES'] },
        { id: 'sis_el_gi', code: 'SI130', name: 'Gestión de la Información', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_gne', code: 'GP128', name: 'Gestión de Negocios y Estrategia Empresarial', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_mpd', code: 'GP805', name: 'Modelo de Datos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_co', code: 'HS112', name: 'Comportamiento Organizacional', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_el_gch', code: 'GP903', name: 'Gestión de Competencias Humanas', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_tjn', code: 'GP112', name: 'Teoría de Juegos y la Negociación', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_igt', code: 'TP111', name: 'Innovación y Gestión Tecnológica', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_gsi', code: 'SI116', name: 'Gestión de la Configuración de Sistemas de Información', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_tc', code: 'SI118', name: 'Teoría de la Complejidad', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_ctc', code: 'SI122', name: 'Cibernética y Teoría de Control', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_iei', code: 'SI124', name: 'Integración, Estándares de Interoperabilidad', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_vvs', code: 'SI126', name: 'Verificación y Validación de Sistemas', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_el_grs', code: 'SI115', name: 'Gestión de Comunidades y Redes Sociales', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sis_el_mpar', code: 'GP120', name: 'Modelos Probabilísticos y Análisis de Riesgos', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_adc', code: 'SI140', name: 'Administración del Conocimiento', credits: 3, formula_type: 'INGENIERIA_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sis_el_ia', code: 'SI077', name: 'Inteligencia Artificial', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
};

const CURSOS_INDUSTRIAL = {
    1: [
        { id: 'ind_cal', code: 'BMA01', name: 'Cálculo Diferencial', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_qui', code: 'BQU01', name: 'Química I', credits: 5, formula_type: 'QUIMICA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'Lab6', 'Lab7', 'Lab8', 'EP', 'EF', 'ES'] },
        { id: 'ind_red', code: 'BRC01', name: 'Redacción y Comunicación', credits: 2, formula_type: 'REDACCION_BASE', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2'] },
        { id: 'ind_eti', code: 'BEF01', name: 'Ética y Filosofía Política', credits: 2, formula_type: 'ETICA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1'] },
        { id: 'ind_geo', code: 'FB101', name: 'Geometría Analítica', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_dib', code: 'TE101', name: 'Dibujo en Ingeniería', credits: 2, formula_type: 'SOLO_PC_6', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6'] },
        { id: 'ind_iii', code: 'GE101', name: 'Introducción a Ingeniería Industrial', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    2: [
        { id: 'ind_alg', code: 'BMA03', name: 'Álgebra Lineal', credits: 4, formula_type: 'ALGEBRA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_cal2', code: 'BMA02', name: 'Cálculo Integral', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_com', code: 'BIC01', name: 'Introducción a la Computación', credits: 2, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_rn', code: 'BRN01', name: 'Realidad Nacional. Constitución y DDHH', credits: 3, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'ind_dp', code: 'HU102', name: 'Desarrollo Personal', credits: 2, formula_type: 'REDACCION_BASE', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2'] },
        { id: 'ind_tgs', code: 'SI204', name: 'Teoría General de Sistemas', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'ind_qui2', code: 'FB202', name: 'Química II', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    3: [
        { id: 'ind_fi1', code: 'BFI01', name: 'Física I', credits: 5, formula_type: 'FISICA_I', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'EP', 'EF', 'ES'] },
        { id: 'ind_met', code: 'HU301', name: 'Metodología de la Investigación', credits: 2, formula_type: 'METODOLOGIA_INV', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1'] },
        { id: 'ind_md', code: 'FB301', name: 'Matemática Discreta', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_calM', code: 'FB303', name: 'Cálculo Multivariable', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_dac', code: 'TE302', name: 'Diseño Asistido por Computador', credits: 3, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'ind_fqou', code: 'TE301', name: 'Físico Química y Operaciones Unitarias', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    4: [
        { id: 'ind_eco', code: 'BEG01', name: 'Economía General', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_ed', code: 'FB403', name: 'Ecuaciones Diferenciales', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_fi2', code: 'FB401', name: 'Física II', credits: 5, formula_type: 'FISICA_II', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'EP', 'EF', 'ES'] },
        { id: 'ind_lp', code: 'SI401', name: 'Lenguaje de Programación', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_est', code: 'FB305', name: 'Estadística y Probabilidades', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_ter', code: 'TE401', name: 'Termodinámica', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    5: [
        { id: 'ind_soc', code: 'HU201', name: 'Sociología', credits: 2, formula_type: 'SOLO_EXAMENES', components: ['EP', 'EF', 'ES'] },
        { id: 'ind_esta', code: 'FB405', name: 'Estadística Aplicada', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_rm', code: 'TE502', name: 'Resistencia de Materiales', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_pi1', code: 'TE503', name: 'Procesos Industriales I', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_ele', code: 'TE501', name: 'Electricidad y Electrónica Industrial', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_it1', code: 'GE502', name: 'Ingeniería del Trabajo I', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_io1', code: 'SI501', name: 'Investigación de Operaciones I', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    6: [
        { id: 'ind_adm', code: 'GE604', name: 'Administración y Organización', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_pi2', code: 'TE602', name: 'Procesos Industriales II', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_cf', code: 'GE602', name: 'Contabilidad Financiera', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_it2', code: 'GE603', name: 'Ingeniería del Trabajo II', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_io2', code: 'SI601', name: 'Investigación de Operaciones II', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_im', code: 'TE601', name: 'Ingeniería de Materiales', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    7: [
        { id: 'ind_iec', code: 'GE702', name: 'Ingeniería Económica', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_log', code: 'GE701', name: 'Logística Empresarial', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_mss', code: 'SI701', name: 'Modelado Sistémico y Simulación', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_apm', code: 'TE701', name: 'Análisis de Procesos de Manufactura', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_ingp', code: 'SI503', name: 'Ingeniería de Procesos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_ccp', code: 'GE704', name: 'Contabilidad de Costos y Presupuestos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    8: [
        { id: 'ind_sc', code: 'GE709', name: 'Sistemas de Calidad', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_acp', code: 'TE801', name: 'Automatización y Control de Procesos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_gcs', code: 'GE802', name: 'Gestión de la Cadena de Suministro', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_ip', code: 'TE802', name: 'Ingeniería del Producto', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_mkt', code: 'GE805', name: 'Mercadotecnia', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    9: [
        { id: 'ind_sso', code: 'TE901', name: 'Seguridad y Salud Ocupacional', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_fin', code: 'GE002', name: 'Finanzas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_ien', code: 'GE901', name: 'Innovación y Emprendimiento de Negocios', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_tesi1', code: 'GE904', name: 'Proyecto de Tesis en Ing. Industrial I', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'ind_pco', code: 'GE905', name: 'Planeamiento y Control de Operaciones', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    10: [
        { id: 'ind_gth', code: 'GE903', name: 'Gestión del Talento Humano', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_pge', code: 'GE801', name: 'Planeamiento y Gestión Estratégica', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_dep', code: 'GE902', name: 'Diseño y Evaluación de Proyectos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_tesi2', code: 'GE001', name: 'Proyecto de Tesis en Ing. Industrial II', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
    ],
    electivos: [
        { id: 'ind_el_td', code: 'SI111', name: 'Teoría de Decisiones', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_igt', code: 'TE111', name: 'Innovación y Gestión Tecnológica', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_let', code: 'HU111', name: 'Legislación Empresarial y Tributaria', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'ind_el_co', code: 'HU112', name: 'Comportamiento Organizacional', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'ind_el_jn', code: 'GE117', name: 'Juegos de Negocio', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'ind_el_an', code: 'SI112', name: 'Analítica del Negocio', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_sig', code: 'SI113', name: 'Sistemas de Información Gerencial', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_bd', code: 'SI114', name: 'Base de Datos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_ddp', code: 'GE121', name: 'Diseño y Disposición de Plantas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_sc', code: 'GE122', name: 'Sistema de Costos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_lm', code: 'TE125', name: 'Lean Manufacturing', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_pgn', code: 'GE123', name: 'Planeamiento y Gestión de Negocios', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_cint', code: 'GE124', name: 'Comercio Internacional', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_erg', code: 'TE121', name: 'Ergonomía', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_pai', code: 'TE122', name: 'Procesos Agroindustriales', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_ima', code: 'TE123', name: 'Industria y Medio Ambiente', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_ce', code: 'SI124', name: 'Comercio Electrónico', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_ge', code: 'TE124', name: 'Gestión de la Energía', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_rob', code: 'TE127', name: 'Robótica Industrial', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_dsi', code: 'SI125', name: 'Dinámica de Sistemas Industriales', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_is', code: 'GE126', name: 'Ingeniería del Servicio', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_de', code: 'GE128', name: 'Diagnóstico de Empresas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'ind_el_gm', code: 'TE126', name: 'Gestión del Mantenimiento', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
};

const CURSOS_SOFTWARE = {
    1: [
        { id: 'sw_geo', code: 'FB101', name: 'Geometría Analítica', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_cal', code: 'BMA01', name: 'Cálculo Diferencial', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_qui', code: 'BQU01', name: 'Química I', credits: 5, formula_type: 'QUIMICA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'Lab6', 'Lab7', 'Lab8', 'EP', 'EF', 'ES'] },
        { id: 'sw_red', code: 'BRC01', name: 'Redacción y Comunicación', credits: 2, formula_type: 'REDACCION_BASE', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2'] },
        { id: 'sw_isw', code: 'SW101', name: 'Introducción a la Ing. de Software', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_com', code: 'BIC01', name: 'Introducción a la Computación', credits: 2, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_dp', code: 'HU102', name: 'Desarrollo Personal', credits: 2, formula_type: 'REDACCION_BASE', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2'] },
    ],
    2: [
        { id: 'sw_alg', code: 'BMA03', name: 'Álgebra Lineal', credits: 4, formula_type: 'ALGEBRA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_cal2', code: 'BMA02', name: 'Cálculo Integral', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_md', code: 'FB301', name: 'Matemática Discreta', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_fi1', code: 'BFI01', name: 'Física I', credits: 5, formula_type: 'FISICA_I', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'EP', 'EF', 'ES'] },
        { id: 'sw_dib', code: 'TE-205', name: 'Dibujo y Geometría Descriptiva', credits: 2, formula_type: 'SOLO_PC_6', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6'] },
        { id: 'sw_algo', code: 'SI-205', name: 'Algoritmia y Estructura de Datos', credits: 3, formula_type: 'ALGORITMIA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    3: [
        { id: 'sw_calM', code: 'FB303', name: 'Cálculo Multivariable', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_est', code: 'FB305', name: 'Estadística y Probabilidades', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_fi2', code: 'FB401', name: 'Física II', credits: 5, formula_type: 'FISICA_II', components: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'Lab1', 'Lab2', 'Lab3', 'Lab4', 'Lab5', 'EP', 'EF', 'ES'] },
        { id: 'sw_algav', code: 'SW-305', name: 'Algoritmia y Estructura de Datos Avanzada', credits: 3, formula_type: 'INGENIERIA_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sw_arc1', code: 'SW-301', name: 'Arquitectura de Computadoras I', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_lp1', code: 'SW-303', name: 'Lenguajes de Programación I (Imperativo)', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    4: [
        { id: 'sw_ed', code: 'FB403', name: 'Ecuaciones Diferenciales', credits: 5, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_eti', code: 'BEF01', name: 'Ética y Filosofía Política', credits: 2, formula_type: 'ETICA', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1'] },
        { id: 'sw_ir1', code: 'SW-405', name: 'Ingeniería de Requerimientos I', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_so', code: 'SW-407', name: 'Sistemas Operativos', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_lp2', code: 'SW-403', name: 'Lenguajes de Programación II (OO)', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    5: [
        { id: 'sw_eco', code: 'BEG01', name: 'Economía General', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_rn', code: 'BRN01', name: 'Realidad Nacional. Constitución y DDHH', credits: 3, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_arc2', code: 'SW-501', name: 'Arquitectura de Computadoras II', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_amc', code: 'SW-503', name: 'Análisis y Modelamiento de Comportamiento', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_csw1', code: 'SW-505', name: 'Construcción de Software I', credits: 4, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_rc', code: 'SW-507', name: 'Redes y Comunicaciones', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_tep', code: 'HU501', name: 'Taller de Efectividad Personal', credits: 2, formula_type: 'REDACCION_BASE', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'Monografia2'] },
        { id: 'sw_dbd', code: 'SI505', name: 'Diseño de Base de Datos', credits: 3, formula_type: 'MODELADO_DATOS', components: ['PC1', 'PC2', 'PC3', 'PC4', 'Monografia1', 'EP', 'EF', 'ES'] },
    ],
    6: [
        { id: 'sw_lde', code: 'SW608', name: 'Lenguajes de Dominio Específico', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_sgbd', code: 'SW609', name: 'Sistemas de Gestión de Base de Datos', credits: 4, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_esta', code: 'FB405', name: 'Estadística Aplicada', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_io', code: 'SI605', name: 'Investigación de Operaciones', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_dsw', code: 'SW603', name: 'Diseño de Software', credits: 3, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_ir2', code: 'SW605', name: 'Ingeniería de Requerimientos II', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    7: [
        { id: 'sw_gmc', code: 'SW701', name: 'Gestión del mantenimiento y configuración', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_tisw1', code: 'SW705', name: 'Taller de Ingeniería de Software I', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_csw2', code: 'SW707', name: 'Construcción de Software II', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_asol', code: 'SW708', name: 'Arquitectura de Soluciones de Software', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_vsw', code: 'SW709', name: 'Verificación y Validación del Software', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_str', code: 'SW703', name: 'Sistemas Embebidos y en Tiempo Real', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
    ],
    8: [
        { id: 'sw_ml1', code: 'SW803', name: 'Aprendizaje Automático I (Machine Learning I)', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_iesw', code: 'SW805', name: 'Ingeniería Económica para Software', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_acs', code: 'SW809', name: 'Aseguramiento de Calidad del Software', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_pisw', code: 'SW807', name: 'Procesos de Ingeniería de Software', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_aesw', code: 'GS804', name: 'Administración de Empresas de Software', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_tep2', code: 'HU801', name: 'Taller de Efectividad Profesional', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
    ],
    9: [
        { id: 'sw_ml2', code: 'SW901', name: 'Aprendizaje Automático II (Machine Learning II)', credits: 4, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_tesi1', code: 'SW902', name: 'Proyecto de Tesis en Ing. de Software I', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_tin', code: 'SW903', name: 'Taller de Innovación y Tec. Emergentes', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_srds', code: 'SW904', name: 'Seguridad en Redes y Des. de SW Seguro', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_map', code: 'SW907', name: 'Metodologías Ágiles para Proyectos de SW', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_tisw2', code: 'SW905', name: 'Taller de Ingeniería de Software II', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
    ],
    10: [
        { id: 'sw_tesi2', code: 'SW001', name: 'Proyecto de Tesis en Ing. de Software II', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_te', code: 'SW002', name: 'Tópicos Especiales en Ing. de Software', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_gss', code: 'SW003', name: 'Gestión de Servicios del Software', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_gps', code: 'SW004', name: 'Gestión de Proyectos de Software', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_tes', code: 'SW005', name: 'Taller de Emprendimiento en Soluciones de SW', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
    ],
    electivos: [
        { id: 'sw_el_sin', code: 'SI807', name: 'Sistemas de Inteligencia de Negocios', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_iss', code: 'SI902', name: 'Ingeniería de Sistemas de Servicios', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_cn', code: 'FB402', name: 'Cálculo Numérico', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_td', code: 'SW111', name: 'Transformación Digital', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_cg', code: 'SW112', name: 'Computación Gráfica', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_cc', code: 'SW113', name: 'Cloud Computing', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_bds', code: 'SW114', name: 'Big Data / Data Science', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_cp', code: 'SW115', name: 'Computación Paralela', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_dth', code: 'SW116', name: 'Taller de Design Thinking', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_el_si', code: 'SW110', name: 'Seguridad de la Información', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_md', code: 'SW117', name: 'Marketing Digital', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_ae', code: 'SI605', name: 'Arquitectura Empresarial', credits: 3, formula_type: 'ARQ_EMPRESARIAL', components: ['PC1', 'PC2', 'PC3', 'Monografia1', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_ux', code: 'SW119', name: 'Principios de UX/UI', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_am', code: 'SW120', name: 'Desarrollo de Aplicaciones Móviles', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_aw', code: 'SW121', name: 'Desarrollo de Aplicaciones Web', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_iot', code: 'SW122', name: 'Internet de las Cosas y Nanocosas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_vj', code: 'SW123', name: 'Desarrollo de Videojuegos', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_i40', code: 'SW124', name: 'Industria 4.0 (blockchain, impresoras 3D...)', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_csh', code: 'SW125', name: 'Ciberseguridad y Hackeo Ético', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_gsti', code: 'SW126', name: 'Gestión de Servicios TI', credits: 2, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_mpds', code: 'SW127', name: 'Modelo del Proceso de Desarrollo de SW', credits: 3, formula_type: 'ESTANDAR_1_1_1', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_dab', code: 'SW128', name: 'Desarrollo de Aplicaciones Biométricas', credits: 3, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_sgeo', code: 'SW129', name: 'Sistemas Georeferenciales', credits: 2, formula_type: 'COMPUTACION_1_1_2', components: ['PC1', 'PC2', 'PC3', 'PC4', 'EP', 'EF', 'ES'] },
        { id: 'sw_el_tdo', code: 'SW130', name: 'Taller de Desarrollo y Operaciones Continuas', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
        { id: 'sw_el_tds', code: 'SW132', name: 'Taller de Desarrollo Seguro', credits: 2, formula_type: 'SOLO_PC', components: ['PC1', 'PC2', 'PC3', 'PC4'] },
    ],
};

/* ============================================================
   Helper de búsqueda: encuentra un curso ya definido en otra
   carrera por su código, para reutilizarlo tal cual (misma
   referencia de objeto) en vez de volver a copiarlo. Si algún día
   se corrige la metodología de un curso compartido, se corrige en
   un solo lugar y se refleja automáticamente en todas las carreras
   que lo usan.
   Normaliza guiones y mayúsculas porque el mismo código a veces
   está escrito distinto entre carreras (ej. 'SI205' vs 'SI-205').
   ============================================================ */
function normalizarCodigo(code) {
    return code.replace(/-/g, '').toUpperCase();
}

function buscarCurso(registro, code) {
    const buscado = normalizarCodigo(code);
    for (const ciclo in registro) {
        const encontrado = (registro[ciclo] || []).find(c => normalizarCodigo(c.code) === buscado);
        if (encontrado) return encontrado;
    }
    console.warn(`buscarCurso: no se encontró "${code}" en el registro dado.`);
    return null;
}


/* ============================================================
   NOTA: el ensamblado de CURSOS_POR_CICLO ya NO va aquí.
   Ahora vive en cursos_db_2026.js, namespaceado por malla:
   CURSOS_POR_CICLO['2018'][carrera][ciclo] / ['2026'][carrera][ciclo].
   Este archivo (cursos_db_2018.js) solo define los objetos
   CURSOS_SISTEMAS / CURSOS_INDUSTRIAL / CURSOS_SOFTWARE de malla
   2018, tal como antes — no se toca su contenido.
   CURSOS_IA ya NO vive acá: se movió a cursos_db_2026.js, porque
   Ingeniería de Inteligencia Artificial es carrera nueva de la UNI
   (ciclo 26-1) y nunca tuvo malla 2018.
   ============================================================ */