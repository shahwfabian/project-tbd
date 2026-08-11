import { gbmPath } from "./quant.ts";

export type ReplayAction = { name:string; bidDistance:number; askDistance:number; size:number };
export type DecisionInformation = { time:number; mid:number; inventory:number; baseSpread:number; volatility:number; posteriorAdverse:number };
export type ScenarioOutcome = { flowSide:"BUY"|"SELL"|"NONE"; arrivalUniform:number; nextMid:number; feePerContract:number; multiplier:number };
export type Counterfactual = { action:ReplayAction; feasible:boolean; filled:number; executionPrice:number|null; utility:number; realizedPnl:number };
export type ReplayDecision = { information:DecisionInformation; selected:ReplayAction; outcome:ScenarioOutcome; alternatives:Counterfactual[]; selectedUtility:number; bestUtility:number; regret:number; expectedSelectedUtility:number; luckContribution:number; luckLabel:"LUCK_FAVORED"|"LUCK_HURT"|"MIXED" };

const defaultActions=(spread:number):ReplayAction[]=>[
  {name:"PASS",bidDistance:Infinity,askDistance:Infinity,size:0},
  {name:"TIGHT",bidDistance:spread*.6,askDistance:spread*.6,size:1},
  {name:"BASE",bidDistance:spread,askDistance:spread,size:1},
  {name:"WIDE",bidDistance:spread*1.8,askDistance:spread*1.8,size:1},
];
const hitProbability=(distance:number)=>Number.isFinite(distance)?Math.exp(-3*distance):0;
const actionExpectedUtility=(action:ReplayAction, info:DecisionInformation, outcome:ScenarioOutcome, riskAversion=.02)=>{
  if(action.size===0 || outcome.flowSide==="NONE") return -riskAversion*info.inventory*info.inventory;
  const distance=outcome.flowSide==="BUY"?action.askDistance:action.bidDistance;
  const fillProbability=hitProbability(distance), side=outcome.flowSide==="BUY"?-1:1;
  const price=info.mid+side*distance;
  const expectedFill=fillProbability*action.size;
  return expectedFill*(distance*outcome.multiplier-outcome.feePerContract)-riskAversion*(info.inventory+side*expectedFill)**2;
};

export function evaluateAction(action:ReplayAction, info:DecisionInformation, outcome:ScenarioOutcome, positionLimit=20, riskAversion=.02):Counterfactual {
  const side=outcome.flowSide==="BUY"?-1:1; const distance=outcome.flowSide==="BUY"?action.askDistance:action.bidDistance; const feasible=action.size===0 || (Number.isFinite(action.size)&&action.size>0&&info.inventory+action.size<=positionLimit&&info.inventory-action.size>=-positionLimit); const filled=feasible&&outcome.flowSide!=="NONE"&&outcome.arrivalUniform<hitProbability(distance)?action.size:0; const executionPrice=filled?info.mid+side*distance:null; const realizedPnl=filled?side*(outcome.nextMid-(executionPrice as number))*filled*outcome.multiplier-filled*outcome.feePerContract:0; const utility=feasible?realizedPnl-riskAversion*(info.inventory+side*filled)**2:-Infinity; return {action,feasible,filled,executionPrice,utility,realizedPnl};
}

export function auditDecision(info:DecisionInformation, outcome:ScenarioOutcome, selectedName="BASE", actions=defaultActions(info.baseSpread), positionLimit=20, riskAversion=.02):ReplayDecision {
  const alternatives=actions.map(action=>evaluateAction(action,info,outcome,positionLimit,riskAversion)); const selected=actions.find(a=>a.name===selectedName)??actions[0]; const selectedResult=alternatives.find(x=>x.action.name===selected.name)??alternatives[0]; const feasible=alternatives.filter(x=>x.feasible); const best=feasible.reduce((a,b)=>a.utility>=b.utility?a:b,feasible[0]); const expectedSelectedUtility=actionExpectedUtility(selected,info,outcome,riskAversion); const luckContribution=selectedResult.utility-expectedSelectedUtility; return {information:info,selected,outcome,alternatives,selectedUtility:selectedResult.utility,bestUtility:best.utility,regret:Math.max(0,best.utility-selectedResult.utility),expectedSelectedUtility,luckContribution,luckLabel:luckContribution>0.01?"LUCK_FAVORED":luckContribution<-0.01?"LUCK_HURT":"MIXED"};
}

function random(seed:number){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
export function replaySession(seed:number, decisions=20, baseSpread=.5) { const path=gbmPath({spot:100,strike:100,maturity:1,vol:.2,rate:.05,dividend:0,paths:10000,seed},"Q",decisions); const flow=random(seed+101); let inventory=0; const events:ReplayDecision[]=[]; for(let time=0;time<decisions;time++){const mid=path[time],attempt=flow(),flowSide=attempt<Math.exp(-3*baseSpread)?(flow()<.5?"BUY":"SELL"):"NONE"; const outcome:ScenarioOutcome={flowSide,arrivalUniform:flow(),nextMid:path[time+1],feePerContract:.25,multiplier:100}; const info:DecisionInformation={time,mid,inventory,baseSpread,volatility:.2,posteriorAdverse:.2}; const event=auditDecision(info,outcome,"BASE"); events.push(event); const filled=event.alternatives.find(x=>x.action.name==="BASE")?.filled??0; inventory+=(flowSide==="BUY"?-filled:flowSide==="SELL"?filled:0); }
  return {seed,decisions:events,cumulativeRegret:events.reduce((sum,e)=>sum+e.regret,0),luckFavored:events.filter(e=>e.luckLabel==="LUCK_FAVORED").length,luckHurt:events.filter(e=>e.luckLabel==="LUCK_HURT").length}; }
