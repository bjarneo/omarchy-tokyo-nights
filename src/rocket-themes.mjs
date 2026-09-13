import { OMARCHY_THEMES } from '../assets/omarchy-themes.js';
import { ROCKET_FLIGHT_SECONDS } from './rocket.mjs';

export const ROCKET_THEME_SECONDS = ROCKET_FLIGHT_SECONDS / OMARCHY_THEMES.length;
export const ROCKET_COLOR_ROLES = Object.freeze([...new Set(OMARCHY_THEMES.flatMap(({ palette }) => Object.keys(palette)))]);
export const MAX_ROCKET_COLORS = ROCKET_COLOR_ROLES.length;

export function blendColor(from, to, amount) {
  const a = parseInt(from.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const mix = Math.max(0, Math.min(1, amount));
  let result = 0;
  for (const shift of [16, 8, 0]) result |= Math.round((a >> shift & 255) + ((b >> shift & 255) - (a >> shift & 255)) * mix) << shift;
  return `#${result.toString(16).padStart(6, '0')}`;
}

export function rocketThemeAt(elapsed) {
  const time = Math.max(0, Math.min(ROCKET_FLIGHT_SECONDS, Number.isFinite(elapsed) ? elapsed : 0));
  const index = Math.min(OMARCHY_THEMES.length - 1, Math.floor(time / ROCKET_THEME_SECONDS));
  const theme = OMARCHY_THEMES[index];
  const previous = OMARCHY_THEMES[Math.max(0, index - 1)];
  const progress = Math.min(1, (time - index * ROCKET_THEME_SECONDS) / (ROCKET_THEME_SECONDS * .4));
  const mix = 1 - (1 - progress) ** 3;
  const palette = Object.fromEntries(Object.entries(theme.palette).map(([role, color]) => [role, blendColor(previous.palette[role] || previous.palette.foreground, color, mix)]));
  const previousHull = rocketHullPalette(previous.palette, previous.mode);
  const hull = Object.fromEntries(Object.entries(rocketHullPalette(theme.palette, theme.mode)).map(([role, color]) => [role, blendColor(previousHull[role], color, mix)]));
  const colors = ROCKET_COLOR_ROLES.map((role) => blendColor(previous.palette[role] || previous.palette.foreground, theme.palette[role] || theme.palette.foreground, mix));
  return { ...theme, index, count: OMARCHY_THEMES.length, palette, hull, colors, swatches: Object.entries(theme.palette) };
}

export function rocketHullPalette(palette, mode = 'dark') {
  return {
    night: palette.darker_background, panel: palette.lighter_background,
    line: palette.dark_foreground, metal: mode === 'light' ? palette.background : palette.foreground, shadow: palette.muted,
    white: palette.bright_foreground, blue: palette.blue, cyan: palette.cyan,
    pink: palette.red, purple: palette.magenta, gold: palette.yellow,
  };
}
