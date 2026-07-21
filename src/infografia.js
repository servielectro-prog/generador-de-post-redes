const fs = require("node:fs");
const puppeteer = require("puppeteer-core");

const ANCHO = 1080;
const ALTO = 1350; // 4:5, tamano recomendado de carrusel para Instagram

const COLORES = {
  navy: "#142B4F",
  azul: "#2E6FB0",
  magenta: "#C31B6E",
  fondo: "#EAF1F8",
  texto: "#1C2333",
};

function detectarChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidatos = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  const encontrado = candidatos.find((p) => fs.existsSync(p));
  if (!encontrado) {
    throw new Error(
      "No se encontro Chrome/Edge instalado en las rutas habituales. Definir CHROME_PATH en .env con la ruta al ejecutable."
    );
  }
  return encontrado;
}

function documentoHTML(contenido) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Work+Sans:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${ANCHO}px; height: ${ALTO}px; }
  body {
    font-family: 'Work Sans', sans-serif;
    color: ${COLORES.texto};
    background: ${COLORES.fondo};
    overflow: hidden;
  }
  .slide { position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; }
  .contenido { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 56px; gap: 40px; }
  h1, .titulo { font-family: 'Lora', serif; }
  .header { display: flex; align-items: center; gap: 16px; padding: 40px 56px 0; flex: 0 0 auto; }
  .header img { width: 52px; height: 52px; }
  .header span {
    font-weight: 700; font-size: 22px; color: ${COLORES.navy}; letter-spacing: 1px;
  }
  .barra { width: 64px; height: 6px; background: ${COLORES.magenta}; border-radius: 3px; }
  .check {
    flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%;
    background: ${COLORES.magenta}; display: flex; align-items: center; justify-content: center;
  }
  .badge {
    flex-shrink: 0; width: 56px; height: 56px; border-radius: 50%;
    background: ${COLORES.navy}; color: white; font-family: 'Lora', serif; font-weight: 700;
    font-size: 26px; display: flex; align-items: center; justify-content: center;
  }
</style>
</head>
<body>${contenido}</body>
</html>`;
}

function imagenDataURI(rutaImagen) {
  const base64 = fs.readFileSync(rutaImagen).toString("base64");
  return `data:image/png;base64,${base64}`;
}
const logoDataURI = imagenDataURI;

function headerHTML(logoPath) {
  return `
    <div class="header">
      <img src="${logoDataURI(logoPath)}" />
      <span>KINENIVEL1</span>
    </div>
  `;
}

function anilloRadarSVG() {
  return `
    <svg width="220" height="220" viewBox="0 0 220 220">
      <circle cx="110" cy="110" r="100" fill="none" stroke="${COLORES.navy}" stroke-width="3" opacity="0.25"/>
      <circle cx="110" cy="110" r="72" fill="none" stroke="${COLORES.azul}" stroke-width="4" opacity="0.5"/>
      <circle cx="110" cy="110" r="44" fill="none" stroke="${COLORES.magenta}" stroke-width="5"/>
      <circle cx="110" cy="110" r="10" fill="${COLORES.magenta}"/>
    </svg>
  `;
}

function checkSVG() {
  return `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 8.5 L6 12.5 L14 3" stroke="white" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function slidePortada({ titulo, subtitulo, texto, zonaLabel }, logoPath) {
  return documentoHTML(`
    <div class="slide">
      ${headerHTML(logoPath)}
      <div class="contenido">
        <div>
          <div class="barra" style="margin-bottom:26px;"></div>
          <h1 style="font-size:60px;line-height:1.1;color:${COLORES.navy};font-weight:700;">${titulo}</h1>
          <p style="font-weight:600;font-size:25px;color:${COLORES.azul};margin-top:22px;">${subtitulo}</p>
          <p style="font-size:22px;line-height:1.55;margin-top:26px;max-width:900px;">${texto}</p>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:18px;">
          ${anilloRadarSVG()}
          <span style="font-weight:600; font-size:20px; color:${COLORES.navy};">${zonaLabel}</span>
        </div>
      </div>
    </div>
  `);
}

function slideLista({ titulo, items }, logoPath) {
  const filas = items
    .map(
      (item, i) => `
      <div style="display:flex; gap:24px; align-items:center; background:white; border-radius:18px; padding:24px 28px; margin-bottom:20px;">
        <div class="badge">${i + 1}</div>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:25px; color:${COLORES.navy};">${item.titulo}</div>
          <div style="font-size:20px; line-height:1.4; margin-top:6px;">${item.texto}</div>
        </div>
        ${
          item.imagen
            ? `<img src="${imagenDataURI(item.imagen)}" style="width:120px; height:120px; border-radius:14px; object-fit:cover; flex-shrink:0;" />`
            : ""
        }
      </div>
    `
    )
    .join("");

  return documentoHTML(`
    <div class="slide">
      ${headerHTML(logoPath)}
      <div class="contenido">
        <div>
          <div class="barra" style="margin-bottom:26px;"></div>
          <h1 style="font-size:44px;line-height:1.15;color:${COLORES.navy};font-weight:700;">${titulo}</h1>
        </div>
        <div>${filas}</div>
      </div>
    </div>
  `);
}

function slideCTA({ titulo, items, cta }, logoPath) {
  const filas = items
    .map(
      (texto) => `
      <div style="display:flex; gap:18px; align-items:flex-start; margin-bottom:22px;">
        <div class="check" style="margin-top:2px;">${checkSVG()}</div>
        <div style="font-size:22px; line-height:1.4;">${texto}</div>
      </div>
    `
    )
    .join("");

  return documentoHTML(`
    <div class="slide">
      ${headerHTML(logoPath)}
      <div class="contenido" style="padding-bottom:170px;">
        <div>
          <div class="barra" style="margin-bottom:26px;"></div>
          <h1 style="font-size:46px;line-height:1.15;color:${COLORES.navy};font-weight:700;">${titulo}</h1>
        </div>
        <div>${filas}</div>
      </div>
      <div style="position:absolute; bottom:70px; left:56px; right:56px; background:${COLORES.magenta}; border-radius:20px; padding:34px 36px; text-align:center;">
        <div style="color:white; font-family:'Lora'; font-weight:700; font-size:28px; line-height:1.3;">${cta}</div>
      </div>
    </div>
  `);
}

const LAYOUTS = { portada: slidePortada, lista: slideLista, cta: slideCTA };

/**
 * @param {{layout: "portada"|"lista"|"cta"} & object} slide
 * @param {string} logoPath
 * @returns {string} HTML completo del slide
 */
function generarHTML(slide, logoPath) {
  const layout = LAYOUTS[slide.layout];
  if (!layout) {
    throw new Error(`Layout desconocido: "${slide.layout}" (usar portada, lista o cta)`);
  }
  return layout(slide, logoPath);
}

/**
 * Renderiza un HTML completo a PNG usando Chrome local.
 * @param {string} html
 * @param {string} destino
 */
async function renderizarHTML(html, destino) {
  const browser = await puppeteer.launch({
    executablePath: detectarChromePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: ANCHO, height: ALTO, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.screenshot({ path: destino, type: "png" });
  } finally {
    await browser.close();
  }
}

module.exports = { generarHTML, renderizarHTML, ANCHO, ALTO };
