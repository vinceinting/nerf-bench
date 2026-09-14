#!/usr/bin/env node
'use strict';
// Static data builder: accepted run records + marker store -> per-series JSON the site reads.
//   node site/data/build.cjs --store <dir> --out <dir> [--markers <file>] [--releases <json file>]
// releases: { "<model id>": "<official release timestamp>" } (Amendment 16 anchors the baseline there).
// Output: <out>/index.json, <out>/series/<encoded key>.json, <out>/runs/<sha>.json (the accepted bytes, verbatim).
// The builder only adds and overwrites derived files; it never deletes anything under <out>.
const fs = require('fs');
const path = require('path');
const runStore = require('./lib/run-store.cjs');
const stats = require('./lib/stats-adapter.cjs');
const markerStore = require('../../markers/lib/store.cjs');
const { affectsSeries } = require('../../markers/lib/affects.cjs');

const encodeKey = (k) => encodeURIComponent(k).replace(/%7C/g, '~');

function writeIfChanged(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return;
  fs.writeFileSync(file, content);
}

function build({ storeDir, outDir, markersFile = markerStore.DEFAULT_STORE, releases = {} }) {
  const { computeSeries, source } = stats.load();
  const runs = runStore.list(storeDir);
  const markers = markerStore.load(markersFile);
  fs.mkdirSync(path.join(outDir, 'series'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'runs'), { recursive: true });

  for (const r of runs) {
    const f = path.join(outDir, 'runs', `${r.sha}.json`);
    if (fs.existsSync(f)) {
      if (!fs.readFileSync(f).equals(r.bytes)) throw new Error(`published run ${r.sha} differs from the store; published bytes are never edited`);
    } else fs.writeFileSync(f, r.bytes, { flag: 'wx' });
  }

  const groups = new Map();
  for (const r of runs) {
    const k = runStore.seriesKey(r.record);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }

  const index = { generated_by: 'site/data/build.cjs', stats_source: source, series: [] };
  for (const [key, rs] of [...groups.entries()].sort()) {
    rs.sort((a, b) => a.record.started_at.localeCompare(b.record.started_at));
    const model = rs[0].record.model;
    const releaseAt = releases[model] || null;
    const input = rs.map((r) => ({ started_at: r.record.started_at, passed: r.record.totals.passed, total: r.record.totals.total }));
    const computed = releaseAt ? computeSeries({ runs: input, releaseAt }) : null;
    const doc = {
      key,
      stats_source: source,
      release_at: releaseAt,
      runs: rs.map((r) => ({ sha: r.sha, run_id: r.record.run_id, started_at: r.record.started_at, passed: r.record.totals.passed, total: r.record.totals.total, account_source: r.record.account_source, contributor: r.record.contributor })),
      stats: computed,
      markers: markers.filter((m) => affectsSeries(m, key)).sort((a, b) => a.date.localeCompare(b.date)),
    };
    const file = `series/${encodeKey(key)}.json`;
    writeIfChanged(path.join(outDir, file), JSON.stringify(doc, null, 2) + '\n');
    index.series.push({ key, file, runs: rs.length });
  }
  writeIfChanged(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  return index;
}

module.exports = { build, encodeKey };

if (require.main === module) {
  const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const storeDir = arg('--store'); const outDir = arg('--out');
  if (!storeDir || !outDir) { console.error('usage: node site/data/build.cjs --store <dir> --out <dir> [--markers <file>] [--releases <file>]'); process.exit(2); }
  const releases = arg('--releases') ? JSON.parse(fs.readFileSync(arg('--releases'), 'utf8')) : {};
  const idx = build({ storeDir, outDir, markersFile: arg('--markers') || markerStore.DEFAULT_STORE, releases });
  console.log(`${idx.series.length} series written to ${outDir} (stats: ${idx.stats_source})`);
}
