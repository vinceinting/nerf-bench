#!/usr/bin/env node
// nerf-bench runner. Subcommands:
//   start  --app --model --effort --track --access --account-source [--floor] --out <dir>
//          writes start.json (R-32) before any task runs
//   run    same options plus [--task-set <id>] --out <dir>
//          installs the app, fingerprints, inventories, fetches tasks, runs them, writes result.json
//   fresh-fingerprint --app --track [--out <dir>]
//          installs the app on a clean machine and prints the published fresh-install value (R-07)
//   choices
//          prints every (app, model, effort) the catalog allows (R-34)
// Options may also come from NB_<NAME> environment variables (NB_APP, NB_MODEL, ...), which is how
// the reusable workflow passes them so no input is ever interpolated into a shell line.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');

const catalog = require('./lib/catalog.cjs');
const frozen = require('./lib/frozen.cjs');
const fingerprint = require('./lib/fingerprint.cjs');
const inventory = require('./lib/inventory.cjs');
const store = require('./lib/task-store.cjs');
const transcripts = require('./lib/transcripts.cjs');
const { validate } = require('./lib/schema-check.cjs');
const { adapter } = require('./apps/common.cjs');
const block = require('./network/block.cjs');
const proxy = require('./network/proxy.cjs');

const DEVIATIONS = ['commands auto-approved', 'web access blocked'];
const OFFICIAL_REPO = 'vinceinting/nerf-bench';
const WORKFLOW_PATH = '.github/workflows/run.yml';

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) o[k] = true; else { o[k] = next; i++; }
  }
  const env = (k) => process.env[`NB_${k.toUpperCase().replace(/-/g, '_')}`];
  for (const k of ['app', 'model', 'effort', 'track', 'access', 'account-source', 'task-set', 'out', 'floor']) {
    if (o[k] === undefined && env(k) !== undefined && env(k) !== '') o[k] = env(k);
  }
  o.floor = o.floor === true || o.floor === 'true';
  return o;
}

function sha256(b) { return crypto.createHash('sha256').update(b).digest('hex'); }

function homeDir() { return process.env.NB_HOME || os.homedir(); }

function expandHome(p) { return p.startsWith('~/') ? path.join(homeDir(), p.slice(2)) : p; }

function workflowCommit() {
  const s = process.env.NB_WORKFLOW_SHA || '';
  if (/^[0-9a-f]{40}$/.test(s)) return s;
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: __dirname, encoding: 'utf8' }).trim(); } catch { return '0'.repeat(40); }
}

function machine() {
  const hosted = process.env.GITHUB_ACTIONS === 'true' && process.env.RUNNER_ENVIRONMENT === 'github-hosted';
  const osName = { linux: 'linux', win32: 'windows', darwin: 'macos' }[process.platform];
  const image = process.env.ImageOS ? `${process.env.ImageOS} ${process.env.ImageVersion || ''}`.trim() : `local ${os.release()}`;
  return { hosted, os: osName, image };
}

class Log {
  constructor(file) { this.file = file; fs.writeFileSync(file, ''); }
  line(tag, msg) {
    const l = `${new Date().toISOString()} ${tag} ${msg}`;
    fs.appendFileSync(this.file, `${l}\n`);
    console.log(l);
  }
}

function selection(o) {
  const cat = catalog.load();
  const sel = catalog.select(cat, { app: o.app, model: o.model, effort: o.effort });
  const track = o.track || 'latest';
  if (!['latest', 'frozen'].includes(track)) throw new Error(`track must be latest or frozen, got ${track}`);
  const access = o.access || 'subscription';
  if (!['subscription', 'api'].includes(access)) throw new Error(`access path must be subscription or api, got ${access}`);
  const accountSource = o['account-source'] || 'contributor-owned';
  if (!['self-paid', 'contributor-owned', 'donated'].includes(accountSource)) throw new Error(`account source must be self-paid, contributor-owned or donated, got ${accountSource}`);
  if (o.floor && process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY !== OFFICIAL_REPO) throw new Error('floor runs come only from the official repository');
  let pinned = null;
  if (track === 'frozen') pinned = frozen.resolve(frozen.load(), o.app, new Date(process.env.NB_NOW || Date.now()));
  return { cat, sel, track, access, accountSource, pinned };
}

function runId() {
  return process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || '1'}` : `local-${Date.now()}`;
}

function cmdStart(o) {
  const s = selection(o);
  const out = o.out || '.';
  fs.mkdirSync(out, { recursive: true });
  const start = {
    schema_version: 1,
    run_id: runId(),
    started_at: new Date().toISOString(),
    app: { id: o.app, track: s.track, pinned_version: s.pinned ? s.pinned.version : null },
    model: o.model,
    effort: s.sel.effort,
    access_path: s.access,
    account_source: s.accountSource,
    contributor: process.env.GITHUB_ACTOR || os.userInfo().username,
    floor: o.floor,
    workflow: { repository: OFFICIAL_REPO, path: WORKFLOW_PATH, commit: workflowCommit(), caller_repository: process.env.GITHUB_REPOSITORY || 'local' },
  };
  fs.writeFileSync(path.join(out, 'start.json'), `${JSON.stringify(start, null, 2)}\n`);
  console.log(`start.json written for run ${start.run_id}`);
}

function install(log, cmd) {
  log.line('INSTALL', cmd);
  if (process.env.NB_INSTALL === 'skip') { log.line('INSTALL', 'skipped (local test mode: NB_INSTALL=skip)'); return; }
  const shell = process.platform === 'win32' ? ['powershell', ['-NoProfile', '-Command', cmd]] : ['bash', ['-o', 'pipefail', '-c', cmd]];
  execFileSync(shell[0], shell[1], { stdio: 'inherit' });
}

function binary(ad) {
  if (process.env.NB_AGENT_BIN) return { cmd: process.execPath, pre: [process.env.NB_AGENT_BIN] };
  return { cmd: ad.binary, pre: [] };
}

function appVersion(ad) {
  const b = binary(ad);
  const out = execFileSync(b.cmd, [...b.pre, ...ad.versionArgs], { encoding: 'utf8', shell: process.platform === 'win32' && !process.env.NB_AGENT_BIN });
  const v = ad.parseVersion(out);
  if (!v) throw new Error(`could not read ${ad.id} version from: ${out.trim()}`);
  return v;
}

function runAgent(cmd, args, { cwd, env, timeoutS }) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = ''; let stderr = ''; let stalled = false;
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => { stalled = true; child.kill('SIGKILL'); }, timeoutS * 1000);
    child.on('error', (e) => { stderr += `\nspawn error: ${e.message}`; });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr, stalled, duration_s: (Date.now() - t0) / 1000 }); });
  });
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  if (fs.existsSync(src)) fs.cpSync(src, dst, { recursive: true });
}

function check(def, cwd) {
  try {
    execFileSync(process.platform === 'win32' ? 'cmd' : 'bash', process.platform === 'win32' ? ['/d', '/s', '/c', def.check.command] : ['-c', def.check.command], { cwd, stdio: 'pipe', timeout: 600000 });
    return true;
  } catch { return false; }
}

async function cmdRun(o) {
  const out = path.resolve(o.out || 'out');
  fs.mkdirSync(path.join(out, 'transcripts'), { recursive: true });
  const log = new Log(path.join(out, 'run.log'));
  const startedAt = new Date().toISOString();
  const s = selection(o);
  const ad = adapter(o.app);
  log.line('SELECT', `app=${o.app} model=${o.model} effort=${s.sel.effort} track=${s.track} access=${s.access} account_source=${s.accountSource} floor=${o.floor}`);
  if (s.pinned && s.pinned.ignored.length) log.line('FROZEN', `ignored off-schedule pins: ${s.pinned.ignored.map((p) => `${p.version}@${p.effective_from}`).join(', ')}`);

  // Refuse early: secrets for the access path, and the transcript key.
  const secrets = process.env;
  const missing = ad.requiredSecrets[s.access].filter((k) => !secrets[k]);
  if (missing.length) throw new Error(`missing secret(s) for the ${s.access} path: ${missing.join(', ')}`);
  const pem = transcripts.publicKey();

  // Install from the vendor's official installer, then read the version the app reports.
  const installer = catalog.installer(s.cat, o.app, s.track, s.pinned && s.pinned.version);
  install(log, installer);
  const version = appVersion(ad);
  log.line('VERSION', `${o.app} ${version}`);
  if (s.pinned && version !== s.pinned.version && !process.env.NB_AGENT_BIN) throw new Error(`frozen track expected ${s.pinned.version}, installed ${version}`);

  // Fingerprint and inventory at run start: after install, before sign-in, before any task.
  const emptyWs = fs.mkdtempSync(path.join(os.tmpdir(), 'nb-ws-'));
  const fp = fingerprint.compute(ad.configLocations, { home: homeDir(), workspace: emptyWs });
  log.line('FINGERPRINT', `${fp.value} over ${fp.paths.join(' ')}`);
  const inv = inventory.take(ad.configLocations, { home: homeDir(), workspace: emptyWs, env: cleanEnv() });
  fs.writeFileSync(path.join(out, 'inventory.json'), `${JSON.stringify(inv, null, 2)}\n`);
  const hits = inventory.scan(inv);
  if (hits.length) { hits.forEach((h) => log.line('TRACE', h)); throw new Error(`run environment is not clean (${hits.length} trace(s)); refused`); }
  log.line('INVENTORY', 'clean');

  // Tasks come only from the official store (R-68, N-15), before any task runs.
  const storeCfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'task-store.json'), 'utf8'));
  const served = await store.fetchServed(process.env.NB_TASK_STORE_URL || storeCfg.url, s.sel.model.id, { audience: storeCfg.audience });
  const sets = store.choose(served, o['task-set']);
  const taskRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nb-tasks-'));
  const tasks = sets.flatMap((set) => store.materialize(set, taskRoot).map((t) => ({ ...t, set })));
  log.line('TASKS', `${tasks.length} task(s) from ${sets.map((x) => `${x.id}@${x.version} ${x.fingerprint}`).join(', ')}`);

  // Sign-in is placed only now, after the fingerprint.
  const auth = ad.auth(s.access, secrets);
  for (const [p, content] of Object.entries(auth.files)) { const f = expandHome(p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, content, { mode: 0o600 }); }

  // Web access blocked at the network layer; the agent reaches only its vendor through the proxy.
  const port = Number(process.env.NB_PROXY_PORT || 18080);
  const refusalLog = path.join(out, 'refusals.jsonl');
  fs.writeFileSync(refusalLog, '');
  const allow = (process.env.NB_EXTRA_HOSTS ? process.env.NB_EXTRA_HOSTS.split(',') : []).concat(ad.hosts);
  const server = await proxy.start(port, refusalLog, allow);
  if (process.env.NB_NETBLOCK === 'proxy-only') log.line('NETBLOCK', 'proxy only (local test mode: NB_NETBLOCK=proxy-only); no firewall rules applied');
  else block.apply({ port }).forEach((r) => log.line('NETBLOCK', r));

  const baseEnv = { ...cleanEnv(), ...auth.env, HOME: homeDir(), USERPROFILE: homeDir(), HTTPS_PROXY: `http://127.0.0.1:${port}`, HTTP_PROXY: `http://127.0.0.1:${port}`, https_proxy: `http://127.0.0.1:${port}`, http_proxy: `http://127.0.0.1:${port}`, NO_PROXY: '', no_proxy: '' };
  const timeoutS = Number(process.env.NB_TASK_TIMEOUT_S || 1800);
  const results = [];
  try {
    for (const t of tasks) {
      const ws = fs.mkdtempSync(path.join(os.tmpdir(), `nb-${t.id}-`));
      copyDir(path.join(t.root, 'repo'), ws);
      const inv0 = ad.invocation({ prompt: t.def.prompt, vendorModel: s.sel.model.vendor_model, effort: s.sel.effort });
      const b = binary(ad);
      const wrapped = process.env.NB_NETBLOCK === 'proxy-only' ? { cmd: b.cmd, args: [...b.pre, ...inv0.args] } : block.wrap(b.cmd, [...b.pre, ...inv0.args]);
      log.line('INVOKE', `${t.id}: ${[ad.binary || o.app, ...inv0.args.map((a) => (a === t.def.prompt ? '<prompt>' : a))].join(' ')}`);
      const r = await runAgent(wrapped.cmd, wrapped.args, { cwd: ws, env: baseEnv, timeoutS });
      if (r.stalled) log.line('STALL', `${t.id}: no exit within ${timeoutS}s; killed and scored as fail`);
      const pass = !r.stalled && check(t.def, ws);
      const transcript = Buffer.from(JSON.stringify({ task_id: t.id, exit: r.code, stalled: r.stalled, stdout: r.stdout, stderr: r.stderr }) + '\n');
      fs.writeFileSync(path.join(out, 'transcripts', `${t.id}.jsonl.sealed`), transcripts.seal(transcript, pem));
      const u = ad.parseUsage(r.stdout);
      results.push({ task_id: t.id, set_id: t.set.id, pass, ...u, duration_s: r.duration_s, transcript_sha256: sha256(transcript) });
      log.line('TASK', `${t.id} ${pass ? 'pass' : 'fail'} exit=${r.code} ${r.duration_s.toFixed(1)}s`);
    }
  } finally {
    server.close();
  }
  for (const l of fs.readFileSync(refusalLog, 'utf8').split('\n').filter(Boolean)) log.line('REFUSED', l);
  if (process.env.NB_NETBLOCK !== 'proxy-only') for (const l of block.kernelRefusals()) log.line('REFUSED', `kernel ${l}`);

  const sum = (k) => (results.some((x) => x[k] === null) ? null : results.reduce((a, x) => a + x[k], 0));
  const record = {
    schema_version: 1,
    run_id: runId(),
    started_at: startedAt,
    ended_at: new Date().toISOString(),
    app: { id: o.app, version, installer, track: s.track },
    model: s.sel.model.id,
    effort: s.sel.effort,
    effort_is_default: s.sel.effort_is_default,
    access_path: s.access,
    account_source: s.accountSource,
    contributor: process.env.GITHUB_ACTOR || os.userInfo().username,
    floor: o.floor,
    machine: machine(),
    fingerprint: { value: fp.value, paths: fp.paths },
    deviations: DEVIATIONS,
    task_sets: sets.map((x) => ({ id: x.id, version: x.version, fingerprint: x.fingerprint })),
    tasks: results,
    totals: { passed: results.filter((x) => x.pass).length, total: results.length, tokens_in: sum('tokens_in'), tokens_out: sum('tokens_out'), cost_usd: null, tool_calls: sum('tool_calls'), duration_s: results.reduce((a, x) => a + x.duration_s, 0) },
    workflow: { repository: OFFICIAL_REPO, path: WORKFLOW_PATH, commit: workflowCommit(), caller_repository: process.env.GITHUB_REPOSITORY || 'local' },
    scorer_commit: workflowCommit(),
  };
  fs.writeFileSync(path.join(out, 'result.json'), `${JSON.stringify(record, null, 2)}\n`);
  const errs = validate(record);
  errs.forEach((e) => log.line('SCHEMA', e));
  log.line('DONE', `${record.totals.passed}/${record.totals.total} passed; result.json ${errs.length ? 'has schema errors' : 'valid'}`);
  return { record, errs };
}

// The agent sees only what a fresh machine would give it: no inherited harness or personal variables.
function cleanEnv() {
  const keep = ['PATH', 'Path', 'PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'TMPDIR', 'LANG', 'LC_ALL', 'TERM', 'ComSpec', 'WINDIR', 'APPDATA', 'LOCALAPPDATA', 'ProgramFiles', 'ProgramData', 'FAKE_MODE', 'FAKE_URL', 'FAKE_ARGV_LOG'];
  const e = {};
  for (const k of keep) if (process.env[k] !== undefined) e[k] = process.env[k];
  return e;
}

function cmdFresh(o) {
  const cat = catalog.load();
  const ad = adapter(o.app);
  const track = o.track || 'latest';
  const pinned = track === 'frozen' ? frozen.resolve(frozen.load(), o.app) : null;
  const log = new Log(path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'nb-fresh-')), 'fresh.log'));
  install(log, catalog.installer(cat, o.app, track, pinned && pinned.version));
  const version = appVersion(ad);
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), 'nb-ws-'));
  const fp = fingerprint.compute(ad.configLocations, { home: homeDir(), workspace: ws });
  const entry = { [`${o.app}@${version}`]: { value: fp.value, paths: fp.paths, computed_at: new Date().toISOString(), run_id: runId() } };
  if (o.out) { fs.mkdirSync(o.out, { recursive: true }); fs.writeFileSync(path.join(o.out, 'fresh-fingerprint.json'), `${JSON.stringify(entry, null, 2)}\n`); }
  console.log(JSON.stringify(entry));
}

async function main() {
  const [sub, ...rest] = process.argv.slice(2);
  const o = parseArgs(rest);
  if (sub === 'start') return cmdStart(o);
  if (sub === 'run') { const r = await cmdRun(o); if (r.errs.length && process.env.GITHUB_ACTIONS === 'true') process.exit(3); return undefined; }
  if (sub === 'fresh-fingerprint') return cmdFresh(o);
  if (sub === 'choices') { console.log(JSON.stringify(catalog.choices(catalog.load()), null, 2)); return undefined; }
  console.error('usage: node runner/run.cjs start|run|fresh-fingerprint|choices [options]');
  process.exit(2);
  return undefined;
}

if (require.main === module) {
  main().catch((e) => { console.error(`nerf-bench runner: ${e.message}`); process.exit(1); });
}

module.exports = { cmdRun, cmdStart, parseArgs, DEVIATIONS, OFFICIAL_REPO, WORKFLOW_PATH };
