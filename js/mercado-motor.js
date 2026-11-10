/**
 * mercado-motor.js — Motor de detección de competencias (SIGA · Mapa de Competencias y Ruta Profesional).
 *
 * Recibe el TEXTO de una oferta laboral y el CATÁLOGO de competencias (el de /api/mercado/catalogo) y devuelve qué
 * competencias pide la oferta, con su nivel, su tipo y el fragmento exacto que las respalda.
 *
 * Es un módulo independiente: no usa el navegador (DOM), ni la red, ni Chrome, ni ningún portal. Por eso se puede
 * probar y corregir sin tocar nada más. Solo conoce texto.
 *
 * REGLAS DE FONDO (acordadas con Harry)
 *   1. No inventar niveles: el nivel solo se devuelve si la oferta lo dice con palabras (básico, intermedio, avanzado,
 *      basic, intermediate, advanced) pegadas a la competencia. Si hay dos niveles ("intermedio-avanzado") o dudas: null.
 *   2. No inventar obligatoriedad: 'obligatorio' o 'deseable' solo con palabras explícitas del anuncio (en la misma
 *      frase o en el título de la sección). Si no hay ninguna: 'no_indicado'. Si hay señales contradictorias: 'no_indicado'.
 *   3. Conservar evidencia: cada competencia lleva un fragmento que EXISTE en el texto (sin teléfonos, correos ni
 *      enlaces), con menos de 20 palabras y 220 caracteres, igual que exige la base de datos.
 *   4. No forzar coincidencias: lo dudoso no se propone como hallazgo; va a `descartadas` con su motivo, para que se
 *      vea en la vista previa y se pueda recuperar a mano.
 *   5. Datos personales: teléfonos, correos, enlaces y @usuarios se reemplazan por [teléfono], [correo], [enlace] y
 *      [usuario] ANTES de analizar. Nunca llegan a un fragmento.
 *
 * Las reglas especiales de detección están al final de la sección "Reglas especiales".
 */

export const VERSION_MOTOR = "1.4";

const LIMITE_TEXTO = 30000;          // caracteres; más que eso se recorta (y se avisa)
const MAX_PALABRAS_FRAGMENTO = 19;   // "menos de 20 palabras"
const MAX_CARACTERES_FRAGMENTO = 220;

// --------------------------------------------------------------
// Utilidades de texto
// --------------------------------------------------------------

/** Minúsculas y sin tildes, SIEMPRE con la misma longitud que el original (así las posiciones coinciden). */
function plegar(texto) {
    let r = "";
    for (let i = 0; i < texto.length; i++) {
        const c = texto[i];
        const d = c.normalize("NFD");
        const base = d.length > 1 && /[\u0300-\u036f]/.test(d[1]) ? d[0] : c;
        const m = base.toLowerCase();
        r += m.length === 1 ? m : base;
    }
    return r;
}

const tieneLetraONumero = (s) => /[\p{L}\p{N}]/u.test(s);

function contarPalabras(s) {
    return s.split(" ").filter((t) => t && tieneLetraONumero(t)).length;
}

/** Reemplaza teléfonos, correos, enlaces y @usuarios. Devuelve el texto limpio y cuántos se quitaron. */
function redactar(texto) {
    const cuentas = { correos: 0, enlaces: 0, usuarios: 0, telefonos: 0 };
    let t = texto.replace(/\u00a0/g, " ");
    t = t.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, () => (cuentas.correos++, "[correo]"));
    t = t.replace(/\b(?:https?:\/\/|www\.)[^\s]+/gi, () => (cuentas.enlaces++, "[enlace]"));
    t = t.replace(
        /\b(?:wa\.me|chat\.whatsapp\.com|t\.me|bit\.ly|forms\.gle|linkedin\.com|lnkd\.in)\/[^\s]*/gi,
        () => (cuentas.enlaces++, "[enlace]")
    );
    t = t.replace(/(?<![\w.])@[A-Za-z0-9_.]{3,}/g, () => (cuentas.usuarios++, "[usuario]"));
    // 7 o más dígitos seguidos (con espacios, guiones o paréntesis): teléfonos. También se lleva rangos como 2019-2023.
    t = t.replace(/(?<![\w])\+?\d(?:[\s().-]?\d){6,}(?![\w])/g, () => (cuentas.telefonos++, "[teléfono]"));
    return { texto: t, redacciones: cuentas };
}

// --------------------------------------------------------------
// Segmentos (frases) y cláusulas
// --------------------------------------------------------------

/** Posiciones de los límites de frase: salto de línea, ; • · | y punto seguido de espacio o final. */
function limitesDeFrase(texto) {
    const lim = [];
    const re = /\n|[;•·|]|\.(?=\s|$)/g;
    let m;
    while ((m = re.exec(texto))) lim.push(m.index);
    return lim;
}

function limitesDeClausula(texto) {
    const lim = [];
    const re = /\n|[;•·|,:()]|\.(?=\s|$)/g;
    let m;
    while ((m = re.exec(texto))) lim.push(m.index);
    return lim;
}

function segmentoAlrededor(texto, limites, pos) {
    let ini = 0;
    let fin = texto.length;
    for (const l of limites) {
        if (l < pos) ini = l + 1;
        else {
            fin = l;
            break;
        }
    }
    return { ini, fin };
}

// --------------------------------------------------------------
// Secciones del anuncio ("Requisitos:", "Deseable:", "Beneficios:"...)
// --------------------------------------------------------------

const RE_NEGADO_EXCLUYENTE =
    /\bno\s+(?:es\s+|son\s+)?(?:excluyentes?|indispensables?|obligatori[oa]s?|imprescindibles?)\b/;
const RE_NO_NECESARIO = /\bno\s+(?:es\s+|son\s+)?necesari[oa]s?\b/;
const RE_DESEABLE =
    /\b(?:deseables?|valorables?|se valorar[ae]n?|valoramos|plus|nice to have|opcional(?:es)?|preferibles?|preferentemente|ventajas?|conocimientos adicionales)\b/;
const RE_OBLIGATORIO =
    /\b(?:requisitos?|requerimientos?|requeridos?|requeridas?|indispensables?|imprescindibles?|excluyentes?|obligatori[oa]s?|must have|mandatory|se requiere|requerimos|necesari[oa]s?)\b/;
const RE_IGNORAR =
    /\b(?:beneficios|ofrecemos|ofrecen|sobre nosotros|acerca de|quienes somos|nuestra empresa|sobre la empresa|como postular|contacto|horario|modalidad|remuneracion|sueldo|salario|ubicacion|lugar de trabajo)\b/;
const RE_NEUTRAL =
    /\b(?:funciones|responsabilidades|tareas|actividades|que haras|principales funciones|el puesto|descripcion del puesto|descripcion)\b/;

// Un título de sección EMPIEZA con una de estas palabras ("Requisitos del puesto", "Deseable", "Lo que ofrecemos").
// Así «Python no necesario» o «Scrum indispensable» no se confunden con un título.
const RE_CABEZA_DE_TITULO =
    /^(?:lo que |que |te |nosotros )?(?:requisitos?|requerimientos?|perfil requerido|deseables?|valorables?|conocimientos deseables|conocimientos adicionales|se valorar[ae]n?|valoramos|plus|nice to have|opcional(?:es)?|preferibles?|ventajas?|indispensables?|imprescindibles?|excluyentes?|obligatori[oa]s?|funciones|principales funciones|responsabilidades|tareas|actividades|haras|el puesto|descripcion|beneficios|ofrecemos|ofrecen|sobre nosotros|acerca de|quienes somos|nuestra empresa|sobre la empresa|como postular|contacto|horario|modalidad|remuneracion|sueldo|salario|ubicacion|lugar de trabajo)\b/;

const limpiarTitulo = (t) => plegar(t).replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

/** Clasifica el título de una sección (ya plegado). Devuelve 'ignorar' | 'deseable' | 'obligatorio' | 'neutral' | null. */
function clasificarEtiqueta(etiqueta) {
    if (!RE_CABEZA_DE_TITULO.test(etiqueta)) return null;
    if (RE_IGNORAR.test(etiqueta)) return "ignorar";
    if (RE_NEGADO_EXCLUYENTE.test(etiqueta)) return "deseable";
    if (RE_DESEABLE.test(etiqueta)) return "deseable";
    if (RE_OBLIGATORIO.test(etiqueta)) return "obligatorio";
    if (RE_NEUTRAL.test(etiqueta)) return "neutral";
    return null;
}

const RE_VINIETA = /^\s*(?:[-•·–—*✔✅▪►✓👉🔹🔸]|\d+[.)])\s*/u;

/** Para cada línea, en qué sección está ('ignorar' | 'deseable' | 'obligatorio' | null). */
function seccionesPorLinea(lineas) {
    const resultado = [];
    let actual = null; // sección vigente (null = ninguna)
    let soloSiListas = false; // el título traía contenido en la misma línea: solo siguen las viñetas
    for (const linea of lineas) {
        const sinSimbolos = linea.replace(/^[^\p{L}\p{N}]+/u, "");
        const vacia = sinSimbolos.trim() === "";
        const esVineta = RE_VINIETA.test(linea);
        let titulo = null; // { clase, conContenido }

        const conDosPuntos = /^([^:]{2,70}?)\s*:\s*(.*)$/.exec(sinSimbolos);
        if (conDosPuntos && conDosPuntos[1].trim().split(/\s+/).length <= 9) {
            const clase = clasificarEtiqueta(limpiarTitulo(conDosPuntos[1]));
            if (clase !== null) titulo = { clase, conContenido: conDosPuntos[2].trim() !== "" };
        } else if (!esVineta && !vacia) {
            const palabras = sinSimbolos.trim().split(/\s+/);
            const enMayusculas = sinSimbolos === sinSimbolos.toUpperCase() && /\p{L}{3,}/u.test(sinSimbolos);
            if (palabras.length <= 5 && (palabras.length <= 3 || enMayusculas)) {
                const clase = clasificarEtiqueta(limpiarTitulo(sinSimbolos));
                if (clase !== null) titulo = { clase, conContenido: false };
            }
        }

        if (titulo) {
            if (esVineta && titulo.conContenido) {
                // "✔ Deseable: ProModel": es un ítem de la lista con su propia marca, no el título de una sección
                resultado.push(titulo.clase === "neutral" ? actual : titulo.clase);
                continue;
            }
            if (titulo.clase === "ignorar" && titulo.conContenido) {
                // "Ubicación: Lima": solo esa línea; las viñetas que siguen pueden ser requisitos
                resultado.push("ignorar");
                actual = null;
                soloSiListas = false;
                continue;
            }
            actual = titulo.clase === "neutral" ? null : titulo.clase;
            soloSiListas = titulo.conContenido;
            resultado.push(actual);
            continue;
        }
        if (soloSiListas && !vacia && !esVineta) {
            actual = null;
            soloSiListas = false;
        }
        resultado.push(actual);
    }
    return resultado;
}

// --------------------------------------------------------------
// Tipo (obligatorio / deseable) y nivel
// --------------------------------------------------------------

/** Señal explícita dentro de UNA frase (plegada): 'obligatorio' | 'deseable' | 'conflicto' | null. */
function senalDeFrase(frase) {
    let f = frase.replace(new RegExp(RE_NO_NECESARIO.source, "g"), " ");
    let deseable = false;
    if (RE_NEGADO_EXCLUYENTE.test(f)) {
        deseable = true;
        f = f.replace(new RegExp(RE_NEGADO_EXCLUYENTE.source, "g"), " ");
    }
    const marcaDeseable = deseable || RE_DESEABLE.test(f);
    const marcaObligatorio = RE_OBLIGATORIO.test(f);
    if (marcaDeseable && marcaObligatorio) return "conflicto";
    if (marcaDeseable) return "deseable";
    if (marcaObligatorio) return "obligatorio";
    return null;
}

const NIVELES = {
    basico: "basico", basica: "basico", basicos: "basico", basicas: "basico", basic: "basico",
    intermedio: "intermedio", intermedia: "intermedio", intermedios: "intermedio", intermedias: "intermedio",
    intermediate: "intermedio",
    avanzado: "avanzado", avanzada: "avanzado", avanzados: "avanzado", avanzadas: "avanzado", advanced: "avanzado",
};
const RE_NIVEL_TXT =
    "(basico|basica|basicos|basicas|basic|intermedio|intermedia|intermedios|intermedias|intermediate|avanzado|avanzada|avanzados|avanzadas|advanced)";

/** Nivel explícito pegado a la mención. Devuelve 'basico' | 'intermedio' | 'avanzado' | null. */
function detectarNivel(plegado, seg, ini, fin) {
    // 1) El propio término ya lo trae ("Microsoft Excel avanzado")
    const ultima = plegado.slice(ini, fin).trim().split(/\s+/).pop();
    if (NIVELES[ultima]) return NIVELES[ultima];

    // 2) Justo después: "Excel avanzado", "Inglés: intermedio", "SQL (nivel avanzado)"
    const despues = plegado.slice(fin, seg.fin);
    const d = new RegExp("^[\\s(:\\-–]*(?:(?:a|de|en|con)\\s+nivel\\s+|nivel\\s+)?" + RE_NIVEL_TXT + "\\b").exec(despues);
    if (d) {
        const resto = despues.slice(d[0].length);
        // otro nivel pegado ("intermedio-avanzado", "basico a intermedio"): hay dos niveles, no se elige ninguno
        if (new RegExp("^\\s*(?:[-–/]|a|e|y|o|to)?\\s*" + RE_NIVEL_TXT + "\\b").test(resto)) return null;
        return NIVELES[d[1]];
    }

    // 3) Justo antes: "avanzado en Excel", "nivel intermedio de SQL", "advanced SQL"
    const antes = plegado.slice(seg.ini, ini);
    const a = new RegExp(RE_NIVEL_TXT + "\\s+(?:(?:en|de|con|del|para)\\s+)?$").exec(antes);
    if (a) {
        const previo = antes.slice(0, a.index);
        if (new RegExp(RE_NIVEL_TXT + "\\s*(?:[-–/]|a|e|y|o|to)?\\s*$").test(previo)) return null;
        return NIVELES[a[1]];
    }
    return null;
}

// --------------------------------------------------------------
// Reglas especiales de detección
// --------------------------------------------------------------
//   - JavaScript: la sigla "JS" no cuenta dentro de "Node.js", "React.js" ni "vue-js". "Java" solo cuenta como palabra
//     completa, así que nunca sale de dentro de "JavaScript".
//   - SQL: no cuenta dentro de "T-SQL" ni "PL/SQL" (son dialectos de otros motores), ni en "MySQL"/"PostgreSQL"/"NoSQL"
//     (no son la palabra SQL sola). Una mención de "SQL Server" NO cuenta además como SQL: gana siempre el término más largo.
//   - C++: el símbolo + se respeta literal.
//   - Redes: la palabra suelta es ambigua ("redes sociales"). Solo cuenta si la frase trae contexto técnico
//     (computadoras, datos, comunicaciones, LAN, WAN, routers, servidores...) y nunca si dice "redes sociales".
//     Las variantes del catálogo ("networking", "administración de redes") sí cuentan siempre.
//     Lo móvil (3G/4G/5G, LTE, estaciones base) y la fibra: mientras el catálogo NO tenga la competencia «redes-moviles», cuentan como
//     contexto técnico de «Redes». Cuando la tenga, esa competencia (con variantes como "redes 4G" o "redes de fibra óptica", que al
//     ser más largas absorben la palabra "redes") se encarga, y «Redes» no se cuenta dos veces.
//   - Inglés: se detecta con y sin tilde ("inglés", "ingles", "English"). El nivel solo si la oferta lo dice.
//   - Si dos términos se pisan, gana el más largo ("SAP ERP" cuenta como SAP, no además como ERP).

const RE_REDES_TECNICO =
    /\b(?:computadoras?|computadores|ordenadores|datos|comunicaciones|telecomunicaciones|lan|wan|vlan|tcp|ip|cisco|ccna|ccnp|ccie|routers?|switch(?:es)?|servidores|infraestructura|firewall|vpn|wi-?fi|inalambric[oa]s?|bgp|ospf|mpls)\b/;

const RE_REDES_MOVIL =
    /\b(?:[2-5]g|lte|volte|gsm|umts|wcdma|fibra|ftth|radio|moviles?|estaciones? base|antenas?)\b/;

// «R» (el lenguaje) suelta es una letra: solo cuenta si la frase habla de datos, estadística o programación
//   («Python, R y SQL», «estadística con R»). Sin ese contexto se descarta en silencio (iniciales, «Plan R», etc.).
const RE_R_CONTEXTO =
    /\b(?:python|spss|stata|sas|excel|sql|matlab|power bi|tableau|estadistic[oa]s?|estadistica|analisis de datos|ciencia de datos|data science|machine learning|programacion|lenguajes?|rstudio|ggplot2?|tidyverse|shiny|software|herramientas?)\b/;

// «React» y «Angular» sueltas también son palabras comunes («ability to react», «piedra angular»): solo cuentan si la oferta, en
// cualquier parte, habla de desarrollo de software. Las variantes largas (React.js, ReactJS…) y las demás competencias no se afectan.
const BASE_DESARROLLO = "javascript|typescript|html5?|css3?|node(?:\\.?js)?|nestjs|next(?:\\.?js)?|redux|front-?end|front end|back-?end|back end|full ?stack|desarrollador(?:a|es)?|developer|programador(?:a|es)?|desarrollo de software|desarrollo web|software|frameworks?|aplicaciones? web|npm|apis?|git|github|sql|python|java|programacion";
const RE_DESARROLLO_REACT = new RegExp("\\b(?:" + BASE_DESARROLLO + "|angular|vue)\\b");
const RE_DESARROLLO_ANGULAR = new RegExp("\\b(?:" + BASE_DESARROLLO + "|react|vue)\\b");

// «Despliegue continuo» y «entrega continua» también existen fuera del software (despliegue de redes, entrega de mercadería): solo
// cuentan como CI/CD si la oferta, en cualquier parte, habla de desarrollo. «Integración continua» y «CI/CD» cuentan siempre.
const RE_DESARROLLO_CICD = new RegExp("\\b(?:" + BASE_DESARROLLO + "|devops|pipelines?|docker|kubernetes|jenkins|repositorios?)\\b");

/** Devuelve 'ok' | 'rechazar' | 'ambigua' para una coincidencia de término, según las reglas especiales. */
function reglaEspecial(slug, termino, plegado, ini, fin, seg, catalogoMovil = false) {
    if (slug === "javascript" && termino === "js") {
        return /[.\-]$/.test(plegado.slice(0, ini)) ? "rechazar" : "ok";
    }
    if (slug === "sql" && termino === "sql") {
        return /[a-z][-/]$/.test(plegado.slice(0, ini)) ? "rechazar" : "ok";
    }
    if (slug === "ci-cd" && (termino === "despliegue continuo" || termino === "entrega continua")) {
        return RE_DESARROLLO_CICD.test(plegado) ? "ok" : "rechazar";
    }
    if (slug === "react" && termino === "react") {
        if (/\bto\s+$/.test(plegado.slice(0, ini))) return "rechazar";            // «ability to react»
        return RE_DESARROLLO_REACT.test(plegado) ? "ok" : "rechazar";
    }
    if (slug === "angular" && termino === "angular") {
        if (/piedra\s+$/.test(plegado.slice(0, ini))) return "rechazar";           // «piedra angular»
        return RE_DESARROLLO_ANGULAR.test(plegado) ? "ok" : "rechazar";
    }
    if (slug === "r" && termino === "r") {
        return RE_R_CONTEXTO.test(plegado.slice(seg.ini, seg.fin)) ? "ok" : "rechazar";
    }
    if (slug === "redes" && termino === "redes") {
        if (/^\s*sociales\b/.test(plegado.slice(fin))) return "rechazar";
        const frase = plegado.slice(seg.ini, seg.fin);
        return RE_REDES_TECNICO.test(frase) || (!catalogoMovil && RE_REDES_MOVIL.test(frase)) ? "ok" : "ambigua";
    }
    return "ok";
}

// --------------------------------------------------------------
// Construcción de términos
// --------------------------------------------------------------

function regexDeTermino(terminoPlegado) {
    const partes = terminoPlegado.split(/[\s-]+/).filter(Boolean).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return new RegExp("(?<![a-z0-9])" + partes.join("[\\s-]+") + "(?![a-z0-9])", "g");
}

function prepararCatalogo(catalogo) {
    const lista = Array.isArray(catalogo) ? catalogo : catalogo && catalogo.competencias;
    if (!Array.isArray(lista)) throw new Error("El catálogo debe ser la lista de competencias");
    return lista.map((c) => {
        const vistos = new Set();
        const terminos = [];
        for (const t of [c.nombre, ...(c.variantes || [])]) {
            if (typeof t !== "string" || !t.trim()) continue;
            const p = plegar(t.normalize("NFC").trim());
            if (vistos.has(p)) continue;
            vistos.add(p);
            terminos.push({ plegado: p, regex: regexDeTermino(p) });
        }
        return { slug: c.slug, nombre: c.nombre, terminos, deteccion: c.deteccion === "revisar" ? "revisar" : "auto" };
    });
}

// --------------------------------------------------------------
// Fragmento de respaldo
// --------------------------------------------------------------

function construirFragmento(limpio, seg, ini, fin) {
    const texto = limpio.slice(seg.ini, seg.fin);
    const tokens = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(texto))) tokens.push({ t: m[0], ini: seg.ini + m.index, fin: seg.ini + m.index + m[0].length });

    let a = tokens.findIndex((k) => k.fin > ini);
    let b = tokens.length - 1;
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].ini < fin) {
            b = i;
            break;
        }
    }
    if (a < 0) a = 0;

    const armar = (x, y) => tokens.slice(x, y + 1).map((k) => k.t).join(" ");
    const cabe = (x, y) => {
        const f = armar(x, y);
        return contarPalabras(f) <= MAX_PALABRAS_FRAGMENTO && f.length <= MAX_CARACTERES_FRAGMENTO;
    };

    // Si todo el segmento cabe, va completo; si no, se crece desde la mención hacia los lados.
    let x = 0;
    let y = tokens.length - 1;
    if (!cabe(x, y)) {
        x = a;
        y = b;
        let izquierda = true;
        for (; ;) {
            const puedeIzq = x > 0 && cabe(x - 1, y);
            const puedeDer = y < tokens.length - 1 && cabe(x, y + 1);
            if (!puedeIzq && !puedeDer) break;
            if ((izquierda && puedeIzq) || !puedeDer) x--;
            else y++;
            izquierda = !izquierda;
        }
    }
    while (x < y && !tieneLetraONumero(tokens[x].t)) x++; // sin viñetas sueltas al inicio
    return armar(x, y);
}

// --------------------------------------------------------------
// Detección
// --------------------------------------------------------------

/**
 * @param {string} texto        Texto de la oferta (pegado o leído de una captura).
 * @param {Array|{competencias:Array}} catalogo   Competencias activas: [{slug, nombre, variantes:[...]}].
 * @returns {{
 *   version: string,
 *   texto_limpio: string,
 *   redacciones: {correos:number, enlaces:number, usuarios:number, telefonos:number},
 *   requisitos: Array<{competencia:string, nombre:string, nivel:(string|null), tipo:string, fragmento:string, coincidencia:string, menciones:number}>,
 *   descartadas: Array<{competencia:string, nombre:string, motivo:string, fragmento:string}>,
 *   avisos: string[]
 * }}
 */
export function detectarCompetencias(texto, catalogo) {
    const avisos = [];
    let original = typeof texto === "string" ? texto.normalize("NFC") : "";
    if (original.length > LIMITE_TEXTO) {
        original = original.slice(0, LIMITE_TEXTO);
        avisos.push(`El texto era muy largo: se analizaron solo los primeros ${LIMITE_TEXTO} caracteres.`);
    }
    const { texto: limpio, redacciones } = redactar(original);
    const plegado = plegar(limpio);
    const competencias = prepararCatalogo(catalogo);

    // Estructura del texto
    const limitesFrase = limitesDeFrase(limpio);
    const limitesClausula = limitesDeClausula(limpio);
    const lineas = limpio.split("\n");
    const secciones = seccionesPorLinea(lineas);
    const inicioDeLinea = [];
    let acumulado = 0;
    for (const l of lineas) {
        inicioDeLinea.push(acumulado);
        acumulado += l.length + 1;
    }
    const lineaDe = (pos) => {
        let lo = 0;
        let hi = inicioDeLinea.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (inicioDeLinea[mid] <= pos) lo = mid;
            else hi = mid - 1;
        }
        return lo;
    };

    // 1. Todas las coincidencias posibles
    const candidatas = [];
    const ambiguas = [];
    const catalogoMovil = competencias.some((c) => c.slug === "redes-moviles");
    for (const c of competencias) {
        for (const t of c.terminos) {
            t.regex.lastIndex = 0;
            let m;
            while ((m = t.regex.exec(plegado))) {
                const ini = m.index;
                const fin = ini + m[0].length;
                const seg = segmentoAlrededor(limpio, limitesFrase, ini);
                // Si el término queda partido entre dos renglones ("la gestión de / proyectos"), el segmento llega hasta donde termina
                if (fin > seg.fin) seg.fin = segmentoAlrededor(limpio, limitesFrase, fin - 1).fin;
                const regla = reglaEspecial(c.slug, t.plegado, plegado, ini, fin, seg, catalogoMovil);
                if (regla === "rechazar") continue;
                if (regla === "ambigua") {
                    ambiguas.push({ c, ini, fin, seg });
                    continue;
                }
                candidatas.push({ c, ini, fin, seg });
            }
        }
    }

    // 2. Si dos se pisan, gana la más larga ("SQL Server" gana sobre "SQL")
    candidatas.sort((p, q) => q.fin - q.ini - (p.fin - p.ini) || p.ini - q.ini);
    const aceptadas = [];
    for (const k of candidatas) {
        if (!aceptadas.some((o) => k.ini < o.fin && o.ini < k.fin)) aceptadas.push(k);
    }
    aceptadas.sort((p, q) => p.ini - q.ini);

    const descartadas = [];
    for (const k of ambiguas) {
        if (aceptadas.some((o) => k.ini < o.fin && o.ini < k.fin)) continue;
        descartadas.push({
            competencia: k.c.slug,
            nombre: k.c.nombre,
            motivo: "ambigua",
            fragmento: construirFragmento(limpio, k.seg, k.ini, k.fin),
        });
    }

    // 3a. Marcas entre paréntesis, "(deseable)", "(no excluyente)", "(indispensable)": son de la mención que las precede
    const marcaDeParentesis = new Map();
    const paraBlanquear = [];
    const reParentesis = /\([^()\n]*\)/g;
    let pm;
    while ((pm = reParentesis.exec(plegado))) {
        const senal = senalDeFrase(pm[0]);
        if (!senal) continue;
        let previa = null;
        for (const k of aceptadas) {
            if (k.fin <= pm.index && k.seg.fin >= pm.index && (!previa || k.fin > previa.fin)) previa = k;
        }
        if (!previa) continue; // sin mención antes: la marca sigue valiendo para toda la frase
        marcaDeParentesis.set(previa, senal === "conflicto" ? "no_indicado" : senal);
        paraBlanquear.push([pm.index, pm.index + pm[0].length]);
    }
    let plegadoParaFrases = plegado;
    for (const [a, b] of paraBlanquear) plegadoParaFrases = plegadoParaFrases.slice(0, a) + " ".repeat(b - a) + plegadoParaFrases.slice(b);

    // 3b. Cada mención: ¿negada?, ¿en una sección ignorada?, nivel, tipo, fragmento
    const menciones = [];
    const generalesVistas = new Set();
    for (const k of aceptadas) {
        const fragmento = construirFragmento(limpio, k.seg, k.ini, k.fin);
        const clausula = segmentoAlrededor(limpio, limitesClausula, k.ini);
        const antesEnClausula = plegado.slice(clausula.ini, k.ini);
        const ultimas = antesEnClausula
            .replace(new RegExp(RE_NEGADO_EXCLUYENTE.source, "g"), " ") // "no es excluyente tener X": X es deseable, no está negada
            .split(/\s+/).filter(Boolean).slice(-6).join(" ");
        if (/\b(?:no|sin|ni|tampoco|ningun|ninguna)\b/.test(ultimas) && !/\bno solo\b/.test(ultimas)) {
            descartadas.push({ competencia: k.c.slug, nombre: k.c.nombre, motivo: "negada", fragmento });
            continue;
        }
        const seccion = secciones[lineaDe(k.ini)];
        if (seccion === "ignorar") {
            descartadas.push({ competencia: k.c.slug, nombre: k.c.nombre, motivo: "seccion_ignorada", fragmento });
            continue;
        }
        if (k.c.deteccion === "revisar") {
            // Mención demasiado general para marcarla sola (p. ej. «gestión de proyectos»): se ofrece para que decidas, una vez por competencia
            if (!generalesVistas.has(k.c.slug)) {
                generalesVistas.add(k.c.slug);
                descartadas.push({ competencia: k.c.slug, nombre: k.c.nombre, motivo: "general", fragmento });
            }
            continue;
        }
        const nivel = detectarNivel(plegado, k.seg, k.ini, k.fin);
        const marcaPropia = marcaDeParentesis.get(k);
        const senal = marcaPropia ? null : senalDeFrase(plegadoParaFrases.slice(k.seg.ini, k.seg.fin));
        let tipo;
        if (marcaPropia) tipo = marcaPropia;
        else if (senal === "conflicto") tipo = "no_indicado";
        else if (senal) tipo = senal;
        else if (seccion === "deseable" || seccion === "obligatorio") tipo = seccion;
        else tipo = "no_indicado";
        menciones.push({ c: k.c, ini: k.ini, fin: k.fin, nivel, tipo, fragmento, conflictoDeFrase: senal === "conflicto" });
    }

    // 4. Una fila por competencia (la base no admite repetidas)
    const orden = [];
    const grupos = new Map();
    for (const mn of menciones) {
        if (!grupos.has(mn.c.slug)) {
            grupos.set(mn.c.slug, []);
            orden.push(mn.c.slug);
        }
        grupos.get(mn.c.slug).push(mn);
    }
    const requisitos = [];
    for (const slug of orden) {
        const g = grupos.get(slug);
        const niveles = [...new Set(g.map((x) => x.nivel).filter(Boolean))];
        const tiposExplicitos = [...new Set(g.map((x) => x.tipo).filter((x) => x !== "no_indicado"))];
        const nombre = g[0].c.nombre;

        let nivel = null;
        if (niveles.length === 1) nivel = niveles[0];
        else if (niveles.length > 1) avisos.push(`${nombre}: la oferta menciona niveles distintos; se deja sin nivel.`);

        let tipo = "no_indicado";
        if (tiposExplicitos.length === 1) tipo = tiposExplicitos[0];
        else if (tiposExplicitos.length > 1) avisos.push(`${nombre}: aparece como obligatorio y como deseable; se deja sin indicar.`);

        const base =
            g.find((x) => tipo !== "no_indicado" && x.tipo === tipo) || g.find((x) => nivel && x.nivel === nivel) || g[0];
        requisitos.push({
            competencia: slug,
            nombre,
            nivel,
            tipo,
            fragmento: base.fragmento,
            coincidencia: limpio.slice(base.ini, base.fin),
            menciones: g.length,
        });
    }

    return { version: VERSION_MOTOR, texto_limpio: limpio, redacciones, requisitos, descartadas, avisos };
}

// --------------------------------------------------------------
// Ayudas para completar la oferta (no cambian la detección de competencias)
// --------------------------------------------------------------

/** Minúsculas, sin tildes ni signos, espacios simples. Sirve para comparar textos. */
export function normalizarBase(texto) {
    return String(texto == null ? "" : texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

/** Igual que normalizarBase y además quita al final S.A.C., S.A.A., S.R.L., E.I.R.L.… (así «Bitel Perú SAC» ≈ «Bitel Perú»).
 *  Es la MISMA regla que usa la base de datos (private.normalizar_nombre): si se cambia una, se cambia la otra. */
export function normalizarNombre(texto) {
    return normalizarBase(texto).replace(/\s+(sac|saa|sa|srl|eirl|scrl|sas|ltda)$/, "");
}

/** ¿Alguno de los nombres aparece escrito (como palabras completas) en el texto? */
export function nombreEnTexto(texto, nombres) {
    const t = " " + normalizarBase(texto) + " ";
    return (nombres || []).some((n) => {
        const x = normalizarNombre(n);
        return x.length >= 2 && t.includes(" " + x + " ");
    });
}

const PALABRAS_DE_PUESTO =
    "egresad[oa]s?|bachiller(?:es)?|practicantes?|pasantes?|analistas?|asistentes?|auxiliar(?:es)?|ingenier[oa]s?|tecnic[oa]s?|jefes?|coordinador(?:a|es)?|supervisor(?:a|es)?|especialistas?|desarrollador(?:a|es)?|administrador(?:a|es)?|gerentes?|asesor(?:a|es)?|ejecutiv[oa]s?|operari[oa]s?|responsables?|consultor(?:a|es)?|investigador(?:a|es)?|docentes?|arquitect[oa]s?|contador(?:a|es)?|abogad[oa]s?|disenador(?:a|es)?|programador(?:a|es)?|residente|inspector(?:a|es)?|planner|trainee";
const RE_PUESTO_EN_LINEA = new RegExp("\\b(?:" + PALABRAS_DE_PUESTO + ")\\b");
const RE_PUESTO_AL_INICIO = new RegExp("^(?:" + PALABRAS_DE_PUESTO + ")\\b");
const RE_PUESTO_EN_FRASE = new RegExp(
    "(?:en busqueda de|busca(?:mos)?|requiere(?:mos)?|necesita(?:mos)?|contrata(?:mos)?|incorpora(?:mos)?|convoca(?:mos)?)\\s+(?:a\\s+)?(?:un|una|al|a la)?\\s*((?:" +
    PALABRAS_DE_PUESTO +
    ")\\b[^,.;:\\n]{0,90}?)(?=\\s+(?:altamente|con|para|que|quien|de manera|muy|y que)\\b|[,.;:\\n]|$)"
);
const TITULOS_GENERICOS = new Set([
    "descripcion de la oferta", "descripcion del puesto", "descripcion", "detalle de la oferta", "oferta de trabajo", "oferta laboral",
    "oferta de empleo", "resumen", "requisitos", "funciones", "perfil", "perfil del cargo", "nombre del cargo", "cargo", "puesto",
    "responsabilidades", "convocatoria", "oportunidad laboral", "se busca", "buscamos", "requerimos", "requerimientos", "beneficios",
]);

const ENCABEZADOS_DE_SECCION = new Set([
    "requisitos", "funciones", "responsabilidades", "perfil", "perfil del cargo", "requerimientos", "beneficios", "requisitos perfil",
    "funciones y responsabilidades", "que ofrecemos", "lo que ofrecemos", "ofrecemos",
]);
const RE_ENCABEZADO_DE_SECCION = /^(?:requisitos|funciones|responsabilidades|perfil|requerimientos|beneficios|que ofrecemos|lo que ofrecemos)\b/;
const RE_NO_ES_TITULO = /^(?:ser|tener|contar|no haber|cumplir|dominio|conocimientos?|experiencia|disponibilidad|manejo|estudiantes?)\b/;
const TERMINA_EN_CONECTOR = /\b(?:de|del|la|las|los|en|y|e|o|para|con|a)$/;

const RE_PREFIJO_DE_BUSQUEDA = /^(?:se busca(?:n)?|buscamos|requerimos|necesitamos|se requiere(?:n)?|solicitamos|contratamos|convocamos)\s+(?:a\s+)?(?:un|una)?\s*/i;

function limpiarPuesto(texto) {
    let t = texto.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[^\p{L}\p{N})]+$/u, "").trim();
    t = t.replace(RE_PREFIJO_DE_BUSQUEDA, "");
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

/**
 * Intenta reconocer el PUESTO real. Solo devuelve algo si está razonablemente claro; si no, devuelve "" y lo escribes tú.
 * Ignora encabezados genéricos como «Descripción de la oferta». Primero mira si una de las primeras líneas es un título;
 * si no, busca la frase «… en búsqueda de un Egresado de …».
 * @returns {string}
 */
export function sugerirPuesto(texto) {
    const original = typeof texto === "string" ? texto.normalize("NFC") : "";
    const lineas = original.split("\n").map((l) => l.trim()).filter(Boolean);

    // 1) Una de las primeras líneas (antes de «Requisitos», «Funciones»…) es un título corto con una palabra de puesto.
    //    Si el título quedó partido en varios renglones («Practicante de / Transformación / Digital»), se vuelve a unir.
    const limpiarLinea = (l) => l.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[\s:.\-–—]+$/u, "").trim();
    let vistas = 0;
    for (let i = 0; i < lineas.length; i++) {
        const limpia = limpiarLinea(lineas[i]);
        if (!limpia) continue;
        const base = normalizarBase(limpia);
        if (ENCABEZADOS_DE_SECCION.has(base) || RE_ENCABEZADO_DE_SECCION.test(base)) break; // lo que sigue ya no es el título
        if (TITULOS_GENERICOS.has(base)) continue;
        if (++vistas > 8) continue;
        // La línea misma debe parecer un título (así un logo o una marca suelta no se pega con el título de abajo)
        if (RE_NO_ES_TITULO.test(base) || !(RE_PUESTO_AL_INICIO.test(base) || RE_PUESTO_EN_LINEA.test(plegar(limpia)))) continue;
        let titulo = limpia;
        for (let j = i + 1, unidas = 0; j < lineas.length && unidas < 2; j++, unidas++) {
            const sig = limpiarLinea(lineas[j]);
            const sigBase = normalizarBase(sig);
            if (!sig || sig.split(/\s+/).length > 6 || ENCABEZADOS_DE_SECCION.has(sigBase) || TITULOS_GENERICOS.has(sigBase)) break;
            if (/[.!?:]$/.test(lineas[j].trim())) break;
            if (TERMINA_EN_CONECTOR.test(normalizarBase(titulo)) || TERMINA_EN_CONECTOR.test(sigBase)) titulo += " " + sig;
            else break;
        }
        const palabras = titulo.split(/\s+/);
        if (titulo.length > 110 || palabras.length > 14) continue;
        if (/[.!?]$/.test(lineas[i]) && palabras.length > 6) continue; // una oración, no un título
        const puesto = limpiarPuesto(titulo);
        if (puesto) return puesto;
    }

    // 2) «… se encuentra en búsqueda de un Egresado de Ingeniería Electrónica o Telecomunicaciones altamente capacitado …»
    const m = RE_PUESTO_EN_FRASE.exec(plegar(original));
    if (m) {
        const ini = m.index + m[0].indexOf(m[1]);
        const candidato = limpiarPuesto(original.slice(ini, ini + m[1].length));
        if (candidato.length >= 4 && candidato.length <= 110) return candidato;
    }
    return "";
}

// Pistas del propio texto sobre el sector de la empresa. Los identificadores son los de la tabla «sectores».
const PISTAS_DE_SECTOR = [
    ["banca", "banca|bancari[oa]s?|financier[oa]s?|seguros?|aseguradora|fintech|microfinanzas", "aseguradora|entidad financiera|institucion financiera"],
    ["telecomunicaciones", "telecomunicaciones|telecom|telefonia|operador(?:a)? movil", "operador de telecomunicaciones|operadora de telecomunicaciones"],
    ["consumo-masivo-retail", "retail|retailer|supermercados?|tiendas por departamento|consumo masivo|comercio minorista", "supermercados|tiendas por departamento"],
    ["energia-electricidad", "energia|electric[a-z]*|generacion electrica|distribucion electrica|hidroelectric[a-z]*", "distribuidora electrica|generadora electrica"],
    ["mineria-metalurgia", "mineri[a]|miner[oa]s?|metalurgi[a-z]*", "minera|empresa minera|compania minera"],
    ["petroleo-gas-petroquimica", "petroleo|hidrocarburos|gas natural|petroquimic[a-z]*", "petrolera|empresa petrolera"],
    ["construccion-infraestructura", "construccion|constructora|inmobiliari[a-z]*|obras civiles", "constructora|inmobiliaria"],
    ["industria-manufactura", "manufactura|metalmecanic[a-z]*|industria manufacturera|planta industrial", "empresa manufacturera|metalmecanica"],
    ["tecnologia-software", "tecnologia|software|servicios de ti|consultora tecnologica|transformacion digital", "empresa de software|software house|empresa tecnologica"],
    ["logistica-transporte", "logistica|transporte|operador logistico|cadena de suministro", "operador logistico|empresa de transporte"],
    ["consultoria-servicios-profesionales", "consultoria|consultora|auditoria|servicios profesionales", "consultora|firma de auditoria"],
    ["sector-publico-regulacion", "organismo regulador|entidad publica|sector publico|municipalidad|ministerio|gobierno regional", "municipalidad|organismo regulador|entidad publica"],
    ["educacion-investigacion", "universidad|instituto|colegio|educacion|investigacion", "universidad|instituto superior"],
    ["medio-ambiente-sostenibilidad", "medio ambiente|gestion ambiental|sostenibilidad|saneamiento", "consultora ambiental"],
    ["agroindustria-pesca", "agroindustri[a-z]*|agroexport[a-z]*|pesca|pesquera|acuicultura", "pesquera|agroexportadora|agroindustrial"],
    ["quimica-farmaceutica-textil", "farmaceutic[a-z]*|laboratorio|textil|quimic[a-z]*|cosmetic[a-z]*", "laboratorio farmaceutico|empresa textil"],
    ["arquitectura-urbanismo-diseno", "arquitectura|urbanismo", "estudio de arquitectura"],
].map(([slug, palabras, fuertes]) => [
    slug,
    // «empresa/compañía/grupo… (hasta 60 caracteres) palabra clave»: la oferta DICE qué tipo de empresa es.
    // O una pista fuerte por sí sola («una minera», «constructora»).
    new RegExp(
        "\\b(?:empresa|compania|organizacion|grupo|corporacion|firma|entidad|multinacional|operador(?:a)?)\\b[^.\\n]{0,60}?\\b(?:" + palabras + ")\\b|\\b(?:somos|es|una|un|la|el|nuestra|nuestro)\\s+(?:empresa\\s+)?(?:" + fuertes + ")\\b"
    ),
]);

/**
 * Pista sobre el sector de la empresa según lo que dice el texto («empresa líder en telecomunicaciones»). Solo devuelve algo
 * si UN solo sector encaja; si hay dudas, devuelve null. Es una SUGERENCIA: quien decide eres tú.
 * @returns {{slug: string, pista: string} | null}
 */
export function sugerirSector(texto) {
    const original = typeof texto === "string" ? texto.normalize("NFC") : "";
    const plegado = plegar(original);
    const aciertos = [];
    for (const [slug, re] of PISTAS_DE_SECTOR) {
        const m = re.exec(plegado);
        if (m) aciertos.push({ slug, pista: original.slice(m.index, m.index + m[0].length).replace(/\s+/g, " ").trim().slice(0, 90) });
    }
    return aciertos.length === 1 ? aciertos[0] : null;
}

// --------------------------------------------------------------
// Empresas: errores de tipeo y empresas registradas que aparecen en el texto
// --------------------------------------------------------------

/** Distancia de edición (cuántas letras hay que cambiar, quitar o agregar para pasar de un texto a otro). */
export function distanciaEdicion(a, b) {
    const x = String(a == null ? "" : a), y = String(b == null ? "" : b);
    if (x === y) return 0;
    if (!x.length) return y.length;
    if (!y.length) return x.length;
    let previa = Array.from({ length: y.length + 1 }, (_, j) => j);
    for (let i = 1; i <= x.length; i++) {
        const actual = [i];
        for (let j = 1; j <= y.length; j++) {
            actual[j] = Math.min(previa[j] + 1, actual[j - 1] + 1, previa[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
        }
        previa = actual;
    }
    return previa[y.length];
}

/**
 * Empresas registradas cuyo nombre o alias SE PARECE por escritura a lo escrito («Bittel» → Bitel, «Interbanck» → Interbank).
 * Los nombres de menos de 4 letras (EY, BCP) no se comparan por parecido: darían demasiados falsos avisos.
 * @param {string} texto
 * @param {{nombre: string, alias?: string[]}[]} empresas
 */
export function parecidos(texto, empresas) {
    const q = normalizarNombre(texto);
    if (q.length < 3) return [];
    return (empresas || []).filter((e) =>
        [e.nombre, ...(e.alias || [])].some((n) => {
            const x = normalizarNombre(n);
            if (x.length < 4 || x === q) return false;
            const umbral = Math.min(3, Math.max(1, Math.floor(Math.max(x.length, q.length) / 4)));
            return distanciaEdicion(q, x) <= umbral;
        })
    );
}

/**
 * Empresas registradas cuyo nombre o alias aparece ESCRITO en el texto, con la misma escritura o todo en mayúsculas (las tildes
 * no importan). Así «Claro» o «TASA» no saltan en frases como «es claro que…» o «tasa de interés». Solo SUGIERE: nunca elige.
 */
export function empresasEnTexto(texto, empresas) {
    const sinTildes = (t) => String(t == null ? "" : t).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const t = sinTildes(texto);
    const encontradas = [];
    for (const e of empresas || []) {
        for (const nombre of [e.nombre, ...(e.alias || [])]) {
            const n = sinTildes(nombre).trim();
            if (n.length < 2) continue;
            // misma escritura que en el catálogo, o TODO en mayúsculas (los títulos suelen venir así: «BITEL», «GRUPO GAM»)
            const aparece = [n, n.toUpperCase()].some((variante) => {
                const patron = variante.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
                return new RegExp("(?<![\\p{L}\\p{N}])" + patron + "(?![\\p{L}\\p{N}])", "u").test(t);
            });
            if (aparece) { encontradas.push(e); break; }
        }
    }
    return encontradas;
}