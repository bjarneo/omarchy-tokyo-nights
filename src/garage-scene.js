function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
}

export function drawGarageBackdrop(ctx, w, h, { logo } = {}) {
  rect(ctx, 0, 0, w, h, '#1a1b26');
  for (let i = 0; i < 65; i++) rect(ctx, (i * 137 + 47) % w, (i * 71 + 23) % Math.round(h * .32), 2, 2, i % 5 ? '#565f89' : '#c0caf5');
  for (let i = 0; i < 18; i++) {
    const x = i * w / 17;
    const height = h * (.07 + (i * 13 % 11) / 110);
    rect(ctx, x, h * .33 - height, w / 20, height, '#292d46');
  }
  rect(ctx, 0, h * .55, w, h * .45, '#24283b');
  const x = w * .035;
  const y = h * .18;
  const width = w * .93;
  const height = h * .38;
  rect(ctx, x - 5, y - 8, width + 10, height + 8, '#414868');
  rect(ctx, x, y, width, height, '#2d3048');
  for (let row = 15; row < height; row += 20) rect(ctx, x, y + row, width, 1, '#3a3f5c');
  rect(ctx, x - 5, y - 8, width + 10, 3, '#f7768e');
  const header = height * .24;
  if (logo) {
    const logoW = Math.min(width * .27, header * logo.width / logo.height * .72);
    ctx.drawImage(logo, Math.round(w / 2 - logoW / 2), Math.round(y + 7), Math.round(logoW), Math.round(logoW * logo.height / logo.width));
  }
  for (let bay = 0; bay < 3; bay++) {
    const bx = x + width * (.045 + bay * .315);
    const bw = width * .28;
    const by = y + header;
    const bh = height - header;
    rect(ctx, bx - 3, by - 3, bw + 6, bh + 3, '#16161e');
    rect(ctx, bx, by, bw, bh, bay === 1 ? '#252d43' : '#343b58');
    for (let row = 6; row < bh; row += 10) rect(ctx, bx, by + row, bw, 2, '#414868');
    rect(ctx, bx, by - 3, bw, 2, bay === 1 ? '#e0af68' : '#7dcfff');
    rect(ctx, bx + bw * .48, by + bh * .73, bw * .06, 3, '#9aa5ce');
  }
  rect(ctx, x - 8, y + height, width + 16, 6, '#565f89');
  for (let i = 0; i < 24; i++) rect(ctx, (i * 131 + 12) % w, h * .64 + (i * 31 % Math.round(h * .31)), 10 + i % 4 * 9, 2, i % 2 ? '#7dcfff22' : '#f7768e22');
  for (let i = 1; i < 9; i++) rect(ctx, w * i / 9, h * .68, 2, h * .2, '#414868');
}
