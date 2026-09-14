export function drawMacDisplay(ctx, station, state, logo) {
  const text = (value, x, y, size = 10, color = '#c0caf5') => { ctx.fillStyle = color; ctx.font = `${size}px "Courier New", monospace`; ctx.fillText(value, x, y); };
  ctx.textAlign = 'left'; ctx.fillStyle = '#16161e'; ctx.fillRect(0, 0, 256, 192);
  if (!state.power) return;
  if (state.mode === 'mac-hardware') {
    text(station.name.toUpperCase(), 12, 24, 15, '#7dcfff');
    text(`YEAR  ${station.year}`, 12, 60, 12); text(station.mac.chip, 12, 84, 13, '#9ece6a');
    text('MAC HARDWARE COLLECTION', 12, 121, 10); text('TEAM M', 12, 148, 15, '#e0af68');
  } else if (state.mode === 'mac-terminal') {
    text('OMARCHY / LOCAL TERMINAL', 10, 20, 12, '#9ece6a');
    ['guest@mac-lab', '$ hardware', station.name, station.mac.chip, '', '$ echo "Hello, Team M"', 'Hello, Team M', '', 'guest@mac-lab >'].forEach((line, i) => text(line, 10, 44 + i * 14, 10));
  } else {
    ctx.fillStyle = '#343b58'; ctx.fillRect(0, 0, 256, 16); text('OMARCHY    MAC LAB', 8, 11, 9, '#c0caf5');
    if (logo) {
      const width = Math.min(218, 63 * logo.width / logo.height); const height = width * logo.height / logo.width;
      ctx.imageSmoothingEnabled = false; ctx.drawImage(logo, (256 - width) / 2, 32, width, height);
    }
    ctx.fillStyle = '#24283b'; ctx.fillRect(15, 115, 226, 45);
    text('Welcome to the Mac room.', 24, 132, 11, '#9ece6a'); text('Meet the M team.', 24, 150, 11);
  }
  text('CLUB DISPLAY DEMO', 12, 183, 9, '#9aa5ce');
}
