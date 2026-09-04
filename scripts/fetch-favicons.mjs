/**
 * Vendors each tool's own favicon into public/logos/, so the directory shows the
 * mark people recognize instead of a monogram.
 *
 * Run with `npm run logos`. Re-run when a tool rebrands.
 *
 * The icons are copied into this repo rather than hotlinked on purpose: the page
 * makes no third-party requests (which is what keeps the CSP strict and the
 * privacy claim in the footer true), and a tool site going down doesn't take its
 * row's icon with it.
 *
 * Preference order is SVG, then apple-touch-icon, then any raster <link> icon.
 * Rasters are normalized to a 128px PNG. Bare favicon.ico is skipped — sharp has
 * no ICO decoder, and every site here offers something better.
 *
 * A tool with no usable icon is left alone; ToolCard falls back to a monogram.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

import { tools } from '../src/data/tools.ts';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'logos');
const UA = 'Mozilla/5.0 (compatible; devtool.fyi favicon fetcher)';

mkdirSync(OUT_DIR, { recursive: true });

/** Pulls candidate icon URLs out of a page's <link rel="...icon..."> tags. */
function findIcons(html, baseUrl) {
  const links = html.match(/<link[^>]+>/gi) ?? [];
  const candidates = [];

  for (const tag of links) {
    const rel = tag.match(/rel=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!rel || !href || !rel.includes('icon')) continue;

    const url = new URL(href, baseUrl).href;
    const isSvg = /\.svg(\?|$)/i.test(url) || /image\/svg/i.test(tag);
    const isIco = /\.ico(\?|$)/i.test(url);
    if (isIco) continue;

    // Lower rank sorts first.
    const rank = isSvg ? 0 : rel.includes('apple-touch') ? 1 : 2;
    candidates.push({ url, isSvg, rank });
  }

  return candidates.sort((a, b) => a.rank - b.rank);
}

async function fetchIcon(tool) {
  const page = await fetch(tool.url, { headers: { 'User-Agent': UA } });
  if (!page.ok) throw new Error(`${page.status} fetching ${tool.url}`);

  const html = await page.text();
  const candidates = findIcons(html, page.url);

  for (const candidate of candidates) {
    const res = await fetch(candidate.url, { headers: { 'User-Agent': UA } });
    if (!res.ok) continue;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) continue;

    if (candidate.isSvg) {
      // Keep vectors as vectors — they stay crisp at any tile size.
      writeFileSync(join(OUT_DIR, `${tool.id}.svg`), buffer);
      return { file: `${tool.id}.svg`, bytes: buffer.length, from: candidate.url };
    }

    const png = await sharp(buffer)
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(join(OUT_DIR, `${tool.id}.png`), png);
    return { file: `${tool.id}.png`, bytes: png.length, from: candidate.url };
  }

  return null;
}

for (const tool of tools) {
  try {
    const result = await fetchIcon(tool);
    if (result) {
      console.log(`✓ ${tool.id.padEnd(10)} ${result.file}  (${(result.bytes / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`· ${tool.id.padEnd(10)} no usable icon — falling back to a monogram`);
    }
  } catch (error) {
    console.log(`· ${tool.id.padEnd(10)} ${error.message} — falling back to a monogram`);
  }
}
