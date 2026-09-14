// R-57 (as amended by Amendment 4): with the site unreachable, the standalone verifier checks a PUBLISHED
// run's real attestation and recomputes its score. Needs real files, not fixtures:
//   NERF_PUBLISHED_CURRENT_RUN  path to a published current-set result.json (plus .bundle beside it, optional)
//   NERF_PUBLISHED_RETIRED_RUN  path to a published retired-set result.json
//   NERF_PUBLISHED_RETIRED_DIR  path to the published retired/ directory
// The verifier holds no site address and makes no HTTP call of its own (tools/verify/test asserts this);
// its only network use is gh, which talks to GitHub and Sigstore, so the site's reachability is irrelevant.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const VERIFY = path.join(ROOT, 'tools/verify/verify.cjs');

const fails = [];
const cur = process.env.NERF_PUBLISHED_CURRENT_RUN;
const ret = process.env.NERF_PUBLISHED_RETIRED_RUN;
const dir = process.env.NERF_PUBLISHED_RETIRED_DIR;
if (!cur || !fs.existsSync(cur)) fails.push('no published current-set run with a real attestation exists yet (NERF_PUBLISHED_CURRENT_RUN)');
if (!ret || !dir || !fs.existsSync(ret)) fails.push('no published retired-set run exists yet (NERF_PUBLISHED_RETIRED_RUN, NERF_PUBLISHED_RETIRED_DIR)');

const env = { ...process.env };
delete env.NERF_VERIFY_GH; // the real gh, never the test double
function run(file, extra) {
  const bundle = file.replace(/\.json$/, '.bundle');
  const args = [VERIFY, file, '--json', ...extra, ...(fs.existsSync(bundle) ? ['--bundle', bundle] : [])];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', env, timeout: 300000 });
  try { return JSON.parse(r.stdout); } catch { return { ok: false, mode: 'none', checks: { error: { detail: r.stderr } } }; }
}
if (!fails.length) {
  const c = run(cur, []);
  if (!c.ok || c.checks.regrade.performed !== false || !/regrading follows retirement/.test(c.mode)) fails.push(`current-set run: ${JSON.stringify(c.checks)}`);
  const r = run(ret, ['--retired', dir]);
  if (!r.ok || !/full regrade/.test(r.mode)) fails.push(`retired-set run: ${JSON.stringify(r.checks)}`);
}
if (fails.length) { console.error('R-57 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('R-57 PASS: real attestation verified, current-set run recounted, retired-set run fully regraded');
