/* ============================================================
   INTRANOTAS × INTRALU — Importación de notas
   Requiere que intranotas.js, cursos_db.js y el puente de Supabase
   (window.sigaSupabase / window.sigaObtenerSesion, definidos en
   index.html) ya estén cargados antes que este archivo.
   ============================================================ */

/* Busca un curso en TODO el catálogo por su código (ej. 'BMA02').
   Prioriza la carrera activa del alumno si ya está definida, para
   evitar ambigüedad si el mismo código existiera en más de una
   carrera con distinto id interno. */
function buscarCursoPorCodigo(codigo, carreraPreferida) {
    const cod = (codigo || '').trim().toUpperCase();

    if (carreraPreferida && CURSOS_POR_CICLO[carreraPreferida]) {
        for (const cursos of Object.values(CURSOS_POR_CICLO[carreraPreferida])) {
            const encontrado = cursos.find(c => c.code.toUpperCase() === cod);
            if (encontrado) return encontrado;
        }
    }
    for (const carrera of Object.values(CURSOS_POR_CICLO)) {
        for (const cursos of Object.values(carrera)) {
            const encontrado = cursos.find(c => c.code.toUpperCase() === cod);
            if (encontrado) return encontrado;
        }
    }
    return null;
}

let importacionIntralu = null; // guarda el payload decodificado + matches, mientras el alumno revisa

/* Patrones de texto para reconocer cada tipo de evaluación dentro de una
   línea de texto pegado — los mismos que usa el bookmarklet, duplicados
   aquí porque el copy-paste corre 100% del lado de Intranotas, sin
   depender de que el bookmarklet se haya usado. */
const PATRONES_COMPONENTE = [
    { comp: 'EP', re: /examen\s+parcial/i },
    { comp: 'EF', re: /examen\s+final/i },
    { comp: 'ES', re: /examen\s+sustitutorio/i },
    { comp: 'PC1', re: /pr[aá]ctica\s*1\b/i },
    { comp: 'PC2', re: /pr[aá]ctica\s*2\b/i },
    { comp: 'PC3', re: /pr[aá]ctica\s*3\b/i },
    { comp: 'PC4', re: /pr[aá]ctica\s*4\b/i },
    { comp: 'PC5', re: /pr[aá]ctica\s*5\b/i },
    { comp: 'PC6', re: /pr[aá]ctica\s*6\b/i },
    { comp: 'Monografia1', re: /monograf[ií]a\s*1\b/i },
    { comp: 'Monografia2', re: /monograf[ií]a\s*2\b/i },
    { comp: 'Lab1', re: /laboratorio\s*1\b/i },
    { comp: 'Lab2', re: /laboratorio\s*2\b/i },
    { comp: 'Lab3', re: /laboratorio\s*3\b/i },
    { comp: 'Lab4', re: /laboratorio\s*4\b/i },
    { comp: 'Lab5', re: /laboratorio\s*5\b/i },
    { comp: 'Lab6', re: /laboratorio\s*6\b/i },
    { comp: 'Lab7', re: /laboratorio\s*7\b/i },
    { comp: 'Lab8', re: /laboratorio\s*8\b/i },
];

/* Recorre línea por línea el texto que el alumno pegó (puede ser una
   sola pantalla-resumen o varios cursos pegados uno tras otro, no
   importa). Cada vez que encuentra una línea con un código de curso
   (ej. 'BMA02'), abre un curso nuevo; las líneas siguientes que calcen
   con un patrón de evaluación se le asignan a ESE curso hasta que
   aparezca el siguiente código. */
function parsearTextoPegado(texto, periodoElegido) {
    const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    const regexCodigo = /\b([A-Z]{2,4}\d{2,3}(?:-[A-Z])?)\b/;
    const cursos = [];
    let actual = null;

    lineas.forEach(linea => {
        const mCodigo = linea.match(regexCodigo);
        const esFilaDeNota = PATRONES_COMPONENTE.some(p => p.re.test(linea));

        if (mCodigo && !esFilaDeNota) {
            actual = {
                codigo: mCodigo[1].split('-')[0].toUpperCase(),
                nombreIntralu: linea,
                periodo: periodoElegido,
                componentes: {},
            };
            cursos.push(actual);
            return;
        }

        if (!actual) return; // aún no vimos ningún curso, ignoramos la línea

        const patron = PATRONES_COMPONENTE.find(p => p.re.test(linea));
        if (!patron) return;
        const numeros = linea.match(/\b(\d{1,2}(?:\.\d+)?)\b/g);
        if (!numeros || !numeros.length) return;
        const nota = numeros[numeros.length - 1];
        if (parseFloat(nota) <= 20) actual.componentes[patron.comp] = nota;
    });

    return cursos.filter(c => Object.keys(c.componentes).length > 0);
}

function poblarSelectorPeriodoPegado() {
    const sel = document.getElementById('selector-periodo-pegado');
    if (!sel) return;
    const periodos = generarPeriodosDisponibles();
    sel.innerHTML = '<option value="" disabled selected>Elige el periodo</option>' +
        periodos.map(p => `<option value="${p}">${p}</option>`).join('');
}

function procesarTextoPegado() {
    const periodoElegido = document.getElementById('selector-periodo-pegado').value;
    if (!periodoElegido) { mostrarToast('⚠️ Primero elige a qué periodo corresponde lo que vas a pegar'); return; }

    const texto = document.getElementById('textarea-pegado-intralu').value;
    if (!texto.trim()) { mostrarToast('⚠️ Pega primero el contenido de INTRALU'); return; }

    const cursosDetectados = parsearTextoPegado(texto, periodoElegido);
    if (!cursosDetectados.length) {
        mostrarToast('⚠️ No se detectó ningún curso con notas en el texto pegado');
        return;
    }

    const carreraActual = carreraSeleccionada;
    importacionIntralu = {
        periodo: periodoElegido,
        cursos: cursosDetectados.map(c => ({
            ...c,
            cursoSiga: buscarCursoPorCodigo(c.codigo, carreraActual),
        })),
    };

    document.getElementById('intralu-instrucciones').style.display = 'none';
    renderVistaPreviaIntralu();
}

function mostrarInstruccionesIntralu() {
    irAPantalla(5);
    document.getElementById('intralu-instrucciones').style.display = 'block';
    document.getElementById('intralu-vista-previa').style.display = 'none';
    poblarSelectorPeriodoPegado();
}

/* Se llama al cargar la página: si la URL trae datos del bookmarklet
   (la pestaña que abrió el bookmarklet), los procesa automáticamente. */
function revisarImportacionEnURL() {
    const hash = window.location.hash;
    if (!hash.startsWith('#data=')) return;

    try {
        const json = decodeURIComponent(escape(atob(hash.slice(6))));
        const payload = JSON.parse(json);
        procesarImportacion(payload);
    } catch (e) {
        console.error('No se pudo leer los datos importados de INTRALU:', e);
        mostrarToast('❌ No se pudieron leer los datos de INTRALU');
    }
}

function procesarImportacion(payload) {
    const carreraActual = carreraSeleccionada; // puede ser null si aún no eligió carrera

    importacionIntralu = {
        periodo: payload.cursos[0]?.periodo || null,
        cursos: payload.cursos.map(c => ({
            ...c,
            cursoSiga: buscarCursoPorCodigo(c.codigo, carreraActual), // null si no hay match
        })),
    };

    irAPantalla(5);
    document.getElementById('intralu-instrucciones').style.display = 'none';
    renderVistaPreviaIntralu();
}

function renderVistaPreviaIntralu() {
    const cont = document.getElementById('intralu-vista-previa');
    cont.style.display = 'block';

    const filas = importacionIntralu.cursos.map((c, idx) => {
        const notasTexto = Object.entries(c.componentes || {})
            .map(([k, v]) => `${k}: ${v}`).join(' · ') || '(sin notas detectadas)';

        if (c.error) {
            return `
                <div style="padding:10px 14px; margin-bottom:8px; background:#fee2e2; border-radius:8px;">
                    <strong>${c.codigo}</strong> — no se pudo leer este curso. Se omitirá.
                </div>`;
        }

        if (!c.cursoSiga) {
            return `
                <div style="padding:10px 14px; margin-bottom:8px; background:#fef3c7; border-radius:8px;">
                    <strong>${c.nombreIntralu}</strong> (${c.codigo}) — no encontrado en tu catálogo.
                    <br><span style="font-size:0.85rem;">${notasTexto}</span>
                    <br><label style="font-size:0.85rem;">Asignar manualmente:
                        <select onchange="asignarCursoManual(${idx}, this.value)">
                            <option value="">-- elegir curso --</option>
                            ${opcionesCatalogoCompleto()}
                        </select>
                    </label>
                </div>`;
        }

        return `
            <div style="padding:10px 14px; margin-bottom:8px; background:#dcfce7; border-radius:8px;">
                ✅ <strong>${c.cursoSiga.name}</strong> (${c.codigo})
                <br><span style="font-size:0.85rem;">${notasTexto}</span>
            </div>`;
    }).join('');

    cont.innerHTML = `
        <p style="font-weight:600; margin-bottom:12px;">Periodo detectado: ${importacionIntralu.periodo}</p>
        ${filas}
        <div style="margin-top:16px; display:flex; gap:12px;">
            <button class="btn-flotante btn-guardar" onclick="confirmarImportacionIntralu()">✅ Confirmar e importar</button>
            <button class="btn-flotante btn-limpiar" onclick="cancelarImportacionIntralu()">Cancelar</button>
        </div>`;
}

function opcionesCatalogoCompleto() {
    const opciones = [];
    Object.values(CURSOS_POR_CICLO).forEach(carrera => {
        Object.values(carrera).forEach(cursos => {
            cursos.forEach(c => opciones.push(`<option value="${c.id}">${c.name} (${c.code})</option>`));
        });
    });
    return opciones.join('');
}

function asignarCursoManual(idx, cursoId) {
    if (!cursoId) return;
    importacionIntralu.cursos[idx].cursoSiga = buscarCursoPorId(cursoId);
    renderVistaPreviaIntralu();
}

function cancelarImportacionIntralu() {
    importacionIntralu = null;
    window.history.replaceState(null, '', window.location.pathname);
    irAPantalla(4);
}

async function confirmarImportacionIntralu() {
    const sesion = await window.sigaObtenerSesion();
    if (!sesion) { mostrarToast('❌ Sesión no válida'); return; }

    const validos = importacionIntralu.cursos.filter(c => c.cursoSiga && !c.error);
    if (!validos.length) { mostrarToast('⚠️ No hay cursos válidos para importar'); return; }

    const filas = validos.map(c => ({
        user_id: sesion.user.id,
        curso_id: c.cursoSiga.id,
        periodo: c.periodo,
        componentes: c.componentes,
        fuente: 'intralu',
        actualizado_en: new Date().toISOString(),
    }));

    const { error } = await window.sigaSupabase
        .from('notas_alumno')
        .upsert(filas, { onConflict: 'user_id,curso_id,periodo' });

    if (error) {
        console.error('Error importando notas de INTRALU:', error);
        mostrarToast('❌ No se pudieron guardar las notas importadas');
        return;
    }

    mostrarToast(`✅ ${validos.length} curso(s) importado(s) correctamente`);
    importacionIntralu = null;
    window.history.replaceState(null, '', window.location.pathname);

    /* Si el periodo importado es el que está activo en pantalla, agrega
       los cursos importados que no estuvieran ya marcados — si no, se
       guardan bien en Supabase pero no se verían hasta recargar. */
    if (carreraSeleccionada && periodoSeleccionado === (validos[0] && validos[0].periodo)) {
        validos.forEach(c => {
            if (!cursosSeleccionados.find(cs => cs.id === c.cursoSiga.id)) {
                cursosSeleccionados.push(c.cursoSiga);
            }
        });
        generarSimulador();
    } else if (carreraSeleccionada) {
        cargarNotasGuardadas();
        cargarSelectorPeriodos();
    }
    irAPantalla(4);
}

document.addEventListener('DOMContentLoaded', revisarImportacionEnURL);