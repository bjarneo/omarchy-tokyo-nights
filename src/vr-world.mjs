import { roadCurve } from './engine.mjs';

export const SEAT_HEIGHT = 1.18;
export const ROAD_HALF_WIDTH = 5;
export const WORLD_SCALE = .5;

export function roadOffset(distance, ahead) {
  return roadCurve(distance + ahead) * ahead * ahead / 1800;
}

export function trafficPosition(game, car) {
  const ahead = (car.z - game.distance) * WORLD_SCALE;
  return { x: roadOffset(game.distance, ahead) + car.x * ROAD_HALF_WIDTH, y: .5, z: -ahead };
}

export function seatOffset(position, orientation) {
  const { x, y, z, w } = orientation;
  const yaw = Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + x * x));
  return {
    position: { x: position.x, y: position.y - SEAT_HEIGHT, z: position.z },
    orientation: { x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) },
  };
}
