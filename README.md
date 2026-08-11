# Project TBD

## Research question

When does an options market-making decision remain rational after model error, latency, adverse selection, inventory risk, and transaction costs are made explicit?

This repository is an educational, reproducible options market-making laboratory. It ships an executable browser experience with seeded GBM paths under physical/risk-neutral measures, Black–Scholes pricing and Greeks, Monte Carlo intervals, a deterministic exchange, option-fair-value backtesting, stress testing, untouched validation, and inference diagnostics. All market data is synthetic and labeled.

## Run

```bash
npm install
npm test
npm run backtest
npm run replay
npm run dev
```

Open http://localhost:3000. The workbench includes `/strategy`, `/stress`, `/validation`, `/inference`, `/arena`, `/autopsy`, and `/tribunal`.

## Honest scope

No live data, brokerage credentials, live order routing, historical claims, or profitability claims are present. In the corrected 100-seed baseline, the unhedged 0.50-spread run has mean net P&L of $1,650.61 and worst seed -$21,053.45; delta hedging produces $1,392.34 mean and -$1,940.12 worst seed while reducing mean maximum residual delta from 458.26 to 0.49. Adverse-aware quoting produces $643.88 mean and -$734.55 worst seed. The backtest quotes and marks option fair value separately from the underlying hedge; prior spot-as-option benchmark values were invalidated and regenerated. These are synthetic risk/cost diagnostics, not profitability claims.
