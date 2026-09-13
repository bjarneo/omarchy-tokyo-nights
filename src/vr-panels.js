import * as THREE from '../assets/three.module.js';
import { DISTRICTS } from './engine.mjs';
import { getCharacter } from './characters.mjs';
import { getCar, getPaint } from './cars.mjs';
import { CHAPTERS, getChapter } from './story.mjs';
import { isRocketView, rocketFlightPhase } from './rocket.mjs';
import { rocketThemeAt } from './rocket-themes.mjs';
import { radioTime } from './radio-catalog.mjs';

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

function paragraph(ctx, content, x, y, width, size = 28, color = C.text) {
  ctx.font = `${size}px "Courier New", monospace`;
  let line = '';
  for (const word of content.split(' ')) {
    if (ctx.measureText(`${line} ${word}`).width > width && line) {
      text(ctx, line, x, y, size, color);
      y += size * 1.5;
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  text(ctx, line, x, y, size, color);
}

export class CockpitPanels {
  constructor(rig, art) {
    this.art = art;
    this.dashboard = canvasPanel(1024, 256, .96, .24);
    this.dashboard.mesh.position.set(0, .94, -.87);
    this.dashboard.mesh.rotation.x = -.12;
    this.menu = canvasPanel(1024, 768, 2, 1.5);
    this.menu.mesh.position.set(-.2, 1.56, -2.6);
    this.message = canvasPanel(1024, 160, 2.5, .39);
    this.message.mesh.position.set(0, 1.55, -3.2);
    this.radio = canvasPanel(768, 320, .74, .308);
    this.radio.mesh.position.set(.9, .94, -1);
    this.radio.mesh.rotation.x = -.12;
    rig.add(this.dashboard.mesh, this.menu.mesh, this.message.mesh, this.radio.mesh);
    this.menu.mesh.visible = false;
    this.lastUpdate = -Infinity;
    this.hover = null;
  }

  hit(intersection) {
    if (!intersection?.uv) return null;
    const panel = [this.dashboard, this.menu, this.radio].find((item) => item.mesh === intersection.object);
    if (!panel) return null;
    const x = intersection.uv.x * panel.canvas.width;
    const y = (1 - intersection.uv.y) * panel.canvas.height;
    return panel.buttons.find((area) => x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height)?.id || null;
  }

  update(game, options, time, force = false) {
    const menuVisible = options.immersive && ['title', 'paused', 'gameover', 'story', 'ending', 'complete', 'pit', 'pit-enter', 'mars'].includes(game.state);
    this.menu.mesh.visible = menuVisible;
    if (!force && time - this.lastUpdate < .1 && this.lastState === game.state && this.lastHover === this.hover) return;
    this.lastUpdate = time;
    this.lastState = game.state;
    this.lastHover = this.hover;
    this.drawRadio(options.radio);
    const { ctx, texture } = this.dashboard;
    this.dashboard.buttons = [];
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, 1024, 256);
    const mission = game.missionStatus();
    const drop = game.pickups.find((pickup) => !pickup.resolved && pickup.z >= game.distance);
    const pit = game.pitStopAt !== null && game.pitStopAt - game.distance < 350 ? ` · PIT ${game.pitStopLane < 0 ? 'L' : 'R'}` : '';
    text(ctx, `${mission.label}${!mission.complete && drop ? ` · ${drop.x < 0 ? 'LEFT' : drop.x > 0 ? 'RIGHT' : 'CENTER'} DROP` : ''}${pit}`, 26, 30, 22, mission.complete ? C.green : C.yellow);
    text(ctx, DISTRICTS[game.stage % 4], 650, 30, 22, C.cyan);
    text(ctx, Math.round(game.speed).toString().padStart(3, '0'), 26, 135, 78, C.text, true);
    text(ctx, `KM/H · ${getCar(game.carId).label.toUpperCase()}`, 30, 165, 20, C.muted);
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
    if (isRocketView(game)) {
      const flight = rocketFlightPhase(game.rocketTime);
      const theme = rocketThemeAt(game.rocketTime);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, 1024, 256);
      text(ctx, 'OMARCHY ROCKET', 26, 30, 24, C.cyan);
      text(ctx, `${theme.index + 1}/${theme.count} · ${theme.name.toUpperCase()}`, 380, 30, 22, C.text);
      text(ctx, flight.label, 26, 88, 32, C.text, true);
      text(ctx, `${Math.round(flight.thrust * 100)}%`, 26, 161, 54, C.cyan, true);
      text(ctx, `MARS ${flight.remaining.toFixed(1)}s`, 360, 161, 44, C.yellow, true);
      theme.swatches.forEach(([, color], i) => {
        ctx.fillStyle = color;
        ctx.fillRect(26 + i * 740 / theme.swatches.length, 184, 740 / theme.swatches.length - 1, 10);
      });
      ctx.fillStyle = C.line; ctx.fillRect(26, 212, 740, 12);
      ctx.fillStyle = C.cyan; ctx.fillRect(26, 212, 740 * flight.progress, 12);
      this.dashboard.buttons = [];
      button(this.dashboard, 'pause', 'MENU', 844, 187, 152, 48, this.hover);
      texture.needsUpdate = true;
    }

    if (menuVisible) this.drawMenu(game, options);
    const message = !menuVisible && options.songError ? 'SONG ERROR · RETRY IN MENU'
      : !menuVisible && options.songPending ? 'SONG LOAD · MENU TO CANCEL'
      : game.state === 'countdown' ? game.countdown > 3 ? 'READY' : String(Math.max(1, Math.ceil(game.countdown)))
      : game.state === 'rocket-flight' ? rocketFlightPhase(game.rocketTime).label
      : game.state === 'playing' ? game.toast?.text.replace('\n', ' · ') || (game.rocketAt != null && game.rocketAt - game.distance < 600 ? 'ROCKET RIGHT · DRIVE INTO CYAN RAMP' : '') : '';
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
    const ended = game.state === 'gameover' || game.state === 'complete';
    if (game.state === 'mars') {
      text(ctx, 'MARS REACHED.', 48, 84, 42, C.pink, true);
      paragraph(ctx, 'Twenty-second flight complete. Your car and driver reach the Omarchy outpost on Mars.', 48, 160, 920, 30);
      text(ctx, 'MARS BONUS +5000', 48, 320, 34, C.yellow, true);
      text(ctx, 'PATRON DISPLAYS · LOOK RIGHT', 48, 372, 26, C.cyan);
      button(panel, 'start', 'RETURN TO TOKYO', 48, 420, 928, 82, this.hover, true);
      button(panel, 'exit', 'EXIT VR', 48, 538, 928, 64, this.hover);
      panel.texture.needsUpdate = true;
      return;
    }
    if (game.state === 'story' || game.state === 'ending' || game.state === 'pit' || game.state === 'pit-enter') {
      const chapter = getChapter(game.stage);
      const story = game.state === 'story';
      const pit = game.state === 'pit' || game.state === 'pit-enter';
      text(ctx, pit ? 'PIT STOP.' : story ? chapter.title : 'DELIVERY COMPLETE.', 48, 76, 30, C.pink, true);
      text(ctx, pit ? game.pitStop.title : `CHAPTER ${game.stage + 1} OF ${CHAPTERS.length} · ${chapter.district}`, 48, 124, 26, C.muted);
      if (game.state !== 'pit-enter') button(panel, 'start', pit ? game.pitDialogueIndex === game.pitStop.lines.length - 1 ? 'BACK TO RACE' : 'CONTINUE' : story ? 'BEGIN CHAPTER' : 'VIEW RESULTS', 48, 160, 928, 82, this.hover, true);
      if (pit) {
        const line = game.pitStop.lines[game.pitDialogueIndex];
        const speaker = line.speaker === 'crew' ? game.pitStop.companionId : game.characterId;
        text(ctx, getCharacter(speaker).name.toUpperCase(), 48, 292, 26, C.yellow);
        paragraph(ctx, game.state === 'pit-enter' ? 'The car slows for the pit stop.' : line.text, 48, 348, 680, 30);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.art.renderer.getFullCharacter(speaker), 786, 262, 128, 277);
        text(ctx, `${game.pitDialogueIndex + 1} OF ${game.pitStop.lines.length} · NITRO REFILLS AT DEPARTURE`, 48, 536, 26, C.cyan);
      } else {
        paragraph(ctx, story ? chapter.text : 'The crew plays the tape. The arcade lights stay on. Your final delivery reaches Tokyo Bay.', 48, 300, 920);
        paragraph(ctx, story ? chapter.objective : `FINAL SCORE: ${Math.floor(game.score)} · ${game.passed} CARS PASSED`, 48, 526, 920, 28, C.cyan);
      }
      button(panel, 'song', options.songPending ? 'CANCEL SONG LOAD' : options.song ? 'PAUSE SONG' : 'PLAY SONG', 48, 584, 284, 60, this.hover);
      button(panel, 'room', 'RETRO ROOM', 356, 584, 284, 60, this.hover);
      button(panel, 'exit', 'EXIT VR', 664, 584, 312, 60, this.hover);
      if (options.songError || options.songPending) paragraph(ctx, options.songError || 'The song loads. Select Cancel song load to stop it.', 48, 680, 920, 23, options.songError ? C.pink : C.cyan);
      panel.texture.needsUpdate = true;
      return;
    }
    text(ctx, paused ? isRocketView(game) ? 'FLIGHT PAUSED.' : 'DRIVE PAUSED.' : game.state === 'complete' ? 'DELIVERY COMPLETE.' : ended ? 'RUN FAILED.' : 'TOKYO NIGHTS VR.', 48, 76, 36, C.pink, true);
    if (game.state === 'gameover') paragraph(ctx, game.failureReason, 48, 110, 928, 24, C.text);
    else text(ctx, ended ? `SCORE ${Math.floor(game.score)} · ${(game.distance / 1000).toFixed(2)} KM · ${game.passed} CARS PASSED`
      : 'Point at a control. Press a trigger to select it.', 48, 124, 26, C.muted);
    if (!isRocketView(game)) button(panel, 'garage', options.garage ? 'COCKPIT' : 'GARAGE', 804, 24, 172, 54, this.hover);
    button(panel, 'start', paused ? 'RESUME DRIVE' : ended ? 'ONE MORE RUN' : 'START ENGINE', 48, 160, 928, 82, this.hover, true);
    if (!paused) {
      button(panel, 'driver', getCharacter(game.characterId).name.toUpperCase(), 48, 276, 296, 70, this.hover);
      button(panel, 'car', getCar(game.carId).label.toUpperCase(), 364, 276, 296, 70, this.hover);
      button(panel, 'paint', getPaint(game.paintId).name.toUpperCase(), 680, 276, 296, 70, this.hover);
      text(ctx, 'DRIVER', 48, 268, 18, C.muted);
      text(ctx, 'CAR', 364, 268, 18, C.muted);
      text(ctx, 'PAINT', 680, 268, 18, C.muted);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.art.renderer.drivers[game.characterId].smile, 57, 281, 50, 59);
      ctx.drawImage(this.art.renderer.getCarSprite(game.carId, game.paintId), 374, 292, 70, 40);
      ctx.fillStyle = getPaint(game.paintId).hex;
      ctx.fillRect(694, 296, 20, 30);
    } else button(panel, 'new', 'START A NEW RUN', 48, 276, 928, 70, this.hover);
    button(panel, 'steering', options.steering === 'wheel' ? 'STEER: GRIP WHEEL' : 'STEER: THUMBSTICK', 48, 370, 448, 66, this.hover);
    button(panel, 'comfort', `COMFORT: ${options.comfort ? 'ON' : 'OFF'}`, 528, 370, 448, 66, this.hover);
    button(panel, 'sound', `SOUND: ${options.sound ? 'ON' : 'OFF'}`, 48, 456, 448, 66, this.hover);
    button(panel, 'recenter', 'CENTER SEAT', 528, 456, 448, 66, this.hover);
    button(panel, 'song', options.songPending ? 'CANCEL SONG LOAD' : options.song ? 'PAUSE SONG' : 'PLAY SONG', 48, 544, 284, 64, this.hover);
    button(panel, 'room', 'RETRO ROOM', 356, 544, 284, 64, this.hover);
    button(panel, 'exit', 'EXIT VR', 664, 544, 312, 64, this.hover);
    if (options.songError || options.songPending) {
      paragraph(ctx, options.songError || 'The song loads. Select Cancel song load to stop it.', 48, 656, 920, 25, options.songError ? C.pink : C.cyan);
    } else {
      text(ctx, ended ? `SCORE ${Math.floor(game.score)} · ${(game.distance / 1000).toFixed(2)} KM · ${game.passed} CARS PASSED` : 'LEFT STICK: STEER · RIGHT TRIGGER: GAS', 48, 662, 25, C.cyan);
      text(ctx, 'LEFT TRIGGER: BRAKE · A: NITRO · B: PAUSE', 48, 702, 25, C.muted);
      text(ctx, options.steering === 'wheel' ? 'Hold both grips. Turn your hands like a wheel.' : 'X: CENTER SEAT · Y: COMFORT · GAMEPAD ALSO SUPPORTED', 48, 738, 22, C.muted);
    }
    panel.texture.needsUpdate = true;
  }

  drawRadio(state) {
    const panel = this.radio;
    const { ctx } = panel;
    panel.buttons = [];
    ctx.textAlign = 'left';
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, 768, 320);
    ctx.strokeStyle = C.line; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 760, 312);
    text(ctx, 'OMARCHY RADIO', 24, 36, 26, C.green);
    text(ctx, `${(state?.index || 0) + 1}/${state?.count || 33}`, 632, 36, 26, C.muted);
    paragraph(ctx, state?.track?.title || 'Choose a track', 24, 83, 710, 30, C.text);
    text(ctx, state?.track?.artist || 'Community playlist', 24, 161, 26, C.muted);
    button(panel, 'radio-previous', 'PREV', 24, 188, 116, 66, this.hover);
    button(panel, 'radio-toggle', state?.pending ? 'CANCEL' : state?.active ? 'PAUSE' : 'PLAY', 152, 188, 200, 66, this.hover, true);
    button(panel, 'radio-next', 'NEXT', 364, 188, 116, 66, this.hover);
    button(panel, 'radio-down', 'VOL -', 504, 188, 110, 66, this.hover);
    button(panel, 'radio-up', 'VOL +', 626, 188, 118, 66, this.hover);
    text(ctx, state?.error ? 'TRACK ERROR · TRY PLAY OR NEXT' : `${(state?.mode || 'off').toUpperCase()} · VOL ${Math.round((state?.volume ?? .55) * 100)}% · ${radioTime(state?.time)}`, 24, 291, 25, state?.error ? C.pink : C.cyan);
    panel.texture.needsUpdate = true;
  }
}
