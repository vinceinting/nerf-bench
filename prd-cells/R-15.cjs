// R-15: each set's fingerprint is published before its first public result, and recomputing it
// from a retired set's published files yields the same value.
// Real things only: the store's registry, the site's published fingerprints
// (site/data/task-sets.json: [{ id, version, fingerprint, published_at }]), public results
// (site/data/**/result.json) and retired sets' files (site/data/retired-sets/<id>/<version>/).
// The recompute mechanics are proved on a fixture first so a failure below is about missing data.
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = path.join(__dirname, '..');
const { fingerprintDir } = require(path.join(root, 'tasks', 'fingerprint.cjs'));
const store = require(path.join(root, 'tasks', 'store.cjs'));
const fail = (m) => { console.error(`R-15 FAIL: ${m}`); process.exit(1); };

// Mechanics: a copied set recomputes to the same fingerprint; one changed byte does not.
const fx = fs.mkdtempSync(path.join(os.tmpdir(), 'r15-'));
fs.mkdirSync(path.join(fx, 'tasks', 'fx-1'), { recursive: true });
fs.writeFileSync(path.join(fx, 'set.json'), '{"id":"fx"}\n');
fs.writeFileSync(path.join(fx, 'tasks', 'fx-1', 'task.json'), '{"fixture":true}\n');
const f1 = fingerprintDir(fx);
const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'r15c-'));
fs.cpSync(fx, copy, { recursive: true });
if (fingerprintDir(copy) !== f1) fail('mechanics: a copied set recomputes differently');
fs.writeFileSync(path.join(copy, 'set.json'), '{"id":"fX"}\n');
if (fingerprintDir(copy) === f1) fail('mechanics control: a changed byte kept the fingerprint');
console.log('mechanics: recompute matches, changed byte is caught');

let s;
try { s = store.openStore(); } catch (e) { fail(`real data: ${e.message}`); }
const reg = store.registry(s);
if (reg.sets.length === 0) fail('real data: no set has been activated in the store');
const pub = path.join(root, 'site', 'data', 'task-sets.json');
if (!fs.existsSync(pub)) fail(`real data: no published fingerprints at ${pub}`);
const published = JSON.parse(fs.readFileSync(pub, 'utf8'));
const results = [];
(function walk(d) { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'result.json') results.push(JSON.parse(fs.readFileSync(p, 'utf8'))); } })(path.join(root, 'site', 'data'));
if (results.length === 0) fail('real data: no public result exists yet');
for (const set of reg.sets) {
  const p = published.find((x) => x.id === set.id && x.version === set.version);
  if (!p || p.fingerprint !== set.fingerprint) fail(`${set.id}@${set.version}: published fingerprint missing or different`);
  const first = results.filter((r) => r.task_sets.some((t) => t.fingerprint === set.fingerprint)).map((r) => Date.parse(r.started_at)).sort((a, b) => a - b)[0];
  if (first !== undefined && !(Date.parse(p.published_at) < first)) fail(`${set.id}@${set.version}: published ${p.published_at}, not before first result`);
}
for (const set of store.statusAt(reg, new Date().toISOString()).filter((x) => x.status === 'retired')) {
  const dir = path.join(root, 'site', 'data', 'retired-sets', set.id, set.version);
  if (!fs.existsSync(dir)) fail(`${set.id}@${set.version} retired but its files are not published at ${dir}`);
  if (fingerprintDir(dir) !== set.fingerprint) fail(`${set.id}@${set.version}: published files recompute to a different fingerprint`);
}
console.log('R-15 PASS');
