/* ========================================
   MÓDULO DE ENCRIPTACIÓN - LA CIMA RESTAURANTE
   ======================================== */

// Usar crypto-js (necesita CDN)
// CDN: https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.0/crypto-js.min.js

// ========================================
// CONSTANTES DE ENCRIPTACIÓN
// ========================================

const ENCRYPTION_SECRET = 'LaC1ma@2024SecureKey12345678';  // Min 32 caracteres

// ========================================
// FUNCIÓN PARA ENCRIPTAR DATOS
// ========================================

function encryptCustomerData(data) {
  if (!data || typeof data !== 'object') {
    console.warn('⚠️ No hay datos para encriptar');
    return null;
  }

  try {
    // Convertir objeto a JSON string
    const jsonString = JSON.stringify(data);

    // Encriptar con AES-256
    const encrypted = CryptoJS.AES.encrypt(
      jsonString,
      ENCRYPTION_SECRET
    ).toString();

    return encrypted;
  } catch (error) {
    console.error('❌ Error al encriptar datos:', error);
    return null;
  }
}

// ========================================
// FUNCIÓN PARA DESENCRIPTAR DATOS
// ========================================

function decryptCustomerData(encryptedData) {
  if (!encryptedData) {
    console.warn('⚠️ No hay datos encriptados para desencriptar');
    return null;
  }

  try {
    // Desencriptar
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      ENCRYPTION_SECRET
    ).toString(CryptoJS.enc.Utf8);

    // Convertir de JSON string a objeto
    const data = JSON.parse(decrypted);

    return data;
  } catch (error) {
    console.error('❌ Error al desencriptar datos:', error);
    return null;
  }
}

// ========================================
// FUNCIÓN PARA SANITIZAR INPUTS (XSS Protection)
// ========================================

function sanitizeInput(input) {
  if (!input) return '';

  // Convertir a string si no lo es
  const str = String(input);

  // Reemplazar caracteres peligrosos
  const sanitized = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

// ========================================
// FUNCIÓN PARA VALIDAR EMAILS
// ========================================

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ========================================
// FUNCIÓN PARA VALIDAR TELÉFONO
// ========================================

function validatePhone(phone) {
  // Solo números, al menos 7 dígitos
  const regex = /^\d{7,15}$/;
  return regex.test(phone.replace(/\D/g, ''));
}

// ========================================
// FUNCIÓN PARA VALIDAR DOCUMENTO
// ========================================

function validateDocument(doc) {
  // Solo números, 6-12 dígitos
  const regex = /^\d{6,12}$/;
  return regex.test(doc.replace(/\D/g, ''));
}

// ========================================
// FUNCIÓN PARA ENCRIPTAR LOCALSTORAGE
// ========================================

function encryptToStorage(key, data) {
  try {
    const encrypted = encryptCustomerData(data);
    if (encrypted) {
      localStorage.setItem(key + '_encrypted', encrypted);
      localStorage.setItem(key + '_ts', new Date().getTime().toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error al guardar en storage:', error);
    return false;
  }
}

// ========================================
// FUNCIÓN PARA DESENCRIPTAR DE LOCALSTORAGE
// ========================================

function decryptFromStorage(key) {
  try {
    const encrypted = localStorage.getItem(key + '_encrypted');
    if (!encrypted) return null;

    const data = decryptCustomerData(encrypted);
    return data;
  } catch (error) {
    console.error('❌ Error al leer de storage:', error);
    return null;
  }
}

// ========================================
// FUNCIÓN PARA GENERAR HASH
// ========================================

function generateHash(data) {
  try {
    const hash = CryptoJS.SHA256(JSON.stringify(data)).toString();
    return hash;
  } catch (error) {
    console.error('❌ Error al generar hash:', error);
    return null;
  }
}

// ========================================
// FUNCIÓN PARA VERIFICAR INTEGRIDAD
// ========================================

function verifyDataIntegrity(data, hash) {
  try {
    const calculatedHash = generateHash(data);
    return calculatedHash === hash;
  } catch (error) {
    console.error('❌ Error al verificar integridad:', error);
    return false;
  }
}

// ========================================
// FUNCIÓN PARA OCULTAR DATOS SENSIBLES
// ========================================

function maskSensitiveData(data) {
  if (!data) return {};

  const masked = { ...data };

  // Ocultar documento
  if (masked.numeroDoc) {
    const doc = masked.numeroDoc.toString();
    masked.numeroDoc = doc.substring(0, 2) + '***' + doc.substring(doc.length - 2);
  }

  // Ocultar teléfono
  if (masked.telefono) {
    const phone = masked.telefono.toString();
    masked.telefono = phone.substring(0, 2) + '***' + phone.substring(phone.length - 2);
  }

  // Ocultar correo
  if (masked.correo) {
    const email = masked.correo.split('@');
    masked.correo = email[0].substring(0, 2) + '***@' + email[1];
  }

  return masked;
}

// ========================================
// FUNCIÓN PARA LIMPIAR DATOS SENSIBLES
// ========================================

function clearSensitiveData() {
  try {
    // Limpiar localStorage de datos sensibles
    const keysToRemove = [
      'lacimaMenuV2_encrypted',
      'lacimaCart_encrypted',
      'customerData_encrypted',
      'lacimaCart',  // Viejo (sin encriptar)
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ Datos sensibles limpiados de localStorage');
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
    return false;
  }
}

// ========================================
// EXPORTAR FUNCIONES (para uso global)
// ========================================

// Disponible globalmente como:
// - encryptCustomerData()
// - decryptCustomerData()
// - sanitizeInput()
// - validateEmail()
// - validatePhone()
// - validateDocument()
// - encryptToStorage()
// - decryptFromStorage()
// - generateHash()
// - verifyDataIntegrity()
// - maskSensitiveData()
// - clearSensitiveData()
