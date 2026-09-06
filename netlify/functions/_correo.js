// ========================================
// ENVÍO DE AVISOS POR CORREO
// ========================================
//
// Módulo compartido, no una función en sí: el guion bajo del nombre evita
// que Netlify lo publique como endpoint. Lo usan guardar-menu.js y
// avisar-acceso.js.
//
// Envía con Resend. En su plan gratuito, sin dominio propio, solo se puede
// enviar DESDE onboarding@resend.dev y HACIA el correo con el que se creó
// la cuenta. Para avisos personales es suficiente.
//
// Variables de entorno necesarias (en el panel de Netlify):
//   RESEND_API_KEY   la clave de Resend
//   CORREO_AVISOS    a dónde llegan los avisos
//
// Si falta cualquiera de las dos, no se envía nada y se sigue adelante sin
// error: un aviso que no sale nunca debe tumbar la operación que lo produjo.

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";

// Tiempo mínimo entre avisos del mismo tipo. Sin esto, alguien golpeando el
// sitio en bucle llenaría el buzón de cientos de correos iguales.
const ESPERA_MINUTOS = 15;

// Comprueba en Firebase cuándo se envió el último aviso de este tipo.
// Devuelve true si toca enviar. Ante cualquier fallo devuelve true: es
// preferible un correo de más que perder un aviso real.
async function tocaAvisar(tipo, secreto) {
  if (!secreto) return true;

  const url = `${DB_URL}/avisos/${tipo}.json?auth=${encodeURIComponent(secreto)}`;

  try {
    const r = await fetch(url);
    if (r.ok) {
      const ultimo = await r.json();
      if (ultimo && ultimo.cuando) {
        const minutos = (Date.now() - new Date(ultimo.cuando).getTime()) / 60000;
        if (minutos < ESPERA_MINUTOS) return false;
      }
    }

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cuando: new Date().toISOString() })
    });
  } catch (e) {
    console.error("No se pudo comprobar el último aviso:", e.message);
  }

  return true;
}

async function enviarAviso(asunto, cuerpoHtml, tipo, secreto) {
  const clave = process.env.RESEND_API_KEY;
  const destino = process.env.CORREO_AVISOS;

  if (!clave || !destino) {
    console.log("Avisos por correo desactivados: falta RESEND_API_KEY o CORREO_AVISOS");
    return false;
  }

  if (tipo && !(await tocaAvisar(tipo, secreto))) {
    console.log(`Aviso "${tipo}" omitido: se envió hace menos de ${ESPERA_MINUTOS} min`);
    return false;
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${clave}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "La Cima <onboarding@resend.dev>",
        to: [destino],
        subject: asunto,
        html: cuerpoHtml
      })
    });

    if (!r.ok) {
      const detalle = await r.text();
      console.error("Resend rechazó el envío:", r.status, detalle.slice(0, 200));
      return false;
    }

    return true;
  } catch (e) {
    console.error("Error enviando el aviso:", e.message);
    return false;
  }
}

// Plantilla común, para que los avisos se lean igual y sin sorpresas.
function plantilla(titulo, color, filas, nota) {
  const lineas = filas
    .map(([etiqueta, valor]) => `
      <tr>
        <td style="padding:6px 12px 6px 0;color:#666;white-space:nowrap">${etiqueta}</td>
        <td style="padding:6px 0;color:#111"><strong>${valor}</strong></td>
      </tr>`)
    .join("");

  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:${color};color:#fff;padding:18px 22px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:18px">${titulo}</h2>
      </div>
      <div style="border:1px solid #e3e3e3;border-top:none;border-radius:0 0 8px 8px;padding:20px 22px">
        <table style="border-collapse:collapse;font-size:14px">${lineas}</table>
        ${nota ? `<p style="margin:18px 0 0;padding-top:14px;border-top:1px solid #eee;color:#666;font-size:13px">${nota}</p>` : ""}
      </div>
      <p style="text-align:center;color:#999;font-size:12px;margin-top:14px">
        La Cima Restaurante · aviso automático
      </p>
    </div>`;
}

module.exports = { enviarAviso, plantilla };
