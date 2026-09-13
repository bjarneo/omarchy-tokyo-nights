import * as THREE from '../assets/three.module.js';
import { DISTRICTS, clamp } from './engine.mjs';
import { getPaint } from './cars.mjs';
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
    this.structures = this.batch(2200);
    this.lights = this.batch(3600, true);
    this.trafficBodies = this.batch(300);
    this.trafficLights = this.batch(100, true);
    this.ribbons = [this.ribbon(-6.2, 6.2, -.025, C.line), this.ribbon(-5.3, 5.3, 0, C.panel)];
    this.makeSky();
    this.makeSigns();
    this.makeCockpit();
    this.panels = new CockpitPanels(this.rig);
    this.makeControllers();
    this.makeComfortMask();
    this.raycaster = new THREE.Raycaster();
    this.rayMatrix = new THREE.Matrix4();
    this.previewYaw = 0;
    this.previewPitch = 0;
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
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    return { left, right, y, geometry, positions };
  }

  makeSky() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), this.material(C.bg, true));
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
    this.mesh(this.cockpit, .35, .65, -.68, 1.9, .32, .44, C.bg);
    this.mesh(this.cockpit, .35, .83, -.8, 1.85, .035, .36, C.line);
    this.mesh(this.cockpit, .35, .8, -.56, 1.78, .018, .018, C.cyan, true);
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
    this.wheel.position.set(0, .69, -.4);
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
        const action = this.panels.hit(hit);
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
    const targets = [this.panels.menu.mesh, this.panels.dashboard.mesh].filter((mesh) => mesh.visible);
    return this.raycaster.intersectObjects(targets, false)[0];
  }

  selectGaze() {
    this.onAction(this.panels.hit(this.point(this.renderer.xr.isPresenting ? this.renderer.xr.getCamera() : this.camera)) || 'start');
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
        this.place(this.structures, s++, center + side * 5.8, .45, -ahead, .2, .7, 20.5, C.line, yaw);
        this.place(this.lights, l++, center + side * 5.55, .06, -ahead, .08, .03, 20.5, side < 0 ? C.yellow : C.cyan, yaw);
        this.place(this.lights, l++, center + side * 5.64, .8, -ahead, .08, .045, 20.5, C.muted, yaw);
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
    for (const car of cars.slice(0, 24)) {
      const p = trafficPosition(state, car);
      const color = ACCENTS[car.color % 5];
      const van = car.type === 'van';
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
    this.previewYaw = this.previewPitch = 0;
    this.camera.position.set(0, SEAT_HEIGHT, 0);
    this.camera.rotation.set(0, 0, 0);
    this.camera.scale.set(1, 1, 1);
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
    this.updateWorld(game);
    this.updateTraffic(game);
    this.panels.update(game, options, time);
    const strength = options.comfort && game.state === 'playing' ? clamp((game.speed - 130) / 270, 0, .9) : 0;
    this.comfort.material.uniforms.strength.value = strength;
    this.comfort.visible = strength > 0;
    this.scene.updateMatrixWorld(true);
    this.panels.hover = null;
    for (const { controller, ray } of this.controllers) {
      const hit = controller.visible ? this.point(controller) : null;
      const action = this.panels.hit(hit);
      ray.visible = options.immersive && (this.panels.menu.mesh.visible || Boolean(action));
      ray.scale.z = hit?.distance || 3;
      if (action) this.panels.hover = action;
    }
    this.gaze.visible = options.immersive && this.panels.menu.mesh.visible && !this.controllers.some(({ controller }) => controller.visible);
    if (time - this.lastMirror > .1) {
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
    this.rig.visible = false;
    this.comfort.visible = false;
    this.renderer.xr.enabled = false;
    this.mirrorCamera.position.set(this.rig.position.x + .35, 1, 1.2);
    this.renderer.setRenderTarget(this.mirrorTarget);
    this.renderer.render(this.scene, this.mirrorCamera);
    this.renderer.setRenderTarget(target);
    this.renderer.xr.enabled = xr;
    this.rig.visible = true;
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
    this.renderer.dispose();
  }
}
