# Guía de estilo — Kinenivel1

## Marca

Kinenivel1 — clínica de kinesiología en Santiago de Chile. Terapias para dolores del cuerpo. Se posiciona como líder en atenciones en la ciudad.

## Tono

Profesional pero cercano. Transmitir alivio, confianza y bienestar — no una estética clínica fría o de stock genérico. Las imágenes deben sentirse humanas y cálidas, no como una sala de hospital impersonal.

## Estilo visual — fotos (kie.ai)

- **Fotorrealista.** Nada de ilustración plana ni 3D estilizado.
- Luz natural o cálida, ambientes modernos y cuidados (consulta de kinesiología, espacios de movimiento/bienestar, cuerpo en movimiento o en alivio del dolor).
- Los colores de marca aparecen como acentos dentro de la escena (ropa, elementos de utilería, luces, detalles del ambiente) — no como bloques de color planos superpuestos.
- **No pedirle a kie.ai que renderice texto dentro de la imagen.** Los modelos generativos no lo hacen de forma confiable (letras deformadas, mal escritas). Cualquier post que necesite texto (tips, listas, datos) se arma como infografía HTML, no como foto — ver más abajo.
- No pedirle a kie.ai que dibuje el logo — se superpone después el archivo real (ver más abajo).

## Estilo visual — infografías (HTML/Chrome)

- Fondo claro (`#EAF1F8`), tarjetas blancas para bloques de contenido, barra de acento magenta bajo cada título.
- Títulos en Lora bold navy; cuerpo en Work Sans.
- Iconografía simple y propia (círculos numerados, checks, anillos concéntricos que hacen eco del logo) en vez de intentar imitar íconos de referencias externas.
- Si el usuario trae una infografía de referencia (ej. de la competencia), usarla solo como inspiración de contenido/estructura — nunca clonar el layout literal, y siempre curar/resumir para que entre cómodo en un carrusel de Instagram.

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
