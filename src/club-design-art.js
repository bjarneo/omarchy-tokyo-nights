import { DESIGN_DESKS, STUDIO_PALETTES } from './club-design.mjs';

const rect = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const label = (ctx, text, x, y, size, color, family = '"Courier New", monospace') => {
  ctx.fillStyle = color; ctx.font = `bold ${size}px ${family}`; ctx.fillText(text, x, y);
};

function pixelMark(ctx, kind, x, y, size, color) {
  const cursor = ['#...........', '##..........', '###.........', '####........', '#####.......', '######......', '#######.....', '########....', '#####.......', '##.###......', '#...###.....', '.....##.....'];
  ctx.fillStyle = color;
  if (kind === 0) cursor.forEach((row, iy) => [...row].forEach((pixel, ix) => { if (pixel === '#') ctx.fillRect(x + ix * size, y + iy * size, size, size); }));
  else if (kind === 1) {
    for (let i = 0; i < 9; i++) ctx.fillRect(x + (i + 1) * size, y + (10 - i) * size, size * 3, size * 2);
    ctx.fillRect(x, y + size * 11, size * 2, size * 2); ctx.fillRect(x + 9 * size, y, size * 3, size * 2);
  } else {
    ctx.fillRect(x, y + size, size * 12, size * 2); ctx.fillRect(x, y + size * 3, size, size * 8);
    ctx.fillRect(x + size * 11, y + size * 3, size, size * 8); ctx.fillRect(x, y + size * 11, size * 12, size);
    ctx.fillRect(x + size * 2, y + size * 5, size * 4, size); ctx.fillRect(x + size * 2, y + size * 7, size * 7, size);
  }
}

export function drawDesignPoster(ctx, state, width = 768, height = 432, reducedMotion = false) {
  const p = STUDIO_PALETTES[state.palette]; const family = state.type === 1 ? '"Courier New", monospace' : 'Arcade, monospace';
  const displaySize = state.type === 1 ? 55 : 37;
  const clock = reducedMotion ? 0 : state.clock;
  const step = state.motion === 1 ? Math.round(Math.sin(clock * 1.6) * 2) * 10 : 0;
  const pulse = state.motion === 2 ? 1 + Math.sin(clock * 2.4) * .06 : 1;
  const mark = (x, y, color, size = 13) => {
    ctx.save(); ctx.translate(x + step, y); ctx.scale(pulse, pulse); pixelMark(ctx, state.icon, -size * 6, -size * 6, size, color); ctx.restore();
  };
  ctx.save(); ctx.scale(width / 768, height / 432); ctx.textAlign = 'left'; ctx.imageSmoothingEnabled = false;
  rect(ctx, 0, 0, 768, 432, p.background);
  if (state.layout === 0) {
    label(ctx, 'MIDNIGHT', 42, 104, displaySize, p.foreground, family);
    label(ctx, 'DESIGN', 42, 184, displaySize, p.accent, state.type === 2 ? '"Courier New", monospace' : family);
    label(ctx, 'CLUB', 42, 264, displaySize, p.foreground, family);
    rect(ctx, 465, 50, 253, 284, p.secondary); mark(593, 189, p.background, 15);
    rect(ctx, 42, 309, 346, 5, p.accent);
  } else if (state.layout === 1) {
    rect(ctx, 384, 0, 384, 432, p.secondary); mark(582, 204, p.background, 17);
    label(ctx, 'MIDNIGHT', 28, 125, displaySize, p.foreground, family);
    label(ctx, 'DESIGN', 28, 200, displaySize, p.accent, state.type === 2 ? '"Courier New", monospace' : family);
    label(ctx, 'CLUB', 28, 275, displaySize, p.foreground, family);
  } else {
    label(ctx, 'MIDNIGHT', 40, 78, state.type === 1 ? 51 : 34, p.foreground, family);
    rect(ctx, 40, 110, 688, 3, p.foreground); rect(ctx, 40, 138, 214, 185, p.secondary); mark(149, 229, p.background, 11);
    label(ctx, 'DESIGN', 294, 190, displaySize, p.accent, state.type === 2 ? '"Courier New", monospace' : family);
    label(ctx, 'CLUB', 294, 270, displaySize, p.foreground, family);
  }
  label(ctx, 'OMARCHY DESIGN STUDIO', 40, 367, 20, p.foreground);
  label(ctx, `${DESIGN_DESKS.layout.labels[state.layout]} · ${DESIGN_DESKS.icon.labels[state.icon]}`, 40, 402, 17, p.foreground);
  if (state.layout !== 1) [p.foreground, p.accent, p.secondary].forEach((color, i) => rect(ctx, 632 + i * 32, 368, 24, 24, color));
  ctx.restore();
}

export function designStudy(kind) {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext('2d'); const ink = '#24283b';
  rect(ctx, 0, 0, 640, 360, '#e6dec6'); label(ctx, kind.toUpperCase(), 30, 63, 40, ink, 'Arcade, monospace');
  if (kind === 'color') {
    ['#9ece6a', '#7dcfff', '#bb9af7', '#f7768e', '#e0af68'].forEach((color, i) => {
      rect(ctx, 31 + i * 116, 102 + i % 2 * 20, 110, 149, ink); rect(ctx, 36 + i * 116, 107 + i % 2 * 20, 100, 139, color);
    });
    label(ctx, 'BACKGROUND / TEXT / ACCENT', 31, 298, 24, ink);
  } else if (kind === 'type') {
    label(ctx, 'Aa', 38, 226, 130, ink, 'Arcade, monospace'); label(ctx, 'Aa', 365, 226, 138, '#315a78');
    label(ctx, 'PIXEL', 42, 286, 25, ink); label(ctx, 'TERMINAL', 365, 286, 25, ink);
  } else {
    for (let i = 0; i < 3; i++) {
      const x = 35 + i * 202; rect(ctx, x, 107, 168, 173, '#c5bba3');
      if (i === 0) { rect(ctx, x + 14, 121, 140, 35, ink); rect(ctx, x + 14, 168, 140, 76, '#9d3546'); }
      else if (i === 1) { rect(ctx, x + 14, 121, 64, 123, ink); rect(ctx, x + 88, 121, 64, 123, '#315a78'); }
      else for (let cell = 0; cell < 4; cell++) rect(ctx, x + 14 + cell % 2 * 74, 121 + Math.floor(cell / 2) * 67, 66, 58, cell % 2 ? '#315a78' : ink);
      label(ctx, ['POSTER', 'SPLIT', 'GRID'][i], x + 14, 305, 21, ink);
    }
  }
  label(ctx, 'OMARCHY DESIGN STUDIO', 30, 344, 18, ink); return canvas;
}
