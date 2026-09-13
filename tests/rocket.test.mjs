import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, CRUISE_SPEED } from '../src/engine.mjs';
import { ROCKET_FLIGHT_SECONDS, rocketFlightPhase, MARS_BONUS } from '../src/rocket.mjs';

function launchReady() {
  const events = [];
  const game = new GameEngine({ random: () => .5, characterId: 'outfoxxed', carId: 'f40', paintId: 'cyan', onEvent: (event) => events.push(event) });
  game.state = 'playing';
  game.speed = CRUISE_SPEED;
  game.rocketAt = 10;
  game.playerX = game.rocketLane;
  game.spawnTimer = Infinity;
  game.nextNitroSpawn = Infinity;
  game.pitStopAt = null;
  game.cassette = true;
  game.update(1 / 60);
  return { game, events };
}

test('driving into the rocket ramp boards the selected car and driver', () => {
  const { game, events } = launchReady();
  assert.equal(game.state, 'rocket-flight');
  assert.equal(game.rocketVisited, true);
  assert.equal(game.carId, 'f40');
  assert.equal(game.characterId, 'outfoxxed');
  assert.equal(game.paintId, 'cyan');
  assert.equal(events.filter((event) => event.type === 'rocket-launch').length, 1);
});

test('the rocket is optional and a road-lane pass does not launch', () => {
  const game = new GameEngine({ random: () => .5 });
  game.state = 'playing';
  game.speed = CRUISE_SPEED;
  game.rocketAt = 10;
  game.playerX = 0;
  for (let i = 0; i < 90; i++) game.update(1 / 60);
  assert.equal(game.state, 'playing');
  assert.equal(game.rocketVisited, false);
  assert.equal(game.rocketAt, null);
});

test('arrival occurs at twenty seconds, with one bonus and no lost campaign progress', () => {
  const { game, events } = launchReady();
  const saved = { distance: game.distance, time: game.time, playerX: game.playerX, score: game.score };
  game.update(19.999);
  assert.equal(game.state, 'rocket-flight');
  game.update(.001);
  assert.equal(game.state, 'mars');
  assert.equal(game.rocketTime, ROCKET_FLIGHT_SECONDS);
  assert.equal(game.distance, saved.distance);
  assert.equal(game.time, saved.time);
  assert.equal(game.playerX, saved.playerX);
  assert.equal(game.score, saved.score + MARS_BONUS);
  game.update(30);
  assert.equal(events.filter((event) => event.type === 'mars-arrival').length, 1);
  game.returnFromMars();
  assert.equal(game.state, 'playing');
  assert.equal(game.distance, saved.distance);
  assert.equal(game.time, saved.time);
  assert.equal(game.cassette, true);
  assert.equal(game.nitro, 100);
  game.prepareRocket();
  assert.equal(game.rocketAt, null);
});

test('the flight lasts twenty seconds across different render rates', () => {
  for (const fps of [2, 10, 30, 60, 90]) {
    const { game } = launchReady();
    for (let frame = 0; frame < fps * 20; frame++) game.update(1 / fps);
    assert.equal(game.state, 'mars', `${fps} FPS`);
    assert.equal(game.rocketTime, 20);
  }
});

test('pause freezes the flight and restart restores the launchpad', () => {
  const { game } = launchReady();
  game.update(7);
  game.pause();
  game.update(30);
  assert.equal(game.rocketTime, 7);
  game.resume();
  assert.equal(game.state, 'rocket-flight');
  game.update(13);
  assert.equal(game.state, 'mars');
  game.home();
  assert.equal(game.rocketVisited, false);
  assert.equal(game.rocketTime, 0);
  assert.equal(game.rocketAt, 850);
});

test('the flight contains boarding, liftoff, hyper boost, and descent', () => {
  assert.equal(rocketFlightPhase(0).phase, 'boarding');
  assert.equal(rocketFlightPhase(2).phase, 'launch');
  assert.equal(rocketFlightPhase(6).phase, 'warp');
  assert.equal(rocketFlightPhase(16).phase, 'descent');
  assert.equal(rocketFlightPhase(20).phase, 'landed');
  assert.equal(rocketFlightPhase(20).remaining, 0);
});
