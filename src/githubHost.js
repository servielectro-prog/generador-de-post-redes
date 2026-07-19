const path = require("node:path");
const { execFileSync } = require("node:child_process");
const config = require("./config");

const HEAD_CHECK_RETRIES = 6;
const HEAD_CHECK_DELAY_MS = 2000;

function git(args) {
  return execFileSync("git", args, {
    cwd: config.paths.root,
    encoding: "utf8",
  }).trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rutaRelativa(localPath) {
  const rel = path.relative(config.paths.root, path.resolve(localPath));
  if (rel.startsWith("..")) {
    throw new Error(
      `${localPath} esta fuera del repo (${config.paths.root}); no se puede alojar via GitHub.`
    );
  }
  return rel.split(path.sep).join("/");
}

function urlPublica(relPath) {
  const { owner, repo, branch } = config.github;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${relPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

async function verificarAccesible(url) {
  for (let intento = 1; intento <= HEAD_CHECK_RETRIES; intento++) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return true;
    } catch {
      // reintenta
    }
    await sleep(HEAD_CHECK_DELAY_MS);
  }
  return false;
}

/**
 * Sube (si hace falta) un archivo local al repo de GitHub y devuelve su URL publica raw.
 * Si el archivo ya esta commiteado sin cambios, no hace push de nuevo.
 * @param {string} localPath ruta local del archivo (ej. branding/logo.png)
 */
async function subirReferencia(localPath) {
  const rel = rutaRelativa(localPath);
  const status = git(["status", "--porcelain", "--", rel]);

  if (status) {
    git(["add", "--", rel]);
    git(["commit", "-m", `Agregar referencia: ${rel}`]);
    git(["push", "origin", config.github.branch]);
  }

  const url = urlPublica(rel);
  const accesible = await verificarAccesible(url);
  if (!accesible) {
    throw new Error(
      `La imagen se subio a GitHub pero la URL publica todavia no responde: ${url}`
    );
  }
  return url;
}

module.exports = { subirReferencia, urlPublica, rutaRelativa };
