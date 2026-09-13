// Records every blind finding of run c-mu06ff7r-mfcm66 with its severity, then parks the low ones.
const { execFileSync } = require('child_process');
const CLI = 'C:/Users/Vince/.harness-v2/tools/review/consensus.cjs';
const RUN = 'c-mu06ff7r-mfcm66';
const PROJECT = 'C:/Users/Vince/Documents/VS Code Projects/nerf-bench';
const S = {
  astra: '5891eaad-229b-4797-aeff-912b16b954fb',
  fable: '376f4e1b-52ae-4839-97e2-ea477e79c568',
  grok: 'c29e8493-238c-4a36-a703-a99776ac7fd1',
};
const rows = [
  ['astra', 'attest-boundary', 'high', 'R-06/R-28/N-05 signed workflow path and commit do not prove sealed unmodified execution'],
  ['astra', 'series-app-key', 'high', 'R-26 series key omits app identity'],
  ['astra', 'world-public-data', 'high', 'Cells needing public or served data have no deployment in the Verification world without breaking N-14'],
  ['fable', 'world-public-data', 'high', 'Served-site fixture cells (R-50..R-53, R-56, R-59, N-09, N-11) have no deployment named'],
  ['astra', 'r57-hidden-recompute', 'high', 'R-57 recompute of current-task scores needs hidden tasks'],
  ['fable', 'r57-hidden-recompute', 'high', 'R-57 vs N-03 unsatisfiable together; scope to retired tasks'],
  ['astra', 'every-app-coverage', 'high', 'Every-app claims in R-07, R-09, N-01, R-29, R-30 checked on one run or app'],
  ['grok', 'desktop-on-github', 'high', 'R-04/R-05 not GitHub-hosted; contributor flow never proves desktop apps'],
  ['fable', 'desktop-on-github', 'high', 'R-04/R-05 drop GitHub-hosted while R-06/R-27/R-28 need attested workflow runs'],
  ['grok', 'r66-meta', 'high', 'R-66 runs every other cell: circular under shape.md simultaneity rule'],
  ['astra', 'r66-meta', 'high', 'R-66 duplicates external side effects and is bounded by the per-cell timeout'],
  ['fable', 'r66-meta', 'high', 'R-66 reruns every cell; prd-verify exit 0 already is the criterion'],
  ['astra', 'default-effort-headline', 'medium', 'Home card may use a non-default effort series'],
  ['astra', 'handpick-selection', 'medium', 'D-13 hand-pick not bound'],
  ['grok', 'handpick-selection', 'medium', 'D-13 hand-pick missing'],
  ['astra', 'all-tiers-catalog', 'medium', 'D-27 every-tier support not bound'],
  ['grok', 'all-tiers-catalog', 'medium', 'D-27 every-tier catalog missing'],
  ['astra', 'r11-self-report', 'medium', 'R-11 ledger entry self-reports a human choice'],
  ['grok', 'r11-self-report', 'medium', 'R-11 cell reads this PRD'],
  ['fable', 'r11-self-report', 'medium', 'R-11 site/ commit rule conflicts with phase 2 methodology'],
  ['grok', 'r18-approval-gate', 'medium', 'R-18 invents propose-and-approve process'],
  ['astra', 'r18-approval-gate', 'medium', 'R-18 approval self-report and unresolved interval'],
  ['grok', 'grok-grounding', 'medium', 'Grounding Apache 2.0 and repo claim unsupported by x.ai page'],
  ['grok', 'n03-live-tasks', 'medium', 'N-03 vs R-09 and R-17 task texts under the Verification world'],
  ['astra', 'frozen-schedule', 'medium', 'R-30 never proves frozen moves only on schedule'],
  ['astra', 'release-date-baseline', 'medium', 'R-63/N-14 use switch date instead of official release date'],
  ['astra', 'methodology-timing-nav', 'medium', 'Methodology page not proved reachable or pre-result'],
  ['fable', 'methodology-timing-nav', 'medium', 'Nothing proves methodology predates first public result'],
  ['fable', 'api-key-owner', 'medium', 'R-29 API run has no key owner in the world'],
  ['fable', 'floor-track', 'medium', 'Floor app track undecided; outcome question for Vince'],
  ['fable', 'same-task-set', 'medium', 'Floor and contributor runs not bound to one current set; delivery of hidden set to public-repo runs unstated'],
  ['fable', 'contributor-sub-risk', 'medium', 'Contributors not told of subscription suspension risk'],
  ['fable', 'r13-roughly', 'medium', 'Roughly 50 to 100 hardened to strict bounds'],
  ['grok', 'r08-two-disclosures', 'medium', 'R-08 cell covers both disclosures and says exactly'],
];
const lows = [
  ['astra', 'grok-license-unverified', 'low', 'Grok license and repo unverified'],
  ['astra', 'r10-site-concepts', 'low', 'R-10 lacks explicit site concepts'],
  ['astra', 'word-ban-strength', 'low', 'Finite word bans and exact-text leak search need stronger checks'],
  ['grok', 'r12-fixed-cutoff', 'low', 'R-12 cell uses one fixed cutoff'],
  ['grok', 'r32-discretion-as-must', 'low', 'R-32 encodes discretion as MUST'],
  ['grok', 'r36-two-count', 'low', 'R-36 at least two for several'],
  ['grok', 'n10-extra-words', 'low', 'N-10 extra banned words'],
  ['fable', 'r09-disclosure', 'low', 'R-09 text lacks disclosure clause'],
  ['fable', 'r41-cost-field', 'low', 'Cost field on subscription run undefined'],
  ['fable', 'r64-timezone', 'low', 'R-64 same calendar day has no timezone'],
  ['fable', 'n06-unconstructible', 'low', 'N-06 input may be unconstructible'],
  ['fable', 'n10-brand-substring', 'low', 'N-10 nerf substring vs brand name'],
  ['fable', 'matrix-ranges', 'low', 'Matrix uses id ranges not one row per requirement'],
  ['fable', 'share-cap-unnamed', 'low', 'Share cap neither built nor named out of scope'],
  ['fable', 'r46-xai-status', 'low', 'xAI status page unverified'],
  ['fable', 'd24-labs-sponsor', 'trivial', 'Nothing binds that a lab may sponsor'],
];
const run = (args) => {
  try { return execFileSync('node', [CLI, ...args], { encoding: 'utf8' }).trim(); }
  catch (e) { return `FAILED ${args.slice(0, 6).join(' ')}: ${(e.stdout || '') + (e.stderr || '')}`.trim(); }
};
for (const [seat, key, sev, why] of rows.concat(lows)) {
  console.log(run(['contribution', '--run', RUN, '--reviewer', S[seat], '--key', key, '--severity', sev, '--why', why]));
}
for (const [seat, key] of lows) {
  console.log(run(['resolve-contribution', '--run', RUN, '--reviewer', S[seat], '--key', key, '--outcome', 'parked', '--project', PROJECT]));
}
