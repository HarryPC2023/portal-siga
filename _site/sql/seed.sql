-- ============================================================
-- SIGA · Opiniones — Seed generado desde perfiles_*_ciclo.json
-- Cursos: 64 | Profesores: 125 | Perfiles: 189
-- ============================================================

insert into cursos (nombre, codigo, carrera, ciclo_ref, slug) values
('Cálculo Diferencial', null, null, 1, 'calculo-diferencial'),
('Geometría Analítica', null, null, 1, 'geometria-analitica'),
('Química I', null, null, 1, 'quimica-i'),
('Redacción', null, null, 1, 'redaccion'),
('Introducción a la Computación', null, null, 1, 'introduccion-a-la-computacion'),
('Ética y Filosofía Política', null, null, 1, 'etica-y-filosofia-politica'),
('Dibujo en Ingeniería', null, null, 1, 'dibujo-en-ingenieria'),
('Desarrollo Personal', null, null, 1, 'desarrollo-personal'),
('Intro. Sistemas', null, 'sistemas', 1, 'intro-sistemas'),
('Intro. Industrial', null, 'industrial', 1, 'intro-industrial'),
('Intro. Software', null, 'software', 1, 'intro-software'),
('Cálculo Integral', null, null, 2, 'calculo-integral'),
('Álgebra Lineal', null, null, 2, 'algebra-lineal'),
('Algoritmia y Estructura de Datos', null, null, 2, 'algoritmia-y-estructura-de-datos'),
('Química II', null, null, 2, 'quimica-ii'),
('Realidad Nacional', null, null, 2, 'realidad-nacional'),
('TGS', null, 'sistemas', 2, 'tgs'),
('Psicología Sistémica', null, 'sistemas', 2, 'psicologia-sistemica'),
('Sistemas Biológicos', null, 'sistemas', 2, 'sistemas-biologicos'),
('TCS', null, 'sistemas', 2, 'tcs'),
('Física I', null, null, 2, 'fisica-i'),
('Dibujo y Geometría Descriptiva', null, null, 2, 'dibujo-y-geometria-descriptiva'),
('Matemática Discreta', null, null, 2, 'matematica-discreta'),
('Cálculo Multivariable', null, null, 3, 'calculo-multivariable'),
('Metodología de la Investigación', null, null, 3, 'metodologia-de-la-investigacion'),
('Estadística y Probabilidades', null, null, 3, 'estadistica-y-probabilidades'),
('Diseño asistido por Computador', null, null, 3, 'diseno-asistido-por-computador'),
('Termodinámica', null, null, 3, 'termodinamica'),
('TCSA', null, null, 3, 'tcsa'),
('Programación Orientada a Objetos', null, null, 3, 'programacion-orientada-a-objetos'),
('Arquitectura de Computadoras I', null, null, 3, 'arquitectura-de-computadoras-i'),
('Lenguajes de la Programación I', null, null, 3, 'lenguajes-de-la-programacion-i'),
('Algoritmia Avanzada', null, null, 3, 'algoritmia-avanzada'),
('Ecuaciones Diferenciales', null, null, 4, 'ecuaciones-diferenciales'),
('Física II', null, null, 4, 'fisica-ii'),
('Cálculo Numérico', null, null, 4, 'calculo-numerico'),
('Modelado Conceptual de Datos', null, null, 4, 'modelado-conceptual-de-datos'),
('Estadística Aplicada', null, null, 4, 'estadistica-aplicada'),
('Metodología de Sistemas Blandos', null, 'sistemas', 4, 'metodologia-de-sistemas-blandos'),
('Lenguaje de programación', null, null, 4, 'lenguaje-de-programacion'),
('Físico Química y Operaciones Unitarias', null, 'industrial', 4, 'fisico-quimica-y-operaciones-unitarias'),
('Economía General', null, null, 4, 'economia-general'),
('Análisis y Modelamiento de Datos', null, null, 4, 'analisis-y-modelamiento-de-datos'),
('Ingeniería de Requerimientos I', null, null, 4, 'ingenieria-de-requerimientos-i'),
('Lenguaje de Programación II', null, null, 4, 'lenguaje-de-programacion-ii'),
('Sistemas Operativos', null, null, 4, 'sistemas-operativos'),
('Investigación de Operaciones I', null, null, 5, 'investigacion-de-operaciones-i'),
('Diseño de Base de Datos', null, null, 5, 'diseno-de-base-de-datos'),
('Matemática Aplicada', null, null, 5, 'matematica-aplicada'),
('Teoría Organizacional', null, null, 5, 'teoria-organizacional'),
('Ingeniería de Procesos', null, 'industrial', 5, 'ingenieria-de-procesos'),
('Electricidad y Electrónica Industrial', null, 'industrial', 5, 'electricidad-y-electronica-industrial'),
('Ingeniería de Materiales', null, 'industrial', 5, 'ingenieria-de-materiales'),
('Procesos Industriales I', null, 'industrial', 5, 'procesos-industriales-i'),
('Contabilidad Financiera', null, null, 5, 'contabilidad-financiera'),
('Sociología', null, null, 5, 'sociologia'),
('Ingeniería del trabajo', null, 'industrial', 5, 'ingenieria-del-trabajo'),
('Análisis y Diseño de Sistemas', null, 'sistemas', 6, 'analisis-y-diseno-de-sistemas'),
('Arquitectura Computacional y Redes', null, 'sistemas', 6, 'arquitectura-computacional-y-redes'),
('Arquitectura Empresarial', null, 'sistemas', 6, 'arquitectura-empresarial'),
('Dinámica de Sistemas', null, 'sistemas', 6, 'dinamica-de-sistemas'),
('Investigación de Operaciones II', null, 'sistemas', 6, 'investigacion-de-operaciones-ii'),
('Modelado de Procesos de Ciclo de Vida de Sistemas', null, 'sistemas', 6, 'modelado-de-procesos-de-ciclo-de-vida-de-sistemas'),
('Sistema y Gestión Financiera', null, 'sistemas', 6, 'sistema-y-gestion-financiera');

insert into profesores (nombre, slug) values
('Alejandrina Huarcaya', 'alejandrina-huarcaya'),
('Alejandro Huaman', 'alejandro-huaman'),
('Alexander Bonifacio', 'alexander-bonifacio'),
('Alfredo Aguero', 'alfredo-aguero'),
('Alfredo Marino Ramos Muñoz', 'alfredo-marino-ramos-munoz'),
('Ana León', 'ana-leon'),
('Antonio Zegarra', 'antonio-zegarra'),
('Aníval Torre', 'anival-torre'),
('Benito Ostos', 'benito-ostos'),
('Bilma Osorio', 'bilma-osorio'),
('Carlos Arámbulo', 'carlos-arambulo'),
('Carlos Chafloque', 'carlos-chafloque'),
('Carlos Muñoz Inga', 'carlos-munoz-inga'),
('Carlos Nelson Ramos Montes', 'carlos-nelson-ramos-montes'),
('Carlos Neyra', 'carlos-neyra'),
('Carlos Sánchez', 'carlos-sanchez'),
('Carlos Sánchez Huaringa', 'carlos-sanchez-huaringa'),
('Carmen Lau', 'carmen-lau'),
('Celedonio Méndez', 'celedonio-mendez'),
('Cesar Canelo', 'cesar-canelo'),
('Cesar Miranda', 'cesar-miranda'),
('Christian Ayala', 'christian-ayala'),
('Daniel Alcántara', 'daniel-alcantara'),
('Daniel Morillo', 'daniel-morillo'),
('Doris Rojas', 'doris-rojas'),
('Eddie Cueva', 'eddie-cueva'),
('Eduardo Cieza de León', 'eduardo-cieza-de-leon'),
('Eliana Rizabal', 'eliana-rizabal'),
('Eloy Ayala', 'eloy-ayala'),
('Emerson Carranza', 'emerson-carranza'),
('Enrique Chaparro', 'enrique-chaparro'),
('Erick Gustavo Coronel', 'erick-gustavo-coronel'),
('Erik Valenzuela', 'erik-valenzuela'),
('Ernesto Flores Cisneros', 'ernesto-flores-cisneros'),
('Erwin Salas', 'erwin-salas'),
('Fernando Sotomayor', 'fernando-sotomayor'),
('Franco Krajnik', 'franco-krajnik'),
('Glen Darío Rodríguez', 'glen-dario-rodriguez'),
('Gloria Teresita Huamaní', 'gloria-teresita-huamani'),
('Guillermo Cruz', 'guillermo-cruz'),
('Gómez Viviana', 'gomez-viviana'),
('Hernán Parra', 'hernan-parra'),
('Hiromoto', 'hiromoto'),
('Huanca', 'huanca'),
('Héctor Herrera', 'hector-herrera'),
('Héctor Valdivia', 'hector-valdivia'),
('Jaime San Bartolomé', 'jaime-san-bartolome'),
('Jan Eduardo Cisneros Napravnik', 'jan-eduardo-cisneros-napravnik'),
('Javier Canchano', 'javier-canchano'),
('Javier Echeandía', 'javier-echeandia'),
('Javier Huerta', 'javier-huerta'),
('Javier Sánchez', 'javier-sanchez'),
('Jesus Cernadez', 'jesus-cernadez'),
('Jesus Cossa', 'jesus-cossa'),
('Jesús Antaurco', 'jesus-antaurco'),
('Jesús Cernades', 'jesus-cernades'),
('Joaquín Salcedo', 'joaquin-salcedo'),
('John Valle', 'john-valle'),
('Jorge Leiva', 'jorge-leiva'),
('Jorge Llanos', 'jorge-llanos'),
('Jorge Luis Alvarado', 'jorge-luis-alvarado'),
('Jorge Yangato', 'jorge-yangato'),
('Jose Benites Yarleque', 'jose-benites-yarleque'),
('Jose Caballero', 'jose-caballero'),
('José Benites', 'jose-benites'),
('José Villanueva', 'jose-villanueva'),
('Juan Broncano', 'juan-broncano'),
('Juan Pablo Mansilla López', 'juan-pablo-mansilla-lopez'),
('Juan Romero', 'juan-romero'),
('Juan Sotelo', 'juan-sotelo'),
('Julio Talaverano', 'julio-talaverano'),
('Kala Béjar', 'kala-bejar'),
('Leoncio Palacios', 'leoncio-palacios'),
('Lourdes Kala', 'lourdes-kala'),
('Luis Alberto Lescano', 'luis-alberto-lescano'),
('Luis Callo', 'luis-callo'),
('Luis Lezcano', 'luis-lezcano'),
('Luis Luján', 'luis-lujan'),
('Luis Medina', 'luis-medina'),
('Luis Ulfe', 'luis-ulfe'),
('Margarita Mondragón', 'margarita-mondragon'),
('Maria Curotto', 'maria-curotto'),
('Mario Heinrich Fisfalen', 'mario-heinrich-fisfalen'),
('María Egúsquiza', 'maria-egusquiza'),
('Miguel Cutipa', 'miguel-cutipa'),
('Miguel Navarro', 'miguel-navarro'),
('Miguel Ángel Mosquera', 'miguel-angel-mosquera'),
('Nancy Fukuda', 'nancy-fukuda'),
('Nestor Audante', 'nestor-audante'),
('Ninoska Molina', 'ninoska-molina'),
('Oria Chavarria', 'oria-chavarria'),
('Osmar Bermeo', 'osmar-bermeo'),
('Pablo Edwin López', 'pablo-edwin-lopez'),
('Patricia Ocrospoma', 'patricia-ocrospoma'),
('Paul Tocto', 'paul-tocto'),
('Pedro Acosta', 'pedro-acosta'),
('Percy Cañote', 'percy-canote'),
('Petra Rondinel', 'petra-rondinel'),
('Raquel Chavarri', 'raquel-chavarri'),
('Raúl Huarote', 'raul-huarote'),
('Ricardo Chung Ching', 'ricardo-chung-ching'),
('Rildo Campana', 'rildo-campana'),
('Riquelmer Vasquez', 'riquelmer-vasquez'),
('Rocío Salas Cordero', 'rocio-salas-cordero'),
('Rodolfo Falconi', 'rodolfo-falconi'),
('Rodriguez Ulloa', 'rodriguez-ulloa'),
('Rosario Reyes Acosta', 'rosario-reyes-acosta'),
('Rubén Borja', 'ruben-borja'),
('Samuel Oporto', 'samuel-oporto'),
('Santiago Tarazona', 'santiago-tarazona'),
('Saul Acevedo', 'saul-acevedo'),
('Silvio Quinteros', 'silvio-quinteros'),
('Sinche', 'sinche'),
('Susana Gomez', 'susana-gomez'),
('Teodoro Córdova', 'teodoro-cordova'),
('Tino Reyna', 'tino-reyna'),
('Tobias Aliaga', 'tobias-aliaga'),
('Un Jan Liau Hing', 'un-jan-liau-hing'),
('Vicente Peña', 'vicente-pena'),
('Victor Leyton', 'victor-leyton'),
('Víctor Moncada', 'victor-moncada'),
('Walter Antaurco', 'walter-antaurco'),
('Walter Huallpa', 'walter-huallpa'),
('Yarko Cerna Valdez', 'yarko-cerna-valdez'),
('Yolanda Segura', 'yolanda-segura');

insert into profesor_curso (profesor_id, curso_id)
select p.id, c.id from profesores p, cursos c where p.slug = 'ricardo-chung-ching' and c.slug = 'calculo-diferencial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'osmar-bermeo' and c.slug = 'calculo-diferencial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'riquelmer-vasquez' and c.slug = 'calculo-diferencial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jesus-cernadez' and c.slug = 'calculo-diferencial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'alejandro-huaman' and c.slug = 'calculo-diferencial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'huanca' and c.slug = 'calculo-diferencial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'alexander-bonifacio' and c.slug = 'geometria-analitica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'pedro-acosta' and c.slug = 'geometria-analitica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'riquelmer-vasquez' and c.slug = 'geometria-analitica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'victor-moncada' and c.slug = 'geometria-analitica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'javier-echeandia' and c.slug = 'geometria-analitica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'kala-bejar' and c.slug = 'geometria-analitica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'daniel-alcantara' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'bilma-osorio' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'nancy-fukuda' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rosario-reyes-acosta' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-chafloque' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'petra-rondinel' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'erik-valenzuela' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'susana-gomez' and c.slug = 'quimica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'raquel-chavarri' and c.slug = 'redaccion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'saul-acevedo' and c.slug = 'redaccion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'maria-curotto' and c.slug = 'redaccion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rildo-campana' and c.slug = 'redaccion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'miguel-navarro' and c.slug = 'introduccion-a-la-computacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jesus-cossa' and c.slug = 'introduccion-a-la-computacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'raul-huarote' and c.slug = 'introduccion-a-la-computacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'anival-torre' and c.slug = 'introduccion-a-la-computacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'daniel-morillo' and c.slug = 'intro-industrial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jose-villanueva' and c.slug = 'intro-industrial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'eloy-ayala' and c.slug = 'etica-y-filosofia-politica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rildo-campana' and c.slug = 'etica-y-filosofia-politica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-sanchez-huaringa' and c.slug = 'etica-y-filosofia-politica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'victor-moncada' and c.slug = 'dibujo-en-ingenieria'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-callo' and c.slug = 'dibujo-en-ingenieria'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'erwin-salas' and c.slug = 'intro-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jorge-yangato' and c.slug = 'intro-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'javier-sanchez' and c.slug = 'intro-software'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'walter-antaurco' and c.slug = 'intro-software'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'doris-rojas' and c.slug = 'desarrollo-personal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-arambulo' and c.slug = 'calculo-integral'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'miguel-cutipa' and c.slug = 'calculo-integral'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'huanca' and c.slug = 'calculo-integral'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'juan-broncano' and c.slug = 'calculo-integral'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'lourdes-kala' and c.slug = 'algebra-lineal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'alejandro-huaman' and c.slug = 'algebra-lineal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'sinche' and c.slug = 'algebra-lineal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jesus-cernades' and c.slug = 'algebra-lineal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'juan-sotelo' and c.slug = 'algoritmia-y-estructura-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jesus-cossa' and c.slug = 'algoritmia-y-estructura-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'nestor-audante' and c.slug = 'algoritmia-y-estructura-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'pedro-acosta' and c.slug = 'algoritmia-y-estructura-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'daniel-alcantara' and c.slug = 'quimica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-chafloque' and c.slug = 'quimica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-lezcano' and c.slug = 'quimica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'nancy-fukuda' and c.slug = 'quimica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'susana-gomez' and c.slug = 'quimica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'margarita-mondragon' and c.slug = 'realidad-nacional'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'ana-leon' and c.slug = 'realidad-nacional'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'javier-huerta' and c.slug = 'realidad-nacional'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-sanchez-huaringa' and c.slug = 'realidad-nacional'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jesus-antaurco' and c.slug = 'tgs'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'mario-heinrich-fisfalen' and c.slug = 'tgs'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-neyra' and c.slug = 'psicologia-sistemica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'patricia-ocrospoma' and c.slug = 'psicologia-sistemica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'christian-ayala' and c.slug = 'sistemas-biologicos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'javier-canchano' and c.slug = 'tcs'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jorge-llanos' and c.slug = 'tcs'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rocio-salas-cordero' and c.slug = 'tcs'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'juan-romero' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'hector-valdivia' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'percy-canote' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'miguel-angel-mosquera' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'vicente-pena' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'joaquin-salcedo' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'antonio-zegarra' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jaime-san-bartolome' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-callo' and c.slug = 'dibujo-y-geometria-descriptiva'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jose-benites' and c.slug = 'matematica-discreta'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'alexander-bonifacio' and c.slug = 'matematica-discreta'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'paul-tocto' and c.slug = 'matematica-discreta'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'gomez-viviana' and c.slug = 'desarrollo-personal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rildo-campana' and c.slug = 'desarrollo-personal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'hiromoto' and c.slug = 'desarrollo-personal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'raquel-chavarri' and c.slug = 'desarrollo-personal'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jorge-luis-alvarado' and c.slug = 'calculo-multivariable'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'javier-echeandia' and c.slug = 'calculo-multivariable'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'osmar-bermeo' and c.slug = 'calculo-multivariable'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'hector-herrera' and c.slug = 'calculo-multivariable'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'ricardo-chung-ching' and c.slug = 'calculo-multivariable'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'franco-krajnik' and c.slug = 'metodologia-de-la-investigacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'ernesto-flores-cisneros' and c.slug = 'metodologia-de-la-investigacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-alberto-lescano' and c.slug = 'metodologia-de-la-investigacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'gloria-teresita-huamani' and c.slug = 'metodologia-de-la-investigacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rodolfo-falconi' and c.slug = 'metodologia-de-la-investigacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'yolanda-segura' and c.slug = 'estadistica-y-probabilidades'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'yarko-cerna-valdez' and c.slug = 'estadistica-y-probabilidades'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'miguel-cutipa' and c.slug = 'estadistica-y-probabilidades'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-munoz-inga' and c.slug = 'diseno-asistido-por-computador'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'eduardo-cieza-de-leon' and c.slug = 'diseno-asistido-por-computador'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'santiago-tarazona' and c.slug = 'termodinamica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-chafloque' and c.slug = 'termodinamica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'victor-moncada' and c.slug = 'termodinamica'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'mario-heinrich-fisfalen' and c.slug = 'tcsa'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rocio-salas-cordero' and c.slug = 'tcsa'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'pablo-edwin-lopez' and c.slug = 'programacion-orientada-a-objetos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'glen-dario-rodriguez' and c.slug = 'programacion-orientada-a-objetos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'erick-gustavo-coronel' and c.slug = 'programacion-orientada-a-objetos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jorge-leiva' and c.slug = 'arquitectura-de-computadoras-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'walter-huallpa' and c.slug = 'fisica-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-arambulo' and c.slug = 'ecuaciones-diferenciales'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'juan-broncano' and c.slug = 'ecuaciones-diferenciales'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'benito-ostos' and c.slug = 'ecuaciones-diferenciales'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'ricardo-chung-ching' and c.slug = 'ecuaciones-diferenciales'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'juan-romero' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'joaquin-salcedo' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'miguel-angel-mosquera' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jaime-san-bartolome' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'percy-canote' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'antonio-zegarra' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'vicente-pena' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'walter-huallpa' and c.slug = 'fisica-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'fernando-sotomayor' and c.slug = 'calculo-numerico'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'walter-huallpa' and c.slug = 'calculo-numerico'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'miguel-cutipa' and c.slug = 'calculo-numerico'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'glen-dario-rodriguez' and c.slug = 'modelado-conceptual-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'tino-reyna' and c.slug = 'modelado-conceptual-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'yarko-cerna-valdez' and c.slug = 'estadistica-aplicada'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'yolanda-segura' and c.slug = 'estadistica-aplicada'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'erwin-salas' and c.slug = 'metodologia-de-sistemas-blandos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'mario-heinrich-fisfalen' and c.slug = 'metodologia-de-sistemas-blandos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rodriguez-ulloa' and c.slug = 'metodologia-de-sistemas-blandos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'teodoro-cordova' and c.slug = 'lenguaje-de-programacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-lujan' and c.slug = 'lenguaje-de-programacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'erick-gustavo-coronel' and c.slug = 'lenguaje-de-programacion'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'hernan-parra' and c.slug = 'fisico-quimica-y-operaciones-unitarias'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rosario-reyes-acosta' and c.slug = 'fisico-quimica-y-operaciones-unitarias'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'silvio-quinteros' and c.slug = 'economia-general'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'cesar-miranda' and c.slug = 'economia-general'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'margarita-mondragon' and c.slug = 'economia-general'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'leoncio-palacios' and c.slug = 'economia-general'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'juan-pablo-mansilla-lopez' and c.slug = 'analisis-y-modelamiento-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'alfredo-marino-ramos-munoz' and c.slug = 'ingenieria-de-requerimientos-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jan-eduardo-cisneros-napravnik' and c.slug = 'lenguaje-de-programacion-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-nelson-ramos-montes' and c.slug = 'sistemas-operativos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'cesar-canelo' and c.slug = 'investigacion-de-operaciones-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-medina' and c.slug = 'investigacion-de-operaciones-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'samuel-oporto' and c.slug = 'investigacion-de-operaciones-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-ulfe' and c.slug = 'investigacion-de-operaciones-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'tino-reyna' and c.slug = 'diseno-de-base-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jose-caballero' and c.slug = 'diseno-de-base-de-datos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'paul-tocto' and c.slug = 'matematica-aplicada'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'eddie-cueva' and c.slug = 'matematica-aplicada'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'doris-rojas' and c.slug = 'teoria-organizacional'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'eliana-rizabal' and c.slug = 'teoria-organizacional'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'alejandrina-huarcaya' and c.slug = 'ingenieria-de-procesos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'eliana-rizabal' and c.slug = 'ingenieria-de-procesos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'ninoska-molina' and c.slug = 'ingenieria-de-procesos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'julio-talaverano' and c.slug = 'ingenieria-de-procesos'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'santiago-tarazona' and c.slug = 'electricidad-y-electronica-industrial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jose-benites-yarleque' and c.slug = 'electricidad-y-electronica-industrial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'guillermo-cruz' and c.slug = 'ingenieria-de-materiales'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'alfredo-aguero' and c.slug = 'ingenieria-de-materiales'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'bilma-osorio' and c.slug = 'procesos-industriales-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'hernan-parra' and c.slug = 'procesos-industriales-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'petra-rondinel' and c.slug = 'procesos-industriales-i'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'victor-leyton' and c.slug = 'contabilidad-financiera'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rodolfo-falconi' and c.slug = 'contabilidad-financiera'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'ana-leon' and c.slug = 'contabilidad-financiera'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'raquel-chavarri' and c.slug = 'sociologia'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carlos-sanchez' and c.slug = 'sociologia'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'eloy-ayala' and c.slug = 'sociologia'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'maria-egusquiza' and c.slug = 'ingenieria-del-trabajo'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'carmen-lau' and c.slug = 'ingenieria-del-trabajo'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jesus-antaurco' and c.slug = 'analisis-y-diseno-de-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'miguel-navarro' and c.slug = 'analisis-y-diseno-de-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'ruben-borja' and c.slug = 'arquitectura-computacional-y-redes'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'emerson-carranza' and c.slug = 'arquitectura-computacional-y-redes'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'enrique-chaparro' and c.slug = 'arquitectura-empresarial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'tobias-aliaga' and c.slug = 'arquitectura-empresarial'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'jorge-llanos' and c.slug = 'dinamica-de-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'celedonio-mendez' and c.slug = 'dinamica-de-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'cesar-canelo' and c.slug = 'investigacion-de-operaciones-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-lujan' and c.slug = 'investigacion-de-operaciones-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'luis-medina' and c.slug = 'investigacion-de-operaciones-ii'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'rodriguez-ulloa' and c.slug = 'modelado-de-procesos-de-ciclo-de-vida-de-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'un-jan-liau-hing' and c.slug = 'modelado-de-procesos-de-ciclo-de-vida-de-sistemas'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'oria-chavarria' and c.slug = 'sistema-y-gestion-financiera'
union all
select p.id, c.id from profesores p, cursos c where p.slug = 'john-valle' and c.slug = 'sistema-y-gestion-financiera';

insert into perfiles_profesor (profesor_curso_id, resumen, que_esperar, exigencia, carga_trabajo, ritmo, claridad, recomendaciones, fuente)
select pc.id, 'Va lento, se desvía del tema y exige tu procedimiento exacto.', 'Clases lentas y con frecuentes desvíos del tema (a veces habla de política). Toma asistencia siempre y exige que sigas su método de resolución al pie de la letra: aunque tu respuesta esté bien, te puede quitar puntos si no lo hiciste a su manera.', 4, 3, 2, 2, 'Haz todas sus tareas y solucionarios, y sigue su método exacto de resolución aunque tu respuesta ya esté correcta.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ricardo-chung-ching' and cu.slug = 'calculo-diferencial'
union all
select pc.id, 'Explica claro, avanza rápido y corrige planchas grupales en clase.', 'Empieza con teoría por PPT y sigue con ejercicios prácticos que resuelve en pizarra (algo desordenada). Avanza rápido, termina el sílabo un mes antes, y deja planchas grupales en Univirtual que corrige en la siguiente clase.', 3, 3, 4, 4, 'Siéntate adelante (habla bajo) y resuelve las planchas grupales antes de que las corrija en clase.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'osmar-bermeo' and cu.slug = 'calculo-diferencial'
union all
select pc.id, 'Llega muy tarde, avanza poco, pero aprueba fácil con ''rikipoints''.', 'Llega tarde y avanza lento (a veces solo un ejercicio por semana). El curso depende de que el salón avance en conjunto ''el Rikilibro'': si tu grupo no colabora, calificará estricto y buscará mandarte a susti.', 3, 2, 1, 2, 'Elige un buen delegado para avanzar el libro y asiste a las asesorías de Núcleo: ahí aprenderás lo que en clase no.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'riquelmer-vasquez' and cu.slug = 'calculo-diferencial'
union all
select pc.id, 'Profe chévere, considera el procedimiento y no exige asistencia.', 'Ambiente relajado: escribe en pizarra o usa diapositivas, valora la participación en práctica y considera el procedimiento al calificar. No es tan exigente con la asistencia, pero llega tarde con frecuencia.', 2, 2, 3, 3, 'Entra a sus asesorías y pide ayuda antes de PC o examen: de ahí suelen salir preguntas parecidas a la evaluación.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jesus-cernadez' and cu.slug = 'calculo-diferencial'
union all
select pc.id, 'Entretenido, generoso con puntos y casi asegura tu aprobación.', 'Clase dinámica con teoría del libro Venero y ejercicios resueltos en vivo. Es generoso calificando (incluso da puntos extra) y muy claro explicando: ser su alumno ya te deja medio aprobado.', 2, 2, 3, 5, 'Estudia del Venero y detalla bien tus procedimientos: casi siempre pesa más que la respuesta final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'alejandro-huaman' and cu.slug = 'calculo-diferencial'
union all
select pc.id, 'Enseña poco, corrige raro; tendrás que ser autodidacta.', 'Clase poco dinámica: pone videos de YouTube de ejercicios y los intenta replicar en pizarra, a veces con errores de cálculo. Avanza lento y con pocos ejercicios, aprenderás más por tu cuenta que en su clase.', 2, 2, 1, 2, 'Estudia con material de otro profesor y argumenta bien tus respuestas: con Huanca serás mayormente autodidacta.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'huanca' and cu.slug = 'calculo-diferencial'
union all
select pc.id, 'Buena pizarra, explica bien y a veces suelta fijas antes del examen.', 'Clases con teoría, ejemplos y demostraciones bien explicadas en pizarra, de las mejores, vale la pena fotografiarlas. No es aburrido y a veces adelanta pistas antes de los exámenes.', 3, 3, 3, 4, 'Fotografía y estudia su teoría en pizarra, y llena toda la hoja de examen: valora el esfuerzo aunque no llegues a la respuesta.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'alexander-bonifacio' and cu.slug = 'geometria-analitica'
union all
select pc.id, 'Clase muy práctica; exige precisión pero da puntos por intentarlo.', 'Casi todo el tiempo de clase resuelve problemas (2-3 por sesión) y busca participación, con poca teoría formal. Corrige revisando bien el detalle del cálculo, pero regala puntos por al menos graficar.', 4, 3, 4, 3, 'Vuelve a resolver por tu cuenta los problemas que hace en clase: ahí sale gran parte del examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'pedro-acosta' and cu.slug = 'geometria-analitica'
union all
select pc.id, 'Curso difícil que depende de la tarea colectiva del salón.', 'Avanza el temario pero conviene reforzar sus explicaciones con otro material. Si el salón coordina hacer ''la tarea'' en conjunto, la nota sube bastante; si no, el curso se complica y toca ser autodidacta.', 3, 3, 3, 2, 'Consigue su libro (última edición) con planchas resueltas: a veces los exámenes repiten preguntas de ahí.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'riquelmer-vasquez' and cu.slug = 'geometria-analitica'
union all
select pc.id, 'Deja bastante trabajo en tareas; aprendes más por tu cuenta.', 'Resuelve planchas (algunas bastante antiguas) explicando propiedades sobre la marcha. En varias clases pone a los alumnos a resolver solos o en grupo, y a veces se ausenta dejando solo la tarea.', 2, 3, 2, 2, 'Entrega siempre la tarea (suma ''Moncapoints'') y resuelve la mayor cantidad de planchas posible por tu cuenta.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'victor-moncada' and cu.slug = 'geometria-analitica'
union all
select pc.id, 'Prioriza la práctica, explica claro y avanza rápido con precisión.', 'Poca teoría formal, mucha resolución de problemas aplicados explicados con claridad. Avanza rápido y es exigente con el detalle técnico (por ejemplo, escribir dominio y rango).', 3, 3, 4, 4, 'Repasa planchas en grupo anotando el paso a paso completo: exige precisión en el procedimiento, no solo el resultado.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'javier-echeandia' and cu.slug = 'geometria-analitica'
union all
select pc.id, 'Exige su método exacto; procedimientos largos y sin concesiones.', 'Teoría entendible aunque a veces densa, resuelve PCs pasadas. Exige seguir su procedimiento exactamente como ella lo enseña: si no, la respuesta vale 0.', 5, 4, 3, 3, 'Asiste a todas sus clases y replica su procedimiento al pie de la letra: con Kala no hay atajos ni métodos alternativos.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'kala-bejar' and cu.slug = 'geometria-analitica'
union all
select pc.id, 'Teoría completa y clara, pero exigente y con bullying frecuente.', 'Dicta teoría completa (todo lo que dicta cae en el examen) combinando pizarra con ejemplos. Tiene fama de hacer bullying en clase, sobre todo si eres delegado, pero comparte material completo y es puntual.', 4, 4, 3, 5, 'Copia absolutamente todo lo que dicta en clase y estudia de tu cuaderno: literalmente todo lo que hace en clase sale en el examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'daniel-alcantara' and cu.slug = 'quimica-i'
union all
select pc.id, 'Muy accesible y flexible; acepta cualquier método bien sustentado.', 'Explica con PPTs y detalla mucho el procedimiento en pizarra. Es considerada y flexible con el método de resolución, aunque suele atrasarse por explicar todo a fondo.', 2, 2, 2, 4, 'Ten asistencia casi perfecta y haz la tarea: con eso solo ya aseguras 3 puntos para el parcial o final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'bilma-osorio' and cu.slug = 'quimica-i'
union all
select pc.id, 'Teoría rápida y básica; conviene reforzar con material de Alcántara.', 'Clase teórica resumida y rápida, con ejemplos por debajo del nivel de examen. En laboratorio pide preinforme y toma un test corto tras cada experimento; siempre conviene rendirlo, aunque califica los reportes de forma inconsistente.', 2, 3, 3, 2, 'Refuerza la teoría de parcial y final con material de Alcántara: lo que ella da en clase no alcanza el nivel del examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'nancy-fukuda' and cu.slug = 'quimica-i'
union all
select pc.id, 'Explica bien pero rápido; participar en clase suma bastante.', 'Buena explicación teórica por diapositivas con tiempo para practicar ejercicios, aunque avanza rápido. Es considerada y valora mucho la participación constante en clase.', 3, 3, 4, 4, 'Participa activamente en clase y resuelve su seminario de preguntas: suman puntos extra directos al parcial o final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rosario-reyes-acosta' and cu.slug = 'quimica-i'
union all
select pc.id, 'Considerado y da fijas, pero sus clases pueden dar sueño.', 'Clases basadas en diapositivas; el profesor es accesible y resuelve dudas cuando se lo pides. Suele adelantar pistas (''fijas'') en las clases previas a los exámenes.', 3, 2, 3, 3, 'Presta mucha atención en las clases previas a cada examen: ahí suelta las fijas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-chafloque' and cu.slug = 'quimica-i'
union all
select pc.id, 'Laboratorio sencillo y organizado, pero habla muy bajo.', 'Organiza bien cada práctica de laboratorio, indicando en pizarra qué hacer y qué va en el informe. Los tests son simples y muy parecidos a la guía de laboratorio.', 2, 2, 3, 3, 'Siéntate adelante (habla muy bajo, incluso con micrófono) y guíate estrictamente de la hoja de práctica: el test sale casi igual.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'petra-rondinel' and cu.slug = 'quimica-i'
union all
select pc.id, 'Profesor tranquilo cuyas clases sí caen en el examen.', 'Explica bien y lo que trabaja en clase suele aparecer directo en la PC. Es accesible para consultas y puntual, aunque deja bastantes hojas de informe en el laboratorio.', 2, 3, 3, 4, 'Resuelve sus dirigidas y repasa sus PPTs a fondo: de ahí sale gran parte de sus PCs.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'erik-valenzuela' and cu.slug = 'quimica-i'
union all
select pc.id, 'Dinámica y entretenida; hay que ser rápido en cada laboratorio.', 'Explica de forma general los experimentos y deja poco tiempo para ejecutarlos, conviene un grupo ágil. Al final toma un test corto (10 min) sobre lo hecho en el laboratorio.', 2, 3, 4, 3, 'Resuelve el seminario apenas lo deje y sal a la pizarra (''Susanapoints''): suma bastante para tu nota.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'susana-gomez' and cu.slug = 'quimica-i'
union all
select pc.id, 'Muy estricta y puntual; aprendes de verdad pero no perdona nada.', 'Combina teoría, ejemplos y evaluación oral/escrita muy exigente en puntualidad y detalle. Prohibido faltar más de 4 clases, y llegar tarde te cierra la puerta salvo en PCs.', 5, 4, 3, 4, 'Asegura tus dos monografías (cuento + fichas bibliográficas) y no faltes nunca: con eso apruebas tranquilo, aunque no ponderes.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'raquel-chavarri' and cu.slug = 'redaccion'
union all
select pc.id, 'El profesor más generoso del ciclo; casi imposible jalar con él.', 'Clases entretenidas con cine, libros y buena onda constante. Deja una tarea semanal cuyo promedio se convierte directamente en tu cuarta PC.', 1, 2, 3, 4, 'Solo asiste a prácticas y cumple las tareas semanales: con eso el curso prácticamente se aprueba solo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'saul-acevedo' and cu.slug = 'redaccion'
union all
select pc.id, 'Todas las clases se expone; usa lenguaje académico complejo.', 'Cada clase hay exposiciones (todos exponen, no siempre los mismos) sobre temas variados. Permite usar cualquier medio de búsqueda de información, incluido ChatGPT.', 2, 3, 3, 2, 'No faltes a clase (toma asistencia siempre) y participa activamente: cuenta bastante para tu nota.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'maria-curotto' and cu.slug = 'redaccion'
union all
select pc.id, 'Fomenta pensamiento crítico pero se desvía mucho del tema.', 'Clase orientada a coyuntura nacional e internacional, con frecuentes desvíos del temario. Fomenta la investigación y el pensamiento crítico más que el contenido puramente técnico.', 3, 3, 2, 3, 'Entrega todas las tareas con anticipación y desarrolla bien el ensayo guiado semanal: ahí muestra que te toma en cuenta.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rildo-campana' and cu.slug = 'redaccion'
union all
select pc.id, 'Poco puntual y se desvía mucho; últimas PCs sí son ponderables.', 'Buena parte de la clase se va en videos y anécdotas personales, con poca resolución de ejercicios en vivo. Es considerado calificando y no exige un diagrama de flujo estricto, solo que tenga lógica.', 2, 2, 2, 2, 'Practica los ejercicios que deja de tarea y busca material extra del lenguaje que estés aprendiendo: en clase se avanza poco.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'miguel-navarro' and cu.slug = 'introduccion-a-la-computacion'
union all
select pc.id, 'Muy impredecible; puede aprobarte fácil o exigir sin piedad.', 'Su exigencia cambia mucho de ciclo a ciclo, así que es difícil predecir cómo calificará. Conviene apoyarte en gente de ciclos superiores que ya haya llevado el curso con él.', 3, 3, 3, 2, 'Búscate ayuda de alguien de ciclos superiores que ya lo haya llevado: es la mejor forma de anticipar cómo te va a ir.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jesus-cossa' and cu.slug = 'introduccion-a-la-computacion'
union all
select pc.id, 'Tranquilo y amable; si tu código compila, ya la hiciste.', 'Presenta PPTs con ejercicios similares a los de clase, incentivando la participación. Es un profesor muy tranquilo: si tu código compila, prácticamente apruebas la evaluación.', 2, 2, 2, 4, 'Escucha bien sus primeras clases teóricas (la PC1 sale de ahí, no del PPT) y que tu delegado le pida que la PC4 sea expo: pondera con nota mínima 15.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'raul-huarote' and cu.slug = 'introduccion-a-la-computacion'
union all
select pc.id, 'Estricto y sin reclamos; sus prácticas se parecen a ciclos anteriores.', 'Explica la teoría tal como está en el PPT y usa ejemplos muy similares a los de la PC. Es estricto calificando (no acepta reclamos) y anula el examen si detecta uso de IA.', 4, 4, 3, 4, 'Domina C++ a nivel intermedio y practica exactamente con sus ejemplos de clase: sus prácticas suelen parecerse mucho a las de ciclos anteriores.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'anival-torre' and cu.slug = 'introduccion-a-la-computacion'
union all
select pc.id, 'Explica claro y casi todos aprueban con él.', 'Clase basada en lectura de PPT con ejemplos bien explicados. Es planchero (sus evaluaciones se parecen a exámenes previos) y muy accesible resolviendo dudas.', 2, 2, 3, 4, 'Consigue planchas de ciclos anteriores y ten un buen grupo para la monografía: con eso el curso se hace fácil.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'daniel-morillo' and cu.slug = 'intro-industrial'
union all
select pc.id, 'Clases prácticas orientadas a la carrera; algo informal e impredecible.', 'Enseña con enfoque práctico sobre la ingeniería industrial real, con visitas a laboratorio semanales. El material principal está en su LiveBinders y depende bastante de lo que el delegado gestione con él.', 3, 3, 3, 3, 'Revisa la teoría de su LiveBinders y mantén buena comunicación vía el delegado: el curso se organiza bastante alrededor de esa relación.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jose-villanueva' and cu.slug = 'intro-industrial'
union all
select pc.id, 'La fija; incluso sin participar te asegura nota aprobatoria.', 'Basa gran parte de la nota en dinámicas grupales y participación registrada por el delegado. El 60% de cada PC es plancha, aunque hay una PC final de filosofía más difícil de ponderar.', 1, 2, 3, 3, 'Asegúrate de que el delegado te registre cuando participes, y prepara bien la última PC (la ''real de filosofía''): es la más difícil de ponderar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'eloy-ayala' and cu.slug = 'etica-y-filosofia-politica'
union all
select pc.id, 'Sabe mucho pero se desvía demasiado; muy estricto con el ensayo.', 'Explica con ejemplos bien sustentados y a veces hace dinámicas grupales, pero se desvía del tema con frecuencia (llegando a perder clases enteras). Es muy exigente con la redacción formal del ensayo.', 4, 3, 2, 3, 'Llega puntual (cierra la puerta) e investiga a fondo el tema de tu ensayo: es muy estricto tanto con el contenido como con la redacción formal.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rildo-campana' and cu.slug = 'etica-y-filosofia-politica'
union all
select pc.id, 'La fija escondida; tolerante y valora mucho la opinión personal.', 'Explica bien apoyado en pizarra, cuenta sus propias experiencias y valora mucho la opinión personal fundamentada. Es tolerante con las tardanzas y sus exámenes no son muy difíciles.', 2, 2, 3, 4, 'Participa siempre respondiendo preguntas (suman puntos, pero también restan si no lo haces) y no dejes el trabajo final para última hora.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-sanchez-huaringa' and cu.slug = 'etica-y-filosofia-politica'
union all
select pc.id, 'Enseña teoría y luego solo problemas; conviene practicar planchas.', 'Primero enseña teoría y después dedica las clases casi enteramente a resolver problemas en pizarra. Llega unos 15 minutos tarde de forma habitual.', 3, 3, 3, 2, 'Practica muchas planchas y cumple con las tareas: dan puntos directos y ayudan a entender mejor que solo escuchar la clase.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'victor-moncada' and cu.slug = 'dibujo-en-ingenieria'
union all
select pc.id, 'Clases áridas y exigentes; hay que anotar y practicar todo.', 'Clases poco dinámicas donde explica sobre todo para sí mismo, conviene sentarse adelante y anotar o fotografiar todo. Es estricto con el método exacto y las herramientas de dibujo.', 4, 4, 2, 2, 'Lleva siempre tus herramientas de dibujo completas y anota cada ejercicio resuelto en clase: casi siempre repite alguno en la PC.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-callo' and cu.slug = 'dibujo-en-ingenieria'
union all
select pc.id, 'Muy exigente y demandante; exige buenas habilidades blandas.', 'Primera vez dictando este curso, pero se sabe que es exigente y con carga equivalente a varios cursos. Forma grupos desde el primer día y evalúa sobre todo la ronda de preguntas tras las exposiciones en Miro: quedarte callado te baja la nota.', 5, 5, 3, 3, 'Prepárate para responder cualquier pregunta tras tu exposición, aunque tengas dudas: quedarte en silencio pesa más que responder mal.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'erwin-salas' and cu.slug = 'intro-sistemas'
union all
select pc.id, 'Sabio pero exigente en expos; aprendes de verdad si prestas atención.', 'Clase muy teórica (todo sale de su conocimiento propio) combinada con proyectos grupales que se exponen al final del ciclo. Es duro en la ronda de preguntas de las exposiciones.', 4, 4, 3, 4, 'Prepárate a profundidad para cualquier pregunta en tus exposiciones: no vayas superficial, ahí es donde más exige.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jorge-yangato' and cu.slug = 'intro-sistemas'
union all
select pc.id, 'Lee su PPT (basado en Sommerville); fácil de aprobar sin aprender mucho.', 'Clases centradas en leer diapositivas extensas (basadas en Ian Sommerville) con comentarios propios. Los exámenes se rinden vía aula virtual, lo que hace fácil aprobar aunque no se aprenda a fondo.', 2, 2, 2, 2, 'Enfócate en preparar bien tu exposición de PC: el profesor se fija más en eso que en el contenido del PPT.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'javier-sanchez' and cu.slug = 'intro-software'
union all
select pc.id, 'Teórico pero accesible; todas las PCs son exposiciones grupales.', 'Combina lectura de diapositivas (basadas en Sommerville) con explicación en pizarra. Todas las PCs son exposiciones grupales sobre herramientas de software, calificadas con generosidad.', 2, 3, 3, 3, 'Aprende bien lo básico de la herramienta que te toque exponer y ten el libro de Sommerville a mano en los exámenes: te deja usarlo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'walter-antaurco' and cu.slug = 'intro-software'
union all
select pc.id, 'Clases dinámicas y fáciles de ponderar; buen apoyo emocional.', 'Clases teóricas con ejemplos y dinámicas donde valora mucho la participación. La primera monografía suele ser un evento grupal (feria de dinámicas o biohuerto) y la segunda es la más importante del curso.', 2, 3, 3, 4, 'Participa constantemente y prioriza la monografía 2: es la que más peso tiene y define si apruebas raspando o con holgura.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'doris-rojas' and cu.slug = 'desarrollo-personal'
union all
select pc.id, 'Enseña muy bien; el salón de examen individual es la mejor opción.', 'Combina teoría con ejemplos y hace preguntas a los alumnos sobre técnicas de integración mientras resuelve. Si te toca su salón de examen individual, repasar lo visto en clase alcanza para aprobar sin mucho drama.', 3, 3, 3, 4, 'Si tienes la opción, prioriza su salón de examen individual: solo con repasar sus ejercicios de clase ya apruebas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-arambulo' and cu.slug = 'calculo-integral'
union all
select pc.id, 'Pizarra puntual pero no es generoso calificando.', 'Sintetiza la teoría de las diapositivas de Intralu y resuelve un par de problemas por tema. Es puntual con lo que entra en cada PC, pero no regala puntos al calificar.', 3, 3, 3, 3, 'Revisa los problemas que deja Broncano (fija entre profesores) y no descuides las integrales inmediatas: vienen seguido en planchitas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'miguel-cutipa' and cu.slug = 'calculo-integral'
union all
select pc.id, 'Apenas enseña; tendrás que ser 100% autodidacta.', 'Usa calculadoras de integrales, GeoGebra y videos, pero no profundiza en la teoría ni resuelve muchos ejercicios (y a veces se confunde en los que intenta). Prácticamente aprenderás por tu cuenta.', 2, 1, 1, 1, 'Estudia por tu cuenta o cuélate con otro profesor: las diapositivas de Broncano son el mejor apoyo que tendrás.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'huanca' and cu.slug = 'calculo-integral'
union all
select pc.id, 'Enseña rápido y claro; sus tareas suben punto y ayudan a ponderar.', 'Clase dinámica y entendible donde no toma asistencia pero espera que sigas el ritmo. Las tareas suben puntos de verdad y suelta fijas casi en cada clase, así que conviene no faltar.', 3, 3, 4, 4, 'No faltes a ninguna clase (suelta fijas casi siempre) y haz todas las tareas: con el Venero a la mano ya tienes mucho ganado.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'juan-broncano' and cu.slug = 'calculo-integral'
union all
select pc.id, 'Clases sustanciosas pero puede ser densa; exige su método extenso.', 'Clases completas donde aprendes bastante, aunque pueden aburrir. Es meticulosa revisando línea por línea y no le gustan los métodos rápidos o simplificados, aunque el resultado sea correcto.', 4, 3, 3, 3, 'Practica variedad de ejercicios apoyándote en su libro, y en clase alza la voz al preguntar: no escucha bien y ahí suelta pistas para el examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'lourdes-kala' and cu.slug = 'algebra-lineal'
union all
select pc.id, 'Buena teoría y da fijas, pero sus clases pueden dar sueño.', 'Escribe teoría en pizarra con máximo 2 ejemplos por tipo de ejercicio. Es considerado al revisar y suele dar fijas antes de los exámenes, aunque sus clases (habla mirando la pizarra) pueden dar sueño.', 2, 2, 2, 3, 'Intenta resolver todos los ejercicios del examen aunque no te salgan del todo: considera el avance, y entrega sus tareas para subir puntos.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'alejandro-huaman' and cu.slug = 'algebra-lineal'
union all
select pc.id, 'Accesible y claro; considera cualquier método bien justificado.', 'Clase clara y concisa donde acepta cualquier método de resolución siempre que esté bien justificado. Puede avanzar rápido y saltarse algún tema en ocasiones.', 3, 2, 4, 4, 'Estudia las dirigidas (suelen repetirse) y complementa con otro libro además del de Kala, como el Proskuriakov, si buscas ponderar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'sinche' and cu.slug = 'algebra-lineal'
union all
select pc.id, 'Explica claro, considera procedimiento y a veces ofrece asesorías.', 'Usa PPTs apoyados en pizarra y motiva a salir a resolver en la pizarra durante la práctica. Considera bien el procedimiento al calificar y a veces da asesorías antes de exámenes importantes.', 3, 3, 3, 4, 'Resuelve la dirigida y las planchas con cronómetro, probando distintos métodos: te ayuda a encontrar el más rápido para el examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jesus-cernades' and cu.slug = 'algebra-lineal'
union all
select pc.id, 'Teoría entendible, pero floja en ejercicios; practica por tu cuenta.', 'Explica claro por PPT y pizarra, aunque avanza pocos ejercicios y estos suelen ser sencillos comparados con otros profesores. Es generoso calificando algoritmos con errores menores.', 2, 2, 2, 4, 'Practica ejercicios más difíciles que los de sus PPTs (cuélate a las clases de Acosta o Audante si puedes) y aprovecha que te deja usar IA en el examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'juan-sotelo' and cu.slug = 'algoritmia-y-estructura-de-datos'
union all
select pc.id, 'Clases amenas pero califica de forma impredecible (bipolar).', 'Ambiente relajado y amigable, con problemas de ''tarea'' cada clase (sin puntos directos, pero algunos aparecen en examen). Su forma de calificar el código puede ser inconsistente de un alumno a otro.', 3, 3, 3, 3, 'Presta atención a los problemas que deja como tarea en clase: varios terminan apareciendo en los exámenes.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jesus-cossa' and cu.slug = 'algoritmia-y-estructura-de-datos'
union all
select pc.id, 'Enseña completo (incluye GitHub) y da fijas; valora mucho la lógica.', 'Enseña algoritmos a fondo apoyándose en pizarra y código, incluyendo herramientas como GitHub. Es muy amable, da fijas para las PCs y hace zoom de revisión de notas antes de publicarlas.', 3, 3, 3, 5, 'Participa activamente y hazte conocer: da bonos de puntos a quien muestra interés, y valora mucho la lógica aunque el ejercicio no quede terminado.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'nestor-audante' and cu.slug = 'algoritmia-y-estructura-de-datos'
union all
select pc.id, 'Curso 100% práctico y exigente; el código que no corre es cero directo.', 'Casi no da teoría: resuelve mínimo 5 ejercicios prácticos por clase y las evaluaciones se parecen mucho a esos ejercicios. Es estricto calificando código, sin compasión si no corre.', 5, 4, 4, 3, 'Resuelve la mayor cantidad de planchas posible y memoriza los ejercicios semanales: el curso es puramente práctico y las evaluaciones se parecen mucho a la clase.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'pedro-acosta' and cu.slug = 'algoritmia-y-estructura-de-datos'
union all
select pc.id, 'El mejor profesor de teoría, pero estricto y sin formulario.', 'Dicta teoría rápida (basada en el Morrison-Boyd) y motiva bastante la participación en clase, con regaño incluido si respondes mal. Las exposiciones semanales valen 4 puntos entre parcial y final.', 4, 4, 4, 5, 'Anota todo en clase y prepárate a fondo tu exposición semanal: su examen sigue de cerca lo que enseña.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'daniel-alcantara' and cu.slug = 'quimica-ii'
union all
select pc.id, 'Enseña muy bien y deja usar formulario; planchero en sus evaluaciones.', 'Clase con más teoría que práctica, y explica bien resolviendo dudas. Permite usar formularios preparados con las reacciones de sus PPTs, útil porque suele repetir contenido en sus evaluaciones.', 3, 3, 2, 4, 'Copia todas las reacciones de sus PPTs en tu formulario y consigue todas las planchas que puedas: suele repetir contenido.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-chafloque' and cu.slug = 'quimica-ii'
union all
select pc.id, 'Casi no enseña; el examen sale directo de sus PPTs de memoria.', 'Clases básicas y algo dispersas, leyendo su PPT con ejemplos poco serios. El examen (de opción múltiple) sale casi textual de sus diapositivas, así que memorizarlas rinde.', 2, 2, 1, 1, 'Memoriza cada dato de sus PPTs y consigue todas las planchas que puedas: de ahí sale prácticamente todo el examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-lezcano' and cu.slug = 'quimica-ii'
union all
select pc.id, 'Explica el laboratorio de forma concisa, pero califica bajo.', 'Solo la verás en laboratorio: explica de forma clara y ayuda si te trabas. El cuestionario de la guía de laboratorio suele repetirse igual en el test.', 3, 2, 3, 3, 'Resuelve siempre el cuestionario de la guía de laboratorio: suele salir igual en el test.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'nancy-fukuda' and cu.slug = 'quimica-ii'
union all
select pc.id, 'Laboratorio tranquilo y con buena nota; pero es terca en sus decisiones.', 'Explica el experimento al inicio y deja tiempo suficiente para desarrollarlo con calma. Da buenas notas de laboratorio y es más flexible que en Química I.', 2, 2, 3, 4, 'Aprovecha que da buena nota de laboratorio, pero no discutas una decisión suya una vez tomada: no cambia de opinión.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'susana-gomez' and cu.slug = 'quimica-ii'
union all
select pc.id, 'Puedes faltar a casi todo; la fija si expones bien (sobre todo temas de minería).', 'Sus clases de teoría son flojas (lee PPT o hace leer a un alumno), pero destaca por sus visitas técnicas, que pueden ser muy útiles para hacer contactos. Exponer sobre minería suele asegurar una nota alta.', 1, 2, 2, 2, 'Prepara bien tu exposición (min 20, con un buen tema aseguras 20) y aprovecha sus visitas técnicas: es lo más valioso del curso con ella.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'margarita-mondragon' and cu.slug = 'realidad-nacional'
union all
select pc.id, 'Clases interactivas y entretenidas; estricta con puntualidad y celulares.', 'Clases muy interactivas debatiendo temas de actualidad, aunque es estricta con la hora de entrada y el uso de celulares en clase. Preparar una noticia actual para el inicio de la sesión suma puntos.', 3, 2, 3, 4, 'No faltes a ninguna clase (afecta directo tus tareas de PC) y prepara bien tus trabajos con buena estructura (objetivos, mapa conceptual).', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ana-leon' and cu.slug = 'realidad-nacional'
union all
select pc.id, 'Clases largas (4h) pero dinámicas; conviene leer sus PDFs con anticipación.', 'Clases de 4 horas con receso cada 45 minutos, estructuradas casi como un conversatorio donde motiva la participación constante. Leer los PDFs de su repositorio y las lecturas para las PCs es clave si faltas.', 3, 3, 3, 4, 'Asiste seguido (ahí suelta las fijas para las PCs) y si faltas, consigue apuntes de compañeros: te puede pasar factura no saber qué se avanzó.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'javier-huerta' and cu.slug = 'realidad-nacional'
union all
select pc.id, 'Curso corto y fácil; con asistir y exponer ya aprobaste.', 'Divide la clase entre teoría breve y exposiciones, siempre acortando el horario. Con ir a las primeras clases y cumplir tu exposición prácticamente ya pasaste.', 1, 2, 2, 3, 'Asiste a las primeras clases y cumple bien tu exposición: con eso el curso se aprueba solo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-sanchez-huaringa' and cu.slug = 'realidad-nacional'
union all
select pc.id, 'La fija; buena teoría y examen de opción múltiple.', 'Explica buena teoría, llega temprano y hasta da consejos sobre la vida universitaria. El examen es de opción múltiple, aunque no hay planchas previas para practicar.', 2, 2, 3, 5, 'Lee bien sus PPTs y el Bertalanffy para la monografía: no hay planchas, así que el material propio es tu única guía.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jesus-antaurco' and cu.slug = 'tgs'
union all
select pc.id, 'Difícil de entender; conviene ser autodidacta y consultarle directo.', 'Lee y explica lo que está en su PPT, pero es difícil de seguir y entender solo con eso. Da 6 puntos por presentar la tarea, aunque exige que la monografía siga exactamente su formato.', 3, 3, 2, 1, 'Pregúntale directamente sobre la monografía y las tareas: su explicación en clase por sí sola no basta para entender bien el curso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'mario-heinrich-fisfalen' and cu.slug = 'tgs'
union all
select pc.id, 'Curso relajado y planchero; cuida no pasarte del tiempo de expo.', 'Clase entretenida que conecta la teoría con casos de la vida real, con dinámicas para generar buen ambiente. Parcial y final vienen casi textual de planchas anteriores, así que ponderar es bastante accesible.', 2, 2, 3, 4, 'Estudia bien de planchas para parcial y final (vienen casi iguales) y no te pases de los 10 minutos en tu exposición: puede jalar a todo el grupo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-neyra' and cu.slug = 'psicologia-sistemica'
union all
select pc.id, 'Casi imposible jalar; parcial y final suelen ser planchazo.', 'Clases tipo charla con recesos frecuentes y buen trato. La monografía es la única actividad realmente exigente; parcial, final y susti suelen repetir contenido de exámenes anteriores.', 1, 2, 3, 4, 'Arma un buen grupo para la monografía y sigue sus indicaciones con avances semanales: es la única parte del curso que de verdad exige esfuerzo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'patricia-ocrospoma' and cu.slug = 'psicologia-sistemica'
union all
select pc.id, 'Amigable y dinámico; las salidas de campo suman bastante.', 'Forma grupos desde la primera clase para explorar un sistema elegido, con exposiciones semanales y salidas de campo (museo o lomas). Es generoso calificando exposiciones, aunque más estricto en parcial y final.', 3, 3, 3, 4, 'Asiste a todas las exposiciones y a la segunda salida de campo: te asegura una nota alta en la monografía casi solo por participar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'christian-ayala' and cu.slug = 'sistemas-biologicos'
union all
select pc.id, 'Curso basado en exposiciones; exige lectura y memorización constante.', 'Clases centradas en exposiciones de entregables con preguntas al final de cada una. Considera el promedio de PCs y monografías en parcial, final y susti, y exige bastante lectura de la TGS y el SEBoK.', 4, 4, 3, 3, 'Lee y memoriza bien la TGS y el SEBoK, y prepara tus exposiciones sin errores: son la base de casi toda tu nota.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'javier-canchano' and cu.slug = 'tcs'
union all
select pc.id, 'Muy exigente y demandante; bajo porcentaje de aprobados.', 'Clases virtuales largas (3-4 horas) leyendo y explicando diapositivas, de ahí sale gran parte del examen. Es muy exigente con la terminología y las prácticas descuentan por respuesta incorrecta.', 5, 4, 3, 3, 'Presta muchísima atención a lo que lee y explica en clase (de ahí sale el examen) y cuida la terminología exacta: es donde más exige.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jorge-llanos' and cu.slug = 'tcs'
union all
select pc.id, 'Clases superficiales pero exigente en prácticas escritas al pie del libro.', 'Explica de forma algo superficial y basa gran parte del curso en exposiciones. Sus prácticas escritas exigen respuestas casi idénticas al libro, así que conviene estudiarlo a fondo.', 3, 3, 2, 2, 'Estudia el libro casi de memoria para sus prácticas escritas: exige respuestas muy cercanas al texto original.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rocio-salas-cordero' and cu.slug = 'tcs'
union all
select pc.id, 'PCs accesibles con ejercicios complementarios, pero examen muy rígido.', 'Reparte el tiempo entre teoría y práctica, preguntando al salón cómo resolver mientras avanza. Sus PCs vienen con un problema fijo de los ejercicios complementarios y da las fijas el mismo día de la PC, aunque en exámenes califica de forma casi mecánica.', 4, 3, 3, 3, 'Resuelve siempre los ejercicios complementarios que deja cada clase — casi siempre cae uno igual en la PC — y aprovecha que se apiada en el susti.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'juan-romero' and cu.slug = 'fisica-i'
union all
select pc.id, 'Enseña muy bien física (teoría y lab), pero es muy puntual y exigente.', 'En teoría llega puntual, revisa tarea y hace preguntas para incentivar participación (bonos de tarea + participación pueden sumar 3 puntos). En laboratorio explica y demuestra las fórmulas antes de que el grupo trabaje, con informe a mano entregable la siguiente semana.', 4, 4, 3, 5, 'Participa en clase y haz sus tareas (suman 3 puntos para parcial y final) y en laboratorio organiza bien a tu grupo desde el inicio: el tiempo es el mayor problema ahí.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'hector-valdivia' and cu.slug = 'fisica-i'
union all
select pc.id, 'Casi no enseña, pero da muchos puntos gratis; difícil de aprovechar.', 'Llega tarde, pone música y lee su cuaderno sin usar pizarra ni demostrar fórmulas. Las PCs son fáciles y planchables, pero el examen real (parcial y final) sale del Serway, no de lo visto en su clase.', 2, 3, 1, 1, 'Estudia del Serway y de las PPTs de Valdivia o Romero para parcial y final — lo que él enseña en clase prácticamente no sirve para el examen real.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'percy-canote' and cu.slug = 'fisica-i'
union all
select pc.id, 'Buena teoría (aunque exige derivar fórmulas); todos aprueban su laboratorio.', 'En teoría explica muy bien en pizarra, aunque exige demostrar fórmulas en vez de aplicarlas directo, y puede ser duro si participas y te equivocas. En laboratorio es respetuoso y prácticamente todos los que asisten aprueban, sin tests de por medio.', 3, 3, 3, 4, 'Practica planchas antes de su examen (repite problemas de Zemansky, Hibbeler o Serway) y si vas a participar en clase, prepárate bien: no tiene piedad humillando si te equivocas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'miguel-angel-mosquera' and cu.slug = 'fisica-i'
union all
select pc.id, 'Solo aparece en las PCs; revisa de forma meticulosa y estricta.', 'Solo lo verás el día de cada PC, revisando las soluciones con mucho detalle y de forma estricta. Se enoja fácil, es cerrado a reclamos, y prácticamente nadie se salva de jalar al menos una PC con él.', 5, 3, 3, 2, 'Fundamenta y ordena muy bien tus soluciones (usa colores, sé prolijo) y aprovecha su seminario antes del parcial: ahí puedes ganar puntos extra.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'vicente-pena' and cu.slug = 'fisica-i'
union all
select pc.id, 'Justo al calificar; planchero pero exige orden y buena letra.', 'Revisa bien las PCs considerando el avance, y suele repetir preguntas de exámenes pasados. Es justo calificando, pero exige orden, buena letra y no olvidar las unidades.', 3, 3, 3, 4, 'Practica mucho y cuida la presentación (orden, letra clara, unidades siempre): le da flojera revisar trabajos desordenados.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'joaquin-salcedo' and cu.slug = 'fisica-i'
union all
select pc.id, 'La fija de fijas; extremadamente comprensible y casi te da las respuestas.', 'Presta atención a clase porque repite en la PC lo mismo o muy parecido a lo resuelto ahí, siempre con el Serway como referencia. En laboratorio explica el experimento con calma y prácticamente lo resuelve contigo si te acercas a su mesa.', 2, 3, 3, 5, 'Repasa bien los ejercicios que hace en clase y ten siempre el Serway a la mano — te da una idea muy clara de cómo vendrán los problemas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'antonio-zegarra' and cu.slug = 'fisica-i'
union all
select pc.id, 'Fácil de aprobar; notas altas en todos los laboratorios.', 'Explica el laboratorio y los pasos a seguir en pizarra, con hoja de datos y test 15 minutos antes de terminar la clase. Las notas suelen ser altas (nadie jaló, mínima nota 12) y es de los profesores más amables en labos.', 1, 2, 3, 4, 'Lee el laboratorio antes de que toque y organiza bien a tu grupo (dividan experimento y test): con eso te sobra tiempo para hacerlo bien.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jaime-san-bartolome' and cu.slug = 'fisica-i'
union all
select pc.id, 'La fija; casi imposible jalar aunque empieces mal.', 'Empieza algo tarde y puede costar seguirlo al inicio, pero los conceptos de la primera parte se usan después, así que vale la pena estudiarlos bien. Es muy considerado si ve que el salón está complicado.', 2, 2, 2, 2, 'Anota o graba sus soluciones en clase (los ejercicios de PC salen de ahí) y no te asustes si la primera PC sale baja: suele nivelar a todo el salón al final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-callo' and cu.slug = 'dibujo-y-geometria-descriptiva'
union all
select pc.id, 'Buena teoría y explica claro; PC4 (proyecto) rinde nota alta.', 'Clase en pizarra apoyada en diapositivas (mismo material que el libro de Bermeo), con ejercicios de complemento. Aprovecha bastante la primera mitad del curso, que suele ser más sencilla para la mayoría.', 3, 3, 3, 4, 'Haz la PC4 (proyecto, no se elimina) con tiempo — suele calificarla con 20 sin problema — y no llegues tarde a su exposición.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jose-benites' and cu.slug = 'matematica-discreta'
union all
select pc.id, 'Explica pausado y entendible, pero no puedes faltar a sus clases.', 'Avanza con calma, dando ejemplos similares a preguntas de exámenes anteriores, aunque buena parte de ese contenido no está en sus PPTs. Sin su explicación en vivo, el material por sí solo rinde poco.', 3, 3, 2, 4, 'No faltes a sus clases (una de ellas da puntos solo por asistir) y busca el libro de Bermeo más planchas para complementar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'alexander-bonifacio' and cu.slug = 'matematica-discreta'
union all
select pc.id, 'Sus ejercicios de clase son fijas; la PC4 es un trabajo de investigación.', 'Presenta cada tema con su aplicación antes de pasar a teoría y problemas, con talleres cada dos clases que suman participación. La PC4 es un trabajo de investigación con avances cada 3 semanas, generalmente difícil de ponderar sin esos puntos.', 3, 3, 3, 4, 'Asiste a todas sus clases (sus ejercicios ahí son fijas, algunos incluso vinieron exactos en la PC) y aprovecha los solucionarios de ciclos pasados que comparte.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'paul-tocto' and cu.slug = 'matematica-discreta'
union all
select pc.id, 'Las clases más entretenidas de Desarrollo Personal; nota alta si le pones ganas.', 'Hace muchas dinámicas y juegos, fomentando la participación y la crítica constructiva. Realmente le importa tu crecimiento personal, y suele dar segundas oportunidades a quien muestra interés genuino.', 3, 3, 3, 5, 'Cuida el formato APA en la carátula de cada trabajo (única traba real del curso) y prepara bien la PC4 (feria de talentos): con algo preparado sacas mínimo 17.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'gomez-viviana' and cu.slug = 'desarrollo-personal'
union all
select pc.id, 'Estricto con la puntualidad y toca temas polémicos; sin ventajas notables.', 'Da 5 minutos de tolerancia y después cierra la puerta. Suele leer PPT y desviarse hacia temas polémicos ajenos al curso, calificando mejor si le caes bien.', 3, 3, 2, 2, 'No faltes nunca (algunas prácticas se avisan solo en clase) y evita discutirle temas polémicos: es peor llevarle la contra.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rildo-campana' and cu.slug = 'desarrollo-personal'
union all
select pc.id, 'Buen profesor con dinámicas divertidas; exige leer el libro del curso.', 'Trabaja con un libro que se expone por capítulos en grupo, seguido de preguntas y feedback, y cierra las clases con juegos y dinámicas grupales. Sus PCs no son complicadas si leíste y sabes fundamentar tus respuestas.', 3, 3, 3, 4, 'Lee el libro del curso con calma (si no te gusta leer, ponderar será difícil) y participa siempre: te descuenta puntos si no respondes cuando te pregunta.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'hiromoto' and cu.slug = 'desarrollo-personal'
union all
select pc.id, 'Muy exigente con la puntualidad; asesora bien la monografía si se lo pides.', 'Es muy exigente con la puntualidad, sobre todo el día de entregas (llega 20 minutos antes o no te deja ni entrar ni entregar). A cambio, asesora bien la monografía y da plazos de avance que ayudan a no atrasarte.', 4, 3, 3, 3, 'Llega siempre con anticipación en días de entrega y pide su asesoría para la monografía: corrige y ayuda a pulir tu trabajo antes del final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'raquel-chavarri' and cu.slug = 'desarrollo-personal'
union all
select pc.id, 'Llega tarde pero enseña bien; su cuaderno vendido resume el curso.', 'Llega tarde y empieza con anécdotas antes de la teoría en pizarra, con un estilo de enseñanza a base de bromas (buena onda). Su cuaderno (vendido por la Sra. Sandra) resume bien el curso y resuelve dudas.', 3, 3, 3, 4, 'Consigue su cuaderno (lo vende la Sra. Sandra) y siempre salúdalo: se molesta en serio si no lo haces.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jorge-luis-alvarado' and cu.slug = 'calculo-multivariable'
union all
select pc.id, 'Explica claro y práctico; exige buen procedimiento y usar colores en gráficas.', 'Combina teoría breve en PPT con bastante práctica de problemas, resolviéndolos en pizarra. Es exigente con el procedimiento y espera que definas bien las funciones y uses colores en las gráficas.', 4, 3, 3, 4, 'Practica full planchas en grupo y usa colores en tus gráficas: da un punto extra en la PC1 solo por eso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'javier-echeandia' and cu.slug = 'calculo-multivariable'
union all
select pc.id, 'Teoría solo en diapositivas; avanza rápido pero resuelve todas las dudas.', 'La teoría va toda en diapositivas, y usa la pizarra solo para resolver problemas con buen ritmo. Responde todas las dudas y no pierde tiempo, aunque habla bajito y sus pizarras pueden ser desordenadas.', 3, 3, 4, 3, 'Revisa el libro de Alvarado (resume todo el curso) y complementa con Stewart o Lázaro: es clave para asegurar el parcial.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'osmar-bermeo' and cu.slug = 'calculo-multivariable'
union all
select pc.id, 'Enseña con calma y detalle desde cero; buena pizarra, sin puntos extra.', 'Clases casi todo en pizarra, explicando con mucho detalle desde lo más básico. Acepta cualquier método válido de resolución y responde cualquier duda con amabilidad, aunque puede ser lento avanzando.', 3, 2, 2, 5, 'No faltes a sus clases (se aprende más escuchándolo que por tu cuenta) y complementa con el cuaderno de Alvarado para reforzar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'hector-herrera' and cu.slug = 'calculo-multivariable'
union all
select pc.id, 'Clase poco útil pero es la fija; siempre saca algo de puntaje.', 'Sus clases se dan en Word o Paint con ejercicios de ejemplo, sin mucha utilidad real para el examen. Su forma de repartir puntos es bastante inconsistente entre alumnos.', 2, 2, 2, 1, 'No dejes ninguna pregunta en blanco (agrega algo de teoría siempre) y no faltes: perder su clase también resta puntos aunque no aprendas mucho ahí.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ricardo-chung-ching' and cu.slug = 'calculo-multivariable'
union all
select pc.id, 'Enseña poco y da sueño; con buen grupo se aprueba por poco.', 'Clases breves con videos al inicio y luego enfoque en la tarea. Depende mucho de tener un buen grupo, ya que el curso apenas se aprueba (ponderar es casi imposible).', 3, 3, 2, 2, 'Consigue un buen grupo y elige bien el tema de exposición: con Krajnik casi todo depende de eso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'franco-krajnik' and cu.slug = 'metodologia-de-la-investigacion'
union all
select pc.id, 'Puntual y planchero; premia el avance constante de la monografía.', 'Primera hora de teoría (PPT o videos) y segunda hora dedicada a revisar el avance semanal de la monografía. Suele repetir contenido en sus PCs y valora que muestres avances constantes en el proyecto.', 3, 3, 3, 3, 'Ten fuentes variadas para tu monografía (libros, tesis, etc.) y colócalas en tus PCs: eso evita que te bajen puntos y te ayuda a llenar bien el cuadernillo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ernesto-flores-cisneros' and cu.slug = 'metodologia-de-la-investigacion'
union all
select pc.id, 'Enseña bien y a fondo, pero el trabajo final exige mucho tiempo.', 'Explica el curso con detalle usando ejemplos de la vida real, casi preparándote como para una tesis. El trabajo final requiere bastante dedicación y coordinación semanal con él.', 3, 4, 3, 4, 'Estudia del material de la plataforma de Caral University (de ahí salen las PCs) y coordina semanalmente tu trabajo final con él.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-alberto-lescano' and cu.slug = 'metodologia-de-la-investigacion'
union all
select pc.id, 'Recontra ponderable pero confusa explicando lo que quiere de los trabajos.', 'Usa mucho el Univirtual (hay que revisarlo constantemente) y puede ser confusa sobre qué espera en los trabajos. A cambio, es extremadamente flexible calificando y casi imposible que jales.', 2, 4, 2, 2, 'Revisa el Univirtual todo el tiempo y no elimines la PC4 (pesada pero ponderable): pide feedback de tu monografía en cada oportunidad que dé.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'gloria-teresita-huamani' and cu.slug = 'metodologia-de-la-investigacion'
union all
select pc.id, 'La primera fija; casi garantiza 14 aunque el curso se aprenda poco.', 'Explica cómo elaborar una monografía por PPT, pero se desvía bastante contando historias personales. Graba las exposiciones y las sube a YouTube, con feedback semanal sobre tu avance.', 2, 3, 2, 3, 'Sigue al pie de la letra sus indicaciones de monografía y muestra datos numéricos en tu exposición: con eso aseguras más de 14 sin mucho drama.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rodolfo-falconi' and cu.slug = 'metodologia-de-la-investigacion'
union all
select pc.id, 'Muy paciente; se detiene a re-explicar si no entendiste.', 'Clase casi toda en pizarra, dispuesta a parar y volver a explicar si alguien no entendió. Tiene mucha paciencia, aunque siempre llega a cubrir todo el temario antes de cada PC, sin importar el ritmo.', 3, 3, 3, 4, 'Lee su cuaderno antes de cada clase y asiste siempre: muestra piedad con quien ve esforzándose en clase.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'yolanda-segura' and cu.slug = 'estadistica-y-probabilidades'
union all
select pc.id, 'Exigente y de exámenes duros; asistencia obligatoria de verdad.', 'Clases en PPT complementadas con pizarra, explicando con claridad temas complicados. Es estricto calificando y no permite formulario (salvo tablas), así que exige dedicarle bastante tiempo al curso.', 5, 4, 3, 4, 'No faltes a ninguna clase (es prácticamente obligatorio) y consigue todas las planchas posibles: sus exámenes son duros de verdad.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'yarko-cerna-valdez' and cu.slug = 'estadistica-y-probabilidades'
union all
select pc.id, 'La real fija para quien le pone esfuerzo; da fijas y explica cuanto haga falta.', 'Teoría en PPT reforzada con pizarra cuando algo es difícil, resolviendo planchas y ejercicios del libro Córdova. Suele compartir fijas para las PCs y calificar a tu favor, sobre todo en parcial y final.', 3, 3, 3, 4, 'No dejes de hacer ninguna tarea (puede subir hasta 3 puntos) y practica con el libro Córdova más planchas: es de los profesores más generosos calificando.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'miguel-cutipa' and cu.slug = 'estadistica-y-probabilidades'
union all
select pc.id, 'Enseña AutoCAD desde cero; ponderar es difícil salvo que ya lo sepas usar.', 'Clases con PPTs enseñando AutoCAD y sus comandos desde cero. La evaluación combina 4 PCs, 2 labos prácticos y 2 monografías, y no siempre anuncia las fechas exactas de práctica.', 3, 4, 3, 3, 'Practica bastante en AutoCAD por tu cuenta (apóyate en YouTube) y no confíes en fechas anunciadas: practica siempre, sin esperar aviso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-munoz-inga' and cu.slug = 'diseno-asistido-por-computador'
union all
select pc.id, 'El proyecto final es clave; buen equipo y pieza aseguran ponderar.', 'Combina teoría (a veces con desvíos hacia política) con el manejo de Autodesk Inventor. El proyecto final del curso pesa mucho: con un buen equipo y buena pieza, se pondera.', 3, 3, 3, 4, 'Elige bien la pieza para tu proyecto final y asiste a todas las clases: el proyecto define si apruebas o pondera.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'eduardo-cieza-de-leon' and cu.slug = 'diseno-asistido-por-computador'
union all
select pc.id, 'Buen profesor y da bastante material, pero riguroso al calificar.', 'Explica en pizarra o lee sus documentos tipo PPT, repitiendo los puntos importantes. Da bastante material de apoyo y sus ejercicios de clase suelen parecerse a los de PCs y exámenes.', 4, 3, 3, 4, 'Revisa todo el material que comparte (incluido el de ciclos anteriores) y sé muy ordenado resolviendo: es riguroso calificando la presentación.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'santiago-tarazona' and cu.slug = 'termodinamica'
union all
select pc.id, 'Basado 100% en el libro Cengel; problemas repetitivos, solo cambian datos.', 'Enseña la teoría literalmente del libro Cengel Termodinámica 7ma edición (sus PPTs son casi copia, salvo Fluidos). Sus problemas de examen son repetitivos, cambiando solo los datos respecto a los de clase.', 3, 3, 3, 4, 'Estudia a fondo el Cengel 7ma edición y ten siempre a la mano las tablas termodinámicas (pregúntale cuáles imprimir, se le olvida especificar).', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-chafloque' and cu.slug = 'termodinamica'
union all
select pc.id, 'Primera vez en el curso; centrado en planchas antiguas y tareas.', 'Se enfoca en resolver planchas antiguas explicando propiedades sobre la marcha, y en varias clases deja a los alumnos resolviendo solos o solo deja tarea. Aprenderás más de sus materiales que de la clase en sí.', 2, 3, 2, 2, 'Practica muchas planchas y entrega bien las tareas (''Moncapoints''): te dejan tranquilo para llegar bien al susti.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'victor-moncada' and cu.slug = 'termodinamica'
union all
select pc.id, 'Solo lee sus PPTs; da pistas del examen pero corrige monografías muy estricto.', 'Clase poco didáctica, básicamente lectura de PPTs, y suele decir qué entrará en el examen. Es muy estricto revisando monografías (rara vez sube de 12), aunque sube las notas muy rápido.', 3, 3, 2, 2, 'Memoriza bien sus PPTs (ahí están casi las respuestas del examen) y lee ''La quinta disciplina'': suele pedirlo cada ciclo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'mario-heinrich-fisfalen' and cu.slug = 'tcsa'
union all
select pc.id, 'Curso ligero resumido en solo 3 PPTs; poco exigente.', 'Clase basada en solo 3 PPTs, con videos en inglés y español. No es muy exigente y deja bastante tiempo libre, aunque las clases pueden resultar aburridas.', 2, 2, 2, 3, 'Ten un buen grupo para los trabajos grupales y repasa bien el handbook y sus 3 PPTs para parcial y final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rocio-salas-cordero' and cu.slug = 'tcsa'
union all
select pc.id, 'Explica paso a paso y da consejos laborales; el proyecto pesa bastante.', 'Enseña paso a paso con buena explicación, aunque a veces se distrae cambiando de tema. Comparte ejercicios y códigos por Classroom, y da bastantes consejos sobre el mundo laboral.', 3, 3, 3, 3, 'Adelántate en temas como bases de datos y HTML (el curso avanza rápido) y participa constantemente: se hace buena onda con quien le pone ganas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'pablo-edwin-lopez' and cu.slug = 'programacion-orientada-a-objetos'
union all
select pc.id, 'La antifija; mal carácter y exige ser muy autodidacta.', 'Resuelve los ejercicios del Univirtual una sola vez asumiendo que ya sabes el curso — espera que practiques por tu cuenta. Tiene mal carácter y es estricto con la puntualidad y el código que no compila.', 4, 4, 3, 2, 'Practica por tu cuenta con los códigos que sube al Univirtual y elige bien tu equipo para PC3/PC4: son grupales y pesan bastante.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'glen-dario-rodriguez' and cu.slug = 'programacion-orientada-a-objetos'
union all
select pc.id, 'Exigente y con proyecto obligatorio; el final (doble peso) define todo.', 'Usa GitHub para todo el material y construye proyectos de ejemplo (Java+Swing, JDBC, Spring Boot) que sirven de guía. El final pesa doble y es casi imposible aprobar sin él, así que el proyecto final es clave para prepararte.', 5, 5, 4, 4, 'Haz el proyecto exactamente como lo pide (procesos reales, no CRUD) con un grupo comprometido: es tu mejor preparación para el examen final, que vale doble.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'erick-gustavo-coronel' and cu.slug = 'programacion-orientada-a-objetos'
union all
select pc.id, 'Curso denso; el profesor tiene vocación pero no se explica muy bien.', 'Lee su PPT la mayor parte de la clase, con pocas apreciaciones propias. El curso es denso (solo 2 PCs oficiales), y no explica muy bien, aunque realmente le importa que sus alumnos no jalen.', 3, 3, 2, 2, 'Estudia las PPTs con anticipación (son unas 200 diapositivas) y presta atención cuando un grupo resuelve un ejercicio en exposición: suele repetirse en parcial y final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jorge-leiva' and cu.slug = 'arquitectura-de-computadoras-i'
union all
select pc.id, 'Primera vez en prácticas de Física I; calificaría con criterio y orden.', 'No hay testimonios directos aún (es su primer ciclo en prácticas de Física I, aunque ya enseñaba Física II), pero según referencias califica con criterio, exige orden y buen uso de fórmulas, y comparte resoluciones en su canal de YouTube.', 3, 3, 3, 3, 'Revisa su canal de YouTube para complementar lo que enseña tu profesor de teoría — ahí tiene resoluciones de ejercicios.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'walter-huallpa' and cu.slug = 'fisica-i'
union all
select pc.id, 'Enseña muy bien y de forma entretenida; considera el procedimiento.', 'Hace una pizarra ordenada con bastantes ejercicios y de vez en cuando cuenta anécdotas. Considera el procedimiento al calificar y comparte material y planchitas, aunque demora en subir notas.', 3, 3, 3, 4, 'Complementa sus clases con planchitas y su libro recomendado: practicar mucho es la clave para ponderar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-arambulo' and cu.slug = 'ecuaciones-diferenciales'
union all
select pc.id, 'Amable y puntual; deja usar formulario y sube notas rápido.', 'Explica con diapositivas y desarrolla muchos ejercicios para que se entienda bien, dejando tareas que suben hasta 3 puntos en las PCs. Permite usar formulario y tabla de integrales en los exámenes.', 2, 3, 3, 4, 'Haz siempre la tarea (sube hasta 3 puntos) y estudia también temas más avanzados de los que dice que vendrán: a veces se pasa del límite anunciado.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'juan-broncano' and cu.slug = 'ecuaciones-diferenciales'
union all
select pc.id, 'No es necesario asistir; deja usar formulario siempre, pero explica poco.', 'Llega y escribe en pizarra sin explicar mucho, hablando en voz baja. Sus clases pueden ser aburridas, pero permite usar formulario en todos los exámenes y sube notas rápido.', 3, 2, 2, 2, 'Llega puntual a las PCs (es estricto con la hora de ingreso) y aprovecha que siempre deja usar formulario.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'benito-ostos' and cu.slug = 'ecuaciones-diferenciales'
union all
select pc.id, 'Estricto calificando pero considera asistencia y da fijas.', 'Viene puntual, presenta diapositivas y lee sin usar pizarra. Es estricto al calificar, pero considera la asistencia (inicio y final) y suele dar fijas sobre los temas que vendrán.', 4, 3, 3, 2, 'No faltes (considera asistencia) y complementa con MateFácil de YouTube o el material de Arámbulo: sus clases solas no bastan.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ricardo-chung-ching' and cu.slug = 'ecuaciones-diferenciales'
union all
select pc.id, 'Pizarra ordenada y clara, pero estricto en parcial y final.', 'Hace una pizarra bien ordenada explicando de forma entendible, sin ser muy teórico. No desarrolla toda la teoría del curso, así que conviene complementar con el material de Salcedo para parcial y final.', 4, 3, 3, 4, 'Revisa el material de Salcedo para parcial y final: lo visto en clase con Romero no basta para esos exámenes.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'juan-romero' and cu.slug = 'fisica-ii'
union all
select pc.id, 'Domina la materia y prepara muy bien para parcial y final.', 'En teoría desarrolla mucho contenido (su cuaderno, vendido por la Sra. Sandra, resume todo). En práctica revisa bien considerando el avance, y en laboratorio explica una sola vez (no repite) y evalúa con test los primeros minutos.', 4, 4, 3, 4, 'Consigue su cuaderno y en el laboratorio graba todo lo que explica (no repite): ahí se apoya buena parte de tu informe y nota.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'joaquin-salcedo' and cu.slug = 'fisica-ii'
union all
select pc.id, 'Nivel academia; estricto calificando pero todos aprueban su laboratorio.', 'Clases nivel academia con pocos problemas resueltos, y es estricto revisando (trae las PCs a clase para que reclames si corresponde). En laboratorio no repite explicaciones, pero todos los que asisten aprueban.', 4, 3, 2, 3, 'Reclama siempre que puedas cuando trae las PCs revisadas a clase, y en laboratorio pon atención la primera vez: no repite explicaciones.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'miguel-angel-mosquera' and cu.slug = 'fisica-ii'
union all
select pc.id, 'La fija; casi imposible jalar parcial o final.', 'Explica con PPT y dedica buena parte de la clase a resolver ejercicios del Univirtual. Sus PCs y exámenes salen casi todo del Serway, y en laboratorio te ayuda si no te sale (nota mínima 15).', 2, 2, 3, 4, 'Consigue el solucionario del Serway (y los otros libros que recomienda): sus PCs y exámenes salen casi textuales de ahí.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jaime-san-bartolome' and cu.slug = 'fisica-ii'
union all
select pc.id, 'Da bastantes puntos gratis (PEI, ABP) aunque enseña poco.', 'Apasionado por la física pero suele desviarse del tema y llegar tarde, leyendo generalmente su Word. La PC de ABP suele calificarse alto (mínimo 17) y el PEI puede sumar hasta 6 puntos extra.', 2, 3, 1, 2, 'Cumple bien el PEI y el ABP (ve formal a la exposición): son la forma más segura de subir tu nota con él.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'percy-canote' and cu.slug = 'fisica-ii'
union all
select pc.id, 'La fija de fijas; explica muy bien y es sumamente considerado.', 'Clases dinámicas con bastantes ejemplos aplicados, basadas en el Serway. Prácticamente te da las preguntas de la PC, y en laboratorio explica todo con calma y es muy generoso calificando.', 2, 3, 3, 5, 'Ten siempre el Serway a la mano y presta atención en clase: casi te da las respuestas de la PC directamente.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'antonio-zegarra' and cu.slug = 'fisica-ii'
union all
select pc.id, 'Estricto y exige mucho detalle, pero considera el procedimiento.', 'Revisa con mucho detalle y baja bastante nota por errores mínimos, aunque considera el procedimiento. Si usas colores y presentas ordenado, es más considerado calificando.', 4, 3, 3, 3, 'Desarrolla cada pregunta con mucho detalle teórico y cuida la presentación (colores, orden): ahí se nota la diferencia en su calificación.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'vicente-pena' and cu.slug = 'fisica-ii'
union all
select pc.id, 'Laboratorio relajado; ayuda si lo pides y no toma test.', 'Hace la teoría necesaria en pizarra y luego ayuda a los grupos que lo necesiten durante el experimento. No toma test y los laboratorios suelen terminar rápido (45 min a 1:30h).', 1, 2, 3, 3, 'Toma fotos de todos los instrumentos que usen y pide ayuda sin problema si te trabas: el profesor suele estar disponible para todos los grupos.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'walter-huallpa' and cu.slug = 'fisica-ii'
union all
select pc.id, 'Clases aburridas pero califica bien; exige seguir su formato exacto.', 'Trabaja principalmente con su PDF proyectado y poca pizarra. Presenta un modelo de cómo quiere que resuelvas la PC, y es estricto con la ortografía y el formato.', 3, 3, 2, 2, 'Sigue exactamente su formato de resolución (lo presenta como modelo) y cuida tu ortografía: baja puntos por eso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'fernando-sotomayor' and cu.slug = 'calculo-numerico'
union all
select pc.id, 'Exige seguir su método exacto; clases cortas y da puntos por tarea.', 'Muestra diapositivas de teoría y usa pizarra para ejercicios, bajando puntos si no usas su método. Sus clases suelen durar poco más de una hora, y las tareas dan hasta 2 puntos extra si el delegado se lo recuerda.', 3, 3, 2, 2, 'Usa siempre su método exacto de resolución (te baja puntos si no) y consigue una calculadora CASIO fx-570LA X: la recomienda para todo el curso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'walter-huallpa' and cu.slug = 'calculo-numerico'
union all
select pc.id, 'La real fija; no exige seguir un método específico, solo resolver bien.', 'Sin testimonios directos, pero según referencias es sumamente flexible: le basta con que resuelvas el problema, sin importar el método o si sigues instrucciones al pie de la letra.', 1, 2, 3, 3, 'Aun así estudia (no abuses de la flexibilidad): es de los profesores más accesibles para Cálculo Numérico según referencias de otros ciclos.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'miguel-cutipa' and cu.slug = 'calculo-numerico'
union all
select pc.id, 'Clase caótica y se desvía mucho (habla de Japón); mejor no discutirle.', 'Usa las PPTs de Tino Reyna pero las explica a su manera, y suele desviarse largo rato hablando de Japón y anime. Es de carácter fuerte, así que mejor seguirle la corriente.', 3, 3, 2, 2, 'Nunca lo contradigas y guíate de planchas y solucionarios pasados: el parcial y final en realidad los hace Tino Reyna.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'glen-dario-rodriguez' and cu.slug = 'modelado-conceptual-de-datos'
union all
select pc.id, 'Regala muchos puntos extra por participar, pero puede expulsarte de la clase.', 'Dicta leyendo diapositivas y lanza preguntas al azar — si fallas dos seguidas, te saca del salón. Las PCs son entregas de trabajo con exposición, y da puntos extra sin límite a quien participa.', 4, 4, 3, 3, 'Mira sus videos de YouTube y del Univirtual (repite preguntas de ahí) y participa todo lo que puedas: los puntos extra no tienen límite y pueden salvarte el parcial.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'tino-reyna' and cu.slug = 'modelado-conceptual-de-datos'
union all
select pc.id, 'Clases apasionantes y muy amable calificando; útil si te interesa análisis de datos.', 'Se nota la pasión del profesor por el curso y explica muy bien, dando puntos a quien participa o resuelve en la pizarra. Es extremadamente amable calificando el final y el susti, incluso perdonando bastante.', 2, 2, 3, 5, 'Consigue una calculadora programable (recomienda la CASIO CG50) y participa en clase para farmear puntos extra: puede sumar hasta 5 puntos.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'yarko-cerna-valdez' and cu.slug = 'estadistica-aplicada'
union all
select pc.id, 'Amable y atenta con sus alumnos; deja ejercicios en clase para sumar puntos.', 'Deja ejercicios durante la clase que suman a la nota de prácticas, y se acuerda bien de sus alumnos participativos. Es amable, aunque no conviene hacerla renegar.', 3, 3, 3, 3, 'Participa en clase (se acuerda de los nombres) y no faltes: perder una clase te deja sin esos puntos de práctica.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'yolanda-segura' and cu.slug = 'estadistica-aplicada'
union all
select pc.id, 'Carga altísima (equivale a 3 cursos); difícil ponderar, sin fijas.', 'Forma grupos desde la primera clase para trabajar todo el ciclo en un proyecto con exposiciones vía Miro, donde solo califica la ronda de preguntas posterior (no el contenido visual). El parcial es escrito y el final es exposición individual + informe IEEE.', 5, 5, 3, 3, 'Nunca te quedes callado en la ronda de preguntas tras exponer (pesa más que el contenido) y estudia bien la teoría de Ulloa para el parcial.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'erwin-salas' and cu.slug = 'metodologia-de-sistemas-blandos'
union all
select pc.id, 'Solo lee PPTs; monografía muy estricta pero PC basada en lo anunciado.', 'Dicta sus 4 horas de clase en apenas 1, dejando el resto como ''hora de práctica'' para avanzar la monografía. Es muy estricto calificando la monografía (rara vez sube de 13), pero avisa desde la primera semana en qué se basará la PC.', 3, 3, 2, 2, 'Avanza la monografía desde la primera semana y consúltale seguido: si ve compromiso, te orienta bien. No esperes más de 13, hagas lo que hagas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'mario-heinrich-fisfalen' and cu.slug = 'metodologia-de-sistemas-blandos'
union all
select pc.id, 'Primera vez dictando el curso; se puede ponderar pero deja mucho trabajo.', 'Sin testimonios directos aún (primera vez que dicta el curso), pero según referencias deja bastante trabajo y espera mucha dedicación exclusiva a su curso.', 4, 5, 3, 3, 'Organiza bien tu tiempo desde el inicio: según referencias, exige bastante dedicación aunque sí se puede ponderar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rodriguez-ulloa' and cu.slug = 'metodologia-de-sistemas-blandos'
union all
select pc.id, 'Sube puntos generosamente, aunque habla bajo y sus gráficos no son claros.', 'Explica con PPT y hace preguntas durante la clase (distraerte puede bajarte puntos en la PC). Sube puntos generosamente en parcial, final y PCs, y al final del curso se aprende algo de inteligencia artificial.', 3, 3, 3, 3, 'Hazte conocido con él (participa, pregunta) y en las PCs no olvides enviar código + PPT + Word: descuenta si falta alguno.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'teodoro-cordova' and cu.slug = 'lenguaje-de-programacion'
union all
select pc.id, 'Muy buen profesor y enseña bien, pero se vuelve estricto en exámenes.', 'Enseña bien y llega temprano, dando puntos con generosidad en las prácticas. En los exámenes se vuelve mucho más estricto y cualquier error te puede bajar bastante la nota.', 4, 3, 3, 4, 'Aprovecha que deja usar apuntes en exámenes y PCs (sin internet): llévalos bien preparados, porque en los exámenes es muy exigente.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-lujan' and cu.slug = 'lenguaje-de-programacion'
union all
select pc.id, 'Exigente en evaluaciones (0 si no sigues instrucciones), pero enseña mucho.', 'Es su primera vez dictando este curso, pero ya se le conoce de POO: sabe muchísimo de programación y desarrollo web, aunque en evaluaciones se vuelve muy estricto (0 directo si el código no corre o no sigues sus instrucciones).', 5, 4, 3, 3, 'Sigue sus indicaciones al pie de la letra en cada evaluación: es implacable con el código que no corre o no cumple exactamente lo pedido.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'erick-gustavo-coronel' and cu.slug = 'lenguaje-de-programacion'
union all
select pc.id, 'Curso con exposiciones y trabajos de investigación; participar suma puntos.', 'El primer día pregunta si prefieren un enfoque industrial o teórico para el curso. Las PCs son exposiciones y el parcial/final son trabajos de investigación, con puntos extra por participar.', 3, 3, 3, 3, 'Enfoca tus exposiciones y trabajos hacia aplicaciones industriales: es lo que más valora si el salón eligió ese enfoque.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'hernan-parra' and cu.slug = 'fisico-quimica-y-operaciones-unitarias'
union all
select pc.id, 'Justa al calificar; valora calidad sobre cantidad en los informes de labo.', 'Es responsable y atiende dudas con gusto, calificando de forma justa. Es estricta con los plazos de entrega y prefiere informes de laboratorio concisos y bien hechos antes que extensos.', 3, 3, 3, 4, 'Cuida los plazos de entrega de informes y no metas floro: valora más la calidad y precisión que la extensión.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rosario-reyes-acosta' and cu.slug = 'fisico-quimica-y-operaciones-unitarias'
union all
select pc.id, 'Curso ligero (temas básicos) con exposiciones diarias que dan la nota de PC.', 'Clases virtuales de 4 horas donde cada sesión termina con una exposición grupal del tema (de ahí sale la nota de PC). El parcial y final son presenciales y suele repetir contenido de planchas.', 1, 2, 1, 2, 'Estudia las planchas la noche antes del parcial y final: el profesor es planchero y con eso ya apruebas de sobra.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'silvio-quinteros' and cu.slug = 'economia-general'
union all
select pc.id, 'Basado en el libro Parkin; buen delegado puede negociar puntos extra.', 'Enseña principalmente del libro ''Economía'' de Parkin con ritmo pausado, y el delegado puede negociar la estructura de evaluaciones y puntos extra. Para acceder a esos puntos extra necesitas haber aprobado al menos una evaluación de la primera parte del curso (PC1, PC2 o parcial).', 3, 3, 2, 2, 'Ten un buen delegado que negocie puntos extra y asegura aprobar al menos una evaluación temprana: es requisito para acceder a esos puntos adicionales.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'cesar-miranda' and cu.slug = 'economia-general'
union all
select pc.id, 'Chévere y con visitas técnicas interesantes; se pone estricta en el final.', 'Enseña macro y microeconomía combinando PPT con visitas técnicas sobre tecnología, startups y temas que impactan la economía peruana. El susti es oral y escrito, y se puede ponderar ahí si te esfuerzas.', 3, 3, 3, 4, 'Pide feedback constante de tu monografía y toma nota de cada visita técnica: puede pedirte un informe sobre ellas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'margarita-mondragon' and cu.slug = 'economia-general'
union all
select pc.id, 'Profe relativamente nuevo; enseña bien y jala a pocos.', 'Enseña la teoría del curso apoyada en prácticas dirigidas cuyos ejercicios suelen repetirse en las PCs y hasta el parcial. Es exigente con la puntualidad pero jala a pocos alumnos.', 2, 2, 3, 4, 'Practica bien sus prácticas dirigidas y expón en la PC4 (aunque no lo diga, esa exposición suma puntos para el final).', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'leoncio-palacios' and cu.slug = 'economia-general'
union all
select pc.id, 'Curso práctico centrado en velocidad y precisión al modelar.', 'Es un curso de carácter práctico enfocado en desarrollar habilidades de modelado de datos. Aún hay poca información detallada sobre su estilo de enseñanza; la clave según lo reportado es practicar constantemente.', 3, 3, 3, 3, 'Practica constantemente el diseño de modelos: la información disponible es limitada, pero coincide en que la repetición es lo que rinde con este curso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'juan-pablo-mansilla-lopez' and cu.slug = 'analisis-y-modelamiento-de-datos'
union all
select pc.id, 'Curso teórico y comunicativo; la evaluación se centra en exposiciones.', 'Es un curso más teórico y comunicativo donde la evaluación se centra en exposiciones. Aún hay poca información detallada sobre su estilo de enseñanza; lo reportado es que la claridad y seguridad al exponer marcan la diferencia.', 3, 3, 3, 3, 'Prepara bien tus exposiciones (estructura las ideas con claridad y cuida tu presentación personal): según lo reportado, es lo que más se valora.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'alfredo-marino-ramos-munoz' and cu.slug = 'ingenieria-de-requerimientos-i'
union all
select pc.id, 'Curso avanzado de POO: SOLID, patrones de diseño y bases de datos.', 'Profundiza en los pilares de la POO (polimorfismo, herencia, abstracción, encapsulamiento), principios SOLID y patrones creacionales, además de conexión a bases de datos y nociones de encriptación. Aún hay poca información detallada sobre su estilo de enseñanza.', 4, 4, 3, 3, 'Refuerza bien los pilares de la POO y SOLID antes de empezar: el curso avanza rápido sobre esa base, según lo reportado.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jan-eduardo-cisneros-napravnik' and cu.slug = 'lenguaje-de-programacion-ii'
union all
select pc.id, 'Teoría y simulaciones en C; exige atención constante y disciplina.', 'Se trabajan conceptos teóricos junto con simulaciones programadas en C, lo que exige atención constante en clase y práctica dedicada. Aún hay poca información detallada sobre su estilo de enseñanza.', 4, 4, 3, 3, 'Dedícale práctica constante a las simulaciones en C: según lo reportado, la disciplina es lo que más rinde para ponderar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-nelson-ramos-montes' and cu.slug = 'sistemas-operativos'
union all
select pc.id, 'Clases algo aburridas pero considerado calificando y accesible con dudas.', 'Usa PPT en todas las clases y las sube al Univirtual (puedes no asistir y estudiar solo, aunque perderías la oportunidad de aclarar dudas). Es considerado con el avance y cerca de las PCs resuelve problemas parecidos a los que pondrá.', 2, 2, 2, 3, 'Asiste cerca de las fechas de PC (ahí resuelve problemas similares) y pregúntale cuando algo no te salga: es bastante accesible dando ideas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'cesar-canelo' and cu.slug = 'investigacion-de-operaciones-i'
union all
select pc.id, 'Exámenes muy operativos (exige velocidad); estricto y sin piedad calificando.', 'Revisa teoría por PPT y luego resuelve ejercicios de su Word, a veces sacados de IA. Sus exámenes son muy operativos y con poco tiempo, así que exigen practicar velocidad de resolución.', 4, 3, 3, 3, 'Practica velocidad de resolución con calculadora graficadora (los exámenes dan poco tiempo) y si promete un punto en clase, recuérdaselo en el examen: sí cumple, pero hay que insistir.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-medina' and cu.slug = 'investigacion-de-operaciones-i'
union all
select pc.id, 'Clases cortas (casi vacías) pero es de los que más aprueba en sus secciones.', 'Llega y se va antes de tiempo, con clases de apenas una hora donde enseña con PPTs, pizarra y códigos en Python/Excel Solver. Hay un trabajo final que cuenta para varias PCs, y las evaluaciones pueden ser grupales, presenciales con o sin laptop.', 2, 3, 2, 3, 'Cuida bien el trabajo final (influye en varias PCs) y en las interpretaciones con IA agrega interpretación real de los resultados, no solo números.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'samuel-oporto' and cu.slug = 'investigacion-de-operaciones-i'
union all
select pc.id, 'Enseña el software Lingo a fondo; PC2 y PC4 son las más ponderables.', 'Combina diapositivas con bastante trabajo en el software Lingo, controlando las computadoras desde su PC central para evitar plagio. La PC2 (proyecto de modelamiento) y la PC4 (pasar el modelo a Lingo) son las más ponderables, con nota mínima 15.', 3, 4, 3, 3, 'Domina bien el Lingo desde el inicio del curso y no intentes usar ChatGPT en clase o examen: se da cuenta y te saca del examen.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-ulfe' and cu.slug = 'investigacion-de-operaciones-i'
union all
select pc.id, 'Interactivo y bonifica participación; puede botarte de la clase.', 'Dicta con PPT y su libro, verificando la lógica de tus respuestas para darte puntos de cara al parcial y final. El curso se enfoca en optimización del modelo conceptual de base de datos.', 3, 3, 3, 3, 'Participa activamente para ganar puntos de parcial/final y no faltes ni llegues tarde: te marca en las exposiciones.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'tino-reyna' and cu.slug = 'diseno-de-base-de-datos'
union all
select pc.id, 'Clases en laboratorio; si el grupo chambea, el curso se aprueba fijo.', 'Todas las clases son en laboratorio, proyectando su PPT y enseñando los conceptos necesarios para cada informe. Suele llegar tarde y deja ejercicios en Slack para sumar participación.', 3, 4, 3, 4, 'Asegúrate de que el grupo sepa lo básico de desarrollo web y GitHub: los últimos informes se complican mucho sin eso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jose-caballero' and cu.slug = 'diseno-de-base-de-datos'
union all
select pc.id, 'Trabajo de investigación en grupos al azar; buena citación es clave.', 'Enseña la teoría por PPT y usa el laboratorio de cómputo a mitad de ciclo. El trabajo de investigación (grupos al azar) se expone en PC2 y se aplica en PC4, y necesita estar bien citado y en inglés.', 3, 4, 3, 3, 'Cita correctamente todo tu trabajo de investigación (baja mucho la nota si no) y prepárate para exámenes a las 8am.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'paul-tocto' and cu.slug = 'matematica-aplicada'
union all
select pc.id, 'Amable y didáctico; califica generoso los trabajos (rara vez baja de 14).', 'Clases didácticas donde resuelve ejercicios simples en pizarra y retroalimenta con preguntas de PCs pasadas. Es flexible con los grupos de trabajo y te avisa qué temas vienen si le preguntas.', 2, 2, 2, 3, 'No dudes en pedirle cambiar de grupo si no colaboran, y pregúntale qué temas vienen: suele responder con gusto.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'eddie-cueva' and cu.slug = 'matematica-aplicada'
union all
select pc.id, 'Relaciona la teoría con casos reales de empresa; monografías bien calificadas.', 'Explica con PPT complementado con casos reales de su experiencia laboral, incentivando la participación. Las monografías suelen tener buena calificación, aunque es exigente en parcial y final.', 3, 3, 3, 4, 'Sigue bien sus indicaciones de formato para las monografías (se molesta si no las cumples) y aprovecha su ayuda para coordinar la visita técnica de la Mono 2.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'doris-rojas' and cu.slug = 'teoria-organizacional'
union all
select pc.id, 'Teórica y planchera; llega tarde pero casi todos aprueban con ella.', 'Clases muy teóricas basadas en PPTs, con preguntas al azar que anota en su cuaderno para dar puntos de participación. Suele llegar tarde (hasta 2 horas), pero casi todos aprueban salvo que descuides el curso.', 2, 3, 2, 3, 'Busca planchas pasadas (suele ser planchera) y evita ir al susti salvo que realmente lo necesites: se maleja calificando ahí.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'eliana-rizabal' and cu.slug = 'teoria-organizacional'
union all
select pc.id, 'Estricta al calificar pero considera el esfuerzo; da asesoría si la pides.', 'Explica su PPT y hace preguntas mientras avanza, con clases más interesantes si te sientas adelante y participas. Es estricta calificando, pero valora el intento y está siempre disponible para resolver dudas.', 4, 4, 3, 3, 'Ten un delegado activo (ella comunica todo por él) y pide su asesoría para la monografía o algún proyecto: la brinda con gusto.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'alejandrina-huarcaya' and cu.slug = 'ingenieria-de-procesos'
union all
select pc.id, 'Clases virtuales accesibles; llega tarde y se maleja en final/susti.', 'Clases virtuales apoyadas en PPTs y videos, con preguntas al azar que dan puntos si respondes bien. Las PCs son accesibles estudiando solo de sus diapositivas, aunque suele llegar tarde y calificar duro en final y susti.', 3, 3, 2, 3, 'Repasa bien sus PPTs para las PCs (casi todo sale de ahí) pero cuida el final y el susti: ahí se pone más estricta calificando.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'eliana-rizabal' and cu.slug = 'ingenieria-de-procesos'
union all
select pc.id, 'Difícil jalar; clases cortas y ligeras, sin mucha tarea.', 'Enseña la teoría con PPT, con pocas actividades grupales sin nota mayormente. Es muy amable, no deja mucho trabajo, y aunque el parcial y final no ponderan tanto, prácticamente todos aprueban.', 2, 2, 2, 3, 'Repasa sus PPTs la noche antes de cada PC: con eso alcanza, y pregunta a otras secciones qué vino en parcial/final (mismo examen, distinto caso).', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ninoska-molina' and cu.slug = 'ingenieria-de-procesos'
union all
select pc.id, 'Planchero y generoso calificando monografías; puede sorprenderte con preguntas.', 'Combina PPT con videos y lecturas de casos empresariales, dejando actividades grupales para aplicar los conceptos. Sus exámenes suelen ser planchazo y las monografías se califican alto.', 3, 3, 3, 3, 'Lleva siempre un avance de tu monografía (puede preguntar sobre ella en clase) y consulta material de Huarcaya y Rizabal para el final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'julio-talaverano' and cu.slug = 'ingenieria-de-procesos'
union all
select pc.id, 'La fija es dominar Ohm y Kirchhoff; todo lo que enseña sale en el examen.', 'Enseña con el libro Dorf y material propio (Words), enfocado en las leyes de Ohm y Kirchhoff. Lo que desarrolla en pizarra suele venir muy parecido en el examen, pero es difícil ponerse al día si faltas.', 3, 3, 3, 3, 'No faltes a clase (sus Words no explican tan bien la teoría por sí solos) y ten un delegado que le recuerde los pendientes: es olvidadizo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'santiago-tarazona' and cu.slug = 'electricidad-y-electronica-industrial'
union all
select pc.id, 'Metodología similar a Discreta; o completas bien la respuesta o poco puntaje.', 'Explica teoría por PPT y complementa con pizarra y ejercicios, dando puntos de participación en las primeras clases. Es poco flexible calificando: o resuelves completo y ordenado, o el puntaje es mínimo, sin considerar avance parcial.', 4, 3, 3, 3, 'Resuelve cada pregunta completa y ordenada (no da puntaje por avance) y no faltes a los laboratorios: los informes suman 3-4 puntos extra en una PC.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jose-benites-yarleque' and cu.slug = 'electricidad-y-electronica-industrial'
union all
select pc.id, 'Considera mucho la asistencia; enseña justo lo que viene en el examen.', 'Presenta PPT y explica en pizarra, a veces con datos erróneos a propósito para verificar que prestes atención. Considera mucho la asistencia (puntaje en PC) y desarrolla en clase justo los temas que vienen en el examen.', 3, 3, 3, 3, 'Descarga las PPTs de Univirtual apenas las suba (luego las elimina) y no faltes: la asistencia pesa directo en tu nota.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'guillermo-cruz' and cu.slug = 'ingenieria-de-materiales'
union all
select pc.id, 'Sus preguntas de examen salen literal de sus PPTs; no regala puntos.', 'Explica detallado y a veces solo lee diapositivas (hay que tomar apuntes). Sus preguntas de examen son datos tal cual de sus PPTs, pero no da puntos gratis por participación ni tareas.', 3, 3, 3, 3, 'Consigue todas sus PPTs (no solo las usadas en clase) y no descuides la monografía aunque parezca que se olvidó de ella: vale bastante nota.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'alfredo-aguero' and cu.slug = 'ingenieria-de-materiales'
union all
select pc.id, 'PPTs densas (como en Química I); participación constante suma 3 puntos.', 'Clases con PPTs y videos, complementadas con casos prácticos en pizarra. La asistencia y participación continua suman hasta 3 puntos extra en parcial y final, y las exposiciones dan puntos tanto a quien pregunta como a quien responde.', 3, 3, 3, 4, 'Lee las PPTs con anticipación (son densas) y prepara bien tus exposiciones: calificar según qué tan bien expones, así que ahí puedes ponderar.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'bilma-osorio' and cu.slug = 'procesos-industriales-i'
union all
select pc.id, 'El examen es un trabajo de análisis FODA a una empresa; no es obligatorio asistir.', 'El parcial y el final consisten en un trabajo de dos partes: primero un análisis FODA de una empresa elegida, y luego un diagnóstico con solución propuesta. No es necesario asistir a clase, aunque ayuda para consultar avances.', 3, 3, 3, 3, 'Dedica buen tiempo al análisis FODA y a justificar bien tu diagnóstico y solución: ahí está toda tu nota de parcial y final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'hernan-parra' and cu.slug = 'procesos-industriales-i'
union all
select pc.id, 'Se encarga de labos y monografías; da la estructura del informe.', 'Guía con PPT (habla en voz baja) y organiza cerca de 6 visitas a distintas empresas, cada una con su informe y test correspondiente. Da la estructura del informe, lo que facilita cumplir bien con la entrega.', 2, 3, 3, 3, 'Agrega detalle extra a tus informes (fotos de las visitas, información adicional): es la forma más clara de subir nota con ella.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'petra-rondinel' and cu.slug = 'procesos-industriales-i'
union all
select pc.id, 'Explica con calma; PCs grupales y deja usar apuntes en todos los exámenes.', 'Explica con calma y responde dudas con ejemplos, compartiendo también sus experiencias profesionales. Las PCs son grupales y permite usar apuntes en todos los exámenes (el delegado debe recordárselo).', 3, 3, 3, 4, 'Resuelve planchas para ganar velocidad (las preguntas no son difíciles, pero sí trabajosas) y ten un buen delegado que negocie con él discretamente.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'victor-leyton' and cu.slug = 'contabilidad-financiera'
union all
select pc.id, 'No es puntual con la asistencia, pero sus controles de lectura son plancha.', 'Se desvía bastante al explicar, así que no aprenderás mucho ahí, pero sus controles de lectura (10 min) son plancha y valen para tu promedio de prácticas. Las tareas valen 50% de tu nota de PC.', 3, 3, 2, 2, 'No faltes a sus controles de lectura (son plancha descarada) y resuelve los casos del Univirtual: si dominas los casos, dominas el curso.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rodolfo-falconi' and cu.slug = 'contabilidad-financiera'
union all
select pc.id, 'Muy estricta pero se aprende bien contabilidad; sigue sus normas de clase.', 'Clase estricta desde el inicio, con normas claras acordadas con el delegado (tolerancia, no celular, etc.). Se aprende contabilidad de verdad, y cumplir sus tareas y normas puede ayudarte a subir en algunas PCs.', 4, 4, 3, 4, 'Sigue al pie de la letra sus normas de clase (puntualidad, sin celular) y practica bastante el compendio de tareas: se aprende mejor contabilidad con ella que con otros profesores.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ana-leon' and cu.slug = 'contabilidad-financiera'
union all
select pc.id, 'Como en Redacción pero sin PCs; muy difícil jalar si trabajas en equipo.', 'Clases full PPT con trabajos grupales y una monografía cuyos avances cuentan para parcial y final. Es estricta con las indicaciones y la puntualidad, pero muy difícil de jalar si haces los trabajos.', 3, 4, 3, 3, 'Entrega el avance 3 de tu monografía con todo el contenido (así la entrega final solo necesita las correcciones) y no faltes: es estricta con la puntualidad.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'raquel-chavarri' and cu.slug = 'sociologia'
union all
select pc.id, 'Ponderable y accesible; recomendable adelantarlo si te gustan estos temas.', 'Usa PPT de apoyo pero lo importante sale en pizarra y en los videos/textos que deja en Univirtual, además de la coyuntura actual que comenta en clase. Es un curso ponderable, recomendable para adelantar.', 2, 2, 2, 3, 'Ve los videos que deja en Univirtual y lee los textos asignados (siempre cae una pregunta de ahí): con eso y sus ensayos, el curso se hace fácil.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carlos-sanchez' and cu.slug = 'sociologia'
union all
select pc.id, 'Alta probabilidad de sacar 20; enseña ameno con vivencias propias.', 'Prefiere enseñar con experiencias propias en vez de solo leer el PPT (aunque lo hace si nota poco interés). No exige participación, pero la voluntaria pesa bastante junto con la asistencia perfecta.', 2, 2, 2, 4, 'Ten asistencia perfecta y participa cuando puedas: es de los cursos con mayor probabilidad de sacar 20 en toda la carrera.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'eloy-ayala' and cu.slug = 'sociologia'
union all
select pc.id, 'Exigente pero manejable si le pones ganas desde el inicio.', 'Usa diapositivas semanales y entrega fichas desde la primera clase para tener a la mano todo el ciclo. Es estricta con los plazos y la puntualidad (no deja entrar si llegas 20 minutos tarde).', 3, 3, 3, 3, 'Haz siempre la tarea antes de parcial y final (pesa bastante ahí) y consigue planchas de evaluaciones pasadas: suelen repetirse, incluso las imágenes.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'maria-egusquiza' and cu.slug = 'ingenieria-del-trabajo'
union all
select pc.id, 'Material bien organizado en Univirtual; exámenes tipo planchita.', 'Todo el contenido está disponible y organizado en Univirtual, complementado con PPT y pizarra en clase. En parcial, final y susti sigue su propio criterio (no siempre coincide con otro profesor del curso, ''Losta'').', 3, 2, 3, 4, 'Sigue el criterio de Lau (no el de otros profesores del curso) para parcial, final y susti, y resuelve planchitas: suelen venir bastante similares.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'carmen-lau' and cu.slug = 'ingenieria-del-trabajo'
union all
select pc.id, 'Chacotero y accesible; repasa UML y planchas para ponderar.', 'Lee y explica el PPT, formando grupos para algunas PCs que son exposiciones grupales. Es de trato relajado (no exige vestimenta formal) y recuerda a sus alumnos, aunque no le gusta que lleguen tarde.', 2, 2, 2, 3, 'Lee el libro de UML y repasa planchas para ponderar, y no llegues tarde: es de las pocas cosas que sí le molestan.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jesus-antaurco' and cu.slug = 'analisis-y-diseno-de-sistemas'
union all
select pc.id, '6 horas seguidas de clase; expone tu propio proyecto cada semana.', 'Dedica las primeras 2 horas a teoría y las 4 restantes a que cada grupo avance su proyecto, con exposiciones semanales donde aprovechar su feedback. El parcial y final son plancha de exámenes anteriores (buscar en TKV).', 3, 4, 3, 4, 'Elige un tema que tu grupo domine (evita que se vuelva muy pesado) y cuida los tiempos de exposición: te penaliza si te pasas.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'miguel-navarro' and cu.slug = 'analisis-y-diseno-de-sistemas'
union all
select pc.id, 'Sus PPTs son del curso oficial de networking de Cisco; domina Packet Tracer.', 'Lee y explica el PPT (que es literalmente el material del curso de networking de Cisco) y en los laboratorios escribe los procedimientos en pizarra antes de explicarlos. Tiene canal de YouTube con todas sus clases.', 3, 3, 2, 4, 'Domina Packet Tracer y revisa los test públicos del curso de Cisco: varios de sus exámenes son planchitas de ahí (buscar en TKV).', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'ruben-borja' and cu.slug = 'arquitectura-computacional-y-redes'
union all
select pc.id, 'Explica con analogías; asistencia a sus clases es obligatoria.', 'Explica los conceptos con analogías sin ponerse muy técnico, repasando cada semana lo visto la clase anterior con preguntas (si no respondes, se molesta). Tiene un canal de YouTube con clases de la época de pandemia.', 3, 3, 3, 4, 'Asiste a todas sus clases (lo exige) y apunta los ejercicios que resuelve ahí, además de dominar Packet Tracer.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'emerson-carranza' and cu.slug = 'arquitectura-computacional-y-redes'
union all
select pc.id, 'Buenos consejos profesionales; estudia TOGAF y no faltes a los quizizz.', 'Explica el PPT que leerá, complementando con videos, lecturas y quizizz, además de retos para puntos extra. Se pondera con relativa facilidad y da buenos consejos para tu desarrollo profesional.', 3, 3, 3, 3, 'Domina TOGAF y no elimines ninguna PC, y no faltes a ningún quizizz: hay puntos de participación obligatorios.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'enrique-chaparro' and cu.slug = 'arquitectura-empresarial'
union all
select pc.id, 'Relajado y valora tu punto de vista, pero exige bastante desde el parcial.', 'No suele dar respuestas concretas y valora mucho el punto de vista del alumno, preguntando siempre qué es un arquitecto para ti. Es relajado en general, pero desde el parcial en adelante el curso exige bastante (más por la naturaleza del curso que por él).', 3, 3, 2, 2, 'Ten un equipo rápido y con buena sinergia, y pide feedback seguido: eso te ayuda mucho a ponderar con él.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'tobias-aliaga' and cu.slug = 'arquitectura-empresarial'
union all
select pc.id, 'Curso muy trabajoso y virtual; el profe elige tu grupo, no tú.', 'Da mucho énfasis a sus indicaciones y habla bastante de su vida personal en clase. No hay parcial ni final (solo entregables secuenciales y obligatorios), pero el curso demanda muchísimo tiempo y no se puede faltar.', 4, 5, 3, 2, 'Aprovecha todas sus bonificaciones y el canal de YouTube como guía de Stella, y no dejes ningún entregable: son secuenciales y obligatorios, sin sustitutorio.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'jorge-llanos' and cu.slug = 'dinamica-de-sistemas'
union all
select pc.id, 'Clases casi trámite; lo importante son los talleres y ahí todos sacan 20.', 'Sus clases son prácticamente un trámite, ya que lo importante son los talleres, con ejercicios simples y sin obligarte a quedarte si terminas temprano. Las PCs ponderables son exposiciones, y una de ellas ya cuenta con puntos de los talleres.', 1, 2, 2, 4, 'Consigue los ejercicios resueltos de talleres pasados (planchas) para ir más rápido, y si puedes eliminar una PC, elimina la PC4: suele ser la más complicada.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'celedonio-mendez' and cu.slug = 'dinamica-de-sistemas'
union all
select pc.id, 'Planchero también en IO II; clases tranquilas y algo vacías.', 'Lee el PPT y resuelve ejemplos en pizarra, con clases bastante tranquilas (el salón suele estar medio vacío). Es planchero, así que estudiar sus exámenes pasados ayuda bastante.', 2, 2, 2, 3, 'Estudia sus planchas y resuelve los problemas igual a como él los resuelve en sus ejemplos de pizarra.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'cesar-canelo' and cu.slug = 'investigacion-de-operaciones-ii'
union all
select pc.id, 'Clases cortas con WinQSB; explica bien tus soluciones o no hay puntaje completo.', 'Clases cortas (a veces media hora) donde enseña a usar WinQSB (da la solución pero no el procedimiento). Resuelve problemas de exámenes pasados que suelen venir casi iguales, aunque el tiempo de PCs y exámenes es corto (1 hora).', 3, 2, 2, 3, 'Resuelve planchitas de exámenes pasados y explica bien tus soluciones al calificar: si no las sustentas, no te da el puntaje completo.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-lujan' and cu.slug = 'investigacion-de-operaciones-ii'
union all
select pc.id, 'Exámenes letales; PC1 y las últimas PCs son las más ponderables.', 'Presenta el material brevemente y pasa rápido a ejercicios, dando puntos por resolverlos. El parcial y final mezclan planchas de evaluaciones pasadas (le gusta mezclar), y espera un parcial muy exigente y un final decisivo.', 4, 4, 4, 2, 'Aprovecha al máximo la PC1 y las últimas PCs (son las más ponderables) y ten mucho cuidado con la PC2 y el parcial: ahí es donde más se complica.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'luis-medina' and cu.slug = 'investigacion-de-operaciones-ii'
union all
select pc.id, 'Casi no hay teoría; todo gira en torno al Soft BPM y mucho floro en tus expos.', 'Prácticamente no dicta teoría, asesorando avances y dictando clase recién en las semanas finales. El curso demanda muchísimas horas por la cantidad de entregables, pero destacar tu aprendizaje y usar storytelling en tus expos ayuda bastante a la nota.', 4, 5, 3, 2, 'Domina el Soft BPM y lee el libro de Dumas, y prioriza los entregables 1, 2 y 3: su peso se refleja directo en el parcial y final.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'rodriguez-ulloa' and cu.slug = 'modelado-de-procesos-de-ciclo-de-vida-de-sistemas'
union all
select pc.id, 'Notas altas casi seguro; nunca sabrás lo que es jalar con él.', 'Casi no hay teoría: la mayoría del tiempo avanzas el siguiente entregable con tu equipo (tú eliges tu team) y puedes llamarlo si tienes dudas. Es comprensivo si le hablas con buena onda, aunque a veces se pone cascarrabias.', 2, 3, 2, 3, 'Asiste siempre a sus clases y participa en las presentaciones: con eso ya prácticamente tienes la nota asegurada.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'un-jan-liau-hing' and cu.slug = 'modelado-de-procesos-de-ciclo-de-vida-de-sistemas'
union all
select pc.id, 'El hard de hards; no se puede eliminar ninguna PC y califica muy estricto.', 'Explica buena teoría útil para el futuro y hace participar a los alumnos, sin permitir dispositivos electrónicos. Es de las más estrictas calificando y solo acepta su propio método, aunque se pone algo más accesible hacia el final del ciclo.', 5, 4, 3, 3, 'Arma un equipo real de mínimo 3 personas y esmérate mucho en las monografías (revisa bastante teoría para ellas): no hay PC que se pueda eliminar con ella.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'oria-chavarria' and cu.slug = 'sistema-y-gestion-financiera'
union all
select pc.id, 'Planchero con PCs tipo plantilla; sus clases no explican tan bien.', 'Explica el PPT y deja talleres grupales, resolviendo ejemplos parecidos a lo que vendrá en las PCs (que suelen ser plantillas). No explica muy bien, así que conviene leer las fuentes externas que recomienda.', 3, 3, 3, 2, 'Resuelve planchas y lee los libros que recomienda (no siempre explica bien en clase) y coordina con el delegado la gestión de puntos extra.', 'nucleo_pdf' from profesor_curso pc join profesores pr on pr.id = pc.profesor_id join cursos cu on cu.id = pc.curso_id where pr.slug = 'john-valle' and cu.slug = 'sistema-y-gestion-financiera';
