export const MAC_ROOM = Object.freeze({ x: 39, z: 23, width: 24, depth: 18, doorX: 27, doorZ: 25.5, doorWidth: 3.2, source: 'https://omarchy.org/teams/' });

const members = [
  ['marcelo-alcantara', 'Marcelo Alcantara', 'Brazil/Australia', { skin: '#d2a28b', shade: '#ac7963', hair: '#635b55', top: '#2d3445', trim: '#5b6578', style: 'tee', cropped: true, stubble: true, chinBeard: true }, 'The Mac lab', 'The lab places classic Macintosh models beside modern Apple-silicon machines. Select a screen to explore its local demos.'],
  ['naeem-malik', 'Naeem Malik', 'India', { skin: '#c7a68e', shade: '#9e806b', hair: '#252831', top: '#657f94', trim: '#a0b5bf', style: 'hoodie', parted: true }, 'Apple silicon', 'Apple silicon combines CPU, GPU, and other hardware in one system on a chip. Linux support depends on the drivers for each part.'],
  ['scott-jones', 'Scott Jones', 'USA', { skin: '#d5a48e', shade: '#ae7d67', hair: '#554a3e', hairHighlight: '#8b8276', top: '#334858', trim: '#b3c6d4', style: 'overshirt', quiff: true, wideSmile: true }, 'Classic Macintosh', 'The original Macintosh arrives in 1984 with a monochrome display and a mouse. The club model recreates its compact case.'],
  ['eduardo-martinez', 'Eduardo Martinez', 'Portugal', { skin: '#cda68d', shade: '#a27b64', hair: '#453c38', top: '#262c3a', trim: '#505b6c', style: 'hoodie', stubble: true }, 'Display hardware', 'A display needs a working path from the graphics hardware to the panel. Test resolution, color, brightness, and external outputs separately.'],
  ['shun-li', 'Shun Li', 'China', { skin: '#ead8a2', shade: '#c6b77f', hair: '#222420', top: '#e6dec6', trim: '#c4b899', style: 'tee', frames: true, quiff: true }, 'Input devices', 'Keyboards, trackpads, and mice send different input events. Test clicks, gestures, and keyboard navigation with clear expected results.'],
  ['dj', 'Dj', 'Canada', { skin: '#c89c76', shade: '#a57954', hair: '#302621', top: '#555660', trim: '#747680', style: 'tee', wavy: true }, 'Sound and audio', 'Audio support includes speakers, microphones, and headphone outputs. Check the input and output paths independently at a controlled volume.'],
  ['ryan-murray', 'Ryan Murray', 'Australia', { skin: '#c0caf5', shade: '#9aa5ce', hair: '#24283b', top: '#314953', trim: '#9ece6a', style: 'hoodie', avatar: 'bridge' }, 'Network hardware', 'Compare wireless and wired connections under the same conditions. The bridge illustration on this cameo follows the public profile image.'],
  ['miguel-cruz', 'Miguel Cruz', 'USA', { skin: '#b78e6d', shade: '#906749', hair: '#302c29', top: '#334d7e', trim: '#dad6bd', style: 'varsity', frames: true, cap: true, stubble: true }, 'Power management', 'Power tests include idle, active use, sleep, and wake. A reliable report names the hardware and the steps that trigger the problem.'],
  ['liam', 'Liam', 'USA', { skin: '#dfaf83', shade: '#bd895e', hair: '#3d2e21', top: '#47668f', trim: '#7aa2f7', style: 'tee', pixelFace: true }, 'Pixel interfaces', 'The club preserves the block-shaped face from this public profile. Large pixels and clear labels suit the small Macintosh display.'],
  ['eryk-wieliczko', 'Eryk Wieliczko', 'Poland', { skin: '#c0caf5', shade: '#9aa5ce', hair: '#24283b', top: '#416b51', trim: '#9ece6a', style: 'tee', avatar: 'hill' }, 'Graphics tests', 'Compare the same image across display modes. The hill illustration on this cameo follows the public landscape profile image.'],
  ['jaidip-subedi', 'Jaidip Subedi', 'Nepal', { skin: '#c5c2bc', shade: '#96958f', hair: '#242426', top: '#24262c', trim: '#45474d', style: 'hoodie', quiff: true, chinBeard: true, stubble: true }, 'Logs and reports', 'A useful hardware report includes the model, software version, steps, and relevant logs. Describe what you expect and what actually happens.'],
  ['joshua-warren', 'Joshua Warren', 'USA', { skin: '#dfb295', shade: '#b68b70', hair: '#a38b66', hairHighlight: '#c7b78e', top: '#7b9cbd', trim: '#b1c9d7', style: 'overshirt', cropped: true, wideSmile: true }, 'Reproduce a bug', 'Repeat the same short sequence on the same hardware. Change one condition at a time so the result has a clear explanation.'],
  ['shawn-yeager', 'Shawn Yeager', 'USA', { skin: '#d9b497', shade: '#b58c70', hair: '#a59e8f', top: '#283647', trim: '#495364', style: 'blazer', frames: true, bald: true, stubble: true }, 'Hardware inventory', 'The hardware card names the model, year, and processor family. Those details help distinguish machines with similar cases.'],
  ['randy', 'Randy', 'Netherlands', { skin: '#a8a9a4', shade: '#7e817c', hair: '#2b3031', hairHighlight: '#686e6c', top: '#343b42', trim: '#626b70', style: 'hoodie', quiff: true }, 'System updates', 'Compare behavior before and after an update with the same test. Keep the version details with the result so another person can repeat it.'],
  ['jon-kinney', 'Jon Kinney', 'USA', { skin: '#d1ac8b', shade: '#a88363', hair: '#7b684b', top: '#2d4355', trim: '#5b7180', style: 'overshirt', cropped: true, wideSmile: true }, 'The community', 'The Omarchy teams page introduces the people who contribute to the project. This room celebrates the M team’s work on the Mac.'],
];

const placements = [
  [29.8, 18.7, 1.3], [32.7, 19.4, -1.8],
  [35.5, 18.5, 1.0], [38.4, 20.2, -2.1],
  [44.7, 18.6, .8], [48, 19, -1.8],
  [30.5, 22.2, -.7], [35, 24, 2.7],
  [33.4, 27.2, 1.3], [37.2, 27, -1.5],
  [45.6, 28.2, 2.0], [42.4, 26.8, 1.0], [48, 26.8, -1.0],
  [41, 21.7, -.9], [48.7, 22.5, -1.4],
].map(([x, z, yaw]) => ({ x, z, yaw }));

export const MAC_CREW = Object.freeze(members.map(([id, name, country, appearance, topic, reply], index) => Object.freeze({
  id, name, country, appearance, team: 'mac', role: 'Omarchy M team', ...placements[index],
  gesture: ['wave', 'explain', 'hands', 'disk', 'glasses'][index % 5],
  source: MAC_ROOM.source, imageSource: `https://omarchy.org/assets/images/team/${id}.webp`,
  greeting: `Welcome to the Mac room. ${reply}`,
  topics: [
    [`Meet ${name.split(' ')[0]}`, `This cameo represents ${name} from ${country}, listed on Omarchy’s M team. The club conversations are fictional.`],
    [topic, reply],
    ['Try the Macs', 'Select a Mac screen to open its desktop, terminal, or hardware card. The displays are local club demos. The Omarchy logo marks the far wall.'],
  ],
})));

export const MAC_MODELS = Object.freeze([
  { id: 'mac-classic', name: 'Macintosh 128K', year: 1984, model: 'classic', chip: 'Motorola 68000', x: 31, z: 16, yaw: 0 },
  { id: 'mac-imac-g3', name: 'iMac G3', year: 1998, model: 'g3', chip: 'PowerPC G3', x: 37, z: 16, yaw: 0 },
  { id: 'mac-imac-g4', name: 'iMac G4', year: 2002, model: 'g4', chip: 'PowerPC G4', x: 43, z: 16, yaw: 0 },
  { id: 'mac-power-g5', name: 'Power Mac G5', year: 2003, model: 'g5', chip: 'PowerPC G5', x: 49, z: 16, yaw: 0 },
  { id: 'mac-air', name: 'MacBook Air M1', year: 2020, model: 'air', chip: 'Apple M1', x: 32, z: 30, yaw: Math.PI },
  { id: 'mac-mini', name: 'Mac mini M1', year: 2020, model: 'mini', chip: 'Apple M1', x: 39, z: 30, yaw: Math.PI },
  { id: 'mac-studio', name: 'Mac Studio', year: 2022, model: 'studio', chip: 'Apple M1 Max', x: 47, z: 30, yaw: Math.PI },
].map((model) => Object.freeze(model)));

export const MAC_MODES = Object.freeze(['mac-desktop', 'mac-terminal', 'mac-hardware']);
