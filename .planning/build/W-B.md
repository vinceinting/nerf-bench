# W-B build notes: tasks, scoring, statistics

Started 2026-09-13. Worktree build/W-B from a129ff8.

## Plan
- tasks/: fingerprint.cjs (schema def), setfmt.cjs, harvester.cjs (sources: github via gh api, local git fixture), selection.cjs (R-69), rotation.cjs + rotation.json (R-16, A13), store.cjs (R-68 store side).
- scoring/grade.cjs: runs a task's check command, pass or fail only.
- stats/: RULE.md, series.cjs, baseline.cjs, compare.cjs (bootstrap), verdict.cjs, chart.cjs (bands, day one).
- Cells: R-12 R-13 R-14 R-15 R-16 R-19 R-22 R-24 R-26 R-69 N-02 N-10.

## Log
