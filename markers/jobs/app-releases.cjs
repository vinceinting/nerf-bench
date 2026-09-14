'use strict';
// App release markers (R-44) from each vendor's own release feed.
const { fetchJson } = require('../lib/http.cjs');
const sources = require('../sources.json');

const isStable = (v) => /^\d+\.\d+\.\d+$/.test(v);

function fromNpm(app, pkg, doc, since) {
  const out = [];
  for (const [v, t] of Object.entries(doc.time || {})) {
    if (!isStable(v) || Date.parse(t) < since) continue;
    out.push({
      id: `app-release:${app}:${v}`,
      type: 'app-release',
      date: new Date(t).toISOString(),
      title: `${pkg} ${v} released`,
      source_url: `https://www.npmjs.com/package/${pkg}/v/${v}`,
      affects: { apps: [app] },
      version: v,
    });
  }
  return out;
}

function fromGithubReleases(app, cfg, releases, since) {
  const out = [];
  for (const r of releases) {
    if (r.draft || r.prerelease || !r.published_at) continue;
    if (cfg.tag_prefix && !String(r.tag_name).startsWith(cfg.tag_prefix)) continue;
    if (Date.parse(r.published_at) < since) continue;
    const v = String(r.tag_name).slice((cfg.tag_prefix || '').length);
    out.push({
      id: `app-release:${app}:${v}`,
      type: 'app-release',
      date: new Date(r.published_at).toISOString(),
      title: `${cfg.repo} ${r.tag_name} released`,
      source_url: r.html_url,
      affects: { apps: [app] },
      version: v,
    });
  }
  return out;
}

// Returns { markers, latest: {app: version}, gaps: {app: reason}, errors: {app: message} }.
async function run({ since = Date.now() - 30 * 86400e3, cfg = sources } = {}) {
  const res = { markers: [], latest: {}, gaps: {}, errors: {} };
  for (const [app, c] of Object.entries(cfg.app_releases)) {
    if (!c) { res.gaps[app] = (cfg.app_release_gaps || {})[app] || 'no official feed configured'; continue; }
    try {
      let ms;
      if (c.kind === 'npm') {
        const doc = await fetchJson(`https://registry.npmjs.org/${c.package}`);
        ms = fromNpm(app, c.package, doc, since);
        res.latest[app] = doc['dist-tags'] && doc['dist-tags'].latest;
      } else if (c.kind === 'github-releases') {
        const rel = await fetchJson(`https://api.github.com/repos/${c.repo}/releases?per_page=100`);
        ms = fromGithubReleases(app, c, rel, since);
        const stable = rel.filter((r) => !r.prerelease && !r.draft && String(r.tag_name).startsWith(c.tag_prefix || ''));
        if (stable[0]) res.latest[app] = String(stable[0].tag_name).slice((c.tag_prefix || '').length);
      } else throw new Error(`unknown feed kind ${c.kind}`);
      res.markers.push(...ms);
    } catch (e) { res.errors[app] = e.message; }
  }
  return res;
}

module.exports = { run, fromNpm, fromGithubReleases };
