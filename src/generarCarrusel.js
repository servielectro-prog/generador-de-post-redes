const fs = require("node:fs");
const path = require("node:path");
const config = require("./config");
const kieClient = require("./kieClient");
const githubHost = require("./githubHost");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args[key] = value;
    }
  }
  return args;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function resolverReferencias(rutas) {
  const urls = [];
  for (const ruta of rutas) {
    const url = await githubHost.subirReferencia(ruta);
    console.log(`  - ${ruta} -> ${url}`);
    urls.push(url);
  }
  return urls;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.briefing) {
    console.error("Uso: node src/generarCarrusel.js --briefing ruta/al/briefing.json");
    process.exit(1);
  }

  const briefingPath = path.resolve(args.briefing);
  const briefing = JSON.parse(fs.readFileSync(briefingPath, "utf8"));

  if (!briefing.tema || !Array.isArray(briefing.slides) || briefing.slides.length === 0) {
    throw new Error("El briefing debe tener 'tema' y al menos un elemento en 'slides'.");
  }

  console.log(`Carrusel: ${briefing.tema} (${briefing.slides.length} slides)`);

  let referenciasGlobales = [];
  if (Array.isArray(briefing.referencias) && briefing.referencias.length > 0) {
    console.log(`Subiendo ${briefing.referencias.length} imagen(es) de referencia a GitHub...`);
    referenciasGlobales = await resolverReferencias(briefing.referencias);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const carpetaSalida = path.join(
    config.paths.resultados,
    `${slugify(briefing.tema)}-${timestamp}`
  );

  const rutasGeneradas = [];
  for (let i = 0; i < briefing.slides.length; i++) {
    const slide = briefing.slides[i];
    const numero = i + 1;
    console.log(`Generando slide ${numero}/${briefing.slides.length}...`);

    let referenciasSlide = [];
    if (Array.isArray(slide.referencias) && slide.referencias.length > 0) {
      referenciasSlide = await resolverReferencias(slide.referencias);
    }

    const filesUrl = [...referenciasGlobales, ...referenciasSlide].slice(0, 5);
    const destino = path.join(carpetaSalida, `slide${numero}.png`);

    await kieClient.generarImagen(
      { prompt: slide.prompt, filesUrl, size: briefing.size || "1:1" },
      destino
    );
    console.log(`  Listo: ${destino}`);
    rutasGeneradas.push(destino);
  }

  console.log("\nCarrusel generado. Imagenes:");
  rutasGeneradas.forEach((p) => console.log(`  ${p}`));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
