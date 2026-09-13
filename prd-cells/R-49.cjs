// R-49: a fixture lab statement appears as a marker linked to its source on that lab's charts, and no run
// data changes. A statement whose source is not on the lab's own domain is refused.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { makeRun, tmp } = require(path.join(ROOT, 'site/data/test/fixtures.cjs'));
const runStore = require(path.join(ROOT, 'site/data/lib/run-store.cjs'));
const { build } = require(path.join(ROOT, 'site/data/build.cjs'));
const store = require(path.join(ROOT, 'markers/lib/store.cjs'));
const ev = require(path.join(ROOT, 'markers/jobs/project-events.cjs'));

const d = tmp('r49'); const s = path.join(d, 'store'); const out = path.join(d, 'out'); const mf = path.join(d, 'markers.jsonl');
runStore.accept(s, Buffer.from(JSON.stringify(makeRun({ runId: '49-1', app: 'codex-cli' }))));
runStore.accept(s, Buffer.from(JSON.stringify(makeRun({ runId: '49-2', app: 'claude-code' }))));
build({ storeDir: s, outDir: out, markersFile: mf });
const snapshot = (dir) => fs.readdirSync(dir).sort().map((f) => f + ':' + runStore.sha256(fs.readFileSync(path.join(dir, f)))).join(',');
const runsBefore = snapshot(path.join(s, 'runs'));
const pubBefore = snapshot(path.join(out, 'runs'));
const url = 'https://openai.com/index/fixture-statement';
store.append(ev.labStatement({ lab: 'openai', date: '2026-09-12T00:00:00Z', title: 'Fixture statement', url }), mf);
const idx = build({ storeDir: s, outDir: out, markersFile: mf });
const fails = [];
for (const e of idx.series) {
  const doc = JSON.parse(fs.readFileSync(path.join(out, e.file), 'utf8'));
  const has = doc.markers.some((m) => m.type === 'lab-statement' && m.source_url === url);
  if (has !== e.key.startsWith('codex-cli|')) fails.push(`${e.key}: statement marker ${has ? 'present' : 'absent'}`);
}
if (snapshot(path.join(s, 'runs')) !== runsBefore || snapshot(path.join(out, 'runs')) !== pubBefore) fails.push('run data changed');
let refused = false;
try { ev.labStatement({ lab: 'openai', date: '2026-09-12', title: 'x', url: 'https://example.com/opinion' }); } catch { refused = true; }
if (!refused) fails.push('a statement sourced off the lab\'s domain was accepted');
if (fails.length) { console.error('R-49 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('R-49 PASS: statement is a linked marker on the lab\'s charts only; run bytes unchanged');
