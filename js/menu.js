/* ========================================
   LÓGICA DEL MENÚ - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// VARIABLES GLOBALES
// ========================================

let menu = JSON.parse(localStorage.getItem('lacimaMenuV2')) || JSON.parse(JSON.stringify(defaultMenu));
let editingId = null;
let isPasswordVerified = false;
let currentCategory = 'all';

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

function osoHTML() {
  return '<img src="' + OSO_URL + '" alt="Oso La Cima" class="title-oso">';
}

function openImageModal(imgSrc) {
  document.getElementById('imageModalImg').src = imgSrc;
  document.getElementById('imageModal').classList.add('active');
}

function closeImageModal() {
  document.getElementById('imageModal').classList.remove('active');
}

// Cerrar modal de imagen al hacer click fuera
document.getElementById('imageModal').addEventListener('click', function(e) {
  if (e.target === this) closeImageModal();
});

// ========================================
// CONSTRUCCIÓN DE FILTROS
// ========================================

function buildFilters() {
  const f = document.getElementById('filters');
  f.innerHTML = '';
  const keys = Object.keys(categoryInfo);
  keys.forEach((k, idx) => {
    const count = (menu[k] && menu[k].length) ? menu[k].length : 0;
    const icon = categoryInfo[k].icon || '🍽️';
    const badgeClass = count === 0 ? ' disabled' : '';
    f.innerHTML += '<button class="filter-btn' + (idx === 0 ? ' active' : '') + badgeClass + '" onclick="filterMenu(\'' + k + '\',this)"><span class="icon">' + icon + '</span> <span class="label">' + categoryInfo[k].label + '</span> <span class="badge">' + count + '</span></button>';
  });
}

// ========================================
// CONSTRUCCIÓN DE SELECT
// ========================================

function buildSelect() {
  const s = document.getElementById('dishCategory');
  s.innerHTML = '';
  Object.keys(categoryInfo).forEach(k => {
    s.innerHTML += '<option value="' + k + '">' + categoryInfo[k].label + '</option>';
  });
}

// ========================================
// ANIMACIÓN DE CARDS AL SCROLL
// ========================================

function revealCards() {
  const cards = document.querySelectorAll('.dish-card:not(.show),.gallery-card:not(.show)');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en, idx) => {
      if (en.isIntersecting) {
        en.target.style.animationDelay = (idx % 6 * 0.08) + 's';
        en.target.classList.add('show');
        obs.unobserve(en.target);
      }
    });
  }, {
    threshold: 0.1
  });
  cards.forEach(c => obs.observe(c));
}

// ========================================
// RENDERIZACIÓN DE CARDS
// ========================================

function getRatingStars(productName, baseRating = 4.5) {
  // Generar un rating consistente basado en el nombre del producto
  const hash = productName.charCodeAt(0) % 5;
  const rating = [4.8, 4.7, 4.9, 4.6, 4.5][hash];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';
  for (let i = 0; i < fullStars; i++) stars += '⭐';
  if (hasHalfStar) stars += '✨';
  return { stars: stars, rating: rating };
}

function cardHTML(cat, d, i) {
  const esDestacado = destacados.includes(d.name);
  const esLanzamiento = launchProducts.includes(d.name);
  const imgStyle = d.img ? 'style="background-image:url(\'' + d.img + '\')"' : '';
  const noimgClass = d.img ? '' : ' noimg';
  const placeholder = d.img ? '' : '<div class="dish-image-placeholder">[ESPACIO PARA FOTO]</div>';
  const icono = d.img ? '' : (d.icon || '🍽️');
  const clickFoto = d.img ? 'onclick="openImageModal(\'' + d.img + '\')"' : '';
  const btnDisabled = d.price === 0 ? 'disabled' : '';
  const btnText = d.price === 0 ? '⏳ Precio por definir' : '🛒 Agregar al Carrito';

  let priceHtml = '';
  if (d.price === 0) {
    priceHtml = '<div class="dish-price no-price">Consultá el precio</div>';
  } else if (esLanzamiento && d.launchPrice) {
    priceHtml = '<div class="price-container"><span class="price-normal">$' + d.launchPrice.toLocaleString('es-CO') + '</span><span class="price-launch">$' + d.price.toLocaleString('es-CO') + ' COP</span></div>';
  } else {
    priceHtml = '<div class="dish-price">$' + d.price.toLocaleString('es-CO') + ' <small>COP</small></div>';
  }

  const badge = esLanzamiento ? '<div class="badge-launch">🎊 LANZAMIENTO -10%</div>' : (esDestacado ? '<div class="badge-star">⭐ El más pedido</div>' : '');
  const cardClass = 'dish-card' + (esLanzamiento ? ' lanzamiento' : '') + (esDestacado ? ' destacado' : '');

  // Escapar comillas en el nombre del producto
  const safeProductName = d.name.replace(/'/g, "\\'");
  const safeCat = cat.replace(/'/g, "\\'");

  // Agregar rating
  const ratingData = getRatingStars(d.name);
  const ratingHtml = '<div class="dish-rating"><div class="stars">' + ratingData.stars + '</div><div class="rating-value">' + ratingData.rating.toFixed(1) + '</div></div>';

  return '<div class="' + cardClass + '">' + badge + '<div class="dish-image' + noimgClass + '" ' + imgStyle + ' ' + clickFoto + '>' + icono + placeholder + '</div><div class="dish-content"><div class="dish-name">' + d.name + '</div><div class="dish-description">' + d.desc + '</div>' + ratingHtml + priceHtml + '<div class="dish-buttons"><button class="btn-cart btn-cart-animate" ' + btnDisabled + ' onclick="addToCart(\'' + safeProductName + '\', ' + d.price + ')">' + btnText + '</button></div><div class="dish-actions" style="display:none"><button class="edit-btn" onclick="editItem(\'' + safeCat + '\',' + i + ')">✏️ Editar</button><button class="delete-btn" onclick="deleteItem(\'' + safeCat + '\',' + i + ')">🗑️ Borrar</button></div></div></div>';
}

function galleryHTML(cat, d, i) {
  const colorClass = categoryInfo[cat].color;
  const imgStyle = d.img ? 'style="background-image:url(\'' + d.img + '\')"' : '';
  const placeholder = d.img ? '' : '📷';
  const clickFoto = d.img ? 'onclick="openImageModal(\'' + d.img + '\')"' : '';
  const videoBtn = d.video ? '<a href="' + d.video + '" target="_blank" class="video-btn">▶️ Ver Video</a>' : '';
  const orderBtn = (d.price) ? '<a class="order-btn" href="https://wa.me/' + WA_NUMERO + '?text=Quiero%20contratar%20' + encodeURIComponent(d.name) + ' - $' + d.price.toLocaleString('es-CO') + '" target="_blank">💬 Solicitar</a>' : '';

  return '<div class="gallery-card ' + colorClass + '" style="opacity:0"><div class="gallery-image" ' + imgStyle + ' ' + clickFoto + '>' + placeholder + '</div><div class="gallery-content"><div class="gallery-name">' + d.name + '</div>' + (d.desc ? '<div class="gallery-desc">' + d.desc + '</div>' : '') + (d.price ? '<div class="gallery-price">$' + d.price.toLocaleString('es-CO') + ' <small>COP</small></div>' : '') + '<div class="gallery-actions" style="display:none"><button class="edit-btn" onclick="editItem(\'' + cat + '\',' + i + ')">✏️ Editar</button><button class="delete-btn" onclick="deleteItem(\'' + cat + '\',' + i + ')">🗑️ Borrar</button></div>' + videoBtn + orderBtn + '</div></div>';
}

// ========================================
// RENDERIZACIÓN DEL MENÚ
// ========================================

function renderMenu(category) {
  currentCategory = category;
  document.getElementById('searchBox').value = '';
  const c = document.getElementById('menuContainer');
  c.innerHTML = '';

  const cats = (category === 'all') ? Object.keys(categoryInfo) : [category];

  cats.forEach(cat => {
    if (!menu[cat] || menu[cat].length === 0) return;

    const info = categoryInfo[cat];
    const n = menu[cat].length;
    const isGaleria = info.type === 'galeria';
    const titleClass = isGaleria ? (' ' + info.color + '-title') : ' regular';

    c.innerHTML += '<h2 class="category-title' + titleClass + '"><span>' + info.title + '</span>' + osoHTML() + '</h2><div class="category-count">' + n + ' ' + (n === 1 ? 'opción' : 'opciones') + '</div>';

    if (!isGaleria) c.innerHTML += '<p class="category-description">' + info.desc + '</p>';

    const grid = document.createElement('div');
    grid.className = isGaleria ? 'gallery-grid' : 'menu-grid';

    menu[cat].forEach((d, i) => {
      grid.innerHTML += isGaleria ? galleryHTML(cat, d, i) : cardHTML(cat, d, i);
    });

    c.appendChild(grid);
  });

  revealCards();

  if (isPasswordVerified) {
    document.querySelectorAll('.dish-actions, .gallery-actions').forEach(a => {
      a.style.display = 'flex';
    });
  }

  // ✨ SCROLL AUTOMÁTICO suave hacia los productos
  setTimeout(() => {
    c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// ========================================
// BÚSQUEDA
// ========================================

function searchDishes(term) {
  term = term.trim().toLowerCase();

  if (term === '') {
    renderMenu(currentCategory);
    return;
  }

  const c = document.getElementById('menuContainer');
  c.innerHTML = '';
  let encontrados = [];

  Object.keys(menu).forEach(cat => {
    if (categoryInfo[cat].type === 'galeria') return;

    menu[cat].forEach((d, i) => {
      if (d.name.toLowerCase().includes(term) || d.desc.toLowerCase().includes(term)) {
        encontrados.push({
          cat: cat,
          d: d,
          i: i
        });
      }
    });
  });

  if (encontrados.length === 0) {
    c.innerHTML = '<div class="no-results">😔 No encontramos platos con "' + term + '".<br>Intenta con otra palabra.</div>';
    return;
  }

  c.innerHTML = '<h2 class="category-title regular"><span>🔍 Resultados</span>' + osoHTML() + '</h2><div class="category-count">' + encontrados.length + ' ' + (encontrados.length === 1 ? 'plato encontrado' : 'platos encontrados') + '</div>';

  const grid = document.createElement('div');
  grid.className = 'menu-grid';

  encontrados.forEach(o => {
    grid.innerHTML += cardHTML(o.cat, o.d, o.i);
  });

  c.appendChild(grid);
  revealCards();

  if (isPasswordVerified) {
    document.querySelectorAll('.dish-actions').forEach(a => {
      a.style.display = 'flex';
    });
  }
}

// ========================================
// FILTROS
// ========================================

function filterMenu(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMenu(cat);
}

// ========================================
// ADMINISTRACIÓN DE MENÚ (CRUD)
// ========================================

function addDish() {
  if (!isPasswordVerified) {
    alert('Necesitas modo edición');
    return;
  }

  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo Plato';
  document.getElementById('dishForm').reset();
  document.getElementById('editModal').classList.add('active');
  buildSelect();
}

function editItem(cat, i) {
  editingId = {
    category: cat,
    index: i
  };

  const d = menu[cat][i];
  document.getElementById('modalTitle').textContent = 'Editar ' + d.name;
  document.getElementById('dishName').value = d.name;
  document.getElementById('dishDescription').value = d.desc || '';
  document.getElementById('dishPrice').value = d.price || '';
  document.getElementById('dishImage').value = d.img || '';
  document.getElementById('dishVideo').value = d.video || '';
  document.getElementById('dishCategory').value = cat;

  buildSelect();
  document.getElementById('editModal').classList.add('active');
}

function deleteItem(cat, i) {
  if (!confirm('¿Eliminar este plato?')) return;

  menu[cat].splice(i, 1);
  localStorage.setItem('lacimaMenuV2', JSON.stringify(menu));
  renderMenu(currentCategory);
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
}

// Guardar plato
document.getElementById('dishForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const pwd = document.getElementById('password').value;
  if (pwd !== ADMIN_PASSWORD) {
    alert('Contraseña incorrecta');
    return;
  }

  const name = document.getElementById('dishName').value;
  const desc = document.getElementById('dishDescription').value;
  const price = parseInt(document.getElementById('dishPrice').value) || 0;
  const img = document.getElementById('dishImage').value;
  const video = document.getElementById('dishVideo').value;
  const cat = document.getElementById('dishCategory').value;

  if (!name) {
    alert('Falta el nombre');
    return;
  }

  if (editingId) {
    menu[editingId.category][editingId.index] = {
      ...menu[editingId.category][editingId.index],
      name,
      desc,
      price,
      img,
      video
    };
  } else {
    if (!menu[cat]) menu[cat] = [];
    menu[cat].push({
      name,
      desc,
      price,
      icon: '🍽️',
      img,
      video
    });
  }

  localStorage.setItem('lacimaMenuV2', JSON.stringify(menu));
  renderMenu(currentCategory);
  closeModal();
});

// Restaurar menú
function resetMenu() {
  if (!confirm('¿Restaurar menú original? Se perderán los cambios.')) return;

  localStorage.removeItem('lacimaMenuV2');
  menu = JSON.parse(JSON.stringify(defaultMenu));
  renderMenu('all');
  alert('Menú restaurado');
}
