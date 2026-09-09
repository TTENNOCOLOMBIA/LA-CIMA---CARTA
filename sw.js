// ========================================
// SERVICE WORKER — SIN CACHÉ A PROPÓSITO
// ========================================
//
// Existe solo para que el navegador ofrezca instalar la carta como app:
// Chrome exige un service worker con manejador de fetch para considerarla
// instalable. No guarda nada.
//
// Por qué sin caché: un service worker que cachea sirve copias viejas hasta
// que se le fuerza a actualizar. Este proyecto ya ha tenido dos episodios
// serios por datos desfasados —el menú que no se sincronizaba entre equipos,
// y mediciones falsas por los 5 minutos de caché de /js/*— y aquí el riesgo
// sería peor: el cliente podría ver precios o platos que ya no existen.
//
// La velocidad ya la resuelve Netlify con su CDN y sus cabeceras de caché.
// Si algún día se quiere caché offline, hay que hacerlo con cuidado: nunca
// cachear el menú ni los precios, y versionar el nombre del caché.

self.addEventListener("install", () => {
  // Activar de inmediato, sin esperar a que se cierren las pestañas viejas.
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      // Borrar cualquier caché que hubiera dejado una versión anterior.
      const nombres = await caches.keys();
      await Promise.all(nombres.map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// Necesario para la instalación: se limita a dejar pasar la petición a la
// red, sin guardar copia.
self.addEventListener("fetch", () => {
  return;
});
