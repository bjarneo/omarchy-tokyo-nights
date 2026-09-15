const QUESTS = Object.freeze([
  {
    id: 'tour',
    title: 'FIRST NIGHT',
    giver: 'mihai',
    hint: 'Talk to the host, visit five areas, then play one club game.',
    steps: Object.freeze(['TALK TO THE HOST', 'VISIT THE LOUNGE', 'VISIT AMIGA & 8-BIT', 'VISIT THE BBS CORNER', 'VISIT NINTENDO & SEGA', 'VISIT THE ARCADE ROW', 'PLAY ONE CLUB GAME']),
  },
  {
    id: 'byte',
    title: 'BYTE HUNT',
    giver: 'erik-melton',
    hint: 'Find BYTE in the security room, open its panel, then quarantine it.',
    steps: Object.freeze(['FIND BYTE', 'OPEN THE BYTE PANEL', 'QUARANTINE BYTE']),
  },
  {
    id: 'poster',
    title: 'POSTER COMMISSION',
    giver: 'baris-girismen',
    hint: 'Set palette, type, layout, and icon, then view the easel.',
    steps: Object.freeze(['SET PALETTE', 'SET TYPE', 'SET LAYOUT', 'SET ICON', 'VIEW THE EASEL']),
  },
  {
    id: 'mixtape',
    title: 'MIXTAPE MAKER',
    giver: 'spencer',
    hint: 'Queue three jukebox tracks, then play one track for ten seconds.',
    steps: Object.freeze(['QUEUE 3 TRACKS', 'PLAY ONE TRACK 10S']),
  },
  {
    id: 'score',
    title: 'HIGH SCORE HERO',
    giver: 'tobi',
    hint: 'Score 500 in Star Patrol, 200 in Brick Break, 30 in Snake, or win Pong.',
    steps: Object.freeze(['SET A CLUB HIGH SCORE']),
  },
  {
    id: 'signal',
    title: 'NIGHT SIGNAL',
    giver: 'hancore',
    hint: 'Dial the BBS, read the bulletin, then change the MIDI pattern.',
    steps: Object.freeze(['DIAL THE BBS', 'READ THE BULLETIN', 'CHANGE MIDI PATTERN']),
  },
  {
    id: 'premiere',
    title: 'ROOFTOP PREMIERE',
    giver: 'nira',
    hint: 'Ride the elevator to the roof, watch the trailer, then use the telescope.',
    steps: Object.freeze(['REACH THE ROOF', 'WATCH THE TRAILER', 'USE THE TELESCOPE']),
  },
]);

export function questList() {
  return QUESTS.map((quest) => ({ ...quest, steps: [...quest.steps] }));
}

export function questById(id) {
  return QUESTS.find((quest) => quest.id === id) || null;
}

function blankProgress() {
  return Object.fromEntries(QUESTS.map((quest) => [quest.id, { started: false, done: false, steps: quest.steps.map(() => false), stampTime: 0 }]));
}

export function sanitizeQuestSave(raw) {
  const clean = blankProgress();
  if (!raw || typeof raw !== 'object') return clean;
  for (const quest of QUESTS) {
    const entry = raw[quest.id];
    if (!entry || typeof entry !== 'object') continue;
    clean[quest.id].started = entry.started === true;
    clean[quest.id].done = entry.done === true;
    if (Array.isArray(entry.steps)) {
      clean[quest.id].steps = quest.steps.map((_, i) => entry.steps[i] === true);
    }
    const stamp = Number(entry.stampTime);
    clean[quest.id].stampTime = Number.isFinite(stamp) && stamp > 0 ? stamp : 0;
    if (clean[quest.id].done) clean[quest.id].started = true;
  }
  return clean;
}

export class ClubQuests {
  constructor({ save = null, now = () => Date.now(), onChange = () => {} } = {}) {
    this.now = now;
    this.onChange = onChange;
    this.progress = sanitizeQuestSave(save);
  }

  load(save) {
    this.progress = sanitizeQuestSave(save);
    this.onChange(this.progress);
  }

  snapshot() {
    return sanitizeQuestSave(this.progress);
  }

  status(id) {
    return this.progress[id] || null;
  }

  start(id) {
    const entry = this.progress[id];
    if (!entry || entry.done) return false;
    if (!entry.started) { entry.started = true; this.onChange(this.progress); return true; }
    return false;
  }

  completeStep(id, index) {
    const entry = this.progress[id];
    const quest = questById(id);
    if (!entry || !quest || !entry.started || entry.done) return null;
    if (!Number.isInteger(index) || index < 0 || index >= quest.steps.length) return null;
    if (entry.steps[index]) return null;
    entry.steps[index] = true;
    let done = false;
    if (entry.steps.every(Boolean)) { entry.done = true; entry.stampTime = this.now(); done = true; }
    this.onChange(this.progress);
    return { quest, step: quest.steps[index], stepIndex: index, done, count: entry.steps.filter(Boolean).length, total: quest.steps.length };
  }

  reset(id) {
    const quest = questById(id);
    if (!quest) return false;
    this.progress[id] = { started: false, done: false, steps: quest.steps.map(() => false), stampTime: 0 };
    this.onChange(this.progress);
    return true;
  }

  active() {
    return QUESTS.filter((quest) => this.progress[quest.id].started && !this.progress[quest.id].done).map((quest) => quest.id);
  }
}
