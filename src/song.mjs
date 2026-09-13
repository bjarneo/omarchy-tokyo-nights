import { clamp } from './engine.mjs';

export const SONG = {
  title: 'Omarchy Tokyo Nights',
  artist: 'Bjarne Oeverli',
  audio: 'assets/omarchy-tokyo-nights.mp3',
};

const SHOTS = [
  ['city', 'side'], ['city', 'wide'], ['city', 'close'], ['city', 'cockpit'],
  ['expressway', 'chase'], ['bridge', 'wide'], ['city', 'rear'], ['city', 'chase'],
  ['city', 'side'], ['city', 'chase'], ['city', 'close'], ['expressway', 'rear'],
  ['shibuya', 'wide'], ['shibuya', 'side'], ['expressway', 'cockpit'], ['bridge', 'chase'],
  ['alley', 'wide'], ['alley', 'rear'], ['expressway', 'cockpit'], ['alley', 'side'],
  ['shibuya', 'close'], ['shibuya', 'side'], ['city', 'rear'], ['shibuya', 'chase'],
  ['shibuya', 'side'], ['shibuya', 'chase'], ['city', 'close'], ['expressway', 'rear'],
  ['shibuya', 'wide'], ['city', 'side'], ['expressway', 'cockpit'], ['bridge', 'chase'],
  ['tunnel', 'chase'], ['tunnel', 'rear'], ['tunnel', 'cockpit'], ['bridge', 'wide'],
  ['bay', 'wide'], ['bay', 'side'], ['bay', 'close'], ['bay', 'wide'],
];

export function indexAt(items, time, key = 'start') {
  let low = 0;
  let high = items.length - 1;
  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (items[mid][key] <= time) low = mid + 1;
    else high = mid - 1;
  }
  return high;
}

function sample(values, time, step) {
  const position = clamp(time / step, 0, values.length - 1);
  const index = Math.floor(position);
  return values[index] + ((values[index + 1] ?? values[index]) - values[index]) * (position - index);
}

export function frameAt(time, cues, analysis, reducedMotion = false) {
  time = Math.round(clamp(Number.isFinite(time) ? time : 0, 0, cues.duration) * 1000) / 1000;
  const sectionIndex = Math.max(0, indexAt(cues.sections, time));
  const section = cues.sections[sectionIndex];
  const lyricIndex = indexAt(cues.lyrics, time);
  const lastLyric = cues.lyrics[lyricIndex];
  const lyric = lastLyric && time < lastLyric.end ? lastLyric : null;
  const chorus = section.id.startsWith('chorus');
  const outro = section.id === 'outro';
  const intro = section.id === 'intro';
  const instrumental = !lyric && lastLyric && time > lastLyric.end + 1;
  let [scene, shot] = SHOTS[Math.max(0, lyricIndex)];
  let shotStart = lastLyric?.start ?? 0;
  if (intro) {
    const passage = time < 16 ? Math.floor(time / 8) : 2 + Math.floor((time - 16) / 4);
    scene = passage === 4 || passage === 6 ? 'bridge' : 'city';
    shot = ['side', 'wide', 'rear', 'cockpit', 'chase', 'close', 'wide', 'chase'][passage % 8];
    shotStart = passage < 2 ? passage * 8 : 16 + (passage - 2) * 4;
  } else if (instrumental && !outro) {
    const passage = Math.floor((time - lastLyric.end) / 4);
    scene = passage % 2 ? 'bridge' : 'city';
    shot = ['chase', 'side', 'wide', 'rear'][passage % 4];
    shotStart = lastLyric.end + passage * 4;
  }
  const bass = sample(analysis.bass, time, analysis.step);
  const energy = sample(analysis.energy, time, analysis.step);
  // Numeric accents use a separate binary search to avoid per-frame allocations.
  let left = 0;
  let right = analysis.accents.length;
  while (left < right) {
    const middle = (left + right) >>> 1;
    if (analysis.accents[middle] <= time) left = middle + 1;
    else right = middle;
  }
  const sinceBeat = time - (analysis.accents[left - 1] ?? -10);
  const pulse = reducedMotion ? 0 : Math.exp(-sinceBeat * 11) * bass;
  const outroTime = Math.max(0, time - (cues.sections.find((item) => item.id === 'outro')?.start ?? cues.duration));
  const speed = outro ? 250 * Math.max(0, 1 - outroTime / 5) : intro ? 140 + time * 6 : chorus ? 380 + bass * 80 : 270 + energy * 65;
  const parkedAt = cues.sections.find((item) => item.id === 'outro')?.start ?? cues.duration;
  let distance = 390;
  for (const part of cues.sections) {
    if (part.start >= Math.min(time, parkedAt)) break;
    const rate = part.id.startsWith('chorus') ? 115 : part.id === 'intro' ? 64 : 82;
    distance += (Math.min(time, part.end, parkedAt) - part.start) * rate;
  }
  if (outro) distance += Math.min(outroTime, 5) * 70 - Math.min(outroTime, 5) ** 2 * 7;
  return {
    time, section, sectionIndex, lyric, lyricIndex, scene, shot, shotStart,
    shotTime: Math.max(0, time - shotStart), chorus, intro, outro, outroTime,
    bass, energy, pulse, speed, distance, reducedMotion,
    boosting: !outro && !intro && (chorus ? bass > .38 : bass > .79),
    playerX: reducedMotion ? 0 : Math.sin(time * .38) * .38,
    dawn: outro ? clamp(outroTime / 12, 0, 1) : 0,
    fade: clamp((cues.duration - time) / 3, 0, 1),
  };
}

export function formatTime(time) {
  const seconds = Math.max(0, Math.floor(time || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
