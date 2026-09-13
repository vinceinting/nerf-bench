# W-A build notes (runner, workflow, catalog, frozen versions, README)

Branch build/W-A from a129ff8. Ids: R-01..R-09, R-29, R-30, R-33, R-34, N-01, N-15, runner half of R-68.

## Step log

1. Read PRD with amendments, schema. Probed local CLIs for real flags (read only, no login):
   - claude 2.1.270: `-p`, `--model`, `--effort low|medium|high|xhigh|max`, `--output-format stream-json --verbose`, `--dangerously-skip-permissions`.
   - codex-cli 0.153.0: `codex exec --json -m <model> -c model_reasoning_effort=<e> --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check`.
   - grok 1.0.5: `-p/--single <prompt>`, `-m`, `--reasoning-effort`, `--output-format plain|json|streaming-json`, `--always-approve`, `--disable-web-search`, `grok update --version <v>`.
   - Grok installer read from its own README: `curl -fsSL https://x.ai/cli/install.sh | bash [-s <ver>]`. The README says Grok also reads Claude.md/AGENTS.md and ~/.claude/plugins, so those are in its fingerprint list.
2. Built runner/: lib (catalog, frozen, fingerprint, inventory, task-store, transcripts, schema-check), apps (5 adapters), network (proxy + iptables/netsh block), run.cjs (start, run, fresh-fingerprint, choices), verify (real-runs via gh attestation verify, cells helper).
3. Config: config/catalog.json (only claude-opus-5 listed: no other model id could be confirmed without inventing one), config/frozen-versions.json (28-day schedule, labelled build default; pins at today's local versions).
4. Workflows: .github/workflows/run.yml (workflow_call, resolves its own commit from its OIDC token, attests start.json then result.json), fresh-fingerprint.yml, caller template plus the official repo's own copy nerf-bench-run.yml.
5. Inventory scan fix: on this machine PATH carries harness-v2 entries, so env scanning matches harness names and vendor config-override variables only; tests strip harness PATH entries to model a clean machine.
6. Tests: 21/21 pass (`node --test runner/test/units.test.cjs runner/test/run.test.cjs`).
7. Cells: R-34 exit 0. All others exit 1 honestly: the official caller workflow is not on main yet (gh 404), so no attested real run exists; N-15 also needs NB_TEST_CONTRIBUTOR_REPO.

## Open items for the orchestrator
- Desktop adapters refuse: no official unattended installer or driver read for either desktop app (R-04, R-05).
- runner/task-store.json url is null (no store deployed); runner/transcripts-key.pub.pem absent (private key must be generated off-repo). Every real run refuses until both exist.
- Catalog needs OpenAI and xAI model ids from Vince; grok effort values unread.
- Web search tools that run server-side at the vendor are not stoppable at the runner's network layer; R-09 proves local fetch refusal only.
- Set fingerprint implemented in runner/lib/task-store.cjs per schema/run-record.md; W-B's tasks/fingerprint should become the one owner. Runner's task layout (task.json + repo/) and its check-command grading overlap W-B's scoring/.
- R-68 cell left to the site track (runner half built: fetch, verify fingerprints, record id/version/fingerprint).
