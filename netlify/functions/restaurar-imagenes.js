// TEMPORAL: copia el campo img de la copia de seguridad del 26 sep 2026 al menú
// actual, emparejando por nombre. No toca nada más. Se borra tras usarla.

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";
const COPIA = "2026-09-26T20-56-43-069Z";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Solo POST" };
  const clave = `auth=${encodeURIComponent(process.env.FIREBASE_DATABASE_SECRET)}`;

  const menu = await (await fetch(`${DB_URL}/menu.json?${clave}`)).json();
  const copia = await (await fetch(`${DB_URL}/backups/${COPIA}/menu.json?${clave}`)).json();
  if (!menu || !copia) return { statusCode: 502, body: JSON.stringify({ error: "No se pudo leer" }) };

  const original = {};
  for (const c in copia) for (const d of copia[c] || []) if (d && d.img) original[d.name] = d.img;

  let restauradas = 0;
  const sinPareja = [];
  for (const c in menu) {
    for (const d of menu[c] || []) {
      if (!d || !d.img) continue;
      if (original[d.name]) {
        if (d.img !== original[d.name]) { d.img = original[d.name]; restauradas++; }
      } else {
        sinPareja.push(d.name);
      }
    }
  }

  const g = await fetch(`${DB_URL}/menu.json?${clave}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menu)
  });
  return {
    statusCode: g.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: g.ok, restauradas, sinPareja })
  };
};
