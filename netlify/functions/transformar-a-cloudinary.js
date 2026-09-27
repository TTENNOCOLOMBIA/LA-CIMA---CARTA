// TEMPORAL: revierte las URLs de Cloudinary fetch a las originales de ibb.co.
// La cuenta de Cloudinary tiene restringido el tipo "fetch" (401). Se borra tras usarla.

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";
const PREFIJO = "https://res.cloudinary.com/pxcwrhwc/image/fetch/c_scale,w_800,q_auto,f_auto/";

function respuesta(codigo, cuerpo) {
  return {
    statusCode: codigo,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(cuerpo)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return respuesta(405, { error: "Solo POST" });

  const secreto = process.env.FIREBASE_DATABASE_SECRET;
  const clave = `auth=${encodeURIComponent(secreto)}`;

  const res = await fetch(`${DB_URL}/menu.json?${clave}`);
  if (!res.ok) return respuesta(502, { error: "No se pudo leer" });
  const menu = await res.json();

  let revertidas = 0;
  for (const cat in menu) {
    for (const dish of menu[cat] || []) {
      if (dish && typeof dish.img === "string" && dish.img.startsWith(PREFIJO)) {
        dish.img = decodeURIComponent(dish.img.slice(PREFIJO.length));
        revertidas++;
      }
    }
  }

  const g = await fetch(`${DB_URL}/menu.json?${clave}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menu)
  });
  if (!g.ok) return respuesta(502, { error: "No se pudo guardar" });

  return respuesta(200, { ok: true, revertidas });
};
