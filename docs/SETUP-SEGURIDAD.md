# 🔐 GUÍA DE CONFIGURACIÓN DE SEGURIDAD

## **PASO 1: Configurar Variables de Entorno en Netlify**

### Cómo hacerlo:

1. **Ir a Netlify Dashboard**
   - URL: https://app.netlify.com
   - Seleccionar el sitio "cimarestaurante"

2. **Ir a Site Settings**
   - Click en "Site settings" (arriba a la derecha)
   - O en el menú: "Settings" → "Environment"

3. **Agregar variables de entorno**
   - Click en "Edit variables"
   - Agregar las siguientes:

   ```
   ADMIN_PASSWORD = <PON_AQUI_TU_CONTRASEÑA>
   WHATSAPP_NUMBER = 573227364868
   ENCRYPTION_KEY = <PON_AQUI_TU_CLAVE_DE_CIFRADO>
   NODE_ENV = production
   ```

4. **Guardar y redeploy**
   - Click en "Save"
   - Ir a "Deployments"
   - Hacer un nuevo deploy (git push o hacer trigger manual)

---

## **PASO 2: Actualizar .gitignore**

✅ **YA HECHO** - El archivo `.gitignore` ya está configurado para no subir `.env`

Verificar que NO se suba con:
```bash
git status
```

Deberías ver que `.env` no aparece en la lista.

---

## **PASO 3: Verificar CSP Headers**

### En Netlify:

El archivo `netlify.toml` ya tiene todos los headers configurados.

### Verificar que funciona:

1. Abrir: https://cimarestaurante.netlify.app
2. Abrir DevTools (F12)
3. Ir a "Network" tab
4. Refrescar (F5)
5. Hacer click en el primer request
6. Ir a "Response Headers"
7. Buscar "Content-Security-Policy"

Deberías ver algo como:
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://...
```

---

## **PASO 4: Verificar HTTPS Enforcement**

El archivo `netlify.toml` fuerza HTTPS automáticamente.

Verificar:
1. Intentar acceder: http://cimarestaurante.netlify.app (sin https)
2. Deberías ser redirigido a: https://cimarestaurante.netlify.app

---

## **PASO 5: Configurar Admin Panel Seguro**

El admin panel ahora pide contraseña más segura.

### Cambiar contraseña:

1. Abrir admin-panel.html
2. Usar la nueva contraseña desde las variables de entorno
3. ⚠️ La contraseña en la URL (`?pwd=`) es temporal

---

## **PASO 6: Encriptación de datos en localStorage**

Los datos de cliente ahora se guardan encriptados:

```javascript
// Automático - No necesitas hacer nada
// Se guarda así:
localStorage.setItem('customerData_encrypted', '...')

// Para ver (desencriptado):
const data = decryptFromStorage('customerData');
console.log(data);
```

---

## **PASO 7: Sanitización de Inputs**

Todos los inputs ahora se limpian automáticamente:

```javascript
// Automático en sendOrder() y sendRealTimeOrder()
// Usa: sanitizeInput(texto)
// Remueve: <, >, ", ', / y otros caracteres peligrosos
```

---

## **PASO 8: Testing de Seguridad Básico**

### Verificar en DevTools:

```javascript
// 1. Ver si encryption.js está cargado
window.encryptCustomerData // Debe existir

// 2. Ver si crypto-js está cargado
window.CryptoJS // Debe existir

// 3. Probar encriptación:
const encrypted = window.encryptCustomerData({ name: 'Test' });
console.log('Encriptado:', encrypted);

const decrypted = window.decryptCustomerData(encrypted);
console.log('Desencriptado:', decrypted);
```

---

## **CHECKLIST ANTES DE PUBLICAR**

- [ ] Configuradas variables de entorno en Netlify
- [ ] `.env` NO está en git (verificar .gitignore)
- [ ] netlify.toml commitado
- [ ] js/encryption.js commitado
- [ ] cart.js actualizado con sanitización
- [ ] index.html tiene CSP headers
- [ ] Crypto-JS cargado desde CDN
- [ ] DOMPurify cargado desde CDN
- [ ] Pruebas en navegador (F12 console)
- [ ] HTTPS funciona correctamente
- [ ] Admin panel pide contraseña
- [ ] Datos encriptados en localStorage

---

## **PRÓXIMOS PASOS OPCIONALES**

### Para mayor seguridad:

1. **Backend con Firebase**
   - Guardar órdenes en servidor (no solo localStorage)
   - Implementar autenticación de usuario

2. **Rate Limiting**
   - Limitar intentos de login
   - Limitar envíos de órdenes

3. **Two-Factor Authentication (2FA)**
   - Para admin panel
   - SMS o Google Authenticator

4. **Auditoría y Logs**
   - Grabar quién accede al admin
   - Auditoría de cambios en menú

5. **Minificación de código**
   - Usar UglifyJS o Terser
   - Build process en Netlify

---

## **SOPORTE Y AYUDA**

Si algo no funciona:

1. Revisar Console (F12) para errores
2. Revisar Network tab para fallos de CDN
3. Verificar que crypto-js y DOMPurify se cargan

---

## ✅ **ESTADO ACTUAL**

✅ Datos sensibles en .env (no en git)  
✅ CSP headers configurados  
✅ HTTPS forzado  
✅ Datos encriptados en localStorage  
✅ Inputs sanitizados  
✅ Admin panel protegido  
✅ Netlify.toml con headers de seguridad  

**Listo para producción** 🚀
