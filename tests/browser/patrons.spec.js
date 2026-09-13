import { test, expect } from '@playwright/test';
import { FOUNDING_PATRONS, PATRONS_SOURCE } from '../../src/patrons.mjs';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  const suffix = viewport.width < 700 ? 'mobile' : 'desktop';
  test(`local founding-patron portraits appear in the garage under a site subpath at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 700, isMobile: viewport.width < 700 });
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => requests.push(request.url()));
    await page.addInitScript(() => { Math.random = () => .42; });
    await page.route('**/release/**', async (route) => {
      const response = await route.fetch({ url: route.request().url().replace('/release/', '/') });
      await route.fulfill({ response });
    });
    await page.goto('/release/garage.html');
    await expect(page.locator('#crew-navigation button')).toHaveCount(9);
    const caption = await page.locator('#garage-patrons').textContent();
    expect(FOUNDING_PATRONS.filter(({ name }) => caption.includes(name))).toHaveLength(3);
    await expect(page.locator('#patrons-source')).toHaveAttribute('href', PATRONS_SOURCE);
    await expect(page.locator('#garage-scene')).toHaveAttribute('aria-label', /Founding patron displays:/);
    expect(new Set(requests.filter((url) => url.includes('/assets/patrons/'))).size).toBe(12);
    expect(requests.every((url) => url.startsWith(new URL(page.url()).origin))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/patrons-garage-${suffix}.png`, fullPage: true });
    if (suffix === 'desktop') {
      await page.evaluate(async () => {
        const { FOUNDING_PATRONS } = await import('/release/src/patrons.mjs');
        const { getPatronPoster } = await import('/release/src/patron-art.js');
        const canvas = document.createElement('canvas');
        canvas.id = 'patron-atlas'; canvas.width = 1056; canvas.height = 800;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#1a1b26'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        FOUNDING_PATRONS.forEach(({ id }, index) => ctx.drawImage(getPatronPoster(id), 16 + index % 3 * 352, 16 + Math.floor(index / 3) * 200, 320, 176));
        document.body.append(canvas);
      });
      await page.locator('#patron-atlas').screenshot({ path: '.impeccable/review/patrons-atlas.png' });
    }
    expect(errors).toEqual([]);
    await context.close();
  });

  test(`the drive and Mars outpost use the run's patron displays at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 700, isMobile: viewport.width < 700 });
    const page = await context.newPage();
    const errors = [];
    const portraits = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (request.url().includes('/assets/patrons/')) portraits.push(request.url()); });
    await page.clock.install();
    await page.route('**/src/engine.mjs', async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: `${await response.text()}
const RaceEngine = GameEngine;
GameEngine = class NearbyPatron extends RaceEngine {
  start(...args) {
    this.patronRandom = () => .42;
    super.start(...args);
    this.patronTour.roadside[0].at = 50;
    this.patronTour.roadside[0].side = -1;
    window.patronProbe = this;
  }
};` });
    });
    await page.route('**/src/renderer.js', async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: `${await response.text()}
const drawPatron = Renderer.prototype.drawPatron;
Renderer.prototype.drawPatron = function (z, side, id) {
  (window.seenPatrons ??= new Set()).add(id);
  return drawPatron.call(this, z, side, id);
};` });
    });
    await page.goto('/');
    await page.evaluate(async () => (await import('/src/patron-art.js')).loadPatronArt());
    await page.getByRole('button', { name: 'START ENGINE' }).click();
    await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
    await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
    await page.clock.runFor(4600);
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing');
    expect(await page.evaluate(() => seenPatrons.has(patronProbe.patronTour.roadside[0].id))).toBe(true);
    await page.screenshot({ path: `.impeccable/review/patrons-road-${suffix}.png`, fullPage: true });
    await page.evaluate(() => { patronProbe.boardRocket(); patronProbe.update(20); });
    await page.clock.runFor(32);
    await expect(page.getByRole('heading', { name: 'MARS REACHED.' })).toBeVisible();
    await page.screenshot({ path: `.impeccable/review/patrons-mars-${suffix}.png`, fullPage: true });
    expect(portraits).toHaveLength(12);
    expect(errors).toEqual([]);
    await context.close();
  });
}

test('missing portraits retain patron names and a usable garage', async ({ page }) => {
  await page.route('**/assets/patrons/*.png', (route) => route.abort());
  await page.goto('/garage.html');
  await expect(page.locator('#crew-navigation button')).toHaveCount(9);
  await expect(page.locator('#garage-patrons')).toContainText('On the garage displays:');
  await page.getByRole('button', { name: 'Outfoxxed', exact: true }).click();
  await expect(page.locator('#crew-detail')).toContainText('blue shirt');
});
