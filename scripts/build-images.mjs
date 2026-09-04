/**
 * Generates every raster image the site ships, from inline SVG sources.
 *
 * Run with `npm run images`. Outputs, all into public/:
 *
 *   og-image.png         1200×630  Open Graph / Twitter summary_large_image
 *   og-square.png        1200×1200 platforms that crop to a square (WhatsApp,
 *                                  some Slack/Telegram previews)
 *   apple-touch-icon.png  180×180  iOS home screen — full-bleed, no rounding,
 *                                  because iOS applies its own mask
 *   icon-192.png          192×192  web app manifest
 *   icon-512.png          512×512  web app manifest / install prompt
 *
 * These are build products committed to the repo so the share preview works
 * without a render step on the host.
 *
 * Note: this renders with fonts installed system-wide. Funnel Display (the
 * site's display face) ships from npm as woff2 only, which fontconfig cannot
 * read — so the text falls back to a system grotesque. Install Funnel Display
 * locally and re-run for a fully on-brand export.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

import { tools } from '../src/data/tools.ts';
import { categories } from '../src/data/categories.ts';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const SANS = 'Funnel Display, Ubuntu Sans, DejaVu Sans, Liberation Sans, sans-serif';
const MONO = 'JetBrains Mono, Ubuntu Mono, DejaVu Sans Mono, monospace';

const INK = '#171717';
const MUTED = '#525252';
const FAINT = '#737373';

/** SVG is XML — an unescaped & in a category name kills the whole parse. */
const esc = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/*
 * The shelves, not the tools — fifty domains would not fit and would say less.
 * Only the head of each name ("Email" from "Email & SMTP"), because the full
 * set runs wider than the card at any readable size.
 */
const shelfNames = categories.map((category) =>
  category.name.split(' & ')[0].toLowerCase(),
);
const shelves = esc(shelfNames.join('  ·  '));
const shelvesShort = esc(shelfNames.slice(0, 5).join('  ·  '));
const count = `${tools.length} tools`;

/** The "d" mark, drawn at an arbitrary size. `rounding` of 0 gives a full bleed square. */
function mark(size, rounding = 0.25) {
  const s = size / 32;
  return `
    <rect width="${size}" height="${size}" rx="${size * rounding}" fill="${INK}"/>
    <circle cx="${13 * s}" cy="${20 * s}" r="${6 * s}" fill="none" stroke="#fff" stroke-width="${4 * s}"/>
    <rect x="${19 * s}" y="${5 * s}" width="${4 * s}" height="${23 * s}" rx="${2 * s}" fill="#fff"/>`;
}

/** The masked grid, matching the hero in src/components/Hero.astro. */
function gridDefs(w, h, cell) {
  return `
    <defs>
      <pattern id="grid" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">
        <path d="M${cell} 0H0V${cell}" fill="none" stroke="#eeeeee" stroke-width="1"/>
      </pattern>
      <radialGradient id="fade" cx="50%" cy="30%" r="70%">
        <stop offset="40%" stop-color="#fff" stop-opacity="1"/>
        <stop offset="95%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <mask id="fadeMask"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
    </defs>
    <rect width="${w}" height="${h}" fill="#ffffff"/>
    <rect width="${w}" height="${h}" fill="url(#grid)" mask="url(#fadeMask)"/>`;
}

const landscape = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  ${gridDefs(1200, 630, 120)}
  <g transform="translate(80, 78)">${mark(56, 0.25)}</g>
  <text x="156" y="118" font-family="${SANS}" font-size="30" font-weight="800"
        letter-spacing="-1" fill="${INK}">devtool<tspan fill="${FAINT}">.fyi</tspan></text>
  <text x="80" y="310" font-family="${SANS}" font-size="82" font-weight="800"
        letter-spacing="-3.4" fill="${INK}">Developer tools,</text>
  <text x="80" y="400" font-family="${SANS}" font-size="82" font-weight="800"
        letter-spacing="-3.4" fill="${INK}">worth the shelf space.</text>
  <text x="80" y="478" font-family="${SANS}" font-size="26" fill="${MUTED}">A curated directory · ${count}</text>
  <line x1="80" y1="536" x2="1120" y2="536" stroke="#e5e5e5" stroke-width="1"/>
  <text x="80" y="576" font-family="${MONO}" font-size="18" fill="${FAINT}">${shelves}</text>
</svg>`;

const square = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  ${gridDefs(1200, 1200, 150)}
  <g transform="translate(100, 180)">${mark(96, 0.25)}</g>
  <text x="220" y="248" font-family="${SANS}" font-size="46" font-weight="800"
        letter-spacing="-1.6" fill="${INK}">devtool<tspan fill="${FAINT}">.fyi</tspan></text>
  <text x="100" y="500" font-family="${SANS}" font-size="104" font-weight="800"
        letter-spacing="-4.2" fill="${INK}">Developer</text>
  <text x="100" y="614" font-family="${SANS}" font-size="104" font-weight="800"
        letter-spacing="-4.2" fill="${INK}">tools, worth</text>
  <text x="100" y="728" font-family="${SANS}" font-size="104" font-weight="800"
        letter-spacing="-4.2" fill="${INK}">the shelf space.</text>
  <text x="100" y="812" font-family="${SANS}" font-size="34" fill="${MUTED}">A curated directory · ${count}</text>
  <line x1="100" y1="880" x2="1100" y2="880" stroke="#e5e5e5" stroke-width="1"/>
  <text x="100" y="936" font-family="${MONO}" font-size="26" fill="${FAINT}">${shelvesShort}</text>
</svg>`;

const icon = (size, rounding) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${mark(size, rounding)}</svg>`;

const targets = [
  ['og-image.png', landscape],
  ['og-square.png', square],
  // iOS masks the corners itself, so ship a square and let it do the rounding.
  ['apple-touch-icon.png', icon(180, 0)],
  ['icon-192.png', icon(192, 0.25)],
  ['icon-512.png', icon(512, 0.25)],
];

for (const [name, svg] of targets) {
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(OUT, name), png);
  console.log(`✓ ${name.padEnd(22)} ${(png.length / 1024).toFixed(1)} KB`);
}
