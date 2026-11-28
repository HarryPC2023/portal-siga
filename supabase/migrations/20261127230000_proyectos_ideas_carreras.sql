-- ============================================================================
-- Proyectos Prácticos — carreras en las tarjetas («Puede interesar a»)
-- Ejecutar UNA vez en Supabase → SQL Editor. Es re-ejecutable.
-- Crea la columna `carreras`, que se calcula sola desde la ficha de cada idea:
-- no hay que volver a cargar las ideas ni tocar nada más.
-- ============================================================================

alter table public.proyectos_ideas
    add column if not exists carreras jsonb generated always as (coalesce(ficha -> 'carreras', '[]'::jsonb)) stored;
