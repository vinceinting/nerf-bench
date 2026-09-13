# Astra blind contract review

Subject: commit 3c23b4c, all 81 requirements in the nerf-bench PRD.
Role: read-only reviewer; no contract, implementation, or standing-set edits.
Done: compare every requirement with the authoritative decision log; inspect and run the safe stub scorer; assess cross-cell satisfiability; file one blind message and check its receipt. Consensus follows the orchestrator's messages.

## Checklist
- [x] Read review brief, full PRD, full authoritative log, messaging procedure.
- [x] Read context, shape, research, sources, scorer and all 81 stub files.
- [x] Run scorer inventory and safe stub cells.

## Mechanical evidence
- HEAD read as 3c23b4c2840f3bd24e937eb593e06126f9d77cbc. Research notes have another session's modification; untouched here.
- Inventory: 81 cells, 81 runnable, 0 missing, 5 declared phases, every requirement in one.
- All 81 files were inspected with Grep: each prints its own not-built line and exits 1. No external action inside any stub.
- Full scorer run once: exit 1; 0 passed, 81 failed, 0 could-not-answer. Correct birth state, not a defect.
- Scorer journal redirected into this project's review folder, so running the scorer did not need to write its default harness journal. Read the journal back: correct contract and HEAD.
- Generator read only, not run: skips existing files and would create missing stubs.
- Read both research files and context; fetched all three required official sources. Grok page supports headless -p but does not state Apache 2.0 or the alleged source repository. That grounding claim is unverified, not proof of a nonexistent repository.
- GitHub documentation warns provenance is not a security guarantee. GitHub CLI manual independently names signer-workflow, signer-digest, source-digest and deny-self-hosted-runners as separate controls; reusable signer and caller/source are distinct identities.

## Requirement coverage against the log and cell prose
Every row below was read against the full log. Stub runnable/birth coverage is universal; findings concern the promised eventual cell, not missing implementation.

| IDs | Logged decision and assessment |
|---|---|
| R-01..R-05 | Opening clean-run intent and Area 10 five apps; feasibility intentionally unresolved, not a defect. Installer/version/result existence alone is weaker than sealed default execution. All-app negative controls needed below. |
| R-06..R-09 | Areas 5, 6, 14; signature, fingerprints, auto-approval and web block. Trust policy and all-app proof gaps. |
| R-10..R-11 | Area after-artifacts design checkpoint. Concept choice is deliberately future work; cell trusts its own PRD ledger and dates rather than decision evidence. |
| R-12..R-14 | Areas 3 and 12. Harvest/date/automatic pass-fail encoded; hand-picked promotion absent. |
| R-15..R-18 | Area 3 and A1. Fingerprint/overlap/retirement encoded; rotation setting approval explicitly unresolved. Public evidence and phase dependency gaps below. |
| R-19..R-21 | Areas 4, 7, closing rule-first, A1. Page statements encoded; public prepublication date and navigation not proved. |
| R-22..R-25 | Area 4. Conditional headline, band, pooled frozen week, day-one point encoded. Missing default-effort headline dealt with R-26/R-42. |
| R-26 | Areas 2, 5, closing never-mix. Three varying dimensions tested; app identity omitted. |
| R-27..R-29 | Areas 2, 6, 14. Real copy-run positive exists; accepted execution trust not fully bound. Two access runs do not prove five-app coverage. |
| R-30 | Area 2 latest/frozen. Installs tested; scheduled-only advance has no control. |
| R-31..R-32 | Area 6 identity and discretionary anti-cherry-pick. Public record timing conflicts with private dry world unless explicitly mapped. Abort control is useful; its pre-result timing should be observed, not inferred from final row. |
| R-33..R-35 | Area 7 support, requests, all tiers. Nondefault sample and selectable catalog do not require nonflagship tiers. Vote board navigation is sound. |
| R-36..R-40 | Areas 4, 5, 10, 11, 15. Floor/default/cadence/subscriptions/overlap encoded. Global constant count can be satisfied by redistributing a chosen sufficient schedule, so not alleging mathematical impossibility. |
| R-41..R-43 | Area 8 disclosure/home/drilldown. Public real run is absent from named private world; home verdict has no default effort rule. |
| R-44..R-46 | Area 8 official automatic app/model/status events. Known-source live checks useful; model/status checks say one known event rather than each vendor. |
| R-47..R-49 | Areas 8 and 9 frozen/rotation/statements. Fixture marker checks useful; source-link checks rely on N-12. |
| R-50 | Area 9 verbatim collapsed replies. Deliberate click and byte equality tested; home-to-reply entry missing. |
| R-51..R-53 | Confirmed Area 15 reading. Archive/navigation/continued submission/retirement encoded. Not finding literal R-42 all-tracked cards versus archive because lifecycle clearly supersedes spotlight. |
| R-54..R-56 | Areas 7, 17 and shape. Public code, funding navigation, old-row seeded collection encoded; donation link need not execute a real payment. |
| R-57..R-59 | Closing independent check, Area 16 permanent transcripts, Area 7 account source. Public score recomputation's inputs conflict with active task secrecy unless proof boundary defined. |
| R-60..R-65 | Closing dry-run, Areas 10 and 13 launch. Five apps/three subscriptions/private staging/copy switch/release-day/other labs encoded. Public baseline timestamps anchored to switch rather than model release must be corrected. |
| R-66 | Shape common world. Excludes itself, so no recursion bug; however executes other live actions a second time under outer scorer. |
| R-67 | Build-time unread terms; good to gate unresolved provider clauses, but wording only checks a report and does not prove release refuses missing approval. |
| N-01..N-03 | Clean, no public benchmark, current secrecy. Local machine scan and source exclusion useful; one inventory and exact-text search do not prove all variants. |
| N-04..N-07 | Closing no credentials, Areas 6/14 no local/anonymous/hosted flow. Valid-signature hosted ownership attack not tested; token refusal must be reconciled with arbitrary signed transcript payloads during build. |
| N-08..N-10 | Flat volume, no alterations, no intent. Controls useful; no mathematical global-volume finding, no claim finite intent lexicon proves semantic coverage. |
| N-11..N-14 | No leaderboard/editorial/brand misuse/prelaunch data. No-ranking crawl useful. Switch-date cutoff differs from released flagship identity. |

## Decision omissions sweep
Hand-picked active-set admission (Area 12), headline default effort (Area 5), all tiers supported (Area 10 re-ask), and brand plus site concepts (after-artifacts Area) are not fully carried into binding checked outcomes. Original single prompt, public/forever-secret tasks, judged writing, pooled efforts/access/tracks, local/unverified/anonymous runs, site-hosted sessions, lab exclusions/paid-donated chart, surge, leaderboard, editorial markers, results alterations, partial opening milestone, short transcript retention and closed source were all read against chosen answers; most are ruled out by positives/negatives. Unchosen stronger floor, ask-labs-first and dollar caps are not fresh requirements. Renames and abuse-at-scale explicitly out of scope. No scope expansion proposed.

- [x] Complete requirement coverage and verified findings.
- [x] File blind findings with receipt. The peer receipt command confirmed arrival at the intended orchestrator. The messaging system retains the authoritative receipt; not duplicated here.
- [ ] Participate in joint consensus. Blind gate opened; read all seats' findings. Fable owns the sole proposal file and round; Astra and Grok review and agree only after reading exact version.

## Joint argument positions
- Supported main findings; distinguish R-66 duplicated execution from recursion (self-exclusion is a base case).
- Corrected R-08 criticism: log 141 explicitly permits ONLY two deviations, so exact two stays.
- Grok H9 speculative task-secret overlap folded into explicit disjoint verification namespaces, not retained as contradiction.
- Desktop gap is per-app GitHub contributor proof; inherited R-01 conditions already imply hosted origin. Do not invent Linux defaults or an unverified Claude desktop OS requirement.
- R-13 range can stay 50..100 as labelled implementation choice within approximate user scope; not claimed as a user-decided hard bound.
- R-18 published schedule is required; propose sensible operational default and remove unnecessary later approval loop, subject to joint review.
- R-57 proof boundary must be explicit: signature and attested-score arithmetic while current, independently regrade after retirement; no false assertion that signed pass flags regrade hidden answers.
- Orchestrator relayed a new explicit floor-track answer: both latest and frozen for floor, contributors choose either. This is resolved for the proposal, not an open question. Orchestrator sent same to all seats.


## Blind findings

All are contract findings verified by reading the cited requirement/cell and log; no implementation exists to exploit. Severity reflects the contract's allowed false-green outcome. PRD line numbers below refer to the reviewed commit.

### A1 HIGH: Signed workflow is not the complete unmodified-run acceptance policy
R-06/R-28/N-05, PRD 72-76, 208-212, 478-482. The positive verifies workflow path/commit; controls flip bytes, modify workflow, or omit attestation. None keeps that workflow unchanged while modifying caller checkout code, task/scorer input, runner type or preexisting artifacts. Contributor owns the fork. A signed result generated from altered inputs can satisfy these checks. D-06/D-23 and log 155/170/400 require a sealed official unmodified test, not merely signed bytes. Official GitHub provenance docs say signatures do not guarantee artifact security; gh manual independently exposes source digest and self-hosted-runner policy beyond signer identity. Require approved execution inputs, fresh hosted origin and trusted signer/source boundary, with live contributor-owned negative controls. This is not a claim that a yet-unbuilt workflow already accepts forgeries.

### A2 HIGH: Series key omits app identity
R-26, PRD 196-200, plus R-42. Model, effort, subscription/API and latest/frozen are the entire named key. A Codex CLI and Codex Windows run for the same model with those same values collide; no test varies only app. Changing the proportion of desktop runs can then look like a model change. Five-app scope and D-03/D-18/D-36 require app-specific setup to stay scientifically distinguishable. Add app to the key and an app-only differing fixture; preserve separate baselines and verdicts through the actual chart path.

### A3 HIGH: The named private verification world has no public real-run evidence required by several cells
R-31/R-32/R-41/R-57, R-17/R-58, PRD 230/236/292/388/144/394 versus 558, R-62 and N-14. Staging holds only private current-model dry runs; fixtures never reach public data; only switch-dependent cells receive disposable public copies. R-41 nevertheless demands a real public run record, R-57 a published run's files, and R-17/R-58 public retired fixture transcripts. Publishing dry data breaks N-14; authenticating to staging does not prove public reachability. Specify each cell's deployment/store and authorize a disposable public verification world with synthetic identities/data where needed, while preserving real run checks in private staging and forbidding dry-run publication. Also define how R-57 recomputes any current-task score while tasks/transcripts remain unavailable until retirement; counting attested pass flags must not be passed off as independently regrading the answers.

### A4 HIGH: Every-app clean-run assertions can pass with only one app proved
R-07/R-09/N-01, PRD 78-94/454-458, plus R-01..R-05 and R-29/R-30. Fingerprint and inventory cells take one real run, web block launches one live run, access/tracks cells take two runs without app coverage. Other app feasibility cells check result fields, installer and version, not isolation or web blocking. A clean Claude CLI paired with desktop configurations carrying instructions or web access satisfies all described checks. Log 141/145/297/400 requires clean sealed runs across the launch apps. Define supported app/access/track cases and exercise each applicable case, including dirty-configuration and attempted-web negative controls and operational successful inference.

### A5 MEDIUM: Default effort is no longer required to supply the headline
R-26/R-37/R-42, PRD 196/262/294-298 versus log 131 and D-19. Floor-default-only and separate series are encoded, but no requirement binds the model card's comparison/verdict to the default-effort series. A card selecting high effort or whichever series has more data passes R-42. Require default headline selection and a competing nondefault series with opposite trend in the real card test.

### A6 MEDIUM: Two selected decisions have no enforceable build outcome
R-12/R-13 and R-34, PRD 110-120/244-248 versus log 380 and 323/337. Tasks must be auto-checked then hand-picked, but candidate harvesting and set counts can pass with automatic promotion of arbitrary candidates; no selection evidence is required. Catalog may contain only flagships and still pass R-34, despite all tiers being supported as community-run. Require recorded human selection before set activation (verified unattended from evidence) and supported nonflagship tiers at their eligible new releases, separate from paid floor eligibility.

### A7 MEDIUM: Brand approval cell reads its own claim rather than the user's decision
R-11, PRD 102-106. Writing a dated chosen-concept entry before a site commit satisfies the cell without Vince choosing anything. The brief explicitly requires checks against something other than the document containing them; shape requires runnable external proof. Require independent recorded user choice bound to the exact concept version and check its ordering against site implementation. R-18 likewise reads PRD approval rather than external approval evidence; its future interval choice is still an unresolved gate under shape 180-182, although design selection is intentionally future build work.

### A8 MEDIUM: Frozen-version schedule is promised but never exercised
R-30, PRD 220-224 versus log 56. Installing one latest and one pinned version passes even if the pinned setting changes on every invocation or off schedule. Require a single declared schedule and controls before/at/after its boundary, proving no early movement and a scheduled advance with its marker.

### A9 MEDIUM: Release verification uses switch date where the decision uses actual release date
R-63/N-14, PRD 426/536 versus R-24 and log 106/304/390. Switch date is not necessarily release date. A same-day later switch can discard the triggering flagship under timestamp comparisons; a next-day switch can either reject the intended flagship or start a false launch-week baseline. R-64 only checks a separate simulated release. Bind eligible flagship and baseline to the official release timestamp, test a delayed switch explicitly, and do not silently manufacture a missed day-one baseline.

### A10 MEDIUM: Aggregate cell reruns every external action under a tight wrapper bound
R-66, PRD 444, and scorer 673-691/829-917. The scorer runs all normal cell files, then R-66 runs every other cell again. These include real model runs, contributor fork/run, posting requests/votes, retirement and public switch. Excluding itself fixes recursion but not duplicated side effects/cost; runOnce's cache is per scorer process and cannot remove R-66's child executions. Each outer cell has a ten-minute bound, so R-66 additionally compresses the entire live suite into one such bound. Make the common-world proof consume one invocation's per-cell evidence tied to the same deployment/data revision, with live actions executed once and explicit adequate bounds.

### A11 MEDIUM: Methodology can be unlinked and unpublished until after results
R-19/R-20/R-21, PRD 152-168, and shape 149-163. The rule file is timestamped but page cells merely load a URL and search text. No cell proves a reader can navigate to methodology or that it was public before the first result, as D-44 explicitly requires. Bind publication timestamp and real home-to-methodology navigation to the pre-result public documentation surface. This also needs placement in the dry-run world rather than treating authenticated staging as public.

## Review of joint proposal draft 1
Not agreed as first written. Corrections sent to sole author Fable; Grok independently concurred with corrections.
- Preserve real R-41/42/43 staging evidence; add synthetic public counterpart, never substitute fixtures for real checks.
- Keep exactly two deviations per log141.
- Choice JSON needs external user decision reference, not just executor-written metadata.
- Hand-pick can choose 100% of candidates; no arbitrary exclusion constraint.
- Claude desktop uses proven supported GitHub OS, not assumed Windows.
- Same-set rule scoped by model/time/cutoff and overlap eligibility; do not erase rotation bridge.
- Frozen schedule tested behaviorally with early/due/late controls, not history alone.
- Delayed release switch cannot invent missing day-one observations.
- Remove resolved floor-track fork and avoid technical/default forks for headline, interval and factual warning. API resource/spend remains genuine user-owned decision, accounting for all five app proofs rather than one.
- Explicitly record rejected subclaims about recursion, exact-two tightening, speculative active/retired secrecy collision.

## Corrected round agreement
Read full corrected proposal after two further corrections: independent user-answer source required for concept proof; benchmark set identity/content preserved across retirement, with status-based secrecy. API key availability changed from unsupported absence claim to none identified/authorized in review.
Agreed exact round digest 89c6f69098120b29. Consensus tool read back 3 of 3 active seats agreed. Printed output sent to orchestrator; initial receipt returned exit 5 (queued arrival not yet recorded), not a failure and not delivery confirmation. Orchestrator disposition still owed before final contract sign-off. No contract edits here.

## Parked low / limitations
- Grounding line 14's Apache 2.0 and github.com/xai-org/grok-build claims are not substantiated by the cited official page; no absence-of-repository claim made.
- R-10 does not explicitly check site concepts alongside brand identity, although log 502 does.
- Many templates scan forbidden words rather than semantics; assess this in implementation without pretending a finite lexicon proves all possible intent language.
- Exact task-text search alone is not a complete publication-leak test; A1/A4 take priority.
- Flat total floor count and predecessor overlap are not formally unsatisfiable: a sufficient fixed total can be redistributed. No finding demanding a user decision on that basis.
