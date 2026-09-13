import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHORTS } from '../src/shorts.mjs';

const run = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, process.argv[2] || 'exports/shorts');
for (const clip of SHORTS) {
  const file = resolve(directory, `${clip.id}.mp4`);
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]);
  const media = JSON.parse(stdout);
  const video = media.streams.find((stream) => stream.codec_type === 'video');
  const audio = media.streams.find((stream) => stream.codec_type === 'audio');
  assert.equal(video.codec_name, 'h264');
  assert.equal(video.width, 1080);
  assert.equal(video.height, 1920);
  assert.equal(video.pix_fmt, 'yuv420p');
  assert.equal(video.r_frame_rate, '30/1');
  assert.equal(audio.codec_name, 'aac');
  assert.equal(audio.channels, 2);
  assert.equal(Number(audio.sample_rate), 48000);
  assert.equal(Number(video.start_time), 0);
  assert.equal(Number(audio.start_time), 0);
  assert.ok(Math.abs(Number(video.duration) - Number(audio.duration)) <= 1 / 30 + .002);
  assert.ok(Math.abs(Number(media.format.duration) - (clip.end - clip.start)) <= 1 / 30 + .002);
  await run('ffmpeg', ['-v', 'error', '-xerror', '-i', file, '-f', 'null', '-']);
  console.log(`${clip.id}: ${media.format.duration}s, ${(Number(media.format.size) / 1e6).toFixed(1)} MB, complete decode passed.`);
}
