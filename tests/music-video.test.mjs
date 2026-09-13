import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { frameAt } from '../src/song.mjs';
import { createStaticServer } from '../tools/server.mjs';

const cues = JSON.parse(await readFile(new URL('../assets/song-cues.json', import.meta.url)));
const analysis = JSON.parse(await readFile(new URL('../assets/song-analysis.json', import.meta.url)));

test('the timed captions preserve every supplied lyric and fit the audio', async () => {
  const source = await readFile(new URL('../assets/lyrics.txt', import.meta.url), 'utf8');
  const lines = source.split('\n').filter((line) => line.trim() && !line.startsWith('('));
  assert.deepEqual(cues.lyrics.map((line) => line.text), lines);
  assert.equal(cues.duration, analysis.duration);
  for (const [index, line] of cues.lyrics.entries()) {
    assert.ok(line.start >= 0 && line.end > line.start && line.end <= cues.duration);
    if (index) assert.ok(line.start >= cues.lyrics[index - 1].end);
    assert.equal(line.words.map((word) => word.text).join(' '), line.text);
    for (const word of line.words) {
      assert.ok(word.start >= line.start && word.end >= word.start && word.end <= line.end, word.text);
    }
  }
});

test('audio time selects the correct scene and caption at section boundaries', () => {
  const chorus = cues.sections.find((section) => section.id === 'chorus-1');
  assert.equal(frameAt(chorus.start - .01, cues, analysis).section.id, 'verse-1');
  const frame = frameAt(chorus.start, cues, analysis);
  assert.equal(frame.section.id, 'chorus-1');
  assert.equal(frame.lyric.text, 'Neon on yellow, roaring through the rain');
  assert.equal(frameAt(65.739999, cues, analysis).lyric.text, frame.lyric.text);
  assert.equal(frameAt(56, cues, analysis).scene, 'bridge');
  assert.equal(frameAt(160, cues, analysis).scene, 'tunnel');
  assert.equal(frameAt(180, cues, analysis).scene, 'bay');
  assert.equal(frameAt(99, cues, analysis).lyric, null);
  assert.equal(frameAt(200, cues, analysis).lyric, null);
});

test('the director preserves seek determinism, chorus speed, and the parked finale', () => {
  const before = frameAt(70.5, cues, analysis);
  frameAt(200, cues, analysis);
  assert.deepEqual(frameAt(70.5, cues, analysis), before);
  const verseTravel = frameAt(45, cues, analysis).distance - frameAt(44, cues, analysis).distance;
  const chorusTravel = frameAt(71, cues, analysis).distance - frameAt(70, cues, analysis).distance;
  assert.ok(chorusTravel > verseTravel);
  assert.equal(frameAt(195, cues, analysis).distance, frameAt(220, cues, analysis).distance);
  assert.equal(frameAt(195, cues, analysis).speed, 0);
  assert.equal(frameAt(70, cues, analysis, true).pulse, 0);
  assert.equal(frameAt(70, cues, analysis, true).playerX, 0);
  assert.equal(frameAt(cues.duration, cues, analysis).fade, 0);
});

test('the media server supports audio seek ranges and rejects invalid ranges', async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const head = await fetch(`${url}/assets/omarchy-tokyo-nights.mp3`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get('content-type'), 'audio/mpeg');
    const size = Number(head.headers.get('content-length'));
    const partial = await fetch(`${url}/assets/omarchy-tokyo-nights.mp3`, { headers: { Range: 'bytes=100-199' } });
    assert.equal(partial.status, 206);
    assert.equal(partial.headers.get('content-range'), `bytes 100-199/${size}`);
    assert.equal((await partial.arrayBuffer()).byteLength, 100);
    const suffix = await fetch(`${url}/assets/omarchy-tokyo-nights.mp3`, { headers: { Range: 'bytes=-64' } });
    assert.equal(suffix.status, 206);
    assert.equal((await suffix.arrayBuffer()).byteLength, 64);
    const invalid = await fetch(`${url}/assets/omarchy-tokyo-nights.mp3`, { headers: { Range: `bytes=${size}-` } });
    assert.equal(invalid.status, 416);
    assert.equal((await fetch(`${url}/.impeccable/surfaces/music-video-html.md`)).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
