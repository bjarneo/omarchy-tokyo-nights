import { deadZone } from './vr-controls.mjs';

const down = (pad, index) => Boolean(pad?.buttons?.[index]?.pressed || pad?.buttons?.[index]?.value > .5);
const axis = (pad, index) => deadZone(pad?.axes?.[index]);

export class ClubInput {
  constructor() { this.reset(); }
  reset(suppressHeld = false) { this.previous = {}; this.suppressed = suppressHeld; }

  sample(sources = [], gamepads = [], options = {}) {
    const inputs = Array.from(sources).filter((source) => source.gamepad?.mapping === 'xr-standard');
    const left = inputs.find((source) => source.handedness === 'left')?.gamepad;
    const right = inputs.find((source) => source.handedness === 'right')?.gamepad;
    const pad = Array.from(gamepads).find((item) => item?.connected && item.mapping === 'standard');
    const singleHand = options.singleHand && (left || right || pad);
    const movePad = singleHand ? (left || right) : left;
    const turnHeld = singleHand ? down(right, 5) || down(movePad, 5) : false;
    const index = movePad?.axes.length >= 4 ? 2 : 0;
    const turn = singleHand && turnHeld ? axis(movePad, index) : axis(right, right?.axes.length >= 4 ? 2 : 0) || axis(pad, 2);
    const smoothTurn = options.turnMode === 'smooth' ? turn : 0;
    const states = {
      leftTurn: options.turnMode === 'smooth' ? false : turn < -.65,
      rightTurn: options.turnMode === 'smooth' ? false : turn > .65,
      interact: down(right, 4) || down(pad, 0) || down(pad, 7) || (singleHand && down(movePad, 4)),
      back: down(right, 5) || down(pad, 1) || down(pad, 9),
      center: down(left, 4) || down(pad, 2),
      map: down(left, 5) || down(pad, 3),
      scrollUp: false,
      scrollDown: false,
    };
    if (singleHand) states.back = down(movePad, 5) && !turnHeld ? false : states.back;
    if (options.panelOpen) {
      const scroll = axis(right, (right?.axes.length ?? 0) >= 4 ? 3 : 1) || axis(pad, 1);
      states.scrollUp = scroll < -.5;
      states.scrollDown = scroll > .5;
    }
    const actions = Object.fromEntries(Object.entries(states).map(([key, value]) => [key, value && !this.previous[key]]));
    if (this.suppressed) {
      Object.keys(actions).forEach((key) => { actions[key] = false; });
      if (!Object.values(states).some(Boolean) && !down(left, 0) && !down(right, 0)) this.suppressed = false;
    }
    this.previous = states;
    const moveX = singleHand && turnHeld ? 0 : axis(movePad, index) || axis(pad, 0);
    const moveZ = singleHand && turnHeld ? 0 : axis(movePad, index + 1) || axis(pad, 1);
    return {
      x: moveX,
      z: moveZ,
      smoothTurn,
      teleport: down(left, 0) || down(pad, 6),
      padTeleport: down(pad, 6),
      fire: down(right, 0) || down(right, 4) || down(pad, 0) || down(pad, 7),
      actions,
    };
  }
}
