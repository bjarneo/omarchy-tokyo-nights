import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const source = process.argv[2];
if (!source) throw new Error('Usage: npm run assets:rocket-themes -- /path/to/omarchy');
const git = (...args) => execFileSync('git', args, { cwd: source, encoding: 'utf8' }).trim();
const revision = git('rev-parse', 'HEAD');
const files = git('ls-tree', '-r', '--name-only', 'HEAD', 'themes/').split('\n').filter((path) => /^themes\/[^/]+\/colors\.toml$/.test(path));
const themes = files.map((path) => {
  const id = path.split('/')[1];
  const entries = [...git('show', `HEAD:${path}`).matchAll(/^\s*(\w+)\s*=\s*"([^"]+)"/gm)].map(([, key, value]) => [key, value]);
  const mode = entries.find(([key]) => key === 'mode')?.[1];
  const palette = {};
  const overrides = {};
  for (const [key, value] of entries) {
    if (key === 'mode') continue;
    if (/^#[0-9a-f]{6}$/i.test(value)) palette[key] = value.toLowerCase();
    else {
      const colors = [...value.matchAll(/rgba?\(([0-9a-f]{6})(?:[0-9a-f]{2})?\)/gi)];
      if (!colors.length) throw new Error(`The theme contains an invalid color: ${id}.${key}`);
      overrides[key] = value;
      colors.forEach(([, hex], index) => { palette[`${key}_${index + 1}`] = `#${hex.toLowerCase()}`; });
    }
  }
  if (!['light', 'dark'].includes(mode) || !['accent', 'background', 'darker_background', 'foreground', 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta'].every((key) => palette[key])) throw new Error(`The theme palette is incomplete: ${id}`);
  if (!Object.values(palette).every((value) => /^#[0-9a-f]{6}$/.test(value))) throw new Error(`The theme contains an invalid color: ${id}`);
  return { id, name: id.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '), mode, palette, overrides };
});
if (!themes.some(({ id }) => id === 'tokyo-night')) throw new Error('The source must include Tokyo Night.');
themes.sort((a, b) => a.id === 'tokyo-night' ? -1 : b.id === 'tokyo-night' ? 1 : a.id.localeCompare(b.id, 'en'));
const url = `https://github.com/omacom/omarchy/tree/${revision}/themes`;
const module = `export const OMARCHY_THEME_SOURCE = ${JSON.stringify(url)};\n\nexport const OMARCHY_THEMES = Object.freeze(${JSON.stringify(themes, null, 2)}.map((theme) => Object.freeze({ ...theme, palette: Object.freeze(theme.palette) })));\n`;
await writeFile(new URL('../assets/omarchy-themes.js', import.meta.url), module);
console.log(`Vendored ${themes.length} native palettes from Omarchy ${revision.slice(0, 7)}.`);
