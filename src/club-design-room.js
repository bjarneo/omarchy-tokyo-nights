import * as THREE from '../assets/three.module.js';
import { DESIGN_STUDIO, DESIGN_CREW, DESIGN_DESKS } from './club-design.mjs';
import { drawDesignPoster, designStudy } from './club-design-art.js';
import { commandBoard } from './club-team-art.js';

const C = { paper: '#e6dec6', case: '#b7b29a', wood: '#80604b', ink: '#24283b', cyan: '#7dcfff', gold: '#e0af68', pink: '#f7768e' };

export class ClubDesignRoom {
  constructor(room) {
    this.room = room; room.at(0, 0);
    room.box(18, -.045, 21, 18, .06, 14, '#87735d');
    for (let z = 14.5; z < 28; z += 1) room.box(18, -.011, z, 18, .008, .013, '#a28e75');
    room.box(18, 4.63, 21, 18, .14, 14, '#6c675d');
    room.box(9.21, 2.3, 21, .03, 4.6, 14, '#beb8a8');
    for (const x of [12, 18, 24]) for (const z of [17, 23, 26]) {
      room.box(x, 4.41, z, 2.6, .12, .55, C.ink); room.box(x, 4.33, z, 2.4, .025, .4, '#e6dec6', true);
    }
    for (const side of [-1, 1]) {
      const x = DESIGN_STUDIO.doorX + side * DESIGN_STUDIO.doorWidth / 2;
      room.box(x, 1.58, 14, .08, 3.16, .45, C.wood);
      room.box(x - side * .035, 1.58, 13.75, .025, 3.12, .035, C.gold, true);
    }
    room.box(12.5, -.005, 14, 3.35, .018, .4, C.paper);
    room.sign(['DESIGN STUDIO', 'COLOR · TYPE · SPACE'], 12.5, 3.83, 13.76, 3.7, C.gold, Math.PI);
    room.sign(['BACK TO THE CLUB', 'GAMES · MUSIC · SECURITY'], 12.5, 3.83, 14.24, 3.7, C.cyan);
    this.studies = [
      { kind: 'color', x: 9.25, z: 17.8, yaw: Math.PI / 2, width: 4.9 },
      { kind: 'type', x: 22.8, z: 14.23, yaw: 0, width: 6.5, y: 2.7 },
      { kind: 'space', x: 26.77, z: 20.8, yaw: -Math.PI / 2, width: 6.1 },
    ].map((study) => {
      const canvas = designStudy(study.kind);
      const mesh = room.plane(canvas, study.width, study.width * 360 / 640, study.x, study.y || 2.88, study.z, study.yaw);
      mesh.name = `design-study-${study.kind}`; return { ...study, canvas, mesh };
    });
    this.teamBoard = room.plane(commandBoard(DESIGN_CREW, 'OMARCHY DESIGN', 'COLOR · TYPOGRAPHY · LAYOUT · ICONS · MOTION'), 7, 2.1875, 9.25, 2.9, 24.2, Math.PI / 2);
    this.teamBoard.name = 'design-team-board';
    this.makeEasel(); this.signature = '';
    this.fontReady = document.fonts.ready.then(() => {
      this.signature = '';
      for (const study of this.studies) { study.canvas.getContext('2d').drawImage(designStudy(study.kind), 0, 0); study.mesh.material.map.needsUpdate = true; }
    });
  }

  makeEasel() {
    const room = this.room; room.at(18, 21, -Math.PI * .75);
    room.box(0, 1.96, 0, 4, 2.4, .16, C.wood);
    room.box(0, 1.96, .085, 3.9, 2.3, .018, C.paper);
    for (const x of [-1.5, 1.5]) {
      room.box(x, .65, -.1, .09, 1.3, .1, C.wood); room.box(x, .07, -.1, .13, .14, .9, C.wood);
    }
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 576;
    const mesh = room.plane(canvas, 3.8, 2.1375, 0, 1.96, .105); mesh.name = 'design-live-poster';
    this.preview = { canvas, ctx: canvas.getContext('2d'), mesh, texture: mesh.material.map };
    room.sign(['LIVE STUDIO POSTER', 'CHANGE IT AT ANY DESK'], 0, .47, .10, 2.55, C.gold);
    room.at(0, 0);
  }

  bench(station) {
    const room = this.room; room.at(station.x, station.z, station.yaw);
    room.box(0, .76, 0, 2.25, .11, 1.18, C.paper);
    for (const x of [-.97, .97]) for (const z of [-.45, .45]) room.box(x, .37, z, .07, .74, .07, C.wood);
    room.crt(station, 1.35, .88, .66, -.22, C.case); room.keyboard(0, .85, .36, .84, C.case);
    room.box(.78, .85, .34, .14, .07, .21, C.case);
    for (let i = 0; i < 4; i++) {
      room.box(-.86 + i * .085, .84 + i * .025, -.06, .2, .018, .31, ['#9ece6a', C.pink, C.gold, C.cyan][i]);
    }
    const sign = room.sign([DESIGN_DESKS[station.studio].title.toUpperCase(), 'CHANGE THE LIVE POSTER'], 0, .64, .611, 1.8, C.gold);
    sign.userData.id = station.id; room.targets.push(sign);
    const target = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.8, 1.18), room.art.pickMaterial);
    target.position.set(station.x, .9, station.z); target.rotation.y = station.yaw; target.userData.id = station.id;
    room.root.add(target); room.targets.push(target);
  }

  update(state, reducedMotion) {
    const signature = [state.palette, state.type, state.layout, state.icon, state.motion, state.motion && !reducedMotion ? Math.floor(state.clock * 10) : 0].join(':');
    if (signature === this.signature) return;
    this.signature = signature;
    drawDesignPoster(this.preview.ctx, state, 1024, 576, reducedMotion); this.preview.texture.needsUpdate = true;
  }
}
