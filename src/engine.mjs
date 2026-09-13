import { getCharacter } from './characters.mjs';
import { getCar, getPaint } from './cars.mjs';
import { CHAPTERS, getChapter } from './story.mjs';
import { createPitConversation } from './pit-stops.mjs';

export const DISTRICTS = ['SHINJUKU', 'SHIBUYA', 'AKIHABARA', 'RAINBOW BRIDGE'];
export const CRUISE_SPEED = 285;
export const MAX_SPEED = 340;
export const BOOST_SPEED = 460;
export const CHECKPOINT_LENGTH = 3000;
export const CAMEO_COOLDOWN = 20;
export const CAMEO_CHANCE = .35;
export const NITRO_DRAIN = 12.5;
export const NITRO_PICKUP_CHARGE = 45;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function roadCurve(distance) {
  return Math.sin(distance / 710) * 0.55 + Math.sin(distance / 1330 + 1.2) * 0.3;
}

export function cameoPose(time, reducedMotion = false) {
  if (time < 0 || time >= 2.6) return null;
  const rise = clamp(time / .4, 0, 1);
  const returnProgress = clamp((time - 1.85) / .75, 0, 1);
  const lift = time < .4 ? 1 - Math.pow(1 - rise, 3) : 1 - returnProgress * returnProgress;
  return {
    lift: reducedMotion ? time > .15 && time < 2.25 ? 1 : 0 : lift,
    facing: reducedMotion ? 'smile' : time < .6 ? 'back' : time < .88 ? 'profile' : 'smile',
    wave: reducedMotion ? 0 : Math.sin(time * 28) * 1.5,
    greeting: time >= .95 && time < 1.8,
  };
}

export class GameEngine {
  constructor({ random = Math.random, onEvent = () => {}, characterId = 'dhh', carId = 'countach', paintId = 'amber' } = {}) {
    this.random = random;
    this.onEvent = onEvent;
    this.state = 'title';
    this.characterId = getCharacter(characterId).id;
    this.carId = getCar(carId).id;
    this.paintId = getPaint(paintId).id;
    this.selectionReturnState = 'title';
    this.input = { left: false, right: false, gas: false, brake: false, nitro: false };
    this.demoDistance = 260;
    this.reset();
  }

  reset() {
    this.distance = 0;
    this.speed = 0;
    this.playerX = 0;
    this.steer = 0;
    this.time = 60;
    this.score = 0;
    this.nitro = 100;
    this.boosting = false;
    this.boostLocked = false;
    this.boostWasActive = false;
    this.cameoTime = -1;
    this.cameoCooldown = 0;
    this.cameoIntroduced = false;
    this.stage = 0;
    this.nextCheckpoint = CHECKPOINT_LENGTH;
    this.passed = 0;
    this.nearMisses = 0;
    this.collisions = 0;
    this.invincible = 0;
    this.shake = 0;
    this.traffic = [];
    this.nextTrafficId = 0;
    this.spawnTimer = 1.2;
    this.countdown = 3.4;
    this.lastCountdown = 4;
    this.elapsed = 0;
    this.toast = null;
    this.cassette = false;
    this.powerCells = 0;
    this.chapterPassed = 0;
    this.chapterCollisions = 0;
    this.chaptersComplete = 0;
    this.endingTime = 0;
    this.failureReason = '';
    this.nitroPickups = [];
    this.nextNitroSpawn = 120;
    this.nitroPickupId = 0;
    this.pitStop = null;
    this.pitDialogueIndex = 0;
    this.pitElapsed = 0;
    this.pitStopsVisited = 0;
    this.lastPitTopic = null;
    this.pitSavedSpeed = 0;
    this.preparePickups();
    this.preparePitStop();
    this.clearInput();
  }

  clearInput() {
    Object.keys(this.input).forEach((key) => { this.input[key] = false; });
  }

  chooseDriver() {
    if (!['title', 'paused', 'gameover', 'complete'].includes(this.state)) return;
    this.selectionReturnState = this.state;
    this.state = 'select';
    this.clearInput();
    this.onEvent({ type: 'select-driver' });
  }

  cancelSelection() {
    if (this.state !== 'select') return;
    this.state = this.selectionReturnState;
    this.clearInput();
    this.onEvent({ type: 'cancel-selection' });
  }

  start(characterId = this.characterId, carId = this.carId, paintId = this.paintId) {
    this.characterId = getCharacter(characterId).id;
    this.carId = getCar(carId).id;
    this.paintId = getPaint(paintId).id;
    this.reset();
    this.state = 'countdown';
    this.onEvent({ type: 'start', characterId: this.characterId });
  }

  showBriefing() {
    this.state = 'story';
    this.boosting = false;
    this.cameoTime = -1;
    this.boostWasActive = false;
    this.clearInput();
    this.onEvent({ type: 'briefing', chapter: this.stage });
  }

  beginChapter() {
    if (this.state !== 'story') return;
    this.countdown = this.stage === 0 ? 3.4 : 2.4;
    this.lastCountdown = 4;
    this.speed = 0;
    this.playerX = 0;
    this.steer = 0;
    this.state = 'countdown';
    this.clearInput();
    this.onEvent({ type: 'chapter-start', chapter: this.stage });
  }

  preparePickups() {
    const start = this.stage * CHECKPOINT_LENGTH;
    const chapter = getChapter(this.stage);
    this.pickups = chapter.drops.map((drop, index) => ({
      id: `${chapter.id}-${index}`, kind: chapter.id, z: start + drop.at, x: drop.x, resolved: false,
    }));
  }

  missionStatus() {
    const chapter = getChapter(this.stage);
    if (chapter.id === 'tape') return { label: `TAPE ${Number(this.cassette)}/1`, complete: this.cassette };
    if (chapter.id === 'power') return { label: `POWER CELLS ${Math.min(2, this.powerCells)}/2`, complete: this.powerCells >= 2 };
    if (chapter.id === 'traffic') {
      const count = Math.min(6, this.passed - this.chapterPassed);
      return { label: `CARS PASSED ${count}/6`, complete: count >= 6 };
    }
    const collisions = this.collisions - this.chapterCollisions;
    return { label: `COLLISIONS ${collisions}/2`, complete: collisions <= 2, failed: collisions > 2 };
  }

  collectPickups(previousDistance) {
    const status = this.missionStatus();
    if (status.complete) return;
    for (const pickup of this.pickups) {
      if (pickup.resolved) continue;
      const z = pickup.z - this.distance;
      if (pickup.z - previousDistance >= -12 && z <= 14 && z >= -12 && Math.abs(this.playerX - pickup.x) < .4) {
        pickup.resolved = true;
        if (pickup.kind === 'tape') this.cassette = true;
        else this.powerCells++;
        this.score += 500;
        this.nitro = Math.min(100, this.nitro + 20);
        this.message(pickup.kind === 'tape' ? 'TAPE COLLECTED +500' : 'POWER CELL +500', 'green', 1.6);
        this.onEvent({ type: 'pickup', kind: pickup.kind });
      } else if (z < -12) {
        pickup.resolved = true;
        this.message('DROP MISSED\nWATCH FOR THE NEXT ONE', 'pink', 1.4);
      }
    }
  }

  updateNitroPickups(previousDistance) {
    if (this.distance >= this.nextNitroSpawn) {
      this.nextNitroSpawn = this.distance + 520 + this.random() * 340;
      let z = this.distance + 300 + this.random() * 160;
      if (this.pickups.some((pickup) => Math.abs(pickup.z - z) < 90)) z += 180;
      if (z < this.nextCheckpoint - 80) {
        this.nitroPickups.push({ id: this.nitroPickupId++, kind: 'nitro', z, x: [-.65, 0, .65][Math.floor(this.random() * 3)], resolved: false });
      }
    }
    for (const pickup of this.nitroPickups) {
      if (pickup.resolved) continue;
      const z = pickup.z - this.distance;
      if (pickup.z - previousDistance >= -12 && z <= 14 && z >= -12 && Math.abs(this.playerX - pickup.x) < .4) {
        pickup.resolved = true;
        this.nitro = Math.min(100, this.nitro + NITRO_PICKUP_CHARGE);
        this.score += 200;
        this.message('NITRO +45', 'cyan', 1.4);
        this.onEvent({ type: 'nitro-pickup' });
      } else if (z < -12) pickup.resolved = true;
    }
    this.nitroPickups = this.nitroPickups.filter((pickup) => !pickup.resolved && pickup.z >= this.distance - 12);
  }

  preparePitStop() {
    this.pitStopAt = this.stage === 0 || this.random() < .65
      ? this.stage * CHECKPOINT_LENGTH + 1400 + this.random() * 800
      : null;
    this.pitStopLane = this.pitStopAt === null ? null : this.random() < .5 ? -1.22 : 1.22;
  }

  enterPitStop() {
    if (this.state !== 'playing') return;
    this.pitStopAt = null;
    this.pitSavedSpeed = this.speed;
    this.pitElapsed = 0;
    this.pitDialogueIndex = 0;
    this.pitStop = createPitConversation(this.random, this.characterId, this.lastPitTopic);
    this.lastPitTopic = this.pitStop.topicId;
    this.pitStopsVisited++;
    this.state = 'pit-enter';
    this.boosting = false;
    this.boostWasActive = false;
    this.cameoTime = -1;
    this.clearInput();
    this.onEvent({ type: 'pit-enter' });
  }

  advancePitDialogue() {
    if (this.state !== 'pit' || !this.pitStop) return;
    if (this.pitDialogueIndex < this.pitStop.lines.length - 1) {
      this.pitDialogueIndex++;
      this.onEvent({ type: 'pit-line' });
      return;
    }
    this.state = 'playing';
    this.speed = Math.min(this.pitSavedSpeed, CRUISE_SPEED);
    this.nitro = 100;
    this.pitStop = null;
    this.clearInput();
    this.message('BACK ON THE ROAD\nNITRO REFILLED', 'cyan', 1.8);
    this.onEvent({ type: 'pit-resume' });
  }

  beginEnding() {
    this.state = 'ending';
    this.chaptersComplete = CHAPTERS.length;
    this.endingTime = 0;
    this.boosting = false;
    this.cameoTime = -1;
    this.score += 5000 + Math.ceil(this.time) * 100;
    this.clearInput();
    this.onEvent({ type: 'ending' });
  }

  finishEnding() {
    if (this.state !== 'ending') return;
    this.state = 'complete';
    this.speed = 0;
    this.score = Math.floor(this.score);
    this.onEvent({ type: 'complete', score: this.score });
  }

  pause() {
    if (this.state !== 'playing' && this.state !== 'countdown') return;
    this.previousState = this.state;
    this.state = 'paused';
    this.boosting = false;
    this.clearInput();
    this.onEvent({ type: 'pause' });
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = this.previousState || 'playing';
    this.clearInput();
    this.onEvent({ type: 'resume' });
  }

  home() {
    this.reset();
    this.state = 'title';
    this.onEvent({ type: 'home' });
  }

  finish(reason = 'Time is up. The arcade closes before you arrive.') {
    if (this.state !== 'playing') return;
    this.state = 'gameover';
    this.boosting = false;
    this.cameoTime = -1;
    this.clearInput();
    this.score = Math.floor(this.score);
    this.failureReason = reason;
    this.onEvent({ type: 'gameover', score: this.score, reason });
  }

  message(text, tone = 'yellow', duration = 2) {
    this.toast = { text, tone, remaining: duration };
  }

  spawnTraffic() {
    const lanes = [-0.65, 0, 0.65];
    const x = lanes[Math.floor(this.random() * lanes.length)];
    const z = this.distance + 330 + this.random() * 70;
    const blocked = this.traffic.some((car) => Math.abs(car.x - x) < 0.3 && Math.abs(car.z - z) < 50);
    if (blocked) return;
    this.traffic.push({
      id: this.nextTrafficId++, x, z,
      speed: 72 + this.random() * 42,
      color: Math.floor(this.random() * 5),
      type: this.random() > 0.76 ? 'van' : 'car',
      resolved: false,
    });
  }

  updateCameo(dt) {
    this.cameoCooldown = Math.max(0, this.cameoCooldown - dt);
    const boostStarted = this.boosting && !this.boostWasActive;
    const cameoEligible = boostStarted && this.cameoCooldown === 0;
    if (cameoEligible && (!this.cameoIntroduced || this.random() < CAMEO_CHANCE)) {
      this.cameoTime = 0;
      this.cameoIntroduced = true;
      this.cameoCooldown = CAMEO_COOLDOWN;
      this.onEvent({ type: 'cameo', characterId: this.characterId });
    }
    if (!this.boosting && this.cameoTime >= 0 && this.cameoTime < 1.85) this.cameoTime = 1.85;
    if (this.cameoTime >= 0) {
      this.cameoTime += dt;
      if (this.cameoTime >= 2.6) this.cameoTime = -1;
    }
    this.boostWasActive = this.boosting;
  }

  update(delta) {
    const dt = clamp(delta, 0, 0.05);
    if (this.state === 'title' || this.state === 'select' || this.state === 'story') {
      this.demoDistance += dt * 13;
      return;
    }
    if (this.state === 'paused' || this.state === 'gameover' || this.state === 'complete' || this.state === 'pit') return;
    if (this.state === 'pit-enter') {
      this.pitElapsed += dt;
      this.speed = Math.max(0, this.pitSavedSpeed * (1 - this.pitElapsed / 1.25));
      if (this.pitElapsed >= 1.25) {
        this.speed = 0;
        this.state = 'pit';
        this.onEvent({ type: 'pit-line' });
      }
      return;
    }
    if (this.state === 'ending') {
      this.endingTime += dt;
      this.speed = Math.max(0, this.speed - dt * 100);
      if (this.endingTime >= 6) this.finishEnding();
      return;
    }
    this.elapsed += dt;
    if (this.state === 'countdown') {
      this.countdown -= dt;
      const count = Math.ceil(this.countdown);
      if (count !== this.lastCountdown && count <= 3 && count > 0) {
        this.lastCountdown = count;
        this.onEvent({ type: 'countdown', count });
      }
      if (this.countdown <= 0) {
        this.state = 'playing';
        this.message('GO!', 'green', 1);
        this.onEvent({ type: 'go' });
      }
      return;
    }

    this.time = Math.max(0, this.time - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    this.shake = Math.max(0, this.shake - dt * 15);
    if (this.toast) {
      this.toast.remaining -= dt;
      if (this.toast.remaining <= 0) this.toast = null;
    }

    const input = this.input;
    if (!input.nitro || this.nitro >= 25) this.boostLocked = false;
    this.boosting = input.nitro && !this.boostLocked && this.nitro > 0 && this.speed > 65 && !input.brake;
    if (this.boosting) {
      this.nitro = Math.max(0, this.nitro - dt * NITRO_DRAIN);
      if (this.nitro === 0) this.boostLocked = true;
    } else {
      this.nitro = Math.min(100, this.nitro + dt * 7.5);
    }

    const offRoad = Math.abs(this.playerX) > 1.02;
    const target = input.brake ? 55 : offRoad ? 105 : this.boosting ? BOOST_SPEED : input.gas ? MAX_SPEED : CRUISE_SPEED;
    const acceleration = this.speed < target ? this.boosting ? 190 : 110 : input.brake ? 235 : offRoad ? 185 : 100;
    this.speed += Math.sign(target - this.speed) * Math.min(Math.abs(target - this.speed), acceleration * dt);
    const steerTarget = Number(input.right) - Number(input.left);
    this.steer += (steerTarget - this.steer) * Math.min(1, dt * 10);
    this.playerX += steerTarget * dt * (0.44 + this.speed / CRUISE_SPEED) - roadCurve(this.distance) * (this.speed / MAX_SPEED) * dt * 0.19;
    this.playerX = clamp(this.playerX, -1.42, 1.42);
    const travel = this.speed / 3.6 * dt;
    const previousDistance = this.distance;
    this.distance += travel;
    this.score += travel * (this.boosting ? 3 : 1.6);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTraffic();
      this.spawnTimer = Math.max(0.65, 1.5 - this.stage * 0.12) + this.random() * 0.5;
    }

    for (const car of this.traffic) {
      const previousZ = car.z - previousDistance;
      car.z += car.speed / 3.6 * dt;
      const z = car.z - this.distance;
      const separation = Math.abs(this.playerX - car.x);
      if (!car.resolved && previousZ > -6 && z < 8 && z > -12 && separation < 0.235 && this.invincible <= 0) {
        car.resolved = true;
        this.speed *= 0.4;
        this.time = Math.max(0, this.time - 3);
        this.invincible = 1.7;
        this.shake = 6;
        this.collisions++;
        this.boosting = false;
        this.message('COLLISION\n−3 SECONDS', 'pink', 1.4);
        this.onEvent({ type: 'collision' });
      } else if (!car.resolved && z < -8) {
        car.resolved = true;
        this.passed++;
        const nearMiss = separation >= 0.235 && separation < 0.45;
        this.score += nearMiss ? 450 : 150;
        if (nearMiss) {
          this.nearMisses++;
          this.nitro = Math.min(100, this.nitro + 12);
          this.message('CLOSE CALL +450', 'cyan', 1);
          this.onEvent({ type: 'near-miss' });
        }
      }
    }
    this.traffic = this.traffic.filter((car) => car.z > this.distance - 60 && car.z < this.distance + 700);
    this.collectPickups(previousDistance);
    this.updateNitroPickups(previousDistance);
    this.updateCameo(dt);

    if (this.time <= 0) {
      this.finish();
      return;
    }
    if (this.missionStatus().failed) {
      this.finish(getChapter(this.stage).failure);
      return;
    }
    if (this.pitStopAt !== null) {
      const pitDistance = this.pitStopAt - this.distance;
      if (Math.abs(pitDistance) <= 18 && Math.abs(this.playerX) > 1.02 && Math.abs(this.playerX - this.pitStopLane) <= .22) {
        this.enterPitStop();
        return;
      }
      if (pitDistance < -30) this.pitStopAt = null;
    }
    if (this.distance >= this.nextCheckpoint) {
      if (!this.missionStatus().complete) {
        this.finish(getChapter(this.stage).failure);
        return;
      }
      this.chaptersComplete++;
      if (this.stage === CHAPTERS.length - 1) {
        this.beginEnding();
        return;
      }
      this.stage++;
      this.nextCheckpoint += CHECKPOINT_LENGTH;
      this.time += 35;
      this.score += 2500;
      this.nitro = Math.min(100, this.nitro + 35);
      this.chapterPassed = this.passed;
      this.chapterCollisions = this.collisions;
      this.traffic = [];
      this.spawnTimer = 1.2;
      this.preparePickups();
      this.nitroPickups = [];
      this.nextNitroSpawn = this.distance + 120;
      this.preparePitStop();
      this.message(`CHECKPOINT +35 SEC\n${DISTRICTS[this.stage % DISTRICTS.length]}`, 'green', 3);
      this.onEvent({ type: 'checkpoint', stage: this.stage });
      this.showBriefing();
    }
  }
}
