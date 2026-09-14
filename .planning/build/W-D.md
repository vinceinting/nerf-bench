# W-D build notes (public data, methodology, verifier, markers)

Branch build/W-D from a129ff8. Ids: R-17, R-18, R-20, R-21, R-44..R-49, N-12, R-57, R-58.

## Done means
Code plus `node --test` suites pass; each owned prd-cell run with exit read back; prd-verify summary recorded.

## Log
- Read PRD + amendments, schema, context. Probed feeds 2026-09-13:
  - npm @anthropic-ai/claude-code 200, npm @openai/codex 200, GitHub openai/codex releases 200.
  - xai-org/grok-build GitHub releases: 200 but EMPTY list; npm has no grok-build. No official Grok Build release feed found.
  - Desktop apps (claude-desktop, codex-desktop): no official public release feed found yet.
  - Status: status.claude.com and status.openai.com /api/v2/incidents.json 200. status.x.ai is behind a Cloudflare challenge (5xx page to curl).
  - Model releases: openai.com/news/rss.xml 200; anthropic.com/news HTML 200 (time + h4 title beside link); x.ai/news returns nothing to a script.
- Built: markers/ (types, append-only store, affects, jobs for app/model/status feeds and project events, run.cjs), site/data/ (append-only content-addressed run store, build.cjs per-series JSON, publish-retired.cjs, stats adapter), site/methodology/ (template + settings.json + build.cjs + checks.cjs -> index.html), tools/verify/verify.cjs.
- Tests: `node --test markers/test/markers.test.cjs site/data/test/data.test.cjs site/methodology/test/methodology.test.cjs tools/verify/test/verify.test.cjs` -> 27 pass, 0 fail.
- Ran `node markers/run.cjs feeds --since-days 90`: 91 app releases, 15 model releases, 75 status incidents stored (181 markers). x.ai/news and status.x.ai both HTTP 403 to a script (Cloudflare).

## Cell exits (read back after commit 32a2388)
- PASS 0: R-18, R-21, R-47, R-48, R-49, N-12.
- FAIL 1, honestly: R-17 and R-58 (local publish passes; no deployment 2 at NERF_PUBLIC_VERIFY_URL), R-20 (content present; no deployment 2 and no earliest public result), R-44 (claude-code and codex-cli markers fine; no official feed for grok-build, codex-desktop, claude-desktop), R-45 and R-46 (anthropic and openai fine; x.ai/news and status.x.ai return 403), R-57 (no published run with a real attestation exists).
- prd-verify: 6 passed, 79 failed, 0 could-not-answer, of 85 live cells; 1 retired.

## Stats interface assumed (W-B, stats/index.cjs)
`computeSeries({ runs: [{started_at, passed, total}] /* one series key */, releaseAt }) -> { baseline:{from,to,rate,n,frozen}, dayOne:{date,rate,n}, points:[{date,rate,n,lower,upper}], verdict:{headline|null,text} }`.
site/data/lib/stats-adapter.cjs uses it when stats/index.cjs exists, else a labelled Wilson stand-in (`stats_source` in every output says which).

## Scoring interface assumed (W-B, scoring/index.cjs), used by the verifier's regrade
`gradeAnswer({ taskDir, transcriptPath }) -> { pass }`; fallback runs the published task's `check.cjs <transcript>`.

## Decisions
- Rotation interval: 28 days, overlap 7 days, the build's choice (Amendment 13). Lives in site/methodology/settings.json because W-D may not write config/ or tasks/; OVERLAP: tasks/rotation (W-B) must read this one setting, or it moves to config/ at merge.
- Frozen schedule value is owned by W-A (config/frozen-versions); the page shows the label and, if config/frozen-versions.json has `schedule`, its value.
- Deployment-dependent cells read NERF_PUBLIC_VERIFY_URL (deployment 2), NERF_EARLIEST_PUBLIC_RESULT, NERF_PUBLISHED_CURRENT_RUN / NERF_PUBLISHED_RETIRED_RUN / NERF_PUBLISHED_RETIRED_DIR, and fail while unset.
- Published retired layout: <out>/retired/<set>/{manifest.json, tasks/**, transcripts/<run_id>/<task_id>.jsonl}; served at <site>/data/retired/...
