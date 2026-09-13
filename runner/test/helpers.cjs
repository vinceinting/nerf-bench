// Test helpers: a file:// task store, a throwaway home, keys, and a runner invocation with the fake agent.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { setFingerprint } = require('../lib/task-store.cjs');

const RUN = path.join(__dirname, '..', 'run.cjs');
const FAKE = path.join(__dirname, 'fake-agent.cjs');

function tmp(prefix) { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }

function file(p, s) { return { path: p, content_b64: Buffer.from(s).toString('base64') }; }

function makeSet(id, version, taskIds) {
  const files = [];
  for (const t of taskIds) {
    files.push(file(`${t}/task.json`, JSON.stringify({ id: t, prompt: `Write the answer to ${t} into answer.txt`, check: { command: 'node check.cjs' } })));
    files.push(file(`${t}/repo/check.cjs`, "process.exit(require('fs').readFileSync('answer.txt','utf8').trim()==='42'?0:1)\n"));
  }
  return { id, version, status: 'active', fingerprint: setFingerprint(files), files };
}

function makeStore(model, sets) {
  const dir = tmp('nb-store-');
  fs.writeFileSync(path.join(dir, `${model}.json`), JSON.stringify({ model, served_at: new Date().toISOString(), sets }));
  return `file:///${dir.replace(/\\/g, '/').replace(/^\//, '')}`;
}

function keys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
  const dir = tmp('nb-key-');
  fs.writeFileSync(path.join(dir, 'pub.pem'), publicKey);
  return { pubFile: path.join(dir, 'pub.pem'), privateKey };
}

// The test machine is Vince's, whose PATH carries harness entries; a hosted runner's does not. Tests
// model the clean machine by dropping those entries; the real-run inventory (N-01 cell) is the proof.
function cleanPath(p) {
  return String(p || '').split(path.delimiter).filter((x) => !/harness/i.test(x)).join(path.delimiter);
}

let port = 18500;
function runRunner(args, env) {
  const out = tmp('nb-out-');
  const argv = [RUN, 'run', ...args, '--out', out];
  const r = spawnSync(process.execPath, argv, {
    encoding: 'utf8',
    timeout: 60000,
    env: { ...process.env, PATH: cleanPath(process.env.PATH), Path: cleanPath(process.env.Path || process.env.PATH), NB_AGENT_BIN: FAKE, NB_INSTALL: 'skip', NB_NETBLOCK: 'proxy-only', NB_INVENTORY_PROCESSES: 'off',NB_PROXY_PORT: String(port++), NB_HOME: tmp('nb-home-'), CLAUDE_CODE_OAUTH_TOKEN: 'test-token-not-real', ...env },
  });
  const read = (f) => (fs.existsSync(path.join(out, f)) ? fs.readFileSync(path.join(out, f), 'utf8') : null);
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, out, log: read('run.log') || '', result: read('result.json') && JSON.parse(read('result.json')) };
}

module.exports = { tmp, makeSet, makeStore, keys, runRunner, FAKE, RUN };
