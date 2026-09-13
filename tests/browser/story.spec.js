import { test, expect } from '@playwright/test';

test('the opening presents the story and the first objective before the clock starts', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
  await expect(page.getByRole('heading', { name: 'THE LAST TAPE', exact: true })).toBeVisible();
  await expect(page.locator('#story-objective')).toHaveText('Collect a cassette, then reach the Shibuya exit.');
  await page.clock.runFor(10_000);
  await expect(page.locator('#time')).toHaveText('60');
  await page.screenshot({ path: '.impeccable/review/opening-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await page.clock.runFor(5000);
  await expect(page.locator('#mission-status')).toHaveText('TAPE 0/1');
  await expect(page.locator('#mission-route')).toHaveText('DROP: CENTER');
});

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`the final delivery reaches the ending and completion screen at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 700, isMobile: viewport.width < 700 });
    const page = await context.newPage();
    await page.clock.install();
    await page.route('**/src/engine.mjs', async (route) => {
      const response = await route.fetch();
      const source = await response.text();
      await route.fulfill({ response, body: `${source}
const CampaignEngine = GameEngine;
GameEngine = class PreparedFinalDelivery extends CampaignEngine {
  start(...args) {
    super.start(...args);
    this.stage = 3;
    this.chaptersComplete = 3;
    this.cassette = true;
    this.powerCells = 2;
    this.distance = CHECKPOINT_LENGTH * 4 - 1;
    this.nextCheckpoint = CHECKPOINT_LENGTH * 4;
    this.preparePickups();
  }
};` });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'START ENGINE' }).click();
    await page.getByRole('radio', { name: 'Bjarne', exact: true }).locator('..').click();
    await page.getByRole('button', { name: 'DRIVE AS BJARNE' }).click();
    await expect(page.getByRole('heading', { name: 'BEFORE SUNRISE' })).toBeVisible();
    const suffix = viewport.width < 700 ? 'mobile' : 'desktop';
    await page.screenshot({ path: `.impeccable/review/story-${suffix}.png`, fullPage: true });
    await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
    await page.clock.runFor(5600);
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'ending');
    await page.screenshot({ path: `.impeccable/review/ending-${suffix}.png`, fullPage: true });
    await page.clock.runFor(4000);
    await expect(page.getByRole('heading', { name: 'DELIVERY COMPLETE.' })).toBeVisible();
    await expect(page.locator('#final-stage')).toHaveText('4/4');
    expect(await page.evaluate(() => Number(localStorage.getItem('tokyo-nights.best')))).toBeGreaterThan(0);
    await page.screenshot({ path: `.impeccable/review/complete-${suffix}.png`, fullPage: true });
    await page.getByRole('button', { name: 'PLAY AGAIN', exact: true }).click();
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'select');
    await context.close();
  });
}
