// js/admin.js — Panel privado de administración.
// Muestra sugerencias y propuestas de asesorías completas (no solo
// las del usuario actual). La seguridad real vive en las políticas
// RLS de Supabase (solo el UID de Harry puede leer todo) — esta
// verificación del lado del cliente es solo para no dejar la
// pantalla mostrando "Cargando..." eternamente a alguien más y
// redirigirlo de vuelta con claridad.
import { supabase, requerirSesion } from './auth-siga.js?v=9';

const ADMIN_UID = 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1';

document.addEventListener('DOMContentLoaded', async () => {
    const sesion = await requerirSesion('');
    if (!sesion) return;

    if (sesion.user.id !== ADMIN_UID) {
        window.location.href = 'dashboard.html';
        return;
    }

    document.getElementById('estadoAcceso').style.display = 'none';
    document.getElementById('contenidoAdmin').style.display = 'block';

    cargarSugerencias();
    cargarAsesorias();

    document.querySelectorAll('.admin-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach((b) => b.classList.remove('activo'));
            btn.classList.add('activo');
            const tab = btn.dataset.tab;
            document.getElementById('panelSugerencias').style.display = tab === 'sugerencias' ? 'flex' : 'none';
            document.getElementById('panelAsesorias').style.display = tab === 'asesorias' ? 'flex' : 'none';
        });
    });
});

function formatearFecha(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-PE', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

// Evita que un título/descripción con < o > rompa el HTML de la lista.
function escapeHtml(valor) {
    const div = document.createElement('div');
    div.textContent = valor ?? '';
    return div.innerHTML;
}

async function cargarSugerencias() {
    const cont = document.getElementById('listaSugerencias');
    const { data, error } = await supabase
        .from('sugerencias')
        .select('id, user_id, categoria, titulo, descripcion, estado, creado_en')
        .order('creado_en', { ascending: false });

    if (error) {
        cont.innerHTML = `<p class="admin-vacio">No se pudo cargar: ${escapeHtml(error.message)}</p>`;
        return;
    }
    if (!data.length) {
        cont.innerHTML = '<p class="admin-vacio">No hay sugerencias todavía.</p>';
        return;
    }

    cont.innerHTML = data.map((s) => `
        <div class="admin-item">
            <div class="admin-item-cabecera">
                <span class="admin-item-titulo">${escapeHtml(s.titulo)}</span>
                <span class="admin-badge admin-badge-${escapeHtml(s.estado)}">${escapeHtml(s.estado)}</span>
            </div>
            <p class="admin-item-meta">${escapeHtml(s.categoria)} · ${formatearFecha(s.creado_en)} · usuario ${escapeHtml((s.user_id || '').slice(0, 8))}…</p>
            <p class="admin-item-texto">${escapeHtml(s.descripcion)}</p>
        </div>
    `).join('');
}

async function cargarAsesorias() {
    const cont = document.getElementById('listaAsesorias');
    const { data, error } = await supabase
        .from('asesorias_propuestas')
        .select('id, titulo, curso, ciclo, tipo_recurso, url_recurso, descripcion, autor_email, estado, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        cont.innerHTML = `<p class="admin-vacio">No se pudo cargar: ${escapeHtml(error.message)}</p>`;
        return;
    }
    if (!data.length) {
        cont.innerHTML = '<p class="admin-vacio">No hay propuestas todavía.</p>';
        return;
    }

    cont.innerHTML = data.map((a) => `
        <div class="admin-item">
            <div class="admin-item-cabecera">
                <span class="admin-item-titulo">${escapeHtml(a.titulo)}</span>
                <span class="admin-badge admin-badge-${escapeHtml(a.estado)}">${escapeHtml(a.estado)}</span>
            </div>
            <p class="admin-item-meta">${escapeHtml(a.curso)} · Ciclo ${escapeHtml(String(a.ciclo ?? ''))} · ${escapeHtml(a.tipo_recurso)} · ${formatearFecha(a.created_at)}</p>
            <p class="admin-item-meta">Enviado por: ${escapeHtml(a.autor_email)}</p>
            ${a.descripcion ? `<p class="admin-item-texto">${escapeHtml(a.descripcion)}</p>` : ''}
            ${a.url_recurso ? `<a href="${escapeHtml(a.url_recurso)}" target="_blank" rel="noopener" class="modulo-accion">Ver archivo →</a>` : ''}
        </div>
    `).join('');
}
