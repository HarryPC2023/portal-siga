-- Migración 10 — Bandeja de revisión de ofertas, tabla carrera → competencias esperadas y limpieza del Security Advisor.
-- Se puede ejecutar más de una vez sin problema. Todo ocurre en UNA sola transacción: si algo falla, no se aplica nada.
--
-- Qué hace:
--   1. SEGURIDAD. Las 4 funciones admin_* de empresas y registrar_oferta pasan al esquema «private» (que la API no
--      publica) y en «public» queda un envoltorio con el MISMO nombre y los MISMOS parámetros, así que ni la página
--      Admin ni Render necesitan ningún cambio. Resultado: desaparecen 5 avisos del Security Advisor.
--      (registrar_sync NO se toca: está en uso por la sincronización de notas.)
--   2. BANDEJA DE REVISIÓN. 2 columnas nuevas en ofertas (motivo y fecha de revisión) y las funciones del administrador
--      para listar, completar, publicar, rechazar y devolver ofertas. Nacen directamente en «private» con su envoltorio.
--   3. COMPETENCIAS ESPERADAS. La tabla carrera_competencias_esperadas (queda VACÍA) y las funciones para llenarla.
--
-- Estados de una oferta: pendiente → publicada (visible al público) | rechazada (oculta, con motivo).
-- «revisada» ya existía en la restricción de la tabla y no se usa; las ofertas en ese estado se tratan como pendientes.

begin;

-- ====================================================================================================================
-- 1. SEGURIDAD: mover las funciones al esquema private y dejar envoltorios
-- ====================================================================================================================
-- El esquema private ya existe y ya lo usan las políticas de lectura; estos permisos solo aseguran que los envoltorios
-- puedan llamar a las funciones movidas (private NO está publicado por la API, así que no se puede llamar desde fuera).
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

do $$
declare
  f text;
begin
  -- Solo se mueven si siguen en public como SECURITY DEFINER (así repetir la migración no rompe nada).
  foreach f in array array[
    'admin_listar_empresas()',
    'admin_crear_empresa(text, text, text)',
    'admin_verificar_empresa(uuid, text, text)',
    'admin_agregar_alias(uuid, text)',
    'registrar_oferta(text, jsonb)'
  ] loop
    if exists (
      select 1 from pg_proc p
      where p.oid = to_regprocedure('public.' || f) and p.prosecdef
    ) then
      execute format('alter function public.%s set schema private', f);
    end if;
  end loop;
end
$$;

-- Permisos de las funciones movidas (iguales a los de antes)
revoke all on function private.admin_listar_empresas()                      from public, anon;
revoke all on function private.admin_crear_empresa(text, text, text)        from public, anon;
revoke all on function private.admin_verificar_empresa(uuid, text, text)    from public, anon;
revoke all on function private.admin_agregar_alias(uuid, text)              from public, anon;
grant execute on function private.admin_listar_empresas()                   to authenticated;
grant execute on function private.admin_crear_empresa(text, text, text)     to authenticated;
grant execute on function private.admin_verificar_empresa(uuid, text, text) to authenticated;
grant execute on function private.admin_agregar_alias(uuid, text)           to authenticated;
revoke all on function private.registrar_oferta(text, jsonb)                from public, authenticated;
grant execute on function private.registrar_oferta(text, jsonb)             to anon;

-- Envoltorios en public: SECURITY INVOKER (no son SECURITY DEFINER, por eso el Advisor no los marca)
create or replace function public.admin_listar_empresas()
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.admin_listar_empresas() $$;

create or replace function public.admin_crear_empresa(p_nombre text, p_sector text, p_origen text default 'manual')
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_crear_empresa(p_nombre, p_sector, p_origen) $$;

create or replace function public.admin_verificar_empresa(p_empresa uuid, p_sector text, p_nota text default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_verificar_empresa(p_empresa, p_sector, p_nota) $$;

create or replace function public.admin_agregar_alias(p_empresa uuid, p_alias text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_agregar_alias(p_empresa, p_alias) $$;

create or replace function public.registrar_oferta(secreto text, datos jsonb)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.registrar_oferta(secreto, datos) $$;

revoke all on function public.admin_listar_empresas()                      from public, anon;
revoke all on function public.admin_crear_empresa(text, text, text)        from public, anon;
revoke all on function public.admin_verificar_empresa(uuid, text, text)    from public, anon;
revoke all on function public.admin_agregar_alias(uuid, text)              from public, anon;
grant execute on function public.admin_listar_empresas()                   to authenticated;
grant execute on function public.admin_crear_empresa(text, text, text)     to authenticated;
grant execute on function public.admin_verificar_empresa(uuid, text, text) to authenticated;
grant execute on function public.admin_agregar_alias(uuid, text)           to authenticated;
revoke all on function public.registrar_oferta(text, jsonb)                from public, authenticated;
grant execute on function public.registrar_oferta(text, jsonb)             to anon;

-- ====================================================================================================================
-- 2. BANDEJA DE REVISIÓN
-- ====================================================================================================================
-- 2.1 Columnas nuevas (ofertas no se puede leer por la API y la vista pública lista sus columnas una por una:
--     estas dos NO salen a la web)
alter table public.ofertas add column if not exists motivo_revision text;
alter table public.ofertas add column if not exists revisada_en timestamptz;
alter table public.ofertas drop constraint if exists ofertas_motivo_revision_check;
alter table public.ofertas add constraint ofertas_motivo_revision_check
  check (motivo_revision is null or length(btrim(motivo_revision)) between 1 and 200);

-- 2.2 Ayudas internas (no las llama nadie desde fuera)
create or replace function private.oferta_completa(p_oferta uuid)
returns boolean language sql stable set search_path = ''
as $$
  select exists (select 1 from public.oferta_requisitos r where r.oferta_id = p_oferta)
     and exists (select 1 from public.oferta_carreras c where c.oferta_id = p_oferta and c.confirmado)
     and not exists (select 1 from public.oferta_carreras c where c.oferta_id = p_oferta and not c.confirmado)
     and coalesce((select cardinality(o.carreras_pendientes) from public.ofertas o where o.id = p_oferta), 1) = 0
$$;

create or replace function private.exigir_oferta_en_revision(p_oferta uuid)
returns void language plpgsql stable set search_path = ''
as $$
declare
  v_estado text;
begin
  select o.estado into v_estado from public.ofertas o where o.id = p_oferta;
  if not found then
    raise exception 'datos_invalidos: oferta desconocida' using errcode = '22023';
  end if;
  if v_estado not in ('pendiente', 'revisada') then
    raise exception 'la oferta no está en revisión (devuélvela a pendiente para editarla)' using errcode = '22023';
  end if;
end
$$;

revoke all on function private.oferta_completa(uuid)             from public, anon, authenticated;
revoke all on function private.exigir_oferta_en_revision(uuid)   from public, anon, authenticated;

-- 2.3 Listar (con filtros y conteos para las pestañas)
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
                      'carreras_por_revisar', 'completas', 'publicadas', 'rechazadas') then
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
           (select count(*) from public.oferta_requisitos r where r.oferta_id = o.id) as n_req,
           (select count(*) from public.oferta_carreras oc where oc.oferta_id = o.id and oc.confirmado) as n_conf,
           (select count(*) from public.oferta_carreras oc where oc.oferta_id = o.id and not oc.confirmado) as n_sinconf
    from public.ofertas o
    left join public.empresas e on e.id = o.empresa_id
    left join public.empresa_clasificacion c on c.empresa_id = o.empresa_id
    left join public.sectores s on s.id = o.sector_id
  ), f as (
    select b.*,
           (b.estado in ('pendiente', 'revisada')) as en_revision,
           (b.empresa_id is null and b.nombre_empresa_original is null) as f_sin_empresa,
           (not b.nombre_empresa_confirmado and b.nombre_empresa_original is not null) as f_nombre,
           (b.empresa_id is not null and b.empresa_verificacion <> 'verificada') as f_sector,
           (cardinality(b.carreras_pendientes) > 0 or b.n_sinconf > 0) as f_carreras,
           (b.n_req > 0 and b.n_conf > 0 and b.n_sinconf = 0 and cardinality(b.carreras_pendientes) = 0) as f_completa
    from b
  ), sel as (
    select * from f
    where case v_filtro
            when 'pendientes'           then en_revision
            when 'sin_empresa'          then en_revision and f_sin_empresa
            when 'nombre_sin_confirmar' then en_revision and f_nombre
            when 'sector_sin_verificar' then en_revision and f_sector
            when 'carreras_por_revisar' then en_revision and f_carreras
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
            'carreras_pendientes', to_jsonb(s2.carreras_pendientes),
            'requisitos', coalesce((select jsonb_agg(jsonb_build_object('competencia', co.slug, 'nombre', co.nombre,
                                                                        'tipo', r.tipo, 'nivel', r.nivel,
                                                                        'fragmento', r.fragmento_respaldo) order by co.nombre)
                                    from public.oferta_requisitos r
                                    join public.competencias co on co.id = r.competencia_id
                                    where r.oferta_id = s2.id), '[]'::jsonb),
            'banderas', jsonb_build_object(
              'sin_empresa', s2.f_sin_empresa, 'nombre_sin_confirmar', s2.f_nombre,
              'sector_sin_verificar', s2.f_sector, 'carreras_por_revisar', s2.f_carreras, 'completa', s2.f_completa)
          ) as j
        from (select * from sel order by created_at desc, id limit v_lim offset v_off) s2
      ) x), '[]'::jsonb)
  ) into v_res;
  return v_res;
end
$$;

-- 2.4 Completar la empresa de una oferta (elegir una existente = confirmar el nombre; null = quitar el vínculo)
create or replace function private.admin_vincular_empresa_oferta(p_oferta uuid, p_empresa uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_nombre text;
  v_sector uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if p_empresa is null then
    update public.ofertas
       set empresa_id = null, nombre_empresa_confirmado = false, updated_at = now()
     where id = p_oferta;
    return jsonb_build_object('id', p_oferta, 'empresa_id', null);
  end if;
  select e.nombre into v_nombre from public.empresas e where e.id = p_empresa and e.estado = 'activa';
  if v_nombre is null then
    raise exception 'datos_invalidos: empresa desconocida' using errcode = '22023';
  end if;
  select c.sector_id into v_sector from public.empresa_clasificacion c where c.empresa_id = p_empresa;
  update public.ofertas
     set empresa_id = p_empresa,
         nombre_empresa_confirmado = true,
         nombre_empresa_original = coalesce(nombre_empresa_original, v_nombre),
         sector_id = coalesce(sector_id, v_sector),
         updated_at = now()
   where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'empresa_id', p_empresa);
end
$$;

-- 2.5 Asignar o quitar el sector de una oferta (por slug)
create or replace function private.admin_asignar_sector_oferta(p_oferta uuid, p_sector text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_slug   text := lower(btrim(coalesce(p_sector, '')));
  v_sector uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if v_slug <> '' then
    select s.id into v_sector from public.sectores s where s.slug = v_slug and s.estado = 'activo';
    if v_sector is null then
      raise exception 'datos_invalidos: sector desconocido' using errcode = '22023';
    end if;
  end if;
  update public.ofertas set sector_id = v_sector, updated_at = now() where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'sector', nullif(v_slug, ''));
end
$$;

-- 2.6 Confirmar o quitar una carrera de la oferta
create or replace function private.admin_carrera_oferta(p_oferta uuid, p_carrera uuid, p_accion text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_accion text := lower(btrim(coalesce(p_accion, '')));
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if v_accion not in ('confirmar', 'quitar') then
    raise exception 'datos_invalidos: accion' using errcode = '22023';
  end if;
  if not exists (select 1 from public.carreras c where c.id = p_carrera and c.estado = 'activa') then
    raise exception 'datos_invalidos: carrera desconocida' using errcode = '22023';
  end if;
  if v_accion = 'quitar' then
    delete from public.oferta_carreras where oferta_id = p_oferta and carrera_id = p_carrera;
  else
    update public.oferta_carreras set confirmado = true where oferta_id = p_oferta and carrera_id = p_carrera;
    if not found then
      insert into public.oferta_carreras (oferta_id, carrera_id, confirmado) values (p_oferta, p_carrera, true);
    end if;
  end if;
  update public.ofertas set updated_at = now() where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'carrera', p_carrera, 'accion', v_accion);
end
$$;

-- 2.7 Resolver una carrera «sin reconocer»: vincularla a una carrera existente, o descartar el texto (p_carrera = null)
create or replace function private.admin_resolver_carrera_pendiente(p_oferta uuid, p_texto text, p_carrera uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if not exists (select 1 from public.ofertas o where o.id = p_oferta and p_texto = any (o.carreras_pendientes)) then
    raise exception 'datos_invalidos: texto no encontrado' using errcode = '22023';
  end if;
  if p_carrera is not null then
    if not exists (select 1 from public.carreras c where c.id = p_carrera and c.estado = 'activa') then
      raise exception 'datos_invalidos: carrera desconocida' using errcode = '22023';
    end if;
    update public.oferta_carreras set confirmado = true where oferta_id = p_oferta and carrera_id = p_carrera;
    if not found then
      insert into public.oferta_carreras (oferta_id, carrera_id, confirmado) values (p_oferta, p_carrera, true);
    end if;
  end if;
  update public.ofertas
     set carreras_pendientes = array_remove(carreras_pendientes, p_texto), updated_at = now()
   where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'texto', p_texto, 'vinculada', p_carrera is not null);
end
$$;

-- 2.8 Agregar o quitar una competencia de la oferta (por slug)
create or replace function private.admin_requisito_oferta(
  p_oferta uuid, p_competencia text, p_accion text, p_tipo text default null, p_nivel text default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_accion text := lower(btrim(coalesce(p_accion, '')));
  v_comp   uuid;
  v_tipo   text := lower(btrim(coalesce(nullif(p_tipo, ''), 'no_indicado')));
  v_nivel  text := nullif(lower(btrim(coalesce(p_nivel, ''))), '');
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if v_accion not in ('agregar', 'quitar') then
    raise exception 'datos_invalidos: accion' using errcode = '22023';
  end if;
  select c.id into v_comp from public.competencias c
   where c.slug = lower(btrim(coalesce(p_competencia, ''))) and c.estado = 'activa';
  if v_comp is null then
    raise exception 'datos_invalidos: competencia desconocida' using errcode = '22023';
  end if;
  if v_accion = 'quitar' then
    delete from public.oferta_requisitos where oferta_id = p_oferta and competencia_id = v_comp;
  else
    if v_tipo not in ('obligatorio', 'deseable', 'no_indicado') then
      raise exception 'datos_invalidos: tipo' using errcode = '22023';
    end if;
    if v_nivel is not null and v_nivel not in ('basico', 'intermedio', 'avanzado') then
      raise exception 'datos_invalidos: nivel' using errcode = '22023';
    end if;
    update public.oferta_requisitos set tipo = v_tipo, nivel = v_nivel
     where oferta_id = p_oferta and competencia_id = v_comp;
    if not found then
      insert into public.oferta_requisitos (oferta_id, competencia_id, tipo, nivel)
      values (p_oferta, v_comp, v_tipo, v_nivel);
    end if;
  end if;
  update public.ofertas set updated_at = now() where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'competencia', lower(btrim(p_competencia)), 'accion', v_accion);
end
$$;

-- 2.9 Publicar, rechazar (ocultar, con motivo) o devolver una oferta a pendiente.
--     Rechazar NO borra: la huella queda guardada y la misma oferta no se puede volver a cargar sin darte cuenta.
create or replace function private.admin_cambiar_estado_oferta(p_oferta uuid, p_estado text, p_motivo text default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_nuevo  text := lower(btrim(coalesce(p_estado, '')));
  v_actual text;
  v_motivo text := nullif(btrim(regexp_replace(coalesce(p_motivo, ''), '\s+', ' ', 'g')), '');
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if v_nuevo not in ('publicada', 'rechazada', 'pendiente') then
    raise exception 'datos_invalidos: estado' using errcode = '22023';
  end if;
  select o.estado into v_actual from public.ofertas o where o.id = p_oferta;
  if not found then
    raise exception 'datos_invalidos: oferta desconocida' using errcode = '22023';
  end if;

  if v_nuevo = 'publicada' then
    if v_actual not in ('pendiente', 'revisada') then
      raise exception 'solo se puede publicar una oferta pendiente' using errcode = '22023';
    end if;
    if not exists (select 1 from public.oferta_requisitos r where r.oferta_id = p_oferta) then
      raise exception 'no se puede publicar una oferta sin competencias' using errcode = '22023';
    end if;
    update public.ofertas set estado = 'publicada', motivo_revision = null, revisada_en = now(), updated_at = now()
     where id = p_oferta;
  elsif v_nuevo = 'rechazada' then
    if v_motivo is null or length(v_motivo) > 200 then
      raise exception 'datos_invalidos: motivo (1 a 200 caracteres)' using errcode = '22023';
    end if;
    update public.ofertas set estado = 'rechazada', motivo_revision = v_motivo, revisada_en = now(), updated_at = now()
     where id = p_oferta;
  else
    if v_actual not in ('publicada', 'rechazada') then
      raise exception 'la oferta ya está pendiente' using errcode = '22023';
    end if;
    update public.ofertas set estado = 'pendiente', motivo_revision = null, revisada_en = null, updated_at = now()
     where id = p_oferta;
  end if;
  return jsonb_build_object('id', p_oferta, 'estado', v_nuevo);
end
$$;

-- 2.10 Publicar varias a la vez: SOLO las completas (≥1 competencia, ≥1 carrera confirmada, nada por revisar en carreras)
create or replace function private.admin_publicar_ofertas_completas(p_ids uuid[])
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_id        uuid;
  v_estado    text;
  v_publicadas integer := 0;
  v_omitidas  jsonb := '[]'::jsonb;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if p_ids is null or cardinality(p_ids) not between 1 and 50 then
    raise exception 'datos_invalidos: ids (1 a 50)' using errcode = '22023';
  end if;
  for v_id in select distinct u from unnest(p_ids) as u loop
    select o.estado into v_estado from public.ofertas o where o.id = v_id;
    if not found then
      v_omitidas := v_omitidas || jsonb_build_object('id', v_id, 'motivo', 'no existe');
    elsif v_estado not in ('pendiente', 'revisada') then
      v_omitidas := v_omitidas || jsonb_build_object('id', v_id, 'motivo', 'no está pendiente');
    elsif not private.oferta_completa(v_id) then
      v_omitidas := v_omitidas || jsonb_build_object('id', v_id, 'motivo', 'incompleta');
    else
      update public.ofertas set estado = 'publicada', motivo_revision = null, revisada_en = now(), updated_at = now()
       where id = v_id;
      v_publicadas := v_publicadas + 1;
    end if;
  end loop;
  return jsonb_build_object('publicadas', v_publicadas, 'omitidas', v_omitidas);
end
$$;

-- ====================================================================================================================
-- 3. TABLA CARRERA → COMPETENCIAS ESPERADAS (queda vacía; se llena a mano desde los planes de estudio)
-- ====================================================================================================================
create table if not exists public.carrera_competencias_esperadas (
  id             uuid primary key default gen_random_uuid(),
  carrera_id     uuid not null references public.carreras (id) on delete cascade,
  competencia_id uuid not null references public.competencias (id) on delete cascade,
  plan           text not null default '2026' check (plan ~ '^[0-9]{4}$'),
  cobertura      text not null default 'no' check (cobertura in ('si', 'parcial', 'no')),
  curso_codigo   text check (curso_codigo is null or length(curso_codigo) between 1 and 10),
  curso_nombre   text check (curso_nombre is null or length(curso_nombre) between 1 and 120),
  nota           text check (nota is null or length(nota) between 1 and 200),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint carrera_competencias_esperadas_unica unique (carrera_id, competencia_id, plan),
  constraint carrera_competencias_esperadas_sin_curso check (cobertura <> 'no' or (curso_codigo is null and curso_nombre is null))
);
-- (carrera_id ya queda cubierta por el índice de la restricción única; este es para competencia_id)
create index if not exists idx_carrera_competencias_esperadas_competencia
  on public.carrera_competencias_esperadas (competencia_id);

alter table public.carrera_competencias_esperadas enable row level security;
revoke all on table public.carrera_competencias_esperadas from public, anon, authenticated;
grant select on table public.carrera_competencias_esperadas to anon, authenticated;
drop policy if exists lectura_publica on public.carrera_competencias_esperadas;
create policy lectura_publica on public.carrera_competencias_esperadas for select to public using (true);

create or replace function private.admin_guardar_competencia_esperada(
  p_carrera uuid, p_competencia text, p_plan text default '2026', p_cobertura text default 'no',
  p_curso_codigo text default null, p_curso_nombre text default null, p_nota text default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_comp      uuid;
  v_plan      text := btrim(coalesce(p_plan, ''));
  v_cobertura text := lower(btrim(coalesce(p_cobertura, '')));
  v_codigo    text := nullif(upper(btrim(coalesce(p_curso_codigo, ''))), '');
  v_curso     text := nullif(btrim(regexp_replace(coalesce(p_curso_nombre, ''), '\s+', ' ', 'g')), '');
  v_nota      text := nullif(btrim(regexp_replace(coalesce(p_nota, ''), '\s+', ' ', 'g')), '');
  v_id        uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.carreras c where c.id = p_carrera and c.estado = 'activa') then
    raise exception 'datos_invalidos: carrera desconocida' using errcode = '22023';
  end if;
  select c.id into v_comp from public.competencias c
   where c.slug = lower(btrim(coalesce(p_competencia, ''))) and c.estado = 'activa';
  if v_comp is null then
    raise exception 'datos_invalidos: competencia desconocida' using errcode = '22023';
  end if;
  if v_plan !~ '^[0-9]{4}$' then
    raise exception 'datos_invalidos: plan' using errcode = '22023';
  end if;
  if v_cobertura not in ('si', 'parcial', 'no') then
    raise exception 'datos_invalidos: cobertura' using errcode = '22023';
  end if;
  if length(v_codigo) > 10 or length(v_curso) > 120 or length(v_nota) > 200 then
    raise exception 'datos_invalidos: texto demasiado largo' using errcode = '22023';
  end if;
  if v_cobertura = 'no' then   -- si la malla no la cubre, no hay curso que anotar
    v_codigo := null;
    v_curso  := null;
  end if;
  insert into public.carrera_competencias_esperadas as t
    (carrera_id, competencia_id, plan, cobertura, curso_codigo, curso_nombre, nota)
  values (p_carrera, v_comp, v_plan, v_cobertura, v_codigo, v_curso, v_nota)
  on conflict (carrera_id, competencia_id, plan) do update
    set cobertura = excluded.cobertura, curso_codigo = excluded.curso_codigo,
        curso_nombre = excluded.curso_nombre, nota = excluded.nota, updated_at = now()
  returning t.id into v_id;
  return jsonb_build_object('id', v_id);
end
$$;

create or replace function private.admin_quitar_competencia_esperada(p_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  delete from public.carrera_competencias_esperadas where id = p_id;
  if not found then
    raise exception 'datos_invalidos: fila desconocida' using errcode = '22023';
  end if;
  return jsonb_build_object('id', p_id, 'quitada', true);
end
$$;

-- ====================================================================================================================
-- 4. PERMISOS Y ENVOLTORIOS DE LAS FUNCIONES NUEVAS (solo usuarios con sesión; cada una vuelve a comprobar el admin)
-- ====================================================================================================================
revoke all on function private.admin_listar_ofertas(text, integer, integer)                                       from public, anon;
revoke all on function private.admin_vincular_empresa_oferta(uuid, uuid)                                          from public, anon;
revoke all on function private.admin_asignar_sector_oferta(uuid, text)                                            from public, anon;
revoke all on function private.admin_carrera_oferta(uuid, uuid, text)                                             from public, anon;
revoke all on function private.admin_resolver_carrera_pendiente(uuid, text, uuid)                                 from public, anon;
revoke all on function private.admin_requisito_oferta(uuid, text, text, text, text)                               from public, anon;
revoke all on function private.admin_cambiar_estado_oferta(uuid, text, text)                                      from public, anon;
revoke all on function private.admin_publicar_ofertas_completas(uuid[])                                           from public, anon;
revoke all on function private.admin_guardar_competencia_esperada(uuid, text, text, text, text, text, text)       from public, anon;
revoke all on function private.admin_quitar_competencia_esperada(uuid)                                            from public, anon;
grant execute on function private.admin_listar_ofertas(text, integer, integer)                                    to authenticated;
grant execute on function private.admin_vincular_empresa_oferta(uuid, uuid)                                       to authenticated;
grant execute on function private.admin_asignar_sector_oferta(uuid, text)                                         to authenticated;
grant execute on function private.admin_carrera_oferta(uuid, uuid, text)                                          to authenticated;
grant execute on function private.admin_resolver_carrera_pendiente(uuid, text, uuid)                              to authenticated;
grant execute on function private.admin_requisito_oferta(uuid, text, text, text, text)                            to authenticated;
grant execute on function private.admin_cambiar_estado_oferta(uuid, text, text)                                   to authenticated;
grant execute on function private.admin_publicar_ofertas_completas(uuid[])                                        to authenticated;
grant execute on function private.admin_guardar_competencia_esperada(uuid, text, text, text, text, text, text)    to authenticated;
grant execute on function private.admin_quitar_competencia_esperada(uuid)                                         to authenticated;

create or replace function public.admin_listar_ofertas(
  p_filtro text default 'pendientes', p_limite integer default 25, p_desplazamiento integer default 0)
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.admin_listar_ofertas(p_filtro, p_limite, p_desplazamiento) $$;

create or replace function public.admin_vincular_empresa_oferta(p_oferta uuid, p_empresa uuid)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_vincular_empresa_oferta(p_oferta, p_empresa) $$;

create or replace function public.admin_asignar_sector_oferta(p_oferta uuid, p_sector text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_asignar_sector_oferta(p_oferta, p_sector) $$;

create or replace function public.admin_carrera_oferta(p_oferta uuid, p_carrera uuid, p_accion text)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_carrera_oferta(p_oferta, p_carrera, p_accion) $$;

create or replace function public.admin_resolver_carrera_pendiente(p_oferta uuid, p_texto text, p_carrera uuid)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_resolver_carrera_pendiente(p_oferta, p_texto, p_carrera) $$;

create or replace function public.admin_requisito_oferta(
  p_oferta uuid, p_competencia text, p_accion text, p_tipo text default null, p_nivel text default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_requisito_oferta(p_oferta, p_competencia, p_accion, p_tipo, p_nivel) $$;

create or replace function public.admin_cambiar_estado_oferta(p_oferta uuid, p_estado text, p_motivo text default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_cambiar_estado_oferta(p_oferta, p_estado, p_motivo) $$;

create or replace function public.admin_publicar_ofertas_completas(p_ids uuid[])
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_publicar_ofertas_completas(p_ids) $$;

create or replace function public.admin_guardar_competencia_esperada(
  p_carrera uuid, p_competencia text, p_plan text default '2026', p_cobertura text default 'no',
  p_curso_codigo text default null, p_curso_nombre text default null, p_nota text default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_guardar_competencia_esperada(p_carrera, p_competencia, p_plan, p_cobertura,
                                                         p_curso_codigo, p_curso_nombre, p_nota) $$;

create or replace function public.admin_quitar_competencia_esperada(p_id uuid)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_quitar_competencia_esperada(p_id) $$;

revoke all on function public.admin_listar_ofertas(text, integer, integer)                                        from public, anon;
revoke all on function public.admin_vincular_empresa_oferta(uuid, uuid)                                           from public, anon;
revoke all on function public.admin_asignar_sector_oferta(uuid, text)                                             from public, anon;
revoke all on function public.admin_carrera_oferta(uuid, uuid, text)                                              from public, anon;
revoke all on function public.admin_resolver_carrera_pendiente(uuid, text, uuid)                                  from public, anon;
revoke all on function public.admin_requisito_oferta(uuid, text, text, text, text)                                from public, anon;
revoke all on function public.admin_cambiar_estado_oferta(uuid, text, text)                                       from public, anon;
revoke all on function public.admin_publicar_ofertas_completas(uuid[])                                            from public, anon;
revoke all on function public.admin_guardar_competencia_esperada(uuid, text, text, text, text, text, text)        from public, anon;
revoke all on function public.admin_quitar_competencia_esperada(uuid)                                             from public, anon;
grant execute on function public.admin_listar_ofertas(text, integer, integer)                                     to authenticated;
grant execute on function public.admin_vincular_empresa_oferta(uuid, uuid)                                        to authenticated;
grant execute on function public.admin_asignar_sector_oferta(uuid, text)                                          to authenticated;
grant execute on function public.admin_carrera_oferta(uuid, uuid, text)                                           to authenticated;
grant execute on function public.admin_resolver_carrera_pendiente(uuid, text, uuid)                               to authenticated;
grant execute on function public.admin_requisito_oferta(uuid, text, text, text, text)                             to authenticated;
grant execute on function public.admin_cambiar_estado_oferta(uuid, text, text)                                    to authenticated;
grant execute on function public.admin_publicar_ofertas_completas(uuid[])                                         to authenticated;
grant execute on function public.admin_guardar_competencia_esperada(uuid, text, text, text, text, text, text)     to authenticated;
grant execute on function public.admin_quitar_competencia_esperada(uuid)                                          to authenticated;

-- Avisa a la API de Supabase para que refresque su caché de funciones (así la página las ve enseguida).
notify pgrst, 'reload schema';

commit;
