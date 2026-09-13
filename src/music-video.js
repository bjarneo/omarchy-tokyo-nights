import { VideoRenderer } from './video-renderer.js';
import { formatTime } from './song.mjs';

const $ = (id) => document.getElementById(id);
const audio = $('song');
const exportMode = new URLSearchParams(location.search).has('export');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
let request = 0;
let lastSection = -1;
let lastLyric = '';
let cues;
audio.volume = Number($('volume').value);

function status(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}

function render(time = audio.currentTime) {
  if (!renderer) return;
  const frame = renderer.render(time);
  $('seek').value = time;
  $('seek').setAttribute('aria-valuetext', `${formatTime(time)} of ${formatTime(cues.duration)}`);
  $('time').replaceChildren(document.createTextNode(`${formatTime(time)} `));
  const total = document.createElement('span');
  total.textContent = `/ ${formatTime(cues.duration)}`;
  $('time').append(total);
  if (frame.sectionIndex !== lastSection) {
    for (const [index, button] of [...$('chapters').children].entries()) {
      button.setAttribute('aria-current', String(index === frame.sectionIndex));
    }
    lastSection = frame.sectionIndex;
  }
  const lyric = frame.lyric?.text ?? '';
  if (lyric !== lastLyric) $('current-lyric').textContent = lastLyric = lyric;
  return frame;
}

function tick() {
  render();
  if (!audio.paused && !audio.ended) request = requestAnimationFrame(tick);
}

function updateTransport() {
  const playing = !audio.paused && !audio.ended;
  $('play-label').textContent = playing ? 'Pause video' : audio.ended ? 'Replay video' : 'Play video';
  $('play-icon').setAttribute('d', playing ? 'M5 3h4v14H5zm7 0h4v14h-4z' : 'M6 3l11 7-11 7z');
  cancelAnimationFrame(request);
  if (playing) request = requestAnimationFrame(tick);
}

async function togglePlay() {
  if (!renderer || $('play').disabled) return;
  if (!audio.paused) return audio.pause();
  if (audio.ended || audio.currentTime >= cues.duration - .05) audio.currentTime = 0;
  try {
    await audio.play();
    status('The video follows the audio and vocal timestamps.');
  } catch {
    status('The audio cannot play. Reload the video, then select Play video.', true);
    $('reload').hidden = false;
  }
}

async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('player').requestFullscreen();
  } catch {
    status('Fullscreen is unavailable in this browser.');
  }
}

$('play').addEventListener('click', togglePlay);
$('seek').addEventListener('input', () => {
  audio.currentTime = Number($('seek').value);
  render();
});
$('volume').addEventListener('input', () => { audio.volume = Number($('volume').value); });
$('captions').addEventListener('click', () => {
  if (!renderer) return;
  renderer.captions = !renderer.captions;
  $('captions').setAttribute('aria-pressed', String(renderer.captions));
  render();
});
$('fullscreen').addEventListener('click', fullscreen);
$('reload').addEventListener('click', () => location.reload());
document.addEventListener('fullscreenchange', () => {
  $('fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
});
audio.addEventListener('play', updateTransport);
audio.addEventListener('pause', updateTransport);
audio.addEventListener('seeked', () => render());
audio.addEventListener('ended', () => {
  render(cues.duration);
  updateTransport();
  status('The video has ended. Select Replay video to start again.');
});
audio.addEventListener('waiting', () => status('The audio needs more data. Playback resumes when the data arrives.'));
audio.addEventListener('playing', () => status('The video follows the audio and vocal timestamps.'));
function audioError() {
  status('The song cannot load. Restore assets/omarchy-tokyo-nights.mp3, then reload the video.', true);
  $('play').disabled = true;
  $('reload').hidden = false;
}
audio.addEventListener('error', audioError);
motionPreference.addEventListener('change', ({ matches }) => {
  if (renderer && !exportMode) {
    renderer.reducedMotion = matches;
    render();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !exportMode) audio.pause();
});
document.addEventListener('keydown', (event) => {
  if (event.target.closest('input, button, a, summary') || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.code === 'Space') { event.preventDefault(); togglePlay(); }
  if (event.code === 'KeyF') fullscreen();
});

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Cannot load ${url}.`);
  return response.json();
}

try {
  const [timeline, analysis] = await Promise.all([
    loadJson('assets/song-cues.json'), loadJson('assets/song-analysis.json'), document.fonts.load('10px Arcade'),
  ]);
  cues = timeline;
  if (exportMode) {
    $('video-canvas').width = 640;
    $('video-canvas').height = 360;
  }
  renderer = new VideoRenderer($('video-canvas'), cues, analysis, { reducedMotion: !exportMode && motionPreference.matches });
  $('seek').max = cues.duration;
  $('seek').disabled = false;
  $('play').disabled = Boolean(audio.error);
  for (const section of cues.sections) {
    const button = document.createElement('button');
    button.className = 'chapter';
    button.append(document.createTextNode(section.label));
    const time = document.createElement('span');
    time.textContent = formatTime(section.start);
    button.append(time);
    button.addEventListener('click', () => { audio.currentTime = section.start; render(); });
    $('chapters').append(button);
    const lines = cues.lyrics.filter((line) => line.start >= section.start && line.start < section.end);
    if (lines.length) {
      const group = document.createElement('section');
      const heading = document.createElement('h2');
      heading.textContent = section.label;
      group.append(heading);
      for (const line of lines) {
        const p = document.createElement('p');
        p.textContent = line.text;
        group.append(p);
      }
      $('transcript').append(group);
    }
  }
  render(0);
  if (audio.error) audioError();
  else status('Select Play video to start the night drive.');
  window.musicVideo = {
    duration: cues.duration,
    renderAt(time) { return render(time); },
    frame(time) {
      renderer.render(time);
      return renderer.canvas.toDataURL('image/png').split(',')[1];
    },
  };
  window.videoReady = true;
  if (!exportMode) {
    fetch('exports/omarchy-tokyo-nights.mp4', { method: 'HEAD' })
      .then((response) => { $('download').hidden = !response.ok; })
      .catch(() => {});
  }
} catch (error) {
  status('The video artwork cannot load. Reload the page to try again.', true);
  $('reload').hidden = false;
  window.videoError = error.message;
}
