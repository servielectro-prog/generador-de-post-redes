# Generador de posts — Kinenivel1

Este proyecto genera imágenes para los carruseles de Instagram y Facebook de **Kinenivel1**, una clínica de kinesiología en Santiago de Chile (líder en atenciones, terapias para dolores del cuerpo).

## Alcance

Genera imágenes a partir de un briefing (idea + contenido por slide). **No publica en redes**: el usuario sube los posts manualmente. El disparo es siempre manual, dentro de la conversación con Claude.

Hay dos tipos de post:

1. **Fotos** (`generarCarrusel.js`) — escenas fotorrealistas generadas con kie.ai (consulta, ejercicios en persona, ambientes).
2. **Infografías con texto** (tips, listas de ejercicios, datos) — **también con `generarCarrusel.js` / kie.ai**, pasando el texto exacto y la paleta de marca en el prompt (probado el 2026-07-23: el modelo renderiza texto en español correctamente, salvo algún error de tilde ocasional — revisar antes de dar por bueno). Existe también un motor propio HTML/CSS (`generarInfografia.js`, renderizado con Chrome local) como alternativa si se necesita texto garantizado sin errores, edición instantánea sin gastar créditos, o layouts muy estructurados — ver `.claude/skills/generar-infografia/SKILL.md` para el detalle de cuándo usar cada camino.

## Identidad de marca

Ver guía completa en [branding/estilo.md](branding/estilo.md). Resumen:

- Estilo visual (fotos): **fotorrealista**
- Paleta: `#142B4F` (navy, primario), `#2E6FB0` (azul), `#C31B6E` (magenta, acento), `#EAF1F8` (fondo claro), `#1C2333` (texto oscuro)
- Tipografías: Lora (títulos), Work Sans (cuerpo) — vía Google Fonts, usadas en las infografías y en el copy de los posts
- Logo: [branding/logo.png](branding/logo.png) (el archivo original trae fondo blanco quemado, no transparente — `src/logoOverlay.js` lo resuelve con chroma key; usar siempre la versión procesada, nunca el PNG crudo directo)

## Formatos de salida

**Importante — límite real de Instagram (verificado 2026-07-24):** el feed/carrusel de IG solo acepta hasta `4:5` (0.8) de alto — cualquier imagen más alta se recorta automáticamente al subirla, sin avisar. Nuestro `2:3` (0.667) es más alto que eso, así que **el archivo `-2x3.png` no es seguro para Instagram** — sirve para Facebook (menos estricto) o para verlo acá en el chat, pero si se sube a un carrusel de IG, Instagram se lo va a recortar solo. kie.ai no tiene un tamaño nativo `4:5`; el único tamaño que genera y que IG acepta sin tocar es **`1:1`** (cuadrado). Para cualquier pieza pensada específicamente para Instagram, generar directo en `1:1`, no asumir que el `-2x3.png` sirve ahí también.

- **kie.ai — fotos para ambas redes**: cada slide se genera **una sola vez** en `2:3` (vertical, sirve para Facebook/vista previa), y de esa misma imagen se deriva localmente (con `sharp`) un recorte central `1:1` (cuadrado, el que realmente hay que usar en Instagram) — sin duplicar tiempo de espera ni arriesgar que ambas versiones se vean distintas entre sí. El recorte esta sesgado hacia arriba (`anclaVertical` por defecto 0.15, no 0.5) porque las caras suelen estar cerca del borde superior. Funciona porque en una foto hay un sujeto puntual que se puede recortar alrededor.
- **kie.ai — infografías para ambas redes**: el recorte de arriba **no sirve** cuando el contenido ocupa todo el alto (título+texto+CTA) — corta contenido real. Para esto, el briefing lleva `"recorte": false`, y el `1:1` se genera como una llamada independiente a kie.ai (mismo prompt, `size:"1:1"`) en vez de recortar — el doble de costo/tiempo para esa slide, pero sin perder contenido.
- **Piezas solo para Instagram** (ej. un carrusel que no se va a postear en Facebook): generar directo en `1:1` únicamente, sin pasar por `2:3` — más simple y más barato (no hace falta el paso de `recorte`).
- El logo se superpone en una esquina (o donde haya espacio libre real — ver nota sobre posición custom en `logoOverlay.aplicarLogo`) de cada imagen en todos los casos.
- **Motor HTML** (alternativa): se renderiza en `1080x1350` (4:5 real, dentro del límite de Instagram). El logo va embebido en el header de cada slide (ya resuelto, transparente).

## Comandos

```
node src/generarCarrusel.js --briefing briefings/<archivo>.json     # fotos e infografias via kie.ai, ~5 min/slide y ~6 creditos/imagen, correr en background
node src/generarInfografia.js --briefing briefings/<archivo>.json   # motor HTML alternativo (local, rapido, gratis)
```

Chequear saldo de créditos antes de una tanda grande: `GET https://api.kie.ai/api/v1/chat/credit` (header `Authorization: Bearer <KIE_API_KEY>`).

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
