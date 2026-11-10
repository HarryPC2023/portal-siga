-- Migración 12 — Tipo de puesto y perfil académico solicitado.
-- Se puede ejecutar más de una vez sin problema. Todo ocurre en UNA sola transacción: si algo falla, no se aplica nada.
--
-- Qué hace (tres dimensiones distintas y complementarias):
--   · Tipo de puesto  → el NIVEL del puesto (prácticas, trainee, asistente, junior…). Un solo valor por oferta: ofertas.tipo_puesto_id.
--                       Vacío (NULL) = aún sin clasificar. «No indicado» = revisado, pero la oferta no permite saberlo.
--   · Perfil académico → la FORMACIÓN que pide la oferta (estudiante, egresado, bachiller, titulado). Una oferta puede aceptar varios:
--                       tabla de relación oferta_perfiles_academicos (con `confirmado`, igual que oferta_carreras y oferta_perfiles).
--   · Perfil laboral   → la FUNCIÓN (Analista de datos…). NO se toca: perfiles_laborales y oferta_perfiles quedan como están.
--
--   1. Catálogos tipos_puesto (9 valores) y perfiles_academicos (5 valores), con RLS: lectura pública, escritura solo por funciones.
--   2. ofertas.tipo_puesto_id (opcional) y la tabla oferta_perfiles_academicos, protegidas como las demás.
--   3. registrar_oferta acepta tipo_puesto y perfiles_academicos (opcionales) SOLO si la oferta viene de la sesión del administrador,
--      igual que empresa_id. Sin ellos se guarda igual: nunca se bloquea una oferta ni su publicación por falta de estos datos.
--   4. La bandeja: admin_listar_ofertas devuelve tipo y perfiles, y ofrece los filtros «sin_tipo_puesto» y «sin_perfil_academico»
--      (avisos, no bloqueos); dos funciones nuevas permiten asignar el tipo y confirmar o quitar perfiles académicos.
--   No se tocan: competencias, ofertas_publicas (la vista pública sigue idéntica), perfiles_laborales, ni registrar_sync.

begin;

-- ====================================================================================================================
-- 1. CATÁLOGOS
-- ====================================================================================================================
create table if not exists public.tipos_puesto (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null check (length(btrim(nombre)) between 1 and 80),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descripcion text check (descripcion is null or length(descripcion) <= 200),
  orden       integer not null default 0,
  estado      text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at  timestamptz not null default now()
);

create table if not exists public.perfiles_academicos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null check (length(btrim(nombre)) between 1 and 80),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descripcion text check (descripcion is null or length(descripcion) <= 200),
  orden       integer not null default 0,
  estado      text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at  timestamptz not null default now()
);

insert into public.tipos_puesto (nombre, slug, descripcion, orden) values
  ('Prácticas',                   'practicas',           'Prácticas preprofesionales o profesionales', 1),
  ('Programa trainee',            'trainee',             'Programas de formación para nuevos profesionales', 2),
  ('Asistente',                   'asistente',           'Puestos de asistencia profesional o técnica', 3),
  ('Nivel junior',                'junior',              'Puestos de nivel inicial', 4),
  ('Nivel intermedio',            'intermedio',          'Puestos que requieren experiencia previa', 5),
  ('Nivel senior o especialista', 'senior-especialista', 'Puestos que requieren experiencia y dominio especializado', 6),
  ('Jefatura o supervisión',      'jefatura-supervision', 'Puestos de coordinación, supervisión o dirección', 7),
  ('Otro',                        'otro',                'Puestos que no encajan en las categorías anteriores', 8),
  ('No indicado',                 'no-indicado',         'La oferta no permite saber el nivel del puesto', 9)
on conflict (slug) do nothing;

insert into public.perfiles_academicos (nombre, slug, descripcion, orden) values
  ('Estudiante',  'estudiante',  'Persona que todavía cursa estudios', 1),
  ('Egresado',    'egresado',    'Persona que culminó el plan de estudios', 2),
  ('Bachiller',   'bachiller',   'Persona que obtuvo el grado de bachiller', 3),
  ('Titulado',    'titulado',    'Persona que obtuvo el título profesional', 4),
  ('No indicado', 'no-indicado', 'La oferta no especifica el perfil académico', 5)
on conflict (slug) do nothing;

-- ====================================================================================================================
-- 2. COLUMNA Y RELACIÓN EN OFERTAS
-- ====================================================================================================================
alter table public.ofertas add column if not exists tipo_puesto_id uuid references public.tipos_puesto (id) on delete restrict;
create index if not exists idx_ofertas_tipo_puesto on public.ofertas (tipo_puesto_id);

create table if not exists public.oferta_perfiles_academicos (
  id                  uuid primary key default gen_random_uuid(),
  oferta_id           uuid not null references public.ofertas (id) on delete cascade,
  perfil_academico_id uuid not null references public.perfiles_academicos (id) on delete restrict,
  confirmado          boolean not null default false,
  created_at          timestamptz not null default now(),
  unique (oferta_id, perfil_academico_id)
);
create index if not exists idx_oferta_perfiles_academicos_perfil on public.oferta_perfiles_academicos (perfil_academico_id);

-- ====================================================================================================================
-- 3. PROTECCIÓN (RLS y permisos, igual que las demás tablas del Mapa)
-- ====================================================================================================================
alter table public.tipos_puesto               enable row level security;
alter table public.perfiles_academicos        enable row level security;
alter table public.oferta_perfiles_academicos enable row level security;
revoke all on table public.tipos_puesto, public.perfiles_academicos, public.oferta_perfiles_academicos from public, anon, authenticated;
grant select on table public.tipos_puesto, public.perfiles_academicos, public.oferta_perfiles_academicos to anon, authenticated;

drop policy if exists lectura_publica on public.tipos_puesto;
create policy lectura_publica on public.tipos_puesto for select to public using (true);
drop policy if exists lectura_publica on public.perfiles_academicos;
create policy lectura_publica on public.perfiles_academicos for select to public using (true);
drop policy if exists lectura_perfiles_academicos_publicados on public.oferta_perfiles_academicos;
create policy lectura_perfiles_academicos_publicados on public.oferta_perfiles_academicos
  for select to public using ((confirmado = true) and private.oferta_esta_publicada(oferta_id));

-- ====================================================================================================================
-- 4. REGISTRAR OFERTA (misma función de siempre, con tipo de puesto y perfiles académicos opcionales)
-- ====================================================================================================================
create or replace function private.registrar_oferta(secreto text, datos jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  c_max_requisitos constant int := 40;
  c_max_carreras   constant int := 10;
  v_fuente         text;
  v_url            text;
  v_huella         text;
  v_puesto         text;
  v_ubicacion      text;
  v_txt            text;
  v_fecha          date;
  v_empresa_orig   text;
  v_sector_slug    text;
  v_sector_id      uuid;
  v_por_admin      boolean;
  v_en_texto       boolean;
  v_empresa_id     uuid;
  v_empresa_nombre text;
  v_ids            uuid[];
  v_lista          jsonb;
  v_c              text;
  v_norm           text;
  v_normas_vistas  text[] := '{}';
  v_carrera_ids    uuid[] := '{}';
  v_pendientes     text[] := '{}';
  v_oferta_id      uuid;
  v_r              jsonb;
  v_slug           text;
  v_comp_id        uuid;
  v_comp_vistas    uuid[] := '{}';
  v_tipo           text;
  v_nivel          text;
  v_frag           text;
  v_n_req          int := 0;
  v_tipo_puesto_id uuid;
  v_perfiles_acad  uuid[] := '{}';
  v_pa_slug        text;
  v_pa_id          uuid;
begin
  -- 1. Autorización (el secreto se compara aquí dentro y nunca se devuelve)
  if secreto is null
     or secreto is distinct from (select valor from public.sync_config where clave = 'secreto_ofertas') then
    raise exception 'no autorizado' using errcode = '42501';
  end if;

  -- 2. Forma y tamaño total
  if datos is null or jsonb_typeof(datos) <> 'object' or octet_length(datos::text) > 60000 then
    raise exception 'datos_invalidos: forma o tamaño' using errcode = '22023';
  end if;

  -- 3. Campos de la oferta
  v_fuente := lower(btrim(coalesce(datos->>'fuente', '')));
  if v_fuente not in ('linkedin', 'bumeran', 'computrabajo', 'empleos_peru', 'whatsapp', 'otro') then
    raise exception 'datos_invalidos: fuente' using errcode = '22023';
  end if;

  -- La URL es obligatoria salvo en las ofertas de WhatsApp u Otro (que muchas veces no traen enlace)
  v_url := nullif(btrim(coalesce(datos->>'url', '')), '');
  if v_url is null then
    if v_fuente not in ('whatsapp', 'otro') then
      raise exception 'datos_invalidos: url' using errcode = '22023';
    end if;
  elsif length(v_url) > 500 or v_url !~ '^https://[^[:space:]]+$' then
    raise exception 'datos_invalidos: url' using errcode = '22023';
  end if;

  v_huella := lower(btrim(coalesce(datos->>'huella', '')));
  if v_huella !~ '^[0-9a-f]{64}$' then
    raise exception 'datos_invalidos: huella' using errcode = '22023';
  end if;

  v_puesto := btrim(regexp_replace(replace(coalesce(datos->>'puesto', ''), E'\u00a0', ' '), '\s+', ' ', 'g'));
  if length(v_puesto) not between 1 and 200 then
    raise exception 'datos_invalidos: puesto' using errcode = '22023';
  end if;

  v_ubicacion := nullif(btrim(regexp_replace(replace(coalesce(datos->>'ubicacion', ''), E'\u00a0', ' '), '\s+', ' ', 'g')), '');
  if length(v_ubicacion) > 150 then
    raise exception 'datos_invalidos: ubicacion' using errcode = '22023';
  end if;

  v_txt := nullif(btrim(coalesce(datos->>'fecha_publicacion', '')), '');
  if v_txt is not null then
    if v_txt !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'datos_invalidos: fecha_publicacion' using errcode = '22023';
    end if;
    begin
      v_fecha := v_txt::date;
    exception when others then
      raise exception 'datos_invalidos: fecha_publicacion' using errcode = '22023';
    end;
  end if;

  -- 4. Empresa: solo se guarda el nombre tal como aparece. La tabla ofertas exige nombre_empresa_confirmado = true
  --    para poder tener empresa_id (ofertas_check), así que la empresa se vincula al REVISAR la oferta, no aquí.
  v_empresa_orig := nullif(btrim(regexp_replace(replace(coalesce(datos->>'empresa', ''), E'\u00a0', ' '), '\s+', ' ', 'g')), '');
  if length(v_empresa_orig) > 150 then
    raise exception 'datos_invalidos: empresa' using errcode = '22023';
  end if;

  -- 4b. Sector de la empresa (opcional): es el slug de un sector activo de la tabla sectores
  v_sector_slug := lower(btrim(coalesce(datos->>'sector', '')));
  if v_sector_slug <> '' then
    if length(v_sector_slug) > 60 then
      raise exception 'datos_invalidos: sector' using errcode = '22023';
    end if;
    select s.id into v_sector_id from public.sectores s where s.slug = v_sector_slug and s.estado = 'activo';
    if v_sector_id is null then
      raise exception 'datos_invalidos: sector desconocido' using errcode = '22023';
    end if;
  end if;

  -- 4c. Empresa identificada. SOLO la puede mandar el servidor cuando la oferta viene de la sesión del administrador
  --     (por_admin lo pone Render, nunca la extensión). Que el administrador la elija es lo que confirma el nombre.
  v_por_admin := coalesce(datos->'por_admin' = 'true'::jsonb, false);
  if jsonb_typeof(datos->'empresa_en_texto') = 'boolean' then
    v_en_texto := (datos->>'empresa_en_texto')::boolean;
  end if;
  if nullif(btrim(coalesce(datos->>'empresa_id', '')), '') is not null then
    if not v_por_admin
       or btrim(datos->>'empresa_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'datos_invalidos: empresa_id' using errcode = '22023';
    end if;
    select e.id, e.nombre into v_empresa_id, v_empresa_nombre
    from public.empresas e where e.id = btrim(datos->>'empresa_id')::uuid and e.estado = 'activa';
    if v_empresa_id is null then
      raise exception 'datos_invalidos: empresa desconocida' using errcode = '22023';
    end if;
  end if;

  -- 4d. Tipo de puesto y perfil académico solicitado. Igual que la empresa: SOLO los puede mandar el servidor cuando la oferta
  --     viene de la sesión del administrador (por_admin). Que los elija el administrador antes de guardar es lo que los confirma.
  --     Sin tipo de puesto la oferta se guarda igual: el tipo queda vacío (pendiente) y la bandeja lo avisa, sin bloquear nada.
  if nullif(btrim(coalesce(datos->>'tipo_puesto', '')), '') is not null then
    if not v_por_admin then
      raise exception 'datos_invalidos: tipo_puesto' using errcode = '22023';
    end if;
    select t.id into v_tipo_puesto_id from public.tipos_puesto t
     where t.slug = lower(btrim(datos->>'tipo_puesto')) and t.estado = 'activo';
    if v_tipo_puesto_id is null then
      raise exception 'datos_invalidos: tipo_puesto desconocido' using errcode = '22023';
    end if;
  end if;
  v_lista := datos->'perfiles_academicos';
  if v_lista is not null and jsonb_typeof(v_lista) <> 'null' then
    if not v_por_admin then
      raise exception 'datos_invalidos: perfiles_academicos' using errcode = '22023';
    end if;
    if jsonb_typeof(v_lista) <> 'array' or jsonb_array_length(v_lista) > 5 then
      raise exception 'datos_invalidos: perfiles_academicos' using errcode = '22023';
    end if;
    for v_pa_slug in select jsonb_array_elements_text(v_lista) loop
      v_pa_slug := lower(btrim(v_pa_slug));
      select p.id into v_pa_id from public.perfiles_academicos p where p.slug = v_pa_slug and p.estado = 'activo';
      if v_pa_id is null then
        raise exception 'datos_invalidos: perfil_academico desconocido' using errcode = '22023';
      end if;
      if not (v_pa_id = any (v_perfiles_acad)) then
        v_perfiles_acad := v_perfiles_acad || v_pa_id;
      end if;
    end loop;
    if cardinality(v_perfiles_acad) > 1
       and exists (select 1 from public.perfiles_academicos p where p.id = any (v_perfiles_acad) and p.slug = 'no-indicado') then
      raise exception 'datos_invalidos: perfil_academico (no indicado no se combina con otros)' using errcode = '22023';
    end if;
  end if;

  -- 5. Carreras mencionadas: coincidencia segura o van a carreras_pendientes
  v_lista := datos->'carreras_mencionadas';
  if v_lista is not null and jsonb_typeof(v_lista) <> 'null' then
    if jsonb_typeof(v_lista) <> 'array' or jsonb_array_length(v_lista) > c_max_carreras then
      raise exception 'datos_invalidos: carreras_mencionadas' using errcode = '22023';
    end if;
    for v_c in select jsonb_array_elements_text(v_lista) loop
      v_c := nullif(btrim(regexp_replace(replace(v_c, E'\u00a0', ' '), '\s+', ' ', 'g')), '');
      continue when v_c is null;
      if length(v_c) > 120 then
        raise exception 'datos_invalidos: carrera demasiado larga' using errcode = '22023';
      end if;
      v_norm := lower(v_c);
      continue when v_norm = any(v_normas_vistas);
      v_normas_vistas := v_normas_vistas || v_norm;
      select array_agg(c.id) into v_ids
      from public.carreras c
      where c.estado = 'activa'
        and lower(btrim(regexp_replace(replace(c.nombre, E'\u00a0', ' '), '\s+', ' ', 'g'))) = v_norm;
      if v_ids is not null and cardinality(v_ids) = 1 then
        v_carrera_ids := v_carrera_ids || v_ids[1];
      else
        v_pendientes := v_pendientes || v_c;
      end if;
    end loop;
  end if;

  -- 6. Forma de los requisitos (el detalle se valida uno por uno más abajo)
  v_lista := datos->'requisitos';
  if v_lista is null or jsonb_typeof(v_lista) <> 'array'
     or jsonb_array_length(v_lista) not between 1 and c_max_requisitos then
    raise exception 'datos_invalidos: requisitos' using errcode = '22023';
  end if;

  -- 7. Oferta: la unicidad la garantiza el UNIQUE de huella_deduplicacion (también con solicitudes simultáneas)
  insert into public.ofertas (
    empresa_id, nombre_empresa_confirmado, nombre_empresa_original, puesto, ubicacion,
    sector_id, fecha_publicacion, fuente, url, estado, huella_deduplicacion, carreras_pendientes, empresa_en_texto,
    tipo_puesto_id
  ) values (
    v_empresa_id, (v_empresa_id is not null), coalesce(v_empresa_orig, v_empresa_nombre), v_puesto, v_ubicacion,
    v_sector_id, v_fecha, v_fuente, v_url, 'pendiente', v_huella, v_pendientes, v_en_texto,
    v_tipo_puesto_id
  )
  on conflict (huella_deduplicacion) do nothing
  returning id into v_oferta_id;

  if v_oferta_id is null then
    return jsonb_build_object('resultado', 'duplicada');
  end if;

  -- 8. Requisitos: un slug desconocido cancela TODA la operación (la transacción se revierte)
  for v_r in select jsonb_array_elements(v_lista) loop
    if jsonb_typeof(v_r) <> 'object' then
      raise exception 'datos_invalidos: requisito' using errcode = '22023';
    end if;

    v_slug := lower(btrim(coalesce(v_r->>'competencia', '')));
    select c.id into v_comp_id
    from public.competencias c
    where c.slug = v_slug and c.estado = 'activa';
    if v_comp_id is null then
      raise exception 'datos_invalidos: competencia desconocida' using errcode = '22023';
    end if;
    continue when v_comp_id = any(v_comp_vistas);
    v_comp_vistas := v_comp_vistas || v_comp_id;

    v_tipo := lower(btrim(coalesce(nullif(v_r->>'tipo', ''), 'no_indicado')));
    if v_tipo not in ('obligatorio', 'deseable', 'no_indicado') then
      raise exception 'datos_invalidos: tipo' using errcode = '22023';
    end if;

    v_nivel := nullif(lower(btrim(coalesce(v_r->>'nivel', ''))), '');
    if v_nivel is not null and v_nivel not in ('basico', 'intermedio', 'avanzado') then
      raise exception 'datos_invalidos: nivel' using errcode = '22023';
    end if;

    v_frag := nullif(btrim(regexp_replace(replace(coalesce(v_r->>'fragmento', ''), E'\u00a0', ' '), '\s+', ' ', 'g')), '');
    if v_frag is not null
       and (length(v_frag) > 220
            or (select count(*) from unnest(regexp_split_to_array(v_frag, ' ')) as t(palabra)
                where t.palabra ~ '[[:alnum:]]') > 19) then
      raise exception 'datos_invalidos: fragmento' using errcode = '22023';
    end if;

    insert into public.oferta_requisitos (oferta_id, competencia_id, nivel, tipo, fragmento_respaldo)
    values (v_oferta_id, v_comp_id, v_nivel, v_tipo, v_frag);
    v_n_req := v_n_req + 1;
  end loop;

  -- 9. Carreras reconocidas (siempre sin confirmar)
  if cardinality(v_carrera_ids) > 0 then
    insert into public.oferta_carreras (oferta_id, carrera_id, confirmado)
    select v_oferta_id, unnest(v_carrera_ids), false;
  end if;

  -- 10. Perfiles académicos elegidos por el administrador (confirmados: los revisó antes de guardar)
  if cardinality(v_perfiles_acad) > 0 then
    insert into public.oferta_perfiles_academicos (oferta_id, perfil_academico_id, confirmado)
    select v_oferta_id, unnest(v_perfiles_acad), true;
  end if;

  return jsonb_build_object(
    'resultado', 'creada',
    'requisitos', v_n_req,
    'carreras_relacionadas', cardinality(v_carrera_ids),
    'carreras_pendientes', cardinality(v_pendientes),
    'tipo_puesto', v_tipo_puesto_id is not null,
    'perfiles_academicos', cardinality(v_perfiles_acad)
  );
end;
$function$;

-- ====================================================================================================================
-- 5. BANDEJA: listar con tipo de puesto y perfiles (misma función de siempre, con más datos y dos filtros nuevos)
-- ====================================================================================================================
create or replace function private.admin_listar_ofertas(
  p_filtro text default 'pendientes', p_limite integer default 25, p_desplazamiento integer default 0)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  v_filtro text := lower(btrim(coalesce(p_filtro, 'pendientes')));
  v_lim    integer;
  v_off    integer;
  v_res    jsonb;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if v_filtro not in ('pendientes', 'sin_empresa', 'nombre_sin_confirmar', 'sector_sin_verificar',
                      'carreras_por_revisar', 'sin_tipo_puesto', 'sin_perfil_academico', 'completas', 'publicadas', 'rechazadas') then
    raise exception 'datos_invalidos: filtro' using errcode = '22023';
  end if;
  v_lim := least(greatest(coalesce(p_limite, 25), 1), 100);
  v_off := greatest(coalesce(p_desplazamiento, 0), 0);

  with b as (
    select o.id, o.puesto, o.ubicacion, o.fuente, o.url, o.fecha_publicacion, o.estado, o.created_at, o.motivo_revision,
           o.empresa_id, o.nombre_empresa_original, o.nombre_empresa_confirmado, o.empresa_en_texto, o.carreras_pendientes,
           e.nombre as empresa_nombre,
           coalesce(c.estado_verificacion, 'sin_verificar') as empresa_verificacion,
           s.slug as sector_slug, s.nombre as sector_nombre,
           o.tipo_puesto_id, tp.slug as tipo_slug, tp.nombre as tipo_nombre,
           (select count(*) from public.oferta_perfiles_academicos pa where pa.oferta_id = o.id) as n_pa,
           (select count(*) from public.oferta_requisitos r where r.oferta_id = o.id) as n_req,
           (select count(*) from public.oferta_carreras oc where oc.oferta_id = o.id and oc.confirmado) as n_conf,
           (select count(*) from public.oferta_carreras oc where oc.oferta_id = o.id and not oc.confirmado) as n_sinconf
    from public.ofertas o
    left join public.empresas e on e.id = o.empresa_id
    left join public.empresa_clasificacion c on c.empresa_id = o.empresa_id
    left join public.sectores s on s.id = o.sector_id
    left join public.tipos_puesto tp on tp.id = o.tipo_puesto_id
  ), f as (
    select b.*,
           (b.estado in ('pendiente', 'revisada')) as en_revision,
           (b.empresa_id is null and b.nombre_empresa_original is null) as f_sin_empresa,
           (not b.nombre_empresa_confirmado and b.nombre_empresa_original is not null) as f_nombre,
           (b.empresa_id is not null and b.empresa_verificacion <> 'verificada') as f_sector,
           (cardinality(b.carreras_pendientes) > 0 or b.n_sinconf > 0) as f_carreras,
           (b.n_req > 0 and b.n_conf > 0 and b.n_sinconf = 0 and cardinality(b.carreras_pendientes) = 0) as f_completa,
           (b.tipo_puesto_id is null) as f_sin_tipo,
           (b.n_pa = 0) as f_sin_perfil
    from b
  ), sel as (
    select * from f
    where case v_filtro
            when 'pendientes'           then en_revision
            when 'sin_empresa'          then en_revision and f_sin_empresa
            when 'nombre_sin_confirmar' then en_revision and f_nombre
            when 'sector_sin_verificar' then en_revision and f_sector
            when 'carreras_por_revisar' then en_revision and f_carreras
            when 'sin_tipo_puesto'      then en_revision and f_sin_tipo
            when 'sin_perfil_academico' then en_revision and f_sin_perfil
            when 'completas'            then en_revision and f_completa
            when 'publicadas'           then estado = 'publicada'
            when 'rechazadas'           then estado = 'rechazada'
          end
  )
  select jsonb_build_object(
    'filtro', v_filtro,
    'total', (select count(*) from sel),
    'conteos', (select jsonb_build_object(
                  'pendientes',           count(*) filter (where en_revision),
                  'sin_empresa',          count(*) filter (where en_revision and f_sin_empresa),
                  'nombre_sin_confirmar', count(*) filter (where en_revision and f_nombre),
                  'sector_sin_verificar', count(*) filter (where en_revision and f_sector),
                  'carreras_por_revisar', count(*) filter (where en_revision and f_carreras),
                  'sin_tipo_puesto',      count(*) filter (where en_revision and f_sin_tipo),
                  'sin_perfil_academico', count(*) filter (where en_revision and f_sin_perfil),
                  'completas',            count(*) filter (where en_revision and f_completa),
                  'publicadas',           count(*) filter (where estado = 'publicada'),
                  'rechazadas',           count(*) filter (where estado = 'rechazada'))
                from f),
    'ofertas', coalesce((
      select jsonb_agg(x.j order by x.creada desc, x.id)
      from (
        select s2.created_at as creada, s2.id,
          jsonb_build_object(
            'id', s2.id, 'puesto', s2.puesto, 'ubicacion', s2.ubicacion, 'fuente', s2.fuente, 'url', s2.url,
            'fecha_publicacion', s2.fecha_publicacion, 'estado', s2.estado, 'creada', s2.created_at,
            'motivo', s2.motivo_revision,
            'empresa', jsonb_build_object(
              'id', s2.empresa_id, 'nombre', s2.empresa_nombre, 'texto_original', s2.nombre_empresa_original,
              'confirmada', s2.nombre_empresa_confirmado, 'en_texto', s2.empresa_en_texto,
              'verificacion', s2.empresa_verificacion),
            'sector', case when s2.sector_slug is null then null
                           else jsonb_build_object('slug', s2.sector_slug, 'nombre', s2.sector_nombre) end,
            'carreras', coalesce((select jsonb_agg(jsonb_build_object('id', ca.id, 'nombre', ca.nombre,
                                                                      'confirmada', oc.confirmado) order by ca.nombre)
                                  from public.oferta_carreras oc
                                  join public.carreras ca on ca.id = oc.carrera_id
                                  where oc.oferta_id = s2.id), '[]'::jsonb),
            'tipo_puesto', case when s2.tipo_slug is null then null
                                else jsonb_build_object('slug', s2.tipo_slug, 'nombre', s2.tipo_nombre) end,
            'perfiles_academicos', coalesce((select jsonb_agg(jsonb_build_object('slug', pa.slug, 'nombre', pa.nombre,
                                                                                 'confirmado', opa.confirmado) order by pa.orden)
                                             from public.oferta_perfiles_academicos opa
                                             join public.perfiles_academicos pa on pa.id = opa.perfil_academico_id
                                             where opa.oferta_id = s2.id), '[]'::jsonb),
            'carreras_pendientes', to_jsonb(s2.carreras_pendientes),
            'requisitos', coalesce((select jsonb_agg(jsonb_build_object('competencia', co.slug, 'nombre', co.nombre,
                                                                        'tipo', r.tipo, 'nivel', r.nivel,
                                                                        'fragmento', r.fragmento_respaldo) order by co.nombre)
                                    from public.oferta_requisitos r
                                    join public.competencias co on co.id = r.competencia_id
                                    where r.oferta_id = s2.id), '[]'::jsonb),
            'banderas', jsonb_build_object(
              'sin_empresa', s2.f_sin_empresa, 'nombre_sin_confirmar', s2.f_nombre,
              'sector_sin_verificar', s2.f_sector, 'carreras_por_revisar', s2.f_carreras, 'completa', s2.f_completa,
              'sin_tipo_puesto', s2.f_sin_tipo, 'sin_perfil_academico', s2.f_sin_perfil)
          ) as j
        from (select * from sel order by created_at desc, id limit v_lim offset v_off) s2
      ) x), '[]'::jsonb)
  ) into v_res;
  return v_res;
end
$$;

-- ====================================================================================================================
-- 6. FUNCIONES NUEVAS DEL ADMINISTRADOR
-- ====================================================================================================================
create or replace function private.admin_asignar_tipo_puesto_oferta(p_oferta uuid, p_tipo text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_slug text := lower(btrim(coalesce(p_tipo, '')));
  v_id   uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if v_slug <> '' then
    select t.id into v_id from public.tipos_puesto t where t.slug = v_slug and t.estado = 'activo';
    if v_id is null then
      raise exception 'datos_invalidos: tipo_puesto desconocido' using errcode = '22023';
    end if;
  end if;
  update public.ofertas set tipo_puesto_id = v_id, updated_at = now() where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'tipo_puesto', nullif(v_slug, ''));
end
$$;

create or replace function private.admin_perfil_academico_oferta(p_oferta uuid, p_perfil text, p_accion text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_accion text := lower(btrim(coalesce(p_accion, '')));
  v_slug   text := lower(btrim(coalesce(p_perfil, '')));
  v_id     uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if v_accion not in ('confirmar', 'quitar') then
    raise exception 'datos_invalidos: accion' using errcode = '22023';
  end if;
  select p.id into v_id from public.perfiles_academicos p where p.slug = v_slug and p.estado = 'activo';
  if v_id is null then
    raise exception 'datos_invalidos: perfil_academico desconocido' using errcode = '22023';
  end if;
  if v_accion = 'quitar' then
    delete from public.oferta_perfiles_academicos where oferta_id = p_oferta and perfil_academico_id = v_id;
  else
    if v_slug = 'no-indicado' then            -- «No indicado» no se combina con otros perfiles
      delete from public.oferta_perfiles_academicos where oferta_id = p_oferta and perfil_academico_id <> v_id;
    else
      delete from public.oferta_perfiles_academicos o using public.perfiles_academicos pa
       where o.oferta_id = p_oferta and pa.id = o.perfil_academico_id and pa.slug = 'no-indicado';
    end if;
    update public.oferta_perfiles_academicos set confirmado = true where oferta_id = p_oferta and perfil_academico_id = v_id;
    if not found then
      insert into public.oferta_perfiles_academicos (oferta_id, perfil_academico_id, confirmado) values (p_oferta, v_id, true);
    end if;
  end if;
  update public.ofertas set updated_at = now() where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'perfil_academico', v_slug, 'accion', v_accion);
end
$$;

-- Permisos y envoltorios (igual que el resto de las funciones admin_*: solo usuarios con sesión, y cada una comprueba al administrador)
revoke all on function private.admin_asignar_tipo_puesto_oferta(uuid, text)          from public, anon;
revoke all on function private.admin_perfil_academico_oferta(uuid, text, text)       from public, anon;
grant execute on function private.admin_asignar_tipo_puesto_oferta(uuid, text)       to authenticated;
grant execute on function private.admin_perfil_academico_oferta(uuid, text, text)    to authenticated;

create or replace function public.admin_asignar_tipo_puesto_oferta(p_oferta uuid, p_tipo text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_asignar_tipo_puesto_oferta(p_oferta, p_tipo) $$;

create or replace function public.admin_perfil_academico_oferta(p_oferta uuid, p_perfil text, p_accion text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_perfil_academico_oferta(p_oferta, p_perfil, p_accion) $$;

revoke all on function public.admin_asignar_tipo_puesto_oferta(uuid, text)           from public, anon;
revoke all on function public.admin_perfil_academico_oferta(uuid, text, text)        from public, anon;
grant execute on function public.admin_asignar_tipo_puesto_oferta(uuid, text)        to authenticated;
grant execute on function public.admin_perfil_academico_oferta(uuid, text, text)     to authenticated;

-- Avisa a la API de Supabase para que refresque su caché de funciones.
notify pgrst, 'reload schema';

commit;
