import * as THREE from '../assets/three.module.js';
import { DRAGON_ROOM, DRAGON_CREW } from './club-dragon.mjs';
import { commandBoard } from './club-team-art.js';

const C = { silver: '#c2c7cb', edge: '#858e99', white: '#e2e4dc', dark: '#24283b', cyan: '#7dcfff', green: '#9ece6a', gold: '#e0af68', pink: '#f7768e' };

export class ClubDragonRoom {
  constructor(room) {
    this.room = room; room.at(0, 0);
    room.box(39, -.045, 41, 24, .06, 18, '#3a3244'); room.box(39, 4.63, 41, 24, .14, 18, '#5b5560');
    for (let x = 28; x < 51; x += 2) room.box(x, -.01, 41, .018, .01, 18, '#4b4a5e');
    for (let z = 33; z < 50; z += 2) room.box(39, -.01, z, 24, .01, .018, '#4b4a5e');
    for (const x of [31, 39, 47]) for (const z of [36, 41, 46]) {
      room.box(x, 4.4, z, 2.9, .10, .6, C.edge); room.box(x, 4.33, z, 2.7, .025, .44, C.white, true);
    }
    for (const side of [-1, 1]) {
      const x = DRAGON_ROOM.doorX + side * DRAGON_ROOM.doorWidth / 2;
      room.box(x, 1.58, 32, .08, 3.16, .46, C.silver);
      room.box(x + side * .03, 1.58, 31.76, .025, 3.12, .02, C.green, true);
      room.box(x + side * .03, 1.58, 32.24, .025, 3.12, .02, C.green, true);
    }
    room.box(DRAGON_ROOM.doorX, -.005, 32, 3.1, .018, .4, C.silver);
    room.sign(['DRAGON LAB', 'TEAM DRAGON · SNAPDRAGON'], 35.5, 3.83, 31.76, 3.5, C.green, Math.PI);
    room.sign(['BACK TO THE MAC ROOM', 'DESIGN STUDIO · THE CLUB'], 35.5, 3.83, 32.24, 3.5, C.gold);
    room.sign(['SNAPDRAGON LAB', 'ARM64 · DEVICE TREE · FIRMWARE'], 30.5, 3.3, 32.26, 3.0, C.cyan);
    room.sign(['DRAGON LAB', 'BRINGING OMARCHY TO SNAPDRAGON'], 39, 3.3, 49.76, 9, C.gold, Math.PI);
    room.sign(['ARM64', 'SNAPDRAGON · LOCAL DEMOS'], 27.24, 2.6, 39, 3.4, C.green, Math.PI / 2);
    this.teamBoard = room.plane(commandBoard(DRAGON_CREW, 'TEAM DRAGON', 'BRINGING OMARCHY TO SNAPDRAGON'), 7.2, 2.25, 45.5, 3.08, 32.26);
    this.teamBoard.name = 'dragon-team-board';
    this.makeLogo();
    this.makeDragon();
  }

  makeLogo() {
    const room = this.room; const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 384;
    this.logoWall = room.plane(canvas, 11.5, 3.45, 50.76, 2.65, 41, -Math.PI / 2); this.logoWall.name = 'dragon-omarchy-wall';
    const draw = () => {
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 1280, 384);
      ctx.strokeStyle = C.green; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 1272, 376);
      const logo = room.art.renderer.logo;
      if (logo) {
        const width = Math.min(1080, 238 * logo.width / logo.height); const height = width * logo.height / logo.width;
        ctx.imageSmoothingEnabled = false; ctx.drawImage(logo, (1280 - width) / 2, 35 + (238 - height) / 2, width, height);
        this.logoWall.userData.originalLogo = true;
      }
      ctx.fillStyle = C.gold; ctx.textAlign = 'center'; ctx.font = '32px "Courier New", monospace';
      ctx.fillText('DRAGON · BRINGING OMARCHY TO SNAPDRAGON', 640, 340); this.logoWall.material.map.needsUpdate = true;
    };
    draw(); this.logoReady = room.art.ready.then(draw);
  }

  monitor(station) {
    const room = this.room;
    room.box(0, 1.42, -.12, 1.14, .76, .09, C.silver); room.box(0, 1.44, -.068, 1.08, .65, .02, '#16161e');
    room.box(0, 1.02, -.16, .08, .38, .08, C.edge); room.box(0, .84, -.12, .45, .045, .3, C.silver);
    room.crt(station, 1.44, 1.02, .57, -.275, C.dark, true);
  }

  makeDragon() {
    const room = this.room; const art = room.art;
    this.dragon = new THREE.Group(); this.dragon.name = 'ember-lab-dragon'; room.root.add(this.dragon);
    this.dragonBody = new THREE.Group(); this.dragon.add(this.dragonBody);
    art.box(this.dragonBody, 0, 0, 0, .62, .5, 1.1, C.pink);
    art.box(this.dragonBody, 0, .16, .45, .36, .32, .6, C.pink);
    art.box(this.dragonBody, 0, .34, .82, .34, .34, .5, C.pink);
    art.box(this.dragonBody, 0, .3, 1.18, .22, .18, .36, C.gold);
    art.box(this.dragonBody, 0, .4, 1.34, .16, .05, .1, '#ffe0b7', true);
    for (const side of [-1, 1]) {
      art.box(this.dragonBody, side * .13, .42, .98, .1, .1, .06, C.gold, true);
      art.box(this.dragonBody, side * .13, .41, 1.01, .05, .06, .03, '#16161e');
      art.box(this.dragonBody, side * .14, .58, .72, .07, .22, .07, C.gold);
    }
    for (const side of [-1, 1]) for (const z of [-.35, .2]) {
      art.box(this.dragonBody, side * .3, -.3, z, .12, .3, .12, '#c26a8a');
      art.box(this.dragonBody, side * .34, -.42, z + .06, .2, .07, .18, C.gold);
    }
    this.tail = new THREE.Group(); this.tail.position.set(0, 0, -.6); this.dragonBody.add(this.tail);
    let parent = this.tail; let size = .4;
    for (let i = 0; i < 4; i++) {
      const segment = new THREE.Group(); segment.position.set(0, 0, -size * .8);
      art.box(segment, 0, 0, 0, size, size * .75, size * 1.1, i % 2 ? C.pink : '#c26a8a');
      art.box(segment, 0, size * .4, 0, .07, .16, .07, C.gold);
      parent.add(segment); parent = segment; size *= .72;
    }
    this.wings = [];
    for (const side of [-1, 1]) {
      const wing = new THREE.Group(); wing.position.set(side * .28, .2, .1);
      art.box(wing, side * .55, .05, -.05, 1.1, .07, .7, '#c26a8a');
      art.box(wing, side * .98, .02, -.02, .28, .05, .5, C.pink);
      art.box(wing, side * .2, .06, -.3, .5, .05, .35, C.gold);
      this.dragonBody.add(wing); this.wings.push({ wing, side });
    }
    this.fire = new THREE.Group(); this.fire.position.set(0, .32, 1.36); this.dragonBody.add(this.fire);
    this.flames = [];
    const flameColors = [C.gold, C.pink, '#ffe0b7', C.gold, C.pink, C.gold, C.pink];
    for (let i = 0; i < 7; i++) {
      const flame = new THREE.Group(); flame.position.set(i % 2 ? .05 : -.05, (i % 3) * .04 - .04, i * .28);
      const length = .3 - i * .028;
      art.box(flame, 0, 0, 0, length, length, length * 1.15, flameColors[i], true);
      this.fire.add(flame); this.flames.push(flame);
    }
    this.fire.visible = false;
    const tag = art.nameTag('EMBER · LAB DRAGON'); tag.position.y = 1.05; this.dragon.add(tag); this.dragon.tag = tag;
    const target = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.5, 2.6), art.pickMaterial);
    target.userData.id = 'ember-dragon'; this.dragon.add(target); room.targets.push(target);
  }

  update(dragon, reducedMotion, viewer, engaged = false) {
    this.dragon.position.set(dragon.x, dragon.y, dragon.z);
    const toward = Math.atan2(viewer.x - dragon.x, viewer.z - dragon.z);
    const face = engaged ? toward : dragon.yaw;
    this.dragon.rotation.y += Math.atan2(Math.sin(face - this.dragon.rotation.y), Math.cos(face - this.dragon.rotation.y)) * .12;
    const beat = reducedMotion ? 0 : dragon.clock;
    for (const { wing, side } of this.wings) wing.rotation.z = side * (.3 + Math.sin(beat * 9) * .5);
    this.tail.rotation.y = Math.sin(beat * 1.4) * .18;
    this.dragonBody.position.y = reducedMotion ? 0 : Math.sin(beat * 2.4) * .06;
    const amount = dragon.fireAmount;
    this.fire.visible = amount > .02;
    if (this.fire.visible) {
      this.fire.scale.set(.6 + amount * .5, .6 + amount * .4, .35 + amount * 1.15);
      this.flames.forEach((flame, i) => {
        const flicker = reducedMotion ? 1 : .78 + Math.sin(beat * 21 + i * 1.7) * .22;
        flame.scale.setScalar(amount * flicker);
        flame.position.x = (i % 2 ? .05 : -.05) * (1 + amount);
      });
    }
    this.dragon.tag.visible = Math.hypot(viewer.x - dragon.x, viewer.z - dragon.z) < 12;
    if (this.dragon.tag.visible) this.dragon.tag.lookAt(viewer);
  }

  bench(station) {
    const room = this.room; const model = station.dragon.model; room.at(station.x, station.z, station.yaw);
    room.box(0, .76, 0, 2.25, .11, 1.18, C.white);
    for (const x of [-.97, .97]) for (const z of [-.45, .45]) room.box(x, .37, z, .07, .74, .07, C.edge);
    if (model === 'laptop') {
      room.box(0, .845, .08, .96, .055, .65, C.silver); room.box(0, 1.14, -.24, .94, .58, .045, C.silver);
      room.box(0, 1.14, -.21, .87, .51, .02, '#16161e'); room.crt(station, 1.14, .83, .47, -.416, C.dark, true);
      room.keyboard(0, .875, .12, .77, C.silver, true);
    } else if (model === 'tablet') {
      room.box(0, .95, -.22, .72, .52, .035, C.silver); room.box(0, .95, -.19, .68, .48, .02, '#16161e');
      room.crt(station, .95, .6, .4, -.42, C.dark, true);
      room.box(0, .8, -.1, .46, .05, .3, C.edge);
      room.keyboard(0, .875, .22, .72, C.silver, true);
    } else {
      this.monitor(station);
      room.box(-.8, .9, -.05, .43, .17, .43, C.silver);
      room.box(-.8, .995, .175, .23, .025, .018, C.edge);
      room.box(-.65, .86, .18, .02, .018, .01, '#e5e9ff', true);
      room.keyboard(0, .86, .36, .77, C.white);
    }
    room.box(.83, .85, .34, .13, .07, .2, C.white);
    const label = room.sign([station.name.toUpperCase(), `${station.year} · ${station.dragon.chip.toUpperCase()}`], 0, .63, .611, 1.85, C.cyan);
    label.userData.id = station.id; room.targets.push(label);
    const target = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.9, 1.25), room.art.pickMaterial);
    target.position.set(station.x, .95, station.z); target.rotation.y = station.yaw; target.userData.id = station.id;
    room.root.add(target); room.targets.push(target);
  }
}
