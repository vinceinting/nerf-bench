'use strict';
// Automatic grading, pass or fail only (R-14). No model or AI grader, no network:
// a task passes when its check command exits 0 in the working copy the agent left,
// after the task's hidden check files are laid over it. Nothing here opens a socket.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

function copyTree(src, dst) {
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);
    if (ent.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyTree(s, d); }
    else if (ent.isFile()) { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(s, d); }
  }
}

function readTask(taskDir) {
  const task = JSON.parse(fs.readFileSync(path.join(taskDir, 'task.json'), 'utf8'));
  if (!task.check || !Array.isArray(task.check.argv) || task.check.argv.length === 0) {
    throw new Error(`task ${task.task_id}: check.argv missing`);
  }
  return task;
}

// Runs one task's check. Returns { task_id, pass, exit_code, timed_out, duration_s }.
function gradeTask({ taskDir, workdir, timeoutMs = DEFAULT_TIMEOUT_MS, env = process.env }) {
  const task = readTask(taskDir);
  const overlay = path.join(taskDir, 'check');
  if (fs.existsSync(overlay)) copyTree(overlay, workdir);
  const argv = task.check.argv.map((a) => (a === 'node' ? process.execPath : a));
  const t0 = Date.now();
  // A parent Node test runner leaks NODE_TEST_CONTEXT, which makes a child `node --test` report
  // to it instead of exiting non-zero on failure. The check must see a clean environment.
  const childEnv = { ...env };
  delete childEnv.NODE_TEST_CONTEXT;
  const r = spawnSync(argv[0], argv.slice(1), {
    cwd: workdir, env: childEnv, timeout: timeoutMs, shell: task.check.shell === true, encoding: 'utf8', windowsHide: true,
  });
  const timedOut = r.error && r.error.code === 'ETIMEDOUT';
  if (r.error && !timedOut) throw new Error(`task ${task.task_id}: check could not start: ${r.error.message}`);
  return {
    task_id: task.task_id,
    pass: !timedOut && r.status === 0,
    exit_code: r.status,
    timed_out: Boolean(timedOut),
    duration_s: (Date.now() - t0) / 1000,
    output_tail: `${r.stdout || ''}${r.stderr || ''}`.slice(-2000),
  };
}

// Recount from per-task pass flags, the same arithmetic the standalone verifier repeats.
function totals(taskResults) {
  const passed = taskResults.filter((t) => t.pass === true).length;
  return { passed, total: taskResults.length };
}

module.exports = { gradeTask, totals, readTask, copyTree };

if (require.main === module) {
  const [taskDir, workdir] = process.argv.slice(2);
  if (!taskDir || !workdir) { console.error('usage: node scoring/grade.cjs <taskDir> <workdir>'); process.exit(2); }
  const r = gradeTask({ taskDir, workdir });
  console.log(JSON.stringify({ task_id: r.task_id, pass: r.pass, exit_code: r.exit_code, timed_out: r.timed_out }));
  process.exit(r.pass ? 0 : 1);
}
