/* ========================================
   LÓGICA DEL CARRITO - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================

// ✨ LIMPIAR CARRITO AL CARGAR - Cada cliente comienza vacío
let cart = [];

// Variable para manejar notas personalizadas
let currentProductForNotes = null;
let tempNotes = '';

// ========================================
// FUNCIÓN PARA ABRIR WHATSAPP SIN POPUP
// ========================================
function abrirWhatsAppDirecto(numero, mensaje) {
  // Detectar si es móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Móvil: usar esquema whatsapp:// para abrir directo sin popup
    const wa_url = `whatsapp://send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
    window.location.href = wa_url;
  } else {
    // Desktop: usar wa.me que abre WhatsApp Web
    const wa_url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    window.open(wa_url, '_blank');
  }
}
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

function addToCart(name, price, category = '', icon = '') {
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
      qty: 1,
      category: category || getDefaultCategory(name),
      icon: icon || getDefaultIcon(name),
      notes: ''
    });
  }

  // ✨ Marcar botón como agregado (AZUL) ✨
  marcarProductoEnCarrito(name);

  updateCartUI();
  openCart();
}

// Función auxiliar para obtener categoría por defecto basada en el nombre
function getDefaultCategory(name) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('pechuga') || nameLower.includes('cerdo') || nameLower.includes('pollo')) return 'parrilla';
  if (nameLower.includes('arepa') || nameLower.includes('empanada') || nameLower.includes('bandeja')) return 'entradas';
  if (nameLower.includes('sopa') || nameLower.includes('caldo')) return 'sopas';
  return 'menu';
}

// Función auxiliar para obtener icono por defecto
function getDefaultIcon(name) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('pechuga') || nameLower.includes('cerdo')) return '🔥';
  if (nameLower.includes('sopa')) return '🍲';
  if (nameLower.includes('arepa') || nameLower.includes('empanada')) return '🥟';
  if (nameLower.includes('postre') || nameLower.includes('dulce')) return '🍰';
  if (nameLower.includes('bebida') || nameLower.includes('jugo')) return '🥤';
  return '🍽️';
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
    const icon = item.icon || '🍽️';
    const unitPrice = item.price;
    const totalPrice = item.price * item.qty;
    const hasNotes = item.notes && item.notes.trim().length > 0;
    const notesDisplay = hasNotes ? `
      <div class="cart-item-notes">
        <div class="notes-label">📝 Notas:</div>
        <div class="notes-text">${item.notes}</div>
        <button class="edit-notes-btn" onclick="openNotesModal('${item.name.replace(/'/g, "\\'")}')" title="Editar notas">✏️ Editar</button>
      </div>
    ` : `
      <button class="add-notes-btn" onclick="openNotesModal('${item.name.replace(/'/g, "\\'")}')" title="Agregar notas">📝 Agregar notas</button>
    `;

    return `
      <div class="cart-item">
        <div class="cart-item-header">
          <span class="cart-item-icon">${icon}</span>
          <div class="cart-item-name">${item.name}</div>
        </div>
        <div class="cart-item-details">
          <div class="cart-item-unit-price">$${unitPrice.toLocaleString('es-CO')} c/u</div>
          <div class="cart-item-qty">
            <button class="qty-btn qty-minus" onclick="changeQty(${actualIdx}, -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn qty-plus" onclick="changeQty(${actualIdx}, 1)">+</button>
          </div>
          <div class="cart-item-total">
            <span class="cart-item-total-label">Total:</span>
            <span class="cart-item-total-price">$${totalPrice.toLocaleString('es-CO')}</span>
          </div>
        </div>
        ${notesDisplay}
        <button class="cart-remove" onclick="removeFromCart(${actualIdx})">✕</button>
      </div>
    `;
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

  let productsList = cart.map(i => {
    let line = `- ${i.name} x${i.qty} = $${(i.price * i.qty).toLocaleString('es-CO')}`;
    if (i.notes && i.notes.trim().length > 0) {
      line += `\n  📝 Notas: ${i.notes}`;
    }
    return line;
  }).join('\n');

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

  // Abrir WhatsApp sin popup molesto (directo en móvil, web en desktop)
  abrirWhatsAppDirecto(WA_NUMERO, message);

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

  // 3. INTENTAR GUARDAR FACTURA SI ESTÁ ABIERTA (aunque no haya guardado explícitamente)
  if (!datosFacturacion) {
    const formularioFactura = document.getElementById('formularioFactura');
    if (formularioFactura && formularioFactura.style.display !== 'none') {
      // Formulario de factura está abierto - intentar guardar
      const tipoDoc = document.getElementById('tipoDoc')?.value;
      const numeroDoc = document.getElementById('numeroDoc')?.value;
      const nombreFactura = document.getElementById('nombreFactura')?.value;
      const correo = document.getElementById('correoFactura')?.value;
      const telefonoFactura = document.getElementById('telefonoFactura')?.value;
      const responsabilidad = document.getElementById('responsabilidad')?.value;
      const tributaria = document.getElementById('tributaria')?.value;

      // Si hay datos, guardarlos automáticamente
      if (tipoDoc && numeroDoc && nombreFactura && correo && telefonoFactura && responsabilidad && tributaria) {
        datosFacturacion = {
          tipo: 'factura',
          tipoDoc,
          numeroDoc,
          nombre: nombreFactura,
          correo,
          telefono: telefonoFactura,
          responsabilidad,
          tributaria
        };
      }
    }
  }

  // 4. SI NO HAY FACTURA, GUARDAR AUTOMÁTICAMENTE DATOS SIMPLES
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

  // 7. ENVIAR al WhatsApp del número de domicilios (sin popup molesto)
  abrirWhatsAppDirecto(WA_NUMERO, message);

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

// ========================================
// FUNCIONES DE NOTAS PERSONALIZADAS
// ========================================

function openNotesModal(productName) {
  const modal = document.getElementById('notesModal');
  const titleEl = document.getElementById('notesModalTitle');
  const infoEl = document.getElementById('productNameInfo');
  const textarea = document.getElementById('notesTextarea');
  
  // Buscar el producto en el carrito para obtener su información
  const cartItem = cart.find(i => i.name === productName);
  
  if (cartItem) {
    titleEl.textContent = '📝 Personalizar: ' + productName;
    infoEl.innerHTML = '<div class="product-info-badge"><span class="product-icon">' + cartItem.icon + '</span><span class="product-name">' + productName + '</span></div>';
    textarea.value = cartItem.notes || '';
    currentProductForNotes = cartItem;
    tempNotes = cartItem.notes || '';
  }
  
  updateNotesCounter();
  modal.classList.add('active');
  modal.style.display = 'flex';
  modal.style.visibility = 'visible';
  modal.style.opacity = '1';
  textarea.focus();
}

function closeNotesModal() {
  const modal = document.getElementById('notesModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  modal.style.visibility = 'hidden';
  modal.style.opacity = '0';
  currentProductForNotes = null;
  tempNotes = '';
}

function updateNotesCounter() {
  const textarea = document.getElementById('notesTextarea');
  const counter = document.getElementById('notesCounter');
  counter.textContent = textarea.value.length;
}

function saveNotes() {
  const textarea = document.getElementById('notesTextarea');
  const notes = textarea.value.trim();
  
  if (currentProductForNotes) {
    currentProductForNotes.notes = notes;
    updateCartUI();
    saveCartToStorage();
    closeNotesModal();
  }
}

// Event listener para el contador de caracteres
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('notesTextarea');
  if (textarea) {
    textarea.addEventListener('input', updateNotesCounter);
  }
});
