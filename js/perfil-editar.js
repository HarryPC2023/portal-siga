// js/perfil-editar.js — Página "Mi perfil": carga y permite editar los
// datos ya guardados en perfiles_usuario en cualquier momento (a diferencia
// de perfil-siga.js, que solo gatea la primera vez).
import { supabase, requerirSesion, montarNavUsuario } from './auth-siga.js?v=4';

const BUCKET_AVATARS = 'avatars';

function generarPeriodosDisponibles(cantidad = 24) {
    const hoy = new Date();
    const MES_CORTE_PERIODO_2 = 7; // agosto
    let anio = hoy.getFullYear();
    let periodo = hoy.getMonth() >= MES_CORTE_PERIODO_2 ? 2 : 1;
    const periodos = [];
    for (let i = 0; i < cantidad; i++) {
        periodos.push(`${anio}-${periodo}`);
        if (periodo === 1) { periodo = 2; anio -= 1; } else { periodo = 1; }
    }
    return periodos;
}

document.addEventListener('DOMContentLoaded', async () => {
    montarNavUsuario();

    const sesion = await requerirSesion('');
    if (!sesion) return; // requerirSesion ya redirige a index.html si no hay cuenta

    const form = document.getElementById('formPerfil');
    const msg = document.getElementById('perfilMsg');
    const selectorPeriodo = document.getElementById('selectorPeriodoPerfil');
    const inputFoto = document.getElementById('inputFoto');
    const btnCamara = document.getElementById('btnCamara');
    const previewFoto = document.getElementById('previewFoto');
    const previewFotoVacia = document.getElementById('previewFotoVacia');

    btnCamara.addEventListener('click', () => inputFoto.click());

    function mostrarFoto(url) {
        if (url) {
            previewFoto.src = url;
            previewFoto.style.display = 'block';
            previewFotoVacia.style.display = 'none';
        } else {
            previewFoto.style.display = 'none';
            previewFotoVacia.style.display = 'flex';
        }
    }

    inputFoto.addEventListener('change', () => {
        const archivo = inputFoto.files[0];
        if (archivo) mostrarFoto(URL.createObjectURL(archivo));
    });

    const periodos = generarPeriodosDisponibles();
    selectorPeriodo.innerHTML = periodos.map((p) => `<option value="${p}">${p}</option>`).join('');

    const { data: perfil, error } = await supabase
        .from('perfiles_usuario')
        .select('nombre, codigo_estudiante, carrera, periodo_actual, foto_url')
        .eq('user_id', sesion.user.id)
        .maybeSingle();

    if (error) {
        console.error('Error cargando perfil:', error);
        msg.textContent = 'No se pudo cargar tu perfil.';
        return;
    }

    if (perfil) {
        form.nombre.value = perfil.nombre ?? '';
        form.codigo_estudiante.value = perfil.codigo_estudiante ?? '';
        if (perfil.carrera) form.carrera.value = perfil.carrera;
        if (perfil.periodo_actual) selectorPeriodo.value = perfil.periodo_actual;
        mostrarFoto(perfil.foto_url);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(form).entries());

        let fotoUrl = perfil?.foto_url ?? null;
        let avisoFoto = null;
        const archivo = inputFoto.files[0];

        if (archivo) {
            const extension = archivo.name.split('.').pop();
            const ruta = `${sesion.user.id}/avatar.${extension}`;

            const { error: errSubida } = await supabase.storage
                .from(BUCKET_AVATARS)
                .upload(ruta, archivo, { upsert: true });

            if (errSubida) {
                console.error('Error subiendo foto:', errSubida);
                avisoFoto = 'No se pudo subir la foto (revisa que el bucket "avatars" exista). Se guardó el resto de tus datos.';
            } else {
                const { data: publica } = supabase.storage.from(BUCKET_AVATARS).getPublicUrl(ruta);
                fotoUrl = `${publica.publicUrl}?t=${Date.now()}`; // cache-busting: misma ruta, foto nueva
            }
        }

        const { error: errUpsert } = await supabase
            .from('perfiles_usuario')
            .upsert({
                user_id: sesion.user.id,
                nombre: datos.nombre.trim(),
                codigo_estudiante: datos.codigo_estudiante.trim().toUpperCase(),
                carrera: datos.carrera,
                periodo_actual: datos.periodo_actual,
                foto_url: fotoUrl,
            });

        if (errUpsert) {
            msg.textContent = errUpsert.message?.includes('duplicate')
                ? 'Ese código de estudiante ya está registrado con otra cuenta.'
                : 'No se pudo guardar. Intenta de nuevo.';
            return;
        }

        msg.textContent = avisoFoto ?? '¡Perfil actualizado!';
    });
});