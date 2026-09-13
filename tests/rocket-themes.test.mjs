import test from 'node:test';
import assert from 'node:assert/strict';
import { OMARCHY_THEMES, OMARCHY_THEME_SOURCE } from '../assets/omarchy-themes.js';
import { rocketThemeAt, ROCKET_THEME_SECONDS, MAX_ROCKET_COLORS, blendColor } from '../src/rocket-themes.mjs';
import { createStarScore, STAR_STEP_SECONDS, midiFrequency } from '../src/rocket-score.mjs';

test('the native theme snapshot includes all twenty-two palettes and border colors', () => {
  assert.deepEqual(OMARCHY_THEMES.map(({ id }) => id).sort(), [
    'catppuccin', 'catppuccin-latte', 'ethereal', 'everforest', 'flexoki-light', 'gruvbox', 'hackerman', 'kanagawa',
    'last-horizon', 'lumon', 'lupine', 'matte-black', 'miasma', 'nord', 'osaka-jade', 'retro-82', 'ristretto', 'rose-pine',
    'solitude', 'tokyo-night', 'vantablack', 'white',
  ]);
  assert.match(OMARCHY_THEME_SOURCE, /omacom\/omarchy\/tree\/[a-f0-9]{40}\/themes$/);
  for (const theme of OMARCHY_THEMES) {
    assert.ok(Object.keys(theme.palette).length >= 23, theme.id);
    assert.ok(Object.values(theme.palette).every((color) => /^#[0-9a-f]{6}$/.test(color)), theme.id);
  }
  const hacker = OMARCHY_THEMES.find(({ id }) => id === 'hackerman');
  assert.equal(hacker.palette.hyprland_active_border_1, '#26a269');
  assert.equal(hacker.palette.hyprland_active_border_2, '#2ec27e');
});

test('the flight visits every theme at supported render rates and shows every source color', () => {
  for (const fps of [2, 10, 30, 60, 90]) {
    const seen = new Set();
    for (let frame = 0; frame < 20 * fps; frame++) seen.add(rocketThemeAt(frame / fps).id);
    assert.equal(seen.size, OMARCHY_THEMES.length, `${fps} FPS`);
  }
  OMARCHY_THEMES.forEach((theme, index) => {
    const frame = rocketThemeAt((index + .7) * ROCKET_THEME_SECONDS);
    assert.equal(frame.id, theme.id);
    assert.deepEqual(frame.palette, theme.palette);
    assert.equal(frame.colors.length, MAX_ROCKET_COLORS);
    assert.deepEqual(new Set(frame.colors), new Set(Object.values(theme.palette)));
    assert.deepEqual(frame.swatches, Object.entries(theme.palette));
  });
});

test('theme transitions preserve color continuity and clamp the flight endpoints', () => {
  assert.equal(rocketThemeAt(-1).id, 'tokyo-night');
  assert.equal(rocketThemeAt(NaN).id, 'tokyo-night');
  assert.equal(rocketThemeAt(20).id, 'white');
  assert.equal(rocketThemeAt(500).id, 'white');
  for (let i = 1; i < OMARCHY_THEMES.length; i++) {
    const before = rocketThemeAt(i * ROCKET_THEME_SECONDS - .000001);
    const after = rocketThemeAt(i * ROCKET_THEME_SECONDS + .000001);
    for (const key of Object.keys(before.palette)) if (after.palette[key]) assert.equal(after.palette[key], before.palette[key], `${i}: ${key}`);
    assert.deepEqual(after.hull, before.hull, `Hull continuity at theme ${i}`);
    assert.deepEqual(after.colors, before.colors, `Star and ring continuity at theme ${i}`);
  }
  assert.equal(blendColor('#000000', '#ffffff', .5), '#808080');
});

test('the original star score gives each theme a four-note phrase within twenty seconds', () => {
  const score = createStarScore();
  const bells = score.filter(({ kind }) => kind === 'bell');
  assert.equal(bells.length, OMARCHY_THEMES.length * 4);
  bells.forEach((note, index) => assert.ok(Math.abs(note.at - index * STAR_STEP_SECONDS) < 1e-10));
  for (const note of score) {
    assert.ok(note.at >= 0 && note.at < 20);
    assert.ok(note.duration > 0 && note.volume > 0 && note.volume < .2);
    assert.ok(midiFrequency(note.note) >= 40 && midiFrequency(note.note) < 2000);
    assert.ok(Math.abs(note.pan) <= 1);
  }
});
