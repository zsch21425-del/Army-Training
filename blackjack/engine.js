// Core blackjack engine: shoe, hand math, dealer play.
// Rules: 6 decks, S17, DAS, LS, BJ 3:2, dealer peeks, split aces get one card,
// resplit to 4 hands (aces excluded from resplit).

export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

export const cardValue = (r) => (r === "A" ? 11 : "TJQK".includes(r) ? 10 : Number(r));

export const hiLoTag = (r) =>
  "23456".includes(r) ? 1 : "789".includes(r) ? 0 : -1;

export function buildShoe(decks = 6, rng = Math.random) {
  const shoe = [];
  for (let d = 0; d < decks; d++) {
    for (let s = 0; s < 4; s++) for (const r of RANKS) shoe.push(r);
  }
  // Fisher-Yates
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

export class Shoe {
  constructor({ decks = 6, penetration = 0.75, rng = Math.random } = {}) {
    this.decks = decks;
    this.penetration = penetration;
    this.rng = rng;
    this.cards = [];
    this.idx = 0;
    this.runningCount = 0;
    this.cutIndex = 0;
    this.shuffle();
  }

  shuffle() {
    this.cards = buildShoe(this.decks, this.rng);
    this.idx = 0;
    this.runningCount = 0;
    this.cutIndex = Math.floor(this.cards.length * this.penetration);
  }

  draw() {
    if (this.idx >= this.cards.length) this.shuffle();
    const c = this.cards[this.idx++];
    this.runningCount += hiLoTag(c);
    return c;
  }

  decksRemaining() {
    return Math.max(0.5, (this.cards.length - this.idx) / 52);
  }

  trueCount() {
    return this.runningCount / this.decksRemaining();
  }

  needsShuffle() {
    return this.idx >= this.cutIndex;
  }
}

// Hand totals: returns { total, soft }. A soft hand contains an ace counted as 11.
export function handTotal(cards) {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c);
    if (c === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 && total <= 21 };
}

export const isBust = (cards) => handTotal(cards).total > 21;
export const isBlackjack = (cards) =>
  cards.length === 2 && handTotal(cards).total === 21;
export const isPair = (cards) =>
  cards.length === 2 && cardValue(cards[0]) === cardValue(cards[1]);

// Dealer plays: S17 — stands on all 17s (including soft 17).
export function playDealer(dealerCards, shoe) {
  while (true) {
    const { total, soft } = handTotal(dealerCards);
    if (total < 17) dealerCards.push(shoe.draw());
    else if (total === 17 && soft && false) dealerCards.push(shoe.draw()); // H17 placeholder
    else break;
  }
  return dealerCards;
}
