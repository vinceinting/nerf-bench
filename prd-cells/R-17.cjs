// R-17: retiring a fixture set makes every task and every run transcript recorded against it publicly
// readable. Local half: publish-retired over a fixture store. Public half (Amendment 3, deployment 2):
// every published file must be served at NERF_PUBLIC_VERIFY_URL + /data/retired/<set>/...
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { makeRun, makeSet, tmp } = require(path.join(ROOT, 'site/data/test/fixtures.cjs'));
const runStore = require(path.join(ROOT, 'site/data/lib/run-store.cjs'));
const { publishRetired } = require(path.join(ROOT, 'site/data/publish-retired.cjs'));

const fails = [];
const d = tmp('r17'); const tr = path.join(d, 'tr'); const s = path.join(d, 'store'); const src = path.join(d, 'src'); const out = path.join(d, 'public');
const runs = [makeRun({ runId: '17-1', transcriptsDir: tr, passes: [true, false, true] }), makeRun({ runId: '17-2', transcriptsDir: tr, passes: [false, false, true] })];
runs.forEach((r) => runStore.accept(s, Buffer.from(JSON.stringify(r))));
makeSet(src, 'fixture-set-a', ['ft-0', 'ft-1', 'ft-2']);
const m = publishRetired({ setId: 'fixture-set-a', retiredAt: '2026-09-10T00:00:00Z', tasksDir: src, storeDir: s, transcriptsDir: tr, outDir: out });
const root = path.join(out, 'retired', 'fixture-set-a');
const expectT = runs.reduce((a, r) => a + r.tasks.length, 0);
if (m.transcripts.length !== expectT) fails.push(`published ${m.transcripts.length} transcripts, expected ${expectT}`);
for (const t of ['ft-0', 'ft-1', 'ft-2']) if (!m.tasks.some((f) => f.startsWith(`tasks/${t}/`))) fails.push(`task ${t} not published`);
for (const f of [...m.tasks, ...m.transcripts.map((x) => x.file)]) if (!fs.existsSync(path.join(root, f))) fails.push(`${f} missing from output`);

(async () => {
  const base = process.env.NERF_PUBLIC_VERIFY_URL;
  if (!base) fails.push('no public verification deployment configured (NERF_PUBLIC_VERIFY_URL unset); "publicly readable" is unproved');
  else {
    for (const f of ['manifest.json', ...m.tasks, ...m.transcripts.map((x) => x.file)]) {
      try {
        const res = await fetch(new URL(`data/retired/fixture-set-a/${f}`, base.endsWith('/') ? base : base + '/'), { signal: AbortSignal.timeout(20000) });
        if (!res.ok) fails.push(`${f}: HTTP ${res.status}`);
      } catch (e) { fails.push(`${f}: ${e.message}`); }
    }
  }
  if (fails.length) { console.error('R-17 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log(`R-17 PASS: ${m.tasks.length} task files and ${m.transcripts.length} transcripts published and served`);
})();
