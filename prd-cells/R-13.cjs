// R-13: every active task set holds 50 to 100 tasks (Amendment 19's operational bound).
// Reads the REAL private task store (NERF_TASK_STORE, default tasks/.store). No store or no active
// set is a failure: the requirement is about sets that exist.
const fs = require('fs');
const path = require('path');
const store = require(path.join(__dirname, '..', 'tasks', 'store.cjs'));

const fail = (m) => { console.error(`R-13 FAIL: ${m}`); process.exit(1); };
let s;
try { s = store.openStore(); } catch (e) { fail(e.message); }
const active = store.activeSets(s);
if (active.length === 0) fail(`no active or overlap set in the store at ${s.root}`);
for (const a of active) {
  const n = fs.readdirSync(path.join(store.setDir(s, a.id, a.version), 'tasks')).length;
  if (n < 50 || n > 100) fail(`set ${a.id}@${a.version} holds ${n} tasks`);
  console.log(`${a.id}@${a.version} (${a.status}): ${n} tasks`);
}
console.log('R-13 PASS');
