import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createStaticServer } from './server.mjs';
import { SHORTS, shortFocus, shortLayout, shortLyrics } from '../src/shorts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const value = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
const source = resolve(root, value('--source', 'exports/omarchy-tokyo-nights.mp4'));
const directory = resolve(root, value('--output-dir', 'exports/shorts'));
const only = value('--only', null);
const durationLimit = Number(value('--duration', 'Infinity'));
const clips = SHORTS.filter((clip) => !only || clip.id === only);
if (!clips.length || !(durationLimit > 0)) throw new Error('Choose a valid short ID and a positive duration.');
const input = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', source]));
const video = input.streams.find((stream) => stream.codec_type === 'video');
if (video?.width !== 1920 || video?.height !== 1080) throw new Error('Use the completed 1920 × 1080 music video as the source.');
const cues = JSON.parse(await readFile(resolve(root, 'assets/song-cues.json'), 'utf8'));
const analysis = JSON.parse(await readFile(resolve(root, 'assets/song-analysis.json'), 'utf8'));
await mkdir(directory, { recursive: true });
const temporary = await mkdtemp(join(directory, '.render-'));
const server = createStaticServer();
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
let browser;
let encoder;

function timestamp(seconds) {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}

try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/music-video.html?export`);
  await page.waitForFunction(() => window.videoReady || window.videoError);
  const error = await page.evaluate(() => window.videoError);
  if (error) throw new Error(error);
  const manifest = [];
  for (const original of clips) {
    const clip = { ...original, end: Math.min(original.end, original.start + durationLimit) };
    const duration = clip.end - clip.start;
    const frames = Math.ceil(duration * 30);
    const output = join(directory, `${clip.id}.mp4`);
    if (!args.includes('--overwrite') && await stat(output).then(() => true, () => false)) {
      throw new Error(`${clip.id}.mp4 already exists. Use --overwrite to replace it.`);
    }
    const layout = shortLayout(clip);
    const commands = Array.from({ length: frames }, (_, index) =>
      `${(index / 30).toFixed(6)} crop@focus x ${shortFocus(clip.start + index / 30, clip, cues, analysis)};`
    ).join('\n');
    const commandName = `${clip.id}-crop.txt`;
    await writeFile(join(temporary, commandName), commands);
    await page.evaluate(async ({ clip, cues }) => {
      const { ShortsOverlay } = await import('/src/shorts-overlay.js');
      window.shortOverlay = new ShortsOverlay(clip, cues);
    }, { clip, cues });
    const fadeOut = Math.max(0, duration - .16).toFixed(6);
    const filters = [
      `[0:v]fps=30,setpts=PTS-STARTPTS,sendcmd=f=${commandName},crop@focus=${layout.cropWidth}:888:0:60,scale=1080:${layout.height}:flags=neighbor,pad=1080:1920:0:${layout.y}:color=0x16161e[art]`,
      `[art][1:v]overlay=0:0:shortest=1:format=auto,format=yuv420p,fade=t=in:st=0:d=0.06,fade=t=out:st=${fadeOut}:d=0.16[out]`,
    ].join(';');
    encoder = spawn('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', args.includes('--overwrite') ? '-y' : '-n',
      '-ss', clip.start.toFixed(6), '-t', duration.toFixed(6), '-i', source,
      '-f', 'image2pipe', '-framerate', '30', '-vcodec', 'png', '-i', 'pipe:0',
      '-filter_complex', filters, '-map', '[out]', '-map', '0:a:0',
      '-af', `asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.025,afade=t=out:st=${Math.max(0, duration - .1).toFixed(6)}:d=0.1`,
      '-t', duration.toFixed(6), '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-threads', '4',
      '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', '-map_metadata', '-1', output,
    ], { cwd: temporary, stdio: ['pipe', 'inherit', 'pipe'] });
    let encoderError = '';
    let processError;
    encoder.stderr.on('data', (chunk) => { encoderError += chunk; });
    encoder.stdin.on('error', (error) => { processError = error; });
    encoder.on('error', (error) => { processError = error; });
    const finished = new Promise((resolve, reject) => {
      encoder.once('error', reject);
      encoder.once('close', (code) => code === 0 ? resolve() : reject(new Error(encoderError || `FFmpeg exited with code ${code}.`)));
    });
    finished.catch(() => {});
    console.log(`Export ${clip.id}: ${duration.toFixed(2)} seconds at 1080 × 1920.`);
    for (let frame = 0; frame < frames; frame += 8) {
      if (processError || encoder.exitCode !== null) throw new Error(encoderError || processError?.message || 'FFmpeg stopped before the short finished.');
      const overlays = await page.evaluate(({ first, count }) => {
        return Array.from({ length: count }, (_, index) => window.shortOverlay.render((first + index) / 30));
      }, { first: frame, count: Math.min(8, frames - frame) });
      for (const overlay of overlays) {
        if (!encoder.stdin.write(Buffer.from(overlay, 'base64'))) await once(encoder.stdin, 'drain');
      }
    }
    encoder.stdin.end();
    await finished;
    const lyrics = shortLyrics(clip, cues);
    const srt = lyrics.map((line, index) => `${index + 1}\n${timestamp(line.start)} --> ${timestamp(line.end)}\n${line.text}`).join('\n\n');
    await writeFile(join(directory, `${clip.id}.srt`), `${srt}\n`);
    manifest.push({ file: `${clip.id}.mp4`, title: clip.title.join(' '), sourceStart: clip.start, sourceEnd: clip.end, duration: Number(duration.toFixed(3)), width: 1080, height: 1920, fps: 30 });
    console.log(`Created ${output}`);
  }
  await writeFile(join(directory, only ? `${only}.json` : 'shorts.json'), `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill('SIGTERM');
  await browser?.close();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
