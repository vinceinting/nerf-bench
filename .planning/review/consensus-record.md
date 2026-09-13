# Consensus run c-mu06ff7r-mfcm66

**Kind:** review. The reviewers read work that had been done.
**Subject:** nerf-bench PRD 2026-09-13 at 3c23b4c: 81 requirements, 5 phases
**Parent:** `cd1ada70-cd9a-4c2c-992b-96b26ec3392e` (driving engine: claude)
**Opened:** 2026-09-13T18:57:57.447Z
**Discussion began:** 2026-09-13T19:03:31.492Z
**Closed:** 2026-09-13T19:26:57.376Z
**Closed on:** proposal version 2, digest `b7d4ade1346c54c0`, from `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\disposition-round-1.md`
**Outcome:** consensus

## The seats

Session ids are here so the full transcripts stay findable: every reviewer is a Claude
Code session and its transcript is on disk under `projects`, which every account home
shares. This record is a summary BECAUSE that archive exists.

| engine | model | effort | session | state | stand-in |
|---|---|---|---|---|---|
| astra | (engine default) | medium | `5891eaad-229b-4797-aeff-912b16b954fb` | agreed | no |
| fable | (engine default) | medium | `376f4e1b-52ae-4839-97e2-ea477e79c568` | agreed | no |
| grok | (engine default) | low | `c29e8493-238c-4a36-a703-a99776ac7fd1` | agreed | no |

## What was agreed

PRD amended by Amendments 1 to 22 (disposition v2 b7d4ade1346c54c0); R-66 retired; R-68 to R-71 and N-15 added

## What was objected to

Every objection ever filed, in order, including ones that were later satisfied. Those
are the most valuable lines here: an objection that CHANGED the proposal is the whole
evidence that a reviewer was worth its cost. An earlier build kept one slot per seat and
let a later agreement overwrite it, so a run where something real was caught and fixed
read as a run where nobody had objected at all.

Nothing was filed.

## What was ruled rather than settled

Nothing was ruled: every active seat agreed explicitly, to this exact version.

**A high finding went to Vince**, and he decided: floor-track: both tracks, contributors choose per run; V1 api-key-owner: wait for someone else's keys

## The rounds

A round is the seats' joint proposal, agreed by every seat before the parent answered it.
The parent's disposition is the proposal version it answered with.

- round 1, digest `89c6f69098120b29`, filed by `376f4e1b-52ae-4839-97e2-ea477e79c568` at 2026-09-13T19:11:04.828Z, from `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\joint-proposal-round-1.md`; answered by proposal version 2

## Findings by severity

| severity | seat | key | outcome | where parked | why |
|---|---|---|---|---|---|
| high | astra | attest-boundary | changed |  | R-06/R-28/N-05 signed workflow path and commit do not prove sealed unmodified execution |
| high | astra | series-app-key | changed |  | R-26 series key omits app identity |
| high | astra | world-public-data | changed |  | Cells needing public or served data have no deployment in the Verification world without breaking N-14 |
| high | astra | r57-hidden-recompute | changed |  | R-57 recompute of current-task scores needs hidden tasks |
| high | astra | every-app-coverage | changed |  | Every-app claims in R-07, R-09, N-01, R-29, R-30 checked on one run or app |
| high | astra | r66-meta | changed |  | R-66 duplicates external side effects and is bounded by the per-cell timeout |
| medium | astra | default-effort-headline | changed |  | Home card may use a non-default effort series |
| medium | astra | handpick-selection | changed |  | D-13 hand-pick not bound |
| medium | astra | all-tiers-catalog | changed |  | D-27 every-tier support not bound |
| medium | astra | r11-self-report | changed |  | R-11 ledger entry self-reports a human choice |
| medium | astra | r18-approval-gate | changed |  | R-18 approval self-report and unresolved interval |
| medium | astra | frozen-schedule | changed |  | R-30 never proves frozen moves only on schedule |
| medium | astra | release-date-baseline | changed |  | R-63/N-14 use switch date instead of official release date |
| medium | astra | methodology-timing-nav | changed |  | Methodology page not proved reachable or pre-result |
| low | astra | grok-license-unverified | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | Grok license and repo unverified |
| low | astra | r10-site-concepts | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | R-10 lacks explicit site concepts |
| low | astra | word-ban-strength | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | Finite word bans and exact-text leak search need stronger checks |
| high | fable | world-public-data | changed |  | Served-site fixture cells (R-50..R-53, R-56, R-59, N-09, N-11) have no deployment named |
| high | fable | r57-hidden-recompute | changed |  | R-57 vs N-03 unsatisfiable together; scope to retired tasks |
| high | fable | desktop-on-github | changed |  | R-04/R-05 drop GitHub-hosted while R-06/R-27/R-28 need attested workflow runs |
| high | fable | r66-meta | changed |  | R-66 reruns every cell; prd-verify exit 0 already is the criterion |
| medium | fable | r11-self-report | changed |  | R-11 site/ commit rule conflicts with phase 2 methodology |
| medium | fable | methodology-timing-nav | changed |  | Nothing proves methodology predates first public result |
| medium | fable | api-key-owner | changed |  | R-29 API run has no key owner in the world |
| medium | fable | floor-track | changed |  | Floor app track undecided; outcome question for Vince |
| medium | fable | same-task-set | changed |  | Floor and contributor runs not bound to one current set; delivery of hidden set to public-repo runs unstated |
| medium | fable | contributor-sub-risk | changed |  | Contributors not told of subscription suspension risk |
| medium | fable | r13-roughly | changed |  | Roughly 50 to 100 hardened to strict bounds |
| low | fable | r09-disclosure | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | R-09 text lacks disclosure clause |
| low | fable | r41-cost-field | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | Cost field on subscription run undefined |
| low | fable | r64-timezone | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | R-64 same calendar day has no timezone |
| low | fable | n06-unconstructible | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | N-06 input may be unconstructible |
| low | fable | n10-brand-substring | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | N-10 nerf substring vs brand name |
| low | fable | matrix-ranges | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | Matrix uses id ranges not one row per requirement |
| low | fable | share-cap-unnamed | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | Share cap neither built nor named out of scope |
| low | fable | r46-xai-status | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | xAI status page unverified |
| trivial | fable | d24-labs-sponsor | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | Nothing binds that a lab may sponsor |
| high | grok | desktop-on-github | changed |  | R-04/R-05 not GitHub-hosted; contributor flow never proves desktop apps |
| high | grok | r66-meta | changed |  | R-66 runs every other cell: circular under shape.md simultaneity rule |
| medium | grok | handpick-selection | changed |  | D-13 hand-pick missing |
| medium | grok | all-tiers-catalog | changed |  | D-27 every-tier catalog missing |
| medium | grok | r11-self-report | changed |  | R-11 cell reads this PRD |
| medium | grok | r18-approval-gate | changed |  | R-18 invents propose-and-approve process |
| medium | grok | grok-grounding | changed |  | Grounding Apache 2.0 and repo claim unsupported by x.ai page |
| medium | grok | n03-live-tasks | changed |  | N-03 vs R-09 and R-17 task texts under the Verification world |
| medium | grok | r08-two-disclosures | changed |  | R-08 cell covers both disclosures and says exactly |
| low | grok | r12-fixed-cutoff | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | R-12 cell uses one fixed cutoff |
| low | grok | r32-discretion-as-must | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | R-32 encodes discretion as MUST |
| low | grok | r36-two-count | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | R-36 at least two for several |
| low | grok | n10-extra-words | parked | project: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review-debt.md | N-10 extra banned words |

## What it cost

Recorded because the room this mode replaces was retired for an economic reason, and a
mode that cannot be measured against that reason cannot be defended against it either.

- **Blind phase:** 334s
- **Discussion:** 1406s, which is what the soft cap measures
- **Parent blocked on Vince:** 735s, reported and never subtracted; the clock does not pause
- **Proposal versions:** 2
- **Rounds:** 1, each one seats-agreed proposal and one parent disposition
- **Parked, not chased:** 16 low or trivial finding(s)

**Reviewer value**, per seat, as counts rather than a score, because a number nobody can
audit is a slogan with digits. "Changed" means the seat objected and the text moved before
it agreed.

**These counts are REVIEWER CONTRIBUTIONS ONLY.** They are recorded per seat, so nothing the
parent itself argued, challenged, repaired or rewrote is counted here, and in a lane where the
parent is not a seat (the quick lane) its own challenge appears in no row at all: a zero in
this table is not a run in which nothing changed. Read it beside the objections above and the
write-up, never as this run's total worth.

| engine | changed the proposal | considered, not adopted | unique to this seat | turns |
|---|---|---|---|---|
| astra | 14 | 0 | 9 | 19 |
| fable | 11 | 0 | 14 | 22 |
| grok | 9 | 0 | 7 | 15 |
