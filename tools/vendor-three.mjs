import { copyFile } from 'node:fs/promises';

for (const [source, target] of [
  ['build/three.module.js', 'three.module.js'],
  ['build/three.core.js', 'three.core.js'],
  ['LICENSE', 'THREE-LICENSE.txt'],
]) {
  await copyFile(new URL(`../node_modules/three/${source}`, import.meta.url), new URL(`../assets/${target}`, import.meta.url));
}
console.log('The local Three.js modules are ready.');
