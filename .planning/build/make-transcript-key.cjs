// One-off: creates the transcript encryption keypair. The public half goes in the repo
// (runner/transcripts-key.pub.pem) so every run can seal its transcripts; the private half stays
// on this machine only, outside the repo, and is what unseals transcripts when a task set retires.
// Refuses to overwrite either file, so an existing private key is never lost.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PUB = path.join(__dirname, '..', '..', 'runner', 'transcripts-key.pub.pem');
const PRIV_DIR = path.join(process.env.USERPROFILE || process.env.HOME, '.nerf-bench');
const PRIV = path.join(PRIV_DIR, 'transcripts-key.pem');

for (const f of [PUB, PRIV]) if (fs.existsSync(f)) { console.error(`refusing: ${f} already exists`); process.exit(1); }
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
fs.mkdirSync(PRIV_DIR, { recursive: true });
fs.writeFileSync(PRIV, privateKey, { mode: 0o600 });
fs.writeFileSync(PUB, publicKey);
const fp = crypto.createHash('sha256').update(publicKey).digest('hex');
console.log(`public: ${PUB}\nprivate: ${PRIV}\npublic key sha256: ${fp}`);
