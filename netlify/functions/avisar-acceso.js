// ========================================
// AVISO DE ACCESO AL PANEL
// ========================================
//
// La llama admin-panel.html cuando alguien entra con sesión válida. Sirve
// para enterarse de un acceso que no hayas hecho tú.
//
// Solo avisa de accesos LEGÍTIMOS (con sesión). Los intentos con contraseña
// equivocada ocurren dentro de Netlify Identity y no pasan por aquí; verlos
// exigiría el plan Pro y su registro de actividad.

const { enviarAviso, plantilla } = require("./_correo");

function respuesta(codigo, cuerpo) {
  return {
    statusCode: codigo,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(cuerpo)
  };
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return respuesta(405, { error: "Solo se admite POST" });
  }

  const usuario = context.clientContext && context.clientContext.user;
  if (!usuario) {
    return respuesta(401, { error: "Sin sesión" });
  }

  const cuando = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
  const ip = event.headers["x-nf-client-connection-ip"] || "desconocida";
  const navegador = (event.headers["user-agent"] || "desconocido").slice(0, 120);

  await enviarAviso(
    "🔓 Alguien entró al panel de La Cima",
    plantilla("Acceso al panel de administración", "#2d7d46", [
      ["Cuenta", usuario.email || "desconocida"],
      ["Fecha y hora", cuando],
      ["Dirección IP", ip],
      ["Navegador", navegador]
    ], "Si has sido tú, no hay nada que hacer. Si no, cambia la contraseña cuanto antes desde el panel."),
    "acceso",
    process.env.FIREBASE_DATABASE_SECRET
  );

  return respuesta(200, { ok: true });
};
