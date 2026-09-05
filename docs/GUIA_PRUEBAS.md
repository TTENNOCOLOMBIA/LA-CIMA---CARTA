# 🧪 GUÍA DE PRUEBAS - LA CIMA RESTAURANTE

**Fecha:** 27/08/2026  
**Objetivo:** Verificar que todas las 4 mejoras funcionan correctamente

---

## 🚀 CÓMO PROBAR

### Opción A: Local (Rápido)
```
1. Abre Explorer en: C:\Users\DELL\CIMA RESTAURANTE
2. Haz doble clic en: index.html
3. Se abrirá en tu navegador
```

### Opción B: Servidor Local (Mejor)
```bash
# En PowerShell, ve a la carpeta:
cd "C:\Users\DELL\CIMA RESTAURANTE"

# Inicia servidor simple:
python -m http.server 8000

# Abre navegador en:
http://localhost:8000
```

---

## ✅ PRUEBA 1: CARRITO PERSISTENTE

### Paso 1: Agregar producto
1. Abre la página
2. Busca cualquier plato (ej: "Bandeja")
3. Haz clic en "🛒 Agregar al Carrito"
4. Deberías ver contador del carrito: `🛒 1`

### Paso 2: Cerrar y abrir página
1. **Cierra completamente el navegador** (o la pestaña)
2. Espera 5 segundos
3. **Abre la página nuevamente**
4. ✅ **RESULTADO ESPERADO:** El carrito sigue mostrando el producto

### Paso 3: Agregar más items
1. Agrega otro plato diferente
2. Cambia cantidad (+ / -)
3. Cierra la página nuevamente
4. ✅ **RESULTADO ESPERADO:** Todos los cambios se guardaron

### ✓ Si ves esto: **CARRITO PERSISTENTE FUNCIONA** ✓

---

## ✅ PRUEBA 2: SISTEMA DE FAVORITOS

### Preparación
- [ ] Si no está implementado UI en cards aún (se agrega después)
- [ ] Verificaremos que los datos se guardan en localStorage

### Paso 1: Verificar localStorage
1. Abre DevTools: **F12**
2. Ve a: **Application → LocalStorage**
3. Busca: `lacimaFavorites`
4. ✅ Si aparece = Sistema instalado

### Paso 2: Prueba manual (en consola)
1. Abre DevTools: **F12**
2. Ve a: **Console**
3. Escribe:
```javascript
addToFavorites("Bandeja Paisa'na", "tipicos")
console.log(getFavorites())
```
4. ✅ **RESULTADO ESPERADO:** Muestra array con el favorito

### ✓ Si ves esto: **FAVORITOS FUNCIONA** ✓

---

## ✅ PRUEBA 3: CÓDIGOS DE DESCUENTO

### Paso 1: Abrir carrito con items
1. Agrega 2-3 productos al carrito
2. Haz clic en el botón del carrito (🛒)
3. Deberías ver el carrito modal

### Paso 2: Buscar campo de cupón
1. Mira dentro del modal del carrito
2. Busca botón: **"🎟️ Tengo un cupón"**
3. Haz clic en él
4. Debería aparecer un campo de texto

### Paso 3: Probar cupón BIENVENIDA10
1. En el campo de cupón, escribe: `BIENVENIDA10`
2. Haz clic en: **"✓ Aplicar Cupón"**
3. ✅ **RESULTADO ESPERADO:**
   - Aparece alerta: "✅ Cupón aplicado!"
   - Texto del descuento: "Descuento de bienvenida 10%"
   - En totales aparece descuento

### Paso 4: Verificar ahorro
1. Mira la sección de TOTALES
2. Debería mostrar:
   - Subtotal: $X.XXX
   - **Descuento: -$Y.YYY** (nuevo)
   - Domicilio: $7.000
   - TOTAL: Reducido

### Paso 5: Probar otros cupones
```
PROMO20      → 20% descuento
DOMICILIO5   → $5.000 descuento
```

### ✓ Si ves esto: **CUPONES FUNCIONAN** ✓

---

## ✅ PRUEBA 4: GUARDAR PEDIDOS

### Status Actual
⏳ **Requiere configuración de Google Sheets**

### Verificación Local
1. Abre DevTools: **F12**
2. Ve a: **Application → LocalStorage**
3. Busca: `lacimaOrders`
4. Envía un pedido completamente
5. ✅ Los datos se guardan localmente como respaldo

### Configuración de Google Sheets
Sigue: `GUIA_GOOGLE_SHEETS.md` (cuando estés listo)

---

## 📊 RESUMEN DE VERIFICACIONES

### Carrito Persistente
- [ ] Se guarda al cerrar página
- [ ] Se recupera al abrir nuevamente
- [ ] Múltiples items se guardan
- [ ] Cantidades se guardan

### Favoritos
- [ ] Datos se guardan en localStorage
- [ ] Función `isFavorite()` funciona
- [ ] `getFavorites()` devuelve array

### Cupones
- [ ] Campo aparece en carrito
- [ ] BIENVENIDA10 funciona (10%)
- [ ] PROMO20 funciona (20%)
- [ ] DOMICILIO5 funciona ($5.000)
- [ ] Ahorro se muestra en totales
- [ ] Se puede remover cupón

### Pedidos
- [ ] Datos se guardan en localStorage
- [ ] Se preparan para Google Sheets
- [ ] Incluyen descuentos en mensaje

---

## 🔍 DEBUGGING (Si algo no funciona)

### Carrito no guarda
```javascript
// En Console, verifica:
localStorage.getItem('lacimaCart')
// Debe mostrar JSON con items
```

### Cupones no funcionan
```javascript
// En Console:
getActiveCoupons()
// Debe mostrar array con 3 cupones
validateCoupon('BIENVENIDA10')
// Debe devolver el objeto del cupón
```

### Favoritos no guardan
```javascript
// En Console:
addToFavorites("Test", "test")
localStorage.getItem('lacimaFavorites')
// Debe mostrar el favorito
```

---

## ✨ CHECKLIST FINAL

Cuando todo funcione, marca aquí:

- [ ] Carrito persiste entre sesiones
- [ ] Favoritos se guardan
- [ ] 3 cupones funcionan correctamente
- [ ] Descuentos se muestran
- [ ] Datos se guardan para Google Sheets
- [ ] No hay errores en consola

---

## 🚀 PRÓXIMO PASO

Una vez que confirmes que todo funciona:

**1. Dime qué sí funciona ✅**  
**2. Dime qué no funciona ❌**  
**3. Luego configuramos Google Sheets**

---

## 📝 NOTA

Si encuentras errores en la consola (F12 → Console):
- Cópialos completos
- Comparte conmigo
- Juntos los arreglamos

¡Prueba y avisame! 🧪
