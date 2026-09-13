// R-07 (Amendment 5): for every launch app, a real run's config-location fingerprint matches the
// published fresh-install value for its app version; per app, a negative control adds one
// instruction file before fingerprinting and the mismatch must be reported.
const fs = require('fs');
const os = require('os');
const path = require('path');
const c = require('../runner/verify/cells.cjs');
const fingerprint = require('../runner/lib/fingerprint.cjs');

const published = JSON.parse(fs.readFileSync(path.join(c.ROOT, 'runner', 'fingerprint', 'published.json'), 'utf8'));
const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), p));

c.cell('R-07', () => c.everyApp((app) => {
  // Negative control first: it needs no real run.
  const locs = c.adapter(app).configLocations;
  const clean = fingerprint.compute(locs, { home: tmp('h-'), workspace: tmp('w-') });
  const dirty = tmp('h-');
  const loc = fingerprint.expand(locs.find((l) => l.startsWith('~/')), dirty, dirty);
  fs.mkdirSync(loc, { recursive: true });
  fs.writeFileSync(path.join(loc, 'CLAUDE.md'), 'an added instruction file');
  const bad = fingerprint.compare({ app: { id: app, version: 'control' }, fingerprint: fingerprint.compute(locs, { home: dirty, workspace: tmp('w-') }) }, { [`${app}@control`]: clean });
  c.assert(!bad.ok && /mismatch/.test(bad.reason), 'negative control: an added instruction file was not reported');
  const r = c.realRun(app);
  const cmp = fingerprint.compare(r.record, published);
  c.assert(cmp.ok, cmp.reason);
  return cmp.reason;
}));
