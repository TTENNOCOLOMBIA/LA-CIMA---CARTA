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

const { enviarAviso, plantilla } = require("./_correo");

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";

// Solo se permite escribir dentro de estas ramas. Acepta por ejemplo "menu",
// "menu/entradas" y "menu/entradas/0"; analytics se admite para poder poner
// los contadores a cero desde el panel.
// Sin esta lista, un fallo del panel podría sobrescribir cualquier parte
// de la base.
const RUTAS_PERMITIDAS = [
  /^menu(\/[A-Za-z0-9_-]+){0,2}$/,
  /^analytics(\/[A-Za-z0-9_.-]+){0,2}$/
];

// Tope de tamaño, por si algo se descontrola en el cliente.
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// Cuántas copias se conservan. Las más viejas se van borrando: sin límite,
// la base crecería sin parar (cada copia son los 133 productos completos).
const COPIAS_A_CONSERVAR = 10;

function respuesta(codigo, cuerpo) {
  return {
    statusCode: codigo,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(cuerpo)
  };
}

// Guarda el menú que hay ahora mismo antes de reemplazarlo, para poder
// volver atrás si el cambio sale mal o alguien borra algo por error.
async function hacerCopiaDeSeguridad(secreto, autor) {
  const clave = `auth=${encodeURIComponent(secreto)}`;

  const actual = await fetch(`${DB_URL}/menu.json?${clave}`);
  if (!actual.ok) return;

  const menuActual = await actual.json();
  // Nada que respaldar la primera vez.
  if (!menuActual) return;

  // La marca de tiempo va en el identificador para que se ordenen solas.
  // Los ":" y "." no valen como clave en Firebase.
  const marca = new Date().toISOString().replace(/[:.]/g, "-");

  await fetch(`${DB_URL}/backups/${marca}.json?${clave}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fecha: new Date().toISOString(),
      autor: autor || "desconocido",
      menu: menuActual
    })
  });

  // Borrar las copias sobrantes, de la más antigua hacia adelante.
  const listado = await fetch(`${DB_URL}/backups.json?shallow=true&${clave}`);
  if (!listado.ok) return;

  const claves = Object.keys((await listado.json()) || {}).sort();
  const sobrantes = claves.slice(0, Math.max(0, claves.length - COPIAS_A_CONSERVAR));

  await Promise.all(
    sobrantes.map((k) =>
      fetch(`${DB_URL}/backups/${k}.json?${clave}`, { method: "DELETE" })
    )
  );
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return respuesta(405, { error: "Solo se admite POST" });
  }

  // ---- 1. ¿Hay sesión válida? ----
  const usuario = context.clientContext && context.clientContext.user;
  if (!usuario) {
    // Alguien ha intentado modificar el menú sin estar identificado. No es
    // algo que pase por accidente: la carta pública nunca llama aquí.
    // El aviso está limitado a uno cada 15 minutos, así que un bot dando
    // golpes en bucle no llena el buzón.
    await enviarAviso(
      "⚠️ Intento de modificar el menú sin permiso",
      plantilla("Intento de escritura rechazado", "#c0392b", [
        ["Fecha y hora", new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })],
        ["Dirección IP", event.headers["x-nf-client-connection-ip"] || "desconocida"],
        ["Navegador", (event.headers["user-agent"] || "desconocido").slice(0, 120)]
      ], "El intento fue rechazado y el menú no se ha tocado. Este aviso es informativo: si se repite mucho, avísame."),
      "intento",
      process.env.FIREBASE_DATABASE_SECRET
    );

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

  if (typeof ruta !== "string" || !RUTAS_PERMITIDAS.some((r) => r.test(ruta))) {
    return respuesta(400, { error: "Ruta no permitida" });
  }
  if (datos === undefined) {
    return respuesta(400, { error: "No se recibieron datos que guardar" });
  }

  // ---- 4. Copia de seguridad antes de sobrescribir el menú entero ----
  // Solo al reemplazar "menu" completo, que es la operación que puede
  // llevarse por delante los 133 productos de una vez. Guardar el menú
  // anterior permite deshacer. Si la copia falla no se aborta el guardado:
  // impedir un cambio legítimo por no poder respaldarlo sería peor.
  if (ruta === "menu") {
    try {
      await hacerCopiaDeSeguridad(secreto, usuario.email);
    } catch (e) {
      console.error("No se pudo guardar la copia previa:", e.message);
    }
  }

  // ---- 5. Escribir en Firebase ----
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
