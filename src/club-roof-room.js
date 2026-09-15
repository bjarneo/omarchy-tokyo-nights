import * as THREE from '../assets/three.module.js';
import { ROOF, ROOF_CREW, ROOF_ELEVATOR, ROOF_ELEVATOR_CABIN } from './club-roof.mjs';
import { commandBoard } from './club-team-art.js';

const C = { ink: '#16161e', paper: '#c0caf5', cyan: '#7dcfff', gold: '#e0af68', green: '#9ece6a', metal: '#9aa5ce', pink: '#f7768e', purple: '#bb9af7', blue: '#7aa2f7' };
const hash = (n) => { const value = Math.sin(n * 93.7) * 43758.54; return value - Math.floor(value); };

function radialSprite(inner, outer, size = 128) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const glow = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  glow.addColorStop(0, inner); glow.addColorStop(0.35, outer); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class ClubRoofRoom {
  constructor(room) {
    this.room = room; room.at(0, 0);
    this.animated = [];
    this.deck();
    this.sky();
    this.parapetLights();
    this.stringLights();
    this.planters();
    this.loungers();
    this.elevator();
    this.projectorBeam();
    room.sign(['ROOFTOP CINEMA', 'NEW YORK AT NIGHT'], 0, 2.7, -19.3, 5.5, C.cyan, Math.PI);
    room.sign(['MANHATTAN LOOKOUT', 'ACROSS THE RIVER'], 0, 2.2, -32.72, 4.5, C.gold);
    this.teamBoard = room.plane(commandBoard(ROOF_CREW, 'ROOFTOP CINEMA', 'TRAILERS · TELESCOPES · NIGHT AIR'), 6.4, 2, -4.5, 1.9, -19.24, Math.PI);
    this.teamBoard.name = 'roof-team-board';
  }

  deck() {
    const room = this.room;
    const deck = document.createElement('canvas'); deck.width = deck.height = 128;
    const ctx = deck.getContext('2d'); ctx.fillStyle = '#1c2130'; ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 8) { ctx.fillStyle = '#252c40'; ctx.fillRect(0, y, 128, 4); }
    for (let x = 0; x < 128; x += 32) { ctx.fillStyle = '#161b29'; ctx.fillRect(x, 0, 2, 128); }
    for (let i = 0; i < 40; i++) { ctx.fillStyle = '#2c3450'; ctx.fillRect(hash(i) * 128, hash(i + 50) * 128, 2, 1); }
    const texture = new THREE.CanvasTexture(deck); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(10, 7); texture.magFilter = THREE.NearestFilter;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOF.width, ROOF.depth), new THREE.MeshLambertMaterial({ map: texture }));
    floor.name = 'roof-floor'; floor.rotation.x = -Math.PI / 2; floor.position.set(ROOF.x, -.02, ROOF.z); room.root.add(floor);
    this.floorMat = floor.material;
  }

  nightSkyTexture() {
    const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, 1024);
    sky.addColorStop(0, '#030510'); sky.addColorStop(.38, '#070c22'); sky.addColorStop(.62, '#101a42');
    sky.addColorStop(.79, '#232a5c'); sky.addColorStop(.92, '#4a3560'); sky.addColorStop(1, '#5c3f56');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 1400; i++) {
      const y = hash(i + 900) * 700;
      const fade = Math.max(0, 1 - y / 720);
      ctx.fillStyle = `rgba(229,233,255,${(.2 + hash(i) * .7) * fade})`;
      const big = hash(i) > .9;
      ctx.fillRect(hash(i + 500) * 2048, y, big ? 3 : 1, big ? 3 : 1);
    }
    for (const [x, y, w] of [[300, 120, 90], [900, 200, 130], [1500, 140, 110], [600, 300, 70]]) {
      const band = ctx.createLinearGradient(x, 0, x + w * 2, 0);
      band.addColorStop(0, 'rgba(125,207,255,0)'); band.addColorStop(.5, 'rgba(125,207,255,.10)'); band.addColorStop(1, 'rgba(125,207,255,0)');
      ctx.fillStyle = band; ctx.fillRect(x, y, w * 2, 14);
    }
    const glow = ctx.createRadialGradient(1024, 780, 20, 1024, 780, 700);
    glow.addColorStop(0, 'rgba(224,175,104,.34)'); glow.addColorStop(.5, 'rgba(224,175,104,.10)'); glow.addColorStop(1, 'rgba(224,175,104,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 2048, 1024);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  }

  sky() {
    const room = this.room;
    const sky = new THREE.Group(); sky.name = 'roof-sky'; sky.position.set(ROOF.x, 0, ROOF.z); room.root.add(sky);
    this.skyGroup = sky;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(130, 48, 24), new THREE.MeshBasicMaterial({ map: this.nightSkyTexture(), side: THREE.BackSide, depthWrite: false, fog: false }));
    dome.rotation.y = Math.PI; dome.renderOrder = -50; sky.add(dome);
    this.starPoints(sky);
    this.clouds(sky);
    this.moon(sky);
    this.manhattan(sky);
    this.river(sky);
    this.shootingStar(sky);
  }

  starPoints(sky) {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const tint = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const angle = hash(i + 1) * Math.PI * 2;
      const height = 24 + hash(i + 61) * 78;
      const radius = 108 + hash(i + 121) * 12;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      const pick = hash(i + 200);
      tint.set(pick > .86 ? '#e0af68' : pick > .7 ? '#7dcfff' : '#e5e9ff').multiplyScalar(.55 + hash(i + 300) * .45);
      colors[i * 3] = tint.r; colors[i * 3 + 1] = tint.g; colors[i * 3 + 2] = tint.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: .9, vertexColors: true, fog: false, transparent: true, opacity: .95, depthWrite: false }));
    this.stars.renderOrder = -49; sky.add(this.stars);
  }

  clouds(sky) {
    this.cloudsMesh = [];
    const texture = radialSprite('rgba(70,90,150,.30)', 'rgba(70,90,150,.08)');
    for (let i = 0; i < 7; i++) {
      const width = 34 + hash(i + 10) * 30;
      const cloud = new THREE.Mesh(new THREE.PlaneGeometry(width, width * .22), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, fog: false, opacity: .8 }));
      const angle = hash(i + 40) * Math.PI * 2;
      cloud.position.set(Math.cos(angle) * 105, 52 + hash(i + 70) * 34, Math.sin(angle) * 105);
      cloud.lookAt(0, cloud.position.y * .4, 0);
      cloud.renderOrder = -48; cloud.userData.speed = .004 + hash(i) * .008;
      sky.add(cloud); this.cloudsMesh.push(cloud);
    }
  }

  moon(sky) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e9edff'; ctx.beginPath(); ctx.arc(128, 128, 110, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d4d9f2';
    for (const [x, y, r] of [[90, 100, 22], [150, 140, 16], [120, 170, 11], [160, 90, 9], [100, 150, 7]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#f4f6ff'; ctx.beginPath(); ctx.arc(108, 104, 60, 0, Math.PI * 2); ctx.fill();
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    this.moonMesh = new THREE.Mesh(new THREE.CircleGeometry(7, 32), new THREE.MeshBasicMaterial({ map: texture, fog: false }));
    this.moonMesh.position.set(-54, 60, -92); this.moonMesh.lookAt(0, 4, 0); this.moonMesh.renderOrder = -47; sky.add(this.moonMesh);
    const haloTexture = radialSprite('rgba(160,200,255,.55)', 'rgba(125,207,255,.12)');
    this.moonHalo = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshBasicMaterial({ map: haloTexture, transparent: true, depthWrite: false, fog: false }));
    this.moonHalo.position.copy(this.moonMesh.position); this.moonHalo.lookAt(0, 4, 0); this.moonHalo.renderOrder = -48; sky.add(this.moonHalo);
  }

  shootingStar(sky) {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const streak = ctx.createLinearGradient(0, 0, 256, 0);
    streak.addColorStop(0, 'rgba(229,233,255,0)'); streak.addColorStop(.7, 'rgba(229,233,255,.8)'); streak.addColorStop(1, '#ffffff');
    ctx.fillStyle = streak; ctx.fillRect(0, 6, 256, 4);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    this.meteor = new THREE.Mesh(new THREE.PlaneGeometry(16, 1), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, fog: false, opacity: 0 }));
    this.meteor.renderOrder = -46; sky.add(this.meteor);
    this.meteorState = { next: 6, start: 0 };
  }

  towerTexture(litRatio, seed, hue) {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#10152a'; ctx.fillRect(0, 0, 64, 128);
    for (let y = 3; y < 125; y += 5) for (let x = 3; x < 61; x += 5) {
      const roll = hash(seed + x * 7 + y * 13);
      if (roll < litRatio) {
        const warm = hash(seed + x * 3 + y * 7);
        ctx.fillStyle = warm > .82 ? '#e5e9ff' : warm > .68 ? hue : '#e0af68';
      } else ctx.fillStyle = '#1d2440';
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.fillStyle = '#0a0e1e'; ctx.fillRect(0, 0, 64, 3);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = THREE.NearestFilter;
    return texture;
  }

  tower(sky, name, x, z, width, height, depth, litRatio, seed, hue = '#7dcfff') {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshBasicMaterial({ map: this.towerTexture(litRatio, seed, hue), fog: false }));
    tower.position.set(x, height / 2 - 2.5, z); tower.renderOrder = -46; tower.name = name; sky.add(tower);
    return tower;
  }

  aviationBeacon(sky, x, y, z, color, phase) {
    const light = new THREE.Mesh(new THREE.SphereGeometry(.55, 8, 6), new THREE.MeshBasicMaterial({ color, fog: false }));
    light.position.set(x, y, z); light.renderOrder = -45; sky.add(light);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: radialSprite(color, 'rgba(0,0,0,0)'), transparent: true, depthWrite: false, fog: false, opacity: .8 }));
    halo.position.copy(light.position); halo.renderOrder = -45; sky.add(halo);
    this.animated.push({ kind: 'beacon', light, halo, phase });
    return light;
  }

  manhattan(sky) {
    const back = [
      ['far-1', -72, -122, 14, 40, 12, .3, 501, '#7aa2f7'], ['far-2', -52, -126, 15, 52, 13, .34, 511, '#7aa2f7'],
      ['far-3', -30, -124, 14, 44, 12, .3, 521, '#bb9af7'], ['far-4', -8, -128, 16, 58, 14, .36, 531, '#7aa2f7'],
      ['far-5', 14, -126, 15, 48, 13, .32, 541, '#bb9af7'], ['far-6', 36, -128, 16, 56, 14, .35, 551, '#7aa2f7'],
      ['far-7', 58, -124, 14, 42, 12, .3, 561, '#7aa2f7'], ['far-8', 78, -120, 13, 34, 11, .28, 571, '#bb9af7'],
    ];
    for (const [name, x, z, w, h, d, lit, seed, hue] of back) this.tower(sky, `nyc-${name}`, x, z, w, h, d, lit, seed, hue);
    const mid = [
      ['midtown-west-1', -58, -95, 10, 34, 10, .42, 3, '#7dcfff'], ['midtown-west-2', -46, -100, 12, 46, 12, .5, 11, '#e0af68'],
      ['midtown-west-3', -33, -96, 9, 30, 9, .38, 23, '#7dcfff'], ['midtown-4', -21, -102, 11, 55, 11, .55, 37, '#e0af68'],
      ['midtown-5', -9, -98, 10, 40, 10, .48, 51, '#7dcfff'], ['midtown-6', 3, -103, 12, 62, 12, .58, 67, '#e0af68'],
      ['midtown-7', 15, -99, 10, 44, 10, .5, 83, '#7dcfff'], ['midtown-east-1', 27, -104, 11, 52, 11, .54, 97, '#e0af68'],
      ['midtown-east-2', 39, -100, 12, 38, 12, .44, 113, '#7dcfff'], ['midtown-east-3', 51, -96, 10, 30, 10, .4, 127, '#e0af68'],
      ['midtown-east-4', 62, -101, 11, 42, 11, .47, 141, '#7dcfff'],
    ];
    for (const [name, x, z, w, h, d, lit, seed, hue] of mid) {
      const tower = this.tower(sky, `nyc-${name}`, x, z, w, h, d, lit, seed, hue);
      if (h >= 44) this.aviationBeacon(sky, x, h - 2.5 + .8, z, '#f7768e', seed);
      void tower;
    }
    const empire = this.tower(sky, 'nyc-empire-state', -15, -108, 9, 78, 9, .6, 200, '#e0af68');
    for (let i = 0; i < 4; i++) {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(9 - i * 1.6, 2.2, 9 - i * 1.6), new THREE.MeshBasicMaterial({ color: '#f7768e', fog: false }));
      tier.position.set(empire.position.x, 78 - 2.5 - 1 - i * 2.2, empire.position.z); tier.renderOrder = -45; sky.add(tier);
    }
    const beacon = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6, 1.4), new THREE.MeshBasicMaterial({ color: '#ffd578', fog: false }));
    beacon.position.set(empire.position.x, 78 - 2.5 + 3, empire.position.z); beacon.renderOrder = -45; sky.add(beacon);
    this.animated.push({ kind: 'pulse', mesh: beacon, phase: 0, colors: ['#ffd578', '#f7768e'] });
    this.tower(sky, 'nyc-chrysler', 21, -107, 7, 70, 7, .55, 220, '#7dcfff');
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(3.4 - i * .7, 3.9 - i * .7, 1.4, 12), new THREE.MeshBasicMaterial({ color: i % 2 ? '#7dcfff' : '#e5e9ff', fog: false }));
      ring.position.set(21, 70 - 2.5 + .7 + i * 1.5, -107); ring.renderOrder = -45; sky.add(ring);
    }
    const spire = new THREE.Mesh(new THREE.ConeGeometry(.9, 6, 8), new THREE.MeshBasicMaterial({ color: '#e5e9ff', fog: false }));
    spire.position.set(21, 70 - 2.5 + 9, -107); spire.renderOrder = -45; sky.add(spire);
    this.bridge(sky);
    const statue = new THREE.Mesh(new THREE.BoxGeometry(4, 14, 4), new THREE.MeshBasicMaterial({ color: '#3f7a6a', fog: false }));
    statue.position.set(-80, 4.5, -66); statue.renderOrder = -46; sky.add(statue);
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), new THREE.MeshBasicMaterial({ color: '#8a7f63', fog: false }));
    pedestal.position.set(-80, -1, -66); pedestal.renderOrder = -46; sky.add(pedestal);
    const torch = new THREE.Mesh(new THREE.BoxGeometry(.8, 3, .8), new THREE.MeshBasicMaterial({ color: '#ffd578', fog: false }));
    torch.position.set(-80, 13, -66); torch.renderOrder = -45; sky.add(torch);
    const torchGlow = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: radialSprite('rgba(255,213,120,.8)', 'rgba(255,213,120,.1)'), transparent: true, depthWrite: false, fog: false }));
    torchGlow.position.set(-80, 13.5, -66); torchGlow.renderOrder = -45; sky.add(torchGlow);
    this.animated.push({ kind: 'torch', mesh: torchGlow, phase: 1.4 });
  }

  bridge(sky) {
    const deckY = 2.2;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(120, .7, 3), new THREE.MeshBasicMaterial({ color: '#2a3352', fog: false }));
    deck.position.set(30, deckY, -78); deck.renderOrder = -46; sky.add(deck);
    for (const tx of [-8, 30, 68]) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 16, 3.4), new THREE.MeshBasicMaterial({ color: '#3a4670', fog: false }));
      tower.position.set(tx, deckY + 7, -78); tower.renderOrder = -46; sky.add(tower);
      this.aviationBeacon(sky, tx, deckY + 15.6, -78, '#e0af68', tx);
    }
    const cableMat = new THREE.LineBasicMaterial({ color: '#e0af68', transparent: true, opacity: .75, fog: false });
    for (const [from, to] of [[[-8, -78], [30, -78]], [[30, -78], [68, -78]]]) {
      const points = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const x = from[0] + (to[0] - from[0]) * t;
        const sag = Math.sin(t * Math.PI) * -9;
        points.push(new THREE.Vector3(x, deckY + 14 + sag, -78));
      }
      const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), cableMat);
      cable.renderOrder = -45; sky.add(cable);
    }
    for (let i = 0; i < 30; i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(.22, 6, 5), new THREE.MeshBasicMaterial({ color: i % 3 ? '#e0af68' : '#7dcfff', fog: false }));
      bead.position.set(-8 + i * 2.6, deckY + .8, -78); bead.renderOrder = -45; sky.add(bead);
    }
  }

  river(sky) {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a1128'; ctx.fillRect(0, 0, 512, 128);
    for (let i = 0; i < 220; i++) {
      const gold = hash(i) > .42;
      ctx.fillStyle = gold ? `rgba(224,175,104,${.25 + hash(i + 9) * .5})` : `rgba(125,207,255,${.2 + hash(i + 9) * .45})`;
      ctx.fillRect(hash(i + 20) * 512, hash(i + 40) * 128, 3 + hash(i + 60) * 14, 1.4);
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(3, 1);
    this.riverTexture = texture;
    const river = new THREE.Mesh(new THREE.PlaneGeometry(280, 46), new THREE.MeshBasicMaterial({ map: texture, fog: false }));
    river.rotation.x = -Math.PI / 2; river.position.set(0, -2.5, -54); river.renderOrder = -48; sky.add(river);
  }

  parapetLights() {
    const room = this.room;
    const strip = (x1, z1, x2, z2, color) => {
      const length = Math.hypot(x2 - x1, z2 - z1);
      const steps = Math.floor(length / .8);
      for (let i = 0; i <= steps; i++) {
        const x = x1 + (x2 - x1) * i / steps;
        const z = z1 + (z2 - z1) * i / steps;
        room.box(x, 1.21, z, .12, .06, .12, color, true);
      }
    };
    strip(-9.7, -32.85, 9.7, -32.85, C.gold);
    strip(-9.85, -32.7, -9.85, -19.3, C.cyan);
    strip(9.85, -32.7, 9.85, -22.6, C.cyan);
    strip(-9.7, -19.15, 6.2, -19.15, C.cyan);
    this.glowPool(0, -30, 9, 3.4, 'rgba(224,175,104,.30)');
    this.glowPool(-6, -25, 6, 4.5, 'rgba(125,207,255,.22)');
    this.glowPool(6, -25, 6, 4.5, 'rgba(247,118,142,.18)');
  }

  glowPool(x, z, w, d, color) {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const glow = ctx.createRadialGradient(64, 32, 4, 64, 32, 62);
    glow.addColorStop(0, color); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 128, 64);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(x, .012, z); pool.renderOrder = -18;
    this.room.root.add(pool);
  }

  stringLights() {
    const room = this.room;
    this.stringBulbs = [];
    const palette = [C.gold, C.cyan, C.pink, C.green, C.purple];
    const rows = [[-23, 0], [-26.4, 1], [-29.8, 2]];
    for (const [z, row] of rows) {
      room.box(-8.8, 1.5, z, .14, 3, .14, '#2b3348'); room.box(8.8, 1.5, z, .14, 3, .14, '#2b3348');
      room.box(-8.8, 3.02, z, .2, .08, .2, C.gold, true); room.box(8.8, 3.02, z, .2, .08, .2, C.gold, true);
      const count = 22;
      let previous = null;
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const x = -8.8 + 17.6 * t;
        const sag = Math.sin(t * Math.PI) * -.55;
        const y = 2.96 + sag;
        if (previous) {
          const dx = x - previous.x; const dy = y - previous.y;
          const length = Math.hypot(dx, dy);
          room.box((x + previous.x) / 2, (y + previous.y) / 2, z, length, .018, .018, '#3d4763', false, -Math.atan2(dy, dx));
        }
        previous = { x, y };
        const color = palette[(i + row * 2) % palette.length];
        room.box(x, y - .07, z, .075, .075, .075, color, true);
        this.stringBulbs.push({ x, y: y - .07, z, color, phase: (i * .7 + row * 2.1) % (Math.PI * 2) });
      }
    }
    for (const bulb of this.stringBulbs) {
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ map: radialSprite(bulb.color, 'rgba(0,0,0,0)'), transparent: true, depthWrite: false, opacity: .55 }));
      halo.position.set(bulb.x, bulb.y, bulb.z); halo.renderOrder = 5;
      this.room.root.add(halo);
      bulb.halo = halo;
      this.animated.push({ kind: 'string', bulb, halo });
    }
  }

  planters() {
    const room = this.room;
    for (const [x, z] of [[-9.4, -31.5], [9.4, -31.5]]) {
      room.box(x, .35, z, .8, .7, .8, '#4c3a44');
      room.box(x, .72, z, .86, .06, .86, '#5d4a56');
      for (let i = 0; i < 7; i++) room.box(x + Math.sin(i * 2.4) * .22, 1 + i * .09, z + Math.cos(i * 2) * .2, .13, .65, .1, i % 2 ? '#3f5a45' : '#4c6e52', false, i);
      room.box(x, 1.52, z, .07, .07, .07, C.gold, true);
      room.box(x - .3, .75, z + .3, .1, .1, .1, C.cyan, true);
      room.box(x + .3, .75, z - .25, .1, .1, .1, C.pink, true);
    }
  }

  loungers() {
    const room = this.room;
    for (const [x, color] of [[-2.5, '#31475a'], [2.5, '#3a3f63']]) {
      room.box(x, .3, -24.5, 1.5, .14, 2.4, color);
      room.box(x, .62, -25.5, 1.5, .6, .16, color);
      room.box(x, .42, -24.5, 1.34, .1, 2.2, '#232838');
      for (const [dx, dz] of [[-.6, -.9], [.6, -.9], [-.6, .9], [.6, .9]]) room.box(x + dx, .12, -24.5 + dz, .1, .24, .1, '#16161e');
    }
    room.box(0, .45, -24.5, .7, .5, .7, '#343b58');
    room.box(0, .73, -24.5, .78, .06, .78, '#4a5478');
    room.box(0, .85, -24.5, .18, .18, .18, C.gold, true);
    room.box(-.22, .82, -24.3, .08, .12, .08, C.cyan, true);
    room.box(.22, .82, -24.7, .08, .12, .08, C.pink, true);
  }

  directory(target, width, height) {
    const room = this.room; const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 448;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, 384, 448);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 376, 440);
    ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.font = 'bold 34px "Courier New", monospace';
    ctx.fillText('FLOOR R1', 192, 70);
    ctx.fillStyle = C.paper; ctx.font = '24px "Courier New", monospace';
    ['BASEMENT', 'THE CLUB', 'ROOFTOP'].forEach((line, i) => ctx.fillText(line, 192, 165 + i * 48));
    ctx.fillStyle = C.green; ctx.font = 'bold 26px "Courier New", monospace'; ctx.fillText('SELECT A FLOOR', 192, 400);
    const mesh = room.plane(canvas, width, height, target.x, target.height, target.z, Math.PI);
    mesh.name = target.id; mesh.userData.id = target.id; room.targets.push(mesh); return mesh;
  }

  elevator() {
    const room = this.room; room.at(0, 0);
    room.box(6.5, 1.3, -19.9, .18, 2.6, 2.6, C.metal); room.box(9.9, 1.3, -19.9, .18, 2.6, 2.6, C.metal);
    room.box(8.2, 1.3, -19.05, 3.6, 2.6, .18, '#565f89'); room.box(8.2, 2.65, -19.9, 3.6, .1, 2.6, C.metal);
    room.box(8.2, .008, -19.9, 3.2, .015, 2.4, '#414868'); room.box(8.2, .025, -21.22, 3.2, .015, .1, C.cyan, true);
    room.box(8.2, 2.45, -19.9, 2, .025, .5, '#e5e9ff', true);
    for (let i = 0; i < 5; i++) { room.box(6.62, .5 + i * .45, -21.15, .05, .3, .05, C.cyan, true); room.box(9.78, .5 + i * .45, -21.15, .05, .3, .05, C.cyan, true); }
    room.box(8.2, 2.78, -21.2, 1.2, .3, .06, '#16161e');
    room.box(8.2, 2.78, -21.16, 1.05, .2, .02, C.gold, true);
    room.sign(['ELEVATOR · R1', 'NYC NIGHT DECK'], 8.2, 2.2, -21.25, 2.6, C.cyan, Math.PI);
    this.call = this.directory(ROOF_ELEVATOR, .28, .48);
    this.cabin = this.directory(ROOF_ELEVATOR_CABIN, .84, .98);
  }

  projectorBeam() {
    const origin = new THREE.Vector3(-7.5, 1.72, -21.5);
    const target = new THREE.Vector3(0, 2.4, -31.8);
    const direction = target.clone().sub(origin);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(.12, 1.5, length, 16, 1, true);
    const material = new THREE.MeshBasicMaterial({ color: '#bfe6ff', transparent: true, opacity: .10, side: THREE.DoubleSide, depthWrite: false });
    const beam = new THREE.Mesh(geometry, material);
    beam.position.copy(origin).addScaledVector(direction, .5);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize().negate());
    beam.renderOrder = 6; beam.name = 'roof-projector-beam';
    this.room.root.add(beam);
    this.beam = beam;
    for (let i = 0; i < 26; i++) {
      const mote = new THREE.Mesh(new THREE.SphereGeometry(.018, 5, 4), new THREE.MeshBasicMaterial({ color: '#cfe9ff', transparent: true, opacity: .7 }));
      mote.userData.t = hash(i + 300);
      mote.userData.speed = .02 + hash(i) * .05;
      this.room.root.add(mote);
      this.animated.push({ kind: 'mote', mesh: mote, origin: origin.clone(), direction: direction.clone() });
    }
  }

  bench(station) {
    const room = this.room; room.at(station.x, station.z, station.yaw);
    if (station.software === 'trailer') {
      room.box(0, 2.4, 0, 8.4, 4.6, .3, '#101322');
      room.box(0, 2.4, .18, 8, 4.2, .06, '#24283b');
      room.crt(station, 2.4, 7.2, 3.6, -.02, '#16161e', true);
      for (let x = -3.9; x <= 3.9; x += .65) { room.box(x, 4.78, .2, .12, .08, .08, C.gold, true); room.box(x, .02, .2, .12, .08, .08, C.gold, true); }
      for (let y = .4; y <= 4.4; y += .65) { room.box(-4.2, y, .2, .08, .12, .08, C.cyan, true); room.box(4.2, y, .2, .08, .12, .08, C.cyan, true); }
      room.sign(['OMACON 2026', 'TRAILER LOOP'], 0, 5.15, .2, 3, C.cyan);
      for (const x of [-3.5, 3.5]) { room.box(x, .7, 1.2, .3, 1.4, .3, '#2b3348'); room.box(x, 1.42, 1.2, .4, .06, .4, C.gold, true); }
    } else if (station.software === 'telescope') {
      room.box(0, .5, 0, .5, 1, .5, '#343b58');
      room.box(0, 1.15, 0, .18, .3, .18, '#565f89');
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, 1.1, 12), new THREE.MeshLambertMaterial({ color: '#9aa5ce' }));
      tube.rotation.x = Math.PI / 2 - .35; tube.position.set(station.x, 1.45, station.z); room.root.add(tube);
      const finder = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#f7768e' }));
      finder.position.set(station.x, 1.56, station.z + .3); room.root.add(finder);
      this.animated.push({ kind: 'finder', mesh: finder, phase: 0 });
      room.crt(station, 1.45, .3, .22, 0, '#16161e', true);
      room.sign(['MANHATTAN TELESCOPE', 'SELECT TO SCAN'], 0, .85, .35, 1.6, C.cyan);
    } else if (station.software === 'lookout') {
      room.box(0, .55, 0, 1.1, 1.1, .18, '#2b3348');
      room.box(0, 1.18, -.02, 1.3, .72, .08, '#101322');
      room.crt(station, 1.18, 1.1, .58, -.2, '#16161e', true);
      room.box(-.6, 1.58, 0, .08, .08, .08, C.gold, true); room.box(.6, 1.58, 0, .08, .08, .08, C.gold, true);
      room.sign(['MANHATTAN LOOKOUT', 'TOWER GUIDE'], 0, 1.78, .05, 1.4, C.gold);
    } else {
      room.box(0, 1.2, 0, 1.4, 2.4, 1, '#2b3348');
      room.box(0, 1.6, .52, .8, .6, .05, '#101322');
      room.crt(station, 1.6, .68, .51, .3, '#16161e', true);
      room.box(0, 1.72, .56, .12, .12, .06, '#e5e9ff', true);
      room.box(-.5, 1.1, .55, .08, .08, .05, C.green, true); room.box(-.3, 1.1, .55, .08, .08, .05, C.pink, true);
      room.sign(['ROOFTOP PROJECTOR', 'BROWSER CINEMA'], 0, 2.45, .55, 1.8, C.gold);
    }
    const target = new THREE.Mesh(new THREE.BoxGeometry(station.software === 'trailer' ? 8.4 : 1.6, station.software === 'trailer' ? 4.6 : 2.2, 1.4), room.art.pickMaterial);
    target.position.set(station.x, station.software === 'trailer' ? 2.3 : 1.2, station.z); target.rotation.y = station.yaw; target.userData.id = station.id;
    room.root.add(target); room.targets.push(target);
    room.at(0, 0);
  }

  update(elapsed, reducedMotion = false) {
    const time = reducedMotion ? 0 : elapsed;
    for (const item of this.animated) {
      if (item.kind === 'beacon') {
        const on = reducedMotion ? 1 : (Math.sin(time * 2.4 + item.phase) > .2 ? 1 : .08);
        item.light.visible = on > .5;
        item.halo.material.opacity = on > .5 ? .8 : 0;
        if (on > .5) item.halo.lookAt(this.room.root.position.clone().set(0, 1.6, -26));
      } else if (item.kind === 'pulse') {
        const pick = reducedMotion ? 0 : Math.floor(time / 3) % 2;
        item.mesh.material.color.set(item.colors[pick]);
      } else if (item.kind === 'torch') {
        const scale = reducedMotion ? 1 : 1 + Math.sin(time * 3.1 + item.phase) * .08;
        item.mesh.scale.set(scale, scale, 1);
      } else if (item.kind === 'string') {
        const twinkle = reducedMotion ? .55 : .42 + (Math.sin(time * 2 + item.bulb.phase) * .5 + .5) * .35;
        item.halo.material.opacity = twinkle;
        item.halo.lookAt(this.room.root.position.clone().set(item.bulb.x, 1.6, item.bulb.z + 2));
      } else if (item.kind === 'finder') {
        const blink = reducedMotion ? 1 : (Math.sin(time * 4 + item.phase) > 0 ? 1 : .2);
        item.mesh.material.color.setRGB(.97 * blink + .03, .26 * blink + .05, .35 * blink + .08);
      } else if (item.kind === 'mote') {
        if (reducedMotion) {
          item.mesh.position.copy(item.origin).addScaledVector(item.direction, item.mesh.userData.t);
        } else {
          item.mesh.userData.t += item.mesh.userData.speed * .016;
          if (item.mesh.userData.t > 1) item.mesh.userData.t = 0;
          const jitter = Math.sin(time * 2 + item.mesh.userData.t * 20) * .05;
          item.mesh.position.copy(item.origin).addScaledVector(item.direction, item.mesh.userData.t);
          item.mesh.position.y += jitter;
        }
      }
    }
    if (this.riverTexture) this.riverTexture.offset.x = reducedMotion ? 0 : (elapsed * .008) % 1;
    if (this.cloudsMesh) {
      for (const cloud of this.cloudsMesh) {
        if (!reducedMotion) cloud.rotation.z += cloud.userData.speed * .016;
      }
    }
    if (this.meteor) {
      if (reducedMotion) { this.meteor.material.opacity = 0; }
      else {
        const cycle = elapsed % 14;
        if (cycle > this.meteorState.next && cycle < this.meteorState.next + 1.1) {
          const progress = (cycle - this.meteorState.next) / 1.1;
          this.meteor.material.opacity = Math.sin(progress * Math.PI) * .9;
          const startX = 40 - this.meteorState.next * 3;
          this.meteor.position.set(startX - progress * 46, 66 - progress * 20, -100);
          this.meteor.lookAt(0, 4, -26);
          this.meteor.rotateZ(-.35);
        } else this.meteor.material.opacity = 0;
        if (cycle < .1) this.meteorState.next = 4 + hash(Math.floor(elapsed)) * 8;
      }
    }
  }
}
