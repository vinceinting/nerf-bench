// R-69: a set is activated only from a committed selection record, naming the chosen candidates
// at exact versions and the selector, dated before activation.
// (1) Real store: every task in every active set appears at its recorded version in a selection
//     record whose commit predates the set's activation. (2) Refusal controls on a fixture store:
//     activation with no selection record, with a record committed after activation, and with a
//     task changed since selection are each refused.
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = path.join(__dirname, '..');
const store = require(path.join(root, 'tasks', 'store.cjs'));
const { makeCandidates } = require(path.join(root, 'tasks', 'fixtures', 'synthetic.cjs'));
const fail = (m) => { console.error(`R-69 FAIL: ${m}`); process.exit(1); };

function checkStore(s, label) {
  const active = store.activeSets(s);
  for (const a of active) {
    const committed = store.selectionCommitDate(s, a.id, a.version);
    if (!committed || !(Date.parse(committed) < Date.parse(a.activated_at))) fail(`${label} ${a.id}@${a.version}: selection record not committed before activation`);
    const rec = JSON.parse(fs.readFileSync(path.join(s.root, 'selections', `${a.id}@${a.version}.json`), 'utf8'));
    if (!rec.selector) fail(`${label} ${a.id}@${a.version}: record names no selector`);
    const want = new Map(rec.candidates.map((c) => [c.task_id, c.version]));
    for (const t of store.setTasks(store.setDir(s, a.id, a.version))) {
      if (want.get(t.task_id) !== t.version) fail(`${label} ${a.id}@${a.version}: task ${t.task_id} not in the record at its version`);
    }
  }
  return active.length;
}

let real = null;
try { real = store.openStore(); } catch { /* no store yet */ }
if (real) console.log(`real store ${real.root}: ${checkStore(real, 'real')} active set(s) checked`);
else console.log('real store: none exists yet, so no active set to check');

const s = store.openStore(fs.mkdtempSync(path.join(os.tmpdir(), 'r69-')), { create: true });
const cands = makeCandidates(s.root, 50);
const refusedWith = (fn, re, what) => { try { fn(); } catch (e) { if (re.test(e.message)) return; fail(`${what}: refused for the wrong reason: ${e.message}`); } fail(`${what}: not refused`); };
// no record: build the set by hand, bypassing buildSet
const dir = store.setDir(s, 'fx-x', '1');
for (const c of cands) fs.cpSync(path.join(s.root, 'candidates', c.task_id), path.join(dir, 'tasks', c.task_id), { recursive: true });
fs.writeFileSync(path.join(dir, 'set.json'), '{"id":"fx-x","version":"1","earliest_fix_at":"2026-06-01T00:00:00Z"}\n');
refusedWith(() => store.activateSet(s, { id: 'fx-x', version: '1', at: '2026-07-02T00:00:00Z' }), /no committed selection record/, 'activation without a record');
// record committed after the activation time
store.recordSelection(s, { set_id: 'fx-y', set_version: '1', selector: 'fixture-selector', candidates: cands.map((c) => ({ ...c })), at: '2026-07-05T00:00:00Z' });
store.buildSet(s, { id: 'fx-y', version: '1' });
refusedWith(() => store.activateSet(s, { id: 'fx-y', version: '1', at: '2026-07-04T00:00:00Z' }), /not before activation/, 'activation before the record');
// task changed after selection
const f = path.join(store.setDir(s, 'fx-y', '1'), 'tasks', cands[3].task_id, 'task.json');
const orig = fs.readFileSync(f);
fs.writeFileSync(f, Buffer.concat([orig, Buffer.from(' ')]));
refusedWith(() => store.activateSet(s, { id: 'fx-y', version: '1', at: '2026-07-06T00:00:00Z' }), /not in the selection record/, 'activation with a changed task');
fs.writeFileSync(f, orig);
store.activateSet(s, { id: 'fx-y', version: '1', at: '2026-07-06T00:00:00Z' });
if (checkStore(s, 'fixture') !== 1) fail('fixture: valid activation not recorded');
console.log('refusals held: no record, record after activation, task changed since selection; a valid activation passed');
console.log('R-69 PASS');
