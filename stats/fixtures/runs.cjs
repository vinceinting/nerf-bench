'use strict';
// FIXTURE ONLY. Synthetic run records (schema/run-record.schema.json shape) for tests and prd-cells.
const { mulberry32 } = require('../compare.cjs');

const DAY = 86400000;

// sets: [{ id, n, fromDay, toDay }] (days inclusive, 1-based); rate(day, setId, i) -> pass probability.
function makeRuns({ app = 'claude-code', model = 'fx-model', effort = 'default', access_path = 'subscription', track = 'latest',
  account_source = 'self-paid', releaseAt = '2026-06-01T00:00:00Z', days = 30, runsPerDay = 2, sets = [{ id: 'fx-set-a', n: 60, fromDay: 1, toDay: 999 }],
  rate = () => 0.6, seed = 1, prefix = 'fx' } = {}) {
  const rand = mulberry32(seed);
  const start = Date.parse(releaseAt);
  const runs = [];
  for (let d = 1; d <= days; d += 1) {
    for (let k = 0; k < runsPerDay; k += 1) {
      const t0 = start + (d - 1) * DAY + Math.floor(((k + 0.5) * DAY) / runsPerDay);
      const tasks = [];
      for (const s of sets) {
        if (d < s.fromDay || d > s.toDay) continue;
        for (let i = 0; i < s.n; i += 1) {
          tasks.push({ task_id: `fx-${String(i).padStart(3, '0')}`, set_id: s.id, pass: rand() < rate(d, s.id, i), tokens_in: null, tokens_out: null, tool_calls: null, duration_s: 1, transcript_sha256: '0'.repeat(64) });
        }
      }
      const passed = tasks.filter((t) => t.pass).length;
      runs.push({
        schema_version: 1, run_id: `${prefix}-${d}-${k}`, started_at: new Date(t0).toISOString(), ended_at: new Date(t0 + 3600000).toISOString(),
        app: { id: app, version: 'fx', installer: 'fixture', track }, model, effort, effort_is_default: effort === 'default', access_path, account_source,
        contributor: 'fixture-user', floor: false, machine: { hosted: true, os: 'linux', image: 'fixture' },
        fingerprint: { value: `sha256:${'0'.repeat(64)}`, paths: [] }, deviations: ['commands auto-approved', 'web access blocked'],
        task_sets: [...new Set(tasks.map((t) => t.set_id))].map((id) => ({ id, version: '1', fingerprint: `sha256:${'0'.repeat(64)}` })),
        tasks, totals: { passed, total: tasks.length, tokens_in: null, tokens_out: null, cost_usd: null, tool_calls: null, duration_s: tasks.length },
        workflow: { repository: 'vinceinting/nerf-bench', path: '.github/workflows/run.yml', commit: '0'.repeat(40), caller_repository: 'fixture/nerf-bench' },
        scorer_commit: '0'.repeat(40),
      });
    }
  }
  return runs;
}

// Per-task difficulty so paired comparisons behave like real sets: task i has its own base rate.
const taskBase = (i) => 0.15 + 0.7 * (((i * 7919) % 97) / 96);

module.exports = { makeRuns, taskBase, DAY };
