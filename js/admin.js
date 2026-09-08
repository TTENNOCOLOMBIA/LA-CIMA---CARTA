/* ========================================
   ADMINISTRACIÓN - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// FUNCIONES DE ADMINISTRACIÓN
// ========================================

// El menú se administra en admin-panel.html, con login de Netlify Identity.
//
// Antes había aquí un "modo edición" dentro de la propia carta: pedía una
// contraseña por prompt() y la comparaba con ADMIN_PASSWORD de config.js.
// Esa constante nunca llegaba a valer nada (leía process.env, que no existe
// en el navegador) y acababa siendo la cadena 'default', así que bastaba
// escribir eso para activarlo.
//
// Además ya estaba roto: usaba un elemento #editBar que no existe en
// index.html, y sus cambios no salían del equipo porque no pasaban por
// Firebase. Con la sincronización arreglada, cualquier edición local se
// sobrescribe en cuanto responde la base.
//
// Se deja la función porque puede quedar alguna llamada suelta, pero ahora
// solo remite al panel, que es donde se administra de verdad.
function toggleEditMode() {
  if (confirm('El menú se administra desde el panel.\n\n¿Quieres ir allí ahora?')) {
    window.location.href = 'admin-panel.html';
  }
}

// ========================================
// FUNCIONES DEL QR
// ========================================

function toggleQR() {
  document.getElementById('qrSection').classList.toggle('active');

  if (document.getElementById('qrSection').classList.contains('active')) {
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), {
      text: 'https://cimarestaurante.netlify.app',
      width: 256,
      height: 256,
      colorDark: '#3d5a47',
      colorLight: '#FFD700'
    });
  }
}

function downloadQR() {
  const canvas = document.querySelector('#qrcode canvas');

  if (!canvas) {
    alert('Genera el QR primero');
    return;
  }

  const link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = 'La_Cima_Restaurante_QR.png';
  link.click();
}

// ========================================
// EVENTOS GLOBALES
// ========================================

window.addEventListener('scroll', function() {
  const btn = document.getElementById('topBtn');

  if (window.scrollY > 300) {
    btn.classList.add('show');
  } else {
    btn.classList.remove('show');
  }
});

// Trail de fuego en el cursor
document.addEventListener('mousemove', function(e) {
  const trail = document.createElement('div');
  trail.style.position = 'fixed';
  trail.style.left = e.clientX + 'px';
  trail.style.top = e.clientY + 'px';
  trail.style.width = '18px';
  trail.style.height = '18px';
  trail.style.borderRadius = '50%';
  trail.style.background = `radial-gradient(circle, #FFD700, #FF6B35)`;
  trail.style.pointerEvents = 'none';
  trail.style.zIndex = '9999';
  trail.style.animation = 'trailFade 0.6s ease-out forwards';
  document.body.appendChild(trail);

  setTimeout(() => trail.remove(), 600);
});
