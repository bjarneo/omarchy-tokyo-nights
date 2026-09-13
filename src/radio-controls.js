import { RADIO_SITE, radioTime } from './radio-catalog.mjs';

const playIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 4 10 6-10 6z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4v12M14 4v12" stroke-width="3"/></svg>';

export function mountRadio(host, radio) {
  const prefix = host.id;
  host.classList.add('car-radio');
  host.innerHTML = `<div class="radio-face"><div class="radio-display"><a class="radio-brand" href="${RADIO_SITE}" target="_blank" rel="noopener noreferrer">OMARCHY RADIO</a><p class="radio-title"></p><p class="radio-detail"></p></div><div class="radio-buttons"><button type="button" data-radio="previous" aria-label="Previous radio track" title="Previous track"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4v12m12-12L7 10l9 6z"/></svg></button><button type="button" data-radio="toggle" class="radio-power" aria-label="Play radio" aria-pressed="false">${playIcon}</button><button type="button" data-radio="next" aria-label="Next radio track" title="Next track"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 4v12M4 4l9 6-9 6z"/></svg></button><button type="button" data-radio="tune" aria-label="Choose radio track and volume" aria-expanded="false" aria-controls="${prefix}-tuner">TUNE</button></div></div><div class="radio-tuner" id="${prefix}-tuner" hidden><label for="${prefix}-track">TRACK<select id="${prefix}-track" aria-label="Radio track"></select></label><label class="radio-volume" for="${prefix}-volume">VOLUME <output></output><input id="${prefix}-volume" type="range" min="0" max="100" step="1" aria-label="Radio volume" /></label></div><p class="radio-notice" role="status" hidden></p>`;
  const $ = (selector) => host.querySelector(selector);
  const select = $('select');
  radio.tracks.forEach((track, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${String(index + 1).padStart(2, '0')} · ${track.title} · ${track.artist}${track.explicit ? ' · EXPLICIT' : ''}`;
    select.append(option);
  });
  const tune = $('[data-radio="tune"]');
  const tuner = $('.radio-tuner');
  const setExpanded = (expanded) => {
    tune.setAttribute('aria-expanded', String(expanded));
    tuner.hidden = !expanded;
    if (expanded) select.focus({ preventScroll: true });
  };
  host.addEventListener('click', (event) => {
    const action = event.target.closest('[data-radio]')?.dataset.radio;
    if (action === 'toggle') radio.toggle();
    if (action === 'next') radio.next();
    if (action === 'previous') radio.previous();
    if (action === 'tune') setExpanded(tuner.hidden);
  });
  select.addEventListener('change', () => radio.select(Number(select.value)));
  $('input').addEventListener('input', (event) => radio.setVolume(Number(event.target.value) / 100));
  host.addEventListener('keydown', (event) => {
    if (['Space', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.code)) event.stopPropagation();
    if (event.code === 'Escape' && !tuner.hidden) { event.preventDefault(); event.stopPropagation(); setExpanded(false); tune.focus(); }
  });
  const setText = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  const unsubscribe = radio.subscribe((state) => {
    host.dataset.mode = state.mode;
    setText($('.radio-title'), state.track?.title || 'No tracks available');
    $('.radio-title').title = state.track?.title || '';
    setText($('.radio-detail'), `${state.track?.artist || 'Omarchy Radio'} · ${state.index + 1}/${state.count} · ${state.mode.toUpperCase()}${state.playing ? ` ${radioTime(state.time)}` : ''}${state.track?.explicit ? ' · EXPLICIT' : ''}`);
    if (select.value !== String(state.index)) select.value = String(state.index);
    $('input').value = String(Math.round(state.volume * 100));
    setText($('output'), `${Math.round(state.volume * 100)}%`);
    const toggle = $('[data-radio="toggle"]');
    const label = state.pending ? 'Cancel radio load' : state.active ? 'Pause radio' : 'Play radio';
    if (toggle.getAttribute('aria-label') !== label) toggle.innerHTML = state.active ? pauseIcon : playIcon;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-pressed', String(state.active));
    const notice = $('.radio-notice');
    notice.hidden = !state.error && !state.pending && !state.buffering;
    setText(notice, state.error || (state.pending || state.buffering ? 'The radio loads. Use Pause to cancel or Next to change tracks.' : ''));
    host.querySelectorAll('button').forEach((button) => { button.disabled = !state.count; });
  });
  return { dispose: unsubscribe };
}
