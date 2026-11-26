-- ============================================================================
-- Proyectos Prácticos — propuestas de usuarios (se ejecuta DESPUÉS de los 4 archivos anteriores)
-- Permite que una persona con sesión envíe una idea: queda «pendiente» y solo la ve su autor y tú.
-- Es re-ejecutable (IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ============================================================================

-- 1) Consentimiento y cómo mostrar al autor ----------------------------------
alter table public.proyectos_ideas add column if not exists acepta_publicar boolean not null default false;
alter table public.proyectos_ideas add column if not exists mostrar_autor   boolean not null default false;

-- 2) Reglas que una propuesta de usuario siempre debe cumplir -----------------
--    (las ideas curadas por ti no se ven afectadas)
alter table public.proyectos_ideas drop constraint if exists proyectos_ideas_usuario_reglas;
alter table public.proyectos_ideas add constraint proyectos_ideas_usuario_reglas check (
    origen = 'curada'
    or (acepta_publicar = true                       -- sin consentimiento no se recibe
        and length(resumen) <= 700
        and length(ficha::text) <= 12000             -- tope de tamaño de la ficha enviada
        and id ~ '^usr-[a-z0-9]{10,24}$')            -- las propuestas usan su propio espacio de ids
);

-- 3) Cada persona ve sus propias propuestas (necesario para mostrarle «tus propuestas» y para contar el límite)
drop policy if exists proyectos_ideas_autor_leer on public.proyectos_ideas;
create policy proyectos_ideas_autor_leer on public.proyectos_ideas
    for select to authenticated
    using (autor_id = (select auth.uid()));

-- 4) Enviar una propuesta: solo como «pendiente», de origen «usuario», a su nombre y con máximo 3 pendientes a la vez
drop policy if exists proyectos_ideas_usuario_insertar on public.proyectos_ideas;
create policy proyectos_ideas_usuario_insertar on public.proyectos_ideas
    for insert to authenticated
    with check (
        estado = 'pendiente'
        and origen = 'usuario'
        and autor_id = (select auth.uid())
        and (select count(*) from public.proyectos_ideas p
             where p.autor_id = (select auth.uid()) and p.estado = 'pendiente') < 3
    );

-- Las políticas de administrador (leer, insertar, editar, borrar todo) del archivo 1 siguen igual.
