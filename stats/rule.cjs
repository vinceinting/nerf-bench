'use strict';
// The parameters of the published rule, stats/RULE.md. Change them only with a dated amendment there.
module.exports = Object.freeze({
  rule_version: '2026-09-13',
  baseline_days: 7,          // days 1 to 7 after the official release timestamp, pooled, then frozen
  current_days: 7,           // the comparison window: the 7 days ending at evaluation time
  alpha: 0.01,               // two-sided; the verdict uses a 99% interval
  min_effect: 0.05,          // at least 5 percentage points of pass rate
  min_runs: 3,               // in the baseline and in the current window
  min_tasks_per_link: 20,    // tasks shared by the two windows of each paired comparison
  bootstrap_reps: 10000,
  seed: 20260913,
  band_z: 1.959964,          // chart band: Wilson 95% interval on the day's pooled task attempts
});
