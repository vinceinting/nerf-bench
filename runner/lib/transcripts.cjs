// Transcripts stay private until their set retires (R-17, R-58). The runner encrypts each one to the
// project's public key before it leaves the machine: a fresh AES-256-GCM key per file, wrapped with
// RSA-OAEP-SHA256. Only the holder of the private key (never committed) can read them.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEY_PATH = path.join(__dirname, '..', 'transcripts-key.pub.pem');

function publicKey(file = process.env.NB_TRANSCRIPT_KEY || KEY_PATH) {
  if (!fs.existsSync(file)) throw new Error(`transcript public key missing at ${file}; no run starts without it, so transcripts can never leak`);
  return fs.readFileSync(file, 'utf8');
}

function seal(plain, pem) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([c.update(plain), c.final()]);
  const wrapped = crypto.publicEncrypt({ key: pem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, key);
  return JSON.stringify({ v: 1, wrapped: wrapped.toString('base64'), iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), body: body.toString('base64') });
}

function open(sealed, privatePem) {
  const s = JSON.parse(sealed);
  const key = crypto.privateDecrypt({ key: privatePem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(s.wrapped, 'base64'));
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(s.iv, 'base64'));
  d.setAuthTag(Buffer.from(s.tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(s.body, 'base64')), d.final()]);
}

module.exports = { publicKey, seal, open, KEY_PATH };
