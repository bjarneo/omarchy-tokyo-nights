import * as THREE from '../assets/three.module.js';
import { BASEMENT, BASEMENT_CREW, BASEMENT_ELEVATOR, BASEMENT_ELEVATOR_CABIN } from './club-basement.mjs';
import { commandBoard } from './club-team-art.js';

const C = { ink: '#16161e', paper: '#c0caf5', cyan: '#7dcfff', pink: '#f7768e', gold: '#e0af68', green: '#9ece6a', metal: '#9aa5ce', purple: '#bb9af7' };
const ACCENTS = { star: C.pink, brick: C.cyan, pong: C.green, snake: C.gold, race: '#ff9e64' };

export class ClubBasementRoom {
  constructor(room) {
    this.room = room; room.at(0, 0);
    const carpet = document.createElement('canvas'); carpet.width = carpet.height = 128;
    const ctx = carpet.getContext('2d'); ctx.fillStyle = '#1f1b33'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#2b2547';
    for (let y = 0; y < 128; y += 16) for (let x = 0; x < 128; x += 16) ctx.fillRect(x + (y / 16 % 2) * 8, y, 8, 8);
    ctx.fillStyle = '#f7768e55'; ctx.fillRect(60, 60, 8, 8);
    const texture = new THREE.CanvasTexture(carpet); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(12, 7); texture.magFilter = THREE.NearestFilter;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(BASEMENT.width, BASEMENT.depth), new THREE.MeshLambertMaterial({ map: texture }));
    floor.name = 'basement-floor'; floor.rotation.x = -Math.PI / 2; floor.position.set(BASEMENT.x, -.02, BASEMENT.z); room.root.add(floor);
    room.box(BASEMENT.x, 3.25, BASEMENT.z, BASEMENT.width, .12, BASEMENT.depth, '#14121f');
    for (let z = 37; z <= 47; z += 2.5) {
      room.box(BASEMENT.x, 3.12, z, BASEMENT.width - 1, .07, .16, '#343b58');
      for (let x = -10; x <= 10; x += 4) room.box(x, 3.05, z, 1.5, .03, .3, (x + z) % 2 ? C.pink : C.cyan, true);
    }
    for (let x = -11; x <= 11; x += 2) {
      room.box(x, .006, BASEMENT.z, .05, .012, BASEMENT.depth - .6, x % 4 ? '#2d2849' : '#f7768e33');
    }
    room.sign(['BASEMENT ARCADE', '8 CABINETS · FREE PLAY'], 0, 2.62, 35.28, 6, C.pink);
    room.sign(['ELEVATOR · B1', 'CLUB · ROOFTOP'], 0, 2.72, 46.05, 2.6, C.cyan, Math.PI);
    room.box(4.5, .28, 42.5, 2.4, .08, 1.4, '#3a3348');
    for (const x of [-1, 1]) for (const z of [-1, 1]) room.box(4.5 + x * 1.05, .12, 42.5 + z * .55, .16, .24, .16, '#565f89');
    for (const [x, z] of [[3.7, 41.6], [5.3, 41.6], [3.7, 43.4], [5.3, 43.4]]) room.box(x, .25, z, .42, .5, .42, '#59465a');
    this.teamBoard = room.plane(commandBoard(BASEMENT_CREW, 'BASEMENT ARCADE', 'HIGH SCORES · FREE PLAY · SNACKS'), 6.4, 2, -8, 1.9, 48.76, Math.PI);
    this.teamBoard.name = 'basement-team-board';
    this.posters();
    this.elevator();
  }

  posters() {
    const room = this.room;
    const posters = [
      ['STAR PATROL II', 'CLEAR THE FORMATION', C.pink], ['BRICK BREAK II', 'THREE LIVES', C.cyan],
      ['BASEMENT PONG', 'FIRST TO FIVE', C.green], ['SNAKE PIT', 'EAT AND GROW', C.gold],
    ];
    posters.forEach(([title, detail, color], i) => {
      const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 320;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#0f0e1a'; ctx.fillRect(0, 0, 256, 320);
      ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.strokeRect(6, 6, 244, 308);
      ctx.textAlign = 'center'; ctx.fillStyle = color; ctx.font = `${title.length > 14 ? 26 : 30}px "Courier New", monospace`; ctx.fillText(title, 128, 70);
      for (let y = 0; y < 6; y++) for (let x = 0; x < 7; x++) if ((x * 5 + y * 3 + i) % 4 < 2) { ctx.fillStyle = [C.pink, C.cyan, C.gold, C.green][(x + i) % 4]; ctx.fillRect(48 + x * 23, 100 + y * 23, 17, 17); }
      ctx.fillStyle = C.paper; ctx.font = '15px "Courier New", monospace'; ctx.fillText(detail, 128, 282);
      room.plane(canvas, 1.3, 1.625, -8.25 + i * 5.5, 1.95, 48.74, Math.PI);
    });
  }

  directory(target, width, height) {
    const room = this.room; const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 448;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, 384, 448);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 376, 440);
    ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.font = 'bold 34px "Courier New", monospace';
    ctx.fillText('FLOOR B1', 192, 70);
    ctx.fillStyle = C.paper; ctx.font = '24px "Courier New", monospace';
    ['BASEMENT', 'THE CLUB', 'ROOFTOP'].forEach((line, i) => ctx.fillText(line, 192, 165 + i * 48));
    ctx.fillStyle = C.green; ctx.font = 'bold 26px "Courier New", monospace'; ctx.fillText('SELECT A FLOOR', 192, 400);
    const mesh = room.plane(canvas, width, height, target.x, target.height, target.z, Math.PI);
    mesh.name = target.id; mesh.userData.id = target.id; room.targets.push(mesh); return mesh;
  }

  elevator() {
    const room = this.room; room.at(0, 0);
    room.box(-1.7, 1.5, 47.6, .18, 3, 2.8, C.metal); room.box(1.7, 1.5, 47.6, .18, 3, 2.8, C.metal);
    room.box(0, 1.5, 48.85, 3.6, 3, .18, '#565f89'); room.box(0, 3.05, 47.6, 3.6, .1, 2.8, C.metal);
    room.box(0, .008, 47.6, 3.2, .015, 2.6, '#414868'); room.box(0, .025, 46.18, 3.2, .015, .1, C.cyan, true);
    for (const x of [-1.5, 1.5]) room.box(x, 1.5, 46.25, .1, 2.9, .08, '#343b58');
    room.box(0, 2.95, 47.6, 2, .025, .5, '#e5e9ff', true);
    room.box(0, 2.2, 48.74, 2.4, .5, .06, '#343b58');
    room.box(BASEMENT_ELEVATOR.x, BASEMENT_ELEVATOR.height, BASEMENT_ELEVATOR.z + .05, .33, .55, .06, C.metal);
    this.call = this.directory(BASEMENT_ELEVATOR, .28, .48);
    this.cabin = this.directory(BASEMENT_ELEVATOR_CABIN, .84, .98);
  }

  cabinet(station, title, accent) {
    const room = this.room;
    room.box(0, .82, 0, .92, 1.64, .88, '#24283b');
    room.box(-.46, 1, .02, .07, 2, 1.06, accent); room.box(.46, 1, .02, .07, 2, 1.06, accent);
    room.crt(station, 1.42, .62, .45, .09, '#16161e');
    room.box(0, .95, .53, .94, .12, .4, '#343b58');
    room.box(-.21, 1.07, .55, .035, .19, .035, '#9aa5ce'); room.box(-.21, 1.17, .55, .08, .07, .08, accent);
    room.box(.12, 1.03, .58, .065, .03, .065, C.pink); room.box(.24, 1.03, .58, .065, .03, .065, C.cyan);
    room.box(0, .45, .456, .16, .23, .014, '#16161e'); room.box(0, .47, .469, .06, .018, .008, C.gold, true);
    room.sign([title, 'FREE PLAY'], 0, 1.91, .52, .94, accent);
  }

  bench(station) {
    const room = this.room; room.at(station.x, station.z, station.yaw);
    if (station.software === 'leaderboard') {
      room.box(0, 1.6, 0, 5.5, 2.6, .3, '#24283b');
      room.box(0, 1.6, .17, 5.2, 2.3, .05, '#16161e');
      room.crt(station, 1.6, 4.6, 1.9, -.02, '#16161e', true);
      room.sign(['HIGH SCORE WALL', 'LOCAL CLUB BEST'], 0, 2.95, .2, 3, C.gold);
    } else if (station.software === 'snacks') {
      room.box(0, 1, 0, 2.4, 2, 1, '#4d3f45');
      room.box(0, 1.5, .52, 1.8, 1, .05, '#16161e');
      room.crt(station, 1.5, 1.4, .8, .3, '#16161e', true);
      for (let i = 0; i < 3; i++) room.box(-.5 + i * .5, .62, .55, .3, .12, .08, [C.pink, C.green, C.cyan][i]);
      room.sign(['SNACK BAR', 'FREE SODA'], 0, 2.15, .55, 1.8, C.green);
    } else {
      this.cabinet(station, station.name.toUpperCase(), ACCENTS[station.software] || C.gold);
    }
    const target = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.3), room.art.pickMaterial);
    target.position.set(station.x, 1.1, station.z); target.rotation.y = station.yaw; target.userData.id = station.id;
    room.root.add(target); room.targets.push(target);
    room.at(0, 0);
  }
}
