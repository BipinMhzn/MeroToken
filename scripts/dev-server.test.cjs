const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { createServer } = require('./dev-server.cjs');

test('serves the app and contract artifacts without exposing other files', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'merotoken-server-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'src'));
  await fs.mkdir(path.join(root, 'contracts'));
  await fs.writeFile(path.join(root, 'src/index.html'), '<h1>MeroToken</h1>');
  await fs.writeFile(path.join(root, 'contracts/MeroToken.json'), '{"abi":[]}');
  await fs.writeFile(path.join(root, 'secret.txt'), 'private');
  await fs.writeFile(path.join(root, 'src/.env'), 'private');
  await fs.symlink(path.join(root, 'secret.txt'), path.join(root, 'src/escape.txt'));
  const server = createServer([path.join(root, 'src'), path.join(root, 'contracts')]);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  async function request(url, method = 'GET') {
    return new Promise((resolve, reject) => {
      http.request({ hostname: '127.0.0.1', port: server.address().port, path: url, method }, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }).on('error', reject).end();
    });
  }
  assert.equal((await request('/')).body, '<h1>MeroToken</h1>');
  assert.equal((await request('/MeroToken.json?cache=1')).body, '{"abi":[]}');
  assert.match((await request('/MeroToken.json')).headers['content-type'], /application\/json/);
  assert.equal((await request('/', 'HEAD')).body, '');
  assert.equal((await request('/', 'POST')).status, 405);
  for (const url of ['/../secret.txt', '/%2e%2e/secret.txt', '/.env', '/%00', '/%ZZ', '/..%5csecret.txt']) {
    assert.equal((await request(url)).status, 400, url);
  }
  assert.equal((await request('/escape.txt')).status, 404);
  assert.equal((await request('/missing')).status, 404);
});
