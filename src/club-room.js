import * as THREE from '../assets/three.module.js';
import { CLUB, STATIONS, CLUB_CREW, FURNITURE, WALLS, MALIBU } from './club-data.mjs';
import { ClubAvatarFactory } from './club-avatars.js';
import { CREW_GESTURES } from './club-motion.mjs';
import { addOpenSourceWalls } from './club-logo-wall.js';
import { MalibuCorner } from './club-malibu.js';

const C = { wood: '#80604b', darkWood: '#503d36', beige: '#b7b29a', edge: '#777b73', plastic: '#d5d1b9', ink: '#16161e', dark: '#24283b', cyan: '#7dcfff', pink: '#f7768e', gold: '#e0af68', green: '#9ece6a', paper: '#c0caf5' };

export class ClubRoom {
  constructor(art) {
    this.art = art;
    this.avatarFactory = new ClubAvatarFactory(art);
    this.root = new THREE.Group();
    this.boxes = []; this.lamps = [];
    this.screens = new Map(); this.targets = []; this.characters = [];
    this.frame = { x: 0, z: 0, yaw: 0 };
    this.buildRoom();
    STATIONS.forEach((station) => this.buildStation(station));
    FURNITURE.forEach((item) => this.buildFurniture(item));
    this.buildCharacters();
    addOpenSourceWalls(this);
    this.commitBoxes(this.boxes, false);
    this.commitBoxes(this.lamps, true);
  }

  at(x, z, yaw = 0) { this.frame = { x, z, yaw }; }

  box(x, y, z, w, h, d, color, light = false, yaw = 0) {
    const f = this.frame;
    (light ? this.lamps : this.boxes).push({ x: f.x + x * Math.cos(f.yaw) + z * Math.sin(f.yaw), y, z: f.z + z * Math.cos(f.yaw) - x * Math.sin(f.yaw), w, h, d, color, yaw: f.yaw + yaw });
  }

  commitBoxes(items, basic) {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), basic ? new THREE.MeshBasicMaterial({ color: 0xffffff }) : new THREE.MeshLambertMaterial({ color: 0xffffff }), items.length);
    const transform = new THREE.Object3D(); const color = new THREE.Color();
    items.forEach((item, index) => {
      transform.position.set(item.x, item.y, item.z); transform.scale.set(item.w, item.h, item.d); transform.rotation.set(0, item.yaw, 0); transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix); mesh.setColorAt(index, color.set(item.color));
    });
    mesh.computeBoundingSphere(); this.root.add(mesh);
  }

  plane(canvas, width, height, x, y, z, yaw = 0) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false }));
    const f = this.frame;
    mesh.position.set(f.x + x * Math.cos(f.yaw) + z * Math.sin(f.yaw), y, f.z + z * Math.cos(f.yaw) - x * Math.sin(f.yaw));
    mesh.rotation.y = yaw + f.yaw;
    this.root.add(mesh);
    return mesh;
  }

  sign(lines, x, y, z, width = 2, color = C.cyan, yaw = 0) {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 160;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, 512, 160);
    ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(3, 3, 506, 154);
    ctx.textAlign = 'center';
    lines.forEach((line, i) => { ctx.fillStyle = i ? '#c0caf5' : color; ctx.font = `${i ? 24 : 34}px "Courier New", monospace`; ctx.fillText(line, 256, 58 + i * 49); });
    return this.plane(canvas, width, width * 160 / 512, x, y, z, yaw);
  }

  omarchyWall() {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 256;
    const sign = this.plane(canvas, 8.4, 2.8, 0, 3, -13.74);
    sign.name = 'omarchy-club-wall';
    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = C.ink; ctx.fillRect(0, 0, 768, 256);
      ctx.strokeStyle = C.green; ctx.lineWidth = 5; ctx.strokeRect(3, 3, 762, 250);
      const logo = this.art.renderer.logo;
      if (logo) {
        const width = Math.min(640, 170 * logo.width / logo.height);
        const height = width * logo.height / logo.width;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(logo, (768 - width) / 2, 24 + (170 - height) / 2, width, height);
      } else {
        ctx.fillStyle = C.paper; ctx.font = '64px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText('OMARCHY', 384, 130);
      }
      ctx.fillStyle = C.gold; ctx.font = '26px "Courier New", monospace'; ctx.textAlign = 'center';
      ctx.fillText('MIDNIGHT COMPUTER CLUB · 1989', 384, 229);
      sign.material.map.needsUpdate = true;
    };
    draw(); this.logoReady = this.art.ready.then(draw);
    return sign;
  }

  buildRoom() {
    this.at(0, 0);
    const carpet = document.createElement('canvas'); carpet.width = carpet.height = 128;
    const ctx = carpet.getContext('2d'); ctx.fillStyle = '#29283c'; ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 4) for (let x = 0; x < 128; x += 4) { ctx.fillStyle = (x + y) % 8 ? '#303044' : '#262638'; ctx.fillRect(x, y, 2, 3); }
    ctx.strokeStyle = '#5b465f'; ctx.lineWidth = 3;
    for (const x of [16, 80]) { ctx.strokeRect(x, 16, 31, 31); ctx.strokeRect(x + 11, 76, 31, 31); }
    ctx.fillStyle = '#7aa2f750'; ctx.fillRect(30, 30, 5, 5); ctx.fillStyle = '#f7768e60'; ctx.fillRect(105, 90, 5, 5);
    const texture = new THREE.CanvasTexture(carpet); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(24, 19); texture.magFilter = THREE.NearestFilter;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(CLUB.width, CLUB.depth), new THREE.MeshLambertMaterial({ map: texture }));
    floor.renderOrder = -20; floor.material.depthWrite = false;
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.02; this.root.add(floor);
    for (const wall of WALLS) {
      if (wall.id === 'north-wall') {
        const width = 18 + MALIBU.northStart; const windowWidth = 18 - MALIBU.northStart;
        this.box(-18 + width / 2, 2.3, -14, width, 4.6, .35, '#736f70');
        this.box(-18 + width / 2, .55, -14, width, 1.1, .41, C.darkWood);
        this.box(MALIBU.northStart + windowWidth / 2, (4.6 + MALIBU.lintel) / 2, -14, windowWidth, 4.6 - MALIBU.lintel, .35, '#736f70');
        this.box(MALIBU.northStart + windowWidth / 2, MALIBU.sill / 2, -14, windowWidth, MALIBU.sill, .35, '#a6a7a1');
        continue;
      }
      if (wall.id === 'east-wall') {
        const depth = 14 - MALIBU.eastEnd; const windowDepth = 14 + MALIBU.eastEnd;
        this.box(18, 2.3, MALIBU.eastEnd + depth / 2, .35, 4.6, depth, '#736f70');
        this.box(18, .55, MALIBU.eastEnd + depth / 2, .41, 1.1, depth, C.darkWood);
        this.box(18, (4.6 + MALIBU.lintel) / 2, -14 + windowDepth / 2, .35, 4.6 - MALIBU.lintel, windowDepth, '#736f70');
        this.box(18, MALIBU.sill / 2, -14 + windowDepth / 2, .35, MALIBU.sill, windowDepth, '#a6a7a1');
        continue;
      }
      this.box(wall.x, wall.height / 2, wall.z, wall.width, wall.height, wall.depth, '#736f70');
      this.box(wall.x, .55, wall.z, wall.width + .06, 1.1, wall.depth + .06, C.darkWood);
    }
    this.box(0, 4.63, 0, 36, .14, 28, '#49444a');
    for (let z = -12; z <= 12; z += 4) {
      this.box(0, 4.4, z, 36, .18, .2, '#55505a');
      for (let x = -15; x <= 15; x += 6) {
        this.box(x, 4.47, z, 1.6, .09, .65, '#343b58');
        this.box(x, 4.4, z, 1.42, .035, .48, '#e0cfaa', true);
      }
    }
    for (let z = -12.5; z <= 12; z += 1.2) {
      this.box(-17.78, .55, z, .04, 1.05, .035, '#9b7860');
      if (z > MALIBU.eastEnd) this.box(17.78, .55, z, .04, 1.05, .035, '#9b7860');
    }
    this.omarchyWall();
    this.sign(['AMIGA & 8-BIT LAB', 'DISKS · DEMOS · BASIC'], 10.2, 3.15, -13.76, 5.5, C.cyan);
    this.sign(['THE BBS CORNER', '1200 BAUD · LOCAL TERMINAL'], -11.6, 3.15, -13.76, 7, C.green);
    this.sign(['NINTENDO & SEGA', 'CARTRIDGES · CRTs · CONTROLLERS'], 17.76, 3.1, 6.6, 6, C.pink, -Math.PI / 2);
    this.sign(['ARCADE ROW', 'ORIGINAL CLUB GAMES'], -12.8, 3.75, 6, 4, C.cyan);
    this.sign(['OPEN SOURCE CLUB', 'SHARE CODE · MAKE THINGS'], 0, 3.85, 13.74, 2.7, C.gold, Math.PI);
    this.sign(['EXIT TO THE GARAGE', 'TOKYO NIGHTS'], 0, 2.8, 13.75, 4, C.cyan, Math.PI);
    this.box(0, 1.2, 13.8, 2, 2.4, .08, '#33333e');
    this.box(.75, 1, 13.69, .12, .06, .05, C.gold);
    this.buildPosters();
    for (const x of [-16.5, 16.5]) {
      this.box(x, .28, 12.2, .7, .56, .7, '#755246');
      for (let i = 0; i < 7; i++) this.box(x + Math.sin(i * 2) * .25, .95 + i * .075, 12.2 + Math.cos(i * 2) * .22, .16, .75, .12, '#547451', false, i);
    }
  }

  buildPosters() {
    const posters = [
      ['AMIGA 500', '1987', '#315ac8'], ['NINTENDO', 'PLAY WITH TWO CONTROLLERS', '#a8404c'],
      ['10 PRINT "HELLO"', '20 GOTO 10', '#2b594a'], ['FLOPPY DISK LIBRARY', 'LABEL EACH DISK', '#735d40'],
      ['MIDI IN / OUT', 'ATARI ST · 1985', '#475b77'], ['GAME BOY', 'FOUR SHADES OF GREEN', '#67794d'],
    ];
    posters.forEach(([title, detail, color], i) => {
      const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 320;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#d5d1b9'; ctx.fillRect(0, 0, 256, 320); ctx.fillStyle = color; ctx.fillRect(10, 10, 236, 250);
      ctx.textAlign = 'center'; ctx.fillStyle = '#e5e9ff'; ctx.font = `${title.length > 18 ? 16 : 24}px "Courier New", monospace`; ctx.fillText(title, 128, 45);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 9; x++) if ((x * 7 + y * 3 + i) % 5 < 3) { ctx.fillStyle = [C.pink, C.cyan, C.gold, '#e5e9ff'][(x + i) % 4]; ctx.fillRect(39 + x * 20, 74 + y * 20, 15, 15); }
      ctx.fillStyle = '#24283b'; ctx.font = '13px "Courier New", monospace'; ctx.fillText(detail, 128, 291);
      const side = i % 2 ? 1 : -1;
      this.plane(canvas, 1.6, 2, side * 5.64, 2.4, -12 + Math.floor(i / 2) * 3, side < 0 ? -Math.PI / 2 : Math.PI / 2);
    });
  }

  keyboard(x, y, z, width = .75, color = C.plastic, darkKeys = false) {
    this.box(x, y, z, width, .07, .3, color);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) this.box(x - width * .44 + col * width * .078, y + .05, z - .1 + row * .06, width * .059, .025, .044, darkKeys ? '#33343d' : '#ddd7bd');
    this.box(x, y + .05, z + .15, width * .45, .025, .04, darkKeys ? '#535663' : '#d5d1b9');
  }

  controller(x, y, z, kind = 'nes') {
    this.box(x, y, z, .31, .045, .13, kind === 'famicom' ? '#8f3543' : '#b7b8ad');
    this.box(x - .09, y + .03, z, .07, .02, .025, '#16161e'); this.box(x - .09, y + .03, z, .025, .02, .07, '#16161e');
    this.box(x + .08, y + .03, z, .035, .015, .035, '#b53d51'); this.box(x + .13, y + .03, z, .035, .015, .035, '#b53d51');
    this.box(x, y, z - .3, .012, .012, .5, '#16161e');
  }

  crt(station, y, width = .68, height = .51, z = -.08, caseColor = C.beige, lcd = false) {
    if (!lcd) {
    this.box(0, y, z - .08, width + .18, height + .19, .53, caseColor);
    this.box(0, y, z + .194, width + .05, height + .05, .035, '#333b3b');
    this.box(0, y - height / 2 - .14, z - .1, width * .68, .08, .36, C.edge);
    this.box(width / 2 + .045, y - height / 2 + .015, z + .218, .018, .018, .008, C.green, true);
    }
    const geometry = new THREE.BufferGeometry(); const vertices = []; const uvs = []; const indices = [];
    const cols = 16; const rows = 12;
    for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
      const u = col / cols; const v = row / rows;
      vertices.push((u - .5) * width, (v - .5) * height, (lcd ? 0 : .025) * (1 - (2 * u - 1) ** 2) * (1 - (2 * v - 1) ** 2)); uvs.push(u, v);
      if (row < rows && col < cols) { const n = row * (cols + 1) + col; indices.push(n, n + 1, n + cols + 1, n + 1, n + cols + 2, n + cols + 1); }
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices);
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 192;
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.LinearFilter; texture.generateMipmaps = false;
    const screen = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
    const f = this.frame; screen.position.set(f.x + (z + .22) * Math.sin(f.yaw), y, f.z + (z + .22) * Math.cos(f.yaw)); screen.rotation.y = f.yaw;
    screen.userData = { id: station.id, screen: true }; this.root.add(screen); this.targets.push(screen);
    this.screens.set(station.id, { canvas, ctx: canvas.getContext('2d'), texture, mesh: screen });
  }

  buildStation(station) {
    if (station.kind === 'malibu') { this.malibu = new MalibuCorner(this, station); return; }
    this.at(station.x, station.z, station.yaw);
    const color = station.id === 'spectrum' ? '#30313c' : station.id === 'c64' ? '#aaa084' : station.id === 'cpc464' ? '#404950' : C.beige;
    if (station.kind === 'video') {
      this.box(0, .27, 0, 3.4, .54, 1.25, C.darkWood);
      this.box(0, 1.74, 0, 3.42, 2.44, 1.17, C.wood);
      this.box(0, 1.74, .59, 3.22, 2.22, .045, C.dark);
      this.crt(station, 1.74, 2.75, 2.06, .39, C.ink);
      for (let i = 0; i < 12; i++) this.box(1.55, 1.1 + i * .1, .625, .09, .027, .01, C.edge);
      this.box(1.55, .88, .65, .1, .1, .045, C.gold);
      this.box(1.55, .69, .65, .055, .04, .045, C.green, true);
      this.sign(['CLUB CINEMA', 'OMACON 2026 · YOUTUBE'], 0, 3.01, .61, 1.55, C.gold);
    } else if (station.kind === 'jukebox') {
      this.box(0, 1.16, 0, 1.6, 2.32, .92, C.darkWood);
      this.box(0, 1.21, .473, 1.43, 2.1, .03, C.ink);
      for (const side of [-1, 1]) {
        this.box(side * .81, 1.17, .15, .08, 2.34, .91, C.gold);
        this.box(side * .72, 1.22, .5, .025, 2.15, .025, C.cyan, true);
      }
      this.box(0, 2.32, .15, 1.7, .08, .91, C.gold);
      this.crt(station, 1.47, .95, .7, .28, C.dark);
      this.sign(['OMARCHY RADIO', 'SELECT A TRACK'], 0, 2.11, .51, 1.38, C.gold);
      for (let i = 0; i < 6; i++) this.box(-.45 + i * .18, 1.01, .51, .13, .07, .08, i === 0 ? C.gold : C.paper);
      for (let i = 0; i < 13; i++) this.box(0, .21 + i * .052, .5, 1.25, .018, .018, C.edge);
      this.box(0, .11, .15, 1.7, .16, 1, C.dark);
    } else if (station.kind === 'arcade') {
      const accent = station.id === 'star-patrol' ? C.pink : station.id === 'brick-break' ? C.cyan : C.gold;
      this.box(0, .82, 0, .92, 1.64, .88, '#24283b');
      this.box(-.46, 1, .02, .07, 2, 1.06, accent); this.box(.46, 1, .02, .07, 2, 1.06, accent);
      this.crt(station, 1.42, .62, .45, .09, '#16161e');
      this.box(0, .95, .53, .94, .12, .4, '#343b58');
      this.box(-.21, 1.07, .55, .035, .19, .035, '#9aa5ce'); this.box(-.21, 1.17, .55, .08, .07, .08, accent);
      this.box(.12, 1.03, .58, .065, .03, .065, C.pink); this.box(.24, 1.03, .58, .065, .03, .065, C.cyan);
      this.box(0, .45, .456, .16, .23, .014, '#16161e'); this.box(0, .47, .469, .06, .018, .008, C.gold, true);
      this.sign([station.name.toUpperCase(), 'FREE PLAY'], 0, 1.91, .52, .94, accent);
    } else {
      this.box(0, .76, 0, 2.25, .11, 1.18, C.wood);
      for (const x of [-.97, .97]) for (const z of [-.45, .45]) this.box(x, .37, z, .08, .74, .08, '#4c4140');
      if (['nes', 'famicom', 'master', 'mega', 'atari'].includes(station.kind)) {
        this.crt(station, 1.38, .92, .69, -.18, '#424854');
        const consoleColor = station.kind === 'famicom' ? '#e4d3b0' : station.kind === 'nes' ? '#adb4b6' : '#232932';
        this.box(0, .88, .38, .58, .16, .31, consoleColor);
        this.box(0, .965, .34, .24, .035, .17, '#16161e');
        if (station.kind === 'atari') this.box(0, .88, .55, .58, .1, .025, '#9b6943');
        if (station.kind === 'famicom') { this.box(-.22, .88, .38, .13, .17, .34, '#9d3546'); this.box(.22, .88, .38, .13, .17, .34, '#9d3546'); }
        this.box(-.22, .865, .55, .045, .025, .015, C.pink, true);
        this.controller(-.76, .84, .31, station.kind); this.controller(.76, .84, .31, station.kind);
        for (let i = 0; i < 3; i++) { this.box(.65 + i * .12, .91 + i * .025, -.35, .2, .06, .26, i % 2 ? '#4c535c' : '#946154'); }
      } else if (station.kind === 'gameboy') {
        this.box(0, 1.025, .22, .25, .4, .095, '#c4c6b7');
        this.box(0, 1.115, .269, .19, .16, .012, '#6c7479');
        this.crt(station, 1.115, .14, .125, .059, '#8b938b', true);
        this.box(-.068, .965, .274, .076, .024, .014, '#30383b'); this.box(-.068, .965, .274, .024, .076, .014, '#30383b');
        this.box(.045, .958, .276, .033, .033, .014, '#8f435f'); this.box(.085, .983, .276, .033, .033, .014, '#8f435f');
        for (let i = 0; i < 5; i++) this.box(.018 + i * .02, .873, .271, .007, .04, .006, '#596169');
      } else if (station.kind === 'boombox') {
        this.box(0, 1.1, -.1, 1.65, .59, .4, '#404650');
        this.box(0, 1.46, -.1, 1.25, .06, .07, '#16161e');
        for (const side of [-1, 1]) { this.box(side * .58, 1.1, .112, .42, .44, .018, '#16161e'); for (let y = 0; y < 8; y++) this.box(side * .58, .94 + y * .045, .13, .35, .015, .01, '#565f89'); }
        this.crt(station, 1.13, .48, .25, -.11, '#343b58');
        for (let i = 0; i < 5; i++) this.box(-.21 + i * .105, .86, .12, .075, .06, .09, i === 0 ? '#f7768e' : '#c0caf5');
      } else if (station.kind === 'mac') {
        this.box(0, 1.17, -.11, .59, .75, .53, C.plastic);
        this.crt(station, 1.39, .4, .31, .004, C.plastic);
        this.box(.1, 1, .172, .24, .025, .025, '#343b58');
        this.keyboard(0, .86, .4, .68); this.box(.68, .86, .32, .13, .07, .2, C.plastic);
      } else {
        if (station.kind === 'desktop') this.box(0, .9, -.12, 1.13, .21, .68, color);
        this.crt(station, station.kind === 'desktop' ? 1.42 : 1.25, .64, .48, -.2, color);
        this.keyboard(0, .86, .35, station.id === 'cpc464' ? 1.17 : .84, color, ['spectrum', 'c64', 'cpc464'].includes(station.id));
        if (station.id === 'spectrum') for (let i = 0; i < 4; i++) this.box(.26 + i * .024, .902, .27, .021, .012, .13, [C.pink, C.gold, C.green, C.cyan][i], true);
        this.box(.83, .86, .29, .14, .07, .2, color);
        this.box(-.86, .9, -.13, .32, .18, .4, color); this.box(-.86, .92, .075, .23, .027, .016, '#16161e');
        this.box(-.96, .89, .088, .02, .02, .01, C.green, true);
        if (station.software === 'bbs') {
          this.box(.8, 1.02, -.25, .34, .13, .37, '#c1b8a2');
          for (let i = 0; i < 5; i++) this.box(.68 + i * .055, 1.025, -.056, .014, .015, .01, i % 2 ? C.pink : C.green, true);
        }
      }
      const caption = this.sign([station.name.toUpperCase(), `${station.year}`], 0, .69, .602, 1.06, '#c0caf5');
      caption.userData.id = station.id; this.targets.push(caption);
      this.box(-.85, .89, .33, .16, .1, .22, '#353a51');
      this.box(-.85, .949, .34, .12, .014, .11, C.paper);
      this.box(.72, .87, -.48, .55, .07, .27, '#bda36d');
    }
    const target = new THREE.Mesh(new THREE.BoxGeometry(station.kind === 'video' ? 3.5 : station.kind === 'arcade' ? 1.05 : 1.7, station.kind === 'video' ? 3.1 : station.kind === 'jukebox' ? 2.4 : station.kind === 'arcade' ? 2 : .9, station.kind === 'video' ? 1.35 : station.kind === 'arcade' ? 1.1 : 1.05), new THREE.MeshBasicMaterial({ visible: false }));
    target.position.set(station.x, station.kind === 'video' ? 1.55 : station.kind === 'jukebox' ? 1.2 : station.kind === 'arcade' ? 1 : 1.15, station.z); target.rotation.y = station.yaw;
    target.userData.id = station.id; this.root.add(target); this.targets.push(target);
  }

  buildFurniture(item) {
    if (item.kind === 'malibu-chair') return;
    this.at(item.x, item.z);
    if (item.kind === 'sofa') {
      this.box(0, .28, 0, item.width, .45, item.depth, item.color);
      this.box(0, .72, -.43, item.width, .48, .28, item.color);
      for (const side of [-1, 1]) this.box(side * (item.width / 2 - .12), .59, 0, .24, .38, item.depth, '#3c3b4a');
      for (let i = 0; i < 3; i++) this.box((i - 1) * (item.width - .5) / 3, .52, .06, (item.width - .56) / 3, .12, .78, item.color);
    } else if (item.kind === 'shelf') {
      this.box(0, item.height / 2, -item.depth / 2 + .04, item.width, item.height, .08, C.darkWood);
      for (const side of [-1, 1]) this.box(side * (item.width / 2 - .04), item.height / 2, 0, .08, item.height, item.depth, C.wood);
      for (let row = 0; row < 5; row++) {
        const y = .15 + row * .53;
        this.box(0, y, 0, item.width, .06, item.depth, C.wood);
        for (let col = 0; col < Math.floor(item.width / .12) - 1; col++) {
          const x = -item.width / 2 + .13 + col * .12;
          this.box(x, y + .23, .02, .095, .4, item.depth * .7, ['#63745e', '#6c698f', '#aa745d', '#b6ad92'][(row + col) % 4]);
          this.box(x, y + .28, item.depth * .36 + .025, .055, .07, .015, '#d5d1b9');
        }
      }
    } else {
      this.box(0, item.height - .045, 0, item.width, .09, item.depth, item.color);
      for (const x of [-1, 1]) for (const z of [-1, 1]) this.box(x * (item.width / 2 - .09), item.height / 2, z * (item.depth / 2 - .09), .08, item.height, .08, C.darkWood);
      this.box(-.35, item.height + .025, .02, .54, .05, .39, '#bd9675');
      for (let i = 0; i < 3; i++) this.box(.24 + i * .19, item.height + .065, -.12, .12, .13, .12, ['#cc876b', '#687bab', '#b7ad6e'][i]);
      if (item.kind === 'bench') {
        this.box(.1, .855, -.12, 1.12, .06, .6, '#416558');
        for (let i = 0; i < 12; i++) this.box(-.3 + i % 6 * .13, .908, -.3 + Math.floor(i / 6) * .22, .07, .06, .12, '#292c39');
        this.box(1.2, .95, -.15, .45, .28, .5, '#b6ad92');
        this.box(1.2, 1.12, -.15, .38, .05, .38, '#c0caf5');
        for (let i = 0; i < 8; i++) this.box(1.2, .88 - i * .05, .45 + i * .03, .32, .02, .13, '#c0caf5');
        this.sign(['REPAIR BENCH', 'DISKS · CABLES · SPARE PARTS'], 0, 1.5, -.54, 2.1, C.gold);
      }
    }
  }

  buildCharacters() {
    this.at(0, 0);
    CLUB_CREW.forEach((npc, index) => {
      const avatar = this.avatarFactory.create({ ...npc, gesture: CREW_GESTURES[index] });
      avatar.position.set(npc.x, 0, npc.z);
      avatar.pickTarget.userData.id = npc.id;
      avatar.userData.homeYaw = 0;
      this.root.add(avatar); this.characters.push(avatar); this.targets.push(avatar.pickTarget);
    });
  }
}
