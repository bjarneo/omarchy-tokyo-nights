import { test, expect } from '@playwright/test';
import { OMARCHY_THEMES } from '../../assets/omarchy-themes.js';

async function nearbyRocket(page) {
  await page.route('**/src/engine.mjs', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}
const CampaignEngine = GameEngine;
GameEngine = class NearbyRocket extends CampaignEngine {
  start(...args) { super.start(...args); this.rocketAt = 80; this.pitStopAt = null; window.rocketProbe = this; }
};` });
  });
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`drive into the Omarchy rocket, boost to Mars, and return at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 700, isMobile: viewport.width < 700 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.install();
    await nearbyRocket(page);
    await page.goto('/');
    await page.evaluate(() => {
      const strip = document.getElementById('rocket-palette');
      window.visitedThemes = new Set([strip.dataset.theme]);
      new MutationObserver(() => visitedThemes.add(strip.dataset.theme)).observe(strip, { attributes: true, attributeFilter: ['data-theme'] });
    });
    await page.getByRole('button', { name: 'START ENGINE' }).click();
    await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
    await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
    await page.clock.runFor(3600);
    if (viewport.width >= 700) await expect(page.locator('#rocket-pad-indicator')).toBeVisible();
    await expect(page.locator('#status-text')).toHaveText('ROCKET RIGHT · DRIVE INTO THE CYAN RAMP');
    const suffix = viewport.width < 700 ? 'mobile' : 'desktop';
    await page.screenshot({ path: `.impeccable/review/rocket-pad-${suffix}.png`, fullPage: true });
    await page.keyboard.down('ArrowRight');
    await page.clock.runFor(3500);
    await page.keyboard.up('ArrowRight');
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'rocket-flight');
    await expect(page.locator('#rocket-hud')).toBeVisible();
    const raceTime = await page.locator('#time').textContent();
    await page.clock.runFor(5500);
    await expect(page.locator('#rocket-phase')).toHaveText('HYPER BOOST');
    await expect(page.locator('#rocket-theme-name')).toContainText('/22');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `.impeccable/review/rocket-boost-${suffix}.png`, fullPage: true });
    await page.keyboard.press('KeyP');
    await expect(page.getByRole('heading', { name: 'FLIGHT PAUSED.' })).toBeVisible();
    const progress = await page.locator('#rocket-progress').getAttribute('aria-valuenow');
    await page.clock.runFor(10_000);
    await expect(page.locator('#rocket-progress')).toHaveAttribute('aria-valuenow', progress);
    await page.getByRole('button', { name: 'RESUME FLIGHT' }).click();
    await page.clock.runFor(20_000);
    await expect(page.getByRole('heading', { name: 'MARS REACHED.' })).toBeVisible();
    await expect(page.locator('#rocket-progress')).toHaveAttribute('aria-valuenow', '20.0');
    await expect(page.locator('#time')).toHaveText(raceTime);
    expect(await page.evaluate(() => [...visitedThemes].sort())).toEqual(OMARCHY_THEMES.map(({ id }) => id).sort());
    await page.screenshot({ path: `.impeccable/review/mars-${suffix}.png`, fullPage: true });
    await page.getByRole('button', { name: 'RETURN TO TOKYO' }).click();
    await expect(page.locator('#screen')).toHaveAttribute('data-state', 'playing');
    expect(Number(await page.locator('#score').textContent())).toBeGreaterThanOrEqual(5000);
    expect(errors).toEqual([]);
    await context.close();
  });
}

test('reduced motion retains the full timed rocket trip', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await nearbyRocket(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await page.clock.runFor(3600);
  await page.keyboard.down('ArrowRight');
  await page.clock.runFor(3500);
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'rocket-flight');
  await page.clock.runFor(6500);
  await expect(page.locator('#rocket-theme-name')).toContainText('/22');
  await page.screenshot({ path: '.impeccable/review/rocket-themes-reduced-motion.png', fullPage: true });
  await page.clock.runFor(20_000);
  await expect(page.locator('#screen')).toHaveAttribute('data-state', 'mars');
});

test('star music follows the flight clock, Sound, pause, and the MP3 control', async ({ page }) => {
  await page.clock.install();
  await nearbyRocket(page);
  await page.route('**/src/audio.js', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}
const updateAudio = ArcadeAudio.prototype.update;
ArcadeAudio.prototype.update = function (game) { window.rocketAudio = this; return updateAudio.call(this, game); };` });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'START ENGINE' }).click();
  await page.getByRole('button', { name: 'DRIVE AS DHH' }).click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await page.clock.runFor(3600);
  await page.keyboard.down('ArrowRight');
  await page.clock.runFor(3500);
  await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic?.source))).toBe(false);
  await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
  await page.clock.runFor(32);
  await page.evaluate(() => rocketAudio.starMusic.ready);
  await page.clock.runFor(32);
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic.source))).toBe(true);
  expect(await page.evaluate(() => rocketAudio.starMusic.buffer.duration)).toBe(20);
  await page.keyboard.press('KeyP');
  const pausedTime = await page.evaluate(() => rocketProbe.rocketTime);
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic.source))).toBe(false);
  await page.clock.runFor(3000);
  expect(await page.evaluate(() => rocketProbe.rocketTime)).toBe(pausedTime);
  await page.getByRole('button', { name: 'RESUME FLIGHT' }).click();
  await page.clock.runFor(32);
  expect(await page.evaluate(() => Math.abs(rocketAudio.starMusic.offset - rocketProbe.rocketTime))).toBeLessThan(.15);
  await page.getByRole('button', { name: 'Play MP3 song', exact: true }).click();
  await expect(page.locator('#song-button')).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(32);
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic.source))).toBe(false);
  await page.getByRole('button', { name: 'Pause MP3 song', exact: true }).click();
  await page.clock.runFor(32);
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic.source))).toBe(true);
  await page.getByRole('button', { name: 'Turn sound off', exact: true }).click();
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic.source))).toBe(false);
  await page.getByRole('button', { name: 'Turn sound on', exact: true }).click();
  await page.clock.runFor(32);
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic.source))).toBe(true);
  await page.evaluate(() => { rocketProbe.update(20); rocketAudio.update(rocketProbe); });
  expect(await page.evaluate(() => Boolean(rocketAudio.starMusic.source))).toBe(false);
});

test('the star score renders audible stereo with clean start and end fades', async ({ page }) => {
  await page.goto('/');
  const stats = await page.evaluate(async () => {
    const { renderStarMusic } = await import('/src/rocket-music.js');
    const buffer = await renderStarMusic(22050);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    let energy = 0, peak = 0, stereo = 0, endPeak = 0;
    for (let i = 0; i < left.length; i++) {
      energy += left[i] ** 2 + right[i] ** 2;
      peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
      stereo += (left[i] - right[i]) ** 2;
      if (i > left.length - 220) endPeak = Math.max(endPeak, Math.abs(left[i]), Math.abs(right[i]));
    }
    return { duration: buffer.duration, channels: buffer.numberOfChannels, rms: Math.sqrt(energy / left.length / 2), peak, stereo: Math.sqrt(stereo / left.length), start: Math.max(Math.abs(left[0]), Math.abs(right[0])), endPeak };
  });
  expect(stats.duration).toBe(20);
  expect(stats.channels).toBe(2);
  expect(stats.rms).toBeGreaterThan(.01);
  expect(stats.peak).toBeLessThan(.8);
  expect(stats.stereo).toBeGreaterThan(.001);
  expect(stats.start).toBeLessThan(.00001);
  expect(stats.endPeak).toBeLessThan(.003);
});
