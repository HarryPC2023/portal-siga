-- Proyectos Prácticos — «Idea de …» en la ficha publicada.
-- Devuelve el nombre del autor SOLO si la idea está publicada, es de un usuario, aceptó publicarla
-- y marcó «mostrar mi nombre». Si no hay nombre en su perfil devuelve null (la ficha no muestra nada).
-- Re-ejecutable. Mismo patrón de siempre: lógica elevada en `private`, envoltorio en `public`.

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.idea_autor_nombre(p_id text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(btrim(p.nombre), '')
    from public.proyectos_ideas i
    join public.perfiles_usuario p on p.user_id = i.autor_id
   where i.id = p_id
     and i.origen = 'usuario'
     and i.estado = 'publicada'
     and i.acepta_publicar
     and i.mostrar_autor
   limit 1;
$$;

revoke all on function private.idea_autor_nombre(text) from public, anon;
grant execute on function private.idea_autor_nombre(text) to authenticated;

create or replace function public.proyectos_autor_idea(p_id text)
returns text
language sql
stable
security invoker
set search_path = ''
as $$ select private.idea_autor_nombre(p_id); $$;

revoke all on function public.proyectos_autor_idea(text) from public, anon;
grant execute on function public.proyectos_autor_idea(text) to authenticated;
