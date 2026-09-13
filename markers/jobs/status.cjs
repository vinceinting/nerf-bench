'use strict';
// Status incident markers (R-46) from each lab's public status page.
const { fetchJson } = require('../lib/http.cjs');
const sources = require('../sources.json');

function fromStatuspage(lab, base, doc) {
  return (doc.incidents || []).map((i) => ({
    id: `status-incident:${lab}:${i.id}`,
    type: 'status-incident',
    date: new Date(i.created_at).toISOString(),
    title: i.name,
    source_url: `${base}/incidents/${i.id}`,
    affects: { labs: [lab] },
    impact: i.impact || null,
  }));
}

async function run({ cfg = sources } = {}) {
  const res = { markers: [], errors: {}, counts: {} };
  for (const [lab, c] of Object.entries(cfg.status_pages)) {
    try {
      const doc = await fetchJson(c.url);
      const ms = fromStatuspage(lab, c.base, doc);
      res.counts[lab] = ms.length;
      res.markers.push(...ms);
    } catch (e) { res.errors[lab] = e.message; }
  }
  return res;
}

module.exports = { run, fromStatuspage };
