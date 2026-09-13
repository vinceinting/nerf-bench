// Test double for `gh attestation verify`: accepts the file only if its sha256 equals FAKE_GH_ACCEPT_SHA
// and the verifier passed the pinning flags. Used by unit tests only; the output of the verifier names it.
const fs = require('fs');
const crypto = require('crypto');
const args = process.argv.slice(2);
const file = args[2];
const need = ['--signer-workflow', '--signer-digest', '--deny-self-hosted-runners'];
for (const f of need) if (!args.includes(f)) { console.error(`fake gh: missing ${f}`); process.exit(2); }
const got = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if (got !== process.env.FAKE_GH_ACCEPT_SHA) { console.error('fake gh: verification failed: digest not attested'); process.exit(1); }
console.log('[]');
