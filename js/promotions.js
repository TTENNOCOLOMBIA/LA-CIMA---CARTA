/* ========================================
   PROMOCIONES Y DESCUENTOS - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================

let appliedCoupon = null;

// ========================================
// FUNCIONES DE CUPÓN
// ========================================

function applyCoupon(couponCode) {
  const coupon = validateCoupon(couponCode);

  if (!coupon) {
    alert('❌ Cupón inválido o expirado. Intenta con otro código.');
    return false;
  }

  appliedCoupon = coupon;
  document.getElementById('couponInput').value = '';

  // Mostrar confirmación
  const discount = calculateDiscount(coupon, getSubtotal());
  alert('✅ Cupón aplicado!\n\n' + coupon.description + '\nAhorro: $' + discount.toLocaleString('es-CO'));

  // Actualizar totales
  updateCartUI();
  return true;
}

function removeCoupon() {
  appliedCoupon = null;
  document.getElementById('couponContainer').style.display = 'none';
  updateCartUI();
}

function showCouponInput() {
  const container = document.getElementById('couponContainer');

  if (container.style.display === 'none') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

function getSubtotal() {
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

function getTotalDiscount() {
  if (!appliedCoupon) return 0;
  return calculateDiscount(appliedCoupon, getSubtotal());
}

// ========================================
// FUNCIONES DE ADMINISTRACIÓN DE CUPONES
// ========================================

function showCouponAdmin() {
  if (!isPasswordVerified) {
    alert('Necesitas estar en modo edición');
    return;
  }

  const coupons = getActiveCoupons();
  let html = '<h3>Gestión de Cupones</h3>\n\n';

  html += '<h4>Cupones Activos:</h4>\n';
  coupons.forEach((c, idx) => {
    html += idx + 1 + '. ' + c.code + ' - ' + c.description + '\n';
  });

  html += '\n\n¿Qué deseas hacer?\n1. Agregar nuevo cupón\n2. Eliminar cupón\n3. Editar cupón';
  const choice = prompt(html);

  if (choice === '1') {
    addNewCoupon();
  } else if (choice === '2') {
    deleteCoupon();
  } else if (choice === '3') {
    editCoupon();
  }
}

function addNewCoupon() {
  const code = prompt('Código del cupón (ej: PROMO20):');
  if (!code) return;

  const description = prompt('Descripción (ej: Descuento 20%):');
  if (!description) return;

  const typeChoice = prompt('Tipo de descuento:\n1. Porcentaje\n2. Monto fijo');
  const type = typeChoice === '1' ? 'percentage' : 'fixed';

  const value = parseInt(prompt('Valor del descuento:'));
  if (!value || value < 0) {
    alert('Valor inválido');
    return;
  }

  const coupons = getActiveCoupons();
  coupons.push({
    code: code.toUpperCase(),
    type: type,
    value: value,
    description: description,
    active: true,
    expiryDate: null
  });

  localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(coupons));
  alert('✅ Cupón agregado exitosamente');
}

function deleteCoupon() {
  const code = prompt('Código del cupón a eliminar:');
  if (!code) return;

  let coupons = getActiveCoupons();
  const index = coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());

  if (index === -1) {
    alert('Cupón no encontrado');
    return;
  }

  coupons.splice(index, 1);
  localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(coupons));
  alert('✅ Cupón eliminado');
}

function editCoupon() {
  const code = prompt('Código del cupón a editar:');
  if (!code) return;

  let coupons = getActiveCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());

  if (!coupon) {
    alert('Cupón no encontrado');
    return;
  }

  const newDescription = prompt('Nueva descripción:', coupon.description);
  if (newDescription) {
    coupon.description = newDescription;
  }

  const newValue = prompt('Nuevo valor:', coupon.value);
  if (newValue && !isNaN(newValue)) {
    coupon.value = parseInt(newValue);
  }

  const activeChoice = confirm('¿Cupón activo?');
  coupon.active = activeChoice;

  localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(coupons));
  alert('✅ Cupón actualizado');
}

// ========================================
// FUNCIONES DE ADMIN PANEL
// ========================================

function togglePromotionsPanel() {
  const panel = document.getElementById('promotionsPanel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}
