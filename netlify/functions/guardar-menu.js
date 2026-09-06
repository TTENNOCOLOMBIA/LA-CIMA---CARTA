// ========================================
// GUARDAR MENÚ EN FIREBASE — desde el servidor
// ========================================
//
// Por qué existe:
// Las reglas de la base están en ".write": false, así que el navegador ya
// no puede escribir. Antes estaban abiertas y cualquiera en internet podía
// borrar el menú entero (comprobado el 6 sep 2026: PUT y DELETE anónimos
// devolvían HTTP 200).
//
// Esta función es el único camino de escritura. Corre en el servidor de
// Netlify, donde vive el secreto de la base. El navegador nunca lo ve.
//
// Antes de escribir comprueba que quien llama tiene sesión iniciada con
// Netlify Identity: si el navegador manda un JWT válido en la cabecera
// Authorization, Netlify rellena context.clientContext.user. Si no hay
// sesión, ese campo llega vacío y se rechaza la petición.
//
// Deuda técnica conocida: usa el "secreto de base de datos", que Firebase
// marca como heredado. Funciona, pero si algún día Google lo retira habrá
// que migrar a una cuenta de servicio con el SDK de Firebase Admin (eso
// exigiría añadir package.json y dependencias npm al proyecto).

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";

// Solo se permite escribir dentro de menu/. Acepta "menu",
// "menu/entradas" y "menu/entradas/0". Nada más.
// Sin esto, un fallo del panel podría sobrescribir otras ramas de la base.
const RUTA_PERMITIDA = /^menu(\/[A-Za-z0-9_-]+){0,2}$/;

// Tope de tamaño, por si algo se descontrola en el cliente.
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

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

  // ---- 1. ¿Hay sesión válida? ----
  const usuario = context.clientContext && context.clientContext.user;
  if (!usuario) {
    return respuesta(401, {
      error: "Necesitas iniciar sesión para guardar cambios"
    });
  }

  // ---- 2. ¿Está configurado el secreto? ----
  const secreto = process.env.FIREBASE_DATABASE_SECRET;
  if (!secreto) {
    // No se filtra ningún detalle al navegador; el aviso queda en los logs.
    console.error("Falta la variable de entorno FIREBASE_DATABASE_SECRET");
    return respuesta(500, { error: "El servidor no está configurado" });
  }

  // ---- 3. Validar lo que llega ----
  if (!event.body || Buffer.byteLength(event.body, "utf8") > MAX_BYTES) {
    return respuesta(413, { error: "El contenido es demasiado grande" });
  }

  let cuerpo;
  try {
    cuerpo = JSON.parse(event.body);
  } catch (e) {
    return respuesta(400, { error: "El contenido no es JSON válido" });
  }

  const { ruta, datos } = cuerpo;

  if (typeof ruta !== "string" || !RUTA_PERMITIDA.test(ruta)) {
    return respuesta(400, { error: "Ruta no permitida" });
  }
  if (datos === undefined) {
    return respuesta(400, { error: "No se recibieron datos que guardar" });
  }

  // ---- 4. Escribir en Firebase ----
  try {
    const url = `${DB_URL}/${ruta}.json?auth=${encodeURIComponent(secreto)}`;
    const r = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!r.ok) {
      // Nunca devolver el cuerpo de Firebase tal cual: la respuesta de error
      // puede repetir la URL, y la URL lleva el secreto dentro.
      console.error("Firebase rechazó la escritura:", r.status);
      return respuesta(502, {
        error: "La base de datos rechazó el cambio",
        codigo: r.status
      });
    }

    console.log(`Menú actualizado en ${ruta} por ${usuario.email}`);
    return respuesta(200, { ok: true, ruta: ruta });
  } catch (e) {
    console.error("Error escribiendo en Firebase:", e.message);
    return respuesta(500, { error: "No se pudo guardar el cambio" });
  }
};
