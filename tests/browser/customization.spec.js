import { test, expect } from '@playwright/test';

test('nine distinct drivers and all 81 car paint combinations render', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { Renderer } = await import('/src/renderer.js');
    const { CHARACTERS } = await import('/src/characters.mjs');
    const { CARS, PAINTS } = await import('/src/cars.mjs');
    const renderer = new Renderer(document.createElement('canvas'));
    const faces = CHARACTERS.map(({ id }) => renderer.drivers[id].smile.toDataURL());
    const distinctPoses = CHARACTERS.every(({ id }) => new Set(['back', 'profile', 'smile'].map((pose) => renderer.drivers[id][pose].toDataURL())).size === 3);
    const cars = CARS.map(({ id }) => renderer.getCarSprite(id, 'amber').toDataURL());
    const paintCounts = CARS.map(({ id }) => new Set(PAINTS.map((paint) => renderer.getCarSprite(id, paint.id).toDataURL())).size);
    return { faces: new Set(faces).size, distinctPoses, cars: new Set(cars).size, paintCounts };
  });
  expect(result.faces).toBe(9);
  expect(result.distinctPoses).toBe(true);
  expect(result.cars).toBe(9);
  expect(result.paintCounts).toEqual(Array(9).fill(9));
});

test('the garage previews and saves the driver, model, and paint together', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await expect(page.getByRole('group', { name: 'Drivers', exact: true }).getByRole('radio')).toHaveCount(9);
  await page.keyboard.press('End');
  await expect(page.getByRole('radio', { name: 'Emir', exact: true })).toBeChecked();
  await page.screenshot({ path: '.impeccable/review/roster-desktop.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('tab', { name: 'CAR & COLOR' }).click();
  await expect(page.getByRole('group', { name: 'Car models' }).getByRole('radio')).toHaveCount(9);
  await expect(page.getByRole('group', { name: 'Tokyo Night paint' }).getByRole('radio')).toHaveCount(9);
  await page.getByRole('radio', { name: 'Mazda RX-7', exact: true }).locator('..').click();
  const amber = await page.locator('#selected-car-preview').evaluate((canvas) => canvas.toDataURL());
  await page.getByRole('radio', { name: 'Blue', exact: true }).locator('..').click();
  const blue = await page.locator('#selected-car-preview').evaluate((canvas) => canvas.toDataURL());
  expect(blue).not.toBe(amber);
  await expect(page.locator('#selected-paint-label')).toHaveText('BLUE · #7AA2F7');
  await page.screenshot({ path: '.impeccable/review/garage-desktop.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'DRIVE AS EMIR' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('#game')).toHaveAttribute('aria-label', /^Emir drives a blue Mazda RX-7/);
  await page.clock.runFor(5000);
  await page.keyboard.down('Space');
  await page.clock.runFor(1100);
  await expect(page.locator('#announcer')).toHaveText('Emir leans out of the window, turns, and smiles.');
  await page.screenshot({ path: '.impeccable/review/custom-car-gameplay.png', fullPage: true });
  await page.keyboard.up('Space');
  await page.reload();
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await expect(page.getByRole('radio', { name: 'Emir', exact: true })).toBeChecked();
  await page.getByRole('tab', { name: 'CAR & COLOR' }).click();
  await expect(page.getByRole('radio', { name: 'Mazda RX-7', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Blue', exact: true })).toBeChecked();
  expect(errors).toEqual([]);
});

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 740 }, { width: 844, height: 390 }]) {
  test(`the full roster and garage work at ${viewport.width} by ${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const suffix = viewport.width === 390 ? 'mobile' : viewport.width === 320 ? 'narrow' : 'landscape';
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('button', { name: 'START ENGINE' }).tap();
    const driver = page.getByRole('radio', { name: 'Outfoxxed', exact: true });
    await driver.locator('..').tap();
    await expect(driver).toBeChecked();
    await expect(page.locator('#selected-driver-name')).toHaveText('OUTFOXXED');
    await page.screenshot({ path: `.impeccable/review/roster-${suffix}.png`, fullPage: viewport.width < 700, animations: 'disabled' });
    await page.getByRole('tab', { name: 'CAR & COLOR' }).tap();
    await page.getByRole('radio', { name: 'Datsun 240Z', exact: true }).locator('..').tap();
    await page.getByRole('radio', { name: 'Green', exact: true }).locator('..').tap();
    await expect(page.locator('#selected-car-name')).toHaveText('240Z');
    await expect(page.locator('#selected-paint-label')).toHaveText('GREEN · #9ECE6A');
    const fits = await page.locator('#confirm-driver-button').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight && rect.left >= 0 && rect.right <= innerWidth;
    });
    expect(fits).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/garage-${suffix}.png`, fullPage: viewport.width < 700, animations: 'disabled' });
    if (viewport.width === 844) {
      await page.getByRole('button', { name: 'Enter fullscreen' }).tap();
      await page.getByRole('radio', { name: 'Ferrari F40', exact: true }).locator('..').tap();
      await page.screenshot({ path: '.impeccable/review/garage-fullscreen.png', animations: 'disabled' });
    }
    await page.getByRole('button', { name: 'DRIVE AS OUTFOXXED' }).tap();
    await page.getByRole('button', { name: 'BEGIN CHAPTER' }).tap();
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'countdown');
    await context.close();
  });
}
