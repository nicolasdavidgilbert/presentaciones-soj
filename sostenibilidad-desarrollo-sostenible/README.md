# Sostenibilidad y desarrollo sostenible — presentación web

Astro + TypeScript + Tailwind CSS + GSAP (Observer) + Three.js + Lucide.
Funciona sin conexión: fuentes, iconos y librerías van incluidos en el build.

## Uso

```sh
npm run dev       # desarrollo: http://localhost:4321
npm run build     # genera dist/
npm run preview   # sirve dist/ en local (usar para exponer)
```

## Exponer en clase

- **Archivo offline (sin Internet ni nada instalado):** `npm run build:offline` genera
  `offline/Actividad_Evaluacion_1_SOJ.html`, un único archivo con todo dentro. Se abre con doble clic
  en cualquier navegador; llévalo en un USB.
- **Enlace web:** https://actividad-evaluacion-1-soj.vercel.app — para actualizarlo tras un cambio: `npm run deploy` (necesita Internet en clase).

## Controles

| Tecla | Acción |
| --- | --- |
| → ↓ Espacio AvPág / rueda / deslizar | Siguiente |
| ← ↑ RePág | Anterior |
| Inicio / Fin | Primera / última |
| número + Intro | Ir a esa diapositiva |
| F | Pantalla completa |
| G / ratón al borde izquierdo | Menú de miniaturas |
| ? | Ayuda |

La URL guarda la diapositiva actual (`#5`). Cada gesto de rueda avanza exactamente una diapositiva.

## Estructura

- `src/data/content.ts` — todo el texto (editar aquí).
- `src/slides/*.astro` — una diapositiva por archivo; orden en `src/pages/index.astro`.
- `src/scripts/presentation.ts` — controlador y transiciones entre diapositivas.
- `src/scripts/animations.ts` — animaciones de entrada (`data-a="up|down|left|right|fade|scale|line|words|tile"`, `data-count`).
- `src/scripts/scroll.ts` — rueda/táctil con GSAP Observer.
- `src/scripts/scene.ts` — globo de partículas 3D (portada y cierre: `scene="cover|outro"` en `<Slide>`).
