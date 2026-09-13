// R-14: grading is automatic only. (1) Scans scoring/ for any model API host, SDK or agent CLI and
// any network client. (2) Grades a fixture run in a child process whose network is disabled
// (every socket, DNS lookup and fetch throws, inherited by the check processes too) and fails
// unless grading completes with the right results. A control proves the block is live.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const fail = (m) => { console.error(`R-14 FAIL: ${m}`); process.exit(1); };

const BAD = [
  /api\.anthropic\.com/i, /api\.openai\.com/i, /api\.x\.ai/i, /generativelanguage/i, /@anthropic-ai/i, /\bopenai\b/i, /\banthropic\b/i,
  /\bclaude\b/i, /\bcodex\b/i, /\bgrok\b/i, /\bllm\b/i, /\bjudge\b/i,
  /require\(['"](node:)?(https?|net|tls|dgram|dns|http2)['"]\)/, /\bfetch\s*\(/, /XMLHttpRequest/, /WebSocket/,
];
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p); } })(path.join(root, 'scoring'));
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const re of BAD) if (re.test(text)) fail(`${path.relative(root, f)} matches ${re}`);
}
console.log(`scan: ${files.length} files under scoring/, no model, agent or network call`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r14-'));
const blocker = path.join(tmp, 'block-network.cjs');
fs.writeFileSync(blocker, [
  "const net = require('net'); const dns = require('dns');",
  "const deny = () => { throw new Error('network disabled'); };",
  'net.Socket.prototype.connect = deny; net.connect = deny; net.createConnection = deny;',
  'dns.lookup = deny; dns.resolve = deny; if (dns.promises) { dns.promises.lookup = deny; dns.promises.resolve = deny; }',
  'globalThis.fetch = deny;',
  '',
].join('\n'));
const job = path.join(tmp, 'job.cjs');
fs.writeFileSync(job, [
  "const fs = require('fs'); const path = require('path');",
  `const { gradeTask, totals } = require(${JSON.stringify(path.join(root, 'scoring', 'grade.cjs'))});`,
  `const { makeCandidates } = require(${JSON.stringify(path.join(root, 'tasks', 'fixtures', 'synthetic.cjs'))});`,
  `const base = ${JSON.stringify(tmp)};`,
  "let blocked = false; try { require('net').connect(443, 'example.com'); } catch { blocked = true; }",
  "if (!blocked) { console.log('CONTROL: network not blocked'); process.exit(3); }",
  "makeCandidates(base, 4);",
  "const results = ['fx-000', 'fx-001', 'fx-002', 'fx-003'].map((id, i) => {",
  "  const w = fs.mkdtempSync(path.join(base, 'w-')); if (i % 2 === 0) fs.writeFileSync(path.join(w, 'solved.txt'), 'x');",
  "  return gradeTask({ taskDir: path.join(base, 'candidates', id), workdir: w }); });",
  'console.log(JSON.stringify(totals(results)));',
  '',
].join('\n'));
const env = { ...process.env, NODE_OPTIONS: `--require=${JSON.stringify(blocker).slice(1, -1).replace(/\\\\/g, '/')}`, HTTP_PROXY: 'http://127.0.0.1:9', HTTPS_PROXY: 'http://127.0.0.1:9' };
delete env.NODE_TEST_CONTEXT;
const r = spawnSync(process.execPath, ['--require', blocker, job], { env, encoding: 'utf8' });
if (r.status === 3) fail('control: the network block did not take effect');
if (r.status !== 0) fail(`grading offline did not complete: ${r.stderr}`);
const t = JSON.parse(r.stdout.trim().split('\n').pop());
if (t.passed !== 2 || t.total !== 4) fail(`offline grading gave ${JSON.stringify(t)}, expected 2 of 4`);
console.log(`offline grading completed: ${t.passed} of ${t.total} passed, as seeded; network block control held`);
console.log('R-14 PASS');
