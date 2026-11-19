// js/desarrollo-reglas.js — Reglas del semáforo del CV Profesional.
//
// Archivo PURO: sin DOM, sin red, sin SigaEstado. Recibe los datos del CV y devuelve qué le falta.
// Así se puede probar sin abrir la página y se pueden cambiar reglas y mensajes sin tocar el constructor.
//
// El semáforo NO usa IA y NO verifica si lo escrito es verdad ni si está bien redactado:
// solo comprueba que el alumno haya completado los campos y dado información de respaldo.
//
//   rojo  → falta información importante
//   ámbar → hay información, pero faltan campos de respaldo
//   verde → los campos requeridos están completos
//   gris  → información opcional
//
// Forma esperada de `cv`:
//   { datos, formacion, ajustes, proyectos[], habilidades[], certificaciones[], logros[], experiencias[] }

export const ROJO = 'rojo';
export const AMBAR = 'ambar';
export const VERDE = 'verde';
export const GRIS = 'gris';

const txt = (v) => (typeof v === 'string' ? v.trim() : '');

// ───────────── validaciones sencillas (no exigen los campos opcionales) ─────────────
export function validarCorreo(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(txt(v));
}

export function validarTelefono(v) {
    const t = txt(v).replace(/[\s().-]/g, '');
    return /^\+?\d{7,15}$/.test(t);
}

// Acepta "linkedin.com/in/ana", "https://www.linkedin.com/in/ana", "github.com/ana"…
// Un campo vacío es válido (los enlaces son opcionales).
export function validarEnlace(v, dominio) {
    const t = txt(v).toLowerCase();
    if (!t) return true;
    const sinProtocolo = t.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return sinProtocolo.startsWith(dominio + '/') && sinProtocolo.length > dominio.length + 1 && !/\s/.test(sinProtocolo);
}

// Enlace web que se mostrará como enlace clicable: SOLO http o https (nunca javascript:, data:, mailto:…).
export function esEnlaceWeb(v) {
    const x = txt(v);
    if (!x || /\s/.test(x)) return false;
    try { const u = new URL(x); return u.protocol === 'https:' || u.protocol === 'http:'; } catch (e) { return false; }
}

// null = nada que decir. { nivel: 'error' | 'aviso', mensaje } = qué mostrarle al alumno junto al campo.
export function analizarEnlaceWeb(v) {
    const x = txt(v);
    if (!x) return null;
    if (!esEnlaceWeb(x)) return { nivel: 'error', mensaje: 'Escribe una dirección completa que empiece con http:// o https://' };
    if (x.toLowerCase().startsWith('http://')) return { nivel: 'aviso', mensaje: 'Si existe, prefiere el enlace seguro (https).' };
    return null;
}

// ───────────── ayudas para saber si un elemento está completo ─────────────
export const proyectoTieneContenido = (p) => !!(txt(p.nombre) || txt(p.queHiciste) || txt(p.herramientas) || txt(p.evidencia));
export const proyectoCompleto = (p) => !!(txt(p.nombre) && txt(p.queHiciste) && txt(p.herramientas));   // el resultado/evidencia es opcional

function faltantesProyecto(p) {
    const f = [];
    if (!txt(p.nombre)) f.push('el nombre');
    if (!txt(p.queHiciste)) f.push('la descripción');
    if (!txt(p.herramientas)) f.push('las herramientas o recursos utilizados');
    return f;
}

const unir = (lista) => (lista.length <= 1 ? (lista[0] || '') : lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1]);

// ───────────── una función por sección ─────────────
function evaluarDatos(d = {}) {
    const faltan = [];
    if (!txt(d.nombre)) faltan.push('tu nombre completo');
    if (!txt(d.correo)) faltan.push('tu correo');
    if (!txt(d.telefono)) faltan.push('un teléfono');
    if (faltan.length) return { estado: ROJO, mensaje: `Falta ${unir(faltan)}. Son los datos con los que una empresa puede contactarte.` };

    if (!validarCorreo(d.correo)) return { estado: ROJO, mensaje: 'Revisa tu correo: no parece una dirección válida.' };

    const dudas = [];
    if (!validarTelefono(d.telefono)) dudas.push('tu teléfono');
    if (!validarEnlace(d.linkedin, 'linkedin.com')) dudas.push('el enlace de LinkedIn');
    if (!validarEnlace(d.github, 'github.com')) dudas.push('el enlace de GitHub');
    if (dudas.length) return { estado: AMBAR, mensaje: `Revisa ${unir(dudas)}: no parece tener el formato esperado.` };

    return { estado: VERDE, mensaje: 'Información de contacto completa.' };
}

function evaluarFormacion(f = {}) {
    const faltan = [];
    if (!txt(f.universidad)) faltan.push('tu universidad');
    if (!txt(f.carrera)) faltan.push('tu carrera');
    if (faltan.length) return { estado: ROJO, mensaje: `Falta ${unir(faltan)}.` };
    return { estado: VERDE, mensaje: 'Formación académica registrada.' };
}

function evaluarProyectos(lista = []) {
    const reales = lista.filter(proyectoTieneContenido);
    if (!reales.length) {
        return { estado: GRIS, mensaje: 'Recomendado para tu primer CV. Aún no tienes proyectos: puedes empezar con un trabajo de un curso, aunque sea parcial.' };
    }
    const incompletos = reales.filter((p) => !proyectoCompleto(p));
    if (incompletos.length) {
        const p = incompletos[0];
        const nombre = txt(p.nombre) ? `«${txt(p.nombre)}»` : 'sin nombre';
        return { estado: AMBAR, mensaje: `Completa ${unir(faltantesProyecto(p))} del proyecto ${nombre}.` };
    }
    if (reales.length === 1) {
        return { estado: VERDE, mensaje: 'Tienes un proyecto completo. Si tienes otro, puedes añadirlo para mostrar más de lo que sabes hacer.' };
    }
    return { estado: VERDE, mensaje: `Tienes ${reales.length} proyectos completos.` };
}

function evaluarHabilidades(lista = []) {
    const con = lista.filter((h) => txt(h.nombre));
    const tecnicas = con.filter((h) => h.categoria === 'tecnica').length;
    const herramientas = con.filter((h) => h.categoria === 'herramienta').length;
    if (!tecnicas && !herramientas) {
        return { estado: GRIS, mensaje: 'Recomendado. Agrega conocimientos o herramientas concretas que hayas utilizado (por ejemplo Excel, AutoCAD, Python o un método de análisis).' };
    }
    if (!herramientas) {
        return { estado: VERDE, mensaje: 'Conocimientos registrados. Si usaste herramientas concretas, puedes añadirlas.' };
    }
    return { estado: VERDE, mensaje: 'Conocimientos y herramientas registrados.' };
}

function evaluarCertificaciones(lista = []) {
    const con = lista.filter((c) => txt(c.nombre) || txt(c.institucion) || txt(c.anio) || txt(c.enlace));
    if (!con.length) return { estado: GRIS, mensaje: 'Opcional. No necesitas acumular certificados: una formación relacionada con lo que buscas puede aportar valor a tu CV.' };
    const sinInstitucion = con.find((c) => !txt(c.nombre) || !txt(c.institucion));
    if (sinInstitucion) {
        const nombre = txt(sinInstitucion.nombre) ? `«${txt(sinInstitucion.nombre)}»` : 'una formación sin nombre';
        return { estado: AMBAR, mensaje: `Completa ${!txt(sinInstitucion.nombre) ? 'el nombre' : 'quién la dio'} de ${nombre}.` };
    }
    const malEnlace = con.find((c) => txt(c.enlace) && !esEnlaceWeb(c.enlace));
    if (malEnlace) return { estado: AMBAR, mensaje: `Revisa el enlace de «${txt(malEnlace.nombre)}»: debe empezar con http:// o https://.` };
    return { estado: VERDE, mensaje: con.length === 1 ? 'Formación complementaria registrada.' : `${con.length} formaciones complementarias registradas.` };
}

function evaluarLogros(lista = []) {
    const con = lista.filter((l) => txt(l.texto));
    if (!con.length) {
        return { estado: GRIS, mensaje: 'Opcional. Un logro es lo que te distingue: puedes empezar con las ayudas del paso.' };
    }
    return { estado: VERDE, mensaje: con.length === 1 ? 'Logro registrado.' : `${con.length} logros registrados.` };
}

function evaluarExperiencia(lista = [], ajustes = {}) {
    const con = lista.filter((e) => txt(e.puesto) || txt(e.queHiciste));
    if (con.length) return { estado: GRIS, mensaje: `${con.length === 1 ? '1 experiencia registrada' : con.length + ' experiencias registradas'}. Es opcional.` };
    if (ajustes && ajustes.sinExperiencia) return { estado: GRIS, mensaje: 'Opcional. Marcaste que aún no has trabajado: no es necesaria para tus primeras prácticas.' };
    return { estado: GRIS, mensaje: 'Opcional. No es necesaria para tus primeras prácticas.' };
}

// ───────────── resultado completo ─────────────
export const NOMBRES_SECCION = {
    datos: 'Datos básicos', formacion: 'Formación', proyectos: 'Proyectos',
    habilidades: 'Habilidades', certificaciones: 'Certificaciones', logros: 'Logros', experiencia: 'Experiencia',
};

export function evaluarCV(cv) {
    const c = cv || {};
    const lista = (x) => (Array.isArray(x) ? x.filter(Boolean) : []);   // null/undefined/valores raros → lista vacía
    const r = {
        datos: evaluarDatos(c.datos || {}),
        formacion: evaluarFormacion(c.formacion || {}),
        proyectos: evaluarProyectos(lista(c.proyectos)),
        habilidades: evaluarHabilidades(lista(c.habilidades)),
        certificaciones: evaluarCertificaciones(lista(c.certificaciones)),
        logros: evaluarLogros(lista(c.logros)),
        experiencia: evaluarExperiencia(lista(c.experiencias), c.ajustes || {}),
    };
    const secciones = Object.keys(NOMBRES_SECCION).map((id) => ({ id, nombre: NOMBRES_SECCION[id], ...r[id] }));
    const resumen = { rojo: 0, ambar: 0, verde: 0, gris: 0 };
    secciones.forEach((s) => { resumen[s.estado] += 1; });
    // "listo" = ninguna sección obligatoria en rojo ni ámbar. Es solo informativo: NUNCA bloquea la descarga.
    const listo = resumen.rojo === 0 && resumen.ambar === 0;
    return { secciones, resumen, listo };
}
