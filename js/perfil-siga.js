// js/perfil-siga.js — Pantalla "Completa tu perfil" (nombre, código, carrera)
// Se muestra una sola vez, la primera vez que el usuario entra sin tener
// su fila en perfiles_usuario (o con datos incompletos).
import { supabase, requerirSesion, montarNavUsuario } from './auth-siga.js?v=9';

document.addEventListener('DOMContentLoaded', async () => {
  montarNavUsuario();

  const sesion = await requerirSesion('');
  if (!sesion) return; // requerirSesion ya redirige a index.html si no hay cuenta

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

  const selectCarrera = inicializarSelectPersonalizado({
    triggerId: 'carreraTrigger', textoId: 'carreraTriggerTexto',
    listaId: 'carreraLista', valorId: 'carreraValor',
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectCarrera.valor.value) {
      msg.textContent = 'Elige tu carrera antes de guardar.';
      return;
    }

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
        foto_url: sesion.user.user_metadata?.avatar_url || sesion.user.user_metadata?.picture || null,
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