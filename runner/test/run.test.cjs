// End-to-end runner tests with the fake agent binary. Local mode cannot be a GitHub-hosted runner,
// so the only schema error a local record may carry is machine.hosted; everything else must be valid.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makeSet, makeStore, keys, runRunner, tmp } = require('./helpers.cjs');
const { validate } = require('../lib/schema-check.cjs');

const k = keys();
const set = makeSet('fixture-set', '3', ['t1', 't2']);
const storeUrl = makeStore('claude-opus-5', [set]);
const base = ['--app', 'claude-code', '--model', 'claude-opus-5'];
const env = { NB_TASK_STORE_URL: storeUrl, NB_TRANSCRIPT_KEY: k.pubFile };

function onlyHostedError(record) {
  assert.deepStrictEqual(validate(record), ['$.machine.hosted: must equal true']);
}

test('a solved run writes a schema-shaped result listing every task with pass', () => {
  const r = runRunner([...base, '--effort', 'high', '--track', 'latest'], env);
  assert.strictEqual(r.status, 0, r.stderr + r.log);
  onlyHostedError(r.result);
  assert.deepStrictEqual(r.result.tasks.map((t) => [t.task_id, t.pass]), [['t1', true], ['t2', true]]);
  assert.deepStrictEqual(r.result.deviations, ['commands auto-approved', 'web access blocked']);
  assert.deepStrictEqual(r.result.task_sets, [{ id: 'fixture-set', version: '3', fingerprint: set.fingerprint }]);
  assert.strictEqual(r.result.effort, 'high');
  assert.strictEqual(r.result.effort_is_default, false);
  assert.strictEqual(r.result.access_path, 'subscription');
  assert.strictEqual(r.result.app.installer, 'curl -fsSL https://claude.ai/install.sh | bash');
  assert.match(r.log, /INSTALL curl -fsSL https:\/\/claude.ai\/install.sh \| bash/);
  assert.match(r.log, /VERSION claude-code 9\.9\.9/);
  assert.match(r.log, /INVOKE t1: claude -p <prompt> .*--dangerously-skip-permissions --effort high/);
  assert.strictEqual(r.result.totals.tokens_in, 200);
  const sealed = fs.readFileSync(path.join(r.out, 'transcripts', 't1.jsonl.sealed'), 'utf8');
  assert.ok(!sealed.includes('answer'));
});

test('a wrong answer is scored fail', () => {
  const r = runRunner(base, { ...env, FAKE_MODE: 'wrong' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.deepStrictEqual(r.result.tasks.map((t) => t.pass), [false, false]);
  assert.strictEqual(r.result.effort, 'default');
  assert.strictEqual(r.result.effort_is_default, true);
});

test('the api access path is recorded as api', () => {
  const r = runRunner([...base, '--access', 'api', '--account-source', 'donated'], { ...env, ANTHROPIC_API_KEY: 'test-key-not-real' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(r.result.access_path, 'api');
  assert.strictEqual(r.result.account_source, 'donated');
});

test('the frozen track records the pinned version from config/frozen-versions', () => {
  const r = runRunner([...base, '--track', 'frozen'], env);
  assert.strictEqual(r.status, 0, r.stderr);
  assert.strictEqual(r.result.app.track, 'frozen');
  assert.match(r.log, /INSTALL curl -fsSL https:\/\/claude.ai\/install.sh \| bash -s 2\.1\.270/);
});

test('a stalled agent is killed, logged as STALL and scored fail', () => {
  const r = runRunner(base, { ...env, FAKE_MODE: 'stall', NB_TASK_TIMEOUT_S: '1' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.log, /STALL t1/);
  assert.deepStrictEqual(r.result.tasks.map((t) => t.pass), [false, false]);
});

test('a web fetch by the agent is refused and the refusal is in the run log', () => {
  const r = runRunner(base, { ...env, FAKE_MODE: 'fetch', FAKE_URL: 'https://example.com/' });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.match(r.log, /REFUSED .*"host":"example.com"/);
});

test('N-15: a caller naming a set the store does not serve is refused before any task runs', () => {
  const r = runRunner([...base, '--task-set', 'community-set'], env);
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /not served by the official store/);
  assert.doesNotMatch(r.log, /INVOKE/);
  assert.strictEqual(r.result, null);
});

test('a model absent from the catalog is refused', () => {
  const r = runRunner(['--app', 'claude-code', '--model', 'gpt-imaginary'], env);
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /not in the catalog/);
});

test('a dirty home (instruction file) is refused before tasks run', () => {
  const home = tmp('nb-home-');
  fs.mkdirSync(path.join(home, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(home, '.claude', 'CLAUDE.md'), 'rules');
  const r = runRunner(base, { ...env, NB_HOME: home });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.log, /TRACE instruction file ~\/\.claude\/CLAUDE\.md/);
  assert.doesNotMatch(r.log, /INVOKE/);
});

test('no transcript key means no run', () => {
  const r = runRunner(base, { ...env, NB_TRANSCRIPT_KEY: path.join(tmp('x-'), 'missing.pem') });
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /transcript public key missing/);
});

test('desktop apps are refused honestly until their installer and driver exist', () => {
  const r = runRunner(['--app', 'claude-desktop', '--model', 'claude-opus-5'], env);
  assert.notStrictEqual(r.status, 0);
  assert.match(r.stderr, /no official installer recorded for claude-desktop/);
});
