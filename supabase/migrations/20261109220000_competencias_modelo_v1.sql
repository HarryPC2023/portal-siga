-- Migración 7 de 7 — modelo de competencias v1: categoría, forma de detección y descripción; áreas nuevas.
-- Requiere las migraciones 1 a 6. Se puede ejecutar más de una vez.
--
-- QUÉ SE AGREGA A public.competencias
--   categoria    herramienta | norma | conocimiento | metodologia | actividad | certificacion   (qué TIPO de cosa es)
--   deteccion    auto | revisar    («auto»: el motor la marca sola; «revisar»: nunca se marca sola, sale en «Descartadas» para que decidas)
--   descripcion  texto corto para distinguir competencias con nombres parecidos (máx. 200 caracteres)
--   area         YA existía; se mantiene como columna aparte (DÓNDE está). Las 7 áreas actuales pasan a la lista nueva.
--
-- QUÉ NO SE TOCA
--   Ninguna política ni permiso: competencias sigue siendo de solo lectura pública (RLS «lectura_publica», SELECT para
--   anon y authenticated). Las columnas nuevas quedan dentro de ese mismo permiso. registrar_oferta() no cambia.

begin;

alter table public.competencias add column if not exists categoria   text;
alter table public.competencias add column if not exists deteccion   text not null default 'auto';
alter table public.competencias add column if not exists descripcion text;

alter table public.competencias drop constraint if exists competencias_categoria_check;
alter table public.competencias add constraint competencias_categoria_check
  check (categoria is null or categoria in ('herramienta', 'norma', 'conocimiento', 'metodologia', 'actividad', 'certificacion'));
alter table public.competencias drop constraint if exists competencias_deteccion_check;
alter table public.competencias add constraint competencias_deteccion_check check (deteccion in ('auto', 'revisar'));
alter table public.competencias drop constraint if exists competencias_descripcion_check;
alter table public.competencias add constraint competencias_descripcion_check check (descripcion is null or length(descripcion) <= 200);

-- Clasifica las 24 competencias actuales. Solo toca las que aún no tienen categoría, así que repetir la migración
-- nunca pisa un cambio que hagas después a mano.
update public.competencias c
   set area = v.area, categoria = v.categoria, deteccion = v.deteccion, descripcion = v.descripcion
  from (values
    ('excel',                'datos_analisis',         'herramienta',  'auto',    'Hoja de cálculo: fórmulas, tablas dinámicas y macros.'),
    ('power-bi',             'datos_analisis',         'herramienta',  'auto',    'Dashboards e indicadores con Microsoft Power BI.'),
    ('sql',                  'datos_analisis',         'herramienta',  'auto',    'Lenguaje de consultas para bases de datos relacionales.'),
    ('sql-server',           'datos_analisis',         'herramienta',  'auto',    'Base de datos relacional de Microsoft (T-SQL).'),
    ('tableau',              'datos_analisis',         'herramienta',  'auto',    'Visualización de datos y dashboards interactivos.'),
    ('autocad',              'cad_bim',                'herramienta',  'auto',    'Dibujo CAD 2D/3D y elaboración de planos.'),
    ('promodel',             'operaciones_produccion', 'herramienta',  'auto',    'Simulación de procesos y sistemas productivos.'),
    ('lean',                 'operaciones_produccion', 'metodologia',  'auto',    'Mejora continua y reducción de desperdicios en procesos.'),
    ('gestion-de-proyectos', 'gestion_proyectos',      'actividad',    'revisar', 'Planificación, seguimiento y control de proyectos. Mención muy general: se revisa a mano.'),
    ('metodologias-agiles',  'gestion_proyectos',      'metodologia',  'auto',    'Marcos de trabajo iterativos: Scrum, Kanban, entregas cortas.'),
    ('scrum',                'gestion_proyectos',      'metodologia',  'auto',    'Marco ágil con sprints, roles y ceremonias definidas.'),
    ('ingles',               'idiomas',                'conocimiento', 'auto',    'Idioma inglés. El nivel solo se registra si la oferta lo dice.'),
    ('aws',                  'infraestructura_ti',     'herramienta',  'auto',    'Servicios en la nube de Amazon Web Services.'),
    ('azure',                'infraestructura_ti',     'herramienta',  'auto',    'Servicios en la nube de Microsoft Azure.'),
    ('google-cloud',         'infraestructura_ti',     'herramienta',  'auto',    'Servicios en la nube de Google Cloud Platform.'),
    ('cloud-computing',      'infraestructura_ti',     'conocimiento', 'auto',    'Computación en la nube en general, sin una plataforma específica.'),
    ('ciberseguridad',       'infraestructura_ti',     'conocimiento', 'auto',    'Seguridad de la información y protección de sistemas.'),
    ('redes',                'infraestructura_ti',     'conocimiento', 'auto',    'Redes de datos: LAN, WAN, routers y switches.'),
    ('cpp',                  'programacion',           'herramienta',  'auto',    'Lenguaje de programación C++.'),
    ('java',                 'programacion',           'herramienta',  'auto',    'Lenguaje de programación Java.'),
    ('javascript',           'programacion',           'herramienta',  'auto',    'Lenguaje de programación JavaScript.'),
    ('python',               'programacion',           'herramienta',  'auto',    'Lenguaje de programación Python.'),
    ('erp',                  'sistemas_empresariales', 'conocimiento', 'auto',    'Sistemas de planificación de recursos empresariales, en general.'),
    ('sap',                  'sistemas_empresariales', 'herramienta',  'auto',    'Software empresarial SAP (módulos ERP).')
  ) as v(slug, area, categoria, deteccion, descripcion)
 where c.slug = v.slug and c.categoria is null;

-- Si hay alguna competencia que no se clasificó (por ejemplo una que agregaste a mano), se detiene todo y no se cambia nada.
do $$
declare faltan text;
begin
  select string_agg(slug, ', ' order by slug) into faltan from public.competencias where categoria is null;
  if faltan is not null then
    raise exception 'Hay competencias sin categoría: %. Clasifícalas (o dímelas) y vuelve a ejecutar.', faltan;
  end if;
end
$$;
alter table public.competencias alter column categoria set not null;

create index if not exists idx_competencias_categoria on public.competencias (categoria);

commit;

-- Comprobación final ------------------------------------------------------------------------------------------------
select
  (select count(*) from public.competencias)                                                          as competencias,
  (select count(*) from public.competencias where categoria is null)                                   as sin_categoria_debe_ser_0,
  (select string_agg(categoria || '=' || n, ', ' order by categoria) from (select categoria, count(*) n from public.competencias group by categoria) x) as por_categoria,
  (select count(*) from public.competencias where deteccion = 'revisar')                               as en_revision,
  (select string_agg(area || '=' || n, ', ' order by area) from (select area, count(*) n from public.competencias group by area) x) as por_area,
  has_table_privilege('anon', 'public.competencias', 'select')                                         as anon_lee,
  has_table_privilege('anon', 'public.competencias', 'insert') or has_table_privilege('authenticated', 'public.competencias', 'update') as alguien_escribe_debe_ser_false;
