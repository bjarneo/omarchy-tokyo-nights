import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const iwer = await readFile(new URL('../../node_modules/iwer/build/iwer.js', import.meta.url), 'utf8');

async function emulateHeadset(page) {
  await page.addInitScript({ content: `${iwer}\n
    window.xrDevice = new IWER.XRDevice(IWER.metaQuest3, { stereoEnabled: true });
    xrDevice.installRuntime({ forceInstall: true });
    // IWER 2.4.0 expects the matrix when it creates an offset space.
    const offsetSpace = IWER.XRReferenceSpace.prototype.getOffsetReferenceSpace;
    IWER.XRReferenceSpace.prototype.getOffsetReferenceSpace = function (offset) { return offsetSpace.call(this, offset.matrix); };
    xrDevice.position.set(0, 1.6, 0);
    xrDevice.controllers.left.position.set(-.25, 1.1, -.4);
    xrDevice.controllers.right.position.set(.25, 1.1, -.4);
  ` });
}

async function probeHeadsetDashboard(page) {
  await page.evaluate(async () => {
    const { VRScene } = await import('/src/vr-scene.js');
    const draw = VRScene.prototype.update;
    VRScene.prototype.update = function (...args) {
      draw.apply(this, args);
      if (!this.renderer.xr.isPresenting || window.headsetDashboardPixels || args[0].state !== 'playing') return;
      const gl = this.renderer.getContext();
      window.headsetDashboardPixels = [350, 1070].map((x) => {
        const pixel = new Uint8Array(4);
        gl.readPixels(x, 360, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        return Array.from(pixel);
      });
    };
  });
}

async function xrButton(page, hand, button, value) {
  await page.evaluate(({ hand, button, value }) => xrDevice.controllers[hand].updateButtonValue(button, value), { hand, button, value });
  await page.waitForTimeout(100);
}

async function selectStartInHeadset(page, target = { x: 0, y: 2.311 }) {
  await page.evaluate(async (target) => {
    const { Vector3, Quaternion } = await import('/assets/three.module.js');
    const controller = xrDevice.controllers.right;
    const direction = new Vector3(target.x - .25, target.y - 1.1, (target.z ?? -2.6) + .4).normalize();
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction);
    controller.quaternion.set(q.x, q.y, q.z, q.w);
  }, target);
  await page.waitForTimeout(150);
  await xrButton(page, 'right', 'trigger', 1);
  await xrButton(page, 'right', 'trigger', 0);
}

test('the cockpit supports a screen race, saved setup, boost, and pause', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'xr', { value: undefined, configurable: true }));
  const errors = [];
  const requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.getByRole('link', { name: 'Open VR cockpit' }).click();
  await expect(page.locator('#vr-drive')).toBeEnabled();
  await expect(page.locator('#vr-support')).toContainText('no WebXR');
  await expect(page.locator('#vr-enter')).toBeDisabled();
  await expect(page.locator('#vr-character-art')).toHaveAttribute('aria-label', 'DHH');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '.impeccable/review/vr-desktop.png', fullPage: true });
  await page.selectOption('#vr-driver', 'ryan');
  await expect(page.locator('#vr-character-art')).toHaveAttribute('aria-label', 'Ryan');
  await page.selectOption('#vr-car', 'rx7');
  await page.selectOption('#vr-paint', 'blue');
  await page.getByRole('button', { name: 'DRIVE ON SCREEN' }).click();
  await expect(page.locator('#vr-objective')).toHaveText('Collect a cassette, then reach the Shibuya exit.');
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing', { timeout: 10_000 });
  await expect.poll(() => page.locator('#vr-speed').textContent().then(Number)).toBeGreaterThan(100);
  await page.keyboard.down('Space');
  await expect.poll(() => page.locator('#vr-nitro').textContent().then(Number)).toBeLessThan(95);
  await page.keyboard.up('Space');
  await page.keyboard.press('KeyP');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'paused');
  const time = await page.locator('#vr-time').textContent();
  await page.waitForTimeout(300);
  expect(await page.locator('#vr-time').textContent()).toBe(time);
  await page.getByRole('button', { name: 'RESUME ON SCREEN' }).click();
  await page.getByRole('button', { name: 'Turn sound on' }).click();
  await expect(page.locator('#vr-sound')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: '.impeccable/review/vr-driving.png', fullPage: true });
  await page.reload();
  await expect(page.locator('#vr-car')).toHaveValue('rx7');
  await expect(page.locator('#vr-paint')).toHaveValue('blue');
  await expect(page.locator('#vr-driver')).toHaveValue('ryan');
  expect(errors).toEqual([]);
  expect(requests.every((url) => url.startsWith(new URL(page.url()).origin))).toBe(true);
});

test('the headset selects visible garage characters and cars and shows the driver cameo', async ({ page }) => {
  test.setTimeout(80_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await emulateHeadset(page);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/vr.html');
  await expect(page.locator('#vr-enter')).toBeEnabled();
  await page.locator('#vr-enter').click();
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'active');
  await selectStartInHeadset(page, { x: 3.2, y: 1.86, z: -4.7 });
  const chosen = await page.evaluate(async () => (await import('/src/characters.mjs')).CHARACTERS[2]);
  await expect(page.locator('#vr-driver')).toHaveValue(chosen.id);
  await selectStartInHeadset(page, { x: -3.25, y: 1.3, z: -4 });
  await expect(page.locator('#vr-car')).toHaveValue('skyline');
  await page.screenshot({ path: '.impeccable/review/vr-garage-headset.png', fullPage: true });
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'story');
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing', { timeout: 15_000 });
  await expect.poll(() => page.locator('#vr-speed').textContent().then(Number)).toBeGreaterThan(100);
  await page.evaluate(async () => {
    const { GameEngine } = await import('/src/engine.mjs');
    const update = GameEngine.prototype.update;
    window.cameoCapture = null;
    GameEngine.prototype.update = function (delta) {
      if (window.cameoCapture) return;
      update.call(this, delta);
      // Hold the observed smile pose for a deterministic render capture.
      if (this.cameoTime >= 1 && this.cameoTime < 1.7) window.cameoCapture = { characterId: this.characterId, time: this.cameoTime };
    };
    window.releaseCameoCapture = () => { GameEngine.prototype.update = update; };
  });
  await xrButton(page, 'right', 'a-button', 1);
  await expect(page.locator('#vr-announcer')).toHaveText(`${chosen.name} leans out of the window and smiles.`);
  await expect.poll(() => page.evaluate(() => window.cameoCapture?.characterId)).toBe(chosen.id);
  await page.evaluate(() => xrDevice.quaternion.set(0, Math.sin(.35 / 2), 0, Math.cos(.35 / 2)));
  await page.evaluate(() => new Promise((resolve) => xrDevice.activeSession.requestAnimationFrame(() => xrDevice.activeSession.requestAnimationFrame(resolve))));
  await page.screenshot({ path: '.impeccable/review/vr-headset-cameo.png', fullPage: true });
  await page.evaluate(() => window.releaseCameoCapture());
  await xrButton(page, 'right', 'a-button', 0);
  await page.evaluate(() => xrDevice.quaternion.set(0, Math.sin(-1.2 / 2), 0, Math.cos(-1.2 / 2)));
  await page.waitForTimeout(150);
  await page.screenshot({ path: '.impeccable/review/vr-companion.png', fullPage: true });
  await page.evaluate(() => xrDevice.activeSession.end());
  expect(errors).toEqual([]);
});

test('mobile cockpit setup and touch controls fit a narrow screen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/vr.html');
  await expect(page.locator('#vr-drive')).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '.impeccable/review/vr-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'DRIVE ON SCREEN' }).tap();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).tap();
  await expect(page.locator('#vr-touch')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing', { timeout: 10_000 });
  const cdp = await context.newCDPSession(page);
  const bounds = await page.locator('[data-control="left"]').boundingBox();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(page.locator('[data-control="left"]')).not.toHaveClass('is-pressed');
  await page.getByRole('button', { name: 'PAUSE', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'RESUME ON SCREEN' })).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});

test('a real emulated WebXR session renders stereo and supports controller menus, pause, exit, and re-entry', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await emulateHeadset(page);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/vr.html');
  await expect(page.locator('#vr-enter')).toBeEnabled();
  await probeHeadsetDashboard(page);
  await page.locator('#vr-enter').click();
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'active');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'title');
  const stereo = await page.evaluate(async () => {
    const session = xrDevice.activeSession;
    const reference = await session.requestReferenceSpace('local');
    return new Promise((resolve) => session.requestAnimationFrame((_, frame) => resolve(frame.getViewerPose(reference).views.map((view) => ({ eye: view.eye, x: view.transform.position.x })))));
  });
  expect(stereo.map((view) => view.eye)).toEqual(['left', 'right']);
  expect(stereo[0].x).toBeLessThan(stereo[1].x);
  await page.screenshot({ path: '.impeccable/review/vr-headset-menu.png', fullPage: true });
  await selectStartInHeadset(page, { x: -.669, y: 1.605 });
  await expect.poll(() => page.locator('#song-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
  await expect(page.locator('#vr-song')).toHaveAttribute('aria-pressed', 'true');
  await selectStartInHeadset(page, { x: -.669, y: 1.605 });
  await expect(page.locator('#vr-song')).toHaveAttribute('aria-pressed', 'false');
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'story');
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'countdown');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing', { timeout: 10_000 });
  await expect.poll(() => page.locator('#vr-speed').textContent().then(Number)).toBeGreaterThan(100);
  await xrButton(page, 'right', 'a-button', 1);
  await expect.poll(() => page.locator('#vr-nitro').textContent().then(Number)).toBeLessThan(98);
  await xrButton(page, 'right', 'a-button', 0);
  await page.evaluate(() => xrDevice.updateVisibilityState('visible-blurred'));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'paused');
  const time = await page.locator('#vr-time').textContent();
  await page.evaluate(() => xrDevice.updateVisibilityState('visible'));
  await page.waitForTimeout(300);
  expect(await page.locator('#vr-time').textContent()).toBe(time);
  await xrButton(page, 'right', 'b-button', 1);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing');
  await page.waitForTimeout(200);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing');
  await xrButton(page, 'right', 'b-button', 0);
  await page.screenshot({ path: '.impeccable/review/vr-headset-race.png', fullPage: true });
  // The road must not cover the instrument panel in either eye.
  await expect.poll(() => page.evaluate(() => headsetDashboardPixels?.length)).toBe(2);
  expect(await page.evaluate(() => headsetDashboardPixels.every((pixel) => pixel.join(',') !== '36,40,59,255'))).toBe(true);
  await page.evaluate(() => xrDevice.activeSession.end());
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'ready');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'paused');
  await expect(page.locator('#vr-enter')).toBeEnabled();
  await page.locator('#vr-enter').click();
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'active');
  await page.evaluate(() => xrDevice.activeSession.end());
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'ready');
  await page.getByRole('button', { name: 'RESUME ON SCREEN' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing');
  expect(errors).toEqual([]);
});

test('VR permission denial permits retry without starting a race', async ({ page }) => {
  await emulateHeadset(page);
  await page.goto('/vr.html');
  await expect(page.locator('#vr-enter')).toBeEnabled();
  await page.evaluate(() => {
    const request = navigator.xr.requestSession.bind(navigator.xr);
    navigator.xr.requestSession = () => {
      navigator.xr.requestSession = request;
      return Promise.reject(new DOMException('Denied.', 'NotAllowedError'));
    };
  });
  await page.locator('#vr-enter').click();
  await expect(page.locator('#vr-support')).toContainText('denied');
  await expect(page.locator('#vr-enter')).toBeEnabled();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'title');
  await page.locator('#vr-enter').click();
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'active');
  await page.evaluate(() => xrDevice.activeSession.end());
});

test('blocked storage and reduced motion retain a usable cockpit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked.'); } }));
  await page.goto('/vr.html');
  await expect(page.locator('#vr-drive')).toBeEnabled();
  await expect(page.locator('#vr-comfort')).toBeChecked();
  await page.locator('#vr-drive').click();
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'countdown');
  await page.keyboard.press('KeyP');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'paused');
});

test('WebGL failure provides a recovery message', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type === 'webgl2' ? null : getContext.call(this, type, ...args); };
  });
  await page.goto('/vr.html');
  await expect(page.locator('#vr-support')).toContainText('Enable WebGL2');
  await expect(page.locator('#vr-drive')).toBeDisabled();
});

test('the VR campaign reaches the final delivery and can start another run', async ({ page }) => {
  await page.route('**/src/engine.mjs', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}
const CampaignEngine = GameEngine;
GameEngine = class PreparedDelivery extends CampaignEngine {
  start(...args) {
    super.start(...args);
    this.stage = 3;
    this.cassette = true;
    this.powerCells = 2;
    this.chaptersComplete = 3;
    this.distance = CHECKPOINT_LENGTH * 4 - 1;
    this.nextCheckpoint = CHECKPOINT_LENGTH * 4;
    this.preparePickups();
  }
};` });
  });
  await page.goto('/vr.html');
  await expect(page.locator('#vr-drive')).toBeEnabled();
  await page.locator('#vr-drive').click();
  await expect(page.locator('#vr-heading')).toHaveText('BEFORE SUNRISE');
  await page.getByRole('button', { name: 'BEGIN CHAPTER' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'ending', { timeout: 10_000 });
  await page.getByRole('button', { name: 'VIEW RESULTS' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'complete');
  await expect(page.locator('#vr-heading')).toHaveText('DELIVERY COMPLETE.');
  expect(await page.evaluate(() => Number(localStorage.getItem('tokyo-nights.best')))).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'ONE MORE RUN' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'story');
});

test('the headset shows a failure reason and recoverable song states', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await emulateHeadset(page);
  await page.route('**/src/engine.mjs', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}
const RaceEngine = GameEngine;
GameEngine = class ExpiringRace extends RaceEngine {
  start(...args) { super.start(...args); this.time = .02; }
};` });
  });
  await page.route('**/assets/omarchy-tokyo-nights.mp3', (route) => route.fulfill({ status: 404, body: 'Not found.' }));
  await page.goto('/vr.html');
  await expect(page.locator('#vr-enter')).toBeEnabled();
  await page.locator('#vr-enter').click();
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'active');
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'story');
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'gameover', { timeout: 10_000 });
  await expect(page.locator('#vr-intro')).toContainText('Time is up.');
  await page.screenshot({ path: '.impeccable/review/vr-headset-failure.png', fullPage: true });
  await selectStartInHeadset(page, { x: -.669, y: 1.605 });
  await expect(page.locator('#vr-song-status')).toContainText('The song cannot');
  await page.screenshot({ path: '.impeccable/review/vr-headset-song-error.png', fullPage: true });
  await page.unroute('**/assets/omarchy-tokyo-nights.mp3');
  await page.evaluate(() => { HTMLMediaElement.prototype.play = () => new Promise(() => {}); });
  await selectStartInHeadset(page, { x: -.669, y: 1.605 });
  await expect(page.locator('#vr-song')).toHaveAttribute('aria-label', 'Cancel song load');
  await page.screenshot({ path: '.impeccable/review/vr-headset-song-pending.png', fullPage: true });
  await selectStartInHeadset(page, { x: -.669, y: 1.605 });
  await expect(page.locator('#vr-song')).toHaveAttribute('aria-label', 'Play MP3 song');
  await page.evaluate(() => xrDevice.activeSession.end());
});

test('a VR pit-stop conversation returns to the race', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await emulateHeadset(page);
  await page.route('**/src/engine.mjs', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}
const RaceEngine = GameEngine;
GameEngine = class EarlyPitStop extends RaceEngine {
  start(...args) { super.start(...args); this.pitStopAt = 80; this.pitStopLane = 1.22; }
};` });
  });
  await page.goto('/vr.html');
  await expect(page.locator('#vr-enter')).toBeEnabled();
  await page.locator('#vr-enter').click();
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'active');
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'story');
  await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing');
  await page.evaluate(() => xrDevice.controllers.left.updateAxis('thumbstick', 'x-axis', 1));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'pit', { timeout: 12_000 });
  await page.evaluate(() => xrDevice.controllers.left.updateAxis('thumbstick', 'x-axis', 0));
  await expect(page.locator('#vr-heading')).toHaveText('PIT STOP.');
  await page.screenshot({ path: '.impeccable/review/vr-headset-pit.png', fullPage: true });
  for (let i = 0; i < 4; i++) await selectStartInHeadset(page);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'playing');
  await expect(page.locator('#vr-nitro')).toHaveText('100');
  await page.evaluate(() => xrDevice.activeSession.end());
});
