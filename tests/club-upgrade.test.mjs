import test from 'node:test';
import assert from 'node:assert/strict';
import { ClubQuests, questById, questList, sanitizeQuestSave } from '../src/club-quests.mjs';
import { ClubElevator } from '../src/club-elevator.mjs';
import { defaultSettings, sanitizeSettings, walkSpeed, snapRadians } from '../src/club-settings.mjs';
import { ClubQuality, PERF_BUDGETS, qualityPreset } from '../src/club-quality.mjs';
import { barkFor, resetBarks } from '../src/club-barks.mjs';

test('the quest catalog has seven optional quests with givers and hints', () => {
  const quests = questList();
  assert.equal(quests.length, 7);
  for (const quest of quests) {
    assert.ok(quest.id && quest.title && quest.giver && quest.hint);
    assert.ok(quest.steps.length >= 1);
    assert.equal(questById(quest.id).title, quest.title);
  }
  assert.equal(questById('missing'), null);
});

test('quest progress starts steps once and stamps completion', () => {
  const events = [];
  const quests = new ClubQuests({ now: () => 1234, onChange: () => events.push(1) });
  assert.equal(quests.start('byte'), true);
  assert.equal(quests.start('byte'), false);
  assert.deepEqual(quests.active(), ['byte']);
  const first = quests.completeStep('byte', 0);
  assert.equal(first.count, 1);
  assert.equal(first.done, false);
  assert.equal(quests.completeStep('byte', 0), null);
  assert.equal(quests.completeStep('byte', 9), null);
  quests.completeStep('byte', 1);
  const done = quests.completeStep('byte', 2);
  assert.equal(done.done, true);
  assert.equal(quests.status('byte').stampTime, 1234);
  assert.deepEqual(quests.active(), []);
  assert.ok(events.length >= 4);
  assert.equal(quests.reset('byte'), true);
  assert.equal(quests.status('byte').started, false);
});

test('quest saves sanitize unknown ids, bad steps, and bad stamps', () => {
  const clean = sanitizeQuestSave({ byte: { started: true, done: 'yes', steps: [true, 'x'], stampTime: 'bad' }, nope: true });
  assert.equal(clean.byte.started, true);
  assert.equal(clean.byte.done, false);
  assert.deepEqual(clean.byte.steps, [true, false, false]);
  assert.equal(clean.byte.stampTime, 0);
  assert.equal(clean.tour.started, false);
  const quests = new ClubQuests({ save: clean });
  assert.deepEqual(Object.keys(quests.snapshot()), Object.keys(clean));
});

test('the elevator rides between basement, club, and roof with door phases', () => {
  const elevator = new ClubElevator({ now: () => current });
  let current = 1000;
  assert.equal(elevator.request('B1'), true);
  assert.equal(elevator.request('R1'), false);
  assert.equal(elevator.canRide(), false);
  current = 1200; elevator.update();
  assert.equal(elevator.doors, 'closing');
  current = 1600; elevator.update();
  assert.equal(elevator.doors, 'closed');
  current = 2100; elevator.update();
  assert.equal(elevator.doors, 'opening');
  current = 2600;
  const done = elevator.update();
  assert.deepEqual(done, { from: 'L1', to: 'B1', start: 1000 });
  assert.equal(elevator.floor, 'B1');
  assert.equal(elevator.doors, 'open');
  assert.equal(elevator.request('B1'), false);
  assert.equal(elevator.request('R1'), true);
});

test('settings sanitize unknown values and expose walk plus snap helpers', () => {
  assert.deepEqual(defaultSettings().quality, 'auto');
  const clean = sanitizeSettings({ quality: 'ultra', snapAngle: 45, speed: 'calm', haptics: 'yes', eyeHeight: 9, text: 'large' });
  assert.equal(clean.quality, 'auto');
  assert.equal(clean.snapAngle, 45);
  assert.equal(clean.haptics, true);
  assert.equal(clean.eyeHeight, 1.65);
  assert.equal(walkSpeed(clean), 2.5);
  assert.ok(Math.abs(snapRadians(clean) - Math.PI / 4) < 0.0001);
  assert.equal(walkSpeed(null), 4.2);
});

test('quality presets expose budgets and auto mode switches on sustained load', () => {
  assert.ok(qualityPreset('low').framebufferScale < qualityPreset('high').framebufferScale);
  assert.ok(PERF_BUDGETS.low.calls < PERF_BUDGETS.high.calls);
  const quality = new ClubQuality({ mode: 'auto', immersive: true });
  assert.equal(quality.active, 'low');
  quality.setMode('auto', false);
  assert.equal(quality.active, 'high');
  quality.updateAuto(1000);
  for (let time = 1100; time < 5200; time += 100) quality.updateAuto(time);
  assert.equal(quality.active, 'low');
  quality.setMode('low');
  assert.equal(quality.active, 'low');
});

test('ambient barks rotate lines and respect cooldowns', () => {
  resetBarks();
  assert.equal(barkFor('host', 1000), 'Try the lounge jukebox.');
  assert.equal(barkFor('host', 2000), null);
  assert.ok(barkFor('host', 30000));
  assert.ok(barkFor('unknown-id', 40000));
});
