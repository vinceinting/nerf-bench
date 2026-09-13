// R-05 (Amendment 6): the most recent attestation-verified Claude desktop app run, on a GitHub-hosted
// runner whose OS the record names, lists every task with pass or fail, its log shows the app's
// installer and version, and no standalone Claude Code CLI binary was invoked.
const c = require('../runner/verify/cells.cjs');

c.cell('R-05', () => {
  const r = c.realRun('claude-desktop');
  c.tasksListed(r.record);
  c.officialInstall(r.record, r.log);
  c.noStall(r.log);
  c.assert(r.record.machine.hosted === true && ['windows', 'macos'].includes(r.record.machine.os), 'not a GitHub-hosted runner of an OS the app ships for');
  const invoked = r.log.split('\n').filter((l) => / INVOKE /.test(l));
  c.assert(!invoked.some((l) => /: claude(\.exe)? /.test(l)), 'the Claude Code CLI binary was invoked');
  const procs = (r.inventory && r.inventory.processes) || [];
  c.assert(!procs.some((p) => /(^|[\\/])claude(\.exe)?(\s|$)/.test(p)), 'a standalone Claude Code CLI process was present');
  return `run ${r.record.run_id} on ${r.record.machine.os}: ${r.record.totals.passed}/${r.record.totals.total}`;
});
