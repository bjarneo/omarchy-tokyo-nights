import { GameEngine, DISTRICTS, CHECKPOINT_LENGTH } from './engine.mjs';
import { Renderer } from './renderer.js';
import { ArcadeAudio } from './audio.js';
import { SongPlayer, updateSongButton, updateSongStatus } from './song-player.js';
import { CHARACTERS, getCharacter } from './characters.mjs';
import { CARS, PAINTS, getCar, getPaint } from './cars.mjs';
import { CHAPTERS, getChapter } from './story.mjs';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const screen = $('screen');
const app = document.querySelector('.app');
const audio = new ArcadeAudio();
const song = new SongPlayer({
  onChange(state) {
    updateSongButton($('song-button'), state);
    updateSongStatus($('song-status'), state);
    audio.musicEnabled = !state.playing;
  },
  onError: (message) => announce(message),
});
$('song-button').addEventListener('click', () => song.toggle());
window.addEventListener('pagehide', () => song.pause());
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const renderer = new Renderer(canvas, { reducedMotion: motionPreference.matches });
renderer.drawLineup($('title-lineup'));
void renderer.logoReady.then((logo) => {
  const target = $('start-logo');
  if (logo) {
    target.width = logo.width;
    target.height = logo.height;
    target.getContext('2d').drawImage(logo, 0, 0);
  } else {
    const ctx = target.getContext('2d');
    ctx.fillStyle = '#c0caf5';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OMARCHY', target.width / 2, 55);
  }
});
const scoreText = (value) => Math.floor(value).toString().padStart(6, '0');
const storage = {
  get(key, fallback) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, String(value)); } catch { /* The game also works without browser storage. */ } },
};
const savedBest = Number(storage.get('tokyo-nights.best', '0'));
let best = Number.isFinite(savedBest) && savedBest >= 0 ? Math.floor(savedBest) : 0;
let soundPreferred = storage.get('tokyo-nights.sound', 'false') === 'true';
let lastState = '';
let lastToast = '';
let lastUiTime = 0;
let lastTimestamp = 0;
let warnedAboutTime = false;
let lastPitBayAnnounced = null;
const heldKeys = new Set();
let selectedCharacter = getCharacter(storage.get('tokyo-nights.character', 'dhh')).id;
let selectedCar = getCar(storage.get('tokyo-nights.car', 'countach')).id;
let selectedPaint = getPaint(storage.get('tokyo-nights.paint', 'amber')).id;
let activeSetupTab = 'driver';
$('header-best').textContent = scoreText(best);

function announce(message) {
  $('announcer').textContent = message;
}

const game = new GameEngine({
  characterId: selectedCharacter,
  carId: selectedCar,
  paintId: selectedPaint,
  onEvent(event) {
    audio.event(event);
    if (event.type === 'start') {
      warnedAboutTime = false;
      lastPitBayAnnounced = null;
      announce(`${getCharacter(event.characterId).name} is ready. Use the arrow keys or WASD to drive. Hold Space for nitro.`);
    }
    if (event.type === 'pause') announce('The game is paused.');
    if (event.type === 'resume') announce('The drive resumes.');
    if (event.type === 'select-driver') announce('Choose a driver. Use the arrow keys to select, then press Enter to drive.');
    if (event.type === 'cameo') announce(`${getCharacter(event.characterId).name} leans out of the window, turns, and smiles.`);
    if (event.type === 'briefing') {
      const chapter = getChapter(event.chapter);
      $('story-heading').textContent = chapter.title;
      $('story-meta').textContent = `CHAPTER ${event.chapter + 1} OF ${CHAPTERS.length} · ${chapter.district} · ${chapter.time}`;
      $('story-text').textContent = chapter.text;
      $('story-objective').textContent = chapter.objective;
      announce(`${chapter.title}. ${chapter.objective}`);
    }
    if (event.type === 'pickup') announce(event.kind === 'tape' ? 'Music tape collected. Reach the exit.' : `Power cell collected. You have ${game.powerCells} of two.`);
    if (event.type === 'ending') announce('You reach the Omarchy arcade. The lights return and the last track plays.');
    if (event.type === 'nitro-pickup') announce('Nitro pickup collected. The tank gains 45 charge.');
    if (event.type === 'pit-enter') announce('Pit stop. The race clock pauses while you talk with the crew.');
    if (event.type === 'pit-line') updatePitDialogue();
    if (event.type === 'pit-resume') announce('The conversation ends. You return to the same road with a full nitro tank.');
    if (event.type === 'checkpoint') {
      warnedAboutTime = false;
      announce(`Checkpoint. You gain 35 seconds. Enter ${DISTRICTS[event.stage % DISTRICTS.length]}.`);
    }
    if (event.type === 'gameover' || event.type === 'complete') {
      const completed = event.type === 'complete';
      const isBest = event.score > best;
      if (isBest) {
        best = event.score;
        storage.set('tokyo-nights.best', best);
        $('header-best').textContent = scoreText(best);
      }
      $('final-score').textContent = scoreText(event.score);
      $('final-distance').textContent = (game.distance / 1000).toFixed(2);
      $('final-passed').textContent = String(game.passed);
      $('final-stage').textContent = `${game.chaptersComplete}/${CHAPTERS.length}`;
      $('result-heading').textContent = completed ? 'DELIVERY COMPLETE.' : 'END OF THE ROAD.';
      $('result-reason').textContent = completed ? 'The crew plays the tape. The arcade lights stay on.' : event.reason;
      $('retry-button').textContent = completed ? 'PLAY AGAIN' : 'ONE MORE RUN';
      $('new-best').hidden = !isBest;
      announce(`The run ends. Your score is ${event.score}. You drive ${(game.distance / 1000).toFixed(2)} kilometers.`);
    }
  },
});

async function applySound(enabled) {
  const active = await audio.setEnabled(enabled);
  $('sound-button').setAttribute('aria-pressed', String(active));
  $('sound-button').setAttribute('aria-label', active ? 'Turn sound off' : 'Turn sound on');
  $('sound-label').textContent = active ? 'SOUND ON' : 'SOUND OFF';
  $('sound-icon').innerHTML = active
    ? '<path d="M3 8h3l4-4v12l-4-4H3zM13 7c2 1 2 5 0 6m3-9c4 3 4 9 0 12"/>'
    : '<path d="M3 8h3l4-4v12l-4-4H3zM14 7l4 6m0-6-4 6"/>';
  if (!audio.available) {
    $('sound-label').textContent = 'NO AUDIO';
    $('sound-button').disabled = true;
    announce('Audio is unavailable in this browser. The game remains playable.');
  }
  soundPreferred = active;
  storage.set('tokyo-nights.sound', active);
}

function updateCharacterSelection(characterId) {
  const character = getCharacter(characterId);
  selectedCharacter = character.id;
  document.querySelectorAll('input[name="driver"]').forEach((input) => {
    input.checked = input.value === character.id;
  });
  $('selected-driver-name').textContent = character.name.toUpperCase();
  $('selected-driver-detail').textContent = character.detail;
  $('selected-driver-index').textContent = `${CHARACTERS.indexOf(character) + 1} OF ${CHARACTERS.length}`;
  renderer.drawPortrait($('selected-driver-portrait'), character.id);
  $('confirm-driver-button').textContent = `DRIVE AS ${character.name.toUpperCase()}`;
}

function chooseDriver() {
  updateCharacterSelection(game.characterId);
  updateCarSelection(game.carId, game.paintId);
  setSetupTab('driver');
  game.chooseDriver();
  syncState();
}

function cancelSelection() {
  game.cancelSelection();
  updateCharacterSelection(game.characterId);
  updateCarSelection(game.carId, game.paintId);
  syncState();
}

function start() {
  if (game.state !== 'select') return;
  game.start(selectedCharacter, selectedCar, selectedPaint);
  game.showBriefing();
  storage.set('tokyo-nights.character', game.characterId);
  storage.set('tokyo-nights.car', game.carId);
  storage.set('tokyo-nights.paint', game.paintId);
  updateCarLabels();
  if (soundPreferred) void applySound(true);
  syncState();
  canvas.focus({ preventScroll: true });
}

function updateCarLabels() {
  const car = getCar(game.carId);
  const paint = getPaint(game.paintId);
  $('car-name').textContent = car.name.toUpperCase();
  $('car-spec').textContent = `${paint.name.toUpperCase()} · ${car.label.toUpperCase()}`;
  $('car-swatch').style.backgroundColor = paint.hex;
  const article = /^[aeiou]/i.test(paint.name) ? 'an' : 'a';
  canvas.setAttribute('aria-label', `${getCharacter(game.characterId).name} drives ${article} ${paint.name.toLowerCase()} ${car.name} on the Tokyo expressway. Use arrow keys or WASD to drive. Hold Space for nitro. Press P to pause.`);
}

function updatePitDialogue() {
  if (!game.pitStop) return;
  const line = game.pitStop.lines[game.pitDialogueIndex];
  const speaker = getCharacter(line.speaker === 'driver' ? game.characterId : game.pitStop.companionId);
  $('pit-speaker').textContent = speaker.name.toUpperCase();
  $('pit-topic').textContent = game.pitStop.title;
  $('pit-line').textContent = line.text;
  $('pit-progress').textContent = `${game.pitDialogueIndex + 1} / ${game.pitStop.lines.length}`;
  $('pit-dialogue').dataset.speaker = line.speaker;
  $('pit-next-button').textContent = game.pitDialogueIndex === game.pitStop.lines.length - 1 ? 'BACK TO THE RUN' : 'CONTINUE';
  announce(`${speaker.name}: ${line.text}`);
}

function updateCarSelection(carId, paintId = selectedPaint) {
  const car = getCar(carId);
  const paint = getPaint(paintId);
  selectedCar = car.id;
  selectedPaint = paint.id;
  document.querySelectorAll('input[name="car"]').forEach((input) => { input.checked = input.value === car.id; });
  document.querySelectorAll('input[name="paint"]').forEach((input) => { input.checked = input.value === paint.id; });
  $('selected-car-name').textContent = car.label.toUpperCase();
  $('selected-car-model').textContent = car.name;
  $('selected-car-detail').textContent = car.detail;
  $('selected-paint-label').textContent = `${paint.name.toUpperCase()} · ${paint.hex.toUpperCase()}`;
  renderer.drawCarPreview($('selected-car-preview'), car.id, paint.id);
  CARS.forEach(({ id }) => renderer.drawCarPreview($(`car-preview-${id}`), id, paint.id));
}

function setSetupTab(tab) {
  activeSetupTab = tab;
  ['driver', 'car'].forEach((id) => {
    const active = id === tab;
    $(`${id}-tab`).setAttribute('aria-selected', String(active));
    $(`${id}-tab`).tabIndex = active ? 0 : -1;
    $(`${id}-panel`).hidden = !active;
  });
  $('character-heading').textContent = tab === 'driver' ? 'CHOOSE YOUR DRIVER.' : 'CHOOSE YOUR CAR.';
  $('setup-description').textContent = tab === 'driver'
    ? 'Your driver makes occasional nitro cameos.'
    : 'Nine car models. Nine Tokyo Night colors.';
}

function togglePause() {
  if (game.state === 'paused') game.resume();
  else game.pause();
  syncState();
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector('.app').requestFullscreen();
  } catch {
    $('status-text').textContent = 'FULLSCREEN IS UNAVAILABLE IN THIS BROWSER';
    announce('Fullscreen is unavailable in this browser.');
  }
}

function clearControls() {
  heldKeys.clear();
  game.clearInput();
  document.querySelectorAll('[data-control]').forEach((button) => button.classList.remove('is-pressed'));
}

function syncState() {
  if (lastState === game.state) return;
  lastState = game.state;
  const title = game.state === 'title';
  const selecting = game.state === 'select';
  const story = game.state === 'story';
  const ending = game.state === 'ending';
  const pit = game.state === 'pit';
  const pitEntering = game.state === 'pit-enter';
  const paused = game.state === 'paused';
  const ended = game.state === 'gameover' || game.state === 'complete';
  const driving = game.state === 'playing' || game.state === 'countdown';
  screen.dataset.state = game.state;
  app.dataset.state = game.state;
  $('title-overlay').hidden = !title;
  $('character-overlay').hidden = !selecting;
  $('story-overlay').hidden = !story;
  $('ending-caption').hidden = !ending;
  $('pit-dialogue').hidden = !pit;
  $('pit-transition').hidden = !pitEntering;
  $('attract-details').hidden = !title;
  $('attract-footer').hidden = !title;
  $('hud').hidden = title || ended || selecting || story || ending || pit || pitEntering;
  $('pause-overlay').hidden = !paused;
  $('results-overlay').hidden = !ended;
  $('pause-button').disabled = !driving && !paused;
  $('pause-button').setAttribute('aria-label', paused ? 'Resume game' : 'Pause game');
  $('pause-button').querySelector('span').textContent = paused ? 'RESUME' : 'PAUSE';
  $('pause-button').querySelector('svg').innerHTML = paused
    ? '<path d="m6 3 10 7-10 7z"/>'
    : '<path d="M6 4v12M14 4v12" stroke-width="3"/>';
  $('status-text').textContent = {
    title: 'THE OMARCHY ARCADE WAITS', select: 'PREPARE YOUR RUN', countdown: 'START YOUR ENGINE',
    story: `CHAPTER ${game.stage + 1} OF ${CHAPTERS.length} · ${getChapter(game.stage).district}`,
    playing: `CHAPTER ${game.stage + 1} OF ${CHAPTERS.length} · COMPLETE THE OBJECTIVE AND REACH THE EXIT`,
    paused: 'DRIVE PAUSED', gameover: 'RUN ENDED', ending: 'TOKYO BAY · THE FINAL DELIVERY', complete: 'STORY COMPLETE',
    'pit-enter': 'STOPPING AT THE GARAGE', pit: 'PIT STOP · RACE CLOCK PAUSED',
  }[game.state];
  document.querySelectorAll('[data-control]').forEach((button) => { button.disabled = !driving; });
  clearControls();
  updateUI();
  if (selecting) focusDriver();
  else if (story) $('chapter-start-button').focus({ preventScroll: true });
  else if (ending) $('ending-skip-button').focus({ preventScroll: true });
  else if (pit) $('pit-next-button').focus({ preventScroll: true });
  else if (paused) $('resume-button').focus({ preventScroll: true });
  else if (ended) $('retry-button').focus({ preventScroll: true });
  else if (title) $('start-button').focus({ preventScroll: true });
  else if (game.state === 'playing') canvas.focus({ preventScroll: true });
}

function updateUI() {
  const pitDistance = game.pitStopAt === null ? Infinity : game.pitStopAt - game.distance;
  const pitAvailable = game.state === 'playing' && pitDistance <= 450 && pitDistance >= -18;
  $('pit-bay-indicator').hidden = !pitAvailable;
  if (game.state === 'playing') {
    const side = game.pitStopLane < 0 ? 'LEFT' : 'RIGHT';
    $('pit-bay-indicator').textContent = `PIT BAY: ${side}`;
    $('pit-bay-indicator').dataset.side = side.toLowerCase();
    $('status-text').textContent = pitAvailable
      ? `PIT BAY ${side} · DRIVE INTO THE GREEN MARK`
      : `CHAPTER ${game.stage + 1} OF ${CHAPTERS.length} · COMPLETE THE OBJECTIVE AND REACH THE EXIT`;
    if (pitAvailable && lastPitBayAnnounced !== game.pitStopAt) {
      lastPitBayAnnounced = game.pitStopAt;
      announce(`A pit bay is ahead on the ${side.toLowerCase()}. Steer into the green bay to stop, or drive past.`);
    }
  }
  if (game.state === 'pit-enter') $('pit-transition').style.backgroundColor = `rgba(22, 22, 30, ${motionPreference.matches ? .95 : Math.min(.95, game.pitElapsed / 1.25)})`;
  const mission = game.missionStatus();
  $('mission-status').textContent = mission.label;
  $('mission-status').parentElement.classList.toggle('is-complete', mission.complete);
  const nextDrop = game.pickups.find((pickup) => !pickup.resolved && pickup.z >= game.distance);
  $('mission-route').textContent = getChapter(game.stage).id === 'arrival' ? 'TO THE OMARCHY ARCADE'
    : mission.complete ? 'REACH THE EXIT'
    : nextDrop ? `DROP: ${nextDrop.x < 0 ? 'LEFT' : nextDrop.x > 0 ? 'RIGHT' : 'CENTER'}`
    : getChapter(game.stage).id === 'traffic' ? 'PASS TRAFFIC SAFELY' : 'NO DROPS REMAIN';
  $('score').textContent = scoreText(game.score);
  $('time').textContent = String(Math.ceil(game.time)).padStart(2, '0');
  $('time').parentElement.classList.toggle('is-low', game.time <= 10);
  $('speed').textContent = Math.round(game.speed).toString().padStart(3, '0');
  $('gear').textContent = game.speed < 5 ? 'N' : String(Math.min(5, Math.ceil(game.speed / 75)));
  $('distance').innerHTML = `${Math.max(0, (game.nextCheckpoint - game.distance) / 1000).toFixed(1)} <small>KM</small>`;
  $('stage-name').textContent = `${String(game.stage + 1).padStart(2, '0')} / ${DISTRICTS[game.stage % DISTRICTS.length]}`;
  $('passed').textContent = `${game.passed} ${game.passed === 1 ? 'CAR' : 'CARS'} PASSED`;
  $('nitro-fill').style.transform = `scaleX(${game.nitro / 100})`;
  $('nitro-meter').setAttribute('aria-valuenow', String(Math.round(game.nitro)));
  $('nitro-meter').parentElement.classList.toggle('is-boosting', game.boosting);
  $('nitro-label').textContent = game.boosting ? 'BOOST ACTIVE' : game.boostLocked ? 'RECHARGE' : 'HOLD TO BOOST';
  $('checkpoint-fill').style.width = `${(game.distance % CHECKPOINT_LENGTH) / CHECKPOINT_LENGTH * 100}%`;
  $('countdown').hidden = game.state !== 'countdown';
  if (game.state === 'countdown') $('countdown').textContent = game.countdown > 3 ? 'READY' : String(Math.max(1, Math.ceil(game.countdown)));
  $('race-toast').hidden = !game.toast || game.state !== 'playing';
  if (game.toast && game.toast.text !== lastToast) {
    lastToast = game.toast.text;
    $('race-toast').textContent = game.toast.text;
    $('race-toast').style.color = `var(--${game.toast.tone})`;
  }
  if (game.state === 'playing' && game.time <= 10 && !warnedAboutTime) {
    warnedAboutTime = true;
    announce('Ten seconds remain. Reach the next checkpoint.');
  }
}

$('start-button').addEventListener('click', chooseDriver);
$('retry-button').addEventListener('click', chooseDriver);
$('restart-button').addEventListener('click', chooseDriver);
$('confirm-driver-button').addEventListener('click', start);
$('cancel-driver-button').addEventListener('click', cancelSelection);
$('chapter-start-button').addEventListener('click', () => { game.beginChapter(); syncState(); canvas.focus({ preventScroll: true }); });
$('ending-skip-button').addEventListener('click', () => { game.finishEnding(); syncState(); });
$('pit-next-button').addEventListener('click', () => { game.advancePitDialogue(); syncState(); });
CHARACTERS.forEach((character) => {
  const option = document.createElement('label');
  option.className = 'driver-option';
  const input = document.createElement('input');
  input.className = 'sr-only';
  input.type = 'radio';
  input.name = 'driver';
  input.value = character.id;
  input.setAttribute('aria-label', character.name);
  const card = document.createElement('span');
  card.className = 'driver-card';
  const portrait = document.createElement('canvas');
  portrait.id = `portrait-${character.id}`;
  portrait.width = 48;
  portrait.height = 56;
  portrait.setAttribute('aria-hidden', 'true');
  const name = document.createElement('strong');
  name.textContent = character.name.toUpperCase();
  const marker = document.createElement('span');
  marker.className = 'driver-selection';
  marker.setAttribute('aria-hidden', 'true');
  marker.innerHTML = '<svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  card.append(portrait, name, marker);
  option.append(input, card);
  $('driver-roster').append(option);
  renderer.drawPortrait(portrait, character.id);
  input.addEventListener('change', () => updateCharacterSelection(input.value));
});

function focusDriver() {
  const input = document.querySelector('input[name="driver"]:checked');
  input.focus({ preventScroll: true });
  const roster = $('driver-roster');
  const bounds = roster.getBoundingClientRect();
  const selected = input.closest('.driver-option').getBoundingClientRect();
  if (selected.top < bounds.top + 6) roster.scrollTop -= bounds.top + 6 - selected.top;
  if (selected.bottom > bounds.bottom - 6) roster.scrollTop += selected.bottom - bounds.bottom + 6;
}

document.querySelector('.driver-roster').addEventListener('keydown', (event) => {
  const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[event.code];
  if (offset || event.code === 'Home' || event.code === 'End') {
    event.preventDefault();
    const index = CHARACTERS.findIndex(({ id }) => id === selectedCharacter);
    const next = event.code === 'Home' ? 0 : event.code === 'End' ? CHARACTERS.length - 1 : (index + offset + CHARACTERS.length) % CHARACTERS.length;
    updateCharacterSelection(CHARACTERS[next].id);
    focusDriver();
    return;
  }
  if (event.code === 'Enter' && !event.repeat) {
    event.preventDefault();
    start();
  }
});

CARS.forEach((car) => {
  const option = document.createElement('label');
  option.className = 'driver-option car-option';
  const input = document.createElement('input');
  input.className = 'sr-only';
  input.type = 'radio';
  input.name = 'car';
  input.value = car.id;
  input.setAttribute('aria-label', car.name);
  const card = document.createElement('span');
  card.className = 'driver-card car-card';
  const preview = document.createElement('canvas');
  preview.id = `car-preview-${car.id}`;
  preview.width = 112;
  preview.height = 72;
  preview.setAttribute('aria-hidden', 'true');
  const label = document.createElement('strong');
  label.textContent = car.label.toUpperCase();
  const marker = document.createElement('span');
  marker.className = 'driver-selection';
  marker.setAttribute('aria-hidden', 'true');
  marker.innerHTML = '<svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  card.append(preview, label, marker);
  option.append(input, card);
  $('car-roster').append(option);
  input.addEventListener('change', () => updateCarSelection(car.id));
});

PAINTS.forEach((paint) => {
  const option = document.createElement('label');
  option.className = 'paint-option';
  option.title = `${paint.name} ${paint.hex}`;
  const input = document.createElement('input');
  input.className = 'sr-only';
  input.type = 'radio';
  input.name = 'paint';
  input.value = paint.id;
  input.setAttribute('aria-label', paint.name);
  const chip = document.createElement('span');
  chip.className = 'paint-chip';
  chip.style.backgroundColor = paint.hex;
  chip.style.color = paint.id === 'slate' ? '#c0caf5' : '#16161e';
  chip.setAttribute('aria-hidden', 'true');
  chip.innerHTML = '<svg viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  option.append(input, chip);
  $('paint-roster').append(option);
  input.addEventListener('change', () => updateCarSelection(selectedCar, paint.id));
});

$('driver-tab').addEventListener('click', () => setSetupTab('driver'));
$('car-tab').addEventListener('click', () => setSetupTab('car'));
document.querySelector('.setup-tabs').addEventListener('keydown', (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.code)) return;
  event.preventDefault();
  const next = event.code === 'Home' ? 'driver' : event.code === 'End' ? 'car' : activeSetupTab === 'driver' ? 'car' : 'driver';
  setSetupTab(next);
  $(`${next}-tab`).focus();
});
$('car-roster').addEventListener('keydown', (event) => {
  const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[event.code];
  if (offset || event.code === 'Home' || event.code === 'End') {
    event.preventDefault();
    const current = CARS.findIndex(({ id }) => id === selectedCar);
    const next = event.code === 'Home' ? 0 : event.code === 'End' ? CARS.length - 1 : (current + offset + CARS.length) % CARS.length;
    updateCarSelection(CARS[next].id);
    const input = document.querySelector('input[name="car"]:checked');
    input.focus({ preventScroll: true });
    const roster = $('car-roster');
    const bounds = roster.getBoundingClientRect();
    const selected = input.closest('.car-option').getBoundingClientRect();
    if (selected.top < bounds.top + 6) roster.scrollTop -= bounds.top + 6 - selected.top;
    if (selected.bottom > bounds.bottom - 6) roster.scrollTop += selected.bottom - bounds.bottom + 6;
  } else if (event.code === 'Enter' && !event.repeat) {
    event.preventDefault();
    start();
  }
});
updateCharacterSelection(selectedCharacter);
updateCarSelection(selectedCar, selectedPaint);
updateCarLabels();
$('resume-button').addEventListener('click', togglePause);
$('pause-button').addEventListener('click', togglePause);
$('home-button').addEventListener('click', () => { game.home(); syncState(); });
$('sound-button').addEventListener('click', () => { void applySound(!audio.enabled); });
$('fullscreen-button').addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
  $('fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
});
if (!document.fullscreenEnabled) $('fullscreen-button').hidden = true;

const keyMap = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake',
  Space: 'nitro', ShiftLeft: 'nitro', ShiftRight: 'nitro',
};
document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (game.state === 'select' && event.code === 'Escape' && !event.repeat) {
    event.preventDefault();
    cancelSelection();
    return;
  }
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
  const control = keyMap[event.code];
  if (control && (game.state === 'playing' || game.state === 'countdown')) {
    event.preventDefault();
    heldKeys.add(event.code);
    game.input[control] = true;
    return;
  }
  if (event.repeat) return;
  if (event.code === 'Enter' && ['title', 'gameover', 'complete'].includes(game.state) && (event.target === document.body || event.target === canvas)) {
    event.preventDefault();
    chooseDriver();
  } else if (event.code === 'KeyP' || event.code === 'Escape') {
    if (game.state === 'playing' || game.state === 'countdown' || game.state === 'paused') {
      event.preventDefault();
      togglePause();
    }
  } else if (event.code === 'KeyM') {
    event.preventDefault();
    void applySound(!audio.enabled);
  } else if (event.code === 'KeyF') {
    event.preventDefault();
    void toggleFullscreen();
  }
});

document.addEventListener('keyup', (event) => {
  const control = keyMap[event.code];
  if (!control) return;
  heldKeys.delete(event.code);
  game.input[control] = [...heldKeys].some((key) => keyMap[key] === control);
});

document.querySelectorAll('[data-control]').forEach((button) => {
  const control = button.dataset.control;
  button.addEventListener('pointerdown', (event) => {
    if (button.disabled) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    game.input[control] = true;
    button.classList.add('is-pressed');
  });
  const release = () => {
    game.input[control] = false;
    button.classList.remove('is-pressed');
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('contextmenu', (event) => event.preventDefault());
});

function loseFocus() {
  heldKeys.clear();
  clearControls();
  game.pause();
  syncState();
  audio.silence();
  song.pause();
}
window.addEventListener('blur', loseFocus);
window.addEventListener('focus', () => audio.restore());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) loseFocus();
  else { lastTimestamp = 0; audio.restore(); }
});

motionPreference.addEventListener('change', (event) => { renderer.reducedMotion = event.matches; });
const observer = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  const nativeWidth = width <= 700 ? 480 : 640;
  renderer.resize(nativeWidth, Math.round(nativeWidth * height / width));
  renderer.render(game);
});
observer.observe(screen);

function frame(timestamp) {
  const dt = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.05) : 0;
  lastTimestamp = timestamp;
  if (!document.hidden) {
    game.update(dt);
    syncState();
    renderer.render(game);
    audio.update(game);
    if (timestamp - lastUiTime > 65) {
      updateUI();
      lastUiTime = timestamp;
    }
  }
  requestAnimationFrame(frame);
}

syncState();
updateUI();
requestAnimationFrame(frame);
