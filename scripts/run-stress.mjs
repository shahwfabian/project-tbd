import { runStressSuite } from "../lib/stress.ts";

const seeds=Array.from({length:100},(_,i)=>i+1);
const result={generatedAt:"2026-08-11",synthetic:true,policy:{spread:.5,hedged:true,adverseAware:true},stress:runStressSuite(seeds)};
console.log(JSON.stringify(result,null,2));
