export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
export type Verdict = "PASS" | "PASS WITH WARNINGS" | "INSUFFICIENT EVIDENCE" | "FAIL";
export type ExperimentEvidence = {
  hypothesisWritten:boolean; decisionTimeOnly:boolean; impossibleFills:number; missingCostModel:boolean;
  reconciled:boolean; seeds:number; validationUntouched:boolean; finalTestUntouched:boolean;
  parameterVariants:number; stressedScenarios:number; totalScenarios:number; worstNetPnl:number;
};
export type Finding = {id:string; severity:Severity; title:string; evidence:string; remediation:string};
export type TribunalResult = {verdict:Verdict; findings:Finding[]; score:number};

const finding=(id:string,severity:Severity,title:string,evidence:string,remediation:string):Finding=>({id,severity,title,evidence,remediation});

export function auditExperiment(e:ExperimentEvidence):TribunalResult {
  const findings:Finding[]=[];
  if(!e.hypothesisWritten) findings.push(finding("HYPOTHESIS-001","HIGH","Hypothesis was not preregistered","hypothesisWritten=false","Write the economic mechanism and falsification condition before inspecting results."));
  if(!e.decisionTimeOnly) findings.push(finding("LEAKAGE-001","CRITICAL","Decision-time information is contaminated","decisionTimeOnly=false","Remove post-decision fields from features and add a leakage fixture to CI."));
  if(e.impossibleFills>0) findings.push(finding("EXECUTION-001","CRITICAL","Impossible fills detected",`${e.impossibleFills} fills violated arrival, price, or queue constraints`,"Fail the experiment and repair the execution model before interpreting P&L."));
  if(e.missingCostModel) findings.push(finding("COST-001","HIGH","Costs are incomplete","missingCostModel=true","Include fees, spread capture, hedge costs, and slippage in net P&L."));
  if(!e.reconciled) findings.push(finding("ACCOUNTING-001","CRITICAL","Cash and inventory do not reconcile","reconciled=false","Reconcile every fill, fee, hedge, and final mark before reporting performance."));
  if(!e.validationUntouched||!e.finalTestUntouched) findings.push(finding("SPLIT-001","HIGH","Validation or final test was not untouched",`validationUntouched=${e.validationUntouched}; finalTestUntouched=${e.finalTestUntouched}`,"Freeze validation and final-test windows before model selection."));
  if(e.seeds<30) findings.push(finding("STATS-001","MEDIUM","Too few independent seeds",`seeds=${e.seeds}`,"Increase the seed count and report uncertainty around the aggregate result."));
  if(e.parameterVariants>20) findings.push(finding("STATS-002","MEDIUM","Multiple-testing exposure is high",`parameterVariants=${e.parameterVariants}`,"Disclose the search space and use an untouched final test or correction."));
  if(e.stressedScenarios<e.totalScenarios) findings.push(finding("ROBUST-001","MEDIUM","Stress coverage is incomplete",`${e.stressedScenarios}/${e.totalScenarios} scenarios are stressed`,"Add volatility, liquidity, latency, and informed-flow stress families."));
  if(e.worstNetPnl<0) findings.push(finding("RISK-001","INFO","At least one scenario loses money",`worstNetPnl=${e.worstNetPnl.toFixed(2)}`,"Retain the tail result and explain which risk mechanism caused it; do not hide it behind the mean."));
  const critical=findings.filter(f=>f.severity==="CRITICAL").length, high=findings.filter(f=>f.severity==="HIGH").length;
  const verdict:Verdict=critical>0?"FAIL":high>0||findings.some(f=>f.severity==="MEDIUM")?"PASS WITH WARNINGS":findings.length?"PASS WITH WARNINGS":"PASS";
  return {verdict,findings,score:Math.max(0,100-critical*40-high*20-findings.filter(f=>f.severity==="MEDIUM").length*8)};
}

export const tribunalFixtures={
  clean:{hypothesisWritten:true,decisionTimeOnly:true,impossibleFills:0,missingCostModel:false,reconciled:true,seeds:100,validationUntouched:true,finalTestUntouched:true,parameterVariants:3,stressedScenarios:4,totalScenarios:4,worstNetPnl:-6149.14},
  leaked:{hypothesisWritten:true,decisionTimeOnly:false,impossibleFills:0,missingCostModel:false,reconciled:true,seeds:100,validationUntouched:false,finalTestUntouched:false,parameterVariants:3,stressedScenarios:1,totalScenarios:4,worstNetPnl:100},
  impossibleFills:{hypothesisWritten:true,decisionTimeOnly:true,impossibleFills:4,missingCostModel:false,reconciled:false,seeds:100,validationUntouched:true,finalTestUntouched:true,parameterVariants:3,stressedScenarios:4,totalScenarios:4,worstNetPnl:100}
} satisfies Record<string,ExperimentEvidence>;
