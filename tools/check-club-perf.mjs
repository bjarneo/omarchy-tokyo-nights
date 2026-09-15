import { readFile } from 'node:fs/promises';
import { STATIONS, CLUB_CREW, ZONES } from '../src/club-data.mjs';
import { PERF_BUDGETS } from '../src/club-quality.mjs';

const files = [
  'src/club-scene.js',
  'src/club-room.js',
  'src/club-main.js',
  'src/club-screens.js',
  'src/club-engine.mjs',
];

const failures = [];
if (STATIONS.length < 39) failures.push(`station count ${STATIONS.length} is below 39`);
if (CLUB_CREW.length < 37) failures.push(`crew count ${CLUB_CREW.length} is below 37`);
if (ZONES.length < 11) failures.push(`zone count ${ZONES.length} is below 11`);
if (!(PERF_BUDGETS.low.calls < PERF_BUDGETS.high.calls)) failures.push('low call budget must stay below high');

for (const file of files) {
  const text = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  if (text.length > 60000) failures.push(`${file} exceeds 60KB (${text.length} bytes)`);
}

const scene = await readFile(new URL('../src/club-scene.js', import.meta.url), 'utf8');
for (const token of ['updateScreens', 'updateAvatars', 'comfort', 'dwell', 'smoothTurn']) {
  if (!scene.includes(token)) failures.push(`club-scene.js misses ${token}`);
}
const main = await readFile(new URL('../src/club-main.js', import.meta.url), 'utf8');
for (const token of ['ClubQuests', 'ClubElevator', 'ClubQuality', 'walkSpeed', 'pulseControllers']) {
  if (!main.includes(token)) failures.push(`club-main.js misses ${token}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`club perf check passed: ${STATIONS.length} stations, ${CLUB_CREW.length} crew, ${ZONES.length} zones`);
