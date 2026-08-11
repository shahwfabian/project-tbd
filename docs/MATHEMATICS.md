# Mathematics

The reference engine uses exact GBM discretization: `S(t+dt)=S(t) exp((drift - σ²/2)dt + σ√dt Z)`. Under P, drift is a configurable forecasting assumption; under Q it is `r-q` for risk-neutral valuation.

European call/put prices use Black–Scholes with continuous dividend yield. The UI reports delta, gamma, vega, theta, rho and put-call parity residual. Monte Carlo reports a seeded estimate, standard error and a nominal 95% normal interval. Antithetic variates are displayed as a comparison estimate.

These calculations are benchmarks, not claims about real markets. Near-expiry, zero-volatility behavior and statistical aggregation will be hardened in the exchange milestone.
