import test from 'node:test';
import assert from 'node:assert/strict';
import { bs, martingaleDiagnostic, monteCarlo } from '../lib/quant.ts';

const base = { spot: 100, strike: 100, maturity: 1, vol: 0.2, rate: 0.05, dividend: 0, paths: 10_000, seed: 1 };

test('engine martingale diagnostic aggregates paths and covers the expected value', () => {
  const d = martingaleDiagnostic(base);
  assert.ok(d.se > 0);
  assert.ok(d.expected >= d.low && d.expected <= d.high, JSON.stringify(d));
  assert.ok(Math.abs(d.error) < 1.0, JSON.stringify(d));
});

test('Monte Carlo confidence interval is calibrated across seeded runs', () => {
  const analytic = bs(base).call;
  let covered = 0;
  for (let seed = 1; seed <= 100; seed += 1) {
    const estimate = monteCarlo({ ...base, seed });
    if (analytic >= estimate.low && analytic <= estimate.high) covered += 1;
  }
  assert.ok(covered >= 88 && covered <= 100, `coverage=${covered}/100`);
});

test('invalid strikes throw instead of leaking NaN into the UI', () => {
  assert.throws(() => bs({ ...base, strike: -1 }), RangeError);
  assert.equal(bs({ ...base, spot: 0 }).gamma, 0);
});
