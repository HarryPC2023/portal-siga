-- Migración 6 de 6 — clasificación de empresas por sector, alias y empresa confirmada por el administrador.
-- Requiere las migraciones 1 a 5. Se puede ejecutar más de una vez.
--
-- QUÉ SE AGREGA
--   1. private.normalizar_nombre(): misma regla que normalizarNombre() de js/mercado-motor.js (sin tildes, sin signos,
--      sin «S.A.C.» al final). Si se cambia una, se cambia la otra.
--   2. empresa_clasificacion: sector principal de cada empresa, con estado (sin_verificar / verificada), fecha y origen.
--   3. empresa_alias: nombres alternativos CONFIRMADOS a mano; un alias (normalizado) no puede pertenecer a dos empresas.
--   4. Funciones admin_* para administrar lo anterior. Cada una comprueba que quien llama es el administrador
--      (public.asesorias_es_admin()) y solo la puede ejecutar un usuario con sesión; las tablas quedan CERRADAS a la API.
--   5. ofertas.empresa_en_texto: si el nombre de la empresa aparece escrito en el texto de la oferta (sí / no / sin dato).
--   6. registrar_oferta(): acepta empresa_id y empresa_en_texto, pero SOLO si la oferta viene de la sesión del administrador.
--   7. Semilla de 40 empresas muy conocidas, todas SIN VERIFICAR y sin alias (tú las confirmas al usarlas).
--
-- QUÉ NO SE TOCA
--   Ninguna columna, política, permiso ni vista de las tablas existentes (empresas, ofertas, sectores...). La vista
--   ofertas_publicas queda exactamente igual: no expone nada de lo nuevo.

begin;

-- 1. Normalización de nombres -------------------------------------------------------------------------------------
create or replace function private.normalizar_nombre(t text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    btrim(regexp_replace(
      regexp_replace(translate(lower(coalesce(t, '')), 'áàâäãéèêëíìîïóòôöõúùûüñç', 'aaaaaeeeeiiiiooooouuuunc'), '\.', '', 'g'),
      '[^a-z0-9]+', ' ', 'g')),
    '\s+(sac|saa|sa|srl|eirl|scrl|sas|ltda)$', '')
$$;

-- 2. Clasificación de empresas ------------------------------------------------------------------------------------
create table if not exists public.empresa_clasificacion (
  empresa_id          uuid primary key references public.empresas (id) on delete cascade,
  sector_id           uuid not null references public.sectores (id),
  estado_verificacion text not null default 'sin_verificar' check (estado_verificacion in ('sin_verificar', 'verificada')),
  fecha_verificacion  date,
  origen              text not null check (origen in ('semilla', 'oferta', 'manual')),
  nota                text check (nota is null or length(nota) <= 200),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint empresa_clasificacion_verificada_con_fecha
    check (estado_verificacion <> 'verificada' or fecha_verificacion is not null)
);

-- 3. Alias de empresas --------------------------------------------------------------------------------------------
create table if not exists public.empresa_alias (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references public.empresas (id) on delete cascade,
  alias             text not null check (length(btrim(alias)) between 1 and 150),
  alias_normalizado text not null,
  created_at        timestamptz not null default now(),
  constraint empresa_alias_normalizado_key unique (alias_normalizado)
);
create index if not exists idx_empresa_alias_empresa on public.empresa_alias (empresa_id);

create or replace function private.empresa_alias_antes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.alias := btrim(new.alias);
  new.alias_normalizado := private.normalizar_nombre(new.alias);
  if new.alias_normalizado = '' then
    raise exception 'alias vacío' using errcode = '22023';
  end if;
  if exists (select 1 from public.empresas e where private.normalizar_nombre(e.nombre) = new.alias_normalizado) then
    raise exception 'el alias coincide con el nombre de una empresa' using errcode = '23505';
  end if;
  return new;
end
$$;
drop trigger if exists empresa_alias_antes on public.empresa_alias;
create trigger empresa_alias_antes before insert or update on public.empresa_alias
  for each row execute function private.empresa_alias_antes();

-- Tablas CERRADAS a la API: sin permisos para anon ni authenticated y con una política que lo niega todo
-- (igual que sync_config). Solo se usan a través de las funciones admin_* y de registrar_oferta().
alter table public.empresa_clasificacion enable row level security;
alter table public.empresa_alias enable row level security;
revoke all on table public.empresa_clasificacion, public.empresa_alias from public, anon, authenticated;
drop policy if exists empresa_clasificacion_sin_acceso_api on public.empresa_clasificacion;
create policy empresa_clasificacion_sin_acceso_api on public.empresa_clasificacion for all using (false) with check (false);
drop policy if exists empresa_alias_sin_acceso_api on public.empresa_alias;
create policy empresa_alias_sin_acceso_api on public.empresa_alias for all using (false) with check (false);

-- 4. Funciones del administrador -----------------------------------------------------------------------------------
create or replace function public.admin_listar_empresas()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  return (
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'id', e.id,
               'nombre', e.nombre,
               'sector', s.slug,
               'estado', c.estado_verificacion,
               'alias', coalesce((select jsonb_agg(a.alias order by a.alias) from public.empresa_alias a where a.empresa_id = e.id), '[]'::jsonb)
             ) order by e.nombre), '[]'::jsonb)
    from public.empresas e
    left join public.empresa_clasificacion c on c.empresa_id = e.id
    left join public.sectores s on s.id = c.sector_id
    where e.estado = 'activa'
  );
end
$$;

create or replace function public.admin_crear_empresa(p_nombre text, p_sector text, p_origen text default 'manual')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text;
  v_norm   text;
  v_sector uuid;
  v_id     uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  v_nombre := btrim(regexp_replace(coalesce(p_nombre, ''), '\s+', ' ', 'g'));
  if length(v_nombre) not between 1 and 150 then
    raise exception 'datos_invalidos: nombre' using errcode = '22023';
  end if;
  v_norm := private.normalizar_nombre(v_nombre);
  if v_norm = '' then
    raise exception 'datos_invalidos: nombre' using errcode = '22023';
  end if;
  if p_origen is null or p_origen not in ('manual', 'oferta') then
    raise exception 'datos_invalidos: origen' using errcode = '22023';
  end if;
  select s.id into v_sector from public.sectores s where s.slug = lower(btrim(coalesce(p_sector, ''))) and s.estado = 'activo';
  if v_sector is null then
    raise exception 'datos_invalidos: sector desconocido' using errcode = '22023';
  end if;
  if exists (select 1 from public.empresas e where private.normalizar_nombre(e.nombre) = v_norm)
     or exists (select 1 from public.empresa_alias a where a.alias_normalizado = v_norm) then
    raise exception 'la empresa ya existe' using errcode = '23505';
  end if;
  insert into public.empresas (nombre) values (v_nombre) returning id into v_id;
  -- La crea y elige su sector el administrador: ese acto ya es la confirmación.
  insert into public.empresa_clasificacion (empresa_id, sector_id, estado_verificacion, fecha_verificacion, origen)
  values (v_id, v_sector, 'verificada', current_date, p_origen);
  return jsonb_build_object('id', v_id, 'nombre', v_nombre);
end
$$;

create or replace function public.admin_verificar_empresa(p_empresa uuid, p_sector text, p_nota text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sector uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  select s.id into v_sector from public.sectores s where s.slug = lower(btrim(coalesce(p_sector, ''))) and s.estado = 'activo';
  if v_sector is null then
    raise exception 'datos_invalidos: sector desconocido' using errcode = '22023';
  end if;
  if not exists (select 1 from public.empresas e where e.id = p_empresa and e.estado = 'activa') then
    raise exception 'datos_invalidos: empresa desconocida' using errcode = '22023';
  end if;
  insert into public.empresa_clasificacion as c (empresa_id, sector_id, estado_verificacion, fecha_verificacion, origen, nota)
  values (p_empresa, v_sector, 'verificada', current_date, 'manual', left(p_nota, 200))
  on conflict (empresa_id) do update
    set origen = case when c.sector_id = excluded.sector_id then c.origen else 'manual' end,
        sector_id = excluded.sector_id,
        estado_verificacion = 'verificada',
        fecha_verificacion = current_date,
        nota = coalesce(excluded.nota, c.nota),
        updated_at = now();
  return jsonb_build_object('id', p_empresa, 'sector', lower(btrim(p_sector)), 'estado', 'verificada');
end
$$;

create or replace function public.admin_agregar_alias(p_empresa uuid, p_alias text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not (select public.asesorias_es_admin()) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.empresas e where e.id = p_empresa and e.estado = 'activa') then
    raise exception 'datos_invalidos: empresa desconocida' using errcode = '22023';
  end if;
  insert into public.empresa_alias (empresa_id, alias) values (p_empresa, coalesce(p_alias, '')) returning id into v_id;
  return jsonb_build_object('id', v_id);
end
$$;

-- Solo usuarios con sesión pueden ejecutarlas (y cada una vuelve a comprobar que eres el administrador).
revoke all on function public.admin_listar_empresas() from public, anon;
revoke all on function public.admin_crear_empresa(text, text, text) from public, anon;
revoke all on function public.admin_verificar_empresa(uuid, text, text) from public, anon;
revoke all on function public.admin_agregar_alias(uuid, text) from public, anon;
grant execute on function public.admin_listar_empresas() to authenticated;
grant execute on function public.admin_crear_empresa(text, text, text) to authenticated;
grant execute on function public.admin_verificar_empresa(uuid, text, text) to authenticated;
grant execute on function public.admin_agregar_alias(uuid, text) to authenticated;

-- 5. La oferta recuerda si la empresa aparece escrita en el texto -----------------------------------------------
-- (ofertas no se puede leer por la API y la vista pública lista sus columnas una por una: esta no sale a la web)
alter table public.ofertas add column if not exists empresa_en_texto boolean;

-- 6. registrar_oferta con empresa identificada --------------------------------------------------------------------
create or replace function public.registrar_oferta(secreto text, datos jsonb)
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
    sector_id, fecha_publicacion, fuente, url, estado, huella_deduplicacion, carreras_pendientes, empresa_en_texto
  ) values (
    v_empresa_id, (v_empresa_id is not null), coalesce(v_empresa_orig, v_empresa_nombre), v_puesto, v_ubicacion,
    v_sector_id, v_fecha, v_fuente, v_url, 'pendiente', v_huella, v_pendientes, v_en_texto
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

  return jsonb_build_object(
    'resultado', 'creada',
    'requisitos', v_n_req,
    'carreras_relacionadas', cardinality(v_carrera_ids),
    'carreras_pendientes', cardinality(v_pendientes)
  );
end;
$function$;

revoke all on function public.registrar_oferta(text, jsonb) from public, anon, authenticated;
grant execute on function public.registrar_oferta(text, jsonb) to anon;

-- 7. Semilla: 40 empresas muy conocidas, SIN VERIFICAR y sin alias --------------------------------------------------
do $$
declare
  r record;
  v_id uuid;
  v_sector uuid;
begin
  for r in
    select * from (values
    ('BCP', 'banca', NULL),
    ('Interbank', 'banca', NULL),
    ('BBVA Perú', 'banca', NULL),
    ('Scotiabank Perú', 'banca', NULL),
    ('Mibanco', 'banca', NULL),
    ('Bitel', 'telecomunicaciones', NULL),
    ('Claro', 'telecomunicaciones', NULL),
    ('Movistar', 'telecomunicaciones', NULL),
    ('Entel Perú', 'telecomunicaciones', NULL),
    ('Saga Falabella', 'consumo-masivo-retail', NULL),
    ('Ripley', 'consumo-masivo-retail', NULL),
    ('Tottus', 'consumo-masivo-retail', NULL),
    ('Plaza Vea', 'consumo-masivo-retail', NULL),
    ('Alicorp', 'consumo-masivo-retail', 'Consumo masivo; también podría considerarse industria y manufactura'),
    ('Pluz Energía', 'energia-electricidad', NULL),
    ('Luz del Sur', 'energia-electricidad', NULL),
    ('Engie Perú', 'energia-electricidad', NULL),
    ('Southern Perú', 'mineria-metalurgia', NULL),
    ('Antamina', 'mineria-metalurgia', NULL),
    ('Buenaventura', 'mineria-metalurgia', NULL),
    ('Cerro Verde', 'mineria-metalurgia', NULL),
    ('Petroperú', 'petroleo-gas-petroquimica', NULL),
    ('Repsol Perú', 'petroleo-gas-petroquimica', NULL),
    ('Cálidda', 'petroleo-gas-petroquimica', 'Distribución de gas natural'),
    ('Aenza', 'construccion-infraestructura', 'Antes Graña y Montero (cambió de nombre en noviembre de 2020); también infraestructura y energía'),
    ('Cosapi', 'construccion-infraestructura', NULL),
    ('JJC Contratistas', 'construccion-infraestructura', NULL),
    ('Aceros Arequipa', 'industria-manufactura', NULL),
    ('NTT DATA', 'tecnologia-software', 'Tecnología y consultoría; clasificación discutible'),
    ('Accenture', 'tecnologia-software', 'Consultoría y tecnología; clasificación discutible'),
    ('Ransa', 'logistica-transporte', NULL),
    ('Neptunia', 'logistica-transporte', NULL),
    ('DP World Callao', 'logistica-transporte', 'Operación portuaria'),
    ('Deloitte', 'consultoria-servicios-profesionales', NULL),
    ('PwC', 'consultoria-servicios-profesionales', NULL),
    ('EY', 'consultoria-servicios-profesionales', NULL),
    ('Osinergmin', 'sector-publico-regulacion', 'Organismo regulador de energía y minería'),
    ('SUNAT', 'sector-publico-regulacion', NULL),
    ('Camposol', 'agroindustria-pesca', NULL),
    ('TASA', 'agroindustria-pesca', 'Pesca (harina y aceite de pescado)')
    ) as t(nombre, sector, nota)
  loop
    select s.id into v_sector from public.sectores s where s.slug = r.sector and s.estado = 'activo';
    if v_sector is null then
      raise exception 'falta el sector % (corre antes la migración 5)', r.sector;
    end if;
    select e.id into v_id from public.empresas e where private.normalizar_nombre(e.nombre) = private.normalizar_nombre(r.nombre) limit 1;
    if v_id is null then
      insert into public.empresas (nombre) values (r.nombre) returning id into v_id;
    end if;
    insert into public.empresa_clasificacion (empresa_id, sector_id, estado_verificacion, origen, nota)
    values (v_id, v_sector, 'sin_verificar', 'semilla', r.nota)
    on conflict (empresa_id) do nothing;
  end loop;
end
$$;

commit;

-- Comprobación final ----------------------------------------------------------------------------------------------
select
  (select count(*) from public.empresa_clasificacion where origen = 'semilla')                                              as empresas_semilla,
  (select count(*) from public.empresa_clasificacion where estado_verificacion = 'verificada')                              as ya_verificadas,
  has_table_privilege('anon', 'public.empresa_clasificacion', 'select')
    or has_table_privilege('authenticated', 'public.empresa_clasificacion', 'select')
    or has_table_privilege('anon', 'public.empresa_alias', 'select')
    or has_table_privilege('authenticated', 'public.empresa_alias', 'select')                                               as tablas_nuevas_abiertas_debe_ser_false,
  has_function_privilege('anon', 'public.admin_listar_empresas()', 'execute')                                               as anon_ejecuta_admin_debe_ser_false,
  has_function_privilege('anon', 'public.registrar_oferta(text, jsonb)', 'execute')                                         as anon_ejecuta_registrar,
  has_function_privilege('authenticated', 'public.registrar_oferta(text, jsonb)', 'execute')                                as authenticated_ejecuta_registrar_debe_ser_false,
  pg_get_viewdef('public.ofertas_publicas'::regclass) not like '%empresa_en_texto%'                                         as vista_publica_sin_columnas_nuevas;
