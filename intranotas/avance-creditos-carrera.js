// avance-creditos-carrera.js — Lee del Avance Curricular (el PDF de INTRALU) el plan de estudios y los
// créditos que pide la carrera, y los guarda en el perfil del alumno (perfiles_usuario).
//
// Es un módulo APARTE a propósito. login-multifacultad.js lo carga con import() recién cuando la
// sincronización ya terminó y todo lo demás ya se guardó, sin esperarlo (no bloquea nada), y cualquier
// error se atrapa allí y acá adentro: si este archivo faltara, tuviera un fallo o el PDF cambiara de
// formato, la sincronización y el parser del Avance ni se enteran.
//
// Qué se guarda (columnas de perfiles_usuario, solo las que se encuentren):
//   plan_estudio                      ← "PLAN DE ESTUDIO : 2018-II"
//   creditos_obligatorios_min         ← "N° Mínimo de Créditos Obligatorios"
//   creditos_electivos_min            ← "N° Mínimo de Créditos Electivos"
//   creditos_complementarios_max      ← "N° Máximo de Créditos Complementarios"
//   creditos_otras_actividades_max    ← "N° Máximo de Créditos por otras actividades"
//   creditos_egreso                   ← "N° Total de Créditos para Egresar"

/* Algunos PDF dibujan la tilde como una pieza aparte ("Mi´nimo", "M í nimo"): el texto se limpia de tildes
   y de esas piezas sueltas antes de buscar, y entre las letras de cada etiqueta se aceptan espacios. */
export function limpiarParaEtiquetas(texto) {
    return String(texto || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // tildes pegadas a la letra
        .replace(/[´`¨^~'’]/g, '')                           // tildes dibujadas como pieza suelta
        .replace(/ı/g, 'i')                                  // "i" sin punto
        .replace(/\u00a0/g, ' ')
        .toLowerCase();
}

function etiquetaFlexible(etiqueta) {
    return etiqueta.replace(/\s+/g, '').split('').join('\\s*');
}

export function extraerPlanDeEstudio(textoCrudo) {
    const m = String(textoCrudo || '').match(/PLAN DE ESTUDIO\s*:\s*(\S+)/i);
    return m ? m[1] : null;
}

/* Devuelve { obligatoriosMin, electivosMin, complementariosMax, otrasActividadesMax, egreso } con null en
   lo que no encuentre, o null si no encuentra nada. */
export function extraerCreditosDeLaCarrera(textoCrudo) {
    const texto = limpiarParaEtiquetas(textoCrudo);
    const numeroTrasEtiqueta = (etiqueta) => {
        const m = texto.match(new RegExp(`${etiquetaFlexible(etiqueta)}\\s*[:\\-]?\\s*(\\d{1,3})(?!\\d)`));
        return m ? parseInt(m[1], 10) : null;
    };
    const creditos = {
        obligatoriosMin: numeroTrasEtiqueta('de creditos obligatorios'),
        electivosMin: numeroTrasEtiqueta('de creditos electivos'),
        complementariosMax: numeroTrasEtiqueta('de creditos complementarios'),
        otrasActividadesMax: numeroTrasEtiqueta('de creditos por otras actividades'),
        egreso: numeroTrasEtiqueta('total de creditos para egresar'),
    };
    return Object.values(creditos).some((v) => v !== null) ? creditos : null;
}

/* Anota en el navegador cómo le fue a este guardado (solo la hora y el resultado, nada del alumno), para poder
   revisarlo después aunque la página haya cambiado: en la consola, localStorage.getItem('siga_diag_creditos').
   No se muestra en pantalla. */
function anotarDiagnostico(resultado, detalle = '') {
    try {
        localStorage.setItem('siga_diag_creditos', JSON.stringify({ hora: new Date().toISOString(), ok: !!resultado.ok, motivo: resultado.motivo || 'guardado', detalle: String(detalle).slice(0, 900) }));
    } catch (error) { /* sin almacenamiento: no pasa nada */ }
    return resultado;
}

/* Lee el texto del Avance y guarda lo encontrado en el perfil. NUNCA lanza: siempre devuelve
   { ok, datos?, motivo? } y deja el detalle en la consola. */
export async function guardarCreditosDeLaCarrera(supabase, userId, textoCrudo) {
    try {
        const plan = extraerPlanDeEstudio(textoCrudo);
        const c = extraerCreditosDeLaCarrera(textoCrudo);
        console.log('[INTRANOTAS] Plan y créditos leídos del Avance:', { plan, creditos: c });
        if (!plan && !c) return anotarDiagnostico({ ok: false, motivo: 'no_encontrado' }, 'El texto del Avance no trae plan ni créditos');

        const datos = { user_id: userId };
        if (plan) datos.plan_estudio = plan;
        if (c?.obligatoriosMin != null) datos.creditos_obligatorios_min = c.obligatoriosMin;
        if (c?.electivosMin != null) datos.creditos_electivos_min = c.electivosMin;
        if (c?.complementariosMax != null) datos.creditos_complementarios_max = c.complementariosMax;
        if (c?.otrasActividadesMax != null) datos.creditos_otras_actividades_max = c.otrasActividadesMax;
        if (c?.egreso != null) datos.creditos_egreso = c.egreso;

        // Si faltó algo (p. ej. los electivos), se anota cómo quedó escrito ese tramo del PDF para poder ajustar la
        // lectura sin adivinar. Es solo el cuadro de créditos: no trae nombre ni código del alumno.
        let pista = '';
        if (c && (c.electivosMin == null || c.obligatoriosMin == null)) {
            const limpio = limpiarParaEtiquetas(textoCrudo);
            const i = limpio.search(/e\s*g\s*r\s*e\s*s\s*a\s*r/);
            pista = ' | FALTÓ ALGO. Texto cercano: ' + JSON.stringify(limpio.slice(Math.max(0, i - 420), i + 30));
        }

        const { error } = await supabase.from('perfiles_usuario').upsert(datos, { onConflict: 'user_id' });
        if (error) {
            console.warn('[INTRANOTAS] No se pudieron guardar los créditos del plan (¿faltan las columnas?):', error.message);
            return anotarDiagnostico({ ok: false, motivo: 'guardado_fallo' }, error.message);
        }
        return anotarDiagnostico({ ok: true, datos }, JSON.stringify(datos) + pista);
    } catch (error) {
        console.warn('[INTRANOTAS] Créditos del plan: algo falló y se omitió:', error);
        return anotarDiagnostico({ ok: false, motivo: 'error' }, error && error.message ? error.message : error);
    }
}
