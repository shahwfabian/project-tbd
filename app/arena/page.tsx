"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeterministicExchange } from "../../lib/exchange";

const money = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(2)}`;

export default function ArenaPage() {
  const [step, setStep] = useState(0);
  const session = useMemo(() => {
    const exchange = new DeterministicExchange({ orderLatency: 1, feePerContract: 0.25, maxPosition: 20 });
    const bid = exchange.submit("MM", "BUY", "LIMIT", 2, 99.75);
    const ask = exchange.submit("MM", "SELL", "LIMIT", 2, 100.25);
    exchange.advanceTo(1);
    if (step) {
      const taker = exchange.submit("FLOW", "BUY", "MARKET", 1);
      exchange.advanceTo(2);
      return { exchange, bid, ask, taker };
    }
    return { exchange, bid, ask, taker: null };
  }, [step]);
  const position = session.exchange.position("MM");
  const book = session.exchange.book();
  return <main><aside><div className="brand"><div className="mark">∑</div><div><strong>PROJECT TBD</strong><small>QUANT LAB / 0.1</small></div></div><nav><Link href="/" className="nav-link">← Pricing Laboratory</Link><Link href="/strategy" className="nav-link">02 / Strategy Laboratory</Link><div className="nav-current">03 / TRADING ARENA</div><Link href="/autopsy" className="nav-link">04 / Decision Autopsy</Link><Link href="/tribunal" className="nav-link">05 / Strategy Tribunal</Link></nav><div className="sidebar-bottom"><div className="status"><span className="dot"/>EXCHANGE ONLINE</div><p>Latency-aware matching<br/>Synthetic data only</p></div></aside><section className="workspace"><header><div><p className="eyebrow">EXECUTION / SESSION 001 / DETERMINISTIC</p><h1>Trading Arena</h1></div><div className="header-actions"><span className="chip"><span className="dot"/>QUEUE-AWARE</span><div className="avatar">QT</div></div></header><div className="toolbar"><div className="toolbar-title"><span className="signal"/>MARKET-MAKING DECISION LOOP</div><button className="run" onClick={() => setStep(step ? 0 : 1)}>{step ? "↺ Reset session" : "▶ Send synthetic flow"}</button></div><div className="placeholder-grid"><section className="panel hero-panel"><div className="panel-head"><span>01 / QUOTE</span><em>ARRIVAL LATENCY · 1 TICK</em></div><div className="hero-copy"><p className="eyebrow">DETERMINISTIC EXCHANGE</p><h2>Quote the spread. Observe the fill.</h2><p>Two-sided quotes rest at $99.75 / $100.25. A synthetic market order arrives only after configured latency, making the fill and inventory transition inspectable.</p><div className="hero-actions"><button className="primary" onClick={() => setStep(step ? 0 : 1)}>{step ? "Reset exchange" : "Send market order"}</button><span className="tag">SEEDLESS REFERENCE</span></div></div></section><section className="panel snapshot"><div className="panel-head"><span>02 / EXCHANGE STATE</span><em>t={session.exchange.now}</em></div><div className="book"><div><small>BID</small><b>$99.75 × {book.bid[0]?.quantity ?? 0}</b></div><div><small>ASK</small><b>$100.25 × {book.ask[0]?.quantity ?? 0}</b></div><div><small>MM POSITION</small><b className={position < 0 ? "negative" : "positive"}>{position}</b></div><div><small>MM EQUITY @ $100</small><b>{money(session.exchange.equity("MM", 100))}</b></div></div><div className="formula">{step ? `Fill ${session.exchange.fills[0]?.quantity ?? 0} @ $100.25 · fee ${money(session.exchange.fees("MM"))}` : "No fill before flow arrival"}</div></section></div><section className="panel evidence"><div className="panel-head"><span>03 / ACCEPTANCE CHECKS</span><em>LIVE STATE</em></div><div className="evidence-row">{["Quotes remain pending until t=1.", step ? "Market flow fills the resting ask." : "No fill occurs without a taker.", "Position and cash reconcile from fills.", "Price-time priority is deterministic."].map((x, n) => <div key={x}><b>0{n + 1}</b><span>{x}</span></div>)}</div></section><p className="footnote"><span>ENGINE · deterministic exchange</span><span>STATUS · <b className="ok">REPLAYABLE</b></span><span>NO LIVE ORDERS</span></p></section></main>;
}
