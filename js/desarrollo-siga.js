// js/desarrollo-siga.js — Qué datos de SIGA puede copiar el paso «Formación» del CV.
//
// Solo LEE. El CV nunca escribe en el perfil académico: este archivo no tiene ninguna operación de escritura.
// Se usa la primera vez que el alumno abre Formación y cuando pulsa «Restablecer datos de SIGA».

const UNIVERSIDAD = 'Universidad Nacional de Ingeniería';   // SIGA es hoy el portal de la UNI

// Año de ingreso = 4 primeros dígitos del código UNI, solo si es un año válido (misma regla que Intranotas).
export function anioDeIngreso(codigo, hoy = new Date()) {
    const c = String(codigo || '').trim();
    if (!/^\d{4}/.test(c)) return '';
    const anio = Number(c.slice(0, 4));
    return anio >= 2000 && anio <= hoy.getFullYear() ? String(anio) : '';
}

// `resolverCarrera(idDeCarrera)` es opcional: devuelve el nombre completo de la carrera (ej. «Ingeniería de Sistemas»).
// Si no se pasa, la carrera queda vacía para que el alumno la escriba.
export async function leerDatosSiga(supabase, { resolverCarrera } = {}) {
    const vacio = { universidad: UNIVERSIDAD, carrera: '', ingreso: '' };
    try {
        const { data: sesion } = await supabase.auth.getSession();
        const uid = sesion && sesion.session && sesion.session.user && sesion.session.user.id;
        if (!uid) return vacio;
        const { data: perfil, error } = await supabase.from('perfiles_usuario').select('*').eq('user_id', uid).maybeSingle();
        if (error || !perfil) return vacio;
        const carrera = typeof resolverCarrera === 'function' && perfil.carrera ? (resolverCarrera(perfil.carrera) || '') : '';
        return { universidad: UNIVERSIDAD, carrera, ingreso: anioDeIngreso(perfil.codigo_estudiante) };
    } catch (e) {
        console.warn('desarrollo: no se pudieron leer los datos de SIGA', e);
        return vacio;
    }
}
