'use strict';
// Read-only fetch with a hard timeout. Non-2xx is an error, never an empty result.
async function fetchText(url, { timeoutMs = 20000 } = {}) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'nerf-bench-markers/0.1 (+https://github.com/vinceinting/nerf-bench)', accept: '*/*' },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

async function fetchJson(url, opts) {
  const t = await fetchText(url, opts);
  try { return JSON.parse(t); } catch { throw new Error(`${url}: response is not JSON`); }
}

module.exports = { fetchText, fetchJson };
