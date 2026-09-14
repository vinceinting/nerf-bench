// N-01 (Amendment 5): for every launch app, a real run's machine inventory (inventory.json from the
// attested run's artifact) carries no path, hook, skill, instruction file or environment variable
// traceable to harness-v2 or Vince's personal configuration. Per app, a dirty-configuration negative
// control must be caught by the same scan.
const fs = require('fs');
const os = require('os');
const path = require('path');
const c = require('../runner/verify/cells.cjs');
const inventory = require('../runner/lib/inventory.cjs');
const { expand } = require('../runner/lib/fingerprint.cjs');

c.cell('N-01', () => c.everyApp((app) => {
  const locs = c.adapter(app).configLocations;
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'n01-'));
  const d = expand(locs.find((l) => l.startsWith('~/')), home, home);
  fs.mkdirSync(path.join(d, 'hooks'), { recursive: true });
  fs.writeFileSync(path.join(d, 'hooks', 'guard.cjs'), '');
  const inv = inventory.take(locs, { home, workspace: home, env: { HARNESS_HOME: '/home/runner/.harness-v2' } });
  c.assert(inventory.scan({ ...inv, processes: [] }).length >= 2, 'negative control: planted hook and harness variable not caught');
  const r = c.realRun(app);
  c.assert(r.inventory, 'the real run has no inventory.json');
  const hits = inventory.scan(r.inventory);
  c.assert(hits.length === 0, `traces: ${hits.join('; ')}`);
  return `run ${r.record.run_id} clean`;
}));
