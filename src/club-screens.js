import { CLUB_CREW, ZONES, STATIONS, FLOORS, WALLS } from './club-data.mjs';
import { drawMalibuDisplay } from './club-malibu-screen.js';
import { drawSecurityDisplay } from './club-security-screen.js';
import { drawDesignPoster } from './club-design-art.js';

const C = { ink: '#16161e', paper: '#c0caf5', cyan: '#7dcfff', gold: '#e0af68', pink: '#f7768e', purple: '#bb9af7', green: '#9ece6a', muted: '#9aa5ce' };
const hash = (n) => { const value = Math.sin(n * 93.7) * 43758.54; return value - Math.floor(value); };

function label(ctx, text, x, y, size = 10, color = C.paper, align = 'left') {
  ctx.fillStyle = color; ctx.font = `${size}px "Courier New", monospace`; ctx.textAlign = align; ctx.fillText(text, x, y);
}

export function paragraph(ctx, text, x, y, width, size = 28, color = C.paper, lineHeight = 1.4) {
  ctx.font = `${size}px "Courier New", monospace`;
  let line = '';
  for (const word of text.split(' ')) {
    if (ctx.measureText(`${line} ${word}`).width > width && line) { label(ctx, line, x, y, size, color); y += size * lineHeight; line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  label(ctx, line, x, y, size, color);
  return y;
}

function desktop(ctx, title, background, time) {
  ctx.fillStyle = background; ctx.fillRect(0, 0, 256, 192);
  ctx.fillStyle = '#d1d5d4'; ctx.fillRect(0, 0, 256, 14);
  label(ctx, title, 8, 10, 9, '#16161e');
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#d1d5d4'; ctx.fillRect(205, 30 + i * 43, 22, 20);
    ctx.fillStyle = '#343b58'; ctx.fillRect(209, 33 + i * 43, 14, 7);
    label(ctx, ['SYSTEM', 'DEMO', 'DISKS'][i], 216, 63 + i * 43, 8, '#e5e9ff', 'center');
  }
  ctx.fillStyle = '#c0caf5'; ctx.fillRect(25, 42, 154, 101);
  ctx.strokeStyle = '#16161e'; ctx.strokeRect(25.5, 42.5, 154, 101);
  ctx.fillStyle = '#343b58'; ctx.fillRect(26, 43, 152, 12);
  label(ctx, 'MIDNIGHT COMPUTER CLUB', 32, 52, 8, '#ffffff');
  label(ctx, 'Welcome to 1989.', 38, 80, 10, '#24283b');
  label(ctx, 'Select a demo.', 38, 101, 10, '#24283b');
  label(ctx, 'Free play all night.', 38, 122, 9, '#343b58');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(65 + Math.sin(time) * 3, 158, 4, 8);
}

function terminal(ctx, station, state) {
  const green = station.id === 'apple-iie' ? '#9ece6a' : station.software === 'bbs' ? '#e0af68' : '#b9b6ff';
  ctx.fillStyle = station.id === 'c64' ? '#4039a3' : '#101a19'; ctx.fillRect(0, 0, 256, 192);
  let lines;
  if (station.software === 'bbs') {
    if (state.mode === 'dial' && state.clock < 3) lines = ['MIDNIGHT BBS / LOCAL DEMO', '', 'AT', 'OK', 'ATDT 1989', ['DIAL TONE', 'DIALING...', 'HANDSHAKE...', 'CONNECT 1200'][Math.min(3, Math.floor(state.clock * 1.4))]];
    else if (state.mode === 'messages' && state.online) lines = ['MIDNIGHT BBS / BULLETIN', '', '01  DEMO NIGHT AT THE CLUB', '02  DISK LABELS ON THE BENCH', '03  NEW MUSIC ON THE ST', '04  THE ARCADE IS OPEN', '', 'END OF MESSAGES'];
    else if (state.mode === 'users' && state.online) lines = ['MIDNIGHT BBS / WHO IS ONLINE', '', ...CLUB_CREW.slice(0, 8).map((member, i) => `${String(i + 1).padStart(2, '0')}  ${member.name.toUpperCase()}`)];
    else lines = ['MIDNIGHT BBS / LOCAL DEMO', '', state.online ? 'CONNECT 1200' : 'AT', state.online ? 'WELCOME TO THE CLUB.' : 'OK', '', 'READ MESSAGES', 'WHO IS ONLINE', '', state.online ? 'CLUB>' : 'READY TO DIAL.'];
  } else if (state.mode === 'list') lines = ['READY.', '', '10 PRINT "MIDNIGHT CLUB"', '20 FOR I=1 TO 8', '30 PRINT "HELLO, 1989"', '40 NEXT I', '50 END', '', 'READY.'];
  else if (state.mode === 'directory') lines = ['0 "CLUB DISK" 89 2A', '', '  24 "STARFIELD" PRG', '  18 "PIXEL ART" PRG', '  32 "CHIP MUSIC" PRG', '  08 "READ ME" SEQ', '', '582 BLOCKS FREE.', 'READY.'];
  else lines = [station.id === 'c64' ? '**** COMMODORE 64 BASIC V2 ****' : station.id === 'apple-iie' ? 'APPLE ][  BASIC' : 'AMSTRAD CPC 464', '', station.id === 'c64' ? '64K RAM SYSTEM' : 'MIDNIGHT COMPUTER CLUB', station.id === 'c64' ? '38911 BASIC BYTES FREE' : 'BASIC DEMO DISK', '', 'READY.'];
  lines.forEach((text, i) => label(ctx, text, 10, 17 + i * 14, text.length > 28 ? 8 : 10, green));
  if (Math.floor(state.clock * 2) % 2 === 0) { ctx.fillStyle = green; ctx.fillRect(10, Math.min(178, 21 + lines.length * 14), 6, 9); }
}

export function drawCabinet(ctx, game, width = 256, height = 192) {
  ctx.save(); ctx.scale(width / 256, height / 192);
  const green = game.kind === 'snake';
  ctx.fillStyle = green ? '#9baa65' : '#101526'; ctx.fillRect(0, 0, 256, 192);
  label(ctx, `SCORE ${game.score}`, 8, 13, 9, green ? '#243d28' : C.gold);
  if (game.kind === 'brick') {
    for (const [i, brick] of game.bricks.entries()) if (brick.active) { ctx.fillStyle = [C.pink, C.gold, C.cyan][Math.floor(i / 8)]; ctx.fillRect(brick.x * 256 - 12, brick.y * 192 - 5, 25, 10); }
    ctx.fillStyle = C.paper; ctx.fillRect(game.x * 256 - 27, 164, 54, 5);
    ctx.fillStyle = '#e5e9ff'; ctx.fillRect(game.ball.x * 256 - 3, game.ball.y * 192 - 3, 6, 6);
    label(ctx, `LIVES ${game.lives}`, 248, 13, 9, C.muted, 'right');
  } else if (game.kind === 'star') {
    for (let i = 0; i < 32; i++) { ctx.fillStyle = '#414868'; ctx.fillRect(hash(i + 1) * 256, (hash(i + 32) * 192 + game.elapsed * 12) % 192, 1, 2); }
    const offset = Math.sin(game.elapsed * .85) * .075;
    game.targets.forEach((target, i) => {
      if (!target.active) return;
      const x = (target.x + offset) * 256; const y = (target.y + game.elapsed * .006) * 192;
      ctx.fillStyle = [C.pink, C.green, C.purple][Math.floor(i / 6)];
      ctx.fillRect(x - 7, y - 3, 14, 6); ctx.fillRect(x - 9, y, 3, 7); ctx.fillRect(x + 6, y, 3, 7);
      ctx.fillStyle = '#16161e'; ctx.fillRect(x - 4, y - 1, 2, 2); ctx.fillRect(x + 2, y - 1, 2, 2);
    });
    ctx.fillStyle = C.cyan; ctx.fillRect(game.x * 256 - 9, 166, 18, 6); ctx.fillRect(game.x * 256 - 3, 160, 6, 7);
    ctx.fillStyle = C.gold; game.bullets.forEach((bullet) => ctx.fillRect(bullet.x * 256 - 1, bullet.y * 192, 2, 6));
  } else {
    ctx.fillStyle = '#6c804a';
    for (let x = 0; x <= 16; x++) ctx.fillRect(x * 15 + 8, 25, 1, 156);
    for (let y = 0; y <= 12; y++) ctx.fillRect(8, 25 + y * 13, 240, 1);
    ctx.fillStyle = '#243d28';
    game.snake.forEach((part) => ctx.fillRect(9 + part.x * 15, 26 + part.y * 13, 13, 11));
    ctx.fillRect(12 + game.food.x * 15, 29 + game.food.y * 13, 7, 5);
  }
  if (game.state !== 'playing') {
    ctx.fillStyle = green ? '#9baa65ee' : '#16161eee'; ctx.fillRect(23, 73, 210, 49);
    label(ctx, game.state === 'ready' ? 'PRESS START' : game.state === 'won' ? 'ROUND COMPLETE' : 'GAME OVER', 128, 102, 15, green ? '#243d28' : C.paper, 'center');
  }
  ctx.restore();
}

export function drawStation(ctx, station, state, game, jukebox, design, reducedMotion = false) {
  ctx.imageSmoothingEnabled = false;
  if (station.kind === 'malibu') { drawMalibuDisplay(ctx, state); return; }
  ctx.fillStyle = '#0b1015'; ctx.fillRect(0, 0, 256, 192);
  if (!state.power) return;
  if (station.software === 'design') {
    ctx.save(); ctx.translate(0, 24); drawDesignPoster(ctx, design, 256, 144, reducedMotion); ctx.restore();
    label(ctx, station.name.toUpperCase(), 10, 15, 10, C.gold);
    label(ctx, 'SHARED STUDIO POSTER', 10, 185, 10, C.cyan); return;
  }
  if (station.software === 'security') { drawSecurityDisplay(ctx, station, state); return; }
  const time = state.clock;
  if (station.software === 'jukebox') {
    label(ctx, 'OMARCHY RADIO', 16, 22, 16, C.gold);
    const track = jukebox?.track;
    const titleEnd = paragraph(ctx, track?.title || 'Choose your next track.', 16, 53, 224, 13, C.paper, 1.2);
    paragraph(ctx, track?.artist || 'Select this screen to open the library.', 16, titleEnd + 21, 224, 10, C.cyan, 1.2);
    label(ctx, jukebox?.error ? 'RETRY OR CHOOSE NEXT' : jukebox?.pending ? 'LOAD TRACK...' : jukebox?.playing ? 'PLAY' : 'PAUSE / SELECT', 16, 139, 10, jukebox?.error ? C.pink : C.green);
    label(ctx, `QUEUE ${jukebox?.queue.length || 0}${track?.explicit ? '  EXPLICIT' : ''}`, 16, 157, 10, C.muted);
    ctx.fillStyle = '#343b58'; ctx.fillRect(16, 171, 224, 4);
    const duration = jukebox?.audio?.duration;
    ctx.fillStyle = C.gold; ctx.fillRect(16, 171, Number.isFinite(duration) && duration > 0 ? 224 * jukebox.audio.currentTime / duration : 0, 4);
  } else if (station.software === 'video') {
    const bars = [C.paper, C.gold, C.cyan, C.green, C.purple, C.pink, '#315ac8'];
    bars.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(i * 37, 0, 37, 32); ctx.fillRect(i * 37, 176, 37, 16); });
    label(ctx, 'OMACON 2026', 128, 70, 25, C.gold, 'center');
    label(ctx, 'THE PRIMETIME', 128, 94, 12, C.paper, 'center');
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo(119, 110); ctx.lineTo(119, 135); ctx.lineTo(141, 122.5); ctx.closePath(); ctx.fill();
    label(ctx, 'WATCH IN THE BROWSER', 128, 157, 11, C.paper, 'center');
  } else if (state.mode === 'game' && game) drawCabinet(ctx, game);
  else if (state.mode === 'boing') {
    ctx.fillStyle = '#8387aa'; ctx.fillRect(0, 0, 256, 192);
    ctx.strokeStyle = '#bb9af7'; ctx.lineWidth = 1;
    for (let x = 0; x < 256; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 192); ctx.stroke(); }
    for (let y = 0; y < 192; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke(); }
    const bx = 128 + Math.sin(time * 1.2) * 62; const by = 80 - Math.abs(Math.sin(time * 2)) * 30;
    ctx.fillStyle = '#343b58'; ctx.beginPath(); ctx.ellipse(bx + 10, 156, 36, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(bx, by, 40, 0, Math.PI * 2); ctx.clip();
    for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { ctx.fillStyle = (x + y + Math.floor(time * 3)) % 2 ? '#f7768e' : '#e5e9ff'; ctx.fillRect(bx + x * 11, by + y * 11, 11, 11); }
    ctx.restore(); label(ctx, 'AMIGA / CHECKER BALL', 9, 184, 9, '#ffffff');
  } else if (state.mode === 'starfield') {
    for (let i = 0; i < 90; i++) {
      const depth = (hash(i + 21) + time * .14) % 1;
      const x = 128 + (hash(i + 1) - .5) * 450 * depth; const y = 96 + (hash(i + 12) - .5) * 350 * depth;
      ctx.fillStyle = i % 3 ? C.cyan : C.pink; ctx.fillRect(x, y, depth > .7 ? 2 : 1, depth > .7 ? 2 : 1);
    }
    label(ctx, 'MIDNIGHT DEMO / 1989', 128, 182, 9, C.paper, 'center');
  } else if (['terminal', 'dial', 'messages', 'users', 'basic', 'list', 'directory', 'apple', 'cpc'].includes(state.mode)) terminal(ctx, station, state);
  else if (state.mode === 'workbench') desktop(ctx, 'Workbench 1.3', '#315ac8', time);
  else if (state.mode === 'gem' || state.mode === 'midi') {
    desktop(ctx, 'GEM / Atari ST', '#416b51', time);
    if (state.mode === 'midi') {
      ctx.fillStyle = '#16161e'; ctx.fillRect(20, 37, 166, 120);
      label(ctx, 'MIDI STEP PATTERN', 28, 54, 10, C.cyan);
      for (let i = 0; i < 8; i++) { ctx.fillStyle = i === Math.floor(time * 4) % 8 ? C.gold : C.green; ctx.fillRect(29 + i * 18, 75 + ((i * 3 + state.pattern) % 5) * 9, 12, 12); }
      label(ctx, 'MIDI OUT  /  120 BPM', 28, 147, 8, C.paper);
    }
  } else if (state.mode === 'spectrum' || state.mode === 'load') {
    const colors = ['#111111', '#3535ba', '#cc343b', '#be39aa', '#41b8bd', '#48bc59', '#d8cc56', '#d8dbd4'];
    for (let y = 0; y < 192; y += 6) { ctx.fillStyle = colors[(Math.floor(y / 6) + Math.floor(time * 8)) % 8]; ctx.fillRect(0, y, 256, 6); }
    ctx.fillStyle = '#d8dbd4'; ctx.fillRect(24, 22, 208, 145);
    label(ctx, state.mode === 'load' && time < 4 ? 'Program: MIDNIGHT' : 'ZX SPECTRUM / 48K', 36, 50, 12, '#111111');
    label(ctx, state.mode === 'load' && time < 4 ? 'LOADING FROM TAPE...' : 'COLOR AND SPRITE TEST', 36, 76, 9, '#111111');
    for (let i = 0; i < 6; i++) { ctx.fillStyle = colors[i + 1]; ctx.fillRect(37 + i * 29, 99, 24, 37); }
  } else if (state.mode === 'mac' || state.mode === 'sketch') {
    ctx.fillStyle = '#d3d5cc'; ctx.fillRect(0, 0, 256, 192);
    label(ctx, 'File  Edit  View  Special', 7, 11, 9, '#16161e');
    ctx.strokeStyle = '#16161e'; ctx.strokeRect(0, 15, 255, 176);
    if (state.mode === 'sketch') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(1, 17, 254, 174);
      ctx.strokeStyle = '#c2c5ba';
      for (let x = 0; x < 16; x++) for (let y = 0; y < 12; y++) { ctx.strokeRect(x * 16, y * 16, 16, 16); }
      ctx.fillStyle = '#16161e'; state.pixels.forEach((cell) => ctx.fillRect(cell % 16 * 16 + 1, Math.floor(cell / 16) * 16 + 1, 14, 14));
    } else { label(ctx, 'Hello.', 128, 90, 32, '#16161e', 'center'); label(ctx, 'The midnight club is open.', 128, 126, 10, '#16161e', 'center'); }
  } else if (station.software === 'music') {
    label(ctx, 'TOKYO NIGHTS', 128, 34, 18, C.gold, 'center'); label(ctx, 'CASSETTE / SIDE A', 128, 57, 10, C.paper, 'center');
    for (let i = 0; i < 16; i++) { const h = 12 + Math.sin(time * 3 + i * .6) * 11; ctx.fillStyle = i > 11 ? C.pink : C.green; ctx.fillRect(24 + i * 13, 146 - h * 2, 8, h * 2); }
    label(ctx, 'PLAY THE CLUB SONG', 128, 180, 9, C.paper, 'center');
  } else {
    const green = station.kind === 'gameboy';
    ctx.fillStyle = green ? '#9baa65' : '#192444'; ctx.fillRect(0, 0, 256, 192);
    label(ctx, station.software === 'race' ? 'TOKYO NIGHTS' : station.kind === 'gameboy' ? 'SNAKE' : station.id === 'brick-break' || station.kind === 'atari' ? 'BRICK BREAK' : 'STAR PATROL', 128, 57, 19, green ? '#243d28' : C.paper, 'center');
    label(ctx, 'ORIGINAL CLUB DEMO', 128, 80, 9, green ? '#243d28' : C.cyan, 'center');
    for (let i = 0; i < 6; i++) { ctx.fillStyle = green ? '#4f6d3a' : [C.pink, C.green, C.gold][i % 3]; ctx.fillRect(40 + i * 30, 100 + Math.sin(time * 2 + i) * 7, 16, 13); }
    label(ctx, 'SELECT TO PLAY', 128, 158, 11, green ? '#243d28' : C.gold, 'center');
  }
  ctx.fillStyle = '#00000015';
  for (let y = 1; y < 192; y += 3) ctx.fillRect(0, y, 256, 1);
}

export function drawMap(ctx, x, y, width, height, player) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
  ctx.fillStyle = '#16161e'; ctx.fillRect(x, y, width, height);
  const minX = Math.min(...FLOORS.map((floor) => floor.x - floor.width / 2)); const maxX = Math.max(...FLOORS.map((floor) => floor.x + floor.width / 2));
  const minZ = Math.min(...FLOORS.map((floor) => floor.z - floor.depth / 2)); const maxZ = Math.max(...FLOORS.map((floor) => floor.z + floor.depth / 2));
  const scale = Math.min((width - 24) / (maxX - minX), (height - 16) / (maxZ - minZ));
  const left = x + (width - (maxX - minX) * scale) / 2; const top = y + 8;
  const px = (value) => left + (value - minX) * scale;
  const pz = (value) => top + (value - minZ) * scale;
  for (const floor of FLOORS) {
    ctx.fillStyle = '#24283b'; ctx.fillRect(px(floor.x - floor.width / 2), pz(floor.z - floor.depth / 2), floor.width * scale, floor.depth * scale);
  }
  for (const [i, zone] of ZONES.entries()) {
    ctx.fillStyle = ['#383449', '#324968', '#395245', '#573b4d', '#484251', '#4d4639', '#89786b', '#304b53', '#705e4f'][i];
    ctx.fillRect(px(zone.x - zone.width / 2), pz(zone.z - zone.depth / 2), zone.width * scale, zone.depth * scale);
  }
  ctx.fillStyle = '#9aa5ce';
  WALLS.filter((wall) => !wall.bottom).forEach((wall) => ctx.fillRect(px(wall.x - wall.width / 2), pz(wall.z - wall.depth / 2), Math.max(1, wall.width * scale), Math.max(1, wall.depth * scale)));
  ctx.fillStyle = C.muted;
  STATIONS.forEach((station) => ctx.fillRect(px(station.x) - 2, pz(station.z) - 2, 4, 4));
  label(ctx, 'CLUB', px(0), pz(1), 12, C.paper, 'center');
  label(ctx, 'SECURITY', px(0), pz(21.5), 11, C.cyan, 'center');
  label(ctx, 'DESIGN', px(18), pz(21.5), 11, C.gold, 'center');
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.arc(px(player.x), pz(player.z), 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.strokeRect(x, y, width, height);
  ctx.restore();
}
