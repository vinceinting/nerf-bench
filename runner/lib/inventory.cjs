// Machine inventory at run start (N-01): environment variable names, config-location listings and
// process names, scanned for anything traceable to Vince's harness or personal configuration.
// Values of environment variables are never written out (they may hold credentials); only whether
// a value matched a trace pattern.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { expand } = require('./fingerprint.cjs');

const HARNESS = [/harness-v2/i, /\.harness-accounts/i, /\.harness-state/i, /vinceinting88/i];
const TRACES = [...HARNESS, /C:[\\/]+Users[\\/]+Vince\b/i];
// A vendor default install sets none of these; their presence alone means redirected configuration.
const CONFIG_ENV = ['CLAUDE_CONFIG_DIR', 'CLAUDE_CODE_SETTINGS', 'CODEX_HOME', 'GROK_HOME', 'GROK_CONFIG', 'XDG_CONFIG_HOME'];

function listing(abs, rel, out, depth) {
  if (depth > 6 || !fs.existsSync(abs)) return;
  const st = fs.lstatSync(abs);
  out.push(rel);
  if (st.isDirectory()) for (const n of fs.readdirSync(abs).sort()) listing(path.join(abs, n), `${rel}/${n}`, out, depth + 1);
}

function processes() {
  if (process.env.NB_INVENTORY_PROCESSES === 'off') return ['<processes not inventoried: local test mode NB_INVENTORY_PROCESSES=off>'];
  try {
    if (process.platform === 'win32') return execFileSync('tasklist', ['/fo', 'csv', '/nh'], { encoding: 'utf8' }).split(/\r?\n/).map((l) => l.split('","')[0].replace(/^"/, '')).filter(Boolean);
    return execFileSync('ps', ['-eo', 'args='], { encoding: 'utf8' }).split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    return [`<process listing failed: ${e.message}>`];
  }
}

function take(locations, { home, workspace, env = process.env }) {
  const files = [];
  for (const loc of locations) listing(expand(loc, home, workspace), loc, files, 0);
  // Environment values are matched against harness names only: on a personal machine the profile
  // path legitimately appears in PATH and TEMP, and on a hosted runner it cannot appear at all.
  const envTraced = Object.entries(env).filter(([k, v]) => CONFIG_ENV.includes(k) || HARNESS.some((re) => re.test(k) || re.test(String(v)))).map(([k]) => k);
  return { env_names: Object.keys(env).sort(), env_traced: envTraced, files, processes: processes() };
}

// Returns the list of findings; empty means clean.
function scan(inv) {
  const hits = [];
  for (const k of inv.env_traced || []) hits.push(`environment variable ${k} carries a harness or personal trace`);
  for (const f of inv.files) if (TRACES.some((re) => re.test(f))) hits.push(`file ${f}`);
  for (const p of inv.processes) if (TRACES.some((re) => re.test(p))) hits.push(`process ${p}`);
  // Content check on instruction-shaped files: any of them is a trace of personal configuration
  // because the vendor default ships none.
  for (const f of inv.files) if (/(^|\/)(CLAUDE|AGENTS|AGENT|GROK|Claude|Agents)\.md$/.test(f)) hits.push(`instruction file ${f}`);
  for (const f of inv.files) if (/(^|\/)hooks(\/|$)|(^|\/)skills\/.+/.test(f)) hits.push(`hook or skill ${f}`);
  return hits;
}

module.exports = { take, scan, TRACES };
