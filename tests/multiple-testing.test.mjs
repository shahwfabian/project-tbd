import test from "node:test";
import assert from "node:assert/strict";
import { realityCheck } from "../lib/multipleTesting.ts";
import { policyCandidates } from "../lib/validation.ts";

test("family-wide max-mean bootstrap is deterministic and reconciled",()=>{
  const seeds=Array.from({length:20},(_,i)=>i+1);
  const a=realityCheck(seeds,policyCandidates,300,17); const b=realityCheck(seeds,policyCandidates,300,17);
  assert.deepEqual(a,b);
  assert.equal(a.candidateMeans.length,3);
  assert.ok(a.bootstrapPValue>0&&a.bootstrapPValue<=1);
  assert.equal(a.observedMaxMean,Math.max(...a.candidateMeans.map(x=>x.meanNetPnl)));
  assert.equal(a.reconciled,true);
});

test("reality check rejects underspecified samples",()=>{
  assert.throws(()=>realityCheck([1,2,3]),/at least 10/);
});
