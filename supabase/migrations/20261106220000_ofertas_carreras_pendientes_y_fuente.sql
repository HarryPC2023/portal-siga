-- Migración 1 de 2 — columna de carreras sin reconocer y lista cerrada de fuentes.
-- Se puede ejecutar más de una vez sin problema.

begin;

-- Carreras mencionadas en la oferta que todavía no existen en el catálogo (para revisarlas y normalizarlas luego)
alter table public.ofertas
  add column if not exists carreras_pendientes text[] not null default '{}';

-- Lista cerrada de fuentes. NOT VALID: se exige desde ahora en filas nuevas y no toca las filas de prueba que ya existen
-- (cuando las limpies se puede activar del todo con: alter table public.ofertas validate constraint ofertas_fuente_check;)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ofertas_fuente_check' and conrelid = 'public.ofertas'::regclass
  ) then
    alter table public.ofertas
      add constraint ofertas_fuente_check
      check (fuente in ('linkedin', 'bumeran', 'computrabajo', 'empleos_peru')) not valid;
  end if;
end
$$;

commit;
