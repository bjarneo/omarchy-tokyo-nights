import { copyFile, mkdir } from 'node:fs/promises';

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
const source = new URL('../node_modules/@fontsource/press-start-2p/', import.meta.url);
const target = new URL('../assets/', import.meta.url);
await copyFile(new URL('files/press-start-2p-latin-400-normal.woff2', source), new URL('arcade.woff2', target));
await copyFile(new URL('LICENSE', source), new URL('FONT-LICENSE.txt', target));
console.log('The local arcade font is ready.');
