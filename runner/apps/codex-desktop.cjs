// Codex Windows app adapter (R-04, Amendment 6). The run must drive the desktop app itself, never
// the Codex CLI. No unattended driving mechanism for the app has been read or proved yet, so
// invocation() refuses with a plain reason and every run of this app fails honestly until one is.
'use strict';

module.exports = {
  id: 'codex-desktop',
  binary: null,
  desktop: true,
  forbiddenBinaries: ['codex', 'codex.exe'],
  configLocations: ['~/.codex', './AGENTS.md', './.codex'],
  versionArgs: null,
  parseVersion: () => undefined,
  hosts: ['api.openai.com', 'chatgpt.com', 'auth.openai.com'],
  invocation() {
    throw new Error('codex-desktop: no unattended driver for the Codex Windows app exists yet (R-04 unproven)');
  },
  auth() { throw new Error('codex-desktop: sign-in placement not yet read'); },
  requiredSecrets: { subscription: ['CODEX_AUTH_JSON'], api: ['OPENAI_API_KEY'] },
  parseUsage: () => ({ tokens_in: null, tokens_out: null, tool_calls: null }),
};
