-- Migración 11 — Quita la tabla carrera_competencias_esperadas y sus 2 funciones (creadas en la migración 10).
-- Motivo: SIGA ya no compara «lo que enseña la carrera» con «lo que pide el mercado» (decisión del 6 nov 2026): el alumno
-- nota el contraste solo, sin sílabos ni mapas de cursos. La tabla nunca se llenó; no la usa ninguna página.
-- Se puede ejecutar más de una vez sin problema. Todo ocurre en UNA sola transacción.
-- SEGURO: si la tabla tuviera filas, la migración se detiene con un error y NO borra nada.

begin;

do $$
begin
  if to_regclass('public.carrera_competencias_esperadas') is not null then
    if exists (select 1 from public.carrera_competencias_esperadas) then
      raise exception 'carrera_competencias_esperadas tiene filas: no se borra para no perder datos' using errcode = 'P0001';
    end if;
  end if;
end
$$;

-- Funciones: primero los envoltorios de public y luego las reales de private
drop function if exists public.admin_guardar_competencia_esperada(uuid, text, text, text, text, text, text);
drop function if exists public.admin_quitar_competencia_esperada(uuid);
drop function if exists private.admin_guardar_competencia_esperada(uuid, text, text, text, text, text, text);
drop function if exists private.admin_quitar_competencia_esperada(uuid);

-- La tabla (su política, su índice y su restricción se van con ella). Sin CASCADE: si algo dependiera de ella, falla y avisa.
drop table if exists public.carrera_competencias_esperadas;

-- Avisa a la API de Supabase para que refresque su caché de funciones
notify pgrst, 'reload schema';

commit;
