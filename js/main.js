/* ========================================
   INICIALIZACIÓN - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // ✨ LIMPIAR CARRITO AL CARGAR LA PÁGINA - Cada cliente comienza con carrito vacío
  localStorage.removeItem('lacimaCart');
  cart = [];

  // Construir filtros y select
  buildFilters();
  buildSelect();

  // Renderizar solo Entradas al abrir
  renderMenu('entradas');

  // Inicializar cupones por defecto
  initializeDefaultCoupons();

  // Inicializar carrito vacío (no cargar desde localStorage)
  updateCartUI();

  // Para evitar error si QRCode no está disponible
  generateQR = function() {};
});
