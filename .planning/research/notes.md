# nerf-bench research notes

Session cd1ada70-cd9a-4c2c-992b-96b26ec3392e, /discuss, started 2026-09-12 22:35 MDT.

## Prior art
- Marginlab (marginlab.ai/trackers/claude-code, /codex): daily Claude Code CLI and Codex runs on a curated SWE-Bench-Pro subset, latest release, vendor default harness, "statistically significant degradation" framing. Page 403 to WebFetch; details via search snippets and HN.
- HN thread 46810282: Ofir Press says 50 tasks once daily is underpowered, suggests ~300 tasks, 5-10x/day. Confounds raised: server load, Claude Code updates, GPU non-determinism, time of day. Antirez: oscillation may be A/B checkpoint tests.
- IsItNerfed.org: continuous evals across labs; methodology not visible on the blog page.
- Anthropic postmortem (Sept 2025): three infra bugs degraded quality Aug to early Sept 2025; "We never reduce model quality due to demand, time of day, or server load." VentureBeat later: harness and system-prompt changes likely caused a degradation.
- Existing /benchmark skill in harness-v2 (C:\Users\Vince\.harness-v2\skills\benchmark\SKILL.md): private suite, one isolated tab per model/effort, blind grading by fresh Fable tabs. Runs inside Vince's harness, so it is not the clean environment this project needs; its blind-grading idea is reusable.

## Codex (Astra) browser read, 2026-09-12 22:55: .planning/research/trackers-codex.md
- Gaps both trackers leave: no path for outsiders' results into the tracker, no attestation; no per-run public table of app version, full settings, cost, logs, raw outputs; subscription vs API not disclosed; no controlled separation of app-version vs model change (Marginlab infers from recorded versions after the fact); desktop apps not covered; Marginlab's Codex baseline pools high+xhigh effort. IsItNerfed has no stated significance rule and mixes in subjective votes.
- Marginlab's runner (Margin Evals) is open source AGPL-3.0 with exact binomial + Wilson CI stats code; outsiders can run it locally but cannot submit.

## Verified capabilities
- GitHub artifact attestations: signed (Sigstore) SLSA provenance binding an output file's digest to the workflow, repo, commit SHA and triggering event; public repos use the public Sigstore instance; verifiable with `gh attestation verify`. Backs the "signed record of the setup" claim for cloud runs.

## Open risks (secondary sources only, not official docs)
- Subscription (Pro/Max) auth is reported as permitted only with Claude Code and claude.ai; headless `claude -p` / CI use reportedly draws a separate monthly credit; `claude setup-token` gives a long-lived token for CI. Moving OAuth tokens outside the official CLI reported as prohibited. Must read Anthropic's own legal/auth docs before Area 9 decisions rely on it.

## Log
- 22:37 Opening list of 10 areas presented. Q1 (positioning) answered with a verification request: use Codex + Chrome to read the tracker sites.
- 22:39 Codex thread 01a0990f-9db9-70b2-b068-ab77a2b71e11 created with brief .planning/research/codex-brief-trackers.md (exit 0, accepted, not yet answered).
- Vince: the task belongs in the nerf-bench Codex project (id da788a12-5f50-469a-ab7b-eeb37369d856, local, not git). I wrote a one-off script to call create_thread myself; Vince rejected it (the established route is Codex creating the project task itself). Script deleted unrun. Sent 01a0990f a request to stop browsing and create the task in the nerf-bench project via its own create_thread; accepted (exit 0), not yet acted on. Reply due by to-claude.
- 22:45 Read back via /transcripts: 01a0990f created Codex thread 01a09912-4368-79b3-9caa-372e360b9a9b, folder C:\Users\Vince\Documents\VS Code Projects\nerf-bench, with the full brief. No duplicate needed. Findings due at .planning/research/trackers-codex.md.
- Vince: 01a09912 came up on Qwen; must be Astra medium (gpt-6-astra, thinking medium, id read from session 02d75f3b). Asked 01a0990f to archive 01a09912 and recreate in the nerf-bench project with model/thinking set (accepted, exit 0). Sent steward (14839687-65c8-4e33-9caa-4ddc45b45c48, resolved via steward.cjs) a request: codex.cjs default model astra medium + project targets matching caller folder. msg_id 9760fb37-ff3f-49b5-b416-20da900c013c. Steward registered R687 (default model) + R679 (project target).
- Vince archived 01a09912 himself. 01a0990f had not created a replacement. Ran .planning/research/codex-create-astra.cjs (02d75f3b pattern): created 01a09918-feab-70f3-b44c-5a5d6e2eb95d in nerf-bench project (local), model gpt-6-astra thinking medium; archived scratch 01a0990f. exit 0.

## Official terms read (code.claude.com/docs/en/legal-and-compliance)
- Subscription OAuth is "designed to support ordinary use of Claude Code"; third parties may not "route requests through Free, Pro, or Max plan credentials on behalf of their users" or "collect, store, or intermediate Claude.ai credentials".
- Hosting Claude Code in sandboxes/agent infrastructure is allowed under Commercial Terms if the binary is unmodified and each end user authenticates with their own key or subscription, billed to them. Relevant to Area 6/7: a hosted community runner is permitted only if each contributor signs in themselves through Anthropic's flow; the site must never hold their credentials.
- Name use: may say "runs Claude Code" in plain text; may not use Claude Code/Anthropic names in the product name or logo (Area 9 wording).
