/* ========================================
   INICIALIZACIÓN - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // ✨ LIMPIAR CARRITO AL CARGAR LA PÁGINA - Cada cliente comienza con carrito vacío
  clearCartFromStorage(); // Usar la función de storage.js
  cart = []; // Limpiar variable global

  // Construir filtros y select
  buildFilters();
  buildSelect();

  // Inicializar cupones por defecto
  initializeDefaultCoupons();

  // Inicializar carrito vacío (no cargar desde localStorage)
  updateCartUI();

  console.log('✨ Carrito limpiado al cargar página');

  // Para evitar error si QRCode no está disponible
  generateQR = function() {};
});
