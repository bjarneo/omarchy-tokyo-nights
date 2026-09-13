import test from 'node:test';
import assert from 'node:assert/strict';
import { CLUB, ENTRY, STATIONS, CLUB_CREW, ZONES, OBSTACLES } from '../src/club-data.mjs';
import { ClubGame, canStand, moveWithinRoom, teleportArc } from '../src/club-engine.mjs';
import { ClubInput } from '../src/club-controls.mjs';
import { CabinetGame } from '../src/club-games.mjs';
import { gestureAt } from '../src/club-motion.mjs';

test('every character and machine has an accessible interaction point from the entrance', () => {
  const queue = [{ x: 0, z: 10.5 }]; const seen = new Set(['0,10.5']);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    for (const [dx, dz] of [[.5, 0], [-.5, 0], [0, .5], [0, -.5]]) {
      const x = current.x + dx; const z = current.z + dz; const key = `${x},${z}`;
      if (seen.has(key) || !canStand(x, z)) continue;
      const moved = moveWithinRoom(current, dx, dz);
      if (Math.abs(moved.x - x) > .001 || Math.abs(moved.z - z) > .001) continue;
      seen.add(key); queue.push({ x, z });
    }
  }
  assert.ok(queue.length > 1800);
  const game = new ClubGame();
  for (const target of [...STATIONS, ...CLUB_CREW]) {
    const reachable = queue.some((position) => {
      const distance = Math.hypot(position.x - target.x, position.z - target.z);
      if (distance > 2.8 || distance < 1.4) return false;
      game.state = 'explore';
      return game.interact(target.id, position);
    });
    assert.ok(reachable, `${target.name} has no reachable interaction point.`);
  }
  for (const zone of ZONES) assert.ok(canStand(zone.beacon.x, zone.beacon.z), zone.id);
  for (const station of STATIONS) assert.ok(canStand(station.stand.x, station.stand.z), station.id);
});

test('movement stops at walls and slides around obstacles without tunneling', () => {
  const wall = [{ x: 2, z: 0, width: .2, depth: 3, height: 3 }];
  const blocked = moveWithinRoom({ x: 0, z: 0 }, 5, 0, wall);
  assert.ok(blocked.x <= 1.60001);
  const slide = moveWithinRoom({ x: 0, z: 0 }, 5, 5, wall);
  assert.ok(slide.z > 4.9);
  assert.ok(canStand(slide.x, slide.z, wall));
  assert.equal(canStand(40, 0), false);
  assert.equal(canStand(NaN, 0), false);
});

test('teleportation lands on clear floor and rejects obstructions', () => {
  const origin = { x: ENTRY.x, y: 1.3, z: ENTRY.z };
  const direction = { x: 0, y: -.2, z: -Math.sqrt(.96) };
  const clear = teleportArc(origin, direction);
  assert.equal(clear.valid, true);
  assert.ok(clear.point.z < ENTRY.z - 1);
  assert.ok(canStand(clear.point.x, clear.point.z));
  const blocked = teleportArc(origin, direction, [{ x: 0, z: 9.7, width: 4, depth: .2, height: 4.6 }]);
  assert.equal(blocked.valid, false);
  assert.ok(blocked.point.z > clear.point.z);
});

test('interaction requires proximity and a clear line of sight', () => {
  const game = new ClubGame(); game.enter();
  assert.equal(game.interact('amiga500', ENTRY), false);
  const amiga = STATIONS.find((station) => station.id === 'amiga500');
  assert.equal(game.interact(amiga.id, amiga.stand), true);
  assert.equal(game.state, 'device');
  game.action('mode:boing');
  assert.equal(game.devices.amiga500.mode, 'boing');
  assert.equal(game.state, 'explore');
  assert.equal(game.interact('__proto__', ENTRY), false);
});

test('each cameo has a complete branching conversation', () => {
  const game = new ClubGame();
  for (const npc of CLUB_CREW) {
    game.state = 'explore';
    assert.ok(game.interact(npc.id, { x: npc.x, z: npc.z + .9 }));
    assert.equal(game.panel().portrait, npc.id);
    for (let i = 0; i < npc.topics.length; i++) {
      game.action(`topic:${i}`);
      assert.equal(game.reply, npc.topics[i][1]);
    }
    game.back(); assert.equal(game.state, 'explore');
  }
});

test('free exploration exposes hardware controls without a main objective', () => {
  const game = new ClubGame(); game.enter();
  const pc = STATIONS.find((station) => station.id === 'ibm-xt');
  assert.ok(game.interact(pc.id, pc.stand));
  game.action('mode:dial');
  assert.equal(game.devices[pc.id].online, true);
  game.action('power');
  assert.equal(game.devices[pc.id].power, false);
  game.action('mode:messages');
  assert.equal(game.devices[pc.id].power, true);
  assert.equal(game.devices[pc.id].mode, 'messages');
});

test('pause preserves the current conversation or game', () => {
  const game = new ClubGame(); game.enter();
  const station = STATIONS.find((item) => item.id === 'nes');
  game.interact(station.id, station.stand); game.action('game:star'); game.action('start-game');
  game.update(.2, { fire: true });
  const elapsed = game.arcade.elapsed;
  game.pause(); game.update(5, { fire: true });
  assert.equal(game.arcade.elapsed, elapsed);
  game.resume(); assert.equal(game.state, 'arcade');
  game.update(.1, { fire: true }); assert.ok(game.arcade.elapsed > elapsed);
});

test('invalid stored scores fall back to zero', () => {
  assert.doesNotThrow(() => new ClubGame({ best: null }));
  assert.deepEqual(new ClubGame({ best: { star: Infinity, brick: -100, snake: 'wrong' } }).best, { star: 0, brick: 0, snake: 0 });
});

test('snap turns trigger once until the stick returns to neutral', () => {
  const left = { handedness: 'left', gamepad: { mapping: 'xr-standard', axes: [0, 0, .58, -.58], buttons: [] } };
  const right = { handedness: 'right', gamepad: { mapping: 'xr-standard', axes: [0, 0, 1, 0], buttons: [] } };
  const input = new ClubInput();
  const first = input.sample([left, right]);
  assert.ok(Math.abs(first.x - .5) < .0001); assert.ok(Math.abs(first.z + .5) < .0001);
  assert.equal(first.actions.rightTurn, true);
  assert.equal(input.sample([left, right]).actions.rightTurn, false);
  right.gamepad.axes[2] = 0; input.sample([left, right]); right.gamepad.axes[2] = 1;
  assert.equal(input.sample([left, right]).actions.rightTurn, true);
});

test('held face buttons do not resume activity after focus recovery', () => {
  const right = { handedness: 'right', gamepad: { mapping: 'xr-standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 6 }, () => ({ value: 0 })) } };
  const input = new ClubInput(); input.reset(true);
  right.gamepad.buttons[5].value = 1;
  assert.equal(input.sample([right]).actions.back, false);
  assert.equal(input.sample([right]).actions.back, false);
  right.gamepad.buttons[5].value = 0; input.sample([right]);
  right.gamepad.buttons[5].value = 1;
  assert.equal(input.sample([right]).actions.back, true);
});

test('Star Patrol scores hits and ends a cleared round', () => {
  const game = new CabinetGame('star'); game.start();
  game.targets.forEach((target) => { target.active = false; });
  game.targets[0] = { x: .5, y: .8, active: true };
  game.update(.1, { fire: true });
  assert.equal(game.score, 100); assert.equal(game.state, 'won');
  game.update(.1, { fire: true }); assert.equal(game.score, 100);
});

test('Brick Break uses paddle position and ends after three misses', () => {
  const game = new CabinetGame('brick'); game.start();
  game.ball = { x: .58, y: .83, vx: 0, vy: .48 };
  game.update(.05, { x: 0 });
  assert.ok(game.ball.vy < 0); assert.ok(game.ball.vx > 0);
  for (let i = 0; i < 3; i++) { game.ball.y = 1.1; game.update(.02); }
  assert.equal(game.lives, 0); assert.equal(game.state, 'over');
});

test('Snake eats food, rejects reverse input, and ends at a wall', () => {
  const game = new CabinetGame('snake', () => .5); game.start();
  game.food = { x: 8, y: 6 }; game.turn(-1, 0); game.update(.16);
  assert.equal(game.snake[0].x, 8); assert.equal(game.score, 10); assert.equal(game.snake.length, 4);
  for (let i = 0; i < 15; i++) game.update(.16);
  assert.equal(game.state, 'over');
});

test('the crew takes short walks without entering obstacles or reserved approach points', () => {
  const game = new ClubGame(); game.enter();
  for (let i = 0; i < 1200; i++) {
    game.update(.05);
    for (const npc of game.crew) {
      assert.ok(Math.hypot(npc.x - npc.homeX, npc.z - npc.homeZ) <= .86, npc.id);
      assert.ok(canStand(npc.x, npc.z, npc.avoid, CLUB.crewRadius), npc.id);
    }
  }
  assert.ok(game.crew.filter((npc) => npc.travel > .25).length >= 7);
  for (const point of game.clearSpaces) assert.ok(canStand(point.x, point.z, game.obstacles));
});

test('characters stop nearby and remain still through dialogue and pause', () => {
  const game = new ClubGame(); game.enter();
  for (let i = 0; i < 120; i++) game.update(.05);
  const npc = game.crew[0];
  game.position = { x: npc.x, z: npc.z + 1.5 };
  const position = { x: npc.x, z: npc.z };
  for (let i = 0; i < 60; i++) game.update(.05);
  assert.deepEqual({ x: npc.x, z: npc.z }, position);
  assert.ok(game.interact(npc.id));
  for (let i = 0; i < 40; i++) game.update(.05);
  assert.deepEqual({ x: npc.x, z: npc.z }, position);
  assert.ok(npc.gestureBlend < .01);
  game.pause();
  const frozen = game.crew.map(({ x, z, clock, gait }) => ({ x, z, clock, gait }));
  game.update(10);
  assert.deepEqual(game.crew.map(({ x, z, clock, gait }) => ({ x, z, clock, gait })), frozen);
});

test('reduced motion stops autonomous walks and gestures', () => {
  const game = new ClubGame(); game.enter();
  const positions = game.crew.map(({ x, z, clock }) => ({ x, z, clock }));
  for (let i = 0; i < 200; i++) game.update(.1, { reducedMotion: true });
  assert.deepEqual(game.crew.map(({ x, z, clock }) => ({ x, z, clock })), positions);
  assert.ok(game.crew.every((npc) => npc.walkBlend === 0 && npc.gestureBlend === 0));
});

test('roaming characters retain their live interaction and collision positions', () => {
  const game = new ClubGame(); game.enter();
  for (let i = 0; i < 150; i++) game.update(.05);
  const npc = game.crew.find((item) => Math.hypot(item.x - item.homeX, item.z - item.homeZ) > .2);
  assert.ok(npc);
  assert.equal(canStand(npc.x, npc.z, game.obstacles), false);
  assert.equal(game.obstacles.find((box) => box.id === npc.id).x, npc.x);
  assert.ok(game.interact(npc.id, { x: npc.x, z: npc.z + 1 }));
  assert.equal(game.selected, npc);
});

test('the coffee gesture raises, holds, and lowers the cup', () => {
  assert.equal(gestureAt('coffee', 0).amount, 0);
  assert.ok(gestureAt('coffee', 1.8).amount > 0);
  assert.equal(gestureAt('coffee', 3).amount, 1);
  assert.equal(gestureAt('coffee', 7).amount, 0);
  assert.equal(gestureAt('coffee', 14).amount, 0);
});

test('the Malibu map destination and display work while the glazed walls remain solid', () => {
  const game = new ClubGame(); game.enter();
  const desk = STATIONS.find((station) => station.id === 'malibu-desk');
  assert.equal(game.devices[desk.id].power, false);
  game.action('zone:malibu');
  assert.equal(game.zone.id, 'malibu');
  assert.ok(canStand(game.position.x, game.position.z, game.obstacles));
  assert.ok(game.interact(desk.id, desk.stand));
  assert.equal(game.panel().title, 'THE MALIBU DESK');
  game.action('mode:coastal-desktop');
  assert.equal(game.devices[desk.id].power, true);
  assert.equal(game.devices[desk.id].mode, 'coastal-desktop');
  game.action('mode:coastal-view');
  assert.equal(game.devices[desk.id].mode, 'coastal-view');
  game.action('power'); assert.equal(game.devices[desk.id].power, false);
  assert.equal(game.interact(desk.id, { x: 18.3, z: -11.65 }), false);
  assert.equal(teleportArc({ x: 17.3, y: 1.4, z: -12.7 }, { x: 1, y: -.1, z: 0 }, game.obstacles).valid, false);
  assert.equal(teleportArc({ x: 16.8, y: 1.4, z: -13.1 }, { x: 0, y: -.1, z: -1 }, game.obstacles).valid, false);
});
