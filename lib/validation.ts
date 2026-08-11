import { summarizeBacktest, type BacktestConfig } from "./backtest.ts";

export type PolicyCandidate={name:string;spread:number;hedged:boolean;adverseAware:boolean;overrides?:Partial<BacktestConfig>};
export const policyCandidates:PolicyCandidate[]=[
  {name:"UNHEDGED BASE",spread:.5,hedged:false,adverseAware:false},
  {name:"DELTA HEDGED",spread:.5,hedged:true,adverseAware:false},
  {name:"HEDGED + ADVERSE AWARE",spread:.5,hedged:true,adverseAware:true}
];
export type SplitResult={name:string;seeds:number;meanNetPnl:number;p05NetPnl:number;worstNetPnl:number;negativeSeedRate:number;meanMaxAbsDelta:number;reconciled:boolean};
export type ValidationResult={trainSeeds:number[];validationSeeds:number[];finalSeeds:number[];candidates:PolicyCandidate[];selected:PolicyCandidate;selectionMetric:string;train:SplitResult[];validation:SplitResult[];final:SplitResult[];validationUntouched:boolean;finalUntouched:boolean};
const quantile=(xs:number[],q:number)=>{const a=[...xs].sort((x,y)=>x-y);const p=(a.length-1)*q,l=Math.floor(p),h=Math.ceil(p);return a[l]+(a[h]-a[l])*(p-l);};
function evaluate(policy:PolicyCandidate,seeds:number[]):SplitResult{const s=summarizeBacktest(seeds,policy.spread,policy.hedged,policy.adverseAware,policy.overrides);const pnl=s.rows.map(r=>r.netPnl);return {name:policy.name,seeds:seeds.length,meanNetPnl:s.meanNetPnl,p05NetPnl:quantile(pnl,.05),worstNetPnl:s.worstNetPnl,negativeSeedRate:pnl.filter(x=>x<0).length/pnl.length,meanMaxAbsDelta:s.meanMaxAbsDelta,reconciled:s.reconciled};}
// Selection uses train only and penalizes the left tail; validation/final are never read here.
const selectionScore=(r:SplitResult)=>r.meanNetPnl+0.25*r.p05NetPnl;
export function runUntouchedValidationProtocol(allSeeds:number[]=Array.from({length:100},(_,i)=>i+1),candidates=policyCandidates):ValidationResult{
  if(allSeeds.length<10)throw new RangeError("Validation protocol requires at least 10 seeds");
  const trainSeeds=allSeeds.slice(0,Math.floor(allSeeds.length*.6));
  const validationSeeds=allSeeds.slice(trainSeeds.length,trainSeeds.length+Math.floor(allSeeds.length*.2));
  const finalSeeds=allSeeds.slice(trainSeeds.length+validationSeeds.length);
  const train=candidates.map(p=>evaluate(p,trainSeeds));
  const selected=candidates[train.reduce((best,row,index)=>selectionScore(row)>selectionScore(train[best])?index:best,0)];
  return {trainSeeds,validationSeeds,finalSeeds,candidates,selected,selectionMetric:"meanNetPnl + 0.25 × P05NetPnl",train,validation:[evaluate(selected,validationSeeds)],final:[evaluate(selected,finalSeeds)],validationUntouched:!validationSeeds.some(seed=>trainSeeds.includes(seed)),finalUntouched:!finalSeeds.some(seed=>trainSeeds.includes(seed)||validationSeeds.includes(seed))};
}
