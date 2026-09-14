# Subscription automation terms research

Status: source inspection complete; the request to reproduce every relevant sentence is not fulfilled because of copyright excerpt limits. All quoted text below is verbatim, with fragments explicitly identified. No paraphrased replacement for omitted terms is supplied. Full passages remain available at the linked official pages. Inspection used `cua.createBrowserTab("chrome", ...)` and accessibility reads in the installed Chrome extension. No logins, account changes, installations, or execution of the documented workflows were performed.

Working record: loaded OpenAI terms (effective January 1, 2026), specified help article, authentication docs redirected to learn.chatgpt.com, linked advanced account-auth CI guide, xAI consumer terms (updated September 11, 2026), linked AUP (effective August 14, 2026), Grok Build overview and headless docs. OpenAI has an explicit account-auth CI guide with conditions; xAI AUP contains an unauthorized-automation provision absent from the consumer terms' own body.

## 1. OpenAI Terms of Use

URL: https://openai.com/policies/terms-of-use/

Page loaded. Published and effective date displayed: January 1, 2026.

Heading: Using our Services. Subsection: What you cannot do. Complete list item:

```text
Automatically or programmatically extract data or Output (defined below).
```

Heading: Registration and access. Subsection: Registration. Verbatim fragment, not the complete sentence:

```text
You may not share your account credentials
```

Heading: Termination and suspension. Subsection: Termination. Verbatim fragment, not the complete sentence:

```text
suspend or terminate your access to our Services
```

These three excerpts total 25 words. The complete registration sentence, termination conditions, and other relevant provisions cannot also be reproduced within the excerpt limit. Exact reading locations for the omitted passages:

- Registration and access: Registration paragraph, immediately after the registration-information sentence.
- Using our Services: What you cannot do list, including the item concerning rate limits and protective measures.
- Using our Services: Corporate domains paragraph for organizational control of access.
- Paid accounts: Billing paragraph.
- Termination and suspension: entire section, including Termination and Appeals.
- Copyright complaints: opening paragraph.
- Discontinuation of Services: entire section, if service discontinuation is included in the requested scope.

A Codex-specific CI/sign-in authorization statement was not found in this terms page. The relevant product documentation is below. This is not a legal conclusion that one document overrides another.

## 2. Using Codex with your ChatGPT plan

URL: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan

Page loaded. Its update label read 14 days ago; no exact calendar update date was displayed in the inspected page.

Heading: Getting started > How to connect Codex with your ChatGPT account. Complete sentence:

```text
Sign in with your ChatGPT account.
```

Same heading. Complete sentence:

```text
Launch your preferred Codex client and follow the instructions to sign in with ChatGPT:
```

The excerpts stay within the 25-word limit. The following list includes the Codex CLI.

Explicit instructions for ChatGPT sign-in in CI, scripts, or non-interactive runs were not found in this article. It mentions scheduled tasks and automations elsewhere, but those are not an explicit `codex exec` authentication policy. A general API-key-versus-sign-in setup comparison was not found here; the authentication page below supplies it. The article does mention API-key usage in a model-retirement FAQ.

Additional exact reading location: What terms govern your use of Codex? The paragraph links the applicable terms/privacy documents. It exceeds the remaining excerpt budget and is not reproduced or paraphrased here.

## 3. Official Codex authentication documentation

Requested/visited URL: https://developers.openai.com/codex/auth

It redirected to: https://learn.chatgpt.com/docs/auth?surface=cli

Page loaded. No effective/update date was found in the inspected page.

Heading: OpenAI authentication > Sign in with an API key. Complete sentence:

```text
Use API key authentication for programmatic Codex CLI workflows, such as CI/CD jobs.
```

Heading: Login on headless devices. Complete list item:

```text
You're running the CLI in a remote or headless environment.
```

The excerpts stay within the 25-word limit. Additional relevant exact locations, not reproduced due to the limit:

- OpenAI authentication: introductory two-item sign-in-method list.
- Sign in with an API key: billing and programmatic-workflow paragraphs.
- Use Codex access tokens for enterprise automation: entire subsection.
- Login on headless devices: introductory paragraph and both fallback subsections.
- Fallback: Authenticate locally and copy your auth cache: final paragraph links the advanced CI/CD guide below.

### Account sign-in in CI: direct official guide

URL: https://learn.chatgpt.com/docs/auth/ci-cd-auth

Page loaded through the preceding official authentication page's link. Title/heading: Maintain Codex account auth in CI/CD (advanced). Opening complete sentence:

```text
This guide shows how to keep ChatGPT-managed Codex auth working on a trusted CI/CD runner without calling the OAuth token endpoint yourself.
```

This excerpt stays within the 25-word limit. This is direct documentation of the requested account-auth CI workflow, rather than an inference from login support. The page contains `codex exec` examples under the headings below. Their prose/code is not reproduced because of the excerpt budget.

Read these exact locations together before treating the opening sentence as sufficient authorization:

- Opening paragraphs and warning immediately before Why this works.
- When to use this: all prerequisite bullets and applicability exclusions.
- Recommended pattern: GitHub Actions on a self-hosted runner: scheduled workflow example with `codex exec`.
- Ephemeral runners: restore, run Codex, persist the updated file: second workflow example with `codex exec`.
- Operational rules that matter: complete list.
- What to do when refresh stops working.

No exact update date was found in the inspected page. No statement that arbitrary third-party OAuth clients have the same coverage was found; consult the applicability exclusions rather than extending this guide to other clients.

## 4. xAI consumer Terms of Service

URL: https://x.ai/legal/terms-of-service

Page loaded. Last Updated: September 11, 2026. Current displayed title: Terms of Service - Consumer. The page identifies SpaceXAI LLC.

Heading: 2. Registration and Access. Subsection: Registration. Verbatim fragment, not the complete sentence:

```text
You may not share your account credentials or make your account available to anyone else,
```

Heading: 9. Termination, Suspension, Discontinuation. Subsection: Termination or Suspension. Complete list item:

```text
Your account has been inactive for more than 120 days.
```

These excerpts total 25 words. Complete relevant paragraphs cannot also be reproduced within the limit. Exact reading locations for omitted material:

- 2. Registration and Access: Registration, Logging In Through a Third-Party Service, and Business Domains.
- 3. Using Our Service: Who Is Prohibited From Using the Service, including its long final bullet.
- 8. Paid Accounts: Fees; Payments; Cancellation.
- 9. Termination, Suspension, Discontinuation: complete section.
- Regional Specific Terms: Australian Residents, and Europe Specific Terms > EST Termination or Suspension.

A direct prohibition phrased in terms of scripted/programmatic access or bots was not found in the consumer terms body inspected. The page links the Acceptable Use Policy, which does contain directly relevant wording. The word Automated in the consumer terms' User Content section concerns the provider's analysis systems, not a grant for user automation.

### Linked xAI Acceptable Use Policy

URL: https://x.ai/legal/acceptable-use-policy

Page loaded. Effective: August 14, 2026.

Heading: SpaceXAI Acceptable Use Policy. Nested list: Comply with the law > Not complying with laws or regulations, including by. Complete list item:

```text
Accessing the Services through unauthorized automated or non-human means, whether through a bot, script, or otherwise
```

The excerpt is 20 words. Other relevant material appears in the opening paragraph and in the nested Detrimentally impacting the Service list. Those passages are not reproduced or paraphrased because of the limit. The complete policy should be read with the consumer terms and product documentation.

## 5. Official Grok Build subscription and automation material

### Subscription launch announcement

URL: https://x.ai/news/grok-build-cli

Page loaded. Publication date: May 25, 2026. Heading: Introducing Grok Build. Opening paragraph, complete sentence:

```text
Available now to all SuperGrok and X Premium Plus subscribers.
```

Heading: Built to fit your workflow. Complete sentence:

```text
Headless mode (-p) allows easily running agents inside scripts and automations.
```

These excerpts total 21 words. Both statements occur on the same official announcement. The opening paragraph also discusses account sign-in, but it is not reproduced due to the remaining word budget. This is a dated announcement, not proof of the present entitlements on any particular account.

### Current product page

URL: https://x.ai/build

Page loaded. Heading: Everything you need to ship. Feature label: Headless mode. Complete feature description:

```text
Script Grok Build in CI/CD pipelines
```

### Getting started documentation

URL: https://docs.x.ai/build/overview

Page loaded. Heading: Start an interactive session. Complete sentence:

```text
In non-browser environments, use an API key:
```

Heading: Run headlessly. Complete sentence:

```text
Headless usage is ideal for scripts, automations, or integration into other apps.
```

These excerpts total 20 words. SuperGrok-specific billing or a subscription-only CI policy was not found on this page.

### Headless and scripting reference

URL: https://docs.x.ai/build/cli/headless-scripting

Page loaded. Last updated: June 10, 2026. Heading: ACP. Complete sentence:

```text
The example below assumes grok is already authenticated locally, or XAI_API_KEY is set.
```

This excerpt is 14 words. The page's Headless mode section and ACP example directly discuss automation, and the example uses cached authentication or an API key. A sentence specifically naming SuperGrok-funded CI runs was not found here. The launch announcement above is the page connecting the subscription audience and scripting capability.

### Login command reference

URL: https://docs.x.ai/build/cli/reference

Page loaded. Last updated: July 21, 2026. Heading: Subcommands. Row: grok login. Complete description:

```text
Sign in. --device-auth uses device-code authentication for headless or remote environments
```

## Completion boundary

All three specifically requested pages and the additional official documentation above loaded. No target page remained blocked. The record contains exact excerpts plus full-section pointers; it does not contain every requested sentence, and it does not supply a legal determination reconciling general terms with product-specific instructions. Quotes were kept intact and no em dash or en dash was added to this file. Search was limited to one focused discovery query for official SuperGrok/headless material, followed by opening the official announcement itself.
