import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { FOUNDING_PATRONS, PATRONS_SOURCE } from '../src/patrons.mjs';
import { provenance } from './png-provenance.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('assets/patrons/', root);
const palette = [
  '#16161e', '#1a1b26', '#24283b', '#343b58', '#414868', '#565f89', '#737ba1', '#9aa5ce', '#c0caf5', '#e5e9ff',
  '#7aa2f7', '#7dcfff', '#bb9af7', '#9ece6a', '#e0af68', '#f7768e', '#ff9e64',
  '#30242b', '#493338', '#654444', '#855d53', '#a97663', '#c6957a', '#dbab91', '#f0c1a1', '#f5d4b5',
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const images = [];
  for (const patron of FOUNDING_PATRONS) {
    const response = await fetch(patron.source, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`The portrait cannot load: ${patron.source}`);
    const source = Buffer.from(await response.arrayBuffer()).toString('base64');
    const data = await page.evaluate(async ({ source, palette }) => {
      const image = new Image();
      image.src = `data:image/webp;base64,${source}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 48;
      const ctx = canvas.getContext('2d');
      const size = Math.min(image.width, image.height);
      ctx.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 48, 48);
      const pixels = ctx.getImageData(0, 0, 48, 48);
      const colors = palette.map((hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)));
      for (let i = 0; i < pixels.data.length; i += 4) {
        let nearest = colors[0];
        let distance = Infinity;
        for (const color of colors) {
          const d = color.reduce((sum, channel, index) => sum + (channel - pixels.data[i + index]) ** 2, 0);
          if (d < distance) { distance = d; nearest = color; }
        }
        pixels.data.set([...nearest, 255], i);
      }
      ctx.putImageData(pixels, 0, 0);
      return canvas.toDataURL('image/png').split(',')[1];
    }, { source, palette });
    images.push({ patron, png: provenance(Buffer.from(data, 'base64'), `Origin: ${patron.source}. Roster: ${PATRONS_SOURCE}. Center-cropped to 48 x 48 pixels and mapped to the Tokyo Night and portrait palettes by tools/vendor-patrons.mjs.`) });
  }
  await mkdir(output, { recursive: true });
  for (const { patron, png } of images) {
    await writeFile(new URL(patron.portrait, root), png);
    console.log(`Created ${patron.portrait}`);
  }
} finally {
  await browser.close();
}
