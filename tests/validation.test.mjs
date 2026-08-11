import test from "node:test";
import assert from "node:assert/strict";
import { runUntouchedValidationProtocol, policyCandidates } from "../lib/validation.ts";

test("untouched validation protocol is deterministic and disjoint",()=>{
  const a=runUntouchedValidationProtocol(Array.from({length:20},(_,i)=>i+1));
  const b=runUntouchedValidationProtocol(Array.from({length:20},(_,i)=>i+1));
  assert.deepEqual(a,b);
  assert.equal(a.candidates.length,policyCandidates.length);
  assert.equal(a.trainSeeds.length,12); assert.equal(a.validationSeeds.length,4); assert.equal(a.finalSeeds.length,4);
  assert.equal(a.validationUntouched,true); assert.equal(a.finalUntouched,true);
  assert.equal(a.validation[0].reconciled,true); assert.equal(a.final[0].reconciled,true);
});

test("selection metric is computed only from train rows",()=>{
  const result=runUntouchedValidationProtocol(Array.from({length:20},(_,i)=>i+1));
  assert.match(result.selectionMetric,/P05/);
  assert.equal(result.train.length,3);
  assert.equal(result.validation.length,1);
  assert.equal(result.final.length,1);
  assert.ok(result.final[0].seeds>0);
});
