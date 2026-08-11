# Resume evidence

These bullets describe implemented, reproducible synthetic experiments—not live trading, historical performance, or deployable profitability.

- Engineered a seeded options market-making laboratory with a deterministic exchange, delta hedging, Bayesian adverse-selection controls, and 100-run policy comparisons; reduced worst-seed loss from **-$24,956** unhedged to **-$6,149** with adverse-aware quoting while reducing mean residual delta from **458.26 to 0.49**.
- Built a stress-testing and decision-replay layer that reuses 100 common seeds across volatility, flow intensity, venue latency, and fee regimes; quantified a **38% negative-seed rate** and **-$12,442 worst seed** under doubled volatility, exposing regime sensitivity hidden by mean P&L alone.
- Implemented reproducible quantitative diagnostics for seeded GBM under P/Q measures, Black–Scholes Greeks, Monte Carlo confidence intervals, put-call parity, and discounted-underlying martingale checks; verified with **22 automated tests** and browser-level route checks.

Do not claim the synthetic P&L as trading performance. The stress bootstrap interval is a deterministic resampling diagnostic over simulated outcomes, not an independent-market confidence interval.
