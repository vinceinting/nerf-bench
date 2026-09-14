// Reads REAL run artifacts for the PRD cells. A run counts only if its result.json passes
// `gh attestation verify` against the official reusable workflow on a GitHub-hosted runner, so no
// local fixture can ever satisfy a cell that needs a real run.
//
// Source: the artifacts of recent runs of the caller workflow in NB_RUNS_REPO (default the official
// repository, where the floor's caller lives), downloaded with the gh CLI; or NB_REAL_RUNS_DIR,
// a directory of already downloaded run folders (each holding result.json and run.log). Either way
// every result is attestation-verified before use.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const OFFICIAL = 'vinceinting/nerf-bench';
const SIGNER = `${OFFICIAL}/.github/workflows/run.yml`;

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function verifyAttestation(file) {
  try {
    const out = gh(['attestation', 'verify', file, '--repo', OFFICIAL, '--signer-workflow', SIGNER, '--deny-self-hosted-runners', '--format', 'json']);
    const j = JSON.parse(out);
    const cert = j[0] && j[0].verificationResult && j[0].verificationResult.signature && j[0].verificationResult.signature.certificate;
    return { ok: true, cert: cert || {} };
  } catch (e) {
    return { ok: false, reason: String(e.stderr || e.message).trim().split('\n').slice(-2).join(' ') };
  }
}

function downloadRecent() {
  const repo = process.env.NB_RUNS_REPO || OFFICIAL;
  const wf = process.env.NB_RUNS_WORKFLOW || 'nerf-bench-run.yml';
  const list = JSON.parse(gh(['run', 'list', '-R', repo, '--workflow', wf, '--status', 'success', '--json', 'databaseId', '-L', '30']));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nb-real-'));
  for (const r of list) {
    const d = path.join(root, String(r.databaseId));
    try { gh(['run', 'download', String(r.databaseId), '-R', repo, '-n', 'nerf-bench-run', '-D', d]); } catch { /* run without the artifact */ }
  }
  return root;
}

// All verified real runs, newest first. Throws with a plain reason when none can be read.
function all() {
  let root = process.env.NB_REAL_RUNS_DIR;
  if (!root) {
    try { root = downloadRecent(); } catch (e) { throw new Error(`could not list real runs with gh: ${String(e.stderr || e.message).trim().split('\n')[0]}`); }
  }
  const runs = [];
  const rejected = [];
  for (const n of fs.existsSync(root) ? fs.readdirSync(root) : []) {
    const dir = path.join(root, n);
    const rf = path.join(dir, 'result.json');
    if (!fs.existsSync(rf)) continue;
    const v = verifyAttestation(rf);
    if (!v.ok) { rejected.push(`${n}: ${v.reason}`); continue; }
    const record = JSON.parse(fs.readFileSync(rf, 'utf8'));
    const log = fs.existsSync(path.join(dir, 'run.log')) ? fs.readFileSync(path.join(dir, 'run.log'), 'utf8') : '';
    const inv = fs.existsSync(path.join(dir, 'inventory.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8')) : null;
    runs.push({ dir, record, log, inventory: inv, cert: v.cert });
  }
  runs.sort((a, b) => Date.parse(b.record.started_at) - Date.parse(a.record.started_at));
  return { runs, rejected, root };
}

function latest(pred) {
  const { runs, rejected, root } = all();
  const hit = runs.find((r) => pred(r.record, r));
  if (!hit) throw new Error(`no attestation-verified real run matches (read ${runs.length} verified, ${rejected.length} rejected, from ${root})${rejected.length ? `; first rejection: ${rejected[0]}` : ''}`);
  return hit;
}

module.exports = { all, latest, verifyAttestation, OFFICIAL, SIGNER };
