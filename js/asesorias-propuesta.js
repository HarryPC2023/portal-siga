// js/asesorias-propuesta.js — Banner + formulario para que cualquier
// estudiante logueado proponga una asesoría propia. Se guarda en
// asesorias_propuestas con estado 'pendiente'; Harry la revisa y decide
// si la sube a asesorias-datos.js (mismo flujo manual que ya usaba).
import { supabase, obtenerSesion } from './auth-siga.js?v=9';
import { ASESORIAS } from './asesorias-datos.js?v=1';

const cont = document.getElementById('banner-proponer-asesoria');

document.addEventListener('DOMContentLoaded', () => {
    if (!cont) return;
    pintarBanner();
});

function pintarBanner() {
    const cursosUnicos = [...new Set(ASESORIAS.map((a) => a.curso))].sort((a, b) => a.localeCompare(b, 'es'));

    cont.innerHTML = `
        <div id="cajaProponerAsesoria" style="background:#fff; border-radius:12px; padding:16px 18px; text-align:center; max-width:340px; margin:28px auto; box-shadow:0 6px 14px rgba(0,0,0,0.05); transition:max-width 0.2s ease;">
            <p style="font-size:0.85rem; font-weight:700; color:var(--ink); margin-bottom:5px;">¿Tienes una asesoría, guía o resumen que le sirvió a otros?</p>
            <p style="font-family:'Poppins', sans-serif; font-weight:300; font-size:0.75rem; color:var(--ink-soft); margin:0 auto 12px; max-width:300px; line-height:1.45;">
                Compártela en SIGA y ayuda al siguiente ciclo.
            </p>
            <button type="button" class="btn-primary" id="btnAbrirFormAsesoria"
                style="display:inline-flex; align-items:center; gap:6px;">
                <span>Proponer una asesoría</span>
                <span id="flechaFormAsesoria" aria-hidden="true">▾</span>
            </button>

            <form id="formProponerAsesoria" style="display:none; margin-top:20px; flex-direction:column; gap:12px; text-align:left;">
                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:4px;">Título</label>
                    <input type="text" id="fpTitulo" required maxlength="120"
                        placeholder="Ej. Resumen de Álgebra Lineal - Autovalores y autovectores"
                        style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.15); font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                </div>

                <div style="display:flex; gap:10px;">
                    <div style="flex:2;">
                        <label style="display:block; font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:4px;">Curso relacionado</label>
                        <input type="text" id="fpCurso" required list="fpCursoLista" maxlength="80"
                            placeholder="Ej. Álgebra Lineal"
                            style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.15); font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                        <datalist id="fpCursoLista">
                            ${cursosUnicos.map((c) => `<option value="${c}"></option>`).join('')}
                        </datalist>
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:4px;">Ciclo</label>
                        <select id="fpCiclo"
                            style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.15); font-family:inherit; font-size:0.85rem; box-sizing:border-box; background:#fff;">
                            <option value="">—</option>
                            ${Array.from({ length: 10 }, (_, i) => i + 1).map((c) => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:4px;">Tipo de recurso</label>
                    <div style="display:flex; gap:16px; font-size:0.85rem;">
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                            <input type="radio" name="fpTipo" value="pdf" checked> PDF
                        </label>
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                            <input type="radio" name="fpTipo" value="web"> Enlace web
                        </label>
                    </div>
                </div>

                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:4px;">Enlace al recurso</label>
                    <input type="url" id="fpUrl"
                        placeholder="Link de Drive, Notion, YouTube, etc."
                        style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.15); font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                </div>

                <div style="display:flex; align-items:center; gap:10px; margin:-4px 0;">
                    <div style="flex:1; height:1px; background:rgba(0,0,0,0.1);"></div>
                    <span style="font-size:0.72rem; color:var(--ink-soft);">o</span>
                    <div style="flex:1; height:1px; background:rgba(0,0,0,0.1);"></div>
                </div>

                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:4px;">Sube el archivo desde tu computadora</label>
                    <input type="file" id="fpArchivo" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        style="width:100%; font-size:0.8rem;">
                    <p style="font-size:0.7rem; color:var(--ink-soft); margin:4px 0 0;">PDF, Word, PowerPoint o Excel — máx. 20 MB.</p>
                </div>

                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:600; color:var(--ink-soft); margin-bottom:4px;">Descripción breve</label>
                    <textarea id="fpDescripcion" rows="3" maxlength="300"
                        placeholder="¿Qué encontrará quien la abra?"
                        style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.15); font-family:inherit; font-size:0.85rem; box-sizing:border-box; resize:vertical;"></textarea>
                </div>

                <button type="submit" id="btnEnviarAsesoria" class="btn-primary" style="align-self:center; margin-top:4px;">
                    Enviar propuesta
                </button>

                <p style="font-size:0.75rem; color:var(--ink-soft); text-align:center; margin:0;">
                    La revisamos antes de publicarla — no aparece de inmediato en la lista.
                </p>
            </form>

            <div id="mensajeFormAsesoria" style="margin-top:14px; font-size:0.85rem; font-weight:500;"></div>
        </div>
    `;

    document.getElementById('btnAbrirFormAsesoria').addEventListener('click', toggleFormulario);
    document.getElementById('formProponerAsesoria').addEventListener('submit', enviarPropuesta);
}

function toggleFormulario() {
    const form = document.getElementById('formProponerAsesoria');
    const flecha = document.getElementById('flechaFormAsesoria');
    const caja = document.getElementById('cajaProponerAsesoria');
    if (!form) return;

    const abierto = form.style.display !== 'none';
    form.style.display = abierto ? 'none' : 'flex';
    if (flecha) flecha.textContent = abierto ? '▾' : '▴';
    if (caja) caja.style.maxWidth = abierto ? '340px' : '460px';
}

const BUCKET_ASESORIAS = 'asesorias-adjuntos';
const TAMANO_MAXIMO_MB = 20;

/** Sube el archivo a Storage dentro de la carpeta del propio usuario
 * (requisito de la política RLS: (storage.foldername(name))[1] = auth.uid()).
 * El bucket es privado, así que no existe una URL pública fija — se guarda
 * solo la ruta en `url_recurso`, y quien necesite verlo (el autor o el
 * admin) pide una URL firmada temporal en el momento (ver admin.js). */
async function subirArchivo(file, userId) {
    const nombreLimpio = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const ruta = `${userId}/${Date.now()}-${nombreLimpio}`;

    const { error } = await supabase.storage.from(BUCKET_ASESORIAS).upload(ruta, file);
    if (error) throw error;

    return ruta;
}

async function enviarPropuesta(e) {
    e.preventDefault();

    const sesion = await obtenerSesion();
    if (!sesion) {
        mostrarMensaje('⚠️ Tu sesión expiró — vuelve a iniciar sesión e inténtalo de nuevo.', 'error');
        return;
    }

    const urlManual = document.getElementById('fpUrl').value.trim();
    const archivo = document.getElementById('fpArchivo').files[0];

    if (!urlManual && !archivo) {
        mostrarMensaje('⚠️ Pega un enlace o sube un archivo — al menos uno de los dos.', 'error');
        return;
    }
    if (archivo && archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
        mostrarMensaje(`⚠️ El archivo pesa más de ${TAMANO_MAXIMO_MB} MB. Sube algo más liviano o pega un enlace.`, 'error');
        return;
    }

    const btn = document.getElementById('btnEnviarAsesoria');
    btn.disabled = true;

    let urlFinal = urlManual;
    if (archivo) {
        btn.textContent = 'Subiendo archivo…';
        try {
            urlFinal = await subirArchivo(archivo, sesion.user.id);
        } catch (err) {
            console.error('Error al subir archivo:', err);
            btn.disabled = false;
            btn.textContent = 'Enviar propuesta';
            mostrarMensaje('⚠️ No se pudo subir el archivo. Intenta de nuevo.', 'error');
            return;
        }
    }

    const datos = {
        titulo: document.getElementById('fpTitulo').value.trim(),
        curso: document.getElementById('fpCurso').value.trim(),
        ciclo: document.getElementById('fpCiclo').value ? Number(document.getElementById('fpCiclo').value) : null,
        tipo_recurso: document.querySelector('input[name="fpTipo"]:checked').value,
        url_recurso: urlFinal,
        descripcion: document.getElementById('fpDescripcion').value.trim() || null,
        autor_id: sesion.user.id,
        autor_email: sesion.user.email,
    };

    if (!datos.titulo || !datos.curso || !datos.url_recurso) {
        btn.disabled = false;
        btn.textContent = 'Enviar propuesta';
        mostrarMensaje('⚠️ Completa al menos el título y el curso.', 'error');
        return;
    }

    btn.textContent = 'Enviando…';

    const { error } = await supabase.from('asesorias_propuestas').insert(datos);

    btn.disabled = false;
    btn.textContent = 'Enviar propuesta';

    if (error) {
        console.error('Error al proponer asesoría:', error);
        mostrarMensaje('⚠️ No se pudo enviar. Intenta de nuevo en un momento.', 'error');
        return;
    }


    document.getElementById('formProponerAsesoria').reset();
    toggleFormulario();
    mostrarMensaje('✅ ¡Gracias! Tu asesoría quedó enviada para revisión.', 'ok');
}

function mostrarMensaje(texto, tipo) {
    const el = document.getElementById('mensajeFormAsesoria');
    if (!el) return;
    el.textContent = texto;
    el.style.color = tipo === 'ok' ? '#16a34a' : '#dc2626';
}