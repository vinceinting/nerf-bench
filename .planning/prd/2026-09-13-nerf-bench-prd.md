# nerf-bench - Build Contract (PRD)

read: D-01..D-46 and amendment A1 to D-11, from C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\discussions\2026-09-12-context-nerf-bench.md, checked against the authoritative log C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\discussions\2026-09-12-log-nerf-bench.md (commit 11f6271 plus the A1 amendment).

**Precedence.** Newest explicit intent from Vince, then the logged answer, then this document's prose. A requirement that contradicts its logged answer is a translation bug: halt and report it, never build around it.

**Cells flip as they are verified**, one at a time as each requirement's work lands, never in one pass at the end. `node "C:\Users\Vince\.harness-v2\tools\prd-verify.cjs" "C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\prd\2026-09-13-nerf-bench-prd.md"` scores the matrix and exits 0 only when every cell passes.

## Grounding

What was checked against reality before drafting, and what it changed:

- The project holds no code: `git ls-files` at 11f6271 lists only `.planning/` files. Every requirement is new work.
- Context said xAI's coding tool was unread (D-36). Read now, from secondary sources only (x.ai/news/grok-build-cli and developer write-ups): the tool is **Grok Build**, a terminal coding agent with a headless mode for scripts, open source under Apache 2.0 at github.com/xai-org/grok-build, available to SuperGrok subscribers. R-03 names it. The build still proves an unattended sealed run (R-03) rather than trusting the write-ups.
- Context said the desktop apps' sealed-run feasibility is unverified. Secondary sources say the Claude desktop app's Code tab runs the same engine as the Claude Code CLI, and the Codex Windows app the same agent as the Codex CLI. That does not prove either desktop app can be driven unattended on a throwaway machine; R-04 and R-05 prove it or fail.
- GitHub artifact attestations (docs.github.com, read 2026-09-12) sign an output's digest together with the workflow, repository, commit SHA and trigger, and verify with `gh attestation verify`. That is the signing mechanism for R-06 and R-27.
- Anthropic's terms (code.claude.com/docs/en/legal-and-compliance, read 2026-09-12) forbid intermediating Claude.ai credentials and allow hosted Claude Code only with each user's own credentials. OpenAI's and xAI's terms for automated subscription use are still unread; R-67 makes reading them a gated requirement before the release switch.
- A conflict found while drafting: D-11 against D-23. Vince resolved it (amendment A1): tasks stay hidden from the public, and the methodology states that a determined contributor can read the current set.

## Scope

**What ships.** A public website and an open-source runner that measure whether frontier models' real-world coding performance changes after release. Each model is compared against its own launch week. Every run happens in a clean, vendor-default environment on a throwaway machine and carries a signature anyone can check. Anyone can contribute runs by copying the public project to their own GitHub account and running it under their own login. Vince's own floor guarantees each lab's newest flagship. Launch covers three labs (Anthropic, OpenAI, xAI) and five apps: Claude Code CLI, Codex CLI, Grok Build CLI, the Codex Windows app and the Claude desktop app.

**Done means (D-43).** Ready to flip on release day: every requirement below passes in a private dry run on today's models, and going public when the next flagship ships is one switch.

**Must not touch.** Vince's harness (`C:\Users\Vince\.harness-v2`) in any way, and any run environment that contains anything from it (D-02). No contributor credential ever reaches the site (D-45).

## Phases

1. **Feasibility and identity**: R-01, R-02, R-03, R-04, R-05, R-06, R-07, R-08, R-09, R-10, R-11, N-01
2. **Tests and statistics**: R-12, R-13, R-14, R-15, R-16, R-17, R-18, R-19, R-20, R-21, R-22, R-23, R-24, R-25, N-02, N-03
3. **Contributor flow and floor**: R-26, R-27, R-28, R-29, R-30, R-31, R-32, R-33, R-34, R-35, R-36, R-37, R-38, R-39, R-40, N-04, N-05, N-06, N-07, N-08
4. **Public site**: R-41, R-42, R-43, R-44, R-45, R-46, R-47, R-48, R-49, R-50, R-51, R-52, R-53, R-54, R-55, R-56, R-57, R-58, R-59, N-09, N-10, N-11, N-12, N-13
5. **Dry run and release switch**: R-60, R-61, R-62, R-63, R-64, R-65, R-66, R-67, N-14

Ordered by who is waiting. Phase 1 decides whether the five-app launch is reachable at all, and holds Vince's brand checkpoint (D-46), which runs alongside the feasibility proofs rather than after them.

## Requirements

### Phase 1: Feasibility and identity

**R-01.** A Claude Code CLI run MUST complete unattended on a throwaway GitHub-hosted machine, from the official install of the vendor's current release, with no instruction files, add-ons, hooks or settings beyond the vendor defaults, and write a result file listing every task's pass or fail (D-02, D-18, D-36).
phase: 1
touches: runner/apps/claude-code; .github/workflows/run.yml
needs: none
cell: `node prd-cells/R-01.cjs` exits 0; it reads the most recent Claude Code run's artifacts and fails unless the result file exists, lists every task in the set with pass or fail, and the run log shows the official installer and the vendor's release version.

**R-02.** A Codex CLI run MUST complete unattended on a throwaway GitHub-hosted machine under the same conditions as R-01 (D-36).
phase: 1
touches: runner/apps/codex-cli
needs: none
cell: `node prd-cells/R-02.cjs` exits 0; it reads the most recent Codex CLI run's artifacts and fails unless the result file lists every task with pass or fail and the log shows the official install and version.

**R-03.** A Grok Build CLI run (xAI's coding agent, per Grounding) MUST complete unattended, using its headless mode, on a throwaway GitHub-hosted machine under the same conditions as R-01 (D-36, amendment to Area 10).
phase: 1
touches: runner/apps/grok-build
needs: none
cell: `node prd-cells/R-03.cjs` exits 0; it reads the most recent Grok Build run's artifacts and fails unless the result file lists every task with pass or fail and the log shows the official install and version.

**R-04.** A Codex Windows app run MUST complete unattended on a throwaway Windows machine under the same conditions as R-01, driving the desktop app itself rather than the CLI (D-36).
phase: 1
touches: runner/apps/codex-desktop
needs: none
cell: `node prd-cells/R-04.cjs` exits 0; it reads the most recent Codex Windows app run's artifacts and fails unless the result file lists every task with pass or fail, the log shows the desktop app's own installer and version, and no Codex CLI binary was invoked.

**R-05.** A Claude desktop app run MUST complete unattended on a throwaway machine under the same conditions as R-01, driving the desktop app itself rather than the CLI (D-36).
phase: 1
touches: runner/apps/claude-desktop
needs: none
cell: `node prd-cells/R-05.cjs` exits 0; it reads the most recent Claude desktop run's artifacts and fails unless the result file lists every task with pass or fail, the log shows the desktop app's installer and version, and no standalone Claude Code CLI binary was invoked.

**R-06.** Every run's result file MUST carry a signed attestation that `gh attestation verify` accepts, binding the file's digest to the official workflow file at a published commit of the public repository (D-06, D-23).
phase: 1
touches: .github/workflows/run.yml
needs: R-01
cell: `node prd-cells/R-06.cjs` exits 0; it runs `gh attestation verify` on a real run's result file and fails unless verification passes and the attested workflow path and commit match the official ones; its negative control flips one byte of the file and fails unless verification then fails.

**R-07.** Every run record MUST include a fingerprint of the vendor app's configuration locations taken at run start, which a verifier compares against the published fingerprint of a fresh install of that app version (D-18, D-28).
phase: 1
touches: runner/fingerprint
needs: R-01
cell: `node prd-cells/R-07.cjs` exits 0; it takes a real run record and fails unless the fingerprint matches the published fresh-install value for its app version; its negative control adds one instruction file before fingerprinting and fails unless the mismatch is reported.

**R-08.** Every run MUST auto-approve the agent's commands, and every run record MUST state "commands auto-approved" as a deviation from defaults (D-20).
phase: 1
touches: runner/apps/*; runner/record
needs: R-01
cell: `node prd-cells/R-08.cjs` exits 0; it reads a real run record for each app and fails unless no run stalled on a permission prompt and each record's deviations list contains exactly "commands auto-approved" and "web access blocked".

**R-09.** Every run MUST block the agent's web access, and this MUST be proved against a live run, not by reading configuration (D-20).
phase: 1
touches: runner/network
needs: R-01
cell: `node prd-cells/R-09.cjs` exits 0; it launches a live run whose single task instructs the agent to fetch a public URL, and fails unless the fetch was refused at the network layer and the run log records the refusal.

**R-10.** More than one visual identity concept (name, logo, colours, chart style, voice) MUST be delivered as local HTML files, each scanned by `C:\Users\Vince\.harness-v2\tools\uiscan\uiscan.cjs` before handover (D-46; fact h). No concept's name or logo may contain "Claude" or "Anthropic" (D-31).
phase: 1
touches: design/concepts/
needs: none
cell: `node prd-cells/R-10.cjs` exits 0; it fails unless `design/concepts/` holds at least two concept HTML files, each has a uiscan report beside it with no failures, and no concept's name or logo text contains "Claude" or "Anthropic".

**R-11.** Vince's pick among the concepts MUST be recorded in this PRD's Amendments ledger before any public site surface (R-41 onward) is built (D-46).
phase: 1
touches: .planning/prd/2026-09-13-nerf-bench-prd.md
needs: R-10
cell: `node prd-cells/R-11.cjs` exits 0; it reads this PRD's Amendments ledger and fails unless an entry names the chosen concept and is dated earlier than the first commit touching `site/`.

### Phase 2: Tests and statistics

**R-12.** A task harvester MUST produce candidate tasks only from real bug fixes in open-source projects merged after the target model's published knowledge cutoff, each with an automatic pass or fail check (D-12, D-13).
phase: 2
touches: tasks/harvester
needs: none
cell: `node prd-cells/R-12.cjs` exits 0; it runs the harvester against a fixed cutoff date and fails unless every candidate's fix is dated after the cutoff and every candidate carries a check that fails on the pre-fix code and passes on the fixed code.

**R-13.** Each active task set MUST hold between 50 and 100 tasks (D-12).
phase: 2
touches: tasks/sets
needs: R-12
cell: `node prd-cells/R-13.cjs` exits 0; it counts the tasks in each active set and fails unless every count is between 50 and 100 inclusive.

**R-14.** Scoring MUST be automatic only: no model or AI judge anywhere in the grading path (D-12).
phase: 2
touches: scoring/
needs: R-12
cell: `node prd-cells/R-14.cjs` exits 0; it scans `scoring/` for any call to a model API or agent CLI and fails on one; it then grades a fixture run with the network disabled and fails unless grading still completes.

**R-15.** A fingerprint of each task set MUST be published before that set's first public result, and anyone MUST be able to recompute it from the set once it is retired (D-11).
phase: 2
touches: tasks/fingerprint; site/methodology
needs: R-13
cell: `node prd-cells/R-15.cjs` exits 0; it fails unless each set's published fingerprint predates its first result and recomputing it from a retired set's published files yields the same value.

**R-16.** Task rotation MUST overlap: for a published period, the outgoing and incoming sets both run, so the chart bridges the change (D-11).
phase: 2
touches: tasks/rotation
needs: R-13
cell: `node prd-cells/R-16.cjs` exits 0; it simulates a rotation on fixture data and fails unless runs exist on both sets across the overlap period and the chart data joins the two.

**R-17.** When a set retires, its tasks and every past answer to them MUST be published in full (D-11, D-41).
phase: 2
touches: tasks/rotation; site/data
needs: R-16
cell: `node prd-cells/R-17.cjs` exits 0; it retires a fixture set and fails unless every task and every run transcript recorded against it becomes publicly readable.

**R-18.** The rotation interval MUST be a single published setting, stated on the methodology page (amendment A1: rotate faster). No interval was decided by Vince; the build proposes one in the Amendments ledger for his approval.
phase: 2
touches: tasks/rotation; site/methodology
needs: R-16
cell: `node prd-cells/R-18.cjs` exits 0; it fails unless the rotation interval is read from one setting, the methodology page shows that value, and the Amendments ledger carries Vince's approval of it.

**R-19.** The statistical rule for calling a change real MUST be published, dated, in the public repository before the first public result (D-16, D-44).
phase: 2
touches: stats/RULE.md
needs: none
cell: `node prd-cells/R-19.cjs` exits 0; it reads the git history and fails unless `stats/RULE.md` was committed before the earliest public result's timestamp and has not changed since without a dated amendment inside it.

**R-20.** The methodology page MUST state that special handling based on a lab recognizing the tasks' content cannot be ruled out by any outside benchmark (D-35).
phase: 2
touches: site/methodology
needs: none
cell: `node prd-cells/R-20.cjs` exits 0; it loads the methodology page and fails unless it contains the content-recognition limit statement.

**R-21.** The methodology page MUST state that a determined contributor can read the current task set, and that the signature still prevents faked results (amendment A1).
phase: 2
touches: site/methodology
needs: none
cell: `node prd-cells/R-21.cjs` exits 0; it loads the methodology page and fails unless it contains both statements.

**R-22.** A verdict headline MUST appear only when the published rule clears; otherwise the card MUST read "within normal variation" (D-16).
phase: 2
touches: stats/verdict
needs: R-19
cell: `node prd-cells/R-22.cjs` exits 0; it feeds the verdict engine one fixture series that clears the rule and one that does not, and fails unless only the first yields a headline and the second yields "within normal variation".

**R-23.** Every chart MUST show a confidence band (D-16).
phase: 2
touches: site/charts; stats/
needs: R-19
cell: `node prd-cells/R-23.cjs` exits 0; it renders every chart type from fixture data and fails unless each output carries a band with upper and lower bounds.

**R-24.** A model's baseline MUST be its first 7 days after release, pooled, then frozen (D-15).
phase: 2
touches: stats/baseline
needs: R-19
cell: `node prd-cells/R-24.cjs` exits 0; it feeds fixture runs spanning well past day 7 and fails unless the baseline equals the pooled days 1 to 7 and does not change when the later days are added.

**R-25.** Day one MUST be shown as its own point on each model's chart (D-15).
phase: 2
touches: site/charts
needs: R-24
cell: `node prd-cells/R-25.cjs` exits 0; it renders a fixture model chart and fails unless day one appears as a separately labelled point.

### Phase 3: Contributor flow and floor

**R-26.** Every series MUST be keyed by model, effort, access path (subscription or API) and app track (latest or frozen), and the statistics MUST NOT aggregate across keys (D-09, D-10, D-19, D-45).
phase: 3
touches: stats/series; site/data
needs: R-22
cell: `node prd-cells/R-26.cjs` exits 0; it loads fixture runs that differ only in effort, only in access path, and only in app track, and fails unless each lands in its own series and no computed value mixes two keys.

**R-27.** A contributor MUST be able to copy the public project to their own GitHub account, add their own login or API key to their copy's private settings, run it, and get a signed result, with no step on the site (D-05, D-23). Proved end to end as a contributor reaches it.
phase: 3
touches: README; .github/workflows/run.yml
needs: R-06
cell: `node prd-cells/R-27.cjs` exits 0; it drives a fresh test GitHub account through the README's steps (copy, add secret, run) against the real public repository and fails unless a result file with a valid attestation appears in that account's run.

**R-28.** The site MUST accept a result only when its attestation verifies against the official workflow at a published commit; anything else MUST be rejected (D-06, D-21).
phase: 3
touches: site/ingest
needs: R-06
cell: `node prd-cells/R-28.cjs` exits 0; it submits one valid result, one with a flipped byte, and one attested by a modified workflow, and fails unless only the first is accepted.

**R-29.** A run MUST support both access paths, subscription sign-in and API key, and record which it used (D-09).
phase: 3
touches: runner/auth; runner/record
needs: R-01
cell: `node prd-cells/R-29.cjs` exits 0; it reads one real run of each access path and fails unless both completed and each record names its path correctly.

**R-30.** A run MUST support both app tracks: "latest" installs the vendor's current release, and "frozen" installs the version pinned in one published setting that moves only on its schedule (D-10).
phase: 3
touches: runner/install; config/frozen-versions
needs: R-01
cell: `node prd-cells/R-30.cjs` exits 0; it runs one latest and one frozen run and fails unless the latest run's version equals the vendor's current release and the frozen run's equals the pinned setting.

**R-31.** Each run's public record MUST show the contributor's GitHub username (D-22).
phase: 3
touches: site/ingest; site/run-page
needs: R-28
cell: `node prd-cells/R-31.cjs` exits 0; it ingests a result from a test account and fails unless that account's username appears on the run's public record.

**R-32.** The start of every run MUST be recorded publicly before its result exists, so a contributor cannot publish only the runs they like (Claude's discretion, Area 6).
phase: 3
touches: .github/workflows/run.yml; site/ingest
needs: R-28
cell: `node prd-cells/R-32.cjs` exits 0; it starts a run and aborts it before completion, and fails unless the site lists that run as started and not completed.

**R-33.** A contributor MUST be able to choose any effort level the app offers, and the run record MUST name it (D-19, D-26).
phase: 3
touches: runner/effort; .github/workflows/run.yml
needs: R-01
cell: `node prd-cells/R-33.cjs` exits 0; it runs one non-default effort and fails unless the run used that effort and its record names it.

**R-34.** The supported list of apps and models MUST be one configuration Vince controls, and any listed model MUST be runnable by any contributor at any listed effort (D-26, D-27).
phase: 3
touches: config/catalog
needs: R-33
cell: `node prd-cells/R-34.cjs` exits 0; it fails unless every catalog entry can be selected in the workflow's run inputs and a model absent from the catalog is refused.

**R-35.** The site MUST have a public vote board where people request apps or models (D-26).
phase: 3
touches: site/requests
needs: none
cell: `node prd-cells/R-35.cjs` exits 0; it navigates from the home page to the request board, submits a request with a test account and votes on it, and fails unless both are shown.

**R-36.** Vince's floor MUST run each lab's newest flagship more than once a day, at different hours (D-14, D-38). No count was decided beyond "several times a day".
phase: 3
touches: floor/schedule
needs: R-27
cell: `node prd-cells/R-36.cjs` exits 0; it reads a day of floor runs and fails unless each lab's newest flagship has at least two runs started at different hours.

**R-37.** The floor MUST run default effort only (D-19).
phase: 3
touches: floor/schedule
needs: R-36
cell: `node prd-cells/R-37.cjs` exits 0; it reads the floor's run records and fails on any run whose effort is not the app's default.

**R-38.** The floor MUST run the same number of runs every day, launch week included (D-17).
phase: 3
touches: floor/schedule
needs: R-36
cell: `node prd-cells/R-38.cjs` exits 0; it reads the floor schedule across a simulated release and fails unless every day's run count is equal.

**R-39.** At launch the floor MUST run only on Vince's existing subscriptions (Claude, ChatGPT and Grok plans) and MUST NOT hold any API key (D-34, D-39).
phase: 3
touches: floor/config
needs: R-36
cell: `node prd-cells/R-39.cjs` exits 0; it reads the floor's configuration and run records and fails if any API key is configured or any floor run used the API path.

**R-40.** When a lab's successor flagship ships, the floor MUST keep the previous flagship through the successor's launch week and then stop running it (D-38).
phase: 3
touches: floor/schedule
needs: R-36
cell: `node prd-cells/R-40.cjs` exits 0; it simulates a successor release and fails unless the old flagship's floor runs continue through day 7 of the successor and none are scheduled after it.

### Phase 4: Public site

**R-41.** Each run's public record MUST show: app name and exact version, the install fingerprint, model, effort, access path, account source, start and end time with timezone, machine type, tasks passed, tokens in and out, cost, tool calls, duration, contributor, and a link that checks the signature (D-01, D-03, D-28, D-44).
phase: 4
touches: site/run-page
needs: R-31
cell: `node prd-cells/R-41.cjs` exits 0; it loads a real run's public record and fails unless every listed field is present and non-empty and the signature link verifies.

**R-42.** The home page MUST be a grid of one card per tracked model, each comparing now against its launch week with its verdict wording, with no ranking between models (D-30). Proved on the real build at its real address.
phase: 4
touches: site/home
needs: R-11, R-22
cell: `node prd-cells/R-42.cjs` exits 0; it opens the staging address in a real browser and fails unless each tracked model has one card showing a comparison with launch week and a verdict line, and no rank or position number appears.

**R-43.** A run's record MUST be reachable by clicking from the home page: model card, then the model's page, then the run (D-28).
phase: 4
touches: site/home; site/model-page; site/run-page
needs: R-41, R-42
cell: `node prd-cells/R-43.cjs` exits 0; starting at the home page in a real browser, it clicks a model card, then a run, and fails unless it lands on that run's record without typing any address.

**R-44.** App releases MUST appear automatically as chart markers linked to their official source (D-07, D-29).
phase: 4
touches: markers/app-releases
needs: R-23
cell: `node prd-cells/R-44.cjs` exits 0; it runs the marker job against the vendors' release feeds and fails unless each new release appears as a marker with a link to its official source.

**R-45.** Model releases MUST appear automatically as chart markers linked to their official source (D-07, D-29).
phase: 4
touches: markers/model-releases
needs: R-23
cell: `node prd-cells/R-45.cjs` exits 0; it runs the marker job against the labs' announcement sources and fails unless a known release appears as a marker with its source link.

**R-46.** Incidents on each lab's status page MUST appear automatically as chart markers linked to the incident (D-07, D-29).
phase: 4
touches: markers/status
needs: R-23
cell: `node prd-cells/R-46.cjs` exits 0; it runs the marker job against each lab's status page and fails unless a known past incident appears as a marker with its link.

**R-47.** Every move of a frozen app version MUST appear as a chart marker (D-10, D-29).
phase: 4
touches: markers/frozen
needs: R-30
cell: `node prd-cells/R-47.cjs` exits 0; it changes the frozen-version setting on a fixture and fails unless a marker appears on the affected charts at that date.

**R-48.** Every task rotation MUST appear as a chart marker (D-11, D-29).
phase: 4
touches: markers/rotation
needs: R-16
cell: `node prd-cells/R-48.cjs` exits 0; it runs a fixture rotation and fails unless a marker appears on every affected chart.

**R-49.** A lab's public explanation of a change MUST appear as a chart marker linked to its source (D-32).
phase: 4
touches: markers/lab-statements
needs: R-23
cell: `node prd-cells/R-49.cjs` exits 0; it adds a fixture lab statement and fails unless it appears as a linked marker and no run data changed.

**R-50.** A lab's written reply MUST be shown verbatim, collapsed by default, opened only by a deliberate click, and labelled as the lab's own words and not the site's (D-33).
phase: 4
touches: site/lab-replies
needs: R-42
cell: `node prd-cells/R-50.cjs` exits 0; in a real browser it loads a page with a fixture reply and fails unless the reply is collapsed on load, opens on click, matches the source text byte for byte, and carries the label.

**R-51.** A model with a successor MUST move from the home grid to an archive page reachable from the home page (D-40).
phase: 4
touches: site/home; site/archive
needs: R-42
cell: `node prd-cells/R-51.cjs` exits 0; it marks a fixture model superseded and fails unless it leaves the home grid and is reached by clicking from the home page to the archive.

**R-52.** An archived model MUST keep accepting community runs while it is reachable (D-40).
phase: 4
touches: site/ingest; config/catalog
needs: R-51
cell: `node prd-cells/R-52.cjs` exits 0; it ingests a signed result for an archived fixture model and fails unless the run is accepted and shown.

**R-53.** When a model can no longer be reached, its chart MUST freeze with a "retired <date>" marker (D-40).
phase: 4
touches: site/archive; markers/retired
needs: R-51
cell: `node prd-cells/R-53.cjs` exits 0; it marks a fixture model unreachable and fails unless its chart shows the retired marker with the date and accepts no new runs.

**R-54.** The public repository MUST contain the runner, the scoring, the statistics and the site (D-42).
phase: 4
touches: repository layout
needs: R-14, R-19, R-42
cell: `node prd-cells/R-54.cjs` exits 0; it lists the public repository's files and fails unless `runner/`, `scoring/`, `stats/` and `site/` are all present and public.

**R-55.** The site MUST list sponsors and in-kind contributions (credits, accounts) and offer a donation route (D-24, D-25).
phase: 4
touches: site/funding
needs: R-42
cell: `node prd-cells/R-55.cjs` exits 0; it clicks from the home page to the funding page and fails unless a sponsor list, an in-kind list and a working donation link are present.

**R-56.** A model page with hundreds of runs MUST still let a reader find an early run (collection surface).
phase: 4
touches: site/model-page
needs: R-43
cell: `node prd-cells/R-56.cjs` exits 0; it seeds hundreds of fixture runs on one model (the seeded-scale rule's own size; Vince set no figure) and fails unless the earliest run is reachable by browsing or filtering and the run count shown equals the number seeded.

**R-57.** A standalone verifier in the public repository MUST check any published run's signature and recompute its score without contacting the site (D-44).
phase: 4
touches: tools/verify
needs: R-06, R-14
cell: `node prd-cells/R-57.cjs` exits 0; with the site unreachable it runs the verifier on a published run's files and fails unless the signature verifies and the recomputed score equals the published one.

**R-58.** Run transcripts MUST become public when their task retires and stay public (D-41).
phase: 4
touches: site/data
needs: R-17
cell: `node prd-cells/R-58.cjs` exits 0; it retires a fixture task and fails unless its transcripts are served publicly and remain served after a simulated year.

**R-59.** Each run's public record MUST state its account source (self-paid, contributor-owned or donated), and no chart MUST split on it (D-25, Claude's discretion).
phase: 4
touches: site/run-page; stats/series
needs: R-41
cell: `node prd-cells/R-59.cjs` exits 0; it ingests fixture runs with each account source and fails unless each record names its source and all three land in the same series.

### Phase 5: Dry run and release switch

**R-60.** A private dry run on today's models MUST produce signed runs from all five apps into a staging store (D-43).
phase: 5
touches: staging
needs: R-01, R-02, R-03, R-04, R-05, R-06
cell: `node prd-cells/R-60.cjs` exits 0; it reads the staging store and fails unless it holds at least one verified run from each of the five apps.

**R-61.** In the dry run, the floor MUST be running on Vince's three subscriptions (D-43).
phase: 5
touches: floor; staging
needs: R-39, R-60
cell: `node prd-cells/R-61.cjs` exits 0; it reads the staging store and fails unless floor runs exist from each of the three labs, on the subscription path, within the last day.

**R-62.** The staging site MUST show the dry-run data and MUST NOT be publicly reachable (D-43).
phase: 5
touches: staging; site
needs: R-42, R-60
cell: `node prd-cells/R-62.cjs` exits 0; it fails unless the staging address shows dry-run cards when authenticated and returns no content to an unauthenticated request from outside.

**R-63.** One action MUST make the site public and start the launch-week baseline for the newly released flagship, proved on a staging copy (D-37, D-43).
phase: 5
touches: release/switch
needs: R-62
cell: `node prd-cells/R-63.cjs` exits 0; on a disposable copy of staging it runs the switch naming a fixture flagship and fails unless the copy becomes publicly reachable and that flagship's baseline window starts at the switch date.

**R-64.** The floor MUST start running a newly released flagship on its release day (D-44).
phase: 5
touches: floor/schedule; release/switch
needs: R-63
cell: `node prd-cells/R-64.cjs` exits 0; it simulates a release at a fixed time and fails unless the first floor run of that model starts the same calendar day.

**R-65.** After launch, each other lab MUST join only at its own next flagship, which gets its own launch-week baseline (D-37).
phase: 5
touches: config/catalog; release/switch
needs: R-63
cell: `node prd-cells/R-65.cjs` exits 0; it simulates a second lab's flagship after launch and fails unless that model's baseline starts at its own release and no earlier model from that lab appears publicly.

**R-66.** Every cell in this matrix MUST pass in the dry-run world named under "Verification world", at the same time.
phase: 5
touches: this PRD
needs: R-60, R-61, R-62, R-63, R-64, R-65
cell: `node prd-cells/R-66.cjs` exits 0; it runs every other cell in this document (all ids except R-66) against the dry-run world and fails unless all exit 0. It never runs itself.

**R-67.** Before the release switch runs, OpenAI's and xAI's terms for automated use of their subscription tools MUST be read and their relevant clauses quoted in `research/terms.md`, with any clause that forbids the floor or the contributor flow put to Vince before launch.
phase: 5
touches: research/terms.md
needs: none
cell: `node prd-cells/R-67.cjs` exits 0; it fails unless `research/terms.md` quotes OpenAI's and xAI's clauses with source links and a dated line records Vince's answer on any forbidding clause, or states that none forbids.

## Negative requirements

**N-01.** No run environment MUST contain any file, setting or process from `C:\Users\Vince\.harness-v2` or Vince's personal Claude, Codex or Grok configuration (D-02).
phase: 1
touches: runner/
needs: R-07
cell: `node prd-cells/N-01.cjs` exits 0; it inspects a real run's machine inventory and fails if any path, hook, skill, instruction file or environment variable traceable to harness-v2 or Vince's personal configuration is present.

**N-02.** The benchmark MUST NOT be a single fixed prompt, and MUST NOT borrow a public benchmark's tasks (rejected alternatives, D-12, D-13).
phase: 2
touches: tasks/
needs: R-13
cell: `node prd-cells/N-02.cjs` exits 0; it fails if any active set holds fewer than 50 tasks or any task's source matches a published benchmark's task list (SWE-bench family, Aider Polyglot).

**N-03.** No task in a current (unretired) set MUST be published anywhere by the site or the public repository (D-45, amendment A1 scopes this to what the project publishes).
phase: 2
touches: tasks/; site/; repository
needs: R-15
cell: `node prd-cells/N-03.cjs` exits 0; it searches the public repository, its history and the site's public output for the text of every current task and fails on any match.

**N-04.** The site MUST NOT have any field, endpoint or storage that receives a contributor's Claude, ChatGPT or Grok login, session token or API key (D-45).
phase: 3
touches: site/
needs: R-28
cell: `node prd-cells/N-04.cjs` exits 0; it scans the site's code and schema for credential-shaped fields and fails on any; it then posts a fake token to every ingest endpoint and fails unless each is refused and nothing is stored.

**N-05.** The site MUST NOT accept results produced on a contributor's own computer, and MUST NOT have an "unverified" results view (D-21, rejected alternatives).
phase: 3
touches: site/ingest
needs: R-28
cell: `node prd-cells/N-05.cjs` exits 0; it submits a result produced locally without attestation and fails unless it is refused, and fails if any route serves unverified results.

**N-06.** The site MUST NOT accept anonymous runs (rejected alternative, D-22).
phase: 3
touches: site/ingest
needs: R-31
cell: `node prd-cells/N-06.cjs` exits 0; it submits a validly signed result whose run carries no GitHub account identity and fails unless it is refused.

**N-07.** The site MUST NOT host or run contributors' sessions (the rejected one-click flow, D-23).
phase: 3
touches: site/
needs: R-27
cell: `node prd-cells/N-07.cjs` exits 0; it scans the site's deployment for any job runner, agent binary or vendor CLI and fails on any.

**N-08.** The floor MUST NOT run more on launch-week days than on other days (rejected alternative, D-17).
phase: 3
touches: floor/schedule
needs: R-38
cell: `node prd-cells/N-08.cjs` exits 0; it reads the floor schedule across a simulated release and fails if any launch-week day has more floor runs than a non-launch-week day.

**N-09.** No published run MUST be edited, removed or re-scored for anyone, labs and sponsors included, and no delete path MUST exist (D-32, D-41, D-45).
phase: 4
touches: site/data; site/admin
needs: R-41
cell: `node prd-cells/N-09.cjs` exits 0; it attempts to edit, delete and re-score a published fixture run through every admin and data route and fails unless each is refused and the run's stored bytes are unchanged.

**N-10.** No verdict text MUST contain "nerfed" or any wording that attributes intent to a lab (D-31, D-45).
phase: 4
touches: stats/verdict; site/
needs: R-22
cell: `node prd-cells/N-10.cjs` exits 0; it generates every verdict template with fixture data and fails if any contains "nerf", "deliberate", "intentional", "on purpose" or "throttled".

**N-11.** The site MUST NOT rank models against each other anywhere (rejected leaderboard, D-30).
phase: 4
touches: site/
needs: R-42
cell: `node prd-cells/N-11.cjs` exits 0; it crawls every public page from the home page and fails if any shows a rank, position number or ordering by score across models.

**N-12.** Chart markers MUST NOT be editorial or community-submitted (rejected alternative, D-29).
phase: 4
touches: markers/
needs: R-44
cell: `node prd-cells/N-12.cjs` exits 0; it fails if any marker in the store lacks an official source from the allowed marker types (app release, model release, status incident, frozen move, task rotation, lab statement, retirement).

**N-13.** No product name or logo MUST contain "Claude" or "Anthropic" (D-31).
phase: 4
touches: site/; design/
needs: R-11
cell: `node prd-cells/N-13.cjs` exits 0; it reads the site's title, header and logo text and fails if any contains "Claude" or "Anthropic".

**N-14.** No model released before launch MUST appear on the public site, and dry-run data MUST never be published (D-37).
phase: 5
touches: staging; release/switch
needs: R-63
cell: `node prd-cells/N-14.cjs` exits 0; after running the switch on a staging copy it fails if any dry-run run or any model released before the switch date is served publicly.

## Out of scope, named

- D-34 (Vince accepts suspension risk on his own subscriptions) is a decision about risk, not a behaviour to build; R-39 builds what it permits.
- The two items surfaced at gate firing 3 and not taken up: model renames or silent swaps behind a name, and contributor-flow abuse at scale. Not decided; not built.
- Reusing Margin Evals as the runner engine is Claude's discretion; the requirements bind behaviour, not the engine.

## Verification matrix

Every requirement's cell is one file under `prd-cells/`, emitted with this PRD as a stub that exits 1 and replaced by the build with the real check. `prd-verify.cjs` runs each and reads its exit.

| Id | Cell file | Phase |
|---|---|---|
| R-01 to R-11, N-01 | prd-cells/R-01.cjs ... R-11.cjs, N-01.cjs | 1 |
| R-12 to R-25, N-02, N-03 | prd-cells/R-12.cjs ... R-25.cjs, N-02.cjs, N-03.cjs | 2 |
| R-26 to R-40, N-04 to N-08 | prd-cells/R-26.cjs ... R-40.cjs, N-04.cjs ... N-08.cjs | 3 |
| R-41 to R-59, N-09 to N-13 | prd-cells/R-41.cjs ... R-59.cjs, N-09.cjs ... N-13.cjs | 4 |
| R-60 to R-67, N-14 | prd-cells/R-60.cjs ... R-67.cjs, N-14.cjs | 5 |

### Verification world

The one state in which every cell passes at the same time: the public GitHub repository at the release candidate commit; a private staging deployment of the site (authenticated access only) holding dry-run data from today's models on all five apps; Vince's floor running on his three subscriptions with no API key configured; one test GitHub contributor account; fixture data for statistics, rotation, markers and seeded scale kept in a separate fixture store that never reaches the staging or public data; and every switch-dependent cell (R-63, R-64, R-65, N-14) run on a disposable copy of staging, never on staging itself. Checked against the whole matrix: R-62 (staging not public) and R-63 (switch makes public) hold together because R-63 acts on a copy; R-39 (no API key in the floor) and R-29 (API path works) hold together because R-29's API run is a contributor run from the test account; N-09 (nothing deleted) and N-14 (dry-run data never published) hold together because dry-run data is never published, so nothing is deleted from the public record; R-66 runs every cell except itself.

## Verbatim answers appendix

Decision-relevant exchanges, carried here so no executor reopens the log. Precedence: newest explicit intent, then these answers, then this document's prose.

- Positioning: "Anyone can run it, verified (Recommended)".
- Access path: "Both, charted separately (Recommended)". App version: "Two tracks: latest + frozen (Recommended)".
- Secrecy: "Hidden, fingerprinted, rotated (Recommended)". Test type: "Set of coding tasks, auto-graded (Recommended)", whose description read "Roughly 50 to 100 real coding tasks". Task source: "Fresh real-world tasks, harvested (Recommended)".
- Cadence: "Your small floor + community (Recommended)". Baseline: "Launch week, pooled (Recommended)". Verdicts: "Only when statistically real (Recommended)". Launch week: "Same volume every day".
- Effort: "Default line + others separate (Recommended)". Two defaults: "Auto-approve, web off, disclosed (Recommended)".
- Local runs: "Verified cloud runs only (Recommended)". Identity: "Signed in, username public (Recommended)". Contributor: "Copy the public project, run it (Recommended)".
- Funding: "all of the above. all companies can sponsor, plus we take community donations. and i fund it myself if i don't get enough of either 2 or 3 (which obviously is right now, since the project is just starting). even if companies sponsor, it doesn't change anything about the tests anyway - so what's there to attack? if anything, it's good that a company sponsors - it means they're open to transparancy and accountability of their models' performances. which could be a good thing for them to donate either api credits or discounted/free accounts for me, etc. it allows me to not incur too much of a personal financial hit over time, if companies actually do participate"
- Lab credits: "might as well be option 3 anyway. if labs want to detect against these benchmarks, there's nothing i can do to stop them. so might as well make sure i leave myself open to at least collecting as much cash/accounts/credits, in order to do as much testing as possible. and they can't catch all runs anyway, especially from community users. so things will end up leveling/averaging out"
- Selection: "You add support, anyone runs it (Recommended)". Floor size: "Newest flagship per lab (Recommended)".
- Run record: "Everything, plus the proof (Recommended)". Markers: "Official events, automatic (Recommended)". Home page: "Each model vs its launch week (Recommended)".
- Wording: "Playful name, neutral verdicts (Recommended)". Lab replies: "option 1, and users have to deliberately expand option 2 if a lab replies. that way, it's additional context if they want it - with the understanding that it's the lab's response verbatim, and nothing to do with me". Account risk: "Run it on yours, accept the risk".
- Apps: "option 1, 2, and claude desktop app too? so it's fair, if we're adding codex windows app anyway?" Grok: "Third lab at launch". Old models: "Wait for the next release". Launch: "First new flagship from either lab (Recommended)", read as any of the three labs after the Grok answer.
- Spending: "i won't be using api at the beginning. until i have more disposable income, and/or some donations/companies start contributing. so don't set a dollar amount now, i'll be using the subscriptions I already have (grok $100 plan, codex and claude both at $200 plans)"
- Retirement: "option 2. most don't care about older models when new ones are out. the public is still free to contribute runs though. i won't be though, a little bit after the latest one comes out", with the recorded reading confirmed: "Reading's right, create them (Recommended)".
- Retention: "Everything, forever, public (Recommended)". Open code: "All open except the hidden tasks (Recommended)".
- Done means: "Ready to flip on release day (Recommended)". Must happen: all four. Must not: all four.
- Design: "PRD now, design as its first phase (Recommended)".
- Task leaks (during drafting): "Accept it, rotate faster, say so (Recommended)".
- From the opening message: "it's as if someone freshly downloaded claude code or codex or whatever model from whatever lab i'm testing, and whatever their default harness/app is - and they literally run that prompt or benchmark as if from scratch".

## Amendments ledger

Append only. Empty at birth: no amendment has been made yet.
