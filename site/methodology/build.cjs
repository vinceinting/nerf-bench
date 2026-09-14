#!/usr/bin/env node
'use strict';
// Renders site/methodology/index.html from template.html and settings.json.
//   node site/methodology/build.cjs [--check]    --check exits 1 if index.html is stale
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const ROOT = path.join(DIR, '..', '..');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The rotation interval lives only in the file settings.rotation_setting names (tasks/rotation.json).
function loadSettings() {
  const s = JSON.parse(fs.readFileSync(path.join(DIR, 'settings.json'), 'utf8'));
  s.rotation = JSON.parse(fs.readFileSync(path.join(ROOT, s.rotation_setting), 'utf8'));
  return s;
}

function render() {
  const s = loadSettings();
  const interval = s.rotation.interval_days;
  if (!Number.isInteger(interval) || interval <= 0) throw new Error('rotation.interval_days must be a positive integer');
  let frozenValue = '';
  const fz = path.join(ROOT, s.frozen_schedule.setting.replace(/\.json$/, '') + '.json');
  if (fs.existsSync(fz)) {
    const cfg = JSON.parse(fs.readFileSync(fz, 'utf8'));
    if (cfg.schedule) frozenValue = `, currently: ${esc(typeof cfg.schedule === 'string' ? cfg.schedule : JSON.stringify(cfg.schedule))}`;
  }
  const vals = {
    INTERVAL: esc(interval),
    OVERLAP: esc(s.rotation.overlap_days),
    ROTATION_LABEL: esc(s.rotation.label),
    FROZEN_SETTING: esc(s.frozen_schedule.setting),
    FROZEN_VALUE: frozenValue,
    FROZEN_LABEL: esc(s.frozen_schedule.label),
    RULE_URL: esc(`${s.repository}/blob/main/${s.stats_rule}`),
  };
  const html = fs.readFileSync(path.join(DIR, 'template.html'), 'utf8').replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
    if (!(k in vals)) throw new Error(`template token ${k} has no value`);
    return vals[k];
  });
  if (new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']').test(html)) throw new Error('methodology page contains an en or em dash');
  return { html, settings: s };
}

module.exports = { render, loadSettings };

if (require.main === module) {
  const { html } = render();
  const out = path.join(DIR, 'index.html');
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    if (cur.replace(/\r\n/g, '\n') !== html.replace(/\r\n/g, '\n')) { console.error('site/methodology/index.html is stale; run node site/methodology/build.cjs'); process.exit(1); }
    console.log('methodology page up to date');
  } else {
    fs.writeFileSync(out, html);
    console.log(`wrote ${out}`);
  }
}
