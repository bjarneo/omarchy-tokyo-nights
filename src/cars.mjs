export const CARS = Object.freeze([
  { id: 'countach', name: 'Lamborghini Countach', label: 'Countach', detail: 'Wedge body and wide rear wing.', exhausts: [-.164, .164] },
  { id: 'skyline', name: 'Nissan Skyline GT-R', label: 'GT-R R32', detail: 'Boxy coupe with four round tail lights.', exhausts: [.29] },
  { id: 'supra', name: 'Toyota Supra', label: 'Supra', detail: 'Rounded body and tall curved wing.', exhausts: [.28] },
  { id: 'rx7', name: 'Mazda RX-7', label: 'RX-7', detail: 'Curved hatch and dark rear light panel.', exhausts: [-.28, .28] },
  { id: 'nsx', name: 'Honda NSX', label: 'NSX', detail: 'Low roof and full-width rear lights.', exhausts: [-.28, .28] },
  { id: '911', name: 'Porsche 911 Turbo', label: '911 Turbo', detail: 'Rounded cabin and large rear spoiler.', exhausts: [-.28, .28] },
  { id: 'f40', name: 'Ferrari F40', label: 'F40', detail: 'High rear wing and three exhausts.', exhausts: [-.09, 0, .09] },
  { id: 'ae86', name: 'Toyota AE86', label: 'AE86', detail: 'Upright hatch and two-tone bumpers.', exhausts: [.28] },
  { id: '240z', name: 'Datsun 240Z', label: '240Z', detail: 'Sloped hatch and chrome rear bumper.', exhausts: [.25] },
].map((car) => Object.freeze({ ...car, exhausts: Object.freeze(car.exhausts) })));

export const PAINTS = Object.freeze([
  { id: 'amber', name: 'Amber', hex: '#e0af68' },
  { id: 'rose', name: 'Rose', hex: '#f7768e' },
  { id: 'orange', name: 'Orange', hex: '#ff9e64' },
  { id: 'green', name: 'Green', hex: '#9ece6a' },
  { id: 'blue', name: 'Blue', hex: '#7aa2f7' },
  { id: 'cyan', name: 'Cyan', hex: '#7dcfff' },
  { id: 'purple', name: 'Purple', hex: '#bb9af7' },
  { id: 'silver', name: 'Silver', hex: '#c0caf5' },
  { id: 'slate', name: 'Slate', hex: '#565f89' },
].map(Object.freeze));

export const getCar = (id) => CARS.find((car) => car.id === id) || CARS[0];
export const getPaint = (id) => PAINTS.find((paint) => paint.id === id) || PAINTS[0];
