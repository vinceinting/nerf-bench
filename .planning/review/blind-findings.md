# Blind findings, run c-mu06ff7r-mfcm66 (series prd-nerf-bench-review-2026-09-13)

All three seats filed. Each seat's findings as filed by message are in its own notes file, and summarized here by the orchestrator with the shared keys used in the record. Where two seats named the same issue they share one key.

Seats: astra 5891eaad-229b-4797-aeff-912b16b954fb; fable 376f4e1b-52ae-4839-97e2-ea477e79c568; grok c29e8493-238c-4a36-a703-a99776ac7fd1.

Full texts: `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\notes-astra.md`, `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\notes-fable.md`, `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\notes-grok.md`.

## High and medium, by key

| Key | Severity | Raised by | Gist |
|---|---|---|---|
| attest-boundary | high | astra A1 | R-06/R-28/N-05: a signed workflow path and commit do not prove sealed, unmodified execution; a contributor's fork can change checkout inputs, reuse artifacts or use an unauthorized runner with the workflow unchanged. |
| series-app-key | high | astra A2 | R-26 series key omits the app; Codex CLI and Codex desktop runs of one model collide. |
| world-public-data | high | astra A3, fable M3 | Cells needing public or served data (R-31, R-32, R-41, R-17, R-58, R-50 to R-53, R-56, R-59, N-09, N-11) have no deployment named in the Verification world without breaking N-14. |
| r57-hidden-recompute | high | astra A3, fable H1 | R-57 recomputing any published score needs the hidden tasks, which N-03 forbids publishing; scope to retired tasks. |
| every-app-coverage | high | astra A4 | R-07, R-09, N-01, R-29, R-30 claims cover every app but cells check one run or one app. |
| desktop-on-github | high | grok H1, H10; fable M1 | R-04/R-05 drop "GitHub-hosted"; contributor flow (D-23, R-27) never proves the desktop apps; Windows runner not required. |
| r66-meta | high | grok H2; astra A10; fable M5 | R-66 reruns every cell inside a scorer that already runs them: circular per shape.md and duplicates external side effects. |
| default-effort-headline | medium | astra A5 | Home card may use a non-default effort series; D-19 headline is default effort. |
| handpick-selection | medium | astra A6, grok H4 | D-13 "then hand-picked" has no requirement. |
| all-tiers-catalog | medium | astra A6, grok H5 | D-27 every-tier support not bound; one-flagship catalog passes. |
| r11-self-report | medium | astra A7, grok H6, fable M4 | R-11 cell reads this PRD for a human act; its `site/` commit rule conflicts with phase 2 methodology work. |
| r18-approval-gate | medium | grok H7, astra A7 | R-18 invents a propose-and-approve process not in the log. |
| grok-grounding | medium | grok H8 | Grounding's Apache 2.0 and repository claim is not on xAI's page. |
| n03-live-tasks | medium | grok H9 | N-03 against R-09's live task and R-17's retirement publishing under the Verification world. |
| frozen-schedule | medium | astra A8 | R-30 never proves frozen moves only on schedule. |
| release-date-baseline | medium | astra A9 | R-63/N-14 use switch date, not official release date, for baseline and eligibility. |
| methodology-timing-nav | medium | astra A11, fable M9 | Methodology page not proved reachable from home or published before first result. |
| api-key-owner | medium | fable M2 | R-29's API run in the world has no named key owner; D-39 says no API spend by Vince. |
| floor-track | medium | fable M6 | Which app track (latest, frozen, both) the floor runs is decided nowhere; outcome question for Vince. |
| same-task-set | medium | fable M7 | Nothing requires floor and contributor runs to use the same current set, or says how the hidden set reaches a public-repo run; series key omits task set. |
| contributor-sub-risk | medium | fable M8 | Contributor subscription runs carry the suspension risk Vince accepted only for himself; nothing tells contributors. |
| r13-roughly | medium | fable M10 | "Roughly 50 to 100" hardened to strict bounds. |
| r08-two-disclosures | medium | grok H3 | R-08 cell asserts both disclosures and "exactly"; tighter than D-20. |

## Low and trivial: parked, not argued

astra: grok-license-unverified, r10-site-concepts, word-ban-strength. grok: r12-fixed-cutoff, r32-discretion-as-must, r36-two-count, n10-extra-words. fable: r36-several, r09-disclosure, r41-cost-field, r64-timezone, n06-unconstructible, n10-brand-substring, matrix-ranges, share-cap-unnamed, r46-xai-status, d24-labs-sponsor.
