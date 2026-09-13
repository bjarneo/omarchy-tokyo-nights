import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const song = await readFile(new URL('../../assets/omarchy-tokyo-nights.mp3', import.meta.url));
const shortTrack = Buffer.alloc(44 + 16000);
shortTrack.write('RIFF', 0); shortTrack.writeUInt32LE(shortTrack.length - 8, 4); shortTrack.write('WAVEfmt ', 8);
shortTrack.writeUInt32LE(16, 16); shortTrack.writeUInt16LE(1, 20); shortTrack.writeUInt16LE(1, 22);
shortTrack.writeUInt32LE(8000, 24); shortTrack.writeUInt32LE(16000, 28); shortTrack.writeUInt16LE(2, 32); shortTrack.writeUInt16LE(16, 34);
shortTrack.write('data', 36); shortTrack.writeUInt32LE(16000, 40);
async function station(page) {
  await page.route('https://radio.omarchy.org/tracks/*.mp3', (route) => route.fulfill({ contentType: 'audio/mpeg', body: song }));
}

for (const path of ['/', '/vr.html']) {
  test(`the car radio selects, plays, changes tracks, and coordinates the MP3 on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const errors = [];
    const requests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => { if (request.url().includes('radio.omarchy.org/tracks/')) requests.push(request.url()); });
    await station(page);
    await page.goto(path);
    await expect(page.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
    expect(requests).toEqual([]);
    await page.getByRole('button', { name: 'Choose radio track and volume' }).click();
    await expect(page.getByLabel('Radio track', { exact: true }).locator('option')).toHaveCount(33);
    await page.getByLabel('Radio track', { exact: true }).selectOption('18');
    await expect(page.locator('.radio-title')).toHaveText('Hyprland After Dark');
    expect(requests).toEqual([]);
    await page.getByRole('button', { name: 'Play radio', exact: true }).click();
    await expect.poll(() => page.locator('#radio-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
    await expect(page.locator('#radio-audio')).toHaveAttribute('src', /ryan-r-hughes-hyprland-after-dark\.mp3$/);
    await page.getByRole('button', { name: 'Next radio track' }).click();
    await expect(page.locator('.radio-title')).toHaveText('Boot Up Your New Digital World');
    await page.getByRole('button', { name: 'Previous radio track' }).click();
    await expect(page.locator('.radio-title')).toHaveText('Hyprland After Dark');
    await page.getByLabel('Radio volume').press('ArrowRight');
    expect(await page.locator('#radio-audio').evaluate((audio) => audio.volume)).toBe(.56);
    await page.screenshot({ path: `.impeccable/review/radio-${path === '/' ? 'arcade' : 'vr'}-desktop.png`, fullPage: true });
    await page.getByRole('button', { name: 'Play MP3 song', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause MP3 song', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
    expect(await page.locator('#radio-audio').evaluate((audio) => audio.paused)).toBe(true);
    await page.getByRole('button', { name: 'Play radio', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause radio', exact: true })).toBeVisible();
    expect(await page.locator('#song-audio').evaluate((audio) => audio.paused)).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Choose radio track and volume' }).click();
    await expect(page.getByLabel('Radio track', { exact: true })).toHaveValue('18');
    await expect(page.getByLabel('Radio volume')).toHaveValue('56');
    await expect(page.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('the radio advances after the last track and supports errors, retry, and load cancellation', async ({ page }) => {
  await station(page);
  await page.route('**/tracks/triciaamazingyear-take-me-lead-me-show-me-the-way.mp3', (route) => route.fulfill({ contentType: 'audio/wav', body: shortTrack }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Choose radio track and volume' }).click();
  await page.getByLabel('Radio track', { exact: true }).selectOption('32');
  await page.getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect(page.getByLabel('Radio track', { exact: true })).toHaveValue('0');
  await page.getByRole('button', { name: 'Pause radio', exact: true }).click();
  await page.route('**/tracks/michel-krapf-still-licensed.mp3', (route) => route.fulfill({ status: 404, body: 'Not found.' }));
  await page.getByLabel('Radio track', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect(page.locator('.radio-notice')).toContainText('Try Play or Next');
  await page.unroute('**/tracks/michel-krapf-still-licensed.mp3');
  await page.getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause radio', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause radio', exact: true }).click();
  await page.evaluate(() => { HTMLMediaElement.prototype.play = () => new Promise(() => {}); });
  await page.getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cancel radio load' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel radio load' }).click();
  await expect(page.getByRole('button', { name: 'Play radio', exact: true })).toBeVisible();
});

test('mobile radio controls fit, remain separate from driving keys, and support fullscreen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await station(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Choose radio track and volume' }).tap();
  await page.getByLabel('Radio track', { exact: true }).selectOption('3');
  const touch = await context.newCDPSession(page);
  await page.screenshot({ path: '.impeccable/review/radio-arcade-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await page.getByRole('button', { name: 'Choose radio track and volume' }).tap();
  await page.getByRole('button', { name: 'START ENGINE' }).tap();
  await page.getByRole('button', { name: 'DRIVE AS DHH' }).tap();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).tap();
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing');
  await page.getByRole('button', { name: 'Play radio', exact: true }).press('Space');
  await expect(page.getByRole('button', { name: 'Pause radio', exact: true })).toBeVisible();
  await expect(page.locator('#nitro-meter')).toHaveAttribute('aria-valuenow', '100');
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).tap();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expect(page.locator('#car-radio')).toBeVisible();
  await expect(page.locator('#touch-controls')).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/radio-fullscreen-mobile.png' });
  const bounds = await page.locator('#touch-controls').boundingBox();
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  await context.close();
});

test('blocked storage leaves the radio playable under a site subpath', async ({ page }) => {
  await station(page);
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked.'); } }));
  await page.route('**/release/**', async (route) => {
    const response = await route.fetch({ url: route.request().url().replace('/release/', '/') });
    await route.fulfill({ response });
  });
  await page.goto('/release/');
  await page.getByRole('button', { name: 'Play radio', exact: true }).click();
  await expect.poll(() => page.locator('#radio-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
});
