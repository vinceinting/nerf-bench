# Decisions Index

## Tier 1 - Key and cross-cutting decisions
<!-- Curated. Decisions shaping several features, or one-way doors.
     Read this whole section at every discussion start. -->
- (2026-09-13, nerf-bench) Only sealed, signed cloud runs appear on the site; home runs cannot be uploaded. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-21
- (2026-09-13, nerf-bench) Contributors run their own GitHub copy of the public project; the site never sees, stores or relays any login or API key. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-23
- (2026-09-13, nerf-bench) Subscription vs API, latest vs frozen app version, and effort levels are always separate lines, never averaged. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-09
- (2026-09-13, nerf-bench) Hidden task set, fingerprinted on day one, rotated, published on retirement. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-11
- (2026-09-13, nerf-bench) Baseline is a model's launch week, pooled and frozen; pre-release models are not tracked. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-15
- (2026-09-13, nerf-bench) Verdicts only when a pre-published statistical rule clears; never claim intent. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-16
- (2026-09-13, nerf-bench) Results never edited, removed or re-scored; everything kept forever and public. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-41
- (2026-09-13, nerf-bench) All code public except current hidden tasks. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-42

## Tier 2 - All decisions by category
<!-- Append-only. Every decision from every discussion, grouped by category.
     Read only the subsections matching a new topic's domain. -->
### nerf-bench/
- (2026-09-13) Public accountability site measuring post-release performance change, token usage included. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-01
- (2026-09-13) Runs isolated from harness-v2; vendor-default fresh install standard. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-02
- (2026-09-13) Every result discloses app, exact version, model, effort, tokens and all relevant setup. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-03
- (2026-09-13) Effort level is a first-class variable. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-04
- (2026-09-13) Public can contribute runs under the same strict requirements. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-05
- (2026-09-13) Contributed results resist tampering. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-06
- (2026-09-13) Dated events marked on charts. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-07
- (2026-09-13) Differentiator: verified community runs with signed setup records. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-08
- (2026-09-13) Subscription and API charted as separate lines. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-09
- (2026-09-13) Latest and frozen app-version tracks. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-10
- (2026-09-13) Hidden, fingerprinted, rotated task set. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-11
- (2026-09-13) 50-100 auto-graded coding tasks per run, no judge. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-12
- (2026-09-13) Tasks harvested from post-cutoff real open-source bug fixes. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-13
- (2026-09-13) Small operator floor several times a day plus community volume. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-14
- (2026-09-13) Launch-week pooled baseline, day one shown. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-15
- (2026-09-13) Pre-published statistical rule; confidence band always shown. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-16
- (2026-09-13) Same floor volume every day, no launch-week surge. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-17
- (2026-09-13) Clean defined: fresh throwaway machine, official install, no extras, defaults. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-18
- (2026-09-13) Default effort headline; other efforts separate lines; floor covers default. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-19
- (2026-09-13) Only deviations: auto-approve commands, web blocked, both disclosed. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-20
- (2026-09-13) Verified cloud runs only. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-21
- (2026-09-13) Contributor sign-in, username public. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-22
- (2026-09-13) Copy-and-run contributor flow on GitHub, signed provenance. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-23
- (2026-09-13) Funding: any company incl. labs, donations, Vince as backstop. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-24
- (2026-09-13) Lab-given accounts and credits used like any other, no paid comparison stream. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-25
- (2026-09-13) Vince decides supported list; anyone runs anything; public vote board. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-26
- (2026-09-13) All tiers supported, community-run outside the floor. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-27
- (2026-09-13) Full public run record with signature-check link. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-28
- (2026-09-13) Automatic official-event markers only. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-29
- (2026-09-13) Home page: per-model cards vs launch week, no ranking. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-30
- (2026-09-13) Playful name, neutral verdicts, no lab names in product name. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-31
- (2026-09-13) Lab explanations as linked markers; data untouched. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-32
- (2026-09-13) Lab replies hosted verbatim, collapsed, labelled. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-33
- (2026-09-13) Floor on Vince's own subscriptions, suspension risk accepted. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-34
- (2026-09-13) Methodology states content-detection limit. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-35
- (2026-09-13) Launch apps: Claude Code, Codex CLI, Codex Windows app, Claude desktop, xAI tool. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-36
- (2026-09-13) Launch with first new flagship from any of three labs. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-37
- (2026-09-13) Floor = newest flagship per lab, overlap through successor's launch week. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-38
- (2026-09-13) No API spend or cap at launch; floor on existing Claude, ChatGPT, Grok plans. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-39
- (2026-09-13) Superseded models archived, community-open while reachable. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-40
- (2026-09-13) Everything kept forever and public. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-41
- (2026-09-13) All code public except current hidden tasks. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-42
- (2026-09-13) Done = ready to flip on release day after a private dry run. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-43
- (2026-09-13) Must happen: checkable, rule first, launch week captured, full disclosure. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-44
- (2026-09-13) Must not: hold logins, alter results, claim intent, mix lines. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-45
- (2026-09-13) Visual identity is the PRD's first phase, alongside feasibility proofs; concept pick is a checkpoint. -> .planning/discussions/2026-09-12-context-nerf-bench.md#D-46
