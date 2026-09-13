// R-48: a fixture task rotation puts a marker on every affected chart.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { makeRun, tmp } = require(path.join(ROOT, 'site/data/test/fixtures.cjs'));
const runStore = require(path.join(ROOT, 'site/data/lib/run-store.cjs'));
const { build } = require(path.join(ROOT, 'site/data/build.cjs'));
const store = require(path.join(ROOT, 'markers/lib/store.cjs'));
const ev = require(path.join(ROOT, 'markers/jobs/project-events.cjs'));

const d = tmp('r48'); const s = path.join(d, 'store'); const out = path.join(d, 'out'); const mf = path.join(d, 'markers.jsonl');
const variants = [{ app: 'codex-cli' }, { app: 'grok-build', effort: 'high' }, { app: 'claude-desktop', access: 'api' }, { app: 'codex-desktop', track: 'frozen' }];
variants.forEach((v, i) => runStore.accept(s, Buffer.from(JSON.stringify(makeRun({ runId: `48-${i}`, ...v })))));
store.append(ev.rotation({ outgoing: { id: 'fixture-set-a', version: '1' }, incoming: { id: 'fixture-set-b', version: '1' }, date: '2026-09-12T00:00:00Z', commit: 'f'.repeat(40) }), mf);
const idx = build({ storeDir: s, outDir: out, markersFile: mf });
const missing = idx.series.filter((e) => !JSON.parse(fs.readFileSync(path.join(out, e.file), 'utf8')).markers.some((m) => m.type === 'task-rotation'));
if (idx.series.length !== variants.length || missing.length) { console.error(`R-48 FAIL: ${missing.length} of ${idx.series.length} charts lack the rotation marker`); process.exit(1); }
console.log(`R-48 PASS: rotation marker on all ${idx.series.length} affected charts`);
