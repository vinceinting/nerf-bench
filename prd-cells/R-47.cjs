// R-47: changing the frozen-version setting on a fixture puts a marker on the affected charts at that date,
// and on no other chart.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { makeRun, tmp } = require(path.join(ROOT, 'site/data/test/fixtures.cjs'));
const runStore = require(path.join(ROOT, 'site/data/lib/run-store.cjs'));
const { build } = require(path.join(ROOT, 'site/data/build.cjs'));
const store = require(path.join(ROOT, 'markers/lib/store.cjs'));
const ev = require(path.join(ROOT, 'markers/jobs/project-events.cjs'));

const d = tmp('r47'); const s = path.join(d, 'store'); const out = path.join(d, 'out'); const mf = path.join(d, 'markers.jsonl');
const keys = [['codex-cli', 'frozen'], ['codex-cli', 'latest'], ['claude-code', 'frozen']];
keys.forEach(([app, track], i) => runStore.accept(s, Buffer.from(JSON.stringify(makeRun({ runId: `47-${i}`, app, track })))));
const before = { 'codex-cli': '0.150.0', 'claude-code': '2.1.0' };
const after = { 'codex-cli': '0.155.0', 'claude-code': '2.1.0' };
store.append(ev.frozenMoves({ before, after, date: '2026-09-12T00:00:00Z', commit: 'e'.repeat(40) }), mf);
const idx = build({ storeDir: s, outDir: out, markersFile: mf });
const fails = [];
for (const e of idx.series) {
  const doc = JSON.parse(fs.readFileSync(path.join(out, e.file), 'utf8'));
  const has = doc.markers.some((m) => m.type === 'frozen-move' && m.date.startsWith('2026-09-12') && m.source_url.startsWith('https://github.com/vinceinting/nerf-bench/commit/'));
  const should = e.key.startsWith('codex-cli|') && e.key.endsWith('|frozen');
  if (has !== should) fails.push(`${e.key}: marker ${has ? 'present' : 'absent'}, expected ${should ? 'present' : 'absent'}`);
}
if (fails.length) { console.error('R-47 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('R-47 PASS: the frozen move marks codex-cli frozen charts on 2026-09-12 and no other chart');
