import * as THREE from '../assets/three.module.js';
import { SECURITY, SECURITY_CREW, SECURITY_LABS } from './club-security.mjs';
import { securityPoster, commandBoard } from './club-security-art.js';

const C = { dark: '#24283b', ink: '#16161e', metal: '#565f89', paper: '#c0caf5', pink: '#f7768e', cyan: '#7dcfff', gold: '#e0af68', green: '#9ece6a', purple: '#bb9af7' };

export class ClubSecurityRoom {
  constructor(room) {
    this.room = room; room.at(0, 0);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(SECURITY.width, SECURITY.depth), new THREE.MeshLambertMaterial({ color: '#283643' }));
    floor.name = 'security-floor'; floor.rotation.x = -Math.PI / 2; floor.position.set(0, -.02, SECURITY.z); room.root.add(floor);
    room.box(0, 4.63, 21, 18, .14, 14, '#343d48');
    for (let x = -8; x <= 8; x += 2) room.box(x, .002, 21, .018, .008, 14, '#3c4b58');
    for (let z = 14; z < 28; z += 2) room.box(0, .002, z, 18, .008, .018, '#3c4b58');
    room.box(-5.6, .009, 20.5, 5.4, .012, 11.5, '#49333e'); room.box(5.6, .009, 20.5, 5.4, .012, 11.5, '#30475f');
    for (const side of [-1, 1]) {
      const color = side < 0 ? C.pink : C.cyan;
      room.box(side * 2.85, .019, 20.5, .045, .012, 11.5, color, true);
      room.box(side * 1.72, 1.58, 14, .09, 3.16, .46, C.metal);
      room.box(side * 1.68, 1.58, 13.76, .025, 3.12, .035, color, true);
      for (const z of [17, 22, 26]) {
        room.box(side * 5.2, 4.38, z, 3.4, .13, .5, C.dark);
        room.box(side * 5.2, 4.30, z, 3.2, .03, .35, z === 26 ? C.paper : color, true);
      }
      this.rack(side * 7.3, 26.4, color);
    }
    room.box(0, .01, 14, 3.35, .015, .45, '#565f89');
    room.sign(['SECURITY ROOM', 'PENTEST · 0-DAY · DEFENSE'], 0, 3.83, 13.76, 3.7, C.green, Math.PI);
    room.sign(['BACK TO THE CLUB', 'LOUNGE · GAMES · MUSIC'], 0, 3.82, 14.24, 3.7, C.gold);
    this.posters = [
      { kind: 'red', x: -8.77, z: 19.1, yaw: Math.PI / 2, width: 5.5 },
      { kind: 'blue', x: 8.77, z: 19.1, yaw: -Math.PI / 2, width: 5.5 },
      { kind: 'zero', x: -8.77, z: 24.3, yaw: Math.PI / 2, width: 3.7 },
      { kind: 'forensics', x: 8.77, z: 24.3, yaw: -Math.PI / 2, width: 3.7 },
    ].map((poster) => {
      const mesh = room.plane(securityPoster(poster.kind), poster.width, poster.width * 360 / 640, poster.x, 2.93, poster.z, poster.yaw);
      mesh.name = `security-art-${poster.kind}`; return mesh;
    });
    this.board = room.plane(commandBoard(SECURITY_CREW), 8, 2.5, 0, 3.17, 27.76, Math.PI); this.board.name = 'security-team-board';
    this.makeVirus();
  }

  rack(x, z, color) {
    const room = this.room; room.at(x, z, Math.PI);
    room.box(0, 1.4, 0, 1.5, 2.8, 1, '#343b58'); room.box(0, 1.43, .512, 1.28, 2.5, .025, C.ink);
    for (let i = 0; i < 8; i++) {
      const y = .35 + i * .29;
      room.box(0, y, .545, 1.15, .22, .06, '#414868');
      for (let j = 0; j < 4; j++) room.box(-.4 + j * .2, y, .582, .12, .02, .01, '#16161e');
      room.box(.46, y, .585, .04, .035, .01, i % 3 ? color : C.green, true);
    }
    room.sign(['LAB NETWORK', 'LOCAL SIMULATION'], 0, 2.64, .57, 1.15, color);
    room.at(0, 0);
  }

  bench(station) {
    const room = this.room; const lab = SECURITY_LABS[station.lab]; room.at(station.x, station.z, station.yaw);
    room.box(0, .76, 0, 2.25, .11, 1.18, '#4d5567');
    room.box(0, .80, .58, 2.25, .025, .025, lab.accent, true);
    for (const x of [-.98, .98]) for (const z of [-.46, .46]) room.box(x, .37, z, .06, .74, .06, '#343b58');
    room.crt(station, 1.35, .88, .66, -.22, '#343b58'); room.keyboard(0, .85, .36, .88, '#565f89', true);
    room.box(.76, .88, .32, .14, .08, .21, '#9aa5ce');
    room.box(-.85, 1.1, -.14, .34, .55, .55, '#24283b');
    for (let i = 0; i < 5; i++) room.box(-.85, .95 + i * .08, .144, .25, .024, .018, i === 4 ? lab.accent : '#565f89', i === 4);
    const sign = room.sign([lab.title.toUpperCase(), 'SELECT TO START'], 0, .63, .611, 1.8, lab.accent);
    sign.userData.id = station.id; room.targets.push(sign);
    const target = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.8, 1.18), room.art.pickMaterial);
    target.position.set(station.x, .9, station.z); target.rotation.y = station.yaw; target.userData.id = station.id;
    room.root.add(target); room.targets.push(target);
  }

  makeVirus() {
    const room = this.room; const art = room.art;
    this.virus = new THREE.Group(); this.virus.name = 'byte-lab-virus'; room.root.add(this.virus);
    this.body = new THREE.Group(); this.virus.add(this.body);
    art.box(this.body, 0, 0, 0, .68, .53, .46, C.purple);
    art.box(this.body, 0, 0, 0, .48, .72, .44, C.purple);
    art.box(this.body, -.25, .11, .24, .10, .25, .03, '#9970c7');
    for (const side of [-1, 1]) {
      art.box(this.body, side * .19, .13, .25, .18, .17, .04, C.green, true);
      art.box(this.body, side * .19 + .025, .11, .279, .065, .11, .02, C.ink);
      art.box(this.body, side * .25, .43, 0, .06, .21, .06, C.purple);
      art.box(this.body, side * .3, .54, 0, .14, .08, .08, C.pink, true);
      art.box(this.body, side * .4, -.01, 0, .17, .065, .07, C.purple);
      art.box(this.body, side * .49, .055, 0, .065, .18, .07, C.pink);
    }
    art.box(this.body, 0, -.16, .25, .29, .065, .04, C.ink);
    art.box(this.body, -.08, -.13, .28, .05, .07, .025, C.paper);
    art.box(this.body, .08, -.13, .28, .05, .07, .025, C.paper);
    this.legs = [];
    for (const x of [-.24, 0, .24]) {
      const leg = new THREE.Group(); leg.position.set(x, -.3, 0);
      art.box(leg, 0, -.12, 0, .065, .27, .065, C.purple); art.box(leg, 0, -.25, .045, .15, .07, .15, C.pink);
      this.body.add(leg); this.legs.push(leg);
    }
    const tag = art.nameTag('BYTE · LAB VIRUS'); tag.position.y = .87; this.virus.add(tag); this.virus.tag = tag;
    const target = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.25, .65), art.pickMaterial);
    target.userData.id = 'byte-virus'; this.virus.add(target); room.targets.push(target);
    this.cage = new THREE.Group(); this.cage.name = 'byte-containment'; this.cage.position.set(0, 0, 21); room.root.add(this.cage);
    for (const x of [-.85, .85]) for (const z of [-.85, .85]) art.box(this.cage, x, 1.1, z, .026, 2.2, .026, C.cyan, true);
    for (const y of [.035, 2.2]) for (const side of [-1, 1]) {
      art.box(this.cage, side * .85, y, 0, .026, .026, 1.7, C.cyan, true);
      art.box(this.cage, 0, y, side * .85, 1.7, .026, .026, C.cyan, true);
    }
    const field = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.2, 1.7), new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: .07, depthWrite: false }));
    field.position.y = 1.1; this.cage.add(field); this.cage.visible = false;
  }

  update(virus, reducedMotion, viewer, engaged = false) {
    this.virus.position.set(virus.x, 1.05, virus.z);
    this.virus.rotation.y = virus.quarantined || engaged ? Math.atan2(viewer.x - virus.x, viewer.z - virus.z) : virus.yaw;
    const motion = reducedMotion || virus.quarantined ? 0 : Math.sin(virus.clock * 7);
    this.body.position.y = motion * .045; this.body.rotation.z = motion * .035;
    this.legs.forEach((leg, i) => { leg.rotation.x = motion * (i % 2 ? -.35 : .35); });
    this.cage.visible = virus.quarantined;
    this.virus.tag.visible = Math.hypot(viewer.x - virus.x, viewer.z - virus.z) < 9;
    if (this.virus.tag.visible) this.virus.tag.lookAt(viewer);
  }
}
