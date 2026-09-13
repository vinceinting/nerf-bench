// R-58: a retired task's transcripts are served publicly and remain served after a simulated year.
// Local half: publish, rebuild and republish with the clock a year on; nothing published may disappear.
// Public half (Amendment 3, deployment 2): transcripts served at NERF_PUBLIC_VERIFY_URL, and still served
// by a deployment whose clock is a year on, which needs that deployment to exist.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { makeRun, makeSet, tmp } = require(path.join(ROOT, 'site/data/test/fixtures.cjs'));
const runStore = require(path.join(ROOT, 'site/data/lib/run-store.cjs'));
const { publishRetired } = require(path.join(ROOT, 'site/data/publish-retired.cjs'));
const { build } = require(path.join(ROOT, 'site/data/build.cjs'));

const fails = [];
const d = tmp('r58'); const tr = path.join(d, 'tr'); const s = path.join(d, 'store'); const src = path.join(d, 'src'); const out = path.join(d, 'public');
const r = makeRun({ runId: '58-1', transcriptsDir: tr, passes: [true, false] });
runStore.accept(s, Buffer.from(JSON.stringify(r)));
makeSet(src, 'fixture-set-a', ['ft-0', 'ft-1']);
const args = { setId: 'fixture-set-a', retiredAt: '2026-09-10T00:00:00Z', tasksDir: src, storeDir: s, transcriptsDir: tr, outDir: out };
const m1 = publishRetired(args);
const root = path.join(out, 'retired', 'fixture-set-a');
const snap = () => Object.fromEntries(m1.transcripts.map((t) => [t.file, fs.existsSync(path.join(root, t.file)) ? fs.readFileSync(path.join(root, t.file), 'utf8') : null]));
const before = snap();
runStore.accept(s, Buffer.from(JSON.stringify(makeRun({ runId: '58-2', setId: 'fixture-set-b', taskPrefix: 'fb' }))));
build({ storeDir: s, outDir: out, markersFile: path.join(d, 'm.jsonl') });
publishRetired({ ...args, now: Date.parse('2027-09-10T00:00:00Z') });
const after = snap();
for (const [f, v] of Object.entries(before)) if (v === null || after[f] !== v) fails.push(`${f} not served unchanged after a simulated year`);

(async () => {
  const base = process.env.NERF_PUBLIC_VERIFY_URL;
  if (!base) fails.push('no public verification deployment configured (NERF_PUBLIC_VERIFY_URL unset); "served publicly" is unproved');
  else {
    for (const t of m1.transcripts) {
      try {
        const res = await fetch(new URL(`data/retired/fixture-set-a/${t.file}`, base.endsWith('/') ? base : base + '/'), { signal: AbortSignal.timeout(20000) });
        if (!res.ok) fails.push(`${t.file}: HTTP ${res.status}`);
      } catch (e) { fails.push(`${t.file}: ${e.message}`); }
    }
  }
  if (fails.length) { console.error('R-58 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log(`R-58 PASS: ${m1.transcripts.length} transcripts served and unchanged after a simulated year`);
})();
