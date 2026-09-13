// R-01: the most recent attestation-verified Claude Code CLI run lists every task with pass or fail,
// and its log shows the official installer and the vendor's release version.
const c = require('../runner/verify/cells.cjs');

c.cell('R-01', () => {
  const r = c.realRun('claude-code');
  c.tasksListed(r.record);
  c.officialInstall(r.record, r.log);
  c.noStall(r.log);
  return `run ${r.record.run_id}: ${r.record.totals.passed}/${r.record.totals.total}, ${r.record.app.id} ${r.record.app.version}`;
});
