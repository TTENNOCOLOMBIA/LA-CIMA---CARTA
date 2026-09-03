/* ========================================
   LÓGICA DEL CARRITO - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================

let cart = [];

// ========================================
// FUNCIONES DEL CARRITO
// ========================================

function addToCart(name, price) {
  if (price === 0) {
    alert('Este plato aún no tiene precio. Consultá con La Cima por WhatsApp para conocer el costo.');
    return;
  }

  const item = cart.find(i => i.name === name);

  if (item) {
    item.qty++;
  } else {
    cart.push({
      name,
      price,
      qty: 1
    });
  }

  updateCartUI();
  openCart();
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsList = document.getElementById('cartItemsList');

  if (cart.length === 0) {
    itemsList.innerHTML = '<div class="cart-empty">El carrito está vacío</div>';
    document.getElementById('cartForm').classList.remove('show');
    updateTotals();
    saveCartToStorage(); // Guardar carrito vacío
    return;
  }

  itemsList.innerHTML = cart.map((item, idx) => `<div class="cart-item"><div class="cart-item-name">${item.name}</div><div class="cart-item-qty"><button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button><span>${item.qty}</span><button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button></div><div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CO')}</div><button class="cart-remove" onclick="removeFromCart(${idx})">✕</button></div>`).join('');

  document.getElementById('cartForm').classList.add('show');
  updateTotals();
  saveCartToStorage(); // Guardar carrito cada vez que se actualiza
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;

  if (cart[idx].qty < 1) {
    cart.splice(idx, 1);
  }

  updateCartUI();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCartUI();
}

function updateTotals() {
  const subtotal = getSubtotal();
  const descuento = getTotalDiscount();
  const subtotalConDescuento = subtotal - descuento;
  const total = subtotalConDescuento + DOMICILIO;

  document.getElementById('subtotalAmount').textContent = '$' + subtotal.toLocaleString('es-CO');

  // Mostrar descuento si hay cupón aplicado
  const discountRow = document.getElementById('discountRow');
  if (appliedCoupon && discountRow) {
    discountRow.style.display = 'block';
    discountRow.innerHTML = '<span>' + appliedCoupon.description + ':</span><span>-$' + descuento.toLocaleString('es-CO') + '</span>';
  }

  // Mostrar subtotal con descuento si aplica
  if (descuento > 0) {
    const subtotalRow = document.getElementById('subtotalAmount').parentElement;
    subtotalRow.innerHTML = '<span>Subtotal con descuento:</span><span>$' + subtotalConDescuento.toLocaleString('es-CO') + '</span>';
  }

  document.getElementById('totalAmount').textContent = '$' + total.toLocaleString('es-CO');
}

function openCart() {
  document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
  document.getElementById('cartModal').classList.remove('active');
}

// ========================================
// DIRECCIÓN Y ENVÍO
// ========================================

function confirmAddressOnMap() {
  const street = document.getElementById('customerStreet').value;
  const barrio = document.getElementById('customerBarrio').value;
  const complement = document.getElementById('customerComplement').value;

  if (!street || !barrio) {
    alert('Llena Calle y Barrio para confirmar la dirección');
    return;
  }

  const fullAddress = street + ', ' + barrio + (complement ? ', ' + complement : '') + ', Ipiales, Nariño';
  const mapsUrl = 'https://maps.google.com/?q=' + encodeURIComponent(fullAddress);

  window.open(mapsUrl, '_blank');
  document.getElementById('mapConfirmation').style.display = 'block';
}

function sendOrder() {
  // Verificar que se haya seleccionado al menos uno de los formularios
  if (!datosFacturacion && !datosFormularioSimple) {
    alert('⚠️ Por favor completa tu información: selecciona una opción de pago');
    return;
  }

  const subtotal = getSubtotal();
  const descuento = getTotalDiscount();
  const total = (subtotal - descuento) + DOMICILIO;

  let productsList = cart.map(i => `- ${i.name} x${i.qty} = $${(i.price * i.qty).toLocaleString('es-CO')}`).join('\n');

  let messageParts = [
    '*🚀 PEDIDO EN TIEMPO REAL - LA CIMA RESTAURANTE*\n'
  ];

  // AGREGAR DATOS SEGÚN TIPO (FACTURA o SIMPLE)
  if (datosFacturacion) {
    messageParts.push('*📄 FACTURA ELECTRÓNICA:*');
    messageParts.push(`Tipo Doc: ${datosFacturacion.tipoDoc === 'cc' ? 'Cédula' : 'NIT'}`);
    messageParts.push(`Documento: ${datosFacturacion.numeroDoc}`);
    messageParts.push(`Nombre: ${datosFacturacion.nombre}`);
    messageParts.push(`Correo: ${datosFacturacion.correo}`);
    messageParts.push(`Teléfono: ${datosFacturacion.telefono}`);
    messageParts.push(`Responsabilidad: ${datosFacturacion.responsabilidad}`);
    messageParts.push(`Tributaria: ${datosFacturacion.tributaria}`);
  } else if (datosFormularioSimple) {
    messageParts.push('*👤 CLIENTE (SIN FACTURA):*');
    messageParts.push(`Nombre: ${datosFormularioSimple.nombre}`);
    messageParts.push(`Teléfono: ${datosFormularioSimple.telefono}`);
    if (datosFormularioSimple.correo) messageParts.push(`Correo: ${datosFormularioSimple.correo}`);
    messageParts.push(`Dirección: ${datosFormularioSimple.calle}, ${datosFormularioSimple.barrio}`);
    if (datosFormularioSimple.complemento) messageParts.push(`Complemento: ${datosFormularioSimple.complemento}`);
    if (datosFormularioSimple.notas) messageParts.push(`Notas: ${datosFormularioSimple.notas}`);
  }

  messageParts.push('');
  messageParts.push('*🍽️ PRODUCTOS:*');
  messageParts.push(productsList);
  messageParts.push('');
  messageParts.push('*💰 TOTALES:*');
  messageParts.push('Subtotal: $' + subtotal.toLocaleString('es-CO'));

  if (descuento > 0) {
    messageParts.push((appliedCoupon ? appliedCoupon.description : 'Descuento') + ': -$' + descuento.toLocaleString('es-CO'));
  }

  messageParts.push('Domicilio: $' + DOMICILIO.toLocaleString('es-CO'));
  messageParts.push('TOTAL: $' + total.toLocaleString('es-CO'));

  const message = messageParts.filter(p => p !== '').join('\n');

  // Guardar pedido localmente
  const orderData = {
    customer: datosFacturacion || datosFormularioSimple,
    products: cart,
    totals: {
      original: subtotal,
      discount: descuento,
      delivery: DOMICILIO,
      final: total
    },
    coupon: appliedCoupon ? appliedCoupon.code : null
  };

  sendOrderToGoogleSheets(orderData);

  const wa_url = `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(message)}`;

  window.open(wa_url, '_blank');

  // Limpiar carrito y datos
  cart = [];
  datosFacturacion = null;
  datosFormularioSimple = null;
  appliedCoupon = null;
  updateCartUI();
  clearCartFromStorage();
  closeCart();
  alert('✅ ¡Pedido enviado! Revisa tu WhatsApp para confirmar.');
}

// ========================================
// NUEVO: MANEJO DE DOS OPCIONES DE PAGO
// ========================================

// Variables globales para guardar datos de facturación
let datosFacturacion = null;
let datosFormularioSimple = null;

// Toggle Formulario Factura Electrónica
function toggleFormularioFactura(e) {
  e.preventDefault();
  const formularioFactura = document.getElementById('formularioFactura');
  const formularioSimple = document.getElementById('formularioSimple');

  if (formularioFactura.style.display === 'none') {
    formularioFactura.style.display = 'block';
    formularioSimple.style.display = 'none';
  } else {
    formularioFactura.style.display = 'none';
  }
}

// Toggle Formulario Simple (Sin Factura)
function toggleFormularioSimple(e) {
  e.preventDefault();
  const formularioSimple = document.getElementById('formularioSimple');
  const formularioFactura = document.getElementById('formularioFactura');

  if (formularioSimple.style.display === 'none') {
    formularioSimple.style.display = 'block';
    formularioFactura.style.display = 'none';
  } else {
    formularioSimple.style.display = 'none';
  }
}

// Generar Factura Electrónica
function generarFactura() {
  const tipoDoc = document.getElementById('tipoDoc').value;
  const numeroDoc = document.getElementById('numeroDoc').value;
  const nombre = document.getElementById('nombreFactura').value;
  const correo = document.getElementById('correoFactura').value;
  const telefono = document.getElementById('telefonoFactura').value;
  const responsabilidad = document.getElementById('responsabilidad').value;
  const tributaria = document.getElementById('tributaria').value;

  // Validar que todos los campos estén llenos
  if (!tipoDoc || !numeroDoc || !nombre || !correo || !telefono || !responsabilidad || !tributaria) {
    alert('⚠️ Por favor completa todos los campos de facturación');
    return;
  }

  // Guardar los datos
  datosFacturacion = {
    tipo: 'factura',
    tipoDoc,
    numeroDoc,
    nombre,
    correo,
    telefono,
    responsabilidad,
    tributaria
  };

  alert('✅ Factura generada correctamente.\n\nAhora presiona "Haz tu pedido en tiempo real" para continuar.');
  console.log('Datos de facturación guardados:', datosFacturacion);
}

// Guardar Formulario Simple (Sin Factura)
function guardarFormularioSimple() {
  const nombre = document.getElementById('customerName').value;
  const telefono = document.getElementById('customerPhone').value;
  const calle = document.getElementById('customerStreet').value;
  const barrio = document.getElementById('customerBarrio').value;

  // Validar campos requeridos
  if (!nombre || !telefono || !calle || !barrio) {
    alert('⚠️ Por favor completa los campos requeridos: Nombre, Teléfono, Calle y Barrio');
    return;
  }

  // Guardar los datos
  datosFormularioSimple = {
    tipo: 'simple',
    nombre: nombre,
    telefono: telefono,
    correo: document.getElementById('correoSimple').value,
    calle: calle,
    barrio: barrio,
    complemento: document.getElementById('customerComplement').value,
    notas: document.getElementById('customerNotes').value
  };

  alert('✅ Datos confirmados.\n\nAhora presiona "Haz tu pedido en tiempo real" para continuar.');
  console.log('Datos simples guardados:', datosFormularioSimple);
}
