// R-20 (as amended by Amendment 17): the methodology page states the D-35 content-recognition limit, is
// reachable by click from the home page on the public verification deployment (Amendment 3, deployment 2),
// and was published before the first public result.
// Needs NERF_PUBLIC_VERIFY_URL (deployment 2's base address) and NERF_EARLIEST_PUBLIC_RESULT (ISO time).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const { STATEMENTS } = require(path.join(ROOT, 'site/methodology/checks.cjs'));

const fails = [];
const page = fs.readFileSync(path.join(ROOT, 'site/methodology/index.html'), 'utf8');
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
if (!STATEMENTS['content-recognition limit (D-35)'].test(text(page))) fails.push('local page lacks the content-recognition limit statement');

(async () => {
  const base = process.env.NERF_PUBLIC_VERIFY_URL;
  if (!base) fails.push('no public verification deployment configured (NERF_PUBLIC_VERIFY_URL unset); reachability from the home page is unproved');
  else {
    try {
      const home = await (await fetch(base, { signal: AbortSignal.timeout(20000) })).text();
      const link = (home.match(/<a[^>]*href="([^"]*methodology[^"]*)"/i) || [])[1];
      if (!link) fails.push('home page has no link to the methodology page');
      else {
        const res = await fetch(new URL(link, base), { signal: AbortSignal.timeout(20000) });
        const body = await res.text();
        if (!res.ok || !STATEMENTS['content-recognition limit (D-35)'].test(text(body))) fails.push('deployed methodology page is unreachable or lacks the statement');
      }
    } catch (e) { fails.push(`deployment fetch failed: ${e.message}`); }
  }
  let first = '';
  try { first = execFileSync('git', ['log', '--reverse', '--format=%cI', '--', 'site/methodology/index.html'], { cwd: ROOT, encoding: 'utf8' }).split('\n')[0]; } catch (e) { fails.push(`git log failed: ${e.message}`); }
  if (!first) fails.push('methodology page is not committed yet');
  const earliest = process.env.NERF_EARLIEST_PUBLIC_RESULT;
  if (!earliest) fails.push('no earliest public result timestamp available (NERF_EARLIEST_PUBLIC_RESULT unset); publication order is unproved');
  else if (first && Date.parse(first) >= Date.parse(earliest)) fails.push(`page first committed ${first}, not before the earliest public result ${earliest}`);
  if (fails.length) { console.error('R-20 FAIL:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log(`R-20 PASS: statement present locally and deployed, reachable from home, first committed ${first} before ${earliest}`);
})();
