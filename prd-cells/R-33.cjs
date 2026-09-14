// R-33: a real run at a non-default effort used that effort (the run log shows the app's effort flag
// with that value) and its record names it.
const c = require('../runner/verify/cells.cjs');
const realRuns = require('../runner/verify/real-runs.cjs');

const FLAG = { 'claude-code': (e) => `--effort ${e}`, 'codex-cli': (e) => `model_reasoning_effort="${e}"`, 'grok-build': (e) => `--reasoning-effort ${e}` };

c.cell('R-33', () => {
  const r = realRuns.latest((rec) => rec.effort !== 'default' && FLAG[rec.app.id]);
  const rec = r.record;
  c.assert(rec.effort_is_default === false, 'record marks a non-default effort as default');
  const invokes = r.log.split('\n').filter((l) => / INVOKE /.test(l));
  c.assert(invokes.length > 0, 'run log shows no invocation');
  c.assert(invokes.every((l) => l.includes(FLAG[rec.app.id](rec.effort))), `not every invocation passed ${FLAG[rec.app.id](rec.effort)}`);
  return `run ${rec.run_id}: ${rec.app.id} at effort ${rec.effort}`;
});
