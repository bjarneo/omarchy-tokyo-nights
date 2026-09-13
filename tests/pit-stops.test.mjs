import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, CRUISE_SPEED, NITRO_DRAIN } from '../src/engine.mjs';
import { CHARACTERS } from '../src/characters.mjs';
import { PIT_TOPICS, createPitConversation } from '../src/pit-stops.mjs';

function active() {
  const events = [];
  const game = new GameEngine({ random: () => .5, characterId: 'bjarne', carId: 'supra', paintId: 'cyan', onEvent: (event) => events.push(event) });
  game.state = 'playing';
  game.speed = CRUISE_SPEED;
  game.spawnTimer = Infinity;
  game.nextNitroSpawn = Infinity;
  game.pitStopAt = null;
  game.pickups = [];
  return { game, events };
}

test('a full nitro tank supports eight seconds of boost', () => {
  const { game } = active();
  game.input.nitro = true;
  for (let i = 0; i < 7 * 60; i++) game.update(1 / 60);
  assert.equal(game.boosting, true);
  assert.ok(game.nitro > 12 && game.nitro < 13);
  assert.equal(100 / NITRO_DRAIN, 8);
});

test('nitro pickups refill the tank once even after the chapter objective is complete', () => {
  const { game, events } = active();
  game.cassette = true;
  game.nitro = 20;
  game.nitroPickups = [{ id: 1, kind: 'nitro', z: game.distance + 7, x: 0, resolved: false }];
  game.update(1 / 60);
  assert.ok(game.nitro >= 65 && game.nitro < 66);
  assert.ok(game.score >= 200);
  game.update(1 / 60);
  assert.equal(events.filter((event) => event.type === 'nitro-pickup').length, 1);
  assert.equal(game.nitroPickups.length, 0);
});

test('randomized nitro drops appear ahead and stay clear of mission drops', () => {
  const { game } = active();
  game.nextNitroSpawn = 0;
  game.preparePickups();
  game.update(1 / 60);
  assert.equal(game.nitroPickups.length, 1);
  const pickup = game.nitroPickups[0];
  assert.ok(pickup.z > game.distance + 200);
  assert.ok(pickup.z < game.nextCheckpoint);
  assert.ok(game.pickups.every((drop) => Math.abs(drop.z - pickup.z) >= 90));
});

test('a pit stop freezes progress and returns to the same run after the conversation', () => {
  const { game, events } = active();
  game.playerX = -1.22;
  game.cassette = true;
  game.powerCells = 1;
  game.pitStopAt = game.distance + 1;
  game.pitStopLane = -1.22;
  game.update(1 / 60);
  assert.equal(game.state, 'pit-enter');
  const saved = { distance: game.distance, playerX: game.playerX, time: game.time, score: game.score, passed: game.passed };
  for (let i = 0; i < 120; i++) game.update(1 / 60);
  assert.equal(game.state, 'pit');
  assert.notEqual(game.pitStop.companionId, game.characterId);
  for (let i = 0; i < 600; i++) game.update(1 / 60);
  for (const [key, value] of Object.entries(saved)) assert.equal(game[key], value);
  for (let line = 0; line < 3; line++) {
    game.advancePitDialogue();
    assert.equal(game.state, 'pit');
  }
  game.advancePitDialogue();
  assert.equal(game.state, 'playing');
  for (const [key, value] of Object.entries(saved)) assert.equal(game[key], value);
  assert.equal(game.carId, 'supra');
  assert.equal(game.paintId, 'cyan');
  assert.equal(game.cassette, true);
  assert.equal(game.powerCells, 1);
  assert.equal(game.nitro, 100);
  assert.equal(game.pitStopAt, null);
  assert.equal(events.filter((event) => event.type === 'pit-resume').length, 1);
  game.update(1 / 60);
  assert.ok(game.distance > saved.distance);
  assert.ok(game.time < saved.time);
});

test('pit conversations use another member and avoid the previous topic', () => {
  assert.equal(PIT_TOPICS.length, 9);
  for (const character of CHARACTERS) {
    const first = createPitConversation(() => .5, character.id);
    const second = createPitConversation(() => .5, character.id, first.topicId);
    assert.notEqual(first.companionId, character.id);
    assert.notEqual(second.topicId, first.topicId);
    assert.deepEqual(first.lines.map(({ speaker }) => speaker), ['crew', 'driver', 'crew', 'driver']);
  }
});

test('driving past a marked pit bay does not stop the race', () => {
  const { game, events } = active();
  game.pitStopAt = 20;
  game.pitStopLane = 1.22;
  game.playerX = 0;
  for (let i = 0; i < 120; i++) game.update(1 / 60);
  assert.equal(game.state, 'playing');
  assert.equal(game.pitStopsVisited, 0);
  assert.equal(game.pitStopAt, null);
  assert.equal(events.some((event) => event.type === 'pit-enter'), false);
});

test('the opposite shoulder does not enter a pit bay', () => {
  const { game } = active();
  game.pitStopAt = 1;
  game.pitStopLane = 1.22;
  game.playerX = -1.22;
  game.update(1 / 60);
  assert.equal(game.state, 'playing');
  assert.equal(game.pitStopsVisited, 0);
});
