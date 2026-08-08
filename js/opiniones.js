// js/opiniones.js
import { supabase, requerirSesion, montarNavUsuario } from './auth-siga.js?v=9';

const CICLOS = Array.from({ length: 10 }, (_, i) => i + 1);
const POR_PAGINA = 9;
const LS_VISTA = 'opiniones_vista';

let sesionActual = null;
let perfiles = [];
let opinionesPorFicha = new Map();
let reportadasPorMi = new Set();
let paginaActual = 1;
let selectCarrera = null;
let selectCiclo = null;
let vistaActual = localStorage.getItem(LS_VISTA) || 'grid';

const grid = document.getElementById('opinionesGrid');
const paginacionCont = document.getElementById('opinionesPaginacion');
const detalle = document.getElementById('detalleProfesor');
const buscador = document.getElementById('buscadorOpiniones');

document.addEventListener('DOMContentLoaded', async () => {
  montarNavUsuario();
  configurarFiltros();
  configurarVista();

  // requerirSesion ya redirige a index.html?login=1 si no hay cuenta,
  // así que si llegamos aquí, sesionActual siempre existe.
  sesionActual = await requerirSesion('');
  if (!sesionActual) return;

  grid.innerHTML = '<p class="opiniones-vacio">Cargando perfiles…</p>';
  await cargarTodo();
  renderGrid();
});

/** Quita tildes/diacríticos y pasa a minúsculas, para comparar sin exigir tildes exactas. */
function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function cargarTodo() {
  const { data: perfilesData, error: errPerfiles } = await supabase
    .from('perfiles_profesor')
    .select(`
      id, profesor_curso_id, resumen, que_esperar,
      exigencia, carga_trabajo, ritmo, claridad, recomendaciones,
      profesor_curso:profesor_curso_id (
        id,
        profesores ( nombre ),
        cursos ( nombre, codigo, carrera, ciclo_ref )
      )
    `);

  if (errPerfiles) {
    console.error('Error cargando perfiles:', errPerfiles);
    grid.innerHTML = '<p class="opiniones-error">No se pudieron cargar los perfiles. Intenta recargar la página.</p>';
    return;
  }
  perfiles = perfilesData || [];

  const { data: opinionesData, error: errOpiniones } = await supabase
    .from('opiniones_publicas')
    .select('*')
    .order('creado_en', { ascending: false });

  opinionesPorFicha = new Map();
  if (!errOpiniones) {
    for (const op of opinionesData) {
      const lista = opinionesPorFicha.get(op.profesor_curso_id) || [];
      lista.push(op);
      opinionesPorFicha.set(op.profesor_curso_id, lista);
    }
  } else {
    console.error('Error cargando opiniones:', errOpiniones);
  }

  const { data: misReportes } = await supabase
    .from('opinion_reportes')
    .select('opinion_id')
    .eq('autor_id', sesionActual.user.id);
  reportadasPorMi = new Set((misReportes || []).map((r) => r.opinion_id));
}

function promedioOpiniones(lista) {
  if (!lista || !lista.length) return null;
  const suma = lista.reduce((acc, o) => acc + (o.claridad + o.exigencia + o.carga_trabajo + o.evaluaciones) / 4, 0);
  return suma / lista.length;
}

function estrellas(valor) {
  const llenas = Math.round(valor || 0);
  return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
}

/**
 * Orden: 1) ciclo ascendente (ciclo variable/null va al final),
 * 2) curso A-Z, 3) profesor A-Z. Usa localeCompare('es') para que tildes
 * y ñ ordenen de forma natural.
 */
function compararPerfiles(a, b) {
  const cursoA = a.profesor_curso.cursos;
  const cursoB = b.profesor_curso.cursos;

  const cicloA = cursoA.ciclo_ref ?? 99;
  const cicloB = cursoB.ciclo_ref ?? 99;
  if (cicloA !== cicloB) return cicloA - cicloB;

  const cmpCurso = cursoA.nombre.localeCompare(cursoB.nombre, 'es', { sensitivity: 'base' });
  if (cmpCurso !== 0) return cmpCurso;

  const profA = a.profesor_curso.profesores.nombre;
  const profB = b.profesor_curso.profesores.nombre;
  return profA.localeCompare(profB, 'es', { sensitivity: 'base' });
}

/**
 * Arma el rango de números de página a mostrar. Con pocas páginas las
 * muestra todas; con muchas, muestra 1, la última, y las cercanas a la
 * actual, con "…" en los saltos (mismo patrón que YouTube/Google).
 */
function construirRangoPaginas(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set([1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const resultado = [];
  let anterior = 0;
  for (const p of ordenadas) {
    if (p - anterior > 1) resultado.push('…');
    resultado.push(p);
    anterior = p;
  }
  return resultado;
}

function cambiarPagina(n) {
  paginaActual = n;
  renderGrid();
  grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPaginacion(totalVisibles, totalPaginas) {
  if (!paginacionCont) return;

  if (totalPaginas <= 1) {
    paginacionCont.innerHTML = '';
    return;
  }

  const desde = (paginaActual - 1) * POR_PAGINA + 1;
  const hasta = Math.min(paginaActual * POR_PAGINA, totalVisibles);
  const rango = construirRangoPaginas(paginaActual, totalPaginas);

  paginacionCont.innerHTML = `
    <p class="opiniones-rango">Mostrando ${desde}–${hasta} de ${totalVisibles}</p>
    <div class="opiniones-paginacion-barra">
      <button class="paginacion-flecha" id="btnPagAnterior" ${paginaActual === 1 ? 'disabled' : ''}>‹ Anterior</button>
      <div class="paginacion-numeros">
        ${rango.map((p) => p === '…'
    ? '<span class="paginacion-puntos">…</span>'
    : `<button class="paginacion-num ${p === paginaActual ? 'activo' : ''}" data-pagina="${p}">${p}</button>`
  ).join('')}
      </div>
      <button class="paginacion-flecha" id="btnPagSiguiente" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente ›</button>
    </div>
  `;

  document.getElementById('btnPagAnterior').addEventListener('click', () => cambiarPagina(paginaActual - 1));
  document.getElementById('btnPagSiguiente').addEventListener('click', () => cambiarPagina(paginaActual + 1));
  paginacionCont.querySelectorAll('.paginacion-num').forEach((btn) => {
    btn.addEventListener('click', () => cambiarPagina(Number(btn.dataset.pagina)));
  });
}

function renderGrid() {
  const carrera = selectCarrera ? selectCarrera.valor.value : '';
  const ciclo = selectCiclo ? selectCiclo.valor.value : '';
  const busqueda = normalizar(buscador ? buscador.value : '');

  const visibles = perfiles.filter((p) => {
    const curso = p.profesor_curso?.cursos;
    if (!curso) return false;
    // curso.carrera === null -> curso común a las 3 carreras, siempre visible
    if (carrera && curso.carrera && curso.carrera !== carrera) return false;
    if (ciclo && String(curso.ciclo_ref) !== ciclo) return false;
    if (busqueda) {
      const profesor = p.profesor_curso.profesores.nombre;
      const coincide = normalizar(profesor).includes(busqueda) || normalizar(curso.nombre).includes(busqueda);
      if (!coincide) return false;
    }
    return true;
  });

  if (!visibles.length) {
    grid.innerHTML = `<p class="opiniones-vacio">${busqueda ? 'No encontramos resultados para tu búsqueda.' : 'No hay perfiles para este filtro todavía.'}</p>`;
    if (paginacionCont) paginacionCont.innerHTML = '';
    return;
  }

  visibles.sort(compararPerfiles);

  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  if (paginaActual < 1) paginaActual = 1;

  const inicio = (paginaActual - 1) * POR_PAGINA;
  const visiblesPagina = visibles.slice(inicio, inicio + POR_PAGINA);

  let html = '';
  let cicloAnterior;
  let esPrimero = true;

  visiblesPagina.forEach((p) => {
    const curso = p.profesor_curso.cursos;
    const profesor = p.profesor_curso.profesores;
    const lista = opinionesPorFicha.get(p.profesor_curso_id) || [];
    const prom = promedioOpiniones(lista);
    const etiquetaCiclo = curso.ciclo_ref ? `Ciclo ${curso.ciclo_ref}` : 'Ciclo variable';

    if (esPrimero || curso.ciclo_ref !== cicloAnterior) {
      html += `<h2 class="opiniones-ciclo-header">${etiquetaCiclo}</h2>`;
      cicloAnterior = curso.ciclo_ref;
      esPrimero = false;
    }

    html += `
      <button class="opinion-card" data-id="${p.id}">
        <span class="opinion-card-curso">${curso.nombre} · ${etiquetaCiclo}</span>
        <h3>${profesor.nombre}</h3>
        <p class="opinion-card-frase">${p.resumen}</p>
        <div class="opinion-card-estrellas">
          <span aria-hidden="true">${estrellas(prom)}</span>
          <span class="opinion-card-conteo">${lista.length ? `${prom.toFixed(1)} · ${lista.length} opiniones` : 'Sin opiniones aún'}</span>
        </div>
      </button>`;
  });

  grid.innerHTML = html;

  grid.querySelectorAll('.opinion-card').forEach((card) => {
    card.addEventListener('click', () => {
      grid.querySelectorAll('.opinion-card.activa').forEach((c) => c.classList.remove('activa'));
      card.classList.add('activa');
      abrirDetalle(card.dataset.id);
    });
  });

  renderPaginacion(visibles.length, totalPaginas);
}

function abrirDetalle(perfilId) {
  const p = perfiles.find((x) => x.id === perfilId);
  if (!p) return;
  const curso = p.profesor_curso.cursos;
  const profesor = p.profesor_curso.profesores;
  const lista = opinionesPorFicha.get(p.profesor_curso_id) || [];
  const prom = promedioOpiniones(lista);
  const etiquetaCiclo = curso.ciclo_ref ? `Ciclo ${curso.ciclo_ref}` : 'Ciclo variable';

  detalle.innerHTML = `
    <button class="detalle-cerrar" id="btnCerrarDetalle" aria-label="Cerrar">✕</button>
    <span class="detalle-sello">✓ Perfil verificado por SIGA</span>
    <h2>${profesor.nombre}</h2>
    <p class="detalle-curso">${curso.nombre} · ${etiquetaCiclo}</p>

    <div class="detalle-bloque">
      <h4>Qué te espera</h4>
      <p>${p.que_esperar}</p>
    </div>

    <div class="detalle-consejo">
      <h4>Consejo SIGA</h4>
      <p>${p.recomendaciones}</p>
    </div>

    <div class="detalle-panorama">
      <h4>Panorama según alumnos</h4>
      ${lista.length ? `
        <div class="detalle-panorama-num">
          <span class="detalle-panorama-estrellas">${estrellas(prom)}</span>
          <span>${prom.toFixed(1)} de 5 · ${lista.length} opiniones</span>
        </div>` : '<p class="opiniones-vacio">Todavía no hay opiniones de alumnos para esta ficha. Sé el primero.</p>'}
    </div>

    <div class="detalle-recientes">
      ${lista.slice(0, 5).map((o) => `
        <div class="opinion-item">
          <div class="opinion-item-top">
            <span>Ciclo ${o.ciclo_estudiante}</span>
            <button class="opinion-item-reportar" data-op="${o.id}" ${reportadasPorMi.has(o.id) ? 'disabled' : ''}>
              ${reportadasPorMi.has(o.id) ? 'Reportado' : 'Reportar'}
            </button>
          </div>
          ${o.destacado ? `<p><strong>Destacó:</strong> ${o.destacado}</p>` : ''}
          ${o.a_tener_en_cuenta ? `<p><strong>A tener en cuenta:</strong> ${o.a_tener_en_cuenta}</p>` : ''}
        </div>`).join('')}
    </div>

    <button class="btn-primary detalle-cta" id="btnCompartirExperiencia">Compartir mi experiencia</button>
    <div id="formOpinionCont"></div>
  `;

  detalle.classList.add('visible');
  document.getElementById('btnCerrarDetalle').addEventListener('click', cerrarDetalle);
  detalle.querySelectorAll('.opinion-item-reportar').forEach((btn) => {
    btn.addEventListener('click', () => reportarOpinion(btn.dataset.op, btn));
  });
  document.getElementById('btnCompartirExperiencia').addEventListener('click', () => mostrarFormOpinion(p));
}

function cerrarDetalle() {
  detalle.classList.remove('visible');
  detalle.innerHTML = '';
  grid.querySelectorAll('.opinion-card.activa').forEach((c) => c.classList.remove('activa'));
}

function etiquetaCampo(campo) {
  return { claridad: 'Claridad', exigencia: 'Exigencia', carga_trabajo: 'Carga de trabajo', evaluaciones: 'Evaluaciones' }[campo];
}

function mostrarFormOpinion(perfil) {
  const cont = document.getElementById('formOpinionCont');
  cont.innerHTML = `
    <form class="form-opinion" id="formOpinion">
      <p class="form-opinion-banner">Recuerda: esta sección busca orientar a futuros compañeros. Enfócate en la
        metodología de enseñanza, exigencia y consejos útiles. Los comentarios con ataques personales serán
        retirados. Tu opinión se publica de inmediato.</p>

      <label>Ciclo en que llevaste el curso
        <select name="ciclo_estudiante" required>
          ${CICLOS.map((c) => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </label>

      ${['claridad', 'exigencia', 'carga_trabajo', 'evaluaciones'].map((campo) => `
        <label>${etiquetaCampo(campo)}
          <select name="${campo}" required>
            ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}">${n}</option>`).join('')}
          </select>
        </label>`).join('')}

      <label>¿Qué destacarías?
        <textarea name="destacado" maxlength="280"></textarea>
      </label>
      <label>¿Qué debería saber otro alumno?
        <textarea name="a_tener_en_cuenta" maxlength="280"></textarea>
      </label>

      <button type="submit" class="btn-primary">Publicar opinión</button>
      <p class="form-opinion-msg" id="formOpinionMsg"></p>
    </form>`;

  document.getElementById('formOpinion').addEventListener('submit', (e) => enviarOpinion(e, perfil));
}

async function enviarOpinion(e, perfil) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('formOpinionMsg');
  const datos = Object.fromEntries(new FormData(form).entries());

  const { error } = await supabase.from('opiniones').insert({
    profesor_curso_id: perfil.profesor_curso_id,
    autor_id: sesionActual.user.id,
    ciclo_estudiante: Number(datos.ciclo_estudiante),
    claridad: Number(datos.claridad),
    exigencia: Number(datos.exigencia),
    carga_trabajo: Number(datos.carga_trabajo),
    evaluaciones: Number(datos.evaluaciones),
    destacado: datos.destacado || null,
    a_tener_en_cuenta: datos.a_tener_en_cuenta || null,
  });

  if (error) {
    msg.textContent = 'No se pudo publicar tu opinión. Intenta de nuevo.';
    console.error(error);
    return;
  }

  msg.textContent = '¡Gracias! Tu opinión ya está publicada.';
  await cargarTodo();
  abrirDetalle(perfil.id);
  renderGrid();
}

async function reportarOpinion(opinionId, btn) {
  btn.disabled = true;
  const { error } = await supabase.rpc('reportar_opinion', { p_opinion_id: opinionId });
  if (error) {
    console.error(error);
    btn.disabled = false;
    return;
  }
  btn.textContent = 'Reportado';
  reportadasPorMi.add(opinionId);
}

function configurarFiltros() {
  selectCarrera = inicializarSelectPersonalizado({
    triggerId: 'carreraTrigger', textoId: 'carreraTriggerTexto',
    listaId: 'carreraLista', valorId: 'carreraValor',
    alElegir: () => { paginaActual = 1; renderGrid(); },
  });

  selectCiclo = inicializarSelectPersonalizado({
    triggerId: 'cicloTrigger', textoId: 'cicloTriggerTexto',
    listaId: 'cicloLista', valorId: 'cicloValor',
    opciones: [{ value: '', label: 'Todos los ciclos' }, ...CICLOS.map((c) => ({ value: String(c), label: `Ciclo ${c}` }))],
    alElegir: () => { paginaActual = 1; renderGrid(); },
  });

  if (buscador) {
    buscador.addEventListener('input', () => {
      paginaActual = 1;
      renderGrid();
    });
  }
}

function aplicarVista() {
  grid.classList.toggle('vista-lista', vistaActual === 'lista');
  document.querySelectorAll('.vista-btn').forEach((btn) => {
    btn.classList.toggle('activo', btn.dataset.vista === vistaActual);
  });
}

function configurarVista() {
  document.querySelectorAll('.vista-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      vistaActual = btn.dataset.vista;
      localStorage.setItem(LS_VISTA, vistaActual);
      aplicarVista();
    });
  });
  aplicarVista();
}