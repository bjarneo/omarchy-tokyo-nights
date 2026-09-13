import * as THREE from '../assets/three.module.js';
import { MALIBU } from './club-data.mjs';

const vector = (x, y, z) => new THREE.Vector3(x, y, z);
const noise = (n) => { const value = Math.sin(n * 91.371) * 17437.19; return value - Math.floor(value); };

function canvasTexture(width, height, paint) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundedShape(width, height, radius) {
  const x = -width / 2; const y = -height / 2; const shape = new THREE.Shape();
  shape.moveTo(x + radius, y); shape.lineTo(x + width - radius, y); shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius); shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y); return shape;
}

export class MalibuCorner {
  constructor(room, station) {
    this.room = room;
    this.root = new THREE.Group(); this.root.name = 'malibu-corner'; room.root.add(this.root);
    this.furniture = new THREE.Group(); this.furniture.position.set(station.x, 0, station.z); this.furniture.rotation.y = station.yaw; this.root.add(this.furniture);
    this.sky = this.skyTexture();
    this.ivory = new THREE.MeshPhysicalMaterial({ color: '#eee9df', roughness: .2, metalness: .06, clearcoat: .85, clearcoatRoughness: .18, envMap: this.sky, envMapIntensity: .7 });
    this.metal = new THREE.MeshStandardMaterial({ color: '#a7afb0', roughness: .3, metalness: .72, envMap: this.sky, envMapIntensity: .55 });
    this.black = new THREE.MeshStandardMaterial({ color: '#252c2e', roughness: .48, metalness: .25 });
    this.buildWindows(); this.landscape(); this.floor(); this.desk(station); this.chair();
  }

  mesh(parent, name, geometry, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geometry, material); mesh.name = name; mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }

  box(parent, name, x, y, z, width, height, depth, material) {
    return this.mesh(parent, name, new THREE.BoxGeometry(width, height, depth), material, x, y, z);
  }

  tube(parent, name, points, radius, material, segments = 24) {
    return this.mesh(parent, name, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((point) => vector(...point))), segments, radius, 6, false), material);
  }

  skyTexture() {
    const texture = canvasTexture(1024, 512, (ctx, width, height) => {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#7d98b0'); sky.addColorStop(.35, '#aabac5'); sky.addColorStop(.51, '#e6d5c2'); sky.addColorStop(.6, '#d6b8a2'); sky.addColorStop(1, '#8caaa9');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(270, 252, 8, 270, 252, 275);
      glow.addColorStop(0, '#ffbf92fa'); glow.addColorStop(.48, '#ef9c7475'); glow.addColorStop(1, '#efad8500');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 170; i++) {
        const x = 115 + noise(i + 3) * 325; const y = 95 + noise(i + 241) * 146;
        ctx.fillStyle = `rgba(255,222,190,${.08 + noise(i + 533) * .16})`;
        ctx.beginPath(); ctx.ellipse(x, y, 6 + noise(i + 661) * 24, 1 + noise(i + 799) * 2.5, -.12, 0, Math.PI * 2); ctx.fill();
      }
    });
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  }

  buildWindows() {
    const { room } = this; room.at(0, 0);
    const { northStart, eastEnd, sill, lintel } = MALIBU;
    const height = lintel - sill; const y = (lintel + sill) / 2;
    const glass = new THREE.MeshBasicMaterial({ color: '#c2d8de', transparent: true, opacity: .035, side: THREE.DoubleSide, depthWrite: false, fog: false });
    this.windows = [];
    const north = this.mesh(this.root, 'malibu-north-glass', new THREE.PlaneGeometry(18 - northStart, height), glass, (northStart + 18) / 2, y, -13.9);
    const east = this.mesh(this.root, 'malibu-east-glass', new THREE.PlaneGeometry(14 + eastEnd, height), glass, 17.9, y, (eastEnd - 14) / 2); east.rotation.y = -Math.PI / 2;
    this.windows.push(north, east);
    for (const x of [northStart, (northStart + 18) / 2, 17.82]) room.box(x, y, -13.82, .07, height, .12, '#9b9d99');
    for (const z of [-13.82, (eastEnd - 14) / 2, eastEnd]) room.box(17.82, y, z, .12, height, .07, '#9b9d99');
    for (const railY of [sill, lintel]) {
      room.box((northStart + 18) / 2, railY, -13.82, 18 - northStart, .08, .13, '#a6a7a1');
      room.box(17.82, railY, (eastEnd - 14) / 2, .13, .08, 14 + eastEnd, '#a6a7a1');
    }
    room.box((northStart + 18) / 2, lintel - .32, -13.77, 18 - northStart, .59, .075, '#414747');
    room.box(17.77, lintel - .32, (eastEnd - 14) / 2, .075, .59, 14 + eastEnd, '#414747');
    room.box(17.77, .25, eastEnd + .1, .018, .45, .018, '#a6a7a1');
  }

  landscape() {
    const coast = new THREE.Group(); coast.name = 'malibu-coast'; coast.position.set(18, 0, -14); coast.rotation.y = -Math.PI / 4; this.root.add(coast);
    this.coast = coast;
    const sky = this.mesh(coast, 'malibu-sunrise-sky', new THREE.SphereGeometry(120, 48, 24), new THREE.MeshBasicMaterial({ map: this.sky, side: THREE.BackSide, depthWrite: false, fog: false }));
    sky.rotation.y = Math.PI + .6; sky.renderOrder = -50;
    this.water = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } }, fog: false,
      vertexShader: 'varying vec3 point;void main(){point=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec3 point;uniform float time;void main(){float far=clamp(-point.z/150.,0.,1.);float ripple=sin(point.x*.9+point.z*4.+time*.36)*sin(point.z*1.7-time*.22);vec3 color=mix(vec3(.48,.63,.65),vec3(.78,.80,.77),far);color+=ripple*.013;gl_FragColor=vec4(color,1.);}',
    });
    const seaGeometry = new THREE.PlaneGeometry(260, 240); seaGeometry.rotateX(-Math.PI / 2); seaGeometry.translate(0, -3.4, -90);
    const sea = this.mesh(coast, 'malibu-ocean', seaGeometry, this.water); sea.renderOrder = -48;
    this.hill(coast, { name: 'distant-headlands', x: -33, z: -62, width: 112, depth: 43, height: 11, color: '#b3b5ae', seed: 4 });
    this.hill(coast, { name: 'middle-headlands', x: -26, z: -32, width: 76, depth: 33, height: 8, color: '#8a9690', seed: 13 });
    this.hill(coast, { name: 'near-headland', x: -26, z: -7, width: 49, depth: 30, height: 7, color: '#566f61', seed: 31 });
    this.hill(coast, { name: 'right-headland', x: 35, z: -10, width: 45, depth: 30, height: 4.8, color: '#798779', seed: 59 });
  }

  hill(parent, { name, x, z, width, depth, height, color, seed }) {
    const positions = []; const colors = []; const rows = 16; const columns = 30;
    const point = (column, row) => {
      const u = column / columns * 2 - 1; const v = row / rows * 2 - 1;
      const envelope = Math.pow(Math.max(0, 1 - u * u - v * v), .48);
      const ridge = .77 + Math.sin(u * 7 + seed) * .1 + Math.sin(v * 7 - u * 3) * .07;
      return [x + u * width / 2, -5 + envelope * height * ridge, z + v * depth / 2];
    };
    const base = new THREE.Color(color); const cliff = new THREE.Color('#9b9585');
    for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
      const a = point(column, row); const b = point(column + 1, row); const c = point(column, row + 1); const d = point(column + 1, row + 1);
      for (const triangle of [[a, c, b], [b, c, d]]) {
        const average = triangle.reduce((sum, vertex) => sum + vertex[1], 0) / 3;
        const tint = base.clone().lerp(cliff, average < -1.3 ? .4 : .08).multiplyScalar(.92 + noise(column + row * columns + seed) * .12);
        for (const vertex of triangle) { positions.push(...vertex); colors.push(tint.r, tint.g, tint.b); }
      }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.computeVertexNormals();
    const hill = this.mesh(parent, `malibu-${name}`, geometry, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false })); hill.renderOrder = -46;
  }

  floor() {
    const wood = canvasTexture(512, 512, (ctx) => {
      ctx.fillStyle = '#c2b3a3'; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = ['#c8bcaf', '#c1b3a4', '#c5b7a8', '#bdb0a1'][i % 4]; ctx.fillRect(i * 64, 0, 63, 512);
        ctx.fillStyle = '#a99b8d'; ctx.fillRect(i * 64, (i % 3) * 150 + 24, 64, 1);
        for (let line = 0; line < 15; line++) { ctx.fillStyle = '#e6ddd114'; ctx.fillRect(i * 64 + 3 + noise(i * 20 + line) * 56, 0, 1, 512); }
      }
    });
    wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 2);
    const floor = this.mesh(this.root, 'malibu-oak-floor', new THREE.PlaneGeometry(18 - MALIBU.northStart, 14 + MALIBU.eastEnd), new THREE.MeshStandardMaterial({ map: wood, roughness: .48, metalness: .03, envMap: this.sky, envMapIntensity: .25, depthWrite: false }), (18 + MALIBU.northStart) / 2, .008, (MALIBU.eastEnd - 14) / 2);
    floor.rotation.x = -Math.PI / 2; floor.renderOrder = -19;
    const shadow = canvasTexture(128, 128, (ctx) => {
      const shade = ctx.createRadialGradient(64, 64, 8, 64, 64, 63); shade.addColorStop(0, '#24221f69'); shade.addColorStop(.5, '#24221f3d'); shade.addColorStop(1, '#24221f00');
      ctx.fillStyle = shade; ctx.fillRect(0, 0, 128, 128);
    });
    const contact = this.mesh(this.furniture, 'malibu-contact-shadow', new THREE.PlaneGeometry(3.9, 2.3), new THREE.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false }), 0, .012, .35); contact.rotation.x = -Math.PI / 2;
  }

  desk(station) {
    const profile = new THREE.Shape();
    profile.moveTo(-1.13, .028); profile.bezierCurveTo(-1.64, .028, -1.58, .48, -1.35, .69); profile.quadraticCurveTo(-1.23, .81, -.97, .81);
    profile.lineTo(1.12, .81); profile.bezierCurveTo(1.41, .81, 1.53, .5, 1.39, .2); profile.quadraticCurveTo(1.32, .028, 1.08, .028); profile.closePath();
    const opening = new THREE.Path();
    opening.moveTo(-1.06, .11); opening.lineTo(1.03, .11); opening.bezierCurveTo(1.24, .11, 1.31, .31, 1.21, .49); opening.quadraticCurveTo(1.13, .64, .97, .65);
    opening.lineTo(-.88, .65); opening.bezierCurveTo(-1.05, .65, -1.18, .41, -1.19, .24); opening.quadraticCurveTo(-1.19, .11, -1.06, .11);
    profile.holes.push(opening);
    const geometry = new THREE.ExtrudeGeometry(profile, { depth: .92, bevelEnabled: true, bevelSize: .018, bevelThickness: .016, bevelSegments: 3, curveSegments: 24 });
    this.deskShell = this.mesh(this.furniture, 'malibu-white-loop-desk', geometry, this.ivory, 0, .01, -.46);
    const oak = new THREE.MeshStandardMaterial({ color: '#a98d72', roughness: .66 });
    this.box(this.furniture, 'malibu-oak-drawers', 1.02, .41, -.04, .48, .62, .72, oak);
    const { room } = this; room.at(station.x, station.z, station.yaw);
    for (let i = 0; i < 3; i++) { room.box(1.02, .21 + i * .19, .33, .45, .005, .008, '#6c5a4b'); room.box(1.02, .27 + i * .19, .337, .15, .009, .013, '#c9b6a2'); }
    this.box(this.furniture, 'malibu-monitor-case', 0, 1.22, -.12, .75, .58, .062, this.metal);
    this.box(this.furniture, 'malibu-monitor-bezel', 0, 1.265, -.083, .716, .465, .015, this.black);
    this.box(this.furniture, 'malibu-monitor-stand', 0, .927, -.14, .11, .2, .055, this.metal).rotation.x = -.2;
    this.box(this.furniture, 'malibu-monitor-foot', 0, .836, -.07, .26, .017, .22, this.metal);
    room.crt(station, 1.265, .664, .412, -.277, '#a7afb0', true);
    const badge = room.sign(['OMARCHY', 'MALIBU'], 0, .988, -.077, .072, '#9aa5ce'); badge.name = 'malibu-monitor-mark';
    room.box(0, .844, .27, .55, .017, .19, '#b8bdbb');
    for (let row = 0; row < 5; row++) for (let col = 0; col < 14; col++) room.box(-.25 + col * .038, .858, .2 + row * .033, .031, .01, .025, '#eeeae1');
    room.box(0, .859, .343, .22, .011, .028, '#e8e5df');
    const mouse = this.mesh(this.furniture, 'malibu-mouse', new THREE.SphereGeometry(1, 16, 10), this.ivory, .48, .853, .27); mouse.scale.set(.048, .022, .075);
    this.accessories();
    const target = this.mesh(this.furniture, 'malibu-desk-target', new THREE.BoxGeometry(3, 1.6, 1.12), new THREE.MeshBasicMaterial({ visible: false }), 0, .8, 0);
    target.userData.id = station.id; room.targets.push(target);
  }

  accessories() {
    const clock = this.mesh(this.furniture, 'malibu-desk-clock', new THREE.SphereGeometry(1, 20, 12), this.ivory, -1.03, .931, .1); clock.scale.set(.105, .112, .036);
    const face = canvasTexture(128, 128, (ctx) => { ctx.fillStyle = '#384443'; ctx.fillRect(0, 0, 128, 128); ctx.fillStyle = '#a7b5a7'; ctx.font = '32px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText('06:12', 64, 70); });
    this.mesh(this.furniture, 'malibu-clock-face', new THREE.CircleGeometry(.075, 24), new THREE.MeshBasicMaterial({ map: face }), -1.03, .933, .142);
    this.tube(this.furniture, 'malibu-clock-cable', [[-1.04, .835, .04], [-1.22, .835, -.06], [-1.08, .835, -.22], [-.48, .835, -.3]], .003, this.black, 16);
    const band = this.mesh(this.furniture, 'malibu-headphones', new THREE.TorusGeometry(.103, .012, 6, 24, Math.PI * 1.65), this.black, -.07, .86, -.015); band.rotation.x = Math.PI / 2;
    for (const x of [-.165, .018]) {
      const pad = this.mesh(this.furniture, 'malibu-headphone-pad', new THREE.SphereGeometry(1, 12, 8), this.black, x, .86, .019); pad.scale.set(.042, .024, .057);
    }
    const glass = new THREE.MeshPhysicalMaterial({ color: '#dae6e1', transparent: true, opacity: .3, roughness: .12, metalness: .12, envMap: this.sky, envMapIntensity: .5, side: THREE.DoubleSide, depthWrite: false });
    const bottle = [[.032, 0], [.041, .015], [.041, .19], [.035, .24], [.019, .28], [.019, .34]].map(([r, y]) => new THREE.Vector2(r, y));
    this.mesh(this.furniture, 'malibu-water-bottle', new THREE.LatheGeometry(bottle, 20), glass, .84, .836, -.13);
    this.mesh(this.furniture, 'malibu-bottle-stopper', new THREE.CylinderGeometry(.022, .02, .049, 14), new THREE.MeshStandardMaterial({ color: '#ac9980', roughness: .9 }), .84, 1.195, -.13);
    this.mesh(this.furniture, 'malibu-drinking-glass', new THREE.CylinderGeometry(.04, .032, .14, 20, 1, true), glass, 1.02, .908, .035);
    this.mesh(this.furniture, 'malibu-water', new THREE.CylinderGeometry(.036, .031, .062, 16), new THREE.MeshBasicMaterial({ color: '#bfd4d3', transparent: true, opacity: .22, depthWrite: false }), 1.02, .866, .035);
  }

  chair() {
    const chair = new THREE.Group(); chair.name = 'malibu-mesh-chair'; chair.position.set(MALIBU.chairX, 0, MALIBU.chairZ); chair.rotation.y = -.12; this.furniture.add(chair); this.chairModel = chair;
    const seatGeometry = new THREE.ExtrudeGeometry(roundedShape(.64, .56, .09), { depth: .035, bevelEnabled: true, bevelSize: .017, bevelThickness: .012, bevelSegments: 2, curveSegments: 8 });
    const seat = this.mesh(chair, 'malibu-chair-seat', seatGeometry, this.black, 0, .54, -.08); seat.rotation.x = -Math.PI / 2;
    this.mesh(chair, 'malibu-chair-column', new THREE.CylinderGeometry(.029, .036, .34, 10), this.black, 0, .34, 0);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5; const x = Math.sin(angle) * .36; const z = Math.cos(angle) * .36;
      this.tube(chair, 'malibu-chair-spoke', [[0, .2, 0], [x * .6, .14, z * .6], [x, .1, z]], .021, this.black, 8);
      const wheel = this.mesh(chair, 'malibu-chair-caster', new THREE.CylinderGeometry(.057, .057, .062, 12), this.black, x, .069, z); wheel.rotation.z = Math.PI / 2; wheel.rotation.y = -angle;
    }
    const weave = canvasTexture(128, 128, (ctx) => {
      ctx.clearRect(0, 0, 128, 128); ctx.fillStyle = '#646b68';
      for (let y = 0; y < 128; y += 4) ctx.fillRect(0, y, 128, 2);
      ctx.fillStyle = '#3f4844'; for (let x = 0; x < 128; x += 8) ctx.fillRect(x, 0, 1, 128);
    });
    const backGeometry = new THREE.PlaneGeometry(.61, .69, 8, 12);
    const vertices = backGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) { const y = vertices.getY(i) + .345; vertices.setZ(i, .12 + y * y * .23 - Math.cos(vertices.getX(i) * 4) * .035); vertices.setY(i, y + .64); }
    backGeometry.computeVertexNormals();
    this.mesh(chair, 'malibu-woven-back', backGeometry, new THREE.MeshStandardMaterial({ map: weave, alphaTest: .3, side: THREE.DoubleSide, roughness: .85 }));
    this.tube(chair, 'malibu-chair-back-frame', [[-.3, .64, .12], [-.33, .99, .14], [-.3, 1.32, .225], [0, 1.35, .245], [.3, 1.32, .225], [.33, .99, .14], [.3, .64, .12]], .019, this.black, 40);
    for (const side of [-1, 1]) {
      this.tube(chair, 'malibu-chair-back-support', [[side * .21, .44, 0], [side * .3, .62, .23], [side * .32, .83, .17]], .022, this.black, 14);
      this.tube(chair, 'malibu-chair-arm', [[side * .28, .53, .02], [side * .37, .7, .09], [side * .35, .81, -.02]], .019, this.black, 12);
      this.box(chair, 'malibu-chair-armrest', side * .35, .815, -.1, .076, .03, .27, this.black);
    }
  }

  update(time, reducedMotion) { this.water.uniforms.time.value = reducedMotion ? 0 : time; }
}
