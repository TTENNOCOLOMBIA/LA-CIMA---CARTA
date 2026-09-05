/* ========================================
   INICIALIZACIÓN DE FIREBASE
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

// Inicializar Firebase
let db = null;
let app = null;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    console.warn('⚠️ Firebase no disponible, usando solo localStorage');
}

// Función para guardar producto en Firebase
function sincronizarProductoEnFirebase(categoria, index, producto) {
    if (!db) {
        console.warn('⚠️ Firebase no disponible');
        return;
    }

    try {
        const ref = firebase.database().ref(`menu/${categoria}/${index}`);
        ref.set(producto).then(() => {
            console.log(`✅ Producto guardado en Firebase: ${producto.name}`);
        }).catch(error => {
            console.warn(`⚠️ Error guardando en Firebase:`, error);
        });
    } catch (error) {
        console.error('Error en sincronizarProductoEnFirebase:', error);
    }
}

// Función para cargar menú desde Firebase
async function cargarMenuDesdeFirebase() {
    if (!db) {
        console.warn('⚠️ Firebase no disponible, usando menú local');
        return null;
    }

    try {
        return new Promise((resolve) => {
            firebase.database().ref('menu').once('value', (snapshot) => {
                if (snapshot.exists()) {
                    console.log('📥 Menú cargado desde Firebase');
                    resolve(snapshot.val());
                } else {
                    console.log('ℹ️ No hay menú en Firebase');
                    resolve(null);
                }
            }).catch(error => {
                console.warn('⚠️ Error cargando de Firebase:', error);
                resolve(null);
            });
        });
    } catch (error) {
        console.error('Error en cargarMenuDesdeFirebase:', error);
        return null;
    }
}

// Función para sincronizar todo el menú a Firebase
function sincronizarTodoAFirebaseDirecto(menuCompleto) {
    if (!db) {
        console.error('❌ Firebase no está inicializado');
        return false;
    }

    try {
        firebase.database().ref('menu').set(menuCompleto)
            .then(() => {
                console.log('✅ ¡Todo el menú sincronizado a Firebase!');
                return true;
            })
            .catch(error => {
                console.error('❌ Error sincronizando:', error);
                return false;
            });
    } catch (error) {
        console.error('Error en sincronizarTodoAFirebaseDirecto:', error);
        return false;
    }
}

console.log('📝 Módulo firebase-init.js cargado');
