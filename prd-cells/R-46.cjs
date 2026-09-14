// R-46: the status job, run against each launch lab's live status page (read-only), yields past incidents as
// markers linked to the incident. The oldest incident the page still lists is the known past incident, and
// its marker link must resolve on the status page itself.
const path = require('path');
const ROOT = path.join(__dirname, '..');
const job = require(path.join(ROOT, 'markers/jobs/status.cjs'));
const { validateMarker } = require(path.join(ROOT, 'markers/lib/types.cjs'));
const sources = require(path.join(ROOT, 'markers/sources.json'));

(async () => {
  const fails = [];
  const r = await job.run();
  for (const lab of Object.keys(sources.status_pages)) {
    if (r.errors[lab]) { fails.push(`${lab}: status page unreadable: ${r.errors[lab]}`); continue; }
    const ms = r.markers.filter((m) => m.affects.labs[0] === lab && Date.parse(m.date) < Date.now());
    if (!ms.length) { fails.push(`${lab}: no past incident listed`); continue; }
    const bad = ms.filter((m) => validateMarker(m).length);
    if (bad.length) fails.push(`${lab}: ${bad.length} invalid marker(s)`);
    const oldest = ms.sort((a, b) => a.date.localeCompare(b.date))[0];
    try {
      const res = await fetch(oldest.source_url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) fails.push(`${lab}: incident link ${oldest.source_url} returned HTTP ${res.status}`);
      else console.log(`${lab}: ${ms.length} incidents; oldest "${oldest.title}" ${oldest.date.slice(0, 10)} ${oldest.source_url}`);
    } catch (e) { fails.push(`${lab}: incident link failed: ${e.message}`); }
  }
  if (fails.length) { console.error('R-46 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('R-46 PASS: every launch lab\'s status incidents appear as linked markers');
})().catch((e) => { console.error(`R-46 FAIL: ${e.message}`); process.exit(1); });
