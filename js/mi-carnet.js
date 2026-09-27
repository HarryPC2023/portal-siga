// js/mi-carnet.js
// ------------------------------------------------------------
// Pestaña "Información General" de Mi cuenta (perfil.html),
// rediseñada como CARNET SIGA + TARJETAS editables.
//
// - Arriba: el carnet vivo (se repinta con cada cambio).
// - Abajo: una tarjeta por dato. Las piezas que faltan van punteadas
//   con su pregunta; las completas se editan tocándolas.
// - Periodo de ingreso (semestre) y modalidad de ingreso son datos
//   OPCIONALES y editables, con sugerencia según el código. No son
//   piezas del carnet: no generan preguntas en el dashboard ni tocan
//   ultima_pieza_at. Sirven además para validar qué significa el
//   5.º dígito del código en cada modalidad.
//   (periodo_ingreso_declarado es aparte de periodo_ingreso, que usa
//   Intranotas para saber desde qué periodo sincronizar.)
// - La foto es opcional y no cuenta para completar el carnet.
// ------------------------------------------------------------

import { supabase, resolverUrlFoto } from './auth-siga.js?v=9';
import {
    PIEZAS, buscarCarrera, buscarModalidad, periodoMostrado, piezasFaltantes,
    sugerirModalidad, sugerirSemestre, pintarCarnet, crearTarjetaPregunta,
    crearTarjetaEdicion, crearChipsSemestre, crearSelectorModalidad,
    guardarPieza, guardarDato,
} from './carnet-siga.js';

const BUCKET_AVATARS = 'avatars';
const MAX_FOTO_MB = 3;

const ETIQUETAS = { codigo: 'Código UNI', nombre: 'Cómo te llamamos', carrera: 'Carrera' };
const PREGUNTAS = {
    codigo: '¿Cuál es tu código UNI?',
    nombre: '¿Cómo prefieres que te llamemos?',
    carrera: '¿Qué carrera estudias?',
};
const COLUMNA = { codigo: 'codigo_estudiante', nombre: 'nombre', carrera: 'carrera' };

function el(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
}

const ICONO_BRILLO = '<svg class="pieza-brillo" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z"/></svg>';
const ICONO_LAPIZ = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';

export async function montarMiCarnet(sesion) {
    const raiz = document.getElementById('miCarnet');
    if (!raiz) return;

    const lugarCarnet = document.getElementById('carnetMiCuenta');
    const titulo = document.getElementById('carnetEstadoTitulo');
    const texto = document.getElementById('carnetEstadoTexto');
    const barras = [...document.querySelectorAll('#carnetPiezas i')];
    const rejilla = document.getElementById('carnetTarjetas');
    const inputFoto = document.getElementById('inputFoto');

    const userId = sesion.user.id;
    const fotoGoogle = sesion.user.user_metadata?.avatar_url || sesion.user.user_metadata?.picture || null;

    const { data, error } = await supabase
        .from('perfiles_usuario')
        .select('nombre, codigo_estudiante, carrera, facultad, periodo_ingreso_declarado, modalidad_ingreso, foto_url')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error cargando perfil:', error);
        texto.textContent = 'No se pudo cargar tu carnet. Recarga la página.';
        return;
    }

    const perfil = data || {};
    let fotoUrl = (await resolverUrlFoto(perfil.foto_url)) || fotoGoogle;
    let editando = null;
    let avisoFoto = '';

    /* ---------- Pintado ---------- */

    function render(latido = false) {
        const carnet = pintarCarnet(lugarCarnet, perfil, { fotoUrl });
        if (latido) carnet.classList.add('carnet-latido');

        const faltan = piezasFaltantes(perfil).length;
        const hechas = PIEZAS.length - faltan;
        barras.forEach((b, i) => b.classList.toggle('on', i < hechas));
        if (faltan === 0) {
            titulo.textContent = 'Tu carnet está completo';
            texto.textContent = 'Toca cualquier dato para editarlo cuando quieras.';
        } else if (hechas === 0) {
            titulo.textContent = 'Tu carnet te espera';
            texto.textContent = 'Toca una tarjeta punteada para completarla. Sin apuro: puedes volver cuando quieras.';
        } else {
            titulo.textContent = 'Tu carnet va tomando forma';
            texto.textContent = `Te ${faltan === 1 ? 'falta 1 pieza' : `faltan ${faltan} piezas`}. Toca una tarjeta punteada para completarla.`;
        }

        rejilla.replaceChildren(
            ...PIEZAS.map(tarjetaPieza),
            tarjetaPeriodo(),
            tarjetaModalidad(),
            tarjetaFoto(),
        );
    }

    function tarjetaPieza(pieza) {
        if (editando === pieza) {
            return crearTarjetaPregunta(pieza, {
                valorActual: perfil[COLUMNA[pieza]],
                textoCancelar: 'Cancelar',
                guardar: (p, v) => guardarPieza(userId, p, v),
                alGuardar: (cambios) => {
                    Object.assign(perfil, cambios);
                    editando = null;
                    render(true);
                },
                alCancelar: () => { editando = null; render(); },
            });
        }

        const valor = perfil[COLUMNA[pieza]];
        const tarjeta = el('div', 'tarjeta-pieza clicable');
        tarjeta.tabIndex = 0;
        tarjeta.setAttribute('role', 'button');

        const etiqueta = el('div', 'tarjeta-pieza-etiqueta', ETIQUETAS[pieza]);
        if (!valor) {
            tarjeta.classList.add('falta');
            etiqueta.insertAdjacentHTML('beforeend', ICONO_BRILLO);
            tarjeta.append(etiqueta,
                el('div', 'tarjeta-pieza-pregunta', PREGUNTAS[pieza]),
                el('div', 'tarjeta-pieza-nota', 'Toca para responder'));
            tarjeta.setAttribute('aria-label', `${PREGUNTAS[pieza]} Toca para responder`);
        } else {
            etiqueta.insertAdjacentHTML('beforeend', ICONO_LAPIZ);
            let mostrado = valor;
            let nota = '';
            if (pieza === 'carrera') {
                const info = buscarCarrera(valor);
                mostrado = info ? info.carrera.nombre : valor;
                nota = info ? info.facultad.nombre : '';
            }
            tarjeta.append(etiqueta, el('div', `tarjeta-pieza-valor${pieza === 'codigo' ? ' es-codigo' : ''}`, mostrado));
            if (nota) tarjeta.append(el('div', 'tarjeta-pieza-nota', nota));
            tarjeta.setAttribute('aria-label', `${ETIQUETAS[pieza]}: ${mostrado}. Toca para editar`);
        }

        const abrir = () => { editando = pieza; render(); };
        tarjeta.addEventListener('click', abrir);
        tarjeta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
        });
        return tarjeta;
    }

    /* Tarjeta de dato opcional: muestra el valor o una invitación suave,
       y al tocarla se convierte en su editor. */
    function tarjetaOpcional({ clave, etiqueta, valor, nota, pregunta, bloqueada, notaBloqueada, crearEditor }) {
        if (editando === clave && !bloqueada) return crearEditor();

        const t = el('div', 'tarjeta-pieza');
        const cab = el('div', 'tarjeta-pieza-etiqueta', etiqueta);
        cab.append(el('span', 'tarjeta-pieza-opcional', 'Opcional'));
        t.append(cab);

        if (bloqueada) {
            t.classList.add('solo-lectura');
            t.append(el('div', 'tarjeta-pieza-valor', '—'), el('div', 'tarjeta-pieza-nota', notaBloqueada));
            return t;
        }

        t.classList.add('clicable');
        t.tabIndex = 0;
        t.setAttribute('role', 'button');
        if (valor) {
            cab.lastChild.replaceWith(el('span', 'tarjeta-pieza-opcional', ''));
            cab.lastChild.insertAdjacentHTML('beforeend', ICONO_LAPIZ);
            t.append(el('div', 'tarjeta-pieza-valor', valor));
            if (nota) t.append(el('div', 'tarjeta-pieza-nota', nota));
            t.setAttribute('aria-label', `${etiqueta}: ${valor}. Toca para editar`);
        } else {
            t.append(el('div', 'tarjeta-pieza-pregunta', pregunta), el('div', 'tarjeta-pieza-nota', 'Toca para responder'));
            t.setAttribute('aria-label', `${pregunta} Toca para responder`);
        }
        const abrir = () => { editando = clave; render(); };
        t.addEventListener('click', abrir);
        t.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
        });
        return t;
    }

    function alGuardarOpcional(cambios) {
        Object.assign(perfil, cambios);
        editando = null;
        render(true);
    }

    function tarjetaPeriodo() {
        const codigo = perfil.codigo_estudiante;
        const mostrado = periodoMostrado(perfil);
        const declarado = mostrado && mostrado === perfil.periodo_ingreso_declarado;
        const conSemestre = mostrado && mostrado.includes('-');
        return tarjetaOpcional({
            clave: 'periodo',
            etiqueta: 'Periodo de ingreso',
            valor: conSemestre ? mostrado : null,
            nota: declarado ? 'Confirmado por ti' : 'Sugerido por tu código · toca para confirmar',
            pregunta: codigo ? `¿Ingresaste en febrero o agosto de ${codigo.slice(0, 4)}?` : '',
            bloqueada: !codigo,
            notaBloqueada: 'Aparece cuando pongas tu código',
            crearEditor: () => {
                const control = crearChipsSemestre(codigo, perfil.periodo_ingreso_declarado || mostrado);
                return crearTarjetaEdicion({
                    etiqueta: 'Periodo de ingreso',
                    pregunta: '¿En qué semestre ingresaste?',
                    control,
                    nota: sugerirSemestre(codigo) ? 'Marcamos el que sugiere tu código.' : 'Tu código no nos dice el semestre: ¡cuéntanos!',
                    textoCancelar: 'Cancelar',
                    guardar: (valor) => (valor
                        ? guardarDato(userId, 'periodo_ingreso_declarado', valor)
                        : Promise.resolve({ ok: false, mensaje: 'Elige un semestre.' })),
                    alGuardar: alGuardarOpcional,
                    alCancelar: () => { editando = null; render(); },
                });
            },
        });
    }

    function tarjetaModalidad() {
        const codigo = perfil.codigo_estudiante;
        const guardada = buscarModalidad(perfil.modalidad_ingreso);
        const sugerida = buscarModalidad(sugerirModalidad(codigo));
        return tarjetaOpcional({
            clave: 'modalidad',
            etiqueta: 'Modalidad de ingreso',
            valor: guardada ? guardada.nombre : null,
            nota: 'Nunca se muestra en tu carnet',
            pregunta: sugerida ? `¿Ingresaste por ${sugerida.nombre}?` : '¿Por qué modalidad ingresaste?',
            crearEditor: () => crearTarjetaEdicion({
                etiqueta: 'Modalidad de ingreso',
                pregunta: '¿Por qué modalidad ingresaste?',
                control: crearSelectorModalidad(perfil.modalidad_ingreso || null, codigo),
                nota: 'Solo tú la ves. Nos ayuda a entender cómo se arma el código UNI.',
                textoCancelar: 'Cancelar',
                guardar: (valor) => (valor
                    ? guardarDato(userId, 'modalidad_ingreso', valor)
                    : Promise.resolve({ ok: false, mensaje: 'Elige una modalidad.' })),
                alGuardar: alGuardarOpcional,
                alCancelar: () => { editando = null; render(); },
            }),
        });
    }

    function tarjetaFoto() {
        const t = el('div', 'tarjeta-pieza solo-lectura');
        const etiqueta = el('div', 'tarjeta-pieza-etiqueta', 'Foto');
        etiqueta.append(el('span', 'tarjeta-pieza-opcional', 'Opcional'));
        const boton = el('button', 'tarjeta-pieza-btn principal', fotoUrl ? 'Cambiar foto' : 'Subir foto');
        boton.type = 'button';
        boton.addEventListener('click', () => inputFoto.click());
        const acciones = el('div', 'tarjeta-pieza-acciones');
        acciones.append(boton);
        t.append(etiqueta,
            el('div', 'tarjeta-pieza-nota', avisoFoto || (fotoUrl ? 'Así sale en tu carnet' : 'Sin foto, tu carnet muestra tus iniciales')),
            acciones);
        return t;
    }

    /* ---------- Foto ---------- */

    inputFoto.addEventListener('change', async () => {
        const archivo = inputFoto.files[0];
        inputFoto.value = '';
        if (!archivo) return;

        if (!archivo.type.startsWith('image/')) {
            avisoFoto = 'Ese archivo no es una imagen.';
            render();
            return;
        }
        if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
            avisoFoto = `La foto pesa más de ${MAX_FOTO_MB} MB. Prueba con una más liviana.`;
            render();
            return;
        }

        avisoFoto = 'Subiendo foto…';
        render();

        const extension = (archivo.name.split('.').pop() || 'png').toLowerCase();
        const ruta = `${userId}/avatar.${extension}`;
        const { error: errSubida } = await supabase.storage
            .from(BUCKET_AVATARS)
            .upload(ruta, archivo, { upsert: true });

        if (errSubida) {
            console.error('Error subiendo foto:', errSubida);
            avisoFoto = 'No se pudo subir la foto. Intenta de nuevo.';
            render();
            return;
        }

        // El bucket es privado: se guarda la RUTA; al mostrarla se firma
        // una URL temporal con resolverUrlFoto().
        const { error: errPerfil } = await supabase
            .from('perfiles_usuario')
            .upsert({ user_id: userId, foto_url: ruta }, { onConflict: 'user_id' });

        if (errPerfil) {
            console.error('Error guardando foto en el perfil:', errPerfil);
            avisoFoto = 'La foto subió, pero no se pudo guardar en tu perfil.';
            render();
            return;
        }

        perfil.foto_url = ruta;
        fotoUrl = URL.createObjectURL(archivo); // vista inmediata, sin esperar la URL firmada
        avisoFoto = '¡Foto actualizada!';
        render(true);
    });

    render();
}