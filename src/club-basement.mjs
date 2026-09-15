export const BASEMENT = Object.freeze({ x: 0, z: 42, width: 24, depth: 14, floor: 'B1' });

export const BASEMENT_ELEVATOR = Object.freeze({ id: 'basement-elevator', name: 'The basement elevator', software: 'elevator', x: 0, z: 46.1, height: 1.5,
  stand: { x: 0, z: 44.6, yaw: Math.PI },
  detail: 'Ride the elevator to the club or the rooftop cinema. Choose a floor to travel there.' });

export const BASEMENT_ELEVATOR_CABIN = Object.freeze({ ...BASEMENT_ELEVATOR, id: 'basement-elevator-directory', x: 0, z: 48.55, height: 1.5, stand: { x: 0, z: 47.2, yaw: Math.PI } });

export const BASEMENT_CREW = Object.freeze([
  {
    id: 'basement-keeper', name: 'Nova Keeper', x: -8, z: 42.5, yaw: 0, gesture: 'beat',
    appearance: { skin: '#d9b294', shade: '#b3876c', hair: '#2b2f36', top: '#3c2f52', trim: '#7dcfff', style: 'tee' },
    role: 'Arcade keeper', team: 'basement',
    greeting: 'Welcome to the basement arcade. Eight cabinets run hot all night. Ask me about high scores.',
    topics: [
      ['Meet the keeper', 'I keep the basement cabinets alive. The leaderboard shows the best local rounds.'],
      ['High scores', 'Star Patrol pays 100 per hit. Brick Break pays 50 per brick. Snake pays 10 per bite. Pong pays for a win.'],
      ['Try the cabinets', 'The north wall holds Star Patrol, Brick Break, Pong, and Snake. The west wall holds the Tokyo Nights racer. The east wall has snacks.'],
    ],
  },
  {
    id: 'basement-snacks', name: 'Soda Sam', x: 7.2, z: 44.5, yaw: Math.PI, gesture: 'wave',
    appearance: { skin: '#c79b7c', shade: '#9f755c', hair: '#41332a', top: '#7a4a3a', trim: '#e0af68', style: 'tee' },
    role: 'Snack host', team: 'basement',
    greeting: 'Grab a soda and watch a round. The snack bar is free and the fizz is loud.',
    topics: [
      ['Meet Sam', 'I run the basement snack bar on the east wall. The soda machine has three loud flavors.'],
      ['Take a break', 'Sit at the center table and watch the leaderboard. The games wait for you.'],
      ['Back upstairs', 'Use the south elevator or the map to return to the club or visit the roof.'],
    ],
  },
]);

export const BASEMENT_STATIONS = Object.freeze([
  { id: 'basement-star-1', name: 'Star Patrol II', software: 'star', kind: 'arcade', x: -10, z: 36.4, yaw: 0, detail: 'An original club game. Clear the formation before it reaches the line.', initial: 'star', height: 1.48 },
  { id: 'basement-brick-1', name: 'Brick Break II', software: 'brick', kind: 'arcade', x: -7.5, z: 36.4, yaw: 0, detail: 'An original club game. Clear the bricks with three lives.', initial: 'brick', height: 1.48 },
  { id: 'basement-pong', name: 'Basement Pong', software: 'pong', kind: 'arcade', x: -5, z: 36.4, yaw: 0, detail: 'An original club game. First to five points wins against the cabinet.', initial: 'pong', height: 1.48 },
  { id: 'basement-leaderboard', name: 'High score wall', software: 'leaderboard', kind: 'video', x: 0, z: 35.9, yaw: 0, detail: 'The top local scores for Star Patrol, Brick Break, Snake, and Pong.', initial: 'leaderboard', height: 1.72 },
  { id: 'basement-snake', name: 'Snake Pit', software: 'snake', kind: 'arcade', x: 5, z: 36.4, yaw: 0, detail: 'An original club game. Eat, grow, and avoid the walls and tail.', initial: 'snake', height: 1.48 },
  { id: 'basement-star-2', name: 'Star Patrol III', software: 'star', kind: 'arcade', x: 7.5, z: 36.4, yaw: 0, detail: 'An original club game. A second cabinet with the same formation.', initial: 'star', height: 1.48 },
  { id: 'basement-brick-2', name: 'Brick Break III', software: 'brick', kind: 'arcade', x: 10, z: 36.4, yaw: 0, detail: 'An original club game. A second cabinet with fresh bricks.', initial: 'brick', height: 1.48 },
  { id: 'basement-race', name: 'Tokyo Nights Racer', software: 'race', kind: 'arcade', x: -11.2, z: 42, yaw: Math.PI / 2, detail: 'The expressway racer and VR garage. A second portal below the club.', initial: 'race', height: 1.48 },
  { id: 'basement-snackbar', name: 'Snack bar', software: 'snacks', kind: 'boombox', x: 11.2, z: 42, yaw: -Math.PI / 2, detail: 'Choose a soda. The pour sound is loud and the cup is free.', initial: 'snacks', height: 1.25 },
]);
