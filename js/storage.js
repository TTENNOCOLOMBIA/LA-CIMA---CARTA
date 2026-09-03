/* ========================================
   ALMACENAMIENTO LOCAL - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// VARIABLES GLOBALES DE ALMACENAMIENTO
// ========================================

const STORAGE_KEYS = {
  CART: 'lacimaCart',
  FAVORITES: 'lacimaFavorites',
  MENU: 'lacimaMenuV2',
  PROMOTIONS: 'lacimaPromotions'
};

// ========================================
// FUNCIONES DE CARRITO PERSISTENTE
// ========================================

function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (e) {
    console.error('Error guardando carrito:', e);
  }
}

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartUI();
    }
  } catch (e) {
    console.error('Error cargando carrito:', e);
    cart = [];
  }
}

function clearCartFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CART);
  } catch (e) {
    console.error('Error limpiando carrito:', e);
  }
}

// ========================================
// FUNCIONES DE FAVORITOS
// ========================================

function addToFavorites(dishName, category) {
  try {
    let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];

    // Evitar duplicados
    if (!favorites.find(f => f.name === dishName && f.category === category)) {
      favorites.push({
        name: dishName,
        category: category,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error guardando favorito:', e);
    return false;
  }
}

function removeFromFavorites(dishName) {
  try {
    let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    favorites = favorites.filter(f => f.name !== dishName);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (e) {
    console.error('Error removiendo favorito:', e);
    return false;
  }
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
  } catch (e) {
    console.error('Error cargando favoritos:', e);
    return [];
  }
}

function isFavorite(dishName) {
  const favorites = getFavorites();
  return favorites.some(f => f.name === dishName);
}

// ========================================
// FUNCIONES DE CUPONES/DESCUENTOS
// ========================================

function getActiveCoupons() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMOTIONS)) || [];
  } catch (e) {
    console.error('Error cargando cupones:', e);
    return [];
  }
}

function validateCoupon(code) {
  const coupons = getActiveCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);

  if (coupon) {
    // Verificar si ha expirado
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return null;
    }
    return coupon;
  }
  return null;
}

function calculateDiscount(coupon, subtotal) {
  if (!coupon) return 0;

  if (coupon.type === 'percentage') {
    return Math.floor(subtotal * (coupon.value / 100));
  } else if (coupon.type === 'fixed') {
    return Math.min(coupon.value, subtotal);
  }
  return 0;
}

// ========================================
// FUNCIONES DE GOOGLE SHEETS INTEGRATION
// ========================================

function sendOrderToGoogleSheets(orderData) {
  // Esta función será implementada cuando el usuario configure Google Sheets
  // Por ahora, guardamos localmente como respaldo
  try {
    let orders = JSON.parse(localStorage.getItem('lacimaOrders')) || [];
    orders.push({
      ...orderData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('lacimaOrders', JSON.stringify(orders));
  } catch (e) {
    console.error('Error guardando pedido local:', e);
  }
}

// ========================================
// INICIALIZACIÓN DE CUPONES POR DEFECTO
// ========================================

function initializeDefaultCoupons() {
  const existingCoupons = getActiveCoupons();

  if (existingCoupons.length === 0) {
    const defaultCoupons = [
      {
        code: 'BIENVENIDA10',
        type: 'percentage',
        value: 10,
        description: 'Descuento de bienvenida 10%',
        active: true,
        expiryDate: null
      },
      {
        code: 'PROMO20',
        type: 'percentage',
        value: 20,
        description: 'Descuento especial 20%',
        active: true,
        expiryDate: null
      },
      {
        code: 'DOMICILIO5',
        type: 'fixed',
        value: 5000,
        description: 'Descuento en domicilio $5.000',
        active: true,
        expiryDate: null
      }
    ];

    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(defaultCoupons));
  }
}
