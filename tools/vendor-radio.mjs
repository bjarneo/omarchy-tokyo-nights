import { writeFile } from 'node:fs/promises';
import { normalizeRadioCatalog, RADIO_CATALOG_URL } from '../src/radio-catalog.mjs';

const response = await fetch(RADIO_CATALOG_URL, { signal: AbortSignal.timeout(20_000) });
if (!response.ok) throw new Error(`The radio catalog request fails: ${response.status}`);
const tracks = normalizeRadioCatalog(await response.json());
for (let i = 0; i < tracks.length; i += 5) {
  await Promise.all(tracks.slice(i, i + 5).map(async (track) => {
    const audio = await fetch(track.url, { method: 'HEAD', signal: AbortSignal.timeout(20_000) });
    if (!audio.ok || !audio.headers.get('content-type')?.startsWith('audio/')) throw new Error(`The radio track is unavailable: ${track.url}`);
  }));
}
const source = { url: RADIO_CATALOG_URL, checkedAt: new Date().toISOString() };
await writeFile(new URL('../assets/radio-tracks.js', import.meta.url), `export const RADIO_SOURCE = Object.freeze(${JSON.stringify(source, null, 2)});\n\nexport const RADIO_TRACKS = Object.freeze(${JSON.stringify(tracks, null, 2)}.map(Object.freeze));\n`);
console.log(`Verified and saved ${tracks.length} Omarchy Radio tracks.`);
