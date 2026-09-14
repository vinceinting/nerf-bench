'use strict';
// Append-only marker store: one JSON object per line. Lines already written are never rewritten or removed.
const fs = require('fs');
const path = require('path');
const { validateMarker } = require('./types.cjs');

const DEFAULT_STORE = path.join(__dirname, '..', 'store', 'markers.jsonl');

function load(file = DEFAULT_STORE) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l, i) => {
    try { return JSON.parse(l); } catch { throw new Error(`${file}: line ${i + 1} is not JSON`); }
  });
}

// Appends markers not already present. A marker whose id exists with different content is an error:
// published markers are never edited.
function append(markers, file = DEFAULT_STORE) {
  const existing = new Map(load(file).map((m) => [m.id, JSON.stringify(m)]));
  const added = [];
  for (const m of markers) {
    const errs = validateMarker(m);
    if (errs.length) throw new Error(`marker ${m && m.id}: ${errs.join('; ')}`);
    const s = JSON.stringify(m);
    if (existing.has(m.id)) {
      if (existing.get(m.id) !== s) throw new Error(`marker ${m.id} already published with different content; markers are never edited`);
      continue;
    }
    existing.set(m.id, s);
    added.push(m);
  }
  if (added.length) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.appendFileSync(file, added.map((m) => JSON.stringify(m) + '\n').join(''));
  }
  return added;
}

module.exports = { load, append, DEFAULT_STORE };
