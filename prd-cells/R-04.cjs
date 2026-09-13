// R-04 (Amendment 6): the most recent attestation-verified Codex Windows app run, on a GitHub-hosted
// Windows runner, lists every task with pass or fail, its log shows the app's own installer and
// version, and no Codex CLI binary was invoked.
const c = require('../runner/verify/cells.cjs');

c.cell('R-04', () => {
  const r = c.realRun('codex-desktop');
  c.tasksListed(r.record);
  c.officialInstall(r.record, r.log);
  c.noStall(r.log);
  c.assert(r.record.machine.os === 'windows' && r.record.machine.hosted === true, 'not a GitHub-hosted Windows runner');
  const invoked = r.log.split('\n').filter((l) => / INVOKE /.test(l));
  c.assert(!invoked.some((l) => /: codex(\.exe)? /.test(l)), 'the Codex CLI binary was invoked');
  const procs = (r.inventory && r.inventory.processes) || [];
  c.assert(!procs.some((p) => /(^|[\\/])codex(\.exe)?(\s|$)/.test(p)), 'a Codex CLI process was present');
  return `run ${r.record.run_id}: ${r.record.totals.passed}/${r.record.totals.total}`;
});
