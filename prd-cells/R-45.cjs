// R-45: the model-release job, run against each launch lab's live announcement source (read-only), yields a
// known release as a marker with its source link. Known releases: markers/sources.json known_model_releases.
const path = require('path');
const ROOT = path.join(__dirname, '..');
const job = require(path.join(ROOT, 'markers/jobs/model-releases.cjs'));
const { validateMarker } = require(path.join(ROOT, 'markers/lib/types.cjs'));
const sources = require(path.join(ROOT, 'markers/sources.json'));

(async () => {
  const fails = [];
  const r = await job.run();
  for (const [lab, e] of Object.entries(r.errors)) fails.push(`${lab}: announcement source unreadable: ${e}`);
  for (const k of sources.known_model_releases) {
    if (r.errors[k.lab]) continue;
    const m = r.markers.find((x) => x.affects.labs[0] === k.lab && (k.source_url ? x.source_url === k.source_url : x.title.includes(k.title_contains)));
    if (!m) { fails.push(`${k.lab}: known release ${k.source_url || k.title_contains} not found as a marker`); continue; }
    const e = validateMarker(m);
    if (e.length) fails.push(`${k.lab}: ${e.join('; ')}`); else console.log(`${k.lab}: "${m.title}" ${m.date.slice(0, 10)} ${m.source_url}`);
  }
  if (fails.length) { console.error('R-45 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('R-45 PASS: a known release from every launch lab appears as a linked marker');
})().catch((e) => { console.error(`R-45 FAIL: ${e.message}`); process.exit(1); });
