'use strict';
// Task-set fingerprint, exactly as schema/run-record.md defines it:
// "sha256:" plus the hex sha256 of the set's canonical form: the set's task files
// sorted by path, each contributing "path\n<sha256 of bytes>\n", concatenated.
// Paths are relative to the set directory, forward slashes, sorted by code unit.
// Anyone can recompute it from a retired set's published files: node tasks/fingerprint.cjs <setDir>
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function listFiles(dir, base = dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) listFiles(full, base, out);
    else if (ent.isFile()) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

// entries: [{ path, bytes }] with relative forward-slash paths.
function fingerprintEntries(entries) {
  const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  let canon = '';
  for (const e of sorted) canon += `${e.path}\n${sha256(e.bytes)}\n`;
  return `sha256:${sha256(Buffer.from(canon, 'utf8'))}`;
}

function fingerprintDir(dir) {
  const entries = listFiles(dir).map((p) => ({ path: p, bytes: fs.readFileSync(path.join(dir, p)) }));
  if (entries.length === 0) throw new Error(`fingerprint: no files under ${dir}`);
  return fingerprintEntries(entries);
}

module.exports = { fingerprintEntries, fingerprintDir, listFiles, sha256 };

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node tasks/fingerprint.cjs <setDir>'); process.exit(2); }
  console.log(fingerprintDir(dir));
}
