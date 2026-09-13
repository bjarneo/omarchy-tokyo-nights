import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createStaticServer } from './server.mjs';
import { provenance } from './png-provenance.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('exports/cameo-cards/', root);
const publicOutput = new URL('assets/cameo-cards/', root);
await mkdir(output, { recursive: true });
await mkdir(publicOutput, { recursive: true });
const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/garage.html`);
  await page.waitForFunction(() => document.querySelectorAll('#crew-navigation button').length === 9);
  const cards = await page.evaluate(async () => {
    const { Renderer } = await import('/src/renderer.js');
    const { CHARACTERS } = await import('/src/characters.mjs');
    const renderer = new Renderer(document.createElement('canvas'));
    await renderer.logoReady;
    await document.fonts.ready;
    const accents = ['#bb9af7', '#7dcfff', '#9ece6a', '#9ece6a', '#e0af68', '#7aa2f7', '#e0af68', '#7aa2f7', '#7aa2f7'];
    return CHARACTERS.map((character, index) => {
      const card = document.createElement('canvas');
      card.width = 360;
      card.height = 360;
      const ctx = card.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#16161e';
      ctx.fillRect(0, 0, 360, 360);
      ctx.strokeStyle = '#414868';
      ctx.strokeRect(10.5, 10.5, 339, 339);
      ctx.fillStyle = accents[index];
      ctx.fillRect(10, 10, 28, 2);
      ctx.fillRect(10, 10, 2, 18);
      ctx.fillRect(322, 348, 28, 2);
      ctx.fillRect(348, 332, 2, 18);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '10px Arcade';
      ctx.fillStyle = '#9aa5ce';
      ctx.fillText('TOKYO NIGHTS', 180, 23);
      ctx.font = '24px Arcade';
      ctx.fillStyle = '#c0caf5';
      ctx.fillText(character.name.toUpperCase(), 180, 44);
      ctx.fillStyle = '#24283b';
      ctx.fillRect(24, 82, 312, 220);
      for (let y = 94; y < 298; y += 16) {
        ctx.fillStyle = '#343b58';
        ctx.fillRect(32, y, 296, 1);
      }
      ctx.fillStyle = accents[index];
      ctx.fillRect(24, 82, 312, 2);
      ctx.fillStyle = '#111420';
      ctx.fillRect(124, 295, 114, 7);
      ctx.drawImage(renderer.getFullCharacter(character.id), 130, 84, 100, 217);
      ctx.font = '6px Arcade';
      ctx.fillStyle = '#9aa5ce';
      ctx.fillText(character.detail.toUpperCase(), 180, 308);
      if (renderer.logo) ctx.drawImage(renderer.logo, 132, 322, 96, Math.round(96 * renderer.logo.height / renderer.logo.width));
      const large = document.createElement('canvas');
      large.width = 1080;
      large.height = 1080;
      const largeCtx = large.getContext('2d');
      largeCtx.imageSmoothingEnabled = false;
      largeCtx.drawImage(card, 0, 0, 1080, 1080);
      return { id: character.id, name: character.name, data: large.toDataURL('image/png').split(',')[1] };
    });
  });
  const files = [];
  for (const card of cards) {
    const png = Buffer.from(card.data, 'base64');
    if (png.readUInt32BE(16) !== 1080 || png.readUInt32BE(20) !== 1080) throw new Error('A cameo card has invalid dimensions.');
    const description = `Origin: Original Tokyo Nights pixel-art cameo card for ${card.name}. Uses the user-requested character from src/renderer.js, src/guest-drivers.js, and src/full-characters.js. Uses Tokyo Night colors, the local Arcade font, and the original Omarchy block logo. Composed by tools/create-cameo-cards.mjs at 360 x 360 and exported at 1080 x 1080 with nearest-neighbor scaling.`;
    const path = new URL(`${card.id}.png`, output);
    const image = provenance(png, description);
    await writeFile(path, image);
    await writeFile(new URL(`${card.id}.png`, publicOutput), image);
    files.push(fileURLToPath(path));
    console.log(`Created exports/cameo-cards/${card.id}.png`);
  }
  await writeFile(new URL('manifest.json', output), JSON.stringify(cards.map(({ id, name }) => ({ id, name, file: `${id}.png`, width: 1080, height: 1080 })), null, 2) + '\n');
  const archive = fileURLToPath(new URL('exports/cameo-cards.zip', root));
  execFileSync('zip', ['-j', '-q', archive, ...files]);
  await copyFile(archive, new URL('assets/cameo-cards.zip', root));
  console.log('Created exports/cameo-cards.zip with all nine PNG cards.');
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
