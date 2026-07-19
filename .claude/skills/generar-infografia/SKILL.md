---
name: generar-infografia
description: Genera un post con texto (tips, lista de ejercicios, datos) para Instagram/Facebook de Kinenivel1 como diseño HTML propio, no como imagen de IA. Usar cuando el usuario pida un post/carrusel con harto texto, una infografía, o pase de referencia una infografía de otra cuenta/competencia.
---

# Generar infografía — Kinenivel1

Flujo para posts con texto (a diferencia de las fotos, ver skill `generar-carrusel`). Contexto completo en [CLAUDE.md](../../CLAUDE.md) y [branding/estilo.md](../../branding/estilo.md).

## Por qué es un flujo distinto

kie.ai (y los modelos de imagen generativos en general) no renderizan texto de forma confiable — salen letras deformadas o mal escritas. Para cualquier post con texto (títulos, bullets, instrucciones), el diseño se arma como HTML/CSS real con la paleta e tipografías de marca, y se renderiza a PNG con Chrome local (`src/infografia.js` + `puppeteer-core`). Es instantáneo (sin las esperas de ~5 min/imagen de kie.ai).

## Pasos

1. **Si el usuario trae una referencia** (ej. una infografía de la competencia), no clonarla literalmente: tomar la estructura de contenido como inspiración y curarla — normalmente hay demasiado contenido para un carrusel de Instagram (que se lee swipeando). Preguntarle al usuario cómo repartir el contenido en los slides que pida y qué tan detallado lo quiere (resumido/visual vs. detallado), no asumirlo.

2. **Elegir el layout de cada slide** entre los ya disponibles en `src/infografia.js`:
   - `portada`: título + subtítulo + texto breve + ilustración de anillos (motivo que hace eco del logo). Para abrir el carrusel.
   - `lista`: título + items numerados (título + una línea cada uno). Para pasos, ejercicios, tips.
   - `cta`: título + checklist con tildes + caja de llamado a la acción al final. Para cerrar el carrusel.
   
   Si hace falta un layout que no existe, agregarlo a `LAYOUTS` en `src/infografia.js` siguiendo el mismo patrón (función que arma el HTML del slide) — no intentar forzar contenido en un layout que no le queda.

3. **Armar el briefing** en `briefings/<slug>.json`:
   ```json
   {
     "tema": "nombre del post",
     "slides": [
       { "layout": "portada", "titulo": "...", "subtitulo": "...", "texto": "...", "zonaLabel": "..." },
       { "layout": "lista", "titulo": "...", "items": [{ "titulo": "...", "texto": "..." }] },
       { "layout": "cta", "titulo": "...", "items": ["...", "..."], "cta": "..." }
     ]
   }
   ```

4. **Generar** (rápido, no hace falta background):
   ```
   node src/generarInfografia.js --briefing briefings/<archivo>.json
   ```

5. **Mostrar los resultados** con Read y avisar que no incluyen datos de contacto (teléfono/handle) salvo que el usuario los haya dado — eso se agrega si lo pide.

6. **Recordar siempre**: esto no publica nada en redes. El usuario sube los posts manualmente.
