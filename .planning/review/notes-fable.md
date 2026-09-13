# notes-fable

Reviewer: fable seat, series prd-nerf-bench-review-2026-09-13, phase 1 of 1.
Relaunched on another account after a usage limit; no prior fable notes existed, so the blind review started from the top here.

## Progress

- step 1 (done): ran scorer. `prd-verify.cjs` reads 81 live cells, 0 passed, 81 failed, 0 could-not-answer; `--list` reports 81 cells with runnable commands, 5 phases declared, every requirement placed. Stubs: make-stubs.cjs emits one exit-1 file per id found by regex `prd-cells/([RN]-\d+)\.cjs`, never overwrites.
- step 2 (done): read PRD (587 lines), log, context file (D-01..D-46 + A1 all exist), shape.md, trackers-codex.md, research notes.
- step 3 (done): dash scan over PRD and stubs: none. Fetched x.ai/news/grok-build-cli (name "Grok Build", headless `-p` mode, "all SuperGrok and X Premium Plus subscribers"; licence and repo NOT on that page), docs.github.com attestations (binds workflow, repository, organization, environment, commit SHA, triggering event; `gh attestation verify`), code.claude.com legal page (quotes match the PRD's Grounding and research notes).
- step 4: findings below, filed to the orchestrator by one message.

## Findings (blind)

### High

H1. R-57 (line 384) against N-03 (line 466). R-57 says a standalone verifier recomputes ANY published run's score without contacting the site, and its cell runs it on "a published run's files". Recomputing a score needs the task checks, which are the tasks; for a run on a current set N-03 forbids publishing them anywhere. Both cells cannot pass in the named world at once unless R-57 is scoped to runs whose tasks have retired (D-28 already puts transcripts at retirement), with the signature check alone for current runs. D-44 "independently checkable" and D-42/A1 collide here and the PRD does not resolve it. Read: PRD lines 384-388, 466-470, context D-28, D-42, D-44, A1.

### Medium

M1. R-04 (line 60) and R-05 (line 66) drop "GitHub-hosted" that R-01..R-03 carry, and R-05 names no OS. R-06 binds EVERY run's attestation to the official workflow, D-23 puts contributor runs on GitHub's machines, and R-27/R-28 accept only attested results. If a desktop-app run may happen off GitHub, R-06, R-27 and R-28 cannot cover it; if it must be on GitHub, say so in R-04/R-05. Read: lines 42-70, 72-76, 202-212; context D-23.

M2. R-29 (line 214) cell needs a real API-path run, and the world (line 558) says that run is "a contributor run from the test account". Nobody is named as owning the API key that pays for it; D-39 says no API spend by Vince at launch. The world needs to name the key's owner (donated, or an explicit Vince decision to spend for verification) or R-29 is unmet in it. Read: line 218, line 558, context D-39.

M3. The world names staging (dry-run data) and a fixture store that "never reaches the staging or public data", but R-50, R-51, R-52, R-53, R-56, R-59, N-09 and N-11 are browser or route cells that need a SERVED site over fixture data (seeded runs, superseded and retired fixture models, admin delete attempts). No deployment for that is named, and N-11 crawls "every public page from the home page" while R-56's hundreds of seeded runs must not be on staging. Name a fixture deployment or these cells have no address. Read: lines 342-364, 378-382, 396-400, 502-518, 558.

M4. R-11 (line 102) cell is stricter than its text and can become unpassable. Text: pick recorded before any public site surface "R-41 onward". Cell: entry dated earlier than "the first commit touching `site/`". Phase 2 requirements R-15, R-18, R-20, R-21 touch `site/methodology`; if any lands before Vince picks, the cell fails forever (commit dates cannot move). Align the cell to the text (site surfaces of phase 4) or move methodology out of `site/`. Same shape, lower weight: R-11 and R-18 cells read this PRD's own ledger for a human act; acceptable as checkpoints, but neither says what an approval entry looks like. Read: lines 102-106, 146-150, 128-168.

M5. R-66 (line 440) re-runs every other cell inside a prd-verify run that already runs them, so every cell runs twice per scoring, including the ones that leave the machine or have side effects: R-09 launches a live agent run on a paid account, R-27 drives a real contributor run against the real public repo, R-32 starts and aborts a run that the site lists forever, R-35 submits a request and votes, R-63 makes a copy of staging publicly reachable. Principle 19. prd-verify exiting 0 already IS the simultaneity criterion; R-66 should be that run (one pass) or be retired as redundant. Read: lines 440-444, 90-94, 202-206, 232-236, 250-254, 422-426.

M6. Which app track the floor runs is decided nowhere. D-10 gives two tracks, D-14 makes the floor the guaranteed data, D-38 names models only. R-36..R-40 never say latest, frozen or both, and R-36's cell counts runs per flagship regardless of track, so the frozen line can stay empty forever with the matrix green. Outcome question for Vince: does his floor guarantee the frozen line too (roughly doubles floor runs), or is frozen community-only at launch? Read: lines 256-284; context D-10, D-14, D-38, D-39.

M7. A1's rejected alternative "Hidden tasks only in your floor; community on a separate public set" landed as no negative: nothing requires floor runs and contributor runs to execute the same current active set, and nothing says how the current hidden set reaches a contributor-owned run when the repository is public (R-54) and N-03 forbids the tasks anywhere in it or its history. R-26 keys series by model, effort, path, track but not by task set, so runs on different sets would aggregate. Read: lines 196-200, 366-370, 466-470, log lines 509-520.

M8. Context file "Open feasibility items" third bullet (subscription sign-in inside a contributor's own copy, within each lab's terms; D-34 accepts the risk for Vince's floor only) has no requirement. R-67 reads OpenAI's and xAI's terms only; Anthropic's page, read today, says OAuth "is designed to support ordinary use" and Anthropic "may take measures ... without prior notice", so a contributor's subscription run carries the same suspension risk Vince accepted for himself only. No requirement makes the README state that risk to contributors or puts the question to Vince. Read: line 446-450, context lines 154-157, code.claude.com legal page fetched 2026-09-13.

M9. D-44 "the methodology page (including the D-35 limit) is public before the first result". R-19 (line 152) dates only the statistical rule; R-20 and R-21 check page content with no timing. Nothing proves the methodology page predates the first public result. Read: lines 152-168, context D-44.

M10. R-13 (line 116) hardens "roughly 50 to 100" (log line 81, appendix line 566) into a strict 50..100 inclusive, and N-02's cell repeats the 50 floor. A set of 49 or 101 fails the contract though Vince said roughly. Either state the bounds as the build's choice in the ledger for approval, or word the requirement as decided. Read: lines 116-120, 460-464, log 77-86.

### Low and trivial (parked)

L1. R-36 cell's "at least two runs" is the cell's figure for "several times a day"; PRD admits no count was decided. Two is a weak reading of several.
L2. D-20 "both printed on every run record": R-09's text has no disclosure clause; only R-08's cell asserts "web access blocked" in the deviations list, so R-08's cell checks more than R-08 says.
L3. D-13 "checked automatically and then hand-picked": no requirement makes an active set a recorded selection from harvested candidates (R-12 stops at candidates).
L4. R-41 cell requires "cost" non-empty; a subscription-path run has no dollar cost. Define what the field holds there.
L5. R-64 cell "same calendar day": no timezone named.
L6. N-06 cell's input, "a validly signed result whose run carries no GitHub account identity", may be unconstructible: an attestation always names the repository and its owner.
L7. N-10 bans the substring "nerf" in verdict text; if the chosen brand keeps "nerf" and a verdict template ever includes the site name, it fails. Trivial.
L8. Verification matrix table (lines 548-554) uses id ranges, not one row per requirement as shape.md section 6 asks; the mechanical reader uses `cell:` lines so nothing is unscored. Trivial.
L9. Per-contributor share cap (Claude's discretion, log Area 6) is neither built nor named out of scope.
L10. Grounding line 14: the x.ai page names "SuperGrok and X Premium Plus subscribers" and does not name Apache 2.0 or the repo; the PRD attributes those to developer write-ups. Not verified by me; R-03 proves the run anyway.
L11. R-46 assumes each of the three labs has a status page with a known past incident; xAI's not verified.
L12. D-24 "AI labs included" as sponsors: no requirement or negative binds that a lab may sponsor; R-55 only lists. Trivial.

### Checked and clean

Opener ids all exist (D-01..D-46, A1). All 46 decisions and every rejected alternative traced to a requirement, a negative, or the out-of-scope list except as noted in M6, M7, M8, M9, L3, L9, L12. No dashes. 81 cells, 81 files, all exit 1 at birth, no two cells share a file. Phases: every requirement in exactly one.

## Filing

- filed to session:cd1ada70-cd9a-4c2c-992b-96b26ec3392e as msg 53592ba9-92eb-45b0-aa96-ab94275619d9; peer.cjs receipt: DELIVERED, arrived 2026-09-13 13:03:15 MDT (receiver's own record).
- 13:04 orchestrator opened the argument (run c-mu06ff7r-mfcm66). Read blind-findings.md, notes-astra.md, notes-grok.md. astra: A1-A11; grok: H1-H10.

## Argument phase

- I own the one joint proposal (both seats asked me to): C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\joint-proposal-round-1.md
- Folded: all astra highs and mediums; grok's corrections (R-66 not circular, only double side effects; only-two-deviations kept; n03 folded into world namespaces; desktop GitHub-hosted with Windows only for Codex Windows app; interval a labelled build default; handpick allows 100 percent pick; R-11 ledger quotes Vince verbatim bound to hash; same-store not same-hash; off-schedule refusal by simulation; no fabricated day-one points).
- Vince decided floor-track via orchestrator: "both tracks, and that's available to me AND community. community can choose frozen or latest when they do their run" -> H-i.
- Remaining fork for Vince: V1 API verification spend (five per-app runs).
- Filed: round 1, digest 9473793aff058a7c, 13975 bytes. Sent digest to astra and grok; sent verb output to the orchestrator.
- astra asked three narrow edits (R-11 quote needs an independent source read back; retirement keeps set identity, statuses exclusive; V1 "none identified or authorized"). Applied; re-filed with --replaces: round 1 SUPERSEDED, new digest 89c6f69098120b29, 14520 bytes, agreements cleared. Sent to astra, grok, orchestrator.
- Orchestrator disposed round 1: digest cb73c25340140151, Amendments 1-22 landed (uncommitted), Vince chose "Wait for someone else's keys" -> R-29 superseded, new R-71. Read the ledger: matches the proposal. Re-ran prd-verify: 85 live, 0 passed, 85 failed, R-66 RETIRED unscored, no refused clause; 5 new stubs exit 1; 0 dashes.
- Ran agree on cb73c25340140151: "agreed: 2 of 3 active seat(s), on version 1". Sent verb output to orchestrator.
- astra raised two narrow points on the landed text (R-71 proof record is self-writable and binds no verified run; Amendment 3 leaves the old fixture-data sentence in force against deployment (2)). I concur; asked astra to file round 2. grok endorsed and asked me to own it; drafted joint-proposal-round-2.md.
- Before filing, the orchestrator issued disposition version 2 (digest b7d4ade1346c54c0) repairing both points. Verified in the ledger: R-71 text and cell bind the proof to an attested digest verified under R-28, same app, API path, supplier and payer not Vince, four negative controls; PRD line 603 fixture sentence scoped to (1), (3) and production. prd-verify: 85 live, 0 passed, 85 failed, R-66 retired; 0 dashes.
- Ran agree on b7d4ade1346c54c0: "agreed: 3 of 3 active seat(s), on version 2". Sent verb output to orchestrator; told astra and grok. Round 2 draft marked NOT FILED.
- Seat's work is complete; waiting for the orchestrator to close the run and this tab.
