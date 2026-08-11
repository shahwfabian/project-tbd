export type Regime = "UNINFORMED" | "INFORMED_BUY" | "INFORMED_SELL";
export type DecisionEvidence = { side: "BUY" | "SELL"; imbalance: number; volatilityChange: number };
export type Posterior = Record<Regime, number>;
const regimes:Regime[]=["UNINFORMED","INFORMED_BUY","INFORMED_SELL"];
const clamp=(x:number,min=-1,max=1)=>Math.max(min,Math.min(max,x));
const gaussian=(x:number,mean:number,sd:number)=>Math.exp(-0.5*((x-mean)/sd)**2)/(sd*Math.sqrt(2*Math.PI));

export class BayesianRegimeFilter {
  posterior:Posterior={UNINFORMED:.8,INFORMED_BUY:.1,INFORMED_SELL:.1};
  readonly history:Array<{e:DecisionEvidence;posterior:Posterior}> = [];
  update(e:DecisionEvidence) { const side=e.side, imbalance=clamp(e.imbalance), vol=Math.max(-1,Math.min(1,e.volatilityChange)); const likelihood:Record<Regime,number>={UNINFORMED:.5*gaussian(imbalance,0,.7)*gaussian(vol,0,.5),INFORMED_BUY:(side==="BUY"?.82:.09)*gaussian(imbalance,.35,.45)*gaussian(vol,.15,.4),INFORMED_SELL:(side==="SELL"?.82:.09)*gaussian(imbalance,-.35,.45)*gaussian(vol,.15,.4)}; const evidence=regimes.reduce((sum,r)=>sum+this.posterior[r]*likelihood[r],0); const next={...this.posterior} as Posterior; regimes.forEach(r=>next[r]=this.posterior[r]*likelihood[r]/Math.max(evidence,Number.EPSILON)); this.posterior=next; this.history.push({e,posterior:{...next}}); return this.posterior; }
  adverseProbability(){return this.posterior.INFORMED_BUY+this.posterior.INFORMED_SELL;}
  quoteMultiplier(){return 1+2*this.adverseProbability();}
}

export function signedMarkout(flowSide:"BUY"|"SELL", fillPrice:number, laterMid:number) { return flowSide==="BUY"?laterMid-fillPrice:fillPrice-laterMid; }
