-- Migración 17 — Catálogo de organizaciones: tipo de organización, sector «Agua y saneamiento» y 193 organizaciones.
-- Se puede ejecutar más de una vez sin problema. TODO el trabajo va dentro de UN solo bloque (do $migracion$ ... $migracion$):
-- el editor de Supabase ejecuta cada instrucción por separado, y un bloque único es atómico: si algo falla, no queda nada a medias.
--
-- Qué hace (todo acordado contigo):
--   1. Crea el catálogo «tipos_organizacion» (5 tipos) y la columna tipo_organizacion_id en empresa_clasificacion.
--      Una organización sin tipo es «pendiente» (igual que los tipos de puesto); no bloquea nada.
--   2. Agrega el sector «Agua y saneamiento» (los otros 17 no se tocan).
--   3. Agrega a empresas la restricción de estado: solo «activa» o «inactiva» (hoy todas son «activa»).
--   4. Une, sin duplicar, las 5 filas que ya existían con nombre parcial: Movistar pasa a ser Integratel Perú; Buenaventura,
--      Engie Perú y Pluz Energía se completan; «Entel Perú» ya tenía el nombre completo y recibe a «Entel» de tu lista.
--      Las filas conservan su identificador, así que nada que las use se rompe.
--   5. Agrega las organizaciones nuevas (solo si no existe ya una con ese nombre, aunque difiera en tildes o mayúsculas)
--      y clasifica las 193 (tipo, sector principal, estado de verificación). Las 4 verificadas con fuente quedan «verificadas»; el resto,
--      «sin verificar». Osinergmin pasa de «Sector público» a «Energía y electricidad».
--   6. Registra los 5 alias confirmados con fuente. Se hace DESPUÉS de renombrar, porque la base rechaza un alias igual al nombre
--      de otra organización (por eso «Movistar» solo puede ser alias cuando ya no es una organización).
--   7. Las 6 organizaciones que ya estaban y no figuran en tu lista (Camposol, DP World Callao, JJC Contratistas, Neptunia, Ransa,
--      Ripley) conservan nombre y sector; solo reciben el tipo «Organización privada».
--
-- Qué NO hace: no cambia funciones, políticas ni permisos existentes; no crea tablas de relación con carreras; no toca ofertas.
-- «Lima Arquitectura» no se carga (pendiente de identificación). Los cálculos del Mapa no cambian: el catálogo solo identifica
-- organizaciones, y el Mapa sigue contando únicamente ofertas reales.

do $migracion$
begin

  -- 1. Tipos de organización (mismo modelo que tipos_puesto) -----------------------------------------------------------------
  create table if not exists public.tipos_organizacion (
    id          uuid primary key default gen_random_uuid(),
    nombre      text not null check (length(btrim(nombre)) between 1 and 80),
    slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    descripcion text check (descripcion is null or length(descripcion) <= 200),
    orden       integer not null default 0,
    estado      text not null default 'activo' check (estado in ('activo', 'inactivo')),
    created_at  timestamptz not null default now()
  );

  alter table public.tipos_organizacion enable row level security;
  drop policy if exists lectura_publica on public.tipos_organizacion;
  create policy lectura_publica on public.tipos_organizacion for select using (true);
  revoke all on public.tipos_organizacion from anon, authenticated;
  grant select on public.tipos_organizacion to anon, authenticated;

  insert into public.tipos_organizacion (nombre, slug, descripcion, orden) values
    ('Organización privada', 'organizacion-privada', 'Empresas con fines de lucro, asociaciones y organizaciones privadas sin fines de lucro.', 1),
    ('Empresa estatal', 'empresa-estatal', 'Empresas del Estado, incluidas las financieras públicas.', 2),
    ('Organismo regulador', 'organismo-regulador', 'Organismos que regulan y supervisan un sector.', 3),
    ('Entidad pública', 'entidad-publica', 'Ministerios, programas, organismos ejecutores y demás entidades del Estado.', 4),
    ('Organismo técnico especializado', 'organismo-tecnico-especializado', 'Organismos públicos técnicos especializados.', 5)
  on conflict (slug) do nothing;

  alter table public.empresa_clasificacion add column if not exists tipo_organizacion_id uuid references public.tipos_organizacion(id);

  -- 2. Sector nuevo --------------------------------------------------------------------------------------------------------
  insert into public.sectores (nombre, slug, descripcion)
  select 'Agua y saneamiento', 'agua-saneamiento', 'Agua potable, alcantarillado, tratamiento de aguas y su regulación.'
  where not exists (select 1 from public.sectores where slug = 'agua-saneamiento');

  -- 3. Estado de las organizaciones: solo activa o inactiva (inactiva conserva el historial pero ya no se usa para nuevas asociaciones)
  if not exists (select 1 from pg_constraint where conrelid = 'public.empresas'::regclass and conname = 'empresas_estado_check') then
    alter table public.empresas add constraint empresas_estado_check check (estado in ('activa', 'inactiva'));
  end if;

  -- Catálogo aprobado (nombre, tipo, sector principal, ¿verificada con fuente?, nota) ---------------------------------------
  create temporary table _catalogo (nombre text, tipo text, sector text, verificada boolean, nota text) on commit drop;
  insert into _catalogo values
    ('Integratel Perú', 'organizacion-privada', 'telecomunicaciones', true, 'antes Telefónica del Perú (desde 10-jun-2025); opera con la marca Movistar'),
    ('Claro', 'organizacion-privada', 'telecomunicaciones', false, 'razón social por confirmar'),
    ('Entel Perú', 'organizacion-privada', 'telecomunicaciones', false, 'tu lista decía «Entel»'),
    ('Bitel', 'organizacion-privada', 'telecomunicaciones', false, 'razón social por confirmar'),
    ('Huawei Perú', 'organizacion-privada', 'telecomunicaciones', false, NULL),
    ('Ericsson', 'organizacion-privada', 'telecomunicaciones', false, NULL),
    ('Osiptel', 'organismo-regulador', 'telecomunicaciones', false, NULL),
    ('BCP', 'organizacion-privada', 'banca', false, NULL),
    ('BBVA Perú', 'organizacion-privada', 'banca', false, NULL),
    ('Interbank', 'organizacion-privada', 'banca', false, NULL),
    ('Scotiabank Perú', 'organizacion-privada', 'banca', false, NULL),
    ('Credicorp Capital', 'organizacion-privada', 'banca', false, NULL),
    ('Prima AFP', 'organizacion-privada', 'banca', false, NULL),
    ('Pacífico Seguros', 'organizacion-privada', 'banca', false, NULL),
    ('Rímac Seguros', 'organizacion-privada', 'banca', false, NULL),
    ('Mibanco', 'organizacion-privada', 'banca', false, NULL),
    ('Niubiz', 'organizacion-privada', 'banca', false, NULL),
    ('Banco de la Nación', 'empresa-estatal', 'banca', false, NULL),
    ('COFIDE', 'empresa-estatal', 'banca', false, NULL),
    ('Fondo Mivivienda', 'empresa-estatal', 'banca', false, NULL),
    ('Agrobanco', 'empresa-estatal', 'banca', false, NULL),
    ('SBS', 'organismo-regulador', 'banca', false, NULL),
    ('SMV', 'organismo-regulador', 'banca', false, NULL),
    ('Banco Central de Reserva del Perú', 'entidad-publica', 'banca', false, NULL),
    ('Alicorp', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Backus', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Gloria', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Nestlé Perú', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Arca Continental Lindley', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('San Fernando', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('AJE Group', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Procter & Gamble', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Unilever', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Clorox Perú', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Falabella', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Saga Falabella', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Tottus', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Sodimac', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Intercorp Retail', 'organizacion-privada', 'consumo-masivo-retail', false, 'holding del grupo'),
    ('InRetail Perú', 'organizacion-privada', 'consumo-masivo-retail', false, 'holding de supermercados, farmacias y Real Plaza'),
    ('Plaza Vea', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Vivanda', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Inkafarma', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Oechsle', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Promart', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Real Plaza', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Cencosud', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Wong', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Metro', 'organizacion-privada', 'consumo-masivo-retail', false, NULL),
    ('Pluz Energía Perú', 'organizacion-privada', 'energia-electricidad', true, 'antes Enel Distribución Perú (cambio de nombre en 2024)'),
    ('Luz del Sur', 'organizacion-privada', 'energia-electricidad', false, NULL),
    ('Engie Energía Perú', 'organizacion-privada', 'energia-electricidad', false, NULL),
    ('Kallpa Generación', 'organizacion-privada', 'energia-electricidad', false, NULL),
    ('Celepsa', 'organizacion-privada', 'energia-electricidad', false, NULL),
    ('ISA REP', 'organizacion-privada', 'energia-electricidad', false, NULL),
    ('Orygen Perú', 'organizacion-privada', 'energia-electricidad', true, 'antes Enel Generación Perú (cambio de denominación social el 24-jun-2024, misma entidad)'),
    ('COES-SINAC', 'organizacion-privada', 'energia-electricidad', false, 'organización privada sin fines de lucro con funciones de derecho público'),
    ('Electroperú', 'empresa-estatal', 'energia-electricidad', false, NULL),
    ('Enosa', 'empresa-estatal', 'energia-electricidad', false, 'razón social: Electronoroeste'),
    ('Hidrandina', 'empresa-estatal', 'energia-electricidad', false, NULL),
    ('Seal', 'empresa-estatal', 'energia-electricidad', false, 'Sociedad Eléctrica del Sur Oeste'),
    ('Osinergmin', 'organismo-regulador', 'energia-electricidad', false, 'también supervisa minería; sector principal: energía'),
    ('Cálidda', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Repsol Perú', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Pluspetrol', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Hunt Oil', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('CNPC Perú', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Olympic Perú', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Petrotal', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Transportadora de Gas del Perú', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Contugas', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Primax', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Solgas', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Schlumberger (SLB)', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Halliburton', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Baker Hughes', 'organizacion-privada', 'petroleo-gas-petroquimica', false, NULL),
    ('Petroperú', 'empresa-estatal', 'petroleo-gas-petroquimica', false, NULL),
    ('Perupetro', 'empresa-estatal', 'petroleo-gas-petroquimica', false, NULL),
    ('Antamina', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Southern Perú', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Cerro Verde', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Minsur', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Compañía de Minas Buenaventura', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Las Bambas', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Volcan Compañía Minera', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Hochschild Mining', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Nexa Resources', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Stracon', 'organizacion-privada', 'mineria-metalurgia', false, NULL),
    ('Ingemmet', 'organismo-tecnico-especializado', 'mineria-metalurgia', false, NULL),
    ('Ferreyros', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Komatsu-Mitsui Maquinarias Perú', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Cummins Perú', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Epiroc', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Sandvik', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Aceros Arequipa', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Siderperú', 'organizacion-privada', 'industria-manufactura', false, 'denominación actual por confirmar'),
    ('Siemens', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('ABB', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Schneider Electric', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Rockwell Automation', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('Cementos Pacasmayo', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('UNACEM', 'organizacion-privada', 'industria-manufactura', false, NULL),
    ('SIMA Perú', 'empresa-estatal', 'industria-manufactura', false, NULL),
    ('Quimpac', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('Linde', 'organizacion-privada', 'quimica-farmaceutica-textil', false, 'antes Praxair; sector por confirmar'),
    ('Química Suiza', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('Textil del Valle', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('Topy Top', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('Creditex', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('Michell & Cía', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('Devanlay Perú', 'organizacion-privada', 'quimica-farmaceutica-textil', false, 'licencia de Lacoste; denominación por confirmar'),
    ('Laboratorios Bagó', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('Hersil', 'organizacion-privada', 'quimica-farmaceutica-textil', false, NULL),
    ('TASA', 'organizacion-privada', 'agroindustria-pesca', false, 'Tecnológica de Alimentos'),
    ('ENACO', 'empresa-estatal', 'agroindustria-pesca', false, NULL),
    ('Lima Airport Partners', 'organizacion-privada', 'logistica-transporte', false, NULL),
    ('Metro de Lima Línea 1', 'organizacion-privada', 'logistica-transporte', false, 'nombre del operador por confirmar'),
    ('Metro de Lima Línea 2', 'organizacion-privada', 'logistica-transporte', false, 'nombre del concesionario por confirmar'),
    ('Rutas de Lima', 'organizacion-privada', 'logistica-transporte', false, 'nombre y situación por confirmar'),
    ('Corpac', 'empresa-estatal', 'logistica-transporte', false, NULL),
    ('Enapu', 'empresa-estatal', 'logistica-transporte', false, NULL),
    ('Serpost', 'empresa-estatal', 'logistica-transporte', false, NULL),
    ('Ositrán', 'organismo-regulador', 'logistica-transporte', false, NULL),
    ('Aenza', 'organizacion-privada', 'construccion-infraestructura', true, 'antes Graña y Montero (cambio de nombre en nov-2020)'),
    ('Cosapi', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('ICCGSA', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Mota-Engil Perú', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Besalco', 'organizacion-privada', 'construccion-infraestructura', false, 'tu lista decía «Besalco Stracon»: ¿una empresa o dos?'),
    ('OHLA', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Sacyr', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Edifica', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Líder Grupo Constructor', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Paz Centenario', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Besco', 'organizacion-privada', 'construccion-infraestructura', false, NULL),
    ('Urbanova', 'organizacion-privada', 'construccion-infraestructura', false, 'grupo Intercorp'),
    ('Provías Nacional', 'entidad-publica', 'construccion-infraestructura', false, NULL),
    ('ANIN', 'entidad-publica', 'construccion-infraestructura', false, 'Autoridad Nacional de Infraestructura (Ley 31841, 2023); situación futura por confirmar: se habló de integrarla a un nuevo ministerio'),
    ('Pronied', 'entidad-publica', 'construccion-infraestructura', false, NULL),
    ('Barclay & Crousse', 'organizacion-privada', 'arquitectura-urbanismo-diseno', false, NULL),
    ('Metropolis', 'organizacion-privada', 'arquitectura-urbanismo-diseno', false, NULL),
    ('LLONAZAMORA', 'organizacion-privada', 'arquitectura-urbanismo-diseno', false, NULL),
    ('Gómez de la Torre & Guerrero Arquitectos', 'organizacion-privada', 'arquitectura-urbanismo-diseno', false, NULL),
    ('McKinsey', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Boston Consulting Group', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('EY', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Deloitte', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('PwC', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('KPMG', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Apoyo Consultoría', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Macroconsult', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Datum Internacional', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Ipsos Perú', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('SGS del Perú', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Bureau Veritas', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Intertek', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Knight Piésold', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Ausenco', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Walsh Perú', 'organizacion-privada', 'consultoria-servicios-profesionales', false, NULL),
    ('Golder Associates', 'organizacion-privada', 'consultoria-servicios-profesionales', false, 'ahora parte de WSP; denominación por confirmar'),
    ('Globant', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('NTT DATA', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Accenture', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Tata Consultancy Services', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Microsoft Perú', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('IBM Perú', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Cisco', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Fortinet', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Indra', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Canvia', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Mercado Libre', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Rappi', 'organizacion-privada', 'tecnologia-software', false, NULL),
    ('Veolia Perú', 'organizacion-privada', 'agua-saneamiento', false, NULL),
    ('Acciona Agua', 'organizacion-privada', 'agua-saneamiento', false, NULL),
    ('Sedapal', 'empresa-estatal', 'agua-saneamiento', false, NULL),
    ('Sunass', 'organismo-regulador', 'agua-saneamiento', false, NULL),
    ('OEFA', 'organismo-tecnico-especializado', 'medio-ambiente-sostenibilidad', false, NULL),
    ('Senace', 'organismo-tecnico-especializado', 'medio-ambiente-sostenibilidad', false, NULL),
    ('Senamhi', 'organismo-tecnico-especializado', 'medio-ambiente-sostenibilidad', false, NULL),
    ('Ministerio del Ambiente', 'entidad-publica', 'medio-ambiente-sostenibilidad', false, NULL),
    ('GRADE', 'organizacion-privada', 'educacion-investigacion', false, 'Grupo de Análisis para el Desarrollo'),
    ('IPEN', 'entidad-publica', 'educacion-investigacion', false, NULL),
    ('IGP', 'entidad-publica', 'educacion-investigacion', false, NULL),
    ('Concytec', 'organismo-tecnico-especializado', 'educacion-investigacion', false, NULL),
    ('Indecopi', 'organismo-tecnico-especializado', 'sector-publico-regulacion', false, NULL),
    ('Sunat', 'organismo-tecnico-especializado', 'sector-publico-regulacion', false, NULL),
    ('Sunafil', 'organismo-tecnico-especializado', 'sector-publico-regulacion', false, NULL),
    ('Susalud', 'organismo-regulador', 'sector-publico-regulacion', false, NULL),
    ('Ministerio de Economía y Finanzas', 'entidad-publica', 'sector-publico-regulacion', false, NULL),
    ('Ministerio de Transportes y Comunicaciones', 'entidad-publica', 'sector-publico-regulacion', false, NULL),
    ('Ministerio de Energía y Minas', 'entidad-publica', 'sector-publico-regulacion', false, NULL),
    ('Ministerio de Vivienda, Construcción y Saneamiento', 'entidad-publica', 'sector-publico-regulacion', false, NULL),
    ('Marina de Guerra del Perú', 'entidad-publica', 'sector-publico-regulacion', false, NULL),
    ('Editora Perú', 'empresa-estatal', 'sector-publico-regulacion', false, NULL);

  -- 4. Filas que ya existían con nombre parcial: se renombran (conservan su identificador) ----------------------------------
  create temporary table _renombres (viejo text, nuevo text) on commit drop;
  insert into _renombres values
    ('Movistar', 'Integratel Perú'),
    ('Buenaventura', 'Compañía de Minas Buenaventura'),
    ('Engie Perú', 'Engie Energía Perú'),
    ('Pluz Energía', 'Pluz Energía Perú');

  update public.empresas e set nombre = r.nuevo
  from _renombres r
  where e.nombre = r.viejo
    and not exists (select 1 from public.empresas x where private.normalizar_nombre(x.nombre) = private.normalizar_nombre(r.nuevo));

  -- 5. Organizaciones nuevas y su clasificación ----------------------------------------------------------------------------
  insert into public.empresas (nombre, estado)
  select c.nombre, 'activa' from _catalogo c
  where not exists (select 1 from public.empresas e where private.normalizar_nombre(e.nombre) = private.normalizar_nombre(c.nombre))
    and not exists (select 1 from public.empresa_alias a where a.alias_normalizado = private.normalizar_nombre(c.nombre));

  insert into public.empresa_clasificacion (empresa_id, sector_id, estado_verificacion, fecha_verificacion, origen, nota, tipo_organizacion_id)
  select e.id, s.id, case when c.verificada then 'verificada' else 'sin_verificar' end, case when c.verificada then current_date end,
         'semilla', c.nota, t.id
  from _catalogo c
  join public.empresas e on private.normalizar_nombre(e.nombre) = private.normalizar_nombre(c.nombre)
  join public.sectores s on s.slug = c.sector
  join public.tipos_organizacion t on t.slug = c.tipo
  on conflict (empresa_id) do update set
    sector_id            = excluded.sector_id,
    tipo_organizacion_id = excluded.tipo_organizacion_id,
    nota                 = coalesce(excluded.nota, public.empresa_clasificacion.nota),
    estado_verificacion  = case when public.empresa_clasificacion.estado_verificacion = 'verificada' or excluded.estado_verificacion = 'verificada'
                                then 'verificada' else 'sin_verificar' end,
    fecha_verificacion   = coalesce(public.empresa_clasificacion.fecha_verificacion, excluded.fecha_verificacion),
    updated_at           = now();

  -- 7. Las organizaciones que ya estaban y no figuran en la lista: solo reciben su tipo
  update public.empresa_clasificacion c set tipo_organizacion_id = t.id, updated_at = now()
  from public.tipos_organizacion t, public.empresas e
  where t.slug = 'organizacion-privada' and e.id = c.empresa_id and c.tipo_organizacion_id is null
    and e.nombre in ('Camposol', 'DP World Callao', 'JJC Contratistas', 'Neptunia', 'Ransa', 'Ripley');

  -- 6. Alias confirmados con fuente (después de renombrar: la base rechaza un alias igual al nombre de otra organización) -----
  insert into public.empresa_alias (empresa_id, alias)
  select e.id, a.alias
  from (values
    ('Integratel Perú', 'Telefónica del Perú'),
    ('Integratel Perú', 'Movistar'),
    ('Aenza', 'Graña y Montero'),
    ('Pluz Energía Perú', 'Enel Distribución Perú'),
    ('Orygen Perú', 'Enel Generación Perú')
  ) as a(organizacion, alias)
  join public.empresas e on e.nombre = a.organizacion
  where not exists (select 1 from public.empresas x where private.normalizar_nombre(x.nombre) = private.normalizar_nombre(a.alias))  -- si ya existe una organización con ese nombre, no se registra como alias
  on conflict (alias_normalizado) do nothing;

  perform pg_notify('pgrst', 'reload schema');
end
$migracion$;

-- Comprobación final (valores esperados al ejecutarla por primera vez, si no creaste otras organizaciones a mano; si alias sale menor a 5,
-- es que ya existía una organización con el nombre de algún alias y se respetó) ------------------------------------------------
select
  (select count(*) from public.empresas where estado = 'activa')                                                                   as organizaciones_activas_debe_ser_199,
  (select count(*) from public.empresa_clasificacion where tipo_organizacion_id is not null)                                       as con_tipo_debe_ser_199,
  (select count(*) from public.empresas e where not exists (select 1 from public.empresa_clasificacion c where c.empresa_id = e.id)) as sin_clasificacion_debe_ser_0,
  (select count(*) from public.empresa_clasificacion where estado_verificacion = 'verificada')                                     as verificadas_debe_ser_4,
  (select count(*) from public.empresa_alias)                                                                                      as alias_debe_ser_5,
  (select count(*) from public.tipos_organizacion where estado = 'activo')                                                         as tipos_debe_ser_5,
  (select count(*) from public.sectores where slug = 'agua-saneamiento')                                                           as sector_agua_debe_ser_1,
  (select count(*) - count(distinct private.normalizar_nombre(nombre)) from public.empresas)                                       as duplicados_debe_ser_0;
