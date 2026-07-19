# Generador de carruseles — Kinenivel1

Este proyecto genera imágenes para los carruseles de Instagram y Facebook de **Kinenivel1**, una clínica de kinesiología en Santiago de Chile (líder en atenciones, terapias para dolores del cuerpo).

## Alcance

Genera imágenes con la API de kie.ai a partir de un briefing (idea + prompts por slide). **No publica en redes**: el usuario sube los posts manualmente. El disparo es siempre manual, dentro de la conversación con Claude.

## Identidad de marca

Ver guía completa en [branding/estilo.md](branding/estilo.md). Resumen:

- Estilo visual: **fotorrealista**
- Paleta: `#142B4F` (navy, primario), `#2E6FB0` (azul), `#C31B6E` (magenta, acento), `#EAF1F8` (fondo claro), `#1C2333` (texto oscuro)
- Tipografías de marca (para el texto del post/caption, no para las imágenes): Lora (títulos), Work Sans (cuerpo)
- Logo: [branding/logo.png](branding/logo.png)

## Formatos de salida

Cada slide se genera **una sola vez** en formato `2:3` (vertical) vía kie.ai, y de esa misma imagen se deriva localmente (con `sharp`, sin volver a llamar a la API) un recorte central `1:1` (cuadrado). Así Instagram y Facebook quedan cubiertos sin duplicar tiempo de espera ni arriesgar que ambas versiones se vean distintas entre sí.

El logo (`branding/logo.png`) se superpone automáticamente en una esquina de cada imagen final — no se le pide a kie.ai que lo dibuje, porque los modelos generativos no reproducen logos con precisión de forma consistente.

## Comandos

```
node src/generarCarrusel.js --briefing briefings/<archivo>.json
```

Correr siempre en background: cada slide tarda ~5 minutos en generarse.

## Estructura relevante

- `branding/` — identidad de marca (estilo, paleta, logo)
- `inspiracion/` — imágenes de referencia visual
- `briefings/` — briefings JSON de cada carrusel pedido
- `resultados/` — imágenes generadas, una carpeta por carrusel
- `src/` — código del pipeline (`kieClient.js`, `githubHost.js`, `logoOverlay.js`, `generarCarrusel.js`)
