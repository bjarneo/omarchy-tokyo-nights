import { ArcadeAudio } from './audio.js';
import { clamp } from './engine.mjs';
import { trafficPosition } from './vr-world.mjs';

export class SpatialRaceAudio extends ArcadeAudio {
  async setEnabled(enabled) {
    const active = await super.setEnabled(enabled);
    if (active && !this.enginePanner) {
      this.enginePanner = this.panner();
      this.engineGain.disconnect();
      this.engineGain.connect(this.enginePanner).connect(this.master);
      this.voices = Array.from({ length: 6 }, () => {
        const oscillator = this.context.createOscillator();
        oscillator.type = 'triangle';
        const gain = this.context.createGain();
        gain.gain.value = 0;
        const panner = this.panner();
        oscillator.connect(gain).connect(panner).connect(this.master);
        oscillator.start();
        return { oscillator, gain, panner };
      });
    }
    return active;
  }

  panner() {
    const panner = this.context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 3;
    panner.maxDistance = 90;
    panner.rolloffFactor = 1.2;
    return panner;
  }

  position(target, position, now) {
    if (target.positionX) {
      for (const axis of ['x', 'y', 'z']) target[`position${axis.toUpperCase()}`].setTargetAtTime(position[axis], now, .025);
    } else target.setPosition(position.x, position.y, position.z);
  }

  updateSpatial(game, head, forward, up, rigX) {
    if (!this.context || !this.enabled || !this.enginePanner) return;
    const now = this.context.currentTime;
    const listener = this.context.listener;
    this.position(listener, head, now);
    if (listener.forwardX) {
      for (const axis of ['x', 'y', 'z']) {
        listener[`forward${axis.toUpperCase()}`].setTargetAtTime(forward[axis], now, .02);
        listener[`up${axis.toUpperCase()}`].setTargetAtTime(up[axis], now, .02);
      }
    } else listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    this.position(this.enginePanner, { x: rigX + .35, y: .4, z: 1.2 }, now);
    const cars = game.state === 'playing' ? game.traffic
      .filter((car) => Math.abs(car.z - game.distance) < 160)
      .sort((a, b) => Math.abs(a.z - game.distance) - Math.abs(b.z - game.distance)) : [];
    this.voices.forEach((voice, index) => {
      const car = cars[index];
      voice.gain.gain.setTargetAtTime(car ? .12 : 0, now, .08);
      if (!car) return;
      this.position(voice.panner, trafficPosition(game, car), now);
      const doppler = 1 + Math.sign(car.z - game.distance) * clamp((game.speed - car.speed) / 1500, -.2, .25);
      voice.oscillator.frequency.setTargetAtTime((65 + car.speed * .6) * doppler, now, .04);
    });
  }

  dispose() {
    this.engine?.stop();
    this.voices?.forEach((voice) => voice.oscillator.stop());
    void this.context?.close().catch(() => {});
  }
}
