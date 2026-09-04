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

  // NO renderizar nada automáticamente - esperar a que el usuario seleccione una categoría
  // El usuario debe presionar un botón de categoría para ver los productos
  const menuContainer = document.getElementById('menuContainer');
  if (menuContainer) {
    menuContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #FFD700; font-size: 18px;">👇 Selecciona una categoría para ver los productos 👇</div>';
  }

  // Inicializar cupones por defecto
  initializeDefaultCoupons();

  // Inicializar carrito vacío (no cargar desde localStorage)
  updateCartUI();

  console.log('✨ Carrito limpiado al cargar página');

  // Para evitar error si QRCode no está disponible
  generateQR = function() {};
});
