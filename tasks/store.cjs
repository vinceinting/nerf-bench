'use strict';
// The one task store (R-68 store side, R-16 rotation, R-69 selection records).
// A store is a private git repository laid out as:
//   candidates/<task_id>/...          harvester output (hidden)
//   selections/<set_id>@<version>.json  committed selection records (R-69)
//   sets/<set_id>/<version>/set.json + tasks/<task_id>/...   built sets (hidden until retired)
//   registry.json                      activations, in order
// The runner calls serve() at run start; the site calls wasServed() at ingest.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { fingerprintDir } = require('./fingerprint.cjs');

const DAY = 86400000;
const DEFAULT_BOUNDS = { min: 50, max: 100 }; // R-13 as amended by Amendment 19

function storeRoot() {
  return path.resolve(process.env.NERF_TASK_STORE || path.join(__dirname, '.store'));
}

function rotationSetting() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'rotation.json'), 'utf8'));
}

function git(root, args, env) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env } });
}

function commit(root, files, message, at) {
  const env = at ? { GIT_COMMITTER_DATE: at, GIT_AUTHOR_DATE: at } : {};
  git(root, ['add', '--', ...files], env);
  git(root, ['-c', 'user.name=nerf-bench store', '-c', 'user.email=store@nerf-bench.invalid', 'commit', '--quiet', '-m', message], env);
}

function openStore(root = storeRoot(), { create = false } = {}) {
  if (!fs.existsSync(path.join(root, '.git'))) {
    if (!create) throw new Error(`task store not found at ${root} (set NERF_TASK_STORE or create it)`);
    fs.mkdirSync(root, { recursive: true });
    git(root, ['init', '--quiet']);
  }
  return { root };
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`); };

function registry(store) {
  const p = path.join(store.root, 'registry.json');
  return fs.existsSync(p) ? readJson(p) : { sets: [] };
}

const setDir = (store, id, version) => path.join(store.root, 'sets', id, version);
const selectionPath = (store, id, version) => path.join(store.root, 'selections', `${id}@${version}.json`);

// ---- selection (R-69) ----------------------------------------------------

// Records the hand-picked candidates at their exact versions and commits the record.
function recordSelection(store, { set_id, set_version, selector, candidates, at }) {
  if (!selector) throw new Error('selection: selector is required');
  if (!Array.isArray(candidates) || candidates.length === 0) throw new Error('selection: no candidates');
  for (const c of candidates) {
    const dir = path.join(store.root, 'candidates', c.task_id);
    if (!fs.existsSync(dir)) throw new Error(`selection: candidate ${c.task_id} not in store`);
    const v = fingerprintDir(dir);
    if (c.version && c.version !== v) throw new Error(`selection: candidate ${c.task_id} is at ${v}, not ${c.version}`);
    c.version = v;
  }
  const rec = { set_id, set_version, selector, selected_at: at || new Date().toISOString(), candidates: candidates.map(({ task_id, version }) => ({ task_id, version })) };
  const p = selectionPath(store, set_id, set_version);
  writeJson(p, rec);
  commit(store.root, [path.relative(store.root, p)], `select ${set_id}@${set_version}`, at);
  return rec;
}

function selectionCommitDate(store, id, version) {
  const rel = path.relative(store.root, selectionPath(store, id, version)).split(path.sep).join('/');
  let out = '';
  try { out = git(store.root, ['log', '--diff-filter=A', '--format=%cI', '--', rel]).trim(); } catch { return null; }
  return out ? out.split('\n').pop() : null;
}

// ---- build and activate --------------------------------------------------

function buildSet(store, { id, version }) {
  const p = selectionPath(store, id, version);
  if (!fs.existsSync(p)) throw new Error(`build: no selection record for ${id}@${version}`);
  const rec = readJson(p);
  const dir = setDir(store, id, version);
  fs.rmSync(dir, { recursive: true, force: true });
  let earliest = null;
  for (const c of rec.candidates) {
    const src = path.join(store.root, 'candidates', c.task_id);
    if (fingerprintDir(src) !== c.version) throw new Error(`build: candidate ${c.task_id} changed since selection`);
    fs.cpSync(src, path.join(dir, 'tasks', c.task_id), { recursive: true });
    const t = readJson(path.join(src, 'task.json'));
    if (!earliest || Date.parse(t.source.merged_at) < Date.parse(earliest)) earliest = t.source.merged_at;
  }
  writeJson(path.join(dir, 'set.json'), { id, version, earliest_fix_at: earliest, task_count: rec.candidates.length });
  return { id, version, fingerprint: fingerprintDir(dir) };
}

function setTasks(dir) {
  const tdir = path.join(dir, 'tasks');
  return fs.readdirSync(tdir).map((task_id) => ({ task_id, version: fingerprintDir(path.join(tdir, task_id)) }));
}

// Refuses unless a committed selection record predating `at` names exactly the set's tasks at their versions.
function activateSet(store, { id, version, at, bounds = DEFAULT_BOUNDS }) {
  const when = at || new Date().toISOString();
  const dir = setDir(store, id, version);
  if (!fs.existsSync(path.join(dir, 'set.json'))) throw new Error(`activate: set ${id}@${version} not built`);
  const committed = selectionCommitDate(store, id, version);
  if (!committed) throw new Error(`activate: refused, no committed selection record for ${id}@${version}`);
  if (!(Date.parse(committed) < Date.parse(when))) throw new Error(`activate: refused, selection record committed ${committed}, not before activation ${when}`);
  const rec = readJson(selectionPath(store, id, version));
  const want = new Map(rec.candidates.map((c) => [c.task_id, c.version]));
  const have = setTasks(dir);
  for (const t of have) {
    if (want.get(t.task_id) !== t.version) throw new Error(`activate: refused, task ${t.task_id} is not in the selection record at version ${t.version}`);
  }
  if (have.length !== want.size) throw new Error('activate: refused, set and selection record differ in size');
  if (have.length < bounds.min || have.length > bounds.max) throw new Error(`activate: refused, ${have.length} tasks is outside ${bounds.min} to ${bounds.max}`);
  const reg = registry(store);
  const last = reg.sets[reg.sets.length - 1];
  if (last && Date.parse(when) <= Date.parse(last.activated_at)) throw new Error('activate: refused, activation must follow the previous one');
  if (reg.sets.some((s) => s.id === id && s.version === version)) throw new Error('activate: set already activated');
  const meta = readJson(path.join(dir, 'set.json'));
  const entry = { id, version, fingerprint: fingerprintDir(dir), earliest_fix_at: meta.earliest_fix_at, task_count: have.length, activated_at: when, selection_committed_at: committed };
  reg.sets.push(entry);
  writeJson(path.join(store.root, 'registry.json'), reg);
  commit(store.root, ['registry.json'], `activate ${id}@${version}`, when);
  return entry;
}

// ---- rotation (R-16) -----------------------------------------------------

// Status of every activated set at time `at`: pending, active, overlap or retired.
// A set is active until its successor activates, then in overlap for overlap_days, then retired.
function statusAt(reg, at, rotation = rotationSetting()) {
  const t = Date.parse(at);
  const sets = [...reg.sets].sort((a, b) => Date.parse(a.activated_at) - Date.parse(b.activated_at));
  return sets.map((s, i) => {
    const next = sets[i + 1];
    const start = Date.parse(s.activated_at);
    const retiredAt = next ? Date.parse(next.activated_at) + rotation.overlap_days * DAY : null;
    let status;
    if (t < start) status = 'pending';
    else if (!next || t < Date.parse(next.activated_at)) status = 'active';
    else if (t < retiredAt) status = 'overlap';
    else status = 'retired';
    return { ...s, status, retired_at: retiredAt ? new Date(retiredAt).toISOString() : null };
  });
}

function nextRotationDue(reg, rotation = rotationSetting()) {
  const last = reg.sets[reg.sets.length - 1];
  return last ? new Date(Date.parse(last.activated_at) + rotation.interval_days * DAY).toISOString() : null;
}

// ---- serving (R-68) ------------------------------------------------------

// What the runner calls at run start. A set is eligible for a model when every task in it was
// fixed after the model's published knowledge cutoff. Throws when nothing is eligible.
function serve(store, { model, modelCutoff, at }) {
  if (!modelCutoff) throw new Error('serve: modelCutoff is required');
  const when = at || new Date().toISOString();
  const live = statusAt(registry(store), when).filter((s) => s.status === 'active' || s.status === 'overlap');
  const eligible = live.filter((s) => Date.parse(s.earliest_fix_at) > Date.parse(modelCutoff));
  if (eligible.length === 0) throw new Error(`serve: no active set is eligible for ${model || 'model'} with cutoff ${modelCutoff} at ${when}`);
  return eligible.map((s) => ({ id: s.id, version: s.version, fingerprint: s.fingerprint, status: s.status, dir: setDir(store, s.id, s.version) }));
}

// What the site calls at ingest: was this fingerprint served for this model at the run's start?
function wasServed(store, { model, modelCutoff, at, fingerprint }) {
  try { return serve(store, { model, modelCutoff, at }).some((s) => s.fingerprint === fingerprint); } catch { return false; }
}

function activeSets(store, at) {
  return statusAt(registry(store), at || new Date().toISOString()).filter((s) => s.status === 'active' || s.status === 'overlap');
}

module.exports = {
  storeRoot, rotationSetting, openStore, registry, recordSelection, selectionCommitDate, buildSet, activateSet,
  statusAt, nextRotationDue, serve, wasServed, activeSets, setDir, setTasks, DEFAULT_BOUNDS,
};
