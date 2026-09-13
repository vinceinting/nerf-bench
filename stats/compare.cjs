'use strict';
// The comparison behind the verdict (stats/RULE.md). A "link" pairs two windows on the same tasks;
// its effect is the mean over shared tasks of (pass rate in the later window minus the earlier one).
// Across a task rotation the links chain through the overlap period: the total change is the sum.
// The interval is a seeded percentile bootstrap that resamples tasks within each link.
const RULE = require('./rule.cjs');

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a, b: per-task maps { key: { pass, n } }. Returns the per-task differences on shared keys.
function link(a, b) {
  const diffs = [];
  for (const k of Object.keys(a).sort()) {
    if (b[k] && a[k].n > 0 && b[k].n > 0) diffs.push(b[k].pass / b[k].n - a[k].pass / a[k].n);
  }
  return diffs;
}

const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

function quantile(sorted, q) {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i); const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

// links: arrays of per-task differences. Returns { delta, lower, upper, tasks_per_link }.
function bootstrap(links, { reps = RULE.bootstrap_reps, seed = RULE.seed, alpha = RULE.alpha } = {}) {
  if (links.length === 0 || links.some((l) => l.length === 0)) return { delta: null, lower: null, upper: null, tasks_per_link: links.map((l) => l.length) };
  const delta = links.reduce((s, l) => s + mean(l), 0);
  const rand = mulberry32(seed);
  const stats = new Float64Array(reps);
  for (let r = 0; r < reps; r += 1) {
    let total = 0;
    for (const l of links) {
      let s = 0;
      for (let i = 0; i < l.length; i += 1) s += l[Math.floor(rand() * l.length)];
      total += s / l.length;
    }
    stats[r] = total;
  }
  const sorted = Array.from(stats).sort((x, y) => x - y);
  return { delta, lower: quantile(sorted, alpha / 2), upper: quantile(sorted, 1 - alpha / 2), tasks_per_link: links.map((l) => l.length) };
}

// Applies the rule. Returns { clears, reason, delta, lower, upper, ... }.
function decide(result, { baselineRuns, currentRuns }) {
  const base = { ...result, alpha: RULE.alpha, min_effect: RULE.min_effect, rule_version: RULE.rule_version };
  if (baselineRuns < RULE.min_runs) return { ...base, clears: false, reason: `baseline has ${baselineRuns} runs, rule needs ${RULE.min_runs}` };
  if (currentRuns < RULE.min_runs) return { ...base, clears: false, reason: `current window has ${currentRuns} runs, rule needs ${RULE.min_runs}` };
  if (result.delta === null || result.tasks_per_link.some((n) => n < RULE.min_tasks_per_link)) return { ...base, clears: false, reason: `fewer than ${RULE.min_tasks_per_link} shared tasks in a link` };
  const excludesZero = result.lower > 0 || result.upper < 0;
  if (!excludesZero) return { ...base, clears: false, reason: `the ${Math.round((1 - RULE.alpha) * 100)}% interval includes zero` };
  if (Math.abs(result.delta) < RULE.min_effect) return { ...base, clears: false, reason: `change smaller than ${RULE.min_effect * 100} points` };
  return { ...base, clears: true, reason: 'rule clears' };
}

module.exports = { link, bootstrap, decide, mulberry32, mean };
