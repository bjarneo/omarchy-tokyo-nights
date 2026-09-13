import { test, expect } from '@playwright/test';
import { createStaticServer } from '../../tools/server.mjs';

let server;
let url;
test.beforeAll(async () => {
  server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}/music-video.html`;
});
test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

test('the audio clock drives playback, pause, chapter seeks, and captions', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  await expect(page.getByRole('button', { name: 'Play video', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Play video', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause video' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.querySelector('audio').currentTime)).toBeGreaterThan(.15);
  await page.getByRole('button', { name: 'Pause video' }).click();
  const pausedAt = await page.evaluate(() => document.querySelector('audio').currentTime);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => document.querySelector('audio').currentTime)).toBe(pausedAt);
  await page.getByRole('button', { name: 'Chorus 1' }).click();
  await expect(page.locator('#current-lyric')).toHaveText('Neon on yellow, roaring through the rain');
  expect(await page.evaluate(() => document.querySelector('audio').currentTime)).toBeCloseTo(65.74, 2);
  await page.getByRole('button', { name: 'Lyrics', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lyrics', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Tokyo Bay' }).click();
  await expect(page.locator('#current-lyric')).toHaveText('Sunrise creeping over Tokyo Bay');
  expect(errors).toEqual([]);
});

test('nonsequential frame exports produce identical pixels at the same audio time', async ({ page }) => {
  await page.goto(`${url}?export`);
  await page.waitForFunction(() => window.videoReady);
  const same = await page.evaluate(() => {
    const before = window.musicVideo.frame(71.36);
    window.musicVideo.frame(180);
    window.musicVideo.frame(6);
    return before === window.musicVideo.frame(71.36);
  });
  expect(same).toBe(true);
});

test('the player fits a narrow screen and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url);
  await page.waitForFunction(() => window.videoReady);
  const layout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    frame: window.musicVideo.renderAt(70),
  }));
  expect(layout.overflow).toBe(false);
  expect(layout.frame.reducedMotion).toBe(true);
  expect(layout.frame.pulse).toBe(0);
  await expect(page.getByRole('button', { name: 'Play video', exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Enter fullscreen' })).toBeInViewport();
});

test('a missing song shows a recoverable error', async ({ page }) => {
  await page.route('**/assets/omarchy-tokyo-nights.mp3', (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto(url);
  await expect(page.getByRole('status')).toContainText('The song cannot load.');
  await expect(page.getByRole('button', { name: 'Play video', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Reload video' })).toBeVisible();
});
