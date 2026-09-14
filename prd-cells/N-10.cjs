// N-10: no verdict text contains "nerf" or wording that attributes intent. Generates every verdict
// template with fixture data (both directions, many sizes, the non-clearing card, and verdicts from
// evaluated fixture series) and scans each. A control proves the scan catches a banned word.
const path = require('path');
const root = path.join(__dirname, '..');
const { verdict, TEMPLATES, fill } = require(path.join(root, 'stats', 'verdict.cjs'));
const { evaluateSeries } = require(path.join(root, 'stats', 'series.cjs'));
const { makeRuns, taskBase } = require(path.join(root, 'stats', 'fixtures', 'runs.cjs'));
const fail = (m) => { console.error(`N-10 FAIL: ${m}`); process.exit(1); };
const WORDS = ['nerf', 'deliberate', 'intentional', 'on purpose', 'throttled'];
const scan = (t) => WORDS.filter((w) => String(t).toLowerCase().includes(w));

if (scan('The model was throttled').length !== 1) fail('control: scan missed a banned word');
const texts = [];
for (const [k, t] of Object.entries(TEMPLATES)) { texts.push(t); texts.push(fill(t, 12.5)); if (!t) fail(`template ${k} empty`); }
for (let d = -0.5; d <= 0.5; d += 0.01) texts.push(verdict({ clears: true, delta: d, reason: 'rule clears' }).text, verdict({ clears: false, delta: d, reason: 'x' }).text);
const REL = '2026-06-01T00:00:00Z';
for (const [i, shift] of [-0.25, -0.1, 0, 0.1, 0.25].entries()) {
  const e = evaluateSeries(makeRuns({ releaseAt: REL, seed: 30 + i, rate: (d, s, j) => Math.min(0.98, Math.max(0.02, taskBase(j) + (d > 14 ? shift : 0))) }), { releaseAt: REL, asOf: '2026-07-01T00:00:00Z' });
  texts.push(e.verdict.text, e.verdict.headline || '');
}
for (const t of texts) { const hit = scan(t); if (hit.length) fail(`"${t}" contains ${hit.join(', ')}`); }
console.log(`${texts.length} verdict texts from ${Object.keys(TEMPLATES).length} templates scanned; none contains a banned word`);
console.log('N-10 PASS');
