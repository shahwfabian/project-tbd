# Market microstructure

The implemented exchange uses price-time priority, explicit order arrival/cancellation latency, partial fills, tick size, multiplier, fees, position limits, and deterministic event ordering. A price touch does not imply a fill. The current baseline uses a synthetic spread-dependent arrival probability `exp(-3 × spread)` because there is only one displayed quoter; this is an explicitly documented approximation, not calibrated market data.

The baseline is informed by Avellaneda–Stoikov’s inventory-aware limit-order-book framework and Cont–Kukanov–Stoikov’s separation of limit orders, market orders, and cancellations. Those papers motivate simulator boundaries; they do not validate the synthetic scenario or imply strategy profitability.

Primary references:

- Avellaneda & Stoikov, [High-frequency trading in a limit order book](https://people.orie.cornell.edu/sfs33/LimitOrderBook.pdf).
- Cont, Kukanov & Stoikov, [The Price Impact of Order Book Events](https://arxiv.org/abs/1011.6402).

The adverse-selection filter keeps three hidden regimes—uninformed, informed buying, and informed selling—and updates their posterior only from decision-time side, imbalance, and volatility-change evidence. Post-fill markouts are stored as diagnostics and are not fed into the same decision before they become observable in the event timeline.

The stress suite now includes an explicit persistent-flow regime: 85% regime persistence and a 35% buy-side bias. Under the hedged/adverse-aware policy, that case produced mean net P&L of $253.28, a 47% negative-seed rate, and a -$7,543.04 worst seed across 100 common seeds. These parameters are synthetic controls for sensitivity testing, not empirical calibration; the next calibration gate is fitting arrival, sign persistence, and markout distributions to timestamped event data.
