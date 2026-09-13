import { Renderer } from './renderer.js';
import { CHARACTERS } from './characters.mjs';
import { getCar, getPaint } from './cars.mjs';

const canvas = document.getElementById('garage-scene');
const ctx = canvas.getContext('2d');
const renderer = new Renderer(document.createElement('canvas'));
await renderer.logoReady;
await document.fonts.ready;
ctx.imageSmoothingEnabled = false;
renderer.drawGarage(ctx, canvas.width, canvas.height);

let carId = 'countach';
let paintId = 'amber';
try {
  carId = getCar(localStorage.getItem('tokyo-nights.car')).id;
  paintId = getPaint(localStorage.getItem('tokyo-nights.paint')).id;
} catch {}
ctx.drawImage(renderer.getCarSprite(carId, paintId), 1180, 410, 240, 138);

const stage = document.getElementById('garage-stage');
const artwork = document.querySelector('.garage-art');
const navigation = document.getElementById('crew-navigation');
const labels = document.getElementById('garage-labels');
CHARACTERS.forEach((character, index) => {
  const center = (index + .5) * canvas.width / CHARACTERS.length;
  ctx.fillStyle = '#111420';
  ctx.fillRect(center - 64, 770, 132, 13);
  ctx.drawImage(renderer.getFullCharacter(character.id), center - 72, 462, 144, 312);
  const label = document.createElement('span');
  label.textContent = character.name.toUpperCase();
  labels.append(label);
  const button = document.createElement('button');
  button.textContent = character.name;
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    navigation.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    stage.scrollTo({ left: (index + .5) * artwork.clientWidth / CHARACTERS.length - stage.clientWidth / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    document.getElementById('crew-detail').textContent = `${character.name}: ${character.detail}`;
    const download = document.getElementById('crew-card-download');
    download.href = `assets/cameo-cards/${character.id}.png`;
    download.textContent = `DOWNLOAD ${character.name.toUpperCase()} CARD`;
  });
  navigation.append(button);
});
canvas.setAttribute('aria-label', `Full-body lineup outside the Omarchy garage: ${CHARACTERS.map(({ name }) => name).join(', ')}.`);
