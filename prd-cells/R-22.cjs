// R-22: a verdict headline appears only when the published rule clears; otherwise the card reads
// "within normal variation". Feeds the verdict engine one fixture series that clears and one that does not.
const path = require('path');
const root = path.join(__dirname, '..');
const { evaluateSeries } = require(path.join(root, 'stats', 'series.cjs'));
const { makeRuns, taskBase } = require(path.join(root, 'stats', 'fixtures', 'runs.cjs'));
const fail = (m) => { console.error(`R-22 FAIL: ${m}`); process.exit(1); };
const REL = '2026-06-01T00:00:00Z';
const AS_OF = '2026-07-01T00:00:00Z';

const clears = evaluateSeries(makeRuns({ releaseAt: REL, rate: (d, s, i) => taskBase(i) - (d > 14 ? 0.2 : 0) }), { releaseAt: REL, asOf: AS_OF });
const noise = evaluateSeries(makeRuns({ releaseAt: REL, seed: 7, rate: (d, s, i) => taskBase(i) }), { releaseAt: REL, asOf: AS_OF });
if (clears.decision.clears !== true || !clears.verdict.headline) fail(`clearing series gave no headline: ${clears.decision.reason}`);
if (noise.decision.clears !== false || noise.verdict.headline !== null) fail(`non-clearing series gave a headline: ${noise.verdict.text}`);
if (noise.verdict.text !== 'within normal variation') fail(`non-clearing card reads "${noise.verdict.text}"`);
console.log(`clearing: "${clears.verdict.headline}" (delta ${clears.decision.delta.toFixed(3)}, 99% [${clears.decision.lower.toFixed(3)}, ${clears.decision.upper.toFixed(3)}])`);
console.log(`not clearing: "${noise.verdict.text}" (${noise.decision.reason})`);
console.log('R-22 PASS');
