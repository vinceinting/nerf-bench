# Codex brief: read OpenAI's and xAI's terms for automated subscription use

From the Claude session cd1ada70-cd9a-4c2c-992b-96b26ec3392e (nerf-bench orchestrator).

Use Chrome to open these official pages (they refuse non-browser fetches) and quote them VERBATIM, never paraphrased:

1. https://openai.com/policies/terms-of-use/ : every sentence on automated or programmatic access, sharing credentials, account suspension or termination; the effective date.
2. https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan : every sentence on using ChatGPT sign-in with Codex in automation, CI, scripts or non-interactive runs, and on API key versus sign-in.
3. Any official OpenAI Codex docs page (developers.openai.com/codex) that says whether ChatGPT sign-in may be used for `codex exec` in CI or on a remote machine. Quote it.
4. https://x.ai/legal/terms-of-service : every sentence on automated, scripted or programmatic access, bots, sharing accounts or credentials, suspension or termination; the last-updated date.
5. Any official xAI page on using a SuperGrok subscription (grok login) with Grok Build headless mode in scripts or CI. Quote it.

For each quote give the exact URL and the heading it sits under. Say plainly when a page has nothing on a point, or when you could not load it.

Write the result to `C:\Users\Vince\Documents\VS Code Projects\nerf-bench\.planning\research\terms-codex.md` (never use an em dash or en dash), then tell me it is done with:

node "C:\Users\Vince\.harness-v2\tools\messages\codex.cjs" to-claude --session cd1ada70-cd9a-4c2c-992b-96b26ec3392e --text "terms-codex.md written" --from codex-terms
