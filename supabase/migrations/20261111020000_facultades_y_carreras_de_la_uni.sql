-- Migración 14 — Facultades y carreras de la UNI: las mismas 11 facultades y 31 carreras que ya usa Intranotas
-- (archivo intranotas/facultades-datos.js). Se puede ejecutar más de una vez sin problema, en UNA sola transacción.
--
-- Para qué sirve:
--   · El sistema reconoce las carreras de TODAS las facultades cuando una oferta las menciona (antes solo conocía Ingeniería de
--     Sistemas: las demás quedaban «sin reconocer» y había que vincularlas a mano en la bandeja).
--   · El filtro Facultad → Carrera del Mapa de Competencias tendrá de dónde leer.
-- Qué NO hace: no cambia lo que ya existe. La facultad FIIS y la carrera Ingeniería de Sistemas se quedan tal cual (mismo id);
--   solo se agrega lo que falta. No toca tablas, permisos ni políticas.
-- Los nombres son idénticos a los de Intranotas (con tildes), porque así es como se reconocen en las ofertas.

begin;

-- 1. Facultades (el código es la sigla que Intranotas guarda en el perfil del alumno)
insert into public.facultades (nombre, codigo) values
  ('Facultad de Arquitectura, Urbanismo y Artes', 'FAUA'),
  ('Facultad de Ciencias', 'FC'),
  ('Facultad de Ingeniería Ambiental', 'FIA'),
  ('Facultad de Ingeniería Civil', 'FIC'),
  ('Facultad de Ingeniería Eléctrica y Electrónica', 'FIEE'),
  ('Facultad de Ingeniería Económica, Estadística y Ciencias Sociales', 'FIEECS'),
  ('Facultad de Ingeniería Geológica, Minera y Metalúrgica', 'FIGMM'),
  ('Facultad de Ingeniería Industrial y de Sistemas', 'FIIS'),
  ('Facultad de Ingeniería Mecánica', 'FIM'),
  ('Facultad de Ingeniería de Petróleo, Gas Natural y Petroquímica', 'FIP'),
  ('Facultad de Ingeniería Química y Textil', 'FIQT')
on conflict (codigo) do nothing;

-- 2. Carreras. Se agrega solo la que no exista ya, ni por su identificador ni por su nombre.
insert into public.carreras (nombre, slug, facultad_id)
select v.nombre, v.slug, f.id
from (values
  ('Arquitectura', 'arquitectura', 'FAUA'),
  ('Urbanismo y Artes', 'urbanismo-y-artes', 'FAUA'),
  ('Ingeniería Física', 'ingenieria-fisica', 'FC'),
  ('Física', 'fisica', 'FC'),
  ('Química', 'quimica', 'FC'),
  ('Matemáticas', 'matematicas', 'FC'),
  ('Ciencias de la Computación', 'ciencias-de-la-computacion', 'FC'),
  ('Ingeniería Sanitaria', 'ingenieria-sanitaria', 'FIA'),
  ('Higiene y Seguridad Industrial', 'higiene-y-seguridad-industrial', 'FIA'),
  ('Ingeniería Ambiental', 'ingenieria-ambiental', 'FIA'),
  ('Ingeniería Civil', 'ingenieria-civil', 'FIC'),
  ('Ingeniería Eléctrica', 'ingenieria-electrica', 'FIEE'),
  ('Ingeniería Electrónica', 'ingenieria-electronica', 'FIEE'),
  ('Ingeniería de Telecomunicaciones', 'ingenieria-de-telecomunicaciones', 'FIEE'),
  ('Ingeniería Económica', 'ingenieria-economica', 'FIEECS'),
  ('Ingeniería Estadística', 'ingenieria-estadistica', 'FIEECS'),
  ('Ingeniería de Minas', 'ingenieria-de-minas', 'FIGMM'),
  ('Ingeniería Geológica', 'ingenieria-geologica', 'FIGMM'),
  ('Ingeniería Metalúrgica', 'ingenieria-metalurgica', 'FIGMM'),
  ('Ingeniería Industrial', 'ingenieria-industrial', 'FIIS'),
  ('Ingeniería de Sistemas', 'ingenieria-de-sistemas', 'FIIS'),
  ('Ingeniería de Inteligencia Artificial', 'ingenieria-de-inteligencia-artificial', 'FIIS'),
  ('Ingeniería de Software', 'ingenieria-de-software', 'FIIS'),
  ('Ingeniería Mecánica', 'ingenieria-mecanica', 'FIM'),
  ('Ingeniería Mecánica-Eléctrica', 'ingenieria-mecanica-electrica', 'FIM'),
  ('Ingeniería Mecatrónica', 'ingenieria-mecatronica', 'FIM'),
  ('Ingeniería Naval', 'ingenieria-naval', 'FIM'),
  ('Ingeniería de Petróleo y Gas Natural', 'ingenieria-de-petroleo-y-gas-natural', 'FIP'),
  ('Ingeniería Petroquímica', 'ingenieria-petroquimica', 'FIP'),
  ('Ingeniería Química', 'ingenieria-quimica', 'FIQT'),
  ('Ingeniería Textil', 'ingenieria-textil', 'FIQT')
) as v(nombre, slug, sigla)
join public.facultades f on f.codigo = v.sigla
where not exists (
  select 1 from public.carreras c
  where c.slug = v.slug or lower(btrim(c.nombre)) = lower(btrim(v.nombre))
);

-- Avisa a la API de Supabase para que refresque su caché.
notify pgrst, 'reload schema';

commit;
