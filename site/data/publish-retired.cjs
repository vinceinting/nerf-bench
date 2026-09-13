#!/usr/bin/env node
'use strict';
// Publishes a retired task set in full with every past answer to it (R-17, R-58, D-41).
//   node site/data/publish-retired.cjs --set <id> --retired-at <iso> --tasks <dir> --store <dir> --transcripts <dir> --out <dir>
// --tasks: the set's files as tasks/ holds them. --transcripts: privately held <run_id>/<task_id>.jsonl.
// Writes <out>/retired/<set>/tasks/**, <out>/retired/<set>/transcripts/<run_id>/<task_id>.jsonl and manifest.json.
// Refuses a set that has not retired yet (N-03). Never overwrites or removes a published file.
const fs = require('fs');
const path = require('path');
const runStore = require('./lib/run-store.cjs');

function walk(dir, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const p = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(dir, p)); else out.push(p);
  }
  return out.sort();
}

function publishOnce(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) {
    if (!fs.readFileSync(file).equals(bytes)) throw new Error(`${file} is already published with different bytes; published files are never edited`);
    return false;
  }
  fs.writeFileSync(file, bytes, { flag: 'wx' });
  return true;
}

function publishRetired({ setId, retiredAt, tasksDir, storeDir, transcriptsDir, outDir, now = Date.now() }) {
  if (!retiredAt || Date.parse(retiredAt) > now) throw new Error(`set ${setId} has not retired (retired_at ${retiredAt}); current tasks are never published`);
  const root = path.join(outDir, 'retired', setId);
  const tasks = walk(tasksDir);
  for (const f of tasks) publishOnce(path.join(root, 'tasks', f), fs.readFileSync(path.join(tasksDir, f)));

  const transcripts = [];
  for (const { record } of runStore.list(storeDir)) {
    if (!record.task_sets.some((s) => s.id === setId)) continue;
    for (const t of record.tasks.filter((x) => x.set_id === setId)) {
      const src = path.join(transcriptsDir, record.run_id, `${t.task_id}.jsonl`);
      if (!fs.existsSync(src)) throw new Error(`transcript missing for run ${record.run_id} task ${t.task_id}; retirement publishes every answer`);
      const bytes = fs.readFileSync(src);
      if (runStore.sha256(bytes) !== t.transcript_sha256) throw new Error(`transcript for run ${record.run_id} task ${t.task_id} does not match the attested transcript_sha256`);
      const rel = `transcripts/${record.run_id}/${t.task_id}.jsonl`;
      publishOnce(path.join(root, rel), bytes);
      transcripts.push({ run_id: record.run_id, task_id: t.task_id, file: rel, sha256: t.transcript_sha256 });
    }
  }
  const manifest = { set_id: setId, retired_at: new Date(retiredAt).toISOString(), tasks: tasks.map((f) => `tasks/${f}`), transcripts };
  const mf = path.join(root, 'manifest.json');
  const body = JSON.stringify(manifest, null, 2) + '\n';
  if (fs.existsSync(mf)) {
    const prev = JSON.parse(fs.readFileSync(mf, 'utf8'));
    const lost = prev.transcripts.filter((p) => !transcripts.some((q) => q.file === p.file));
    if (lost.length) throw new Error(`republishing would drop ${lost.length} published transcript(s); published files stay public`);
  }
  fs.writeFileSync(mf, body);
  return manifest;
}

module.exports = { publishRetired };

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const m = publishRetired({ setId: arg('--set'), retiredAt: arg('--retired-at'), tasksDir: arg('--tasks'), storeDir: arg('--store'), transcriptsDir: arg('--transcripts'), outDir: arg('--out') });
  console.log(`published set ${m.set_id}: ${m.tasks.length} task file(s), ${m.transcripts.length} transcript(s)`);
}
