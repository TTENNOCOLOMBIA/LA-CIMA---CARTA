/* ========================================
   SINCRONIZACIÓN CON FIREBASE
   ======================================== */

// Configuración de Firebase (API key es pública - no es secreto)
const firebaseConfig = {
    apiKey: "AIzaSy-REMOVED-FOR-SECURITY-CHECK",  // 🔒 API key pública de Firebase
    authDomain: "la-cima-restaurante.firebaseapp.com",
    databaseURL: "https://la-cima-restaurante-default-rtdb.firebaseio.com",
    projectId: "la-cima-restaurante",
    storageBucket: "la-cima-restaurante.appspot.com",
    messagingSenderId: "841309570369",
    appId: "1:841309570369:web:53dfc4b8ee6ba96c2c9e3a"
};

let firebaseDb = null;

// Función para inicializar Firebase
async function initializeFirebase() {
    try {
        // Dynamic import de Firebase
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { getDatabase, ref, get, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

        const app = initializeApp(firebaseConfig);
        firebaseDb = getDatabase(app);

        console.log('✅ Firebase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        return false;
    }
}

// Función para sincronizar menú desde Firebase o cargar defaultMenu
async function syncMenuFromFirebase() {
    if (!firebaseDb) {
        await initializeFirebase();
    }

    try {
        const { ref, get, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js');

        const menuRef = ref(firebaseDb, 'menu');
        const snapshot = await get(menuRef);

        // 📊 Contar productos en ambas fuentes
        let firebaseProductCount = 0;
        let defaultMenuProductCount = 0;

        if (snapshot.exists()) {
            const firebaseMenu = snapshot.val();
            // Contar productos de Firebase
            if (firebaseMenu && typeof firebaseMenu === 'object') {
                Object.values(firebaseMenu).forEach(category => {
                    if (Array.isArray(category)) {
                        firebaseProductCount += category.length;
                    }
                });
            }
        }

        // Contar productos en defaultMenu
        if (typeof window.defaultMenu !== 'undefined' && window.defaultMenu) {
            Object.values(window.defaultMenu).forEach(category => {
                if (Array.isArray(category)) {
                    defaultMenuProductCount += category.length;
                }
            });
        }

        console.log(`📊 Firebase: ${firebaseProductCount} productos | defaultMenu: ${defaultMenuProductCount} productos`);

        // ✅ Usar el menú que tenga MÁS productos
        if (defaultMenuProductCount >= firebaseProductCount) {
            console.log('✅ Priorizando defaultMenu (más productos)');
            return true;
        }

        if (snapshot.exists()) {
            const firebaseMenu = snapshot.val();
            console.log('📥 Menú sincronizado desde Firebase:', firebaseMenu);

            // Verificar que el menú sea válido
            if (firebaseMenu && typeof firebaseMenu === 'object') {
                // Actualizar defaultMenu con datos de Firebase
                if (typeof window.defaultMenu !== 'undefined') {
                    Object.assign(window.defaultMenu, firebaseMenu);
                }
                console.log('✅ Menú actualizado correctamente');
                return true;
            }
        } else {
            // Si no hay datos en Firebase, cargar defaultMenu desde config.js
            console.log('⚠️ No hay datos de menú en Firebase, cargando defaultMenu...');

            if (typeof window.defaultMenu !== 'undefined' && window.defaultMenu) {
                console.log('📤 Cargando defaultMenu de config.js a Firebase...');

                // Esperar un poco para asegurar que config.js está cargado
                if (!window.defaultMenu.entradas) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                if (window.defaultMenu && Object.keys(window.defaultMenu).length > 0) {
                    await set(menuRef, window.defaultMenu);
                    console.log('✅ Menú cargado en Firebase desde defaultMenu');

                    // Guardar configuración de sincronización
                    await set(ref(firebaseDb, 'settings/sync_config'), {
                        lastSync: new Date().toISOString(),
                        autoSync: true,
                        syncDirection: 'admin_to_firebase',
                        preventStaleData: true,
                        version: 'v1.0-Aug31-2026'
                    });

                    return true;
                }
            }
        }
    } catch (error) {
        console.error('❌ Error sincronizando menú:', error);
    }

    return false;
}

// Función para hacer sync automático al cargar
async function autoSyncOnLoad() {
    console.log('⏳ Iniciando sincronización automática...');

    // Esperar a que Firebase esté disponible
    const MAX_RETRIES = 5;
    let retries = 0;

    while (!firebaseDb && retries < MAX_RETRIES) {
        const initialized = await initializeFirebase();
        if (initialized) break;
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Intentar sincronizar el menú
    await syncMenuFromFirebase();

    console.log('✅ Sincronización automática completada');
}

// ✅ ACTUALIZACIÓN: Ahora prioriza defaultMenu (133+ productos) sobre Firebase (36 productos)
// Exportar funciones para uso global
window.firebaseSync = {
    initialize: initializeFirebase,
    sync: syncMenuFromFirebase,
    autoSync: autoSyncOnLoad
};

// Iniciar sincronización automática cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoSyncOnLoad);
} else {
    autoSyncOnLoad();
}
// Force update 1788634666
