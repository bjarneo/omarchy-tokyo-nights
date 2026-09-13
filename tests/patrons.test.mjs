import test from 'node:test';
import assert from 'node:assert/strict';
import { FOUNDING_PATRONS, createPatronTour } from '../src/patrons.mjs';
import { GameEngine } from '../src/engine.mjs';
import { createStaticServer } from '../tools/server.mjs';

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('each tour includes all twelve founding patrons at spaced, randomized route positions', () => {
  const ids = FOUNDING_PATRONS.map(({ id }) => id).sort();
  assert.equal(ids.length, 12);
  const first = createPatronTour(seeded(1));
  const second = createPatronTour(seeded(2));
  assert.notDeepEqual(first, second);
  for (const tour of [first, second]) {
    assert.deepEqual(tour.roadside.map(({ id }) => id).sort(), ids);
    tour.roadside.forEach((patron, index) => {
      assert.ok(patron.at >= 300 && patron.at < 12_000);
      assert.ok(patron.side === -1 || patron.side === 1);
      if (index) assert.ok(patron.at - tour.roadside[index - 1].at >= 700);
    });
    assert.equal(new Set([...tour.garage, ...tour.mars]).size, 5);
    assert.ok([...tour.garage, ...tour.mars].every((id) => ids.includes(id)));
  }
});

test('cosmetic patron choices do not change traffic, pickups, or race progress', () => {
  const a = new GameEngine({ random: seeded(42), patronRandom: seeded(1) });
  const b = new GameEngine({ random: seeded(42), patronRandom: seeded(2) });
  a.start(); b.start();
  assert.notDeepEqual(a.patronTour, b.patronTour);
  for (let frame = 0; frame < 600; frame++) { a.update(1 / 60); b.update(1 / 60); }
  for (const key of ['state', 'distance', 'time', 'score', 'traffic', 'pickups', 'nitroPickups', 'pitStopAt', 'pitStopLane']) assert.deepEqual(a[key], b[key], key);
});

test('a tour survives pause and the Mars trip, and a new run creates a new tour', () => {
  const game = new GameEngine({ patronRandom: seeded(19) });
  game.start();
  const tour = game.patronTour;
  game.state = 'playing';
  game.pause(); game.resume();
  game.boardRocket(); game.update(20); game.returnFromMars();
  assert.equal(game.patronTour, tour);
  game.start();
  assert.notDeepEqual(game.patronTour, tour);
});

test('all local patron portraits have source provenance and fit the asset budget', async (t) => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  let bytes = 0;
  for (const patron of FOUNDING_PATRONS) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/${patron.portrait}`);
    assert.equal(response.status, 200, patron.id);
    assert.equal(response.headers.get('content-type'), 'image/png');
    const image = Buffer.from(await response.arrayBuffer());
    assert.equal(image.subarray(1, 4).toString(), 'PNG');
    assert.equal(image.readUInt32BE(16), 48);
    assert.equal(image.readUInt32BE(20), 48);
    assert.ok(image.includes(Buffer.from('impeccable:prompt\0')));
    assert.ok(image.includes(Buffer.from(patron.source)));
    bytes += image.length;
  }
  assert.ok(bytes < 128 * 1024);
});
