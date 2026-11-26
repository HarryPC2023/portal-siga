-- Proyectos Prácticos — motivo de rechazo de una propuesta (lo escribe Harry en Admin → Proyectos).
-- Por ahora solo se guarda: más adelante se podrá mostrar al autor. Re-ejecutable.
alter table public.proyectos_ideas
  add column if not exists motivo_rechazo text;

alter table public.proyectos_ideas
  drop constraint if exists proyectos_ideas_motivo_largo;

alter table public.proyectos_ideas
  add constraint proyectos_ideas_motivo_largo
  check (motivo_rechazo is null or char_length(motivo_rechazo) <= 300);
