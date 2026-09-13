// Creates ONE gpt-6-astra medium thread in the saved nerf-bench Codex project, then archives the
// projectless scratch thread 01a0990f so it cannot create a duplicate. create_thread is never retried.
// Pattern taken from session 02d75f3b (james-lemonade), which ran it successfully.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { appRequest } = require('C:/Users/Vince/.harness-v2/tools/messages/codex.cjs');

const RE = /^codex-browser-use-[0-9a-f-]{36}$/i;
const CALLER = '01a0990f-9db9-70b2-b068-ab77a2b71e11';
const OLD = CALLER;
const BRIEF = path.join(__dirname, 'codex-brief-trackers.md');
const text = (r) => ((r.msg && r.msg.result && r.msg.result.contentItems) || []).map((c) => c.text).join('\n');

(async () => {
  let pipe = null;
  for (const n of fs.readdirSync('\\\\.\\pipe\\').filter((x) => RE.test(x))) {
    const p = '\\\\.\\pipe\\' + n;
    const r = await appRequest(p, { id: 1, jsonrpc: '2.0', method: 'tools/list', params: { threadStartKind: 'all' } }, { timeoutMs: 3000 }).catch(() => null);
    const tools = r && r.msg && r.msg.result && r.msg.result.tools;
    if (Array.isArray(tools) && tools.some((t) => t.name === 'create_thread')) { pipe = p; break; }
  }
  if (!pipe) { console.log('NO APP PIPE'); process.exit(3); }
  const call = (id, tool, args) => appRequest(pipe, { id, jsonrpc: '2.0', method: 'tools/call', params: { namespace: 'codex_app', tool, threadId: CALLER, callId: crypto.randomUUID(), turnId: crypto.randomUUID(), arguments: args } }, { timeoutMs: 20000 });

  const lp = await call(2, 'list_projects', {});
  const projects = JSON.parse(text(lp)).projects;
  const p = projects.find((x) => x.label === 'nerf-bench' && x.projectKind === 'local');
  if (!p) { console.log('NO PROJECT', projects.map((x) => x.label).join(', ')); process.exit(2); }
  console.log('PROJECT', JSON.stringify(p));
  const env = p.isGitRepository ? { type: 'worktree' } : { type: 'local' };

  const c = await call(3, 'create_thread', {
    title: 'Read degradation trackers for nerf-bench',
    prompt: fs.readFileSync(BRIEF, 'utf8'),
    target: { type: 'project', projectId: p.projectId, environment: env },
    model: 'gpt-6-astra', thinking: 'medium',
  });
  console.log('CREATE', c.kind, JSON.stringify(c.msg && (c.msg.error || c.msg.result)));
  if (!(c.msg && c.msg.result && c.msg.result.success !== false)) process.exit(4);

  const a = await call(4, 'set_thread_archived', { threadId: OLD, archived: true });
  console.log('ARCHIVE OLD', a.kind, JSON.stringify(a.msg && (a.msg.error || a.msg.result)));
})().catch((e) => { console.error('FAILED', e.message || e); process.exit(1); });
