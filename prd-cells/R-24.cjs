// R-24: the baseline is the pooled first 7 days after the official release timestamp, then frozen.
// Feeds fixture runs spanning well past day 7; fails unless the baseline equals the pooled days
// 1 to 7 and does not change when later days (or late-arriving runs) are added.
const path = require('path');
const root = path.join(__dirname, '..');
const { computeBaseline, freezeBaseline } = require(path.join(root, 'stats', 'baseline.cjs'));
const { makeRuns } = require(path.join(root, 'stats', 'fixtures', 'runs.cjs'));
const fail = (m) => { console.error(`R-24 FAIL: ${m}`); process.exit(1); };
const REL = '2026-06-01T09:30:00Z';
const DAY = 86400000;

const all = makeRuns({ releaseAt: REL, days: 40, runsPerDay: 3, rate: (d) => (d <= 7 ? 0.7 : 0.3) });
const first7 = all.filter((r) => Date.parse(r.started_at) < Date.parse(REL) + 7 * DAY);
let pass = 0; let n = 0;
for (const r of first7) for (const t of r.tasks) { n += 1; if (t.pass) pass += 1; }
const b = computeBaseline(all, REL, { asOf: '2026-07-15T00:00:00Z' });
if (b.window_start !== new Date(REL).toISOString()) fail(`window starts ${b.window_start}, not at the release timestamp`);
if (b.runs !== first7.length || Math.abs(b.pooled_rate - pass / n) > 1e-12) fail(`baseline ${b.pooled_rate} over ${b.runs} runs, pooled days 1 to 7 are ${pass / n} over ${first7.length}`);
const onlyFirst = computeBaseline(first7, REL, { asOf: '2026-07-15T00:00:00Z' });
if (onlyFirst.digest !== b.digest) fail('adding later days changed the baseline');
const frozen = freezeBaseline(b, '2026-06-09T00:00:00Z');
const late = makeRuns({ releaseAt: REL, days: 2, prefix: 'late', seed: 3, rate: () => 0 });
if (computeBaseline([...all, ...late], REL, { frozen }) !== frozen) fail('a run arriving after the freeze changed the frozen baseline');
console.log(`baseline: ${b.runs} runs, pooled ${b.pooled_rate.toFixed(4)} = days 1 to 7; unchanged by ${all.length - first7.length} later runs and by late arrivals after freeze`);
console.log('R-24 PASS');
