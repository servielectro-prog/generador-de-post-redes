const fs = require("node:fs");
const path = require("node:path");
const config = require("./config");
const logoOverlay = require("./logoOverlay");
const infografia = require("./infografia");
const { parseArgs, slugify } = require("./util");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.briefing) {
    console.error("Uso: node src/generarInfografia.js --briefing ruta/al/briefing.json");
    process.exit(1);
  }

  const briefingPath = path.resolve(args.briefing);
  const briefing = JSON.parse(fs.readFileSync(briefingPath, "utf8"));

  if (!briefing.tema || !Array.isArray(briefing.slides) || briefing.slides.length === 0) {
    throw new Error("El briefing debe tener 'tema' y al menos un elemento en 'slides'.");
  }

  console.log(`Infografia: ${briefing.tema} (${briefing.slides.length} slides)`);

  const logoPath = await logoOverlay.obtenerLogoTransparentePath();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const carpetaSalida = path.join(
    config.paths.resultados,
    `${slugify(briefing.tema)}-${timestamp}`
  );
  fs.mkdirSync(carpetaSalida, { recursive: true });

  const rutasGeneradas = [];
  for (let i = 0; i < briefing.slides.length; i++) {
    const numero = i + 1;
    console.log(`Renderizando slide ${numero}/${briefing.slides.length}...`);
    const html = infografia.generarHTML(briefing.slides[i], logoPath);
    const destino = path.join(carpetaSalida, `slide${numero}.png`);
    await infografia.renderizarHTML(html, destino);
    console.log(`  Listo: ${destino}`);
    rutasGeneradas.push(destino);
  }

  console.log("\nInfografia generada. Imagenes:");
  rutasGeneradas.forEach((p) => console.log(`  ${p}`));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
