'use strict';
// Verdict wording (R-22, N-10). A headline appears only when the published rule clears; otherwise
// the card reads exactly "within normal variation". Wording states measured change only, never a cause.
const TEMPLATES = Object.freeze({
  lower: 'Pass rate is {points} points lower than launch week',
  higher: 'Pass rate is {points} points higher than launch week',
  none: 'within normal variation',
});

const BANNED = ['nerf', 'deliberate', 'intentional', 'on purpose', 'throttled'];

function fill(template, points) {
  return template.replace('{points}', String(points));
}

// decision: output of stats/compare.cjs decide(). Returns { kind, headline, text, reason }.
function verdict(decision) {
  if (!decision || decision.clears !== true) {
    return { kind: 'none', headline: null, text: TEMPLATES.none, reason: decision ? decision.reason : 'no comparison' };
  }
  const points = Math.round(Math.abs(decision.delta) * 1000) / 10;
  const kind = decision.delta < 0 ? 'lower' : 'higher';
  const text = fill(TEMPLATES[kind], points);
  return { kind, headline: text, text, reason: decision.reason };
}

function containsBanned(text) {
  const low = String(text).toLowerCase();
  return BANNED.filter((w) => low.includes(w));
}

module.exports = { verdict, TEMPLATES, BANNED, containsBanned, fill };
