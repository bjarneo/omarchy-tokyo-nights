const C = {
  ink: '#20212d', white: '#e5e9ff', blue: '#7aa2f7', cyan: '#7dcfff',
  pink: '#f7768e', green: '#9ece6a',
};

function rect(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fill();
}

function eyes(ctx, { y = 15, left = 10, right = 19, iris = '#65758b', brow = '#53505a' } = {}) {
  rect(ctx, left, y - 2, 5, 1, brow);
  rect(ctx, right - 1, y - 2, 5, 1, brow);
  for (const x of [left, right]) {
    rect(ctx, x, y, 4, 2, C.white);
    rect(ctx, x + 1, y, 2, 2, iris);
    rect(ctx, x + 2, y + 1, 1, 1, C.ink);
  }
}

function smile(ctx, x, y, width, lip = '#946c6c') {
  poly(ctx, [[x, y], [x + width, y], [x + width - 1, y + 3], [x + 2, y + 3]], lip);
  rect(ctx, x + 1, y, width - 2, 2, '#fff0d8');
}

function torso(ctx, color, skin, shadow = C.ink) {
  poly(ctx, [[8, 27], [24, 27], [29, 33], [28, 38], [5, 38], [4, 32]], color);
  rect(ctx, 8, 29, 2, 8, shadow);
  rect(ctx, 2, 33, 11, 4, skin);
}

function drawBjarne(ctx, facing) {
  const skin = '#dfb08f';
  const light = '#f1c7a5';
  const shade = '#b7806a';
  const beard = '#7c6256';
  torso(ctx, '#242b40', skin, '#3e4865');
  rect(ctx, 13, 26, 10, 4, shade);
  if (facing === 'profile') {
    poly(ctx, [[12, 3], [18, 1], [24, 4], [27, 10], [27, 16], [31, 19], [27, 21], [26, 27], [21, 30], [14, 26], [10, 18], [10, 9]], skin);
    rect(ctx, 16, 4, 8, 5, light);
    rect(ctx, 23, 13, 5, 1, '#695041');
    rect(ctx, 24, 15, 3, 2, '#788b9c');
    poly(ctx, [[16, 20], [22, 22], [27, 20], [27, 25], [24, 29], [20, 30], [16, 26]], beard);
    rect(ctx, 24, 23, 4, 1, light);
    rect(ctx, 13, 15, 4, 6, shade);
  } else {
    poly(ctx, [[10, 3], [15, 1], [21, 2], [26, 6], [28, 13], [27, 22], [23, 28], [17, 30], [10, 27], [6, 21], [5, 12], [7, 6]], skin);
    poly(ctx, [[11, 4], [17, 2], [22, 4], [25, 9], [23, 12], [10, 11], [8, 8]], light);
    rect(ctx, 5, 15, 3, 7, shade);
    rect(ctx, 26, 15, 3, 7, shade);
    if (facing === 'back') {
      rect(ctx, 10, 23, 14, 3, shade);
      rect(ctx, 12, 27, 10, 2, '#98745e');
    } else {
      eyes(ctx, { brow: '#715341', iris: '#697d92' });
      rect(ctx, 16, 14, 1, 5, light);
      rect(ctx, 16, 19, 4, 2, shade);
      poly(ctx, [[8, 20], [11, 23], [22, 22], [26, 20], [25, 26], [21, 29], [16, 31], [11, 28], [8, 24]], beard);
      smile(ctx, 12, 23, 12, '#8e6257');
      for (const [x, y] of [[10, 25], [13, 28], [17, 29], [21, 27], [24, 24]]) rect(ctx, x, y, 1, 1, shade);
    }
  }
  rect(ctx, 1, 28, 10, 10, '#d9dfea');
  rect(ctx, 2, 28, 8, 1, '#8f98a8');
  rect(ctx, 10, 30, 3, 1, '#d9dfea');
  rect(ctx, 12, 30, 1, 5, '#d9dfea');
  rect(ctx, 10, 35, 3, 1, '#d9dfea');
  rect(ctx, 3, 30, 1, 6, '#739b52');
  rect(ctx, 7, 30, 1, 6, '#739b52');
  poly(ctx, [[4, 30], [7, 34], [7, 36], [4, 32]], '#9ece6a');
}

function drawTobi(ctx, facing) {
  const skin = '#d7b18d';
  const light = '#efd0ac';
  const shade = '#ad8266';
  torso(ctx, '#202c3b', skin, '#394957');
  poly(ctx, [[21, 27], [24, 28], [26, 38], [23, 38]], '#9ece6a');
  rect(ctx, 7, 30, 5, 3, '#e0e5ef');
  rect(ctx, 8, 31, 2, 3, '#6889ba');
  rect(ctx, 10, 32, 3, 2, '#d96b7f');
  rect(ctx, 14, 26, 8, 5, shade);
  if (facing === 'profile') {
    poly(ctx, [[14, 2], [21, 2], [26, 7], [26, 16], [30, 20], [27, 22], [25, 28], [21, 30], [16, 26], [11, 18], [11, 8]], skin);
    rect(ctx, 17, 4, 7, 7, light);
    rect(ctx, 22, 13, 4, 1, '#705a49');
    rect(ctx, 23, 15, 3, 2, '#728795');
    rect(ctx, 14, 15, 4, 7, shade);
    smile(ctx, 23, 23, 5, '#895e54');
    rect(ctx, 20, 28, 4, 1, light);
  } else {
    poly(ctx, [[12, 2], [20, 2], [24, 5], [26, 11], [25, 21], [22, 28], [17, 31], [12, 28], [8, 22], [7, 12], [9, 6]], skin);
    poly(ctx, [[12, 4], [19, 3], [23, 6], [23, 11], [11, 12], [9, 8]], light);
    rect(ctx, 6, 15, 3, 7, shade);
    rect(ctx, 25, 14, 4, 8, shade);
    rect(ctx, 26, 15, 2, 4, '#d89677');
    if (facing === 'back') {
      rect(ctx, 11, 23, 12, 3, shade);
      rect(ctx, 14, 27, 6, 2, light);
    } else {
      eyes(ctx, { left: 10, right: 19, brow: '#84654f', iris: '#738b94' });
      rect(ctx, 16, 16, 2, 5, shade);
      rect(ctx, 15, 20, 4, 1, light);
      smile(ctx, 11, 23, 13, '#986952');
      rect(ctx, 15, 28, 6, 1, shade);
      rect(ctx, 9, 20, 2, 2, '#c79072');
    }
  }
}

function drawSpencer(ctx, facing) {
  const skin = '#e6b196';
  const light = '#f5c7ad';
  const shade = '#c18e79';
  const hair = '#3c2e2b';
  torso(ctx, '#7aa2f7', skin, '#526eb2');
  poly(ctx, [[11, 27], [16, 30], [13, 34], [8, 28]], '#b3caff');
  poly(ctx, [[22, 27], [18, 31], [22, 34], [26, 29]], '#b3caff');
  rect(ctx, 15, 31, 4, 7, '#24283b');
  poly(ctx, [[6, 10], [6, 6], [11, 2], [19, 1], [25, 4], [28, 10], [28, 21], [6, 21]], hair);
  if (facing === 'profile') {
    poly(ctx, [[15, 7], [23, 7], [26, 12], [26, 17], [30, 20], [28, 24], [25, 29], [19, 30], [14, 26], [12, 17]], skin);
    rect(ctx, 18, 9, 6, 4, light);
    rect(ctx, 22, 14, 5, 1, '#6a4d3f');
    rect(ctx, 24, 16, 3, 2, '#687a87');
    rect(ctx, 13, 15, 4, 7, shade);
    smile(ctx, 23, 23, 5, '#9d6c60');
    rect(ctx, 21, 28, 4, 1, shade);
    poly(ctx, [[13, 7], [18, 4], [24, 5], [25, 9], [20, 8], [15, 10], [14, 14]], hair);
  } else if (facing === 'back') {
    rect(ctx, 11, 24, 13, 6, shade);
    rect(ctx, 8, 6, 14, 1, '#725347');
    rect(ctx, 8, 9, 16, 1, '#543f35');
    poly(ctx, [[7, 18], [27, 18], [26, 24], [22, 26], [11, 25], [7, 22]], '#543f35');
  } else {
    poly(ctx, [[10, 7], [22, 7], [26, 11], [27, 19], [26, 25], [23, 29], [17, 31], [11, 29], [7, 25], [5, 18], [7, 11]], skin);
    rect(ctx, 11, 9, 11, 4, light);
    rect(ctx, 5, 16, 3, 6, shade);
    rect(ctx, 26, 16, 3, 6, shade);
    eyes(ctx, { left: 9, right: 20, brow: '#6a4d3f', iris: '#687a87' });
    rect(ctx, 16, 17, 2, 4, shade);
    rect(ctx, 15, 20, 5, 1, light);
    smile(ctx, 10, 23, 15, '#a97569');
    for (const [x, y] of [[10, 25], [12, 28], [16, 29], [21, 28], [24, 25]]) rect(ctx, x, y, 1, 1, shade);
    poly(ctx, [[7, 9], [10, 4], [18, 2], [24, 5], [25, 9], [17, 7], [11, 8], [8, 13]], hair);
    rect(ctx, 10, 5, 8, 1, '#86614a');
    rect(ctx, 13, 4, 8, 1, '#5c4437');
    rect(ctx, 9, 7, 4, 1, '#725347');
  }
}

function drawKrzysztof(ctx, facing) {
  const skin = '#e2c5a1';
  const light = '#f2d9b5';
  const shade = '#b99a7f';
  const hair = '#56463f';
  const beard = '#8b715e';
  torso(ctx, '#b8baa9', skin, '#91968f');
  rect(ctx, 14, 29, 8, 9, '#262935');
  poly(ctx, [[10, 27], [15, 30], [12, 34], [8, 30]], '#dfddc8');
  poly(ctx, [[23, 27], [19, 30], [23, 34], [27, 30]], '#dfddc8');
  poly(ctx, [[8, 5], [13, 2], [22, 2], [27, 7], [28, 18], [5, 19], [5, 10]], hair);
  if (facing === 'profile') {
    poly(ctx, [[17, 5], [23, 7], [25, 13], [26, 18], [30, 20], [27, 22], [26, 27], [21, 30], [16, 26], [13, 17]], skin);
    rect(ctx, 18, 7, 5, 6, light);
    rect(ctx, 21, 13, 7, 7, '#555152');
    rect(ctx, 22, 14, 5, 5, skin);
    rect(ctx, 24, 16, 2, 2, '#696056');
    rect(ctx, 15, 13, 7, 1, '#555152');
    rect(ctx, 14, 15, 3, 6, shade);
    poly(ctx, [[18, 22], [21, 25], [27, 22], [26, 27], [22, 30], [18, 27]], beard);
    rect(ctx, 23, 24, 3, 1, light);
  } else if (facing === 'back') {
    rect(ctx, 11, 22, 13, 8, shade);
    poly(ctx, [[6, 15], [27, 15], [26, 23], [22, 26], [12, 25], [7, 21]], hair);
    rect(ctx, 9, 5, 5, 1, '#827064');
    rect(ctx, 7, 9, 2, 10, '#705c4f');
  } else {
    poly(ctx, [[11, 5], [21, 5], [25, 9], [26, 20], [24, 26], [18, 30], [12, 29], [8, 25], [6, 17], [7, 10]], skin);
    rect(ctx, 11, 7, 10, 6, light);
    rect(ctx, 5, 15, 3, 6, shade);
    rect(ctx, 25, 15, 3, 6, shade);
    rect(ctx, 6, 13, 10, 7, '#555152');
    rect(ctx, 18, 13, 10, 7, '#555152');
    rect(ctx, 7, 14, 8, 5, light);
    rect(ctx, 19, 14, 8, 5, light);
    rect(ctx, 15, 14, 4, 1, '#555152');
    rect(ctx, 10, 16, 3, 2, '#776451');
    rect(ctx, 21, 16, 3, 2, '#776451');
    rect(ctx, 16, 17, 2, 5, shade);
    poly(ctx, [[8, 22], [10, 25], [15, 28], [20, 28], [24, 24], [25, 21], [25, 26], [21, 30], [14, 31], [9, 27]], beard);
    rect(ctx, 12, 22, 11, 1, '#9a7b66');
    smile(ctx, 12, 24, 11, '#aa8775');
    rect(ctx, 17, 28, 1, 2, '#6d5a50');
    rect(ctx, 9, 4, 5, 2, hair);
    rect(ctx, 22, 5, 3, 4, hair);
  }
}

function drawEmir(ctx, facing) {
  const skin = '#dfa98b';
  const light = '#f2c1a0';
  const shade = '#bd856e';
  const hair = '#292a30';
  torso(ctx, '#202735', skin, '#414654');
  poly(ctx, [[8, 25], [13, 28], [12, 33], [5, 32], [4, 29]], '#353e4e');
  poly(ctx, [[24, 25], [20, 29], [22, 34], [29, 32], [29, 28]], '#353e4e');
  rect(ctx, 9, 31, 1, 6, '#c0caf5');
  rect(ctx, 24, 31, 1, 6, '#c0caf5');
  rect(ctx, 14, 31, 6, 7, '#41444e');
  poly(ctx, [[7, 7], [10, 3], [14, 1], [23, 3], [26, 7], [28, 14], [26, 21], [6, 20]], hair);
  if (facing === 'profile') {
    poly(ctx, [[15, 7], [23, 7], [26, 12], [26, 17], [30, 20], [27, 22], [26, 27], [22, 30], [16, 27], [12, 19]], skin);
    rect(ctx, 18, 9, 6, 4, light);
    rect(ctx, 23, 14, 4, 1, '#544037');
    rect(ctx, 24, 16, 3, 2, '#403735');
    rect(ctx, 13, 14, 4, 8, shade);
    smile(ctx, 22, 23, 6, '#9b6557');
    rect(ctx, 21, 28, 3, 1, shade);
    rect(ctx, 13, 5, 9, 2, hair);
  } else if (facing === 'back') {
    rect(ctx, 11, 23, 12, 7, shade);
    poly(ctx, [[6, 16], [27, 16], [25, 24], [21, 27], [11, 25], [7, 22]], hair);
  } else {
    poly(ctx, [[10, 7], [22, 7], [26, 12], [26, 22], [23, 28], [18, 31], [12, 29], [8, 25], [6, 17]], skin);
    rect(ctx, 11, 9, 11, 4, light);
    rect(ctx, 5, 15, 3, 7, shade);
    rect(ctx, 26, 15, 3, 7, shade);
    eyes(ctx, { left: 9, right: 19, brow: '#513e38', iris: '#4e413b' });
    rect(ctx, 16, 17, 2, 4, shade);
    rect(ctx, 10, 20, 3, 2, '#df9e87');
    rect(ctx, 22, 20, 2, 2, '#df9e87');
    rect(ctx, 13, 22, 9, 1, '#9b7765');
    smile(ctx, 11, 23, 13, '#996357');
    rect(ctx, 15, 28, 6, 1, '#b58a78');
    poly(ctx, [[7, 11], [9, 5], [15, 3], [23, 5], [25, 9], [21, 8], [18, 10], [14, 8], [10, 10]], hair);
  }
  for (const [x, y, width] of [[10, 5, 3], [15, 3, 2], [20, 5, 3], [12, 7, 3], [18, 7, 2]]) rect(ctx, x, y, width, 1, '#48494b');
}

function drawHancore(ctx, facing) {
  const bone = '#d4c29c';
  const light = '#e5d6b4';
  const shade = '#a79779';
  const dark = '#202529';
  if (facing === 'back') {
    poly(ctx, [[9, 3], [15, 1], [23, 3], [27, 8], [28, 17], [25, 24], [20, 28], [11, 27], [6, 22], [4, 14], [5, 8]], bone);
    rect(ctx, 9, 5, 13, 3, light);
    poly(ctx, [[6, 17], [10, 23], [22, 24], [27, 18], [24, 26], [19, 29], [11, 27]], shade);
    rect(ctx, 14, 28, 6, 9, bone);
    for (let y = 6; y < 23; y += 4) rect(ctx, 15 + y % 3, y, 1, 3, shade);
  } else if (facing === 'profile') {
    poly(ctx, [[11, 3], [20, 2], [26, 6], [28, 11], [27, 17], [31, 19], [28, 23], [23, 25], [20, 31], [13, 27], [7, 20], [5, 11]], bone);
    rect(ctx, 12, 4, 10, 3, light);
    poly(ctx, [[20, 12], [28, 11], [26, 18], [21, 18], [18, 15]], dark);
    poly(ctx, [[26, 19], [29, 20], [26, 23], [24, 22]], dark);
    rect(ctx, 21, 24, 3, 13, bone);
    rect(ctx, 25, 24, 2, 10, bone);
    rect(ctx, 18, 26, 2, 9, shade);
    poly(ctx, [[13, 20], [19, 19], [21, 23], [16, 24]], dark);
  } else {
    poly(ctx, [[9, 3], [14, 1], [23, 3], [28, 8], [29, 15], [27, 21], [29, 25], [24, 27], [20, 25], [12, 26], [7, 28], [3, 25], [5, 21], [3, 14], [5, 7]], bone);
    rect(ctx, 10, 4, 13, 3, light);
    poly(ctx, [[5, 12], [11, 15], [15, 15], [13, 20], [8, 19], [5, 16]], dark);
    poly(ctx, [[18, 15], [23, 14], [28, 11], [27, 17], [23, 20], [19, 19]], dark);
    poly(ctx, [[16, 18], [13, 24], [16, 22], [19, 25], [19, 21]], dark);
    poly(ctx, [[6, 23], [11, 21], [12, 23], [9, 25]], dark);
    poly(ctx, [[22, 22], [26, 22], [27, 25], [22, 24]], dark);
    rect(ctx, 11, 26, 3, 9, bone);
    rect(ctx, 15, 24, 3, 14, light);
    rect(ctx, 19, 26, 2, 11, bone);
    rect(ctx, 22, 26, 2, 7, bone);
    rect(ctx, 15, 11, 1, 4, dark);
    rect(ctx, 18, 12, 1, 3, dark);
    rect(ctx, 5, 8, 1, 2, shade);
    rect(ctx, 26, 5, 1, 2, shade);
  }
}

function drawOutfoxxed(ctx, facing) {
  const fur = '#c77743';
  const light = '#e6a160';
  const dark = '#713c2c';
  const cream = '#efe4ce';
  poly(ctx, [[8, 26], [23, 26], [28, 33], [26, 38], [6, 38], [4, 32]], fur);
  rect(ctx, 12, 28, 10, 10, cream);
  rect(ctx, 1, 32, 12, 5, dark);
  rect(ctx, 2, 32, 10, 3, fur);
  poly(ctx, [[4, 14], [3, 2], [7, 0], [13, 11]], dark);
  poly(ctx, [[20, 11], [25, 0], [28, 2], [29, 15]], dark);
  poly(ctx, [[5, 12], [5, 3], [10, 10]], light);
  poly(ctx, [[22, 11], [26, 3], [27, 13]], light);
  poly(ctx, [[6, 10], [16, 7], [26, 11], [29, 16], [27, 19], [31, 20], [28, 24], [30, 25], [24, 29], [17, 31], [9, 28], [3, 25], [4, 22], [1, 20], [4, 17]], fur);
  if (facing === 'back') {
    poly(ctx, [[10, 12], [17, 9], [25, 13], [26, 20], [22, 26], [16, 28], [10, 24], [7, 19]], light);
    rect(ctx, 15, 14, 2, 8, '#d58c4e');
  } else if (facing === 'profile') {
    poly(ctx, [[18, 17], [25, 17], [31, 21], [29, 25], [23, 29], [15, 28], [13, 22]], cream);
    poly(ctx, [[26, 19], [31, 20], [29, 23], [26, 22]], C.ink);
    rect(ctx, 22, 14, 4, 1, dark);
    rect(ctx, 24, 16, 2, 2, C.ink);
    rect(ctx, 23, 25, 5, 1, dark);
    rect(ctx, 28, 23, 1, 2, dark);
    poly(ctx, [[7, 4], [12, 12], [8, 15]], fur);
  } else {
    poly(ctx, [[3, 20], [9, 21], [16, 17], [23, 21], [30, 19], [28, 25], [23, 29], [16, 31], [8, 28], [4, 24]], cream);
    rect(ctx, 7, 14, 5, 1, dark);
    rect(ctx, 21, 14, 5, 1, dark);
    rect(ctx, 9, 16, 2, 3, C.ink);
    rect(ctx, 22, 16, 2, 3, C.ink);
    poly(ctx, [[13, 19], [16, 18], [20, 19], [17, 23]], C.ink);
    rect(ctx, 16, 23, 1, 2, dark);
    rect(ctx, 13, 25, 3, 1, dark);
    rect(ctx, 17, 25, 3, 1, dark);
    rect(ctx, 12, 23, 1, 2, dark);
    rect(ctx, 20, 23, 1, 2, dark);
    rect(ctx, 5, 23, 4, 1, '#d1bca0');
    rect(ctx, 24, 23, 4, 1, '#d1bca0');
  }
}

const DRAWERS = new Map([
  ['bjarne', drawBjarne], ['tobi', drawTobi], ['hancore', drawHancore],
  ['spencer', drawSpencer], ['krzysztof', drawKrzysztof],
  ['outfoxxed', drawOutfoxxed], ['emir', drawEmir],
]);

export function makeGuestDriver(facing, characterId) {
  const draw = DRAWERS.get(characterId);
  if (!draw) return null;
  const sprite = document.createElement('canvas');
  sprite.width = 32;
  sprite.height = 38;
  const ctx = sprite.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  draw(ctx, facing);
  return sprite;
}
