import test from 'node:test';
import assert from 'node:assert/strict';
import { DeterministicExchange } from '../lib/exchange.ts';

test('orders do not fill before arrival and match at price-time priority', () => {
  const x = new DeterministicExchange({ orderLatency: 2, feePerContract: 0, multiplier: 1 });
  const first = x.submit('MM', 'SELL', 'LIMIT', 2, 101);
  const second = x.submit('MM', 'SELL', 'LIMIT', 2, 101);
  const flow = x.submit('FLOW', 'BUY', 'MARKET', 3);
  x.advanceTo(1); assert.equal(x.fills.length, 0);
  x.advanceTo(2); assert.equal(x.fills.length, 2); assert.equal(x.fills[0].makerOrderId, first.id); assert.equal(x.fills[0].quantity, 2); assert.equal(x.fills[1].makerOrderId, second.id); assert.equal(x.fills[1].quantity, 1); assert.equal(x.orders.get(flow.id).status, 'FILLED');
});

test('partial fills, cancellation latency, fees and reconciliation are explicit', () => {
  const x = new DeterministicExchange({ orderLatency: 1, cancelLatency: 2, feePerContract: .5, multiplier: 100 });
  const order = x.submit('MM', 'BUY', 'LIMIT', 5, 99);
  x.advanceTo(1); const flow = x.submit('FLOW', 'SELL', 'MARKET', 2); x.advanceTo(2);
  assert.equal(x.fills.length, 1); assert.equal(x.fills[0].quantity, 2); assert.equal(x.orders.get(order.id).status, 'PARTIAL'); assert.equal(x.position('MM'), 2); assert.equal(x.fees('MM'), 1);
  x.cancel('MM', order.id); x.advanceTo(3); assert.equal(x.orders.get(order.id).status, 'PARTIAL'); x.advanceTo(4); assert.equal(x.orders.get(order.id).status, 'CANCELLED');
  assert.equal(x.equity('MM', 99), -1); assert.equal(x.cash('MM'), -19801);
});

test('position and order-size limits reject unsafe orders', () => {
  const x = new DeterministicExchange({ maxPosition: 2, maxOrderSize: 2 });
  assert.equal(x.submit('MM', 'BUY', 'LIMIT', 3, 99).status, 'REJECTED');
  const one = x.submit('MM', 'BUY', 'LIMIT', 2, 99); assert.equal(one.status, 'PENDING');
  assert.equal(x.submit('MM', 'BUY', 'LIMIT', 1, 99).status, 'REJECTED');
});
