import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`a pit conversation returns to the same car and road at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 700, isMobile: viewport.width < 700 });
    const page = await context.newPage();
    await page.clock.install();
    await page.route('**/src/engine.mjs', async (route) => {
      const response = await route.fetch();
      const source = await response.text();
      await route.fulfill({ response, body: `${source}
const RegularEngine = GameEngine;
GameEngine = class PreparedPitStop extends RegularEngine {
  start(...args) { super.start(...args); this.pitStopAt = 80; this.pitStopLane = 1.22; }
};` });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'START ENGINE' }).click();
    await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
    await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
    await page.clock.runFor(3600);
    await expect(page.locator('#pit-bay-indicator')).toHaveText('PIT BAY: RIGHT');
    const suffix = viewport.width < 700 ? 'mobile' : 'desktop';
    await page.screenshot({ path: `.impeccable/review/pit-bay-${suffix}.png`, fullPage: true });
    await page.keyboard.down('ArrowRight');
    await page.clock.runFor(4500);
    await page.keyboard.up('ArrowRight');
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'pit');
    const score = await page.locator('#score').textContent();
    const time = await page.locator('#time').textContent();
    const companion = await page.locator('#pit-speaker').textContent();
    expect(companion).not.toBe('DHH');
    await expect(page.locator('#pit-line')).not.toBeEmpty();
    await page.clock.runFor(20_000);
    await expect(page.locator('#time')).toHaveText(time);
    await page.screenshot({ path: `.impeccable/review/pit-${suffix}.png`, fullPage: true });
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click();
    await expect(page.locator('#pit-speaker')).toHaveText('DHH');
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click();
    await expect(page.locator('#pit-speaker')).toHaveText(companion);
    await page.getByRole('button', { name: 'CONTINUE', exact: true }).click();
    await page.getByRole('button', { name: 'BACK TO THE RUN' }).click();
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing');
    await expect(page.locator('#score')).toHaveText(score);
    await expect(page.locator('#nitro-meter')).toHaveAttribute('aria-valuenow', '100');
    await page.clock.runFor(1000);
    expect(Number(await page.locator('#score').textContent())).toBeGreaterThan(Number(score));
    await context.close();
  });
}

test('the crew page shows nine larger full-body figures and supports mobile pan', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/garage.html');
  await expect(page.getByRole('heading', { name: 'THE NIGHT CREW.' })).toBeVisible();
  await expect(page.locator('#crew-navigation button')).toHaveCount(9);
  await expect(page.locator('#garage-labels span')).toHaveCount(9);
  await page.screenshot({ path: '.impeccable/review/crew-page-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Emir', exact: true }).click();
  await expect.poll(() => page.locator('#garage-stage').evaluate((element) => element.scrollLeft)).toBeGreaterThan(500);
  await expect(page.locator('#crew-detail')).toContainText('Emir:');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '.impeccable/review/crew-page-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
  await context.close();
});
