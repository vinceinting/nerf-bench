# Brief for a Codex desktop task: read three model-degradation trackers

From: Claude Code session cd1ada70-cd9a-4c2c-992b-96b26ec3392e (folder C:\Users\Vince\Documents\VS Code Projects\nerf-bench).
Vince asked for this. My own web reader got HTTP 403 on marginlab.ai, so I need a real browser.

## Surface

Use the Codex app's browser extension driving Vince's installed Chrome (cua.createBrowserTab("chrome", ...)).
No substitute: if that surface is not available to you, do not fall back to another browser or tool; reply saying so and list what you do have.

## What you may touch

Read-only browsing of these sites and pages they link to on the same domain (methodology, about, FAQ, blog, GitHub repo they link):

1. https://marginlab.ai/trackers/claude-code/
2. https://marginlab.ai/trackers/codex/
3. https://isitnerfed.org/ (home, methodology/about, blog)

Limits, each needing Vince's yes in his Claude conversation first, so do none of them: entering credentials, downloading a file, submitting any form, purchasing, changing any account setting.

## What I need, per site

- What exactly is run: tasks/benchmark, how many tasks, how many runs per day, time of day.
- Which apps/harnesses and versions (Claude Code CLI, Codex CLI, Codex app, raw API), and whether that is subscription or API access. Effort/reasoning levels.
- How they decide a change is real (statistical test, confidence intervals, thresholds).
- What each run discloses publicly (app version, tokens, cost, settings, logs, raw outputs).
- Can people outside their team run tests or submit results? If so, how is tampering prevented or results verified?
- Are the tasks public or secret?
- Anything they say about telling a harness/app update apart from a model change.
- Who runs it, funding, any stated independence.
- Anything you notice they do NOT do, stated as "not found on the page" rather than guessed.

Quote the page wording where it matters and give the URL for each fact.

## Reply

1. Write your findings as Markdown to: C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\research\trackers-codex.md
2. Then message me:
   node "C:\Users\Vince\.harness-v2\tools\messages\codex.cjs" to-claude --session cd1ada70-cd9a-4c2c-992b-96b26ec3392e --text "<one-paragraph summary; name the tool and call you used, e.g. cua.createBrowserTab(\"chrome\", ...); say the file path>"
