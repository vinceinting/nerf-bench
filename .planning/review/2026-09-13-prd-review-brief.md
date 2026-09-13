# Blind review: phase 1 of the nerf-bench build contract review

series: prd-nerf-bench-review-2026-09-13
phase: 1 of 1

You are one of 3 reviewers in a consensus round over a finished build contract (PRD). Review blind: read the work, form your own findings, and file them by message. Nobody else's findings reach you until every reviewer has filed. After that the argument opens all-to-all, and it ends only when everyone explicitly agrees to one written version.

## 1. What to read before the code

merged tree: 3c23b4c on `main` of C:\Users\Vince\Documents\VS Code Projects\nerf-bench (11f6271 is the discussion record's commit and is context, not subject)
PRD: `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\prd\2026-09-13-nerf-bench-prd.md`
(All 81 requirements, R-01 to R-67 and N-01 to N-14, across its 5 phases are this review's subject.)
discussion record: `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\discussions\2026-09-12-log-nerf-bench.md`
(The authoritative log of Vince's answers. The decisions file beside it is C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\discussions\2026-09-12-context-nerf-bench.md )
running address: no running address; nothing is built yet, and the subject is the contract itself

Also open:
- The stub cells: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\prd-cells\ (one file per requirement id, each exiting 1 until the build replaces it) and their generator C:\Users\Vince\Documents\VS Code Projects\nerf-bench\prd-cells\make-stubs.cjs
- The scorer: `node "C:\Users\Vince\.harness-v2\tools\prd-verify.cjs" "C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\prd\2026-09-13-nerf-bench-prd.md"` (add `--list` for the inventory)
- The shape rules the contract must meet: C:\Users\Vince\.harness-accounts\vinceinting\skills\prd\references\shape.md
- Research the contract cites: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\research\trackers-codex.md and C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\research\notes.md
- Out-of-repo sources cited in the PRD's Grounding section: https://docs.github.com/en/actions/concepts/security/artifact-attestations , https://code.claude.com/docs/en/legal-and-compliance , https://x.ai/news/grok-build-cli

## 2. What the question is

Does this contract encode what Vince decided, as he decided it, in a form a build can be proved against? The charge is adversarial, and two checks are required of every reviewer:

1. Every requirement checked against the logged answer it encodes. Where the log and the PRD differ, the log wins unless a newer explicit answer exists. Look also for decisions or rejected alternatives in the log that landed nowhere.
2. Every cell checked for being runnable, unattended, against something other than the document that contains it. Also check whether all cells can pass at the same time in the PRD's named "Verification world".

A finding must give: the requirement id or file and line, what you observed, what you read or ran to observe it, and a severity: high, medium, low or trivial. Low and trivial findings are parked, not argued, so spend your effort on high and medium. A finding you could not verify says so. The parent's own doubts are deliberately not listed here, and any you infer are not the scope.

## 3. Where the answer goes

Send your blind findings in ONE message to `session:cd1ada70-cd9a-4c2c-992b-96b26ec3392e`, the orchestrator, and read the receipt back with `node "C:\Users\Vince\.harness-v2\tools\messages\peer.cjs" receipt --msg MSGID --session cd1ada70-cd9a-4c2c-992b-96b26ec3392e` where MSGID is the id the send printed. Sending that message is what filing IS; a notes file on disk files nothing. Write your notes as you go, one file per reviewer, to the one matching your engine:
`C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\notes-astra.md`
`C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\notes-fable.md`
`C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\review\notes-grok.md`

After the blind phase the orchestrator sends you the other reviewers' session ids and every filed finding. From then on you may message the other reviewers and the orchestrator directly. The seats settle their differences among themselves into one joint proposal, which one seat files as a round with `consensus.cjs round`; then the orchestrator answers with one disposition. Agreement is given with a digest the orchestrator hands you, against one exact version of a write-up, and only when you mean it. When you run `agree`, `round` or `dissent`, send the orchestrator the verb's printed OUTPUT, not the command text, because it waits by message and never reads the store. Do not close this tab yourself; the orchestrator closes it.
