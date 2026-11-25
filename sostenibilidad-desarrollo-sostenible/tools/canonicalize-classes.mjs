// tailwind-canonical: ignore-file (este archivo cita clases no canónicas como ejemplo)
// Revisa las clases de Tailwind de src/ con el mismo motor que el aviso «suggestCanonicalClasses»
// del editor y las sustituye por su forma canónica (p. ej. gap-[100px] → gap-25).
// Uso: node tools/canonicalize-classes.mjs          → corrige los archivos
//      node tools/canonicalize-classes.mjs --check  → solo informa; sale con código 1 si hay algo que corregir
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)); // decodifica tildes y espacios de la ruta
const require = createRequire(join(root, 'package.json'));
const tw = require('tailwindcss');

const check = process.argv.includes('--check');
const theme = readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8');
const own = readFileSync(join(root, 'src/styles/global.css'), 'utf8').match(/@theme \{[\s\S]*?\n\}/)?.[0] ?? '';
const ds = await tw.__unstable__loadDesignSystem(`${theme}\n${own}`, { base: root });

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|ts|tsx|js|mjs|html)$/.test(name)) files.push(p);
  }
};
walk(join(root, 'src'));

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
let total = 0;

for (const file of files) {
  let src = readFileSync(file, 'utf8');
  if (src.includes('tailwind-canonical: ignore-file')) continue;
  const tokens = [...new Set(src.match(/[^\s"'`{}<>,;=]+/g) ?? [])];
  // Una a una: con varias a la vez, Tailwind elimina duplicados y los índices dejarían de coincidir
  const changes = tokens
    .map((t) => [t, ds.canonicalizeCandidates([t], { rem: 16 })[0]])
    .filter(([a, b]) => b && a !== b);
  if (!changes.length) continue;

  for (const [from, to] of changes) {
    total++;
    console.log(`${relative(root, file)}: ${from} → ${to}`);
    src = src.replace(new RegExp(`(?<=^|[\\s"'\`{])${escape(from)}(?=$|[\\s"'\`}])`, 'g'), to);
  }
  if (!check) writeFileSync(file, src);
}

console.log(total ? `${total} clase(s) ${check ? 'por corregir' : 'corregidas'}.` : 'Todas las clases están en forma canónica.');
if (check && total) process.exit(1);
