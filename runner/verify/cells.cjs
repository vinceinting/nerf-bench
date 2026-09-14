// Shared plumbing for the W-A PRD cells. Real-run checks go through real-runs.cjs, which accepts
// only attestation-verified results; local controls use the fake agent and never count as the proof.
'use strict';
const fs = require('fs');
const path = require('path');
const realRuns = require('./real-runs.cjs');
const catalog = require('../lib/catalog.cjs');
const { ADAPTERS, adapter } = require('../apps/common.cjs');

const ROOT = path.join(__dirname, '..', '..');

function cell(id, fn) {
  Promise.resolve().then(fn)
    .then((msg) => { console.log(`${id}: PASS ${msg}`); process.exit(0); })
    .catch((e) => { console.error(`${id}: FAIL ${e.message}`); process.exit(1); });
}

// Runs fn for every launch app; fails listing every app that failed.
function everyApp(fn) {
  const bad = [];
  const good = [];
  for (const app of ADAPTERS) {
    try { good.push(`${app}: ${fn(app)}`); } catch (e) { bad.push(`${app}: ${e.message}`); }
  }
  if (bad.length) throw new Error(`${bad.length} of ${ADAPTERS.length} apps fail. ${bad.join(' | ')}`);
  return good.join(' | ');
}

function realRun(app, pred = () => true) {
  return realRuns.latest((rec, r) => rec.app.id === app && pred(rec, r));
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }

// Every task in the run's set(s) listed with a boolean pass.
function tasksListed(rec) {
  assert(rec.tasks.length > 0, 'result lists no tasks');
  assert(rec.tasks.every((t) => typeof t.pass === 'boolean'), 'a task lacks pass or fail');
  assert(rec.totals.total === rec.tasks.length, `totals.total ${rec.totals.total} != tasks listed ${rec.tasks.length}`);
  const sets = new Set(rec.task_sets.map((s) => s.id));
  assert(rec.tasks.every((t) => sets.has(t.set_id)), 'a task belongs to no recorded set');
  const ids = new Set(rec.tasks.map((t) => `${t.set_id}/${t.task_id}`));
  assert(ids.size === rec.tasks.length, 'a task is listed twice');
}

// The run log shows the vendor's official installer (as the catalog records it) and the version.
function officialInstall(rec, log) {
  const cat = catalog.load();
  const a = cat.apps[rec.app.id];
  const want = rec.app.track === 'latest' ? a.installer.latest : (a.installer.pinned || '').replace('{version}', rec.app.version);
  assert(want, `no official installer recorded for ${rec.app.id}`);
  assert(rec.app.installer === want, `installer "${rec.app.installer}" is not the official "${want}"`);
  assert(log.includes(`INSTALL ${want}`), 'run log does not show the official installer');
  assert(log.includes(`VERSION ${rec.app.id} ${rec.app.version}`), 'run log does not show the installed version');
  assert(!/INSTALL skipped/.test(log), 'install was skipped');
}

function noStall(log) { assert(!/ STALL /.test(log), 'a task stalled (permission prompt or hang)'); }

module.exports = { cell, everyApp, realRun, assert, tasksListed, officialInstall, noStall, ROOT, ADAPTERS, adapter };
