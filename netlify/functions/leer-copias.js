// ========================================
// LEER COPIAS DE SEGURIDAD — desde el servidor
// ========================================
//
// Por qué existe:
// Las copias de /backups guardan el menú completo y el correo de quien hizo
// cada cambio. Hasta el 4 nov 2026 cualquiera en internet podía leerlas, y
// Firebase envió el aviso "cualquier usuario puede leer toda la base de
// datos". Ahora la base solo deja leer /menu y /analytics al público; las
// copias se leen aquí, con el secreto de la base y solo con sesión iniciada.
//
// Uso (siempre con cabecera Authorization: Bearer <jwt de Netlify Identity>):
//   POST {}                  → lista de copias (fecha, autor, conteos)
//   POST { clave: "<id>" }   → el menú de esa copia, para restaurarla

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";

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
    return respuesta(401, { error: "Necesitas iniciar sesión" });
  }

  const secreto = process.env.FIREBASE_DATABASE_SECRET;
  if (!secreto) {
    return respuesta(500, { error: "Falta configurar el secreto de la base" });
  }
  const clave = `auth=${encodeURIComponent(secreto)}`;

  let cuerpo = {};
  try {
    cuerpo = JSON.parse(event.body || "{}");
  } catch (e) {
    return respuesta(400, { error: "Petición no válida" });
  }

  try {
    // Una copia concreta, para restaurarla.
    if (cuerpo.clave) {
      if (!/^[0-9TZ-]+$/.test(cuerpo.clave)) {
        return respuesta(400, { error: "Copia no válida" });
      }
      const r = await fetch(`${DB_URL}/backups/${cuerpo.clave}/menu.json?${clave}`);
      if (!r.ok) return respuesta(502, { error: "No se pudo leer la copia" });
      return respuesta(200, { menu: await r.json() });
    }

    // Lista resumida: no hace falta mandar los 10 menús completos al panel.
    const r = await fetch(`${DB_URL}/backups.json?${clave}`);
    if (!r.ok) return respuesta(502, { error: "No se pudieron leer las copias" });
    const copias = (await r.json()) || {};

    const lista = Object.keys(copias).sort().reverse().map((k) => {
      const c = copias[k] || {};
      let productos = 0;
      const cats = c.menu ? Object.keys(c.menu).length : 0;
      if (c.menu) {
        Object.values(c.menu).forEach((l) => {
          if (Array.isArray(l)) productos += l.length;
        });
      }
      return { clave: k, fecha: c.fecha || null, autor: c.autor || "?", productos, cats };
    });

    return respuesta(200, { copias: lista });
  } catch (e) {
    return respuesta(502, { error: "Error leyendo la base" });
  }
};
