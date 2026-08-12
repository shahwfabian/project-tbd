import assert from "node:assert/strict";
import test from "node:test";

import artifact from "../benchmarks/research-v2.json" with { type: "json" };
import { adjudicate } from "../lib/research/tribunal.ts";

test("tribunal derives a deployment block from stored hostile-regime evidence", () => {
  const verdict = adjudicate(artifact);
  assert.equal(verdict.verdict, "RESEARCH PASS · DEPLOYMENT BLOCKED");
  assert.ok(verdict.score < 100);
  assert.ok(verdict.findings.some(finding => finding.id === "T-004" && finding.severity === "HIGH"));
});

test("tribunal fails closed when an evidence count is inconsistent", () => {
  const tampered = structuredClone(artifact);
  tampered.evidenceCounts.reconciledRunCount -= 1;
  const verdict = adjudicate(tampered);
  assert.equal(verdict.verdict, "BLOCKED");
  assert.ok(verdict.findings.some(finding => finding.id === "T-002" && finding.severity === "CRITICAL"));
});
