'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { fingerprintDir, fingerprintEntries } = require('../fingerprint.cjs');
const { harvest, localSource } = require('../harvester.cjs');
const { makeFixtureRepo, makeCandidates } = require('../fixtures/synthetic.cjs');
const store = require('../store.cjs');

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `nb-${p}-`));
const h = (s) => crypto.createHash('sha256').update(s).digest('hex');

test('fingerprint follows schema/run-record.md exactly', () => {
  const dir = tmp('fp');
  fs.mkdirSync(path.join(dir, 'b'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'b', 'x.txt'), 'two');
  fs.writeFileSync(path.join(dir, 'a.txt'), 'one');
  const canon = `a.txt\n${h('one')}\nb/x.txt\n${h('two')}\n`;
  assert.strictEqual(fingerprintDir(dir), `sha256:${h(canon)}`);
  assert.strictEqual(fingerprintEntries([{ path: 'b/x.txt', bytes: Buffer.from('two') }, { path: 'a.txt', bytes: Buffer.from('one') }]), `sha256:${h(canon)}`);
  fs.writeFileSync(path.join(dir, 'a.txt'), 'One');
  assert.notStrictEqual(fingerprintDir(dir), `sha256:${h(canon)}`);
});

test('harvester keeps only post-cutoff fixes whose check fails before and passes after', () => {
  const fx = makeFixtureRepo(path.join(tmp('repo'), 'r'));
  const out = tmp('out');
  const r = harvest({ source: localSource({ repoPath: fx.dir, name: 'fixture/local' }), cutoff: fx.cutoff, outDir: out });
  assert.strictEqual(r.accepted.length, 2, JSON.stringify(r.rejected));
  for (const a of r.accepted) assert.ok(Date.parse(a.merged_at) > Date.parse(fx.cutoff));
  const reasons = r.rejected.map((x) => x.reason).sort();
  assert.deepStrictEqual(reasons, ['check passes on pre-fix code', 'fix changes only tests', 'merged on or before cutoff']);
  for (const a of r.accepted) {
    const t = JSON.parse(fs.readFileSync(path.join(out, a.task_id, 'task.json'), 'utf8'));
    assert.deepStrictEqual(t.validated, { pre_fails: true, fix_passes: true });
  }
});

test('harvester refuses repositories from published benchmarks', () => {
  const fx = makeFixtureRepo(path.join(tmp('repo'), 'r'));
  const r = harvest({ source: localSource({ repoPath: fx.dir, name: 'django/django' }), cutoff: fx.cutoff, outDir: tmp('out') });
  assert.strictEqual(r.accepted.length, 0);
  assert.ok(r.rejected.some((x) => x.reason === 'repository is in a published benchmark'));
});

function fixtureStore(n = 50) {
  const s = store.openStore(tmp('store'), { create: true });
  const cands = makeCandidates(s.root, n);
  return { s, cands };
}

test('activation needs a committed selection record that predates it (R-69)', () => {
  const { s, cands } = fixtureStore();
  fs.mkdirSync(path.join(s.root, 'selections'), { recursive: true });
  // no record at all
  assert.throws(() => store.buildSet(s, { id: 'fx-a', version: '1' }), /no selection record/);
  store.recordSelection(s, { set_id: 'fx-a', set_version: '1', selector: 'fixture-selector', candidates: cands, at: '2026-07-01T00:00:00Z' });
  store.buildSet(s, { id: 'fx-a', version: '1' });
  assert.throws(() => store.activateSet(s, { id: 'fx-a', version: '1', at: '2026-06-30T00:00:00Z' }), /not before activation/);
  // a task swapped after selection is refused
  const one = path.join(store.setDir(s, 'fx-a', '1'), 'tasks', cands[0].task_id, 'check', 'ok.js');
  const orig = fs.readFileSync(one);
  fs.writeFileSync(one, '// tampered\n');
  assert.throws(() => store.activateSet(s, { id: 'fx-a', version: '1', at: '2026-07-02T00:00:00Z' }), /not in the selection record/);
  fs.writeFileSync(one, orig);
  const e = store.activateSet(s, { id: 'fx-a', version: '1', at: '2026-07-02T00:00:00Z' });
  assert.strictEqual(e.task_count, 50);
  assert.strictEqual(e.fingerprint, fingerprintDir(store.setDir(s, 'fx-a', '1')));
});

test('activation refuses a set outside 50 to 100 tasks (R-13)', () => {
  const { s, cands } = fixtureStore(49);
  store.recordSelection(s, { set_id: 'fx-a', set_version: '1', selector: 'x', candidates: cands, at: '2026-07-01T00:00:00Z' });
  store.buildSet(s, { id: 'fx-a', version: '1' });
  assert.throws(() => store.activateSet(s, { id: 'fx-a', version: '1', at: '2026-07-02T00:00:00Z' }), /outside 50 to 100/);
});

test('rotation overlaps and serving respects cutoff eligibility (R-16, R-68)', () => {
  const s = store.openStore(tmp('store'), { create: true });
  const a = makeCandidates(s.root, 50, { prefix: 'fa', mergedFrom: '2026-03-01T00:00:00Z' });
  const b = makeCandidates(s.root, 50, { prefix: 'fb', mergedFrom: '2026-07-01T00:00:00Z' });
  store.recordSelection(s, { set_id: 'fx-a', set_version: '1', selector: 'x', candidates: a, at: '2026-07-01T00:00:00Z' });
  store.buildSet(s, { id: 'fx-a', version: '1' });
  const ea = store.activateSet(s, { id: 'fx-a', version: '1', at: '2026-07-02T00:00:00Z' });
  store.recordSelection(s, { set_id: 'fx-b', set_version: '1', selector: 'x', candidates: b, at: '2026-07-20T00:00:00Z' });
  store.buildSet(s, { id: 'fx-b', version: '1' });
  const eb = store.activateSet(s, { id: 'fx-b', version: '1', at: '2026-07-30T00:00:00Z' });
  const rot = store.rotationSetting();
  assert.strictEqual(typeof rot.interval_days, 'number');
  const cut = '2026-01-01T00:00:00Z';
  assert.deepStrictEqual(store.serve(s, { modelCutoff: cut, at: '2026-07-10T00:00:00Z' }).map((x) => x.id), ['fx-a']);
  assert.deepStrictEqual(store.serve(s, { modelCutoff: cut, at: '2026-08-02T00:00:00Z' }).map((x) => `${x.id}:${x.status}`), ['fx-a:overlap', 'fx-b:active']);
  assert.deepStrictEqual(store.serve(s, { modelCutoff: cut, at: '2026-08-10T00:00:00Z' }).map((x) => x.id), ['fx-b']);
  // a model whose cutoff is after set A's earliest fix is only served B
  assert.deepStrictEqual(store.serve(s, { modelCutoff: '2026-05-01T00:00:00Z', at: '2026-08-02T00:00:00Z' }).map((x) => x.id), ['fx-b']);
  assert.throws(() => store.serve(s, { modelCutoff: '2026-12-01T00:00:00Z', at: '2026-08-02T00:00:00Z' }), /no active set is eligible/);
  assert.strictEqual(store.wasServed(s, { modelCutoff: cut, at: '2026-08-02T00:00:00Z', fingerprint: ea.fingerprint }), true);
  assert.strictEqual(store.wasServed(s, { modelCutoff: cut, at: '2026-08-10T00:00:00Z', fingerprint: ea.fingerprint }), false);
  assert.strictEqual(store.wasServed(s, { modelCutoff: cut, at: '2026-08-10T00:00:00Z', fingerprint: `sha256:${'f'.repeat(64)}` }), false);
  assert.strictEqual(store.nextRotationDue(store.registry(s)), new Date(Date.parse(eb.activated_at) + rot.interval_days * 86400000).toISOString());
});
