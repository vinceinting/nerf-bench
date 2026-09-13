// Grok Build CLI adapter (R-03), headless `-p` mode. Flags read from `grok --help`, version 1.0.5.
// Its README says it reads rules files from ~/.grok and the project (AGENTS.md, Agents.md,
// Claude.md, AGENT.md), project .grok/, and Claude plugin manifests under ~/.claude/plugins.
'use strict';
const { countLines } = require('./common.cjs');

module.exports = {
  id: 'grok-build',
  binary: 'grok',
  configLocations: ['~/.grok', '~/.claude/plugins', './AGENTS.md', './Agents.md', './AGENT.md', './Claude.md', './CLAUDE.md', './.grok'],
  versionArgs: ['--version'],
  parseVersion: (out) => (out.match(/(\d+\.\d+\.\d+)/) || [])[1],
  hosts: ['api.x.ai', 'cli-chat-proxy.grok.com', 'accounts.x.ai', 'auth.x.ai', 'x.ai'],
  invocation({ prompt, vendorModel, effort }) {
    const args = ['-p', prompt, '-m', vendorModel, '--output-format', 'streaming-json', '--always-approve'];
    if (effort !== 'default') args.push('--reasoning-effort', effort);
    return { args };
  },
  auth(access, secrets) {
    if (access === 'subscription') return { env: {}, files: { '~/.grok/auth.json': secrets.GROK_AUTH_JSON } };
    return { env: { XAI_API_KEY: secrets.XAI_API_KEY }, files: {} };
  },
  requiredSecrets: { subscription: ['GROK_AUTH_JSON'], api: ['XAI_API_KEY'] },
  // The streaming-json event shape is not documented in the help text; token counts are left null
  // (the schema allows it) rather than guessed.
  parseUsage(stdout) {
    return { tokens_in: null, tokens_out: null, tool_calls: countLines(stdout, /"tool_call"/g) };
  },
};
