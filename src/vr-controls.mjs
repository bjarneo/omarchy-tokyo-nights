import { clamp } from './engine.mjs';

export function deadZone(value, threshold = .16) {
  if (!Number.isFinite(value) || Math.abs(value) <= threshold) return 0;
  return Math.sign(value) * clamp((Math.abs(value) - threshold) / (1 - threshold), 0, 1);
}

const value = (pad, index) => clamp(Number(pad?.buttons?.[index]?.value) || (pad?.buttons?.[index]?.pressed ? 1 : 0), 0, 1);
const pressed = (pad, index) => value(pad, index) > .5;
const horizontal = (pad) => deadZone(pad?.axes?.[pad.axes.length >= 4 ? 2 : 0]);

export class VRInput {
  constructor() { this.reset(); }

  reset() {
    this.previous = {};
    this.wheelNeutral = null;
  }

  sample(sources = [], { mode = 'stick', poses = {}, gamepads = [] } = {}) {
    const tracked = Array.from(sources).filter((source) => source.gamepad?.mapping === 'xr-standard');
    const left = tracked.find((source) => source.handedness === 'left')?.gamepad;
    const right = tracked.find((source) => source.handedness === 'right')?.gamepad;
    const single = tracked.find((source) => source.handedness === 'none')?.gamepad;
    const pad = Array.from(gamepads).find((candidate) => candidate?.connected && candidate.mapping === 'standard');
    let steering = horizontal(left || right || single) || deadZone(pad?.axes?.[0]);
    const bothGrips = mode === 'wheel' && pressed(left, 1) && pressed(right, 1) && poses.left && poses.right;
    if (bothGrips) {
      const dx = poses.right.x - poses.left.x;
      const dy = poses.right.y - poses.left.y;
      if (Math.hypot(dx, dy) > .12) {
        const angle = Math.atan2(dy, dx);
        this.wheelNeutral ??= angle;
        const turn = Math.atan2(Math.sin(angle - this.wheelNeutral), Math.cos(angle - this.wheelNeutral));
        if (Math.abs(steering) < .05) steering = clamp(-turn / .65, -1, 1);
      }
    } else this.wheelNeutral = null;
    const actions = {
      pause: pressed(right, 5) || pressed(left, 3) || pressed(pad, 1) || pressed(pad, 9),
      recenter: pressed(left, 4) || pressed(pad, 2),
      comfort: pressed(left, 5) || pressed(pad, 3),
      confirm: pressed(pad, 0),
    };
    const edges = Object.fromEntries(Object.entries(actions).map(([key, down]) => [key, down && !this.previous[key]]));
    this.previous = actions;
    return {
      left: Math.max(0, -steering), right: Math.max(0, steering),
      gas: value(right || single, 0) > .1 || value(pad, 7) > .1,
      brake: value(left, 0) > .1 || value(pad, 6) > .1,
      nitro: pressed(right || single, 4) || pressed(pad, 0),
      actions: edges,
    };
  }
}

export function pulseControllers(sources, strength, duration) {
  for (const source of Array.from(sources || [])) {
    const actuator = source.gamepad?.hapticActuators?.[0];
    if (!actuator?.pulse) continue;
    try { void Promise.resolve(actuator.pulse(clamp(strength, 0, 1), duration)).catch(() => {}); }
    catch { /* Controller feedback is optional. */ }
  }
}
