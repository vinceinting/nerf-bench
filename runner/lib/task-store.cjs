// Task store client (runner half of R-68, N-15). At run start the runner asks the one private store
// what it serves for the run's model and fetches those sets. The store authenticates the caller by
// the job's GitHub OIDC token, whose job_workflow_ref claim names the official reusable workflow, so
// a contributor's copy never holds a store credential.
//
// Store response: { model, served_at, sets: [{ id, version, status: "active"|"overlap",
//   fingerprint: "sha256:<hex>", files: [{ path, content_b64 }] }] }
// Set fingerprint: schema/run-record.md "Task set identity" (files sorted by path, each
// "path\n<sha256 of bytes>\n", sha256 of the concatenation).
// Task layout inside a set: <task_id>/task.json { id, prompt, check: { command } } plus
// <task_id>/repo/** as the starting workspace.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

function setFingerprint(files) {
  const canon = [...files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((f) => `${f.path}\n${sha(Buffer.from(f.content_b64, 'base64'))}\n`).join('');
  return `sha256:${sha(canon)}`;
}

async function oidcToken(audience) {
  const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const tok = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !tok) throw new Error('no GitHub OIDC token available (the job needs permissions: id-token: write)');
  const r = await fetch(`${url}&audience=${encodeURIComponent(audience)}`, { headers: { Authorization: `Bearer ${tok}` } });
  if (!r.ok) throw new Error(`OIDC token request failed: HTTP ${r.status}`);
  return (await r.json()).value;
}

async function fetchServed(storeUrl, model, { audience } = {}) {
  if (!storeUrl) throw new Error('no task store configured (runner/task-store.json url is null); no run can start without the official store');
  const u = new URL(storeUrl);
  let body;
  if (u.protocol === 'file:') {
    body = JSON.parse(fs.readFileSync(path.join(decodeURIComponent(u.pathname.replace(/^\/([A-Za-z]:)/, '$1')), `${model}.json`), 'utf8'));
  } else {
    const token = await oidcToken(audience || 'nerf-bench-task-store');
    const r = await fetch(`${storeUrl.replace(/\/$/, '')}/v1/served?model=${encodeURIComponent(model)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`task store refused: HTTP ${r.status}`);
    body = await r.json();
  }
  if (body.model !== model) throw new Error(`task store answered for model ${body.model}, asked for ${model}`);
  for (const s of body.sets) {
    const got = setFingerprint(s.files);
    if (got !== s.fingerprint) throw new Error(`set ${s.id}@${s.version}: served fingerprint ${s.fingerprint} does not match its files (${got})`);
  }
  return body;
}

// N-15: a caller may narrow to one served set by id; naming anything else is refused before any task runs.
function choose(served, requested) {
  if (!served.sets.length) throw new Error(`the store serves no set for model ${served.model}`);
  if (!requested) return served.sets;
  const hit = served.sets.filter((s) => s.id === requested || `${s.id}@${s.version}` === requested);
  if (!hit.length) throw new Error(`task set "${requested}" is not served by the official store for model ${served.model}; refused before any task ran`);
  return hit;
}

function materialize(set, dir) {
  const tasks = new Map();
  for (const f of set.files) {
    const out = path.join(dir, set.id, f.path);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, Buffer.from(f.content_b64, 'base64'));
    const m = f.path.match(/^([^/]+)\/task\.json$/);
    if (m) tasks.set(m[1], path.join(dir, set.id, m[1]));
  }
  return [...tasks.entries()].sort().map(([id, root]) => ({ id, root, def: JSON.parse(fs.readFileSync(path.join(root, 'task.json'), 'utf8')) }));
}

module.exports = { fetchServed, choose, materialize, setFingerprint };
