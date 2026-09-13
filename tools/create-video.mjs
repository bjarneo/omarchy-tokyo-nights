import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createStaticServer } from './server.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const value = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
const output = resolve(root, value('--output', 'exports/omarchy-tokyo-nights.mp4'));
const fps = Number(value('--fps', '30'));
const start = Number(value('--start', '0'));
const requestedDuration = Number(value('--duration', 'Infinity'));
if (![24, 25, 30, 60].includes(fps) || !Number.isFinite(start) || start < 0 || !(requestedDuration > 0)) {
  throw new Error('Use a valid start time, a positive duration, and 24, 25, 30, or 60 FPS.');
}
if (!output.endsWith('.mp4')) throw new Error('The output path must end with .mp4.');
await mkdir(dirname(output), { recursive: true });
if (!args.includes('--overwrite')) {
  const exists = await stat(output).then(() => true, () => false);
  if (exists) throw new Error('The output already exists. Use --overwrite to replace it.');
}
const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

let browser;
let encoder;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/music-video.html?export`);
  await page.waitForFunction(() => window.videoReady || window.videoError);
  const failure = await page.evaluate(() => window.videoError);
  if (failure || errors.length) throw new Error(failure || errors.join('\n'));
  const fullDuration = await page.evaluate(() => window.musicVideo.duration);
  if (start >= fullDuration) throw new Error('The start time must precede the end of the song.');
  const duration = Math.min(requestedDuration, fullDuration - start);
  const frames = Math.ceil(duration * fps);
  encoder = spawn('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', args.includes('--overwrite') ? '-y' : '-n',
    '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'png', '-i', 'pipe:0',
    '-ss', String(start), '-i', resolve(root, 'assets/omarchy-tokyo-nights.mp3'),
    '-map', '0:v:0', '-map', '1:a:0', '-t', String(duration),
    '-vf', 'scale=1920:1080:flags=neighbor', '-c:v', 'libx264', '-preset', 'fast',
    '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), '-threads', '4',
    '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart',
    '-map_metadata', '-1', output,
  ], { stdio: ['pipe', 'inherit', 'pipe'] });
  let encoderError = '';
  let processError;
  encoder.stderr.on('data', (chunk) => { encoderError += chunk; });
  encoder.stdin.on('error', (error) => { processError = error; });
  encoder.on('error', (error) => { processError = error; });
  const finished = new Promise((resolve, reject) => {
    encoder.once('error', reject);
    encoder.once('close', (code) => code === 0 ? resolve() : reject(new Error(encoderError || `FFmpeg exited with code ${code}.`)));
  });
  // Attach the rejection handler before frame production can fill the pipe.
  finished.catch(() => {});
  console.log(`Export ${duration.toFixed(2)} seconds at 1920 × 1080 and ${fps} FPS.`);
  for (let frame = 0; frame < frames; frame += 10) {
    if (processError || encoder.exitCode !== null) throw new Error(encoderError || processError?.message || 'FFmpeg stopped before the export finished.');
    const images = await page.evaluate(({ first, count, fps, start }) => {
      return Array.from({ length: count }, (_, index) => window.musicVideo.frame(start + (first + index) / fps));
    }, { first: frame, count: Math.min(10, frames - frame), fps, start });
    for (const image of images) {
      if (!encoder.stdin.write(Buffer.from(image, 'base64'))) await once(encoder.stdin, 'drain');
    }
    if (frame % (fps * 10) === 0) console.log(`Exported ${Math.floor(frame / fps)} of ${Math.ceil(duration)} seconds.`);
  }
  encoder.stdin.end();
  await finished;
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Created ${output}`);
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill('SIGTERM');
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
