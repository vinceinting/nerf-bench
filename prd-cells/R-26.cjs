// R-26 (as amended by Amendment 2): series keyed by app, model, effort, access path and app track;
// statistics never aggregate across keys. Loads fixture runs that differ only in effort, only in
// access path, only in track, and only in app (Codex CLI vs Codex Windows app), each with its own
// trend, and fails unless each lands in its own series with its own baseline and verdict and no
// computed value mixes two keys.
const path = require('path');
const root = path.join(__dirname, '..');
const { groupBySeries, evaluateAll, evaluateSeries } = require(path.join(root, 'stats', 'series.cjs'));
const { makeRuns, taskBase } = require(path.join(root, 'stats', 'fixtures', 'runs.cjs'));
const fail = (m) => { console.error(`R-26 FAIL: ${m}`); process.exit(1); };
const REL = '2026-06-01T00:00:00Z';
const AS_OF = '2026-07-01T00:00:00Z';
const drop = (d, s, i) => taskBase(i) - (d > 14 ? 0.25 : 0);
const flat = (d, s, i) => taskBase(i);
const base = { app: 'codex-cli', model: 'fx-model', effort: 'default', access_path: 'subscription', track: 'latest' };
const variants = [
  { name: 'reference', over: {}, rate: drop },
  { name: 'effort', over: { effort: 'high' }, rate: flat },
  { name: 'access path', over: { access_path: 'api' }, rate: flat },
  { name: 'track', over: { track: 'frozen' }, rate: flat },
  { name: 'app', over: { app: 'codex-desktop' }, rate: flat },
];
const runs = variants.flatMap((v, i) => makeRuns({ ...base, ...v.over, rate: v.rate, seed: 11 + i, prefix: v.name.replace(' ', '-') }));
const groups = groupBySeries(runs);
if (groups.size !== variants.length) fail(`${groups.size} series for ${variants.length} distinct keys`);
const all = evaluateAll(runs, { releaseAtByModel: { 'fx-model': REL }, asOf: AS_OF });
const ids = new Map();
for (const [key, e] of Object.entries(all)) {
  const own = new Set(groups.get(key).map((r) => r.run_id));
  if (!e.baseline.run_ids.every((id) => own.has(id))) fail(`${key}: baseline holds another series' run`);
  for (const id of e.baseline.run_ids) { if (ids.has(id)) fail(`run ${id} in two baselines`); ids.set(id, key); }
  const pointRuns = e.chart.points.reduce((s, p) => s + p.runs, 0);
  if (pointRuns !== own.size) fail(`${key}: chart counts ${pointRuns} runs, series has ${own.size}`);
}
const ref = all['codex-cli|fx-model|default|subscription|latest'];
const app = all['codex-desktop|fx-model|default|subscription|latest'];
if (!ref || !app) fail('Codex CLI and Codex Windows app did not land in separate series');
if (ref.verdict.kind !== 'lower' || app.verdict.kind !== 'none') fail(`verdicts not separate: CLI ${ref.verdict.kind}, desktop ${app.verdict.kind}`);
if (ref.baseline.digest === app.baseline.digest) fail('Codex CLI and Codex Windows app share a baseline');
let refused = false;
try { evaluateSeries(runs, { releaseAt: REL, asOf: AS_OF }); } catch { refused = true; }
if (!refused) fail('a computation over mixed keys was not refused');
for (const [k, e] of Object.entries(all)) console.log(`${k}: baseline ${e.baseline.runs} runs, verdict "${e.verdict.text}"`);
console.log('R-26 PASS');
