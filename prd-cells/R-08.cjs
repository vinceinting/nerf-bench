// R-08 (Amendment 18): for each app, a real run did not stall on a permission prompt, its record
// states "commands auto-approved", and no deviation other than the two permitted strings appears.
const c = require('../runner/verify/cells.cjs');

const ALLOWED = ['commands auto-approved', 'web access blocked'];

c.cell('R-08', () => c.everyApp((app) => {
  const r = c.realRun(app);
  c.noStall(r.log);
  const d = r.record.deviations;
  c.assert(d.includes('commands auto-approved'), 'deviations lack "commands auto-approved"');
  c.assert(d.every((x) => ALLOWED.includes(x)) && d.length === 2, `deviations are ${JSON.stringify(d)}`);
  return `run ${r.record.run_id} ok`;
}));
