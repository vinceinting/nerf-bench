// N-02: the benchmark is not a single fixed prompt and borrows no public benchmark's tasks.
// Reads the REAL private store: fails if there is no active set, if any active set holds fewer than
// 50 tasks or fewer than 50 distinct prompts, or if any task's source repository is on the
// published-benchmark list (tasks/benchmark-denylist.json: SWE-bench family, Aider Polyglot).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const store = require(path.join(root, 'tasks', 'store.cjs'));
const { loadDenylist } = require(path.join(root, 'tasks', 'harvester.cjs'));
const fail = (m) => { console.error(`N-02 FAIL: ${m}`); process.exit(1); };

const deny = loadDenylist();
if (!deny.has('django/django') || !deny.has('exercism/python')) fail('denylist is missing the SWE-bench or Aider Polyglot entries');
let s;
try { s = store.openStore(); } catch (e) { fail(e.message); }
const active = store.activeSets(s);
if (active.length === 0) fail(`no active set in the store at ${s.root}`);
for (const a of active) {
  const tdir = path.join(store.setDir(s, a.id, a.version), 'tasks');
  const tasks = fs.readdirSync(tdir).map((id) => JSON.parse(fs.readFileSync(path.join(tdir, id, 'task.json'), 'utf8')));
  if (tasks.length < 50) fail(`${a.id}@${a.version} holds ${tasks.length} tasks`);
  const prompts = new Set(tasks.map((t) => t.prompt));
  if (prompts.size < 50) fail(`${a.id}@${a.version} has only ${prompts.size} distinct prompts`);
  for (const t of tasks) if (deny.has(String(t.source.repo).toLowerCase())) fail(`${t.task_id} comes from ${t.source.repo}, a published benchmark repository`);
  console.log(`${a.id}@${a.version}: ${tasks.length} tasks, ${prompts.size} distinct prompts, none from a benchmark repository`);
}
console.log('N-02 PASS');
