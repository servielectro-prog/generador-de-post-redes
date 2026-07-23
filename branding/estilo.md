# Guía de estilo — Kinenivel1

## Marca

Kinenivel1 — clínica de kinesiología en Santiago de Chile. Terapias para dolores del cuerpo. Se posiciona como líder en atenciones en la ciudad.

## Tono

Profesional pero cercano. Transmitir alivio, confianza y bienestar — no una estética clínica fría o de stock genérico. Las imágenes deben sentirse humanas y cálidas, no como una sala de hospital impersonal.

## Estilo visual — fotos (kie.ai)

- **Fotorrealista.** Nada de ilustración plana ni 3D estilizado.
- Luz natural o cálida, ambientes modernos y cuidados (consulta de kinesiología, espacios de movimiento/bienestar, cuerpo en movimiento o en alivio del dolor).
- Los colores de marca aparecen como acentos dentro de la escena (ropa, elementos de utilería, luces, detalles del ambiente) — no como bloques de color planos superpuestos.
- No pedirle a kie.ai que dibuje el logo — se superpone después el archivo real (ver más abajo).

## Estilo visual — infografías con texto

Probado el 2026-07-23: `gpt4o-image` (mismo modelo de kie.ai) sí puede renderizar texto en español de forma legible y prácticamente correcta si se le pasa el texto exacto en el prompt — mejor de lo esperado. Ese es ahora el camino por defecto (mismo pipeline que las fotos, `generarCarrusel.js`), no el motor HTML.

- Pasar el texto **literal** de cada título/bullet/item en el prompt, no una descripción vaga del contenido.
- Indicar la paleta en el prompt: fondo `#EAF1F8`, tarjetas blancas, acentos `#142B4F` (navy) y `#C31B6E` (magenta); tipografía serif elegante para títulos, sans-serif limpia para el cuerpo.
- Pedir explícitamente "texto en español correcto, sin errores ortográficos" — igual puede haber algún error de tilde suelto (ej. "gluteo" por "glúteo"), revisar el resultado antes de darlo por bueno.
- No pedirle que incluya el logo — se superpone después, como en las fotos.
- Si el usuario trae una infografía de referencia (ej. de la competencia), usarla solo como referencia de estructura/layout en `filesUrl` — nunca para clonar el contenido, la marca o el logo ajeno, y siempre curar/resumir el contenido para que entre cómodo en un carrusel de Instagram.

**Alternativa (motor HTML/Chrome, `generarInfografia.js`):** sigue disponible para cuando importe más tener texto 100% garantizado sin errores, edición instantánea sin gastar créditos, o los layouts estructurados ya armados (`portada`/`lista`/`cta`) alcancen. Estilo de ese motor: fondo claro, tarjetas blancas, barra de acento magenta bajo cada título, títulos en Lora bold navy, cuerpo en Work Sans, iconografía propia simple (círculos numerados, checks, anillos concéntricos que hacen eco del logo).

## Paleta de marca

| Color | Hex | Uso |
|---|---|---|
| Navy | `#142B4F` | Primario |
| Azul | `#2E6FB0` | Secundario |
| Magenta | `#C31B6E` | Acento |
| Fondo claro | `#EAF1F8` | Fondos/espacios claros |
| Texto oscuro | `#1C2333` | Texto (fuera de la imagen, en el copy) |

## Tipografías

Lora (títulos) y Work Sans (cuerpo), vía Google Fonts. Se usan para el texto del post en redes sociales (caption, texto sobreimpreso si se edita aparte), no como parte del prompt de generación de imagen.

## Logo

`branding/logo.png` — ícono circular con anillos en degradé azul→magenta y una "K" central. Se superpone automáticamente sobre cada imagen generada (esquina inferior derecha por defecto) vía `src/logoOverlay.js`; nunca se le pide a kie.ai que lo genere.

## Formatos

Cada slide se genera en `2:3` (vertical) y se deriva un recorte `1:1` (cuadrado) en local. Al escribir los prompts, pensar la composición para que el sujeto/foco principal quede centrado verticalmente — así el recorte a cuadrado no corta lo importante.
