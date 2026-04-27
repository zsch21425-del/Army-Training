// CLI entry point: run the autonomous agent for N rounds and print results.
// Usage: node blackjack/simulate.js [rounds] [--verbose] [--wong] [--seed=123]

import { BlackjackAgent } from "./agent.js";

function parseArgs(argv) {
  const out = { rounds: 10000, verbose: false, wong: false, seed: null, flat: false };
  for (const a of argv.slice(2)) {
    if (a === "--verbose" || a === "-v") out.verbose = true;
    else if (a === "--wong") out.wong = true;
    else if (a === "--flat") out.flat = true;
    else if (a.startsWith("--seed=")) out.seed = Number(a.slice(7));
    else if (/^\d+$/.test(a)) out.rounds = Number(a);
  }
  return out;
}

// Tiny seeded RNG (mulberry32) for reproducible runs.
function makeRng(seed) {
  if (seed === null || seed === undefined) return Math.random;
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function fmtCards(cards) {
  return cards.join("") || "-";
}

const opts = parseArgs(process.argv);
const agent = new BlackjackAgent({
  bankroll: opts.flat ? 1_000_000 : 10_000,
  unit: 25,
  wongOut: opts.wong,
  flatBet: opts.flat,
  shoeOpts: { decks: 6, penetration: 0.75, rng: makeRng(opts.seed) },
});

const start = Date.now();
let playedRounds = 0;
for (let i = 0; i < opts.rounds; i++) {
  const r = agent.playRound();
  if (r?.broke) {
    console.log(`Busted at round ${i + 1} — bankroll $${agent.bankroll}`);
    break;
  }
  if (r?.skipped) continue;
  playedRounds++;
  if (opts.verbose) {
    const branchStr = r.branches
      .map((b) => fmtCards(b.cards) + (b.surrendered ? "*" : ""))
      .join(" | ");
    console.log(
      `#${String(playedRounds).padStart(5)} TC=${r.tc.toFixed(2).padStart(5)} ` +
        `bet=$${String(r.bet).padStart(4)} ` +
        `P:${branchStr.padEnd(18)} D:${fmtCards(r.dealer).padEnd(8)} ` +
        `pnl=${(r.pnl >= 0 ? "+" : "") + r.pnl.toFixed(2)} ` +
        `bank=$${r.bankroll.toFixed(0)}`
    );
  }
}
const elapsed = (Date.now() - start) / 1000;
const s = agent.summary();

const line = "-".repeat(52);
console.log("\n" + line);
console.log("Autonomous Blackjack Agent — Session Report");
console.log(line);
console.log(`Rounds played       : ${s.rounds}`);
console.log(`Elapsed             : ${elapsed.toFixed(2)}s  (${(s.rounds / elapsed).toFixed(0)} rounds/s)`);
console.log(`Starting bankroll   : $${s.startBankroll.toFixed(2)}`);
console.log(`Ending bankroll     : $${s.endBankroll.toFixed(2)}`);
console.log(`Peak / Trough       : $${s.peakBankroll.toFixed(2)} / $${s.troughBankroll.toFixed(2)}`);
console.log(`Total wagered       : $${s.wagered.toFixed(2)}`);
console.log(`Net P&L             : ${s.ev >= 0 ? "+" : ""}$${s.ev.toFixed(2)}`);
console.log(`Edge vs wagered     : ${s.edgePct.toFixed(3)}%`);
console.log(line);
console.log(`Wins / Losses / Push: ${s.won} / ${s.lost} / ${s.pushes}`);
console.log(`Blackjacks          : ${s.blackjacks}`);
console.log(`Doubles / Splits    : ${s.doubles} / ${s.splits}`);
console.log(`Surrenders          : ${s.surrenders}`);
console.log(`Insurance taken     : ${s.insuranceTaken}`);
console.log(line);
