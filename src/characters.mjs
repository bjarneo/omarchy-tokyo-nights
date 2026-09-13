export const CHARACTERS = Object.freeze([
  Object.freeze({ id: 'dhh', name: 'DHH', longHair: true, detail: 'Wavy hair and beard.' }),
  Object.freeze({ id: 'ryan', name: 'Ryan', longHair: false, detail: 'Glasses and goatee.' }),
  Object.freeze({ id: 'bjarne', name: 'Bjarne', longHair: false, detail: 'Coffee mug and beard.' }),
  Object.freeze({ id: 'tobi', name: 'Tobi', longHair: false, detail: 'Racing suit with green trim.' }),
  Object.freeze({ id: 'hancore', name: 'Hancore', longHair: false, detail: 'Bone skull emblem.' }),
  Object.freeze({ id: 'spencer', name: 'Spencer', longHair: false, detail: 'Side-parted hair and blue shirt.' }),
  Object.freeze({ id: 'krzysztof', name: 'Krzysztof', longHair: false, detail: 'Glasses and a light overshirt.' }),
  Object.freeze({ id: 'outfoxxed', name: 'Outfoxxed', longHair: false, detail: 'Orange fox with a white muzzle.' }),
  Object.freeze({ id: 'emir', name: 'Emir', longHair: false, detail: 'Short dark hair and hooded jacket.' }),
]);

export function getCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) || CHARACTERS[0];
}
