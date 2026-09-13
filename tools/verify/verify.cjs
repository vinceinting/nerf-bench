#!/usr/bin/env node
'use strict';
// Standalone verifier (R-57 as amended by Amendment 4). It never contacts the nerf-bench site: the only
// network use is `gh attestation verify`, which talks to GitHub and Sigstore.
//
//   node tools/verify/verify.cjs <result.json> [--retired <published retired dir>] [--bundle <file>] [--json]
//
// 1. signature: gh attestation verify, pinned to the official reusable workflow at the recorded commit,
//    GitHub-hosted runners only.
// 2. recount: the score recomputed from the attested per-task pass flags must equal the published totals.
// 3. regrade: only when every task set in the run has retired and been published (--retired points at
//    <out>/retired from site/data/publish-retired.cjs). Every answer is regraded against the public check.
// The output always states which of recount-only or full regrade was performed.
// Exit 0 only when every check performed passed.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const OFFICIAL_REPO = 'vinceinting/nerf-bench';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function checkShape(r) {
  const errs = [];
  for (const k of ['run_id', 'app', 'model', 'tasks', 'totals', 'task_sets', 'workflow']) if (r[k] === undefined) errs.push(`missing ${k}`);
  if (r.workflow) {
    if (r.workflow.repository !== OFFICIAL_REPO) errs.push(`workflow.repository is ${r.workflow.repository}, not ${OFFICIAL_REPO}`);
    if (!/^[0-9a-f]{40}$/.test(r.workflow.commit || '')) errs.push('workflow.commit is not a 40-hex sha');
    if (!r.workflow.path) errs.push('workflow.path missing');
  }
  return errs;
}

function verifySignature(file, rec, { gh = process.env.NERF_VERIFY_GH || 'gh', bundle } = {}) {
  const args = ['attestation', 'verify', file,
    '--repo', rec.workflow.caller_repository || OFFICIAL_REPO,
    '--signer-workflow', `${OFFICIAL_REPO}/${rec.workflow.path}`,
    '--signer-digest', rec.workflow.commit,
    '--deny-self-hosted-runners',
    '--format', 'json'];
  if (bundle) args.push('--bundle', bundle);
  const isScript = /\.c?js$/.test(gh);
  const r = spawnSync(isScript ? process.execPath : gh, isScript ? [gh, ...args] : args, { encoding: 'utf8', timeout: 120000 });
  if (r.error) return { ok: false, detail: `could not run ${gh}: ${r.error.message}` };
  if (r.status !== 0) return { ok: false, detail: (r.stderr || r.stdout || '').trim().split('\n').slice(-3).join(' | ') || `gh exited ${r.status}` };
  return { ok: true, detail: `gh attestation verify accepted: signer ${OFFICIAL_REPO}/${rec.workflow.path} at ${rec.workflow.commit}, GitHub-hosted runner` };
}

function recount(rec) {
  const passed = rec.tasks.filter((t) => t.pass === true).length;
  const total = rec.tasks.length;
  const ok = passed === rec.totals.passed && total === rec.totals.total;
  return { ok, passed, total, detail: `recounted ${passed}/${total} from attested per-task flags; published ${rec.totals.passed}/${rec.totals.total}` };
}

// Grader: W-B's scoring/ when present (gradeAnswer({ taskDir, transcriptPath }) -> { pass }),
// otherwise the published task's own check: node <taskDir>/check.cjs <transcript>, exit 0 = pass.
function loadGrader() {
  const p = path.join(__dirname, '..', '..', 'scoring', 'index.cjs');
  if (fs.existsSync(p)) {
    const s = require(p);
    if (typeof s.gradeAnswer === 'function') return { name: 'scoring/index.cjs', grade: (a) => !!s.gradeAnswer(a).pass };
  }
  return {
    name: 'published task check.cjs',
    grade: ({ taskDir, transcriptPath }) => {
      const chk = path.join(taskDir, 'check.cjs');
      if (!fs.existsSync(chk)) throw new Error(`no public check at ${chk}`);
      const r = spawnSync(process.execPath, [chk, transcriptPath], { timeout: 300000 });
      if (r.error) throw r.error;
      return r.status === 0;
    },
  };
}

function regrade(rec, retiredDir) {
  const notRetired = rec.task_sets.filter((s) => !fs.existsSync(path.join(retiredDir || '', s.id, 'manifest.json')) || !retiredDir);
  if (notRetired.length) return { performed: false, detail: `full regrading not performed: task set ${notRetired.map((s) => s.id).join(', ')} is current; full regrading follows its retirement` };
  const grader = loadGrader();
  const mismatches = [];
  let passed = 0;
  for (const t of rec.tasks) {
    const root = path.join(retiredDir, t.set_id);
    const tp = path.join(root, 'transcripts', rec.run_id, `${t.task_id}.jsonl`);
    if (!fs.existsSync(tp)) { mismatches.push(`${t.task_id}: transcript not published`); continue; }
    if (sha256(fs.readFileSync(tp)) !== t.transcript_sha256) { mismatches.push(`${t.task_id}: transcript does not match attested hash`); continue; }
    let pass;
    try { pass = grader.grade({ taskDir: path.join(root, 'tasks', t.task_id), transcriptPath: tp }); } catch (e) { mismatches.push(`${t.task_id}: ${e.message}`); continue; }
    if (pass) passed++;
    if (pass !== t.pass) mismatches.push(`${t.task_id}: regraded ${pass ? 'pass' : 'fail'}, attested ${t.pass ? 'pass' : 'fail'}`);
  }
  const ok = mismatches.length === 0 && passed === rec.totals.passed;
  return { performed: true, ok, passed, detail: `full regrade performed with ${grader.name}: ${passed}/${rec.tasks.length}${mismatches.length ? '; mismatches: ' + mismatches.join('; ') : ''}` };
}

function verify(file, { retired, bundle, gh } = {}) {
  const rec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const report = { file: path.resolve(file), run_id: rec.run_id, checks: {} };
  const shape = checkShape(rec);
  report.checks.shape = { ok: shape.length === 0, detail: shape.join('; ') || 'record fields present' };
  if (shape.length) { report.ok = false; report.mode = 'none'; return report; }
  report.checks.signature = verifySignature(file, rec, { bundle, gh });
  report.checks.recount = recount(rec);
  const rg = regrade(rec, retired);
  report.checks.regrade = rg;
  report.mode = rg.performed ? 'signature + recount + full regrade' : 'signature + recount (regrading follows retirement)';
  report.ok = report.checks.signature.ok && report.checks.recount.ok && (!rg.performed || rg.ok);
  return report;
}

module.exports = { verify, recount, regrade, checkShape };

if (require.main === module) {
  const a = process.argv.slice(2);
  const opt = (n) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
  const file = a.find((x, i) => !x.startsWith('--') && !['--retired', '--bundle'].includes(a[i - 1]));
  if (!file) { console.error('usage: node tools/verify/verify.cjs <result.json> [--retired <dir>] [--bundle <file>] [--json]'); process.exit(2); }
  const rep = verify(file, { retired: opt('--retired'), bundle: opt('--bundle') });
  if (a.includes('--json')) console.log(JSON.stringify(rep, null, 2));
  else {
    console.log(`run ${rep.run_id}: ${rep.ok ? 'VERIFIED' : 'NOT VERIFIED'}`);
    console.log(`performed: ${rep.mode}`);
    for (const [k, v] of Object.entries(rep.checks)) console.log(`  ${k}: ${v.performed === false ? 'skipped' : v.ok ? 'ok' : 'FAILED'}: ${v.detail}`);
  }
  process.exit(rep.ok ? 0 : 1);
}
