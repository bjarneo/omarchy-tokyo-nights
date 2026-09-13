import { RADIO_TRACKS } from '../assets/radio-tracks.js';
import { radioIndex } from './radio-catalog.mjs';

function readSetting(key, fallback) {
  try { return globalThis.window?.localStorage?.getItem(`tokyo-nights.radio.${key}`) ?? fallback; } catch { return fallback; }
}
function saveSetting(key, value) {
  try { globalThis.window?.localStorage?.setItem(`tokyo-nights.radio.${key}`, String(value)); } catch { /* Radio playback also works without storage. */ }
}

export class RadioPlayer {
  constructor({ tracks = RADIO_TRACKS, audioFactory = () => new Audio(), onChange = () => {}, onPlay = () => {} } = {}) {
    this.tracks = tracks;
    this.audioFactory = audioFactory;
    this.onChange = onChange;
    this.onPlay = onPlay;
    this.listeners = new Set();
    this.index = Math.max(0, tracks.findIndex(({ id }) => id === readSetting('track', '')));
    const volume = Number(readSetting('volume', '.55'));
    this.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : .55;
    this.pending = false;
    this.buffering = false;
    this.intent = false;
    this.started = false;
    this.error = '';
    this.request = 0;
    this.audio = null;
    this.detach = [];
    this.disposed = false;
  }

  get track() { return this.tracks[this.index]; }
  get playing() { return Boolean(this.audio && !this.audio.paused && !this.audio.ended && !this.audio.error && this.intent); }
  get active() { return this.intent && (this.playing || this.pending || this.buffering); }

  snapshot() {
    return {
      track: this.track, index: this.index, count: this.tracks.length, volume: this.volume,
      playing: this.playing, active: this.active, pending: this.pending, buffering: this.buffering, error: this.error,
      mode: this.error ? 'error' : this.pending || this.buffering ? 'loading' : this.playing ? 'playing' : this.started ? 'paused' : 'off',
      time: this.audio?.currentTime || 0, duration: Number.isFinite(this.audio?.duration) ? this.audio.duration : 0,
    };
  }

  subscribe(listener) { this.listeners.add(listener); listener(this.snapshot()); return () => this.listeners.delete(listener); }
  notify() { const state = this.snapshot(); this.onChange(state); this.listeners.forEach((listener) => listener(state)); }

  prepare() {
    if (this.audio && !this.audio.error) return this.audio;
    this.retire();
    const audio = this.audioFactory();
    this.audio = audio;
    audio.id = 'radio-audio';
    audio.preload = 'none';
    audio.hidden = true;
    audio.volume = this.volume;
    const listen = (type, callback) => {
      const handler = () => { if (this.audio === audio && !this.disposed) callback(); };
      audio.addEventListener(type, handler);
      this.detach.push(() => audio.removeEventListener(type, handler));
    };
    listen('playing', () => {
      if (!this.intent) { audio.pause(); return; }
      clearTimeout(this.loadTimer);
      this.pending = this.buffering = false;
      this.error = '';
      this.notify();
    });
    listen('waiting', () => { if (this.intent) { this.buffering = true; this.notify(); } });
    listen('pause', () => { if (audio.paused && !audio.ended && !this.pending) this.intent = false; this.notify(); });
    listen('ended', () => { if (this.intent) this.select(this.index + 1, true); });
    listen('error', () => {
      if (!this.intent) return;
      this.fail('This radio track cannot play. Try Play or Next.');
    });
    listen('timeupdate', () => this.notify());
    listen('loadedmetadata', () => this.notify());
    globalThis.document?.body?.append(audio);
    audio.src = this.track.url;
    return audio;
  }

  async play() {
    if (this.disposed || !this.track) return;
    this.onPlay();
    const request = ++this.request;
    this.intent = this.pending = this.started = true;
    this.error = '';
    const audio = this.prepare();
    if (audio.ended) audio.currentTime = 0;
    this.notify();
    clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => {
      if (request === this.request && this.pending) this.fail('The radio track takes too long to load. Try Play or Next.');
    }, 15_000);
    try {
      await audio.play();
    } catch (error) {
      if (request === this.request && error.name !== 'AbortError') this.fail('The radio cannot start. Try Play or Next.');
    } finally {
      if (request === this.request) { clearTimeout(this.loadTimer); this.pending = false; this.notify(); }
    }
  }

  fail(message) {
    this.request++;
    clearTimeout(this.loadTimer);
    this.intent = this.pending = this.buffering = false;
    this.error = message;
    this.audio?.pause();
    this.notify();
  }

  pause() {
    this.request++;
    clearTimeout(this.loadTimer);
    this.intent = this.pending = this.buffering = false;
    this.error = '';
    this.audio?.pause();
    this.notify();
  }

  toggle() { if (this.active) this.pause(); else void this.play(); }

  select(index, autoplay = this.active) {
    if (!this.tracks.length || this.disposed) return;
    this.request++;
    clearTimeout(this.loadTimer);
    this.retire();
    this.index = radioIndex(index, this.tracks.length);
    this.pending = this.buffering = this.intent = false;
    this.error = '';
    saveSetting('track', this.track.id);
    this.notify();
    if (autoplay) void this.play();
  }

  next() { this.select(this.index + 1); }
  previous() { this.select(this.index - 1); }

  setVolume(value) {
    if (!Number.isFinite(value)) return;
    this.volume = Math.max(0, Math.min(1, value));
    if (this.audio) this.audio.volume = this.volume;
    saveSetting('volume', this.volume);
    this.notify();
  }

  retire() {
    const audio = this.audio;
    this.audio = null;
    this.detach.splice(0).forEach((detach) => detach());
    if (!audio) return;
    audio.pause(); audio.removeAttribute('src'); audio.load(); audio.remove();
  }

  dispose() {
    this.pause();
    this.disposed = true;
    this.retire();
    this.listeners.clear();
  }
}
