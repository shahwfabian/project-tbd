# Resume evidence

These bullets describe implemented, reproducible synthetic experiments—not live trading, historical performance, or deployable profitability.

- Engineered a seeded options market-making laboratory with option-fair-value quoting, deterministic exchange mechanics, delta hedging, Bayesian adverse-selection controls, and 100-run policy comparisons; reduced worst-seed loss from **-$21,053** unhedged to **-$735** with adverse-aware quoting while reducing mean residual delta from **458.26 to 0.49**.
- Built a stress-testing and decision-replay layer that reuses 100 common seeds across volatility, flow intensity, venue latency, and fee regimes; measured a **15% negative-seed rate** and **-$659 worst seed** under doubled volatility, exposing sensitivity hidden by mean P&L alone.
- Implemented reproducible diagnostics for seeded GBM under P/Q measures, Black–Scholes Greeks, Monte Carlo intervals, put-call parity, and martingale checks; verified with **28 automated tests**, build checks, and browser-level route checks.

Do not claim the synthetic P&L as trading performance. Bootstrap intervals are deterministic resampling diagnostics over simulated outcomes, not independent-market confidence intervals.
