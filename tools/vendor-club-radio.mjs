import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = process.env.CLUB_RADIO_SOURCE || fileURLToPath(new URL('../../radio.omarchy.org/public/tracks/', import.meta.url));
const destination = new URL('../assets/radio/', import.meta.url);
const bytes = await readFile(resolve(source, 'playlist.json'));
const playlist = JSON.parse(bytes);
const hash = (data) => createHash('sha256').update(data).digest('hex');
const files = new Set((await readdir(source)).filter((name) => name.endsWith('.mp3')));
const seen = new Set();
if (!playlist.tracks?.length) throw new Error('The source playlist is empty.');
const tracks = [];
for (const track of playlist.tracks) {
  if (!/^[a-z0-9-]+\.mp3$/.test(track.file) || seen.has(track.file) || !track.title?.trim() || !track.artist?.trim()) throw new Error('The source playlist contains an invalid track.');
  seen.add(track.file);
  const audio = await readFile(resolve(source, track.file));
  tracks.push({ ...track, id: track.file.slice(0, -4), bytes: audio.length, sha256: hash(audio) });
}
if (files.size !== seen.size || [...files].some((name) => !seen.has(name))) throw new Error('The source MP3 files and playlist do not match.');
await mkdir(destination, { recursive: true });
for (const track of tracks) await copyFile(resolve(source, track.file), new URL(track.file, destination));
const provenance = { url: 'https://radio.omarchy.org/tracks/playlist.json', sha256: hash(bytes) };
await writeFile(new URL('playlist.json', destination), `${JSON.stringify({ ...playlist, source: provenance, tracks }, null, 2)}\n`);
await writeFile(new URL('../assets/club-radio.js', import.meta.url), `export const CLUB_RADIO_SOURCE = Object.freeze(${JSON.stringify(provenance, null, 2)});\n\nexport const CLUB_TRACKS = Object.freeze(${JSON.stringify(tracks, null, 2)}.map(Object.freeze));\n`);
await writeFile(new URL('README.md', destination), `# Club radio library\n\nThese ${tracks.length} MP3 files come from the Omarchy Radio source playlist.\nThe import preserves track order, titles, artist credits, and explicit-content flags.\n\nSource: https://radio.omarchy.org/tracks/playlist.json\n\nThe playlist records SHA-256 hashes for the source playlist and each audio file.\nArtist credits remain attached to their tracks. This import does not change the tracks' rights.\n\nTo refresh the files from the sibling radio checkout, run:\n\n\x60\x60\x60bash\nnpm run assets:club-radio\n\x60\x60\x60\n\nTo use another source directory, run:\n\n\x60\x60\x60bash\nCLUB_RADIO_SOURCE=/path/to/public/tracks npm run assets:club-radio\n\x60\x60\x60\n`);
console.log(`Imported ${tracks.length} local radio tracks with source credits and SHA-256 hashes.`);
