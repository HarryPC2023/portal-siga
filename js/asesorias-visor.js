// Visor embebido de Asesorías — SIGA build v1
//
// Reemplaza los enlaces "target=_blank" de asesorias.html por un modal que
// vive dentro de la misma página. Dos modos:
//   - pdf: usa el MOTOR de pdf.js (sin su UI) para dibujar cada página en
//     <canvas> + una capa de texto invisible encima (para poder buscar y
//     seleccionar texto). El toolbar completo es CSS/HTML propio de SIGA.
//   - web: mete la url en un <iframe>, con un toolbar minimo (esa web ya
//     tiene su propia navegacion).
//
// Solo se usa el motor de pdf.js (build/pdf.min.mjs), nunca su viewer.html
// prearmado — así el look final es 100% de SIGA y no el generico de Mozilla.

import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.worker.min.mjs';

// ---------- Iconos (SVG inline, trazo simple, heredan color con currentColor) ----------
const ICONOS = {
    buscar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    anterior: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    siguiente: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    zoomMenos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    zoomMas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    imprimir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    descargar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    nuevaPestana: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

const ZOOM_PASO = 0.15;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

let overlay, caja, toolbar;
let elTitulo, elControlesPDF, elContenido, elCargando;
let elPdfPagina, elCanvas, elTextLayer, elWebIframe;
let btnBuscar, buscadorBox, inputBuscar, contadorBuscar, btnBuscarAnt, btnBuscarSig;
let btnPagAnt, btnPagSig, inputPagina, spanTotalPaginas;
let btnZoomMenos, btnZoomMas, spanZoomPct;
let btnImprimir, btnDescargar, btnNuevaPestana, btnFullscreen, btnCerrar;

let construido = false;

// Estado del documento PDF actualmente abierto.
const estado = {
    modo: null,          // 'pdf' | 'web'
    url: '',
    titulo: '',
    pdf: null,            // PDFDocumentProxy
    paginaActual: 1,
    totalPaginas: 0,
    escala: 1,
    tareaRender: null,    // render task en curso, para poder cancelarla
    textoCache: new Map(), // numPagina -> texto plano en minusculas (para buscar)
    coincidencias: [],     // lista de numeros de pagina con al menos 1 coincidencia
    indiceCoincidencia: -1,
    consultaActual: '',
};

function normalizar(txt) {
    return txt
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// ---------- Construcción del modal (una sola vez, se reutiliza siempre) ----------
function construirModal() {
    if (construido) return;

    overlay = document.createElement('div');
    overlay.className = 'visor-overlay';
    overlay.id = 'visorAsesorias';
    overlay.innerHTML = `
    <div class="visor-caja">
      <header class="visor-toolbar">
        <div class="visor-toolbar-izq">
          <span class="visor-titulo"></span>
        </div>

        <div class="visor-toolbar-centro">
          <button type="button" class="visor-btn" data-accion="buscar" title="Buscar" aria-label="Buscar">${ICONOS.buscar}</button>
          <div class="visor-buscador" hidden>
            <input type="text" placeholder="Buscar en el documento…" data-rol="input-buscar">
            <span class="visor-buscar-contador" data-rol="contador-buscar"></span>
            <button type="button" class="visor-btn" data-accion="buscar-anterior" title="Anterior coincidencia">${ICONOS.anterior}</button>
            <button type="button" class="visor-btn" data-accion="buscar-siguiente" title="Siguiente coincidencia">${ICONOS.siguiente}</button>
            <button type="button" class="visor-btn" data-accion="buscar-cerrar" title="Cerrar búsqueda">${ICONOS.cerrar}</button>
          </div>

          <div class="visor-paginacion">
            <button type="button" class="visor-btn" data-accion="pagina-anterior" title="Página anterior">${ICONOS.anterior}</button>
            <input type="number" min="1" value="1" data-rol="input-pagina">
            <span>de <span data-rol="total-paginas">–</span></span>
            <button type="button" class="visor-btn" data-accion="pagina-siguiente" title="Página siguiente">${ICONOS.siguiente}</button>
          </div>

          <div class="visor-zoom">
            <button type="button" class="visor-btn" data-accion="zoom-menos" title="Alejar">${ICONOS.zoomMenos}</button>
            <span data-rol="zoom-pct">100%</span>
            <button type="button" class="visor-btn" data-accion="zoom-mas" title="Acercar">${ICONOS.zoomMas}</button>
          </div>
        </div>

        <div class="visor-toolbar-der">
          <button type="button" class="visor-btn" data-accion="imprimir" title="Imprimir">${ICONOS.imprimir}</button>
          <button type="button" class="visor-btn" data-accion="descargar" title="Descargar">${ICONOS.descargar}</button>
          <button type="button" class="visor-btn" data-accion="nueva-pestana" title="Abrir en pestaña nueva">${ICONOS.nuevaPestana}</button>
          <button type="button" class="visor-btn" data-accion="fullscreen" title="Pantalla completa">${ICONOS.fullscreen}</button>
          <button type="button" class="visor-btn visor-btn-cerrar" data-accion="cerrar" title="Cerrar" aria-label="Cerrar">${ICONOS.cerrar}</button>
        </div>
      </header>

      <div class="visor-contenido">
        <div class="visor-pdf-pagina" hidden>
          <div class="visor-pdf-lienzo-wrap">
            <canvas></canvas>
            <div class="textLayer"></div>
          </div>
        </div>
        <iframe class="visor-web-iframe" hidden></iframe>
        <div class="visor-cargando" hidden>Cargando documento…</div>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);

    caja = overlay.querySelector('.visor-caja');
    toolbar = overlay.querySelector('.visor-toolbar');
    elTitulo = overlay.querySelector('.visor-titulo');
    elControlesPDF = overlay.querySelector('.visor-toolbar-centro');
    elContenido = overlay.querySelector('.visor-contenido');
    elCargando = overlay.querySelector('.visor-cargando');
    elPdfPagina = overlay.querySelector('.visor-pdf-pagina');
    elCanvas = overlay.querySelector('canvas');
    elTextLayer = overlay.querySelector('.textLayer');
    elWebIframe = overlay.querySelector('.visor-web-iframe');

    btnBuscar = overlay.querySelector('[data-accion="buscar"]');
    buscadorBox = overlay.querySelector('.visor-buscador');
    inputBuscar = overlay.querySelector('[data-rol="input-buscar"]');
    contadorBuscar = overlay.querySelector('[data-rol="contador-buscar"]');
    btnBuscarAnt = overlay.querySelector('[data-accion="buscar-anterior"]');
    btnBuscarSig = overlay.querySelector('[data-accion="buscar-siguiente"]');

    btnPagAnt = overlay.querySelector('[data-accion="pagina-anterior"]');
    btnPagSig = overlay.querySelector('[data-accion="pagina-siguiente"]');
    inputPagina = overlay.querySelector('[data-rol="input-pagina"]');
    spanTotalPaginas = overlay.querySelector('[data-rol="total-paginas"]');

    btnZoomMenos = overlay.querySelector('[data-accion="zoom-menos"]');
    btnZoomMas = overlay.querySelector('[data-accion="zoom-mas"]');
    spanZoomPct = overlay.querySelector('[data-rol="zoom-pct"]');

    btnImprimir = overlay.querySelector('[data-accion="imprimir"]');
    btnDescargar = overlay.querySelector('[data-accion="descargar"]');
    btnNuevaPestana = overlay.querySelector('[data-accion="nueva-pestana"]');
    btnFullscreen = overlay.querySelector('[data-accion="fullscreen"]');
    btnCerrar = overlay.querySelector('[data-accion="cerrar"]');

    enlazarEventos();
    construido = true;
}

function enlazarEventos() {
    overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) cerrarVisor();
    });

    btnCerrar.addEventListener('click', cerrarVisor);

    document.addEventListener('keydown', (ev) => {
        if (!overlay.classList.contains('visible')) return;

        if (ev.key === 'Escape') {
            if (!buscadorBox.hidden) {
                cerrarBuscador();
            } else {
                cerrarVisor();
            }
            return;
        }

        // Las flechas solo pasan página si el foco no está en un input (para
        // no pelearse con el cursor de texto del buscador o del salto de página).
        const enCampoDeTexto = ev.target === inputBuscar || ev.target === inputPagina;
        if (estado.modo === 'pdf' && !enCampoDeTexto) {
            if (ev.key === 'ArrowLeft') irAPagina(estado.paginaActual - 1);
            if (ev.key === 'ArrowRight') irAPagina(estado.paginaActual + 1);
        }
    });

    // --- Búsqueda ---
    btnBuscar.addEventListener('click', () => {
        const abrir = buscadorBox.hidden;
        buscadorBox.hidden = !abrir;
        if (abrir) inputBuscar.focus();
    });

    overlay.querySelector('[data-accion="buscar-cerrar"]').addEventListener('click', cerrarBuscador);

    inputBuscar.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            if (ev.shiftKey) moverCoincidencia(-1); else ejecutarBusqueda();
        }
    });

    let debounceBusqueda;
    inputBuscar.addEventListener('input', () => {
        clearTimeout(debounceBusqueda);
        debounceBusqueda = setTimeout(ejecutarBusqueda, 350);
    });

    btnBuscarAnt.addEventListener('click', () => moverCoincidencia(-1));
    btnBuscarSig.addEventListener('click', () => moverCoincidencia(1));

    // --- Paginación ---
    btnPagAnt.addEventListener('click', () => irAPagina(estado.paginaActual - 1));
    btnPagSig.addEventListener('click', () => irAPagina(estado.paginaActual + 1));
    inputPagina.addEventListener('change', () => irAPagina(parseInt(inputPagina.value, 10) || 1));

    // --- Zoom ---
    btnZoomMenos.addEventListener('click', () => cambiarZoom(-ZOOM_PASO));
    btnZoomMas.addEventListener('click', () => cambiarZoom(ZOOM_PASO));

    // --- Acciones de la derecha ---
    btnImprimir.addEventListener('click', imprimirDocumento);
    btnDescargar.addEventListener('click', descargarDocumento);
    btnNuevaPestana.addEventListener('click', () => window.open(estado.url, '_blank', 'noopener'));
    btnFullscreen.addEventListener('click', alternarFullscreen);

    document.addEventListener('fullscreenchange', () => {
        btnFullscreen.classList.toggle('activo', document.fullscreenElement === caja);
    });
}

function cerrarBuscador() {
    buscadorBox.hidden = true;
    limpiarResaltados();
    estado.coincidencias = [];
    estado.indiceCoincidencia = -1;
    contadorBuscar.textContent = '';
}

// ---------- Apertura pública ----------
export function abrirVisorPDF(url, titulo) {
    construirModal();
    resetEstado();
    estado.modo = 'pdf';
    estado.url = url;
    estado.titulo = titulo || 'Documento';

    elTitulo.textContent = estado.titulo;
    elControlesPDF.hidden = false;
    elPdfPagina.hidden = false;
    elWebIframe.hidden = true;
    elWebIframe.src = 'about:blank';

    mostrarOverlay();
    cargarPDF(url);
}

export function abrirVisorWeb(url, titulo) {
    construirModal();
    resetEstado();
    estado.modo = 'web';
    estado.url = url;
    estado.titulo = titulo || 'Vista previa';

    elTitulo.textContent = estado.titulo;
    elControlesPDF.hidden = true;
    elPdfPagina.hidden = true;
    elWebIframe.hidden = false;
    elWebIframe.src = url;

    mostrarOverlay();
}

function resetEstado() {
    estado.pdf = null;
    estado.paginaActual = 1;
    estado.totalPaginas = 0;
    estado.escala = 1;
    estado.textoCache = new Map();
    estado.coincidencias = [];
    estado.indiceCoincidencia = -1;
    estado.consultaActual = '';
    buscadorBox.hidden = true;
    inputBuscar.value = '';
    contadorBuscar.textContent = '';
    spanZoomPct.textContent = '100%';
}

function mostrarOverlay() {
    document.body.style.overflow = 'hidden';
    // rAF para que el navegador registre el estado inicial (opacity 0) antes
    // de añadir la clase — si no, la primera apertura (justo tras crear el
    // modal) salta directo al estado final sin animar la transición.
    requestAnimationFrame(() => overlay.classList.add('visible'));
}

function cerrarVisor() {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';

    if (document.fullscreenElement === caja) document.exitFullscreen();

    if (estado.tareaRender) {
        estado.tareaRender.cancel();
        estado.tareaRender = null;
    }
    if (estado.pdf) {
        estado.pdf.destroy();
        estado.pdf = null;
    }
    elWebIframe.src = 'about:blank';
}

// ---------- Carga y render del PDF ----------
async function cargarPDF(url) {
    elCargando.hidden = false;
    elCargando.textContent = 'Cargando documento…';
    elPdfPagina.style.visibility = 'hidden';

    try {
        const tarea = pdfjsLib.getDocument(url);
        estado.pdf = await tarea.promise;
        estado.totalPaginas = estado.pdf.numPages;
        spanTotalPaginas.textContent = estado.totalPaginas;
        inputPagina.max = estado.totalPaginas;

        // Escala inicial: que la primera página quepa a lo ancho del panel
        // de contenido, con un tope razonable para que no se vea gigante en
        // pantallas anchas.
        const primeraPagina = await estado.pdf.getPage(1);
        const viewportBase = primeraPagina.getViewport({ scale: 1 });
        const anchoDisponible = elContenido.clientWidth - 44;
        estado.escala = Math.min(Math.max(anchoDisponible / viewportBase.width, 0.5), 1.6);
        actualizarZoomPct();

        await irAPagina(1, { forzar: true });
        elCargando.hidden = true;
        elPdfPagina.style.visibility = 'visible';
    } catch (err) {
        console.error('No se pudo cargar el PDF:', err);
        elCargando.textContent = 'No se pudo cargar el documento. Puedes abrirlo en una pestaña nueva con el botón de arriba.';
    }
}

async function renderizarPaginaActual() {
    if (!estado.pdf) return;

    if (estado.tareaRender) {
        estado.tareaRender.cancel();
    }

    const pagina = await estado.pdf.getPage(estado.paginaActual);
    const viewport = pagina.getViewport({ scale: estado.escala });

    const contexto = elCanvas.getContext('2d');
    elCanvas.width = viewport.width;
    elCanvas.height = viewport.height;
    elCanvas.style.width = `${viewport.width}px`;
    elCanvas.style.height = `${viewport.height}px`;

    elTextLayer.style.width = `${viewport.width}px`;
    elTextLayer.style.height = `${viewport.height}px`;
    elTextLayer.innerHTML = '';
    elTextLayer.style.setProperty('--scale-factor', estado.escala);

    const tarea = pagina.render({ canvasContext: contexto, viewport });
    estado.tareaRender = tarea;

    try {
        await tarea.promise;
    } catch (err) {
        if (err && err.name === 'RenderingCancelledException') return;
        console.error('Error dibujando la página:', err);
        return;
    }
    estado.tareaRender = null;

    // Capa de texto: habilita seleccionar/copiar y es donde se resaltan
    // las coincidencias de búsqueda.
    try {
        const contenidoTexto = await pagina.getTextContent();
        const capa = new pdfjsLib.TextLayer({
            textContentSource: contenidoTexto,
            container: elTextLayer,
            viewport,
        });
        await capa.render();
    } catch (err) {
        console.warn('No se pudo construir la capa de texto:', err);
    }

    if (estado.consultaActual) resaltarCoincidenciasEnPaginaActual();

    inputPagina.value = estado.paginaActual;
    btnPagAnt.disabled = estado.paginaActual <= 1;
    btnPagSig.disabled = estado.paginaActual >= estado.totalPaginas;
}

async function irAPagina(numero, { forzar = false } = {}) {
    if (!estado.pdf) return;
    const destino = Math.min(Math.max(numero, 1), estado.totalPaginas);
    if (destino === estado.paginaActual && !forzar) {
        inputPagina.value = estado.paginaActual;
        return;
    }
    estado.paginaActual = destino;
    elContenido.scrollTop = 0;
    await renderizarPaginaActual();
}

function cambiarZoom(delta) {
    if (!estado.pdf) return;
    const nuevo = Math.min(Math.max(estado.escala + delta, ZOOM_MIN), ZOOM_MAX);
    if (nuevo === estado.escala) return;
    estado.escala = nuevo;
    actualizarZoomPct();
    renderizarPaginaActual();
}

function actualizarZoomPct() {
    // 100% = tamaño real del PDF (escala 1), igual que Adobe/Chrome/etc.
    // Al abrir el documento la escala inicial puede no ser 1 (se ajusta al
    // ancho del panel), así que el porcentaje mostrado puede no arrancar
    // en "100%" — es correcto, refleja el zoom real aplicado.
    spanZoomPct.textContent = `${Math.round(estado.escala * 100)}%`;
}

// ---------- Búsqueda ----------
async function obtenerTextoPagina(numero) {
    if (estado.textoCache.has(numero)) return estado.textoCache.get(numero);
    const pagina = await estado.pdf.getPage(numero);
    const contenido = await pagina.getTextContent();
    const texto = normalizar(contenido.items.map((it) => it.str).join(' '));
    estado.textoCache.set(numero, texto);
    return texto;
}

async function ejecutarBusqueda() {
    const consulta = normalizar(inputBuscar.value.trim());
    limpiarResaltados();
    estado.consultaActual = consulta;

    if (!consulta || !estado.pdf) {
        estado.coincidencias = [];
        estado.indiceCoincidencia = -1;
        contadorBuscar.textContent = '';
        return;
    }

    contadorBuscar.textContent = 'Buscando…';

    const paginasConCoincidencia = [];
    for (let n = 1; n <= estado.totalPaginas; n++) {
        const texto = await obtenerTextoPagina(n);
        if (texto.includes(consulta)) paginasConCoincidencia.push(n);
    }

    estado.coincidencias = paginasConCoincidencia;

    if (!paginasConCoincidencia.length) {
        contadorBuscar.textContent = 'Sin resultados';
        estado.indiceCoincidencia = -1;
        return;
    }

    // Si la página actual ya tiene coincidencia, nos quedamos ahí; si no,
    // saltamos a la primera página con resultado.
    const idxEnActual = paginasConCoincidencia.indexOf(estado.paginaActual);
    estado.indiceCoincidencia = idxEnActual >= 0 ? idxEnActual : 0;

    actualizarContadorBusqueda();

    if (idxEnActual >= 0) {
        resaltarCoincidenciasEnPaginaActual();
    } else {
        await irAPagina(paginasConCoincidencia[0]);
    }
}

function actualizarContadorBusqueda() {
    if (!estado.coincidencias.length) return;
    contadorBuscar.textContent = `Página ${estado.indiceCoincidencia + 1} de ${estado.coincidencias.length} con resultados`;
}

async function moverCoincidencia(direccion) {
    if (!estado.coincidencias.length) return;
    let nuevoIndice = estado.indiceCoincidencia + direccion;
    if (nuevoIndice < 0) nuevoIndice = estado.coincidencias.length - 1;
    if (nuevoIndice >= estado.coincidencias.length) nuevoIndice = 0;
    estado.indiceCoincidencia = nuevoIndice;
    actualizarContadorBusqueda();
    await irAPagina(estado.coincidencias[nuevoIndice]);
}

function limpiarResaltados() {
    elTextLayer.querySelectorAll('mark.visor-resaltado').forEach((marca) => {
        const padre = marca.parentNode;
        if (!padre) return;
        padre.replaceChild(document.createTextNode(marca.textContent), marca);
        padre.normalize();
    });
}

function resaltarCoincidenciasEnPaginaActual() {
    if (!estado.consultaActual) return;
    limpiarResaltados();

    const consulta = estado.consultaActual;
    const spans = elTextLayer.querySelectorAll('span');

    spans.forEach((span) => {
        const original = span.textContent;
        const normalizado = normalizar(original);
        if (!normalizado.includes(consulta)) return;

        // Reconstruye el span intercalando <mark> alrededor de cada
        // coincidencia, preservando el resto del texto tal cual.
        let restante = original;
        let restanteNorm = normalizado;
        const fragmento = document.createDocumentFragment();

        while (true) {
            const pos = restanteNorm.indexOf(consulta);
            if (pos === -1) {
                if (restante) fragmento.appendChild(document.createTextNode(restante));
                break;
            }
            if (pos > 0) fragmento.appendChild(document.createTextNode(restante.slice(0, pos)));
            const marca = document.createElement('mark');
            marca.className = 'visor-resaltado';
            marca.textContent = restante.slice(pos, pos + consulta.length);
            fragmento.appendChild(marca);
            restante = restante.slice(pos + consulta.length);
            restanteNorm = restanteNorm.slice(pos + consulta.length);
        }

        span.textContent = '';
        span.appendChild(fragmento);
    });
}

// ---------- Imprimir / Descargar / Pantalla completa ----------
function imprimirDocumento() {
    // Se imprime el PDF original (no el canvas) para no perder calidad —
    // se carga en un iframe oculto y se dispara print() sobre esa ventana.
    const iframeImpresion = document.createElement('iframe');
    iframeImpresion.style.position = 'fixed';
    iframeImpresion.style.right = '0';
    iframeImpresion.style.bottom = '0';
    iframeImpresion.style.width = '0';
    iframeImpresion.style.height = '0';
    iframeImpresion.style.border = '0';
    iframeImpresion.src = estado.url;

    iframeImpresion.onload = () => {
        try {
            iframeImpresion.contentWindow.focus();
            iframeImpresion.contentWindow.print();
        } catch (err) {
            console.error('No se pudo imprimir directamente, se abre en pestaña nueva:', err);
            window.open(estado.url, '_blank', 'noopener');
        }
        setTimeout(() => iframeImpresion.remove(), 60000);
    };

    document.body.appendChild(iframeImpresion);
}

function descargarDocumento() {
    const enlace = document.createElement('a');
    enlace.href = estado.url;
    enlace.download = estado.titulo ? `${estado.titulo}.pdf` : '';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
}

function alternarFullscreen() {
    if (document.fullscreenElement === caja) {
        document.exitFullscreen();
    } else {
        caja.requestFullscreen().catch((err) => console.warn('Fullscreen no disponible:', err));
    }
}

// ---------- Conexión automática con [data-visor] en la página ----------
// Cualquier elemento con data-visor="pdf" o data-visor="web", más
// data-src y data-titulo, abre el visor sin tener que escribir el
// listener a mano en cada página.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-visor]').forEach((el) => {
        el.addEventListener('click', (ev) => {
            ev.preventDefault();
            const tipo = el.dataset.visor;
            const src = el.dataset.src;
            const titulo = el.dataset.titulo || el.textContent.trim();
            if (tipo === 'pdf') abrirVisorPDF(src, titulo);
            else if (tipo === 'web') abrirVisorWeb(src, titulo);
        });
    });
});