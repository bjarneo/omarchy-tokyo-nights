import * as THREE from '../assets/three.module.js';
import { makeFullCharacter } from './full-characters.js';
import { CLUB } from './club-data.mjs';
import { gestureAt } from './club-motion.mjs';

const EYE_ROW = { ryan: 19, krzysztof: 19, hancore: 18.5, outfoxxed: 19 };
const v = (x, y, z = 0) => new THREE.Vector3(x, y, z);

export class ClubAvatarFactory {
  constructor(art) { this.art = art; this.scratch = new THREE.Object3D(); this.color = new THREE.Color(); }

  pixels(id, facing = 'smile') {
    const canvas = makeFullCharacter(this.art.renderer.drivers[id][facing], id, { props: false });
    return { canvas, pixels: canvas.getContext('2d').getImageData(0, 0, 48, 104).data };
  }

  part(pixels, match, point, pivot, depth = .23) {
    const runs = [];
    for (let y = 0; y < 104; y++) for (let x = 0; x < 48;) {
      const offset = (y * 48 + x) * 4;
      if (pixels[offset + 3] < 128 || !match(x, y)) { x++; continue; }
      let width = 1;
      while (x + width < 48 && match(x + width, y)) {
        const next = offset + width * 4;
        if (pixels[next + 3] < 128 || pixels[next] !== pixels[offset] || pixels[next + 1] !== pixels[offset + 1] || pixels[next + 2] !== pixels[offset + 2]) break;
        width++;
      }
      runs.push({ x, y, width, r: pixels[offset], g: pixels[offset + 1], b: pixels[offset + 2] }); x += width;
    }
    const mesh = new THREE.InstancedMesh(this.art.cube, this.art.voxelMaterial, runs.length);
    const unit = point(1, 0).x - point(0, 0).x;
    runs.forEach((run, index) => {
      this.scratch.position.copy(point(run.x + run.width / 2, run.y + .5)).sub(pivot);
      this.scratch.rotation.set(0, 0, 0); this.scratch.scale.set(run.width * unit, unit, depth); this.scratch.updateMatrix();
      mesh.setMatrixAt(index, this.scratch.matrix);
      mesh.setColorAt(index, this.color.setRGB(run.r / 255, run.g / 255, run.b / 255, THREE.SRGBColorSpace));
    });
    mesh.computeBoundingSphere();
    return mesh;
  }

  create(npc) {
    const { pixels } = this.pixels(npc.id);
    let top = 104; let bottom = 0;
    for (let y = 0; y < 104; y++) for (let x = 0; x < 48; x++) if (pixels[(y * 48 + x) * 4 + 3] >= 128) { top = Math.min(top, y); bottom = Math.max(bottom, y + 1); }
    const unit = CLUB.playerHeight / (bottom - top);
    const point = (x, y, z = 0) => v((x - 24) * unit, (bottom - y) * unit, z);
    const avatar = new THREE.Group(); avatar.name = `club-character-${npc.id}`;
    avatar.userData = { characterId: npc.id, standingHeight: CLUB.playerHeight, eyeHeight: point(24, EYE_ROW[npc.id] || 18).y, gesture: npc.gesture };
    avatar.point = point;
    avatar.model = new THREE.Group(); avatar.add(avatar.model);
    const neck = point(24, 34);
    avatar.head = new THREE.Group(); avatar.head.position.copy(neck); avatar.faces = {};
    for (const facing of ['smile', 'profile', 'back']) {
      const face = this.part(this.pixels(npc.id, facing).pixels, (_, y) => y < 34, point, neck, .29);
      face.visible = facing === 'smile'; avatar.faces[facing] = face; avatar.head.add(face);
    }
    avatar.eye = new THREE.Object3D(); avatar.eye.position.copy(point(24, EYE_ROW[npc.id] || 18, .15).sub(neck)); avatar.head.add(avatar.eye);
    avatar.mouth = new THREE.Object3D(); avatar.mouth.position.copy(point(25, 25, .15).sub(neck)); avatar.head.add(avatar.mouth);
    avatar.model.add(avatar.head);
    avatar.model.add(this.part(pixels, (x, y) => y >= 34 && y < 70 && (y >= 65 || x >= 14 && x <= 34), point, v(0, 0)));
    avatar.arms = {};
    for (const [side, shoulderX, elbowX, handX] of [['left', 11, 9.5, 9.5], ['right', 36, 39, 40]]) {
      const belongs = (x) => side === 'left' ? x < 14 : x > 34;
      const shoulder = point(shoulderX, 36); const elbow = point(elbowX, 50); const hand = point(handX, 60);
      const upper = new THREE.Group(); upper.position.copy(shoulder);
      upper.add(this.part(pixels, (x, y) => belongs(x) && y >= 34 && y < 50, point, shoulder));
      const forearm = new THREE.Group(); forearm.position.copy(elbow).sub(shoulder);
      forearm.add(this.part(pixels, (x, y) => belongs(x) && y >= 50 && y < 65, point, elbow));
      upper.add(forearm); avatar.model.add(upper);
      avatar.arms[side] = { upper, forearm, shoulder, elbowVector: elbow.clone().sub(shoulder), handVector: hand.clone().sub(elbow) };
    }
    avatar.legs = [];
    for (const [left, x] of [[true, 18], [false, 32]]) {
      const hip = point(x, 70); const leg = new THREE.Group(); leg.position.copy(hip);
      leg.add(this.part(pixels, (px, y) => y >= 70 && (left ? px < 25 : px >= 25), point, hip, .18));
      avatar.model.add(leg); avatar.legs.push(leg);
    }
    avatar.tag = this.art.nameTag(npc.name.toUpperCase()); avatar.tag.position.y = CLUB.playerHeight + .17; avatar.add(avatar.tag);
    avatar.pickTarget = new THREE.Mesh(new THREE.BoxGeometry(.7, CLUB.playerHeight, .52), this.art.pickMaterial);
    avatar.pickTarget.position.y = CLUB.playerHeight / 2; avatar.pickTarget.userData.id = npc.id; avatar.add(avatar.pickTarget);
    if (npc.gesture === 'coffee') avatar.prop = this.coffee();
    if (npc.gesture === 'disk') avatar.prop = this.disk();
    if (npc.gesture === 'handheld') avatar.prop = this.handheld();
    if (avatar.prop) avatar.model.add(avatar.prop);
    if (npc.id === 'dhh') {
      avatar.shirtReady = this.art.ready.then(() => {
        const logo = this.art.renderer.logo;
        if (!logo) return;
        const badge = this.art.spritePlane(logo, 'club-omarchy-shirt', .33, .33 * logo.height / logo.width);
        badge.name = 'omarchy-shirt-logo'; badge.position.set(0, point(24, 44).y, .119);
        avatar.model.add(badge);
      });
    }
    avatar.mouthHeight = point(25, 25).y;
    return avatar;
  }

  coffee() {
    const cup = new THREE.Group(); cup.name = 'coffee-mug';
    this.art.box(cup, -.074, 0, 0, .018, .18, .15, '#e5e9ff');
    this.art.box(cup, .074, 0, 0, .018, .18, .15, '#e5e9ff');
    this.art.box(cup, 0, 0, -.066, .15, .18, .018, '#e5e9ff');
    this.art.box(cup, 0, 0, .066, .15, .18, .018, '#e5e9ff');
    this.art.box(cup, 0, -.082, 0, .15, .016, .15, '#c0caf5');
    this.art.box(cup, 0, .07, 0, .13, .006, .12, '#46332b');
    this.art.box(cup, -.108, .045, 0, .064, .018, .025, '#e5e9ff');
    this.art.box(cup, -.137, 0, 0, .018, .1, .025, '#e5e9ff');
    this.art.box(cup, -.108, -.045, 0, .064, .018, .025, '#e5e9ff');
    const logo = document.createElement('canvas'); logo.width = 16; logo.height = 16;
    const ctx = logo.getContext('2d'); ctx.fillStyle = '#739b52'; ctx.fillRect(3, 2, 3, 12); ctx.fillRect(11, 2, 3, 12);
    ctx.fillStyle = '#9ece6a'; ctx.beginPath(); ctx.moveTo(5, 2); ctx.lineTo(12, 10); ctx.lineTo(12, 14); ctx.lineTo(5, 6); ctx.fill();
    const mark = this.art.spritePlane(logo, 'club-coffee-mark', .1, .1); mark.position.set(0, -.002, .077); cup.add(mark);
    cup.rim = new THREE.Object3D(); cup.rim.position.y = .09; cup.add(cup.rim);
    return cup;
  }

  disk() {
    const disk = new THREE.Group(); disk.name = 'club-floppy';
    this.art.box(disk, 0, 0, 0, .18, .18, .018, '#343b58');
    this.art.box(disk, 0, .035, .012, .13, .055, .008, '#c0caf5');
    this.art.box(disk, 0, -.059, .013, .065, .036, .008, '#9aa5ce');
    return disk;
  }

  handheld() {
    const device = new THREE.Group(); device.name = 'held-gameboy';
    this.art.box(device, 0, 0, 0, .12, .19, .045, '#c4c6b7');
    this.art.box(device, 0, .039, .026, .085, .07, .008, '#6c7479');
    this.art.box(device, 0, .039, .032, .066, .05, .004, '#9baa65', true);
    this.art.box(device, -.031, -.04, .028, .036, .012, .008, '#30383b');
    this.art.box(device, -.031, -.04, .028, .012, .036, .008, '#30383b');
    this.art.box(device, .022, -.043, .03, .014, .014, .008, '#8f435f');
    this.art.box(device, .041, -.03, .03, .014, .014, .008, '#8f435f');
    return device;
  }

  solveArm(arm, target, side) {
    const direction = target.clone().sub(arm.shoulder);
    const upperLength = arm.elbowVector.length(); const lowerLength = arm.handVector.length();
    const distance = Math.min(upperLength + lowerLength - .0001, Math.max(Math.abs(upperLength - lowerLength) + .001, direction.length()));
    direction.normalize();
    const along = (upperLength ** 2 - lowerLength ** 2 + distance ** 2) / (2 * distance);
    const lift = Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2));
    const pole = v(side * .45, -1, .5); pole.addScaledVector(direction, -pole.dot(direction)).normalize();
    const elbow = arm.shoulder.clone().addScaledVector(direction, along).addScaledVector(pole, lift);
    const hand = arm.shoulder.clone().addScaledVector(direction, distance);
    const upper = new THREE.Quaternion().setFromUnitVectors(arm.elbowVector.clone().normalize(), elbow.clone().sub(arm.shoulder).normalize());
    const lower = new THREE.Quaternion().setFromUnitVectors(arm.handVector.clone().normalize(), hand.clone().sub(elbow).normalize());
    arm.upper.quaternion.copy(upper);
    arm.forearm.quaternion.copy(upper).invert().multiply(lower);
    return hand;
  }

  animate(avatar, npc, { state, reducedMotion, viewer }) {
    if (state === 'paused') return;
    avatar.position.set(npc.x, 0, npc.z); avatar.rotation.y = npc.yaw;
    const gesture = gestureAt(npc.gesture, npc.clock);
    const amount = reducedMotion ? 0 : gesture.amount * npc.gestureBlend;
    const gait = Math.sin(npc.gait) * npc.walkBlend;
    avatar.legs[0].rotation.x = gait * .23; avatar.legs[1].rotation.x = -gait * .23;
    avatar.model.position.y = reducedMotion ? 0 : Math.abs(Math.sin(npc.gait * 2)) * npc.walkBlend * .005;
    const left = v(-.27, .92, .08 + gait * .045); const right = v(.29, .92, .08 - gait * .045);
    let nod = Math.sin(npc.clock * 1.1) * .012;
    if (npc.gesture === 'wave') right.lerp(v(.41 + gesture.wave * .045, 1.64, .10), amount);
    if (npc.gesture === 'glasses') { right.lerp(v(.19, CLUB.eyeHeight - .015, .19), amount); nod += amount * .025; }
    if (npc.gesture === 'coffee') { left.set(-.27, .94, .14).lerp(v(-.12, avatar.mouthHeight - .105, .12), amount); nod += amount * .075; }
    if (npc.gesture === 'stretch') { left.lerp(v(-.6, 1.29, .1), amount); right.lerp(v(.6, 1.29, .1), amount); nod -= amount * .04; }
    if (npc.gesture === 'hands') { left.lerp(v(-.09, 1.12, .27), amount); right.lerp(v(.10, 1.12, .27), amount); nod += amount * .10; }
    if (npc.gesture === 'beat') { left.lerp(v(-.26, 1.06 + gesture.tap * .035, .20), amount); right.lerp(v(.28, 1.06 - gesture.tap * .035, .20), amount); avatar.legs[1].rotation.x += amount * gesture.tap * .035; }
    if (npc.gesture === 'disk') { left.lerp(v(-.12, 1.13 + amount * .14, .27), .8); right.lerp(v(.12, 1.13 + amount * .14, .27), .8); nod += .08; }
    if (npc.gesture === 'handheld') { left.set(-.10, 1.13, .27); right.set(.10, 1.13 + amount * gesture.tap * .013, .27); nod += .10; }
    if (npc.gesture === 'explain') { right.lerp(v(.4, 1.18 + gesture.tap * .035, .24), amount); left.lerp(v(-.21, 1.10, .23), amount * .5); }
    const leftHand = this.solveArm(avatar.arms.left, left, -1);
    this.solveArm(avatar.arms.right, right, 1);
    avatar.head.rotation.x = reducedMotion ? 0 : nod;
    avatar.head.rotation.z = reducedMotion ? 0 : Math.sin(npc.clock * .8) * .012;
    if (avatar.prop) {
      if (npc.gesture === 'coffee') { avatar.prop.position.copy(leftHand).add(v(.10, .02, .08)); avatar.prop.rotation.x = -amount * .5; }
      if (npc.gesture === 'disk') { avatar.prop.position.set(0, 1.15 + amount * .14, .32); avatar.prop.rotation.x = -.12 - amount * .2; }
      if (npc.gesture === 'handheld') { avatar.prop.position.set(0, 1.14, .3); avatar.prop.rotation.x = -.22; }
    }
    const viewAngle = Math.atan2(viewer.x - npc.x, viewer.z - npc.z) - npc.yaw;
    const relative = Math.abs(Math.atan2(Math.sin(viewAngle), Math.cos(viewAngle)));
    const face = relative > 2.1 ? 'back' : relative > 1.05 ? 'profile' : 'smile';
    Object.entries(avatar.faces).forEach(([id, mesh]) => { mesh.visible = id === face; });
    avatar.userData.gestureAmount = amount;
    avatar.userData.motion = npc.moving ? 'walk' : amount > .05 ? npc.gesture : 'idle';
  }
}
