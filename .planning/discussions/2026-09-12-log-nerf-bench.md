# nerf-bench - Discussion Log

**Audit trail only. Not for implementation reference.**
Decisions are in 2026-09-12-context-nerf-bench.md; this log preserves the alternatives considered.

**Date:** 2026-09-12
**Topic:** nerf-bench
**Status:** Complete
**Areas discussed:** Positioning, What is measured, The tests, Cadence and confidence, What clean means, Community runs and trust, Who pays and who picks, The public site, Tone and exposure, Launch scope, Personal spending cap, Task source, Launch trigger, Contributor flow, Model retirement, Retention, Open code, Closing round

---

## 1. Positioning vs Marginlab and IsItNerfed

First ask (Marginlab known only from search snippets; its page returned 403 to WebFetch):

| Option | Description | Selected |
|--------|-------------|----------|
| Anyone can run it, verified (Recommended) | Public produces the data on audited cloud machines; signed setup record per run | |
| Stronger science, you run it | Vince runs everything; beat Marginlab on rigor | |
| Join an existing tracker | Offer the method to Marginlab or IsItNerfed | |

**User's choice:** none; verification request instead: "invoke codex windows app to drive chrome extension, so it can view these websites for you. and you can work with each other back and forth"
**Notes:** Verified inline via Codex task 01a09918-feab-70f3-b44c-5a5d6e2eb95d (gpt-6-astra medium, nerf-bench Codex project, Chrome extension). Findings: .planning/research/trackers-codex.md. Along the way Vince required the Codex task to sit in the nerf-bench Codex project ("make sure you assign it to nerf-bench project as well") and to run on Astra medium ("it's supposed to default to astra medium"); both routed to the steward as R679/R687. Question re-asked with the verified facts.

Re-ask:

| Option | Description | Selected |
|--------|-------------|----------|
| Anyone can run it, verified (Recommended) | Public runs the same clean test on audited cloud machines with their own login; each result carries a signed record of app version, settings, effort, tokens; Vince is referee not sole runner; the one thing neither tracker does | X |
| Stronger science, you run it | Vince runs everything with more runs/day, several times of day, efforts separate, pinned app track, full per-run record | |
| Build on Marginlab's open runner | Use Margin Evals (AGPL-3.0) runner and stats; add community runs and disclosure; AGPL requires own version open source | |
| Offer your method to them | Pitch to Marginlab or IsItNerfed; their brand and call | |

**User's choice:** Anyone can run it, verified (Recommended)
**Notes:** Whether to reuse Margin Evals as the engine is left as implementation (Claude's discretion), constrained by AGPL if reused.

---

## 2. What is measured

Access path (stem cited Vince's opening message for who complains, and Anthropic's legal page for the hosted-runner sign-in rule):

| Option | Description | Selected |
|--------|-------------|----------|
| Both, charted separately (Recommended) | Subscription line and API line never averaged; divergence is evidence of a serving-path change | X |
| Subscription only | What complaints are about; no comparison | |
| API only | Cleanest; not what people complain about | |

**User's choice:** Both, charted separately (Recommended)

App version (batched with the above):

| Option | Description | Selected |
|--------|-------------|----------|
| Two tracks: latest + frozen (Recommended) | Latest = what users get; frozen app version advanced on a schedule and marked on the chart; split between tracks shows app vs model | X |
| Latest only | Record version, attribute after the fact (Marginlab today) | |
| Frozen only | Isolates model; drifts from reality, may be broken by labs | |

**User's choice:** Two tracks: latest + frozen (Recommended)
**Notes:** Answers checked against each other: consistent. Combined they imply four series per model/effort (subscription x API, latest x frozen); cost and statistical fill-rate consequence carried into Areas 4 and 7.

---

## 3. The tests

Secrecy (stem: prompts pass through lab servers; community runs distribute tests):

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden, fingerprinted, rotated (Recommended) | Delivered only inside the sealed cloud run; day-one fingerprint of the set published; scheduled rotation with retired tasks and all past answers published; overlap period bridges the chart | X |
| Fully public | Max reproducibility; labs could tune for them | |
| Secret forever | Labs can't tune; public must trust Vince | |

**User's choice:** Hidden, fingerprinted, rotated (Recommended)

Test type (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Set of coding tasks, auto-graded (Recommended) | ~50-100 real coding tasks, pass/fail by automatic checks, no judge | X |
| One fixed prompt, many repeats | Vince's original picture; narrow, noisy, recognizable | |
| Coding plus judged writing | Broader; AI judge can itself drift | |

**User's choice:** Set of coding tasks, auto-graded (Recommended)
**Notes:** Consistent with each other. Replaces the opening message's "a particular benchmark/prompt" with a task set; Vince chose it with the reason in view. Consequence for Area 8: per-run disclosure of raw outputs for hidden tasks is withheld until the task retires.

---

## 4. Cadence and confidence

Who guarantees runs (stem cited Marginlab thresholds from trackers-codex.md and Ofir Press on HN):

| Option | Description | Selected |
|--------|-------------|----------|
| Your small floor + community (Recommended) | Vince runs a small scheduled set several times a day at spread hours; community adds volume | X |
| Community only | Free; gaps on unpopular models | |
| You run it all, heavily | Most solid, most expensive, the treadmill | |

**User's choice:** Your small floor + community (Recommended)

Baseline (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Launch week, pooled (Recommended) | First 7 days pooled and frozen; day one still shown as its own point | X |
| Day one only | Vince's framing; noisy | |
| Rolling 30 days | Hides slow slides | |

**User's choice:** Launch week, pooled (Recommended)

Verdicts (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Only when statistically real (Recommended) | Confidence band always; headline only when a pre-registered rule is cleared; else "within normal variation" | X |
| Numbers only, no verdicts | Readers judge | |
| Two tiers: 'watch' and 'confirmed' | Faster, false alarms | |

**User's choice:** Only when statistically real (Recommended)
**Notes:** Three answers consistent. Open consequence: models already released before launch (e.g. Opus 5, gpt-6-astra) have no observable launch week; carried to Area 10.

---

## 5. What clean means

Effort (stem cited Marginlab pooling high+xhigh from trackers-codex.md):

| Option | Description | Selected |
|--------|-------------|----------|
| Default line + others separate (Recommended) | Out-of-the-box effort is headline; other efforts separate lines, never pooled; Vince's floor covers default only | X |
| Default effort only | Simplest; misses effort changes | |
| Every effort, always | Complete; multiplies fixed bill 4-5x | |

**User's choice:** Default line + others separate (Recommended)

The two defaults an unattended run cannot keep (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-approve, web off, disclosed (Recommended) | Commands run without prompts inside sealed throwaway machine; web blocked; both printed on every run record as the only deviations | X |
| Auto-approve, web left on | Closer to install; model could search answers | |

**User's choice:** Auto-approve, web off, disclosed (Recommended)
**Notes:** Consistent. Clean defined in stem as: fresh throwaway machine, vendor's official install, no instruction files, add-ons or automatic scripts, default settings. Matches Vince's opening description.

---

## 6. Community runs and trust tiers

Local runs:

| Option | Description | Selected |
|--------|-------------|----------|
| Verified cloud runs only (Recommended) | Only sealed, signed runs on charts; home runs possible with open tools but not uploadable | X |
| Separate 'unverified' view | Secondary labelled page | |
| Everything, with badges | Same charts, marked | |

**User's choice:** Verified cloud runs only (Recommended)

Identity (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Signed in, username public (Recommended) | e.g. GitHub sign-in; username on each run; lab login never touches the site | X |
| Signed in, shown anonymously | Operator knows; public sees contributor number | |
| Fully anonymous | No account | |

**User's choice:** Signed in, username public (Recommended)
**Notes:** Consistent. This settles the opening message's "anti-tampering/encryption" clause: tamper resistance comes from sealed cloud runs plus a signed setup record, not from encrypting uploads. Anti-cherry-picking (every started run recorded publicly before its result, so contributors cannot submit only bad runs) and per-contributor share caps are Claude's discretion.

---

## 7. Who pays and who picks

Floor funding (stem: contributors self-pay per Anthropic terms; GitHub machines free for public projects; floor not priced yet):

| Option | Description | Selected |
|--------|-------------|----------|
| You fund it, hard monthly cap (Recommended) | Own accounts, published cap, pause shown openly | (part) |
| Community donations, never labs | Public pot, every dollar published, lab money refused | (part) |
| Sponsors allowed, disclosed | Companies sponsor, lab-affiliated excluded, listed | (part, broadened) |

**User's choice (typed):** "all of the above. all companies can sponsor, plus we take community donations. and i fund it myself if i don't get enough of either 2 or 3 (which obviously is right now, since the project is just starting). even if companies sponsor, it doesn't change anything about the tests anyway - so what's there to attack? if anything, it's good that a company sponsors - it means they're open to transparancy and accountability of their models' performances. which could be a good thing for them to donate either api credits or discounted/free accounts for me, etc. it allows me to not incur too much of a personal financial hit over time, if companies actually do participate"
**Clauses, each a decision:**
- (a) All companies may sponsor, AI labs included (overrides the "lab-affiliated excluded" and "never labs" parts of the offered options).
- (b) Community donations accepted.
- (c) Vince funds the floor himself as the backstop whenever sponsorship and donations fall short, which is the state at launch.
- (d) Sponsors may give in kind: API credits, discounted or free accounts.
- (e) Vince's view: sponsorship does not change the tests, and a lab sponsoring signals openness to accountability.
**Notes:** Clause (d) touches a premise: an account or API key a lab provides is known to that lab and could be served differently from an ordinary paying customer's, which is the very mechanism the site measures. Verified as a reasoning point, not an asserted fact about any lab. Re-presented as a narrowed follow-up on how lab-given accounts are used; (a)-(c) and (e) recorded as given.

Selection (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| You add support, anyone runs it (Recommended) | Vince decides supported apps/models; anyone runs any, any effort; public vote board for requests | X |
| Community can add new ones | Contributors wire up, Vince approves | |
| Fixed list, you run them | Short list only | |

**User's choice:** You add support, anyone runs it (Recommended)
**Notes:** Checked against the funding answer: consistent.

Follow-up on clause (d), lab-given accounts and credits. First ask got a verification question instead of a selection: "i'm compelled to pick option 2, but does that mean i'm completely shielded from option 1? can't labs find ways to use AI (lol) to find my identity, and then figure out what accounts are tied to what i use anyway, to run the tests, and then serve the tests differently anyway? in that case, might as well pick option 1? thoughts first on this please". Answered inline (task content identifies benchmark traffic regardless of account; cash-only gives no protection; paid-vs-donated comparison catches only account-level special treatment; content-level detection is undetectable from outside, to be stated on the methodology page), then re-asked:

| Option | Description | Selected |
|--------|-------------|----------|
| Used, but checked against paid (Recommended) | Donated-account runs as own line vs a small self-paid stream; gap shown as a finding; methodology states the content-detection limit | |
| Cash only from labs | Money only; no protection against content detection; loses savings | |
| Use them freely | Donated accounts treated like any other; no comparison stream | X |

**User's choice (typed):** "might as well be option 3 anyway. if labs want to detect against these benchmarks, there's nothing i can do to stop them. so might as well make sure i leave myself open to at least collecting as much cash/accounts/credits, in order to do as much testing as possible. and they can't catch all runs anyway, especially from community users. so things will end up leveling/averaging out"
**Notes:** Vince's call after the case was stated (fact d). Donated accounts, credits and cash from any company, labs included, are used like any other; no separate paid comparison stream is required. Not contradicted by, and kept as mechanics (Claude's discretion): each run's own record still states whether its account was self-paid, contributor-owned or donated, since Area 8 discloses setup per run; charts do not split on it. The methodology page states that content-based special handling cannot be ruled out from outside.

---

## 8. The public site

Run record:

| Option | Description | Selected |
|--------|-------------|----------|
| Everything, plus the proof (Recommended) | App + exact version, untouched-install fingerprint, model, effort, subscription/API, account source, start/end time with timezone, machine type, tasks passed, tokens in/out, cost, tool calls, duration, contributor, signature-check link; full transcripts once a task retires | X |
| Summary card, details on request | Headline on page, full record downloadable | |

**User's choice:** Everything, plus the proof (Recommended)

Markers (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Official events, automatic (Recommended) | App releases, model releases, lab status-page incidents, frozen-version moves, task rotations; auto with source links | X |
| Official + reviewed community notes | Plus approved community events | |
| No markers | Lines only | |

**User's choice:** Official events, automatic (Recommended)

Home page (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Each model vs its launch week (Recommended) | Grid of per-model cards, now vs launch week with verdict wording, opening into trend; no ranking | X |
| Leaderboard across models | Ranked by current score | |
| One big combined chart | All lines on one timeline | |

**User's choice:** Each model vs its launch week (Recommended)
**Notes:** Three answers consistent with each other and with Area 3 (transcripts withheld until retirement) and Area 7 (account source disclosed per run).

---

## 9. Tone and exposure

Wording (stem cited Anthropic postmortem, Marginlab May 2026 write-up, Anthropic name-use rule):

| Option | Description | Selected |
|--------|-------------|----------|
| Playful name, neutral verdicts (Recommended) | Memorable name like nerf-bench; verdicts state only what data shows, never intent | X |
| Neutral name and wording | e.g. "Model Drift Monitor" | |
| Lean into 'nerfed' | Viral; credibility risk | |

**User's choice:** Playful name, neutral verdicts (Recommended)

Lab replies (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Link it, never touch data (Recommended) | Lab statement as a linked chart marker; results never edited, removed or re-scored | X (with addition) |
| Plus a right-of-reply page | Site hosts labs' written responses | (as collapsed extra) |

**User's choice (typed):** "option 1, and users have to deliberately expand option 2 if a lab replies. that way, it's additional context if they want it - with the understanding that it's the lab's response verbatim, and nothing to do with me"
**Clauses:** (a) lab statements appear as linked markers and data is never touched; (b) a lab's written reply is hosted too, collapsed by default and opened only by a deliberate click; (c) it is shown verbatim, labelled as the lab's own words and not the site's.

Account risk for the subscription floor (batched; stem quoted Anthropic's "ordinary, individual usage"):

| Option | Description | Selected |
|--------|-------------|----------|
| Ask labs first; API floor meanwhile (Recommended) | Write to labs; floor API-only until yes; subscription line community-filled | |
| Separate subscription just for it | Dedicated account | |
| Run it on yours, accept the risk | Own subscriptions from day one | X |

**User's choice:** Run it on yours, accept the risk
**Notes:** Answers checked against each other and Area 7 (Vince funds the floor): consistent. Vince accepted suspension risk to the subscriptions he works in daily, with the risk stated in the stem.

---

## 10. Launch scope

Apps (stem: desktop-app sealed/signed runs unverified):

| Option | Description | Selected |
|--------|-------------|----------|
| Claude Code + Codex CLI (Recommended) | Two CLIs at launch, desktop apps once proven | X |
| Plus the Codex Windows app | Desktop from day one; delays launch until sealed desktop run proven | X |
| Plus other labs' tools | Gemini CLI etc.; per-tool setup and baseline | |

**User's choice (typed):** "option 1, 2, and claude desktop app too? so it's fair, if we're adding codex windows app anyway?"
**Clauses:** (a) Claude Code CLI and Codex CLI at launch; (b) Codex Windows app at launch; (c) Claude desktop app at launch too, for parity between labs. Consequence accepted with the stem in view: launch waits until sealed, signed desktop-app runs are proven for both desktop apps; feasibility is unverified and is the first thing the build must establish.

Models released before the site (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Track now, clearly labelled (Recommended) | Baseline = first 7 tracked days, labelled not-launch-week | |
| Wait for the next release | Launch with the next major release so the first thing tracked has a true day-one baseline | X |

**User's choice:** Wait for the next release
**Notes:** Consistent with the desktop-app delay and with Area 4's launch-week baseline. Current models (e.g. gpt-5.6 sol/terra/luna, gpt-6-astra) are not tracked; their successors are.

Floor size (batched) got a question instead of a selection: "probably 2, but that gets messy for some providers. for example, chatgpt has astra 6 (MAIN latest frontier), but then has 5.6 sol, terra, and luna (sol is the older frontier, terra is middle of the pack - think sonnet, and luna is fast and least intelligent - think haiku). so i'm not sure, but i'm pretty sure a lot of people are interested in those ones too. so the future versions of those - i'm pretty sure i have to support them?"

| Option | Description | Selected |
|--------|-------------|----------|
| Each lab's flagship, 2 total (Recommended) | One flagship per app on both lines and tracks | (leaning, not chosen) |
| Flagship + fast model per lab, 4 | Double floor bill | |
| Every supported model | Biggest bill | |

**Notes:** Answered inline: "supported" (anyone can run it, per Area 7) and "in your floor" (you pay to guarantee it) are separate; every tier can be supported without being in the floor. Re-asked narrowed, with a companion question on launch-week intensity.

Floor size, re-asked:

| Option | Description | Selected |
|--------|-------------|----------|
| Newest flagship per lab (Recommended) | Floor = each lab's newest top model; predecessor becomes community-only with history kept; all tiers supported, community-run | X |
| Flagship + middle tier per lab | About double | |
| All tiers per lab | 6-8 models | |

**User's choice:** Newest flagship per lab (Recommended)

Launch-week intensity (batched):

| Option | Description | Selected |
|--------|-------------|----------|
| Heavy launch week, light after (Recommended) | Several times normal volume in first 7 days for a tight baseline | |
| Same volume every day | Flat bill; looser baseline, bigger/longer drop needed to confirm | X |

**User's choice:** Same volume every day
**Notes:** Consistent with each other. Supported catalog = every tier people care about (successors to astra, sol, terra, luna and Anthropic equivalents), community-run.

---

## Gate, firing 1

| Option | Description | Selected |
|--------|-------------|----------|
| Explore these four first (Recommended) | Spending cap, task source, launch trigger, contributor flow | X |
| Create the artifacts | Four items recorded as unresolved | |
| Explore these + more | Plus model retirement, data retention, publishing the site's code | |

**User's choice:** Explore these four first (Recommended)
**Notes:** New areas 11-14 surfaced at the gate from re-reading the decisions. Model retirement, data retention and code publishing were named in the third option and are available for a later firing.

---

## 11. Personal spending cap

| Option | Description | Selected |
|--------|-------------|----------|
| $300 a month (Recommended, Unclear) | Middle guess; API volume sized to fit; pause shown at cap | |
| $100 a month | Thin floor | |
| $1,000 a month | Strong floor | |

**User's choice (typed):** "i won't be using api at the beginning. until i have more disposable income, and/or some donations/companies start contributing. so don't set a dollar amount now, i'll be using the subscriptions I already have (grok $100 plan, codex and claude both at $200 plans)"
**Clauses:** (a) Vince's floor spends nothing on API at launch; (b) no dollar cap is set now; (c) the floor runs on subscriptions he already holds: Grok $100 plan, Codex (ChatGPT) $200 plan, Claude $200 plan; (d) an API floor begins only once disposable income, donations or sponsorship allow. Consequence: at launch the API line (Area 2) is filled by community runs only. Clause (c) names Grok, a lab outside Area 10's launch scope; not recorded as a scope change, asked as its own follow-up.

Follow-up on clause (c), Grok:

| Option | Description | Selected |
|--------|-------------|----------|
| Supported later, not at launch (Recommended) | Launch stays Anthropic + OpenAI; xAI tool added once checked | |
| Third lab at launch | xAI's coding tool from day one, Grok plan as its floor | X |
| Not part of this | Grok mentioned only as a plan held | |

**User's choice:** Third lab at launch
**Amendment to Area 10 (apps) and Area 13 (launch trigger):** launch scope now spans three labs: Anthropic, OpenAI and xAI. xAI's coding tool is on the site at launch, with Vince's Grok plan as its floor; which tool, and whether it can run unattended and sealed, is unread and is a build-time feasibility item alongside the two desktop apps. Area 13's "first new flagship from either lab" is read as "from any of the three labs" (Claude's reading, stated to Vince in gate firing 2); each other lab joins at its own next flagship. Area 10's floor ("newest flagship per lab") becomes three models.

## 12. Where the hidden tasks come from (batched)

| Option | Description | Selected |
|--------|-------------|----------|
| Fresh real-world tasks, harvested (Recommended) | Real open-source bug fixes after a model's cutoff, auto-checked then hand-picked; steady rotation supply | X |
| Write our own from scratch | Fully original; slow | |
| Borrow a public benchmark | Fast; public, may be in training data; clashes with hidden-tasks decision | |

**User's choice:** Fresh real-world tasks, harvested (Recommended)

## 13. What triggers launch (batched)

| Option | Description | Selected |
|--------|-------------|----------|
| First new flagship from either lab (Recommended) | Live with whichever lab ships its next top model first; other lab joins at its own next flagship | X |
| Wait until both have shipped | Could be months; misses first launch week | |
| Any new model, any tier | Earliest; smaller debut | |

**User's choice:** First new flagship from either lab (Recommended)

## 14. What a contributor does to start a run (batched)

| Option | Description | Selected |
|--------|-------------|----------|
| Copy the public project, run it (Recommended) | Own GitHub copy, own login/key in its private settings, runs on GitHub machines, signed proof of the official unmodified test; nothing passes through the site | X |
| One click on the site | Friendliest; site hosts and pays for others' sessions | |

**User's choice:** Copy the public project, run it (Recommended)
**Notes:** Four answers read against each other and against earlier areas: no contradiction. Open consequence for the build, already flagged in Area 10: whether the two desktop apps can run on GitHub's machines under this flow is unverified.

---

## Gate, firing 2

| Option | Description | Selected |
|--------|-------------|----------|
| Create the artifacts (Recommended) | Retirement, retention, code publishing left to the build contract | |
| Settle those three first | About 3 more questions | X |

**User's choice:** Settle those three first

## 15. Model retirement

| Option | Description | Selected |
|--------|-------------|----------|
| Track to the end, then archive (Recommended) | Run on every reachable path until the last closes; freeze with retired marker; move to archive | |
| Stop at the announcement | Stop runs at retirement announcement; archive | X (modified) |

**User's choice (typed):** "option 2. most don't care about older models when new ones are out. the public is still free to contribute runs though. i won't be though, a little bit after the latest one comes out"
**Clauses:** (a) Vince's floor stops covering a model shortly after its successor ships, not at retirement; (b) the public may keep contributing runs to older models; (c) older models leave the spotlight once a successor exists. Claude's reading, put to Vince for confirmation at gate firing 3: the floor keeps the old flagship through the successor's launch week (7 days) so the two overlap, then stops; the old model stays open to community runs for as long as it is reachable and moves from the home grid to an archive page; its chart freezes with a "retired <date>" marker when it can no longer be reached. Consistent with Area 10 ("previous one becomes community-only, with its history kept").

## 16. Retention (batched)

| Option | Description | Selected |
|--------|-------------|----------|
| Everything, forever, public (Recommended) | Nothing deleted; records permanent; transcripts public from task retirement, permanently | X |
| Records forever, transcripts 12 months | Transcripts removed after a year | |

**User's choice:** Everything, forever, public (Recommended)

## 17. Open code (batched)

| Option | Description | Selected |
|--------|-------------|----------|
| All open except the hidden tasks (Recommended) | Runner, scoring, statistics, site public; current hidden tasks private until retired | X |
| Runner open, site private | Site and statistics private | |

**User's choice:** All open except the hidden tasks (Recommended)
**Notes:** 15-17 read against each other and earlier areas: no contradiction.

## Gate, firing 3

| Option | Description | Selected |
|--------|-------------|----------|
| Reading's right, create them (Recommended) | Confirms the Area 15 reading; proceed to closing round | X |
| Fix the retirement reading | Correct before writing | |
| Explore more | Model renames or silent swaps behind a name; contributor-flow abuse at scale | |

**User's choice:** Reading's right, create them (Recommended)
**Notes:** Area 15 reading confirmed as recorded. "Create the artifacts" given on the most recent firing.

## Closing round

Done means:

| Option | Description | Selected |
|--------|-------------|----------|
| Ready to flip on release day (Recommended) | All five apps sealed and signed in a private dry run on today's models; copy-and-run flow end to end; floor running on three plans; site shows dry-run data | X |
| Public with its first verdict | Done after a launch week and one published comparison | |
| CLIs ready, desktop apps later | Desktop apps as a second milestone | |

**User's choice:** Ready to flip on release day (Recommended)

Must happen (multi-select, first issue of the call refused by the question guard for no recommendation marker; re-issued with each option marked):

| Option | Selected |
|--------|----------|
| Every result checkable (Recommended) | X |
| Rule published first (Recommended) | X |
| Launch week captured (Recommended) | X |
| Every run fully disclosed (Recommended) | X |

Must not (multi-select):

| Option | Selected |
|--------|----------|
| Never hold a login (Recommended) | X |
| Never alter results (Recommended) | X |
| Never claim intent (Recommended) | X |
| Never mix lines (Recommended) | X |

**Notes:** Read against each other and against D-34 (Vince's own plans hold his own login, not a contributor's): consistent.

## After the artifacts: save and build contract

Save:

| Option | Description | Selected |
|--------|-------------|----------|
| Make it a repo and commit (Recommended) | Local git repo; commit the record; nothing pushed | X |
| Leave the files as they are | No history; checkpoint kept | |

Build contract offer (step 9b) got a question instead: "should we /design-crest and design a few concepts and brand package first? before we pick PRD? or include that as a step(s) in the PRD?" Named as a domain the discussion never entered (visual identity) and asked:

| Option | Description | Selected |
|--------|-------------|----------|
| PRD now, design as its first phase (Recommended) | Brand and site concepts as an early phase alongside technical proofs; Vince's concept pick is a checkpoint | X |
| Design concepts first, then PRD | design-craft now, PRD around the chosen identity | |
| Discuss the look first | Extra discussion round on name, feel, chart style | |

**User's choice:** PRD now, design as its first phase (Recommended)
**Notes:** Recorded as D-46. Answers the 9b offer as yes (cut the PRD).

---

## Claude's Discretion

- Test runner engine choice (build own vs reuse open-source Margin Evals), subject to its licence.
- Anti-cherry-picking mechanics and per-contributor share caps (Area 6 notes).
- Account source recorded per run though charts do not split on it (Area 7 follow-up notes).
- Exact statistical rule, volumes and times of day within the Area 4 decisions.

## Deferred Ideas

- Shown at gate firing 3 as the explore-more option and not taken up: model renames or silent swaps behind a name; contributor-flow abuse at scale. Not decided.

---

*Topic: nerf-bench*
*Discussion log generated: 2026-09-12*
