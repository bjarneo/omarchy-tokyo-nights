import { BOOST_SPEED, cameoPose, clamp, roadCurve } from './engine.mjs';
import { CHARACTERS, getCharacter } from './characters.mjs';
import { loadOmarchyLogo, loadCliampLogo } from './omarchy-logo.js';
import { makeGuestDriver } from './guest-drivers.js';
import { getCar, getPaint } from './cars.mjs';
import { makeCarSprite } from './car-sprites.js';
import { makeFullCharacter } from './full-characters.js';
import { drawGarageBackdrop } from './garage-scene.js';

const WORLD_SPEED = 1.85;

const C = {
  night: '#1a1b26', deep: '#16161e', road: '#24283b', roadAlt: '#262a3f',
  line: '#414868', muted: '#565f89', blue: '#7aa2f7', cyan: '#7dcfff',
  pink: '#f7768e', purple: '#bb9af7', yellow: '#e0af68', green: '#9ece6a',
  text: '#c0caf5', white: '#e5e9ff', gold: '#ffd578',
};

const GLYPHS = {
  A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'], D: ['110', '101', '101', '101', '110'],
  E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
  G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'],
  I: ['111', '010', '010', '010', '111'], J: ['001', '001', '001', '101', '010'],
  K: ['101', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'],
  M: ['10001', '11011', '10101', '10001', '10001'], N: ['101', '111', '111', '111', '101'],
  O: ['010', '101', '101', '101', '010'], P: ['110', '101', '110', '100', '100'],
  Q: ['010', '101', '101', '111', '011'], R: ['110', '101', '110', '101', '101'],
  S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'],
  U: ['101', '101', '101', '101', '111'], V: ['101', '101', '101', '101', '010'],
  W: ['10001', '10001', '10101', '11011', '10001'], X: ['101', '101', '010', '101', '101'],
  Y: ['101', '101', '010', '010', '010'], Z: ['111', '001', '010', '100', '111'],
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['110', '001', '010', '100', '111'], '3': ['110', '001', '010', '001', '110'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '110', '001', '110'],
  '6': ['011', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '110'],
  '+': ['000', '010', '111', '010', '000'], '-': ['000', '000', '111', '000', '000'],
  '.': ['0', '0', '0', '0', '1'], '/': ['001', '001', '010', '100', '100'],
  '東': ['00100', '11111', '01110', '01110', '11111', '10101', '00100'],
  '京': ['00100', '11111', '00000', '01110', '01010', '01110', '10101'],
  '夜': ['00100', '11111', '01010', '11111', '01101', '01010', '11101'],
  'ラ': ['11111', '00000', '11111', '00001', '00010', '00100', '01000'],
  'ー': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  'メ': ['00001', '01001', '00110', '00100', '01010', '10001', '00000'],
  'ン': ['10000', '01000', '10001', '01001', '00010', '00100', '11000'],
  'ホ': ['00100', '11111', '00100', '10101', '10101', '00100', '01100'],
  'テ': ['01110', '00000', '11111', '00100', '00100', '01000', '10000'],
  'ル': ['01000', '01010', '01010', '01010', '01011', '10010', '10000'],
};

function randomSource(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function rect(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(width), Math.ceil(height));
}

function polygon(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(Math.round(x), Math.round(y)) : ctx.moveTo(Math.round(x), Math.round(y)));
  ctx.closePath();
  ctx.fill();
}

function text(ctx, value, x, y, color, scale = 1, vertical = false) {
  let cursor = 0;
  for (const letter of value.toUpperCase()) {
    const glyph = GLYPHS[letter];
    if (!glyph) { cursor += 3 * scale; continue; }
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel === '1') rect(ctx, x + (vertical ? columnIndex * scale : cursor + columnIndex * scale), y + (vertical ? cursor + rowIndex * scale : rowIndex * scale), scale, scale, color);
      });
    });
    cursor += (vertical ? glyph.length + 2 : glyph[0].length + 1) * scale;
  }
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').imageSmoothingEnabled = false;
  return canvas;
}

function makePlayer() {
  const sprite = makeCanvas(96, 55);
  const ctx = sprite.getContext('2d');
  rect(ctx, 7, 41, 14, 14, '#10111b');
  rect(ctx, 75, 41, 14, 14, '#10111b');
  rect(ctx, 9, 42, 2, 10, C.line);
  rect(ctx, 85, 42, 2, 10, C.line);
  polygon(ctx, [[8, 23], [22, 8], [32, 4], [64, 4], [74, 8], [88, 23], [91, 45], [84, 50], [12, 50], [5, 45]], '#916c40');
  polygon(ctx, [[8, 23], [23, 9], [32, 5], [64, 5], [73, 9], [88, 23], [87, 43], [9, 43]], C.yellow);
  polygon(ctx, [[22, 16], [31, 6], [65, 6], [74, 16]], C.gold);
  polygon(ctx, [[24, 19], [31, 10], [65, 10], [72, 19]], '#1e2540');
  polygon(ctx, [[29, 18], [34, 11], [62, 11], [67, 18]], '#414d70');
  rect(ctx, 35, 12, 26, 1, '#737ba1');
  rect(ctx, 32, 15, 33, 1, '#30364f');
  rect(ctx, 28, 20, 40, 2, '#97733f');
  for (let i = 0; i < 4; i++) rect(ctx, 29 - i, 22 + i * 2, 38 + i * 2, 1, '#24283b');
  polygon(ctx, [[12, 25], [23, 20], [22, 31], [12, 33]], C.gold);
  polygon(ctx, [[84, 25], [73, 20], [74, 31], [84, 33]], '#c18d43');
  rect(ctx, 5, 23, 7, 4, C.gold);
  rect(ctx, 84, 23, 7, 4, C.gold);
  rect(ctx, 4, 27, 88, 5, '#98733d');
  rect(ctx, 2, 25, 92, 4, C.gold);
  rect(ctx, 8, 28, 80, 1, '#f7c571');
  rect(ctx, 17, 29, 4, 7, '#b08445');
  rect(ctx, 75, 29, 4, 7, '#b08445');
  polygon(ctx, [[8, 34], [88, 34], [86, 44], [10, 44]], C.gold);
  rect(ctx, 10, 36, 29, 7, '#252739');
  rect(ctx, 57, 36, 29, 7, '#252739');
  rect(ctx, 12, 37, 11, 4, C.pink);
  rect(ctx, 25, 37, 11, 4, '#e85b74');
  rect(ctx, 60, 37, 11, 4, '#e85b74');
  rect(ctx, 73, 37, 11, 4, C.pink);
  rect(ctx, 12, 37, 11, 1, '#ffb4ac');
  rect(ctx, 73, 37, 11, 1, '#ffb4ac');
  rect(ctx, 41, 36, 14, 2, '#98733d');
  rect(ctx, 40, 39, 16, 6, C.text);
  rect(ctx, 43, 41, 10, 2, C.deep);
  rect(ctx, 10, 46, 76, 5, '#2b2b38');
  rect(ctx, 16, 46, 15, 2, C.line);
  rect(ctx, 65, 46, 15, 2, C.line);
  rect(ctx, 29, 47, 7, 4, '#10111b');
  rect(ctx, 60, 47, 7, 4, '#10111b');
  rect(ctx, 30, 47, 5, 1, C.muted);
  rect(ctx, 61, 47, 5, 1, C.muted);
  return sprite;
}

function makeTraffic(color, van) {
  const sprite = makeCanvas(54, 48);
  const ctx = sprite.getContext('2d');
  rect(ctx, 4, 36, 8, 12, '#11121c');
  rect(ctx, 42, 36, 8, 12, '#11121c');
  polygon(ctx, [[5, 25], [10, van ? 3 : 13], [17, van ? 1 : 8], [37, van ? 1 : 8], [44, van ? 3 : 13], [49, 25], [50, 42], [4, 42]], color);
  rect(ctx, 13, van ? 6 : 13, 28, van ? 16 : 11, '#1c2437');
  rect(ctx, 15, van ? 8 : 14, 24, 2, C.line);
  rect(ctx, 26, van ? 6 : 13, 2, van ? 16 : 11, color);
  rect(ctx, 5, 30, 44, 1, '#c0caf570');
  rect(ctx, 5, 34, 12, 5, C.pink);
  rect(ctx, 37, 34, 12, 5, C.pink);
  rect(ctx, 6, 34, 10, 1, '#ffb4ac');
  rect(ctx, 38, 34, 10, 1, '#ffb4ac');
  rect(ctx, 21, 35, 12, 5, C.text);
  rect(ctx, 23, 37, 8, 1, C.deep);
  rect(ctx, 5, 42, 44, 3, C.line);
  return sprite;
}

function makeRyanDriver(facing) {
  const sprite = makeCanvas(32, 38);
  const ctx = sprite.getContext('2d');
  const skin = '#dbab91';
  const lightSkin = '#f0c1a1';
  const skinShadow = '#b57d70';
  const hair = '#241f29';
  const hairLight = '#463741';
  rect(ctx, 6, 28, 22, 10, '#131620');
  rect(ctx, 7, 29, 2, 8, '#292b39');
  rect(ctx, 2, 33, 10, 4, skin);
  rect(ctx, 2, 33, 6, 2, lightSkin);
  rect(ctx, 21, 32, 3, 3, C.pink);
  rect(ctx, 24, 34, 2, 2, C.green);
  rect(ctx, 21, 36, 2, 2, C.cyan);
  polygon(ctx, [[10, 2], [16, 0], [23, 2], [27, 7], [28, 18], [25, 23], [8, 24], [5, 18], [5, 9]], hair);
  rect(ctx, 12, 2, 9, 1, hairLight);
  rect(ctx, 7, 7, 2, 10, hairLight);

  if (facing === 'back') {
    rect(ctx, 11, 23, 12, 6, skinShadow);
    rect(ctx, 13, 25, 8, 4, skin);
    rect(ctx, 8, 9, 2, 11, '#352b35');
    rect(ctx, 22, 7, 2, 14, '#171822');
    rect(ctx, 11, 3, 3, 1, '#65505a');
  } else if (facing === 'profile') {
    polygon(ctx, [[16, 5], [23, 6], [25, 12], [25, 17], [29, 19], [26, 21], [26, 25], [21, 29], [15, 25], [13, 17]], skin);
    rect(ctx, 18, 7, 5, 6, lightSkin);
    rect(ctx, 14, 14, 4, 7, skinShadow);
    rect(ctx, 20, 13, 8, 7, '#24283b');
    rect(ctx, 21, 14, 5, 4, '#d4ab9b');
    rect(ctx, 24, 15, 2, 2, '#414868');
    rect(ctx, 15, 13, 5, 2, '#24283b');
    polygon(ctx, [[22, 22], [26, 22], [27, 25], [24, 29], [20, 30], [18, 27], [20, 24]], hair);
    rect(ctx, 23, 23, 4, 1, '#e7b5a0');
    rect(ctx, 23, 28, 2, 1, '#867781');
  } else {
    polygon(ctx, [[11, 5], [21, 5], [25, 9], [26, 20], [23, 27], [17, 30], [10, 27], [6, 20], [7, 10]], skin);
    rect(ctx, 11, 6, 10, 6, lightSkin);
    rect(ctx, 5, 14, 3, 7, skinShadow);
    rect(ctx, 25, 14, 3, 7, skinShadow);
    rect(ctx, 7, 13, 9, 7, '#24283b');
    rect(ctx, 17, 13, 9, 7, '#24283b');
    rect(ctx, 8, 14, 7, 5, '#e5b7a0');
    rect(ctx, 18, 14, 7, 5, '#e5b7a0');
    rect(ctx, 15, 14, 3, 2, '#24283b');
    rect(ctx, 9, 14, 4, 1, '#bdcadb');
    rect(ctx, 19, 14, 4, 1, '#bdcadb');
    rect(ctx, 10, 16, 3, 2, '#e5e9ff');
    rect(ctx, 20, 16, 3, 2, '#e5e9ff');
    rect(ctx, 11, 16, 2, 2, '#414868');
    rect(ctx, 20, 16, 2, 2, '#414868');
    rect(ctx, 16, 17, 2, 5, skinShadow);
    polygon(ctx, [[12, 22], [22, 22], [24, 25], [22, 29], [17, 31], [11, 29], [9, 25]], '#312b32');
    rect(ctx, 14, 23, 8, 3, '#ad7974');
    rect(ctx, 14, 23, 7, 1, '#ffdfbd');
    rect(ctx, 15, 26, 6, 1, '#4d3c43');
    rect(ctx, 13, 28, 1, 2, '#93818a');
    rect(ctx, 17, 29, 1, 1, '#93818a');
    rect(ctx, 21, 27, 1, 2, '#93818a');
  }
  return sprite;
}

function makeDriver(facing, characterId = 'dhh') {
  const guest = makeGuestDriver(facing, characterId);
  if (guest) return guest;
  if (characterId === 'ryan') return makeRyanDriver(facing);
  const sprite = makeCanvas(32, 38);
  const ctx = sprite.getContext('2d');
  const hair = '#584033';
  const darkHair = '#302a2f';
  const hairMid = '#785744';
  const hairLight = '#a17a5b';
  const skin = '#e6ab93';
  const skinLight = '#f2c0a5';
  const skinShadow = '#c38679';
  const beard = '#685858';
  const beardDark = '#413e47';
  const beardLight = '#a89a98';
  rect(ctx, 7, 28, 20, 10, '#151823');
  rect(ctx, 10, 31, 3, 7, '#292b39');
  rect(ctx, 2, 33, 12, 4, skin);
  rect(ctx, 2, 33, 6, 2, skinLight);
  polygon(ctx, [[9, 3], [14, 1], [19, 0], [25, 2], [28, 7], [29, 12], [28, 17], [30, 21], [28, 25], [31, 28], [28, 31], [29, 33], [25, 35], [20, 33], [15, 35], [10, 33], [6, 35], [2, 32], [4, 29], [1, 26], [3, 21], [2, 18], [4, 13], [3, 9], [6, 5]], darkHair);
  polygon(ctx, [[9, 4], [15, 2], [20, 1], [24, 3], [27, 8], [27, 13], [26, 18], [28, 22], [26, 26], [28, 29], [25, 32], [22, 31], [18, 32], [12, 31], [8, 33], [4, 30], [6, 27], [4, 23], [5, 18], [4, 13], [5, 8]], hair);
  polygon(ctx, [[8, 6], [7, 11], [8, 15], [6, 19], [5, 23], [7, 26], [6, 29], [4, 31], [4, 28], [5, 26], [3, 23], [4, 19], [6, 15], [5, 11], [6, 7]], hairMid);
  polygon(ctx, [[22, 3], [25, 7], [24, 12], [26, 16], [25, 20], [27, 24], [25, 28], [28, 30], [25, 32], [23, 29], [24, 25], [23, 20], [24, 16], [22, 12], [23, 8], [20, 4]], hairMid);
  rect(ctx, 7, 8, 1, 5, hairLight);
  rect(ctx, 5, 20, 1, 4, hairLight);
  rect(ctx, 6, 28, 3, 1, hairLight);
  rect(ctx, 21, 3, 3, 1, hairLight);
  rect(ctx, 25, 17, 1, 4, hairLight);
  rect(ctx, 26, 27, 2, 1, hairLight);
  if (facing === 'back') {
    polygon(ctx, [[14, 3], [12, 9], [14, 15], [11, 21], [13, 27], [10, 31], [10, 27], [9, 21], [12, 15], [10, 9], [12, 4]], hairMid);
    polygon(ctx, [[18, 3], [21, 9], [19, 15], [22, 21], [20, 28], [22, 32], [18, 30], [19, 23], [17, 17], [19, 10], [16, 4]], hairMid);
    rect(ctx, 13, 6, 1, 5, hairLight);
    rect(ctx, 11, 20, 1, 5, hairLight);
    rect(ctx, 19, 25, 1, 4, hairLight);
  } else if (facing === 'profile') {
    polygon(ctx, [[18, 5], [23, 7], [25, 13], [25, 16], [29, 19], [26, 21], [25, 26], [21, 30], [16, 26], [14, 19], [15, 11]], skin);
    rect(ctx, 19, 8, 4, 5, skinLight);
    rect(ctx, 21, 13, 4, 1, hairMid);
    rect(ctx, 22, 15, 3, 2, '#e5e9ff');
    rect(ctx, 23, 15, 2, 2, '#8199b5');
    rect(ctx, 24, 16, 1, 1, beardDark);
    polygon(ctx, [[17, 20], [20, 23], [25, 21], [26, 24], [24, 28], [21, 30], [18, 28], [16, 24]], beard);
    rect(ctx, 23, 22, 4, 1, hair);
    rect(ctx, 23, 23, 3, 1, '#ffe9d2');
    rect(ctx, 20, 28, 3, 1, beardLight);
    rect(ctx, 23, 26, 1, 2, beardLight);
    rect(ctx, 14, 15, 3, 6, skinShadow);
    polygon(ctx, [[15, 6], [18, 4], [18, 10], [16, 14], [17, 18], [15, 24], [13, 21], [14, 15], [13, 10]], hair);
  } else {
    polygon(ctx, [[11, 6], [16, 4], [21, 6], [24, 11], [24, 20], [22, 26], [18, 30], [13, 29], [9, 25], [7, 19], [8, 12]], skin);
    rect(ctx, 11, 7, 10, 5, skinLight);
    rect(ctx, 8, 13, 1, 8, skinShadow);
    rect(ctx, 23, 13, 1, 8, skinShadow);
    rect(ctx, 10, 13, 5, 1, hairMid);
    rect(ctx, 18, 13, 5, 1, hairMid);
    rect(ctx, 10, 15, 5, 2, '#e5e9ff');
    rect(ctx, 18, 15, 5, 2, '#e5e9ff');
    rect(ctx, 11, 15, 3, 2, '#8199b5');
    rect(ctx, 19, 15, 3, 2, '#8199b5');
    rect(ctx, 12, 16, 1, 1, beardDark);
    rect(ctx, 20, 16, 1, 1, beardDark);
    rect(ctx, 11, 15, 1, 1, '#e5e9ff');
    rect(ctx, 19, 15, 1, 1, '#e5e9ff');
    rect(ctx, 16, 16, 2, 4, skinLight);
    rect(ctx, 15, 20, 4, 1, skinShadow);
    rect(ctx, 9, 18, 4, 2, '#e49a8c');
    rect(ctx, 21, 18, 3, 2, '#e49a8c');
    polygon(ctx, [[8, 19], [11, 22], [13, 21], [20, 21], [23, 20], [24, 19], [24, 24], [21, 29], [17, 31], [12, 29], [9, 26]], beard);
    rect(ctx, 9, 23, 1, 3, beardDark);
    rect(ctx, 23, 22, 1, 3, beardDark);
    rect(ctx, 12, 21, 10, 1, hair);
    polygon(ctx, [[11, 22], [23, 22], [22, 25], [19, 27], [15, 27], [12, 25]], '#774956');
    rect(ctx, 12, 22, 10, 2, '#ffe9d2');
    rect(ctx, 14, 24, 7, 1, '#fff3dd');
    rect(ctx, 15, 26, 5, 1, '#d58e81');
    for (const [x, y] of [[10, 25], [11, 27], [13, 28], [15, 29], [18, 29], [20, 28], [22, 26]]) rect(ctx, x, y, 1, 1, beardLight);
    polygon(ctx, [[10, 4], [15, 2], [17, 3], [12, 5], [9, 9], [8, 14], [7, 17], [7, 11]], hair);
    polygon(ctx, [[19, 3], [23, 5], [25, 10], [24, 15], [26, 19], [24, 23], [23, 18], [22, 13], [23, 9], [21, 6]], hair);
  }
  return sprite;
}

export class Renderer {
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.reducedMotion = reducedMotion;
    this.player = makePlayer();
    this.carSprites = new Map();
    this.fullCharacters = new Map();
    this.drivers = Object.fromEntries(CHARACTERS.map(({ id }) => [id, {
      back: makeDriver('back', id), profile: makeDriver('profile', id), smile: makeDriver('smile', id),
    }]));
    this.cars = [C.purple, '#5c80bc', '#b7c5d8', '#ce6279', '#75a6a0'].map((color) => [makeTraffic(color, false), makeTraffic(color, true)]);
    this.frame = 0;
    this.focalLength = 55;
    this.logo = null;
    this.cliampLogo = null;
    this.logoReady = Promise.all([loadOmarchyLogo().catch(() => null), loadCliampLogo().catch(() => null)]).then(([logo, cliampLogo]) => {
      this.logo = logo;
      this.cliampLogo = cliampLogo;
      return logo;
    });
    this.resize(640, 360);
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingEnabled = false;
    this.horizon = Math.floor(height * 0.455);
    this.makeSkyline();
  }

  drawPortrait(canvas, characterId) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const character = getCharacter(characterId);
    rect(ctx, 0, 0, 48, 56, C.deep);
    for (let i = 0; i < 6; i++) rect(ctx, 4, 7 + i * 8, 40, 1, '#24283b');
    rect(ctx, 8, 49, 32, 2, C.line);
    ctx.drawImage(this.drivers[character.id].smile, 8, 10);
    rect(ctx, 3, 3, 7, 1, C.muted);
    rect(ctx, 3, 3, 1, 7, C.muted);
    rect(ctx, 38, 52, 7, 1, C.muted);
    rect(ctx, 44, 46, 1, 7, C.muted);
  }

  drawLineup(canvas) {
    canvas.width = CHARACTERS.length * 36 - 4;
    canvas.height = 38;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    CHARACTERS.forEach(({ id }, index) => ctx.drawImage(this.drivers[id].smile, index * 36, 0));
    canvas.setAttribute('aria-label', `All nine drivers: ${CHARACTERS.map(({ name }) => name).join(', ')}.`);
  }

  getFullCharacter(characterId, facing = 'smile') {
    const character = getCharacter(characterId);
    const key = `${character.id}:${facing}`;
    if (!this.fullCharacters.has(key)) this.fullCharacters.set(key, makeFullCharacter(this.drivers[character.id][facing], character.id));
    return this.fullCharacters.get(key);
  }

  drawGarage(ctx, width, height) {
    drawGarageBackdrop(ctx, width, height, { logo: this.logo });
  }

  getCarSprite(carId, paintId) {
    const car = getCar(carId);
    const paint = getPaint(paintId);
    const key = `${car.id}:${paint.id}`;
    if (!this.carSprites.has(key)) this.carSprites.set(key, makeCarSprite(car.id, paint.id, this.player));
    return this.carSprites.get(key);
  }

  drawCarPreview(canvas, carId, paintId) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rect(ctx, 0, 0, 112, 72, C.deep);
    rect(ctx, 8, 64, 96, 3, C.line);
    ctx.drawImage(this.getCarSprite(carId, paintId), 8, 9);
  }

  makeSkyline() {
    const w = this.width + 160;
    const h = this.horizon + 10;
    this.background = makeCanvas(w, h);
    const ctx = this.background.getContext('2d');
    const random = randomSource(1989);
    rect(ctx, 0, 0, w, h, '#1b1b2c');
    const bands = ['#1d1e30', '#202135', '#25253c', '#292b46', '#30304d', '#393451'];
    bands.forEach((color, i) => rect(ctx, 0, 40 + i * 22, w, 23, color));
    for (let i = 0; i < 95; i++) {
      const x = Math.floor(random() * w);
      const y = Math.floor(random() * h * .75);
      rect(ctx, x, y, 1, 1, i % 5 === 0 ? '#8b91b9' : '#4d4e75');
      if (i % 19 === 0) { rect(ctx, x - 1, y, 3, 1, '#7279a0'); rect(ctx, x, y - 1, 1, 3, '#7279a0'); }
    }
    const moonX = Math.floor(w * .77);
    const moonY = Math.floor(h * .30);
    for (let y = -17; y <= 17; y++) {
      const width = Math.floor(Math.sqrt(17 * 17 - y * y));
      rect(ctx, moonX - width, moonY + y, width * 2, 1, '#b6acd7');
    }
    rect(ctx, moonX - 9, moonY - 8, 7, 3, '#9f99c7');
    rect(ctx, moonX - 12, moonY - 5, 5, 5, '#9f99c7');
    rect(ctx, moonX + 5, moonY + 5, 7, 4, '#c0b5db');
    rect(ctx, moonX + 2, moonY + 9, 6, 2, '#c0b5db');
    // The clouds use hard-edged bands to preserve the pixel grid.
    [[.11, 31, 73], [.13, 34, 86], [.68, 64, 115], [.72, 61, 84], [.43, 89, 58]].forEach(([x, y, width]) => rect(ctx, w * x, y, width, 2, '#2c2c45'));

    for (let x = 0; x < w; x += 11 + random() * 15) {
      const buildingHeight = 13 + random() * 35;
      const buildingWidth = 12 + random() * 14;
      rect(ctx, x, h - buildingHeight - 9, buildingWidth, buildingHeight, '#41405d');
      for (let wx = 3; wx < buildingWidth - 2; wx += 4) {
        for (let wy = 4; wy < buildingHeight - 3; wy += 6) {
          if (random() > .65) rect(ctx, x + wx, h - buildingHeight - 9 + wy, 1, 2, '#726288');
        }
      }
    }
    for (let x = 0, index = 0; x < w; index++) {
      const buildingWidth = 21 + Math.floor(random() * 29);
      const centerFactor = Math.min(1, Math.abs(x - w * .48) / (w * .27));
      const buildingHeight = 26 + Math.floor(random() * 50 + centerFactor * 35);
      const y = h - buildingHeight;
      const color = index % 3 === 0 ? '#24273e' : '#282b43';
      rect(ctx, x, y, buildingWidth, buildingHeight, color);
      rect(ctx, x + 3, y - 3, buildingWidth - 6, 3, '#2c2f49');
      if (index % 3 === 0) {
        rect(ctx, x + buildingWidth * .6, y - 11, 1, 11, '#565374');
        rect(ctx, x + buildingWidth * .6, y - 12, 1, 1, C.pink);
      }
      rect(ctx, x + buildingWidth - 3, y + 2, 3, buildingHeight, '#1e2237');
      for (let wy = 6; wy < buildingHeight - 6; wy += 7) {
        for (let wx = 4; wx < buildingWidth - 5; wx += 6) {
          if (random() > .43) rect(ctx, x + wx, y + wy, 2, 3, [ '#555278', '#646081', '#7d697e', '#52627f' ][Math.floor(random() * 4)]);
        }
      }
      if (index % 4 === 0) rect(ctx, x + 2, y + 4, 1, buildingHeight - 4, '#64547a');
      x += buildingWidth + 3;
    }

    const towerX = w * .67;
    const towerBase = h - 5;
    polygon(ctx, [[towerX, towerBase - 97], [towerX - 2, towerBase - 50], [towerX - 22, towerBase], [towerX - 15, towerBase], [towerX, towerBase - 53], [towerX + 15, towerBase], [towerX + 22, towerBase], [towerX + 2, towerBase - 50]], '#cb7187');
    rect(ctx, towerX - 1, towerBase - 101, 2, 9, C.pink);
    rect(ctx, towerX - 5, towerBase - 61, 10, 4, '#f8a1a4');
    rect(ctx, towerX - 9, towerBase - 39, 18, 5, C.pink);
    rect(ctx, towerX - 17, towerBase - 16, 34, 3, C.pink);
    for (let i = 0; i < 4; i++) {
      const y = towerBase - 34 + i * 8;
      const spread = 8 + i * 3;
      polygon(ctx, [[towerX - spread, y], [towerX + spread + 3, y + 8], [towerX + spread + 2, y + 9], [towerX - spread, y + 1]], '#d98591');
      polygon(ctx, [[towerX + spread, y], [towerX - spread - 3, y + 8], [towerX - spread - 2, y + 9], [towerX + spread, y + 1]], '#d98591');
    }

    this.cityBlock(ctx, 54, h - 137, 58, 137, '#202338', random);
    this.cityBlock(ctx, 111, h - 88, 44, 88, '#1e2235', random);
    this.cityBlock(ctx, w - 153, h - 108, 60, 108, '#202338', random);
    this.cityBlock(ctx, w - 99, h - 151, 61, 151, '#1d2034', random);
    rect(ctx, 62, h - 119, 8, 105, '#41304c');
    rect(ctx, 63, h - 120, 2, 106, C.pink);
    rect(ctx, 106, h - 131, 1, 117, '#675278');
    this.sign(ctx, 87, h - 115, 'ホテル', C.pink, true, 2);
    this.sign(ctx, 121, h - 64, 'RAMEN', C.yellow, false, 1);
    this.sign(ctx, w - 132, h - 82, '東京', C.cyan, true, 2);
    this.sign(ctx, w - 87, h - 123, 'NIGHT', C.purple, true, 1);
    this.sign(ctx, 171, h - 42, '24H', C.cyan, false, 1);
    rect(ctx, 53, h - 5, w - 106, 5, '#24243b');
  }

  cityBlock(ctx, x, y, w, h, color, random) {
    rect(ctx, x, y, w, h, color);
    rect(ctx, x + 4, y - 4, w - 8, 4, '#33364e');
    rect(ctx, x + 8, y - 8, w - 27, 4, '#292c43');
    rect(ctx, x + 3, y + 3, w - 6, 1, '#41425e');
    for (let wy = 10; wy < h - 3; wy += 9) {
      rect(ctx, x, y + wy + 5, w, 1, '#191d30');
      for (let wx = 6; wx < w - 5; wx += 8) {
        if (random() > .35) rect(ctx, x + wx, y + wy, 3, 4, ['#806882', '#4b5276', '#8a728b', '#5a7697'][Math.floor(random() * 4)]);
      }
    }
  }

  sign(ctx, x, y, label, color, vertical, scale) {
    const glyphs = [...label].map((letter) => GLYPHS[letter] || GLYPHS.A);
    const w = (vertical ? Math.max(...glyphs.map((glyph) => glyph[0].length)) : glyphs.reduce((width, glyph) => width + glyph[0].length + 1, -1)) * scale;
    const h = (vertical ? glyphs.reduce((height, glyph) => height + glyph.length + 2, -2) : Math.max(...glyphs.map((glyph) => glyph.length))) * scale;
    rect(ctx, x - 4, y - 4, w + 8, h + 8, '#151929');
    rect(ctx, x - 3, y - 3, w + 6, 1, color);
    rect(ctx, x - 3, y + h + 2, w + 6, 1, color);
    rect(ctx, x - 3, y - 3, 1, h + 6, color);
    rect(ctx, x + w + 2, y - 3, 1, h + 6, color);
    text(ctx, label, x, y, color, scale, vertical);
  }

  project(z, lateral = 0) {
    const scale = 1 / (1 + z / this.focalLength);
    const curve = roadCurve((this.distance + z * .55) / WORLD_SPEED);
    const center = this.width / 2 + curve * this.width * .27 * Math.pow(1 - scale, 2) - this.playerX * this.width * .25 * scale;
    return { x: center + lateral * this.width * .57 * scale, y: this.horizon + (this.height - this.horizon) * scale, scale, half: this.width * .57 * scale };
  }

  drawRoad() {
    const ctx = this.ctx;
    const bottom = this.height - this.horizon;
    for (let y = this.horizon + 1; y < this.height; y++) {
      const scale = (y - this.horizon) / bottom;
      const z = this.focalLength * (1 / scale - 1);
      const p = this.project(z);
      const edge = p.half;
      const stripe = Math.floor((z + this.distance) / 15) % 2 === 0;
      rect(ctx, 0, y, this.width, 1, stripe ? '#202337' : '#22253a');
      rect(ctx, p.x - edge * 1.12, y, edge * 2.24, 1, stripe ? '#3e3a59' : '#30324b');
      rect(ctx, p.x - edge, y, edge * 2, 1, stripe ? C.road : C.roadAlt);
      const edgeWidth = Math.max(1, scale * 3);
      rect(ctx, p.x - edge, y, edgeWidth, 1, '#d8a68c');
      rect(ctx, p.x + edge - edgeWidth, y, edgeWidth, 1, '#d8a68c');
      if (stripe) {
        rect(ctx, p.x - edge / 3, y, Math.max(1, scale * 2), 1, '#787795');
        rect(ctx, p.x + edge / 3, y, Math.max(1, scale * 2), 1, '#787795');
      }
      if (y % 5 === 0 && scale > .15) {
        const shimmer = Math.sin(y * 53 + Math.floor(this.distance / 3)) * .5 + .5;
        rect(ctx, p.x - edge * .9, y, edge * .12 * shimmer, 1, '#5c405e');
        rect(ctx, p.x + edge * .76, y, edge * .09 * shimmer, 1, '#374b67');
      }
    }
    // Each guardrail segment shares the road projection.
    for (let i = 26; i >= 0; i--) {
      const z = i * 24 - this.distance % 24;
      if (z < 0) continue;
      for (const side of [-1, 1]) {
        if (this.pitBay && side === Math.sign(this.pitBay.lane) && Math.abs((z + this.distance) / WORLD_SPEED - this.pitBay.at) < 45) continue;
        const a = this.project(z, side * 1.10);
        const b = this.project(z + 24, side * 1.10);
        const heightA = 15 * a.scale;
        const heightB = 15 * b.scale;
        polygon(ctx, [[a.x, a.y - heightA], [b.x, b.y - heightB], [b.x, b.y - heightB * .7], [a.x, a.y - heightA * .7]], '#67637e');
        polygon(ctx, [[a.x, a.y - heightA * .7], [b.x, b.y - heightB * .7], [b.x, b.y - heightB * .5], [a.x, a.y - heightA * .5]], '#353b56');
        rect(ctx, a.x, a.y - heightA, Math.max(1, a.scale * 2), heightA, '#555a78');
        rect(ctx, a.x - a.scale, a.y - heightA, Math.max(1, a.scale * 3), Math.max(1, a.scale * 2), side < 0 ? C.pink : C.cyan);
      }
    }
  }

  drawLamp(z, side) {
    const ctx = this.ctx;
    const p = this.project(z, side * 1.2);
    const height = 185 * p.scale;
    const arm = 37 * p.scale * -side;
    const poleWidth = Math.max(1, 3 * p.scale);
    if (p.x < -90 || p.x > this.width + 90) return;
    rect(ctx, p.x, p.y - height, poleWidth, height, '#414868');
    rect(ctx, p.x, p.y - height, 1, height, '#606180');
    const end = p.x + arm;
    polygon(ctx, [[p.x, p.y - height + 12 * p.scale], [p.x, p.y - height], [end, p.y - height], [end, p.y - height + 3 * p.scale], [p.x + arm * .15, p.y - height + 3 * p.scale]], '#77748e');
    rect(ctx, side < 0 ? end : end - 16 * p.scale, p.y - height + 3 * p.scale, 16 * p.scale, Math.max(1, 3 * p.scale), '#d5bfd7');
    if (p.scale > .15) {
      const color = side < 0 ? '#f7768e07' : '#7dcfff07';
      polygon(ctx, [[end, p.y - height + 6 * p.scale], [end - 45 * p.scale, p.y], [end + 45 * p.scale, p.y]], color);
    }
  }

  drawBillboard(z, side, index) {
    const ctx = this.ctx;
    const p = this.project(z, side * 1.44);
    if (p.scale < .05 || p.x < -100 || p.x > this.width + 100) return;
    const scale = p.scale * 1.4;
    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y));
    ctx.scale(scale, scale);
    rect(ctx, -2, -70, 3, 70, '#4c4a68');
    if (index % 3 === 0) {
      rect(ctx, -56, -112, 112, 46, '#111828');
      rect(ctx, -56, -112, 112, 2, C.green);
      rect(ctx, -56, -68, 112, 2, C.green);
      rect(ctx, -56, -112, 2, 46, C.green);
      rect(ctx, 54, -112, 2, 46, C.green);
      if (this.logo) {
        ctx.drawImage(this.logo, -47, -105, 94, Math.round(94 * this.logo.height / this.logo.width));
      } else {
        text(ctx, 'OMARCHY', -31, -99, C.text, 2);
      }
      text(ctx, 'C1 / TOKYO', -21, -76, C.green);
      ctx.restore();
      return;
    }
    if (index % 3 === 1) {
      rect(ctx, -63, -136, 126, 70, '#111828');
      rect(ctx, -63, -136, 126, 2, C.cyan);
      rect(ctx, -63, -68, 126, 2, C.cyan);
      rect(ctx, -63, -136, 2, 70, C.cyan);
      rect(ctx, 61, -136, 2, 70, C.cyan);
      if (this.cliampLogo) {
        ctx.drawImage(this.cliampLogo, -49, -130, 98, Math.round(98 * this.cliampLogo.height / this.cliampLogo.width));
      } else {
        text(ctx, 'CLIAMP', -26, -128, C.yellow, 2);
      }
      text(ctx, 'TUI MUSIC PLAYER', -30, -102, C.text);
      const levels = [4, 8, 11, 6, 14, 7, 10, 5];
      const colors = [C.green, C.yellow, '#ff9e64', C.green, C.pink, C.green, '#ff9e64', C.green];
      levels.forEach((level, i) => {
        const height = level + (this.reducedMotion ? 0 : Math.round(Math.sin(this.frame * .12 + i) * 2));
        for (let y = 0; y < height; y += 2) rect(ctx, -27 + i * 8, -81 - y, 5, 1, colors[i]);
      });
      text(ctx, 'CLIAMP.STREAM', -24, -74, C.cyan);
      ctx.restore();
      return;
    }
    rect(ctx, -34, -104, 68, 37, '#111828');
    const color = [C.pink, C.cyan, C.purple, C.yellow][index % 4];
    rect(ctx, -34, -104, 68, 2, color);
    rect(ctx, -34, -68, 68, 2, color);
    rect(ctx, -34, -104, 2, 38, color);
    rect(ctx, 32, -104, 2, 38, color);
    const names = ['東京', 'NIGHT', 'HOTEL', 'ラーメン'];
    const label = names[index % 4];
    text(ctx, label, label.length === 2 ? -12 : -22, -95, color, 2);
    text(ctx, index % 2 ? 'OPEN 24H' : 'TOKYO', -17, -77, C.text, 1);
    ctx.restore();
  }

  drawGate(z) {
    if (z < 0 || z > 600) return;
    const ctx = this.ctx;
    const a = this.project(z, -1.07);
    const b = this.project(z, 1.07);
    const top = a.y - 135 * a.scale;
    const thickness = Math.max(1, 5 * a.scale);
    rect(ctx, a.x, top, thickness, a.y - top, '#676d89');
    rect(ctx, b.x, top, thickness, b.y - top, '#676d89');
    rect(ctx, a.x, top, b.x - a.x, thickness, '#676d89');
    ctx.save();
    ctx.translate(Math.round((a.x + b.x) / 2), Math.round(top));
    ctx.scale(a.scale * 1.8, a.scale * 1.8);
    rect(ctx, -55, -2, 110, 28, '#294943');
    rect(ctx, -54, -1, 108, 1, C.green);
    text(ctx, 'C1 CHECKPOINT', -46, 4, C.text, 2);
    text(ctx, '+35 SEC', -14, 18, C.green, 1);
    ctx.restore();
  }

  drawPickup(pickup) {
    const z = pickup.z * WORLD_SPEED - this.distance;
    if (pickup.resolved || z < 0 || z > 650) return;
    const p = this.project(z, pickup.x);
    const scale = p.scale * 1.6;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Math.round(p.x), Math.round(p.y - 48 * p.scale));
    ctx.scale(scale, scale);
    rect(ctx, -17, 16, 34, 2, pickup.kind === 'tape' ? '#e0af6840' : pickup.kind === 'nitro' ? '#7dcfff40' : '#9ece6a40');
    if (pickup.kind === 'tape') {
      rect(ctx, -17, -15, 34, 22, C.yellow);
      rect(ctx, -15, -13, 30, 18, C.deep);
      rect(ctx, -11, -10, 22, 8, C.text);
      rect(ctx, -9, -8, 5, 4, C.line);
      rect(ctx, 4, -8, 5, 4, C.line);
      rect(ctx, -8, 2, 16, 3, C.yellow);
      text(ctx, 'TAPE', -8, -25, C.yellow);
    } else if (pickup.kind === 'nitro') {
      rect(ctx, -5, -20, 10, 4, C.text);
      rect(ctx, -10, -16, 20, 28, C.cyan);
      rect(ctx, -7, -13, 14, 22, '#284b68');
      polygon(ctx, [[1, -11], [-5, 0], [0, 0], [-2, 8], [6, -3], [1, -3]], C.white);
      text(ctx, 'NITRO', -10, -30, C.cyan);
    } else {
      rect(ctx, -4, -20, 8, 4, C.text);
      rect(ctx, -10, -17, 20, 28, C.green);
      rect(ctx, -7, -14, 14, 22, C.deep);
      rect(ctx, -5, -12, 10, 18, '#50743e');
      rect(ctx, -1, -9, 3, 12, C.green);
      rect(ctx, -5, -5, 11, 3, C.green);
      text(ctx, 'POWER', -10, -30, C.green);
    }
    ctx.restore();
  }

  drawPitBay() {
    if (!this.pitBay) return;
    const relative = this.pitBay.at * WORLD_SPEED - this.distance;
    if (relative < -55 || relative > 750) return;
    const side = Math.sign(this.pitBay.lane);
    const near = Math.max(0, relative - 18 * WORLD_SPEED);
    const far = Math.max(1, relative + 18 * WORLD_SPEED);
    const corners = [this.project(near, side * 1.03), this.project(near, side * 1.43), this.project(far, side * 1.43), this.project(far, side * 1.03)];
    polygon(this.ctx, corners.map(({ x, y }) => [x, y]), '#344c40');
    this.ctx.strokeStyle = C.green;
    this.ctx.lineWidth = Math.max(1, corners[0].scale * 3);
    this.ctx.beginPath();
    corners.forEach(({ x, y }, i) => i ? this.ctx.lineTo(Math.round(x), Math.round(y)) : this.ctx.moveTo(Math.round(x), Math.round(y)));
    this.ctx.closePath();
    this.ctx.stroke();
    const mark = this.project(Math.max(0, relative), side * 1.23);
    const scale = mark.scale * 1.5;
    this.ctx.save();
    this.ctx.translate(Math.round(mark.x), Math.round(mark.y));
    this.ctx.scale(scale, scale);
    rect(this.ctx, -1, -88, 2, 88, C.muted);
    rect(this.ctx, -20, -98, 40, 34, C.green);
    rect(this.ctx, -18, -96, 36, 30, C.deep);
    text(this.ctx, 'P', -5, -92, C.green, 4);
    text(this.ctx, 'PIT', -6, -73, C.text);
    this.ctx.restore();
  }

  renderEnding(game) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const time = game.state === 'complete' ? 6 : game.endingTime;
    const arrive = Math.min(1, time / 2.4);
    const ease = 1 - Math.pow(1 - arrive, 3);
    const lights = time >= 2;
    rect(ctx, 0, 0, w, h, C.deep);
    const dawn = ['#202135', '#30304d', '#514363', '#76546f', '#ad7684', C.yellow];
    dawn.forEach((color, i) => rect(ctx, 0, i * h * .095, w, h * .096, color));
    const sunX = w * .84;
    const sunY = h * .27;
    for (let y = -20; y <= 20; y++) {
      const half = Math.floor(Math.sqrt(400 - y * y));
      rect(ctx, sunX - half, sunY + y, half * 2, 1, C.gold);
    }
    rect(ctx, 0, h * .55, w, h * .18, '#2b3550');
    for (let i = 0; i < 9; i++) rect(ctx, w * .76 + (i % 3) * 8, h * .57 + i * 5, 34 - i * 2, 1, '#c29a9470');
    rect(ctx, 0, h * .7, w, h * .3, C.road);
    const x = w * .12;
    const y = h * .27;
    const bw = w * .59;
    const bh = h * .4;
    rect(ctx, x - 5, y - 7, bw + 10, bh + 7, '#33364e');
    rect(ctx, x, y, bw, bh, '#24283b');
    for (let row = 18; row < bh; row += 14) rect(ctx, x, y + row, bw, 1, '#30364e');
    rect(ctx, x - 3, y - 7, bw + 6, 3, lights ? C.pink : C.line);
    const signW = bw * .72;
    rect(ctx, x + bw * .14, y + 10, signW, 38, C.deep);
    rect(ctx, x + bw * .14, y + 10, signW, 2, lights ? C.cyan : C.muted);
    if (this.logo) {
      const logoW = Math.min(signW - 18, 126);
      ctx.save();
      ctx.globalAlpha = lights ? 1 : .3;
      ctx.drawImage(this.logo, Math.round(x + bw / 2 - logoW / 2), Math.round(y + 16), logoW, Math.round(logoW * this.logo.height / this.logo.width));
      ctx.restore();
    }
    text(ctx, 'ARCADE', x + bw / 2 - 23, y + 58, lights ? C.yellow : C.muted, 2);
    const doorX = x + bw * .66;
    rect(ctx, doorX, y + bh * .56, bw * .17, bh * .44, C.deep);
    rect(ctx, doorX + 3, y + bh * .56 + 3, bw * .17 - 6, bh * .44 - 3, lights ? '#b58a64' : '#343b58');
    rect(ctx, doorX + bw * .08, y + bh * .58, 2, bh * .38, C.line);
    for (let i = 0; i < 3; i++) {
      const machineX = x + 17 + i * bw * .16;
      rect(ctx, machineX, y + bh * .58, bw * .12, bh * .36, C.deep);
      rect(ctx, machineX + 3, y + bh * .6, bw * .12 - 6, bh * .15, lights ? [C.cyan, C.pink, C.purple][i] : C.line);
      rect(ctx, machineX + 4, y + bh * .79, 3, 2, lights ? C.yellow : C.muted);
    }
    rect(ctx, x - 6, y + bh, bw + 12, 5, '#565f89');
    for (const lane of [.15, .38, .68, .88]) polygon(ctx, [[w * lane, h * .78], [w * lane - 10, h * .97], [w * lane - 8, h * .97], [w * lane + 1, h * .78]], '#646780');
    const carX = w * (.79 - ease * .28);
    const carY = h * (.94 - ease * (w < 600 ? .2 : .11));
    const carScale = w < 600 ? .88 : 1;
    const width = 96 * carScale;
    const height = 55 * carScale;
    rect(ctx, carX - width * .55, carY - 2, width * 1.1, 7, C.deep);
    ctx.save();
    ctx.translate(Math.round(carX), Math.round(carY));
    ctx.drawImage(this.getCarSprite(game.carId, game.paintId), -width / 2, -height, width, height);
    this.drawDriver({ ...game, cameoTime: time >= 2.5 && time < 5.1 ? time - 2.5 : -1 }, width, height);
    ctx.restore();
    text(ctx, 'TOKYO BAY', 16, 16, C.text, 2);
    text(ctx, '05.12', w - 58, 16, C.text, 2);
  }

  renderPitStop(game) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    this.drawGarage(ctx, w, h * .8);
    rect(ctx, 0, h * .8, w, h * .2, C.road);
    const scale = h * .34 / 104;
    const line = game.pitStop.lines[game.pitDialogueIndex];
    const car = this.getCarSprite(game.carId, game.paintId);
    ctx.drawImage(car, Math.round(w * .5 - 48), Math.round(h * .48 - 55), 96, 55);
    for (const [id, center, isDriver] of [[game.characterId, w * .26, true], [game.pitStop.companionId, w * .73, false]]) {
      const active = line.speaker === (isDriver ? 'driver' : 'crew');
      const figure = this.getFullCharacter(id, active ? 'smile' : 'profile');
      const width = figure.width * scale;
      const height = figure.height * scale;
      const baseline = h * .51;
      rect(ctx, center - width * .6, baseline + 1, width * 1.2, 4, C.deep);
      ctx.save();
      ctx.translate(Math.round(center), Math.round(baseline));
      if (!isDriver && !active) ctx.scale(-1, 1);
      ctx.drawImage(figure, -width / 2, -height, width, height);
      ctx.restore();
      if (active) rect(ctx, center - width * .55, baseline + 7, width * 1.1, 2, isDriver ? C.cyan : C.yellow);
    }
  }

  drawCar(car) {
    const z = car.z - this.distance;
    if (z < -12 || z > 650) return;
    const p = this.project(Math.max(0, z), car.x);
    const width = 66 * p.scale;
    const height = width * 48 / 54;
    const y = p.y - 33 * p.scale;
    if (width < 2) return;
    rect(this.ctx, p.x - width * .55, y - 2, width * 1.1, 5 * p.scale, '#131523');
    rect(this.ctx, p.x - width * .42, y + 2 * p.scale, width * .25, 9 * p.scale, '#f7768e18');
    rect(this.ctx, p.x + width * .2, y + 2 * p.scale, width * .25, 9 * p.scale, '#f7768e18');
    this.ctx.drawImage(this.cars[car.color][car.type === 'van' ? 1 : 0], Math.round(p.x - width / 2), Math.round(y - height), Math.round(width), Math.round(height));
  }

  drawPlayer(game, demo) {
    const ctx = this.ctx;
    const car = getCar(game.carId);
    const scale = this.width < 600 ? .88 : 1;
    const width = 96 * scale;
    const height = 55 * scale;
    const x = this.project(8 * WORLD_SPEED, this.playerX).x;
    const bounce = this.reducedMotion || game.speed < 20 ? 0 : Math.round(Math.sin(game.distance * .7) * (game.boosting ? 1 : .65));
    const y = this.height * .86 + bounce;
    const steer = demo ? Math.sin(this.distance / 200) * .15 : game.steer;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (!this.reducedMotion) ctx.transform(1, steer * .027, -steer * .06, 1, 0, 0);
    rect(ctx, -width * .49, -3, width * .98, 7, '#11131f');
    rect(ctx, -width * .42, 5, width * .26, 4, '#f7768e25');
    rect(ctx, width * .16, 5, width * .26, 4, '#f7768e25');
    rect(ctx, -width * .4, 10, width * .19, 2, '#f7768e12');
    rect(ctx, width * .21, 10, width * .19, 2, '#f7768e12');
    if (game.boosting && !demo) {
      const flame = (this.frame % 4) * 3;
      for (const position of car.exhausts) {
        const exhaust = position * width;
        polygon(ctx, [[exhaust - 5, -6], [exhaust + 5, -6], [exhaust + 7, 8], [exhaust + 3, 5], [exhaust, 23 + flame], [exhaust - 3, 7], [exhaust - 7, 12]], C.blue);
        polygon(ctx, [[exhaust - 3, -4], [exhaust + 3, -4], [exhaust + 4, 6], [exhaust, 15 + flame * .6], [exhaust - 4, 6]], C.cyan);
        rect(ctx, exhaust - 2, -4, 4, 12, C.white);
      }
    }
    if (game.invincible > 0 && !this.reducedMotion && Math.floor(game.invincible * 9) % 2 === 0) ctx.globalAlpha = .6;
    ctx.drawImage(this.getCarSprite(game.carId, game.paintId), Math.round(-width / 2), Math.round(-height), Math.round(width), Math.round(height));
    if (game.input.brake && !demo) {
      rect(ctx, -width * .375, -height * .325, width * .26, 2, '#ffc2bc');
      rect(ctx, width * .125, -height * .325, width * .26, 2, '#ffc2bc');
    }
    if (!demo) this.drawDriver(game, width, height);
    ctx.restore();
    if (game.invincible > 1.3) {
      for (let i = 0; i < 9; i++) {
        const phase = (1.7 - game.invincible) * 80;
        const side = i % 2 ? 1 : -1;
        rect(ctx, x + side * (width * .42 + phase + i * 2), y - 8 + Math.sin(i * 4) * phase, 2, 2, i % 3 ? C.yellow : C.white);
      }
    }
    if (Math.abs(this.playerX) > 1.02 && !demo && game.speed > 30) {
      for (let i = 0; i < 5; i++) {
        const side = this.playerX < 0 ? -1 : 1;
        rect(ctx, x + side * 40 + Math.sin(this.frame + i * 2) * 8, y + i * 5, 2 + i, 1, C.muted);
      }
    }
  }

  drawDriver(game, carWidth, carHeight) {
    const pose = cameoPose(game.cameoTime, this.reducedMotion);
    if (!pose || pose.lift <= 0) return;
    const character = getCharacter(game.characterId);
    const ctx = this.ctx;
    const scale = carWidth / 96;
    const width = 30 * scale;
    const height = 36 * scale;
    const windowX = -carWidth * .36;
    const windowY = -carHeight * .67;
    const x = windowX - width * .55 - pose.lift * 4 * scale;
    const y = windowY - height * pose.lift;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-carWidth, -carHeight * 2, carWidth * 2, carHeight * 2 + windowY + 4 * scale);
    ctx.clip();
    ctx.drawImage(this.drivers[character.id][pose.facing], Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    if (pose.lift > .7 && character.longHair) {
      rect(ctx, x + width - 3, y + height * .48 + pose.wave, 3 * scale, 10 * scale, '#584033');
      rect(ctx, x + width - 1, y + height * .69 + pose.wave, 3 * scale, 6 * scale, '#a17a5b');
    }
    ctx.restore();
    rect(ctx, windowX - 12 * scale, windowY + 4 * scale, 21 * scale, 2 * scale, C.gold);
    if (pose.greeting) {
      const label = character.name.toUpperCase();
      const tagWidth = Math.max(23, label.length * 4 + 10);
      const tagX = Math.round(x + width / 2 - tagWidth / 2);
      const tagY = Math.round(y - 16);
      rect(ctx, tagX, tagY, tagWidth, 11, C.deep);
      rect(ctx, tagX, tagY, tagWidth, 1, C.yellow);
      rect(ctx, tagX + 8, tagY + 11, 3, 3, C.deep);
      text(ctx, label, tagX + 6, tagY + 3, C.gold);
    }
  }

  drawSpeedLines(game) {
    if (game.state !== 'playing' || game.speed < 160 || this.reducedMotion) return;
    const ctx = this.ctx;
    const intensity = clamp((game.speed - 160) / (BOOST_SPEED - 160), 0, 1);
    const count = Math.floor(12 + intensity * 22);
    ctx.save();
    ctx.globalAlpha = game.boosting ? .8 : .2 + intensity * .2;
    for (let i = 0; i < count; i++) {
      const phase = (this.distance * .008 + i * .113) % 1;
      const depth = phase * phase;
      const side = i % 2 ? 1 : -1;
      const startX = this.width / 2 + side * (this.width * .24 + depth * this.width * .36);
      const y = this.horizon - 28 + depth * (this.height - this.horizon + 50) * (.3 + (i * 29 % 100) / 100);
      const length = (10 + intensity * 56) * phase;
      polygon(ctx, [[startX, y], [startX + side * length, y + length * depth * .6], [startX + side * length, y + length * depth * .6 + (game.boosting ? 2 : 1)]], i % 4 ? C.cyan : C.purple);
    }
    ctx.restore();
  }

  render(game) {
    this.frame++;
    if (game.state === 'pit' && game.pitStop) {
      this.renderPitStop(game);
      return;
    }
    if (game.state === 'ending' || game.state === 'complete') {
      this.renderEnding(game);
      return;
    }
    const demo = game.state === 'title' || game.state === 'select' || game.state === 'story';
    this.distance = (demo ? this.reducedMotion ? 300 : game.demoDistance : game.distance) * WORLD_SPEED;
    this.playerX = demo ? 0 : game.playerX;
    this.pitBay = !demo && game.pitStopAt != null ? { at: game.pitStopAt, lane: game.pitStopLane } : null;
    const targetFocalLength = game.boosting && !this.reducedMotion ? 42 : 55;
    this.focalLength += (targetFocalLength - this.focalLength) * .08;
    const ctx = this.ctx;
    ctx.save();
    const shake = this.reducedMotion ? 0 : game.shake;
    if (shake > 0) ctx.translate(Math.round(Math.sin(this.frame * 2.8) * shake), Math.round(Math.cos(this.frame * 3.4) * shake * .5));
    const shift = Math.round(80 + roadCurve(this.distance / WORLD_SPEED) * 15 + this.playerX * 6);
    ctx.drawImage(this.background, shift, 0, this.width, this.horizon + 10, 0, 0, this.width, this.horizon + 10);
    this.drawRoad();
    this.drawPitBay();

    const objects = [];
    for (let i = 0; i < 9; i++) {
      const z = i * 85 - this.distance % 85;
      if (z > 3) for (const side of [-1, 1]) objects.push({ z, draw: () => this.drawLamp(z, side) });
    }
    for (let i = 0; i < 5; i++) {
      const z = i * 150 + 70 - this.distance % 150;
      if (z > 0) {
        const index = Math.floor(this.distance / 150) + i;
        objects.push({ z, draw: () => this.drawBillboard(z, index % 2 ? -1 : 1, index) });
      }
    }
    const checkpointZ = game.nextCheckpoint * WORLD_SPEED - this.distance;
    if (!demo && checkpointZ < 600) objects.push({ z: checkpointZ, draw: () => this.drawGate(checkpointZ) });
    const traffic = demo ? [
      { z: this.distance + 108, x: -.65, color: 3, type: 'car' },
      { z: this.distance + 215, x: .65, color: 1, type: 'car' },
      { z: this.distance + 305, x: 0, color: 2, type: 'van' },
    ] : game.traffic.map((car) => ({ ...car, z: car.z * WORLD_SPEED }));
    traffic.forEach((car) => objects.push({ z: car.z - this.distance, draw: () => this.drawCar(car) }));
    if (!demo && !game.missionStatus?.().complete) {
      (game.pickups || []).forEach((pickup) => objects.push({ z: pickup.z * WORLD_SPEED - this.distance, draw: () => this.drawPickup(pickup) }));
    }
    if (!demo) (game.nitroPickups || []).forEach((pickup) => objects.push({ z: pickup.z * WORLD_SPEED - this.distance, draw: () => this.drawPickup(pickup) }));
    objects.sort((a, b) => b.z - a.z).forEach((object) => object.draw());
    this.drawSpeedLines(game);
    this.drawPlayer(game, demo);
    ctx.restore();
  }
}
