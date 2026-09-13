import { createStarScore, midiFrequency } from './rocket-score.mjs';
import { ROCKET_FLIGHT_SECONDS } from './rocket.mjs';

const buffers = new Map();

export async function renderStarMusic(sampleRate = 44100) {
  const OfflineContext = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
  const context = new OfflineContext(2, Math.ceil(sampleRate * ROCKET_FLIGHT_SECONDS), sampleRate);
  const input = context.createGain();
  const reverb = context.createConvolver();
  const impulse = context.createBuffer(2, Math.floor(sampleRate * 1.6), sampleRate);
  let seed = 1989;
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      data[i] = (seed / 2 ** 31 - 1) * (1 - i / data.length) ** 3;
    }
  }
  reverb.buffer = impulse;
  const wet = context.createGain();
  wet.gain.value = .32;
  const output = context.createGain();
  output.gain.setValueAtTime(0, 0);
  output.gain.linearRampToValueAtTime(.85, .5);
  output.gain.setValueAtTime(.85, 18.5);
  output.gain.linearRampToValueAtTime(0, ROCKET_FLIGHT_SECONDS);
  input.connect(output);
  input.connect(reverb).connect(wet).connect(output);
  output.connect(context.destination);

  for (const event of createStarScore()) {
    const panner = context.createStereoPanner();
    panner.pan.value = event.pan;
    panner.connect(input);
    const start = event.at;
    const end = Math.min(ROCKET_FLIGHT_SECONDS, start + event.duration);
    const attack = event.kind === 'pad' ? .22 : event.kind === 'bass' ? .045 : .012;
    const harmonics = event.kind === 'bell' ? [[1, 1], [3.005, .17]] : [[1, 1]];
    for (const [multiple, level] of harmonics) {
      const voice = context.createOscillator();
      voice.type = event.kind === 'pad' ? 'triangle' : 'sine';
      voice.frequency.value = midiFrequency(event.note) * multiple;
      const envelope = context.createGain();
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(event.volume * level, Math.min(end, start + attack));
      envelope.gain.exponentialRampToValueAtTime(.0001, end);
      voice.connect(envelope).connect(panner);
      voice.start(start);
      voice.stop(end);
    }
  }
  return context.startRendering();
}

export class RocketMusic {
  constructor(context, destination) {
    this.context = context;
    this.destination = destination;
    this.source = null;
    this.disposed = false;
    if (!buffers.has(context.sampleRate)) buffers.set(context.sampleRate, renderStarMusic(context.sampleRate).catch(() => null));
    this.ready = buffers.get(context.sampleRate).then((buffer) => { if (!this.disposed) this.buffer = buffer; });
  }

  update(time) {
    if (!this.buffer || this.disposed || !Number.isFinite(time) || time < 0 || time >= ROCKET_FLIGHT_SECONDS) { this.stop(); return; }
    const now = this.context.currentTime;
    if (this.source && Math.abs(this.offset + now - this.startedAt - time) < .15) return;
    this.stop();
    const source = this.context.createBufferSource();
    const envelope = this.context.createGain();
    source.buffer = this.buffer;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + .025);
    source.connect(envelope).connect(this.destination);
    this.source = source;
    this.envelope = envelope;
    this.offset = time;
    this.startedAt = now;
    source.onended = () => {
      source.disconnect(); envelope.disconnect();
      if (this.source === source) this.source = null;
    };
    source.start(now, time);
  }

  stop() {
    if (!this.source) return;
    const now = this.context.currentTime;
    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.setTargetAtTime(0, now, .008);
    this.source.stop(now + .04);
    this.source = null;
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.buffer = null;
  }
}
