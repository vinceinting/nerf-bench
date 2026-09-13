'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { validateMarker, TYPES } = require('../lib/types.cjs');
const store = require('../lib/store.cjs');
const { affectsSeries } = require('../lib/affects.cjs');
const apps = require('../jobs/app-releases.cjs');
const models = require('../jobs/model-releases.cjs');
const status = require('../jobs/status.cjs');
const ev = require('../jobs/project-events.cjs');

const tmpFile = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'nb-mk-')), 'markers.jsonl');
const SHA = 'd'.repeat(40);

test('allowed types are exactly the seven official kinds', () => {
  assert.deepEqual([...TYPES].sort(), ['app-release', 'frozen-move', 'lab-statement', 'model-release', 'retirement', 'status-incident', 'task-rotation']);
});

test('editorial or community markers are invalid', () => {
  const base = { id: 'x', date: '2026-09-01', title: 't', affects: { labs: ['openai'] } };
  assert.ok(validateMarker({ ...base, type: 'editorial', source_url: 'https://openai.com/x' }).length);
  assert.ok(validateMarker({ ...base, type: 'lab-statement', source_url: 'https://reddit.com/r/x' }).length);
  assert.ok(validateMarker({ ...base, type: 'lab-statement', source_url: 'https://anthropic.com/x' }).length, 'another lab\'s domain is not this lab\'s statement');
  assert.ok(validateMarker({ ...base, type: 'status-incident', source_url: 'http://status.openai.com/incidents/1' }).length);
  assert.ok(validateMarker({ ...base, type: 'model-release', source_url: 'https://openai.com/index/x', affects: {} }).length);
  assert.deepEqual(validateMarker({ ...base, type: 'lab-statement', source_url: 'https://openai.com/index/x' }), []);
});

test('npm feed parser keeps stable versions since the cutoff with npm links', () => {
  const doc = { time: { created: '2020-01-01T00:00:00Z', '1.0.0': '2026-08-01T00:00:00Z', '1.1.0': '2026-09-10T00:00:00Z', '1.2.0-beta.1': '2026-09-11T00:00:00Z' } };
  const ms = apps.fromNpm('claude-code', '@anthropic-ai/claude-code', doc, Date.parse('2026-09-01'));
  assert.deepEqual(ms.map((m) => m.version), ['1.1.0']);
  assert.equal(ms[0].source_url, 'https://www.npmjs.com/package/@anthropic-ai/claude-code/v/1.1.0');
  assert.deepEqual(validateMarker(ms[0]), []);
});

test('GitHub releases parser skips prereleases and other tag families', () => {
  const rel = [
    { tag_name: 'rust-v0.2.0', published_at: '2026-09-10T00:00:00Z', html_url: 'https://github.com/openai/codex/releases/tag/rust-v0.2.0', prerelease: false },
    { tag_name: 'rust-v0.3.0-alpha.1', published_at: '2026-09-11T00:00:00Z', html_url: 'https://github.com/openai/codex/releases/tag/rust-v0.3.0-alpha.1', prerelease: true },
    { tag_name: 'other-1', published_at: '2026-09-11T00:00:00Z', html_url: 'https://github.com/openai/codex/releases/tag/other-1', prerelease: false },
  ];
  const ms = apps.fromGithubReleases('codex-cli', { repo: 'openai/codex', tag_prefix: 'rust-v' }, rel, 0);
  assert.deepEqual(ms.map((m) => m.version), ['0.2.0']);
  assert.deepEqual(validateMarker(ms[0]), []);
});

test('announcement parsers pick model releases only', () => {
  const html = '<a href="/news/claude-opus-5" class="x"><time class="d">Jul 24, 2026</time><h4 class="t">Introducing Claude Opus 5</h4></a>'
    + '<a href="/news/grants"><time>Aug 1, 2026</time><h4>Research grants</h4></a>';
  const cfg = require('../sources.json').model_releases;
  const a = models.toMarkers('anthropic', models.parseNewsHtml(html, 'https://www.anthropic.com'), cfg.anthropic.title_pattern);
  assert.deepEqual(a.map((m) => m.source_url), ['https://www.anthropic.com/news/claude-opus-5']);
  const rss = '<item><title><![CDATA[GPT-6 Astra: The next generation]]></title><link>https://openai.com/index/gpt-6-astra</link><pubDate>Tue, 01 Sep 2026 10:00:00 GMT</pubDate></item>'
    + '<item><title><![CDATA[How GPT-5.6 Sol helps]]></title><link>https://openai.com/index/sol</link><pubDate>Tue, 01 Sep 2026 10:00:00 GMT</pubDate></item>';
  const o = models.toMarkers('openai', models.parseRss(rss), cfg.openai.title_pattern);
  assert.deepEqual(o.map((m) => m.title), ['GPT-6 Astra: The next generation']);
  for (const m of [...a, ...o]) assert.deepEqual(validateMarker(m), []);
});

test('status page incidents become markers linked to the incident', () => {
  const ms = status.fromStatuspage('anthropic', 'https://status.claude.com', { incidents: [{ id: 'abc', name: 'Elevated errors', created_at: '2026-09-11T14:19:51Z', impact: 'minor' }] });
  assert.equal(ms[0].source_url, 'https://status.claude.com/incidents/abc');
  assert.deepEqual(validateMarker(ms[0]), []);
});

test('a frozen move lands only on the frozen charts of the moved app', () => {
  const ms = ev.frozenMoves({ before: { 'codex-cli': '0.1.0', 'claude-code': '2.0.0' }, after: { 'codex-cli': '0.2.0', 'claude-code': '2.0.0' }, date: '2026-09-12', commit: SHA });
  assert.equal(ms.length, 1);
  assert.ok(affectsSeries(ms[0], 'codex-cli|m|medium|subscription|frozen'));
  assert.ok(!affectsSeries(ms[0], 'codex-cli|m|medium|subscription|latest'));
  assert.ok(!affectsSeries(ms[0], 'codex-desktop|m|medium|subscription|frozen'));
});

test('a rotation lands on every chart; a lab statement on that lab\'s charts; retirement on its model', () => {
  const [r] = ev.rotation({ outgoing: { id: 's1', version: '1' }, incoming: { id: 's2', version: '1' }, date: '2026-09-12', commit: SHA });
  for (const k of ['codex-cli|a|x|api|latest', 'grok-build|b|y|subscription|frozen']) assert.ok(affectsSeries(r, k));
  const [s] = ev.labStatement({ lab: 'xai', date: '2026-09-12', title: 'Update on Grok', url: 'https://x.ai/news/update' });
  assert.ok(affectsSeries(s, 'grok-build|g|d|subscription|latest'));
  assert.ok(!affectsSeries(s, 'codex-cli|g|d|subscription|latest'));
  assert.throws(() => ev.labStatement({ lab: 'xai', date: '2026-09-12', title: 'x', url: 'https://example.com/blog' }), /never editorial/);
  const [t] = ev.retirement({ model: 'm1', date: '2026-09-12', commit: SHA });
  assert.equal(t.title, 'retired 2026-09-12');
  assert.ok(affectsSeries(t, 'claude-code|m1|d|subscription|latest'));
});

test('store is append-only: an existing marker cannot be rewritten', () => {
  const f = tmpFile();
  const [m] = ev.retirement({ model: 'm1', date: '2026-09-12', commit: SHA });
  assert.equal(store.append([m], f).length, 1);
  assert.equal(store.append([m], f).length, 0);
  assert.throws(() => store.append([{ ...m, title: 'changed' }], f), /never edited/);
  assert.throws(() => store.append([{ ...m, id: 'y', type: 'opinion' }], f), /not an allowed marker type/);
  assert.equal(store.load(f).length, 1);
});
