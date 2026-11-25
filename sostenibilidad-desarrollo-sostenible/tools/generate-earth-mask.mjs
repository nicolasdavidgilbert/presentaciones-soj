// Genera src/data/earth-mask.ts: máscara equirectangular tierra/mar a partir de Natural Earth (world-atlas).
// Uso: node tools/generate-earth-mask.mjs   (solo hace falta volver a ejecutarlo si se cambia la resolución)
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/land-50m.json'), 'utf8'));
const land = feature(topo, topo.objects.land);

const W = 720; // 0,5° por celda
const H = 360;

// Todas las aristas de todos los anillos (exteriores y huecos: regla par-impar)
const edges = [];
const addPolygon = (rings) =>
  rings.forEach((ring) => {
    for (let i = 0; i < ring.length - 1; i++) edges.push([ring[i], ring[i + 1]]);
  });
for (const f of land.features) {
  const g = f.geometry;
  if (g.type === 'Polygon') addPolygon(g.coordinates);
  else if (g.type === 'MultiPolygon') g.coordinates.forEach(addPolygon);
}

const bits = new Uint8Array(Math.ceil((W * H) / 8));
for (let row = 0; row < H; row++) {
  const lat = 90 - (row + 0.5) * (180 / H);
  const xs = [];
  for (const [[x1, y1], [x2, y2]] of edges) {
    if (y1 > lat !== y2 > lat) xs.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
  }
  xs.sort((a, b) => a - b);
  for (let k = 0; k + 1 < xs.length; k += 2) {
    const c0 = Math.ceil((xs[k] + 180) / (360 / W) - 0.5);
    const c1 = Math.floor((xs[k + 1] + 180) / (360 / W) - 0.5);
    for (let col = Math.max(c0, 0); col <= Math.min(c1, W - 1); col++) {
      const i = row * W + col;
      bits[i >> 3] |= 1 << (i & 7);
    }
  }
}

const b64 = Buffer.from(bits).toString('base64');
writeFileSync(
  new URL('../src/data/earth-mask.ts', import.meta.url),
  `// Generado por tools/generate-earth-mask.mjs a partir de Natural Earth 1:50m (dominio público). No editar.
export const EARTH_MASK = { width: ${W}, height: ${H}, data: '${b64}' };
`,
);

// Vista previa ASCII para comprobar el resultado
for (let row = 0; row < H; row += 12) {
  let line = '';
  for (let col = 0; col < W; col += 6) {
    const i = row * W + col;
    line += bits[i >> 3] & (1 << (i & 7)) ? '#' : '.';
  }
  console.log(line);
}
