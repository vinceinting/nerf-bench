// Codex CLI adapter (R-02). Flags read from `codex exec --help`, version 0.153.0.
'use strict';
const { countLines } = require('./common.cjs');

module.exports = {
  id: 'codex-cli',
  binary: 'codex',
  configLocations: ['~/.codex', '/etc/codex', './AGENTS.md', './AGENTS.override.md', './.codex'],
  versionArgs: ['--version'],
  parseVersion: (out) => (out.match(/(\d+\.\d+\.\d+)/) || [])[1],
  hosts: ['api.openai.com', 'chatgpt.com', 'auth.openai.com', 'ab.chatgpt.com'],
  invocation({ prompt, vendorModel, effort }) {
    const args = ['exec', '--json', '--skip-git-repo-check', '--dangerously-bypass-approvals-and-sandbox', '-m', vendorModel];
    if (effort !== 'default') args.push('-c', `model_reasoning_effort="${effort}"`);
    args.push(prompt);
    return { args };
  },
  // Subscription sign-in is the auth.json that `codex login` writes, supplied as a secret and placed
  // after the fingerprint is taken.
  auth(access, secrets) {
    if (access === 'subscription') return { env: {}, files: { '~/.codex/auth.json': secrets.CODEX_AUTH_JSON } };
    return { env: { OPENAI_API_KEY: secrets.OPENAI_API_KEY, CODEX_API_KEY: secrets.OPENAI_API_KEY }, files: {} };
  },
  requiredSecrets: { subscription: ['CODEX_AUTH_JSON'], api: ['OPENAI_API_KEY'] },
  parseUsage(stdout) {
    let tin = null; let tout = null;
    for (const line of stdout.split('\n')) {
      try {
        const j = JSON.parse(line);
        if (j.type === 'turn.completed' && j.usage) { tin = (tin || 0) + (j.usage.input_tokens || 0); tout = (tout || 0) + (j.usage.output_tokens || 0); }
      } catch { /* non-JSON line */ }
    }
    return { tokens_in: tin, tokens_out: tout, tool_calls: countLines(stdout, /"type":"(command_execution|mcp_tool_call|file_change)"/g) };
  },
};
