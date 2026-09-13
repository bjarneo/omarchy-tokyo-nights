export function drawMalibuDisplay(ctx, state) {
  ctx.fillStyle = '#10191e'; ctx.fillRect(0, 0, 256, 192);
  if (!state.power) {
    ctx.fillStyle = '#1b2428'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(90, 0); ctx.lineTo(26, 192); ctx.lineTo(0, 192); ctx.fill();
    ctx.fillStyle = '#222d31'; ctx.fillRect(195, 0, 2, 192);
    return;
  }
  const sky = ctx.createLinearGradient(0, 0, 180, 155);
  sky.addColorStop(0, '#e7ac89'); sky.addColorStop(.6, '#e4cbb4'); sky.addColorStop(1, '#b7c9ce');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 256, 192);
  ctx.fillStyle = '#abbfc0'; ctx.fillRect(0, 126, 256, 66);
  for (const [color, y, height, offset] of [['#a7aaa0', 125, 13, 0], ['#778477', 145, 22, 3], ['#526b5f', 179, 36, 6]]) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 192);
    for (let x = 0; x <= 256; x += 12) ctx.lineTo(x, y - Math.sin(x / 78 + offset) * height - Math.sin(x / 26 + offset) * 4);
    ctx.lineTo(256, 192); ctx.closePath(); ctx.fill();
  }
  if (state.mode !== 'coastal-desktop') return;
  ctx.fillStyle = '#16161eea'; ctx.fillRect(0, 0, 256, 15);
  ctx.font = '9px "Courier New", monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#c0caf5'; ctx.fillText('OMARCHY   WORKSPACE 1', 8, 11);
  ctx.fillStyle = '#16161e'; ctx.fillRect(26, 37, 204, 118);
  ctx.strokeStyle = '#7dcfff'; ctx.strokeRect(26.5, 37.5, 203, 117);
  ctx.fillStyle = '#24283b'; ctx.fillRect(28, 39, 200, 17);
  ctx.fillStyle = '#e0af68'; ctx.fillText('notes.txt', 35, 51);
  ctx.fillStyle = '#c0caf5';
  ['A desk above the coast.', '', 'The club is still open.', 'Take a moment for the view.'].forEach((line, i) => ctx.fillText(line, 36, 77 + i * 16));
}
