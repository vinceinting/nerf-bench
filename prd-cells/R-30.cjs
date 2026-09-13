// R-30 (Amendments 5, 9, 14): simulated controls on the frozen schedule, then real runs per app: a
// latest run installed through the vendor's current-release installer, and a frozen run whose
// version equals the pin in effect at its start.
const fs = require('fs');
const path = require('path');
const c = require('../runner/verify/cells.cjs');
const frozen = require('../runner/lib/frozen.cjs');

c.cell('R-30', () => {
  // Simulation on a copy of the published schedule.
  const cfg = JSON.parse(JSON.stringify(frozen.load()));
  const DAY = 86400000;
  const anchor = Date.parse(cfg.schedule.anchor);
  const due = new Date(anchor + cfg.schedule.interval_days * DAY).toISOString().replace('.000Z', 'Z');
  cfg.pins.push({ app: 'sim', version: '1', effective_from: cfg.schedule.anchor }, { app: 'sim', version: '2', effective_from: due });
  cfg.pins.push({ app: 'sim', version: 'off', effective_from: new Date(anchor + 3 * DAY).toISOString() });
  c.assert(frozen.resolve(cfg, 'sim', new Date(Date.parse(due) - 1)).version === '1', 'pin moved before its due date');
  c.assert(frozen.resolve(cfg, 'sim', new Date(due)).version === '2', 'pin did not advance at its due date');
  c.assert(frozen.resolve(cfg, 'sim', new Date(Date.parse(due) + 10 * DAY)).version === '2', 'pin did not hold after its due date');
  c.assert(frozen.resolve(cfg, 'sim', new Date(anchor + 5 * DAY)).version === '1', 'an off-schedule change took effect');
  c.assert(frozen.moves(cfg, 'sim').valid.some((p) => p.effective_from === due), 'the move is not exposed for its R-47 marker');
  const text = fs.readFileSync(frozen.DEFAULT_PATH, 'utf8');
  c.assert(/Build's operational default/.test(text), 'config/frozen-versions.json is not labelled as the build default');

  const real = c.everyApp((app) => {
    const latest = c.realRun(app, (rec) => rec.app.track === 'latest');
    c.officialInstall(latest.record, latest.log);
    const fr = c.realRun(app, (rec) => rec.app.track === 'frozen');
    const pin = frozen.resolve(frozen.load(), app, new Date(fr.record.started_at));
    c.assert(fr.record.app.version === pin.version, `frozen run version ${fr.record.app.version} != pin ${pin.version}`);
    return `latest ${latest.record.app.version}, frozen ${fr.record.app.version}`;
  });
  return `schedule simulation ok; ${real}`;
});
