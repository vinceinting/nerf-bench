'use strict';
// Markers for the project's own published events (R-47 frozen moves, R-48 rotations, R-53 retirement)
// and lab statements (R-49). The source of a project event is the commit in the official repository
// that made it; a lab statement's source must be on that lab's own domain.
const { OWN_REPO, labOwnsUrl } = require('../lib/types.cjs');

const commitUrl = (sha) => {
  if (!/^[0-9a-f]{40}$/.test(sha || '')) throw new Error(`commit "${sha}" is not a 40-hex sha`);
  return `${OWN_REPO}commit/${sha}`;
};

// before/after: { <app id>: version } snapshots of the frozen-version setting.
function frozenMoves({ before, after, date, commit }) {
  const out = [];
  for (const app of Object.keys(after).sort()) {
    if (before[app] === after[app]) continue;
    out.push({
      id: `frozen-move:${app}:${after[app]}`,
      type: 'frozen-move',
      date: new Date(date).toISOString(),
      title: `Frozen ${app} moved from ${before[app] || 'none'} to ${after[app]}`,
      source_url: commitUrl(commit),
      affects: { apps: [app], track: 'frozen' },
    });
  }
  return out;
}

// A rotation affects every series that ran the outgoing set; models null means every series.
function rotation({ outgoing, incoming, date, commit, models = null }) {
  return [{
    id: `task-rotation:${outgoing.id}@${outgoing.version}->${incoming.id}@${incoming.version}`,
    type: 'task-rotation',
    date: new Date(date).toISOString(),
    title: `Task set ${outgoing.id} rotating out, ${incoming.id} rotating in`,
    source_url: commitUrl(commit),
    affects: models ? { models } : { series: ['*'] },
  }];
}

function retirement({ model, date, commit }) {
  return [{
    id: `retirement:${model}`,
    type: 'retirement',
    date: new Date(date).toISOString(),
    title: `retired ${new Date(date).toISOString().slice(0, 10)}`,
    source_url: commitUrl(commit),
    affects: { models: [model] },
  }];
}

function labStatement({ lab, date, title, url }) {
  if (!labOwnsUrl(lab, url)) throw new Error(`statement source ${url} is not on ${lab}'s own domain; markers are never editorial`);
  return [{
    id: `lab-statement:${lab}:${url}`,
    type: 'lab-statement',
    date: new Date(date).toISOString(),
    title,
    source_url: url,
    affects: { labs: [lab] },
  }];
}

module.exports = { frozenMoves, rotation, retirement, labStatement, commitUrl };
