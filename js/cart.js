/* ========================================
   LÓGICA DEL CARRITO - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================

// ✨ LIMPIAR CARRITO AL CARGAR - Cada cliente comienza vacío
let cart = [];
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem('lacimaCart');
    console.log('✨ Carrito limpiado en localStorage al inicializar');
  } catch (e) {
    console.warn('⚠️ No se pudo limpiar localStorage:', e);
  }
}

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

  // ✨ Marcar botón como agregado (AZUL) ✨
  marcarProductoEnCarrito(name);

  updateCartUI();
  openCart();
}

// Función para marcar producto como agregado al carrito
function marcarProductoEnCarrito(productName) {
  // Buscar botones "btn-cart" que correspondan a este producto
  const cartButtons = document.querySelectorAll('.btn-cart');

  cartButtons.forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';

    // Si el botón es para este producto específico
    if (onclick.includes(`'${productName}'`) || onclick.includes(`"${productName}"`)) {
      // Marcar como agregado
      btn.classList.add('btn-in-cart');

      // Cambiar estilo a AZUL
      btn.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)';
      btn.style.color = '#fff';
      btn.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.5)';

      // Cambiar texto
      btn.textContent = '✓ En carrito';

      // Opcionalmente, deshabilitar múltiples clics
      btn.style.cursor = 'default';
    }
  });
}

function updateCartUI() {
  // ✨ ORDEN INVERSO: Los últimos productos agregados aparecen primero
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

  // ✨ Mostrar últimos productos primero (orden inverso)
  const displayCart = [...cart].reverse();
  itemsList.innerHTML = displayCart.map((item, displayIdx) => {
    const actualIdx = cart.length - 1 - displayIdx; // Índice correcto en el array original
    return `<div class="cart-item"><div class="cart-item-name">${item.name}</div><div class="cart-item-qty"><button class="qty-btn" onclick="changeQty(${actualIdx}, -1)">−</button><span>${item.qty}</span><button class="qty-btn" onclick="changeQty(${actualIdx}, 1)">+</button></div><div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-CO')}</div><button class="cart-remove" onclick="removeFromCart(${actualIdx})">✕</button></div>`;
  }).join('');

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
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '999';

    // Scroll al top del modal para ver el resumen
    modal.scrollTop = 0;

    // Log para verificación
    console.log('✅ Carrito abierto - cliente puede ver su pedido');
  }
}

function closeCart() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
  }
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
    messageParts.push('*👤 DATOS DEL CLIENTE:*');
    messageParts.push(`Nombre: ${datosFormularioSimple.nombre}`);
    messageParts.push(`Teléfono: ${datosFormularioSimple.telefono}`);
    messageParts.push(`Dirección: ${datosFormularioSimple.calle}, ${datosFormularioSimple.barrio}`);
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
    alert('⚠️ Por favor completa los campos requeridos: Nombre, Teléfono, Dirección y Barrio');
    return;
  }

  // Guardar los datos
  datosFormularioSimple = {
    tipo: 'simple',
    nombre: nombre,
    telefono: telefono,
    calle: calle,
    barrio: barrio
  };

  alert('✅ Datos confirmados.\n\nAhora presiona "Haz tu pedido en tiempo real" para continuar.');
  console.log('Datos confirmados:', datosFormularioSimple);
}

// ========================================
// ENVÍO DE PEDIDO EN TIEMPO REAL - FUNCIÓN PRINCIPAL
// ========================================

function sendRealTimeOrder() {
  // 1. VALIDAR que hay carrito
  if (cart.length === 0) {
    alert('⚠️ Tu carrito está vacío. Agrega productos antes de hacer un pedido.');
    return;
  }

  // 2. VALIDAR que cliente completó datos básicos
  const nombre = document.getElementById('customerName').value.trim();
  const telefono = document.getElementById('customerPhone').value.trim();
  const calle = document.getElementById('customerStreet').value.trim();
  const barrio = document.getElementById('customerBarrio').value.trim();

  if (!nombre || !telefono || !calle || !barrio) {
    alert('⚠️ Por favor completa todos tus datos: Nombre, Teléfono, Dirección y Barrio');
    return;
  }

  // 3. SI NO HAY FACTURA, GUARDAR AUTOMÁTICAMENTE DATOS SIMPLES
  if (!datosFacturacion && !datosFormularioSimple) {
    datosFormularioSimple = {
      tipo: 'simple',
      nombre: nombre,
      telefono: telefono,
      calle: calle,
      barrio: barrio
    };
  }

  // 4. OBTENER ubicación con Google Maps (simulado por ahora, puedes integrar API real después)
  const ubicacion = `${calle}, ${barrio}, Ipiales, Nariño`;

  // 5. CONSTRUIR MENSAJE COMPLETO
  const subtotal = getSubtotal();
  const descuento = getTotalDiscount();
  const subtotalConDescuento = subtotal - descuento;
  const total = subtotalConDescuento + DOMICILIO;

  // Productos
  let productsList = cart.map(i =>
    `• ${i.name} x${i.qty} = $${(i.price * i.qty).toLocaleString('es-CO')}`
  ).join('\n');

  // Construir el mensaje
  let messageParts = [
    '*🚀 PEDIDO EN TIEMPO REAL - LA CIMA RESTAURANTE*',
    '',
    '*📦 PRODUCTOS:*'
  ];

  messageParts.push(productsList);
  messageParts.push('');
  messageParts.push('*💰 TOTALES:*');
  messageParts.push('Subtotal: $' + subtotal.toLocaleString('es-CO'));

  if (descuento > 0) {
    messageParts.push((appliedCoupon ? appliedCoupon.description : 'Descuento') + ': -$' + descuento.toLocaleString('es-CO'));
  }

  messageParts.push('Domicilio: $' + DOMICILIO.toLocaleString('es-CO'));
  messageParts.push('─────────────────────');
  messageParts.push('*TOTAL A PAGAR: $' + total.toLocaleString('es-CO') + '*');
  messageParts.push('');

  // Datos del cliente
  messageParts.push('*👤 DATOS DEL CLIENTE:*');
  messageParts.push('Nombre: ' + nombre);
  messageParts.push('Teléfono: ' + telefono);
  messageParts.push('Dirección: ' + ubicacion);
  messageParts.push('');

  // Datos de factura (si aplica)
  if (datosFacturacion) {
    messageParts.push('*📄 FACTURA ELECTRÓNICA:*');
    messageParts.push('Tipo Doc: ' + (datosFacturacion.tipoDoc === 'cc' ? 'Cédula' : 'NIT'));
    messageParts.push('Documento: ' + datosFacturacion.numeroDoc);
    messageParts.push('Nombre: ' + datosFacturacion.nombre);
    messageParts.push('Correo: ' + datosFacturacion.correo);
    messageParts.push('Teléfono: ' + datosFacturacion.telefono);
    messageParts.push('Responsabilidad: ' + datosFacturacion.responsabilidad);
    messageParts.push('Tributaria: ' + datosFacturacion.tributaria);
    messageParts.push('');
  }

  messageParts.push('*📍 UBICACIÓN EN MAPS:*');
  messageParts.push('https://maps.google.com/?q=' + encodeURIComponent(ubicacion));
  messageParts.push('');
  messageParts.push('─────────────────────');
  messageParts.push('⏰ Pedido realizado: ' + new Date().toLocaleString('es-CO'));

  const message = messageParts.join('\n');

  // 6. GUARDAR pedido localmente
  const orderData = {
    customer: datosFormularioSimple || datosFacturacion,
    products: cart,
    totals: {
      original: subtotal,
      discount: descuento,
      delivery: DOMICILIO,
      final: total
    },
    coupon: appliedCoupon ? appliedCoupon.code : null,
    location: ubicacion,
    timestamp: new Date().toISOString()
  };

  sendOrderToGoogleSheets(orderData);

  // 7. ENVIAR al WhatsApp del número de domicilios
  const wa_url = `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(message)}`;
  window.open(wa_url, '_blank');

  // 8. CONFIRMAR y LIMPIAR
  alert('✅ ¡Pedido enviado! Revisa tu WhatsApp para confirmar.\n\nEl restaurante te contactará en breve.');

  // Limpiar
  cart = [];
  datosFacturacion = null;
  datosFormularioSimple = null;
  appliedCoupon = null;
  updateCartUI();
  clearCartFromStorage();
  closeCart();
}
