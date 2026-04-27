// Autonomous agent: sizes bets from the true count and plays hands to completion
// using the strategy module. Produces a per-round settlement against the dealer.

import {
  Shoe,
  handTotal,
  isBlackjack,
  isBust,
  isPair,
  playDealer,
} from "./engine.js";
import { decide, betUnits, shouldTakeInsurance } from "./strategy.js";

export class BlackjackAgent {
  constructor({
    bankroll = 10000,
    unit = 25,
    shoeOpts = {},
    wongOut = false, // leave shoe when TC < 0
    flatBet = false, // disable bet ramp; always 1 unit
  } = {}) {
    this.startBankroll = bankroll;
    this.bankroll = bankroll;
    this.unit = unit;
    this.wongOut = wongOut;
    this.flatBet = flatBet;
    this.shoe = new Shoe(shoeOpts);
    this.stats = {
      hands: 0,
      rounds: 0,
      wagered: 0,
      won: 0,
      lost: 0,
      pushes: 0,
      blackjacks: 0,
      surrenders: 0,
      splits: 0,
      doubles: 0,
      insuranceTaken: 0,
      peakBankroll: bankroll,
      troughBankroll: bankroll,
    };
  }

  playRound() {
    if (this.shoe.needsShuffle()) this.shoe.shuffle();

    const tc = this.shoe.trueCount();
    if (this.wongOut && tc < 0) {
      // Burn cards one at a time until TC non-negative or shuffle.
      while (!this.shoe.needsShuffle() && this.shoe.trueCount() < 0) {
        this.shoe.draw();
      }
      return { skipped: true };
    }

    const bet = this.flatBet ? this.unit : this.unit * betUnits(tc);
    if (bet > this.bankroll) return { broke: true };

    // Deal: player, dealer, player, dealer. TC at decision time uses post-deal shoe.
    const player = [this.shoe.draw()];
    const dealer = [this.shoe.draw()];
    player.push(this.shoe.draw());
    const dealerHole = this.shoe.draw();

    const up = dealer[0];
    let insuranceResult = 0;

    // Insurance offered when dealer shows A.
    if (up === "A" && shouldTakeInsurance(this.shoe.trueCount())) {
      const insBet = bet / 2;
      this.stats.insuranceTaken++;
      if (cardTotalVal(dealerHole) === 10) {
        insuranceResult = insBet * 2; // pays 2:1, keep original
      } else {
        insuranceResult = -insBet;
      }
    }

    // Dealer peek for blackjack (A or 10 up).
    dealer.push(dealerHole);
    const dealerHasBJ = isBlackjack(dealer);
    const playerHasBJ = isBlackjack(player);

    if (dealerHasBJ || playerHasBJ) {
      let pnl = insuranceResult;
      if (playerHasBJ && dealerHasBJ) {
        this.stats.pushes++;
      } else if (playerHasBJ) {
        pnl += bet * 1.5;
        this.stats.blackjacks++;
        this.stats.won++;
      } else {
        pnl -= bet;
        this.stats.lost++;
      }
      const branches = [{ cards: player, bet }];
      this._settle(bet, pnl, branches);
      return this._roundResult(bet, pnl, player, dealer, branches);
    }

    // Play each split branch. Each branch carries its own bet (for doubles).
    const branches = this._playPlayerHands(player, up, bet);

    // Dealer plays only if at least one branch survived.
    const anyAlive = branches.some((b) => !isBust(b.cards) && !b.surrendered);
    if (anyAlive) playDealer(dealer, this.shoe);
    const dealerTotal = handTotal(dealer).total;
    const dealerBust = dealerTotal > 21;

    let pnl = insuranceResult;
    for (const b of branches) {
      if (b.surrendered) {
        pnl -= b.bet / 2;
        this.stats.surrenders++;
        this.stats.lost++;
        continue;
      }
      if (isBust(b.cards)) {
        pnl -= b.bet;
        this.stats.lost++;
        continue;
      }
      const pt = handTotal(b.cards).total;
      if (dealerBust || pt > dealerTotal) {
        pnl += b.bet;
        this.stats.won++;
      } else if (pt < dealerTotal) {
        pnl -= b.bet;
        this.stats.lost++;
      } else {
        this.stats.pushes++;
      }
    }

    this._settle(bet, pnl, branches);
    return this._roundResult(bet, pnl, player, dealer, branches);
  }

  _playPlayerHands(initialHand, up, bet) {
    // Queue of pending branches. Splits push new entries. Aces capped at one card.
    const pending = [{ cards: initialHand, bet }];
    const commonBet = bet;
    const finished = [];
    let splitCount = 0;
    const MAX_SPLITS = 3; // yields up to 4 hands

    while (pending.length) {
      const hand = pending.shift();
      const isSplitAces = hand.splitAce === true;

      if (isSplitAces) {
        // Split aces: one card only, no further action.
        if (hand.cards.length < 2) hand.cards.push(this.shoe.draw());
        finished.push(hand);
        continue;
      }

      let acted = true;
      while (acted) {
        acted = false;
        const firstDecision = hand.cards.length === 2 && !hand.wasSplit;
        const canDouble = hand.cards.length === 2;
        const canSplit =
          isPair(hand.cards) && splitCount < MAX_SPLITS && this.bankroll >= hand.bet;
        const canSurrender = firstDecision && !hand.wasSplit;

        const action = decide(hand.cards, up, this.shoe.trueCount(), {
          canDouble,
          canSplit,
          canSurrender,
        });

        if (action === "R") {
          hand.surrendered = true;
          break;
        }
        if (action === "P" && canSplit) {
          this.stats.splits++;
          splitCount++;
          const [c1, c2] = hand.cards;
          const splittingAces = c1 === "A";
          const a = { cards: [c1], bet: commonBet, wasSplit: true, splitAce: splittingAces };
          const b = { cards: [c2], bet: commonBet, wasSplit: true, splitAce: splittingAces };
          if (!splittingAces) {
            a.cards.push(this.shoe.draw());
            b.cards.push(this.shoe.draw());
          }
          pending.unshift(b);
          pending.unshift(a);
          acted = false; // drop this hand; branches will be processed
          hand.replaced = true;
          break;
        }
        if (action === "D" && canDouble) {
          this.stats.doubles++;
          hand.bet *= 2;
          hand.cards.push(this.shoe.draw());
          break;
        }
        if (action === "H") {
          hand.cards.push(this.shoe.draw());
          if (isBust(hand.cards) || handTotal(hand.cards).total === 21) break;
          acted = true;
          continue;
        }
        // Stand (or fallback)
        break;
      }

      if (!hand.replaced) finished.push(hand);
    }

    return finished;
  }

  _settle(bet, pnl, branches) {
    this.bankroll += pnl;
    this.stats.rounds++;
    this.stats.hands++;
    // Track total action (post-double / post-split) as wagered, falling back
    // to the initial bet when the round was a blackjack / dealer-BJ short-circuit.
    const action = branches
      ? branches.reduce((s, b) => s + b.bet, 0)
      : bet;
    this.stats.wagered += action;
    if (this.bankroll > this.stats.peakBankroll) this.stats.peakBankroll = this.bankroll;
    if (this.bankroll < this.stats.troughBankroll) this.stats.troughBankroll = this.bankroll;
  }

  _roundResult(bet, pnl, player, dealer, branches) {
    return {
      bet,
      pnl,
      player,
      dealer,
      branches: branches.map((b) => ({ ...b, cards: [...b.cards] })),
      bankroll: this.bankroll,
      tc: this.shoe.trueCount(),
      rc: this.shoe.runningCount,
    };
  }

  summary() {
    const { stats } = this;
    const ev = this.bankroll - this.startBankroll;
    const edge = stats.wagered ? (ev / stats.wagered) * 100 : 0;
    return {
      ...stats,
      startBankroll: this.startBankroll,
      endBankroll: this.bankroll,
      ev,
      edgePct: edge,
    };
  }
}

function cardTotalVal(r) {
  return r === "A" ? 11 : "TJQK".includes(r) ? 10 : Number(r);
}
