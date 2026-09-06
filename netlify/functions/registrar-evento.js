// ========================================
// CONTADOR DE VISITAS Y PEDIDOS
// ========================================
//
// Por qué es pública (a diferencia de guardar-menu.js):
// quien visita la carta es un cliente anónimo, sin sesión. No puede escribir
// en Firebase (".write": false) ni usar guardar-menu.js, que exige sesión.
// Esta función es el único camino para contar esas visitas.
//
// Qué puede hacer alguien que abuse de ella: inflar dos contadores. Nada más.
// No admite datos libres ni escribe fuera de /analytics: el tipo de evento
// tiene que ser uno de los dos de la lista y el valor siempre es "sumar 1".
// El menú y el resto de la base quedan fuera de su alcance.
//
// Los incrementos usan {".sv": {"increment": 1}}, que Firebase resuelve en el
// servidor de forma atómica. Así dos visitas simultáneas no se pisan, cosa
// que sí pasaría leyendo el valor y volviéndolo a escribir.

const DB_URL = "https://la-cima-restaurante-default-rtdb.firebaseio.com";

// Solo estos dos eventos. Cualquier otro se rechaza.
const EVENTOS = {
  visita: "visits",
  pedido: "orders"
};

// De dónde se acepta la llamada. Evita que la función se use como contador
// desde cualquier página ajena. No es una barrera fuerte (la cabecera se
// puede falsear), pero descarta el abuso trivial.
const ORIGENES = [
  "https://cimarestaurante.netlify.app",
  "http://localhost:8888"
];

function respuesta(codigo, cuerpo) {
  return {
    statusCode: codigo,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(cuerpo)
  };
}

// Fecha en horario de Colombia, que es donde está el restaurante. Con UTC,
// los pedidos de la noche caerían en el día siguiente.
function hoyEnColombia() {
  const ahora = new Date();
  const colombia = new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
  return colombia.toISOString().slice(0, 10); // AAAA-MM-DD
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respuesta(405, { error: "Solo se admite POST" });
  }

  const origen = event.headers.origin || event.headers.referer || "";
  if (origen && !ORIGENES.some((o) => origen.startsWith(o))) {
    return respuesta(403, { error: "Origen no permitido" });
  }

  const secreto = process.env.FIREBASE_DATABASE_SECRET;
  if (!secreto) {
    console.error("Falta la variable de entorno FIREBASE_DATABASE_SECRET");
    return respuesta(500, { error: "El servidor no está configurado" });
  }

  let cuerpo;
  try {
    cuerpo = JSON.parse(event.body || "{}");
  } catch (e) {
    return respuesta(400, { error: "El contenido no es JSON válido" });
  }

  const campo = EVENTOS[cuerpo.tipo];
  if (!campo) {
    return respuesta(400, { error: "Tipo de evento no reconocido" });
  }

  const dia = hoyEnColombia();
  const sumarUno = JSON.stringify({ ".sv": { increment: 1 } });

  // Dos contadores: el acumulado y el del día. Si uno falla, el otro no se
  // ve afectado; para un contador de visitas eso es preferible a no contar.
  const destinos = [
    `${DB_URL}/analytics/totals/${campo}.json?auth=${encodeURIComponent(secreto)}`,
    `${DB_URL}/analytics/daily/${dia}/${campo}.json?auth=${encodeURIComponent(secreto)}`
  ];

  try {
    const resultados = await Promise.all(
      destinos.map((url) =>
        fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: sumarUno
        })
      )
    );

    const fallo = resultados.find((r) => !r.ok);
    if (fallo) {
      // Nunca devolver el cuerpo de Firebase: repetiría la URL con el secreto.
      console.error("Firebase rechazó el contador:", fallo.status);
      return respuesta(502, { error: "No se pudo registrar" });
    }

    return respuesta(200, { ok: true });
  } catch (e) {
    console.error("Error registrando evento:", e.message);
    return respuesta(500, { error: "No se pudo registrar" });
  }
};
