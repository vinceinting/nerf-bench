'use strict';
// Model release markers (R-45) from each lab's own announcement source.
const { fetchText } = require('../lib/http.cjs');
const sources = require('../sources.json');

const decode = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').trim();
const strip = (s) => decode(s.replace(/<[^>]+>/g, ''));

function parseRss(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const get = (tag) => { const r = m[1].match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)); return r ? decode(r[1]) : ''; };
    items.push({ title: get('title'), url: get('link'), date: get('pubDate') });
  }
  return items;
}

// Anchors of the form <a href="/news/slug" ...> ... <time>Mon D, YYYY</time> ... <h*>Title</h*> ... </a>
function parseNewsHtml(html, base) {
  const items = [];
  for (const m of html.matchAll(/<a[^>]*href="(\/news\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const t = m[2].match(/<time[^>]*>([\s\S]*?)<\/time>/);
    const h = m[2].match(/<h\d[^>]*>([\s\S]*?)<\/h\d>/);
    if (!t || !h) continue;
    items.push({ title: strip(h[1]), url: base + m[1], date: strip(t[1]) });
  }
  return items;
}

function toMarkers(lab, items, pattern) {
  const re = new RegExp(pattern);
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!re.test(it.title) || Number.isNaN(Date.parse(it.date)) || seen.has(it.url)) continue;
    seen.add(it.url);
    out.push({
      id: `model-release:${lab}:${it.url}`,
      type: 'model-release',
      date: new Date(Date.parse(it.date)).toISOString(),
      title: it.title,
      source_url: it.url,
      affects: { labs: [lab] },
    });
  }
  return out;
}

async function run({ cfg = sources } = {}) {
  const res = { markers: [], errors: {} };
  for (const [lab, c] of Object.entries(cfg.model_releases)) {
    try {
      const body = await fetchText(c.url);
      const items = c.kind === 'rss' ? parseRss(body) : parseNewsHtml(body, c.base);
      if (items.length === 0) throw new Error(`${c.url}: no announcements could be read from the page`);
      res.markers.push(...toMarkers(lab, items, c.title_pattern));
    } catch (e) { res.errors[lab] = e.message; }
  }
  return res;
}

module.exports = { run, parseRss, parseNewsHtml, toMarkers };
