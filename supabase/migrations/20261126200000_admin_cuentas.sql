-- Admin: lista de TODAS las cuentas de SIGA (auth.users), tengan perfil o no.
-- Sirve para (1) mostrar el total real de usuarios en Vista Intranotas y
-- (2) elegir destinatarios de avisos aunque la cuenta aún no tenga perfil.
-- Solo responde al admin (Harry); a cualquier otro le da "No autorizado".
-- Re-ejecutable. Mismo patrón de siempre: lógica elevada en `private`, envoltorio en `public`.

create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.admin_cuentas()
returns table (
  user_id uuid,
  email text,
  nombre_cuenta text,
  creado_en timestamptz,
  ultimo_acceso timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is distinct from 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1'::uuid then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  return query
    select u.id,
           u.email::text,
           nullif(btrim(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')), ''),
           u.created_at,
           u.last_sign_in_at
      from auth.users u
     order by u.created_at, u.id;
end;
$$;

revoke all on function private.admin_cuentas() from public, anon;
grant execute on function private.admin_cuentas() to authenticated;

create or replace function public.admin_cuentas()
returns table (
  user_id uuid,
  email text,
  nombre_cuenta text,
  creado_en timestamptz,
  ultimo_acceso timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$ select * from private.admin_cuentas(); $$;

revoke all on function public.admin_cuentas() from public, anon;
grant execute on function public.admin_cuentas() to authenticated;
