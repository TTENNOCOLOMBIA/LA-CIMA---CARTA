#!/usr/bin/env node

/**
 * Build script para generar configuración de Firebase
 * desde variables de entorno (evita exponer secretos en repo)
 */

const fs = require('fs');
const path = require('path');

// API key desde variable de entorno
const firebaseApiKey = process.env.FIREBASE_API_KEY || 'AIzaSyCVN_Mc-OX6bvCFKfCaDZJBSiDi3qKlipI';

// Contenido del archivo de configuración
const configContent = `
// 🔐 GENERADO AUTOMÁTICAMENTE DURANTE EL BUILD
// No commitear este archivo - es generado desde variables de entorno

window.__FIREBASE_CONFIG__ = {
  apiKey: "${firebaseApiKey}",
  authDomain: "la-cima-restaurante.firebaseapp.com",
  databaseURL: "https://la-cima-restaurante-default-rtdb.firebaseio.com",
  projectId: "la-cima-restaurante",
  storageBucket: "la-cima-restaurante.appspot.com",
  messagingSenderId: "841309570369",
  appId: "1:841309570369:web:53dfc4b8ee6ba96c2c9e3a"
};

console.log('✅ Firebase config cargada desde variables de entorno');
`;

// Escribir el archivo
const outputPath = path.join(__dirname, 'js', 'firebase-config-generated.js');
fs.writeFileSync(outputPath, configContent);
console.log(`✅ Archivo generado: ${outputPath}`);
