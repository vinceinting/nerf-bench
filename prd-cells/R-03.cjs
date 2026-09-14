// R-03: the most recent attestation-verified Grok Build run, in headless -p mode, lists every task
// with pass or fail, and its log shows the official install and version.
const c = require('../runner/verify/cells.cjs');

c.cell('R-03', () => {
  const r = c.realRun('grok-build');
  c.tasksListed(r.record);
  c.officialInstall(r.record, r.log);
  c.noStall(r.log);
  c.assert(/INVOKE \S+: grok -p <prompt>/.test(r.log), 'run log does not show the headless -p invocation');
  return `run ${r.record.run_id}: ${r.record.totals.passed}/${r.record.totals.total}, ${r.record.app.id} ${r.record.app.version}`;
});
