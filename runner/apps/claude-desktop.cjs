// Claude desktop app adapter (R-05, Amendment 6). The run must drive the desktop app itself, never a
// standalone Claude Code CLI. No unattended driving mechanism has been read or proved yet, so
// invocation() refuses with a plain reason and every run of this app fails honestly until one is.
'use strict';

module.exports = {
  id: 'claude-desktop',
  binary: null,
  desktop: true,
  forbiddenBinaries: ['claude', 'claude.exe'],
  configLocations: ['~/AppData/Roaming/Claude', '~/.claude', '~/.claude.json', './CLAUDE.md', './.claude'],
  versionArgs: null,
  parseVersion: () => undefined,
  hosts: ['api.anthropic.com', 'claude.ai'],
  invocation() {
    throw new Error('claude-desktop: no unattended driver for the Claude desktop app exists yet (R-05 unproven)');
  },
  auth() { throw new Error('claude-desktop: sign-in placement not yet read'); },
  requiredSecrets: { subscription: ['CLAUDE_CODE_OAUTH_TOKEN'], api: ['ANTHROPIC_API_KEY'] },
  parseUsage: () => ({ tokens_in: null, tokens_out: null, tool_calls: null }),
};
