'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');
const catalog = require('../lib/catalog.cjs');
const frozen = require('../lib/frozen.cjs');
const fingerprint = require('../lib/fingerprint.cjs');
const inventory = require('../lib/inventory.cjs');
const store = require('../lib/task-store.cjs');
const transcripts = require('../lib/transcripts.cjs');
const proxy = require('../network/proxy.cjs');
const { adapter, ADAPTERS } = require('../apps/common.cjs');
const { tmp, makeSet, keys } = require('./helpers.cjs');

test('catalog selects listed entries and refuses an unlisted model', () => {
  const cat = catalog.load();
  const s = catalog.select(cat, { app: 'claude-code', model: 'claude-opus-5', effort: 'high' });
  assert.strictEqual(s.effort_is_default, false);
  assert.throws(() => catalog.select(cat, { app: 'claude-code', model: 'not-a-model' }), /not in the catalog/);
  assert.throws(() => catalog.select(cat, { app: 'claude-code', model: 'claude-opus-5', effort: 'turbo' }), /not listed/);
  assert.ok(catalog.choices(cat).length > 0);
});

test('a non-flagship catalog entry is selectable on its own', () => {
  const cat = catalog.load();
  cat.models.push({ id: 'fixture-small', lab: 'anthropic', tier: 'non-flagship', vendor_model: 'fixture-small', apps: ['claude-code'] });
  assert.strictEqual(catalog.select(cat, { app: 'claude-code', model: 'fixture-small' }).model.tier, 'non-flagship');
});

test('frozen pins move only on schedule', () => {
  const cfg = { schedule: { interval_days: 28, anchor: '2026-01-01T00:00:00Z' }, pins: [
    { app: 'x', version: '1.0.0', effective_from: '2026-01-01T00:00:00Z' },
    { app: 'x', version: '2.0.0', effective_from: '2026-01-29T00:00:00Z' },
    { app: 'x', version: '9.9.9', effective_from: '2026-01-10T00:00:00Z' },
  ] };
  assert.strictEqual(frozen.resolve(cfg, 'x', new Date('2026-01-28T23:59:59Z')).version, '1.0.0');
  assert.strictEqual(frozen.resolve(cfg, 'x', new Date('2026-01-29T00:00:00Z')).version, '2.0.0');
  assert.strictEqual(frozen.resolve(cfg, 'x', new Date('2026-02-20T00:00:00Z')).version, '2.0.0');
  assert.deepStrictEqual(frozen.resolve(cfg, 'x', new Date('2026-01-15T00:00:00Z')).ignored.map((p) => p.version), ['9.9.9']);
  assert.deepStrictEqual(frozen.moves(cfg, 'x').valid.map((p) => p.effective_from), ['2026-01-01T00:00:00Z', '2026-01-29T00:00:00Z']);
});

test('the published frozen config is on schedule for every pin', () => {
  const cfg = frozen.load();
  for (const p of cfg.pins) assert.ok(frozen.onSchedule(cfg, p.effective_from), `${p.app} ${p.effective_from}`);
});

test('fingerprint is stable across fresh homes and changes when an instruction file is added', () => {
  for (const id of ADAPTERS) {
    const locs = adapter(id).configLocations;
    const a = fingerprint.compute(locs, { home: tmp('h-'), workspace: tmp('w-') });
    const b = fingerprint.compute(locs, { home: tmp('h-'), workspace: tmp('w-') });
    assert.strictEqual(a.value, b.value, id);
    const dirty = tmp('h-');
    const first = locs.find((l) => l.startsWith('~/'));
    fs.mkdirSync(fingerprint.expand(first, dirty, dirty), { recursive: true });
    fs.writeFileSync(path.join(fingerprint.expand(first, dirty, dirty), 'CLAUDE.md'), 'be terse');
    const c = fingerprint.compute(locs, { home: dirty, workspace: tmp('w-') });
    assert.notStrictEqual(c.value, a.value, id);
    const cmp = fingerprint.compare({ app: { id, version: '1' }, fingerprint: c }, { [`${id}@1`]: a });
    assert.strictEqual(cmp.ok, false);
    assert.match(cmp.reason, /mismatch/);
  }
});

test('inventory scan finds a harness trace and an instruction file, and passes a clean home', () => {
  const locs = adapter('claude-code').configLocations;
  const clean = inventory.take(locs, { home: tmp('h-'), workspace: tmp('w-'), env: { PATH: '/usr/bin' } });
  assert.deepStrictEqual(inventory.scan({ ...clean, processes: [] }), []);
  const dirty = tmp('h-');
  fs.mkdirSync(path.join(dirty, '.claude', 'hooks'), { recursive: true });
  fs.writeFileSync(path.join(dirty, '.claude', 'hooks', 'x.cjs'), '');
  fs.writeFileSync(path.join(dirty, '.claude', 'CLAUDE.md'), '@C:/Users/Vince/.harness-v2/CLAUDE.md');
  const inv = inventory.take(locs, { home: dirty, workspace: tmp('w-'), env: { HARNESS: 'C:\\Users\\Vince\\.harness-v2', CODEX_HOME: '/somewhere' } });
  const hits = inventory.scan({ ...inv, processes: [] });
  assert.ok(hits.some((h) => /environment variable HARNESS/.test(h)));
  assert.ok(hits.some((h) => /environment variable CODEX_HOME/.test(h)));
  assert.ok(hits.some((h) => /instruction file/.test(h)));
  assert.ok(hits.some((h) => /hook/.test(h)));
});

test('task store: served fingerprints are checked, and an unserved set is refused', () => {
  const set = makeSet('s1', '1', ['t1']);
  const served = { model: 'm', sets: [set] };
  assert.strictEqual(store.choose(served, 's1').length, 1);
  assert.throws(() => store.choose(served, 'community-set'), /not served by the official store/);
  assert.strictEqual(store.setFingerprint(set.files), set.fingerprint);
});

test('transcripts are sealed to the public key and open only with the private key', () => {
  const k = keys();
  const sealed = transcripts.seal(Buffer.from('secret transcript'), fs.readFileSync(k.pubFile, 'utf8'));
  assert.ok(!sealed.includes('secret transcript'));
  assert.strictEqual(transcripts.open(sealed, k.privateKey).toString(), 'secret transcript');
});

test('proxy refuses a non-vendor host and logs the refusal', async () => {
  const log = path.join(tmp('p-'), 'r.jsonl');
  fs.writeFileSync(log, '');
  const server = await proxy.start(18499, log, ['api.anthropic.com']);
  const code = await new Promise((resolve) => {
    const req = http.request({ host: '127.0.0.1', port: 18499, method: 'CONNECT', path: 'example.com:443' });
    req.on('connect', (res, sock) => { sock.destroy(); resolve(res.statusCode); });
    req.on('error', () => resolve(-1));
    req.end();
  });
  server.close();
  assert.strictEqual(code, 403);
  assert.match(fs.readFileSync(log, 'utf8'), /"host":"example.com"/);
  assert.ok(proxy.allowed('api.anthropic.com', ['api.anthropic.com']));
  assert.ok(!proxy.allowed('evil-api.anthropic.com.example', ['api.anthropic.com']));
});

test('adapters: CLI apps pass auto-approve flags and effort; desktop apps refuse honestly', () => {
  const inv = (id, effort) => adapter(id).invocation({ prompt: 'p', vendorModel: 'm', effort }).args;
  assert.ok(inv('claude-code', 'high').includes('--dangerously-skip-permissions'));
  assert.deepStrictEqual(inv('claude-code', 'high').slice(-2), ['--effort', 'high']);
  assert.ok(!inv('claude-code', 'default').includes('--effort'));
  assert.ok(inv('codex-cli', 'high').includes('--dangerously-bypass-approvals-and-sandbox'));
  assert.ok(inv('codex-cli', 'high').includes('model_reasoning_effort="high"'));
  assert.ok(inv('grok-build', 'default').includes('--always-approve'));
  assert.throws(() => inv('codex-desktop', 'default'), /no unattended driver/);
  assert.throws(() => inv('claude-desktop', 'default'), /no unattended driver/);
});
