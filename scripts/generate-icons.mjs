/**
 * Genera los íconos de la PWA y del favicon a partir del logo de "Sabor Norteño"
 * (badge naranja + cubiertos cruzados negros + "SN").
 *
 * Uso:  node scripts/generate-icons.mjs
 *
 * Requiere `sharp` disponible en node_modules.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Cubiertos cruzados (Lucide utensils-crossed) + iniciales SN
const CONTENT = `
  <g transform="translate(18.2 7.5) scale(1.15)" fill="none" stroke="#1c1917" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/>
    <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/>
    <path d="m2.1 21.8 6.4-6.3"/>
    <path d="m19 5-7 7"/>
  </g>
  <text x="32" y="49" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="15" font-weight="900" letter-spacing="0.5" fill="#ffffff">SN</text>`;

function logoSvg({ size, radius = 16, ring = true, contentScale = 1 }) {
  // Escala el contenido alrededor de su centro (~32,30) para la zona segura maskable
  const content =
    contentScale === 1
      ? CONTENT
      : `<g transform="translate(${32 - 32 * contentScale} ${32 - 30 * contentScale}) scale(${contentScale})">${CONTENT}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fb923c"/>
      <stop offset="0.5" stop-color="#f97316"/>
      <stop offset="1" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${radius}" fill="url(#g)"/>
  ${ring ? '<rect x="3.25" y="3.25" width="57.5" height="57.5" rx="13" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1.5"/>' : ''}
  ${content}
</svg>`;
}

async function build(outRel, opts) {
  const out = join(root, outRel);
  await mkdir(dirname(out), { recursive: true });
  await sharp(Buffer.from(logoSvg(opts))).png().toFile(out);
  console.log('ok ->', outRel, `(${opts.size}px)`);
}

await build('src/app/icon.png', { size: 48, radius: 16, ring: true, contentScale: 1 });
await build('src/app/apple-icon.png', { size: 180, radius: 0, ring: false, contentScale: 0.92 });
await build('public/icons/icon-192.png', { size: 192, radius: 16, ring: true, contentScale: 1 });
await build('public/icons/icon-512.png', { size: 512, radius: 16, ring: true, contentScale: 1 });
await build('public/icons/maskable-512.png', { size: 512, radius: 0, ring: false, contentScale: 0.86 });
