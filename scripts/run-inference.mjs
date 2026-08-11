import { realityCheck } from "../lib/multipleTesting.ts";

const seeds=Array.from({length:100},(_,i)=>i+1);
console.log(JSON.stringify({generatedAt:"2026-08-11",synthetic:true,result:realityCheck(seeds)},null,2));
