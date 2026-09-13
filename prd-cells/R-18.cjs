// R-18 (as amended by Amendment 13): the rotation interval is one published setting, and the methodology
// page shows its value labelled as the build's choice.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { render } = require(path.join(ROOT, 'site/methodology/build.cjs'));
const { checkPage } = require(path.join(ROOT, 'site/methodology/checks.cjs'));

const fail = (m) => { console.error(`R-18 FAIL: ${m}`); process.exit(1); };
const settings = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/methodology/settings.json'), 'utf8'));
const v = settings.rotation && settings.rotation.interval_days;
if (!Number.isInteger(v) || v <= 0) fail('site/methodology/settings.json has no rotation.interval_days');
const page = fs.readFileSync(path.join(ROOT, 'site/methodology/index.html'), 'utf8');
const lf = (s) => s.replace(/\r\n/g, '\n');
if (lf(page) !== lf(render().html)) fail('published methodology page is stale against the setting');
const f = checkPage(page, settings).failures.filter((x) => /rotation/.test(x));
if (f.length) fail(f.join('; '));
console.log(`R-18 PASS: rotation interval ${v} days, read from site/methodology/settings.json, shown on the page with the build's-choice label`);
