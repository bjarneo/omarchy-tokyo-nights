import { FOUNDING_PATRONS, getPatron } from './patrons.mjs';

const posters = new Map();
let ready;

function paintPoster(canvas, patron, portrait) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 160, 88);
  ctx.fillStyle = '#9ece6a';
  ctx.fillRect(0, 0, 160, 2); ctx.fillRect(0, 86, 160, 2);
  ctx.fillRect(0, 0, 2, 88); ctx.fillRect(158, 0, 2, 88);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9ece6a'; ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillText('OMARCHY FOUNDING PATRON', 8, 14);
  ctx.fillStyle = '#24283b'; ctx.fillRect(8, 23, 48, 48);
  if (portrait) ctx.drawImage(portrait, 8, 23, 48, 48);
  else {
    ctx.fillStyle = '#7dcfff'; ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(patron.name.split(' ').map((name) => name[0]).join(''), 14, 54, 36);
  }
  ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillStyle = '#c0caf5';
  const words = patron.name.split(' ');
  ctx.fillText(words[0].toUpperCase(), 64, 37, 87);
  if (words.length > 1) ctx.fillText(words.slice(1).join(' ').toUpperCase(), 64, 49, 87);
  ctx.font = '8px "Courier New", monospace'; ctx.fillStyle = '#9aa5ce';
  ctx.fillText(patron.company, 64, 66, 87);
  ctx.font = '7px "Courier New", monospace'; ctx.fillStyle = '#9ece6a';
  ctx.fillText('omarchy.org/patrons', 8, 81);
}

export function getPatronPoster(id) {
  const patron = getPatron(id);
  if (!posters.has(patron.id)) {
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 88;
    paintPoster(canvas, patron);
    posters.set(patron.id, canvas);
  }
  return posters.get(patron.id);
}

export function loadPatronArt() {
  ready ??= Promise.all(FOUNDING_PATRONS.map(async (patron) => {
    const canvas = getPatronPoster(patron.id);
    const image = new Image();
    image.src = new URL(`../${patron.portrait}`, import.meta.url).href;
    try { await image.decode(); paintPoster(canvas, patron, image); } catch { /* The nameplate remains visible without a portrait. */ }
  }));
  return ready;
}
