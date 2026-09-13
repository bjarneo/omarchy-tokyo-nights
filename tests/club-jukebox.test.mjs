import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { CLUB_TRACKS } from '../assets/club-radio.js';
import { ClubJukebox } from '../src/club-jukebox.mjs';

class AudioStub extends EventTarget {
  constructor() { super(); this.paused = true; this.ended = false; this.currentTime = 0; this.error = null; }
  async play() { this.paused = false; this.ended = false; this.dispatchEvent(new Event('playing')); }
  pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } }
  finish() { this.ended = this.paused = true; this.dispatchEvent(new Event('ended')); }
  load() {}
  removeAttribute() {}
  remove() { this.removed = true; }
}

const settle = () => new Promise(setImmediate);

test('the complete local radio import retains its credits, ordering, flags, and audio hashes', async () => {
  const root = new URL('../assets/radio/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('playlist.json', root)));
  assert.deepEqual(manifest.tracks, CLUB_TRACKS);
  assert.equal(CLUB_TRACKS.length, 33);
  assert.deepEqual((await readdir(root)).filter((file) => file.endsWith('.mp3')).sort(), CLUB_TRACKS.map((track) => track.file).sort());
  for (const track of CLUB_TRACKS) {
    assert.ok(track.title && track.artist);
    const data = await readFile(new URL(track.file, root));
    assert.equal(data.length, track.bytes, track.file);
    assert.equal(createHash('sha256').update(data).digest('hex'), track.sha256, track.file);
  }
  assert.equal(CLUB_TRACKS.find((track) => track.file === 'boyd-its-fucking-fork-o-clock.mp3').explicit, true);
});

test('the queue takes precedence, then the library continues and wraps', async () => {
  const made = [];
  const jukebox = new ClubJukebox({ tracks: CLUB_TRACKS.slice(0, 3), audioFactory: () => { const audio = new AudioStub(); made.push(audio); return audio; } });
  assert.equal(made.length, 0);
  jukebox.add(2); jukebox.add(0);
  assert.equal(jukebox.active, false);
  await jukebox.play(); assert.equal(jukebox.index, 2);
  jukebox.audio.finish(); await settle(); assert.equal(jukebox.index, 0);
  assert.equal(made[0].removed, true);
  jukebox.audio.finish(); await settle(); assert.equal(jukebox.index, 1);
  jukebox.audio.finish(); await settle(); assert.equal(jukebox.index, 2);
  jukebox.audio.finish(); await settle(); assert.equal(jukebox.index, 0);
  assert.equal(jukebox.queue.length, 0);
  assert.equal(made.filter((audio) => !audio.paused).length, 1);
  jukebox.dispose();
});

test('pause retains the play position and ignores an ended event after cancellation', async () => {
  const jukebox = new ClubJukebox({ audioFactory: () => new AudioStub() });
  await jukebox.play(); jukebox.audio.currentTime = 42; jukebox.add(4);
  jukebox.pause(); jukebox.audio.finish();
  assert.equal(jukebox.index, 0); assert.deepEqual(jukebox.queue, [4]);
  jukebox.audio.ended = false;
  await jukebox.play(); assert.equal(jukebox.audio.currentTime, 42);
  jukebox.dispose(); assert.equal(jukebox.audio, null);
});

test('late events from a canceled source cannot take over a newer track', async () => {
  let resolveFirst;
  const first = new AudioStub();
  first.play = () => new Promise((resolve) => { resolveFirst = resolve; });
  const second = new AudioStub(); let count = 0;
  const jukebox = new ClubJukebox({ audioFactory: () => ++count === 1 ? first : second });
  const request = jukebox.play(); assert.equal(jukebox.pending, true);
  jukebox.pause(); assert.equal(jukebox.pending, false);
  jukebox.select(1); await settle();
  first.dispatchEvent(new Event('error')); first.finish(); resolveFirst(); await request;
  assert.equal(jukebox.index, 1); assert.equal(jukebox.audio, second);
  assert.equal(jukebox.playing, true); assert.equal(jukebox.error, '');
  jukebox.dispose();
});

test('a rejected media request exposes a retry and a failed source gets replaced', async () => {
  let count = 0;
  const jukebox = new ClubJukebox({ audioFactory: () => {
    const audio = new AudioStub();
    if (++count === 1) audio.play = async () => { audio.error = { code: 4 }; throw new Error('Unsupported source.'); };
    return audio;
  } });
  await jukebox.play(); assert.equal(jukebox.active, false); assert.match(jukebox.error, /Select Play now/);
  await jukebox.play(); assert.equal(count, 2); assert.equal(jukebox.playing, true); assert.equal(jukebox.error, '');
  jukebox.dispose();
});

test('library pages expose every track and queue edits preserve their order', () => {
  const jukebox = new ClubJukebox(); const entries = [];
  for (let page = 0; page < jukebox.pageCount; page++) {
    jukebox.action(`jukebox:page:${page}`);
    entries.push(...jukebox.panel().options.filter((option) => option.detail).map((option) => Number(option.id.split(':')[2])));
  }
  assert.deepEqual(entries, CLUB_TRACKS.map((_, i) => i));
  jukebox.add(5); jukebox.add(2); jukebox.add(5);
  jukebox.action('jukebox:queue'); jukebox.action('jukebox:remove:1');
  assert.deepEqual(jukebox.queue, [5, 5]);
  jukebox.action('jukebox:remove:-1'); assert.deepEqual(jukebox.queue, [5, 5]);
  jukebox.action('jukebox:clear'); assert.match(jukebox.panel().text, /queue is empty/);
  jukebox.dispose();
});
