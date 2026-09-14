'use strict';
// Bridging a task rotation (R-16). During overlap every run executes both the outgoing and the
// incoming set, so the two sets' levels can be compared on the same runs and joined.
const { perTask, pooledRate } = require('./baseline.cjs');

const setsOf = (run) => [...new Set(run.tasks.map((t) => t.set_id))];

// Set ids in order of first appearance.
function setOrder(runs) {
  const first = new Map();
  for (const r of [...runs].sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at))) {
    for (const s of setsOf(r)) if (!first.has(s)) first.set(s, Date.parse(r.started_at));
  }
  return [...first.keys()];
}

// Runs that executed both sets.
function overlapRuns(runs, a, b) {
  return runs.filter((r) => { const s = setsOf(r); return s.includes(a) && s.includes(b); });
}

function restrict(pt, setId) {
  const out = {};
  for (const [k, v] of Object.entries(pt)) if (k.startsWith(`${setId}/`)) out[k] = v;
  return out;
}

// Level offsets per set relative to the first set: adding offset[s] to a raw rate on set s puts it
// on the first set's scale. offset(next) = offset(prev) + rate_prev(overlap) - rate_next(overlap).
function offsets(runs) {
  const order = setOrder(runs);
  const off = { [order[0]]: 0 };
  const joins = [];
  for (let i = 1; i < order.length; i += 1) {
    const a = order[i - 1]; const b = order[i];
    const o = overlapRuns(runs, a, b);
    if (o.length === 0) { joins.push({ from: a, to: b, overlap_runs: 0, offset: null }); off[b] = null; continue; }
    const pt = perTask(o);
    const ra = pooledRate(restrict(pt, a)); const rb = pooledRate(restrict(pt, b));
    off[b] = off[a] === null ? null : off[a] + ra - rb;
    joins.push({ from: a, to: b, overlap_runs: o.length, offset: off[b] });
  }
  return { order, offsets: off, joins };
}

module.exports = { setOrder, overlapRuns, restrict, offsets, setsOf };
