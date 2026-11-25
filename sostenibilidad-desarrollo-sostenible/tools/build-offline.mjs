// Empaqueta dist/ en un único HTML autocontenido (CSS, JS, fuentes e icono dentro).
// Se abre con doble clic, sin servidor, sin Node y sin Internet.
// Uso: npm run build:offline   → offline/Actividad_Evaluacion_1_SOJ.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const read = (p) => readFileSync(join(dist, p.replace(/^\//, '')));
const mime = { woff2: 'font/woff2', woff: 'font/woff', svg: 'image/svg+xml', png: 'image/png' };
const dataUri = (p) => `data:${mime[p.split('.').pop()]};base64,${read(p).toString('base64')}`;

let html = read('index.html').toString();

// Hojas de estilo → <style>, con las fuentes woff2 incrustadas (se quitan los .woff de respaldo)
html = html.replace(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g, (_, href) => {
  const css = read(href)
    .toString()
    .replace(/,\s*url\([^)]+\.woff\)\s*format\(["']woff["']\)/g, '')
    .replace(/url\((\/_astro\/[^)]+\.woff2)\)/g, (_, f) => `url(${dataUri(f)})`);
  return `<style>${css}</style>`;
});

// Script de módulo externo → inline (los módulos inline sí funcionan en file://)
html = html.replace(/<script type="module" src="([^"]+)"><\/script>/g, (_, src) => {
  const js = read(src).toString().replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});

// Icono
html = html.replace(/href="(\/favicon\.svg)"/, (_, f) => `href="${dataUri(f)}"`);

const left = html.match(/(?:src|href)="\/_astro\/[^"]+"|url\(\/_astro\/[^)]+\)/g);
if (left) {
  console.error('Quedan recursos sin incrustar:', left);
  process.exit(1);
}

mkdirSync(join(root, 'offline'), { recursive: true });
const out = join(root, 'offline', 'Actividad_Evaluacion_1_SOJ.html');
writeFileSync(out, html);
console.log(`Creado ${out} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
