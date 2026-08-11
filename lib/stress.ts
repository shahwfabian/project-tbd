import { summarizeBacktest, type BacktestConfig } from "./backtest.ts";

export type StressCase={name:string;description:string;overrides:Partial<BacktestConfig>};
export const stressCases:StressCase[]=[
  {name:"BASE",description:"Reference synthetic regime",overrides:{}},
  {name:"HIGH VOL",description:"Volatility doubled",overrides:{vol:.4}},
  {name:"THIN FLOW",description:"Arrival intensity reduced; more fills",overrides:{flowIntensity:1.5}},
  {name:"SLOW VENUE",description:"Two-tick order latency",overrides:{orderLatency:2}},
  {name:"EXPENSIVE FEES",description:"Four-times contract fee",overrides:{feePerContract:1}},
  {name:"PERSISTENT TOXIC FLOW",description:"Persistent one-sided informed-flow regime",overrides:{flowPersistence:.85,flowBuyBias:.35}}
];
function rng(seed:number){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function quantile(xs:number[],q:number){const sorted=[...xs].sort((a,b)=>a-b);if(!sorted.length)return NaN;const p=(sorted.length-1)*q;const lo=Math.floor(p),hi=Math.ceil(p);return sorted[lo]+(sorted[hi]-sorted[lo])*(p-lo);}
function bootstrapMeanCI(values:number[],seed:number,resamples=1000){const draw=rng(seed),means:number[]=[];for(let b=0;b<resamples;b++){let sum=0;for(let i=0;i<values.length;i++)sum+=values[Math.floor(draw()*values.length)];means.push(sum/values.length);}return {low:quantile(means,.025),high:quantile(means,.975)};}
export function runStressSuite(seeds:number[],spread=.5,hedged=true,adverseAware=true,cases=stressCases){return cases.map((scenario,index)=>{const summary=summarizeBacktest(seeds,spread,hedged,adverseAware,scenario.overrides);const pnl=summary.rows.map(row=>row.netPnl);return {name:scenario.name,description:scenario.description,config:summary.config,seeds:summary.seeds,meanNetPnl:summary.meanNetPnl,meanNetPnlCI:bootstrapMeanCI(pnl,9001+index),medianNetPnl:quantile(pnl,.5),p05NetPnl:quantile(pnl,.05),worstNetPnl:summary.worstNetPnl,negativeSeedRate:pnl.filter(x=>x<0).length/pnl.length,meanMaxAbsDelta:summary.meanMaxAbsDelta,meanFillRate:summary.meanFillRate,reconciled:summary.reconciled};});}
