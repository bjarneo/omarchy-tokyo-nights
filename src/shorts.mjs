import { clamp, roadCurve } from './engine.mjs';
import { frameAt } from './song.mjs';

export const SHORTS = [
  { id: '01-neon-on-yellow', title: ['NEON', 'ON YELLOW'], start: 65.74, end: 93.24, accent: '#ffd578' },
  { id: '02-rain-on-the-asphalt', title: ['RAIN ON', 'THE ASPHALT'], start: 38.92, end: 65.74, accent: '#f7768e' },
  { id: '03-midnight-phantom', title: ['MIDNIGHT', 'PHANTOM'], start: 138.74, end: 158.89, accent: '#bb9af7' },
  { id: '04-four-am-run', title: ['4 AM', 'EXPRESSWAY'], start: 159.50, end: 172.40, accent: '#7dcfff' },
  { id: '05-tokyo-bay-sunrise', title: ['TOKYO BAY', 'SUNRISE'], start: 172.40, end: 196.22, accent: '#e0af68' },
];

export function shortLayout(clip) {
  const sunrise = clip.id === '05-tokyo-bay-sunrise';
  return { cropWidth: sunrise ? 1260 : 900, height: sunrise ? 762 : 1066, y: sunrise ? 504 : 352 };
}

export function shortFocus(time, clip, cues, analysis) {
  if (clip.id === '05-tokyo-bay-sunrise') return 168;
  const frame = frameAt(time, cues, analysis);
  let center;
  if (frame.shot === 'side' || frame.shot === 'close') {
    const scale = frame.shot === 'close' ? 2.65 : 1.85;
    const x = frame.shot === 'close' ? 70 : 148 + Math.sin(time * .7) * 12;
    center = x + 90 * scale;
  } else if (frame.shot === 'cockpit') center = 320;
  else {
    const focalLength = frame.shot === 'rear' ? 68 : frame.shot === 'wide' ? 43 : 52 - frame.pulse * 4;
    const scale = 1 / (1 + 14.8 / focalLength);
    const curve = roadCurve((frame.distance * 1.85 + 14.8 * .55) / 1.85);
    center = 320 + curve * 640 * .27 * (1 - scale) ** 2 + frame.playerX * 640 * .32 * scale;
  }
  return Math.round(clamp(center * 3 - 450, 0, 1020) / 2) * 2;
}

export function shortLyrics(clip, cues) {
  return cues.lyrics.filter((line) => line.end > clip.start && line.start < clip.end).map((line) => ({
    ...line,
    start: Math.max(0, line.start - clip.start),
    end: Math.min(clip.end - clip.start, line.end - clip.start),
    words: line.words.map((word) => ({ ...word, start: word.start - clip.start, end: word.end - clip.start })),
  }));
}
