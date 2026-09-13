'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makeRun, makeSet, tmp } = require('./fixtures.cjs');
const runStore = require('../lib/run-store.cjs');
const { build, encodeKey } = require('../build.cjs');
const { publishRetired } = require('../publish-retired.cjs');
const { localCompute } = require('../lib/stats-adapter.cjs');
const markerStore = require('../../../markers/lib/store.cjs');
const ev = require('../../../markers/jobs/project-events.cjs');

const put = (store, rec) => runStore.accept(store, Buffer.from(JSON.stringify(rec)));

test('store is append-only and content addressed; the module exposes no edit or delete', () => {
  const s = tmp('store');
  const a = put(s, makeRun({ runId: '1-1' }));
  assert.equal(a.added, true);
  assert.equal(put(s, makeRun({ runId: '1-1' })).added, false);
  assert.deepEqual(Object.keys(runStore).sort(), ['accept', 'list', 'seriesKey', 'sha256']);
  fs.appendFileSync(path.join(s, 'runs', `${a.sha}.json`), 'x');
  assert.throws(() => runStore.list(s), /altered/);
});

test('each key field splits a series; account source does not', () => {
  const s = tmp('series'); const o = tmp('out'); const mk = tmp('mk');
  put(s, makeRun({ runId: '1-1' }));
  put(s, makeRun({ runId: '2-1', effort: 'high' }));
  put(s, makeRun({ runId: '3-1', access: 'api' }));
  put(s, makeRun({ runId: '4-1', track: 'frozen' }));
  put(s, makeRun({ runId: '5-1', app: 'codex-desktop' }));
  put(s, makeRun({ runId: '6-1', source: 'donated' }));
  const idx = build({ storeDir: s, outDir: o, markersFile: path.join(mk, 'm.jsonl') });
  assert.equal(idx.series.length, 5);
  const base = idx.series.find((x) => x.key === 'codex-cli|fixture-model|medium|subscription|latest');
  assert.equal(base.runs, 2);
});

test('build copies accepted bytes verbatim and refuses a divergent published copy', () => {
  const s = tmp('verb'); const o = tmp('out');
  const bytes = Buffer.from(JSON.stringify(makeRun({ runId: '9-1' }), null, 3));
  const { sha } = runStore.accept(s, bytes);
  build({ storeDir: s, outDir: o, markersFile: path.join(o, 'none.jsonl') });
  assert.ok(fs.readFileSync(path.join(o, 'runs', `${sha}.json`)).equals(bytes));
  fs.writeFileSync(path.join(o, 'runs', `${sha}.json`), '{}');
  assert.throws(() => build({ storeDir: s, outDir: o, markersFile: path.join(o, 'none.jsonl') }), /never edited/);
});

test('series JSON carries stats from the adapter and the markers that affect it', () => {
  const s = tmp('st'); const o = tmp('out'); const m = path.join(tmp('m'), 'markers.jsonl');
  for (let d = 1; d <= 10; d++) put(s, makeRun({ runId: `${d}-1`, startedAt: `2026-09-${String(d).padStart(2, '0')}T12:00:00Z`, passes: d <= 7 ? [true, true, false] : [true, false, false] }));
  markerStore.append(ev.frozenMoves({ before: { 'codex-cli': '1.0.0' }, after: { 'codex-cli': '1.1.0' }, date: '2026-09-05', commit: 'c'.repeat(40) }), m);
  markerStore.append(ev.frozenMoves({ before: { 'grok-build': '1' }, after: { 'grok-build': '2' }, date: '2026-09-05', commit: 'c'.repeat(40) }), m);
  const idx = build({ storeDir: s, outDir: o, markersFile: m, releases: { 'fixture-model': '2026-09-01T00:00:00Z' } });
  const doc = JSON.parse(fs.readFileSync(path.join(o, idx.series[0].file), 'utf8'));
  assert.equal(doc.stats.baseline.n, 21);
  assert.ok(Math.abs(doc.stats.baseline.rate - 14 / 21) < 1e-9);
  assert.equal(doc.stats.dayOne.n, 3);
  assert.ok(doc.stats.points.every((p) => p.lower <= p.rate && p.rate <= p.upper));
  assert.equal(doc.markers.length, 0, 'frozen move must not land on the latest track');
  put(s, makeRun({ runId: '99-1', track: 'frozen' }));
  const idx2 = build({ storeDir: s, outDir: o, markersFile: m, releases: {} });
  const fz = JSON.parse(fs.readFileSync(path.join(o, 'series', encodeKey('codex-cli|fixture-model|medium|subscription|frozen') + '.json'), 'utf8'));
  assert.deepEqual(fz.markers.map((x) => x.type), ['frozen-move']);
  assert.ok(idx2.series.length === 2);
});

test('local stats baseline is frozen: later days do not move it', () => {
  const runs = (n) => Array.from({ length: n }, (_, i) => ({ started_at: new Date(Date.parse('2026-09-01T06:00:00Z') + i * 86400e3).toISOString(), passed: i < 7 ? 5 : 1, total: 10 }));
  const a = localCompute({ runs: runs(7), releaseAt: '2026-09-01T00:00:00Z' });
  const b = localCompute({ runs: runs(30), releaseAt: '2026-09-01T00:00:00Z' });
  assert.deepEqual(a.baseline, b.baseline);
});

function retiredWorld() {
  const d = tmp('ret'); const tr = path.join(d, 'tr'); const s = path.join(d, 'store'); const src = path.join(d, 'src'); const out = path.join(d, 'public');
  const r1 = makeRun({ runId: '10-1', transcriptsDir: tr, passes: [true, false] });
  const r2 = makeRun({ runId: '11-1', transcriptsDir: tr, passes: [false, true] });
  const r3 = makeRun({ runId: '12-1', setId: 'fixture-set-b', transcriptsDir: tr, passes: [true] , taskPrefix: 'fb' });
  [r1, r2, r3].forEach((r) => put(s, r));
  makeSet(src, 'fixture-set-a', ['ft-0', 'ft-1']);
  return { d, tr, s, src, out };
}

test('retiring a set publishes every task and every transcript recorded against it, and no other set', () => {
  const w = retiredWorld();
  const m = publishRetired({ setId: 'fixture-set-a', retiredAt: '2026-09-10T00:00:00Z', tasksDir: w.src, storeDir: w.s, transcriptsDir: w.tr, outDir: w.out });
  assert.equal(m.transcripts.length, 4);
  assert.equal(m.tasks.length, 4);
  for (const t of m.transcripts) assert.ok(fs.existsSync(path.join(w.out, 'retired', 'fixture-set-a', t.file)));
  assert.ok(!fs.existsSync(path.join(w.out, 'retired', 'fixture-set-b')));
});

test('a set that has not retired is refused; a missing or altered transcript fails loudly', () => {
  const w = retiredWorld();
  assert.throws(() => publishRetired({ setId: 'fixture-set-a', retiredAt: '2099-01-01T00:00:00Z', tasksDir: w.src, storeDir: w.s, transcriptsDir: w.tr, outDir: w.out }), /has not retired/);
  fs.writeFileSync(path.join(w.tr, '10-1', 'ft-0.jsonl'), 'tampered');
  assert.throws(() => publishRetired({ setId: 'fixture-set-a', retiredAt: '2026-09-10T00:00:00Z', tasksDir: w.src, storeDir: w.s, transcriptsDir: w.tr, outDir: w.out }), /does not match/);
});

test('published transcripts stay published after a simulated year of rebuilds', () => {
  const w = retiredWorld();
  const args = { setId: 'fixture-set-a', retiredAt: '2026-09-10T00:00:00Z', tasksDir: w.src, storeDir: w.s, transcriptsDir: w.tr, outDir: w.out };
  const m1 = publishRetired(args);
  const later = Date.parse('2027-09-10T00:00:00Z');
  build({ storeDir: w.s, outDir: w.out, markersFile: path.join(w.d, 'm.jsonl') });
  const m2 = publishRetired({ ...args, now: later });
  assert.deepEqual(m2.transcripts, m1.transcripts);
  for (const t of m1.transcripts) assert.ok(fs.existsSync(path.join(w.out, 'retired', 'fixture-set-a', t.file)));
});
