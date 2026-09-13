// R-44: the app-release job, run against the vendors' live release feeds (read-only), turns each new release
// into a marker linked to its official source. Every launch app needs a feed; an app with none fails.
const path = require('path');
const ROOT = path.join(__dirname, '..');
const job = require(path.join(ROOT, 'markers/jobs/app-releases.cjs'));
const { validateMarker } = require(path.join(ROOT, 'markers/lib/types.cjs'));

(async () => {
  const fails = [];
  const r = await job.run({ since: Date.now() - 90 * 86400e3 });
  for (const [app, why] of Object.entries(r.gaps)) fails.push(`${app}: no official release feed: ${why}`);
  for (const [app, e] of Object.entries(r.errors)) fails.push(`${app}: feed read failed: ${e}`);
  for (const [app, v] of Object.entries(r.latest)) {
    const m = r.markers.find((x) => x.affects.apps[0] === app && x.version === v);
    if (!m) { fails.push(`${app}: current release ${v} has no marker`); continue; }
    const e = validateMarker(m);
    if (e.length) fails.push(`${app}: marker invalid: ${e.join('; ')}`);
    else console.log(`${app} ${v}: ${m.source_url}`);
  }
  if (fails.length) { console.error('R-44 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log(`R-44 PASS: ${r.markers.length} release markers from official feeds`);
})().catch((e) => { console.error(`R-44 FAIL: ${e.message}`); process.exit(1); });
