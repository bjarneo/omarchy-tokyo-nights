import * as THREE from '../assets/three.module.js';
import { DISTRICTS } from './engine.mjs';
import { getCharacter } from './characters.mjs';
import { getCar, getPaint } from './cars.mjs';

const C = { bg: '#16161e', panel: '#24283b', line: '#343b58', text: '#c0caf5', muted: '#9aa5ce', yellow: '#e0af68', cyan: '#7dcfff', pink: '#f7768e', green: '#9ece6a' };

export function canvasPanel(width, height, worldWidth, worldHeight) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, transparent: true });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(worldWidth, worldHeight), material);
  return { canvas, ctx: canvas.getContext('2d'), texture, mesh, buttons: [] };
}

function text(ctx, content, x, y, size = 26, color = C.text, arcade = false) {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${arcade ? 'Arcade' : '"Courier New"'}, monospace`;
  ctx.fillText(content, x, y);
}

function button(panel, id, label, x, y, width, height, hover, primary = false) {
  const { ctx } = panel;
  const active = hover === id;
  ctx.fillStyle = primary ? active ? '#ffd578' : C.yellow : active ? C.line : C.panel;
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = active ? C.cyan : primary ? C.yellow : C.line;
  ctx.lineWidth = active ? 4 : 2;
  ctx.strokeRect(x, y, width, height);
  ctx.textAlign = 'center';
  text(ctx, label, x + width / 2, y + height / 2 + 9, primary ? 28 : 24, primary ? C.bg : C.text, primary);
  ctx.textAlign = 'left';
  panel.buttons.push({ id, x, y, width, height });
}

export class CockpitPanels {
  constructor(rig) {
    this.dashboard = canvasPanel(1024, 256, 1.42, .355);
    this.dashboard.mesh.position.set(.35, .85, -.87);
    this.dashboard.mesh.rotation.x = -.12;
    this.menu = canvasPanel(1024, 768, 2.3, 1.725);
    this.menu.mesh.position.set(0, 1.48, -2.6);
    this.message = canvasPanel(1024, 160, 2.5, .39);
    this.message.mesh.position.set(0, 1.55, -3.2);
    rig.add(this.dashboard.mesh, this.menu.mesh, this.message.mesh);
    this.menu.mesh.visible = false;
    this.lastUpdate = -Infinity;
    this.hover = null;
  }

  hit(intersection) {
    if (!intersection?.uv) return null;
    const panel = [this.dashboard, this.menu].find((item) => item.mesh === intersection.object);
    if (!panel) return null;
    const x = intersection.uv.x * panel.canvas.width;
    const y = (1 - intersection.uv.y) * panel.canvas.height;
    return panel.buttons.find((area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height)?.id || null;
  }

  update(game, options, time, force = false) {
    const menuVisible = options.immersive && ['title', 'paused', 'gameover'].includes(game.state);
    this.menu.mesh.visible = menuVisible;
    if (!force && time - this.lastUpdate < .1 && this.lastState === game.state && this.lastHover === this.hover) return;
    this.lastUpdate = time;
    this.lastState = game.state;
    this.lastHover = this.hover;
    const { ctx, texture } = this.dashboard;
    this.dashboard.buttons = [];
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, 1024, 256);
    text(ctx, getCar(game.carId).label.toUpperCase(), 26, 30, 22, C.yellow);
    text(ctx, DISTRICTS[game.stage % 4], 650, 30, 22, C.cyan);
    text(ctx, Math.round(game.speed).toString().padStart(3, '0'), 26, 135, 78, C.text, true);
    text(ctx, 'KM/H', 30, 165, 22, C.muted);
    text(ctx, String(Math.ceil(game.time)).padStart(2, '0'), 348, 127, 60, game.time <= 10 ? C.pink : C.text, true);
    text(ctx, 'SECONDS', 350, 165, 22, C.muted);
    text(ctx, `${Math.max(0, (game.nextCheckpoint - game.distance) / 1000).toFixed(1)}`, 605, 127, 60, C.cyan, true);
    text(ctx, 'KM TO CHECKPOINT', 605, 165, 22, C.muted);
    text(ctx, game.boosting ? 'BOOST' : 'NITRO', 26, 218, 24, game.boosting ? C.yellow : C.cyan);
    ctx.fillStyle = C.line;
    ctx.fillRect(145, 199, 440, 22);
    ctx.fillStyle = game.boosting ? C.yellow : C.cyan;
    ctx.fillRect(145, 199, 440 * game.nitro / 100, 22);
    text(ctx, Math.floor(game.score).toString().padStart(6, '0'), 620, 219, 24, C.yellow);
    button(this.dashboard, 'pause', 'MENU', 844, 187, 152, 48, this.hover);
    texture.needsUpdate = true;

    if (menuVisible) this.drawMenu(game, options);
    const message = game.state === 'countdown' ? game.countdown > 3 ? 'READY' : String(Math.max(1, Math.ceil(game.countdown)))
      : game.state === 'playing' ? game.toast?.text.replace('\n', ' · ') || '' : '';
    this.message.mesh.visible = Boolean(message);
    const m = this.message;
    m.ctx.clearRect(0, 0, 1024, 160);
    if (message) {
      m.ctx.fillStyle = '#16161ee8';
      m.ctx.fillRect(0, 30, 1024, 100);
      m.ctx.textAlign = 'center';
      text(m.ctx, message, 512, 95, message.length > 24 ? 24 : 38, C.yellow, true);
      m.ctx.textAlign = 'left';
    }
    m.texture.needsUpdate = true;
  }

  drawMenu(game, options) {
    const panel = this.menu;
    const { ctx } = panel;
    panel.buttons = [];
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, 1024, 768);
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 1018, 762);
    const paused = game.state === 'paused';
    const ended = game.state === 'gameover';
    text(ctx, paused ? 'DRIVE PAUSED.' : ended ? 'RUN COMPLETE.' : 'TOKYO NIGHTS VR.', 48, 76, 36, C.pink, true);
    text(ctx, ended ? `SCORE ${Math.floor(game.score)} · ${(game.distance / 1000).toFixed(2)} KM · ${game.passed} CARS PASSED`
      : 'Point at a control. Press a trigger to select it.', 48, 124, 26, C.muted);
    button(panel, 'start', paused ? 'RESUME DRIVE' : ended ? 'ONE MORE RUN' : 'START ENGINE', 48, 160, 928, 82, this.hover, true);
    if (!paused) {
      button(panel, 'driver', getCharacter(game.characterId).name.toUpperCase(), 48, 276, 296, 70, this.hover);
      button(panel, 'car', getCar(game.carId).label.toUpperCase(), 364, 276, 296, 70, this.hover);
      button(panel, 'paint', getPaint(game.paintId).name.toUpperCase(), 680, 276, 296, 70, this.hover);
      text(ctx, 'DRIVER', 48, 268, 18, C.muted);
      text(ctx, 'CAR', 364, 268, 18, C.muted);
      text(ctx, 'PAINT', 680, 268, 18, C.muted);
    } else button(panel, 'new', 'START A NEW RUN', 48, 276, 928, 70, this.hover);
    button(panel, 'steering', options.steering === 'wheel' ? 'STEER: GRIP WHEEL' : 'STEER: THUMBSTICK', 48, 370, 448, 66, this.hover);
    button(panel, 'comfort', `COMFORT: ${options.comfort ? 'ON' : 'OFF'}`, 528, 370, 448, 66, this.hover);
    button(panel, 'sound', `SOUND: ${options.sound ? 'ON' : 'OFF'}`, 48, 456, 448, 66, this.hover);
    button(panel, 'recenter', 'CENTER SEAT', 528, 456, 448, 66, this.hover);
    button(panel, 'exit', 'EXIT VR', 48, 544, 928, 64, this.hover);
    text(ctx, 'LEFT STICK: STEER · RIGHT TRIGGER: GAS', 48, 662, 25, C.cyan);
    text(ctx, 'LEFT TRIGGER: BRAKE · A: NITRO · B: PAUSE', 48, 702, 25, C.muted);
    text(ctx, options.steering === 'wheel' ? 'Hold both grips. Turn your hands like a wheel.' : 'X: CENTER SEAT · Y: COMFORT · GAMEPAD ALSO SUPPORTED', 48, 738, 22, C.muted);
    panel.texture.needsUpdate = true;
  }
}
