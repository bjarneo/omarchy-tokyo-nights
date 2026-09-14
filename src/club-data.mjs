import { CHARACTERS } from './characters.mjs';
import { SECURITY, SECURITY_CREW, SECURITY_LABS } from './club-security.mjs';
import { DESIGN_STUDIO, DESIGN_CREW, DESIGN_DESKS } from './club-design.mjs';
import { MAC_ROOM, MAC_CREW, MAC_MODELS } from './club-mac.mjs';
import { RANGERS, RANGERS_AREA, RANGERS_FURNITURE, ELEVATOR, ELEVATOR_CABIN } from './club-rangers.mjs';

export const CLUB = Object.freeze({ width: 36, depth: 28, height: 4.6, eyeHeight: 1.65, playerHeight: 1.95, radius: .3, speed: 4.2, crewRadius: .36 });
export const ENTRY = Object.freeze({ x: 0, z: 10.8, yaw: 0 });
export const CLUB_OBJECTS = Object.freeze([ELEVATOR, ELEVATOR_CABIN]);
export const FLOORS = Object.freeze([{ x: 0, z: 0, width: CLUB.width, depth: CLUB.depth }, SECURITY, DESIGN_STUDIO, MAC_ROOM]);
export const MALIBU = Object.freeze({ x: 15.65, z: -11.65, yaw: -Math.PI / 8, northStart: 13.3, eastEnd: -9.25, sill: .16, lintel: 4.18, chairX: .42, chairZ: 1.03, approach: Object.freeze({ x: 14.6, z: -10.1, yaw: Math.atan2(-1.05, 1.55) }) });

export const ZONES = Object.freeze([
  { id: 'entry', name: 'THE LOUNGE', x: 0, z: 8, width: 11, depth: 12, beacon: { ...ENTRY } },
  { id: 'amiga', name: 'AMIGA & 8-BIT LAB', x: 11.7, z: -8, width: 12.4, depth: 12, beacon: { x: 10, z: -8.4, yaw: 0 } },
  { id: 'bbs', name: 'THE BBS CORNER', x: -11.7, z: -8, width: 12.4, depth: 12, beacon: { x: -11, z: -8, yaw: 0 } },
  { id: 'console', name: 'NINTENDO & SEGA', x: 11.7, z: 6, width: 12.4, depth: 16, beacon: { x: 8, z: 9.8, yaw: 0 } },
  { id: 'arcade', name: 'THE ARCADE ROW', x: -11.7, z: 6, width: 12.4, depth: 16, beacon: { x: -10.5, z: 8.2, yaw: Math.PI / 2 } },
  { id: 'workshop', name: 'REPAIR & DEMO STAGE', x: 0, z: -7, width: 11, depth: 14, beacon: { x: 2.7, z: -5.8, yaw: 0 } },
  { id: 'malibu', name: 'MALIBU CORNER', x: 15.65, z: -11.625, width: 4.7, depth: 4.75, beacon: { ...MALIBU.approach } },
  { id: 'security', name: 'SECURITY ROOM', ...SECURITY, beacon: { x: 0, z: 16, yaw: Math.PI } },
  { id: 'design', name: 'DESIGN STUDIO', ...DESIGN_STUDIO, beacon: { x: 12.5, z: 16, yaw: -Math.PI * .75 } },
  { id: 'mac-room', name: 'MAC ROOM · TEAM M', ...MAC_ROOM, beacon: { x: 28.8, z: 25.5, yaw: -Math.PI / 2 } },
  RANGERS_AREA,
]);

const hardware = [
  ['amiga500', 'Commodore Amiga 500', 1987, 'amiga', 'computer', 7.5, -11, 0, 'Motorola 68000 · stereo sound', 'workbench'],
  ['amiga1000', 'Commodore Amiga 1000', 1985, 'amiga', 'desktop', 12.8, -11, 0, 'The first Amiga model · custom graphics chips', 'boing'],
  ['c64', 'Commodore 64', 1982, 'basic', 'computer', 7.5, -6.2, 0, 'MOS 6510 · 64 KB RAM · SID sound', 'basic'],
  ['spectrum', 'Sinclair ZX Spectrum', 1982, 'spectrum', 'computer', 12, -6.2, 0, 'Z80 · 48 KB RAM · rubber keys', 'spectrum'],
  ['atari-st', 'Atari 520ST', 1985, 'gem', 'computer', 16, -7.9, -Math.PI / 2, 'Motorola 68000 · built-in MIDI ports', 'gem'],
  ['ibm-xt', 'IBM PC XT', 1983, 'bbs', 'desktop', -14, -11, 0, 'Intel 8088 · amber CRT · Hayes-style modem', 'terminal'],
  ['apple-iie', 'Apple IIe', 1983, 'basic', 'computer', -8.5, -11, 0, '6502 · 64 KB RAM · external disk drive', 'apple'],
  ['mac128', 'Macintosh 128K', 1984, 'mac', 'mac', -14, -6.2, 0, 'Motorola 68000 · 128 KB RAM · one-button mouse', 'mac'],
  ['cpc464', 'Amstrad CPC 464', 1984, 'basic', 'computer', -8.5, -6.2, 0, 'Z80 · built-in cassette deck · colored keys', 'cpc'],
  ['nes', 'Nintendo Entertainment System', 1985, 'console', 'nes', 10, 1.8, 0, '8-bit console · two controllers · cartridge games', 'console'],
  ['famicom', 'Nintendo Famicom', 1983, 'console', 'famicom', 13.6, 1.8, 0, 'Red and cream case · hardwired controllers', 'console'],
  ['master-system', 'Sega Master System', 1986, 'console', 'master', 7, 1.8, 0, '8-bit console · red and black case', 'console'],
  ['mega-drive', 'Sega Mega Drive', 1988, 'console', 'mega', 16, 8.5, -Math.PI / 2, '16-bit console · three-button controller', 'console'],
  ['gameboy', 'Nintendo Game Boy', 1989, 'handheld', 'gameboy', 13.6, 7.5, 0, 'Four green shades · portable cartridge games', 'handheld'],
  ['atari2600', 'Atari 2600', 1977, 'console', 'atari', -8.1, 6.5, 0, 'Woodgrain VCS family · joystick and paddle controls', 'console'],
  ['star-patrol', 'Star Patrol', 1989, 'arcade', 'arcade', -16, 2, Math.PI / 2, 'An original club game. Move and fire at the formation.', 'star'],
  ['brick-break', 'Brick Break', 1989, 'arcade', 'arcade', -16, 5.4, Math.PI / 2, 'An original club game. Keep the ball above the paddle.', 'brick'],
  ['midnight-run', 'Tokyo Nights', 1989, 'race', 'arcade', -16, 8.8, Math.PI / 2, 'The expressway racer and VR garage.', 'race'],
  ['boombox', 'The cassette deck', 1989, 'music', 'boombox', 0, -10.6, 0, 'Play the supplied Tokyo Nights song.', 'music'],
  ['jukebox', 'Omarchy jukebox', 1989, 'jukebox', 'jukebox', 3.3, 9, 0, 'Choose any track from Omarchy Radio. Add tracks to the play queue.', 'jukebox'],
  ['omacon-crt', 'The club cinema', 1989, 'video', 'video', -2.5, 11.2, Math.PI / 2, 'Watch Omacon 2026 in the official YouTube player. This action exits VR and opens the browser player.', 'video'],
  ['malibu-desk', 'The Malibu desk', null, 'coastal', 'malibu', MALIBU.x, MALIBU.z, MALIBU.yaw, 'A sculpted white desk, a mesh chair, and a coastal sunrise through corner windows. Wake the display or enjoy the view.', 'coastal-view'],
  ...Object.entries(SECURITY_LABS).map(([id, lab]) => [`security-${id}`, lab.title, null, 'security', 'security', lab.x, lab.z, lab.yaw, lab.intro, id]),
  ...Object.entries(DESIGN_DESKS).map(([id, desk]) => [`design-${id}`, desk.title, null, 'design', 'design', desk.x, desk.z, desk.yaw, desk.detail, id]),
  ...MAC_MODELS.map((mac) => [mac.id, mac.name, mac.year, 'maclab', 'maclab', mac.x, mac.z, mac.yaw, `${mac.chip}. Choose the Omarchy desktop, local terminal, or hardware card. These are club display demos.`, 'mac-desktop']),
];

export const STATIONS = Object.freeze(hardware.map(([id, name, year, software, kind, x, z, yaw, detail, initial]) => Object.freeze({
  id, name, year, software, kind, x, z, yaw, detail, initial,
  ...(software === 'security' ? { lab: initial } : {}),
  ...(software === 'design' ? { studio: initial } : {}),
  ...(software === 'maclab' ? { mac: MAC_MODELS.find((mac) => mac.id === id) } : {}),
  height: kind === 'malibu' ? 1.43 : kind === 'video' ? 1.72 : kind === 'arcade' || kind === 'jukebox' ? 1.48 : kind === 'gameboy' ? .99 : 1.25,
  stand: kind === 'malibu' ? { ...MALIBU.approach } : { x: x + Math.sin(yaw) * 1.85, z: z + Math.cos(yaw) * 1.85, yaw },
})));

const conversations = [
  { role: 'Club host', x: -2.2, z: 7.1, greeting: 'Welcome to the midnight computer club. Every machine is here for free play. Pick a corner and explore.', topics: [
    ['Show me around', 'The Amiga lab is at the back on the right. Its Malibu corner has a white desk and coastal windows. The BBS corner is on the left. Nintendo and Sega share the sofas.'],
    ['What can I play?', 'Star Patrol and Brick Break run in the arcade row. The Game Boy has a small Snake demo. Open the map to find them.'],
    ['The security room', 'Turn toward the entrance and walk through the doorway marked SECURITY ROOM. Meet the five security cameos, try the lab exercises, and find BYTE, the roaming pixel virus.'],
    ['The design studio', 'The design studio has its own doorway beyond the Nintendo corner. Meet the five design cameos and change the live poster at the creative desks.'],
    ['The Mac room', 'Walk through the design studio to its Mac room doorway. Meet the 15 M-team cameos beside classic Macs and Apple-silicon workstations.'],
  ] },
  { role: 'Console collector', x: 11.8, z: 4, greeting: 'The NES, Famicom, and Sega systems share this corner. The controllers are ready.', topics: [
    ['NES and Famicom', 'The Famicom arrives in Japan in 1983. The gray NES follows in North America in 1985. Their cartridge connectors differ.'],
    ['Try a game', 'Select the NES and start Star Patrol. Move the ship with the left stick or arrow keys. Use a trigger or Space to fire.'],
    ['The Sega shelf', 'The Master System uses an 8-bit processor. The Mega Drive brings a 16-bit 68000 processor in 1988. Both have a place here.'],
  ] },
  { role: 'Disk archivist', x: 8.8, z: -9.1, greeting: 'The Amiga disks are sorted. Workbench and the checker-ball demo are ready to load.', topics: [
    ['The Amiga chips', 'The Amiga has custom chips for graphics and sound. A copper list can change display registers while the screen draws.'],
    ['The floppy shelf', 'An Amiga double-density disk holds 880 KB. The labels distinguish programs, artwork, and music. Try a disk from the machine menu.'],
    ['The demo scene', 'A demo combines code, graphics, and music. Our checker ball and starfield run directly in the club. Select a demo on either Amiga.'],
  ] },
  { role: 'Modem operator', x: -11.3, z: -8.7, greeting: 'The amber terminal runs the club BBS demo. The modem has a speaker of its own.', topics: [
    ['Try the terminal', 'AT checks the modem. ATDT requests tone dialing. The local terminal demo has buttons for these commands and the message board.'],
    ['What is a BBS?', 'A bulletin board system lets callers exchange messages and files. A modem carries data over a telephone line.'],
    ['The IBM desk', 'The PC XT arrives in 1983 with an Intel 8088 processor. Its separate keyboard and monitor leave room for a large system case.'],
  ] },
  { role: 'Arcade regular', x: -11.5, z: 5.2, greeting: 'The cabinets run original club games. Select a screen when you want a round.', topics: [
    ['Star Patrol', 'Move under the formation and fire upward. Clear the targets before they reach the lower line. Your best score stays in this browser.'],
    ['Brick Break', 'Move the paddle under the ball. Clear the bricks and keep your three lives. The ball changes direction with your hit position.'],
    ['The racing cabinet', 'Tokyo Nights opens the expressway game. The VR garage has the same crew and cars. You can return to the club from its menu.'],
  ] },
  { role: 'MIDI musician', x: 2.6, z: -9, greeting: 'The Atari ST has MIDI ports. The cassette deck has the club song. Pick the sound you want to hear.', topics: [
    ['MIDI on the ST', 'MIDI carries note and control messages between instruments. The Atari ST includes MIDI ports in its standard hardware.'],
    ['Try the sequencer', 'Open the Atari ST menu and select the MIDI demo. Its step pattern changes the notes. Enable sound to hear the pattern.'],
    ['Play the song', 'The cassette deck and the Play song button control the same track. Pause it when you want to hear the computer sounds.'],
  ] },
  { role: 'Hardware repair', x: -2.7, z: -3.2, greeting: 'The bench has spare boards, cables, disks, and cartridges. The tools stay here for the next repair.', topics: [
    ['Inside the cases', 'Expansion cards, memory chips, and ribbon cables fill these machines. The cases leave space for parts that owners can replace.'],
    ['Disks and cartridges', 'Floppy disks store magnetic data. Cartridges hold chips in a plastic case. The shelves show both formats.'],
    ['Where are the computers?', 'The blue Amiga screens are across the central aisle. The monochrome Mac and amber PC screens are in the other lab.'],
  ] },
  { role: 'Handheld collector', x: 12.4, z: 9.8, greeting: 'The Game Boy joins the collection in 1989. Its green screen needs only four shades.', topics: [
    ['Try the handheld', 'The club Snake demo uses a small grid. Turn toward the next square of food. Avoid the edges and your own tail.'],
    ['The green screen', 'The original Game Boy uses a monochrome LCD. Its compact screen and cartridge slot make a portable game library possible.'],
    ['Controller details', 'Nintendo controllers use a directional pad. The NES adds A and B buttons. The Game Boy keeps that familiar arrangement.'],
  ] },
  { role: 'BASIC programmer', x: -8, z: -3.5, greeting: 'The computers have different cases and screens. Their BASIC prompts invite the same first experiment.', topics: [
    ['My first program', 'Type 10 PRINT followed by a message, then 20 GOTO 10. The program repeats the message. Our BASIC desks include a small ready-made example.'],
    ['The Spectrum and CPC', 'The ZX Spectrum uses rubber keys and a rainbow stripe. The CPC 464 combines the computer and cassette deck in one case.'],
    ['The Macintosh', 'The Macintosh uses a graphical desktop and a one-button mouse. Try the small sketch grid at its screen.'],
  ] },
];

export const CLUB_CREW = Object.freeze([...CHARACTERS.map((character, index) => Object.freeze({ ...character, ...conversations[index] })), ...SECURITY_CREW, ...DESIGN_CREW, ...MAC_CREW, ...RANGERS]);

export const FURNITURE = Object.freeze([
  { id: 'sofa-main', kind: 'sofa', x: 10, z: 7.4, width: 3.2, depth: 1.15, height: .9, color: '#59465a' },
  { id: 'sofa-lounge', kind: 'sofa', x: -2.7, z: 3.8, width: 3, depth: 1.15, height: .9, color: '#455f69' },
  { id: 'coffee-console', kind: 'coffee', x: 10, z: 5.3, width: 1.8, depth: .8, height: .47, color: '#80604b' },
  { id: 'coffee-lounge', kind: 'coffee', x: -2.7, z: 1.8, width: 1.8, depth: .8, height: .47, color: '#80604b' },
  { id: 'repair', kind: 'bench', x: 0, z: -5, width: 3.6, depth: 1.2, height: .82, color: '#80604b' },
  { id: 'shelf-disks', kind: 'shelf', x: -3.8, z: -11.8, width: 1.7, depth: .65, height: 2.7, color: '#80604b' },
  { id: 'shelf-games', kind: 'shelf', x: 17.2, z: 11.6, width: 1, depth: 2.8, height: 2.6, color: '#80604b' },
  { id: 'shelf-tapes', kind: 'shelf', x: -17.2, z: -1.5, width: 1, depth: 3, height: 2.6, color: '#80604b' },
  { id: 'malibu-chair', kind: 'malibu-chair', x: MALIBU.x + MALIBU.chairX * Math.cos(MALIBU.yaw) + MALIBU.chairZ * Math.sin(MALIBU.yaw), z: MALIBU.z + MALIBU.chairZ * Math.cos(MALIBU.yaw) - MALIBU.chairX * Math.sin(MALIBU.yaw), width: .92, depth: .92, height: 1.4 },
  ...[-7.3, 7.3].map((x) => ({ id: `security-rack-${x}`, kind: 'security-rack', x, z: 26.4, width: 1.5, depth: 1, height: 2.8 })),
  { id: 'design-easel', kind: 'design-easel', x: 18, z: 21, width: 3.4, depth: 3.4, height: 3.2 },
  ...RANGERS_FURNITURE,
]);

export const WALLS = Object.freeze([
  { id: 'west-wall', x: -18, z: 0, width: .35, depth: 28.35, height: 4.6 },
  { id: 'east-wall', x: 18, z: 0, width: .35, depth: 28.35, height: 4.6 },
  { id: 'north-wall', x: 0, z: -14, width: 36, depth: .35, height: 4.6 },
  ...[[-18, -SECURITY.doorWidth / 2], [SECURITY.doorWidth / 2, DESIGN_STUDIO.doorX - DESIGN_STUDIO.doorWidth / 2], [DESIGN_STUDIO.doorX + DESIGN_STUDIO.doorWidth / 2, 18]].map(([start, end], index) => ({ id: `south-wall-${index}`, x: (start + end) / 2, z: 14, width: end - start, depth: .35, height: 4.6 })),
  { id: 'security-lintel', x: 0, z: 14, width: SECURITY.doorWidth, depth: .35, height: 4.6, bottom: 3.2 },
  { id: 'security-west', x: -9, z: 21, width: .35, depth: 14, height: 4.6 },
  { id: 'security-east', x: 9, z: 21, width: .35, depth: 14, height: 4.6 },
  { id: 'security-south', x: 0, z: 28, width: 18.35, depth: .35, height: 4.6 },
  { id: 'design-lintel', x: DESIGN_STUDIO.doorX, z: 14, width: DESIGN_STUDIO.doorWidth, depth: .35, height: 4.6, bottom: 3.2 },
  { id: 'design-north', x: 22.5, z: 14, width: 9, depth: .35, height: 4.6 },
  ...[[14, MAC_ROOM.doorZ - MAC_ROOM.doorWidth / 2], [MAC_ROOM.doorZ + MAC_ROOM.doorWidth / 2, 32]].map(([start, end], index) => ({ id: `mac-west-${index}`, x: 27, z: (start + end) / 2, width: .35, depth: end - start, height: 4.6 })),
  { id: 'mac-lintel', x: 27, z: MAC_ROOM.doorZ, width: .35, depth: MAC_ROOM.doorWidth, height: 4.6, bottom: 3.2 },
  { id: 'mac-north', x: 39, z: 14, width: 24.35, depth: .35, height: 4.6 },
  { id: 'mac-east', x: 51, z: 23, width: .35, depth: 18.35, height: 4.6 },
  { id: 'mac-south', x: 39, z: 32, width: 24, depth: .35, height: 4.6 },
  { id: 'design-south', x: 18, z: 28, width: 18, depth: .35, height: 4.6 },
  { id: 'bbs-divider', x: -5.5, z: -9.5, width: .22, depth: 9, height: 3.5 },
  { id: 'amiga-divider', x: 5.5, z: -9.5, width: .22, depth: 9, height: 3.5 },
  ...[-4.5, 4.5].flatMap((x) => [-2.7, 4.5].map((z) => ({ id: `column-${x}-${z}`, x, z, width: .45, depth: .45, height: 4.6 }))),
]);

export function stationFootprint(station) {
  const width = station.kind === 'malibu' ? 3 : station.kind === 'video' ? 3.5 : station.kind === 'jukebox' ? 1.72 : station.kind === 'arcade' ? 1 : station.kind === 'boombox' ? 2.5 : 2.3;
  const depth = station.kind === 'malibu' ? 1.12 : station.kind === 'video' ? 1.35 : station.kind === 'jukebox' ? 1.12 : station.kind === 'arcade' ? 1.05 : 1.25;
  const c = Math.abs(Math.cos(station.yaw)); const s = Math.abs(Math.sin(station.yaw));
  return { id: station.id, x: station.x, z: station.z, width: width * c + depth * s, depth: depth * c + width * s, height: station.kind === 'video' ? 3.1 : station.kind === 'jukebox' ? 2.45 : station.kind === 'arcade' ? 1.95 : .82 };
}

export const STATIC_OBSTACLES = Object.freeze([
  ...WALLS, ...FURNITURE, ...STATIONS.map(stationFootprint),
]);

export const OBSTACLES = Object.freeze([
  ...STATIC_OBSTACLES,
  ...CLUB_CREW.map((npc) => ({ id: npc.id, x: npc.x, z: npc.z, width: .7, depth: .52, height: npc.height || CLUB.playerHeight })),
]);

export function zoneAt(x, z) {
  if (x >= -17.5 && x <= -5.5 && z >= 9.2 && z <= 14) return RANGERS_AREA;
  if (x > MAC_ROOM.doorX && x <= 51 && z >= 14 && z <= 32) return ZONES.find((zone) => zone.id === 'mac-room');
  if (z > DESIGN_STUDIO.doorZ && z <= 28 && x >= 9 && x <= 27) return ZONES.find((zone) => zone.id === 'design');
  if (z > SECURITY.doorZ && Math.abs(x) <= SECURITY.width / 2 && z <= SECURITY.z + SECURITY.depth / 2) return ZONES.find((zone) => zone.id === 'security');
  if (x >= MALIBU.northStart && z <= MALIBU.eastEnd) return ZONES.find((zone) => zone.id === 'malibu');
  return ZONES.find((zone) => Math.abs(x - zone.x) <= zone.width / 2 && Math.abs(z - zone.z) <= zone.depth / 2) || ZONES[0];
}
