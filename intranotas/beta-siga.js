// beta-siga.js — Interruptor de las funciones nuevas de Intranotas (análisis
// académico). Mientras se prueban, solo las ve quien esté en BETA_UIDS.
// Es un interruptor de INTERFAZ, no de seguridad: todo lo nuevo se calcula
// sobre las notas del propio alumno, así que no hay datos de otros en juego.
//
// Para abrirlo a todos más adelante: que esbeta() devuelva siempre true.
// Para que otra persona pruebe: agregar su id (user.id de Supabase) a la lista.
//
// Truco de prueba: abrir notas.html?sinbeta=1 muestra la página como la ven
// los demás (sin ninguna función nueva), sin tener que cerrar sesión.

const BETA_UIDS = [
    'f544dbae-fc6f-4fe6-9b86-fc72aef462a1', // Harry (mismo id que ADMIN_UID en js/admin.js)
];

export function esBeta(usuario) {
    try {
        if (new URLSearchParams(location.search).get('sinbeta') === '1') return false;
    } catch { /* sin URLSearchParams: se sigue */ }
    return !!usuario && BETA_UIDS.includes(usuario.id);
}
