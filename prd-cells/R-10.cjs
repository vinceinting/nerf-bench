// R-10: at least two concept HTML files under design/concepts/, each with a clean uiscan
// report beside it (concept-x.uiscan.txt, written from uiscan.cjs), and no concept name or
// logo text containing Claude or Anthropic.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'design', 'concepts');
const fail = (m) => { console.error('R-10: ' + m); process.exit(1); };
if (!fs.existsSync(dir)) fail('design/concepts/ missing');

const concepts = fs.readdirSync(dir).filter((f) => /^concept-[^.]+\.html$/.test(f));
if (concepts.length < 2) fail('need at least two concept HTML files, found ' + concepts.length);

const banned = /claude|anthropic/i;
for (const f of concepts) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  // Name and logo text: title, brand span, every svg aria-label and svg text.
  const bits = [];
  const t = html.match(/<title>([\s\S]*?)<\/title>/i); if (t) bits.push(t[1]);
  for (const m of html.matchAll(/<div class="brand">([\s\S]*?)<\/div>/gi)) bits.push(m[1]);
  for (const m of html.matchAll(/<svg[\s\S]*?<\/svg>/gi)) bits.push(m[0]);
  if (!bits.length) fail(f + ': no name or logo found to check');
  for (const b of bits) if (banned.test(b)) fail(f + ': name or logo contains Claude or Anthropic');

  const rep = path.join(dir, f.replace(/\.html$/, '.uiscan.txt'));
  if (!fs.existsSync(rep)) fail(f + ': no uiscan report beside it');
  const r = fs.readFileSync(rep, 'utf8');
  if (!r.trim()) fail(f + ': uiscan report empty');
  if (!r.includes(f)) fail(f + ': uiscan report does not name this file');
  // uiscan prints "CLEAN." when nothing is found and "N finding(s):" otherwise; the last
  // scan in the report is the one that counts.
  const last = r.lastIndexOf('scanned ');
  const tail = last >= 0 ? r.slice(last) : r;
  if (!/^CLEAN\./m.test(tail) || /finding\(s\):/.test(tail)) fail(f + ': uiscan report shows findings or no CLEAN line');
}
console.log('R-10: ok, ' + concepts.length + ' concepts, each uiscan-clean, no banned name');
