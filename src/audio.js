export class ArcadeAudio {
  constructor() {
    this.enabled = false;
    this.available = true;
    this.context = null;
    this.step = 0;
    this.nextBeat = 0;
    this.musicEnabled = true;
  }

  async setEnabled(enabled) {
    try {
      if (enabled && !this.context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) { this.available = false; return false; }
        this.context = new Context();
        this.master = this.context.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.context.destination);
        this.engine = this.context.createOscillator();
        this.engine.type = 'sawtooth';
        this.engineFilter = this.context.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.value = 380;
        this.engineGain = this.context.createGain();
        this.engineGain.gain.value = 0;
        this.engine.connect(this.engineFilter).connect(this.engineGain).connect(this.master);
        this.engine.start();
      }
      if (enabled) await this.context.resume();
      this.enabled = enabled;
      if (this.master) this.master.gain.setTargetAtTime(enabled ? 0.32 : 0, this.context.currentTime, 0.04);
      return this.enabled;
    } catch {
      this.enabled = false;
      this.available = false;
      return false;
    }
  }

  note(frequency, duration = 0.15, type = 'square', volume = 0.12, delay = 0) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  event(event) {
    if (event.type === 'nitro-pickup') [880, 1174.66, 1567.98].forEach((frequency, i) => this.note(frequency, .16, 'triangle', .15, i * .07));
    if (event.type === 'pit-enter' || event.type === 'pit-resume') this.note(523.25, .25, 'triangle', .12);
    if (event.type === 'pickup') [659.25, 783.99, 1046.5].forEach((frequency, i) => this.note(frequency, .2, 'triangle', .15, i * .08));
    if (event.type === 'ending') [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((frequency, i) => this.note(frequency, .5, 'triangle', .18, i * .22));
    if (event.type === 'countdown') this.note(440, 0.12);
    if (event.type === 'go') this.note(880, 0.4, 'square', 0.18);
    if (event.type === 'near-miss') { this.note(880, 0.1, 'triangle'); this.note(1320, 0.15, 'triangle', 0.12, 0.1); }
    if (event.type === 'collision') {
      [55, 73, 92, 110].forEach((frequency, i) => this.note(frequency, 0.25, 'sawtooth', 0.17, i * 0.035));
    }
    if (event.type === 'checkpoint') [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => this.note(frequency, 0.3, 'square', 0.12, i * 0.12));
    if (event.type === 'gameover') [440, 349.23, 293.66, 220].forEach((frequency, i) => this.note(frequency, 0.4, 'triangle', 0.2, i * 0.2));
  }

  update(game) {
    if (!this.context || !this.enabled) return;
    const now = this.context.currentTime;
    const driving = game.state === 'playing';
    this.engineGain.gain.setTargetAtTime(driving ? game.boosting ? 0.14 : 0.1 : 0, now, 0.08);
    this.engine.frequency.setTargetAtTime(38 + game.speed * 0.55 + (game.boosting ? 38 : 0), now, 0.04);
    this.engineFilter.frequency.setTargetAtTime(game.boosting ? 1250 : 420 + game.speed, now, 0.07);
    if (!driving || !this.musicEnabled) { this.nextBeat = now; return; }
    if (now >= this.nextBeat) {
      const bass = [65.41, 65.41, 77.78, 65.41, 58.27, 58.27, 51.91, 58.27];
      const melody = [261.63, 311.13, 392, 466.16, 392, 311.13, 233.08, 311.13];
      const index = this.step % 8;
      if (this.step % 2 === 0) this.note(bass[Math.floor(this.step / 4) % 8], 0.18, 'triangle', 0.3);
      this.note(melody[index], 0.09, 'triangle', index % 2 === 0 ? 0.055 : 0.035);
      if (this.step % 4 === 0) this.note(48, 0.08, 'sine', 0.35);
      this.step++;
      this.nextBeat = now + 60 / 116 / 4;
    }
  }

  silence() {
    if (this.context) this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.02);
  }

  restore() {
    if (this.context && this.enabled) this.master.gain.setTargetAtTime(0.32, this.context.currentTime, 0.03);
  }
}
