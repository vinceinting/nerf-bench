'use strict';
// Task harvester (R-12, N-02). Finds real bug fixes merged after a knowledge cutoff and keeps
// only those whose automatic check FAILS on the pre-fix code and PASSES on the fix.
// Sources: "github" (read-only `gh api` calls plus a public clone) and "local" (a git repo on disk,
// used by fixtures). Output goes to a candidates directory inside the private store, never the repo.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { gradeTask } = require('../scoring/grade.cjs');
const { fingerprintDir } = require('./fingerprint.cjs');

const TEST_FILE = /(^|\/)(test|tests|__tests__|spec)\/|\.(test|spec)\.[cm]?[jt]sx?$|_test\.(py|go)$|(^|\/)test_[^/]+\.py$/;

function git(cwd, args, opts = {}) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: opts.encoding === null ? null : 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });
}

function loadDenylist() {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'benchmark-denylist.json'), 'utf8'));
  return new Set(Object.values(d.sources).flat().map((r) => r.toLowerCase()));
}

// ---- sources -------------------------------------------------------------

// Local git repo: every commit whose subject starts with "fix" is a candidate; its parent is the pre-fix code.
function localSource({ repoPath, name }) {
  return {
    name: name || path.basename(repoPath),
    repoDir: () => repoPath,
    list() {
      const out = git(repoPath, ['log', '--format=%H%x09%P%x09%cI%x09%s']).trim();
      if (!out) return [];
      return out.split('\n').map((line) => {
        const [sha, parents, date, subject] = line.split('\t');
        if (!/^fix/i.test(subject || '')) return null;
        const parent = parents.split(' ')[0];
        if (!parent) return null;
        const files = git(repoPath, ['diff', '--name-only', parent, sha]).trim().split('\n').filter(Boolean);
        const body = git(repoPath, ['log', '-1', '--format=%B', sha]).trim();
        return { ref: `${name || repoPath}@${sha}`, fix_commit: sha, pre_commit: parent, merged_at: date, title: subject, body, files };
      }).filter(Boolean);
    },
  };
}

function gh(args) {
  return JSON.parse(execFileSync('gh', ['api', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 }));
}

// GitHub: merged pull requests after the cutoff, read-only. The repo is cloned once into cacheDir.
function githubSource({ repo, cacheDir, limit = 30 }) {
  const dir = path.join(cacheDir, repo.replace('/', '__'));
  return {
    name: repo,
    repoDir() {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
        execFileSync('git', ['clone', '--quiet', '--filter=blob:none', `https://github.com/${repo}.git`, dir], { stdio: 'ignore' });
      }
      return dir;
    },
    list(cutoff) {
      const day = new Date(cutoff).toISOString().slice(0, 10);
      const found = gh(['-X', 'GET', 'search/issues', '-f', `q=repo:${repo} is:pr is:merged merged:>${day}`, '-f', `per_page=${limit}`]);
      return found.items.map((it) => {
        const pr = gh([`repos/${repo}/pulls/${it.number}`]);
        if (!pr.merged_at || !pr.merge_commit_sha) return null;
        const files = gh([`repos/${repo}/pulls/${it.number}/files`, '-X', 'GET', '-f', 'per_page=100']).map((f) => f.filename);
        return { ref: `${repo}#${it.number}`, fix_commit: pr.merge_commit_sha, pre_commit: null, merged_at: pr.merged_at, title: pr.title, body: pr.body || '', files };
      }).filter(Boolean);
    },
  };
}

// ---- validation ----------------------------------------------------------

function exportTree(repoDir, sha, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const files = git(repoDir, ['ls-tree', '-r', '--name-only', sha]).trim().split('\n').filter(Boolean);
  for (const f of files) {
    const bytes = git(repoDir, ['show', `${sha}:${f}`], { encoding: null });
    const p = path.join(dest, f);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, bytes);
  }
}

function taskIdFor(ref) {
  return `t-${crypto.createHash('sha256').update(ref).digest('hex').slice(0, 12)}`;
}

// Checks one candidate: returns { ok, reason, task } where task is written to outDir when ok.
function validate(cand, { source, cutoff, checkArgv, outDir, denylist, timeoutMs }) {
  if (!(Date.parse(cand.merged_at) > Date.parse(cutoff))) return { ok: false, reason: 'merged on or before cutoff' };
  if (denylist.has(String(source.name).toLowerCase())) return { ok: false, reason: 'repository is in a published benchmark' };
  const tests = cand.files.filter((f) => TEST_FILE.test(f));
  const code = cand.files.filter((f) => !TEST_FILE.test(f));
  if (tests.length === 0) return { ok: false, reason: 'fix changes no test file' };
  if (code.length === 0) return { ok: false, reason: 'fix changes only tests' };
  const repoDir = source.repoDir();
  const pre = cand.pre_commit || git(repoDir, ['rev-parse', `${cand.fix_commit}^1`]).trim();
  const task_id = taskIdFor(cand.ref);
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'nb-cand-'));
  try {
    const taskDir = path.join(staging, 'task');
    const checkDir = path.join(taskDir, 'check');
    for (const f of tests) {
      let bytes;
      try { bytes = git(repoDir, ['show', `${cand.fix_commit}:${f}`], { encoding: null }); } catch { continue; } // deleted test file
      fs.mkdirSync(path.dirname(path.join(checkDir, f)), { recursive: true });
      fs.writeFileSync(path.join(checkDir, f), bytes);
    }
    const argv = checkArgv.flatMap((a) => (a === '{tests}' ? tests : [a]));
    const task = {
      task_id,
      source: { repo: source.name, fix_commit: cand.fix_commit, pre_commit: pre, merged_at: cand.merged_at },
      cutoff,
      prompt: `${cand.title}\n\n${cand.body}`.trim(),
      check: { argv },
    };
    fs.writeFileSync(path.join(taskDir, 'task.json'), `${JSON.stringify(task, null, 2)}\n`);
    const preDir = path.join(staging, 'pre');
    exportTree(repoDir, pre, preDir);
    const before = gradeTask({ taskDir, workdir: preDir, timeoutMs });
    if (before.pass) return { ok: false, reason: 'check passes on pre-fix code' };
    const fixDir = path.join(staging, 'fix');
    exportTree(repoDir, cand.fix_commit, fixDir);
    const after = gradeTask({ taskDir, workdir: fixDir, timeoutMs });
    if (!after.pass) return { ok: false, reason: 'check fails on the fix' };
    task.validated = { pre_fails: true, fix_passes: true };
    fs.writeFileSync(path.join(taskDir, 'task.json'), `${JSON.stringify(task, null, 2)}\n`);
    const dest = path.join(outDir, task_id);
    fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    fs.cpSync(taskDir, dest, { recursive: true });
    return { ok: true, task: { task_id, version: fingerprintDir(dest), merged_at: cand.merged_at } };
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

// harvest({ source, cutoff, checkArgv, outDir }) -> { accepted: [...], rejected: [{ref, reason}] }
function harvest({ source, cutoff, checkArgv = ['node', '--test', '{tests}'], outDir, timeoutMs }) {
  if (!cutoff || Number.isNaN(Date.parse(cutoff))) throw new Error('harvest: cutoff must be an ISO date');
  const denylist = loadDenylist();
  const accepted = [];
  const rejected = [];
  for (const cand of source.list(cutoff)) {
    const r = validate(cand, { source, cutoff, checkArgv, outDir, denylist, timeoutMs });
    if (r.ok) accepted.push(r.task); else rejected.push({ ref: cand.ref, reason: r.reason });
  }
  return { accepted, rejected };
}

module.exports = { harvest, localSource, githubSource, validate, taskIdFor, loadDenylist, TEST_FILE };

if (require.main === module) {
  const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
  if (!args.cutoff || !(args.repo || args.local)) {
    console.error('usage: node tasks/harvester.cjs --cutoff=YYYY-MM-DD (--repo=owner/name | --local=path) [--out=dir] [--check="node --test {tests}"]');
    process.exit(2);
  }
  const store = require('./store.cjs');
  const root = store.storeRoot();
  const source = args.repo ? githubSource({ repo: args.repo, cacheDir: path.join(root, '.cache') }) : localSource({ repoPath: args.local });
  const outDir = args.out || path.join(root, 'candidates');
  const r = harvest({ source, cutoff: args.cutoff, outDir, checkArgv: args.check ? args.check.split(' ') : undefined });
  console.log(JSON.stringify({ accepted: r.accepted.length, rejected: r.rejected, outDir }, null, 2));
}
