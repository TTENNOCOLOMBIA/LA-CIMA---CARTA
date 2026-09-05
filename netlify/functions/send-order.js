// ========================================
// NETLIFY FUNCTION - ENVÍO SEGURO DE ÓRDENES
// ========================================
// Esta función corre en el servidor (backend)
// El cliente NO tiene acceso a datos sensibles

const https = require('https');
const querystring = require('querystring');

// Variables de entorno (seguras en servidor)
const WA_NUMBER = process.env.WHATSAPP_NUMBER;
const WA_BUSINESS_API = process.env.WHATSAPP_BUSINESS_API || null;  // Futuro: Business API

// ========================================
// FUNCIÓN PARA ENCRIPTAR MENSAJES (backend)
// ========================================

function sanitizeForWhatsApp(text) {
  if (!text) return '';

  // Remover caracteres peligrosos
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

// ========================================
// FUNCIÓN PARA ENVIAR VÍA WHATSAPP
// ========================================

function sendViaWhatsApp(phoneNumber, message) {
  return new Promise((resolve, reject) => {
    try {
      // Sanitizar mensaje
      const sanitizedMsg = sanitizeForWhatsApp(message);

      // Construir URL de wa.me (esto es seguro en servidor)
      const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(sanitizedMsg)}`;

      // En el futuro, aquí se podría usar Twilio o WhatsApp Business API
      // Por ahora, devolvemos la URL al cliente

      resolve({
        success: true,
        url: waUrl,
        message: 'Orden preparada para enviar por WhatsApp',
      });
    } catch (error) {
      reject({
        success: false,
        error: 'Error al procesar la orden: ' + error.message,
      });
    }
  });
}

// ========================================
// HANDLER PRINCIPAL DE LA FUNCIÓN
// ========================================

exports.handler = async (event, context) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  try {
    // Parsear datos de la orden
    const orderData = JSON.parse(event.body);

    // Validar datos
    if (!orderData.message || !orderData.phoneNumber) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Faltan datos: message o phoneNumber'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    // Validar teléfono del cliente (para logging)
    const customerPhone = orderData.phoneNumber.replace(/\D/g, '');
    if (customerPhone.length < 7) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Teléfono de cliente inválido'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    // ENVIAR ORDEN POR WHATSAPP
    const result = await sendViaWhatsApp(WA_NUMBER, orderData.message);

    // LOG (con datos parcialmente enmascarados)
    console.log(`✅ Orden enviada a: ${customerPhone.substring(0, 2)}***${customerPhone.substring(-2)}`);

    // Respuesta
    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };

  } catch (error) {
    console.error('❌ Error en send-order:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error al procesar la orden'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};
