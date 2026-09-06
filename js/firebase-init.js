/* ========================================
   INICIALIZACIÓN DE FIREBASE
   ======================================== */

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCVN_Mc-OX6bvCFKfCaDZJBSiDi3qKlipI",
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

// ========================================
// ESCRITURA: pasa por el servidor, no por el navegador
// ========================================
// Las reglas de la base tienen ".write": false, así que desde aquí no se
// puede escribir (antes sí, y por eso cualquiera podía borrar el menú).
// Todo cambio se manda a la función netlify/functions/guardar-menu.js, que
// comprueba la sesión y escribe con el secreto del servidor.
//
// La LECTURA sigue siendo directa: el menú es público, igual que la carta.

async function guardarEnFirebase(ruta, datos, descripcion) {
    if (typeof netlifyIdentity === 'undefined') {
        console.warn('⚠️ Sin Netlify Identity: no se puede guardar en Firebase');
        return false;
    }

    const usuario = netlifyIdentity.currentUser();
    if (!usuario) {
        console.warn('⚠️ Sesión no iniciada: el cambio se guardó solo en este equipo');
        return false;
    }

    try {
        // jwt() devuelve el token y lo renueva solo si ya había caducado.
        const token = await usuario.jwt();

        const r = await fetch('/.netlify/functions/guardar-menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ ruta: ruta, datos: datos })
        });

        if (r.ok) {
            console.log(`✅ Guardado en Firebase: ${descripcion || ruta}`);
            return true;
        }

        const detalle = await r.json().catch(() => ({}));
        console.warn(`⚠️ No se pudo guardar (${r.status}):`, detalle.error || '');
        return false;
    } catch (error) {
        console.warn('⚠️ Error guardando en Firebase:', error.message);
        return false;
    }
}

// Función para guardar producto en Firebase
function sincronizarProductoEnFirebase(categoria, index, producto) {
    return guardarEnFirebase(
        `menu/${categoria}/${index}`,
        producto,
        producto && producto.name
    );
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
// Devuelve una promesa: true si se guardó, false si no.
function sincronizarTodoAFirebaseDirecto(menuCompleto) {
    return guardarEnFirebase('menu', menuCompleto, 'menú completo');
}

console.log('📝 Módulo firebase-init.js cargado');
