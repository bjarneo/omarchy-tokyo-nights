import { GameEngine } from '/src/engine.mjs';
import { Renderer } from '/src/renderer.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const font = new FontFace('Arcade', 'url(/assets/arcade.woff2)');
document.fonts.add(await font.load());

const game = new GameEngine({ random: () => .5 });
Object.assign(game, {
  state: 'playing', distance: 385, speed: 460, boosting: true,
  cameoTime: 1.83, steer: -.2, elapsed: 19,
  traffic: [
    { z: 385 + 100, x: -.65, color: 3, type: 'car' },
    { z: 385 + 190, x: .65, color: 1, type: 'car' },
    { z: 385 + 265, x: 0, color: 2, type: 'van' },
  ],
});

const renderer = new Renderer(canvas);
await renderer.logoReady;
renderer.resize(640, 640);
const drawPlayer = renderer.drawPlayer.bind(renderer);
renderer.drawPlayer = () => {};
renderer.render(game);

// The cover keeps a dark title field within the city artwork.
for (let y = 0; y < 238; y++) {
  ctx.fillStyle = `rgba(22,22,30,${.38 * Math.pow(1 - y / 238, 1.3)})`;
  ctx.fillRect(0, y, 640, 1);
}

function lettering(value, x, y, color, size = 48) {
  ctx.font = `${size}px Arcade`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#16161e';
  ctx.fillText(value, x + 3, y + 4);
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function tracked(value, x, y, color, size, gap) {
  ctx.font = `${size}px Arcade`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  for (const character of value) {
    ctx.fillText(character, Math.round(x), y);
    x += ctx.measureText(character).width + gap;
  }
}

lettering('TOKYO', 160, 45, '#f7768e', 64);
lettering('NIGHTS', 96, 124, '#c0caf5', 64);
lettering('.', 480, 124, '#e0af68', 64);
tracked('THE MIDNIGHT RUN', 226, 211, '#c0caf5', 10, 2);

const heroX = 405;
const heroY = 462;
const heroScale = 2.8;
const playerPosition = renderer.project(14.8, 0);
const heroGame = { ...game, speed: 0 };
renderer.frame = 0;
ctx.save();
ctx.translate(heroX, heroY);
ctx.scale(heroScale, heroScale);
ctx.translate(-Math.round(playerPosition.x), -Math.round(renderer.height * .86));
drawPlayer(heroGame, false);
ctx.restore();

// Sparse rain reflections stay behind the focal car and title.
for (let i = 0; i < 15; i++) {
  const x = 45 + (i * 47 % 270);
  const y = 379 + i * 8;
  ctx.fillStyle = i % 3 === 0 ? '#f7768e36' : '#7dcfff24';
  ctx.fillRect(x, y, 5 + i % 4 * 4, 1);
}

const logoResponse = await fetch('/assets/omarchy-logo.txt');
if (!logoResponse.ok) throw new Error('The Omarchy logo cannot load.');
const logoLines = (await logoResponse.text()).trimEnd().split('\n');
const logoCellWidth = 4;
const logoCellHeight = 8;
const logoWidth = Math.max(...logoLines.map((line) => line.length)) * logoCellWidth;
const logoX = Math.round((640 - logoWidth) / 2);
const logoY = 540;

// Each block preserves the geometry of the supplied text logo.
for (const [row, line] of logoLines.entries()) {
  for (const [column, character] of [...line].entries()) {
    if (character === ' ') continue;
    if (!['█', '▀', '▄'].includes(character)) throw new Error('The Omarchy logo contains an unsupported block.');
    const top = character === '▄' ? logoCellHeight / 2 : 0;
    const height = character === '█' ? logoCellHeight : logoCellHeight / 2;
    ctx.fillStyle = '#16161e';
    ctx.fillRect(logoX + column * logoCellWidth + 2, logoY + row * logoCellHeight + top + 2, logoCellWidth, height);
  }
}
ctx.fillStyle = '#c0caf5';
for (const [row, line] of logoLines.entries()) {
  for (const [column, character] of [...line].entries()) {
    if (character === ' ') continue;
    const top = character === '▄' ? logoCellHeight / 2 : 0;
    const height = character === '█' ? logoCellHeight : logoCellHeight / 2;
    ctx.fillRect(logoX + column * logoCellWidth, logoY + row * logoCellHeight + top, logoCellWidth, height);
  }
}

ctx.strokeStyle = '#414868';
ctx.lineWidth = 1;
ctx.strokeRect(12.5, 12.5, 615, 615);
ctx.fillStyle = '#e0af68';
for (const [x, y, direction] of [[12, 12, 1], [628, 12, -1], [12, 628, 1], [628, 628, -1]]) {
  ctx.fillRect(direction > 0 ? x : x - 14, y, 14, 1);
  ctx.fillRect(x, y > 320 ? y - 8 : y, 1, 8);
}

const output = document.createElement('canvas');
output.width = 2560;
output.height = 2560;
const outputContext = output.getContext('2d');
outputContext.imageSmoothingEnabled = false;
outputContext.drawImage(canvas, 0, 0, output.width, output.height);
window.coverImage = output.toDataURL('image/png');
