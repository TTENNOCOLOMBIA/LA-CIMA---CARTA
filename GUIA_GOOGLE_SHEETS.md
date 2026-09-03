# 📊 GUÍA: GUARDAR PEDIDOS EN GOOGLE SHEETS

**Fecha:** 27/08/2026  
**Estado:** Configuración (Paso a paso)

---

## 🎯 ¿QUÉ VAMOS A LOGRAR?

Cada pedido que envíen los clientes se guardará **automáticamente** en una hoja de Google Sheets que solo tú podrás ver.

Beneficios:
- ✅ Historial completo de pedidos
- ✅ Análisis de ventas
- ✅ Información de clientes
- ✅ Reporte automático
- ✅ Acceso desde cualquier dispositivo

---

## 📋 PASOS A SEGUIR

### PASO 1: Crear Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Haz clic en **"Crear"** → **"Hoja de cálculo en blanco"**
3. Nombra la hoja: **"La Cima - Pedidos"**
4. Click **"Crear"**

### PASO 2: Estructura la Hoja

En la primera fila, agrega estos títulos:

```
A1: Fecha
B1: Hora
C1: Cliente
D1: Teléfono
E1: Dirección
F1: Productos
G1: Cantidad Total
H1: Subtotal
I1: Descuento
J1: Domicilio
K1: TOTAL
L1: Notas
M1: Cupón Usado
```

### PASO 3: Agregar Apps Script

1. En tu hoja de Google Sheets, haz clic en **"Extensiones"** → **"Apps Script"**
2. Copia este código:

```javascript
// Función web para recibir datos
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    const now = new Date();
    const fecha = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const hora = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    
    const productos = data.items.map(i => i.name + ' x' + i.qty).join('; ');
    const cantidad = data.items.reduce((sum, i) => sum + i.qty, 0);
    
    const nuevaFila = [
      fecha,
      hora,
      data.client.name,
      data.client.phone,
      data.client.address,
      productos,
      cantidad,
      data.totals.subtotal,
      data.totals.discount || 0,
      data.totals.delivery,
      data.totals.total,
      data.client.notes || '',
      data.coupon || ''
    ];
    
    sheet.appendRow(nuevaFila);
    
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Haz clic en **"Desplegar"** → **"Nuevo despliegue"**
4. Tipo: **"Aplicación web"**
5. Ejecutar como: **Tu cuenta de Google**
6. Quién tiene acceso: **Todos**
7. Copia la **URL de despliegue** (la necesitarás después)

### PASO 4: Agregar URL a la Configuración

Cuando tengas la URL de Google Apps Script, necesitaremos actualizar un archivo.

**URL que necesitas:** `https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb...`

Envía esta URL y te ayudaré a integrarla en el código.

---

## 🔧 CONFIGURACIÓN EN LA CIMA

**Proximamente:** Cuando tengas tu URL de Google Apps Script, haré estos cambios:

1. Actualizar `js/storage.js` con tu URL
2. Funcionar automáticamente sin que hagas nada más
3. Los pedidos se guardarán automáticamente

---

## 📊 VISTA DE TU HOJA

Tu hoja se verá así:

| Fecha | Hora | Cliente | Teléfono | Dirección | Productos | Cantidad | Subtotal | Descuento | Domicilio | TOTAL | Notas | Cupón |
|-------|------|---------|----------|-----------|-----------|----------|----------|-----------|-----------|-------|-------|-------|
| 2026-08-27 | 14:30:22 | Juan Pérez | 3001234567 | Cra 7 #27-90 | Bandeja Paisa x1; Jugo x1 | 2 | $39000 | $0 | $7000 | $46000 | Sin cebolla | - |
| 2026-08-27 | 14:45:15 | María López | 3109876543 | Cra 6 #28 | Hamburguesa x2 | 2 | $48000 | $4800 | $7000 | $50200 | - | BIENVENIDA10 |

---

## 🚀 BENEFICIOS ADICIONALES

Con tu Google Sheet puedes:

1. **Crear gráficos** de ventas por día
2. **Filtrar por cliente** para ver histórico
3. **Analizar platos más vendidos**
4. **Reportes automáticos** por período
5. **Compartir con tu equipo** sin dar acceso a la web

---

## ⚠️ IMPORTANTE

- La URL debe mantenerse **CONFIDENCIAL** (es como una contraseña)
- Google Apps Script solo funciona con cuentas personales de Google
- La hoja puede aceptar máximo 2 millones de filas

---

##✨ ¿LISTO?

Una vez que hayas:
1. ✅ Creado la Google Sheet
2. ✅ Agregado el Apps Script
3. ✅ Obtenido la URL

**Comparte conmigo la URL** y configuraremos la integración automática.

---

## 📞 SOPORTE

Si tienes problemas:
- Google Sheets no funciona → Intenta desde navegador Chrome
- Apps Script no se despliega → Verifica que hayas iniciado sesión
- Error de permisos → Asegúrate de seleccionar "Todos" en acceso

¡Avisame cuando tengas la URL! 🚀
