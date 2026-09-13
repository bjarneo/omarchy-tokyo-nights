import { test, expect } from '@playwright/test';

for (const path of ['/', '/vr.html']) {
  test(`the MP3 button starts, pauses, and resumes the supplied song on ${path}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(path);
    const song = page.locator('#song-audio');
    await expect(song).toHaveAttribute('src', /assets\/omarchy-tokyo-nights\.mp3$/);
    expect(await song.evaluate((audio) => audio.paused)).toBe(true);
    await page.getByRole('button', { name: 'Play MP3 song', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pause MP3 song', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => song.evaluate((audio) => audio.currentTime)).toBeGreaterThan(.2);
    await page.getByRole('button', { name: 'Pause MP3 song', exact: true }).click();
    const position = await song.evaluate((audio) => audio.currentTime);
    expect(await song.evaluate((audio) => audio.paused)).toBe(true);
    await page.getByRole('button', { name: 'Play MP3 song', exact: true }).click();
    await expect.poll(() => song.evaluate((audio) => audio.currentTime)).toBeGreaterThan(position + .1);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('button', { name: 'Play MP3 song', exact: true })).toHaveAttribute('aria-pressed', 'false');
    expect(await song.evaluate((audio) => audio.paused)).toBe(true);
    expect(errors).toEqual([]);
  });
}

for (const path of ['/', '/vr.html']) test(`a failed song request shows recovery feedback on ${path}`, async ({ page }) => {
  await page.route('**/assets/omarchy-tokyo-nights.mp3', (route) => route.fulfill({ status: 404, body: 'Not found.' }));
  await page.goto(path);
  await page.getByRole('button', { name: 'Play MP3 song', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play MP3 song', exact: true })).toHaveAttribute('aria-pressed', 'false');
  const status = page.locator(path === '/' ? '#song-status' : '#vr-song-status');
  await expect(status).toBeVisible();
  await expect(status).toContainText('The song cannot');
  await page.screenshot({ path: `.impeccable/review/${path === '/' ? 'arcade' : 'vr'}-song-error.png`, fullPage: true });
});

test('the song load can be canceled without a stuck control', async ({ page }) => {
  await page.addInitScript(() => { HTMLMediaElement.prototype.play = () => new Promise(() => {}); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Play MP3 song' }).click();
  await expect(page.locator('#song-status')).toContainText('Select the song button to cancel.');
  await page.getByRole('button', { name: 'Cancel song load' }).click();
  await expect(page.getByRole('button', { name: 'Play MP3 song' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#song-status')).toBeHidden();
});
