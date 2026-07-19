const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const config = require("./config");

const LOGO_PATH = path.join(config.paths.branding, "logo.png");
const LOGO_ANCHO = 140;
const MARGEN = 40;

// El logo original viene con un fondo blanco/gris claro "quemado" en el PNG
// (no transparente de verdad, aunque el archivo tenga canal alpha). Estos
// umbrales separan fondo (canal minimo alto) de diseño (canal minimo bajo:
// navy/azul/magenta) para volver transparente el fondo por chroma key.
const UMBRAL_TRANSPARENTE = 210;
const UMBRAL_OPACO = 180;

/**
 * Devuelve un buffer PNG del logo con el fondo claro vuelto transparente
 * (chroma key por canal minimo, con suavizado en el borde).
 */
async function logoConFondoTransparente() {
  const { data, info } = await sharp(LOGO_PATH)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    const minCanal = Math.min(data[i], data[i + 1], data[i + 2]);
    const factorOpacidad = Math.min(
      1,
      Math.max(0, (UMBRAL_TRANSPARENTE - minCanal) / (UMBRAL_TRANSPARENTE - UMBRAL_OPACO))
    );
    data[i + 3] = Math.round(data[i + 3] * factorOpacidad);
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();
}

/**
 * Superpone branding/logo.png en la esquina inferior derecha de una imagen, in-place.
 * @param {string} rutaImagen
 */
async function aplicarLogo(rutaImagen) {
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`No se encontro el logo en ${LOGO_PATH}`);
  }

  const logoTransparente = await logoConFondoTransparente();
  const logoBuffer = await sharp(logoTransparente).resize({ width: LOGO_ANCHO }).toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const imagenMeta = await sharp(rutaImagen).metadata();

  const destinoTemporal = `${rutaImagen}.tmp`;
  await sharp(rutaImagen)
    .composite([
      {
        input: logoBuffer,
        left: imagenMeta.width - logoMeta.width - MARGEN,
        top: imagenMeta.height - logoMeta.height - MARGEN,
      },
    ])
    .toFile(destinoTemporal);

  fs.renameSync(destinoTemporal, rutaImagen);
}

/**
 * Recorta el cuadrado central de una imagen (ej. para derivar 1:1 desde un 2:3).
 * @param {string} origen
 * @param {string} destino
 */
async function recortarCuadrado(origen, destino) {
  const meta = await sharp(origen).metadata();
  const lado = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - lado) / 2);
  const top = Math.floor((meta.height - lado) / 2);
  await sharp(origen).extract({ left, top, width: lado, height: lado }).toFile(destino);
}

module.exports = { aplicarLogo, recortarCuadrado };
