import * as THREE from '../assets/three.module.js';
import { isRocketView, rocketFlightPhase } from './rocket.mjs';
import { roadOffset, WORLD_SCALE, ROAD_HALF_WIDTH } from './vr-world.mjs';
import { FOUNDING_PATRONS } from './patrons.mjs';
import { rocketThemeAt, blendColor, MAX_ROCKET_COLORS } from './rocket-themes.mjs';

const hash = (n) => { const x = Math.sin(n * 127.1 + 83.7) * 43758.5453; return x - Math.floor(x); };

export class VRRocket {
  constructor(scene, art) {
    this.scene = scene;
    this.art = art;
    this.box = new THREE.BoxGeometry(1, 1, 1);
    this.materials = new Map();
    this.marker = new THREE.Group();
    this.space = new THREE.Group();
    this.flight = new THREE.Group();
    this.mars = new THREE.Group();
    this.space.add(this.flight, this.mars);
    scene.add(this.marker, this.space);
    this.marker.visible = this.space.visible = false;
    this.cube(this.marker, 0, .01, 0, 5, .08, 18, 0x294555);
    for (const side of [-1, 1]) this.cube(this.marker, side * 2.4, .07, 0, .1, .03, 18, 0x7dcfff, true);
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 8, 12), this.material(0xc0caf5));
    hull.position.y = 6;
    this.marker.add(hull);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.7, 4, 12), this.material(0xbb9af7));
    nose.position.y = 12;
    this.marker.add(nose);
    for (const side of [-1, 1]) this.cube(this.marker, side * 2, 2.1, -.2, .3, 4.2, 3.3, 0x7aa2f7);
    this.cube(this.marker, 0, 1.4, 1.7, 2.65, 2.8, .04, 0x16161e, true);
    for (const side of [-1, 1]) this.cube(this.marker, side * 1.4, 1.4, 1.75, .08, 2.8, .05, 0x7dcfff, true);
    const logo = art.logoSign('omarchy');
    logo.scale.setScalar(.43);
    logo.position.set(0, 6.3, 1.73);
    this.marker.add(logo);
    const destination = art.nameTag('MARS · 20 SECONDS', '#7dcfff');
    destination.scale.setScalar(4);
    destination.position.set(0, 3.6, 2.2);
    this.marker.add(destination);

    this.streaks = new THREE.InstancedMesh(this.box, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: false }), 140);
    this.streaks.frustumCulled = false;
    this.flight.add(this.streaks);
    this.rings = new THREE.InstancedMesh(this.box, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, fog: false }), MAX_ROCKET_COLORS * 5);
    this.rings.frustumCulled = false;
    this.rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.flight.add(this.rings);
    this.matrix = new THREE.Object3D();
    this.color = new THREE.Color();
    const sphere = new THREE.SphereGeometry(1, 24, 16);
    this.earth = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x7aa2f7, fog: false }));
    this.earth.position.set(-25, -7, -90);
    this.flight.add(this.earth);
    this.planet = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xc97868, fog: false }));
    this.flight.add(this.planet);
    const cabin = new THREE.Group();
    this.cabinPanels = [];
    this.cabinLights = [];
    const themedCube = (parts, ...args) => {
      const mesh = this.cube(cabin, ...args);
      mesh.material = mesh.material.clone();
      parts.push(mesh);
    };
    for (const side of [-1, 1]) {
      themedCube(this.cabinPanels, side * 2.3, 1.7, -1, .15, 3.4, 6, 0x343b58);
      themedCube(this.cabinLights, side * 2.17, 2.5, -1, .035, .06, 6, 0x7dcfff, true);
    }
    themedCube(this.cabinPanels, 0, 3.4, -1, 4.6, .15, 6, 0x343b58);
    const cabinLogo = art.logoSign('omarchy');
    cabinLogo.scale.setScalar(.4);
    cabinLogo.position.set(0, 2.6, -4.5);
    cabin.add(cabinLogo);
    this.flight.add(cabin);

    this.cube(this.mars, 0, -.07, -45, 350, .1, 350, 0xad675b, true);
    for (let i = 0; i < 35; i++) {
      const rock = this.cube(this.mars, (hash(i) - .5) * 160, .5 + hash(i + 30) * 3, -18 - hash(i + 7) * 120, 2 + hash(i + 2) * 8, 1 + hash(i + 3) * 8, 3 + hash(i + 4) * 8, i % 2 ? 0x854f5d : 0xc97868);
      rock.rotation.y = hash(i + 16) * 2;
    }
    this.cube(this.mars, 12, 2.8, -18, 12, 5.6, 8, 0x343b58);
    this.cube(this.mars, 12, 5.7, -18, 12.4, .15, 8.4, 0x7dcfff, true);
    const baseLogo = art.logoSign('omarchy');
    baseLogo.position.set(12, 4.2, -13.95);
    this.mars.add(baseLogo);
    const baseLabel = art.nameTag('MARS OUTPOST', '#f7768e');
    baseLabel.scale.setScalar(4);
    baseLabel.position.set(12, 6.2, -13.9);
    this.mars.add(baseLabel);
    this.patronSigns = FOUNDING_PATRONS.slice(0, 2).map(({ id }, index) => {
      const sign = art.patronSign(id);
      sign.position.set(9.3 + index * 5.4, 1.4, -13.85);
      this.mars.add(sign);
      return sign;
    });
    const earth = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x7aa2f7, fog: false }));
    earth.position.set(35, 35, -160);
    earth.scale.setScalar(3);
    this.mars.add(earth);
  }

  material(color, basic = false) {
    const key = `${color}:${basic}`;
    if (!this.materials.has(key)) this.materials.set(key, basic ? new THREE.MeshBasicMaterial({ color, toneMapped: false, fog: false }) : new THREE.MeshLambertMaterial({ color }));
    return this.materials.get(key);
  }

  cube(parent, x, y, z, w, h, d, color, basic = false) {
    const mesh = new THREE.Mesh(this.box, this.material(color, basic));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
  }

  update(game, options, cameraX) {
    const space = isRocketView(game) || game.state === 'mars';
    this.space.visible = space;
    this.space.position.x = cameraX;
    const ahead = game.rocketAt == null ? Infinity : (game.rocketAt - game.distance) * WORLD_SCALE;
    this.marker.visible = !space && !options.garage && ahead > -20 && ahead < 350;
    if (this.marker.visible) this.marker.position.set(roadOffset(game.distance, ahead) + game.rocketLane * ROAD_HALF_WIDTH, 0, -ahead);
    if (!space) return false;
    const arrived = game.state === 'mars';
    if (arrived && game.patronTour && this.patronTour !== game.patronTour) {
      this.patronTour = game.patronTour;
      this.patronSigns.forEach((sign, index) => { sign.material.map = this.art.patronTexture(game.patronTour.mars[index]); });
    }
    this.flight.visible = !arrived;
    this.mars.visible = arrived;
    const theme = rocketThemeAt(game.rocketTime);
    this.scene.background.set(arrived ? '#382b3e' : blendColor(theme.palette.darker_background, '#101321', .75));
    this.cabinPanels.forEach((mesh) => mesh.material.color.set(theme.palette.lighter_background));
    this.cabinLights.forEach((mesh) => mesh.material.color.set(theme.palette.accent));
    const flight = rocketFlightPhase(game.rocketTime);
    const calm = options.reducedMotion;
    const speed = calm ? 0 : 20 + flight.thrust * 170;
    const length = calm ? .15 : (options.comfort ? 2 : 5) + flight.thrust * (options.comfort ? 5 : 18);
    for (let i = 0; i < 140; i++) {
      const angle = hash(i + 3) * Math.PI * 2;
      const radius = 5 + hash(i + 8) * 32;
      const z = -5 - ((hash(i + 17) * 220 - game.rocketTime * speed) % 220 + 220) % 220;
      this.matrix.position.set(Math.cos(angle) * radius, 1.8 + Math.sin(angle) * radius, z);
      this.matrix.rotation.set(0, 0, 0);
      this.matrix.scale.set(.035, .035, length);
      this.matrix.updateMatrix();
      this.streaks.setMatrixAt(i, this.matrix.matrix);
      this.streaks.setColorAt(i, this.color.set(theme.colors[i % theme.colors.length]));
    }
    this.streaks.instanceMatrix.needsUpdate = true;
    this.streaks.instanceColor.needsUpdate = true;
    let segments = 0;
    for (let gate = 0; gate < (options.comfort || calm ? 3 : 5); gate++) {
      const z = -12 - ((gate * 44 - (calm ? 0 : game.rocketTime * (options.comfort ? 28 : 55))) % 220 + 220) % 220;
      const radius = 8 + gate * .4;
      for (let i = 0; i < theme.colors.length; i++) {
        const angle = i / theme.colors.length * Math.PI * 2;
        this.matrix.position.set(Math.cos(angle) * radius, 1.8 + Math.sin(angle) * radius, z);
        this.matrix.rotation.set(0, 0, angle + Math.PI / 2);
        this.matrix.scale.set(radius * Math.PI * 2 / theme.colors.length * .84, .09, .15);
        this.matrix.updateMatrix();
        this.rings.setMatrixAt(segments, this.matrix.matrix);
        this.rings.setColorAt(segments++, this.color.set(theme.colors[i]));
      }
    }
    this.rings.count = segments;
    this.rings.instanceMatrix.needsUpdate = true;
    this.rings.instanceColor.needsUpdate = true;
    this.earth.visible = game.rocketTime >= 4 && game.rocketTime < 15;
    this.earth.scale.setScalar(Math.max(1, 10 - (game.rocketTime - 4) * .8));
    this.earth.position.y = -7 - Math.max(0, game.rocketTime - 6) * 4;
    this.planet.visible = game.rocketTime >= 12;
    const approach = Math.max(0, (game.rocketTime - 12) / 8);
    this.planet.position.set(20 * (1 - approach), 8, -180 + approach * 130);
    this.planet.scale.setScalar(3 + approach * 23);
    return true;
  }
}
