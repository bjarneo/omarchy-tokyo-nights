import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const runtime = await readFile(new URL('../../node_modules/iwer/build/iwer.js', import.meta.url), 'utf8');

async function emulate(page) {
  await page.addInitScript({ content: `${runtime}\n
    window.xrDevice = new IWER.XRDevice(IWER.metaQuest3, { stereoEnabled: true });
    xrDevice.installRuntime({ forceInstall: true });
    const offset = IWER.XRReferenceSpace.prototype.getOffsetReferenceSpace;
    IWER.XRReferenceSpace.prototype.getOffsetReferenceSpace = function (transform) { return offset.call(this, transform.matrix); };
    xrDevice.position.set(0, 1.6, 0);
    xrDevice.controllers.left.position.set(-.25, 1.15, -.35);
    xrDevice.controllers.right.position.set(.25, 1.15, -.35);
  ` });
}

async function observe(page) {
  await page.evaluate(async () => {
    const { ClubScene } = await import('/src/club-scene.js');
    const update = ClubScene.prototype.update;
    ClubScene.prototype.update = function (...args) { window.clubView = this; window.clubModel = args[0]; return update.apply(this, args); };
  });
  await page.waitForFunction(() => Boolean(window.clubView));
}

async function approach(page, id) {
  await page.evaluate(async (id) => {
    const { STATIONS, CLUB } = await import('/src/club-data.mjs');
    const { canStand, segmentHitsBox } = await import('/src/club-engine.mjs');
    const target = STATIONS.find((item) => item.id === id) || clubModel.crew.find((item) => item.id === id);
    const point = target.stand || Array.from({ length: 16 }, (_, index) => {
      const yaw = index * Math.PI / 8;
      return { x: target.x + Math.sin(yaw) * 2, z: target.z + Math.cos(yaw) * 2, yaw };
    }).find((candidate) => canStand(candidate.x, candidate.z, clubModel.obstacles) && !clubModel.obstacles.some((box) => box.id !== id && segmentHitsBox({ ...candidate, y: CLUB.eyeHeight }, { x: target.x, y: target.eyeHeight, z: target.z }, box)));
    if (!point) throw new Error('No clear approach point.');
    if (!clubView.teleport(point, point.yaw)) throw new Error('The approach point is blocked.');
    clubView.resetCamera(); clubView.scene.updateMatrixWorld(true); clubView.camera.getWorldPosition(clubView.head);
    const dx = target.x - clubView.head.x; const dz = target.z - clubView.head.z;
    clubView.lookYaw = Math.atan2(-dx, -dz) - clubView.rig.rotation.y;
    clubView.pitch = Math.atan2((target.eyeHeight || target.height) - clubView.head.y, Math.hypot(dx, dz));
  }, id);
  await page.waitForTimeout(180);
}

async function xrClick(page, action) {
  await page.evaluate(async (action) => {
    const { Vector3, Quaternion } = await import('/assets/three.module.js');
    const panel = clubView.panel;
    const button = panel.buttons.find((item) => item.id === action);
    if (!button) throw new Error(`No spatial button: ${action}`);
    const target = panel.mesh.localToWorld(new Vector3(((button.x + button.width / 2) / 1024 - .5) * 1.7, (.5 - (button.y + button.height / 2) / 640) * 1.0625, 0));
    const ray = clubView.controllers.find(({ ray }) => ray.userData.hand === 'right').ray;
    const origin = ray.getWorldPosition(new Vector3());
    const inverse = clubView.rig.getWorldQuaternion(new Quaternion()).invert();
    const direction = target.sub(origin).applyQuaternion(inverse).normalize();
    const orientation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction);
    xrDevice.controllers.right.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
  }, action);
  await page.waitForTimeout(150);
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 1));
  await page.waitForTimeout(150);
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 0));
  await page.waitForTimeout(150);
}

test('the clubhouse supports movement, conversations, a map, and the supplied song', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = []; const requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.locator('.club-visit').click();
  await expect(page.locator('#club-explore')).toBeEnabled();
  await observe(page);
  await page.evaluate(() => clubView.room.logoReady);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '.impeccable/review/club-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'EXPLORE ON SCREEN' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  const before = await page.evaluate(() => clubView.head.z);
  await page.keyboard.down('KeyW'); await page.waitForTimeout(1100); await page.keyboard.up('KeyW');
  expect(await page.evaluate(() => clubView.head.z)).toBeLessThan(before - .7);
  const host = await page.evaluate(() => clubModel.crew[0]);
  await approach(page, host.id);
  await page.keyboard.press('KeyE');
  await expect(page.locator('#club-panel-title')).toHaveText(host.name.toUpperCase());
  await expect(page.locator('#club-panel-subtitle')).toHaveText('CLUB HOST');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  await expect(page.locator('#club-panel-text')).toContainText('The Amiga lab');
  await page.screenshot({ path: '.impeccable/review/club-talk-desktop.png', fullPage: true });
  await page.evaluate(() => { window.spokenLines = []; speechSynthesis.speak = (utterance) => spokenLines.push(utterance.text); });
  await page.getByRole('button', { name: 'READ ALOUD' }).click();
  expect(await page.evaluate(() => spokenLines.length)).toBe(1);
  await page.getByRole('button', { name: 'BACK TO THE ROOM' }).click();
  await page.keyboard.press('Tab');
  await expect(page.locator('#club-map-canvas')).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/club-map.png', fullPage: true });
  await page.getByRole('button', { name: 'THE BBS CORNER', exact: true }).click();
  await expect(page.locator('#club-location')).toHaveText('THE BBS CORNER');
  await page.getByRole('button', { name: 'Play MP3 song', exact: true }).click();
  await expect.poll(() => page.locator('#song-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button', { name: 'Pause MP3 song', exact: true }).click();
  expect(errors).toEqual([]);
  expect(requests.every((url) => url.startsWith(new URL(page.url()).origin))).toBe(true);
});

test('the old hardware changes its live CRT output and supports a playable club game', async ({ page }) => {
  test.setTimeout(70_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  await page.locator('#club-explore').click();
  await approach(page, 'amiga500'); await page.keyboard.press('KeyE');
  await expect(page.locator('#club-panel-title')).toHaveText('COMMODORE AMIGA 500');
  await page.getByRole('button', { name: 'CHECKER BALL', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await expect.poll(() => page.evaluate(() => clubModel.devices.amiga500.mode)).toBe('boing');
  await page.screenshot({ path: '.impeccable/review/club-amiga.png', fullPage: true });
  await approach(page, 'ibm-xt'); await page.keyboard.press('KeyE');
  await page.getByRole('button', { name: 'ATDT · DIAL CLUB BBS', exact: true }).click();
  await expect.poll(() => page.evaluate(() => clubModel.devices['ibm-xt'].online)).toBe(true);
  await page.waitForTimeout(350);
  await page.screenshot({ path: '.impeccable/review/club-bbs.png', fullPage: true });
  await approach(page, 'nes'); await page.keyboard.press('KeyE');
  await expect(page.locator('#club-panel-title')).toHaveText('NINTENDO ENTERTAINMENT SYSTEM');
  await page.getByRole('button', { name: 'PLAY THE CLUB GAME', exact: true }).click();
  await page.getByRole('button', { name: 'START GAME', exact: true }).click();
  await page.keyboard.down('Space');
  await expect.poll(() => page.locator('#club-game-score').textContent().then(Number), { timeout: 8000 }).toBeGreaterThan(0);
  await page.keyboard.up('Space');
  await page.locator('#club-pause').click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'paused');
  const pausedElapsed = await page.evaluate(() => clubModel.arcade.elapsed);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => clubModel.arcade.elapsed)).toBe(pausedElapsed);
  await page.locator('#club-panel-actions').getByRole('button', { name: 'RESUME', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'arcade');
  await page.screenshot({ path: '.impeccable/review/club-nes-game.png', fullPage: true });
  await page.getByRole('button', { name: 'LEAVE THE GAME' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await approach(page, 'mac128'); await page.keyboard.press('KeyE');
  await page.getByRole('button', { name: 'OPEN SKETCHPAD' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'sketch');
  const pixel = await page.evaluate(async () => {
    const { Vector3 } = await import('/assets/three.module.js');
    const point = clubView.room.screens.get('mac128').mesh.localToWorld(new Vector3(0, 0, .025)).project(clubView.camera);
    const bounds = document.querySelector('#club-canvas').getBoundingClientRect();
    return { x: bounds.left + (point.x + 1) / 2 * bounds.width, y: bounds.top + (1 - point.y) / 2 * bounds.height };
  });
  await page.mouse.click(pixel.x, pixel.y);
  await expect.poll(() => page.evaluate(() => clubModel.devices.mac128.pixels.length)).toBe(1);
  await page.getByRole('button', { name: 'CLEAR SKETCH' }).click();
  expect(await page.evaluate(() => clubModel.devices.mac128.pixels.length)).toBe(0);
  expect(errors).toEqual([]);
});

test('mobile room controls and dialogue fit a narrow display', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '.impeccable/review/club-mobile.png', fullPage: true });
  await page.locator('#club-explore').tap();
  await expect(page.locator('#club-touch')).toBeVisible();
  const cdp = await context.newCDPSession(page); const bounds = await page.locator('[data-move="forward"]').boundingBox();
  const before = await page.evaluate(() => clubView.head.z);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }] });
  await page.waitForTimeout(600);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await page.evaluate(() => clubView.head.z)).toBeLessThan(before - .25);
  const host = await page.evaluate(() => clubModel.crew[0]);
  await approach(page, host.id); await page.locator('#club-touch-use').tap();
  await expect(page.locator('#club-panel')).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/club-talk-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'BACK TO THE ROOM' }).tap();
  expect(errors).toEqual([]); await context.close();
});

test('WebXR supports walking, teleportation, conversations, snap turns, and session recovery', async ({ page }) => {
  test.setTimeout(85_000);
  await page.setViewportSize({ width: 1440, height: 1000 }); await emulate(page);
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-enter-vr')).toBeEnabled(); await observe(page);
  await page.locator('#club-enter-vr').click();
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'active');
  await xrClick(page, 'explore');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await page.screenshot({ path: '.impeccable/review/club-headset-room.png', fullPage: true });
  const before = await page.evaluate(() => clubView.head.z);
  await page.evaluate(() => xrDevice.controllers.left.updateAxis('thumbstick', 'y-axis', -.8));
  await page.waitForTimeout(450);
  await page.evaluate(() => xrDevice.controllers.left.updateAxis('thumbstick', 'y-axis', 0));
  expect(await page.evaluate(() => clubView.head.z)).toBeLessThan(before - .2);
  const teleportStart = await page.evaluate(() => ({ x: clubView.head.x, z: clubView.head.z }));
  await page.evaluate(() => { xrDevice.controllers.left.quaternion.set(-Math.sin(.2 / 2), 0, 0, Math.cos(.2 / 2)); xrDevice.controllers.left.updateButtonValue('trigger', 1); });
  await expect.poll(() => page.evaluate(() => Boolean(clubView.teleportTarget?.valid))).toBe(true);
  await page.screenshot({ path: '.impeccable/review/club-headset-teleport.png', fullPage: true });
  await page.evaluate(() => xrDevice.controllers.left.updateButtonValue('trigger', 0));
  await expect.poll(() => page.evaluate(() => clubView.head.z)).toBeLessThan(teleportStart.z - 1);
  const host = await page.evaluate(() => clubModel.crew[0]);
  await page.evaluate(async (host) => {
    const { Vector3, Quaternion, Euler } = await import('/assets/three.module.js');
    const target = new Vector3(host.x, host.eyeHeight, host.z);
    const inverse = clubView.rig.getWorldQuaternion(new Quaternion()).invert();
    const headDirection = target.clone().sub(clubView.head).applyQuaternion(inverse).normalize();
    const head = new Quaternion().setFromEuler(new Euler(Math.atan2(headDirection.y, Math.hypot(headDirection.x, headDirection.z)), Math.atan2(-headDirection.x, -headDirection.z), 0, 'YXZ'));
    xrDevice.quaternion.set(head.x, head.y, head.z, head.w);
    const ray = clubView.controllers.find(({ ray }) => ray.userData.hand === 'right').ray;
    const direction = target.sub(ray.getWorldPosition(new Vector3())).applyQuaternion(inverse).normalize();
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction);
    xrDevice.controllers.right.quaternion.set(q.x, q.y, q.z, q.w);
  }, host);
  await page.waitForTimeout(200);
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 1));
  await page.waitForTimeout(150); await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 0));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'talk');
  await page.evaluate(async () => {
    const { Vector3, Quaternion, Euler } = await import('/assets/three.module.js');
    const character = clubView.room.characters.find((item) => item.userData.characterId === clubModel.selected.id);
    const target = clubView.panel.mesh.position.clone().multiplyScalar(.6).add(new Vector3(character.position.x, clubModel.selected.eyeHeight, character.position.z).multiplyScalar(.4));
    const direction = target.sub(clubView.head).applyQuaternion(clubView.rig.getWorldQuaternion(new Quaternion()).invert()).normalize();
    const head = new Quaternion().setFromEuler(new Euler(Math.atan2(direction.y, Math.hypot(direction.x, direction.z)), Math.atan2(-direction.x, -direction.z), 0, 'YXZ'));
    xrDevice.quaternion.set(head.x, head.y, head.z, head.w);
  });
  await page.waitForTimeout(200);
  await xrClick(page, 'topic:0');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'talk');
  await expect(page.locator('#club-panel-text')).toContainText('The Amiga lab');
  expect(await page.evaluate(() => clubView.panel.mesh.position.distanceTo(clubView.head))).toBeLessThan(3.5);
  expect(await page.evaluate(() => {
    const center = clubView.panel.mesh.position.clone().project(clubView.renderer.xr.getCamera().cameras[0]);
    return Math.abs(center.x) < 1 && Math.abs(center.y) < 1 && center.z > -1 && center.z < 1;
  })).toBe(true);
  expect(await page.evaluate(async () => {
    const { Vector3, Raycaster } = await import('/assets/three.module.js');
    const target = clubView.room.characters.find((item) => item.userData.characterId === clubModel.selected.id).pickTarget;
    const ray = new Raycaster();
    for (const eye of clubView.renderer.xr.getCamera().cameras) {
      const origin = new Vector3().setFromMatrixPosition(eye.matrixWorld);
      for (const x of [-.7, 0, .7]) for (const y of [-.45, -.15, .15, .45]) {
        const point = clubView.panel.mesh.localToWorld(new Vector3(x, y, 0));
        ray.set(origin, point.clone().sub(origin).normalize());
        if (ray.intersectObject(target, false).some((hit) => hit.distance < point.distanceTo(origin) - .02)) return false;
      }
    }
    return true;
  })).toBe(true);
  await page.screenshot({ path: '.impeccable/review/club-headset-talk.png', fullPage: true });
  await xrClick(page, 'back');
  await page.evaluate(() => xrDevice.controllers.left.updateButtonValue('y-button', 1));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'map');
  await page.waitForTimeout(250);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'map');
  await page.evaluate(() => xrDevice.controllers.left.updateButtonValue('y-button', 0));
  await xrClick(page, 'zone:amiga');
  await expect(page.locator('#club-location')).toHaveText('AMIGA & 8-BIT LAB');
  const aimAtAmiga = () => page.evaluate(async () => {
    const { Vector3, Quaternion, Euler } = await import('/assets/three.module.js');
    const target = new Vector3(7.5, 1.25, -11);
    const inverse = clubView.rig.getWorldQuaternion(new Quaternion()).invert();
    const headDirection = target.clone().sub(clubView.head).applyQuaternion(inverse).normalize();
    const head = new Quaternion().setFromEuler(new Euler(Math.atan2(headDirection.y, Math.hypot(headDirection.x, headDirection.z)), Math.atan2(-headDirection.x, -headDirection.z), 0, 'YXZ'));
    xrDevice.quaternion.set(head.x, head.y, head.z, head.w);
    const ray = clubView.controllers.find(({ ray }) => ray.userData.hand === 'right').ray;
    const direction = target.sub(ray.getWorldPosition(new Vector3())).applyQuaternion(inverse).normalize();
    const orientation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, -1), direction);
    xrDevice.controllers.right.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
  });
  await aimAtAmiga();
  await page.evaluate(() => xrDevice.controllers.left.updateAxis('thumbstick', 'y-axis', -.7));
  await page.waitForTimeout(650);
  await page.evaluate(() => xrDevice.controllers.left.updateAxis('thumbstick', 'y-axis', 0));
  await aimAtAmiga();
  await page.waitForTimeout(150);
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 1));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'device');
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('trigger', 0));
  await expect(page.locator('#club-panel-title')).toHaveText('COMMODORE AMIGA 500');
  await page.screenshot({ path: '.impeccable/review/club-headset-machine.png', fullPage: true });
  await xrClick(page, 'mode:boing');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await expect.poll(() => page.evaluate(() => clubModel.devices.amiga500.mode)).toBe('boing');
  const yaw = await page.evaluate(() => clubView.rig.rotation.y);
  await page.evaluate(() => xrDevice.controllers.right.updateAxis('thumbstick', 'x-axis', 1));
  await expect.poll(() => page.evaluate(() => clubView.rig.rotation.y)).toBeLessThan(yaw - .4);
  const turned = await page.evaluate(() => clubView.rig.rotation.y);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => clubView.rig.rotation.y)).toBeCloseTo(turned, 4);
  await page.evaluate(() => xrDevice.controllers.right.updateAxis('thumbstick', 'x-axis', 0));
  await page.evaluate(() => xrDevice.updateVisibilityState('visible-blurred'));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'paused');
  await page.evaluate(() => xrDevice.updateVisibilityState('visible'));
  await xrClick(page, 'explore');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await page.evaluate(() => xrDevice.activeSession.end());
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'ready');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'paused');
  expect(errors).toEqual([]);
});

test('blocked storage and graphics failure provide usable fallback states', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked.'); } }));
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled();
  await page.locator('#club-explore').click(); await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type === 'webgl2' ? null : get.call(this, type, ...args); };
  });
  await page.reload();
  await expect(page.locator('#club-support')).toContainText('Enable WebGL2');
  await expect(page.locator('#club-explore')).toBeDisabled();
});

test('club characters match the player scale and use a complete coffee gesture', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  await page.evaluate(() => clubView.room.logoReady);
  const heights = await page.evaluate(async () => {
    const { Box3, Vector3 } = await import('/assets/three.module.js');
    return clubView.room.characters.map((avatar) => {
      avatar.updateWorldMatrix(true, true);
      const bounds = new Box3();
      avatar.model.traverse((object) => { if (object.isInstancedMesh && object.visible) bounds.union(new Box3().setFromObject(object)); });
      return { id: avatar.userData.characterId, feet: bounds.min.y, height: bounds.max.y - bounds.min.y, eyes: avatar.eye.getWorldPosition(new Vector3()).y };
    });
  });
  for (const avatar of heights) {
    expect(Math.abs(avatar.height - 1.95), avatar.id).toBeLessThan(.04);
    expect(Math.abs(avatar.feet), avatar.id).toBeLessThan(.025);
    expect(Math.abs(avatar.eyes - 1.65), avatar.id).toBeLessThan(.045);
  }
  await page.locator('#club-explore').click();
  await approach(page, 'bjarne');
  const lowered = await page.evaluate(async () => {
    const { Vector3 } = await import('/assets/three.module.js');
    const actor = clubView.room.characters.find((avatar) => avatar.userData.characterId === 'bjarne');
    return actor.prop.rim.getWorldPosition(new Vector3()).y;
  });
  await page.screenshot({ path: '.impeccable/review/club-coffee-rest.png', fullPage: true });
  await page.evaluate(async () => {
    const { ClubGame } = await import('/src/club-engine.mjs');
    const update = ClubGame.prototype.update;
    window.coffeeCapture = false;
    ClubGame.prototype.update = function (...args) {
      if (window.coffeeCapture) return;
      update.apply(this, args);
      const npc = this.crew.find((character) => character.id === 'bjarne');
      const phase = npc.clock % 14;
      // Hold an observed sip for a stable capture.
      if (phase > 2.8 && phase < 4.8 && npc.gestureBlend > .98 && !npc.moving) window.coffeeCapture = true;
    };
    window.releaseCoffeeCapture = () => { ClubGame.prototype.update = update; };
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.evaluate(() => window.coffeeCapture), { timeout: 20_000 }).toBe(true);
  const raised = await page.evaluate(async () => {
    const { Vector3 } = await import('/assets/three.module.js');
    const actor = clubView.room.characters.find((avatar) => avatar.userData.characterId === 'bjarne');
    actor.updateWorldMatrix(true, true);
    const rim = actor.prop.rim.getWorldPosition(new Vector3());
    return { y: rim.y, mouthDistance: rim.distanceTo(actor.mouth.getWorldPosition(new Vector3())), amount: actor.userData.gestureAmount };
  });
  expect(raised.y).toBeGreaterThan(lowered + .35);
  expect(raised.mouthDistance).toBeLessThan(.1);
  expect(raised.amount).toBeGreaterThan(.95);
  await page.screenshot({ path: '.impeccable/review/club-coffee-sip.png', fullPage: true });
  await page.evaluate(() => window.releaseCoffeeCapture());
  expect(errors).toEqual([]);
});

test('visible crew walks use live positions and stop for a conversation', async ({ page }) => {
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  await page.locator('#club-explore').click();
  await expect.poll(() => page.evaluate(() => clubModel.crew.some((npc) => npc.travel > .25)), { timeout: 12_000 }).toBe(true);
  const id = await page.evaluate(() => clubModel.crew.find((npc) => npc.travel > .25).id);
  await approach(page, id);
  await page.keyboard.press('KeyE');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'talk');
  const before = await page.evaluate(() => ({ x: clubModel.selected.x, z: clubModel.selected.z }));
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => ({ x: clubModel.selected.x, z: clubModel.selected.z }))).toEqual(before);
  expect(await page.evaluate(() => {
    const avatar = clubView.room.characters.find((item) => item.userData.characterId === clubModel.selected.id);
    return Math.hypot(avatar.position.x - clubModel.selected.x, avatar.position.z - clubModel.selected.z);
  })).toBeLessThan(.001);
});

test('the gallery loads its source marks and the local jukebox plays a selected queue', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  await page.evaluate(() => clubView.room.galleryReady);
  expect(await page.evaluate(() => clubView.room.galleryLoaded)).toBe(65);
  expect(await page.evaluate(() => clubView.room.galleryManifest.groups.flatMap((group) => group.entries).some((entry) => /^(gnome|gtk|qt)$/i.test(entry.id)))).toBe(false);
  await page.evaluate(() => clubView.room.characters.find((avatar) => avatar.userData.characterId === 'dhh').shirtReady);
  expect(await page.evaluate(() => Boolean(clubView.room.characters[0].getObjectByName('omarchy-shirt-logo')))).toBe(true);
  await page.locator('#club-explore').click();
  await page.evaluate(() => { clubView.teleport({ x: -10, z: 6.7 }, Math.PI); clubView.pitch = .14; });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '.impeccable/review/club-logo-gallery.png', fullPage: true });
  await approach(page, 'jukebox');
  await page.screenshot({ path: '.impeccable/review/club-jukebox.png', fullPage: true });
  await page.keyboard.press('KeyE');
  await expect(page.locator('#club-panel-subtitle')).toHaveText('33 TRACKS · PAGE 1 OF 6');
  await page.screenshot({ path: '.impeccable/review/club-jukebox-library.png', fullPage: true });
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'NEXT PAGE', exact: true }).click();
  await expect(page.locator('[data-action="jukebox:pick:32"]')).toContainText('TriciaAmazingyear');
  await expect(page.getByRole('button', { name: 'NEXT PAGE', exact: true })).toBeDisabled();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'PREVIOUS PAGE', exact: true }).click();
  await expect(page.locator('[data-action="jukebox:pick:5"]')).toContainText('EXPLICIT');
  await page.locator('[data-action="jukebox:pick:0"]').click();
  await page.getByRole('button', { name: 'PLAY NOW', exact: true }).click();
  await expect.poll(() => page.locator('#club-jukebox-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button', { name: 'TRACK LIBRARY', exact: true }).click();
  await page.locator('[data-action="jukebox:pick:1"]').click();
  await page.getByRole('button', { name: 'ADD TO QUEUE', exact: true }).click();
  await page.locator('[data-action="jukebox:queue"]').click();
  await expect(page.locator('#club-panel-subtitle')).toHaveText('1 TRACK · PAGE 1 OF 1');
  await page.screenshot({ path: '.impeccable/review/club-jukebox-queue.png', fullPage: true });
  await expect.poll(() => page.locator('#club-jukebox-audio').evaluate((audio) => Number.isFinite(audio.duration))).toBe(true);
  await page.locator('#club-jukebox-audio').evaluate((audio) => { audio.currentTime = audio.duration - .08; });
  await expect.poll(() => page.evaluate(() => clubModel.jukebox.track.file)).toBe('michel-krapf-still-licensed.mp3');
  await expect.poll(() => page.locator('#club-jukebox-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
  expect(await page.evaluate(() => clubModel.jukebox.queue)).toEqual([]);
  await page.getByRole('button', { name: 'Play MP3 song', exact: true }).click();
  await expect.poll(() => page.locator('#song-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
  expect(await page.locator('#club-jukebox-audio').evaluate((audio) => audio.paused)).toBe(true);
  await page.getByRole('button', { name: 'RESUME MUSIC', exact: true }).click();
  await expect.poll(() => page.locator('#song-audio').evaluate((audio) => audio.paused)).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  expect(await page.locator('#club-jukebox-audio').evaluate((audio) => audio.paused)).toBe(true);
  expect(errors).toEqual([]);
});

async function cinemaFixture(page) {
  await page.route('https://www.youtube.com/embed/Bic2KjFFj6w?*', (route) => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html lang="en"><title>YouTube host test fixture</title><body style="background:#16161e;color:#c0caf5;font:18px monospace;padding:32px"><h1>YouTube host test fixture</h1><p>This fixture verifies the browser player frame and room controls.</p><button>Player control fixture</button></body></html>',
  }));
}

test('mobile jukebox controls and the cinema support focus, retry, and return', async ({ browser }) => {
  test.setTimeout(75_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(); await cinemaFixture(page);
  const requests = []; page.on('request', (request) => requests.push(request.url()));
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  expect(requests.some((url) => url.includes('youtube.com'))).toBe(false);
  await page.locator('#club-explore').tap();
  await approach(page, 'jukebox'); await page.locator('#club-touch-use').tap();
  await page.screenshot({ path: '.impeccable/review/club-jukebox-mobile.png', fullPage: true });
  await page.locator('[data-action="jukebox:pick:0"]').tap();
  await page.getByRole('button', { name: 'ADD TO QUEUE', exact: true }).tap();
  await page.getByRole('button', { name: 'BACK TO THE ROOM', exact: true }).tap();
  await approach(page, 'omacon-crt'); await page.locator('#club-touch-use').tap();
  await page.getByRole('button', { name: 'WATCH OMACON 2026', exact: true }).tap();
  await expect(page.getByRole('dialog', { name: 'OMACON 2026', exact: true })).toBeVisible();
  await expect(page.locator('#club-video-player')).toHaveAttribute('src', /youtube\.com\/embed\/Bic2KjFFj6w/);
  await page.frameLocator('#club-video-player').getByRole('button').click();
  await page.screenshot({ path: '.impeccable/review/club-cinema-mobile-fixture.png', fullPage: true });
  const oldFrame = await page.locator('#club-video-player').elementHandle();
  await page.getByRole('button', { name: 'RETRY PLAYER', exact: true }).tap();
  expect(await oldFrame.evaluate((frame) => frame.isConnected)).toBe(false);
  await expect(page.getByRole('link', { name: 'OPEN ON YOUTUBE' })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=Bic2KjFFj6w');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'BACK TO THE ROOM', exact: true }).tap();
  await expect(page.locator('#club-video-player')).toHaveCount(0);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await expect(page.locator('#club-canvas')).toBeFocused();
  expect(errors).toEqual([]); await context.close();
});

test('the headset selects jukebox tracks and exits XR before the official video frame opens', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 1000 }); await emulate(page); await cinemaFixture(page);
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-enter-vr')).toBeEnabled(); await observe(page);
  await page.locator('#club-enter-vr').click(); await xrClick(page, 'explore');
  await approach(page, 'jukebox');
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('a-button', 1));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'device');
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('a-button', 0));
  await page.screenshot({ path: '.impeccable/review/club-headset-jukebox.png', fullPage: true });
  expect(await page.evaluate(() => clubView.panel.buttons.every((button) => button.y >= 0 && button.y + button.height <= 640))).toBe(true);
  await xrClick(page, 'jukebox:pick:0'); await xrClick(page, 'jukebox:play:0');
  await expect.poll(() => page.locator('#club-jukebox-audio').evaluate((audio) => audio.currentTime)).toBeGreaterThan(.1);
  await xrClick(page, 'back');
  await approach(page, 'omacon-crt');
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('a-button', 1));
  await expect(page.locator('#club-panel-title')).toHaveText('THE CLUB CINEMA');
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('a-button', 0));
  await page.screenshot({ path: '.impeccable/review/club-headset-cinema.png', fullPage: true });
  await xrClick(page, 'video');
  await expect(page.locator('body')).toHaveAttribute('data-xr', 'ready');
  await expect(page.locator('#club-video')).toBeVisible();
  expect(await page.evaluate(() => Boolean(xrDevice.activeSession))).toBe(false);
  expect(await page.locator('#club-jukebox-audio').evaluate((audio) => audio.paused)).toBe(true);
  await page.screenshot({ path: '.impeccable/review/club-cinema-desktop-fixture.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.locator('#club-video-player')).toHaveCount(0);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  expect(errors).toEqual([]);
});

test('the Malibu corner has a reachable desk, live display, and motion-aware coastal view', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  await page.evaluate(() => clubView.room.galleryReady);
  expect(await page.evaluate(() => clubView.room.galleryLoaded)).toBe(65);
  await page.locator('#club-explore').click(); await page.locator('#club-map').click();
  await page.getByRole('button', { name: 'MALIBU CORNER', exact: true }).click();
  await expect(page.locator('#club-location')).toHaveText('MALIBU CORNER');
  await page.evaluate(() => { if (!clubView.teleport({ x: 13.9, z: -8.8 }, -.55)) throw new Error('The overview is blocked.'); clubView.pitch = -.18; });
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.impeccable/review/club-malibu-desktop.png', fullPage: true });
  await approach(page, 'malibu-desk'); await page.keyboard.press('KeyE');
  await expect(page.locator('#club-panel-title')).toHaveText('THE MALIBU DESK');
  await expect(page.locator('#club-panel-subtitle')).toHaveText('POWER OFF');
  await page.getByRole('button', { name: 'DESKTOP DEMO', exact: true }).click();
  await expect.poll(() => page.evaluate(() => clubModel.devices['malibu-desk'].mode)).toBe('coastal-desktop');
  await page.screenshot({ path: '.impeccable/review/club-malibu-display.png', fullPage: true });
  await page.keyboard.press('KeyE'); await page.getByRole('button', { name: 'COASTAL WALLPAPER', exact: true }).click();
  expect(await page.evaluate(() => clubView.room.malibu.water.uniforms.time.value)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => page.evaluate(() => clubView.room.malibu.water.uniforms.time.value)).toBeGreaterThan(0);
  await page.keyboard.press('KeyP');
  const time = await page.evaluate(() => clubView.room.malibu.water.uniforms.time.value);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => clubView.room.malibu.water.uniforms.time.value)).toBe(time);
  expect(errors).toEqual([]);
});

test('the Malibu desk and map remain usable on a narrow touch display', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/club.html'); await expect(page.locator('#club-explore')).toBeEnabled(); await observe(page);
  await page.locator('#club-explore').tap(); await page.locator('#club-touch-map').tap();
  await page.getByRole('button', { name: 'MALIBU CORNER', exact: true }).tap();
  await expect(page.locator('#club-location')).toHaveText('MALIBU CORNER');
  await page.evaluate(() => { if (!clubView.teleport({ x: 13.45, z: -7.7 }, -.51)) throw new Error('The overview is blocked.'); clubView.pitch = -.15; });
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.impeccable/review/club-malibu-mobile.png', fullPage: true });
  await approach(page, 'malibu-desk'); await page.locator('#club-touch-use').tap();
  await expect(page.locator('#club-panel-title')).toHaveText('THE MALIBU DESK');
  await page.getByRole('button', { name: 'DESKTOP DEMO', exact: true }).tap();
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('the headset reaches the Malibu corner and operates its monitor through spatial controls', async ({ page }) => {
  test.setTimeout(65_000);
  await page.setViewportSize({ width: 1440, height: 1000 }); await emulate(page);
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/club.html'); await expect(page.locator('#club-enter-vr')).toBeEnabled(); await observe(page);
  await page.locator('#club-enter-vr').click(); await xrClick(page, 'explore');
  await page.evaluate(() => xrDevice.controllers.left.updateButtonValue('y-button', 1));
  await expect(page.locator('body')).toHaveAttribute('data-state', 'map');
  await page.evaluate(() => xrDevice.controllers.left.updateButtonValue('y-button', 0));
  expect(await page.evaluate(() => clubView.panel.buttons.every((button) => button.y + button.height <= 640))).toBe(true);
  await xrClick(page, 'zone:malibu');
  await expect(page.locator('#club-location')).toHaveText('MALIBU CORNER');
  await page.evaluate(() => {
    clubView.teleport({ x: 13.2, z: -8 }, -.59); xrDevice.quaternion.set(0, 0, 0, 1);
    for (const controller of Object.values(xrDevice.controllers)) controller.quaternion.set(Math.SQRT1_2, 0, 0, Math.SQRT1_2);
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: '.impeccable/review/club-malibu-headset.png', fullPage: true });
  await approach(page, 'malibu-desk');
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('a-button', 1));
  await expect(page.locator('#club-panel-title')).toHaveText('THE MALIBU DESK');
  await page.evaluate(() => xrDevice.controllers.right.updateButtonValue('a-button', 0));
  await xrClick(page, 'mode:coastal-desktop');
  await expect.poll(() => page.evaluate(() => clubModel.devices['malibu-desk'].power)).toBe(true);
  await expect(page.locator('body')).toHaveAttribute('data-state', 'explore');
  await page.evaluate(() => xrDevice.activeSession.end());
  expect(errors).toEqual([]);
});
