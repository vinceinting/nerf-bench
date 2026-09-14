'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { render } = require('../build.cjs');
const { checkPage } = require('../checks.cjs');

test('committed page equals a fresh render', () => {
  assert.equal(fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8').replace(/\r\n/g, '\n'), render().html.replace(/\r\n/g, '\n'));
});

test('page passes every content check', () => {
  const r = checkPage(render().html, render().settings);
  assert.deepEqual(r.failures, []);
});

test('checks catch a missing statement and a wrong interval', () => {
  const { html, settings } = render();
  const noLimit = html.replace(/cannot be ruled out by any outside benchmark/, 'is unlikely');
  assert.ok(checkPage(noLimit, settings).failures.some((f) => /content-recognition/.test(f)));
  assert.ok(checkPage(html, { ...settings, rotation: { ...settings.rotation, interval_days: 99 } }).failures.some((f) => /interval/.test(f)));
});
