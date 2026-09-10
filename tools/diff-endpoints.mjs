#!/usr/bin/env node
/**
 * Differential test: Laravel vs the Hono service, same inputs, same assertions.
 *
 * The parity suite in @frugalist/contracts proves the calculator maths matches.
 * This proves the whole HTTP path matches - validation, status codes, the
 * response envelope and the error bodies - by calling both running services and
 * comparing what comes back.
 *
 * Run before moving any endpoint at the proxy:
 *
 *   cd api && php artisan serve --port=8099
 *   cd server && pnpm dev
 *   node tools/diff-endpoints.mjs
 *
 * Two representation differences are normalised rather than treated as
 * failures, because neither is observable to a client:
 *
 *   - PHP's json_encode emits [] for an empty map, so Laravel returns
 *     "inputs":[] where the Hono service returns {}. Property access behaves
 *     identically on both.
 *   - Floats can differ in the final ulp after thousands of accumulated
 *     additions in a long amortisation schedule, so comparison is to 12
 *     significant digits rather than bit-exact.
 */


import { readFileSync } from 'node:fs';

const cases = JSON.parse(readFileSync('packages/contracts/fixtures/cases.json', 'utf8'));
const LARAVEL = 'http://127.0.0.1:8099';
const HONO = 'http://127.0.0.1:8787';

const call = (base, path, body, host) =>
  fetch(base + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(host ? { Host: host } : {}),
    },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));

// Normalise the two known-benign representation differences before comparing:
// PHP emits [] for an empty map, and floats can differ in the last ulp.
function normalise(v) {
  if (Array.isArray(v)) return v.length === 0 ? {} : v.map(normalise);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).sort(([a],[b]) => a.localeCompare(b)).map(([k, x]) => [k, normalise(x)]));
  }
  if (typeof v === 'number' && !Number.isInteger(v)) return Number(v.toPrecision(12));
  return v;
}

let pass = 0, fail = 0;
const failures = [];

for (const [kind, list] of Object.entries(cases)) {
  const path = `/api/calculators/${kind}/compute`;
  for (const c of list) {
    for (const withSchedule of [true, false]) {
      const payload = { ...c.input, with_schedule: withSchedule };
      const [l, h] = await Promise.all([
        call(LARAVEL, path, payload, 'thefrugalist.local:8001'),
        call(HONO, path, payload),
      ]);

      const label = `${kind}/${c.name}${withSchedule ? '' : ' (no schedule)'}`;
      const sameStatus = l.status === h.status;
      const sameBody = JSON.stringify(normalise(l.body)) === JSON.stringify(normalise(h.body));

      if (sameStatus && sameBody) { pass++; }
      else {
        fail++;
        failures.push({ label, laravel: l.status, hono: h.status,
          lb: JSON.stringify(normalise(l.body)).slice(0, 300),
          hb: JSON.stringify(normalise(h.body)).slice(0, 300) });
      }
    }
  }
}

console.log(`\nidentical: ${pass}   differing: ${fail}\n`);
for (const f of failures.slice(0, 6)) {
  console.log(`✗ ${f.label}  (laravel ${f.laravel} / hono ${f.hono})`);
  console.log(`  L: ${f.lb}`);
  console.log(`  H: ${f.hb}\n`);
}
process.exit(fail === 0 ? 0 : 1);
