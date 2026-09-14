// R-09 (Amendments 5, 18): in every launch app, a live run of the web-fetch probe task (a probe set,
// disjoint from benchmark sets, id starting "probe-web") shows the fetch refused at the network layer
// in the run log, and the record states "web access blocked". It reads the most recent attested
// probe run per app; dispatching one spends the account's usage, so it is started by the operator
// with task_set probe-web, not by this cell.
const c = require('../runner/verify/cells.cjs');

c.cell('R-09', () => c.everyApp((app) => {
  const r = c.realRun(app, (rec) => rec.task_sets.some((s) => s.id.startsWith('probe-web')));
  const refused = r.log.split('\n').filter((l) => / REFUSED /.test(l));
  c.assert(refused.length > 0, 'the run log records no network-layer refusal');
  c.assert(/NETBLOCK /.test(r.log) && !/proxy only \(local test mode/.test(r.log), 'the network block was not applied');
  c.assert(r.record.deviations.includes('web access blocked'), 'record lacks "web access blocked"');
  return `run ${r.record.run_id}: ${refused.length} refusal(s)`;
}));
