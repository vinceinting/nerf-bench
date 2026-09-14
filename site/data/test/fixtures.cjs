'use strict';
// Synthetic fixture records and task sets. Synthetic ids only (Amendment 3): never a benchmark task.
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `nb-${p}-`));

// A task set whose check passes when the transcript contains the line "FIXED".
function makeSet(dir, setId, taskIds) {
  for (const t of taskIds) {
    const d = path.join(dir, t);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'task.json'), JSON.stringify({ id: t, set: setId, prompt: `synthetic fixture task ${t}` }) + '\n');
    fs.writeFileSync(path.join(d, 'check.cjs'), "const t=require('fs').readFileSync(process.argv[2],'utf8');process.exit(/\\bFIXED\\b/.test(t)?0:1);\n");
  }
}

// Builds a schema-shaped record plus its transcripts. passes: array of booleans, one per task.
function makeRun({ runId = '1000-1', setId = 'fixture-set-a', passes = [true, false, true], app = 'codex-cli', model = 'fixture-model', effort = 'medium', access = 'subscription', track = 'latest', startedAt = '2026-09-01T10:00:00Z', source = 'self-paid', transcriptsDir = null, taskPrefix = 'ft' } = {}) {
  const tasks = passes.map((p, i) => {
    const text = JSON.stringify({ run: runId, task: `${taskPrefix}-${i}`, answer: p ? 'FIXED' : 'gave up' }) + '\n';
    if (transcriptsDir) {
      fs.mkdirSync(path.join(transcriptsDir, runId), { recursive: true });
      fs.writeFileSync(path.join(transcriptsDir, runId, `${taskPrefix}-${i}.jsonl`), text);
    }
    return { task_id: `${taskPrefix}-${i}`, set_id: setId, pass: p, tokens_in: 100, tokens_out: 50, tool_calls: 3, duration_s: 12, transcript_sha256: sha(text) };
  });
  return {
    schema_version: 1,
    run_id: runId,
    started_at: startedAt,
    ended_at: new Date(Date.parse(startedAt) + 3600e3).toISOString(),
    app: { id: app, version: '1.0.0', installer: 'npm i -g fixture', track },
    model, effort, effort_is_default: effort === 'medium',
    access_path: access, account_source: source, contributor: 'fixture-user', floor: false,
    machine: { hosted: true, os: 'linux', image: 'ubuntu-24.04' },
    fingerprint: { value: 'sha256:' + '0'.repeat(64), paths: [] },
    deviations: ['commands auto-approved', 'web access blocked'],
    task_sets: [{ id: setId, version: '1', fingerprint: 'sha256:' + '1'.repeat(64) }],
    tasks,
    totals: { passed: passes.filter(Boolean).length, total: passes.length, tokens_in: 100 * passes.length, tokens_out: 50 * passes.length, cost_usd: null, tool_calls: 3 * passes.length, duration_s: 12 * passes.length },
    workflow: { repository: 'vinceinting/nerf-bench', path: '.github/workflows/run.yml', commit: 'a'.repeat(40), caller_repository: 'fixture-user/nerf-bench' },
    scorer_commit: 'b'.repeat(40),
  };
}

module.exports = { makeSet, makeRun, tmp, sha };
