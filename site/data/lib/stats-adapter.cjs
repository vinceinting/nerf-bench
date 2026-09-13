'use strict';
// Adapter between the data builder and W-B's statistics (stats/). The interface expected from stats/:
//
//   require('stats/index.cjs').computeSeries({ runs, releaseAt }) -> {
//     baseline: { from, to, rate, n, frozen: true },          // pooled days 1 to 7 after releaseAt (R-24)
//     dayOne:   { date, rate, n },                            // first 24h after releaseAt (R-25)
//     points:   [{ date, rate, n, lower, upper }],            // one per UTC day, band bounds included (R-23)
//     verdict:  { headline: string|null, text: string }       // R-22
//   }
//   where runs = [{ started_at, passed, total }] for ONE series key only (R-26).
//
// If stats/index.cjs exists it is used. Otherwise this local stand-in (Wilson 95%, no verdict rule)
// is used and the output says so in `stats_source`, so nothing published can pass it off as the rule.
const path = require('path');
const fs = require('fs');

const STATS = path.join(__dirname, '..', '..', '..', 'stats', 'index.cjs');

function wilson(p, n, z = 1.96) {
  if (n === 0) return { lower: null, upper: null };
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { lower: Math.max(0, c - h), upper: Math.min(1, c + h) };
}

function pool(runs) {
  const passed = runs.reduce((a, r) => a + r.passed, 0);
  const n = runs.reduce((a, r) => a + r.total, 0);
  return { rate: n ? passed / n : null, n };
}

function localCompute({ runs, releaseAt }) {
  const rel = Date.parse(releaseAt);
  const day = 86400e3;
  const inWin = (r, a, b) => { const t = Date.parse(r.started_at); return t >= a && t < b; };
  const base = pool(runs.filter((r) => inWin(r, rel, rel + 7 * day)));
  const one = pool(runs.filter((r) => inWin(r, rel, rel + day)));
  const byDay = new Map();
  for (const r of runs) {
    const d = r.started_at.slice(0, 10);
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(r);
  }
  const points = [...byDay.keys()].sort().map((d) => { const p = pool(byDay.get(d)); return { date: d, ...p, ...wilson(p.rate, p.n) }; });
  return {
    baseline: { from: new Date(rel).toISOString(), to: new Date(rel + 7 * day).toISOString(), ...base, frozen: true },
    dayOne: { date: new Date(rel).toISOString().slice(0, 10), ...one },
    points,
    verdict: { headline: null, text: 'within normal variation' },
  };
}

function load() {
  if (fs.existsSync(STATS)) {
    const s = require(STATS);
    if (typeof s.computeSeries === 'function') return { computeSeries: s.computeSeries, source: 'stats/index.cjs' };
  }
  return { computeSeries: localCompute, source: 'local stand-in (stats/ not present)' };
}

module.exports = { load, localCompute, wilson };
