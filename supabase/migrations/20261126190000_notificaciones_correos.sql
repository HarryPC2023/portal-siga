-- Registro de a quién se le envió cada correo de una notificación.
-- Sirve para: (1) no duplicar correos al reenviar, (2) completar "los que faltan"
-- cuando se acaba el cupo diario de Brevo (300/día) y (3) contar el cupo usado.
-- Solo la Edge Function (service role) escribe aquí; solo el admin puede leer.
-- notificacion_id va como texto para no depender del tipo de notificaciones.id.

create table if not exists public.notificaciones_correos (
  id bigint generated always as identity primary key,
  notificacion_id text not null,
  user_id uuid not null,
  estado text not null check (estado in ('enviado', 'error')),
  detalle text,
  creado_en timestamptz not null default now(),
  unique (notificacion_id, user_id)
);

create index if not exists notificaciones_correos_estado_fecha_idx
  on public.notificaciones_correos (estado, creado_en);

alter table public.notificaciones_correos enable row level security;

revoke all on public.notificaciones_correos from anon;
revoke insert, update, delete on public.notificaciones_correos from authenticated;

drop policy if exists "admin lee correos de notificaciones" on public.notificaciones_correos;
create policy "admin lee correos de notificaciones"
  on public.notificaciones_correos
  for select
  to authenticated
  using ((select auth.uid()) = 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1'::uuid);
