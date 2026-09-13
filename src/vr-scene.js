import * as THREE from '../assets/three.module.js';
import { DISTRICTS, clamp, cameoPose } from './engine.mjs';
import { CARS, PAINTS, getPaint } from './cars.mjs';
import { CHARACTERS } from './characters.mjs';
import { VRArt } from './vr-art.js';
import { loadOmarchyLogo } from './omarchy-logo.js';
import { CockpitPanels, canvasPanel } from './vr-panels.js';
import { SEAT_HEIGHT, ROAD_HALF_WIDTH, WORLD_SCALE, roadOffset, trafficPosition } from './vr-world.mjs';

const C = { bg: 0x16161e, night: 0x1a1b26, panel: 0x24283b, line: 0x343b58, muted: 0x9aa5ce, text: 0xc0caf5, yellow: 0xe0af68, cyan: 0x7dcfff, pink: 0xf7768e, purple: 0xbb9af7, green: 0x9ece6a };
const hash = (n) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
const ACCENTS = [C.cyan, C.pink, C.purple, C.yellow, C.green];

export class VRScene {
  constructor(canvas, { onAction = () => {} } = {}) {
    this.canvas = canvas;
    this.onAction = onAction;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.xr.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(C.night);
    this.scene.fog = new THREE.Fog(C.night, 110, 380);
    this.scene.add(new THREE.HemisphereLight(0xc0caf5, 0x343b58, 2.1));
    const light = new THREE.DirectionalLight(0xc0caf5, 1.5);
    light.position.set(-80, 130, 40);
    this.scene.add(light);
    this.camera = new THREE.PerspectiveCamera(72, 1, .04, 650);
    this.camera.position.set(0, SEAT_HEIGHT, 0);
    this.rig = new THREE.Group();
    this.rig.add(this.camera);
    this.scene.add(this.rig);
    this.box = new THREE.BoxGeometry(1, 1, 1);
    this.matrix = new THREE.Object3D();
    this.color = new THREE.Color();
    this.materials = new Map();
    this.art = new VRArt();
    this.structures = this.batch(2200);
    this.lights = this.batch(3600, true);
    this.trafficBodies = this.batch(300);
    this.trafficLights = this.batch(100, true);
    this.pickupBodies = this.batch(64);
    this.pickupLights = this.batch(64, true);
    this.ribbons = [this.ribbon(-6.2, 6.2, -.025, C.line), this.ribbon(-5.3, 5.3, 0, C.panel)];
    this.makeSky();
    this.makeSigns();
    this.makeArcade();
    this.makeCockpit();
    this.panels = new CockpitPanels(this.rig, this.art);
    this.makeGarage();
    this.makeArcadeElements();
    this.makeControllers();
    this.makeComfortMask();
    this.raycaster = new THREE.Raycaster();
    this.rayMatrix = new THREE.Matrix4();
    this.previewYaw = 0;
    this.previewPitch = -.08;
    this.lastMirror = -Infinity;
    this.head = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.up = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
  }

  material(color, basic = false) {
    const key = `${color}-${basic}`;
    if (!this.materials.has(key)) this.materials.set(key, basic ? new THREE.MeshBasicMaterial({ color, toneMapped: false }) : new THREE.MeshLambertMaterial({ color }));
    return this.materials.get(key);
  }

  mesh(parent, x, y, z, w, h, d, color, basic = false) {
    const mesh = new THREE.Mesh(this.box, this.material(color, basic));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
  }

  batch(count, basic = false) {
    const mesh = new THREE.InstancedMesh(this.box, this.material(0xffffff, basic), count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.count = 0;
    this.scene.add(mesh);
    return mesh;
  }

  place(batch, index, x, y, z, w, h, d, color, yaw = 0) {
    this.matrix.position.set(x, y, z);
    this.matrix.scale.set(w, h, d);
    this.matrix.rotation.set(0, yaw, 0);
    this.matrix.updateMatrix();
    batch.setMatrixAt(index, this.matrix.matrix);
    batch.setColorAt(index, this.color.setHex(color));
  }

  finishBatch(batch, count) {
    batch.count = count;
    batch.instanceMatrix.needsUpdate = true;
    if (batch.instanceColor) batch.instanceColor.needsUpdate = true;
  }

  ribbon(left, right, y, color) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(97 * 2 * 3);
    const indices = [];
    for (let i = 0; i < 96; i++) {
      const n = i * 2;
      indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setIndex(indices);
    const mesh = new THREE.Mesh(geometry, this.material(color, true));
    // Draw the road before the cockpit in both eye viewports.
    mesh.renderOrder = -10;
    mesh.material.depthWrite = false;
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    return { left, right, y, geometry, positions, mesh };
  }

  makeSky() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), this.material(C.bg, true));
    ground.renderOrder = -20;
    ground.material.depthWrite = false;
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    this.scene.add(ground);
    const positions = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i++) {
      const angle = hash(i) * Math.PI * 2;
      positions.set([Math.cos(angle) * 440, 35 + hash(i + 91) * 270, Math.sin(angle) * 440], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: C.muted, size: .5, fog: false, sizeAttenuation: true }));
    this.scene.add(stars);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(13, 20), new THREE.MeshBasicMaterial({ color: C.text, fog: false }));
    moon.position.set(-160, 150, -420);
    this.scene.add(moon);
    this.tower = new THREE.Group();
    for (let level = 0; level < 5; level++) {
      const y = level * 12;
      const half = 13 - level * 2.2;
      this.mesh(this.tower, 0, y, 0, half * 2, .8, half * 2, C.pink, true);
      for (const side of [-1, 1]) {
        for (const face of [-1, 1]) {
          const beam = this.mesh(this.tower, side * (half - 1.1), y + 6, face * (half - 1.1), .7, 12.5, .7, C.pink, true);
          beam.rotation.z = side * .18;
          beam.rotation.x = -face * .18;
          const brace = this.mesh(this.tower, 0, y + 6, face * half, .45, Math.hypot(half * 2, 12), .45, C.pink, true);
          brace.rotation.z = side * Math.atan2(half * 2, 12);
        }
      }
    }
    this.mesh(this.tower, 0, 72, 0, .65, 24, .65, C.text, true);
    this.tower.position.set(95, 0, -270);
    this.scene.add(this.tower);
  }

  makeSigns() {
    this.signTextures = [...DISTRICTS, 'OMARCHY'].map((label, i) => {
      const panel = canvasPanel(512, 160, 7, 2.2);
      const { ctx } = panel;
      ctx.fillStyle = '#16161e';
      ctx.fillRect(0, 0, 512, 160);
      ctx.strokeStyle = i === 4 ? '#9ece6a' : '#7dcfff';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 504, 152);
      ctx.fillStyle = '#c0caf5';
      ctx.textAlign = 'center';
      ctx.font = '34px "Courier New", monospace';
      ctx.fillText(label, 256, 68);
      ctx.font = '22px "Courier New", monospace';
      ctx.fillStyle = '#7dcfff';
      ctx.fillText('C1   TOKYO EXPRESSWAY', 256, 118);
      panel.texture.needsUpdate = true;
      return panel;
    });
    void loadOmarchyLogo().then((logo) => {
      const panel = this.signTextures[4];
      panel.ctx.fillStyle = '#16161e';
      panel.ctx.fillRect(12, 12, 488, 78);
      panel.ctx.imageSmoothingEnabled = false;
      panel.ctx.drawImage(logo, 40, 25, 432, 56);
      panel.texture.needsUpdate = true;
    }).catch(() => {});
    this.signs = Array.from({ length: 7 }, (_, i) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.2), this.signTextures[i % 5].mesh.material);
      this.scene.add(mesh);
      return mesh;
    });
    this.checkpoint = canvasPanel(512, 128, 10.4, 2.6);
    const ctx = this.checkpoint.ctx;
    ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#9ece6a'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 504, 120);
    ctx.fillStyle = '#9ece6a'; ctx.font = '32px "Courier New", monospace'; ctx.textAlign = 'center';
    ctx.fillText('CHECKPOINT  +35 SEC', 256, 76);
    this.checkpoint.texture.needsUpdate = true;
    this.scene.add(this.checkpoint.mesh);
  }

  makeCockpit() {
    this.cockpit = new THREE.Group();
    this.rig.add(this.cockpit);
    this.paintMaterial = new THREE.MeshLambertMaterial({ color: C.yellow });
    const body = (x, y, z, w, h, d) => {
      const mesh = this.mesh(this.cockpit, x, y, z, w, h, d, C.yellow);
      mesh.material = this.paintMaterial;
      return mesh;
    };
    this.hood = body(.35, .52, -1.58, 1.85, .13, 1.45);
    this.hood.rotation.x = -.05;
    body(-.52, .53, -1.65, .12, .15, 1.6);
    body(1.22, .53, -1.65, .12, .15, 1.6);
    this.mesh(this.cockpit, .35, .5, -2.28, 1.7, .05, .06, C.line);
    this.mesh(this.cockpit, -.15, .6, -1.04, .52, .025, .07, C.bg);
    this.mesh(this.cockpit, .85, .6, -1.04, .52, .025, .07, C.bg);
    this.mesh(this.cockpit, .35, .65, -1.2, 1.9, .32, .44, C.bg);
    this.mesh(this.cockpit, .35, .83, -1.2, 1.85, .035, .36, C.line);
    this.mesh(this.cockpit, .35, .8, -.96, 1.78, .018, .018, C.cyan, true);
    this.mesh(this.cockpit, .7, .4, .08, .26, .32, 1.3, C.bg);
    this.mesh(this.cockpit, .7, .61, -.2, .055, .22, .055, C.line);
    this.mesh(this.cockpit, .7, .73, -.2, .1, .07, .1, C.muted);
    for (const side of [-.64, 1.34]) {
      body(side, .36, .1, .08, .5, 2.8);
      this.mesh(this.cockpit, side, .64, .2, .12, .08, 2.1, C.bg);
      const pillar = body(side, 1.07, -.86, .045, 1.08, .055);
      pillar.rotation.x = .48;
      body(side, 1.48, .28, .06, .07, 1.8);
      body(side, 1.06, 1, .07, .85, .08);
    }
    body(.35, 1.55, -.59, 2.06, .055, .07);
    body(.35, 1.51, .78, 2.06, .055, .55);
    this.mesh(this.cockpit, .35, .15, .2, 1.9, .06, 2.3, C.bg);
    for (const x of [0, .97]) {
      this.mesh(this.cockpit, x, .26, .35, .5, .16, .58, C.panel);
      const seat = this.mesh(this.cockpit, x, .64, .63, .48, .74, .14, C.panel);
      seat.rotation.x = -.13;
      this.mesh(this.cockpit, x, 1.04, .69, .28, .2, .1, C.bg);
    }
    this.wheel = new THREE.Group();
    this.wheel.position.set(0, .72, -.65);
    this.wheel.rotation.x = -.28;
    this.cockpit.add(this.wheel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.19, .019, 6, 20), this.material(C.bg));
    this.wheel.add(rim);
    this.mesh(this.wheel, 0, 0, 0, .31, .034, .036, C.line);
    this.mesh(this.wheel, 0, -.075, 0, .04, .14, .035, C.line);
    this.mesh(this.wheel, 0, 0, .025, .09, .07, .025, C.yellow);
    this.mesh(this.wheel, 0, .19, .003, .025, .032, .043, C.cyan, true);
    this.mirrorTarget = new THREE.WebGLRenderTarget(256, 128);
    this.mirrorCamera = new THREE.PerspectiveCamera(65, 2, .1, 450);
    this.mirrorCamera.rotation.y = Math.PI;
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(.4, .18), new THREE.MeshBasicMaterial({ map: this.mirrorTarget.texture, toneMapped: false }));
    mirror.position.set(.46, 1.36, -.75);
    this.mesh(this.cockpit, .46, 1.36, -.763, .44, .22, .026, C.bg);
    this.cockpit.add(mirror);
    this.mirror = mirror;
    this.mirrorCamera.layers.enable(3);
    this.occupants = new THREE.Group();
    this.rig.add(this.occupants);
    this.exhaust = new THREE.Group();
    for (const x of [-.12, .82]) {
      this.mesh(this.exhaust, x, .24, 1.75, .18, .18, 1.1, 0x7aa2f7, true);
      this.mesh(this.exhaust, x, .24, 1.57, .1, .1, .9, C.cyan, true);
      this.mesh(this.exhaust, x, .24, 1.36, .06, .06, .55, C.text, true);
    }
    this.rig.add(this.exhaust);
    this.exhaust.visible = false;
  }

  makeGarage() {
    this.garage = new THREE.Group();
    this.scene.add(this.garage);
    this.mesh(this.garage, 0, -.06, -7, 26, .1, 30, C.panel);
    const wall = this.art.garageWall();
    wall.position.set(0, 3.5, -18);
    this.garage.add(wall);
    const sign = this.art.logoSign('omarchy');
    sign.position.set(0, 3.4, -9.5);
    this.garage.add(sign);
    for (const side of [-1, 1]) {
      this.mesh(this.garage, side * 10, 3.5, -11, .2, 7, .2, C.line);
      this.mesh(this.garage, side * 7, 6.9, -11, 6, .1, .2, C.line);
      this.mesh(this.garage, side * 7, 6.83, -11, 5.5, .06, .22, C.cyan, true);
      for (let i = 0; i < 5; i++) this.mesh(this.garage, side * 6, .01, -1.8 - i * 3.8, 6, .02, .08, C.yellow, true);
    }
    this.garageCars = new THREE.Group();
    this.garage.add(this.garageCars);
    this.cast = CHARACTERS.map(({ id }) => this.art.character(id, { action: `driver:${id}` }));
    this.castRoot = new THREE.Group();
    this.castRoot.add(...this.cast);
    this.scene.add(this.castRoot);
    this.castPositions = [[1.65, -3.5], [-1.65, -3.5], [2.85, -4.7], [-2.85, -4.7], [3.85, -6.2], [-3.85, -6.2], [2.8, -8.6], [-2.8, -8.6], [0, -9]];
  }

  makeArcadeElements() {
    this.arcadeSigns = [
      this.art.logoSign('cliamp'), this.art.logoSign('omarchy'),
      this.art.sign('東京', '#7dcfff', true), this.art.sign('RAMEN', '#e0af68'),
      this.art.sign('ホテル', '#f7768e', true), this.art.sign('NIGHT', '#bb9af7', true),
      this.art.logoSign('cliamp'), this.art.sign('24H', '#7dcfff'),
    ];
    this.scene.add(...this.arcadeSigns);
    this.trafficDetails = new THREE.Group();
    this.trafficSprites = Array.from({ length: 24 }, () => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.65 * 55 / 96), new THREE.MeshBasicMaterial({ alphaTest: .45, toneMapped: false }));
      mesh.visible = false;
      this.trafficDetails.add(mesh);
      return mesh;
    });
    this.scene.add(this.trafficDetails);
    this.pitArea = new THREE.Group();
    this.pitArea.visible = false;
    this.pitAt = null;
    this.pitSide = 1;
    this.mesh(this.pitArea, 0, .015, 0, 6.4, .07, 18, C.line);
    for (const side of [-1, 1]) {
      this.mesh(this.pitArea, side * 2.9, .06, 0, .08, .04, 17, C.green, true);
      this.mesh(this.pitArea, side * 2, 1.4, -5, .12, 2.8, .12, C.line);
    }
    const label = this.art.nameTag('PIT STOP', '#9ece6a');
    label.scale.setScalar(4);
    label.position.set(0, 3, -5);
    this.pitArea.add(label);
    const hint = this.art.nameTag('STEER ONTO THE SHOULDER', '#7dcfff');
    hint.scale.setScalar(3.6);
    hint.position.set(0, 2.2, -5);
    this.pitArea.add(hint);
    this.scene.add(this.pitArea);
  }

  updatePitArea(game) {
    if (game.pitStopAt !== null) {
      this.pitAt = game.pitStopAt;
      this.pitSide = Math.sign(game.pitStopLane) || 1;
    }
    const ahead = this.pitAt === null ? Infinity : (this.pitAt - game.distance) * WORLD_SCALE;
    this.pitArea.visible = ahead < 300 && ahead > -45;
    if (this.pitArea.visible) this.pitArea.position.set(roadOffset(game.distance, ahead) + this.pitSide * 8.5, 0, -ahead);
    this.pitAhead = ahead;
  }

  updateGarage(game) {
    const key = `${game.carId}:${game.paintId}`;
    if (this.garageCarKey === key) return;
    this.garageCarKey = key;
    this.garageCars.clear();
    const cars = [CARS.find((car) => car.id === game.carId), ...CARS.filter((car) => car.id !== game.carId)];
    cars.forEach((car, index) => {
      const model = this.art.car(car.id, index === 0 ? game.paintId : PAINTS[index % PAINTS.length].id, `car:${car.id}`);
      if (index === 0) model.position.set(0, 0, -5.4);
      else {
        const side = index <= 4 ? -1 : 1;
        model.position.set(side * 5.7, 0, -4 - (index - 1) % 4 * 3.8);
        model.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      }
      this.garageCars.add(model);
    });
  }

  updateOccupants(game, options) {
    if (this.occupantId !== game.characterId) {
      this.occupants.traverse((object) => { if (object.isInstancedMesh) object.dispose(); });
      this.occupants.clear();
      this.occupantId = game.characterId;
      const index = CHARACTERS.findIndex(({ id }) => id === game.characterId);
      this.selfAvatar = this.art.character(game.characterId, { seated: true });
      this.companionAvatar = this.art.character(CHARACTERS[(index + 1) % CHARACTERS.length].id, { seated: true });
      this.occupants.add(this.selfAvatar, this.companionAvatar);
      this.selfAvatar.rotation.y = Math.PI;
      this.companionAvatar.position.set(.95, -.26, -.35);
      this.companionAvatar.rotation.y = Math.PI;
      this.companionAvatar.head.rotation.y = 1.9;
    }
    const pose = cameoPose(game.cameoTime, options.reducedMotion);
    const lift = pose?.lift || 0;
    this.selfAvatar.position.set(-.63 * lift, -.26 + .18 * lift, .2 - 1.25 * lift);
    this.selfAvatar.head.rotation.y = pose ? Math.PI + .5 : 0;
    this.selfAvatar.head.traverse((object) => object.layers.set(lift > .65 ? 0 : 3));
    this.art.face(this.selfAvatar, pose?.facing || 'smile');
    this.selfAvatar.tag.visible = Boolean(pose?.greeting);
    this.selfAvatar.tag.rotation.y = Math.PI;
    this.companionAvatar.head.rotation.z = options.reducedMotion ? 0 : Math.sin(game.elapsed * 1.6) * .025;
    this.exhaust.visible = game.boosting && !options.garage;
    this.exhaust.scale.z = options.reducedMotion ? 1 : .9 + Math.sin(game.elapsed * 26) * .1;
  }

  updateCast(game, options) {
    const pit = game.state === 'pit' || game.state === 'pit-enter';
    const ending = game.state === 'ending' || game.state === 'complete';
    const approach = !options.garage && !pit && !ending && this.pitArea.visible && this.pitAhead > 0 && this.pitAhead < 160;
    const driverIndex = CHARACTERS.findIndex(({ id }) => id === game.characterId);
    this.castRoot.visible = options.garage || pit || ending || approach;
    this.cast.forEach((avatar, index) => {
      const id = avatar.userData.characterId;
      avatar.visible = !pit || id === game.characterId || id === game.pitStop?.companionId;
      if (approach) avatar.visible = index === (driverIndex + 1) % CHARACTERS.length || index === (driverIndex + 2) % CHARACTERS.length;
      let [x, z] = this.castPositions[index];
      if (pit) { x = this.rig.position.x + (id === game.characterId ? -1.7 : 1.7); z = -3.1; }
      if (approach) { x = this.pitArea.position.x + (index === (driverIndex + 1) % CHARACTERS.length ? -1 : 1); z = this.pitArea.position.z - 3; }
      if (ending) { x = (index - 4) * .85; z = -5.8 - Math.abs(index - 4) * .35; }
      avatar.position.set(x, 0, z);
      avatar.rotation.y = Math.atan2(this.rig.position.x - x, -z);
      avatar.head.rotation.z = options.reducedMotion || game.state === 'paused' ? 0 : Math.sin(game.elapsed * 1.5 + index) * .025;
      avatar.tag.visible = true;
      avatar.tag.rotation.y = 0;
    });
  }

  makeArcade() {
    this.arcade = new THREE.Group();
    this.mesh(this.arcade, 0, 4, -4, 18, 8, 1, C.panel);
    this.mesh(this.arcade, 0, 7, 0, 18, 1.5, 8, C.bg);
    for (const side of [-1, 1]) this.mesh(this.arcade, side * 8.5, 3, 0, 1, 6, 8, C.line);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(11, 3.4), this.signTextures[4].mesh.material);
    sign.position.set(0, 6.2, 4.02);
    this.arcade.add(sign);
    for (let i = 0; i < 7; i++) {
      const x = (i - 3) * 1.6;
      this.mesh(this.arcade, x, 1.3, 1, 1.1, 2.6, 1, C.bg);
      this.mesh(this.arcade, x, 1.8, 1.52, .8, .85, .02, ACCENTS[i % 5], true);
      this.mesh(this.arcade, x, 1.06, 1.72, 1.08, .16, .45, C.line);
    }
    this.scene.add(this.arcade);
    this.arcade.visible = false;
  }

  updatePickups(game) {
    let bodies = 0;
    let lights = 0;
    if (game.state !== 'title') {
      const pickups = [...(game.missionStatus().complete ? [] : game.pickups), ...game.nitroPickups];
      for (const pickup of pickups) {
        if (pickup.resolved) continue;
        const p = trafficPosition(game, pickup);
        if (p.z < -230 || p.z > 10) continue;
        const tape = pickup.kind === 'tape';
        const nitro = pickup.kind === 'nitro';
        this.place(this.pickupBodies, bodies++, p.x, 1, p.z, tape ? 1.1 : .65, tape ? .65 : 1, .28, tape ? C.pink : nitro ? C.cyan : C.green);
        if (tape) {
          for (const side of [-1, 1]) this.place(this.pickupLights, lights++, p.x + side * .25, 1.02, p.z + .15, .2, .2, .02, C.bg);
          this.place(this.pickupLights, lights++, p.x, .78, p.z + .15, .6, .08, .02, C.text);
        } else {
          this.place(this.pickupBodies, bodies++, p.x, 1.55, p.z, .24, .12, .24, C.text);
          this.place(this.pickupLights, lights++, p.x, 1.02, p.z + .15, .4, .08, .02, C.bg);
          this.place(this.pickupLights, lights++, p.x, 1.02, p.z + .16, .08, .4, .02, C.bg);
        }
        this.place(this.pickupLights, lights++, p.x, .03, p.z, 2.6, .02, 6, nitro ? C.cyan : C.green);
        for (const side of [-1, 1]) this.place(this.pickupLights, lights++, p.x + side * 1.3, 1.7, p.z, .06, 3.4, .06, C.cyan);
        this.place(this.pickupLights, lights++, p.x, 3.4, p.z, 2.65, .06, .06, C.cyan);
      }
    }
    this.finishBatch(this.pickupBodies, bodies);
    this.finishBatch(this.pickupLights, lights);
    this.arcade.visible = ['ending', 'complete'].includes(game.state);
    this.arcade.position.set(roadOffset(game.distance, 16), 0, -16);
  }

  makeControllers() {
    this.controllers = [];
    for (let i = 0; i < 2; i++) {
      const controller = this.renderer.xr.getController(i);
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]);
      const ray = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: i ? C.yellow : C.cyan, transparent: true, opacity: .7 }));
      ray.scale.z = 3;
      controller.add(ray);
      const grip = this.renderer.xr.getControllerGrip(i);
      this.mesh(grip, 0, 0, .035, .048, .045, .12, i ? C.yellow : C.cyan);
      this.mesh(grip, 0, 0, -.022, .054, .052, .02, C.text, true);
      controller.addEventListener('selectstart', () => {
        const hit = this.point(controller);
        const action = this.interaction(hit);
        if (action) this.onAction(action);
      });
      this.rig.add(controller, grip);
      this.controllers.push({ controller, grip, ray });
    }
    this.gaze = new THREE.Mesh(new THREE.RingGeometry(.006, .009, 16), this.material(C.cyan, true));
    this.gaze.position.set(0, 0, -1);
    this.camera.add(this.gaze);
    this.gaze.visible = false;
  }

  makeComfortMask() {
    this.comfort = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { strength: { value: 0 } },
      vertexShader: 'varying vec2 uvScreen; void main() { uvScreen = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: 'precision mediump float; varying vec2 uvScreen; uniform float strength; void main() { float edge = smoothstep(0.48, 1.12, length(uvScreen)); gl_FragColor = vec4(0.086, 0.086, 0.118, edge * strength); }',
      transparent: true, depthTest: false, depthWrite: false,
    }));
    this.comfort.frustumCulled = false;
    this.comfort.renderOrder = 1000;
    this.scene.add(this.comfort);
  }

  point(controller) {
    this.rayMatrix.extractRotation(controller.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.rayMatrix);
    const targets = [this.panels.menu.mesh.visible ? this.panels.menu.mesh : this.panels.dashboard.mesh];
    if (!targets[0].visible) targets.length = 0;
    if (this.garage.visible) targets.push(...this.cast.map((avatar) => avatar.pickTarget), ...this.garageCars.children.map((car) => car.pickTarget));
    return this.raycaster.intersectObjects(targets, false).find((hit) => {
      let object = hit.object;
      while (object) { if (!object.visible) return false; object = object.parent; }
      return true;
    });
  }

  interaction(hit) {
    if (!hit) return null;
    const panel = this.panels.hit(hit);
    if (panel) return panel;
    let object = hit.object;
    while (object) {
      if (object.userData.action) return object.userData.action;
      object = object.parent;
    }
    return null;
  }

  selectAt(pointer) {
    this.raycaster.setFromCamera(pointer, this.camera);
    const targets = this.garage.visible ? [...this.cast.map((avatar) => avatar.pickTarget), ...this.garageCars.children.map((car) => car.pickTarget)] : [this.panels.dashboard.mesh];
    const hit = this.raycaster.intersectObjects(targets, false).find((entry) => {
      let object = entry.object;
      while (object) { if (!object.visible) return false; object = object.parent; }
      return true;
    });
    const action = this.interaction(hit);
    if (action) this.onAction(action);
  }

  selectGaze() {
    this.onAction(this.interaction(this.point(this.renderer.xr.isPresenting ? this.renderer.xr.getCamera() : this.camera)) || 'start');
  }

  updateWorld(game) {
    const distance = game.state === 'title' ? 260 : game.distance;
    for (const ribbon of this.ribbons) {
      for (let i = 0; i <= 96; i++) {
        const ahead = -60 + i * 5;
        const center = roadOffset(distance, ahead);
        ribbon.positions.set([center + ribbon.left, ribbon.y, -ahead, center + ribbon.right, ribbon.y, -ahead], i * 6);
      }
      ribbon.geometry.attributes.position.needsUpdate = true;
    }
    let s = 0;
    let l = 0;
    const travel = distance * WORLD_SCALE;
    const base = Math.floor(travel / 20) - 3;
    for (let i = 0; i < 25; i++) {
      const n = base + i;
      const ahead = n * 20 - travel;
      const center = roadOffset(distance, ahead);
      const yaw = -Math.atan2(roadOffset(distance, ahead + 10) - roadOffset(distance, ahead - 10), 20);
      for (const side of [-1, 1]) {
        const pitOpening = side === this.pitSide && Math.abs(ahead - this.pitAhead) < 18;
        if (!pitOpening) this.place(this.structures, s++, center + side * 5.8, .45, -ahead, .2, .7, 20.5, C.line, yaw);
        this.place(this.lights, l++, center + side * 5.55, .06, -ahead, .08, .03, 20.5, side < 0 ? C.yellow : C.cyan, yaw);
        if (!pitOpening) this.place(this.lights, l++, center + side * 5.64, .8, -ahead, .08, .045, 20.5, C.muted, yaw);
        this.place(this.lights, l++, center + side * 1.65, .035, -ahead, .11, .025, 5, C.muted, yaw);
        this.place(this.structures, s++, center + side * 6.4, 3.6, -ahead, .12, 7.2, .12, C.line);
        this.place(this.structures, s++, center + side * 5.45, 7.2, -ahead, 2, .1, .12, C.line);
        this.place(this.lights, l++, center + side * 5.25, 7.13, -ahead, 1.5, .05, .22, C.text);
        this.place(this.lights, l++, center + side * 4.7, .035, -ahead, .5, .015, 2.5, 0x343b58, yaw);
        const seed = n * 2 + (side > 0 ? 31 : 0);
        const width = 6 + hash(seed) * 9;
        const height = 12 + hash(seed + 2) * 68;
        const depth = 8 + hash(seed + 11) * 9;
        const x = center + side * (15 + width / 2 + hash(seed + 1) * 16);
        this.place(this.structures, s++, x, height / 2 - 1, -ahead, width, height, depth, [0x24283b, 0x292e42, 0x202336, 0x343b58][Math.floor(hash(seed + 4) * 4)]);
        this.place(this.lights, l++, x, height - .8, -ahead + depth / 2 + .02, width, .12, .08, ACCENTS[Math.abs(n) % 5]);
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 4; col++) {
            if (hash(seed + row * 17 + col) < .35) continue;
            const y = 3 + row * (height - 5) / 10;
            const color = hash(seed + row + col * 9) > .6 ? C.yellow : C.muted;
            this.place(this.lights, l++, x - width * .34 + col * width * .23, y, -ahead + depth / 2 + .03, .5, .72, .03, color);
            this.place(this.lights, l++, x - side * (width / 2 + .03), y, -ahead - depth * .32 + col * depth * .22, .03, .72, .55, color);
          }
        }
        if (game.stage % 4 === 3 && n % 4 === 0) {
          this.place(this.structures, s++, center + side * 7.5, 17, -ahead, 1, 34, 1.2, C.muted);
          this.place(this.lights, l++, center + side * 7.5, 17, -ahead + .63, .14, 34, .05, C.cyan);
          this.place(this.structures, s++, center, 31, -ahead, 16, .8, 1, C.muted);
        }
      }
    }
    this.signs.forEach((sign, i) => {
      const n = Math.floor(travel / 80) - 1 + i;
      const ahead = n * 80 - travel;
      const center = roadOffset(distance, ahead);
      const x = center + (n % 2 ? 9.8 : -9.8);
      sign.position.set(x, 5.2, -ahead);
      sign.material = this.signTextures[((n % 5) + 5) % 5].mesh.material;
      this.place(this.structures, s++, x, 2.6, -ahead - .1, .12, 5.2, .12, C.muted);
    });
    this.arcadeSigns.forEach((sign, i) => {
      const n = Math.floor(travel / 55) - 1 + i;
      const ahead = n * 55 - travel;
      const side = i % 2 ? -1 : 1;
      sign.position.set(roadOffset(distance, ahead) + side * (9 + i % 3 * 2.5), i % 3 ? 5 : 3.8, -ahead);
      this.place(this.structures, s++, sign.position.x, sign.position.y / 2, sign.position.z - .05, .12, sign.position.y, .12, C.line);
    });
    const ahead = (game.nextCheckpoint - game.distance) * WORLD_SCALE;
    this.checkpoint.mesh.visible = ahead < 420;
    if (ahead < 420) {
      const x = roadOffset(game.distance, ahead);
      this.checkpoint.mesh.position.set(x, 7.5, -ahead);
      for (const side of [-1, 1]) this.place(this.structures, s++, x + side * 5.5, 3.75, -ahead, .25, 7.5, .25, C.green);
    }
    this.finishBatch(this.structures, s);
    this.finishBatch(this.lights, l);
    this.tower.position.x = 95 + Math.sin(distance / 5000) * 30;
    this.tower.visible = game.stage % 4 !== 3;
  }

  updateTraffic(game) {
    let bodies = 0;
    let lights = 0;
    const demo = [{ x: -.65, z: 80, color: 1 }, { x: .65, z: 135, color: 2 }, { x: 0, z: 235, color: 4 }];
    const cars = game.state === 'title' ? demo : game.traffic;
    const state = game.state === 'title' ? { distance: 0 } : game;
    this.trafficSprites.forEach((sprite) => { sprite.visible = false; });
    for (const [index, car] of cars.slice(0, 24).entries()) {
      const p = trafficPosition(state, car);
      const color = ACCENTS[car.color % 5];
      const van = car.type === 'van';
      const sprite = this.trafficSprites[index];
      sprite.visible = !van;
      if (!van) {
        const map = this.art.carTexture(CARS[(car.id ?? index) % CARS.length].id, PAINTS[(car.color || 0) % PAINTS.length].id);
        if (sprite.material.map !== map) { sprite.material.map = map; sprite.material.needsUpdate = true; }
        sprite.position.set(p.x, 1.65 * 55 / 96 / 2, p.z + 1.98);
      }
      this.place(this.trafficBodies, bodies++, p.x, .48, p.z, 1.6, .55, 3.8, color);
      this.place(this.trafficBodies, bodies++, p.x, van ? 1.05 : .91, p.z + .25, 1.38, van ? 1 : .48, van ? 3 : 1.85, color);
      this.place(this.trafficBodies, bodies++, p.x, van ? 1.15 : .96, p.z + (van ? 1.77 : 1.19), 1.17, .29, .035, C.night);
      this.place(this.trafficBodies, bodies++, p.x, .3, p.z + 1.93, 1.5, .12, .12, C.bg);
      for (const side of [-1, 1]) {
        this.place(this.trafficBodies, bodies++, p.x + side * .77, .26, p.z + 1.1, .2, .48, .68, C.bg);
        this.place(this.trafficBodies, bodies++, p.x + side * .77, .26, p.z - 1.1, .2, .48, .68, C.bg);
        this.place(this.trafficLights, lights++, p.x + side * .5, .54, p.z + 1.93, .36, .15, .045, C.pink);
        this.place(this.trafficLights, lights++, p.x + side * .5, .5, p.z - 1.93, .4, .12, .045, C.text);
      }
    }
    this.finishBatch(this.trafficBodies, bodies);
    this.finishBatch(this.trafficLights, lights);
  }

  resize(width, height) {
    if (this.renderer.xr.isPresenting || width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  resetView() {
    this.previewYaw = 0;
    this.previewPitch = -.08;
    this.camera.position.set(0, SEAT_HEIGHT, 0);
    this.camera.rotation.set(0, 0, 0);
    this.camera.scale.set(1, 1, 1);
    this.camera.fov = 72;
  }

  update(game, options, time) {
    this.rig.position.x = game.playerX * ROAD_HALF_WIDTH - .35;
    if (!this.renderer.xr.isPresenting) {
      this.camera.position.set(0, SEAT_HEIGHT, 0);
      this.camera.rotation.set(this.previewPitch, this.previewYaw, 0, 'YXZ');
    }
    this.paintMaterial.color.set(getPaint(game.paintId).hex);
    this.hood.scale.z = ['countach', 'f40', '240z'].includes(game.carId) ? 1.45 : 1.1;
    this.wheel.rotation.z = -game.steer * .65;
    if (!options.garage) {
      this.updatePitArea(game);
      this.updateWorld(game);
      this.updateTraffic(game);
      this.updatePickups(game);
    }
    this.updateGarage(game);
    this.updateOccupants(game, options);
    this.updateCast(game, options);
    this.garage.visible = options.garage;
    this.cockpit.visible = !options.garage;
    this.occupants.visible = !options.garage && !['pit', 'pit-enter'].includes(game.state);
    this.panels.dashboard.mesh.visible = !options.garage;
    const roadVisible = !options.garage;
    for (const object of [this.structures, this.lights, this.trafficBodies, this.trafficLights, this.pickupBodies, this.pickupLights, this.trafficDetails, ...this.ribbons.map((ribbon) => ribbon.mesh), ...this.signs, ...this.arcadeSigns]) object.visible = roadVisible;
    if (!roadVisible) this.checkpoint.mesh.visible = this.tower.visible = this.arcade.visible = this.pitArea.visible = false;
    this.panels.update(game, options, time);
    const strength = options.comfort && game.state === 'playing' ? clamp((game.speed - 130) / 270, 0, .9) : 0;
    this.comfort.material.uniforms.strength.value = strength;
    this.comfort.visible = strength > 0;
    this.scene.updateMatrixWorld(true);
    this.panels.hover = null;
    for (const { controller, ray } of this.controllers) {
      const hit = controller.visible ? this.point(controller) : null;
      const action = this.interaction(hit);
      ray.visible = options.immersive && (this.panels.menu.mesh.visible || Boolean(action));
      ray.scale.z = hit?.distance || 3;
      if (action) this.panels.hover = action;
    }
    this.gaze.visible = options.immersive && this.panels.menu.mesh.visible && !this.controllers.some(({ controller }) => controller.visible);
    if (!options.garage && time - this.lastMirror > .1) {
      this.renderMirror();
      this.lastMirror = time;
    }
    this.renderer.render(this.scene, this.camera);
    const headCamera = options.immersive ? this.renderer.xr.getCamera() : this.camera;
    headCamera.getWorldPosition(this.head);
    headCamera.getWorldDirection(this.forward);
    headCamera.getWorldQuaternion(this.quaternion);
    this.up.set(0, 1, 0).applyQuaternion(this.quaternion);
  }

  renderMirror() {
    const target = this.renderer.getRenderTarget();
    const xr = this.renderer.xr.enabled;
    const comfort = this.comfort.visible;
    this.mirror.visible = false;
    this.comfort.visible = false;
    this.renderer.xr.enabled = false;
    this.mirrorCamera.position.set(this.rig.position.x + .46, 1.3, -.68);
    this.renderer.setRenderTarget(this.mirrorTarget);
    this.renderer.render(this.scene, this.mirrorCamera);
    this.renderer.setRenderTarget(target);
    this.renderer.xr.enabled = xr;
    this.mirror.visible = true;
    this.comfort.visible = comfort;
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    this.scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
      if (object.material?.map) textures.add(object.material.map);
    });
    for (const material of this.materials.values()) materials.add(material);
    for (const panel of this.signTextures) { textures.add(panel.texture); materials.add(panel.mesh.material); geometries.add(panel.mesh.geometry); }
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    this.mirrorTarget.dispose();
    this.art.dispose();
    this.renderer.dispose();
  }
}
