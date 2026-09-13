# W-B build notes: tasks, scoring, statistics

Started 2026-09-13. Worktree build/W-B from a129ff8.

## Plan
- tasks/: fingerprint.cjs (schema def), harvester.cjs (sources: github via gh api, local git fixture), store.cjs (selection R-69, rotation R-16, serve R-68), rotation.json (A13 default: 28 days, 7 overlap), benchmark-denylist.json (N-02).
- scoring/grade.cjs: runs a task's check command, pass or fail only.
- stats/: RULE.md, rule.cjs, baseline.cjs, compare.cjs (bootstrap), chain.cjs (rotation join), verdict.cjs, chart.cjs (bands, day one), series.cjs.
- Cells: R-12 R-13 R-14 R-15 R-16 R-19 R-22 R-24 R-26 R-69 N-02 N-10.

## Log
- Wrote all modules, fixtures (tasks/fixtures, stats/fixtures), tests (13).
- Bug found: child `node --test` inherits NODE_TEST_CONTEXT from a parent test runner and exits 0 on failure; grade.cjs strips it. Fixture check path fixed (check/ overlays onto the workdir root).
- Tests 13/13 pass. Commit 8883019.
- Cells first run: pass R-12 R-16 R-22 R-24 R-26 R-69 N-10. R-14 failed on its own scan (the word "judge" in a comment); comment reworded.
- Honest failures: R-13, N-02 (no real store or active set yet), R-15 (no real store, no published fingerprints, no public results), R-19 (RULE.md committed; no public result exists yet to order against).
- prd-verify before R-14 fix: 7 passed, 78 failed, of 85 live.
- Not done: no real harvested set (needs picking repos with runnable test commands and hand selection); live GitHub harvest path written but only the fixture path exercised by the cell (R-12 --live=owner/repo runs it).
- Overlap to name: R-15 and R-19 read site/data (W-D): expected site/data/task-sets.json [{id, version, fingerprint, published_at}], site/data/**/result.json, site/data/retired-sets/<id>/<version>/. A root .gitattributes forcing LF for retired set files would keep recomputed fingerprints stable under core.autocrlf (root not owned by W-B).
