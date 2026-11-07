-- Migración 5 de 5 — sectores para todas las facultades, fuente "otro" y sector en registrar_oferta().
-- Requiere las migraciones 1, 2 y 3. Incluye lo de la migración 4 (fuente "otro"), así que da igual si ya la corriste.
-- Se puede ejecutar más de una vez.
--
--   1. Lista de 17 sectores que cubre las 11 facultades de la UNI (si ya existe uno con el mismo slug, se actualiza).
--      El sector "Banca" de prueba pasa a llamarse "Banca y finanzas" y conserva su slug.
--   2. Fuente "otro": la URL es opcional para whatsapp y otro.
--   3. registrar_oferta() recibe el campo opcional "sector" (slug). Un sector que no existe o está inactivo se rechaza.

begin;

-- 1. Sectores
do $$
declare
  r record;
begin
  for r in
    select * from (values
    ('Banca y finanzas', 'banca', 'Bancos, financieras, seguros, mercado de capitales y fintech.'),
    ('Construcción e infraestructura', 'construccion-infraestructura', 'Obras civiles, edificaciones, carreteras, saneamiento e ingeniería de proyectos.'),
    ('Arquitectura, urbanismo y diseño', 'arquitectura-urbanismo-diseno', 'Estudios de arquitectura, planeamiento urbano, diseño de interiores y diseño.'),
    ('Minería y metalurgia', 'mineria-metalurgia', 'Exploración, operación minera, procesamiento de minerales, fundición y refinación.'),
    ('Petróleo, gas y petroquímica', 'petroleo-gas-petroquimica', 'Hidrocarburos, gas natural, refinación y petroquímica.'),
    ('Energía y electricidad', 'energia-electricidad', 'Generación, transmisión y distribución eléctrica; energías renovables.'),
    ('Telecomunicaciones', 'telecomunicaciones', 'Operadores, redes, fibra óptica, telefonía y servicios de conectividad.'),
    ('Tecnología y software', 'tecnologia-software', 'Desarrollo de software, servicios de TI, datos, ciberseguridad y nube.'),
    ('Industria y manufactura', 'industria-manufactura', 'Plantas industriales, metalmecánica, automatización y producción.'),
    ('Química, farmacéutica y textil', 'quimica-farmaceutica-textil', 'Industria química, laboratorios farmacéuticos, cosmética y textil.'),
    ('Agroindustria y pesca', 'agroindustria-pesca', 'Agroexportación, alimentos procesados, pesca y acuicultura.'),
    ('Consumo masivo y retail', 'consumo-masivo-retail', 'Supermercados, tiendas, marcas de consumo y comercio minorista.'),
    ('Logística y transporte', 'logistica-transporte', 'Almacenes, distribución, transporte, puertos y cadena de suministro.'),
    ('Consultoría y servicios profesionales', 'consultoria-servicios-profesionales', 'Consultoras, auditoría, estudios de ingeniería y servicios a empresas.'),
    ('Sector público y regulación', 'sector-publico-regulacion', 'Ministerios, organismos reguladores, municipalidades y empresas del Estado.'),
    ('Educación e investigación', 'educacion-investigacion', 'Universidades, institutos, colegios y centros de investigación.'),
    ('Medio ambiente y sostenibilidad', 'medio-ambiente-sostenibilidad', 'Gestión ambiental, residuos, agua, cambio climático y sostenibilidad.')
    ) as t(nombre, slug, descripcion)
  loop
    update public.sectores
       set nombre = r.nombre, descripcion = r.descripcion, estado = 'activo'
     where slug = r.slug;
    if not found then
      insert into public.sectores (nombre, slug, descripcion) values (r.nombre, r.slug, r.descripcion);
    end if;
  end loop;
end
$$;

-- 2. Fuentes permitidas y URL opcional
alter table public.ofertas drop constraint if exists ofertas_fuente_check;
alter table public.ofertas
  add constraint ofertas_fuente_check
  check (fuente in ('linkedin', 'bumeran', 'computrabajo', 'empleos_peru', 'whatsapp', 'otro')) not valid;

alter table public.ofertas drop constraint if exists ofertas_url_check;
alter table public.ofertas
  add constraint ofertas_url_check
  check (url is not null or fuente in ('whatsapp', 'otro'));

-- 3. Función actualizada
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
    sector_id, fecha_publicacion, fuente, url, estado, huella_deduplicacion, carreras_pendientes
  ) values (
    null, false, v_empresa_orig, v_puesto, v_ubicacion,
    v_sector_id, v_fecha, v_fuente, v_url, 'pendiente', v_huella, v_pendientes
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

commit;

-- Comprobación final
select
  (select count(*) from public.sectores where estado = 'activo')                                                    as sectores_activos,
  (select pg_get_constraintdef(oid) from pg_constraint where conname = 'ofertas_fuente_check'
     and conrelid = 'public.ofertas'::regclass) like '%otro%'                                                      as fuente_otro_ok,
  has_function_privilege('anon', 'public.registrar_oferta(text, jsonb)', 'execute')                                as anon_ejecuta,
  has_function_privilege('authenticated', 'public.registrar_oferta(text, jsonb)', 'execute')                       as authenticated_ejecuta;
