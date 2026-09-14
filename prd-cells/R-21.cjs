// R-21: the methodology page states that a determined contributor can read the current task set, and that
// the signature still prevents faked results (amendment A1).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { STATEMENTS } = require(path.join(ROOT, 'site/methodology/checks.cjs'));

const page = fs.readFileSync(path.join(ROOT, 'site/methodology/index.html'), 'utf8');
const t = page.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const missing = ['contributor can read current set (A1)', 'signature prevents faked results (A1)'].filter((k) => !STATEMENTS[k].test(t));
if (missing.length) { console.error(`R-21 FAIL: methodology page lacks ${missing.join(' and ')}`); process.exit(1); }
console.log('R-21 PASS: site/methodology/index.html carries both amendment A1 statements');
