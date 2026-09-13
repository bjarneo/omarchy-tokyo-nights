import { createServer } from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.srt': 'application/x-subrip; charset=utf-8',
};

export function createStaticServer() {
  return createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!/^(index\.html|style\.css|(?:music-video|vr)\.(html|css)|src\/[\w.-]+|assets\/[\w.-]+|exports\/[\w-]+\.mp4)$/.test(relative)) {
      response.writeHead(404).end('Not found.');
      return;
    }
    const path = resolve(root, relative);
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(403).end('Forbidden.');
      return;
    }
    const file = await stat(path);
    if (!file.isFile()) { response.writeHead(404).end('Not found.'); return; }
    const headers = {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': 'bytes',
    };
    let start = 0;
    let end = file.size - 1;
    let code = 200;
    if (request.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      if (match && (match[1] || match[2])) {
        start = match[1] ? Number(match[1]) : Math.max(0, file.size - Number(match[2]));
        end = match[1] && match[2] ? Math.min(end, Number(match[2])) : end;
      }
      if (!match || (!match[1] && !match[2]) || start > end || start >= file.size || (match[1] === '' && Number(match[2]) === 0)) {
        response.writeHead(416, { 'Content-Range': `bytes */${file.size}` }).end();
        return;
      }
      code = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${file.size}`;
    }
    headers['Content-Length'] = Math.max(0, end - start + 1);
    response.writeHead(code, headers);
    if (request.method === 'HEAD' || file.size === 0) { response.end(); return; }
    const stream = createReadStream(path, { start, end });
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch {
    response.writeHead(404).end('Not found.');
  }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createStaticServer();
  server.on('error', (error) => {
  console.error(`The server cannot start: ${error.message}`);
  process.exitCode = 1;
  });
  server.listen(port, '0.0.0.0', () => {
  console.log(`Tokyo Nights is ready at http://localhost:${port}`);
  });
}
