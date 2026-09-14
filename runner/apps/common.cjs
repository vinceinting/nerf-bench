'use strict';

function countLines(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

const ADAPTERS = ['claude-code', 'codex-cli', 'grok-build', 'codex-desktop', 'claude-desktop'];

function adapter(id) {
  if (!ADAPTERS.includes(id)) throw new Error(`no adapter for app "${id}"`);
  return require(`./${id}.cjs`);
}

module.exports = { countLines, adapter, ADAPTERS };
