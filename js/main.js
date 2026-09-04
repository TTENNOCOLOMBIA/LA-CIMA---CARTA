/* ========================================
   INICIALIZACIÓN - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  // Construir filtros y select
  buildFilters();
  buildSelect();

  // Renderizar solo Entradas al abrir
  renderMenu('entradas');

  // Inicializar cupones por defecto
  initializeDefaultCoupons();

  // Cargar carrito desde localStorage
  loadCartFromStorage();

  // Inicializar carrito
  updateCartUI();

  // Para evitar error si QRCode no está disponible
  generateQR = function() {};
});
