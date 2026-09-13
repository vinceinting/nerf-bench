// Catalog (R-34): the one list of apps and models. Selection is validated here and nowhere else.
'use strict';
const fs = require('fs');
const path = require('path');

const DEFAULT_PATH = path.join(__dirname, '..', '..', 'config', 'catalog.json');

function load(file = process.env.NB_CATALOG || DEFAULT_PATH) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Returns { app, model, effort, effort_is_default } or throws with a plain reason.
function select(catalog, { app, model, effort }) {
  const a = catalog.apps[app];
  if (!a) throw new Error(`app "${app}" is not in the catalog`);
  const m = catalog.models.find((x) => x.id === model);
  if (!m) throw new Error(`model "${model}" is not in the catalog; refused`);
  if (!m.apps.includes(app)) throw new Error(`model "${model}" is not listed for app "${app}"`);
  const e = effort || 'default';
  const efforts = m.efforts || a.efforts;
  if (!efforts.includes(e)) throw new Error(`effort "${e}" is not listed for ${app}/${model} (listed: ${efforts.join(', ')})`);
  return { app: { id: app, ...a }, model: m, effort: e, effort_is_default: e === 'default' };
}

function installer(catalog, app, track, version) {
  const a = catalog.apps[app];
  const cmd = track === 'latest' ? a.installer.latest : a.installer.pinned;
  if (!cmd) throw new Error(`no official installer recorded for ${app}; see config/catalog.json installer_source`);
  return cmd.replace('{version}', version || '');
}

// Every (app, model, effort) triple a contributor may choose.
function choices(catalog) {
  const out = [];
  for (const m of catalog.models) for (const app of m.apps) {
    for (const e of m.efforts || catalog.apps[app].efforts) out.push({ app, model: m.id, effort: e });
  }
  return out;
}

module.exports = { load, select, installer, choices, DEFAULT_PATH };
