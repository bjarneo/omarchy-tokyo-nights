const EMBED_ORIGIN = 'https://www.youtube.com';

export class ClubCinema {
  constructor(dialog, { onClose = () => {} } = {}) {
    this.dialog = dialog;
    this.holder = dialog.querySelector('[data-video-screen]');
    this.status = dialog.querySelector('[data-video-status]');
    dialog.querySelector('[data-video-retry]').addEventListener('click', () => this.load());
    dialog.querySelector('[data-video-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { this.release(); onClose(); });
  }

  get open() { return this.dialog.open; }

  show() { if (!this.open) this.dialog.showModal(); this.load(); }

  load() {
    this.release();
    const frame = document.createElement('iframe'); this.frame = frame;
    frame.id = 'club-video-player'; frame.title = 'Omacon 2026 by The PrimeTime on YouTube';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = `${EMBED_ORIGIN}/embed/Bic2KjFFj6w?rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    this.status.textContent = 'The YouTube player loads. Playback uses this browser view.';
    this.timer = setTimeout(() => {
      if (this.frame === frame) this.status.textContent = 'The player has not responded. Select Retry player or Open on YouTube.';
    }, 15_000);
    frame.addEventListener('load', () => {
      if (this.frame !== frame) return;
      clearTimeout(this.timer);
      this.status.textContent = 'Use the YouTube controls to play. If playback is unavailable, select Open on YouTube.';
    });
    frame.addEventListener('error', () => {
      if (this.frame !== frame) return;
      clearTimeout(this.timer);
      this.status.textContent = 'The YouTube player cannot load. Select Retry player or Open on YouTube.';
    });
    this.holder.append(frame);
  }

  pause() { this.frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), EMBED_ORIGIN); }
  release() { clearTimeout(this.timer); this.holder.replaceChildren(); this.frame = null; }
  dispose() { this.release(); if (this.open) this.dialog.close(); }
}
