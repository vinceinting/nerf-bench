// N-15: a test-contributor run whose caller names a set the official store did not serve for that
// model is refused before any task runs. Real proof: a run in the test contributor's repository
// (NB_TEST_CONTRIBUTOR_REPO, owner/name) whose log shows the refusal and no agent invocation.
// Local control with the fake agent runs first; it is never the proof.
const { execFileSync } = require('child_process');
const c = require('../runner/verify/cells.cjs');
const h = require('../runner/test/helpers.cjs');

const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });

c.cell('N-15', () => {
  const k = h.keys();
  const set = h.makeSet('served-set', '1', ['t1']);
  const r = h.runRunner(['--app', 'claude-code', '--model', 'claude-opus-5', '--task-set', 'not-served'], { NB_TASK_STORE_URL: h.makeStore('claude-opus-5', [set]), NB_TRANSCRIPT_KEY: k.pubFile });
  c.assert(r.status !== 0 && /not served by the official store/.test(r.stderr) && !/ INVOKE /.test(r.log), 'local control: unserved set was not refused before tasks');

  const repo = process.env.NB_TEST_CONTRIBUTOR_REPO;
  c.assert(repo, 'no test contributor repository named (NB_TEST_CONTRIBUTOR_REPO); the real refusal run has not been read');
  const runs = JSON.parse(gh(['run', 'list', '-R', repo, '--workflow', 'nerf-bench-run.yml', '--status', 'failure', '--json', 'databaseId', '-L', '20']));
  for (const x of runs) {
    let log = '';
    try { log = gh(['run', 'view', String(x.databaseId), '-R', repo, '--log']); } catch { continue; }
    if (/not served by the official store/.test(log)) {
      c.assert(!/ INVOKE /.test(log), `run ${x.databaseId} invoked the agent before refusing`);
      return `run ${x.databaseId} in ${repo} refused before any task`;
    }
  }
  throw new Error(`no refused run found among ${runs.length} failed runs in ${repo}`);
});
