// Strategy decisions: 6-deck S17 DAS LS basic strategy with
// Hi-Lo Illustrious 18 and Fab 4 count deviations.
//
// Actions: "H" hit, "S" stand, "D" double, "P" split, "R" surrender.
// The caller tells us which actions are legal (first two cards, DAS, etc.)
// and we fall back sensibly if a chart cell is unavailable.

import { cardValue, handTotal, isPair } from "./engine.js";

const upIdx = (up) => {
  const v = cardValue(up);
  return v === 11 ? 9 : v - 2; // columns 0..9 for upcards 2..A
};

// --- Basic strategy tables (10 upcard columns: 2,3,4,5,6,7,8,9,T,A) ---

// Hard totals 5..21
const HARD = {
  5:  ["H","H","H","H","H","H","H","H","H","H"],
  6:  ["H","H","H","H","H","H","H","H","H","H"],
  7:  ["H","H","H","H","H","H","H","H","H","H"],
  8:  ["H","H","H","H","H","H","H","H","H","H"],
  9:  ["H","D","D","D","D","H","H","H","H","H"],
  10: ["D","D","D","D","D","D","D","D","H","H"],
  11: ["D","D","D","D","D","D","D","D","D","H"],
  12: ["H","H","S","S","S","H","H","H","H","H"],
  13: ["S","S","S","S","S","H","H","H","H","H"],
  14: ["S","S","S","S","S","H","H","H","H","H"],
  15: ["S","S","S","S","S","H","H","H","R","H"],
  16: ["S","S","S","S","S","H","H","R","R","R"],
  17: ["S","S","S","S","S","S","S","S","S","S"],
  18: ["S","S","S","S","S","S","S","S","S","S"],
  19: ["S","S","S","S","S","S","S","S","S","S"],
  20: ["S","S","S","S","S","S","S","S","S","S"],
  21: ["S","S","S","S","S","S","S","S","S","S"],
};

// Soft totals — by non-ace component 2..9 (A,2 .. A,9).
// "Ds" means double else stand; we expand that in the decider.
const SOFT = {
  2: ["H","H","H","D","D","H","H","H","H","H"],   // A,2 = 13
  3: ["H","H","H","D","D","H","H","H","H","H"],   // A,3 = 14
  4: ["H","H","D","D","D","H","H","H","H","H"],   // A,4 = 15
  5: ["H","H","D","D","D","H","H","H","H","H"],   // A,5 = 16
  6: ["H","D","D","D","D","H","H","H","H","H"],   // A,6 = 17
  7: ["S","Ds","Ds","Ds","Ds","S","S","H","H","H"], // A,7 = 18
  8: ["S","S","S","S","S","S","S","S","S","S"],   // A,8 = 19
  9: ["S","S","S","S","S","S","S","S","S","S"],   // A,9 = 20
};

// Pairs (DAS on). Column layout same as above.
const PAIR = {
  2:  ["P","P","P","P","P","P","H","H","H","H"],
  3:  ["P","P","P","P","P","P","H","H","H","H"],
  4:  ["H","H","H","P","P","H","H","H","H","H"],
  5:  ["D","D","D","D","D","D","D","D","H","H"], // treat as 10
  6:  ["P","P","P","P","P","H","H","H","H","H"],
  7:  ["P","P","P","P","P","P","H","H","H","H"],
  8:  ["P","P","P","P","P","P","P","P","P","P"],
  9:  ["P","P","P","P","P","S","P","P","S","S"],
  10: ["S","S","S","S","S","S","S","S","S","S"],
  A:  ["P","P","P","P","P","P","P","P","P","P"],
};

// --- Illustrious 18 + Fab 4 deviations keyed by "total|up" or "pair|up" ---
// Each entry: either { upAt: tc, action } to deviate when TC >= tc,
// or { downAt: tc, action } to deviate when TC <= tc.

const I18 = {
  // Stand vs 10/9 at low counts (overrides default surrender cells too).
  "h16|T": { upAt: 0, action: "S" },
  "h15|T": { upAt: 4, action: "S" },
  "h16|9": { upAt: 5, action: "S" },
  // Split tens at high count
  "p10|5": { upAt: 5, action: "P" },
  "p10|6": { upAt: 4, action: "P" },
  // Doubles vs high cards
  "h10|T": { upAt: 4, action: "D" },
  "h12|3": { upAt: 2, action: "S" },
  "h12|2": { upAt: 3, action: "S" },
  "h11|A": { upAt: 1, action: "D" },
  "h9|2":  { upAt: 1, action: "D" },
  "h10|A": { upAt: 4, action: "D" },
  "h9|7":  { upAt: 3, action: "D" },
  // Negative deviations (hit at or below threshold)
  "h13|2": { downAt: -1, action: "H" },
  "h12|4": { downAt: 0,  action: "H" },
  "h12|5": { downAt: -2, action: "H" },
  "h12|6": { downAt: -1, action: "H" },
  "h13|3": { downAt: -2, action: "H" },
};

const FAB4 = {
  "h14|T": { upAt: 3, action: "R" },
  "h15|9": { upAt: 2, action: "R" },
  "h15|A": { upAt: 1, action: "R" },
  // 15 vs 10: surrender is the default in LS. Undo below 0.
  "h15|T|undo": { downAt: -1, action: "H" },
};

// Insurance: TC >= +3.
export function shouldTakeInsurance(trueCount) {
  return trueCount >= 3;
}

// Main decision. `legal` lists which moves are allowed:
//   { canDouble, canSplit, canSurrender }
// Returns one of "H","S","D","P","R".
export function decide(playerCards, dealerUp, trueCount, legal = {}) {
  const { canDouble = false, canSplit = false, canSurrender = false } = legal;
  const col = upIdx(dealerUp);
  const upKey = cardValue(dealerUp) === 11 ? "A" : cardValue(dealerUp) === 10 ? "T" : String(cardValue(dealerUp));

  // --- 1. Pair split check ---
  if (canSplit && isPair(playerCards)) {
    const rank = playerCards[0];
    const key = rank === "A" ? "A" : String(cardValue(rank));
    const devKey = `p${key}|${upKey}`;
    if (I18[devKey]) {
      const d = I18[devKey];
      if (d.upAt !== undefined && trueCount >= d.upAt) return d.action;
      if (d.downAt !== undefined && trueCount <= d.downAt) return d.action;
    }
    const chart = PAIR[key === "T" ? 10 : key];
    if (chart) {
      const play = chart[col];
      if (play === "P") return "P";
      // fall through: pair chart might say "D" (5s) or "S" (10s, 9s) — honor it
      if (play === "D") return canDouble ? "D" : "H";
      if (play === "S") return "S";
      if (play === "H") {
        // not splitting, treat as total and continue below
      }
    }
  }

  const { total, soft } = handTotal(playerCards);

  // --- 2. Surrender checks (first two cards only) ---
  if (canSurrender && playerCards.length === 2 && !soft) {
    const fabKey = `h${total}|${upKey}`;
    if (FAB4[fabKey]) {
      const d = FAB4[fabKey];
      if (d.upAt !== undefined && trueCount >= d.upAt) return d.action;
    }
  }

  // --- 3. Hard vs soft chart lookup with deviations ---
  if (soft) {
    // Soft totals: A,2..A,9. For 3+ cards we still use the chart logic but disallow D.
    const other = total - 11;
    if (other >= 2 && other <= 9) {
      const cell = SOFT[other][col];
      return expandSoft(cell, canDouble);
    }
  }

  // Hard total
  const cappedTotal = Math.max(5, Math.min(21, total));
  // I18 hard deviations
  const devKey = `h${cappedTotal}|${upKey}`;
  if (I18[devKey]) {
    const d = I18[devKey];
    if (d.upAt !== undefined && trueCount >= d.upAt) {
      return normalizeAction(d.action, canDouble, canSurrender, canSplit);
    }
    if (d.downAt !== undefined && trueCount <= d.downAt) {
      return normalizeAction(d.action, canDouble, canSurrender, canSplit);
    }
  }
  // Fab 4 "undo" for 15 vs 10 in very negative counts
  if (FAB4[`${devKey}|undo`]) {
    const d = FAB4[`${devKey}|undo`];
    if (d.downAt !== undefined && trueCount <= d.downAt) return d.action;
  }

  const cell = HARD[cappedTotal][col];
  return normalizeAction(cell, canDouble, canSurrender, canSplit);
}

function expandSoft(cell, canDouble) {
  if (cell === "Ds") return canDouble ? "D" : "S";
  if (cell === "D") return canDouble ? "D" : "H";
  return cell;
}

function normalizeAction(cell, canDouble, canSurrender, canSplit) {
  if (cell === "D") return canDouble ? "D" : "H";
  if (cell === "R") return canSurrender ? "R" : "H";
  if (cell === "P") return canSplit ? "P" : "H";
  return cell;
}

// Bet sizing: 1-to-12 half-Kelly ramp on true count, floored at 1 unit.
export function betUnits(trueCount) {
  const tc = Math.floor(trueCount);
  if (tc <= 1) return 1;
  if (tc === 2) return 2;
  if (tc === 3) return 4;
  if (tc === 4) return 8;
  return 12;
}
