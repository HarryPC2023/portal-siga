// js/perfil-siga.js — Pantalla "Completa tu perfil" (nombre, código, carrera)
// Se muestra una sola vez, la primera vez que el usuario entra sin tener
// su fila en perfiles_usuario (o con datos incompletos).
import { supabase, obtenerSesion, montarNavUsuario } from './auth-siga.js?v=8';

document.addEventListener('DOMContentLoaded', async () => {
  montarNavUsuario();

  const sesion = await obtenerSesion();
  if (!sesion) return; // esta página aún no está gateada por sesión (eso es el Paso 4)

  const { data: perfil, error } = await supabase
    .from('perfiles_usuario')
    .select('nombre, codigo_estudiante, carrera')
    .eq('user_id', sesion.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error revisando perfil:', error);
    return;
  }

  const completo = perfil && perfil.nombre && perfil.codigo_estudiante && perfil.carrera;
  if (completo) return;

  const modal = document.getElementById('modalPerfil');
  const form = document.getElementById('formPerfil');
  const msg = document.getElementById('perfilMsg');
  if (!modal || !form) return;

  modal.classList.add('visible');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form).entries());
    const codigo = datos.codigo_estudiante.trim().toUpperCase();
    const nombre = datos.nombre.trim();

    const { error: errUpsert } = await supabase
      .from('perfiles_usuario')
      .upsert({
        user_id: sesion.user.id,
        nombre,
        codigo_estudiante: codigo,
        carrera: datos.carrera,
      });

    if (errUpsert) {
      msg.textContent = errUpsert.message?.includes('duplicate')
        ? 'Ese código de estudiante ya está registrado con otra cuenta.'
        : 'No se pudo guardar tu perfil. Intenta de nuevo.';
      return;
    }

    modal.classList.remove('visible');
  });
});