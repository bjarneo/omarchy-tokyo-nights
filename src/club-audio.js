import { ArcadeAudio } from './audio.js';

const ZONE_TONES = {
  entry: { frequency: 92, gain: 0.014, filter: 320 },
  amiga: { frequency: 140, gain: 0.016, filter: 520 },
  bbs: { frequency: 68, gain: 0.018, filter: 240 },
  console: { frequency: 118, gain: 0.012, filter: 420 },
  arcade: { frequency: 165, gain: 0.014, filter: 640 },
  workshop: { frequency: 104, gain: 0.014, filter: 360 },
  malibu: { frequency: 210, gain: 0.008, filter: 900 },
  security: { frequency: 58, gain: 0.02, filter: 200 },
  design: { frequency: 175, gain: 0.008, filter: 700 },
  'mac-room': { frequency: 128, gain: 0.012, filter: 480 },
  rangers: { frequency: 98, gain: 0.012, filter: 340 },
  basement: { frequency: 52, gain: 0.022, filter: 180 },
  roof: { frequency: 240, gain: 0.01, filter: 1100 },
};

export class ClubAudio extends ArcadeAudio {
  async setEnabled(enabled) {
    const active = await super.setEnabled(enabled);
    if (active && !this.fans) {
      this.fans = [[-14, -11], [12.8, -11], [39, 23], [0, 42]].map(([x, z], i) => {
        const oscillator = this.context.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = 62 + i * 41;
        const gain = this.context.createGain(); gain.gain.value = i > 1 ? .015 : .025;
        const panner = this.panner({ x, y: .9, z });
        oscillator.connect(gain).connect(panner).connect(this.master); oscillator.start();
        return oscillator;
      });
    }
    if (active && !this.zoneTone) {
      this.zoneTone = this.context.createOscillator(); this.zoneTone.type = 'triangle';
      this.zoneFilter = this.context.createBiquadFilter(); this.zoneFilter.type = 'lowpass';
      this.zoneGain = this.context.createGain(); this.zoneGain.gain.value = 0;
      this.zoneTone.connect(this.zoneFilter).connect(this.zoneGain).connect(this.master);
      this.zoneTone.start();
    }
    return active;
  }

  ui(kind = 'select', position = { x: 0, y: 1.4, z: 0 }) {
    if (kind === 'select') this.tone(position, 660, .08, 0, .07);
    if (kind === 'back') this.tone(position, 440, .09, 0, .07);
    if (kind === 'error') this.tone(position, 180, .18, 0, .09);
    if (kind === 'turn') this.tone(position, 520, .05, 0, .045);
    if (kind === 'quest') [523.25, 659.25, 783.99].forEach((frequency, i) => this.tone(position, frequency, .22, i * .09, .08));
    if (kind === 'teleport') this.noise(position, .25, .06);
    if (kind === 'elevator') { this.tone(position, 880, .25, 0, .08); this.tone(position, 1318, .3, .18, .08); }
    if (kind === 'step') this.tone(position, 190 + Math.random() * 40, .05, 0, .035);
    if (kind === 'pour') { this.noise(position, .6, .05); this.tone(position, 340, .3, .1, .05); }
  }

  noise(position, duration = .25, volume = .06) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource(); source.buffer = buffer;
    const filter = this.context.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 900;
    const gain = this.context.createGain(); gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(this.panner(position)).connect(this.master);
    source.start(now);
  }

  spatialize(element, position) {
    if (!this.context || !this.enabled) return false;
    try {
      if (element._clubSource) return true;
      const source = this.context.createMediaElementSource(element);
      const gain = this.context.createGain(); gain.gain.value = 1;
      source.connect(gain).connect(this.panner(position)).connect(this.master);
      element._clubSource = source;
      return true;
    } catch { return false; }
  }

  panner(position) {
    const panner = this.context.createPanner(); panner.panningModel = 'HRTF'; panner.refDistance = 1.2; panner.maxDistance = 18; panner.rolloffFactor = 1.3;
    panner.positionX.value = position.x; panner.positionY.value = position.y ?? 1.2; panner.positionZ.value = position.z;
    return panner;
  }

  tone(position, frequency = 660, duration = .1, delay = 0, volume = .08) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator(); oscillator.type = 'triangle'; oscillator.frequency.value = frequency;
    const gain = this.context.createGain(); gain.gain.setValueAtTime(.0001, now); gain.gain.linearRampToValueAtTime(volume, now + .008); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    const panner = this.panner(position);
    oscillator.connect(gain).connect(panner).connect(this.master); oscillator.start(now); oscillator.stop(now + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); panner.disconnect(); };
  }

  modem(position) { [1200, 2100, 1300, 2100, 1700, 1200, 2200, 1600].forEach((frequency, i) => this.tone(position, frequency, .16, i * .18, .055)); }

  updateRoom(game, head, forward, up) {
    if (!this.context || !this.enabled) return;
    const listener = this.context.listener; const now = this.context.currentTime;    for (const axis of ['x', 'y', 'z']) {
      const key = axis.toUpperCase();
      listener[`position${key}`]?.setTargetAtTime(head[axis], now, .02);
      listener[`forward${key}`]?.setTargetAtTime(forward[axis], now, .02);
      listener[`up${key}`]?.setTargetAtTime(up[axis], now, .02);
    }
    if (!listener.positionX) { listener.setPosition(head.x, head.y, head.z); listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z); }
    const tone = ZONE_TONES[game.zone?.id] || ZONE_TONES.entry;
    if (this.zoneTone && game.state !== 'paused') {
      this.zoneTone.frequency.setTargetAtTime(tone.frequency, now, .4);
      this.zoneFilter.frequency.setTargetAtTime(tone.filter, now, .4);
      this.zoneGain.gain.setTargetAtTime(tone.gain, now, .8);
    } else if (this.zoneTone) {
      this.zoneGain.gain.setTargetAtTime(0, now, .2);
    }
    if (game.state === 'explore' && this.lastStep) {
      const walked = Math.hypot(head.x - this.lastStep.x, head.z - this.lastStep.z);
      this.stepDistance = (this.stepDistance || 0) + walked;
      if (this.stepDistance > 1.8) { this.stepDistance = 0; this.ui('step', head); }
    }
    this.lastStep = { x: head.x, z: head.z };
    const hums = (game.nearPowered || []).slice(0, 3);
    if (now >= (this.nextHum || 0) && hums.length && game.state !== 'paused') {
      for (const station of hums) {
        const distance = Math.max(1, Math.hypot(station.x - head.x, station.z - head.z));
        this.tone({ x: station.x, y: 1.2, z: station.z }, 120, .18, 0, Math.min(.02, .05 / distance));
      }
      this.nextHum = now + 1.4;
    }
    const st = game.devices['atari-st'];
    if (game.state !== 'paused' && st.power && st.mode === 'midi' && !st.muted && this.musicEnabled && now >= (this.nextMidi || 0)) {
      const notes = [[261.63, 329.63, 392, 523.25], [220, 261.63, 329.63, 440], [293.66, 349.23, 440, 587.33]][st.pattern];
      this.tone({ x: 16, z: -7.9 }, notes[Math.floor(st.clock * 4) % 4], .14, 0, .065);
      this.nextMidi = now + .25;
    }
  }

  dispose() { this.engine?.stop(); this.fans?.forEach((fan) => fan.stop()); void this.context?.close().catch(() => {}); }
}
