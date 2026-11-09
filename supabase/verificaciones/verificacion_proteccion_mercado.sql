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
  select 6, 'Funciones admin_* que existen (las usa la página)',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('admin_listar_empresas','admin_crear_empresa','admin_verificar_empresa','admin_agregar_alias')), '4'
  union all
  select 7, 'registrar_oferta: ¿la ejecuta anon? (sí, con el secreto) y ¿authenticated? (no)',
         has_function_privilege('anon', 'public.registrar_oferta(text, jsonb)', 'execute')::text || '/' ||
         has_function_privilege('authenticated', 'public.registrar_oferta(text, jsonb)', 'execute')::text, 'true/false'
  union all
  select 8, 'Funciones SECURITY DEFINER de Mercado sin search_path vacío',
         (select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.prosecdef
             and p.proname in ('registrar_oferta','admin_listar_empresas','admin_crear_empresa','admin_verificar_empresa','admin_agregar_alias')
             and not coalesce(p.proconfig @> array['search_path=""'], false)), '0'
  union all
  select 9, 'Sigue la restricción v4: empresa_id solo con el nombre confirmado',
         (select (count(*) > 0)::text from pg_constraint
           where conrelid = 'public.ofertas'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%empresa_id%' and pg_get_constraintdef(oid) ilike '%nombre_empresa_confirmado%'), 'true'
) x
order by n;
