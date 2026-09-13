#!/usr/bin/env node
'use strict';
// Marker job runner. Usage:
//   node markers/run.cjs feeds [--store <file>] [--since-days 30]   read the official feeds and append new markers
//   node markers/run.cjs validate [--store <file>]                   check every stored marker (N-12)
// Project events (frozen moves, rotations, retirements, lab statements) are appended by the tools that
// make those events, through markers/jobs/project-events.cjs and markers/lib/store.cjs.
const store = require('./lib/store.cjs');
const { validateMarker } = require('./lib/types.cjs');

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : dflt;
}

async function main() {
  const cmd = process.argv[2];
  const file = arg('--store', store.DEFAULT_STORE);
  if (cmd === 'validate') {
    const bad = store.load(file).map((m) => [m.id, validateMarker(m)]).filter(([, e]) => e.length);
    for (const [id, e] of bad) console.error(`${id}: ${e.join('; ')}`);
    console.log(bad.length ? `${bad.length} invalid marker(s)` : 'all markers valid');
    return bad.length ? 1 : 0;
  }
  if (cmd === 'feeds') {
    const since = Date.now() - Number(arg('--since-days', '30')) * 86400e3;
    let failed = 0;
    for (const [name, job] of [['app releases', require('./jobs/app-releases.cjs')], ['model releases', require('./jobs/model-releases.cjs')], ['status incidents', require('./jobs/status.cjs')]]) {
      const r = await job.run({ since });
      const added = store.append(r.markers, file);
      console.log(`${name}: ${r.markers.length} read, ${added.length} new`);
      for (const [k, v] of Object.entries(r.errors || {})) { failed++; console.error(`  ${k}: ERROR ${v}`); }
      for (const [k, v] of Object.entries(r.gaps || {})) console.error(`  ${k}: no feed: ${v}`);
    }
    return failed ? 1 : 0;
  }
  console.error('usage: node markers/run.cjs feeds|validate [--store <file>]');
  return 2;
}

main().then((c) => process.exit(c), (e) => { console.error(e.stack || e.message); process.exit(1); });
