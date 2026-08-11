import { summarizeBacktest } from "../lib/backtest.ts";

const seeds = Array.from({ length: 100 }, (_, index) => index + 1);
const results = [.25, .5, 1].map((spread) => summarizeBacktest(seeds, spread, false));
results.push(summarizeBacktest(seeds, .5, true));
results.push(summarizeBacktest(seeds, .5, true, true));
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), synthetic: true, seeds, results }, null, 2));
