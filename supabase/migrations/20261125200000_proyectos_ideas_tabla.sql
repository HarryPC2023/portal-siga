-- ============================================================================
-- Proyectos Prácticos — tabla de ideas (paso 1 de 2: estructura y seguridad)
-- Ejecutar UNA vez en Supabase → SQL Editor. Después ejecutar los archivos 02_semilla_*.sql.
-- Es re-ejecutable (usa IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================================

create table if not exists public.proyectos_ideas (
    id          text primary key check (id ~ '^[a-z0-9-]+$' and length(id) <= 80),
    area        text not null,
    areas2      text[] not null default '{}',
    titulo      text not null check (length(titulo) between 5 and 300),
    resumen     text not null,
    tipo        text not null,
    tiempo      text not null,
    horas       numeric not null,
    etiquetas   text[] not null default '{}',
    intencion   text[] not null default '{}',
    datos       text not null check (datos in ('ficticios', 'publicos', 'propios')),
    prog        text check (prog in ('sin', 'opcional', 'incluida')),
    busca       text not null default '',
    ficha       jsonb not null,                       -- la ficha completa (problema, alcance, ampliaciones, etc.); solo se pide al abrir una idea
    estado      text not null default 'publicada' check (estado in ('pendiente', 'publicada', 'rechazada')),
    origen      text not null default 'curada' check (origen in ('curada', 'usuario')),
    autor_id    uuid references auth.users (id) on delete set null,
    orden       integer not null default 0,           -- orden dentro de su área (el de los archivos)
    creado_en   timestamptz not null default now(),
    actualizado_en timestamptz not null default now()
);

-- Índices (también cubren la llave foránea autor_id, para no recibir avisos del Performance Advisor).
create index if not exists proyectos_ideas_area_idx    on public.proyectos_ideas (area, orden);
create index if not exists proyectos_ideas_estado_idx  on public.proyectos_ideas (estado);
create index if not exists proyectos_ideas_autor_idx   on public.proyectos_ideas (autor_id);
create index if not exists proyectos_ideas_areas2_idx  on public.proyectos_ideas using gin (areas2);

-- Mantiene actualizado_en al editar. search_path vacío: evita el aviso «mutable search_path».
create or replace function public.proyectos_ideas_tocar()
returns trigger language plpgsql set search_path = '' as $$
begin
    new.actualizado_en := now();
    return new;
end $$;

drop trigger if exists proyectos_ideas_tocar on public.proyectos_ideas;
create trigger proyectos_ideas_tocar before update on public.proyectos_ideas
    for each row execute function public.proyectos_ideas_tocar();

-- Seguridad ------------------------------------------------------------------
alter table public.proyectos_ideas enable row level security;

revoke all on public.proyectos_ideas from anon, authenticated;
grant select on public.proyectos_ideas to anon, authenticated;
grant insert, update, delete on public.proyectos_ideas to authenticated;   -- las políticas de abajo limitan quién puede de verdad

-- Cualquiera (con o sin sesión) ve solo las ideas publicadas.
drop policy if exists proyectos_ideas_leer_publicas on public.proyectos_ideas;
create policy proyectos_ideas_leer_publicas on public.proyectos_ideas
    for select to anon, authenticated
    using (estado = 'publicada');

-- Tú (el administrador) ves todo: pendientes y rechazadas incluidas.
-- Se identifica por el correo de la sesión, igual que desarrollo-acceso.js.
drop policy if exists proyectos_ideas_admin_leer on public.proyectos_ideas;
create policy proyectos_ideas_admin_leer on public.proyectos_ideas
    for select to authenticated
    using (lower((select auth.jwt() ->> 'email')) = 'harrypc2021@hotmail.com');

drop policy if exists proyectos_ideas_admin_insertar on public.proyectos_ideas;
create policy proyectos_ideas_admin_insertar on public.proyectos_ideas
    for insert to authenticated
    with check (lower((select auth.jwt() ->> 'email')) = 'harrypc2021@hotmail.com');

drop policy if exists proyectos_ideas_admin_editar on public.proyectos_ideas;
create policy proyectos_ideas_admin_editar on public.proyectos_ideas
    for update to authenticated
    using (lower((select auth.jwt() ->> 'email')) = 'harrypc2021@hotmail.com')
    with check (lower((select auth.jwt() ->> 'email')) = 'harrypc2021@hotmail.com');

drop policy if exists proyectos_ideas_admin_borrar on public.proyectos_ideas;
create policy proyectos_ideas_admin_borrar on public.proyectos_ideas
    for delete to authenticated
    using (lower((select auth.jwt() ->> 'email')) = 'harrypc2021@hotmail.com');

-- (Más adelante, para las ideas de los usuarios se AGREGA una política de insert con estado = 'pendiente' y autor_id = auth.uid(); no se cambia nada de lo de arriba.)
