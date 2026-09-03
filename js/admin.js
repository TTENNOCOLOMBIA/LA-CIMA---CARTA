/* ========================================
   ADMINISTRACIÓN - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// FUNCIONES DE ADMINISTRACIÓN
// ========================================

function toggleEditMode() {
  if (isPasswordVerified) {
    isPasswordVerified = false;
    document.querySelectorAll('.dish-actions, .gallery-actions').forEach(a => {
      a.style.display = 'none';
    });
    document.getElementById('editBar').classList.remove('active');
    document.getElementById('qrSection').classList.remove('active');
  } else {
    const p = prompt('Ingresa la contraseña de administrador:');

    if (p === ADMIN_PASSWORD) {
      isPasswordVerified = true;
      document.querySelectorAll('.dish-actions, .gallery-actions').forEach(a => {
        a.style.display = 'flex';
      });
      document.getElementById('editBar').classList.add('active');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (p !== null) {
      alert('Contraseña incorrecta');
    }
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
