import { Renderer } from './renderer.js';
import { clamp } from './engine.mjs';
import { frameAt, SONG } from './song.mjs';

const W = 640;
const H = 360;
const C = {
  deep: '#16161e', night: '#1a1b26', road: '#24283b', line: '#414868',
  text: '#c0caf5', muted: '#9aa5ce', pink: '#f7768e', cyan: '#7dcfff',
  gold: '#ffd578', yellow: '#e0af68', blue: '#7aa2f7', purple: '#bb9af7',
};
const mod = (value, size) => (value % size + size) % size;
const ease = (value) => 1 - (1 - clamp(value, 0, 1)) ** 3;

function rect(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(width), Math.ceil(height));
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(Math.round(x), Math.round(y)) : ctx.moveTo(Math.round(x), Math.round(y)));
  ctx.closePath();
  ctx.fill();
}

function canvas(width, height) {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  element.getContext('2d').imageSmoothingEnabled = false;
  return element;
}

function makeSideCar() {
  const image = canvas(180, 66);
  const ctx = image.getContext('2d');
  rect(ctx, 11, 51, 157, 6, '#11131f');
  poly(ctx, [[8, 33], [26, 28], [57, 24], [78, 8], [116, 8], [144, 25], [167, 29], [174, 39], [174, 49], [11, 49], [5, 41]], C.yellow);
  poly(ctx, [[10, 34], [60, 28], [78, 11], [115, 11], [139, 26], [161, 31], [48, 34]], C.gold);
  poly(ctx, [[65, 26], [81, 12], [110, 12], [127, 26]], '#202b45');
  poly(ctx, [[68, 25], [83, 14], [107, 14], [112, 25]], '#414d70');
  rect(ctx, 88, 14, 2, 12, '#121824');
  poly(ctx, [[114, 15], [125, 24], [118, 24]], C.cyan);
  poly(ctx, [[72, 30], [119, 30], [117, 44], [57, 44]], '#c99a57');
  rect(ctx, 109, 32, 6, 2, '#73563b');
  poly(ctx, [[127, 31], [145, 31], [140, 40], [122, 40]], '#24283b');
  for (let i = 0; i < 4; i++) rect(ctx, 127 + i * 4, 31, 2, 8, '#916c40');
  rect(ctx, 8, 36, 164, 2, '#e7be7b');
  rect(ctx, 7, 44, 167, 5, '#ab7b3c');
  rect(ctx, 13, 49, 154, 3, '#4a3b35');
  rect(ctx, 146, 20, 4, 11, '#916c40');
  rect(ctx, 164, 20, 3, 10, '#916c40');
  rect(ctx, 143, 17, 32, 4, C.gold);
  rect(ctx, 9, 34, 10, 4, '#e5e9ff');
  rect(ctx, 165, 33, 7, 5, C.pink);
  for (const x of [38, 144]) {
    for (let y = -11; y <= 11; y++) {
      const half = Math.floor(Math.sqrt(121 - y * y));
      rect(ctx, x - half, 49 + y, half * 2 + 1, 1, '#10131f');
    }
    rect(ctx, x - 6, 42, 12, 14, '#686e88');
    rect(ctx, x - 7, 44, 14, 10, '#9aa5ce');
    rect(ctx, x - 4, 45, 8, 8, '#343b58');
    rect(ctx, x - 2, 47, 4, 4, C.text);
  }
  return image;
}

export class VideoRenderer {
  constructor(output, cues, analysis, { reducedMotion = false } = {}) {
    this.output = output;
    this.outputContext = output.getContext('2d', { alpha: false });
    this.canvas = canvas(W, H);
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.road = new Renderer(this.canvas, { reducedMotion });
    this.cues = cues;
    this.analysis = analysis;
    this.reducedMotion = reducedMotion;
    this.sideCar = makeSideCar();
    this.captions = true;
  }

  lettering(value, x, y, size, color = C.text, align = 'left', alpha = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${size}px Arcade`;
    ctx.textBaseline = 'top';
    ctx.textAlign = align;
    ctx.fillStyle = C.deep;
    ctx.fillText(value, Math.round(x + 1), Math.round(y + 2));
    ctx.fillStyle = color;
    ctx.fillText(value, Math.round(x), Math.round(y));
    ctx.restore();
  }

  sky(frame, panoramic = false) {
    const { ctx, road } = this;
    const shift = panoramic ? Math.round(mod(frame.distance * .07, 160)) : Math.round(80 + Math.sin(frame.time * .13) * 24);
    ctx.drawImage(road.background, shift, 0, W, road.horizon + 10, 0, 0, W, road.horizon + 10);
    if (frame.scene === 'alley' || frame.scene === 'shibuya') {
      for (const side of [-1, 1]) {
        const x = side < 0 ? 0 : 568;
        rect(ctx, x, 30, 72, 159, '#202338');
        for (let i = 0; i < 15; i++) {
          rect(ctx, x + 7, 40 + i * 9, 55, 1, '#343b58');
          rect(ctx, x + 11 + i % 3 * 16, 43 + i * 9, 9, 3, i % 2 ? '#7aa2f760' : '#e0af6850');
        }
        road.sign(ctx, x + 27, 62, side < 0 ? '東京' : 'ホテル', side < 0 ? C.pink : C.cyan, true, 3);
      }
    }
  }

  bridge(frame, sideView = false) {
    const ctx = this.ctx;
    if (sideView) {
      const offset = frame.reducedMotion ? 0 : mod(frame.distance * .12, 290);
      for (let i = -1; i < 4; i++) {
        const x = i * 290 - offset;
        rect(ctx, x, 69, 7, 124, '#9aa5ce');
        rect(ctx, x + 94, 69, 7, 124, '#9aa5ce');
        rect(ctx, x, 77, 101, 5, C.text);
        rect(ctx, x, 101, 101, 4, '#565f89');
        for (let dx = -145; dx < 145; dx += 8) {
          const height = 70 + (1 - Math.abs(dx) / 145) ** 2 * 71;
          rect(ctx, x + dx, height, 1, 198 - height, '#7aa2f750');
          rect(ctx, x + dx, height, 8, 2, '#9aa5ce');
        }
        rect(ctx, x - 145, 198, 290, 5, C.line);
      }
      return;
    }
    const road = this.road;
    for (let i = 5; i >= 0; i--) {
      const z = i * 145 + 30 - mod(road.distance, 145);
      if (z < 6) continue;
      const a = road.project(z, -1.04);
      const b = road.project(z, 1.04);
      const h = a.scale * 220;
      const top = a.y - h;
      rect(ctx, a.x, top, 7 * a.scale, h, '#9aa5ce');
      rect(ctx, b.x, top, 7 * a.scale, h, '#9aa5ce');
      rect(ctx, a.x, top, b.x - a.x, 7 * a.scale, '#c0caf5');
      rect(ctx, a.x, top + h * .18, b.x - a.x, 4 * a.scale, '#565f89');
      rect(ctx, a.x, top, b.x - a.x, 2 * a.scale, [C.pink, C.cyan, C.purple][i % 3]);
      for (const side of [-1, 1]) {
        const next = road.project(z + 145, side * 1.04);
        const current = side < 0 ? a : b;
        poly(ctx, [[current.x, top + 9 * a.scale], [next.x, next.y - 145 * next.scale], [next.x, next.y - 139 * next.scale], [current.x + 2, top + 9 * a.scale]], '#7aa2f7');
      }
    }
  }

  tunnel(frame) {
    const ctx = this.ctx;
    const road = this.road;
    poly(ctx, [[0, 0], [640, 0], [640, 130], [435, 172], [205, 172], [0, 130]], '#161923');
    poly(ctx, [[0, 0], [205, 157], [205, 191], [0, 360]], '#292a40');
    poly(ctx, [[640, 0], [435, 157], [435, 191], [640, 360]], '#292a40');
    for (let i = 16; i >= 0; i--) {
      const z = i * 35 - mod(road.distance, 35);
      if (z < 4) continue;
      const a = road.project(z, -1.12);
      const b = road.project(z, 1.12);
      const top = a.y - 220 * a.scale;
      const thickness = Math.max(1, 6 * a.scale);
      rect(ctx, a.x, top, thickness, a.y - top, '#41425e');
      rect(ctx, b.x, top, thickness, b.y - top, '#41425e');
      rect(ctx, a.x, top, b.x - a.x, thickness, '#41425e');
      rect(ctx, a.x + 15 * a.scale, top + 13 * a.scale, (b.x - a.x) * .18, Math.max(1, 3 * a.scale), C.gold);
      rect(ctx, b.x - 70 * a.scale, top + 13 * a.scale, (b.x - a.x) * .18, Math.max(1, 3 * a.scale), C.cyan);
      rect(ctx, a.x, a.y - 20 * a.scale, thickness, 4 * a.scale, C.pink);
      rect(ctx, b.x, b.y - 20 * a.scale, thickness, 4 * a.scale, C.cyan);
    }
  }

  roadScene(frame) {
    const { road, ctx } = this;
    road.frame = Math.floor(frame.time * 30);
    road.distance = frame.distance * 1.85;
    road.playerX = frame.playerX;
    road.focalLength = frame.shot === 'rear' ? 68 : frame.shot === 'wide' ? 43 : 52 - frame.pulse * 4;
    road.reducedMotion = frame.reducedMotion;
    this.sky(frame);
    road.drawRoad();
    this.wetRoad(frame);
    if (frame.scene === 'tunnel') this.tunnel(frame);
    else {
      for (let i = 8; i >= 0; i--) {
        const z = i * 85 + 10 - mod(road.distance, 85);
        if (z > 4) for (const side of [-1, 1]) road.drawLamp(z, side);
      }
      if (frame.scene === 'bridge') this.bridge(frame);
      else {
        for (let i = 4; i >= 0; i--) {
          const z = i * 140 + 20 - mod(road.distance, 140);
          if (z > 4) road.drawBillboard(z, i % 2 ? -1 : 1, i + (frame.chorus ? 1 : 0));
        }
      }
    }
    const traffic = [];
    for (let i = 0; i < (frame.scene === 'tunnel' ? 2 : 5); i++) {
      const z = mod(i * 137 - frame.time * (frame.chorus ? 70 : 45), 660);
      const x = i % 2 ? -.66 : .66;
      traffic.push({ z: road.distance + z, x, color: i % 5, type: i === 4 ? 'van' : 'car' });
    }
    traffic.sort((a, b) => b.z - a.z).forEach((car) => road.drawCar(car));
    const game = {
      state: 'playing', speed: frame.speed, distance: frame.distance,
      steer: frame.reducedMotion ? 0 : Math.cos(frame.time * .38) * .35,
      boosting: frame.boosting, invincible: 0, input: { brake: false },
      cameoTime: -1, characterId: 'dhh',
    };
    road.drawSpeedLines(game);
    if (frame.shot !== 'cockpit') {
      const scale = frame.shot === 'rear' ? 1.6 : frame.shot === 'wide' ? .76 : 1.16;
      const target = road.project(14.8, road.playerX);
      ctx.save();
      ctx.translate(target.x, 282);
      ctx.scale(scale, scale);
      ctx.translate(-target.x, -H * .86);
      road.drawPlayer(game, false);
      ctx.restore();
    } else this.cockpit(frame);
  }

  wetRoad(frame) {
    const ctx = this.ctx;
    for (let i = 0; i < 74; i++) {
      const depth = mod(i * .137 + frame.distance * .0018, 1);
      const y = 174 + depth * depth * 142;
      const side = i % 2 ? -1 : 1;
      const x = 320 + side * (38 + depth * 270) + Math.sin(i * 71) * 15;
      ctx.globalAlpha = .13 + frame.pulse * .18;
      rect(ctx, x, y, 3 + depth * 25, 1 + depth, [C.pink, C.cyan, C.purple, C.yellow][i % 4]);
    }
    ctx.globalAlpha = 1;
  }

  cockpit(frame) {
    const ctx = this.ctx;
    poly(ctx, [[0, 0], [30, 0], [156, 244], [117, 261]], '#11131f');
    poly(ctx, [[640, 0], [610, 0], [494, 246], [528, 267]], '#11131f');
    poly(ctx, [[0, 249], [157, 237], [480, 237], [640, 253], [640, 360], [0, 360]], '#11131f');
    rect(ctx, 0, 251, 640, 3, '#565f89');
    rect(ctx, 382, 261, 144, 48, C.road);
    rect(ctx, 389, 267, 130, 1, C.cyan);
    this.lettering('OMARCHY', 399, 275, 10, C.cyan);
    for (let i = 0; i < 15; i++) {
      const height = 2 + mod(i * 31, 11) * frame.energy;
      rect(ctx, 399 + i * 7, 301 - height, 4, height, i < 11 ? C.cyan : C.pink);
    }
    this.lettering(String(Math.round(frame.speed)), 279, 268, 17, C.gold, 'center');
    this.lettering('KM/H', 279, 291, 6, C.muted, 'center');
    poly(ctx, [[132, 316], [127, 281], [145, 259], [193, 254], [216, 273], [221, 316], [210, 316], [204, 278], [187, 267], [152, 271], [141, 289], [145, 316]], '#565f89');
    rect(ctx, 149, 290, 48, 12, '#2c3047');
    rect(ctx, 168, 294, 12, 10, C.yellow);
    rect(ctx, 263, 27, 114, 29, '#11131f');
    ctx.drawImage(this.road.background, 340, 96, 180, 52, 268, 30, 104, 22);
    rect(ctx, 316, 19, 8, 8, '#11131f');
  }

  sideScene(frame) {
    const { ctx } = this;
    this.sky(frame, true);
    rect(ctx, 0, 174, 640, 186, '#202337');
    rect(ctx, 0, 185, 640, 3, C.line);
    if (frame.scene === 'bridge') this.bridge(frame, true);
    else {
      for (let i = -1; i < 7; i++) {
        const x = i * 135 - mod(frame.distance * .5, 135);
        rect(ctx, x, 179, 3, 43, '#565f89');
        rect(ctx, x, 179, 131, 3, '#67637e');
        rect(ctx, x, 188, 131, 2, '#343b58');
        rect(ctx, x, 180, 7, 2, i % 2 ? C.cyan : C.pink);
      }
    }
    for (let i = 0; i < 30; i++) {
      const y = 206 + i * 4;
      const x = mod(i * 139 - frame.distance * (1 + i * .025), 800) - 80;
      rect(ctx, x, y, 14 + i * 2, 1, i % 3 ? '#7dcfff20' : '#f7768e30');
    }
    for (let i = -1; i < 6; i++) rect(ctx, i * 180 - mod(frame.distance * 2, 180), 288, 85, 3, '#9aa5ce60');
    const scale = frame.shot === 'close' ? 2.65 : 1.85;
    const x = frame.shot === 'close' ? 70 : 148 + (frame.reducedMotion ? 0 : Math.sin(frame.time * .7) * 12);
    const y = frame.shot === 'close' ? 147 : 174;
    this.sideVehicle(frame, x, y, scale);
  }

  sideVehicle(frame, x, y, scale) {
    const ctx = this.ctx;
    const width = 180 * scale;
    const height = 66 * scale;
    ctx.save();
    ctx.globalAlpha = .13;
    ctx.translate(x, y + height * 1.85);
    ctx.scale(1, -.8);
    ctx.drawImage(this.sideCar, 0, 0, width, height);
    ctx.restore();
    if (frame.boosting) {
      const length = 15 + frame.pulse * 38;
      poly(ctx, [[x + width - 12, y + height * .71], [x + width + length, y + height * .76], [x + width - 12, y + height * .82]], C.blue);
      poly(ctx, [[x + width - 12, y + height * .74], [x + width + length * .65, y + height * .76], [x + width - 12, y + height * .79]], C.cyan);
    }
    ctx.drawImage(this.sideCar, Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    for (const wheel of [38, 144]) {
      const rotation = frame.reducedMotion || frame.speed < 10 ? .7 : frame.distance * .6;
      const wx = x + wheel * scale;
      const wy = y + 49 * scale;
      for (let spoke = 0; spoke < 4; spoke++) {
        const angle = rotation + spoke * Math.PI / 2;
        rect(ctx, wx + Math.cos(angle) * 4 * scale, wy + Math.sin(angle) * 4 * scale, 2 * scale, 2 * scale, '#c0caf5');
      }
    }
    if (!frame.outro) {
      ctx.globalAlpha = .045 + frame.pulse * .065;
      poly(ctx, [[x + 9 * scale, y + 37 * scale], [x - 150, y + 15 * scale], [x - 150, y + 64 * scale]], C.cyan);
      ctx.globalAlpha = 1;
    }
  }

  bayScene(frame) {
    const ctx = this.ctx;
    const colors = ['#25283f', '#34334e', '#51415b', '#795269', '#a76b79', '#dc968d'];
    colors.forEach((color, i) => rect(ctx, 0, i * 28, W, 29, color));
    const sunY = 157 - frame.dawn * 32;
    for (let y = -23; y < 24; y++) {
      if (y > 4 && y % 5 === 0) continue;
      const half = Math.floor(Math.sqrt(24 ** 2 - y ** 2));
      rect(ctx, 444 - half, sunY + y, half * 2, 1, y < 0 ? C.gold : '#e0af68');
    }
    for (let i = 0; i < 45; i++) {
      const x = i * 17 - 5;
      const height = 6 + mod(i * 47, 27);
      rect(ctx, x, 176 - height, 10 + i % 3 * 2, height, '#34354d');
      if (i % 3 === 0) rect(ctx, x + 2, 179 - height, 2, 2, C.yellow);
    }
    rect(ctx, 0, 176, W, 76, '#30364f');
    for (let i = 0; i < 120; i++) {
      const x = mod(i * 173 + Math.sin(frame.time * .7 + i) * 5, 640);
      const y = 180 + mod(i * 47, 72);
      const reflected = Math.abs(x - 444) < 18 + (y - 176) * .6;
      rect(ctx, x, y, 3 + i % 17, 1, reflected ? '#e0af6870' : '#7aa2f726');
    }
    rect(ctx, 0, 237, W, 3, '#565f89');
    for (let x = 0; x < W; x += 55) rect(ctx, x, 237, 3, 30, '#565f89');
    rect(ctx, 0, 251, W, 2, '#414868');
    rect(ctx, 0, 267, W, 93, '#24283b');
    rect(ctx, 0, 267, W, 2, '#9aa5ce');
    const scale = frame.shot === 'close' ? 2.05 : frame.shot === 'side' ? 1.8 : 1.35;
    this.sideVehicle(frame, frame.shot === 'close' ? 65 : 90, 276 - 59 * scale, scale);
    rect(ctx, 0, 302, W, 2, '#e0af6820');
  }

  rain(frame) {
    if (frame.outro || frame.scene === 'tunnel') return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = frame.reducedMotion ? .08 : .14;
    for (let i = 0; i < 110; i++) {
      const depth = 1 + i % 3;
      const t = frame.reducedMotion ? 0 : frame.time;
      const x = mod(i * 157 - t * (45 + depth * 28), 700) - 30;
      const y = mod(i * 89 + t * (160 + depth * 70), 360);
      poly(ctx, [[x, y], [x - depth * 2, y + depth * 5], [x - depth * 2 + 1, y + depth * 5], [x + 1, y]], i % 4 ? C.cyan : C.purple);
    }
    ctx.restore();
  }

  titles(frame) {
    if (frame.intro && frame.time < 13) {
      const alpha = frame.time < 10 ? 1 : 1 - ease((frame.time - 10) / 3);
      const offset = frame.reducedMotion ? 0 : Math.round((1 - ease(frame.time / 5)) * 8);
      this.lettering('TOKYO', 37, 44 + offset, 39, C.pink, 'left', alpha);
      this.lettering('NIGHTS', 37, 91 + offset, 39, C.text, 'left', alpha);
      this.lettering('OMARCHY', 40, 143 + offset, 11, C.gold, 'left', alpha);
      this.lettering(SONG.artist.toUpperCase(), 40, 165 + offset, 7, C.text, 'left', alpha);
    }
    if (frame.outro && !frame.lyric && frame.time > this.cues.lyrics.at(-1).end) {
      const alpha = ease((frame.time - this.cues.lyrics.at(-1).end) / 2);
      this.lettering('TOKYO NIGHTS', 320, 48, 26, C.text, 'center', alpha);
      this.lettering('OMARCHY', 320, 86, 10, C.gold, 'center', alpha);
      this.lettering(SONG.artist.toUpperCase(), 320, 108, 8, C.text, 'center', alpha);
    }
  }

  lyrics(frame) {
    if (!this.captions || !frame.lyric) return;
    const { ctx } = this;
    const lyric = frame.lyric;
    const text = lyric.text;
    const size = text.length > 53 ? 8 : text.length > 46 ? 9 : 10;
    ctx.font = `${size}px Arcade`;
    const width = ctx.measureText(text).width;
    const x = (W - width) / 2;
    const y = 329;
    this.lettering(text, x, y, size, C.text);
    const progress = clamp((frame.time - lyric.start) / Math.max(.1, lyric.end - lyric.start), 0, 1);
    ctx.save();
    ctx.beginPath();
    const words = lyric.words;
    let highlight = width * progress;
    if (words?.length) {
      highlight = 0;
      for (const word of words) {
        const wordWidth = ctx.measureText(word.text + ' ').width;
        const wordProgress = clamp((frame.time - word.start) / Math.max(.08, word.end - word.start), 0, 1);
        highlight += wordWidth * wordProgress;
      }
    }
    ctx.rect(x - 1, y - 2, Math.min(width + 2, highlight), 18);
    ctx.clip();
    this.lettering(text, x, y, size, frame.chorus ? C.gold : C.cyan);
    ctx.restore();
  }

  render(time) {
    const frame = frameAt(time, this.cues, this.analysis, this.reducedMotion);
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
    rect(ctx, 0, 0, W, H, C.deep);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 19, W, 297);
    ctx.clip();
    if (frame.outro) this.bayScene(frame);
    else if (frame.shot === 'side' || frame.shot === 'close') this.sideScene(frame);
    else this.roadScene(frame);
    this.rain(frame);
    this.titles(frame);
    if (!frame.reducedMotion && frame.shotTime < .22 && frame.shotStart > 0) {
      ctx.globalAlpha = (1 - frame.shotTime / .22) * .4;
      rect(ctx, 0, 0, W, H, C.deep);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    rect(ctx, 0, 0, W, 19, C.deep);
    rect(ctx, 0, 316, W, 44, C.deep);
    const locations = { city: 'SHINJUKU', expressway: 'SHUTO EXPRESSWAY', shibuya: 'ROPPONGI > SHIBUYA', bridge: 'RAINBOW BRIDGE', alley: 'SHIBUYA BACKSTREETS', tunnel: 'C1 UNDERPASS', bay: 'TOKYO BAY' };
    this.lettering(locations[frame.scene], 14, 7, 6, C.muted);
    this.lettering(frame.outro ? '05:12' : frame.scene === 'tunnel' ? '04:00' : 'TOKYO / NIGHT DRIVE', 626, 7, 6, C.muted, 'right');
    this.lyrics(frame);
    if (frame.fade < 1) {
      ctx.globalAlpha = 1 - frame.fade;
      rect(ctx, 0, 0, W, H, C.deep);
      ctx.globalAlpha = 1;
    }
    this.outputContext.imageSmoothingEnabled = false;
    this.outputContext.drawImage(this.canvas, 0, 0, this.output.width, this.output.height);
    return frame;
  }
}
