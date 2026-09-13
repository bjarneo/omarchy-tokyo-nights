import { test, expect } from '@playwright/test';

const driverOption = (page, name) => page.getByRole('radio', { name, exact: true }).locator('..');

test('desktop: start, drive, boost, pause, sound, and restart', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TOKYONIGHTS.');
  await expect(page.getByRole('button', { name: 'START ENGINE' })).toBeVisible();
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Omarchy logo' })).toBeVisible();
  await expect(page.getByRole('img', { name: /^All nine drivers:/ })).toBeVisible();
  expect(await page.locator('#title-lineup').evaluate((canvas) => {
    const ctx = canvas.getContext('2d');
    return Array.from({ length: 9 }, (_, index) => ctx.getImageData(index * 36, 0, 32, 38).data.some((value, offset) => offset % 4 === 3 && value > 0)).every(Boolean);
  })).toBe(true);
  await expect.poll(() => page.locator('#start-logo').evaluate((canvas) => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  })).toBe(true);
  await page.screenshot({ path: '.impeccable/review/desktop.png', fullPage: true });

  await page.keyboard.press('Enter');
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'select');
  await expect(page.getByRole('radio', { name: 'DHH', exact: true })).toBeChecked();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Ryan', exact: true })).toBeChecked();
  await page.screenshot({ path: '.impeccable/review/selection-desktop.png', fullPage: true, animations: 'disabled' });
  await page.keyboard.press('Enter');
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'story');
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'countdown');
  await expect(page.locator('#game')).toHaveAttribute('aria-label', /^Ryan drives/);
  await page.screenshot({ path: '.impeccable/review/road-signs.png', fullPage: true });
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing', { timeout: 6000 });
  await expect.poll(async () => Number(await page.locator('#speed').textContent())).toBeGreaterThan(90);
  await page.keyboard.down('Space');
  await expect(page.locator('#nitro-label')).toHaveText('BOOST ACTIVE');
  await expect(page.locator('#announcer')).toHaveText('Ryan leans out of the window, turns, and smiles.');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '.impeccable/review/gameplay-desktop.png', fullPage: true });
  await expect.poll(async () => Number(await page.locator('#speed').textContent())).toBeGreaterThan(430);
  await page.keyboard.up('Space');
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(250);
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.press('KeyP');
  await expect(page.getByRole('button', { name: 'RESUME DRIVE' })).toBeVisible();
  const frozenTime = await page.locator('#time').textContent();
  await page.waitForTimeout(1100);
  await expect(page.locator('#time')).toHaveText(frozenTime);
  await page.getByRole('button', { name: 'RESUME DRIVE' }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing');

  await page.getByRole('button', { name: 'Turn sound on' }).click();
  await expect(page.getByRole('button', { name: 'Turn sound off' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Turn sound off' }).click();
  await expect(page.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('KeyP');
  await page.getByRole('button', { name: 'START A NEW RUN' }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'select');
  await expect(page.getByRole('radio', { name: 'Ryan', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'DRIVE AS RYAN' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'countdown');
  await expect(page.locator('#score')).toHaveText('000000');
  await expect(page.locator('#time')).toHaveText('60');
  expect(errors).toEqual([]);
  expect(requests.every((url) => url.startsWith(new URL(page.url()).origin))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('mobile: touch controls, release, and responsive game art', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#touch-controls')).toBeVisible();
  await expect(page.getByRole('link', { name: 'MEET THE CREW', exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Omarchy logo' })).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'START ENGINE' }).tap();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'select');
  await driverOption(page, 'Ryan').tap();
  await expect(page.getByRole('radio', { name: 'Ryan', exact: true })).toBeChecked();
  await page.screenshot({ path: '.impeccable/review/selection-mobile.png', fullPage: true, animations: 'disabled' });
  const touch = await context.newCDPSession(page);
  await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await page.getByRole('button', { name: 'DRIVE AS RYAN' }).tap();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).tap();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing', { timeout: 6000 });
  await expect.poll(async () => Number(await page.locator('#speed').textContent())).toBeGreaterThan(90);
  const nitro = page.locator('[data-control="nitro"]');
  await expect(nitro).toBeVisible();
  const bounds = await nitro.boundingBox();
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }] });
  await expect(page.locator('#nitro-label')).toHaveText('BOOST ACTIVE');
  await page.waitForTimeout(1100);
  await page.screenshot({ path: '.impeccable/review/gameplay-mobile.png', fullPage: true });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('#nitro-label')).toHaveText('HOLD TO BOOST');
  await page.getByRole('button', { name: 'Pause game', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'RESUME DRIVE' })).toBeVisible();
  await page.getByRole('button', { name: 'RESUME DRIVE' }).tap();
  await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await page.getByRole('button', { name: 'Enter fullscreen' }).tap();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.className)).toBe('app');
  await expect(page.locator('#touch-controls')).toBeVisible();
  const touchInsideFullscreen = await page.locator('#touch-controls').evaluate((element) => document.fullscreenElement.contains(element));
  expect(touchInsideFullscreen).toBe(true);
  await page.screenshot({ path: '.impeccable/review/fullscreen-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Exit fullscreen' }).tap();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await context.close();
});

test('storage fallback and reduced motion keep the game playable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage is blocked.'); } });
  });
  await page.goto('/');
  await expect(page.locator('#header-best')).toHaveText('000000');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'countdown');
  await page.keyboard.press('KeyP');
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('.screen-texture')).toBeHidden();
});

test('the header restores the stored personal best', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tokyo-nights.best', '12345');
    localStorage.setItem('tokyo-nights.character', 'unknown-driver');
  });
  await page.goto('/');
  await expect(page.locator('#header-best')).toHaveText('012345');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await expect(page.getByRole('radio', { name: 'DHH', exact: true })).toBeChecked();
});

test('a complete run shows readable results, saves the score, and retries at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await driverOption(page, 'Ryan').click();
  await page.screenshot({ path: '.impeccable/review/selection-narrow.png', fullPage: true, animations: 'disabled' });
  await page.getByRole('button', { name: 'DRIVE AS RYAN' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await page.clock.runFor(3600);
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing');
  await page.keyboard.down('KeyS');
  await page.clock.runFor(61_000);
  await page.keyboard.up('KeyS');
  await expect(page.locator('#results-overlay')).toBeVisible();
  const saved = await page.evaluate(() => Number(localStorage.getItem('tokyo-nights.best')));
  expect(saved).toBeGreaterThan(0);
  await expect(page.locator('#final-score')).toHaveText(saved.toString().padStart(6, '0'));
  const labels = await page.locator('#results-overlay .text-button, #results-overlay .primary-button, #results-overlay .result-stats span').evaluateAll((elements) => elements.map((element) => parseFloat(getComputedStyle(element).fontSize)));
  expect(labels.every((size) => size >= 12)).toBe(true);
  await page.screenshot({ path: '.impeccable/review/results-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'ONE MORE RUN' }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'select');
  await expect(page.getByRole('radio', { name: 'Ryan', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'DRIVE AS RYAN' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'countdown');
});

test('driver choice persists and a canceled selection preserves the paused run', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await driverOption(page, 'Ryan').click();
  await page.getByRole('button', { name: 'DRIVE AS RYAN' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await expect(page.getByRole('radio', { name: 'Ryan', exact: true })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'title');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await page.getByRole('button', { name: 'DRIVE AS RYAN' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await page.clock.runFor(5000);
  await page.keyboard.press('KeyP');
  const score = await page.locator('#score').textContent();
  await page.getByRole('button', { name: 'START A NEW RUN' }).click();
  await driverOption(page, 'DHH').click();
  await page.getByRole('button', { name: 'BACK', exact: true }).click();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('#score')).toHaveText(score);
  await expect(page.locator('#game')).toHaveAttribute('aria-label', /^Ryan drives/);
  await page.getByRole('button', { name: 'START A NEW RUN' }).click();
  await expect(page.getByRole('radio', { name: 'Ryan', exact: true })).toBeChecked();
  await driverOption(page, 'DHH').click();
  await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await page.clock.runFor(5000);
  await page.keyboard.down('Space');
  await page.clock.runFor(1100);
  await expect(page.locator('#announcer')).toHaveText('DHH leans out of the window, turns, and smiles.');
  await page.screenshot({ path: '.impeccable/review/gameplay-dhh.png', fullPage: true });
  await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('tokyo-nights.character'))).toBe('dhh');
});

test('character selection fits touch landscape and fullscreen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: 'START ENGINE' }).tap();
  await driverOption(page, 'Ryan').tap();
  const actionFits = () => page.locator('#confirm-driver-button').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.top >= 0 && bounds.bottom <= innerHeight && bounds.left >= 0 && bounds.right <= innerWidth;
  });
  await expect.poll(actionFits).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  const controlsDoNotOverlap = () => page.evaluate(() => {
    const a = document.querySelector('[data-control="brake"]').getBoundingClientRect();
    const b = document.querySelector('[data-control="nitro"]').getBoundingClientRect();
    return a.bottom <= b.top || b.bottom <= a.top || a.right <= b.left || b.right <= a.left;
  });
  expect(await controlsDoNotOverlap()).toBe(true);
  await page.screenshot({ path: '.impeccable/review/selection-landscape.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'Enter fullscreen' }).tap();
  await expect.poll(actionFits).toBe(true);
  expect(await controlsDoNotOverlap()).toBe(true);
  expect(await page.locator('.cabinet-bar').evaluate((element) => {
    const bar = element.getBoundingClientRect();
    return [...element.querySelectorAll('button')].every((button) => {
      const bounds = button.getBoundingClientRect();
      return bounds.left >= bar.left && bounds.right <= bar.right;
    });
  })).toBe(true);
  await page.screenshot({ path: '.impeccable/review/selection-fullscreen.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'DRIVE AS RYAN' }).tap();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).tap();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'countdown');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await context.close();
});
