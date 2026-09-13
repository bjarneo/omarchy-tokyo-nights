import { CLUB_TRACKS } from '../assets/club-radio.js';

const PAGE_SIZE = 6;

export class ClubJukebox {
  constructor({ tracks = CLUB_TRACKS, audioFactory = () => new Audio(), onChange = () => {}, onPlay = () => {} } = {}) {
    Object.assign(this, { tracks, audioFactory, onChange, onPlay });
    this.queue = []; this.index = -1; this.selection = 0; this.page = 0; this.view = 'library';
    this.audio = null; this.detach = []; this.request = 0; this.pending = false; this.intent = false; this.error = ''; this.disposed = false;
  }

  get track() { return this.tracks[this.index]; }
  get playing() { return Boolean(this.intent && this.audio && !this.audio.paused && !this.audio.ended && !this.audio.error); }
  get active() { return this.intent && (this.pending || this.playing); }
  get toggleLabel() { return this.pending ? 'CANCEL LOAD' : this.playing ? 'PAUSE MUSIC' : this.track ? 'RESUME MUSIC' : this.queue.length ? 'PLAY QUEUE' : 'PLAY MUSIC'; }
  notify() { if (!this.disposed) this.onChange(this); }

  prepare() {
    if (this.audio && !this.audio.error) return this.audio;
    this.retire();
    const audio = this.audioFactory(); this.audio = audio;
    audio.id = 'club-jukebox-audio'; audio.preload = 'none'; audio.volume = .65; audio.hidden = true;
    const listen = (type, callback) => {
      const handler = () => { if (!this.disposed && this.audio === audio) callback(); };
      audio.addEventListener(type, handler); this.detach.push(() => audio.removeEventListener(type, handler));
    };
    listen('playing', () => {
      if (!this.intent) { audio.pause(); return; }
      clearTimeout(this.timer); this.pending = false; this.error = ''; this.notify();
    });
    listen('waiting', () => { if (this.intent) { this.pending = true; this.notify(); this.watchLoad(); } });
    listen('pause', () => { if (!audio.ended && !this.pending) this.intent = false; this.notify(); });
    listen('ended', () => { if (this.intent) this.next(true); });
    listen('error', () => { if (this.intent) this.fail('This track cannot play. Select Play now to retry, or choose Next track.'); });
    globalThis.document?.body?.append(audio);
    audio.src = new URL(`../assets/radio/${this.track.file}`, import.meta.url).href;
    return audio;
  }

  watchLoad() {
    clearTimeout(this.timer);
    const request = this.request;
    this.timer = setTimeout(() => {
      if (request === this.request && this.pending) this.fail('This track takes too long to load. Select Play now to retry, or choose Next track.');
    }, 15_000);
  }

  async play() {
    if (this.disposed || !this.tracks.length) return;
    if (!this.track) this.index = this.queue.length ? this.queue.shift() : this.selection;
    this.onPlay();
    const request = ++this.request;
    this.intent = this.pending = true; this.error = '';
    const audio = this.prepare();
    if (audio.ended) audio.currentTime = 0;
    this.notify(); this.watchLoad();
    try { await audio.play(); }
    catch (error) { if (request === this.request && error.name !== 'AbortError') this.fail('Audio cannot start. Select Play now to allow playback.'); }
    finally { if (request === this.request) { clearTimeout(this.timer); this.pending = false; this.notify(); } }
  }

  pause() {
    this.request++; clearTimeout(this.timer);
    this.intent = this.pending = false; this.error = '';
    this.audio?.pause(); this.notify();
  }

  fail(message) { this.pause(); this.error = message; this.notify(); }
  toggle() { if (this.active) this.pause(); else void this.play(); }

  select(index, autoplay = true) {
    if (!Number.isInteger(index) || !this.tracks[index] || this.disposed) return;
    this.pause(); this.retire(); this.index = index; this.error = ''; this.notify();
    if (autoplay) void this.play();
  }

  next(autoplay = this.active) {
    if (this.tracks.length) this.select(this.queue.length ? this.queue.shift() : (this.index + 1) % this.tracks.length, autoplay);
  }

  add(index) {
    if (!Number.isInteger(index) || !this.tracks[index]) return;
    if (this.queue.length >= 100) { this.error = 'The queue is full. Remove a track before you add another.'; this.notify(); return; }
    this.queue.push(index); this.notify();
  }

  action(id) {
    const [prefix, action, value] = id.split(':');
    if (prefix !== 'jukebox') return;
    const index = Number(value);
    if (action === 'pick' && Number.isInteger(index) && this.tracks[index]) { this.selection = index; this.view = 'track'; }
    if (action === 'play') this.select(index);
    if (action === 'add') this.add(index);
    if (action === 'toggle') this.toggle();
    if (action === 'next') this.next(true);
    if (action === 'current' && this.track) { this.selection = this.index; this.view = 'track'; }
    if (action === 'library' || action === 'queue') { this.view = action; this.page = 0; }
    if (action === 'page' && Number.isInteger(index)) this.page = Math.max(0, Math.min(this.pageCount - 1, index));
    if (action === 'remove' && Number.isInteger(index) && index >= 0 && index < this.queue.length) this.queue.splice(index, 1);
    if (action === 'clear') this.queue = [];
    this.page = Math.min(this.page, this.pageCount - 1); this.notify();
  }

  get pageCount() { return Math.max(1, Math.ceil((this.view === 'queue' ? this.queue.length : this.tracks.length) / PAGE_SIZE)); }

  panel() {
    const option = (id, label, extra = {}) => ({ id: `jukebox:${id}`, label, ...extra });
    const back = { id: 'back', label: 'BACK TO THE ROOM' };
    const current = this.error || (this.pending ? 'The track loads. Select Cancel load to stop it.' : this.playing ? `Now: ${this.track.title}` : this.track ? `Paused: ${this.track.title}` : 'Select a track. The queue plays first, then the library continues in order.');
    if (this.view === 'track') {
      const track = this.tracks[this.selection];
      if (!track) return { title: 'OMARCHY JUKEBOX', text: 'The local track library is empty.', options: [back] };
      return {
        title: 'OMARCHY JUKEBOX', subtitle: `TRACK ${this.selection + 1} OF ${this.tracks.length}${track.explicit ? ' · EXPLICIT' : ''}`,
        text: `${track.title} · ${track.artist} · ${this.error || `${this.queue.length} ${this.queue.length === 1 ? 'track' : 'tracks'} in the queue.`}`,
        options: [option(`play:${this.selection}`, 'PLAY NOW'), option(`add:${this.selection}`, 'ADD TO QUEUE'), option('toggle', this.toggleLabel), option('next', 'NEXT TRACK'), option('library', 'TRACK LIBRARY'), option('queue', `VIEW QUEUE · ${this.queue.length}`), back],
      };
    }
    const queued = this.view === 'queue';
    const list = queued ? this.queue.map((index) => this.tracks[index]) : this.tracks;
    const offset = this.page * PAGE_SIZE;
    const rows = list.slice(offset, offset + PAGE_SIZE).map((track, i) => option(`${queued ? 'remove' : 'pick'}:${offset + i}`, `${String(offset + i + 1).padStart(2, '0')}  ${track.title}`, {
      detail: `${track.artist}${track.explicit ? ' · EXPLICIT' : ''}`, primary: !queued && offset + i === this.index,
    }));
    const controls = [option(`page:${this.page - 1}`, 'PREVIOUS PAGE', { disabled: this.page === 0 }), option(`page:${this.page + 1}`, 'NEXT PAGE', { disabled: this.page >= this.pageCount - 1 })];
    if (queued) controls.push(option('clear', 'CLEAR QUEUE', { disabled: !this.queue.length }), option('toggle', this.toggleLabel, { primary: true }), option('library', 'TRACK LIBRARY'));
    else controls.push(option('toggle', this.toggleLabel, { primary: true }), option('queue', `VIEW QUEUE · ${this.queue.length}`), option('current', 'NOW PLAYING', { disabled: !this.track }));
    controls.push(back);
    return {
      title: queued ? 'THE PLAY QUEUE' : 'OMARCHY JUKEBOX', subtitle: `${list.length} ${list.length === 1 ? 'TRACK' : 'TRACKS'} · PAGE ${this.page + 1} OF ${this.pageCount}`,
      text: queued ? this.queue.length ? 'Select a queued track to remove it. The queue plays in the order shown.' : 'The queue is empty. Choose Track library to add music.' : current,
      layout: 'jukebox', rows: rows.length, footerColumns: 3, options: [...rows, ...controls],
    };
  }

  retire() {
    const audio = this.audio; this.audio = null;
    this.detach.splice(0).forEach((detach) => detach());
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio.remove(); }
  }

  dispose() { this.pause(); this.disposed = true; this.retire(); }
}
