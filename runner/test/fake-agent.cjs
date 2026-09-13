// A fake agent binary for unit tests. It never contacts a model. Behaviour by FAKE_MODE:
//   solve  - writes answer.txt containing 42 in its working directory, emits stream-json lines
//   wrong  - writes answer.txt containing 41
//   stall  - waits forever, as an agent stuck on a permission prompt would
//   fetch  - tries to fetch FAKE_URL through HTTPS_PROXY and prints what happened
// Every invocation appends its argv and selected env names to FAKE_ARGV_LOG.
'use strict';
const fs = require('fs');
const http = require('http');

const argv = process.argv.slice(2);
if (process.env.FAKE_ARGV_LOG) fs.appendFileSync(process.env.FAKE_ARGV_LOG, `${JSON.stringify({ argv, cwd: process.cwd(), proxy: process.env.HTTPS_PROXY || null })}\n`);

if (argv.includes('--version')) { console.log('9.9.9 (fake)'); process.exit(0); }

const mode = process.env.FAKE_MODE || 'solve';
const emit = (o) => console.log(JSON.stringify(o));

if (mode === 'stall') setInterval(() => {}, 1 << 30);
else if (mode === 'fetch') {
  const p = new URL(process.env.HTTPS_PROXY);
  const target = new URL(process.env.FAKE_URL);
  const req = http.request({ host: p.hostname, port: p.port, method: 'CONNECT', path: `${target.hostname}:443` });
  req.on('connect', (res) => { console.log(`fetch status ${res.statusCode}`); process.exit(0); });
  req.on('error', (e) => { console.log(`fetch error ${e.message}`); process.exit(0); });
  req.end();
} else {
  fs.writeFileSync('answer.txt', mode === 'wrong' ? '41' : '42');
  emit({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Write' }] } });
  emit({ type: 'result', usage: { input_tokens: 100, output_tokens: 20 } });
}
