const http = require('node:http');
const fs = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const path = require('node:path');

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};

function createServer(roots) {
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end();
    }
    let parts;
    try {
      const pathname = decodeURIComponent(req.url.split('?')[0]);
      if (!pathname.startsWith('/') || /[\\\x00]/.test(pathname)) throw new Error();
      parts = pathname.split('/').filter(Boolean);
      if (parts.some(part => part.startsWith('.'))) throw new Error();
    } catch {
      res.writeHead(400);
      return res.end('Invalid path');
    }
    for (const root of roots) {
      try {
        const realRoot = await fs.realpath(root);
        let filename = await fs.realpath(path.join(realRoot, ...parts));
        if ((await fs.stat(filename)).isDirectory()) filename = await fs.realpath(path.join(filename, 'index.html'));
        const relative = path.relative(realRoot, filename);
        if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
        const stat = await fs.stat(filename);
        if (!stat.isFile()) continue;
        res.writeHead(200, {
          'Content-Type': types[path.extname(filename)] || 'application/octet-stream',
          'Content-Length': stat.size,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-store',
        });
        if (req.method === 'HEAD') return res.end();
        createReadStream(filename).on('error', () => res.destroy()).pipe(res);
        return;
      } catch (error) {
        if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') {
          res.writeHead(500);
          return res.end('Unable to read file');
        }
      }
    }
    res.writeHead(404);
    res.end('Not found');
  });
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const server = createServer([path.join(root, 'src'), path.join(root, 'build/contracts')]);
  server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => {
    console.log(`MeroToken: http://127.0.0.1:${server.address().port}`);
  });
}

module.exports = { createServer };
