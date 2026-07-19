const fs = require("node:fs");
const path = require("node:path");
const config = require("./config");

const BASE_URL = "https://api.kie.ai/api/v1/gpt4o-image";
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

async function kieFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.kieApiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = await res.json();
  if (!res.ok || body.code !== 200) {
    throw new Error(
      `kie.ai respondio con error (${res.status}): ${body.msg || JSON.stringify(body)}`
    );
  }
  return body.data;
}

/**
 * @param {{prompt: string, filesUrl?: string[], size?: string}} params
 * @returns {Promise<string>} taskId
 */
async function crearTarea({ prompt, filesUrl, size = "1:1" }) {
  if (!prompt && (!filesUrl || filesUrl.length === 0)) {
    throw new Error("Se requiere 'prompt' o al menos una referencia en 'filesUrl'.");
  }
  const data = await kieFetch(`${BASE_URL}/generate`, {
    method: "POST",
    body: JSON.stringify({
      prompt,
      filesUrl: filesUrl && filesUrl.length > 0 ? filesUrl : undefined,
      size,
    }),
  });
  return data.taskId;
}

async function consultarTarea(taskId) {
  return kieFetch(`${BASE_URL}/record-info?taskId=${encodeURIComponent(taskId)}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Espera a que una tarea termine y devuelve las URLs de resultado.
 * @returns {Promise<string[]>}
 */
async function esperarResultado(taskId) {
  const inicio = Date.now();
  const deadline = inicio + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const data = await consultarTarea(taskId);
    if (data.status === "SUCCESS") {
      return data.response.resultUrls;
    }
    if (data.status === "CREATE_TASK_FAILED" || data.status === "GENERATE_FAILED") {
      throw new Error(`La tarea ${taskId} fallo: ${data.errorMessage || data.status}`);
    }
    console.log(
      `  ...esperando (${Math.round((Date.now() - inicio) / 1000)}s, estado: ${data.status})`
    );
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Se agoto el tiempo de espera para la tarea ${taskId}`);
}

async function descargarImagen(url, destino) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`No se pudo descargar la imagen generada (${res.status}): ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, buffer);
  return destino;
}

/**
 * Genera una imagen y la descarga a disco.
 * @param {{prompt: string, filesUrl?: string[], size?: string}} params
 * @param {string} destino ruta local donde guardar el resultado
 */
async function generarImagen(params, destino) {
  const taskId = await crearTarea(params);
  const [resultUrl] = await esperarResultado(taskId);
  return descargarImagen(resultUrl, destino);
}

module.exports = { crearTarea, consultarTarea, esperarResultado, generarImagen };
