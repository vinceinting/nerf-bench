// Read-only: asks the running Codex app for its tool list and prints create_thread's schema.
// Sends nothing into any task.
const fs = require('fs');
const { appRequest } = require('C:/Users/Vince/.harness-v2/tools/messages/codex.cjs');

const RE = /^codex-browser-use-[0-9a-f-]{36}$/i;

(async () => {
  const names = fs.readdirSync('\\\\.\\pipe\\').filter((n) => RE.test(n));
  for (const n of names) {
    const pipe = '\\\\.\\pipe\\' + n;
    let r;
    try {
      r = await appRequest(pipe, { id: 1, jsonrpc: '2.0', method: 'tools/list', params: { threadStartKind: 'all' } }, { timeoutMs: 3000 });
    } catch (e) { console.log(n, 'error', e.message); continue; }
    const tools = r && r.msg && r.msg.result && r.msg.result.tools;
    if (!Array.isArray(tools)) { console.log(n, 'no tools', r && r.kind); continue; }
    console.log(n, 'tools:', tools.map((t) => t.name).join(', '));
    for (const t of tools.filter((x) => /thread|project/i.test(x.name))) {
      console.log('\n==== ' + t.name + ' ====');
      console.log(t.description || '');
      console.log(JSON.stringify(t.inputSchema || t.input_schema || t.parameters || {}, null, 2));
    }
  }
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
