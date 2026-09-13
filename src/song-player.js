export class SongPlayer {
  constructor({ onChange = () => {}, onError = () => {} } = {}) {
    this.onChange = onChange;
    this.onError = onError;
    this.pending = false;
    this.error = '';
    this.request = 0;
    this.audio = new Audio(new URL('../assets/omarchy-tokyo-nights.mp3', import.meta.url).href);
    this.audio.id = 'song-audio';
    this.audio.preload = 'none';
    this.audio.volume = .65;
    this.audio.hidden = true;
    document.body.append(this.audio);
    ['playing', 'pause', 'ended'].forEach((type) => this.audio.addEventListener(type, () => this.notify()));
    this.audio.addEventListener('error', () => {
      this.pending = false;
      this.error = 'The song cannot play. Check the connection, then select Play song again.';
      this.notify();
      this.onError(this.error);
    });
  }

  get playing() { return !this.audio.paused && !this.audio.ended && !this.audio.error; }

  notify() { this.onChange({ playing: this.playing, pending: this.pending, error: this.error }); }

  async play() {
    const request = ++this.request;
    this.pending = true;
    this.error = '';
    this.notify();
    try {
      if (this.audio.error) this.audio.load();
      if (this.audio.ended) this.audio.currentTime = 0;
      await this.audio.play();
    } catch (error) {
      if (request === this.request && error.name !== 'AbortError') {
        this.error = 'The song cannot start. Select Play song again to allow audio.';
        this.onError(this.error);
      }
    } finally {
      if (request === this.request) { this.pending = false; this.notify(); }
    }
  }

  pause() {
    this.request++;
    this.pending = false;
    this.error = '';
    this.audio.pause();
    this.notify();
  }

  toggle() { if (this.playing || this.pending) this.pause(); else void this.play(); }

  dispose() {
    this.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.audio.remove();
  }
}

export function updateSongButton(button, state) {
  const label = button.querySelector('[data-song-label]') || button;
  label.textContent = state.pending ? 'LOAD SONG' : state.playing ? 'PAUSE SONG' : 'PLAY SONG';
  button.setAttribute('aria-pressed', String(state.playing));
  button.setAttribute('aria-label', state.pending ? 'Cancel song load' : state.playing ? 'Pause MP3 song' : 'Play MP3 song');
}

export function updateSongStatus(element, state) {
  element.hidden = !state.pending && !state.error;
  element.dataset.state = state.error ? 'error' : 'pending';
  element.textContent = state.error || 'The song loads. Select the song button to cancel.';
}
