-- ============================================================
-- SIGA · Sección Opiniones — Schema definitivo
-- Basado en "trabajo sección Opiniones.docx", con ajustes acordados
-- con Harry (ver notas al final del archivo).
-- ============================================================

-- ================= EXTENSIONES =================
-- Para búsqueda tolerante a tildes/typos (profesores, cursos)
create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- ================= PROFESORES =================

create table profesores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique
);

create index idx_profesores_nombre_trgm on profesores using gin (nombre gin_trgm_ops);

-- ================= CURSOS =================

create table cursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo text,                          -- siglas cortas p.ej. "DBD" (opcional, para UI)
  carrera text check (carrera in ('sistemas', 'industrial', 'software')),
  -- null = curso común a las 3 carreras
  ciclo_ref smallint check (ciclo_ref between 1 and 10),
  -- referencial/informativo: el mismo curso puede dictarse en distintos
  -- ciclos según la promoción, así que esto NO es una identidad fija
  -- (ver nota abajo). No se usa en ningún unique constraint.
  slug text not null unique
);

create index idx_cursos_nombre_trgm on cursos using gin (nombre gin_trgm_ops);

-- ================= RELACIÓN PROFESOR-CURSO =================

create table profesor_curso (
  id uuid primary key default gen_random_uuid(),
  profesor_id uuid not null references profesores(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  activo boolean not null default true,
  -- false = el profesor ya no dicta este curso (se conserva el historial
  -- de opiniones/perfil en vez de borrar la fila)
  unique (profesor_id, curso_id)
);

create index idx_profesor_curso_profesor on profesor_curso(profesor_id);
create index idx_profesor_curso_curso on profesor_curso(curso_id);

-- ================= PERFILES (curaduría SIGA) =================

create table perfiles_profesor (
  id uuid primary key default gen_random_uuid(),
  profesor_curso_id uuid not null unique references profesor_curso(id) on delete cascade,
  resumen text not null,
  que_esperar text not null,
  exigencia smallint not null check (exigencia between 1 and 5),
  carga_trabajo smallint not null check (carga_trabajo between 1 and 5),
  ritmo smallint not null check (ritmo between 1 and 5),      -- solo curaduría, nunca viene de opiniones
  claridad smallint not null check (claridad between 1 and 5),
  recomendaciones text not null,
  fuente text not null default 'nucleo_pdf'
    check (fuente in ('nucleo_pdf', 'experiencia_propia', 'mixto')),
  actualizado_en timestamptz not null default now()
);

-- ================= OPINIONES (comunidad) =================

create table opiniones (
  id uuid primary key default gen_random_uuid(),
  profesor_curso_id uuid not null references profesor_curso(id) on delete cascade,
  autor_id uuid references auth.users(id) on delete set null,
  -- nullable: si se borra el usuario, la opinión se conserva sin autor
  ciclo_estudiante smallint not null check (ciclo_estudiante between 1 and 10),
  claridad smallint not null check (claridad between 1 and 5),
  exigencia smallint not null check (exigencia between 1 and 5),
  carga_trabajo smallint not null check (carga_trabajo between 1 and 5),
  evaluaciones smallint not null check (evaluaciones between 1 and 5),
  -- (sin "ritmo": ese dato es solo de curaduría, el formulario guiado no lo pide)
  destacado text,
  a_tener_en_cuenta text,
  estado text not null default 'aprobado'
    check (estado in ('pendiente', 'aprobado', 'rechazado', 'retirado')),
  reportes integer not null default 0,
  creado_en timestamptz not null default now(),
  revisado_en timestamptz,
  revisado_por text
);

create index idx_opiniones_profesor_curso on opiniones(profesor_curso_id);

-- ================= ROW LEVEL SECURITY =================
-- Nota: como el login es obligatorio en TODA la plataforma (nadie entra
-- sin sesión, ni a Opiniones ni a ningún otro módulo), las políticas de
-- lectura quedaron "to authenticated" en vez de "to anon" como decía el
-- borrador original — si alguien no logueado no puede ver la app, tampoco
-- debería poder leer directo de la API. Se explica más abajo.

alter table opiniones enable row level security;

-- cualquier usuario logueado puede insertar su propia opinión
create policy "insertar_opinion_autenticado"
on opiniones for insert
to authenticated
with check (autor_id = auth.uid());

-- lectura directa de la tabla: nadie (ni anon ni authenticated) —
-- se lee siempre desde la vista opiniones_publicas de abajo
revoke select on opiniones from anon, authenticated;

-- moderar (retirar/aprobar) solo tú, autenticado
create policy "moderar_opiniones_autenticado"
on opiniones for update
to authenticated
using (true);

alter table perfiles_profesor enable row level security;
create policy "leer_perfiles_autenticado" on perfiles_profesor for select to authenticated using (true);

alter table profesores enable row level security;
create policy "leer_profesores_autenticado" on profesores for select to authenticated using (true);

alter table cursos enable row level security;
create policy "leer_cursos_autenticado" on cursos for select to authenticated using (true);

alter table profesor_curso enable row level security;
create policy "leer_profesor_curso_autenticado" on profesor_curso for select to authenticated using (true);

-- ================= VISTA PÚBLICA (sin autor_id ni estado) =================

create view opiniones_publicas as
select id, profesor_curso_id, ciclo_estudiante, claridad, exigencia,
       carga_trabajo, evaluaciones, destacado, a_tener_en_cuenta,
       reportes, creado_en
from opiniones
where estado = 'aprobado';

grant select on opiniones_publicas to authenticated;

-- ============================================================
-- NOTAS DE CAMBIOS vs. el schema original del Word
-- ============================================================
-- 1) cursos.carrera: quitado el "not null" -> ahora nullable = curso
--    común a las 3 carreras (decisión ya acordada con Harry).
-- 2) cursos.ciclo -> renombrado ciclo_ref y hecho NULLABLE, rango
--    ampliado a 1-10. Al extraer los 6 ciclos vimos que varios cursos
--    (Física I, Matemática Discreta, Desarrollo Personal, Economía
--    General, etc.) se repiten en DISTINTOS ciclos según la promoción
--    del alumno -> no es un valor fijo/identitario, así que se guarda
--    solo como referencia para la UI, no como regla dura. Además el
--    check original topaba en 6 y Harry ya va a cursar el 7mo.
-- 3) opiniones.autor_id: quitado el "not null" porque era incompatible
--    con "on delete set null" (una columna NOT NULL no puede pasar a
--    NULL cuando se borra el usuario referenciado).
-- 4) opiniones.ciclo_estudiante: rango ampliado a 1-10 (mismo motivo
--    que el punto 2).
-- 5) RLS de lectura (profesores/cursos/profesor_curso/perfiles_profesor)
--    cambiada de "to anon" a "to authenticated", y el insert de
--    opiniones de "to anon with check(true)" a "to authenticated with
--    check (autor_id = auth.uid())" — para que sea consistente con la
--    decisión de login obligatorio en toda la plataforma. Si en algún
--    momento quieres que Opiniones sea de acceso público sin cuenta
--    (aunque el resto de SIGA sí pida login), avísame y lo revierto.
-- 6) Agregado: profesores.slug, cursos.slug, cursos.codigo,
--    profesor_curso.activo, perfiles_profesor.fuente, extensión
--    unaccent/pg_trgm + índices de búsqueda — todo esto ya se conversó
--    y quedó de acuerdo.
-- ============================================================
-- ================= FIX: evitar reportes repetidos (una cuenta, un reporte por opinión) =================
create table opinion_reportes (
  opinion_id uuid not null references opiniones(id) on delete cascade,
  autor_id uuid not null references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (opinion_id, autor_id)
);

alter table opinion_reportes enable row level security;

create policy "insertar_reporte_propio"
  on opinion_reportes for insert
  to authenticated
  with check (autor_id = auth.uid());

create policy "leer_reporte_propio"
  on opinion_reportes for select
  to authenticated
  using (autor_id = auth.uid());

create or replace function reportar_opinion(p_opinion_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  insert into opinion_reportes (opinion_id, autor_id)
  values (p_opinion_id, auth.uid());

  update opiniones set reportes = reportes + 1 where id = p_opinion_id;
exception
  when unique_violation then
    raise exception 'Ya reportaste esta opinión';
end;
$$;

grant execute on function reportar_opinion(uuid) to authenticated;