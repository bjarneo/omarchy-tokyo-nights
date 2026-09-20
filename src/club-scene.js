import * as THREE from '../assets/three.module.js';
import { VRArt } from './vr-art.js';
import { ClubRoom } from './club-room.js';
import { CLUB, ENTRY, CLUB_CREW, STATIONS, CLUB_OBJECTS } from './club-data.mjs';
import { canStand, moveWithinRoom, teleportArc } from './club-engine.mjs';
import { drawStation, drawCabinet, drawMap, paragraph } from './club-screens.js';
import { drawDesignPoster } from './club-design-art.js';

function surface(width, height, worldWidth, worldHeight) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.NearestFilter; texture.generateMipmaps = false;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(worldWidth, worldHeight), new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }));
  return { canvas, ctx: canvas.getContext('2d'), texture, mesh, buttons: [] };
}

const ENV_INSIDE = { bg: '#242536', fog: '#343342', fogNear: 34, fogFar: 70, hemiSky: '#dbd4d6', hemiGround: '#736152', hemi: 2.5, sun: '#ffe0b7', sunI: 1.5 };
const ENV_ROOF = { bg: '#05070f', fog: '#0c1430', fogNear: 46, fogFar: 150, hemiSky: '#8fb0ff', hemiGround: '#14141f', hemi: 1.15, sun: '#a9c3ff', sunI: 0.85 };
const ROOF_CENTER = { x: 0, z: -26 };

export class ClubScene {
  constructor(canvas, { onAction = () => {}, onTarget = () => {}, onTeleport = () => {} } = {}) {
    Object.assign(this, { canvas, onAction, onTarget, onTeleport });
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.4)); this.renderer.xr.enabled = true; this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(ENV_INSIDE.bg); this.scene.fog = new THREE.Fog(ENV_INSIDE.fog, ENV_INSIDE.fogNear, ENV_INSIDE.fogFar);
    this.hemi = new THREE.HemisphereLight(ENV_INSIDE.hemiSky, ENV_INSIDE.hemiGround, ENV_INSIDE.hemi); this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(ENV_INSIDE.sun, ENV_INSIDE.sunI); this.sun.position.set(-4, 9, 8); this.scene.add(this.sun);
    this.envMix = 0;
    this.envColor = new THREE.Color();
    this.camera = new THREE.PerspectiveCamera(75, 1, .04, 220); this.camera.position.y = CLUB.eyeHeight;
    this.rig = new THREE.Group(); this.rig.position.set(ENTRY.x, 0, ENTRY.z); this.rig.add(this.camera); this.scene.add(this.rig);
    this.art = new VRArt(); this.room = new ClubRoom(this.art); this.scene.add(this.room.root);
    this.panel = surface(1024, 640, 1.7, 1.0625); this.scene.add(this.panel.mesh);
    this.toolbar = surface(512, 128, .95, .2375); this.scene.add(this.toolbar.mesh); this.toolbar.mesh.visible = false;
    this.tooltip = surface(512, 96, .85, .159); this.tooltip.mesh.position.set(0, -.2, -1.15); this.camera.add(this.tooltip.mesh);
    this.notice = surface(1024, 192, 1.6, .3); this.notice.mesh.position.set(0, .35, -1.8); this.notice.mesh.visible = false; this.camera.add(this.notice.mesh); this.noticeTime = 0;
    this.cursor = new THREE.Mesh(new THREE.RingGeometry(.004, .007, 12), new THREE.MeshBasicMaterial({ color: '#7dcfff', depthTest: false }));
    this.cursor.position.z = -1; this.cursor.renderOrder = 100; this.camera.add(this.cursor);
    this.raycaster = new THREE.Raycaster(); this.rotation = new THREE.Matrix4();
    this.head = new THREE.Vector3(ENTRY.x, CLUB.eyeHeight, ENTRY.z); this.forward = new THREE.Vector3(0, 0, -1); this.up = new THREE.Vector3(0, 1, 0);
    this.localHead = new THREE.Vector3(0, CLUB.eyeHeight, 0); this.localOrientation = new THREE.Quaternion();
    this.quaternion = new THREE.Quaternion(); this.temp = new THREE.Vector3();
    this.lookYaw = 0; this.pitch = 0; this.hover = null; this.lastPanel = ''; this.lastScreens = -Infinity;
    this.lastTooltip = ''; this.teleportTarget = null; this.teleportController = null;
    this.makeControllers(); this.makeTeleport(); this.makeFade(); this.makeComfort(); this.makeHands();
    this.comfortAmount = 0; this.dwellTarget = null; this.dwellStart = 0; this.screensUpdated = 0; this.avatarsVisible = 0; this.screenCursor = 0;
  }

  makeControllers() {
    this.controllers = [];
    for (let i = 0; i < 2; i++) {
      const ray = this.renderer.xr.getController(i); const grip = this.renderer.xr.getControllerGrip(i);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineBasicMaterial({ color: i ? '#e0af68' : '#7dcfff', transparent: true, opacity: .65 }));
      line.scale.z = 3; ray.add(line);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(.045, .045, .11), new THREE.MeshLambertMaterial({ color: i ? '#e0af68' : '#7dcfff' })); grip.add(handle);
      const trigger = new THREE.Mesh(new THREE.BoxGeometry(.02, .05, .02), new THREE.MeshLambertMaterial({ color: '#16161e' }));
      trigger.position.set(0, -.02, -.05); grip.add(trigger);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .03, 8), new THREE.MeshLambertMaterial({ color: '#c0caf5' }));
      stick.position.set(0, .035, .02); grip.add(stick);
      ray.addEventListener('connected', (event) => { ray.userData.hand = event.data.handedness; });
      ray.addEventListener('selectstart', () => {
        if (!this.game) return;
        const hit = this.controllerHit(ray);
        if (this.game.state === 'explore' && ray.userData.hand === 'left') { this.teleportController = ray; return; }
        this.select(hit);
      });
      ray.addEventListener('selectend', () => {
        if (this.teleportController !== ray) return;
        if (this.teleportTarget?.valid && this.game?.state === 'explore') this.onTeleport(this.teleportTarget.point);
        this.teleportController = null; this.teleportTarget = null;
      });
      this.rig.add(ray, grip); this.controllers.push({ ray, grip, line });
    }
  }

  makeTeleport() {
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(49 * 3), 3));
    this.arc = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#7dcfff' })); this.arc.frustumCulled = false; this.arc.visible = false; this.scene.add(this.arc);
    this.destination = new THREE.Mesh(new THREE.RingGeometry(.24, .3, 32), new THREE.MeshBasicMaterial({ color: '#9ece6a', side: THREE.DoubleSide }));
    this.destination.rotation.x = -Math.PI / 2; this.destination.visible = false; this.scene.add(this.destination);
  }

  makeFade() {
    this.fade = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { opacity: { value: 0 } }, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'void main(){gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: 'uniform float opacity;void main(){gl_FragColor=vec4(0.086,0.086,0.118,opacity);}',
    }));
    this.fade.frustumCulled = false; this.fade.renderOrder = 1000; this.fade.visible = false; this.scene.add(this.fade); this.fadeTime = 0;
  }

  makeComfort() {
    this.comfort = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { amount: { value: 0 } }, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: 'varying vec2 vUv;uniform float amount;void main(){float d=distance(vUv,vec2(.5));float edge=smoothstep(.32,.62,d)*amount;gl_FragColor=vec4(0.086,0.086,0.118,edge);}',
    }));
    this.comfort.frustumCulled = false; this.comfort.renderOrder = 999; this.comfort.visible = false; this.scene.add(this.comfort);
  }

  makeHands() {
    this.handDots = [];
    for (let i = 0; i < 2; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), new THREE.MeshBasicMaterial({ color: i ? '#e0af68' : '#7dcfff', depthTest: false, transparent: true, opacity: .9 }));
      dot.renderOrder = 150; dot.visible = false; this.scene.add(dot); this.handDots.push(dot);
    }
  }

  resize(width, height) {
    if (this.renderer.xr.isPresenting || width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false); this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
  }

  resetCamera() { this.camera.position.set(0, CLUB.eyeHeight, 0); this.camera.fov = 75; this.camera.rotation.set(this.pitch, this.lookYaw, 0, 'YXZ'); }

  setNotice(message) {
    this.notice.ctx.fillStyle = '#16161e'; this.notice.ctx.fillRect(0, 0, 1024, 192);
    paragraph(this.notice.ctx, message, 30, 57, 964, 28, '#e0af68'); this.notice.texture.needsUpdate = true; this.noticeTime = 4.5;
  }

  updateEnvironment(dt) {
    const onRoof = Math.abs(this.head.x - ROOF_CENTER.x) <= 10.4 && Math.abs(this.head.z - ROOF_CENTER.z) <= 7.4 ? 1 : 0;
    this.envMix += (onRoof - this.envMix) * Math.min(1, Math.max(0, dt) * 2.2);
    if (Math.abs(onRoof - this.envMix) < 0.002) this.envMix = onRoof;
    const m = this.envMix;
    this.scene.background.set(ENV_INSIDE.bg).lerp(this.envColor.set(ENV_ROOF.bg), m);
    this.scene.fog.color.set(ENV_INSIDE.fog).lerp(this.envColor.set(ENV_ROOF.fog), m);
    this.scene.fog.near = ENV_INSIDE.fogNear + (ENV_ROOF.fogNear - ENV_INSIDE.fogNear) * m;
    this.scene.fog.far = ENV_INSIDE.fogFar + (ENV_ROOF.fogFar - ENV_INSIDE.fogFar) * m;
    this.hemi.color.set(ENV_INSIDE.hemiSky).lerp(this.envColor.set(ENV_ROOF.hemiSky), m);
    this.hemi.groundColor.set(ENV_INSIDE.hemiGround).lerp(this.envColor.set(ENV_ROOF.hemiGround), m);
    this.hemi.intensity = ENV_INSIDE.hemi + (ENV_ROOF.hemi - ENV_INSIDE.hemi) * m;
    this.sun.color.set(ENV_INSIDE.sun).lerp(this.envColor.set(ENV_ROOF.sun), m);
    this.sun.intensity = ENV_INSIDE.sunI + (ENV_ROOF.sunI - ENV_INSIDE.sunI) * m;
  }

  headPose() {
    if (this.renderer.xr.isPresenting) {
      this.rig.updateWorldMatrix(true, false);
      this.head.copy(this.localHead).applyMatrix4(this.rig.matrixWorld);
      this.rig.getWorldQuaternion(this.quaternion).multiply(this.localOrientation);
      this.forward.set(0, 0, -1).applyQuaternion(this.quaternion);
    } else {
      this.camera.getWorldPosition(this.head); this.camera.getWorldDirection(this.forward); this.camera.getWorldQuaternion(this.quaternion);
    }
    this.up.set(0, 1, 0).applyQuaternion(this.quaternion);
    return this.head;
  }

  trackPose(pose) {
    if (!pose) return;
    this.localHead.copy(pose.transform.position);
    this.localOrientation.copy(pose.transform.orientation);
  }

  move(x, z, dt) {
    this.headPose();
    const length = Math.hypot(x, z); if (!length) return;
    const scale = CLUB.speed * Math.min(dt, .25) / Math.max(1, length);
    const forward = this.temp.copy(this.forward); forward.y = 0; forward.normalize();
    if (forward.lengthSq() < .000001) forward.set(-Math.sin(this.rig.rotation.y), 0, -Math.cos(this.rig.rotation.y));
    const dx = (-forward.z * x - forward.x * z) * scale;
    const dz = (forward.x * x - forward.z * z) * scale;
    const next = moveWithinRoom(this.head, dx, dz, this.game?.obstacles);
    this.rig.position.x += next.x - this.head.x; this.rig.position.z += next.z - this.head.z;
  }

  snapTurn(angle) {
    this.headPose(); const before = this.head.clone();
    this.rig.rotation.y += angle; this.scene.updateMatrixWorld(true);
    this.headPose();
    this.rig.position.x += before.x - this.head.x; this.rig.position.z += before.z - this.head.z;
    this.fadeTime = .1; this.turning = true;
  }

  smoothTurn(rate, dt) {
    if (!rate || !dt) return;
    this.headPose(); const before = this.head.clone();
    this.rig.rotation.y += rate * dt; this.scene.updateMatrixWorld(true);
    this.headPose();
    this.rig.position.x += before.x - this.head.x; this.rig.position.z += before.z - this.head.z;
    this.turning = true;
  }

  updateDwell(aimed, immersive) {
    if (!this.dwellEnabled || !immersive) { this.dwellTarget = null; return; }
    const action = this.buttonAt(aimed);
    const now = performance.now();
    if (action && action === this.dwellTarget && now - this.dwellStart > 900) {
      this.onAction(action); this.dwellTarget = null; return;
    }
    if (action !== this.dwellTarget) { this.dwellTarget = action; this.dwellStart = now; }
  }

  updateScreens(game, quality, reducedMotion) {
    const nearHz = quality?.screenNearHz ?? 12;
    const farHz = quality?.screenFarHz ?? 4;
    const nearCount = quality?.screenNearCount ?? 8;
    const nearInterval = 1 / nearHz; const farInterval = 1 / farHz;
    const revisionChanged = this.lastScreenRevision !== game.revision;
    const ranked = STATIONS.map((station) => ({ station, distance: Math.hypot(station.x - this.head.x, station.z - this.head.z) })).sort((a, b) => a.distance - b.distance);
    this.screensUpdated = 0;
    game.nearPowered = ranked.filter(({ station, distance }) => distance < 8 && game.devices[station.id]?.power).map(({ station }) => station);
    for (const [rank, { station, distance }] of ranked.entries()) {
      const key = station.id;
      const last = this.screenTimes?.get(key) ?? -Infinity;
      const interval = rank < nearCount ? nearInterval : farInterval;
      if (!revisionChanged && game.elapsed - last < interval) continue;
      if (distance > 28 && !revisionChanged) continue;
      const screen = this.room.screens.get(station.id);
      if (!screen) continue;
      drawStation(screen.ctx, station, game.devices[station.id], game.selected?.id === station.id ? game.arcade : null, game.jukebox, game.design, reducedMotion, this.art.renderer.logo, { best: game.best, posts: game.posts, pours: game.pours });
      screen.texture.needsUpdate = true;
      this.screenTimes ??= new Map();
      this.screenTimes.set(key, game.elapsed);
      this.screensUpdated++;
    }
    this.lastScreens = game.elapsed; this.lastScreenRevision = game.revision;
  }

  updateAvatars(game, quality, reducedMotion) {
    const cull = quality?.avatarCull ?? 30;
    this.avatarsVisible = 0;
    this.room.characters.forEach((avatar, i) => {
      const npc = game.crew[i];
      const distance = Math.hypot(this.head.x - npc.x, this.head.z - npc.z);
      const visible = distance < cull;
      avatar.visible = visible;
      if (!visible) return;
      this.avatarsVisible++;
      const far = distance > 12;
      const last = avatar.userData.lastAnimate ?? -Infinity;
      if (far && game.elapsed - last < 1 / 15) return;
      avatar.userData.lastAnimate = game.elapsed;
      this.room.avatarFactory.animate(avatar, npc, { state: game.state, reducedMotion, viewer: this.head });
      avatar.tag.visible = distance < 9;
      if (avatar.tag.visible) avatar.tag.lookAt(this.head);
    });
  }

  teleport(point, yaw) {
    if (!canStand(point.x, point.z, this.game?.obstacles)) return false;
    if (Number.isFinite(yaw)) { this.rig.rotation.y = yaw; this.lookYaw = 0; this.pitch = 0; }
    this.headPose(); this.rig.position.x += point.x - this.head.x; this.rig.position.z += point.z - this.head.z;
    this.fadeTime = .14; this.teleportController = null; this.teleportTarget = null;
    return true;
  }

  gamepadTeleport(held) {
    if (held && !this.padTeleportHeld && this.game?.state === 'explore') this.teleportController = this.renderer.xr.isPresenting ? this.renderer.xr.getCamera() : this.camera;
    if (!held && this.padTeleportHeld) {
      if (this.teleportTarget?.valid && this.game?.state === 'explore') this.onTeleport(this.teleportTarget.point);
      this.teleportController = null; this.teleportTarget = null;
    }
    this.padTeleportHeld = held;
  }

  targets() {
    if (!this.game) return [];
    if (this.game.state === 'sketch') return [this.toolbar.mesh, this.room.screens.get(this.game.selected.id).mesh];
    if (this.panel.mesh.visible) return [this.panel.mesh];
    return this.room.targets;
  }

  hits() {
    return this.raycaster.intersectObjects(this.targets(), false).find((hit) => {
      let object = hit.object;
      while (object) { if (!object.visible) return false; object = object.parent; }
      return true;
    });
  }

  controllerHit(controller) {
    controller.updateWorldMatrix(true, false);
    this.rotation.extractRotation(controller.matrixWorld); this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).transformDirection(this.rotation);
    return this.hits();
  }

  gazeHit() { this.headPose(); this.raycaster.ray.origin.copy(this.head); this.raycaster.ray.direction.copy(this.forward); return this.hits(); }

  buttonAt(hit) {
    const panel = hit?.object === this.panel.mesh ? this.panel : hit?.object === this.toolbar.mesh ? this.toolbar : null;
    if (!panel || !hit.uv) return null;
    const x = hit.uv.x * panel.canvas.width; const y = (1 - hit.uv.y) * panel.canvas.height;
    return panel.buttons.find((button) => !button.disabled && x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height)?.id;
  }

  select(hit) {
    if (!hit) return false;
    const action = this.buttonAt(hit);
    if (action) { this.onAction(action); return true; }
    if (this.game.state === 'sketch' && hit.object.userData.screen) { this.game.sketch(hit.uv.x, hit.uv.y); return true; }
    if (hit.object.userData.id) { this.onTarget(hit.object.userData.id); return true; }
    return false;
  }

  selectAt(pointer) { this.raycaster.setFromCamera(pointer, this.camera); return this.select(this.hits()); }

  interactNearest() {
    const hit = this.gazeHit();
    if (this.select(hit)) return;
    this.headPose();
    const range = this.game?.INTERACT_RANGE || 3;
    const target = [...(this.game?.crew || CLUB_CREW), ...STATIONS, ...CLUB_OBJECTS, ...(this.game ? [this.game.virus, this.game.dragon] : [])].filter((item) => Math.hypot(item.x - this.head.x, item.z - this.head.z) <= range).sort((a, b) => Math.hypot(a.x - this.head.x, a.z - this.head.z) - Math.hypot(b.x - this.head.x, b.z - this.head.z))[0];
    if (target) this.onTarget(target.id);
  }

  placePanel(mesh, state) {
    this.headPose();
    const forward = this.forward.clone(); forward.y = 0; forward.normalize();
    let distance = 1.85;
    if (state === 'talk' && this.game.selected) forward.set(this.game.selected.x - this.head.x, 0, this.game.selected.z - this.head.z).normalize();
    if (state === 'talk' && this.game.selected?.seated) distance = Math.min(1.65, Math.max(.75, Math.hypot(this.game.selected.x - this.head.x, this.game.selected.z - this.head.z) - 1.35));
    if (['device', 'arcade'].includes(state) && this.game.selected) distance = Math.min(1.85, Math.max(.65, Math.hypot(this.game.selected.x - this.head.x, this.game.selected.z - this.head.z) - .8));
    const scale = distance / 1.85;
    mesh.scale.setScalar(scale);
    mesh.position.set(this.head.x + forward.x * distance, this.head.y - (state === 'talk' ? .72 : state === 'arcade' ? .2 : .45) * scale, this.head.z + forward.z * distance);
    if (state === 'talk') {
      if (this.game.selected?.seated) mesh.position.y = Math.max(.55, this.game.selected.eyeHeight - .2 - .53125 * scale);
      else this.clearCharacter(mesh, forward);
    }
    mesh.rotation.set(0, Math.atan2(this.head.x - mesh.position.x, this.head.z - mesh.position.z), 0);
    if (state === 'talk') this.game.dialogueSpace = { x: mesh.position.x, z: mesh.position.z, width: Math.abs(Math.cos(mesh.rotation.y)) * 1.7 * scale + .2, depth: Math.abs(Math.sin(mesh.rotation.y)) * 1.7 * scale + .2 };
    if (state === 'sketch') mesh.position.y = this.head.y - .96;
    const overlay = ['entry', 'paused', 'map', 'sketch', 'device', 'arcade'].includes(state) || state === 'talk' && this.game.selected?.seated;
    mesh.material.depthTest = !overlay;
    mesh.material.depthWrite = !overlay;
    mesh.renderOrder = overlay ? 200 : 0;
  }

  clearCharacter(mesh, forward) {
    const avatar = this.room.characters.find((item) => item.userData.characterId === this.game.selected.id);
    if (!avatar) return;
    avatar.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3();
    avatar.traverse((part) => { if (part.isInstancedMesh && part.visible) bounds.union(new THREE.Box3().setFromObject(part)); });
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const scale = mesh.scale.x; const halfWidth = .85 * scale;
    let minimum = Infinity; let maximum = -Infinity;
    for (const x of [bounds.min.x, bounds.max.x]) for (const z of [bounds.min.z, bounds.max.z]) {
      const delta = new THREE.Vector3(x - this.head.x, 0, z - this.head.z);
      const projected = delta.dot(right) / Math.max(.2, delta.dot(forward)) * 1.85 * scale;
      minimum = Math.min(minimum, projected); maximum = Math.max(maximum, projected);
    }
    const candidates = [maximum + .24 * scale + halfWidth, minimum - .24 * scale - halfWidth].map((offset) => {
      const position = mesh.position.clone().addScaledVector(right, offset);
      const yaw = Math.atan2(this.head.x - position.x, this.head.z - position.z);
      const halfX = Math.abs(Math.cos(yaw)) * halfWidth + .03; const halfZ = Math.abs(Math.sin(yaw)) * halfWidth + .03;
      const overlaps = this.game.obstacles.filter((box) => box.id !== this.game.selected.id && box.height > position.y - .53125 * scale && Math.abs(position.x - box.x) < halfX + box.width / 2 && Math.abs(position.z - box.z) < halfZ + box.depth / 2).length;
      return { position, score: overlaps * 100 + Math.abs(offset) };
    });
    candidates.sort((a, b) => a.score - b.score);
    mesh.position.copy(candidates[0].position);
  }

  drawButton(panel, action, x, y, width, height, primary = false) {
    const ctx = panel.ctx; const hover = this.hover === action.id;
    ctx.save();
    if (action.disabled) ctx.globalAlpha = .36;
    ctx.fillStyle = primary ? hover ? '#ffd578' : '#e0af68' : hover ? '#343b58' : '#24283b'; ctx.fillRect(x, y, width, height);
    ctx.lineWidth = hover ? 4 : 2; ctx.strokeStyle = hover ? '#7dcfff' : '#565f89'; ctx.strokeRect(x, y, width, height);
    const color = primary ? '#16161e' : '#c0caf5';
    if (action.detail) {
      paragraph(ctx, action.label, x + 14, y + 23, width - 28, 21, color, 1.05);
      ctx.fillStyle = primary ? '#24283b' : '#9aa5ce'; ctx.font = '18px "Courier New", monospace'; ctx.textAlign = 'left';
      ctx.fillText(action.detail, x + 14, y + height - 10, width - 28);
    } else {
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = `${action.label.length > 26 ? 23 : 26}px "Courier New", monospace`;
      ctx.fillText(action.label, x + width / 2, y + height / 2 + 9, width - 24);
    }
    ctx.restore();
    panel.buttons.push({ ...action, x, y, width, height });
  }

  drawPanel(game, immersive, reducedMotion = false) {
    const model = game.panel();
    this.panel.mesh.visible = immersive && Boolean(model) && game.state !== 'sketch';
    this.toolbar.mesh.visible = immersive && game.state === 'sketch';
    if (!model) { this.lastPanel = ''; this.panelIdentity = ''; return; }
    const identity = `${game.state}:${game.selected?.id || ''}`;
    if (identity !== this.panelIdentity) { this.placePanel(game.state === 'sketch' ? this.toolbar.mesh : this.panel.mesh, game.state); this.panelIdentity = identity; }
    const signature = `${game.revision}:${this.hover}:${game.arcade?.elapsed.toFixed(1) || ''}:${immersive}:${model.layout === 'design' ? game.design.clock.toFixed(1) : ''}:${reducedMotion}`;
    if (signature === this.lastPanel) return;
    this.lastPanel = signature;
    if (game.state === 'sketch') {
      this.toolbar.ctx.fillStyle = '#16161e'; this.toolbar.ctx.fillRect(0, 0, 512, 128); this.toolbar.buttons = [];
      this.drawButton(this.toolbar, { id: 'clear-sketch', label: 'CLEAR' }, 16, 28, 232, 70);
      this.drawButton(this.toolbar, { id: 'back', label: 'BACK' }, 264, 28, 232, 70);
      this.toolbar.texture.needsUpdate = true; return;
    }
    const p = this.panel; const ctx = p.ctx; p.buttons = [];
    ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 1024, 640); ctx.strokeStyle = '#565f89'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 1020, 636);
    ctx.fillStyle = '#f7768e'; ctx.font = `${model.title.length > 23 ? 24 : 32}px Arcade, monospace`; ctx.fillText(model.title, 40, 65);
    if (model.subtitle) { ctx.fillStyle = '#e0af68'; ctx.font = '23px "Courier New", monospace'; ctx.fillText(model.subtitle, 40, 105, 940); }
    if (model.layout === 'design') {
      ctx.save(); ctx.translate(40, 157); drawDesignPoster(ctx, game.design, 470, 264, reducedMotion); ctx.restore();
      paragraph(ctx, model.text, 40, 474, 465, 24);
      model.options.forEach((action, i) => this.drawButton(p, action, 550, 155 + i * 98, 434, 72, Boolean(action.primary)));
      p.texture.needsUpdate = true; return;
    }
    let startY = model.layout === 'security' ? 430 : model.layout === 'guide' ? 344 : 320;
    if (game.state === 'arcade') {
      ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 1024, 640);
      ctx.save(); ctx.translate(205, 38); drawCabinet(ctx, game.arcade, 614, 460); ctx.restore();
      ctx.fillStyle = '#9aa5ce'; ctx.font = '22px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText('STICK: MOVE · TRIGGER: FIRE · B: BACK', 512, 531); ctx.textAlign = 'left';
      startY = 554;
    } else if (game.state === 'map') {
      paragraph(ctx, model.text, 40, 146, 418, 27);
      drawMap(ctx, 505, 104, 465, 205, game.position); startY = 333;
    } else {
      paragraph(ctx, model.text, 40, model.subtitle ? 148 : 130, model.portrait ? 790 : 940, model.layout === 'guide' ? 26 : 28);
      if (model.portrait) { ctx.imageSmoothingEnabled = false; ctx.drawImage(this.room.avatarFactory.portrait(model.portrait), 874, 123, 88, 190); }
      if (game.state === 'entry') paragraph(ctx, 'LEFT STICK: WALK · RIGHT STICK: SNAP TURN. Hold the left trigger and aim at the floor to teleport.', 40, 245, 940, 26, '#7dcfff');
    }
    if (model.layout === 'jukebox') {
      model.options.forEach((action, i) => {
        const row = i < model.rows;
        const index = row ? i : i - model.rows;
        const columns = row ? 2 : model.footerColumns;
        const step = columns === 3 ? 318 : 484;
        const height = row ? 80 : 58;
        this.drawButton(p, action, 40 + index % columns * step, (row ? 212 : 488) + Math.floor(index / columns) * (height + 12), step - 24, height, action.primary ?? false);
      });
      p.texture.needsUpdate = true; return;
    }
    const buttonHeight = game.state === 'map' ? 51 : 62;
    const columns = game.state === 'arcade' || game.state === 'map' ? 3 : 2;
    const step = columns === 3 ? 318 : 484;
    const width = columns === 3 ? 304 : 460;
    model.options.forEach((action, i) => this.drawButton(p, action, 40 + i % columns * step, startY + Math.floor(i / columns) * (buttonHeight + 12), width, buttonHeight, action.primary ?? i === 0));
    p.texture.needsUpdate = true;
  }

  updateTeleport() {
    this.arc.visible = this.destination.visible = false;
    if (!this.teleportController || this.game.state !== 'explore') { this.teleportTarget = null; return; }
    const controller = this.teleportController;
    if (controller.isCamera) { this.headPose(); this.temp.copy(this.head); }
    else { controller.getWorldPosition(this.temp); controller.getWorldDirection(this.forward).negate(); }
    this.teleportTarget = teleportArc(this.temp, this.forward, this.game.obstacles);
    const { points, point, valid } = this.teleportTarget;
    const positions = this.arc.geometry.attributes.position;
    points.forEach((p, i) => positions.setXYZ(i, p.x, p.y, p.z)); positions.needsUpdate = true; this.arc.geometry.setDrawRange(0, points.length);
    this.arc.material.color.set(valid ? '#7dcfff' : '#f7768e'); this.arc.visible = true;
    this.destination.position.set(point.x, .028, point.z); this.destination.material.color.set(valid ? '#9ece6a' : '#f7768e'); this.destination.visible = true;
  }

  drawTooltip(hit, immersive) {
    let text = '';
    if (hit?.object.userData.id && this.game.state === 'explore') {
      const target = [...this.game.crew, ...STATIONS, ...CLUB_OBJECTS, this.game.virus, this.game.dragon].find((item) => item.id === hit.object.userData.id);
      if (target) { const distance = Math.hypot(target.x - this.head.x, target.z - this.head.z); text = distance <= 3 ? `${target.topics ? 'TALK TO' : 'USE'} ${target.name.toUpperCase()}` : distance <= 5 ? 'MOVE CLOSER' : ''; }
    }
    this.hint = text;
    this.tooltip.mesh.visible = immersive && Boolean(text);
    if (text !== this.lastTooltip) {
      this.lastTooltip = text; const ctx = this.tooltip.ctx;
      ctx.clearRect(0, 0, 512, 96); ctx.fillStyle = '#16161ee8'; ctx.fillRect(0, 0, 512, 96); ctx.fillStyle = '#7dcfff'; ctx.textAlign = 'center'; ctx.font = `${text.length > 29 ? 19 : 25}px "Courier New", monospace`; ctx.fillText(text, 256, 57); this.tooltip.texture.needsUpdate = true;
    }
  }

  update(game, { immersive = false, reducedMotion = false, quality = null, comfort = true, speedAmount = 0 } = {}, dt = 0) {
    this.game = game;
    if (!this.renderer.xr.isPresenting) { this.camera.position.set(0, CLUB.eyeHeight, 0); this.camera.rotation.set(this.pitch, this.lookYaw, 0, 'YXZ'); }
    this.scene.updateMatrixWorld(true); this.headPose();
    game.position.x = this.head.x; game.position.z = this.head.z;
    this.updateScreens(game, quality, reducedMotion);
    this.updateAvatars(game, quality, reducedMotion);
    this.updateEnvironment(dt);
    this.room.malibu.update(game.elapsed, reducedMotion);
    this.room.security.update(game.virus, reducedMotion, this.head, game.state === 'device' && game.selected?.id === game.virus.id);
    this.room.dragon.update(game.dragon, reducedMotion, this.head, game.state === 'device' && game.selected?.id === game.dragon.id);
    this.room.design.update(game.design, reducedMotion);
    this.room.roof.update(game.elapsed, reducedMotion);
    this.hover = null;
    let aimed = null;
    for (const [index, { ray, line }] of this.controllers.entries()) {
      const hit = ray.visible && immersive ? this.controllerHit(ray) : null;
      line.visible = immersive && this.teleportController !== ray; line.scale.z = Math.min(4, hit?.distance || 4);
      if (hit) { aimed = hit; this.hover = this.buttonAt(hit) || this.hover; }
      const dot = this.handDots[index];
      if (dot) {
        if (immersive && ray.visible) {
          ray.getWorldPosition(dot.position);
          ray.getWorldDirection(this.temp); dot.position.addScaledVector(this.temp, Math.min(4, hit?.distance || 1)); dot.visible = true;
        } else dot.visible = false;
      }
    }
    const gaze = this.gazeHit();
    if (!aimed) aimed = gaze;
    this.updateDwell(aimed, immersive);
    this.cursor.visible = !immersive || !this.controllers.some(({ ray }) => ray.visible);
    this.drawPanel(game, immersive, reducedMotion); this.updateTeleport(); this.headPose(); this.drawTooltip(aimed, immersive);
    this.fadeTime = Math.max(0, this.fadeTime - dt); this.fade.visible = this.fadeTime > 0;
    this.fade.material.uniforms.opacity.value = Math.min(1, this.fadeTime / .1);
    const target = comfort && immersive ? Math.min(.85, speedAmount * .9 + (this.turning ? .5 : 0)) : 0;
    this.comfortAmount += (target - this.comfortAmount) * Math.min(1, dt * 6);
    this.comfort.visible = this.comfortAmount > .02;
    this.comfort.material.uniforms.amount.value = this.comfortAmount;
    this.turning = false;
    this.noticeTime = Math.max(0, this.noticeTime - dt); this.notice.mesh.visible = immersive && this.noticeTime > 0;
    this.renderer.render(this.scene, this.camera); this.headPose();
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    const geometries = new Set(); const materials = new Set(); const textures = new Set();
    this.scene.traverse((object) => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); if (object.material?.map) textures.add(object.material.map); if (object.material?.envMap) textures.add(object.material.envMap); if (object.isInstancedMesh) object.dispose(); });
    geometries.forEach((geometry) => geometry.dispose()); materials.forEach((material) => material.dispose()); textures.forEach((texture) => texture.dispose());
    this.art.dispose(); this.renderer.dispose();
  }
}
