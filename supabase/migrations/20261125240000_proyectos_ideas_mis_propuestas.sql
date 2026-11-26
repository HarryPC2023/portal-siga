-- Proyectos Prácticos — «Mis propuestas» (pestaña del perfil): la persona ve el estado de lo que propuso,
-- puede RETIRAR una propuesta en revisión y ELIMINAR de SU lista una rechazada.
-- Re-ejecutable. Sigue el mismo patrón que el resto de SIGA: la lógica con permisos elevados vive en el
-- esquema `private` y la API solo ve funciones «envoltorio» (así el Security Advisor no marca avisos).
--
--   · Retirar   = borra la propuesta (solo si sigue «pendiente» y es de quien la pide). Libera un lugar del límite de 3.
--   · Eliminar  = solo la oculta de la lista de la persona (oculta_autor). Tú la sigues viendo en Admin → Proyectos
--                 hasta que la borres tú. Las rechazadas no cuentan para el límite de 3.
--   · Una propuesta publicada no se puede retirar ni ocultar desde el perfil (ya es parte del catálogo).

alter table public.proyectos_ideas
  add column if not exists oculta_autor boolean not null default false;

create schema if not exists private;
grant usage on schema private to authenticated;

-- ───────────── Funciones con permisos elevados (no son visibles desde la API) ─────────────
create or replace function private.propuesta_retirar(p_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  delete from public.proyectos_ideas
   where id = p_id
     and origen = 'usuario'
     and estado = 'pendiente'
     and autor_id = (select auth.uid());
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

create or replace function private.propuesta_ocultar(p_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  update public.proyectos_ideas
     set oculta_autor = true
   where id = p_id
     and origen = 'usuario'
     and estado = 'rechazada'
     and autor_id = (select auth.uid());
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

revoke all on function private.propuesta_retirar(text) from public, anon;
revoke all on function private.propuesta_ocultar(text) from public, anon;
grant execute on function private.propuesta_retirar(text) to authenticated;
grant execute on function private.propuesta_ocultar(text) to authenticated;

-- ───────────── Envoltorios que sí ve la API (sin permisos elevados) ─────────────
create or replace function public.proyectos_retirar_propuesta(p_id text)
returns boolean
language sql
security invoker
set search_path = ''
as $$ select private.propuesta_retirar(p_id); $$;

create or replace function public.proyectos_ocultar_propuesta(p_id text)
returns boolean
language sql
security invoker
set search_path = ''
as $$ select private.propuesta_ocultar(p_id); $$;

revoke all on function public.proyectos_retirar_propuesta(text) from public, anon;
revoke all on function public.proyectos_ocultar_propuesta(text) from public, anon;
grant execute on function public.proyectos_retirar_propuesta(text) to authenticated;
grant execute on function public.proyectos_ocultar_propuesta(text) to authenticated;
