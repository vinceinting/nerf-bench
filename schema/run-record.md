# Run record: the one shape every track builds against

Owner: the orchestrator. A track that needs a field changed says so in its sign-off; it does not edit this file.
Machine-readable form: `schema/run-record.schema.json` (JSON Schema 2020-12). Contract: `.planning/prd/2026-09-13-nerf-bench-prd.md` with its Amendments ledger, which wins over this file.

## Files a run produces

| File | Public when | Written by |
|---|---|---|
| `result.json` | at ingest | runner, then attested by the official reusable workflow (R-06) |
| `start.json` | before any task runs (R-32) | runner, posted to the site's start endpoint |
| `transcripts/<task_id>.jsonl` | when the task's set retires (R-17, R-58) | runner; held privately until then |

`result.json` is the attested subject. Its sha256 is what `gh attestation verify` binds.

## Series key (R-26 as amended by Amendment 2)

`app | model | effort | access_path | track`, joined with `|` in that order, for example
`codex-desktop|gpt-6-astra|medium|subscription|latest`. Statistics never aggregate across keys. Account source and task set do NOT split a series (R-59, Amendment 8).

## Fixed vocabularies

- `app.id`: `claude-code`, `codex-cli`, `grok-build`, `codex-desktop`, `claude-desktop`
- `app.track`: `latest`, `frozen`
- `access_path`: `subscription`, `api`
- `account_source`: `self-paid`, `contributor-owned`, `donated`
- `deviations`: exactly `["commands auto-approved", "web access blocked"]` (R-08, R-09, Amendment 18)
- `floor`: true only for runs from Vince's floor schedule

## Task set identity

A set is `{id, version, fingerprint}`. `fingerprint` is `sha256:` plus the hex sha256 of the set's canonical form: the set's task files sorted by path, each contributing `path\n<sha256 of bytes>\n`, concatenated. `tasks/fingerprint` owns the implementation and anyone can recompute it from a retired set (R-15).
