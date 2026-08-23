import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const INPUT = resolve('public/img/landing/hero-home.png');
const OUTPUT_JPG = resolve('public/og-image.jpg');

if (!existsSync(INPUT)) {
  console.error(`Input not found: ${INPUT}`);
  process.exit(1);
}

// DevHelper OG image 1200x630
// Strategy: cover resize 1280x800 -> 1200x630 center-crop, ensure 1200x630, then overlay branding bar if needed.
// Simple fast path: high-quality JPEG 82 mozjpeg.
// If we want branded text, we can composite an SVG overlay.

const WIDTH = 1200;
const HEIGHT = 630;

async function generate() {
  // SVG overlay: dark semi-transparent bar at bottom with text, to guarantee title readability even if WhatsApp crops to square
  // Use Roboto-like sans, keep it simple, colors from design system: #171717 bg, #e8e8e8 text
  const svgOverlay = `
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <!-- subtle bottom gradient for text legibility -->
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#171717" stop-opacity="0"/>
        <stop offset="55%" stop-color="#171717" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#171717" stop-opacity="0.96"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${HEIGHT - 180}" width="${WIDTH}" height="180" fill="url(#g)"/>
    <!-- text block -->
    <g font-family="Roboto, Arial, sans-serif">
      <text x="36" y="${HEIGHT - 108}" font-size="42" font-weight="700" fill="#e8e8e8" letter-spacing="-0.02em">DevHelper</text>
      <text x="36" y="${HEIGHT - 74}" font-size="22" font-weight="500" fill="#e8e8e8" opacity="0.95">Tu memoria técnica, organizada y protegida</text>
      <text x="36" y="${HEIGHT - 38}" font-size="16" font-weight="400" fill="#e8e8e8" opacity="0.72">Workspace cifrado para developers · proyectos · tareas · credenciales · archivos</text>
    </g>
    <!-- small badge top-left -->
    <g>
      <rect x="36" y="24" rx="8" ry="8" width="170" height="28" fill="#171717" stroke="#363633" stroke-width="1"/>
      <text x="46" y="42" font-family="Roboto, Arial, sans-serif" font-size="13" font-weight="600" fill="#e8e8e8" letter-spacing="0.08em">WORKSPACE CIFRADO</text>
    </g>
  </svg>`;

  const pipeline = sharp(INPUT)
    .resize(WIDTH, HEIGHT, {
      fit: 'cover',
      position: 'centre',
      kernel: 'lanczos3',
    })
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }]);

  // JPG primary (WhatsApp/FB)
  await pipeline
    .clone()
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(OUTPUT_JPG);

  const metaJpg = await sharp(OUTPUT_JPG).metadata();
  const { size: sizeJpg } = await import('node:fs/promises').then((m) => m.stat(OUTPUT_JPG));

  console.log(`Generated:`);
  console.log(
    `  JPG: ${OUTPUT_JPG} — ${metaJpg.width}x${metaJpg.height} ${Math.round(sizeJpg / 1024)}KB`,
  );

  if (sizeJpg > 300 * 1024) {
    console.warn(
      `WARN: JPG >300KB (${Math.round(sizeJpg / 1024)}KB) — consider lowering quality to 78`,
    );
  }
  if (metaJpg.width !== 1200 || metaJpg.height !== 630) {
    console.error('ERROR: JPG dimensions not 1200x630');
    process.exit(1);
  }
}

generate().catch((e) => {
  console.error(e);
  process.exit(1);
});
