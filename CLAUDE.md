# Generador de posts — Kinenivel1

Este proyecto genera imágenes para los carruseles de Instagram y Facebook de **Kinenivel1**, una clínica de kinesiología en Santiago de Chile (líder en atenciones, terapias para dolores del cuerpo).

## Alcance

Genera imágenes a partir de un briefing (idea + contenido por slide). **No publica en redes**: el usuario sube los posts manualmente. El disparo es siempre manual, dentro de la conversación con Claude.

Hay dos tipos de post, con pipelines distintos:

1. **Fotos** (`generarCarrusel.js`) — escenas fotorrealistas generadas con kie.ai (consulta, ejercicios en persona, ambientes).
2. **Infografías** (`generarInfografia.js`) — piezas con texto (tips, listas de ejercicios, datos), renderizadas como HTML/CSS reales con Chrome local. **kie.ai nunca se usa para texto**: los modelos de imagen lo dibujan mal (letras deformadas). Todo el contenido con texto se arma como diseño propio.

## Identidad de marca

Ver guía completa en [branding/estilo.md](branding/estilo.md). Resumen:

- Estilo visual (fotos): **fotorrealista**
- Paleta: `#142B4F` (navy, primario), `#2E6FB0` (azul), `#C31B6E` (magenta, acento), `#EAF1F8` (fondo claro), `#1C2333` (texto oscuro)
- Tipografías: Lora (títulos), Work Sans (cuerpo) — vía Google Fonts, usadas en las infografías y en el copy de los posts
- Logo: [branding/logo.png](branding/logo.png) (el archivo original trae fondo blanco quemado, no transparente — `src/logoOverlay.js` lo resuelve con chroma key; usar siempre la versión procesada, nunca el PNG crudo directo)

## Formatos de salida

- **Fotos**: cada slide se genera **una sola vez** en `2:3` (vertical) vía kie.ai, y de esa misma imagen se deriva localmente (con `sharp`) un recorte central `1:1` (cuadrado) — cubre Instagram y Facebook sin duplicar tiempo de espera ni arriesgar que ambas versiones se vean distintas entre sí. El logo se superpone en una esquina de cada imagen.
- **Infografías**: se renderizan en `1080x1350` (4:5, tamaño recomendado de carrusel de Instagram). El logo va embebido en el header de cada slide (ya resuelto, transparente).

## Comandos

```
node src/generarCarrusel.js --briefing briefings/<archivo>.json     # fotos (kie.ai, ~5 min/slide, correr en background)
node src/generarInfografia.js --briefing briefings/<archivo>.json   # infografias (local, rapido)
```

## Notas técnicas de las infografías

- `src/infografia.js` arma el HTML (layouts: `portada`, `lista`, `cta`) y lo renderiza a PNG con `puppeteer-core` apuntando al Chrome ya instalado en la máquina (no descarga un Chromium propio).
- El logo se embebe como **base64 inline** en el `<img>`, no como `file://` — Chrome bloquea cargar recursos locales (`file://`) desde una página cargada vía `setContent` (origen `about:blank`); el `data:` URI evita ese problema de raíz.
- Si se agregan layouts nuevos, registrarlos en el objeto `LAYOUTS` de `src/infografia.js`.

## Estructura relevante

- `branding/` — identidad de marca (estilo, paleta, logo)
- `inspiracion/` — imágenes de referencia visual
- `briefings/` — briefings JSON de cada post pedido
- `resultados/` — imágenes generadas, una carpeta por post
- `src/` — código del pipeline:
  - `kieClient.js`, `githubHost.js` — pipeline de fotos (kie.ai)
  - `infografia.js`, `generarInfografia.js` — pipeline de infografías (HTML/Chrome)
  - `logoOverlay.js` — logo transparente + overlay/recorte para fotos
  - `util.js` — helpers compartidos (`parseArgs`, `slugify`)
