export const RANGER_CONTROLS = 'Screen: WASD moves, E interacts. Touch: UP, DOWN, LEFT, RIGHT move, USE interacts, MAP opens rooms. Drag to look around. VR: left stick moves, right stick turns, right trigger selects. Hold the left trigger to aim. Release it to teleport.';

export const RANGERS_AREA = Object.freeze({ id: 'rangers', name: 'RANGERS FRONT DESK', x: -11.5, z: 11.6, width: 12, depth: 4.8, beacon: { x: -9, z: 9.35, yaw: Math.PI } });

export const ELEVATOR = Object.freeze({ id: 'club-elevator', name: 'The club elevator', software: 'elevator', x: -13.75, z: 10.6, height: 1.35,
  stand: { x: -13.7, z: 9.35, yaw: Math.PI },
  detail: 'Step into the open cabin or use this control. The elevator directory provides shortcuts to every club area. Choose a room to travel there.' });

export const ELEVATOR_CABIN = Object.freeze({ ...ELEVATOR, id: 'elevator-directory', x: -15.5, z: 13.48, height: 1.5, stand: { x: -15.5, z: 12, yaw: Math.PI } });

export const RANGERS = Object.freeze([
  { id: 'mihai', name: 'Mihai', country: 'Romania', x: -11.2, gesture: 'wave',
    appearance: { skin: '#dbb299', shade: '#b4866c', hair: '#756a57', top: '#2c3c55', trim: '#5a6c81', beard: true, glassesTop: true, style: 'tee', shield: true },
    greeting: 'Welcome to the club. The Rangers are here to help. Ask for directions or choose a room from the directory.',
    topics: [
      ['Meet Mihai', 'This cameo represents Mihai from Romania, listed among the Omarchy Rangers. The club conversations are fictional.'],
      ['Find a room', 'The room directory lists every area. Choose a destination to travel there. You can also walk through the marked doorways between the team rooms.'],
      ['Get started', 'Try the nearby arcade, meet a team, or select a computer screen. You can return to this front desk from the map whenever you need directions.'],
    ] },
  { id: 'mateo-vaz', name: 'Mateo Vaz', country: 'Uruguay', x: -9, gesture: 'explain',
    appearance: { skin: '#c59979', shade: '#9e6d4f', hair: '#42312a', top: '#cec3a4', trim: '#aa9b7e', glasses: true, style: 'plaid', shield: true },
    greeting: 'The elevator is beside our desk. Its directory opens every club area. I can also help with the screen and VR controls.',
    topics: [
      ['Meet Mateo', 'This cameo represents Mateo Vaz from Uruguay, listed among the Omarchy Rangers. The club conversations are fictional.'],
      ['Use the elevator', 'The cabin stays open. Select its lit directory control, then choose a room. The front-desk map action provides the same room shortcuts.'],
      ['Find the games', 'The arcade row is in front of this desk. Nintendo and Sega are across the lounge. The Tokyo Nights cabinet opens the race and garage.'],
    ] },
  { id: 'nira', name: 'Nira', country: 'Nepal', x: -6.8, gesture: 'beat',
    appearance: { skin: '#57584e', shade: '#3e423d', hair: '#20221e', top: '#79322f', trim: '#aa5443', style: 'tee', silhouette: true, shield: true },
    greeting: 'Need a hand? The Rangers help you find your way. Ask about the controls, take a pause, or choose another room.',
    topics: [
      ['Meet Nira', 'This cameo represents Nira from Nepal, listed among the Omarchy Rangers. The portrait follows the illustrated public profile. Club conversations are fictional.'],
      ['Ask for help', 'Describe what you want to do and what happens instead. Include the steps you try. Clear details help another person understand the problem.'],
      ['Take a pause', 'Use PAUSE or press P on screen. In VR, B closes a panel or pauses exploration. Resume when you are ready.'],
    ] },
].map((npc) => Object.freeze({ ...npc, team: 'rangers', role: 'Omarchy Ranger', z: 12.15, yaw: Math.PI, seated: true, height: 1.6, eyeHeight: 1.3,
  source: 'https://omarchy.org/teams/', imageSource: `https://omarchy.org/assets/images/team/${npc.id}.webp` })));

export const RANGERS_FURNITURE = Object.freeze([
  { id: 'rangers-counter', kind: 'rangers', x: -9, z: 11.2, width: 6.6, depth: .9, height: .82 },
  { id: 'elevator-left', kind: 'rangers', x: -17.1, z: 12.2, width: .16, depth: 2.8, height: 3.2 },
  { id: 'elevator-right', kind: 'rangers', x: -13.9, z: 12.2, width: .16, depth: 2.8, height: 3.2 },
  { id: 'elevator-back', kind: 'rangers', x: -15.5, z: 13.6, width: 3.36, depth: .16, height: 3.2 },
  { id: 'elevator-roof', kind: 'rangers', x: -15.5, z: 12.2, width: 3.36, depth: 2.8, height: 3.3, bottom: 3.2 },
  { id: 'rangers-planter', kind: 'rangers', x: -13.05, z: 12.9, width: .7, depth: .7, height: .56 },
]);
