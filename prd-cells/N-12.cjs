// N-12: no marker in the store is editorial or community-submitted: every one has an allowed type and an
// official source. Control: an editorial marker injected into a copy of the store must be caught.
const fs = require('fs');
const os = require('os');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const store = require(path.join(ROOT, 'markers/lib/store.cjs'));
const { validateMarker } = require(path.join(ROOT, 'markers/lib/types.cjs'));

const markers = store.load();
const bad = markers.map((m) => [m.id, validateMarker(m)]).filter(([, e]) => e.length);
const copy = [...markers, { id: 'control', type: 'editorial', date: '2026-09-12', title: 'we think it got worse', source_url: 'https://example.com/blog', affects: { labs: ['openai'] } }];
const caught = copy.filter((m) => validateMarker(m).length).length === bad.length + 1;
const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'nb-n12-')), 'm.jsonl');
let refused = false;
try { store.append([copy[copy.length - 1]], f); } catch { refused = true; }
if (bad.length || !caught || !refused) {
  for (const [id, e] of bad) console.error(`N-12 FAIL: ${id}: ${e.join('; ')}`);
  if (!caught || !refused) console.error('N-12 FAIL: negative control not caught');
  process.exit(1);
}
console.log(`N-12 PASS: ${markers.length} stored markers all official; editorial control refused`);
