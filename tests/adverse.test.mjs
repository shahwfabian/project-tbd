import test from 'node:test';
import assert from 'node:assert/strict';
import { BayesianRegimeFilter, signedMarkout } from '../lib/adverse.ts';

test('Bayesian posterior remains normalized and informed buying raises buy toxicity', () => {
  const filter = new BayesianRegimeFilter();
  const before = filter.adverseProbability();
  const after = filter.update({ side:'BUY', imbalance:.8, volatilityChange:.3 });
  assert.ok(Math.abs(Object.values(after).reduce((a,b)=>a+b,0)-1)<1e-12);
  assert.ok(after.INFORMED_BUY > before/2);
  assert.ok(filter.quoteMultiplier() >= 1 && filter.quoteMultiplier() <= 3);
});

test('posterior only consumes decision-time evidence and markout is a separate diagnostic', () => {
  const filter = new BayesianRegimeFilter();
  assert.equal(filter.update({ side:'SELL', imbalance:-.7, volatilityChange:.4 }).INFORMED_SELL > .1, true);
  assert.deepEqual(Object.keys(filter.history[0].e).sort(), ['imbalance','side','volatilityChange']);
  assert.ok(Math.abs(signedMarkout('BUY',100,100.2)-.2)<1e-12);
  assert.ok(Math.abs(signedMarkout('SELL',100,99.8)-.2)<1e-12);
});
