// Live-play brain: takes a snapshot of current game state and returns the
// next action for the site driver to execute. Reuses strategy + Hi-Lo count.
//
// Unlike simulator.js, this agent does not own the shoe — the site does.
// It just tracks the running count from observed cards and applies strategy.

import { decide, betUnits, shouldTakeInsurance } from "./strategy.js";
import { hiLoTag, handTotal, isPair } from "./engine.js";

export class LiveAgent {
  constructor({ bankroll = 10000, unit = 25, mode = "spread" } = {}) {
    this.startBankroll = bankroll;
    this.bankroll = bankroll;
    this.unit = unit;
    this.mode = mode;
    this.runningCount = 0;
    this.seen = new Set(); // seen-card ids to avoid double-counting
    this.decksApprox = 6;
    this.cardsSeen = 0;
    this.stats = {
      rounds: 0,
      won: 0,
      lost: 0,
      pushes: 0,
      blackjacks: 0,
      surrenders: 0,
      splits: 0,
      doubles: 0,
    };
  }

  // Record every newly seen card (each id must be stable within a round).
  observeCards(cardIds /* [{id, rank}] */) {
    for (const c of cardIds) {
      if (!c || !c.rank) continue;
      if (this.seen.has(c.id)) continue;
      this.seen.add(c.id);
      this.runningCount += hiLoTag(normalizeRank(c.rank));
      this.cardsSeen++;
    }
  }

  onShuffle() {
    this.runningCount = 0;
    this.cardsSeen = 0;
    this.seen.clear();
  }

  decksRemaining() {
    const totalCards = this.decksApprox * 52;
    return Math.max(0.5, (totalCards - this.cardsSeen) / 52);
  }

  trueCount() {
    return this.runningCount / this.decksRemaining();
  }

  betForNextRound() {
    if (this.mode === "flat") return this.unit;
    return this.unit * betUnits(this.trueCount());
  }

  shouldSitOut() {
    return this.mode === "wong" && this.trueCount() < 0;
  }

  // state = { playerCards: ['A','7'], dealerUp: '9', canDouble, canSplit, canSurrender }
  decideAction(state) {
    const player = state.playerCards.map(normalizeRank);
    const up = normalizeRank(state.dealerUp);
    const action = decide(player, up, this.trueCount(), {
      canDouble: !!state.canDouble,
      canSplit: !!state.canSplit && isPair(player),
      canSurrender: !!state.canSurrender,
    });
    return action; // "H" | "S" | "D" | "P" | "R"
  }

  decideInsurance() {
    return shouldTakeInsurance(this.trueCount());
  }

  // Apply a round settlement reported by the driver.
  settleRound({ net, outcome, bet }) {
    this.bankroll += net;
    this.stats.rounds++;
    if (outcome === "win") this.stats.won++;
    else if (outcome === "loss") this.stats.lost++;
    else if (outcome === "push") this.stats.pushes++;
    else if (outcome === "blackjack") { this.stats.won++; this.stats.blackjacks++; }
    else if (outcome === "surrender") { this.stats.lost++; this.stats.surrenders++; }
  }

  snapshot() {
    return {
      startBankroll: this.startBankroll,
      bankroll: this.bankroll,
      rc: this.runningCount,
      tc: this.trueCount(),
      ...this.stats,
    };
  }

  handTotal(cards) {
    return handTotal(cards.map(normalizeRank));
  }
}

// Normalize site-specific rank strings to strategy ranks: 2-9, T, A.
// Any 10-value card (10, J, Q, K, Jack, Queen, King) collapses to "T".
function normalizeRank(r) {
  if (r === undefined || r === null) return r;
  const s = String(r).toUpperCase().trim();
  if (s === "10" || s === "T" || s === "J" || s === "Q" || s === "K" ||
      s === "JACK" || s === "QUEEN" || s === "KING") return "T";
  if (s === "ACE" || s === "A") return "A";
  return s; // "2".."9"
}
