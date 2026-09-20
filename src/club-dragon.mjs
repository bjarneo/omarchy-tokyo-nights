export const DRAGON_ROOM = Object.freeze({ x: 39, z: 41, width: 24, depth: 18, doorX: 35.5, doorZ: 32, doorWidth: 3.2, source: 'https://omarchy.org/teams/' });

const members = [
  ['jim-martin', 'Jim Martin', 'USA', { skin: '#d2a98c', shade: '#a9836a', hair: '#9a9a95', hairHighlight: '#c9c9c2', top: '#a9c1de', trim: '#7c96b5', style: 'overshirt', wideSmile: true, stubble: true }, 'The Dragon team', 'The Dragon team brings Omarchy to Snapdragon laptops. ARM64 support needs a device tree, kernel drivers, and firmware that match each machine.'],
  ['birk-skyum', 'Birk Skyum', 'Switzerland', { skin: '#d7ac8f', shade: '#b0846a', hair: '#463628', top: '#3b4f78', trim: '#2c3a5c', style: 'hoodie', beard: true, wavy: true }, 'Battery life', 'Snapdragon chips use efficient cores. Compare idle and active battery time with the same workload and the same screen brightness.'],
  ['matt-gilg', 'Matt Gilg', 'USA', { skin: '#d8ab8b', shade: '#b0805f', hair: '#4b3b2c', top: '#3e6470', trim: '#b8503f', style: 'plaid', wavy: true }, 'Device trees', 'A device tree tells the kernel which hardware is present. Correct addresses, clocks, and power domains let the machine start.'],
  ['bob-prendergast', 'Bob Prendergast', 'USA', { skin: '#b98b52', shade: '#8f6738', hair: '#3b2f24', top: '#4a5568', trim: '#9ece6a', style: 'tee', cap: true, capColor: '#9ece6a', capBrim: '#6f9b4f', glasses: true }, 'Graphics and suspend', 'Test display output, video playback, and suspend separately. A failure report names the step and the kernel log line.'],
  ['miguel-cruz-dragon', 'Miguel Cruz', 'USA', { skin: '#b78e6d', shade: '#906749', hair: '#302c29', top: '#334d7e', trim: '#dad6bd', style: 'varsity', frames: true, stubble: true }, 'Firmware updates', 'Firmware packages change device behavior. Record the version with each result so another person can repeat the test.'],
];

const placements = [
  [30.5, 36.5, .35], [34.5, 40.5, -.4], [41, 37, Math.PI],
  [46, 41, .6], [36, 43.5, Math.PI],
].map(([x, z, yaw]) => ({ x, z, yaw }));

export const DRAGON_CREW = Object.freeze(members.map(([id, name, country, appearance, topic, reply], index) => Object.freeze({
  id, name, country, appearance, team: 'dragon', role: 'Omarchy Dragon team', ...placements[index],
  gesture: ['explain', 'coffee', 'hands', 'disk', 'wave'][index],
  source: DRAGON_ROOM.source, imageSource: `https://omarchy.org/assets/images/team/${id === 'miguel-cruz-dragon' ? 'miguel-cruz' : id}.webp`,
  greeting: `Welcome to the Dragon lab. ${reply}`,
  topics: [
    [`Meet ${name.split(' ')[0]}`, `This cameo represents ${name} from ${country}, listed on Omarchy’s Dragon team. The club conversations are fictional.`],
    [topic, reply],
    ['Try the Snapdragon machines', 'Select a machine to open the Omarchy desktop, a local terminal, or a hardware card. The displays are local club demos.'],
  ],
})));

export const DRAGON_MODELS = Object.freeze([
  { id: 'dragon-laptop', name: 'Snapdragon X Elite laptop', year: 2024, model: 'laptop', chip: 'Snapdragon X Elite · ARM64', x: 31, z: 47.2, yaw: Math.PI },
  { id: 'dragon-tablet', name: 'Snapdragon 8cx tablet', year: 2024, model: 'tablet', chip: 'Snapdragon 8cx Gen 3 · ARM64', x: 39, z: 47.2, yaw: Math.PI },
  { id: 'dragon-desktop', name: 'Snapdragon dev kit', year: 2023, model: 'desktop', chip: 'Snapdragon 8cx Gen 3 · ARM64', x: 47, z: 47.2, yaw: Math.PI },
].map((model) => Object.freeze(model)));

export const DRAGON_PATROL = Object.freeze({ x: 39, z: 41, radiusX: 8, radiusZ: 5.5, height: 2.45, speed: .32, fireDuration: 1.6, fireInterval: 9 });

export function createDragon() {
  return {
    id: 'ember-dragon', name: 'Ember · lab dragon', software: 'ember',
    detail: 'Ember is the lab’s flying pixel dragon. Watch it circle the Snapdragon benches and breathe a short flame from its mouth.',
    x: DRAGON_PATROL.x, y: DRAGON_PATROL.height, z: DRAGON_PATROL.z, yaw: 0, height: 1.2, eyeHeight: 2.1,
    clock: 0, fire: 0, fireAmount: 0, fireInterval: 6,
  };
}

export function triggerDragonFire(dragon) {
  dragon.fire = DRAGON_PATROL.fireDuration; dragon.fireInterval = DRAGON_PATROL.fireInterval;
}

export function updateDragon(dragon, dt, reducedMotion = false, engaged = false) {
  const step = Math.max(0, Math.min(.25, dt));
  if (reducedMotion) {
    if (dragon.fire > 0) {
      dragon.fire = Math.max(0, dragon.fire - step);
      dragon.fireAmount = Math.sin((1 - dragon.fire / DRAGON_PATROL.fireDuration) * Math.PI);
    } else {
      dragon.fireAmount = 0; dragon.fireInterval = DRAGON_PATROL.fireInterval;
    }
    return;
  }
  dragon.clock += step;
  if (!engaged) {
    const phase = dragon.clock * DRAGON_PATROL.speed;
    const x = DRAGON_PATROL.x + Math.sin(phase) * DRAGON_PATROL.radiusX;
    const z = DRAGON_PATROL.z + Math.sin(phase * .7 + 1) * DRAGON_PATROL.radiusZ;
    const y = DRAGON_PATROL.height + Math.sin(phase * 1.3) * .3;
    const dx = x - dragon.x; const dz = z - dragon.z;
    dragon.x = x; dragon.z = z; dragon.y = y;
    if (Math.hypot(dx, dz) > .001) {
      const yaw = Math.atan2(dx, dz);
      dragon.yaw += Math.atan2(Math.sin(yaw - dragon.yaw), Math.cos(yaw - dragon.yaw)) * Math.min(1, step * 3);
    }
  }
  if (dragon.fire > 0) {
    dragon.fire = Math.max(0, dragon.fire - step);
    dragon.fireAmount = Math.sin((1 - dragon.fire / DRAGON_PATROL.fireDuration) * Math.PI);
  } else {
    dragon.fireAmount = 0; dragon.fireInterval -= step;
    if (dragon.fireInterval <= 0) triggerDragonFire(dragon);
  }
}
