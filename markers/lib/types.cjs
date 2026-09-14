'use strict';
// Marker vocabulary (D-29, D-32, D-40, N-12). A marker is an official event, never an editorial note:
// every marker names one of these types and an https source on a host that type allows.

const OWN_REPO = 'https://github.com/vinceinting/nerf-bench/';

const LAB_HOSTS = {
  anthropic: ['anthropic.com', 'claude.com', 'claude.ai'],
  openai: ['openai.com', 'chatgpt.com'],
  xai: ['x.ai'],
};

const APP_LAB = {
  'claude-code': 'anthropic',
  'claude-desktop': 'anthropic',
  'codex-cli': 'openai',
  'codex-desktop': 'openai',
  'grok-build': 'xai',
};

// Hosts are matched exactly or as a parent domain (status.claude.com matches claude.com).
const TYPE_RULES = {
  'app-release': { hosts: ['registry.npmjs.org', 'www.npmjs.com', 'github.com', ...Object.values(LAB_HOSTS).flat()] },
  'model-release': { hosts: Object.values(LAB_HOSTS).flat() },
  'status-incident': { hosts: ['status.claude.com', 'status.anthropic.com', 'status.openai.com', 'status.x.ai'] },
  'frozen-move': { prefix: OWN_REPO },
  'task-rotation': { prefix: OWN_REPO },
  'retirement': { prefix: OWN_REPO },
  'lab-statement': { hosts: Object.values(LAB_HOSTS).flat() },
};

const TYPES = Object.keys(TYPE_RULES);

function hostAllowed(host, hosts) {
  return hosts.some((h) => host === h || host.endsWith('.' + h));
}

function labOwnsUrl(lab, url) {
  const hosts = LAB_HOSTS[lab];
  if (!hosts) return false;
  let u;
  try { u = new URL(url); } catch { return false; }
  return u.protocol === 'https:' && hostAllowed(u.hostname, hosts);
}

// Returns a list of problems; empty means the marker is valid.
function validateMarker(m) {
  const errs = [];
  if (!m || typeof m !== 'object') return ['marker is not an object'];
  if (typeof m.id !== 'string' || !m.id) errs.push('missing id');
  if (!TYPES.includes(m.type)) errs.push(`type "${m.type}" is not an allowed marker type`);
  if (typeof m.date !== 'string' || Number.isNaN(Date.parse(m.date))) errs.push('missing or invalid date');
  if (typeof m.title !== 'string' || !m.title) errs.push('missing title');
  const a = m.affects || {};
  const any = ['apps', 'models', 'labs', 'series'].some((k) => Array.isArray(a[k]) && a[k].length > 0);
  if (!any) errs.push('affects names no app, model, lab or series');
  for (const app of a.apps || []) if (!APP_LAB[app]) errs.push(`unknown app ${app}`);
  for (const lab of a.labs || []) if (!LAB_HOSTS[lab]) errs.push(`unknown lab ${lab}`);
  let u = null;
  try { u = new URL(m.source_url); } catch { errs.push('missing or invalid source_url'); }
  const rule = TYPE_RULES[m.type];
  if (u && rule) {
    if (u.protocol !== 'https:') errs.push('source_url is not https');
    else if (rule.prefix && !m.source_url.startsWith(rule.prefix)) errs.push(`source_url must be under ${rule.prefix}`);
    else if (rule.hosts && !hostAllowed(u.hostname, rule.hosts)) errs.push(`source host ${u.hostname} is not an official source for ${m.type}`);
  }
  if (u && m.type === 'lab-statement') {
    const lab = (a.labs || [])[0];
    if (!labOwnsUrl(lab, m.source_url)) errs.push('lab-statement source is not on that lab\'s own domain');
  }
  return errs;
}

module.exports = { TYPES, TYPE_RULES, LAB_HOSTS, APP_LAB, OWN_REPO, validateMarker, labOwnsUrl };
