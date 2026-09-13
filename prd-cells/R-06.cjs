// R-06 (Amendment 1): a real run's result.json verifies with `gh attestation verify`, its signer is the
// official reusable workflow at the commit the record names, on a GitHub-hosted runner. Negative
// control: one flipped byte must fail verification.
const fs = require('fs');
const os = require('os');
const path = require('path');
const c = require('../runner/verify/cells.cjs');
const realRuns = require('../runner/verify/real-runs.cjs');

c.cell('R-06', () => {
  const { runs } = realRuns.all();
  c.assert(runs.length > 0, 'no attestation-verified real run exists yet');
  const r = runs[0];
  const cert = r.cert || {};
  const signer = cert.buildSignerURI || '';
  c.assert(signer.includes(`${realRuns.SIGNER}@`), `signer workflow is "${signer}", not ${realRuns.SIGNER}`);
  c.assert(cert.buildSignerDigest === r.record.workflow.commit, `signer commit ${cert.buildSignerDigest} != record's workflow commit ${r.record.workflow.commit}`);
  c.assert(cert.runnerEnvironment === 'github-hosted', `runner environment is ${cert.runnerEnvironment}`);
  const flipped = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'nb-flip-')), 'result.json');
  const b = fs.readFileSync(path.join(r.dir, 'result.json'));
  b[Math.floor(b.length / 2)] ^= 1;
  fs.writeFileSync(flipped, b);
  c.assert(!realRuns.verifyAttestation(flipped).ok, 'negative control: a flipped byte still verified');
  return `run ${r.record.run_id} verified, signer ${signer}; flipped byte refused`;
});
