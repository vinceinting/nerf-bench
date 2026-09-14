// Claude Code CLI adapter (R-01). Flags read from `claude --help`, version 2.1.270.
'use strict';
const { countLines } = require('./common.cjs');

module.exports = {
  id: 'claude-code',
  binary: 'claude',
  // Every place Claude Code reads user or project configuration from, per its docs: user settings,
  // the user-level state file, project instruction files and settings, and managed settings.
  configLocations: ['~/.claude', '~/.claude.json', '~/.config/claude', '/etc/claude-code', './CLAUDE.md', './CLAUDE.local.md', './.claude', './.mcp.json'],
  versionArgs: ['--version'],
  parseVersion: (out) => (out.match(/(\d+\.\d+\.\d+)/) || [])[1],
  hosts: ['api.anthropic.com', 'claude.ai', 'console.anthropic.com', 'platform.claude.com', 'downloads.claude.ai', 'storage.googleapis.com', 'statsig.anthropic.com'],
  invocation({ prompt, vendorModel, effort }) {
    const args = ['-p', prompt, '--model', vendorModel, '--output-format', 'stream-json', '--verbose', '--dangerously-skip-permissions'];
    if (effort !== 'default') args.push('--effort', effort);
    return { args };
  },
  auth(access, secrets) {
    if (access === 'subscription') return { env: { CLAUDE_CODE_OAUTH_TOKEN: secrets.CLAUDE_CODE_OAUTH_TOKEN }, files: {} };
    return { env: { ANTHROPIC_API_KEY: secrets.ANTHROPIC_API_KEY }, files: {} };
  },
  requiredSecrets: { subscription: ['CLAUDE_CODE_OAUTH_TOKEN'], api: ['ANTHROPIC_API_KEY'] },
  parseUsage(stdout) {
    let tin = null; let tout = null;
    for (const line of stdout.split('\n')) {
      try {
        const j = JSON.parse(line);
        if (j.type === 'result' && j.usage) { tin = (j.usage.input_tokens || 0) + (j.usage.cache_read_input_tokens || 0) + (j.usage.cache_creation_input_tokens || 0); tout = j.usage.output_tokens ?? null; }
      } catch { /* non-JSON line */ }
    }
    return { tokens_in: tin, tokens_out: tout, tool_calls: countLines(stdout, /"type":"tool_use"/g) };
  },
};
