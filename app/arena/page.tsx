"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { bs } from "../../lib/quant";

const STARTING_CASH = 100_000;
const MULTIPLIER = 100;
const feePerContract = .65;
const money = (n:number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));

type Trade={side:"BUY"|"SELL";quantity:number;price:number;fee:number;reason:string};

export default function ArenaPage(){
  const [spot,setSpot]=useState(100);
  const [days,setDays]=useState(30);
  const [vol,setVol]=useState(.22);
  const [cash,setCash]=useState(STARTING_CASH);
  const [position,setPosition]=useState(0);
  const [trades,setTrades]=useState<Trade[]>([]);
  const [explanation,setExplanation]=useState("You start with pretend money. The option has value because it gives you a choice: buy the stock at $100 later.");
  const [quantity,setQuantity]=useState(1);
  const fair=useMemo(()=>bs({spot,strike:100,maturity:Math.max(days/365,1/365),vol,rate:.05,dividend:0,paths:1,seed:42}).call,[spot,days,vol]);
  const bid=Math.max(.01,Math.floor((fair-.12)/.01)*.01);
  const ask=Math.ceil((fair+.12)/.01)*.01;
  const equity=cash+position*fair*MULTIPLIER;
  const pnl=equity-STARTING_CASH;
  const delta=bs({spot,strike:100,maturity:Math.max(days/365,1/365),vol,rate:.05,dividend:0,paths:1,seed:42}).delta;
  const trade=(side:"BUY"|"SELL")=>{
    const price=side==="BUY"?ask:bid;
    const signed=side==="BUY"?quantity:-quantity;
    const gross=signed*price*MULTIPLIER;
    const fee=quantity*feePerContract;
    if(side==="BUY" && cash < gross+fee){setExplanation("The order was stopped: you do not have enough pretend cash. This is a buying-power check, like a guardrail at a store.");return;}
    if(side==="SELL" && position<quantity){setExplanation("The order was stopped: you do not own enough contracts to sell. Short selling is disabled in this beginner account.");return;}
    setCash(c=>c-gross-fee);setPosition(p=>p+signed);
    setTrades(t=>[{side,quantity,price,fee,reason:side==="BUY"?"You paid the ask to get the option now.":"You hit the bid to leave the position now."},...t]);
    setExplanation(side==="BUY"?`You bought ${quantity} contract${quantity>1?"s":""}. Cash fell because buying is a real cost, and the option can later gain or lose value.`:`You sold ${quantity} contract${quantity>1?"s":""}. Cash rose, but you gave away the option. Your result now depends on whether the remaining option you own is worth more or less.`);
  };
  const scenario=(kind:"up"|"down"|"time"|"volUp"|"volDown")=>{
    if(kind==="up"){setSpot(s=>s+5);setExplanation("The stock moved up $5. A call option usually likes this because it is a coupon for buying the stock at the fixed strike of $100.");}
    if(kind==="down"){setSpot(s=>Math.max(70,s-5));setExplanation("The stock moved down $5. A call option usually dislikes this because the right to buy at $100 is less exciting when the stock is cheaper.");}
    if(kind==="time"){setDays(d=>Math.max(1,d-7));setExplanation("Seven days passed. Time is the option's melting ice cube: a choice that expires sooner is usually worth less, all else equal.");}
    if(kind==="volUp"){setVol(v=>clamp(v+.05,.05,.8));setExplanation("Volatility rose. Bigger possible moves make the choice more valuable: you pay a little for the chance of a much bigger surprise.");}
    if(kind==="volDown"){setVol(v=>clamp(v-.05,.05,.8));setExplanation("Volatility fell. Smaller expected moves make the option less valuable, because the big upside surprise is less likely.");}
  };
  const reset=()=>{setSpot(100);setDays(30);setVol(.22);setCash(STARTING_CASH);setPosition(0);setTrades([]);setExplanation("You start with pretend money. The option has value because it gives you a choice: buy the stock at $100 later.");};
  return <main><aside><div className="brand"><div className="mark">∑</div><div><strong>PROJECT TBD</strong><small>QUANT LAB / 0.1</small></div></div><nav><Link href="/" className="nav-link">← Pricing Laboratory</Link><div className="nav-current">01 / PAPER TRADING ARENA</div><Link href="/strategy" className="nav-link">03 / Strategy Laboratory</Link><Link href="/learn" className="nav-link">10 / Explain It Simply</Link></nav><div className="sidebar-bottom"><div className="status"><span className="dot"/>DEMO ACCOUNT ONLINE</div><p>$100,000 virtual cash<br/>No real orders · no risk</p></div></aside><section className="workspace"><header><div><p className="eyebrow">PAPER TRADING / CUSTOMER SANDBOX / CALL OPTION</p><h1>Trade With Demo Money</h1></div><div className="header-actions"><span className="chip"><span className="dot"/>VIRTUAL ONLY</span><div className="avatar">QT</div></div></header><div className="toolbar"><div className="toolbar-title"><span className="signal"/>LEARN BY CHANGING ONE THING AT A TIME</div><button className="run" onClick={reset}>↺ Reset account</button></div><div className="metrics"><Metric label="DEMO EQUITY" value={money(equity)} sub={`P&L ${money(pnl)}`} tone={pnl>=0?"teal":"gold"}/><Metric label="VIRTUAL CASH" value={money(cash)} sub="available buying power"/><Metric label="OPTION POSITION" value={`${position} contract${Math.abs(position)===1?"":"s"}`} sub={`delta ${delta.toFixed(3)} per share`}/><Metric label="OPTION FAIR VALUE" value={money(fair)} sub={`${days} days · ${(vol*100).toFixed(0)}% vol`} tone="teal"/></div><div className="paper-grid"><section className="panel paper-card"><div className="panel-head"><span>01 / YOUR ORDER</span><em>EUROPEAN CALL · K 100</em></div><div className="quote-box"><div><small>BID · what buyers offer</small><b>{money(bid)}</b></div><div><small>FAIR · our model estimate</small><b className="positive">{money(fair)}</b></div><div><small>ASK · what sellers request</small><b>{money(ask)}</b></div></div><div className="order-controls"><label>Contracts<input type="number" min="1" max="10" value={quantity} onChange={e=>setQuantity(clamp(Number(e.target.value)||1,1,10))}/></label><button className="buy" onClick={()=>trade("BUY")}>Buy at ask</button><button className="sell" onClick={()=>trade("SELL")}>Sell at bid</button></div><p className="helper">The bid/ask gap is the spread: the tiny toll for getting in or out immediately.</p></section><section className="panel paper-card"><div className="panel-head"><span>02 / EXPLAIN THE MOVE</span><em>CAUSE → EFFECT</em></div><div className="explanation"><span className="signal"/><p>{explanation}</p></div><div className="scenario-buttons"><button onClick={()=>scenario("up")}>Stock +$5</button><button onClick={()=>scenario("down")}>Stock -$5</button><button onClick={()=>scenario("time")}>Pass 7 days</button><button onClick={()=>scenario("volUp")}>Volatility +5%</button><button onClick={()=>scenario("volDown")}>Volatility -5%</button></div><div className="mini-facts"><span><b>Delta</b> how much the option follows the stock</span><span><b>Theta</b> how much time quietly melts away</span><span><b>Vega</b> how much fear/uncertainty changes value</span></div></section></div><section className="panel ledger"><div className="panel-head"><span>03 / TRANSACTION LEDGER</span><em>EVERYTHING IS VIRTUAL</em></div>{trades.length===0?<p className="empty">No trades yet. Buy one contract, then move the stock to see the reason for your gain or loss.</p>:trades.map((t,i)=><div className="ledger-row" key={`${t.price}-${i}`}><b className={t.side==="BUY"?"negative":"positive"}>{t.side}</b><span>{t.quantity} contract{t.quantity>1?"s":""} @ {money(t.price)}</span><span>fee {money(t.fee)}</span><small>{t.reason}</small></div>)}</section><p className="footnote"><span>MODEL · Black–Scholes teaching sandbox</span><span>STATUS · <b className="ok">SAFE TO EXPLORE</b></span><span>NO LIVE ORDERS</span></p></section></main>;
}
function Metric({label,value,sub,tone=""}:{label:string,value:string,sub:string,tone?:string}){return <div className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>}
