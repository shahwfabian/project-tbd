# Strategy Tribunal

The tribunal is an evidence-based audit, not an LLM opinion. It checks leakage, impossible fills, missing costs, accounting reconciliation, multiple testing, walk-forward integrity, seed robustness and stress scenarios. Verdicts are PASS, PASS WITH WARNINGS, INSUFFICIENT EVIDENCE, or FAIL, each backed by stored findings with an ID, severity, evidence string, and remediation.

The seeded fixtures prove the tribunal catches look-ahead leakage and impossible/unreconciled fills. A negative worst-seed P&L is retained as an INFO finding rather than treated as an implementation failure; the system must distinguish economic weakness from invalid plumbing.
