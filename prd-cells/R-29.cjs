// R-29 (Amendment 22): one real subscription-path run per launch app completed and names its path;
// the API path's recording is proved on a fake agent run (no API key paid by Vince is used).
// The amendment points at R-71's fixtures for the API recording; those belong to the site track,
// so this cell proves the runner's half directly.
const fs = require('fs');
const path = require('path');
const c = require('../runner/verify/cells.cjs');
const h = require('../runner/test/helpers.cjs');

c.cell('R-29', () => {
  const k = h.keys();
  const set = h.makeSet('fixture-r29', '1', ['t1']);
  const r = h.runRunner(['--app', 'claude-code', '--model', 'claude-opus-5', '--access', 'api'], { NB_TASK_STORE_URL: h.makeStore('claude-opus-5', [set]), NB_TRANSCRIPT_KEY: k.pubFile, ANTHROPIC_API_KEY: 'fake-not-a-key' });
  c.assert(r.result && r.result.access_path === 'api', `api path not recorded as api: ${r.stderr}`);
  const real = c.everyApp((app) => {
    const x = c.realRun(app, (rec) => rec.access_path === 'subscription');
    c.tasksListed(x.record);
    return `run ${x.record.run_id} subscription`;
  });
  return `api recording ok on fake agent; ${real}`;
});
