'use strict';
// Baseline (R-24, anchored per Amendment 16): the runs started in the 7 days after the model's
// official release timestamp, pooled per task, then frozen. Runs outside the window never enter it,
// and a frozen baseline is returned unchanged whatever arrives later.
const crypto = require('crypto');
const RULE = require('./rule.cjs');

const DAY = 86400000;
const taskKey = (t) => `${t.set_id}/${t.task_id}`;

function inWindow(runs, start, end) {
  return runs.filter((r) => { const t = Date.parse(r.started_at); return t >= start && t < end; });
}

// { key: { pass, n } } over every task attempt in the runs.
function perTask(runs) {
  const m = {};
  for (const r of runs) for (const t of r.tasks) {
    const k = taskKey(t);
    if (!m[k]) m[k] = { pass: 0, n: 0 };
    m[k].n += 1;
    if (t.pass === true) m[k].pass += 1;
  }
  return m;
}

function pooledRate(pt) {
  let p = 0; let n = 0;
  for (const v of Object.values(pt)) { p += v.pass; n += v.n; }
  return n ? p / n : null;
}

function digestOf(b) {
  const body = JSON.stringify({ w: [b.window_start, b.window_end], ids: b.run_ids, pt: Object.keys(b.per_task).sort().map((k) => [k, b.per_task[k]]) });
  return crypto.createHash('sha256').update(body).digest('hex');
}

// computeBaseline(runs, releaseAt, { asOf, frozen }) -> baseline object.
// When `frozen` is given it is returned as-is (after checking its digest).
function computeBaseline(runs, releaseAt, { asOf, frozen } = {}) {
  if (frozen) {
    if (digestOf(frozen) !== frozen.digest) throw new Error('baseline: frozen baseline digest mismatch');
    return frozen;
  }
  const start = Date.parse(releaseAt);
  if (Number.isNaN(start)) throw new Error('baseline: releaseAt must be the official release timestamp');
  const end = start + RULE.baseline_days * DAY;
  const w = inWindow(runs, start, end);
  const b = {
    release_at: new Date(start).toISOString(),
    window_start: new Date(start).toISOString(),
    window_end: new Date(end).toISOString(),
    run_ids: w.map((r) => r.run_id).sort(),
    runs: w.length,
    per_task: perTask(w),
  };
  b.pooled_rate = pooledRate(b.per_task);
  b.complete = asOf ? Date.parse(asOf) >= end : false;
  b.digest = digestOf(b);
  return b;
}

// Freezes a baseline once its window has closed. The site stores the result and passes it back as `frozen`.
function freezeBaseline(b, asOf) {
  if (Date.parse(asOf) < Date.parse(b.window_end)) throw new Error('baseline: window still open, cannot freeze');
  return { ...b, complete: true, frozen_at: new Date(asOf).toISOString() };
}

module.exports = { computeBaseline, freezeBaseline, perTask, pooledRate, inWindow, taskKey, DAY };
