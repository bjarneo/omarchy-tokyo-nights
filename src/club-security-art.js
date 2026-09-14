const C = { ink: '#16161e', paper: '#c0caf5', pink: '#f7768e', cyan: '#7dcfff', gold: '#e0af68', green: '#9ece6a', purple: '#bb9af7' };
const rect = (ctx, x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const text = (ctx, value, x, y, size, color = C.paper) => { ctx.fillStyle = color; ctx.font = `bold ${size}px "Courier New", monospace`; ctx.fillText(value, x, y); };

function foxFurHat(ctx) {
  rect(ctx, 16, 2, 17, 3, '#8f887b'); rect(ctx, 11, 4, 27, 5, '#8f887b');
  rect(ctx, 8, 8, 33, 6, '#797367'); rect(ctx, 10, 13, 29, 3, '#686257');
  for (const [x, y, w, h] of [[12, 3, 3, 3], [9, 5, 3, 4], [7, 10, 3, 3], [35, 3, 2, 4], [38, 6, 3, 4], [40, 10, 2, 3], [11, 15, 5, 2], [28, 15, 6, 2]]) rect(ctx, x, y, w, h, '#797367');
  for (const [x, y, h] of [[14, 4, 4], [19, 3, 5], [25, 4, 4], [31, 3, 4], [35, 6, 5], [10, 9, 4], [16, 8, 5], [23, 8, 5], [29, 7, 5], [37, 11, 3]]) {
    rect(ctx, x, y, 2, h, '#b4ac9d'); rect(ctx, x - 1, y + h - 1, 1, 2, '#9e9585');
  }
  for (const [x, y, h] of [[12, 8, 5], [18, 7, 5], [21, 5, 3], [26, 9, 6], [32, 9, 5], [36, 12, 4]]) rect(ctx, x, y, 1, h, '#49483f');
  rect(ctx, 14, 12, 3, 2, '#9e8062'); rect(ctx, 29, 5, 3, 2, '#9e8062');
}

export function makeSecurityCharacter(npc, facing = 'smile') {
  const canvas = document.createElement('canvas'); canvas.width = 48; canvas.height = 104;
  const ctx = canvas.getContext('2d'); const p = npc.appearance;
  rect(ctx, 13, 66, 10, 31, '#343b58'); rect(ctx, 26, 66, 10, 31, '#343b58');
  rect(ctx, 14, 72, 2, 24, '#565f89'); rect(ctx, 33, 70, 3, 26, '#24283b');
  rect(ctx, 10, 96, 14, 6, '#16161e'); rect(ctx, 26, 96, 15, 6, '#16161e');
  rect(ctx, 10, 101, 14, 2, '#9aa5ce'); rect(ctx, 26, 101, 15, 2, '#9aa5ce');
  rect(ctx, 13, 32, 23, 36, p.top); rect(ctx, 10, 35, 5, 27, p.top); rect(ctx, 35, 35, 5, 27, p.top);
  rect(ctx, 7, 39, 5, 17, p.top); rect(ctx, 38, 39, 5, 17, p.top);
  rect(ctx, 7, 55, 5, 9, p.skin); rect(ctx, 38, 55, 5, 9, p.skin);
  rect(ctx, 14, 38, 2, 27, p.trim); rect(ctx, 16, 67, 18, 3, '#202331');
  if (p.style === 'plaid') {
    for (let y = 37; y < 64; y += 8) rect(ctx, 15, y, 20, 3, p.trim);
    for (let x = 17; x < 35; x += 8) rect(ctx, x, 35, 3, 31, p.trim);
    rect(ctx, 23, 33, 3, 34, '#24283b');
  }
  if (p.style === 'stripes') for (let y = 36; y < 66; y += 6) rect(ctx, 15, y, 20, 2, p.trim);
  if (p.style === 'coat' || p.style === 'hoodie') {
    rect(ctx, 14, 33, 7, 6, p.trim); rect(ctx, 29, 33, 7, 6, p.trim);
    rect(ctx, 21, 34, 7, 32, '#24283b'); rect(ctx, 19, 39, 1, 14, C.paper); rect(ctx, 29, 39, 1, 14, C.paper);
  }
  rect(ctx, 29, 47, 4, 6, C.paper); rect(ctx, 30, 48, 2, 3, '#343b58');
  rect(ctx, 20, 28, 9, 7, p.shade);
  rect(ctx, 13, 7, 23, 22, p.shade); rect(ctx, 15, 6, 19, 25, p.skin);
  rect(ctx, 11, 16, 3, 8, p.skin); rect(ctx, 35, 16, 3, 8, p.shade);
  rect(ctx, 13, 4, 23, 8, p.hair); rect(ctx, 16, 2, 17, 5, p.hair);
  rect(ctx, 12, 9, 4, 7, p.hair); rect(ctx, 33, 7, 4, 9, p.hair);
  rect(ctx, 17, 5, 8, 2, '#6b5545'); rect(ctx, 29, 8, 4, 2, '#6b5545');
  if (p.spikes) { rect(ctx, 18, 2, 3, 5, p.hair); rect(ctx, 25, 1, 3, 6, p.hair); rect(ctx, 30, 3, 3, 5, p.hair); }
  if (p.beanie) {
    rect(ctx, 11, 4, 27, 11, '#343b58'); rect(ctx, 14, 2, 21, 5, '#343b58');
    rect(ctx, 10, 12, 29, 4, '#565f89');
    for (let x = 13; x < 37; x += 4) rect(ctx, x, 6 + x % 3, 2, 4, '#414868');
    rect(ctx, 21, 7, 7, 3, C.gold);
  }
  if (facing === 'back') {
    rect(ctx, 13, 13, 23, 16, p.hair); rect(ctx, 17, 26, 15, 5, p.hair);
    if (p.hat === 'fox-fur') foxFurHat(ctx);
    return canvas;
  }
  if (p.beard) {
    rect(ctx, 15, 24, 19, 6, p.hair); rect(ctx, 18, 29, 13, 3, p.hair);
    rect(ctx, 14, 21, 3, 5, p.hair); rect(ctx, 32, 21, 3, 5, p.hair);
  }
  rect(ctx, 23, 20, 3, 5, p.shade);
  if (p.glasses) {
    rect(ctx, 12, 16, 25, 2, '#151925'); rect(ctx, 14, 17, 9, 5, '#151925'); rect(ctx, 26, 17, 9, 5, '#151925');
    rect(ctx, 15, 17, 5, 1, '#7aa2f7'); rect(ctx, 27, 17, 5, 1, '#7aa2f7');
  } else {
    rect(ctx, 16, 16, 6, 1, p.hair); rect(ctx, 28, 16, 5, 1, p.hair);
    rect(ctx, 18, 18, 3, 2, '#16161e'); rect(ctx, 29, 18, 3, 2, '#16161e');
  }
  rect(ctx, 21, 27, 9, 2, '#e5ddc8');
  if (facing === 'profile') {
    rect(ctx, 12, 14, 10, 13, p.hair); rect(ctx, 22, 17, 3, 6, p.skin);
    rect(ctx, 35, 20, 3, 3, p.skin); rect(ctx, 25, 27, 7, 2, '#e5ddc8');
  }
  if (p.hat === 'fox-fur') foxFurHat(ctx);
  return canvas;
}

function trace(ctx, points, color, width = 5) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
}

function monitor(ctx, x, y, color) {
  rect(ctx, x, y, 112, 76, color); rect(ctx, x + 7, y + 7, 98, 58, C.ink);
  text(ctx, '>_', x + 16, y + 43, 28, color);
  rect(ctx, x + 48, y + 76, 16, 14, color); rect(ctx, x + 26, y + 90, 60, 6, color);
}

function shield(ctx, x, y, color) {
  for (let row = 0; row < 9; row++) {
    const inset = row < 4 ? 0 : (row - 3) * 7;
    rect(ctx, x + inset, y + row * 10, 94 - inset * 2, 10, color);
  }
  trace(ctx, [[x + 25, y + 35], [x + 41, y + 51], [x + 69, y + 23]], C.ink, 9);
}

export function securityPoster(kind) {
  const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
  const ctx = canvas.getContext('2d'); const red = kind === 'red'; const blue = kind === 'blue';
  const color = red ? C.pink : blue ? C.cyan : kind === 'zero' ? C.gold : C.green;
  rect(ctx, 0, 0, 640, 360, red ? '#422c3c' : blue ? '#233d57' : C.ink);
  rect(ctx, 16, 16, 608, 4, color);
  text(ctx, red ? 'RED TEAM' : blue ? 'BLUE TEAM' : kind === 'zero' ? '0-DAY RESEARCH' : 'DIGITAL FORENSICS', 30, 69, 42, color);
  if (red) {
    monitor(ctx, 47, 133, color);
    trace(ctx, [[167, 163], [237, 163], [237, 208], [337, 208], [337, 142], [423, 142]], color);
    rect(ctx, 213, 147, 30, 30, C.gold); text(ctx, '?', 220, 169, 24, C.ink);
    rect(ctx, 316, 187, 40, 40, color); text(ctx, '!', 328, 216, 30, C.ink);
    rect(ctx, 440, 159, 112, 83, color); rect(ctx, 453, 105, 22, 54, color); rect(ctx, 465, 102, 62, 19, color);
    rect(ctx, 496, 174, 12, 39, C.ink); rect(ctx, 486, 176, 32, 18, C.ink);
    text(ctx, 'SCOPE  >  PROBE  >  REPORT', 47, 286, 26);
  } else if (blue) {
    monitor(ctx, 44, 135, color); shield(ctx, 279, 144, color);
    trace(ctx, [[158, 174], [279, 174]], color);
    for (const y of [127, 185, 243]) {
      trace(ctx, [[373, 182], [427, 182], [427, y], [482, y]], color, 4);
      rect(ctx, 482, y - 15, 87, 30, '#34546c'); rect(ctx, 492, y - 6, 12, 12, C.green);
      rect(ctx, 514, y - 4, 43, 3, C.cyan); rect(ctx, 514, y + 3, 31, 3, C.cyan);
    }
    text(ctx, 'DETECT  >  CONTAIN  >  RESTORE', 36, 292, 24);
  } else if (kind === 'zero') {
    monitor(ctx, 40, 132, color);
    text(ctx, 'INPUT', 206, 137, 23, color); text(ctx, 'length = 64', 206, 172, 22);
    text(ctx, 'buffer = 17', 206, 204, 22);
    for (let i = 0; i < 8; i++) rect(ctx, 208 + i * 43, 232, 35, 27, i < 3 ? C.green : C.pink);
    text(ctx, 'REPRODUCE > REDUCE > REPAIR', 35, 303, 24, color);
  } else {
    for (let i = 0; i < 3; i++) {
      rect(ctx, 48 + i * 197, 131, 130, 103, '#343b58');
      for (let j = 0; j < 4; j++) rect(ctx, 61 + i * 197, 149 + j * 17, 101 - j * 11, 5, color);
      text(ctx, ['IMAGE', 'HASH', 'TIMELINE'][i], 53 + i * 197, 269, 20, color);
      if (i < 2) trace(ctx, [[184 + i * 197, 177], [232 + i * 197, 177]], color, 4);
    }
    text(ctx, 'PRESERVE THE EVIDENCE', 47, 305, 27);
  }
  text(ctx, 'MIDNIGHT SECURITY LAB · LOCAL SIMULATION', 30, 340, 17, C.paper);
  return canvas;
}

export function commandBoard(crew) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 320;
  const ctx = canvas.getContext('2d'); rect(ctx, 0, 0, 1024, 320, C.ink);
  text(ctx, 'OMARCHY SECURITY', 36, 58, 44, C.green);
  text(ctx, 'PENTEST · 0-DAY · DEFENSE · FORENSICS · REVERSE', 36, 99, 23, C.cyan);
  crew.forEach((npc, i) => {
    const x = 36 + i * 198;
    ctx.drawImage(makeSecurityCharacter(npc), x + 52, 124, 48, 104);
    const parts = npc.name.split(' ');
    text(ctx, parts[0], x, 257, 19); text(ctx, parts.slice(1).join(' '), x, 280, 19);
    text(ctx, npc.country, x, 307, 16, C.gold);
  });
  return canvas;
}
