'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { makeRun, makeSet, tmp, sha } = require('../../../site/data/test/fixtures.cjs');
const runStore = require('../../../site/data/lib/run-store.cjs');
const { publishRetired } = require('../../../site/data/publish-retired.cjs');
const { verify } = require('../verify.cjs');

const GH = path.join(__dirname, 'fake-gh.cjs');

function setup(passes) {
  const d = tmp('verify');
  const tr = path.join(d, 'private-transcripts');
  const rec = makeRun({ passes, transcriptsDir: tr });
  const file = path.join(d, 'result.json');
  fs.writeFileSync(file, JSON.stringify(rec, null, 2));
  process.env.FAKE_GH_ACCEPT_SHA = sha(fs.readFileSync(file));
  return { d, tr, rec, file };
}

test('current-set run: signature and recount pass, output says regrading follows retirement', () => {
  const { file } = setup([true, false, true]);
  const r = verify(file, { gh: GH });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(r.mode, /regrading follows retirement/);
  assert.equal(r.checks.regrade.performed, false);
});

test('a flipped byte fails the signature', () => {
  const { file } = setup([true, true, false]);
  fs.appendFileSync(file, ' ');
  const r = verify(file, { gh: GH });
  assert.equal(r.checks.signature.ok, false);
  assert.equal(r.ok, false);
});

test('a published total that disagrees with the attested flags fails the recount', () => {
  const d = tmp('verify-bad');
  const rec = makeRun({ passes: [true, false] });
  rec.totals.passed = 2;
  const file = path.join(d, 'result.json');
  fs.writeFileSync(file, JSON.stringify(rec));
  process.env.FAKE_GH_ACCEPT_SHA = sha(fs.readFileSync(file));
  const r = verify(file, { gh: GH });
  assert.equal(r.checks.recount.ok, false);
  assert.equal(r.ok, false);
});

function retire({ d, tr, rec, file }) {
  const tasks = path.join(d, 'set-src');
  makeSet(tasks, rec.task_sets[0].id, rec.tasks.map((t) => t.task_id));
  const store = path.join(d, 'store');
  runStore.accept(store, fs.readFileSync(file));
  const out = path.join(d, 'public');
  publishRetired({ setId: rec.task_sets[0].id, retiredAt: '2026-09-02T00:00:00Z', tasksDir: tasks, storeDir: store, transcriptsDir: tr, outDir: out });
  return path.join(out, 'retired');
}

test('retired-set run is fully regraded and matches', () => {
  const s = setup([true, false, true, true]);
  const retired = retire(s);
  const r = verify(s.file, { gh: GH, retired });
  assert.equal(r.ok, true, JSON.stringify(r.checks));
  assert.match(r.mode, /full regrade/);
  assert.equal(r.checks.regrade.passed, 3);
});

test('regrade catches an attested pass the public check does not reproduce', () => {
  const s = setup([true, true]);
  const retired = retire(s);
  const tp = path.join(retired, s.rec.task_sets[0].id, 'tasks', 'ft-0', 'check.cjs');
  fs.writeFileSync(tp, 'process.exit(1);\n');
  const r = verify(s.file, { gh: GH, retired });
  assert.equal(r.ok, false);
  assert.match(r.checks.regrade.detail, /regraded fail, attested pass/);
});

test('the verifier source never names a site address or makes an HTTP call itself', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'verify.cjs'), 'utf8');
  assert.doesNotMatch(src, /\bfetch\(|require\('https?'\)|https?:\/\//);
});

test('CLI prints what it performed and exits 0 on a verified run', () => {
  const { file } = setup([true]);
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'verify.cjs'), file], { encoding: 'utf8', env: { ...process.env, NERF_VERIFY_GH: GH } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /performed: signature \+ recount/);
});
