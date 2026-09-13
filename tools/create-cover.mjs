import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { FOUNDING_PATRONS } from '../src/patrons.mjs';

const root = new URL('../', import.meta.url);
const routes = new Map([
  ['/cover-art.js', ['tools/cover-art.js', 'text/javascript']],
  ['/src/renderer.js', ['src/renderer.js', 'text/javascript']],
  ['/src/engine.mjs', ['src/engine.mjs', 'text/javascript']],
  ['/src/characters.mjs', ['src/characters.mjs', 'text/javascript']],
  ['/src/guest-drivers.js', ['src/guest-drivers.js', 'text/javascript']],
  ['/src/cars.mjs', ['src/cars.mjs', 'text/javascript']],
  ['/src/story.mjs', ['src/story.mjs', 'text/javascript']],
  ['/src/pit-stops.mjs', ['src/pit-stops.mjs', 'text/javascript']],
  ['/src/rocket.mjs', ['src/rocket.mjs', 'text/javascript']],
  ['/src/rocket-art.js', ['src/rocket-art.js', 'text/javascript']],
  ['/src/rocket-themes.mjs', ['src/rocket-themes.mjs', 'text/javascript']],
  ['/assets/omarchy-themes.js', ['assets/omarchy-themes.js', 'text/javascript']],
  ['/src/patrons.mjs', ['src/patrons.mjs', 'text/javascript']],
  ['/src/patron-art.js', ['src/patron-art.js', 'text/javascript']],
  ['/src/car-sprites.js', ['src/car-sprites.js', 'text/javascript']],
  ['/src/full-characters.js', ['src/full-characters.js', 'text/javascript']],
  ['/src/garage-scene.js', ['src/garage-scene.js', 'text/javascript']],
  ['/src/omarchy-logo.js', ['src/omarchy-logo.js', 'text/javascript']],
  ['/assets/arcade.woff2', ['assets/arcade.woff2', 'font/woff2']],
  ['/assets/omarchy-logo.txt', ['assets/omarchy-logo.txt', 'text/plain; charset=utf-8']],
  ['/assets/cliamp-logo.txt', ['assets/cliamp-logo.txt', 'text/plain; charset=utf-8']],
  ...FOUNDING_PATRONS.map(({ portrait }) => [`/${portrait}`, [portrait, 'image/png']]),
]);
const server = createServer(async (request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html><head><meta charset="utf-8"><title>Tokyo Nights cover</title></head><body style="margin:0;background:#16161e"><canvas width="640" height="640"></canvas><script type="module" src="/cover-art.js"></script></body></html>');
    return;
  }
  const route = routes.get(request.url);
  if (!route) { response.writeHead(404).end(); return; }
  try {
    const file = await readFile(new URL(route[0], root));
    response.writeHead(200, { 'Content-Type': route[1] });
    response.end(file);
  } catch {
    response.writeHead(500).end('The cover source cannot load.');
  }
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => typeof window.coverImage === 'string', undefined, { timeout: 15_000 });
  if (errors.length) throw new Error(errors.join('\n'));
  const data = await page.evaluate(() => window.coverImage.split(',')[1]);
  const image = Buffer.from(data, 'base64');
  if (image.readUInt32BE(16) !== 2560 || image.readUInt32BE(20) !== 2560) {
    throw new Error('The cover dimensions do not match the export size.');
  }
  await writeFile(new URL('assets/tokyo-nights-cover.png', root), image);
  console.log('Created assets/tokyo-nights-cover.png at 2560 × 2560.');
} finally {
  await browser?.close();
  server.close();
}
