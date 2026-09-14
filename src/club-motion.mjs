import { CLUB, CLUB_CREW } from './club-data.mjs';

export const CREW_GESTURES = ['wave', 'glasses', 'coffee', 'stretch', 'hands', 'beat', 'disk', 'handheld', 'explain'];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smooth = (value) => { const x = clamp(value, 0, 1); return x * x * (3 - 2 * x); };
const hash = (value) => { const n = Math.sin(value * 127.1 + 71.7) * 43758.5453; return n - Math.floor(n); };

export function gestureAt(style, time) {
  const duration = style === 'coffee' ? 5.2 : style === 'disk' || style === 'handheld' ? 4.6 : 3.4;
  const period = style === 'coffee' ? 14 : style === 'stretch' ? 19 : 12;
  const phase = ((time % period) + period) % period;
  const amount = smooth((phase - 1.2) / 1.1) * (1 - smooth((phase - duration) / 1.2));
  return { style, phase, amount, wave: Math.sin(phase * 8), tap: Math.sin(phase * 6) };
}

export function createClubCrew() {
  return CLUB_CREW.map((npc, index) => ({
    ...npc, homeX: npc.x, homeZ: npc.z, height: CLUB.playerHeight, eyeHeight: CLUB.eyeHeight,
    gesture: npc.gesture || CREW_GESTURES[index], clock: index === 2 ? 0 : index * 1.17,
    wait: 3 + index * .65, targetX: npc.x, targetZ: npc.z, turn: 0,
    yaw: npc.yaw || 0, moving: false, gait: 0, travel: 0, speed: .27 + index % 3 * .025,
    gestureBlend: 1, walkBlend: 0,
    obstacle: { id: npc.id, x: npc.x, z: npc.z, width: .7, depth: .52, height: CLUB.playerHeight },
  }));
}

export function updateClubCrew(crew, delta, { player, selectedId = null, state = 'explore', reducedMotion = false, canMove }) {
  if (state === 'paused') return;
  const dt = Number.isFinite(delta) ? clamp(delta, 0, .25) : 0;
  for (const [index, npc] of crew.entries()) {
    const distance = Math.hypot(player.x - npc.x, player.z - npc.z);
    const engaged = state === 'talk' && selectedId === npc.id;
    const held = reducedMotion || engaged || distance < 3.2;
    npc.moving = false;
    if (!reducedMotion) npc.clock += dt;
    if (!held) {
      if (npc.wait > 0) npc.wait = Math.max(0, npc.wait - dt);
      else {
        let remaining = Math.hypot(npc.targetX - npc.x, npc.targetZ - npc.z);
        if (remaining < .025) {
          npc.turn++;
          let found = false;
          for (let attempt = 0; attempt < 8; attempt++) {
            const seed = index * 97 + npc.turn * 23 + attempt * 11;
            const angle = hash(seed) * Math.PI * 2;
            const radius = .45 + hash(seed + 3) * .4;
            const x = npc.homeX + Math.cos(angle) * radius; const z = npc.homeZ + Math.sin(angle) * radius;
            const steps = Math.max(1, Math.ceil(Math.hypot(x - npc.x, z - npc.z) / .08));
            let clear = true;
            for (let step = 1; step <= steps; step++) if (!canMove(npc, npc.x + (x - npc.x) * step / steps, npc.z + (z - npc.z) * step / steps)) { clear = false; break; }
            if (clear) { npc.targetX = x; npc.targetZ = z; found = true; break; }
          }
          if (!found) npc.wait = 3;
          remaining = Math.hypot(npc.targetX - npc.x, npc.targetZ - npc.z);
        }
        if (remaining >= .025 && npc.wait === 0) {
          const travel = Math.min(remaining, npc.speed * dt);
          const dx = (npc.targetX - npc.x) / remaining * travel; const dz = (npc.targetZ - npc.z) / remaining * travel;
          if (canMove(npc, npc.x + dx, npc.z + dz)) {
            npc.x += dx; npc.z += dz; npc.moving = travel > 0; npc.travel += travel; npc.gait += travel * Math.PI * 2 / .55;
            npc.obstacle.x = npc.x; npc.obstacle.z = npc.z;
            const yaw = Math.atan2(dx, dz);
            npc.yaw += Math.atan2(Math.sin(yaw - npc.yaw), Math.cos(yaw - npc.yaw)) * Math.min(1, dt * 5);
            if (remaining - travel < .025) { npc.targetX = npc.x; npc.targetZ = npc.z; npc.wait = 7 + hash(npc.turn + index * 3) * 7; }
          } else { npc.targetX = npc.x; npc.targetZ = npc.z; npc.wait = 2.5; }
        }
      }
    }
    if (distance < 5 && !npc.moving) {
      const yaw = Math.atan2(player.x - npc.x, player.z - npc.z);
      npc.yaw += Math.atan2(Math.sin(yaw - npc.yaw), Math.cos(yaw - npc.yaw)) * Math.min(1, dt * 4);
    }
    const blend = 1 - Math.exp(-dt * 8);
    npc.walkBlend += (Number(npc.moving) - npc.walkBlend) * blend;
    npc.gestureBlend += (Number(!engaged && !npc.moving && !reducedMotion) - npc.gestureBlend) * blend;
    if (reducedMotion) { npc.walkBlend = 0; npc.gestureBlend = 0; }
  }
}
