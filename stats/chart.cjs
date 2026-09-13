'use strict';
// Chart data for one series (R-23 band data, R-25 day-one point, R-16 join across rotation).
// Day d covers [release + (d-1) days, release + d days). Days with no runs are absent, never invented.
const RULE = require('./rule.cjs');
const { DAY, taskKey } = require('./baseline.cjs');
const { offsets } = require('./chain.cjs');

function wilson(pass, n, z = RULE.band_z) {
  if (n === 0) return { lower: null, upper: null };
  const p = pass / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { lower: Math.max(0, c - h), upper: Math.min(1, c + h) };
}

const clamp = (x) => Math.min(1, Math.max(0, x));

// A point from a group of runs: raw pooled rate per set, joined onto the first set's scale.
function point(runs, off) {
  const bySet = {};
  for (const r of runs) for (const t of r.tasks) {
    const s = (bySet[t.set_id] ||= { pass: 0, n: 0 });
    s.n += 1; if (t.pass === true) s.pass += 1;
  }
  let pass = 0; let n = 0; let adj = 0;
  for (const [set, v] of Object.entries(bySet)) {
    const o = off[set];
    if (o === null || o === undefined) continue; // a set that cannot be joined is left out, and said so in joins
    pass += v.pass; n += v.n; adj += v.pass + o * v.n;
  }
  if (n === 0) return null;
  const raw = pass / n;
  const rate = clamp(adj / n);
  const w = wilson(pass, n);
  const shift = rate - raw;
  return { rate, raw_rate: raw, lower: clamp(w.lower + shift), upper: clamp(w.upper + shift), runs: runs.length, attempts: n, sets: Object.keys(bySet).sort() };
}

// chartData(runs, { releaseAt, asOf, seriesKey, baseline }) -> { series_key, release_at, day_one, points, baseline_band, joins }
function chartData(runs, { releaseAt, asOf, seriesKey, baseline }) {
  const start = Date.parse(releaseAt);
  const end = asOf ? Date.parse(asOf) : Infinity;
  const usable = runs.filter((r) => { const t = Date.parse(r.started_at); return t >= start && t < end; });
  const { offsets: off, joins } = usable.length ? offsets(usable) : { offsets: {}, joins: [] };
  const byDay = new Map();
  for (const r of usable) {
    const d = Math.floor((Date.parse(r.started_at) - start) / DAY) + 1;
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(r);
  }
  const points = [...byDay.keys()].sort((a, b) => a - b).map((d) => {
    const p = point(byDay.get(d), off);
    return p && { day: d, date: new Date(start + (d - 1) * DAY).toISOString().slice(0, 10), label: d === 1 ? 'day one' : null, ...p };
  }).filter(Boolean);
  const dayOne = points.find((p) => p.day === 1) || null;
  let baselineBand = null;
  if (baseline && baseline.per_task) {
    let pass = 0; let n = 0;
    for (const [k, v] of Object.entries(baseline.per_task)) { if (k) { pass += v.pass; n += v.n; } }
    if (n) baselineBand = { rate: pass / n, ...wilson(pass, n), window_start: baseline.window_start, window_end: baseline.window_end };
  }
  return { series_key: seriesKey, release_at: new Date(start).toISOString(), band: 'Wilson 95% on pooled task attempts', day_one: dayOne, points, baseline_band: baselineBand, joins };
}

module.exports = { chartData, wilson, point, taskKey };
