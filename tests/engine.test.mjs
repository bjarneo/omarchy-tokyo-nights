import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, CRUISE_SPEED, MAX_SPEED, BOOST_SPEED, CHECKPOINT_LENGTH, CAMEO_COOLDOWN, cameoPose } from '../src/engine.mjs';

function advance(game, seconds) {
  for (let remaining = seconds; remaining > 0.00001; remaining -= 1 / 60) {
    game.update(Math.min(1 / 60, remaining));
  }
}

function playing() {
  const events = [];
  const game = new GameEngine({ random: () => 0.5, onEvent: (event) => events.push(event) });
  game.start();
  advance(game, 3.5);
  game.traffic = [];
  game.spawnTimer = 10000;
  return { game, events };
}

test('the countdown starts a new race without consuming race time', () => {
  const game = new GameEngine();
  game.start();
  advance(game, 3);
  assert.equal(game.state, 'countdown');
  assert.equal(game.time, 60);
  advance(game, .5);
  assert.equal(game.state, 'playing');
  assert.ok(game.time > 59.8);
});

test('auto-cruise and the accelerator have distinct speed limits', () => {
  const { game } = playing();
  advance(game, 3);
  assert.equal(Math.round(game.speed), CRUISE_SPEED);
  game.input.gas = true;
  advance(game, 2);
  assert.equal(game.speed, MAX_SPEED);
  game.input.brake = true;
  advance(game, 2);
  assert.equal(game.speed, 55);
});

test('nitro increases speed, depletes, and recharges without an empty-tank loop', () => {
  const { game } = playing();
  game.speed = CRUISE_SPEED;
  game.input.nitro = true;
  advance(game, 2);
  assert.equal(game.speed, BOOST_SPEED);
  assert.ok(game.nitro < 51);
  advance(game, 2.1);
  assert.equal(game.boostLocked, true);
  assert.equal(game.boosting, false);
  const emptyCharge = game.nitro;
  advance(game, 1);
  assert.ok(game.nitro > emptyCharge);
  assert.equal(game.boosting, false);
  game.input.nitro = false;
  advance(game, 1);
  assert.equal(game.boostLocked, false);
});

test('steering remains bounded and the shoulder reduces speed', () => {
  const { game } = playing();
  game.speed = 210;
  game.input.right = true;
  advance(game, 3);
  assert.equal(game.playerX, 1.42);
  assert.ok(game.speed <= 105);
  game.input.right = false;
  game.input.left = true;
  advance(game, 5);
  assert.equal(game.playerX, -1.42);
});

test('a collision applies its penalty once and grants temporary protection', () => {
  const { game, events } = playing();
  game.speed = 210;
  game.playerX = 0;
  game.traffic = [{ id: 1, x: 0, z: game.distance + 7, speed: 80, resolved: false }];
  const time = game.time;
  advance(game, .05);
  assert.equal(game.collisions, 1);
  assert.ok(game.speed < 100);
  assert.ok(game.time < time - 3);
  assert.ok(game.invincible > 1);
  advance(game, .5);
  assert.equal(game.collisions, 1);
  assert.equal(events.filter((event) => event.type === 'collision').length, 1);
});

test('a close pass awards its bonus and nitro exactly once', () => {
  const { game, events } = playing();
  game.speed = 210;
  game.nitro = 40;
  game.playerX = .33;
  game.traffic = [{ id: 1, x: 0, z: game.distance - 7.9, speed: 80, resolved: false }];
  const score = game.score;
  advance(game, .05);
  assert.equal(game.nearMisses, 1);
  assert.equal(game.passed, 1);
  assert.ok(game.score >= score + 450);
  assert.ok(game.nitro > 52);
  advance(game, 1);
  assert.equal(game.passed, 1);
  assert.equal(events.filter((event) => event.type === 'near-miss').length, 1);
});

test('a checkpoint extends the race and advances the district', () => {
  const { game, events } = playing();
  game.cassette = true;
  game.distance = CHECKPOINT_LENGTH - .1;
  game.speed = 210;
  const time = game.time;
  advance(game, .05);
  assert.equal(game.stage, 1);
  assert.equal(game.nextCheckpoint, CHECKPOINT_LENGTH * 2);
  assert.ok(game.time > time + 34);
  assert.ok(game.score >= 2500);
  assert.equal(events.filter((event) => event.type === 'checkpoint').length, 1);
});

test('pause freezes the timer, traffic, distance, and countdown', () => {
  const { game } = playing();
  game.input.left = true;
  game.pause();
  const time = game.time;
  const distance = game.distance;
  advance(game, 10);
  assert.equal(game.time, time);
  assert.equal(game.distance, distance);
  assert.equal(game.input.left, false);
  game.resume();
  advance(game, 1);
  assert.ok(game.time < time);
  game.start();
  game.pause();
  advance(game, 5);
  assert.equal(game.countdown, 3.4);
  game.resume();
  assert.equal(game.state, 'countdown');
});

test('time expiry ends the run once and restart clears all race state', () => {
  const { game, events } = playing();
  game.time = .025;
  game.speed = 210;
  game.input.nitro = true;
  advance(game, 1);
  assert.equal(game.state, 'gameover');
  assert.equal(game.time, 0);
  assert.equal(game.boosting, false);
  assert.equal(events.filter((event) => event.type === 'gameover').length, 1);
  game.start();
  assert.equal(game.distance, 0);
  assert.equal(game.speed, 0);
  assert.equal(game.score, 0);
  assert.equal(game.time, 60);
  assert.equal(game.nitro, 100);
  assert.equal(game.traffic.length, 0);
});

test('traffic generation stays bounded during a long run', () => {
  const game = new GameEngine({ random: () => .5 });
  game.start();
  game.time = 1000;
  advance(game, 180);
  assert.ok(game.traffic.length <= 20);
  assert.ok(game.traffic.every((car) => car.z >= game.distance - 60));
});

test('the first boost introduces DHH and the next boost respects the cameo cooldown', () => {
  const { game, events } = playing();
  game.speed = CRUISE_SPEED;
  game.input.nitro = true;
  advance(game, .2);
  assert.equal(cameoPose(game.cameoTime).facing, 'back');
  assert.ok(cameoPose(game.cameoTime).lift > 0);
  advance(game, .5);
  assert.equal(cameoPose(game.cameoTime).facing, 'profile');
  advance(game, .5);
  assert.equal(cameoPose(game.cameoTime).facing, 'smile');
  assert.equal(cameoPose(game.cameoTime).greeting, true);
  advance(game, 1);
  assert.ok(cameoPose(game.cameoTime).lift < 1);
  advance(game, .6);
  assert.equal(game.cameoTime, -1);
  assert.equal(events.filter((event) => event.type === 'cameo').length, 1);
  assert.equal(game.boosting, true);
  game.input.nitro = false;
  advance(game, .2);
  game.input.nitro = true;
  advance(game, .2);
  assert.equal(events.filter((event) => event.type === 'cameo').length, 1);
  assert.equal(game.cameoTime, -1);
});

test('the DHH cameo returns early after boost release and respects reduced motion', () => {
  const { game } = playing();
  game.speed = CRUISE_SPEED;
  game.input.nitro = true;
  advance(game, .8);
  game.input.nitro = false;
  advance(game, .1);
  assert.ok(game.cameoTime > 1.85);
  advance(game, .8);
  assert.equal(game.cameoTime, -1);
  assert.equal(cameoPose(1, true).wave, 0);
  assert.equal(cameoPose(1, true).facing, 'smile');
  assert.equal(cameoPose(-1), null);
});

test('character selection holds the race until the player confirms a driver', () => {
  const game = new GameEngine();
  game.chooseDriver();
  advance(game, 20);
  assert.equal(game.state, 'select');
  assert.equal(game.time, 60);
  assert.equal(game.distance, 0);
  game.cancelSelection();
  assert.equal(game.state, 'title');
  game.chooseDriver();
  game.start('ryan');
  assert.equal(game.characterId, 'ryan');
  assert.equal(game.state, 'countdown');
  advance(game, 3.5);
  assert.equal(game.state, 'playing');
});

test('cancel from the selector preserves the active driver and paused race', () => {
  const { game } = playing();
  advance(game, 3);
  game.pause();
  const state = { characterId: game.characterId, distance: game.distance, time: game.time, score: game.score };
  game.chooseDriver();
  advance(game, 10);
  game.cancelSelection();
  assert.equal(game.state, 'paused');
  for (const [key, value] of Object.entries(state)) assert.equal(game[key], value);
  game.resume();
  assert.equal(game.state, 'playing');
  game.chooseDriver();
  assert.equal(game.state, 'playing');
});

test('Ryan uses the complete boost cameo and remains selected after a restart', () => {
  const events = [];
  const game = new GameEngine({ characterId: 'ryan', onEvent: (event) => events.push(event) });
  game.start();
  advance(game, 3.5);
  game.speed = CRUISE_SPEED;
  game.input.nitro = true;
  advance(game, .2);
  assert.equal(cameoPose(game.cameoTime).facing, 'back');
  advance(game, .5);
  assert.equal(cameoPose(game.cameoTime).facing, 'profile');
  advance(game, .5);
  assert.equal(cameoPose(game.cameoTime).facing, 'smile');
  advance(game, 1.5);
  assert.equal(game.cameoTime, -1);
  assert.deepEqual(events.filter((event) => event.type === 'cameo'), [{ type: 'cameo', characterId: 'ryan' }]);
  game.start();
  assert.equal(game.characterId, 'ryan');
  assert.equal(game.cameoTime, -1);
  game.start('dhh');
  assert.equal(game.characterId, 'dhh');
});

test('an unknown character falls back to DHH', () => {
  const game = new GameEngine({ characterId: 'unknown-driver' });
  assert.equal(game.characterId, 'dhh');
  game.start('__proto__');
  assert.equal(game.characterId, 'dhh');
});

test('later cameos require a new boost, an expired cooldown, and a successful chance roll', () => {
  const { game, events } = playing();
  game.speed = CRUISE_SPEED;
  game.input.nitro = true;
  advance(game, .2);
  assert.equal(events.filter((event) => event.type === 'cameo').length, 1);
  game.pause();
  const cooldown = game.cameoCooldown;
  advance(game, 5);
  assert.equal(game.cameoCooldown, cooldown);
  game.resume();
  game.input.nitro = false;
  advance(game, CAMEO_COOLDOWN + .1);
  assert.equal(game.cameoCooldown, 0);
  assert.equal(events.filter((event) => event.type === 'cameo').length, 1);
  game.random = () => .9;
  game.input.nitro = true;
  advance(game, .2);
  assert.equal(events.filter((event) => event.type === 'cameo').length, 1);
  game.random = () => 0;
  advance(game, .2);
  assert.equal(events.filter((event) => event.type === 'cameo').length, 1);
  game.input.nitro = false;
  advance(game, .1);
  game.input.nitro = true;
  advance(game, .2);
  assert.equal(events.filter((event) => event.type === 'cameo').length, 2);
  assert.ok(game.cameoCooldown > CAMEO_COOLDOWN - 1);
});
