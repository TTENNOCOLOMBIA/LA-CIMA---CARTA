/* ========================================
   FAVORITOS - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// FUNCIONES DE UI DE FAVORITOS
// ========================================

function toggleFavorite(dishName, event) {
  event.stopPropagation();

  if (isFavorite(dishName)) {
    removeFromFavorites(dishName);
  } else {
    addToFavorites(dishName, currentCategory);
  }

  // Actualizar UI
  updateFavoriteButtons(dishName);
}

function updateFavoriteButtons(dishName) {
  const buttons = document.querySelectorAll('[data-favorite-btn="' + dishName + '"]');
  const isFav = isFavorite(dishName);

  buttons.forEach(btn => {
    if (isFav) {
      btn.classList.add('favorited');
      btn.innerHTML = '❤️ Agregado a favoritos';
    } else {
      btn.classList.remove('favorited');
      btn.innerHTML = '🤍 Agregar a favoritos';
    }
  });
}

function showFavorites() {
  const favorites = getFavorites();

  if (favorites.length === 0) {
    alert('No tienes favoritos aún. ¡Agrega platos para verlos aquí!');
    return;
  }

  currentCategory = 'favorites';
  const c = document.getElementById('menuContainer');
  c.innerHTML = '';

  c.innerHTML = '<h2 class="category-title regular"><span>❤️ Mis Favoritos</span>' + osoHTML() + '</h2><div class="category-count">' + favorites.length + ' plato' + (favorites.length === 1 ? '' : 's') + '</div>';

  const grid = document.createElement('div');
  grid.className = 'menu-grid';

  favorites.forEach(fav => {
    // Buscar el plato en el menú
    let dish = null;
    let catKey = fav.category;

    if (menu[catKey]) {
      dish = menu[catKey].find(d => d.name === fav.name);
    }

    if (dish) {
      let index = menu[catKey].indexOf(dish);
      grid.innerHTML += cardHTML(catKey, dish, index);
    }
  });

  c.appendChild(grid);
  revealCards();
}

function clearAllFavorites() {
  if (confirm('¿Eliminar todos los favoritos?')) {
    localStorage.removeItem('lacimaFavorites');
    alert('Favoritos eliminados');
    showFavorites();
  }
}
