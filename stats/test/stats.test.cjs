'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { makeRuns, taskBase } = require('../fixtures/runs.cjs');
const { computeBaseline, freezeBaseline } = require('../baseline.cjs');
const { evaluateSeries, evaluateAll, seriesKey, groupBySeries } = require('../series.cjs');
const { verdict, TEMPLATES, containsBanned } = require('../verdict.cjs');

const REL = '2026-06-01T00:00:00Z';
const AS_OF = '2026-07-01T00:00:00Z';

test('baseline is days 1 to 7 pooled and does not move when later days arrive (R-24)', () => {
  const all = makeRuns({ releaseAt: REL, days: 30 });
  const first = all.filter((r) => Date.parse(r.started_at) < Date.parse(REL) + 7 * 86400000);
  const b7 = computeBaseline(first, REL, { asOf: AS_OF });
  const b30 = computeBaseline(all, REL, { asOf: AS_OF });
  assert.strictEqual(b7.runs, 14);
  assert.deepStrictEqual(b30.per_task, b7.per_task);
  assert.strictEqual(b30.digest, b7.digest);
  const frozen = freezeBaseline(b7, AS_OF);
  const extra = makeRuns({ releaseAt: REL, days: 3, seed: 99, prefix: 'late', rate: () => 0 });
  assert.strictEqual(computeBaseline([...all, ...extra], REL, { asOf: AS_OF, frozen }), frozen);
  assert.throws(() => freezeBaseline(b7, '2026-06-03T00:00:00Z'), /still open/);
});

test('a real drop clears the rule and gets a headline; a flat series does not (R-22)', () => {
  const drop = makeRuns({ releaseAt: REL, rate: (d, s, i) => taskBase(i) - (d > 14 ? 0.2 : 0) });
  const flat = makeRuns({ releaseAt: REL, seed: 2, rate: (d, s, i) => taskBase(i) });
  const ed = evaluateSeries(drop, { releaseAt: REL, asOf: AS_OF });
  const ef = evaluateSeries(flat, { releaseAt: REL, asOf: AS_OF });
  assert.strictEqual(ed.decision.clears, true, ed.decision.reason);
  assert.strictEqual(ed.verdict.kind, 'lower');
  assert.match(ed.verdict.headline, /points lower than launch week/);
  assert.strictEqual(ef.decision.clears, false);
  assert.strictEqual(ef.verdict.headline, null);
  assert.strictEqual(ef.verdict.text, 'within normal variation');
});

test('series never aggregate across app, effort, access path or track (R-26, Amendment 2)', () => {
  const base = { releaseAt: REL, days: 10, runsPerDay: 1 };
  const runs = [
    ...makeRuns({ ...base, prefix: 'a' }),
    ...makeRuns({ ...base, prefix: 'b', effort: 'high' }),
    ...makeRuns({ ...base, prefix: 'c', access_path: 'api' }),
    ...makeRuns({ ...base, prefix: 'd', track: 'frozen' }),
    ...makeRuns({ ...base, prefix: 'e', app: 'codex-cli' }),
    ...makeRuns({ ...base, prefix: 'f', app: 'codex-desktop' }),
    ...makeRuns({ ...base, prefix: 'g', account_source: 'donated' }),
  ];
  const g = groupBySeries(runs);
  assert.strictEqual(g.size, 6);
  assert.strictEqual(g.get('claude-code|fx-model|default|subscription|latest').length, 20);
  assert.throws(() => evaluateSeries(runs, { releaseAt: REL, asOf: AS_OF }), /refusing to aggregate/);
  const all = evaluateAll(runs, { releaseAtByModel: { 'fx-model': REL }, asOf: AS_OF });
  for (const [k, e] of Object.entries(all)) {
    assert.ok(e.baseline.run_ids.every((id) => g.get(k).some((r) => r.run_id === id)));
  }
  assert.strictEqual(seriesKey(runs[0]), 'claude-code|fx-model|default|subscription|latest');
});

test('rotation: chart joins the two sets and the verdict chains through the overlap (R-16)', () => {
  const sets = [{ id: 'fx-a', n: 60, fromDay: 1, toDay: 20 }, { id: 'fx-b', n: 60, fromDay: 14, toDay: 999 }];
  const harder = (d, s, i) => (s === 'fx-b' ? Math.max(0.02, taskBase(i) - 0.15) : taskBase(i));
  const steady = makeRuns({ releaseAt: REL, sets, rate: harder });
  const e = evaluateSeries(steady, { releaseAt: REL, asOf: AS_OF });
  assert.match(e.decision.path, /chained fx-a > fx-b/);
  assert.strictEqual(e.verdict.text, 'within normal variation');
  assert.strictEqual(e.chart.joins.length, 1);
  assert.ok(e.chart.joins[0].overlap_runs >= 14);
  const days = e.chart.points.map((p) => p.day);
  assert.deepStrictEqual(days, Array.from({ length: 30 }, (_, i) => i + 1));
  const before = e.chart.points.filter((p) => p.day <= 13).map((p) => p.rate);
  const after = e.chart.points.filter((p) => p.day >= 21).map((p) => p.rate);
  const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  assert.ok(Math.abs(avg(before) - avg(after)) < 0.05, `joined levels differ: ${avg(before)} vs ${avg(after)}`);
  const dropping = makeRuns({ releaseAt: REL, sets, seed: 5, rate: (d, s, i) => harder(d, s, i) - (d > 22 ? 0.2 : 0) });
  const e2 = evaluateSeries(dropping, { releaseAt: REL, asOf: AS_OF });
  assert.strictEqual(e2.decision.clears, true, e2.decision.reason);
});

test('chart data carries a band on every point and day one as its own point (R-23, R-25)', () => {
  const e = evaluateSeries(makeRuns({ releaseAt: REL }), { releaseAt: REL, asOf: AS_OF });
  assert.ok(e.chart.points.length > 0);
  for (const p of e.chart.points) assert.ok(p.lower <= p.rate && p.rate <= p.upper);
  assert.strictEqual(e.chart.day_one.day, 1);
  assert.strictEqual(e.chart.day_one.label, 'day one');
  assert.ok(e.chart.baseline_band.lower < e.chart.baseline_band.upper);
});

test('no verdict template attributes intent (N-10)', () => {
  for (const t of Object.values(TEMPLATES)) assert.deepStrictEqual(containsBanned(t), []);
  for (const d of [-0.3, -0.06, 0.06, 0.3]) assert.deepStrictEqual(containsBanned(verdict({ clears: true, delta: d }).text), []);
  assert.deepStrictEqual(containsBanned('Model nerfed on purpose'), ['nerf', 'on purpose']);
});
