// R-16: rotation overlaps. Simulates a rotation on fixture data through the real store code: two
// sets activated in sequence, a run every 8 hours that executes whatever store.serve() returns at
// its start, then the chart data. Fails unless runs cover both sets on every day of the overlap
// period and the chart joins the two sets into one continuous series.
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = path.join(__dirname, '..');
const store = require(path.join(root, 'tasks', 'store.cjs'));
const { makeCandidates } = require(path.join(root, 'tasks', 'fixtures', 'synthetic.cjs'));
const { evaluateSeries } = require(path.join(root, 'stats', 'series.cjs'));
const { makeRuns, taskBase } = require(path.join(root, 'stats', 'fixtures', 'runs.cjs'));
const fail = (m) => { console.error(`R-16 FAIL: ${m}`); process.exit(1); };
const DAY = 86400000;

const s = store.openStore(fs.mkdtempSync(path.join(os.tmpdir(), 'r16-')), { create: true });
const a = makeCandidates(s.root, 50, { prefix: 'fa', mergedFrom: '2026-03-01T00:00:00Z' });
const b = makeCandidates(s.root, 50, { prefix: 'fb', mergedFrom: '2026-04-01T00:00:00Z' });
const REL = '2026-06-01T00:00:00Z';
store.recordSelection(s, { set_id: 'fx-a', set_version: '1', selector: 'fixture', candidates: a, at: '2026-05-30T00:00:00Z' });
store.buildSet(s, { id: 'fx-a', version: '1' });
store.activateSet(s, { id: 'fx-a', version: '1', at: '2026-05-31T00:00:00Z' });
const rot = store.rotationSetting();
const bAt = new Date(Date.parse('2026-05-31T00:00:00Z') + rot.interval_days * DAY).toISOString();
store.recordSelection(s, { set_id: 'fx-b', set_version: '1', selector: 'fixture', candidates: b, at: new Date(Date.parse(bAt) - DAY).toISOString() });
store.buildSet(s, { id: 'fx-b', version: '1' });
store.activateSet(s, { id: 'fx-b', version: '1', at: bAt });

// Runs: what the store serves at each run's start decides the sets it carries.
const template = makeRuns({ releaseAt: REL, days: 50, runsPerDay: 3, sets: [{ id: 'fx-a', n: 50, fromDay: 1, toDay: 999 }, { id: 'fx-b', n: 50, fromDay: 1, toDay: 999 }],
  rate: (d, set, i) => (set === 'fx-b' ? Math.max(0.05, taskBase(i) - 0.1) : taskBase(i)) });
const runs = template.map((r) => {
  const served = store.serve(s, { modelCutoff: '2026-01-01T00:00:00Z', at: r.started_at }).map((x) => x.id);
  return { ...r, tasks: r.tasks.filter((t) => served.includes(t.set_id)) };
});
const overlapStart = Date.parse(bAt);
const overlapEnd = overlapStart + rot.overlap_days * DAY;
for (let t = overlapStart; t < overlapEnd; t += DAY) {
  const day = runs.filter((r) => Date.parse(r.started_at) >= t && Date.parse(r.started_at) < t + DAY);
  const both = day.filter((r) => new Set(r.tasks.map((x) => x.set_id)).size === 2);
  if (both.length === 0) fail(`no run carried both sets on ${new Date(t).toISOString().slice(0, 10)}`);
}
if (!runs.some((r) => Date.parse(r.started_at) < overlapStart && r.tasks.every((t) => t.set_id === 'fx-a'))) fail('no run before the overlap on the outgoing set alone');
if (!runs.some((r) => Date.parse(r.started_at) >= overlapEnd && r.tasks.every((t) => t.set_id === 'fx-b'))) fail('no run after the overlap on the incoming set alone');

const e = evaluateSeries(runs, { releaseAt: REL, asOf: '2026-07-21T00:00:00Z' });
const j = e.chart.joins.find((x) => x.from === 'fx-a' && x.to === 'fx-b');
if (!j || j.offset === null || j.overlap_runs === 0) fail('chart data does not join the two sets');
const days = e.chart.points.map((p) => p.day);
for (let d = 1; d <= days[days.length - 1]; d += 1) if (!days.includes(d)) fail(`chart has a gap at day ${d}`);
const avg = (xs) => xs.reduce((x, y) => x + y, 0) / xs.length;
const pre = avg(e.chart.points.filter((p) => p.sets.join() === 'fx-a').map((p) => p.rate));
const post = avg(e.chart.points.filter((p) => p.sets.join() === 'fx-b').map((p) => p.rate));
if (Math.abs(pre - post) > 0.05) fail(`joined chart jumps at the rotation: ${pre.toFixed(3)} before, ${post.toFixed(3)} after`);
console.log(`overlap ${new Date(overlapStart).toISOString().slice(0, 10)} for ${rot.overlap_days} days: both sets ran every day; join offset ${j.offset.toFixed(3)} over ${j.overlap_runs} runs; levels ${pre.toFixed(3)} before, ${post.toFixed(3)} after; verdict "${e.verdict.text}"`);
console.log('R-16 PASS');
