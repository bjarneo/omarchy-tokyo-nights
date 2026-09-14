import { ELEVATOR, ELEVATOR_CABIN, RANGERS } from './club-rangers.mjs';

const C = { wood: '#80604b', darkWood: '#503d36', ink: '#16161e', paper: '#c0caf5', cyan: '#7dcfff', gold: '#e0af68', green: '#9ece6a', metal: '#9aa5ce' };

export class ClubRangersDesk {
  constructor(room) {
    this.room = room; room.at(0, 0);
    room.box(-9, .4, 11.2, 6.6, .76, .9, C.darkWood);
    room.box(-9, .78, 11.2, 6.6, .08, .9, C.wood);
    room.box(-9, .82, 10.79, 6.5, .025, .035, C.gold, true);
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, 1024, 128);
    ctx.fillStyle = C.cyan;
    for (let row = 0; row < 8; row++) {
      const inset = Math.max(0, row - 3) * 9; ctx.fillRect(32 + inset, 16 + row * 12, 100 - inset * 2, 12);
    }
    ctx.fillStyle = C.ink; ctx.font = 'bold 62px "Courier New", monospace'; ctx.fillText('R', 64, 84);
    ctx.fillStyle = C.gold; ctx.font = 'bold 48px "Courier New", monospace'; ctx.fillText('RANGERS', 169, 60);
    ctx.fillStyle = C.paper; ctx.font = '25px "Courier New", monospace'; ctx.fillText('ASK FOR HELP · FIND A ROOM', 170, 103);
    ctx.fillStyle = C.green; ctx.font = '26px "Courier New", monospace'; ctx.fillText('WELCOME', 820, 68);
    this.shield = room.plane(canvas, 6.2, .775, -9, .4, 10.742, Math.PI); this.shield.name = 'rangers-shield-desk';
    for (const [index, ranger] of RANGERS.entries()) {
      room.box(ranger.x + .45, .845, 11.25, .42, .04, .3, [C.cyan, C.gold, C.green][index]);
      room.box(ranger.x + .45, .871, 11.25, .36, .014, .25, '#d5d1b9');
      room.box(ranger.x - .42, .845, 11.05, .27, .025, .25, C.ink);
      room.box(ranger.x - .42, .865, 11.05, .22, .008, .18, C.paper);
    }
    this.elevator();
  }

  directory(target, width, height) {
    const room = this.room; const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 448;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, 384, 448);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 376, 440);
    ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillText('ROOM', 192, 66); ctx.fillText('DIRECTORY', 192, 109);
    ctx.fillStyle = C.paper; ctx.font = '24px "Courier New", monospace';
    ['THE CLUB', 'SECURITY', 'DESIGN', 'MAC ROOM', 'FRONT DESK'].forEach((line, i) => ctx.fillText(line, 192, 171 + i * 42));
    ctx.fillStyle = C.green; ctx.font = 'bold 27px "Courier New", monospace'; ctx.fillText('SELECT TO TRAVEL', 192, 409);
    const mesh = room.plane(canvas, width, height, target.x, target.height, target.z, Math.PI);
    mesh.name = target.id; mesh.userData.id = target.id; room.targets.push(mesh); return mesh;
  }

  elevator() {
    const room = this.room; room.at(0, 0);
    room.box(-17.1, 1.6, 12.2, .16, 3.2, 2.8, C.metal); room.box(-13.9, 1.6, 12.2, .16, 3.2, 2.8, C.metal);
    room.box(-15.5, 1.6, 13.6, 3.36, 3.2, .16, '#565f89'); room.box(-15.5, 3.25, 12.2, 3.36, .10, 2.8, C.metal);
    room.box(-15.5, .008, 12.2, 3.15, .015, 2.7, '#414868'); room.box(-15.5, .025, 10.82, 3.1, .015, .10, C.cyan, true);
    for (const x of [-16.92, -14.08]) room.box(x, 1.55, 10.87, .13, 3.1, .055, '#343b58');
    room.box(-15.5, 3.18, 12.2, 2, .025, .5, '#e5e9ff', true);
    room.box(-15.5, .95, 13.47, 2.8, .05, .06, C.metal);
    room.sign(['THE ELEVATOR', 'ROOM SHORTCUTS'], -15.5, 3.7, 10.69, 3.3, C.cyan, Math.PI);
    room.box(ELEVATOR.x, ELEVATOR.height, ELEVATOR.z + .035, .33, .55, .06, C.metal);
    this.call = this.directory(ELEVATOR, .28, .48);
    this.cabin = this.directory(ELEVATOR_CABIN, .84, .98);
  }
}
