import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import * as simpleIcons from 'simple-icons';
import { LOGO_GROUPS, TERMINAL_NAMES } from './open-source-catalog.mjs';
import { provenance } from './png-provenance.mjs';

const root = new URL('../', import.meta.url);
const output = new URL('../assets/open-source/', import.meta.url);
const omarchy = resolve(process.env.OMARCHY_SOURCE || new URL('../../omarchy/', import.meta.url).pathname);
const excluded = new Set(['gnome', 'gtk', 'qt']);
const xml = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const referenceFiles = new Map();
await mkdir(output, { recursive: true });

async function verify(evidence) {
  if (!referenceFiles.has(evidence.file)) referenceFiles.set(evidence.file, await readFile(resolve(omarchy, evidence.file), 'utf8'));
  const source = referenceFiles.get(evidence.file);
  const found = evidence.file.endsWith('.packages') ? source.split('\n').some((line) => line.trim() === evidence.term) : source.toLowerCase().includes(evidence.term.toLowerCase());
  if (!found) throw new Error(`Cannot verify ${evidence.term} in ${evidence.file}.`);
}

function blockSvg(source, color) {
  const lines = source.trimEnd().split('\n'); const width = Math.max(...lines.map((line) => line.length)) * 4;
  const rectangles = [];
  lines.forEach((line, row) => [...line].forEach((character, column) => {
    if (character === ' ') return;
    if (!['█', '▀', '▄'].includes(character)) throw new Error('Unsupported logo block.');
    rectangles.push(`<rect x="${column * 4}" y="${row * 8 + (character === '▄' ? 4 : 0)}" width="4" height="${character === '█' ? 8 : 4}"/>`);
  }));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${lines.length * 8}" viewBox="0 0 ${width} ${lines.length * 8}"><g fill="${color}">${rectangles.join('')}</g></svg>`;
}

async function download(entry) {
  if (entry.local) {
    try { return Buffer.from(await readFile(entry.local)); } catch { /* Use the upstream copy when the package icon is absent. */ }
  }
  const response = await fetch(entry.url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${entry.name} logo returns HTTP ${response.status}.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 2_000_000) throw new Error(`${entry.name} logo exceeds the asset limit.`);
  return bytes;
}

const groups = [];
for (const group of LOGO_GROUPS) {
  const entries = [];
  for (const entry of group.entries) {
    if (excluded.has(entry.id) || excluded.has(entry.name.toLowerCase())) throw new Error('An excluded project enters the gallery.');
    await verify(entry.evidence);
    let bytes; let extension = 'svg'; let source; let license;
    if (entry.exportName) {
      const icon = simpleIcons[entry.exportName];
      if (!icon) throw new Error(`The icon ${entry.exportName} is unavailable.`);
      source = icon.source; license = 'CC0-1.0';
      bytes = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><title>${xml(entry.name)}</title><path fill="#${icon.hex}" d="${icon.path}"/></svg>`);
    } else if (entry.block) {
      source = entry.source; license = 'MIT';
      bytes = Buffer.from(blockSvg(await readFile(new URL(`assets/${entry.block}`, root), 'utf8'), entry.id === 'omarchy' ? '#24283b' : '#9b681f'));
    } else {
      bytes = await download(entry); source = entry.url; license = entry.license || 'Upstream project artwork';
      if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = 'png';
    }
    const origin = `Source: ${source}. Project: ${entry.name}. Asset license: ${license}.`;
    if (extension === 'svg') {
      let svg = bytes.toString('utf8');
      if (!/<svg\b/.test(svg) || /<(?:script|foreignObject)\b|\bon\w+\s*=|(?:href|src)=["'](?:https?:|\/\/)/i.test(svg)) throw new Error(`${entry.name} contains unsupported SVG content.`);
      svg = svg.replace(/<svg\b([^>]*)>/, `<svg$1><metadata>${xml(origin)}</metadata>`);
      bytes = Buffer.from(svg);
    } else bytes = provenance(bytes, origin);
    const filename = `${entry.id}.${extension}`;
    await writeFile(new URL(filename, output), bytes);
    entries.push({ id: entry.id, name: entry.name, role: entry.role, scope: entry.scope, file: filename, source, license, ...(entry.creator ? { creator: entry.creator } : {}), sha256: sha256(bytes), evidence: entry.evidence });
  }
  groups.push({ id: group.id, title: group.title, subtitle: group.subtitle, entries });
}
for (const term of TERMINAL_NAMES) await verify({ file: 'install/omarchy-base.packages', term });
let commit = null;
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: omarchy, encoding: 'utf8' }).trim(); } catch { /* A source archive can replace a Git checkout. */ }
const metadata = {
  simpleIconsVersion: '16.31.0', omarchyCommit: commit,
  references: [...referenceFiles].map(([file, content]) => ({ file, sha256: sha256(content), source: `https://github.com/omacom/omarchy/blob/quattro/${file}` })),
  groups, terminalNames: TERMINAL_NAMES,
};
await writeFile(new URL('manifest.json', output), `${JSON.stringify(metadata, null, 2)}\n`);
await copyFile(new URL('../node_modules/simple-icons/LICENSE.md', import.meta.url), new URL('SIMPLE-ICONS-LICENSE.txt', output));
const credits = ['# Open-source wall artwork', '', 'The gallery uses locally stored project marks.', 'The manifest records each source, asset hash, Omarchy reference, and installation scope.', '', 'Simple Icons marks use CC0-1.0. The package version is 16.31.0.', 'Upstream marks retain their supplied source metadata.', 'The Foot mark uses CC-BY-SA-4.0 and credits its creator in the manifest.', '', ...groups.flatMap((group) => [`## ${group.title}`, '', ...group.entries.map((entry) => `- ${entry.name}: ${entry.role}. ${entry.scope}. ${entry.source}`), ''])];
await writeFile(new URL('README.md', output), `${credits.join('\n')}\n`);
console.log(`The gallery contains ${groups.reduce((total, group) => total + group.entries.length, 0)} verified project marks.`);
