import { SECURITY_LABS } from './club-security.mjs';

export function drawSecurityDisplay(ctx, station, device) {
  const lab = SECURITY_LABS[station.lab]; const state = device.lab;
  const text = (value, x, y, size = 10, color = '#c0caf5') => {
    ctx.fillStyle = color; ctx.font = `${size}px "Courier New", monospace`; ctx.fillText(value, x, y);
  };
  ctx.textAlign = 'left'; ctx.fillStyle = '#101724'; ctx.fillRect(0, 0, 256, 192);
  ctx.fillStyle = lab.accent; ctx.fillRect(0, 0, 256, 24);
  text(lab.title.toUpperCase(), 9, 16, 12, '#16161e');
  text('LOCAL SECURITY SIMULATION', 10, 40, 9, lab.accent);
  const labels = station.lab === 'blue-team' ? ['DETECT', 'CONTAIN', 'RESTORE'] : station.lab === 'pentest' ? ['SCOPE', 'TEST', 'RETEST'] : station.lab === 'zero-day' ? ['REPRO', 'REPAIR', 'REPORT'] : station.lab === 'forensics' ? ['IMAGE', 'TRACE', 'REPORT'] : ['TRACE', 'COMPARE', 'VERIFY'];
  labels.forEach((label, i) => {
    const x = 10 + i * 81;
    ctx.fillStyle = state.step > i ? '#9ece6a' : i === state.step ? lab.accent : '#414868';
    ctx.fillRect(x, 52, 73, 24); text(label, x + 5, 68, 10, state.step >= i ? '#16161e' : '#c0caf5');
    if (i < 2) { ctx.fillStyle = lab.accent; ctx.fillRect(x + 73, 63, 8, 2); }
  });
  const lines = state.evidence.length ? state.evidence : ['CASE: ready', 'Select this computer.', 'Choose the next action.'];
  lines.forEach((line, i) => text(line, 12, 102 + i * 18, 11));
  text(state.complete ? 'EXERCISE COMPLETE' : `STEP ${state.step + 1} / 3`, 12, 162, 12, state.complete ? '#9ece6a' : lab.accent);
  text('SELECT SCREEN TO CONTINUE', 12, 182, 9, '#9aa5ce');
}
