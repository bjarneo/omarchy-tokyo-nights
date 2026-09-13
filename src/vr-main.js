import { GameEngine, DISTRICTS } from './engine.mjs';
import { CHARACTERS, getCharacter } from './characters.mjs';
import { CARS, PAINTS, getCar, getPaint } from './cars.mjs';
import { VRInput, pulseControllers } from './vr-controls.mjs';
import { VRSession } from './vr-session.mjs';
import { SpatialRaceAudio } from './vr-audio.js';
import { seatOffset } from './vr-world.mjs';

const $ = (id) => document.getElementById(id);
const storage = {
  get(key, fallback) { try { return localStorage.getItem(`tokyo-nights.${key}`) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(`tokyo-nights.${key}`, String(value)); } catch { /* Storage is optional. */ } },
};
const announce = (text) => { $('vr-announcer').textContent = text; };
const audio = new SpatialRaceAudio();
const input = new VRInput();
const keys = new Set();
const touch = new Set();
const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake', Space: 'nitro', ShiftLeft: 'nitro', ShiftRight: 'nitro' };
const options = {
  immersive: false,
  comfort: storage.get('vr.comfort', 'true') !== 'false',
  steering: storage.get('vr.steering', 'stick') === 'wheel' ? 'wheel' : 'stick',
  sound: storage.get('sound', 'false') === 'true',
};
let scene;
let vr;
let baseSpace;
let needsRecenter = false;
let lastTimestamp = null;
let lastUiTime = -Infinity;
let lastState = '';
let contextLost = false;
let disposed = false;
const game = new GameEngine({
  characterId: storage.get('character', 'dhh'), carId: storage.get('car', 'countach'), paintId: storage.get('paint', 'amber'),
  onEvent(event) {
    audio.event(event);
    if (event.type === 'collision') {
      pulseControllers(vr?.session?.inputSources, .8, 130);
      announce('Collision. You lose three seconds.');
    }
    if (event.type === 'near-miss') pulseControllers(vr?.session?.inputSources, .3, 55);
    if (event.type === 'checkpoint') {
      pulseControllers(vr?.session?.inputSources, .45, 160);
      announce(`Checkpoint. You gain 35 seconds. Enter ${DISTRICTS[event.stage % 4]}.`);
    }
    if (event.type === 'start') announce('The countdown starts. Steer through traffic and reach the checkpoint.');
    if (event.type === 'pause') announce('The drive is paused.');
    if (event.type === 'resume') announce('The drive resumes.');
    if (event.type === 'gameover') {
      const saved = Number(storage.get('best', '0'));
      if (!Number.isFinite(saved) || event.score > saved) storage.set('best', event.score);
      announce(`The run ends. Your score is ${event.score}.`);
    }
  },
});

function populate(id, items, selected) {
  for (const item of items) {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    $(id).append(option);
  }
  $(id).value = selected;
}
populate('vr-driver', CHARACTERS, game.characterId);
populate('vr-car', CARS, game.carId);
populate('vr-paint', PAINTS, game.paintId);
$('vr-steering').value = options.steering;
$('vr-comfort').checked = options.comfort;

function saveSetup() {
  storage.set('character', game.characterId);
  storage.set('car', game.carId);
  storage.set('paint', game.paintId);
}

function updateSetup() {
  if (!['title', 'gameover'].includes(game.state)) return;
  game.characterId = getCharacter($('vr-driver').value).id;
  game.carId = getCar($('vr-car').value).id;
  game.paintId = getPaint($('vr-paint').value).id;
  if (scene) scene.panels.lastUpdate = -Infinity;
}
['vr-driver', 'vr-car', 'vr-paint'].forEach((id) => $(id).addEventListener('change', updateSetup));

function clearControls() {
  keys.clear();
  touch.clear();
  game.clearInput();
  document.querySelectorAll('[data-control]').forEach((button) => button.classList.remove('is-pressed'));
}

function startDrive() {
  if (!scene || contextLost) return;
  updateSetup();
  if (game.state === 'paused') game.resume();
  else if (['title', 'gameover'].includes(game.state)) { saveSetup(); game.start(); }
  else return;
  lastTimestamp = null;
  if (options.sound) void setSound(true);
  audio.restore();
  syncState();
  if (!options.immersive) $('vr-canvas').focus({ preventScroll: true });
}

function pauseDrive() {
  game.pause();
  clearControls();
  syncState();
}

function togglePause() {
  if (game.state === 'paused') startDrive();
  else pauseDrive();
}

function recenter() {
  if (!scene) return;
  if (options.immersive) needsRecenter = true;
  else scene.resetView();
  input.wheelNeutral = null;
  announce('The view centers on the driver seat.');
}

function setComfort(enabled) {
  options.comfort = enabled;
  $('vr-comfort').checked = enabled;
  storage.set('vr.comfort', enabled);
  if (scene) scene.panels.lastUpdate = -Infinity;
}

function setSteering(mode) {
  options.steering = mode;
  $('vr-steering').value = mode;
  storage.set('vr.steering', mode);
  input.wheelNeutral = null;
  if (scene) scene.panels.lastUpdate = -Infinity;
}

async function setSound(enabled) {
  options.sound = await audio.setEnabled(enabled);
  storage.set('sound', options.sound);
  $('vr-sound').textContent = options.sound ? 'SOUND ON' : 'SOUND OFF';
  $('vr-sound').setAttribute('aria-pressed', String(options.sound));
  $('vr-sound').setAttribute('aria-label', options.sound ? 'Turn sound off' : 'Turn sound on');
  if (!audio.available) {
    $('vr-sound').textContent = 'NO AUDIO';
    $('vr-sound').disabled = true;
    announce('Audio is unavailable in this browser.');
  }
  if (scene) scene.panels.lastUpdate = -Infinity;
}

function action(id) {
  if (id === 'start') startDrive();
  if (id === 'pause') togglePause();
  if (id === 'recenter') recenter();
  if (id === 'comfort') setComfort(!options.comfort);
  if (id === 'steering') setSteering(options.steering === 'stick' ? 'wheel' : 'stick');
  if (id === 'sound') void setSound(!options.sound);
  if (id === 'exit') void vr?.exit();
  if (id === 'new') {
    game.home();
    clearControls();
    syncState();
  }
  if (['driver', 'car', 'paint'].includes(id) && ['title', 'gameover'].includes(game.state)) {
    const items = { driver: CHARACTERS, car: CARS, paint: PAINTS }[id];
    const select = $(`vr-${id}`);
    select.value = items[(items.findIndex((item) => item.id === select.value) + 1) % items.length].id;
    updateSetup();
  }
}

function syncState() {
  if (lastState === game.state) return;
  lastState = game.state;
  clearControls();
  document.body.dataset.state = game.state;
  const driving = ['playing', 'countdown'].includes(game.state);
  const paused = game.state === 'paused';
  const ended = game.state === 'gameover';
  $('vr-panel').hidden = driving;
  $('vr-readouts').hidden = !driving;
  $('vr-touch').hidden = !driving || options.immersive;
  $('vr-setup').hidden = paused;
  $('vr-result').hidden = !ended;
  $('vr-new-run').hidden = !paused;
  $('vr-pause').disabled = !driving && !paused;
  $('vr-pause').textContent = paused ? 'RESUME' : 'PAUSE';
  $('vr-drive').textContent = paused ? 'RESUME ON SCREEN' : ended ? 'ONE MORE RUN' : 'DRIVE ON SCREEN';
  $('vr-heading').innerHTML = paused ? 'DRIVE<br /><span>PAUSED.</span>' : ended ? 'RUN<br /><span>COMPLETE.</span>' : 'TOKYO<br /><span>NIGHTS VR<span class="title-period">.</span></span>';
  $('vr-intro').textContent = paused ? 'Your next checkpoint can wait. Resume here, or enter VR.' : ended ? 'Time is up. Take the driver seat again.' : "Take the driver's seat. The midnight expressway surrounds you.";
  if (ended) $('vr-result').textContent = `${Math.floor(game.score).toString().padStart(6, '0')} POINTS · ${(game.distance / 1000).toFixed(2)} KM · ${game.passed} CARS PASSED`;
  if ((paused || ended) && !options.immersive) $('vr-drive').focus({ preventScroll: true });
  if (scene) scene.panels.lastUpdate = -Infinity;
}

function resize() {
  if (!scene) return;
  const bounds = $('vr-viewport').getBoundingClientRect();
  scene.resize(bounds.width, bounds.height);
}

async function enterVR() {
  if (!vr || contextLost) return;
  updateSetup();
  pauseDrive();
  saveSetup();
  if (options.sound) void setSound(true);
  await vr.enter();
}

$('vr-enter').addEventListener('click', enterVR);
$('vr-drive').addEventListener('click', startDrive);
$('vr-new-run').addEventListener('click', () => action('new'));
$('vr-pause').addEventListener('click', togglePause);
$('vr-recenter').addEventListener('click', recenter);
$('vr-sound').addEventListener('click', () => { void setSound(!audio.enabled); });
$('vr-exit').addEventListener('click', () => { void vr?.exit(); });
$('vr-comfort').addEventListener('change', (event) => setComfort(event.target.checked));
$('vr-steering').addEventListener('change', (event) => setSteering(event.target.value));

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
  if (keyMap[event.code] && ['playing', 'countdown'].includes(game.state)) {
    event.preventDefault(); keys.add(event.code); return;
  }
  if (event.repeat) return;
  if (['KeyP', 'Escape'].includes(event.code)) { event.preventDefault(); togglePause(); }
  if (event.code === 'KeyR') { event.preventDefault(); recenter(); }
  if (event.code === 'KeyM') { event.preventDefault(); void setSound(!audio.enabled); }
  if (event.code === 'Enter' && (event.target === document.body || event.target === $('vr-canvas'))) {
    event.preventDefault(); startDrive();
  }
});
document.addEventListener('keyup', (event) => keys.delete(event.code));
document.querySelectorAll('[data-control]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    touch.add(button.dataset.control);
    button.classList.add('is-pressed');
  });
  const release = () => { touch.delete(button.dataset.control); button.classList.remove('is-pressed'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => button.addEventListener(type, release));
  button.addEventListener('contextmenu', (event) => event.preventDefault());
});
let drag;
$('vr-canvas').addEventListener('pointerdown', (event) => {
  if (!scene || options.immersive) return;
  $('vr-canvas').setPointerCapture(event.pointerId);
  drag = { x: event.clientX, y: event.clientY };
});
$('vr-canvas').addEventListener('pointermove', (event) => {
  if (!drag || !scene || options.immersive) return;
  scene.previewYaw = Math.max(-1.3, Math.min(1.3, scene.previewYaw - (event.clientX - drag.x) * .004));
  scene.previewPitch = Math.max(-.6, Math.min(.6, scene.previewPitch - (event.clientY - drag.y) * .004));
  drag = { x: event.clientX, y: event.clientY };
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => $('vr-canvas').addEventListener(type, () => { drag = null; }));

function loseFocus() {
  lastTimestamp = null;
  input.reset();
  pauseDrive();
  audio.silence();
}
window.addEventListener('blur', () => { if (!vr?.session && !vr?.pending) loseFocus(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !vr?.session && !vr?.pending) loseFocus();
  if (!document.hidden) lastTimestamp = null;
});

function xrInput(frame) {
  const session = vr.session;
  if (!session || !frame) return { sources: [], poses: {}, tracked: true };
  const reference = scene.renderer.xr.getReferenceSpace();
  if (!reference) return { sources: [], poses: {}, tracked: false };
  const pose = frame.getViewerPose(reference);
  if (!pose) return { sources: [], poses: {}, tracked: false };
  if (needsRecenter && baseSpace) {
    const raw = frame.getViewerPose(baseSpace);
    if (raw) {
      const offset = seatOffset(raw.transform.position, raw.transform.orientation);
      scene.renderer.xr.setReferenceSpace(baseSpace.getOffsetReferenceSpace(new XRRigidTransform(offset.position, offset.orientation)));
      needsRecenter = false;
    }
  }
  const poses = {};
  const sources = Array.from(session.inputSources).filter((source) => {
    if (!source.gripSpace) return true;
    const grip = frame.getPose(source.gripSpace, reference);
    if (grip) poses[source.handedness] = grip.transform.position;
    return Boolean(grip);
  });
  return { sources, poses, tracked: true };
}

function frame(timestamp, xrFrame) {
  if (disposed || contextLost) return;
  const dt = lastTimestamp === null ? 0 : Math.max(0, Math.min((timestamp - lastTimestamp) / 1000, .05));
  lastTimestamp = timestamp;
  const immersiveVisible = vr?.session && vr.session.visibilityState === 'visible';
  if (document.hidden && !immersiveVisible) { lastTimestamp = null; return; }
  const tracking = xrInput(xrFrame);
  if (vr?.session && (!tracking.tracked || !immersiveVisible)) {
    if (game.state !== 'paused') loseFocus();
    input.reset();
  } else {
    const controls = input.sample(tracking.sources, { mode: options.steering, poses: tracking.poses, gamepads: navigator.getGamepads?.() || [] });
    if (controls.actions.pause) togglePause();
    if (controls.actions.recenter) recenter();
    if (controls.actions.comfort) setComfort(!options.comfort);
    if (controls.actions.confirm && ['title', 'paused', 'gameover'].includes(game.state)) scene.selectGaze();
    if (['playing', 'countdown'].includes(game.state)) {
      for (const control of ['left', 'right', 'gas', 'brake', 'nitro']) {
        const keyboard = [...keys].some((key) => keyMap[key] === control) || touch.has(control);
        game.input[control] = ['left', 'right'].includes(control) ? Math.max(Number(keyboard), Number(controls[control])) : keyboard || controls[control];
      }
    }
    game.update(dt);
  }
  syncState();
  scene.update(game, options, timestamp / 1000);
  audio.update(game);
  audio.updateSpatial(game, scene.head, scene.forward, scene.up, scene.rig.position.x);
  if (timestamp - lastUiTime > 100) {
    $('vr-speed').textContent = Math.round(game.speed).toString().padStart(3, '0');
    $('vr-time').textContent = String(Math.ceil(game.time));
    $('vr-distance').textContent = Math.max(0, (game.nextCheckpoint - game.distance) / 1000).toFixed(1);
    $('vr-nitro').textContent = String(Math.round(game.nitro));
    $('vr-scene-label').firstChild.textContent = `${DISTRICTS[game.stage % 4]} `;
    lastUiTime = timestamp;
  }
}

async function initialize() {
  try {
    const { VRScene } = await import('./vr-scene.js');
    if (disposed) return;
    scene = new VRScene($('vr-canvas'), { onAction: action });
    vr = new VRSession({
      renderer: scene.renderer,
      onStatus({ state, message }) {
        document.body.dataset.xr = state;
        $('vr-support').textContent = message;
        $('vr-enter').textContent = state === 'requesting' ? 'OPEN HEADSET' : state === 'active' ? 'IN VR' : 'ENTER VR';
        $('vr-enter').disabled = !vr.supported || ['requesting', 'active'].includes(state) || contextLost;
        $('vr-exit').hidden = !vr.session;
      },
      onStart(session) {
        options.immersive = true;
        baseSpace = scene.renderer.xr.getReferenceSpace();
        baseSpace?.addEventListener('reset', recenter);
        needsRecenter = true;
        lastTimestamp = null;
        input.reset();
        clearControls();
        $('vr-touch').hidden = true;
        audio.restore();
        if (session.visibilityState !== 'visible') loseFocus();
      },
      onEnd() {
        options.immersive = false;
        baseSpace?.removeEventListener('reset', recenter);
        baseSpace = null;
        needsRecenter = false;
        input.reset();
        pauseDrive();
        scene.resetView();
        lastTimestamp = null;
        audio.silence();
        resize();
        $('vr-enter').focus({ preventScroll: true });
      },
      onVisibility(visibility) {
        if (visibility !== 'visible') loseFocus();
        else lastTimestamp = null;
      },
    });
    const observer = new ResizeObserver(resize);
    observer.observe($('vr-viewport'));
    resize();
    syncState();
    $('vr-drive').disabled = false;
    scene.renderer.setAnimationLoop(frame);
    void document.fonts.ready.then(() => { if (scene) scene.panels.lastUpdate = -Infinity; });
    void vr.check();
    $('vr-canvas').addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      contextLost = true;
      loseFocus();
      void vr.exit();
      $('vr-drive').disabled = $('vr-enter').disabled = true;
      document.body.dataset.xr = 'error';
      $('vr-support').textContent = 'The graphics context is lost. Reload this page to restore the cockpit.';
    });
    window.addEventListener('pagehide', () => {
      disposed = true;
      observer.disconnect();
      vr.dispose();
      audio.dispose();
      scene.dispose();
    }, { once: true });
  } catch {
    document.body.dataset.xr = 'error';
    $('vr-support').textContent = 'The 3D cockpit cannot load. Enable WebGL2 and reload this page, or return to the arcade.';
    $('vr-enter').textContent = 'VR UNAVAILABLE';
    $('vr-drive').disabled = $('vr-enter').disabled = true;
  }
}
void initialize();
