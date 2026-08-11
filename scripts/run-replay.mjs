import { replaySession } from "../lib/replay.ts";

const session = replaySession(42, 20);
console.log(JSON.stringify({
  seed: session.seed,
  decisionCount: session.decisions.length,
  cumulativeRegret: session.cumulativeRegret,
  luckFavored: session.luckFavored,
  luckHurt: session.luckHurt,
  selectedFills: session.decisions.reduce((n, d) => n + (d.alternatives.find((a) => a.action.name === "BASE")?.filled ?? 0), 0),
  bestActionCounts: session.decisions.reduce((counts, d) => {
    const best = d.alternatives.find((a) => a.utility === d.bestUtility)?.action.name ?? "UNKNOWN";
    counts[best] = (counts[best] ?? 0) + 1;
    return counts;
  }, {})
}, null, 2));
