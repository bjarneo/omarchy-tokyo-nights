import { CLUB, ENTRY, FLOORS, OBSTACLES, STATIC_OBSTACLES, STATIONS, CLUB_OBJECTS, ZONES, zoneAt } from './club-data.mjs';
import { CabinetGame } from './club-games.mjs';
import { createClubCrew, updateClubCrew } from './club-motion.mjs';
import { SECURITY_LABS, createLabState, chooseLab, labPanel, createVirus, updateVirus, quarantineVirus } from './club-security.mjs';
import { createDesignState, selectDesign, designPanel } from './club-design.mjs';
import { MAC_MODES } from './club-mac.mjs';
import { RANGER_CONTROLS } from './club-rangers.mjs';

export function canStand(x, z, obstacles = OBSTACLES, radius = CLUB.radius) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const edge = radius + .18;
  for (const dx of [-edge, edge]) for (const dz of [-edge, edge]) {
    if (!FLOORS.some((floor) => Math.abs(x + dx - floor.x) <= floor.width / 2 && Math.abs(z + dz - floor.z) <= floor.depth / 2)) return false;
  }
  return !obstacles.some((item) => (item.bottom || 0) < CLUB.playerHeight && Math.abs(x - item.x) < item.width / 2 + radius && Math.abs(z - item.z) < item.depth / 2 + radius);
}

export function moveWithinRoom(position, dx, dz, obstacles = OBSTACLES, radius = CLUB.radius) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / .1));
  let { x, z } = position;
  for (let i = 0; i < steps; i++) {
    if (canStand(x + dx / steps, z, obstacles, radius)) x += dx / steps;
    if (canStand(x, z + dz / steps, obstacles, radius)) z += dz / steps;
  }
  return { x, z };
}

export function segmentHitsBox(a, b, box) {
  let near = 0; let far = 1;
  const minimum = [box.x - box.width / 2, box.bottom || 0, box.z - box.depth / 2];
  const maximum = [box.x + box.width / 2, box.height, box.z + box.depth / 2];
  for (const [i, axis] of ['x', 'y', 'z'].entries()) {
    const delta = b[axis] - a[axis];
    if (Math.abs(delta) < .000001) { if (a[axis] < minimum[i] || a[axis] > maximum[i]) return false; }
    else {
      const p = (minimum[i] - a[axis]) / delta; const q = (maximum[i] - a[axis]) / delta;
      near = Math.max(near, Math.min(p, q)); far = Math.min(far, Math.max(p, q));
      if (near > far) return false;
    }
  }
  return true;
}

export function teleportArc(origin, direction, obstacles = OBSTACLES) {
  const points = [{ ...origin }];
  let previous = origin;
  for (let i = 1; i <= 48; i++) {
    const t = i * .04;
    const next = { x: origin.x + direction.x * 7 * t, y: origin.y + direction.y * 7 * t - 4.9 * t * t, z: origin.z + direction.z * 7 * t };
    if (next.y < .025) {
      const amount = (previous.y - .025) / (previous.y - next.y);
      const point = { x: previous.x + (next.x - previous.x) * amount, y: .025, z: previous.z + (next.z - previous.z) * amount };
      points.push(point);
      const blocked = obstacles.some((box) => segmentHitsBox(previous, point, box));
      return { points, point, valid: !blocked && canStand(point.x, point.z, obstacles) };
    }
    points.push(next);
    if (next.y > CLUB.height - .1 || obstacles.some((box) => segmentHitsBox(previous, next, box))) return { points, point: next, valid: false };
    previous = next;
  }
  return { points, point: previous, valid: false };
}

export const CLUB_INTERACT_RANGE = 3;

export class ClubGame {
  constructor({ onChange = () => {}, onEvent = () => {}, best = {} } = {}) {
    this.onChange = onChange; this.onEvent = onEvent;
    this.state = 'entry'; this.previousState = 'explore'; this.position = { ...ENTRY };
    this.devices = Object.fromEntries(STATIONS.map((station) => [station.id, { power: station.kind !== 'malibu', mode: station.initial, clock: 0, online: false, pattern: 0, pixels: [], typed: ['', ''], muted: false, ...(station.lab ? { lab: createLabState() } : {}) }]));
    this.best = Object.fromEntries(['star', 'brick', 'snake', 'pong'].map((id) => { const value = Number(best?.[id]); return [id, Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0]; }));
    this.selected = null; this.reply = ''; this.arcade = null; this.revision = 0;
    this.elapsed = 0;
    this.songPlaying = false; this.songPending = false;
    this.crew = createClubCrew();
    this.met = new Set();
    this.posts = [];
    this.badges = {};
    this.sketchSlots = [[], [], []]; this.sketchSlot = 0; this.sketchColor = 0;
    this.telescopeUntil = 0;
    this.visitedZones = new Set();
    this.jukeboxSeconds = 0;
    this.obstacles = [...STATIC_OBSTACLES, ...this.crew.map((npc) => npc.obstacle)];
    this.crew.forEach((npc) => { npc.avoid = this.obstacles.filter((box) => box.id !== npc.id); });
    this.clearSpaces = [...ZONES.map((zone) => zone.beacon), ...STATIONS.map((station) => station.stand), ...CLUB_OBJECTS.map((object) => object.stand)];
    this.dialogueSpace = null;
    this.virus = createVirus();
    this.design = createDesignState();
    this.INTERACT_RANGE = CLUB_INTERACT_RANGE;
  }

  changed() { if (this.state !== 'talk') this.dialogueSpace = null; this.revision++; this.onChange(this); }
  enter() { if (this.state === 'entry') { this.state = 'explore'; this.changed(); } }
  pause() { if (this.state !== 'paused' && this.state !== 'entry') { this.previousState = this.state; this.state = 'paused'; this.changed(); } }
  resume() { if (this.state === 'paused') { this.state = this.previousState; this.changed(); } }
  back() { if (this.state === 'paused') this.resume(); else if (this.state === 'explore') this.pause(); else if (this.state !== 'entry') { this.state = 'explore'; this.arcade = null; this.changed(); } }
  map() {
    if (this.state === 'map') this.back();
    else if (this.state === 'paused') { this.previousState = 'explore'; this.state = 'map'; this.arcade = null; this.changed(); }
    else if (this.state !== 'entry') { this.state = 'map'; this.arcade = null; this.changed(); }
  }

  interact(id, player = this.position) {
    if (this.state !== 'explore' && this.state !== 'sketch') return false;
    const target = this.crew.find((item) => item.id === id) || STATIONS.find((item) => item.id === id) || CLUB_OBJECTS.find((item) => item.id === id) || (id === this.virus.id ? this.virus : null);
    if (!target || Math.hypot(target.x - player.x, target.z - player.z) > CLUB_INTERACT_RANGE) return false;
    const from = { x: player.x, y: player.y ?? CLUB.eyeHeight, z: player.z };
    const to = { x: target.x, y: target.eyeHeight || target.height, z: target.z };
    if (this.obstacles.some((box) => box.id !== id && segmentHitsBox(from, to, box))) return false;
    this.selected = target;
    this.state = target.topics ? 'talk' : 'device';
    this.reply = target.greeting || target.detail;
    if (target.topics) this.met.add(target.id);
    this.changed();
    this.onEvent({ type: 'interact', target, text: this.reply });
    return true;
  }

  action(id) {
    if (id === 'explore') { if (this.state === 'paused') this.resume(); else { this.state = 'explore'; this.changed(); } return; }
    if (id === 'back') { this.back(); return; }
    if (id === 'pause') { this.pause(); return; }
    if (id === 'map') { this.map(); return; }
    if (id.startsWith('zone:')) {
      const zone = ZONES.find((item) => item.id === id.slice(5));
      if (zone && canStand(zone.beacon.x, zone.beacon.z, this.obstacles)) { this.position = { ...zone.beacon }; this.state = 'explore'; this.changed(); this.onEvent({ type: 'teleport', position: this.position }); }
      return;
    }
    if (id.startsWith('topic:') && this.state === 'talk') {
      const topic = this.selected.topics[Number(id.slice(6))];
      if (topic) { this.reply = topic[1]; this.changed(); this.onEvent({ type: 'speech', target: this.selected, text: this.reply }); }
      return;
    }
    if (id === 'guide:controls' && this.state === 'talk' && this.selected?.team === 'rangers') {
      this.reply = RANGER_CONTROLS; this.changed(); this.onEvent({ type: 'speech', target: this.selected, text: this.reply }); return;
    }
    if (id.startsWith('mac:') && this.state === 'device' && this.selected?.mac) {
      const mode = `mac-${id.slice(4)}`;
      if (MAC_MODES.includes(mode)) {
        const device = this.devices[this.selected.id]; device.mode = mode; device.power = true; device.clock = 0;
        this.state = 'explore'; this.changed();
      }
      return;
    }
    if (id.startsWith('design:') && this.state === 'device' && this.selected?.studio) {
      const [, field, index] = id.split(':');
      if (field === this.selected.studio && selectDesign(this.design, field, Number(index))) {
        this.changed(); this.onEvent({ type: 'beep', target: this.selected });
        this.onEvent({ type: 'speech', target: this.selected, text: this.panel().subtitle });
        const questStep = { palette: 0, type: 1, layout: 2, icon: 3 }[field];
        if (questStep !== undefined) this.onEvent({ type: 'quest', quest: 'poster', step: questStep });
        this.onEvent({ type: 'design', design: this.design });
      }
      return;
    }
    if (id.startsWith('security:') && this.state === 'device' && this.selected?.lab) {
      const device = this.devices[this.selected.id];
      if (id === 'security:reset') device.lab = createLabState();
      else if (id.startsWith('security:choice:')) {
        const effect = chooseLab(SECURITY_LABS[this.selected.lab], device.lab, Number(id.slice(16)));
        if (effect === 'quarantine') quarantineVirus(this.virus);
        if (device.lab.complete) { this.badges[this.selected.lab] = true; this.onEvent({ type: 'badge', lab: this.selected.lab }); }
      } else return;
      this.changed(); this.onEvent({ type: 'beep', target: this.selected });
      this.onEvent({ type: 'speech', target: this.selected, text: this.panel().text });
      return;
    }
    if (id.startsWith('virus:') && this.state === 'device' && this.selected?.id === this.virus.id) {
      if (id === 'virus:quarantine') { quarantineVirus(this.virus); this.onEvent({ type: 'quest', quest: 'byte', step: 2 }); }
      else if (id === 'virus:release') Object.assign(this.virus, createVirus());
      else return;
      this.changed(); return;
    }
    if (id === 'start-game' && this.arcade) { this.arcade.reset(); this.arcade.start(); this.changed(); this.onEvent({ type: 'quest', quest: 'tour', step: 6 }); this.onEvent({ type: 'quest', quest: 'score', step: 0, armed: true }); return; }
    if (id.startsWith('game:') && this.selected && !this.selected.topics) {
      const kind = id.slice(5);
      if (!['star', 'brick', 'snake', 'pong'].includes(kind)) return;
      this.arcade = new CabinetGame(kind); this.state = 'arcade';
      this.devices[this.selected.id].power = true;
      this.devices[this.selected.id].mode = 'game';
      this.changed(); return;
    }
    if (id.startsWith('mode:') && this.selected && this.devices[this.selected.id]) {
      const mode = id.slice(5);
      const allowed = ['workbench', 'boing', 'starfield', 'copper', 'typein', 'basic', 'list', 'directory', 'spectrum', 'load', 'gem', 'midi', 'terminal', 'dial', 'messages', 'users', 'mac', 'sketch', 'console', 'coastal-desktop', 'coastal-view', 'telescope', 'trailer', 'leaderboard', 'snacks', 'lookout'];
      if (!allowed.includes(mode)) return;
      const device = this.devices[this.selected.id];
      device.power = true; device.mode = mode; device.clock = 0;
      if (mode === 'dial') { device.online = true; this.onEvent({ type: 'modem', target: this.selected }); this.onEvent({ type: 'quest', quest: 'signal', step: 0 }); }
      if (mode === 'messages') this.onEvent({ type: 'quest', quest: 'signal', step: 1 });
      if (mode === 'telescope') { this.telescopeUntil = this.elapsed + 5; this.onEvent({ type: 'quest', quest: 'premiere', step: 2 }); }
      if (mode === 'trailer') this.onEvent({ type: 'quest', quest: 'premiere', step: 1, armed: true });
      if (mode === 'midi' && !device.muted) { device.pattern = (device.pattern + 1) % 3; this.onEvent({ type: 'quest', quest: 'signal', step: 2 }); }
      this.state = mode === 'sketch' ? 'sketch' : 'explore';
      this.changed(); return;
    }
    if (id === 'power' && this.selected && this.devices[this.selected.id]) {
      const device = this.devices[this.selected.id]; device.power = !device.power; this.changed(); this.onEvent({ type: 'beep', target: this.selected });
    }
    if (id === 'midi-mute' && this.selected && this.devices[this.selected.id]) {
      const device = this.devices[this.selected.id]; device.muted = !device.muted; this.changed();
    }
    if (id === 'post' && this.selected) { this.onEvent({ type: 'bbs-post', target: this.selected }); this.changed(); }
    if (id.startsWith('sketch-slot:') && this.selected) { this.sketchSlot = Number(id.slice(12)) % 3; this.devices[this.selected.id].pixels = [...this.sketchSlots[this.sketchSlot]]; this.changed(); }
    if (id.startsWith('sketch-color:') && this.selected) { this.sketchColor = Number(id.slice(13)) % 4; this.changed(); }
    if (id === 'clear-sketch' && this.selected) { this.devices[this.selected.id].pixels = []; this.sketchSlots[this.sketchSlot] = []; this.changed(); }
  }

  sketch(u, v) {
    if (this.state !== 'sketch' || !this.selected) return;
    const cell = Math.max(0, Math.min(23, Math.floor(u * 24))) + Math.max(0, Math.min(17, Math.floor((1 - v) * 18))) * 24;
    const pixels = this.devices[this.selected.id].pixels;
    const index = pixels.findIndex((entry) => (entry.cell ?? entry) === cell);
    if (index < 0) pixels.push({ cell, color: this.sketchColor }); else pixels.splice(index, 1);
    this.sketchSlots[this.sketchSlot] = [...pixels];
    this.changed();
  }

  typeChar(char) {
    if (!this.selected || !this.devices[this.selected.id] || !/^[A-Z0-9 ]$/.test(char)) return false;
    const typed = this.devices[this.selected.id].typed;
    const line = typed[1].length < 24 ? 1 : 0;
    void line;
    if (typed[1].length < 24) typed[1] += char;
    else if (typed[0].length < 24) typed[0] = `${typed[0]}${char}`.slice(-24);
    this.changed();
    return true;
  }

  addPost(text) {
    const clean = String(text || '').replace(/[^\w .,!?'-]/g, '').trim().slice(0, 80);
    if (!clean) return false;
    this.posts.unshift({ text: clean, time: Date.now() });
    this.posts = this.posts.slice(0, 5);
    this.changed();
    return true;
  }

  update(dt, input = {}) {
    if (this.state === 'paused') return;
    updateClubCrew(this.crew, dt, {
      player: this.position, state: this.state, selectedId: this.selected?.id, reducedMotion: input.reducedMotion,
      canMove: (npc, x, z) => {
        if (Math.hypot(x - this.position.x, z - this.position.z) < 1.3 || !canStand(x, z, npc.avoid, CLUB.crewRadius)) return false;
        if (this.clearSpaces.some((point) => Math.abs(x - point.x) < .69 && Math.abs(z - point.z) < .60)) return false;
        const panel = this.dialogueSpace;
        return !panel || Math.abs(x - panel.x) >= panel.width / 2 + CLUB.crewRadius || Math.abs(z - panel.z) >= panel.depth / 2 + CLUB.crewRadius;
      },
    });
    if (this.state === 'entry') return;
    updateVirus(this.virus, dt, input.reducedMotion || this.state === 'device' && this.selected?.id === this.virus.id, (x, z) => canStand(x, z, STATIC_OBSTACLES, CLUB.crewRadius));
    if (this.design.motion && !input.reducedMotion) this.design.clock += Math.min(dt, .25);
    this.elapsed += Math.min(dt, .25);
    for (const device of Object.values(this.devices)) if (device.power) device.clock += Math.min(dt, .25);
    if (this.state === 'arcade' && this.arcade) {
      const previous = this.arcade.state;
      if (this.arcade.kind === 'snake') {
        if (Math.abs(input.x || 0) > .55) this.arcade.turn(Math.sign(input.x), 0);
        else if (Math.abs(input.z || 0) > .55) this.arcade.turn(0, Math.sign(input.z));
      }
      this.arcade.update(dt, input);
      if (previous === 'playing' && this.arcade.state !== 'playing') {
        this.best[this.arcade.kind] = Math.max(this.best[this.arcade.kind], this.arcade.score);
        this.onEvent({ type: 'score', best: this.best }); this.changed();
        const win = this.arcade.state === 'won';
        const qualifies = (this.arcade.kind === 'star' && this.arcade.score >= 500) || (this.arcade.kind === 'brick' && this.arcade.score >= 200) || (this.arcade.kind === 'snake' && this.arcade.score >= 30) || (this.arcade.kind === 'pong' && win);
        if (qualifies) this.onEvent({ type: 'quest', quest: 'score', step: 0 });
      }
    }
    if (this.jukebox?.playing && this.jukebox.queueStartCount >= 3) {
      this.jukeboxSeconds += Math.min(dt, .25);
      if (this.jukeboxSeconds >= 10) { this.onEvent({ type: 'quest', quest: 'mixtape', step: 1 }); this.jukeboxSeconds = -1e9; }
    }
    const zone = this.zone;
    if (zone && !this.visitedZones.has(zone.id)) {
      this.visitedZones.add(zone.id);
      const tourIndex = ['entry', 'amiga', 'bbs', 'console', 'arcade'].indexOf(zone.id);
      if (tourIndex >= 0) this.onEvent({ type: 'quest', quest: 'tour', step: tourIndex + 1 });
      if (zone.id === 'security' && this.virus && !this.virus.quarantined) this.onEvent({ type: 'quest', quest: 'byte', step: 0, armed: true });
    }
  }

  panel() {
    const option = (id, label) => ({ id, label });
    const songLabel = this.songPending ? 'CANCEL SONG LOAD' : this.songPlaying ? 'PAUSE SONG' : 'PLAY SONG';
    if (this.state === 'entry') return { title: 'THE MIDNIGHT CLUB', text: 'A large room full of computers, consoles, and the crew. Explore freely and try any machine.', options: [option('explore', 'ENTER THE ROOM'), option('map', 'ROOM MAP')] };
    if (this.state === 'paused') return { title: 'CLUB PAUSED', text: 'Resume your conversation, game, or walk through the room.', options: [option('explore', 'RESUME'), option('map', 'ROOM MAP'), option('song', songLabel), option('center', 'CENTER VIEW'), option('race', 'VR RACE & GARAGE'), option('exit', 'EXIT VR')] };
    if (this.state === 'map') return { title: 'THE CLUB MAP', text: 'Select an area to teleport there. You can also walk through the wide central aisles.', options: [...ZONES.map((zone) => option(`zone:${zone.id}`, zone.name)), option('back', 'CLOSE MAP')] };
    if (this.state === 'talk') return { title: this.selected.name.toUpperCase(), subtitle: `${this.selected.role.toUpperCase()}${this.selected.country ? ` · ${this.selected.country} · CAMEO` : ''}${this.met.has(this.selected.id) ? '' : ' · NEW'}`, text: this.reply, portrait: this.selected.id, layout: this.selected.team === 'rangers' ? 'guide' : undefined, options: [...this.selected.topics.map((topic, index) => option(`topic:${index}`, topic[0])), option('read', 'READ ALOUD'), ...(this.selected.team === 'rangers' ? [option('map', 'ROOM DIRECTORY'), option('guide:controls', 'MOVEMENT HELP')] : []), option('back', 'BACK TO THE ROOM')] };
    if (this.state === 'device') {
      const station = this.selected;
      if (station.software === 'elevator') return { title: 'THE CLUB ELEVATOR', subtitle: 'ROOM DIRECTORY · B1 · L1 · R1', text: station.detail, options: [option('floor:B1', 'BASEMENT ARCADE'), option('floor:L1', 'THE CLUB'), option('floor:R1', 'ROOFTOP CINEMA'), option('map', 'CHOOSE A ROOM'), option('back', 'BACK TO THE ROOM')] };
      if (station.software === 'design') return designPanel(station, this.design);
      if (station.software === 'security') return labPanel(station, this.devices[station.id]);
      if (station.software === 'virus') return { title: 'BYTE · LAB VIRUS', subtitle: this.virus.quarantined ? 'QUARANTINED' : 'PATROL ACTIVE', text: this.virus.quarantined ? 'BYTE stays inside the containment field. Release the simulated virus to resume its patrol through the security room.' : 'A pixel computer virus patrols the lab. Its body, eyes, and antennae are part of the room simulation. Quarantine BYTE to stop its patrol.', options: [option(this.virus.quarantined ? 'virus:release' : 'virus:quarantine', this.virus.quarantined ? 'RELEASE BYTE' : 'QUARANTINE BYTE'), option('back', 'BACK TO THE ROOM')] };
      if (station.software === 'jukebox' && this.jukebox) return this.jukebox.panel();
      const device = this.devices[station.id];
      let controls = [];
      if (station.software === 'amiga') controls = [option('mode:workbench', 'WORKBENCH'), option('mode:boing', 'CHECKER BALL'), option('mode:starfield', 'STARFIELD'), option('mode:copper', 'COPPER BARS')];
      else if (station.software === 'basic') controls = [option('mode:basic', 'BASIC PROMPT'), option('mode:typein', 'TYPE A LINE'), option('mode:list', 'LIST PROGRAM'), option('mode:starfield', 'RUN DEMO'), option('mode:directory', 'DISK DIRECTORY')];
      else if (station.software === 'spectrum') controls = [option('mode:load', 'LOAD A TAPE'), option('mode:spectrum', 'COLOR TEST')];
      else if (station.software === 'gem') controls = [option('mode:gem', 'GEM DESKTOP'), option('mode:midi', device.muted ? 'UNMUTE MIDI' : 'CHANGE MIDI PATTERN'), option('midi-mute', device.muted ? 'UNMUTE SOUND' : 'MUTE SOUND')];
      else if (station.software === 'bbs') controls = [option('mode:terminal', 'AT · TEST MODEM'), option('mode:dial', 'ATDT · DIAL CLUB BBS'), option('mode:messages', 'READ THE BULLETIN'), option('mode:users', 'WHO IS ONLINE'), option('post', 'POST A NOTE')];
      else if (station.software === 'mac') controls = [option('mode:mac', 'THE DESKTOP'), option('mode:sketch', 'OPEN SKETCHPAD')];
      else if (station.software === 'handheld') controls = [option('game:snake', 'PLAY SNAKE')];
      else if (station.software === 'race') controls = [option('race', 'OPEN TOKYO NIGHTS')];
      else if (station.software === 'music') controls = [option('song', songLabel)];
      else if (station.software === 'video') controls = [option('video', 'WATCH OMACON 2026')];
      else if (station.software === 'trailer') controls = [option('mode:trailer', 'PLAY TRAILER LOOP'), option('video', 'WATCH OMACON 2026')];
      else if (station.software === 'telescope') controls = [option('mode:telescope', 'SCAN MANHATTAN')];
      else if (station.software === 'lookout') controls = [option('mode:lookout', 'READ TOWER GUIDE')];
      else if (station.software === 'leaderboard') controls = [option('mode:leaderboard', 'VIEW HIGH SCORES')];
      else if (station.software === 'snacks') controls = [option('mode:snacks', 'POUR A SODA')];
      else if (station.software === 'pong') controls = [option('game:pong', 'PLAY PONG'), option('mode:console', 'COLOR & SPRITE TEST')];
      else if (station.software === 'star') controls = [option('game:star', 'PLAY STAR PATROL'), option('mode:console', 'COLOR & SPRITE TEST')];
      else if (station.software === 'brick') controls = [option('game:brick', 'PLAY BRICK BREAK'), option('mode:console', 'COLOR & SPRITE TEST')];
      else if (station.software === 'snake') controls = [option('game:snake', 'PLAY SNAKE')];
      else if (station.software === 'coastal') controls = [option('mode:coastal-desktop', 'DESKTOP DEMO'), option('mode:coastal-view', 'COASTAL WALLPAPER')];
      else if (station.software === 'maclab') controls = [option('mac:desktop', 'OMARCHY DESKTOP'), option('mac:terminal', 'LOCAL TERMINAL'), option('mac:hardware', 'HARDWARE CARD')];
      else controls = [option(`game:${station.id === 'brick-break' || station.id === 'atari2600' ? 'brick' : 'star'}`, 'PLAY THE CLUB GAME'), option('mode:console', 'COLOR & SPRITE TEST')];
      return { title: station.name.toUpperCase(), subtitle: `${station.year ? `${station.year} · ` : ''}${device.power ? 'POWER ON' : 'POWER OFF'}`, text: station.detail, options: [...controls, option('power', device.power ? 'POWER OFF' : 'POWER ON'), option('back', 'BACK TO THE ROOM')] };
    }
    if (this.state === 'arcade') return { title: this.arcade.kind === 'snake' ? 'SNAKE' : this.arcade.kind === 'star' ? 'STAR PATROL' : this.arcade.kind === 'pong' ? 'BASEMENT PONG' : 'BRICK BREAK', text: this.arcade.kind === 'snake' ? 'Use the stick or arrow keys to turn. Collect food and avoid the walls and your tail.' : this.arcade.kind === 'pong' ? 'Move the paddle with the stick or arrow keys. First to five points wins.' : 'Use the stick or arrow keys to move. Press a trigger or Space to fire in Star Patrol.', options: [option('start-game', this.arcade.state === 'playing' ? 'RESTART GAME' : 'START GAME'), option('pause', 'PAUSE'), option('back', 'LEAVE THE GAME')] };
    if (this.state === 'sketch') return { title: 'SKETCHPAD', text: 'Point at the Macintosh screen and press a trigger to paint a cell. Select a painted cell to erase it.', options: [option('sketch-slot:0', `SLOT 1${this.sketchSlot === 0 ? ' · ACTIVE' : ''}`), option('sketch-slot:1', `SLOT 2${this.sketchSlot === 1 ? ' · ACTIVE' : ''}`), option('sketch-slot:2', `SLOT 3${this.sketchSlot === 2 ? ' · ACTIVE' : ''}`), option('sketch-color:0', 'INK'), option('sketch-color:1', 'CYAN'), option('sketch-color:2', 'PINK'), option('clear-sketch', 'CLEAR SKETCH'), option('back', 'CLOSE SKETCHPAD')] };
    return null;
  }

  get zone() { return zoneAt(this.position.x, this.position.z); }
}
