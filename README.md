# Project TBD

## Research question

When does an options market-making decision remain rational after model error, latency, adverse selection, inventory risk, and transaction costs are made explicit?

This repository is an educational, reproducible options market-making laboratory. It currently ships Milestone A as an executable browser experience: exact seeded GBM paths under physical/risk-neutral measures, Black–Scholes pricing and Greeks, Monte Carlo confidence intervals, put-call parity, and a discounted-underlying diagnostic. All market data in the interface is synthetic and labeled.

## Run

```bash
npm install
npm test
npm run backtest
npm run replay
npm run dev
```

Open http://localhost:3000. The workbench includes the Pricing Laboratory plus `/strategy` for measured policy comparisons, `/stress` for declared environment sensitivity, `/validation` for untouched model selection, `/inference` for family-wide data-snooping diagnostics, `/arena` for a latency-aware deterministic fill loop, `/autopsy` for ex-post decision replay, and `/tribunal` for evidence-backed experiment review.

## Architecture

`app/page.tsx` is the client workbench and `lib/quant.ts` is the dependency-free reference numerical engine. The engine uses explicit seeded RNG, stable normal CDF approximation, analytic Black–Scholes values, and antithetic terminal samples. The next boundary is a Python/C++ service for event logs and queue-aware matching.

## Honest scope

No live data, brokerage credentials, live order routing, historical claims, or profitability claims are present. The 100-seed baseline is recorded in `benchmarks/baseline-backtest.json`: the unhedged 0.50-spread run has mean net P&L of $1,497.76 but a worst seed of -$24,956.34; adding delta hedging reduces mean net P&L to $1,239.50 after $25.26 mean hedge fees and improves the worst seed to -$15,475.71 while reducing mean maximum residual delta from 458.26 to 0.49. Adding the Bayesian adverse-aware quote policy further reduces mean net P&L to $879.18 but improves the worst seed to -$6,149.14. A 20-decision replay with seed 42 produces cumulative ex-post regret of $132.98; this is a decision-quality diagnostic, not achievable foresight. That is a synthetic risk/cost tradeoff, not a profitability claim. See `docs/` for the research protocol and limitations.
