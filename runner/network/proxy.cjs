// Egress proxy for the agent (R-09). The agent's traffic is forced here by the network layer
// (runner/network/block.cjs); only the app vendor's own hosts are tunnelled. Every refusal is written
// as one JSON line to the refusal log, which the run log carries.
// usage: node proxy.cjs <port> <refusal-log> <host,host,...>
'use strict';
const http = require('http');
const net = require('net');
const fs = require('fs');

function allowed(host, list) {
  return list.some((h) => host === h || host.endsWith(`.${h}`));
}

function start(port, logFile, hosts) {
  const log = (o) => fs.appendFileSync(logFile, `${JSON.stringify({ at: new Date().toISOString(), ...o })}\n`);
  const server = http.createServer((req, res) => {
    let host = '';
    try { host = new URL(req.url).hostname; } catch { host = String(req.headers.host || '').split(':')[0]; }
    // Plain HTTP is never forwarded: the vendors' APIs are HTTPS only.
    log({ refused: true, method: req.method, host, url: req.url, reason: 'plain http not allowed' });
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('nerf-bench: web access blocked\n');
  });
  server.on('connect', (req, sock, head) => {
    const [host, p] = req.url.split(':');
    sock.on('error', () => {});
    if (!allowed(host, hosts)) {
      log({ refused: true, method: 'CONNECT', host, reason: 'not a vendor host' });
      sock.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return;
    }
    const up = net.connect(Number(p) || 443, host, () => {
      sock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      up.write(head);
      up.pipe(sock); sock.pipe(up);
    });
    up.on('error', () => sock.destroy());
    sock.on('error', () => up.destroy());
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (require.main === module) {
  const [port, logFile, hosts] = process.argv.slice(2);
  start(Number(port), logFile, hosts.split(',')).then(() => console.log(`proxy listening on 127.0.0.1:${port}`));
}

module.exports = { start, allowed };
