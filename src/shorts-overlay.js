import { clamp } from './engine.mjs';
import { SONG, indexAt } from './song.mjs';
import { shortLyrics } from './shorts.mjs';

export class ShortsOverlay {
  constructor(clip, cues) {
    this.clip = clip;
    this.lyrics = shortLyrics(clip, cues);
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1080;
    this.canvas.height = 1920;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.textBaseline = 'top';
  }

  text(value, x, y, size, color) {
    this.ctx.font = `${size}px Arcade`;
    this.ctx.fillStyle = color;
    this.ctx.fillText(value, x, y);
  }

  wrap(words, size) {
    this.ctx.font = `${size}px Arcade`;
    const lines = [[]];
    let width = 0;
    for (const word of words) {
      const wordWidth = this.ctx.measureText(word.text + ' ').width;
      if (width + wordWidth > 888 && lines.at(-1).length) { lines.push([]); width = 0; }
      lines.at(-1).push({ ...word, width: wordWidth });
      width += wordWidth;
    }
    return lines;
  }

  render(time) {
    const { ctx, clip } = this;
    ctx.clearRect(0, 0, 1080, 1920);
    this.text(clip.title[0], 86, 142, 56, '#c0caf5');
    this.text(clip.title[1], 86, 218, 56, clip.accent);
    this.text(SONG.title.toUpperCase(), 90, 306, 20, '#9aa5ce');
    const lyric = this.lyrics[indexAt(this.lyrics, Math.round(time * 1000) / 1000)];
    if (lyric && time < lyric.end) {
      let size = 40;
      let lines = this.wrap(lyric.words, size);
      if (lines.length > 3) { size = 36; lines = this.wrap(lyric.words, size); }
      for (const [row, words] of lines.entries()) {
        let x = 90;
        const y = 1470 + row * 55;
        for (const word of words) {
          this.text(word.text, x, y, size, '#c0caf5');
          const progress = clamp((time - word.start) / Math.max(.06, word.end - word.start), 0, 1);
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, word.width * progress, size + 8);
          ctx.clip();
          this.text(word.text, x, y, size, clip.accent);
          ctx.restore();
          x += word.width;
        }
      }
    }
    ctx.fillStyle = clip.accent;
    ctx.fillRect(90, 1650, 64, 3);
    this.text(SONG.artist.toUpperCase(), 90, 1680, 20, '#9aa5ce');
    return this.canvas.toDataURL('image/png').split(',')[1];
  }
}
