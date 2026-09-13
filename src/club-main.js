import { ClubGame } from './club-engine.mjs';
import { ClubInput } from './club-controls.mjs';
import { CLUB, CLUB_CREW, STATIONS } from './club-data.mjs';
import { VRSession } from './vr-session.mjs';
import { seatOffset } from './vr-world.mjs';
import { ClubAudio } from './club-audio.js';
import { ClubJukebox } from './club-jukebox.mjs';
import { ClubCinema } from './club-cinema.js';
import { SongPlayer, updateSongButton, updateSongStatus } from './song-player.js';
import { drawMap, drawCabinet } from './club-screens.js';

const $ = (id) => document.getElementById(id);
const storage = {
  get(key, fallback) { try { return localStorage.getItem(`tokyo-nights.${key}`) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(`tokyo-nights.${key}`, String(value)); } catch { /* Storage is optional. */ } },
};
let savedBest = {};
try { savedBest = JSON.parse(storage.get('club.best', '{}')); } catch { /* Invalid saved scores use the default values. */ }
const audio = new ClubAudio(); const input = new ClubInput();
const keys = new Set(); const touch = new Set();
let scene; let vr; let jukebox; let baseSpace; let needsCenter = false; let lastFrame = null; let lastUI = 0; let disposed = false; let contextLost = false;
let soundPreferred = storage.get('sound', 'false') === 'true';
let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let feedbackTimer; let lastState = '';
let videoOpening = false;
const announce = (text) => { $('club-announcer').textContent = text; };
const feedback = (text) => {
  $('club-feedback').textContent = text; $('club-feedback').hidden = false; announce(text);
  scene?.setNotice(text);
  clearTimeout(feedbackTimer); feedbackTimer = setTimeout(() => { $('club-feedback').hidden = true; }, 4500);
};

const game = new ClubGame({
  best: savedBest,
  onChange: () => syncUI(),
  onEvent(event) {
    if (event.type === 'teleport') scene?.teleport(event.position, event.position.yaw);
    if (event.type === 'score') storage.set('club.best', JSON.stringify(event.best));
    if (event.type === 'interact' || event.type === 'speech') {
      announce(`${event.target.name}. ${event.text}`);
      audio.tone(event.target, event.target.topics ? 440 : 880, .06);
    }
    if (event.type === 'beep') audio.tone(event.target);
    if (event.type === 'modem') audio.modem(event.target);
  },
});
const song = new SongPlayer({
  onChange(state) {
    updateSongButton($('club-song'), state); updateSongStatus($('club-song-status'), state); audio.musicEnabled = !state.playing && !jukebox?.active;
    game.songPlaying = state.playing; game.songPending = state.pending; game.changed();
    if (state.pending) scene?.setNotice('The song loads. Select the song control again to cancel.');
  },
  onError: feedback,
});
jukebox = new ClubJukebox({
  onPlay: () => song.pause(),
  onChange(state) { audio.musicEnabled = !song.playing && !state.active; game.changed(); },
});
game.jukebox = jukebox;

function toggleSong() { jukebox.pause(); song.toggle(); }

const cinema = new ClubCinema($('club-video'), {
  onClose() {
    if (disposed) return;
    clearControls({ resetInput: true }); lastFrame = null;
    if (game.state === 'paused') game.resume();
    if (game.state !== 'explore' && game.state !== 'entry') game.back();
    if (document.hidden) game.pause(); else audio.restore();
  },
});

async function openCinema() {
  if (videoOpening || cinema.open || vr?.pending) return;
  videoOpening = true;
  try {
    stopSpeech(); song.pause(); jukebox.pause(); audio.silence(); clearControls({ resetInput: true }); game.pause();
    if (vr?.session) await vr.exit();
    if (vr?.session) { feedback('Exit VR through the headset menu, then select Watch Omacon 2026 again.'); return; }
    if (disposed || contextLost) return;
    cinema.show(); announce('The club cinema opens in the browser. Use the YouTube controls to play.');
  } finally { videoOpening = false; }
}

async function setSound(enabled) {
  soundPreferred = await audio.setEnabled(enabled); storage.set('sound', soundPreferred);
  $('club-sound').textContent = soundPreferred ? 'SOUND ON' : 'SOUND OFF';
  $('club-sound').setAttribute('aria-pressed', String(soundPreferred));
  $('club-sound').setAttribute('aria-label', soundPreferred ? 'Turn sound off' : 'Turn sound on');
  if (!audio.available) { $('club-sound').disabled = true; feedback('Audio is unavailable in this browser.'); }
}

function clearControls({ resetInput = false } = {}) {
  keys.clear(); touch.clear();
  if (resetInput) input.reset(true);
  document.querySelectorAll('[data-move]').forEach((button) => button.classList.remove('is-pressed'));
}

function readAloud() {
  const model = game.panel();
  if (!model || !('speechSynthesis' in window)) { feedback('Read aloud is unavailable in this browser.'); return; }
  speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(model.text); speech.lang = 'en-US'; speech.rate = .95; speech.volume = .8;
  speech.onerror = (event) => { if (!['canceled', 'interrupted'].includes(event.error)) feedback('The system voice cannot start. The dialogue remains visible.'); };
  speechSynthesis.speak(speech);
}

function stopSpeech() { window.speechSynthesis?.cancel(); }

function togglePause() {
  stopSpeech();
  if (game.state === 'paused') { game.resume(); audio.restore(); }
  else game.pause();
}

async function openRace() {
  stopSpeech(); song.pause(); jukebox.pause();
  if (vr?.session) await vr.exit();
  if (vr?.session) return;
  location.href = 'vr.html';
}

function centerView() {
  if (!scene) return;
  if (vr?.session) needsCenter = true;
  else { scene.lookYaw = 0; scene.pitch = 0; scene.resetCamera(); }
  scene.panelIdentity = ''; announce('The view is centered.');
}

function act(id) {
  if (!scene || contextLost) return;
  if (id === 'song') { toggleSong(); return; }
  if (id === 'video') { void openCinema(); return; }
  if (id.startsWith('jukebox:') && game.state === 'device' && game.selected?.software === 'jukebox') { jukebox.action(id); return; }
  if (id === 'read') { readAloud(); return; }
  if (id === 'center') { centerView(); return; }
  if (id === 'exit') { void vr?.exit(); return; }
  if (id === 'race') { void openRace(); return; }
  stopSpeech();
  game.action(id);
  if (id === 'explore') {
    lastFrame = null;
    if (soundPreferred) void setSound(true);
    audio.restore();
  }
}

function useTarget(id) {
  if (!scene) return;
  scene.headPose();
  if (!game.interact(id, scene.head)) feedback('Move closer to the character or machine. Use the open aisles to approach it.');
}

function teleport(point) {
  if (game.state !== 'explore' || !scene?.teleport(point)) return;
  game.position.x = point.x; game.position.z = point.z; announce(`Enter ${game.zone.name}.`);
}

function syncUI() {
  const changed = lastState !== game.state;
  if (changed) { clearControls(); lastState = game.state; }
  document.body.dataset.state = game.state;
  $('club-entry').hidden = game.state !== 'entry';
  const panel = game.panel();
  $('club-panel').hidden = !panel || game.state === 'entry';
  $('club-pause').disabled = game.state === 'entry';
  $('club-pause').textContent = game.state === 'paused' ? 'RESUME' : 'PAUSE';
  $('club-touch').hidden = !['explore', 'arcade', 'sketch'].includes(game.state) || Boolean(vr?.session);
  $('club-touch-use').textContent = game.state === 'arcade' ? 'FIRE' : 'USE';
  $('club-map-canvas').hidden = game.state !== 'map';
  $('club-game-canvas').hidden = game.state !== 'arcade';
  $('club-game-stats').hidden = game.state !== 'arcade';
  if (panel && game.state !== 'entry') {
    $('club-panel-title').textContent = panel.title;
    $('club-panel-subtitle').textContent = panel.subtitle || '';
    $('club-panel-text').textContent = panel.text;
    $('club-portrait').hidden = !panel.portrait;
    if (panel.portrait && scene) {
      const ctx = $('club-portrait').getContext('2d'); ctx.clearRect(0, 0, 48, 104); ctx.imageSmoothingEnabled = false;
      ctx.drawImage(scene.art.renderer.getFullCharacter(panel.portrait), 0, 0);
    }
    const focused = document.activeElement?.dataset?.action;
    $('club-panel-actions').dataset.layout = panel.layout || '';
    $('club-panel-actions').dataset.columns = String(panel.footerColumns || 2);
    $('club-panel-actions').replaceChildren();
    for (const [index, option] of panel.options.entries()) {
      const button = document.createElement('button'); button.textContent = option.label; button.dataset.action = option.id;
      button.dataset.primary = String(option.primary ?? index === 0);
      button.dataset.group = option.detail ? 'track' : 'control';
      button.dataset.controlStart = String(panel.layout === 'jukebox' && index === panel.rows);
      button.disabled = Boolean(option.disabled);
      if (option.detail) { const detail = document.createElement('small'); detail.textContent = option.detail; button.append(detail); }
      button.addEventListener('click', () => act(option.id));
      if (option.id === 'read' && !('speechSynthesis' in window)) button.disabled = true;
      $('club-panel-actions').append(button);
      if (focused === option.id && !changed && !vr?.session) button.focus({ preventScroll: true });
    }
    if (game.state === 'map') drawMap($('club-map-canvas').getContext('2d'), 0, 0, 600, 250, game.position);
    if (changed && !vr?.session) $('club-panel-actions').querySelector('button')?.focus({ preventScroll: true });
  } else if (changed && game.state === 'explore' && !vr?.session) $('club-canvas').focus({ preventScroll: true });
}

function use() {
  if (game.state === 'entry') act('explore');
  else if (game.state === 'arcade') { if (game.arcade.state !== 'playing') act('start-game'); }
  else scene?.interactNearest();
}

function blur() {
  lastFrame = null; clearControls({ resetInput: true }); game.pause(); audio.silence(); song.pause(); jukebox.pause(); stopSpeech();
  if (scene) scene.teleportController = null;
}
window.addEventListener('blur', () => { if (!vr?.session && !vr?.pending && !cinema.open && !videoOpening) blur(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cinema.pause();
  if (document.hidden && !vr?.session && !vr?.pending) blur(); else lastFrame = null;
});

document.addEventListener('keydown', (event) => {
  if (cinema.open || videoOpening) return;
  if (event.metaKey || event.ctrlKey || event.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code) && ['explore', 'arcade'].includes(game.state)) {
    event.preventDefault(); keys.add(event.code);
    if (event.code === 'Space' && !event.repeat && game.state === 'arcade' && game.arcade.state !== 'playing') act('start-game');
    return;
  }
  if (event.repeat) return;
  if (event.code === 'KeyE') { event.preventDefault(); use(); }
  if (event.code === 'Tab' && game.state === 'explore') { event.preventDefault(); act('map'); }
  if (event.code === 'Escape') { event.preventDefault(); act('back'); }
  if (event.code === 'KeyP') { event.preventDefault(); togglePause(); }
  if (event.code === 'KeyR') { event.preventDefault(); centerView(); }
});
document.addEventListener('keyup', (event) => keys.delete(event.code));

document.querySelectorAll('[data-move]').forEach((button) => {
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); touch.add(button.dataset.move); button.classList.add('is-pressed'); });
  const release = () => { touch.delete(button.dataset.move); button.classList.remove('is-pressed'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => button.addEventListener(type, release));
});
$('club-touch-use').addEventListener('pointerdown', (event) => {
  if (game.state !== 'arcade') return;
  event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); touch.add('fire'); use();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => $('club-touch-use').addEventListener(type, () => touch.delete('fire')));
$('club-touch-use').addEventListener('click', () => { if (game.state !== 'arcade') use(); });
$('club-touch-map').addEventListener('click', () => act('map'));

let drag;
$('club-canvas').addEventListener('pointerdown', (event) => {
  if (!scene || vr?.session) return;
  event.currentTarget.setPointerCapture(event.pointerId);
  drag = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
});
$('club-canvas').addEventListener('pointermove', (event) => {
  if (!drag || !scene || vr?.session) return;
  if (game.state !== 'sketch') { scene.lookYaw -= (event.clientX - drag.x) * .004; scene.pitch = Math.max(-1.3, Math.min(1.3, scene.pitch - (event.clientY - drag.y) * .004)); }
  drag.x = event.clientX; drag.y = event.clientY;
});
$('club-canvas').addEventListener('pointerup', (event) => {
  if (drag && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5 && game.state !== 'entry') {
    const bounds = $('club-canvas').getBoundingClientRect(); scene.selectAt({ x: (event.clientX - bounds.left) / bounds.width * 2 - 1, y: -(event.clientY - bounds.top) / bounds.height * 2 + 1 });
  }
  drag = null;
});
['pointercancel', 'lostpointercapture'].forEach((type) => $('club-canvas').addEventListener(type, () => { drag = null; }));

function xrState(frame) {
  if (!vr.session || !frame) return { sources: [], tracked: true };
  const reference = scene.renderer.xr.getReferenceSpace();
  if (!reference || !frame.getViewerPose(reference)) return { sources: [], tracked: false };
  if (needsCenter && baseSpace) {
    const raw = frame.getViewerPose(baseSpace);
    if (raw) {
      const offset = seatOffset(raw.transform.position, raw.transform.orientation, CLUB.eyeHeight);
      scene.rig.position.x = scene.head.x; scene.rig.position.z = scene.head.z;
      scene.rig.rotation.y = Math.atan2(-scene.forward.x, -scene.forward.z);
      scene.renderer.xr.setReferenceSpace(baseSpace.getOffsetReferenceSpace(new XRRigidTransform(offset.position, offset.orientation)));
      scene.lookYaw = 0; scene.pitch = 0; scene.panelIdentity = ''; needsCenter = false;
    }
  }
  scene.trackPose(frame.getViewerPose(scene.renderer.xr.getReferenceSpace()));
  return { sources: Array.from(vr.session.inputSources).filter((source) => !source.gripSpace || frame.getPose(source.gripSpace, reference)), tracked: true };
}

function animate(timestamp, xrFrame) {
  if (disposed || contextLost) return;
  const dt = lastFrame === null ? 0 : Math.max(0, Math.min(.25, (timestamp - lastFrame) / 1000)); lastFrame = timestamp;
  const visible = vr?.session?.visibilityState === 'visible';
  if (document.hidden && !visible) { lastFrame = null; return; }
  const tracking = xrState(xrFrame);
  if (vr.session && (!visible || !tracking.tracked)) {
    if (game.state !== 'paused') blur();
  } else {
    const control = input.sample(tracking.sources, navigator.getGamepads?.() || []);
    const x = Math.max(-1, Math.min(1, control.x + Number(keys.has('KeyD') || keys.has('ArrowRight') || touch.has('right')) - Number(keys.has('KeyA') || keys.has('ArrowLeft') || touch.has('left'))));
    const z = Math.max(-1, Math.min(1, control.z + Number(keys.has('KeyS') || keys.has('ArrowDown') || touch.has('back')) - Number(keys.has('KeyW') || keys.has('ArrowUp') || touch.has('forward'))));
    if (control.actions.back) act('back');
    if (control.actions.map) act('map');
    if (control.actions.center) centerView();
    if (control.actions.interact) use();
    if (game.state === 'explore') {
      if (control.actions.leftTurn) scene.snapTurn(Math.PI / 6);
      if (control.actions.rightTurn) scene.snapTurn(-Math.PI / 6);
      if (!scene.teleportController) scene.move(x, z, dt);
    }
    scene.gamepadTeleport(control.padTeleport);
    scene.headPose(); game.position.x = scene.head.x; game.position.z = scene.head.z;
    game.update(dt, { x, z, fire: control.fire || keys.has('Space') || touch.has('fire'), reducedMotion });
  }
  scene.update(game, { immersive: Boolean(vr.session), reducedMotion }, dt);
  audio.updateRoom(game, scene.head, scene.forward, scene.up);
  if (timestamp - lastUI > 100) {
    $('club-location').textContent = game.zone.name;
    $('club-hint').hidden = !scene.hint || game.state !== 'explore'; $('club-hint').textContent = `${scene.hint} · E`;
    if (game.arcade && game.state === 'arcade') {
      drawCabinet($('club-game-canvas').getContext('2d'), game.arcade, 512, 384);
      $('club-game-score').textContent = String(game.arcade.score); $('club-game-best').textContent = String(game.best[game.arcade.kind]);
    }
    lastUI = timestamp;
  }
}

function resize() { const bounds = $('club-canvas').getBoundingClientRect(); scene?.resize(bounds.width, bounds.height); }
function chrome() { document.body.style.setProperty('--club-chrome', `${document.querySelector('.club-header').offsetHeight + document.querySelector('.club-footer').offsetHeight}px`); }

async function enterVR() {
  if (!vr || contextLost) return;
  if (vr.session) { await vr.exit(); return; }
  game.pause(); clearControls({ resetInput: true }); stopSpeech();
  if (soundPreferred) void setSound(true);
  await vr.enter();
}
$('club-explore').addEventListener('click', () => act('explore'));
$('club-enter-vr').addEventListener('click', enterVR);
$('club-vr').addEventListener('click', enterVR);
$('club-map').addEventListener('click', () => act('map'));
$('club-pause').addEventListener('click', togglePause);
$('club-song').addEventListener('click', toggleSong);
$('club-sound').addEventListener('click', () => { void setSound(!audio.enabled); });
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => { reducedMotion = event.matches; });

async function initialize() {
  try {
    const { ClubScene } = await import('./club-scene.js');
    if (disposed) return;
    scene = new ClubScene($('club-canvas'), { onAction: act, onTarget: useTarget, onTeleport: teleport });
    vr = new VRSession({
      renderer: scene.renderer, framebufferScale: .7,
      labels: { screen: 'explore on screen', ready: 'Your headset supports WebXR. Enter VR, then select Enter the room.', active: 'The computer club is active in your headset.' },
      onStatus({ state, message }) {
        document.body.dataset.xr = state; $('club-support').textContent = message;
        $('club-enter-vr').textContent = state === 'requesting' ? 'OPEN HEADSET' : 'ENTER VR';
        $('club-vr').textContent = vr.session ? 'EXIT VR' : 'ENTER VR';
        $('club-enter-vr').disabled = !vr.supported || ['requesting', 'active'].includes(state) || contextLost;
        $('club-vr').disabled = !vr.supported || state === 'requesting' || contextLost;
      },
      onStart() {
        baseSpace = scene.renderer.xr.getReferenceSpace(); baseSpace?.addEventListener('reset', centerView);
        needsCenter = true; lastFrame = null; clearControls({ resetInput: true }); scene.panelIdentity = ''; $('club-touch').hidden = true; audio.restore();
      },
      onEnd() {
        baseSpace?.removeEventListener('reset', centerView); baseSpace = null; needsCenter = false; lastFrame = null;
        game.pause(); clearControls({ resetInput: true }); stopSpeech(); audio.silence(); scene.teleportController = null;
        queueMicrotask(() => { if (!disposed) { scene.resetCamera(); resize(); syncUI(); } });
      },
      onVisibility(state) { if (state !== 'visible') blur(); else lastFrame = null; },
    });
    const observer = new ResizeObserver(resize); observer.observe($('club-main'));
    const chromeObserver = new ResizeObserver(chrome); chromeObserver.observe(document.querySelector('.club-header')); chromeObserver.observe(document.querySelector('.club-footer'));
    chrome(); resize(); syncUI(); $('club-explore').disabled = false;
    scene.renderer.setAnimationLoop(animate); void vr.check();
    void document.fonts.ready.then(() => { if (scene) scene.lastPanel = ''; });
    $('club-canvas').addEventListener('webglcontextlost', (event) => {
      event.preventDefault(); contextLost = true; blur(); void vr.exit();
      $('club-explore').disabled = $('club-enter-vr').disabled = $('club-vr').disabled = true;
      feedback('The graphics context is lost. Reload the page to restore the room.');
    });
    window.addEventListener('pagehide', () => {
      disposed = true; clearTimeout(feedbackTimer); observer.disconnect(); chromeObserver.disconnect(); stopSpeech(); song.dispose(); jukebox.dispose(); cinema.dispose(); audio.dispose(); vr.dispose(); scene.dispose();
    }, { once: true });
  } catch {
    document.body.dataset.xr = 'error'; $('club-support').textContent = 'The room cannot load. Enable WebGL2 and reload the page.';
    $('club-vr').disabled = $('club-explore').disabled = $('club-enter-vr').disabled = true;
  }
}
void initialize();
