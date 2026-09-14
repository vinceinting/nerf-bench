# What each lab's terms say about subscription use in automation

Required by R-67 and R-70 (PRD Amendment 21). Every quote below is verbatim from the official page named, read on the date given. A clause that forbids the floor or the contributor flow is put to Vince before the release switch, and his answer is recorded here with a date.

## Anthropic (Claude Code, Claude desktop app)

Source: https://code.claude.com/docs/en/legal-and-compliance , read 2026-09-13.

Under "Acceptable use":

> Advertised usage limits for Pro and Max plans assume ordinary, individual usage of Claude Code and the Agent SDK.

Under "Authentication and credential use":

> **OAuth authentication** is intended exclusively for purchasers of Claude Free, Pro, Max, Team, and Enterprise subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic applications.

> Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, or Max plan credentials on behalf of their users. Moreover, developers may not collect, store, or intermediate Claude.ai credentials or session tokens

> Nor does it prevent an end user from signing in to the unmodified Claude Code binary with their own Claude subscription, including where a platform hosts Claude Code as described under *Can customers offer Claude Code in their products?* above.

> Anthropic reserves the right to take measures to enforce these restrictions and may do so without prior notice.

Under "Can customers offer Claude Code in their products?":

> **The Claude Code binary must not be modified.** Claude Code must be installed and run as published by Anthropic, and customers may not remove, disable, or restrict any authentication method built into it (including methods that permit signing in with a Claude account or the user's own API key).

What this means for nerf-bench: each contributor signs in with their own subscription in their own copy, and the site never holds a credential (D-45, N-04), which the terms allow. Scripted daily floor runs on Vince's own plan may exceed "ordinary, individual usage"; Vince accepted that risk for his own accounts (D-34).

## OpenAI (Codex CLI, Codex Windows app)

Pending: the official pages refuse non-browser reads; a browser read is in progress and its verbatim quotes land here.

## xAI (Grok Build)

Source: https://docs.x.ai/build/cli/headless-scripting , read 2026-09-13. The page says headless mode is for "scripts, bots, or other machine-friendly tasks" and authenticates with either `XAI_API_KEY` or a cached token from `grok login`. It says nothing about limits on subscription use in automation.

Terms of service: pending, same browser read as OpenAI.

## Vince's answers on forbidding clauses

None asked yet.
