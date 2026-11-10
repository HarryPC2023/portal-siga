select comprobacion, resultado, esperado,
       case when resultado = esperado then 'OK' else 'REVISAR' end as estado
from (
  select 1 as n, 'RLS activo en las 12 tablas de Mercado Laboral' as comprobacion,
         (select count(*)::text from pg_class c join pg_namespace s on s.oid = c.relnamespace
           where s.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
             and c.relname in ('facultades','carreras','perfiles_laborales','sectores','competencias','empresas',
                               'ofertas','oferta_carreras','oferta_perfiles','oferta_requisitos',
                               'empresa_clasificacion','empresa_alias')) as resultado,
         '12' as esperado
  union all
  select 2, 'Permisos de lectura de anon/authenticated sobre ofertas, sync_config y las 2 tablas nuevas',
         (select count(*)::text
            from (values ('anon'), ('authenticated')) r(rol)
            cross join (values ('ofertas'), ('sync_config'), ('empresa_clasificacion'), ('empresa_alias')) t(tabla)
           where has_table_privilege(r.rol, 'public.' || t.tabla, 'select')), '0'
  union all
  select 3, 'Las 2 tablas nuevas tienen su política que lo niega todo',
         (select count(*)::text from pg_policies
           where schemaname = 'public' and tablename in ('empresa_clasificacion', 'empresa_alias')
             and cmd = 'ALL' and qual = 'false'), '2'
  union all
  select 4, 'La vista pública ofertas_publicas sigue con 8 columnas y sin empresa_en_texto',
         (select count(*)::text || '/' || bool_and(attname <> 'empresa_en_texto')::text
            from pg_attribute where attrelid = 'public.ofertas_publicas'::regclass and attnum > 0 and not attisdropped), '8/true'
  union all
  select 5, 'anon puede ejecutar alguna función admin_*',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'admin\_%' and has_function_privilege('anon', p.oid, 'execute')), '0'
  union all
  select 6, 'Envoltorios admin_* que existen en public (los usa la página): 4 de empresas + 8 de la bandeja de revisión',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('admin_listar_empresas','admin_crear_empresa','admin_verificar_empresa','admin_agregar_alias',
             'admin_listar_ofertas','admin_vincular_empresa_oferta','admin_asignar_sector_oferta','admin_carrera_oferta',
             'admin_resolver_carrera_pendiente','admin_requisito_oferta','admin_cambiar_estado_oferta','admin_publicar_ofertas_completas')), '12'
  union all
  select 7, 'registrar_oferta: ¿la ejecuta anon? (sí, con el secreto) y ¿authenticated? (no)',
         has_function_privilege('anon', 'public.registrar_oferta(text, jsonb)', 'execute')::text || '/' ||
         has_function_privilege('authenticated', 'public.registrar_oferta(text, jsonb)', 'execute')::text, 'true/false'
  union all
  select 8, 'Funciones de Mercado que siguen como SECURITY DEFINER en public (lo que marcaba el Security Advisor)',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.prosecdef and p.proname in ('registrar_oferta','admin_listar_empresas','admin_crear_empresa','admin_verificar_empresa','admin_agregar_alias','admin_listar_ofertas','admin_vincular_empresa_oferta','admin_asignar_sector_oferta','admin_carrera_oferta','admin_resolver_carrera_pendiente','admin_requisito_oferta','admin_cambiar_estado_oferta','admin_publicar_ofertas_completas')), '0'
  union all
  select 9, 'Sigue la restricción v4: empresa_id solo con el nombre confirmado',
         (select (count(*) > 0)::text from pg_constraint
           where conrelid = 'public.ofertas'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%empresa_id%' and pg_get_constraintdef(oid) ilike '%nombre_empresa_confirmado%'), 'true'
  union all
  select 10, 'Competencias: existen las columnas nuevas (categoria, deteccion, descripcion)',
         (select count(*)::text from information_schema.columns
           where table_schema = 'public' and table_name = 'competencias' and column_name in ('categoria', 'deteccion', 'descripcion')), '3'
  union all
  select 11, 'Competencias: todas con categoría y detección válidas (0 = ninguna mal)',
         (select count(*)::text from public.competencias c
           where coalesce(to_jsonb(c) ->> 'categoria', '') not in ('herramienta', 'norma', 'conocimiento', 'metodologia', 'actividad', 'certificacion')
              or coalesce(to_jsonb(c) ->> 'deteccion', '') not in ('auto', 'revisar')), '0'
  union all
  select 12, 'Competencias: anon puede leer y nadie puede escribir (true/false)',
         has_table_privilege('anon', 'public.competencias', 'select')::text || '/' ||
         (has_table_privilege('anon', 'public.competencias', 'insert') or has_table_privilege('anon', 'public.competencias', 'update')
          or has_table_privilege('authenticated', 'public.competencias', 'insert') or has_table_privilege('authenticated', 'public.competencias', 'update')
          or has_table_privilege('authenticated', 'public.competencias', 'delete'))::text, 'true/false'
  union all
  select 13, 'Competencias: ningún término (nombre o variante) pertenece a dos competencias',
         (select count(*)::text from (select lower(t) from public.competencias c, unnest(array[c.nombre] || c.variantes) as t
                                       where c.estado = 'activa' group by lower(t) having count(distinct c.slug) > 1) y), '0'
  union all
  select 14, 'Las 13 funciones reales viven en private, con SECURITY DEFINER y search_path vacío',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'private' and p.prosecdef and coalesce(p.proconfig @> array['search_path=""'], false)
             and p.proname in ('registrar_oferta','admin_listar_empresas','admin_crear_empresa','admin_verificar_empresa','admin_agregar_alias','admin_listar_ofertas','admin_vincular_empresa_oferta','admin_asignar_sector_oferta','admin_carrera_oferta','admin_resolver_carrera_pendiente','admin_requisito_oferta','admin_cambiar_estado_oferta','admin_publicar_ofertas_completas')), '13'
  union all
  select 15, 'anon puede ejecutar las funciones admin_* de private (debe ser 0) y registrar_oferta de private (debe ser true)',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'private' and p.proname like 'admin\_%' and has_function_privilege('anon', p.oid, 'execute'))
         || '/' || has_function_privilege('anon', 'private.registrar_oferta(text, jsonb)', 'execute')::text, '0/true'
  union all
  select 16, 'La tabla carrera_competencias_esperadas ya no existe (se quitó en la migración 11)',
         (to_regclass('public.carrera_competencias_esperadas') is null)::text, 'true'
  union all
  select 17, 'No queda ninguna función *_competencia_esperada (en public ni en private)',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname in ('public', 'private') and p.proname like '%competencia\_esperada'), '0'
  union all
  select 18, 'ofertas: existen las columnas motivo_revision y revisada_en',
         (select count(*)::text from information_schema.columns
           where table_schema = 'public' and table_name = 'ofertas' and column_name in ('motivo_revision', 'revisada_en')), '2'
) x
order by n;
