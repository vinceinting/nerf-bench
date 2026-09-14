// R-12: the harvester produces candidates only from real bug fixes merged after the cutoff, each
// with a check that fails on the pre-fix code and passes on the fix.
// Runs the harvester against a fixed cutoff on a synthetic local git source (offline, repeatable),
// then independently re-grades every accepted candidate on its pre-fix and fix trees.
// With --live=owner/repo it also harvests that public GitHub repository (read-only gh api calls).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const { harvest, localSource, githubSource } = require(path.join(root, 'tasks', 'harvester.cjs'));
const { makeFixtureRepo } = require(path.join(root, 'tasks', 'fixtures', 'synthetic.cjs'));
const { gradeTask } = require(path.join(root, 'scoring', 'grade.cjs'));

const fail = (m) => { console.error(`R-12 FAIL: ${m}`); process.exit(1); };

function exportTree(repo, sha, dest) {
  const files = execFileSync('git', ['-C', repo, 'ls-tree', '-r', '--name-only', sha], { encoding: 'utf8' }).trim().split('\n');
  for (const f of files) {
    const p = path.join(dest, f);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, execFileSync('git', ['-C', repo, 'show', `${sha}:${f}`]));
  }
}

function check(source, cutoff, repoDir, label) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'r12-out-'));
  const r = harvest({ source, cutoff, outDir: out });
  if (r.accepted.length === 0) fail(`${label}: harvester accepted no candidate`);
  for (const a of r.accepted) {
    const taskDir = path.join(out, a.task_id);
    const t = JSON.parse(fs.readFileSync(path.join(taskDir, 'task.json'), 'utf8'));
    if (!(Date.parse(t.source.merged_at) > Date.parse(cutoff))) fail(`${a.task_id} merged ${t.source.merged_at}, not after ${cutoff}`);
    const pre = fs.mkdtempSync(path.join(os.tmpdir(), 'r12-pre-'));
    const fix = fs.mkdtempSync(path.join(os.tmpdir(), 'r12-fix-'));
    exportTree(repoDir(), t.source.pre_commit, pre);
    exportTree(repoDir(), t.source.fix_commit, fix);
    if (gradeTask({ taskDir, workdir: pre }).pass) fail(`${a.task_id}: check passes on the pre-fix code`);
    if (!gradeTask({ taskDir, workdir: fix }).pass) fail(`${a.task_id}: check fails on the fixed code`);
  }
  console.log(`${label}: ${r.accepted.length} accepted, each after ${cutoff}, each failing before and passing after; ${r.rejected.length} rejected: ${r.rejected.map((x) => x.reason).join('; ')}`);
  return r;
}

const fx = makeFixtureRepo(path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'r12-')), 'repo'));
const r = check(localSource({ repoPath: fx.dir, name: 'fixture/local' }), fx.cutoff, () => fx.dir, 'fixture source');
if (!r.rejected.some((x) => x.reason === 'merged on or before cutoff')) fail('control: the pre-cutoff fix was not rejected');
if (!r.rejected.some((x) => x.reason === 'check passes on pre-fix code')) fail('control: the fix whose check already passed was not rejected');

const live = process.argv.find((a) => a.startsWith('--live='));
if (live) {
  const repo = live.slice(7);
  const cutoff = process.argv.find((a) => a.startsWith('--cutoff='))?.slice(9) || '2026-01-01';
  const src = githubSource({ repo, cacheDir: path.join(os.tmpdir(), 'r12-cache'), limit: 10 });
  check(src, cutoff, () => src.repoDir(), `live ${repo}`);
}
console.log('R-12 PASS');
