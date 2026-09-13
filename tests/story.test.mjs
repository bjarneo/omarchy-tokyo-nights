import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, CHECKPOINT_LENGTH, CRUISE_SPEED } from '../src/engine.mjs';
import { CHAPTERS } from '../src/story.mjs';

function playing() {
  const events = [];
  const game = new GameEngine({ random: () => .5, onEvent: (event) => events.push(event) });
  game.start();
  game.state = 'playing';
  game.speed = CRUISE_SPEED;
  game.spawnTimer = 1000;
  return { game, events };
}

test('chapter briefings freeze the clock until the player begins', () => {
  const { game } = playing();
  game.showBriefing();
  const time = game.time;
  for (let i = 0; i < 600; i++) game.update(1 / 60);
  assert.equal(game.time, time);
  assert.equal(game.distance, 0);
  game.beginChapter();
  assert.equal(game.state, 'countdown');
});

test('a marked pickup requires the correct lane and awards the cassette', () => {
  const { game, events } = playing();
  game.distance = 640;
  game.playerX = 0;
  game.update(1 / 60);
  assert.equal(game.cassette, true);
  assert.equal(game.missionStatus().complete, true);
  assert.ok(game.score >= 500);
  assert.equal(events.filter((event) => event.type === 'pickup').length, 1);
  const other = playing().game;
  other.distance = 640;
  other.playerX = -.65;
  other.update(1 / 60);
  assert.equal(other.cassette, false);
});

test('an incomplete chapter ends the run with an objective-specific reason', () => {
  const { game } = playing();
  game.distance = CHECKPOINT_LENGTH - .1;
  game.update(1 / 60);
  assert.equal(game.state, 'gameover');
  assert.match(game.failureReason, /music tape/);
});

test('the final chapter fails after its third collision', () => {
  const { game } = playing();
  game.stage = 3;
  game.chapterCollisions = 4;
  game.collisions = 7;
  game.update(1 / 60);
  assert.equal(game.state, 'gameover');
  assert.match(game.failureReason, /Three collisions/);
});

test('a complete four-chapter drive reaches the arcade and finishes exactly once', () => {
  const events = [];
  const game = new GameEngine({ random: () => .5, characterId: 'outfoxxed', carId: 'f40', paintId: 'rose', onEvent: (event) => events.push(event) });
  game.start();
  game.showBriefing();
  let boosting = false;
  for (let frame = 0; frame < 60 * 240 && game.state !== 'complete' && game.state !== 'gameover'; frame++) {
    if (game.state === 'story') { game.beginChapter(); boosting = false; }
    if (game.state === 'playing') {
      game.input.left = game.playerX > -.63;
      game.input.right = game.playerX < -.67;
      game.input.gas = true;
      if (game.nitro > 95) boosting = true;
      if (game.nitro < 5) boosting = false;
      game.input.nitro = boosting;
    }
    game.update(1 / 60);
  }
  assert.equal(game.state, 'complete', game.failureReason);
  assert.equal(game.chaptersComplete, CHAPTERS.length);
  assert.ok(game.distance >= CHECKPOINT_LENGTH * CHAPTERS.length);
  assert.equal(game.cassette, true);
  assert.ok(game.powerCells >= 2);
  assert.equal(events.filter((event) => event.type === 'briefing').length, 4);
  assert.equal(events.filter((event) => event.type === 'ending').length, 1);
  assert.equal(events.filter((event) => event.type === 'complete').length, 1);
  const score = game.score;
  for (let i = 0; i < 120; i++) game.update(1 / 60);
  assert.equal(game.score, score);
  game.chooseDriver();
  game.start();
  assert.equal(game.chaptersComplete, 0);
  assert.equal(game.cassette, false);
  assert.equal(game.carId, 'f40');
  assert.equal(game.paintId, 'rose');
});
