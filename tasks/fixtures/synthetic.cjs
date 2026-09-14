'use strict';
// FIXTURE ONLY. Synthetic repositories and stores for tests and prd-cells. Nothing here is a
// benchmark task; ids start with "fx-" and every file says so. Real sets live in the private store.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function git(dir, args, at) {
  const env = { ...process.env, GIT_AUTHOR_DATE: at, GIT_COMMITTER_DATE: at };
  return execFileSync('git', ['-C', dir, '-c', 'user.name=fixture', '-c', 'user.email=fixture@nerf-bench.invalid', '-c', 'core.autocrlf=false', ...args], { encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] });
}

function write(dir, rel, text) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
}

// A local git repo with four "fix" commits around cutoff 2026-03-01:
//   fix A (2026-02-10): real fix, but merged BEFORE the cutoff -> must be rejected
//   fix B (2026-04-02): real fix after cutoff -> accepted
//   fix C (2026-04-09): its test already passes on the pre-fix code -> rejected
//   fix D (2026-05-01): real fix after cutoff -> accepted
//   fix E (2026-05-03): changes only a test file -> rejected
function makeFixtureRepo(dir) {
  fs.mkdirSync(dir, { recursive: true });
  git(dir, ['init', '--quiet'], '2026-01-01T00:00:00Z');
  write(dir, 'README.md', 'FIXTURE ONLY: synthetic repository for harvester tests.\n');
  write(dir, 'src/add.js', 'module.exports = (a, b) => a - b;\n');
  write(dir, 'src/clamp.js', 'module.exports = (x, lo, hi) => Math.min(x, hi);\n');
  write(dir, 'src/pad.js', "module.exports = (s, n) => s.padEnd(n, ' ');\n");
  write(dir, 'src/sub.js', 'module.exports = (a, b) => a + b;\n');
  git(dir, ['add', '.'], '2026-01-01T00:00:00Z');
  git(dir, ['commit', '--quiet', '-m', 'initial'], '2026-01-01T00:00:00Z');
  const step = (at, subject, files) => {
    for (const [rel, text] of Object.entries(files)) write(dir, rel, text);
    git(dir, ['add', '.'], at);
    git(dir, ['commit', '--quiet', '-m', subject], at);
  };
  const t = (mod, expr) => `const test = require('node:test');\nconst assert = require('node:assert');\nconst f = require('../src/${mod}.js');\ntest('${mod}', () => { ${expr} });\n`;
  step('2026-02-10T12:00:00Z', 'fix: sub subtracts', { 'src/sub.js': 'module.exports = (a, b) => a - b;\n', 'test/sub.test.js': t('sub', 'assert.strictEqual(f(5, 3), 2);') });
  step('2026-04-02T12:00:00Z', 'fix: add adds', { 'src/add.js': 'module.exports = (a, b) => a + b;\n', 'test/add.test.js': t('add', 'assert.strictEqual(f(2, 3), 5);') });
  step('2026-04-09T12:00:00Z', 'fix: pad pads left', { 'src/pad.js': "module.exports = (s, n) => s.padStart(n, ' ');\n", 'test/pad.test.js': t('pad', "assert.strictEqual(f('ab', 2), 'ab');") });
  step('2026-05-01T12:00:00Z', 'fix: clamp respects the lower bound', { 'src/clamp.js': 'module.exports = (x, lo, hi) => Math.max(lo, Math.min(x, hi));\n', 'test/clamp.test.js': t('clamp', 'assert.strictEqual(f(-5, 0, 10), 0);') });
  step('2026-05-03T12:00:00Z', 'fix: tidy test only', { 'test/add.test.js': t('add', 'assert.strictEqual(f(1, 1), 2);') });
  return { dir, cutoff: '2026-03-01T00:00:00Z', expectAccepted: ['fix: add adds', 'fix: clamp respects the lower bound'] };
}

// Writes n synthetic candidates straight into a store's candidates/ directory.
function makeCandidates(storeRoot, n, { prefix = 'fx', mergedFrom = '2026-06-01T00:00:00Z' } = {}) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const task_id = `${prefix}-${String(i).padStart(3, '0')}`;
    const dir = path.join(storeRoot, 'candidates', task_id);
    const merged = new Date(Date.parse(mergedFrom) + i * 3600000).toISOString();
    write(dir, 'task.json', `${JSON.stringify({ task_id, fixture: true, source: { repo: 'fixture/synthetic', fix_commit: '0'.repeat(40), pre_commit: '0'.repeat(40), merged_at: merged }, prompt: `FIXTURE ONLY ${task_id}`, check: { argv: ['node', 'ok.js'] } }, null, 2)}\n`);
    write(dir, 'check/ok.js', `// FIXTURE ONLY\nprocess.exit(require('fs').existsSync('solved.txt') ? 0 : 1);\n`);
    out.push({ task_id });
  }
  return out;
}

module.exports = { makeFixtureRepo, makeCandidates };
