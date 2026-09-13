import { rocketFlightPhase } from './rocket.mjs';
import { rocketThemeAt, blendColor } from './rocket-themes.mjs';

const C = { night: '#16161e', panel: '#24283b', line: '#414868', white: '#e5e9ff', metal: '#c0caf5', shadow: '#7b86ac', blue: '#7aa2f7', cyan: '#7dcfff', pink: '#f7768e', purple: '#bb9af7', gold: '#e0af68', orange: '#ff9e64' };
const hash = (i) => { const n = Math.sin(i * 127.1 + 17.3) * 43758.5453; return n - Math.floor(n); };
const ease = (t) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(Math.round(x), Math.round(y)) : ctx.moveTo(Math.round(x), Math.round(y)));
  ctx.closePath();
  ctx.fill();
}

function disk(ctx, x, y, radius, color) {
  for (let row = -Math.ceil(radius); row <= radius; row++) {
    const half = Math.floor(Math.sqrt(Math.max(0, radius * radius - row * row)));
    rect(ctx, x - half, y + row, half * 2 + 1, 1, color);
  }
}

export function drawRocket(ctx, x, y, scale, { logo, car, open = false, thrust = 0, time = 0, reducedMotion = false, colors = C } = {}) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  ctx.translate(-80, -212);
  if (thrust > 0) {
    const pulse = reducedMotion ? 0 : Math.sin(time * 37) * 8;
    for (const nozzle of [52, 80, 108]) {
      const length = 25 + thrust * 92 + pulse + (nozzle === 80 ? 18 : 0);
      poly(ctx, [[nozzle - 11, 188], [nozzle + 11, 188], [nozzle + 18, 214], [nozzle + 7, 208 + length * .6], [nozzle, 204 + length], [nozzle - 8, 207 + length * .65], [nozzle - 18, 217]], colors.purple);
      poly(ctx, [[nozzle - 8, 188], [nozzle + 8, 188], [nozzle + 10, 212], [nozzle, 201 + length * .86], [nozzle - 11, 215]], colors.cyan);
      poly(ctx, [[nozzle - 5, 188], [nozzle + 5, 188], [nozzle + 5, 212], [nozzle, 199 + length * .57], [nozzle - 6, 211]], colors.white);
    }
  }
  poly(ctx, [[80, 0], [48, 39], [112, 39]], colors.purple);
  poly(ctx, [[80, 0], [80, 39], [112, 39]], blendColor(colors.purple, colors.night, .25));
  rect(ctx, 45, 39, 70, 147, colors.metal);
  rect(ctx, 45, 40, 10, 144, colors.shadow);
  rect(ctx, 103, 40, 12, 145, blendColor(colors.metal, colors.shadow, .4));
  rect(ctx, 56, 41, 6, 91, colors.white);
  rect(ctx, 43, 103, 74, 7, colors.cyan);
  disk(ctx, 80, 61, 14, colors.line);
  disk(ctx, 80, 61, 10, colors.night);
  rect(ctx, 75, 54, 5, 4, colors.cyan);
  rect(ctx, 81, 59, 5, 2, colors.blue);
  rect(ctx, 49, 80, 62, 19, C.night);
  if (logo) ctx.drawImage(logo, 53, 83, 54, Math.round(54 * logo.height / logo.width));
  poly(ctx, [[45, 125], [14, 170], [10, 202], [45, 180]], colors.blue);
  poly(ctx, [[115, 125], [146, 170], [150, 202], [115, 180]], colors.cyan);
  rect(ctx, 48, 132, 64, 54, colors.line);
  rect(ctx, 52, 136, 56, 48, open ? colors.night : colors.shadow);
  if (open) {
    rect(ctx, 55, 139, 3, 42, colors.cyan);
    rect(ctx, 102, 139, 3, 42, colors.cyan);
    rect(ctx, 60, 177, 40, 3, colors.gold);
  } else {
    rect(ctx, 57, 147, 46, 27, C.night);
    if (car) ctx.drawImage(car, 59, 148, 42, 24);
    rect(ctx, 52, 179, 56, 3, colors.shadow);
  }
  rect(ctx, 43, 186, 74, 6, colors.shadow);
  for (const nozzle of [52, 80, 108]) {
    rect(ctx, nozzle - 8, 191, 16, 8, colors.line);
    rect(ctx, nozzle - 6, 197, 12, 3, colors.night);
  }
  if (thrust < .2) {
    rect(ctx, 31, 186, 5, 25, colors.line);
    rect(ctx, 124, 186, 5, 25, colors.line);
    rect(ctx, 22, 209, 19, 3, colors.shadow);
    rect(ctx, 119, 209, 19, 3, colors.shadow);
  }
  ctx.restore();
}

function stars(ctx, w, h, time, fast, reducedMotion, colors = [C.cyan, C.purple, C.white, C.blue]) {
  const cx = w * .5;
  const cy = h * .39;
  const count = fast && !reducedMotion ? 130 : 75;
  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    if (!fast || reducedMotion) {
      rect(ctx, hash(i + 1) * w, (hash(i + 97) * h + (reducedMotion ? 0 : time * 16)) % h, i % 8 ? 1 : 2, 1, color);
      continue;
    }
    const angle = i * 2.39996;
    const p = (time * (.65 + hash(i) * .6) + hash(i + 43)) % 1;
    const radius = 20 + p * p * Math.max(w, h) * .78;
    const end = radius + 8 + p * p * 85;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    poly(ctx, [[x, y], [cx + Math.cos(angle) * end, cy + Math.sin(angle) * end], [cx + Math.cos(angle) * end + 1 + p, cy + Math.sin(angle) * end + 1]], color);
  }
}

function earth(ctx, x, y, radius) {
  disk(ctx, x, y, radius + 2, '#414868');
  disk(ctx, x, y, radius, '#7aa2f7');
  rect(ctx, x - radius * .6, y - radius * .25, radius * .7, radius * .3, '#9ece6a');
  rect(ctx, x - radius * .2, y, radius * .5, radius * .45, '#679e79');
  rect(ctx, x + radius * .3, y - radius * .4, radius * .35, radius * .2, '#9ece6a');
  rect(ctx, x - radius * .55, y - radius * .58, radius, 2, C.white);
}

function launchGround(ctx, w, h, time, palette) {
  const rise = Math.max(0, (time - 2) / 4);
  const horizon = h * (.59 + rise * .72);
  for (let i = 0; i < 23; i++) {
    const height = 15 + hash(i + 7) * 45;
    const x = i * w / 22;
    rect(ctx, x, horizon - height, w / 25, height, palette.lighter_background);
    for (let row = 0; row < height - 8; row += 8) rect(ctx, x + 4, horizon - height + row + 5, 3, 2, i % 2 ? palette.blue : palette.magenta);
  }
  rect(ctx, 0, horizon, w, h, palette.dark_background);
  rect(ctx, w * .3, horizon + 18, w * .5, 3, palette.cyan);
  rect(ctx, w * .27, horizon + 32, w * .56, 2, palette.muted);
}

function themeRings(ctx, w, h, time, colors, reducedMotion) {
  const cx = w * .5;
  const cy = h * .39;
  for (let gate = 0; gate < 4; gate++) {
    const depth = ((reducedMotion ? .12 : time * .42) + gate / 4) % 1;
    const radius = (12 + depth * depth * Math.max(w, h) * .85);
    const inner = radius - 1 - depth * depth * 8;
    for (let i = 0; i < colors.length; i++) {
      const a = i / colors.length * Math.PI * 2;
      const b = (i + .86) / colors.length * Math.PI * 2;
      poly(ctx, [[cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * .7], [cx + Math.cos(b) * radius, cy + Math.sin(b) * radius * .7], [cx + Math.cos(b) * inner, cy + Math.sin(b) * inner * .7], [cx + Math.cos(a) * inner, cy + Math.sin(a) * inner * .7]], colors[i]);
    }
  }
}

export function renderRocketFlight(ctx, w, h, game, { logo, car, reducedMotion = false } = {}) {
  const flight = rocketFlightPhase(game.rocketTime);
  const t = flight.time;
  const theme = rocketThemeAt(t);
  rect(ctx, 0, 0, w, h, blendColor(theme.palette.darker_background, '#101321', .75));
  themeRings(ctx, w, h, t, theme.colors, reducedMotion);
  stars(ctx, w, h, t, flight.phase === 'warp', reducedMotion, theme.colors);
  if (t < 6) launchGround(ctx, w, h, t, theme.palette);
  if (t >= 6 && t < 12) earth(ctx, w * .18, h * .7 + (t - 6) * 12, Math.max(8, 40 - (t - 6) * 5));
  if (t >= 14) {
    const approach = Math.max(0, (t - 16) / 4);
    const radius = h * (.06 + approach * .75);
    const x = w * .73 - approach * w * .21;
    const y = h * (.22 + approach * .9);
    disk(ctx, x, y, radius, '#c97868');
    disk(ctx, x + radius * .22, y + radius * .16, radius * .18, '#9e5960');
    disk(ctx, x - radius * .36, y - radius * .17, radius * .12, '#ad6262');
  }
  const boarding = t < 2;
  const launch = Math.max(0, Math.min(1, (t - 2) / 4));
  const shipScale = h / 360 * (boarding ? .91 : .91 - launch * .25);
  const shipX = w * .57 + (reducedMotion || boarding ? 0 : Math.sin(t * 24) * (flight.phase === 'warp' ? 3 : 1.5));
  const shipY = h * (boarding ? .82 : .82 - launch * .09);
  drawRocket(ctx, shipX, shipY, shipScale, { logo, car, open: t < 1.65, thrust: flight.thrust, time: t, reducedMotion, colors: theme.hull });
  if (t < 1.65 && car) {
    const enter = ease(t / 1.65);
    const cw = (96 - enter * 60) * h / 360;
    const ch = cw * 55 / 96;
    const x = w * .28 + (shipX - w * .28) * enter;
    const y = h * .95 - enter * h * .22;
    ctx.drawImage(car, Math.round(x - cw / 2), Math.round(y - ch), Math.round(cw), Math.round(ch));
  }
  if (flight.phase === 'warp' && !reducedMotion) {
    for (let i = 0; i < 18; i++) {
      const y = (t * 180 + i * 37) % h;
      const side = i % 2 ? 1 : -1;
      rect(ctx, w * .5 + side * (w * .35 + hash(i) * w * .13), y, 2, 10 + hash(i + 3) * 34, theme.colors[i % theme.colors.length]);
    }
  }
}

export function renderMars(ctx, w, h, { logo, car, figure, patronPoster } = {}) {
  rect(ctx, 0, 0, w, h, '#222238');
  stars(ctx, w, h * .6, 0, false, true);
  earth(ctx, w * .16, h * .18, 11);
  poly(ctx, [[0, h * .5], [w * .18, h * .39], [w * .31, h * .5], [w * .49, h * .34], [w * .73, h * .48], [w, h * .38], [w, h], [0, h]], '#854f5d');
  poly(ctx, [[0, h * .62], [w * .25, h * .52], [w * .5, h * .63], [w * .73, h * .5], [w, h * .58], [w, h], [0, h]], '#bd7162');
  rect(ctx, 0, h * .75, w, h * .25, '#a76158');
  for (let i = 0; i < 24; i++) rect(ctx, hash(i + 10) * w, h * (.64 + hash(i + 64) * .32), 3 + hash(i) * 10, 2, i % 2 ? '#e0af6855' : '#693f5033');
  const baseX = w * .08;
  const baseY = h * .4;
  rect(ctx, baseX, baseY, w * .36, h * .23, '#343b58');
  rect(ctx, baseX - 4, baseY - 4, w * .36 + 8, 4, C.cyan);
  rect(ctx, baseX + 8, baseY + 12, w * .36 - 16, 31, C.night);
  if (logo) ctx.drawImage(logo, Math.round(baseX + w * .18 - 48), Math.round(baseY + 17), 96, Math.round(96 * logo.height / logo.width));
  rect(ctx, baseX + w * .26, baseY + h * .14, w * .07, h * .09, '#7dcfff');
  for (let i = 0; i < 3; i++) rect(ctx, baseX + 12 + i * 14, baseY + h * .16, 9, 9, '#7aa2f7');
  if (patronPoster) {
    const width = Math.round(Math.min(w * .22, h * .1 * 160 / 88));
    ctx.drawImage(patronPoster, Math.round(baseX + 8), Math.round(baseY + h * .13), width, Math.round(width * 88 / 160));
  }
  drawRocket(ctx, w * .77, h * (w < 600 ? .61 : .75), h / 360 * .69, { logo, car, open: true });
  if (car) ctx.drawImage(car, Math.round(w * .41), Math.round(h * (w < 600 ? .59 : .69) - 48), 84, 48);
  if (figure) ctx.drawImage(figure, Math.round(w * .43 - 44), Math.round(h * (w < 600 ? .6 : .7) - 96), 44, 96);
  rect(ctx, w * .58, h * .41, 2, h * .3, C.metal);
  rect(ctx, w * .58 + 2, h * .41, 56, 24, C.night);
  if (logo) ctx.drawImage(logo, Math.round(w * .58 + 5), Math.round(h * .41 + 5), 49, Math.round(49 * logo.height / logo.width));
}
