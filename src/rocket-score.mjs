import { OMARCHY_THEMES } from '../assets/omarchy-themes.js';
import { ROCKET_FLIGHT_SECONDS } from './rocket.mjs';

export const STAR_STEP_SECONDS = ROCKET_FLIGHT_SECONDS / OMARCHY_THEMES.length / 4;
export const midiFrequency = (note) => 440 * 2 ** ((note - 69) / 12);

export function createStarScore() {
  const chords = [[48, 52, 55, 59, 62], [45, 48, 52, 55, 59], [41, 45, 48, 52, 55], [43, 47, 50, 52, 57]];
  const score = [];
  for (let theme = 0; theme < OMARCHY_THEMES.length; theme++) {
    const at = theme * STAR_STEP_SECONDS * 4;
    const chord = chords[theme >= OMARCHY_THEMES.length - 2 ? 0 : Math.floor(theme / 2) % chords.length];
    if (theme % 2 === 0) {
      chord.forEach((note, index) => score.push({ at, note, kind: 'pad', duration: STAR_STEP_SECONDS * 9, volume: .036, pan: (index - 2) * .28 }));
      score.push({ at, note: chord[0] - 12, kind: 'bass', duration: STAR_STEP_SECONDS * 7, volume: .12, pan: 0 });
    }
    [0, 2, 4, theme % 2 ? 3 : 1].forEach((tone, beat) => {
      score.push({ at: at + beat * STAR_STEP_SECONDS, note: chord[tone] + 12, kind: 'bell', duration: .8, volume: beat % 2 ? .10 : .15, pan: Math.sin((theme * 4 + beat) * .8) * .7 });
    });
  }
  return score;
}
