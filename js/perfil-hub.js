// js/perfil-hub.js — Página "Mi cuenta": Información General, Cuenta,
// Preferencias, Preguntas Frecuentes y Sugerencias, todo en una sola
// página con pestañas (reemplaza a perfil.html + configuracion.html).
import { supabase, requerirSesion, montarNavUsuario, establecerNuevaContrasena } from './auth-siga.js?v=8';

const BUCKET_AVATARS = 'avatars';
const TABS_VALIDAS = ['info', 'cuenta', 'preferencias', 'faq', 'sugerencias'];

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

const CARRERA_LABELS = {
    sistemas: 'Ingeniería de Sistemas',
    industrial: 'Ingeniería Industrial',
    software: 'Ingeniería de Software',
    ia: 'Ingeniería de Inteligencia Artificial',
};

document.addEventListener('DOMContentLoaded', async () => {
    montarNavUsuario();

    const sesion = await requerirSesion('');
    if (!sesion) return;

    // ================= PESTAÑAS (con hash en la URL) =================
    const nav = document.getElementById('perfilHubNav');
    const botones = [...nav.querySelectorAll('.perfil-hub-tab')];
    const paneles = [...document.querySelectorAll('.perfil-panel')];

    function activarTab(nombre) {
        if (!TABS_VALIDAS.includes(nombre)) nombre = 'info';

        botones.forEach((b) => b.classList.toggle('activo', b.dataset.tab === nombre));
        paneles.forEach((p) => { p.hidden = p.dataset.panel !== nombre; });

        if (window.location.hash !== `#${nombre}`) {
            history.replaceState(null, '', `#${nombre}`);
        }
    }

    botones.forEach((b) => {
        b.addEventListener('click', () => activarTab(b.dataset.tab));
    });

    window.addEventListener('hashchange', () => {
        activarTab(window.location.hash.replace('#', ''));
    });

    activarTab(window.location.hash.replace('#', ''));

    // ================= INFORMACIÓN GENERAL =================
    const form = document.getElementById('formPerfil');
    const msg = document.getElementById('perfilMsg');
    const inputFoto = document.getElementById('inputFoto');
    const btnCamara = document.getElementById('btnCamara');
    const previewFoto = document.getElementById('previewFoto');
    const previewFotoVacia = document.getElementById('previewFotoVacia');

    btnCamara.addEventListener('click', () => inputFoto.click());

    const selectCarrera = inicializarSelectPersonalizado({
        triggerId: 'carreraTrigger', textoId: 'carreraTriggerTexto',
        listaId: 'carreraLista', valorId: 'carreraValor',
    });

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
    const selectPeriodo = inicializarSelectPersonalizado({
        triggerId: 'periodoTrigger', textoId: 'periodoTriggerTexto',
        listaId: 'periodoLista', valorId: 'periodoValor',
        opciones: periodos.map((p) => ({ value: p, label: p })),
    });
    selectPeriodo.establecer(periodos[0], periodos[0]);

    const { data: perfil, error: errPerfil } = await supabase
        .from('perfiles_usuario')
        .select('nombre, codigo_estudiante, carrera, periodo_actual, foto_url')
        .eq('user_id', sesion.user.id)
        .maybeSingle();

    if (errPerfil) {
        console.error('Error cargando perfil:', errPerfil);
        msg.textContent = 'No se pudo cargar tu perfil.';
    }

    const fotoGoogleSugerida = sesion.user.user_metadata?.avatar_url
        || sesion.user.user_metadata?.picture
        || null;

    if (perfil) {
        form.nombre.value = perfil.nombre ?? '';
        form.codigo_estudiante.value = perfil.codigo_estudiante ?? '';
        if (perfil.carrera) selectCarrera.establecer(perfil.carrera, CARRERA_LABELS[perfil.carrera] || perfil.carrera);
        if (perfil.periodo_actual) selectPeriodo.establecer(perfil.periodo_actual, perfil.periodo_actual);
        mostrarFoto(perfil.foto_url || fotoGoogleSugerida);
    } else if (fotoGoogleSugerida) {
        mostrarFoto(fotoGoogleSugerida);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectCarrera.valor.value) {
            msg.textContent = 'Elige tu carrera antes de guardar.';
            return;
        }

        const datos = Object.fromEntries(new FormData(form).entries());

        let fotoUrl = perfil?.foto_url || fotoGoogleSugerida || null;
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
                fotoUrl = `${publica.publicUrl}?t=${Date.now()}`;
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

    // ================= CUENTA: CAMBIAR CONTRASEÑA =================
    const formPass = document.getElementById('formCambiarContrasena');
    const msgPass = document.getElementById('configMsg');

    document.querySelectorAll('.btn-ojo').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const mostrar = input.type === 'password';
            input.type = mostrar ? 'text' : 'password';
            btn.textContent = mostrar ? '🙈' : '👁';
        });
    });

    formPass.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(formPass).entries());

        if (datos.nueva !== datos.confirmar) {
            msgPass.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        const { ok, error } = await establecerNuevaContrasena(datos.nueva);
        if (!ok) {
            console.error('Error al cambiar contraseña:', error);
            msgPass.textContent = 'No se pudo actualizar. Intenta de nuevo.';
            return;
        }

        msgPass.textContent = '¡Contraseña actualizada!';
        formPass.reset();
    });

    // ================= CUENTA: ELIMINAR CUENTA =================
    const modalEliminar = document.getElementById('modalEliminar');
    const btnAbrirEliminar = document.getElementById('btnAbrirEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    const inputConfirmarEliminar = document.getElementById('inputConfirmarEliminar');
    const eliminarMsg = document.getElementById('eliminarMsg');

    function cerrarModalEliminar() {
        modalEliminar.classList.remove('visible');
        inputConfirmarEliminar.value = '';
        btnConfirmarEliminar.disabled = true;
        eliminarMsg.textContent = '';
    }

    btnAbrirEliminar.addEventListener('click', () => modalEliminar.classList.add('visible'));
    btnCancelarEliminar.addEventListener('click', cerrarModalEliminar);

    inputConfirmarEliminar.addEventListener('input', () => {
        btnConfirmarEliminar.disabled = inputConfirmarEliminar.value.trim() !== 'ELIMINAR';
    });

    btnConfirmarEliminar.addEventListener('click', async () => {
        btnConfirmarEliminar.disabled = true;
        eliminarMsg.textContent = 'Eliminando tu cuenta…';

        const { data: { session } } = await supabase.auth.getSession();
        const { data, error } = await supabase.functions.invoke('eliminar-cuenta', {
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (error || data?.error) {
            console.error('Error eliminando cuenta:', error || data.error);
            eliminarMsg.textContent = 'No se pudo eliminar la cuenta. Intenta de nuevo.';
            btnConfirmarEliminar.disabled = false;
            return;
        }

        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    // ================= PREFERENCIAS =================
    const prefActivas = document.getElementById('prefActivas');
    const prefMateriales = document.getElementById('prefMateriales');
    const prefRecordatorios = document.getElementById('prefRecordatorios');
    const prefActualizaciones = document.getElementById('prefActualizaciones');
    const prefMsg = document.getElementById('prefMsg');

    const { data: preferencias, error: errPref } = await supabase
        .from('preferencias_notificacion')
        .select('notificaciones_activas, avisos_materiales, recordatorios, actualizaciones_modulos')
        .eq('user_id', sesion.user.id)
        .maybeSingle();

    if (errPref) console.error('Error cargando preferencias:', errPref);

    if (preferencias) {
        prefActivas.checked = preferencias.notificaciones_activas;
        prefMateriales.checked = preferencias.avisos_materiales;
        prefRecordatorios.checked = preferencias.recordatorios;
        prefActualizaciones.checked = preferencias.actualizaciones_modulos;
    }

    function aplicarInterruptorGeneral() {
        const activo = prefActivas.checked;
        [prefMateriales, prefRecordatorios, prefActualizaciones].forEach((el) => { el.disabled = !activo; });
    }
    aplicarInterruptorGeneral();

    let guardandoPref = false;
    async function guardarPreferencias() {
        if (guardandoPref) return;
        guardandoPref = true;
        prefMsg.textContent = 'Guardando…';

        const { error } = await supabase
            .from('preferencias_notificacion')
            .upsert({
                user_id: sesion.user.id,
                notificaciones_activas: prefActivas.checked,
                avisos_materiales: prefMateriales.checked,
                recordatorios: prefRecordatorios.checked,
                actualizaciones_modulos: prefActualizaciones.checked,
                actualizado_en: new Date().toISOString(),
            });

        guardandoPref = false;
        prefMsg.textContent = error ? 'No se pudo guardar. Intenta de nuevo.' : 'Preferencias guardadas ✓';
    }

    [prefActivas, prefMateriales, prefRecordatorios, prefActualizaciones].forEach((el) => {
        el.addEventListener('change', () => {
            if (el === prefActivas) aplicarInterruptorGeneral();
            guardarPreferencias();
        });
    });

    // ================= PREGUNTAS FRECUENTES (acordeón) =================
    document.querySelectorAll('.perfil-faq-item').forEach((item) => {
        item.querySelector('.perfil-faq-pregunta').addEventListener('click', () => {
            const yaAbierto = item.classList.contains('abierto');
            document.querySelectorAll('.perfil-faq-item.abierto').forEach((otro) => otro.classList.remove('abierto'));
            if (!yaAbierto) item.classList.add('abierto');
        });
    });

    // ================= SUGERENCIAS =================
    const formSugerencia = document.getElementById('formSugerencia');
    const sugerenciaMsg = document.getElementById('sugerenciaMsg');
    const TEXTO_PLACEHOLDER_CATEGORIA = 'Selecciona una categoría';

    // --- desplegable personalizado de Categoría ---
    const selectCategoria = inicializarSelectPersonalizado({
        triggerId: 'categoriaTrigger', textoId: 'categoriaTriggerTexto',
        listaId: 'categoriaLista', valorId: 'categoriaValor',
    });

    // --- contador de caracteres ---
    const descripcionSugerencia = document.getElementById('descripcionSugerencia');
    const contadorDescripcion = document.getElementById('contadorDescripcion');

    descripcionSugerencia.addEventListener('input', () => {
        contadorDescripcion.textContent = `${descripcionSugerencia.value.length}/500`;
    });

    formSugerencia.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectCategoria.valor.value) {
            sugerenciaMsg.textContent = 'Elige una categoría antes de enviar.';
            return;
        }

        const datos = Object.fromEntries(new FormData(formSugerencia).entries());

        const { error } = await supabase
            .from('sugerencias')
            .insert({
                user_id: sesion.user.id,
                categoria: datos.categoria,
                titulo: datos.titulo.trim(),
                descripcion: datos.descripcion?.trim() || null,
            });

        if (error) {
            console.error('Error enviando sugerencia:', error);
            sugerenciaMsg.textContent = 'No se pudo enviar. Intenta de nuevo.';
            return;
        }

        sugerenciaMsg.textContent = '¡Gracias por tu idea! La revisaremos pronto.';
        formSugerencia.reset();
        selectCategoria.establecer('', TEXTO_PLACEHOLDER_CATEGORIA);
        contadorDescripcion.textContent = '0/500';
    });
});