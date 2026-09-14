// Frozen track (R-30, Amendment 14): one published schedule; pins move only on it.
'use strict';
const fs = require('fs');
const path = require('path');

const DEFAULT_PATH = path.join(__dirname, '..', '..', 'config', 'frozen-versions.json');
const DAY = 86400000;

function load(file = process.env.NB_FROZEN || DEFAULT_PATH) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function onSchedule(cfg, iso) {
  const d = Date.parse(iso) - Date.parse(cfg.schedule.anchor);
  return d >= 0 && d % (cfg.schedule.interval_days * DAY) === 0;
}

// The pins for one app that take effect, in order, plus the ones ignored as off-schedule.
function moves(cfg, app) {
  const all = cfg.pins.filter((p) => p.app === app).sort((a, b) => Date.parse(a.effective_from) - Date.parse(b.effective_from));
  return { valid: all.filter((p) => onSchedule(cfg, p.effective_from)), ignored: all.filter((p) => !onSchedule(cfg, p.effective_from)) };
}

function resolve(cfg, app, now = new Date()) {
  const { valid, ignored } = moves(cfg, app);
  const t = now.getTime();
  const live = valid.filter((p) => Date.parse(p.effective_from) <= t);
  if (!live.length) throw new Error(`no frozen pin in effect for ${app} at ${now.toISOString()}`);
  const pin = live[live.length - 1];
  return { version: pin.version, effective_from: pin.effective_from, ignored };
}

module.exports = { load, moves, resolve, onSchedule, DEFAULT_PATH };
