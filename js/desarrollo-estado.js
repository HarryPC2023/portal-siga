// js/desarrollo-estado.js — Lo que guarda «Desarrollo profesional» en la cuenta del alumno, sobre SigaEstado.
//
// No crea tablas ni mecanismos nuevos: usa el módulo «desarrollo» de SigaEstado
// (una fila por elemento en estado_usuario, sincronizada entre PC y celular).
//
// Claves del módulo «desarrollo»:
//   cv:datos            → { nombre, correo, telefono, linkedin, github, distrito }
//   cv:formacion        → { universidad, carrera, ingreso, cursos[], promedio }
//   cv:ajustes          → { sinExperiencia }
//   cv:perfil           → { texto }   (la presentación; lo que el alumno deja en el campo es lo que se guarda)
//   proyecto:<id>       → { nombre, queHiciste, herramientas, evidencia, origen, orden }
//   habilidad:<id>      → { categoria: 'tecnica'|'herramienta'|'idioma', nombre, nivel, orden }
//   certificacion:<id>  → { nombre, institucion, anio, tipo, enlace, orden }   (tipo y enlace opcionales)
//   logro:<id>          → { texto, respaldo, orden }
//   experiencia:<id>    → { puesto, queHiciste, orden }
//
// Cada proyecto, habilidad, logro o experiencia es UN elemento con su propio id estable:
// editar uno no reemplaza a los demás, y agregar o borrar desde otro dispositivo no los pisa.
//
// Se recibe `estado` (SigaEstado) por parámetro para poder probar este archivo sin la nube.

export const MODULO = 'desarrollo';

export const TIPOS = {
    proyecto: 'proyecto:',
    habilidad: 'habilidad:',
    certificacion: 'certificacion:',
    logro: 'logro:',
    experiencia: 'experiencia:',
};

export const CLAVE_DATOS = 'cv:datos';
export const CLAVE_FORMACION = 'cv:formacion';
export const CLAVE_AJUSTES = 'cv:ajustes';
export const CLAVE_PERFIL = 'cv:perfil';

const objeto = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

export function crearDesarrollo(estado) {
    // Lo último que ESTE dispositivo intentó guardar por clave, solo en memoria.
    // Sirve para ofrecer «Recuperar la mía» si otro dispositivo cambió el mismo elemento a la vez.
    const ultimoEnviado = new Map();

    function claveDe(tipo, id) {
        if (!TIPOS[tipo]) throw new Error('desarrollo: tipo desconocido ' + tipo);
        return TIPOS[tipo] + id;
    }

    function guardarClave(clave, valor) {
        try {
            // conservar:true → si hay un conflicto, el servidor guarda la versión rechazada 7 días (red de seguridad).
            estado.guardar(MODULO, clave, valor, { conservar: true });
            ultimoEnviado.set(clave, JSON.parse(JSON.stringify(valor)));
            return true;
        } catch (e) {
            console.error('desarrollo: no se pudo guardar', clave, e);
            return false;
        }
    }

    function coleccion(tipo) {
        const prefijo = TIPOS[tipo];
        return estado.listar(MODULO, prefijo)
            .map(({ clave, valor }) => ({ ...objeto(valor), id: clave.slice(prefijo.length) }))
            .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0) || (a.id < b.id ? -1 : 1));
    }

    function leerCV() {
        return {
            datos: objeto(estado.leer(MODULO, CLAVE_DATOS)),
            formacion: objeto(estado.leer(MODULO, CLAVE_FORMACION)),
            ajustes: objeto(estado.leer(MODULO, CLAVE_AJUSTES)),
            perfil: objeto(estado.leer(MODULO, CLAVE_PERFIL)),
            proyectos: coleccion('proyecto'),
            habilidades: coleccion('habilidad'),
            certificaciones: coleccion('certificacion'),
            logros: coleccion('logro'),
            experiencias: coleccion('experiencia'),
        };
    }

    const leerClave = (clave) => estado.leer(MODULO, clave);

    function nuevoId() {
        return (globalThis.crypto && globalThis.crypto.randomUUID)
            ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 16)
            : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    // Crea un elemento nuevo al final de su colección. Devuelve el elemento (con su id).
    function nuevoElemento(tipo, base = {}) {
        const existentes = coleccion(tipo);
        const orden = existentes.reduce((m, e) => Math.max(m, Number(e.orden) || 0), 0) + 1;
        const id = nuevoId();
        const valor = { ...base, orden };
        delete valor.id;
        guardarClave(claveDe(tipo, id), valor);
        return { ...valor, id };
    }

    function guardarElemento(tipo, el) {
        const { id, ...valor } = el;
        if (!id) throw new Error('desarrollo: el elemento no tiene id');
        return guardarClave(claveDe(tipo, id), valor);
    }

    function quitarElemento(tipo, id) {
        try { estado.borrar(MODULO, claveDe(tipo, id)); ultimoEnviado.delete(claveDe(tipo, id)); return true; }
        catch (e) { console.error('desarrollo: no se pudo borrar', e); return false; }
    }

    // Avisos de cambios que llegan de OTRO dispositivo u otra pestaña (los propios se ignoran).
    function alCambiar(fn) {
        return estado.alCambiar(MODULO, null, (ev) => { if (ev.origen !== 'local') fn(ev); });
    }

    // Conflicto real: el mismo elemento se cambió en dos dispositivos a la vez y ganó la nube.
    function alConflicto(fn) {
        return estado.alConflicto((ev) => {
            if (ev.modulo !== MODULO) return;
            fn({ ...ev, tieneMia: ultimoEnviado.has(ev.clave) });
        });
    }

    // Vuelve a guardar lo que este dispositivo había escrito (ya sobre la versión nueva de la nube).
    function recuperarMia(clave) {
        if (!ultimoEnviado.has(clave)) return false;
        return guardarClave(clave, ultimoEnviado.get(clave));
    }

    return {
        leerCV, leerClave, guardarClave, nuevoElemento, guardarElemento, quitarElemento,
        alCambiar, alConflicto, recuperarMia, claveDe,
        estadoSync: () => estado.estado(),
        sincronizar: () => estado.sincronizar(),
    };
}
