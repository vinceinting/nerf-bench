// R-02: the most recent attestation-verified Codex CLI run lists every task with pass or fail, and
// its log shows the official install and version.
const c = require('../runner/verify/cells.cjs');

c.cell('R-02', () => {
  const r = c.realRun('codex-cli');
  c.tasksListed(r.record);
  c.officialInstall(r.record, r.log);
  c.noStall(r.log);
  return `run ${r.record.run_id}: ${r.record.totals.passed}/${r.record.totals.total}, ${r.record.app.id} ${r.record.app.version}`;
});
