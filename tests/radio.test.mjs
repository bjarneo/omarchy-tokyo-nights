import test from 'node:test';
import assert from 'node:assert/strict';
import { RadioPlayer } from '../src/radio-player.js';
import { RADIO_TRACKS, RADIO_SOURCE } from '../assets/radio-tracks.js';
import { normalizeRadioCatalog, RADIO_CATALOG_URL, radioTime } from '../src/radio-catalog.mjs';
import { createStaticServer } from '../tools/server.mjs';

class Media extends EventTarget {
  paused = true;
  ended = false;
  error = null;
  currentTime = 0;
  duration = 200;
  async play() { this.paused = false; this.dispatchEvent(new Event('playing')); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  removeAttribute() { this.src = ''; }
  load() { this.currentTime = 0; }
  remove() { this.removed = true; }
}

test('the catalog retains all station tracks, credits, and explicit metadata', () => {
  assert.equal(RADIO_SOURCE.url, RADIO_CATALOG_URL);
  assert.equal(RADIO_TRACKS.length, 33);
  assert.equal(new Set(RADIO_TRACKS.map(({ url }) => url)).size, 33);
  assert.ok(RADIO_TRACKS.every(({ title, artist, url }) => title && artist && url.startsWith('https://radio.omarchy.org/tracks/')));
  assert.equal(RADIO_TRACKS.filter(({ explicit }) => explicit).length, 1);
  assert.equal(radioTime(NaN), '0:00');
  assert.equal(radioTime(125.9), '2:05');
});

test('catalog normalization encodes files and accepts verified HTTPS overrides', () => {
  const tracks = normalizeRadioCatalog({ tracks: [{ title: 'A title', artist: 'An artist', file: 'a title.mp3' }, { title: 'Another', artist: 'Artist', url: 'https://example.com/song.mp3' }] });
  assert.equal(tracks[0].url, 'https://radio.omarchy.org/tracks/a%20title.mp3');
  assert.equal(tracks[1].url, 'https://example.com/song.mp3');
  assert.throws(() => normalizeRadioCatalog({ tracks: [] }));
  assert.throws(() => normalizeRadioCatalog({ tracks: [{ title: 'Test', artist: 'Test', url: 'http://example.com/song.mp3' }] }));
  assert.throws(() => normalizeRadioCatalog({ tracks: [{ title: 'Test', artist: 'Test', file: '../song.mp3' }] }));
  assert.throws(() => normalizeRadioCatalog({ tracks: [RADIO_TRACKS[0], RADIO_TRACKS[0]] }));
});

test('the radio loads media only after Play and preserves the paused position', async (t) => {
  let calls = 0;
  const radio = new RadioPlayer({ audioFactory: () => { calls++; return new Media(); } });
  t.after(() => radio.dispose());
  assert.equal(calls, 0);
  radio.select(5);
  assert.equal(calls, 0);
  await radio.play();
  assert.equal(calls, 1);
  assert.equal(radio.playing, true);
  radio.audio.currentTime = 37;
  radio.pause();
  assert.equal(radio.playing, false);
  await radio.play();
  assert.equal(radio.audio.currentTime, 37);
  assert.equal(calls, 1);
  radio.audio.dispatchEvent(new Event('pause'));
  assert.equal(radio.playing, true);
});

test('track changes wrap and the last song advances to the first song', async (t) => {
  const radio = new RadioPlayer({ audioFactory: () => new Media() });
  t.after(() => radio.dispose());
  radio.previous();
  assert.equal(radio.index, 32);
  assert.equal(radio.active, false);
  await radio.play();
  const previous = radio.audio;
  previous.ended = true; previous.paused = true;
  previous.dispatchEvent(new Event('ended'));
  await Promise.resolve();
  assert.equal(radio.index, 0);
  assert.equal(radio.playing, true);
  assert.equal(previous.removed, true);
});

test('cancel and track changes ignore stale playback and media errors', async (t) => {
  let resolve;
  const first = new Media();
  first.play = () => new Promise((done) => { resolve = done; });
  let calls = 0;
  const radio = new RadioPlayer({ audioFactory: () => calls++ ? new Media() : first });
  t.after(() => radio.dispose());
  const pending = radio.play();
  assert.equal(radio.pending, true);
  radio.pause();
  first.paused = false; first.dispatchEvent(new Event('playing'));
  assert.equal(first.paused, true);
  radio.select(1, true);
  resolve(); await pending;
  first.dispatchEvent(new Event('error'));
  assert.equal(radio.index, 1);
  assert.equal(radio.error, '');
  assert.equal(radio.playing, true);
});

test('radio failures permit a fresh retry and volume remains bounded', async (t) => {
  let calls = 0;
  const radio = new RadioPlayer({ audioFactory: () => { calls++; return new Media(); } });
  t.after(() => radio.dispose());
  await radio.play();
  radio.audio.error = new Error('Network failure.');
  radio.audio.dispatchEvent(new Event('error'));
  assert.match(radio.error, /Try Play or Next/);
  assert.equal(radio.active, false);
  await radio.play();
  assert.equal(calls, 2);
  assert.equal(radio.playing, true);
  radio.setVolume(2); assert.equal(radio.volume, 1);
  radio.setVolume(-2); assert.equal(radio.volume, 0);
  radio.setVolume(NaN); assert.equal(radio.volume, 0);
  assert.equal(radio.audio.volume, 0);
});

test('the static server serves the radio UI and local catalog', async (t) => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  for (const path of ['radio.css', 'src/radio-player.js', 'src/radio-controls.js', 'src/radio-catalog.mjs', 'assets/radio-tracks.js']) {
    assert.equal((await fetch(`http://127.0.0.1:${server.address().port}/${path}`)).status, 200, path);
  }
});
