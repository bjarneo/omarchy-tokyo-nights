export const CLUB_BARKS = Object.freeze({
  host: ['The checker ball runs all night.', 'Try the lounge jukebox.', 'The crew loves questions.'],
  default: ['Welcome to the club.', 'Try any machine.', 'Stay for another game.'],
});

const lastBark = new Map();

export function barkFor(id, now = Date.now(), cooldownMs = 25000) {
  const lines = CLUB_BARKS[id] || CLUB_BARKS.default;
  const last = lastBark.has(id) ? lastBark.get(id) : null;
  if (last !== null && now - last < cooldownMs) return null;
  const line = lines[Math.floor((now / 1000) % lines.length)];
  lastBark.set(id, now);
  return line;
}

export function resetBarks() {
  lastBark.clear();
}
