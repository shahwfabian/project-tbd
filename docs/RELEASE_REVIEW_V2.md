# V2 Release Review

## Scope

This review covers the isolated `codex/research-rebuild-v2` branch. It does not replace or mutate the existing production deployment.

## Quantitative gates

- Separate option and underlying instruments: passed.
- Risk-neutral valuation separated from physical scenarios: passed.
- Informed flow predicts a subsequent state move: passed.
- Directional toxicity and inventory skew: passed.
- Quote and hedge latency: passed.
- Queue-ahead and finite order size: passed.
- Hedge spread, impact, and fees: passed.
- Mandatory option and underlying liquidation: passed.
- Cash reconciliation: 3,000 / 3,000 research runs.
- Terminal flat inventory: 3,000 / 3,000 research runs.
- Common-seed pairing and paired bootstrap: passed.
- Same-event counterfactual replay without outcome leakage: passed.

## Engineering gates

- Unit and adversarial tests: 43 passed, 0 failed.
- TypeScript validation: passed.
- Next.js production build: passed.
- Static generation: 10 product routes plus framework routes passed.
- Production HTTP smoke test: all 10 product routes returned HTTP 200 with non-empty rendered HTML.
- Invalid pricing inputs: rejected before the numerical engine is called.
- Mobile navigation: present in source with responsive layout rules.
- Frontend benchmark provenance: V2 benchmark values are imported from `benchmarks/research-v2.json`.

## Runtime browser constraint

Automated Chromium interaction could not run in the current sandbox because the browser runner could not provision Chrome through the environment's certificate chain. This is recorded as an unverified delivery check, not reported as a pass. The production build and HTTP-rendered route checks succeeded.

## Adversarial verdict

Research pass, deployment blocked. Extreme persistent toxicity, wide underlying markets, and volatility-crisis scenarios expose material left-tail risk. Historical replay and forward paper trading remain required before any empirical market claim.
