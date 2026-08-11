import test from 'node:test';
import assert from 'node:assert/strict';
import { auditExperiment, tribunalFixtures } from '../lib/tribunal.ts';

test('clean evidence receives warnings only for disclosed tail risk',()=>{
  const result=auditExperiment(tribunalFixtures.clean);
  assert.equal(result.verdict,'PASS WITH WARNINGS');
  assert.equal(result.findings.some(f=>f.id==='RISK-001'),true);
  assert.equal(result.findings.some(f=>f.severity==='CRITICAL'),false);
});

test('look-ahead leakage fails the experiment',()=>{
  const result=auditExperiment(tribunalFixtures.leaked);
  assert.equal(result.verdict,'FAIL');
  assert.equal(result.findings.some(f=>f.id==='LEAKAGE-001'),true);
  assert.equal(result.findings.some(f=>f.id==='SPLIT-001'),true);
});

test('impossible fills and unreconciled accounting fail the experiment',()=>{
  const result=auditExperiment(tribunalFixtures.impossibleFills);
  assert.equal(result.verdict,'FAIL');
  assert.equal(result.findings.filter(f=>f.severity==='CRITICAL').length,2);
});
