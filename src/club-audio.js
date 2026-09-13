import { ArcadeAudio } from './audio.js';

export class ClubAudio extends ArcadeAudio {
  async setEnabled(enabled) {
    const active = await super.setEnabled(enabled);
    if (active && !this.fans) {
      this.fans = [[-14, -11], [12.8, -11]].map(([x, z], i) => {
        const oscillator = this.context.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = 62 + i * 57;
        const gain = this.context.createGain(); gain.gain.value = .025;
        const panner = this.panner({ x, y: .9, z });
        oscillator.connect(gain).connect(panner).connect(this.master); oscillator.start();
        return oscillator;
      });
    }
    return active;
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
    const listener = this.context.listener; const now = this.context.currentTime;
    for (const axis of ['x', 'y', 'z']) {
      const key = axis.toUpperCase();
      listener[`position${key}`]?.setTargetAtTime(head[axis], now, .02);
      listener[`forward${key}`]?.setTargetAtTime(forward[axis], now, .02);
      listener[`up${key}`]?.setTargetAtTime(up[axis], now, .02);
    }
    if (!listener.positionX) { listener.setPosition(head.x, head.y, head.z); listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z); }
    const st = game.devices['atari-st'];
    if (game.state !== 'paused' && st.power && st.mode === 'midi' && this.musicEnabled && now >= (this.nextMidi || 0)) {
      const notes = [[261.63, 329.63, 392, 523.25], [220, 261.63, 329.63, 440], [293.66, 349.23, 440, 587.33]][st.pattern];
      this.tone({ x: 16, z: -7.9 }, notes[Math.floor(st.clock * 4) % 4], .14, 0, .065);
      this.nextMidi = now + .25;
    }
  }

  dispose() { this.engine?.stop(); this.fans?.forEach((fan) => fan.stop()); void this.context?.close().catch(() => {}); }
}
