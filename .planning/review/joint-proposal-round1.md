# Joint proposal, round 1

run: c-mu06ff7r-mfcm66
series: prd-nerf-bench-review-2026-09-13
seats: astra 5891eaad-229b-4797-aeff-912b16b954fb, fable 376f4e1b-52ae-4839-97e2-ea477e79c568, grok c29e8493-238c-4a36-a703-a99776ac7fd1

Amendments the three seats agree the PRD needs. Product forks for Vince are listed, not decided.

## Amendments

### attest-boundary (high, astra A1)
R-06 / R-28 / N-05 MUST bind more than workflow path and commit. Acceptance MUST also require: the attested source digest matches the official published commit; checkout/task/scorer inputs are the official ones; GitHub-hosted runners only (deny self-hosted); no reused or pre-placed result artifact. Negative controls on a contributor-owned fork: mutated checkout with unchanged workflow file; unauthorized runner; reused artifact. Each MUST be rejected.

### series-app-key (high, astra A2)
R-26 series key MUST include app. Cell MUST vary only app (e.g. Codex CLI vs Codex Windows) and fail if those runs share a series. Baselines and verdicts stay per app.

### world-public-data (high, astra A3, fable M3)
Verification world MUST name a third surface: a disposable public fixture deployment (synthetic identities and data, never dry-run data). Cells that need public or served fixture data (R-17, R-31, R-32, R-41, R-50..R-53, R-56, R-58, R-59, N-09, N-11, and any other public-record cell) run there. Staging stays authenticated dry-run only. N-14 still forbids publishing dry-run data.

### r57-hidden-recompute (high, astra A3, fable H1)
R-57 MUST split: (a) signature verify for any published run without the site; (b) score recompute only for runs whose tasks have retired and whose checks are public. Current-set runs MUST NOT require unpublished tasks to recompute. Cell MUST fail if it needs current hidden tasks.

### every-app-coverage (high, astra A4)
R-07, R-09, N-01, R-29, R-30 (and any "every run" clean-run claim) MUST be proved for each of the five launch apps, or split into per-app requirements. One-run cells MUST NOT stand for all apps. Dirty-config and attempted-web negatives on each app.

### desktop-on-github (high, grok H1/H10, fable M1)
R-04 and R-05 MUST require the same GitHub-hosted sealed path as R-01..R-03, on GitHub-hosted Windows where the app needs Windows. R-27 MUST prove the copy-and-run flow for each of the five apps, or split into per-app cells. If a desktop app cannot run on GitHub-hosted machines, that is a phase-1 fail, not an off-GitHub pass.

### r66-meta (high, grok H2, astra A10, fable M5)
Retire R-66 (amendment `retired: R-66`). Simultaneity is `prd-verify.cjs` exiting 0 against the named world, with live side-effecting cells (R-09, R-27, R-32, R-35, R-63, etc.) executed once. Do not wrap the matrix in a cell that re-runs it.

### default-effort-headline (medium, astra A5)
R-42 (or a sibling) MUST bind the home-card comparison and verdict to the default-effort series. Cell MUST include a competing non-default series with a different trend and fail if the card uses it as the headline.

### handpick-selection (medium, astra A6, grok H4)
New requirement: an active set MUST be a recorded human selection from harvester candidates (D-13). Cell reads that record unattended (who, which candidates, when) and fails on automatic promotion of the whole harvest.

### all-tiers-catalog (medium, astra A6, grok H5)
R-34 MUST require the catalog to include, as community-runnable, successors of the named tiers (OpenAI astra/sol/terra/luna and Anthropic equivalents, plus xAI's corresponding tiers once named). Floor eligibility stays newest flagship only (D-38). Cell fails if a named-tier successor is missing from the catalog while listed as a lab the runner supports.

### r11-self-report (medium, astra A7, grok H6, fable M4)
R-11 cell MUST NOT treat this PRD as proof. Independent record of Vince's pick (e.g. `design/chosen.md` or git note) bound to the exact concept version. Ordering: pick before phase-4 public site surfaces (R-41 onward), NOT before the first `site/` commit, so phase-2 methodology under `site/methodology` does not deadlock the cell.

### r18-approval-gate (medium, grok H7, astra A7)
R-18 MUST NOT invent a propose-and-approve process. Keep: one published setting, shown on the methodology page. Interval value remains undecided (A1); the build MUST NOT invent a number. Put the interval to Vince as a product fork (below). Until he answers, the cell asserts a single setting exists and is displayed, not a specific duration.

### grok-grounding (medium, grok H8)
Strike Apache 2.0 and github.com/xai-org/grok-build from Grounding unless a cited primary source states them. Keep: product name Grok Build, headless `-p`, SuperGrok / X Premium Plus, curl installer, from x.ai/news/grok-build-cli. R-03 still proves the unattended run.

### n03-live-tasks (medium, grok H9)
Verification world MUST isolate R-09's live fetch-task (and any other probe task) from the current published/active set that N-03 searches. R-17 publishes retired sets only; those texts MUST NOT be in the current set N-03 greps.

### frozen-schedule (medium, astra A8)
R-30 (or a sibling) MUST prove the frozen pin moves only on the published schedule: no early movement; a scheduled advance occurs and is marked (ties to R-47).

### release-date-baseline (medium, astra A9)
R-63, R-64, R-65, N-14 MUST bind baseline window and pre-launch ineligibility to the official flagship release timestamp, not the switch timestamp. Cell MUST include a delayed-switch case: switch after release day still starts baseline at release, and does not drop the triggering flagship.

### methodology-timing-nav (medium, astra A11, fable M9)
Methodology page (R-20, R-21, and D-35/A1 statements) MUST be public before the first public result (same timing bar as R-19) and reachable by click from the home page. Cell: git/history timing plus real-entry navigation.

### api-key-owner (medium, fable M2)
Verification world MUST name who owns the API key for R-29's API-path run (test-account donated key, or other named owner). MUST NOT imply Vince's floor pays API at launch (D-39).

### same-task-set (medium, fable M7)
New requirement: floor and contributor runs of the same series key MUST execute the same current active set. Series key MUST include task-set identity (fingerprint). Delivery of the hidden set into a contributor GitHub copy MUST be specified so N-03 still holds (sealed delivery, not committed to the public tree). A1's rejected split (floor hidden / community public) stays rejected as a negative if not already covered by N-03.

### contributor-sub-risk (medium, fable M8)
README / contributor flow MUST state that subscription sign-in in a contributor's copy carries account-suspension risk, which D-34 accepted only for Vince's floor. R-67 stays the OpenAI/xAI terms gate; this is disclosure, not a terms invent.

### r13-roughly (medium, fable M10)
R-13 and N-02 MUST NOT harden "roughly 50 to 100" into a silent exact bound as if Vince chose inclusive 50..100. Either word the requirement as "roughly 50 to 100" with the cell using that logged phrase, or put exact bounds to Vince (fork below). Recommendation: keep roughly in the requirement text; cell fails only on empty or single-digit sets and on sets far outside that band only if Vince later picks exact bounds.

### r08-two-disclosures (medium, grok H3)
Split disclosure: R-08 cell checks auto-approve plus the "commands auto-approved" deviation string only. R-09 cell (or a sibling) checks the "web access blocked" deviation string in addition to the live network probe. Drop "exactly those two strings" unless the log is read as forbidding any further disclosed deviation (it is not).

## Product forks for Vince (do not decide here)

1. **floor-track** (fable M6): Does the floor guarantee latest only, frozen only, or both? Log is silent. Frozen-as-floor roughly doubles floor runs.

2. **rotation interval** (A1 / r18): No number was chosen. Ask at outcome altitude (how fast a leaked set should die), not a day count invented by the build.

3. **R-13 exact bounds**: Keep "roughly 50 to 100" or pick inclusive integers.

## Parked
All low/trivial from the three notes files. Not in this proposal.

## Out of this proposal
Share cap remains Claude's discretion (named in log). Model-rename and abuse-at-scale stay deferred as already in the PRD.
