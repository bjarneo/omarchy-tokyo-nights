import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { createStaticServer } from './server.mjs';

const server = createStaticServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
try {
  await mkdir('.impeccable/review', { recursive: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [name, width, height] of [['desktop', 1440, 1080], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`http://127.0.0.1:${server.address().port}/music-video.html`);
    await page.waitForFunction(() => window.videoReady || window.videoError);
    await page.evaluate(() => window.musicVideo.renderAt(3));
    await page.screenshot({ path: `.impeccable/review/music-${name}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1080 });
  for (const [name, time] of [['chase', 70.5], ['bridge', 57.4], ['cockpit', 51], ['tunnel', 161], ['sunrise', 188], ['finale', 205]]) {
    await page.evaluate((time) => window.musicVideo.renderAt(time), time);
    await page.locator('canvas').screenshot({ path: `.impeccable/review/music-${name}.png` });
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Captured the desktop, mobile, and six video scenes.');
} finally {
  await browser.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
