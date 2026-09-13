# Grok seat notes: nerf-bench PRD review (phase 1)

Started 2026-09-13. Blind review. Log wins over PRD.

## What I read/ran
- PRD 2026-09-13-nerf-bench-prd.md (full)
- Context D-01..D-46, log (full)
- shape.md
- prd-verify --list: 81 cells, 5 phases, all placed
- prd-verify: 0 passed, 81 failed at birth
- stubs exist one-per-id, exit 1
- GitHub attestations page, Anthropic legal, x.ai/news/grok-build-cli

## High/medium findings

### H1. R-04/R-05 vs "GitHub-hosted" / contributor flow (high)
R-01..R-03 require GitHub-hosted throwaway machines. R-04/R-05 require throwaway Windows/desktop machines but do not say GitHub-hosted. D-23 and R-27 require the contributor flow to be "copy public project, run on GitHub's machines". Log Area 6/14 notes: "whether the two desktop apps can run on GitHub's machines under this flow is unverified" and launch waits until sealed signed desktop runs are proven.

R-27's cell is one GitHub copy/run and does not require all five apps. R-04/R-05 can pass on some other throwaway Windows box while R-27 never proves desktop apps on GitHub. D-43 requires all five apps in the dry run; D-23 still says GitHub machines.

Observed: PRD lines 60-70 vs 202-206 vs log 396-404 and 288-297.

### H2. R-66 scores the document that contains it (high)
R-66: "Every cell in this matrix MUST pass in the dry-run world" with cell running every other cell. Shape.md gate: "a requirement scored by a runner that runs over the document containing it, with no base case" is an unsatisfiable shape. R-66 is a meta-requirement whose cell is the matrix itself. Verification world names it as the closer. Birth stubs fail so R-66 fails at birth, but at sign-off it can pass because other cells pass, without an independent probe of simultaneity.

### H3. R-08 cell asserts two deviations; R-09 is only the live probe (medium-high)
D-20: two deviations, both printed. R-08 requires auto-approve AND its cell requires deviations list contain EXACTLY "commands auto-approved" AND "web access blocked". R-09 is the live web-block probe. One requirement's cell covers both disclosure strings; atomicity fails. Also R-08's "exactly" those two strings is a tighter figure than D-20 (which does not say "exactly those two strings and nothing else").

### H4. D-13 hand-pick not encoded (medium)
Log: "auto-checked then hand-picked". R-12 only requires harvester candidates with auto checks after cutoff. No requirement that the active set is hand-picked from candidates. Out of scope does not name this. Cell cannot prove a human pick, but the decision is missing as a requirement or as named out of scope.

### H5. D-27 "every tier supported" not encoded (medium)
Log 337: "Supported catalog = every tier people care about (successors to astra, sol, terra, luna and Anthropic equivalents), community-run." D-27 same. R-34 only: Vince-controlled catalog, listed models runnable. A catalog of one flagship per lab would pass. No requirement that successors of those named tiers exist as catalog entries at launch.

### H6. R-11 cell reads this PRD (medium)
R-11 cell: "it reads this PRD's Amendments ledger". Shape: cell against something other than the document that contains it. The checkpoint is a ledger entry, but the cell names the PRD file as its evidence. Could instead require a dated file under design/ or git notes not the contract.

### H7. R-18 invents an approval loop Vince did not decide (medium)
A1: no rotation interval chosen; "rotate faster". R-18: build proposes interval in Amendments ledger for Vince approval; cell fails unless ledger carries Vince's approval. That is a new process (build pauses for a number) not in the log. Shape forbids inventing figures; inventing an approval gate is similar. Could leave interval as unpublished until an amendment, without requiring the build to invent and then wait.

### H8. Grounding overstates Grok Build (medium)
PRD Grounding: "open source under Apache 2.0 at github.com/xai-org/grok-build". x.ai/news/grok-build-cli (read 2026-09-13) names Grok Build, headless `-p`, SuperGrok/X Premium Plus, curl installer. It does not name Apache 2.0 or that GitHub repo. R-03 still names Grok Build, which matches the page; the license/repo claim is unverified and could send the build to a wrong artifact.

### H9. R-66 + N-03 + fixture tasks simultaneity (medium)
N-03 searches public repo, history, and site public output for every current task text. Verification world puts fixture data in a separate fixture store. If fixtures contain task text that later is current, or if retired-set publication (R-17) and current-set secrecy fight, N-03 fails while others pass. R-17 publishes retired tasks in full; N-03 is current-only. Risk is fixture store leaking into public output during R-66's "run every other cell". Also R-09 launches a live fetch task whose prompt text could become "current task" text if harvested. Named world does not isolate R-09's live task from N-03.

### H10. R-04 Windows vs GitHub-hosted Linux default (medium)
Contributor flow is GitHub Actions. Default hosted runners for public repos are Linux. Codex Windows app and likely Claude desktop need Windows (and possibly GUI). R-04 says "throwaway Windows machine" not "GitHub-hosted Windows". Attestation docs do not forbid Windows runners, but R-27 does not mention `windows-latest` or self-hosted. If desktop runs only off GitHub, D-23 is broken for those apps.

## Low/trivial (parked)
- L1. R-12 does not require "after the target model's published knowledge cutoff" vs a "fixed cutoff date" in the cell; cell uses one date for all candidates.
- L2. R-32 is Claude's discretion (anti-cherry-pick) encoded as MUST; log left it as discretion. Encoding discretion as a requirement is a choice, not a contradiction.
- L3. Per-contributor share cap (discretion) not encoded; out of scope names Margin Evals and deferred abuse-at-scale, not the cap. OK as discretion.
- L4. R-10 "more than one" with no count; D-46 did not pick a count. Correctly uninvented.
- L5. R-36 "at least two" for "several times a day"; log gave no count. Mild invention; labelled in the requirement.
- L6. No em/en dashes in PRD (grep).
- L7. Birth: 81/81 fail. Good.
- L8. N-10 extra words (throttled, deliberate) beyond "nerfed"/intent; strengthening, not contradicting.
- L9. D-34 named out of scope correctly.
- L10. R-03 headless mode is on the x.ai page; OK.

## Cells
- One file per id, all on disk, all fail.
- R-27 real-entry for contributor flow.
- R-42/R-43/R-50/R-51/R-55 navigation/real-entry present.
- R-56 seeded-scale present, no invented hundreds figure beyond "hundreds".
- R-09 live probe for web block. Good.
- R-08 not a live probe for auto-approve (stall check on records).
- R-66 is the simultaneity cell; see H2.

## Filing
Send to session:cd1ada70-cd9a-4c2c-992b-96b26ec3392e then receipt.
