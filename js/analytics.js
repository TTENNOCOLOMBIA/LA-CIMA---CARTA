/* ========================================
   VISITAS Y PEDIDOS - LA CIMA RESTAURANTE
   ========================================

   Los contadores viven en Firebase, no en el navegador. Si estuvieran en
   localStorage, cada equipo contaría lo suyo y el panel mostraría solo las
   visitas del propio administrador, que no sirven de nada.

   Escribir: por netlify/functions/registrar-evento.js, porque quien visita
   la carta es anónimo y la base tiene ".write": false.
   Leer: directo, la lectura es pública igual que el menú.
*/

const ANALYTICS_DB = "https://la-cima-restaurante-default-rtdb.firebaseio.com";

// Última lectura conocida. El panel llama a getAnalytics() de forma
// síncrona, así que se le devuelve esto mientras la lectura de Firebase
// va por detrás.
let datosAnalytics = {
  totalVisits: 0,
  totalOrders: 0,
  todayVisits: 0,
  todayOrders: 0,
  dailyVisits: {},
  dailyOrders: {}
};

// El restaurante está en Colombia (UTC-5). Con UTC, todo lo de después de
// las 19:00 contaría como del día siguiente.
function fechaHoyColombia() {
  const ahora = new Date();
  const colombia = new Date(ahora.getTime() - 5 * 60 * 60 * 1000);
  return colombia.toISOString().slice(0, 10);
}

// Devuelve la última lectura. Síncrona a propósito: así el panel puede
// pintarla sin esperas.
function getAnalytics() {
  return datosAnalytics;
}

async function refrescarAnalytics() {
  try {
    const r = await fetch(`${ANALYTICS_DB}/analytics.json`);
    if (!r.ok) return datosAnalytics;

    const crudo = (await r.json()) || {};
    const totales = crudo.totals || {};
    const porDia = crudo.daily || {};
    const hoy = fechaHoyColombia();

    // Firebase guarda {visits, orders} por día; el panel espera dos objetos
    // separados indexados por fecha.
    const visitasPorDia = {};
    const pedidosPorDia = {};
    Object.keys(porDia).forEach((dia) => {
      visitasPorDia[dia] = porDia[dia].visits || 0;
      pedidosPorDia[dia] = porDia[dia].orders || 0;
    });

    datosAnalytics = {
      totalVisits: totales.visits || 0,
      totalOrders: totales.orders || 0,
      todayVisits: visitasPorDia[hoy] || 0,
      todayOrders: pedidosPorDia[hoy] || 0,
      dailyVisits: visitasPorDia,
      dailyOrders: pedidosPorDia
    };
  } catch (e) {
    // Sin conexión se conserva la última lectura; no hay que romper la página
    // por un contador.
    console.warn("No se pudieron leer las estadísticas:", e.message);
  }
  return datosAnalytics;
}

async function registrarEvento(tipo) {
  try {
    await fetch("/.netlify/functions/registrar-evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: tipo })
    });
  } catch (e) {
    // Que falle un contador nunca debe estorbar al cliente.
    console.warn("No se pudo registrar el evento:", e.message);
  }
}

// Una visita por sesión del navegador: recargar la página no debe inflar
// la cuenta.
function registrarVisita() {
  try {
    if (sessionStorage.getItem("lacimaVisitaContada")) return;
    sessionStorage.setItem("lacimaVisitaContada", "1");
  } catch (e) {
    // Navegación privada puede bloquear sessionStorage: se cuenta igual.
  }
  registrarEvento("visita");
}

function registrarPedido() {
  registrarEvento("pedido");
}

// Nombres antiguos que otras partes del código podían estar llamando.
const trackPageView = registrarVisita;
const trackConversion = registrarPedido;
const trackEvent = registrarEvento;

// En la carta pública se cuenta la visita. En el panel no: quien administra
// no es un cliente, y contarlo falsearía las cifras.
const esPanelAdmin = /admin-panel|admin-login/.test(window.location.pathname);

if (!esPanelAdmin) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", registrarVisita);
  } else {
    registrarVisita();
  }
}

// El panel necesita los datos para pintarlos. Se releen cada 30 segundos:
// el panel repinta cada 5, pero pedir a Firebase con esa frecuencia sería
// gastar por gusto para unas cifras que apenas cambian.
if (esPanelAdmin) {
  refrescarAnalytics();
  setInterval(refrescarAnalytics, 30000);
}

console.log("✅ Analytics cargado");
