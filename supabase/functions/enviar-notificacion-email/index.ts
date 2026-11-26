// supabase/functions/enviar-notificacion-email/index.ts
//
// Manda por correo (Brevo) las notificaciones de canal 'web_y_correo'.
//
// Se activa de dos maneras:
//   1) Automática: el trigger "notificar_por_correo" (Database Webhook) la llama
//      cada vez que se inserta una fila en "notificaciones".
//   2) Manual desde Admin: botón "Enviar a los que faltan" → body
//      { accion: 'reenviar', id }. Solo acepta la sesión del admin.
//
// ── CAMBIOS (26/11/2026) ─────────────────────────────────────────
// - Ya NO confía en el contenido de la petición: solo toma el id y vuelve a
//   leer la notificación desde la base de datos (título, mensaje, canal...).
//   Así nadie puede inventar un correo masivo con la clave pública.
// - Registra a quién se le envió cada correo (tabla notificaciones_correos):
//   nunca repite un correo a la misma persona y permite completar "los que
//   faltan" cuando se acaba el cupo.
// - Cupo diario: no pasa de LIMITE_DIARIO correos en 24 h (Brevo gratis = 300).
//   Lo que no alcance queda pendiente para reenviarlo después.
// - Avisos personales: si la notificación trae "destinatario", el correo va solo
//   a esa persona (respetando a quien apagó sus notificaciones).
// - Envía en tandas de 10 en paralelo para no pasarse del tiempo de la función.
// ──────────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!;
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los provee Supabase solo.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const ADMIN_UID = 'f544dbae-fc6f-4fe6-9b86-fc72aef462a1';

// Mismo remitente que ya verificaste en Brevo.
const REMITENTE_EMAIL = 'harrypc2021@gmail.com';
const REMITENTE_NOMBRE = 'SIGA';

// ── MODO DE PRUEBA ──────────────────────────────────────────
// Con "true", el correo SOLO llega a las direcciones de abajo y no se registra.
const MODO_PRUEBA = false;
const CORREOS_DE_PRUEBA = ['openmindseduc@gmail.com', 'harrypc2021@hotmail.com'];

const BASE_SIGA = 'https://harrypc2023.github.io/portal-siga/';
const LINK_SIGA = BASE_SIGA + 'dashboard.html';

// Brevo gratis permite 300 correos/día. Se deja margen por si otros correos
// (ej. los de registro) usan el mismo cupo. Súbelo o bájalo aquí.
const LIMITE_DIARIO = 280;
// Una notificación que llega por el webhook solo se procesa si es reciente;
// las antiguas se completan con el botón de Admin.
const VENTANA_NUEVA_MS = 10 * 60 * 1000;
const TANDA = 10;
// Solo rutas internas de SIGA (ej. perfil.html#sugerencias).
const ENLACE_VALIDO = /^(?![a-z][a-z0-9+.-]*:)(?!\/\/)[\w\-./?=&#%]+$/i;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

type Destinatario = { id: string; email: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const payload = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const esReenvio = payload?.accion === 'reenviar';
    const id = esReenvio ? payload?.id : payload?.record?.id;
    if (id === undefined || id === null || id === '') return json({ error: 'Payload inválido' }, 400);

    // El reenvío manual solo lo puede pedir el admin (sesión de Harry).
    if (esReenvio) {
      const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
      const { data: sesion } = await supabase.auth.getUser(token);
      if (!sesion?.user || sesion.user.id !== ADMIN_UID) return json({ error: 'No autorizado' }, 403);
    }

    // Siempre se lee la notificación desde la base de datos.
    const { data: n, error: errN } = await supabase
      .from('notificaciones')
      .select('id, titulo, mensaje, canal, destinatario, enlace, creado_en')
      .eq('id', id)
      .maybeSingle();
    if (errN) throw errN;
    if (!n) return json({ enviados: 0, motivo: 'La notificación no existe' }, 404);

    // 'solo_web' nunca toca Brevo.
    if (n.canal !== 'web_y_correo') {
      return json({ enviados: 0, motivo: `Notificación con canal '${n.canal}' — no se envía correo` });
    }
    if (!esReenvio && Date.now() - new Date(n.creado_en).getTime() > VENTANA_NUEVA_MS) {
      return json({ enviados: 0, motivo: 'Notificación antigua: usa «Enviar a los que faltan» desde Admin' });
    }

    const notifId = String(n.id);
    const registrar = !MODO_PRUEBA;

    // 1) A quién le tocaría.
    let candidatos: Destinatario[];
    if (MODO_PRUEBA) {
      candidatos = CORREOS_DE_PRUEBA.map((email) => ({ id: email, email }));
    } else if (n.destinatario) {
      const { data, error } = await supabase.auth.admin.getUserById(n.destinatario);
      if (error || !data?.user?.email) return json({ enviados: 0, pendientes: 0, motivo: 'No se encontró el correo del destinatario' });
      candidatos = [{ id: data.user.id, email: data.user.email }];
    } else {
      candidatos = await todosLosUsuarios(supabase);
    }

    // 2) Quitar a quien apagó las notificaciones y a quien ya recibió este correo.
    if (registrar) {
      const [inactivos, yaEnviados] = await Promise.all([
        usuariosSinAvisos(supabase),
        idsYaEnviados(supabase, notifId),
      ]);
      if (n.destinatario) {
        if (inactivos.has(n.destinatario)) return json({ enviados: 0, pendientes: 0, motivo: 'La persona apagó sus notificaciones: no se envía correo' });
        if (yaEnviados.has(n.destinatario)) return json({ enviados: 0, pendientes: 0, motivo: 'A esta persona ya se le envió el correo' });
      }
      candidatos = candidatos.filter((u) => !inactivos.has(u.id) && !yaEnviados.has(u.id));
    }
    if (!candidatos.length) return json({ enviados: 0, pendientes: 0, motivo: 'No falta nadie por recibir este correo' });

    // 3) Cupo diario (ventana móvil de 24 h).
    let cupo = LIMITE_DIARIO;
    if (registrar) {
      const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('notificaciones_correos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'enviado')
        .gte('creado_en', desde);
      if (error) throw error;
      cupo = Math.max(0, LIMITE_DIARIO - (count ?? 0));
    }
    if (cupo === 0) {
      return json({ enviados: 0, pendientes: candidatos.length, cupoRestante: 0, limiteDiario: LIMITE_DIARIO, motivo: 'Cupo diario agotado: reintenta más tarde con «Enviar a los que faltan»' });
    }

    candidatos.sort((a, b) => a.id.localeCompare(b.id));
    const aEnviar = candidatos.slice(0, cupo);

    const asunto = `SIGA: ${n.titulo}`;
    const html = construirHtml(n.titulo, n.mensaje, n.enlace);

    // 4) Envío en tandas; cada tanda se registra apenas termina.
    let enviados = 0;
    let fallidos = 0;
    for (let i = 0; i < aEnviar.length; i += TANDA) {
      const tanda = aEnviar.slice(i, i + TANDA);
      const resultados = await Promise.all(tanda.map((u) => enviarBrevo(u.email, asunto, html)));

      if (registrar) {
        const ahora = new Date().toISOString();
        const filas = tanda.map((u, k) => ({
          notificacion_id: notifId,
          user_id: u.id,
          estado: resultados[k].ok ? 'enviado' : 'error',
          detalle: resultados[k].ok ? null : resultados[k].detalle ?? null,
          creado_en: ahora,
        }));
        const { error } = await supabase.from('notificaciones_correos').upsert(filas, { onConflict: 'notificacion_id,user_id' });
        if (error) console.error('No se pudo registrar la tanda de correos:', error);
      }

      const buenos = resultados.filter((r) => r.ok).length;
      enviados += buenos;
      fallidos += resultados.length - buenos;
      if (buenos === 0) break; // toda la tanda falló (probable límite de Brevo): se detiene
    }

    return json({
      enviados,
      errores: fallidos,
      pendientes: candidatos.length - enviados,
      cupoRestante: Math.max(0, cupo - enviados),
      limiteDiario: LIMITE_DIARIO,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

async function enviarBrevo(email: string, asunto: string, html: string): Promise<{ ok: boolean; detalle?: string }> {
  try {
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
      // Un correo por persona (no todos en el mismo "to"), para que nadie vea los correos de los demás.
      body: JSON.stringify({
        sender: { name: REMITENTE_NOMBRE, email: REMITENTE_EMAIL },
        to: [{ email }],
        subject: asunto,
        htmlContent: html,
      }),
    });
    if (resp.ok) return { ok: true };
    return { ok: false, detalle: `${resp.status}: ${(await resp.text()).slice(0, 250)}` };
  } catch (e) {
    return { ok: false, detalle: String(e).slice(0, 250) };
  }
}

// Todos los usuarios registrados (de 1000 en 1000), con correo.
async function todosLosUsuarios(supabase: SupabaseClient): Promise<Destinatario[]> {
  const POR_PAGINA = 1000;
  const todos: Destinatario[] = [];
  for (let pagina = 1; ; pagina++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: pagina, perPage: POR_PAGINA });
    if (error) throw error;
    const usuarios = data?.users ?? [];
    for (const u of usuarios) if (u.email) todos.push({ id: u.id, email: u.email });
    if (usuarios.length < POR_PAGINA) break;
  }
  return todos;
}

// Quienes DESACTIVARON explícitamente las notificaciones (lo demás cuenta como activado).
async function usuariosSinAvisos(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('preferencias_notificacion')
    .select('user_id')
    .eq('notificaciones_activas', false);
  if (error) throw error;
  return new Set((data ?? []).map((p: { user_id: string }) => p.user_id));
}

// Quienes ya recibieron este correo.
async function idsYaEnviados(supabase: SupabaseClient, notifId: string): Promise<Set<string>> {
  const POR_PAGINA = 1000;
  const ids = new Set<string>();
  for (let desde = 0; ; desde += POR_PAGINA) {
    const { data, error } = await supabase
      .from('notificaciones_correos')
      .select('user_id')
      .eq('notificacion_id', notifId)
      .eq('estado', 'enviado')
      .order('user_id')
      .range(desde, desde + POR_PAGINA - 1);
    if (error) throw error;
    for (const f of data ?? []) ids.add(f.user_id as string);
    if (!data || data.length < POR_PAGINA) break;
  }
  return ids;
}

function construirHtml(titulo: string, mensaje: string, enlace?: string | null): string {
  const destino = enlace && ENLACE_VALIDO.test(enlace) ? BASE_SIGA + enlace : LINK_SIGA;
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background:#FFFDF9;">
    <div style="text-align:center; margin-bottom: 20px;">
      <span style="font-weight:800; font-size:20px; color:#6600CC;">SIGA</span>
    </div>
    <div style="background:#fff; border-radius:16px; padding:24px; box-shadow:0 4px 14px rgba(0,0,0,0.06);">
      <h1 style="font-size:18px; color:#1a1a2e; margin:0 0 12px;">${escaparHtml(titulo)}</h1>
      <p style="font-size:14px; color:#4b5563; line-height:1.6; margin:0 0 24px;">${escaparHtml(mensaje).replace(/\n/g, '<br>')}</p>
      <a href="${escaparHtml(destino)}" style="display:inline-block; background:#6600CC; color:#fff; text-decoration:none; font-weight:600; font-size:14px; padding:12px 24px; border-radius:10px;">
        Entrar a SIGA →
      </a>
    </div>
    <p style="text-align:center; font-size:11px; color:#9ca3af; margin-top:20px;">
      Recibiste este correo porque tienes notificaciones activadas en SIGA.
      Puedes desactivarlas desde Mi Perfil → Preferencias.
    </p>
  </div>`;
}

function escaparHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
