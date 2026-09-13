'use strict';
// Series (R-26 as amended by Amendment 2): key = app|model|effort|access_path|track, per
// schema/run-record.md. Every computation takes the runs of ONE key; mixing keys throws.
// Account source and task set do not split a series (R-59, Amendment 8).
const RULE = require('./rule.cjs');
const { computeBaseline, perTask, inWindow, DAY } = require('./baseline.cjs');
const { link, bootstrap, decide } = require('./compare.cjs');
const { setOrder, overlapRuns, restrict } = require('./chain.cjs');
const { verdict } = require('./verdict.cjs');
const { chartData } = require('./chart.cjs');

function seriesKey(r) {
  const parts = [r.app && r.app.id, r.model, r.effort, r.access_path, r.app && r.app.track];
  if (parts.some((p) => typeof p !== 'string' || p === '' || p.includes('|'))) throw new Error(`series: run ${r.run_id} lacks a complete key`);
  return parts.join('|');
}

function groupBySeries(runs) {
  const m = new Map();
  for (const r of runs) {
    const k = seriesKey(r);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}

function assertOneKey(runs) {
  const keys = new Set(runs.map(seriesKey));
  if (keys.size > 1) throw new Error(`series: refusing to aggregate across keys: ${[...keys].join(', ')}`);
  return [...keys][0];
}

const mostTasks = (pt) => {
  const c = {};
  for (const k of Object.keys(pt)) { const s = k.split('/')[0]; c[s] = (c[s] || 0) + 1; }
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0];
};

// Paired links from the baseline to the current window, chained through overlaps if the set rotated.
function buildLinks(runs, B, C) {
  const direct = link(B, C);
  if (direct.length >= RULE.min_tasks_per_link) return { links: [direct], path: 'direct' };
  const order = setOrder(runs);
  const s0 = mostTasks(B); const sk = mostTasks(C);
  const i0 = order.indexOf(s0); const ik = order.indexOf(sk);
  if (!s0 || !sk || i0 < 0 || ik <= i0) return { links: [direct], path: 'direct' };
  const links = [];
  let prev = restrict(B, s0);
  for (let i = i0; i < ik; i += 1) {
    const o = overlapRuns(runs, order[i], order[i + 1]);
    if (o.length === 0) return { links: [[]], path: 'broken chain' };
    const pt = perTask(o);
    links.push(link(prev, restrict(pt, order[i])));
    prev = restrict(pt, order[i + 1]);
  }
  links.push(link(prev, restrict(C, sk)));
  return { links, path: `chained ${order.slice(i0, ik + 1).join(' > ')}` };
}

// evaluateSeries(runs, { releaseAt, asOf, frozenBaseline }) -> { key, baseline, decision, verdict, chart }
function evaluateSeries(runs, { releaseAt, asOf, frozenBaseline } = {}) {
  const key = assertOneKey(runs);
  const now = Date.parse(asOf);
  if (Number.isNaN(now)) throw new Error('series: asOf is required');
  const baseline = computeBaseline(runs, releaseAt, { asOf, frozen: frozenBaseline });
  const chart = chartData(runs, { releaseAt, asOf, seriesKey: key, baseline });
  if (now < Date.parse(baseline.window_end)) {
    const decision = { clears: false, reason: 'launch week still open', delta: null };
    return { key, baseline, decision, verdict: verdict(decision), chart };
  }
  const curStart = Math.max(now - RULE.current_days * DAY, Date.parse(baseline.window_end));
  const cur = inWindow(runs, curStart, now);
  const C = perTask(cur);
  const { links, path } = buildLinks(runs.filter((r) => Date.parse(r.started_at) < now), baseline.per_task, C);
  const decision = { ...decide(bootstrap(links), { baselineRuns: baseline.runs, currentRuns: cur.length }), path, current_window: [new Date(curStart).toISOString(), new Date(now).toISOString()] };
  return { key, baseline, decision, verdict: verdict(decision), chart };
}

// evaluateAll(runs, { releaseAtByModel, asOf, frozenByKey }) -> { [key]: evaluation }
function evaluateAll(runs, { releaseAtByModel, asOf, frozenByKey = {} }) {
  const out = {};
  for (const [key, rs] of groupBySeries(runs)) {
    const model = key.split('|')[1];
    if (!releaseAtByModel[model]) throw new Error(`series: no official release timestamp for ${model}`);
    out[key] = evaluateSeries(rs, { releaseAt: releaseAtByModel[model], asOf, frozenBaseline: frozenByKey[key] });
  }
  return out;
}

module.exports = { seriesKey, groupBySeries, evaluateSeries, evaluateAll, assertOneKey, buildLinks };
