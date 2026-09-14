// R-34 (Amendment 11): every catalog entry (app, model, effort) can be selected in the workflow's run
// inputs; a model absent from the catalog is refused by the runner; a fixture non-flagship entry is
// selectable and lands in its own series (series key per schema/run-record.md).
const fs = require('fs');
const path = require('path');
const c = require('../runner/verify/cells.cjs');
const catalog = require('../runner/lib/catalog.cjs');
const h = require('../runner/test/helpers.cjs');

function options(yml, input) {
  const m = yml.match(new RegExp(`\\n      ${input}:\\n(?:        .*\\n)*?        options: \\[([^\\]]*)\\]`));
  return m ? m[1].split(',').map((s) => s.trim()) : null;
}

const seriesKey = (r) => [r.app, r.model, r.effort, r.access_path, r.track].join('|');

c.cell('R-34', () => {
  const cat = catalog.load();
  const reusable = fs.readFileSync(path.join(c.ROOT, '.github', 'workflows', 'run.yml'), 'utf8');
  for (const i of ['app', 'model', 'effort']) c.assert(new RegExp(`\\n      ${i}:\\n`).test(reusable), `run.yml has no ${i} input`);
  for (const f of ['.github/caller-template/nerf-bench-run.yml', '.github/workflows/nerf-bench-run.yml']) {
    const yml = fs.readFileSync(path.join(c.ROOT, f), 'utf8');
    const o = { app: options(yml, 'app'), model: options(yml, 'model'), effort: options(yml, 'effort') };
    for (const k of Object.keys(o)) c.assert(o[k], `${f}: no ${k} choices`);
    for (const ch of catalog.choices(cat)) {
      c.assert(o.app.includes(ch.app) && o.model.includes(ch.model) && o.effort.includes(ch.effort), `${f}: ${ch.app}/${ch.model}/${ch.effort} not selectable`);
    }
    for (const m of o.model) c.assert(cat.models.some((x) => x.id === m), `${f}: offers ${m}, which the catalog does not list`);
  }
  // Refusal by the real runner, before anything is installed.
  const k = h.keys();
  const r = h.runRunner(['--app', 'claude-code', '--model', 'model-not-in-catalog'], { NB_TASK_STORE_URL: h.makeStore('x', []), NB_TRANSCRIPT_KEY: k.pubFile });
  c.assert(r.status !== 0 && /not in the catalog/.test(r.stderr), 'a model absent from the catalog was not refused');
  // Fixture non-flagship tier.
  const fx = JSON.parse(JSON.stringify(cat));
  const flagship = fx.models[0];
  fx.models.push({ id: 'fixture-non-flagship', lab: flagship.lab, tier: 'non-flagship', vendor_model: 'fixture-non-flagship', apps: [flagship.apps[0]] });
  const s = catalog.select(fx, { app: flagship.apps[0], model: 'fixture-non-flagship' });
  const a = seriesKey({ app: flagship.apps[0], model: flagship.id, effort: 'default', access_path: 'subscription', track: 'latest' });
  const b = seriesKey({ app: flagship.apps[0], model: s.model.id, effort: s.effort, access_path: 'subscription', track: 'latest' });
  c.assert(a !== b, 'non-flagship entry shares the flagship series');
  return `${catalog.choices(cat).length} catalog choices selectable in both callers; unlisted model refused; non-flagship series ${b}`;
});
