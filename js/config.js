/* ========================================
   CONFIGURACIÓN Y DATOS - LA CIMA RESTAURANTE
   ======================================== */

// ========================================
// CONSTANTES Y CONFIGURACIÓN
// ========================================

// ========================================
// CONFIGURACIÓN SEGURA - VARIABLES DE ENTORNO
// ========================================
// Nota: En desarrollo, estos valores vienen de .env
// En Netlify, se configuran en Environment Variables

// ⚠️ ESTOS VALORES NO DEBEN ESTAR HARDCODEADOS EN PRODUCCIÓN
// Se cargan desde variables de entorno del servidor

const ADMIN_PASSWORD = typeof process !== 'undefined' && process.env.ADMIN_PASSWORD
  ? process.env.ADMIN_PASSWORD
  : localStorage.getItem('ADMIN_PASSWORD_TEMP') || 'default';

const WA_NUMERO = typeof process !== 'undefined' && process.env.WHATSAPP_NUMBER
  ? process.env.WHATSAPP_NUMBER
  : '573227364868';  // ⚠️ Se debe leer de servidor en producción

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

const defaultMenu = {
  entradas: [
    {
      name: "Mollejas Asadas",
      desc: "150 a 175g de molleja asada a la parrilla jugosas y suebes, acompañada de papa criolla, maduro y con una deliciosa salsa casera",
      price: 15000,
      icon: "🍖",
      img: "https://i.ibb.co/1YxPcdMb/file-000000007ed4820eb0189088baa97d5e.png"
    },
    {
      name: "Chunchullo",
      desc: "Intestino delgado de res frito lentamente al punto de oro perfecto. Crujiente y crocante por fuera, tierno y jugoso por dentro. Servido con papa frita criolla recién hervida, salsas caseras y limón fresco que despierta cada bocado",
      price: 18000,
      icon: "🍢",
      img: "https://i.ibb.co/27Mk67t0/file-000000002130820eacb5b31afd0a8204.png"
    },
    {
      name: "Chorizo pa' Picar",
      desc: "Chorizo de cerdo artesanal, ahumado al barril con especias caseras, asado a la parrilla al punto. Acompañado de papa dorada, arepa caliente, queso fresco derretido, limón ácido y nuestras salsas especiales. El clásico para abrir apetito",
      price: 12000,
      icon: "🌭",
      img: "https://i.ibb.co/hxQFgVJD/file-000000004a34820ea95eabcdf123ae7a.png"
    },
    {
      name: "Empanadas x4",
      desc: "Cuatro empanadas crocantes de masa dorada y esponjosa, rellenas de queso con bocadillo de guayaba. Fritas al momento hasta crujía perfecta: tiernas y jugosas por dentro, doradas y crocantes por fuera",
      price: 8500,
      icon: "🥟",
      img: "https://i.ibb.co/d0cbFHH9/file-00000000f328820e99ec5ee4e42cfde5.png"
    },
    {
      name: "Palitos de Queso x4",
      desc: "Cuatro palitos que explotan en el paladar: queso derretido y cremoso envuelto en masa crocante dorada. Tiernos adentro, crujientes en cada mordida. Acompañante irresistible que abre apetito y conquista cualquier mesa",
      price: 8500,
      icon: "🧀",
      img: "https://i.ibb.co/Hpgfy0P8/file-00000000a630820ebf35c713800abcbd.png"
    }
  ],
  infantil: [
    {
      name: "PapiCono La Cima - Ranchera",
      desc: "Divertido cono de papas doradas con chorizo ahumado de cerdo, bañado en aguapanela y nuestras salsas. El favorito de los pequeños",
      price: 14000,
      icon: "🌭",
      img: "https://i.ibb.co/ccZJw4Pt/file-00000000f2f0820ea409edd555f465e4.png"
    },
    {
      name: "PapiCono La Cima - Alitas",
      desc: "Cono de papas crujientes coronado con alitas broaster doradas y salsas a elección. Diversión y sabor en cada bocado",
      price: 16000,
      icon: "🍗",
      img: "https://i.ibb.co/HTNv2vgd/file-000000006f20820eaa357fd96d3b0b88.png"
    }
  ],
  diaria: [
    {
      name: "Menú del día LA CIMA - Chuleta de Cerdo",
      desc: "Deliciosa sopa del día, chuleta de cerdo, arroz, ensalada fresca, papa y plátano. Incluye jugo natural y postre",
      price: 23000,
      icon: "🍲",
      img: "https://i.ibb.co/wNHnG43m/file-000000000b00820ea43061530b6f0cab.png"
    },
    {
      name: "Menú del día LA CIMA - Bagre",
      desc: "Deliciosa sopa del día, bagre fresco, arroz, ensalada fresca, papa y plátano. Incluye jugo natural y postre",
      price: 23000,
      icon: "🐟",
      img: "https://i.ibb.co/8L4641sZ/file-00000000688c820e9571dea06db06bf9.png"
    }
  ],
  parrilla: [
    {
      name: "Churrasco Ranchero",
      desc: "Jugoso corte de res a la parrilla coronado con queso fundido y huevo, acompañado de chorizo, maduro, papa, ensalada fresca y nuestras salsas de la casa",
      price: 39500,
      icon: "🥩",
      img: "https://i.ibb.co/MxgxV3NY/file-00000000d570820e9705c56c8dad4064.png"
    },
    {
      name: "Cerdo a La Parrilla Gratinado",
      desc: "Tierno cerdo asado a la parrilla y gratinado con queso fundido, servido con papa, yuca, ensalada fresca y salsas",
      price: 34000,
      icon: "🐖",
      img: "https://i.ibb.co/gZD1K6Dw/file-00000000bb48820e9e1ae117cc035623.png"
    }
  ],
  tipicos: [
    {
      name: "Bandeja Paisa'na",
      desc: "La tradición en su máxima expresión: fríjoles, carne de res, chicharrón crocante, chorizo, morcilla, huevo, aguacate, maduro, arroz, arepa y papa. Abundante y auténtica",
      price: 39000,
      icon: "🍛",
      img: "https://i.ibb.co/B55m8ybQ/file-0000000079d4820e911cd8c85a8ec0b5.png"
    },
    {
      name: "Fritada",
      desc: "Generosa porción de cerdo frito y jugoso, acompañado de papa y crispetas doradas. Sabor casero de verdad",
      price: 22000,
      icon: "🥘",
      img: "https://i.ibb.co/dJPX3DBK/file-00000000c120820ea90f9fcc068468f7.png"
    }
  ],
  chuletas: [
    {
      name: "Chuleta De Cerdo",
      desc: "Crujiente chuleta de cerdo apanada y gratinada con queso, coronada con huevo, servida con papa, ensalada fresca y salsas",
      price: 35000,
      icon: "🐖",
      img: "https://i.ibb.co/d0WX17CB/file-000000004228820e9be6c5588a84464a.png"
    }
  ],
  cimar: [
    {
      name: "Coctel de Camarones",
      desc: "Frescos camarones 200-250g marinados en jugo de limón con hierbas aromáticas, bañados en nuestra salsa especial de la casa. Acompañados de crocantes chips de plátano casero",
      price: 25000,
      icon: "🍤",
      img: "https://i.ibb.co/HLSYb3Kh/file-00000000fb74820ebfcb7255c20a70c1.png"
    },
    {
      name: "Trilogía de Mar",
      desc: "Nuestra experiencia gastronómica del mar en tres niveles: filete de pescado apanado 350-400g, mixtura de mariscos 200g (camarón 120g), servidos en tres pisos con patacones crocantes, arroz, vegetales a la parrilla, ensalada fresca y deliciosa salsa de la casa",
      price: 49500,
      launchPrice: 55000,
      icon: "🍤",
      img: "https://i.ibb.co/kdY49vj/file-00000000d1e8820e819578c47ad20732.png"
    },
    {
      name: "Fettuccine de Salmón",
      desc: "Fettuccine en cremosa salsa al ajillo y mantequilla, coronado con tomate, pimentón asado y un sabor algo cítrico. Con tostaditas crocantes",
      price: 49500,
      launchPrice: 55000,
      icon: "🐟",
      img: "https://i.ibb.co/bj79QZjK/file-000000002d74820eba7b6606e923b32d.png"
    }
  ],
  pastas: [
    {
      name: "Fettuccine Suprema de Pollo",
      desc: "Fettuccine envuelto en una cremosa emulsión de ajillo y mantequilla, con tiernos bocados de pechuga sellados a la perfección. Servido con tostaditas crocantes",
      price: 30000,
      icon: "🍝",
      img: "https://i.ibb.co/3yhkyZLT/file-00000000a758820e823d10158ae9a379.png"
    },
    {
      name: "Fettuccine Mar de Altura",
      desc: "Nuestra pasta más exquisita: fettuccine en cremosa salsa de ajillo y mantequilla, coronado con camarones y mix de mariscos, tomate, pimentón y un toque cítrico. Con tostaditas crocantes",
      price: 39000,
      icon: "🍤",
      img: "https://i.ibb.co/zWyRb6Tj/file-00000000c92c820e84b5f25e954f90fd.png"
    }
  ],
  salteados: [
    {
      name: "Salteado de Pollo — Clásico",
      desc: "Jugosos trozos de pechuga 200g de pollo tierno, salteados al wok al punto perfecto con mezcla refrescante de verduras frescas. Aromatizado intensamente con ajonjolí tostado, salsa de ostiones marina y salsa negra. Todo sobre cama generosa de papas rústicas crujientes y maduro jugoso",
      price: 24500,
      icon: "🍗",
      img: "https://i.ibb.co/qYHRFsTz/file-00000000c068820eaf56d4d26f08f2cc.png"
    }
  ],
  hamburguesas: [
    {
      name: "Reina de la Casa + Papas",
      desc: "Carne 100% de res novillo jugosa en pan sellado a la parrilla, con queso fundido, tocineta crocante, tomate, lechuga crespa orgánica, dulce de pepino y salsas especiales. Con papas doradas",
      price: 24000,
      icon: "🍔",
      img: "https://i.ibb.co/F2L7XXP/file-000000005994820ebaf2a7967f80d047.png"
    },
    {
      name: "Ahumada del Galeras + Papas",
      desc: "Intensa carne de costillas de cerdo ahumadas al barril, en pan a la parrilla con queso fundido, tocineta, tomate, lechuga y nuestra salsa BBQ de la casa. Con papas doradas",
      price: 27000,
      icon: "🍔",
      img: "https://i.ibb.co/39nY9vjM/file-00000000db58820e94108c74983aa2c4.png"
    }
  ],
  ensaladas: [
    {
      name: "Cima Verde Premium (Vegetariana)",
      desc: "Fresca y colorida: lechuga crespa, tomate, cebolla, pimentón, aguacate, aceitunas y queso, con tostaditas, dulce de pepino y nuestro aderezo de soya. Ligera y deliciosa",
      price: 19000,
      icon: "🥗",
      img: "https://i.ibb.co/7xZpMMNP/file-000000003734820e8a206d55e9bdf71d.png"
    }
  ],
  postres: [
    {
      name: "Brownie Tropical",
      desc: "Brownie caliente de chocolate belga oscuro, húmedo y esponjoso, bañado generosamente en salsa de maracuyá suavizada con crema de leche fresca. Coronado con queso rallado y frutos rojos (mora, frambuesa). Un postre tropical que fusiona lo dulce con lo agrio de forma perfecta",
      price: 12000,
      icon: "🍫",
      img: "https://i.ibb.co/B2T8v6k4/file-00000000c760820e8e0c3a2caf8283ec.png"
    }
  ],
  calientes: [
    {
      name: "AguaPanela Caliente",
      desc: "Reconfortante aguapanela caliente preparada con piloncillo disuelto en agua caliente. Bebida tradicional colombiana que calienta el alma en tardes frías. Aroma de caña de azúcar pura",
      price: 3500,
      icon: "☕",
      img: "https://i.ibb.co/FkYZzw0Y/file-00000000f7d0820ebd132f8822cf0abf.png"
    },
    {
      name: "Tinto - 7 oz",
      desc: "Nuestro café negro tradicional y aromático, recién pasado al momento. Servido en taza de 7 oz. Intenso, concentrado y lleno de sabor caferero colombiano auténtico",
      price: 2500,
      icon: "☕",
      img: "https://i.ibb.co/Gvqwbfhd/file-000000009694820e93516fe8b8ea3579.png"
    }
  ],
  frias: [
    {
      name: "AguaPanela Fría",
      desc: "Refrescante aguapanela tradicional servida bien fría y helada. Bebida clásica nariñense perfecta para días calurosos. Sabor dulce natural, sin aditivos",
      price: 2500,
      icon: "🥤",
      img: "https://i.ibb.co/5gVVPf6Y/file-00000000fac4820ebc8b96bd736c9707.png"
    },
    {
      name: "CocaCola 400ml",
      desc: "Gaseosa personal Coca-Cola 400ml bien fría y refrescante. La clásica que todos conocen, servida en vaso con hielo",
      price: 6000,
      icon: "🥤",
      img: "https://i.ibb.co/ch0bF4FZ/file-00000000df64820e82e961f420fad728.png"
    }
  ],
  naturales: [
    {
      name: "Jugo Natural en Agua",
      desc: "Jugo natural preparado al momento en agua fresca. Sabores disponibles: tamarindo, fresa, mora, guanábana, maracuyá o mango. Bebida 100% natural sin aditivos",
      price: 6500,
      icon: "🧃",
      img: "https://i.ibb.co/1Gd2bY3w/file-000000002294820e88ab232a9b5f80ef.png"
    }
  ],
  sodas: [
    {
      name: "Soda Frutos Rojos",
      desc: "Burbujeante soda artesanal hecha con frutos rojos frescos (mora, frambuesa y arándanos). Notas dulces y ligeramente ácidas que refrescan el paladar. Burbujas suaves que acarician la lengua. Bebida gourmet artesanal",
      price: 16000,
      icon: "🍓",
      img: "https://i.ibb.co/4R6Ck6zC/file-00000000b368820eac574b1e638edbc4.png"
    }
  ],
  licores: [
    {
      name: "Aguardiente Nariño 750ml",
      desc: "Botella de 750ml de aguardiente nariñense auténtico, destilado con tradición ancestral. Bebida emblemática de Colombia con sabor a caña de azúcar pura y esencia regional",
      price: 105000,
      icon: "🥃",
      img: "https://i.ibb.co/99f1T1t3/file-00000000b6c4820e9ae6d6e592178f5e.png"
    }
  ],
  promos: [
    {
      name: "Cima de Papas + Bebida",
      desc: "Porción generosa de 500g de papas fritas doradas y crujientes, acompañadas de limonada fresca recién hecha. Elige tu topping favorito entre chicharrón, chorizo, fajitas de pollo, cerdo o chuleta fritos a la perfección",
      price: 14000,
      icon: "🍟",
      img: "https://i.ibb.co/yFKyHBLG/file-0000000061d8820e818a50957d349b33.png"
    }
  ],
  eventos: [
    {
      name: "Plato Fuerte",
      desc: "Mixto de 175g cerdo y 175g de pollo a la parrilla. Eliges salsa (maracuyá, BBQ o agridulce), acompañamientos (papa, arroz, yuca o plátano) y ensalada. Incluye jarra personal de jugo. Ideal para tus eventos",
      price: 35000,
      icon: "🍽️",
      img: "https://i.ibb.co/ZRWZgfnB/file-000000008830820e862387a7fa95739b.png"
    }
  ],
  espacios: [
    {
      name: "Zona Campestre",
      desc: "Espacio amplio y acogedor con capacidad para 60 personas, donde la naturaleza y la comodidad se encuentran. Equipado con TV 75\" para proyecciones, presentaciones o disfrutar del fútbol en compañía",
      img: "https://i.ibb.co/k2hKfQsT/IMG-20260729-WA0032.jpg"
    },
    {
      name: "Reminiscencias",
      desc: "Rincón con encanto para 40 personas, donde cada detalle evoca recuerdos gratos. Pantalla gigante para compartir películas, música en vivo o momentos especiales",
      img: "https://i.ibb.co/m5qDrtTm/IMG-20260729-WA0030.jpg"
    }
  ],
  decoraciones: [
    {
      name: "Decoración Romántica",
      desc: "Crea un ambiente de puro romance: corazón decorativo con pétalos de rosa, velas aromáticas que iluminan la intimidad, mantelería elegante, copas de agua cristalina y letrero luminoso personalizado con tu mensaje especial",
      price: 40000,
      img: "https://i.ibb.co/fhVQpdD/IMG-20260725-WA0000.jpg"
    }
  ]
};
