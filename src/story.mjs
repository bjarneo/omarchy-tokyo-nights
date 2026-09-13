export const CHAPTERS = Object.freeze([
  {
    id: 'tape', district: 'SHINJUKU', title: 'THE LAST TAPE', time: '23:48',
    text: 'The Omarchy arcade opens for one final night. The crew leaves backup music tapes along the expressway. Collect one and carry it across the city.',
    objective: 'Collect a cassette, then reach the Shibuya exit.',
    failure: 'You miss the music tape. Collect a cassette at a marked drop.',
    drops: [{ at: 650, x: 0 }, { at: 1450, x: -.65 }, { at: 2350, x: .65 }],
  },
  {
    id: 'power', district: 'SHIBUYA', title: 'LIGHTS OUT', time: '00:12',
    text: 'The tape is aboard, but a power cut stops the arcade. The crew marks spare power cells along your route. Bring two cells so they can restart the sound system.',
    objective: 'Collect two power cells, then reach Akihabara.',
    failure: 'The arcade needs two power cells. Collect the green batteries.',
    drops: [{ at: 450, x: -.65 }, { at: 1100, x: .65 }, { at: 1800, x: 0 }, { at: 2500, x: -.65 }],
  },
  {
    id: 'traffic', district: 'AKIHABARA', title: 'THROUGH THE TRAFFIC', time: '03:26',
    text: 'The arcade has power again. Delivery traffic fills the final city route. Pass six cars and reach the bridge before the crew closes the doors.',
    objective: 'Pass six cars, then reach Rainbow Bridge.',
    failure: 'You need to pass six cars before the bridge exit.',
    drops: [],
  },
  {
    id: 'arrival', district: 'RAINBOW BRIDGE', title: 'BEFORE SUNRISE', time: '05:02',
    text: 'The crew waits at the Omarchy arcade on Tokyo Bay. You have the tape and the power cells. Cross the bridge with no more than two collisions and deliver the final track.',
    objective: 'Reach the arcade with no more than two collisions.',
    failure: 'Three collisions stop the final delivery. Keep a clear route across the bridge.',
    drops: [],
  },
].map((chapter) => Object.freeze({ ...chapter, drops: Object.freeze(chapter.drops.map(Object.freeze)) })));

export function getChapter(stage) {
  return CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, stage))];
}
