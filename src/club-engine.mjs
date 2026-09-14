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

export class ClubGame {
  constructor({ onChange = () => {}, onEvent = () => {}, best = {} } = {}) {
    this.onChange = onChange; this.onEvent = onEvent;
    this.state = 'entry'; this.previousState = 'explore'; this.position = { ...ENTRY };
    this.devices = Object.fromEntries(STATIONS.map((station) => [station.id, { power: station.kind !== 'malibu', mode: station.initial, clock: 0, online: false, pattern: 0, pixels: [], ...(station.lab ? { lab: createLabState() } : {}) }]));
    this.best = Object.fromEntries(['star', 'brick', 'snake'].map((id) => { const value = Number(best?.[id]); return [id, Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0]; }));
    this.selected = null; this.reply = ''; this.arcade = null; this.revision = 0;
    this.elapsed = 0;
    this.songPlaying = false; this.songPending = false;
    this.crew = createClubCrew();
    this.obstacles = [...STATIC_OBSTACLES, ...this.crew.map((npc) => npc.obstacle)];
    this.crew.forEach((npc) => { npc.avoid = this.obstacles.filter((box) => box.id !== npc.id); });
    this.clearSpaces = [...ZONES.map((zone) => zone.beacon), ...STATIONS.map((station) => station.stand), ...CLUB_OBJECTS.map((object) => object.stand)];
    this.dialogueSpace = null;
    this.virus = createVirus();
    this.design = createDesignState();
  }

  changed() { if (this.state !== 'talk') this.dialogueSpace = null; this.revision++; this.onChange(this); }
  enter() { if (this.state === 'entry') { this.state = 'explore'; this.changed(); } }
  pause() { if (this.state !== 'paused' && this.state !== 'entry') { this.previousState = this.state; this.state = 'paused'; this.changed(); } }
  resume() { if (this.state === 'paused') { this.state = this.previousState; this.changed(); } }
  back() { if (this.state === 'paused') this.resume(); else if (this.state === 'explore') this.pause(); else if (this.state !== 'entry') { this.state = 'explore'; this.arcade = null; this.changed(); } }
  map() { if (this.state === 'map') this.back(); else { this.state = 'map'; this.changed(); } }

  interact(id, player = this.position) {
    if (this.state !== 'explore' && this.state !== 'sketch') return false;
    const target = this.crew.find((item) => item.id === id) || STATIONS.find((item) => item.id === id) || CLUB_OBJECTS.find((item) => item.id === id) || (id === this.virus.id ? this.virus : null);
    if (!target || Math.hypot(target.x - player.x, target.z - player.z) > 3) return false;
    const from = { x: player.x, y: player.y ?? CLUB.eyeHeight, z: player.z };
    const to = { x: target.x, y: target.eyeHeight || target.height, z: target.z };
    if (this.obstacles.some((box) => box.id !== id && segmentHitsBox(from, to, box))) return false;
    this.selected = target;
    this.state = target.topics ? 'talk' : 'device';
    this.reply = target.greeting || target.detail;
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
      }
      return;
    }
    if (id.startsWith('security:') && this.state === 'device' && this.selected?.lab) {
      const device = this.devices[this.selected.id];
      if (id === 'security:reset') device.lab = createLabState();
      else if (id.startsWith('security:choice:')) {
        const effect = chooseLab(SECURITY_LABS[this.selected.lab], device.lab, Number(id.slice(16)));
        if (effect === 'quarantine') quarantineVirus(this.virus);
      } else return;
      this.changed(); this.onEvent({ type: 'beep', target: this.selected });
      this.onEvent({ type: 'speech', target: this.selected, text: this.panel().text });
      return;
    }
    if (id.startsWith('virus:') && this.state === 'device' && this.selected?.id === this.virus.id) {
      if (id === 'virus:quarantine') quarantineVirus(this.virus);
      else if (id === 'virus:release') Object.assign(this.virus, createVirus());
      else return;
      this.changed(); return;
    }
    if (id === 'start-game' && this.arcade) { this.arcade.reset(); this.arcade.start(); this.changed(); return; }
    if (id.startsWith('game:') && this.selected && !this.selected.topics) {
      const kind = id.slice(5);
      if (!['star', 'brick', 'snake'].includes(kind)) return;
      this.arcade = new CabinetGame(kind); this.state = 'arcade';
      this.devices[this.selected.id].power = true;
      this.devices[this.selected.id].mode = 'game';
      this.changed(); return;
    }
    if (id.startsWith('mode:') && this.selected && this.devices[this.selected.id]) {
      const mode = id.slice(5);
      const allowed = ['workbench', 'boing', 'starfield', 'basic', 'list', 'directory', 'spectrum', 'load', 'gem', 'midi', 'terminal', 'dial', 'messages', 'users', 'mac', 'sketch', 'console', 'coastal-desktop', 'coastal-view'];
      if (!allowed.includes(mode)) return;
      const device = this.devices[this.selected.id];
      device.power = true; device.mode = mode; device.clock = 0;
      if (mode === 'dial') { device.online = true; this.onEvent({ type: 'modem', target: this.selected }); }
      if (mode === 'midi') device.pattern = (device.pattern + 1) % 3;
      this.state = mode === 'sketch' ? 'sketch' : 'explore';
      this.changed(); return;
    }
    if (id === 'power' && this.selected && this.devices[this.selected.id]) {
      const device = this.devices[this.selected.id]; device.power = !device.power; this.changed(); this.onEvent({ type: 'beep', target: this.selected });
    }
    if (id === 'clear-sketch' && this.selected) { this.devices[this.selected.id].pixels = []; this.changed(); }
  }

  sketch(u, v) {
    if (this.state !== 'sketch' || !this.selected) return;
    const cell = Math.max(0, Math.min(15, Math.floor(u * 16))) + Math.max(0, Math.min(11, Math.floor((1 - v) * 12))) * 16;
    const pixels = this.devices[this.selected.id].pixels;
    const index = pixels.indexOf(cell);
    if (index < 0) pixels.push(cell); else pixels.splice(index, 1);
    this.changed();
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
    updateVirus(this.virus, dt, input.reducedMotion || this.state === 'device' && this.selected?.id === this.virus.id);
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
      }
    }
  }

  panel() {
    const option = (id, label) => ({ id, label });
    const songLabel = this.songPending ? 'CANCEL SONG LOAD' : this.songPlaying ? 'PAUSE SONG' : 'PLAY SONG';
    if (this.state === 'entry') return { title: 'THE MIDNIGHT CLUB', text: 'A large room full of computers, consoles, and the crew. Explore freely and try any machine.', options: [option('explore', 'ENTER THE ROOM'), option('map', 'ROOM MAP')] };
    if (this.state === 'paused') return { title: 'CLUB PAUSED', text: 'Resume your conversation, game, or walk through the room.', options: [option('explore', 'RESUME'), option('map', 'ROOM MAP'), option('song', songLabel), option('center', 'CENTER VIEW'), option('race', 'VR RACE & GARAGE'), option('exit', 'EXIT VR')] };
    if (this.state === 'map') return { title: 'THE CLUB MAP', text: 'Select an area to teleport there. You can also walk through the wide central aisles.', options: [...ZONES.map((zone) => option(`zone:${zone.id}`, zone.name)), option('back', 'CLOSE MAP')] };
    if (this.state === 'talk') return { title: this.selected.name.toUpperCase(), subtitle: `${this.selected.role.toUpperCase()}${this.selected.country ? ` · ${this.selected.country} · CAMEO` : ''}`, text: this.reply, portrait: this.selected.id, layout: this.selected.team === 'rangers' ? 'guide' : undefined, options: [...this.selected.topics.map((topic, index) => option(`topic:${index}`, topic[0])), option('read', 'READ ALOUD'), ...(this.selected.team === 'rangers' ? [option('map', 'ROOM DIRECTORY'), option('guide:controls', 'MOVEMENT HELP')] : []), option('back', 'BACK TO THE ROOM')] };
    if (this.state === 'device') {
      const station = this.selected;
      if (station.software === 'elevator') return { title: 'THE CLUB ELEVATOR', subtitle: 'ROOM DIRECTORY', text: station.detail, options: [option('map', 'CHOOSE A ROOM'), option('back', 'BACK TO THE ROOM')] };
      if (station.software === 'design') return designPanel(station, this.design);
      if (station.software === 'security') return labPanel(station, this.devices[station.id]);
      if (station.software === 'virus') return { title: 'BYTE · LAB VIRUS', subtitle: this.virus.quarantined ? 'QUARANTINED' : 'PATROL ACTIVE', text: this.virus.quarantined ? 'BYTE stays inside the containment field. Release the simulated virus to resume its patrol through the security room.' : 'A pixel computer virus patrols the lab. Its body, eyes, and antennae are part of the room simulation. Quarantine BYTE to stop its patrol.', options: [option(this.virus.quarantined ? 'virus:release' : 'virus:quarantine', this.virus.quarantined ? 'RELEASE BYTE' : 'QUARANTINE BYTE'), option('back', 'BACK TO THE ROOM')] };
      if (station.software === 'jukebox' && this.jukebox) return this.jukebox.panel();
      const device = this.devices[station.id];
      let controls = [];
      if (station.software === 'amiga') controls = [option('mode:workbench', 'WORKBENCH'), option('mode:boing', 'CHECKER BALL'), option('mode:starfield', 'STARFIELD')];
      else if (station.software === 'basic') controls = [option('mode:basic', 'BASIC PROMPT'), option('mode:list', 'LIST PROGRAM'), option('mode:starfield', 'RUN DEMO'), option('mode:directory', 'DISK DIRECTORY')];
      else if (station.software === 'spectrum') controls = [option('mode:load', 'LOAD A TAPE'), option('mode:spectrum', 'COLOR TEST')];
      else if (station.software === 'gem') controls = [option('mode:gem', 'GEM DESKTOP'), option('mode:midi', 'CHANGE MIDI PATTERN')];
      else if (station.software === 'bbs') controls = [option('mode:terminal', 'AT · TEST MODEM'), option('mode:dial', 'ATDT · DIAL CLUB BBS'), option('mode:messages', 'READ THE BULLETIN'), option('mode:users', 'WHO IS ONLINE')];
      else if (station.software === 'mac') controls = [option('mode:mac', 'THE DESKTOP'), option('mode:sketch', 'OPEN SKETCHPAD')];
      else if (station.software === 'handheld') controls = [option('game:snake', 'PLAY SNAKE')];
      else if (station.software === 'race') controls = [option('race', 'OPEN TOKYO NIGHTS')];
      else if (station.software === 'music') controls = [option('song', songLabel)];
      else if (station.software === 'video') controls = [option('video', 'WATCH OMACON 2026')];
      else if (station.software === 'coastal') controls = [option('mode:coastal-desktop', 'DESKTOP DEMO'), option('mode:coastal-view', 'COASTAL WALLPAPER')];
      else if (station.software === 'maclab') controls = [option('mac:desktop', 'OMARCHY DESKTOP'), option('mac:terminal', 'LOCAL TERMINAL'), option('mac:hardware', 'HARDWARE CARD')];
      else controls = [option(`game:${station.id === 'brick-break' || station.id === 'atari2600' ? 'brick' : 'star'}`, 'PLAY THE CLUB GAME'), option('mode:console', 'COLOR & SPRITE TEST')];
      return { title: station.name.toUpperCase(), subtitle: `${station.year ? `${station.year} · ` : ''}${device.power ? 'POWER ON' : 'POWER OFF'}`, text: station.detail, options: [...controls, option('power', device.power ? 'POWER OFF' : 'POWER ON'), option('back', 'BACK TO THE ROOM')] };
    }
    if (this.state === 'arcade') return { title: this.arcade.kind === 'snake' ? 'SNAKE' : this.arcade.kind === 'star' ? 'STAR PATROL' : 'BRICK BREAK', text: this.arcade.kind === 'snake' ? 'Use the stick or arrow keys to turn. Collect food and avoid the walls and your tail.' : 'Use the stick or arrow keys to move. Press a trigger or Space to fire in Star Patrol.', options: [option('start-game', this.arcade.state === 'playing' ? 'RESTART GAME' : 'START GAME'), option('pause', 'PAUSE'), option('back', 'LEAVE THE GAME')] };
    if (this.state === 'sketch') return { title: 'SKETCHPAD', text: 'Point at the Macintosh screen and press a trigger to paint a cell. Select a painted cell to erase it.', options: [option('clear-sketch', 'CLEAR SKETCH'), option('back', 'CLOSE SKETCHPAD')] };
    return null;
  }

  get zone() { return zoneAt(this.position.x, this.position.z); }
}
