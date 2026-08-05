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

function mostrarInstruccionesIntralu() {
    irAPantalla(5);
    document.getElementById('intralu-instrucciones').style.display = 'block';
    document.getElementById('intralu-vista-previa').style.display = 'none';
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

    if (carreraSeleccionada) {
        cargarNotasGuardadas();
        cargarSelectorPeriodos();
    }
    irAPantalla(4);
}

document.addEventListener('DOMContentLoaded', revisarImportacionEnURL);