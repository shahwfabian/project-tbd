import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDecision, replaySession } from '../lib/replay.ts';

const info={time:3,mid:100,inventory:0,baseSpread:.5,volatility:.2,posteriorAdverse:.2};
const outcome={flowSide:'SELL',arrivalUniform:.1,nextMid:99.7,feePerContract:.25,multiplier:100};

test('counterfactual alternatives respect position limits and utility costs',()=>{
  const d=auditDecision({...info,inventory:20},outcome);
  assert.ok(d.alternatives.filter(a=>a.action.name!=='PASS').every(a=>a.feasible===false));
  assert.equal(d.alternatives.find(a=>a.action.name==='PASS').feasible,true);
  assert.ok(d.regret>=0);
});

test('replay is deterministic and keeps decision information separate from realized outcome',()=>{
  const a=replaySession(42,20),b=replaySession(42,20); assert.deepEqual(a,b); assert.equal(a.decisions.length,20);
  const first=a.decisions[0]; assert.ok(!('nextMid' in first.information)); assert.ok('nextMid' in first.outcome); assert.ok(first.bestUtility>=first.selectedUtility);
});
