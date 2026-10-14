/* ════════════════════════════════════════════════════════════════════
   ASESORÍA PC1 — DISEÑO DE BASE DE DATOS
   Lógica de la página. Todo vive dentro de una función anónima: no crea
   variables globales, así que puede integrarse a SIGA sin choques.

   ÍNDICE
   01. Configuración y utilidades
   02. Navegación entre páginas y componentes (router)
   03. Avance de la ruta (barra superior)
   04. Mapa de arquitectura (se inserta desde <template>)
   05. Pestañas por sistema de ejemplo
   06. Revelar ❌ / ✅ y pines explicativos
   07. Checklist de Tips
   08. Ponte a prueba (práctica interactiva sin nota)
   09. Botón "volver arriba"
   10. Visor de imágenes (lightbox)
   11. Inicio
   12. Imprimir / guardar PDF
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.getElementById('asesoria-pc1');
  if (!root) return;

  /* ── 01. CONFIGURACIÓN Y UTILIDADES ──────────────────────────────── */
  var CONFIG = {
    // true  → la URL cambia (#componentes/kpis): funciona el botón "atrás" y los enlaces directos.
    // false → úsalo al integrar en SIGA si SIGA ya maneja su propia URL.
    useHash: true,
    storagePrefix: 'asesoria:dbd:2026-1:pc1:'
  };

  var PAGES = ['inicio', 'antes', 'concepto', 'arquitectura', 'componentes', 'defensa', 'tips'];
  var PAGE_LABELS = {
    inicio: 'Inicio',
    antes: 'Antes de empezar',
    concepto: 'Concepto',
    arquitectura: 'Arquitectura',
    componentes: 'Componentes',
    defensa: 'Ponte a prueba',
    tips: 'Tips'
  };

  // Un sistema de ejemplo = un color. Para agregar uno: súmalo aquí y en el CSS ([data-sys="xxx"]).
  var SYSTEMS = {
    cob: { name: 'Cobranzas', icon: '🔵' },
    ven: { name: 'Ventas', icon: '🟢' },
    tra: { name: 'Transporte', icon: '🟠' },
    con: { name: 'Contabilidad', icon: '🔴' },
    rec: { name: 'Reclamos', icon: '🟣' },
    alm: { name: 'Almacenamiento', icon: '📦' }
  };

  // Pasos de la ruta de estudio (barra de avance de la cabecera)
  var ROUTE_STEPS = [1, 2, 3, 4, 5];

  // Ponte a prueba: práctica sin nota. Una pregunta del profesor = un ejercicio FIJO con decisiones de 3 alternativas.
  //   ok:1 + explica        → la correcta y por qué
  //   err + msg + ver       → etiqueta del error, explicación y a dónde ir a repasar:
  //                           {comp:'protocolos'} abre un componente · {page:'concepto', anchor:'que-es'} abre una sección
  //   pista                 → 1.ª pista orienta; la 2.ª descarta una alternativa incorrecta
  // Las alternativas pueden ser texto o imagen (<span class="pp-img"><img ...></span>).
  // Solo se usan errores y criterios que ya se explican en esta asesoría.
  var IMG_LOGIN_MAL = '<span class="pp-img"><img src="imagenes/login_contabilidad.jpg" alt="Pantalla de inicio de sesión con selector de empresa, contraseña, botón Ingresar y enlaces para registrarse u olvidar la contraseña"></span>';
  var IMG_LOGIN_BIEN = '<span class="pp-img"><img src="imagenes/login_cobranza.png" alt="Pantalla de control de acceso con URL, DNI, contraseña, botón Ingresar, código QR y registro facial"></span>';
  var IMG_CAT_MAL = '<span class="pp-img"><img src="imagenes/catalogo_transporte.png" alt="Catálogo de Transporte que muestra solo una lista de registros"></span>';
  var IMG_CAT_BIEN = '<span class="pp-img"><img src="imagenes/catalogo_cobranza.png" alt="Catálogo de Servicios de Cobranzas con lista, detalle, campos y opciones de agregar, modificar y eliminar"></span>';

  var PRUEBA = [
    {
      id: 'protocolo', mod: 'ger', titulo: 'Protocolo',
      q: '¿Cómo definieron su protocolo y cómo funciona en su sistema?',
      bloques: [
        {
          chip: ['ger', 'Protocolos'], titulo: '¿Qué define un protocolo?',
          intro: 'Antes de elegir, piensa a qué componente corresponde cada idea.',
          ops: [
            { ok: 1, html: 'Las reglas y condiciones bajo las cuales el sistema ejecuta su proceso central.', explica: 'Un protocolo define qué acción tomar según el estado del caso.' },
            { html: 'Los datos base que el sistema necesita cargados antes de empezar a operar.', err: 'Confunde con catálogo', msg: 'Eso describe a los catálogos, no a un protocolo.', ver: { comp: 'catalogos' } },
            { html: 'El indicador que mide qué tan bien funciona el sistema frente a una meta.', err: 'Confunde con KPI', msg: 'Eso es un KPI, no un protocolo.', ver: { comp: 'kpis' } }
          ],
          pista: 'La asesoría lo resume con dos palabras: reglas y condiciones.'
        },
        {
          chip: ['ger', 'Protocolos'], titulo: 'Tu protocolo organiza el proceso en etapas. ¿Qué lo convierte en un protocolo y no en una simple lista de pasos?',
          ops: [
            { ok: 1, html: 'Cada etapa se alcanza solo cuando se cumplió la anterior, y una condición define cuándo se pasa a la siguiente.', explica: 'Es un escalamiento: no se salta ni se invierte el orden. Por ejemplo, en Transporte el servicio avanza solo cuando el pago es confirmado.' },
            { html: 'Las etapas pueden hacerse en cualquier orden, según lo que decida el usuario.', err: 'Orden ignorado', msg: 'En un protocolo cada etapa depende de la anterior.', ver: { comp: 'protocolos' } },
            { html: 'Basta con nombrar las etapas en orden, sin decir qué hace pasar de una a otra.', err: 'Sin condiciones definidas', msg: 'Es el primer error frecuente de los protocolos: ¿cuándo cambia de etapa?', ver: { comp: 'protocolos' } }
          ],
          pista: 'Piensa en una escalera: no llegas al tercer escalón sin pasar por el segundo. ¿Y quién decide cuándo subes?'
        },
        {
          chip: ['ger', 'Protocolos'], titulo: 'Un protocolo con etapas y condiciones claras aparece en una pantalla suelta, sin relación con el proceso central. ¿Cuál es el problema?',
          ops: [
            { ok: 1, html: 'Está desconectado del proceso central: debe verse la conexión entre ambos.', explica: 'Es uno de los tres errores frecuentes que señala la asesoría.' },
            { html: 'Falta el historial de cambios.', err: 'Otro error, no el de este caso', msg: 'El caso ya tiene etapas y condiciones; lo que falla es la conexión.', ver: { comp: 'protocolos' } },
            { html: 'El protocolo debería vivir solo en BATCH y no en la parte gerencial.', err: 'Confunde dónde vive', msg: 'Según la arquitectura, el protocolo está en ON-LINE · Gerencial y también en BATCH · Aplicativo.', ver: { page: 'arquitectura' } }
          ],
          pista: 'Mira qué elementos sí tiene el caso y cuál de los tres errores frecuentes queda.'
        }
      ],
      solucion: '<p>Un protocolo define las reglas y condiciones bajo las cuales el sistema ejecuta su proceso central. Organiza el proceso en etapas que se alcanzan en orden (escalamiento): cada una exige la anterior y una condición decide cuándo se pasa a la siguiente. Un protocolo bien diseñado muestra las etapas, las condiciones que activan cada una, el historial de cambios (fecha y motivo) y su conexión clara con el proceso central.</p>',
      llevate: 'Al defender tu protocolo, explica qué condición hace pasar un caso de una etapa a la siguiente y cómo se conecta con el proceso central.'
    },
    {
      id: 'accesos', mod: 'seg', titulo: 'Control de accesos',
      q: 'Explícame el control de accesos. ¿Qué puede hacer el perfil [X] y por qué tiene acceso a esos módulos?',
      bloques: [
        {
          chip: ['seg', 'Control de acceso'], titulo: 'Diseñaste una pantalla de ingreso completa (usuario, contraseña y un método adicional). ¿Con eso queda cubierto el control de accesos?',
          ops: [
            { ok: 1, html: 'No: el login controla quién entra; los perfiles controlan qué puede hacer cada usuario. Son dos pantallas distintas.', explica: 'Diseñar solo el login es un error frecuente.' },
            { html: 'Sí: quien logra ingresar ya queda autorizado a todos los módulos.', err: 'Un solo control', msg: 'Entrar no decide qué puede hacer cada usuario.', ver: { comp: 'perfiles' } },
            { html: 'Sí, siempre que el método adicional sea muy seguro.', err: 'Seguridad mal entendida', msg: 'Más seguridad al ingresar no define qué módulos ve cada perfil.', ver: { comp: 'perfiles' } }
          ],
          pista: 'Pregúntate: ¿qué pasa después de entrar?'
        },
        {
          chip: ['seg', 'Login'], titulo: '¿Cuál pantalla de ingreso cumple el criterio del profesor?',
          ops: [
            { html: IMG_LOGIN_MAL, err: 'Le faltan elementos', msg: 'No tiene URL visible, nombre del sistema ni método adicional.', ver: { comp: 'login' } },
            { ok: 1, html: IMG_LOGIN_BIEN, explica: 'Tiene URL coherente, campos de acceso, botón y métodos adicionales (QR y registro facial).' },
            { html: 'Las dos sirven: con las credenciales de acceso ya basta.', err: 'Basta con las credenciales', msg: 'El profesor exige al menos un método adicional (QR, huella, reconocimiento facial, PIN…).', ver: { comp: 'login' } }
          ],
          pista: 'Cuenta qué elementos de la lista del profesor tiene cada pantalla.'
        },
        {
          chip: ['seg', 'Login'], titulo: 'El profesor te pregunta por qué elegiste QR (o reconocimiento facial). ¿Qué respuesta defiende mejor tu decisión?',
          ops: [
            { ok: 1, html: 'Da más seguridad que solo usuario y contraseña, y puedo explicar cómo funciona en mi sistema.', explica: 'El método adicional no es decorativo: el profesor preguntará por qué lo elegiste y cómo funciona.' },
            { html: 'Porque se ve más moderno y completo en la pantalla.', err: 'Método decorativo', msg: 'El método adicional no es decorativo.', ver: { comp: 'login' } },
            { html: 'Porque el profesor lo pide, así que no necesito explicar cómo funciona.', err: 'No sabe defenderlo', msg: 'Te preguntarán cómo funciona en tu sistema.', ver: { comp: 'login' } }
          ],
          pista: 'Piensa en lo que el profesor va a preguntar: por qué lo elegiste y cómo funciona.'
        },
        {
          chip: ['seg', 'Perfiles y permisos'], titulo: 'El profesor pide: «¿Qué puede hacer el perfil Gerente y por qué tiene acceso a esos módulos?». ¿Qué debe poder mostrar tu pantalla de perfiles?',
          ops: [
            { ok: 1, html: 'Los módulos a los que accede ese perfil y el detalle de sus permisos, con ejemplos propios de tu sistema.', explica: 'La asesoría pide módulos por perfil, detalle de permisos y ejemplos de los controles de acceso.' },
            { html: 'Solo la lista de perfiles con los botones de agregar, modificar y eliminar.', err: 'Lista sin permisos', msg: 'Falta mostrar qué módulos y parámetros internos tiene cada perfil.', ver: { comp: 'perfiles' } },
            { html: 'La pantalla de login con su método adicional.', err: 'Confunde login con perfiles', msg: 'Son dos pantallas distintas.', ver: { comp: 'perfiles' } }
          ],
          pista: 'Piensa en todo lo que el profesor necesita ver para saber qué hace ese perfil.'
        }
      ],
      solucion: '<p>El control de accesos tiene dos pantallas. El <strong>login</strong> controla quién entra: URL visible, nombre del sistema, usuario o DNI, contraseña, botón y al menos un método adicional que puedas defender. Los <strong>perfiles</strong> controlan qué puede hacer cada usuario: lista de perfiles, módulos accesibles, agregar, modificar y eliminar, y detalle de permisos con ejemplos de tu sistema.</p>',
      llevate: 'Defiende el método adicional con el «por qué» y el «cómo funciona», y para cada perfil explica qué módulos ve y por qué.'
    },
    {
      id: 'interfaz', mod: 'gen', titulo: '¿La interfaz funciona?',
      q: '¿Esta interfaz realmente funciona o está correctamente planteada para su sistema?',
      bloques: [
        {
          chip: ['gen', 'Diseño externo'], titulo: 'El profesor pregunta si tu interfaz «realmente funciona». Tu grupo solo tiene mockups, sin programar. ¿Cómo lo enfrentas?',
          ops: [
            { ok: 1, html: 'Explico que se evalúa la calidad del diseño externo: la pantalla está bien planteada, con datos representativos, flujos definidos y coherencia con la arquitectura.', explica: 'Implementar el sistema no garantiza mejor nota; lo que se evalúa es la calidad del diseño externo.' },
            { html: 'Muestro el código fuente de la pantalla para probar que funciona.', err: 'Código fuera del alcance', msg: 'El diseño externo no incluye código fuente ni programación.', ver: { page: 'concepto', anchor: 'que-es' } },
            { html: 'Prometo implementarlo para demostrarlo.', err: 'Implementación fuera del alcance', msg: 'Implementar el sistema no mejora la nota.', ver: { page: 'concepto', anchor: 'que-es' } }
          ],
          pista: 'Fíjate en qué incluye el diseño externo y qué no incluye.'
        },
        {
          chip: ['gen', 'Diseño externo'], titulo: '¿Qué espera ver el profesor en cada pantalla?',
          ops: [
            { ok: 1, html: 'Datos representativos, URL visible y coherente con el sistema, botones, menús y flujos definidos, y todos los componentes del módulo.', explica: 'Es la lista de «lo que se espera».' },
            { html: 'Cajas con la estructura de la pantalla; el contenido real se completa después.', err: 'Cajas vacías sin contenido real', msg: 'Es de lo que se considera insuficiente.', ver: { page: 'concepto', anchor: 'que-se-evalua' } },
            { html: 'Una sola pantalla muy detallada por módulo, aunque no haya navegación entre ellas.', err: 'Sin navegación ni componentes completos', msg: '«Solo una pantalla por módulo» y «sin navegación» también son insuficientes.', ver: { page: 'concepto', anchor: 'que-se-evalua' } }
          ],
          pista: 'Compara con la lista ❌ insuficiente: ¿cuál de esos errores aparece?'
        },
        {
          chip: ['gen', 'Diseño externo'], titulo: 'Tu pantalla muestra datos que no tienen relación con el sistema que diseñaste. ¿Cuál es el problema?',
          ops: [
            { ok: 1, html: 'Es insuficiente: los datos deben ser representativos y coherentes con el sistema y con la arquitectura presentada.', explica: '«Datos sin coherencia con el sistema» aparece como insuficiente.' },
            { html: 'Ninguno: el profesor evalúa solo lo visual, no los datos.', err: 'Solo importa lo visual', msg: 'El diseño visual incluye la coherencia entre arquitectura y diseño.', ver: { page: 'concepto', anchor: 'que-se-evalua' } },
            { html: 'Basta con corregir la URL; los datos pueden quedar así.', err: 'Corrección parcial', msg: 'La URL coherente es solo una parte de lo que se espera.', ver: { page: 'concepto', anchor: 'que-se-evalua' } }
          ],
          pista: 'Relee la lista ❌ insuficiente: ¿qué dice sobre los datos?'
        }
      ],
      solucion: '<p>Una interfaz «funciona» en la PC1 cuando está bien planteada: datos representativos y coherentes con el sistema, URL visible, botones, menús y flujos definidos, todos los componentes del módulo y coherencia con la arquitectura. No se evalúa código ni implementación.</p>',
      llevate: 'Antes de exponer, revisa cada pantalla con la lista de «lo que se espera».'
    },
    {
      id: 'catalogo', mod: 'ope', titulo: 'Catálogo y proceso central',
      q: 'Explícame cómo funciona el catálogo y el proceso principal de su sistema.',
      bloques: [
        {
          chip: ['ger', 'Catálogos'], titulo: '¿Cómo identificas cuáles son los catálogos de tu sistema?',
          ops: [
            { ok: 1, html: 'Preguntándome qué datos necesito tener cargados antes de que el sistema empiece a operar.', explica: 'Esos datos son tus catálogos.' },
            { html: 'Son las pantallas donde se muestran los resultados del sistema.', err: 'Confunde con consultas y reportes', msg: 'Los catálogos son datos base, no resultados.', ver: { comp: 'catalogos' } },
            { html: 'Son los pasos del flujo del proceso principal.', err: 'Confunde con el proceso central', msg: 'El proceso central es el flujo para el que existe el sistema; los catálogos son los datos que necesita para operar.', ver: { comp: 'catalogos' } }
          ],
          pista: 'Piensa en lo que el sistema necesita ya cargado antes de empezar a operar.'
        },
        {
          chip: ['ger', 'Catálogos'], titulo: '¿Cuál catálogo está bien diseñado?',
          ops: [
            { html: IMG_CAT_MAL, err: 'Solo lista, sin detalle', msg: 'No muestra vista de detalle ni estados de edición.', ver: { comp: 'catalogos' } },
            { ok: 1, html: IMG_CAT_BIEN, explica: 'Tiene lista, detalle, campos completos y opciones de agregar, modificar y eliminar visibles.' },
            { html: 'Los dos sirven: ambos muestran una lista de registros.', err: 'Basta con la lista', msg: 'Un catálogo siempre permite ver la lista, agregar, modificar, eliminar, buscar y ver el detalle.', ver: { comp: 'catalogos' } }
          ],
          pista: 'Cuenta cuántas de las 6 acciones de un catálogo permite cada pantalla.'
        },
        {
          chip: ['ope', 'Proceso central'], titulo: '¿Qué debe mostrar el proceso central?',
          ops: [
            { ok: 1, html: 'El flujo completo paso a paso, con pantallas intermedias, confirmaciones y conexión visible con los catálogos.', explica: 'Es lo que debe mostrar el proceso central según tu asesoría.' },
            { html: 'Solo la pantalla inicial del proceso, muy bien detallada.', err: 'Sin el flujo completo', msg: 'Es el primer error frecuente del proceso central.', ver: { comp: 'proceso' } },
            { html: 'El flujo completo, pero sin confirmaciones ni mensajes de éxito o error.', err: 'Sin confirmaciones', msg: 'Es otro error frecuente: faltan los mensajes de estado.', ver: { comp: 'proceso' } }
          ],
          pista: 'Compara con la lista de errores frecuentes del proceso central.'
        },
        {
          chip: ['ope', 'Proceso central'], titulo: 'Tu proceso central usa datos (por ejemplo, tipos de servicio) que no aparecen en ningún catálogo de tu sistema. ¿Cuál es el problema?',
          ops: [
            { ok: 1, html: 'Está desconectado de los catálogos: debe verse la conexión, porque sin catálogos el proceso principal no puede funcionar.', explica: 'Es el tercer error frecuente del proceso central.' },
            { html: 'Ninguno: el proceso puede tener sus propios datos, independientes de los catálogos.', err: 'Proceso independiente', msg: 'Sin catálogos el proceso principal no puede funcionar.', ver: { comp: 'catalogos' } },
            { html: 'Que faltan las confirmaciones del flujo.', err: 'Otro error, no el de este caso', msg: 'El problema aquí es la conexión con los catálogos.', ver: { comp: 'proceso' } }
          ],
          pista: 'Pregúntate: ¿de dónde salen los datos que usa el proceso?'
        }
      ],
      solucion: '<p>Los catálogos son los datos base que el sistema necesita cargados antes de operar; siempre permiten ver la lista, agregar, modificar, eliminar, buscar y ver el detalle, y se diseñan con sus estados (vacío, agregar, con datos y edición). El proceso central es el motivo por el que existe el sistema y muestra el flujo completo paso a paso, con pantallas intermedias, confirmaciones y conexión visible con los catálogos.</p>',
      llevate: 'Al explicar un catálogo, muestra la lista, el detalle y las acciones; al explicar el proceso, recorre el flujo completo y señala qué catálogos usa.'
    },
    {
      id: 'kpi', mod: 'apl', titulo: 'KPI',
      q: '¿Para qué sirve este KPI o gráfica en su sistema? ¿Cómo se calcula?',
      bloques: [
        {
          chip: ['apl', 'BATCH → ON-LINE'], titulo: '¿Dónde vive el KPI?',
          ops: [
            { ok: 1, html: 'Se calcula en BATCH (Estadísticas) y se visualiza en ON-LINE (Consultas › KPIs).', explica: 'En la parte gerencial solo se entra a ver el resultado.' },
            { html: 'Se calcula y se visualiza en ON-LINE, cada vez que el usuario entra.', err: 'Cálculo en el lugar equivocado', msg: 'El cálculo ocurre en BATCH.', ver: { comp: 'kpis' } },
            { html: 'Se calcula y se visualiza en BATCH; el gerente lo consulta allí.', err: 'Visualización en el lugar equivocado', msg: 'El gerente lo ve en ON-LINE (Consultas › KPIs).', ver: { comp: 'kpis' } }
          ],
          pista: 'Uno de los dos lados calcula y el otro solo muestra el resultado.'
        },
        {
          chip: ['ger', 'KPIs'], titulo: 'Para responder «¿cómo se calcula y quién es responsable?», ¿qué debe incluir tu KPI?',
          ops: [
            { ok: 1, html: 'Nombre, fórmula, unidad de medida, valor actual, valor meta, período, fuente de los datos y responsable del análisis.', explica: 'Es la lista de un KPI bien diseñado.' },
            { html: 'Solo el nombre y el valor actual.', err: 'Un número sin contexto', msg: 'Un KPI es un número con contexto, no solo un número.', ver: { comp: 'kpis' } },
            { html: 'Nombre, valor actual y un gráfico; la fórmula y el responsable se explican de palabra.', err: 'Faltan fórmula y responsable', msg: 'Deben estar definidos en el propio KPI.', ver: { comp: 'kpis' } }
          ],
          pista: 'El profesor pregunta por la fórmula y por el responsable: ¿dónde deberían estar?'
        },
        {
          chip: ['ger', 'KPI vs. gráfica'], titulo: 'El profesor pregunta en qué se diferencia un KPI de una gráfica. ¿Qué respondes?',
          ops: [
            { ok: 1, html: 'El KPI muestra un valor puntual con su meta; la gráfica muestra una tendencia o distribución visual.', explica: 'Por ejemplo: «tasa de respuesta 72% (meta 80%)» frente a «evolución de la tasa en 6 meses».' },
            { html: 'Son lo mismo: la gráfica es un KPI con colores.', err: 'Los confunde', msg: 'Cumplen funciones distintas: un valor con meta frente a una tendencia.', ver: { comp: 'graficas' } },
            { html: 'El KPI muestra la tendencia en el tiempo y la gráfica un valor puntual.', err: 'Invertido', msg: 'Es al revés: el KPI es el valor puntual con meta; la gráfica, la tendencia.', ver: { comp: 'graficas' } }
          ],
          pista: 'Piensa en un valor con su meta frente a una línea de tiempo.'
        }
      ],
      solucion: '<p>Un KPI es un número con contexto: mide qué tan bien funciona el sistema respecto a un objetivo. Incluye nombre, fórmula, unidad, valor actual, meta, período, fuente de datos y responsable. Se calcula en BATCH (Estadísticas) y se visualiza en ON-LINE (Consultas › KPIs). El KPI muestra un valor puntual con meta; la gráfica, una tendencia o distribución.</p>',
      llevate: 'Para defender un KPI explica para qué sirve, cómo se calcula (fórmula y fuente) y quién lo analiza.'
    }
  ];

  function $(sel, ctx) { return (ctx || root).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

  // localStorage puede no estar disponible: todo va protegido
  var store = {
    get: function (key, fallback) {
      try {
        var v = window.localStorage.getItem(CONFIG.storagePrefix + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(CONFIG.storagePrefix + key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  var state = {
    page: 'inicio',
    comp: null,
    system: store.get('system', 'cob'),
    visitedSteps: store.get('steps', [])
  };
  if (!SYSTEMS[state.system]) state.system = 'cob';

  /* ── 02. NAVEGACIÓN ENTRE PÁGINAS Y COMPONENTES ──────────────────── */
  var suppressHash = false;

  function setHash(hash) {
    if (!CONFIG.useHash) return;
    if (window.location.hash !== '#' + hash) {
      suppressHash = true;
      window.location.hash = hash;
    }
  }

  function scrollToTop() {
    var y = root.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  function go(page, opts) {
    opts = opts || {};
    if (PAGES.indexOf(page) === -1) page = 'inicio';
    state.page = page;

    $$('.page').forEach(function (p) { p.classList.toggle('active', p.dataset.page === page); });
    $$('.ap-nav-btn').forEach(function (b) { b.classList.toggle('active', b.dataset.go === page); });

    if (page === 'componentes') showComp(opts.comp || null); else state.comp = null;

    markStepsForPage(page);
    refreshTabs();

    if (opts.updateHash !== false) setHash(page + (state.comp ? '/' + state.comp : ''));

    if (opts.anchor) {
      var el = document.getElementById(opts.anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (opts.anchor === 'que-se-evalua') markStep(2);
        return;
      }
    }
    if (opts.scroll !== false) scrollToTop();
  }

  function showComp(id) {
    var panel = $('#comp-grid-panel');
    $$('.comp-detail').forEach(function (d) { d.classList.remove('active'); });
    var detail = id ? document.getElementById('detail-' + id) : null;
    if (!detail) {
      state.comp = null;
      if (panel) panel.hidden = false;
      return;
    }
    state.comp = id;
    if (panel) panel.hidden = true;
    detail.classList.add('active');
    refreshTabs();
  }

  function routeFromHash() {
    var raw = (window.location.hash || '').replace('#', '');
    if (!raw) return go('inicio', { updateHash: false, scroll: false });
    var parts = raw.split('/');
    go(parts[0], { comp: parts[1] || null, updateHash: false, scroll: false });
  }

  window.addEventListener('hashchange', function () {
    if (!CONFIG.useHash) return;
    if (suppressHash) { suppressHash = false; return; }
    routeFromHash();
    scrollToTop();
  });

  // Navegación inferior de cada página (Anterior / Siguiente)
  function buildPagers() {
    $$('[data-pager]').forEach(function (nav) {
      var page = nav.closest('.page').dataset.page;
      var i = PAGES.indexOf(page);
      var html = '';
      if (i > 0) {
        html += '<button class="btn btn-nav" data-go="' + PAGES[i - 1] + '">← <span><small>Anterior</small>' +
          PAGE_LABELS[PAGES[i - 1]] + '</span></button>';
      }
      if (i < PAGES.length - 1) {
        html += '<button class="btn btn-nav next" data-go="' + PAGES[i + 1] + '"><span><small>Siguiente</small>' +
          PAGE_LABELS[PAGES[i + 1]] + '</span> →</button>';
      }
      nav.innerHTML = html;
    });
  }

  // Navegación inferior de cada componente (Anterior / Siguiente / Volver al listado)
  function buildCompPagers() {
    var cards = $$('.comp-card[data-comp]');
    var ids = cards.map(function (c) { return c.dataset.comp; });
    var names = {};
    cards.forEach(function (c) { names[c.dataset.comp] = c.querySelector('.comp-name').textContent; });

    $$('.comp-detail').forEach(function (detail) {
      var id = detail.id.replace('detail-', '');
      var i = ids.indexOf(id);
      var foot = detail.querySelector('.comp-pager');
      if (!foot || i === -1) return;
      var html = '';
      html += i > 0
        ? '<button class="btn btn-nav" data-comp="' + ids[i - 1] + '">← <span><small>Anterior</small>' + names[ids[i - 1]] + '</span></button>'
        : '<span></span>';
      html += '<button class="btn btn-back" data-comp-grid type="button">☰ Volver al listado</button>';
      html += i < ids.length - 1
        ? '<button class="btn btn-nav next" data-comp="' + ids[i + 1] + '"><span><small>Siguiente</small>' + names[ids[i + 1]] + '</span> →</button>'
        : '<button class="btn btn-nav next" data-go="defensa"><span><small>Siguiente</small>Ponte a prueba</span> →</button>';
      foot.innerHTML = html;

      // Botón "Volver al listado" también ARRIBA (queda pegado al borde al hacer scroll)
      if (!detail.querySelector('.comp-topbar')) {
        var top = document.createElement('div');
        top.className = 'comp-topbar no-print';
        top.innerHTML = '<button class="btn btn-back" data-comp-grid type="button">☰ Volver al listado</button>';
        detail.insertBefore(top, detail.firstChild);
      }
    });
  }

  /* ── 02b. CABECERA QUE SE ESCONDE AL BAJAR Y REAPARECE AL SUBIR ───── */
  function initHeaderAutoHide() {
    var header = $('.ap-header');
    if (!header) return;
    var lastY = window.pageYOffset;
    var ticking = false;

    function setHeaderHeight() {
      root.style.setProperty('--ap-header-h', header.offsetHeight + 'px');
    }
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);

    function update() {
      ticking = false;
      var y = window.pageYOffset;
      var menu = header.querySelector('.ap-print-menu');
      var menuOpen = menu && !menu.hidden;
      var goingDown = y > lastY + 6;
      var goingUp = y < lastY - 6;
      if (y < 80 || goingUp || menuOpen) {
        root.classList.remove('ap-header-hidden');
      } else if (goingDown) {
        root.classList.add('ap-header-hidden');
      }
      if (goingDown || goingUp) lastY = y;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ── 03. AVANCE DE LA RUTA ───────────────────────────────────────── */
  function markStep(n) {
    if (state.visitedSteps.indexOf(n) !== -1) return;
    state.visitedSteps.push(n);
    store.set('steps', state.visitedSteps);
    renderProgress();
  }

  function markStepsForPage(page) {
    if (page === 'concepto') markStep(1);
    if (page === 'arquitectura') markStep(3);
    if (page === 'componentes') markStep(4);
    if (page === 'defensa') markStep(5);
  }

  function renderProgress() {
    var pct = Math.round(state.visitedSteps.length / ROUTE_STEPS.length * 100);
    var fill = $('.ap-progress-fill');
    var label = $('#ap-progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = 'Ruta ' + pct + '%';
    $$('.route-step').forEach(function (s) {
      s.classList.toggle('done', state.visitedSteps.indexOf(Number(s.dataset.step)) !== -1);
    });
  }

  // El paso 2 ("Qué se evalúa") se marca al leer esa sección
  function watchEvaluationSection() {
    var target = document.getElementById('que-se-evalua');
    if (!target || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) markStep(2); });
    }, { threshold: 0.3 });
    io.observe(target);
  }

  /* ── 04. MAPA DE ARQUITECTURA ────────────────────────────────────── */
  function injectMaps() {
    var tpl = document.getElementById('tpl-mapa');
    if (!tpl) return;
    $$('[data-mapa]').forEach(function (slot) {
      slot.appendChild(tpl.content.cloneNode(true));
    });
  }

  /* ── 05. PESTAÑAS POR SISTEMA ────────────────────────────────────── */
  function buildTabNav(tabs) {
    var nav = tabs.querySelector('.sys-tabs-nav');
    if (!nav || nav.children.length) return;
    $$('.sys-tab-pane', tabs).forEach(function (pane) {
      var sys = pane.dataset.sys;
      if (!SYSTEMS[sys]) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sys-tab-btn';
      btn.dataset.sys = sys;
      btn.textContent = SYSTEMS[sys].name;
      btn.addEventListener('click', function () { setSystem(sys); });
      nav.appendChild(btn);
    });
  }

  function activateTab(tabs) {
    var panes = $$('.sys-tab-pane', tabs);
    var available = panes.map(function (p) { return p.dataset.sys; });
    var target = available.indexOf(state.system) !== -1 ? state.system : available[0];
    panes.forEach(function (p) { p.classList.toggle('active', p.dataset.sys === target); });
    $$('.sys-tab-btn', tabs).forEach(function (b) { b.classList.toggle('active', b.dataset.sys === target); });
  }

  function refreshTabs() {
    $$('.sys-tabs').forEach(function (tabs) { buildTabNav(tabs); activateTab(tabs); });
    $$('.sys-chip').forEach(function (c) { c.classList.toggle('active', c.dataset.sys === state.system); });
  }

  // Elegir un sistema lo cambia en TODAS las pestañas de la asesoría
  function setSystem(sys) {
    if (!SYSTEMS[sys]) return;
    state.system = sys;
    store.set('system', sys);
    refreshTabs();
  }

  /* ── 06. REVELAR ❌/✅ Y PINES ───────────────────────────────────── */
  function reveal(btn) {
    var box = btn.closest('.reveal');
    var good = box && box.querySelector('.reveal-good');
    if (good) good.classList.add('shown');
    btn.hidden = true;
  }

  function togglePin(el) {
    var figure = el.closest('.pin-figure');
    if (!figure) return;
    var id = el.dataset.pin;
    var wasActive = el.classList.contains('active');
    $$('.pin, .pin-item', figure).forEach(function (n) { n.classList.remove('active'); });
    if (!wasActive) {
      $$('[data-pin="' + id + '"]', figure).forEach(function (n) { n.classList.add('active'); });
    }
  }

  /* ── 07. CHECKLIST ───────────────────────────────────────────────── */
  function initChecklist() {
    var items = $$('.check-item');
    if (!items.length) return;
    var done = store.get('checklist', []);
    items.forEach(function (it, i) {
      it.tabIndex = 0;
      it.setAttribute('role', 'checkbox');
      if (done.indexOf(i) !== -1) setCheck(it, true);
      var toggle = function () {
        setCheck(it, !it.classList.contains('done'));
        saveChecklist();
      };
      it.addEventListener('click', toggle);
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
    updateChecklist();
  }

  function setCheck(el, on) {
    el.classList.toggle('done', on);
    el.setAttribute('aria-checked', on ? 'true' : 'false');
    el.querySelector('.check-box').textContent = on ? '✓' : '';
  }

  function saveChecklist() {
    var done = [];
    $$('.check-item').forEach(function (it, i) { if (it.classList.contains('done')) done.push(i); });
    store.set('checklist', done);
    updateChecklist();
  }

  function updateChecklist() {
    var items = $$('.check-item');
    var done = items.filter(function (i) { return i.classList.contains('done'); }).length;
    var pct = items.length ? Math.round(done / items.length * 100) : 0;
    var bar = $('#progress-bar');
    var label = $('#progress-label');
    var party = $('#celebrate');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = done + ' / ' + items.length + ' completados';
    if (party) party.classList.toggle('show', items.length > 0 && done === items.length);
  }

  /* ── 08. PONTE A PRUEBA ──────────────────────────────────────────────
     Práctica sin nota. Eliges la respuesta que defenderías (texto o imagen):
       · Si fallas: «No es la mejor opción» + explicación + enlace «Ver dónde se explicó».
       · Segundo fallo: te muestra la correcta y la decisión queda «con ayuda».
       · «No sé cuál elegir»: la pista 1 orienta; la 2 descarta una alternativa.
       · Si aciertas: aparece «Continuar».
     El registro es privado (se guarda en este navegador) y no tiene puntajes.
     Al imprimir, esta sección se reemplaza por un solucionario (#prueba-print). */
  var prueba = (function () {
    var el, printEl, ex = null;
    var LETRAS = ['A', 'B', 'C'];

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    // Lleva a un componente ({comp}) o a una sección ({page, anchor}) de la asesoría
    function irA(v) {
      if (!v) return;
      if (v.comp) go('componentes', { comp: v.comp });
      else go(v.page || 'componentes', { anchor: v.anchor });
    }

    function regUpd(qid, fn) {
      var r = store.get('prueba', {});
      r[qid] = r[qid] || { b: 0, p: 0, a: 0, e: {} };
      fn(r[qid]);
      store.set('prueba', r);
    }

    function chip(c) {
      return '<span class="pp-chip" data-mod="' + c[0] + '">' + esc(c[1]) + '</span>';
    }

    /* — Menú: una tarjeta por pregunta del profesor — */
    function menu() {
      ex = null;
      var h = '<h2 class="pp-h2">¿Qué quieres practicar?</h2><div class="pp-grid">';
      PRUEBA.forEach(function (q, i) {
        h += '<button class="pp-card" type="button" data-mod="' + q.mod + '" data-pp="start" data-q="' + i + '">' +
          '<span class="pp-num">' + (i + 1) + '</span>' +
          '<span class="pp-card-t">' + esc(q.titulo) + '</span>' +
          '<span class="pp-card-q">“' + esc(q.q) + '”</span>' +
          '<span class="pp-card-m">' + q.bloques.length + ' decisiones</span>' +
          '<span class="pp-card-go">Empezar →</span></button>';
      });
      el.innerHTML = h + '</div>' + registro();
    }

    function registro() {
      var r = store.get('prueba', {}), h = '', any = false;
      PRUEBA.forEach(function (q) {
        var x = r[q.id];
        if (!x || !x.b) return;
        any = true;
        h += '<p><strong>' + esc(q.titulo) + '</strong> · ' + x.b + ' decisiones · ' + x.p + ' al primer intento · ' + x.a + ' con ayuda</p>';
        var errs = Object.keys(x.e || {});
        if (errs.length) {
          h += '<ul>';
          errs.forEach(function (k) {
            h += '<li>' + esc(k) + ' (' + x.e[k].n + ')' +
              (x.e[k].ver ? ' <button class="pp-ver" type="button" data-pp="regver" data-id="' + q.id + '" data-e="' + esc(k) + '">Ver dónde se explicó</button>' : '') + '</li>';
          });
          h += '</ul>';
        }
      });
      return '<div class="pp-reg"><h3>Tu registro privado <small>(sin puntajes)</small></h3>' +
        (any ? h + '<button class="pp-btn sec" type="button" data-pp="clear">Borrar mi registro</button>'
          : '<p class="muted">Aún no hay práctica registrada. Elige una pregunta cuando quieras.</p>') + '</div>';
    }

    /* — Ejercicio — */
    function start(qi) {
      ex = { qi: qi, i: 0, res: [] };
      pintar();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function barra(q) {
      var dots = '';
      q.bloques.forEach(function (_, i) {
        var c = ex.res[i] === 'p' ? ' hecho' : ex.res[i] === 'a' ? ' ayuda' : (i === ex.i ? ' act' : '');
        dots += '<span class="pp-dot' + c + '">' + (i + 1) + '</span>';
      });
      return '<div class="pp-bar" data-mod="' + q.mod + '"><button class="pp-back" type="button" data-pp="menu">← Elegir otra pregunta</button>' +
        '<span class="pp-bar-t">' + esc(q.titulo) + '</span><span class="pp-dots" role="img" aria-label="Progreso de la pregunta">' + dots + '</span></div>' +
        '<div class="pp-prof" data-mod="' + q.mod + '"><span class="pp-prof-l">🎤 Pregunta del profesor</span><p>“' + esc(q.q) + '”</p></div>';
    }

    function pintar() {
      var q = PRUEBA[ex.qi];
      if (ex.i >= q.bloques.length) return final(q);
      var b = q.bloques[ex.i];
      ex.st = { fails: 0, hint: false, nivel: 0, done: false, ops: shuffle(b.ops) };
      var alts = '';
      ex.st.ops.forEach(function (o, k) {
        alts += '<button class="pp-alt ' + LETRAS[k] + '" type="button" data-pp="alt" data-k="' + k + '"><span class="pp-L">' + LETRAS[k] +
          '</span><span class="pp-alt-b">' + o.html + '</span></button>';
      });
      el.innerHTML = barra(q) +
        '<div class="pp-dec" data-mod="' + q.mod + '">' + chip(b.chip) + '<h3>' + esc(b.titulo) + '</h3>' +
        (b.intro ? '<p class="pp-intro">' + b.intro + '</p>' : '') +
        '<div class="pp-alts">' + alts + '</div>' +
        '<div class="pp-fb" aria-live="polite"></div>' +
        '<div class="pp-actions"><button class="pp-hint" type="button" data-pp="hint">💡 No sé cuál elegir</button>' +
        '<button class="pp-btn go pp-cont" type="button" data-pp="next" hidden>Continuar →</button></div></div>';
    }

    function fb(tipo, html) {
      var f = $('.pp-fb', el);
      f.className = 'pp-fb ' + tipo;
      f.innerHTML = html;
    }

    function fin(res) {
      var q = PRUEBA[ex.qi], st = ex.st;
      st.done = true;
      ex.res[ex.i] = res;
      $$('.pp-alt', el).forEach(function (a) { a.disabled = true; });
      $('.pp-hint', el).hidden = true;
      var c = $('.pp-cont', el); c.hidden = false; c.focus();
      regUpd(q.id, function (r) { r.b++; if (res === 'p') r.p++; else r.a++; });
    }

    function elegir(k) {
      var q = PRUEBA[ex.qi], st = ex.st;
      if (st.done) return;
      var btn = $$('.pp-alt', el)[k], o = st.ops[k];
      if (!btn || btn.disabled) return;
      if (o.ok) {
        btn.classList.add('good');
        var res = (st.fails === 0 && !st.hint) ? 'p' : 'a';
        fb('ok', '<strong class="pp-fbt">Correcto</strong><p>' + o.explica + '</p>' +
          (res === 'a' ? '<p>Esta decisión queda anotada como «con ayuda».</p>' : ''));
        fin(res);
        return;
      }
      st.fails++;
      btn.classList.add('bad');
      btn.disabled = true;
      regUpd(q.id, function (r) {
        var e = r.e[o.err] = r.e[o.err] || { n: 0 };
        e.n++; e.ver = o.ver || null;
      });
      var etq = '<span class="pp-etq">' + esc(o.err) + '</span>';
      var ver = o.ver ? ' <button class="pp-ver" type="button" data-pp="ver" data-k="' + k + '">Ver dónde se explicó</button>' : '';
      if (st.fails === 1) {
        btn.classList.add('dim');
        fb('bad', '<strong class="pp-fbt">No es la mejor opción</strong>' + etq + '<p>' + o.msg + ver + '</p><p>Puedes intentarlo otra vez.</p>');
      } else {
        var ok = st.ops.filter(function (x) { return x.ok; })[0];
        $$('.pp-alt', el)[st.ops.indexOf(ok)].classList.add('good');
        fb('bad', '<strong class="pp-fbt">Tampoco</strong>' + etq + '<p>' + o.msg + ver + '</p>' +
          '<p><strong>Te muestro la opción correcta:</strong> ' + ok.explica + '</p><p>Esta decisión queda anotada como «con ayuda».</p>');
        fin('a');
      }
    }

    // Pista 1: orienta. Pista 2: descarta una alternativa incorrecta y ofrece ir a la explicación.
    function pista() {
      var st = ex.st, b = PRUEBA[ex.qi].bloques[ex.i];
      if (st.done) return;
      st.hint = true; st.nivel++;
      var hb = $('.pp-hint', el);
      if (st.nivel === 1) {
        fb('hint', '<strong class="pp-fbt">Pista</strong><p>' + esc(b.pista || 'Piensa qué criterio debe cumplir la decisión.') + '</p><p>Pedir una pista cuenta como ayuda en tu registro.</p>');
        hb.textContent = '💡 Otra pista';
        return;
      }
      var btns = $$('.pp-alt', el);
      var malas = btns.filter(function (x, i) { return !x.disabled && !st.ops[i].ok; });
      if (malas.length > 1) { malas[0].classList.add('dim'); malas[0].disabled = true; }
      var dest = b.ops.filter(function (o) { return o.ver; })[0];
      fb('hint', '<strong class="pp-fbt">Descarté una alternativa</strong><p>' + (malas.length > 1 ? 'Quedan dos. ' : 'Ya solo quedan dos alternativas. ') +
        'Si lo prefieres, repasa la explicación.' + (dest ? ' <button class="pp-ver" type="button" data-pp="verhint">Ver dónde se explicó</button>' : '') + '</p>');
      hb.hidden = true;
    }

    function final(q) {
      el.innerHTML = barra(q) +
        '<div class="pp-sol"><h3>Solución completa</h3>' + q.solucion +
        (q.llevate ? '<h3 class="pp-sol-2">Lo que debes llevarte</h3><p>' + q.llevate + '</p>' : '') + '</div>' +
        '<div class="pp-actions"><button class="pp-btn sec" type="button" data-pp="repeat">Repetir este mismo</button>' +
        '<button class="pp-btn sec" type="button" data-pp="menu">Elegir otra pregunta</button>' +
        '<button class="pp-btn go" type="button" data-pp="finish">Terminar por hoy</button></div>';
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Solucionario para imprimir: la sección interactiva no se imprime
    function buildPrint() {
      var h = '<h2 class="pp-print-h">Solucionario de Ponte a prueba</h2>';
      PRUEBA.forEach(function (q, i) {
        h += '<div class="pp-pq"><h3>' + (i + 1) + '. ' + esc(q.titulo) + '</h3><p class="pp-pq-q">“' + esc(q.q) + '”</p>';
        q.bloques.forEach(function (b) {
          var ok = b.ops.filter(function (o) { return o.ok; })[0];
          h += '<div class="pp-pb"><p><strong>' + esc(b.titulo) + '</strong></p><div class="pp-pb-r">' + ok.html + '<p>' + ok.explica + '</p></div></div>';
        });
        h += '<div class="pp-sol">' + q.solucion + (q.llevate ? '<p><strong>Lo que debes llevarte:</strong> ' + q.llevate + '</p>' : '') + '</div></div>';
      });
      printEl.innerHTML = h;
    }

    function onClick(e) {
      var t = e.target.closest('[data-pp]');
      if (!t || !el.contains(t)) return;
      var a = t.dataset.pp;
      if (a === 'start') start(+t.dataset.q);
      else if (a === 'menu') { menu(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else if (a === 'alt') elegir(+t.dataset.k);
      else if (a === 'hint') pista();
      else if (a === 'next') { ex.i++; pintar(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else if (a === 'repeat') start(ex.qi);
      else if (a === 'finish') go('inicio');
      else if (a === 'ver') irA(ex.st.ops[+t.dataset.k].ver);
      else if (a === 'verhint') irA((PRUEBA[ex.qi].bloques[ex.i].ops.filter(function (o) { return o.ver; })[0] || {}).ver);
      else if (a === 'regver') {
        var x = (store.get('prueba', {})[t.dataset.id] || { e: {} }).e[t.dataset.e];
        if (x) irA(x.ver);
      } else if (a === 'clear') { store.set('prueba', {}); menu(); }
    }

    function init() {
      el = $('#prueba');
      printEl = $('#prueba-print');
      if (!el) return;
      menu();
      if (printEl) buildPrint();
      el.addEventListener('click', onClick);
    }

    return { init: init };
  })();

  /* ── 09. VOLVER ARRIBA ───────────────────────────────────────────── */
  function initScrollTop() {
    var btn = $('.scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.pageYOffset > 400);
    }, { passive: true });
    btn.addEventListener('click', scrollToTop);
  }

  /* ── 10. VISOR DE IMÁGENES (LIGHTBOX) ────────────────────────────────
     · Envuelve cada captura (img.img-real y las de arquitectura).
     · ← → recorren las imágenes VISIBLES de la misma sección
       (respeta pestañas de sistema y "Revelar versión correcta").
     · Zoom: clic/tap, rueda, botones +/−, pellizco. Cierre: Esc, ✕, fondo, "atrás".
     ─────────────────────────────────────────────────────────────────── */
  var lightbox = (function () {
    var MIN = 1, MAX = 4, DOUBLE_TAP = 2.5, SWIPE_PX = 60;
    var group = [], index = 0, scale = 1, tx = 0, ty = 0;
    var pointers = {}, pinchDist = 0, pinchScale = 1, drag = null;
    var lastFocus = null, pushed = false;
    var overlay, stage, img, counter, title, zoomLabel, prevBtn, nextBtn;

    function wrapImages() {
      $$('img.img-real, .arch-card img').forEach(function (im) {
        if (im.closest('.zoomable')) return;
        var wrap = document.createElement('div');
        wrap.className = 'zoomable';
        wrap.tabIndex = 0;
        wrap.setAttribute('role', 'button');
        wrap.setAttribute('aria-label', 'Ampliar imagen: ' + (im.alt || 'captura'));
        im.parentNode.insertBefore(wrap, im);
        wrap.appendChild(im);
        var badge = document.createElement('div');
        badge.className = 'zoom-badge';
        badge.innerHTML = '🔍 <span>Ampliar</span>';
        wrap.appendChild(badge);
      });
    }

    function build() {
      overlay = document.createElement('div');
      overlay.className = 'lb-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Visor de imágenes');
      overlay.innerHTML =
        '<div class="lb-top"><span class="lb-counter"></span><div class="lb-title"></div>' +
        '<button class="lb-btn lb-close" aria-label="Cerrar (Esc)" title="Cerrar (Esc)">✕</button></div>' +
        '<div class="lb-stage">' +
        '<button class="lb-btn lb-nav lb-prev" aria-label="Anterior (←)" title="Anterior (←)">‹</button>' +
        '<img class="lb-img" alt="">' +
        '<button class="lb-btn lb-nav lb-next" aria-label="Siguiente (→)" title="Siguiente (→)">›</button></div>' +
        '<div class="lb-bottom">' +
        '<button class="lb-btn lb-zoom-out" aria-label="Alejar (−)" title="Alejar (−)">−</button>' +
        '<span class="lb-zoom-label">100%</span>' +
        '<button class="lb-btn lb-zoom-in" aria-label="Acercar (+)" title="Acercar (+)">+</button>' +
        '<button class="lb-btn lb-zoom-reset" aria-label="Ajustar a pantalla (0)" title="Ajustar (0)">⤢</button>' +
        '<span class="lb-hint">Clic para acercar · Arrastra para mover · ← → para cambiar</span></div>';
      root.appendChild(overlay);

      stage = $('.lb-stage', overlay);
      img = $('.lb-img', overlay);
      counter = $('.lb-counter', overlay);
      title = $('.lb-title', overlay);
      zoomLabel = $('.lb-zoom-label', overlay);
      prevBtn = $('.lb-prev', overlay);
      nextBtn = $('.lb-next', overlay);

      $('.lb-close', overlay).addEventListener('click', close);
      prevBtn.addEventListener('click', function () { go(-1); });
      nextBtn.addEventListener('click', function () { go(1); });
      $('.lb-zoom-in', overlay).addEventListener('click', function () { zoomBy(1.5); });
      $('.lb-zoom-out', overlay).addEventListener('click', function () { zoomBy(1 / 1.5); });
      $('.lb-zoom-reset', overlay).addEventListener('click', resetZoom);
      stage.addEventListener('click', function (e) { if (e.target === stage) close(); });
      stage.addEventListener('wheel', function (e) {
        e.preventDefault();
        zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.2 : 1 / 1.2);
      }, { passive: false });

      img.addEventListener('pointerdown', pDown);
      window.addEventListener('pointermove', pMove);
      window.addEventListener('pointerup', pUp);
      window.addEventListener('pointercancel', pUp);
      img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }

    function visible(el) { return el.offsetParent !== null || el.getClientRects().length > 0; }
    function isOpen() { return overlay && overlay.classList.contains('open'); }

    function open(wrap) {
      var scope = wrap.closest('.comp-detail, .page') || root;
      group = $$('.zoomable', scope).filter(visible);
      index = Math.max(0, group.indexOf(wrap));
      lastFocus = document.activeElement;
      document.body.style.overflow = 'hidden';
      overlay.classList.add('open');
      show(index);
      $('.lb-close', overlay).focus();
      try { history.pushState({ lb: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
    }

    function close() {
      if (!isOpen()) return;
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      pointers = {};
      if (pushed) { pushed = false; try { history.back(); } catch (e) { /* sin historial */ } }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function caption(wrap) {
      var sib = wrap.nextElementSibling;
      if (sib && sib.classList.contains('img-caption')) return clean(sib.textContent);
      var holder = wrap.closest('.arch-card, .img-item, .pin-figure, .reveal-body, figure');
      if (holder) {
        var head = holder.querySelector('.arch-card-head');
        if (head) return 'Arquitectura — ' + clean(head.textContent);
        var cap = holder.querySelector('.img-caption');
        if (cap) return clean(cap.textContent);
      }
      var im = wrap.querySelector('img');
      return im ? im.alt : '';
    }
    function clean(t) { return t.trim().replace(/\s+/g, ' '); }

    function show(i) {
      index = (i + group.length) % group.length;
      var wrap = group[index];
      var src = wrap.querySelector('img');
      resetZoom();
      img.classList.add('loading');
      img.onload = function () { img.classList.remove('loading'); };
      img.src = src.currentSrc || src.src;
      img.alt = src.alt || '';
      if (img.complete) img.classList.remove('loading');
      counter.textContent = (index + 1) + ' / ' + group.length;
      title.textContent = caption(wrap);
      var multi = group.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
      if (multi) {
        [index - 1, index + 1].forEach(function (n) {
          new Image().src = group[(n + group.length) % group.length].querySelector('img').src;
        });
      }
    }

    function go(step) { if (group.length > 1) show(index + step); }

    function clampPan() {
      var limX = Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2);
      var limY = Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2);
      tx = Math.min(limX, Math.max(-limX, tx));
      ty = Math.min(limY, Math.max(-limY, ty));
    }

    function apply() {
      clampPan();
      img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      img.classList.toggle('zoomed', scale > 1);
      zoomLabel.textContent = Math.round(scale * 100) + '%';
    }

    function resetZoom() { scale = 1; tx = 0; ty = 0; if (img) apply(); }

    function zoomAt(cx, cy, factor) {
      var next = Math.min(MAX, Math.max(MIN, scale * factor));
      if (next === scale) return;
      var r = stage.getBoundingClientRect();
      var ox = cx - (r.left + r.width / 2), oy = cy - (r.top + r.height / 2);
      var ratio = next / scale;
      tx = ox - (ox - tx) * ratio;
      ty = oy - (oy - ty) * ratio;
      scale = next;
      if (scale === 1) { tx = 0; ty = 0; }
      apply();
    }

    function zoomBy(f) {
      var r = stage.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, f);
    }

    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

    function pDown(e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { img.setPointerCapture(e.pointerId); } catch (err) { /* ignorar */ }
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        pinchDist = dist(pointers[ids[0]], pointers[ids[1]]);
        pinchScale = scale;
        drag = null;
      } else {
        drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, moved: false };
        img.classList.add('dragging');
      }
    }

    function pMove(e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var d = dist(pointers[ids[0]], pointers[ids[1]]);
        if (pinchDist > 0) {
          zoomAt((pointers[ids[0]].x + pointers[ids[1]].x) / 2, (pointers[ids[0]].y + pointers[ids[1]].y) / 2,
            (pinchScale * d / pinchDist) / scale);
        }
        return;
      }
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true;
      if (scale > 1) { tx = drag.tx + dx; ty = drag.ty + dy; apply(); }
    }

    function pUp(e) {
      if (!pointers[e.pointerId]) return;
      var wasPinch = Object.keys(pointers).length === 2;
      delete pointers[e.pointerId];
      img.classList.remove('dragging');
      if (wasPinch) { drag = null; return; }
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, moved = drag.moved;
      drag = null;
      if (!moved) {
        if (scale > 1) resetZoom(); else zoomAt(e.clientX, e.clientY, DOUBLE_TAP);
      } else if (scale === 1 && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? 1 : -1);
      }
    }

    function init() {
      wrapImages();
      build();

      root.addEventListener('click', function (e) {
        var wrap = e.target.closest && e.target.closest('.zoomable');
        if (wrap && !isOpen()) open(wrap);
      });

      document.addEventListener('keydown', function (e) {
        if (!isOpen()) {
          var t = e.target;
          if ((e.key === 'Enter' || e.key === ' ') && t && t.classList && t.classList.contains('zoomable')) {
            e.preventDefault();
            open(t);
          }
          return;
        }
        switch (e.key) {
          case 'Escape': close(); break;
          case 'ArrowLeft': go(-1); break;
          case 'ArrowRight': go(1); break;
          case '+': case '=': zoomBy(1.5); break;
          case '-': case '_': zoomBy(1 / 1.5); break;
          case '0': resetZoom(); break;
          case 'Tab':
            e.preventDefault();
            var btns = $$('button', overlay).filter(function (b) { return !b.hidden; });
            var pos = btns.indexOf(document.activeElement);
            btns[(pos + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
            break;
        }
      });

      window.addEventListener('popstate', function () { if (isOpen()) { pushed = false; close(); } });
      window.addEventListener('resize', function () { if (isOpen()) apply(); });
    }

    return { init: init };
  })();

  /* ── 11. INICIO ──────────────────────────────────────────────────── */
  function bindEvents() {
    root.addEventListener('click', function (e) {
      var t = e.target;

      var sysPick = t.closest('[data-sys-pick]');
      if (sysPick) {
        setSystem(sysPick.dataset.sysPick);
        if (sysPick.dataset.go) go(sysPick.dataset.go);
        return;
      }

      var revealBtn = t.closest('[data-reveal]');
      if (revealBtn) { reveal(revealBtn); return; }

      var pin = t.closest('.pin, .pin-item');
      if (pin) { togglePin(pin); return; }

      if (t.closest('[data-comp-grid]')) { go('componentes', { comp: null }); return; }

      var comp = t.closest('[data-comp]');
      if (comp) { go('componentes', { comp: comp.dataset.comp }); return; }

      var nav = t.closest('[data-go]');
      if (nav) { go(nav.dataset.go, { anchor: nav.dataset.anchor || null }); return; }
    });

    // Los pines también se activan con teclado
    root.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pin-item')) {
        e.preventDefault();
        togglePin(e.target);
      }
    });
  }

  /* ── 12. IMPRIMIR / GUARDAR PDF ──────────────────────────────────────
     El CSS de impresión (sección 17 de estilos.css) muestra TODO por sí solo:
     funciona incluso con Ctrl+P sin tocar el botón. Este módulo agrega:
       · el menú del botón "Imprimir / PDF" (con colores | ahorro de tinta);
       · la clase .ink-saver solo mientras dura la impresión;
       · la espera a que carguen las fuentes antes de abrir el diálogo.
     ─────────────────────────────────────────────────────────────────── */
  var printer = (function () {
    var toggleBtn, menu;

    function setMenu(open) {
      if (!menu) return;
      menu.hidden = !open;
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function run(mode) {
      setMenu(false);
      root.classList.toggle('ink-saver', mode === 'ink');
      var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
      ready.then(function () { window.print(); });
    }

    function cleanup() { root.classList.remove('ink-saver'); }

    function init() {
      toggleBtn = $('[data-print-toggle]');
      menu = $('.ap-print-menu');
      if (!toggleBtn || !menu) return;

      toggleBtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(menu.hidden); });
      menu.addEventListener('click', function (e) {
        e.stopPropagation();
        var opt = e.target.closest('[data-print]');
        if (opt) run(opt.dataset.print);
      });
      document.addEventListener('click', function () { setMenu(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

      // Ctrl+P / menú del navegador: se imprime en colores; al terminar se limpia cualquier modo temporal
      window.addEventListener('afterprint', cleanup);
    }

    return { init: init };
  })();

  /* ── MENÚ DE LA CABECERA: deslizable con flechas cuando no cabe ───── */
  function initNavScroll() {
    var nav = $('.ap-nav');
    if (!nav) return;
    var izq = document.createElement('button');
    var der = document.createElement('button');
    [izq, der].forEach(function (b, i) {
      b.type = 'button';
      b.className = 'ap-nav-flecha';
      b.hidden = true;
      b.setAttribute('aria-label', i === 0 ? 'Ver secciones anteriores' : 'Ver más secciones');
      b.textContent = i === 0 ? '‹' : '›';
    });
    nav.parentNode.insertBefore(izq, nav);
    nav.parentNode.insertBefore(der, nav.nextSibling);

    function actualizar() {
      var extra = izq.hidden ? 0 : izq.offsetWidth + der.offsetWidth + 32; // ancho que ocupan las flechas
      var hay = nav.scrollWidth > nav.clientWidth + extra + 2;
      izq.hidden = der.hidden = !hay;
      if (!hay) { nav.style.setProperty('--fi', '0px'); nav.style.setProperty('--fd', '0px'); return; }
      var x = nav.scrollLeft, max = nav.scrollWidth - nav.clientWidth;
      izq.classList.toggle('off', x < 2);
      der.classList.toggle('off', x > max - 2);
      nav.style.setProperty('--fi', x < 2 ? '0px' : '22px');
      nav.style.setProperty('--fd', x > max - 2 ? '0px' : '22px');
    }
    function centrar() {
      var a = nav.querySelector('.ap-nav-btn.active');
      if (!a) return;
      nav.scrollTo({ left: Math.max(0, a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2), behavior: 'smooth' });
    }
    izq.addEventListener('click', function () { nav.scrollBy({ left: -nav.clientWidth * 0.7, behavior: 'smooth' }); });
    der.addEventListener('click', function () { nav.scrollBy({ left: nav.clientWidth * 0.7, behavior: 'smooth' }); });
    nav.addEventListener('scroll', actualizar, { passive: true });
    nav.addEventListener('wheel', function (e) { // la rueda del mouse también mueve el menú
      if (nav.scrollWidth > nav.clientWidth + 2 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { nav.scrollLeft += e.deltaY; e.preventDefault(); }
    }, { passive: false });
    window.addEventListener('resize', actualizar);
    if (window.ResizeObserver) new ResizeObserver(actualizar).observe(nav);
    if (window.MutationObserver) new MutationObserver(centrar).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
    actualizar();
    centrar();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { actualizar(); centrar(); });
  }

  /* ── ARRANQUE ────────────────────────────────────────────────────── */
  function init() {
    if (root.dataset.apReady) return; // evita inicializar dos veces (p. ej. al integrarlo en SIGA)
    root.dataset.apReady = '1';
    injectMaps();
    buildPagers();
    buildCompPagers();
    bindEvents();
    initChecklist();
    prueba.init();
    initScrollTop();
    initHeaderAutoHide();
    lightbox.init();
    printer.init();
    initNavScroll();
    watchEvaluationSection();
    renderProgress();
    refreshTabs();
    routeFromHash();

    // Para integrarlo en SIGA: document.getElementById('asesoria-pc1').asesoriaPC1.go('componentes', {comp:'kpis'})
    root.asesoriaPC1 = { go: go, setSystem: setSystem };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();