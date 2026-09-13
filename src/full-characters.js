const outfits = {
  dhh: { top: '#20232f', trim: '#343b58', trousers: '#343c56', skin: '#e6ab93' },
  ryan: { top: '#171a25', trim: '#343647', trousers: '#343e5a', skin: '#dbab91' },
  bjarne: { top: '#242b40', trim: '#465273', trousers: '#293248', skin: '#dfb08f' },
  tobi: { top: '#202c3b', trim: '#9ece6a', trousers: '#202c3b', skin: '#d7b18d' },
  hancore: { top: '#20232c', trim: '#55525a', trousers: '#292a35', skin: '#d4c29c' },
  spencer: { top: '#7aa2f7', trim: '#b3caff', trousers: '#333d53', skin: '#e6b196' },
  krzysztof: { top: '#b8baa9', trim: '#dfddc8', trousers: '#343b50', skin: '#e2c5a1' },
  outfoxxed: { top: '#454a40', trim: '#666b5b', trousers: '#303b50', skin: '#e4b095' },
  emir: { top: '#202735', trim: '#515d76', trousers: '#303c57', skin: '#dfa98b' },
};

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fill();
}

export function makeFullCharacter(head, characterId) {
  const image = document.createElement('canvas');
  image.width = 48;
  image.height = 104;
  const ctx = image.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const p = outfits[characterId] || outfits.dhh;
  rect(ctx, 13, 65, 10, 30, p.trousers);
  rect(ctx, 26, 65, 10, 30, p.trousers);
  rect(ctx, 14, 69, 2, 23, '#485574');
  rect(ctx, 33, 69, 2, 23, '#222a3c');
  rect(ctx, 10, 95, 14, 7, '#131721');
  rect(ctx, 26, 95, 15, 7, '#131721');
  rect(ctx, 10, 101, 14, 2, '#565f89');
  rect(ctx, 26, 101, 15, 2, '#565f89');
  poly(ctx, [[13, 31], [34, 31], [39, 38], [37, 64], [33, 70], [15, 70], [10, 64], [9, 39]], p.top);
  poly(ctx, [[10, 36], [15, 38], [12, 58], [7, 61], [5, 57], [6, 43]], p.top);
  poly(ctx, [[34, 37], [40, 38], [43, 56], [39, 63], [35, 59]], p.top);
  rect(ctx, 7, 54, 5, 9, p.skin);
  rect(ctx, 38, 55, 5, 8, p.skin);
  rect(ctx, 14, 40, 2, 24, p.trim);
  rect(ctx, 16, 68, 17, 2, '#202331');
  rect(ctx, 22, 68, 5, 2, '#8c95ae');

  if (characterId === 'tobi') {
    rect(ctx, 32, 36, 3, 56, '#9ece6a');
    rect(ctx, 10, 38, 3, 16, '#9ece6a');
    rect(ctx, 18, 43, 6, 3, '#c0caf5');
    rect(ctx, 18, 45, 3, 4, '#7aa2f7');
    rect(ctx, 21, 46, 5, 3, '#f7768e');
  }
  if (characterId === 'spencer' || characterId === 'krzysztof') {
    poly(ctx, [[15, 32], [23, 38], [19, 44], [13, 36]], p.trim);
    poly(ctx, [[32, 32], [25, 38], [29, 44], [36, 36]], p.trim);
    rect(ctx, 23, 39, 3, 27, characterId === 'krzysztof' ? '#202331' : '#a2bbf7');
    if (characterId === 'spencer') for (let y = 46; y < 65; y += 7) rect(ctx, 24, y, 1, 1, '#414868');
  }
  if (characterId === 'emir') {
    poly(ctx, [[12, 32], [18, 36], [15, 43], [9, 40]], p.trim);
    poly(ctx, [[33, 32], [28, 36], [33, 44], [40, 40]], p.trim);
    rect(ctx, 18, 40, 1, 14, '#c0caf5');
    rect(ctx, 30, 40, 1, 14, '#c0caf5');
    rect(ctx, 22, 39, 5, 28, '#3e4452');
  }
  if (characterId === 'ryan') {
    rect(ctx, 29, 45, 4, 4, '#f7768e');
    rect(ctx, 33, 49, 3, 3, '#9ece6a');
    rect(ctx, 29, 53, 3, 3, '#7dcfff');
  }
  if (characterId === 'hancore') {
    rect(ctx, 21, 42, 7, 17, '#d4c29c');
    for (let y = 43; y < 58; y += 5) {
      rect(ctx, 16, y, 6, 2, '#a79779');
      rect(ctx, 27, y, 6, 2, '#a79779');
    }
  }
  if (characterId === 'outfoxxed') {
    rect(ctx, 18, 34, 13, 33, '#218895');
    poly(ctx, [[13, 31], [20, 35], [17, 48], [14, 42]], '#292f2d');
    poly(ctx, [[33, 31], [28, 36], [32, 49], [37, 40]], '#666b5b');
    for (let y = 38; y < 63; y += 4) rect(ctx, 14, y, 2, 2, '#343a32');
  }

  if (characterId === 'bjarne') rect(ctx, 20, 27, 10, 10, p.skin);
  const headHeight = characterId === 'hancore' ? 38 : characterId === 'bjarne' ? 28 : 32;
  ctx.drawImage(head, 0, 0, 32, headHeight, 8, 2, 32, headHeight);
  if (characterId === 'bjarne') ctx.drawImage(head, 12, 28, 20, 4, 20, 30, 20, 4);
  if (characterId === 'dhh') {
    poly(ctx, [[11, 27], [14, 30], [13, 38], [17, 42], [12, 41], [9, 36]], '#584033');
    poly(ctx, [[34, 25], [38, 27], [37, 36], [40, 40], [35, 43], [33, 38]], '#785744');
  }
  if (characterId === 'bjarne') {
    poly(ctx, [[7, 51], [14, 45], [19, 49], [11, 58], [7, 58]], p.top);
    rect(ctx, 11, 47, 13, 18, '#e5e9ff');
    rect(ctx, 12, 47, 11, 2, '#9aa5ce');
    rect(ctx, 23, 50, 4, 2, '#e5e9ff');
    rect(ctx, 26, 51, 2, 9, '#e5e9ff');
    rect(ctx, 23, 60, 4, 2, '#e5e9ff');
    rect(ctx, 14, 52, 2, 9, '#739b52');
    rect(ctx, 20, 52, 2, 9, '#739b52');
    poly(ctx, [[16, 52], [20, 58], [20, 61], [16, 55]], '#9ece6a');
    rect(ctx, 8, 57, 4, 6, p.skin);
  }
  return image;
}
