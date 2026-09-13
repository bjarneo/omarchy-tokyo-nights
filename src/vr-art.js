import * as THREE from '../assets/three.module.js';
import { Renderer } from './renderer.js';
import { CHARACTERS, getCharacter } from './characters.mjs';
import { CARS, getCar, getPaint } from './cars.mjs';

const SHAPES = {
  countach: { width: 2.05, length: 4.15, roof: 1.06, nose: .43, wing: 1.02, cabin: 1.45 },
  skyline: { width: 1.75, length: 4.5, roof: 1.34, nose: .66, wing: .89, cabin: 1.95 },
  supra: { width: 1.84, length: 4.45, roof: 1.25, nose: .51, wing: 1.2, cabin: 1.65 },
  rx7: { width: 1.78, length: 4.25, roof: 1.15, nose: .44, wing: .86, cabin: 1.6 },
  nsx: { width: 1.9, length: 4.42, roof: 1.08, nose: .43, wing: .89, cabin: 1.5 },
  '911': { width: 1.82, length: 4.2, roof: 1.32, nose: .56, wing: .99, cabin: 1.9 },
  f40: { width: 1.99, length: 4.36, roof: 1.1, nose: .44, wing: 1.25, cabin: 1.45 },
  ae86: { width: 1.64, length: 4.18, roof: 1.36, nose: .63, wing: 0, cabin: 2.05 },
  '240z': { width: 1.64, length: 4.12, roof: 1.22, nose: .55, wing: 0, cabin: 1.62 },
};

export class VRArt {
  constructor() {
    this.renderer = new Renderer(document.createElement('canvas'), { reducedMotion: true });
    this.cube = new THREE.BoxGeometry(1, 1, 1);
    this.voxelMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.pickMaterial = new THREE.MeshBasicMaterial({ visible: false });
    this.materials = new Map();
    this.textures = new Map();
    this.characterParts = new Map();
    this.carTemplates = new Map();
    this.scratch = new THREE.Object3D();
    this.color = new THREE.Color();
    this.ready = this.renderer.logoReady;
  }

  texture(key, canvas) {
    if (!this.textures.has(key)) {
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      this.textures.set(key, texture);
    }
    return this.textures.get(key);
  }

  material(color, basic = false) {
    const key = `${color}:${basic}`;
    if (!this.materials.has(key)) this.materials.set(key, basic ? new THREE.MeshBasicMaterial({ color, toneMapped: false }) : new THREE.MeshLambertMaterial({ color }));
    return this.materials.get(key);
  }

  box(parent, x, y, z, w, h, d, color, basic = false) {
    const mesh = new THREE.Mesh(this.cube, this.material(color, basic));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
  }

  spritePlane(canvas, key, width, height) {
    const texture = this.texture(key, canvas);
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, alphaTest: .45, side: THREE.DoubleSide, toneMapped: false }));
  }

  nameTag(label, color = '#e0af68') {
    const canvas = document.createElement('canvas');
    canvas.width = 384; canvas.height = 72;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 384, 72);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(2, 2, 380, 68);
    ctx.fillStyle = color; ctx.font = '28px "Courier New", monospace'; ctx.textAlign = 'center';
    ctx.fillText(label, 192, 45);
    return this.spritePlane(canvas, `tag:${label}:${color}`, 1, .1875);
  }

  patronTexture(id) {
    const key = `patron:${id}`;
    if (!this.textures.has(key)) {
      const texture = this.texture(key, this.renderer.getPatronPoster(id));
      void this.renderer.patronsReady.then(() => { texture.needsUpdate = true; });
    }
    return this.textures.get(key);
  }

  patronSign(id) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.09), new THREE.MeshBasicMaterial({ map: this.patronTexture(id), side: THREE.DoubleSide, toneMapped: false }));
    sign.name = `patron-${id}`;
    return sign;
  }

  voxelPart(id, facing, start, end, pivot = 0) {
    const key = `${id}:${facing}:${start}:${end}`;
    if (!this.characterParts.has(key)) {
      const source = this.renderer.getFullCharacter(id, facing);
      const pixels = source.getContext('2d').getImageData(0, 0, 48, 104).data;
      const runs = [];
      for (let y = start; y < end; y++) {
        for (let x = 0; x < 48;) {
          const offset = (y * 48 + x) * 4;
          if (pixels[offset + 3] < 128) { x++; continue; }
          let width = 1;
          while (x + width < 48) {
            const next = offset + width * 4;
            if (pixels[next + 3] < 128 || pixels[next] !== pixels[offset] || pixels[next + 1] !== pixels[offset + 1] || pixels[next + 2] !== pixels[offset + 2]) break;
            width++;
          }
          runs.push({ x, y, width, r: pixels[offset], g: pixels[offset + 1], b: pixels[offset + 2] });
          x += width;
        }
      }
      const mesh = new THREE.InstancedMesh(this.cube, this.voxelMaterial, runs.length);
      const unit = 1.68 / 104;
      runs.forEach((run, i) => {
        const depth = run.y < 34 ? .29 : run.y < 70 ? .23 : .16;
        this.scratch.position.set((run.x + run.width / 2 - 24) * unit, (104 - run.y - .5) * unit - pivot, 0);
        this.scratch.scale.set(run.width * unit, unit, depth);
        this.scratch.rotation.set(0, 0, 0);
        this.scratch.updateMatrix();
        mesh.setMatrixAt(i, this.scratch.matrix);
        mesh.setColorAt(i, this.color.setRGB(run.r / 255, run.g / 255, run.b / 255, THREE.SRGBColorSpace));
      });
      mesh.computeBoundingSphere();
      this.characterParts.set(key, mesh);
    }
    return this.characterParts.get(key).clone();
  }

  character(characterId, { seated = false, action = null } = {}) {
    const id = getCharacter(characterId).id;
    const group = new THREE.Group();
    group.name = `character-${id}`;
    group.userData.characterId = id;
    group.userData.action = action;
    const head = new THREE.Group();
    const faces = {};
    for (const facing of ['back', 'profile', 'smile']) {
      faces[facing] = this.voxelPart(id, facing, 0, 34);
      faces[facing].visible = facing === 'smile';
      head.add(faces[facing]);
    }
    const body = this.voxelPart(id, 'smile', 34, 70);
    const hip = (104 - 70) * 1.68 / 104;
    const legs = this.voxelPart(id, 'smile', 70, 104, hip);
    legs.position.y = hip;
    if (seated) legs.rotation.x = -Math.PI / 2;
    group.add(head, body, legs);
    const tag = this.nameTag(getCharacter(id).name.toUpperCase());
    tag.position.set(0, 1.83, 0);
    tag.visible = !seated;
    group.add(tag);
    group.head = head;
    group.faces = faces;
    group.tag = tag;
    const target = new THREE.Mesh(new THREE.BoxGeometry(.58, 1.68, .32), this.pickMaterial);
    target.position.y = .84;
    group.add(target);
    group.pickTarget = target;
    return group;
  }

  face(avatar, facing) {
    for (const [pose, mesh] of Object.entries(avatar.faces)) mesh.visible = pose === facing;
  }

  carTexture(carId, paintId) {
    return this.texture(`car:${carId}:${paintId}`, this.renderer.getCarSprite(carId, paintId));
  }

  wedge(width, length, bottom, front, rear) {
    const w = width / 2; const l = length / 2;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      -w, bottom, -l, w, bottom, -l, w, front, -l, -w, front, -l,
      -w, bottom, l, w, bottom, l, w, rear, l, -w, rear, l,
    ], 3));
    geometry.setIndex([0, 3, 2, 0, 2, 1, 4, 5, 6, 4, 6, 7, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5, 3, 7, 6, 3, 6, 2, 0, 1, 5, 0, 5, 4]);
    geometry.computeVertexNormals();
    return geometry;
  }

  car(carId, paintId, action = null) {
    const id = getCar(carId).id;
    const paint = getPaint(paintId);
    const key = `${id}:${paint.id}`;
    if (!this.carTemplates.has(key)) {
      const shape = SHAPES[id];
      const group = new THREE.Group();
      group.name = `car-${id}`;
      const body = new THREE.Mesh(this.wedge(shape.width, shape.length, .26, shape.nose, .7), this.material(paint.hex));
      group.add(body);
      const cabin = new THREE.Mesh(this.wedge(shape.width * .73, shape.cabin, .63, shape.roof - .16, shape.roof), this.material('#242d45'));
      cabin.position.z = .1;
      group.add(cabin);
      this.box(group, 0, shape.roof, .32, shape.width * .7, .07, shape.cabin * .46, paint.hex);
      this.box(group, 0, .43, -shape.length / 2 - .02, shape.width * .84, .15, .04, '#16161e');
      for (const side of [-1, 1]) {
        this.box(group, side * shape.width * .35, shape.nose + .03, -shape.length * .4, shape.width * .2, .08, .24, '#c0caf5', true);
        this.box(group, side * (shape.width / 2 + .04), .91, -.5, .22, .12, .25, paint.hex);
        const trim = this.box(group, side * shape.width * .48, .5, 0, .04, .055, shape.length * .78, '#343b58');
        if (id === 'ae86') trim.scale.y = .16;
        for (const z of [-shape.length * .29, shape.length * .3]) {
          const tire = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .2, 12), this.material('#11131c'));
          tire.rotation.z = Math.PI / 2;
          tire.position.set(side * shape.width * .47, .32, z);
          const hub = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .205, 8), this.material('#9aa5ce'));
          hub.rotation.z = Math.PI / 2;
          hub.position.copy(tire.position);
          group.add(tire, hub);
        }
      }
      if (shape.wing) {
        for (const side of [-1, 1]) this.box(group, side * shape.width * .35, (shape.wing + .65) / 2, shape.length * .39, .07, shape.wing - .6, .2, paint.hex);
        this.box(group, 0, shape.wing, shape.length * .39, shape.width * 1.03, .08, id === '911' ? .5 : .3, paint.hex);
      }
      if (id === 'countach' || id === 'f40') {
        for (const side of [-1, 1]) this.box(group, side * shape.width * .4, .83, shape.length * .2, .25, .19, .7, '#16161e');
      }
      const rear = new THREE.Mesh(new THREE.PlaneGeometry(shape.width * 1.03, shape.width * 55 / 96), new THREE.MeshBasicMaterial({ map: this.carTexture(id, paint.id), alphaTest: .45, toneMapped: false }));
      rear.position.set(0, shape.width * 55 / 96 / 2, shape.length / 2 + .035);
      group.add(rear);
      const tag = this.nameTag(getCar(id).label.toUpperCase(), '#7dcfff');
      tag.position.set(0, 1.65, .15);
      group.add(tag);
      const target = new THREE.Mesh(new THREE.BoxGeometry(shape.width, shape.roof + .2, shape.length), this.pickMaterial);
      target.name = 'car-pick-target';
      target.position.y = (shape.roof + .2) / 2;
      group.add(target);
      this.carTemplates.set(key, group);
    }
    const car = this.carTemplates.get(key).clone(true);
    car.userData.carId = id;
    car.userData.paintId = paint.id;
    car.userData.action = action;
    car.pickTarget = car.getObjectByName('car-pick-target');
    return car;
  }

  garageWall() {
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 240;
    const full = document.createElement('canvas');
    full.width = 768; full.height = 480;
    const mesh = this.spritePlane(canvas, 'garage-wall', 22.4, 7);
    const draw = () => {
      this.renderer.drawGarage(full.getContext('2d'), full.width, full.height);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(full, 0, 76, 768, 208, 0, 0, 768, 240);
      mesh.material.map.needsUpdate = true;
    };
    draw();
    void this.ready.then(draw);
    return mesh;
  }

  sign(label, color = '#7dcfff', vertical = false) {
    const canvas = document.createElement('canvas');
    canvas.width = vertical ? 48 : 160;
    canvas.height = vertical ? 160 : 48;
    this.renderer.sign(canvas.getContext('2d'), 8, 8, label, color, vertical, 2);
    return this.spritePlane(canvas, `sign:${label}`, vertical ? 1.4 : 5, vertical ? 4.67 : 1.5);
  }

  logoSign(kind) {
    const canvas = document.createElement('canvas');
    canvas.width = 384; canvas.height = 144;
    const mesh = this.spritePlane(canvas, `logo:${kind}`, 6.4, 2.4);
    const draw = () => {
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 384, 144);
      ctx.strokeStyle = kind === 'cliamp' ? '#e0af68' : '#9ece6a'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, 380, 140);
      const logo = kind === 'cliamp' ? this.renderer.cliampLogo : this.renderer.logo;
      if (logo) ctx.drawImage(logo, 22, 22, 340, 340 * logo.height / logo.width);
      ctx.fillStyle = '#9aa5ce'; ctx.font = '18px "Courier New", monospace'; ctx.textAlign = 'center';
      ctx.fillText(kind === 'cliamp' ? 'THE TUI MUSIC PLAYER' : 'TOKYO NIGHT · THE MIDNIGHT RUN', 192, 121);
      mesh.material.map.needsUpdate = true;
    };
    draw(); void this.ready.then(draw);
    return mesh;
  }

  previews(driverCanvas, carCanvas, game) {
    const ctx = driverCanvas.getContext('2d');
    ctx.clearRect(0, 0, driverCanvas.width, driverCanvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.renderer.getFullCharacter(game.characterId), 0, 0, driverCanvas.width, driverCanvas.height);
    this.renderer.drawCarPreview(carCanvas, game.carId, game.paintId);
  }

  dispose() {
    this.textures.forEach((texture) => texture.dispose());
    this.materials.forEach((material) => material.dispose());
    this.voxelMaterial.dispose();
    this.pickMaterial.dispose();
    this.cube.dispose();
    this.characterParts.forEach((mesh) => mesh.dispose());
    this.carTemplates.forEach((group) => group.traverse((object) => { if (object.geometry !== this.cube) object.geometry?.dispose(); }));
  }
}

export { CHARACTERS, CARS };
