---
name: generar-carrusel
description: Genera las imágenes de un carrusel para Instagram/Facebook de Kinenivel1 (clínica de kinesiología) usando kie.ai, siguiendo la identidad de marca del proyecto. Usar cuando el usuario pida un post, carrusel, o imágenes para redes sociales de Kinenivel1.
---

# Generar carrusel — Kinenivel1

Flujo para armar y generar un carrusel de imágenes cuando el usuario trae una idea/tema para redes sociales. Contexto completo del proyecto en [CLAUDE.md](../../CLAUDE.md) y la guía de marca en [branding/estilo.md](../../branding/estilo.md) — leelos si necesitás el detalle completo de paleta/tono/formatos.

## Pasos

1. **Entender el pedido.** A partir de lo que el usuario cuenta (tema, dolor/servicio a destacar, cualquier imagen de referencia que pase), definir cuántos slides tiene el carrusel y qué debe mostrar cada uno.

2. **Redactar los prompts por slide** respetando la guía de estilo:
   - Fotorrealista, nunca ilustración/3D.
   - Ambiente de kinesiología/bienestar: consulta moderna y luminosa, o espacios de movimiento/alivio del dolor — cercano, no clínico-frío.
   - Los colores de marca (`#142B4F` navy, `#2E6FB0` azul, `#C31B6E` magenta) entran como acentos dentro de la escena (utilería, ropa, luces), no como bloques de color.
   - Nunca pedir texto renderizado dentro de la imagen (los modelos lo hacen mal).
   - Nunca pedir el logo dentro del prompt — se superpone solo, automáticamente.
   - Pedir composición centrada verticalmente (el recorte a cuadrado 1:1 se hace después, cortando arriba/abajo).
   - Si hay slides consecutivos, repetir en el prompt "mismo ambiente/estilo que la imagen anterior" para dar continuidad visual al carrusel.

3. **Armar el briefing** como JSON en `briefings/<slug-del-tema>.json`:
   ```json
   {
     "tema": "nombre del carrusel",
     "referencias": ["inspiracion/algo.jpg"],
     "slides": [
       { "prompt": "..." },
       { "prompt": "..." }
     ]
   }
   ```
   `referencias` es opcional (rutas dentro de `branding/`/`inspiracion/`; se suben solas a GitHub para darles URL pública). No hace falta incluir el logo ahí — se aplica aparte siempre, salvo que el usuario pida explícitamente no ponerlo (en ese caso agregar `"logo": false` al briefing).

4. **Correr el pipeline en background** (cada slide tarda ~5 minutos, y genera 2 archivos cada uno — no correr en foreground):
   ```
   node src/generarCarrusel.js --briefing briefings/<archivo>.json
   ```

5. **Cuando termine**, leer con la herramienta Read cada imagen resultante (`resultados/<carpeta>/slideN-2x3.png` y `slideN-1x1.png`) y mostrarlas en el chat. Aclarar cuál es para qué: `-2x3` vertical, `-1x1` cuadrado — ambas ya con el logo superpuesto.

6. **Recordar siempre**: esto no publica nada en redes. El usuario sube los posts manualmente cuando le gusten los resultados.
