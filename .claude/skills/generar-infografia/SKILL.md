---
name: generar-infografia
description: Genera un post con texto (tips, lista de ejercicios, datos) para Instagram/Facebook de Kinenivel1 usando kie.ai. Usar cuando el usuario pida un post/carrusel con harto texto, una infografía, o pase de referencia una infografía de otra cuenta/competencia.
---

# Generar infografía — Kinenivel1

Flujo para posts con texto. Contexto completo en [CLAUDE.md](../../CLAUDE.md) y [branding/estilo.md](../../branding/estilo.md).

## Cómo se genera (actualizado 2026-07-23)

Antes se armaba el diseño como HTML/CSS propio porque se asumía que kie.ai no iba a renderizar bien el texto. Se probó directo con `gpt4o-image` (mismo modelo que ya usamos para fotos) pasando el texto exacto en el prompt, y el resultado fue muy bueno — texto legible y correcto (con algún error de tilde ocasional, ej. "gluteo" en vez de "glúteo" — revisar el resultado antes de dar por bueno un texto largo), más una ilustración propia por sección generada en la misma imagen. Por eso ahora el camino por defecto es generar la infografía completa con kie.ai, con el **mismo pipeline que las fotos** (`src/generarCarrusel.js` — no hace falta código nuevo, el prompt es lo único que cambia).

El motor HTML (`src/infografia.js` + `node src/generarInfografia.js`) sigue andando y queda como alternativa para casos donde importe más tener el texto 100% exacto/editable sin gastar créditos ni esperar (ej. cambiar un typo sin regenerar toda la imagen), o si en algún pedido puntual la IA no da un buen resultado de texto.

## Pasos (camino por defecto: kie.ai)

1. **Si el usuario trae una referencia** (ej. una infografía de la competencia), pedirle que la guarde como archivo en `inspiracion/` (no se puede tomar directo del chat). Se usa como referencia de **estructura/layout** en `filesUrl`, nunca para clonar el contenido, la marca o el logo ajeno — el prompt debe aclarar explícitamente que no incluya el logo ni el nombre de la marca de la imagen de referencia.

2. **Curar el contenido**: normalmente la referencia trae más contenido del que entra en un carrusel de Instagram. Preguntarle al usuario cómo repartirlo en slides y qué tan detallado lo quiere, no asumirlo (ver conversación previa para el criterio ya usado: portada + bloque de contenido principal + cierre con CTA).

3. **Escribir el prompt** de cada slide con:
   - El texto exacto que tiene que aparecer (título, subtítulos, bullets/items con su copy completo) — cuanto más literal el texto en el prompt, mejor sale.
   - La paleta de marca: fondo `#EAF1F8`, acentos `#142B4F` (navy) y `#C31B6E` (magenta), tarjetas blancas.
   - Tipografía: serif elegante para títulos, sans-serif limpia para el cuerpo (se le describe el estilo, no hace falta nombrar Lora/Work Sans literalmente).
   - Aclarar que el texto debe estar en español correcto, sin errores ortográficos ni letras deformadas.
   - Aclarar que NO incluya ningún logo (se superpone aparte, como con las fotos).

4. **Armar el briefing** en `briefings/<slug>.json`, igual que para fotos:
   ```json
   {
     "tema": "nombre del post",
     "referencias": ["inspiracion/<archivo-de-referencia>.png"],
     "slides": [
       { "prompt": "..." }
     ]
   }
   ```

5. **Generar en background** (mismo tiempo que las fotos, ~5 min/slide, y mismo costo: ~6 créditos por imagen — chequear saldo con `GET https://api.kie.ai/api/v1/chat/credit` antes de tandas grandes):
   ```
   node src/generarCarrusel.js --briefing briefings/<archivo>.json
   ```
   Esto ya genera el `2:3`, deriva el `1:1`, y aplica el logo automáticamente — no hace falta nada extra.

6. **Mostrar los resultados** con Read y revisar el texto con cuidado (tildes, ortografía) antes de darlo por bueno — a diferencia del HTML, acá sí puede haber errores menores.

7. **Recordar siempre**: esto no publica nada en redes. El usuario sube los posts manualmente.

## Alternativa: motor HTML (`src/infografia.js`)

Usar en vez del camino de arriba si el usuario pide texto garantizado sin errores, iteración instantánea/gratis, o layouts (`portada`/`lista`/`cta`) muy estructurados. Ver el código de `src/infografia.js` y `src/generarInfografia.js` — mismo patrón de briefing pero con `layout` por slide en vez de `prompt` libre.
