import test from "node:test";
import assert from "node:assert/strict";
import { runStressSuite, stressCases } from "../lib/stress.ts";

test("stress suite is deterministic and reports uncertainty and tails",()=>{
  const seeds=Array.from({length:12},(_,i)=>i+1);
  const a=runStressSuite(seeds), b=runStressSuite(seeds);
  assert.deepEqual(a,b);
  assert.equal(a.length,stressCases.length);
  for(const row of a){
    assert.equal(row.reconciled,true);
    assert.ok(row.meanNetPnlCI.low<=row.meanNetPnl&&row.meanNetPnl<=row.meanNetPnlCI.high);
    assert.ok(row.negativeSeedRate>=0&&row.negativeSeedRate<=1);
    assert.ok(row.p05NetPnl>=row.worstNetPnl);
  }
});

test("stress inputs change the simulated environment rather than relabeling the result",()=>{
  const seeds=[1,2,3,4,5,6,7,8];
  const rows=runStressSuite(seeds);
  assert.notEqual(rows[0].config.vol,rows[1].config.vol);
  assert.notEqual(rows[0].config.flowIntensity,rows[2].config.flowIntensity);
  assert.notEqual(rows[0].config.orderLatency,rows[3].config.orderLatency);
  assert.notEqual(rows[0].config.feePerContract,rows[4].config.feePerContract);
  assert.notEqual(rows[0].config.flowPersistence,rows[5].config.flowPersistence);
  assert.ok(rows[5].config.flowBuyBias>0);
});
