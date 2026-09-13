// Resolves every high and medium contribution of run c-mu06ff7r-mfcm66 as changed:
// each landed as an amendment in the PRD ledger (disposition-round-1.md maps key to amendment).
const { execFileSync } = require('child_process');
const CLI = 'C:/Users/Vince/.harness-v2/tools/review/consensus.cjs';
const RUN = 'c-mu06ff7r-mfcm66';
const S = {
  astra: '5891eaad-229b-4797-aeff-912b16b954fb',
  fable: '376f4e1b-52ae-4839-97e2-ea477e79c568',
  grok: 'c29e8493-238c-4a36-a703-a99776ac7fd1',
};
const rows = [
  ['astra', 'attest-boundary'], ['astra', 'series-app-key'],
  ['astra', 'world-public-data'], ['fable', 'world-public-data'],
  ['astra', 'r57-hidden-recompute'], ['fable', 'r57-hidden-recompute'],
  ['astra', 'every-app-coverage'],
  ['grok', 'desktop-on-github'], ['fable', 'desktop-on-github'],
  ['grok', 'r66-meta'], ['astra', 'r66-meta'], ['fable', 'r66-meta'],
  ['astra', 'default-effort-headline'],
  ['astra', 'handpick-selection'], ['grok', 'handpick-selection'],
  ['astra', 'all-tiers-catalog'], ['grok', 'all-tiers-catalog'],
  ['astra', 'r11-self-report'], ['grok', 'r11-self-report'], ['fable', 'r11-self-report'],
  ['grok', 'r18-approval-gate'], ['astra', 'r18-approval-gate'],
  ['grok', 'grok-grounding'], ['grok', 'n03-live-tasks'],
  ['astra', 'frozen-schedule'], ['astra', 'release-date-baseline'],
  ['astra', 'methodology-timing-nav'], ['fable', 'methodology-timing-nav'],
  ['fable', 'api-key-owner'], ['fable', 'floor-track'], ['fable', 'same-task-set'],
  ['fable', 'contributor-sub-risk'], ['fable', 'r13-roughly'], ['grok', 'r08-two-disclosures'],
];
let failed = 0;
for (const [seat, key] of rows) {
  try {
    console.log(execFileSync('node', [CLI, 'resolve-contribution', '--run', RUN, '--reviewer', S[seat], '--key', key, '--outcome', 'changed'], { encoding: 'utf8' }).trim());
  } catch (e) {
    failed += 1;
    console.log(`FAILED ${seat} ${key}: ${(e.stdout || '') + (e.stderr || '')}`.trim());
  }
}
console.log(`resolved ${rows.length - failed} of ${rows.length}`);
process.exit(failed ? 1 : 0);
