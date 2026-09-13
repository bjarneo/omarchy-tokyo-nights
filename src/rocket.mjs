export const ROCKET_FLIGHT_SECONDS = 20;
export const ROCKET_PAD_OFFSET = 850;
export const MARS_BONUS = 5000;

export function rocketFlightPhase(elapsed) {
  const time = Math.max(0, Math.min(ROCKET_FLIGHT_SECONDS, Number.isFinite(elapsed) ? elapsed : 0));
  const phase = time < 2 ? 'boarding' : time < 6 ? 'launch' : time < 16 ? 'warp' : time < 20 ? 'descent' : 'landed';
  return {
    time, phase, progress: time / ROCKET_FLIGHT_SECONDS,
    remaining: Math.max(0, ROCKET_FLIGHT_SECONDS - time),
    label: { boarding: 'CARGO BAY CLOSING', launch: 'OMARCHY LIFTOFF', warp: 'HYPER BOOST', descent: 'MARS APPROACH', landed: 'MARS TOUCHDOWN' }[phase],
    thrust: phase === 'boarding' ? time / 8 : phase === 'launch' ? .4 + (time - 2) * .15 : phase === 'warp' ? 1 : phase === 'descent' ? .8 - (time - 16) * .15 : 0,
  };
}

export function isRocketView(game) {
  return game.state === 'rocket-flight' || game.state === 'paused' && game.previousState === 'rocket-flight';
}
