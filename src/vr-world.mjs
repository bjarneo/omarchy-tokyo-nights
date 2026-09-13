import { roadCurve } from './engine.mjs';

export const SEAT_HEIGHT = 1.18;
export const ROAD_HALF_WIDTH = 5;
export const WORLD_SCALE = .5;

export function advanceVRSimulation(game, delta) {
  if (!Number.isFinite(delta)) return;
  let remaining = Math.max(0, Math.min(delta, .25));
  while (remaining > .000001) {
    const step = Math.min(remaining, 1 / 60);
    game.update(step);
    remaining -= step;
  }
}

export function roadOffset(distance, ahead) {
  return roadCurve(distance + ahead) * ahead * ahead / 1800;
}

export function trafficPosition(game, car) {
  const ahead = (car.z - game.distance) * WORLD_SCALE;
  return { x: roadOffset(game.distance, ahead) + car.x * ROAD_HALF_WIDTH, y: .5, z: -ahead };
}

export function seatOffset(position, orientation, height = SEAT_HEIGHT) {
  const { x, y, z, w } = orientation;
  const yaw = Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + x * x));
  return {
    position: { x: position.x, y: position.y - height, z: position.z },
    orientation: { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) },
  };
}
