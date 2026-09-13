export const RADIO_SITE = 'https://radio.omarchy.org/';
export const RADIO_CATALOG_URL = `${RADIO_SITE}tracks/playlist.json`;

export function normalizeRadioCatalog(catalog) {
  if (!Array.isArray(catalog?.tracks) || !catalog.tracks.length) throw new Error('The radio playlist is empty.');
  const seen = new Set();
  return catalog.tracks.map((track) => {
    if (typeof track.title !== 'string' || !track.title.trim() || typeof track.artist !== 'string' || !track.artist.trim()) throw new Error('A radio track needs a title and artist.');
    if (!track.url && (typeof track.file !== 'string' || !track.file.toLowerCase().endsWith('.mp3') || /[\\/]/.test(track.file))) throw new Error('A radio track needs a valid audio file.');
    const url = new URL(track.url || `tracks/${encodeURIComponent(track.file)}`, RADIO_SITE);
    if (url.protocol !== 'https:' || url.username || url.password || seen.has(url.href)) throw new Error('A radio track has an invalid or duplicate URL.');
    seen.add(url.href);
    return { id: track.file || url.href, title: track.title.trim(), artist: track.artist.trim(), url: url.href, explicit: track.explicit === true };
  });
}

export function radioIndex(index, length) {
  if (!length || !Number.isFinite(index)) return 0;
  return ((Math.trunc(index) % length) + length) % length;
}

export function radioTime(seconds) {
  const time = Math.max(0, Number.isFinite(seconds) ? Math.floor(seconds) : 0);
  return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
}
