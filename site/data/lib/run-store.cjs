'use strict';
// Append-only store of accepted run records (N-09, data side). Each record is kept as the exact bytes
// accepted, named by their sha256. There is no update and no delete: this module exports neither.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function seriesKey(rec) {
  return [rec.app.id, rec.model, rec.effort, rec.access_path, rec.app.track].join('|');
}

function accept(storeDir, bytes) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const rec = JSON.parse(buf.toString('utf8'));
  for (const k of ['run_id', 'started_at', 'app', 'model', 'effort', 'access_path', 'tasks', 'totals', 'task_sets']) {
    if (rec[k] === undefined) throw new Error(`record lacks ${k}`);
  }
  const sha = sha256(buf);
  const dir = path.join(storeDir, 'runs');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${sha}.json`);
  if (fs.existsSync(file)) return { sha, added: false };
  fs.writeFileSync(file, buf, { flag: 'wx' });
  fs.appendFileSync(path.join(storeDir, 'accepted.jsonl'), JSON.stringify({ sha, run_id: rec.run_id }) + '\n');
  return { sha, added: true };
}

function list(storeDir) {
  const dir = path.join(storeDir, 'runs');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const bytes = fs.readFileSync(path.join(dir, f));
    const sha = f.slice(0, -5);
    if (sha256(bytes) !== sha) throw new Error(`stored run ${f} no longer matches its hash; published bytes were altered`);
    return { sha, bytes, record: JSON.parse(bytes.toString('utf8')) };
  });
}

module.exports = { accept, list, seriesKey, sha256 };
