# nerf-bench - Context

**Gathered:** 2026-09-12 to 2026-09-13
**Status:** Ready for implementation

<domain>
## Scope Boundary

A public website that measures whether frontier AI models' real-world performance changes after release, tracked daily against each model's launch week, with every run produced in a clean vendor-default environment and independently verifiable. Anyone can contribute runs under strict, sealed conditions; results carry proof of the exact setup. Covers: the test method, the run environment, the contributor flow, anti-tampering, statistics and verdicts, the public site, funding of the operator's own runs, and launch scope. It does not cover promoting the site or anything in Vince's own harness (harness-v2).

</domain>

<decisions>
## Implementation Decisions

### Carried from the opening brief
- **D-01:** The site is public and exists to hold labs accountable with measured data on performance change over time, including token usage.
- **D-02:** Runs happen in an isolated environment unique to the test, never inside harness-v2: no hooks, skills, instruction files or any harness mechanism can steer them. The standard is "as if someone freshly downloaded" the vendor's tool and ran the test from scratch.
- **D-03:** The site publishes how every result was produced: which app, which exact version, which model, effort level, tokens used, and anything else scientifically relevant.
- **D-04:** Effort level is a first-class variable.
- **D-05:** The public can run the same test under the same strict requirements and contribute results, so the operator is not the only runner.
- **D-06:** Contributed results must resist tampering: modified or skewed results cannot enter the data.
- **D-07:** The site marks key dated events so inflection points can be seen.

### 1. Positioning
- **D-08:** The differentiator versus Marginlab and IsItNerfed is verified community runs: anyone runs the exact same clean test on audited cloud machines under their own account, and each result carries a signed record of app version, settings, effort and tokens. Vince is the referee, not the only runner.

### 2. What is measured
- **D-09:** Two access paths are tracked and charted as separate lines, never averaged: signed in with a subscription, and API key.
- **D-10:** Two app-version tracks per model: "latest" (whatever version is current) and "frozen" (one version held fixed, advanced only on a schedule and marked on the chart when it moves).

### 3. The tests
- **D-11:** The task set is hidden: delivered only inside the sealed run, never shown to contributors. A fingerprint of the set is published on day one. Tasks rotate out on a schedule; each rotation overlaps the old set for a period to bridge the chart; retired tasks are published in full with every past answer.
  - *Amendment A1 to D-11, 2026-09-13, during /prd drafting:* under D-23 a contributor owns their copy's settings and logs, so "never shown to contributors" cannot be guaranteed. Vince chose: keep both D-11 and D-23; the methodology page states that a determined contributor can read the current tasks; tasks rotate faster to limit a leak's life; results stay unforgeable because the signature covers them. "Hidden" now means hidden from the public and from training data, not from every contributor. No rotation interval was chosen.
- **D-12:** Each run is a set of roughly 50 to 100 real coding tasks, each passing or failing on automatic checks (for example, tests pass). No human or AI judge. This replaces the opening brief's single fixed prompt.
- **D-13:** Tasks come from real bug fixes in open-source projects dated after a model's knowledge cutoff, checked automatically and then hand-picked. This is also the supply for rotation.

### 4. Cadence and confidence
- **D-14:** Vince runs a small guaranteed floor several times a day at spread-out hours; community runs add volume on top.
- **D-15:** Baseline is the model's first 7 days after release (launch week), pooled and then frozen. Day one is shown as its own point.
- **D-16:** A change is called only when it clears a statistical rule published before any data exists. Every chart shows a confidence band; wobbles inside it read "within normal variation". Example headline shape: "Down 6 points this week, 95% confident".
- **D-17:** The floor runs the same volume every day, including launch week (no launch-week surge).

### 5. What clean means
- **D-18:** Clean = fresh throwaway machine, the vendor's official install, no instruction files, extras, add-ons or automatic scripts, default settings.
- **D-19:** Each app's out-of-the-box effort is the headline line. Any other effort a contributor picks is its own separate line, never pooled. The floor covers default effort only.
- **D-20:** The only two deviations from a fresh install: commands are auto-approved (the machine is sealed and discarded), and web access is blocked. Both are printed on every run record.

### 6. Community runs and trust
- **D-21:** Only sealed, signed cloud runs appear on the site. Runs on people's own computers cannot be uploaded (the open tools still let anyone run the test privately).
- **D-22:** Contributors sign in (for example with GitHub) and their username is shown publicly on each run.
- **D-23:** A contributor makes their own copy of the public project on GitHub, puts their own login or API key in that copy's private settings, and runs it on GitHub's machines. The result is signed with proof that the official, unmodified test ran. Nothing passes through the site.

### 7. Funding and selection
- **D-24:** Funding sources: sponsorship from any company, AI labs included; community donations; Vince funds the rest himself, which is all of it at launch.
- **D-25:** Sponsors may give in kind (API credits, free or discounted accounts). Lab-given accounts and credits are used like any other account, with no separate paid comparison stream. Vince's reasoning: labs can detect benchmark traffic from task content regardless of account, the aim is to maximize testing, and community runs from many accounts dilute any special handling.
- **D-26:** Vince decides which apps and models the runner supports. Within that list anyone can run anything at any effort. New requests go on a public vote board.
- **D-27:** Every tier people care about is supported (successors to OpenAI's astra, sol, terra and luna, and the equivalents from the other labs), and the community runs everything outside the floor.

### 8. The public site
- **D-28:** Each run's public record shows: app name and exact version, a fingerprint proving the install was untouched, model, effort, subscription or API, account source (self-paid, contributor-owned or donated), start and end time with timezone, machine type, tasks passed, tokens in and out, cost, tool calls, duration, contributor, and a link to check the signature. Full transcripts are published when their task retires.
- **D-29:** Chart markers are official events pulled in automatically with source links: app releases, model releases, incidents on each lab's status page, frozen-version moves, task rotations. No editorial markers.
- **D-30:** The home page is a grid with one card per model, each comparing now against launch week with its verdict wording and opening into the full trend. No ranking of models against each other.

### 9. Tone and exposure
- **D-31:** The name is playful and memorable (for example "nerf-bench"). Verdicts state only what the data shows, such as "confirmed drop of 7 points since launch week"; never "nerfed", never a claim of intent. Anthropic's rule applies: its names and logos may not appear in the product name or logo.
- **D-32:** A lab's public explanation appears as a linked chart marker. Data is never edited, removed or re-scored.
- **D-33:** A lab's written reply may also be hosted, verbatim, collapsed by default, opened only by a deliberate click, labelled as the lab's own words and not the site's.
- **D-34:** Vince's subscription floor runs on his own personal subscriptions from day one. He accepts the risk that scripted daily use exceeds "ordinary, individual usage" and his accounts are suspended.
- **D-35:** The methodology page states openly that special handling based on recognizing the tasks' content cannot be ruled out by any outside benchmark.

### 10. Launch scope
- **D-36:** Launch apps: Claude Code CLI, Codex CLI, the Codex Windows app, the Claude desktop app, and xAI's coding tool. Anthropic, OpenAI and xAI are three labs at launch.
- **D-37:** Models released before the site exists are not tracked. The site launches with the first new flagship from any of the three labs; each other lab joins at its own next flagship, each with a true launch-week baseline.
- **D-38:** The floor covers each lab's newest flagship (three models). When a successor ships, the previous flagship stays in the floor through the successor's launch week, then becomes community-only with its history kept.

### 11. Spending
- **D-39:** No API spend by Vince at launch and no dollar cap set. The floor runs on subscriptions he already holds: Claude $200 plan, ChatGPT/Codex $200 plan, Grok $100 plan. An API floor starts only once disposable income, donations or sponsorship allow. At launch the API line is filled by community runs only.

### 15-17. Lifecycle and openness
- **D-40:** A model with a successor moves from the home grid to an archive page and stays open to community runs while reachable. Its chart freezes with a "retired <date>" marker once it can no longer be reached.
- **D-41:** Everything is kept forever and public: run records permanently, transcripts from their task's retirement onward. Nothing is deleted.
- **D-42:** All code is public (runner, scoring, statistics, site). Only the current hidden tasks stay private until they retire.

### Closing contract
- **D-43 (done means):** Ready to flip on release day. Everything is built and proven in a private dry run on today's models: sealed, signed runs working for all five apps, the copy-and-run contributor flow working end to end, the floor running on Vince's three plans, the site showing the dry-run data. Going public when a flagship ships is flipping a switch.
- **D-44 (must happen):** Every result is independently checkable against the public code without trusting Vince. The statistical rule and the methodology page (including the D-35 limit) are public before the first result. The floor is already running on the day a flagship ships, so launch week is never missed. Every run carries its complete public record.
- **D-45 (must not):** The site never sees, stores or relays a contributor's Claude, ChatGPT or Grok login or API key. No run is edited, removed or re-scored for anyone, labs and sponsors included. No verdict claims intent or uses "nerfed". Effort levels, access paths and app-version tracks are never averaged into one line, and hidden tasks never leak before they retire.

### Visual identity (raised after the artifacts were written)
- **D-46:** Visual identity (name, logo, colours, chart style, voice) was not decided in this discussion. It becomes the first phase of the build contract, run alongside the technical feasibility proofs (desktop apps, xAI's tool), not ahead of them. Vince picking among brand and site concepts is a checkpoint inside that contract. D-31's "for example nerf-bench" stays a placeholder until then.

### Claude's Discretion
- Test runner engine: build new, or reuse Marginlab's open-source runner and statistics (Margin Evals, AGPL-3.0). D-42 already makes the code public, so the licence is compatible.
- Anti-cherry-picking mechanics (for example, every started run recorded publicly before its result, so contributors cannot submit only the bad ones) and a per-contributor share cap.
- Whether account source is recorded per run (it is: D-28) even though charts do not split on it (D-25).
- The exact statistical rule, volumes and times of day, within D-14 to D-17.

</decisions>

<specifics>
## Specific Ideas

- "it's as if someone freshly downloaded claude code or codex or whatever model from whatever lab i'm testing, and whatever their default harness/app is - and they literally run that prompt or benchmark as if from scratch - and THOSE are the results that are truly as untainted as possible."
- "was it ran through claude code? if so, what version? was it ran in codex cli? or codex windows app? how many tokens did it use. etc - anything that is scientifically important"
- "i'm sure people will eventually start demanding more and more from me in terms of 'test this please, test that please'" (the reason contributors pay for their own runs, D-23).
- On sponsorship: "if anything, it's good that a company sponsors - it means they're open to transparancy and accountability of their models' performances."
- On lab replies: "additional context if they want it - with the understanding that it's the lab's response verbatim, and nothing to do with me"
- On tiers: "chatgpt has astra 6 (MAIN latest frontier), but then has 5.6 sol, terra, and luna (sol is the older frontier, terra is middle of the pack - think sonnet, and luna is fast and least intelligent - think haiku)"

</specifics>

<canonical_refs>
## Canonical References

**Read these before implementing.**

### Prior art and gaps
- `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\research\trackers-codex.md` -- Marginlab and IsItNerfed methods, read in Chrome by Codex task 01a09918: Marginlab's 50 tasks a day, exact binomial and Wilson statistics, pooled high+xhigh Codex baseline, no outsider submissions, no per-run disclosure; IsItNerfed's votes plus unit-tested tasks with no significance rule.
- `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\research\notes.md` -- research notes, including the Anthropic terms quoted and the capability checks.
- https://github.com/Margin-Lab/evals -- open-source runner and statistics (AGPL-3.0), a candidate engine.
- https://news.ycombinator.com/item?id=46810282 -- critiques of daily degradation tracking: sample size, app-update confounds, time of day.

### Evidence that drops have non-model causes (D-31, D-35)
- https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues -- 2025 quality drop traced to infrastructure bugs; "We never reduce model quality due to demand, time of day, or server load."
- https://marginlab.ai/blog/claude-code-degraded-before-opus-4-8/ -- May 2026 dip attributed to a Claude Code version.

### Signing and terms
- https://docs.github.com/en/actions/concepts/security/artifact-attestations -- signed provenance tying an output to workflow, repository, commit and trigger (D-06, D-21, D-23, D-44).
- https://code.claude.com/docs/en/legal-and-compliance -- subscription sign-in is for ordinary use; no intermediating credentials; hosted Claude Code is allowed only with each user's own credentials; name and logo rules (D-23, D-31, D-34, D-45).

### Not yet read (build must read before relying on them)
- OpenAI's and xAI's terms for automated or CI use of their subscription tools.
- Which coding tool xAI offers, and whether it runs unattended.

</canonical_refs>

<code_context>
## Existing Code Insights

No code exists in this project yet; the folder holds only planning files.

### Reusable Assets
- Margin Evals (https://github.com/Margin-Lab/evals): runner, curated-suite pattern, exact binomial and Wilson statistics code, duplicate-run refusal, immutable publication pipeline.
- GitHub Actions artifact attestations: the signing mechanism for D-23.
- `C:\Users\Vince\.harness-v2\skills\benchmark\SKILL.md`: Vince's private benchmark with blind grading. It runs inside harness-v2 (D-02 forbids that here), so reuse ideas only, not the machinery.

### Established Patterns
- None in this project yet.

### Integration Points
- Contributors' own GitHub copies of the public project (D-23) are where runs execute. The site reads signed results and never receives credentials.

### Open feasibility items the build must settle first (from D-36 and D-43)
- A sealed, signed, unattended run of the Codex Windows app and the Claude desktop app on GitHub's machines (unverified).
- xAI's coding tool: which one, and whether it runs unattended and sealed (unread).
- Subscription sign-in inside a contributor's own GitHub copy, within each lab's terms (D-34 accepts the risk for Vince's floor only).

</code_context>

<deferred>
## Deferred Ideas

- Surfaced at gate firing 3 and not taken up when Vince chose to create the artifacts: how the site handles a lab renaming a model or quietly swapping the model behind a name, and contributor-flow abuse at scale. Neither was decided.

</deferred>

---

*Topic: nerf-bench*
*Context gathered: 2026-09-13*
