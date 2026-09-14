# nerf-bench

nerf-bench measures whether a frontier AI coding model's real-world performance changes after its
release. Each model is compared against its own launch week. Every run happens in a clean,
vendor-default install of the app on a throwaway GitHub-hosted machine, and every result carries a
signature anyone can check with `gh attestation verify`.

This repository holds the runner (`runner/`), the official run workflow
(`.github/workflows/run.yml`), the supported apps and models (`config/catalog.json`) and the frozen
app versions (`config/frozen-versions.json`).

## Contribute a run

You run it on your own GitHub account, with your own login. Nothing you enter ever goes to the
nerf-bench site: your credentials stay in your copy's private settings.

1. **Copy the project.** Fork `vinceinting/nerf-bench` to your own GitHub account (or create a new
   repository and add only the caller file from step 2).
2. **Add the caller.** Make sure your copy has `.github/workflows/nerf-bench-run.yml`. A fork already
   has it; otherwise copy it from `.github/caller-template/nerf-bench-run.yml`. It only calls the
   official workflow in `vinceinting/nerf-bench`, which does the run and signs the result.
3. **Enable Actions.** In your copy, open the Actions tab and enable workflows.
4. **Add your login or API key as a repository secret** (Settings, Secrets and variables, Actions,
   New repository secret). Add only the one for the app and access path you will run:

   | App | Subscription sign-in secret | API key secret |
   |---|---|---|
   | Claude Code CLI | `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) | `ANTHROPIC_API_KEY` |
   | Codex CLI | `CODEX_AUTH_JSON` (the contents of `~/.codex/auth.json` after `codex login`) | `OPENAI_API_KEY` |
   | Grok Build CLI | `GROK_AUTH_JSON` (the contents of `~/.grok/auth.json` after `grok login`) | `XAI_API_KEY` |
   | Codex Windows app | not yet supported | not yet supported |
   | Claude desktop app | not yet supported | not yet supported |

5. **Run it.** Actions tab, "nerf-bench run", Run workflow. Choose the app, the model, the effort,
   the app track (latest or frozen), the access path, and the account source, then start it.
6. **Get your signed result.** When the run finishes, its `nerf-bench-run` artifact holds
   `result.json` and the run log. The result is signed by the official workflow; check it yourself:

   ```
   gh attestation verify result.json --repo vinceinting/nerf-bench --signer-workflow vinceinting/nerf-bench/.github/workflows/run.yml --deny-self-hosted-runners
   ```

What a run does, and the only two ways it differs from a fresh install: the agent's commands are
auto-approved, and its web access is blocked at the network layer (it can reach only its own
vendor's servers). Both are written into every result. The run starts from the app's official
installer with no instruction files, add-ons, hooks or settings; it fingerprints the app's
configuration locations before anything else and refuses to run if it finds any.

Transcripts of your run are encrypted before they leave the machine and are published when their
task set retires. The benchmark tasks themselves are fetched at run start from the project's private
task store and are not in this repository.

## Each lab's terms for subscription use in automation

<!-- R-70: to be filled by the orchestrator from research/terms.md, one section per launch lab, quoting verbatim. -->

### Anthropic

To be filled from `research/terms.md`.

### OpenAI

To be filled from `research/terms.md`.

### xAI

To be filled from `research/terms.md`.

## For maintainers

- Run the runner's tests: `node --test runner/test/units.test.cjs runner/test/run.test.cjs`
- The fresh-install fingerprint of an app version: run the "nerf-bench fresh-install fingerprint"
  workflow and record its attested output in `runner/fingerprint/published.json`.
- The frozen schedule is one setting, `config/frozen-versions.json`, labelled there as the build's
  default. A pin whose date is off the schedule never takes effect.
