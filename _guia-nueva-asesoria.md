# Cómo sumar una asesoría nueva a SIGA

Guía para repetir el proceso sin depender de ningún chat. Todo lo que está
entre comillas invertidas se copia tal cual. (El guion bajo del nombre de
este archivo hace que Jekyll no lo publique en la web.)

## 0. Qué necesitas tener

- La asesoría ya terminada en el proyecto de asesorías interactivas, con
  `index.html`, `scripts.js` y `estilos.css`.
- Saber el curso (su *slug* del catálogo), el periodo en que se basa
  (`2026-1`, `2026-2`...) y la evaluación (`pc1`, `pc2`, `ep`, `pc3`, `pc4`,
  `ef`, `es`).
- Slugs de los cursos: `geometria-analitica`, `calculo-diferencial`,
  `calculo-integral`, `algebra-lineal`, `algoritmia-estructura-datos`,
  `quimica-i`, `quimica-ii`, `fisica-i`, `fisica-ii`,
  `estadistica-probabilidades`, `estadistica-aplicada`, `calculo-numerico`,
  `ecuaciones-diferenciales`, `mcd`, `dbd`, `investigacion-operaciones-i`,
  `investigacion-operaciones-ii`. Si dudas, el slug exacto está en
  `js/asesorias-cursos.js`.

## 1. Punto de retorno (opcional pero recomendado)

```
git tag antes-de-asesoria-<curso>-<evaluacion>
```
```
git push origin antes-de-asesoria-<curso>-<evaluacion>
```

## 2. Crear la carpeta y copiar los archivos

Todo en minúsculas, sin tildes ni espacios (GitHub distingue mayúsculas;
Windows no, y por eso falla solo en producción).

```
New-Item -ItemType Directory -Force -Path "assets\asesorias\<curso>\<periodo>\<evaluacion>"
```

Copia ahí solo `index.html`, `scripts.js` y `estilos.css`. **Sin carpeta
`lib`** y sin carpeta `.git`. Las librerías (KaTeX, JSXGraph) viven una sola
vez en `assets/libs/`.

## 3. Dos ajustes en el `scripts.js` de esa carpeta

Busca y reemplaza (cada texto aparece una sola vez):

```
const PREFIJO = 'siga_aw_' + SLUG + '_' + EVAL + '_';
```
por
```
const PREFIJO = 'siga_aw_' + SLUG + '_' + EVAL + '_<periodo>_';
```

```
const RUTA_LIB = 'lib/';
```
por
```
const RUTA_LIB = '../../../../libs/';
```

(Si ya vienen así desde el proyecto de asesorías, no hay nada que cambiar.
El periodo en el prefijo evita que dos ciclos de la misma evaluación se
pisen el progreso guardado en el navegador.)

## 3 bis. Activar el registro de uso (una línea)

Para que Admin → «Actividad de Asesorías» sepa quién abre, imprime o
descarga la asesoría, agrega **una línea** en su `index.html`, justo debajo
de la etiqueta `<script src="scripts.js...">`:

```
<script type="module" src="../../../../../js/asesorias-registro.js"></script>
```

- Son 5 `../` porque el `index.html` vive en
  `assets/asesorias/<curso>/<periodo>/<evaluacion>/` y `js/` está en la raíz.
- El curso, el periodo y la evaluación salen solos de la ruta de la carpeta:
  no hay nada más que configurar.
- Registra tres cosas: **abrió**, **imprimió / PDF** (se abrió el diálogo de
  impresión; el navegador no avisa si al final se imprimió) y **Excel**.
- Si la asesoría tiene botón de descarga en Excel, agrega esta línea en la
  función que descarga, justo antes del `setTimeout` que libera el archivo
  (cambia `id` por el nombre del ejemplo descargado):

```
try { window.dispatchEvent(new CustomEvent('siga:asesoria-evento', { detail: { accion: 'excel', detalle: id } })); } catch (e) { /* el registro nunca debe romper la descarga */ }
```

- Sin sesión iniciada no se anota nada.

## 4. Probar en local

Con Go Live de VS Code, abre:

```
http://127.0.0.1:5500/assets/asesorias/<curso>/<periodo>/<evaluacion>/index.html
```

Revisa fórmulas, gráficos y navegación entre secciones.

**Ojo:** en local (Go Live, `127.0.0.1`) el registro de uso NO se prueba,
porque ahí no hay sesión de SIGA (la sesión no pasa de una dirección a otra).
Se comprueba en producción, en el paso 7.

## 5. Entrada en el catálogo

En `js/asesorias-cursos.js`, dentro de `recursos: [ ... ]` del curso:

```
{
    id: '<evaluacion>-<curso-corto>-<periodo>',
    tipo: 'web',
    evaluacion: 'PC1',
    titulo: 'PC1 — <Nombre del curso>',
    periodo: '<periodo>',
},
```

- `id` único (ej. `pc1-geometria-2026-1`). Si repites uno, la consola del
  navegador (F12) avisa.
- **No escribas `descripcion`.** Las asesorías no muestran descripción: el
  título ya dice qué es. El código sigue aceptando el campo (si existe, se
  muestra), pero por decisión ya no se usa en ninguna asesoría.
- **No escribas `fecha` ni `src`.** La ruta se calcula sola y la fecha de
  publicación también (día en que la carpeta entró a Git; durante 5 días
  sale "Nuevo" y el botcito la anuncia). `fecha: null` solo si NO quieres
  etiqueta "Nuevo".

## 6. Publicar

```
git add -A
```
```
git commit -m "Asesorias: <curso> <evaluacion> <periodo>"
```
```
git push
```

## 7. Comprobar en producción (1 o 2 minutos después, con Ctrl+F5)

Abre `asesorias-curso.html?c=<slug>` y verifica:

- Aparece el chip "Ciclo <periodo>" y la etiqueta "Nuevo".
- Abre en el visor; se ven fórmulas, gráficos e imágenes.
- Imprimir funciona (en el visor, con el botón de imprimir de SIGA).
- Con tu sesión iniciada, abre la asesoría (y prueba imprimir o el Excel si lo
  tiene) y mira que aparezca en Admin → «Actividad de Asesorías». Después usa
  «Borrar mis pruebas» para que tus clics no cuenten.
- El progreso se guarda al cerrar y volver a abrir.
- En el celular se ve bien.

## Si algo sale mal

Deshacer el último commit publicado:

```
git revert HEAD --no-edit
```
```
git push
```

## Reglas que conviene recordar

- Una carpeta de periodo nueva solo cuando el contenido cambia de verdad.
- Asesorías siempre en web (nada de PDF).
- Toda asesoría nueva lleva la línea de `asesorias-registro.js` (paso 3 bis);
  sin ella no aparece en «Actividad de Asesorías».
- No borres el visor de PDF (`vendor-pdfjs`): Intranotas también lo usa.
- Una asesoría solo se edita dentro de `assets/asesorias/...` en este repo.
