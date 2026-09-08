/* ========================================
   CONFIGURACIÓN Y DATOS - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// CONSTANTES Y CONFIGURACIÓN
// ========================================

// ========================================
// CONSTANTES DE LA CARTA
// ========================================
//
// Aquí vivía ADMIN_PASSWORD, y era un espejismo peligroso. Estaba escrita así:
//
//   const ADMIN_PASSWORD = typeof process !== 'undefined' && process.env.ADMIN_PASSWORD
//     ? process.env.ADMIN_PASSWORD
//     : localStorage.getItem('ADMIN_PASSWORD_TEMP') || 'default';
//
// `process` no existe en el navegador, así que la primera rama nunca se
// cumplía y la contraseña acababa siendo la cadena 'default'. Definirla en
// Netlify no cambiaba nada: esas variables solo llegan al servidor.
//
// El acceso lo gestiona ahora Netlify Identity en admin-panel.html, donde la
// contraseña se valida en el servidor y nunca baja al navegador. Cualquier
// contraseña escrita en un archivo .js es visible con F12; no hay forma de
// esconderla ahí.

// El número está a la vista en index.html a propósito, para que los clientes
// escriban. No es un secreto.
const WA_NUMERO = '573227364868';

const OSO_URL = "https://i.ibb.co/wZfBFDX9/1000864515-removebg-preview.png";
const DOMICILIO = 7000;

// ========================================
// ARRAYS DE PRODUCTOS ESPECIALES
// ========================================

const destacados = [
  "Bandeja Paisa'na",
  "Fettuccine Mar de Altura",
  "Churrasco Ranchero",
  "Picada Familiar (6 Personas)",
  "Picada (2 Personas)",
  "Ahumada del Galeras + Papas",
  "Mollejas Asadas"
];

const launchProducts = [
  "Trilogía de Mar",
  "Filete Apanado",
  "Filete a la Marinera",
  "Cazuela de Mariscos",
  "Cazuela de Camarón",
  "Fettuccine de Salmón"
];

// ========================================
// INFORMACIÓN DE CATEGORÍAS
// ========================================

const categoryInfo = {
  entradas: {
    title: "🍽️ ENTRADAS o PA' PICAR",
    desc: "Abre tu paladar con nuestras delicias crujientes y sabrosas",
    label: "Entradas",
    icon: "🍽️",
    type: "plato"
  },
  infantil: {
    title: "👶 MENÚ INFANTIL",
    desc: "Porciones perfectas para los más pequeños, llenas de sabor",
    label: "Infantil",
    icon: "👶",
    type: "plato"
  },
  diaria: {
    title: "📅 MENÚ DEL DÍA",
    desc: "La mejor opción diaria - Proteína, acompañamientos y postre",
    label: "Menú del Día",
    icon: "📅",
    type: "plato"
  },
  parrilla: {
    title: "🔥 PARRILLA",
    desc: "Lo mejor de la carne a la brasa - Jugosa, tierna y al punto",
    label: "Parrilla",
    icon: "🔥",
    type: "plato"
  },
  tipicos: {
    title: "🇨🇴 TÍPICOS COLOMBIANOS",
    desc: "Sabor tradicional que te transporta a lo mejor de Colombia",
    label: "Típicos",
    icon: "🇨🇴",
    type: "plato"
  },
  chuletas: {
    title: "🍖 CHULETAS",
    desc: "Chuletas gratinadas - Crujientes por fuera, jugosas por dentro",
    label: "Chuletas",
    icon: "🍖",
    type: "plato"
  },
  cimar: {
    title: "🌊 CI-MAR",
    desc: "Frescura del mar en cada bocado - Mariscos y truchas de primera",
    label: "CI-MAR",
    icon: "🌊",
    type: "plato"
  },
  pastas: {
    title: "🍝 PASTAS",
    desc: "Fettuccine exquisitas con salsas de autor",
    label: "Pastas",
    icon: "🍝",
    type: "plato"
  },
  salteados: {
    title: "🥘 SALTEADOS AL WOK",
    desc: "Trozos jugosos de carne salteados al wok con verduras frescas, ajonjolí, salsa de ostiones y salsa negra. Sobre cama de papas rústicas y maduro",
    label: "Salteados",
    icon: "🥘",
    type: "plato"
  },
  hamburguesas: {
    title: "🍔 HAMBURGUESAS",
    desc: "Hamburguesas artesanales con carne premium - Deliciosas y abundantes",
    label: "Hamburguesas",
    icon: "🍔",
    type: "plato"
  },
  ensaladas: {
    title: "🥗 ENSALADAS LA CIMA",
    desc: "Frescas, coloridas y nutritivas - Saludable sin sacrificar sabor",
    label: "Ensaladas",
    icon: "🥗",
    type: "plato"
  },
  postres: {
    title: "🍰 POSTRES",
    desc: "Dulces momentos para endulzar tu día",
    label: "Postres",
    icon: "🍰",
    type: "plato"
  },
  calientes: {
    title: "☕ BEBIDAS CALIENTES",
    desc: "Reconforta tu alma con nuestras bebidas calientes y acompañantes",
    label: "Calientes",
    icon: "☕",
    type: "plato"
  },
  frias: {
    title: "🧊 BEBIDAS FRÍAS",
    desc: "Refresca tu paladar - Opciones clásicas que nunca fallan",
    label: "Frías",
    icon: "🧊",
    type: "plato"
  },
  naturales: {
    title: "🧃 BEBIDAS NATURALES",
    desc: "Jugos naturales frescos - Frutas frescas cada día",
    label: "Naturales",
    icon: "🧃",
    type: "plato"
  },
  sodas: {
    title: "🥤 SODAS FRUTALES",
    desc: "Burbujas de sabor - Sodas artesanales con frutas tropicales",
    label: "Sodas",
    icon: "🥤",
    type: "plato"
  },
  licores: {
    title: "🍷 LICORES",
    desc: "Aguardientes, rones y whisky - Para celebrar con estilo",
    label: "Licores",
    type: "plato"
  },
  promos: {
    title: "🎊 PROMOS ESPECIALES",
    desc: "¡Ofertas irresistibles! No te las pierdas",
    label: "Promos",
    type: "plato"
  },
  eventos: {
    title: "🎉 CIMA EVENTOS",
    desc: "Paquetes personalizables para tus eventos especiales y reservas",
    label: "Eventos",
    type: "plato"
  },
  espacios: {
    title: "🏡 ESPACIOS LA CIMA",
    desc: "Conoce nuestros espacios únicos y acogedores para tu visita",
    label: "Espacios",
    type: "galeria",
    color: "espacios"
  },
  decoraciones: {
    title: "✨ DECORACIONES",
    desc: "La magia y creatividad que decora cada rincón de La Cima",
    label: "Decoraciones",
    type: "galeria",
    color: "deco"
  }
};

// ========================================
// MENÚ POR DEFECTO (DATOS INICIALES)
// ========================================
// ℹ️ El menú completo de 130+ productos se carga desde js/defaultMenu.js
// en la etiqueta <script> del index.html como window.defaultMenu
