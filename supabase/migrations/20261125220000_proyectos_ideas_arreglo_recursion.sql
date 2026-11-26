-- ============================================================================
-- Arreglo: «infinite recursion detected in policy for relation proyectos_ideas» (error 42P17 al enviar una propuesta)
-- Causa: la política de insertar propuestas contaba las pendientes consultando la MISMA tabla dentro de la política.
-- Solución: el conteo pasa a una función SECURITY DEFINER en el esquema private (el mismo patrón ya usado en SIGA).
-- Ejecutar UNA vez en Supabase → SQL Editor. Es re-ejecutable.
-- ============================================================================

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.propuestas_pendientes(uid uuid)
returns integer
language sql
security definer
stable
set search_path = ''
as $$
    select count(*)::integer from public.proyectos_ideas where autor_id = uid and estado = 'pendiente';
$$;

revoke all on function private.propuestas_pendientes(uuid) from public, anon;
grant execute on function private.propuestas_pendientes(uuid) to authenticated;

drop policy if exists proyectos_ideas_usuario_insertar on public.proyectos_ideas;
create policy proyectos_ideas_usuario_insertar on public.proyectos_ideas
    for insert to authenticated
    with check (
        estado = 'pendiente'
        and origen = 'usuario'
        and autor_id = (select auth.uid())
        and private.propuestas_pendientes((select auth.uid())) < 3
    );
