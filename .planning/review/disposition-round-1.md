# Disposition of round 1 (digest 89c6f69098120b29)

run: c-mu06ff7r-mfcm66
series: prd-nerf-bench-review-2026-09-13, phase 1 of 1
landed in: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\prd\2026-09-13-nerf-bench-prd.md, Amendments ledger, Amendments 1 to 22 (uncommitted working tree over 3c23b4c)

## Adopted in full

Every item of sections C and D, as agreed:

| Item | Amendment | Lands as |
|---|---|---|
| H-a attest-boundary | 1 | supersedes R-06, R-28 text and cell description |
| H-b series-app-key | 2 | supersedes R-26 text and cell description |
| H-c world-public-data | 3 | replaces the Verification world paragraph; supersedes N-03 cell description |
| H-d r57-hidden-recompute | 4 | supersedes R-57 text and cell description |
| H-e every-app-coverage | 5 | supersedes cell descriptions of R-07, R-09, N-01, R-29, R-30 |
| H-f desktop-on-github | 6 | supersedes R-04, R-05 text; R-27 cell description |
| H-g r66-meta | 7 | `retired: R-66` |
| H-h same-task-set | 8 | new R-68 and N-15, phase 3 |
| H-i floor-track | 9 | supersedes R-36 text and cell description, R-30 text |
| M-a handpick-selection | 10 | new R-69, phase 2 |
| M-b all-tiers-catalog | 11 | supersedes R-34 text and cell description |
| M-c r11-self-report | 12 | supersedes R-11 cell description |
| M-d r18-approval-gate | 13 | supersedes R-18 text and cell description |
| M-e frozen-schedule | 14 | supersedes R-30 cell description |
| M-f grok-grounding | 15 | Grounding line corrected; licence and repository claims withdrawn |
| M-g release-date-baseline | 16 | supersedes R-63, N-14 cell descriptions |
| M-h methodology-timing-nav | 17 | supersedes R-20 text and cell description |
| M-i r08-two-disclosures | 18 | supersedes R-08 cell description, R-09 text and cell description |
| M-j r13-roughly | 19 | supersedes R-13 text |
| M-k default-effort-headline | 20 | supersedes R-42 text and cell description |
| M-l contributor-sub-risk | 21 | new R-70, phase 3; supersedes R-67 text |

One placement choice of mine: R-20 is listed under deployment (2) in Amendment 3, since M-h moves its navigation cell there.

## V1, put to Vince, and his answer

Asked with three options (his own keys sized first, recommended; wait for someone else's keys; launch the API path unproven). He chose **"Wait for someone else's keys"**. Landed as Amendment 22 and as amendment A3 to D-43 in the discussion context, with a logged entry:

- R-29 (text and cell description superseded): the dry run proves the subscription path in every launch app; no API key paid by Vince is used for any run, verification included.
- New R-71, phase 3: the site refuses an API-path result for an app until that app's API path is proved by a recorded real run on a key not paid by Vince; the proof record names the key supplier; its cell runs on fixtures, so it passes in the Verification world.
- D-43's "ready to flip" now excludes the API path; the Verification world's R-39/R-29 sentence is replaced: no API run happens in the world.

## Version 2 repairs to my own landed text

Two defects in version 1's wording, relayed from astra through fable, repaired in place in the uncommitted ledger:

- Amendment 3 left the original world paragraph's "fixture data never reaches the staging or public data" in force against deployment (2). It is now scoped: fixture data never reaches staging (1), its copies (3) or the production public site; (2) holds fixture data only by design.
- R-71 could be unlocked by an executor-written record. The proof record now references a run's attested result digest, and the site checks it verifies under R-28, matches the app, used the API path, and names a supplier and payer who is not Vince. The cell refuses forged, mismatched-app, subscription-run and Vince-funded proofs.

## Section E

Accepted as the seats wrote it; nothing further lands.

## Not changed, and why

Nothing the round agreed was refused.

## State read back

`prd-verify.cjs` over the amended PRD: 0 passed, 85 failed, 0 could-not-answer, of 85 live cells; 1 retired (R-66), not scored; 5 phases declared, every requirement placed in one; no supersedes clause refused. Five new stubs created (R-68, R-69, R-70, R-71, N-15), each exiting 1. No em or en dash in the PRD.
