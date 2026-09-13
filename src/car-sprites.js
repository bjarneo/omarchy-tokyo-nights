import { getCar, getPaint } from './cars.mjs';

const INK = '#151823';
const GLASS = '#242d45';
const CHROME = '#c0caf5';
const RED = '#f7768e';

function rgb(hex) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

function mix(first, second, amount) {
  const a = rgb(first);
  const b = rgb(second);
  return `#${a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount).toString(16).padStart(2, '0')).join('')}`;
}

function rect(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fill();
}

function circle(ctx, x, y, radius, color) {
  for (let row = -radius; row <= radius; row++) {
    const half = Math.floor(Math.sqrt(radius * radius - row * row));
    rect(ctx, x - half, y + row, half * 2 + 1, 1, color);
  }
}

function wheels(ctx, inset = 10) {
  rect(ctx, inset, 38, 13, 17, INK);
  rect(ctx, 83 - inset, 38, 13, 17, INK);
  rect(ctx, inset + 1, 43, 2, 9, '#414868');
  rect(ctx, 92 - inset, 43, 2, 9, '#414868');
}

function plate(ctx, y = 39) {
  rect(ctx, 40, y, 16, 6, CHROME);
  rect(ctx, 43, y + 2, 10, 2, INK);
}

function roundLights(ctx, y, centers = [18, 28, 68, 78], radius = 4) {
  centers.forEach((x) => {
    circle(ctx, x, y, radius + 1, INK);
    circle(ctx, x, y, radius, RED);
    rect(ctx, x - 2, y - 2, 4, 1, '#ffc1bd');
  });
}

function repaintCountach(sprite, color) {
  const ctx = sprite.getContext('2d');
  const image = ctx.getImageData(0, 0, sprite.width, sprite.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const [r, g, b, alpha] = image.data.subarray(i, i + 4);
    if (!alpha || r < g + 8 || g < b + 15 || g < 45) continue;
    const luminance = r * .2126 + g * .7152 + b * .0722;
    const mapped = luminance >= 178
      ? mix(color, '#e5e9ff', Math.min(.7, (luminance - 178) / 100))
      : mix(color, '#16161e', Math.min(.8, (178 - luminance) / 160));
    const channels = rgb(mapped);
    image.data.set(channels, i);
  }
  ctx.putImageData(image, 0, 0);
}

export function makeCarSprite(carId, paintId, countach) {
  const car = getCar(carId);
  const paint = getPaint(paintId);
  const sprite = document.createElement('canvas');
  sprite.width = 96;
  sprite.height = 55;
  const ctx = sprite.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  if (car.id === 'countach') {
    ctx.drawImage(countach, 0, 0);
    if (paint.id !== 'amber') repaintCountach(sprite, paint.hex);
    return sprite;
  }
  const p = { body: paint.hex, light: mix(paint.hex, '#e5e9ff', .38), mid: mix(paint.hex, '#16161e', .2), dark: mix(paint.hex, '#16161e', .45) };
  wheels(ctx, car.id === '240z' ? 13 : 10);

  if (car.id === 'skyline') {
    poly(ctx, [[10, 25], [20, 11], [28, 6], [68, 6], [76, 11], [86, 25], [88, 47], [8, 47]], p.body);
    poly(ctx, [[22, 22], [29, 10], [67, 10], [74, 22]], GLASS);
    rect(ctx, 31, 11, 34, 2, '#596888');
    rect(ctx, 8, 25, 80, 4, p.light);
    rect(ctx, 9, 31, 78, 13, p.dark);
    roundLights(ctx, 36);
    plate(ctx, 38);
    rect(ctx, 8, 46, 80, 5, p.mid);
    rect(ctx, 12, 51, 72, 2, INK);
    rect(ctx, 72, 49, 7, 3, '#414868');
  } else if (car.id === 'supra') {
    poly(ctx, [[5, 34], [13, 23], [23, 15], [29, 5], [39, 2], [60, 2], [68, 6], [75, 17], [84, 25], [91, 36], [87, 49], [9, 49]], p.body);
    poly(ctx, [[26, 23], [34, 7], [62, 7], [72, 23]], GLASS);
    rect(ctx, 36, 8, 24, 2, '#5b6885');
    rect(ctx, 13, 20, 4, 16, p.dark);
    rect(ctx, 79, 20, 4, 16, p.dark);
    poly(ctx, [[5, 22], [16, 16], [80, 16], [91, 22], [89, 25], [77, 21], [19, 21], [7, 25]], p.light);
    poly(ctx, [[10, 32], [29, 30], [67, 30], [86, 32], [88, 40], [8, 40]], p.mid);
    roundLights(ctx, 36, [18, 29, 67, 78], 3);
    plate(ctx, 41);
    rect(ctx, 12, 49, 72, 3, p.dark);
    circle(ctx, 75, 49, 3, INK);
  } else if (car.id === 'rx7') {
    poly(ctx, [[8, 31], [16, 24], [23, 12], [33, 4], [63, 4], [73, 12], [80, 24], [88, 31], [90, 42], [83, 50], [13, 50], [6, 42]], p.body);
    poly(ctx, [[22, 26], [31, 8], [64, 8], [74, 26]], GLASS);
    rect(ctx, 34, 9, 27, 2, '#596783');
    poly(ctx, [[9, 28], [20, 26], [76, 26], [87, 28], [86, 32], [10, 32]], p.light);
    poly(ctx, [[10, 34], [23, 32], [73, 32], [86, 34], [82, 42], [14, 42]], INK);
    roundLights(ctx, 37, [21, 31, 65, 75], 3);
    plate(ctx, 43);
    rect(ctx, 16, 49, 64, 3, p.dark);
    rect(ctx, 18, 48, 6, 3, '#414868');
    rect(ctx, 72, 48, 6, 3, '#414868');
  } else if (car.id === 'nsx') {
    poly(ctx, [[5, 31], [17, 23], [28, 12], [37, 8], [59, 8], [68, 12], [79, 23], [91, 31], [89, 47], [7, 47]], p.body);
    poly(ctx, [[25, 26], [34, 13], [62, 13], [71, 26]], GLASS);
    rect(ctx, 37, 14, 23, 2, '#5b6b8f');
    rect(ctx, 10, 24, 5, 12, p.dark);
    rect(ctx, 81, 24, 5, 12, p.dark);
    rect(ctx, 5, 23, 86, 4, p.light);
    rect(ctx, 7, 31, 82, 8, INK);
    rect(ctx, 10, 32, 76, 4, RED);
    rect(ctx, 12, 32, 72, 1, '#ffc1bd');
    rect(ctx, 40, 32, 16, 4, p.dark);
    plate(ctx, 40);
    rect(ctx, 9, 47, 78, 5, p.dark);
    rect(ctx, 17, 48, 8, 3, INK);
    rect(ctx, 71, 48, 8, 3, INK);
  } else if (car.id === '911') {
    poly(ctx, [[7, 34], [14, 21], [23, 15], [30, 5], [39, 1], [57, 1], [66, 5], [73, 15], [82, 21], [89, 34], [85, 48], [77, 52], [19, 52], [11, 48]], p.body);
    poly(ctx, [[28, 22], [35, 6], [61, 6], [68, 22]], GLASS);
    rect(ctx, 38, 7, 21, 2, '#627394');
    poly(ctx, [[7, 25], [18, 20], [78, 20], [89, 25], [86, 33], [10, 33]], p.light);
    rect(ctx, 23, 24, 50, 8, INK);
    for (let x = 26; x < 72; x += 5) rect(ctx, x, 25, 2, 6, p.dark);
    rect(ctx, 12, 35, 72, 5, RED);
    rect(ctx, 15, 35, 66, 1, '#ffc1bd');
    plate(ctx, 43);
    rect(ctx, 12, 48, 72, 4, INK);
    rect(ctx, 19, 47, 7, 3, CHROME);
    rect(ctx, 70, 47, 7, 3, CHROME);
  } else if (car.id === 'f40') {
    poly(ctx, [[7, 29], [17, 22], [25, 10], [32, 5], [64, 5], [71, 10], [79, 22], [89, 29], [89, 48], [7, 48]], p.body);
    poly(ctx, [[25, 25], [32, 9], [64, 9], [71, 25]], GLASS);
    for (let x = 34; x < 64; x += 6) rect(ctx, x, 12, 3, 13, '#47516c');
    rect(ctx, 8, 16, 5, 20, p.dark);
    rect(ctx, 83, 16, 5, 20, p.dark);
    rect(ctx, 4, 13, 88, 5, p.light);
    rect(ctx, 5, 32, 86, 14, INK);
    roundLights(ctx, 37, [17, 28, 68, 79], 4);
    plate(ctx, 35);
    rect(ctx, 8, 47, 80, 5, p.mid);
    for (const x of [39, 48, 57]) circle(ctx, x, 48, 3, INK);
    rect(ctx, 35, 28, 26, 2, p.dark);
  } else if (car.id === 'ae86') {
    poly(ctx, [[10, 26], [17, 8], [23, 3], [73, 3], [79, 8], [86, 26], [86, 49], [10, 49]], p.body);
    poly(ctx, [[18, 27], [24, 8], [72, 8], [78, 27]], INK);
    poly(ctx, [[22, 25], [28, 10], [69, 10], [74, 25]], '#414f6e');
    rect(ctx, 31, 11, 35, 2, '#6d7b9a');
    rect(ctx, 20, 29, 56, 3, p.light);
    rect(ctx, 11, 33, 74, 10, INK);
    for (const x of [14, 60]) {
      rect(ctx, x, 35, 22, 5, RED);
      rect(ctx, x, 35, 7, 5, '#ff9e64');
      rect(ctx, x + 16, 35, 6, 2, CHROME);
    }
    plate(ctx, 36);
    rect(ctx, 10, 45, 76, 7, INK);
    rect(ctx, 13, 44, 70, 2, p.mid);
  } else if (car.id === '240z') {
    poly(ctx, [[10, 32], [18, 21], [28, 8], [36, 3], [60, 3], [68, 8], [78, 21], [86, 32], [85, 47], [78, 51], [18, 51], [11, 47]], p.body);
    poly(ctx, [[24, 28], [34, 7], [62, 7], [72, 28]], GLASS);
    rect(ctx, 36, 8, 25, 2, '#586783');
    rect(ctx, 20, 29, 56, 3, p.light);
    rect(ctx, 13, 34, 70, 10, INK);
    for (const x of [16, 60]) {
      rect(ctx, x, 35, 20, 6, RED);
      rect(ctx, x, 35, 6, 5, '#ff9e64');
      rect(ctx, x + 8, 36, 10, 1, '#ffc1bd');
    }
    plate(ctx, 36);
    rect(ctx, 9, 45, 78, 3, CHROME);
    rect(ctx, 17, 45, 4, 6, INK);
    rect(ctx, 75, 45, 4, 6, INK);
    rect(ctx, 68, 50, 8, 2, '#626d89');
  }
  return sprite;
}
