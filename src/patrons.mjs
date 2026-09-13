export const PATRONS_SOURCE = 'https://omarchy.org/patrons/';

export const FOUNDING_PATRONS = Object.freeze([
  ['tobi-lutke', 'Tobi Lütke', 'Shopify'],
  ['patrick-collison', 'Patrick Collison', 'Stripe'],
  ['michael-dell', 'Michael Dell', 'Dell Technologies'],
  ['jack-dorsey', 'Jack Dorsey', 'Block'],
  ['matthew-prince', 'Matthew Prince', 'Cloudflare'],
  ['brendan-iribe', 'Brendan Iribe', 'Sesame'],
  ['jason-fried', 'Jason Fried', '37signals'],
  ['drew-houston', 'Drew Houston', 'Dropbox'],
  ['peter-steinberger', 'Peter Steinberger', 'OpenClaw'],
  ['brian-armstrong', 'Brian Armstrong', 'Coinbase'],
  ['yunjie-dai', 'Yunjie Dai', 'TapTap'],
  ['dhh', 'DHH', '37signals'],
].map(([id, name, company]) => Object.freeze({
  id, name, company,
  portrait: `assets/patrons/${id}.png`,
  source: `https://omarchy.org/assets/images/patrons/${id}.webp`,
})));

export function getPatron(id) {
  return FOUNDING_PATRONS.find((patron) => patron.id === id) || FOUNDING_PATRONS[0];
}

export function createPatronTour(random = Math.random) {
  const order = FOUNDING_PATRONS.map(({ id }) => id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    roadside: order.map((id, index) => ({ id, at: 300 + index * 950 + Math.floor(random() * 250), side: random() < .5 ? -1 : 1 })),
    garage: order.slice(0, 3),
    mars: order.slice(3, 5),
  };
}
