// Creates one failing stub per requirement cell named in the nerf-bench PRD.
// Each stub is replaced by the build with the real check for that requirement alone.
// Existing files are never overwritten, so a real check is never clobbered.
const fs = require('fs');
const path = require('path');

const prd = process.argv[2];
if (!prd) { console.error('usage: node make-stubs.cjs <prd path>'); process.exit(1); }
const text = fs.readFileSync(prd, 'utf8');
const ids = [...new Set([...text.matchAll(/prd-cells\/([RN]-\d+)\.cjs/g)].map((m) => m[1]))];
let made = 0;
for (const id of ids) {
  const file = path.join(__dirname, `${id}.cjs`);
  if (fs.existsSync(file)) continue;
  fs.writeFileSync(file, [
    `// ${id}: stub emitted with the PRD. It fails until the build replaces it with the real check.`,
    `console.error('${id}: not built yet');`,
    'process.exit(1);',
    '',
  ].join('\n'));
  made += 1;
}
console.log(`ids in PRD: ${ids.length}; stubs created: ${made}`);
