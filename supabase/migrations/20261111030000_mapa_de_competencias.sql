-- Migración 15 — Funciones del Mapa de Competencias (solo LEEN; no cambian ninguna tabla).
-- Se puede ejecutar más de una vez sin problema, en UNA sola transacción.
--
--   · mapa_filtros()    → las facultades y carreras con cuántas ofertas publicadas tiene cada una, y los sectores (para los filtros).
--   · mapa_competencias(facultad, carrera, sector) → todo lo que muestra el Mapa para esa selección: competencias más solicitadas,
--     distribución por área y por tipo de puesto, combinaciones, empresas y tendencias.
--
-- Reglas (las del acuerdo; los mínimos están como constantes al inicio de cada función):
--   · Solo cuentan ofertas PUBLICADAS, y la carrera solo si está CONFIRMADA. Una oferta vinculada a dos carreras de la misma facultad se
--     cuenta UNA sola vez. Facultad sin carrera = todas las carreras de la facultad.
--   · Muestra de 10 ofertas o más → todo, con porcentajes. De 5 a 9 → solo conteos (sin porcentajes) y la lista de competencias.
--     Menos de 5 → no se devuelve ningún dato, solo cuántas ofertas hay.
--   · Una competencia, una conexión o una empresa solo se muestra si aparece en 3 ofertas o más. Las empresas, además, solo con el
--     nombre confirmado.
--   · Tendencias solo con al menos 3 meses seguidos con 10 ofertas o más cada uno; un mes con menos de 10 muestra su cantidad pero sin porcentajes.
--   · Nunca se devuelve una oferta suelta (ni puesto, ni enlace, ni identificadores): solo totales.
-- Solo pueden usarlas usuarios con sesión (authenticated), igual que el resto de SIGA.

begin;

create or replace function private.mapa_filtros()
returns jsonb language sql stable security definer set search_path = ''
as $$
  with pub as (select o.id, o.sector_id from public.ofertas o where o.estado = 'publicada'),
  por_car as (
    select oc.carrera_id, count(distinct oc.oferta_id) n
    from public.oferta_carreras oc join pub on pub.id = oc.oferta_id
    where oc.confirmado group by oc.carrera_id),
  por_fac as (
    select c.facultad_id, count(distinct oc.oferta_id) n
    from public.oferta_carreras oc join pub on pub.id = oc.oferta_id join public.carreras c on c.id = oc.carrera_id
    where oc.confirmado group by c.facultad_id),
  por_sec as (select sector_id, count(*) n from pub where sector_id is not null group by sector_id)
  select jsonb_build_object(
    'umbrales', jsonb_build_object('completo', 10, 'conteos', 5, 'minimo', 3),
    'total_publicadas', (select count(*) from pub),
    'facultades', coalesce((
      select jsonb_agg(jsonb_build_object(
               'codigo', f.codigo, 'nombre', f.nombre, 'n_ofertas', coalesce(pf.n, 0),
               'carreras', coalesce((select jsonb_agg(jsonb_build_object('slug', c.slug, 'nombre', c.nombre, 'n_ofertas', coalesce(pc.n, 0)) order by c.nombre)
                                      from public.carreras c left join por_car pc on pc.carrera_id = c.id
                                      where c.facultad_id = f.id and c.estado = 'activa'), '[]'::jsonb)
             ) order by f.codigo)
      from public.facultades f left join por_fac pf on pf.facultad_id = f.id
      where f.estado = 'activa'), '[]'::jsonb),
    'sectores', coalesce((
      select jsonb_agg(jsonb_build_object('slug', s.slug, 'nombre', s.nombre, 'n_ofertas', coalesce(ps.n, 0)) order by s.nombre)
      from public.sectores s left join por_sec ps on ps.sector_id = s.id where s.estado = 'activo'), '[]'::jsonb)
  )
$$;

create or replace function private.mapa_competencias(p_facultad text default null, p_carrera text default null, p_sector text default null)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  c_completo constant integer := 10;   -- muestra mínima para mostrar todo (con porcentajes)
  c_conteos  constant integer := 5;    -- muestra mínima para mostrar conteos
  c_minimo   constant integer := 3;    -- mínimo de ofertas para mostrar una competencia, una conexión o una empresa
  c_meses    constant integer := 3;    -- meses seguidos que pide Tendencias
  v_fac text := nullif(upper(btrim(coalesce(p_facultad, ''))), '');
  v_car text := nullif(lower(btrim(coalesce(p_carrera, ''))), '');
  v_sec text := nullif(lower(btrim(coalesce(p_sector, ''))), '');
  v_fac_id uuid; v_car_id uuid; v_sec_id uuid;
  v_fac_nom text; v_car_nom text; v_sec_nom text;
  v_res jsonb;
begin
  if v_fac is not null then
    select f.id, f.nombre into v_fac_id, v_fac_nom from public.facultades f where f.codigo = v_fac and f.estado = 'activa';
    if v_fac_id is null then raise exception 'datos_invalidos: facultad desconocida' using errcode = '22023'; end if;
  end if;
  if v_car is not null then
    select c.id, c.nombre into v_car_id, v_car_nom from public.carreras c
     where c.slug = v_car and c.estado = 'activa' and (v_fac_id is null or c.facultad_id = v_fac_id);
    if v_car_id is null then raise exception 'datos_invalidos: carrera desconocida' using errcode = '22023'; end if;
  end if;
  if v_sec is not null then
    select s.id, s.nombre into v_sec_id, v_sec_nom from public.sectores s where s.slug = v_sec and s.estado = 'activo';
    if v_sec_id is null then raise exception 'datos_invalidos: sector desconocido' using errcode = '22023'; end if;
  end if;

  with base as (
    select o.id, coalesce(o.fecha_publicacion, o.created_at::date) as fecha, o.tipo_puesto_id, o.empresa_id,
           o.nombre_empresa_confirmado as emp_ok, coalesce(o.revisada_en, o.created_at) as act
    from public.ofertas o
    where o.estado = 'publicada'
      and (v_sec_id is null or o.sector_id = v_sec_id)
      and (
        (v_car_id is not null and exists (select 1 from public.oferta_carreras oc where oc.oferta_id = o.id and oc.confirmado and oc.carrera_id = v_car_id))
        or (v_car_id is null and v_fac_id is not null and exists (select 1 from public.oferta_carreras oc join public.carreras c on c.id = oc.carrera_id
                                                                   where oc.oferta_id = o.id and oc.confirmado and c.facultad_id = v_fac_id))
        or (v_car_id is null and v_fac_id is null)
      )
  ),
  tot as (select count(*)::integer n, max(act) act from base),
  niv as (select n, act, case when n >= c_completo then 'completo' when n >= c_conteos then 'conteos' else 'insuficiente' end nivel from tot),
  req as (  -- competencias pedidas por las ofertas de la selección
    select b.id oferta_id, b.fecha, co.id cid, co.slug, co.nombre, co.area, co.categoria, r.tipo
    from base b join public.oferta_requisitos r on r.oferta_id = b.id join public.competencias co on co.id = r.competencia_id and co.estado = 'activa'
  ),
  comp_all as (
    select cid, slug, nombre, area, categoria, count(*)::integer n,
           (count(*) filter (where tipo = 'obligatorio'))::integer n_obl, (count(*) filter (where tipo = 'deseable'))::integer n_des
    from req group by cid, slug, nombre, area, categoria having count(*) >= c_minimo
  ),
  comp as (select * from comp_all order by n desc, nombre limit 15),
  top10 as (select cid from comp_all order by n desc, nombre limit 10),
  areas as (
    select area, count(*)::integer menciones from req group by area having count(*) >= c_minimo
  ),
  area_tot as (select coalesce(sum(menciones), 0)::integer t from areas),
  tipos as (
    select tp.slug, tp.nombre, tp.orden, count(*)::integer n from base b join public.tipos_puesto tp on tp.id = b.tipo_puesto_id group by tp.slug, tp.nombre, tp.orden
  ),
  pares as (
    select a.cid a_id, b2.cid b_id, count(*)::integer n
    from req a join req b2 on b2.oferta_id = a.oferta_id and b2.cid > a.cid
    where a.cid in (select cid from top10) and b2.cid in (select cid from top10)
    group by a.cid, b2.cid having count(*) >= c_minimo order by count(*) desc limit 12
  ),
  emp as (
    select e.nombre, count(*)::integer n from base b join public.empresas e on e.id = b.empresa_id
    where b.emp_ok and e.estado = 'activa' group by e.nombre having count(*) >= c_minimo order by count(*) desc, e.nombre limit 10
  ),
  meses as (select date_trunc('month', fecha)::date m, count(*)::integer n from base group by 1),
  buenos as (select m, n, (m - (row_number() over (order by m)) * interval '1 month')::date grupo from meses where n >= c_completo),
  racha as (select coalesce(max(c), 0)::integer r from (select count(*) c from buenos group by grupo) x),
  top4 as (select cid, slug, nombre from comp order by n desc, nombre limit 4),
  tend as (
    select m.m, m.n,
           case when m.n < c_completo then null else (select jsonb_object_agg(t.slug, round(100.0 * (select count(*) from req q where q.cid = t.cid and date_trunc('month', q.fecha)::date = m.m) / m.n)::integer) from top4 t) end pcts
    from (select m, n from meses order by m desc limit 12) m
  )
  select jsonb_build_object(
    'filtro', jsonb_build_object(
      'facultad', case when v_fac_id is null then null else jsonb_build_object('codigo', v_fac, 'nombre', v_fac_nom) end,
      'carrera',  case when v_car_id is null then null else jsonb_build_object('slug', v_car, 'nombre', v_car_nom) end,
      'sector',   case when v_sec_id is null then null else jsonb_build_object('slug', v_sec, 'nombre', v_sec_nom) end),
    'umbrales', jsonb_build_object('completo', c_completo, 'conteos', c_conteos, 'minimo', c_minimo, 'meses', c_meses),
    'muestra', (select n from niv),
    'nivel', (select nivel from niv),
    'actualizado', (select act::date from niv),
    'competencias', case when (select nivel from niv) = 'insuficiente' then '[]'::jsonb else coalesce((
        select jsonb_agg(jsonb_build_object('slug', slug, 'nombre', nombre, 'area', area, 'categoria', categoria, 'n', n, 'obligatorio', n_obl, 'deseable', n_des,
                                            'pct', case when (select nivel from niv) = 'completo' then round(100.0 * n / (select n from niv))::integer else null end) order by n desc, nombre)
        from comp), '[]'::jsonb) end,
    'areas', case when (select nivel from niv) = 'insuficiente' then '[]'::jsonb else coalesce((
        select jsonb_agg(jsonb_build_object('area', area, 'menciones', menciones,
                                            'pct', case when (select nivel from niv) = 'completo' then round(100.0 * menciones / nullif((select t from area_tot), 0))::integer else null end) order by menciones desc, area)
        from areas), '[]'::jsonb) end,
    'tipos_puesto', case when (select nivel from niv) = 'insuficiente' then jsonb_build_object('items', '[]'::jsonb, 'sin_clasificar', 0) else jsonb_build_object(
        'items', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'nombre', nombre, 'n', n,
                                                               'pct', case when (select nivel from niv) = 'completo' then round(100.0 * n / nullif((select sum(n) from tipos), 0))::integer else null end) order by orden)
                           from tipos), '[]'::jsonb),
        'sin_clasificar', (select n from niv) - coalesce((select sum(n) from tipos), 0)::integer) end,
    'combinaciones', case when (select nivel from niv) = 'insuficiente' then '[]'::jsonb else coalesce((
        select jsonb_agg(jsonb_build_object('a', jsonb_build_object('slug', ca.slug, 'nombre', ca.nombre, 'n', ca.n), 'b', jsonb_build_object('slug', cb.slug, 'nombre', cb.nombre, 'n', cb.n), 'n', p.n) order by p.n desc, ca.nombre, cb.nombre)
        from pares p join comp_all ca on ca.cid = p.a_id join comp_all cb on cb.cid = p.b_id), '[]'::jsonb) end,
    'empresas', case when (select nivel from niv) = 'insuficiente' then '[]'::jsonb else coalesce((select jsonb_agg(jsonb_build_object('nombre', nombre, 'n', n) order by n desc, nombre) from emp), '[]'::jsonb) end,
    'tendencia', case when (select r from racha) >= c_meses and (select nivel from niv) = 'completo' then jsonb_build_object(
        'competencias', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'nombre', nombre) order by nombre) from top4), '[]'::jsonb),
        'meses', coalesce((select jsonb_agg(jsonb_build_object('mes', to_char(m, 'YYYY-MM'), 'n', n, 'pct', pcts) order by m) from tend), '[]'::jsonb)) else null end,
    'tendencia_meses_seguidos', (select r from racha)
  ) into v_res;
  return v_res;
end
$$;

revoke all on function private.mapa_filtros()                         from public, anon;
revoke all on function private.mapa_competencias(text, text, text)   from public, anon;
grant execute on function private.mapa_filtros()                      to authenticated;
grant execute on function private.mapa_competencias(text, text, text) to authenticated;

create or replace function public.mapa_filtros()
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.mapa_filtros() $$;

create or replace function public.mapa_competencias(p_facultad text default null, p_carrera text default null, p_sector text default null)
returns jsonb language sql stable security invoker set search_path = ''
as $$ select private.mapa_competencias(p_facultad, p_carrera, p_sector) $$;

revoke all on function public.mapa_filtros()                         from public, anon;
revoke all on function public.mapa_competencias(text, text, text)   from public, anon;
grant execute on function public.mapa_filtros()                      to authenticated;
grant execute on function public.mapa_competencias(text, text, text) to authenticated;

notify pgrst, 'reload schema';

commit;
