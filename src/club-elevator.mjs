export const FLOORS = Object.freeze([
  { id: 'B1', name: 'BASEMENT ARCADE', area: 'basement' },
  { id: 'L1', name: 'THE CLUB', area: 'entry' },
  { id: 'R1', name: 'ROOFTOP CINEMA', area: 'roof' },
]);

const RIDE_MS = 1400;

export class ClubElevator {
  constructor({ onChange = () => {}, now = () => Date.now() } = {}) {
    this.onChange = onChange;
    this.now = now;
    this.floor = 'L1';
    this.doors = 'open';
    this.ride = null;
  }

  canRide() {
    return !this.ride;
  }

  request(floor) {
    if (!FLOORS.some((item) => item.id === floor)) return false;
    if (this.ride || this.floor === floor) return false;
    this.ride = { from: this.floor, to: floor, start: this.now() };
    this.doors = 'closing';
    this.onChange(this);
    return true;
  }

  update(now = this.now()) {
    if (!this.ride) return null;
    const elapsed = now - this.ride.start;
    if (elapsed < RIDE_MS * 0.35) this.doors = 'closing';
    else if (elapsed < RIDE_MS * 0.7) this.doors = 'closed';
    else if (elapsed < RIDE_MS) this.doors = 'opening';
    else {
      this.floor = this.ride.to;
      const done = { ...this.ride };
      this.ride = null;
      this.doors = 'open';
      this.onChange(this);
      return done;
    }
    return null;
  }

  doorAmount(now = this.now()) {
    if (!this.ride) return this.doors === 'open' ? 1 : 0;
    const elapsed = now - this.ride.start;
    if (elapsed < RIDE_MS * 0.35) return 1 - elapsed / (RIDE_MS * 0.35);
    if (elapsed < RIDE_MS * 0.7) return 0;
    if (elapsed < RIDE_MS) return (elapsed - RIDE_MS * 0.7) / (RIDE_MS * 0.3);
    return 1;
  }
}
