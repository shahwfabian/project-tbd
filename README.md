# Project TBD

A reproducible synthetic research environment for European option market making under inventory risk, directional adverse selection, quote latency, queue position, and frictional delta hedging.

The name is intentionally temporary. The research model is not.

## Research question

How should an option market maker quote when inventory risk and informed customer flow arrive together?

The experiment compares three policies on common seeded scenarios:

1. Symmetric, unhedged quoting.
2. Symmetric quoting with frictional delta hedging.
3. Inventory-skewed, directionally toxicity-aware quoting with frictional delta hedging.

## What makes the experiment coherent

- The underlying price and European call are separate instruments.
- Black-Scholes valuation operates under `Q`; the synthetic trading environment evolves under declared `P` dynamics.
- A latent informed-flow regime predicts the subsequent state move and is hidden at decision time.
- Quotes activate after latency and face customer reservation prices, queue-ahead quantity, and finite market-order size.
- Underlying hedges cross a spread and pay market impact plus fees after hedge latency.
- Option and underlying inventory are forcibly liquidated at termination.
- Policy comparisons use common random numbers and paired bootstrap indices.
- Counterfactual actions face the same latent event; expected utility cannot read realized outcomes.
- The Evidence Tribunal recomputes content hashes and evidence counts, then fails closed on inconsistencies.

The binding assumptions and release gates are in [`docs/RESEARCH_CONSTITUTION.md`](docs/RESEARCH_CONSTITUTION.md).

## Reproduce

```bash
npm install
npm run research:v2
npm test
npm run build
npm run dev
```

`npm run research:v2` regenerates [`benchmarks/research-v2.json`](benchmarks/research-v2.json) from 1,000 deterministic scenarios split into 600 train, 200 validation, and 200 final seeds.

## Held-out synthetic result

On the 200 final seeds, the adaptive policy's mean paired net-P&L difference versus the symmetric unhedged benchmark is `$72.91`, with a paired bootstrap 95% interval of `[$48.56, $96.49]`. It beats the benchmark on `65.5%` of individual seeds.

This is mechanism evidence inside the declared simulator. It is not a claim of historical alpha or live profitability. The included hostile regimes show material losses under extreme toxicity, wide underlying markets, and volatility crisis conditions. For that reason, the Tribunal currently returns `RESEARCH PASS · DEPLOYMENT BLOCKED`.

## Product workflow

- Research Overview: hypothesis, architecture, held-out evidence.
- Pricing Laboratory: Black-Scholes, Greeks, antithetic Monte Carlo, P/Q path distinction.
- Trading Arena: a no-foresight sequential probability game with realized regret.
- Policy Comparison: artifact-backed final policy panel.
- Stress Laboratory: declared failure regimes, not only favorable cases.
- Untouched Validation: frozen 600/200/200 seed manifest.
- Paired Inference: benchmark-relative family-wide Reality Check.
- Decision Autopsy: same-event counterfactual replay.
- Evidence Tribunal: derived findings and deployment gate.
- Methodology: model card, limits, and reproduction commands.

## Scope

No live data, brokerage credentials, historical performance, live routing, or profitability claim is present. The old V1 artifacts remain in the repository for comparison; the V2 interface reads only the generated `research-v2.json` artifact.
