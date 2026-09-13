// R-19: stats/RULE.md was committed before the earliest public result's timestamp and has not
// changed since except by dated amendments inside it. Reads git history and the public results
// (site/data/**/result.json). No public result yet is a failure: the ordering cannot be shown.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const fail = (m) => { console.error(`R-19 FAIL: ${m}`); process.exit(1); };
const git = (args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();

const log = git(['log', '--format=%H %cI', '--follow', '--', 'stats/RULE.md']);
if (!log) fail('stats/RULE.md is not committed');
const commits = log.split('\n').map((l) => { const [sha, at] = l.split(' '); return { sha, at }; }).reverse();
const first = commits[0];
console.log(`RULE.md first committed ${first.at} in ${first.sha.slice(0, 7)}`);
for (const c of commits.slice(1)) {
  const diff = git(['show', '--format=', '--unified=0', c.sha, '--', 'stats/RULE.md']);
  const removed = diff.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---'));
  const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  const onlyNoneLine = removed.every((l) => l === '-None.');
  const dated = added.some((l) => /\d{4}-\d{2}-\d{2}/.test(l));
  const body = git(['show', `${c.sha}:stats/RULE.md`]);
  const amendIdx = body.indexOf('## Amendments');
  const addedAfterAmend = added.every((l) => body.indexOf(l.slice(1)) > amendIdx);
  if (!onlyNoneLine || !dated || !addedAfterAmend) fail(`${c.sha.slice(0, 7)} changed RULE.md outside a dated amendment`);
}
const dirty = git(['status', '--porcelain', '--', 'stats/RULE.md']);
if (dirty) fail('stats/RULE.md has uncommitted changes');
const results = [];
(function walk(d) { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === 'result.json') results.push(JSON.parse(fs.readFileSync(p, 'utf8'))); } })(path.join(root, 'site', 'data'));
if (results.length === 0) fail('no public result exists yet under site/data, so "committed before the first public result" cannot be shown');
const earliest = results.map((r) => Date.parse(r.started_at)).sort((a, b) => a - b)[0];
if (!(Date.parse(first.at) < earliest)) fail(`RULE.md committed ${first.at}, not before the first public result ${new Date(earliest).toISOString()}`);
console.log('R-19 PASS');
