import * as THREE from '../assets/three.module.js';
import { MAC_ROOM, MAC_CREW } from './club-mac.mjs';
import { commandBoard } from './club-team-art.js';

const C = { silver: '#c2c7cb', edge: '#858e99', white: '#e2e4dc', beige: '#b7b29a', dark: '#24283b', cyan: '#7dcfff', green: '#9ece6a', gold: '#e0af68' };

export class ClubMacRoom {
  constructor(room) {
    this.room = room; room.at(0, 0);
    room.box(39, -.045, 23, 24, .06, 18, '#343b4c'); room.box(39, 4.63, 23, 24, .14, 18, '#555c65');
    for (let x = 28; x < 51; x += 2) room.box(x, -.01, 23, .018, .01, 18, '#4b5365');
    for (let z = 15; z < 32; z += 2) room.box(39, -.01, z, 24, .01, .018, '#4b5365');
    for (const x of [31, 37, 43, 49]) for (const z of [17, 23, 29]) {
      room.box(x, 4.4, z, 2.9, .10, .6, C.edge); room.box(x, 4.33, z, 2.7, .025, .44, C.white, true);
    }
    for (const side of [-1, 1]) {
      const z = MAC_ROOM.doorZ + side * MAC_ROOM.doorWidth / 2;
      room.box(27, 1.58, z, .46, 3.16, .08, C.silver);
      room.box(26.75, 1.58, z - side * .03, .02, 3.12, .025, C.green, true);
    }
    room.box(27, -.005, 25.5, .4, .018, 3.1, C.silver);
    room.sign(['MAC ROOM', 'TEAM M · OMARCHY'], 26.76, 3.83, 25.5, 3.5, C.green, -Math.PI / 2);
    room.sign(['DESIGN STUDIO', 'BACK TO THE CLUB'], 27.24, 3.83, 25.5, 3.5, C.gold, Math.PI / 2);
    this.teamBoards = [0, 1, 2].map((group) => {
      const board = room.plane(commandBoard(MAC_CREW.slice(group * 5, group * 5 + 5), 'TEAM M', 'BRINGING OMARCHY TO THE MAC'), 7.2, 2.25, 31 + group * 8, 3.08, 14.24);
      board.name = `mac-team-board-${group}`; return board;
    });
    this.makeLogo();
    room.sign(['CLASSIC MACINTOSH', '68000 · POWERPC · COLOR CRTs'], 39, 1.35, 14.25, 3.9, C.gold);
    room.sign(['APPLE SILICON', 'MACBOOK AIR · MINI · STUDIO'], 44.5, 3.3, 31.76, 9, C.cyan, Math.PI);
  }

  makeLogo() {
    const room = this.room; const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 384;
    this.logoWall = room.plane(canvas, 11.5, 3.45, 50.76, 2.65, 23, -Math.PI / 2); this.logoWall.name = 'mac-omarchy-wall';
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
      ctx.fillText('M · BRINGING OMARCHY TO THE MAC', 640, 340); this.logoWall.material.map.needsUpdate = true;
    };
    draw(); this.logoReady = room.art.ready.then(draw);
  }

  monitor(station) {
    const room = this.room;
    room.box(0, 1.42, -.12, 1.14, .76, .09, C.silver); room.box(0, 1.44, -.068, 1.08, .65, .02, '#16161e');
    room.box(0, 1.02, -.16, .08, .38, .08, C.edge); room.box(0, .84, -.12, .45, .045, .3, C.silver);
    room.crt(station, 1.44, 1.02, .57, -.275, C.dark, true);
  }

  bench(station) {
    const room = this.room; const model = station.mac.model; room.at(station.x, station.z, station.yaw);
    room.box(0, .76, 0, 2.25, .11, 1.18, C.white);
    for (const x of [-.97, .97]) for (const z of [-.45, .45]) room.box(x, .37, z, .07, .74, .07, C.edge);
    if (model === 'classic') {
      room.box(0, 1.25, -.04, .64, .88, .57, C.beige); room.box(0, 1.39, .255, .51, .40, .025, '#575e59');
      room.crt(station, 1.39, .44, .33, .054, C.beige, true);
      room.box(.11, .99, .257, .25, .026, .018, '#343b58');
    } else if (model === 'g3') {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshLambertMaterial({ color: '#408d96' }));
      shell.position.set(station.x, 1.28, station.z - .06); shell.scale.set(.62, .47, .55); room.root.add(shell);
      room.box(0, 1.3, .50, 1.03, .75, .08, C.white); room.box(0, 1.3, .548, .87, .65, .02, '#343b58');
      room.crt(station, 1.3, .80, .60, .345, C.dark, true); room.box(0, .84, -.03, .5, .06, .5, '#408d96');
    } else if (model === 'g4') {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(.34, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: C.white }));
      dome.position.set(station.x, .82, station.z - .1); room.root.add(dome);
      room.box(0, 1.22, -.1, .065, .5, .065, C.silver); room.box(0, 1.52, .18, 1.12, .72, .08, C.white);
      room.crt(station, 1.52, 1, .62, .015, C.dark, true);
    } else if (model === 'air') {
      room.box(0, .845, .08, .96, .055, .65, C.silver); room.box(0, 1.14, -.24, .94, .58, .045, C.silver);
      room.box(0, 1.14, -.21, .87, .51, .02, '#16161e'); room.crt(station, 1.14, .83, .47, -.416, C.dark, true);
      room.keyboard(0, .875, .12, .77, C.silver, true); room.box(0, .885, .35, .26, .008, .09, C.edge);
    } else {
      this.monitor(station);
      if (model === 'g5') {
        room.box(-.85, 1.2, -.06, .43, .77, .6, C.silver);
        for (let y = 0; y < 10; y++) for (let x = 0; x < 4; x++) room.box(-.99 + x * .09, .9 + y * .055, .247, .035, .023, .01, C.edge);
        room.box(-.85, 1.63, -.18, .43, .06, .08, C.silver); room.box(-.85, 1.63, .13, .43, .06, .08, C.silver);
      } else {
        room.box(-.8, model === 'studio' ? 1 : .9, -.05, .43, model === 'studio' ? .37 : .17, .43, C.silver);
        room.box(-.8, model === 'studio' ? .93 : .88, .175, .23, .025, .018, C.edge);
        room.box(-.65, .86, .18, .02, .018, .01, '#e5e9ff', true);
      }
    }
    if (model !== 'air') room.keyboard(0, .86, .36, .77, model === 'classic' ? C.beige : C.white);
    room.box(.83, .85, .34, .13, .07, .2, C.white);
    const label = room.sign([station.name.toUpperCase(), `${station.year} · ${station.mac.chip.toUpperCase()}`], 0, .63, .611, 1.85, C.cyan);
    label.userData.id = station.id; room.targets.push(label);
    const target = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.9, 1.25), room.art.pickMaterial);
    target.position.set(station.x, .95, station.z); target.rotation.y = station.yaw; target.userData.id = station.id;
    room.root.add(target); room.targets.push(target);
  }
}
