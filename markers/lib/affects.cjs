'use strict';
// Which series a marker lands on. Series key: app|model|effort|access_path|track (schema/run-record.md).
const { APP_LAB } = require('./types.cjs');

function parseKey(key) {
  const [app, model, effort, access_path, track] = key.split('|');
  return { app, model, effort, access_path, track, lab: APP_LAB[app] };
}

function affectsSeries(marker, key) {
  const s = parseKey(key);
  const a = marker.affects || {};
  if (a.track && a.track !== s.track) return false;
  if ((a.series || []).some((k) => k === '*' || k === key)) return true;
  if ((a.apps || []).includes(s.app)) return true;
  if ((a.models || []).includes(s.model)) return true;
  if ((a.labs || []).includes(s.lab)) return true;
  return false;
}

module.exports = { affectsSeries, parseKey };
