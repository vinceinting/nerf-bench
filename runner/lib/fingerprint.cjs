// Config-location fingerprint (R-07). Taken at run start, after install and before sign-in.
// Canonical form: for each location in the app's list (sorted), every file under it sorted by
// relative path contributes "<location>/<rel>\n<sha256 of bytes>\n"; a missing location contributes
// "<location>\nabsent\n". Locations are written with ~ for the home directory and . for the task
// workspace, so a fresh install on any runner of the same app version yields the same value.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

// Credential files are written by sign-in, after the fingerprint; they are excluded so a later
// re-fingerprint (verification) does not trip on them. Nothing else is excluded.
const EXCLUDE = [/(^|\/)\.credentials\.json$/, /(^|\/)auth\.json$/, /(^|\/)auth\.json\.lock$/];

function expand(loc, home, workspace) {
  if (loc === '~' || loc.startsWith('~/')) return path.join(home, loc.slice(2));
  if (loc === '.' || loc.startsWith('./')) return path.join(workspace, loc.slice(2));
  return loc;
}

function walk(abs, rel, out) {
  const st = fs.lstatSync(abs);
  if (st.isDirectory()) {
    for (const n of fs.readdirSync(abs).sort()) walk(path.join(abs, n), rel ? `${rel}/${n}` : n, out);
  } else if (st.isSymbolicLink()) {
    out.push([rel, `link:${fs.readlinkSync(abs)}`]);
  } else {
    out.push([rel, sha(fs.readFileSync(abs))]);
  }
}

function compute(locations, { home, workspace }) {
  let canon = '';
  const paths = [...locations].sort();
  for (const loc of paths) {
    const abs = expand(loc, home, workspace);
    if (!fs.existsSync(abs)) { canon += `${loc}\nabsent\n`; continue; }
    const entries = [];
    walk(abs, '', entries);
    for (const [rel, h] of entries) {
      const full = rel ? `${loc}/${rel}` : loc;
      if (EXCLUDE.some((re) => re.test(full))) continue;
      canon += `${full}\n${h}\n`;
    }
  }
  return { value: `sha256:${sha(canon)}`, paths, canonical: canon };
}

// Compare a record's fingerprint with the published fresh-install value for its app version.
function compare(record, published) {
  const key = `${record.app.id}@${record.app.version}`;
  const want = published[key];
  if (!want) return { ok: false, reason: `no published fresh-install fingerprint for ${key}` };
  if (want.value !== record.fingerprint.value) return { ok: false, reason: `fingerprint mismatch for ${key}: run ${record.fingerprint.value}, fresh install ${want.value}` };
  return { ok: true, reason: `matches fresh install of ${key}` };
}

module.exports = { compute, compare, expand };
