-- Migración 13 — Obligatorio o deseable en el perfil académico, y años de experiencia pedidos.
-- Se puede ejecutar más de una vez sin problema. Todo ocurre en UNA sola transacción: si algo falla, no se aplica nada.
--
--   · oferta_perfiles_academicos.tipo: igual que en las competencias (obligatorio, deseable o no_indicado). Sirve para conservar si la
--     oferta EXIGE o solo VALORA una condición (por ejemplo «deseable estar colegiado»: titulado, como deseable).
--   · ofertas.experiencia_min_anios y experiencia_max_anios (opcionales): los años de experiencia que pide la oferta. Son un dato
--     INDEPENDIENTE: no intervienen en la clasificación del puesto. Vacío = la oferta no los indica; 0 y 0 = «sin experiencia».
--   · registrar_oferta acepta los dos (solo desde la sesión del administrador, igual que tipo_puesto); los perfiles pueden seguir
--     llegando como texto («egresado») o como objeto {perfil, tipo}.
--   · La bandeja los muestra, y dos funciones permiten corregirlos: admin_perfil_academico_oferta (ahora con tipo) y
--     admin_asignar_experiencia_oferta (nueva).
--   No se tocan: competencias, ofertas_publicas, perfiles_laborales, registrar_sync, ni la protección de ninguna tabla.

begin;

alter table public.oferta_perfiles_academicos add column if not exists tipo text not null default 'no_indicado';
alter table public.oferta_perfiles_academicos drop constraint if exists oferta_perfiles_academicos_tipo_check;
alter table public.oferta_perfiles_academicos add constraint oferta_perfiles_academicos_tipo_check
  check (tipo in ('obligatorio', 'deseable', 'no_indicado'));

alter table public.ofertas add column if not exists experiencia_min_anios smallint;
alter table public.ofertas add column if not exists experiencia_max_anios smallint;
alter table public.ofertas drop constraint if exists ofertas_experiencia_check;
alter table public.ofertas add constraint ofertas_experiencia_check check (
  (experiencia_min_anios is null or experiencia_min_anios between 0 and 40)
  and (experiencia_max_anios is null or experiencia_max_anios between 0 and 40)
  and (experiencia_min_anios is null or experiencia_max_anios is null or experiencia_max_anios >= experiencia_min_anios));

-- ====================================================================================================================
-- REGISTRAR OFERTA (misma función, con perfiles con tipo y años de experiencia opcionales)
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
  v_perfiles_tipo  text[] := '{}';
  v_pa_item        jsonb;
  v_pa_tipo        text;
  v_exp_min        smallint;
  v_exp_max        smallint;
  v_exp_txt        text;
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
    -- Cada perfil puede venir como texto («egresado») o como objeto {perfil, tipo}, con tipo obligatorio, deseable o no_indicado
    for v_pa_item in select jsonb_array_elements(v_lista) loop
      if jsonb_typeof(v_pa_item) = 'string' then
        v_pa_slug := lower(btrim(v_pa_item #>> '{}'));
        v_pa_tipo := 'no_indicado';
      elsif jsonb_typeof(v_pa_item) = 'object' then
        v_pa_slug := lower(btrim(coalesce(v_pa_item->>'perfil', '')));
        v_pa_tipo := lower(btrim(coalesce(nullif(v_pa_item->>'tipo', ''), 'no_indicado')));
      else
        raise exception 'datos_invalidos: perfiles_academicos' using errcode = '22023';
      end if;
      if v_pa_tipo not in ('obligatorio', 'deseable', 'no_indicado') then
        raise exception 'datos_invalidos: tipo del perfil_academico' using errcode = '22023';
      end if;
      select p.id into v_pa_id from public.perfiles_academicos p where p.slug = v_pa_slug and p.estado = 'activo';
      if v_pa_id is null then
        raise exception 'datos_invalidos: perfil_academico desconocido' using errcode = '22023';
      end if;
      if not (v_pa_id = any (v_perfiles_acad)) then
        v_perfiles_acad := v_perfiles_acad || v_pa_id;
        v_perfiles_tipo := v_perfiles_tipo || v_pa_tipo;
      end if;
    end loop;
    if cardinality(v_perfiles_acad) > 1
       and exists (select 1 from public.perfiles_academicos p where p.id = any (v_perfiles_acad) and p.slug = 'no-indicado') then
      raise exception 'datos_invalidos: perfil_academico (no indicado no se combina con otros)' using errcode = '22023';
    end if;
  end if;

  -- 4e. Años de experiencia pedidos (opcionales). Igual que el tipo de puesto: solo desde la sesión del administrador.
  --     Son un dato aparte: no participan en la clasificación del puesto. Vacío = la oferta no los indica. 0 y 0 = «sin experiencia».
  if nullif(btrim(coalesce(datos->>'experiencia_min_anios', '')), '') is not null
     or nullif(btrim(coalesce(datos->>'experiencia_max_anios', '')), '') is not null then
    if not v_por_admin then
      raise exception 'datos_invalidos: experiencia' using errcode = '22023';
    end if;
    v_exp_txt := btrim(coalesce(datos->>'experiencia_min_anios', ''));
    if v_exp_txt <> '' then
      if v_exp_txt !~ '^[0-9]{1,2}$' or v_exp_txt::int > 40 then
        raise exception 'datos_invalidos: experiencia_min_anios' using errcode = '22023';
      end if;
      v_exp_min := v_exp_txt::smallint;
    end if;
    v_exp_txt := btrim(coalesce(datos->>'experiencia_max_anios', ''));
    if v_exp_txt <> '' then
      if v_exp_txt !~ '^[0-9]{1,2}$' or v_exp_txt::int > 40 then
        raise exception 'datos_invalidos: experiencia_max_anios' using errcode = '22023';
      end if;
      v_exp_max := v_exp_txt::smallint;
    end if;
    if v_exp_min is not null and v_exp_max is not null and v_exp_max < v_exp_min then
      raise exception 'datos_invalidos: experiencia (el máximo no puede ser menor que el mínimo)' using errcode = '22023';
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
    tipo_puesto_id, experiencia_min_anios, experiencia_max_anios
  ) values (
    v_empresa_id, (v_empresa_id is not null), coalesce(v_empresa_orig, v_empresa_nombre), v_puesto, v_ubicacion,
    v_sector_id, v_fecha, v_fuente, v_url, 'pendiente', v_huella, v_pendientes, v_en_texto,
    v_tipo_puesto_id, v_exp_min, v_exp_max
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
    insert into public.oferta_perfiles_academicos (oferta_id, perfil_academico_id, confirmado, tipo)
    select v_oferta_id, u.pid, true, u.tp from unnest(v_perfiles_acad, v_perfiles_tipo) as u(pid, tp);
  end if;

  return jsonb_build_object(
    'resultado', 'creada',
    'requisitos', v_n_req,
    'carreras_relacionadas', cardinality(v_carrera_ids),
    'carreras_pendientes', cardinality(v_pendientes),
    'tipo_puesto', v_tipo_puesto_id is not null,
    'perfiles_academicos', cardinality(v_perfiles_acad),
    'experiencia', (v_exp_min is not null or v_exp_max is not null)
  );
end;
$function$;

-- ====================================================================================================================
-- BANDEJA: listar (ahora con los años de experiencia y el tipo de cada perfil)
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
           o.experiencia_min_anios, o.experiencia_max_anios,
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
            'experiencia', jsonb_build_object('min', s2.experiencia_min_anios, 'max', s2.experiencia_max_anios),
            'perfiles_academicos', coalesce((select jsonb_agg(jsonb_build_object('slug', pa.slug, 'nombre', pa.nombre,
                                                                                 'confirmado', opa.confirmado, 'tipo', opa.tipo) order by pa.orden)
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
-- FUNCIONES DEL ADMINISTRADOR
-- ====================================================================================================================
-- admin_perfil_academico_oferta ahora recibe también el tipo (obligatorio, deseable o no_indicado). La firma cambia, así que se
-- reemplaza la anterior (si se dejaran las dos, la base no sabría cuál usar).
drop function if exists public.admin_perfil_academico_oferta(uuid, text, text);
drop function if exists private.admin_perfil_academico_oferta(uuid, text, text);

create or replace function private.admin_perfil_academico_oferta(p_oferta uuid, p_perfil text, p_accion text, p_tipo text default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_accion text := lower(btrim(coalesce(p_accion, '')));
  v_slug   text := lower(btrim(coalesce(p_perfil, '')));
  v_tipo   text := nullif(lower(btrim(coalesce(p_tipo, ''))), '');
  v_id     uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if v_accion not in ('confirmar', 'quitar') then
    raise exception 'datos_invalidos: accion' using errcode = '22023';
  end if;
  if v_tipo is not null and v_tipo not in ('obligatorio', 'deseable', 'no_indicado') then
    raise exception 'datos_invalidos: tipo' using errcode = '22023';
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
    update public.oferta_perfiles_academicos set confirmado = true, tipo = coalesce(v_tipo, tipo)
     where oferta_id = p_oferta and perfil_academico_id = v_id;
    if not found then
      insert into public.oferta_perfiles_academicos (oferta_id, perfil_academico_id, confirmado, tipo)
      values (p_oferta, v_id, true, coalesce(v_tipo, 'no_indicado'));
    end if;
  end if;
  update public.ofertas set updated_at = now() where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'perfil_academico', v_slug, 'accion', v_accion);
end
$$;

create or replace function private.admin_asignar_experiencia_oferta(p_oferta uuid, p_min integer, p_max integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  perform private.exigir_oferta_en_revision(p_oferta);
  if (p_min is not null and p_min not between 0 and 40) or (p_max is not null and p_max not between 0 and 40) then
    raise exception 'datos_invalidos: experiencia (de 0 a 40 años)' using errcode = '22023';
  end if;
  if p_min is not null and p_max is not null and p_max < p_min then
    raise exception 'datos_invalidos: experiencia (el máximo no puede ser menor que el mínimo)' using errcode = '22023';
  end if;
  update public.ofertas set experiencia_min_anios = p_min, experiencia_max_anios = p_max, updated_at = now() where id = p_oferta;
  return jsonb_build_object('id', p_oferta, 'min', p_min, 'max', p_max);
end
$$;

revoke all on function private.admin_perfil_academico_oferta(uuid, text, text, text)  from public, anon;
revoke all on function private.admin_asignar_experiencia_oferta(uuid, integer, integer) from public, anon;
grant execute on function private.admin_perfil_academico_oferta(uuid, text, text, text)  to authenticated;
grant execute on function private.admin_asignar_experiencia_oferta(uuid, integer, integer) to authenticated;

create or replace function public.admin_perfil_academico_oferta(p_oferta uuid, p_perfil text, p_accion text, p_tipo text default null)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_perfil_academico_oferta(p_oferta, p_perfil, p_accion, p_tipo) $$;

create or replace function public.admin_asignar_experiencia_oferta(p_oferta uuid, p_min integer, p_max integer)
returns jsonb language sql security invoker set search_path = ''
as $$ select private.admin_asignar_experiencia_oferta(p_oferta, p_min, p_max) $$;

revoke all on function public.admin_perfil_academico_oferta(uuid, text, text, text)  from public, anon;
revoke all on function public.admin_asignar_experiencia_oferta(uuid, integer, integer) from public, anon;
grant execute on function public.admin_perfil_academico_oferta(uuid, text, text, text)  to authenticated;
grant execute on function public.admin_asignar_experiencia_oferta(uuid, integer, integer) to authenticated;

-- Avisa a la API de Supabase para que refresque su caché de funciones.
notify pgrst, 'reload schema';

commit;
