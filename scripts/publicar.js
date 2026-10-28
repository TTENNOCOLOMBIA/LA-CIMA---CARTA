// ========================================
// PUBLICAR LA CARTA (código revuelto)
// ========================================
//
// Qué hace:
// Crea la carpeta dist/ con SOLO lo que la carta necesita en el navegador:
// las tres páginas, el manifest, robots, sitemap, el service worker, las
// imágenes (assets/), y el código de css/ y js/ revuelto (minificado).
//
// Lo que NO se copia (queda fuera de internet):
// notas internas (.md), docs/, netlify/, netlify.toml, package.json, scripts/,
// el archivo .env y las páginas de mantenimiento de Firebase.
//
// Dónde se usa:
// Netlify ejecuta "npm run publicar" y publica dist/. En esta copia de
// trabajo no cambia nada: lo revuelto solo vive dentro de dist/.
//
// Regla: no quitar el revuelto ni la revisión del final. Si algo falla,
// se arregla aquí, no publicando la carpeta completa.

const fs = require("fs");
const path = require("path");
const { minify: minificarJS } = require("terser");
const CleanCSS = require("clean-css");
const { minify: minificarHTML } = require("html-minifier-terser");

const RAIZ = path.resolve(__dirname, "..");
const DIST = path.join(RAIZ, "dist");

// Páginas que se ven en el navegador
const PAGINAS = ["index.html", "admin-login.html", "admin-panel.html"];
// Archivos sueltos que se copian tal cual o como código (sw.js se revuelve)
const ARCHIVOS = ["manifest.json", "robots.txt", "sitemap.xml"];
const SW = "sw.js";
// Carpetas: imágenes se copian tal cual; css y js se revuelven
const CARPETA_IMAGENES = "assets";
const CARPETA_CSS = "css";
const CARPETA_JS = "js";

function leer(rel) {
  return fs.readFileSync(path.join(RAIZ, rel), "utf8");
}

function escribir(rel, contenido) {
  const destino = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido, "utf8");
}

// Copia una carpeta completa tal cual (imágenes)
function copiarCarpeta(relCarpeta) {
  const origen = path.join(RAIZ, relCarpeta);
  for (const entrada of fs.readdirSync(origen, { withFileTypes: true })) {
    const rel = path.join(relCarpeta, entrada.name);
    if (entrada.isDirectory()) {
      copiarCarpeta(rel);
    } else {
      fs.mkdirSync(path.dirname(path.join(DIST, rel)), { recursive: true });
      fs.copyFileSync(path.join(RAIZ, rel), path.join(DIST, rel));
    }
  }
}

async function revolverJS(rel) {
  const r = await minificarJS(leer(rel), {
    compress: true,
    mangle: true,       // no toca nombres de primer nivel (toplevel: false)
    format: { comments: false }
  });
  if (!r.code) throw new Error("No se pudo revolver " + rel);
  escribir(rel, r.code);
}

function revolverCSS(rel) {
  const r = new CleanCSS({ level: 1 }).minify(leer(rel));
  if (r.errors && r.errors.length) throw new Error("Error en " + rel + ": " + r.errors.join(", "));
  escribir(rel, r.styles);
}

async function revolverHTML(rel) {
  const r = await minificarHTML(leer(rel), {
    collapseWhitespace: true,
    conservativeCollapse: true,   // deja un espacio donde hacía falta
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    keepClosingSlash: true
  });
  escribir(rel, r);
}

// Revisión final: todo archivo propio que piden las páginas y los estilos
// debe existir en dist/. Si falta alguno, se detiene con el nombre.
function revisarReferencias() {
  const faltantes = [];
  const pedir = (desdeRel, ref) => {
    if (!ref) return;
    if (/^(https?:|\/\/|#|mailto:|tel:|data:|javascript:)/i.test(ref)) return;
    if (/\$\{|\s/.test(ref)) return;            // rutas que se arman en el navegador
    const limpia = ref.split("?")[0].split("#")[0];
    if (!limpia) return;
    const destino = limpia.startsWith("/")
      ? path.join(DIST, limpia)
      : path.join(DIST, path.dirname(desdeRel), limpia);
    if (!fs.existsSync(destino)) faltantes.push(desdeRel + " → " + limpia);
  };

  for (const pagina of PAGINAS) {
    const html = fs.readFileSync(path.join(DIST, pagina), "utf8");
    for (const m of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) pedir(pagina, m[1]);
  }
  for (const css of fs.readdirSync(path.join(DIST, CARPETA_CSS))) {
    const rel = path.join(CARPETA_CSS, css);
    const txt = fs.readFileSync(path.join(DIST, rel), "utf8");
    for (const m of txt.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) pedir(rel, m[1]);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(DIST, "manifest.json"), "utf8"));
  for (const icono of manifest.icons || []) pedir("manifest.json", icono.src);

  return faltantes;
}

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // 1. Páginas revueltas
  for (const p of PAGINAS) await revolverHTML(p);

  // 2. Archivos sueltos
  for (const f of ARCHIVOS) escribir(f, leer(f));
  await revolverJS(SW);

  // 3. Imágenes tal cual
  copiarCarpeta(CARPETA_IMAGENES);

  // 4. Estilos y código revueltos
  for (const f of fs.readdirSync(path.join(RAIZ, CARPETA_CSS))) {
    if (f.endsWith(".css")) revolverCSS(path.join(CARPETA_CSS, f));
  }
  for (const f of fs.readdirSync(path.join(RAIZ, CARPETA_JS))) {
    if (f.endsWith(".js")) await revolverJS(path.join(CARPETA_JS, f));
  }

  // 5. Revisión final de referencias
  const faltantes = revisarReferencias();
  if (faltantes.length) {
    console.error("\n❌ PUBLICACIÓN DETENIDA. Falta(n) archivo(s) que la carta necesita:");
    faltantes.forEach((f) => console.error("   - " + f));
    console.error("Revisa el nombre o agrega el archivo a scripts/publicar.js.\n");
    process.exit(1);
  }

  console.log("✅ Carpeta dist/ lista: páginas, estilos, código e imágenes revueltos. Sin faltantes.");
}

main().catch((err) => {
  console.error("❌ Error al publicar:", err.message);
  process.exit(1);
});
