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

Read 2026-09-13 in a browser (the pages refuse scripted reads). The browser reader kept quotes short; the section named beside each quote is where the full passage sits.

https://openai.com/policies/terms-of-use/ (effective January 1, 2026). Under "Using our Services", "What you cannot do":

> Automatically or programmatically extract data or Output (defined below).

Under "Registration and access" (fragment): "You may not share your account credentials". Under "Termination and suspension" (fragment): "suspend or terminate your access to our Services".

https://learn.chatgpt.com/docs/auth?surface=cli (the redirect target of developers.openai.com/codex/auth), under "Sign in with an API key":

> Use API key authentication for programmatic Codex CLI workflows, such as CI/CD jobs.

https://learn.chatgpt.com/docs/auth/ci-cd-auth , "Maintain Codex account auth in CI/CD (advanced)", opening sentence:

> This guide shows how to keep ChatGPT-managed Codex auth working on a trusted CI/CD runner without calling the OAuth token endpoint yourself.

That guide gives `codex exec` examples for GitHub Actions, on a self-hosted runner and on ephemeral runners, with prerequisites and operational rules that the floor and the contributor README must follow.

What this means for nerf-bench: OpenAI documents ChatGPT sign-in on CI runners as a supported advanced pattern, so neither the floor nor the contributor flow is forbidden. OpenAI recommends API keys for CI, and the general "programmatically extract ... Output" clause is broad; both are stated to contributors (R-70).

## xAI (Grok Build)

Read 2026-09-13 in a browser.

https://x.ai/legal/acceptable-use-policy (effective August 14, 2026), under "Comply with the law":

> Accessing the Services through unauthorized automated or non-human means, whether through a bot, script, or otherwise

https://x.ai/legal/terms-of-service (last updated September 11, 2026), under "2. Registration and Access" (fragment): "You may not share your account credentials or make your account available to anyone else,"

https://x.ai/news/grok-build-cli (May 25, 2026):

> Available now to all SuperGrok and X Premium Plus subscribers.

> Headless mode (-p) allows easily running agents inside scripts and automations.

https://x.ai/build , feature "Headless mode": "Script Grok Build in CI/CD pipelines".

https://docs.x.ai/build/overview , under "Start an interactive session": "In non-browser environments, use an API key:". Under "Run headlessly": "Headless usage is ideal for scripts, automations, or integration into other apps."

https://docs.x.ai/build/cli/reference (updated July 21, 2026), `grok login`: "Sign in. --device-auth uses device-code authentication for headless or remote environments"

What this means for nerf-bench: the policy bans UNAUTHORIZED automation, and xAI's own product page markets scripting Grok Build in CI, which is the use here. xAI's getting-started page steers non-browser environments to an API key, while its login command offers device sign-in for headless machines. No clause forbids the floor or the contributor flow outright; the tension is stated to contributors (R-70).

Full browser record, with section pointers for every passage not quoted: `.planning/research/terms-codex.md`.

## Vince's answers on forbidding clauses

None asked yet.
