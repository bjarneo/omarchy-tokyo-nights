import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, getCharacter } from '../src/characters.mjs';
import { CARS, PAINTS } from '../src/cars.mjs';
import { GameEngine, CRUISE_SPEED } from '../src/engine.mjs';

test('all nine requested drivers can trigger their own cameo', () => {
  const expected = ['dhh', 'ryan', 'bjarne', 'tobi', 'hancore', 'spencer', 'krzysztof', 'outfoxxed', 'emir'];
  assert.deepEqual(CHARACTERS.map(({ id }) => id), expected);
  for (const id of expected) {
    const events = [];
    const game = new GameEngine({ characterId: id, onEvent: (event) => events.push(event) });
    game.state = 'playing';
    game.speed = CRUISE_SPEED;
    game.input.nitro = true;
    game.update(1 / 60);
    assert.equal(getCharacter(id).id, id);
    assert.deepEqual(events.find((event) => event.type === 'cameo'), { type: 'cameo', characterId: id });
  }
});

test('all nine cars accept all nine Tokyo Night paint colors', () => {
  assert.equal(CARS.length, 9);
  assert.equal(PAINTS.length, 9);
  assert.equal(new Set(CARS.map(({ id }) => id)).size, 9);
  assert.deepEqual(PAINTS.map(({ hex }) => hex), ['#e0af68', '#f7768e', '#ff9e64', '#9ece6a', '#7aa2f7', '#7dcfff', '#bb9af7', '#c0caf5', '#565f89']);
  for (const car of CARS) {
    for (const paint of PAINTS) {
      const game = new GameEngine();
      game.start('emir', car.id, paint.id);
      assert.equal(game.carId, car.id);
      assert.equal(game.paintId, paint.id);
    }
  }
});

test('a canceled setup and a restart preserve the committed car and paint', () => {
  const game = new GameEngine({ characterId: 'bjarne', carId: 'skyline', paintId: 'cyan' });
  game.start();
  game.pause();
  game.chooseDriver();
  game.cancelSelection();
  assert.equal(game.state, 'paused');
  assert.equal(game.carId, 'skyline');
  assert.equal(game.paintId, 'cyan');
  game.start();
  assert.equal(game.carId, 'skyline');
  assert.equal(game.paintId, 'cyan');
  game.start('outfoxxed', 'f40', 'rose');
  assert.equal(game.carId, 'f40');
  assert.equal(game.paintId, 'rose');
});

test('invalid saved car and paint values fall back to the amber Countach', () => {
  const game = new GameEngine({ carId: '__proto__', paintId: 'unknown' });
  assert.equal(game.carId, 'countach');
  assert.equal(game.paintId, 'amber');
  game.start('dhh', 'invalid', null);
  assert.equal(game.carId, 'countach');
  assert.equal(game.paintId, 'amber');
});
