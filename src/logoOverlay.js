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

const LOGO_TRANSPARENTE_PATH = path.join(config.paths.branding, "logo-transparente.png");

/**
 * Genera (si hace falta) branding/logo-transparente.png y devuelve su ruta,
 * para poder referenciarlo directo (ej. como <img src> en HTML) sin repetir
 * el chroma key cada vez.
 */
async function obtenerLogoTransparentePath() {
  if (!fs.existsSync(LOGO_TRANSPARENTE_PATH)) {
    const buffer = await logoConFondoTransparente();
    fs.writeFileSync(LOGO_TRANSPARENTE_PATH, buffer);
  }
  return LOGO_TRANSPARENTE_PATH;
}

/**
 * Superpone branding/logo.png sobre una imagen, in-place.
 * @param {string} rutaImagen
 * @param {{ancho?: number, left?: number, top?: number}} [opciones]
 *   Por defecto: esquina inferior derecha, ancho LOGO_ANCHO. `left`/`top`
 *   permiten elegir otra posicion (ej. un hueco libre entre dos elementos
 *   en una infografia, donde el default taparia texto).
 */
async function aplicarLogo(rutaImagen, opciones = {}) {
  if (!fs.existsSync(LOGO_PATH)) {
    throw new Error(`No se encontro el logo en ${LOGO_PATH}`);
  }

  const ancho = opciones.ancho ?? LOGO_ANCHO;
  const logoTransparente = await logoConFondoTransparente();
  const logoBuffer = await sharp(logoTransparente).resize({ width: ancho }).toBuffer();
  const logoMeta = await sharp(logoBuffer).metadata();
  const imagenMeta = await sharp(rutaImagen).metadata();

  const left = opciones.left ?? imagenMeta.width - logoMeta.width - MARGEN;
  const top = opciones.top ?? imagenMeta.height - logoMeta.height - MARGEN;

  const destinoTemporal = `${rutaImagen}.tmp`;
  await sharp(rutaImagen)
    .composite([{ input: logoBuffer, left, top }])
    .toFile(destinoTemporal);

  fs.renameSync(destinoTemporal, rutaImagen);
}

/**
 * Recorta un cuadrado de una imagen (ej. para derivar 1:1 desde un 2:3).
 * @param {string} origen
 * @param {string} destino
 * @param {number} anclaVertical 0 = pegado arriba, 0.5 = centrado, 1 = pegado abajo.
 *   Por defecto sesgado hacia arriba: en fotos de personas la cara suele estar
 *   cerca del borde superior, y hay mas margen de sobra abajo (piso, cuerpo).
 */
async function recortarCuadrado(origen, destino, anclaVertical = 0.15) {
  const meta = await sharp(origen).metadata();
  const lado = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - lado) / 2);
  const top = Math.floor((meta.height - lado) * anclaVertical);
  await sharp(origen).extract({ left, top, width: lado, height: lado }).toFile(destino);
}

module.exports = { aplicarLogo, recortarCuadrado, obtenerLogoTransparentePath };
