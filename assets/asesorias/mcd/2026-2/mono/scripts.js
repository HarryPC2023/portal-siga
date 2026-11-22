/* =====================================================================
   BASE · Asesoría web interactiva (teoría) · scripts.js
   Carpeta: assets/asesorias/mcd/2026-2/mono/
   Tres zonas:
     ZONA 1 · CONTENIDO  (constantes y DATOS: portada, páginas y bloques)  -> cambia siempre
     ZONA 2 · DEFENSA GUIADA (preguntas con bloques de decisión)            -> cambia siempre
     ZONA 3 · MOTOR      (páginas, bloques, práctica, impresión)            -> no se toca
   Sin variables globales, sin CDN (salvo Google Fonts) y sin tocar la página que contiene el iframe, salvo pulsar el botón de imprimir del visor (mismo origen, dentro de try/catch).
   ===================================================================== */
(function () {
    'use strict';

    /* >>>>>>>>>> ZONA 1 · CONTENIDO >>>>>>>>>> */
    const SLUG = 'mcd', EVAL = 'mono', PERIODO = '2026-2';
    const USE_HASH = true;                                   // false si SIGA maneja su propia URL
    // Nombre visible de la actividad: la sigla en mayúscula (PC1, EP, EF…) salvo las que tienen nombre propio (MONO → «Monografía»).
    const NOMBRES_EVAL = { MONO: 'Monografía' };
    const EVN = NOMBRES_EVAL[EVAL.toUpperCase()] || EVAL.toUpperCase();
    const ETQ = EVN + ' · ' + PERIODO.slice(2);              // Monografía · 26-2
    const ETQ_CAB = EVN + ' ' + PERIODO.slice(2);            // Monografía 26-2
    const CURSO = 'Modelado Conceptual de Datos';
    const RUTA_LIB = '../../../../libs/';

    // Ilustración de la portada: el trencito de tickets (cinta transportadora con 4 tickets y 4 ruedas).
    const ARTE = "<svg viewBox=\"0 0 320 150\" fill=\"none\" stroke=\"#0B7A52\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"10\" y=\"96\" width=\"300\" height=\"14\" rx=\"4\" fill=\"#0B7A5233\"/><circle cx=\"34\" cy=\"126\" r=\"9\"/><circle cx=\"110\" cy=\"126\" r=\"9\"/><circle cx=\"186\" cy=\"126\" r=\"9\"/><circle cx=\"262\" cy=\"126\" r=\"9\"/><rect x=\"18\" y=\"52\" width=\"52\" height=\"38\" rx=\"6\"/><rect x=\"94\" y=\"52\" width=\"52\" height=\"38\" rx=\"6\"/><rect x=\"170\" y=\"52\" width=\"52\" height=\"38\" rx=\"6\"/><rect x=\"246\" y=\"52\" width=\"52\" height=\"38\" rx=\"6\"/><path d=\"M70 71h24M146 71h24M222 71h24\"/><path d=\"M18 66h8M94 66h8M170 66h8M246 66h8\" stroke-width=\"5\"/></svg>";

    const DATOS = {
        "portada": {
            "titulo": "Monografía",
            "curso": "Modelado Conceptual de Datos",
            "lema": "Arma tu sistema de punta a punta: define, fabrica, vende y entrega, con cada tabla en su lugar.",
            "chips": [
                ETQ,
                "Entrega de trabajo grupal",
                "Con Ponte a prueba"
            ],
            "principal": {
                "texto": "Empezar",
                "ir": [
                    "antes"
                ]
            },
            "secundario": {
                "texto": "Ir a Ponte a prueba",
                "ir": [
                    "defensa"
                ]
            }
        },
        "paginas": [
            {
                "id": "inicio",
                "nombre": "Inicio",
                "tipo": "inicio",
                "bloques": [
                    {
                        "t": "tabla",
                        "id": "ini-ciclo",
                        "titulo": "El ciclo de vida de tu producto",
                        "cabeceras": [
                            "1 · Definición",
                            "2 · Fabricación",
                            "3 · Venta",
                            "4 · Entrega"
                        ],
                        "filas": [
                            [
                                "Naturaleza, tipologías, reglas y políticas",
                                "Recursos programados, disponibilidad y tickets",
                                "Interacción de las cuentas",
                                "Secuencia, protocolo y eficiencia"
                            ],
                            [
                                "Qué hace tu sistema y cómo lo estableces",
                                "Antes de hacer algo, tener lo necesario",
                                "El ticket ya fabricado se asigna al cliente",
                                "Cómo llega el producto al cliente"
                            ]
                        ]
                    },
                    {
                        "t": "tarjetas",
                        "id": "ini-mapa",
                        "titulo": "Contenido de la asesoría",
                        "cols": 3,
                        "v": "bv-contorno vc-ciclo",
                        "items": [
                            {
                                "k": 1,
                                "etq": "Página 1",
                                "titulo": "Antes de empezar",
                                "html": "Requisito previo, intensidad, nivel de detalle y cómo se entrega.",
                                "ir": [
                                    "antes"
                                ]
                            },
                            {
                                "k": 2,
                                "etq": "Página 2",
                                "titulo": "Definición",
                                "html": "Semántica, misión, naturaleza, tipologías, componentes y protocolo.",
                                "ir": [
                                    "definicion"
                                ]
                            },
                            {
                                "k": 3,
                                "etq": "Página 3",
                                "titulo": "Fabricación",
                                "html": "Recursos programados, disponibilidad y generación de tickets.",
                                "ir": [
                                    "fabricacion"
                                ]
                            },
                            {
                                "k": 4,
                                "etq": "Página 4",
                                "titulo": "Reglas",
                                "html": "Mínimo 3, cada una con sus condiciones, variables y acciones.",
                                "ir": [
                                    "reglas"
                                ]
                            },
                            {
                                "k": 1,
                                "etq": "Página 5",
                                "titulo": "Políticas",
                                "html": "Mínimo 3, cada una como relación entre catálogos.",
                                "ir": [
                                    "politicas"
                                ]
                            },
                            {
                                "k": 2,
                                "etq": "Página 6",
                                "titulo": "Venta",
                                "html": "El diagrama de venta y cómo interactúan las cuentas.",
                                "ir": [
                                    "venta"
                                ]
                            },
                            {
                                "k": 3,
                                "etq": "Página 7",
                                "titulo": "Entrega",
                                "html": "Secuencia del protocolo, evento de ejemplo y eficiencia por producto.",
                                "ir": [
                                    "entrega"
                                ]
                            },
                            {
                                "k": 4,
                                "etq": "Página 8",
                                "titulo": "Mapa del Excel",
                                "html": "Qué hoja lleva cada tabla y una lista de revisión antes de entregar.",
                                "ir": [
                                    "excel"
                                ]
                            },
                            {
                                "k": 1,
                                "etq": "Página 9",
                                "titulo": "Ponte a prueba",
                                "html": "Ocho preguntas con decisiones guiadas, pistas y enlace al punto explicado.",
                                "ir": [
                                    "defensa"
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "antes",
                "nombre": "Antes de empezar",
                "tipo": "contenido",
                "titulo": "Antes de empezar",
                "intro": "Cuatro cosas que conviene tener claras antes de abrir el Excel.",
                "bloques": [
                    {
                        "t": "tarjetas",
                        "id": "ant-cuatro",
                        "cols": 2,
                        "v": "bv-filo vc-ciclo",
                        "items": [
                            {
                                "k": 1,
                                "etq": "Requisito previo",
                                "titulo": "Se apoya en tus PC",
                                "html": "La monografía no es una recopilación de las PC, pero sí se apoya en lo que desarrollaste en cada una. Depende de que las hayas trabajado bien y corregido lo que el profesor señaló."
                            },
                            {
                                "k": 2,
                                "etq": "Intensidad",
                                "titulo": "Más profundo que las PC",
                                "html": "Esta monografía demanda un nivel de trabajo más profundo que el de las PC previas."
                            },
                            {
                                "k": 3,
                                "etq": "Nivel de detalle",
                                "titulo": "Detalle y razonamiento",
                                "html": "Se requiere un alto nivel de detalle y razonamiento en el proyecto. Cada tabla y cada gráfico debe poder explicarse."
                            },
                            {
                                "k": 4,
                                "etq": "Entrega",
                                "titulo": "Excel, y si puedes, PPT y Word",
                                "html": "La entrega habitual es un archivo Excel. Lo ideal es una PPT y un documento Word con las tablas y los gráficos ordenados y con su descripción. Si el tiempo no alcanza, un Excel bien ordenado es el mínimo."
                            }
                        ]
                    },
                    {
                        "t": "aviso",
                        "id": "ant-solo",
                        "tipo": "tip",
                        "titulo": "Trabajo grupal",
                        "html": "<p>Repartan el trabajo por etapas, pero revisen juntos la coherencia: un mismo atributo debe llamarse igual en la naturaleza, los catálogos, las reglas y la venta. Usen la lista de «Revisa antes de entregar» antes de entregar el trabajo.</p>"
                    }
                ]
            },
            {
                "id": "definicion",
                "nombre": "Definición",
                "tipo": "contenido",
                "titulo": "Definición del sistema",
                "intro": "Aquí explicas qué hace tu sistema y cómo lo estableciste. Va primero porque Fabricación, Venta y Entrega salen de esta definición.",
                "bloques": [
                    {
                        "t": "tabla",
                        "id": "def-piezas",
                        "titulo": "Las piezas de la Definición",
                        "cabeceras": [
                            "Pieza",
                            "Qué muestra",
                            "Cómo se presenta"
                        ],
                        "filas": [
                            [
                                "Semántica y misión",
                                "Qué hace el sistema desde lo técnico y desde lo comercial, y su misión",
                                "Texto corto"
                            ],
                            [
                                "Naturaleza",
                                "Los componentes que forman el producto (bien o servicio)",
                                "Esquema (gráfico)"
                            ],
                            [
                                "Tipologías y catálogo de productos",
                                "Todas las combinaciones de producto y los tipos de cada componente",
                                "Tablas"
                            ],
                            [
                                "Componentes",
                                "Los elementos que permiten que se lleven a cabo las operaciones",
                                "Tabla"
                            ],
                            [
                                "Protocolo",
                                "Cómo se llevan a cabo las operaciones y actividades",
                                "Tabla de transacción, operación, secuencia y método"
                            ]
                        ]
                    },
                    {
                        "t": "acordeon",
                        "id": "def-semantica",
                        "titulo": "Semántica y misión",
                        "v": "bv-filo vc-ciclo",
                        "items": [
                            {
                                "id": "def-tecnica",
                                "k": 1,
                                "etq": "Técnica",
                                "titulo": "Definición técnica",
                                "html": "<p>Describe lo que el sistema realiza de manera automatizada. Es una síntesis funcional de sus operaciones.</p>"
                            },
                            {
                                "id": "def-comercial",
                                "k": 2,
                                "etq": "Comercial",
                                "titulo": "Definición comercial",
                                "html": "<p>Explica cómo el sistema genera ganancias o realiza negocios. Es la estrategia de ingresos y monetización.</p>"
                            },
                            {
                                "id": "def-mision",
                                "k": 3,
                                "etq": "Misión",
                                "titulo": "Misión del sistema",
                                "html": "<p>En dos líneas como máximo, qué hace básicamente tu sistema. La fórmula se recomienda, pero no es obligatoria: hay sistemas, como almacenamiento, que no la tuvieron.</p>"
                            }
                        ]
                    },
                    {
                        "t": "tabla",
                        "id": "def-comparacion",
                        "titulo": "Perspectiva técnica y comercial de distintos sistemas",
                        "cabeceras": [
                            "Sistema",
                            "Técnico",
                            "Comercial"
                        ],
                        "filas": [
                            [
                                "Publicidad",
                                "Espacio físico o virtual que tiene como objeto publicitar un producto determinado",
                                "En un horario establecido, así como en un medio y canal en específico"
                            ],
                            [
                                "Almacenamiento",
                                "Capacidad de preservar la mercancía en un contenedor",
                                "Y entregarlo en un embalaje establecido"
                            ],
                            [
                                "Cobranzas",
                                "Aplicación automatizada de presión a morosos",
                                "En horarios previamente establecidos y conforme a la disponibilidad del operador asignado al canal"
                            ],
                            [
                                "Compras",
                                "Adquisición automatizada de bienes y servicios",
                                "Conforme a la partida presupuestaria y disponibilidad de stock"
                            ],
                            [
                                "Contabilidad",
                                "Registro automático de hechos económicos",
                                "Entrega del estado financiero según periodo contable"
                            ],
                            [
                                "Producción",
                                "Fabricación automatizada de productos",
                                "Producción por lotes programados"
                            ],
                            [
                                "Ventas",
                                "Convencimiento automatizado del cliente",
                                "Venta por canales definidos"
                            ]
                        ]
                    },
                    {
                        "t": "tabla",
                        "id": "def-mision-tabla",
                        "titulo": "Modelos de misión del sistema",
                        "cabeceras": [
                            "Sistema",
                            "Misión",
                            "Fórmula (opcional)",
                            "Qué significa cada letra"
                        ],
                        "filas": [
                            [
                                "Cobranzas",
                                "Presionar a los morosos para que paguen su deuda vencida mediante estrategias automatizadas de hostigamiento.",
                                "<code>P = H(E(TD(Am), T), R)</code>",
                                "P presión al moroso · H hostigamiento automatizado · E estrategia de cobranza · TD tipo de deuda · Am antigüedad de la mora · T tipo de ticket (define intensidad y recursos) · R recursos"
                            ],
                            [
                                "Compras",
                                "Adquirir productos teniendo en cuenta la calidad, los precios y las condiciones, y entregarlos en el plazo establecido.",
                                "<code>AP(q, p, c) + E(t)</code>",
                                "AP adquirir producto · q calidad · p precio · c condiciones · E entrega · t tiempo"
                            ],
                            [
                                "Publicidad",
                                "Brindar el servicio de uso de vehículos publicitarios para dar a conocer un mensaje.",
                                "<code>SPub = f(Seg, M, C, V)</code>",
                                "SPub sistema publicitario · Seg segmentación · M medio · C canal · V vehículo publicitario"
                            ],
                            [
                                "Almacenamiento",
                                "Preservar una mercancía por un tiempo determinado hasta su posterior despacho.",
                                "Sin fórmula",
                                "—"
                            ]
                        ]
                    },
                    {
                        "t": "texto",
                        "id": "def-naturaleza",
                        "v": "v-ficha vc3",
                        "html": "<span class=\"v-pestana\">Naturaleza</span><h2>Naturaleza: los componentes de tu producto</h2><p>Es el <b>esquema</b> que muestra el conjunto de componentes que conforman el producto de tu sistema (bien o servicio). Cada componente lleva su código y sus atributos; entre componentes se dibuja una relación <b>R</b> con su cardinalidad (1 o N) en cada extremo.</p><p class=\"muted\">Los atributos que dibujas aquí son los mismos que después aparecen en tus catálogos y tipologías.</p>"
                    },
                    {
                        "t": "pestanas",
                        "id": "def-nat-tabs",
                        "items": [
                            {
                                "id": "def-nat-alm",
                                "titulo": "Almacenamiento",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Almacenamiento</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:620px\" viewBox=\"0 0 1000 510\" role=\"img\" aria-label=\"Esquema de naturaleza del sistema de almacenamiento\"><defs><marker id=\"mknal\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"cu\" x=\"20\" y=\"20\" width=\"210\" height=\"145\" rx=\"6\"/><text x=\"125.0\" y=\"38\">mercancia</text><line class=\"sep\" x1=\"28\" y1=\"46\" x2=\"222\" y2=\"46\"/><text class=\"at\" x=\"125.0\" y=\"62\">codigo_mercancia</text><text class=\"at\" x=\"125.0\" y=\"77\">categoria</text><text class=\"at\" x=\"125.0\" y=\"92\">largo</text><text class=\"at\" x=\"125.0\" y=\"107\">alto</text><text class=\"at\" x=\"125.0\" y=\"122\">ancho</text><text class=\"at\" x=\"125.0\" y=\"137\">peso</text><text class=\"at\" x=\"125.0\" y=\"152\">temperatura</text><rect class=\"cu\" x=\"390\" y=\"150\" width=\"210\" height=\"130\" rx=\"6\"/><text x=\"495.0\" y=\"168\">tipo_contenedor</text><line class=\"sep\" x1=\"398\" y1=\"176\" x2=\"592\" y2=\"176\"/><text class=\"at\" x=\"495.0\" y=\"192\">codigo_contenedor</text><text class=\"at\" x=\"495.0\" y=\"207\">material</text><text class=\"at\" x=\"495.0\" y=\"222\">altura</text><text class=\"at\" x=\"495.0\" y=\"237\">anchura</text><text class=\"at\" x=\"495.0\" y=\"252\">profundidad</text><text class=\"at\" x=\"495.0\" y=\"267\">temperatura</text><ellipse class=\"re\" cx=\"495\" cy=\"86\" rx=\"20\" ry=\"14\"/><text class=\"sm\" x=\"495\" y=\"90\">R</text><path class=\"ln\" d=\"M220 86 L475 86\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"236\" y=\"78\">1</text><path class=\"ln\" d=\"M495 150 L495 100\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"505\" y=\"134\">1</text><rect class=\"cu\" x=\"20\" y=\"200\" width=\"210\" height=\"100\" rx=\"6\"/><text x=\"125.0\" y=\"218\">zona</text><line class=\"sep\" x1=\"28\" y1=\"226\" x2=\"222\" y2=\"226\"/><text class=\"at\" x=\"125.0\" y=\"242\">codigo_zona</text><text class=\"at\" x=\"125.0\" y=\"257\">descripcion</text><text class=\"at\" x=\"125.0\" y=\"272\">temperatura</text><text class=\"at\" x=\"125.0\" y=\"287\">nro_puerta</text><ellipse class=\"re\" cx=\"305\" cy=\"244\" rx=\"20\" ry=\"14\"/><text class=\"sm\" x=\"305\" y=\"248\">R</text><path class=\"ln\" d=\"M230 244 L285 244\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"242\" y=\"236\">1</text><path class=\"ln\" d=\"M390 244 L325 244\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"366\" y=\"236\">N</text><ellipse class=\"re\" cx=\"125\" cy=\"345\" rx=\"34\" ry=\"14\"/><text class=\"sm\" x=\"125\" y=\"349\">mapa</text><path class=\"ln\" d=\"M125 300 L125 331\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"134\" y=\"312\">1</text><rect class=\"cu\" x=\"20\" y=\"395\" width=\"210\" height=\"100\" rx=\"6\"/><text x=\"125.0\" y=\"413\">ubicacion</text><line class=\"sep\" x1=\"28\" y1=\"421\" x2=\"222\" y2=\"421\"/><text class=\"at\" x=\"125.0\" y=\"437\">codigo_ubicacion</text><text class=\"at\" x=\"125.0\" y=\"452\">coordenada_x</text><text class=\"at\" x=\"125.0\" y=\"467\">coordenada_y</text><text class=\"at\" x=\"125.0\" y=\"482\">coordenada_z</text><path class=\"ln\" d=\"M125 395 L125 359\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"134\" y=\"380\">N</text><rect class=\"ev\" x=\"430\" y=\"326\" width=\"130\" height=\"40\" rx=\"6\"/><text x=\"495.0\" y=\"350.5\">naturaleza</text><path class=\"ln\" d=\"M495 280 L495 326\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"505\" y=\"300\">1</text><rect class=\"cu\" x=\"390\" y=\"410\" width=\"210\" height=\"85\" rx=\"6\"/><text x=\"495.0\" y=\"428\">tipo_embalaje</text><line class=\"sep\" x1=\"398\" y1=\"436\" x2=\"592\" y2=\"436\"/><text class=\"at\" x=\"495.0\" y=\"452\">codigo_embalaje</text><text class=\"at\" x=\"495.0\" y=\"467\">material</text><text class=\"at\" x=\"495.0\" y=\"482\">cubrimiento</text><path class=\"ln\" d=\"M495 410 L495 366\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"505\" y=\"396\">1</text><ellipse class=\"re\" cx=\"700\" cy=\"446\" rx=\"20\" ry=\"14\"/><text class=\"sm\" x=\"700\" y=\"450\">R</text><path class=\"ln\" d=\"M600 446 L680 446\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"618\" y=\"438\">1</text><rect class=\"cu\" x=\"780\" y=\"417\" width=\"190\" height=\"70\" rx=\"6\"/><text x=\"875.0\" y=\"435\">automata</text><line class=\"sep\" x1=\"788\" y1=\"443\" x2=\"962\" y2=\"443\"/><text class=\"at\" x=\"875.0\" y=\"459\">codigo_automata</text><text class=\"at\" x=\"875.0\" y=\"474\">funcion</text><path class=\"ln\" d=\"M780 446 L720 446\" marker-end=\"url(#mknal)\"/><text class=\"cd\" x=\"758\" y=\"438\">N</text></svg></div><div class=\"sep-v\"></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">semántica</th><th scope=\"col\">enunciado</th></tr></thead><tbody><tr><td>técnico</td><td>Capacidad de preservar la mercancía en un contenedor.</td></tr><tr><td>comercial</td><td>Y entregarlo en un embalaje establecido.</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "def-nat-pub",
                                "titulo": "Publicidad",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Publicidad</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:620px\" viewBox=\"0 0 1000 560\" role=\"img\" aria-label=\"Esquema de naturaleza del sistema de publicidad\"><defs><marker id=\"mknpu\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"cu\" x=\"20\" y=\"20\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"120.0\" y=\"38\">tipo_medio</text><line class=\"sep\" x1=\"28\" y1=\"46\" x2=\"212\" y2=\"46\"/><text class=\"at\" x=\"120.0\" y=\"62\">codigo_tipo_medio</text><text class=\"at\" x=\"120.0\" y=\"77\">descripcion_medio</text><rect class=\"cu\" x=\"330\" y=\"10\" width=\"190\" height=\"85\" rx=\"6\"/><text x=\"425.0\" y=\"28\">horario</text><line class=\"sep\" x1=\"338\" y1=\"36\" x2=\"512\" y2=\"36\"/><text class=\"at\" x=\"425.0\" y=\"52\">fecha</text><text class=\"at\" x=\"425.0\" y=\"67\">dia</text><text class=\"at\" x=\"425.0\" y=\"82\">hora</text><rect class=\"cu\" x=\"640\" y=\"40\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"740.0\" y=\"58\">tipo_canal</text><line class=\"sep\" x1=\"648\" y1=\"66\" x2=\"832\" y2=\"66\"/><text class=\"at\" x=\"740.0\" y=\"82\">codigo_tipo_canal</text><text class=\"at\" x=\"740.0\" y=\"97\">descripcion_canal</text><rect class=\"cu\" x=\"330\" y=\"170\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"430.0\" y=\"188\">tipo_vehiculo</text><line class=\"sep\" x1=\"338\" y1=\"196\" x2=\"522\" y2=\"196\"/><text class=\"at\" x=\"430.0\" y=\"212\">codigo_tipo_vehiculo</text><text class=\"at\" x=\"430.0\" y=\"227\">descripcion_vehiculo</text><ellipse class=\"re\" cx=\"250\" cy=\"199\" rx=\"16\" ry=\"14\"/><text class=\"sm\" x=\"250\" y=\"203\">R</text><path class=\"ln\" d=\"M120 90 L120 199 L234 199\" marker-end=\"url(#mknpu)\"/><path class=\"ln\" d=\"M330 199 L266 199\" marker-end=\"url(#mknpu)\"/><ellipse class=\"re\" cx=\"420\" cy=\"125\" rx=\"16\" ry=\"14\"/><text class=\"sm\" x=\"420\" y=\"129\">R</text><path class=\"ln\" d=\"M420 95 L420 111\" marker-end=\"url(#mknpu)\"/><path class=\"ln\" d=\"M420 170 L420 139\" marker-end=\"url(#mknpu)\"/><ellipse class=\"re\" cx=\"740\" cy=\"150\" rx=\"16\" ry=\"14\"/><text class=\"sm\" x=\"740\" y=\"154\">R</text><path class=\"ln\" d=\"M740 110 L740 136\" marker-end=\"url(#mknpu)\"/><path class=\"ln\" d=\"M530 199 L740 199 L740 164\" marker-end=\"url(#mknpu)\"/><rect class=\"ev\" x=\"420\" y=\"387\" width=\"170\" height=\"44\" rx=\"6\"/><text x=\"505.0\" y=\"413.5\">naturaleza</text><path class=\"ln\" d=\"M430 240 L430 387\" marker-end=\"url(#mknpu)\"/><text class=\"cd\" x=\"440\" y=\"300\">N</text><rect class=\"cu\" x=\"20\" y=\"235\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"120.0\" y=\"253\">cliente</text><line class=\"sep\" x1=\"28\" y1=\"261\" x2=\"212\" y2=\"261\"/><text class=\"at\" x=\"120.0\" y=\"277\">codigo_cliente</text><text class=\"at\" x=\"120.0\" y=\"292\">instrumento_pago_cliente</text><ellipse class=\"re\" cx=\"120\" cy=\"336\" rx=\"16\" ry=\"14\"/><text class=\"sm\" x=\"120\" y=\"340\">R</text><path class=\"ln\" d=\"M120 305 L120 322\" marker-end=\"url(#mknpu)\"/><path class=\"ln\" d=\"M120 380 L120 350\" marker-end=\"url(#mknpu)\"/><rect class=\"cu\" x=\"20\" y=\"380\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"120.0\" y=\"398\">tipo_producto</text><line class=\"sep\" x1=\"28\" y1=\"406\" x2=\"212\" y2=\"406\"/><text class=\"at\" x=\"120.0\" y=\"422\">codigo_tipo_producto</text><text class=\"at\" x=\"120.0\" y=\"437\">descripcion_producto</text><path class=\"ln\" d=\"M220 409 L420 409\" marker-end=\"url(#mknpu)\"/><text class=\"cd\" x=\"232\" y=\"401\">1</text><rect class=\"cu\" x=\"330\" y=\"470\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"430.0\" y=\"488\">anuncio</text><line class=\"sep\" x1=\"338\" y1=\"496\" x2=\"522\" y2=\"496\"/><text class=\"at\" x=\"430.0\" y=\"512\">codigo_anuncio</text><text class=\"at\" x=\"430.0\" y=\"527\">descripcion_anuncio</text><ellipse class=\"re\" cx=\"260\" cy=\"500\" rx=\"16\" ry=\"14\"/><text class=\"sm\" x=\"260\" y=\"504\">R</text><path class=\"ln\" d=\"M120 450 L120 500 L244 500\" marker-end=\"url(#mknpu)\"/><path class=\"ln\" d=\"M330 499 L276 500\" marker-end=\"url(#mknpu)\"/><rect class=\"cu\" x=\"700\" y=\"360\" width=\"240\" height=\"85\" rx=\"6\"/><text x=\"820.0\" y=\"378\">producto</text><line class=\"sep\" x1=\"708\" y1=\"386\" x2=\"932\" y2=\"386\"/><text class=\"at\" x=\"820.0\" y=\"402\">codigo_paquete</text><text class=\"at\" x=\"820.0\" y=\"417\">descripcion_paquete</text><text class=\"at\" x=\"820.0\" y=\"432\">costo_paquete</text><path class=\"ln\" d=\"M700 396 L640 396 L640 409 L590 409\" marker-end=\"url(#mknpu)\"/><rect class=\"ev\" x=\"760\" y=\"480\" width=\"150\" height=\"40\" rx=\"6\"/><text x=\"835.0\" y=\"504.5\">protocolo</text><path class=\"ln\" d=\"M815 445 L815 480\" marker-end=\"url(#mknpu)\"/></svg></div>"
                            },
                            {
                                "id": "def-nat-con",
                                "titulo": "Contabilidad",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Contabilidad</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:620px\" viewBox=\"0 0 1000 440\" role=\"img\" aria-label=\"Esquema de naturaleza del sistema de contabilidad\"><defs><marker id=\"mknco\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"60\" y=\"20\" width=\"230\" height=\"85\" rx=\"6\"/><text x=\"175.0\" y=\"38\">producto (catalogo)</text><line class=\"sep\" x1=\"68\" y1=\"46\" x2=\"282\" y2=\"46\"/><text class=\"at\" x=\"175.0\" y=\"62\">cod_prod_cat</text><text class=\"at\" x=\"175.0\" y=\"77\">cant_disponible</text><text class=\"at\" x=\"175.0\" y=\"92\">unidad_medida_prod</text><ellipse class=\"re\" cx=\"175\" cy=\"150\" rx=\"36\" ry=\"15\"/><text class=\"sm\" x=\"175\" y=\"154\">agrupa</text><rect class=\"cu\" x=\"60\" y=\"200\" width=\"230\" height=\"115\" rx=\"6\"/><text x=\"175.0\" y=\"218\">tipologia_producto</text><line class=\"sep\" x1=\"68\" y1=\"226\" x2=\"282\" y2=\"226\"/><text class=\"at\" x=\"175.0\" y=\"242\">tipo_prod</text><text class=\"at\" x=\"175.0\" y=\"257\">industria_prod</text><text class=\"at\" x=\"175.0\" y=\"272\">familia_prod</text><text class=\"at\" x=\"175.0\" y=\"287\">linea_prod</text><text class=\"at\" x=\"175.0\" y=\"302\">categoria_prod</text><path class=\"ln\" d=\"M175 105 L175 135\" marker-end=\"url(#mknco)\"/><path class=\"ln\" d=\"M175 200 L175 165\" marker-end=\"url(#mknco)\"/><ellipse class=\"re\" cx=\"500\" cy=\"230\" rx=\"70\" ry=\"24\"/><text class=\"sm\" x=\"500\" y=\"234\">naturaleza</text><path class=\"ln\" d=\"M290 250 L360 250 L360 230 L430 230\" marker-end=\"url(#mknco)\"/><rect class=\"ca\" x=\"400\" y=\"20\" width=\"200\" height=\"85\" rx=\"6\"/><text x=\"500.0\" y=\"38\">cuantia (catalogo)</text><line class=\"sep\" x1=\"408\" y1=\"46\" x2=\"592\" y2=\"46\"/><text class=\"at\" x=\"500.0\" y=\"62\">codigo_cuantia</text><text class=\"at\" x=\"500.0\" y=\"77\">monto_max</text><text class=\"at\" x=\"500.0\" y=\"92\">monto_min</text><path class=\"ln\" d=\"M500 105 L500 206\" marker-end=\"url(#mknco)\"/><rect class=\"cu\" x=\"760\" y=\"170\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"860.0\" y=\"188\">sistema_compra</text><line class=\"sep\" x1=\"768\" y1=\"196\" x2=\"952\" y2=\"196\"/><text class=\"at\" x=\"860.0\" y=\"212\">codigo_compra</text><text class=\"at\" x=\"860.0\" y=\"227\">tarifa_servicio</text><path class=\"ln\" d=\"M570 230 L660 230 L660 199 L760 199\" marker-end=\"url(#mknco)\"/><rect class=\"ca\" x=\"340\" y=\"330\" width=\"200\" height=\"70\" rx=\"6\"/><text x=\"440.0\" y=\"348\">urgencia (catalogo)</text><line class=\"sep\" x1=\"348\" y1=\"356\" x2=\"532\" y2=\"356\"/><text class=\"at\" x=\"440.0\" y=\"372\">cod_urgencia</text><text class=\"at\" x=\"440.0\" y=\"387\">tipo_urgencia</text><path class=\"ln\" d=\"M440 330 L440 249\" marker-end=\"url(#mknco)\"/><rect class=\"ca\" x=\"640\" y=\"330\" width=\"230\" height=\"70\" rx=\"6\"/><text x=\"755.0\" y=\"348\">procedencia (catalogo)</text><line class=\"sep\" x1=\"648\" y1=\"356\" x2=\"862\" y2=\"356\"/><text class=\"at\" x=\"755.0\" y=\"372\">cod_nacionalidad</text><text class=\"at\" x=\"755.0\" y=\"387\">tipo_procedencia</text><path class=\"ln\" d=\"M700 330 L700 280 L556 280 L556 246\" marker-end=\"url(#mknco)\"/></svg></div>"
                            },
                            {
                                "id": "def-nat-ven",
                                "titulo": "Ventas",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Ventas</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:620px\" viewBox=\"0 0 1000 520\" role=\"img\" aria-label=\"Esquema de naturaleza del sistema de ventas\"><defs><marker id=\"mknve\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"cu\" x=\"30\" y=\"20\" width=\"240\" height=\"145\" rx=\"6\"/><text x=\"150.0\" y=\"38\">tipo_producto</text><line class=\"sep\" x1=\"38\" y1=\"46\" x2=\"262\" y2=\"46\"/><text class=\"at\" x=\"150.0\" y=\"62\">codigo_tipo_producto</text><text class=\"at\" x=\"150.0\" y=\"77\">cantidad_minima_por_ventas</text><text class=\"at\" x=\"150.0\" y=\"92\">cantidad_maxima_por_vender</text><text class=\"at\" x=\"150.0\" y=\"107\">fecha_max_venta</text><text class=\"at\" x=\"150.0\" y=\"122\">descripcion</text><text class=\"at\" x=\"150.0\" y=\"137\">marca</text><text class=\"at\" x=\"150.0\" y=\"152\">fecha_fabricacion</text><rect class=\"cu\" x=\"400\" y=\"20\" width=\"230\" height=\"145\" rx=\"6\"/><text x=\"515.0\" y=\"38\">perfil_cliente</text><line class=\"sep\" x1=\"408\" y1=\"46\" x2=\"622\" y2=\"46\"/><text class=\"at\" x=\"515.0\" y=\"62\">codigo_perfil_cliente</text><text class=\"at\" x=\"515.0\" y=\"77\">sexo</text><text class=\"at\" x=\"515.0\" y=\"92\">nivel_socioeconomico</text><text class=\"at\" x=\"515.0\" y=\"107\">edad</text><text class=\"at\" x=\"515.0\" y=\"122\">comportamiento_cliente</text><text class=\"at\" x=\"515.0\" y=\"137\">ocupacion</text><text class=\"at\" x=\"515.0\" y=\"152\">ingreso_economico</text><rect class=\"ca\" x=\"740\" y=\"200\" width=\"230\" height=\"85\" rx=\"6\"/><text x=\"855.0\" y=\"218\">catalogo_fuerza_ventas</text><line class=\"sep\" x1=\"748\" y1=\"226\" x2=\"962\" y2=\"226\"/><text class=\"at\" x=\"855.0\" y=\"242\">codigo_fuerza_ventas</text><text class=\"at\" x=\"855.0\" y=\"257\">precio</text><text class=\"at\" x=\"855.0\" y=\"272\">descripcion</text><rect class=\"cu\" x=\"30\" y=\"230\" width=\"240\" height=\"190\" rx=\"6\"/><text x=\"150.0\" y=\"248\">tipo_interes_cliente</text><line class=\"sep\" x1=\"38\" y1=\"256\" x2=\"262\" y2=\"256\"/><text class=\"at\" x=\"150.0\" y=\"272\">codigo_interes_cliente</text><text class=\"at\" x=\"150.0\" y=\"287\">postura_hombros</text><text class=\"at\" x=\"150.0\" y=\"302\">postura_brazos</text><text class=\"at\" x=\"150.0\" y=\"317\">postura_piernas</text><text class=\"at\" x=\"150.0\" y=\"332\">postura_tronco</text><text class=\"at\" x=\"150.0\" y=\"347\">postura_cabeza</text><text class=\"at\" x=\"150.0\" y=\"362\">gesto_manos</text><text class=\"at\" x=\"150.0\" y=\"377\">elevacion_cejas</text><text class=\"at\" x=\"150.0\" y=\"392\">media_vocal</text><text class=\"at\" x=\"150.0\" y=\"407\">rango_vocal</text><rect class=\"cu\" x=\"400\" y=\"440\" width=\"230\" height=\"55\" rx=\"6\"/><text x=\"515.0\" y=\"458\">canal_venta</text><line class=\"sep\" x1=\"408\" y1=\"466\" x2=\"622\" y2=\"466\"/><text class=\"at\" x=\"515.0\" y=\"482\">codigo_canal_venta</text><ellipse class=\"re\" cx=\"500\" cy=\"290\" rx=\"70\" ry=\"24\"/><text class=\"sm\" x=\"500\" y=\"294\">naturaleza</text><path class=\"ln\" d=\"M270 100 L340 100 L340 282 L436 282\" marker-end=\"url(#mknve)\"/><path class=\"ln\" d=\"M270 330 L390 330 L390 298 L437 298\" marker-end=\"url(#mknve)\"/><path class=\"ln\" d=\"M500 165 L500 266\" marker-end=\"url(#mknve)\"/><path class=\"ln\" d=\"M740 242 L660 242 L660 290 L572 290\" marker-end=\"url(#mknve)\"/><path class=\"ln\" d=\"M500 440 L500 314\" marker-end=\"url(#mknve)\"/></svg></div>"
                            }
                        ]
                    },
                    {
                        "t": "aviso",
                        "id": "def-nat-error",
                        "tipo": "error",
                        "titulo": "Error frecuente",
                        "html": "<p>Revisa que cada componente aparezca una sola vez y que sus atributos coincidan con los de sus tablas.</p>"
                    },
                    {
                        "t": "texto",
                        "id": "def-tipologias",
                        "v": "v-ficha vc5",
                        "html": "<span class=\"v-pestana\">Tipologías</span><h2>Catálogo de productos y tipologías</h2><p>Desarrolla el <b>catálogo con todas las posibles combinaciones</b> de los productos que tu servicio puede ofrecer, y las <b>tipologías</b> de los componentes de tu producto: una tabla por cada tipo, con su código y su descripción.</p>"
                    },
                    {
                        "t": "pestanas",
                        "id": "def-tip-tabs",
                        "items": [
                            {
                                "id": "def-tip-alm",
                                "titulo": "Almacenamiento",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Almacenamiento</span></p><p>El catálogo de productos recoge <b>todas las combinaciones</b> que tu servicio puede ofrecer. Aquí, cada producto es un contenedor con un embalaje. Las tipologías son las tablas de tipos de cada componente.</p><div class=\"mini-grid\"><div class=\"mini\"><h4>catalogo_producto</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">producto</th><th scope=\"col\">contenedor</th><th scope=\"col\">embalaje</th></tr></thead><tbody><tr><td>Producto_00001</td><td>Cont_0001</td><td>Embal_01</td></tr><tr><td>Producto_00002</td><td>Cont_0001</td><td>Embal_02</td></tr><tr><td>Producto_00003</td><td>Cont_0001</td><td>Embal_03</td></tr><tr><td>…</td><td>…</td><td>…</td></tr><tr><td>Producto_58320</td><td>Cont_3888</td><td>Embal_15</td></tr></tbody></table></div></div><div class=\"mini\"><h4>catalogo_contenedor</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">material</th><th scope=\"col\">altura</th><th scope=\"col\">anchura</th><th scope=\"col\">profundidad</th><th scope=\"col\">temperatura</th></tr></thead><tbody><tr><td>Cont_0001</td><td>Mat_01</td><td>Alt_01</td><td>Anch_01</td><td>Prof_01</td><td>Temp_01</td></tr><tr><td>Cont_0002</td><td>Mat_01</td><td>Alt_01</td><td>Anch_01</td><td>Prof_01</td><td>Temp_02</td></tr><tr><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td></tr><tr><td>Cont_3888</td><td>Mat_06</td><td>Alt_06</td><td>Anch_06</td><td>Prof_06</td><td>Temp_03</td></tr></tbody></table></div></div><div class=\"mini\"><h4>catalogo_embalaje</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">material</th><th scope=\"col\">cubrimientos</th></tr></thead><tbody><tr><td>Embal_01</td><td>M_01</td><td>1</td></tr><tr><td>Embal_02</td><td>M_01</td><td>2</td></tr><tr><td>Embal_03</td><td>M_01</td><td>3</td></tr><tr><td>…</td><td>…</td><td>…</td></tr><tr><td>Embal_15</td><td>M_05</td><td>3</td></tr></tbody></table></div></div></div><h3 class=\"sub-t\">Tipologías</h3><div class=\"mini-grid\"><div class=\"mini\"><h4>altura / anchura / profundidad</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td>Alt_01 · Anch_01 · Prof_01</td><td>0.5 m</td></tr><tr><td>Alt_02 · Anch_02 · Prof_02</td><td>1 m</td></tr><tr><td>Alt_03 · Anch_03 · Prof_03</td><td>1.5 m</td></tr><tr><td>Alt_04 · Anch_04 · Prof_04</td><td>2 m</td></tr><tr><td>Alt_05 · Anch_05 · Prof_05</td><td>2.5 m</td></tr><tr><td>Alt_06 · Anch_06 · Prof_06</td><td>3 m</td></tr></tbody></table></div></div><div class=\"mini\"><h4>temperatura</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td>Temp_01</td><td>28 °C</td></tr><tr><td>Temp_02</td><td>0 °C</td></tr><tr><td>Temp_03</td><td>-25 °C</td></tr></tbody></table></div></div><div class=\"mini\"><h4>material del contenedor</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td>Mat_01</td><td>Cartón</td></tr><tr><td>Mat_02</td><td>Plástico</td></tr><tr><td>Mat_03</td><td>Tecnopor</td></tr><tr><td>Mat_04</td><td>Plomo</td></tr><tr><td>Mat_05</td><td>Madera</td></tr><tr><td>Mat_06</td><td>Acero</td></tr></tbody></table></div></div><div class=\"mini\"><h4>material del embalaje</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td>M_01</td><td>Madera</td></tr><tr><td>M_02</td><td>Plástico</td></tr><tr><td>M_03</td><td>Cartón</td></tr><tr><td>M_04</td><td>Papel</td></tr><tr><td>M_05</td><td>Aluminio</td></tr></tbody></table></div></div></div><div class=\"v-punteado vc2\"><b>Haz la cuenta.</b> Con estas tipologías, los contenedores posibles son 6 × 6 × 6 × 3 × 6 = <b>3,888</b>; los embalajes, 5 × 3 = <b>15</b>; y los productos, 3,888 × 15 = <b>58,320</b>. Si tu servicio no ofrece todas las combinaciones, aclara cuáles ofreces.</div>"
                            },
                            {
                                "id": "def-tip-tra",
                                "titulo": "Transporte",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Transporte</span></p><p>El catálogo lista los servicios que se pueden ofrecer, combinando origen, destino, horario, tipo de unidad y tipo de empaquetado.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_servicio_transporte</th><th scope=\"col\">origen</th><th scope=\"col\">destino</th><th scope=\"col\">horario</th><th scope=\"col\">tipo_unidad_transporte</th><th scope=\"col\">tipo_empaquetado</th></tr></thead><tbody><tr><td>SVTR-01</td><td>GEOR1</td><td>GEOR2</td><td>TIPOHR-1</td><td>TIPOUT-1</td><td>TIPOEMQ_001</td></tr><tr><td>SVTR-02</td><td>GEOR1</td><td>GEOR3</td><td>TIPOHR-2</td><td>TIPOUT-2</td><td>TIPOEMQ_013</td></tr><tr><td>SVTR-03</td><td>GEOR1</td><td>GEOR4</td><td>TIPOHR-3</td><td>TIPOUT-3</td><td>TIPOEMQ_014</td></tr><tr><td>SVTR-04</td><td>GEOR2</td><td>GEOR4</td><td>TIPOHR-4</td><td>TIPOUT-4</td><td>TIPOEMQ_004</td></tr><tr><td>SVTR-05</td><td>GEOR2</td><td>GEOR5</td><td>TIPOHR-5</td><td>TIPOUT-5</td><td>TIPOEMQ_035</td></tr><tr><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td><td>…</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "def-tip-pub",
                                "titulo": "Publicidad",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Publicidad</span></p><p>El paquete es el producto que se vende; cada paquete se asocia a un tipo de vehículo. <b>Los tickets no van en el catálogo</b>: nacen después, en Fabricación.</p><div class=\"mini-grid\"><div class=\"mini\"><h4>catalogo_paquete</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_paquete</th><th scope=\"col\">cod_tipo_vehiculo</th></tr></thead><tbody><tr><td>Paq_01</td><td>Veh_01</td></tr><tr><td>Paq_02</td><td>Veh_03</td></tr><tr><td>Paq_03</td><td>Veh_04</td></tr><tr><td>Paq_04</td><td>Veh_06</td></tr><tr><td>Paq_05</td><td>Veh_07</td></tr><tr><td>Paq_06</td><td>Veh_08</td></tr></tbody></table></div></div><div class=\"mini\"><h4>tipo_vehiculo</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_tipo_vehiculo</th><th scope=\"col\">medio</th><th scope=\"col\">canal</th><th scope=\"col\">tipo_contenido</th></tr></thead><tbody><tr><td>Veh_01</td><td>Medio_01</td><td>Canal_01</td><td>Contenido_01</td></tr><tr><td>Veh_03</td><td>Medio_03</td><td>Canal_03</td><td>Contenido_03</td></tr><tr><td>Veh_04</td><td>Medio_04</td><td>Canal_04</td><td>Contenido_04</td></tr><tr><td>Veh_05</td><td>Medio_05</td><td>Canal_05</td><td>Contenido_05</td></tr><tr><td>Veh_06</td><td>Medio_06</td><td>Canal_06</td><td>Contenido_06</td></tr><tr><td>Veh_07</td><td>Medio_07</td><td>Canal_07</td><td>Contenido_07</td></tr><tr><td>Veh_08</td><td>Medio_08</td><td>Canal_08</td><td>Contenido_08</td></tr></tbody></table></div></div></div>"
                            },
                            {
                                "id": "def-tip-con",
                                "titulo": "Contabilidad",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Contabilidad</span></p><p>El catálogo de hechos económicos reúne los tipos de hecho que el sistema registra. Las tipologías son los catálogos de activos, pasivos y patrimonio.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_he</th><th scope=\"col\">tipo_hecho</th><th scope=\"col\">nombre_transaccion</th><th scope=\"col\">num_cuenta_cargo</th><th scope=\"col\">num_cuenta_abono</th><th scope=\"col\">descrip_he</th><th scope=\"col\">monto</th><th scope=\"col\">tipo_moneda</th></tr></thead><tbody><tr><td>HE_001</td><td>contable</td><td>venta</td><td>COD_CUENTA_1</td><td>COD_CUENTA_2</td><td>DESCRIP_HE_1</td><td>MONTO_1</td><td>MONEDA_1</td></tr><tr><td>HE_002</td><td>contable</td><td>compra</td><td>COD_CUENTA_3</td><td>COD_CUENTA_4</td><td>DESCRIP_HE_2</td><td>MONTO_2</td><td>MONEDA_2</td></tr><tr><td>HE_003</td><td>contable</td><td>efectivo_caja</td><td>COD_CUENTA_5</td><td>COD_CUENTA_6</td><td>DESCRIP_HE_3</td><td>MONTO_3</td><td>MONEDA_3</td></tr><tr><td>HE_004</td><td>contable</td><td>banco</td><td>COD_CUENTA_7</td><td>COD_CUENTA_8</td><td>DESCRIP_HE_4</td><td>MONTO_4</td><td>MONEDA_4</td></tr><tr><td>HE_006</td><td>ajuste</td><td>anticipo_clientes</td><td>COD_CUENTA_11</td><td>COD_CUENTA_12</td><td>DESCRIP_HE_6</td><td>MONTO_6</td><td>MONEDA_6</td></tr><tr><td>HE_008</td><td>ajuste</td><td>depreciacion</td><td>COD_CUENTA_15</td><td>COD_CUENTA_16</td><td>DESCRIP_HE_8</td><td>MONTO_8</td><td>MONEDA_8</td></tr><tr><td>HE_009</td><td>cierre</td><td>saldar_cuenta_ingreso_gasto</td><td>COD_CUENTA_17</td><td>COD_CUENTA_18</td><td>DESCRIP_HE_9</td><td>MONTO_9</td><td>MONEDA_9</td></tr></tbody></table></div><div class=\"mini-grid\"><div class=\"mini\"><h4>catalogo_activos</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">numero</th><th scope=\"col\">nombre</th></tr></thead><tbody><tr><td>A1</td><td>Activo corriente</td></tr><tr><td>A11</td><td>Efectivo y equivalente de efectivo</td></tr><tr><td>A12</td><td>Inversiones financieras</td></tr><tr><td>A13</td><td>Cuentas por cobrar comerciales (neto)</td></tr><tr><td>A2</td><td>Activo no corriente</td></tr><tr><td>…</td><td>…</td></tr></tbody></table></div></div><div class=\"mini\"><h4>catalogo_pasivos</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">numero</th><th scope=\"col\">nombre</th></tr></thead><tbody><tr><td>P1</td><td>Pasivo corriente</td></tr><tr><td>P11</td><td>Sobregiros bancarios</td></tr><tr><td>P12</td><td>Obligaciones financieras</td></tr><tr><td>P13</td><td>Cuentas por pagar comerciales</td></tr><tr><td>P2</td><td>Pasivo no corriente</td></tr><tr><td>…</td><td>…</td></tr></tbody></table></div></div><div class=\"mini\"><h4>catalogo_patrimonio_neto</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">numero</th><th scope=\"col\">nombre</th></tr></thead><tbody><tr><td>N1</td><td>Capital</td></tr><tr><td>N2</td><td>Acciones de inversión</td></tr><tr><td>N3</td><td>Capital adicional</td></tr><tr><td>N4</td><td>Resultados no realizados</td></tr><tr><td>…</td><td>…</td></tr></tbody></table></div></div></div>"
                            },
                            {
                                "id": "def-tip-cob",
                                "titulo": "Cobranzas",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p>En cobranzas, el cliente es el <b>sponsor</b> (quien contrata el servicio). El producto es el tipo de cobranza que se le presta, y cada uno se ejecuta por su canal.</p><div class=\"mini-grid\"><div class=\"mini\"><h4>catalogo_producto</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_producto</th><th scope=\"col\">producto</th><th scope=\"col\">canal</th></tr></thead><tbody><tr><td>COBR_LEV</td><td>cobranza_leve</td><td>SMS y WhatsApp</td></tr><tr><td>COBR_INT</td><td>cobranza_intermedia</td><td>llamada</td></tr><tr><td>COBR_PRE</td><td>cobranza_prejudicial</td><td>correo electrónico</td></tr><tr><td>COBR_JUD</td><td>cobranza_judicial</td><td>carta notarial</td></tr></tbody></table></div></div><div class=\"mini\"><h4>tipo_mora (tipología)</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td>Mora_03</td><td>3 días de mora</td></tr><tr><td>Mora_05</td><td>5 días de mora</td></tr><tr><td>Mora_10</td><td>10 días de mora</td></tr><tr><td>Mora_15</td><td>15 días de mora</td></tr></tbody></table></div></div></div>"
                            }
                        ]
                    },
                    {
                        "t": "aviso",
                        "id": "def-tip-error",
                        "tipo": "error",
                        "titulo": "Error frecuente",
                        "html": "<p>Poner tickets dentro del catálogo de productos. El catálogo define lo que ofreces; los tickets se fabrican después. Tampoco repitas dos tablas con el mismo nombre y distinto formato de código: si hay dos materiales, nómbralos por su componente.</p>"
                    },
                    {
                        "t": "texto",
                        "id": "def-componentes",
                        "v": "v-ficha vc6",
                        "html": "<span class=\"v-pestana\">Componentes</span><h2>Componentes del sistema</h2><p>Son los elementos que permiten que se lleven a cabo las operaciones dentro del sistema. Cada uno lleva su tipo y su descripción funcional.</p><p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">componente</th><th scope=\"col\">tipo</th><th scope=\"col\">descripcion_funcional</th></tr></thead><tbody><tr><td><code>automata_sms</code></td><td>recurso automatizado</td><td>Ejecuta el envío de mensajes de texto programados.</td></tr><tr><td><code>automata_whatsapp</code></td><td>recurso automatizado</td><td>Opera envíos de WhatsApp bajo validación de horario.</td></tr><tr><td><code>automata_email</code></td><td>recurso automatizado</td><td>Operador virtual que envía correos electrónicos programados.</td></tr><tr><td><code>automata_llamada</code></td><td>recurso automatizado</td><td>Realiza llamadas pregrabadas para presionar al moroso.</td></tr><tr><td><code>notario_carta</code></td><td>operador humano</td><td>Profesional autorizado que redacta, firma y certifica la carta notarial como documento oficial.</td></tr><tr><td><code>abogado_legal</code></td><td>operador humano</td><td>Representa al sponsor ante instancias judiciales y gestiona procesos formales.</td></tr><tr><td><code>dron_inteligente</code></td><td>recurso automatizado</td><td>Operador tecnológico autónomo que entrega notificaciones físicas en operaciones judiciales.</td></tr></tbody></table></div>"
                    },
                    {
                        "t": "texto",
                        "id": "def-protocolo",
                        "v": "v-ficha vc7",
                        "html": "<span class=\"v-pestana\">Protocolo</span><h2>Protocolo: cómo se llevan a cabo las operaciones</h2><p>Describe cómo se llevan a cabo las operaciones y actividades dentro de tu sistema: <b>transacción → operación de negocio → secuencia → método</b>.</p>"
                    },
                    {
                        "t": "pestanas",
                        "id": "def-pro-tabs",
                        "items": [
                            {
                                "id": "def-pro-cob",
                                "titulo": "Cobranzas",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p>Un servicio de cobranza se organiza en transacciones. Cada transacción se descompone en operaciones de negocio, y cada operación en métodos.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">servicio</th><th scope=\"col\">transaccion</th></tr></thead><tbody><tr><td><code>cobr_x</code></td><td><code>organizar_datos</code></td></tr><tr><td><code>cobr_x</code></td><td><code>leer_ticket</code></td></tr><tr><td><code>cobr_x</code></td><td><code>clasificar_moroso</code></td></tr><tr><td><code>cobr_x</code></td><td><code>clasificar_deuda</code></td></tr><tr><td><code>cobr_x</code></td><td><code>ejecutar_cobranza</code></td></tr><tr><td><code>cobr_x</code></td><td><code>verificar_cumplimiento_pago</code></td></tr><tr><td><code>cobr_x</code></td><td><code>cerrar_servicio</code></td></tr></tbody></table></div><div class=\"sep-v\"></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">transaccion</th><th scope=\"col\">operacion</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td><code>organizar_datos</code></td><td><code>obtencion_datos</code></td><td>Recibe y registra los datos proporcionados por el sponsor: su información y la del moroso y su deuda.</td></tr><tr><td></td><td><code>validacion_datos</code></td><td>Confirma que los datos recibidos sean correctos y estén completos para operar.</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "def-pro-alm",
                                "titulo": "Almacenamiento",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Almacenamiento</span></p><p>Cada transacción lista sus operaciones de negocio en orden de secuencia (<code>sec</code>) y, dentro de cada una, sus métodos.</p><h3 class=\"sub-t\">Transacción 1 · ingreso_vehiculo</h3><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">transaccion</th><th scope=\"col\">op_negocio</th><th scope=\"col\">sec</th><th scope=\"col\">metodo</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td>ingreso_vehiculo</td><td>crear_evento_ingreso</td><td>0</td><td>crear_evento</td><td>Se crea el evento de ingreso.</td></tr><tr><td>ingreso_vehiculo</td><td>validar_placa_ticket</td><td>1</td><td>insertar_placa</td><td>Se inserta la placa.</td></tr><tr><td></td><td></td><td></td><td>validar_placa</td><td>Se valida la placa contra la del ticket.</td></tr><tr><td>ingreso_vehiculo</td><td>validar_fecha</td><td>2</td><td>validar_fecha</td><td>Se valida la fecha.</td></tr><tr><td>ingreso_vehiculo</td><td>validar_hora</td><td>3</td><td>validar_hora</td><td>Se valida la hora.</td></tr><tr><td>ingreso_vehiculo</td><td>validar_puerta</td><td>4</td><td>validar_puerta</td><td>Se valida la puerta de ingreso.</td></tr><tr><td>ingreso_vehiculo</td><td>actualizar_ticket</td><td>5</td><td>grabar_evento</td><td>Se graba el evento.</td></tr></tbody></table></div><h3 class=\"sub-t\">Transacción 2 · recepcion_mercancia</h3><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">transaccion</th><th scope=\"col\">op_negocio</th><th scope=\"col\">sec</th><th scope=\"col\">metodo</th><th scope=\"col\">descripcion</th></tr></thead><tbody><tr><td>recepcion_mercancia</td><td>crear_evento_recepcion</td><td>0</td><td>crear_evento</td><td>Se crea el evento de recepción.</td></tr><tr><td>recepcion_mercancia</td><td>control_calidad</td><td>1</td><td>validar_cantidad</td><td>Se valida la cantidad.</td></tr><tr><td></td><td></td><td></td><td>validar_peso</td><td>Se valida el peso con el programado.</td></tr><tr><td></td><td></td><td></td><td>validar_largo</td><td>Se valida el largo con el programado.</td></tr><tr><td></td><td></td><td></td><td>validar_alto</td><td>Se valida el alto con el programado.</td></tr><tr><td></td><td></td><td></td><td>validar_ancho</td><td>Se valida el ancho con el programado.</td></tr><tr><td></td><td></td><td></td><td>validar_temperatura</td><td>Se valida la temperatura con la programada.</td></tr><tr><td></td><td></td><td></td><td>validar_embalaje</td><td>Se valida el embalaje con el programado.</td></tr><tr><td>recepcion_mercancia</td><td>actualizar_ticket</td><td>2</td><td>grabar_evento</td><td>Se graba el evento.</td></tr></tbody></table></div>"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "fabricacion",
                "nombre": "Fabricación",
                "tipo": "contenido",
                "titulo": "Fabricación",
                "intro": "Antes de poder hacer algo, primero debes tener lo necesario para hacerlo. Fabricar un ticket es más que crearlo: antes de que exista, ya hay recursos programados y una fecha y un horario reservados.",
                "bloques": [
                    {
                        "t": "tarjetas",
                        "id": "fab-tres",
                        "titulo": "Las tres piezas de la Fabricación",
                        "cols": 3,
                        "v": "bv-contorno vc-ciclo",
                        "items": [
                            {
                                "k": 1,
                                "etq": "Pieza 1",
                                "titulo": "Recursos programados",
                                "html": "¿Cómo se programan y separan los recursos por cada ticket o por cada tipo de servicio al que se destina un ticket?",
                                "ir": [
                                    "fabricacion",
                                    "fab-programados"
                                ]
                            },
                            {
                                "k": 2,
                                "etq": "Pieza 2",
                                "titulo": "Disponibilidad",
                                "html": "¿Cómo organizas la disponibilidad de tickets, las fechas y los horarios, y su estado de disponibilidad para vender?",
                                "ir": [
                                    "fabricacion",
                                    "fab-disponibilidad"
                                ]
                            },
                            {
                                "k": 3,
                                "etq": "Pieza 3",
                                "titulo": "Generación de tickets",
                                "html": "¿Cómo se crea un ticket ya con una fecha reservada y los recursos específicos ya programados? Va en gráfico y tabla.",
                                "ir": [
                                    "fabricacion",
                                    "fab-tickets"
                                ]
                            }
                        ]
                    },
                    {
                        "t": "pestanas",
                        "id": "fab-ejemplos",
                        "titulo": "Caso aplicado: cobranzas",
                        "items": [
                            {
                                "id": "fab-recursos",
                                "titulo": "1 · Recursos del producto",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p>Antes de programar nada, define <b>qué recursos usa cada producto</b> y <b>qué recurso ejecuta cada transacción</b>, con su capacidad. Es la base de las tres piezas siguientes.</p><h3 class=\"sub-t\">Producto y sus recursos</h3><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_producto</th><th scope=\"col\">producto</th><th scope=\"col\">cod_recurso</th><th scope=\"col\">recurso</th><th scope=\"col\">tipo</th><th scope=\"col\">condicion_uso</th></tr></thead><tbody><tr><td>COBR_LEV</td><td>estrategia_leve</td><td>r_aut_sms</td><td>automata_sms</td><td>recurso automatizado</td><td>configurable por el sponsor</td></tr><tr><td></td><td></td><td>r_aut_wpp</td><td>automata_whatsapp</td><td>recurso automatizado</td><td>configurable por el sponsor</td></tr><tr><td>COBR_INT</td><td>estrategia_intermedia</td><td>r_aut_llam</td><td>automata_llamada</td><td>recurso automatizado</td><td>configurable por el sponsor</td></tr><tr><td>COBR_PRE</td><td>estrategia_prejudicial</td><td>r_aut_eml</td><td>automata_email</td><td>recurso automatizado</td><td>configurable por el sponsor</td></tr><tr><td>COBR_JUD</td><td>estrategia_judicial</td><td>r_dron_legal</td><td>dron_inteligente</td><td>recurso automatizado</td><td>obligatorio, único canal de entrega</td></tr><tr><td></td><td></td><td>r_notario_carta</td><td>notario_carta</td><td>operador humano</td><td>participación obligatoria</td></tr><tr><td></td><td></td><td>r_abog_legal</td><td>abogado_legal</td><td>operador humano</td><td>participación obligatoria</td></tr></tbody></table></div><h3 class=\"sub-t\">Transacción y su recurso</h3><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_transaccion</th><th scope=\"col\">nom_transaccion</th><th scope=\"col\">cod_recurso</th><th scope=\"col\">nom_recurso</th><th scope=\"col\">tipo</th><th scope=\"col\">capacidad_maxima</th></tr></thead><tbody><tr><td>TRX_ENV_SMS</td><td>enviar_mensaje_sms</td><td>r_aut_sms</td><td>automata_sms</td><td>recurso automatizado</td><td>600</td></tr><tr><td>TRX_ENV_WPP</td><td>enviar_mensaje_whatsapp</td><td>r_aut_wpp</td><td>automata_whatsapp</td><td>recurso automatizado</td><td>600</td></tr><tr><td>TRX_ENV_EML</td><td>enviar_mensaje_correo</td><td>r_aut_eml</td><td>automata_email</td><td>recurso automatizado</td><td>400</td></tr><tr><td>TRX_ENV_LLAM</td><td>realizar_llamada_automatica</td><td>r_aut_llam</td><td>automata_llamada</td><td>recurso automatizado</td><td>180</td></tr><tr><td>TRX_GEN_CARTA</td><td>redactar_carta_notarial</td><td>r_notario_carta</td><td>notario_carta</td><td>operador humano</td><td>—</td></tr><tr><td>TRX_ENV_DRON</td><td>enviar_dron_con_carta</td><td>r_dron_legal</td><td>dron_inteligente</td><td>recurso automatizado</td><td>100</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "fab-programados",
                                "titulo": "2 · Recursos programados",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p><b>Recursos programados:</b> cómo se programan y separan los recursos por cada ticket o por cada tipo de servicio al que se destina un ticket. El evento creador compromete el recurso del parque (operador y canal) para cada tipo de cobranza.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:620px\" viewBox=\"0 0 1000 310\" role=\"img\" aria-label=\"Diagrama de recursos programados del sistema de cobranzas\"><defs><marker id=\"mkpro\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"20\" y=\"115\" width=\"130\" height=\"44\" rx=\"6\"/><text x=\"85.0\" y=\"134.0\">operador_tipo</text><text class=\"sm\" x=\"85.0\" y=\"150.0\">catálogo</text><ellipse class=\"re\" cx=\"85\" cy=\"195\" rx=\"22\" ry=\"14\"/><text class=\"sm\" x=\"85\" y=\"199\">C-P</text><rect class=\"cu\" x=\"20\" y=\"235\" width=\"130\" height=\"44\" rx=\"6\"/><text x=\"85.0\" y=\"261.5\">operador_parque</text><ellipse class=\"re\" cx=\"215\" cy=\"257\" rx=\"20\" ry=\"14\"/><text class=\"sm\" x=\"215\" y=\"261\">R</text><rect class=\"cu\" x=\"280\" y=\"235\" width=\"130\" height=\"44\" rx=\"6\"/><text x=\"345.0\" y=\"261.5\">canal_parque</text><ellipse class=\"re\" cx=\"345\" cy=\"195\" rx=\"22\" ry=\"14\"/><text class=\"sm\" x=\"345\" y=\"199\">C-P</text><rect class=\"ca\" x=\"280\" y=\"115\" width=\"130\" height=\"44\" rx=\"6\"/><text x=\"345.0\" y=\"134.0\">canal_tipo</text><text class=\"sm\" x=\"345.0\" y=\"150.0\">catálogo</text><ellipse class=\"re\" cx=\"345\" cy=\"75\" rx=\"46\" ry=\"15\"/><text class=\"sm\" x=\"345\" y=\"79\">naturaleza</text><rect class=\"ca\" x=\"470\" y=\"53\" width=\"150\" height=\"44\" rx=\"6\"/><text x=\"545.0\" y=\"72.0\">catalogo_cobranza</text><text class=\"sm\" x=\"545.0\" y=\"88.0\">catálogo</text><path class=\"ln\" d=\"M85 159 L85 181\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M85 235 L85 209\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M150 257 L195 257\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M280 257 L235 257\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M345 159 L345 181\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M345 235 L345 209\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M345 115 L345 90\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M470 75 L391 75\" marker-end=\"url(#mkpro)\"/><ellipse class=\"re\" cx=\"720\" cy=\"75\" rx=\"36\" ry=\"15\"/><text class=\"sm\" x=\"720\" y=\"79\">detalle</text><path class=\"ln\" d=\"M620 75 L684 75\" marker-end=\"url(#mkpro)\"/><rect class=\"ct\" x=\"665\" y=\"4\" width=\"110\" height=\"34\" rx=\"6\"/><text x=\"720.0\" y=\"25.5\">calendario</text><path class=\"ln\" d=\"M720 38 L720 60\" marker-end=\"url(#mkpro)\"/><rect class=\"cu\" x=\"800\" y=\"53\" width=\"120\" height=\"44\" rx=\"6\"/><text x=\"860.0\" y=\"79.5\">lote_ticket</text><path class=\"ln\" d=\"M800 75 L756 75\" marker-end=\"url(#mkpro)\"/><ellipse class=\"re\" cx=\"860\" cy=\"170\" rx=\"46\" ry=\"15\"/><text class=\"sm\" x=\"860\" y=\"174\">naturaleza</text><path class=\"ln\" d=\"M860 97 L860 155\" marker-end=\"url(#mkpro)\"/><rect class=\"cu\" x=\"800\" y=\"225\" width=\"120\" height=\"44\" rx=\"6\"/><text x=\"860.0\" y=\"251.5\">ticket</text><path class=\"ln\" d=\"M860 225 L860 185\" marker-end=\"url(#mkpro)\"/><rect class=\"ev\" x=\"655\" y=\"227\" width=\"130\" height=\"60\" rx=\"6\"/><text x=\"720.0\" y=\"261.5\">evento_creador</text><path class=\"ln\" d=\"M720 227 L720 90\" marker-end=\"url(#mkpro)\"/><ellipse class=\"re\" cx=\"520\" cy=\"257\" rx=\"50\" ry=\"15\"/><text class=\"sm\" x=\"520\" y=\"261\">comprometido</text><path class=\"ln\" d=\"M655 257 L570 257\" marker-end=\"url(#mkpro)\"/><path class=\"ln\" d=\"M470 257 L410 257\" marker-end=\"url(#mkpro)\"/></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">e_creador</th><th scope=\"col\">tipo_cobranza</th><th scope=\"col\">tipo_operador</th><th scope=\"col\">operador_parque</th><th scope=\"col\">canal_asociado</th><th scope=\"col\">cantidad_tickets</th></tr></thead><tbody><tr><td>EC-C1</td><td>cobranza_leve</td><td>AUT-WPP</td><td>AUTWPP-01</td><td>whatsapp</td><td>Q1</td></tr><tr><td>EC-C1</td><td>cobranza_leve</td><td>AUT-SMS</td><td>AUTSMS-03</td><td>sms</td><td>Q2</td></tr><tr><td>EC-C1</td><td>cobranza_intermedia</td><td>AUT-LLAM</td><td>AUTLLAM-02</td><td>llamada</td><td>Q1</td></tr><tr><td>EC-C2</td><td>cobranza_prejudicial</td><td>AUT-EMAIL</td><td>AUTEML-02</td><td>correo electrónico</td><td>Q3</td></tr><tr><td>EC-C2</td><td>cobranza_judicial</td><td>DRON-LEGAL</td><td>DRON-02</td><td>carta notarial</td><td>Q1</td></tr><tr><td>EC-C3</td><td>cobranza_intermedia</td><td>AUT-LLAM</td><td>AUTLLAM-03</td><td>llamada</td><td>Q2</td></tr></tbody></table></div><p class=\"muted\">Q1, Q2 y Q3 son cantidades de ejemplo.</p>"
                            },
                            {
                                "id": "fab-disponibilidad",
                                "titulo": "3 · Disponibilidad",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p><b>Disponibilidad:</b> cómo organizas la disponibilidad de tickets: las fechas, los horarios y el estado de disponibilidad para vender. Cada fila es una combinación única de sponsor, fecha, recurso y franja horaria.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:527px\" viewBox=\"0 0 850 300\" role=\"img\" aria-label=\"Diagrama de disponibilidad de recursos del sistema de cobranzas\"><defs><marker id=\"mkdis\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ct\" x=\"20\" y=\"153\" width=\"130\" height=\"34\" rx=\"6\"/><text x=\"85.0\" y=\"174.5\">calendario</text><ellipse class=\"re\" cx=\"255\" cy=\"170\" rx=\"62\" ry=\"16\"/><text class=\"sm\" x=\"255\" y=\"174\">disponibilidad</text><rect class=\"cu\" x=\"145\" y=\"40\" width=\"220\" height=\"44\" rx=\"6\"/><text x=\"255.0\" y=\"66.5\">operador_automata_parque</text><ellipse class=\"re\" cx=\"470\" cy=\"62\" rx=\"26\" ry=\"14\"/><text class=\"sm\" x=\"470\" y=\"66\">C-P</text><rect class=\"ca\" x=\"575\" y=\"40\" width=\"220\" height=\"44\" rx=\"6\"/><text x=\"685.0\" y=\"59.0\">tipo_operador_automata</text><text class=\"sm\" x=\"685.0\" y=\"75.0\">catálogo</text><ellipse class=\"re\" cx=\"685\" cy=\"170\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"685\" y=\"174\">R</text><rect class=\"ca\" x=\"595\" y=\"235\" width=\"180\" height=\"44\" rx=\"6\"/><text x=\"685.0\" y=\"254.0\">canal_cobranza</text><text class=\"sm\" x=\"685.0\" y=\"270.0\">catálogo</text><path class=\"ln\" d=\"M365 62 L444 62\" marker-end=\"url(#mkdis)\"/><path class=\"ln\" d=\"M575 62 L496 62\" marker-end=\"url(#mkdis)\"/><path class=\"ln\" d=\"M255 84 L255 154\" marker-end=\"url(#mkdis)\"/><path class=\"ln\" d=\"M150 170 L193 170\" marker-end=\"url(#mkdis)\"/><path class=\"ln\" d=\"M685 84 L685 156\" marker-end=\"url(#mkdis)\"/><path class=\"ln\" d=\"M685 235 L685 184\" marker-end=\"url(#mkdis)\"/></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_sponsor</th><th scope=\"col\">fecha</th><th scope=\"col\">cod_recurso</th><th scope=\"col\">hora_ini</th><th scope=\"col\">hora_fin</th><th scope=\"col\">tickets_ocupados</th><th scope=\"col\">capacidad_maxima</th><th scope=\"col\">estado_operativo</th></tr></thead><tbody><tr><td>spns_065</td><td>25/06/2025</td><td>r_aut_sms</td><td>08:00</td><td>09:00</td><td>50</td><td>50</td><td>saturado</td></tr><tr><td>spns_066</td><td>25/06/2025</td><td>r_aut_sms</td><td>08:00</td><td>09:00</td><td>50</td><td>50</td><td>saturado</td></tr><tr><td>spns_066</td><td>25/06/2025</td><td>r_aut_sms</td><td>09:00</td><td>10:00</td><td>30</td><td>50</td><td>disponible</td></tr><tr><td>spns_067</td><td>25/06/2025</td><td>r_aut_sms</td><td>09:00</td><td>10:00</td><td>0</td><td>50</td><td>disponible</td></tr><tr><td>spns_067</td><td>25/06/2025</td><td>r_aut_sms</td><td>10:00</td><td>11:00</td><td>0</td><td>50</td><td>disponible</td></tr></tbody></table></div><p class=\"muted\">En este ejemplo, la franja queda <b>saturada</b> cuando los tickets ocupados igualan la capacidad máxima; mientras haya cupo, está <b>disponible</b>. La capacidad de 50 tickets por hora equivale a los 600 diarios del recurso en 12 franjas.</p>"
                            },
                            {
                                "id": "fab-tickets",
                                "titulo": "4 · Generación de tickets",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p><b>Generación de tickets:</b> el gráfico y la tabla de cómo se crea un ticket <b>ya con una fecha reservada y con los recursos específicos programados</b>.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:620px\" viewBox=\"0 0 1000 380\" role=\"img\" aria-label=\"Diagrama de generación de tickets del sistema de cobranzas\"><defs><marker id=\"mktic\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"20\" y=\"68\" width=\"150\" height=\"44\" rx=\"6\"/><text x=\"95.0\" y=\"87.0\">operador_catalogo</text><text class=\"sm\" x=\"95.0\" y=\"103.0\">catálogo</text><ellipse class=\"re\" cx=\"270\" cy=\"90\" rx=\"46\" ry=\"15\"/><text class=\"sm\" x=\"270\" y=\"94\">naturaleza</text><rect class=\"ca\" x=\"370\" y=\"68\" width=\"160\" height=\"44\" rx=\"6\"/><text x=\"450.0\" y=\"87.0\">catalogo_cobranza</text><text class=\"sm\" x=\"450.0\" y=\"103.0\">catálogo</text><path class=\"ln\" d=\"M170 90 L224 90\" marker-end=\"url(#mktic)\"/><path class=\"ln\" d=\"M370 90 L316 90\" marker-end=\"url(#mktic)\"/><ellipse class=\"re\" cx=\"95\" cy=\"190\" rx=\"22\" ry=\"14\"/><text class=\"sm\" x=\"95\" y=\"194\">C-P</text><path class=\"ln\" d=\"M95 112 L95 176\" marker-end=\"url(#mktic)\"/><rect class=\"cu\" x=\"20\" y=\"255\" width=\"150\" height=\"44\" rx=\"6\"/><text x=\"95.0\" y=\"281.5\">operador_parque</text><path class=\"ln\" d=\"M95 255 L95 204\" marker-end=\"url(#mktic)\"/><ellipse class=\"re\" cx=\"650\" cy=\"90\" rx=\"40\" ry=\"15\"/><text class=\"sm\" x=\"650\" y=\"94\">detalle</text><path class=\"ln\" d=\"M530 90 L610 90\" marker-end=\"url(#mktic)\"/><rect class=\"ct\" x=\"590\" y=\"4\" width=\"120\" height=\"34\" rx=\"6\"/><text x=\"650.0\" y=\"25.5\">calendario</text><path class=\"ln\" d=\"M650 38 L650 75\" marker-end=\"url(#mktic)\"/><rect class=\"cu\" x=\"790\" y=\"68\" width=\"190\" height=\"44\" rx=\"6\"/><text x=\"885.0\" y=\"94.5\">cobranza_programada_lote</text><path class=\"ln\" d=\"M790 90 L690 90\" marker-end=\"url(#mktic)\"/><rect class=\"ev\" x=\"575\" y=\"247\" width=\"150\" height=\"60\" rx=\"6\"/><text x=\"650.0\" y=\"281.5\">evento_creador</text><path class=\"ln\" d=\"M650 247 L650 105\" marker-end=\"url(#mktic)\"/><ellipse class=\"re\" cx=\"430\" cy=\"277\" rx=\"52\" ry=\"15\"/><text class=\"sm\" x=\"430\" y=\"281\">comprometidos</text><path class=\"ln\" d=\"M575 277 L482 277\" marker-end=\"url(#mktic)\"/><path class=\"ln\" d=\"M170 277 L378 277\" marker-end=\"url(#mktic)\"/><ellipse class=\"re\" cx=\"800\" cy=\"277\" rx=\"22\" ry=\"14\"/><text class=\"sm\" x=\"800\" y=\"281\">R</text><path class=\"ln\" d=\"M725 277 L778 277\" marker-end=\"url(#mktic)\"/><path class=\"ln\" d=\"M885 112 L885 277 L822 277\" marker-end=\"url(#mktic)\"/><rect class=\"cu\" x=\"790\" y=\"322\" width=\"190\" height=\"44\" rx=\"6\"/><text x=\"885.0\" y=\"348.5\">cuenta_ticket</text><path class=\"ln\" d=\"M800 292 L800 322\" marker-end=\"url(#mktic)\"/></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">e_creador</th><th scope=\"col\">tipo_cobranza</th><th scope=\"col\">fecha</th><th scope=\"col\">tipo_operador</th><th scope=\"col\">operador_parque</th><th scope=\"col\">canal_asociado</th><th scope=\"col\">cantidad_tickets</th><th scope=\"col\">codigo_ticket</th></tr></thead><tbody><tr><td>EC-C1</td><td>cobranza_leve</td><td>24/06/2025</td><td>AUT-WPP</td><td>AUTWPP-01</td><td>whatsapp</td><td>Q1</td><td>tck-ST01-M1</td></tr><tr><td>EC-C1</td><td>cobranza_leve</td><td>24/06/2025</td><td>AUT-SMS</td><td>AUTSMS-03</td><td>sms</td><td>Q2</td><td>tck-ST02-M1</td></tr><tr><td>EC-C1</td><td>cobranza_intermedia</td><td>24/06/2025</td><td>AUT-LLAM</td><td>AUTLLAM-02</td><td>llamada</td><td>Q1</td><td>tck-ST01-M2</td></tr><tr><td>EC-C2</td><td>cobranza_prejudicial</td><td>25/06/2025</td><td>AUT-EMAIL</td><td>AUTEML-02</td><td>correo electrónico</td><td>Q3</td><td>tck-ST02-M2</td></tr><tr><td>EC-C2</td><td>cobranza_judicial</td><td>25/06/2025</td><td>DRON-LEGAL</td><td>DRON-02</td><td>carta notarial</td><td>Q1</td><td>tck-ST03-M3</td></tr><tr><td>EC-C3</td><td>cobranza_intermedia</td><td>25/06/2025</td><td>AUT-LLAM</td><td>AUTLLAM-03</td><td>llamada</td><td>Q2</td><td>tck-ST02-M3</td></tr></tbody></table></div>"
                            }
                        ]
                    },
                    {
                        "t": "aviso",
                        "id": "fab-tip",
                        "tipo": "tip",
                        "titulo": "Consejo",
                        "html": "<p>Los ejemplos son de cobranzas. En tu sistema cambia los recursos, los operadores y los canales por los tuyos, pero conserva las tres piezas y el orden: recursos, disponibilidad, ticket.</p>"
                    },
                    {
                        "t": "aviso",
                        "id": "fab-error",
                        "tipo": "error",
                        "titulo": "Error frecuente",
                        "html": "<p>Repetir filas en la tabla de disponibilidad o marcar como «disponible» una franja que ya llegó a su capacidad máxima. El estado tiene que salir de comparar tickets ocupados con capacidad máxima.</p>"
                    }
                ]
            },
            {
                "id": "reglas",
                "nombre": "Reglas",
                "tipo": "contenido",
                "titulo": "Reglas",
                "intro": "Cuando se te presenta un problema en tu sistema, tienes varias opciones de cómo resolverlo; tú eliges una, y esa es la regla. Presenta mínimo 3, bien hechas.",
                "bloques": [
                    {
                        "t": "texto",
                        "id": "reg-anatomia",
                        "v": "v-ficha vc4",
                        "html": "<span class=\"v-pestana\">Cómo se arma</span><h2>Las piezas de una regla</h2><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">Pieza</th><th scope=\"col\">Responde a</th><th scope=\"col\">Columnas</th></tr></thead><tbody><tr><td>Enunciado</td><td>Qué problema resuelve y qué opción elegiste</td><td>Texto</td></tr><tr><td><code>catalogo_condiciones</code></td><td>Qué se evalúa y qué pasa si se cumple o no</td><td>cod_cond, descripcion, operador_logico, parametro, accion_v, accion_f</td></tr><tr><td><code>relacion_validacion</code></td><td>Con qué variable se evalúa cada condición y en qué orden</td><td>cod_cond, cod_var, secuencia</td></tr><tr><td><code>catalogo_variables</code></td><td>De dónde sale cada dato que se evalúa</td><td>cod_var, descripcion, origen, nombre_interno, categoria, valor</td></tr><tr><td><code>catalogo_acciones</code></td><td>Qué hace el sistema según el resultado</td><td>cod_acc, resultado_del_analisis, accion_del_sistema</td></tr></tbody></table></div>"
                    },
                    {
                        "t": "pestanas",
                        "id": "reg-tabs",
                        "titulo": "Ejemplos",
                        "items": [
                            {
                                "id": "reg-cob1",
                                "titulo": "Cobranzas · Regla 1",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p class=\"enun\">Asignación del mínimo de llamadas según el saldo adeudado, en la etapa intermedia. Si el saldo adeudado del moroso es mayor o igual a S/20,000, se realizan como mínimo 10 llamadas. Si está entre S/1,000 y S/19,999, como mínimo 5. Si es menor a S/1,000, como mínimo 3.</p><h4>catalogo_condiciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">descripcion</th><th scope=\"col\">operador_logico</th><th scope=\"col\">parametro</th><th scope=\"col\">accion_v</th><th scope=\"col\">accion_f</th></tr></thead><tbody><tr><td>COND01</td><td>saldo_adeudado ≥ S/20,000</td><td>≥</td><td>umbral_alto</td><td>OK</td><td>COND02</td></tr><tr><td>COND02</td><td>S/1,000 ≤ saldo_adeudado < S/20,000</td><td>≥ y <</td><td>umbral_medio, umbral_alto</td><td>OK</td><td>COND03</td></tr><tr><td>COND03</td><td>saldo_adeudado < S/1,000</td><td><</td><td>umbral_medio</td><td>OK</td><td>NULL</td></tr></tbody></table></div><h4>relacion_validacion</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">cod_var</th><th scope=\"col\">secuencia</th></tr></thead><tbody><tr><td>COND01</td><td>saldo_adeudado</td><td>1</td></tr><tr><td>COND02</td><td>saldo_adeudado</td><td>2</td></tr><tr><td>COND03</td><td>saldo_adeudado</td><td>3</td></tr></tbody></table></div><h4>catalogo_variables</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_var</th><th scope=\"col\">descripcion</th><th scope=\"col\">origen</th><th scope=\"col\">nombre_interno</th><th scope=\"col\">categoria</th><th scope=\"col\">valor</th></tr></thead><tbody><tr><td>saldo_adeudado</td><td>Saldo adeudado del moroso</td><td>V · entidad deuda</td><td>saldo_adeudado</td><td>variable</td><td>—</td></tr><tr><td>umbral_medio</td><td>Umbral que inicia el rango medio</td><td>P · parámetro</td><td>umbral_medio</td><td>parámetro</td><td>S/1,000</td></tr><tr><td>umbral_alto</td><td>Umbral que inicia el rango alto</td><td>P · parámetro</td><td>umbral_alto</td><td>parámetro</td><td>S/20,000</td></tr></tbody></table></div><h4>catalogo_acciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_acc</th><th scope=\"col\">resultado_del_analisis</th><th scope=\"col\">accion_del_sistema</th></tr></thead><tbody><tr><td>ACC01</td><td>COND01 válida</td><td>Ejecutar como mínimo 10 llamadas</td></tr><tr><td>ACC02</td><td>COND02 válida</td><td>Ejecutar como mínimo 5 llamadas</td></tr><tr><td>ACC03</td><td>COND03 válida</td><td>Ejecutar como mínimo 3 llamadas</td></tr></tbody></table></div><h4>acciones_tecnico_operativas</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">codigo</th><th scope=\"col\">tipo</th><th scope=\"col\">valor</th></tr></thead><tbody><tr><td>MET01</td><td>método</td><td>obtener el saldo_adeudado de la deuda</td></tr><tr><td>MET02</td><td>método</td><td>evaluar_rango_saldo para determinar min_llamadas</td></tr><tr><td>MET03</td><td>método</td><td>asignar min_llamadas a estrategia_intermedia</td></tr><tr><td>EVT01</td><td>evento</td><td>inicia estrategia_intermedia</td></tr><tr><td>OP01</td><td>operación</td><td>calcular_minimo_llamadas</td></tr></tbody></table></div><p class=\"aplica\"><b>Cómo se aplica.</b> Si COND01 es verdadera (OK), se ejecuta ACC01. Si no, y COND02 es verdadera, se ejecuta ACC02. Si no, y COND03 es verdadera, se ejecuta ACC03.</p>"
                            },
                            {
                                "id": "reg-cob2",
                                "titulo": "Cobranzas · Regla 2",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p class=\"ej\"><span class=\"v-etq vc4\">Propuesta</span> <span class=\"muted\">Redacción de ejemplo para este sistema; úsala como modelo para armar la tuya.</span></p><p class=\"enun\">Selección del tipo de cobranza según la antigüedad de la mora. Cada deuda pasa al tipo de cobranza que corresponde a sus días de mora: desde 15 días, judicial; desde 10, prejudicial; desde 5, intermedia; desde 3, leve.</p><h4>catalogo_condiciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">descripcion</th><th scope=\"col\">operador_logico</th><th scope=\"col\">parametro</th><th scope=\"col\">accion_v</th><th scope=\"col\">accion_f</th></tr></thead><tbody><tr><td>COND01</td><td>antiguedad_mora ≥ 15 días</td><td>≥</td><td>umbral_judicial</td><td>OK</td><td>COND02</td></tr><tr><td>COND02</td><td>antiguedad_mora ≥ 10 días</td><td>≥</td><td>umbral_prejudicial</td><td>OK</td><td>COND03</td></tr><tr><td>COND03</td><td>antiguedad_mora ≥ 5 días</td><td>≥</td><td>umbral_intermedia</td><td>OK</td><td>COND04</td></tr><tr><td>COND04</td><td>antiguedad_mora ≥ 3 días</td><td>≥</td><td>umbral_leve</td><td>OK</td><td>NULL</td></tr></tbody></table></div><h4>relacion_validacion</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">cod_var</th><th scope=\"col\">secuencia</th></tr></thead><tbody><tr><td>COND01</td><td>antiguedad_mora</td><td>1</td></tr><tr><td>COND02</td><td>antiguedad_mora</td><td>2</td></tr><tr><td>COND03</td><td>antiguedad_mora</td><td>3</td></tr><tr><td>COND04</td><td>antiguedad_mora</td><td>4</td></tr></tbody></table></div><h4>catalogo_variables</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_var</th><th scope=\"col\">descripcion</th><th scope=\"col\">origen</th><th scope=\"col\">nombre_interno</th><th scope=\"col\">categoria</th><th scope=\"col\">valor</th></tr></thead><tbody><tr><td>antiguedad_mora</td><td>Días transcurridos desde el vencimiento de la deuda</td><td>V · entidad deuda</td><td>antiguedad_mora</td><td>variable</td><td>—</td></tr><tr><td>umbral_leve</td><td>Días de mora que inician la cobranza leve</td><td>P · parámetro</td><td>umbral_leve</td><td>parámetro</td><td>3</td></tr><tr><td>umbral_intermedia</td><td>Días de mora que inician la cobranza intermedia</td><td>P · parámetro</td><td>umbral_intermedia</td><td>parámetro</td><td>5</td></tr><tr><td>umbral_prejudicial</td><td>Días de mora que inician la cobranza prejudicial</td><td>P · parámetro</td><td>umbral_prejudicial</td><td>parámetro</td><td>10</td></tr><tr><td>umbral_judicial</td><td>Días de mora que inician la cobranza judicial</td><td>P · parámetro</td><td>umbral_judicial</td><td>parámetro</td><td>15</td></tr></tbody></table></div><h4>catalogo_acciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_acc</th><th scope=\"col\">resultado_del_analisis</th><th scope=\"col\">accion_del_sistema</th></tr></thead><tbody><tr><td>ACC01</td><td>COND01 válida</td><td>Asignar cobranza_judicial</td></tr><tr><td>ACC02</td><td>COND02 válida</td><td>Asignar cobranza_prejudicial</td></tr><tr><td>ACC03</td><td>COND03 válida</td><td>Asignar cobranza_intermedia</td></tr><tr><td>ACC04</td><td>COND04 válida</td><td>Asignar cobranza_leve</td></tr></tbody></table></div><p class=\"aplica\"><b>Cómo se aplica.</b> Se evalúa de la mora más alta a la más baja: la primera condición verdadera fija el tipo de cobranza de la deuda.</p>"
                            },
                            {
                                "id": "reg-cob3",
                                "titulo": "Cobranzas · Regla 3",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p class=\"ej\"><span class=\"v-etq vc4\">Propuesta</span> <span class=\"muted\">Redacción de ejemplo para este sistema; úsala como modelo para armar la tuya.</span></p><p class=\"enun\">Qué hacer con cada respuesta del moroso. Si el moroso se compromete a pagar, se renueva la estrategia con una nueva fecha de seguimiento. Si no responde, se reintenta por el mismo canal en la siguiente franja disponible. Si rechaza, se registra la respuesta y se mantiene la estrategia.</p><h4>catalogo_condiciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">descripcion</th><th scope=\"col\">operador_logico</th><th scope=\"col\">parametro</th><th scope=\"col\">accion_v</th><th scope=\"col\">accion_f</th></tr></thead><tbody><tr><td>COND01</td><td>tipo_respuesta = compromiso_pago</td><td>=</td><td>compromiso_pago</td><td>OK</td><td>COND02</td></tr><tr><td>COND02</td><td>tipo_respuesta = sin_respuesta</td><td>=</td><td>sin_respuesta</td><td>OK</td><td>COND03</td></tr><tr><td>COND03</td><td>tipo_respuesta = rechazo</td><td>=</td><td>rechazo</td><td>OK</td><td>NULL</td></tr></tbody></table></div><h4>relacion_validacion</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">cod_var</th><th scope=\"col\">secuencia</th></tr></thead><tbody><tr><td>COND01</td><td>tipo_respuesta</td><td>1</td></tr><tr><td>COND02</td><td>tipo_respuesta</td><td>2</td></tr><tr><td>COND03</td><td>tipo_respuesta</td><td>3</td></tr></tbody></table></div><h4>catalogo_variables</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_var</th><th scope=\"col\">descripcion</th><th scope=\"col\">origen</th><th scope=\"col\">nombre_interno</th><th scope=\"col\">categoria</th><th scope=\"col\">valor</th></tr></thead><tbody><tr><td>tipo_respuesta</td><td>Tipo de respuesta capturada del moroso</td><td>V · evento de respuesta</td><td>tipo_respuesta</td><td>variable</td><td>—</td></tr></tbody></table></div><h4>catalogo_acciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_acc</th><th scope=\"col\">resultado_del_analisis</th><th scope=\"col\">accion_del_sistema</th></tr></thead><tbody><tr><td>ACC01</td><td>COND01 válida</td><td>Renovar la estrategia con nueva fecha de seguimiento</td></tr><tr><td>ACC02</td><td>COND02 válida</td><td>Reintentar por el mismo canal en la siguiente franja disponible</td></tr><tr><td>ACC03</td><td>COND03 válida</td><td>Registrar la respuesta y mantener la estrategia</td></tr></tbody></table></div><p class=\"aplica\"><b>Cómo se aplica.</b> La respuesta capturada con <code>obtener_respuesta_moroso</code> se evalúa en orden; la primera condición verdadera decide la acción.</p>"
                            },
                            {
                                "id": "reg-alm1",
                                "titulo": "Almacenamiento · Regla 1",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Almacenamiento</span></p><p class=\"enun\">Para dar ingreso y empezar a recepcionar la mercancía del camión se deben cumplir tres condiciones: la placa del vehículo es igual a la registrada en el ticket, la hora de llegada es menor que la hora máxima programada y mayor que la hora mínima programada.</p><h4>catalogo_condiciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">descripcion</th><th scope=\"col\">operador_logico</th><th scope=\"col\">parametro</th><th scope=\"col\">accion_v</th><th scope=\"col\">accion_f</th></tr></thead><tbody><tr><td>COND01</td><td>placa = placa_ticket</td><td>EQ</td><td>placa_ticket</td><td>COND02</td><td>NULL</td></tr><tr><td>COND02</td><td>hora_llegada < hora_max_prog</td><td>LT</td><td>hora_max_prog</td><td>COND03</td><td>NULL</td></tr><tr><td>COND03</td><td>hora_llegada > hora_min_prog</td><td>GT</td><td>hora_min_prog</td><td>OK</td><td>NULL</td></tr></tbody></table></div><h4>relacion_validacion</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">cod_var</th><th scope=\"col\">secuencia</th></tr></thead><tbody><tr><td>COND01</td><td>placa</td><td>1</td></tr><tr><td>COND02</td><td>hora_llegada</td><td>2</td></tr><tr><td>COND03</td><td>hora_llegada</td><td>3</td></tr></tbody></table></div><h4>catalogo_variables</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_var</th><th scope=\"col\">descripcion</th><th scope=\"col\">origen</th><th scope=\"col\">nombre_interno</th><th scope=\"col\">categoria</th><th scope=\"col\">valor</th></tr></thead><tbody><tr><td>placa</td><td>Placa del vehículo que llega</td><td>V · evento de ingreso</td><td>placa</td><td>variable</td><td>—</td></tr><tr><td>hora_llegada</td><td>Hora de llegada del vehículo</td><td>V · evento de ingreso</td><td>hora_llegada</td><td>variable</td><td>—</td></tr><tr><td>placa_ticket</td><td>Placa registrada en el ticket</td><td>V · entidad ticket</td><td>placa_ticket</td><td>variable</td><td>—</td></tr><tr><td>hora_min_prog</td><td>Hora mínima programada en el ticket</td><td>V · entidad ticket</td><td>hora_min_prog</td><td>variable</td><td>—</td></tr><tr><td>hora_max_prog</td><td>Hora máxima programada en el ticket</td><td>V · entidad ticket</td><td>hora_max_prog</td><td>variable</td><td>—</td></tr></tbody></table></div><h4>catalogo_acciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_acc</th><th scope=\"col\">resultado_del_analisis</th><th scope=\"col\">accion_del_sistema</th></tr></thead><tbody><tr><td>ACC01</td><td>COND01, COND02 y COND03 válidas</td><td>Dar ingreso e iniciar la recepción</td></tr><tr><td>ACC02</td><td>Alguna condición no válida</td><td>No dar ingreso</td></tr></tbody></table></div><p class=\"aplica\"><b>Cómo se aplica.</b> Las tres condiciones se encadenan (AND): solo si las tres son verdaderas se da el ingreso.</p>"
                            },
                            {
                                "id": "reg-pub1",
                                "titulo": "Publicidad · Regla 1",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Publicidad</span></p><p class=\"enun\">Un cliente solo puede comprar un máximo de 12 tickets, equivalente a un máximo de 60 segundos dentro de un vehículo publicitario. Se verifica que la cantidad comprada sea menor o igual a 12 y que el paquete tenga un solo vehículo.</p><h4>catalogo_condiciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">descripcion</th><th scope=\"col\">operador_logico</th><th scope=\"col\">parametro</th><th scope=\"col\">accion_v</th><th scope=\"col\">accion_f</th></tr></thead><tbody><tr><td>COND01</td><td>numero_tickets ≤ 12</td><td>LE</td><td>12</td><td>COND02</td><td>NULL</td></tr><tr><td>COND02</td><td>numero_vehiculos = 1</td><td>EQ</td><td>1</td><td>OK</td><td>NULL</td></tr></tbody></table></div><h4>relacion_validacion</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_cond</th><th scope=\"col\">cod_var</th><th scope=\"col\">secuencia</th></tr></thead><tbody><tr><td>COND01</td><td>numero_tickets</td><td>1</td></tr><tr><td>COND02</td><td>numero_vehiculos</td><td>2</td></tr></tbody></table></div><h4>catalogo_variables</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_var</th><th scope=\"col\">descripcion</th><th scope=\"col\">origen</th><th scope=\"col\">nombre_interno</th><th scope=\"col\">categoria</th><th scope=\"col\">valor</th></tr></thead><tbody><tr><td>numero_tickets</td><td>Número de tickets comprados en total</td><td>V · evento de venta</td><td>numero_tickets</td><td>variable</td><td>—</td></tr><tr><td>numero_vehiculos</td><td>Número de vehículos asociados al paquete</td><td>V · evento de venta</td><td>numero_vehiculos</td><td>variable</td><td>—</td></tr></tbody></table></div><h4>catalogo_acciones</h4><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_acc</th><th scope=\"col\">resultado_del_analisis</th><th scope=\"col\">accion_del_sistema</th></tr></thead><tbody><tr><td>ACC01</td><td>COND01 y COND02 válidas</td><td>Permitir la compra de los tickets</td></tr><tr><td>ACC02</td><td>Alguna condición no válida</td><td>Rechazar la compra</td></tr></tbody></table></div><p class=\"aplica\"><b>Cómo se aplica.</b> Se verifica primero la cantidad de tickets y después los vehículos del paquete; ambas deben cumplirse.</p>"
                            }
                        ]
                    },
                    {
                        "t": "aviso",
                        "id": "reg-error",
                        "tipo": "error",
                        "titulo": "Error frecuente",
                        "html": "<p>Que el enunciado y las condiciones digan cosas distintas. Si el enunciado dice «máximo 12», la condición es <code>≤ 12</code>, no <code>= 12</code>; y cada condición del catálogo debe tener su variable en la relación y su fila en el catálogo de variables.</p>"
                    }
                ]
            },
            {
                "id": "politicas",
                "nombre": "Políticas",
                "tipo": "contenido",
                "titulo": "Políticas",
                "intro": "Una política es realizar una operación o ciertas operaciones bajo tus términos. Presenta mínimo 3, bien hechas.",
                "bloques": [
                    {
                        "t": "texto",
                        "id": "pol-anatomia",
                        "v": "v-ficha vc2",
                        "html": "<span class=\"v-pestana\">Cómo se arma</span><h2>Las piezas de una política</h2><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">Pieza</th><th scope=\"col\">Responde a</th></tr></thead><tbody><tr><td>Enunciado</td><td>Qué operación se realiza y bajo qué términos</td></tr><tr><td>Relación entre catálogos</td><td>Qué dos catálogos se relacionan, con su cardinalidad (1 o N) en cada extremo</td></tr><tr><td>Tabla de la política</td><td>Los pares de códigos que sí se permiten, cada par una sola vez</td></tr></tbody></table></div><p class=\"muted\">La diferencia con una regla: la regla elige una forma de resolver un problema (condiciones, variables y acciones); la política fija bajo qué términos se hace una operación (relación entre catálogos).</p>"
                    },
                    {
                        "t": "pestanas",
                        "id": "pol-tabs",
                        "titulo": "Ejemplos",
                        "items": [
                            {
                                "id": "pol-cob1",
                                "titulo": "Cobranzas · Política 1",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p class=\"enun\">Cada tipo de cobranza tiene canales de contacto autorizados, priorizando la efectividad del medio según la severidad del caso.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:434px\" viewBox=\"0 0 700 110\" role=\"img\" aria-label=\"Política: tipo de cobranza y canales autorizados\"><defs><marker id=\"mkpc1\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"20\" y=\"20\" width=\"230\" height=\"70\" rx=\"6\"/><text x=\"135.0\" y=\"38\">tipo_cobranza</text><line class=\"sep\" x1=\"28\" y1=\"46\" x2=\"242\" y2=\"46\"/><text class=\"at\" x=\"135.0\" y=\"62\">codigo_tipo_cobranza</text><text class=\"at\" x=\"135.0\" y=\"77\">nombre_tipo_cobranza</text><rect class=\"ca\" x=\"450\" y=\"20\" width=\"230\" height=\"70\" rx=\"6\"/><text x=\"565.0\" y=\"38\">canal_cobranza</text><line class=\"sep\" x1=\"458\" y1=\"46\" x2=\"672\" y2=\"46\"/><text class=\"at\" x=\"565.0\" y=\"62\">codigo_canal</text><text class=\"at\" x=\"565.0\" y=\"77\">nombre_canal</text><ellipse class=\"re\" cx=\"350\" cy=\"55.0\" rx=\"44\" ry=\"16\"/><text class=\"sm\" x=\"350\" y=\"59.0\">aplica</text><path class=\"ln\" d=\"M250 55.0 L306 55.0\" marker-end=\"url(#mkpc1)\"/><text class=\"cd\" x=\"262\" y=\"47.0\">1</text><path class=\"ln\" d=\"M450 55.0 L394 55.0\" marker-end=\"url(#mkpc1)\"/><text class=\"cd\" x=\"426\" y=\"47.0\">N</text></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">tipo_cobranza</th><th scope=\"col\">canal_cobranza</th></tr></thead><tbody><tr><td>cobranza_leve</td><td>SMS</td></tr><tr><td>cobranza_leve</td><td>WhatsApp</td></tr><tr><td>cobranza_intermedia</td><td>llamada</td></tr><tr><td>cobranza_prejudicial</td><td>correo electrónico</td></tr><tr><td>cobranza_judicial</td><td>carta notarial</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "pol-cob2",
                                "titulo": "Cobranzas · Política 2",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p class=\"ej\"><span class=\"v-etq vc4\">Propuesta</span> <span class=\"muted\">Redacción de ejemplo para este sistema; úsala como modelo para armar la tuya.</span></p><p class=\"enun\">Cada canal solo opera en las franjas horarias autorizadas, para no contactar al moroso fuera de horario.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:434px\" viewBox=\"0 0 700 125\" role=\"img\" aria-label=\"Política: canal y franjas horarias autorizadas\"><defs><marker id=\"mkpc2\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"20\" y=\"20\" width=\"230\" height=\"70\" rx=\"6\"/><text x=\"135.0\" y=\"38\">canal_cobranza</text><line class=\"sep\" x1=\"28\" y1=\"46\" x2=\"242\" y2=\"46\"/><text class=\"at\" x=\"135.0\" y=\"62\">codigo_canal</text><text class=\"at\" x=\"135.0\" y=\"77\">nombre_canal</text><rect class=\"ca\" x=\"450\" y=\"20\" width=\"230\" height=\"85\" rx=\"6\"/><text x=\"565.0\" y=\"38\">franja_horaria</text><line class=\"sep\" x1=\"458\" y1=\"46\" x2=\"672\" y2=\"46\"/><text class=\"at\" x=\"565.0\" y=\"62\">codigo_franja</text><text class=\"at\" x=\"565.0\" y=\"77\">hora_ini</text><text class=\"at\" x=\"565.0\" y=\"92\">hora_fin</text><ellipse class=\"re\" cx=\"350\" cy=\"62.5\" rx=\"44\" ry=\"16\"/><text class=\"sm\" x=\"350\" y=\"66.5\">aplica</text><path class=\"ln\" d=\"M250 62.5 L306 62.5\" marker-end=\"url(#mkpc2)\"/><text class=\"cd\" x=\"262\" y=\"54.5\">1</text><path class=\"ln\" d=\"M450 62.5 L394 62.5\" marker-end=\"url(#mkpc2)\"/><text class=\"cd\" x=\"426\" y=\"54.5\">N</text></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">canal_cobranza</th><th scope=\"col\">franja_horaria</th></tr></thead><tbody><tr><td>SMS</td><td>FH_01 · 08:00-12:00</td></tr><tr><td>SMS</td><td>FH_02 · 12:00-16:00</td></tr><tr><td>SMS</td><td>FH_03 · 16:00-20:00</td></tr><tr><td>WhatsApp</td><td>FH_01 · 08:00-12:00</td></tr><tr><td>WhatsApp</td><td>FH_02 · 12:00-16:00</td></tr><tr><td>WhatsApp</td><td>FH_03 · 16:00-20:00</td></tr><tr><td>llamada</td><td>FH_01 · 08:00-12:00</td></tr><tr><td>llamada</td><td>FH_02 · 12:00-16:00</td></tr><tr><td>carta notarial</td><td>FH_01 · 08:00-12:00</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "pol-cob3",
                                "titulo": "Cobranzas · Política 3",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p class=\"ej\"><span class=\"v-etq vc4\">Propuesta</span> <span class=\"muted\">Redacción de ejemplo para este sistema; úsala como modelo para armar la tuya.</span></p><p class=\"enun\">Cada canal solo puede ser atendido por los tipos de operador habilitados para él.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:434px\" viewBox=\"0 0 700 110\" role=\"img\" aria-label=\"Política: canal y tipos de operador habilitados\"><defs><marker id=\"mkpc3\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"20\" y=\"20\" width=\"230\" height=\"70\" rx=\"6\"/><text x=\"135.0\" y=\"38\">canal_cobranza</text><line class=\"sep\" x1=\"28\" y1=\"46\" x2=\"242\" y2=\"46\"/><text class=\"at\" x=\"135.0\" y=\"62\">codigo_canal</text><text class=\"at\" x=\"135.0\" y=\"77\">nombre_canal</text><rect class=\"ca\" x=\"450\" y=\"20\" width=\"230\" height=\"70\" rx=\"6\"/><text x=\"565.0\" y=\"38\">tipo_operador</text><line class=\"sep\" x1=\"458\" y1=\"46\" x2=\"672\" y2=\"46\"/><text class=\"at\" x=\"565.0\" y=\"62\">codigo_tipo_operador</text><text class=\"at\" x=\"565.0\" y=\"77\">nombre_tipo_operador</text><ellipse class=\"re\" cx=\"350\" cy=\"55.0\" rx=\"44\" ry=\"16\"/><text class=\"sm\" x=\"350\" y=\"59.0\">aplica</text><path class=\"ln\" d=\"M250 55.0 L306 55.0\" marker-end=\"url(#mkpc3)\"/><text class=\"cd\" x=\"262\" y=\"47.0\">1</text><path class=\"ln\" d=\"M450 55.0 L394 55.0\" marker-end=\"url(#mkpc3)\"/><text class=\"cd\" x=\"426\" y=\"47.0\">N</text></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">canal_cobranza</th><th scope=\"col\">tipo_operador</th></tr></thead><tbody><tr><td>SMS</td><td>automata_sms</td></tr><tr><td>WhatsApp</td><td>automata_whatsapp</td></tr><tr><td>llamada</td><td>automata_llamada</td></tr><tr><td>correo electrónico</td><td>automata_email</td></tr><tr><td>carta notarial</td><td>notario_carta</td></tr><tr><td>carta notarial</td><td>dron_inteligente</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "pol-alm",
                                "titulo": "Almacenamiento",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Almacenamiento</span></p><p class=\"enun\">Puerta de ingreso aplicable a categoría de mercancía: cada categoría ingresa por la puerta que le corresponde.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:434px\" viewBox=\"0 0 700 95\" role=\"img\" aria-label=\"Política: puerta de ingreso y categoría de mercancía\"><defs><marker id=\"mkpal\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"20\" y=\"20\" width=\"230\" height=\"55\" rx=\"6\"/><text x=\"135.0\" y=\"38\">puerta_ingreso</text><line class=\"sep\" x1=\"28\" y1=\"46\" x2=\"242\" y2=\"46\"/><text class=\"at\" x=\"135.0\" y=\"62\">codigo_puerta</text><rect class=\"ca\" x=\"450\" y=\"20\" width=\"230\" height=\"55\" rx=\"6\"/><text x=\"565.0\" y=\"38\">categoria_mercancia</text><line class=\"sep\" x1=\"458\" y1=\"46\" x2=\"672\" y2=\"46\"/><text class=\"at\" x=\"565.0\" y=\"62\">codigo_categoria</text><ellipse class=\"re\" cx=\"350\" cy=\"47.5\" rx=\"44\" ry=\"16\"/><text class=\"sm\" x=\"350\" y=\"51.5\">aplica</text><path class=\"ln\" d=\"M250 47.5 L306 47.5\" marker-end=\"url(#mkpal)\"/><text class=\"cd\" x=\"262\" y=\"39.5\">1</text><path class=\"ln\" d=\"M450 47.5 L394 47.5\" marker-end=\"url(#mkpal)\"/><text class=\"cd\" x=\"426\" y=\"39.5\">1</text></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">puerta_ingreso</th><th scope=\"col\">categoria_mercancia</th></tr></thead><tbody><tr><td>PTA_01</td><td>CM_01</td></tr><tr><td>PTA_02</td><td>CM_02</td></tr><tr><td>PTA_03</td><td>CM_03</td></tr><tr><td>PTA_04</td><td>CM_04</td></tr><tr><td>PTA_05</td><td>CM_05</td></tr><tr><td>PTA_06</td><td>CM_06</td></tr><tr><td>PTA_07</td><td>CM_07</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "pol-ven",
                                "titulo": "Ventas",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Ventas</span></p><p class=\"enun\">Para cada elemento del catálogo de fuerza de ventas se le relacionan varios instrumentos de pago. Es el instrumento que el cliente usará para liquidar nuestro servicio de venta.</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:434px\" viewBox=\"0 0 700 125\" role=\"img\" aria-label=\"Política: fuerza de ventas e instrumentos de pago\"><defs><marker id=\"mkpve\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ca\" x=\"20\" y=\"20\" width=\"230\" height=\"85\" rx=\"6\"/><text x=\"135.0\" y=\"38\">catalogo_fuerza_ventas</text><line class=\"sep\" x1=\"28\" y1=\"46\" x2=\"242\" y2=\"46\"/><text class=\"at\" x=\"135.0\" y=\"62\">codigo_fuerza_ventas</text><text class=\"at\" x=\"135.0\" y=\"77\">precio</text><text class=\"at\" x=\"135.0\" y=\"92\">descripcion</text><rect class=\"ca\" x=\"450\" y=\"20\" width=\"230\" height=\"70\" rx=\"6\"/><text x=\"565.0\" y=\"38\">catalogo_instrumento_pago</text><line class=\"sep\" x1=\"458\" y1=\"46\" x2=\"672\" y2=\"46\"/><text class=\"at\" x=\"565.0\" y=\"62\">codigo_instrumento_pago</text><text class=\"at\" x=\"565.0\" y=\"77\">descripcion</text><ellipse class=\"re\" cx=\"350\" cy=\"62.5\" rx=\"44\" ry=\"16\"/><text class=\"sm\" x=\"350\" y=\"66.5\">aplica</text><path class=\"ln\" d=\"M250 62.5 L306 62.5\" marker-end=\"url(#mkpve)\"/><text class=\"cd\" x=\"262\" y=\"54.5\">N</text><path class=\"ln\" d=\"M450 62.5 L394 62.5\" marker-end=\"url(#mkpve)\"/><text class=\"cd\" x=\"426\" y=\"54.5\">N</text></svg></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">fuerza_ventas</th><th scope=\"col\">instrumento_pago</th></tr></thead><tbody><tr><td>FV_1</td><td>INST_1</td></tr><tr><td>FV_1</td><td>INST_2</td></tr><tr><td>FV_2</td><td>INST_1</td></tr><tr><td>FV_3</td><td>INST_2</td></tr><tr><td>FV_3</td><td>INST_3</td></tr></tbody></table></div><p class=\"muted\">Un mismo instrumento puede servir a varias fuerzas de venta; por eso la relación es de varios a varios y cada par aparece una sola vez.</p>"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "venta",
                "nombre": "Venta",
                "tipo": "contenido",
                "titulo": "Venta",
                "intro": "Representa gráficamente cómo se lleva a cabo la venta de los tickets en tu sistema. El ticket ya fue fabricado: la venta lo asigna a un cliente.",
                "bloques": [
                    {
                        "t": "texto",
                        "id": "ven-lectura",
                        "v": "v-enfasis vc1",
                        "html": "<h2>Cómo se lee el diagrama de venta</h2><p>En el centro está el <b>evento de venta</b>. A su alrededor, las <b>cuentas</b> que interactúan con él; cada cuenta acumula un total y se apoya en su propio <b>catálogo</b>, unido con una relación <b>C-P</b>.</p><p>El evento de venta <b>modifica el comportamiento del cliente</b> y <b>modifica la existencia de tickets</b>. Debajo de cada diagrama, una tabla pequeña muestra cómo queda registrada la venta de un ticket. El <b>cliente</b> es quien contrata tu servicio; en cobranzas se llama <b>sponsor</b>, y el moroso es un tercero.</p><p class=\"leyenda\"><span class=\"lg ev\"></span> evento <span class=\"lg cu\"></span> cuenta <span class=\"lg ca\"></span> catálogo <span class=\"lg re\"></span> relación</p>"
                    },
                    {
                        "t": "pestanas",
                        "id": "ven-tabs",
                        "titulo": "Diagramas de ejemplo",
                        "items": [
                            {
                                "id": "ven-alm",
                                "titulo": "Almacenamiento",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Almacenamiento</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:682px\" viewBox=\"0 0 1100 450\" role=\"img\" aria-label=\"Diagrama de venta del sistema de almacenamiento\"><defs><marker id=\"mkalm\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ev\" x=\"520\" y=\"195\" width=\"140\" height=\"60\" rx=\"6\"/><text x=\"590.0\" y=\"229.5\">evento_venta</text><rect class=\"cu\" x=\"110\" y=\"195\" width=\"210\" height=\"60\" rx=\"6\"/><text x=\"215.0\" y=\"222.0\">cliente_cuenta</text><text class=\"sm\" x=\"215.0\" y=\"238.0\">total_compras</text><ellipse class=\"re\" cx=\"435\" cy=\"225.0\" rx=\"54\" ry=\"20\"/><text class=\"sm\" x=\"435\" y=\"229.0\">adquiere</text><path class=\"ln\" d=\"M520 225.0 L489 225.0\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M320 225.0 L381 225.0\" marker-end=\"url(#mkalm)\"/><rect class=\"ca\" x=\"130.0\" y=\"84\" width=\"170\" height=\"44\" rx=\"6\"/><text x=\"215.0\" y=\"103.0\">tipo_cliente</text><text class=\"sm\" x=\"215.0\" y=\"119.0\">catálogo</text><ellipse class=\"re\" cx=\"215.0\" cy=\"162\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"215.0\" y=\"166\">C-P</text><path class=\"ln\" d=\"M215.0 128 L215.0 148\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M215.0 195 L215.0 176\" marker-end=\"url(#mkalm)\"/><rect class=\"cu\" x=\"870\" y=\"195\" width=\"210\" height=\"60\" rx=\"6\"/><text x=\"975.0\" y=\"222.0\">existencia_ticket_cuenta</text><text class=\"sm\" x=\"975.0\" y=\"238.0\">total_transacciones_cobradas</text><ellipse class=\"re\" cx=\"745\" cy=\"225.0\" rx=\"54\" ry=\"20\"/><text class=\"sm\" x=\"745\" y=\"229.0\">adquiere</text><path class=\"ln\" d=\"M660 225.0 L691 225.0\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M870 225.0 L799 225.0\" marker-end=\"url(#mkalm)\"/><rect class=\"ca\" x=\"890.0\" y=\"84\" width=\"170\" height=\"44\" rx=\"6\"/><text x=\"975.0\" y=\"103.0\">tipo_producto</text><text class=\"sm\" x=\"975.0\" y=\"119.0\">catálogo</text><ellipse class=\"re\" cx=\"975.0\" cy=\"162\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"975.0\" y=\"166\">C-P</text><path class=\"ln\" d=\"M975.0 128 L975.0 148\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M975.0 195 L975.0 176\" marker-end=\"url(#mkalm)\"/><rect class=\"cu\" x=\"520\" y=\"18\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"590.0\" y=\"43.0\">caja_cuenta</text><text class=\"sm\" x=\"590.0\" y=\"59.0\">total_por_cobrar</text><ellipse class=\"re\" cx=\"590.0\" cy=\"138\" rx=\"58\" ry=\"20\"/><text class=\"sm\" x=\"590.0\" y=\"142\">genera deuda</text><path class=\"ln\" d=\"M590.0 74 L590.0 118\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M590.0 195 L590.0 158\" marker-end=\"url(#mkalm)\"/><rect class=\"ca\" x=\"740\" y=\"24\" width=\"160\" height=\"44\" rx=\"6\"/><text x=\"820.0\" y=\"43.0\">tipo_caja</text><text class=\"sm\" x=\"820.0\" y=\"59.0\">catálogo</text><ellipse class=\"re\" cx=\"690\" cy=\"46\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"690\" y=\"50\">C-P</text><path class=\"ln\" d=\"M660 46 L666 46\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M740 46 L714 46\" marker-end=\"url(#mkalm)\"/><rect class=\"cu\" x=\"520\" y=\"376\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"590.0\" y=\"401.0\">operador_cuenta</text><text class=\"sm\" x=\"590.0\" y=\"417.0\">total_ventas</text><ellipse class=\"re\" cx=\"590.0\" cy=\"312\" rx=\"48\" ry=\"20\"/><text class=\"sm\" x=\"590.0\" y=\"316\">canal</text><path class=\"ln\" d=\"M590.0 255 L590.0 292\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M590.0 376 L590.0 332\" marker-end=\"url(#mkalm)\"/><rect class=\"ca\" x=\"740\" y=\"382\" width=\"160\" height=\"44\" rx=\"6\"/><text x=\"820.0\" y=\"401.0\">tipo_operador</text><text class=\"sm\" x=\"820.0\" y=\"417.0\">catálogo</text><ellipse class=\"re\" cx=\"690\" cy=\"404\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"690\" y=\"408\">C-P</text><path class=\"ln\" d=\"M660 404 L666 404\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M740 404 L714 404\" marker-end=\"url(#mkalm)\"/><rect class=\"cu\" x=\"110\" y=\"322\" width=\"210\" height=\"44\" rx=\"6\"/><text x=\"215.0\" y=\"348.5\">persona</text><ellipse class=\"re\" cx=\"215\" cy=\"288\" rx=\"42\" ry=\"14\"/><text class=\"sm\" x=\"215\" y=\"292\">encarna</text><path class=\"ln\" d=\"M215 255 L215 274\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M215 322 L215 302\" marker-end=\"url(#mkalm)\"/><ellipse class=\"re\" cx=\"395\" cy=\"404\" rx=\"42\" ry=\"14\"/><text class=\"sm\" x=\"395\" y=\"408\">encarna</text><path class=\"ln\" d=\"M215 366 L215 404 L353 404\" marker-end=\"url(#mkalm)\"/><path class=\"ln\" d=\"M520 404 L437 404\" marker-end=\"url(#mkalm)\"/><rect class=\"cu\" x=\"330\" y=\"290\" width=\"130\" height=\"44\" rx=\"6\"/><text x=\"395.0\" y=\"316.5\">planta_cuenta</text><path class=\"ln\" d=\"M460 312 L542 312\" marker-end=\"url(#mkalm)\"/><text class=\"nt\" x=\"435\" y=\"172\">modifica el comportamiento</text><text class=\"nt\" x=\"435\" y=\"187\">del cliente</text><text class=\"nt\" x=\"745\" y=\"172\">modifica la existencia</text><text class=\"nt\" x=\"745\" y=\"187\">de tickets</text></svg></div><h3 class=\"sub-t\">Cómo queda registrada la venta de un ticket</h3><p>Una fila por ticket vendido: el ticket, la fecha y el código de cada cuenta que interviene en tu diagrama.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_ticket</th><th scope=\"col\">fecha</th><th scope=\"col\">cod_cliente</th><th scope=\"col\">tipo_producto</th><th scope=\"col\">tipo_caja</th><th scope=\"col\">tipo_operador</th></tr></thead><tbody><tr><td>ALM-0001</td><td>24/07/2025</td><td>CLI-014</td><td>CONT-0001</td><td>CAJ-01</td><td>OPE-02</td></tr></tbody></table></div><p class=\"muted\">Valores de ejemplo: cambian según tu sistema.</p>"
                            },
                            {
                                "id": "ven-pub",
                                "titulo": "Publicidad",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Publicidad</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:682px\" viewBox=\"0 0 1100 450\" role=\"img\" aria-label=\"Diagrama de venta del sistema de publicidad\"><defs><marker id=\"mkpub\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ev\" x=\"520\" y=\"195\" width=\"140\" height=\"60\" rx=\"6\"/><text x=\"590.0\" y=\"229.5\">evento_venta</text><rect class=\"cu\" x=\"250\" y=\"195\" width=\"128\" height=\"60\" rx=\"6\"/><text x=\"314.0\" y=\"229.5\">cliente_cuenta</text><ellipse class=\"re\" cx=\"435\" cy=\"225.0\" rx=\"40\" ry=\"20\"/><text class=\"sm\" x=\"435\" y=\"229.0\">adquiere</text><path class=\"ln\" d=\"M520 225.0 L475 225.0\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M378 225.0 L395 225.0\" marker-end=\"url(#mkpub)\"/><rect class=\"cu\" x=\"870\" y=\"195\" width=\"210\" height=\"60\" rx=\"6\"/><text x=\"975.0\" y=\"222.0\">existencia_ticket_cuenta</text><text class=\"sm\" x=\"975.0\" y=\"238.0\">tickets de vehículos</text><ellipse class=\"re\" cx=\"750\" cy=\"225.0\" rx=\"62\" ry=\"20\"/><text class=\"sm\" x=\"750\" y=\"229.0\">detalla cantidad</text><path class=\"ln\" d=\"M660 225.0 L688 225.0\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M870 225.0 L812 225.0\" marker-end=\"url(#mkpub)\"/><rect class=\"ca\" x=\"890.0\" y=\"84\" width=\"170\" height=\"44\" rx=\"6\"/><text x=\"975.0\" y=\"103.0\">tipo_vehiculo</text><text class=\"sm\" x=\"975.0\" y=\"119.0\">catálogo</text><ellipse class=\"re\" cx=\"975.0\" cy=\"162\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"975.0\" y=\"166\">C-P</text><path class=\"ln\" d=\"M975.0 128 L975.0 148\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M975.0 195 L975.0 176\" marker-end=\"url(#mkpub)\"/><rect class=\"cu\" x=\"520\" y=\"18\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"590.0\" y=\"43.0\">caja_cuenta</text><text class=\"sm\" x=\"590.0\" y=\"59.0\">tickets por asignar</text><ellipse class=\"re\" cx=\"590.0\" cy=\"138\" rx=\"58\" ry=\"20\"/><text class=\"sm\" x=\"590.0\" y=\"142\">genera deuda</text><path class=\"ln\" d=\"M590.0 74 L590.0 118\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M590.0 195 L590.0 158\" marker-end=\"url(#mkpub)\"/><rect class=\"ca\" x=\"740\" y=\"24\" width=\"160\" height=\"44\" rx=\"6\"/><text x=\"820.0\" y=\"43.0\">tipo_caja</text><text class=\"sm\" x=\"820.0\" y=\"59.0\">catálogo</text><ellipse class=\"re\" cx=\"690\" cy=\"46\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"690\" y=\"50\">C-P</text><path class=\"ln\" d=\"M660 46 L666 46\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M740 46 L714 46\" marker-end=\"url(#mkpub)\"/><rect class=\"cu\" x=\"520\" y=\"376\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"590.0\" y=\"408.5\">canal_cuenta</text><ellipse class=\"re\" cx=\"590.0\" cy=\"312\" rx=\"48\" ry=\"20\"/><text class=\"sm\" x=\"590.0\" y=\"316\">vía</text><path class=\"ln\" d=\"M590.0 255 L590.0 292\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M590.0 376 L590.0 332\" marker-end=\"url(#mkpub)\"/><rect class=\"ca\" x=\"740\" y=\"382\" width=\"160\" height=\"44\" rx=\"6\"/><text x=\"820.0\" y=\"401.0\">tipo_canal</text><text class=\"sm\" x=\"820.0\" y=\"417.0\">catálogo</text><ellipse class=\"re\" cx=\"690\" cy=\"404\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"690\" y=\"408\">C-P</text><path class=\"ln\" d=\"M660 404 L666 404\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M740 404 L714 404\" marker-end=\"url(#mkpub)\"/><rect class=\"cu\" x=\"14\" y=\"195\" width=\"130\" height=\"60\" rx=\"6\"/><text x=\"79.0\" y=\"229.5\">producto_cuenta</text><ellipse class=\"re\" cx=\"197\" cy=\"225\" rx=\"22\" ry=\"14\"/><text class=\"sm\" x=\"197\" y=\"229\">R</text><path class=\"ln\" d=\"M144 225 L175 225\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M250 225 L219 225\" marker-end=\"url(#mkpub)\"/><rect class=\"ca\" x=\"40\" y=\"84\" width=\"130\" height=\"44\" rx=\"6\"/><text x=\"105.0\" y=\"103.0\">tipo_producto</text><text class=\"sm\" x=\"105.0\" y=\"119.0\">catálogo</text><ellipse class=\"re\" cx=\"79\" cy=\"162\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"79\" y=\"166\">C-P</text><path class=\"ln\" d=\"M79 128 L79 148\" marker-end=\"url(#mkpub)\"/><path class=\"ln\" d=\"M79 195 L79 176\" marker-end=\"url(#mkpub)\"/><text class=\"nt\" x=\"435\" y=\"172\">modifica el comportamiento</text><text class=\"nt\" x=\"435\" y=\"187\">del cliente</text><text class=\"nt\" x=\"750\" y=\"172\">modifica la existencia</text><text class=\"nt\" x=\"750\" y=\"187\">de tickets</text></svg></div><h3 class=\"sub-t\">Cómo queda registrada la venta de un ticket</h3><p>Una fila por ticket vendido: el ticket, la fecha y el código de cada cuenta que interviene en tu diagrama.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_ticket</th><th scope=\"col\">fecha</th><th scope=\"col\">cod_cliente</th><th scope=\"col\">tipo_producto</th><th scope=\"col\">tipo_vehiculo</th><th scope=\"col\">tipo_canal</th><th scope=\"col\">tipo_caja</th></tr></thead><tbody><tr><td>PUB-0001</td><td>24/07/2025</td><td>CLI-021</td><td>PRD-005</td><td>VEH-02</td><td>CAN-03</td><td>CAJ-01</td></tr></tbody></table></div><p class=\"muted\">Valores de ejemplo: cambian según tu sistema.</p>"
                            },
                            {
                                "id": "ven-tra",
                                "titulo": "Transporte",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Transporte</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:682px\" viewBox=\"0 0 1100 450\" role=\"img\" aria-label=\"Diagrama de venta del sistema de transporte\"><defs><marker id=\"mktra\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ev\" x=\"520\" y=\"195\" width=\"140\" height=\"60\" rx=\"6\"/><text x=\"590.0\" y=\"229.5\">evento_venta</text><rect class=\"cu\" x=\"110\" y=\"195\" width=\"210\" height=\"60\" rx=\"6\"/><text x=\"215.0\" y=\"222.0\">cliente_cuenta</text><text class=\"sm\" x=\"215.0\" y=\"238.0\">total_compras</text><ellipse class=\"re\" cx=\"435\" cy=\"225.0\" rx=\"54\" ry=\"20\"/><text class=\"sm\" x=\"435\" y=\"229.0\">adquiere</text><path class=\"ln\" d=\"M520 225.0 L489 225.0\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M320 225.0 L381 225.0\" marker-end=\"url(#mktra)\"/><rect class=\"ca\" x=\"130.0\" y=\"84\" width=\"170\" height=\"44\" rx=\"6\"/><text x=\"215.0\" y=\"103.0\">tipo_cliente</text><text class=\"sm\" x=\"215.0\" y=\"119.0\">catálogo</text><ellipse class=\"re\" cx=\"215.0\" cy=\"162\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"215.0\" y=\"166\">C-P</text><path class=\"ln\" d=\"M215.0 128 L215.0 148\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M215.0 195 L215.0 176\" marker-end=\"url(#mktra)\"/><rect class=\"cu\" x=\"870\" y=\"195\" width=\"210\" height=\"60\" rx=\"6\"/><text x=\"975.0\" y=\"222.0\">existencia_ticket_cuenta</text><text class=\"sm\" x=\"975.0\" y=\"238.0\">total_reservas</text><ellipse class=\"re\" cx=\"750\" cy=\"225.0\" rx=\"62\" ry=\"20\"/><text class=\"sm\" x=\"750\" y=\"229.0\">detalla cantidad</text><path class=\"ln\" d=\"M660 225.0 L688 225.0\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M870 225.0 L812 225.0\" marker-end=\"url(#mktra)\"/><rect class=\"ca\" x=\"890.0\" y=\"84\" width=\"170\" height=\"44\" rx=\"6\"/><text x=\"975.0\" y=\"103.0\">tipo_unidad_transporte</text><text class=\"sm\" x=\"975.0\" y=\"119.0\">catálogo</text><ellipse class=\"re\" cx=\"975.0\" cy=\"162\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"975.0\" y=\"166\">C-P</text><path class=\"ln\" d=\"M975.0 128 L975.0 148\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M975.0 195 L975.0 176\" marker-end=\"url(#mktra)\"/><rect class=\"cu\" x=\"520\" y=\"18\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"590.0\" y=\"43.0\">caja_cuenta</text><text class=\"sm\" x=\"590.0\" y=\"59.0\">total_por_cobrar</text><ellipse class=\"re\" cx=\"590.0\" cy=\"138\" rx=\"54\" ry=\"20\"/><text class=\"sm\" x=\"590.0\" y=\"142\">detalle pago</text><path class=\"ln\" d=\"M590.0 74 L590.0 118\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M590.0 195 L590.0 158\" marker-end=\"url(#mktra)\"/><rect class=\"ca\" x=\"740\" y=\"24\" width=\"160\" height=\"44\" rx=\"6\"/><text x=\"820.0\" y=\"43.0\">tipo_caja</text><text class=\"sm\" x=\"820.0\" y=\"59.0\">catálogo</text><ellipse class=\"re\" cx=\"690\" cy=\"46\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"690\" y=\"50\">C-P</text><path class=\"ln\" d=\"M660 46 L666 46\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M740 46 L714 46\" marker-end=\"url(#mktra)\"/><rect class=\"cu\" x=\"520\" y=\"376\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"590.0\" y=\"401.0\">canal_cuenta</text><text class=\"sm\" x=\"590.0\" y=\"417.0\">total_atenciones</text><ellipse class=\"re\" cx=\"590.0\" cy=\"312\" rx=\"48\" ry=\"20\"/><text class=\"sm\" x=\"590.0\" y=\"316\">vía</text><path class=\"ln\" d=\"M590.0 255 L590.0 292\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M590.0 376 L590.0 332\" marker-end=\"url(#mktra)\"/><rect class=\"ca\" x=\"740\" y=\"382\" width=\"160\" height=\"44\" rx=\"6\"/><text x=\"820.0\" y=\"401.0\">tipo_canal</text><text class=\"sm\" x=\"820.0\" y=\"417.0\">catálogo</text><ellipse class=\"re\" cx=\"690\" cy=\"404\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"690\" y=\"408\">C-P</text><path class=\"ln\" d=\"M660 404 L666 404\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M740 404 L714 404\" marker-end=\"url(#mktra)\"/><rect class=\"ca\" x=\"770\" y=\"290\" width=\"190\" height=\"44\" rx=\"6\"/><text x=\"865.0\" y=\"309.0\">tipo_transaccion</text><text class=\"sm\" x=\"865.0\" y=\"325.0\">catálogo</text><ellipse class=\"re\" cx=\"716\" cy=\"312\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"716\" y=\"316\">C-P</text><path class=\"ln\" d=\"M640 255 L700 300\" marker-end=\"url(#mktra)\"/><path class=\"ln\" d=\"M770 312 L740 312\" marker-end=\"url(#mktra)\"/><text class=\"nt\" x=\"435\" y=\"172\">modifica el comportamiento</text><text class=\"nt\" x=\"435\" y=\"187\">del cliente</text><text class=\"nt\" x=\"750\" y=\"172\">modifica la existencia</text><text class=\"nt\" x=\"750\" y=\"187\">de tickets</text></svg></div><h3 class=\"sub-t\">Cómo queda registrada la venta de un ticket</h3><p>Una fila por ticket vendido: el ticket, la fecha y el código de cada cuenta que interviene en tu diagrama.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_ticket</th><th scope=\"col\">fecha</th><th scope=\"col\">cod_cliente</th><th scope=\"col\">tipo_unidad_transporte</th><th scope=\"col\">tipo_canal</th><th scope=\"col\">tipo_caja</th><th scope=\"col\">tipo_transaccion</th></tr></thead><tbody><tr><td>TRN-0001</td><td>24/07/2025</td><td>CLI-008</td><td>UNI-02</td><td>CAN-01</td><td>CAJ-01</td><td>TRX-01</td></tr></tbody></table></div><p class=\"muted\">Valores de ejemplo: cambian según tu sistema.</p>"
                            },
                            {
                                "id": "ven-cob",
                                "titulo": "Cobranzas",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:644px\" viewBox=\"0 0 1040 510\" role=\"img\" aria-label=\"Diagrama de venta de cobranzas: evento venta de lote de tickets\"><defs><marker id=\"mkvco\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ev\" x=\"545\" y=\"230\" width=\"140\" height=\"60\" rx=\"6\"/><text x=\"615.0\" y=\"257.0\">evento_venta</text><text class=\"sm\" x=\"615.0\" y=\"273.0\">lote_ticket</text><rect class=\"cu\" x=\"10\" y=\"232\" width=\"120\" height=\"56\" rx=\"6\"/><text x=\"70.0\" y=\"257.0\">moroso</text><text class=\"sm\" x=\"70.0\" y=\"273.0\">cuenta</text><ellipse class=\"re\" cx=\"200\" cy=\"260\" rx=\"50\" ry=\"20\"/><text class=\"sm\" x=\"200\" y=\"264\">enmarca</text><rect class=\"cu\" x=\"270\" y=\"232\" width=\"130\" height=\"56\" rx=\"6\"/><text x=\"335.0\" y=\"257.0\">sponsor</text><text class=\"sm\" x=\"335.0\" y=\"273.0\">cuenta</text><ellipse class=\"re\" cx=\"470\" cy=\"260\" rx=\"52\" ry=\"20\"/><text class=\"sm\" x=\"470\" y=\"264\">adquiere</text><path class=\"ln\" d=\"M130 260 L150 260\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M270 260 L250 260\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M400 260 L418 260\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M545 260 L522 260\" marker-end=\"url(#mkvco)\"/><ellipse class=\"re\" cx=\"70\" cy=\"350\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"70\" y=\"354\">C-P</text><rect class=\"ca\" x=\"5\" y=\"420\" width=\"130\" height=\"50\" rx=\"6\"/><text x=\"70.0\" y=\"442.0\">tipo_moroso</text><text class=\"sm\" x=\"70.0\" y=\"458.0\">catálogo</text><path class=\"ln\" d=\"M70 288 L70 336\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M70 420 L70 364\" marker-end=\"url(#mkvco)\"/><ellipse class=\"re\" cx=\"775\" cy=\"260\" rx=\"52\" ry=\"20\"/><text class=\"sm\" x=\"775\" y=\"264\">adquiere</text><rect class=\"cu\" x=\"850\" y=\"232\" width=\"150\" height=\"56\" rx=\"6\"/><text x=\"925.0\" y=\"257.0\">existencia_tickets</text><text class=\"sm\" x=\"925.0\" y=\"273.0\">total_tickets</text><path class=\"ln\" d=\"M685 260 L723 260\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M850 260 L827 260\" marker-end=\"url(#mkvco)\"/><ellipse class=\"re\" cx=\"925\" cy=\"140\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"925\" y=\"144\">C-P</text><rect class=\"ca\" x=\"840\" y=\"30\" width=\"170\" height=\"50\" rx=\"6\"/><text x=\"925.0\" y=\"52.0\">estrategia_cobranza</text><text class=\"sm\" x=\"925.0\" y=\"68.0\">catálogo</text><path class=\"ln\" d=\"M925 80 L925 126\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M925 232 L925 154\" marker-end=\"url(#mkvco)\"/><ellipse class=\"re\" cx=\"615\" cy=\"140\" rx=\"56\" ry=\"22\"/><text class=\"sm\" x=\"615\" y=\"144\">detalle_pago</text><path class=\"ln\" d=\"M615 230 L615 162\" marker-end=\"url(#mkvco)\"/><rect class=\"cu\" x=\"545\" y=\"34\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"615.0\" y=\"59.0\">caja</text><text class=\"sm\" x=\"615.0\" y=\"75.0\">tot_catxpag</text><path class=\"ln\" d=\"M615 90 L615 118\" marker-end=\"url(#mkvco)\"/><rect class=\"cu\" x=\"375\" y=\"112\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"445.0\" y=\"137.0\">instrumento_pago</text><text class=\"sm\" x=\"445.0\" y=\"153.0\">cuenta</text><path class=\"ln\" d=\"M515 140 L559 140\" marker-end=\"url(#mkvco)\"/><ellipse class=\"re\" cx=\"445\" cy=\"70\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"445\" y=\"74\">C-P</text><rect class=\"ca\" x=\"365\" y=\"4\" width=\"160\" height=\"40\" rx=\"6\"/><text x=\"445.0\" y=\"21.0\">instrumento_pago</text><text class=\"sm\" x=\"445.0\" y=\"37.0\">catálogo</text><path class=\"ln\" d=\"M445 44 L445 56\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M445 112 L445 84\" marker-end=\"url(#mkvco)\"/><ellipse class=\"re\" cx=\"615\" cy=\"380\" rx=\"40\" ry=\"20\"/><text class=\"sm\" x=\"615\" y=\"384\">via</text><path class=\"ln\" d=\"M615 290 L615 360\" marker-end=\"url(#mkvco)\"/><rect class=\"cu\" x=\"545\" y=\"430\" width=\"140\" height=\"56\" rx=\"6\"/><text x=\"615.0\" y=\"455.0\">canal_atencion</text><text class=\"sm\" x=\"615.0\" y=\"471.0\">cuenta</text><path class=\"ln\" d=\"M615 430 L615 400\" marker-end=\"url(#mkvco)\"/><ellipse class=\"re\" cx=\"780\" cy=\"458\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"780\" y=\"462\">C-P</text><rect class=\"ca\" x=\"850\" y=\"433\" width=\"170\" height=\"50\" rx=\"6\"/><text x=\"935.0\" y=\"455.0\">canal_atencion</text><text class=\"sm\" x=\"935.0\" y=\"471.0\">catálogo</text><path class=\"ln\" d=\"M685 458 L756 458\" marker-end=\"url(#mkvco)\"/><path class=\"ln\" d=\"M850 458 L804 458\" marker-end=\"url(#mkvco)\"/></svg></div><h3 class=\"sub-t\">Cómo queda registrada la venta de un ticket</h3><p>En cobranzas el cliente es el <b>sponsor</b>; el moroso es el tercero al que se dirige el servicio. Esta tabla muestra cómo queda registrada la venta de un ticket.</p><div class=\"tabla-wrap\"><table><thead><tr><th scope=\"col\">cod_ticket</th><th scope=\"col\">fecha</th><th scope=\"col\">tipo_hora</th><th scope=\"col\">cod_sponsor</th><th scope=\"col\">cod_moroso</th><th scope=\"col\">estrategia_asignada</th><th scope=\"col\">canal</th><th scope=\"col\">tipo_operador</th></tr></thead><tbody><tr><td>TCKT-0001</td><td>24/07/2025</td><td>08:00 – 09:00</td><td>SNR-089</td><td>MRS-003</td><td>estr_02</td><td>WhatsApp</td><td>Operador Programado</td></tr></tbody></table></div>"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "entrega",
                "nombre": "Entrega",
                "tipo": "contenido",
                "titulo": "Entrega del servicio",
                "intro": "Detalla cómo se lleva a cabo la entrega de un producto, explicándola a través de protocolos, diagramas y nivel de eficiencia por producto.",
                "bloques": [
                    {
                        "t": "texto",
                        "id": "ent-diagrama",
                        "v": "v-enfasis vc1",
                        "html": "<h2>Diagrama del evento de entrega</h2><p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p>El evento <code>ejecutar_cobranza</code> <b>lee</b> el ticket, <b>define</b> la estrategia y <b>presiona</b> al moroso; la estrategia y el moroso se apoyan cada uno en su catálogo (<b>C&#8209;P</b>).</p><p class=\"leyenda\"><span class=\"lg ev\"></span> evento <span class=\"lg cu\"></span> cuenta <span class=\"lg ca\"></span> catálogo <span class=\"lg re\"></span> relación</p><div class=\"dgw\"><svg class=\"dg\" style=\"min-width:682px\" viewBox=\"0 0 1100 310\" role=\"img\" aria-label=\"Diagrama del evento de entrega ejecutar_cobranza\"><defs><marker id=\"mkeco\" viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto\"><path class=\"mk\" d=\"M0 0L10 5L0 10z\"/></marker></defs><rect class=\"ev\" x=\"480\" y=\"190\" width=\"230\" height=\"85\" rx=\"6\"/><text x=\"595.0\" y=\"208\">evento_ejecutar_cobranza</text><line class=\"sep\" x1=\"488\" y1=\"216\" x2=\"702\" y2=\"216\"/><text class=\"at\" x=\"595.0\" y=\"232\">fecha_inicio_cobranza</text><text class=\"at\" x=\"595.0\" y=\"247\">hora_inicio_cobranza</text><text class=\"at\" x=\"595.0\" y=\"262\">cod_estrategia_cobranza</text><rect class=\"cu\" x=\"60\" y=\"204\" width=\"190\" height=\"56\" rx=\"6\"/><text x=\"155.0\" y=\"229.0\">ticket</text><text class=\"sm\" x=\"155.0\" y=\"245.0\">cod_ticket</text><ellipse class=\"re\" cx=\"360\" cy=\"232\" rx=\"40\" ry=\"18\"/><text class=\"sm\" x=\"360\" y=\"236\">leer</text><path class=\"ln\" d=\"M250 232 L320 232\" marker-end=\"url(#mkeco)\"/><path class=\"ln\" d=\"M480 232 L400 232\" marker-end=\"url(#mkeco)\"/><rect class=\"cu\" x=\"870\" y=\"204\" width=\"190\" height=\"56\" rx=\"6\"/><text x=\"965.0\" y=\"229.0\">moroso</text><text class=\"sm\" x=\"965.0\" y=\"245.0\">cod_moroso</text><ellipse class=\"re\" cx=\"790\" cy=\"232\" rx=\"48\" ry=\"18\"/><text class=\"sm\" x=\"790\" y=\"236\">presiona</text><path class=\"ln\" d=\"M710 232 L742 232\" marker-end=\"url(#mkeco)\"/><path class=\"ln\" d=\"M870 232 L838 232\" marker-end=\"url(#mkeco)\"/><rect class=\"ca\" x=\"875\" y=\"30\" width=\"180\" height=\"50\" rx=\"6\"/><text x=\"965.0\" y=\"52.0\">tipo_moroso</text><text class=\"sm\" x=\"965.0\" y=\"68.0\">catalogo</text><ellipse class=\"re\" cx=\"965\" cy=\"140\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"965\" y=\"144\">C-P</text><path class=\"ln\" d=\"M965 80 L965 126\" marker-end=\"url(#mkeco)\"/><path class=\"ln\" d=\"M965 204 L965 154\" marker-end=\"url(#mkeco)\"/><rect class=\"cu\" x=\"500\" y=\"28\" width=\"190\" height=\"56\" rx=\"6\"/><text x=\"595.0\" y=\"53.0\">estrategia</text><text class=\"sm\" x=\"595.0\" y=\"69.0\">cod_estrategia</text><ellipse class=\"re\" cx=\"595\" cy=\"140\" rx=\"44\" ry=\"16\"/><text class=\"sm\" x=\"595\" y=\"144\">define</text><path class=\"ln\" d=\"M595 84 L595 124\" marker-end=\"url(#mkeco)\"/><path class=\"ln\" d=\"M595 190 L595 156\" marker-end=\"url(#mkeco)\"/><rect class=\"ca\" x=\"200\" y=\"31\" width=\"180\" height=\"50\" rx=\"6\"/><text x=\"290.0\" y=\"53.0\">tipo_estrategia</text><text class=\"sm\" x=\"290.0\" y=\"69.0\">catalogo</text><ellipse class=\"re\" cx=\"450\" cy=\"56\" rx=\"24\" ry=\"14\"/><text class=\"sm\" x=\"450\" y=\"60\">C-P</text><path class=\"ln\" d=\"M380 56 L426 56\" marker-end=\"url(#mkeco)\"/><path class=\"ln\" d=\"M500 56 L474 56\" marker-end=\"url(#mkeco)\"/></svg></div>"
                    },
                    {
                        "t": "pestanas",
                        "id": "ent-tabs",
                        "titulo": "Caso aplicado: cobranzas",
                        "v": "bv-neutro",
                        "items": [
                            {
                                "id": "ent-secuencia",
                                "titulo": "1 · Secuencia del protocolo",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p>La transacción <code>ejecutar_cobranza</code> entrega el servicio al sponsor. Esta es su secuencia.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">secuencia</th><th scope=\"col\">paso del protocolo</th><th scope=\"col\">método</th></tr></thead><tbody><tr><td>1</td><td>Validación de asociación entre moroso y deuda</td><td><code>validar_moroso_deuda</code></td></tr><tr><td>2</td><td>Asignación dinámica de estrategia según perfil</td><td><code>asignar_estrategia_cobranza</code></td></tr><tr><td>3</td><td>Inicio formal del proceso de cobranza</td><td><code>actualizar_estado_cobranza</code>, <code>enviar_mensaje_automatizado</code></td></tr><tr><td>4</td><td>Registro de respuestas del moroso</td><td><code>obtener_respuesta_moroso</code>, <code>registrar_respuesta_moroso</code></td></tr><tr><td>5</td><td>Renovación o ajuste de estrategia si corresponde</td><td><code>renovar_estrategia</code></td></tr></tbody></table></div><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">atributo</th><th scope=\"col\">detalle</th></tr></thead><tbody><tr><td>Responsable del evento</td><td>Sistema técnico y motor de asignación de estrategia</td></tr><tr><td>Condición de activación</td><td>Deuda validada y moroso clasificado</td></tr><tr><td>Impacto</td><td>Inicio del hostigamiento automatizado con estrategia personalizada, que habilita la medición de respuesta y la escalabilidad posterior</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "ent-evento",
                                "titulo": "2 · Evento de ejemplo",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p>Un evento de ejemplo es la evidencia de una transacción ya concluida.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">atributo</th><th scope=\"col\">valor_ejemplificado</th></tr></thead><tbody><tr><td>codigo_evento</td><td>EVT-CBCOB-005</td></tr><tr><td>fecha_hora</td><td>25/07/2025 10:50:00</td></tr><tr><td>transaccion</td><td><code>ejecutar_cobranza</code></td></tr><tr><td>operaciones_ejecutadas</td><td>definir_estrategia_cobranza, iniciar_proceso_cobranza, renovar_estrategia</td></tr><tr><td>metodos_aplicados</td><td>validar_moroso_deuda, asignar_estrategia_cobranza, actualizar_estado_cobranza, enviar_mensaje_automatizado, obtener_respuesta_moroso, registrar_respuesta_moroso, renovar_estrategia</td></tr><tr><td>entidades_afectadas</td><td>cuenta_moroso, cuenta_deuda, ticket, estrategia, canal, operador</td></tr><tr><td>resultado_operativo</td><td>Estrategia asignada, mensajes enviados, respuesta registrada, estrategia renovada (si aplica)</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "ent-metodos",
                                "titulo": "3 · Detalle de métodos",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">metodo_tecnico</th><th scope=\"col\">descripcion</th><th scope=\"col\">resultado_esperado</th></tr></thead><tbody><tr><td><code>validar_moroso_deuda</code></td><td>Verifica que moroso y deuda estén correctamente registrados y asociados</td><td>Relación válida para ejecución</td></tr><tr><td><code>asignar_estrategia_cobranza</code></td><td>Selecciona la estrategia según la clasificación del moroso y el tipo de deuda</td><td>Código de estrategia asignada</td></tr><tr><td><code>actualizar_estado_cobranza</code></td><td>Marca el inicio del proceso operativo</td><td>Estado = «en curso»</td></tr><tr><td><code>enviar_mensaje_automatizado</code></td><td>Ejecuta el envío de mensajes por el canal designado</td><td>Plantilla enviada según frecuencia</td></tr><tr><td><code>obtener_respuesta_moroso</code></td><td>Captura la respuesta del moroso, con tipo, canal y fecha</td><td>Registro de interacción</td></tr><tr><td><code>registrar_respuesta_moroso</code></td><td>Guarda los datos de respuesta en el sistema para trazabilidad</td><td>Datos consolidados por estrategia</td></tr><tr><td><code>renovar_estrategia</code></td><td>Reinicia o actualiza la estrategia si la respuesta lo permite</td><td>Estrategia reactivada o escalada</td></tr></tbody></table></div>"
                            },
                            {
                                "id": "ent-eficiencia",
                                "titulo": "4 · Eficiencia por producto",
                                "html": "<p class=\"ej\"><span class=\"v-etq vc2\">Ejemplo · Cobranzas</span></p><p>El nivel de eficiencia por producto compara, para cada producto contratado por un sponsor, lo que se prometió con lo que se obtuvo.</p><div class=\"tabla-wrap \"><table><thead><tr><th scope=\"col\">cod_sponsor</th><th scope=\"col\">producto_contratado</th><th scope=\"col\">morosos_gestionados</th><th scope=\"col\">recuperados</th><th scope=\"col\">porcentaje_prometido</th><th scope=\"col\">porcentaje_obtenido</th></tr></thead><tbody><tr><td>spns_065</td><td>cobranza_leve · SMS</td><td>1,000</td><td>830</td><td>80%</td><td>83%</td></tr><tr><td>spns_065</td><td>cobranza_leve · WhatsApp</td><td>500</td><td>280</td><td>60%</td><td>56%</td></tr><tr><td>spns_065</td><td>cobranza_intermedia · llamada</td><td>200</td><td>80</td><td>40%</td><td>40%</td></tr><tr><td>spns_065</td><td>cobranza_prejudicial · correo</td><td>150</td><td>60</td><td>40%</td><td>40%</td></tr><tr><td>spns_065</td><td>cobranza_judicial · carta notarial</td><td>100</td><td>25</td><td>30%</td><td>25%</td></tr></tbody></table></div><p class=\"muted\">El porcentaje obtenido sale de recuperados ÷ morosos gestionados (830 ÷ 1,000 = 83%).</p>"
                            }
                        ]
                    },
                    {
                        "t": "aviso",
                        "id": "ent-tip",
                        "tipo": "tip",
                        "titulo": "Consejo",
                        "html": "<p>Elige la transacción principal de tu sistema y repite este esquema: secuencia, evento de ejemplo con sus operaciones y métodos, y eficiencia por producto.</p>"
                    }
                ]
            },
            {
                "id": "excel",
                "nombre": "Mapa del Excel",
                "tipo": "contenido",
                "titulo": "Mapa del Excel",
                "intro": "Una propuesta de qué hoja lleva cada tabla y en qué orden. Es una forma de ordenar tu archivo, no un criterio del profesor.",
                "bloques": [
                    {
                        "t": "pestanas",
                        "id": "exc-mapa",
                        "titulo": "Las 10 hojas",
                        "items": [
                            {
                                "id": "exc-h1",
                                "titulo": "1 · Definición",
                                "html": "<p>Semántica técnica y comercial del sistema, y su misión en dos líneas como máximo.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Semántica</li><li>Misión</li></ul><p class=\"muted\">Se explica en: Definición.</p>"
                            },
                            {
                                "id": "exc-h2",
                                "titulo": "2 · Naturaleza",
                                "html": "<p>El esquema de los componentes que forman el producto, con sus atributos y relaciones.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Esquema de naturaleza (con su gráfico, también en ventas)</li></ul><p class=\"muted\">Se explica en: Definición · Naturaleza.</p>"
                            },
                            {
                                "id": "exc-h3",
                                "titulo": "3 · Catálogos",
                                "html": "<p>El catálogo de productos con todas las combinaciones que ofrece tu servicio, y las tipologías de cada componente.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Catálogo de productos</li><li>Tipologías</li></ul><p class=\"muted\">Se explica en: Definición · Tipologías.</p>"
                            },
                            {
                                "id": "exc-h4",
                                "titulo": "4 · Componentes",
                                "html": "<p>Los elementos que permiten que se lleven a cabo las operaciones del sistema.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Componente</li><li>Tipo</li><li>Descripción funcional</li></ul><p class=\"muted\">Se explica en: Definición · Componentes.</p>"
                            },
                            {
                                "id": "exc-h5",
                                "titulo": "5 · Protocolo",
                                "html": "<p>Cómo se llevan a cabo las operaciones: transacción, operación de negocio, secuencia y método.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Transacciones</li><li>Operaciones y métodos</li></ul><p class=\"muted\">Se explica en: Definición · Protocolo.</p>"
                            },
                            {
                                "id": "exc-h6",
                                "titulo": "6 · Fabricación",
                                "html": "<p>Antes de poder hacer algo, tienes lo necesario: recursos programados, disponibilidad y generación de tickets.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Recursos programados</li><li>Disponibilidad</li><li>Generación de tickets</li></ul><p class=\"muted\">Se explica en: Fabricación.</p>"
                            },
                            {
                                "id": "exc-h7",
                                "titulo": "7 · Reglas",
                                "html": "<p>Mínimo 3, bien hechas. Cada una con sus cuatro catálogos y su enunciado.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Catálogo de condiciones</li><li>Relación condición-variable</li><li>Catálogo de variables</li><li>Catálogo de acciones</li></ul><p class=\"muted\">Se explica en: Reglas.</p>"
                            },
                            {
                                "id": "exc-h8",
                                "titulo": "8 · Políticas",
                                "html": "<p>Mínimo 3, bien hechas. Cada una como relación entre catálogos.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Política</li><li>Relación entre catálogos</li></ul><p class=\"muted\">Se explica en: Políticas.</p>"
                            },
                            {
                                "id": "exc-h9",
                                "titulo": "9 · Venta",
                                "html": "<p>Cómo defines la interacción de las cuentas en el evento de venta y cómo queda registrada la venta de un ticket.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Diagrama de venta</li><li>Tabla de registro de la venta de un ticket</li></ul><p class=\"muted\">Se explica en: Venta.</p>"
                            },
                            {
                                "id": "exc-h10",
                                "titulo": "10 · Entrega",
                                "html": "<p>Cómo se entrega el producto: el diagrama del evento de entrega, el protocolo y el nivel de eficiencia por producto.</p><p><b>Esta hoja lleva:</b></p><ul class=\"chips-l\"><li>Diagrama del evento de entrega</li><li>Secuencia del protocolo</li><li>Evento de ejemplo</li><li>Eficiencia por producto</li></ul><p class=\"muted\">Se explica en: Entrega.</p>"
                            }
                        ]
                    },
                    {
                        "t": "aviso",
                        "id": "exc-ppt",
                        "tipo": "tip",
                        "titulo": "Presentación y documento Word",
                        "html": "<p>Lo ideal es una PPT y un documento Word donde las tablas y los gráficos estén ordenados y con su descripción. Puedes seguir el mismo orden de las hojas: una diapositiva o una sección por pieza.</p>"
                    },
                    {
                        "t": "texto",
                        "id": "exc-checklist",
                        "v": "v-ficha vc5",
                        "html": "<span class=\"v-pestana\">Checklist</span><h2>Revisa antes de entregar</h2><p class=\"muted\">Marca para llevar tu cuenta; esta lista no guarda tus marcas al cerrar la página.</p><div class=\"chk-grid\"><div class=\"chk-g\"><h3>Definición</h3><label class=\"chk\"><input type=\"checkbox\"><span>La semántica tiene definición técnica y comercial, y la misión cabe en dos líneas</span></label><label class=\"chk\"><input type=\"checkbox\"><span>El esquema de naturaleza muestra todos los componentes del producto, cada uno una sola vez</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Los atributos del esquema coinciden con los de tus catálogos y tipologías</span></label><label class=\"chk\"><input type=\"checkbox\"><span>El catálogo de productos recoge las combinaciones que ofreces y cada tipología tiene su tabla</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Los componentes tienen tipo y descripción funcional</span></label><label class=\"chk\"><input type=\"checkbox\"><span>El protocolo muestra, por transacción, sus operaciones, su secuencia y sus métodos</span></label></div><div class=\"chk-g\"><h3>Fabricación</h3><label class=\"chk\"><input type=\"checkbox\"><span>Los recursos programados están separados por ticket o por tipo de servicio</span></label><label class=\"chk\"><input type=\"checkbox\"><span>La disponibilidad muestra fechas, horarios y estado, sin filas repetidas</span></label><label class=\"chk\"><input type=\"checkbox\"><span>La generación de tickets tiene su gráfico y su tabla, con fecha reservada y recursos específicos</span></label></div><div class=\"chk-g\"><h3>Reglas y políticas</h3><label class=\"chk\"><input type=\"checkbox\"><span>Hay mínimo 3 reglas, cada una con enunciado y sus cuatro catálogos</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Las condiciones dicen lo mismo que el enunciado</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Hay mínimo 3 políticas, cada una con su gráfico, su cardinalidad y su tabla, sin pares repetidos</span></label><label class=\"chk\"><input type=\"checkbox\"><span>No aparecen elementos de otro sistema</span></label></div><div class=\"chk-g\"><h3>Venta y Entrega</h3><label class=\"chk\"><input type=\"checkbox\"><span>El diagrama de venta tiene el evento, las cuentas y un catálogo por cuenta (C-P)</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Se ve qué modifica el comportamiento del cliente y la existencia de tickets</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Hay una tabla pequeña que muestra cómo queda registrada la venta de un ticket</span></label><label class=\"chk\"><input type=\"checkbox\"><span>La entrega abre con el diagrama del evento, con sus cuentas y catálogos</span></label><label class=\"chk\"><input type=\"checkbox\"><span>La entrega tiene secuencia, evento de ejemplo y eficiencia por producto</span></label></div><div class=\"chk-g\"><h3>Todo el trabajo</h3><label class=\"chk\"><input type=\"checkbox\"><span>Cada atributo se escribe igual en todas las hojas (minúsculas y guion bajo)</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Usas el vocabulario de tu sistema (en cobranzas: sponsor y moroso)</span></label><label class=\"chk\"><input type=\"checkbox\"><span>La ortografía y las tildes están revisadas</span></label><label class=\"chk\"><input type=\"checkbox\"><span>Si haces PPT y Word, cada tabla y cada gráfico lleva su título y su descripción</span></label></div></div>"
                    }
                ]
            },
            {
                "id": "defensa",
                "nombre": "Ponte a prueba",
                "tipo": "cierre"
            }
        ]
    };

    /* <<<<<<<<<< FIN ZONA 1 <<<<<<<<<< */

    /* >>>>>>>>>> ZONA 2 · DEFENSA GUIADA >>>>>>>>>> */
    const CIERRE = {
        "titulo": "Ponte a prueba",
        "intro": "Mide cómo vas. Si dudas, pide una pista; si te equivocas, verás dónde se explicó.",
        "nota": "Práctica sin nota: nadie ve tus respuestas.",
        "preguntas": [
            {
                "id": "q1",
                "titulo": "Semántica y misión",
                "desc": "Escribir bien la parte inicial de la Definición.",
                "tiempo": "4 min",
                "enunciado": "<p><b>Ejemplo · Compras.</b> Estás redactando la Definición de un sistema de compras. Tienes que decidir qué va en la semántica y cómo escribir la misión.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · La definición comercial",
                        "intro": "¿Qué debe explicar la definición comercial?",
                        "ops": [
                            {
                                "html": "Cómo el sistema genera ganancias o realiza negocios: su estrategia de ingresos y monetización.",
                                "ok": 1,
                                "explica": "La definición comercial explica el negocio. La técnica describe lo que el sistema hace de forma automatizada."
                            },
                            {
                                "html": "Lo que el sistema realiza de manera automatizada.",
                                "err": "Confunde comercial con técnica",
                                "msg": "Eso describe la definición técnica: la síntesis funcional de las operaciones.",
                                "ver": [
                                    "definicion",
                                    "def-semantica"
                                ]
                            },
                            {
                                "html": "La lista de tablas del modelo.",
                                "err": "Mezcla semántica con modelo",
                                "msg": "La semántica es una definición en texto; las tablas van en otras partes de la Definición.",
                                "ver": [
                                    "definicion",
                                    "def-piezas"
                                ]
                            }
                        ],
                        "pista": "Hay dos definiciones: una dice qué hace el sistema y la otra cómo hace negocio."
                    },
                    {
                        "titulo": "Decisión 2 · La misión",
                        "intro": "¿Qué extensión y contenido tiene la misión?",
                        "ops": [
                            {
                                "html": "Un párrafo con todas las operaciones del protocolo.",
                                "err": "Mezcla misión con protocolo",
                                "msg": "Las operaciones y métodos pertenecen al protocolo, no a la misión.",
                                "ver": [
                                    "definicion",
                                    "def-mision"
                                ]
                            },
                            {
                                "html": "Solo una fórmula, sin texto.",
                                "err": "La fórmula no reemplaza la misión",
                                "msg": "La fórmula acompaña a la misión escrita; no la sustituye.",
                                "ver": [
                                    "definicion",
                                    "def-mision-tabla"
                                ]
                            },
                            {
                                "html": "Como máximo dos líneas, con lo básico que hace el sistema.",
                                "ok": 1,
                                "explica": "La misión es breve: dice qué hace básicamente tu sistema."
                            }
                        ],
                        "pista": "Si no cabe en dos líneas, todavía es más que una misión."
                    },
                    {
                        "titulo": "Decisión 3 · La fórmula",
                        "intro": "¿Qué haces con la fórmula de la misión?",
                        "ops": [
                            {
                                "html": "La escribes sin definir las letras, porque se explica sola.",
                                "err": "Fórmula sin leyenda",
                                "msg": "Cada letra necesita su significado, como en las misiones de ejemplo.",
                                "ver": [
                                    "definicion",
                                    "def-mision-tabla"
                                ]
                            },
                            {
                                "html": "Es recomendable pero no obligatoria; si la incluyes, defines cada letra.",
                                "ok": 1,
                                "explica": "La fórmula se recomienda, no se exige. Cada letra debe quedar definida para que se entienda."
                            },
                            {
                                "html": "Es obligatoria: sin fórmula la misión está incompleta.",
                                "err": "Exige algo que no es obligatorio",
                                "msg": "Hay sistemas, como almacenamiento, que no tuvieron fórmula.",
                                "ver": [
                                    "definicion",
                                    "def-mision-tabla"
                                ]
                            }
                        ],
                        "pista": "Mira cómo las misiones de ejemplo explican cada letra."
                    }
                ],
                "solucion": "<p>La semántica tiene una definición <b>técnica</b> (lo que el sistema realiza de manera automatizada) y una <b>comercial</b> (cómo genera ganancias). La misión cabe en <b>dos líneas</b> y la fórmula es <b>opcional</b>, con cada letra definida.</p>",
                "llevate": "Técnico dice qué hace, comercial cómo hace negocio, y la misión va en dos líneas."
            },
            {
                "id": "q2",
                "titulo": "Naturaleza",
                "desc": "Dibujar el esquema de componentes del producto.",
                "tiempo": "4 min",
                "enunciado": "<p><b>Ejemplo · Almacenamiento.</b> Vas a dibujar el esquema de naturaleza del producto: un contenedor con su embalaje, ubicado en una zona.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · Qué muestra",
                        "intro": "¿Qué muestra el esquema de naturaleza?",
                        "ops": [
                            {
                                "html": "Las áreas y personas de la empresa.",
                                "err": "Mira la organización, no el producto",
                                "msg": "La naturaleza describe el producto, no la estructura de la empresa.",
                                "ver": [
                                    "definicion",
                                    "def-naturaleza"
                                ]
                            },
                            {
                                "html": "El conjunto de componentes que conforman el producto (bien o servicio) de tu sistema.",
                                "ok": 1,
                                "explica": "La naturaleza muestra de qué está hecho el producto: sus componentes y cómo se relacionan."
                            },
                            {
                                "html": "Los pasos con los que se vende el producto.",
                                "err": "Confunde naturaleza con venta",
                                "msg": "Los pasos de venta se muestran en el diagrama de venta.",
                                "ver": [
                                    "venta",
                                    "ven-lectura"
                                ]
                            }
                        ],
                        "pista": "Piensa en las piezas que forman el producto, no en quién lo vende."
                    },
                    {
                        "titulo": "Decisión 2 · La relación",
                        "intro": "Dos componentes se relacionan. ¿Cómo lo muestras?",
                        "ops": [
                            {
                                "html": "Con una relación (R) y la cardinalidad, 1 o N, en cada extremo.",
                                "ok": 1,
                                "explica": "La relación se nombra y cada extremo lleva su cardinalidad."
                            },
                            {
                                "html": "Con una flecha sin nombre ni cardinalidad.",
                                "err": "Relación sin cardinalidad",
                                "msg": "Sin la cardinalidad no se sabe cuántos de cada componente se relacionan.",
                                "ver": [
                                    "definicion",
                                    "def-nat-alm"
                                ]
                            },
                            {
                                "html": "Dibujando un componente dentro del otro.",
                                "err": "Anida componentes",
                                "msg": "Cada componente es una entidad propia, unida por una relación.",
                                "ver": [
                                    "definicion",
                                    "def-nat-alm"
                                ]
                            }
                        ],
                        "pista": "Mira los extremos de las líneas en el esquema de almacenamiento."
                    },
                    {
                        "titulo": "Decisión 3 · Los atributos",
                        "intro": "Ya dibujaste el tipo de contenedor con sus atributos. ¿Cómo quedan en el catálogo?",
                        "ops": [
                            {
                                "html": "En el catálogo pones otros atributos, según convenga.",
                                "err": "Esquema y catálogo no coinciden",
                                "msg": "Si cambian los atributos, el esquema y el catálogo ya no describen el mismo componente.",
                                "ver": [
                                    "definicion",
                                    "def-nat-error"
                                ]
                            },
                            {
                                "html": "Dibujas el contenedor dos veces con atributos distintos.",
                                "err": "Componente repetido",
                                "msg": "Cada componente aparece una sola vez en el esquema.",
                                "ver": [
                                    "definicion",
                                    "def-nat-error"
                                ]
                            },
                            {
                                "html": "Son los mismos atributos: el catálogo y sus tipologías salen del esquema.",
                                "ok": 1,
                                "explica": "Los atributos del esquema son los que luego aparecen en el catálogo y en las tipologías."
                            }
                        ],
                        "pista": "Un mismo componente, un mismo conjunto de atributos en todas partes."
                    }
                ],
                "solucion": "<p>La naturaleza muestra los <b>componentes del producto</b>, con sus <b>relaciones y cardinalidades</b>. Cada componente aparece <b>una vez</b> y sus atributos son los mismos que usan el catálogo y las tipologías.</p>",
                "llevate": "Un componente, una vez, con los mismos atributos en todas las hojas."
            },
            {
                "id": "q3",
                "titulo": "Tipologías y catálogo",
                "desc": "Armar el catálogo con todas las combinaciones.",
                "tiempo": "5 min",
                "enunciado": "<p><b>Ejemplo · Almacenamiento.</b> Los contenedores se definen con 6 alturas, 6 anchuras, 6 profundidades, 3 temperaturas y 6 materiales.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · El catálogo",
                        "intro": "¿Qué recoge el catálogo de productos?",
                        "ops": [
                            {
                                "html": "Solo los productos más pedidos.",
                                "err": "Catálogo parcial",
                                "msg": "El catálogo no se limita a los más pedidos: reúne las combinaciones que ofreces.",
                                "ver": [
                                    "definicion",
                                    "def-tipologias"
                                ]
                            },
                            {
                                "html": "La lista de clientes que los compran.",
                                "err": "Confunde catálogo con clientes",
                                "msg": "Los clientes aparecen en la venta, no en el catálogo de productos.",
                                "ver": [
                                    "definicion",
                                    "def-tip-alm"
                                ]
                            },
                            {
                                "html": "Todas las combinaciones de productos que tu servicio puede ofrecer.",
                                "ok": 1,
                                "explica": "El catálogo recoge las posibles combinaciones de los productos que ofreces."
                            }
                        ],
                        "pista": "El catálogo habla de lo que ofreces, no de quién compra."
                    },
                    {
                        "titulo": "Decisión 2 · Las tipologías",
                        "intro": "¿Qué son las tipologías?",
                        "ops": [
                            {
                                "html": "Los tickets ya fabricados.",
                                "err": "Confunde tipología con ticket",
                                "msg": "Los tickets nacen en Fabricación; las tipologías son tipos de componentes.",
                                "ver": [
                                    "definicion",
                                    "def-tip-error"
                                ]
                            },
                            {
                                "html": "Las tablas de tipos de cada componente, con su código y su descripción.",
                                "ok": 1,
                                "explica": "Cada tipo de componente (alturas, materiales, temperaturas) tiene su tabla con código y descripción."
                            },
                            {
                                "html": "Una sola tabla con todos los atributos mezclados.",
                                "err": "Tipologías mezcladas",
                                "msg": "Cada tipo va en su propia tabla.",
                                "ver": [
                                    "definicion",
                                    "def-tip-alm"
                                ]
                            }
                        ],
                        "pista": "Piensa en la tabla de alturas o la de materiales."
                    },
                    {
                        "titulo": "Decisión 3 · La cuenta",
                        "intro": "Si ofreces todas las combinaciones, ¿cuántos contenedores distintos hay?",
                        "ops": [
                            {
                                "html": "3,888, porque 6 × 6 × 6 × 3 × 6 = 3,888.",
                                "ok": 1,
                                "explica": "Las combinaciones se multiplican: cada tipología aporta sus opciones."
                            },
                            {
                                "html": "27, porque 6 + 6 + 6 + 3 + 6 = 27.",
                                "err": "Suma en vez de multiplicar",
                                "msg": "Las combinaciones se multiplican; sumar solo cuenta las opciones sueltas.",
                                "ver": [
                                    "definicion",
                                    "def-tip-alm"
                                ]
                            },
                            {
                                "html": "420, un número de ejemplo sin cuenta detrás.",
                                "err": "Número sin sustento",
                                "msg": "Un catálogo con «todas las combinaciones» debe salir de la cuenta de sus tipologías.",
                                "ver": [
                                    "definicion",
                                    "def-tip-alm"
                                ]
                            }
                        ],
                        "pista": "Cuando se combinan opciones independientes, se multiplican."
                    }
                ],
                "solucion": "<p>El catálogo reúne <b>todas las combinaciones</b> que ofreces y las tipologías son <b>una tabla por tipo</b>. Con 6 · 6 · 6 · 3 · 6 opciones salen <b>3,888</b> contenedores.</p>",
                "llevate": "Catálogo = combinaciones; tipologías = una tabla por tipo; las opciones se multiplican."
            },
            {
                "id": "q4",
                "titulo": "Fabricación",
                "desc": "Distinguir recursos programados, disponibilidad y generación de tickets.",
                "tiempo": "5 min",
                "enunciado": "<p><b>Ejemplo · Cobranzas.</b> Vas a fabricar los tickets de una cobranza leve por SMS para un sponsor.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · Recursos programados",
                        "intro": "¿Qué resuelve «recursos programados»?",
                        "ops": [
                            {
                                "html": "Cómo se programan y separan los recursos por cada ticket o por cada tipo de servicio al que se destina.",
                                "ok": 1,
                                "explica": "Es la pieza que aparta el recurso (operador y canal) para el ticket o el tipo de servicio."
                            },
                            {
                                "html": "Cuándo hay horarios libres para vender.",
                                "err": "Confunde con disponibilidad",
                                "msg": "Eso es la disponibilidad: fechas, horarios y estado para vender.",
                                "ver": [
                                    "fabricacion",
                                    "fab-tres"
                                ]
                            },
                            {
                                "html": "El cliente que va a comprar el ticket.",
                                "err": "Confunde con la venta",
                                "msg": "El cliente aparece en la venta; en Fabricación solo se preparan recursos y tickets.",
                                "ver": [
                                    "fabricacion",
                                    "fab-programados"
                                ]
                            }
                        ],
                        "pista": "Piensa en separar el recurso antes de que exista el ticket."
                    },
                    {
                        "titulo": "Decisión 2 · Generar el ticket",
                        "intro": "Vas a generar el ticket de un servicio programado. ¿Qué tiene que estar resuelto antes?",
                        "ops": [
                            {
                                "html": "Solo el catálogo de productos: con eso alcanza.",
                                "err": "Confunde catálogo con ticket",
                                "msg": "El catálogo define qué ofreces; no separa recursos ni reserva fecha ni horario.",
                                "ver": [
                                    "fabricacion",
                                    "fab-tickets"
                                ]
                            },
                            {
                                "html": "El cliente que lo compra: el ticket se genera cuando llega la venta.",
                                "err": "Confunde generar con asignar",
                                "msg": "En la venta el ticket ya existe: se asigna al cliente.",
                                "ver": [
                                    "venta",
                                    "ven-lectura"
                                ]
                            },
                            {
                                "html": "Los recursos específicos ya programados y la fecha y el horario reservados.",
                                "ok": 1,
                                "explica": "Un ticket se genera con fecha reservada y con los recursos concretos ya programados."
                            }
                        ],
                        "pista": "El ticket nace en Fabricación y la venta lo asigna después."
                    },
                    {
                        "titulo": "Decisión 3 · La disponibilidad",
                        "intro": "¿Qué debe mostrar la tabla de disponibilidad?",
                        "ops": [
                            {
                                "html": "Los clientes que ya compraron tickets.",
                                "err": "Mezcla disponibilidad con venta",
                                "msg": "Quién compró pertenece a la venta, no a la disponibilidad.",
                                "ver": [
                                    "fabricacion",
                                    "fab-error"
                                ]
                            },
                            {
                                "html": "Fechas, horarios y el estado para vender, comparando tickets ocupados con capacidad máxima.",
                                "ok": 1,
                                "explica": "El estado sale de comparar los tickets ocupados con la capacidad máxima de cada franja."
                            },
                            {
                                "html": "Solo la lista de recursos del producto.",
                                "err": "Falta calendario y estado",
                                "msg": "La lista de recursos va en el primer paso; la disponibilidad agrega fecha, horario y estado.",
                                "ver": [
                                    "fabricacion",
                                    "fab-disponibilidad"
                                ]
                            }
                        ],
                        "pista": "Mira las dos columnas que se comparan para decidir «saturado» o «disponible»."
                    }
                ],
                "solucion": "<p>Primero se <b>programan los recursos</b>, luego se organiza la <b>disponibilidad</b> (fechas, horarios, estado) y por último se <b>genera el ticket</b> ya con fecha reservada y recursos específicos.</p>",
                "llevate": "Recursos, disponibilidad y ticket, en ese orden, todo antes de la venta."
            },
            {
                "id": "q5",
                "titulo": "Reglas",
                "desc": "Escribir una regla completa y coherente.",
                "tiempo": "5 min",
                "enunciado": "<p><b>Ejemplo · Publicidad.</b> Un cliente solo puede comprar un máximo de 12 tickets, equivalente a un máximo de 60 segundos dentro de un vehículo publicitario.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · Qué es una regla",
                        "intro": "¿Qué es una regla?",
                        "ops": [
                            {
                                "html": "Una tabla que relaciona dos catálogos.",
                                "err": "Confunde regla con política",
                                "msg": "La relación entre catálogos es la pieza de la política.",
                                "ver": [
                                    "politicas",
                                    "pol-anatomia"
                                ]
                            },
                            {
                                "html": "Elegir una forma de resolver un problema de tu sistema entre varias posibles.",
                                "ok": 1,
                                "explica": "La regla es la opción que eliges para resolver un problema."
                            },
                            {
                                "html": "Realizar una operación bajo tus términos.",
                                "err": "Confunde regla con política",
                                "msg": "Eso es una política.",
                                "ver": [
                                    "politicas",
                                    "pol-anatomia"
                                ]
                            }
                        ],
                        "pista": "La regla evalúa condiciones y decide acciones."
                    },
                    {
                        "titulo": "Decisión 2 · La condición",
                        "intro": "¿Cómo escribes la condición de la cantidad de tickets?",
                        "ops": [
                            {
                                "html": "<code>numero_tickets ≤ 12</code>",
                                "ok": 1,
                                "explica": "«Máximo 12» significa que 12 o menos es válido."
                            },
                            {
                                "html": "<code>numero_tickets = 12</code>",
                                "err": "Contradice «máximo»",
                                "msg": "Con «=» solo sería válido comprar exactamente 12.",
                                "ver": [
                                    "reglas",
                                    "reg-pub1"
                                ]
                            },
                            {
                                "html": "<code>numero_tickets &gt; 12</code>",
                                "err": "Invierte la condición",
                                "msg": "Con «>» solo se aceptarían compras que superan el máximo.",
                                "ver": [
                                    "reglas",
                                    "reg-error"
                                ]
                            }
                        ],
                        "pista": "Si el enunciado dice «máximo», la condición incluye el 12."
                    },
                    {
                        "titulo": "Decisión 3 · Cuántas y cómo",
                        "intro": "¿Qué se espera de las reglas de tu monografía?",
                        "ops": [
                            {
                                "html": "Una sola regla muy bien hecha.",
                                "err": "Pocas reglas",
                                "msg": "Se piden mínimo 3.",
                                "ver": [
                                    "reglas",
                                    "reg-anatomia"
                                ]
                            },
                            {
                                "html": "Tres enunciados sin sus catálogos.",
                                "err": "Reglas incompletas",
                                "msg": "Sin catálogos no se puede ver cómo se evalúa y qué acción se toma.",
                                "ver": [
                                    "reglas",
                                    "reg-anatomia"
                                ]
                            },
                            {
                                "html": "Mínimo 3, cada una con enunciado, catálogo de condiciones, relación, variables y acciones.",
                                "ok": 1,
                                "explica": "Son al menos 3 y cada una lleva sus piezas completas."
                            }
                        ],
                        "pista": "Cuenta cuántas piezas lleva cada regla de ejemplo."
                    }
                ],
                "solucion": "<p>Una regla <b>elige una forma de resolver un problema</b>. Su condición debe decir lo mismo que el enunciado (<code>≤ 12</code>), y hacen falta <b>mínimo 3</b>, completas.</p>",
                "llevate": "Enunciado y condiciones dicen lo mismo; mínimo 3 reglas completas."
            },
            {
                "id": "q6",
                "titulo": "Políticas",
                "desc": "Armar una política como relación entre catálogos.",
                "tiempo": "4 min",
                "enunciado": "<p><b>Ejemplo · Ventas.</b> Cada fuerza de ventas se relaciona con varios instrumentos de pago, y un mismo instrumento puede servir a varias fuerzas.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · Qué es una política",
                        "intro": "¿Qué es una política?",
                        "ops": [
                            {
                                "html": "Elegir entre varias formas de resolver un problema.",
                                "err": "Confunde política con regla",
                                "msg": "Eso es una regla.",
                                "ver": [
                                    "reglas",
                                    "reg-anatomia"
                                ]
                            },
                            {
                                "html": "Un diagrama de cómo se vende el ticket.",
                                "err": "Confunde política con venta",
                                "msg": "Ese diagrama es el de venta.",
                                "ver": [
                                    "venta",
                                    "ven-lectura"
                                ]
                            },
                            {
                                "html": "Realizar una operación o ciertas operaciones bajo tus términos.",
                                "ok": 1,
                                "explica": "La política fija bajo qué términos se realiza una operación."
                            }
                        ],
                        "pista": "Piensa en «bajo tus términos»."
                    },
                    {
                        "titulo": "Decisión 2 · La relación",
                        "intro": "¿Cómo se expresa la política?",
                        "ops": [
                            {
                                "html": "Con la lista de tickets vendidos.",
                                "err": "Mezcla política con venta",
                                "msg": "Los tickets vendidos no forman parte de una política entre catálogos.",
                                "ver": [
                                    "politicas",
                                    "pol-anatomia"
                                ]
                            },
                            {
                                "html": "Con los dos catálogos, la relación y su cardinalidad en cada extremo.",
                                "ok": 1,
                                "explica": "La política es una relación entre catálogos con su cardinalidad."
                            },
                            {
                                "html": "Con una condición y una acción.",
                                "err": "Usa el formato de una regla",
                                "msg": "Condición y acción son piezas de la regla.",
                                "ver": [
                                    "reglas",
                                    "reg-anatomia"
                                ]
                            }
                        ],
                        "pista": "Mira el gráfico de cualquier política de ejemplo."
                    },
                    {
                        "titulo": "Decisión 3 · La tabla",
                        "intro": "Un par se repite en la tabla de la política. ¿Qué haces?",
                        "ops": [
                            {
                                "html": "Lo dejas una sola vez: cada par aparece una sola vez.",
                                "ok": 1,
                                "explica": "La tabla lista los pares permitidos, sin repetirlos."
                            },
                            {
                                "html": "Lo dejas repetido: refuerza la relación.",
                                "err": "Pares repetidos",
                                "msg": "Repetir un par no refuerza nada; solo ensucia la tabla.",
                                "ver": [
                                    "politicas",
                                    "pol-anatomia"
                                ]
                            },
                            {
                                "html": "Cambias a que sea una regla.",
                                "err": "Cambia de tema",
                                "msg": "Una fila repetida no convierte la política en regla.",
                                "ver": [
                                    "politicas",
                                    "pol-anatomia"
                                ]
                            }
                        ],
                        "pista": "Cada par de códigos dice una sola cosa."
                    }
                ],
                "solucion": "<p>La política es una <b>relación entre catálogos</b> con su <b>cardinalidad</b>, y su tabla lista cada par <b>una sola vez</b>.</p>",
                "llevate": "Política: dos catálogos, cardinalidad y pares sin repetir."
            },
            {
                "id": "q7",
                "titulo": "Venta",
                "desc": "Definir la interacción de las cuentas.",
                "tiempo": "5 min",
                "enunciado": "<p><b>Ejemplo · Publicidad.</b> Vas a dibujar el diagrama de venta de tu sistema.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · El evento",
                        "intro": "¿Qué hace el evento de venta?",
                        "ops": [
                            {
                                "html": "Modifica el comportamiento del cliente y la existencia de tickets.",
                                "ok": 1,
                                "explica": "La venta asigna tickets ya fabricados al cliente y actualiza las cuentas."
                            },
                            {
                                "html": "Crea los tickets que se venden.",
                                "err": "Confunde vender con fabricar",
                                "msg": "Los tickets se fabrican antes; la venta los asigna.",
                                "ver": [
                                    "fabricacion",
                                    "fab-tickets"
                                ]
                            },
                            {
                                "html": "Programa los recursos del servicio.",
                                "err": "Confunde venta con Fabricación",
                                "msg": "Programar recursos es parte de Fabricación.",
                                "ver": [
                                    "fabricacion",
                                    "fab-programados"
                                ]
                            }
                        ],
                        "pista": "Mira las dos notas de color en los diagramas de venta."
                    },
                    {
                        "titulo": "Decisión 2 · Las cuentas",
                        "intro": "¿Qué cuentas lleva el diagrama?",
                        "ops": [
                            {
                                "html": "Las de cualquier sistema, mientras se vea completo.",
                                "err": "Mezcla sistemas",
                                "msg": "Cada sistema se evalúa con su propio diagrama.",
                                "ver": [
                                    "venta",
                                    "ven-tabs"
                                ]
                            },
                            {
                                "html": "Solo la cuenta del cliente.",
                                "err": "Diagrama incompleto",
                                "msg": "La venta interactúa también con existencia de tickets, caja y canal.",
                                "ver": [
                                    "venta",
                                    "ven-tabs"
                                ]
                            },
                            {
                                "html": "Las cuentas propias de tu sistema, cada una con su catálogo (C-P).",
                                "ok": 1,
                                "explica": "Cada cuenta se apoya en su catálogo y solo se dibujan las de tu sistema."
                            }
                        ],
                        "pista": "Cada brazo del diagrama termina en un catálogo."
                    },
                    {
                        "titulo": "Decisión 3 · El cliente",
                        "intro": "En cobranzas, ¿quién es el cliente?",
                        "ops": [
                            {
                                "html": "Los clientes del sponsor.",
                                "err": "Mira a los clientes del sponsor",
                                "msg": "El cliente es de nuestro servicio, no de la empresa que nos contrata.",
                                "ver": [
                                    "venta",
                                    "ven-lectura"
                                ]
                            },
                            {
                                "html": "El sponsor, que contrata el servicio; el moroso es un tercero.",
                                "ok": 1,
                                "explica": "El cliente es quien contrata. En cobranzas se llama sponsor."
                            },
                            {
                                "html": "El moroso.",
                                "err": "Confunde tercero con cliente",
                                "msg": "El moroso es el tercero que le debe al sponsor, no quien contrata.",
                                "ver": [
                                    "venta",
                                    "ven-lectura"
                                ]
                            }
                        ],
                        "pista": "¿Quién firma el contrato con nosotros?"
                    }
                ],
                "solucion": "<p>La venta <b>modifica el comportamiento del cliente y la existencia de tickets</b>. El diagrama lleva solo las <b>cuentas de tu sistema</b>, cada una con su <b>catálogo</b>. El cliente es quien contrata (el <b>sponsor</b> en cobranzas).</p>",
                "llevate": "La venta asigna tickets ya fabricados; cada cuenta con su catálogo."
            },
            {
                "id": "q8",
                "titulo": "Protocolo y Entrega",
                "desc": "Organizar el protocolo y presentar la entrega.",
                "tiempo": "5 min",
                "enunciado": "<p><b>Ejemplo · Cobranzas.</b> Vas a presentar la transacción <code>ejecutar_cobranza</code>, su evento de ejemplo y su eficiencia.</p>",
                "bloques": [
                    {
                        "titulo": "Decisión 1 · El protocolo",
                        "intro": "¿Cómo se organiza el protocolo?",
                        "ops": [
                            {
                                "html": "Una lista de tablas del modelo.",
                                "err": "Confunde protocolo con tablas",
                                "msg": "El protocolo describe cómo se llevan a cabo las operaciones.",
                                "ver": [
                                    "definicion",
                                    "def-pro-tabs"
                                ]
                            },
                            {
                                "html": "Transacción, operaciones de negocio, secuencia y métodos.",
                                "ok": 1,
                                "explica": "Cada transacción se descompone en operaciones, con su orden y sus métodos."
                            },
                            {
                                "html": "Solo una lista de métodos.",
                                "err": "Falta la estructura",
                                "msg": "Los métodos se agrupan en operaciones y estas en transacciones.",
                                "ver": [
                                    "definicion",
                                    "def-protocolo"
                                ]
                            }
                        ],
                        "pista": "Mira las columnas de la tabla de protocolo."
                    },
                    {
                        "titulo": "Decisión 2 · El evento",
                        "intro": "¿Qué es el evento de ejemplo de la Entrega?",
                        "ops": [
                            {
                                "html": "La evidencia de una transacción ya concluida, con sus operaciones, métodos y entidades afectadas.",
                                "ok": 1,
                                "explica": "El evento registra lo que ya ocurrió en la transacción."
                            },
                            {
                                "html": "La planificación de una transacción futura.",
                                "err": "Confunde evento con plan",
                                "msg": "El evento es evidencia de algo ya ejecutado.",
                                "ver": [
                                    "entrega",
                                    "ent-evento"
                                ]
                            },
                            {
                                "html": "Un ticket por generar.",
                                "err": "Confunde evento con ticket",
                                "msg": "Los tickets se generan en Fabricación.",
                                "ver": [
                                    "fabricacion",
                                    "fab-tickets"
                                ]
                            }
                        ],
                        "pista": "Evento y transacción en curso no son lo mismo."
                    },
                    {
                        "titulo": "Decisión 3 · La eficiencia",
                        "intro": "¿Qué muestra la eficiencia por producto?",
                        "ops": [
                            {
                                "html": "Solo los recursos de cada producto.",
                                "err": "Confunde eficiencia con recursos",
                                "msg": "Los recursos van en Fabricación.",
                                "ver": [
                                    "fabricacion",
                                    "fab-recursos"
                                ]
                            },
                            {
                                "html": "La secuencia del protocolo repetida.",
                                "err": "Repite otra tabla",
                                "msg": "La secuencia es otra pieza de la Entrega.",
                                "ver": [
                                    "entrega",
                                    "ent-secuencia"
                                ]
                            },
                            {
                                "html": "Por cada producto, lo prometido frente a lo obtenido.",
                                "ok": 1,
                                "explica": "Compara el porcentaje prometido con el obtenido, producto por producto."
                            }
                        ],
                        "pista": "Mira las columnas de porcentajes de la tabla."
                    }
                ],
                "solucion": "<p>El protocolo va de <b>transacción a operaciones, secuencia y métodos</b>. El evento de ejemplo es la <b>evidencia</b> de una transacción concluida y la eficiencia compara <b>lo prometido con lo obtenido</b> por producto.</p>",
                "llevate": "Protocolo estructurado, evento como evidencia, eficiencia por producto."
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
        if (b.v) b.v.split(' ').forEach(function (c) { if (c) e.classList.add(c); });   // variante opcional del bloque (catálogo, GUIA_BASE 4c)
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
        const hay = nav.scrollWidth > nav.clientWidth + 2;   // sin sumar el ancho de las flechas: al mostrarlas el menú se achica y el cálculo oscilaba
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
        const w = h('div', 'dec'); w.innerHTML = '<h3>' + esc(b.titulo) + '</h3>' + (b.intro ? '<p class="intro">' + b.intro + '</p>' : '');
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
                w.appendChild(h('div', 'sol-b', '<p><b>' + esc(b.titulo) + '</b><br>' + ok.html + ' — ' + (ok.explica || '') + '</p>'));
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
            if (enIframe) {
                // Dentro del visor de SIGA (iframe) window.print() no sirve: se pulsa el botón de imprimir del visor (mismo origen).
                let btnVisor = null;
                try { btnVisor = window.parent.document.querySelector('[data-accion="imprimir"]'); } catch (e) { /* otro origen: se usa el aviso */ }
                if (btnVisor) { ip.hidden = true; ib.setAttribute('aria-expanded', 'false'); btnVisor.click(); return; }
                nota.textContent = 'Modo guardado. Estás dentro del visor: imprime con el botón de imprimir del visor.'; return;
            }
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