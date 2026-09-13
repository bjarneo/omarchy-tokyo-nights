import test from 'node:test';
import assert from 'node:assert/strict';
import { VRInput, deadZone, pulseControllers } from '../src/vr-controls.mjs';
import { VRSession } from '../src/vr-session.mjs';
import { seatOffset, trafficPosition, SEAT_HEIGHT, advanceVRSimulation } from '../src/vr-world.mjs';
import { GameEngine } from '../src/engine.mjs';
import { createStaticServer } from '../tools/server.mjs';

function controller(handedness) {
  return { handedness, gamepad: { mapping: 'xr-standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 6 }, () => ({ value: 0 })) } };
}

test('VR simulation keeps real-time progress across different render rates', () => {
  const smooth = new GameEngine({ random: () => .5 });
  const delayed = new GameEngine({ random: () => .5 });
  smooth.start(); delayed.start();
  for (let i = 0; i < 420; i++) advanceVRSimulation(smooth, 1 / 60);
  for (let i = 0; i < 35; i++) advanceVRSimulation(delayed, .2);
  assert.equal(delayed.state, 'playing');
  assert.ok(Math.abs(smooth.time - delayed.time) < .001);
  assert.ok(Math.abs(smooth.distance - delayed.distance) < .001);
  const before = delayed.distance;
  delayed.pause();
  advanceVRSimulation(delayed, 20);
  assert.equal(delayed.distance, before);
});

test('XR input maps analog steering, triggers, and nitro and clears disconnected controls', () => {
  const input = new VRInput();
  const left = controller('left');
  const right = controller('right');
  left.gamepad.axes[2] = -.58;
  right.gamepad.buttons[0].value = .8;
  right.gamepad.buttons[4].value = 1;
  const sample = input.sample([right, left]);
  assert.ok(Math.abs(sample.left - .5) < 1e-10);
  assert.equal(sample.right, 0);
  assert.equal(sample.gas, true);
  assert.equal(sample.brake, false);
  assert.equal(sample.nitro, true);
  left.gamepad.buttons[0].value = 1;
  assert.equal(input.sample([left, right]).brake, true);
  const released = input.sample([]);
  assert.equal(released.left, 0);
  assert.equal(released.nitro, false);
  assert.equal(released.gas, false);
  assert.equal(deadZone(.1), 0);
  assert.equal(deadZone(NaN), 0);
  assert.equal(deadZone(Infinity), 0);
});

test('menu controls trigger only once per press', () => {
  const input = new VRInput();
  const right = controller('right');
  right.gamepad.buttons[5].value = 1;
  assert.equal(input.sample([right]).actions.pause, true);
  assert.equal(input.sample([right]).actions.pause, false);
  right.gamepad.buttons[5].value = 0;
  input.sample([right]);
  right.gamepad.buttons[5].value = 1;
  assert.equal(input.sample([right]).actions.pause, true);
});

test('grip steering calibrates a neutral angle and resets after release', () => {
  const input = new VRInput();
  const left = controller('left');
  const right = controller('right');
  left.gamepad.buttons[1].value = right.gamepad.buttons[1].value = 1;
  const poses = { left: { x: -.2, y: .8 }, right: { x: .2, y: .8 } };
  assert.equal(input.sample([left, right], { mode: 'wheel', poses }).left, 0);
  poses.right.y = 1.1;
  assert.ok(input.sample([left, right], { mode: 'wheel', poses }).left > .9);
  input.sample([], { mode: 'wheel', poses: {} });
  assert.equal(input.sample([left, right], { mode: 'wheel', poses }).left, 0);
  right.gamepad.buttons[1].value = 0;
  assert.equal(input.sample([left, right], { mode: 'wheel', poses }).left, 0);
});

test('a standard gamepad supports the same race actions', () => {
  const pad = { connected: true, mapping: 'standard', axes: [.58, 0], buttons: Array.from({ length: 10 }, () => ({ value: 0 })) };
  pad.buttons[0].value = pad.buttons[7].value = 1;
  const sample = new VRInput().sample([], { gamepads: [null, pad] });
  assert.ok(Math.abs(sample.right - .5) < 1e-10);
  assert.equal(sample.nitro, true);
  assert.equal(sample.gas, true);
  assert.equal(sample.actions.confirm, true);
});

test('seat calibration preserves physical scale and removes yaw without artificial pitch', () => {
  const yaw = .7;
  const offset = seatOffset({ x: .4, y: 1.65, z: -.3 }, { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) });
  assert.equal(offset.position.x, .4);
  assert.equal(offset.position.y, 1.65 - SEAT_HEIGHT);
  assert.ok(Math.abs(offset.orientation.y - Math.sin(yaw / 2)) < 1e-10);
  assert.equal(offset.orientation.x, 0);
  assert.equal(offset.orientation.z, 0);
  assert.deepEqual(trafficPosition({ distance: 2000 }, { x: .65, z: 2000 }), { x: 3.25, y: .5, z: -0 });
});

class Session extends EventTarget {
  visibilityState = 'visible';
  ends = 0;
  async end() { this.ends++; this.dispatchEvent(new Event('end')); }
}

function runtime({ request, setup, secure = true, supported = true } = {}) {
  const statuses = [];
  const events = [];
  const session = new Session();
  const xr = new EventTarget();
  xr.isSessionSupported = async () => supported;
  xr.requestSession = request || (async () => session);
  const renderer = { xr: {
    setReferenceSpaceType() {}, setFramebufferScaleFactor() {}, setFoveation() {},
    setSession: setup || (async () => {}),
  } };
  const vr = new VRSession({ renderer, xr, secure, onStatus: (status) => statuses.push(status), onStart: () => events.push('start'), onEnd: () => events.push('end'), onVisibility: (state) => events.push(state) });
  return { vr, session, statuses, events };
}

test('WebXR requests start synchronously, reject duplicate entry, and clean up visibility listeners', async () => {
  let resolve;
  let calls = 0;
  const session = new Session();
  const { vr, events } = runtime({ request: (mode, options) => {
    calls++;
    assert.equal(mode, 'immersive-vr');
    assert.equal(options.requiredFeatures, undefined);
    return new Promise((done) => { resolve = done; });
  } });
  await vr.check();
  const entering = vr.enter();
  assert.equal(calls, 1);
  assert.equal(await vr.enter(), false);
  resolve(session);
  assert.equal(await entering, true);
  session.visibilityState = 'visible-blurred';
  session.dispatchEvent(new Event('visibilitychange'));
  await vr.exit();
  session.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(events, ['start', 'visible-blurred', 'end']);
  assert.equal(vr.session, null);
  assert.equal(vr.pending, false);
});

test('permission rejection leaves entry available for a later retry', async () => {
  let denied = true;
  const session = new Session();
  const { vr, statuses } = runtime({ request: async () => {
    if (denied) throw Object.assign(new Error('Denied.'), { name: 'NotAllowedError' });
    return session;
  } });
  await vr.check();
  assert.equal(await vr.enter(), false);
  assert.equal(vr.pending, false);
  assert.match(statuses.at(-1).message, /denied/);
  denied = false;
  assert.equal(await vr.enter(), true);
  await vr.exit();
});

test('renderer setup failure ends the allocated session and restores the prior state', async () => {
  const { vr, session, events } = runtime({ setup: async () => { throw new Error('WebGL failed.'); } });
  await vr.check();
  assert.equal(await vr.enter(), false);
  assert.equal(session.ends, 1);
  assert.equal(vr.session, null);
  assert.equal(vr.pending, false);
  assert.deepEqual(events, ['end']);
});

test('unavailable and insecure browsers do not request a session', async () => {
  for (const config of [{ secure: false }, { supported: false }]) {
    const { vr, statuses } = runtime({ ...config, request: () => { assert.fail('Unexpected XR request.'); } });
    assert.equal(await vr.check(), false);
    assert.equal(await vr.enter(), false);
    assert.equal(statuses.at(-1).state, 'unavailable');
  }
});

test('page disposal ends a session that arrives after its permission request', async () => {
  let resolve;
  const session = new Session();
  const { vr, events } = runtime({ request: () => new Promise((done) => { resolve = done; }) });
  await vr.check();
  const pending = vr.enter();
  vr.dispose();
  resolve(session);
  assert.equal(await pending, false);
  assert.equal(session.ends, 1);
  assert.equal(vr.session, null);
  assert.deepEqual(events, []);
});

test('unsupported haptics do not interrupt the race', async () => {
  pulseControllers([{ gamepad: {} }, { gamepad: { hapticActuators: [{ pulse: () => Promise.reject(new Error('Disconnected.')) }] } }], .5, 50);
  await new Promise((resolve) => setTimeout(resolve, 0));
});

test('the static server serves the self-contained VR route and keeps development files private', async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/vr.html', '/vr.css', '/src/vr-main.js', '/assets/three.module.js', '/assets/three.core.js']) {
      assert.equal((await fetch(`${url}${path}`, { method: 'HEAD' })).status, 200, path);
    }
    assert.equal((await fetch(`${url}/node_modules/iwer/build/iwer.js`)).status, 404);
    assert.equal((await fetch(`${url}/.impeccable/surfaces/vr-html.md`)).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
