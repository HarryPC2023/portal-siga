/* ============================================================
   BASE DE DATOS DE CURSOS — MALLA 2026 (por carrera y ciclo)

   Este archivo tiene la MISMA forma que cursos_db.js, pero para la
   malla 2026. Se carga DESPUÉS de cursos_db.js (necesita
   buscarCurso, CURSOS_SISTEMAS, CURSOS_SOFTWARE, etc. ya
   definidos) y ANTES de intranotas.js.

   Orden de <script> en la página de Intranotas:
     1. cursos_db.js       (malla 2018 — no se toca)
     2. cursos_db_2026.js  (este archivo)
     3. intranotas.js

   No lleva sufijo de carrera en el nombre (cursos_db_2026, no
   cursos_db_2026_sistemas) a propósito: sigue el mismo patrón que
   cursos_db.js, que agrupa las 4 carreras de malla 2018 en un solo
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
   Pendiente: la facultad todavía no publica el plan oficial (en
   evaluación, según Harry). Se deja el stub comentado para cuando
   llegue el PDF — misma mecánica que CURSOS_SISTEMAS_2026 arriba.
   ============================================================ */
// const CURSOS_INDUSTRIAL_2026 = { 1: [...], 2: [...], 3: [...], 4: [...] };

/* ============================================================
   INGENIERÍA DE SOFTWARE — MALLA 2026
   Pendiente: falta confirmar si existe plan oficial publicado.
   ============================================================ */
// const CURSOS_SOFTWARE_2026 = { 1: [...], 2: [...], 3: [...], 4: [...] };

/* ============================================================
   INGENIERÍA DE INTELIGENCIA ARTIFICIAL — MALLA 2026
   Pendiente: falta confirmar si existe plan oficial publicado.
   ============================================================ */
// const CURSOS_IA_2026 = { 1: [...], 2: [...], 3: [...], 4: [...] };

/* ============================================================
   ENSAMBLADO FINAL — reemplaza al CURSOS_POR_CICLO que estaba al
   final de cursos_db.js (ya se quitó de ahí, para no dejar dos
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
        ia: CURSOS_IA,
    },
    '2026': {
        sistemas: CURSOS_SISTEMAS_2026,
        // industrial: CURSOS_INDUSTRIAL_2026,   // agregar cuando exista
        // software: CURSOS_SOFTWARE_2026,       // agregar cuando exista
        // ia: CURSOS_IA_2026,                   // agregar cuando exista
    },
};