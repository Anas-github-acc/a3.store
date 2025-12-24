#!/usr/bin/env node
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://10.103.254.21';

const endpoints = [
  { method: 'PUT', path: '/api/kv/test-key', body: { value: 'sample-value' } },
  { method: 'POST', path: '/api/kv/test-key', body: { value: 'sample-value-post' } },
  { method: 'GET', path: '/api/kv/test-key' },
  { method: 'GET', path: '/api/cluster/nodes' },
  { method: 'GET', path: '/api/cluster/health' },
  { method: 'GET', path: '/api/cluster/pod-lifecycle' },
  { method: 'GET', path: '/api/metrics/summary' },
  { method: 'GET', path: '/api/nodes/resources' },
  { method: 'GET', path: '/api/anti-entropy/events' },
  { method: 'GET', path: '/healthz' }
];

async function doRequest(method, url, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const opts = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    signal: controller.signal
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    opts.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    clearTimeout(timeout);

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      parsed = text;
    }

    return { ok: res.ok, status: res.status, statusText: res.statusText, body: parsed };
  } catch (err) {
    clearTimeout(timeout);
    return { ok: false, error: err.message };
  }
}

async function main() {
  if (typeof fetch !== 'function') {
    console.error('This script requires Node.js v18+ (global fetch).');
    process.exit(2);
  }

  const results = [];

  for (const ep of endpoints) {
    const url = BASE.replace(/\/$/, '') + ep.path;
    console.log(`Requesting ${ep.method} ${url}`);
    const r = await doRequest(ep.method, url, ep.body);
    results.push({ method: ep.method, path: ep.path, url, result: r });
  }

  const outPath = `responses_${Date.now()}.json`;
  fs.writeFileSync(outPath, JSON.stringify({ base: BASE, fetched_at: Date.now(), results }, null, 2), 'utf8');
  console.log(`Saved responses to ${outPath}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
