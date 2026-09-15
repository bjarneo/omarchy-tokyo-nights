export const ROOF = Object.freeze({ x: 0, z: -26, width: 20, depth: 14, floor: 'R1' });

export const ROOF_ELEVATOR = Object.freeze({ id: 'roof-elevator', name: 'The rooftop elevator', software: 'elevator', x: 8.2, z: -20.4, height: 1.5,
  stand: { x: 8.2, z: -21.9, yaw: 0 },
  detail: 'Ride the elevator down to the club or the basement arcade. Choose a floor to travel there.' });

export const ROOF_ELEVATOR_CABIN = Object.freeze({ ...ROOF_ELEVATOR, id: 'roof-elevator-directory', x: 8.2, z: -19.75, height: 1.5, stand: { x: 8.2, z: -21.4, yaw: 0 } });

export const ROOF_CREW = Object.freeze([
  {
    id: 'roof-projectionist', name: 'Reel Riko', x: -5, z: -26, yaw: 0, gesture: 'explain',
    appearance: { skin: '#d4a68a', shade: '#a87f66', hair: '#2f2b28', top: '#31475a', trim: '#9ece6a', style: 'hoodie' },
    role: 'Projectionist', team: 'roof',
    greeting: 'Welcome to the rooftop cinema. New York glows past midnight. Ask me about the premiere.',
    topics: [
      ['Meet Riko', 'I run the rooftop projector. The trailer loop previews Omacon 2026 against the city.'],
      ['Watch the film', 'Select the projector to open the browser player. The lounge CRT uses the same film.'],
      ['The skyline', 'That is Manhattan across the river. The telescope names the towers for you.'],
    ],
  },
  {
    id: 'roof-stargazer', name: 'Star Imani', x: 5, z: -26, yaw: 0, gesture: 'glasses',
    appearance: { skin: '#8f6f52', shade: '#6d5138', hair: '#1f2124', top: '#3a3f63', trim: '#bb9af7', style: 'tee' },
    role: 'Stargazer', team: 'roof',
    greeting: 'The night is clear over Manhattan. Try the telescope and count the lit windows.',
    topics: [
      ['Meet Imani', 'I track clear nights from this roof. The moon is bright enough to read by.'],
      ['Use the telescope', 'Select the telescope to scan the New York towers. It returns after five seconds.'],
      ['Back downstairs', 'Use the east elevator hut or the map to return to the club.'],
    ],
  },
]);

export const ROOF_STATIONS = Object.freeze([
  { id: 'roof-projector', name: 'Rooftop projector', software: 'video', kind: 'video', x: -7.5, z: -21.5, yaw: Math.PI, detail: 'Watch Omacon 2026 in the official YouTube player. This action exits VR and opens the browser player.', initial: 'video', height: 1.72 },
  { id: 'roof-telescope', name: 'Skyline telescope', software: 'telescope', kind: 'gameboy', x: -7.5, z: -30.5, yaw: 0, detail: 'Scan the Manhattan skyline at night for five seconds.', initial: 'telescope', height: 1.25 },
  { id: 'roof-screen', name: 'Cinema screen', software: 'trailer', kind: 'video', x: 0, z: -31.8, yaw: 0, detail: 'The Omacon 2026 trailer loops on this screen under the New York night.', initial: 'trailer', height: 1.72 },
  { id: 'roof-skyline', name: 'Manhattan lookout', software: 'lookout', kind: 'gameboy', x: 4.5, z: -31, yaw: 0, detail: 'A night placard names the Manhattan towers across the river.', initial: 'lookout', height: 1.25 },
]);
