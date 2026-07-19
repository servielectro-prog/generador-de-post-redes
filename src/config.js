const path = require("node:path");
const fs = require("node:fs");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Revisa tu archivo .env (copia .env.example si no existe).`
    );
  }
  return value;
}

module.exports = {
  kieApiKey: required("KIE_API_KEY"),
  github: {
    owner: required("GITHUB_OWNER"),
    repo: required("GITHUB_REPO"),
    branch: process.env.GITHUB_BRANCH || "main",
  },
  paths: {
    root: path.join(__dirname, ".."),
    resultados: path.join(__dirname, "..", "resultados"),
    branding: path.join(__dirname, "..", "branding"),
    inspiracion: path.join(__dirname, "..", "inspiracion"),
  },
};
