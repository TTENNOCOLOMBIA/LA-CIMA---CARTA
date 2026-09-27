// ========================================
// FUNCIÓN TEMPORAL: Transformar imágenes a Cloudinary
// ========================================
// Creada el 27 sep 2026 para migrar las 133 imágenes de ibb.co a Cloudinary
// Esta función se ejecuta UNA sola vez y luego se elimina.
// No requiere autenticación: es de uso único y temporal.

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";
const CLOUD_NAME = 'pxcwrhwc';

function respuesta(codigo, cuerpo) {
  return {
    statusCode: codigo,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(cuerpo)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respuesta(405, { error: "Solo se admite POST" });
  }

  const secreto = process.env.FIREBASE_DATABASE_SECRET;
  if (!secreto) {
    return respuesta(500, { error: "Sin configuración" });
  }

  try {
    // Leer menú actual
    const url = `${DB_URL}/menu.json?auth=${encodeURIComponent(secreto)}`;
    const res = await fetch(url);
    if (!res.ok) {
      return respuesta(502, { error: "No se pudo leer el menú" });
    }

    const menu = await res.json();
    if (!menu) {
      return respuesta(400, { error: "Menú vacío" });
    }

    let transformadas = 0;

    // Transformar todas las imágenes
    for (const cat in menu) {
      for (const dish of menu[cat]) {
        if (dish.img && dish.img.includes('ibb.co')) {
          const ibbUrl = dish.img.split('?')[0];
          dish.img = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/c_scale,w_800,q_auto,f_auto/${encodeURIComponent(ibbUrl)}`;
          transformadas++;
        }
      }
    }

    // Guardar menú transformado
    const guardarUrl = `${DB_URL}/menu.json?auth=${encodeURIComponent(secreto)}`;
    const guardar = await fetch(guardarUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menu)
    });

    if (!guardar.ok) {
      return respuesta(502, { error: "No se pudo guardar el menú" });
    }

    console.log(`✅ Transformadas ${transformadas} imágenes a Cloudinary`);
    return respuesta(200, {
      ok: true,
      transformadas: transformadas,
      mensaje: "✅ Todas las imágenes están ahora en Cloudinary"
    });
  } catch (e) {
    console.error("Error:", e.message);
    return respuesta(500, { error: e.message });
  }
};
