/* =====================================================================
   BASE · Asesoría web interactiva (teoría) · scripts.js
   Carpeta: assets/asesorias/mcd/2026-2/pc3/
   Tres zonas:
     ZONA 1 · CONTENIDO  (constantes y DATOS: portada, páginas y bloques)  -> cambia siempre
     ZONA 2 · DEFENSA GUIADA (preguntas con bloques de decisión)            -> cambia siempre
     ZONA 3 · MOTOR      (páginas, bloques, práctica, impresión)            -> no se toca
   Sin variables globales, sin CDN (salvo Google Fonts) y sin tocar la página que contiene el iframe.
   ===================================================================== */
(function () {
  'use strict';

  /* >>>>>>>>>> ZONA 1 · CONTENIDO >>>>>>>>>> */
  const SLUG = 'mcd', EVAL = 'pc3', PERIODO = '2026-2';
  const USE_HASH = true;                                   // false si SIGA maneja su propia URL
  const ETQ = EVAL.toUpperCase() + ' · ' + PERIODO.slice(2);   // PC3 · 26-2
  const ETQ_CAB = EVAL.toUpperCase() + ' ' + PERIODO.slice(2); // PC3 26-2
  const CURSO = 'Modelado Conceptual de Datos';
  // Solo si la asesoría usa KaTeX o JSXGraph. Esta asesoría no los usa.
  const RUTA_LIB = '../../../../libs/';

  // Ilustración de la portada: tres fichas de archivo con pestaña.
    const ARTE = '<div class="fich"><div class="fi fi1"><span class="t">Atributo</span>cantidad_paquete</div><div class="fi fi2"><span class="t">Semántica</span>Número de paquetes…</div><div class="fi fi3"><span class="t">Ontología</span>Indica cuántos paquetes…</div></div>';

  /* ---------- Ejemplos: una sola fuente (validada con código) para la web y para el Excel ---------- */
  const SISTEMAS = [
 {
  "id": "almacenamiento",
  "nombre": "Almacenamiento",
  "empresa": "Una empresa tercerizada que guarda la mercancía de sus clientes en los contenedores de un almacén hasta su despacho. El cliente es quien la contrata.",
  "filas": [
   {
    "a": "altura_mercancia",
    "v": "[0.01, 50.00]",
    "f": "NUM(4,2)",
    "n": "NÚMERO",
    "s": "Medida real, en metros, de la [[mercancía]] desde su base hasta su punto más alto.",
    "o": "Permite conocer la altura real para separar la longitud vertical que ocupará en el [[contenedor]]."
   },
   {
    "a": "altura_mercancia_programada",
    "v": "[0.01, 50.00]",
    "f": "NUM(4,2)",
    "n": "NÚMERO",
    "s": "Medida esperada, en metros, de la [[mercancía]] desde su base hasta su punto más alto.",
    "o": "Indica la altura que el [[cliente]] programó en el [[ticket]], base para separar el espacio del [[contenedor]]."
   },
   {
    "a": "ancho_mercancia",
    "v": "[0.01, 50.00]",
    "f": "NUM(4,2)",
    "n": "NÚMERO",
    "s": "Medida real, en metros, de la [[mercancía]] de un costado al otro.",
    "o": "Permite conocer el ancho real para separar la longitud horizontal que ocupará en el [[contenedor]]."
   },
   {
    "a": "ancho_mercancia_programada",
    "v": "[0.01, 50.00]",
    "f": "NUM(4,2)",
    "n": "NÚMERO",
    "s": "Medida esperada, en metros, de la [[mercancía]] de un costado al otro.",
    "o": "Indica el ancho que el [[cliente]] programó en el [[ticket]], base para separar el espacio horizontal del [[contenedor]]."
   },
   {
    "a": "cantidad_contenedor",
    "v": "[1, 100]",
    "f": "NUM(3)",
    "n": "NÚMERO",
    "s": "Número de [[contenedor|contenedores]] reservados en el [[ticket]].",
    "o": "Indica cuántos contenedores se necesitan para almacenar la [[mercancía]]."
   },
   {
    "a": "cantidad_mercancia",
    "v": "[1, 99999]",
    "f": "NUM(5)",
    "n": "NÚMERO",
    "s": "Número de unidades reales de [[mercancía]].",
    "o": "Indica cuántas unidades de mercancía llegaron al [[almacén]]."
   },
   {
    "a": "cantidad_mercancia_paquete",
    "v": "[1, 999]",
    "f": "NUM(3)",
    "n": "NÚMERO",
    "s": "Número de unidades de [[mercancía]] que contiene un [[paquete]] embalado.",
    "o": "Permite calcular cuántos paquetes se necesitan para embalar la mercancía."
   },
   {
    "a": "cantidad_mercancia_programada",
    "v": "[1, 99999]",
    "f": "NUM(5)",
    "n": "NÚMERO",
    "s": "Número de unidades esperadas de [[mercancía]].",
    "o": "Indica cuántas unidades de mercancía se programaron en el [[ticket]] para llegar al [[almacén]]."
   },
   {
    "a": "cantidad_paquete",
    "v": "[1, 99999]",
    "f": "NUM(5)",
    "n": "NÚMERO",
    "s": "Número de [[paquete|paquetes]] embalados de una [[mercancía]].",
    "o": "Indica cuántos paquetes se usaron para embalar la mercancía."
   },
   {
    "a": "categoria_contenedor",
    "v": "TAB1",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "[[clase|Clase]] de [[contenedor]] que resulta de clasificarlo según su material.",
    "o": "Identifica el tipo de contenedor donde se almacenará una [[mercancía]]."
   },
   {
    "a": "categoria_empaque_programada",
    "v": "TAB2",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "[[clase|Clase]] de [[empaque]] esperada, que resulta de clasificarlo según su material.",
    "o": "Identifica el empaque que el [[cliente]] programó en el [[ticket]], para diferenciar una [[mercancía]] de otra."
   },
   {
    "a": "categoria_empaque_real",
    "v": "TAB2",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "[[clase|Clase]] de [[empaque]] real, que resulta de clasificarlo según su material.",
    "o": "Identifica el empaque con que llegó la [[mercancía]], para contrastarlo con el programado."
   },
   {
    "a": "categoria_mercancia",
    "v": "TAB3",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "[[clase|Clase]] de [[mercancía]] que resulta de clasificarla según sus características.",
    "o": "Identifica la categoría de una mercancía para definir su [[embalaje]] y su almacenamiento."
   }
  ],
  "glosario": [
   {
    "t": "almacén",
    "d": "Lugar donde se ubican los [[contenedor|contenedores]] y se movilizan [[autómata|autómatas]] para custodiar la mercancía."
   },
   {
    "t": "autómata",
    "d": "Máquina programada para mover o manipular [[mercancía]]."
   },
   {
    "t": "clase",
    "d": "Grupo que resulta de clasificar según un criterio y que indica una jerarquía."
   },
   {
    "t": "cliente",
    "d": "Empresa que contrata el servicio de almacenamiento."
   },
   {
    "t": "contenedor",
    "d": "Espacio físico con estanterías donde se conserva la [[mercancía]]."
   },
   {
    "t": "embalaje",
    "d": "Protección exterior que reúne varias unidades de [[mercancía]] para su manejo y traslado."
   },
   {
    "t": "empaque",
    "d": "Envoltura inmediata que contiene o protege una unidad de [[mercancía]]."
   },
   {
    "t": "mercancía",
    "d": "Bien mueble que el [[cliente]] entrega para su custodia."
   },
   {
    "t": "paquete",
    "d": "Conjunto de unidades de [[mercancía]] reunidas con su [[embalaje]]."
   },
   {
    "t": "ticket",
    "d": "Registro único del servicio que contrata el [[cliente]], con lo programado para su ejecución."
   }
  ],
  "tablas": [
   {
    "n": 1,
    "titulo": "Categoría de contenedor",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Cartón"
     ],
     [
      "2",
      "Plástico"
     ],
     [
      "3",
      "Tecnopor"
     ],
     [
      "4",
      "Plomo"
     ],
     [
      "5",
      "Madera"
     ],
     [
      "6",
      "Acero"
     ]
    ],
    "atributos": [
     "categoria_contenedor"
    ]
   },
   {
    "n": 2,
    "titulo": "Categoría de empaque",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Madera"
     ],
     [
      "2",
      "Plástico"
     ],
     [
      "3",
      "Cartón"
     ],
     [
      "4",
      "Papel"
     ],
     [
      "5",
      "Aluminio"
     ],
     [
      "6",
      "Plomo"
     ]
    ],
    "atributos": [
     "categoria_empaque_programada",
     "categoria_empaque_real"
    ]
   },
   {
    "n": 3,
    "titulo": "Categoría de mercancía",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Perecible"
     ],
     [
      "2",
      "Gas"
     ],
     [
      "3",
      "Inflamable"
     ],
     [
      "4",
      "Normal"
     ],
     [
      "5",
      "Radiactivo"
     ],
     [
      "6",
      "Frágil"
     ],
     [
      "7",
      "Tóxico"
     ]
    ],
    "atributos": [
     "categoria_mercancia"
    ]
   }
  ]
 },
 {
  "id": "cobranza",
  "nombre": "Cobranza",
  "empresa": "Una empresa tercerizada que gestiona el cobro de los morosos de otra empresa, su sponsor, que es quien la contrata. El moroso es un tercero: no es el cliente.",
  "filas": [
   {
    "a": "codigo_sponsor",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se incrementa en 1 y se asigna a un [[sponsor]].",
    "o": "Identifica de manera única al sponsor que contrata el servicio de [[cobranza]]."
   },
   {
    "a": "correo_garante",
    "v": "A…Z a…z 0…9 @ . _",
    "f": "CHAR(100)",
    "n": "NOMBRE",
    "s": "Dirección de correo electrónico del [[garante]].",
    "o": "Permite comunicarse con el garante mediante el [[canal]] Correo."
   },
   {
    "a": "correo_moroso",
    "v": "A…Z a…z 0…9 @ . _",
    "f": "CHAR(100)",
    "n": "NOMBRE",
    "s": "Dirección de correo electrónico del [[moroso]].",
    "o": "Permite comunicarse con el moroso mediante el [[canal]] Correo en la [[cobranza]] prejudicial."
   },
   {
    "a": "correo_sponsor",
    "v": "A…Z a…z 0…9 @ . _",
    "f": "CHAR(100)",
    "n": "NOMBRE",
    "s": "Dirección de correo electrónico del [[sponsor]].",
    "o": "Permite informar al sponsor el estado de la [[cobranza]] de sus morosos."
   },
   {
    "a": "dias_mora",
    "v": "[1, 9999]",
    "f": "NUM(4)",
    "n": "NÚMERO",
    "s": "Número de días transcurridos desde el vencimiento de la [[deuda]], mientras sigue impaga.",
    "o": "Permite determinar el tipo de [[mora]] y, con él, el producto de cobranza que corresponde aplicar."
   },
   {
    "a": "direccion_moroso",
    "v": "A…Z a…z 0…9",
    "f": "CHAR(100)",
    "n": "NOMBRE",
    "s": "Ubicación física en la que reside el [[moroso]].",
    "o": "Permite entregar al moroso las comunicaciones presenciales o jurídicas, como la [[carta notarial]]."
   },
   {
    "a": "estado_cobranza",
    "v": "TAB1",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Condición actual del proceso de [[cobranza]] respecto a una [[deuda]] determinada.",
    "o": "Refleja el progreso operativo de la gestión de cobranza."
   },
   {
    "a": "estado_entrega_dron",
    "v": "TAB2",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Condición actual de la entrega de la [[carta notarial]] mediante [[dron]].",
    "o": "Permite rastrear la ejecución de la entrega automatizada."
   },
   {
    "a": "fecha_vencimiento_deuda",
    "v": "fecha lógica y válida",
    "f": "AAAA-MM-DD",
    "n": "FECHA",
    "s": "Fecha límite en la que la [[deuda]] debía pagarse.",
    "o": "Permite calcular los días de [[mora]] del [[moroso]]."
   },
   {
    "a": "monto_deuda",
    "v": "[0.01, 9999999999.9999]",
    "f": "NUM(14,4)",
    "n": "MONTO",
    "s": "Cantidad de dinero, en soles, que el [[moroso]] debe al [[sponsor]].",
    "o": "Permite clasificar la [[deuda]] según su saldo y priorizar la gestión de cobranza."
   },
   {
    "a": "nombre_moroso",
    "v": "A…Z a…z",
    "f": "CHAR(50)",
    "n": "NOMBRE",
    "s": "Nombre y apellidos con los que se conoce al [[moroso]].",
    "o": "Permite dirigir al moroso cada comunicación de [[cobranza]]."
   },
   {
    "a": "tipo_mora",
    "v": "TAB3",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "[[clase|Clase]] de [[mora]] que resulta de clasificarla según los días transcurridos sin pago.",
    "o": "Indica el producto de cobranza que corresponde aplicar al moroso."
   }
  ],
  "glosario": [
   {
    "t": "canal",
    "d": "Medio o vía por la que se transmite información."
   },
   {
    "t": "carta notarial",
    "d": "Comunicación formal, certificada ante notario, que se entrega al [[moroso]]."
   },
   {
    "t": "clase",
    "d": "Grupo que resulta de clasificar según un criterio y que indica una jerarquía."
   },
   {
    "t": "cobranza",
    "d": "Gestión que notifica, recuerda y presiona al [[moroso]] para que cumpla su [[deuda]]."
   },
   {
    "t": "deuda",
    "d": "Obligación de pago que una persona o entidad debe cumplir."
   },
   {
    "t": "dron",
    "d": "Aeronave no tripulada que ejecuta tareas de entrega de forma automática."
   },
   {
    "t": "garante",
    "d": "Persona que respalda con su compromiso el pago de la [[deuda]] del [[moroso]]."
   },
   {
    "t": "mora",
    "d": "Retraso en el cumplimiento de una obligación de pago."
   },
   {
    "t": "moroso",
    "d": "Persona o entidad que mantiene con el [[sponsor]] una [[deuda]] vencida."
   },
   {
    "t": "sponsor",
    "d": "Empresa que contrata el servicio de cobranza para recuperar lo que le deben."
   }
  ],
  "tablas": [
   {
    "n": 1,
    "titulo": "Estado de cobranza",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Programada"
     ],
     [
      "2",
      "En ejecución"
     ],
     [
      "3",
      "Concluida"
     ]
    ],
    "atributos": [
     "estado_cobranza"
    ]
   },
   {
    "n": 2,
    "titulo": "Estado de entrega por dron",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Programada"
     ],
     [
      "2",
      "En ruta"
     ],
     [
      "3",
      "Entregada"
     ]
    ],
    "atributos": [
     "estado_entrega_dron"
    ]
   },
   {
    "n": 3,
    "titulo": "Tipo de mora",
    "cabecera": [
     "Código",
     "Tipo",
     "Mora desde"
    ],
    "filas": [
     [
      "1",
      "Leve",
      "3 días"
     ],
     [
      "2",
      "Intermedia",
      "5 días"
     ],
     [
      "3",
      "Prejudicial",
      "10 días"
     ],
     [
      "4",
      "Judicial",
      "15 días"
     ]
    ],
    "atributos": [
     "tipo_mora"
    ]
   }
  ]
 },
 {
  "id": "publicidad",
  "nombre": "Publicidad",
  "empresa": "Una empresa tercerizada que planifica y difunde campañas publicitarias en vehículos como televisión, radio, web o impresos. El cliente es quien contrata la campaña.",
  "filas": [
   {
    "a": "alcance_total",
    "v": "[0, 999999999]",
    "f": "NUM(9)",
    "n": "NÚMERO",
    "s": "Número total de personas que consumieron el [[anuncio]] durante toda la [[transmisión]].",
    "o": "Permite determinar la efectividad de la [[campaña]] publicitaria."
   },
   {
    "a": "alcance_transmision",
    "v": "[0, 999999999]",
    "f": "NUM(9)",
    "n": "NÚMERO",
    "s": "Número de personas que consumieron el [[anuncio]] durante una [[transmisión]].",
    "o": "Indica la capacidad del anuncio para atraer a quienes lo consumen."
   },
   {
    "a": "audiencia_total",
    "v": "[0, 999999999]",
    "f": "NUM(9)",
    "n": "NÚMERO",
    "s": "Número total de personas que consumieron el [[vehículo publicitario]] durante toda la [[transmisión]].",
    "o": "Permite conocer la influencia del vehículo publicitario."
   },
   {
    "a": "audiencia_vehiculo",
    "v": "[0, 999999999]",
    "f": "NUM(9)",
    "n": "NÚMERO",
    "s": "[[audiencia|Audiencia]] promedio del [[vehículo publicitario]].",
    "o": "Sirve de base para calcular la tarifa del vehículo publicitario."
   },
   {
    "a": "cantidad_vehiculo",
    "v": "[1, 9999]",
    "f": "NUM(4)",
    "n": "NÚMERO",
    "s": "Número de [[vehículo publicitario|vehículos publicitarios]] asignados a una [[campaña]].",
    "o": "Sirve de base para calcular el costo de la campaña."
   },
   {
    "a": "codigo_anuncio",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna a un [[anuncio]].",
    "o": "Permite distinguir un anuncio de otro y reportar sus resultados por separado."
   },
   {
    "a": "codigo_campania",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna a una [[campaña]] publicitaria.",
    "o": "Permite agrupar los anuncios y los vehículos de una misma campaña."
   },
   {
    "a": "codigo_cliente",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna a un [[cliente]].",
    "o": "Permite asociar cada campaña con el cliente que la contrató."
   },
   {
    "a": "codigo_producto",
    "v": "[0, 99999999]",
    "f": "NUM(8)",
    "n": "CÓDIGO",
    "s": "Número de 8 dígitos que identifica a un [[producto]] del catálogo.",
    "o": "Permite asociar el vehículo publicitario con el producto que se promociona."
   },
   {
    "a": "codigo_reporte_campania",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna al informe final de una [[campaña]].",
    "o": "Permite entregar al [[cliente]] los resultados finales de su campaña."
   },
   {
    "a": "contenido_vehiculo",
    "v": "TAB1",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Tema principal del contenido que difunde el [[vehículo publicitario]].",
    "o": "Permite ubicar el [[anuncio]] en un contenido afín al público al que se dirige."
   },
   {
    "a": "medio_vehiculo",
    "v": "TAB2",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Tipo de soporte por el que el [[vehículo publicitario]] difunde el [[anuncio]].",
    "o": "Permite calcular la tarifa y el alcance según el soporte utilizado."
   }
  ],
  "glosario": [
   {
    "t": "anuncio",
    "d": "Mensaje publicitario que promociona un [[producto]]."
   },
   {
    "t": "audiencia",
    "d": "Conjunto de personas que consumen un [[vehículo publicitario]] en un momento dado."
   },
   {
    "t": "campaña",
    "d": "Conjunto de [[anuncio|anuncios]] y [[vehículo publicitario|vehículos publicitarios]] planificados para promocionar un [[producto]] durante un periodo."
   },
   {
    "t": "cliente",
    "d": "Empresa que contrata la campaña publicitaria."
   },
   {
    "t": "producto",
    "d": "Bien o servicio que el [[cliente]] ofrece al público."
   },
   {
    "t": "transmisión",
    "d": "Emisión de un [[anuncio]] a través de un [[vehículo publicitario]]."
   },
   {
    "t": "vehículo publicitario",
    "d": "Medio que difunde un [[anuncio]] al público, como la televisión, la radio, la web o un impreso."
   }
  ],
  "tablas": [
   {
    "n": 1,
    "titulo": "Contenido del vehículo",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Deportes"
     ],
     [
      "2",
      "Educación"
     ],
     [
      "3",
      "Entretenimiento"
     ],
     [
      "4",
      "Infantil"
     ]
    ],
    "atributos": [
     "contenido_vehiculo"
    ]
   },
   {
    "n": 2,
    "titulo": "Medio del vehículo",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Televisión"
     ],
     [
      "2",
      "Radio"
     ],
     [
      "3",
      "Web"
     ],
     [
      "4",
      "Impreso"
     ]
    ],
    "atributos": [
     "medio_vehiculo"
    ]
   }
  ]
 },
 {
  "id": "transporte",
  "nombre": "Transporte",
  "empresa": "Una empresa tercerizada que traslada la carga de su cliente, el remitente que la contrata. El destinatario recibe la carga, pero no es el cliente.",
  "filas": [
   {
    "a": "alcance_maximo",
    "v": "[0.01, 9999.99]",
    "f": "NUM(6,2)",
    "n": "NÚMERO",
    "s": "Distancia máxima, en kilómetros, que una [[unidad de transporte]] recorre sin reabastecer energía.",
    "o": "Permite saber si la unidad puede cubrir la [[ruta]] asignada sin detenerse a reabastecer."
   },
   {
    "a": "alto_carga_detectado",
    "v": "[0.01, 99.99]",
    "f": "NUM(4,2)",
    "n": "NÚMERO",
    "s": "Medida real, en metros, de la [[carga]] desde su base hasta su punto más alto.",
    "o": "Permite verificar si la carga cabe en la unidad de transporte asignada."
   },
   {
    "a": "ancho_carga_detectado",
    "v": "[0.01, 99.99]",
    "f": "NUM(4,2)",
    "n": "NÚMERO",
    "s": "Medida real, en metros, de la [[carga]] de un costado al otro.",
    "o": "Permite verificar si la carga cabe a lo ancho en la unidad de transporte asignada."
   },
   {
    "a": "cantidad_entregada",
    "v": "[0, 999999]",
    "f": "NUM(6)",
    "n": "NÚMERO",
    "s": "Número de unidades de [[carga]] que la [[unidad de transporte]] entregó.",
    "o": "Indica cuántas unidades dio por entregadas el transporte al cerrar el servicio."
   },
   {
    "a": "cantidad_recibida",
    "v": "[0, 999999]",
    "f": "NUM(6)",
    "n": "NÚMERO",
    "s": "Número de unidades de [[carga]] que el [[destinatario]] contó al recibirla.",
    "o": "Permite contrastar lo recibido con lo entregado para verificar el cumplimiento del servicio."
   },
   {
    "a": "capacidad_disponible",
    "v": "[0, 999999]",
    "f": "NUM(6)",
    "n": "NÚMERO",
    "s": "Espacio o peso que aún puede llevar una [[unidad de transporte]].",
    "o": "Determina si la unidad puede asignarse a un traslado según su capacidad restante."
   },
   {
    "a": "codigo_cliente",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna a un [[cliente]].",
    "o": "Permite asociar cada traslado con el remitente que lo contrató."
   },
   {
    "a": "condicion_climatica",
    "v": "TAB1",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Estado del tiempo atmosférico, actual o previsto, en la [[ruta]].",
    "o": "Permite anticipar variables ambientales que alteren la seguridad o el rendimiento del traslado."
   },
   {
    "a": "consumo_energia_estimado",
    "v": "[0.01, 9999.99]",
    "f": "NUM(6,2)",
    "n": "NÚMERO",
    "s": "Cantidad proyectada de energía que se espera consumir en una [[ruta]].",
    "o": "Indica la demanda de energía calculada según la distancia, la carga y el tipo de unidad."
   },
   {
    "a": "distancia_tramo",
    "v": "[0.01, 9999.99]",
    "f": "NUM(6,2)",
    "n": "NÚMERO",
    "s": "Longitud, en kilómetros, de un [[tramo]] de la [[ruta]].",
    "o": "Permite conocer la distancia que se recorrerá en un tramo específico."
   },
   {
    "a": "estado_carga",
    "v": "TAB2",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Condición logística actual de la [[carga]].",
    "o": "Indica la fase del traslado en que se encuentra la carga."
   },
   {
    "a": "estado_unidad_transporte",
    "v": "TAB3",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Condición actual de una [[unidad de transporte]].",
    "o": "Determina si la unidad puede asignarse a un servicio de traslado."
   },
   {
    "a": "largo_carga_detectado",
    "v": "[0.01, 99.99]",
    "f": "NUM(4,2)",
    "n": "NÚMERO",
    "s": "Medida real, en metros, de la [[carga]] desde su parte delantera hasta la trasera.",
    "o": "Permite verificar si la carga cabe a lo largo en la unidad de transporte asignada."
   }
  ],
  "glosario": [
   {
    "t": "carga",
    "d": "Conjunto de [[mercancía|mercancías]] que se traslada."
   },
   {
    "t": "cliente",
    "d": "Remitente que contrata el servicio de traslado de su [[carga]]."
   },
   {
    "t": "destinatario",
    "d": "Persona o entidad a quien va dirigida la [[carga]]; no contrata el servicio."
   },
   {
    "t": "mercancía",
    "d": "Bien mueble que se compra, se vende o se traslada."
   },
   {
    "t": "nodo",
    "d": "Punto de la [[ruta]] en el que se inicia, se detiene o termina un recorrido."
   },
   {
    "t": "ruta",
    "d": "Vía o trayecto que se sigue para ir de un lugar a otro."
   },
   {
    "t": "tramo",
    "d": "Parte de una [[ruta]] comprendida entre dos [[nodo|nodos]] adyacentes."
   },
   {
    "t": "unidad de transporte",
    "d": "Vehículo, tripulado o autónomo, que traslada la [[carga]] por una [[ruta]]."
   }
  ],
  "tablas": [
   {
    "n": 1,
    "titulo": "Condición climática",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Despejado"
     ],
     [
      "2",
      "Nublado"
     ],
     [
      "3",
      "Lluvia intensa"
     ],
     [
      "4",
      "Temperatura extrema"
     ]
    ],
    "atributos": [
     "condicion_climatica"
    ]
   },
   {
    "n": 2,
    "titulo": "Estado de la carga",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Verificada"
     ],
     [
      "2",
      "En tránsito"
     ],
     [
      "3",
      "Recibida"
     ]
    ],
    "atributos": [
     "estado_carga"
    ]
   },
   {
    "n": 3,
    "titulo": "Estado de la unidad de transporte",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Operativa"
     ],
     [
      "2",
      "En mantenimiento"
     ],
     [
      "3",
      "Fuera de servicio"
     ]
    ],
    "atributos": [
     "estado_unidad_transporte"
    ]
   }
  ]
 },
 {
  "id": "capacitacion",
  "nombre": "Capacitación",
  "empresa": "Una empresa tercerizada que capacita al personal de otras empresas mediante planes formativos. El cliente es la empresa que la contrata; los participantes capacitados son terceros.",
  "filas": [
   {
    "a": "codigo_competencia",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se incrementa en 1 y se asigna a una [[competencia]].",
    "o": "Permite asociar cada [[evaluación]] con la competencia que mide."
   },
   {
    "a": "codigo_evaluacion",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se incrementa en 1 y se asigna a una [[evaluación]].",
    "o": "Permite registrar y consultar los resultados de cada evaluación por separado."
   },
   {
    "a": "codigo_evaluador",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se incrementa en 1 y se asigna a un [[evaluador]].",
    "o": "Permite saber quién emitió el juicio de cada evaluación."
   },
   {
    "a": "codigo_modulo",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se incrementa en 1 y se asigna a un [[módulo]].",
    "o": "Permite organizar el plan de capacitación en módulos y seguir el avance de cada uno."
   },
   {
    "a": "codigo_participante",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se incrementa en 1 y se asigna a un [[participante]].",
    "o": "Permite asociar cada evidencia y cada resultado con la persona capacitada."
   },
   {
    "a": "codigo_plan_capacitacion",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se incrementa en 1 y se asigna a un [[plan de capacitación]].",
    "o": "Permite agrupar los módulos y las actividades que el [[cliente]] contrató."
   },
   {
    "a": "criterio_evaluacion",
    "v": "TAB1",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Aspecto que se toma como referencia para valorar el resultado de una [[evaluación]].",
    "o": "Permite emitir cada evaluación con parámetros uniformes para toda la empresa."
   },
   {
    "a": "descripcion_competencia",
    "v": "A…Z a…z 0…9",
    "f": "CHAR(200)",
    "n": "NOMBRE",
    "s": "Texto que explica las capacidades que abarca una [[competencia]].",
    "o": "Permite al [[evaluador]] y al [[participante]] conocer qué se espera lograr con la capacitación."
   },
   {
    "a": "duracion_real_actividad",
    "v": "[0.01, 9999.99]",
    "f": "NUM(6,2)",
    "n": "NÚMERO",
    "s": "Tiempo real, en horas, que se invirtió en ejecutar una [[actividad]].",
    "o": "Permite contrastar el tiempo real con el programado para medir el cumplimiento del plan."
   },
   {
    "a": "duracion_real_uso",
    "v": "[0.01, 9999.99]",
    "f": "NUM(6,2)",
    "n": "NÚMERO",
    "s": "Tiempo real, en horas, durante el cual se utilizó un [[recurso]].",
    "o": "Permite evaluar el uso real frente al planificado y optimizar la gestión de recursos."
   },
   {
    "a": "escala_calificacion",
    "v": "TAB2",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Marco de valores con el que se califica una [[evaluación]].",
    "o": "Define los valores y los límites con que se emite cada calificación."
   },
   {
    "a": "estado_acceso",
    "v": "TAB3",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Condición actual del [[acceso]] de un [[participante]].",
    "o": "Indica si el participante puede ingresar a sus módulos y actividades."
   },
   {
    "a": "estado_aprobacion_actividad",
    "v": "TAB4",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Resultado de aprobación de una [[actividad]].",
    "o": "Indica la situación académica del participante en la actividad."
   }
  ],
  "glosario": [
   {
    "t": "acceso",
    "d": "Permiso de un [[participante]] para ingresar a los contenidos de su capacitación."
   },
   {
    "t": "actividad",
    "d": "Tarea formativa que ejecuta el [[participante]]."
   },
   {
    "t": "cliente",
    "d": "Empresa que contrata la capacitación de su personal."
   },
   {
    "t": "competencia",
    "d": "Capacidad para realizar una tarea con eficacia."
   },
   {
    "t": "evaluación",
    "d": "Proceso que mide el logro de una [[competencia]] por parte de un [[participante]]."
   },
   {
    "t": "evaluador",
    "d": "Persona que emite un juicio en una [[evaluación]]."
   },
   {
    "t": "módulo",
    "d": "Unidad formativa que reúne [[actividad|actividades]] de un mismo tema."
   },
   {
    "t": "participante",
    "d": "Persona que recibe la capacitación; no contrata el servicio."
   },
   {
    "t": "plan de capacitación",
    "d": "Conjunto organizado de [[módulo|módulos]] que el [[cliente]] contrata para su personal."
   },
   {
    "t": "recurso",
    "d": "Material, sala o equipo que se usa en una [[actividad]]."
   }
  ],
  "tablas": [
   {
    "n": 1,
    "titulo": "Criterio de evaluación",
    "cabecera": [
     "Código",
     "Nombre",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Calidad del trabajo",
      "Grado de excelencia, precisión y atención al detalle en la ejecución"
     ],
     [
      "2",
      "Cumplimiento de objetivos",
      "Logro de las metas y resultados establecidos al inicio"
     ],
     [
      "3",
      "Comunicación",
      "Claridad y efectividad en la expresión oral y escrita"
     ],
     [
      "4",
      "Trabajo en equipo",
      "Habilidad para colaborar y contribuir en grupo"
     ],
     [
      "5",
      "Creatividad",
      "Originalidad e innovación en la solución de problemas"
     ]
    ],
    "atributos": [
     "criterio_evaluacion"
    ]
   },
   {
    "n": 2,
    "titulo": "Escala de calificación",
    "cabecera": [
     "Código",
     "Nombre",
     "Valor mínimo",
     "Valor máximo"
    ],
    "filas": [
     [
      "1",
      "Numérica",
      "0",
      "20"
     ],
     [
      "2",
      "Letras",
      "A",
      "F"
     ],
     [
      "3",
      "Porcentaje",
      "0 %",
      "100 %"
     ],
     [
      "4",
      "Puntos",
      "0",
      "100"
     ]
    ],
    "atributos": [
     "escala_calificacion"
    ]
   },
   {
    "n": 3,
    "titulo": "Estado de acceso",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Habilitado"
     ],
     [
      "2",
      "Deshabilitado"
     ],
     [
      "3",
      "Bloqueado"
     ],
     [
      "4",
      "Suspendido"
     ],
     [
      "5",
      "Vencido"
     ],
     [
      "6",
      "Pendiente"
     ]
    ],
    "atributos": [
     "estado_acceso"
    ]
   },
   {
    "n": 4,
    "titulo": "Estado de aprobación de la actividad",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Pendiente"
     ],
     [
      "2",
      "Aprobada"
     ],
     [
      "3",
      "Desaprobada"
     ]
    ],
    "atributos": [
     "estado_aprobacion_actividad"
    ]
   }
  ]
 },
 {
  "id": "compras",
  "nombre": "Compras",
  "empresa": "Una empresa tercerizada que compra productos a proveedores en nombre de su cliente, que es quien la contrata. El proveedor es un tercero: no es el cliente.",
  "filas": [
   {
    "a": "cantidad_pedida",
    "v": "[1, 99999]",
    "f": "NUM(5)",
    "n": "NÚMERO",
    "s": "Número de [[unidad|unidades]] de [[producto]] que se solicita en un [[pedido]].",
    "o": "Permite calcular el monto de la [[orden de compra]] y compararlo con lo que se recibe."
   },
   {
    "a": "cantidad_recibida",
    "v": "[0, 99999]",
    "f": "NUM(5)",
    "n": "NÚMERO",
    "s": "Número de [[unidad|unidades]] de [[producto]] que el [[proveedor]] entregó.",
    "o": "Permite verificar que el pedido se cumplió y detectar faltantes."
   },
   {
    "a": "codigo_cliente",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna a un [[cliente]].",
    "o": "Permite asociar cada compra con quien la solicitó y la paga."
   },
   {
    "a": "codigo_producto",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna a un [[producto]] del catálogo.",
    "o": "Permite pedir y recibir el producto exacto que el cliente necesita."
   },
   {
    "a": "codigo_proveedor",
    "v": "[1, 999999999]",
    "f": "NUM(9)",
    "n": "CÓDIGO",
    "s": "Número correlativo que se asigna a un [[proveedor]].",
    "o": "Permite asociar cada orden de compra con quien surte el producto."
   },
   {
    "a": "estado_orden_compra",
    "v": "TAB1",
    "f": "CHAR(1)",
    "n": "INDICADOR",
    "s": "Condición actual de una [[orden de compra]].",
    "o": "Indica en qué etapa del abastecimiento se encuentra el pedido."
   },
   {
    "a": "fecha_emision_orden",
    "v": "fecha lógica y válida",
    "f": "AAAA-MM-DD",
    "n": "FECHA",
    "s": "Fecha en la que se emite una [[orden de compra]].",
    "o": "Permite medir el tiempo de abastecimiento junto con la fecha de recepción."
   },
   {
    "a": "fecha_recepcion_producto",
    "v": "fecha lógica y válida",
    "f": "AAAA-MM-DD",
    "n": "FECHA",
    "s": "Fecha en la que el [[proveedor]] entrega el [[producto]].",
    "o": "Permite calcular el plazo real de entrega y evaluar al proveedor."
   },
   {
    "a": "monto_orden_compra",
    "v": "[0.01, 9999999999.9999]",
    "f": "NUM(14,4)",
    "n": "MONTO",
    "s": "Cantidad de dinero, en soles, que cuesta una [[orden de compra]].",
    "o": "Permite informar al [[cliente]] el costo de su abastecimiento."
   },
   {
    "a": "plazo_entrega_programado",
    "v": "[1, 365]",
    "f": "NUM(3)",
    "n": "NÚMERO",
    "s": "Número de días que el [[proveedor]] se compromete a tardar en entregar un [[pedido]].",
    "o": "Permite comparar lo prometido con lo real y calificar el cumplimiento del proveedor."
   },
   {
    "a": "precio_unitario",
    "v": "[0.01, 9999999999.9999]",
    "f": "NUM(14,4)",
    "n": "MONTO",
    "s": "Cantidad de dinero, en soles, que cuesta una [[unidad]] de [[producto]].",
    "o": "Permite calcular el monto de la orden de compra."
   }
  ],
  "glosario": [
   {
    "t": "cliente",
    "d": "Empresa que contrata el servicio de compras."
   },
   {
    "t": "orden de compra",
    "d": "Documento que formaliza un [[pedido]] a un [[proveedor]] con un precio acordado."
   },
   {
    "t": "pedido",
    "d": "Solicitud de [[producto]] que se hace a un [[proveedor]]."
   },
   {
    "t": "producto",
    "d": "Bien que el [[cliente]] necesita adquirir."
   },
   {
    "t": "proveedor",
    "d": "Empresa o persona que suministra los productos solicitados; no contrata el servicio."
   },
   {
    "t": "unidad",
    "d": "Cada ejemplar individual de un [[producto]]."
   }
  ],
  "tablas": [
   {
    "n": 1,
    "titulo": "Estado de la orden de compra",
    "cabecera": [
     "Código",
     "Descripción"
    ],
    "filas": [
     [
      "1",
      "Emitida"
     ],
     [
      "2",
      "Confirmada"
     ],
     [
      "3",
      "Recibida"
     ],
     [
      "4",
      "Cerrada"
     ]
    ],
    "atributos": [
     "estado_orden_compra"
    ]
   }
  ]
 }
];

  const MARCA = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const COLS = [['a', 'Atributo', 'c1'], ['v', 'Valores', 'c2'], ['f', 'Formato', 'c3'], ['n', 'Naturaleza', 'c4'], ['s', 'Semántica', 'c5'], ['o', 'Ontología', 'c6']];
  function escH(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function plano(t) { return String(t).replace(MARCA, function (_, k, v) { return v || k; }); }
  function marcar(t, sid) {
    return escH(t).replace(MARCA, function (_, k, v) {
      return '<button type="button" class="pal" data-sis="' + sid + '" data-k="' + k + '">' + (v || k) + '</button>';
    });
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function htmlTablaDic(s) {
    return '<div class="tabla-wrap"><table class="dic"><thead><tr>' +
      COLS.map(function (c) { return '<th scope="col" class="' + c[2] + '">' + c[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      s.filas.map(function (f) {
        return '<tr><td class="mono">' + f.a + '</td><td class="mono">' + escH(f.v) + '</td><td class="mono">' + f.f + '</td><td>' + f.n + '</td><td>' + marcar(f.s, s.id) + '</td><td>' + marcar(f.o, s.id) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function htmlGlosario(s) {
    return '<div class="tabla-wrap"><table class="dic gl"><thead><tr><th scope="col" class="c7">Término</th><th scope="col" class="c7">Definición</th></tr></thead><tbody>' +
      s.glosario.map(function (g) { return '<tr><td><b>' + cap(g.t) + '</b></td><td>' + marcar(g.d, s.id) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  }
  function htmlTablas(s) {
    return '<div class="tabs-val">' + s.tablas.map(function (t) {
      return '<div class="tab-caja' + (t.cabecera.length > 2 ? ' ancha' : '') + '"><h4><span class="etq k7">TAB ' + t.n + '</span> ' + escH(t.titulo) + '</h4>' +
        '<p class="usa">La usa: ' + t.atributos.map(function (a) { return '<code>' + a + '</code>'; }).join(', ') + '</p>' +
        '<table><thead><tr>' + t.cabecera.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        t.filas.map(function (f) { return '<tr>' + f.map(function (c) { return '<td>' + escH(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    }).join('') + '</div>';
  }
  function htmlSistema(s) {
    return '<div class="sis"><p class="sis-lead"><span class="etq k7">Ejemplo · ' + s.nombre + '</span> ' + escH(s.empresa) + '</p>' +
      '<h3 class="sis-h">Hoja 1 · Diccionario semántico ontológico</h3>' +
      '<p class="sis-nota">Ejemplo parcial: ' + s.filas.length + ' atributos. El diccionario completo de un sistema lleva de 40 a 80. Toca una palabra subrayada para ver su definición.</p>' +
      htmlTablaDic(s) +
      '<div class="casc no-print" data-sis="' + s.id + '" aria-live="polite" hidden></div>' +
      '<h3 class="sis-h">Hoja 2 · Definiciones</h3>' + htmlGlosario(s) +
      '<h3 class="sis-h">Hoja 3 · Tablas de valores</h3>' + htmlTablas(s) +
      '<div class="xl no-print"><button type="button" class="btn go" data-xl="' + s.id + '">Descargar este ejemplo en Excel</button><span class="xl-t">3 hojas: Diccionario, Definiciones y Tablas.</span>' +
      '<p class="xl-nota" hidden>Si el archivo no se descargó, abre la asesoría en una pestaña nueva con el botón del visor y vuelve a intentarlo.</p></div></div>';
  }

  /* Árbol de definiciones (atomización en cascada) generado desde el glosario */
  function arbol(sid, k, vistos) {
    const s = SISTEMAS.filter(function (x) { return x.id === sid; })[0];
    const g = s.glosario.filter(function (x) { return x.t === k; })[0];
    const hijos = []; String(g.d).replace(MARCA, function (_, kk) { if (hijos.indexOf(kk) < 0) hijos.push(kk); return ''; });
    return '<li><b>' + cap(k) + '.</b> ' + marcar(g.d, sid) +
      (hijos.length ? '<ul>' + hijos.map(function (kk) { return vistos.indexOf(kk) < 0 ? arbol(sid, kk, vistos.concat([k])) : ''; }).join('') + '</ul>' : '') + '</li>';
  }

  /* Contenido de cada pestaña de «Diccionario» */
  function fc(cl, q, reglas, errores, ejemplo, nota) {
    return '<div class="fc ' + cl + '"><p class="fc-q"><b>Responde:</b> ' + q + '</p><div class="fc-g">' +
      '<div class="fc-b"><h4>Reglas</h4><ul>' + reglas.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul></div>' +
      '<div class="fc-b er"><h4>Errores frecuentes</h4><ul>' + errores.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul></div></div>' +
      '<div class="fc-b ej">' + ejemplo + '</div>' + (nota ? '<div class="fc-b nt"><h4>Nota</h4>' + nota + '</div>' : '') + '</div>';
  }


  /* Las tres hojas del Excel, como fichas con pestaña, ícono y las columnas como etiquetas */
  function htmlHojas() {
    const ico = {
      tabla: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/></svg>',
      libro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6M9 12h6"/></svg>',
      lista: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><path d="M14 15h6M14 19h6"/></svg>'
    };
    const h = [
      ['Hoja 1', ico.tabla, 'Diccionario semántico ontológico', 'Un atributo por fila, en orden alfabético.', ['Atributo', 'Valores', 'Formato', 'Naturaleza', 'Semántica', 'Ontología'], ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']],
      ['Hoja 2', ico.libro, 'Definiciones', 'Cada palabra importante usada en la semántica y la ontología (atomización).', ['Término', 'Definición'], []],
      ['Hoja 3', ico.lista, 'Tablas de valores', 'Una tabla por cada TAB que aparece en Valores, numeradas 1, 2, 3…', ['Código', 'Descripción'], []]
    ];
    return '<h2>Las tres hojas del Excel</h2><div class="hojas">' + h.map(function (x) {
      return '<article class="hoja"><span class="hoja-t">' + x[0] + '</span>' + x[1] + '<h3>' + x[2] + '</h3><p>' + x[3] + '</p><ul>' +
        x[4].map(function (c, i) { return '<li' + (x[5][i] ? ' class="' + x[5][i] + '"' : '') + '>' + c + '</li>'; }).join('') + '</ul></article>';
    }).join('') + '</div>';
  }

  /* Semántica y ontología lado a lado: el sistema va como leyenda de color, no junto al atributo */
  function htmlDif() {
    const f = [
      ['sx1', 'dias_mora', 'Número de días transcurridos desde el vencimiento de la deuda, mientras sigue impaga.', 'Permite determinar el tipo de mora y, con él, el producto de cobranza que corresponde aplicar.'],
      ['sx2', 'cantidad_recibida', 'Número de unidades de producto que el proveedor entregó.', 'Permite verificar que el pedido se cumplió y detectar faltantes.'],
      ['sx3', 'medio_vehiculo', 'Tipo de soporte por el que el vehículo publicitario difunde el anuncio.', 'Permite calcular la tarifa y el alcance según el soporte utilizado.']
    ];
    return '<h2>Semántica y ontología, lado a lado</h2><div class="tabla-wrap"><table class="dic dif"><thead><tr><th scope="col" class="c1">Atributo</th><th scope="col" class="c5">Semántica · qué es</th><th scope="col" class="c6">Ontología · para qué</th></tr></thead><tbody>' +
      f.map(function (r) { return '<tr class="' + r[0] + '"><td><code>' + r[1] + '</code></td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="leyenda"><span class="lg-t">Sistema:</span><span class="lg sx1">Cobranza</span><span class="lg sx2">Compras</span><span class="lg sx3">Publicidad</span></p>';
  }

  /* Ficha de una fila (estilo Fichero): las seis columnas como cajitas de color, tomada de los datos */
  function htmlFicha() {
    const f = SISTEMAS[0].filas.filter(function (x) { return x.a === 'cantidad_paquete'; })[0];
    const campos = [['Atributo', f.a, 'c1', true], ['Valores', f.v, 'c2', true], ['Formato', f.f, 'c3', true], ['Naturaleza', f.n, 'c4', false], ['Semántica', plano(f.s), 'c5', false], ['Ontología', plano(f.o), 'c6', false]];
    return '<h2>Una fila, seis columnas</h2><div class="fch"><span class="fch-t">Ejemplo · ' + SISTEMAS[0].nombre + '</span>' +
      campos.map(function (c) { return '<div class="fch-r"><span class="fch-l ' + c[2] + '">' + c[0] + '</span><span' + (c[3] ? ' class="mono"' : '') + '>' + escH(c[1]) + '</span></div>'; }).join('') + '</div>';
  }

  const CHECK = [
    ['Entrego un Excel con las tres hojas: Diccionario, Definiciones y Tablas.', 'entregable', 'ent-hojas'],
    ['Tengo entre 40 y 80 atributos, todos relevantes para la misión de mi sistema.', 'entregable', 'ent-cantidad'],
    ['Los atributos están en orden alfabético.', 'entregable', 'ent-orden'],
    ['Cada atributo sale de mi parque de datos; si agregué uno, también está en el parque.', 'entregable', 'ent-parque'],
    ['Los nombres van en minúsculas, con guion bajo y sin conectores.', 'columnas', 'col-atributo'],
    ['Ningún atributo junta varios datos: todo está atomizado.', 'columnas', 'col-atributo'],
    ['Los valores numéricos son rangos cerrados, con mínimo y máximo; nunca un “mayor que” (&gt;) solo sin un tope.', 'columnas', 'col-valores'],
    ['Cada formato lleva su extensión y cuadra con la naturaleza y con los valores.', 'columnas', 'col-formato'],
    ['La naturaleza usa los nombres del libro.', 'columnas', 'col-naturaleza'],
    ['La semántica dice qué es el dato, sin explicar para qué sirve.', 'columnas', 'col-semantica'],
    ['La ontología dice para qué sirve el dato en mi sistema, sin repetir la semántica.', 'columnas', 'col-ontologia'],
    ['Las TAB están numeradas 1, 2, 3… en orden, y cada una tiene código y descripción.', 'atomizacion', 'ato-tab-num'],
    ['Las palabras clave de la semántica y la ontología están definidas, sin definiciones circulares.', 'atomizacion', 'ato-errores'],
    ['Preparé el PPT con las mismas tablas del Excel.', 'entregable', 'ent-ppt']
  ];
  function htmlChecklist() {
    return '<h2>Revisa tu trabajo antes de entregarlo</h2><p class="muted">Marca lo que ya revisaste en tu Excel. Tu avance se guarda en este navegador.</p>' +
      '<ul class="chk" id="chk-lista">' + CHECK.map(function (c, i) {
        return '<li><label><input type="checkbox" data-chk="' + i + '"><span>' + c[0] + '</span></label><button type="button" class="chk-ver no-print" data-ver="' + c[1] + '|' + c[2] + '">Ver</button></li>';
      }).join('') + '</ul><p class="chk-prog" aria-live="polite"><b class="chk-n">0</b> de ' + CHECK.length + ' revisados</p>' +
      '<p class="chk-ok" hidden><b>Revisión completa.</b> Tu entregable cumple lo que se explicó en esta asesoría. Falta que todo el grupo pueda explicarlo.</p>';
  }

  /* Las páginas salen de aquí. tipo 'inicio' (portada) · 'contenido' (bloques) · 'cierre' (Ponte a prueba, ZONA 2).
     Bloques disponibles: texto · tarjetas · acordeon · pestanas · tabla · imagen · aviso.
     Cualquier bloque o elemento con "id" puede ser destino de un enlace ver:['pagina','id']. */
  const DATOS = {
    portada: {
      titulo: 'Diccionario semántico ontológico',
      curso: 'MCD',
      lema: 'Un diccionario semántico ontológico reúne los atributos que necesita un sistema y define, de cada uno, qué es y para qué sirve en el negocio.',
      chips: [ETQ, 'Entrega de trabajo · grupal', 'Con Ponte a prueba'],
      principal: { texto: 'Empezar', ir: ['entregable'] },
      secundario: { texto: 'Ir a Ponte a prueba', ir: ['prueba'] }
    },
    paginas: [
      {
        id: 'inicio', nombre: 'Inicio', tipo: 'inicio',
        bloques: [
          { t: 'tarjetas', id: 'inicio-mapa', titulo: 'Qué vas a encontrar', cols: 3, items: [
            { k: 7, etq: 'Página 1', titulo: 'Entregable', html: 'Qué se entrega, cuántos atributos lleva y de dónde salen.', ir: ['entregable'] },
            { k: 7, etq: 'Página 2', titulo: 'Diccionario', html: 'Qué responde cada columna, sus reglas y sus errores frecuentes.', ir: ['columnas'] },
            { k: 7, etq: 'Página 3', titulo: 'Atomización y tablas', html: 'Cómo se define cada palabra y cómo se arman las TAB.', ir: ['atomizacion'] },
            { k: 7, etq: 'Página 4', titulo: 'Ejemplos', html: 'Seis sistemas con su diccionario, sus definiciones y sus tablas, y un Excel de cada uno.', ir: ['ejemplos'] },
            { k: 7, etq: 'Página 5', titulo: 'Ponte a prueba', html: 'Ocho preguntas, una por tema, con decisiones guiadas.', ir: ['prueba'] }
          ] }
        ]
      },
      {
        id: 'entregable', nombre: 'Entregable', tipo: 'contenido', titulo: 'Qué se entrega',
        intro: '<b>Un diccionario semántico ontológico</b> es el documento donde cada atributo del sistema queda definido: su significado (semántica) y su razón de ser para el negocio (ontología), junto con su formato y los valores que puede tomar.',
        bloques: [
          { t: 'tarjetas', id: 'ent-que', titulo: 'Qué debe tener tu trabajo', cols: 3, items: [
            { k: 7, etq: 'Excel', titulo: 'Tres hojas', html: 'Diccionario semántico ontológico, Definiciones y Tablas de valores.' },
            { id: 'ent-ppt', k: 7, etq: 'PPT', titulo: 'Presentación aparte', html: 'El profesor aprecia, y ha pedido, un PPT independiente del Excel con las mismas tablas para exponer.' },
            { k: 7, etq: 'Tamaño', titulo: 'De 40 a 80 atributos', html: 'Solo los más relevantes del parque de datos; no van todos.', ir: ['entregable', 'ent-atributos'] },
            { k: 7, etq: 'Formato', titulo: 'Siempre en tablas', html: 'Lo indispensable es que el trabajo esté en tablas y no en un texto corrido.' },
            { k: 7, etq: 'Atomización', titulo: 'Cada palabra, definida', html: 'Cada palabra importante de la semántica y de la ontología se define en su propio apartado.', ir: ['atomizacion', 'ato-que'] },
            { k: 7, etq: 'Exposición', titulo: 'Parque de datos a mano', html: 'Según lo visto en ciclos anteriores, 7 de cada 10 grupos que exponen sus diccionarios vuelven a presentar el parque de datos. Llévalo listo.' }
          ] },
          { t: 'texto', id: 'ent-hojas', html: htmlHojas() },
          { t: 'acordeon', id: 'ent-atributos', titulo: 'Los atributos del diccionario', items: [
            { id: 'ent-parque', k: 7, titulo: 'De dónde salen', html: '<p>Los atributos son los datos que se impactan durante las transacciones y salen de tu parque de datos. Si cambias o agregas atributos en el diccionario que no estaban en el parque, también debes incluirlos en el parque de datos.</p>' },
            { id: 'ent-filtro', k: 7, titulo: 'Cuáles entran: el filtro semántico', html: '<p>Un número grande de atributos vuelve complejo cualquier sistema, y podrían entrar datos que no corresponden. El límite lo marca la misión: entran los datos que hacen posible la misión del sistema, sin que sobren ni falten.</p><p><span class="etq k7">Ejemplo · Cobranza</span> <code>dias_mora</code> entra porque define qué producto de cobranza corresponde aplicar. El tipo de sangre del moroso no hace posible la misión y se descarta.</p>' },
            { id: 'ent-orden', k: 7, titulo: 'Orden alfabético, siempre', html: '<p>En la hoja del diccionario los atributos van siempre en orden alfabético. Si agregas uno después, vuelve a ordenar la hoja.</p>' },
            { id: 'ent-cantidad', k: 7, titulo: 'Cuántos: de 40 a 80', html: '<p>Se recomienda mantenerse dentro de ese rango, porque el diccionario reúne los atributos más relevantes y no todos los del parque de datos.</p>' }
          ] }
        ]
      },
      {
        id: 'columnas', nombre: 'Diccionario', tipo: 'contenido', titulo: 'Diccionario',
        intro: 'Cada atributo ocupa una fila, y cada columna responde una pregunta distinta. Cada columna conserva su color en toda la asesoría.',
        bloques: [
          { t: 'texto', id: 'col-ficha', html: htmlFicha() },
          { t: 'pestanas', id: 'col-tabs', titulo: 'Una columna a la vez', items: [
            { id: 'col-atributo', titulo: 'Atributo',
              html: fc('c1', '¿Cómo se llama el dato?',
                ['Todo en minúsculas, también la primera letra.', 'Las palabras se unen con guion bajo (<code>_</code>).', 'Sin conectores como de, la, el, lo, los, las, del, para o por.', 'Un atributo guarda un solo dato: si junta varios, se atomiza en varios atributos.', 'En la hoja del diccionario van en orden alfabético.', '<i>Recomendación:</i> sin tildes, sin ñ y sin abreviaturas, para que cada palabra pueda definirse.'],
                ['<code>Cantidad_Paquete</code>: mayúsculas.', '<code>cantidad-paquete</code>: guion medio en lugar de guion bajo.', '<code>cantidad_de_paquetes</code>: lleva un conector.', '<code>dimensiones_detectadas</code> guardando largo, ancho y alto juntos.'],
                '<span class="etq k7">Ejemplo · Transporte</span> En lugar de <code>dimensiones_detectadas</code> se escriben tres atributos: <code>largo_carga_detectado</code>, <code>ancho_carga_detectado</code> y <code>alto_carga_detectado</code>.<br><span class="etq k7">Ejemplo · Publicidad</span> La campaña se escribe <code>codigo_campania</code>, sin ñ.') },
            { id: 'col-valores', titulo: 'Valores',
              html: fc('c2', '¿Qué valores puede tomar el dato?',
                ['Si es numérico, va un rango matemático cerrado, con mínimo y máximo: <code>[1, 100]</code>.', 'Nunca un <code>&gt;0</code> solo: debe decir mayor a cero y también menor a qué.', 'Si el atributo se explica con una tabla, solo se escribe TAB y su número: <code>TAB2</code>.', 'Las tablas se numeran 1, 2, 3… según el orden en que aparecen en el diccionario alfabético.', 'El máximo debe caber en el formato: <code>NUM(3)</code> llega hasta 999.', 'Si es una fecha, se escribe <code>fecha lógica y válida</code>.'],
                ['<code>&gt;0</code> o <code>&gt;=0</code> sin tope superior.', '<code>1 a 100</code>: sin notación de rango.', 'Escribir los códigos dentro de la celda en lugar de usar TAB.', 'Tablas repetidas o con saltos, como TAB1 y TAB3 sin TAB2.'],
                '<span class="etq k7">Ejemplo · Almacenamiento</span> <code>cantidad_contenedor</code> lleva <code>[1, 100]</code> y <code>categoria_mercancia</code> lleva <code>TAB3</code>.',
                '<p>El libro del profesor escribe <code>&gt;0</code> como valor implícito, a modo de referencia. En el trabajo, el profesor pide poner siempre el límite superior.</p>') },
            { id: 'col-formato', titulo: 'Formato',
              html: fc('c3', '¿Cómo se guarda el dato?',
                ['<code>CHAR(n)</code> para texto y <code>NUM(n)</code> o <code>NUM(n,d)</code> para números, con la extensión máxima entre paréntesis.', '<code>NUM(5,2)</code> significa 5 dígitos en total, 2 de ellos decimales.', 'La fecha se escribe <code>AAAA-MM-DD</code>.', 'El formato debe cuadrar con la naturaleza y con los valores.'],
                ['<code>NUM</code> o <code>CHAR</code> sin la extensión.', '<code>CHAR(20)</code> para un estado que se guarda con un solo carácter.', 'Guardar una fecha como número.'],
                '<span class="etq k7">Ejemplo · Cobranza</span> <code>fecha_vencimiento_deuda</code> lleva <code>AAAA-MM-DD</code> y <code>estado_cobranza</code> lleva <code>CHAR(1)</code>.') },
            { id: 'col-naturaleza', titulo: 'Naturaleza',
              html: '<div class="fc c4"><p class="fc-q"><b>Responde:</b> ¿qué tipo de dato es, según cómo se presenta en el mundo real?</p>' +
                '<div class="tabla-wrap"><table class="dic"><thead><tr><th scope="col" class="c4">Naturaleza</th><th scope="col" class="c4">Qué es</th><th scope="col" class="c4">Formato típico</th><th scope="col" class="c4">Ejemplo</th></tr></thead><tbody>' +
                '<tr><td><b>CÓDIGO</b></td><td>Identifica a un elemento.</td><td class="mono">NUM(9) o CHAR(n)</td><td class="mono">codigo_sponsor</td></tr>' +
                '<tr><td><b>NOMBRE</b></td><td>Nombre o descripción.</td><td class="mono">CHAR(50)</td><td class="mono">nombre_moroso</td></tr>' +
                '<tr><td><b>MONTO</b></td><td>Cantidad de dinero.</td><td class="mono">NUM(14,4)</td><td class="mono">monto_deuda</td></tr>' +
                '<tr><td><b>NÚMERO</b></td><td>Cantidad o medida.</td><td class="mono">NUM(n) o NUM(n,d)</td><td class="mono">dias_mora</td></tr>' +
                '<tr><td><b>FECHA</b></td><td>Día del calendario.</td><td class="mono">AAAA-MM-DD</td><td class="mono">fecha_vencimiento_deuda</td></tr>' +
                '<tr><td><b>INDICADOR</b></td><td>Estado, tipo o categoría que se explica con una tabla.</td><td class="mono">CHAR(1)</td><td class="mono">estado_cobranza</td></tr>' +
                '</tbody></table></div>' +
                '<div class="fc-g"><div class="fc-b"><h4>Reglas</h4><ul><li>Usa estos nombres exactos. Al profesor le queda claro si escribes otro, pero conviene no depender de eso.</li><li>La extensión de <code>NOMBRE</code> y de <code>CÓDIGO</code> puede variar según el dato: <code>CHAR(100)</code> para un correo.</li></ul></div>' +
                '<div class="fc-b er"><h4>Errores frecuentes</h4><ul><li><b>CÓDIGO</b> para un estado: un código identifica, un estado indica una condición.</li><li><b>NÚMERO</b> para dinero: un monto va como <b>MONTO</b>, con decimales.</li></ul></div></div>' +
                '<div class="fc-b nt"><h4>Nota</h4><p>Las seis naturalezas son las del libro del profesor (2020). El libro usa <code>CHAR(1)</code> en los indicadores porque el carácter es el identificador del estado, y tenía entre 1 y 9 estados.</p></div></div>' },
            { id: 'col-semantica', titulo: 'Semántica',
              html: fc('c5', '¿qué es el dato?',
                ['Dice el significado universal del dato: sirve para cualquier sistema y no depende del tuyo.', 'Empieza por lo que el dato es: «Número de…», «Medida real de…», «Número correlativo que se asigna a…».', 'No dice para qué sirve: eso es la ontología.', 'No repite el nombre del atributo para definirse.', 'Cada palabra importante se define aparte (atomización).', 'Para definir las palabras, la fuente es primero el Diccionario de la lengua española y, si no alcanza, textos técnicos adaptados a tu sistema.'],
                ['Mezclar el para qué: «Permite determinar la efectividad de la campaña».', 'Repetir el nombre: «Alcance total del anuncio».', 'Definir con lo que cada integrante entiende por la palabra.'],
                '<span class="etq k7">Ejemplo · Publicidad</span> <code>alcance_total</code>: «Número total de personas que consumieron el anuncio durante toda la transmisión».') },
            { id: 'col-ontologia', titulo: 'Ontología',
              html: fc('c6', '¿para qué necesita mi sistema este dato?',
                ['Dice la razón de ser del dato en tu sistema: qué operación, cálculo o decisión permite.', 'Se deduce de la semántica, pero ya depende del sistema: el mismo dato puede servir para algo distinto en otro.', 'Puede empezar con «Permite conocer…», porque el profesor lo acepta. Conviene variar con identifica, indica, genera, define o determina.', 'No repite la semántica con otras palabras ni es una tautología.'],
                ['Copiar la semántica: «Fecha límite en la que la deuda debía pagarse».', 'Tautología: «Identifica la fecha de vencimiento de la deuda».', 'Una ontología que no dice qué operación del sistema habilita.'],
                '<span class="etq k7">Ejemplo · Cobranza</span> <code>fecha_vencimiento_deuda</code>: «Permite calcular los días de mora del moroso».') }
          ] },
          { t: 'texto', id: 'col-diferencia', html: htmlDif() },
          { t: 'acordeon', id: 'col-repaso', titulo: 'Para repasar con tu grupo', items: [
            { k: 7, titulo: '¿Por qué este atributo está en el diccionario?', html: '<p>Porque hace posible la misión del sistema (filtro semántico) y sale del parque de datos.</p>' },
            { k: 7, titulo: '¿Qué cambia si llevas este atributo a otro sistema?', html: '<p>La semántica no cambia, porque es universal. Lo que cambia es la ontología: el para qué de ese sistema.</p>' },
            { k: 7, titulo: '¿Por qué esos valores y no otros?', html: '<p>El rango o la tabla salen de la regla de negocio, y el máximo debe caber en el formato.</p>' },
            { k: 7, titulo: '¿Qué palabra de la semántica no definiste?', html: '<p>Cada palabra importante debe estar en la hoja Definiciones. Si falta una, se agrega, junto con las palabras con que se explica.</p>' },
            { k: 7, titulo: '¿Por qué esa naturaleza y ese formato?', html: '<p>La naturaleza dice cómo se presenta el dato en el mundo real, y de ella sale el formato.</p>' }
          ] }
        ]
      },
      {
        id: 'atomizacion', nombre: 'Atomización y tablas', tipo: 'contenido', titulo: 'Atomización y tablas',
        intro: 'Atomizar es preguntarse qué significa cada palabra que usas y definirla en su propio apartado.',
        bloques: [
          { t: 'aviso', id: 'ato-que', tipo: 'obs', titulo: 'Qué es atomizar',
            html: '<p>Cada palabra importante de la semántica y de la ontología se define aparte, en la hoja Definiciones. El libro lo presenta como una cascada: una definición se detalla con otras palabras, y estas con otras, hasta lograr la claridad necesaria.</p><p>Los conectores (de, la, el, un…) no necesitan definición.</p>' },
          { t: 'texto', id: 'ato-cascada', html: '<h2>La cascada de una palabra</h2><p class="muted"><span class="etq k7">Ejemplo · Cobranza</span> La semántica de <code>correo_garante</code> usa la palabra <b>garante</b>. Fíjate cómo cada definición lleva a otras, hasta llegar a palabras que ya se entienden por sí solas.</p><ul class="cascada">' + arbol('cobranza', 'garante', []) + '</ul>' },
          { t: 'acordeon', id: 'ato-tablas', titulo: 'Las tablas de valores (TAB)', items: [
            { id: 'ato-tab-num', k: 7, titulo: 'Numeración', html: '<p>Las TAB se numeran TAB1, TAB2, TAB3… según el orden en que aparecen en el diccionario alfabético. Si dos atributos usan la misma tabla, comparten el mismo número.</p><p><span class="etq k7">Ejemplo · Almacenamiento</span> <code>categoria_empaque_programada</code> y <code>categoria_empaque_real</code> usan la misma tabla, <code>TAB2</code>.</p>' },
            { id: 'ato-tab-forma', k: 7, titulo: 'Qué lleva una TAB', html: '<p>Un código y una descripción por fila. Los estados y las categorías llevan códigos de un solo carácter (1, 2, 3…), y el atributo se escribe con <code>CHAR(1)</code>. Las palabras clave de las descripciones también se definen.</p>' },
            { id: 'ato-tab-ej', k: 7, titulo: 'Cómo se ve una TAB', html: '<p><span class="etq k7">Ejemplo · Compras</span> El atributo <code>estado_orden_compra</code> lleva en Valores <code>TAB1</code>, y la hoja de tablas dice:</p><div class="tabs-val"><div class="tab-caja"><h4><span class="etq k7">TAB 1</span> Estado de la orden de compra</h4><table><thead><tr><th scope="col">Código</th><th scope="col">Descripción</th></tr></thead><tbody><tr><td>1</td><td>Emitida</td></tr><tr><td>2</td><td>Confirmada</td></tr><tr><td>3</td><td>Recibida</td></tr><tr><td>4</td><td>Cerrada</td></tr></tbody></table></div></div>' }
          ] },
          { t: 'acordeon', id: 'ato-errores', titulo: 'Errores frecuentes al definir', items: [
            { id: 'ato-err-circular', k: 7, titulo: 'Definiciones circulares', html: '<p>«Mercancía: lo que se guarda en el almacén» y «almacén: lugar donde se guarda la mercancía» se explican una a otra y no aclaran nada. Cada definición necesita palabras que se entiendan sin volver a la anterior.</p>' },
            { id: 'ato-err-faltan', k: 7, titulo: 'Palabras que quedan sin definir', html: '<p>Si una definición usa una palabra clave que no está en la hoja, se agrega. Así la cascada no queda incompleta.</p>' },
            { id: 'ato-err-fuente', k: 7, titulo: 'Definir con el significado real de la palabra', html: '<p>Cada palabra se define con su significado real: el que tiene en la lengua y en el contexto técnico de tu sistema. Ese significado sale primero del Diccionario de la lengua española y, si no alcanza, de textos técnicos adaptados a tu sistema; no sale de lo que un integrante crea ni de lo que escribió otro grupo.</p>'}
          ] }
        ]
      },
      {
        id: 'ejemplos', nombre: 'Ejemplos', tipo: 'contenido', titulo: 'Ejemplos',
        intro: 'Seis sistemas, cada uno visto como una empresa tercerizada. Muestran el método: cada ejemplo tiene entre 11 y 13 atributos, y el tuyo lleva de 40 a 80, siempre de tu propio sistema.',
        bloques: [
          { t: 'pestanas', id: 'ej-tabs', titulo: 'Un sistema a la vez', items: SISTEMAS.map(function (s) { return { id: 'ej-' + s.id, titulo: s.nombre, html: htmlSistema(s) }; }) },
          { t: 'aviso', tipo: 'tip', titulo: 'Cómo leer estos ejemplos', html: '<p>Todos respetan lo que viste: nombres en minúsculas, rangos cerrados, TAB correlativas y atributos en orden alfabético. Compara cómo cambia la ontología de un mismo tipo de dato, por ejemplo un código, de un sistema a otro.</p>' },
          { t: 'texto', id: 'ej-revision', html: htmlChecklist() }
        ]
      },
      { id: 'prueba', nombre: 'Ponte a prueba', tipo: 'cierre' }
    ]
  };

  /* ---------- Extensiones del curso: palabras clicables, descarga en Excel y checklist ----------
     Usan delegación de eventos sobre el contenedor; no tocan el motor (ZONA 3). */
  (function () {
    const raiz = document.querySelector('.asesoria-' + SLUG);
    if (!raiz) return;
    const KCHK = 'siga_aw_' + SLUG + '_' + EVAL + '_' + PERIODO + '_chk';
    const rastro = {};
    function sis(id) { return SISTEMAS.filter(function (x) { return x.id === id; })[0]; }
    function leer() { try { return JSON.parse(localStorage.getItem(KCHK) || '[]'); } catch (e) { return []; } }
    function guardar(a) { try { localStorage.setItem(KCHK, JSON.stringify(a)); } catch (e) { } }

    /* Cascada de definiciones */
    function pintarCasc(sid) {
      const panel = raiz.querySelector('.casc[data-sis="' + sid + '"]'); if (!panel) return;
      const tr = rastro[sid] || [];
      if (!tr.length) { panel.innerHTML = ''; panel.hidden = true; return; }
      const k = tr[tr.length - 1], g = sis(sid).glosario.filter(function (x) { return x.t === k; })[0];
      panel.hidden = false; panel.innerHTML = '<div class="casc-mig">' + tr.map(function (t, i) { return '<button type="button" class="casc-c" data-i="' + i + '" data-sis="' + sid + '">' + escH(t) + '</button>'; }).join('<span aria-hidden="true"> › </span>') +
        '<button type="button" class="casc-x" data-sis="' + sid + '">Cerrar</button></div><p class="casc-def"><b>' + escH(cap(k)) + '.</b> ' + marcar(g.d, sid) + '</p>';
    }
    function tocarPalabra(b) {
      const sid = b.getAttribute('data-sis'), k = b.getAttribute('data-k');
      if (!sis(sid) || !sis(sid).glosario.some(function (x) { return x.t === k; })) return;
      const enPanel = !!b.closest('.casc'), tr = rastro[sid] || [];
      if (enPanel) { const i = tr.indexOf(k); rastro[sid] = i >= 0 ? tr.slice(0, i + 1) : tr.concat([k]); }
      else rastro[sid] = [k];
      pintarCasc(sid);
    }

    /* Excel (.xlsx) sin librerías: ZIP sin compresión + XML de hojas */
    const TCRC = (function () { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
    function crc32(d) { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = TCRC[(c ^ d[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
    function zip(files) {
      const enc = new TextEncoder(), partes = [], central = []; let off = 0;
      files.forEach(function (f) {
        const nom = enc.encode(f.n), dat = enc.encode(f.d), crc = crc32(dat), tam = dat.length;
        const lh = new DataView(new ArrayBuffer(30));
        lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true);
        lh.setUint32(14, crc, true); lh.setUint32(18, tam, true); lh.setUint32(22, tam, true); lh.setUint16(26, nom.length, true); lh.setUint16(28, 0, true);
        partes.push(new Uint8Array(lh.buffer), nom, dat);
        const ch = new DataView(new ArrayBuffer(46));
        ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true);
        ch.setUint32(16, crc, true); ch.setUint32(20, tam, true); ch.setUint32(24, tam, true); ch.setUint16(28, nom.length, true); ch.setUint32(42, off, true);
        central.push(new Uint8Array(ch.buffer), nom);
        off += 30 + nom.length + tam;
      });
      const tc = central.reduce(function (a, c) { return a + c.length; }, 0), fin = new DataView(new ArrayBuffer(22));
      fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, files.length, true); fin.setUint16(10, files.length, true); fin.setUint32(12, tc, true); fin.setUint32(16, off, true);
      const todo = partes.concat(central, [new Uint8Array(fin.buffer)]), total = todo.reduce(function (a, c) { return a + c.length; }, 0), out = new Uint8Array(total); let p = 0;
      todo.forEach(function (c) { out.set(c, p); p += c.length; });
      return out;
    }
    function xe(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function celda(r, c, t, st) { return '<c r="' + String.fromCharCode(65 + c) + (r + 1) + '" t="inlineStr"' + (st ? ' s="' + st + '"' : '') + '><is><t xml:space="preserve">' + xe(t) + '</t></is></c>'; }
    function hoja(filas, anchos, congelar) {
      return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0">' +
        (congelar ? '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' : '') + '</sheetView></sheetViews><cols>' +
        anchos.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join('') + '</cols><sheetData>' +
        filas.map(function (f, i) { return '<row r="' + (i + 1) + '">' + f.map(function (c, j) { return celda(i, j, c[0], c[1]); }).join('') + '</row>'; }).join('') + '</sheetData></worksheet>';
    }
    function crearXlsx(s) {
      const rellenos = ['F3E1F8', 'E3F4D4', 'FFE3D8', 'FFF0C9', 'D2F3EE', 'FFDFEC', 'F1E8DC'];
      const estilos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
        '<fills count="9"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
        rellenos.map(function (c) { return '<fill><patternFill patternType="solid"><fgColor rgb="FF' + c + '"/><bgColor indexed="64"/></patternFill></fill>'; }).join('') + '</fills>' +
        '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFBBBBBB"/></left><right style="thin"><color rgb="FFBBBBBB"/></right><top style="thin"><color rgb="FFBBBBBB"/></top><bottom style="thin"><color rgb="FFBBBBBB"/></bottom><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="9">' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' +
        [2, 3, 4, 5, 6, 7, 8].map(function (f) { return '<xf numFmtId="0" fontId="1" fillId="' + f + '" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'; }).join('') +
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
      const dic = [COLS.map(function (c, i) { return [c[1], i + 1]; })].concat(s.filas.map(function (f) { return [[f.a, 0], [f.v, 0], [f.f, 0], [f.n, 0], [plano(f.s), 0], [plano(f.o), 0]]; }));
      const def = [[['Término', 7], ['Definición', 7]]].concat(s.glosario.map(function (g) { return [[cap(g.t), 0], [plano(g.d), 0]]; }));
      const tab = []; s.tablas.forEach(function (t) {
        tab.push([['TAB ' + t.n + ' · ' + t.titulo + '  (la usa: ' + t.atributos.join(', ') + ')', 8]]);
        tab.push(t.cabecera.map(function (c) { return [c, 7]; }));
        t.filas.forEach(function (f) { tab.push(f.map(function (c) { return [c, 0]; })); });
        tab.push([['', 0]]);
      });
      return zip([
        { n: '[Content_Types].xml', d: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
        { n: '_rels/.rels', d: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
        { n: 'xl/workbook.xml', d: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Diccionario" sheetId="1" r:id="rId1"/><sheet name="Definiciones" sheetId="2" r:id="rId2"/><sheet name="Tablas" sheetId="3" r:id="rId3"/></sheets></workbook>' },
        { n: 'xl/_rels/workbook.xml.rels', d: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
        { n: 'xl/styles.xml', d: estilos },
        { n: 'xl/worksheets/sheet1.xml', d: hoja(dic, [30, 24, 14, 14, 62, 62], true) },
        { n: 'xl/worksheets/sheet2.xml', d: hoja(def, [28, 90], true) },
        { n: 'xl/worksheets/sheet3.xml', d: hoja(tab, [14, 34, 30, 60], false) }
      ]);
    }
    function descargar(id, boton) {
      const s = sis(id); if (!s) return;
      const blob = new Blob([crearXlsx(s)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'diccionario_' + id + '_ejemplo.xlsx'; document.body.appendChild(a); a.click();
      try { window.dispatchEvent(new CustomEvent('siga:asesoria-evento', { detail: { accion: 'excel', detalle: id } })); } catch (e) { /* el registro nunca debe romper la descarga */ }
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
      const nota = boton.parentNode.querySelector('.xl-nota'); if (nota) nota.hidden = false;
    }

    /* Checklist con avance guardado */
    function pintarChk() {
      const marcados = leer(), cajas = raiz.querySelectorAll('input[data-chk]');
      Array.prototype.forEach.call(cajas, function (c) { c.checked = marcados.indexOf(Number(c.getAttribute('data-chk'))) >= 0; });
      const n = Array.prototype.filter.call(cajas, function (c) { return c.checked; }).length;
      const ne = raiz.querySelector('.chk-n'), ok = raiz.querySelector('.chk-ok');
      if (ne) ne.textContent = n; if (ok) ok.hidden = n !== CHECK.length;
    }

    raiz.addEventListener('click', function (e) {
      const t = e.target; if (!t || !t.closest) return;
      const pal = t.closest('.pal'); if (pal) { tocarPalabra(pal); return; }
      const cc = t.closest('.casc-c'); if (cc) { const sid = cc.getAttribute('data-sis'); rastro[sid] = (rastro[sid] || []).slice(0, Number(cc.getAttribute('data-i')) + 1); pintarCasc(sid); return; }
      const cx = t.closest('.casc-x'); if (cx) { const sid = cx.getAttribute('data-sis'); rastro[sid] = []; pintarCasc(sid); return; }
      const xl = t.closest('[data-xl]'); if (xl) { descargar(xl.getAttribute('data-xl'), xl); return; }
      const vr = t.closest('[data-ver]'); if (vr) { const d = vr.getAttribute('data-ver').split('|'); go(d[0], d[1]); return; }
    });
    raiz.addEventListener('change', function (e) {
      const c = e.target; if (!c || !c.matches || !c.matches('input[data-chk]')) return;
      const i = Number(c.getAttribute('data-chk')), a = leer().filter(function (x) { return x !== i; });
      if (c.checked) a.push(i); guardar(a); pintarChk();
    });
    setTimeout(pintarChk, 0);
  })();
  /* <<<<<<<<<< FIN ZONA 1 <<<<<<<<<< */

  /* >>>>>>>>>> ZONA 2 · DEFENSA GUIADA >>>>>>>>>>
     Una pregunta = un ejercicio FIJO con 3 a 6 bloques de decisión.
     Cada bloque: 3 alternativas (1 correcta + 2 errores típicos que difieren en una sola idea).
       ok:1 + explica      -> la correcta y por qué
       err + msg + ver     -> etiqueta del error, explicación específica y enlace [pagina, id] al punto donde se explicó
     pista: 1.ª pista orienta; la 2.ª descarta una alternativa incorrecta y ofrece «Ver dónde se explicó».
     Solo errores contra criterios REALES del profesor o del material; nunca inventados. */
  function opOk(html, explica) { return { ok: 1, html: html, explica: explica }; }
  function opEr(html, err, msg, ver) { return { html: html, err: err, msg: msg, ver: ver }; }
  const CIERRE = {
    titulo: 'Ponte a prueba',
    intro: 'Mide cómo vas antes de entregar tu diccionario. Si dudas, pide una pista; si te equivocas, verás dónde se explicó.',
    nota: 'Práctica sin nota: nadie ve tus respuestas.',
    preguntas: [
      {
        id: 'q1', titulo: 'Nombrar atributos', desc: 'Escribe bien los nombres de atributos de transporte y de publicidad.', tiempo: '3 min',
        enunciado: '<p>Sistema de transporte: una empresa tercerizada que traslada la carga de su cliente, el remitente. Nombra los atributos como los pondrías en tu diccionario.</p>',
        bloques: [
          { titulo: '¿Cómo se escribe el nombre del atributo que guarda el número de unidades de carga que el destinatario contó al recibirla?',
            intro: 'Fíjate en la primera letra y en las palabras que unen el nombre.',
            ops: [opOk('<code>cantidad_recibida</code>', 'Va en minúsculas, con guion bajo y sin conectores.'),
              opEr('<code>Cantidad_recibida</code>', 'Mayúscula inicial', 'Todo va en minúsculas, también la primera letra.', ['columnas', 'col-atributo']),
              opEr('<code>cantidad_de_carga_recibida</code>', 'Lleva un conector', 'Los nombres no llevan conectores como «de».', ['columnas', 'col-atributo'])],
            pista: 'Busca el nombre que está todo en minúsculas y que no usa palabras de enlace.' },
          { titulo: 'La carga tiene largo, ancho y alto. ¿Cómo registras las medidas reales?',
            intro: 'Un atributo guarda un solo dato.',
            ops: [opOk('Tres atributos: <code>largo_carga_detectado</code>, <code>ancho_carga_detectado</code> y <code>alto_carga_detectado</code>.', 'Cada medida es un dato distinto: se atomiza para validarla y usarla por separado.'),
              opEr('Un atributo <code>dimensiones_detectadas</code> con largo, ancho y alto juntos.', 'Tres datos en uno', 'Un atributo guarda un solo dato; juntar tres impide validarlos y usarlos por separado.', ['columnas', 'col-atributo']),
              opEr('Dos atributos, largo y ancho; el alto se deduce del tamaño de la unidad de transporte.', 'Dato omitido', 'El alto es un dato real de la carga: no se deduce de otro dato.', ['columnas', 'col-atributo'])],
            pista: 'Pregúntate cuántos datos distintos hay en esas medidas.' },
          { titulo: 'Sistema de publicidad: ¿cómo se escribe el atributo del código de campaña?',
            intro: 'Recuerda la recomendación sobre ñ, tildes y abreviaturas.',
            ops: [opOk('<code>codigo_campania</code>', 'Sin ñ y sin abreviaturas: cada palabra puede definirse.'),
              opEr('<code>codigo_campaña</code>', 'Lleva ñ', 'La asesoría recomienda evitar la ñ y las tildes en los nombres.', ['columnas', 'col-atributo']),
              opEr('<code>cod_campania</code>', 'Abreviatura', 'Una abreviatura no se puede definir como palabra: se escribe completa.', ['columnas', 'col-atributo'])],
            pista: 'Cada palabra del nombre debe poder definirse después en la hoja Definiciones.' }
        ],
        solucion: '<p>Los nombres van en minúsculas, unidos por guion bajo, sin conectores y con un solo dato cada uno: <code>cantidad_recibida</code>; <code>largo_carga_detectado</code>, <code>ancho_carga_detectado</code> y <code>alto_carga_detectado</code>; y <code>codigo_campania</code>.</p>',
        llevate: 'Un nombre claro: minúsculas, guion bajo, sin conectores y con un solo dato.'
      },
      {
        id: 'q2', titulo: 'Valores y formato', desc: 'Cierra rangos, elige formatos y numera tablas en almacenamiento.', tiempo: '4 min',
        enunciado: '<p>Sistema de almacenamiento: una empresa tercerizada que guarda la mercancía de su cliente. En el diccionario alfabético, <code>categoria_contenedor</code> usa TAB1 y <code>categoria_empaque_real</code> usa TAB2.</p>',
        bloques: [
          { titulo: '<code>cantidad_contenedor</code> reserva entre 1 y 100 contenedores por ticket. ¿Qué escribes en Valores?',
            intro: 'Piensa qué debe decir un rango numérico.',
            ops: [opOk('<code>[1, 100]</code>', 'Es un rango cerrado: lleva mínimo y máximo.'),
              opEr('<code>&gt;0</code>', 'Sin límite superior', 'Dice mayor a qué, pero no menor a qué: falta el tope.', ['columnas', 'col-valores']),
              opEr('<code>1 a 100</code>', 'Sin notación de rango', 'Los valores numéricos se escriben como rango matemático.', ['columnas', 'col-valores'])],
            pista: 'Busca la opción que escribe los dos extremos con la notación de rango.' },
          { titulo: '¿Qué formato corresponde a ese atributo?',
            intro: 'El formato lleva la extensión máxima del dato.',
            ops: [opOk('<code>NUM(3)</code>', 'Es un número de hasta tres dígitos: llega hasta 999.'),
              opEr('<code>CHAR(3)</code>', 'Formato de texto', 'Un número se guarda como NUM, no como CHAR.', ['columnas', 'col-formato']),
              opEr('<code>NUM</code>', 'Sin extensión', 'El formato lleva entre paréntesis la extensión que puede llegar a tener.', ['columnas', 'col-formato'])],
            pista: 'Mira si el dato es número o texto y si el formato dice su extensión.' },
          { titulo: '<code>categoria_mercancia</code> se explica con una tabla de 7 categorías. ¿Qué escribes en Valores?',
            intro: 'Recuerda cómo se numeran las tablas.',
            ops: [opOk('<code>TAB3</code>', 'Es la tercera tabla que aparece en el diccionario alfabético.'),
              opEr('<code>TAB5</code>', 'Salta la numeración', 'La numeración es correlativa: 1, 2, 3… sin saltos.', ['atomizacion', 'ato-tab-num']),
              opEr('<code>TAB2</code>', 'Repite una tabla', 'TAB2 ya explica la categoría de empaque: cada concepto tiene su propia tabla.', ['atomizacion', 'ato-tab-num'])],
            pista: 'Cuenta las tablas que ya aparecieron antes en el diccionario.' }
        ],
        solucion: '<p><code>cantidad_contenedor</code> lleva <code>[1, 100]</code> en Valores y <code>NUM(3)</code> en Formato. <code>categoria_mercancia</code> lleva <code>TAB3</code> y <code>CHAR(1)</code>, porque es la tercera tabla del diccionario alfabético.</p>',
        llevate: 'Rango cerrado con mínimo y máximo, formato con su extensión y TAB correlativas.'
      },
      {
        id: 'q3', titulo: 'Naturaleza', desc: 'Elige naturaleza y formato de atributos de cobranza.', tiempo: '4 min',
        enunciado: '<p>Sistema de cobranza: una empresa tercerizada que gestiona el cobro de los morosos de su sponsor. Elige la naturaleza y el formato de cada atributo.</p>',
        bloques: [
          { titulo: '<code>fecha_vencimiento_deuda</code>',
            intro: 'Piensa en qué es el dato en el mundo real.',
            ops: [opOk('FECHA · <code>AAAA-MM-DD</code>', 'Es un día del calendario.'),
              opEr('NÚMERO · <code>NUM(8)</code>', 'Fecha como número', 'Una fecha no es una cantidad: va como FECHA, que exige una fecha lógica y válida.', ['columnas', 'col-naturaleza']),
              opEr('CÓDIGO · <code>CHAR(10)</code>', 'Fecha como código', 'Un código identifica a un elemento; una fecha indica un día.', ['columnas', 'col-naturaleza'])],
            pista: 'Pregúntate si el dato identifica, cuenta o señala un día.' },
          { titulo: '<code>monto_deuda</code>, la cantidad de dinero que debe el moroso',
            intro: 'El dinero tiene su propia naturaleza.',
            ops: [opOk('MONTO · <code>NUM(14,4)</code>', 'Es dinero: MONTO, con decimales.'),
              opEr('NÚMERO · <code>NUM(9)</code>', 'Dinero como número', 'Un monto es dinero y lleva decimales: se escribe como MONTO.', ['columnas', 'col-naturaleza']),
              opEr('NOMBRE · <code>CHAR(50)</code>', 'Cantidad como texto', 'Un monto es una cantidad de dinero, no un texto.', ['columnas', 'col-naturaleza'])],
            pista: 'Busca la naturaleza pensada para cantidades de dinero.' },
          { titulo: '<code>estado_cobranza</code>, con tres estados que salen de una tabla',
            intro: 'Un estado indica una condición.',
            ops: [opOk('INDICADOR · <code>CHAR(1)</code>', 'Los estados con tabla son indicadores y se guardan con un solo carácter.'),
              opEr('CÓDIGO · <code>NUM(9)</code>', 'Estado como código', 'Un código identifica; un estado indica una condición y se guarda con un solo carácter.', ['columnas', 'col-naturaleza']),
              opEr('NOMBRE · <code>CHAR(50)</code>', 'Estado como nombre libre', 'Los valores de un estado salen de una tabla, no de un texto libre.', ['columnas', 'col-naturaleza'])],
            pista: 'Piensa en la naturaleza que usa CHAR(1) y una tabla.' },
          { titulo: '<code>dias_mora</code>, el número de días transcurridos sin pago',
            intro: 'Es una cantidad, pero no es dinero.',
            ops: [opOk('NÚMERO · <code>NUM(4)</code>', 'Cuenta días: es una cantidad.'),
              opEr('MONTO · <code>NUM(14,4)</code>', 'Días como dinero', 'Son días, no dinero: MONTO es solo para cantidades de dinero.', ['columnas', 'col-naturaleza']),
              opEr('CÓDIGO · <code>NUM(9)</code>', 'Cantidad como código', 'No identifica a nadie: mide una cantidad de días.', ['columnas', 'col-naturaleza'])],
            pista: 'Pregúntate si el dato identifica o mide.' }
        ],
        solucion: '<p><code>fecha_vencimiento_deuda</code> es FECHA con <code>AAAA-MM-DD</code>; <code>monto_deuda</code> es MONTO con <code>NUM(14,4)</code>; <code>estado_cobranza</code> es INDICADOR con <code>CHAR(1)</code> y su tabla; <code>dias_mora</code> es NÚMERO con <code>NUM(4)</code>.</p>',
        llevate: 'La naturaleza sale de cómo se presenta el dato en el mundo real, y de ella sale el formato.'
      },
      {
        id: 'q4', titulo: 'Semántica', desc: 'Redacta y define la semántica de un atributo de publicidad.', tiempo: '3 min',
        enunciado: '<p>Sistema de publicidad: una empresa tercerizada que planifica y difunde campañas publicitarias para su cliente.</p>',
        bloques: [
          { titulo: '¿Cuál es la mejor semántica de <code>alcance_total</code>?',
            intro: 'La semántica dice qué es el dato.',
            ops: [opOk('Número total de personas que consumieron el anuncio durante toda la transmisión.', 'Dice qué es el dato, sin explicar para qué sirve.'),
              opEr('Permite determinar la efectividad de la campaña publicitaria.', 'Es una ontología', 'Eso dice para qué sirve el dato: es la ontología, no la semántica.', ['columnas', 'col-semantica']),
              opEr('Alcance total del anuncio.', 'Repite el nombre', 'Repetir el nombre no explica qué es el dato.', ['columnas', 'col-semantica'])],
            pista: 'Busca la opción que describe el dato sin decir para qué se usa.' },
          { titulo: 'En esa semántica aparece la palabra «transmisión». ¿Qué haces con ella?',
            intro: 'Piensa en la atomización.',
            ops: [opOk('La defino aparte, en la hoja Definiciones.', 'Atomizar es definir cada palabra importante en su propio apartado.'),
              opEr('La dejo sin definir, porque se entiende.', 'Palabra sin definir', 'Cada palabra importante se define aparte, aunque parezca conocida.', ['atomizacion', 'ato-que']),
              opEr('La explico dentro de la misma celda de semántica.', 'Definición en la celda', 'La definición va en su propio apartado, no dentro de la celda.', ['atomizacion', 'ato-que'])],
            pista: 'La hoja Definiciones existe para esto.' },
          { titulo: '¿De dónde sale el significado de una palabra para definirla?',
            intro: 'Hay un orden de fuentes.',
            ops: [opOk('Primero del Diccionario de la lengua española y, si no alcanza, de textos técnicos adaptados a mi sistema.', 'Son fuentes formales, y se adaptan al sistema para evitar ambigüedad.'),
              opEr('De lo que cada integrante entiende por la palabra.', 'Criterio personal', 'El significado no depende de cada integrante: sale de fuentes formales.', ['atomizacion', 'ato-err-fuente']),
              opEr('De la definición que escribió otro grupo para un sistema parecido.', 'Copiar a otro grupo', 'El trabajo de otro grupo no es una fuente de significado.', ['atomizacion', 'ato-err-fuente'])],
            pista: 'Descarta las opciones que dependen de personas y no de fuentes formales.' }
        ],
        solucion: '<p>La semántica de <code>alcance_total</code> es «Número total de personas que consumieron el anuncio durante toda la transmisión». La palabra «transmisión» se define aparte en la hoja Definiciones, a partir del Diccionario de la lengua española y, si no alcanza, de textos técnicos adaptados al sistema.</p>',
        llevate: 'La semántica dice qué es el dato, y cada palabra importante se define aparte.'
      },
      {
        id: 'q5', titulo: 'Ontología', desc: 'Distingue la ontología de la semántica en atributos de cobranza.', tiempo: '4 min',
        enunciado: '<p>Sistema de cobranza: una empresa tercerizada que gestiona el cobro de los morosos de su sponsor.</p>',
        bloques: [
          { titulo: '¿Cuál es la mejor ontología de <code>fecha_vencimiento_deuda</code>?',
            intro: 'La ontología dice para qué sirve el dato en tu sistema.',
            ops: [opOk('Permite calcular los días de mora del moroso.', 'Dice qué cálculo del sistema habilita el dato.'),
              opEr('Fecha límite en la que la deuda debía pagarse.', 'Es la semántica', 'Eso dice qué es el dato: es la semántica.', ['columnas', 'col-ontologia']),
              opEr('Identifica la fecha de vencimiento de la deuda.', 'Tautología', 'Repite el nombre del atributo y no dice para qué sirve.', ['columnas', 'col-ontologia'])],
            pista: 'Busca la opción que conecta la fecha con algo que el sistema calcula.' },
          { titulo: 'La ontología responde a una pregunta. ¿Cuál?',
            intro: 'Cada columna responde una pregunta distinta.',
            ops: [opOk('¿Para qué necesita mi sistema este dato?', 'Es la pregunta de la ontología.'),
              opEr('¿Qué significa el dato en el Diccionario de la lengua española?', 'Pregunta de la semántica', 'Esa es la pregunta de la semántica.', ['columnas', 'col-semantica']),
              opEr('¿Cómo se guarda el dato?', 'Pregunta del formato', 'Esa es la pregunta del formato.', ['columnas', 'col-formato'])],
            pista: 'La ontología es la única columna que depende de tu sistema.' },
          { titulo: '¿Cuál es la mejor ontología de <code>correo_garante</code>?',
            intro: 'Debe decir qué operación habilita el dato.',
            ops: [opOk('Permite comunicarse con el garante mediante el canal Correo.', 'Dice qué operación habilita: la comunicación por correo.'),
              opEr('Dirección de correo electrónico del garante.', 'Es la semántica', 'Dice qué es el dato; falta decir para qué sirve.', ['columnas', 'col-ontologia']),
              opEr('Permite conocer la dirección de correo del garante.', 'Repite la semántica', 'Solo cambia las palabras de la semántica: no dice qué operación habilita.', ['columnas', 'col-ontologia'])],
            pista: 'Pregúntate qué hace el sistema con ese correo.' },
          { titulo: '¿Puede una ontología empezar con «Permite conocer…»?',
            intro: 'Piensa en lo que acepta el profesor.',
            ops: [opOk('Sí, el profesor lo acepta, siempre que diga para qué sirve el dato en el sistema.', 'Lo importante es lo que dice el resto de la frase.'),
              opEr('No: está prohibido repetir esa expresión.', 'Prohibición inventada', 'El profesor acepta que se repita; lo importante es el para qué.', ['columnas', 'col-ontologia']),
              opEr('Sí, y puede ser lo único que dice.', 'Frase incompleta', '«Permite conocer» solo abre la frase: debe completarse con el para qué.', ['columnas', 'col-ontologia'])],
            pista: 'La expresión se acepta, pero no alcanza sola.' }
        ],
        solucion: '<p>La ontología dice para qué necesita el sistema el dato: <code>fecha_vencimiento_deuda</code> permite calcular los días de mora, y <code>correo_garante</code> permite comunicarse con el garante mediante el canal Correo. Puede empezar con «Permite conocer…» si se completa con el para qué.</p>',
        llevate: 'La ontología responde para qué necesita tu sistema el dato, sin repetir la semántica.'
      },
      {
        id: 'q6', titulo: 'Tablas TAB', desc: 'Ordena y numera las tablas de valores de capacitación.', tiempo: '4 min',
        enunciado: '<p>Sistema de capacitación: una empresa tercerizada que capacita al personal de otras empresas. Estos atributos se explican con una tabla: <code>criterio_evaluacion</code>, <code>escala_calificacion</code>, <code>estado_acceso</code> y <code>estado_aprobacion_actividad</code>.</p>',
        bloques: [
          { titulo: '¿En qué orden van los atributos en la hoja del diccionario?',
            intro: 'Hay un solo orden válido.',
            ops: [opOk('En orden alfabético: <code>criterio_evaluacion</code> antes que <code>escala_calificacion</code>.', 'Los atributos van siempre en orden alfabético.'),
              opEr('Por importancia: primero los que más se usan.', 'Orden por importancia', 'Los atributos van siempre en orden alfabético.', ['entregable', 'ent-orden']),
              opEr('Por el orden en que se te ocurrieron.', 'Orden de aparición', 'El orden no depende de cuándo se pensó el atributo: es alfabético.', ['entregable', 'ent-orden'])],
            pista: 'Piensa en cómo se ordena un diccionario.' },
          { titulo: '<code>criterio_evaluacion</code> usa TAB1, <code>escala_calificacion</code> usa TAB2 y <code>estado_acceso</code> usa TAB3. ¿Qué escribes en Valores de <code>estado_aprobacion_actividad</code>?',
            intro: 'Las tablas se numeran por orden de aparición.',
            ops: [opOk('<code>TAB4</code>', 'Es la cuarta tabla distinta del diccionario alfabético.'),
              opEr('<code>TAB3</code>', 'Repite una tabla', 'TAB3 ya explica el estado de acceso: cada concepto tiene su propia tabla.', ['atomizacion', 'ato-tab-num']),
              opEr('<code>TAB6</code>', 'Salta la numeración', 'La numeración es correlativa, sin saltos.', ['atomizacion', 'ato-tab-num'])],
            pista: 'Cuenta cuántas tablas distintas ya aparecieron.' },
          { titulo: '<code>estado_acceso</code> tiene 6 estados. ¿Cómo se escriben sus códigos y su formato?',
            intro: 'Recuerda cómo se guardan los estados.',
            ops: [opOk('Códigos de un carácter (1 a 6) y formato <code>CHAR(1)</code>.', 'El carácter es el identificador del estado.'),
              opEr('Siglas de tres letras (HAB, DES, BLO…) y formato <code>CHAR(3)</code>.', 'Siglas largas', 'Los estados llevan un carácter identificador: <code>CHAR(1)</code>.', ['columnas', 'col-naturaleza']),
              opEr('Los códigos van escritos dentro de la celda Valores.', 'Códigos en Valores', 'En Valores solo va TAB y su número; los códigos van en la tabla.', ['columnas', 'col-valores'])],
            pista: 'Piensa cuántos caracteres usa el libro para identificar un estado.' },
          { titulo: '¿Qué columnas lleva cada tabla de valores?',
            intro: 'Piensa en lo que una tabla debe permitir.',
            ops: [opOk('Código y descripción.', 'El código identifica el valor y la descripción dice qué significa.'),
              opEr('Solo la descripción.', 'Falta el código', 'Sin código no se puede guardar ni identificar el valor.', ['atomizacion', 'ato-tab-forma']),
              opEr('El atributo y su formato.', 'Datos del diccionario', 'Eso está en el diccionario; la tabla lista los valores posibles.', ['atomizacion', 'ato-tab-forma'])],
            pista: 'La tabla lista valores: ¿qué necesitas para identificarlos y entenderlos?' }
        ],
        solucion: '<p>Los atributos van en orden alfabético; <code>estado_aprobacion_actividad</code> usa <code>TAB4</code> porque es la cuarta tabla distinta; los estados llevan códigos de un carácter y <code>CHAR(1)</code>; y cada tabla lleva código y descripción.</p>',
        llevate: 'Orden alfabético, TAB correlativas, estados con un carácter y tablas con código y descripción.'
      },
      {
        id: 'q7', titulo: 'Atomización', desc: 'Decide qué palabras se definen y cómo se encadenan en almacenamiento.', tiempo: '4 min',
        enunciado: '<p>Sistema de almacenamiento: una empresa tercerizada que guarda la mercancía de su cliente. La semántica de <code>cantidad_paquete</code> es «Número de paquetes embalados de una mercancía».</p>',
        bloques: [
          { titulo: '¿Qué palabras de esa semántica defines aparte?',
            intro: 'Se definen las palabras clave.',
            ops: [opOk('Paquete, embalaje y mercancía, que son las palabras clave.', 'Son las palabras que aportan el significado del dato.'),
              opEr('Todas, incluidas «de» y «una».', 'Conectores', 'Los conectores no necesitan definición.', ['atomizacion', 'ato-que']),
              opEr('Ninguna: la semántica ya define el atributo.', 'Sin atomizar', 'La semántica usa palabras clave que también deben definirse.', ['atomizacion', 'ato-que'])],
            pista: 'Descarta las palabras de enlace y quédate con las que dan significado.' },
          { titulo: 'La definición de «almacén» es «Lugar donde se ubican los contenedores y se movilizan autómatas». ¿Qué sigue?',
            intro: 'Piensa en la cascada.',
            ops: [opOk('Definir también «contenedor» y «autómata», que aparecen en esa definición.', 'Es la cascada: cada palabra clave nueva se define.'),
              opEr('Nada: «almacén» ya quedó definido.', 'Cascada incompleta', 'Las palabras clave de una definición también se definen.', ['atomizacion', 'ato-err-faltan']),
              opEr('Definir «almacén» de nuevo con otras palabras.', 'Reescribir', 'Reescribir no completa la cascada: faltan las palabras de la definición.', ['atomizacion', 'ato-err-faltan'])],
            pista: 'Busca las palabras de la definición que todavía no tienen su propio apartado.' },
          { titulo: '¿Cuál de estas definiciones de «mercancía» evita la circularidad?',
            intro: 'Una definición no debe volver a lo que explica.',
            ops: [opOk('«Bien mueble que el cliente entrega para su custodia.»', 'Usa palabras que se definen sin volver a «mercancía».'),
              opEr('«Lo que se guarda en el almacén», si «almacén» es «lugar donde se guarda la mercancía».', 'Definición circular', 'Se explican una a otra y no aclaran nada.', ['atomizacion', 'ato-err-circular']),
              opEr('«Mercancía del cliente.»', 'Repite el término', 'Repite la palabra que quiere definir y no aclara su significado.', ['atomizacion', 'ato-err-circular'])],
            pista: 'Descarta la definición que usa la misma palabra que define.' }
        ],
        solucion: '<p>De «Número de paquetes embalados de una mercancía» se definen paquete, embalaje y mercancía. De cada definición salen nuevas palabras clave que también se definen (almacén lleva a contenedor y autómata), y ninguna definición vuelve a la que explica.</p>',
        llevate: 'Se definen las palabras clave, en cascada y sin circularidad.'
      },
      {
        id: 'q8', titulo: 'Filtro y parque de datos', desc: 'Decide qué atributos entran al diccionario de cobranza.', tiempo: '3 min',
        enunciado: '<p>Sistema de cobranza: una empresa tercerizada que gestiona el cobro de los morosos de su sponsor.</p>',
        bloques: [
          { titulo: '¿Cuántos atributos lleva tu diccionario?',
            intro: 'Hay un rango para el trabajo.',
            ops: [opOk('Entre 40 y 80, los más relevantes del parque de datos.', 'Se eligen los relevantes: no van todos.'),
              opEr('Todos los del parque de datos, sin límite.', 'Sin filtrar', 'No van todos: solo los más relevantes.', ['entregable', 'ent-cantidad']),
              opEr('Entre 10 y 20.', 'Por debajo del mínimo', 'Es menos de lo que pide el trabajo: de 40 a 80.', ['entregable', 'ent-cantidad'])],
            pista: 'Recuerda el rango mínimo y máximo del trabajo.' },
          { titulo: '¿Cuál de estos atributos entra al diccionario de cobranza?',
            intro: 'Entran los datos que hacen posible la misión.',
            ops: [opOk('<code>dias_mora</code>', 'Define el producto de cobranza que corresponde: hace posible la misión.'),
              opEr('<code>color_favorito_moroso</code>', 'No aporta a la misión', 'No hace posible la misión: el filtro semántico lo descarta.', ['entregable', 'ent-filtro']),
              opEr('<code>tipo_sangre_moroso</code>', 'Fuera del dominio', 'No es un dato del dominio de la información de cobranza.', ['entregable', 'ent-filtro'])],
            pista: 'Pregúntate qué dato usa la cobranza para decidir qué hacer con el moroso.' },
          { titulo: 'Agregaste <code>correo_garante</code> al diccionario, pero no estaba en tu parque de datos. ¿Qué haces?',
            intro: 'Diccionario y parque deben coincidir.',
            ops: [opOk('Lo agrego también al parque de datos.', 'Todo atributo del diccionario debe estar en el parque.'),
              opEr('Lo dejo solo en el diccionario.', 'Parque desactualizado', 'Los atributos del diccionario deben estar también en el parque de datos.', ['entregable', 'ent-parque']),
              opEr('Lo quito del diccionario para que coincidan.', 'Descartar el dato', 'La regla es incluirlo también en el parque de datos.', ['entregable', 'ent-parque'])],
            pista: 'El parque de datos es el origen de los atributos.' }
        ],
        solucion: '<p>El diccionario lleva de 40 a 80 atributos relevantes, como <code>dias_mora</code>, y deja fuera datos que no hacen posible la misión. Si agregas un atributo que no estaba en el parque, como <code>correo_garante</code>, también lo incluyes en el parque de datos.</p>',
        llevate: 'Solo entran los atributos que hacen posible la misión, y el parque de datos siempre coincide con el diccionario.'
      }
    ]
  };
  /* <<<<<<<<<< FIN ZONA 2 <<<<<<<<<< */

  /* >>>>>>>>>> ZONA 3 · MOTOR (no se toca) >>>>>>>>>> */
  const root = document.querySelector('.asesoria-' + SLUG);
  if (!root) return;
  const PREF = 'siga_aw_' + SLUG + '_' + EVAL + '_' + PERIODO + '_';
  const $ = function (s, c) { return (c || root).querySelector(s); };
  const $$ = function (s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); };
  const esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  /* Como esc(), pero deja pasar solo <code> y </code> (los demás signos siguen escapados). */
  const escCode = function (s) { return esc(s).replace(/&lt;code&gt;/g, '<code>').replace(/&lt;\/code&gt;/g, '</code>'); };
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lsGet(k) { try { return localStorage.getItem(PREF + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(PREF + k, v); } catch (e) { } }
  function h(tag, cls, html, anc) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (anc) e.setAttribute('data-anc', anc);
    return e;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  const ICO = {
    tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>',
    obs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/></svg>'
  };

  /* ----- Armado ----- */
  const pags = {}; let actual = 'inicio'; let ex = null;
  root.innerHTML =
    '<header class="cab"><div class="cab-in">' +
    '<div class="marca"><span class="logo" aria-hidden="true">G</span><span class="marca-t"><b>Asesoría ' + esc(ETQ_CAB) + '</b><span>' + esc(CURSO) + '</span></span></div>' +
    '<button class="menu-flecha izq" type="button" aria-label="Ver secciones anteriores" hidden>‹</button>' +
    '<nav class="menu" aria-label="Secciones"><span class="menu-ind" aria-hidden="true"></span></nav>' +
    '<button class="menu-flecha der" type="button" aria-label="Ver más secciones" hidden>›</button>' +
    '<div class="imp"><button class="imp-btn" type="button" aria-expanded="false" aria-controls="imp-panel"><i class="imp-emo" aria-hidden="true">🖨️</i><span>Imprimir / PDF</span></button>' +
    '<div class="imp-panel" id="imp-panel" hidden><p class="imp-intro"><b>Se imprime TODO:</b> todas las páginas, con acordeones y pestañas abiertos y el solucionario de Ponte a prueba.</p>' +
    '<button class="imp-op" type="button" data-modo="color"><span class="imp-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-.6-.3-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14.5" cy="7" r="1"/></svg></span><span><b>Con colores</b><small>recomendado para PDF</small></span></button>' +
    '<button class="imp-op" type="button" data-modo="ahorro"><span class="imp-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"/></svg></span><span><b>Ahorro de tinta</b><small>blanco y negro, fondos limpios</small></span></button>' +
    '<p class="nota imp-nota"></p><p class="nota">En el cuadro de impresión elige «Guardar como PDF». Si no salen los colores, activa «Gráficos de fondo».</p></div></div>' +
    '</div></header><main class="wrap" id="contenido" tabindex="-1"></main>' +
    '<div class="visor" hidden role="dialog" aria-modal="true" aria-label="Imagen ampliada"><button class="v-x" type="button" aria-label="Cerrar">×</button><button class="v-p" type="button" aria-label="Anterior">‹</button><img alt=""><button class="v-n" type="button" aria-label="Siguiente">›</button><div class="visor-cap"></div></div>' +
    '<button class="flecha" type="button" aria-label="Volver arriba"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>';
  const nav = $('.menu'), ind = $('.menu-ind'), main = $('#contenido');

  DATOS.paginas.forEach(function (p) {
    const b = h('button', null, esc(p.nombre)); b.type = 'button'; b.setAttribute('data-ir', p.id);
    b.addEventListener('click', function () { go(p.id); });
    ['mouseenter', 'focus'].forEach(function (ev) { b.addEventListener(ev, function () { moveInd(b); }); });
    b.addEventListener('mouseleave', function () { moveInd(); });
    b.addEventListener('blur', function () { moveInd(); });
    nav.appendChild(b);
    const s = h('section', 'pagina'); s.setAttribute('data-pag', p.id); s.setAttribute('data-tipo', p.tipo);
    s.setAttribute('aria-label', p.nombre);
    pags[p.id] = s; main.appendChild(s);
    if (p.tipo === 'inicio') pintarInicio(s, p);
    else if (p.tipo === 'cierre') pintarCierre(s, p);
    else pintarContenido(s, p);
  });
  const solu = pintarSolucionario(); main.appendChild(solu);

  /* ----- Bloques ----- */
  function irBtn(ir) { return function () { go(ir[0], ir[1]); }; }
  function bloque(b) {
    let e;
    const tit = b.titulo ? '<h2>' + esc(b.titulo) + '</h2>' : '';
    switch (b.t) {
      case 'texto': e = h('div', 'bloque texto', b.html, b.id); break;
      case 'tarjetas':
        e = h('div', 'bloque', tit, b.id);
        const g = h('div', 'tarjetas'); g.style.setProperty('--cols', b.cols || 3);
        b.items.forEach(function (it) {
          const c = h('article', 'card k' + (it.k || 1), (it.etq ? '<span class="etq">' + esc(it.etq) + '</span>' : '') + '<h3>' + esc(it.titulo) + '</h3><p>' + it.html + '</p>', it.id);
          if (it.ir) { const m = h('button', 'mas no-print', 'Ver más'); m.type = 'button'; m.addEventListener('click', irBtn(it.ir)); c.appendChild(m); }
          g.appendChild(c);
        });
        e.appendChild(g); break;
      case 'acordeon':
        e = h('div', 'bloque', tit, b.id);
        const l = h('div', 'acc-lista');
        b.items.forEach(function (it, i) {
          const uid = 'acc-' + (b.id || 'x') + '-' + i;
          const w = h('div', 'acc-item k' + (it.k || 1), null, it.id);
          w.innerHTML = '<button class="acc-h" type="button" aria-expanded="false" aria-controls="' + uid + '"><span>' + esc(it.titulo) + '</span>' + (it.etq ? '<span class="etq">' + esc(it.etq) + '</span>' : '') + '<i class="chev" aria-hidden="true"></i></button><div class="acc-b" id="' + uid + '" hidden>' + it.html + '</div>';
          const hb = $('.acc-h', w);
          hb.addEventListener('click', function () { toggleAcc(w); });
          l.appendChild(w);
        });
        e.appendChild(l); break;
      case 'pestanas':
        e = h('div', 'bloque', tit, b.id);
        const bar = h('div', 'tabs-bar'); bar.setAttribute('role', 'tablist');
        const panels = [];
        b.items.forEach(function (it, i) {
          const tb = h('button', null, esc(it.titulo)); tb.type = 'button'; tb.setAttribute('role', 'tab');
          const pn = h('div', 'tab-panel', it.html, it.id); pn.setAttribute('role', 'tabpanel'); pn.setAttribute('data-t', it.titulo);
          tb.addEventListener('click', function () { selTab(bar, panels, i); });
          bar.appendChild(tb); panels.push(pn);
        });
        e.appendChild(bar); panels.forEach(function (p) { e.appendChild(p); });
        selTab(bar, panels, 0); break;
      case 'tabla':
        e = h('div', 'bloque', tit, b.id);
        e.appendChild(h('div', 'tabla-wrap', '<table><thead><tr>' + b.cabeceras.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          b.filas.map(function (f) { return '<tr>' + f.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'));
        break;
      case 'imagen':
        e = h('div', 'bloque', tit, b.id);
        const fg = h('figure', 'fig');
        fg.innerHTML = '<button class="zoom-b" type="button" aria-label="Ampliar imagen: ' + esc(b.alt) + '"><img loading="lazy" src="' + esc(b.src) + '" alt="' + esc(b.alt) + '"></button>' + (b.pie ? '<figcaption>' + esc(b.pie) + '</figcaption>' : '');
        $('.zoom-b', fg).addEventListener('click', function () { abrirVisor(fg); });
        e.appendChild(fg); break;
      case 'aviso':
        e = h('div', 'bloque', null, b.id);
        e.appendChild(h('div', 'aviso ' + (b.tipo || 'obs'), (ICO[b.tipo] || ICO.obs) + '<div>' + (b.titulo ? '<b>' + esc(b.titulo) + '</b>' : '') + b.html + '</div>'));
        break;
      default: e = h('div', 'bloque');
    }
    return e;
  }
  function toggleAcc(w, abrir) {
    const hb = $('.acc-h', w), bd = $('.acc-b', w);
    const open = abrir != null ? abrir : hb.getAttribute('aria-expanded') !== 'true';
    hb.setAttribute('aria-expanded', open ? 'true' : 'false'); bd.hidden = !open;
  }
  function selTab(bar, panels, i) {
    $$('button', bar).forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    panels.forEach(function (p, j) { p.hidden = j !== i; });
  }
  function pintarInicio(s, p) {
    const d = DATOS.portada;
    const por = h('div', 'portada');
    por.innerHTML = '<div class="arte" aria-hidden="true">' + ARTE + '</div><div class="portada-in"><h1>' + esc(d.titulo) + '<span>' + esc(d.curso) + '</span></h1><p class="lema">' + esc(d.lema) + '</p><ul class="chips">' +
      d.chips.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul><div class="acc"></div></div>';
    const acc = $('.acc', por);
    [['go', d.principal], ['sec', d.secundario]].forEach(function (x) {
      if (!x[1]) return; const b = h('button', 'btn ' + x[0], esc(x[1].texto)); b.type = 'button'; b.addEventListener('click', irBtn(x[1].ir)); acc.appendChild(b);
    });
    s.appendChild(por);
    (p.bloques || []).forEach(function (b) { s.appendChild(bloque(b)); });
  }
  function pintarContenido(s, p) {
    s.appendChild(h('h1', 'sec-t', esc(p.titulo || p.nombre)));
    if (p.intro) s.appendChild(h('p', 'sec-intro', p.intro));
    (p.bloques || []).forEach(function (b) { s.appendChild(bloque(b)); });
  }

  /* ----- Menú que no cabe: flechas visibles, rueda del mouse y degradado en los bordes ----- */
  const fIzq = $('.menu-flecha.izq'), fDer = $('.menu-flecha.der');
  function flechas() {
    const extra = fIzq.hidden ? 0 : fIzq.offsetWidth + fDer.offsetWidth + 44;   // espacio que ocupan las flechas
    const hay = nav.scrollWidth > nav.clientWidth + extra + 2;
    fIzq.hidden = fDer.hidden = !hay;
    if (!hay) { nav.style.setProperty('--fi', '0px'); nav.style.setProperty('--fd', '0px'); return; }
    const x = nav.scrollLeft, max = nav.scrollWidth - nav.clientWidth;
    fIzq.classList.toggle('off', x < 2); fDer.classList.toggle('off', x > max - 2);
    nav.style.setProperty('--fi', x < 2 ? '0px' : '22px'); nav.style.setProperty('--fd', x > max - 2 ? '0px' : '22px');
  }
  fIzq.addEventListener('click', function () { nav.scrollBy({ left: -nav.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' }); });
  fDer.addEventListener('click', function () { nav.scrollBy({ left: nav.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' }); });
  nav.addEventListener('scroll', flechas, { passive: true });
  nav.addEventListener('wheel', function (e) {
    if (nav.scrollWidth > nav.clientWidth + 2 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { nav.scrollLeft += e.deltaY; e.preventDefault(); }
  }, { passive: false });
  if (window.ResizeObserver) new ResizeObserver(flechas).observe(nav);

  /* ----- Visor de imágenes (ampliar, anterior/siguiente, Esc) ----- */
  const visor = $('.visor'); let vi = 0, vlist = [];
  function abrirVisor(fg) {
    vlist = $$('.fig'); vi = vlist.indexOf(fg); mostrarVisor(); visor.hidden = false; $('.v-x', visor).focus();
  }
  function mostrarVisor() {
    const im = $('img', vlist[vi]); const v = $('img', visor);
    v.src = im.src; v.alt = im.alt; const cp = $('figcaption', vlist[vi]); $('.visor-cap', visor).textContent = (cp ? cp.textContent + ' · ' : '') + (vi + 1) + ' de ' + vlist.length;
    $('.v-p', visor).hidden = $('.v-n', visor).hidden = vlist.length < 2;
  }
  $('.v-x', visor).addEventListener('click', function () { visor.hidden = true; });
  $('.v-p', visor).addEventListener('click', function () { vi = (vi + vlist.length - 1) % vlist.length; mostrarVisor(); });
  $('.v-n', visor).addEventListener('click', function () { vi = (vi + 1) % vlist.length; mostrarVisor(); });
  visor.addEventListener('click', function (e) { if (e.target === visor) visor.hidden = true; });
  document.addEventListener('keydown', function (e) {
    if (visor.hidden) return;
    if (e.key === 'Escape') visor.hidden = true;
    if (e.key === 'ArrowLeft') $('.v-p', visor).click();
    if (e.key === 'ArrowRight') $('.v-n', visor).click();
  });

  /* ----- Navegación ----- */
  function moveInd(btn) {
    const b = btn || $('.menu button[aria-current="page"]'); if (!b) return;
    ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px';
  }
  function abrirAncestros(t) {
    let n = t;
    while (n && n !== main) {
      if (n.classList && n.classList.contains('acc-item')) toggleAcc(n, true);
      if (n.classList && n.classList.contains('tab-panel')) { const bar = n.parentNode.querySelector('.tabs-bar'); const ps = $$('.tab-panel', n.parentNode); selTab(bar, ps, ps.indexOf(n)); }
      n = n.parentNode;
    }
  }
  function go(id, anc) {
    if (!pags[id]) id = DATOS.paginas[0].id;
    actual = id;
    $$('.pagina').forEach(function (s) { s.classList.toggle('activa', s.getAttribute('data-pag') === id); });
    $$('.menu button').forEach(function (b) {
      if (b.getAttribute('data-ir') === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (USE_HASH) { try { history.replaceState(null, '', '#' + id); } catch (e) { } }
    const act = $('.menu button[aria-current="page"]');
    if (act) { try { nav.scrollTo({ left: act.offsetLeft - (nav.clientWidth - act.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { } }
    moveInd();
    const t = anc ? $('[data-anc="' + anc + '"]', pags[id]) : null;
    if (t) {
      abrirAncestros(t);
      t.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
    } else { window.scrollTo(0, 0); }
  }

  /* ----- Ponte a prueba (cierre evaluativo) ----- */
  function regGet() { try { return JSON.parse(lsGet('reg') || '{}'); } catch (e) { return {}; } }
  function regSet(r) { lsSet('reg', JSON.stringify(r)); }
  function regUpd(qid, fn) { const r = regGet(); r[qid] = r[qid] || { b: 0, p: 0, a: 0, e: {} }; fn(r[qid]); regSet(r); }

  function pintarCierre(s, p) {
    s.appendChild(h('h1', 'sec-t', esc(CIERRE.titulo)));
    s.appendChild(h('p', 'sec-intro', esc(CIERRE.intro) + (CIERRE.nota ? ' <b>' + esc(CIERRE.nota) + '</b>' : '')));
    s.appendChild(h('div', 'cierre-ui no-print'));
    menu();
  }
  function ui() { return $('.cierre-ui'); }
  function menu() {
    ex = null; const u = ui(); u.innerHTML = '';
    u.appendChild(h('h2', null, '¿Qué quieres practicar?')); u.firstChild.style.margin = '0 0 18px';
    const g = h('div', 'pq-grid');
    CIERRE.preguntas.forEach(function (q, i) {
      const b = h('button', 'pq k' + (i % 4 + 1), '<span class="n">' + (i + 1) + '</span><h3>' + esc(q.titulo) + '</h3><p class="muted">' + esc(q.desc) + '</p><p class="muted">' + esc(q.tiempo) + '</p><span class="go-t">Empezar →</span>');
      b.type = 'button'; b.addEventListener('click', function () { empezar(i); }); g.appendChild(b);
    });
    u.appendChild(g); u.appendChild(registro());
  }
  function registro() {
    const r = regGet(); const w = h('div', 'reg'); w.appendChild(h('h3', null, 'Tu registro privado'));
    let any = false;
    CIERRE.preguntas.forEach(function (q) {
      const x = r[q.id]; if (!x || !x.b) return; any = true;
      const errs = Object.keys(x.e || {});
      const bloque = h('div', null, '<p><b>' + esc(q.titulo) + '</b> · ' + x.b + ' decisiones · ' + x.p + ' al primer intento · ' + x.a + ' con ayuda</p>');
      if (errs.length) {
        const ul = h('ul'); errs.forEach(function (k) {
          const li = h('li', null, esc(k) + ' (' + x.e[k].n + ') '); const v = x.e[k].ver;
          if (v) { const bt = h('button', 'ver', 'Ver dónde se explicó'); bt.type = 'button'; bt.addEventListener('click', function () { go(v[0], v[1]); }); li.appendChild(bt); }
          ul.appendChild(li);
        }); bloque.appendChild(ul);
      }
      w.appendChild(bloque);
    });
    w.appendChild(h('p', 'muted', any ? 'Sin puntajes ni comparaciones: solo para que sepas dónde reforzar.' : 'Aún no hay práctica registrada. Elige una pregunta cuando quieras.'));
    if (any) { const bt = h('button', 'borrar', 'Borrar mi registro'); bt.type = 'button'; bt.addEventListener('click', function () { regSet({}); menu(); }); w.appendChild(bt); }
    return w;
  }
  function empezar(qi) { ex = { qi: qi, i: 0, res: [] }; bloqueVista(); window.scrollTo(0, 0); }
  function barra(q) {
    const k = ex.qi % 4 + 1;
    const b = h('div', 'pbar k' + k);
    const v = h('button', 'volver', '← Elegir otra pregunta'); v.type = 'button'; v.addEventListener('click', menu);
    b.appendChild(v); b.appendChild(h('h3', null, esc(q.titulo)));
    const d = h('div', 'dots'); d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Decisión ' + (Math.min(ex.i, q.bloques.length - 1) + 1) + ' de ' + q.bloques.length);
    q.bloques.forEach(function (_, i) { d.appendChild(h('span', 'dot ' + (ex.res[i] === 'primer' ? 'hecho' : ex.res[i] === 'ayuda' ? 'ayuda' : i === ex.i ? 'act' : ''), String(i + 1))); });
    b.appendChild(d); return b;
  }
  function problema(q) { return h('div', 'prob', '<span class="etq">Problema</span>' + q.enunciado); }
  function bloqueVista() {
    const q = CIERRE.preguntas[ex.qi]; const u = ui(); u.innerHTML = '';
    if (ex.i >= q.bloques.length) return final(q);
    const b = q.bloques[ex.i];
    u.appendChild(barra(q)); u.appendChild(problema(q));
    const w = h('div', 'dec'); w.innerHTML = '<h3>' + escCode(b.titulo) + '</h3>' + (b.intro ? '<p class="intro">' + b.intro + '</p>' : '');
    const alts = h('div', 'alts'); const ops = shuffle(b.ops.slice());
    const st = { fails: 0, hint: false, done: false };
    const fb = h('div', 'fb'); fb.setAttribute('aria-live', 'polite');
    const cont = h('button', 'btn go fb-continuar', 'Continuar →'); cont.type = 'button'; cont.hidden = true;
    const ac = h('div', 'acciones'); const hb = h('button', 'pista', 'No sé cuál elegir'); hb.type = 'button'; ac.appendChild(hb);
    const btns = ops.map(function (o, i) {
      const bt = h('button', 'alt ' + 'ABC'[i], '<span class="L">' + 'ABC'[i] + '</span><span>' + o.html + '</span>'); bt.type = 'button';
      bt.addEventListener('click', function () { elegir(o, bt); }); alts.appendChild(bt); return bt;
    });
    function fin(res) {
      st.done = true; ex.res[ex.i] = res; hb.hidden = true; btns.forEach(function (x) { x.disabled = true; }); cont.hidden = false; cont.focus();
      regUpd(q.id, function (r) { r.b++; if (res === 'primer') r.p++; else r.a++; });
    }
    function elegir(o, bt) {
      if (st.done) return;
      const ok = ops.filter(function (x) { return x.ok; })[0];
      if (o.ok) {
        bt.classList.add('good'); const res = (st.fails === 0 && !st.hint) ? 'primer' : 'ayuda';
        fb.className = 'fb ok'; fb.innerHTML = '<b class="t">Correcto</b><p>' + (o.explica || '') + '</p>' + (res === 'ayuda' ? '<p>Este bloque queda anotado como «con ayuda».</p>' : '');
        fin(res); return;
      }
      st.fails++; bt.classList.add('bad'); bt.disabled = true;
      regUpd(q.id, function (r) { const e = r.e[o.err] = r.e[o.err] || { n: 0, ver: o.ver || null }; e.n++; });
      const et = o.err ? '<span class="etq">' + esc(o.err) + '</span>' : '';
      const ver = o.ver ? ' <button class="ver" type="button">Ver dónde se explicó</button>' : '';
      if (st.fails === 1) {
        fb.className = 'fb bad'; fb.innerHTML = '<b class="t">No es la mejor opción</b>' + et + '<p>' + o.msg + ver + '</p><p>Puedes intentarlo otra vez.</p>';
        bt.classList.add('dim');
      } else {
        const idx = ops.indexOf(ok); btns[idx].classList.add('good');
        fb.className = 'fb bad'; fb.innerHTML = '<b class="t">Tampoco</b>' + et + '<p>' + o.msg + ver + '</p><p><b>Te muestro la opción correcta:</b> ' + (ok.explica || '') + '</p><p>Este bloque queda anotado como «con ayuda».</p>';
        fin('ayuda');
      }
      const vb = $('.ver', fb); if (vb) vb.addEventListener('click', function () { go(o.ver[0], o.ver[1]); });
    }
    let nivel = 0;
    hb.addEventListener('click', function () {
      if (st.done) return; st.hint = true; nivel++;
      if (nivel === 1) {
        fb.className = 'fb hint'; fb.innerHTML = '<b class="t">Pista</b><p>' + esc(b.pista || 'Piensa qué criterio debe cumplir la decisión.') + '</p><p>Pedir una pista cuenta como ayuda en tu registro.</p>';
        hb.textContent = 'Otra pista'; return;
      }
      /* Pista 2: descarta una alternativa incorrecta y ofrece ir a la explicación */
      const malas = btns.filter(function (x, i) { return !x.disabled && !ops[i].ok; });
      if (malas.length > 1) { malas[0].classList.add('dim'); malas[0].disabled = true; }
      const dest = b.ver || (ops.filter(function (o) { return o.ver; })[0] || {}).ver;
      fb.className = 'fb hint';
      fb.innerHTML = '<b class="t">Descarté una alternativa</b><p>' + (malas.length > 1 ? 'Quedan dos.' : 'Ya solo quedan dos alternativas.') + ' Si lo prefieres, repasa la explicación.</p>' +
        (dest ? '<p><button class="ver" type="button">Ver dónde se explicó</button></p>' : '');
      const vb2 = $('.ver', fb); if (vb2) vb2.addEventListener('click', function () { go(dest[0], dest[1]); });
      hb.hidden = true;
    });
    cont.addEventListener('click', function () { ex.i++; bloqueVista(); window.scrollTo(0, 0); });
    w.appendChild(alts); w.appendChild(ac); w.appendChild(fb); w.appendChild(cont); u.appendChild(w);
  }
  function final(q) {
    const u = ui(); u.innerHTML = ''; u.appendChild(barra(q)); u.appendChild(problema(q));
    u.appendChild(h('div', 'sol', '<h3>Solución completa</h3>' + q.solucion + (q.llevate ? '<h3 style="margin-top:16px">Lo que debes llevarte</h3><p>' + q.llevate + '</p>' : '')));
    const ac = h('div', 'acciones');
    [['btn sec', 'Repetir este mismo', function () { empezar(ex.qi); }], ['btn sec', 'Elegir otra pregunta', menu], ['btn go', 'Terminar por hoy', function () { go(DATOS.paginas[0].id); }]].forEach(function (x) {
      const b = h('button', x[0], x[1]); b.type = 'button'; b.addEventListener('click', x[2]); ac.appendChild(b);
    });
    u.appendChild(ac);
  }
  function pintarSolucionario() {
    const s = h('section', 'solucionario'); s.appendChild(h('h2', null, 'Solucionario de Ponte a prueba'));
    CIERRE.preguntas.forEach(function (q, i) {
      const w = h('div', 'sol-q'); w.innerHTML = '<h3>' + (i + 1) + '. ' + esc(q.titulo) + '</h3>' + q.enunciado;
      q.bloques.forEach(function (b) {
        const ok = b.ops.filter(function (o) { return o.ok; })[0];
        w.appendChild(h('div', 'sol-b', '<p><b>' + escCode(b.titulo) + '</b><br>' + ok.html + ' — ' + (ok.explica || '') + '</p>'));
      });
      w.appendChild(h('div', 'sol', q.solucion + (q.llevate ? '<p><b>Lo que debes llevarte:</b> ' + q.llevate + '</p>' : '')));
      s.appendChild(w);
    });
    return s;
  }

  /* ----- Impresión (beforeprint/afterprint; contenido listo desde la carga) ----- */
  let enIframe = false; try { enIframe = window.self !== window.top; } catch (e) { enIframe = true; }
  const ib = $('.imp-btn'), ip = $('.imp-panel'), ops = $$('.imp-op');
  let modoActual = lsGet('modo') === 'ahorro' ? 'ahorro' : 'color';
  function aplicarModo() {
    root.classList.toggle('ahorro', modoActual === 'ahorro');
    ops.forEach(function (o) { o.setAttribute('aria-pressed', o.getAttribute('data-modo') === modoActual ? 'true' : 'false'); });
  }
  aplicarModo();
  const nota = $('.imp-nota');
  function imprimir() { try { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { window.print(); }); } catch (e) { window.print(); } }
  ib.addEventListener('click', function () { const o = ip.hidden; ip.hidden = !o; ib.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  ops.forEach(function (o) {
    o.addEventListener('click', function () {
      modoActual = o.getAttribute('data-modo'); lsSet('modo', modoActual); aplicarModo();
      if (enIframe) { nota.textContent = 'Modo guardado. Estás dentro del visor: imprime con el botón de imprimir del visor.'; return; }
      ip.hidden = true; ib.setAttribute('aria-expanded', 'false'); imprimir();
    });
  });
  window.addEventListener('beforeprint', function () { root.classList.add('imprimiendo'); aplicarModo(); });
  window.addEventListener('afterprint', function () { root.classList.remove('imprimiendo'); });

  /* ----- Recordar la posición -----
     Al abrir la asesoría en una pestaña nueva o en pantalla completa, la página se vuelve a cargar y
     empezaría en el inicio. Se guarda en este navegador dónde estabas (página, acordeones y pestañas
     abiertos, el texto que veías arriba y, en Ponte a prueba, la pregunta y la decisión). Si se abre de
     nuevo en los siguientes 20 s, vuelve a ese lugar; si pasó más tiempo, empieza en el inicio.
     El punto de la pantalla se guarda como «el texto que veías arriba», no como píxeles, porque el
     ancho cambia al ampliar y los píxeles ya no coincidirían. */
  const POS_VENTANA = 20000, POS_LATIDO = 3000;
  let posActiva = false, posEspera = null, posMovio = false;
  // Si hay varias ventanas de la asesoría abiertas, solo guarda la que tuviste en uso más recientemente:
  // una ventana quieta que dejaste abierta no puede pisar a la que estás usando.
  let posActividad = Date.now();
  const posVisible = function (e) { return e.offsetParent !== null && e.getBoundingClientRect().height > 0; };
  function posTexto(e) { return (e.textContent || '').replace(/\s+/g, ' ').trim(); }
  function posAncla() {
    if (window.pageYOffset < 40) return null;
    const els = $$('h1,h2,h3,h4,p,li,figcaption', pags[actual]);
    for (let i = 0; i < els.length; i++) {
      const t = posTexto(els[i]);
      if (t.length < 8) continue;
      const r = els[i].getBoundingClientRect();
      if (r.top >= 0 && r.top < window.innerHeight && posVisible(els[i])) return { tag: els[i].tagName, txt: t.slice(0, 60), off: Math.round(r.top) };
    }
    return null;
  }
  function posBuscar(a) {
    if (!a) return null;
    return $$(a.tag.toLowerCase(), pags[actual]).filter(function (e) { return posTexto(e).slice(0, 60) === a.txt && posVisible(e); })[0] || null;
  }
  function posGuardar() {
    if (!posActiva) return;
    const acc = []; $$('.acc-item').forEach(function (w, i) { if ($('.acc-h', w).getAttribute('aria-expanded') === 'true') acc.push(i); });
    const tabs = $$('.tabs-bar').map(function (bar) { return $$('button', bar).findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; }); });
    let previo = null; try { previo = JSON.parse(lsGet('pos') || 'null'); } catch (e) { }
    if (previo && previo.ta && previo.ta > posActividad) return;   // otra ventana tuvo actividad más reciente
    lsSet('pos', JSON.stringify({ t: Date.now(), ta: posActividad, page: actual, y: Math.round(window.pageYOffset), a: posAncla(), acc: acc, tabs: tabs, pp: ex ? { qi: ex.qi, i: ex.i } : null }));
  }
  function posLeer() {
    try {
      const p = JSON.parse(lsGet('pos') || 'null'), dt = p && p.t ? Date.now() - p.t : -1;
      return dt >= 0 && dt <= POS_VENTANA ? p : null;
    } catch (e) { return null; }
  }
  function posArrancar() {
    posActiva = true;
    ['scroll', 'wheel', 'touchstart', 'keydown', 'mousedown', 'mousemove'].forEach(function (ev) {
      window.addEventListener(ev, function () { posActividad = Date.now(); }, { passive: true, capture: true });
    });
    posGuardar();
    window.addEventListener('scroll', function () {
      if (posEspera) return;
      posEspera = setTimeout(function () { posEspera = null; posGuardar(); }, 500);
    }, { passive: true });
    setInterval(function () { if (document.visibilityState === 'visible') posGuardar(); }, POS_LATIDO);
    document.addEventListener('visibilitychange', posGuardar);
    window.addEventListener('pagehide', posGuardar);
  }
  function posRestaurar(p) {
    $$('.acc-item').forEach(function (w, i) { if ((p.acc || []).indexOf(i) !== -1) toggleAcc(w, true); });
    $$('.tabs-bar').forEach(function (bar, i) {
      const n = (p.tabs || [])[i];
      if (n >= 0) selTab(bar, $$('.tab-panel', bar.parentNode), n);
    });
    if (p.pp && CIERRE.preguntas[p.pp.qi]) { ex = { qi: p.pp.qi, i: p.pp.i, res: [] }; bloqueVista(); }
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
      window.addEventListener(ev, function () { posMovio = true; }, { passive: true, once: true });
    });
    function una() {
      if (posMovio) return;
      const el = posBuscar(p.a);
      const y = el ? Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - p.a.off) : (p.y || 0);
      try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); }
    }
    una();
    window.addEventListener('load', una);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(una);   // imágenes y fuentes pueden cambiar la altura
    setTimeout(una, 500); setTimeout(una, 1200);
    setTimeout(posArrancar, 1300);
  }

  /* ----- Flecha, hash y arranque ----- */
  const fl = $('.flecha');
  window.addEventListener('scroll', function () { fl.classList.toggle('ver', window.scrollY > 420); }, { passive: true });
  fl.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  window.addEventListener('resize', function () { moveInd(); flechas(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveInd(); flechas(); });
  let ini = DATOS.paginas[0].id, conHash = false;
  if (USE_HASH) { try { const hs = decodeURIComponent(location.hash.slice(1)); if (pags[hs]) { ini = hs; conHash = true; } } catch (e) { } }
  const pos = posLeer();                                   // dónde estabas, si abriste la asesoría hace instantes
  const recuperar = !!pos && !!pags[pos.page] && (!conHash || pos.page === ini);   // un enlace con #página distinta manda
  if (recuperar) ini = pos.page;
  go(ini);
  window.scrollTo(0, 0);
  if (recuperar) posRestaurar(pos); else posArrancar();
  /* <<<<<<<<<< FIN ZONA 3 <<<<<<<<<< */
})();
