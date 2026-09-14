export const DESIGN_STUDIO = Object.freeze({ x: 18, z: 21, width: 18, depth: 14, doorX: 12.5, doorZ: 14, doorWidth: 3.4, source: 'https://omarchy.org/teams/' });

export const DESIGN_CREW = Object.freeze([
  { id: 'baris-girismen', name: 'Barış Girişmen', country: 'Türkiye', x: 15, z: 19.5, gesture: 'explain',
    appearance: { skin: '#c69b7f', shade: '#a87960', hair: '#2a292c', top: '#c9bd9f', trim: '#e6dec6', style: 'overshirt', wavy: true },
    greeting: 'Welcome to the design studio. Every desk changes the shared poster on the easel. Start with a palette and see what happens.', topics: [
      ['Meet Barış', 'This cameo represents Barış Girişmen from Türkiye, listed on the Omarchy design team. The club conversations are fictional.'],
      ['Choose a palette', 'The palette desk offers three print treatments. Compare the background, text, and accent colors on the same poster.'],
      ['Explore the studio', 'The desks control color, type, layout, icons, and motion. The large easel shows the result of your choices together.'],
    ] },
  { id: 'christoffer-hallas', name: 'Christoffer Hallas', country: 'USA', x: 20.4, z: 17.7, gesture: 'hands',
    appearance: { skin: '#dfb397', shade: '#b58b72', hair: '#594438', hairHighlight: '#87684e', top: '#24283b', trim: '#414868', style: 'hoodie', stubble: true },
    greeting: 'The typography desk changes the poster’s voice. Compare pixel lettering, terminal lettering, and a mix of both.', topics: [
      ['Meet Christoffer', 'This cameo represents Christoffer Hallas from the USA, listed on the Omarchy design team. The club conversations are fictional.'],
      ['Set the type', 'A typeface affects the shape and rhythm of a message. Keep the title distinct from the details so readers can find both.'],
      ['Read at a distance', 'The easel shows the poster at room scale. Step back to check the title, then approach to read the details.'],
    ] },
  { id: 'daniel-schmier', name: 'Daniel Schmier', country: 'Germany', x: 22.5, z: 18.6, gesture: 'wave',
    appearance: { skin: '#c89f82', shade: '#9f775f', hair: '#242426', top: '#20232c', trim: '#e1e0d4', style: 'jersey', quiff: true, wideSmile: true },
    greeting: 'Try the layout desk. The same words and colors can become a poster, a split composition, or a grid.', topics: [
      ['Meet Daniel', 'This cameo represents Daniel Schmier from Germany, listed on the Omarchy design team. The club conversations are fictional.'],
      ['Change the layout', 'Layout directs attention through position and space. Choose a composition at the desk and compare the order of the same content.'],
      ['Use a grid', 'A grid aligns related elements. Leave enough space between groups so the reader can distinguish the title, artwork, and details.'],
    ] },
  { id: 'andres-villagran', name: 'Andrés Villagrán', country: 'Chile', x: 22.2, z: 25.5, gesture: 'disk',
    appearance: { skin: '#d8b294', shade: '#b1876d', hair: '#33342e', top: '#2c303c', trim: '#454954', style: 'blazer', frames: true, parted: true, chinBeard: true, lanyard: true },
    greeting: 'The icon bench has a cursor, a pencil, and a small window. Pick a mark and watch it appear on the studio poster.', topics: [
      ['Meet Andrés', 'This cameo represents Andrés Villagrán from Chile, listed on the Omarchy design team. The club conversations are fictional.'],
      ['Draw an icon', 'Use a clear silhouette and a consistent pixel grid. The icon should remain recognizable when the display makes it small.'],
      ['Keep a label', 'An icon can support a label. A label gives a control an explicit name, which helps when the picture has more than one meaning.'],
    ] },
  { id: 'niklas-jul', name: 'Niklas Jul', country: 'Denmark', x: 14.7, z: 24.8, gesture: 'beat',
    appearance: { skin: '#e4b994', shade: '#bd906c', hair: '#a67c48', hairHighlight: '#d6b174', top: '#47668f', trim: '#6785af', style: 'tee', quiff: true, wideSmile: true },
    greeting: 'The motion desk animates the poster’s icon. Try a measured step or a gentle pulse, then compare it with the static version.', topics: [
      ['Meet Niklas', 'This cameo represents Niklas Jul from Denmark, listed on the Omarchy design team. The club conversations are fictional.'],
      ['Choose the motion', 'A motion pattern can show a change or direct attention. The studio keeps the title and details still while the icon moves.'],
      ['Reduce motion', 'The reduced-motion preference stops the animated preview. Your color, type, layout, and icon choices remain visible.'],
    ] },
].map((npc) => Object.freeze({ ...npc, yaw: Math.PI, role: 'Omarchy design', team: 'design', source: DESIGN_STUDIO.source, imageSource: `https://omarchy.org/assets/images/team/${npc.id}.webp` })));

export const STUDIO_PALETTES = Object.freeze([
  { name: 'NIGHT PRINT', background: '#16161e', foreground: '#c0caf5', accent: '#9ece6a', secondary: '#bb9af7' },
  { name: 'PAPER PRINT', background: '#e6dec6', foreground: '#24283b', accent: '#9d3546', secondary: '#315a78' },
  { name: 'BLUE PRINT', background: '#233d57', foreground: '#e5e9ff', accent: '#7dcfff', secondary: '#e0af68' },
]);

export const DESIGN_DESKS = Object.freeze({
  palette: { title: 'Palette desk', x: 13, z: 19, yaw: Math.PI, labels: STUDIO_PALETTES.map((palette) => palette.name), detail: 'Choose the poster colors. The desk screens and the large easel share your changes.' },
  type: { title: 'Typography desk', x: 19, z: 16, yaw: 0, labels: ['PIXEL DISPLAY', 'TERMINAL TYPE', 'MIXED TYPE'], detail: 'Compare pixel and terminal lettering. Keep the same message while you change its type.' },
  layout: { title: 'Layout desk', x: 24, z: 20, yaw: -Math.PI / 2, labels: ['POSTER', 'SPLIT', 'GRID'], detail: 'Arrange the same content in three compositions. Watch the large easel as the layout changes.' },
  icon: { title: 'Icon bench', x: 24, z: 24, yaw: -Math.PI / 2, labels: ['CURSOR', 'PENCIL', 'WINDOW'], detail: 'Choose an original pixel mark. It appears in every studio preview at the same time.' },
  motion: { title: 'Motion desk', x: 17.5, z: 25, yaw: Math.PI, labels: ['STATIC', 'STEP', 'PULSE'], detail: 'Animate the icon while the words stay still. Reduced motion keeps the preview static.' },
});

export function createDesignState() { return { palette: 0, type: 0, layout: 0, icon: 0, motion: 0, clock: 0 }; }

export function selectDesign(state, field, index) {
  if (!Object.hasOwn(DESIGN_DESKS, field) || !Number.isInteger(index) || index < 0 || index >= DESIGN_DESKS[field].labels.length) return false;
  state[field] = index;
  if (field === 'motion') state.clock = 0;
  return true;
}

export function designPanel(station, state) {
  const desk = DESIGN_DESKS[station.studio];
  return { title: desk.title.toUpperCase(), subtitle: `LIVE POSTER · ${desk.labels[state[station.studio]]}`, text: desk.detail, layout: 'design',
    options: [...desk.labels.map((label, index) => ({ id: `design:${station.studio}:${index}`, label, primary: state[station.studio] === index })), { id: 'back', label: 'BACK TO THE ROOM' }] };
}
